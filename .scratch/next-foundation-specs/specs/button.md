# Spec: Button

Ticket: [Spec: Button](../issues/37-spec-button.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass.

## Problem Statement

A developer building an Angular application on Foundation for Sites writes `.button` markup by hand. Foundation's Button is a CSS-only component: it ships Sass and classes and no Plugin, so the markup contract is all there is, and that contract leaves the hard parts to the author:

- A `<button>` inside a form submits it unless the author remembers `type="button"`. Foundation's docs ask for exactly that in a callout, and mark real submit buttons with a `.submit` class that has no CSS and no behaviour.
- The `.disabled` class is, in Foundation's own words, "a purely visual style, and won't actually disable a control". Nothing in Foundation's CSS styles `aria-disabled`, so a button that must stay focusable while unavailable has no look.
- Foundation's disabled link, `<a class="button disabled" href="#" aria-disabled>`, keeps its `href`: it stays in the tab order and still navigates. Its `aria-disabled` has no value, which WAI-ARIA treats as `false`. WAI-ARIA advises against `aria-disabled` on elements the host language cannot disable, and a link with an `href` is such an element.
- Icon-only and arrow-only buttons have no accessible name unless the author adds `.show-for-sr` text and hides the icon.

A server-rendered Angular application adds a second problem: whatever the Angular layer does must already be right in the server HTML, must not break hydration, and must keep links and buttons working before hydration, inside dehydrated `@defer (hydrate on ...)` blocks, and inside `@defer (hydrate never)` blocks, where no JavaScript ever runs for them.

## Solution

One attribute directive, `nfsButton`, on the native `<button>` and `<a>` elements the developer already writes. It adds Foundation's `.button` class, defaults `<button>` to `type="button"` (keeping explicit types and Foundation's `.submit` marker), and owns the disabled contract: native `disabled` on buttons by default, an opt-in focusable disabled mode that looks disabled through Foundation's `.disabled` class and cannot submit or reset a form, and a disabled link rendered as an HTML placeholder link that is announced as an unavailable link. Every effect is a host binding on signal inputs, so the server HTML is the final DOM, and the directive declares no event listeners, so it adds nothing that Angular's event replay has to queue and it never causes Angular to cancel a link's native navigation inside a dehydrated block.

Appearance stays Foundation's: size, color, fill, `.expanded`, `.dropdown`, and `.arrow-only` are Variant classes the developer writes as static classes or binds with Angular's own `[class.x]` syntax. Button Group and Close Button stay plain Foundation markup with documented accessibility guidance; Close Button pairs with the Triggers utility's `nfsClose`.

What earns the directive a place, stated plainly: not the classes. A developer can write every Foundation class without it. The directive earns its place with the three things Foundation's markup gets wrong or leaves out, fixed so they hold in every rendering mode: the `type` default, a disabled state that actually disables (for links as well as buttons), and a focusable disabled state that Foundation's CSS can style. The `.button` class and the dev-mode link checks come with it at no extra cost. Anything beyond that (typed appearance inputs, a group directive, a close-button directive, a defaults token, a toggle model) was considered and rejected below because the markup already does it.

## User Stories

1. As an application developer, I want to put `nfsButton` on a native `<button>` and get Foundation's `.button` styling, so that I do not repeat the class on every button.
2. As an application developer, I want to put `nfsButton` on a native `<a href>` and get the same styling while it stays a real link, so that navigation keeps link semantics, middle-click, and "open in new tab".
3. As an application developer, I want an `nfsButton` `<button>` inside a form to default to `type="button"`, so that an action button never submits the form by accident.
4. As an application developer, I want `type="submit"` and `type="reset"` to work as written, so that submit and reset buttons behave as HTML defines.
5. As a developer copying Foundation's docs, I want `<button class="submit success button">` to still submit its form, so that Foundation's documented `.submit` marker keeps its meaning.
6. As an application developer, I want to bind `[type]` from component state, so that one button can switch between submit and plain action.
7. As an application developer, I want to write Foundation's size classes (`.tiny`, `.small`, `.large`) on the element, so that I use the names Foundation documents.
8. As an application developer, I want to write color classes from my own `$button-palette`, including custom names such as `.purple`, so that my Sass settings are the only list of colors.
9. As an application developer, I want to write `.hollow` or `.clear`, and `.solid` when my `$button-fill` default is not solid, so that fills follow my Sass settings.
10. As an application developer, I want to bind a Variant class with `[class.alert]="danger()"`, so that appearance can follow state without a second API to learn.
11. As an application developer, I want responsive classes such as `.medium-expanded` to work when I enable `$button-responsive-expanded`, so that breakpoint-specific width needs no JavaScript.
12. As an application developer, I want `[disabled]="true"` on a button to use the native `disabled` attribute, so that the platform blocks clicks, keyboard activation, and implicit form submission.
13. As a keyboard user, I want a natively disabled button to leave the tab order, so that I do not stop on controls I cannot use where their absence is obvious from context.
14. As a screen reader user, I want a button that is unavailable but still discoverable to stay focusable and announce itself as unavailable, so that I learn it exists and can reach its explanation.
15. As an application developer, I want a `disabledInteractive` option that keeps a disabled button focusable, so that a tooltip or description can tell the user why it is disabled.
16. As an application developer, I want a focusable disabled button to look disabled through Foundation's `.disabled` class, so that I write no custom CSS.
17. As an application developer, I want a focusable disabled submit button never to submit its form, so that `disabledInteractive` cannot bypass the disabled state through the form's default action.
18. As an application developer, I want a button that disables itself while saving to keep focus when I use `disabledInteractive`, so that keyboard and screen reader users are not dropped onto the page body.
19. As an application developer, I want `[disabled]` on an `nfsButton` link to render Foundation's disabled look and announce "link, unavailable", so that pagination and wizard links can be disabled.
20. As a keyboard user, I want a disabled link to be skipped by Tab and never to navigate, so that it behaves like a disabled control in every browser.
21. As an application developer using the router, I want to disable a router link by binding `[routerLink]` to `null` together with `[disabled]`, so that the Router and the directive agree on the state.
22. As an application developer, I want a dev-mode warning when a disabled link still has an `href`, so that I notice a disabled link that would still navigate.
23. As an application developer, I want a dev-mode warning when an enabled `nfsButton` link has no `href`, so that I notice a "button" that no keyboard user can reach.
24. As a screen reader user, I want icon-only and arrow-only buttons to have a spoken name from `.show-for-sr` text, so that I know what they do.
25. As a screen reader user, I want a toggle button to expose `aria-pressed` and keep its label unchanged, so that I hear its state rather than a changing name.
26. As an application developer, I want to put the Triggers utility's directives (`nfsToggle`, `nfsOpen`, `nfsClose`) on an `nfsButton`, so that a Foundation-styled button can open a Dropdown pane or a Reveal.
27. As an application developer, I want to build a split button from a `.button-group` with a main action and a `.dropdown.arrow-only` button, so that Foundation's split-button markup works unchanged.
28. As an application developer, I want sizes, colors, and fills written on `.button-group` to apply to its buttons, so that I set them once per group as Foundation documents.
29. As an application developer, I want a `.close-button` inside a callout or Reveal to close it through `nfsClose` without `nfsButton`, so that the two Foundation class contracts never collide.
30. As a developer of a server-rendered application, I want the server HTML to carry the final classes, `type`, `disabled`, `aria-disabled`, and `role`, so that the first paint is correct and hydration changes nothing.
31. As a developer of a server-rendered application, I want an enabled `nfsButton` link to navigate natively when clicked before hydration or inside a dehydrated `@defer` block, so that the directive never swallows a navigation.
32. As a developer of a server-rendered application, I want a natively disabled button to ignore clicks before hydration, so that no queued click reaches my handler after hydration.
33. As a developer using `@defer (hydrate never)`, I want buttons and links inside the block to keep working as native elements, so that static regions need no JavaScript.
34. As a developer of a prerendered site, I want the same output as server rendering, so that prerendering needs no special handling.
35. As a developer of a zoneless application, I want the directive to need no zone, so that it works with zoneless change detection.
36. As a user who prefers reduced motion, I want buttons to stay free of motion animation, so that nothing moves when I hover or focus them.
37. As a keyboard user, I want the browser's own focus indicator on buttons and links, so that I can always see where focus is.
38. As an application developer, I want to import the directive from its own entry point, so that a `@defer` block can split it with the rest of the deferred content.
39. As a library maintainer, I want every behaviour asserted through roles, attributes, and classes in stories, browser-level tests, a server-render smoke test, and e2e, so that regressions surface at the layer that owns them.
40. As a pointer and touch user, I want every button to be at least 24 by 24 CSS pixels whatever the size class, label, or Sass settings, so that each button meets the WCAG 2.2 minimum target size.
41. As a user with low vision, I want every button label and every dropdown arrow to reach WCAG 2.2 AA contrast at rest, on hover, and on focus, so that I can read every button in every fill and color.
42. As an application developer, I want the library's Sass to stop my build when a button setting fails WCAG 2.2 AA contrast, naming the setting, so that I never ship a failing palette without knowing.

## Implementation Decisions

### Foundation contract

Button has no Plugin, no `defaults` object, no `data-*` Options, no events, and no methods. Its whole contract is Sass and classes (Foundation's button, button group, and close button Sass partials and their three docs pages). Dropped options: none, because there are none.

| Feature | Class or markup | Source of the names | Notes |
| --- | --- | --- | --- |
| Button | `.button` | `@mixin foundation-button` | Structural class; applies to any element; `a.button` loses its underline on hover and focus |
| Sizes | `.tiny`, `.small`, `.large` | `$button-sizes` (`tiny: 0.6rem`, `small: 0.75rem`, `default: 0.9rem`, `large: 1.25rem`), `default` key removed from the class loop | Consumer-configurable map; no class for the default size |
| Colors | `.primary`, `.secondary`, `.success`, `.warning`, `.alert` | `$button-palette`, defaulting to `$foundation-palette` | Consumer-configurable map (docs show `map-merge` with `purple`); no class means `$button-background` |
| Fills | `.hollow`, `.clear`, and `.solid` | `@each $filling in (solid hollow clear)`, skipping the class for `$button-fill` | With the default `$button-fill: solid` there is no `.solid` rule; with `hollow` as default, `.solid` and `.clear` exist and `.hollow` does not |
| Full width | `.expanded`; `.<bp>-only-expanded`, `.<bp>-expanded`, `.<bp>-down-expanded` | `button-expand`; `$button-responsive-expanded` (false by default) | CSS media queries; no JavaScript |
| Disabled look | `.disabled` or `[disabled]` | `button-disabled` (opacity `$button-opacity-disabled` 0.25, `cursor: not-allowed`); fill styles keep base colors on hover and focus | No rule for `[aria-disabled]` |
| Dropdown arrow | `.dropdown` | `button-dropdown` (`::after` triangle, `float: $global-right`) | Visual only; the docs point to the Dropdown plugin for behaviour |
| Arrow only | `.arrow-only` | `&.arrow-only::after` | Repositions the `.dropdown` arrow; the button needs a `.show-for-sr` label |
| Focus outline | `disable-mouse-outline` | `[data-whatinput='mouse'] &` | Depends on the what-input library, which Foundation's JavaScript loads; see Further Notes |
| Transition | `$button-transition` | `background-color 0.25s ease-out, color 0.25s ease-out` | Color only |
| Button group | `.button-group` with `.tiny`, `.small`, `.large`, palette colors, `.hollow`, `.clear`, `.solid`, `.no-gaps`, `.expanded`, `.stacked`, `.stacked-for-small`, `.stacked-for-medium`, and the flexbox `.align-*` classes | `@mixin foundation-button-group` | Group classes style children through descendant selectors (`.button-group.small .button`) |
| Close button | `.close-button` with `.small`, `.medium` | `@mixin foundation-close-button`, `$closebutton-size` | Separate class contract; `position: absolute`; not `.button` |

Docs conventions the spec keeps or corrects: `type="button"` on every non-submit `<button>` (kept, now the default); the `.submit` marker on submit buttons (kept, now honoured); `aria-disabled` without a value on disabled links (corrected: `aria-disabled="true"` with `role="link"` on a link whose target is removed); `.show-for-sr` text plus an `aria-hidden="true"` icon for icon-only buttons (kept as guidance).

### CSS class to Angular mapping

| Foundation class | Angular | Rationale |
| --- | --- | --- |
| `.button` on `<button>` or `<a>` | `NfsButton` directive, `button[nfsButton], a[nfsButton]`, adds `.button` as a static host class | The one Structural class; directive-first (ADR 0001) |
| `.tiny`, `.small`, `.large` | Consumer-written Variant classes | Purely visual; the size map is the consumer's Sass (proposed ADR: Variant classes stay consumer-written classes) |
| Palette colors | Consumer-written Variant classes | Open set from `$button-palette` |
| `.hollow`, `.clear`, `.solid` | Consumer-written Variant classes | Which class exists depends on `$button-fill` |
| `.expanded` and responsive `-expanded` classes | Consumer-written Variant classes | CSS media queries do the work |
| `.dropdown`, `.arrow-only` | Consumer-written Variant classes | Visual; behaviour comes from the Triggers utility and the Dropdown pane |
| `.disabled` | State class bound by `NfsButton` while a link or a focusable disabled button is disabled; left to the consumer's markup otherwise | Foundation's CSS styles `.disabled` and `[disabled]` but not `[aria-disabled]` |
| `[disabled]` | Native attribute bound by `NfsButton` on `<button>` | Platform disabling |
| `.submit` | Read once as a static class to choose the `type` default | Foundation's documented submit marker |
| `.button-group` and its classes | Plain markup | CSS-only component; the cascade already passes group sizes, colors, and fills to children |
| `.close-button` and its sizes | Plain markup plus the Triggers utility's `nfsClose` | CSS-only component with its own class contract |

### Hierarchy and DI shape

```
button[nfsButton] | a[nfsButton]      NfsButton (standalone directive, no template)
```

- One directive class for both host elements, Material's shape (`MatButton` covers `button[matButton], a[matButton]`, and `MatAnchor` is an alias of it). Two classes would let a consumer import only one and silently lose the other selector.
- No parent, no children, no Parent token, no host directives, no providers. Nothing needs to find a button through DI.
- No Defaults token. Defaults tokens replace a Plugin's `Foundation.X.defaults`, and Button has none. The defaults a runtime token could hold are already Sass compile-time settings (`$button-fill`, `$button-background`, the `default` entry of `$button-sizes`), and a runtime default would emit classes that fight those settings. Material's `MAT_BUTTON_CONFIG.disabledInteractive` was considered; it is added only if an application-wide need appears.
- Button Group is not a directive. Foundation's group rules are descendant selectors (`.button-group.small .button`, `.button-group.alert .button`, `.button-group.hollow .button`), so the CSS cascade already delivers what a group Parent token would provide, and a child directive binding `.small` itself would only duplicate the cascade and diverge from Foundation's markup.
- Injection: `ElementRef` (host tag, once, at construction), `HostAttributeToken('class')` (optional; the static class list, for the `.submit` marker), `HostAttributeToken('role')` (optional; the static role, echoed when the directive is not overriding it). No other dependencies.
- Entry point: the directive is its own secondary entry point, `ngx-foundation-sites/button`, per the building-blocks naming rule, so a consumer's `@defer` can split it.

### API: `NfsButton`

Selector `button[nfsButton], a[nfsButton]`; `exportAs: 'nfsButton'`; standalone; OnPush does not apply (no template).

```ts
class NfsButton {
  readonly disabled: InputSignalWithTransform<boolean, unknown>;            // default false
  readonly disabledInteractive: InputSignalWithTransform<boolean, unknown>; // default false; <button> hosts only
  readonly type: InputSignal<'button' | 'submit' | 'reset'>;                // default 'button', or 'submit' with the .submit marker; <button> hosts only
}
```

| Input | Type and transform | Default | Foundation equivalent | Delta |
| --- | --- | --- | --- | --- |
| `disabled` | `boolean`, `booleanAttribute` | `false` | `disabled` attribute on `<button>`; `.disabled` plus `aria-disabled` on `<a>` | On `<a>`: `aria-disabled="true"` (not valueless), `role="link"`, and the consumer removes the navigation target |
| `disabledInteractive` | `boolean`, `booleanAttribute` | `false` | None (Material's name) | New. While `disabled`, the button stays focusable, gets `aria-disabled="true"` and `.disabled`, and renders `type="button"`. No effect on `<a>` hosts: a disabled link is never focusable |
| `type` | `'button' \| 'submit' \| 'reset'` | `'submit'` when the static class list contains Foundation's `submit` marker, otherwise `'button'` | Docs: `type="button"` unless the button submits a form | New default. HTML's missing-value default for `<button type>` is the Auto state, which is a submit button in a form. Not used on `<a>` hosts |

- Models: none. The directive owns no two-way state; `aria-pressed` toggling stays in the consumer's component (see ARIA).
- Outputs: none. The native `click`, `focus`, and `blur` events are the API; the directive neither wraps nor re-emits them.
- Methods: none. `focus()` is the native element method; Material's `focus(origin)` exists to feed `FocusMonitor`, which this library does not use for buttons.
- `exportAs: 'nfsButton'` exposes the three input signals to template references (for example a sibling Tooltip reading `button.disabled()`).

Host bindings (all on signal state; `isButton` is the host tag read once at construction):

| Binding | `<button>` host | `<a>` host |
| --- | --- | --- |
| static `class` | `button` | `button` |
| `[attr.type]` | `button` while `disabled && disabledInteractive`, otherwise `type()` | not written (`null`) |
| `[attr.disabled]` | present while `disabled && !disabledInteractive` | not written (`null`), which also removes a static `disabled` that fed the input |
| `[attr.aria-disabled]` | `true` while `disabled && disabledInteractive` | `true` while `disabled` |
| `[class.disabled]` | added while `disabled && disabledInteractive` | added while `disabled` |
| `[attr.role]` | the static `role` attribute, echoed | `link` while `disabled`, otherwise the static `role` echoed |

- `[class.disabled]` binds `true` or `undefined`, never `false`, so a `.disabled` class the consumer wrote statically is left alone (Angular's styling treats only `undefined` as "no opinion").
- Attribute ownership: the directive owns `type`, `disabled`, `aria-disabled`, and `role` on its host. Consumers set them through the inputs, as static attributes (which feed the inputs), or through `[type]`/`[disabled]` bindings (which bind the inputs). A consumer `[attr.type]`, `[attr.disabled]`, or `[attr.aria-disabled]` binding loses to the directive's host binding, per Angular's collision rule (both dynamic: the host binding wins). The spec's usage examples never use those forms.
- Not combined with a directive that owns the same attributes: Aria's `ngToolbarWidget` and accordion trigger bind `[attr.disabled]` and `[attr.aria-disabled]` themselves, and Aria's tab binds `aria-disabled` and a static `role="tab"`. Inside an Aria toolbar the consumer writes Foundation's `.button` classes directly and lets the Aria directive own the disabled state.
- Triggers on the same element: a Trigger (`nfsToggle`, `nfsOpen`, `nfsClose`) adds `aria-expanded`, `aria-controls`, and `aria-haspopup`, which `NfsButton` never touches. If the Triggers utility spec also defaults `type`, the two directives must compute the same value; the simpler rule, proposed to that spec, is that a Trigger leaves `type` to the consumer or to `NfsButton`.
- Dev-mode checks, in one `afterRenderEffect` read phase that exists only when `ngDevMode` is on (never on the server, never in production): an `<a>` host that is `disabled` but still has an `href` warns "disabled link still navigates: bind its href or routerLink to null"; an `<a>` host that is not `disabled` and has no `href` warns "a placeholder link is not focusable: use button[nfsButton] or add an href". Each warns once per instance.

### Implementation level and primitives

Implementation level: native platform. Everything a button does is the HTML `<button>` and `<a>` element: activation on Enter and Space, `disabled` blocking clicks and implicit submission, `type` deciding the form action, and a link without `href` being a placeholder that is neither focusable nor navigable. `@angular/aria` has no button pattern in 22.2 (its patterns are accordion, combobox, grid, listbox, menu, tabs, toolbar, tree). `@angular/cdk` is not needed: `FocusMonitor` only tracks focus origin, which the browser's `:focus-visible` heuristic already covers for the focus ring, and `InteractivityChecker` has nothing to check. The Angular layer is host bindings over `input()` signals plus two `HostAttributeToken` reads; no `computed` is needed beyond the host expressions, no `effect`, no timer, no observer.

Fallback: none needed. No part of the design depends on an unverified behaviour; the one source-derived risk (listeners on anchors inside dehydrated blocks) is avoided by construction and asserted in e2e.

### Comparison with Angular Material (`MatButton`, 22.2)

| Concern | Material | `NfsButton` |
| --- | --- | --- |
| Selector | `button[matButton], a[matButton]` plus legacy `mat-*-button` attributes | `button[nfsButton], a[nfsButton]` |
| Kind | Component with a template (ripple, label, focus indicator, touch target) | Directive, no template |
| Appearance | `matButton="text\|filled\|elevated\|outlined\|tonal"` input; `defaultAppearance` in `MAT_BUTTON_CONFIG` | Foundation Variant classes; defaults are Sass settings |
| Color | `color` input (M2 themes only) | Palette classes from `$button-palette` |
| Disabled `<button>` | Native `disabled` | Native `disabled` |
| Disabled `<a>` | `aria-disabled="true"`, `tabindex="-1"`, click listener with `preventDefault` and `stopImmediatePropagation` | Placeholder link (consumer removes the target), `role="link"`, `aria-disabled="true"`, `.disabled`, dev-mode checks, no listener |
| `disabledInteractive` | Yes; submit stays active (documented caveat); global default in `MAT_BUTTON_CONFIG` | Yes; renders `type="button"` while disabled; no global default |
| `type` | Not managed | Default `button`; `.submit` marker honoured |
| `tabIndex`, `disableRipple`, `showProgress` | Inputs | None (native `tabindex`; no ripple; no progress slot) |
| `focus(origin)` | Method through `FocusMonitor` | None (native `focus()`) |
| `exportAs` | `matButton, matAnchor` | `nfsButton` |
| Testing | `MatButtonHarness` | DOM-first assertions; no harness |

Borrowed: the directive-on-native-element shape, one class for both hosts, the `disabledInteractive` name and its focusable `aria-disabled` behaviour. Not borrowed: the component template, appearance and color inputs (Material's classes are private; Foundation's are the public contract), the config token, and the anchor click blocker.

### ARIA and keyboard

APG pattern: Button (command and toggle variants); Link for `<a>` hosts.

| Element or state | Rendered semantics | Source |
| --- | --- | --- |
| `button[nfsButton]` | Implicit role `button`; explicit `type` | WHATWG HTML, the button element |
| Natively disabled | `disabled` attribute: exposed as unavailable, removed from the tab order, receives no `click` | HTML ("A form control that is disabled must prevent any click events ... from being dispatched on the element"); APG keyboard-interface practice, "Focusability of disabled controls" |
| Focusable disabled (`disabledInteractive`) | `aria-disabled="true"`, `.disabled`, stays in the tab order, `type="button"` while disabled | APG Button pattern ("When the action associated with a button is unavailable, the button has aria-disabled set to true"); APG keyboard practice (use `aria-disabled` when the element must stay discoverable) |
| `a[nfsButton][href]` | Implicit role `link` | HTML |
| Disabled link | No `href` (consumer), `role="link"`, `aria-disabled="true"`, `.disabled`; not focusable, not navigable | HTML ("If the a element has no href attribute, then the element represents a placeholder for where a link might otherwise have been placed"); WAI-ARIA `aria-disabled` note on host-language equivalents; `link` supports `aria-disabled` |
| Toggle button | Consumer binds `[attr.aria-pressed]`; the label never changes with the state | APG Button pattern ("it is critical the label on a toggle does not change when its state changes") |
| Menu-opening or dialog-opening button | `aria-expanded`, `aria-controls`, and `aria-haspopup` come from the Triggers utility, not from `NfsButton` | Building-blocks Triggers rule |
| Icon-only, arrow-only | Name from a `.show-for-sr` child; the icon wrapped in `aria-hidden="true"`; `aria-label` only when no visible or screen-reader text exists | Foundation Button and Button Group docs; APG naming: button and link are named from content |
| `.button-group` | Optional `role="group"` with `aria-label` or `aria-labelledby` when the grouping carries meaning (a split button); a toolbar with one tab stop is Aria's toolbar, not this directive | WAI-ARIA `group` role; APG Toolbar pattern |
| `.close-button` | `<button type="button" class="close-button" aria-label="Close">` with the glyph in `aria-hidden="true"`, closed through `nfsClose` | Foundation Close Button docs |

| Key | `<button>` | `<a href>` | Owner |
| --- | --- | --- | --- |
| Enter | Activates; submits when `type="submit"` | Follows the link | Native |
| Space | Activates on key release | Scrolls the page (native link behaviour) | Native |
| Tab, Shift+Tab | Reaches enabled and `disabledInteractive` buttons; skips natively disabled ones | Reaches links with `href`; skips disabled (placeholder) links | Native |
| Enter in a text field of the form | Implicit submission through the first submit button; blocked when that button is natively disabled | n/a | Native |

The directive adds no key handling. Focus after activation follows the APG Button pattern and is the job of whatever the button opens (Reveal, Dropdown pane).

### WCAG 2.2 AA

The target is WCAG 2.2 level AA (user rule; ADR 0022). Each criterion below is a requirement with the layer that tests it; none is advice. Contrast ratios were computed with Foundation 6.9.0's own `color-luminance()` from its default settings (`$foundation-palette`, `$button-color` `#fefefe`, `$button-color-alt` `#0a0a0a`, `$body-background` `#fefefe`) and are unrounded: Foundation's `color-contrast()` rounds to one decimal and reports the default alert pair, 4.498:1, as 4.5, so the library's checks compare the unrounded ratio.

| Criterion | Requirement and how it is met | Foundation default | Test |
| --- | --- | --- | --- |
| 2.5.8 Target Size (Minimum) | Every `.button` is at least 24 by 24 CSS px. The `nfs-button` Library mixin emits one rule, `.button { min-width: 24px; min-height: 24px; }` (Foundation sets `box-sizing: border-box`, so the floor applies to the border box). It changes nothing at Foundation's default sizes and holds the minimum under any `$button-sizes`, `$button-padding`, `$global-font-size`, or label. Foundation cannot supply it: a button's size is its font size times `line-height: 1` plus `$button-padding` in em, and no setting sets a minimum. A `.close-button` is not a `.button`: it is 2em (medium) or 1.5em (small) tall and its glyph is narrower than 24 px, so it passes through the spacing exception in its absolute corner position, as the [Spec: Toggler](../issues/17-spec-toggler.md) records; where a consumer's layout breaks the exception, the consumer adds `min-width: 24px` to that `.close-button` | Height passes, checked at a 16 px root font size: `.tiny` (0.6rem) is 27.92 px (a 9.6 px line, 2 x 0.85em padding, 2 x 1 px border), `.small` 34.4 px, the default size 40.88 px, `.large` 56 px; `.tiny.arrow-only` is 27.92 by 28.88 px. Width can fail: at `.tiny` it is 21.2 px plus the label, so a single narrow glyph such as `I` (about 2.7 px at 9.6 px Helvetica) gives about 23.9 px, and every `.tiny` button drops under 24 px tall once the root font size is under about 13.6 px (`$global-font-size` under 85 percent) | axe `target-size` in every story (`button--sizes` includes a `.tiny` button labelled `I`; `button--dropdown-arrows` a `.tiny.arrow-only`); e2e measures the border box of every button in `button--sizes` at 24 px or more in three engines; node-level Sass compile test asserts the one emitted rule |
| 1.4.3 Contrast (Minimum) | Every button label contrasts at least 4.5:1 with its background at rest, on hover, and on focus (Foundation styles hover and focus alike). Pairs: solid fill `$button-color` on `$button-background` and on `$button-background-hover`; for each `$button-palette` entry, the label colour Foundation picks (`color-pick-contrast()` between `$button-color` and `$button-color-alt`) on the entry and on its hover colour (`$button-background-hover-lightness`); hollow and clear fills, `$button-background` and each entry on `$body-background`, at rest and on hover (`$button-hollow-hover-lightness`). No button label is large text (`.large` is 20 px at normal weight), so 4.5:1 applies at every size; disabled buttons are exempt as inactive components. The `nfs-button` mixin checks every pair at compile time and stops with `@error` naming the setting and the fill. Required consumer setting on Foundation's defaults: `$button-palette: map-merge($foundation-palette, ('alert': #bf3f2c, 'success': #177a3d, 'warning': #8a5a00));`. A palette entry is emitted for all three fills, so each entry must pass in all three; removing an unused entry from `$button-palette` is the other way to pass | Fails. Passing pairs: `.button` `#fefefe` on `#1779ba` 4.59:1 (hover 5.90:1); `.primary` 4.59:1; `.secondary` 4.50:1 (4.504); solid `.success` with the black label 10.91:1 (hover 7.88:1); solid `.warning` 10.66:1 (hover 6.85:1); hollow and clear `.primary` 4.59:1 and `.secondary` 4.50:1. Failing pairs: solid `.alert` 4.498:1 (axe reports 4.49); hollow and clear `.alert` 4.498:1; hollow and clear `.success` 1.80:1; hollow and clear `.warning` 1.84:1. With the required palette the label becomes `$button-color` on all three and reaches alert 5.25:1, success 5.28:1, warning 5.88:1 (hover 7.32, 7.21, 8.04:1); `#bf3f2c` is the alert value the [Spec: Abide](../issues/31-spec-abide.md) requires as well | Compile-time check; node-level Sass compile test (Foundation's default palette fails naming `alert`, `success`, and `warning` with the fill; the required palette compiles); axe `color-contrast` in every story on the resting state under the Storybook preview settings, which set the same `$button-palette` with the rule id `color-contrast` in the comment. Hover and focus colours are covered by the compile-time check only, because axe tests the rendered state |
| 1.4.11 Non-text Contrast | The `.dropdown` arrow contrasts at least 3:1 with what it is drawn on, because it is the only visible content of an `.arrow-only` button: `$white` on each solid fill and its hover colour (the colour is fixed in `foundation-button`, not a setting), and the palette colour on `$body-background` for hollow and clear. The same compile-time check covers it at 3:1. Button boundaries need no 3:1: the Understanding document for 1.4.11 says "If a control has visible content (such as text or a sufficiently contrasting icon), which helps users identify the presence of the control, then a border or other indication of the overall boundary of the hit area is not required". The browser's unmodified focus ring is exempt ("the default focus style is exempt from contrast requirements (but must still be visible)"), and disabled buttons are exempt | Fails for `.success` (white arrow 1.80:1, 2.49:1 on hover) and `.warning` (1.84:1, 2.87:1 on hover), solid and hollow alike; passes for primary, secondary, and alert (at least 4.50:1). The required palette of 1.4.3 fixes both (at least 5.25:1) | Node-level Sass compile test; axe has no 1.4.11 rule, so the story gate cannot enforce it |
| 2.4.7 Focus Visible | Every button and button link shows the browser's own focus indicator; the library removes no outline and adds none. Foundation's `button-base` and its global `button` reset remove the outline only under `[data-whatinput='mouse']` (`disable-mouse-outline`), an attribute the what-input script sets; the library never loads that script, so the rule never matches and the browser's `:focus-visible` heuristic decides (keyboard focus shows the ring, a mouse click on a button does not). Foundation's `&:focus` colour change is an extra cue, not the indicator. A consumer who loads what-input keeps the ring for keyboard focus, because what-input then sets `keyboard` | Passes, checked: `disable-mouse-outline` is the only outline rule in Foundation's button, button group, and close button partials and in its global styles | e2e: after Tab to the `.button` and to the `a.button` in `button--basics`, a screenshot comparison shows a focus indicator in three engines |
| 2.1.1 Keyboard | Every button is operated by the native keys (Enter, Space; Enter on links); the directive adds no key handling and never removes a host from the tab order except through native `disabled` and the placeholder link | Passes for native elements; Foundation's `<a class="button">` without `href` in Button Group examples is not focusable, which the dev-mode placeholder-link warning reports | Story play functions (`userEvent.tab()`, `userEvent.keyboard`); e2e real key presses |
| 4.1.2 Name, Role, Value | Roles come from the native element. A natively disabled button exposes its state through `disabled`; a `disabledInteractive` button stays role `button`, focusable, with `aria-disabled="true"`; a disabled link is a placeholder link with `role="link"` and `aria-disabled="true"`, announced as an unavailable link; a toggle button exposes `aria-pressed` and keeps its name; the ARIA of a Trigger on the same element belongs to the Triggers utility. Every value is in the server HTML | Fails for disabled links: Foundation keeps the `href` and writes a valueless `aria-disabled`, which WAI-ARIA reads as `false`; `.disabled` alone disables nothing | axe (`aria-allowed-attr`, `aria-valid-attr-value`, `button-name`, `link-name`) in every story; play functions of `button--disabled`, `button--disabled-interactive`, and `button--toggle` assert role, name, and state; browser-level host binding table; SSR smoke |
| 2.5.3 Label in Name | The accessible name of a button with visible text contains that text, starting with it. Names come from content; `aria-label` is for buttons with no visible text (icon-only, `.arrow-only`, `.close-button`), where the criterion has no visible label to match. A consumer who adds `aria-label` or `aria-labelledby` to a button with visible text starts the name with the visible words. The directive adds no name | Passes: Foundation's docs name buttons from content or `.show-for-sr` text | Every story's play function finds each button with `getByRole` and its visible text as the name; `button--icon-only` asserts the `.show-for-sr` names |
| 1.4.1 Use of Color | The disabled look is not colour alone. Foundation's `button-disabled` fades the whole control to `$button-opacity-disabled` (0.25) and sets `cursor: not-allowed`: a lightness change, which the Understanding document for 1.4.1 counts as an additional visual distinction when the relative luminance difference reaches 3:1. Requirement: for every fill and palette entry, the enabled and disabled renderings differ by at least 3:1 in the background (solid) or in the label (solid with a dark label, hollow, clear); the `nfs-button` compile-time check computes both from `$button-opacity-disabled` and stops with `@error` when neither reaches 3:1. The state is also exposed programmatically (4.1.2). Palette colours carry no meaning the library relies on; a consumer who uses `.alert` for a destructive action says so in the label as well | Passes for the default palette: solid `.primary` 3.29:1 between the enabled and disabled background, `.secondary` 3.31:1, `.alert` 3.19:1; solid `.success` and `.warning` 11.0:1 between the enabled and disabled label. Hollow and clear `.success` and `.warning` reach only 1.53:1 and 1.57:1, and are fixed by the required palette of 1.4.3 (3.61 to 4.08:1 for the three changed entries). Raising `$button-opacity-disabled` shrinks every difference | Node-level Sass compile test (`$button-opacity-disabled: 0.6` fails the compile); `button--disabled` shows both states under axe |

The axe gate in every story runs the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, plus `best-practice`) with `parameters.a11y.test = 'error'` (ADR 0018).

### Rendered HTML

Consumer markup and the resulting DOM. Server HTML and hydrated DOM are identical for every row, because every value comes from inputs and static attributes; nothing depends on the platform, a breakpoint, or a generated id. Class order in the `class` attribute is not significant.

```html
<!-- Action button -->
<button nfsButton class="small alert">Delete</button>
<button class="small alert button" type="button">Delete</button>

<!-- Link -->
<a nfsButton href="/about">Learn More</a>
<a class="button" href="/about">Learn More</a>

<!-- Submit, explicit or through Foundation's marker -->
<button nfsButton type="submit" class="success">Save</button>
<button nfsButton class="submit success">Save</button>
<button class="success button" type="submit">Save</button>
<button class="submit success button" type="submit">Save</button>

<!-- Natively disabled -->
<button nfsButton [disabled]="true">Delete</button>
<button class="button" type="button" disabled="">Delete</button>

<!-- Focusable disabled submit button, while saving() is true -->
<button nfsButton type="submit" [disabled]="saving()" disabledInteractive aria-describedby="save-hint">Save</button>
<button class="button disabled" type="button" aria-disabled="true" aria-describedby="save-hint">Save</button>
<!-- ... and once saving() is false -->
<button class="button" type="submit" aria-describedby="save-hint">Save</button>

<!-- Disabled router link on the last page -->
<a nfsButton [routerLink]="isLast() ? null : ['/page', next()]" [disabled]="isLast()">Next</a>
<a class="button disabled" role="link" aria-disabled="true">Next</a>

<!-- Split button (Button Group markup plus a Trigger and a Dropdown pane) -->
<div class="button-group" role="group" aria-label="Save options">
  <button nfsButton>Save</button>
  <button nfsButton class="dropdown arrow-only" [nfsToggle]="saveMenu">
    <span class="show-for-sr">More save options</span>
  </button>
</div>
<div class="button-group" role="group" aria-label="Save options">
  <button class="button" type="button">Save</button>
  <button class="dropdown arrow-only button" type="button" aria-expanded="false" aria-controls="...">
    <span class="show-for-sr">More save options</span>
  </button>
</div>
```

The Trigger's attributes in the last example belong to the Triggers utility spec and are shown only to place them. A `jsaction` attribute appears in server HTML only on hosts where the consumer (or another directive, such as a Trigger) declared a listener; `NfsButton` itself never causes one.

### Animation

- The only animation is Foundation's `$button-transition` (`background-color` and `color`, 0.25 s ease-out) on hover and focus. It is Foundation CSS, not a library animation: no State class change waits on it, no Completion output exists, and no `transitionend` is observed, so ADR 0003's mechanics have nothing to govern here.
- Reduced motion: no change. WCAG 2.2's definition of motion animation excludes changes of color or opacity that do not alter the element's perceived size, shape, position, or depth, so a color transition is not motion and `prefers-reduced-motion` does not require removing it. The library's reduced-motion rule does not target `.button`. A consumer who wants no transition sets `$button-transition: none` in Sass.
- No `animate.enter`/`animate.leave`: the directive never inserts or removes elements.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the server HTML carries `.button`, the consumer's Variant classes, `type`, `disabled`, `aria-disabled`, `role`, and `.disabled` exactly as the hydrated DOM does (rule 1). The dehydrated state is fully functional: native buttons activate, links navigate, disabled buttons and placeholder links do nothing, and a focusable disabled submit button cannot submit because it renders `type="button"`.
- Before hydration: the directive touches no DOM outside host bindings, reads no `window`, measures nothing, and starts no timer (rules 3 to 5). Its only DOM read is the dev-mode link check in `afterRenderEffect`, which never runs on the server.
- Full hydration: host binding values equal the server's, so hydration changes no attribute and no class; there is no structure to mismatch. The directive is hydration-clean by construction and needs no `ngSkipHydration` (rule 10).
- Incremental hydration: a button needs no hydration boundary of its own; it has no parent or children to register with. When a button is a Trigger, the Trigger's rule applies: the button and its Openable share one boundary.
- Event replay: `NfsButton` declares no listeners, so it adds no `jsaction` and nothing of its own is queued or replayed. Consumer listeners on the element replay normally. A natively disabled button receives no `click` before hydration, so nothing is queued for it. A `disabledInteractive` button does receive clicks: before hydration a click has no default action (the button is `type="button"`), and after hydration the queued click is replayed to the consumer's listeners, which must check the disabled state (see the next bullet). Because the directive has no handler, the replay-handling decision (state first, `preventDefault()` last, the logged error accepted, decided under the triage rule in the [Building-blocks map and cross-cutting architecture decisions](../issues/14-building-blocks-map.md)) has nothing to apply to here.
- Why no listeners, including for `disabledInteractive`: Angular's JSAction dispatcher calls `preventDefault()` on any `click` whose action element is an `<a>` that carries `jsaction` inside a still-dehydrated block, then hydrates and replays. A host `click` listener on `a[nfsButton]` would therefore cancel the native navigation of every plain `href` link-button inside a dehydrated block, with nothing to perform it afterwards. And during replay Angular calls every listener stashed on the element in turn and maps `stopImmediatePropagation()` to `stopPropagation()`, so a blocking listener could not stop the consumer's own listener on the same element anyway. The consumer's action handler guards itself, as Material documents for its `disabledInteractive` ("you should guard against such cases in your component").
- `@defer`: library templates contain no `@defer` (the directive has no template). A consumer may defer the directive with its entry point. Inside a dehydrated block, the button is its server HTML and works as a native element until the block hydrates, either through its hydrate trigger or through a replayable event on an element that carries `jsaction`. Inside `@defer (hydrate never)`, Angular annotates nothing (no `jsaction`), so buttons and links work as native elements and disabled states hold; consumer `(click)` handlers there never run, which is the consumer's choice of block.
- Prerendering: identical to SSR; the directive reads no request token (rule 11).
- Consumer hazards stated for the docs, both Angular behaviour rather than the directive's: a consumer `(click)` listener on an `a[nfsButton]` inside a dehydrated block makes the dispatcher cancel the native navigation (RouterLink then navigates on replay; a plain `href` does not); and an `<a>` that is itself a root node of a `@defer (hydrate on interaction)` block gets the trigger's `click` and `keydown` `jsaction` and is cancelled the same way, so such a link is wrapped in an element (`hydrate on hover` annotates only `mouseenter`, `mouseover`, and `focusin`, which the dispatcher does not cancel). Links that must navigate natively in deferred regions carry no click listener and are not block root nodes.

## Testing Decisions

A good test here asserts what a user or assistive technology observes: the role, the accessible name, `type`, `disabled`, `aria-disabled`, the classes, whether Tab reaches the element, and whether a click submits, navigates, or reaches a handler. No test reads the directive's fields. There is no prior art in the new repository; the patterns are the building-blocks testing rule, Angular's own `renderApplication`-based SSR tests, and the Angular Components universal-app e2e (hydration counters and no NG05xx errors).

Story ids follow `button--<story>`: `button--basics`, `button--sizes`, `button--colors`, `button--fills`, `button--expanded`, `button--disabled`, `button--disabled-interactive`, `button--dropdown-arrows`, `button--icon-only`, `button--in-form`, `button--toggle`, `button--button-group`, `button--split-button`.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Run by `npx nx test-storybook <lib>`. Every story runs axe with `parameters.a11y.test = 'error'` and the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, plus `best-practice`, which include `target-size`, `color-contrast`, `button-name`, and `link-name`), under the Storybook preview settings that carry the required `$button-palette`.

- `button--basics`: each host has `.button`; the `<button>` has `type="button"`; the `<a>` has an `href` and no `type`; `getByRole('button')` and `getByRole('link')` find them by name.
- `button--sizes`, `button--colors`, `button--fills`, `button--expanded`: the Variant classes render under Foundation CSS (computed `font-size` for `.small` equals Foundation's `0.75rem`; `.expanded` computed width equals the container's); the directive adds nothing but `.button` and `type`.
- `button--disabled`: the natively disabled button has `disabled`, is skipped by `userEvent.tab()`, and a click does not call the story's spy; the disabled link has no `href`, is still found by `getByRole('link', {name: 'Next'})`, carries `aria-disabled="true"` and `.disabled`, and is skipped by Tab; toggling the story's control back restores `href` and removes `role`, `aria-disabled`, and `.disabled`.
- `button--disabled-interactive`: Tab reaches the disabled button; it has `aria-disabled="true"`, `.disabled`, and `type="button"`; its `aria-describedby` text is exposed; clicking it does not fire the form's `submit`; enabling it restores `type="submit"` and a click submits.
- `button--in-form`: a plain `nfsButton` click does not fire `submit`; `type="submit"` and the `.submit` marker do; `type="reset"` resets a field.
- `button--dropdown-arrows`, `button--icon-only`: `.arrow-only` and icon-only buttons are found by their `.show-for-sr` names ("Show menu", "Close").
- `button--toggle`: clicking flips `aria-pressed` between `false` and `true` and the accessible name stays the same.
- `button--button-group`, `button--split-button`: group classes size and color the children (computed style), the group is found by `getByRole('group', {name})`, and the arrow-only button toggles its Dropdown pane through `nfsToggle` (`aria-expanded` flips).

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

Vitest browser mode under the Angular unit-test builder (`npx nx test <lib>`, Chromium headless): TestBed specs in `<name>.spec.ts` next to the directive, over a bare test host component, zoneless with `await fixture.whenStable()`, asserting DOM and ARIA state; no story is mounted here and no axe runs here.

- Host binding table, driven by data: for each host tag and each combination of `disabled`, `disabledInteractive`, and `type`, assert `type`, `disabled`, `aria-disabled`, `role`, and `.disabled` against the host binding table above, including transitions in both directions.
- `type` sources: a static `type="submit"`, a `[type]` binding changing at runtime, the `.submit` marker, and no type at all.
- Echoing: a static `role="switch"` on a `<button>` survives every state; a static `.disabled` class on an enabled host is left in place; a static `disabled` attribute on `<a>` feeds the input and is removed from the DOM.
- RouterLink: with `provideRouter`, `[routerLink]="null"` plus `[disabled]="true"` yields no `href` and the disabled-link attributes; switching to a route restores `href`, and a click navigates.
- Dev-mode checks: a disabled `<a>` with an `href` warns once; an enabled `<a>` with no `href` warns once; a correctly disabled link and a normal link do not warn.
- Zoneless: the suite runs with zoneless change detection and `fixture.whenStable()`; no test needs `NgZone`.

### 3. Node-level Vitest

- SSR smoke: `renderApplication` over a fixture component (with `provideRouter`) holding a default button, a `type="submit"` button, a `.submit`-marker button, a natively disabled button, a `disabledInteractive` disabled submit button, an enabled link, a disabled router link, and a split button. Assert `whenStable()` resolves; the server HTML contains every attribute and class from the Rendered HTML section; the disabled router link has no `href`; and no host that carries no listener from the consumer or another directive has a `jsaction` attribute. Runs under `npx nx test <lib>` in `<name>.ssr.spec.ts` through the shared `renderServer()` helper; `npx nx test-node <lib>` only if the server path depends on the DOM adapter.
- Pure logic: none worth isolating; the host expressions are covered through the DOM in layer 2.
- Sass compile, WCAG rules: `@include nfs-button;` over Foundation's defaults fails with `@error` naming `alert` (solid, hollow, clear), `success` (hollow, clear, and the solid arrow), and `warning` (the same); with the required `$button-palette` it compiles and emits exactly `.button { min-width: 24px; min-height: 24px; }`; `$button-opacity-disabled: 0.6` with the required palette fails the 1.4.1 check; a `$button-background` whose pair with `$button-color` is 4.49:1 fails although Foundation's `color-contrast()` reports 4.5.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build:

- Tab order in `button--disabled` and `button--disabled-interactive` in Chromium, Firefox, and WebKit with real key presses (buttons in all three engines; links in Chromium and Firefox, because whether Tab reaches links in WebKit depends on a platform keyboard preference).
- Implicit submission with real key presses in `button--in-form`: Enter in a two-field form whose submit button is `disabledInteractive` and disabled does not submit; with a natively disabled submit button it does not submit; with an enabled one it does.
- WCAG 2.2 AA checks that need real layout, in three engines: target size (2.5.8), every button's border box in `button--sizes` and `button--dropdown-arrows` measures at least 24 by 24 px, including the `.tiny` button labelled `I`; focus visible (2.4.7), a screenshot comparison before and after Tab to the `.button` and the `a.button` in `button--basics` shows a focus indicator.

Against the prerendered fixture app (the harness from the rendering-mode test seam prototype):

- JavaScript disabled: screenshot plus axe (`@axe-core/playwright` with `withTags` on `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, and `best-practice`) on the server HTML; clicking the disabled router link leaves the URL unchanged; clicking a plain `nfsButton` inside a form does not submit; the natively disabled button ignores clicks.
- Hydration: no NG05xx in the console and `ngDevMode.componentsSkippedHydration === 0`.
- Pre-hydration clicks with the main bundle delayed: an enabled `a[nfsButton]` navigates natively; a button with a consumer `(click)` replays it exactly once after hydration; a natively disabled button produces no replay.
- Dehydrated block: inside `@defer (hydrate when hydrateNow())` with the signal held `false`, an enabled plain-`href` `a[nfsButton]` with no consumer listener, placed as the block's root node, navigates natively when clicked (the regression test for D9: a `when` trigger adds no root-node `jsaction`, so any `jsaction` on the link could only come from the directive).
- `@defer (hydrate never)`: buttons and links inside work natively and disabled states hold.

## Out of Scope

- A Button Group directive. Button Group is a CSS-only component (map, Out of scope); this spec gives its markup, accessibility guidance, and the split-button composition only.
- A Close Button directive. `.close-button` is markup closed by the Triggers utility's `nfsClose`; `data-closable` belongs to the Triggers spec.
- Typed appearance inputs and runtime appearance defaults (D3, D4).
- `<input type="submit|button|reset">` and `<label class="button">` hosts (D11). Foundation's `.button` class still works on them as plain markup.
- A toggle-button model (D12) and Material's button toggle group.
- Material's ripple, progress indicator, icon slots, FAB and icon-button variants.
- Runtime theming through custom properties (building-blocks Sass and theming rule).
- The Sass packaging of Foundation's button mixins for the new repository, which the Sass packaging ticket owns.

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | Attribute directive on native `<button>` and `<a>` | ADR 0001; native semantics, keyboard, and form behaviour come free; Material does the same | A component with a template (Material's `MatButton` renders ripple, label, and focus-indicator spans the library does not need) |
| D2 | One class, selector `button[nfsButton], a[nfsButton]` | One import covers both hosts; Material's shape | Separate `NfsButton` and `NfsAnchorButton` classes (considered to give only `<button>` a listener; unnecessary once no listener exists) |
| D3 | Variant classes are consumer-written; no `size`, `color`, `fill`, `expanded`, `dropdown`, `arrowOnly` inputs | The classes are the public styling contract; the repo design skill's rule "purely for styling: apply the class directly, no directive needed"; open sets from `$button-palette` and `$button-sizes`; `.solid` versus `.hollow` depends on `$button-fill`; responsive `-expanded` classes need no model; Button has no Options for inputs to mirror | Building-blocks Table A's typed inputs (a `fill` enum, `size` and `color` string unions): a second spelling of the same classes that must track the consumer's Sass maps |
| D4 | No Defaults token | Glossary: a Defaults token replaces a Plugin's `Foundation.X.defaults`, and Button has none; appearance defaults are Sass settings | `nfsButtonDefaultsToken` modelled on `MAT_BUTTON_CONFIG` |
| D5 | `type` input, default `button`, `submit` with the `.submit` marker | Foundation's docs callout; prevents accidental submission; keeps Foundation's docs markup submitting; explicit `type="button"` also stays compatible with future Invoker Commands (HTML runs commands for Button-state buttons, not Auto-state ones inside a form) | No default (Material, HTML); a static host attribute (would also land on `<a>`); a constructor `setAttribute` like Aria's accordion trigger (a construction-time DOM write, which the building-blocks rendering rules forbid) |
| D6 | Native `disabled` is the default on buttons | APG keyboard practice: remove disabled controls from the tab order when their presence can be inferred; the only mode the platform enforces before hydration and in `hydrate never` | Aria's composite-item default (`aria-disabled`, focusable), which the APG reserves for elements that must stay discoverable |
| D7 | `disabledInteractive` opt-in; renders `aria-disabled`, `.disabled`, and `type="button"` while disabled | Material's name and behaviour for the same element; Foundation's CSS styles `.disabled` only; forcing `type="button"` removes the submit and reset default actions natively, in every rendering mode | A click-blocking host listener (fails before hydration and during replay, and would add `jsaction` to every host); leaving submit active (Material's documented caveat) |
| D8 | A disabled link is a placeholder link: the consumer removes the target, the directive adds `role="link"`, `aria-disabled="true"`, `.disabled`, and dev-mode checks | HTML's placeholder link is non-focusable and non-navigable with no script; WAI-ARIA advises against `aria-disabled` on an `href` link; RouterLink owns `href` through its own host binding, so the directive cannot own it | Material's `aria-disabled` plus `tabindex="-1"` plus a click listener (navigates before hydration, in `hydrate never`, and whenever another directive's click listener runs first); the directive owning `href` through an input (collides with RouterLink's `[attr.href]`) |
| D9 | No event listeners at all | Keeps plain links navigating inside dehydrated blocks (dispatcher `preventDefault` on anchors with `jsaction`); replay cannot honour a blocker anyway | Host `(click)` listener |
| D10 | Button Group and Close Button stay markup | The map lists Button Group as CSS-only and out of scope; the group cascade needs no Parent token; `.close-button` is a different class contract and closes through `nfsClose` | `nfsButtonGroup` providing size and color through a Parent token; `button[nfsCloseButton]` |
| D11 | No `input[type=submit]` or `input[type=button]` hosts | An `<input>` cannot hold `.show-for-sr` text, icons, or the `.dropdown` `::after` arrow; Foundation's docs never show it; native `disabled` already works there without a directive | Adding `input[type=submit][nfsButton]` to the selector |
| D12 | `aria-pressed` stays the consumer's; no `pressed` model | Foundation has no pressed class or style; Toggler's class mode already covers toggling a class with `aria-pressed` | A `pressed` model with a click handler (would need a listener and custom CSS) |
| D13 | No outputs, no methods, no custom harness | Native events and `focus()` suffice; building-blocks testing rule asserts the DOM | Material's `focus(origin)`, `MatButtonHarness` |
| D14 | Static `role` is echoed; `.disabled` binds `true` or `undefined` | A host binding with `null` would erase a consumer's static `role` or `.disabled` | Plain `null` bindings |
| D15 | Library CSS is one `.button` minimum-size rule in the `nfs-button` mixin; everything else is Foundation's | Foundation's `.button`, `.disabled`, and `[disabled]` rules cover every state the directive produces; WCAG 2.2 AA 2.5.8 is required for every directive (ADR 0022) and Foundation has no minimum-size setting, while its default `.tiny` width drops under 24 px for a narrow label | No library CSS (this spec's first version, which left 2.5.8 to settings and labels); `pointer-events: none` on disabled links, which the placeholder link makes unnecessary |
| D16 | The `nfs-button` mixin checks label contrast (4.5:1), arrow contrast (3:1), and the disabled lightness difference (3:1) at compile time with `@error`, unrounded | ADR 0022; the settings are solid Sass colours, so the check is exact; axe tests only the resting state and has no 1.4.11 rule | A docs recommendation; `@warn` (a consumer on Foundation's defaults would ship failing `.alert` buttons); Foundation's `color-contrast()`, which rounds 4.498 up to 4.5 |
| D17 | Required palette `alert: #bf3f2c`, `success: #177a3d`, `warning: #8a5a00` through `$button-palette` | The only settings-level fix: one palette entry drives the solid, hollow, and clear classes, so the entry must pass on white; it leaves `$foundation-palette` (callouts, labels) alone; `#bf3f2c` matches Abide's required alert colour | A library rule recolouring `.hollow.success` and friends (re-implements Foundation styles); changing `$foundation-palette` (recolours every component) |

### Usage examples

```ts
@Component({
  selector: 'app-invoice-actions',
  imports: [FormsModule, NfsButton, RouterLink],
  template: `
    <form (ngSubmit)="save()">
      <!-- While saving() is true this renders type="button", so it cannot submit -->
      <button nfsButton type="submit" class="success"
              [disabled]="saving()" disabledInteractive
              aria-describedby="save-hint">Save</button>
      <p id="save-hint" class="help-text">{{ saving() ? 'Saving...' : '' }}</p>

      <!-- Focusable while locked: the click still arrives, so the handler guards itself -->
      <button nfsButton class="alert hollow"
              [disabled]="locked()" disabledInteractive
              aria-describedby="lock-hint" (click)="remove()">Delete</button>
      <p id="lock-hint" class="help-text">{{ locked() ? 'Paid invoices cannot be deleted.' : '' }}</p>
    </form>

    <a nfsButton class="small" [routerLink]="isLast() ? null : ['/invoices', next()]"
       [disabled]="isLast()">Next invoice</a>

    <button nfsButton class="clear" [attr.aria-pressed]="pinned()" (click)="togglePin()">Pin</button>
  `,
})
export class InvoiceActions {
  protected readonly saving = signal(false);
  protected readonly locked = signal(false);
  protected readonly pinned = signal(false);
  // isLast, next, and save omitted

  protected remove(): void {
    if (this.locked()) {
      return;
    }

    // delete the invoice
  }

  protected togglePin(): void {
    this.pinned.update((pinned) => !pinned);
  }
}
```

```html
<!-- Icon-only button (Foundation's accessibility pattern) -->
<button nfsButton class="alert">
  <span class="show-for-sr">Delete invoice</span>
  <span aria-hidden="true"><i class="fi-trash"></i></span>
</button>

<!-- Close button: Foundation markup plus a Trigger, no nfsButton -->
<div class="callout" nfsToggler animate="nfs-fade-in nfs-fade-out" id="notice">
  <p>Invoice sent.</p>
  <button class="close-button" type="button" aria-label="Dismiss notice" nfsClose>
    <span aria-hidden="true">&times;</span>
  </button>
</div>

<!-- Button group sized and colored once -->
<div class="small primary button-group" role="group" aria-label="Export">
  <button nfsButton>PDF</button>
  <button nfsButton>CSV</button>
</div>
```

The callout is itself an `nfsToggler` in visibility mode, the [Spec: Triggers (shared utility)](../issues/54-spec-triggers.md)'s in-place `data-closable` replacement, so the bare `nfsClose` has a Nearest Openable to close.

### Platform features to adopt when the browser target moves

- Invoker Commands (`command`, `commandfor`; Baseline newly available December 2025, out of target): no change needed here. An explicit `type="button"` keeps commands working inside forms, where HTML runs a command only for a button in the Button state and returns early for one in the Auto state. Adoption belongs to the Triggers utility spec.
- Nothing else in the platform research applies to Button. `:focus-visible` is already in target and is what the browser's default focus ring uses.

### Foundation behaviour changed or dropped

- `disable-mouse-outline` (`[data-whatinput='mouse'] .button { outline: 0 }`) relies on the what-input library that Foundation's JavaScript brings in. The library never loads it, so the rule never matches and the browser's own `:focus-visible` heuristic decides when the ring shows (keyboard focus shows it, mouse clicks on buttons do not). Nothing to port.
- Disabled links: Foundation keeps `href` and a valueless `aria-disabled`; the library renders a placeholder link with `role="link"` and `aria-disabled="true"` (D8).
- `.disabled` alone: still Foundation's visual class; the `disabled` input is what disables.
- `.submit`: gains its documented meaning as the `type` default (D5).
- Foundation's docs put `href` on some `<button>` examples and use `<a class="button">` without `href` in Button Group examples; both are docs sloppiness, and the second is caught by the dev-mode placeholder-link warning when `nfsButton` is present.

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. The directive relies on Foundation's button and button-group partials, included through Foundation's export mixins `foundation-button` (and `foundation-button-group` and `foundation-close-button` when that markup is used), configured through the `$button-*`, `$buttongroup-*`, and `$closebutton-*` variables; every class the directive binds or the consumer writes (`.button`, the size, colour, and fill classes, `.expanded`, `.dropdown`, `.arrow-only`, `.disabled`) is already styled by those partials. Its documented custom CSS is the `nfs-button` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-button`. (1) Rules: one, `.button { min-width: 24px; min-height: 24px; }`, because Foundation's button size comes from font size and em padding with no minimum setting (WCAG 2.2 AA 2.5.8); no rule duplicates or overrides Foundation's button, button group, or close button styles. (2) Reused settings: none copied into emitted CSS; the mixin's compile-time checks read `$button-color`, `$button-color-alt`, `$button-background`, `$button-background-hover`, `$button-palette` (with its hover lightness), `$button-hollow-hover-lightness`, `$body-background`, and `$button-opacity-disabled` from the consumer's compile and stop the build with `@error` when a label, arrow, or disabled pair fails 1.4.3, 1.4.11, or 1.4.1. (3) Custom properties: none. (4) Motion classes: none, and no `prefers-reduced-motion` override; Foundation's own `$button-transition` colour change is not motion (Animation). (5) What breaks when the include is missing: the one minimum-size rule is absent, so a narrow `.tiny` label can fall under 24 by 24 px, and the compile-time checks do not run, so a failing `$button-palette` or `$button-opacity-disabled` compiles with no warning.

### Notes

- RTL: Foundation compiles direction into the CSS (`$global-text-direction`, `float: $global-right` for the `.dropdown` arrow); the directive has nothing direction-dependent.
- Target size and contrast: see WCAG 2.2 AA under Implementation Decisions (measured sizes, computed ratios, the `nfs-button` floor rule, and the required palette).
