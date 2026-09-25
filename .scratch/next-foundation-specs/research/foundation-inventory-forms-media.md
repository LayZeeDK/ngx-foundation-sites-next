# Foundation plugin inventory D: Abide, Slider, Orbit, Equalizer, Interchange

Ticket: ../issues/04-foundation-inventory-forms-media.md
Sources: Foundation for Sites 6.9.0 local clone (`package.json` version 6.9.0).
`FS` below means `d:/projects/github/foundation/foundation-sites`. Line numbers
refer to the files as checked out on 2026-09-25.

Corrected 2026-09-25 after [Audit 0001: research wave](../audits/0001-research-wave.md), finding H2: utility-file line citations re-derived per file.

Conventions shared by all five plugins (from `FS/js/foundation.core.plugin.js`
and `FS/js/foundation.core.js`):

- Options are `$.extend({}, Defaults, $element.data(), options)`. jQuery
  `.data()` turns `data-foo-bar` into `fooBar`, so every option below is also
  settable as a kebab-case `data-*` attribute on the plugin element. Abide is
  the one plugin that merges deeply (`$.extend(true, ...)`,
  `foundation.abide.js:21`), which is how `patterns` and `validators` maps
  merge instead of replace.
- `data-options="key:value; key2:value2"` is parsed by
  `foundation.core.js:161-165`; `parseValue` (`:323-328`) turns `true`/`false`
  and numeric strings into booleans and numbers.
- Every plugin fires `init.zf.<plugin>` on construction
  (`foundation.core.plugin.js:19`) and `destroyed.zf.<plugin>` on `destroy()`
  (`:30`). The plugin name is the hyphenated class name, so Abide fires
  `init.zf.abide`, Slider `init.zf.slider`, and so on.
- Generated ids come from `GetYoDigits(6, ns)` (`foundation.core.utils.js:20-28`)
  and look like `k3f9x2-slider`.

---

## Abide

### Purpose

"Abide is a form validation library that extends the HTML5 validation API with
custom validators." (`FS/docs/pages/abide.md:3`)

### Markup contract

Form element: `<form data-abide novalidate>`. The docs add `novalidate` "to
disable any browser validation that could conflict with Abide"
(`abide.md:14`).

Inputs considered: every `input` except `[type="submit"]`, plus `textarea` and
`select` (`FS/js/foundation.abide.js:34-37`). Submit controls: `[type="submit"]`
(`:38`).

Per-field markup from the docs (`abide.md:31-37`):

```html
<label>Number Required
  <input type="text" placeholder="1234" aria-describedby="example1Hint1" aria-errormessage="example1Error1" required pattern="number">
  <span class="form-error">
    Yo, you had better fill this out, it's required.
  </span>
</label>
<p class="help-text" id="example1Hint1">Here's how you use this input field!</p>
```

Global error container (`abide.md:26-28`):

```html
<div data-abide-error class="alert callout" style="display: none;">
  <p><i class="fi-alert"></i> There are some errors in your form.</p>
</div>
```

Initial state versus error state, from the docs (`abide.md:196-230`):

```html
<!-- initial -->
<div data-abide-error class="alert callout" aria-live="assertive" style="display: none;">...</div>
<label>
  Name
  <input id="example4Input" aria-describedby="example4Error" type="text" required>
  <span id="example4Error" class="form-error">This field is required.</span>
</label>

<!-- error -->
<div data-abide-error class="alert callout" aria-live="assertive" role="alert" style="display: block;">...</div>
<label class="is-invalid-label">
  Name
  <input id="example4Input" aria-describedby="example4Error" type="text" required
    class="is-invalid-input" aria-invalid="true">
  <span id="example4Error" class="form-error is-visible">This field is required.</span>
</label>
```

Attributes the plugin reads on fields:

| Attribute | Meaning | Source |
| --- | --- | --- |
| `required` | required check; on radio/checkbox, one `required` in the group makes the whole group required | `abide.js:141`, `:617-628`, `:648-659` |
| `pattern="<name or regex>"` | built-in pattern name or a raw regex | `abide.js:593-605` |
| `data-pattern` | same as `pattern`, takes precedence over it | `abide.js:593` |
| `type` | if no pattern attribute, the type name is looked up in `patterns` (so `type="email"` uses the email regex) | `abide.js:593-603` |
| `data-validator="a b c"` | space-separated names in `options.validators`, each called as `fn($el, required, $el.parent())` | `abide.js:485-491` |
| `data-equalto="<id>"` | must equal the value of `#<id>` (looked up document-wide) | `abide.js:493-495`, `:900-902` |
| `data-min-required="<n>"` | on any checkbox in a group: at least n must be checked (default 1; last one read wins) | `abide.js:664-671` |
| `data-abide-ignore` | skip validation | `abide.js:459` |
| `type="hidden"`, `disabled` | skip validation | `abide.js:459` |
| `formnovalidate` on a submit control | skip form validation for that submit | `abide.js:68`, `:111-119` |

Attributes the plugin reads on error elements:

| Attribute | Meaning | Source |
| --- | --- | --- |
| `.form-error` (option `formErrorSelector`) as a sibling of the input, or anywhere inside the input's parent | the field's error message(s) | `abide.js:179-183` |
| `[data-form-error-for="<input id>"]` | error placed elsewhere (input groups) | `abide.js:185-187`, docs `abide.md:150-164` |
| `[data-form-error-on="required|pattern|equalTo|<validator>"]` | error shown only when that validator failed | `abide.js:189-196`, docs `abide.md:171-177` |
| `[data-abide-error]` | form-level error container, shown/hidden with inline `display` | `abide.js:566-572` |

State the plugin toggles:

| Target | Added on invalid | Removed on valid/reset | Source |
| --- | --- | --- | --- |
| input | class `is-invalid-input` (option `inputErrorClass`), `data-invalid=""`, `aria-invalid="true"` | all three | `abide.js:281-284`, `:429-432` |
| input | `aria-describedby="<first visible form error id>"` (only when no `aria-describedby` already exists and the input is not hidden) | removed only if Abide added it (`data('abide-describedby')`) | `abide.js:330-343`, `:434-436` |
| label (`label[for=id]` inside the form, else closest `label`) | class `is-invalid-label` (option `labelErrorClass`) | removed | `abide.js:209-218`, `:273-275` |
| form errors | class `is-visible` (option `formErrorClass`) | removed | `abide.js:277-279` |
| `[data-abide-error]` | inline `display: block` after `validateForm` fails | `display: none` on success and on reset | `abide.js:571`, `:723` |

Attributes added at init when `a11yAttributes` is true (`abide.js:41-45`,
`:296-352`):

- `role="alert"` on every form error that has no `role`.
- `aria-describedby` on the input pointing at the first *visible* form error;
  an id `<6 chars>-abide-error` is generated if the error has none.
- For `label.form-error` elements lacking `for`, `for` is set to the input id
  (generated `<6 chars>-abide-input` if missing).
- `aria-live="<a11yErrorLevel>"` on each `[data-abide-error]` lacking it.

### Options

From `Abide.defaults` (`FS/js/foundation.abide.js:768-904`), cross-checked with
`FS/docs/pages/abide.md`:

| Option (`data-*`) | Type | Default | Meaning |
| --- | --- | --- | --- |
| `validateOn` (`data-validate-on`) | string or null | `'fieldChange'` | When `'fieldChange'`, binds `change` on every input. Any other value binds nothing (manual validation). Source comment: "Checkboxes and radios validate immediately" (their `change` fires on click). `:73-79`, `:770-776` |
| `labelErrorClass` | string | `'is-invalid-label'` | class added to the label `:784` |
| `inputErrorClass` | string | `'is-invalid-input'` | class added to the input `:792` |
| `formErrorSelector` | string | `'.form-error'` | selector for per-field errors `:800` |
| `formErrorClass` | string | `'is-visible'` | class added to matched form errors `:808` |
| `a11yAttributes` | boolean | `true` | insert `aria-describedby`, `role=alert`, `for`, `aria-live` (see above) `:819` |
| `a11yErrorLevel` | string | `'assertive'` | `aria-live` value for `[data-abide-error]`; `'assertive'`, `'polite'`, `'off'` `:829` |
| `liveValidate` | boolean | `false` | also validate on `input` events `:81-87`, `:837` |
| `validateOnBlur` | boolean | `false` | also validate on `blur` `:89-95`, `:845` |
| `patterns` | map name -> RegExp (or object with `test`) | see below | named patterns `:847-891` |
| `validators` | map name -> `function($el, required, $parent): boolean` | `{ equalTo }` | custom validators `:899-903` |

Built-in patterns (`abide.js:848-890`; docs list at `abide.md:358-375`):
`alpha`, `alpha_numeric`, `integer`, `number`, `card`, `cvv`, `email`, `url`,
`domain`, `datetime`, `date` (YYYY-MM-DD), `time` (HH:MM:SS), `dateISO`,
`month_day_year` (MM/DD/YYYY), `day_month_year` (DD/MM/YYYY), `color`
(#FFF or #FFFFFF), `website` (domain OR url, implemented as an object with a
`test()` method rather than a RegExp). The source `card` regex (`:855`) also
accepts the Mastercard 2221-2720 range, which the docs copy (`abide.md:395`)
does not. `alpha` and `alpha_numeric` are ASCII only; the docs say to override
them for other languages (`abide.md:377-384`).

Built-in validator: `equalTo(el)` returns
`$('#' + el.attr('data-equalto')).val() === el.val()` (`:900-902`).

### Events

Fired (all carry the jQuery element as the first extra argument):

| Event | On | When | Source |
| --- | --- | --- | --- |
| `valid.zf.abide` / `invalid.zf.abide` | the input | end of `validateInput` | `abide.js:497-498`, `:526` |
| `formvalid.zf.abide` / `forminvalid.zf.abide` | the form | end of `validateForm` | `:580` |
| `formreset.zf.abide` | the form | end of `resetForm` | `:740` |
| `init.zf.abide`, `destroyed.zf.abide` | the form | plugin lifecycle | `core.plugin.js:19`, `:30` |

Listened for (`abide.js:54-96`):

| Event | On | Handler |
| --- | --- | --- |
| `reset.zf.abide` | form | `resetForm()` |
| `submit.zf.abide` | form | `return validateForm()` - returning `false` cancels native submission |
| `click.zf.abide keydown.zf.abide` (no key, Space, or Enter) | `[type="submit"]` | `preventDefault()`, remember `formnovalidate` presence, then `$element.submit()` |
| `change.zf.abide` | inputs | `validateInput` (only when `validateOn === 'fieldChange'`) |
| `input.zf.abide` | inputs | `validateInput` (only when `liveValidate`) |
| `blur.zf.abide` | inputs | `validateInput` (only when `validateOnBlur`) |

Live-validation timing, summarised: by default a field is validated on
`change` (after commit: blur for text, click for checkbox/radio/select) and the
whole form on submit; `liveValidate` adds per-keystroke `input` validation;
`validateOnBlur` adds `blur`. The three are independent flags, so all three
listeners can be bound at once.

Checkbox groups with `data-min-required > 1` are not validated until the form
has been submitted once (`this.initialized`, `abide.js:543-545`, `:679-682`),
"otherwise it will already show an error during the first fill in".

### Public methods

(`FS/js/foundation.abide.js`)

| Method | What it does | Lines |
| --- | --- | --- |
| `enableValidation()` / `disableValidation()` | toggle `isEnabled`; when disabled `validateInput`/`validateForm` return `true` without touching the DOM | `124-133`, `111-119` |
| `requiredCheck($el)` | `true` unless `required` and (checkbox unchecked / select has no selected option with a value / value empty) | `140-162` |
| `findFormError($el, failedValidators?)` | sibling or parent-scoped `.form-error`, plus `[data-form-error-for=id]`; filtered by `data-form-error-on` when validator names are given | `177-199` |
| `findLabel($el)`, `findRadioLabels($els)`, `findCheckboxLabels($els)` | `label[for=id]` inside the form, else `closest('label')` | `209-262` |
| `addErrorClasses($el, failedValidators?)` / `removeErrorClasses($el)` | apply/remove the state table above; radio and checkbox route to `removeRadioErrorClasses(name)` / `removeCheckboxErrorClasses(name)` | `269-289`, `359-437` |
| `addA11yAttributes($el)`, `addA11yErrorDescribe($el, $error)`, `addGlobalErrorA11yAttributes($el)` | the a11y attribute insertion described above | `296-352` |
| `validateInput($el)` | full per-field algorithm: skip if disabled/ignored/hidden; by type -> radio group, checkbox group (manages its own classes), select required, text required + pattern; then `data-validator` names, then `data-equalto`; on success re-validate fields whose `data-equalto` points at this id; toggle classes; fire `valid`/`invalid` | `447-529` |
| `validateForm()` | validate every input (one per checkbox group name), show/hide `[data-abide-error]`, fire `formvalid`/`forminvalid`, return boolean | `537-583` |
| `validateText($el, pattern?)` | empty value is valid; named pattern -> test; otherwise `new RegExp(pattern)` unless the pattern string is just the `type` attribute | `591-609` |
| `validateRadio(groupName)` / `validateCheckbox(groupName)` | group semantics described above | `616-694` |
| `matchValidation($el, validators, required)` | run space-separated validator names, all must pass | `703-710` |
| `resetForm()` | strip classes, hide global error, clear text-like values, uncheck radios/checkboxes, clear `data-invalid`/`aria-invalid`, fire `formreset` (does not remove `aria-describedby`) | `716-741` |
| `_reflow()` | re-runs `_init()` (re-collect inputs, re-bind) | `102-104` |
| `_destroy()` | unbind, remove error classes, hide global error, keep values | `747-762` |

### Keyboard and ARIA behaviour

- Submit buttons respond to click and to `keydown` Space/Enter (`abide.js:66`).
  No `Keyboard.register` call; Abide does not use `foundation.util.keyboard`.
- ARIA it sets: `aria-invalid="true"` (and removes on valid), `aria-describedby`
  toward the first visible `.form-error` (only if the input had none),
  `role="alert"` on form errors, `aria-live` on `[data-abide-error]`,
  `for` on `label.form-error`. It never sets `aria-errormessage`, `aria-required`
  or `aria-live` on per-field errors.
- The docs demo markup carries `aria-errormessage="example1Error1"`
  (`abide.md:33`, `:42`, `:51`) but no element with those ids exists and the
  plugin never reads or writes that attribute.

### Dependencies

`foundation.core.plugin` (Plugin) and `foundation.core.utils` (`GetYoDigits`)
only (`abide.js:1-3`). No MediaQuery, Motion, Triggers, Keyboard, Nest, Box,
Touch, Timer or ImageLoader. No other plugin.

### Sass configuration that shapes behaviour

`FS/scss/forms/_error.scss`, included by `foundation-forms`
(`FS/scss/forms/_forms.scss:33`):

- `$abide-inputs: true` - emit the `.is-invalid-input` rule at all (`:151`, `:207-212`).
- `$abide-labels: true` - emit the `.is-invalid-label` rule (`:155`, `:214-219`).
- `.form-error { display: none }` and `.form-error.is-visible { display: block }`
  (`:196-228`): the `is-visible` class is what makes the message appear; the
  plugin never sets inline display on per-field errors.
- `.is-invalid-input:not(:focus)` gets the alert border/background and
  placeholder colour (`:181-193`): error styling is suppressed while focused.
- Pure theming: `$input-background-invalid`, `$form-label-color-invalid`,
  `$input-error-color`, `$input-error-font-size`, `$input-error-font-weight`.

### Behaviour that only jQuery makes easy

- Programmatic `$element.submit()` after intercepting the submit button click
  (`abide.js:69`), with the documented jQuery caveat that a submit control named
  `submit` breaks it (`abide.md:461-463`).
- `:visible` filtering to decide whether to attach `aria-describedby`
  (`abide.js:286`, `:301`).
- jQuery pseudo-selectors `:radio`, `:checkbox`, `:input`, `:selected`
  (`abide.js:360`, `:385`, `:724-732`, `:153`).
- Deep `$.extend(true)` merge so consumers add patterns/validators by mutating
  `Foundation.Abide.defaults.patterns` before init (`abide.md:436-454`).
- Validators receive jQuery wrappers and the parent element
  (`abide.js:489`, `:707`).
- `equalTo` looks the target up document-wide by id, not within the form.
- Global error visibility is inline `display` toggling (`abide.js:571`, `:723`).
- `formnovalidate` is captured on the click that precedes submit
  (`abide.js:68`); Enter inside a text field with no click goes through the
  first submit control's attribute instead (`abide.js:118`).

---

## Slider

### Purpose

"This handy lil slider is perfect for setting specific values within a range."
(`FS/docs/pages/slider.md:3`)

### Markup contract

Docs example (`slider.md:31-36`):

```html
<div class="slider" data-slider data-initial-start="50" data-end="200">
  <span class="slider-handle"  data-slider-handle role="slider" tabindex="1"></span>
  <span class="slider-fill" data-slider-fill></span>
  <input type="hidden">
</div>
```

Two handles (`slider.md:97-104`): a second `.slider-handle[data-slider-handle]`
and a second `<input type="hidden">`; first handle drives first input, second
drives second (`slider.md:86`).

Vertical (`slider.md:53-58`): add class `.vertical` **and** `data-vertical="true"`.
Disabled (`slider.md:71-76`): add class `.disabled` (or `data-disabled="true"`;
the JS syncs class and option both ways, `foundation.slider.js:75-78`).

Data binding (`slider.md:122-134`): omit the inner `<input>`, give the handle
`aria-controls="<id>"` of an external `<input type="number" id="...">`; the JS
then treats that element as the input and sets `options.binding = true`
(`slider.js:72`, `:79-82`, `:89`).

Elements the JS finds: `input` inside the container (`:68`),
`[data-slider-handle]` (`:69`), `[data-slider-fill]` (`:73`).

State the JS toggles:

| Target | State | Source |
| --- | --- | --- |
| handle and fill | class `is-dragging` while a mouse (or emulated touch) drag is in progress | `slider.js:495-496`, `:508-509` |
| container | jQuery data `dragging` true/false (not a DOM attribute) | `:497`, `:510` |
| container | class `disabled` (option `disabledClass`) | `:77` |
| handle | inline `left` (or `top` when vertical) as a percentage | `:271-276` |
| fill | inline `width` (or `height`) percentage; for two handles also `left`/`top` and `min-width`/`min-height` | `:280-283` |
| input | `id` (generated `<6>-slider` if missing), `min`, `max`, `step`, `value` | `:312-321` |

### Options

From `Slider.defaults` (`FS/js/foundation.slider.js:571-706`):

| Option (`data-*`) | Type | Default | Meaning |
| --- | --- | --- | --- |
| `start` | number | `0` | minimum value `:578` |
| `end` | number | `100` | maximum value `:585` |
| `step` | number | `1` | value granularity; keyboard step; values snap to nearest step (`_adjustValue`, `:412-435`) `:592` |
| `initialStart` | number | `0` | first handle's initial value `:599` |
| `initialEnd` | number | `100` | second handle's initial value `:606` |
| `binding` | boolean | `false` | input lives outside the container ("Set to by the JS" when no inner input) `:613` |
| `clickSelect` | boolean | `true` | click/tap on the bar moves the nearest handle `:620`, `:474-486` |
| `vertical` | boolean | `false` | vertical maths; must pair with `.vertical` class `:627` |
| `draggable` | boolean | `true` | mouse drag on handles (touch emulated via `addTouch`) `:634`, `:488-519` |
| `disabled` | boolean | `false` | no movement; synced with `disabledClass` `:641`, `:75-78`, `:196-198` |
| `doubleSided` | boolean | `false` | forced `true` when a second handle exists `:648`, `:86-87` |
| `decimal` | number | `2` | decimal places for values and percentages `:659` |
| `moveTime` | number (ms) | `200` | animation time for click/keyboard moves; "Needs to be manually set if updating the transition time in the Sass settings" `:670` |
| `disabledClass` | string | `'disabled'` | `:677` |
| `invertVertical` | boolean | `false` | declared (`:684`) but never read anywhere in `FS/js` - dead option |
| `changedDelay` | number (ms) | `500` | debounce before `changed.zf.slider` `:691`, `:299-302` |
| `nonLinearBase` | number | `5` | base for `pow`/`log` mapping `:698` |
| `positionValueFunction` | `'linear'`, `'pow'`, `'log'` | `'linear'` | non-linear position-to-value mapping `:705`, `:124-182`; docs `slider.md:187-205` |

Behaviour notes from `_setHandlePos` (`:194-304`): values are clamped to
`[start, end]` (`:203-204`); with two handles the first cannot reach or pass the
second (`location >= h2 ? h2 - step`) and vice versa (`:208-216`); while
dragging, `moveTime` is replaced by one frame (`1000/60`, `:265`); if the slider
is hidden the handle width is NaN and the position falls back to the raw
percentage (`:271-273`; docs "Reflow", `slider.md:207-214`). RTL flips
horizontal click positions (`:388`) and the keyboard map.

### Events

Fired:

| Event | On | Payload | When | Source |
| --- | --- | --- | --- | --- |
| `moved.zf.slider` | container | `[$handle]` | after the `Move` animation reports `finished.zf.animate`; only after init | `slider.js:287-294` |
| `changed.zf.slider` | container | `[$handle]` | `changedDelay` ms after the last value change | `:299-302` |
| `init.zf.slider`, `destroyed.zf.slider` | container | | lifecycle | core |

Listened for (`slider.js:456-557`):

| Event | On | Handler |
| --- | --- | --- |
| `change.zf.slider` | inputs | move the matching handle to the typed value |
| `keyup.zf.slider` (Enter) | inputs | same, for browsers that only fire `change` on blur |
| `click.zf.slider` | container (when `clickSelect`) | ignored while dragging or when the target is a handle; else move nearest handle (two-handle: closest by pixel distance, `:392-396`) |
| `mousedown.zf.slider` | handle (when `draggable`) | add `is-dragging`, bind `mousemove.zf.slider`/`mouseup.zf.slider` on `body` |
| `selectstart.zf.slider touchmove.zf.slider` | handle | `preventDefault` |
| `keydown.zf.slider` | handle | `Keyboard.handleKey(e, 'Slider', ...)` |
| `finished.zf.animate` | container | from `Move` (`foundation.util.motion.js:27`, `:39`) |

### Public methods

| Method | What it does | Lines |
| --- | --- | --- |
| `setHandles()` | reposition handle(s) from the current input values | `106-114` |
| `_reflow()` | alias of `setHandles()`; documented consumer call `$('#my-slider').foundation('_reflow')` after un-hiding | `116-118`, `slider.md:211-214` |
| `_setHandlePos($handle, value, cb?)` | clamp, prevent crossing, write value/aria, animate, fire events | `194-304` |
| `_setInitAttr(idx)` | write input `id/min/max/step/value` and handle ARIA | `312-331` |
| `_setValues($handle, val)` | write input value and `aria-valuenow` | `340-344` |
| `_handleEvent(e, $handle?, val?)` | pointer position or typed value -> value -> `_setHandlePos` | `357-403` |
| `_adjustValue($handle, value)` | snap to nearest step | `412-435` |
| `_destroy()` | unbind `.zf.slider`, clear the changed timeout | `562-568` |

There is no public `setValue`/`getValue`; consumers read/write the `<input>`
and trigger `change`.

### Keyboard and ARIA behaviour

Registered with `Keyboard.register('Slider', ...)` (`slider.js:40-59`):

| Key (ltr) | Command | Effect (`:528-551`) |
| --- | --- | --- |
| ArrowRight, ArrowUp | `increase` | `+ step` |
| ArrowLeft, ArrowDown | `decrease` | `- step` |
| Shift+ArrowRight, Shift+ArrowUp | `increaseFast` | `+ 10 * step` |
| Shift+ArrowLeft, Shift+ArrowDown | `decreaseFast` | `- 10 * step` |
| Home | `min` | `start` |
| End | `max` | `end` |

RTL overrides swap Left/Right (`:53-58`); Keyboard util merges ltr/rtl maps by
`html[dir=rtl]` (`foundation.util.keyboard.js:107-114`). PageUp/PageDown are not
mapped. Handled keys call `preventDefault` (`:547-550`).

ARIA set on each handle in `_setInitAttr` (`slider.js:322-330`):
`role="slider"`, `aria-controls="<input id>"`, `aria-valuemax`, `aria-valuemin`,
`aria-valuenow`, `aria-orientation="horizontal|vertical"`, `tabindex="0"`
(the docs markup writes `tabindex="1"`; the JS overwrites it with `0`).
`aria-valuenow` is updated on every move (`:343`). Not set: `aria-valuetext`,
`aria-label`, `aria-labelledby`, `aria-disabled`. The forms docs tell consumers
to put `aria-labelledby`/`aria-describedby` on the `.slider` container
(`FS/docs/pages/forms.md:335-342`), which is not the `role="slider"` element.

### Dependencies

`slider.js:1-10`: Keyboard (`handleKey`, `register`), Motion (`Move`: rAF loop
that re-applies the css function each frame for `moveTime` then fires
`finished.zf.animate`, `foundation.util.motion.js:22-43`), core utils
(`GetYoDigits`, `rtl`), Touch (`Touch.init($)` then `this.handles.addTouch()`,
which re-dispatches `touchstart/move/end` as synthetic `mousedown/move/up`,
`foundation.util.touch.js:118-154`), Triggers (`Triggers.init($)` is called at
`:36` but no trigger event is used by the plugin).

### Sass configuration that shapes behaviour

`FS/scss/components/_slider.scss` (included by `foundation-everything`,
`FS/scss/foundation.scss:117`):

- `$slider-transition: all 0.2s ease-in-out` (`:18`) on handle and fill must
  match `moveTime: 200` (source comment `slider.js:670`).
- `.is-dragging { transition: all 0s linear }` on fill and handle (`:46-48`,
  `:73-76`) so drags are not smoothed.
- Container: `touch-action: none`, `user-select: none`, `cursor: pointer`
  (`:21-31`); handle `touch-action: manipulation`, `cursor: grab/grabbing`
  (`:52-77`).
- `.slider.disabled, .slider[disabled]` -> `opacity: $slider-opacity-disabled`
  (0.25), `cursor: not-allowed` (`:79-82`, `:124-127`).
- `.slider.vertical` uses `transform: scale(1, -1)` to flip so that JS `top`
  maths runs bottom-up (`:84-105`); the JS also inverts the value formula for
  vertical (`slider.js:155-158`).
- `@if $global-text-direction == rtl { .slider:not(.vertical) { transform: scale(-1, 1) } }`
  (`:134-139`) pairs with the JS RTL inversion.
- Native alternative: `@mixin foundation-range-input` in
  `FS/scss/forms/_range.scss:31-137` styles `input[type='range']` with the same
  `$slider-*` variables. It is not part of `foundation-forms` or
  `foundation-everything`; the docs say to `@include foundation-range-input;`
  yourself (`slider.md:171-175`) and list the trade-offs: less markup, no JS,
  `disabled` attribute instead of class, no vertical, no two handles
  (`slider.md:177-184`).

### Behaviour that only jQuery makes easy

- Pointer maths via `$(window).scrollTop()`, `$element.offset()`,
  `$handle.position()` (`slider.js:367-369`, `:711-713`).
- Touch support by synthesising mouse events (`$.fn.addTouch`).
- Body-level `mousemove`/`mouseup` binding and unbinding per drag.
- The `Move` helper re-running a css callback on every animation frame instead
  of letting CSS transition the value.
- Two-handle fill sizing reads the other handle's inline `style.left`/`top`
  (`:249`, `:255`).
- Container-level jQuery data `dragging` used as a cross-handler flag.

---

## Orbit

### Purpose

"An image and content carousel with animation support and many customizable
options." (`FS/docs/pages/orbit.md:3`). "Please note that apart from Javascript,
Motion UI is a dependency for Orbit to work properly." (`orbit.md:18`)

### Markup contract

Full docs example (`orbit.md:30-72`):

```html
<div class="orbit" role="region" aria-label="Favorite Space Pictures" data-orbit>
  <div class="orbit-wrapper">
    <div class="orbit-controls">
      <button class="orbit-previous"><span class="show-for-sr">Previous Slide</span>&#9664;&#xFE0E;</button>
      <button class="orbit-next"><span class="show-for-sr">Next Slide</span>&#9654;&#xFE0E;</button>
    </div>
    <ul class="orbit-container">
      <li class="is-active orbit-slide">
        <figure class="orbit-figure">
          <img class="orbit-image" src="..." alt="Space">
          <figcaption class="orbit-caption">Space, the final frontier.</figcaption>
        </figure>
      </li>
      <li class="orbit-slide">...</li>
    </ul>
  </div>
  <nav class="orbit-bullets">
    <button class="is-active" data-slide="0">
      <span class="show-for-sr">First slide details.</span>
      <span class="show-for-sr" data-slide-active-label>Current Slide</span>
    </button>
    <button data-slide="1"><span class="show-for-sr">Second slide details.</span></button>
  </nav>
</div>
```

Elements the JS resolves (`FS/js/foundation.orbit.js:59-60`, `:106`, `:222`):
`.orbit-container` (option `containerClass`; the JS calls it `$wrapper`, not
`.orbit-wrapper`), `.orbit-slide` (`slideClass`), `.orbit-bullets button`
(`boxOfBullets`), `.orbit-next` / `.orbit-previous` (`nextClass`, `prevClass`).
Slides may hold any HTML (`orbit.md:175-195`).

State the JS toggles:

| Target | State | Source |
| --- | --- | --- |
| slide | `.is-active` (first slide gets it if none has it) | `orbit.js:71-73`, `:345`, `:352`, `:362-363` |
| slide | `.is-in` (non-Motion UI path only) | `:362-363` |
| slide | `.no-motionui` when `useMUI` is false | `:75-77` |
| slide | `aria-live="polite"` on the active slide after it animates in; removed from the leaving slide | `:348`, `:355`, `:362-363` |
| slide | `data-slide="<index>"` | `:147` |
| slide | inline `display: none` for every non-active, non-animating slide; `display: block` on the entering slide | `:149-152`, `:348` |
| slide | Motion UI classes during transition: `<anim class>`, `mui-enter`/`mui-leave`, `mui-enter-active`/`mui-leave-active`; removed on `transitionend` | `foundation.util.motion.js:9-10`, `:54-99` |
| `.orbit-container` | inline `height` = tallest slide, measured after images load | `orbit.js:142-161` |
| `.orbit-container` | `tabindex="0"` when `accessible` | `:95-97` |
| `.orbit` root | `id` (generated `<6>-orbit` if missing) and `data-resize="<id>"` | `:64-69` |
| nav buttons | `tabindex="0"` | `:223` |
| bullet | `.is-active`; the `[data-slide-active-label]` span (or the last "extra" span) is physically moved from the old bullet to the new one; old bullet is blurred | `:385-413` |
| root | jQuery data `clickedOn` (paused by click), `paused` (Timer) | `:205-207`, `timer.js:22`, `:37` |

### Options

From `Orbit.defaults` (`FS/js/foundation.orbit.js:424-552`):

| Option (`data-*`) | Type | Default | Meaning |
| --- | --- | --- | --- |
| `bullets` | boolean | `true` | look for and bind bullets `:431` |
| `navButtons` | boolean | `true` | bind next/previous buttons `:438` |
| `animInFromRight` | string | `'slide-in-right'` | Motion UI class `:445` |
| `animOutToRight` | string | `'slide-out-right'` | `:452` |
| `animInFromLeft` | string | `'slide-in-left'` | `:460` |
| `animOutToLeft` | string | `'slide-out-left'` | `:467` |
| `autoPlay` | boolean | `true` | start the Timer when more than one slide `:474`, `:91-93` |
| `timerDelay` | number (ms) | `5000` | time between slides `:481` |
| `infiniteWrap` | boolean | `true` | wrap from last to first and back `:488`, `:322-326` |
| `swipe` | boolean | `true` | bind `swipeleft`/`swiperight` on slides `:495`, `:192-201` |
| `pauseOnHover` | boolean | `true` | pause timer on `mouseenter`, resume on `mouseleave` unless paused by click `:502`, `:210-218` |
| `accessible` | boolean | `true` | `tabindex=0` on the container and keyboard handling on container and bullets `:509`, `:95-97`, `:242-259` |
| `containerClass` | string | `'orbit-container'` | `:516` |
| `slideClass` | string | `'orbit-slide'` | `:523` |
| `boxOfBullets` | string | `'orbit-bullets'` | `:530` |
| `nextClass` | string | `'orbit-next'` | `:537` |
| `prevClass` | string | `'orbit-previous'` | `:544` |
| `useMUI` | boolean | `true` | use Motion UI transitions; attribute form is `data-use-m-u-i="false"` (`orbit.md:314`) `:551` |

Docs show setting the animation names together via
`data-options="animInFromLeft:fade-in; animInFromRight:fade-in; animOutToLeft:fade-out; animOutToRight:fade-out;"`
(`orbit.md:262`). Available Motion UI transition classes listed in
`FS/docs/pages/motion-ui.md:112-123`: `slide-in-down|left|up|right`,
`slide-out-down|left|up|right`, `fade-in`, `fade-out` (plus hinge, scale, spin
in the same list).

### Events

Fired:

| Event | Payload | When | Source |
| --- | --- | --- | --- |
| `beforeslidechange.zf.orbit` | `[$curSlide, $newSlide]` | a target slide was found, before animating | `orbit.js:336` |
| `slidechange.zf.orbit` | `[$newSlide]` | fired synchronously right after the animation is started (the doc comment says "finished animating in", the code does not wait); also from `_reset()` | `:372`, `:292` |
| `timerstart.zf.<ns>`, `timerpaused.zf.<ns>` | | from the Timer util; `<ns>` is the first key of `$element.data()`, in practice `orbit` | `foundation.util.timer.js:4`, `:30`, `:40` |
| `init.zf.orbit`, `destroyed.zf.orbit` | | lifecycle | core |

Listened for (`orbit.js:179-261`):

| Event | On | Handler |
| --- | --- | --- |
| `resizeme.zf.trigger` | root | re-measure container height |
| `swipeleft.zf.orbit` / `swiperight.zf.orbit` | slides | next / previous |
| `click.zf.orbit` | slides (autoPlay only) | toggle `clickedOn` and pause/start the timer |
| `mouseenter.zf.orbit` / `mouseleave.zf.orbit` | root (pauseOnHover) | pause / start unless `clickedOn` |
| `click.zf.orbit touchend.zf.orbit` | next/previous buttons | `changeSlide(isNext)` |
| `click.zf.orbit touchend.zf.orbit` | bullets | `changeSlide(dir, $slide, idx)` using `data-slide`; ignored on the active bullet |
| `keydown.zf.orbit` | container and bullets | `Keyboard.handleKey(e, 'Orbit', ...)` |

### Public methods

| Method | What it does | Lines |
| --- | --- | --- |
| `geoSync()` | create a `Timer` (`duration: timerDelay, infinite: false`, callback `changeSlide(true)`) and start it | `113-125` |
| `changeSlide(isLTR, chosenSlide?, idx?)` | pick next/prev (respecting `infiniteWrap`) or the chosen slide; bail if the current slide is mid-animation (class contains `mui`); fire `beforeslidechange`; update bullets; animate (Motion UI) or hide/show; restart the timer; fire `slidechange` | `309-374` |
| `_reset()` | unbind, restart timer, strip `is-active is-in aria-live` from all slides, show the first, fire `slidechange`, reset bullets; used for re-init | `266-299` |
| `_destroy()` | unbind everything and **hide the whole element** | `419-421` |
| `_updateBullets(idx)` | move `.is-active` and the active-label span | `385-413` |

Direction semantics (`:317-318`): `isLTR === true` means the new slide enters
with `animInFromRight` and the old one leaves with `animOutToLeft`.

### Keyboard and ARIA behaviour

Registered with `Keyboard.register('Orbit', ...)` (`orbit.js:38-47`):

| Key (ltr) | Command |
| --- | --- |
| ArrowRight | `next` |
| ArrowLeft | `previous` |

RTL swaps them. The handler is bound on `.orbit-container` (made focusable
with `tabindex="0"`) and on the bullets; when a bullet had focus, focus moves
to the newly active bullet (`:252-256`). No Home/End, no Space/Enter pause
toggle, no Escape.

ARIA: the docs put `role="region"` and `aria-label` on the root by hand
(`orbit.md:121-128`); the JS adds `aria-live="polite"` to the active slide.
It does not add `aria-roledescription`, `aria-current` on bullets, tab/tabpanel
roles, or a pause control; autoplay does not stop on keyboard focus (only hover
and click), and `aria-live` stays `polite` while auto-rotating.

Accessibility flag: `accessible: true` gates only the `tabindex="0"` on the
container and the keydown bindings (`:95-97`, `:242-259`).

### Dependencies

`orbit.js:1-8`: Keyboard, Motion (`animateIn`/`animateOut`), Timer,
ImageLoader (`onImagesLoaded` before the first height measurement, `:79-83`),
Touch (`Touch.init($)`, `:34`; swipe events come from `$.spotSwipe`, horizontal
only, `moveThreshold: 75` px within `timeThreshold: 200` ms,
`foundation.util.touch.js:32-58`, `:86-87`), core utils (`GetYoDigits`).
`resizeme.zf.trigger` needs the Triggers global listeners, which Orbit does not
initialise itself (`Triggers.init` is not imported). Motion UI is an external
package (`motion-ui ^2.0.5`, `FS/package.json`) that provides the transition
classes and the `mui-enter`/`mui-leave` base rules.

Timer semantics (`foundation.util.timer.js`): `start()` schedules `setTimeout`
for the remaining time (full `duration` on first start or after `restart()`),
`pause()` records the remaining time so a resume continues where it left off
(`:33-41`), `restart()` resets to the full duration (`:11-15`). `isPaused` is
read by Orbit before restarting after a slide change (`orbit.js:356`, `:364`).

### Sass configuration that shapes behaviour

`FS/scss/components/_orbit.scss` (included at `FS/scss/foundation.scss:132`):

- `.orbit-container { position: relative; height: 0; overflow: hidden; list-style: none }`
  (`:59-65`) - "Prevent FOUC by not showing until JS sets height". Without the
  JS height measurement nothing is visible.
- `.orbit-slide { width: 100%; position: absolute }` and
  `.orbit-slide.no-motionui.is-active { top: 0; left: 0 }` (`:68-78`).
- Everything else (`$orbit-bullet-*`, `$orbit-caption-*`, `$orbit-control-*`,
  `$orbit-control-zindex: 10`) is theming.
- The docs page front matter carries `mui: true` (`orbit.md:6`), flagging the
  Motion UI stylesheet requirement.

### Behaviour that only jQuery makes easy

- Motion UI transitions driven by class juggling with two `requestAnimationFrame`
  ticks, a forced reflow, and a one-shot `transitionend`
  (`foundation.util.motion.js:54-99`).
- `$.spotSwipe` synthetic `swipeleft`/`swiperight` events.
- `.hide()`/`.show()` inline display management for slides.
- Physically detaching and re-appending the "Current Slide" span between
  bullets (`orbit.js:409-412`).
- `onImagesLoaded` re-creating `Image` objects to detect load (`foundation.util.imageLoader.js:8-40`).
- `_destroy()` hiding the element.
- Height measurement via `getBoundingClientRect` of every slide, re-run on the
  debounced global resize.

---

## Equalizer

### Purpose

"Equalizer makes it dead simple to give multiple items equal height."
(`FS/docs/pages/equalizer.md:3`)

### Markup contract

Docs example (`equalizer.md:21-37`):

```html
<div class="grid-x grid-margin-x" data-equalizer data-equalize-on="medium" id="test-eq">
  <div class="cell medium-4">
    <div class="callout" data-equalizer-watch>
      <img src= "assets/img/generic/square-1.jpg">
    </div>
  </div>
  <div class="cell medium-4">
    <div class="callout" data-equalizer-watch>
      <p>Pellentesque habitant morbi tristique senectus et netus et, ante.</p>
    </div>
  </div>
  ...
</div>
```

Nesting (`equalizer.md:53-68`): `data-equalizer="foo"` on the container and
`data-equalizer-watch="foo"` on its children; an inner container uses another
name. Resolution: if `data-equalizer` has a value, watched elements are
`[data-equalizer-watch="<value>"]`; if that finds nothing (or the value is
empty) every `[data-equalizer-watch]` descendant is used
(`FS/js/foundation.equalizer.js:36-41`).

By row (`equalizer.md:117-123`): `data-equalize-by-row="true"` on the container.

No CSS classes. State the JS writes:

| Target | State | Source |
| --- | --- | --- |
| container | `data-resize="<id>"` and `data-mutate="<id>"` (id = equalizer name or generated `<6>-eq`) | `equalizer.js:42-43` |
| watched elements | inline `height: <max>px` after equalizing; `height: auto` when stacked, below breakpoint, single-item row, or on destroy | `:229`, `:264`, `:123`, `:148`, `:255`, `:284` |

### Options

From `Equalizer.defaults` (`equalizer.js:291-313`):

| Option (`data-*`) | Type | Default | Meaning |
| --- | --- | --- | --- |
| `equalizeOnStack` | boolean | `false` | if false and the first two watched elements are on different rows (`getBoundingClientRect().top` differs), heights go back to `auto` `:163-168`, `:145-151` |
| `equalizeByRow` | boolean | `false` | group by `offset().top` and equalize per row; rows with a single element get `auto` `:189-213`, `:246-276` |
| `equalizeOn` | string | `''` | breakpoint expression for `MediaQuery.is()` (`'medium'`, `'medium up'`, `'medium only'`, `'medium down'`, `foundation.util.mediaQuery.js:180-201`); below it events are unbound and heights reset `:118-131` |

### Events

Fired on the container:

| Event | When | Source |
| --- | --- | --- |
| `preequalized.zf.equalizer` | before heights are applied (both modes) | `equalizer.js:227`, `:250` |
| `postequalized.zf.equalizer` | after heights are applied | `:235`, `:275` |
| `preequalizedrow.zf.equalizer` / `postequalizedrow.zf.equalizer` | around each row in by-row mode | `:262`, `:270` |
| `init.zf.equalizer`, `destroyed.zf.equalizer` | lifecycle | core |

Listened for (`equalizer.js:103-112`, `:57`):

| Event | On | Handler |
| --- | --- | --- |
| `resizeme.zf.trigger`, `mutateme.zf.trigger` | container (when it has no nested equalizer) | `_reflow()` |
| `postequalized.zf.equalizer` | container (when it has a nested equalizer): bubbled from the child, ignored if `e.target` is itself | `_reflow()` so the parent re-measures after the child |
| `changed.zf.mediaquery` | window (when `equalizeOn`) | `_checkMQ()` |

`resizeme.zf.trigger` comes from the Triggers util: a window `resize`
debounced 250 ms sets `data-events="resize"` on every `[data-resize]` node
collected at load, and a MutationObserver on those nodes turns the attribute
change into the element-level event (`foundation.util.triggers.js:105-113`,
`:167-172`, `:181-222`, `:235-241`). `mutateme.zf.trigger` fires for `childList`
mutations and `style` attribute changes anywhere inside a `[data-mutate]`
subtree (`:186-213`).

### Public methods

| Method | What it does | Lines |
| --- | --- | --- |
| `getHeights(cb)` | set each watched height to `auto`, collect `offsetHeight`, call `cb(heights)` | `175-182` |
| `getHeightsByRow(cb)` | same, grouped into rows by `offset().top`, each group ending with its max | `189-213` |
| `applyHeight(heights)` | fire `preequalized`, set all to max, fire `postequalized` | `221-236` |
| `applyHeightByRow(groups)` | per-row version with row events | `246-276` |
| `_reflow()` | stacked check, then one of the two paths | `145-157` |
| `_destroy()` | unbind, heights to `auto` | `282-285` |

Images: the first reflow waits for `onImagesLoaded` on any `<img>` inside the
container (`:53`, `:62-66`).

### Keyboard and ARIA behaviour

None. The plugin sets no ARIA attributes and handles no keys.

### Dependencies

`equalizer.js:1-5`: MediaQuery (`_init`, `is`), ImageLoader, core utils,
Plugin. Relies on the Triggers global listeners for `resizeme`/`mutateme`
without importing Triggers. No other plugin.

### Sass configuration that shapes behaviour

None specific to Equalizer (no `_equalizer.scss`). The `equalizeOn`
breakpoint names come from the Sass `$breakpoints` map through the
`.foundation-mq` mechanism described under Interchange.

### Behaviour that only jQuery makes easy

- Row grouping by `$(el).offset().top` (`:198`).
- Inline `height` writes and reads of `offsetHeight` on every resize/mutation.
- Nested coordination through jQuery event bubbling of `postequalized`.
- MutationObserver-driven `mutateme` on `style` and child-list changes.
- The whole plugin predates flexbox/grid `align-items: stretch`; whether any
  of it carries over is for the decision ticket.

---

## Interchange

### Purpose

"Interchange uses media queries to dynamically load responsive content that is
appropriate for the user's device." (`FS/docs/pages/interchange.md:3`)

### Markup contract

Images (`interchange.md:242`):

```html
<img data-interchange="[assets/img/interchange/small.jpg, small], [assets/img/interchange/medium.jpg, medium], [assets/img/interchange/large.jpg, large]">
```

HTML partials (`interchange.md:268`):

```html
<div data-interchange="[assets/partials/interchange-default.html, small], [assets/partials/interchange-medium.html, medium], [assets/partials/interchange-large.html, large]"></div>
```

Background images (`interchange.md:280`): same as above on a non-`<img>` with
image paths.

Rule syntax: a comma-separated list of `[path, media_query]`
(`interchange.md:247-253`). Parsing (`FS/js/foundation.interchange.js:124-155`):
the attribute string is split with `/\[.*?, .*?\]/g`; each rule is stripped of
its brackets and split on `', '`; the last piece is the query, the rest are
joined **with an empty string** to form the path (so a path containing `, `
loses that separator); a query that is a key of `Interchange.SPECIAL_QUERIES`
is replaced by its media query string. "Interchange evaluates rules in order,
and the last rule to match will be used. For this reason, you should order
your rules from smallest screen to largest screen." (`interchange.md:255-257`;
implementation `:70-86`).

Replacement type (`:163-200`), from option `type` or auto-detected:
`IMG` element -> `src`; path matching `/\.(gif|jpe?g|png|svg|tiff)([?#].*)?/i`
-> `background` (`background-image: url(...)`, parentheses percent-encoded);
otherwise `html` (`$.get(path)`, `.html(response)`, then
`$(response).foundation()` to initialise plugins in the loaded markup).

No CSS classes. State the JS writes:

| Target | State | Source |
| --- | --- | --- |
| element | `id` (generated `<6>-interchange` if missing) and `data-resize="<id>"` | `interchange.js:44-48` |
| element | `src`, or inline `background-image`, or inner HTML | `:179-199` |
| plugin | `currentPath` guard so the same path is not re-applied; for `src` it is set on the image `load` event, for `html` after the request, for `background` never | `:164`, `:181`, `:198` |

### Options

From `Interchange.defaults` (`interchange.js:221-241`):

| Option (`data-*`) | Type | Default | Meaning |
| --- | --- | --- | --- |
| `rules` | array of `"[path, query]"` strings or null | `null` | programmatic rules; when null the `data-interchange` attribute is parsed `:128-135`; docs `interchange.md:308-321` |
| `type` (`data-interchange-type`) | `'auto'`, `'src'`, `'background'`, `'html'` | `'auto'` | replacement type; invalid values warn and fall back to `auto` `:94-102` |

Named media queries (`Interchange.SPECIAL_QUERIES`, `:243-247`, extended at init
with every Foundation breakpoint, `:109-116`):

| Name | Media query | Source |
| --- | --- | --- |
| `landscape` | `screen and (orientation: landscape)` | `:244` |
| `portrait` | `screen and (orientation: portrait)` | `:245` |
| `retina` | `only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (min--moz-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min-device-pixel-ratio: 2), only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx)` | `:246` |
| `small` | `only screen and (min-width: 0em)` | `mediaQuery.js:102-109` |
| `medium` | `only screen and (min-width: 40em)` | same |
| `large` | `only screen and (min-width: 64em)` | same |
| `xlarge` | `only screen and (min-width: 75em)` | same |
| `xxlarge` | `only screen and (min-width: 90em)` | same |

The breakpoint values come from Sass: `$breakpoints: (small: 0, medium: 640px,
large: 1024px, xlarge: 1200px, xxlarge: 1440px)`
(`FS/scss/settings/_settings.scss:111-117`), serialised to
`small=0em&medium=40em&large=64em&xlarge=75em&xxlarge=90em` by
`-zf-bp-serialize` (`FS/scss/util/_breakpoint.scss:201-208`), emitted as
`.foundation-mq { font-family: '...' }` (`FS/scss/_global.scss:143-146`), and
read back by `MediaQuery._init()` from the computed `font-family` of a
`<meta class="foundation-mq">` it appends to `<head>`
(`FS/js/foundation.util.mediaQuery.js:89-114`). Every key becomes
`only screen and (min-width: <value>)`. The docs table
(`interchange.md:289-298`) writes `small` as `screen and (min-width: 0em)`; the
source produces `only screen and (min-width: 0em)`. Custom names are added by
assigning to `Foundation.Interchange.SPECIAL_QUERIES` (`interchange.md:300-304`).

### Events

Fired:

| Event | When | Source |
| --- | --- | --- |
| `replaced.zf.interchange` | for `src`: right after setting `src` (not after load); for `background`: right after setting the style; for `html`: after the partial is inserted | `interchange.js:166`, `:180-182`, `:187-189`, `:193-196` |
| `init.zf.interchange`, `destroyed.zf.interchange` | lifecycle | core |

Listened for: `resizeme.zf.trigger` on the element -> `_reflow()` (`:61-63`).
Matching uses `window.matchMedia(rule.query).matches` on every reflow
(`:77`); there are no `MediaQueryList` change listeners.

### Public methods

| Method | What it does | Lines |
| --- | --- | --- |
| `replace(path)` | apply the path using the resolved type; no-op if `currentPath === path` | `163-207` |
| `_reflow()` | evaluate rules, call `replace` with the last match | `70-86` |
| `_destroy()` | unbind `resizeme.zf.trigger` | `213-215` |

### Keyboard and ARIA behaviour

None.

### Dependencies

`interchange.js:1-5`: MediaQuery (`_init`, `queries`), Triggers (`Triggers.init($)`
at `:30`; `resizeme` via `data-resize`), core utils, Plugin. jQuery `$.get` for
partials and `$(response).foundation()` re-initialisation (`:193-199`), which
couples the `html` type to the whole jQuery plugin registry.

### Sass configuration that shapes behaviour

Only the `$breakpoints` map, through the `.foundation-mq` bridge described
above. `$breakpoint-classes` and `$print-breakpoint` (`_settings.scss:125-126`)
do not affect Interchange.

### Behaviour that only jQuery makes easy

- `$.get` + `.html()` partial loading and `$(response).foundation()`.
- Global `[data-resize]` collection at window load
  (`foundation.util.triggers.js:167-172`): elements initialised after load never
  receive `resizeme.zf.trigger`, which also affects Equalizer and Orbit.
- `background-image` string building with manual `(`/`)` encoding.
- The `src` type sets `replaced` before the image has loaded and only records
  `currentPath` on `load`, so a resize during loading re-sets `src`.
- Native `<picture>`/`srcset`/`sizes` cover the image and background cases
  without JS; the docs do not mention them.

---

## Cross-plugin notes for the decision tickets

- All five read options from `data-*` via jQuery `.data()`, so the Angular
  input names in camelCase are already the option names listed above.
- `resizeme.zf.trigger` / `mutateme.zf.trigger` (Equalizer, Orbit, Interchange)
  depend on the Triggers util's load-time snapshot of `[data-resize]` nodes and
  a MutationObserver on a `data-events` attribute
  (`foundation.util.triggers.js:167-222`). `ResizeObserver` and
  `matchMedia().addEventListener('change')` are the platform replacements.
- The Timer util (Orbit) is a pausable `setTimeout` with remaining-time
  bookkeeping (`foundation.util.timer.js`).
- ImageLoader (Orbit, Equalizer) waits for `complete && naturalWidth` or a new
  `Image` load/error (`foundation.util.imageLoader.js:8-40`); errors count as
  loaded.
- Motion UI classes (`slide-in-*`, `slide-out-*`, `fade-in`, `fade-out`) and the
  `mui-enter`/`mui-leave` mechanics are the only animation contract Orbit has;
  Slider uses the `Move` rAF helper plus the Sass transition instead.
