# 51. Prototype: ResponsiveAccordionTabs as one component

Type: prototype
Status: resolved
Blocked by: 14, 38, 43
Labels: wayfinder:prototype
Map: ../map.md

## Question

Does a component that renders either the accordion or the tabs directive set from the same projected panels keep the selected panel and focus across a breakpoint swap, and hydrate cleanly when the server rendered the other mode than the client resolves? Build on the Aria Accordion and Tabs prototype's verdict.

Read first: `building-blocks.md` (the matrix row and the open risk this prototype settles), `adr/*.md`, `research/foundation-inventory-disclosure.md`, `research/angular-rendering-modes.md`, `research/angular-aria-inventory.md`.

## How to work it

Build the prototype per `/mattpocock-skills:prototype` at the high fidelity the map's AFK override allows: a synthetic Nx workspace under `D:/tmp/nfs-proto-responsive-accordion-tabs/` created with `npx create-nx-workspace@latest` at the map's target versions (Angular 22.2, Nx 23.2, TypeScript 6.0.x, Vitest 4.1.x) with `foundation-sites` 6.9 Sass, or a git worktree of this repo if that is faster. Never modify this repo's working tree outside the effort directory. Drive it in a real browser with `/playwright-cli`, across Chromium, Firefox, and WebKit whenever the question depends on the engine, and include a server-rendered run whenever the question touches first paint or hydration.

Capture it: copy the decisive files into `prototypes/responsive-accordion-tabs/` in the effort directory with a README that states the question, how to run it, and the verdict. The workspace under `D:/tmp/` may stay; record its path.

Under `## Answer`: the verdict in one paragraph, a results table (case, result, evidence), exact error text for failures, what the prototype does not prove, the decision it hands to the blocked spec tickets, and anything left `OPEN FOR HUMAN`.

## Answer

Prototype and README: [prototypes/responsive-accordion-tabs/README.md](../prototypes/responsive-accordion-tabs/README.md). Workspace: `D:/tmp/nfs-proto-responsive-accordion-tabs/app`.

How it was worked, and where it departs from "How to work it": a plain Angular CLI 22.2.0 application with `@angular/ssr`, `@angular/aria` 22.2.0, `@angular/cdk` 22.2.0 and `foundation-sites` 6.9.0, not an Nx workspace; none of the questions depends on Nx. The workspace was copied from the [Prototype: `@angular/aria` Accordion and Tabs under Foundation markup](43-prototype-aria-accordion-tabs.md) workspace (itself `ng new --ssr` at 22.2.0) and installed with `npm ci` from its lockfile, so no generator ran here and nothing had to be pinned back. It reuses that prototype's `nfsAccordion*` and `nfsTabs*` wrappers and its replay guard unchanged (only its `[trace]` logging was removed) and adds a minimal `NfsMediaQuery` that follows [specs/breakpoint-service.md](../specs/breakpoint-service.md): the px map token, the Server breakpoint written to and read from `TransferState` (`nfsServerBreakpoint`), the Server breakpoint on the client until the first `afterNextRender` `earlyRead` callback, then CDK `MediaMatcher` with Foundation's em queries. It was driven with `@playwright/test` 1.63.0 and `@axe-core/playwright` 4.13.0 in Chromium, Firefox and WebKit projects instead of `/playwright-cli`, because the cases need held network requests, a per-frame recorder and viewport changes. A production build served by its SSR server on port 4510: 54 tests pass (18 per engine); a development build: the 8 hydration tests per engine pass with `ngDevMode` statistics. Versions: `@angular/*` 22.2.0, TypeScript 6.0.3. Routes: `/` (`RenderMode.Server`), `/prerendered` (`RenderMode.Prerender`), `/client` (`RenderMode.Client`), `/deferred` (the widget in `@defer (hydrate on viewport)` below a 2000 px spacer, with the service already live from the page), and `/instance`, `/deferred-instance` (the same with the first-render strategy described below).

### Verdict

One component works. `nfs-responsive-accordion-tabs` with `rules="accordion medium-tabs"` renders either `ul.accordion > li.accordion-item > h3 > button.accordion-title` plus `[nfsAccordionContent]`, or `ul.tabs > li.tabs-title[role=presentation] > a[role=tab]` plus `.tabs-content > .tabs-panel`, from the same consumer `ng-template[nfsResponsiveAccordionTabsPanel]` panels (`title`, `value`), through `NgTemplateOutlet`. Because it owns its template, it writes the Aria `[panel]` references and the tab `value`s itself; the consumer writes neither. One `selected` model is shared by both modes: the selected tab or the expanded item survives a resize across `medium` in both directions, and focus moves to the equivalent control in the new mode (title to tab, tab to title, focus inside a panel to that panel's control), in all three engines; focus outside the widget is left alone; Aria's keys work on the new nodes at once. The swap is the one structural re-render ADR 0008 allows, not a class-and-role swap on the same nodes: each mode hosts a different set of Aria directives, and Angular matches directives to elements when the template is compiled, so the Accordion set cannot become the Tabs set on the same element; the panels also sit in different places (inside each `li` for the accordion, in the sibling `.tabs-content` for tabs, where Foundation's tabs CSS expects them), and WAI-ARIA 1.3 allows only `tab` children in a `tablist` (`d:/projects/github/w3c/aria/index.html`, tablist, "Allowed Accessibility Child Roles"), so accordion panels cannot stay inside `ul.tabs`. Hydration is clean when the server rendered the Server breakpoint's accordion and the client resolves tabs at 1300 px: `Angular hydrated 7 component(s) and 62 node(s), 0 component(s) were skipped.`, `componentsSkippedHydration === 0`, no NG05xx, no console errors, for SSR and prerendering. The swap happens 0 to 2 ms after the service goes live, in the same tick as hydration, and no animation frame after that moment shows the accordion (the server HTML's accordion is painted until JavaScript runs, which is the accepted shift). The prototype adds two things the specs do not yet say. First, the displayed mode must be a separate signal that follows the viewport's mode inside an `earlyRead` callback, because that is the only point where the old nodes, and so the focused element, still exist; the same code then handles a resize and the first-render swap. Second, focus before hydration is real: server-rendered accordion titles are focusable, and with this mechanism a title focused before hydration hands focus to the equivalent tab. The Breakpoint service spec's claim that nothing in the widget can hold focus before the first render callback is wrong for server-rendered pages. Inside `@defer (hydrate on viewport)` with the service already live, the component's first render resolves tabs, so the block's accordion branch is rebuilt at hydration (4 components hydrated instead of 7, 0 skipped, no error) and focus on a dehydrated title is lost; starting every instance from the Server breakpoint's mode (the `instance` strategy) hydrates the block as sent and swaps in its own first `earlyRead`, which keeps focus. What does not survive a swap: consumer state inside the panels (the panel templates are instantiated again, so an `<input>` value is reset), and a pre-hydration click or key on a title the first-render swap removes (the replay target is gone). Foundation's default palette fails WCAG 2.2 AA contrast in both modes (3.76:1); two Foundation settings fix it.

### Results

| # | Case | Result | Evidence |
| --- | --- | --- | --- |
| 1 | Server HTML at `/` and `/prerendered` | Accordion (the Server breakpoint `small`): `h3 > button.accordion-title` x3, no `role="tab"`, projected content present, collapsed panels `inert`, `"nfsServerBreakpoint":"small"` in `ng-state`; `ng-server-context` `ssr` and `ssg` | test "server output", 3 engines |
| 2 | Hydration at 1300 px, `/`, `/instance`, `/prerendered` | One swap `accordion->tabs` 0.0 to 2.0 ms after the service goes live; first frame after that shows tabs (31 to 59 ms later); accordion frames after going live: 0 | FINDING lines per engine in `results.log` |
| 3 | Hydration statistics (development build) | `Angular hydrated 7 component(s) and 62 node(s), 0 component(s) were skipped.`; `componentsSkippedHydration` 0; no NG05xx, no errors | `results.log` development section, 3 engines |
| 4 | Client-rendered route `/client` at 1300 px | First render uses the Server breakpoint (accordion), swaps in the same tick; accordion frames: 0, so the accordion is never painted | FINDING `/client`, 3 engines |
| 5 | Tabs mode ARIA and classes | `tablist` named "Product details", 3 `tab`s, `aria-selected` on the `a`, `li.tabs-title.is-active[role=presentation]`, one `.tabs-panel.is-active`, one visible `tabpanel` labelled by its tab, no `h3 > button` | `expectTabs` helper, every tabs assertion |
| 6 | Accordion mode ARIA and classes | `h3 > button.accordion-title` x3 with `aria-expanded`, `li.accordion-item.is-active` on the expanded item, `region` named by its title, no `tablist`/`tab` | `expectAccordion` helper |
| 7 | Resize tabs -> accordion with "Specs" selected and focused | Accordion with "Specs" expanded; focus on the "Specs" title | test "selected state and focus survive", 3 engines |
| 8 | Keys after the swap | ArrowDown moves to "Reviews", Enter expands it (`selected=reviews`) | same |
| 9 | Resize accordion -> tabs with "Reviews" expanded and focused | "Reviews" tab selected and focused; ArrowLeft selects and focuses "Specs"; roving `tabindex` `-1,0,-1` | same |
| 10 | Accordion with nothing expanded, "Reviews" title focused -> tabs | First tab ("Overview") shown, `selected` stays unset; focus on the "Reviews" tab | test "accordion with nothing expanded" |
| 11 | Tabs -> accordion with `selected` unset | The visible tab's item ("Overview") expands, as Foundation carries `.is-active` from the tab panel to its `li` | test "focus outside the widget" |
| 12 | Focus outside the widget during swaps | Not moved | same |
| 13 | Focus on a link inside the "Overview" panel, tabs -> accordion | Focus on the "Overview" title (the panel's control; the link itself is a new node) | test "focus inside panel content" |
| 14 | Text typed into an `<input>` in the "Specs" panel, accordion -> tabs | Lost: value `""` after the swap | same, FINDING |
| 15 | Focus on the server-rendered "Specs" title before hydration (main bundle held), 1300 px, `/` and `/instance` | After hydration focus is on the "Specs" tab; swap log `restore: "specs"` | test "focus before hydration", 3 engines |
| 16 | Pre-hydration click on "Specs" at 1300 px | Lost: tabs show "Overview", `selected` unset, no error (the replay target was removed by the swap) | FINDING, 3 engines |
| 17 | Pre-hydration click on "Specs" at 500 px (no swap, control) | Replayed: "Specs" expands | FINDING, 3 engines |
| 18 | Pre-hydration ArrowDown on the focused "Overview" title at 1300 px | Key lost; focus restored to the "Overview" tab; no replay error, because Aria never handled the key | FINDING, 3 engines |
| 19 | `@defer (hydrate on viewport)`, service already live (`/deferred`) | Block stays dehydrated accordion until scrolled into view, then shows tabs; no swap (first render already tabs); branch rebuilt at hydration: 4 components hydrated, 0 skipped, no errors | FINDING and development statistics, 3 engines |
| 20 | Same with the `instance` strategy (`/deferred-instance`) | Block hydrates as sent (7 components, 0 skipped), then one swap in its first `earlyRead`; no errors | same |
| 21 | Focus on a dehydrated title in the deferred block (its `focusin` hydrates the block) | `/deferred`: focus lost to `body`. `/deferred-instance`: focus on the "Specs" tab | FINDING, 3 engines |
| 22 | axe, WCAG 2.2 AA tags (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`), Foundation defaults | `color-contrast` (serious) on the selected tab and on a focused accordion title: about 3.76:1 (axe reports 3.75), `#1779ba` on `#e6e6e6`; nothing else, in either mode | `results.log`, last section (Chromium) |
| 23 | Same with `$tab-active-color` and `$accordion-item-color` darkened by 15 % lightness | No violations: tabs mode, accordion mode, after each swap direction, after incremental hydration | FINDING `axe ...: no violations`, 3 engines |
| 24 | Aria development checks | One `Violations found on element` plus `ngAccordionPanel must have an ngAccordionContent to render.` pair per accordion panel, and the `ngTabPanel must have an ngTabContent structural directive to render.` pair per tab panel, on every render of a mode; silent in production | development console, 3 engines |
| 25 | WebKit on Windows arm64 | Runs (Playwright `webkit-2359`); nothing left untested for lack of an engine | all WebKit rows |

Exact error text: no case failed in the final build. Every failing assertion during development was a test mistake, fixed before the final run (listed in the README). The only violation text is axe's: `color-contrast (serious): Element has insufficient color contrast of 3.75 (foreground color: #1779ba, background color: #e6e6e6, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1`.

### What the prototype does not prove

- A server that renders tabs (a client-hint Server breakpoint of `medium` or wider) hydrating on a narrow client: the mirror of case 2 and the pre-hydration tab stop question from the Aria prototype (every server tab has `tabindex="-1"`).
- Keeping consumer panel state across a swap by moving the panel views between the two branches instead of instantiating the templates again; not tried.
- Foundation's option passthrough (`multiExpand`, `allowAllClosed`, deep links, `selectionMode`), the outputs, a `rules` change at runtime, the object form of `rules`, the heading level (fixed at `h3`), nested widgets, RTL, reduced motion, and `hydrate never`.
- Whether the accordion's grid-row height transition plays when a swap creates an already expanded item (not measured).
- Screen-reader output of a swap, touch devices, find-in-page on `inert` panels.

### Decisions handed to the specs

- [Spec: Responsive Accordion Tabs](19-spec-responsive-accordion-tabs.md):
  - Component shape as built: `nfs-responsive-accordion-tabs` with `rules`, a shared `selected` model, a `label` for the tab list, and `ng-template[nfsResponsiveAccordionTabsPanel]` with `title` and `value`; it composes the Accordion and Tabs directive sets and writes their `[panel]` references and `value`s itself; no component styles.
  - The mode swap is the one accepted structural re-render (an `@if` branch), confirmed; a same-node class-and-role swap is not possible with Aria's directive sets (Verdict).
  - Swap mechanism: the displayed mode is its own signal, updated in an `afterRenderEffect` `earlyRead` callback that first reads `document.activeElement`, records the `value` of the item that holds focus, and then sets the mode; a `write` callback that reads the controls `viewChildren` query focuses the matching control once the new nodes exist. This handles resizes and the first-render swap with one code path.
  - First render: start every instance from the Server breakpoint's mode and swap in the instance's own first `earlyRead` (the `instance` strategy). Evidence: cases 15, 20, 21; it keeps focus and avoids a hydration-time branch rebuild in deferred blocks. The only cost is a second render in the first tick for instances created on the client, which is never painted (case 4). This needs the Breakpoint service to expose the Server breakpoint (the prototype added `serverBreakpoint` and an optional breakpoint argument to `resolve`).
  - State mapping: tabs always show a panel (the first when `selected` is unset); tabs -> accordion expands the visible tab's item; accordion -> tabs with nothing expanded shows the first tab and leaves `selected` unset. The prototype uses a single-value `selected`, so the accordion is single-expand; whether Foundation's `multiExpand`/`allowAllClosed` passthrough is supported, and how several expanded items map to one tab, is for the spec to settle from sources.
  - Documented consequences: consumer state inside panels resets on a swap (case 14); a pre-hydration click or key on a title that the first-render swap removes is lost while focus is carried over (cases 16, 18); the client-hint recipe avoids both for Chromium visitors.
  - Inherits the Aria prototype's replay guard and its OPEN FOR HUMAN items (Aria development warnings, replay log).
- [Spec: Breakpoint service (shared utility)](53-spec-breakpoint-service.md): "ARIA requirements imposed on consumers", rule 1, must drop "A swap at the first render never moves focus, because nothing inside the widget can hold focus before the first render callback"; server-rendered controls can hold focus before hydration, and the first-render swap must move it like any other (case 15). If the component spec adopts the `instance` strategy, the service exposes the Server breakpoint (or a `resolveAtServer(rules)` equivalent), and ADR 0014's rejected option "gate each consuming directive separately" needs a note that it was rejected as a general helper, not for a component whose swap removes focused nodes.
- [Prototype: Breakpoint handoff under hydration](60-prototype-breakpoint-handoff-hydration.md): consistent with ADR 0014 for this component; the `earlyRead` ordering (the service's callback, registered first, runs before the component's in the same phase) held in all three engines.
- [Spec: Accordion](15-spec-accordion.md) and [Spec: Tabs](16-spec-tabs.md): Foundation's default palette fails WCAG 2.2 AA contrast on the selected tab and on a focused or hovered accordion title; the fix is Foundation settings (below), which the library's docs and Storybook preview settings carry.

### Custom CSS

- No new library rule. The six rules of the Aria prototype's `nfs-accordion` mixin (`src/_nfs-accordion.scss` there) are reused unchanged; tabs need none; the component has no styles.
- Consumer Foundation settings for WCAG 2.2 AA 1.4.3, set after `@import 'foundation-sites/scss/foundation'` and before the component mixins: `$tab-active-color: scale-color($primary-color, $lightness: -15%);` and `$accordion-item-color: scale-color($primary-color, $lightness: -15%);` (compiles to `#14679e`: 4.86:1 on `$light-gray`, 6.06:1 on white). Lightening `$tab-background-active` or `$accordion-item-background-hover` cannot reach 4.5:1 with the default primary (`#f8f8f8` gives 4.41:1). Superseded for tabs by the [Spec: Tabs](16-spec-tabs.md) D17: `$tab-background-active: $primary-color; $tab-active-color: $white;` (the darkened text leaves the selected-state indicator at 1.24:1); `$accordion-item-color` stands.

### Triage

| Item | Impact | Confidence in the applied default | Outcome |
| --- | --- | --- | --- |
| Swap is a structural re-render, not a same-node swap | HIGH (component contract) | HIGH: forced by static directive matching, Foundation's panel placement, and ARIA's tablist child rule | Decided |
| `instance` first-render strategy and the service exposing the Server breakpoint | HIGH (service API) | HIGH: measured in 3 engines against the alternative; contradicts only ADR 0014's generic-helper rationale, which the prototype answers with a visible gain | Decided; ADR 0014 note flagged to the orchestrator |
| Consumer panel state resets on a swap | Not HIGH: internal to the component, a later view-moving implementation changes no API | Default measured | Decided: document it |
| Pre-hydration click or key on a removed title is lost | Not HIGH: documented behaviour, reversible | Default measured | Decided: document it; focus is carried |
| Contrast fix through Foundation settings | Not HIGH: consumer settings, no library CSS | HIGH: axe clean in 3 engines | Decided |
| Single-value `selected` and the `multiExpand` passthrough | HIGH (public API) | Not HIGH: a prototype value, not deliberated, and Foundation passes every Accordion option through | Handed to the spec ticket, which decides it from sources; not a prototype question |
| Screen-reader announcement of a swap | Needs assistive technology | -- | OPEN FOR HUMAN (human-only by rule) |

### OPEN FOR HUMAN

1. Screen-reader behaviour of a mode swap (NVDA, JAWS, VoiceOver): whether moving focus from a title to the equivalent tab (or back) is announced as a usable context change, and whether a live-region message is needed. Needs assistive technology; axe and the role checks here cannot answer it.
2. Inherited, not re-opened: the Aria development warnings on projected panels (case 24) and the replay log, both in the [Prototype: `@angular/aria` Accordion and Tabs under Foundation markup](43-prototype-aria-accordion-tabs.md) answer; both involve an upstream filing that needs the user's confirmation.

### Amendment, 2026-09-27 (audit 0006)

The upstream item (2) is closed as not filed, by the user's ruling ([Upstream filings](76-evidence-upstream-filing-readiness.md)); no workaround here depends on it. The screen-reader item (1) is decided by [Resolve the assistive-technology checks](77-evidence-assistive-technology-checks.md) check 3; the release test is in the [Spec: Responsive Accordion Tabs](19-spec-responsive-accordion-tabs.md), Testing Decisions.
