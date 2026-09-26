# Spec: Slider

Ticket: [Spec: Slider](../issues/32-spec-slider.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Built on the verdict of the [Prototype: Foundation-styled `<input type="range">` Slider](../issues/45-prototype-slider-range-input.md).

## Problem Statement

A developer building an Angular application on Foundation for Sites wants a slider that looks like Foundation's `.slider`: a track, a filled part, one handle for a single value or two handles for a range, horizontal or vertical, disabled, stepped, or on a non-linear scale. Foundation's Slider Plugin gives that look, but its markup and JavaScript leave the developer with problems an Angular library must not copy:

- The handle is a `<span role="slider">` that Foundation's jQuery drives: it builds the keyboard, pointer drag, touch emulation, ARIA values, and the value maths itself. The WAI-ARIA Authoring Practices warn that touch-based assistive technology may not be able to operate such a custom slider at all, which a native `<input type="range">` does not risk.
- The handles have no accessible name. Foundation's forms docs tell authors to put `aria-labelledby` on the `.slider` container, which is not the element that carries `role="slider"`. The docs markup also uses `tabindex="1"`, which the APG strongly advises against.
- With two handles, Foundation clamps each handle against the other but never updates `aria-valuemin`/`aria-valuemax`, so assistive technology is told a range the handle cannot reach. The first handle also stops one step before the second, so the two values can never be equal.
- The value lives in a hidden `<input>` or in an external input linked by `aria-controls`, and the only way to set it from code is to write that input and fire `change`. There are no value events a framework can bind; `moved.zf.slider` and `changed.zf.slider` are jQuery events, the second debounced by 500 ms.
- Foundation offers `Shift+Arrow` for a large step but not `Page Up`/`Page Down`, has no value text for non-linear scales (the announced number is the value, while the handle sits at a transformed position), and animates handle movement with a `requestAnimationFrame` loop whose duration must be kept in step with a Sass variable by hand.
- Foundation's native alternative, the `foundation-range-input` mixin, styles a lone `<input type="range">` but, in Foundation's own words, has no vertical orientation and no two handles.

A server-rendered Angular application adds a second problem: the server HTML must show every handle and the fill at the right place, must not break hydration, and a user who drags or presses a key before the page hydrates, or inside a `@defer (hydrate never)` block, must keep what they did.

## Solution

Two attribute directives on markup the developer writes: `nfsSlider` on Foundation's `.slider` container and `nfsSliderHandle` on one native `<input type="range">` per handle, with Foundation's own `<span class="slider-fill">` as the fill. The native inputs carry the keyboard, the pointer, the ARIA slider semantics, and form association for every form (single, two handles, vertical, disabled, stepped, non-linear, right-to-left), which the prototype confirmed in Chromium, Firefox, and WebKit at current and at target-era versions, axe included. Foundation's `foundation-range-input` mixin styles the thumbs, `foundation-slider` styles the track, the fill, `.disabled`, and `.vertical`, and the library's `nfs-slider` Library mixin adds only the rules Foundation cannot express, each with its reason.

Each handle exposes its value as a `value` model, so `[(value)]` works with a signal, and each handle is a Signal Forms custom control (`FormValueControl<number>`), so `[formField]` binds it and Angular's interop lets Reactive and template-driven forms bind it too. With two handles, each input's native `min`/`max` carries the dependent bound the APG multi-thumb pattern asks for. The container binds Foundation's `.vertical` and `.disabled` classes and positions `.slider-fill` through two custom properties it computes on the server as well. The native `input` and `change` events replace `moved.zf.slider` and `changed.zf.slider`, and the handle's `valueChange` is the model's change output.

Everything visible at first paint is a host binding, so the server HTML is the final DOM; the live `value` property is written only after the first render, so a value the user changed before hydration is adopted instead of reset.

## User Stories

1. As an application developer, I want to put `nfsSlider` on Foundation's `.slider` element and `nfsSliderHandle` on a native range input inside it, so that I get Foundation's slider look on a native control.
2. As an application developer, I want to bind `[(value)]` on a handle to a signal, so that the slider value is two-way without a hidden input.
3. As an application developer, I want to set the scale with `start`, `end`, and `step` named as in Foundation's docs, so that I can copy Foundation's `data-*` options.
4. As an application developer, I want Foundation's `<span class="slider-fill">` to show the selected part of the track, so that the slider looks like Foundation's.
5. As an application developer, I want two handles in one `.slider` to become a range slider without any extra option, so that Foundation's two-handle markup keeps working.
6. As a keyboard user, I want each handle of a range slider to stop at the other handle, so that the minimum never passes the maximum.
7. As a screen reader user, I want each handle of a range slider to report the range it can actually reach, so that the announced minimum and maximum are true.
8. As a user, I want the two handles to be able to hold the same value and still be separable at both ends of the track, so that I can select a single-value range and undo it.
9. As an application developer, I want `vertical` (or Foundation's `.vertical` class alone) to make a vertical slider, so that Foundation's vertical example works.
10. As a keyboard user, I want Up and Right to increase and Down and Left to decrease on a vertical slider, so that the keys behave the same in both orientations.
11. As an application developer, I want `disabled` (or Foundation's `.disabled` class alone) to disable the slider natively, so that no key, drag, or click can change it before or after hydration.
12. As an application developer, I want a `disabledInteractive` option that keeps a disabled slider focusable, so that a description can tell the user why it is unavailable.
13. As a keyboard user, I want the APG slider keys (arrows, Home, End, Page Up, Page Down) on every handle, so that I can reach any value quickly.
14. As a pointer user, I want to drag each handle and press the track to move a handle there, so that I do not have to drag at all.
15. As a user with a motor impairment, I want a single press on the track of a range slider to move the nearest handle, so that dragging is never the only pointer method.
16. As an application developer, I want `clickSelect` to turn track presses off, so that I can keep Foundation's option.
17. As an application developer, I want a `log` or `pow` scale with `positionValueFunction` and `nonLinearBase`, so that more of the track goes to the values that matter.
18. As a keyboard user on a non-linear slider, I want one key press to move one value step, so that the keys do not skip values on the stretched part of the scale.
19. As a screen reader user on a non-linear slider, I want to hear the value rather than the bar position, so that the number I hear is the number I chose.
20. As an application developer, I want `displayWith` to format the spoken value (units, currency, day names), so that `aria-valuetext` carries a friendly value.
21. As an application developer, I want `decimal` to round computed values, so that track presses and non-linear mapping produce clean numbers.
22. As an application developer, I want to show the value next to the slider in a `type="number"` input or an `<output>` bound to the same signal, so that Foundation's data binding example needs no special option.
23. As an application developer using Signal Forms, I want `[formField]` on a handle to bind its value, disabled state, readonly state, and touched state, so that the slider behaves like any other field.
24. As an application developer using Signal Forms, I want a range bound to two fields (`price.min`, `price.max`), so that each handle maps to one field.
25. As an application developer using Reactive or template-driven forms, I want `formControlName` or `ngModel` on a handle to work, so that existing forms can use the slider.
26. As a keyboard user, I want a visible focus indicator on the focused handle, so that I can see which handle my keys move.
27. As a pointer and touch user, I want every thumb to be at least 24 by 24 CSS pixels whatever my Foundation settings, so that each handle meets the WCAG 2.2 minimum target size.
28. As a user with low vision, I want the fill to contrast with the track by at least 3:1, so that I can see the selected part of the slider (WCAG 1.4.11).
29. As an application developer, I want my Sass compile to fail with the names of the settings to change when my slider colours miss 3:1, so that a non-compliant slider never ships.
30. As a user of a right-to-left page, I want the slider to run from right to left with the fill following, so that it matches the reading direction.
31. As an application developer, I want the native `input` and `change` events to fire for every user change, including track presses and non-linear key presses, so that I can listen for them as I would on any range input.
32. As an application developer, I want a `valueChange` output on each handle, so that I can react to value changes without two-way binding.
33. As a developer of a server-rendered application, I want the server HTML to carry every input's `min`, `max`, `step`, `value`, and the fill position, so that the first paint is correct.
34. As a user of a server-rendered page, I want a key press or a drag made before hydration to survive hydration, so that the page never undoes my input.
35. As a user of a server-rendered page, I want a press on the track of a range slider made before hydration to take effect once the page hydrates, so that early presses are not lost.
36. As a developer using `@defer (hydrate never)`, I want the slider to keep working as native range inputs, so that static regions stay usable without JavaScript.
37. As a developer of a prerendered site, I want the same output as server rendering, so that prerendering needs no special handling.
38. As a developer of a zoneless application, I want the directives to need no zone and no timers, so that they work with zoneless change detection.
39. As a user who prefers reduced motion, I want nothing on the slider to animate, so that the handle and fill move only when I move them.
40. As an application developer, I want the library to reuse my Foundation Sass settings for the thumb, track, fill, radius, and disabled opacity, so that the slider follows my theme with no extra configuration.
41. As an application developer, I want dev-mode warnings for an unlabelled handle, a third handle, an inverted pair of values, and another writer fighting the handle's value or bounds, so that I catch mistakes early.
42. As an application developer, I want to set application-wide defaults for `step`, `decimal`, `nonLinearBase`, and `positionValueFunction`, so that I can replace `Foundation.Slider.defaults`.
43. As an application developer, I want to import the Slider from its own entry point, so that a `@defer` block can split it with the rest of the deferred content.
44. As a library maintainer, I want every behaviour asserted through roles, attributes, classes, and pixels in stories, browser-level tests, a server-render smoke test, and e2e, so that regressions surface at the layer that owns them.

## Implementation Decisions

### Foundation contract

Features (Foundation's `docs/pages/slider.md` and `js/foundation.slider.js`): a `.slider` container with one or two `.slider-handle[data-slider-handle]` spans, one `.slider-fill[data-slider-fill]` span, and one hidden `<input>` per handle; the vertical form (`.vertical` class plus `data-vertical="true"`); the disabled form (`.disabled` class or `data-disabled`); data binding to an external `<input type="number">` through `aria-controls` on the handle; stepped values; non-linear `log` and `pow` scales; `_reflow` after un-hiding; and the separate native `<input type="range">` styled by `foundation-range-input`.

Options, from `Slider.defaults` in the source (not from the ticket's list; audit 0001 H6):

| Option (`data-*`) | Foundation default | Library | Reason |
| --- | --- | --- | --- |
| `start` | `0` | `nfsSlider` input `start` | Minimum of the scale |
| `end` | `100` | `nfsSlider` input `end` | Maximum of the scale |
| `step` | `1` | `nfsSlider` input `step`, Defaults token | Native `step` for linear sliders; value step for non-linear ones |
| `initialStart` | `0` | First handle's `value` model | The value belongs to the handle that carries it |
| `initialEnd` | `100` | Second handle's `value` model | Same; an unbound handle starts at `0`, clamped to its bounds (delta) |
| `binding` | `false` | Dropped | Bind the same signal or field to any input or `<output>`; no `aria-controls` link |
| `clickSelect` | `true` | `nfsSlider` input `clickSelect` | Track press moves the nearest handle |
| `vertical` | `false` | `nfsSlider` input `vertical`, binds `.vertical` | Changes directive behaviour (orientation, track-press geometry), so an input that binds the class (ADR 0010) |
| `draggable` | `true` | Dropped | Dragging is the native control's own behaviour; a non-draggable slider has no accessibility value and would need a CSS switch on the thumb pseudo-elements for no known use |
| `disabled` | `false` | `nfsSlider` input `disabled`, binds `.disabled` | Native `disabled` on the inputs by default |
| `doubleSided` | `false` | Read-only `doubleSided` signal | Foundation already forces it from the handle count; it is derived, not configured |
| `decimal` | `2` | `nfsSlider` input `decimal`, Defaults token | Rounds values the directive computes (track presses, non-linear mapping) |
| `moveTime` | `200` | Dropped | Timing option: native thumbs move instantly and the fill follows them (building-blocks 1.4) |
| `disabledClass` | `'disabled'` | Dropped | Class-name option; the class is the contract (building-blocks 1.4) |
| `invertVertical` | `false` | Dropped | Declared and never read in Foundation's source (dead) |
| `changedDelay` | `500` | Dropped | The native `change` event fires once per committed change (drag release, key press); consumers who want a debounce use Signal Forms `debounce()` |
| `nonLinearBase` | `5` | `nfsSlider` input `nonLinearBase`, Defaults token | Base of the `log`/`pow` mapping |
| `positionValueFunction` | `'linear'` | `nfsSlider` input `positionValueFunction`, Defaults token | `'linear' \| 'pow' \| 'log'`, Foundation's formulas |

Events:

| Foundation event | Library |
| --- | --- |
| `moved.zf.slider` (after the move animation) | Native `input` event on the handle's input (bubbles to the container) |
| `changed.zf.slider` (500 ms after the last change) | Native `change` event on the handle's input (bubbles) |
| (none) | `valueChange` on each handle, from its `value` model |
| `init.zf.slider`, `destroyed.zf.slider` | None (Angular lifecycle) |

Methods: `setHandles()` and `_reflow()` are dropped, because handle and fill positions are CSS computed from percentages and custom properties, so nothing needs re-measuring after the slider is shown. `_setHandlePos`, `_setInitAttr`, `_setValues`, `_handleEvent`, `_adjustValue` are private in Foundation and become the directives' internal value maths.

Dropped options: `binding`, `draggable`, `moveTime`, `disabledClass`, `invertVertical`, `changedDelay`; `doubleSided`, `initialStart`, and `initialEnd` are not options any more but derived state and handle models.

### CSS class to Angular mapping

| Foundation class or element | Angular | Rationale |
| --- | --- | --- |
| `.slider` | `NfsSlider` directive, selector `[nfsSlider]`, adds `.slider` as a static host class | The container Structural class; Foundation's track |
| `.slider-handle` span with `role="slider"` | Replaced by a native `<input type="range">` with the `NfsSliderHandle` directive, selector `input[type=range][nfsSliderHandle]` | The native input supplies keyboard, ARIA, pointer, and form association; styled by `foundation-range-input` |
| hidden `<input>` per handle | Removed | The range input is itself the form control (`name` goes on it) |
| `.slider-fill` span | Plain consumer markup, no directive | Styled by Foundation's `.slider-fill` rule and positioned by the container's custom properties; it has no behaviour |
| `.vertical` | State bound by `NfsSlider` from its `vertical` input | Orientation changes directive behaviour (ADR 0010) |
| `.disabled` | State class bound by `NfsSlider` while it or every handle is disabled | Foundation's disabled look |
| `.is-dragging` | Not bound | Foundation's rules for it only switch off the handle and fill transitions and set `cursor: grabbing` on the span handle; the library switches the fill transition off permanently and the native thumb has its own cursor |
| `input[type=range]` with `foundation-range-input` alone (no container) | No directive | A lone native range needs no Angular layer; Foundation's mixin already styles it |

### Hierarchy and DI shape

```
[nfsSlider]                                   NfsSlider (provides nfsSliderToken)
  input[type=range][nfsSliderHandle]          NfsSliderHandle (injects nfsSliderToken, required)
  input[type=range][nfsSliderHandle]          NfsSliderHandle (second handle: the range form)
  span.slider-fill                            plain markup
```

- Parent handle: `nfsSliderToken = new InjectionToken<NfsSlider>('nfsSliderToken')` in the plugin's token file with an `import type` of the class; `NfsSlider` provides it with `useExisting`. A handle injects it without `optional`, so a handle outside a slider fails at construction (building-blocks 1.9: the child cannot exist alone; a lone range input needs no directive). Inputs cannot contain inputs, so no nested slider exists and the token is never re-provided.
- Registration: each handle registers with the container in its constructor and unregisters in `DestroyRef.onDestroy`. The container keeps the handles in a signal. On the server and in the first client pass the order is registration order, which is template order; after a registration change on the client the container re-sorts the two handles by `compareDocumentPosition` in its next render callback, so a handle inserted later by `@if` still takes its DOM position. No `MutationObserver` is needed: two sibling inputs only change order by being destroyed and created. More than two handles is a dev-mode error.
- Sibling discovery: a handle reads its index and its sibling from the container's handle list (computed signals), which gives the dependent bounds and the clamp.
- Defaults token: `nfsSliderDefaultsToken`, an `InjectionToken<NfsSliderDefaults>` with the all-optional keys `step`, `decimal`, `nonLinearBase`, `positionValueFunction` (Material shape B; building-blocks 1.4 and Table B), injected with `{optional: true}` to seed the input defaults; the nearest provider wins.
- Forms: `NfsSliderHandle` implements `FormValueControl<number>` from `@angular/forms/signals` (type import only). Angular's control detection treats any directive with a `value` model on the element as the custom control, ahead of the native element path, so `[formField]` binds the directive's `value`, `disabled`, and `readonly` inputs and listens to its `touch` output. Angular's forms package then writes only `name` and `required` natively, which a range input accepts harmlessly. No `ControlValueAccessor` is implemented (the forms guide: implement one or the other, never both).
- Injection: `ElementRef` (the host element), `HostAttributeToken('class')` on the container (optional; the static class list, for `.vertical` and `.disabled` defaults), `DestroyRef`. No CDK service: see "Implementation level" for why `Directionality` is not used.
- Entry point: `ngx-foundation-sites/slider` holds both directives, the tokens, and the types, so a consumer's `@defer` can split it.

### API

```ts
type NfsPositionValueFunction = 'linear' | 'pow' | 'log';

interface NfsSliderDefaults {
  step?: number;
  decimal?: number;
  nonLinearBase?: number;
  positionValueFunction?: NfsPositionValueFunction;
}

const nfsSliderToken: InjectionToken<NfsSlider>;
const nfsSliderDefaultsToken: InjectionToken<NfsSliderDefaults>;

class NfsSlider {                                    // [nfsSlider], exportAs 'nfsSlider'
  readonly start: InputSignalWithTransform<number, unknown>;                // 0
  readonly end: InputSignalWithTransform<number, unknown>;                  // 100
  readonly step: InputSignalWithTransform<number, unknown>;                 // 1
  readonly vertical: InputSignalWithTransform<boolean, unknown>;            // static .vertical, else false
  readonly disabled: InputSignalWithTransform<boolean, unknown>;            // static .disabled, else false
  readonly disabledInteractive: InputSignalWithTransform<boolean, unknown>; // false
  readonly clickSelect: InputSignalWithTransform<boolean, unknown>;         // true
  readonly decimal: InputSignalWithTransform<number, unknown>;              // 2
  readonly nonLinearBase: InputSignalWithTransform<number, unknown>;        // 5
  readonly positionValueFunction: InputSignal<NfsPositionValueFunction>;    // 'linear'
  readonly displayWith: InputSignal<((value: number) => string) | undefined>; // undefined
  readonly doubleSided: Signal<boolean>;             // two handles registered
  readonly values: Signal<readonly number[]>;        // handle values in DOM order
}

class NfsSliderHandle implements FormValueControl<number> { // input[type=range][nfsSliderHandle], exportAs 'nfsSliderHandle'
  readonly value: ModelSignal<number>;                                      // 0
  readonly disabled: InputSignalWithTransform<boolean, unknown>;            // false
  readonly readonly: InputSignalWithTransform<boolean, unknown>;            // false
  readonly touch: OutputEmitterRef<void>;            // emitted on blur (Signal Forms touched)
}
```

`NfsSlider` inputs:

| Input | Type and transform | Default | Foundation equivalent | Delta |
| --- | --- | --- | --- | --- |
| `start` | `number`, `numberAttribute` | `0` | `data-start` | Material calls it `min`; Foundation's name wins (map rule) |
| `end` | `number`, `numberAttribute` | `100` | `data-end` | Material calls it `max` |
| `step` | `number`, `numberAttribute` | `1`, or the Defaults token | `data-step` | Values snap relative to `start` (the native rule); Foundation snaps relative to `0`, which differs only when `start` is not a multiple of `step` |
| `vertical` | `boolean`, `booleanAttribute` | `true` when the static class list has `vertical`, otherwise `false` | `data-vertical` plus the `.vertical` class | One switch instead of two; binds `.vertical` |
| `disabled` | `boolean`, `booleanAttribute` | `true` when the static class list has `disabled`, otherwise `false` | `data-disabled`, `.disabled` | Native `disabled` on every input unless `disabledInteractive`; Foundation only ignored events |
| `disabledInteractive` | `boolean`, `booleanAttribute` | `false` | None (Material's and the Button spec's name) | New: a disabled slider stays focusable with `aria-disabled="true"` |
| `clickSelect` | `boolean`, `booleanAttribute` | `true` | `data-click-select` | `false` removes the only single-pointer alternative to dragging a range slider (WCAG 2.5.7); the docs say so |
| `decimal` | `number`, `numberAttribute` | `2`, or the Defaults token | `data-decimal` | Applies to values the directive computes; native linear values are exact already |
| `nonLinearBase` | `number`, `numberAttribute` | `5`, or the Defaults token | `data-non-linear-base` | None |
| `positionValueFunction` | `'linear' \| 'pow' \| 'log'` | `'linear'`, or the Defaults token | `data-position-value-function` | Non-linear handles carry the Bar position natively (proposed ADR) |
| `displayWith` | `(value: number) => string` | `undefined` | None (Material `MatSlider.displayWith`) | New: feeds `aria-valuetext` on every handle; on the slider, as in Material, because both handles share one scale |

`NfsSlider` read-only members: `doubleSided` (two handles registered; Foundation's name for the derived state) and `values` (the handle values in DOM order, the container's aggregate). The container has no model and no outputs: the native `input` and `change` events of both handles bubble to it, so `(input)` or `(change)` on the `.slider` element is the aggregate event, with `$event.target` naming the handle. Methods: none.

`NfsSliderHandle` members:

| Member | Kind | Default | Foundation equivalent | Notes |
| --- | --- | --- | --- | --- |
| `value` | `model<number>()` | `0` | `data-initial-start` (first handle), `data-initial-end` (second handle), and the hidden input's value | Two-way; `valueChange` is its change output; the `FormValueControl` value |
| `disabled` | `input`, `booleanAttribute` | `false` | None | Disables this handle; set by `[formField]` from the field's disabled state; combined with the container's `disabled` |
| `readonly` | `input`, `booleanAttribute` | `false` | None | Set by `[formField]` from the field's readonly state; a range input ignores the native `readonly` attribute, so the handle renders `aria-readonly="true"` and blocks keys and pointer itself |
| `touch` | `output<void>()` | | None | Emitted on the native `blur`; the Signal Forms contract for marking the field touched |

- `exportAs`: `nfsSlider`, `nfsSliderHandle`.
- Methods on the handle: none. `focus()` is the native element method, which Signal Forms uses by default.
- Material's `dragStart`/`dragEnd` are not borrowed: Foundation has no drag events, and the native `pointerdown`, `pointerup`, and `change` events on the input give a consumer the same moments.
- Value semantics: the handle displays its value clamped to its bounds (the browser clamps the native value); it does not write the clamp back into the model, so a model value outside the scale stays what the consumer set until the user moves the handle. A pair whose first value exceeds the second is not reordered; dev mode warns.
- Events for directive-made changes: when the directive changes a value on the user's behalf (a track press in the range form, a key press on a non-linear handle), it sets the model, writes the native value, and dispatches bubbling `input` and `change` events on the input, which its own listener ignores, so native listeners see every user change. Programmatic model writes by the consumer dispatch nothing, as a native `value` property write does not.
- Reactive and template-driven forms: Angular's forms guide states that a `FormValueControl` works with `formControlName`, `formControl`, and `ngModel` unchanged. On a native `input[type=range]`, though, the built-in `RangeValueAccessor` also matches those selectors and wins, writing the native value past the handle's model. The consumer adds Angular's public `ngNoCva` attribute on the handle to opt out of the built-in accessor: `<input type="range" nfsSliderHandle formControlName="volume" ngNoCva>`. Signal Forms' `[formField]` needs no attribute, because no built-in accessor matches it.
- Signal Forms schema bounds: the scale is `start`/`end` on the container. A schema `min()` or `max()` rule on a slider field would make Signal Forms write the native `min`/`max` attributes, which carry the handle's dependent bounds; the docs say not to add them (the slider cannot produce a value outside its scale), and dev mode reports the overwrite.
- Dev-mode checks, in one `afterRenderEffect` per directive that exists only when `ngDevMode` is on (never on the server, removed in production), each warning once per instance: (1) a third handle; (2) a handle with no accessible name (no `labels`, `aria-label`, `aria-labelledby`, or `title`); (3) another writer changed the handle's native value or its `min`/`max` without a user event, with the hint "a built-in ControlValueAccessor (add ngNoCva) or a schema min()/max() rule"; (4) the first handle's value exceeds the second's.

Host bindings, all on signal state:

| Binding | `NfsSlider` host | `NfsSliderHandle` host |
| --- | --- | --- |
| static `class` | `slider` | |
| `[class.vertical]` | `vertical()` | |
| `[class.disabled]` | `true` while `disabled()` or every handle is disabled, otherwise `undefined` (a static class is left alone) | |
| `[style.--nfs-slider-lo]`, `[style.--nfs-slider-hi]` | Bar positions of the low and high ends of the fill (fractions 0..1; `lo` is 0 for one handle) | |
| `[attr.min]`, `[attr.max]`, `[attr.step]` (declared before `value`, so a client-created input is not clamped to the default bounds) | | Linear: `start` or the first handle's value, `end` or the second handle's value, and `step`. Non-linear: `0` or the sibling's position, `1000` or the sibling's position, and `any` |
| `[attr.value]` | | The value in native units (the value, or the Bar position times 1000); server HTML and the form's default value |
| `[attr.aria-valuetext]` | | `displayWith(value)`; for a non-linear handle without `displayWith`, the value as text; otherwise absent |
| `[attr.aria-orientation]` | | `vertical` on a vertical slider, otherwise absent |
| `[attr.disabled]` | | Present while disabled (container or handle) and not `disabledInteractive` |
| `[attr.aria-disabled]` | | `true` while disabled and `disabledInteractive` |
| `[attr.aria-readonly]` | | `true` while `readonly` and not disabled |
| `[style.--nfs-slider-span]` | | Share of the full native scale this input spans (`(nativeMax - nativeMin) / nativeRange`) |
| `[style.pointer-events]` | | `none` in the range form or while `clickSelect` is off (the thumbs keep `auto` through the Library mixin) |
| `[style.z-index]` | | `2` on the handle that can still move when both hold the same value (the minimum above the middle of the scale, the maximum at or below it) |
| listeners | `(pointerdown)`, `(click)` | `(input)`, `(keydown)`, `(blur)` |

### Implementation level and primitives

Implementation level: native platform. One `<input type="range">` per handle gives the slider role, `aria-valuenow`/`min`/`max`, the APG keys including Page Up and Page Down, pointer and touch dragging, track presses for a single handle, form association, and the absence of the APG's touch caution. The [Prototype: Foundation-styled `<input type="range">` Slider](../issues/45-prototype-slider-range-input.md) passed all 17 cases, axe WCAG 2.2 AA included, in Chromium 153, Firefox 155, and WebKit 26.6 and in Chromium 120, Firefox 119, and WebKit 17.4.

- `@angular/aria` 22.2 has no slider pattern.
- `@angular/cdk` adds nothing: `drag-drop` would fight Foundation's percentage positioning and is larger than the native input (CDK inventory); `Directionality` is deliberately not used. The native input and the fill's logical properties both follow the element's computed `direction`, and a subtree can set `dir` or CSS `direction` without CDK's `Dir` directive, in which case `Directionality` would disagree with what the browser draws. The two places the directives need the direction (track-press geometry and non-linear arrow keys) read the host's computed `direction` inside the client event handler, where it is always available. This is a documented exception to building-blocks 1.5.
- Angular primitives: `input()` with `numberAttribute`/`booleanAttribute`, `model()`, `output()`, `computed()` for bounds, spans, positions, value text, and the fill; `afterRenderEffect` for the live value property (read in `earlyRead`, written in `write`) and the dev checks; `inject()` with the token and `HostAttributeToken`; host metadata for every binding and listener. No `effect()`, no timers, no observers, no `NgZone`.
- Value maths (from Foundation's source): Bar position of a value is `(value - start) / (end - start)`, then Foundation's `pow` scale applies `log_base(p * (base - 1) + 1)` and its `log` scale `(base^p - 1) / (base - 1)`; the inverse maps a Bar position back to a value, which is snapped to `step` from `start`, clamped to the scale, and rounded to `decimal` places. The prototype matched Foundation's formulas: the bar midpoint maps to 68 on the `log` scale and 31 on the `pow` scale (0..100, base 5).
- Non-linear handles: the native input carries the Bar position (0..1000, `step="any"`) because a native thumb moves linearly in its own value; the keydown handler makes one arrow press one value step, Page Up/Page Down ten value steps, and Home/End the ends, and `aria-valuetext` carries the value. See the proposed ADR.
- Range form: dependent bounds on the native `min`/`max` (in native units: the value, or the Bar position); `--nfs-slider-span` sizes each input so its own thumb lands on the same pixel as on the full track; the input handler also clamps against the sibling, because the bound host bindings refresh only on the next change detection and a same-frame key press could otherwise invert the pair.
- Track press (`clickSelect`, range form only; a single handle keeps the native track press): a `click` listener on the container, because focus moves on `mousedown` and a `focus()` in `pointerdown` is undone by the browser. A `pointerdown` listener records whether the press began on an input, so a drag released over the track is not taken as a track press. The press position becomes a Bar position from the container's rectangle, the thumb length along the axis (the same `max(24px, $slider-handle-width)` the Library mixin draws: the directive reads the mixin's `--nfs-slider-handle-width`, emitted in `rem` through Foundation's `rem-calc()`, converts it with the root font size, and takes the larger of that and 24 px), and the computed direction; the nearest handle that can move there without crossing moves, receives focus, and fires `input` and `change`.
- Fallback: none needed. If OPEN FOR HUMAN 1 (Chromium announcing a vertical native range as horizontal; it stays open after the 2026-09-26 triage as HIGH impact with NOT-HIGH confidence) is ruled unacceptable, the vertical form alone moves to a custom `role="slider"` handle, whose cost the prototype estimated (the APG vertical example is 256 lines, Foundation's plugin 718, Material's slider and input 1,807).

### Comparison with Angular Material (`MatSlider`, 22.2)

| Concern | Material | Slider |
| --- | --- | --- |
| Shape | `mat-slider` component rendering track, ticks, visual thumbs, and ripples, with `input[matSliderThumb]` or `input[matSliderStartThumb]`/`input[matSliderEndThumb]` projected | `[nfsSlider]` directive on Foundation's `.slider`; `input[type=range][nfsSliderHandle]`; Foundation CSS draws track, fill, and thumbs on the native inputs |
| Scale | `min`, `max`, `step` on the slider | `start`, `end`, `step` (Foundation names) on the container |
| Value | `value` input plus `valueChange` output on each thumb | `value` model per handle (`valueChange` generated) |
| Range | Separate start and end thumb directives | Two identical handles; order decides which is the minimum |
| Value text | `displayWith` on the slider feeding `aria-valuetext` | Same |
| Vertical | None | `vertical` (rotated inputs; `writing-mode` later) |
| Non-linear scale | None | `positionValueFunction`, `nonLinearBase` |
| Disabled | `disabled` on the slider; native `disabled` | `disabled` on the container or a handle; native `disabled`, or `disabledInteractive` |
| Discrete value indicator, tick marks, color, ripple | `discrete`, `showTickMarks`, `color`, `disableRipple` | None (Foundation has none) |
| Drag events | `dragStart`, `dragEnd` | None; native `pointerdown`/`pointerup`/`change` |
| Forms | `ControlValueAccessor` on the thumb | `FormValueControl` on the handle; `ngNoCva` for Reactive and template-driven forms |
| Testing | `MatSliderHarness`, `MatSliderThumbHarness` | DOM-first assertions; no harness |

Borrowed: native range inputs as the value carriers, directives on consumer-written inputs, two inputs for the range form, `displayWith` on the slider, `valueChange`, `disabledInteractive` (Material's name, via the Button spec). Not borrowed: the component template and visual thumbs, `discrete`, ticks, ripples, color, drag events, `ControlValueAccessor`.

### ARIA and keyboard

APG patterns: Slider; Slider (Multi-Thumb) for two handles. Both are implemented by the native input.

| Element or state | Rendered semantics | Source |
| --- | --- | --- |
| Handle | Native `input[type=range]`: implicit role `slider`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` from the native value, `min`, `max` | WHATWG HTML range state; ARIA in HTML (authors should not put `aria-valuemin`/`aria-valuemax` on `input type=range`) |
| Name | `<label for>` on each handle (preferred), or `aria-labelledby`/`aria-label` on the input; never on the container | APG naming: `slider` requires a name; Foundation's forms docs put `aria-labelledby` on the container, which names nothing |
| Range form | Each handle is its own slider with its own label ("Minimum price", "Maximum price"); the container may carry `role="group"` with `aria-labelledby` when a shared heading exists (consumer markup); tab order stays DOM order whatever the values | APG Multi-Thumb |
| Dependent bounds | The first handle's native `max` is the second's value and the second's native `min` is the first's value; both handles may hold the same value | APG Multi-Thumb ("the values of `aria-valuemin` or `aria-valuemax` of the dependent sliders are updated") |
| Value text | `aria-valuetext` from `displayWith`, and always on a non-linear handle, where `aria-valuenow` is the Bar position | APG Slider (`aria-valuetext` when the number is not user friendly) |
| Vertical | `aria-orientation="vertical"` on each handle | APG Slider; Chromium ignores it on a native range and reports horizontal (OPEN FOR HUMAN 1) |
| Disabled (default) | Native `disabled`: unavailable, out of the tab order, no events | APG keyboard practice, focusability of disabled controls; building-blocks 1.10 (standalone native control) |
| Disabled, `disabledInteractive` | `aria-disabled="true"`, focusable, keys and pointer blocked | APG keyboard practice (keep discoverable controls focusable) |
| Readonly | `aria-readonly="true"`, focusable, keys and pointer blocked | WAI-ARIA 1.2 (`slider` supports `aria-readonly`) |
| Fill | Plain `span`, no content, not exposed to assistive technology; visually it shows the selected span, so its colour against the track must reach 3:1 | WCAG 2.2 1.4.11 (see the table below) |

| Key | Linear handle | Non-linear handle | Owner |
| --- | --- | --- | --- |
| Right Arrow, Up Arrow | Increase by one `step` (in right-to-left, Left increases and Right decreases, as each engine implements the native control) | Increase by one value `step` (mirrored the same way in right-to-left) | Native / directive |
| Left Arrow, Down Arrow | Decrease by one `step` | Decrease by one value `step` | Native / directive |
| Home, End | `start`, `end` (or the dependent bound) | `start`, `end` (or the dependent bound) | Native / directive |
| Page Up, Page Down | Ten percent of the range in every engine (the prototype measured 200 to 180 on 0..200) | Ten value steps | Native / directive |
| Shift+Arrow | Native behaviour (Foundation's ten-step fast key is dropped) | Same as the plain arrow | Native |
| Tab, Shift+Tab | Every handle in DOM order; natively disabled handles are skipped | Same | Native |
| Any of the keys above while `disabledInteractive`-disabled or readonly | Blocked (`preventDefault()` in the keydown handler) | Blocked | Directive |

Every directive key handler changes state first and calls `preventDefault()` last (building-blocks 1.5). Focus stays on the handle the user operates; a track press in the range form moves focus to the handle it moved.

WCAG 2.2 AA criteria the Slider has to address, each guaranteed by default rather than recommended:

| Criterion | How the Slider meets it | Enforced by |
| --- | --- | --- |
| 2.1.1 Keyboard | Every value is reachable with the native keys; non-linear handles get one value step per key from the directive; focusable disabled and readonly handles block keys but stay reachable | Story play functions and e2e key presses |
| 2.4.7 Focus Visible | `foundation-range-input` removes the focus outline and adds none; the Library mixin draws a 2 px `$black` outline, offset 2 px, on the focused thumb (rule 6) | e2e pixel check: after a Tab, the pixel just outside the focused thumb is the outline colour in all three engines (the prototype's "keyboard focus is visible on the thumb" case) |
| 2.5.7 Dragging Movements | A single press on the track moves a handle: native for one handle, the container's `click` handler for two (`clickSelect`, on by default); keys also move every handle | Story and e2e track-press cases; turning `clickSelect` off on a range slider is documented as a WCAG 2.5.7 failure |
| 2.5.8 Target Size (Minimum) | Every thumb is at least 24 by 24 CSS px and so is each input's hit box: the Library mixin sizes the thumbs `max(24px, $slider-handle-width)` by `max(24px, $slider-handle-height)` and the input box `max(24px, $slider-handle-height)` (rules 5 and 5a). Foundation's default thumb is 1.4rem, 22.4 px at the default root font size, and its mixin leaves the input box at the 0.5rem track height, so Foundation alone cannot meet the minimum. When the two thumbs of a range hold the same value, the one that can move is on top and is itself a full-size target, which covers the other through 2.5.8's equivalent-control exception | axe `target-size` in every story (input box); e2e measures each thumb's painted size |
| 1.4.11 Non-text Contrast | The fill must contrast with the track by at least 3:1 (`$slider-fill-background` against `$slider-background`), and the thumb with the track by at least 3:1 (`$slider-handle-background` against `$slider-background`). Foundation's defaults, `$medium-gray` #cacaca on `$light-gray` #e6e6e6, reach about 1.3:1 and fail; the default thumb, `$primary-color` #1779ba, reaches about 3.8:1 against the track and passes. Example of a passing fill: `$slider-fill-background: $primary-color` (about 3.8:1 against the default track) | A compile-time check in the Library mixin: it computes both ratios with Foundation's own `color-contrast()` (the WCAG relative-luminance formula, in Foundation's colour utilities) from the consumer's settings and stops the compile with `@error`, naming the setting to change, when either is below 3. axe 4.11 has no 1.4.11 rule (its contrast rules test text only), so the story axe gate cannot enforce this; no runtime dev check is added, because the compile-time check is exact for the solid colours these settings hold |
| 4.1.2 Name, Role, Value | Role, value, and bounds come from the native input; the name from `<label for>` or `aria-label`/`aria-labelledby` on the input; human-readable values from `aria-valuetext` (`displayWith`, and always on non-linear handles); disabled and readonly states from `disabled`, `aria-disabled`, `aria-readonly` | axe in every story; dev-mode check 2 for unlabelled handles; the screen-reader announcement of `aria-valuetext` is OPEN FOR HUMAN 2 in the ticket, human-only by kind (an assistive-technology check) |

### Rendered HTML

Consumer markup, then the resulting DOM. Server HTML and the hydrated DOM are identical, because every value is a host binding on inputs, models, and static attributes; nothing depends on the platform, a breakpoint, a measurement, or a generated id. `jsaction` attributes appear only in server HTML of hydrating apps; class order is not significant.

```html
<!-- Single handle (Foundation's first example: data-initial-start="50" data-end="200") -->
<label for="volume">Volume</label>
<div nfsSlider [end]="200">
  <input id="volume" type="range" nfsSliderHandle [(value)]="volume" />
  <span class="slider-fill"></span>
</div>

<label for="volume">Volume</label>
<div class="slider" style="--nfs-slider-lo: 0; --nfs-slider-hi: 0.25;" jsaction="pointerdown:;click:;">
  <input id="volume" type="range" min="0" max="200" step="1" value="50"
         style="--nfs-slider-span: 1;" jsaction="input:;keydown:;" />
  <span class="slider-fill"></span>
</div>

<!-- Two handles -->
<p id="price-label">Price</p>
<div nfsSlider role="group" aria-labelledby="price-label">
  <input type="range" nfsSliderHandle aria-label="Minimum price" [(value)]="low" />
  <span class="slider-fill"></span>
  <input type="range" nfsSliderHandle aria-label="Maximum price" [(value)]="high" />
</div>

<div class="slider" role="group" aria-labelledby="price-label" style="--nfs-slider-lo: 0.25; --nfs-slider-hi: 0.75;">
  <input type="range" aria-label="Minimum price" min="0" max="75" step="1" value="25"
         style="--nfs-slider-span: 0.75; pointer-events: none;" />
  <span class="slider-fill"></span>
  <input type="range" aria-label="Maximum price" min="25" max="100" step="1" value="75"
         style="--nfs-slider-span: 0.75; pointer-events: none;" />
</div>

<!-- Vertical and disabled, written with Foundation's classes only -->
<div nfsSlider class="vertical disabled">
  <input type="range" nfsSliderHandle aria-label="Level" [(value)]="level" />
  <span class="slider-fill"></span>
</div>

<div class="slider vertical disabled" style="--nfs-slider-lo: 0; --nfs-slider-hi: 0.25;">
  <input type="range" aria-label="Level" min="0" max="100" step="1" value="25"
         aria-orientation="vertical" disabled="" style="--nfs-slider-span: 1;" />
  <span class="slider-fill"></span>
</div>

<!-- Non-linear (log, base 5), value 50 -->
<div nfsSlider positionValueFunction="log">
  <input type="range" nfsSliderHandle aria-label="Budget" [(value)]="budget" />
  <span class="slider-fill"></span>
</div>

<div class="slider" style="--nfs-slider-lo: 0; --nfs-slider-hi: 0.309;">
  <input type="range" aria-label="Budget" min="0" max="1000" step="any" value="309.02"
         aria-valuetext="50" style="--nfs-slider-span: 1;" />
  <span class="slider-fill"></span>
</div>

<!-- Focusable disabled, while locked() is true -->
<div nfsSlider [disabled]="locked()" disabledInteractive>
  <input type="range" nfsSliderHandle aria-label="Volume" aria-describedby="lock-hint" [(value)]="volume" />
</div>

<div class="slider disabled" style="--nfs-slider-lo: 0; --nfs-slider-hi: 0.5;">
  <input type="range" aria-label="Volume" aria-describedby="lock-hint" min="0" max="100" step="1" value="50"
         aria-disabled="true" style="--nfs-slider-span: 1;" />
</div>
```

The non-linear position values are rounded here for reading; the directive writes the unrounded number. The `jsaction` attributes are shown on the first example only.

### Animation

- None. Native thumbs move instantly to the pointer or the key step, so nothing animates and there is no Completion output. Foundation's `$slider-transition` exists for its span handle and `.slider-fill` and is documented by Foundation as not applying to the native slider; `foundation-range-input` has no transition. The Library mixin sets `transition: none` on `.slider-fill` so the fill does not lag behind a thumb that never animates (prototype rule 10). Foundation's `moveTime` and its `requestAnimationFrame` `Move` loop have no counterpart.
- No `animate.enter`/`animate.leave`: the directives insert and remove nothing.
- Reduced motion: nothing to shorten. The Library mixin adds no transition or animation, so it emits no `prefers-reduced-motion` override, and the page stays free of slider motion whatever the preference.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the server HTML carries `.slider`, `.vertical`, `.disabled`, the fill custom properties, and every input's `min`, `max`, `step`, `value`, `aria-valuetext`, `aria-orientation`, `disabled` or `aria-disabled`, `aria-readonly`, span, `pointer-events`, and `z-index`, computed from the models (rule 1). Thumbs and the fill are painted at the server value by CSS alone.
- Before hydration: the directives touch no DOM outside host bindings, read no `window`, and measure nothing (rules 3 to 5). The native inputs are fully interactive in the Dehydrated state: keys and drags move the native value, a single slider's track press works, natively disabled inputs are inert, and the soft-disabled and readonly states block the pointer through the Library mixin. The fill does not follow until hydration.
- Full hydration: the value is bound as `[attr.value]` only, and the live `value` property is written in `afterRenderEffect` when it differs. A `[value]` host binding would be applied during hydration and reset a value the user moved before hydration (the prototype measured this failure in all three engines: `Expected: "55"`, `Received: "50"`). In the first client render callback, a handle whose native value differs from the value it would display (compared numerically against its clamped native value, so a clamp or a float formatting difference is not mistaken for user input) adopts the native value into its model, as if an `input` event had arrived. A disabled or readonly handle does not adopt; it restores its own value, because a focusable disabled handle's keys are not blocked before hydration. Nothing structural can mismatch; `ngSkipHydration` is never needed (rule 10).
- Event replay: replayed listeners are `input` and `keydown` on each handle and `pointerdown` and `click` on the container. A replayed `input` sets the model from the live native value. A replayed `keydown` on a linear enabled handle does nothing (the native key already acted). A replayed track press in the range form (where the inputs have `pointer-events: none`, so the press did nothing natively) moves the nearest handle after hydration, reading geometry at replay time. The soft-disabled and non-linear keydown paths change state first and call `preventDefault()` last, which throws during replay and is logged by Angular: the building-blocks rule for replayed events, decided at triage on 2026-09-26 (impact not HIGH, confidence HIGH). `blur` (the `touch` output) is not replayed, so a field is not marked touched by pre-hydration focus changes.
- Incremental hydration and the Hydration boundary: the container and its handles share one boundary, and the handles must be declared inside the `[nfsSlider]` element in the same template, because a handle finds its container through the injector of its declaration site. A consumer `@defer (hydrate on interaction)` around a slider hydrates on the first `pointerdown` or `keydown` and replays it; the adoption rule keeps what the native control already did.
- `@defer`: library templates contain no `@defer`; the Slider is its own entry point. Plain `@defer` renders the slider on the client, where it behaves as client rendering.
- `@defer (hydrate never)`: the residue is the native control. Keys, drags, and a single slider's track press work, native disabled holds, and a native form submission sends each handle's `name` and value. Not available there: the fill following the thumbs, track presses in the range form, dependent bounds updating, non-linear value steps, and value text updates. A non-linear handle's native value is its Bar position (0..1000), so a native form submission sends the position; non-linear sliders are for forms Angular handles, and a consumer who needs a native submission adds a hidden input bound to the value.
- Prerendering: identical to server rendering; no request token is read (rule 11).
- Not proven by the prototype and assumed here: keys and drags before hydration on the range and non-linear forms (only single linear keys were tested); see Prototype needed in the ticket.

### Sass and custom CSS

- Styling is Foundation's Sass: `foundation-slider` (the `.slider` track, `.slider-fill`, `.slider.disabled`, `.slider.vertical`) and `foundation-range-input` (the thumbs through `::-webkit-slider-thumb` and `::-moz-range-thumb`, the native tracks, the disabled fade), configured by the consumer's `$slider-*` settings. `foundation-range-input` is not part of `foundation-everything`, so the consumer includes it explicitly.
- The library's documented custom CSS is the `nfs-slider` Library mixin, listed with its reasons in Further Notes, Sass. No directive declares `styles`.
- WCAG 2.2 AA requirements on the consumer's settings: `$slider-fill-background` against `$slider-background`, and `$slider-handle-background` against `$slider-background`, at 3:1 or better (1.4.11). Foundation's default fill and track (about 1.3:1) fail, so a consumer on Foundation's defaults must change `$slider-fill-background` (or `$slider-background`). The `nfs-slider` mixin checks both ratios at compile time with Foundation's `color-contrast()` and stops the compile with `@error` naming the setting to change. The 24 px minimum thumb and hit box (2.5.8) need no consumer action: the mixin guarantees them from any `$slider-handle-*` value.

## Testing Decisions

A good test asserts what a user or assistive technology observes: roles, accessible names, the native `value`, `min`, `max`, `step`, `aria-valuetext`, `aria-orientation`, `disabled`, `aria-disabled`, `aria-readonly`, the State classes, where the thumbs and fill are painted, which element has focus, and which native events fire. No test reads a directive's private fields. There is no prior art in the new repository; the patterns are the prototype's Playwright suite (pixel checks at thumb centres, real drags, the Chromium accessibility tree), the building-blocks testing rule, Angular's own `renderApplication`-based SSR tests, and the Angular Components universal-app e2e.

Story ids follow `slider--<story>`: `slider--basics`, `slider--two-handles`, `slider--vertical`, `slider--vertical-two-handles`, `slider--disabled`, `slider--disabled-interactive`, `slider--step`, `slider--data-binding`, `slider--non-linear`, `slider--value-text`, `slider--click-select`, `slider--rtl`, `slider--signal-forms`, `slider--reactive-forms`.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Every story runs axe with `parameters.a11y.test = 'error'` against WCAG 2.2 AA (target size included). The story Sass uses a fill that passes 3:1 against the track, because the Library mixin refuses to compile otherwise; axe has no 1.4.11 rule, so non-text contrast is enforced by that compile-time check, not by the story gate.

- `slider--basics`: `getByRole('slider', {name: 'Volume'})` has value 50 of 0..200; the container has `.slider` and `--nfs-slider-hi: 0.25`; ArrowRight moves to 51 and fires `input` and `change`; Page Down moves to 31 (ten percent); Home and End reach 0 and 200; the fill width follows.
- `slider--two-handles`: both sliders are found by name; End on the minimum stops at the maximum's value and the maximum's native `min` follows; the two can hold the same value; tabbing order is constant after the values swap sides of the middle.
- `slider--vertical`, `slider--vertical-two-handles`: `aria-orientation="vertical"`, `.vertical` on the container; Up and Right increase, Down and Left decrease.
- `slider--disabled`: every input is `disabled`, the container has `.disabled`, Tab skips the handles.
- `slider--disabled-interactive`: Tab reaches the handle; `aria-disabled="true"`; arrow keys, Home, End, and Page keys leave the value unchanged; `aria-describedby` text is exposed.
- `slider--step`: step 5 moves 50 to 55; `aria-valuetext` from `displayWith` reads "55 percent".
- `slider--data-binding`: typing 120 in the bound `type="number"` input moves the handle; moving the handle updates the number input and an `<output>`.
- `slider--non-linear`: `aria-valuetext` carries the value; ArrowRight moves one value step (50 to 51), Page Up ten steps, End to 100 with native position 1000; `input` and `change` fire for each key.
- `slider--value-text`: `displayWith` output appears on both handles and changes with the value.
- `slider--click-select`: with `clickSelect` on, clicking the range track moves the nearest handle there and focuses it; with it off, a click changes nothing.
- `slider--rtl`: under `dir="rtl"` Left increases, the fill starts at the inline start (right).
- `slider--signal-forms`: a `form()` with `volume` and `price.min`/`price.max` fields; moving a handle updates the model; a schema `disabled()` rule disables the handle and adds `.disabled`; a `readonly()` rule sets `aria-readonly` and blocks keys; blurring a handle marks the field touched.
- `slider--reactive-forms`: `formControlName` with `ngNoCva`; `setValue(70)` moves the handle and the fill; moving the handle updates the control.

### 2. Browser-level test (stack per the [browser testing stack decision](../issues/41-browser-testing-stack-decision.md); stack-neutral)

- Host binding table, driven by data: every combination of handle count, `vertical`, `disabled` (container and handle), `disabledInteractive`, `readonly`, `clickSelect`, and scale type, asserting each binding in the host binding table.
- Bounds and clamping: dependent native bounds in linear and non-linear units; a same-frame key on one handle after a change to the other never inverts the pair; model values outside the scale display clamped and are not written back.
- Adoption: a fixture that changes the native value before the first render callback adopts it into the model; the same on a disabled or readonly handle restores the model value; a value that differs only by clamping or float formatting is not adopted.
- Track press geometry: synthetic clicks at known offsets on horizontal, vertical, and right-to-left fixtures move the expected handle to the expected value; a press that began on an input is ignored.
- Directive-made changes dispatch one `input` and one `change` each, and the directive's own listener ignores them.
- Registration: a first handle inserted later with `@if` takes DOM order after the next render; a third handle reports a dev error.
- Forms: `[formField]` treats the handle as a custom control (value, `disabled`, `readonly`, `touch`); Signal Forms writes no native `disabled`; Reactive Forms with `ngNoCva` binds through the custom-control path, and without it dev check 3 warns.
- Dev-mode checks: each of the four fires once for its case and not for a correct slider.
- Replay-safe handlers: a non-linear or soft-disabled `keydown` whose `eventPhase` reads 101 and whose `preventDefault` throws still changes (or keeps) the value, and nothing but Angular's replay log reaches `ErrorHandler`.
- Defaults token: provided keys seed the inputs; explicit inputs win.
- Zoneless: the suite runs with zoneless change detection and `fixture.whenStable()`; no test needs `NgZone`.

### 3. Node-level Vitest

- SSR smoke: `renderApplication` over a fixture with single, two-handle, vertical, disabled, `disabledInteractive`, non-linear, and `displayWith` sliders. Assert `whenStable()` resolves; the server HTML carries every attribute, class, and custom property from the Rendered HTML section, the dependent bounds already applied; the handles carry `jsaction` for `input` and `keydown` and the containers for `pointerdown` and `click`. Runs in its own file or process because `provideServerRendering()` leaves `ngServerMode` set; whether under `@angular/build:unit-test` or a separate Vitest project is the [Prototype: Rendering-mode test seam](../issues/59-prototype-rendering-mode-test-seam.md).
- Pure logic, table-driven: Bar position and its inverse for `linear`, `pow`, and `log` (Foundation parity: the midpoint maps to 68 and 31 on 0..100, base 5), snapping from `start`, clamping, `decimal` rounding, round trips, and the nearest-handle choice for a track press.
- Sass compile test: compiling Foundation 6.9 plus the library with Foundation's default slider colours stops with the `@error` naming `$slider-fill-background` (about 1.3:1); with a passing fill it emits the `nfs-slider` rules and no copy of a Foundation rule; a thumb colour below 3:1 against the track stops with the `@error` naming `$slider-handle-background`; with `$global-text-direction: rtl` it emits the rule that cancels Foundation's horizontal mirror; `--nfs-slider-handle-width` equals `rem-calc($slider-handle-width)`; the thumb rules resolve to 24 px with Foundation's default 1.4rem handle and to the setting with a 2rem handle.

### 4. Playwright e2e

Against the static Storybook build, in Chromium, Firefox, and WebKit:

- Pixels: the colour at each computed thumb centre is `$slider-handle-background` and just outside it is not, for single, two-handle, vertical, and right-to-left stories; the fill runs from the low thumb to the high thumb within 1.5 px.
- Target size: every painted thumb measures at least 24 by 24 CSS px (scanning the thumb colour across its box), and each input's box is at least 24 px tall.
- Focus visible: after a Tab, the pixel just outside the focused thumb is the outline colour.
- Real pointer drags on every thumb (single, both range thumbs, vertical, right-to-left, stepped, `log` and `pow`), a long fast drag that stops at the sibling, and meeting thumbs separable at 0/0 and 100/100.
- Real key presses for the APG keys, including right-to-left arrows, and Tab order.
- Chromium accessibility tree: each range handle reports its dependent minimum and maximum.

Against the prerendered fixture app (the harness from the rendering-mode test seam prototype):

- JavaScript disabled: screenshot plus axe; thumbs painted at the server values; arrow keys move the native value.
- Hydration: no NG05xx in the console and `ngDevMode.componentsSkippedHydration === 0`.
- Keys pressed before hydration, with the main bundle delayed, survive hydration in the model and the native value: single linear, range, and non-linear handles.
- A range-track press before hydration moves the nearest handle once after hydration.
- `@defer (hydrate on interaction)`: pressing a thumb hydrates the block and the value it moved to survives.
- `@defer (hydrate never)`: the native residue works and no error is logged.

## Out of Scope

- A custom `role="slider"` handle and Foundation's `.slider-handle` span markup (not supported; see Implementation level for when the vertical form would need one).
- More than two handles, tick marks (`list`/`<datalist>` ticks are hidden by `appearance: none`), a value indicator badge (Material's `discrete`), and colours.
- `draggable`, `binding`, `moveTime`, `changedDelay`, `disabledClass`, `invertVertical`, and Foundation's `Shift+Arrow` fast step.
- Drag start and end outputs.
- Runtime theming through custom properties (building-blocks 1.13); the `--nfs-slider-*` properties are an implementation channel.
- Screen-reader, touch-device, and forced-colors verification (OPEN FOR HUMAN and Prototype needed in the ticket).

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | Native `<input type="range">` per handle for every form | APG touch caution; keyboard, ARIA, forms native; the prototype passed every form in three engines at two versions | Custom `role="slider"` spans (Foundation, the APG examples): owns pointer, keys, ARIA, and value maths |
| D2 | Two directives: `[nfsSlider]` on `.slider`, `input[type=range][nfsSliderHandle]` on each input; fill is plain markup | Directive-first (ADR 0001); Material's thumb-directive shape; the fill has no behaviour | A `nfs-slider` component rendering track and fill (Material): re-renders markup the consumer owns |
| D3 | `value` model per handle; container exposes read-only `values` and no model | One source of truth per value; Signal Forms binds one field per handle | A container `value` tuple model: two writers for one value |
| D4 | Handle implements `FormValueControl<number>`; `ngNoCva` documented for Reactive and template-driven forms | Angular 22's control detection prefers a directive with a `value` model; the built-in `RangeValueAccessor` would otherwise bypass the model | `ControlValueAccessor` (Material): Angular advises one contract, not both, and Signal Forms is the default |
| D5 | Native events are the outputs; directive-made changes dispatch `input` and `change` | Foundation's `moved`/`changed` map onto them (building-blocks 1.4); listeners see every user change | A container `changed` output with a debounce (Foundation's `changedDelay`) |
| D6 | Native `disabled` by default; `disabledInteractive` opt-in | Building-blocks 1.10 names native disabled as the default for standalone native controls; it is the only state enforced before hydration and in `hydrate never` (a focusable disabled handle's keys move before hydration) | Soft-disabled by default (the prototype's choice, a misreading of 1.10) |
| D7 | `[attr.value]` for server HTML, live property in `afterRenderEffect`, adopt pre-hydration input | The prototype's measured hydration failure with `[value]` | `[value]` host binding |
| D8 | Non-linear handles carry the Bar position natively, value in the model and `aria-valuetext` | A native thumb moves linearly in its native value | Custom slider for non-linear scales only |
| D9 | Direction read from computed `direction` at event time; no `Directionality` | The native input and the fill follow CSS direction | `Directionality` (building-blocks 1.5) |
| D10 | Track press on `click`, range form only; single handle keeps the native press | Focus moves on `mousedown`; the range inputs have `pointer-events: none` | `pointerdown` (the prototype's first attempt lost focus) |
| D11 | Handles may hold equal values; the free handle goes on top | APG Multi-Thumb; the prototype's meeting-thumbs case | Foundation's one-step gap |
| D12 | `vertical` and `disabled` default from the static Foundation classes | Foundation's docs write the classes; Foundation's JavaScript syncs `.disabled` the same way | Requiring the input as well as the class |
| D13 | `displayWith` on the container | Material's placement; both handles share one scale | Per handle (the prototype's placement) |
| D14 | No animation | Native thumbs never animate; a transitioning fill lags | Keeping `$slider-transition` on the fill |
| D15 | `readonly` input rendering `aria-readonly` and blocking input | A range input ignores native `readonly`, so a readonly field would stay editable | Leaving `readonly` to the native attribute |
| D16 | The Library mixin guarantees 24 by 24 CSS px thumbs and input boxes with `max(24px, <setting>)` | WCAG 2.2 AA 2.5.8 is required for every directive; Foundation's 1.4rem (22.4 px) default thumb and 0.5rem input box cannot meet it | Recommending `$slider-handle-*: 1.5rem` in the docs (the earlier default, not allowed under the AA rule) |
| D17 | Fill and thumb colours at 3:1 against the track are a requirement, checked at compile time with Foundation's `color-contrast()` | WCAG 2.2 AA 1.4.11; the settings are solid Sass colours, so the check is exact; axe has no rule for it | A docs recommendation; a runtime dev check reading computed colours (weaker than the exact compile-time value); changing the consumer's colours in library CSS (would override their theme) |

### Usage examples

```ts
@Component({
  selector: 'app-filters',
  imports: [NfsSlider, NfsSliderHandle, FormField],
  template: `
    <label for="volume">Volume</label>
    <div nfsSlider [end]="200" [displayWith]="percentOf200">
      <input id="volume" type="range" nfsSliderHandle [(value)]="volume" name="volume" />
      <span class="slider-fill"></span>
    </div>
    <output for="volume">{{ volume() }}</output>

    <p id="price-label">Price</p>
    <div nfsSlider [end]="1000" [step]="10" role="group" aria-labelledby="price-label">
      <input type="range" nfsSliderHandle aria-label="Minimum price" [formField]="filters.price.min" />
      <span class="slider-fill"></span>
      <input type="range" nfsSliderHandle aria-label="Maximum price" [formField]="filters.price.max" />
    </div>

    <label for="budget">Budget</label>
    <div nfsSlider positionValueFunction="log" [end]="10000" [step]="100" [displayWith]="euros">
      <input id="budget" type="range" nfsSliderHandle [(value)]="budget" />
      <span class="slider-fill"></span>
    </div>
  `,
})
export class Filters {
  protected readonly volume = signal(50);
  protected readonly budget = signal(2000);
  protected readonly model = signal({ price: { min: 100, max: 800 } });
  protected readonly filters = form(this.model);

  protected readonly percentOf200 = (value: number) => `${Math.round(value / 2)} percent`;
  protected readonly euros = (value: number) => `${value} euros`;
}
```

```html
<!-- Foundation's data binding example: the same signal on a number input -->
<div class="grid-x grid-margin-x">
  <div class="cell small-10">
    <div nfsSlider [step]="5">
      <input type="range" nfsSliderHandle aria-label="Amount" [(value)]="amount" />
      <span class="slider-fill"></span>
    </div>
  </div>
  <div class="cell small-2">
    <input type="number" aria-label="Amount" [value]="amount()" (input)="amount.set($any($event.target).valueAsNumber)" />
  </div>
</div>

<!-- Reactive Forms: opt out of the built-in range accessor -->
<form [formGroup]="settings">
  <div nfsSlider>
    <input type="range" nfsSliderHandle aria-label="Brightness" formControlName="brightness" ngNoCva />
  </div>
</form>

<!-- Application-wide defaults -->
providers: [{ provide: nfsSliderDefaultsToken, useValue: { decimal: 0, step: 5 } }]
```

A `type="number"` input needs no `inputmode`; a `type="text"` input bound the same way gets `inputmode="decimal"`.

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This plugin relies on Foundation's export mixins `foundation-slider` and `foundation-range-input` (the second is not part of `foundation-everything` and must be included explicitly). Its documented custom CSS is the `nfs-slider` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-slider` and `foundation-range-input`.

(1) Rules the mixin emits, from the prototype's list (rules 1 to 11) plus two refinements and the additions marked below (rules 0a and 5a for WCAG 2.2 AA, the rule 8 fade, and rule 12):

| # | Selector | Declarations | Why Foundation's CSS cannot provide it |
| --- | --- | --- | --- |
| 0 | `.slider` | `--nfs-slider-length: 100%`; `--nfs-slider-handle-width: rem-calc($slider-handle-width)`; `--nfs-slider-thumb: max(24px, var(--nfs-slider-handle-width))` | The track length and the thumb length along the axis (with the 24 px minimum of rule 5a), which rules 3, 10, and 11 and the directive's track-press geometry need; Foundation has no native form inside `.slider` |
| 0a | None (a compile-time check, emits no CSS) | `@error` when `color-contrast($slider-fill-background, $slider-background) < 3` or `color-contrast($slider-handle-background, $slider-background) < 3`, naming the setting | WCAG 2.2 AA 1.4.11; Foundation's defaults reach about 1.3:1 for the fill and nothing in Foundation checks it; axe has no rule for it |
| 1 | `.slider > input[type='range']` | `position: absolute; top: 50%; inset-inline-start: 0; margin: 0; transform: translateY(-50%)` | Foundation styles a native range as a standalone block and has no rule for an input over the `.slider` track |
| 2 | same, plus `::-webkit-slider-runnable-track` and `::-moz-range-track` | `background: transparent` | The UA's input box would hide the track and cut through the sibling's thumb, and the mixin's own track would cover the fill; the container stays the one visible track |
| 3 | same; `input ~ input` | `width: calc((var(--nfs-slider-length) - var(--nfs-slider-thumb)) * var(--nfs-slider-span, 1) + var(--nfs-slider-thumb))`; the second input `inset-inline-start: auto; inset-inline-end: 0` | Sizes each input of the range form to the span its dependent bounds allow, so its thumb lands on the pixel it has on the full track; Foundation has no two-handle native form |
| 4 | same; `::-webkit-slider-thumb`, `::-moz-range-thumb` | input `z-index: 1`; thumbs `pointer-events: auto` | With the inputs set to `pointer-events: none` by the directive (range form, `clickSelect` off), each thumb stays grabbable and the inputs sit above the fill |
| 5 | `.slider > input[type='range']` | `height: max(24px, #{$slider-handle-height})` (refinement: the prototype used `24px`) | axe measures the input box, which Foundation leaves at the track height; 24 px is the WCAG 2.5.8 minimum, and `max()` keeps a larger consumer thumb inside the box |
| 5a | `.slider > input[type='range']::-webkit-slider-thumb` and `::-moz-range-thumb` (separate rules) (addition) | `width: max(24px, #{$slider-handle-width}); height: max(24px, #{$slider-handle-height}); margin-top: calc((#{$slider-height} - max(24px, #{$slider-handle-height})) / 2)` | WCAG 2.5.8 needs a 24 by 24 CSS px target; Foundation's default thumb is 1.4rem (22.4 px at a 16 px root) and `foundation-range-input` sizes it from the settings with no floor; the margin re-centres the larger thumb on the track, replacing the mixin's `-$margin`, which is computed from the unfloored height |
| 6 | `:focus-visible::-webkit-slider-thumb`, `:focus-visible::-moz-range-thumb` (separate rules) | `outline: 2px solid $black; outline-offset: 2px` | `foundation-range-input` sets `:focus { outline: 0 }` and nothing else (WCAG 2.4.7) |
| 7 | `.slider.disabled > input[type='range'][disabled]` (refinement: the prototype did not scope it to `.slider.disabled`) | `opacity: 1` | Foundation fades both `.slider.disabled` and `input[disabled]`, 0.25 x 0.25 together; scoped so a disabled handle in an enabled slider keeps Foundation's fade |
| 8 | `.slider > input[type='range'][aria-disabled='true']`, `[aria-readonly='true']`, and each thumb pseudo-element in separate rules; `.slider:not(.disabled) > input[type='range'][aria-disabled='true']` (addition) | `pointer-events: none`; the addition `opacity: $slider-opacity-disabled` | The focusable disabled and readonly states must not move under the pointer; Foundation has no rule for `aria-disabled`; one selector list mixing `-webkit-` and `-moz-` pseudo-elements is dropped whole by every engine, hence separate rules; the addition gives a handle disabled on its own (a Signal Forms field in a range) Foundation's disabled look |
| 9 | `::-moz-range-thumb` | `border: 0; border-radius: $slider-radius` | The mixin resets neither Gecko's default thumb border nor, when `$slider-radius` is 0, its rounded corners |
| 10 | `.slider > .slider-fill` | `inset-inline-start` and `width` from `--nfs-slider-lo`/`--nfs-slider-hi`, `--nfs-slider-length`, and `--nfs-slider-thumb`; `inset-inline-end: auto`; `transition: none`; `pointer-events: none` | Foundation's JavaScript wrote the fill extent inline; its `left: 0` is wrong in right-to-left; `$slider-transition` would lag behind the native thumb; a press on the fill belongs to the track, and axe must not count the fill as covering a thumb |
| 11 | `.slider.vertical`; `.slider.vertical > input[type='range']` and `~ input`; `.slider.vertical > .slider-fill` | container `container-type: size; --nfs-slider-length: 100cqh`; inputs `direction: ltr`, rotated a quarter turn about their anchored end (`transform-origin`, `translateY(-50%) rotate(90deg)`); fill positioned with `top`/`height` and `width: $slider-width-vertical` | Foundation's native mixin has no vertical form; `writing-mode` vertical controls are out of the Browser target; an RTL range would put the minimum at the top after rotation |
| 12 | `.slider:not(.vertical)`, emitted only when `$global-text-direction == rtl` (addition) | `transform: none` | Foundation mirrors the horizontal track with `scale(-1, 1)` to pair with its JavaScript's inversion; the native inputs and the logical-property fill already follow `direction`, so the mirror would reverse them a second time |

(2) Settings, mixins, and functions reused, read from the consumer's compile: `$slider-handle-width`, `$slider-handle-height`, `$slider-height`, `$slider-radius`, `$slider-width-vertical`, `$slider-opacity-disabled`, `$slider-background`, `$slider-fill-background`, `$slider-handle-background`, `$black`, `$global-text-direction`, and Foundation's `rem-calc()` and `color-contrast()`. The only literal values are the WCAG 2.5.8 minimum (24 px), the WCAG 1.4.11 ratio (3), and the focus outline width and offset (2 px), for which Foundation has no setting; the mixin takes no parameters.

(3) Custom properties: the directive writes `--nfs-slider-lo` and `--nfs-slider-hi` on the container and `--nfs-slider-span` on each input; the mixin sets `--nfs-slider-length`, `--nfs-slider-handle-width`, and `--nfs-slider-thumb`, and the directive reads `--nfs-slider-handle-width` (applying the same 24 px floor) for track-press geometry. An implementation channel, not theming (building-blocks 1.13).

(4) Motion classes: none. The mixin adds no transition or animation (it removes the fill's), so it emits no `prefers-reduced-motion` override.

(5) When the include is missing: the inputs render as full-width standalone Foundation range inputs below the track, with white boxes, the range form's inputs overlap each other's thumbs, the fill stays at Foundation's zero width, focus is invisible, thumbs fall back to Foundation's unfloored size (22.4 px by default, under WCAG 2.5.8), no contrast check runs, and a vertical slider shows horizontal inputs. When `foundation-range-input` is missing, the thumbs are the browser's defaults.

### Platform features to adopt when the browser target moves

- Vertical form controls through `writing-mode: vertical-lr` (Chrome 124, Firefox 120, Safari 17.4): replaces rule 11's rotation and the size container, and lets browsers expose vertical orientation natively, which resolves OPEN FOR HUMAN 1.
- The standard `::slider-thumb`, `::slider-track`, and `::slider-fill` pseudo-elements (CSS Forms; unshipped): replace the paired vendor pseudo-element rules and could replace the `.slider-fill` span, pending Foundation adopting them.

### Foundation behaviour changed or dropped

- The jQuery-only mechanics: pointer maths through `$(window).scrollTop()` and `offset()`, touch support by synthesising mouse events, body-level `mousemove`/`mouseup` binding per drag, the `Move` animation loop, reading the other handle's inline `left` for the fill, jQuery data `dragging`, and `_reflow` after un-hiding. The native input and CSS positions replace all of them.
- `Shift+Arrow` fast step: dropped; Page Up and Page Down are the conventional larger step.
- Handles one step apart: dropped; equal values are allowed (APG Multi-Thumb).
- Step snapping from `0`: now from `start` (the native rule).
- `aria-valuemin`/`aria-valuemax` never updated for two handles: now the dependent native bounds.
- `aria-controls` from the handle to a bound input, the hidden inputs, and `binding`: replaced by binding one signal or field to several controls.
- `tabindex="1"` in the docs markup and `aria-labelledby` on the container: replaced by labelled native inputs.
- `.is-dragging`: not bound (no visible effect on native inputs).
- The Chromium caveat: a vertical native range is announced as horizontal (OPEN FOR HUMAN 1 in the ticket).
