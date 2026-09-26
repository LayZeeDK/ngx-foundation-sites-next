# 25. Spec: Off-canvas

Type: grilling
Status: resolved
Blocked by: 14, 38, 42, 53, 54, 63
Labels: wayfinder:grilling
Map: ../map.md

## Question

What is the Angular design for Foundation's Off-canvas plugin in the next library, and what does its spec say?

The result must be the best combination of: Foundation for Sites SCSS and the plugin's features; the ARIA APG pattern and WAI-ARIA; WHATWG HTML and HTML5+ platform features; Angular Aria; Angular CDK; Angular Material-equivalent accessibility and Material-equivalent component API (inputs, outputs, public properties and methods, content and view projection) for the similar Material component; and the modern DI patterns recorded in `research/di-and-composition-patterns.md` (lightweight injection tokens, host-scoped providers, host directives, parent tokens, default-options tokens). One plugin may yield several related directives or components (for example a container plus items plus a lazy-content directive); the spec covers the whole set.

Read first: `building-blocks.md`, `CONTEXT.md`, `adr/*.md`, the research files `research/foundation-inventory-menus.md`, `research/angular-cdk-inventory.md`, `research/aria-apg-patterns.md`, `research/web-platform-features.md`, `research/angular-material-reference.md`, `research/di-and-composition-patterns.md`, `research/angular-rendering-modes.md`, and the resolved answers of every prototype and shared-utility spec ticket this ticket is blocked by. Zoom into the resolved tickets they came from when a claim needs its source. Consult the `/angular-developer:angular-developer` skill (its references live under `~/.claude/plugins/cache/angular-skills/angular-developer/*/references/`, including `signal-forms.md`, `angular-aria.md`, `naming-conventions.md`, `host-elements.md`) and the repo skill at `.claude/skills/foundation-api-design/SKILL.md` for the API design document shape. Where that skill says to read `COMPONENT_BUILDING_BLOCKS.md` or the old `*_API_DESIGN.md` files, read `building-blocks.md` from this effort instead.

Run `/grill-with-docs` (self-grilling, both sides) over these questions, then publish the spec with `/to-spec` to `specs/off-canvas.md`. The spec is a `/to-spec` spec: its top-level sections are exactly the to-spec template (Problem Statement, Solution, User Stories, Implementation Decisions, Testing Decisions, Out of Scope, Further Notes). The foundation-api-design material lives inside those sections as subsections: under Implementation Decisions put the CSS class to Angular mapping table, the directive or component hierarchy, the proposed API per directive or component (inputs, outputs, model signals, public methods, projection slots, DI tokens), the ARIA requirements table, the keyboard table, the rendered HTML structure, and the comparison with the Material counterpart; under Further Notes put usage examples and the design decisions table. Prose describes the API; short type-level signatures are allowed where prose would be less precise, and no file paths.

1. Directive or component, and the element or markup it attaches to; how it honours Foundation's CSS class contract.
2. Which Implementation level (platform, Aria, CDK, custom) it lands on, per the building-blocks map, and what a prototype must prove if the map flagged a risk. If a question cannot be settled from sources, write the precise prototype question under `## Prototype needed` in the answer so the orchestrator can create a prototype ticket; do not guess.
3. The ARIA pattern, roles, attributes, and keyboard table.
4. Every input (from Foundation's `data-*` options), its type, default, and whether it is `input()` or `model()`; every output (from Foundation's events); public methods if any.
5. State model in signals; zoneless behaviour; and the rendering-modes contract from `research/angular-rendering-modes.md` and ADR 0008: server render output and first-paint state, what must not run before hydration, full and incremental hydration (`@defer (hydrate on ...)`) boundaries, prerendering, event replay readiness (which listeners replay, and `preventDefault()` ordering), and behaviour inside `@defer` blocks.
6. Animation and reduced-motion behaviour.
7. Foundation behaviours dropped or changed, with the reason.
8. Testing seams, per the map's Testing rule and the testing section of `building-blocks.md`: story play functions (Storybook on `@storybook/angular-vite` with `@storybook/addon-vitest`), browser-level tests (the stack is set by the browser testing stack decision ticket; write them stack-neutral until it resolves), node-level Vitest (a server-render smoke test and pure logic), and Playwright e2e (web-native APIs, the static Storybook build, and the prerendered fixture app for hydration and pre-hydration clicks), in the spec's Testing Decisions.

Plugin-specific questions:

- `position` (left, right, top, bottom), `transition` (push, overlap), `revealOn`, `revealClass`, `contentOverlay`, `contentScroll`, `closeOnClick`, `closeOnClickInside`, `trapFocus`, `autoFocus`, `closeOnEsc`, `transitionTime`, `forceTo`, `nested`, `inCanvasOn`.
- Native `<dialog>` for the overlap transition versus a plain panel with `inert` on the content; the push transition needs the wrapper markup (`.off-canvas-wrapper`, `.off-canvas-content`).
- Material's sidenav and CDK focus trap as references; body scroll lock; the `is-open`, `is-closed`, `is-transition-push` class contract.

Two guards from the research-wave audit (`audits/0001-research-wave.md`, findings H6 and M12):

- The option names in the plugin-specific questions above were written while charting, before the inventories existed, and some are wrong or missing. Take the option, event, and method list from the Foundation inventory research and Foundation's own `defaults` object in the plugin source, not from this ticket.
- Platform features outside the map's browser target (see `research/web-platform-features.md`; for example `popover`, CSS anchor positioning, `<details name>`, `interpolate-size`, `@starting-style`, `:has()`, invoker commands) may appear only as a named future upgrade or behind a stated fallback, as the building-blocks decision already ruled.

Use the glossary's vocabulary. Add glossary terms to `CONTEXT.md` and ADRs to `adr/` only when the domain-modeling bar is met. The ticket answer holds the decision log (each question and the answer chosen, with its source); the spec holds the synthesis.

## WCAG 2.2 AA guard (user decision, 2026-09-26)

Every directive and component complies with WCAG 2.2 AA; see the map's Accessibility preference and [ADR 0022](../adr/0022-wcag-2-2-aa-enforcement.md). The spec carries a criteria subsection under Implementation Decisions naming the 2.2 AA criteria this plugin touches (at least 1.4.3, 1.4.11, 2.4.7, 2.4.11, 2.5.8, 4.1.2, and, for overlays and hover content, 1.4.13) and how each is met, as requirements, never recommendations. Where a Foundation default fails a criterion, the spec states the Sass settings the consumer must set or the smallest custom rule the `nfs-<plugin>` mixin adds, with the reason. The story axe gate runs with the WCAG 2.2 AA tags, and the decision log records each criterion addressed.

## Note from the research repairs (2026-09-25)

Audit 0001 finding H5 corrected the Foundation facts in `research/angular-material-reference.md` that this ticket reads. Take these as given:

- There is no `open.zf.offCanvas`. The events are `opened.zf.offCanvas` (start of the open transition, despite the name), `openedEnd.zf.offCanvas` (its `transitionend`), `close.zf.offCanvas` (start of `close()`), and `closed.zf.offCanvas` (its `transitionend`).
- OffCanvas has no `closeOnEsc` option; Escape closes unconditionally through `Keyboard.register`. `closeOnClick` is the only close-related option. A `disableClose`-style input that also gates Escape is an addition beyond Foundation and the spec must say so.

## Answer

Spec: [specs/off-canvas.md](../specs/off-canvas.md). ADR: [adr/0030-off-canvas-no-dialog.md](../adr/0030-off-canvas-no-dialog.md).

Gist: three directives on Foundation's markup. `[nfsOffCanvas]` on `.off-canvas`/`.off-canvas-absolute` is the Openable (`isOpen` model, `open(trigger?)`/`close()`/`toggle(trigger?)`, `opened`/`closed` after the `transform` transition, `nfsOpenableToken`), binding `is-open`/`is-closed`/`is-transition-<t>` and the `reveal-for-<bp>`/`in-canvas-for-<bp>` classes from its `revealOn`/`inCanvasOn` inputs. `[nfsOffCanvasContent]` on `.off-canvas-content` takes Foundation's content classes from its linked panels and `inert` in modal mode; panels link by the `content` reference (Foundation's `contentId`) or, when nested, by DI. `[nfsOffCanvasOverlay]="panel"` on a consumer-written `div.js-off-canvas-overlay` replaces the generated overlay; omitting it is `contentOverlay: false`. No `<dialog>` in any mode (proposed ADR). Modal mode is `trapFocus` with an overlay present: `role="dialog"`, `aria-modal`, `inert` content after focus is inside, CDK `FocusTrap`, Trigger role `dialog`; every other configuration is a disclosure. Escape closes from anywhere while open (new `closeOnEsc`, default `true`), focus moves in at the start of the transition and returns on every close path. Server HTML is correct at every width because only Foundation's classes decide visibility. Library CSS: a reduced-motion override for Foundation's transitions, `overflow: clip; display: flow-root` on `.off-canvas-wrapper`, a 24 px close button box, compile-time contrast checks (Foundation's default panel colours fail), and opt-in reveal/in-canvas classes for breakpoints outside `$breakpoint-classes`. Worked as a self-grilling against the sources below; every question and the answer settled on is in the decision log.

### Decision log

Sources: `F:js` = `foundation-sites/js/foundation.offcanvas.js`, `F:scss` = `scss/components/_off-canvas.scss`, `F:docs` = `docs/pages/off-canvas.md` (6.9.0 clone); `R:menus` 6 = the Foundation inventory B; `M:drawer` = `components/src/material/sidenav/drawer.ts` (22.2.x); `BB` = `building-blocks.md`.

1. **Which element, directive or component?** Directive `NfsOffCanvas`, selector `[nfsOffCanvas]`, `exportAs 'nfsOffCanvas'`, on the consumer's `.off-canvas` or `.off-canvas-absolute`; the consumer writes Foundation's classes. Source: ADR 0001, BB 1.1 and 1.3, Table A OffCanvas row.
2. **Content element?** Directive `[nfsOffCanvasContent]`, no inputs, provides the lightweight `nfsOffCanvasContentToken`; its host classes are computed from registered panels, so several panels share one content (F:docs "Multiple Panels"). Source: BB Table A; F:js L229-250.
3. **How does a panel find its content?** Bound `content` reference wins (the typed `contentId`), else `inject(nfsOffCanvasContentToken, {optional: true, skipSelf: true})` for the enclosing content; a sibling has no DI path, so Foundation's sibling search becomes the reference. A shared wrapper directive as a registry was rejected: Foundation's wrapper is optional CSS (F:docs "Wrapper"), and ADR 0013 prefers references. Source: F:js L72-78; ADR 0013; BB Table B OffCanvas DI cell.
4. **Overlay?** Consumer-written `div.js-off-canvas-overlay.is-overlay-fixed|absolute` with `[nfsOffCanvasOverlay]="panel"` (required reference), placed after the panel for both variants (the wrapper's `position: relative` bounds the absolute one), registering with the panel from an `effect`. Binds `is-visible` and `is-closable`; its `click` host listener closes when `closeOnClick`. Source: F:js L109-119, L435-441; F:scss L97-131; ADR 0008 (no generated structure).
5. **Native `<dialog>` for overlap mode?** No, for either transition; no prototype needed because the sources settle it: a closed `<dialog>` is `display: none` (UA stylesheet) with an implicit `dialog` role, but the same element must be a visible non-dialog sidebar at `revealOn` or a page element at `inCanvasOn` in server HTML (BB 1.11 decision 8; APG research OffCanvas: revealed panels drop dialog semantics); Foundation's transform transition cannot start from `display: none` without `@starting-style`, which is outside the Browser target (`research/web-platform-features.md` 6; the finding of the [Prototype: `animate.enter` and `animate.leave` with Motion UI transition classes](47-prototype-motion-ui-animate-enter.md) that a newly rendered element has no prior frame to transition from); Foundation's default is non-modal (`trapFocus: false`). Of the Reveal prototype's carry-overs, rules 1, 2, 5, 6 and the `::backdrop` colour therefore do not apply; the scroll-lock verdict, `open(origin)`, and the need for a Tab wrap do. Correction for the record: the backdrop setting named in that prototype, `$offcanvas-overlay-background`, does not exist; Foundation's overlay colour is `$offcanvas-exit-background` (F:scss L67). Proposed ADR recorded.
6. **Push mode?** In-flow custom: Foundation's `.off-canvas-content.is-open-<pos>.has-transition-push` transform, unchanged. Source: F:scss L220-228, L365-384.
7. **`inert` where?** Only on `nfsOffCanvasContent` in modal mode, set after focus has moved into the panel and removed at close request (Material's order, `M:drawer` L111-145); on the panel only while exiting; never on a closed panel. Source: BB 1.10 and audit 0002 H4.
8. **Modal mode definition?** `trapFocus && overlay registered`, the APG's both-conditions rule; `trapFocus` without an overlay keeps Foundation's Tab trap with disclosure semantics and a dev warning. Source: `research/aria-apg-patterns.md` OffCanvas; F:js L457-460.
9. **`FocusTrap`?** CDK `FocusTrapFactory` only when `trapFocus` is on, created in the browser on first activation; its anchors are panel siblings, which Foundation's `~` sibling rules tolerate. Native containment is unavailable without `<dialog>`, and the Reveal prototype showed no engine wraps Tab natively anyway. Source: BB 1.2; CDK `focus-trap.ts` L120-132, L390; Reveal prototype Tab-wrap row.
10. **`position`?** From the static `class` attribute through `HostAttributeToken('class')`, default `left`; dev warning if missing or bound. Physical, no `Directionality`: Foundation's off-canvas Sass has no RTL handling. Source: F:js L33, L106; F:scss L187-341; audit 0001 H6.
11. **`transition`?** Input `'push' | 'overlap'`, default `'push'`; nested forces overlap silently. Source: F:js L90-97, L643 (doc bug); audit 0002 M6.
12. **`revealOn`/`inCanvasOn`?** Inputs that bind Foundation's `reveal-for-<bp>`/`in-canvas-for-<bp>` (server HTML correct at every width); the Breakpoint service's `atLeast()` drives only behaviour (`open()` no-op, `has-reveal-<pos>`, closing on a crossing). A hand-written class warns. `is-closed` stays bound while revealed because Foundation's breakpoint rules win by source order at equal specificity. Source: F:js L121-158, L298-315; F:scss L387-443, L479-511; BB 1.7 "CSS first", 1.11 decision 8; Breakpoint service spec consumer table; Responsive Toggle spec's `hideFor` precedent.
13. **`isRevealed`, `revealClass`, `nested`, `contentOverlay`, `transitionTime`?** Dropped: derived from `revealOn`; class-name option; derived from DI; the overlay's presence; the `$offcanvas-transition-length` setting. Source: BB 1.4 dropped-option rules.
14. **`contentScroll`?** Input, default `true`; `false` writes Foundation's `is-off-canvas-open` on `body` from the open render callback until close completion, counted per document so a second locked panel keeps it; the touch handlers and `data-off-canvas-scrollbox` are dropped. Source: F:js L322-389, L427-433; F:scss L92-94; Reveal prototype scroll-lock verdict (pages scroll behind overlays unless locked).
15. **`forceTo`?** Kept, `window.scrollTo` in the open render callback before focus and lock. Source: F:js L407-411.
16. **`closeOnClick`?** Default `true`: overlay click; without an overlay a content click closes (listener added in code while open), ignoring clicks inside the panel and on registered Triggers so the Trigger's own click does not close and reopen. Source: F:js L177-180.
17. **`closeOnEsc`?** New input, default `true`, listed as a delta: Foundation always closes on Escape. Source: audit 0001 H5, audit 0002 M6; F:js L55-57.
18. **Escape listener placement?** `window`, bubble phase, while open; no modifier, not composing, not `defaultPrevented`, not inside a modal `<dialog>` that does not contain the panel; `preventDefault()` last. `window` makes it work with focus behind a non-modal panel (2.4.11) and runs after the Light dismiss registry's document listener, so an inner pane closes first. Source: Anchored pane spec Escape rule; ADR 0024; DOM event path order.
19. **`autoFocus`?** Material's union minus `'dialog'`: `true`/`'first-tabbable'` (`data-autofocus` first, then the first tabbable by `InteractivityChecker`), `'first-heading'`, selector, `false`; non-focusable targets get a temporary `tabindex="-1"`. Source: F:js L443-455; `M:drawer` L59, L436-480; BB 1.10.
20. **When does focus move in?** In the phase machine's `write` step right after the open, with `preventScroll: true`, not after `transitionend` (Foundation). An initially open panel takes focus only in modal mode. Source: `M:drawer` L446-465; BB 1.10.
21. **Focus return?** On every close path when focus is inside the panel or on `body`: the `open(trigger)` element, else the previously focused element, else the first registered Trigger; none after a breakpoint-caused close. Source: Triggers spec contract; Reveal prototype (WebKit does not focus clicked buttons); F:js L568-579 (Foundation only on Escape).
22. **Completion outputs?** `opened` on the `transform` `transitionend` (filtered by target and property), `closed` likewise; fallback timer of the measured transition length plus 100 ms; measured zero completes at once. Measured rather than declared because the length is the consumer's Sass setting (Toggler spec precedent). Source: BB 1.6 rule 1; ADR 0003; the [Prototype: `animate.enter` and `animate.leave` with Motion UI transition classes](47-prototype-motion-ui-animate-enter.md); F:js L472-480, L517-545.
23. **Event mapping?** `opened.zf.offCanvas` and `close.zf.offCanvas` -> `isOpenChange`; `openedEnd.zf.offCanvas` -> `opened`; `closed.zf.offCanvas` -> `closed`; no start events. Source: BB 1.4; the research-repair note above.
24. **Crossing into the revealed or in-canvas range while open?** Closes (writes `isOpen` false from the breakpoint-reaction `afterRenderEffect`), Foundation's `reveal(true)`/`_checkInCanvas` behaviour; all page effects follow `#active = isOpen && !revealed && !inCanvas` regardless. Differs from Responsive Toggle's persistence, recorded with its reason (an overlay, lock, and inert content would otherwise return on the way back). Source: F:js L216-221, L298-301.
25. **Methods?** `open(trigger?)`, `close(result?)` (result ignored), `toggle(trigger?)`, `registerTrigger`, all `void`. Source: BB 1.3; audit 0002 M6 (no promise returns).
26. **Defaults token?** `nfsOffCanvasDefaultsToken` (Shape B) for `transition`, `closeOnClick`, `closeOnEsc`, `contentScroll`, `forceTo`, `autoFocus`, `trapFocus`. Source: BB 1.4.
27. **Overflow clip on the wrapper?** Yes: `nfs-off-canvas` emits `.off-canvas-wrapper { overflow: clip; display: flow-root; }`, same clipping and formatting context as Foundation's `overflow: hidden` without a scroll container, so Sticky works inside. The Sticky measurement prototype's case 3 checks `clip` in the wrapper; if it fails, the rule is dropped. Source: Sticky spec; CSS Overflow 3 (`clip` establishes no formatting context); `research/web-platform-features.md` 8.
28. **Render hooks?** `effect` for the two registrations; `afterNextRender` for the live flag; `afterRenderEffect` with `earlyRead` (focus-before-open, computed transition timing) and `write` (scroll, focus, trap, `body` class, timer) for the phase machine, one for listeners while open, one for breakpoint reactions, one for dev checks; `afterEveryRender` not used. Source: BB 1.5.
29. **`injectAsync`?** Not used: `FocusTrapFactory` and `InteractivityChecker` are small and must be ready in the render pass of a replayed open; per-plugin entry points already split under `@defer`. Source: Anchored pane spec D20 reasoning; API survey `injectAsync`.
30. **Rendering modes?** Server: closed panel `is-closed` with no `inert`/`aria-hidden`/`role`; breakpoint classes from inputs; only `has-reveal-<pos>` depends on the Server breakpoint and Foundation's sibling rule already gives the margin; Trigger and overlay clicks replay; the Escape and content listeners are added in code and never replay; `body` class and focus trap only after hydration; one hydration boundary for panel, content, overlay, and Triggers; `hydrate never` keeps revealed and in-canvas panels working. Source: ADR 0008, ADR 0014, rendering-modes research 7 and checklist row, Breakpoint handoff prototype.
31. **Test seams?** The four layers with the stack decision's wording, 13 Story ids `off-canvas--<story>`, browser-level cases with a fake `MediaMatcher`, an SSR smoke, a Sass compile test, and e2e on both halves. Source: ADR 0018; the browser testing stack decision's answer.

WCAG 2.2 AA criteria (ADR 0022), each a requirement in the spec's criteria subsection:

32. **1.4.3:** Foundation's `$anchor-color` on `$offcanvas-background` is 3.76:1 (measured with the WCAG formula); required setting `$offcanvas-background: $white` (4.65:1); mixin `@warn` under 4.5; axe `color-contrast` in every story.
33. **1.4.11:** close-button glyph `$closebutton-color` on the default panel is 2.77:1; mixin `@error` under 3 naming both settings; with `$white` it is 3.42:1. The overlay and panel edge are not components or states a user must identify to operate the page, so no ratio is set for them.
34. **2.4.7:** user-agent focus indicator; Foundation's `disable-mouse-outline` needs what-input, which is never loaded.
35. **2.4.11:** Escape from anywhere while a non-modal panel is open (the criterion's note on user-opened content); modal keeps focus inside; revealed top/bottom fixed panels need document `scroll-padding` (dev check 8); left/right revealed panels get a content margin.
36. **2.5.8:** `min-width`/`min-height: 24px` on `.close-button` inside a panel, because the spacing exception fails beside the first menu link in Foundation's docs markup.
37. **4.1.2:** Trigger `aria-expanded`/`aria-controls` (plus `aria-haspopup="dialog"` in modal mode); modal panel `role="dialog"`, `aria-modal`, and a required name.
38. **2.4.3, 2.1.1, 2.1.2:** focus in on open and back on every close; Escape or a close control always leaves a modal (dev check when `closeOnEsc: false` and no close control).
39. **1.4.10:** push panels inside `.off-canvas-wrapper` (dev check), Zero-breakpoint panel size at most 320 px (`@warn`), stacked menus; e2e `scrollWidth <= 320`.
40. **1.4.13:** not touched (activation only).

### Triage

Rule: [map](../map.md), Orchestration rules, "Triage of human-only items".

| Item | Impact | Confidence | Outcome and evidence |
| --- | --- | --- | --- |
| No `<dialog>` in any mode | HIGH (consumer markup, ADR) | HIGH (UA stylesheet, APG revealed-panel rule, BB 1.11 decision 8, `@starting-style` out of target, non-modal default) | Decided; proposed ADR |
| `content` reference replaces `contentId`; siblings need it | HIGH (public API) | HIGH (ADR 0013; BB Table B DI cell names exactly this) | Decided |
| `revealOn`/`inCanvasOn` as class-binding inputs, hand-written class warns | HIGH (public API) | HIGH (Responsive Toggle `hideFor` precedent; BB 1.7 CSS first) | Decided |
| `closeOnEsc` input, default `true` | HIGH (public API) | HIGH (audit 0002 M6 already settled it) | Decided |
| Modal = `trapFocus` plus overlay | MEDIUM (semantics, no new API) | HIGH (APG research) | Decided |
| Close on crossing into the revealed or in-canvas range | MEDIUM (behaviour, no API) | HIGH (Foundation source L216-221, L298-301) | Decided; the difference from Responsive Toggle is recorded |
| Escape from `window` while open | MEDIUM (behaviour) | HIGH (2.4.11 note; Anchored pane Escape ordering) | Decided |
| Focus in at transition start; return on every close | MEDIUM | HIGH (Material drawer; BB 1.10) | Decided |
| `overflow: clip; display: flow-root` on the wrapper | MEDIUM (library CSS, easy to remove) | MEDIUM (CSS spec facts; clip in the wrapper awaits the Sticky measurement prototype's case 3) | Decided with this default, not HIGH impact; falls back to the Sticky recipe if case 3 fails |
| `@error` on Foundation's default close-button contrast | MEDIUM (a default build stops) | HIGH (2.77:1 computed; Slider spec and ADR 0022 pattern) | Decided |
| 24 px close-button box | LOW | HIGH | Decided |
| Dropped touch handlers (iOS scroll lock by `overflow: hidden` only) | LOW (a handler can be added later, no API) | MEDIUM (real iOS not measurable here) | Decided; noted under what tests cannot prove |
| Screen reader check of modal and disclosure modes | -- | -- | Human-only (assistive technology) |

### OPEN FOR HUMAN

1. **Screen reader check** (NVDA or JAWS with Chromium and Firefox, VoiceOver with Safari): the modal panel's role, name, and browse-mode containment; the role switch from none to `dialog` at open; the disclosure Trigger's state; the revealed sidebar announced as plain content. Human-only by kind.

No item is left open by the auto-trap rule.

## Prototype needed

None. Every question was settled from sources; the one dependency on running code, `overflow: clip` inside the wrapper, is already case 3 of the claimed [Prototype: Sticky measurement refinements](63-prototype-sticky-measurement.md), and the spec states its fallback.

### Proposed glossary terms (CONTEXT-FORMAT; orchestrator applies)

**Revealed panel**:
An off-canvas panel shown as a permanent sidebar at and above its `revealOn` breakpoint by Foundation's `.reveal-for-<bp>` class; distinct from the Reveal plugin.
_Avoid_: open panel, docked panel, persistent drawer, revealed modal

**In-canvas panel**:
An off-canvas panel rendered as a normal page element at and above its `inCanvasOn` breakpoint by Foundation's `.in-canvas-for-<bp>` class.
_Avoid_: inline panel, static off-canvas, docked panel

**Modal mode**:
The OffCanvas configuration with `trapFocus` and an overlay present, in which the panel is a modal dialog and the page content is inert; every other configuration is a disclosure.
_Avoid_: overlay mode, trap mode, dialog mode

### Proposed ADR

[adr/0030-off-canvas-no-dialog.md](../adr/0030-off-canvas-no-dialog.md): "OffCanvas panels are not `<dialog>` elements, in any mode; modal mode makes the content inert instead." It meets the bar: hard to reverse (consumer markup), surprising next to ADR 0007, a real trade-off.

### Proposed building-blocks changes (orchestrator applies)

1. Table A, OffCanvas row, primitives: drop `Directionality` (Foundation's off-canvas Sass is physical); add "`content` reference or enclosing-content DI (`nfsOffCanvasContentToken`)"; APG cell: "Dialog (Modal) in modal mode (`trapFocus` with an overlay)". Reason: decisions 3, 8, 10.
2. Table B, OffCanvas row: platform cell "`<dialog>` not used in any mode (proposed ADR); `CloseWatcher` and `@starting-style` as future upgrades"; animation cell "fallback timer measured from the `transform` transition"; open-risk cell "settled: both transitions custom; `nfs-off-canvas` sets `overflow: clip; display: flow-root` on `.off-canvas-wrapper`, pending the Sticky measurement prototype's case 3". Reason: decisions 5, 22, 27.
3. Table B, Sticky row, last cell: point the wrapper clash at the OffCanvas mixin rule instead of "open in the OffCanvas row". Reason: decision 27.
4. 1.6 rule 1: extend "measured" to Foundation transitions whose length is a consumer Sass setting (`$offcanvas-transition-length`), not only consumer Motion classes. Reason: decision 22.
5. Consistency-review note: the `.title-bar .menu-icon` 24 px hit area lives in `nfs-responsive-toggle`, but Foundation's off-canvas docs put the same hamburger in a title bar without ResponsiveToggle; consider moving it to a shared title-bar or menu-icon Library mixin that both specs reference. Not applied in either spec.
6. Correction to carry into the Reveal spec and the Reveal prototype answer: Foundation's overlay setting is `$offcanvas-exit-background`; `$offcanvas-overlay-background` does not exist.

### Amendment, 2026-09-26 (audit 0004)

From [audit 0004](../audits/0004-second-spec-wave.md), findings H1, M4, M5, M9, and L4; `specs/off-canvas.md` was edited to match.

1. Unrounded ratios (H1; decisions 32 and 33): the close-glyph `@error` and the link `@warn` compute each ratio from Foundation's `color-luminance()` with the WCAG formula and compare it unrounded (building-blocks 1.10; the user's standing rule). Foundation's `color-contrast()` is no longer used or listed as a reused function, because it rounds to one decimal and would pass a 2.95:1 pair. The thresholds and the defaults (2.77:1 and 3.76:1) are unchanged.
2. Focus containment across a crossing (M4; decisions 21, 24, and 28): the move to the first registered Trigger when a crossing out of the revealed or in-canvas range hides a panel that holds focus no longer reads `document.activeElement` in the breakpoint-reaction callback, because Foundation's CSS hides the panel before any render callback runs and the browser has already moved focus to `<body>` (building-blocks 1.5). Containment is recorded continuously by `focusin`/`focusout` listeners on the panel host (the Breakpoint service's consumer rule 1, third place), added with `Renderer2.listen` in `afterNextRender` and seeded from live focus there, so they add no `jsaction` and never replay; a `focusout` without a `relatedTarget` keeps the record. The move runs in the callback's `write` phase keyed on rendered state, the panel's computed `visibility` read in `earlyRead`, and only while focus is on `<body>` or inside the panel. The browser-level case now hides the panel with a test style at the fake crossing, and a new e2e case with real CSS puts keyboard focus in the revealed sidebar at 1300 px, resizes to 800 px, and expects focus on the Trigger, never `<body>`, in three engines.
3. Axe tags (M5): the WCAG subsection and the story layer now name all six tags, `best-practice` included, which the `aria-dialog-name` rule of the modal row needs.
4. Menu-icon target size (M9; proposal 5): the 2.5.8 row and the Sass subsection now state that a `.title-bar .menu-icon` Trigger needs `@include nfs-responsive-toggle;` for its 24 by 24 px hit area (WCAG 2.5.8), with or without ResponsiveToggle, as a requirement rather than a pointer. Whether a shared title-bar or menu-icon Library mixin should own that rule stays with the orchestrator (the audit proposes the consistency review's question or a Not yet specified bullet).
5. Settled wording (L4): the no-`<dialog>` decision is cited as [ADR 0030](../adr/0030-off-canvas-no-dialog.md) instead of a proposed ADR, and the wrapper's `overflow: clip` rule as confirmed by the [Prototype: Sticky measurement refinements](63-prototype-sticky-measurement.md), case 3, in three engines, instead of pending it; the fallback sentence for a failed case 3 is gone.

### Amendment, 2026-09-26 (consistency review)

From the [Consistency review and bundle index](36-consistency-review.md); `specs/off-canvas.md` was edited to match. No decision changes.

- Menu-icon hit area (proposal 5; audit 0004 M9): the review settled that the 24 px `.title-bar .menu-icon` hit area stays in `nfs-responsive-toggle` rather than moving to a shared mixin. The 2.5.8 row and the Sass subsection now add that the include without an argument emits only the hit-area rule plus compile-time warnings, and the 2.5.8 row adds that a `.menu-icon` outside `.title-bar` gets no library hit area and must meet 2.5.8 by the spacing exception or the consumer's own size. The hierarchy sketch now places its `button.menu-icon` inside `div.title-bar` and names the hit area, so no example shows a menu icon without its 2.5.8 route.
- Registration effects (audit 0004's unrecorded departure 6, confirmed): the panel-to-content and overlay-to-panel `effect`s write only the target's registry signal and no DOM, and follow a reference input that can change at runtime, which `ngOnInit` cannot. The hierarchy bullet, the state-model heading, and the render-hooks row now point at the reverse-link exception that building-blocks 1.5 and 1.9 name for this shape (Triggers, Responsive Toggle, Off-canvas; Aria's `MenuTrigger` sets its menu's parent the same way).
- Playwright e2e, fixture half: "with `main.js` held back" is now "with the main bundle held back". Reason: no file paths in specs (the leftover the review question names).
- Checked and unchanged: the seven to-spec sections and the 1.14 placement; the WCAG 2.2 AA subsection with unrounded checks and the `$offcanvas-background: $white` override, which the Storybook conventions list; the six axe tags; the four test layers; render hooks and `injectAsync`; the rendered-state rule for the crossing-out focus move (computed `visibility` and the `focusin`/`focusout` record); the Escape ordering after the Light dismiss registry and the `FocusTrap` use, which match the Anchored pane and Triggers specs; Story ids `off-canvas--<story>`; no "pending" or "proposed" wording left in the spec.

#### Triage

The one OPEN FOR HUMAN item (the screen-reader check) stays open by kind: it needs assistive technology. No other item is open.

### Amendment, 2026-09-26 (audit 0005)

From [audit 0005](../audits/0005-final-bundle.md), unrecorded departure 5 and finding L8; `specs/off-canvas.md` was edited to match.

1. Home of the Scroll lock count (departure 5): the spec counted its Scroll lock per document without naming where the count lives. It now names `NfsOffCanvasScrollLock`, an internal `@Service()` of the entry point (not public API), holding the open panels with `contentScroll: false`: the first to lock adds `is-off-canvas-open` to `body`, the last to release removes it. Building-blocks 1.5 now allows a plugin-internal service for state shared across instances, naming Reveal's `NfsRevealStack` and this one. Behaviour is unchanged (the browser-level case "kept while a second locked panel is open" already asserted the count). Reason: a module-level counter would be shared between applications on one page, the reason the [Spec: Reveal](18-spec-reveal.md) gives in its D20.
2. JavaScript-disabled e2e case (L8): "screenshot plus axe" names `@axe-core/playwright` with the six tags.

#### Triage

Item 1: Impact LOW (an internal service, not public API; behaviour unchanged). Confidence HIGH (the Reveal precedent and building-blocks 1.5 as amended). Decided.
