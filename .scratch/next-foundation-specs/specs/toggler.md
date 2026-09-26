# Spec: Toggler

Ticket: [Spec: Toggler](../issues/17-spec-toggler.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass.

## Problem Statement

A developer building an Angular application on Foundation for Sites wants to show and hide an element, or switch a class on it, from a button somewhere else on the page: a panel that appears under a "Toggle panel" button, a menu that switches to Foundation's `.expanded` layout, three thumbnails that one button hides together, a dismissible callout, a hint that appears while a field has focus. Foundation's Toggler plugin does this with `data-toggler=".class"` (switch a class) or `data-toggler data-animate="in out"` (show and hide with Motion UI), driven by `data-toggle="id"` on the trigger. That design leaves the developer with problems an Angular library must not copy:

- Foundation's docs use `<a data-toggle>` without `href`, which a keyboard cannot reach and a screen reader does not announce as a control.
- The ARIA is wrong in both modes. Toggler stamps `aria-expanded` on every trigger, also when the toggled class is a layout switch that expands nothing, and it updates the value only for triggers that name a single id, so a multi-target button keeps its first-paint value forever.
- The initial state is read from the DOM at plugin start (`hasClass`, `:hidden`), which a server render cannot do.
- The animated mode runs Motion UI's two-frame transition-class protocol through jQuery; with only an in-animation given, the close never completes, because Foundation waits for a `transitionend` that never comes.
- Toggler throws when neither `data-toggler` nor `data-animate` has a value, so hiding an element without an animation needs the `.is-hidden` class in class mode, which inverts the ARIA (`aria-expanded="true"` while the element is hidden).

A server-rendered Angular application adds a second problem: the target's shown or hidden state and its class must be right in the server HTML, hydration must not replay an animation, and a click on the trigger that arrives before hydration must still toggle the target once the page hydrates, inside dehydrated `@defer (hydrate on ...)` blocks as well.

## Solution

Two attribute directives on the element the developer wants to toggle, both written with the Foundation-like attribute `nfsToggler`, both Openables that the [Spec: Triggers (shared utility)](../issues/54-spec-triggers.md) buttons operate:

- Visibility mode (`nfsToggler` without `toggler`): the element is shown or hidden with the `hidden` attribute plus Foundation's `.is-hidden` class, optionally animated in and out with keyframe Motion classes from `animate`. Its triggers are disclosure buttons with `aria-expanded` and `aria-controls`. Its state is the `isOpen` model, and it emits `opened` and `closed` when a change is done, animation included.
- Class mode (`nfsToggler toggler="expanded"`): a class is added or removed. Its triggers are toggle buttons with `aria-pressed`. Its state is the `active` model.

The developer writes a native `<button type="button" [nfsToggle]="panel">` next to `<div nfsToggler #panel="nfsToggler" ...>`. Both modes start from what the markup says (a `hidden` attribute or `.is-hidden` class means closed; the toggled class written in `class` means active), which is the same on the server and in the browser, so the server HTML is the first paint and hydration changes nothing. The animation runs only on a state change after hydration, through a State class and CSS keyframes (ADR 0003); nothing animates at page load. No library CSS is added: the directive binds Foundation's own `.is-hidden` class and the consumer's classes.

## User Stories

1. As an application developer, I want to put `nfsToggler` on any element and `[nfsToggle]="panel"` on a button, so that the button shows and hides the element with no id strings.
2. As an application developer, I want `nfsToggler toggler="expanded"` on a Foundation `ul.menu`, so that a button switches the menu to Foundation's expanded layout as `data-toggler=".expanded"` did.
3. As an application developer migrating Foundation markup, I want `toggler=".expanded"` with the leading dot to work, so that I can copy Foundation's attribute value unchanged.
4. As an application developer, I want `animate="nfs-hinge-in-from-top nfs-spin-out"`, so that the element animates in and out with the library's keyframe versions of Foundation's Motion UI names.
5. As an application developer, I want to give only an in-animation, so that the element animates in and hides at once, instead of never hiding as Foundation's Toggler did.
6. As an application developer, I want visibility mode without `animate` to show and hide at once, so that I no longer need `data-toggler="is-hidden"` and its inverted state.
7. As an application developer, I want an element written with the `hidden` attribute, or with Foundation's `.is-hidden` class, to start closed, so that the markup states the initial state as Foundation's `:hidden` check did.
8. As an application developer, I want an element written with its toggled class already in `class` to start active, so that Foundation's `hasClass` initial state carries over.
9. As an application developer, I want `[(isOpen)]` in visibility mode and `[(active)]` in class mode, so that I can bind the state two ways like any other Angular model.
10. As an application developer, I want `opened` and `closed` outputs that fire after the animation ends, so that I can react when the element is fully shown or fully hidden.
11. As an application developer, I want `activeChange` in class mode, so that I get Foundation's `on.zf.toggler`/`off.zf.toggler` information as a typed event.
12. As an application developer, I want `open()`, `close()`, and `toggle()` on the directive, so that I can drive it from code through a template reference.
13. As an application developer, I want one button to toggle three thumbnails together with `[nfsToggle]="[thumb1, thumb2, thumb3]"`, so that Foundation's multi-target example keeps working.
14. As an application developer, I want a callout with a bare `nfsClose` inside to hide itself with a fade, so that Foundation's `data-closable` has a direct replacement.
15. As an application developer, I want a hint that shows while a field has focus through `(focus)`/`(blur)` bindings to `open()`/`close()`, so that `data-toggle-focus` has a replacement that never inverts.
16. As an application developer, I want an app-wide default for `animate` through `nfsTogglerDefaultsToken`, so that every Toggler in my app animates the same way without repeating the attribute.
17. As an application developer, I want a dev-mode warning when I pass a Motion UI transition class such as `slide-in-down`, so that I learn why nothing animates and which `nfs-` class to use.
18. As an application developer, I want a dev-mode warning when I use class mode to toggle a visibility class such as `is-hidden`, so that I switch to visibility mode and get correct ARIA.
19. As an application developer, I want a dev-mode warning when `toggler` is empty, so that a typo does not fail silently (Foundation threw).
20. As an application developer, I want a consumer-supplied `id` to be used as is, so that my own styles and links keep working.
21. As an application developer, I want a generated id when I give none, so that the trigger's `aria-controls` always names the target.
22. As a screen reader user, I want the button that shows and hides a panel to expose `aria-expanded` and `aria-controls`, so that I hear whether the panel is shown and can reach it.
23. As a screen reader user, I want the button that switches a layout class to expose `aria-pressed`, so that I hear it as a toggle button and am not told something expanded.
24. As a screen reader user, I want hidden content to be absent from the accessibility tree, so that I am not read content I cannot see.
25. As a keyboard user, I want hidden content to leave the tab order, so that focus never lands in an invisible panel.
26. As a keyboard user, I want focus to return to the button that opened a panel when I close the panel from a button inside it, so that I do not lose my place.
27. As a keyboard user, I want a dismissible callout to hand focus to my code through `closed`, so that I can move it to a sensible next element.
28. As a pointer or touch user, I want every button that toggles something to meet the WCAG 2.2 minimum target size, so that I can hit it.
29. As a keyboard user, I want to see where focus is on every toggle button, so that I know what Enter will activate.
30. As a keyboard user, I want a hint shown on focus to close on Escape while I stay in the field, so that it never blocks what I am reading.
31. As a user who prefers reduced motion, I want Toggler animations reduced to an instant change, so that nothing moves on screen.
32. As a user, I want a hidden element to stay hidden even when Foundation's CSS gives it a `display` value (`.menu`, `.thumbnail`), so that hiding works on every Foundation component.
33. As a developer of a server-rendered application, I want the server HTML to carry the `hidden` attribute, `.is-hidden`, and the toggled class exactly as the state says, so that the first paint is correct without JavaScript.
34. As a developer of a server-rendered application, I want nothing to animate when the page hydrates, so that server-rendered content does not flash or slide in.
35. As a developer of a server-rendered application, I want a click on a trigger before hydration to toggle the target once the page hydrates, so that early clicks are not lost.
36. As a developer using incremental hydration, I want a click on a trigger inside a dehydrated block to hydrate the block and toggle the target, so that deferred content works on first interaction.
37. As a developer using `@defer (hydrate never)`, I want to know what a Toggler inside keeps doing, so that I choose that block type knowingly.
38. As a developer of a prerendered site, I want the same output as server rendering, so that prerendering needs no special handling.
39. As a developer of a zoneless application, I want the Toggler to need no zone, so that it works with zoneless change detection.
40. As an application developer, I want to import the Toggler from its own entry point, so that a `@defer` block can split it with the rest of a deferred widget.
41. As an application developer, I want to know when a native `<details>` is the better tool, so that I add no directive where the platform suffices.
42. As a library maintainer, I want every behaviour asserted through roles, ARIA, attributes, and classes at the four test layers, so that regressions surface where they belong.
43. As a plugin spec author, I want the Toggler to follow the shared Openable contract exactly, so that Triggers need no Toggler-specific code.

## Implementation Decisions

### Foundation contract

Toggler 6.9 has two options, two events, one public method, and no CSS of its own (`Toggler.defaults` in the plugin source; `research/foundation-inventory-disclosure.md` Toggler).

| Foundation | Behaviour in 6.9 | Library counterpart |
| --- | --- | --- |
| `data-toggler` (option `toggler`, default `undefined`) | The attribute is both the plugin marker and the class to toggle, with or without a leading dot; throws when empty and `animate` is unset | The attribute `nfsToggler` is the marker; `toggler` is the class input and selects class mode (`NfsClassToggler`); a leading dot is stripped; empty warns in dev mode instead of throwing |
| `data-animate` (option `animate`, default `false`) | `"<in> [<out>]"` Motion UI class names; switches the plugin to visibility mode with `Motion.animateIn/Out`; wins over `toggler` when both are set | `animate` input on `NfsToggler` (visibility mode); keyframe Motion classes only; visibility mode no longer needs `animate` |
| Initial state | Class mode: `hasClass` at init; animate mode: `!$el.is(':hidden')` | Seeded from the static markup: class mode from the static `class` attribute containing the static `toggler` class; visibility mode closed when the host carries a static `hidden` attribute or `.is-hidden` in its static `class` |
| `on.zf.toggler` / `off.zf.toggler` | Fired after a class toggle, or after the animate-in / animate-out callback | Class mode: `activeChange` (the model output). Visibility mode: `opened` / `closed` Completion outputs, plus `isOpenChange` |
| `toggle()` | Class or animate path by mode | `toggle(trigger?)`, plus `open(trigger?)` and `close(result?)` from the Openable contract |
| Listens to `toggle.zf.trigger` only | `data-open`/`data-close` triggers get ARIA but do nothing | `nfsOpen`, `nfsClose`, and `nfsToggle` all work, through the Openable methods |
| ARIA on triggers | `aria-expanded` from class presence or visibility, `aria-controls` appended; updated for exact single-id triggers only | Rendered by the Triggers from the Trigger role: `disclosure` in visibility mode, `toggle-button` in class mode (ARIA and keyboard below) |
| `mutateme.zf.trigger` on `[data-mutate]` descendants after each toggle | Lets hidden Equalizers and Stickies recompute | Dropped: the library's measuring plugins use `ResizeObserver`, which fires when content is shown |
| `init.zf.toggler` / `destroyed.zf.toggler` | Base plugin lifecycle | None (Angular lifecycle) |

Dropped options and behaviours: `data-toggle-focus` (Triggers spec; replaced by `(focus)`/`(blur)` bindings), `data-closable` (Triggers spec; replaced by a visibility-mode Toggler with a bare `nfsClose`, or `@if` with `animate.leave`), Motion UI transition classes and the `mui-enter`/`mui-leave` protocol (ADR 0003), the thrown error for a missing class, `mutateme.zf.trigger`, document-wide trigger discovery by attribute selector, and jQuery `show()`/`hide()` inline `display` writes.

### CSS class to Angular mapping

Toggler has no Structural class of its own; it works on any element, and the class it toggles is the consumer's. The directive names follow building-blocks 1.3 (plugin name when there is no Structural class).

| Foundation markup or class | Angular | Rationale |
| --- | --- | --- |
| `[data-toggler][data-animate]`, or a target hidden by `data-toggler="is-hidden"` | `NfsToggler`, selector `[nfsToggler]:not([toggler])`, `exportAs: 'nfsToggler'` | Visibility mode; attribute directive on the consumer's element (ADR 0001) |
| `[data-toggler=".class"]` | `NfsClassToggler`, selector `[nfsToggler][toggler]`, `exportAs: 'nfsToggler'` | Class mode; the presence of `toggler` (static or bound) selects it |
| `.is-hidden` (Foundation global class, `display: none !important`) | Host class binding on `NfsToggler` while hidden | Foundation's normalize `[hidden] { display: none }` has the specificity of one attribute and is printed before the component CSS, so `.menu { display: flex }` and `.thumbnail { display: inline-block }` win over it; `.is-hidden` is Foundation's own class for this |
| The toggled class (`.expanded`, the consumer's) | Host class binding on `NfsClassToggler` from `active` | The class is the consumer's contract; the directive only adds and removes it |
| Motion classes (`nfs-fade-in`, `nfs-spin-out`, the consumer's keyframe classes) | Host class binding on `NfsToggler` while entering or leaving | State class animation (ADR 0003, building-blocks 1.6 rule 1) |

### Hierarchy and DI shape

```
nfsOpenableToken (from the Triggers entry point) <- provided with useExisting by each directive
nfsTogglerDefaultsToken (optional, Shape B)       -> read by NfsToggler for the animate default

[nfsToggler]:not([toggler])  NfsToggler       visibility mode, triggerRole 'disclosure'
[nfsToggler][toggler]        NfsClassToggler  class mode, triggerRole 'toggle-button'

Triggers ([nfsOpen], [nfsClose], [nfsToggle]) reach either by #ref="nfsToggler" or as the Nearest Openable
```

- Two directive classes, one attribute. The selectors partition every host: `toggler` present (as a static attribute or a binding, both of which Angular's selector matching sees) selects class mode, absent selects visibility mode, so exactly one Openable sits on each element (the Triggers spec's one-Openable-per-element rule). Both export `nfsToggler`, so `#t="nfsToggler"` works in either mode. Why two classes: the Openable contract fixes a member named `isOpen`; visibility mode's two-way state is that model, while class mode's two-way state is `active` (building-blocks 1.4) and its `isOpen` is a read-only mirror. One class cannot declare `isOpen` as both a model and a read-only mirror, and two models of one state would need synchronising. The same split also gives each mode only its own inputs and outputs, and fixes the mode at compile time, as Foundation fixed it at init. The proposed ADR records it.
- Each directive provides `{provide: nfsOpenableToken, useExisting: <itself>}`, so a bare `nfsClose` or `nfsToggle` inside the element acts on it (the Nearest Openable).
- No `nfsTogglerToken`: no child directive needs the Toggler (building-blocks Table B named one; nothing injects it).
- `nfsTogglerDefaultsToken`: `InjectionToken<NfsTogglerDefaults>` with the all-optional `{animate?: string}`, injected with `{optional: true}` to seed the `animate` default (building-blocks 1.4, Shape B). `toggler` has no default, because a default class would have to change which directive matches, and selectors are static.
- Entry point: `ngx-foundation-sites/toggler`, exporting both directives, the defaults token, and its interface. Consumers import both directives; importing only `NfsToggler` leaves a class-mode element with no directive, like any directive that is not imported.

### API

```ts
interface NfsTogglerDefaults {
  animate?: string;
}
const nfsTogglerDefaultsToken: InjectionToken<NfsTogglerDefaults>;

class NfsToggler implements NfsOpenable {   // [nfsToggler]:not([toggler]), exportAs 'nfsToggler'
  readonly isOpen: ModelSignal<boolean>;     // default: false if the host has a static hidden attribute or static class is-hidden, else true
  readonly animate: InputSignal<string>;     // 'in [out]' keyframe Motion classes; default from nfsTogglerDefaultsToken, else ''
  readonly id: InputSignal<string>;          // default: generated 'nfs-toggler-...'
  readonly triggerRole: Signal<'disclosure'>;
  readonly opened: OutputRef<void>;
  readonly closed: OutputRef<void>;
  open(trigger?: HTMLElement): void;
  close(result?: unknown): void;             // result is ignored
  toggle(trigger?: HTMLElement): void;
}

class NfsClassToggler implements NfsOpenable { // [nfsToggler][toggler], exportAs 'nfsToggler'
  readonly toggler: InputSignalWithTransform<readonly string[], string>; // leading dots stripped, split on whitespace
  readonly active: ModelSignal<boolean>;     // default: true if the static class attribute contains every static toggler class
  readonly isOpen: Signal<boolean>;          // read-only mirror of active, for the Openable contract
  readonly id: InputSignal<string>;          // default: generated 'nfs-toggler-...'
  readonly triggerRole: Signal<'toggle-button'>;
  open(trigger?: HTMLElement): void;         // active.set(true)
  close(result?: unknown): void;             // active.set(false); result ignored
  toggle(trigger?: HTMLElement): void;
}
```

`NfsToggler` (visibility mode):

| Member | Kind | Type | Default | Foundation equivalent | Delta |
| --- | --- | --- | --- | --- | --- |
| `isOpen` | `model()` | `boolean` | `false` when the host has a static `hidden` attribute or `is-hidden` in its static `class`, else `true` | Visibility read with `:hidden` at init | Read from the static markup (the same on server and client) instead of computed style; a bound value wins; `model()` has no transform, so a static `isOpen="false"` is a type error under strict templates: write `hidden` or `[isOpen]="false"` |
| `animate` | `input()` | `string` | `nfsTogglerDefaultsToken.animate`, else `''` | `data-animate="in out"` | Keyframe Motion classes only; first token enters, second leaves; a missing token means no animation for that direction; not required for visibility mode |
| `id` | `input()` | `string` | `_IdGenerator` id with prefix `nfs-toggler-` | The consumer's required `id` | Optional; bound to the host as `[attr.id]`, the id `aria-controls` names; Aria's `id` input shape |
| `triggerRole` | read-only signal | `'disclosure'` | constant | None | Openable contract |
| `isOpenChange` | output (from the model) | `boolean` | | None | Emitted when the state is requested, before any animation |
| `opened` | `output()` | `void` | | `on.zf.toggler` (after animate-in) | Completion output: emitted once the element is shown and its enter animation, if any, has ended |
| `closed` | `output()` | `void` | | `off.zf.toggler` (after animate-out) | Completion output: emitted once the element is hidden, after its leave animation, if any |
| `open(trigger?)` | method | | | None (only `toggle`) | Records `trigger` for focus return; sets `isOpen` to `true` |
| `close(result?)` | method | | | None | Sets `isOpen` to `false`; `result` is ignored (Toggler has nothing to hand it to) |
| `toggle(trigger?)` | method | | | `toggle()` | `isOpen() ? close() : open(trigger)` |

`NfsClassToggler` (class mode):

| Member | Kind | Type | Default | Foundation equivalent | Delta |
| --- | --- | --- | --- | --- | --- |
| `toggler` | `input()` with transform | `string` in, `readonly string[]` out | required by the selector | `data-toggler=".class"` | Leading dots stripped; whitespace-separated names become several classes (jQuery `toggleClass` parity; Angular class-map keys cannot hold spaces) |
| `active` | `model()` | `boolean` | `true` when the static `class` attribute contains every class of the static `toggler` attribute, else `false` | `hasClass` at init | Read from the static markup; with a bound `[toggler]` the default is `false`; a bound `[active]` wins |
| `activeChange` | output (from the model) | `boolean` | | `on.zf.toggler` / `off.zf.toggler` | One output with the new value (building-blocks 1.4 mapping) |
| `isOpen` | read-only signal | `boolean` | mirrors `active` | None | Only for the Openable contract (Triggers read it for `aria-pressed`); bind `active`, not `isOpen` |
| `id` | `input()` | `string` | generated `nfs-toggler-...` | The consumer's `id` | Bound to the host; the toggle-button role renders no `aria-controls`, so it matters only as the contract's member |
| `triggerRole` | read-only signal | `'toggle-button'` | constant | None | Openable contract |
| `open`, `close`, `toggle` | methods | | | `toggle()` | Set `active`; no animation, no Completion outputs (Foundation has none in class mode) |

Behaviour rules:

- Initial state from markup: the defaults are read with `inject(new HostAttributeToken(...), {optional: true})` in the field initialisers (`hidden`, `class`, `toggler`), the Button spec's mechanism. A static attribute is part of the template, so the server and the client compute the same value, and the dynamic host binding then owns the attribute or class (Angular's host-binding collision rule: dynamic wins over static). Without this seeding, `class="menu expanded"` with `toggler="expanded"` would lose its static class to the `false` binding.
- Visibility is expressed twice on purpose: the `hidden` attribute (hidden content is gone from rendering, the accessibility tree, and the tab order in every browser, also without author CSS) and Foundation's `.is-hidden` class (which beats Foundation component `display` rules that `[hidden]` loses to). Neither `inert` nor `aria-hidden` is added: `display: none` already removes the content (building-blocks 1.10).
- Model changes from any source (a method, a Trigger, a bound `[isOpen]`, `isOpen.set()`) drive the same animation and Completion outputs; the methods only add the trigger bookkeeping.
- Focus: opening never moves focus (disclosure: focus stays on the trigger). When `close()` or `toggle()` closes the element while focus is inside it (a bare `nfsClose` inside), the directive records that before changing state and, in the render callback after the element is hidden, focuses the `trigger` passed to the last `open()` if it is still connected and focusable. Otherwise focus is the consumer's: `closed` is the place to move it (the dismissible-callout case, where no trigger ever opened the element). Model-driven closes move no focus.
- Dev-mode checks, in one `afterNextRender` that exists only when `ngDevMode` is on, each warning once per instance: (1) `animate` names a Motion UI transition class (`/^(fade|slide|hinge|scale|spin)-(in|out)/` without the `nfs-` prefix): "Motion UI transition classes do not animate; use a keyframe class such as `nfs-fade-in`", and the class is applied unchanged (the orchestrator's default in the [Prototype: `animate.enter` and `animate.leave` with Motion UI transition classes](../issues/47-prototype-motion-ui-animate-enter.md)); (2) `animate` has more than two tokens; (3) class mode with a static `animate` attribute ("`animate` is ignored in class mode", Foundation let `animate` win); (4) class mode with an empty `toggler`; (5) class mode whose `toggler` is a Foundation visibility class (`is-hidden`, `hide`, `invisible`): "use visibility mode, whose triggers announce shown and hidden".

### Implementation level and primitives

Implementation level: native platform, with thin custom Angular directives. The platform does the work: the `hidden` attribute and CSS `display: none` hide, class bindings switch classes, CSS `@keyframes` animate, and native buttons activate. `@angular/aria` 22.2 has no disclosure or toggle-button pattern; `@angular/cdk` contributes only `_IdGenerator` (building-blocks 1.5). `<details>` is not the base: its `<summary>` must be the first child of the element it opens, so the trigger cannot sit elsewhere, cannot be one of several triggers or control several targets, and cannot express class mode; and animating its close needs `::details-content`, `interpolate-size`, or `transition-behavior: allow-discrete`, all out of target (`research/web-platform-features.md` 4, 5, 7). `popover="manual"` is out of target (Firefox 125) and places the element in the top layer, while Toggler targets are in-flow content (`research/web-platform-features.md` 2).

Primitives: `model()`, `input()` with a transform, `output()`, `computed()`, one `linkedSignal` for the animation phase (derived from `isOpen`, reset to idle on completion; building-blocks 1.4), `afterRenderEffect` for completion, focus return, and the Completion outputs, `inject()` with `HostAttributeToken`, `_IdGenerator`, host metadata for the class map, `[attr.hidden]`, `[attr.id]`, and the `animationend`/`animationcancel` listeners, `NgZone.runOutsideAngular` for the fallback timer. No CDK beyond `_IdGenerator`, no Aria, no observers, no services.

Fallback: none needed. Every mechanism is a platform feature in target or Angular behaviour the prototypes confirmed (keyframe State classes in three engines, prototype 47; no animation at hydration through State classes, prototype 52).

### Comparison with Angular Material

Material has no Toggler counterpart (`research/angular-material-reference.md` summary table has no Toggler row). The nearest shapes, for reference only:

| Concern | Nearest Material or CDK shape | Toggler |
| --- | --- | --- |
| Disclosure state | `CdkAccordionItem` used alone: `expanded` model, `opened`/`closed` outputs, `open()`/`close()`/`toggle()` | `isOpen` model (named per building-blocks 1.3 and the Openable contract), `opened`/`closed` Completion outputs after the animation, the same three methods |
| Hiding collapsed content | `MatExpansionPanel`: `inert` plus a height animation on a wrapper | `hidden` plus `.is-hidden`; no wrapper, because Toggler content leaves the layout entirely and Foundation's docs animate it with Motion classes, not height |
| Toggle button | `MatButtonToggle`: the button itself carries `aria-pressed` and a `checked` model | The target carries the `active` model; the Trigger renders `aria-pressed` from it |
| Trigger | `MatSidenav` has none: `(click)="drawer.toggle()"` through a template reference | Triggers directives, and the same reference idiom works |

Borrowed: the method names and the Completion outputs. Not borrowed: promises from `open()`/`close()`, an `expanded` name, a wrapper element.

### ARIA and keyboard

APG patterns: Disclosure (visibility mode) and Button, toggle variant (class mode). The Toggler itself carries no role and no ARIA; everything announced sits on the Triggers.

| Element | Visibility mode (`NfsToggler`) | Class mode (`NfsClassToggler`) |
| --- | --- | --- |
| Target | `id`; `hidden` and `.is-hidden` while hidden; no role, no `aria-hidden`, no `inert` | `id`; the toggled class while active; no role |
| `nfsToggle` | `aria-expanded` from `isOpen`, `aria-controls` = target id | `aria-pressed` from `active`; no `aria-expanded`, no `aria-controls` |
| `nfsOpen` | `aria-expanded`, `aria-controls` | nothing (the Triggers ARIA table) |
| `nfsClose` | nothing | nothing |
| Multi-target `nfsToggle` | one aggregate `aria-expanded`, all ids in `aria-controls` (Triggers spec) | one aggregate `aria-pressed`; mixed modes in one array warn (Triggers spec) |

- Class mode renders `aria-pressed` because a layout or theme class expands nothing (`research/aria-apg-patterns.md` Toggler: "`aria-expanded` would be wrong here because nothing is expanded"). The APG requires that a toggle button's label does not change with its state; the consumer keeps "Compact layout" as the label rather than switching between "Expand" and "Collapse".
- Visibility mode is a disclosure; its content is not a dialog or a popup, so no `aria-haspopup`.
- Triggers must be native `<button type="button">` (the Triggers spec warns otherwise); Foundation's `<a data-toggle>` without `href` becomes a button.

| Key | Where | Effect | Owner |
| --- | --- | --- | --- |
| Enter, Space | On a Trigger button | Toggles (native `click`) | Native button, Triggers |
| Tab, Shift+Tab | | Hidden content is skipped (`display: none`) | Native |
| Escape | | Nothing by default: the APG disclosure pattern has no Escape. Content shown on focus (the `data-toggle-focus` replacement) must be dismissible (WCAG 1.4.13), so that usage adds `(keydown.escape)="hint.close()"` on the field | Consumer |

Focus rules: opening leaves focus on the trigger; closing from inside returns focus to the opener (API behaviour rules); the dismissible-callout case moves focus in `closed`.

WCAG 2.2 AA requirements (requirements, not recommendations; the story gate runs axe with the WCAG 2.2 AA rule set, `target-size` included, and the criteria axe cannot judge are asserted in play functions):

| Criterion | Requirement for Toggler | Foundation default and what makes it pass |
| --- | --- | --- |
| 4.1.2 Name, Role, Value | Every Trigger exposes the target's state: `aria-expanded` in visibility mode, `aria-pressed` in class mode, correct in the server HTML and after every change, including the aggregate value of a multi-target Trigger. A class-mode Trigger's accessible name does not change with its state. The target itself claims no role | Foundation stamped `aria-expanded` in both modes and stopped updating multi-id triggers; the Triggers' host bindings on the Openable's `isOpen` pass by construction. The label rule is the consumer's; the `toggler--class-mode` story asserts the name is unchanged after a click |
| 1.3.1 Info and Relationships | A visibility-mode Trigger names the target in `aria-controls` | Triggers render it from `id`, which always exists (consumer or generated) |
| 2.1.1 Keyboard | Every Trigger is operable from the keyboard | Native `<button type="button">` Triggers; the Triggers spec warns in dev mode on anything else. Foundation's `<a data-toggle>` without `href` failed this |
| 2.4.3 Focus Order | Hidden content leaves the tab order; focus never stays on or inside hidden content: closing from inside returns focus to the opener, and a Toggler hidden with no opener (the dismissible callout) has its focus moved in `closed` | `hidden` and `.is-hidden` give `display: none`; focus return is library behaviour; the `closed` step is required consumer code in that usage, and `toggler--closable` asserts it |
| 2.4.7 Focus Visible | Every Trigger shows a visible keyboard focus indicator | Passes with Foundation's defaults: Foundation removes the outline only under what-input's `[data-whatinput='mouse']`/`'touch'` attributes (`disable-mouse-outline`, normalize), which the library never loads and which keyboard input never sets, so `.button`, `.close-button`, and plain buttons keep the browser's focus ring. No rule needed |
| 2.4.11 Focus Not Obscured (Minimum) | Opening a Toggler never covers the focused Trigger; closing never leaves focus on something hidden | Toggler content is in-flow (it pushes the page, it does not overlay it), so it cannot cover the Trigger; content meant to float over the page is a Dropdown pane, not a Toggler. The hidden case is 2.4.3's focus rule |
| 2.5.8 Target Size (Minimum) | Every Trigger is at least 24 by 24 CSS px or meets the spacing exception | `.button` passes at every Foundation size (Button spec). A `.close-button` is 2em (medium) or 1.5em (small) tall, but its `&times;` glyph is narrower than 24 px, so it passes through the spacing exception, which its absolute corner position (`$closebutton-offset-horizontal`, `$closebutton-offset-vertical`) meets when no other target sits within 12 px of its centre; axe's `target-size` rule checks this in `toggler--closable`. Where a consumer's layout breaks the exception, the smallest fix is the consumer's own `min-width: 24px` on that `.close-button` (Foundation has no width setting for it; the Close Button is a CSS-only component outside the library) |
| 1.4.13 Content on Hover or Focus | Content shown on focus (the `data-toggle-focus` replacement) is dismissible without moving focus, and persists while focus stays | Required markup in that usage: `(keydown.escape)="hint.close()"` beside `(focus)`/`(blur)`; `toggler--focus-hint` asserts Escape hides it and focus stays on the field |
| 3.2.1 On Focus, 3.2.2 On Input | No change of context follows focus or input: showing a hint on focus, and switching a class or visibility on button activation, change content in place without moving focus, opening windows, or navigating | By construction: the Toggler declares no focus or input listeners; Triggers act on `click` only |
| 2.2.2 Pause, Stop, Hide | Toggler animations start only from a user action and end well under 5 s | `nfs-motion` defaults to 500 ms; nothing auto-plays |

Reduced motion (`prefers-reduced-motion`) is honoured on top of AA (Animation below).

### Rendered HTML

Directive attributes (`nfstoggler`, `nfsbutton`) stay in the DOM and are omitted below for brevity. Server HTML carries `jsaction="click:;"` on each Trigger (the replay annotation for the Triggers' host listener); the Toggler target has no replayable listener (`animationend` and `animationcancel` are not replay types), so it carries none. Generated ids differ between server and client and are rewritten at hydration, because `id` and `aria-controls` are both host bindings.

```html
<!-- Visibility mode, animated, starting closed -->
<button type="button" [nfsToggle]="panel">Toggle panel</button>
<div nfsToggler #panel="nfsToggler" id="panel" class="callout" animate="nfs-hinge-in-from-top nfs-spin-out" hidden>
  <h4>Hello!</h4>
</div>

<!-- server, and hydrated before any click -->
<button type="button" aria-expanded="false" aria-controls="panel" jsaction="click:;">Toggle panel</button>
<div id="panel" class="callout is-hidden" animate="nfs-hinge-in-from-top nfs-spin-out" hidden="">...</div>

<!-- hydrated, after a click, while the enter animation runs -->
<button type="button" aria-expanded="true" aria-controls="panel">Toggle panel</button>
<div id="panel" class="callout nfs-hinge-in-from-top" animate="nfs-hinge-in-from-top nfs-spin-out">...</div>
<!-- after animationend: opened is emitted -->
<div id="panel" class="callout" animate="...">...</div>

<!-- after a second click, while the leave animation runs (aria-expanded is already "false") -->
<div id="panel" class="callout nfs-spin-out" animate="...">...</div>
<!-- after animationend: closed is emitted -->
<div id="panel" class="callout is-hidden" animate="..." hidden="">...</div>

<!-- Visibility mode, no animation, starting open, generated id -->
<button type="button" [nfsToggle]="notes">Notes</button>
<section nfsToggler #notes="nfsToggler">...</section>
<!-- server -->
<button type="button" aria-expanded="true" aria-controls="nfs-toggler-a1b2-0" jsaction="click:;">Notes</button>
<section id="nfs-toggler-a1b2-0">...</section>

<!-- Class mode on a Foundation menu -->
<button type="button" [nfsToggle]="menuBar">Expand menu</button>
<ul nfsToggler #menuBar="nfsToggler" toggler=".expanded" id="menuBar" class="menu">...</ul>
<!-- server -->
<button type="button" aria-pressed="false" jsaction="click:;">Expand menu</button>
<ul toggler=".expanded" id="menuBar" class="menu">...</ul>
<!-- hydrated, after a click -->
<button type="button" aria-pressed="true">Expand menu</button>
<ul toggler=".expanded" id="menuBar" class="menu expanded">...</ul>

<!-- Class mode starting active from markup -->
<ul nfsToggler toggler="expanded" class="menu expanded">...</ul>
<!-- server: unchanged, active() is true -->
<ul toggler="expanded" class="menu expanded" id="nfs-toggler-a1b2-1">...</ul>
```

### Animation

Per ADR 0003 and building-blocks 1.6 rule 1: the target stays in the DOM, so it animates through bound classes and CSS keyframes, never `animate.enter`/`animate.leave` (which play again at hydration on server-rendered elements, [Prototype: `animate.enter` at hydration](../issues/52-prototype-animate-enter-hydration.md)). Class mode has no animation (Foundation has none); a consumer's own CSS transition on the toggled class is theirs.

Visibility mode phases, held in a `linkedSignal` derived from `isOpen`:

| Phase | Entered when | Host state |
| --- | --- | --- |
| idle | first render (server and client), and after every completion | open: no `hidden`, no Motion class; closed: `hidden`, `.is-hidden` |
| entering | `isOpen` becomes `true` and an in-class exists and animations are enabled | no `hidden`, no `.is-hidden`, the in-class bound |
| leaving | `isOpen` becomes `false` and an out-class exists and animations are enabled | still shown, the out-class bound |

- Opening: `hidden` and `.is-hidden` go and the in-class is bound in the same change detection pass, so the keyframes start from their first frame. Closing: the out-class plays on the visible element; `hidden` and `.is-hidden` are bound, and the out-class removed, in the pass after completion. `isOpen` (and so `aria-expanded`) changes at request time, as the Openable contract says.
- Without a class for a direction, or with `nfsAnimationsToken` `{disabled: true}`, the phase goes straight to idle: the element shows or hides in the same pass.
- Completion: in an `afterRenderEffect` read phase after the class is bound, the directive reads the host's computed `animation-name`, `animation-duration`, `animation-delay`, and `animation-iteration-count`, and takes the longest finite animation (Angular's own method for `animate.leave`). If there is none (the class has no keyframes, the stylesheet is missing, or `nfs-motion` was not included), the phase completes at once. Otherwise it completes on the host's `animationend` or `animationcancel` for that animation name with `event.target` equal to the host, or on a fallback timer of the measured length plus 100 ms, started outside the Angular zone, whichever comes first. This refines building-blocks 1.6 rule 1's "declared duration": Toggler's Motion classes are consumer-chosen and their length is set by the consumer's `nfs-motion($duration)` or their own keyframes, which no design-time constant knows; the case the fixed timer protects (the animation is missing) measures zero and completes immediately. Prototype 47's dropped-stylesheet case therefore still completes.
- Interruption: toggling during a phase recomputes the phase from the new `isOpen` (entering switches to leaving and back); the interrupted phase emits nothing, and its timer is cleared.
- Completion outputs: once the phase is idle and the committed state differs from the last emitted one, the render callback emits `opened` or `closed` (no emission for the initial state). Without an animation they fire in the render callback after the pass that showed or hid the element, so a handler always sees the final DOM.
- Motion classes: keyframe classes only. The library's `nfs-motion` mixin provides `nfs-fade-in`, `nfs-fade-out`, `nfs-slide-in-down`, `nfs-slide-out-up`, `nfs-hinge-in-from-top`, `nfs-spin-out`, and the rest of building-blocks 1.6 rule 4. Motion UI's own transition classes (`hinge-in-from-top`, `spin-out`, ...) never animate here (two-frame protocol, prototype 47) and trigger dev check 1. Foundation's docs example becomes `animate="nfs-hinge-in-from-top nfs-spin-out"`.
- Reduced motion: `nfs-motion` sets `animation-duration: 1ms` on its classes under `prefers-reduced-motion: reduce`, so `animationend` still fires and the change is effectively instant; no separate code path (prototype 47). A consumer-supplied keyframe class must carry its own reduced-motion rule; the directive does not police it.
- Nothing animates at hydration or on the first client render: the phase starts idle, and the class list on the server equals the class list after hydration.

### Rendering modes

Per ADR 0008 and `research/angular-rendering-modes.md` section 7, rules 1 to 11:

- Server-side rendering and first paint: `hidden`, `.is-hidden`, the toggled class, and `id` are host bindings on signal state that exists on the server, seeded from static attributes the server also has, so the server HTML is the final first-paint state (rule 1). Closed content is in the server HTML, hidden; open content is visible. Nothing depends on a breakpoint or a measurement.
- Before hydration: construction reads only `HostAttributeToken` values and DI; no DOM writes outside host bindings, no `window`, no timers (rules 3 to 5). The phase `linkedSignal` and the dev check touch nothing on the server; `afterRenderEffect` and `afterNextRender` never run there.
- Full hydration: host binding values equal the server's (generated ids aside, rewritten at hydration), so hydration changes nothing and there is no structure to mismatch. No animation replays, because the phase is idle on both platforms (rule 10; building-blocks 1.11 decision 10).
- Event replay: the Toggler has no replayable listener. The Trigger's `click` replays after hydration and calls `toggle()`, which reads state created at construction; the animation then plays as for any live click, because it is a real state change. Nothing here calls `preventDefault()`.
- Hydration boundary: a Trigger and its Toggler belong to one hydration boundary; template-reference scoping stops a Trigger outside a `@defer` block from naming a Toggler inside it (ADR 0013). A Toggler inside a block may be operated by a Trigger inside the same block, or by a bare `nfsClose` within itself.
- `@defer`: library templates contain no `@defer`; `ngx-foundation-sites/toggler` is its own entry point. Inside a dehydrated block the target is its server HTML; a Trigger click in the block hydrates it and replays. Inside `@defer (hydrate never)` the target keeps its server state forever: open content stays readable and closed content stays unreachable, so content that must be reachable is not placed closed inside `hydrate never`. Plain `@defer` renders the Toggler on the client; it starts idle, so an open Toggler appears without its enter animation (a consumer who wants one on block appearance adds `animate.enter` to that client-created element).
- Prerendering: identical to server rendering; no request token is read (rule 11).
- Zoneless: signals only; the fallback timer runs outside the Angular zone and writes a signal.

### Sass and custom CSS

No library CSS and no `nfs-toggler` mixin. Hiding reuses Foundation's normalize `[hidden]` rule and global `.is-hidden` class (both from `foundation-global-styles`); animation reuses the `nfs-motion` keyframe classes. The Sass subsection under Further Notes gives the required content.

## Testing Decisions

A good test asserts what a user or assistive technology observes: whether the target is shown (`hidden`, `.is-hidden`, visibility), which classes it carries, the Trigger's `aria-expanded`, `aria-controls`, and `aria-pressed`, where focus lands, and when `opened`/`closed` fire relative to the animation. No test reads private fields or the phase signal. Prior art: the [Spec: Triggers (shared utility)](../issues/54-spec-triggers.md) test layers, whose test Openable the Toggler replaces in composition stories; no prior art exists in the new repository.

Story ids follow `toggler--<story>`: `toggler--class-mode`, `toggler--class-mode-initially-active`, `toggler--visibility`, `toggler--visibility-animated`, `toggler--initially-hidden`, `toggler--in-animation-only`, `toggler--multiple-targets`, `toggler--closable`, `toggler--focus-hint`, `toggler--programmatic`, `toggler--two-way-binding`.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Every story runs axe through `@storybook/addon-a11y` with `parameters.a11y.test = 'error'` and `runOnly` set to the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`), so `target-size` is part of the gate. Stories set `nfsAnimationsToken` only where noted; animated stories wait for the Completion output rather than a timeout.

- `toggler--class-mode`: Foundation's menu example on `ul.menu` with `toggler=".expanded"`; the button has `aria-pressed="false"` and no `aria-expanded`; clicking adds `.expanded` and flips `aria-pressed`; the button's accessible name is unchanged; Enter and Space work through `userEvent.keyboard`.
- `toggler--class-mode-initially-active`: `class="menu expanded" toggler="expanded"` renders with `.expanded` and `aria-pressed="true"`.
- `toggler--visibility`: no `animate`; the panel starts shown; a click sets `hidden` and `.is-hidden` at once and `aria-expanded="false"`; a second click restores it; `aria-controls` equals the panel id.
- `toggler--visibility-animated`: `animate="nfs-hinge-in-from-top nfs-spin-out"`; after a click the out-class is present and the panel still visible, then `closed` fires (shown in the story) and the panel is hidden; reopening binds the in-class, then `opened` fires and the in-class is gone.
- `toggler--initially-hidden`: a panel written with `hidden` and one written with `class="is-hidden"` both start closed with `aria-expanded="false"` on their buttons.
- `toggler--in-animation-only`: `animate="nfs-fade-in"`; closing hides at once and `closed` fires.
- `toggler--multiple-targets`: Foundation's three-thumbnail example with `img.thumbnail` targets; all hide and show together; hidden thumbnails are not visible despite Foundation's `.thumbnail { display: inline-block }`.
- `toggler--closable`: a callout with a bare `nfsClose` close button hides with `nfs-fade-out`; the story's `(closed)` handler moves focus to a following heading, and the play function asserts focus landed there.
- `toggler--focus-hint`: an input with `(focus)`/`(blur)`/`(keydown.escape)` bindings and a hint written with `hidden`; focusing shows it, Escape hides it, blur hides it.
- `toggler--programmatic`: buttons calling `open()`, `close()`, `toggle()` through the template reference; a bare `nfsClose` inside the opened panel closes it and focus returns to the button that opened it.
- `toggler--two-way-binding`: `[(isOpen)]` and `[(active)]` bound to signals shown in the story; clicking Triggers updates them and changing them from a checkbox updates the targets.

### 2. Browser-level test (stack per the [browser testing stack decision](../issues/41-browser-testing-stack-decision.md); stack-neutral)

- Directive matching: a host with a static `toggler`, one with `[toggler]` bound, and one without; exactly one Openable resolves on each (`nfsOpenableToken` from an inner element), of the right class; `#t="nfsToggler"` resolves in both modes.
- Initial state seeding, driven by data: static `hidden`, static `is-hidden`, both, neither, and bound `[isOpen]` overriding each; static class with every, some, and none of the static `toggler` classes; bound `[toggler]` defaulting `active` to `false`.
- `toggler` transform: leading dots, several classes, surrounding whitespace.
- Phases with a test stylesheet: entering and leaving class lists after each step; `opened`/`closed` emitted once, after `animationend`, in order; interruption mid-leave emits only `opened` for the final state; `animationend` from a child element does not complete the phase; `animationcancel` completes it.
- Fallback paths: a Motion class with no keyframes completes at once; an animation whose `animationend` is suppressed completes after the measured length plus 100 ms (fake timers); `nfsAnimationsToken` `{disabled: true}` skips the Motion classes entirely.
- Reduced motion: with `prefers-reduced-motion: reduce` emulated and the `nfs-motion` output loaded, completion arrives within a frame or two.
- Focus return: a bare `nfsClose` inside, after `open(trigger)`, returns focus to the trigger; after a model-driven close focus is not moved; a disconnected trigger is not focused.
- Defaults token: an `animate` default applies when the attribute is absent and is overridden by it.
- Dev-mode checks: each of the five warnings fires once for its case and not for correct usage (`nfs-hinge-in-from-top` does not warn).
- Zoneless: the suite runs with zoneless change detection and `fixture.whenStable()`.

### 3. Node-level Vitest

- SSR smoke: `renderApplication` over a fixture with a closed animated Toggler (static `hidden`), an open unanimated one with a generated id, a class-mode menu inactive and one initially active, a multi-target Trigger, and a bare `nfsClose` inside a callout. Assert `whenStable()` resolves; the server HTML matches the Rendered HTML section (`hidden=""`, `.is-hidden`, the toggled class, ids, Trigger ARIA); no Motion class is present; Toggler hosts carry no `jsaction`. Runs in its own file or process because `provideServerRendering()` leaves `ngServerMode` set; the runner is the [Prototype: Rendering-mode test seam](../issues/59-prototype-rendering-mode-test-seam.md).
- Pure logic, table-driven: the `toggler` transform, the `animate` parser (in, out, missing out, extra tokens), the Motion UI name check, the initial-state functions over static attribute values, and the longest-animation reduction over computed-style lists.

### 4. Playwright e2e

Against the static Storybook build:

- `toggler--visibility-animated` in Chromium, Firefox, and WebKit, plain and with `reducedMotion: 'reduce'`: the keyframes play (an `animationstart` is recorded) and `closed` fires; under reduced motion completion is immediate.
- `toggler--multiple-targets`: hidden thumbnails have zero bounding boxes in all three engines.

Against the prerendered fixture app (the harness from the rendering-mode test seam prototype):

- JavaScript disabled: screenshot plus axe; closed content is hidden, open content visible, class-mode classes as written.
- Hydration: no NG05xx in the console, `ngDevMode.componentsSkippedHydration === 0`, and no `animationstart` on any Toggler during hydration.
- Pre-hydration click with the main bundle delayed: a Trigger clicked before hydration toggles its Toggler exactly once after hydration, and the animated one plays its leave animation then.
- Dehydrated block: a Trigger and Toggler inside `@defer (hydrate when hydrateNow())` held `false`; clicking the Trigger hydrates the block and toggles the target.
- `@defer (hydrate never)`: the Toggler keeps its server state, and clicking its Trigger changes nothing and logs no error.

## Out of Scope

- `data-toggle-focus` and `data-closable` as directives (Triggers spec decisions D9, D10); this spec documents the replacements.
- Height or slide-down animation of in-flow content through a wrapper (the Accordion's grid technique): Foundation's Toggler animates with Motion classes only, and Toggler has no wrapper element.
- Motion UI transition classes and the `motion-ui` package (ADR 0003).
- A Trigger-role override input for class mode (OPEN FOR HUMAN in the ticket answer).
- Animation in class mode, and Completion outputs for it.
- `mutateme.zf.trigger` and any re-measure broadcast.
- Escape handling, outside-click closing, and Light dismiss: a Toggler is a disclosure, not an Anchored pane.
- The Triggers themselves (their ARIA, activation, and replay are the Triggers spec's).

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | Two directive classes behind one `nfsToggler` attribute, partitioned by the presence of `toggler` | The Openable contract fixes `isOpen`; class mode's two-way state is `active` (building-blocks 1.4) and needs a read-only `isOpen`; one class cannot declare both shapes; each mode gets only its own members; the mode is static as in Foundation | One class with an overloaded `isOpen` (a class toggle named "open"), or with both models kept in sync; a `mode` input |
| D2 | `toggler` selects class mode; absence selects visibility mode; `animate` is optional | Visibility without animation replaces `data-toggler="is-hidden"` and its inverted ARIA | Foundation's error when neither is set |
| D3 | Visibility is `hidden` plus Foundation's `.is-hidden` | `[hidden]` loses to Foundation component `display` rules by source order (`.menu`, `.thumbnail`); `.is-hidden` is Foundation's `!important` class; `hidden` keeps the semantics without CSS | `hidden` alone (fails on `.menu` and `.thumbnail`); `.is-hidden` alone (no semantics without Foundation's global styles); a library `[hidden]` rule (reaches consumer CSS) |
| D4 | Initial state from static markup through `HostAttributeToken` | Foundation read the state from the DOM at init; static attributes are identical on server and client; stops the dynamic binding from stripping a static class | Defaults that ignore the markup (the static class is silently removed); reading computed style (no server equivalent) |
| D5 | Visibility default open | Foundation's unhidden element is visible; the `data-closable` replacement and Foundation's docs panel start visible | Default closed (Material's `expanded: false`) |
| D6 | Class mode triggers render `aria-pressed`; visibility mode triggers render `aria-expanded` | APG: a layout or theme class expands nothing; disclosure for shown and hidden content | `aria-expanded` in both modes (Foundation) |
| D7 | State class keyframes for enter and leave; never `animate.enter` | Persistent element; `animate.enter` replays at hydration (prototype 52); keyframe path confirmed in three engines (prototype 47) | `animate.enter`/`animate.leave` with `@if` (removes content from server HTML and `aria-controls`) |
| D8 | Completion from the measured longest animation, then `animationend`/`animationcancel`, else a measured-length-plus-100-ms timer | Motion class lengths are the consumer's; a missing animation measures zero and completes at once; Angular measures the same way for `animate.leave` | A fixed declared duration (cuts long consumer keyframes, waits needlessly when none run) |
| D9 | A missing out-class hides at once | Foundation's close never completed in that case | Waiting for a `transitionend` that never comes |
| D10 | `opened`/`closed` only in visibility mode; `activeChange` in class mode | Building-blocks 1.4 event mapping; class mode has no animation to complete | `opened`/`closed` in class mode |
| D11 | Focus returns to the opener only when a close from inside takes focus with it | APG focus persistence; Openable requirement; opening a disclosure keeps focus on the trigger | Always refocusing the trigger; never moving focus |
| D12 | No `nfsTogglerToken` | No child directive injects the Toggler | A plugin token by habit |
| D13 | `nfsTogglerDefaultsToken` with `animate` only | Building-blocks 1.4 defaults rule; a default `toggler` would have to change which directive matches | A `toggler` default |
| D14 | Dev warning for Motion UI transition class names, class applied unchanged | Orchestrator's default on prototype 47; the names look valid and silently do nothing | Rejecting the class; silently ignoring it |
| D15 | `<details>` is not the base, but documented as the platform answer for the plain case | Summary must be the element's first child; no remote, multiple, or multi-target triggers; no class mode; close animation out of target | `<details>` as the implementation |
| D16 | No library CSS | Foundation's `[hidden]`, `.is-hidden`, and the `nfs-motion` classes cover everything | An `nfs-toggler` mixin |

### Usage examples

```ts
@Component({
  selector: 'app-page',
  imports: [NfsButton, NfsToggle, NfsClose, NfsToggler, NfsClassToggler],
  template: `
    <!-- Class mode: Foundation's expanded menu, a toggle button -->
    <button nfsButton class="hollow" [nfsToggle]="menuBar">Full-width menu</button>
    <ul nfsToggler #menuBar="nfsToggler" toggler=".expanded" class="menu" [(active)]="fullWidth">
      <li><a routerLink="/one">One</a></li>
      <li><a routerLink="/two">Two</a></li>
    </ul>

    <!-- Visibility mode, animated, starting closed: a disclosure -->
    <button nfsButton [nfsToggle]="panel">Toggle panel</button>
    <div nfsToggler #panel="nfsToggler" id="panel" class="callout"
         animate="nfs-hinge-in-from-top nfs-spin-out" hidden (opened)="onPanelShown()">
      <h4>Hello!</h4>
      <button nfsButton class="secondary" nfsClose>Hide</button>
    </div>

    <!-- Multiple targets move together -->
    <button nfsButton [nfsToggle]="[thumb1, thumb2, thumb3]">Toggle all these</button>
    <img nfsToggler #thumb1="nfsToggler" class="thumbnail" animate="nfs-fade-in nfs-fade-out" src="01.jpg" alt="Photo of Uranus.">
    <img nfsToggler #thumb2="nfsToggler" class="thumbnail" animate="nfs-fade-in nfs-fade-out" src="02.jpg" alt="Photo of Neptune.">
    <img nfsToggler #thumb3="nfsToggler" class="thumbnail" animate="nfs-fade-in nfs-fade-out" src="03.jpg" alt="Photo of Saturn.">
  `,
})
export class AppPage {
  protected readonly fullWidth = signal(false);

  protected onPanelShown(): void {
    // the panel is fully visible and its enter animation has ended
  }
}
```

```html
<!-- data-closable replacement: hide in place; move focus when it is gone -->
<div class="callout" nfsToggler animate="nfs-fade-in nfs-fade-out" id="notice" (closed)="nextHeading.focus()">
  <p>Invoice sent.</p>
  <button class="close-button" type="button" aria-label="Dismiss notice" nfsClose>
    <span aria-hidden="true">&times;</span>
  </button>
</div>
<h2 #nextHeading tabindex="-1">Invoices</h2>

<!-- data-toggle-focus replacement: open on focus, close on blur and Escape; the hint starts hidden -->
<input type="text" aria-describedby="form-hint"
       (focus)="formHint.open()" (blur)="formHint.close()" (keydown.escape)="formHint.close()">
<div nfsToggler #formHint="nfsToggler" id="form-hint" class="secondary callout" hidden>
  This is only visible while the field has focus.
</div>

<!-- Native alternative: when the trigger sits directly above the content, no class contract
     or animation is needed, a <details> element needs no directive at all -->
<details>
  <summary>Shipping details</summary>
  <p>Orders ship within two days.</p>
</details>
```

```ts
// App-wide default animation for visibility-mode Togglers
bootstrapApplication(App, {
  providers: [{provide: nfsTogglerDefaultsToken, useValue: {animate: 'nfs-fade-in nfs-fade-out'}}],
});
```

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This plugin relies on Foundation's export mixin `foundation-global-styles` (its normalize `[hidden] { display: none }` rule and its global `.is-hidden { display: none !important }` class), plus whichever export mixin styles the classes a consumer toggles (for example `foundation-menu` for `.menu.expanded`, `foundation-thumbnail` for `.thumbnail`). No library CSS; there is no `nfs-toggler` mixin. (1) Rules: none. (2) Reused settings and mixins: none beyond the export mixins named. (3) Custom properties: none. (4) Motion classes: none by default; with `animate`, the consumer names keyframe classes from `@include nfs-motion;` (Foundation's docs example becomes `nfs-hinge-in-from-top nfs-spin-out`; `nfs-fade-in nfs-fade-out` is the usual pair), and `nfs-motion`'s own `prefers-reduced-motion` block shortens them to 1 ms; the directive adds and awaits no other animation, so there is no plugin-level override. (5) What breaks when an include is missing: without `foundation-global-styles` there is no `.is-hidden`, and the `hidden` attribute alone does not hide elements that a later Foundation rule gives a `display` value (`.menu`, `.thumbnail`); without `nfs-motion` the named classes have no keyframes, so the element shows and hides instantly and the Completion outputs still fire.

### Platform features to adopt when the browser target moves

- Invoker Commands (Baseline newly available 2025-12-12, widely available about 2028-06): a Trigger can render `commandfor` with the Toggler's id and a custom `--nfs-toggle` command, handled by a `command` listener on the target; this needs consumer-supplied ids, and the click path stays until Angular replays `command` (Triggers spec, Further Notes).
- `@starting-style` and `transition-behavior: allow-discrete`: transition-based Motion classes (Motion UI's own names) could then animate an element leaving `display: none`; the keyframe classes stay valid.
- `hidden="until-found"` with the `beforematch` event (not Baseline widely available on 2026-05-07): find-in-page could reveal closed Toggler content, with `beforematch` setting `isOpen`; it would replace `.is-hidden` with `content-visibility: hidden`, so it needs its own design pass against Foundation's display rules.
- `popover="manual"` is not an upgrade path for in-flow Toggler content: it moves the element to the top layer. A Toggler meant to float over the page is really a Dropdown pane.
- `<details name>` and `::details-content`: make `<details>` a better native answer for grouped disclosures (the Accordion's concern), not a base for Toggler, whose triggers sit anywhere.

### Foundation behaviour changed or dropped

- `data-toggler="is-hidden"` (class mode used for visibility, inverted `aria-expanded`) becomes visibility mode with `hidden`, and dev check 5 flags the old form.
- `aria-expanded` on class-mode triggers becomes `aria-pressed`; the single-id-only ARIA updates become one aggregate value.
- Initial state is read from static markup, not computed style.
- The error for a missing `toggler` becomes visibility mode (or, for an empty `toggler`, a dev warning).
- `animate` with only an in-class now hides at once instead of never.
- Motion UI transition classes are replaced by `nfs-*` keyframe classes.
- `data-open` and `data-close` triggers now work (Foundation gave them ARIA but no behaviour).
- `mutateme.zf.trigger` is dropped; `ResizeObserver` in the measuring plugins covers it.
- jQuery-only behaviour dropped: the `:hidden` visibility test, document-wide trigger discovery by attribute selector, and Motion's inline `show()`/`hide()` `display` writes.
