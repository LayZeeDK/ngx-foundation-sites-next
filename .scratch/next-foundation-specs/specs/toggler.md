# Spec: Toggler

Ticket: [Spec: Toggler](../issues/17-spec-toggler.md); revised under the class rule by [Re-run: Toggler spec under the class rule](../issues/109-rerun-toggler-class-rule.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Written under the class rule ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)).

## Problem Statement

A developer building an Angular application on Foundation for Sites wants to show and hide an element, or switch a class on it, from a button somewhere else on the page: a panel that appears under a "Toggle panel" button, a menu that switches to Foundation's expanded layout, three thumbnails that one button hides together, a dismissible callout, a hint that appears while a field has focus. Foundation's Toggler plugin does this with `data-toggler=".class"` (switch a class) or `data-toggler data-animate="in out"` (show and hide with Motion UI), driven by `data-toggle="id"` on the trigger. That design leaves the developer with problems an Angular library must not copy:

- Foundation's docs use `<a data-toggle>` without `href`, which a keyboard cannot reach and a screen reader does not announce as a control.
- The ARIA is wrong in both modes. Toggler stamps `aria-expanded` on every trigger, also when the toggled class is a layout switch that expands nothing, and it updates the value only for triggers that name a single id, so a multi-target button keeps its first-paint value forever.
- The initial state is read from the DOM at plugin start (`hasClass`, `:hidden`), which a server render cannot do.
- The animated mode runs Motion UI's two-frame transition-class protocol through jQuery; with only an in-animation given, the close never completes, because Foundation waits for a `transitionend` that never comes.
- Toggler throws when neither `data-toggler` nor `data-animate` has a value, so hiding an element without an animation needs the `.is-hidden` class in class mode, which inverts the ARIA (`aria-expanded="true"` while the element is hidden).
- The markup has the developer write Foundation's classes: the toggled class of Foundation's own example is a Menu Variant (`.expanded`), a hidden start is `class="is-hidden"`, and the animation value names Motion UI classes. Under the library's class rule the developer writes no Foundation or library class, not in markup and not as an input value ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)), so each of these needs another spelling.

A server-rendered Angular application adds a second problem: the target's shown or hidden state and its class must be right in the server HTML, hydration must not replay an animation, and a click on the trigger that arrives before hydration must still toggle the target once the page hydrates, inside dehydrated `@defer (hydrate on ...)` blocks as well.

## Solution

Two attribute directives on the element the developer wants to toggle, both written with the Foundation-like attribute `nfsToggler`, both Openables that the [Spec: Triggers (shared utility)](../issues/54-spec-triggers.md) buttons operate:

- Visibility mode (`nfsToggler` without `toggler`): the element is shown or hidden with the `hidden` attribute plus Foundation's `.is-hidden` class, optionally animated in and out from `animate`, which takes Foundation's Motion UI names as typed values (`animate="hinge-in-from-top spin-out"`) and binds the library's `nfs-` keyframe class for each, or the consumer's own keyframe classes in Foundation's dot form (`animate=".brand-in .brand-out"`). Its triggers are disclosure buttons with `aria-expanded` and `aria-controls`. Its state is the `isOpen` model, and it emits `opened` and `closed` when a change is done, animation included.
- Class mode (`nfsToggler toggler="compact"`): the consumer's own class is added or removed. Its triggers are toggle buttons with `aria-pressed`. Its state is the `active` model. A Foundation class belongs to the directive that binds it, so to switch a Foundation Variant (Foundation's own example switches a Menu to `.expanded`) the developer writes `toggler` without a value, which switches no class, and binds that Variant's input from `active`: `<ul nfsMenu nfsToggler toggler #menuBar="nfsToggler" [expanded]="menuBar.active()">`.

The developer writes a native `<button nfsButton [nfsToggle]="panel">` next to `<div nfsCallout nfsToggler #panel="nfsToggler" ...>`, and no Foundation or library class. Both modes start from what the markup says (a `hidden` attribute means closed; the consumer's own toggled class written in `class` means active), which is the same on the server and in the browser, so the server HTML is the first paint and hydration changes nothing. The animation runs only on a state change after hydration, through a State class and CSS keyframes (ADR 0003); nothing animates at page load. No library CSS is added: the directive binds Foundation's `.is-hidden`, the `nfs-motion` keyframe classes, and the consumer's own classes.

## User Stories

1. As an application developer, I want to put `nfsToggler` on any element and `[nfsToggle]="panel"` on a button, so that the button shows and hides the element with no id strings.
2. As an application developer, I want `nfsToggler toggler` with `[expanded]="menuBar.active()"` on an `nfsMenu`, so that a button switches the menu to Foundation's expanded layout as `data-toggler=".expanded"` did, while the Menu directive keeps owning `.expanded`.
3. As an application developer migrating Foundation markup, I want `toggler=".compact"` with the leading dot to work for my own class, so that a `data-toggler` value copied from Foundation markup keeps working.
4. As an application developer, I want `animate="hinge-in-from-top spin-out"`, so that Foundation's `data-animate` value copies unchanged and the element animates with the library's keyframe versions of those Motion UI names.
5. As an application developer, I want to give only an in-animation (`animate="fade-in"`), so that the element animates in and hides at once, instead of never hiding as Foundation's Toggler did.
6. As an application developer, I want visibility mode without `animate` to show and hide at once, so that I no longer need `data-toggler="is-hidden"` and its inverted state.
7. As an application developer, I want an element written with the `hidden` attribute, or with `[isOpen]="false"`, to start closed, so that the markup states the initial state as Foundation's `:hidden` check did.
8. As an application developer, I want an element written with my own toggled class already in `class` to start active, so that Foundation's `hasClass` initial state carries over.
9. As an application developer, I want `[(isOpen)]` in visibility mode and `[(active)]` in class mode, so that I can bind the state two ways like any other Angular model.
10. As an application developer, I want `opened` and `closed` outputs that fire after the animation ends, so that I can react when the element is fully shown or fully hidden.
11. As an application developer, I want `activeChange` in class mode, so that I get Foundation's `on.zf.toggler`/`off.zf.toggler` information as a typed event.
12. As an application developer, I want `open()`, `close()`, and `toggle()` on the directive, so that I can drive it from code through a template reference.
13. As an application developer, I want one button to toggle three thumbnails together with `[nfsToggle]="[thumb1, thumb2, thumb3]"`, so that Foundation's multi-target example keeps working.
14. As an application developer, I want a callout (`nfsCallout`) with an `nfsCloseButton` and a bare `nfsClose` inside to hide itself with a fade, so that Foundation's `data-closable` has a direct replacement.
15. As an application developer, I want a hint that shows while a field has focus through `(focus)`/`(blur)` bindings to `open()`/`close()`, so that `data-toggle-focus` has a replacement that never inverts.
16. As an application developer, I want an app-wide default for `animate` through `nfsTogglerDefaultsToken`, so that every Toggler in my app animates the same way without repeating the attribute.
17. As an application developer, I want a misspelt Motion name, a Motion UI name the library has no keyframes for, or a library class name such as `nfs-fade-in` to fail to compile, so that I learn at build time which names animate.
18. As an application developer, I want the `toggler` input documented as taking only my own classes, with visibility mode for hiding (`is-hidden`) and the owning directive's input for a Foundation class such as `expanded`, so that I switch to visibility mode or bind the input of the directive that owns the class.
19. As an application developer, I want `toggler` written without a value to switch no class and only hold the state, so that I can bind a Foundation Variant input, which its own directive owns, from `active`.
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
44. As an application developer, I want to give only an out-animation (`animate="slide-out-right"`), so that Foundation's `data-closable="slide-out-right"` has a counterpart that needs no in-animation.
45. As an application developer migrating Foundation markup, I want the documentation to say that a copied `class="is-hidden"` does not start the element closed and to name the `hidden` attribute and the `[isOpen]="false"` binding that do, so that I learn why my element shows and which attribute or binding states the closed start.
46. As an application developer, I want to write no Foundation or library class in my Toggler markup or its input values, so that my templates follow the class rule like every other library directive's.
47. As an application developer, I want the Toggler to sit beside `nfsCallout`, `nfsMenu`, or `nfsThumbnail` on one element and bind none of their classes, so that each directive owns its own classes.
48. As an application developer, I want to name my own keyframe classes with a leading dot, `animate=".brand-in .brand-out"`, so that a brand animation still works where Foundation's Motion UI names do not fit.

## Implementation Decisions

Sources: P47 = the [Prototype: `animate.enter` and `animate.leave` with Motion UI transition classes](../issues/47-prototype-motion-ui-animate-enter.md); P52 = the [Prototype: `animate.enter` at hydration](../issues/52-prototype-animate-enter-hydration.md).

### Foundation contract

Toggler 6.9 has two options, two events, one public method, and no CSS of its own (`Toggler.defaults` in the plugin source; the Foundation disclosure inventory research, Toggler section).

| Foundation | Behaviour in 6.9 | Library counterpart |
| --- | --- | --- |
| `data-toggler` (option `toggler`, default `undefined`) | The attribute is both the plugin marker and the class to toggle, with or without a leading dot; throws when empty and `animate` is unset | The attribute `nfsToggler` is the marker; `toggler` names the consumer's own classes and selects class mode (`NfsClassToggler`); a leading dot is stripped; `toggler` without a value selects class mode and switches no class |
| `data-animate` (option `animate`, default `false`) | `"<in> [<out>]"` Motion UI class names; switches the plugin to visibility mode with `Motion.animateIn/Out`; wins over `toggler` when both are set | `animate` input on `NfsToggler` (visibility mode): typed Motion names that the directive maps to the library's `nfs-` keyframe classes, or the consumer's own keyframe classes in Foundation's dot form; Foundation's values copy unchanged where `nfs-motion` has the name; visibility mode no longer needs `animate` |
| Initial state | Class mode: `hasClass` at init; animate mode: `!$el.is(':hidden')` | Seeded from the static markup: class mode from the static `class` attribute containing the static `toggler` classes, which are the consumer's own; visibility mode closed when the host carries a static `hidden` attribute |
| `on.zf.toggler` / `off.zf.toggler` | Fired after a class toggle, or after the animate-in / animate-out callback | Class mode: `activeChange` (the model output). Visibility mode: `opened` / `closed` Completion outputs, plus `isOpenChange` |
| `toggle()` | Class or animate path by mode | `toggle(trigger?)`, plus `open(trigger?)` and `close(result?)` from the Openable contract |
| Listens to `toggle.zf.trigger` only | `data-open`/`data-close` triggers get ARIA but do nothing | `nfsOpen`, `nfsClose`, and `nfsToggle` all work, through the Openable methods |
| ARIA on triggers | `aria-expanded` from class presence or visibility, `aria-controls` appended; updated for exact single-id triggers only | Rendered by the Triggers from the Trigger role: `disclosure` in visibility mode, `toggle-button` in class mode (ARIA and keyboard below) |
| `mutateme.zf.trigger` on `[data-mutate]` descendants after each toggle | Lets hidden Equalizers and Stickies recompute | Dropped: the library's measuring plugins use `ResizeObserver`, which fires when content is shown |
| `init.zf.toggler` / `destroyed.zf.toggler` | Base plugin lifecycle | None (Angular lifecycle) |

Dropped options and behaviours: `data-toggle-focus` (Triggers spec; replaced by `(focus)`/`(blur)` bindings), `data-closable` (Triggers spec; replaced by a visibility-mode Toggler with a bare `nfsClose`, or `@if`, whose `animate.leave` takes only the consumer's own keyframe class (Triggers spec, D17)), Motion UI transition classes and the `mui-enter`/`mui-leave` protocol (ADR 0003), class names as `animate` values (ADR 0039), Foundation classes as `toggler` values (ADR 0039), the thrown error for a missing class, `mutateme.zf.trigger`, document-wide trigger discovery by attribute selector, and jQuery `show()`/`hide()` inline `display` writes.

### CSS class to Angular mapping

Toggler has no Structural class of its own and no Variant class: it works on any element, and the class it toggles in class mode is the consumer's own. So it has no Variant input, no Variant registry or alias, and no Variant property. The directive names follow building-blocks 1.3 (plugin name when there is no Structural class). No class is left for the developer to write (ADR 0039), except the classes of a family with no first-milestone spec, such as the XY Grid's in the table below.

| Foundation markup or class | Kind | Angular | Rationale |
| --- | --- | --- | --- |
| `[data-toggler][data-animate]`, or a target hidden by `data-toggler="is-hidden"` | Plugin marker | `NfsToggler`, selector `[nfsToggler]:not([toggler])`, `exportAs: 'nfsToggler'` | Visibility mode; attribute directive on the developer's element (ADR 0001) |
| `[data-toggler=".class"]` naming an Application class | Plugin marker and the consumer's own class | `NfsClassToggler`, selector `[nfsToggler][toggler]`, `exportAs: 'nfsToggler'`; host class binding of the `toggler` classes from `active` | Class mode; the presence of `toggler` (static, bare, or bound) selects it; the class is the developer's contract, and the directive only adds and removes it |
| `[data-toggler=".expanded"]` on a Menu, or any Foundation Variant class | Variant class of another component | The owning directive's Variant input (`nfsMenu`'s `expanded`) bound from `active` of an `NfsClassToggler` written with `toggler` and no value | Every Foundation class has one owner, the directive that binds it (ADR 0039; building-blocks 1.9); the Toggler supplies the state and the toggle-button Trigger role |
| `.is-hidden` (Foundation global class, `display: none !important`) | State class | Host class binding on `NfsToggler` while hidden | Foundation's normalize `[hidden] { display: none }` has the specificity of one attribute and is printed before the component CSS, so `.menu { display: flex }` and `.thumbnail { display: inline-block }` win over it; `.is-hidden` is Foundation's own class for this. A copied static `is-hidden` is stripped while the element is shown and does not start it closed: the closed start is the `hidden` attribute or `[isOpen]="false"` |
| Motion classes (`nfs-hinge-in-from-top`, `nfs-spin-out`, the rest of the `nfs-motion` set) | Motion class, bound as a State class | Host class binding on `NfsToggler` while entering or leaving: `nfs-<name>` for each Motion name in `animate`, or the consumer's own keyframe class written in the dot form | State class animation on a persistent element (ADR 0003, building-blocks 1.6 rule 1); the developer writes the Motion name, never the library's class (ADR 0039), and its own classes only as its own |
| `.callout` and its colour class | Another family's: the Callout's Structural and Variant classes | `NfsCallout` (`[nfsCallout]`) with its `color` Variant input, beside `nfsToggler` | [Spec: Callout](../issues/89-spec-callout.md); the panels, hints, and dismissible callouts of the examples |
| `.menu` | Another family's: the Menu's Structural class (its `.expanded` is the row above) | `NfsMenu` (`ul[nfsMenu]`), beside `nfsToggler` | [Spec: Menu](../issues/85-spec-menu.md) |
| `.thumbnail` | Another family's: the Thumbnail's Structural class | `NfsThumbnail` (`[nfsThumbnail]`), beside `nfsToggler` | [Spec: Thumbnail](../issues/97-spec-thumbnail.md); Foundation's multiple-targets example |
| `.grid-x`, `.grid-margin-x`, `.cell`, `.small-4` | A family with no first-milestone spec: the XY Grid's | None: normal classes the consumer writes (`class="grid-x grid-margin-x"`, `class="cell small-4"`), with Foundation's global styles loaded | The class rule's exception for a family with no first-milestone spec; the layout of Foundation's multiple-targets example, which the examples here leave out |
| `.button` and its Variant classes | Another family's: the Button's | `NfsButton` with its Variant inputs, on a Trigger | [Spec: Button](../issues/37-spec-button.md) |
| `.close-button` | Another family's: the Close Button's Structural class | `NfsCloseButton` (`button[nfsCloseButton]`), on a Trigger | [Spec: Close Button](../issues/83-spec-close-button.md) |

The Toggler writes every class through host bindings on its own host; nothing it binds sits on an element without a library directive, and it writes no class on its Triggers (Triggers spec, D18).

### Hierarchy and DI shape

```
nfsOpenableToken (from the Triggers entry point) <- provided with useExisting by each directive
nfsTogglerDefaultsToken (optional, Shape B)       -> read by NfsToggler for the animate default
NfsMotionIn, NfsMotionOut, NfsMotionPair, nfsMotionClasses, nfsMotionPairClasses (primary entry point) -> the animate type and its mapping

[nfsToggler]:not([toggler])  NfsToggler       visibility mode, triggerRole 'disclosure'
[nfsToggler][toggler]        NfsClassToggler  class mode, triggerRole 'toggle-button'

Triggers ([nfsOpen], [nfsClose], [nfsToggle]) reach either by #ref="nfsToggler" or as the Nearest Openable
```

- Two directive classes, one attribute. The selectors partition every host: `toggler` present (as a static attribute with or without a value, or as a binding, all of which Angular's selector matching sees) selects class mode, absent selects visibility mode, so exactly one Openable sits on each element (the Triggers spec's one-Openable-per-element rule). Both export `nfsToggler`, so `#t="nfsToggler"` works in either mode. Why two classes: the Openable contract fixes a member named `isOpen`; visibility mode's two-way state is that model, while class mode's two-way state is `active` (building-blocks 1.4) and its `isOpen` is a read-only mirror. One class cannot declare `isOpen` as both a model and a read-only mirror, and two models of one state would need synchronising. The same split also gives each mode only its own inputs and outputs, and fixes the mode at compile time, as Foundation fixed it at init. [ADR 0016](../adr/0016-toggler-two-directives.md) records it.
- Each directive provides `{provide: nfsOpenableToken, useExisting: <itself>}`, so a bare `nfsClose` or `nfsToggle` inside the element acts on it (the Nearest Openable).
- No `nfsTogglerToken`: no child directive needs the Toggler (building-blocks Table B named one; nothing injects it).
- `nfsTogglerDefaultsToken`: `InjectionToken<NfsTogglerDefaults>` with the all-optional `{animate?: NfsMotionPair}`, injected with `{optional: true}` to seed the `animate` default (building-blocks 1.4, Shape B). `toggler` has no default, because a default class would have to change which directive matches, and selectors are static.
- Composition by placement: directives placed beside the Toggler on the same element (`nfsCallout`, `nfsMenu`, `nfsThumbnail`) bind their own classes, and the Toggler binds only `hidden`, `.is-hidden`, the Motion classes, and the consumer's `toggler` classes; Angular combines the class bindings of every directive on one element. The Toggler hosts none of them, because host directives are static and would give every Toggler another component's class. Its Triggers are usually `nfsButton` or `nfsCloseButton` hosts, whose classes and `type` those directives own.
- Entry point: `ngx-foundation-sites/toggler`, exporting both directives, the defaults token, and its interface. The Motion types and their pure mapping functions live in the primary entry point `ngx-foundation-sites`, beside the `nfs-motion` mixin's list (building-blocks 1.6 rule 4), because every directive with a Motion input shares them: `NfsMotionInName`, `NfsMotionOutName`, `NfsMotionClassList`, `NfsMotionIn`, `NfsMotionOut`, and `nfsMotionClasses` as the [Spec: Reveal](../issues/18-spec-reveal.md) defines them, and, for an `animate` Option that holds both directions in one string (the Toggler, the Dropdown pane, and Responsive Toggle), `NfsMotionPair` and `nfsMotionPairClasses`, defined here. The types add no runtime import; the two functions are the ones this entry point imports from there. Consumers import both directives; importing only `NfsToggler` leaves a class-mode element with no directive, like any directive that is not imported.
- Imports (documented usage): a component imports `NfsToggler` and `NfsClassToggler` wherever its template writes `nfsToggler`. A forgotten one fails to compile where the template references it (`#panel="nfsToggler"`, NG8003) or binds one of its inputs (`[isOpen]`, `[active]`, `[toggler]`, `[animate]`, NG8002); otherwise the element stays as written, with none of the Toggler's classes or attributes and no error, and a bare Trigger inside it finds no Nearest Openable.

### API

```ts
// Primary entry point, as the Reveal spec defines them for every Motion input:
//   NfsMotionInName   'fade-in' | 'slide-in-down' | 'slide-in-left' | 'slide-in-right' | 'hinge-in-from-top' | 'spin-in'
//   NfsMotionOutName  'fade-out' | 'slide-out-up' | 'slide-out-left' | 'slide-out-right' | 'spin-out'
//   NfsMotionClassList  `.${string}`, the consumer's own keyframe classes with a leading dot
//   NfsMotionIn = NfsMotionInName | NfsMotionClassList | '';  NfsMotionOut likewise with NfsMotionOutName
//   nfsMotionClasses(value): the classes one value binds (nfs-<name>, or the dot form without its dots)
// Added here, for an animate Option that holds both directions in one string:
type NfsMotionPair =
  | NfsMotionIn                    // entering only, or '' for none
  | NfsMotionOutName               // leaving only: a leaving name tells its own direction
  | `${NfsMotionInName | NfsMotionClassList} ${NfsMotionOutName | NfsMotionClassList}`; // Foundation's "in out"
function nfsMotionPairClasses(value: NfsMotionPair): {in: readonly string[]; out: readonly string[]}; // each half through nfsMotionClasses; a value that does not split into one entering and one leaving token maps to none in either direction

interface NfsTogglerDefaults {
  animate?: NfsMotionPair;
}
const nfsTogglerDefaultsToken: InjectionToken<NfsTogglerDefaults>;

class NfsToggler implements NfsOpenable {   // [nfsToggler]:not([toggler]), exportAs 'nfsToggler'
  readonly isOpen: ModelSignal<boolean>;     // default: false if the host has a static hidden attribute, else true
  readonly animate: InputSignal<NfsMotionPair>; // default from nfsTogglerDefaultsToken, else ''
  readonly id: InputSignal<string>;          // default: generated 'nfs-toggler-...'
  readonly triggerRole: Signal<'disclosure'>;
  readonly opened: OutputRef<void>;
  readonly closed: OutputRef<void>;
  open(trigger?: HTMLElement): void;
  close(result?: unknown): void;             // result is ignored
  toggle(trigger?: HTMLElement): void;
}

class NfsClassToggler implements NfsOpenable { // [nfsToggler][toggler], exportAs 'nfsToggler'
  readonly toggler: InputSignalWithTransform<readonly string[], string>; // the consumer's own classes; leading dots stripped, split on whitespace; no value: no class
  readonly active: ModelSignal<boolean>;     // default: true if the static class attribute contains every class of a non-empty static toggler
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
| `isOpen` | `model()` | `boolean` | `false` when the host has a static `hidden` attribute, else `true` | Visibility read with `:hidden` at init | Read from the static markup (the same on server and client) instead of computed style; a bound value wins; `model()` has no transform, so a static `isOpen="false"` is a type error under strict templates: write `hidden` or `[isOpen]="false"`. A static `class="is-hidden"` copied from Foundation's markup does not seed it and is removed while the element is shown |
| `animate` | `input()`, explicit type argument `NfsMotionPair` | an entering value, a leaving Motion name, or an entering and a leaving value in Foundation's order; each value a Motion name or an Application class that is a keyframe animation, with a leading dot; or `''` | `nfsTogglerDefaultsToken.animate`, else `''` | `data-animate="in out"` | A Motion name binds its `nfs-` keyframe class, so Foundation's values copy unchanged (`animate="hinge-in-from-top spin-out"`); a leaving name alone animates the close and opens at once (`animate="slide-out-right"`), an entering value alone animates the open and closes at once; the dot form (`animate=".brand-in .brand-out"`) binds the consumer's own classes without their dots, one class per half, because a space separates the halves (ADR 0039: inputs that apply the consumer's own classes stay); `''` animates nothing and overrides the Defaults token; a library class name (`nfs-fade-in`), a Motion UI name `nfs-motion` has no class for, a misspelt name, and a leaving name in the entering half fail to compile; `animate` takes one entering and one leaving value, so a value of another shape, reached through `$any()` or through a value that starts with a dot (`'.a .b .c'`, `'.a fade-in'`), animates nothing; a Motion name animates only with `@include nfs-motion;` compiled, and a dot-form class only when it is a keyframe animation (not a Motion UI transition class) and does not start with `nfs-` (the library's Motion is written by its name, `animate="fade-in"`); not required for visibility mode |
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
| `toggler` | `input()` with transform | `string` in, `readonly string[]` out | required by the selector | `data-toggler=".class"` | Application class names, never a Foundation or library class (ADR 0039): a hiding class (`is-hidden`, `hide`, `invisible`) belongs to visibility mode, whose triggers announce shown and hidden; `expanded` (the Menu Variant of Foundation's own Toggler example), a State class (`is-*`), and a library class (`nfs-*`) belong to the directive that binds them, so write `toggler` without a value and bind that directive's input from `active` (`[expanded]="menuBar.active()"` on `nfsMenu`); leading dots stripped; whitespace-separated names become several classes (jQuery `toggleClass` parity; Angular class-map keys cannot hold spaces); no value, the bare attribute, switches no class, so `active` can drive a Foundation Variant input bound from it |
| `active` | `model()` | `boolean` | `true` when the static `class` attribute contains every class of a non-empty static `toggler`, else `false` | `hasClass` at init | Read from the static markup; with a bound `[toggler]` or a `toggler` with no value the default is `false`; a bound `[active]` wins |
| `activeChange` | output (from the model) | `boolean` | | `on.zf.toggler` / `off.zf.toggler` | One output with the new value (building-blocks 1.4 mapping) |
| `isOpen` | read-only signal | `boolean` | mirrors `active` | None | Only for the Openable contract (Triggers read it for `aria-pressed`); bind `active`, not `isOpen` |
| `id` | `input()` | `string` | generated `nfs-toggler-...` | The consumer's `id` | Bound to the host; the toggle-button role renders no `aria-controls`, so it matters only as the contract's member |
| `triggerRole` | read-only signal | `'toggle-button'` | constant | None | Openable contract |
| `open`, `close`, `toggle` | methods | | | `toggle()` | Set `active`; no animation, no Completion outputs (Foundation has none in class mode) |

Behaviour rules:

- Initial state from markup: the defaults are read with `inject(new HostAttributeToken(...), {optional: true})` in the field initialisers (`hidden` in visibility mode; `class` and `toggler` in class mode), the Button spec's mechanism. A static attribute is part of the template, so the server and the client compute the same value, and the dynamic host binding then owns the attribute or class (Angular's host-binding collision rule: dynamic wins over static). Without this seeding, `class="compact"` with `toggler="compact"` would lose its static class to the `false` binding. Class mode reads only the consumer's own classes, which building-blocks 1.4 allows; no directive here reads a static Foundation class to seed state. Visibility mode reads no `class`: a copied static `is-hidden` loses to the dynamic `.is-hidden` binding while the element is shown, so the documented closed start is the `hidden` attribute or `[isOpen]="false"`, never `class="is-hidden"`.
- Visibility is expressed twice on purpose: the `hidden` attribute (hidden content is gone from rendering, the accessibility tree, and the tab order in every browser, also without author CSS) and Foundation's `.is-hidden` class (which beats Foundation component `display` rules that `[hidden]` loses to). Neither `inert` nor `aria-hidden` is added: `display: none` already removes the content (building-blocks 1.10).
- Model changes from any source (a method, a Trigger, a bound `[isOpen]`, `isOpen.set()`) drive the same animation and Completion outputs; the methods only add the trigger bookkeeping.
- A class-mode Toggler whose `toggler` has no value is a state holder: its Triggers render `aria-pressed` from `active`, and the look comes from whatever input the developer binds from `active` (`[expanded]` on `nfsMenu`, `[expanded]` on `nfsButton`). The bound directive renders its class on the server from the same state, so first paint and hydration agree.
- Focus: opening never moves focus (disclosure: focus stays on the trigger). When `close()` or `toggle()` closes the element while focus is inside it (a bare `nfsClose` inside), the directive records that before changing state and, in the render callback after the element is hidden, focuses the `trigger` passed to the last `open()` if it is still connected and focusable. Otherwise focus is the consumer's: `closed` is the place to move it (the dismissible-callout case, where no trigger ever opened the element). Model-driven closes move no focus.
- `animate` belongs to visibility mode: `NfsClassToggler` has no `animate` input, so a class-mode Toggler ignores a static `animate` attribute (Foundation let `animate` win, so a copied `data-toggler data-animate` pair written as `toggler` plus `animate` animates nothing); remove `toggler` to animate.
- `animate` takes one entering and one leaving value, each a Motion name whose keyframe class `@include nfs-motion;` compiled, or the consumer's own class with `@keyframes`, written in the dot form without an `nfs-` prefix (the library's Motion is written by its name: `animate="fade-in"`). A class that starts no CSS animation when its phase begins (a Motion name without the `nfs-motion` include, a class of the consumer's own without `@keyframes`, a Motion UI transition class given in the dot form) completes its phase at once; a value that does not split into one entering and one leaving value (three or more tokens, or a leaving value before an entering one), which the type admits only through a value that starts with a dot (`'.a .b .c'`, `'.a fade-in'`), maps to no class in either direction and animates nothing.

### Implementation level and primitives

Implementation level: native platform, with thin custom Angular directives. The platform does the work: the `hidden` attribute and CSS `display: none` hide, class bindings switch classes, CSS `@keyframes` animate, and native buttons activate. `@angular/aria` 22.2 has no disclosure or toggle-button pattern; `@angular/cdk` contributes only `_IdGenerator` (building-blocks 1.5). `<details>` is not the base: its `<summary>` must be the first child of the element it opens, so the trigger cannot sit elsewhere, cannot be one of several triggers or control several targets, and cannot express class mode; and animating its close needs `::details-content`, `interpolate-size`, or `transition-behavior: allow-discrete`, all out of target (the web platform features research, sections 4, 5, 7). `popover="manual"` is out of target (Firefox 125) and places the element in the top layer, while Toggler targets are in-flow content (the web platform features research, section 2).

Primitives: `model()`, `input()` with a transform, `output()`, `computed()`, one `linkedSignal` for the animation phase (derived from `isOpen`, reset to idle on completion; building-blocks 1.4), `afterRenderEffect` for completion, focus return, and the Completion outputs, `inject()` with `HostAttributeToken`, `_IdGenerator`, host metadata for the class map, `[attr.hidden]`, `[attr.id]`, and the `animationend`/`animationcancel` listeners, `NgZone.runOutsideAngular` for the fallback timer, and two pure functions (the shared `nfsMotionPairClasses`, which splits `animate` into its halves, and the shared `nfsMotionClasses`, which maps each). No CDK beyond `_IdGenerator`, no Aria, no observers, no services.

Render hooks and lazy loading (building-blocks 1.5 and 1.9): the completion `afterRenderEffect` re-runs only when the phase or the committed state changes; `afterEveryRender` is not used, because nothing needs to run on renders that change neither. `injectAsync` is not used: the directive injects no service beyond `_IdGenerator`, its first-paint state is host bindings that must be in the server HTML, and it must be live at hydration so a replayed Trigger click toggles it at once; the entry point is its own, so a consumer's `@defer` splits it.

Fallback: none needed. Every mechanism is a platform feature in target or Angular behaviour the prototypes confirmed (keyframe State classes in three engines, P47; no animation at hydration through State classes, P52). The typed `animate` value is a template-literal union: the shape of the Class breakpoint queries whose strict-template checking the [Decide: typed Variant inputs over open Sass maps](../issues/81-decide-typed-variant-inputs-open-sass-maps.md) probes measured, over the name unions and the `` `.${string}` `` dot form that the [Re-run: Reveal spec under the class rule](../issues/110-rerun-reveal-class-rule.md) measured with `ngc` 22.2.0; the pair type itself was compiled with `tsc` 6.0.3 by the [Consistency review: the class-rule wave](../issues/133-consistency-review-class-rule-wave.md) (Foundation's forms compile; a leaving name first, a library class name, and three names fail; a value that starts with a dot also admits shapes `nfsMotionPairClasses` cannot split, which animate nothing), and its first browser-level and typings cases confirm it under strict templates.

### Comparison with Angular Material

Material has no Toggler counterpart (the Angular Material reference research summary table has no Toggler row). The nearest shapes, for reference only:

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
| Target | `id`; `hidden` and `.is-hidden` while hidden; no role, no `aria-hidden`, no `inert` | `id`; the consumer's toggled class while active (none when `toggler` has no value); no role |
| `nfsToggle` | `aria-expanded` from `isOpen`, `aria-controls` = target id | `aria-pressed` from `active`; no `aria-expanded`, no `aria-controls` |
| `nfsOpen` | `aria-expanded`, `aria-controls` | nothing (the Triggers ARIA table) |
| `nfsClose` | nothing | nothing |
| Multi-target `nfsToggle` | one aggregate `aria-expanded`, all ids in `aria-controls` (Triggers spec) | one aggregate `aria-pressed`; the targets of one array share one mode, because with mixed modes the first target's role decides the ARIA (Triggers spec) |

- Class mode renders `aria-pressed` because a layout or theme class expands nothing (the ARIA APG patterns research, Toggler: "`aria-expanded` would be wrong here because nothing is expanded"). The APG requires that a toggle button's label does not change with its state; the consumer keeps "Compact layout" as the label rather than switching between "Expand" and "Collapse". A Menu switched to `expanded` through class mode is such a layout change: `aria-pressed`, not `aria-expanded`.
- Visibility mode is a disclosure; its content is not a dialog or a popup, so no `aria-haspopup`.
- Triggers are native `<button>` elements (the Triggers spec's documented usage); Foundation's `<a data-toggle>` without `href` becomes a button, usually an `nfsButton` or an `nfsCloseButton`, which default `type="button"`.

| Key | Where | Effect | Owner |
| --- | --- | --- | --- |
| Enter, Space | On a Trigger button | Toggles (native `click`) | Native button, Triggers |
| Tab, Shift+Tab | | Hidden content is skipped (`display: none`) | Native |
| Escape | | Nothing by default: the APG disclosure pattern has no Escape. Content shown on focus (the `data-toggle-focus` replacement) must be dismissible (WCAG 1.4.13), so that usage adds `(keydown.escape)="hint.close()"` on the field | Consumer |

Focus rules: opening leaves focus on the trigger; closing from inside returns focus to the Trigger that opened it (API behaviour rules); the dismissible-callout case moves focus in `closed`.

WCAG 2.2 AA requirements (requirements, not recommendations; the story gate runs axe with the WCAG 2.2 AA rule set, `target-size` included, and the criteria axe cannot judge are asserted in play functions):

| Criterion | Requirement for Toggler | Foundation default and what makes it pass |
| --- | --- | --- |
| 4.1.2 Name, Role, Value | Every Trigger exposes the target's state: `aria-expanded` in visibility mode, `aria-pressed` in class mode, correct in the server HTML and after every change, including the aggregate value of a multi-target Trigger. A class-mode Trigger's accessible name does not change with its state. The target itself claims no role | Foundation stamped `aria-expanded` in both modes and stopped updating multi-id triggers; the Triggers' host bindings on the Openable's `isOpen` pass by construction. The label rule is the consumer's; the `toggler--class-mode` story asserts the name is unchanged after a click |
| 1.3.1 Info and Relationships | A visibility-mode Trigger names the target in `aria-controls` | Triggers render it from `id`, which always exists (consumer or generated) |
| 2.1.1 Keyboard | Every Trigger is operable from the keyboard | Native `<button>` Triggers, as the Triggers spec documents. Foundation's `<a data-toggle>` without `href` failed this |
| 2.4.3 Focus Order | Hidden content leaves the tab order; focus never stays on or inside hidden content: closing from inside returns focus to the Trigger that opened it, and a Toggler that was never opened by a Trigger (the dismissible callout) has its focus moved in `closed` | `hidden` and `.is-hidden` give `display: none`; focus return is library behaviour; the `closed` step is required consumer code in that usage, and `toggler--closable` asserts it |
| 2.4.7 Focus Visible | Every Trigger shows a visible keyboard focus indicator | Passes with Foundation's defaults: Foundation removes the outline only under what-input's `[data-whatinput='mouse']`/`'touch'` attributes (`disable-mouse-outline`, normalize), which the library never loads and which keyboard input never sets, so `nfsButton` hosts, `nfsCloseButton` hosts, and plain buttons keep the browser's focus ring. No rule needed |
| 2.4.11 Focus Not Obscured (Minimum) | Opening a Toggler never covers the focused Trigger; closing never leaves focus on something hidden | Toggler content is in-flow (it pushes the page, it does not overlay it), so it cannot cover the Trigger; content meant to float over the page is a Dropdown pane, not a Toggler. The hidden case is 2.4.3's focus rule |
| 2.5.8 Target Size (Minimum) | Every Trigger is at least 24 by 24 CSS px | Met by size, not by the spacing exception: an `nfsButton` Trigger through the `nfs-button` floor ([Spec: Button](../issues/37-spec-button.md)), and every close button is at least 24 by 24 px through the `nfs-close-button` floor ([Spec: Close Button](../issues/83-spec-close-button.md)). The Toggler adds no rule; a Trigger that is neither is the consumer's to size. axe's `target-size` rule runs in every story, and `toggler--closable` asserts the close button's box |
| 1.4.13 Content on Hover or Focus | Content shown on focus (the `data-toggle-focus` replacement) is dismissible without moving focus, and persists while focus stays | Required markup in that usage: `(keydown.escape)="hint.close()"` beside `(focus)`/`(blur)`; `toggler--focus-hint` asserts Escape hides it and focus stays on the field |
| 3.2.1 On Focus, 3.2.2 On Input | No change of context follows focus or input: showing a hint on focus, and switching a class or visibility on button activation, change content in place without moving focus, opening windows, or navigating | By construction: the Toggler declares no focus or input listeners; Triggers act on `click` only |
| 2.2.2 Pause, Stop, Hide | Toggler animations start only from a user action and end well under 5 s | `nfs-motion` defaults to 500 ms; nothing auto-plays |

Contrast of a close button's glyph against a dismissible callout's background (1.4.11) is the Close Button's and the Callout's: their specs state the settings that reach it on the page and on every callout background ([Spec: Close Button](../issues/83-spec-close-button.md), [Spec: Callout](../issues/89-spec-callout.md)). Reduced motion (`prefers-reduced-motion`) is honoured on top of AA (Animation below).

### Rendered HTML

Directive attributes (`nfstoggler`, `nfsbutton`, `nfscallout`, `nfsmenu`) stay in the DOM and are omitted below for brevity; static attributes that feed inputs (`animate`, `toggler`) stay and are shown. Server HTML carries `jsaction="click:;"` on each Trigger (the replay annotation for the Triggers' host listener); the Toggler target has no replayable listener (`animationend` and `animationcancel` are not replay types), so it carries none. Generated ids differ between server and client and are rewritten at hydration, because `id` and `aria-controls` are both host bindings. The consumer markup writes no Foundation or library class; every class below comes from a directive.

```html
<!-- Visibility mode, animated, starting closed -->
<button nfsButton [nfsToggle]="panel">Toggle panel</button>
<div nfsCallout nfsToggler #panel="nfsToggler" id="panel" animate="hinge-in-from-top spin-out" hidden>
  <h4>Hello!</h4>
</div>

<!-- server, and hydrated before any click -->
<button class="button" type="button" aria-expanded="false" aria-controls="panel" jsaction="click:;">Toggle panel</button>
<div id="panel" animate="hinge-in-from-top spin-out" class="callout is-hidden" hidden="">...</div>

<!-- hydrated, after a click, while the enter animation runs -->
<button class="button" type="button" aria-expanded="true" aria-controls="panel">Toggle panel</button>
<div id="panel" animate="hinge-in-from-top spin-out" class="callout nfs-hinge-in-from-top">...</div>
<!-- after animationend: opened is emitted -->
<div id="panel" animate="..." class="callout">...</div>

<!-- after a second click, while the leave animation runs (aria-expanded is already "false") -->
<div id="panel" animate="..." class="callout nfs-spin-out">...</div>
<!-- after animationend: closed is emitted -->
<div id="panel" animate="..." class="callout is-hidden" hidden="">...</div>

<!-- Visibility mode, no animation, starting open, generated id -->
<button nfsButton [nfsToggle]="notes">Notes</button>
<section nfsToggler #notes="nfsToggler">...</section>
<!-- server -->
<button class="button" type="button" aria-expanded="true" aria-controls="nfs-toggler-a1b2-0" jsaction="click:;">Notes</button>
<section id="nfs-toggler-a1b2-0">...</section>

<!-- Class mode switching a Foundation Variant: the Menu directive owns .expanded -->
<button nfsButton [nfsToggle]="menuBar">Expand menu</button>
<ul nfsMenu nfsToggler toggler #menuBar="nfsToggler" [expanded]="menuBar.active()" id="menuBar">...</ul>
<!-- server -->
<button class="button" type="button" aria-pressed="false" jsaction="click:;">Expand menu</button>
<ul toggler="" id="menuBar" class="menu">...</ul>
<!-- hydrated, after a click: nfsMenu binds .expanded from its input -->
<button class="button" type="button" aria-pressed="true">Expand menu</button>
<ul toggler="" id="menuBar" class="menu expanded">...</ul>

<!-- Class mode switching the consumer's own class, starting active from markup -->
<section nfsToggler toggler="compact-layout" class="compact-layout">...</section>
<!-- server: unchanged, active() is true -->
<section toggler="compact-layout" class="compact-layout" id="nfs-toggler-a1b2-1">...</section>
```

### Animation

Per ADR 0003 and building-blocks 1.6 rule 1: the target stays in the DOM, so it animates through bound classes and CSS keyframes, never `animate.enter`/`animate.leave` (which play again at hydration on server-rendered elements, [Prototype: `animate.enter` at hydration](../issues/52-prototype-animate-enter-hydration.md)). Class mode has no animation (Foundation has none); a consumer's own CSS transition on the toggled class is theirs, and a Foundation Variant bound from `active` animates only as far as Foundation's CSS for that Variant does.

Visibility mode phases, held in a `linkedSignal` derived from `isOpen`:

| Phase | Entered when | Host state |
| --- | --- | --- |
| idle | first render (server and client), and after every completion | open: no `hidden`, no Motion class; closed: `hidden`, `.is-hidden` |
| entering | `isOpen` becomes `true` and an in-class exists and animations are enabled | no `hidden`, no `.is-hidden`, the in-class bound |
| leaving | `isOpen` becomes `false` and an out-class exists and animations are enabled | still shown, the out-class bound |

- Opening: `hidden` and `.is-hidden` go and the in-class is bound in the same change detection pass, so the keyframes start from their first frame. Closing: the out-class plays on the visible element; `hidden` and `.is-hidden` are bound, and the out-class removed, in the pass after completion. `isOpen` (and so `aria-expanded`) changes at request time, as the Openable contract says.
- Without a class for a direction, or with `nfsAnimationsToken` `{disabled: true}`, the phase goes straight to idle: the element shows or hides in the same pass.
- Completion: in an `afterRenderEffect` read phase after the class is bound, the directive reads the host's computed `animation-name`, `animation-duration`, `animation-delay`, and `animation-iteration-count`, and takes the longest finite animation (Angular's own method for `animate.leave`). If there is none (the stylesheet is missing, or `nfs-motion` was not included), the phase completes at once. Otherwise it completes on the host's `animationend` or `animationcancel` for that animation name with `event.target` equal to the host, or on a fallback timer of the measured length plus 100 ms, started outside the Angular zone, whichever comes first. This refines building-blocks 1.6 rule 1's "declared duration": the length of Toggler's Motion classes is set by the consumer's `nfs-motion($duration)` or by the consumer's own keyframes, which no design-time constant knows; the case the fixed timer protects (the animation is missing) measures zero and completes immediately. P47's dropped-stylesheet case therefore still completes.
- Interruption: toggling during a phase recomputes the phase from the new `isOpen` (entering switches to leaving and back); the interrupted phase emits nothing, and its timer is cleared.
- Completion outputs: once the phase is idle and the committed state differs from the last emitted one, the render callback emits `opened` or `closed` (no emission for the initial state). Without an animation they fire in the render callback after the pass that showed or hid the element, so a handler always sees the final DOM.
- Motion names: `animate` takes Foundation's Motion UI names, typed `NfsMotionInName` and `NfsMotionOutName`, the names the library's `nfs-motion` mixin emits keyframe classes for (building-blocks 1.6 rule 4): `fade-in`, `slide-in-down`, `slide-in-left`, `slide-in-right`, `hinge-in-from-top`, `spin-in`; `fade-out`, `slide-out-up`, `slide-out-left`, `slide-out-right`, `spin-out`. The directive binds `nfs-<name>`. Foundation's docs values copy unchanged (`animate="hinge-in-from-top spin-out"`). A library class name is never an input value (ADR 0039): `animate="nfs-fade-in"` fails to compile, as do a misspelt name and a Motion UI name the mixin lacks. Motion UI's own transition classes are never applied (two-frame protocol, P47). The consumer's own keyframe classes are written with a leading dot, Foundation's own way of writing a class in an attribute (`data-toggler=".class"`), one per half (`animate=".brand-in .brand-out"`), and bound without the dot; they must be keyframe animations (D18).
- Reduced motion: `nfs-motion` sets `animation-duration: 1ms` on its classes under `prefers-reduced-motion: reduce`, so `animationend` still fires and the change is effectively instant; no separate code path (P47). A class of the consumer's own must carry its own reduced-motion rule; the directive does not police it. The Breakpoint service spec's consuming-directive rule 3 lets a directive bind no Motion class while `reducedMotion` is true (Responsive Toggle and Dropdown do); Toggler keeps its one code path and does not read `reducedMotion`.
- Nothing animates at hydration or on the first client render: the phase starts idle, and the class list on the server equals the class list after hydration.

### Rendering modes

Per ADR 0008 and the Angular rendering modes research, section 7, rules 1 to 11:

- Server-side rendering and first paint: `hidden`, `.is-hidden`, the consumer's toggled class, and `id` are host bindings on signal state that exists on the server, seeded from static attributes the server also has (`hidden`, the consumer's own class), so the server HTML is the final first-paint state (rule 1). A Foundation Variant bound from class mode's `active` renders from its own directive's host binding, which reads the same state on the server. Closed content is in the server HTML, hidden; open content is visible. Nothing depends on a breakpoint or a measurement.
- Before hydration: construction reads only `HostAttributeToken` values and DI; no DOM writes outside host bindings, no `window`, no timers (rules 3 to 5). The phase `linkedSignal` touches nothing on the server; `afterRenderEffect` never runs there.
- Full hydration: host binding values equal the server's (generated ids aside, rewritten at hydration), so hydration changes nothing and there is no structure to mismatch. No animation replays, because the phase is idle on both platforms (rule 10; building-blocks 1.11 decision 10).
- Event replay: the Toggler has no replayable listener. The Trigger's `click` replays after hydration and calls `toggle()`, which reads state created at construction; the animation then plays as for any live click, because it is a real state change. Nothing here calls `preventDefault()`.
- Hydration boundary: a Trigger and its Toggler belong to one hydration boundary; template-reference scoping stops a Trigger outside a `@defer` block from naming a Toggler inside it (ADR 0013). A Toggler inside a block may be operated by a Trigger inside the same block, or by a bare `nfsClose` within itself.
- `@defer`: library templates contain no `@defer`; `ngx-foundation-sites/toggler` is its own entry point. Inside a dehydrated block the target is its server HTML; a Trigger click in the block hydrates it and replays. Inside `@defer (hydrate never)` the target keeps its server state forever: open content stays readable and closed content stays unreachable, so content that must be reachable is not placed closed inside `hydrate never`. Plain `@defer` renders the Toggler on the client; it starts idle, so an open Toggler appears without its enter animation. An enter animation on block appearance is not the Toggler's to give: the published hint to add `animate.enter` with an `nfs-` class would put a library class name in consumer code (ADR 0039).
- Prerendering: identical to server rendering; no request token is read (rule 11).
- Zoneless: signals only; the fallback timer runs outside the Angular zone and writes a signal.

### Sass and custom CSS

No library CSS and no `nfs-toggler` mixin. Hiding reuses Foundation's normalize `[hidden]` rule and global `.is-hidden` class (both from `foundation-global-styles`); animation reuses the `nfs-motion` keyframe classes. The Sass subsection under Further Notes gives the required content.

## Testing Decisions

A good test asserts what a user or assistive technology observes: whether the target is shown (`hidden`, `.is-hidden`, visibility), which classes it carries, the Trigger's `aria-expanded`, `aria-controls`, and `aria-pressed`, where focus lands, and when `opened`/`closed` fire relative to the animation. No test reads private fields or the phase signal. Prior art: the [Spec: Triggers (shared utility)](../issues/54-spec-triggers.md) test layers, whose test Openable the Toggler replaces in composition stories; no prior art exists in the new repository.

Story ids follow `toggler--<story>`: `toggler--class-mode`, `toggler--class-mode-initially-active`, `toggler--visibility`, `toggler--visibility-animated`, `toggler--initially-hidden`, `toggler--in-animation-only`, `toggler--multiple-targets`, `toggler--closable`, `toggler--focus-hint`, `toggler--programmatic`, `toggler--two-way-binding`. Stories follow the class rule: they write Foundation's elements with the library's directives (`nfsButton`, `nfsCallout`, `nfsMenu`, `nfsThumbnail`, `nfsCloseButton`) and no Foundation or library class; the only class a story writes is the consumer's own class of a class-mode Toggler, which the story names as such.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`, `npx nx test-storybook <lib>`)

Every story runs axe through `@storybook/addon-a11y` with `parameters.a11y.test = 'error'` and `runOnly` set to the six tags of the preview's rule set (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`), so `target-size` is part of the gate. Stories set `nfsAnimationsToken` only where noted; animated stories wait for the Completion output rather than a timeout.

- `toggler--class-mode`: Foundation's menu example on `ul[nfsMenu]` with `nfsToggler toggler` and `[expanded]="menuBar.active()"`; the `nfsButton` Trigger has `aria-pressed="false"` and no `aria-expanded`; clicking makes the Menu directive add `.expanded` and flips `aria-pressed`; the button's accessible name is unchanged; Enter and Space work through `userEvent.keyboard`.
- `toggler--class-mode-initially-active`: the consumer's own class, `class="compact-layout" toggler="compact-layout"`, renders with the class and `aria-pressed="true"`; a click removes the class and the printed `active()` reads `false`. The story's text says the class is an Application class and carries no Foundation style.
- `toggler--visibility`: no `animate`; the `nfsCallout` panel starts shown; a click sets `hidden` and `.is-hidden` at once and `aria-expanded="false"`; a second click restores it; `aria-controls` equals the panel id.
- `toggler--visibility-animated`: `animate="hinge-in-from-top spin-out"`; after a click `nfs-spin-out` is present and the panel still visible, then `closed` fires (shown in the story) and the panel is hidden; reopening binds `nfs-hinge-in-from-top`, then `opened` fires and the class is gone.
- `toggler--initially-hidden`: a panel written with `hidden` and one written with `[isOpen]="false"` both start closed with `aria-expanded="false"` on their buttons.
- `toggler--in-animation-only`: `animate="fade-in"`; closing hides at once and `closed` fires.
- `toggler--multiple-targets`: Foundation's three-thumbnail example with `img[nfsThumbnail]` targets and Foundation's `animate="hinge-in-from-top spin-out"`; all hide and show together; hidden thumbnails are not visible despite Foundation's `.thumbnail { display: inline-block }`.
- `toggler--closable`: an `nfsCallout` Toggler with `animate="fade-out"` (an out-name only) holds an `nfsCloseButton` with a bare `nfsClose`; a click hides it with `nfs-fade-out` and opens nothing; the story's `(closed)` handler moves focus to a following heading, and the play function asserts focus landed there; the close button's box is at least 24 by 24 px.
- `toggler--focus-hint`: an input with `(focus)`/`(blur)`/`(keydown.escape)` bindings and an `nfsCallout color="secondary"` hint written with `hidden`; focusing shows it, Escape hides it, blur hides it.
- `toggler--programmatic`: `nfsButton` controls calling `open()`, `close()`, `toggle()` through the template reference; a bare `nfsClose` inside the opened panel closes it and focus returns to the button that opened it.
- `toggler--two-way-binding`: `[(isOpen)]` on a visibility-mode panel and `[(active)]` on the menu's class-mode Toggler, whose signal also feeds `nfsMenu`'s `[expanded]`, both shown in the story; clicking Triggers updates them and changing them from a checkbox updates the targets.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

Vitest browser mode under the Angular unit-test builder (`npx nx test <lib>`, Chromium headless): TestBed specs in `<name>.spec.ts` next to the directive, over a bare test host component, zoneless with `await fixture.whenStable()`, asserting DOM and ARIA state; no story is mounted here and no axe runs here.

- Directive matching: a host with a static `toggler` value, one with a bare `toggler`, one with `[toggler]` bound, and one without; exactly one Openable resolves on each (`nfsOpenableToken` from an inner element), of the right class; `#t="nfsToggler"` resolves in both modes.
- Initial state seeding, driven by data: static `hidden`, no `hidden`, and bound `[isOpen]` overriding each; static class with every, some, and none of the static `toggler` classes; a bare `toggler` and a bound `[toggler]` defaulting `active` to `false`.
- A copied `is-hidden`: on an open visibility-mode host the class is stripped and the element is shown; on a host also written with `hidden` it stays bound while the element is closed.
- `toggler` transform: leading dots, several classes, surrounding whitespace, the empty value.
- Class mode as a Variant source: a test directive with a boolean input that binds a class, bound from `active` on the same element, follows `nfsToggle` clicks, while the Toggler itself adds no class.
- Motion names: each `NfsMotionPair` shape binds the expected classes for each direction (an entering value alone closes at once; a leaving name alone opens at once); `''` overrides a Defaults token default; the dot form binds the consumer's own classes without their dots, with a test stylesheet's keyframes, alone and paired with a Motion name; a value of another shape, reached through `$any()` or through a value that starts with a dot (`'.a .b .c'`, `'.a fade-in'`), animates nothing.
- Phases with a test stylesheet: entering and leaving class lists after each step; `opened`/`closed` emitted once, after `animationend`, in order; interruption mid-leave emits only `opened` for the final state; `animationend` from a child element does not complete the phase; `animationcancel` completes it.
- Fallback paths: a Motion class with no keyframes completes at once; an animation whose `animationend` is suppressed completes after the measured length plus 100 ms (fake timers); `nfsAnimationsToken` `{disabled: true}` skips the Motion classes entirely.
- Reduced motion: with `prefers-reduced-motion: reduce` emulated and the `nfs-motion` output loaded, completion arrives within a frame or two.
- Focus return: a bare `nfsClose` inside, after `open(trigger)`, returns focus to the trigger; after a model-driven close focus is not moved; a disconnected trigger is not focused.
- Defaults token: an `animate` default applies when the attribute is absent and is overridden by it.
- Zoneless: the suite runs with zoneless change detection and `fixture.whenStable()`.

### 3. Node-level Vitest

- SSR smoke: `renderApplication` over a fixture with a closed animated `nfsCallout` Toggler (static `hidden`), an open unanimated one with a generated id, a class-mode `ul[nfsMenu]` with a bare `toggler` and `[expanded]` bound from `active`, a class-mode Toggler initially active from the consumer's own class, a multi-target Trigger, and a bare `nfsClose` on an `nfsCloseButton` inside a callout. Assert `whenStable()` resolves; the server HTML matches the Rendered HTML section (`hidden=""`, `.is-hidden`, `class="menu"` without `expanded`, the consumer's own class, ids, Trigger ARIA); no `nfs-` Motion class is present; Toggler hosts carry no `jsaction`; the fixture's templates write no Foundation or library class. Runs under `npx nx test <lib>` in `toggler.ssr.spec.ts` through the shared `renderServer()` helper; `npx nx test-node <lib>` only if the server path depends on the DOM adapter; the runner is the [Prototype: Rendering-mode test seam](../issues/59-prototype-rendering-mode-test-seam.md).
- Pure logic, table-driven: the `toggler` transform, the shared `nfsMotionPairClasses` (an entering name, a leaving name, a pair, `''`, the dot form alone and in either half, a dot-form `nfs-` class, a value that does not split into one entering and one leaving token, which maps to none in either direction, and shapes the type rejects), the direction rule, the initial-state functions over static attribute values, and the longest-animation reduction over computed-style lists.
- Sass compile: `@include nfs-motion;` emits an `nfs-<name>` keyframe class for every member of `NfsMotionInName` and `NfsMotionOutName`, so the types and the mixin cannot drift (the Reveal spec's Sass compile test covers `nfs-spin-in` as well).

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build:

- `toggler--visibility-animated` in Chromium, Firefox, and WebKit, plain and with `reducedMotion: 'reduce'`: the keyframes play (an `animationstart` is recorded) and `closed` fires; under reduced motion completion is immediate.
- `toggler--multiple-targets`: hidden thumbnails have zero bounding boxes in all three engines.

Against the prerendered fixture app (the harness from the rendering-mode test seam prototype):

- JavaScript disabled: screenshot plus `@axe-core/playwright` with the six tags; closed content is hidden, open content visible, class-mode classes as the state says.
- Hydration: no NG05xx in the console, `ngDevMode.componentsSkippedHydration === 0`, and no `animationstart` on any Toggler during hydration.
- Pre-hydration click with the main bundle delayed: a Trigger clicked before hydration toggles its Toggler exactly once after hydration, and the animated one plays its leave animation then.
- Dehydrated block: a Trigger and Toggler inside `@defer (hydrate when hydrateNow())` held `false`; clicking the Trigger hydrates the block and toggles the target.
- `@defer (hydrate never)`: the Toggler keeps its server state, and clicking its Trigger changes nothing and logs no error.

## Out of Scope

- `data-toggle-focus` and `data-closable` as directives (Triggers spec decisions D9, D10); this spec documents the replacements.
- Height or slide-down animation of in-flow content through a wrapper (the Accordion's grid technique): Foundation's Toggler animates with Motion classes only, and Toggler has no wrapper element.
- Motion UI transition classes, the `motion-ui` package, and the `fast`/`slow` speed modifiers (ADR 0003); Motion UI names outside the `nfs-motion` set, which a consumer writes as its own keyframe class in the dot form.
- Switching a Foundation or library class through `toggler` (D17): the directive that binds the class owns it, and class mode's `active` feeds its input.
- A Trigger-role override input for class mode. Decided at triage (2026-09-26; impact not HIGH because adding an input later breaks no one, confidence HIGH from the APG choosing the pattern by what the control does): class mode always renders `aria-pressed`, and content that shows or hides belongs in visibility mode.
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
| D4 | Initial state from static markup through `HostAttributeToken`: the `hidden` attribute in visibility mode, the consumer's own class in class mode; never a Foundation class | Foundation read the state from the DOM at init; static attributes are identical on server and client; stops the dynamic binding from stripping a static class; building-blocks 1.4: no directive seeds state from a Foundation class | Seeding from a static `is-hidden` (the published rule; a class-based second spelling, against ADR 0039); defaults that ignore the markup (the static class is silently removed); reading computed style (no server equivalent) |
| D5 | Visibility default open | Foundation's unhidden element is visible; the `data-closable` replacement and Foundation's docs panel start visible | Default closed (Material's `expanded: false`) |
| D6 | Class mode triggers render `aria-pressed`; visibility mode triggers render `aria-expanded` | APG: a layout or theme class expands nothing; disclosure for shown and hidden content | `aria-expanded` in both modes (Foundation) |
| D7 | State class keyframes for enter and leave; never `animate.enter` | Persistent element; `animate.enter` replays at hydration (P52); keyframe path confirmed in three engines (P47) | `animate.enter`/`animate.leave` with `@if` (removes content from server HTML and `aria-controls`) |
| D8 | Completion from the measured longest animation, then `animationend`/`animationcancel`, else a measured-length-plus-100-ms timer | Motion class lengths are the consumer's `nfs-motion($duration)`; a missing animation measures zero and completes at once; Angular measures the same way for `animate.leave` | A fixed declared duration (cuts long animations, waits needlessly when none run) |
| D9 | A missing out-name hides at once, and a missing in-name shows at once | Foundation's close never completed in that case | Waiting for a `transitionend` that never comes |
| D10 | `opened`/`closed` only in visibility mode; `activeChange` in class mode | Building-blocks 1.4 event mapping; class mode has no animation to complete | `opened`/`closed` in class mode |
| D11 | Focus returns to the Trigger that opened it only when a close from inside takes focus with it | APG focus persistence; Openable requirement; opening a disclosure keeps focus on the trigger | Always refocusing the trigger; never moving focus |
| D12 | No `nfsTogglerToken` | No child directive injects the Toggler | A plugin token by habit |
| D13 | `nfsTogglerDefaultsToken` with `animate` only, typed as the input is | Building-blocks 1.4 defaults rule; a default `toggler` would have to change which directive matches | A `toggler` default |
| D14 | `animate` takes typed Motion names that the directive maps to `nfs-` keyframe classes | The user's rule that a Motion input takes `'fade-in'`, never `'nfs-fade-in'` (ADR 0039); a closed type fails a typo, a library class name, and a name `nfs-motion` lacks at compile time; Foundation's values copy unchanged | A string of class names (the published D14, now against ADR 0039); applying Motion UI's own classes |
| D15 | `<details>` is not the base, but documented as the platform answer for the plain case | Summary must be the element's first child; no remote, multiple, or multi-target triggers; no class mode; close animation out of target | `<details>` as the implementation |
| D16 | No library CSS | Foundation's `[hidden]`, `.is-hidden`, and the `nfs-motion` classes cover everything | An `nfs-toggler` mixin |
| D17 | Class mode switches only the consumer's own classes; `toggler` without a value switches none, and a Foundation Variant is bound from `active` into the input of the directive that owns it | ADR 0039: every Foundation class has one owner, the directive that binds it (the Menu binds `.expanded` from `expanded`, building-blocks 1.9); the Toggler still supplies the state, the toggle-button role, and `aria-pressed`; the bare attribute keeps the selector partition of ADR 0016 | `toggler="expanded"` (a Foundation class as an input value, and two owners of one class); a placeholder Application class kept only to select class mode; no Toggler, with the consumer binding `aria-pressed` (the Triggers spec's D6 rejected consumer-bound `aria-pressed`) |
| D18 | `animate` is `NfsMotionPair`: an entering value, a leaving Motion name alone, or both in Foundation's order, over the Reveal spec's shared `NfsMotionIn` and `NfsMotionOut`, with the consumer's own keyframe classes in the dot form, one per half | One shape for every Motion input (the Reveal spec defines it for `animationIn`/`animationOut`; the dot form is Foundation's own class notation, measured by that ticket with `ngc` 22.2.0 strict templates); Motion UI's leaving names are disjoint from its entering ones, so a leaving name alone (`slide-out-right`) is the `data-closable` counterpart that the Callout and Triggers specs write, with no placeholder entering value; the published spec accepted the consumer's own keyframe classes, and ADR 0039 keeps inputs that apply the consumer's own classes | Pass-through class strings (the published spec; typos and `nfs-` names compile); a string type widened with `(string & {})`; dropping the consumer's own classes (a behaviour the class rule does not ask to remove); an object form `{in?, out?}` for them (a second shape beside the Reveal's dot form); a Motion registry (registries follow Sass settings, and the consumer's own keyframes have none); the Reveal's pair note alone, with the leaving half only after an entering one (no counterpart for `data-closable="slide-out-right"`) |
| D19 | A copied `class="is-hidden"` is stripped while shown; the documented closed start is the `hidden` attribute or `[isOpen]="false"` | building-blocks 1.4's rule for copied classes: the dynamic `.is-hidden` binding wins over the static class, so the state comes from `isOpen` alone | Honouring it as a seed (D4) |
| D20 | The `toggler` API text names the classes copied Foundation markup is likely to bring: the hiding classes (`is-hidden`, `hide`, `invisible`) belong to visibility mode, and `expanded`, the State classes (`is-*`), and the library's classes (`nfs-*`) to the directive that binds them | Foundation's own example (`.expanded`) and the `is-hidden` idiom are the likely copies; `is-` and `nfs-` mark Foundation's State classes and the library's classes; the rule itself is ADR 0039's | A complete list of Foundation classes (palette and size names come from the consumer's Sass) |
| D21 | Composition by placement: `nfsCallout`, `nfsMenu`, and `nfsThumbnail` beside the Toggler on its target, `nfsButton` and `nfsCloseButton` on its Triggers; the Toggler hosts none | Host directives are static, so hosting would give every Toggler another component's class; each directive owns its own classes | Hosting them; a Toggler input per component class |

### Usage examples

```ts
@Component({
  selector: 'app-page',
  imports: [
    RouterLink, NgOptimizedImage, NfsButton, NfsToggle, NfsClose, NfsCallout, NfsMenu, NfsThumbnail,
    NfsToggler, NfsClassToggler,
  ],
  template: `
    <!-- Class mode switching a Foundation Variant: the Menu directive keeps owning .expanded -->
    <button nfsButton fill="hollow" [nfsToggle]="menuBar">Full-width menu</button>
    <ul nfsMenu [expanded]="fullWidth()" nfsToggler toggler #menuBar="nfsToggler" [(active)]="fullWidth">
      <li><a routerLink="/one">One</a></li>
      <li><a routerLink="/two">Two</a></li>
    </ul>

    <!-- Class mode switching an Application class -->
    <button nfsButton [nfsToggle]="layout">Compact layout</button>
    <div nfsToggler #layout="nfsToggler" toggler="compact" id="content">...</div>

    <!-- Visibility mode, animated, starting closed: a disclosure -->
    <button nfsButton [nfsToggle]="panel">Toggle panel</button>
    <div nfsCallout nfsToggler #panel="nfsToggler" id="panel"
         animate="hinge-in-from-top spin-out" hidden (opened)="onPanelShown()">
      <h4>Hello!</h4>
      <button nfsButton color="secondary" nfsClose>Hide</button>
    </div>

    <!-- Multiple targets move together -->
    <button nfsButton [nfsToggle]="[thumb1, thumb2, thumb3]">Toggle all these</button>
    <img nfsThumbnail nfsToggler #thumb1="nfsToggler" animate="hinge-in-from-top spin-out" ngSrc="01.jpg" width="300" height="200" alt="Photo of Uranus.">
    <img nfsThumbnail nfsToggler #thumb2="nfsToggler" animate="hinge-in-from-top spin-out" ngSrc="02.jpg" width="300" height="200" alt="Photo of Neptune.">
    <img nfsThumbnail nfsToggler #thumb3="nfsToggler" animate="hinge-in-from-top spin-out" ngSrc="03.jpg" width="300" height="200" alt="Photo of Saturn.">
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
<!-- data-closable replacement: a Dismissible callout hidden in place; focus moves when it is gone -->
<div nfsCallout nfsToggler animate="fade-out" id="notice" (closed)="nextHeading.focus()">
  <p>Invoice sent.</p>
  <button nfsCloseButton nfsClose aria-label="Dismiss notice">
    <span aria-hidden="true">&times;</span>
  </button>
</div>
<h2 #nextHeading tabindex="-1">Invoices</h2>

<!-- Foundation's data-closable="slide-out-right": an out-name alone -->
<div nfsCallout color="success" nfsToggler animate="slide-out-right" (closed)="nextHeading.focus()">
  <p>Settings saved.</p>
  <button nfsCloseButton nfsClose aria-label="Dismiss message">
    <span aria-hidden="true">&times;</span>
  </button>
</div>

<!-- Removal with a library Motion: hide through the Toggler, then remove in closed, which fires
     once the element is hidden and its animation has ended (Triggers spec, D17) -->
@if (bannerShown()) {
  <div nfsCallout nfsToggler animate="fade-out" (closed)="bannerShown.set(false); main.focus()">
    <p>Maintenance tonight at 22:00.</p>
    <button nfsCloseButton nfsClose aria-label="Dismiss maintenance notice">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>
}
<main #main tabindex="-1">...</main>

<!-- The consumer's own keyframe classes, each with its own reduced-motion rule, in the dot form -->
<button nfsButton [nfsToggle]="promo">Show the offer</button>
<aside nfsToggler #promo="nfsToggler" animate=".promo-pop-in .promo-pop-out" hidden>...</aside>

<!-- data-toggle-focus replacement: open on focus, close on blur and Escape; the hint starts hidden -->
<input type="text" aria-describedby="form-hint"
       (focus)="formHint.open()" (blur)="formHint.close()" (keydown.escape)="formHint.close()">
<div nfsCallout color="secondary" nfsToggler #formHint="nfsToggler" id="form-hint" hidden>
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
// App-wide default animation for visibility-mode Togglers; satisfies keeps the value typed,
// because a provider's useValue is not
bootstrapApplication(App, {
  providers: [
    {provide: nfsTogglerDefaultsToken, useValue: {animate: 'fade-in fade-out'} satisfies NfsTogglerDefaults},
  ],
});
```

The directives beside the Toggler (`nfsCallout`, `nfsMenu`, `nfsThumbnail`, `nfsButton`, `nfsCloseButton`) are shown only to place it; their names and inputs belong to their own specs. The dismissible callouts follow the [Spec: Callout](../issues/89-spec-callout.md): the close button's box and colours are the Close Button's and the Callout's, and the consumer moves focus in `closed`.

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This plugin relies on Foundation's export mixin `foundation-global-styles` (its normalize `[hidden] { display: none }` rule and its global `.is-hidden { display: none !important }` class), plus the export mixins and Library mixins of the directives placed beside it (for example `foundation-menu` and `nfs-menu` for `.menu.expanded`, `foundation-thumbnail` for `.thumbnail`, `foundation-callout` and `nfs-callout` for a callout, `foundation-close-button` and `nfs-close-button` for a close button's 24 px floor). No library CSS; there is no `nfs-toggler` mixin. (1) Rules: none. (2) Reused settings and mixins: none beyond the export mixins named. (3) Custom properties: none. (4) Motion classes: none by default; with `animate`, the `nfs-motion` classes of the Motion names given, from `@include nfs-motion;` (Foundation's docs example `hinge-in-from-top spin-out` becomes `nfs-hinge-in-from-top` and `nfs-spin-out`; `fade-in fade-out` is the usual pair), and `nfs-motion`'s own `prefers-reduced-motion` block shortens them to 1 ms; a keyframe class of the consumer's own, in the dot form, carries its own reduced-motion rule; the directive adds and awaits no other animation, so there is no plugin-level override. (5) What breaks when an include is missing: without `foundation-global-styles` there is no `.is-hidden`, and the `hidden` attribute alone does not hide elements that a later Foundation rule gives a `display` value (`.menu`, `.thumbnail`); without `nfs-motion` the Motion classes have no keyframes, so the element shows and hides instantly and the Completion outputs still fire. (6) Variant properties: none; the Toggler has no Variant family.

### Platform features to adopt when the browser target moves

- Invoker Commands (Baseline newly available 2025-12-12, widely available about 2028-06): a Trigger can render `commandfor` with the Toggler's id and a custom `--nfs-toggle` command, handled by a `command` listener on the target; this needs consumer-supplied ids, and the click path stays until Angular replays `command` (Triggers spec, Further Notes).
- `@starting-style` and `transition-behavior: allow-discrete`: transition-based classes could then animate an element leaving `display: none`, so a Motion name could also map to a transition class; the keyframe classes stay valid.
- `hidden="until-found"` with the `beforematch` event (not Baseline widely available on 2026-05-07): find-in-page could reveal closed Toggler content, with `beforematch` setting `isOpen`; it would replace `.is-hidden` with `content-visibility: hidden`, so it needs its own design pass against Foundation's display rules.
- `popover="manual"` is not an upgrade path for in-flow Toggler content: it moves the element to the top layer. A Toggler meant to float over the page is really a Dropdown pane.
- `<details name>` and `::details-content`: make `<details>` a better native answer for grouped disclosures (the Accordion's concern), not a base for Toggler, whose triggers sit anywhere.

### Foundation behaviour changed or dropped

- `data-toggler="is-hidden"` (class mode used for visibility, inverted `aria-expanded`) becomes visibility mode with `hidden`, and the `toggler` API text names the old form.
- `data-toggler=".expanded"` on a Menu becomes `nfsMenu`'s `[expanded]` bound from the `active` of a class-mode Toggler written with `toggler` and no value: the Menu keeps its class, the Toggler its state.
- `aria-expanded` on class-mode triggers becomes `aria-pressed`; the single-id-only ARIA updates become one aggregate value.
- Initial state is read from static markup, not computed style, and never from a Foundation class: a copied `class="is-hidden"` is stripped while the element is shown.
- The error for a missing `toggler` becomes visibility mode, and a `toggler` with no value becomes the state-only class mode.
- `animate` with only an in-name now hides at once instead of never, and an out-name alone is valid.
- `data-animate` values copy unchanged as typed Motion names, which bind the library's `nfs-` keyframe classes; Motion UI's transition classes are never applied, names outside the `nfs-motion` set fail to compile (a developer writes such a name as its own keyframe class in the dot form), and the consumer's own keyframe classes take a leading dot.
- `data-open` and `data-close` triggers now work (Foundation gave them ARIA but no behaviour).
- `mutateme.zf.trigger` is dropped; `ResizeObserver` in the measuring plugins covers it.
- jQuery-only behaviour dropped: the `:hidden` visibility test, document-wide trigger discovery by attribute selector, and Motion's inline `show()`/`hide()` `display` writes.
