# 17. Spec: Toggler

Type: grilling
Status: resolved
Blocked by: 14, 38, 47, 54
Labels: wayfinder:grilling
Map: ../map.md

## Question

What is the Angular design for Foundation's Toggler plugin in the next library, and what does its spec say?

The result must be the best combination of: Foundation for Sites SCSS and the plugin's features; the ARIA APG pattern and WAI-ARIA; WHATWG HTML and HTML5+ platform features; Angular Aria; Angular CDK; Angular Material-equivalent accessibility and Material-equivalent component API (inputs, outputs, public properties and methods, content and view projection) for the similar Material component; and the modern DI patterns recorded in `research/di-and-composition-patterns.md` (lightweight injection tokens, host-scoped providers, host directives, parent tokens, default-options tokens). One plugin may yield several related directives or components (for example a container plus items plus a lazy-content directive); the spec covers the whole set.

Read first: `building-blocks.md`, `CONTEXT.md`, `adr/*.md`, the research files `research/foundation-inventory-disclosure.md`, `research/foundation-utilities-conventions.md`, `research/aria-apg-patterns.md`, `research/web-platform-features.md`, `research/di-and-composition-patterns.md`, `research/angular-rendering-modes.md`, and the resolved answers of every prototype and shared-utility spec ticket this ticket is blocked by. Zoom into the resolved tickets they came from when a claim needs its source. Consult the `/angular-developer:angular-developer` skill (its references live under `~/.claude/plugins/cache/angular-skills/angular-developer/*/references/`, including `signal-forms.md`, `angular-aria.md`, `naming-conventions.md`, `host-elements.md`) and the repo skill at `.claude/skills/foundation-api-design/SKILL.md` for the API design document shape. Where that skill says to read `COMPONENT_BUILDING_BLOCKS.md` or the old `*_API_DESIGN.md` files, read `building-blocks.md` from this effort instead.

Run `/grill-with-docs` (self-grilling, both sides) over these questions, then publish the spec with `/to-spec` to `specs/toggler.md`. The spec is a `/to-spec` spec: its top-level sections are exactly the to-spec template (Problem Statement, Solution, User Stories, Implementation Decisions, Testing Decisions, Out of Scope, Further Notes). The foundation-api-design material lives inside those sections as subsections: under Implementation Decisions put the CSS class to Angular mapping table, the directive or component hierarchy, the proposed API per directive or component (inputs, outputs, model signals, public methods, projection slots, DI tokens), the ARIA requirements table, the keyboard table, the rendered HTML structure, and the comparison with the Material counterpart; under Further Notes put usage examples and the design decisions table. Prose describes the API; short type-level signatures are allowed where prose would be less precise, and no file paths.

1. Directive or component, and the element or markup it attaches to; how it honours Foundation's CSS class contract.
2. Which implementation rung (platform, Aria, CDK, custom) it lands on, per the building-blocks map, and what a prototype must prove if the map flagged a risk. If a question cannot be settled from sources, write the precise prototype question under `## Prototype needed` in the answer so the orchestrator can create a prototype ticket; do not guess.
3. The ARIA pattern, roles, attributes, and keyboard table.
4. Every input (from Foundation's `data-*` options), its type, default, and whether it is `input()` or `model()`; every output (from Foundation's events); public methods if any.
5. State model in signals; zoneless behaviour; and the rendering-modes contract from `research/angular-rendering-modes.md` and ADR 0008: server render output and first-paint state, what must not run before hydration, full and incremental hydration (`@defer (hydrate on ...)`) boundaries, prerendering, event replay readiness (which listeners replay, and `preventDefault()` ordering), and behaviour inside `@defer` blocks.
6. Animation and reduced-motion behaviour.
7. Foundation behaviours dropped or changed, with the reason.
8. Testing seams, per the map's Testing rule and the testing section of `building-blocks.md`: story play functions (Storybook on `@storybook/angular-vite` with `@storybook/addon-vitest`), browser-level tests (the stack is set by the browser testing stack decision ticket; write them stack-neutral until it resolves), node-level Vitest (a server-render smoke test and pure logic), and Playwright e2e (web-native APIs, the static Storybook build, and the prerendered fixture app for hydration and pre-hydration clicks), in the spec's Testing Decisions.

Plugin-specific questions:

- `data-toggler` (class toggle) versus `data-animate` (Motion UI in and out) versus `data-toggle-focus`; is this one directive or two?
- Relationship to Triggers (`data-toggle` on the trigger, `data-toggler` on the target): the building-blocks Triggers decision applies.
- Disclosure pattern: `aria-expanded` and `aria-controls` on the trigger; `popover` is not the right tool, but say why.
- Does `<details>` cover the common case?

Two guards from the research-wave audit (`audits/0001-research-wave.md`, findings H6 and M12):

- The option names in the plugin-specific questions above were written while charting, before the inventories existed, and some are wrong or missing. Take the option, event, and method list from the Foundation inventory research and Foundation's own `defaults` object in the plugin source, not from this ticket.
- Platform features outside the map's browser target (see `research/web-platform-features.md`; for example `popover`, CSS anchor positioning, `<details name>`, `interpolate-size`, `@starting-style`, `:has()`, invoker commands) may appear only as a named future upgrade or behind a stated fallback, as the building-blocks decision already ruled.

Use the glossary's vocabulary. Add glossary terms to `CONTEXT.md` and ADRs to `adr/` only when the domain-modeling bar is met. The ticket answer holds the decision log (each question and the answer chosen, with its source); the spec holds the synthesis.

## Answer

Spec: [specs/toggler.md](../specs/toggler.md). Resolved 2026-09-26 by self-grilling (AFK), both sides played against the sources below.

Gist: two attribute directives behind one `nfsToggler` attribute, partitioned by the presence of `toggler`. `NfsToggler` (`[nfsToggler]:not([toggler])`, visibility mode) shows and hides its host with the `hidden` attribute plus Foundation's `.is-hidden` class, optionally animated with keyframe Motion classes from `animate`; its state is the `isOpen` model (default open unless the static markup carries `hidden` or `.is-hidden`), it emits `opened`/`closed` after the animation, and its Trigger role is `disclosure`. `NfsClassToggler` (`[nfsToggler][toggler]`, class mode) adds and removes the `toggler` class(es); its state is the `active` model (seeded from the static `class`), `isOpen` is a read-only mirror for the Openable contract, and its Trigger role is `toggle-button`, so `nfsToggle` renders `aria-pressed`. Both export `nfsToggler`, provide `nfsOpenableToken`, and implement `open(trigger?)`/`close(result?)`/`toggle(trigger?)`; `nfsTogglerDefaultsToken` carries an `animate` default. The target animates through bound classes and CSS keyframes only (no `animate.enter`), completes on the measured longest animation, and nothing animates at hydration. No library CSS. Implementation level: native platform (`hidden`, class bindings, CSS keyframes) with thin custom directives; Aria and CDK have no pattern (`_IdGenerator` only).

### Decision log

Sources: FS = the Foundation 6.9.0 clone; NG = the Angular 22.2.x clone; NGC = the components 22.2.x clone; APG = the aria-practices clone; R:x = the research files by short name as `building-blocks.md` cites them; BB = `building-blocks.md`; TS = `specs/triggers.md` and its ticket; P47 and P52 = the two animation prototype tickets.

Round 1 (no prerequisites): the Foundation contract and what is settled.

1. **What are Toggler's real options, events, and methods?** `Toggler.defaults = {toggler: undefined, animate: false}`; events `on.zf.toggler`/`off.zf.toggler` (plus base `init`/`destroyed`); method `toggle()`; listens to `toggle.zf.trigger` only; fires `mutateme.zf.trigger` on `[data-mutate]` descendants. The ticket's `allowAllClosed` and `data-toggle-focus` are not Toggler options (audit 0001 H6). Source: FS `js/foundation.toggler.js:23-172`; R:disclosure Toggler.
2. **How do the modes and initial state work in Foundation?** `animate` wins over `toggler`; with neither, it throws. Class mode seeds from `hasClass`, animate mode from `:hidden`; `Motion.animateIn/Out` adds the class, runs the two-frame `mui-enter`/`-active` protocol, waits for `transitionend`, then jQuery `hide()`/`show()`. With only an in-class, `animationOut` is `null` and the close waits for a `transitionend` that never fires. Source: FS `foundation.toggler.js:46-64, 95-139`; `foundation.util.motion.js:54-100`.
3. **What does BB already settle?** Directive on the target; class mode from `toggler`, visibility from `animate` or none; `hidden` host binding; State class keyframes from `animate` with `hidden` after `animationend`; `isOpen` model in visibility mode, `active` in class mode (BB 1.4, audit 0002 M6); `on/off.zf.toggler` to `activeChange` or `opened`/`closed` (BB 1.4); Trigger roles `disclosure`/`toggle-button` (BB Table B, TS decision 16); `data-toggle-focus` dropped (BB 1.4); `data-closable` replacement is a visibility-mode Toggler with a bare `nfsClose` (BB 1.8); `<details>` not used (BB Table A); no hydration prototype needed because the target animates through a State class (audit 0002 M1; P52). Source: BB 1.3, 1.4, 1.6, 1.8, 1.11, Tables A and B.

Round 2 (depends on 1-3): shape and state.

4. **One directive or two?** Two classes, one attribute: `NfsToggler` on `[nfsToggler]:not([toggler])`, `NfsClassToggler` on `[nfsToggler][toggler]`, both `exportAs: 'nfsToggler'`. The Openable contract fixes a member `isOpen: Signal<boolean>` (TS API; ADR 0013); visibility mode's two-way state is that model, class mode's is `active` (BB 1.4) with `isOpen` as a read-only mirror, and one class cannot declare `isOpen` in both shapes; two synchronised models were rejected. The selectors partition hosts, so there is exactly one Openable per element (TS "One Openable per element"). Angular selector matching includes bound names, and `:not()` in directive selectors is established (`NgForm`). Recorded as the proposed ADR.
5. **Visibility without `animate`?** Visibility mode, instant show and hide. It replaces Foundation's `data-toggler="is-hidden"` idiom (FS `docs/pages/toggler.md` Toggle on focus), which inverted `aria-expanded`. The Foundation error for a missing class is dropped.
6. **Initial state?** From the static markup, read with `inject(new HostAttributeToken(...), {optional: true})` in field initialisers: visibility mode closed when the host has a static `hidden` attribute or `is-hidden` in its static `class`, else open; class mode active when the static `class` contains every class of the static `toggler`. Static attributes are identical on server and client, so first paint and hydration agree; without the seed, the dynamic class binding would strip a static class (NG `adev/src/content/guide/components/host-elements.md` Binding collisions: "If one value is static and the other dynamic, the dynamic value wins"). Mirrors Foundation's `hasClass`/`:hidden` at init. `HostAttributeToken` is the Button spec's mechanism. A bound value wins.
7. **Visibility default open or closed?** Open (decision 6's fallback): Foundation's unhidden element is visible, Foundation's docs panel starts visible, and the Triggers and Button specs' `data-closable` examples (an unhidden callout) depend on it. `model()` has no transform, so a static `isOpen="false"` is a type error; consumers write `hidden` or `[isOpen]="false"`.
8. **`toggler` value?** A transform strips leading dots and splits on whitespace into several classes (jQuery `toggleClass` parity; Angular class-map keys cannot hold spaces, NG `adev/src/content/guide/templates/binding.md` note on space-separated keys). Bound through a host `[class]` map, which Angular merges with static and other class bindings (same guide).
9. **Which state members and outputs?** `NfsToggler`: `isOpen` model (`isOpenChange` at request time), `opened`/`closed` Completion outputs. `NfsClassToggler`: `active` model (`activeChange` is Foundation's `on/off`), read-only `isOpen`, no Completion outputs (class mode has no animation). Item-level outputs are `void` (BB 1.4).
10. **Openable members?** `id` is an `input()` defaulting to `_IdGenerator` `nfs-toggler-` and bound as `[attr.id]`, Aria's shape (NGC `src/aria/accordion/accordion-panel.ts:53, 71`); a static `id` sets it. `triggerRole` is a constant signal per class. `open(trigger?)` records the trigger for focus return; `close(result?)` ignores `result`; `toggle`. No `registerTrigger` (nothing needs it).
11. **Tokens?** `nfsOpenableToken` with `useExisting`; no `nfsTogglerToken`, because no child injects the Toggler (BB Table B listed one); `nfsTogglerDefaultsToken` Shape B with `{animate?: string}` only, because a default `toggler` would have to change which directive matches (BB 1.4 defaults rule, 1.9).

Round 3 (depends on 4-11): hiding, ARIA, focus.

12. **How is the element hidden?** `hidden` attribute plus Foundation's `.is-hidden` class. Foundation's normalize prints `[hidden] { display: none }` (specificity of one attribute) inside `foundation-global-styles`, before component CSS, so `.menu { display: flex }` and `.thumbnail { display: inline-block }` win over it; Foundation's docs toggle both a `.menu` and `img.thumbnail`. `.is-hidden { display: none !important }` is Foundation's own class. `hidden` keeps the semantics without CSS. No `inert` or `aria-hidden` (BB 1.10: `display: none` already removes it). Source: FS `scss/vendor/normalize.scss:279-281`, `scss/_global.scss:140-141, 254-256`, `scss/components/_menu.scss:64`, `scss/components/_thumbnail.scss:35`.
13. **ARIA per mode?** Visibility: disclosure, Trigger `aria-expanded` plus `aria-controls` (APG disclosure pattern). Class: toggle button, `aria-pressed`, no `aria-expanded` ("`aria-expanded` would be wrong here because nothing is expanded", R:apg Toggler; APG button pattern: the label must not change with state). The target carries no role. Rendered by Triggers (TS ARIA table).
14. **Class mode used for visibility?** Dev warning when `toggler` is a Foundation visibility class (`is-hidden`, `hide`, `invisible`): "use visibility mode". No role override input (OPEN FOR HUMAN 1).
15. **Keyboard?** None on the target; native Trigger buttons (TS decision 21). No Escape: the APG disclosure pattern has none. Content shown on focus must close on Escape (WCAG 1.4.13, R:apg Toggler), so the `data-toggle-focus` replacement includes `(keydown.escape)`.
16. **Focus?** Opening keeps focus on the trigger (APG button: focus remains when activation does not dismiss the context). When `close()`/`toggle()` closes while focus is inside, the directive records it before the state change and, in the render callback after hiding, focuses the recorded opener if connected; otherwise focus is the consumer's in `closed` (TS "Requirements every Openable spec inherits"; R:apg Toggler focus persistence). Model-driven closes move no focus.

Round 4 (depends on 12-16): animation and completion.

17. **Mechanism?** State class keyframes on the persistent host, never `animate.enter`/`animate.leave`: `animate.enter` plays again at hydration on server-rendered elements (P52 verdict), and the keyframe path works in three engines (P47). A `linkedSignal` derived from `isOpen` holds the phase (idle, entering, leaving), starts idle (so nothing animates on first render or hydration), and resets to idle on completion (BB 1.4 `linkedSignal`). `hidden`/`.is-hidden` are bound from `!isOpen() && phase !== 'leaving'`. Source: ADR 0003; BB 1.6 rules 1 and 7; BB 1.11 decision 10.
18. **Completion and the fallback timer?** After the class is bound, an `afterRenderEffect` read phase reads the host's computed `animation-*` lists and takes the longest finite animation; none means complete at once; otherwise complete on `animationend`/`animationcancel` for that name with `event.target === host`, or on a timer of the measured length plus 100 ms outside the zone. Angular determines the longest animation the same way for `animate.leave` (NG `packages/core/src/animation/longest_animation.ts:91-131`). This refines BB 1.6 rule 1's "declared duration" and P47's handed rule ("a value the directive already knows at design time") for consumer-chosen Motion classes: the missing-stylesheet case P47 guards measures zero and completes at once, and a consumer's longer `nfs-motion($duration)` is not cut short. Proposed building-blocks change 4.
19. **Missing out-class, disabled animations, interruption?** A missing class for a direction, or `nfsAnimationsToken` `{disabled: true}`, skips that phase (Foundation never completed the close). Toggling mid-phase recomputes the phase; the interrupted phase emits nothing and its timer is cleared.
20. **Motion class names?** Keyframe classes only; Foundation's docs example becomes `nfs-hinge-in-from-top nfs-spin-out` (both in the `nfs-motion` set P47 confirmed). A Motion UI transition name (`/^(fade|slide|hinge|scale|spin)-(in|out)/` without `nfs-`) warns once in dev mode and is applied unchanged: the orchestrator's default at the end of P47.
21. **Reduced motion?** `nfs-motion`'s 1 ms override under `prefers-reduced-motion: reduce`; `animationend` still fires, no separate path (P47 rule 5). Consumer classes carry their own override.
22. **Completion outputs timing?** Emitted from the render callback once the phase is idle and the committed state differs from the last emitted one, so handlers see the final DOM; no emission for the initial state.

Round 5 (depends on 17-22): rendering modes, platform, tests.

23. **Server output?** `hidden`, `.is-hidden`, the toggled class, and `id` are host bindings on signals seeded from static attributes, so the server HTML is the first paint (R:rendering 7 rule 1). No Motion class in server HTML; no `jsaction` on the target (`animation*` are not replay types, R:rendering 4).
24. **Before hydration, hydration, replay?** Construction reads only `HostAttributeToken` and DI; render callbacks never run on the server (rules 3-5). Hydration changes nothing and replays no animation (phase idle on both platforms). The Trigger's `click` replays and calls `toggle()`; the animation then plays as a real change. Nothing calls `preventDefault()`. Source: R:rendering 3, 4; TS Rendering modes.
25. **Boundary and `@defer`?** Trigger and Toggler in one hydration boundary; template-reference scoping enforces half (ADR 0013). Inside `hydrate never` the target keeps its server state (closed content unreachable, stated). Plain `@defer` creates it idle, so no enter animation on block appearance. Own entry point `ngx-foundation-sites/toggler`; no `@defer` in library templates (BB 1.11 decisions 6, 7).
26. **`<details>`?** Not the base: `<summary>` must be the element's first child, so remote, multiple, or multi-target triggers and class mode are impossible, and its close animation needs `::details-content`, `interpolate-size`, or `allow-discrete`, all out of target (R:platform 4, 5, 7). Documented as the platform answer when the trigger sits directly above the content with no class contract or animation.
27. **`popover`?** `popover="manual"` is out of target (Firefox 125, R:platform 2) and puts the element in the top layer, while Toggler targets are in-flow (R:platform 2 "Toggler targets in-flow content, so a plain `hidden` toggle fits better"); floating content is a Dropdown pane. Named in Further Notes as not an upgrade path.
28. **Future platform features?** Invoker Commands with a custom `--nfs-toggle` (needs consumer ids; `command` is not replayed), `@starting-style`/`allow-discrete` for transition-based classes, `hidden="until-found"` with `beforematch` (not Baseline widely available on 2026-05-07). Source: R:platform 6, 7, 20; TS Further Notes.
29. **Material comparison?** No counterpart (R:material 12 has no Toggler row). Nearest shapes for reference: `CdkAccordionItem` alone (state model, `opened`/`closed`, three methods), `MatButtonToggle` (`aria-pressed`), `MatSidenav` reference idiom. Borrowed: method names, Completion outputs; not borrowed: promises, a wrapper, the `expanded` name.
30. **Dropped behaviour?** `mutateme.zf.trigger` (measuring plugins use `ResizeObserver`, BB Table A Equalizer), document-wide trigger discovery, the `:hidden` test, Motion's inline `display` writes, Motion UI transition classes, the missing-class error, `data-toggle-focus` and `data-closable` as attributes (TS D9, D10).
31. **Sass?** No library CSS, no `nfs-toggler` mixin; relies on `foundation-global-styles` (`[hidden]`, `.is-hidden`) and whichever export mixin styles the toggled class; Motion classes from `nfs-motion`; missing includes: no `.is-hidden` means `hidden` fails on `.menu`/`.thumbnail`, no `nfs-motion` means instant changes with outputs still firing. Per [Sass packaging for the new library](57-sass-packaging.md) and ADR 0012.
32. **Testing seams?** Eleven `toggler--<story>` stories with axe on the WCAG 2.2 AA rule set; browser-level (stack-neutral) for matching, seeding, the transform, phases, fallback paths, reduced motion, focus return, defaults, dev checks, zoneless; node-level SSR smoke and pure-function tables; Playwright e2e for three-engine keyframes and reduced motion, zero-size hidden thumbnails, JavaScript-disabled first paint, hydration counters with no `animationstart`, a pre-hydration click, a dehydrated block, and `hydrate never`. Source: BB 1.12; the [Prototype: Rendering-mode test seam](59-prototype-rendering-mode-test-seam.md) harness.

Round 6 (coordinator's restated user rule, 2026-09-26: WCAG 2.2 AA as requirements). Each criterion addressed, with the spec's WCAG table as the detail:

33. **4.1.2 Name, Role, Value:** Trigger state through `aria-expanded` (visibility) or `aria-pressed` (class), correct in server HTML and after every change, aggregate for multi-target; class-mode label unchanged (asserted in `toggler--class-mode`); the target claims no role. Passes by the Triggers' host bindings.
34. **1.3.1 Info and Relationships:** `aria-controls` from an always-present `id`.
35. **2.1.1 Keyboard:** native button Triggers (Foundation's `<a>` without `href` failed).
36. **2.4.3 Focus Order:** hidden content leaves the tab order; focus return on close from inside; the dismissible callout moves focus in `closed` (required, asserted in `toggler--closable`).
37. **2.4.7 Focus Visible:** passes on Foundation defaults: `disable-mouse-outline` and normalize remove the outline only under what-input's `[data-whatinput='mouse'|'touch']`, which the library never loads and keyboard input never sets. Source: FS `scss/util/_mixins.scss:205-210`, `scss/vendor/normalize.scss:283-291`, `scss/components/_button.scss:123`, `scss/components/_close-button.scss:100`. No rule.
38. **2.4.11 Focus Not Obscured (Minimum):** Toggler content is in-flow, so opening cannot cover the focused Trigger; the hidden-focus case is decision 36.
39. **2.5.8 Target Size (Minimum):** `.button` passes at every size (Button spec Notes). `.close-button` (`$closebutton-size` small 1.5em, medium 2em tall; glyph narrower than 24 px) passes through the spacing exception from its corner position (`$closebutton-offset-*`), checked by axe `target-size` in `toggler--closable`; where a layout breaks the exception, the consumer adds `min-width: 24px` to that `.close-button` (Foundation has no width setting; the Close Button is outside the library). Source: FS `scss/settings/_settings.scss:364-381`.
40. **1.4.13 Content on Hover or Focus:** the focus-hint usage requires `(keydown.escape)`; asserted in `toggler--focus-hint`.
41. **3.2.1 On Focus, 3.2.2 On Input:** no context change; the Toggler declares no focus or input listeners, and content changes in place on click.
42. **2.2.2 Pause, Stop, Hide:** user-started animations of 500 ms by default; nothing auto-plays.

### OPEN FOR HUMAN

1. A Trigger-role override for class mode. Default applied: none; class mode always renders `aria-pressed`, and a class that shows or hides content belongs in visibility mode (dev check 5 flags Foundation's visibility classes). The alternative is a `triggerRole` input (`'toggle-button' | 'disclosure'`) on `NfsClassToggler` for a consumer class that reveals content in a way `hidden` cannot express (for example a custom collapse class with its own transition). Sources permit both: the APG picks the pattern by what the control does, which the library cannot see in a class name.

## Prototype needed

None. The mechanisms are platform features in target or confirmed Angular behaviour: keyframe State classes completing through `animationend` with reduced motion in three engines (P47), no enter animation at hydration through State classes (P52), static-attribute injection (`HostAttributeToken`), selector matching on bound names, and computed-style measurement as Angular's own `animate.leave` does it. The e2e cases are listed for the rendering-mode test seam harness.

### Proposed glossary terms

Under "Angular side", after **Trigger role**:

**Visibility mode**:
The Toggler form that shows and hides its element, optionally with Motion classes, and whose Triggers are disclosure buttons; the replacement for `data-toggler` with `data-animate`.
_Avoid_: animate mode, disclosure mode, hide mode

**Class mode**:
The Toggler form that adds and removes a class named by `toggler` on its element, and whose Triggers are toggle buttons; the replacement for `data-toggler=".class"`.
_Avoid_: toggle-class mode, CSS mode, active mode

### Proposed ADR

[adr/0016-toggler-two-directives.md](../adr/0016-toggler-two-directives.md): "Toggler is two directive classes behind one `nfsToggler` attribute, chosen by the presence of `toggler`". It meets the bar. Hard to reverse: the public class names, selectors, and each class's members are consumer API. Surprising: one Foundation plugin becomes two classes, and the mode follows an attribute's presence. A real trade-off: an overloaded `isOpen`, two synchronised models, and a `mode` input were weighed (decision 4).

### Proposed building-blocks changes

1. Table A, Toggler row: Angular cell "`NfsToggler` on `[nfsToggler]:not([toggler])` (visibility mode, optional `animate`) and `NfsClassToggler` on `[nfsToggler][toggler]` (class mode), both `exportAs: 'nfsToggler'`; triggers `nfsToggle`/`nfsOpen`/`nfsClose`"; Level cell "Platform: `hidden` plus Foundation's `.is-hidden` for visibility mode (normalize's `[hidden]` loses to Foundation component `display` rules), class binding for class mode; `<details>` not used because the trigger may sit anywhere"; Primitives cell "`hidden` and `.is-hidden` host bindings, State class keyframes for `animate`, `HostAttributeToken` for the initial state, Openable token for triggers". Reason: decisions 4, 6, 12.
2. Table B, Toggler row: DI shape "`nfsOpenableToken` provided by each directive (`triggerRole` `disclosure` on `NfsToggler`, `toggle-button` on `NfsClassToggler`, where `nfsToggle` renders `aria-pressed`); no `nfsTogglerToken`; `nfsTogglerDefaultsToken` (`animate`)"; Animation cell add "completion on the measured longest animation (`animationend`/`animationcancel`, else measured length plus 100 ms), a missing out-class hides at once"; Rendering cell "Server output: class present or absent from `active` and `hidden`/`.is-hidden` from `isOpen`, both seeded from the static markup". Reason: decisions 6, 11, 18, 19.
3. 1.4, `model()` bullet: "`isOpen` (... ResponsiveToggle, Toggler in visibility mode ...)" and "`active` (Magellan current target, Toggler class mode, whose `NfsClassToggler` also exposes a read-only `isOpen` mirror for the Openable contract)". Reason: decision 4.
4. 1.6 rule 1: after "A fallback timer of the declared duration plus 100 ms", add "(where the Motion class is consumer-chosen, as in Toggler's `animate`, the duration is measured from the host's computed `animation-*` once the class is bound, Angular's own method for `animate.leave`, and a measured zero completes at once)". Reason: decision 18; the specs for Reveal, ResponsiveToggle, Tooltip, and Dropdown pane, which also take Motion class inputs, may want the same rule, which the consistency review can align.
5. 1.10, the hidden-content bullet: add "Where the library hides a Foundation-classed element with `hidden`, it also binds Foundation's `.is-hidden`, because normalize's `[hidden] { display: none }` loses to later Foundation component `display` rules (`.menu`, `.thumbnail`)". Reason: decision 12; applies to any spec that binds `hidden` on a Foundation-classed element.

### Other proposed shared-file changes

- `specs/triggers.md` Usage examples, the `data-toggle-focus` replacement: add `hidden` to the `#formHint` Toggler (so the hint starts hidden under this spec's initial-state rule) and `(keydown.escape)="formHint.close()"` on the input (WCAG 1.4.13, decision 40). The `nfsToggler toggler="compact"` example already matches class mode.
- CONTEXT.md: the two glossary terms above.
- Map, Decisions so far: one line for this ticket.

### Triage (auto-trap quadrant), 2026-09-26

Rule: [map](../map.md), Orchestration rules, "Triage of human-only items". Only HIGH impact with NOT-HIGH confidence stays OPEN FOR HUMAN; upstream filings and assistive-technology checks stay human-only by kind.

1. A Trigger-role override for class mode (a `triggerRole` input, `'toggle-button' | 'disclosure'`, on `NfsClassToggler`).
   - Impact: not HIGH. The default ships no input; adding one later is additive and breaks no consumer. The `triggerRole` union itself is unchanged either way (both values already exist in the Triggers contract).
   - Confidence: HIGH. The APG picks the pattern by what the control does (decision 13; `research/aria-apg-patterns.md` Toggler: `aria-expanded` is wrong when nothing is expanded), visibility mode already covers every class that shows or hides content, and development check 5 flags Foundation's visibility classes used in class mode.
   - Outcome: DECIDED: no role override; class mode always renders `aria-pressed`, and content that shows or hides belongs in visibility mode. An input can be added later if a consumer case appears.
