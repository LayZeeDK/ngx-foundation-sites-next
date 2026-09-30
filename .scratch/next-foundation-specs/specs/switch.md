# Spec: Switch

Ticket: [Spec: Switch](../issues/84-spec-switch.md), revised 2026-09-28 for radio groups by the [Re-run: Switch spec, out-of-scope survivors](../issues/147-rerun-switch-out-of-scope-survivors.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Written under the class rule ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)) and the Variant typing rules ([ADR 0040](../adr/0040-variant-input-types.md)); ADR 0001 (directive-first), ADR 0012 (Sass packaging), ADR 0022 (WCAG 2.2 AA enforcement), and ADR 0008 (Rendering modes) apply. Nearest precedents: [Spec: Button](../issues/37-spec-button.md), [Spec: Forms](../issues/98-spec-forms.md) (the Switch sits among form controls), [Spec: Close Button](../issues/83-spec-close-button.md) and [Spec: Progress Bar](../issues/95-spec-progress-bar.md) (visible names, required settings for the colour pairs Foundation's defaults fail).

## Problem Statement

A developer on Foundation for Sites who needs an on/off control writes Foundation's Switch markup: a `.switch` container holding an `<input type="checkbox">` (or `type="radio"`) with the `.switch-input` class and, right after it, a `<label class="switch-paddle" for="...">` that draws the track and the knob and makes the whole track clickable. The name is screen-reader-only text inside that label; the sizes are `.tiny`, `.small`, and `.large` on the container; optional state words go inside the label as `.switch-active` and `.switch-inactive` with `aria-hidden="true"`. Switch is a CSS-only component: Foundation ships Sass and classes and no Plugin, and its docs say to read the input's own `checked` property. The markup contract leaves the hard parts to the author, and axe reports none of them (measured on every example of Foundation's Switch docs page in Chromium, Firefox, and WebKit with axe-core 4.13.0 and the six tags: no violation; `label` and `target-size` pass; `color-contrast` on the inner labels is incomplete, "could not be determined due to a pseudo element"):

- No visible label. Foundation names every switch only with `.show-for-sr` text inside the paddle, so a sighted user sees an unlabelled track (WCAG 3.3.2). A developer who adds a visible label beside it doubles the name: Chromium and Firefox both name the switch with the visible text followed by the hidden text (measured through their accessibility trees and Windows UI Automation), because every label of a control joins its name.
- The off track cannot be seen. `$switch-background` (`$medium-gray`, `#cacaca`) is 1.625:1 against the page and 1.625:1 against the white knob (exact WCAG formula), under the 3:1 of 1.4.11, so neither the switch nor its off state is identifiable for a user with low vision. White inner-label text on it is 1.625:1, under the 4.5:1 of 1.4.3.
- Focus shows only as a colour change. The input is `opacity: 0`, so the browser's focus ring on it is invisible; Foundation marks focus by darkening the track, 1.239:1 from the resting colour when off and 1.295:1 when on. The Understanding document for 1.4.11 says such a change of background "is not in scope of non-text contrast. However, this would not pass Use of color" (1.4.1), and a user who cannot tell the two greys apart cannot find the focus (2.4.7).
- Under forced colours (Windows contrast themes) the track and the knob are backgrounds, which the browser replaces with Canvas: in Chromium and Firefox the whole switch disappears, on and off, focused or not (measured).
- The knob slides for 0.25 s (`$switch-paddle-transition: all 0.25s ease-out`) with no reduced-motion rule.
- The inner labels stay out of the name only by convention: without `aria-hidden="true"` the shown word joins the name ("Do you like me? Yes", measured), so the name changes with the state, which the APG Switch pattern forbids.
- The role is a checkbox, even where the control reads as an on/off setting, and `role="switch"` copied onto a radio switch is not allowed (axe `aria-allowed-role`, measured).
- Foundation's radio switches sit in no group: no `fieldset`, `legend`, or `radiogroup` names the question they answer (1.3.1), and axe has no rule for it (none of axe-core 4.13.0's rule ids names a radio, a group, a fieldset, or a legend; measured).
- Under the library's class rule the developer writes no Foundation class at all, so the five Structural classes and the three size classes need an Angular home, and nothing may break Angular Forms, which picks its checkbox and radio value accessors from the input's static `type` attribute.

A server-rendered application adds the usual second problem: every class must already be in the server HTML, nothing may break hydration, and the switch must keep toggling as plain HTML before hydration and inside dehydrated `@defer` blocks.

## Solution

Five small attribute directives in one entry point, `ngx-foundation-sites/switch`, one per Foundation Structural class, each a static host class and little else:

- `[nfsSwitch]` binds `.switch` and sets `.tiny`, `.small`, or `.large` from a closed `size` input.
- `input[nfsSwitchInput]` binds `.switch-input` on the native checkbox or radio, which keeps its own `type`, `checked`, `disabled`, name, value, keys, and form participation. Its docs state the rules for the markup around it: a visible name, no text inside the paddle, a static `type` of `checkbox` or `radio`, no `role="switch"` on a radio, and radio switches inside a named group.
- `label[nfsSwitchPaddle]` binds `.switch-paddle`; as documented, it directly follows its input and names it with `for`.
- `[nfsSwitchActive]` and `[nfsSwitchInactive]` bind the inner-label classes and `aria-hidden="true"`.

The switch is named by a visible label: a `<label for>` before it, or `aria-labelledby` to visible text, with the paddle left without text. `role="switch"` is the developer's to write on a checkbox that turns a setting on or off; the library adds no role, and never allows one on a radio.

The `nfs-switch` Library mixin draws a focus ring around the track from Foundation's form focus setting, `$input-border-focus`, offset by `$switch-paddle-offset`; paints the switch in system colours under forced colours; and stops the knob's slide under reduced motion. The documented settings keep every track, the knob, and the focus ring at 3:1 or better and every switch height at 24 px or more; on Foundation's defaults that is a darker off track, two lines of settings.

## User Stories

1. As an application developer, I want to put `nfsSwitch`, `nfsSwitchInput`, and `nfsSwitchPaddle` on Foundation's three elements and get its switch, so that I write no Foundation class.
2. As an application developer, I want the input to stay a native `<input type="checkbox">`, so that its `checked` property, `change` event, and form value work as the platform defines them.
3. As an application developer, I want `formControlName`, `[formControl]`, `ngModel`, and Signal Forms' `[formField]` to work on the switch input as on any checkbox, so that the switch holds a boolean in my form model.
4. As an application developer, I want radio switches (`type="radio"`) in a group, so that one of several options can be on, as Foundation documents.
5. As an application developer, I want the docs to state that the input's `type` is written as a static `checkbox` or `radio` attribute, so that Angular Forms never falls back to its text value accessor.
6. As an application developer, I want to name the switch with a visible `<label for>` before it, so that everyone sees what it switches.
7. As an application developer, I want `aria-labelledby` to visible text to work as the name, so that a switch in a settings row or a table cell can be named by that row's text.
8. As an application developer, I want the docs to state that every switch is named by a visible `<label for>` or by `aria-labelledby` to visible text, so that no switch of mine ships without a name.
9. As an application developer, I want the docs to state that the paddle holds no text, so that Foundation's screen-reader-only pattern is replaced by a visible label and never doubles one.
10. As an application developer, I want to add `role="switch"` to a checkbox switch that turns a setting on or off, so that screen readers announce it as a switch that is on or off.
11. As an application developer, I want the docs to state that a radio switch never takes `role="switch"`, so that I never ship a role the platform does not allow there.
12. As an application developer, I want the docs and every radio example to put radio switches in a named group, so that I add the `fieldset` and `legend` that tell a screen reader user the question the options answer.
13. As an application developer, I want `size="tiny"`, `size="small"`, or `size="large"` to give me Foundation's sizes, so that I use the names Foundation documents.
14. As an application developer, I want no `size` to give me Foundation's default switch, so that my Sass settings stay the default look.
15. As an application developer, I want a misspelt size or a Foundation class name passed as a size to fail to compile, so that a typo never ships an unsized switch.
16. As an application developer migrating Foundation markup, I want a copied `small` in `class="switch small"` stripped and the docs to name `size` in its place, so that a copied class never fights the input.
17. As an application developer, I want `nfsSwitchActive` and `nfsSwitchInactive` to give me Foundation's inner labels already hidden from assistive technology, so that the state words never join the name.
18. As an application developer, I want the docs to state that the paddle label directly follows its input and names it with `for`, so that a press on the track always reaches the input.
19. As an application developer, I want native `disabled` to fix a switch in its position, as Foundation documents, so that no library API stands between me and the platform.
20. As a screen reader user, I want the switch announced once, with its role, its visible label, and its state, so that I know what it does and whether it is on.
21. As a screen reader user, I want a group of radio switches announced with its legend, so that I know the question the options answer.
22. As a keyboard user, I want Tab to reach the switch and Space to toggle it, so that it works like any checkbox.
23. As a keyboard user, I want a visible focus ring around the track, so that I can see which switch has focus without comparing two greys.
24. As a pointer or touch user, I want the whole track and the visible label to toggle the switch, and every switch at least 24 by 24 CSS px, so that I can hit it reliably.
25. As a user with low vision, I want the off track to contrast at least 3:1 with the page and with the knob, and the on track too, so that I can find the switch and see its state.
26. As a user with low vision, I want inner-label words to reach 4.5:1 on the track behind them, so that I can read "Yes" and "No".
27. As a user who does not perceive colour, I want the knob's position to show the state and the ring to show focus, so that neither depends on colour alone.
28. As a user of a Windows contrast theme, I want the switch drawn in my theme's colours, so that it does not vanish when the browser replaces its backgrounds.
29. As a user who prefers reduced motion, I want the knob to move without sliding, so that toggling moves nothing on its own.
30. As a user who enlarges text spacing, I want inner-label words to stay inside the track and clear of the knob, so that I can read them.
31. As an application developer, I want the Sass section to list every switch colour pair and height with the ratio or size it must reach, so that I can hold my theme to them.
32. As an application developer on Foundation's defaults, I want the spec to name the settings that pass, so that my theme passes in two lines.
33. As an application developer with a validated form, I want `nfsAbideInput` beside `nfsSwitchInput`, so that a required switch shows its Form error and keeps a value checked before hydration.
34. As a developer of a server-rendered application, I want the server HTML to carry every Switch class and `aria-hidden` attribute, so that the first paint is final and hydration changes nothing.
35. As a developer using `@defer (hydrate never)`, I want a switch there to toggle and submit as plain HTML, so that static regions need no JavaScript.
36. As a developer of a zoneless application, I want the directives to need no zone, so that they work with zoneless change detection.
37. As an application developer, I want to import the directives from their own entry point, so that a `@defer` block can split them with the form.
38. As a library maintainer, I want every behaviour asserted through roles, names, states, classes, geometry, computed colours, and pixels in stories, browser-level tests, a server-render smoke test, a Sass compile test, and e2e, so that regressions surface at the layer that owns them.

## Implementation Decisions

### Foundation contract

Switch has no Plugin, no `defaults` object, no `data-*` Options, no events, and no methods. Its whole contract is Foundation's switch Sass partial, its docs page, and the markup the docs show. Dropped options: none, because there are none.

| Feature | Class or markup | Source of the names | Notes |
| --- | --- | --- | --- |
| Container | `.switch` | `@mixin foundation-switch` (`switch-container`) | Structural class. `position: relative`, `height: $switch-height`, `margin-bottom: $switch-margin`, `user-select: none`, and white bold text that the inner labels inherit |
| Input | `.switch-input` on `<input type="checkbox">` or `type="radio"` | `switch-input` | Structural class. `position: absolute; opacity: 0`; the input keeps its native size (13 px in Chromium, 14 in Firefox, 12 in WebKit, measured) at the container's top-left corner, inside the track |
| Paddle | `.switch-paddle` on the `<label for>` that directly follows the input | `switch-paddle` | Structural class. The label is the track (`$switch-height` tall, twice as wide, `$switch-background`, `$switch-radius`) and its `::after` is the knob (`$switch-paddle-background`, inset by `$switch-paddle-offset`). `input:checked ~ &` moves the knob and sets `$switch-background-active`; `input:focus-visible ~ &` sets `$switch-background-focus` or `$switch-background-active-focus`; `input:disabled ~ &` sets `$switch-opacity-disabled` and `$switch-cursor-disabled`. `$switch-paddle-transition` animates all of it |
| Sizes | `.tiny`, `.small`, `.large` on `.switch` | `.switch.tiny`, `.switch.small`, `.switch.large` in `foundation-switch`, through `switch-size()` with `$switch-height-tiny`, `$switch-height-small`, `$switch-height-large` | Closed Variant family: Foundation's Sass writes the three names itself; no map lists them. The default size has no class |
| Inner labels | `.switch-active`, `.switch-inactive`, direct children of the paddle | `switch-text-active`, `switch-text-inactive` | Structural classes. Absolutely placed at 8% from the start and 15% from the end; shown by `input:checked + label > &` and hidden otherwise (the inactive one the other way round). The docs add `aria-hidden="true"` |
| Name | `.show-for-sr` text inside the paddle | Docs | Replaced: a visible label names the switch (D4) |
| Radio switch | `type="radio"` inputs sharing a `name` | Docs | Native radio group |
| Disabled | native `disabled` on the input | Docs | No class |
| Focus outline | `disable-mouse-outline` on the paddle | `[data-whatinput='mouse'] &` | Depends on the what-input library that Foundation's JavaScript loads; the library never loads it |

Docs conventions kept or corrected: the input-then-label order (kept, a usage rule); `for` and a unique `id` (kept, a usage rule); `aria-hidden="true"` on the inner labels (kept, now bound by their directives); reading `checked` from the input (kept: the input is the API); the screen-reader-only name inside the paddle (corrected: a visible label, D4); the radio switches without a group label (corrected: a `fieldset` with a `legend` in every example, as the [Spec: Forms](../issues/98-spec-forms.md) requires of radio groups, and a usage rule, D16).

### CSS class to directive mapping

| Foundation class | Element | Angular | Kind | Notes |
| --- | --- | --- | --- | --- |
| `.switch` | any, usually `div` | `NfsSwitch`, `[nfsSwitch]`, static host class | Structural | |
| `.tiny`, `.small`, `.large` | the `.switch` host | `size` Variant input of `NfsSwitch` | Variant | See the Variant family row below |
| `.switch-input` | `input` | `NfsSwitchInput`, `input[nfsSwitchInput]`, static host class | Structural | Usage rules: a visible name, no paddle text, a static `type`, no `role="switch"` on a radio, a named radio group |
| `.switch-paddle` | `label` | `NfsSwitchPaddle`, `label[nfsSwitchPaddle]`, static host class | Structural | Usage rule: directly follows its input and names it with `for` |
| `.switch-active` | any, usually `span`, inside the paddle | `NfsSwitchActive`, `[nfsSwitchActive]`, static host class and `aria-hidden="true"` | Structural | |
| `.switch-inactive` | any, usually `span`, inside the paddle | `NfsSwitchInactive`, `[nfsSwitchInactive]`, static host class and `aria-hidden="true"` | Structural | |

Variant families (building-blocks 1.14 item 2):

| Family | Variant input | Type alias | Sass setting and Variant registry | Value shape | Class each value sets | Variant property |
| --- | --- | --- | --- | --- | --- | --- |
| Switch size | `NfsSwitch.size` | `NfsSwitchSize`: `'tiny' \| 'small' \| 'large'` | Closed: `foundation-switch` writes the three classes itself, and no Sass setting lists them, so there is no registry | a name | the name itself (`size="small"` sets `.small`); unset sets none, so the switch has Foundation's default size | None (closed family) |

State classes: none. Foundation's Switch has no State class: on, off, focused, and disabled are the input's `:checked`, `:focus-visible`, and `:disabled` pseudo-classes, which Foundation's sibling selectors read. No class is left for the consumer to write (ADR 0039). Foundation has no responsive switch size, so `size` takes no Breakpoint query or rules object.

The visible label is a Form label, styled by Foundation by tag; it needs no directive, and takes `label[nfsFormLabel]` only for its `middle` Variant ([Spec: Forms](../issues/98-spec-forms.md)).

### Hierarchy and DI shape

```
[nfsSwitch]                          NfsSwitch           .switch; size
  input[nfsSwitchInput]              NfsSwitchInput      .switch-input
  label[nfsSwitchPaddle]             NfsSwitchPaddle     .switch-paddle
    [nfsSwitchActive]                NfsSwitchActive     .switch-active; aria-hidden="true"
    [nfsSwitchInactive]              NfsSwitchInactive   .switch-inactive; aria-hidden="true"
```

- No injection tokens, providers, parent discovery, host directives, or Defaults token. Foundation's rules are descendant and sibling selectors (`.switch.small .switch-paddle`, `input:checked ~ .switch-paddle`, `input:checked + label > .switch-active`), so the cascade delivers what a parent token would, as the Forms spec's input group and the Button Group found. Switch has no Options for a Defaults token to hold, and a Defaults token never holds a Variant default (building-blocks 1.4).
- Injection: none. No Switch directive reads its element or its attributes.
- Entry point: `ngx-foundation-sites/switch` exports the five directive classes and `NfsSwitchSize`. It imports nothing at run time from other entry points; the closed alias needs no registry from the primary entry point, as the Reveal's `NfsRevealSize` does not.

### API per directive

```ts
type NfsSwitchSize = 'tiny' | 'small' | 'large';

export class NfsSwitch {
  /**
   * Foundation `.switch.tiny`, `.switch.small`, `.switch.large` (`switch-size()` with `$switch-height-tiny`,
   * `$switch-height-small`, `$switch-height-large`). Closed Variant family. Default `undefined` sets no class.
   * Bind `size`; a copied `tiny`, `small`, or `large` class is stripped (usage rule 7).
   */
  readonly size: InputSignal<NfsSwitchSize | undefined>;
}
/**
 * Foundation `.switch-input` on a native checkbox or radio. Name it with a visible `<label for>` or
 * `aria-labelledby` to visible text; write `type="checkbox"` or `type="radio"` as a static attribute;
 * never `role="switch"` on a radio; radio switches sit in a named group (usage rules 1 to 5).
 */
export class NfsSwitchInput {}
/**
 * Foundation `.switch-paddle`. Directly after its `nfsSwitchInput`, naming it with `for`; holds no text
 * (usage rules 2 and 6).
 */
export class NfsSwitchPaddle {}
export class NfsSwitchActive {}
export class NfsSwitchInactive {}
```

| Directive | Selector | Host bindings | Inputs | Usage rules |
| --- | --- | --- | --- | --- |
| `NfsSwitch` | `[nfsSwitch]` | static `class`: `switch`; `[class]`: one `computed` record `{tiny, small, large}`, each `true` or `false` | `size`: `NfsSwitchSize`, declared with explicit type arguments that name the alias; no transform; default `undefined` | 7 |
| `NfsSwitchInput` | `input[nfsSwitchInput]` | static `class`: `switch-input` | none | 1 to 5 |
| `NfsSwitchPaddle` | `label[nfsSwitchPaddle]` | static `class`: `switch-paddle` | none | 2 and 6 |
| `NfsSwitchActive` | `[nfsSwitchActive]` | static `class`: `switch-active`; static `aria-hidden`: `true` | none | none |
| `NfsSwitchInactive` | `[nfsSwitchInactive]` | static `class`: `switch-inactive`; static `aria-hidden`: `true` | none | none |

- The size record holds every size class as `true` or `false`, so a size class copied from Foundation's markup is stripped on server and client (building-blocks 1.4: Angular's styling resolution consults a static class only when every binding for it is `undefined`); a redundant `switch` merges with the static host class. The consumer's own classes stay, because Angular combines static classes and class bindings.
- `NfsSwitchInput` binds no `type`, `role`, `checked`, `disabled`, or ARIA attribute (D2, D3, D8). `type` stays a static attribute the consumer writes, because Reactive and template-driven Forms select `CheckboxControlValueAccessor` and `RadioControlValueAccessor` by the static attribute (`input[type=checkbox][formControlName]` and the like); an input whose `type` came from a host binding would get the `DefaultValueAccessor` and a string value. Signal Forms' `[formField]` reads the element's `type` at run time and works either way.
- Models, outputs, and methods: none. The native `checked` property and `change` event are the API, as Foundation's docs say, and Angular Forms binds them. `exportAs`: `nfsSwitch`, `nfsSwitchInput`, `nfsSwitchPaddle`, `nfsSwitchActive`, `nfsSwitchInactive`, each the class name with a lowercase first letter.
- Usage rules (each directive's JSDoc states the rules for its host, and the usage examples follow them). The name and the structure belong in the server HTML, where assistive technology reads the dehydrated switch:
  1. Name every switch: a visible `<label for="<id>">` before it, or `aria-labelledby` to visible text (WCAG 1.3.1, 3.3.2, 4.1.2). The name is taken in accessible-name order from the text of the elements `aria-labelledby` references, a non-blank `aria-label`, the text of the input's `labels` outside `aria-hidden="true"` subtrees, then `title`, where text also counts the non-blank `alt` of an `img` or the non-blank `aria-label` of an element with `role="img"` (building-blocks 1.10, Names).
  2. Leave the paddle label without text: text inside it outside `aria-hidden="true"` subtrees, or an image with a non-blank `alt` or `aria-label` there (Foundation's `.show-for-sr` pattern), joins the switch's name, and sighted users never see it: it names the switch without a visible label, or repeats a visible one (WCAG 3.3.2, 2.5.3). The inner labels are `aria-hidden` and stay out of the name.
  3. Write `type="checkbox"` or `type="radio"` as a static attribute on `nfsSwitchInput`: a switch is one of the two, and Angular Forms picks its checkbox and radio value accessors from the static attribute (D2).
  4. Never write `role="switch"` on a `type="radio"` switch: ARIA in HTML does not allow it, and a radio switch keeps its radio role (D3).
  5. Put radio switches in a named group that holds every radio of their group: a `fieldset` whose first child is a `legend` stating the question, as every example does, or an element whose `role` is `group` or `radiogroup`, named by `aria-labelledby` to visible text or by `aria-label` (WCAG 1.3.1; D16). The group is HTML's radio button group: the radios in the same tree with the same form owner (`form`) and the same non-empty `name`; a radio without a `name` is a group of one.
  6. Write the paddle `<label>` directly after its `nfsSwitchInput`, and name the input with `for="<id>"`: Foundation selects the switch's states with `input:checked ~ .switch-paddle` and `input:checked + label`, and without the link a press on the track does not reach the input (WCAG 2.5.8; D15).
  7. Bind `size` rather than copying `tiny`, `small`, or `large` onto the `nfsSwitch` host: a copied size class is stripped.

### When to add `role="switch"`

The library adds no role (D3). The APG Switch pattern says to "choose the role that best matches both the visual design and semantics of the user interface", and gives the example of a lights control, better announced as "Lights switch on", which in a checklist of pre-takeoff procedures reads better as "Lights checkbox checked". The docs give the consumer the same rule:

| The switch | Role | Announced (Chromium and Firefox through UI Automation, measured) |
| --- | --- | --- |
| Turns a setting on or off where it stands (captions, notifications, dark mode) | `role="switch"` on the `type="checkbox"` input | A switch control whose Toggle state is on or off, named by its label |
| Is one choice in a form submitted later, or answers a yes-or-no question | none: the native checkbox | A check box, checked or not, named by its label |
| Is one of several options (`type="radio"`) | none, never `role="switch"` | A radio button, selected or not, inside its group |

With `role="switch"` the native `checked` state still drives the state; no `aria-checked` is written (APG: "If the switch element is an HTML input[type="checkbox"], it uses the HTML checked attribute instead of the aria-checked property"). A switch has no mixed state, so an `indeterminate` checkbox is never a switch.

### Beside Angular Forms and the Abide directives

- `nfsSwitchInput` binds one class, so every forms directive on the same input works as on any checkbox or radio: `formControlName`, `[formControl]`, `ngModel`, `[formField]`. The value is the native `checked` state (a boolean for a checkbox; the input's `value` for a radio group).
- A validated switch carries `nfsAbideInput` beside `nfsSwitchInput`, and its visible label `[nfsAbideLabel]`; the Form error follows the switch container. Abide's `.is-invalid-input` lands on the invisible input and shows nothing, so the label's `.is-invalid-label` and the Form error carry the invalid state (3.3.1), as the [Spec: Abide](../issues/31-spec-abide.md) defines them. Abide's value rescue adopts a switch checked before hydration, as it does for every checkbox and radio host ([Prototype: Abide control kinds, value adoption, and the ready gate](../issues/66-prototype-abide-controls-and-ready.md)).
- Help text is `nfsHelpText` with its id in the input's `aria-describedby`, as for any field ([Spec: Forms](../issues/98-spec-forms.md)).

### Material comparison

| Concern | Material 22.2 `MatSlideToggle` | Library |
| --- | --- | --- |
| Shape | A component rendering `<button role="switch" type="button">`, its handle and icons, and an internal `<label for>` | Five directives on Foundation's markup: a native checkbox or radio and its paddle label |
| Role | Always `switch` on a button, with `aria-checked` | The native checkbox or radio; `role="switch"` written by the consumer on a checkbox that turns a setting on or off (D3) |
| Label | Projected content in an internal label; `labelPosition` before or after | The consumer's visible `<label for>` or `aria-labelledby` (D4) |
| Value and forms | `checked` input, `change` and `toggleChange` outputs, `ControlValueAccessor` and `Validator` | The native `checked` property and `change` event; Angular Forms' own accessors (D8) |
| Disabled | `disabled`, `disabledInteractive` with `aria-disabled` | Native `disabled` only |
| State cue beside colour | The handle's position and optional check and minus icons (`hideIcon`) | The knob's position |
| Motion | Handle animation off when `_animationsDisabled()` (the animations token or `prefers-reduced-motion`) | `nfs-switch`'s reduced-motion rule |
| Focus | Focus indicator and ripple state layer on the handle | A ring around the track from `$input-border-focus` |
| Testing | `MatSlideToggleHarness` | DOM-first assertions, no harness |

Borrowed: a visible label on every switch; `role="switch"` for on/off settings; no slide under reduced motion. Not borrowed: the component and its button (Foundation's markup carries every element, and a native checkbox participates in forms and works before hydration); `aria-checked` on a native checkbox; the outputs and the value accessor (the platform and Angular Forms own the value); `disabledInteractive` (Foundation draws only `:disabled`); icons inside the knob (Foundation draws none, and the knob's position already carries the state).

### Implementation level and primitives

Implementation level: native platform. The switch is an HTML checkbox or radio: its role, `checked` state, Space activation, radio-group arrow keys, `disabled`, labels, and form value are the platform's, and Foundation's sibling selectors draw it from pseudo-classes. `@angular/aria` has no checkbox or switch pattern in 22.2, and `@angular/cdk` has nothing to add: the browser's `:focus-visible` heuristic already decides when the ring shows (a pointer press gives the input focus without `:focus-visible` in Chromium and Firefox, and leaves focus where it was in WebKit, measured). The Angular layer is static host classes and attributes and one `computed` class record over one `input()` signal. No `effect`, render callback, listener, timer, observer, service, or `injectAsync`.

Fallback: none needed. The risks the library owns (the focus ring, forced colours, reduced motion, the name patterns, the contrast settings) were measured by this spec's ticket in three engines, and the radio-group condition by its re-run.

### ARIA and keyboard

APG pattern: Switch (for `role="switch"` checkboxes); otherwise the native checkbox and radio. A group of switches follows the pattern's grouping rule: a `fieldset` with a `legend` (usage rule 5).

| Element or state | Rendered semantics | Source |
| --- | --- | --- |
| `input[nfsSwitchInput][type="checkbox"]` | Role `checkbox`, checked or not, named by its labels | HTML-AAM; measured in Chromium (CDP) and through UI Automation in Chromium and Firefox |
| The same with `role="switch"` | Role `switch`, on or off from the native `checked` state (UI Automation: a Button control with the localized type "switch" and a Toggle pattern) | APG Switch; measured |
| `input[nfsSwitchInput][type="radio"]` | Role `radio`, selected or not, in its group; `role="switch"` not allowed (axe `aria-allowed-role`) | HTML-AAM; ARIA in HTML |
| Visible `<label for>` | Names the input; a press on it toggles the input | HTML |
| `label[nfsSwitchPaddle]` | Joins the name only with text outside `aria-hidden`, which the library's markup leaves out; a press on it toggles the input | HTML; accessible name computation |
| `[nfsSwitchActive]`, `[nfsSwitchInactive]` | `aria-hidden="true"`: out of the name, which must not change with the state | APG Switch ("element states are not permitted in accessible names"); measured: without it the name gains the shown word |
| `fieldset` with `legend` around radio switches | Role `group`, named by the legend | HTML-AAM; measured |
| `role="radiogroup"` or `role="group"` element named by `aria-labelledby` or `aria-label` around radio switches | Role `radiogroup` or `group`, named by its ARIA name; meets usage rule 5 | WAI-ARIA; measured |
| Description | `aria-describedby` to help text, written by the consumer | WAI-ARIA |

Measured names (Chromium's accessibility tree and UI Automation in Chromium and Firefox): a visible `<label for>` plus an empty paddle is named by the visible text alone; `aria-labelledby` to visible text wins over the labels; Foundation's hidden text alone names the switch; a visible label plus Foundation's hidden text gives the two texts concatenated. WebKit's tree is not exposed on Windows; its release test is the manual one below.

Measured groups (Chromium's accessibility tree and UI Automation in Chromium and Firefox, 24 grouping patterns of radio switches): both engines expose a named group or radio group holding the radios for a `fieldset` named by its first `legend` child, wherever that child stands, by `aria-label`, `aria-labelledby`, or `title`; a `fieldset` with `role="radiogroup"` and a legend; a `role="group"` or `role="radiogroup"` element with an ARIA name; and an unnamed group inside a named one. Neither does for no container, as in Foundation's docs; a heading before a plain `div`; an empty legend; a `role="none"` fieldset; an unnamed `radiogroup`; `aria-labelledby` at a missing id; `details` with a `summary`; a named `form` or `section`, which both engines expose as a landmark, not a group; one radio of the group outside the fieldset; and the same `name` in a second form. The engines disagree on two patterns, a legend nested in a `div` inside the fieldset and a legend with `aria-hidden="true"`: Firefox names the group and Chromium does not, so usage rule 5 asks for neither. Both engines name a group from a legend that holds only an image's `alt` (Notes).

| Key | Result | Owner |
| --- | --- | --- |
| Tab, Shift+Tab | Reaches the switch input | Native |
| Space | Toggles a checkbox switch; selects a radio switch | Native |
| Arrow keys | Move the selection within a radio group | Native |
| Enter | Nothing from the switch; the APG makes Enter optional for switches | Native |

Focus: the directives move no focus. Toggling a switch must not move focus or change the context (3.2.2); the docs say so for switches that apply a setting at once.

### WCAG 2.2 AA

The target is WCAG 2.2 level AA (user rule; ADR 0022). Each criterion below is a requirement with the layer that tests it; none is advice. Ratios were computed by this spec's ticket with the exact WCAG relative-luminance formula (`math.pow`) from Foundation 6.9.0's default settings, unrounded and floored to three decimals, never Foundation's `color-luminance()`, whose approximate `pow()` passes pairs the exact formula fails (the [Spec: Top Bar](../issues/86-spec-top-bar.md) measured it). Geometry, focus, and forced colours were measured in Chromium, Firefox, and WebKit through Playwright 1.63, with axe-core 4.13.0.

| Criterion | Requirement and how it is met | Foundation default | Test |
| --- | --- | --- | --- |
| 1.4.11 Non-text Contrast | The track identifies the switch and the knob its state, as the Understanding document's toggle example asks: every track colour (`$switch-background`, `$switch-background-focus`, `$switch-background-active`, `$switch-background-active-focus`) reaches 3:1 against `$body-background`, and the knob (`$switch-paddle-background`) 3:1 against every track colour: documented usage in the Sass subsection, and the stories assert it from computed styles, because axe has no 1.4.11 rule. Required on Foundation's defaults: `$switch-background: #767676;` (4.503:1 against the page and the knob), with `$switch-background-focus: scale-color($switch-background, $lightness: -10%);` repeated after it, because Foundation's settings file assigns the focus colour from the old track (2.015:1 otherwise, measured). The focus ring's colour reaches 3:1 against `$body-background` (2.4.7 row). Under forced colours `nfs-switch` paints the track edge and the off knob `CanvasText`, the on track `Highlight` with a `HighlightText` knob, and a disabled switch `GrayText` (measured in Chromium and Firefox) | Fails: off track 1.625:1 against the page and the knob; focused off track 2.015:1. Passes: on track 4.647:1, focused on track 6.022:1. Under forced colours the whole switch takes Canvas and disappears in Chromium and Firefox | `switch--contrast` from computed styles; e2e under forced colours |
| 1.4.1 Use of Color | The state is the knob's position, not the track's colour alone; focus is a ring, a shape, not Foundation's darker track alone (1.239:1 and 1.295:1 from rest, which the Understanding document for 1.4.11 says "would not pass Use of color") | Fails for focus | `switch--focus`; e2e ring pixels |
| 2.4.7 Focus Visible | `nfs-switch` draws `outline: $input-border-focus` with `outline-offset: $switch-paddle-offset` around the track of a focused switch (`.switch-input:focus-visible ~ .switch-paddle`), because the input's own ring is invisible at `opacity: 0`; the ring sits on the page, so its colour must reach 3:1 against `$body-background` (documented usage, Sass subsection): Foundation's default `$dark-gray` is 3.422:1, and the `$black` the Forms spec requires 19.63:1. Measured in three engines: a 1 px ring 4 px outside the track after Tab (after `focus()` in WebKit), none after a pointer press; `CanvasText` under forced colours | Fails: no ring, only the 1.239:1 darker track | `switch--focus`; e2e in three engines and under forced colours |
| 1.4.3 Contrast (Minimum) | Inner-label text (Foundation's `$white`, 10 to 16 px bold, not large text) reaches 4.5:1 on each track colour it shows on: `.switch-inactive` on the off tracks, `.switch-active` on the on tracks: documented usage for every switch that shows inner labels, an optional placement; the required `#767676` passes (4.503:1). axe marks the text incomplete ("could not be determined due to a pseudo element"), so the story asserts the ratio from computed styles. The visible label is page text, covered by axe `color-contrast` | Fails: inactive text 1.625:1; active text 4.647:1 passes | `switch--inner-labels` play function |
| 1.4.12 Text Spacing | Inner labels are short state words: "Yes" and "No", "On" and "Off" stay inside the track and clear of the knob at every size with line height 1.5, letter spacing 0.12em, and word spacing 0.16em (measured in three engines). The docs keep inner labels to such words | Passes for short words | e2e with the text-spacing stylesheet in three engines |
| 2.5.8 Target Size (Minimum) | The paddle label is the pointer target, and the visible label a second one. At a 16 px root the paddle measures 48 by 24 (`tiny`), 56 by 28 (`small`), 64 by 32 (default), and 80 by 40 px (`large`) in three engines, so every size meets 24 px by size. Documented usage: every height setting stays at 24 px or more at the consumer's `$global-font-size` (`tiny` is 21 px at `87.5%`) | Passes (`tiny` exactly 24 px tall) | axe `target-size` in every story; play functions assert each paddle box |
| 1.3.1 Info and Relationships | The visible label is tied to the input by `for` or `aria-labelledby`; radio switches sit in a `fieldset` named by its `legend` (usage rules 1 and 5; axe has no rule for the group) | Foundation's visible "Do you like me?" is a paragraph tied to nothing; its radio switches have no group | axe `label`; `switch--radio` queries the group by its name |
| 3.3.2 Labels or Instructions | Every switch has a visible label; the paddle holds no hidden text that could name it instead (usage rules 1 and 2) | Fails: every docs example is named only by `.show-for-sr` text | Play functions find each switch by its visible label |
| 2.5.3 Label in Name | The name is the visible label's text, once; usage rule 2 keeps out hidden paddle text, which would repeat it | Passes where the hidden text matches the visible text, repeating it | Play functions assert the exact name |
| 4.1.2 Name, Role, Value | Role and state are native (`checkbox`, `switch` from `role`, `radio`); the name is the label's; the inner labels are `aria-hidden` so the name never changes with the state; `role="switch"` never on a radio (usage rule 4) | Passes on the docs' checkbox markup | axe `label`, `aria-allowed-role` in every story; play functions query by role, name, and checked state |
| 2.1.1 Keyboard | Native Tab, Space, and radio arrow keys; the directives add no key handling | Passes | Play functions (`userEvent.keyboard`); e2e real keys |
| 3.2.2 On Input | Toggling changes a value or a setting, never the page or the focus; the docs say so for switches that apply a setting at once | Passes | Design review; usage examples |

The axe gate in every story runs the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, plus `best-practice`) with `parameters.a11y.test = 'error'` (ADR 0018). On a switch with a visible `<label for>` and its paddle, axe reports `form-field-multiple-labels` as incomplete ("Ensure the first label contains all necessary information"), not as a violation: the first label holds the whole name, and Chromium and Firefox name the switch from it (measured); the manual release test covers the screen readers.

### Rendered HTML

Consumer markup, then the resulting DOM. The server HTML and the hydrated DOM are identical: every class is a static host class or the size record, `aria-hidden` is a static host attribute, and no directive declares a listener. Angular also renders the directive attributes and the static attributes that feed inputs (`nfsswitch=""`, `size="large"`), which the resulting DOM leaves out, as the other specs do. Class order is not significant.

```html
<!-- A setting that takes effect at once: a visible label, role="switch", an empty paddle -->
<label for="captions">Show captions</label>
<div nfsSwitch>
  <input nfsSwitchInput type="checkbox" role="switch" id="captions" name="captions">
  <label nfsSwitchPaddle for="captions"></label>
</div>

<label for="captions">Show captions</label>
<div class="switch">
  <input class="switch-input" type="checkbox" role="switch" id="captions" name="captions">
  <label class="switch-paddle" for="captions"></label>
</div>

<!-- A yes-or-no question with inner labels: a checkbox, large -->
<label for="like">Do you like me?</label>
<div nfsSwitch size="large">
  <input nfsSwitchInput type="checkbox" id="like" name="like">
  <label nfsSwitchPaddle for="like">
    <span nfsSwitchActive>Yes</span>
    <span nfsSwitchInactive>No</span>
  </label>
</div>

<label for="like">Do you like me?</label>
<div class="switch large">
  <input class="switch-input" type="checkbox" id="like" name="like">
  <label class="switch-paddle" for="like">
    <span class="switch-active" aria-hidden="true">Yes</span>
    <span class="switch-inactive" aria-hidden="true">No</span>
  </label>
</div>

<!-- Radio switches in a named group -->
<fieldset>
  <legend>Choose your starter</legend>
  <label for="bulbasaur">Bulbasaur</label>
  <div nfsSwitch>
    <input nfsSwitchInput type="radio" id="bulbasaur" name="starter" value="bulbasaur" checked>
    <label nfsSwitchPaddle for="bulbasaur"></label>
  </div>
  <label for="charmander">Charmander</label>
  <div nfsSwitch>
    <input nfsSwitchInput type="radio" id="charmander" name="starter" value="charmander">
    <label nfsSwitchPaddle for="charmander"></label>
  </div>
</fieldset>

<!-- A settings row named by its visible text -->
<span id="email-label">Email notifications</span>
<div nfsSwitch size="small">
  <input nfsSwitchInput type="checkbox" role="switch" id="email" aria-labelledby="email-label">
  <label nfsSwitchPaddle for="email"></label>
</div>

<!-- Disabled, fixed on -->
<label for="locked">Required cookies</label>
<div nfsSwitch>
  <input nfsSwitchInput type="checkbox" role="switch" id="locked" checked disabled>
  <label nfsSwitchPaddle for="locked"></label>
</div>
```

A `jsaction` attribute appears in server HTML only on inputs where the consumer or another directive declared a listener (a `(change)` handler, a Reactive Forms accessor, `nfsAbideInput`); no Switch directive causes one.

### Animation

Foundation's `$switch-paddle-transition` (`all 0.25s ease-out`) slides the knob and fades the track colour on every change of state; the library keeps it. The slide is motion, so `nfs-switch` sets `transition-duration: 1ms` on `.switch-paddle` and its `::after` under `@media (prefers-reduced-motion: reduce)`, the rule the [Spec: Off-canvas](../issues/25-spec-off-canvas.md) applies to Foundation's own transitions (measured in three engines: 50 ms after a press the knob is mid-slide without the preference and at rest in its new place with it). No State class waits on the transition, no Completion output exists, and no `animate.enter` or `animate.leave` is used. Because the transition covers `all`, the focus ring's width, colour, and offset also ease in over 0.25 s, from the paddle's resting outline values; the ring is fully drawn once the transition ends and stays for as long as focus does.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server output and first paint: every Switch class is a static host class or the size record, and the inner labels' `aria-hidden` is static, so the server HTML carries all of them and Foundation's CSS draws the first paint (rule 1). The name, `for`, `id`, `type`, `role`, `checked`, and `disabled` are consumer-written static attributes or the consumer's bindings, identical on both platforms.
- Before hydration: the directives touch no DOM outside host bindings, read no `window`, measure nothing, and start no timer (rules 3 to 5). A dehydrated switch is a working native control: a press on the track or the label toggles it, Space toggles it, and a form submits its value.
- Full hydration: host binding values equal the server's, so hydration changes no class; the directives are hydration-clean by construction and never need `ngSkipHydration`.
- A switch toggled before hydration: the directives bind nothing on `checked`, so hydration leaves the user's choice alone unless something else binds it. A Reactive or template-driven Forms accessor, `[formField]`, or a `[checked]` binding writes its model value into the reused input at hydration and undoes the choice (the Abide prototype's result for checkboxes), and a replayed `change` handler then reads the undone state. A validated switch keeps the choice through `nfsAbideInput`'s value rescue; elsewhere the docs note the limit, as the Forms spec does for native controls, and a `(change)` handler without a `[checked]` binding reads the kept state when its event replays.
- Incremental hydration: the directives register with nothing, so they need no Hydration boundary of their own; a validated form keeps the form and its fields in one boundary, which is Abide's rule.
- Event replay: no Switch directive declares a listener, so none adds `jsaction` or has anything replayed; a consumer's `(change)` on the input replays like any other.
- `@defer`: library templates contain none. Inside a dehydrated block, or inside `@defer (hydrate never)`, a switch is its server HTML and keeps working as a native checkbox or radio with Foundation's look: it toggles, shows focus through the `nfs-switch` ring, and submits with a native form.
- Prerendering: identical to server rendering; nothing reads request tokens (rule 11).
- Zoneless and OnPush: the only state is one input signal read by a host binding.

## Testing Decisions

A good test asserts what a user or assistive technology observes: roles, names, checked states, the classes, the paddle's box, computed colours where this spec names a ratio, and pixels where the platform draws them. No test reads a directive's fields. Prior art: the layer tables of the [Spec: Forms](../issues/98-spec-forms.md) and [Spec: Close Button](../issues/83-spec-close-button.md), the [Spec: Progress Bar](../issues/95-spec-progress-bar.md)'s computed-contrast story, the Slider's forced-colours e2e case, and the rendering-mode test seam.

Story ids, in Foundation's docs order and then the library scenarios: `switch--default`, `switch--disabled`, `switch--radio`, `switch--sizes`, `switch--inner-labels`, `switch--switch-role`, `switch--labelled-by`, `switch--forms`, `switch--focus`, `switch--contrast`. The stories file sets `id: 'switch'`, `title: 'CSS-only components/Switch'`, and `component: NfsSwitch`; `size` is an arg. Every story names each switch with a visible label, and no story element carries a Foundation class written in the story. The Storybook settings overrides carry this spec's two required lines (Sass subsection), and the preview stylesheet includes `nfs-switch` after `foundation-everything`. No Anti-pattern story: Foundation's hidden-text pattern passes axe, so there is no rule to switch off.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Run by `npx nx test-storybook <lib>`. Every story runs axe with `parameters.a11y.test = 'error'` on the six tags (which include `label`, `aria-allowed-role`, `color-contrast`, and `target-size`); no story silences a rule. Every play function asserts that each paddle's bounding box is at least 24 by 24 px.

- `switch--default`: Foundation's Basics example with a visible label. `getByRole('checkbox', {name: 'Download kittens'})` is not checked; a click on the paddle checks it; a click on the visible label unchecks it; after `userEvent.tab()` onto it, Space checks it; the input carries `.switch-input` and the paddle `.switch-paddle`; the name is exactly "Download kittens".
- `switch--disabled`: Foundation's two disabled switches, checked and not. Each is disabled and keeps its state after a click on its paddle.
- `switch--radio`: three radio switches in a `fieldset` named "Choose your starter". `getByRole('group', {name})` holds three radios; the first is checked; ArrowDown from it checks the second; a click on the third's paddle checks it and unchecks the others.
- `switch--sizes`: no `size`, `tiny`, `small`, and `large`. Each container carries only its size class; the paddle heights are 32, 24, 28, and 40 px and the widths twice that at the 16 px root; toggling the `size` arg moves the class.
- `switch--inner-labels`: Foundation's Inner Labels example with a visible label. The name is exactly "Do you like me?" in both states; "No" is shown and "Yes" hidden while off, the other way round when on; both carry `aria-hidden="true"`; from computed styles, the shown word's colour against its track's background is at least 4.5:1, off and on (axe marks the pair incomplete).
- `switch--switch-role`: a notifications switch with `role="switch"`. `getByRole('switch', {name: 'Email notifications'})` is not checked; Space turns it on (`toBeChecked()`); no `aria-checked` attribute exists.
- `switch--labelled-by`: a settings row whose text names the switch through `aria-labelledby`. The switch is found by that text; its paddle has no text.
- `switch--forms`: a Reactive Forms `FormControl<boolean>` on one switch and a Signal Forms field on another. A click on each paddle sets its model to `true`, shown in the story's output; `setValue(false)` on the first unchecks it.
- `switch--focus`: after `userEvent.tab()` onto an off switch, and again onto an on one, the paddle's computed `outline-style` is `solid`, its outline colour at least 3:1 against the page, and its `outline-offset` Foundation's `$switch-paddle-offset`, once the 0.25 s transition has ended; a click on another switch's paddle leaves that paddle's outline at `none`.
- `switch--contrast`: from computed styles, floored to two decimals: each track colour (off, on, focused off, focused on) against the page and the knob's `::after` background against each track, at least 3:1.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

Vitest browser mode under the Angular unit-test builder (Chromium headless): TestBed specs in `<name>.spec.ts` next to each directive, over a bare test host component, zoneless with `await fixture.whenStable()`, asserting DOM state; no story is mounted and no axe runs here.

- Host bindings: each of the five directives adds exactly its class; the inner-label directives add `aria-hidden="true"`; a class the host component adds for its own styling is kept; `size` sets exactly its class, switching the value moves it, and clearing it removes it; a copied static `small` is stripped while `size` is unset or `large`.
- Forms: `formControlName` with a static `type="checkbox"` gets the checkbox accessor and a boolean value on toggle; `[formField]` on a checkbox and on a radio group updates its field; `nfsAbideInput` beside `nfsSwitchInput` compiles in either attribute order and binds its classes independently.
- Zoneless: the suite runs with zoneless change detection; no test needs `NgZone`.

### 3. Node-level Vitest

- SSR smoke, in `<name>.ssr.spec.ts` through the shared `renderServer()` helper under `npx nx test <lib>`: a fixture with each Rendered HTML example and a copied `class="switch small"` resolves `whenStable()`; the server HTML carries `.switch`, the size classes, `.switch-input`, `.switch-paddle`, `.switch-active`, and `.switch-inactive` on the right elements, `aria-hidden="true"` on both inner labels, the consumer's `type`, `role`, `id`, `for`, `checked`, and `disabled`, and no copied `small` on the stripped container; no Switch host that carries no listener from the consumer or another directive has a `jsaction` attribute.
- Sass compile, over Foundation 6.9.0's settings file with `@import 'ngx-foundation-sites';` and the two required lines: `@include nfs-switch;` emits exactly the focus ring rule, the forced-colours block, and the reduced-motion block of the Sass subsection, with `outline: 1px solid #8a8a8a` from Foundation's default `$input-border-focus` and `1px solid #0a0a0a` under the Forms spec's `$input-border-focus: 1px solid $black`, and no copy of a Foundation rule and no Variant property.
- Pure logic: none worth isolating; the size record is covered through the DOM in layer 2.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build:

- Focus ring in three engines (2.4.7): in `switch--focus`, after a real Tab in Chromium and Firefox and `focus()` in WebKit (whose Tab reach of form controls depends on a platform keyboard preference), the darkest pixel a few px beyond the track's end is the ring colour, with the page colour between the track and the ring; after a pointer press it is the page colour.
- Forced colours (Chromium and Firefox; not run in WebKit, which matches the query under emulation but forces no colour, and Safari has no forced-colours mode): in `switch--default`, `switch--inner-labels`, and `switch--disabled`, the off knob and the track edge differ from Canvas, the on track differs from Canvas and from its knob, the shown inner-label word differs from its track, a disabled switch's knob is visible, and after a Tab the ring pixel differs from Canvas while the focused off switch's knob and the focused on switch's track keep the pixels they have at rest. Each read waits until the paddle's transition (`$switch-paddle-transition`, 0.25 s on Foundation's defaults) has finished, or the test emulates `reducedMotion: 'reduce'`, under which rule (c) shortens it to 1 ms.
- Reduced motion in three engines: with `reducedMotion: 'reduce'`, 50 ms after a press on `switch--default`'s paddle the knob is at its end position; without it, mid-slide.
- Text spacing in three engines: with line height 1.5, letter spacing 0.12em, and word spacing 0.16em on every element, each shown word in `switch--inner-labels` at every size lies inside its track and does not overlap the knob.
- Pointer in three engines: a press on the paddle toggles the input in `switch--default` and `switch--radio`.

Against the prerendered fixture app, route `/switch`:

- JavaScript disabled: screenshot plus axe (`@axe-core/playwright` with `withTags` on the six tags) of the server HTML; a press on a paddle toggles its switch and Tab then Space toggles another, with no script.
- Hydration: no NG05xx in the console and `ngDevMode.componentsSkippedHydration === 0`.
- `@defer (hydrate never)` variant: the switches toggle, show the focus ring, and a native form submits `name=on` for a checked switch.

Manual release test (ADR 0022, as the Slider's and the Progress Bar's): with NVDA on Firefox and Chrome, JAWS on Chrome, and VoiceOver on Safari (macOS and iOS), `switch--default`, `switch--switch-role`, `switch--radio`, and `switch--inner-labels` announce each switch once with its visible label, role, and state ("switch, on" for `role="switch"`), never read the inner-label words, announce the radio group's legend, and, for VoiceOver, name a switch from its first label where a paddle label follows (the one engine whose tree this ticket could not read).

## Out of Scope

- A switch component, or Material's `<button role="switch">` form: Foundation's markup carries every element, and forms directives must sit on the consumer's native input (D1). `superseded`
- A `checked` model, a `change` output, or a value accessor on the directives: the native property and event, and Angular Forms' own accessors, own the value (D8). `scope-boundary`
- A `type` input or default on `nfsSwitchInput`: Angular Forms selects its accessors by the static attribute (D2). `other`
- A default `role="switch"`, or a role input: the consumer picks the role by meaning, and the attribute is native (D3). `platform-or-a11y`
- An indeterminate or mixed state: the APG switch has none and Foundation draws none. `platform-or-a11y`
- `disabledInteractive` and `aria-disabled` switches: Foundation draws only the native `:disabled` state, and a focusable disabled checkbox still toggles on Space. `platform-or-a11y`
- A rule that a radio group's name is visible: usage rule 5 asks for the group relationship (1.3.1); whether the question must also be seen depends on what the page around the group already says, which the library cannot judge, and every example writes a visible `legend` (Notes). `scope-boundary`
- Generated ids or an automatic `for` on the paddle: the visible label needs the consumer's id anyway, and generated ids differ between server and client (D15). `other`
- A value rescue for switches toggled before hydration outside Abide: value adoption belongs to the forms layer, as the Forms spec decided for native controls (D14). `scope-boundary`
- Fine-tuning the inner labels' positions, which Foundation's docs suggest for longer words: the consumer's own class on the inner-label element, never a Foundation class in its CSS. `scope-boundary`
- Contrast against a background other than `$body-background` (a switch inside a callout or a Top Bar): Foundation places no switch in a container of its own; the container's spec or the consumer's theme covers it. `scope-boundary`
- `.show-for-sr`: a normal class the consumer writes, with Foundation's global styles loaded, because the Visibility Classes have no first-milestone spec; the library's switch markup needs none, because a visible label replaces Foundation's hidden paddle text, which alone gives sighted users no label and beside a visible label repeats it in the name (D4, measured); usage rule 2 leaves the paddle without text. `scope-boundary`
- The validation look: `.is-invalid-input`, `.is-invalid-label`, and the Form error belong to the [Spec: Abide](../issues/31-spec-abide.md). `scope-boundary`
- Runtime theming through custom properties (building-blocks 1.13). `other`

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | Five attribute directives in `ngx-foundation-sites/switch`, one per Structural class: `[nfsSwitch]`, `input[nfsSwitchInput]`, `label[nfsSwitchPaddle]`, `[nfsSwitchActive]`, `[nfsSwitchInactive]` | ADR 0001 and ADR 0039; Foundation generates nothing; the input must be the consumer's own element for `formControlName`, `ngModel`, and `[formField]` to match it; names from the classes (building-blocks 1.3) | A switch component rendering input, paddle, and label (Material's shape; it would need its own value accessor and would not be the consumer's input) (`superseded`); one container directive that sets the children's classes by DOM lookup (ADR 0039's one directive per Structural class) (`superseded`) |
| D2 | No `type` input: the consumer writes `type="checkbox"` or `type="radio"` as a static attribute (usage rule 3) | Reactive and template-driven Forms select their checkbox and radio accessors by the static `type` attribute; a host-bound `type` would give `formControlName` the text accessor; Foundation's docs always write it | A `type` input defaulting to `checkbox`, as `nfsButton` and `nfsCloseButton` default `button` (breaks accessor selection) (`other`); `input[type=checkbox][nfsSwitchInput]` selectors (a missing `type` would drop the class silently) (`other`) |
| D3 | No default role; the consumer writes `role="switch"` on a checkbox that turns a setting on or off; never on a radio (usage rule 4) | The APG asks for the role that matches the meaning, and a form choice or a yes-or-no answer reads better as a checkbox; Foundation's markup is a checkbox; ARIA in HTML allows `switch` on a checkbox and not on a radio (axe `aria-allowed-role`, measured); the triage's accessibility lens | `role="switch"` by default, as Material does (announces yes-or-no questions and form choices as on/off, changes Foundation's semantics) (`platform-or-a11y`); a boolean `switchRole` input (a second spelling of a native attribute) (`other`) |
| D4 | A visible label names the switch: a `<label for>` before it, or `aria-labelledby` to visible text; the paddle holds no text | 3.3.2 needs a visible label; every label of a control joins its name, so hidden paddle text beside a visible label repeats it (measured in Chromium and Firefox); the first label holds the whole name, which is what axe's `form-field-multiple-labels` review note asks | Foundation's `.show-for-sr` text in the paddle (no visible label; doubles a visible one) (`platform-or-a11y`); `aria-hidden` on the paddle to drop its text from the name (silently erases a name the consumer wrote) (`platform-or-a11y`); a label wrapping the switch (a label cannot hold the paddle label, and `.switch` sets white text) (`platform-or-a11y`) |
| D5 | The name is a usage rule on the input, stated in its JSDoc and followed by every example: a visible `<label for>` or `aria-labelledby` to visible text, and no text in the paddle (usage rules 1 and 2) | axe passes Foundation's hidden-text pattern, so Foundation's examples copy unlabelled unless the docs say otherwise; the name must be in server HTML, where the dehydrated switch is read | A required label input (rules out `aria-labelledby` and labels written in the template) (`other`) |
| D6 | `NfsSwitchActive` and `NfsSwitchInactive` bind `aria-hidden="true"` statically | The shown word would join the name and change it with the state (measured), which the APG forbids; the knob's position and the input's state already carry it | Leaving `aria-hidden` to the consumer, as Foundation's docs do (forgotten, the name changes with the state) (`platform-or-a11y`) |
| D7 | `size` is a closed union `NfsSwitchSize`, `'tiny' \| 'small' \| 'large'`, default unset; the size classes live in one `computed` record that strips copied ones | ADR 0040 and building-blocks 1.4 rule 3 (`size` for Switch sizes); Foundation's Sass writes the three names itself; a custom size is the consumer's own class built with Foundation's `switch-size()` mixin | A Variant registry and property (no Sass setting lists the names) (`other`); consumer-written size classes (ADR 0039) (`superseded`) |
| D8 | No models, outputs, methods, tokens, providers, or listeners | Foundation's docs: read the input's `checked`; the cascade does the parent's work; host bindings render on the server | A `checked` model with a `change` output (a second source for the value Angular Forms and the platform own) (`scope-boundary`); a parent token for the paddle and inner labels (nothing to share) (`other`) |
| D9 | `nfs-switch` draws `outline: $input-border-focus; outline-offset: $switch-paddle-offset` around a focused switch's track | The input's own ring is invisible; Foundation's darker track is 1.239:1 and 1.295:1 from rest (1.4.1, 2.4.7); a ring is a shape, survives forced colours as `CanvasText` (measured), and sits on the page, where its colour is held to 3:1 against `$body-background`; `$input-border-focus` is Foundation's focus colour for form controls, which the Forms spec already requires as `$black`, and `$switch-paddle-offset` is Foundation's own switch spacing, so no value is the library's | Required focus tracks at least 3:1 from the resting ones (the Forms spec's 1.4.1 rule; here only near-black tracks pass, and they vanish under forced colours) (`platform-or-a11y`); a library colour such as `2px solid $black`, which no dark theme can change (the Slider's first ring, aligned on `$input-border-focus` by the [Consistency review: the class-rule wave](../issues/133-consistency-review-class-rule-wave.md)) (`other`); `outline: auto` in the browser's style (its colour is the browser's, which no setting can hold to 3:1) (`platform-or-a11y`) |
| D10 | Required: `$switch-background: #767676;` and `$switch-background-focus: scale-color($switch-background, $lightness: -10%);` | 4.503:1 for the track against the page and the knob and for inactive inner-label text, so every Foundation example passes; the second line repeats Foundation's expression because its settings file computes the focus track from the old colour (2.015:1, measured); `#767676` is the value the Callout spec requires of `$closebutton-color` | `$dark-gray` (3.422:1: passes the graphic pairs, fails inner-label text; allowed where no inner label shows) (`platform-or-a11y`); a dark knob on Foundation's light track (the track, against which the knob's position shows the state, stays 1.625:1 against the page) (`platform-or-a11y`) |
| D11 | The Sass subsection lists, as documented usage, every track and knob pair and the ring colour at 3:1, every height at 24 px, and inner-label text at 4.5:1 wherever inner labels show; the spec's ratios come from the exact WCAG formula, unrounded | ADR 0022 and building-blocks 1.10; axe has no 1.4.11 rule and marks inner-label text incomplete, so the stories assert the ratios from computed styles; inner labels are optional; heights are rem settings the consumer can lower | Foundation's `color-luminance()` or `color-contrast()` for the figures (false passes: 2.937:1 exact against 3.01:1) (`platform-or-a11y`) |
| D12 | A forced-colours rule: `CanvasText` edge and off knob, `Highlight` on track with `HighlightText` knob and text, `GrayText` when disabled | Foundation draws the switch with backgrounds only, which forced colours replace with Canvas, so it disappears (measured in Chromium and Firefox); the Slider's rule 13 applies the same system colours. Every selector through which Foundation colours the track or the knob gets its system colour, the `:focus-visible` forms included (measured, 2026-09-29, [Consistency review: the class-rule wave](../issues/133-consistency-review-class-rule-wave.md); building-blocks 1.10, forced colours) | No rule (an invisible control in contrast themes) (`platform-or-a11y`); `forced-color-adjust: none` (overrides the user's theme; the Slider's D20 reason) (`platform-or-a11y`) |
| D13 | A reduced-motion rule: `transition-duration: 1ms` on the paddle and its knob | Foundation's transition slides the knob and has no reduced-motion rule; the Off-canvas spec's rule for Foundation's transitions | Leaving the slide (motion the user asked to avoid) (`platform-or-a11y`); `transition: none` (fires no `transitionend`, which building-blocks 1.6 rule 5 keeps firing under reduced motion) (`other`) |
| D14 | No value rescue in `nfsSwitchInput`; a validated switch uses `nfsAbideInput`'s | The forms layer owns the value; the Forms spec leaves native controls to the platform; Abide's rescue already covers checkbox and radio hosts | Copying Abide's rescue into the switch input (a second rescue on the same host, and only for switches among checkboxes) (`scope-boundary`) |
| D15 | The consumer writes `id` and the paddle's `for` (usage rule 6) | The visible label needs the id too; Foundation's docs prescribe the pair; static ids are identical on server and client | A generated id bound on input and paddle (the visible label would still need it; generated ids differ between server and client) (`other`) |
| D16 | Radio switches sit in a `fieldset` with a `legend` in every example, and usage rule 5, in `nfsSwitchInput`'s JSDoc, asks for a named group around every group of radio switches: a `fieldset`, or an element with the `group` or `radiogroup` role, named in accessible-name order and holding every radio of HTML's radio button group | The APG Switch grouping rule and the Forms spec's radio groups; Foundation's radio switches sit in no group (1.3.1), and ADR 0039 gives the directive's docs the markup Foundation's lacks; axe has no rule, and `input[nfsSwitchInput]` is the one directive on every radio switch, so its docs carry the rule (P23); the rule's forms match what Chromium's and Firefox's trees expose on the 24 grouping patterns measured, an image-only legend included (building-blocks 1.10, Names), and leave out two legends that only Firefox names (measured, ARIA and keyboard) | A named `form` or `section` counted as the group (both engines expose a landmark, not a group, measured; WCAG's techniques H71 and ARIA17 group with a `fieldset` or a group role) (`platform-or-a11y`); a name from the legend alone (leaves out fieldsets that both engines name by `aria-label`, `aria-labelledby`, or `title`, measured) (`platform-or-a11y`) |
| D17 | Native implementation level; no Aria, no CDK; listener-free | The platform covers role, state, keys, labels, and forms; Aria has no checkbox or switch pattern; `:focus-visible` decides the ring | CDK `FocusMonitor` for the ring (the browser's heuristic already does it) (`other`) |
| D18 | Three glossary terms: **Switch**, **Switch paddle**, **Inner label** | Foundation's Sass calls the knob "the paddle itself" while its class names the whole label; the spec needs one name for the label that draws track and knob | Foundation's bare "paddle" (ambiguous between the label and its knob) (`other`) |

### Usage examples

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NfsSwitch, NfsSwitchInput, NfsSwitchPaddle } from 'ngx-foundation-sites/switch';

@Component({
  selector: 'app-caption-settings',
  imports: [ReactiveFormsModule, NfsSwitch, NfsSwitchInput, NfsSwitchPaddle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label for="captions">Show captions</label>
    <div nfsSwitch>
      <input nfsSwitchInput type="checkbox" role="switch" id="captions" [formControl]="captions">
      <label nfsSwitchPaddle for="captions"></label>
    </div>
  `,
})
export class CaptionSettings {
  protected readonly captions = new FormControl(false, { nonNullable: true });
}
```

A yes-or-no question in a form submitted later, a checkbox with inner labels:

```html
<label for="newsletter">Send me the newsletter</label>
<div nfsSwitch size="large">
  <input nfsSwitchInput type="checkbox" id="newsletter" name="newsletter" aria-describedby="newsletter-help">
  <label nfsSwitchPaddle for="newsletter">
    <span nfsSwitchActive>Yes</span>
    <span nfsSwitchInactive>No</span>
  </label>
</div>
<p nfsHelpText id="newsletter-help">One email a month; unsubscribe at any time.</p>
```

A validated switch (the Abide directives as the [Spec: Abide](../issues/31-spec-abide.md) defines them):

```html
<label for="terms" [nfsAbideLabel]="terms">I accept the terms (required)</label>
<div nfsSwitch>
  <input nfsSwitchInput nfsAbideInput #terms="nfsAbideInput" type="checkbox" id="terms" [formField]="f.terms">
  <label nfsSwitchPaddle for="terms"></label>
</div>
<span [nfsFormError]="terms" formErrorOn="required">Accept the terms to continue.</span>
```

A settings list whose rows name their switches:

```html
<ul class="settings">
  @for (s of settings; track s.id) {
    <li>
      <span [id]="s.id + '-label'">{{ s.label }}</span>
      <div nfsSwitch size="small">
        <input nfsSwitchInput type="checkbox" role="switch" [id]="s.id" [attr.aria-labelledby]="s.id + '-label'"
               [checked]="s.on()" (change)="s.on.set($any($event.target).checked)">
        <label nfsSwitchPaddle [for]="s.id"></label>
      </div>
    </li>
  }
</ul>
```

The `settings` class is the consumer's own, for its own layout. `nfsHelpText` belongs to the [Spec: Forms](../issues/98-spec-forms.md).

### Platform features to adopt when the browser target moves

- `<input type="checkbox" switch>`, the native switch control Safari 17.4 introduced: out of target, because the other engines of the Browser target lack it. Once it is in target, the attribute would give the platform's own switch semantics and drawing, and the spec would weigh it against Foundation's look.
- `:has()` (out of target): `.switch:has(.switch-input:focus-visible)` could draw one ring around the switch and its visible label, as the APG checkbox-switch example does.

### Foundation behaviour changed or dropped

- The name: a visible label replaces the `.show-for-sr` text inside the paddle, and the paddle holds no text.
- Focus: a ring around the track joins Foundation's darker track.
- The off track: `$switch-background` becomes `#767676` under the required settings, and the switch is drawn in system colours under forced colours.
- Reduced motion: the knob moves without its slide.
- Radio switches sit in a named `fieldset` in every example, as usage rule 5 asks.
- `aria-hidden="true"` on inner labels: bound by their directives, never forgotten.
- `disable-mouse-outline` never matches, because the library never loads what-input; the browser's `:focus-visible` heuristic decides when the ring shows.

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This component relies on Foundation's Export mixin `foundation-switch` (part of `foundation-everything`), configured through the `$switch-*` settings. Its documented custom CSS is the `nfs-switch` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-switch`.

1. Rules the mixin emits, each with its reason:
   - (a) `.switch-input:focus-visible ~ .switch-paddle { outline: $input-border-focus; outline-offset: $switch-paddle-offset; }`. Reason: WCAG 2.4.7 and 1.4.1; Foundation hides the input with `opacity: 0`, which hides its focus ring, and marks focus only by a darker track (D9). The selector follows Foundation's own `input:focus-visible ~ &`.
   - (b) `@media (forced-colors: active)`: `.switch-paddle { border: 1px solid CanvasText; }`, `.switch-paddle::after, .switch-input:focus-visible ~ .switch-paddle::after { background: CanvasText; }`, `.switch-input:checked ~ .switch-paddle, .switch-input:checked:focus-visible ~ .switch-paddle { background: Highlight; color: HighlightText; }`, `.switch-input:checked ~ .switch-paddle::after { background: HighlightText; }` (after the knob rule: equal specificity, so order decides), `.switch-input:disabled ~ .switch-paddle { border-color: GrayText; background: Canvas; color: GrayText; }`, `.switch-input:disabled ~ .switch-paddle::after { background: GrayText; }`. Reason: WCAG 1.4.11 in every colour mode; forced colours replace every background with Canvas, and Foundation draws the track and the knob with backgrounds only (D12). The 1 px border moves the knob 1 px inside the track in that mode only. The focus ring needs no line here: the browser forces its colour to `CanvasText` (measured). Each state selector also names Foundation's more specific focus form (`input:focus-visible ~ .switch-paddle::after`, 0,2,2; `input:checked:focus-visible ~ .switch-paddle`, 0,3,1), because Foundation's author colour would otherwise win there and the browser forces it to Canvas: measured in Chromium and Firefox, a keyboard-focused off switch lost its knob and a focused on switch its `Highlight` track.
   - (c) `@media (prefers-reduced-motion: reduce) { .switch-paddle, .switch-paddle::after { transition-duration: 1ms; } }`. Reason: `$switch-paddle-transition` slides the knob, and Foundation has no reduced-motion rule (D13).
2. Reused, read from the consumer's compile: `$input-border-focus` and `$switch-paddle-offset`. No Foundation value is copied. The mixin takes no parameters.
3. Custom properties the directives write: none.
4. Motion classes: none; (c) is the `prefers-reduced-motion` override for Foundation's own transition.
5. Missing include: a focused switch shows only Foundation's 1.239:1 darker track, the switch disappears under forced colours, and the knob slides under reduced motion. The `switch--focus` play function and the forced-colours e2e catch it in the library's own CI.
6. Variant properties: none. `NfsSwitchSize` is a Closed Variant family.

Required settings on Foundation's defaults, declared before `@import 'foundation'` (Foundation's component settings are `!default`) or, in a copy of Foundation's settings file, in place of its two switch lines; the Storybook settings overrides mirror them:

```scss
$switch-background: #767676;
$switch-background-focus: scale-color($switch-background, $lightness: -10%);
```

The second line is Foundation's own default expression. It must be repeated when the override follows an import of Foundation's settings file, as the Storybook preview's does: that file assigns `$switch-background-focus` from `$medium-gray` before the override, which leaves the focused off track at 2.015:1 (measured). A consumer who never shows inner labels may set `$switch-background: $dark-gray` (3.422:1) instead, which meets the 3:1 pairs and not the 4.5:1 of inner-label text. `$switch-background-active` (`$primary-color`, 4.647:1) and the default `$input-border-focus` (3.422:1) pass and need nothing; the Forms spec's required `$input-border-focus: 1px solid $black` turns the ring black.

Documented usage for any other theme (ratios by the exact WCAG relative-luminance formula, unrounded, a translucent colour composited over `$body-background` first; never Foundation's `color-luminance()` or `color-contrast()`, which pass pairs the formula fails):

- `$switch-background`, `$switch-background-focus`, `$switch-background-active`, and `$switch-background-active-focus` each at 3:1 or better against `$body-background`, and `$switch-paddle-background` at 3:1 or better against each of them (1.4.11).
- The colour of `$input-border-focus` (the colour part of Foundation's border shorthand) at 3:1 or better against `$body-background` (2.4.7, 1.4.11).
- `$switch-height-tiny`, `$switch-height-small`, `$switch-height`, and `$switch-height-large` at 24 px or more, a rem value taken at the consumer's `$global-font-size` (2.5.8).
- Where inner labels show, `$white` inner-label text at 4.5:1 or better on `$switch-background` and `$switch-background-focus` (the inactive word) and on `$switch-background-active` and `$switch-background-active-focus` (the active word) (1.4.3).

### Notes

- Right to left: Foundation places the knob with `$global-left`, a compile-time setting that follows `$global-text-direction`; a right-to-left application compiles with `$global-text-direction: rtl`, as Foundation's docs say for every component. The ring and the forced-colours rule do not depend on direction.
- Custom sizes: a consumer who needs a size Foundation does not name writes a class of its own with Foundation's `switch-size()` mixin and puts it on the `nfsSwitch` host, at least 24 px tall, as the four settings are (2.5.8).
- The switch sits in normal flow as a block of its own height; its visible label, a block `label` above it, is the layout the examples use. Side-by-side layouts come from Foundation's XY Grid classes, which the consumer writes as normal classes (`class="grid-x"`, `class="cell"`) with Foundation's global styles loaded.
- A pointer press focuses the input without `:focus-visible` in Chromium and Firefox and leaves focus where it was in WebKit (measured), so no ring shows after a click in any engine.
- Usage rules 1, 2, and 5 count text as accessible-name computation does, an image's non-blank `alt` included (building-blocks 1.10, Names): a label or legend that holds only an image with alt text names its switch or group (Chromium and Firefox name the group from the `alt`, measured), and an image with alt text in the paddle joins the name, which rule 2 keeps out. Every example still writes text, which also serves the sighted user the visible label is for.
- Usage rule 5 accepts a group named only for assistive technology (`aria-label`), because it asks for the group relationship (1.3.1), not a visible name. Every example writes a visible `legend`, which is the APG grouping rule's case ("a logical group with a visible label").
