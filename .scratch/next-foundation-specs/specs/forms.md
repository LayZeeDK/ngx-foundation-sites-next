# Spec: Forms

Ticket: [Spec: Forms](../issues/98-spec-forms.md). Decision records: [ADR 0039](../adr/0039-directives-manage-every-foundation-class.md) (the class rule), [ADR 0040](../adr/0040-variant-input-types.md) (Variant input types), ADR 0001 (directive-first), ADR 0012 (Sass packaging), ADR 0022 (WCAG 2.2 AA enforcement), and ADR 0008 (Rendering modes). Nearest precedents: [Spec: Button](../issues/37-spec-button.md) and [Spec: Abide](../issues/31-spec-abide.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass.

## Problem Statement

Foundation for Sites' Forms page is a styling contract with no Plugin: native text inputs, text areas, select menus, checkboxes, radios, and fieldsets styled by tag, plus a few classes for the parts native HTML lacks (`.input-group` and its three parts, `.help-text`, `.fieldset`, and the form label's `.middle` Variant). Under the library's class rule (ADR 0039) a developer writes no Foundation class, so every one of those classes needs a directive, and a developer needs to know which form elements need none.

The documented markup also leaves accessibility gaps that a developer inherits by copying it:

- Foundation's Input Group example has an unlabelled field: a `$` prefix and a submit button, and no label, which fails axe `label` (WCAG 1.3.1, 3.3.2, 4.1.2). Abide's own input group example labels its field with plain text that is not associated either.
- Help text works only when the author gives it an id and lists that id in the field's `aria-describedby`, and help text inside the label becomes part of the field's name.
- A label placed in another grid cell (the `.middle` layout) is linked by `for` and `id`; a mistyped id leaves the field unlabelled.
- Foundation's default placeholder colour and field border are 1.63:1 against the page (WCAG 1.4.3 and 1.4.11). The field border that fixes 1.4.11 (the Abide spec's required `$dark-gray`) is the same colour as Foundation's focus border, so a focused select menu, which has no text caret, then shows only a 1.63:1 glow as its focus indicator (1.4.11, 2.4.7).
- The File Upload Button recipe styles a label as a button and hides the real input with `.show-for-sr`, so keyboard focus lands on a clipped 1 px input with no visible indicator (2.4.7), and the chosen file name is hidden.

A server-rendered application adds the usual constraints: every class must already be in the server HTML, nothing may break hydration, and forms must keep working before hydration and inside `@defer (hydrate never)` blocks. Validated forms add one more: these directives must sit beside the Abide directives on the same elements without either set knowing about the other.

## Solution

Seven small attribute directives in one entry point, `ngx-foundation-sites/forms`, each a host binding and nothing more at run time:

- `[nfsInputGroup]`, `[nfsInputGroupLabel]`, `input[nfsInputGroupField]` (also `select` and `textarea`), and `[nfsInputGroupButton]` bind Foundation's four input group classes. The field has a real label: a wrapping or `for` label, an `aria-labelledby` that resolves, or a non-empty `aria-label`; a placeholder or the group's prefix is not one.
- `[nfsHelpText]` binds `.help-text`. The help text has an id, its field lists that id in `aria-describedby`, and it sits after the field's label, never inside it.
- `fieldset[nfsFieldset]` binds Foundation's opt-in `.fieldset` look.
- `label[nfsFormLabel]` carries the form label's one Variant, a boolean `middle` input that sets `.middle`. A `for` on it names the id of a real control.

The JSDoc of each directive states its rule, and every example follows it.

Text inputs, text areas, select menus, checkboxes, radios, file inputs, and bare `fieldset` and `legend` get no directive: Foundation styles them by tag, so there is no class to manage (ADR 0039). The spec documents them and their accessibility requirements.

The directives never bind validation state. `.is-invalid-input`, `.is-invalid-label`, `.form-error`, and `.is-visible` stay with the Abide directives, and a validated form puts both sets on the same elements: `nfsFormLabel` beside `nfsAbideLabel`, `nfsInputGroupField` beside `nfsAbideInput`, and help text ids in the `aria-describedby` that Abide's input composes. An unvalidated form imports nothing from Abide.

For WCAG 2.2 AA the spec requires three Foundation settings (placeholder colour, field border, focus border) and states the ratio every form setting must reach; Foundation's settings cover every case, so the entry point has no Library mixin. The file upload control is the native `<input type="file">` with its own label.

## User Stories

1. As an application developer, I want text inputs, number inputs, text areas, and select menus to look like Foundation's with no directive on them, so that native form controls stay plain HTML.
2. As an application developer, I want to wrap a control in its `<label>` or pair them with `for` and `id`, as Foundation's docs do, so that every field is named by its visible label.
3. As an application developer, I want radio and checkbox groups inside a `fieldset` with a `legend`, so that screen readers announce the group's question with each option.
4. As an application developer, I want `fieldset[nfsFieldset]` to give a group Foundation's bordered `.fieldset` look, so that I write no class.
5. As an application developer, I want a `fieldset` without the directive to stay unstyled, so that grouping for accessibility costs no visual change, as Foundation intends.
6. As an application developer, I want `nfsHelpText` on the element below a field to give it Foundation's help text look, so that hints look as Foundation documents.
7. As a screen reader user, I want a field's help text read as its description when I focus the field, so that I know what to enter.
8. As an application developer, I want the spec to state that help text has an id that its field lists in `aria-describedby`, so that a screen reader reads the hint with its field.
9. As an application developer, I want the spec to tell me to place help text after the label, not inside it, so that the hint does not become part of the field's name.
10. As an application developer, I want `nfsFormLabel` with `middle` to align a label with the field beside it, so that side-by-side layouts line up as in Foundation.
11. As an application developer, I want `middle` to accept the bare attribute, `"true"`, `"false"`, and a bound boolean, and a misspelt value to fail to compile, so that the input follows the library's typed Variant rules.
12. As an application developer, I want the spec to state that a label's `for` names the id of a real control, so that a label in another grid cell still names its field.
13. As an application developer, I want `nfsInputGroup` with `nfsInputGroupLabel`, `nfsInputGroupField`, and `nfsInputGroupButton` to build Foundation's input group, so that I attach units and buttons to a field without writing classes.
14. As an application developer, I want the input group to follow my `$global-flexbox` setting, so that Foundation's flexbox and table layouts both work.
15. As an application developer, I want every input group example to label its field, and the spec to say that a placeholder or a prefix is not a label, so that I do not copy Foundation's unlabelled example into my application.
16. As a screen reader user, I want an input group field named by a real label, not by its `$` prefix or its placeholder, so that I know what the field is for.
17. As an application developer, I want an `nfsButton` inside `nfsInputGroupButton` to keep Foundation's joined look and its own `type`, so that the group's button submits only when I say so.
18. As an application developer, I want the Forms directives to sit beside the Abide directives on the same elements, so that I add validation without changing the form's structure.
19. As an application developer, I want an unvalidated form to import nothing from Abide, so that plain forms stay small.
20. As an application developer, I want my help text id to stay first in a validated field's `aria-describedby`, before the visible errors, so that hints stay announced while errors show.
21. As an application developer, I want the Form error of an input group field placed after the group, so that Foundation's joined corners stay intact.
22. As a user with low vision, I want placeholder text to reach 4.5:1 against the field, so that I can read the example it gives.
23. As a user with low vision, I want every empty text field to have a boundary of at least 3:1 against the page, so that I can find the fields.
24. As a keyboard user, I want a focused select menu to show a focus indicator of at least 3:1 that differs from its resting border by more than hue, so that I see where focus is on a control with no text caret.
25. As a keyboard user, I want checkboxes, radios, and file inputs to keep the browser's own focus ring, so that focus on them is always visible.
26. As an application developer, I want the spec to list the form settings I must set and the ratio each form setting must reach, with its criterion, so that I never ship a failing default without knowing.
27. As a pointer and touch user, I want text fields and select menus at least 24 px tall, and checkboxes and radios clickable through their labels, so that targets are easy to hit.
28. As an application developer, I want the file field to be the native `<input type="file">` with its own label, so that it is keyboard operable with visible focus and shows the chosen file.
29. As an application developer, I want `select multiple` to keep native list box semantics, so that multi-selection works as the platform defines it.
30. As an application developer, I want Foundation's form settings (`$input-number-spinners`, `$global-flexbox`, colours, spacing) to stay Sass settings, so that compile-time configuration stays in Sass.
31. As a developer of a server-rendered application, I want the server HTML to carry every Forms class, so that the first paint is correct and hydration changes nothing.
32. As a developer of a server-rendered application, I want the Forms directives to declare no event listeners, so that nothing waits for hydration or event replay.
33. As a developer using `@defer (hydrate never)`, I want a form built with these directives to look and work as native HTML, so that static regions need no JavaScript.
34. As a developer of a zoneless application, I want the directives to need no zone, so that they work with zoneless change detection.
35. As an application developer, I want every Forms directive in one entry point, so that a `@defer` block can split them with the form.
36. As an application developer, I want label alignment and grid placement to come from Foundation's own text-alignment, float, and XY grid classes, written beside `nfsFormLabel` as normal classes, so that Forms does not repeat utility classes.
37. As a user who prefers reduced motion, I want form fields to add no motion, so that focusing a field moves nothing.
38. As a library maintainer, I want every behaviour asserted through roles, names, descriptions, classes, and computed styles in stories, browser-level tests, a server-render smoke test, and e2e, so that regressions surface at the layer that owns them.

## Implementation Decisions

### Foundation contract

Forms has no Plugin, no `defaults` object, no `data-*` Options, no events, and no methods; dropped options: none. Its contract is Foundation's Forms docs page and the `foundation-forms` Export mixin, whose parts are below. The page's Sass reference lists every forms partial except the error partial, which the Abide page documents.

| Feature | Element or class | Export mixin | Notes |
| --- | --- | --- | --- |
| Text inputs and text areas | the `text-inputs()` types (`text`, `password`, `date`, `datetime`, `datetime-local`, `month`, `week`, `email`, `number`, `search`, `tel`, `time`, `url`, `color`) and `textarea` | `foundation-form-text` | Styled by type; 39 px tall at a 16 px root; `:focus` removes the outline and sets `$input-border-focus` and `$input-shadow-focus`; `:disabled` and `[readonly]` get `$input-background-disabled`; `$input-number-spinners` hides number spin buttons; `textarea[rows]` gets `height: auto` |
| Select menus | `select`, `select[multiple]` | `foundation-form-select` | Styled by tag; `appearance: none` with a background triangle in `$select-triangle-color`; the same focus rule as text inputs; `[multiple]` drops the triangle |
| Checkboxes, radios, file inputs | `[type='checkbox']`, `[type='radio']`, `[type='file']`, with a sibling `+ label` or a wrapping `label` | `foundation-form-checkbox` | Margins and label spacing only; native appearance and focus ring; file inputs get `width: 100%` |
| Form labels | `label`; Variant `.middle` (`label.middle`) | `foundation-form-label` (`form-label`, `form-label-middle`) | `.middle` pads the label by half `$form-spacing` plus the field's border width so its text lines up with a field beside it |
| Help text | `.help-text` | `foundation-form-helptext` | Pulled up by half `$form-spacing`, italic, `$helptext-font-size` |
| Input group | `.input-group`, `.input-group-label`, `.input-group-field`, `.input-group-button` | `foundation-form-prepostfix` | `display: flex` under `$global-flexbox` (the 6.9 default), else `table`; first and last children get `$input-radius` corners; `a`, `input`, `button`, and `label` inside `.input-group-button` are sized to the field |
| Fieldset | `fieldset`, `legend` (reset); `.fieldset` | `foundation-form-fieldset` | A bare `fieldset` is unstyled "to encourage their use as an accessibility tool"; `.fieldset` adds `$fieldset-border`, padding, margin, and legend padding |
| Validation state | `.is-invalid-input`, `.is-invalid-label`, `.form-error`, `.is-visible` | `foundation-form-error` (inside `foundation-forms`) | Documented on the Abide page: [Spec: Abide](../issues/31-spec-abide.md) |
| Range, progress, meter | `input[type='range']`, `progress`, `meter` | `foundation-range-input`, `foundation-progress-element`, `foundation-meter-element` (not in `foundation-forms`) | Documented on the Slider and Progress Bar pages: [Spec: Slider](../issues/32-spec-slider.md), [Spec: Progress Bar](../issues/95-spec-progress-bar.md) |

The page's other sections use classes of other families. Label Positioning's `.text-right`, `.float-right`, and `.float-left`, every example's grid, and the File Upload Button's `.show-for-sr` are Foundation's text-alignment, float, XY grid, and visibility classes, families with no first-milestone spec, so a consumer writes them as normal classes with Foundation's global styles loaded (ADR 0039's exception). File Upload Button's `label.button` belongs to the [Spec: Button](../issues/37-spec-button.md), whose `nfsButton` takes no `label` host (its D11); Custom Controls' slider to the [Spec: Slider](../issues/32-spec-slider.md).

Docs conventions the spec keeps or corrects: wrapping labels and `for`/`id` pairs (kept); `fieldset` with `legend` for groups (kept); help text with a unique id and `aria-describedby` (kept, and required); the unlabelled Input Group example (corrected: its field gets a label in every example); the label-as-button file upload (replaced by the native file input, D12).

### CSS class to directive mapping

| Foundation class | Element | Angular | Kind | Notes |
| --- | --- | --- | --- | --- |
| `.input-group` | any, usually `div` | `NfsInputGroup`, `[nfsInputGroup]`, static host class | Structural | |
| `.input-group-label` | any, usually `span` | `NfsInputGroupLabel`, `[nfsInputGroupLabel]`, static host class | Structural | Text or an icon beside the field |
| `.input-group-field` | `input`, `select`, `textarea` | `NfsInputGroupField`, static host class | Structural | The field has a real label (D6) |
| `.input-group-button` | any, usually `div` | `NfsInputGroupButton`, `[nfsInputGroupButton]`, static host class | Structural | Wraps the button, which is an `nfsButton` |
| `.help-text` | any, usually `p` | `NfsHelpText`, `[nfsHelpText]`, static host class | Structural | Paired by id with its field, outside the label (D5) |
| `.fieldset` | `fieldset` | `NfsFieldset`, `fieldset[nfsFieldset]`, static host class | Structural | A bare `fieldset` needs no directive |
| `.middle` | `label` | `NfsFormLabel`, `label[nfsFormLabel]`, `[class.middle]` from the `middle` Variant input | Variant | See the Variant family row below |
| `.is-invalid-input`, `.is-invalid-label`, `.form-error`, `.is-visible` | fields, labels, messages | The Abide directives (`NfsAbideInput`, `NfsAbideLabel`, `NfsFormError`) | State and Structural | Never bound by a Forms directive (D4) |
| none | text inputs, `textarea`, `select`, checkboxes, radios, file inputs, bare `fieldset`, `legend` | No directive | Styled by tag or type | Documented here (ADR 0039) |
| `.button` | the input group's button; `label.button` in Foundation's File Upload Button | `NfsButton` (`button[nfsButton]`, `a[nfsButton]`, and the `input[type=submit\|button\|reset]` hosts), inside `nfsInputGroupButton`; no `label` host, so the File Upload Button recipe is not offered (D12) | Another family's (the Button) | [Spec: Button](../issues/37-spec-button.md), D11 |
| `.text-right` (and the other text alignments) | a label (Label Positioning) | No directive: a normal class written beside `nfsFormLabel` (`class="text-right"`) | Foundation's text-alignment classes, with no first-milestone spec | Foundation's global styles |
| `.float-right`, `.float-left` | a label (Label Positioning) | No directive: a normal class written beside `nfsFormLabel` (`class="float-right"`) | Foundation's float classes, with no first-milestone spec | Foundation's global styles |
| `.grid-container`, `.grid-x`, `.grid-padding-x`, `.cell`, the cell sizes (`.small-3`, `.medium-6`) | every example's grid | No directive: normal classes (`class="grid-x"`, `class="cell small-3"`) | Foundation's XY grid classes, with no first-milestone spec | Foundation's global styles |
| `.align-center` on the Label Positioning grid | the grid | No directive: a normal class beside `.grid-x` | Foundation's flex alignment classes, with no first-milestone spec | Foundation's global styles |
| `.show-for-sr` on the File Upload Button's input | the file input | Not used: the file control is the native input with its own label (D12) | Foundation's visibility classes, with no first-milestone spec | Foundation's global styles |
| `.slider`, `.slider-handle`, `.slider-fill` (Custom Controls) | the range control | `NfsSlider` (`[nfsSlider]`) and `NfsSliderFill`; the Handle, `NfsSliderHandle` on a native range input, replaces Foundation's `.slider-handle` span | Another family's (the Slider) | [Spec: Slider](../issues/32-spec-slider.md) |

Variant families (building-blocks 1.14 item 2):

| Family | Variant input | Type alias | Sass setting and Variant registry | Value shape | Class each value sets | Variant property |
| --- | --- | --- | --- | --- | --- | --- |
| Form label alignment | `NfsFormLabel.middle` | none: `boolean`, written through `NfsVariantBoolean` and `nfsVariantBoolean` | Closed (no setting; `label.middle` is fixed in `foundation-form-label`) | Boolean | `true`: `.middle`; `false` (default): none | None (closed family) |

No Open Variant family exists on this page, so the entry point declares no Variant registry and writes no Variant properties; it has no Library mixin (D11).

### Hierarchy and DI shape

```
label[nfsFormLabel]                               NfsFormLabel        middle
[nfsHelpText]                                     NfsHelpText         .help-text
fieldset[nfsFieldset]                             NfsFieldset         .fieldset
[nfsInputGroup]                                   NfsInputGroup       .input-group
  [nfsInputGroupLabel]                            NfsInputGroupLabel  .input-group-label
  input|select|textarea[nfsInputGroupField]       NfsInputGroupField  .input-group-field
  [nfsInputGroupButton]                           NfsInputGroupButton .input-group-button
    button[nfsButton] or a[nfsButton]             (Spec: Button)
```

- No injection tokens, no providers, no parent discovery, no host directives, and no Defaults token. The input group's rules are child and descendant selectors (`.input-group > :first-child`, `.input-group-button button`), so the cascade delivers what a parent token would; a part outside a group only looks unjoined. Forms has no Options for a Defaults token to hold, and a Defaults token never holds a Variant default (building-blocks 1.4).
- Injection: none; no directive injects anything.
- `NfsFormLabel` imports the shared `nfsVariantBoolean` transform and the `NfsVariantBoolean` type from the primary entry point `ngx-foundation-sites`, as every boolean Variant input does ([Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md) owns them).
- Entry point: `ngx-foundation-sites/forms` exports the seven directive classes. It imports nothing from `ngx-foundation-sites/abide`, and the Abide entry point imports nothing from it.
- Imports (documented usage): a component imports each Forms directive whose attribute its template writes, and, separately, the Abide directives it writes beside them. A forgotten one fails to compile only where the template binds `[middle]` (NG8002) or references the directive by its `exportAs` (NG8003). Otherwise the element renders without its directive, with no error and no class: a forgotten input group part leaves the group unjoined, a forgotten `NfsHelpText` leaves its hint in body text (its id and the field's `aria-describedby` still pair them), a forgotten `NfsFieldset` leaves the bare, unstyled `fieldset`, and a forgotten `NfsFormLabel` leaves a static `middle` label unaligned. A Forms directive and an Abide directive on one element are imported separately, so leaving one out leaves the other directive working.

### Beside the Abide directives

Validation is Abide's ([Spec: Abide](../issues/31-spec-abide.md), ADR 0006, ADR 0026). The two directive sets meet on four kinds of element, and on each they bind different classes and attributes, so neither needs to know the other and the order of the attributes does not matter.

| Element | Forms directive binds | Abide directive binds | Shared attribute |
| --- | --- | --- | --- |
| `label` | `NfsFormLabel`: `.middle` | `NfsAbideLabel`: `.is-invalid-label`; the field link (DI or reference); `nfsAbideLabelToken` | None |
| Input group field | `NfsInputGroupField`: `.input-group-field` | `NfsAbideInput`: `.is-invalid-input`, `aria-invalid`, `aria-describedby` (consumer ids first, then visible Form error ids) | None: the Forms directive reads and writes no ARIA |
| Help text | `NfsHelpText`: `.help-text` | None; its id reaches the field through the `aria-describedby` that `NfsAbideInput` takes through its alias and composes | The field's `aria-describedby`, written by the consumer and composed by Abide |
| `fieldset` | `NfsFieldset`: `.fieldset` | None; a group's Form error goes after the controls' labels, linked to one control | None |

- A validated label with `middle` carries both attributes: `<label for="amount" nfsFormLabel middle [nfsAbideLabel]="amount">`. `NfsAbideLabel` does not host `NfsFormLabel`: `middle` would be spelt through a different directive on validated and unvalidated labels.
- The Form error of an input group field goes after the `.input-group` element, linked by reference (`[nfsFormError]="amount"`, Foundation's `data-form-error-for` layout). Inside the group it would become the group's last child and take the field's joined corner.

### API per directive

```ts
/**
 * Foundation's form label. A `for` names the id of a labelable control (such as an `input`, `select`, or `textarea`), or the label
 * wraps its control; a mistyped id leaves the field unlabelled (WCAG 1.3.1, 3.3.2, 4.1.2).
 */
export class NfsFormLabel {
  /**
   * Foundation `label.middle` (`form-label-middle`): pads the label so its text lines up with a field beside it.
   * Closed Variant family; no Sass setting. Default `false` sets no class.
   */
  readonly middle: InputSignalWithTransform<boolean, NfsVariantBoolean>;
}
/**
 * Foundation `.help-text`. Give it an `id` and list that id in its field's `aria-describedby`, or screen readers do not
 * read it with the field (WCAG 1.3.1); place it after the field's label, never inside it, where it becomes part of the name.
 */
export class NfsHelpText {}
export class NfsFieldset {}
export class NfsInputGroup {}
export class NfsInputGroupLabel {}
/**
 * Foundation `.input-group-field`. The field needs a name source: a wrapping or `for` label, an `aria-labelledby` that
 * names visible text, or a non-empty `aria-label`; a placeholder, a `title`, and the group's prefix are not labels
 * (WCAG 1.3.1, 3.3.2, 4.1.2).
 */
export class NfsInputGroupField {}
export class NfsInputGroupButton {}
```

| Directive | Selector | Host bindings | Inputs | Usage rule (in its JSDoc) |
| --- | --- | --- | --- | --- |
| `NfsFormLabel` | `label[nfsFormLabel]` | `[class.middle]`: `middle()` | `middle`: `boolean` through `nfsVariantBoolean` (parameter `boolean \| '' \| 'true' \| 'false' \| null \| undefined`), default `false` | A `for` names the id of a labelable control, or the label wraps it (WCAG 1.3.1, 3.3.2, 4.1.2) |
| `NfsHelpText` | `[nfsHelpText]` | static `class`: `help-text` | none | Has an `id` that its field lists in `aria-describedby` (WCAG 1.3.1); sits after the field's label, never inside it |
| `NfsFieldset` | `fieldset[nfsFieldset]` | static `class`: `fieldset` | none | Has a `legend` (D10) |
| `NfsInputGroup` | `[nfsInputGroup]` | static `class`: `input-group` | none | none |
| `NfsInputGroupLabel` | `[nfsInputGroupLabel]` | static `class`: `input-group-label` | none | A unit, a symbol, or an icon (1.4.10) |
| `NfsInputGroupField` | `input[nfsInputGroupField], select[nfsInputGroupField], textarea[nfsInputGroupField]` | static `class`: `input-group-field` | none | Has a name source: a wrapping or `for` label, an `aria-labelledby` that resolves, or a non-empty `aria-label`; a placeholder, a `title`, and the group's prefix text do not count (WCAG 1.3.1, 3.3.2, 4.1.2) |
| `NfsInputGroupButton` | `[nfsInputGroupButton]` | static `class`: `input-group-button` | none | none |

- Static host classes merge with any class the consumer's own application adds; the consumer writes no Foundation class (ADR 0039).
- `middle` follows building-blocks 1.4: named with the camelCase of its class, a boolean through `nfsVariantBoolean` (never `booleanAttribute`, so `middle="flase"` fails to compile), declared with explicit type arguments, defaulting to `false`, which sets no class. Its JSDoc names the class template and says no Sass setting applies.
- Models, outputs, and methods: none. No directive owns state a consumer reads, and native events are the API. `exportAs`: `nfsFormLabel`, `nfsHelpText`, `nfsFieldset`, `nfsInputGroup`, `nfsInputGroupLabel`, `nfsInputGroupField`, `nfsInputGroupButton`, one per directive by its class name.
- No directive reads the DOM or runs a render callback (D14): each usage rule is the consumer's markup, stated in the JSDoc and followed by every example.

### Material comparison

| Concern | Material 22.2 (`mat-form-field`, `mat-label`, `mat-hint`, `matPrefix`, `matSuffix`, `matInput`) | Library |
| --- | --- | --- |
| Shape | A form-field component renders the label, outline, and subscript, and projects hints, prefixes, and suffixes | Directives on consumer-written Foundation markup; no component |
| Label | `mat-label` inside the form field, floating; the field links it | Native `<label>`, wrapping or with `for`; `nfsFormLabel` only for `middle` |
| Hint | `mat-hint` gets an id, and the form field writes the hint and error ids into the control's `aria-describedby` through `setDescribedByIds` | `nfsHelpText`; the consumer writes the id and the field's `aria-describedby`; Abide's input composes it with error ids |
| Prefix and suffix | `matPrefix`, `matSuffix`, `matTextPrefix`, `matTextSuffix` slots inside the form field | `nfsInputGroupLabel` and `nfsInputGroupButton` siblings of the field inside `nfsInputGroup` |
| Grouping | none | `fieldset` and `legend`; `fieldset[nfsFieldset]` for Foundation's look |
| Appearance | `appearance` input (`fill`, `outline`) | Foundation's Sass settings |
| Testing | `MatFormFieldHarness`, `MatInputHarness` | DOM-first assertions, no harness |

Borrowed: nothing structural; the shared idea is that a hint is the field's description, which Foundation's docs already require. Not borrowed: the form-field component, floating labels, and the automatic `aria-describedby` writing, which needs a component that owns the control's attribute (D5).

### Implementation level and primitives, with the fallback

Implementation level: native platform. Every behaviour on this page is HTML's: labels name controls, `fieldset` and `legend` name groups, `aria-describedby` describes a field, and every control's keyboard, focus, and form participation are native. `@angular/aria` has no form-field or input-group pattern in 22.2, and `@angular/cdk` has nothing these directives need. The Angular layer is static host classes and one host class binding over a signal input. No `computed`, `effect`, listener, timer, observer, or service; `injectAsync` is not used, because nothing loads after an interaction.

Fallback: none needed. Nothing depends on unverified behaviour.

### ARIA and keyboard

There is no APG pattern for form layout. The contract is native HTML semantics, the WAI-ARIA names-and-descriptions practice, and the WCAG 2.2 AA criteria below. No Forms directive adds a role or an ARIA attribute.

| Element | Rendered semantics | Source |
| --- | --- | --- |
| Text input, `textarea` | `textbox` (multi-line for `textarea`); `type="number"` is `spinbutton`; named by its label | HTML-AAM |
| `select` | `combobox`; with `multiple` or a `size` over 1, `listbox` | HTML-AAM |
| Checkbox, radio | `checkbox`, `radio`; named by a wrapping or `for` label | HTML-AAM |
| `fieldset` with `legend` | `group`, named by the `legend` | HTML-AAM; Foundation's docs ("give them a common label using the `<legend>` element") |
| `label` (`nfsFormLabel` or none) | Names its control; clicking it activates or focuses the control | HTML |
| Help text (`nfsHelpText`) | No role; the field's description through `aria-describedby` | Foundation's docs (Help Text, Accessibility); WAI-ARIA `aria-describedby` |
| Input group | No role; the field is named by its own label, and the prefix is plain text beside it | This spec (D6, D7) |
| Input group button | The `nfsButton` inside: role `button`, its own name and `type` | [Spec: Button](../issues/37-spec-button.md) |
| File input | The platform's file-upload control, named by its label | HTML |

Keyboard: all native, and the directives add no handler. Tab and Shift+Tab move through the fields; arrow keys move within a radio group and a select; Space toggles a checkbox; Enter in a text field submits the form implicitly through its default button; Enter or Space on a file input opens the file picker. Focus is never moved by these directives.

### WCAG 2.2 AA

The target is WCAG 2.2 level AA (user rule; ADR 0022). Each row is a requirement with the layer that tests it. Ratios are the exact WCAG 2.2 relative-luminance ratio of Foundation 6.9.0's default settings (`$body-background`, `$input-background`, `$input-background-focus`, and `$select-background` are all `#fefefe`), unrounded, by the exact formula of building-blocks 1.10.

| Criterion | Requirement and how it is met | Foundation default | Test |
| --- | --- | --- | --- |
| 1.3.1 Info and Relationships | Every field is named by its label (wrapping or `for`), every group of checkboxes or radios is a `fieldset` named by its `legend`, and every help text is the field's description. The JSDoc of `NfsInputGroupField`, `NfsFormLabel`, and `NfsHelpText` states the rules: a name source for every input group field, a `for` that names a control, and help text paired by id and outside the label | Fails in the Input Group example (unlabelled field) and wherever help text is not paired | axe `label` in every story; `forms--help-text` asserts the description |
| 1.3.5 Identify Input Purpose | Usage examples carry `autocomplete` tokens on personal-data fields (`email`, `current-password`, `transaction-amount`) | The docs examples have none | Usage examples; design review |
| 1.4.1 Use of Color | A focused field differs from a resting one by more than hue: the focus border colour and the resting border colour are at least 3:1 apart, the same lightness rule the [Spec: Button](../issues/37-spec-button.md) applies to its disabled state: required `$input-border-focus: 1px solid $black` (Sass item 2) | Fails: `$dark-gray` against `$medium-gray` is 2.11:1; with the field border 1.4.11 needs (`$dark-gray`), the two borders are identical (1:1) | `forms--field-contrast` |
| 1.4.3 Contrast (Minimum) | Placeholder text reaches 4.5:1 on the field: required `$input-placeholder-color: #737373` (4.70:1). axe does not check placeholder text, so `forms--field-contrast` measures it. Label text, help text, field text, and input group label text pass on Foundation's defaults and are covered by axe `color-contrast` in every story | Fails: `$medium-gray` placeholder, 1.63:1. Passes: labels and help text 19.63:1; field text 19.63:1 (15.86:1 on the disabled and read-only background); input group label 15.86:1 on `$input-prefix-background` | `forms--field-contrast` (computed `::placeholder` colour); axe `color-contrast` |
| 1.4.10 Reflow | Fields and selects are `width: 100%`. Input group labels do not wrap (`white-space: nowrap`), so the docs tell consumers to keep a prefix or suffix to a unit, a symbol, or an icon; the field shrinks to make room | Passes for short prefixes | Design review; usage examples |
| 1.4.11 Non-text Contrast | An empty text field is identified by its border or its background: the `$input-border` colour or `$input-background` reaches 3:1 against `$body-background`; required `$input-border: 1px solid $dark-gray` (3.42:1). The focus indicator of a select menu or a colour input, which have no text caret, is the focus border, a border of the component, so it reaches 3:1 against both the page and the field's focus background: required `$input-border-focus: 1px solid $black` (19.63:1 against both). The select arrow tells the user the control opens a list, so `$select-triangle-color` reaches 3:1 on `$select-background` (3.42:1 by default) unless the consumer removes it with `transparent`. Text inputs also have the caret, which the Understanding document for 1.4.11 accepts as a focus indicator on its own. axe has no 1.4.11 rule, so `forms--field-contrast` measures these on the required settings | Fails: field border 1.63:1. The default focus border (`$dark-gray`, 3.42:1) passes against the page but equals the required resting border, which leaves a select menu with only Foundation's 1.63:1 focus glow | `forms--field-contrast`; e2e focus test on `forms--select` in three engines |
| 2.4.7 Focus Visible | Text inputs and text areas show the caret and the focus border; select menus and colour inputs show the focus border above; checkboxes, radios, and file inputs keep the browser's focus ring, because Foundation removes no outline from them; `nfsButton` keeps the browser's ring (Button spec). The label-as-button file upload is not offered, because focus would land on a clipped 1 px input with no visible indicator (D12) | Fails for select menus once 1.4.11's field border is set (see 1.4.11) | e2e: the focused select's computed border colour is the focus border colour and differs from the resting one, in three engines |
| 2.5.8 Target Size (Minimum) | Text fields and select menus are 39 px tall at a 16 px root font size; checkboxes and radios are user-agent controls whose size Foundation does not change (it sets margins only), the exception the criterion names, and the examples pair each with a label that is also a click target | Passes | axe `target-size` in every story |
| 3.3.2 Labels or Instructions | Every field has a visible label; a placeholder or a prefix is never an input group field's only label (the JSDoc of `NfsInputGroupField`); help text gives instructions as a description | Fails in the Input Group example | axe `label` |
| 4.1.2 Name, Role, Value | Roles and states are native; names come from labels and legends; no directive adds or changes ARIA | Fails in the Input Group example (no name) | axe `label`, `select-name`, `aria-allowed-attr` in every story; play functions find every control by role and name |

Error identification (3.3.1), status messages (4.1.3), redundant entry (3.3.7), and accessible authentication (3.3.8) belong to validation: [Spec: Abide](../issues/31-spec-abide.md).

The axe gate in every story runs the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, plus `best-practice`) with `parameters.a11y.test = 'error'` (ADR 0018).

### Rendered HTML

Server HTML and the hydrated DOM are identical for every example: every class the Forms directives set is a static host class or a host binding on an input, the grid and text-alignment classes are written as normal classes, and no directive reads the platform, a breakpoint, or a generated id. The directive attributes themselves (`nfsinputgroup=""` and so on) are left out below, and class order is not significant.

```html
<!-- Input group, unvalidated -->
<label for="amount">Amount in dollars</label>
<div nfsInputGroup>
  <span nfsInputGroupLabel>$</span>
  <input nfsInputGroupField id="amount" type="number" inputmode="decimal" autocomplete="transaction-amount">
  <div nfsInputGroupButton>
    <button nfsButton type="submit">Submit</button>
  </div>
</div>

<label for="amount">Amount in dollars</label>
<div class="input-group">
  <span class="input-group-label">$</span>
  <input class="input-group-field" id="amount" type="number" inputmode="decimal" autocomplete="transaction-amount">
  <div class="input-group-button">
    <button class="button" type="submit">Submit</button>
  </div>
</div>

<!-- Help text -->
<label>Password
  <input type="password" autocomplete="current-password" aria-describedby="password-help">
</label>
<p nfsHelpText id="password-help">Your password must have at least 10 characters, a number, and an Emoji.</p>

<label>Password
  <input type="password" autocomplete="current-password" aria-describedby="password-help">
</label>
<p class="help-text" id="password-help">Your password must have at least 10 characters, a number, and an Emoji.</p>

<!-- Fieldset with Foundation's look -->
<fieldset nfsFieldset>
  <legend>Check these out</legend>
  <input id="checkbox12" type="checkbox"><label for="checkbox12">Checkbox 1</label>
  <input id="checkbox22" type="checkbox"><label for="checkbox22">Checkbox 2</label>
</fieldset>

<fieldset class="fieldset">
  <legend>Check these out</legend>
  <input id="checkbox12" type="checkbox"><label for="checkbox12">Checkbox 1</label>
  <input id="checkbox22" type="checkbox"><label for="checkbox22">Checkbox 2</label>
</fieldset>

<!-- Label positioning with middle -->
<div class="grid-x">
  <div class="cell small-3">
    <label for="middle-label" nfsFormLabel middle class="text-right">Label</label>
  </div>
  <div class="cell small-9">
    <input type="text" id="middle-label" placeholder="Right- and middle-aligned text input">
  </div>
</div>

<!-- the label's classes: .middle from nfsFormLabel, .text-right as written; the grid is unchanged -->
<label for="middle-label" class="middle text-right">Label</label>
```

Beside Abide (the Abide directives as the [Spec: Abide](../issues/31-spec-abide.md) defines them; its class-rule re-run renamed nothing):

```html
<form [formRoot]="f" nfsAbide #abide="nfsAbide" aria-labelledby="pay-h">
  <h2 id="pay-h">Payment</h2>
  <div class="grid-x">
    <div class="cell small-3">
      <label for="amount" nfsFormLabel middle [nfsAbideLabel]="amount">Amount in dollars (required)</label>
    </div>
    <div class="cell small-9">
      <div nfsInputGroup>
        <span nfsInputGroupLabel>$</span>
        <input id="amount" type="number" inputmode="decimal" autocomplete="transaction-amount"
               nfsInputGroupField nfsAbideInput #amount="nfsAbideInput" [formField]="f.amount"
               aria-describedby="amount-help">
        <div nfsInputGroupButton>
          <button nfsButton type="submit" [disabled]="!abide.ready()">Pay</button>
        </div>
      </div>
      <span [nfsFormError]="amount" formErrorOn="required">Enter an amount.</span>
      <p nfsHelpText id="amount-help">Whole dollars only.</p>
    </div>
  </div>
</form>
```

Hydrated, after an invalid submit (server HTML is the same without the three invalid-state bindings and with the submit control disabled):

```html
<label for="amount" class="middle is-invalid-label">Amount in dollars (required)</label>
<div class="input-group">
  <span class="input-group-label">$</span>
  <input id="amount" type="number" ... class="input-group-field is-invalid-input" required=""
         aria-invalid="true" aria-describedby="amount-help nfs-form-error-b7c0">
  <div class="input-group-button"><button class="button" type="submit">Pay</button></div>
</div>
<span class="form-error is-visible" id="nfs-form-error-b7c0" role="alert">Enter an amount.</span>
<p class="help-text" id="amount-help">Whole dollars only.</p>
```

A `jsaction` attribute appears in server HTML only on hosts where the consumer or another directive (Abide's input, a Trigger) declared a listener; no Forms directive causes one.

### Animation

None. Foundation's `$input-transition` (`box-shadow` 0.5 s and `border-color` 0.25 s) runs on focus; it changes colour and shadow, not size or position, so it is not motion animation and `prefers-reduced-motion` does not require removing it, as the Button spec found for its colour transition. No State class waits on it, no Completion output exists, and no `animate.enter` or `animate.leave` is used. A consumer who wants no transition sets `$input-transition: none`.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server output and first paint: every Forms class is a static host class or the `middle` host binding, so the server HTML carries all of them and Foundation's CSS styles the first paint (rule 1). Help text ids and `aria-describedby` are consumer-written static values, so they match on both platforms.
- Before hydration: the directives touch no DOM outside host bindings, read no `window`, measure nothing, and start no timer (rules 3 to 5).
- Full hydration: host binding values equal the server's, so hydration changes no class; the directives are hydration-clean by construction and never need `ngSkipHydration`.
- Incremental hydration: the directives register with nothing, so they need no Hydration boundary of their own. A validated form still keeps the form and all its fields in one boundary, which is Abide's rule.
- Event replay: no Forms directive declares a listener, so none adds `jsaction` or has anything replayed. Native form behaviour before hydration is the platform's, and the Abide spec's pre-hydration value adoption and `ready` gate cover validated forms.
- `@defer`: library templates contain none. A consumer may defer the entry point with its form. Inside a dehydrated block, or inside `@defer (hydrate never)`, a form built with these directives is its server HTML: Foundation's CSS, native controls, native labels, and native form submission all work, because nothing here needs JavaScript.
- Prerendering: identical to server rendering; nothing reads request tokens (rule 11).
- Zoneless and OnPush: the only state is an input signal read by a host binding.

## Testing Decisions

A good test asserts what a user or assistive technology observes: roles, accessible names and descriptions, the classes, and computed styles where this spec names a ratio. No test reads a directive's fields. Prior art: the [Spec: Button](../issues/37-spec-button.md) layer tables, the [Spec: Abide](../issues/31-spec-abide.md) contrast story, and the rendering-mode test seam.

Story ids, in Foundation's docs order and then the library scenarios: `forms--default` (text inputs), `forms--number-input`, `forms--textarea`, `forms--select`, `forms--select-multiple`, `forms--checkboxes-and-radios`, `forms--fieldset`, `forms--help-text`, `forms--label-positioning`, `forms--input-group`, `forms--file-upload`, `forms--with-abide`, `forms--field-contrast`. The stories file sets `id: 'forms'`, `title: 'CSS-only components/Forms'`, and `component: NfsFormLabel` (the entry point's one input). The stories of controls that need no directive (`default`, `number-input`, `textarea`, `select`, `select-multiple`, `checkboxes-and-radios`, `file-upload`) say so in their JSDoc. No Anti-pattern story: the unlabelled Input Group example is a usage note. The Storybook settings overrides carry the three settings of the Sass subsection, each with its criterion in a comment.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Run by `npx nx test-storybook <lib>`. Every story runs axe with `parameters.a11y.test = 'error'` on the six tags (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`), which include `label`, `select-name`, `color-contrast`, and `target-size`; no story silences a rule.

- `forms--default`: `getAllByRole('textbox', {name: 'Input Label'})` finds both text inputs; no Forms class is present, because none is needed.
- `forms--number-input`: `getByRole('spinbutton', {name: 'How many puppies?'})` has the value 100.
- `forms--textarea`: `getByRole('textbox', {name: 'What books did you read over summer break?'})` is multi-line.
- `forms--select`: `getByRole('combobox', {name: 'Select Menu'})`; `userEvent.selectOptions` changes its value; after `userEvent.tab()` onto it, its computed `border-top-color` is the focus border colour and differs from the resting colour read before.
- `forms--select-multiple`: `getByRole('listbox', {name: 'Multiple Select Menu'})` accepts two selected options.
- `forms--checkboxes-and-radios`: `getByRole('group', {name: 'Choose Your Favorite'})` contains three radios; clicking the label "Blue" checks `getByRole('radio', {name: 'Blue'})`; `getByRole('group', {name: 'Check these out'})` contains three checkboxes, each found by its label.
- `forms--fieldset`: the `fieldset` has `.fieldset` and its computed border is Foundation's `$fieldset-border`; the group is named by its legend.
- `forms--help-text`: the help text has `.help-text`; `getByLabelText('Password')` has the accessible description "Your password must have at least 10 characters, a number, and an Emoji."
- `forms--label-positioning`: the label has `.middle` and its computed `padding-top` equals Foundation's `form-label-middle` value (half `$form-spacing` plus the field's border width, 9 px at a 16 px root with the required 1 px border); the field is found by `getByLabelText('Label')`; toggling the `middle` control removes `.middle`.
- `forms--input-group`: the container, label, field, and button wrapper carry their four classes; `getByRole('spinbutton', {name: 'Amount in dollars'})` is the field; `getByRole('button', {name: 'Submit'})` has `type="submit"` and `.button`; the field's computed width is larger than the prefix label's (the flexbox layout).
- `forms--file-upload`: `getByLabelText('Upload File')` is an `input` of type `file`; `userEvent.tab()` gives it focus.
- `forms--with-abide`: an invalid submit puts `.is-invalid-input` beside `.input-group-field` on the field and `.is-invalid-label` beside `.middle` on the label; the field's accessible description starts with the help text and then the Form error; the visible Form error is not inside the `.input-group` element; fixing the value clears both State classes and keeps the Forms classes.
- `forms--field-contrast`: from computed styles, floored to two decimals (axe checks neither placeholders nor borders): a text field's border against the page is at least 3:1; its `::placeholder` colour against the field is at least 4.5:1; after `userEvent.tab()` onto the select, its border is at least 3:1 against the page and against its own background, and at least 3:1 from the resting border colour.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

Vitest browser mode under the Angular unit-test builder (Chromium headless): TestBed specs in `<name>.spec.ts` next to each directive, over a bare test host component, zoneless with `await fixture.whenStable()`, asserting DOM state; no story is mounted and no axe runs here.

- Host classes: each of the seven directives adds exactly its class; a class the host component adds for its own styling is kept.
- `middle`: the bare attribute, `middle="true"`, and `[middle]="true"` set `.middle`; `middle="false"`, `[middle]="false"`, and no attribute set none; switching the bound value toggles the class.
- Beside Abide: `nfsFormLabel` and `nfsAbideLabel` on one label, and `nfsInputGroupField` and `nfsAbideInput` on one field, compile and bind their classes independently in either attribute order, under Signal Forms and Reactive Forms.
- Zoneless: the suite runs with zoneless change detection; no test needs `NgZone`.

### 3. Node-level Vitest

- SSR smoke, in `<name>.ssr.spec.ts` through the shared `renderServer()` helper under `npx nx test <lib>` (`npx nx test-node <lib>` only if the server path depends on the DOM adapter): a fixture with every directive, a `middle` label bound to `true`, and the Abide combination resolves `whenStable()`; the server HTML has `.input-group`, `.input-group-label`, `.input-group-field`, `.input-group-button`, `.help-text`, `.fieldset`, and `.middle` on the right elements; the help text id and the field's `aria-describedby` are as written; no Forms host that carries no listener from the consumer or another directive has a `jsaction` attribute.
- Pure logic: none; the directives hold no logic beyond their host bindings. No Sass compile test: the entry point has no library Sass.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build, in Chromium, Firefox, and WebKit:

- Focus visible on `forms--select` (2.4.7): focus the select with a real Tab in Chromium and Firefox and with `focus()` in WebKit (whose Tab reach of form controls depends on a platform keyboard preference); its computed border colour is the focus border colour and differs from the resting colour, and a screenshot before and after shows the change.
- Focus visible on `forms--checkboxes-and-radios` and `forms--file-upload`: after a real Tab in Chromium and Firefox, a screenshot comparison shows the browser's focus ring on the checkbox and on the file input.

Against the prerendered fixture app, route `/forms`:

- JavaScript disabled: screenshot plus axe (`@axe-core/playwright` with `withTags` on the six tags) of the server HTML, which shows every Forms class.
- Hydration: no NG05xx in the console and `ngDevMode.componentsSkippedHydration === 0`.
- `@defer (hydrate never)` variant: typing into the fields, checking a checkbox, and choosing a select option work natively, and the classes are present.

## Out of Scope

- A form-field component (Material's `mat-form-field` shape), floating labels, and hints connected to the field automatically (D5).
- Validation, the error state and its classes (`.is-invalid-input`, `.is-invalid-label`, `.form-error`, `.is-visible`), and the Form alert: [Spec: Abide](../issues/31-spec-abide.md).
- Switch: [Spec: Switch](../issues/84-spec-switch.md). Range inputs: [Spec: Slider](../issues/32-spec-slider.md). `progress` and `meter`: [Spec: Progress Bar](../issues/95-spec-progress-bar.md).
- The label-as-button file upload (`label.button` over a `.show-for-sr` input): `nfsButton` takes `<input type="submit|button|reset">` hosts and no `label` host, because focus would land on a clipped input with no visible indicator ([Spec: Button](../issues/37-spec-button.md), D11), and `.show-for-sr` is Foundation's visibility class; this spec offers the native file input (D12).
- Label alignment and floats (`.text-right`, `.float-right`, `.float-left`) and grid placement: Foundation's own classes, which the consumer writes as normal classes with Foundation's global styles loaded.
- A forced-colours rule for the select arrow: WCAG 2.2 AA has no forced-colours criterion, and the arrow is not the select's only visual, as the Switch's drawing is (the [Spec: Switch](../issues/84-spec-switch.md), D12): the select stays identifiable by its border and text, which take system colours (not measured; see Further Notes).
- Runtime theming of form colours (building-blocks 1.13).
- How the library's Sass ships next to the consumer's Foundation: [Sass packaging for the new library](../issues/57-sass-packaging.md) (ADR 0012).

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | Seven attribute directives in `ngx-foundation-sites/forms`: one per Structural class (`.input-group` and its three parts, `.help-text`, `.fieldset`) plus `label[nfsFormLabel]` for the form label's `.middle` Variant | ADR 0039 (a directive per Structural class); ADR 0040's rule that an element Foundation styles by tag gets a directive once Foundation gives it a Variant class, which `label.middle` is; ADR 0001 (none generates structure) | Leaving the form label without a directive, as the triage's first reading did ("no Structural class to bind"), which would leave `.middle` for the consumer to write; one container directive that sets every class by DOM lookup |
| D2 | No directive for text inputs, `textarea`, `select`, checkboxes, radios, file inputs, bare `fieldset`, and `legend` | Foundation styles them by tag or type; there is no class to manage (ADR 0039) | `input[nfsInput]`-style directives that bind nothing |
| D3 | `NfsFormLabel`, selector `label[nfsFormLabel]`, with a boolean `middle` Variant input through `nfsVariantBoolean`, default `false` | The name comes from Foundation's `form-label` mixin and `$form-label-*` settings, because `NfsLabel` is the Label component's (`.label`, [Spec: Label](../issues/94-spec-label.md)); the selector is `label` because Foundation's rule is `label.middle`; building-blocks 1.4 names a single on or off class after its class and types it through the library transform | `label[nfsLabel]` (collides with the Label component); `middle` as an input of `NfsAbideLabel` (unvalidated forms would import Abide); an alignment enum (Foundation has one class) |
| D4 | Forms directives never bind validation state; `.is-invalid-*`, `.form-error`, and `.is-visible` stay Abide's, and the two sets sit beside each other on the same elements | Foundation documents those classes on the Abide page and leaves the error partial out of the Forms page; composition by placing directives side by side (map, Standing preferences); an unvalidated form imports nothing from Abide (the triage's placement) | `NfsAbideLabel` hosting `NfsFormLabel` through `hostDirectives` (`middle` would be spelt through two directives); a Forms label reading field state through a token (couples Forms to validation) |
| D5 | Help text pairing stays consumer-written (an `id` on the help text, the id in the field's `aria-describedby`), stated in `NfsHelpText`'s JSDoc | Only a directive on the field can bind its `aria-describedby`; native fields carry no directive, and Abide's input already composes the attribute from the consumer's ids and its errors; static ids are identical on server and client; Foundation's docs prescribe this pairing | Help text registering with an Abide field by reference (works for validated fields only, a second way to do one thing); a generated id written onto the field (a DOM write on another directive's host and a second writer of `aria-describedby`) |
| D6 | An input group field has a name source (a label, an `aria-labelledby`, or an `aria-label`); a placeholder, `title`, or prefix does not count: every example labels its field, and `NfsInputGroupField`'s JSDoc states the rule | Foundation's Input Group example fails axe `label` (1.3.1, 3.3.2, 4.1.2), so this spec's examples correct it; a placeholder disappears on input and a prefix such as `$` names nothing (3.3.2) | A required `label` input on the group; naming the field from its prefix automatically |
| D7 | No ARIA on the input group: the field's label carries the unit ("Amount in dollars"), and the prefix is plain text | The field's `aria-describedby` belongs to the consumer and to Abide's input, and a second writer would break it; the label is read on every focus, a description only after it | `aria-describedby` to the prefix written by the directive; `aria-hidden` on the prefix (hides the only unit when the label omits it) |
| D8 | No parent token, Defaults token, outputs, or methods; `exportAs: 'nfsInputGroup'`, `exportAs: 'nfsInputGroupLabel'`, `exportAs: 'nfsInputGroupField'`, `exportAs: 'nfsInputGroupButton'` (2026-09-29, [Decide: an exportAs on every directive](../issues/156-decide-exportas-on-every-directive.md)) | The input group's Sass is child and descendant selectors, so the cascade does the parent's work, as the triage found for Button Group; Forms has no Options | An `nfsInputGroupToken` with child registration |
| D9 | Element-restricted selectors: the field on `input`, `select`, `textarea` (as `NfsAbideInput`); `.fieldset` on `fieldset`; `.middle` on `label`; the other four on any element | The field is a form control, which a label can name; a `.fieldset` look on a `div` draws a group box with no group semantics (1.3.1); Foundation's `.middle` rule matches only `label` | Unrestricted selectors everywhere |
| D10 | `.fieldset` is a Structural class bound by `NfsFieldset`; a `fieldset` has a `legend`, as every documented one does | Foundation calls `.fieldset` the class that holds a fieldset's styles; the legend names the group (1.3.1), and Foundation's docs give every fieldset one | Treating `.fieldset` as a boolean Variant of a tag-styled `fieldset` (a second spelling for one class) |
| D11 | Three required settings (`$input-placeholder-color: #737373`, `$input-border: 1px solid $dark-gray`, `$input-border-focus: 1px solid $black`) and the five ratios every form setting must reach (Sass item 2); no Library mixin | ADR 0022: a failing Foundation default is met by the Sass settings the spec states; axe checks neither placeholder text nor borders, so the ratios are exact and unrounded (building-blocks 1.10) and `forms--field-contrast` measures them; the resting look of every field belongs to this page, validated or not; a select menu has no caret, so its focus border is its indicator; Foundation has settings for every case, so no library rule is needed, and an entry point that needs no custom CSS has no Library mixin (ADR 0012) | A library `select:focus` outline rule (Foundation already has the setting); leaving select focus to Foundation's 1.63:1 glow |
| D12 | The file control is the native `<input type="file">` with its own label; no file-upload directive | The native control is keyboard operable, shows the browser's focus ring, and shows the chosen file name; Foundation's label-as-button recipe puts focus on a clipped 1 px input (2.4.7) and hides the file name; `nfsButton` takes no `label` host for the same reason ([Spec: Button](../issues/37-spec-button.md), D11) | A directive that styles a label as a button over a hidden input; binding `.show-for-sr` from this spec |
| D13 | No library CSS and no Variant properties | Foundation's forms Sass styles every class the directives set; the page has no Open Variant family | A properties-only mixin (nothing to list) |
| D14 | No directive reads the DOM: each rule the markup follows (a label's `for`, help text's pairing and place, an input group field's name, a fieldset's legend) is stated in the directive's JSDoc and shown in every example | The rules are consumer markup that native HTML defines and axe's `label` rule covers in the library's stories; the directives stay host bindings, identical on server and client | A directive that writes the missing link itself (D5's generated id: a DOM write on another directive's host and a second writer of `aria-describedby`) |
| D15 | Label alignment and grid placement come from Foundation's text-alignment, float, and XY grid classes, written as normal classes beside `nfsFormLabel` (2026-09-30: those families have no first-milestone spec) | One spec per docs page; the classes are other families' Utility classes, which ADR 0039's exception lets the consumer write while those families have no first-milestone spec | `align` or `float` inputs on `NfsFormLabel` (a second spelling of utility classes) |

### Usage examples

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NfsFieldset, NfsHelpText, NfsInputGroup, NfsInputGroupButton, NfsInputGroupField, NfsInputGroupLabel } from 'ngx-foundation-sites/forms';
import { NfsButton } from 'ngx-foundation-sites/button';

@Component({
  selector: 'app-donate',
  imports: [NfsButton, NfsFieldset, NfsHelpText, NfsInputGroup, NfsInputGroupButton, NfsInputGroupField, NfsInputGroupLabel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form (submit)="donate($event)">
      <fieldset nfsFieldset>
        <legend>Frequency</legend>
        <input type="radio" name="frequency" value="once" id="once" checked><label for="once">Once</label>
        <input type="radio" name="frequency" value="monthly" id="monthly"><label for="monthly">Monthly</label>
      </fieldset>

      <label for="amount">Amount in dollars</label>
      <div nfsInputGroup>
        <span nfsInputGroupLabel>$</span>
        <input nfsInputGroupField id="amount" name="amount" type="number" min="1" inputmode="decimal"
               autocomplete="transaction-amount" aria-describedby="amount-help">
        <div nfsInputGroupButton>
          <button nfsButton type="submit">Donate</button>
        </div>
      </div>
      <p nfsHelpText id="amount-help">Whole dollars; the minimum is 1.</p>

      <label>Message (optional)
        <textarea name="message" rows="3"></textarea>
      </label>
    </form>`,
})
export class Donate {
  protected donate(event: SubmitEvent) {
    event.preventDefault();
    // read the form data
  }
}
```

A label beside its field, aligned with `middle` and bound from state:

```html
<label for="city" nfsFormLabel [middle]="sideBySide()">City</label>
<input id="city" type="text" autocomplete="address-level2">
```

The same form validated: add `nfsAbide` to the form, `nfsAbideInput` and `[formField]` beside `nfsInputGroupField`, `[nfsAbideLabel]` beside the label, and one `[nfsFormError]` after the group, as the Rendered HTML shows. The help text keeps its id and the field keeps `aria-describedby="amount-help"`; Abide's input puts it first and adds the visible errors after it.

A file field:

```html
<label for="receipt">Upload your receipt (PDF)</label>
<input id="receipt" type="file" accept="application/pdf">
```

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This entry point relies on Foundation's Export mixin `foundation-forms` (its `foundation-form-text`, `foundation-form-checkbox`, `foundation-form-label`, `foundation-form-helptext`, `foundation-form-prepostfix`, `foundation-form-fieldset`, and `foundation-form-select` parts; its `foundation-form-error` part serves Abide). No library CSS and no Library mixin: Foundation's settings reach every ratio this page needs (item 2), so there is no `nfs-forms` mixin.

1. Rules the library emits: none.
2. Ratios every form setting must reach for WCAG 2.2 AA, each the exact, unrounded WCAG 2.2 relative-luminance ratio with a translucent colour composited over `$body-background` first (building-blocks 1.10), not Foundation's `color-contrast()`, which rounds to one decimal, or its `color-luminance()`, whose approximate power overstates some ratios; border colours are the colours of the shorthands:
   - `$input-placeholder-color` on `$input-background`, at least 4.5:1 (1.4.3);
   - the `$input-border` colour on `$body-background`, or `$input-background` on `$body-background`, at least 3:1 (1.4.11, the boundary of an empty field);
   - the `$input-border-focus` colour on `$body-background` and on `$input-background-focus`, at least 3:1 each (1.4.11 and 2.4.7, the focus indicator of a select menu or colour input);
   - the `$input-border-focus` colour against the `$input-border` colour, at least 3:1 (1.4.1, the focused state is not a hue change alone);
   - `$select-triangle-color` on `$select-background`, at least 3:1, unless it is `transparent` (1.4.11).

   Nothing in Foundation's CSS stops a failing value from compiling. axe checks neither placeholder text nor borders, so the library's `forms--field-contrast` story measures them on the required settings (ADR 0022).

   Foundation settings the consumer must set for WCAG 2.2 AA (declared before `@import 'foundation'`; Foundation's settings are `!default`), computed with the exact WCAG formula against its default `#fefefe` backgrounds. The Storybook settings overrides carry the same three lines:

| Setting | Foundation default (measured) | Required value | After | Criterion |
| --- | --- | --- | --- | --- |
| `$input-placeholder-color` | `$medium-gray` (`#cacaca`): 1.63:1 on the field | `#737373` | 4.70:1 | 1.4.3 |
| `$input-border` | `1px solid $medium-gray`: 1.63:1 against the page (the field background equals the page, so the border is the field's only boundary) | `1px solid $dark-gray` (`#8a8a8a`) | 3.42:1 | 1.4.11 |
| `$input-border-focus` | `1px solid $dark-gray`: 3.42:1 against the page, but 2.11:1 from Foundation's resting border and 1:1 from the required one | `1px solid $black` (`#0a0a0a`) | 19.63:1 against the page and the focus background; 5.73:1 from the resting border | 1.4.11, 1.4.1, 2.4.7 |

   A consumer with another palette or background picks any placeholder colour at 4.5:1 on its field, any border colour at 3:1 on its page (or a field background at 3:1 on its page), and any focus border colour at 3:1 on its page and focus background and 3:1 from its resting border. `$select-triangle-color` (`$dark-gray`, 3.42:1) passes by default and needs nothing. The [Spec: Abide](../issues/31-spec-abide.md) points here for all three and keeps its invalid-state settings; a focused invalid select shows the focus border in place of the invalid one, so the focus border also keeps 3:1 from `$input-background-invalid`, a setting the Abide spec requires. The same `$input-border-focus` draws the focus ring of a switch, whose input Foundation hides ([Spec: Switch](../issues/84-spec-switch.md)), so it keeps 3:1 against the page there too.
3. Custom properties written by the directives: none.
4. Motion classes: none; no transition or animation is added or awaited.
5. Missing include: there is no Library mixin to include. A consumer who keeps a failing setting ships a page that fails the criterion item 2 names; the library's `forms--field-contrast` story and its e2e focus test prove the required settings.
6. Variant properties: none. The page has no Open Variant family; `.middle` is closed.

### Platform features to adopt when the browser target moves

- `:has()` (out of target): `label:has(+ input[type='file']:focus-visible)` could show focus on a label-as-button file control, which would let the Button spec offer Foundation's File Upload Button recipe; `.input-group:has(:focus-visible)` could draw one focus ring around a joined group.
- `field-sizing: content` (out of target): auto-growing text areas without a directive.
- Forced colours: whether Foundation's background-image select arrow survives `forced-colors: active` in each engine is unmeasured. The select stays identifiable by its border and its text, so no rule is added now; a measured loss would give the entry point a Library mixin with one rule.

### Foundation behaviour changed or dropped

- The unlabelled Input Group example: the field gets a label in every example (D6).
- The File Upload Button recipe: replaced by the native file input (D12).
- The focus border: Foundation's default is kept as a setting, but the spec requires a darker one, because the field border that WCAG 1.4.11 requires would otherwise equal it.
