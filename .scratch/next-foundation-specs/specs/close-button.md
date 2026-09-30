# Spec: Close Button

Ticket: [Spec: Close Button](../issues/83-spec-close-button.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Written under the class rule ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)) and the Variant typing rules ([ADR 0040](../adr/0040-variant-input-types.md)).

## Problem Statement

A developer on Foundation for Sites who needs a control that makes something go away writes Foundation's Close Button markup: a `<button>` with the `.close-button` class, the multiplication sign in a `<span aria-hidden="true">`, and an `aria-label`. Close Button is a CSS-only component: it ships Sass and one class, and its docs say plainly that the close button "doesn't close elements" on its own; Foundation's JavaScript does that through `data-close` and `data-closable`. The markup contract leaves the hard parts to the author:

- The glyph is hidden from assistive technology, so the button has no accessible name unless the author remembers `aria-label`. Foundation's own Toggler docs show `<button class="close-button" data-close>&times;</button>`, whose only name is the multiplication sign.
- A `<button>` inside a form submits it unless the author writes `type="button"`.
- Foundation sizes the button by its glyph. At a 16 px font size the medium close button is 18.69 by 32 CSS px and the small one 14.02 by 24 px; under a 14 px parent the small one is 12.27 by 21 px (measured in Chromium, Firefox, and WebKit). Every one is narrower than the 24 px minimum target of WCAG 2.2 success criterion 2.5.8, so it passes only through the spacing exception, which Foundation's own Off-canvas docs break by placing the button over the first menu link.
- Its colour, `$dark-gray` (`#8a8a8a`), is the only visual that identifies the control. It reaches 3.42:1 on the page background, but 2.82:1 to 2.87:1 on Foundation's primary, secondary, and alert callouts and 2.77:1 on the default off-canvas panel, under the 3:1 of 1.4.11, and axe cannot see it: it marks the glyph's contrast incomplete.
- Under the library's class rule the developer writes no Foundation class at all, so `.close-button` and its `.small` and `.medium` sizes need an Angular home.

A server-rendered application adds the usual second problem: whatever the Angular layer does must already be right in the server HTML, must not break hydration, and must leave the button a working native button before hydration and inside dehydrated `@defer` blocks.

## Solution

One attribute directive, `nfsCloseButton`, on the native `<button>` the developer already writes. It binds Foundation's `.close-button` class, sets the size class from a typed `size` input, and defaults the button to `type="button"` while keeping an explicit `type`. It closes nothing, as Foundation's Close Button closes nothing: the closing comes from a directive placed beside it, the Triggers utility's `nfsClose`, or from the developer's own `(click)` handler. The developer names every close button with words that say what it closes (`aria-label`, `aria-labelledby`, or text hidden for sighted users), keeps the glyph in `aria-hidden="true"`, and never puts `nfsButton` on the same element, whose `.button` class contract collides with `.close-button`. It declares no listener, so everything it does is a host binding already present in server HTML.

The `nfs-close-button` Library mixin gives every close button a 24 by 24 CSS px minimum box, so the button meets 2.5.8 by size wherever it sits. The box is transparent, so the rule draws nothing and leaves the glyph's size unchanged, and it replaces the Off-canvas spec's panel-scoped rule. The mixin also writes the Variant property that the Variant declaration file's generator reads. The close button's colours must reach 3:1 against the page background, which Foundation's defaults do; containers that paint their own background under a close button (Callout, Reveal, Off-canvas) state in their own specs the colours that pass there.

## User Stories

1. As an application developer, I want to put `nfsCloseButton` on a native `<button>` and get Foundation's `.close-button` look, so that I write no Foundation class.
2. As an application developer, I want the button to default to `type="button"`, so that a close button inside a form never submits it.
3. As an application developer, I want `type="submit"` to work as written, so that a close button in a `<form method="dialog">` closes its dialog natively.
4. As an application developer, I want to bind `[type]` from component state, so that one close button can switch type when I need it.
5. As an application developer, I want `size="small"` to give me Foundation's small close button, so that I use the size names Foundation documents.
6. As an application developer, I want no `size` to give me the size my `$closebutton-default-size` names, so that my Sass settings stay the default look.
7. As an application developer who adds a `large` entry to `$closebutton-size`, I want `size="large"` to compile once my Variant declaration file lists it, so that my own sizes are typed like Foundation's.
8. As an application developer, I want a misspelt or removed size name to fail to compile, so that a typo never ships a button without its size class.
9. As an application developer, I want a Foundation class name passed as a size to fail to compile, so that the class rule holds for input values too.
10. As an application developer, I want to put the Triggers utility's bare `nfsClose` beside `nfsCloseButton` inside a Reveal, an Off-canvas panel, or a Toggler, so that the button closes the Openable it sits in.
11. As an application developer, I want `[nfsClose]="ref"` and `[nfsCloseResult]` to work beside `nfsCloseButton`, so that a close button can close a named Openable and report a result.
12. As an application developer, I want a close button with my own `(click)` handler and no Trigger, so that I can remove content with `@if`.
13. As an application developer, I want `nfsCloseButton` alone to close nothing, so that it behaves as Foundation documents and never guesses a target.
14. As an application developer, I want the docs and the directive's JSDoc to require an accessible name that says what the button closes, so that a screen reader user hears what activating it does.
15. As an application developer, I want the docs to say that a symbol alone never names the button, so that Foundation's unnamed Toggler example does not reach production announced as "times".
16. As an application developer, I want the docs to say that `nfsButton` and `nfsCloseButton` never share an element, so that the two class contracts never collide.
17. As an application developer, I want the name to come from `aria-label`, `aria-labelledby`, or text hidden for sighted users, so that I can name the button any way HTML allows.
18. As a screen reader user, I want the close button announced as a button with a name that says what it closes, so that I know what activating it does.
19. As a screen reader user, I want the glyph kept out of the name, so that I do not hear "times" or "multiplication sign".
20. As a keyboard user, I want the close button in the tab order with the browser's own focus indicator, so that I can see and reach it.
21. As a keyboard user, I want Enter and Space to activate it, so that it works like every other button.
22. As a pointer or touch user, I want every close button to accept presses across at least 24 by 24 CSS px at every size and font size, so that I can hit it reliably.
23. As a sighted user, I want the glyph to stay where Foundation draws it, give or take a few pixels, so that the 24 px minimum changes nothing I notice.
24. As a user with low vision, I want the glyph to contrast at least 3:1 with what it sits on, at rest, on hover, and on focus, so that I can find the control.
25. As an application developer, I want the spec to state that `$closebutton-color` and `$closebutton-color-hover` must reach 3:1 against my page background, so that a theme of my own keeps the glyph visible.
26. As an application developer, I want each container that paints its own background (Callout, Reveal, Off-canvas) to state the close-button colours that pass on that background, so that the requirement covers where the button actually sits.
27. As an application developer, I want my Variant declaration file generated from my Sass settings and the `nfs-close-button` include stated as required, so that my types offer only the sizes my compiled CSS has and the 24 px floor is always present.
28. As a keyboard user, I want focus to go back to the control that opened a dialog or panel when its close button closes it, so that I do not lose my place (the Openable's job, stated here so developers know who owns it).
29. As an application developer who removes content with its close button, I want the docs to tell me to move focus to a logical next element, so that focus does not fall to the page body.
30. As a developer of a server-rendered application, I want the server HTML to carry `.close-button`, the size class, and `type`, so that the first paint is final and hydration changes nothing.
31. As a developer of a server-rendered application, I want a close button clicked before hydration never to submit a surrounding form, so that nothing happens behind the user's back.
32. As a developer of a server-rendered application, I want a close button with a Trigger beside it to replay a pre-hydration click once, so that an early click still closes its Openable.
33. As a developer using `@defer (hydrate never)`, I want a close button there to stay a styled native button, so that static regions look right without JavaScript.
34. As a developer of a zoneless application, I want the directive to need no zone, so that it works with zoneless change detection.
35. As an application developer, I want to import the directive from its own entry point, so that a `@defer` block can split it with its container.
36. As a library maintainer, I want every behaviour asserted through roles, names, attributes, classes, and geometry in stories, browser-level tests, a server-render smoke test, and e2e, so that regressions surface at the layer that owns them.

## Implementation Decisions

### Foundation contract

Close Button has no Plugin, no `defaults` object, no `data-*` Options, no events, and no methods. Its whole contract is Foundation's close-button Sass partial, its docs page, and the markup the docs show. Dropped options: none, because there are none.

| Feature | Class or markup | Source of the names | Notes |
| --- | --- | --- | --- |
| Close button | `.close-button` | `@mixin foundation-close-button` | Structural class; `position: absolute` at `$closebutton-position` (`right top`) with `z-index: $closebutton-z-index` (10); colour `$closebutton-color` (`$dark-gray`), and `$closebutton-color-hover` (`$black`) on `:hover` and `:focus`; `cursor: pointer`; needs a positioned container |
| Sizes | `.small`, `.medium` | the keys of `$closebutton-size` (`small: 1.5em`, `medium: 2em`) | Open Variant family. Each key needs a matching key in `$closebutton-offset-horizontal` and `$closebutton-offset-vertical` unless those are numbers, or Foundation's `-zf-get-size-val` returns nothing and the compile stops. A number `$closebutton-size`, which the setting's own docs allow, does not compile in 6.9.0 ("Expected identifier"). The key `$closebutton-default-size` names (`medium`) is also extended into `.close-button` itself, so the default size needs no class |
| Glyph | `<span aria-hidden="true">&times;</span>` | Docs | Consumer content; the docs name the button with `aria-label` ("Close alert", "Dismiss alert") |
| Focus outline | `disable-mouse-outline` | `[data-whatinput='mouse'] &` | Depends on the what-input library that Foundation's JavaScript loads; see Further Notes |
| Closing | `data-close` on the button, `data-closable` on its container | Foundation's core Triggers utility, not the Close Button | Replaced by the Triggers utility's `nfsClose`, a Toggler in visibility mode, or `@if` ([Spec: Triggers (shared utility)](../issues/54-spec-triggers.md)) |

The box is transparent: Foundation's global `button` reset sets `padding: 0`, `border: 0`, `background: transparent`, and `line-height: 1`, so the only thing drawn is the glyph, centred in a box as wide as the glyph and as tall as its font size.

Docs conventions kept or corrected: `type="button"` (kept, now the default); `aria-label` naming what the button closes (kept, now required documented usage); the glyph in `aria-hidden="true"` (kept; a symbol alone never names the button); the Toggler docs' unnamed `<button class="close-button" data-close>&times;</button>` (corrected: the recipes name every close button).

### CSS class to directive mapping

| Foundation class | Angular | Type, Sass setting, and Variant registry | Value shape | Class each value sets | Variant property |
| --- | --- | --- | --- | --- | --- |
| `.close-button` | `NfsCloseButton` (`button[nfsCloseButton]`), static host class | - | - | `close-button` | - |
| `.small`, `.medium`, and every other key of `$closebutton-size` | `size` Variant input of `NfsCloseButton` | `NfsCloseButtonSize` over `$closebutton-size` and its registry `NfsClosebuttonSizeOverrides` (Open Variant family) | a name | the name itself (`size="small"` sets `.small`); unset sets none, so `$closebutton-default-size` is the look; an explicit default name still sets its class | `--nfs-closebutton-size` (`small medium` by default) |
| `.callout` and its colour class (another family's: the Callout's) | `NfsCallout` (`[nfsCallout]`) with its `color` Variant input, around the close button | The [Spec: Callout](../issues/89-spec-callout.md)'s | - | `callout` | - |
| `.is-hidden` (another family's: the Toggler's State class) | `NfsToggler`'s host binding in Visibility mode, on the dismissible callout | The [Spec: Toggler](../issues/17-spec-toggler.md)'s | - | - | - |
| `.reveal` (another family's: the Reveal's) | `NfsReveal` (`dialog[nfsReveal]`) around the close button | The [Spec: Reveal](../issues/18-spec-reveal.md)'s | - | `reveal` | - |

State classes: none. Foundation's Close Button has no State class; hover and focus are the `:hover` and `:focus` pseudo-classes. No class is left for the consumer to write (ADR 0039), and the glyph's `span` carries none. Foundation has no responsive close-button size, so `size` takes no Breakpoint query or rules object.

### Hierarchy and DI shape

```
button[nfsCloseButton]      NfsCloseButton (standalone directive, no template)
```

- One directive, with no parent, no children, no Parent token, and no host directives. Its one provider, `{provide: nfsCloseButtonToken, useExisting: NfsCloseButton}`, is a lightweight token the [Spec: Callout](../issues/89-spec-callout.md)'s content query looks for, so a callout reserves room for its close button without keeping this directive in its bundle; nothing injects it.
- Closing is composition by placement: the Triggers utility's `nfsClose`, `[nfsClose]`, and `[nfsCloseResult]` sit beside `nfsCloseButton` on the same element, never inside it through `hostDirectives` (D2). The two bind different things: `nfsCloseButton` owns its classes and `type`; `nfsClose` renders no ARIA and declares the `click` listener.
- No Defaults token: Close Button has no Options, and a Defaults token never holds a Variant input's default (building-blocks 1.4).
- Injection: none.
- Entry point: `ngx-foundation-sites/close-button`, so a consumer's `@defer` can split it. `NfsCloseButtonSize` and `NfsClosebuttonSizeOverrides` live in the primary entry point `ngx-foundation-sites` and are used here as types only. `nfsCloseButtonToken`, an `InjectionToken` typed with `import type`, is exported beside the directive.

### API: `NfsCloseButton`

Selector `button[nfsCloseButton]`; `exportAs: 'nfsCloseButton'`; standalone; no template.

```ts
type NfsCloseButtonSize = NfsOverridableStringUnion<'small' | 'medium', NfsClosebuttonSizeOverrides>;

class NfsCloseButton {
  readonly size: InputSignal<NfsCloseButtonSize | undefined>; // default undefined: no class
  readonly type: InputSignal<'button' | 'submit' | 'reset'>; // default 'button'
}
```

| Input | Type | Default | Foundation equivalent | Delta |
| --- | --- | --- | --- | --- |
| `size` | `NfsCloseButtonSize`, declared with explicit type arguments that name the alias; no transform | `undefined`, which sets no class | `.close-button.small`, `.close-button.medium`; `$closebutton-size`, `$closebutton-default-size` | New. The JSDoc names the class template `.close-button.<size>` and the setting |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Docs: `type="button"` on every close button | New default. HTML's missing-value default for `<button type>` is the Auto state, which submits a form |

- Models, outputs, and methods: none. The native `click` event is the API, and `focus()` is the native method.

Host bindings, all on signal state:

| Binding | Value |
| --- | --- |
| static `class` | `close-button` |
| `[class]` | the `size` value when it is one class token, otherwise nothing; the static class and the consumer's own classes stay, because Angular combines static and bound classes |
| `[attr.type]` | `type()` |

- Attribute ownership: `type` belongs to the directive; a static `type` attribute or a `[type]` binding feeds the input. A consumer `[attr.type]` binding loses to the host binding, and the docs never show it.
- Documented usage, which the directive's JSDoc states:
  1. Every close button has an accessible name that says what it closes: an `aria-label` (for example `aria-label="Close alert"`), an `aria-labelledby` that references text, text outside `aria-hidden="true"` subtrees, or the `alt` of an `img` inside it (D6). The name is present from the first render, because assistive technology reads the dehydrated button in the server HTML.
  2. The glyph stays inside `aria-hidden="true"`, and a symbol alone (the multiplication sign, a dash) never names the button (D6).
  3. `nfsButton` never sits on the same element: `.close-button` and `.button` are separate class contracts (D7).
  4. `@include nfs-close-button;` is required wherever `nfsCloseButton` is used: it carries the 2.5.8 floor and the Variant property (D10).

### Comparison with Angular Material (22.2)

Material has no close-button component. The same job is split between `mat-icon-button` (the look, with a 48 px touch target element), `[mat-dialog-close]` (the closing, a `type` input defaulting to `button`, and an optional `aria-label` input), and `matChipRemove` (a chip's remove control, which removes its own chip).

| Concern | Material | `NfsCloseButton` |
| --- | --- | --- |
| Selector and kind | `[mat-dialog-close], [matDialogClose]`, a directive on any element; `mat-icon-button`, a component | `button[nfsCloseButton]`, a directive with no template |
| Look | `mat-icon-button` with a `mat-icon` | Foundation's `.close-button` and the consumer's glyph |
| Closing | Built into `[mat-dialog-close]` and `matChipRemove` | Never built in; `nfsClose` or a handler beside it |
| `type` | `type` input, default `'button'` | `type` input, default `'button'` |
| Name | Optional `aria-label` input bound to `[attr.aria-label]` | Native `aria-label`, `aria-labelledby`, or content, which the docs require |
| Target size | A 48 px touch target element inside the component | A 24 px minimum box from the Library mixin |
| Result | `[mat-dialog-close]="result"` | `[nfsCloseResult]` on the Trigger beside it |
| Testing | `MatButtonHarness` | DOM-first assertions; no harness |

Borrowed: the `type` input and its `'button'` default from `MatDialogClose`. Not borrowed: closing inside the look directive (Foundation keeps the two apart, and so does the library, D2); an `aria-label` input (the native attribute already works on a native button); a template with a touch-target element (Foundation's box is transparent, so a box floor does the same job, D8).

### Implementation level and primitives

Implementation level: native platform. The native `<button>` gives the role, focus, Enter and Space activation, and the `type` contract. `@angular/aria` has no button pattern in 22.2, and `@angular/cdk` has nothing to add: the browser's `:focus-visible` heuristic already decides the focus ring. The Angular layer is three host bindings over two `input()` signals and one `computed` guard for the size class. No `effect`, no render callback, no listener, no timer, no observer.

Fallback: none needed. The one design risk, which way of meeting 2.5.8 the Accessibility gate can prove, was measured by this spec's ticket in three engines (D8).

### ARIA and keyboard

APG pattern: Button, as a command button. What the button closes follows its Openable's pattern: Dialog for a Reveal and for Off-canvas Modal mode, Disclosure for a Toggler.

| Element or state | Rendered semantics | Source |
| --- | --- | --- |
| `button[nfsCloseButton]` | Implicit role `button`; `type="button"` unless the consumer sets another | WHATWG HTML, the button element |
| Name | The consumer's `aria-label` ("Close alert", "Dismiss notice"), `aria-labelledby`, or text hidden for sighted users; the directive adds no name | Foundation Close Button docs; APG Dialog pattern |
| Glyph | `aria-hidden="true"` on the consumer's `span` | Foundation Close Button docs |
| With `nfsClose` | No `aria-expanded`, `aria-controls`, or `aria-haspopup`: `nfsClose` renders no ARIA | [Spec: Triggers (shared utility)](../issues/54-spec-triggers.md), D8 |
| Disabled | Native `disabled` when the consumer writes it; the directive has no disabled contract | HTML |

| Key | Result | Owner |
| --- | --- | --- |
| Tab, Shift+Tab | Reaches the button | Native |
| Enter, Space | Activates it: the Trigger or the consumer's handler runs | Native |
| Escape | Nothing from the close button; an overlay's Escape belongs to its Openable | Openable spec |

Focus: the directive moves no focus. When a bare `nfsClose` beside it closes the Openable around it, the Openable returns focus to the control that opened it (Triggers spec, 2.4.3). When a close button removes or hides its own container through the consumer's handler or a Toggler, the focused button disappears with it, so the consumer moves focus to a logical next element, as the APG's focus-persistence practice asks; the usage examples show it.

### WCAG 2.2 AA

The target is WCAG 2.2 level AA (user rule; ADR 0022). Each criterion below is a requirement with the layer that tests it; none is advice. Sizes were measured by this spec's ticket on Foundation 6.9.0's compiled CSS in Chromium, Firefox, and WebKit (Playwright 1.63, axe-core 4.13.0) and agree across the three to 0.01 px; ratios are the exact WCAG relative-luminance ratio, unrounded.

| Criterion | Requirement and how it is met | Foundation default | Test |
| --- | --- | --- | --- |
| 2.5.8 Target Size (Minimum) | Every close button is at least 24 by 24 CSS px, by size and not by the spacing exception (building-blocks 1.10). The `nfs-close-button` Library mixin emits `.close-button { min-width: 24px; min-height: 24px; }`; Foundation's `box-sizing: border-box` applies it to the border box. The box is transparent, so the floor draws nothing: the glyph keeps its size and moves toward the centre of the larger box, 2.67 px at the medium size and 5.0 px at the small size, plus 1.5 px down where a small button under a 14 px parent grows from 21 to 24 px tall. The floor holds under any `$closebutton-size`, offset, font size, or glyph, and in every container, so no container spec adds a target-size rule of its own. A transparent pseudo-element hit area was measured and rejected: it answers pointer hits 2 px outside the box in all three engines, but axe measures only the element's box, and still reports a close button over a link as incomplete (D8) | Fails the size test: medium 18.69 by 32 px and small 14.02 by 24 px at a 16 px font size, small 12.27 by 21 px under a 14 px parent. It passes only through the spacing exception, which Foundation's Off-canvas docs markup breaks: the button sits over the first menu link, and axe reports it incomplete there | Every play function asserts each close button's bounding box is at least 24 by 24; e2e measures it in three engines, the small button under a 14 px parent included; axe `target-size` in every story; the node-level Sass compile test asserts the rule |
| 1.4.11 Non-text Contrast | The glyph, the only visual that identifies the control, contrasts at least 3:1 with the surface behind it at rest (`$closebutton-color`) and on hover and focus (`$closebutton-color-hover`). The glyph spells no word and is hidden from the accessibility tree, so it is a graphical object; at 24 px and above it is also large text, for which 1.4.3 asks the same 3:1. Both colours reach 3:1 against `$body-background`, the surface wherever no container paints one (D9). A container that paints its own background under the button states the settings that pass on it in its own spec: the Reveal and Off-canvas specs do, and the [Spec: Callout](../issues/89-spec-callout.md) does, requiring `$closebutton-color: #767676` (at least 3.71:1 on every callout), because its primary, secondary, and alert backgrounds fail with Foundation's defaults. axe cannot enforce this criterion: it marks the glyph's contrast incomplete ("Element content is too short to determine if it is actual text content"), so the story gate does not catch a failing pair | Passes on the page: `#8a8a8a` on `#fefefe` is 3.42:1, the hover colour `#0a0a0a` 19.63:1. On Foundation's callout backgrounds (each palette colour through `scale-color` by `$callout-background-fade`): default 3.45, primary 2.84, secondary 2.87, alert 2.82, success 3.13, warning 3.14:1. On the default off-canvas panel (`$light-gray`): 2.77:1. The hover colour reaches at least 16.16:1 on all of them; a lighter `$closebutton-color: #aaaaaa` would reach only 2.30:1 on the page | The stories use the default and success callouts, which pass; axe marks the glyph incomplete, so the pair is the consumer's settings to keep |
| 4.1.2 Name, Role, Value | The role comes from the native button; the name is the consumer's, required by the docs and never the symbol alone (documented usage 1 and 2); there is no state, because `nfsClose` renders none | Passes when the Close Button docs markup is copied; the Toggler docs' `&times;` button is named only by the glyph | axe `button-name` in every story; every play function finds each close button by `getByRole('button', {name})` |
| 2.4.6 Headings and Labels | The name says what the button closes ("Close alert", "Dismiss notice"), as Foundation's docs do; the docs say so, and every story names its buttons that way | Passes in the Close Button and Callout docs | Play functions assert the names |
| 2.4.7 Focus Visible | The browser's own focus indicator shows on keyboard focus; the library removes no outline. Foundation's `disable-mouse-outline` removes it only under `[data-whatinput='mouse']`, which the what-input script sets and the library never loads. The floor widens the ring to the 24 px box | Passes | e2e: a screenshot comparison before and after Tab to the close button in `close-button--default` shows a focus indicator in three engines |
| 2.1.1 Keyboard | Native Enter and Space; the directive adds no key handling | Passes | Play functions (`userEvent.keyboard`); e2e real key presses |
| 2.4.3 Focus Order | Closing returns focus to the opener, which is the Openable's job; when a close button removes or hides its own container, the consumer moves focus to a logical next element | Foundation's `data-closable` fade leaves focus on a hidden button | The play functions of `close-button--closable` and `close-button--removable` assert where focus lands |
| 2.5.3 Label in Name | The glyph is not a visible text label, so a name from `aria-label` has nothing to match; a close button that shows visible text starts its name with that text | Passes | Covered by the `getByRole` names |

The axe gate in every story runs the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, plus `best-practice`) with `parameters.a11y.test = 'error'` (ADR 0018).

### Rendered HTML

Consumer markup, then the server HTML. The hydrated DOM equals the server HTML apart from the `jsaction` attribute, which a Trigger's listener adds and which is gone once the button has hydrated, as the Triggers spec shows. Class order is not significant.

```html
<!-- Foundation's docs example: the button alone closes nothing -->
<div nfsCallout>
  <button nfsCloseButton aria-label="Close alert">
    <span aria-hidden="true">&times;</span>
  </button>
  <p>Look at this close button!</p>
</div>
<div class="callout" data-nfs-close-button="">
  <button class="close-button" type="button" aria-label="Close alert">
    <span aria-hidden="true">&times;</span>
  </button>
  <p>Look at this close button!</p>
</div>

<!-- Small, closing the Openable around it through a bare nfsClose -->
<button nfsCloseButton size="small" nfsClose aria-label="Dismiss notice">
  <span aria-hidden="true">&times;</span>
</button>
<button class="close-button small" type="button" aria-label="Dismiss notice" jsaction="click:;">
  <span aria-hidden="true">&times;</span>
</button>

<!-- Inside <form method="dialog">: an explicit submit type closes the dialog natively -->
<button nfsCloseButton type="submit" aria-label="Close notice">...</button>
<button class="close-button" type="submit" aria-label="Close notice">...</button>
```

The callout's own attributes belong to the [Spec: Callout](../issues/89-spec-callout.md) and are shown only to place the button; `nfsCallout` is the [Spec: Callout](../issues/89-spec-callout.md)'s directive.

### Animation

None. The directive inserts, removes, and animates nothing; Foundation's close-button partial declares no transition, and its hover colour change is instant. A container that hides when its close button is pressed animates through its own directive (a Toggler's typed Motion input, or `animate.leave` with the consumer's own keyframe class on an `@if` block, the Triggers spec's D17), under its own spec's reduced-motion rules.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the server HTML carries `.close-button`, the size class, and `type` exactly as the hydrated DOM does. The dehydrated button is a styled native button, and clicking it before hydration submits nothing, because it is `type="button"`.
- Before hydration: the directive touches no DOM outside host bindings, measures nothing, and starts no timer.
- Full and incremental hydration: the host binding values equal the server's, so hydration changes nothing; there is no structure to mismatch and no Hydration boundary of its own. With a Trigger beside it, the Trigger's rule applies: the close button and its Openable share one Hydration boundary.
- Event replay: `NfsCloseButton` declares no listener, adds no `jsaction`, and has nothing to replay. A Trigger beside it adds `jsaction="click:;"`, and a pre-hydration click replays through the Trigger once the block hydrates (Triggers spec); a consumer `(click)` replays the same way.
- `@defer`: library templates contain no `@defer`. Inside a dehydrated block the button is its server HTML. Inside `@defer (hydrate never)` it stays a styled native button that closes nothing, because no Trigger or handler ever runs there; the container's spec states that residue.
- Prerendering: identical to SSR; the directive reads no request token.

## Testing Decisions

A good test asserts what a user or assistive technology observes: the role, the name, `type`, the classes, the button's box, whether a click submits or closes, and where focus lands. No test reads the directive's fields. The patterns are the four layers of building-blocks 1.12 and the [Spec: Button](../issues/37-spec-button.md)'s tests, the nearest precedent.

Story ids follow `close-button--<story>`: `close-button--default`, `close-button--closable`, `close-button--removable`, `close-button--sizes`, `close-button--in-form`. `meta.component` is `NfsCloseButton`; `size` and `type` are args. The stories use Foundation's default size names and the default and success callouts, whose backgrounds pass 1.4.11 with Foundation's `$closebutton-color`, so the Storybook settings overrides need no line for this spec; the stories render the `$closebutton-color: #767676` the overrides carry for the Callout, which passes on both.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Run by `npx nx test-storybook <lib>`. Every story runs axe with `parameters.a11y.test = 'error'` and the six tags (which include `target-size` and `button-name`), and every play function asserts that each close button's bounding box is at least 24 by 24 px.

- `close-button--default`: Foundation's first docs example, a callout holding a close button and a paragraph. The button is found by `getByRole('button', {name: 'Close alert'})`, carries `.close-button` and `type="button"`, and its glyph is `aria-hidden="true"`; a click leaves the callout in place.
- `close-button--closable`: the Close Button docs page's "Making Closable" pair, a default callout and a success callout (the Callout's `callout--closable` ports the Callout page's alert and success pair), each a Toggler in visibility mode with a bare `nfsClose` on its close button, the second closing with `animate="slide-out-right"`, Foundation's `data-closable="slide-out-right"` as a leaving Motion name on the Toggler's own input. A click hides the first (`hidden`), Enter on the second hides it, and the story's `closed` handler moves focus to the heading that follows, which the play function asserts.
- `close-button--removable`: a callout inside `@if`, closed by the consumer's `(click)` handler with no Trigger; the callout leaves the DOM, and focus lands on the element the handler names.
- `close-button--sizes`: no `size`, `size="small"`, and `size="medium"`, plus a small button under a 14 px scaffolding container. The computed `font-size` is 1.5 times the parent's for the small buttons and 2 times for the medium one, the unset one equals the medium one, and every box is at least 24 by 24.
- `close-button--in-form`: two close buttons in a form with a text field; a click on the default one does not call the story's `submit` spy, and a click on the `type="submit"` one calls it once.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

TestBed specs next to the directive over a bare test host component, zoneless with `await fixture.whenStable()`; no story is mounted and no axe runs here.

- Host bindings: `.close-button` is present; `type` is `button` by default and follows a static `type="submit"` and a changing `[type]` binding; `size` sets its class, and clearing it removes only that class; a consumer's own static class and `[class]` binding stay; a size reached through `$any()` that contains a space sets no class; the host provides `nfsCloseButtonToken`.
- Composition: with a test Openable, a bare `nfsClose` beside `nfsCloseButton` closes it on click, and the button carries no `aria-expanded`; a consumer `(click)` on a close button with no Trigger runs.
- Zoneless: the suite runs with zoneless change detection; no test needs `NgZone`.

### 3. Node-level Vitest

- SSR smoke through the shared `renderServer()` helper, under `npx nx test <lib>`: a fixture with a default close button, a `size="small"` one, a `type="submit"` one, and one with a bare `nfsClose` inside a Toggler callout. `whenStable()` resolves; the server HTML carries `class="close-button"`, the size class, each `type`, the consumer's `aria-label`, and `aria-hidden="true"` on the glyph; only the Trigger's button carries `jsaction`.
- Sass compile: `@include nfs-close-button;` over Foundation's defaults emits exactly `:root { --nfs-closebutton-size: small medium; }` and `.close-button { min-width: 24px; min-height: 24px; }`, and no copy of a Foundation rule; a `$closebutton-size` with a `large` key and matching offset keys writes `small medium large`; a `medium`-only map writes `medium`.
- Pure logic: none worth isolating.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build:

- Target size in three engines: every close button in `close-button--default`, `close-button--sizes`, and `close-button--closable` measures at least 24 by 24 px, the small button under the 14 px container included.
- Focus visible in three engines: a screenshot comparison before and after Tab to the button in `close-button--default` shows a focus indicator.
- Real Enter and Space on the close buttons of `close-button--closable` in three engines.

Against the prerendered fixture app, on the Close Button route:

- JavaScript disabled: screenshot plus axe (`@axe-core/playwright` with the six tags) on the server HTML; a click on a close button inside a form does not submit.
- Hydration: no NG05xx in the console and `ngDevMode.componentsSkippedHydration === 0`.
- Pre-hydration click with the main bundle held back: a close button with a bare `nfsClose` inside a Toggler callout hides the callout exactly once after hydration.

## Out of Scope

- Closing. `nfsClose`, `[nfsCloseResult]`, the Nearest Openable, and the replacements for `data-closable` belong to the [Spec: Triggers (shared utility)](../issues/54-spec-triggers.md) and the [Spec: Toggler](../issues/17-spec-toggler.md); the dismissible callout belongs to the [Spec: Callout](../issues/89-spec-callout.md).
- A default or localised name, an `aria-label` input, or a name token (D6).
- A glyph or icon of the library's own; the consumer writes the glyph (D1).
- `<a>`, `<div>`, and other hosts (D1).
- A disabled contract: Foundation has no disabled close-button look, and native `disabled` works as written (D5).
- Contrast against a container's own background, which each container's spec owns (D9).
- The Variant registry's declaration, its manifest row, and the declaration tooling: [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md).
- Runtime theming through custom properties (building-blocks 1.13).

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | One attribute directive, `button[nfsCloseButton]`, binding `.close-button`; the consumer writes the glyph | ADR 0001 and ADR 0039: `.close-button` is a Structural class on a consumer-written element, and Foundation generates nothing; Foundation defines the close button as a `<button>`, whose native role, focus, keys, and `type` the directive relies on | A component rendering the glyph (Foundation does not generate it, and it would rule out the consumer's own icon); `[nfsCloseButton]` on any element or `a[nfsCloseButton]` (a close control that is not a button needs the role, focus, and keys a button has for free) |
| D2 | Closing sits beside it (`nfsClose`, a handler, or a submit in `<form method="dialog">`) and is never hosted | Foundation's docs: the close button "doesn't close elements". Host directives are static, so a hosted Trigger could not be left off a button whose handler removes content or that submits a `method="dialog"` form; it would add `jsaction` to every close button and pull the Triggers entry point into every import | `hostDirectives: [NfsClose]` with its inputs exposed |
| D3 | `type` input, default `'button'` | Foundation's docs write `type="button"` on every close button; HTML's Auto state submits a form; it is the Button spec's mechanism and `MatDialogClose`'s default | No default (the docs' own convention would be lost); a static host attribute (whether the consumer's static `type` wins over it is not a contract the spec relies on); always `button` (breaks `<form method="dialog">`) |
| D4 | `size` Variant input, alias `NfsCloseButtonSize` over the registry `NfsClosebuttonSizeOverrides`; the value is the class; unset sets none | ADR 0040 and building-blocks 1.4: the keys of a size map are an Open Variant family, one `size` input closed over its registry; the default look stays `$closebutton-default-size` | Consumer-written `.small` (ADR 0039); a closed `'small' \| 'medium'` union with no registry (rejects the sizes consumers add); a `(string & {})` member (accepts typos) |
| D5 | No State classes, no disabled contract, and no outputs, methods, Defaults token, or providers other than the lightweight `nfsCloseButtonToken` | Foundation has no close-button State class or disabled look; the native button and its `click` are the API | A `disabled` input like the Button spec's (Foundation's CSS would show nothing) |
| D6 | No default name; the docs and the JSDoc require a name that says what the button closes, never a symbol alone | Only the consumer knows what the button closes (Foundation's docs use "Close alert" and "Dismiss alert"); a library default is an English string that needs localisation; content and `aria-labelledby` are valid names | A default `aria-label="Close"`; a required `aria-label` input (a missing name would fail to compile, but content and `aria-labelledby` names would be ruled out, and `aria-label=""` would still satisfy it) |
| D7 | `nfsButton` never shares an element with `nfsCloseButton`: documented usage in the docs and the JSDoc | `.button` and `.close-button` are separate class contracts whose padding, background, and position collide | Mutually exclusive selectors (the second directive would silently not apply) |
| D8 | 2.5.8 by a 24 px box floor on every `.close-button`, in `nfs-close-button` | building-blocks 1.10 meets target size by size wherever a spec owns the control. The box is transparent, so the floor draws nothing and the glyph moves at most 5 px. Measured in three engines: axe passes the floored button, and reports Foundation's box, and a pseudo-element hit area, as incomplete when the button sits over a link. One rule replaces the Off-canvas spec's panel-scoped rule and the spacing-exception reasoning of the Reveal, Toggler, Triggers, and Button specs | The spacing exception per container (the accessibility lens's dissent at triage): it depends on layouts the library cannot see, and axe reports an overlap as incomplete rather than as a violation, so the gate cannot catch a broken exception. A transparent `::before` hit area (the ResponsiveToggle technique): pointer hits land 2 px outside the box, but axe cannot see it |
| D9 | `$closebutton-color` and `$closebutton-color-hover` reach 3:1 against `$body-background`; each container's spec states the colours that pass on its own background | ADR 0022; axe marks the glyph incomplete, so the spec states the pair; the close button does not know its container, and the container does (the Reveal and Off-canvas precedent) | Stating every container's background here (it would need every container's settings) |
| D10 | `@include nfs-close-button;` is required wherever `nfsCloseButton` is used, whatever the size | The include carries the 2.5.8 floor and writes the Variant property the declaration file's generator reads | Requiring it only where `size` is bound (the floor would be missing wherever the default size is used) |
| D11 | Native implementation level; no Aria, no CDK | A native button covers the role, focus, keys, and `type`; Aria has no button pattern | CDK `FocusMonitor` (the browser's `:focus-visible` already decides the ring) |
| D12 | Listener-free: host bindings only | Keeps the button hydration-clean and adds no `jsaction`; a Trigger beside it brings its own listener | A host `click` listener (it would have nothing to do) |

### Usage examples

```html
<!-- A dismissible notice hidden in place: the callout is a Toggler in visibility mode -->
<div nfsCallout nfsToggler id="invoice-notice" (closed)="focusInvoices()">
  <p>Invoice sent.</p>
  <button nfsCloseButton nfsClose aria-label="Dismiss notice">
    <span aria-hidden="true">&times;</span>
  </button>
</div>

<!-- A Reveal's close button: the bare nfsClose closes the Reveal, which returns focus to its opener -->
<dialog nfsReveal aria-labelledby="signup-title">
  <h2 id="signup-title">Sign up</h2>
  <button nfsCloseButton nfsClose aria-label="Close sign-up dialog">
    <span aria-hidden="true">&times;</span>
  </button>
</dialog>

<!-- A confirmation close button reporting a result -->
<button nfsCloseButton nfsClose [nfsCloseResult]="false" aria-label="Cancel and close">
  <span aria-hidden="true">&times;</span>
</button>

<!-- Inside <form method="dialog">: closes the dialog natively, without the Reveal's exit animation or closePredicate -->
<form method="dialog">
  <button nfsCloseButton type="submit" aria-label="Close notice">
    <span aria-hidden="true">&times;</span>
  </button>
</form>
```

```ts
@Component({
  selector: 'app-cookie-notice',
  imports: [NfsCallout, NfsCloseButton],
  template: `
    @if (visible()) {
      <div nfsCallout>
        <p>This site uses cookies.</p>
        <button nfsCloseButton size="small" aria-label="Dismiss cookie notice" (click)="dismiss()">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    }
    <main #main tabindex="-1">...</main>
  `,
})
export class CookieNotice {
  protected readonly visible = signal(true);
  protected readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

  protected dismiss(): void {
    this.visible.set(false);
    // The focused button leaves with the notice, so focus moves somewhere logical.
    this.main().nativeElement.focus();
  }
}
```

The container directives (`nfsCallout`, `nfsToggler`, `nfsReveal`) are shown only to place the close button; their names and inputs belong to their own specs.

### Platform features to adopt when the browser target moves

- Invoker Commands (`command` and `commandfor`, out of target): HTML runs a command for a button in the Button state inside a form and not for one in the Auto state, so the `type="button"` default is already compatible. Adoption belongs to the Triggers spec.
- Nothing else in the platform research applies; `:focus-visible` is already in target.

### Foundation behaviour changed or dropped

- `type="button"` becomes the default.
- A name that says what the button closes is required documented usage; the Toggler docs' unnamed close button is named in the recipes.
- Every close button gets a 24 px minimum box: the glyph moves 2.67 px (medium) or 5.0 px (small) toward the centre of the box, and a small button under a parent font size below 16 px grows to 24 px tall.
- `disable-mouse-outline` never matches, because the library never loads what-input; the browser's `:focus-visible` heuristic decides when the ring shows.
- `data-close` and `data-closable` belong to the Triggers utility and the Toggler (building-blocks 1.8).
- Sass facts a consumer meets when changing sizes, documented because Foundation's docs do not state them: a new `$closebutton-size` key needs the same key in both offset maps unless those are numbers; a number `$closebutton-size` does not compile in 6.9.0; `$closebutton-default-size` must name a key of the map.

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This component relies on Foundation's export mixin `foundation-close-button`, configured through the `$closebutton-*` settings. Its documented custom CSS is the `nfs-close-button` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-close-button`.

1. Rules. (a) `.close-button { min-width: 24px; min-height: 24px; }`. Reason: WCAG 2.2 success criterion 2.5.8; Foundation sizes the button by its glyph (the `$closebutton-size` font sizes, `line-height: 1`, and the global button reset's zero padding) and has no minimum-size setting, and the spacing exception depends on a container's layout. 24 px is WCAG's number, not a Foundation value. The rule applies wherever a close button sits, so no container's mixin adds a target-size rule for it; Foundation's rule that hides the button in revealed and in-canvas off-canvas panels is unchanged. (b) `:root { --nfs-closebutton-size: <keys>; }`, the Variant property in (6).
2. Reused, read from the consumer's compile: the keys of `$closebutton-size`. No Foundation value is copied, and the mixin takes no parameters.
3. Custom properties the directive writes: none.
4. Motion classes: none, and no `prefers-reduced-motion` override, because nothing animates.
5. Missing include: close buttons fall back to Foundation's glyph box (18.69 by 32 px at the medium size) and pass 2.5.8 only where the spacing exception happens to hold; the Variant property is absent, so the Variant declaration file's generator cannot list the sizes. The include is required wherever `nfsCloseButton` is used (D10).
6. Variant properties: `--nfs-closebutton-size`, the keys of `$closebutton-size`, space-separated (`small medium` by default).

Required settings on Foundation's defaults: none for a close button on the page background. Containers name their own: the Off-canvas spec requires `$offcanvas-background: $white`, and the Callout spec requires `$closebutton-color: #767676`.

### Notes

- RTL: `$closebutton-position` is a compile-time, physical setting (`right top`) that Foundation does not flip with `$global-text-direction`; a right-to-left application sets `$closebutton-position: left top`. The floor does not depend on direction.
- The button is absolutely positioned, so its container must be positioned; Foundation's callouts, Reveals, and off-canvas panels are.
- A close button that also has a Tooltip still closes the Openable around it: a bare `nfsClose` resolves past the Tooltip ([Spec: Tooltip](../issues/27-spec-tooltip.md)).
