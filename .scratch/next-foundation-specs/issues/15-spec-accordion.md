# 15. Spec: Accordion

Type: grilling
Status: resolved
Blocked by: 14, 38, 43
Labels: wayfinder:grilling
Map: ../map.md

## Question

What is the Angular design for Foundation's Accordion plugin in the next library, and what does its spec say?

The result must be the best combination of: Foundation for Sites SCSS and the plugin's features; the ARIA APG pattern and WAI-ARIA; WHATWG HTML and HTML5+ platform features; Angular Aria; Angular CDK; Angular Material-equivalent accessibility and Material-equivalent component API (inputs, outputs, public properties and methods, content and view projection) for the similar Material component; and the modern DI patterns recorded in `research/di-and-composition-patterns.md` (lightweight injection tokens, host-scoped providers, host directives, parent tokens, default-options tokens). One plugin may yield several related directives or components (for example a container plus items plus a lazy-content directive); the spec covers the whole set.

Read first: `building-blocks.md`, `CONTEXT.md`, `adr/*.md`, the research files `research/foundation-inventory-disclosure.md`, `research/angular-aria-inventory.md`, `research/aria-apg-patterns.md`, `research/web-platform-features.md`, `research/angular-material-reference.md`, `research/di-and-composition-patterns.md`, `research/angular-rendering-modes.md`, and the resolved answers of every prototype and shared-utility spec ticket this ticket is blocked by. Zoom into the resolved tickets they came from when a claim needs its source. Consult the `/angular-developer:angular-developer` skill (its references live under `~/.claude/plugins/cache/angular-skills/angular-developer/*/references/`, including `signal-forms.md`, `angular-aria.md`, `naming-conventions.md`, `host-elements.md`) and the repo skill at `.claude/skills/foundation-api-design/SKILL.md` for the API design document shape. Where that skill says to read `COMPONENT_BUILDING_BLOCKS.md` or the old `*_API_DESIGN.md` files, read `building-blocks.md` from this effort instead.

Run `/grill-with-docs` (self-grilling, both sides) over these questions, then publish the spec with `/to-spec` to `specs/accordion.md`. The spec is a `/to-spec` spec: its top-level sections are exactly the to-spec template (Problem Statement, Solution, User Stories, Implementation Decisions, Testing Decisions, Out of Scope, Further Notes). The foundation-api-design material lives inside those sections as subsections: under Implementation Decisions put the CSS class to Angular mapping table, the directive or component hierarchy, the proposed API per directive or component (inputs, outputs, model signals, public methods, projection slots, DI tokens), the ARIA requirements table, the keyboard table, the rendered HTML structure, and the comparison with the Material counterpart; under Further Notes put usage examples and the design decisions table. Prose describes the API; short type-level signatures are allowed where prose would be less precise, and no file paths.

1. Directive or component, and the element or markup it attaches to; how it honours Foundation's CSS class contract.
2. Which Implementation level (platform, Aria, CDK, custom) it lands on, per the building-blocks map, and what a prototype must prove if the map flagged a risk. If a question cannot be settled from sources, write the precise prototype question under `## Prototype needed` in the answer so the orchestrator can create a prototype ticket; do not guess.
3. The ARIA pattern, roles, attributes, and keyboard table.
4. Every input (from Foundation's `data-*` options), its type, default, and whether it is `input()` or `model()`; every output (from Foundation's events); public methods if any.
5. State model in signals; zoneless behaviour; and the rendering-modes contract from `research/angular-rendering-modes.md` and ADR 0008: server render output and first-paint state, what must not run before hydration, full and incremental hydration (`@defer (hydrate on ...)`) boundaries, prerendering, event replay readiness (which listeners replay, and `preventDefault()` ordering), and behaviour inside `@defer` blocks.
6. Animation and reduced-motion behaviour.
7. Foundation behaviours dropped or changed, with the reason.
8. Testing seams, per the map's Testing rule and the testing section of `building-blocks.md`: story play functions (Storybook on `@storybook/angular-vite` with `@storybook/addon-vitest`), browser-level tests (the stack is set by the browser testing stack decision ticket; write them stack-neutral until it resolves), node-level Vitest (a server-render smoke test and pure logic), and Playwright e2e (web-native APIs, the static Storybook build, and the prerendered fixture app for hydration and pre-hydration clicks), in the spec's Testing Decisions.

Plugin-specific questions:

- `multiExpand`, `allowAllClosed`, `deepLink`, `updateHistory`, `deepLinkSmudge`, `slideSpeed`: which survive, and how deep linking uses the Router or the History API.
- `@angular/aria` Accordion versus native `<details name>` grouping versus CDK accordion: pick one and say what the others lose.
- Height animation: `interpolate-size` or `animate.enter`/`animate.leave` versus Foundation's slide.
- Disabled items, nested accordions, and programmatic open and close.

Two guards from the research-wave audit (`audits/0001-research-wave.md`, findings H6 and M12):

- The option names in the plugin-specific questions above were written while charting, before the inventories existed, and some are wrong or missing. Take the option, event, and method list from the Foundation inventory research and Foundation's own `defaults` object in the plugin source, not from this ticket.
- Platform features outside the map's browser target (see `research/web-platform-features.md`; for example `popover`, CSS anchor positioning, `<details name>`, `interpolate-size`, `@starting-style`, `:has()`, invoker commands) may appear only as a named future upgrade or behind a stated fallback, as the building-blocks decision already ruled.

Use the glossary's vocabulary. Add glossary terms to `CONTEXT.md` and ADRs to `adr/` only when the domain-modeling bar is met. The ticket answer holds the decision log (each question and the answer chosen, with its source); the spec holds the synthesis.

## Answer

Spec: [specs/accordion.md](../specs/accordion.md). Proposed ADR: [adr/0028-accordion-expansion-policy.md](../adr/0028-accordion-expansion-policy.md) (the orchestrator numbers it).

Gist: four attribute directives and one lazy marker on Foundation's markup, built on `@angular/aria` through `hostDirectives`: `[nfsAccordion]` (hosts `AccordionGroup`, owns Foundation's expansion policy, deep links, and the container Completion outputs), `[nfsAccordionItem]` (`.is-active`, `open()`/`close()`/`toggle()`, `opened`/`closed`), `button[nfsAccordionTitle]` inside `h1`-`h6` (hosts `AccordionTrigger`, the two-way `expanded` model, the required `[panel]="c.panel"` link), the `[nfsAccordionContent]` Wrapper component (hosts `AccordionPanel`, one inner element for the `grid-template-rows` animation), and `ng-template[nfsAccordionLazyContent]` rendered by the wrapper's own template. Foundation's defaults stay (`multiExpand` and `allowAllClosed` both `false`) through library-owned inputs over Aria in multi mode; the locked title renders `aria-disabled="true"` per the APG. Panel content is projected, so the server HTML is the first paint; the animation is a State-class CSS transition, so hydration replays nothing. Two guards: the Replay guard from the prototype, and a new content key guard, because Aria's group handles keys typed inside a panel (source reading). WCAG 2.2 AA: Foundation's default title colour fails 1.4.3 on hover and focus (3.76:1); the fix is a consumer setting plus a Sass `@warn`. Worked as a self-grilling against the sources named in the ticket; each question and the answer settled on is below.

### Decision log

Sources: P43 = the [Prototype: `@angular/aria` Accordion and Tabs under Foundation markup](43-prototype-aria-accordion-tabs.md); P52 = the [Prototype: `animate.enter` at hydration](52-prototype-animate-enter-hydration.md).

1. **Directive or component, and which markup?** Four attribute directives on `.accordion`, `.accordion-item`, `.accordion-title`, `.accordion-content`, the last an attribute-selector Wrapper component, plus `ng-template[nfsAccordionLazyContent]`; each directive adds its Structural class. Source: ADR 0001; building-blocks 1.1 case 2 and Table A; foundation-api-design SKILL "one directive per structural class".
2. **Title element?** `button[nfsAccordionTitle]` as the only element child of `h1`-`h6`; dev check when not. Source: `research/aria-apg-patterns.md` Accordion ("The `button` element is the only element inside the `heading` element"); P43 case 14.
3. **Implementation level?** `@angular/aria`; no fallback needed. `<details name>` and `::details-content` are out of target, and `<summary>` cannot sit in a heading. Source: building-blocks Table A; P43 verdict; `research/web-platform-features.md` 4.
4. **Which `panel` binding form?** `#c="nfsAccordionContent"` with `[panel]="c.panel"`: consumer markup names only library exports (the ADR 0013 idiom), Aria stays an implementation detail, and both proven forms are type-checked. Source: P43 cases 2 and 3; ADR 0013.
5. **`multiExpand` default against Aria's `true`?** Library-owned input, default `false`; Aria stays in multi mode; the item closes the others when its title's `expanded` model emits `true`. A `model()` emits synchronously on every internal `set`, and Aria's `ListExpansion.open` sets it. Source: P43 cases 4 and 5; `packages/core/src/authoring/model/model_signal.ts`; `src/aria/private/behaviors/expansion/expansion.ts`; building-blocks 1.4 ("Accordion keeps `multiExpand=false`"); CDK and Material `multi` default `false` (`research/angular-material-reference.md` 1). Recorded as the proposed ADR.
6. **`allowAllClosed`?** Kept, default `false`. The only open title renders `aria-disabled="true"` (its own host binding beats Aria's) and its host `click` and Enter/Space `keydown` listeners stop propagation before Aria's group listener; no `preventDefault()`. `close()` does nothing then; `collapseAll()` does nothing unless `allowAllClosed` (dev warning). Source: `research/aria-apg-patterns.md` Accordion (`aria-disabled` rule); Foundation `up()` (`js/foundation.accordion.js`); building-blocks Table B open risk.
7. **`deepLink` through the Router or the History API?** History API through `DOCUMENT.defaultView`, read in `afterNextRender` and on `hashchange`, `history.state` passed through so Router entries keep their state; no `@angular/router` dependency, no navigation cycle or anchor scrolling per toggle. Hash routing is unsupported (dev warning on `#/`). Source: building-blocks Table A ("History API for `deepLink`"), 1.5, 1.11 decision 9; `research/angular-22-api-survey.md` Router features.
8. **What does the hash follow?** `#<content id>` written when the user opens an item; cleared when the user closes the item the hash names (Foundation left it); an empty hash reopens the first-render item (Foundation's back rule). Consumer ids required; dev warning on Aria's generated prefix. Source: Foundation `_checkDeepLink` and `toggle()`; building-blocks 1.5.
9. **`updateHistory`?** Kept: `pushState` instead of `replaceState`. Source: inventory Accordion options.
10. **`deepLinkSmudge`, `deepLinkSmudgeDelay`, `deepLinkSmudgeOffset`?** `deepLinkSmudge` kept: the opened item's `li` is scrolled into view after its `opened`, smooth unless `NfsMediaQuery.reducedMotion()`. The delay is dropped (browser-owned timing); the offset is dropped in favour of `scroll-margin-top` or `scroll-padding-top`, which `scrollIntoView` honours. Source: building-blocks 1.4 dropped list and Table B Accordion; `research/web-platform-features.md` 9.
11. **`slideSpeed`?** Dropped as an input; the `nfs-accordion($duration: 250ms)` mixin parameter, the one value Foundation has no Sass setting for. Source: building-blocks 1.4, 1.13.
12. **Is the URL restored on destroy (building-blocks 1.9 last bullet)?** No: the hash is the user's state and a route change owns the next URL; the `hashchange` listener is removed. Source: reasoning against 1.9; proposed as a building-blocks note.
13. **Models and where they live?** Aria's `expanded` model stays on the title (`[(expanded)]`); the item has a read-only `expanded`. Two writable copies would need syncing. Source: `research/di-and-composition-patterns.md` 3d; angular-developer `linked-signal.md` (no effect-based syncing).
14. **Outputs?** Item `opened`/`closed` (void) and container `opened`/`closed` (payload `NfsAccordionItem`) as Completion outputs after the height transition; `expandedChange` at request time; `deepLinked` with the item. Source: building-blocks 1.4 mapping (`down/up.zf.accordion`, `deeplink.zf.*`); CONTEXT Completion output.
15. **Container methods?** `expandAll()` (only with `multiExpand`) and `collapseAll()` (only with `allowAllClosed`). Source: building-blocks 1.3 (Aria names); audit 0002 M6.
16. **Item methods?** `open()`, `close()`, `toggle()` through Aria's pattern, so `disabled` and the policy apply. Source: building-blocks 1.3; `research/angular-material-reference.md` 1 ("pick one and document it": CDK and Aria respect `disabled`).
17. **Initial state from Foundation markup?** A static `is-active` on the item seeds Aria's `expanded` model at construction; a bound `[expanded]` wins. Source: Foundation docs markup; the Toggler spec's `HostAttributeToken` seeding.
18. **Disabled?** Accordion `disabled` (Aria's input) rendered back as the `disabled` attribute so Foundation's cursor rule applies; per-title `disabled` (Aria), soft-disabled. `softDisabled` and `wrap` not exposed (no Foundation option; building-blocks 1.10 fixes soft-disabled). Source: `scss/components/_accordion.scss` `accordion-container`; `research/angular-aria-inventory.md` 2.1.
19. **Nested accordions?** Supported; each level is its own `nfsAccordion` with its own tokens, so no token is re-provided as `undefined`; the Replay guard stops a replayed key from reaching the outer group. Source: P43 cases 24 and 25; building-blocks 1.9 (re-provide pattern judged unnecessary here).
20. **DI shape?** `nfsAccordionToken`, `nfsAccordionItemToken`, required injection; registration at construction (a `signal<Set>`, order-free); `nfsAccordionDefaultsToken` Shape B with the Foundation options plus `region`. Source: building-blocks 1.4, 1.9; `research/di-and-composition-patterns.md` 3a, 5.
21. **Replay guard?** Kept from the prototype on `NfsAccordion` for keys from its titles. Source: P43 case 25.
22. **Keys typed inside a panel?** Aria's `AccordionGroupPattern.onKeydown` handles every keydown that reaches the group without checking the target, so Space in a panel input would toggle the last focused title and Home would move focus to the first title. `NfsAccordionContent` stops exactly Aria's matched keys (no modifiers; Home, End, Space, Enter only unrepeated). Source reading: `src/aria/private/accordion/accordion.ts`, `behaviors/event-manager/*.ts`; not covered by the prototype, asserted in stories, browser-level tests, and e2e.
23. **Ids?** Aria's generated `ng-accordion-trigger-`/`ng-accordion-panel-` prefixes kept (a wrapper cannot change an Aria input default); consumer ids win; references are host bindings, so the server-client difference is rewritten at hydration. Source: building-blocks 1.5; `research/angular-rendering-modes.md` 7 rule 8.
24. **`region` role?** Aria sets it unconditionally; a `region` input (default `true`) removes `role` and `aria-labelledby` for multi-expand accordions with many open panels. Collapsed panels are `inert` and not counted. Source: `research/aria-apg-patterns.md` Accordion (six-panel caution); host binding collision rule (angular-developer `host-elements.md`).
25. **Height animation?** Grid-row CSS transition on `.accordion-content` keyed on the item's `.is-active`, not `animate.enter` (which replays at hydration) and not `interpolate-size` (out of target). Source: ADR 0003; building-blocks 1.6 rule 3; prototypes 43 (case 12) and 52.
26. **Completion detection?** Measured computed transition for `grid-template-rows`, then `transitionend` filtered by property and target, else measured total plus 100 ms outside the zone; `transitioncancel` ignored (a reversal cancels the old transition); emitted from a render callback. Source: building-blocks 1.6 rule 1; the Toggler spec D8; `research/angular-material-reference.md` 0.2.
27. **Clip rule?** The inner element clips only while collapsed or animating (`nfs-accordion-content-shown` when open and settled), so focus rings, Anchored panes, and text-spacing overrides inside open panels are not cut off. Source: prototype CSS rule 5 refined; WCAG 2.4.7, 1.4.12; jQuery `slideDown` behaviour.
28. **The `@supports` question?** Dropped: `@supports not (grid-template-rows: 0fr)` never matches in the Browser target, and a non-interpolating browser snaps, which is correct. Source: P43 "what the prototype does not prove"; building-blocks 1.2 (grid `fr` interpolation in target).
29. **Reduced motion and disabled animations?** `transition-duration: 1ms` in `nfs-accordion` under `prefers-reduced-motion`; `nfsAnimationsToken` `{disabled: true}` binds `transition: none` and completes at once. Source: building-blocks 1.6 rule 5; ADR 0003.
30. **Lazy content: Aria's `ngAccordionContent` or the library's own?** The library's: a marker template rendered by the wrapper's `@if` plus `NgTemplateOutlet`, while shown (kept through the closing transition) or from first showing with `preserveContent`. Open lazy panels then render on the server; no dependency on Aria's private `DeferredContentAware`, whose `preserveContent` cannot be forwarded through a second host-directive level (ngtsc validates exposed inputs against the host directive's own inputs, `compiler-cli/src/ngtsc/annotations/common/src/diagnostics.ts`, `metadata/src/dts.ts`). Source: `research/angular-rendering-modes.md` 5; building-blocks 1.11 decision 2; CONTEXT Lazy content.
31. **Focus when a panel closes around focus?** The item focuses its title in the `expanded` emission, before `inert` is applied; bindings do not emit, `close()` is the safe call. Source: `research/angular-material-reference.md` 1 (Material header focus rule); WCAG 2.4.3.
32. **Accessible name with Foundation's glyph (WCAG 4.1.2 and 2.5.3)?** Kept: the name `"+ Section 2"` contains the visible label and the state is in `aria-expanded`, so both criteria pass as written; CSS alternative text is out of target (Firefox 128, Safari 17.4) and would be a second path (building-blocks 1.2). Named upgrade; `$accordion-plusminus: false` for a glyph-free name now. Source: P43 case 19; WCAG 2.2 2.5.3, 4.1.2.
33. **WCAG 1.4.3 and 1.4.11 on Foundation's title, border, and glyph?** Title `$primary-color` #1779ba on white 4.69:1 passes; on the hover and focus background `$light-gray` 3.76:1 fails. Fix: `$accordion-item-color: scale-color($primary-color, $lightness: -15%)` (#14679e, 4.86:1 and 6.0:1, computed with Dart Sass and the WCAG formula); `nfs-accordion` `@warn`s through Foundation's `color-contrast()`. The glyph inherits the title colour (above 3:1); the 1.25:1 border is not needed to identify the control, so 1.4.11 does not apply to it. Source: `scss/settings/_settings.scss`, `scss/util/_color.scss`; the browser testing stack decision entry 20 (settings override in the Storybook preview).
34. **WCAG 2.4.7?** The browser focus ring stays (Foundation removes outlines only under what-input's mouse attribute, never set by the library). Source: `scss/_global.scss` button reset, `scss/util/_mixins.scss` `disable-mouse-outline`.
35. **WCAG 2.5.8, 2.4.11, 1.3.1, 2.1.1, 2.4.3, 1.4.12, 2.2.2?** 2.5.8: titles full width and about 52 px tall. 2.4.11: panels are in-flow; `scroll-padding-top` for a consumer's sticky header. 1.3.1: heading wrapper, labelled regions, `inert`. 2.1.1: native buttons plus the content key guard. 2.4.3: decision 31. 1.4.12: open rows grow, no clip. 2.2.2: 250 ms, user-started. Source: Foundation settings; the spec's WCAG table.
36. **Custom CSS list?** Seven rules in `nfs-accordion`: heading margin; button width, alignment, cursor; re-included `accordion-title` under `:where(h1..h6) >` (not `:is()`, so specificity stays Foundation's); the grid on `.accordion-content`; the collapsed row; the inner element's clip and unclip; the reduced-motion override. Source: P43 custom CSS list, refined by decisions 27 and 28; ADR 0012; building-blocks 1.13.
37. **Rendering modes?** Server HTML carries every state; titles reachable by Tab before hydration; `jsaction` on the accordion, titles, and contents; one hydration boundary; no library `@defer`; `hydrate never` residue stated; deep links after hydration; prerendering identical. Source: ADR 0008; `research/angular-rendering-modes.md` 7 and the Accordion checklist row; P43 cases 8, 10, 11, 16.
38. **Material comparison?** Borrowed `multi` semantics, method names, after-animation timing, focus return, `inert`, grid animation, defaults token; not borrowed header components, indicator inputs, `displayMode`. Source: `research/angular-material-reference.md` 1.
39. **Testing seams?** The four layers in the browser testing stack decision's wording, with twelve Story ids; SSR smoke through `renderServer()` in `accordion.ssr.spec.ts`; a node-level Sass compile test; deep links and replayed keys in e2e. Source: [Decide the browser testing stack: Playwright component tests, Vitest Browser, or both](41-browser-testing-stack-decision.md) answer; [Prototype: Rendering-mode test seam](59-prototype-rendering-mode-test-seam.md) handed decisions.
40. **Option names from the source, out-of-target features only as upgrades?** Yes: the option list is `Accordion.defaults`; `<details name>`, `::details-content`, `interpolate-size`, `hidden="until-found"`, CSS alternative text appear only under Further Notes. Source: audit 0001 H6 and M12.

### Triage

Each item that could have been left for a human, rated per the map's triage rule (impact HIGH when hard to reverse; confidence NOT HIGH when the default is bare, carried without deliberation, or contradicts research or ADRs):

| Item | Impact | Confidence | Outcome and evidence |
| --- | --- | --- | --- |
| `multiExpand` default `false` via a library-owned input (decision 5) | HIGH (public default, inherited by ResponsiveAccordionTabs) | HIGH (building-blocks 1.4 names it; Foundation, CDK, Material agree; mechanism from source) | Decided; proposed ADR |
| `allowAllClosed` default `false` with `aria-disabled` (decision 6) | HIGH (public default) | HIGH (Foundation default; the APG prescribes the `aria-disabled` form) | Decided |
| `[panel]="c.panel"` form (decision 4) | HIGH (consumer markup) | HIGH (chosen between two proven forms with a stated reason) | Decided |
| Lazy content through the wrapper template, not Aria (decision 30) | MEDIUM (the markup is the same either way; the implementation can swap) | HIGH (ADR 0008 and research 5 point this way) | Decided; building-blocks change proposed |
| Lazy default "while shown", `preserveContent` opt-in | MEDIUM | HIGH (glossary Lazy content; Aria's default) | Decided |
| `region` input, name and default (decision 24) | HIGH (public input) | HIGH (APG caution; the name is the role it controls) | Decided |
| Glyph kept in the name (decision 32) | LOW (a later CSS rule changes it) | HIGH (normative text of 2.5.3 and 4.1.2) | Decided; the screen reader check is human-only (below) |
| Contrast fix by setting plus `@warn` (decision 33) | LOW | HIGH (user rule to reuse Foundation settings; stack decision entry 20) | Decided |
| No `@supports` guard (decision 28) | LOW (one CSS rule) | NOT HIGH (contradicts building-blocks 1.6 rule 3 and ADR 0003 wording) | Decided with the default because impact is low; building-blocks change proposed |
| Aria id prefixes (decision 23) | LOW | NOT HIGH (contradicts building-blocks 1.5) | Decided; building-blocks change proposed |
| URL not restored on destroy (decision 12) | LOW | NOT HIGH (contradicts building-blocks 1.9 wording) | Decided; building-blocks change proposed |
| Accept Aria's dev warnings for projected panels (prototype OPEN FOR HUMAN 1) | LOW (development console only) | HIGH (no directive or component can supply the content child) | Decided: accept and document; the upstream filing stays human-only |
| Accept the replay `preventDefault` log for Aria-handled keys (prototype OPEN FOR HUMAN 2, building-blocks Part 4 item 3) | LOW (no API; a later replay check can be added) | HIGH (building-blocks Part 4 item 3 default (a); state is correct) | Decided: accept; the upstream filing stays human-only |
| Content key guard (decision 22) | MEDIUM | HIGH from source, not run | Decided; asserted at three layers; upstream filing human-only |

### OPEN FOR HUMAN

Only human-only items remain (upstream filings and assistive-technology checks); every design decision above is made.

1. Upstream filing in angular/components (needs the user's confirmation; carried from the prototype): allow projected panel content without `ngAccordionContent` so the dev-mode warning stops. Default applied: accept and document the warning.
2. Upstream filing in angular/components (needs the user's confirmation; carried from the prototype): skip `preventDefault()` during event replay in Aria's event managers. Default applied: accept the one logged error per replayed Aria key.
3. Upstream filing in angular/components (needs the user's confirmation; new): `AccordionGroup`'s `keydown` listener should ignore keys whose target is not one of its triggers. Default applied: the content key guard.
4. Screen reader check (assistive technology): with NVDA, JAWS, VoiceOver, and TalkBack, confirm each title announces name, "button", expanded or collapsed, the locked title as unavailable, the region name on entering an open panel, and how the `+` and en dash glyphs read. Default applied: the design as specified.

No `## Prototype needed`: every open risk is settled by the prototypes or by source; the source-read behaviours (model emission, Aria's unfiltered `keydown`, ignored `transitioncancel`) are asserted in the test layers.

### Proposed glossary terms

**Replay guard**:
A `keydown` listener on an Aria-hosting container that stops propagation of the keys Aria handles, so a Replayed event that Aria's throwing `preventDefault()` left unstopped is not handled again by an outer widget.
_Avoid_: replay fix, stop guard, key shield

**Lazy content** (refined definition, replacing the current one):
Panel, tab, or slide content that renders when first shown and, unless preserved, is removed once hidden again; distinct from a consumer's `@defer` block, which loads code.
_Avoid_: deferred content (ambiguous with `@defer`), lazy panel, on-demand content

### Proposed ADR

[adr/0028-accordion-expansion-policy.md](../adr/0028-accordion-expansion-policy.md): the Accordion wrapper owns Foundation's expansion policy on top of Aria. Hard to reverse (public defaults), surprising (Aria is hosted but its single mode is not used), and a real trade-off (Aria's default as a delta, or wrapper logic).

### Proposed building-blocks changes

1. Table A, Accordion: replace "optional `ng-template[nfsAccordionLazyContent]` for client-only lazy panels" and "Aria's `AccordionContent` only behind the opt-in lazy template" with "optional `ng-template[nfsAccordionLazyContent]`, rendered by the wrapper's own template (`@if` plus `NgTemplateOutlet`), server-rendered when open; Aria's `AccordionContent` is not used". Reason: decision 30.
2. Table B, Accordion, DI shape: "item injects it `{skipSelf, optional}` and re-provides `undefined`" becomes "item injects it (required) and registers; no token is re-provided, each nested accordion provides its own". Reason: decisions 19 and 20.
3. Table B, Accordion, Material borrowed: `preserveContent` moves to the lazy template; open risk cell: resolved by the prototype and the proposed ADR (`allowAllClosed` via `aria-disabled` plus title-level interception).
4. 1.6 rule 3: drop "`@supports not (grid-template-rows: 0fr)` disables the transition"; add "the inner element clips only while collapsed or animating". ADR 0003's clause "with `@supports` disabling the transition where unsupported" gets the same correction. Reason: decisions 27 and 28.
5. 1.5 ids: generated ids of Aria-hosted elements keep Aria's prefixes (`ng-accordion-trigger-`, `ng-accordion-panel-`); the `nfs-<plugin>-` prefix applies to ids the library generates. Reason: decision 23.
6. 1.9 Aria composition: add "an Aria input whose default differs from Foundation's is not exposed; the wrapper declares its own input and enforces it through Aria's models, methods, and event interception (proposed ADR)" and "Aria-hosting containers carry the Replay guard". Reason: decisions 5 and 21.
7. 1.9 last bullet: exempt deep-link hashes from "restore any global the directive touched": the hash is the user's state. Reason: decision 12.
8. 1.12 or the Accordion row: note the content key guard for Aria's accordion (keys from inside panels reach `AccordionGroup`). Reason: decision 22; ResponsiveAccordionTabs inherits it.

### Amendment, 2026-09-26 (audit 0004)

From [audit 0004](../audits/0004-second-spec-wave.md), finding H1; decision 33 changes as follows, and `specs/accordion.md` was edited to match (the 1.4.3 row of the WCAG table, D19, and the Sass subsection's checks and item 2).

The `nfs-accordion` contrast `@warn`s compute each ratio (`$accordion-item-color` against `$accordion-background` and against `$accordion-item-background-hover`, `$accordion-content-color` against `$accordion-content-background`) from Foundation's `color-luminance()` with the WCAG formula and compare it unrounded, the rule of building-blocks 1.10 and the user's standing rule. Foundation's `color-contrast()` is no longer used or listed as a reused function, because it rounds to one decimal (`round($ratio * 10) * 0.1` in `scss/util/_color.scss`) and would pass a 4.498:1 pair as 4.5. D19 now reads "a Sass `@warn` from the unrounded ratio". The threshold (4.5), the required setting, and the numbers (3.76:1, 4.86:1, 6.0:1) are unchanged. The [Spec: Responsive Accordion Tabs](19-spec-responsive-accordion-tabs.md), which relies on this check, lists `color-luminance()` in its Sass subsection to match.
