# 28. Spec: Sticky

Type: grilling
Status: resolved
Blocked by: 14, 38, 48, 53
Labels: wayfinder:grilling
Map: ../map.md

## Question

What is the Angular design for Foundation's Sticky plugin in the next library, and what does its spec say?

The result must be the best combination of: Foundation for Sites SCSS and the plugin's features; the ARIA APG pattern and WAI-ARIA; WHATWG HTML and HTML5+ platform features; Angular Aria; Angular CDK; Angular Material-equivalent accessibility and Material-equivalent component API (inputs, outputs, public properties and methods, content and view projection) for the similar Material component; and the modern DI patterns recorded in `research/di-and-composition-patterns.md` (lightweight injection tokens, host-scoped providers, host directives, parent tokens, default-options tokens). One plugin may yield several related directives or components (for example a container plus items plus a lazy-content directive); the spec covers the whole set.

Read first: `building-blocks.md`, `CONTEXT.md`, `adr/*.md`, the research files `research/foundation-inventory-positioned.md`, `research/angular-cdk-inventory.md`, `research/web-platform-features.md`, `research/di-and-composition-patterns.md`, `research/angular-rendering-modes.md`, and the resolved answers of every prototype and shared-utility spec ticket this ticket is blocked by. Zoom into the resolved tickets they came from when a claim needs its source. Consult the `/angular-developer:angular-developer` skill (its references live under `~/.claude/plugins/cache/angular-skills/angular-developer/*/references/`, including `signal-forms.md`, `angular-aria.md`, `naming-conventions.md`, `host-elements.md`) and the repo skill at `.claude/skills/foundation-api-design/SKILL.md` for the API design document shape. Where that skill says to read `COMPONENT_BUILDING_BLOCKS.md` or the old `*_API_DESIGN.md` files, read `building-blocks.md` from this effort instead.

Run `/grill-with-docs` (self-grilling, both sides) over these questions, then publish the spec with `/to-spec` to `specs/sticky.md`. The spec is a `/to-spec` spec: its top-level sections are exactly the to-spec template (Problem Statement, Solution, User Stories, Implementation Decisions, Testing Decisions, Out of Scope, Further Notes). The foundation-api-design material lives inside those sections as subsections: under Implementation Decisions put the CSS class to Angular mapping table, the directive or component hierarchy, the proposed API per directive or component (inputs, outputs, model signals, public methods, projection slots, DI tokens), the ARIA requirements table, the keyboard table, the rendered HTML structure, and the comparison with the Material counterpart; under Further Notes put usage examples and the design decisions table. Prose describes the API; short type-level signatures are allowed where prose would be less precise, and no file paths.

1. Directive or component, and the element or markup it attaches to; how it honours Foundation's CSS class contract.
2. Which Implementation level (platform, Aria, CDK, custom) it lands on, per the building-blocks map, and what a prototype must prove if the map flagged a risk. If a question cannot be settled from sources, write the precise prototype question under `## Prototype needed` in the answer so the orchestrator can create a prototype ticket; do not guess.
3. The ARIA pattern, roles, attributes, and keyboard table.
4. Every input (from Foundation's `data-*` options), its type, default, and whether it is `input()` or `model()`; every output (from Foundation's events); public methods if any.
5. State model in signals; zoneless behaviour; and the rendering-modes contract from `research/angular-rendering-modes.md` and ADR 0008: server render output and first-paint state, what must not run before hydration, full and incremental hydration (`@defer (hydrate on ...)`) boundaries, prerendering, event replay readiness (which listeners replay, and `preventDefault()` ordering), and behaviour inside `@defer` blocks.
6. Animation and reduced-motion behaviour.
7. Foundation behaviours dropped or changed, with the reason.
8. Testing seams, per the map's Testing rule and the testing section of `building-blocks.md`: story play functions (Storybook on `@storybook/angular-vite` with `@storybook/addon-vitest`), browser-level tests (the stack is set by the browser testing stack decision ticket; write them stack-neutral until it resolves), node-level Vitest (a server-render smoke test and pure logic), and Playwright e2e (web-native APIs, the static Storybook build, and the prerendered fixture app for hydration and pre-hydration clicks), in the spec's Testing Decisions.

Plugin-specific questions:

- `stickyOn`, `anchor`, `topAnchor`, `btmAnchor`, `marginTop`, `marginBottom`, `stickTo`, `stickyClass`, `containerClass`, `dynamicHeight`, `checkEvery`.
- CSS `position: sticky` with the `.sticky-container` markup versus a JavaScript directive using IntersectionObserver or ScrollDispatcher; which Foundation behaviours (anchored start and end, bottom sticking) CSS cannot express.
- Breakpoint gating via media or container queries.
- Whether this earns a directive at all, or a spec that says "CSS plus a small class-toggling directive".

Two guards from the research-wave audit (`audits/0001-research-wave.md`, findings H6 and M12):

- The option names in the plugin-specific questions above were written while charting, before the inventories existed, and some are wrong or missing. Take the option, event, and method list from the Foundation inventory research and Foundation's own `defaults` object in the plugin source, not from this ticket.
- Platform features outside the map's browser target (see `research/web-platform-features.md`; for example `popover`, CSS anchor positioning, `<details name>`, `interpolate-size`, `@starting-style`, `:has()`, invoker commands) may appear only as a named future upgrade or behind a stated fallback, as the building-blocks decision already ruled.

Use the glossary's vocabulary. Add glossary terms to `CONTEXT.md` and ADRs to `adr/` only when the domain-modeling bar is met. The ticket answer holds the decision log (each question and the answer chosen, with its source); the spec holds the synthesis.

## Answer

Gist: two directives on Foundation's markup. `[nfsSticky]` adds `.sticky`, binds the em inset as an inline `top` or `bottom`, and reflects the canonical `stickyOn` query as `data-nfs-sticky-on`; the `nfs-sticky` Library mixin makes `.sticky` `position: sticky` above that breakpoint with Foundation's `breakpoint()`, so the element sticks correctly from server HTML at every width. After the first render the directive measures the host against the stick line of its real scroll container (sentinels plus `IntersectionObserver`, a rAF-throttled scroll backstop, `ResizeObserver`) and exposes `isStuck` and `edge`, the four State classes, and the `stuck`/`unstuck` Completion outputs with the edge. `[nfsStickyContainer]` adds `.sticky-container`. The Sticky range is the parent box, so the anchor Options are Dropped options with a recipe. Spec: [specs/sticky.md](../specs/sticky.md).

### Decision log

Self-grilling in rounds; each entry gives the question, the answer taken, and its sources. "BB" is `building-blocks.md`, "P48" the [Prototype: CSS `position: sticky` with IntersectionObserver sentinels for Sticky](48-prototype-sticky-css.md) answer and README, "INV" the Sticky section of `research/foundation-inventory-positioned.md`.

Round 1: shape and level

1. Directive or component, and on which markup? Two attribute directives: `[nfsSticky]` on the sticky element (adds `.sticky`, because Foundation's title-bar example relies on the Plugin adding it) and `[nfsStickyContainer]` on the `[data-sticky-container]` element (adds `.sticky-container`). The container directive is class-only; it is kept because ADR 0001 names the sticky container as a consumer-written element with a directive, and writing the class instead is documented as equivalent. Sources: BB 1.1, Table A; ADR 0001; INV 2; foundation-api-design skill (one directive per structural class).
2. Does Sticky earn a directive at all, or only CSS? A directive: CSS gives the pinning, but Foundation's State classes and events need code; container scroll-state queries, the only CSS route to the stuck state, are Chromium-only (webstatus.dev, Baseline limited on 2026-09-26). Sources: `research/web-platform-features.md` 8, 11; P48.
3. Implementation level? Native platform (`position: sticky`, `IntersectionObserver`, `ResizeObserver`) plus a thin custom directive; no Aria pattern exists; CDK `ScrollDispatcher`/`ViewportRuler` rejected (RxJS, 20 ms audit, only registered `cdkScrollable` containers). Fallback: the scroll backstop alone (Foundation's `checkEvery: 0`); no JavaScript positioning fallback is needed because `position: sticky` is in target. Sources: BB 1.2; `research/angular-cdk-inventory.md` scrolling; `research/angular-aria-inventory.md`.
4. CSS `position: sticky` or a JavaScript `position: fixed` emulation? Native sticky; the range is the containing block (the parent). Foundation's default range is the whole document, so the parent must span the page for that; Foundation's own title-bar markup does not stick as written. Sources: P48 verdict; INV 3 range computation (`topAnchor ''` means 1 px, `btmAnchor ''` means the scroll height); proposed ADR below.

Round 2: Options (all twelve keys of `Sticky.defaults`, per audit 0001 H6)

5. `stickTo`: `input<'top' | 'bottom'>`, default `'top'`. `'bottom'` reproduces Foundation's range when the element is its container's last child (`'top'`: first child); documented. Sources: `Sticky.defaults`; INV 3 `_setBreakPoints`; P48 `case-stick-bottom`.
6. `marginTop`/`marginBottom`: `input()` with `numberAttribute`, default `1`, in em, bound as the inline sticky inset on the active edge; the unused edge is bound `auto` to cancel Foundation's `bottom: 0` class rules. Deltas: em resolves against the element's font size (Foundation's `emCalc` used the body's); no margin is applied, so no layout jump. Sources: `foundation.sticky.js` `emCalc`, `_setSticky`, `_removeSticky`; `_sticky.scss`; P48 `case-margin-em`.
7. `stickyOn`: `input()` Breakpoint query, default `'medium'`, the full `is()` grammar. Gate in CSS (decision 13); class contract through `canStick = computed(() => mq.is(this.stickyOn()))`, the Breakpoint service spec's own example. Sources: `specs/breakpoint-service.md` API and consumers table.
8. `anchor`, `topAnchor`, `btmAnchor`: Dropped options, not no-op inputs. This settles P48's second OPEN FOR HUMAN from the rules: BB 1.4 turns an Option into an input when the library carries its behaviour; an input that is never read makes a promise the directive cannot keep, while leaving it out makes a bound value a compile error. Recipe: size or place the parent to span the range; development warning 4 flags leftover `data-anchor`/`data-top-anchor`/`data-btm-anchor` attributes. Sources: P48 `case-anchor-container-match`, `case-anchor-outside`; BB 1.4; BB 1.10 ("a role is a promise", applied by analogy).
9. `container`, `stickyClass`, `containerClass`: Dropped options (HTML-string and class-name Options). Sources: BB 1.4; BB 1.1 (no generated structure).
10. `dynamicHeight`: Dropped; `ResizeObserver` on host and parent always follows sizes. `checkEvery`: Dropped; replaced by the always-on rAF-throttled passive scroll backstop while the gate is open. Sources: BB 1.4; P48 "IntersectionObserver correctness gap".

Round 3: state, outputs, DI

11. State signals? `isStuck` (read-only `computed`, BB 1.3 `isX` rule) and `edge: Signal<'top' | 'bottom'>` (the edge stuck to, or the end of the range rested at). No `isAtTop`/`isAtBottom`/`isAnchored`: all four State classes derive from the two. Sources: BB 1.3, 1.4; audit 0002 M6.
12. Outputs? `stuck` (payload: the edge stuck to, Foundation's `stuckto:<stickTo>`) and `unstuck` (payload: the end now rested at, Foundation's `unstuckfrom:<end>`), one per transition, emitted after the signals are written; the first measurement emits only when it differs from the server state (`is-anchored is-at-top`); closing the gate while stuck emits `unstuck('top')`, Foundation's behaviour below `stickyOn`. No init, destroyed, or pause outputs. Sources: BB 1.4 event mapping; `_removeSticky(isTop)`; INV 4.
13. Where does the `stickyOn` gate live? In CSS: `nfs-sticky` emits `position: sticky` for `.sticky[data-nfs-sticky-on='<query>']` inside Foundation's `breakpoint(<name>)`, `breakpoint(<name> only)`, and `breakpoint(<name> down)` for each name in the consumer's `$breakpoints`, plus an `all` rule. Rejected: BB Table A's inline `position` from `NfsMediaQuery`, because with the default Server breakpoint (`small`) and the default `stickyOn` (`medium`) the server HTML would be static, contradicting BB Table B and 1.11 decision 7 ("fully functional as dehydrated HTML") and the Breakpoint service spec's rule that first-paint behaviour differing per breakpoint lives in CSS. The rule is built with Foundation's `breakpoint()`, as BB 1.11 decision 8 allows, so it copies no Breakpoint map. The attribute is `data-nfs-sticky-on`, not Foundation's `data-sticky-on`, so a leftover static attribute never collides with the dynamic binding (in Angular a dynamic host binding beats a static attribute). Sources: BB 1.11 decisions 7 and 8; ADR 0014 Consequences; `specs/breakpoint-service.md` Rendering modes (`hydrate never`); Foundation's `breakpoint()` mixin; angular-developer `host-elements.md` (binding collisions).
14. Parent token? None: nothing injects a Sticky parent, and the range is the DOM parent, which DI cannot answer. `nfsStickyDefaultsToken` (Shape B) seeds `stickTo`, `marginTop`, `marginBottom`, `stickyOn`. `exportAs: 'nfsSticky'`. No methods. Sources: BB 1.4 defaults rule, 1.9; `research/di-and-composition-patterns.md` 5.

Round 4: measurement (P48's decision plus refinements)

15. Sentinels created where and how? In the first render callback's `write` phase: two 1 px `span`s, `aria-hidden="true"`, absolutely positioned at the parent's top and bottom (Foundation's `.sticky-container { position: relative }`), appended as the parent's last children, removed on destroy. Refinement of P48 (in-flow spans inserted first and last): no 2 px container growth, no extra flex or grid items, and no node inserted ahead of views hydration has yet to claim. Development warning 1 when the parent is not positioned. Sources: P48 `nfs-sticky.ts` `#createSentinel`; `_sticky.scss`; `research/angular-rendering-modes.md` 2.
16. How is the state computed? One pure function of the host rectangle, the scroll container rectangle, the computed inset in px, `stickTo`, and `canStick` (stuck when the host sits within 1 px of the stick line); the sentinels' observers and the scroll backstop only schedule it. Refinement of P48 (state from sentinel geometry with thresholds computed once at setup): independent of container padding and child order, follows height changes, and testable at node level. Sources: P48 README; BB 1.5 (measure in render callbacks).
17. Which scroll container? The nearest ancestor whose computed `overflow` is neither `visible` nor `clip` in either axis (`body` and the root count as the viewport), used as observer root and listener target. The classes then agree with the pixels inside `overflow: auto` panels and report not stuck under an `overflow: hidden` wrapper, instead of P48's misleading "stuck". This settles P48's first OPEN FOR HUMAN: the walk is needed for correctness anyway, runs once per instance, and the `overflow: hidden` warning (development warning 3, suggesting `overflow: clip`, Baseline widely available 2025-03-12 with Chrome 90, Firefox 81, Safari 16 per webstatus.dev `overflow-clip`, so in target) is development-only. Sources: P48 `case-overflow-hidden`; `research/web-platform-features.md` 8; MDN `overflow` (`clip` creates no scroll container).
18. Observer lifecycle and zones? An `afterRenderEffect` keyed on `canStick`, `stickTo`, the margins, and the measured host height builds and tears down the observers and the listener (torn down while the gate is closed); listeners and observers are created in `NgZone.runOutsideAngular`; state lives in signals. Sources: BB 1.5, 1.11 decision 4; angular-developer `effects.md`.
19. Development warnings? Five, `ngDevMode` only, once per instance: parent not positioned; degenerate range (parent no taller than the element, as in Foundation's title-bar markup); `overflow: hidden` scroll container; leftover anchor attributes; focused element hidden under a stuck element (decision 22). Sources: BB 1.5, 1.9 development-warning pattern; P48 OPEN FOR HUMAN items.

Round 5: accessibility (WCAG 2.2 AA, user rule restated 2026-09-26)

20. ARIA and keyboard? None: no APG pattern, no role, no keys, no focus moves; DOM and tab order unchanged; landmarks are the consumer's markup (`nav` with a unique `aria-label` when there are several). Sources: `research/aria-apg-patterns.md` Sticky and landmark notes.
21. Axe gate: every story runs axe through `@storybook/addon-a11y` with `parameters.a11y.test = 'error'` and the WCAG 2.2 AA rule set (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`). Source: BB 1.10.
22. 2.4.11 Focus Not Obscured (Minimum), a requirement: a stuck element that can overlap focusable content requires `scroll-padding-top` (or `scroll-padding-bottom`) on its scroll container of at least its height plus its inset. The library cannot compute it (the overlap is page-specific, and several stuck elements can share one scroll container), so it checks: development warning 5 (a newly focused element entirely inside a stuck element's rectangle, checked one frame after `focusin`, development builds only, only while stuck) and a Playwright Tab sweep. Rejected: the directive writing `scroll-padding` itself (a global several instances would fight over). Sources: WCAG 2.2 SC 2.4.11; BB 1.9 (globals).
23. 1.4.3 Contrast (Minimum), a requirement: a stuck element overlapping content has an opaque background. Foundation's `.title-bar` and `.top-bar` have one (`$titlebar-background`, `$topbar-background`); `.sticky` has none and the library cannot choose a color, so it is a documented requirement and every overlapping story sets one.
24. 1.4.10 Reflow: `width: auto` on `.sticky.is-stuck` (Foundation's `width: 100%` plus horizontal margins overflows); the default `stickyOn: 'medium'` keeps small viewports, 400% zoom included, free of pinned elements; an e2e case at 320 px checks it. 1.4.4 Resize Text: insets in em. 2.4.7 Focus Visible: unchanged, the directive adds no focusable element. 2.5.8 Target Size, 2.5.7 Dragging Movements, 1.4.11 Non-text Contrast: not applicable (no target, no drag, no user-interface component; the sentinels are 1 px, `pointer-events: none`, and hidden from assistive technology).

Round 6: animation, rendering modes, Sass, testing

25. Animation? None (Foundation has none); consumer transitions on `.is-stuck` are allowed and nothing waits for them; Foundation's `transitionend` re-measure is dropped. Sources: INV 8; ADR 0003.
26. Rendering modes? Server HTML carries `.sticky`, `.is-anchored`, `.is-at-top`, the gate attribute, and the inset, and sticks at every width through CSS; no host binding reads the Breakpoint service, so nothing changes at hydration; nothing runs before hydration; no listeners that replay and no `jsaction`; works inside any `@defer` block and sticks in `hydrate never` with classes frozen at `is-anchored is-at-top`; no Hydration boundary constraint; prerendering identical. Sources: ADR 0008; BB 1.11; `research/angular-rendering-modes.md` 7 and its Sticky checklist row; ADR 0014.
27. Sass? `foundation-sticky` reused untouched; `nfs-sticky` emits the gate rules and `.sticky.is-stuck { width: auto }`, reusing `$breakpoints` and `breakpoint()`, with no parameters, no custom properties, and no Motion classes. The inset and the sentinels' styles are inline. Sources: ADR 0012; BB 1.13; the [Sass packaging for the new library](57-sass-packaging.md) answer; `_sticky.scss`.
28. Testing seams? Story ids `sticky--basic`, `sticky--stick-to-bottom`, `sticky--margins`, `sticky--sticky-on`, `sticky--navigation`, `sticky--anchor-range-recipe`, `sticky--scroll-container`, `sticky--overflow-hidden-ancestor`, `sticky--outputs`; browser-level tests stack-neutral; node-level pure-function tables, the SSR smoke through the helper from the [Prototype: Rendering-mode test seam](59-prototype-rendering-mode-test-seam.md), and a Sass compile test with a custom `$breakpoints`; Playwright viewport sweep, real wheel and key scrolling (which P48 did not cover), hash jump, and the 2.4.11 and 1.4.10 cases on the static Storybook build, plus JavaScript-disabled, reload mid-range, `hydrate on viewport`, and `hydrate never` cases on the prerendered fixture app. Source: BB 1.12.
29. Material comparison? Material has no sticky component; CDK and Material tables use native `position: sticky` with inline offsets (`StickyStyler`) and expose no stuck state; nothing else to borrow. Sources: `research/angular-material-reference.md` 9; `src/cdk/table/sticky-styler.ts` in the components clone.
30. Future platform feature? Container scroll-state queries for stuck styling when in target; the directive would keep only the signals and outputs. Source: `research/web-platform-features.md` 11.

### OPEN FOR HUMAN

None. P48's two OPEN FOR HUMAN items were settled from the building-blocks rules (decisions 8 and 17).

## Prototype needed

Prototype: Sticky measurement refinements. Question: do the spec's refinements of the P48 mechanism hold in Chromium, Firefox, and WebKit, from server HTML and after hydration?

1. Absolutely positioned sentinels appended at the end of `.sticky-container` leave the container's size unchanged and still schedule measurements at the range edges, including in a flex or grid container and with container padding.
2. The state derived from the host rectangle against the stick line (1 px tolerance) matches the pinned geometry at every step of P48's seven cases, with real wheel and keyboard scrolling as well as `scrollTo` jumps.
3. With the nearest scroll container as observer root and listener target: inside an `overflow: auto` panel the element sticks and reports `is-stuck`; inside an `overflow: hidden` `.off-canvas-wrapper` it reports never stuck; with `overflow: clip` on `.off-canvas-wrapper` in Foundation's own OffCanvas layout (push and overlap, open and closed) it sticks to the window and the off-canvas panels stay clipped.
4. The CSS gate keyed on `data-nfs-sticky-on`, built with Foundation's `breakpoint()`, switches at exactly the widths where `NfsMediaQuery.is()` switches, for `medium`, `large only`, and `medium down`.
5. `scroll-padding-top` on the scroll container (the 2.4.11 recipe) does not move the sticky line in any engine.
6. Appending the sentinels to a container that also holds a sibling `@defer (hydrate on interaction)` block that has not hydrated yet leaves that block's later hydration free of NG05xx.

Default assumed by the spec: all six hold. If 2 fails, the state falls back to P48's sentinel-geometry thresholds, recomputed on every `ResizeObserver` callback; if `overflow: clip` in 3 breaks OffCanvas, the recipe becomes a documented limit for Sticky inside OffCanvas; if 5 fails, the stick line adds the scroll container's `scroll-padding`.

### Proposed glossary terms

```md
**Sticky range**:
The stretch of scrolling during which a Sticky element can be stuck: the box of its parent element (the sticky container), which is its containing block; the replacement for Foundation's anchor Options.
_Avoid_: anchor range, sticky zone, scroll range
```

Proposed refinement of an existing term (the anchor Options are dropped because the platform cannot honour them, not because of jQuery):

```md
**Dropped option**:
An Option with no counterpart in the library, because it exists only for jQuery or HTML-string injection, or because the platform mechanism the library uses cannot honour it (Sticky's anchors).
_Avoid_: unsupported option, removed feature, legacy option
```

### Proposed ADR

[adr/0019-sticky-native-range.md](../adr/0019-sticky-native-range.md): Sticky is native `position: sticky`, its range is the parent element, and its breakpoint gate is CSS. It meets the bar: hard to reverse (a move to a `position: fixed` emulation changes the directive, the classes' meaning, and the server paint), surprising without context (Foundation users expect anchors and a document-long default range, and Foundation's own title-bar markup stops sticking), and the result of a real trade-off (emulation with anchors versus a correct first paint).

### Proposed building-blocks changes

1. Table A, Sticky row: replace "`stickyOn` via `NfsMediaQuery` toggling `position: static`" with "`stickyOn` gate in the `nfs-sticky` Library mixin (`position: sticky` on `.sticky[data-nfs-sticky-on]` inside Foundation's `breakpoint()`), `NfsMediaQuery.is(stickyOn)` for the class contract"; primitives: "`position: sticky`, absolutely positioned sentinels appended to the container, `IntersectionObserver` on the nearest scroll container, rAF-throttled scroll backstop, `ResizeObserver` on host and container, `NfsMediaQuery`". Reason: decision 13; the current text makes the default server HTML non-sticky, which contradicts Table B.
2. Table B, Sticky row: DI shape "`nfsStickyDefaultsToken`; no parent token (nothing injects one); `isStuck` and `edge` signals; `stuck`/`unstuck` outputs with the edge"; rendering cell "`stickyOn` is CSS, so the server HTML sticks at every width and nothing changes at hydration" instead of "`stickyOn` renders the `serverBreakpoint` state"; open-risk cell: settled by P48 plus the refinement prototype above. Reason: decisions 13 and 14.
3. 1.4, Dropped options list: add `anchor`, `topAnchor`, `btmAnchor` with the reason "the platform mechanism cannot honour them; the Sticky spec gives a recipe". 1.4's Sticky sentence: add the `edge` signal next to `isStuck`. Reason: decisions 8 and 11.
4. 1.13, last sentence: "never a per-plugin rule" reads as forbidding Sticky's gate; change to "never a per-plugin copy of the Breakpoint map; a per-plugin media rule built with Foundation's `breakpoint()` is allowed under 1.11 decision 8". Reason: decision 13.
5. Table B, OffCanvas row, open risks: add "whether `nfs-off-canvas` should set `overflow: clip` on `.off-canvas-wrapper` so Sticky works inside OffCanvas (checked by the Sticky measurement refinements prototype)". Reason: decision 17; Foundation's `overflow: hidden` wrapper is the known clash.
6. 1.10: add "Elements that can cover content (Sticky): WCAG 2.4.11 is met by required consumer `scroll-padding`, checked by a development warning and an e2e case". Reason: decision 22.

Orchestrator, 2026-09-26: the [Prototype: Sticky measurement refinements](63-prototype-sticky-measurement.md) confirmed all six assumptions in Chromium, Firefox, and WebKit (147 of 147 cases), so no fallback applies and the spec stands. Its one refinement, measuring the stick line from the scroll container's padding box rather than its border box so a bordered `overflow` ancestor does not shift the class contract by the border width, is folded into the spec's "How the class contract is measured" paragraph.
