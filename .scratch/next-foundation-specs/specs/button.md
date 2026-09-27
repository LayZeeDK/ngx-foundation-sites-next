# Spec: Button

Ticket: [Spec: Button](../issues/37-spec-button.md), revised under the class rule by [Re-run: Button spec under the class rule](../issues/128-rerun-button-class-rule.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass.

## Problem Statement

A developer building an Angular application on Foundation for Sites writes `.button` markup by hand. Foundation's Button is a CSS-only component: it ships Sass and classes and no Plugin, so the markup contract is all there is, and that contract leaves the hard parts to the author:

- A `<button>` inside a form submits it unless the author remembers `type="button"`. Foundation's docs ask for exactly that in a callout, and mark real submit buttons with a `.submit` class that has no CSS and no behaviour.
- The `.disabled` class is, in Foundation's own words, "a purely visual style, and won't actually disable a control". Nothing in Foundation's CSS styles `aria-disabled`, so a button that must stay focusable while unavailable has no look.
- Foundation's disabled link, `<a class="button disabled" href="#" aria-disabled>`, keeps its `href`: it stays in the tab order and still navigates. Its `aria-disabled` has no value, which WAI-ARIA treats as `false`. WAI-ARIA advises against `aria-disabled` on elements the host language cannot disable, and a link with an `href` is such an element.
- Icon-only and arrow-only buttons have no accessible name unless the author adds `.show-for-sr` text and hides the icon.
- The look is a set of class names generated from Sass settings the developer configures (`$button-sizes`, `$button-palette`, `$button-fill`, `$button-responsive-expanded`). A misspelt `primray`, a colour removed from `$button-palette`, or `medium-expanded` while `$button-responsive-expanded` is off renders a plain button, and nothing reports it.

A server-rendered Angular application adds a second problem: whatever the Angular layer does must already be right in the server HTML, must not break hydration, and must keep links and buttons working before hydration, inside dehydrated `@defer (hydrate on ...)` blocks, and inside `@defer (hydrate never)` blocks, where no JavaScript ever runs for them.

## Solution

One attribute directive, `nfsButton`, on the native `<button>`, `<a>`, and `<input type="submit|button|reset">` elements the developer already writes. It binds Foundation's `.button` class and sets every Variant class from a typed input: `size`, `color`, `fill`, `expanded` (with its responsive forms), `dropdown`, and `arrowOnly`. The developer writes no Foundation class ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)). Sizes and colours are Foundation's default names extended by the developer's Variant declaration file, which the library's tooling generates from the Sass settings, so a misspelt or removed name fails to compile ([ADR 0040](../adr/0040-variant-input-types.md)); every Variant input left unset sets no class, so the Sass defaults decide the look.

The directive defaults `<button>` to `type="button"` and owns the disabled contract: native `disabled` on buttons by default, an opt-in focusable disabled mode that looks disabled through Foundation's `.disabled` class and cannot submit or reset a form, and a disabled link rendered as an HTML placeholder link that is announced as an unavailable link. Every effect is a host binding on signal inputs, so the server HTML is the final DOM, and the directive declares no event listeners, so it adds nothing that Angular's event replay has to queue and it never causes Angular to cancel a link's native navigation inside a dehydrated block.

Button Group and Close Button have their own specs: the [Spec: Button Group](../issues/82-spec-button-group.md) and the [Spec: Close Button](../issues/83-spec-close-button.md).

What earns the directive a place, stated plainly: under the class rule, the classes do. The developer writes no Foundation class, so `nfsButton` is how `.button` and its Variant classes reach an element at all, and its typed inputs turn a misspelt name into a compile error. Beyond the classes it fixes the three things Foundation's markup gets wrong or leaves out, so that they hold in every rendering mode: the `type` default, a disabled state that actually disables (for links as well as buttons), and a focusable disabled state that Foundation's CSS can style. A defaults token and a toggle model were considered and rejected below.

## User Stories

1. As an application developer, I want to put `nfsButton` on a native `<button>` and get Foundation's `.button` styling, so that I never write a Foundation class.
2. As an application developer, I want to put `nfsButton` on a native `<a href>` and get the same styling while it stays a real link, so that navigation keeps link semantics, middle-click, and "open in new tab".
3. As an application developer, I want an `nfsButton` `<button>` inside a form to default to `type="button"`, so that an action button never submits the form by accident.
4. As an application developer, I want `type="submit"` and `type="reset"` to work as written, so that submit and reset buttons behave as HTML defines.
5. As an application developer, I want to put `nfsButton` on `<input type="submit">`, `<input type="button">`, and `<input type="reset">`, so that an Input Group's submit button, as Foundation's Forms page shows it, gets Foundation's styling and the same disabled contract.
6. As an application developer, I want to bind `[type]` from component state, so that one button can switch between submit and plain action.
7. As an application developer, I want a `size` input that takes Foundation's size names (`tiny`, `small`, `large`), so that I use the names Foundation documents without writing its classes.
8. As an application developer, I want a `color` input that accepts exactly the colours of my own `$button-palette`, including custom names such as `purple`, so that my Sass settings are the only list of colors and a name my Sass does not generate fails to compile.
9. As an application developer, I want a `fill` input that takes `solid`, `hollow`, or `clear`, so that each renders its own fill whatever my `$button-fill` default is.
10. As an application developer, I want to bind a Variant input from state, such as `[color]="danger() ? 'alert' : undefined"`, so that appearance can follow state and the binding is type-checked.
11. As an application developer, I want `expanded` to take a Breakpoint query such as `expanded="medium only"` when I enable `$button-responsive-expanded`, so that breakpoint-specific width needs no JavaScript and no class name.
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
24. As a screen reader user, I want icon-only and arrow-only buttons to have a spoken name from screen-reader-only text, so that I know what they do.
25. As a screen reader user, I want a toggle button to expose `aria-pressed` and keep its label unchanged, so that I hear its state rather than a changing name.
26. As an application developer, I want to put the Triggers utility's directives (`nfsToggle`, `nfsOpen`, `nfsClose`) on an `nfsButton`, so that a Foundation-styled button can open a Dropdown pane or a Reveal.
27. As an application developer, I want `dropdown` and `arrowOnly` inputs, so that a button shows Foundation's dropdown arrow beside its label or alone.
28. As an application developer, I want a misspelt Variant value (`color="primray"`, `dropdown="flase"`, `expanded="meduim"`) to fail to compile, so that a typo never ships as a plain button.
29. As an application developer, I want every Variant input I leave out to set no class, so that my Sass settings (`$button-fill`, `$button-background`, the `default` size) decide the look.
30. As a developer of a server-rendered application, I want the server HTML to carry the final classes, `type`, `disabled`, `aria-disabled`, and `role`, so that the first paint is correct and hydration changes nothing.
31. As a developer of a server-rendered application, I want an enabled `nfsButton` link to navigate natively when clicked before hydration or inside a dehydrated `@defer` block, so that the directive never swallows a navigation.
32. As a developer of a server-rendered application, I want a natively disabled button to ignore clicks before hydration, so that no click reaches my handler as a Replayed event after hydration.
33. As a developer using `@defer (hydrate never)`, I want buttons and links inside the block to keep working as native elements, so that static regions need no JavaScript.
34. As a developer of a prerendered site, I want the same output as server rendering, so that prerendering needs no special handling.
35. As a developer of a zoneless application, I want the directive to need no zone, so that it works with zoneless change detection.
36. As a user who prefers reduced motion, I want buttons to stay free of motion animation, so that nothing moves when I hover or focus them.
37. As a keyboard user, I want the browser's own focus indicator on buttons and links, so that I can always see where focus is.
38. As an application developer, I want to import the directive from its own entry point, so that a `@defer` block can split it with the rest of the block's content.
39. As a library maintainer, I want every behaviour asserted through roles, attributes, and classes in stories, browser-level tests, a server-render smoke test, and e2e, so that regressions surface at the layer that owns them.
40. As a pointer and touch user, I want every button to be at least 24 by 24 CSS pixels whatever the size, label, or Sass settings, so that each button meets the WCAG 2.2 minimum target size.
41. As a user with low vision, I want every button label and every dropdown arrow to reach WCAG 2.2 AA contrast at rest, on hover, and on focus, so that I can read every button in every fill and color.
42. As an application developer, I want the library's Sass to stop my build when a button setting fails WCAG 2.2 AA contrast, naming the setting, so that I never ship a failing palette without knowing.
43. As an application developer, I want a development-mode report when a bound Variant value has no class in my compiled CSS (a responsive `expanded` while `$button-responsive-expanded` is off, a colour removed from `$button-palette` but still declared, a missing `nfs-button` include), so that drift between my Variant declaration file and my Sass shows up before release.
44. As an application developer whose `$button-fill` is `hollow`, I want a solid dropdown button to keep a visible arrow, so that `fill="solid"` with `dropdown` looks like Foundation's solid dropdown button.
45. As an application developer, I want a development-mode warning when `arrowOnly` is set without `dropdown`, or either is set on an `<input>` host, so that I notice an arrow that cannot render.
46. As an application developer migrating Foundation markup, I want a copied `class="small alert"`, `class="disabled"`, or `class="submit"` on an `nfsButton` host to be reported in development, so that I learn to bind `size`, `color`, `disabled`, or `type="submit"` instead of wondering why the button looks or behaves differently.

## Implementation Decisions

### Foundation contract

Button has no Plugin, no `defaults` object, no `data-*` Options, no events, and no methods. Its whole contract is Sass and classes (Foundation's button Sass partial and its Button docs page, with its `<input>` and `<label>` hosts on the Forms page). Dropped options: none, because there are none.

| Feature | Class or markup | Source of the names | Notes |
| --- | --- | --- | --- |
| Button | `.button` | `@mixin foundation-button` | Structural class; applies to any element. Foundation's docs show it on `<a>`, `<button>`, `<input type="submit">` (the Forms page's Input Group, repeated on the Kitchen Sink page), and `<label>` (the Forms page's file upload); `a.button` loses its underline on hover and focus |
| Sizes | `.tiny`, `.small`, `.large` | `$button-sizes` (`tiny: 0.6rem`, `small: 0.75rem`, `default: 0.9rem`, `large: 1.25rem`), `default` key removed from the class loop | Open Variant family; no class for the default size |
| Colors | `.primary`, `.secondary`, `.success`, `.warning`, `.alert` | `$button-palette`, defaulting to `$foundation-palette` | Open Variant family (docs show `map-merge` with `purple`); no class means `$button-background` |
| Fills | `.solid`, `.hollow`, `.clear` | `@each $filling in (solid hollow clear)`, whose selector for the fill equal to `$button-fill` is the bare `.button` | Closed Variant family. With the default `$button-fill: solid` there is no `.solid` rule and the bare `.button` is solid; with `hollow` as default, `.solid` and `.clear` have rules and `.hollow` does not. Either way each class renders its own fill |
| Full width | `.expanded`; `.<bp>-only-expanded`, `.<bp>-expanded`, `.<bp>-down-expanded` | `button-expand`; the responsive forms loop over `$breakpoint-classes` behind `$button-responsive-expanded` (false by default) | CSS media queries; no JavaScript. Foundation generates `.<bp>-only-expanded` for every Class breakpoint and the other two only for Class breakpoints other than the Zero breakpoint |
| Disabled look | `.disabled` or `[disabled]` | `button-disabled` (opacity `$button-opacity-disabled` 0.25, `cursor: not-allowed`); fill styles keep base colors on hover and focus | No rule for `[aria-disabled]` |
| Dropdown arrow | `.dropdown` | `button-dropdown` (`::after` triangle in `$white`, `float: $global-right`) | Visual only; the docs point to the Dropdown plugin for behaviour. Under `$button-fill: hollow` Foundation recolours every `.dropdown` arrow to `$button-background`, `.solid` included |
| Arrow only | `.arrow-only` | `&.arrow-only::after` | Repositions the `.dropdown` arrow and draws nothing without it; the button needs screen-reader-only text |
| Focus outline | `disable-mouse-outline` | `[data-whatinput='mouse'] &` | Depends on the what-input library, which Foundation's JavaScript loads; see Further Notes |
| Transition | `$button-transition` | `background-color 0.25s ease-out, color 0.25s ease-out` | Color only |

Button Group (`.button-group`) and Close Button (`.close-button`) are separate CSS-only components with their own docs pages and their own specs.

Docs conventions the spec keeps or corrects: `type="button"` on every non-submit `<button>` (kept, now the default); the `.submit` marker on submit buttons (dropped: under the class rule a submit button says `type="submit"`, D5); `aria-disabled` without a value on disabled links (corrected: `aria-disabled="true"` with `role="link"` on a link whose target is removed); screen-reader-only text plus an `aria-hidden="true"` icon for icon-only buttons (kept as guidance, with the [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md)'s directive for `.show-for-sr` in place of the class).

### CSS class to Angular mapping

Structural and State classes:

| Foundation class | Angular | Rationale |
| --- | --- | --- |
| `.button` on `<button>`, `<a>`, or `<input type="submit\|button\|reset">` | `NfsButton` directive adds `.button` as a static host class | The one Structural class; directive-first (ADR 0001, ADR 0039) |
| `.disabled` | State class, a host binding of `NfsButton` while a link or a focusable disabled button is disabled; a copied static one is stripped and reported in development (D22) | Foundation's CSS styles `.disabled` and `[disabled]` but not `[aria-disabled]` |
| `[disabled]` | Native attribute bound by `NfsButton` on `<button>` and `<input>` hosts | Platform disabling |
| `.submit` | Neither read to seed `type` nor bound; a copied one is reported in development (D22) | A docs marker with no CSS; `type="submit"` says the same (D5) |

Variant classes, one row per family (building-blocks 1.14 item 2). `small` in the value column stands for the Zero breakpoint, the key of `nfsBreakpointsToken`'s map whose value is 0 (D20), and `medium` for any other Class breakpoint:

| Variant classes | Input | Type alias | Sass setting and Variant registry | Value shape | Class each value sets | Variant property |
| --- | --- | --- | --- | --- | --- | --- |
| `.tiny`, `.small`, `.large` | `size` | `NfsButtonSize` | `$button-sizes`; `NfsButtonSizesOverrides` | Name | The name's class; `'default'` and no value set none | `--nfs-button-sizes` |
| Palette classes (`.primary`, `.secondary`, `.success`, `.warning`, `.alert` by default) | `color` | `NfsButtonColor`, built on `NfsFoundationPaletteColor` | `$button-palette`, which defaults to `$foundation-palette`; `NfsButtonPaletteOverrides`, chained on `NfsFoundationPaletteOverrides` | Name | The name's class; no value sets none, so `$button-background` is the look | `--nfs-button-palette` |
| `.solid`, `.hollow`, `.clear` | `fill` | `NfsButtonFill` | Closed | Name | The name's class, whatever `$button-fill` is (the class equal to `$button-fill` has no rule, and the bare `.button` already has that fill); no value sets none | None (closed) |
| `.expanded`, `.<bp>-expanded`, `.<bp>-only-expanded`, `.<bp>-down-expanded` | `expanded` | `NfsButtonExpanded`, over `NfsButtonExpandedQuery` | `.expanded`: closed. The responsive forms: `$breakpoint-classes` (`NfsBreakpointClassesOverrides`), generated only while `$button-responsive-expanded` is true | `true` (or the bare attribute) or a Breakpoint query with `up`, `only`, or `down` | `true` sets `.expanded`; `'medium'` and `'medium up'` set `.medium-expanded`; `'medium only'` sets `.medium-only-expanded`; `'medium down'` sets `.medium-down-expanded`. Zero-breakpoint gaps (Foundation generates neither `.small-expanded` nor `.small-down-expanded`): `'small'` and `'small up'` set `.expanded`, `'small down'` sets `.small-only-expanded`. `false` and no value set none | `--nfs-button-responsive-expanded`, for the responsive forms only |
| `.dropdown` | `dropdown` | `boolean` through `nfsVariantBoolean` | Closed | Boolean | `.dropdown` | None (closed) |
| `.arrow-only` | `arrowOnly` | `boolean` through `nfsVariantBoolean` | Closed | Boolean | `.arrow-only`, which draws nothing without `dropdown` (D21) | None (closed) |

### Hierarchy and DI shape

```
button[nfsButton] | a[nfsButton] | input[type=submit|button|reset][nfsButton]      NfsButton (standalone directive, no template)
```

- One directive class for every host element, Material's shape (`MatButton` covers `button[matButton], a[matButton]`, and `MatAnchor` is an alias of it). Separate classes would let a consumer import one and silently lose the other selectors. The `<input>` selectors name the static `type`, so a text field never matches, and an `<input>` host needs its `type` written as a static attribute.
- No parent, no children, no Parent token, no host directives, no providers. Nothing needs to find a button through DI. `NfsButton` declares and reads no group token: a Button Group's Variant classes reach its buttons through Foundation's descendant selectors, and the group checks its buttons' inputs in development through a content query ([Spec: Button Group](../issues/82-spec-button-group.md), D2 and D5).
- No Defaults token. Defaults tokens replace a Plugin's `Foundation.X.defaults`, and Button has none; a Defaults token never holds a Variant input's default (ADR 0040), because the Variant defaults are Sass settings (`$button-fill`, `$button-background`, the `default` entry of `$button-sizes`). Material's `MAT_BUTTON_CONFIG.disabledInteractive` was considered; it is added only if an application-wide need appears.
- Injection: `ElementRef` (host tag, once, at construction), `HostAttributeToken('role')` (optional; the static role, echoed when the directive is not overriding it), `nfsBreakpointsToken` (the Zero breakpoint for `expanded`, D20), and, in development builds or under a production opt-in, the Runtime checks' Variant check (optional; its shape belongs to the [Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md)). In development builds only, `HostAttributeToken('class')` (optional) reads the static class list for the copied-class warning (D22); nothing is seeded from it, and the first version's `.submit` marker read is gone. No other dependencies.
- Entry point: the directive is its own secondary entry point, `ngx-foundation-sites/button`, per the building-blocks naming rule, so a consumer's `@defer` can split it. The type aliases `NfsButtonSize`, `NfsButtonColor`, `NfsButtonFill`, `NfsButtonExpanded`, and `NfsButtonExpandedQuery` are exported beside the directive. The registries `NfsButtonSizesOverrides` and `NfsButtonPaletteOverrides` live in the primary entry point `ngx-foundation-sites` with every other Variant registry, and the button entry point uses them as types only (ADR 0040). `nfsBreakpointsToken` comes from `ngx-foundation-sites/media-query`.

### API: `NfsButton`

Selector `button[nfsButton], a[nfsButton], input[type=submit][nfsButton], input[type=button][nfsButton], input[type=reset][nfsButton]`; `exportAs: 'nfsButton'`; standalone; OnPush does not apply (no template).

```ts
class NfsButton {
  readonly disabled: InputSignalWithTransform<boolean, unknown>;            // default false
  readonly disabledInteractive: InputSignalWithTransform<boolean, unknown>; // default false; <button> and <input> hosts
  readonly type: InputSignal<'button' | 'submit' | 'reset'>;                // default 'button'; <button> and <input> hosts
  readonly size: InputSignal<NfsButtonSize | undefined>;                    // default undefined: no class
  readonly color: InputSignal<NfsButtonColor | undefined>;                  // default undefined: no class
  readonly fill: InputSignal<NfsButtonFill | undefined>;                    // default undefined: no class
  readonly expanded: InputSignalWithTransform<NfsButtonExpanded, NfsVariantBoolean | NfsButtonExpandedQuery>; // default false
  readonly dropdown: InputSignalWithTransform<boolean, NfsVariantBoolean>;  // default false
  readonly arrowOnly: InputSignalWithTransform<boolean, NfsVariantBoolean>; // default false
}

type NfsButtonSize = NfsOverridableStringUnion<'tiny' | 'small' | 'large', NfsButtonSizesOverrides> | 'default';
type NfsButtonColor = NfsOverridableStringUnion<NfsFoundationPaletteColor, NfsButtonPaletteOverrides>;
type NfsButtonFill = 'solid' | 'hollow' | 'clear';
type NfsButtonExpandedQuery = NfsClassBreakpointQuery<'up' | 'only' | 'down'>;
type NfsButtonExpanded = boolean | NfsButtonExpandedQuery;
```

| Input | Type and transform | Default | Foundation equivalent | Delta |
| --- | --- | --- | --- | --- |
| `disabled` | `boolean`, `booleanAttribute` | `false` | `disabled` attribute on `<button>`; `.disabled` plus `aria-disabled` on `<a>` | On `<a>`: `aria-disabled="true"` (not valueless), `role="link"`, and the consumer removes the navigation target |
| `disabledInteractive` | `boolean`, `booleanAttribute` | `false` | None (Material's name) | New. While `disabled`, a `<button>` or `<input>` host stays focusable, gets `aria-disabled="true"` and `.disabled`, and renders `type="button"`. No effect on `<a>` hosts: a disabled link is never focusable |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'`; an `<input>` host always has the static `type` its selector requires | Docs: `type="button"` unless the button submits a form | New default. HTML's missing-value default for `<button type>` is the Auto state, which is a submit button in a form. Not used on `<a>` hosts |
| `size` | `NfsButtonSize` | `undefined` | `.tiny`, `.small`, `.large` from `$button-sizes` | New input. `'default'` names the map's `default` key and sets no class; it is a library literal outside the registry, because the key never generates a class. Has no effect inside `nfsButtonGroup`, whose rule resets its buttons to the default size; set `size` on the group |
| `color` | `NfsButtonColor` | `undefined` | Palette classes from `$button-palette` | New input. The consumer's own names reach the type through its Variant declaration file |
| `fill` | `NfsButtonFill` | `undefined` | `.solid`, `.hollow`, `.clear` | New input. Every value sets its class whatever `$button-fill` is |
| `expanded` | `NfsButtonExpanded`; the transform maps `NfsVariantBoolean` through `nfsVariantBoolean` and passes a Breakpoint query through | `false` | `.expanded` and the responsive `-expanded` classes | New input. One input for every form, with the Zero-breakpoint gaps filled |
| `dropdown` | `boolean`, `nfsVariantBoolean` | `false` | `.dropdown` | New input |
| `arrowOnly` | `boolean`, `nfsVariantBoolean` | `false` | `.arrow-only` | New input. Needs `dropdown`, as Foundation's `dropdown arrow-only` markup has it |

- Each Variant input's JSDoc names Foundation's class template and the Sass setting (AGENTS.md Design Philosophy 5). Each declares explicit type arguments that name the exported aliases, and the library build's assertion on the emitted typings covers all six (ADR 0040).
- Models: none. The directive owns no two-way state; `aria-pressed` toggling stays in the consumer's component (see ARIA).
- Outputs: none. The native `click`, `focus`, and `blur` events are the API; the directive neither wraps nor re-emits them.
- Methods: none. `focus()` is the native element method; Material's `focus(origin)` exists to feed `FocusMonitor`, which this library does not use for buttons.
- `exportAs: 'nfsButton'` exposes the nine input signals to template references (for example a sibling Tooltip reading `button.disabled()`).

Host bindings (all on signal state; the host tag is read once at construction, either `a` or a form button, `button` or `input`):

| Binding | `<button>` and `<input>` hosts | `<a>` host |
| --- | --- | --- |
| static `class` | `button` | `button` |
| `[class]` | The Variant classes: one `computed` list with at most one class per Variant input, mapped as in the Variant table | The same |
| `[attr.type]` | `button` while `disabled && disabledInteractive`, otherwise `type()` (on an `<input>`, the static `type`) | Not written (`null`) |
| `[attr.disabled]` | Present while `disabled && !disabledInteractive` | Not written (`null`), which also removes a static `disabled` that fed the input |
| `[attr.aria-disabled]` | `true` while `disabled && disabledInteractive` | `true` while `disabled` |
| `[class.disabled]` | `true` while `disabled && disabledInteractive`, otherwise `false` | `true` while `disabled`, otherwise `false` |
| `[attr.role]` | The static `role` attribute, echoed | `link` while `disabled`, otherwise the static `role` echoed |

- The Variant class list binds nothing for a value that is not one class token and nothing for a Breakpoint query it cannot parse; under the closed types only a cast or `$any()` reaches that guard, and the Variant check reports it.
- `[class.disabled]` binds a plain boolean (D14): under the class rule no consumer writes `.disabled`, so there is no static class to keep. A `class="disabled"` copied from Foundation's markup is stripped on server and client, because Angular's styling resolution consults a static class only when every binding for it is `undefined` (building-blocks 1.4), and D22 reports it. A copied Variant class is not stripped: the `[class]` list sets only the classes it lists, so the static class keeps styling beside the inputs' classes, and D22 reports it too.
- Attribute ownership: the directive owns `type`, `disabled`, `aria-disabled`, `role`, `.disabled`, and the Variant classes on its host. Consumers set the attributes through the inputs, as static attributes (which feed the inputs), or through `[type]`/`[disabled]` bindings (which bind the inputs). A consumer `[attr.type]`, `[attr.disabled]`, or `[attr.aria-disabled]` binding loses to the directive's host binding, per Angular's collision rule (both dynamic: the host binding wins). The spec's usage examples never use those forms. A consumer's own application classes (`class="invoice-action"`) are untouched, since the rule forbids only Foundation and library classes.
- Not combined with a directive that owns the same attributes: Aria's `ngToolbarWidget` and accordion trigger bind `[attr.disabled]` and `[attr.aria-disabled]` themselves, and Aria's tab binds `aria-disabled` and a static `role="tab"`, so the host bindings would fight. No spec in the destination puts `.button` on such an element; one that needs it decides the composition.
- Not combined with the Close Button's directive: `.close-button` is its own class contract, and that directive binds its own `type` (D10).
- Triggers on the same element: a Trigger (`nfsToggle`, `nfsOpen`, `nfsClose`) adds `aria-expanded`, `aria-controls`, and `aria-haspopup`, which `NfsButton` never touches. A Trigger never binds `type` (the [Spec: Triggers (shared utility)](../issues/54-spec-triggers.md), its design decision D13), so `type` stays with the consumer or `NfsButton` and the two directives never bind the same attribute; the Trigger warns in development mode on a typeless `<button>` inside a form.
- Dev-mode checks, in the one `afterRenderEffect` read phase below, only when `ngDevMode` is on (never on the server, never in production), each warning once per instance: an `<a>` host that is `disabled` but still has an `href` warns "disabled link still navigates: bind its href or routerLink to null"; an `<a>` host that is not `disabled` and has no `href` warns "a placeholder link is not focusable: use button[nfsButton] or add an href"; `arrowOnly` without `dropdown`, or either on an `<input>` host, warns "no dropdown arrow can render here: arrowOnly needs dropdown, and an <input> draws no ::after arrow; use button[nfsButton] dropdown" (D21); a static class list that holds a Foundation class the directive sets or replaces warns once, naming each class with its input, for example "class="small alert" and class="disabled" are set by nfsButton: bind size="small", color="alert", and [disabled] instead", and "class="submit" has no effect: write type="submit"" (D22). The copied-class check knows the closed names (`disabled`, `submit`, `solid`, `hollow`, `clear`, `expanded`, `dropdown`, `arrow-only`), the responsive `-expanded` pattern, and Foundation's default size and palette names; a redundant `button` merges with the static host class and is not reported.
- Variant check: in development builds, and in production only when the consumer lists the checks in `provideNfsProductionRuntimeChecks`, `NfsButton` reports its bound Variant values to the Runtime checks after the first render. `strictVariantNames` compares `color`, `size`, and the Breakpoint of a responsive `expanded` with `--nfs-button-palette`, `--nfs-button-sizes`, and `--nfs-button-responsive-expanded`, and reports any value that is not one class token or a query it cannot parse. A responsive `expanded` value (every query except the Zero breakpoint's `up` form, which sets `.expanded`) whose Breakpoint `--nfs-button-responsive-expanded` does not list is reported naming `$button-responsive-expanded`, since that list is empty while the flag is off. `strictVariantProperties` reports a missing `@include nfs-button;` when `--nfs-button-palette` and `--nfs-button-sizes` both read empty, never from the gated property, which is empty by default (D19). The report shape, the per-realm read, and the configuration are the Runtime checks' ([ADR 0040](../adr/0040-variant-input-types.md)).

### Implementation level and primitives

Implementation level: native platform. Everything a button does is the HTML `<button>`, `<input>`, and `<a>` element: activation on Enter and Space, `disabled` blocking clicks and implicit submission, `type` deciding the form action, and a link without `href` being a placeholder that is neither focusable nor navigable. `@angular/aria` has no button pattern in 22.2 (its patterns are accordion, combobox, grid, listbox, menu, tabs, toolbar, tree). `@angular/cdk` is not needed: `FocusMonitor` only tracks focus origin, which the browser's `:focus-visible` heuristic already covers for the focus ring, and `InteractivityChecker` has nothing to check. The Angular layer is host bindings over `input()` signals, one `computed` for the Variant class list, the static `role` read through `HostAttributeToken` (and the static `class`, in development builds only), and the Zero breakpoint from `nfsBreakpointsToken`; no `effect`, no timer, no observer.

Render hooks and lazy loading (building-blocks 1.5 and 1.9): the only render hook is one `afterRenderEffect` read phase, created only in development builds or when the consumer opts the Variant check into production. It carries the Variant check report and, in development only, the link, arrow, and copied-class warnings, and it re-runs only when the signals it reads change; `afterEveryRender` is not used, because no production behaviour depends on a render. `injectAsync` is not used: the directive declares no listener, and every effect is a host binding that must already be in the server HTML and in the first client render, so there is nothing to load later; the entry point is its own, so a consumer's `@defer` splits it.

Fallback: none needed. No part of the design depends on an unverified behaviour; the one source-derived risk (listeners on anchors inside dehydrated blocks) is avoided by construction and asserted in e2e.

### Comparison with Angular Material (`MatButton`, 22.2)

| Concern | Material | `NfsButton` |
| --- | --- | --- |
| Selector | `button[matButton], a[matButton]` plus legacy `mat-*-button` attributes | `button[nfsButton], a[nfsButton]`, and `input[type=submit\|button\|reset][nfsButton]` |
| Kind | Component with a template (ripple, label, focus indicator, touch target) | Directive, no template |
| Appearance | `matButton="text\|filled\|elevated\|outlined\|tonal"` input; `defaultAppearance` in `MAT_BUTTON_CONFIG` | Typed Variant inputs over Foundation's classes: `size`, `fill`, `expanded`, `dropdown`, `arrowOnly` (ADR 0040); the defaults are Sass settings |
| Color | `color` input (M2 themes only) | `color` input over `$button-palette`, extended by the consumer's Variant declaration file |
| Disabled `<button>` | Native `disabled` | Native `disabled` |
| Disabled `<a>` | `aria-disabled="true"`, `tabindex="-1"`, click listener with `preventDefault` and `stopImmediatePropagation` | Placeholder link (consumer removes the target), `role="link"`, `aria-disabled="true"`, `.disabled`, dev-mode checks, no listener |
| `disabledInteractive` | Yes; submit stays active (documented caveat); global default in `MAT_BUTTON_CONFIG` | Yes; renders `type="button"` while disabled; no global default |
| `type` | Not managed | Default `button` |
| `tabIndex`, `disableRipple`, `showProgress` | Inputs | None (native `tabindex`; no ripple; no progress slot) |
| `focus(origin)` | Method through `FocusMonitor` | None (native `focus()`) |
| `exportAs` | `matButton, matAnchor` | `nfsButton` |
| Testing | `MatButtonHarness` | DOM-first assertions; no harness |

Borrowed: the directive-on-native-element shape, one class for every host, the `disabledInteractive` name and its focusable `aria-disabled` behaviour, and typed appearance inputs, here named after Foundation's class families and closed over the consumer's Sass. Not borrowed: the component template, Material's appearance names (its classes are private; Foundation's are the styled contract the inputs map to), the config token, and the anchor click blocker.

### ARIA and keyboard

APG pattern: Button (command and toggle variants); Link for `<a>` hosts.

| Element or state | Rendered semantics | Source |
| --- | --- | --- |
| `button[nfsButton]` | Implicit role `button`; explicit `type` | WHATWG HTML, the button element |
| `input[type=submit\|button\|reset][nfsButton]` | Implicit role `button`; named from its `value` (Submit or Reset by default for those types); holds no content, so no screen-reader-only text and no icon | WHATWG HTML, the input element's button states; HTML-AAM input name computation |
| Natively disabled | `disabled` attribute: exposed as unavailable, removed from the tab order, receives no `click` | HTML ("A form control that is disabled must prevent any click events ... from being dispatched on the element"); APG keyboard-interface practice, "Focusability of disabled controls" |
| Focusable disabled (`disabledInteractive`) | `aria-disabled="true"`, `.disabled`, stays in the tab order, `type="button"` while disabled | APG Button pattern ("When the action associated with a button is unavailable, the button has aria-disabled set to true"); APG keyboard practice (use `aria-disabled` when the element must stay discoverable) |
| `a[nfsButton][href]` | Implicit role `link` | HTML |
| Disabled link | No `href` (consumer), `role="link"`, `aria-disabled="true"`, `.disabled`; not focusable, not navigable | HTML ("If the a element has no href attribute, then the element represents a placeholder for where a link might otherwise have been placed"); WAI-ARIA `aria-disabled` note on host-language equivalents; `link` supports `aria-disabled` |
| Toggle button | Consumer binds `[attr.aria-pressed]`; the label never changes with the state | APG Button pattern ("it is critical the label on a toggle does not change when its state changes") |
| Menu-opening or dialog-opening button | `aria-expanded`, `aria-controls`, and `aria-haspopup` come from the Triggers utility, not from `NfsButton` | Building-blocks Triggers rule |
| Icon-only, arrow-only | Name from a screen-reader-only child (the Visibility Classes directive that binds `.show-for-sr`); the icon wrapped in `aria-hidden="true"`; `aria-label` only when no visible or screen-reader text exists | Foundation Button docs; APG naming: button and link are named from content |

| Key | `<button>` and `<input>` | `<a href>` | Owner |
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
| 2.5.8 Target Size (Minimum) | Every `.button` is at least 24 by 24 CSS px. The `nfs-button` Library mixin emits `.button { min-width: 24px; min-height: 24px; }` (Foundation sets `box-sizing: border-box`, so the floor applies to the border box). It changes nothing at Foundation's default sizes and holds the minimum under any `$button-sizes`, `$button-padding`, `$global-font-size`, or label, on every host. Foundation cannot supply it: a button's size is its font size times `line-height: 1` plus `$button-padding` in em, and no setting sets a minimum. A Close Button is not a `.button`, so the floor does not reach it; the [Spec: Close Button](../issues/83-spec-close-button.md) owns its target size | Height passes, checked at a 16 px root font size: `.tiny` (0.6rem) is 27.92 px (a 9.6 px line, 2 x 0.85em padding, 2 x 1 px border), `.small` 34.4 px, the default size 40.88 px, `.large` 56 px; `.tiny.arrow-only` is 27.92 by 28.88 px. Width can fail: at `.tiny` it is 21.2 px plus the label, so a single narrow glyph such as `I` (about 2.7 px at 9.6 px Helvetica) gives about 23.9 px, and every `.tiny` button drops under 24 px tall once the root font size is under about 13.6 px (`$global-font-size` under 85 percent) | axe `target-size` in every story (`button--sizes` includes a `size="tiny"` button labelled `I`; `button--dropdown-arrows` a `size="tiny"` arrow-only button); e2e measures the border box of every button in `button--sizes` at 24 px or more in three engines; node-level Sass compile test asserts the emitted rule |
| 1.4.3 Contrast (Minimum) | Every button label contrasts at least 4.5:1 with its background at rest, on hover, and on focus (Foundation styles hover and focus alike). Pairs: solid fill `$button-color` on `$button-background` and on `$button-background-hover`; for each `$button-palette` entry, the label colour Foundation picks (`color-pick-contrast()` between `$button-color` and `$button-color-alt`) on the entry and on its hover colour (`$button-background-hover-lightness`); hollow and clear fills, `$button-background` and each entry on `$body-background`, at rest and on hover (`$button-hollow-hover-lightness`). No button label is large text (`.large` is 20 px at normal weight), so 4.5:1 applies at every size; disabled buttons are exempt as inactive components. The `nfs-button` mixin checks every pair at compile time and stops with `@error` naming the setting and the fill. Required consumer setting on Foundation's defaults: `$button-palette: map-merge($foundation-palette, ('alert': #bf3f2c, 'success': #177a3d, 'warning': #8a5a00));`. A palette entry is emitted for all three fills, so each entry must pass in all three; removing an unused entry from `$button-palette` is the other way to pass, and the Variant declaration file then removes its name from `color` | Fails. Passing pairs: `.button` `#fefefe` on `#1779ba` 4.59:1 (hover 5.90:1); `.primary` 4.59:1; `.secondary` 4.50:1 (4.504); solid `.success` with the black label 10.91:1 (hover 7.88:1); solid `.warning` 10.66:1 (hover 6.85:1); hollow and clear `.primary` 4.59:1 and `.secondary` 4.50:1. Failing pairs: solid `.alert` 4.498:1 (axe reports 4.49); hollow and clear `.alert` 4.498:1; hollow and clear `.success` 1.80:1; hollow and clear `.warning` 1.84:1. With the required palette the label becomes `$button-color` on all three and reaches alert 5.25:1, success 5.28:1, warning 5.88:1 (hover 7.32, 7.21, 8.04:1); `#bf3f2c` is the alert value the [Spec: Abide](../issues/31-spec-abide.md) requires as well | Compile-time check; node-level Sass compile test (Foundation's default palette fails naming `alert`, `success`, and `warning` with the fill; the required palette compiles); axe `color-contrast` in every story on the resting state under the Storybook preview settings, which set the same `$button-palette` with the rule id `color-contrast` in the comment. Hover and focus colours are covered by the compile-time check only, because axe tests the rendered state |
| 1.4.11 Non-text Contrast | The `.dropdown` arrow contrasts at least 3:1 with what it is drawn on, because it is the only visible content of an arrow-only button: `$white` on each solid fill and its hover colour (the colour is fixed in `foundation-button`, not a setting), and the palette colour on `$body-background` for hollow and clear. The same compile-time check covers it at 3:1, computing each arrow colour from Foundation's rules under the consumer's `$button-fill`. Under `$button-fill: hollow` Foundation recolours every `.dropdown` arrow to `$button-background`, `.solid` included, so the `nfs-button` mixin restores Foundation's `$white` arrow on `.solid` buttons (D18). Button boundaries need no 3:1: the Understanding document for 1.4.11 says "If a control has visible content (such as text or a sufficiently contrasting icon), which helps users identify the presence of the control, then a border or other indication of the overall boundary of the hit area is not required". The browser's unmodified focus ring is exempt ("the default focus style is exempt from contrast requirements (but must still be visible)"), and disabled buttons are exempt | Fails for `.success` (white arrow 1.80:1, 2.49:1 on hover) and `.warning` (1.84:1, 2.87:1 on hover), solid and hollow alike; passes for primary, secondary, and alert (at least 4.50:1). The required palette of 1.4.3 fixes both (at least 5.25:1). Under `$button-fill: hollow` a solid dropdown button's arrow is its own fill colour, 1:1 (Foundation 6.9.0 compiled with Dart Sass 1.93.2) | Node-level Sass compile test, including `$button-fill: hollow`; axe has no 1.4.11 rule, so the story gate cannot enforce it |
| 2.4.7 Focus Visible | Every button and button link shows the browser's own focus indicator; the library removes no outline and adds none. Foundation's `button-base` and its global `button` reset remove the outline only under `[data-whatinput='mouse']` (`disable-mouse-outline`), an attribute the what-input script sets; the library never loads that script, so the rule never matches and the browser's `:focus-visible` heuristic decides (keyboard focus shows the ring, a mouse click on a button does not). Foundation's `&:focus` colour change is an extra cue, not the indicator. A consumer who loads what-input keeps the ring for keyboard focus, because what-input then sets `keyboard`. The Forms page's file-upload `label.button` fails this criterion (focus lands on a file input clipped to 1 px), which is why `<label>` is not a host (D11) | Passes for `<button>`, `<input>`, and `<a>` hosts, checked: `disable-mouse-outline` is the only outline rule in Foundation's button partial and in its global styles | e2e: after Tab to the `button[nfsButton]` and to the `a[nfsButton]` in `button--basics`, a screenshot comparison shows a focus indicator in three engines |
| 2.1.1 Keyboard | Every button is operated by the native keys (Enter, Space; Enter on links); the directive adds no key handling and never removes a host from the tab order except through native `disabled` and the placeholder link | Passes for native elements; Foundation's `<a class="button">` without `href` in its Button Group examples is not focusable, which the dev-mode placeholder-link warning reports | Story play functions (`userEvent.tab()`, `userEvent.keyboard`); e2e real key presses |
| 4.1.2 Name, Role, Value | Roles come from the native element. A natively disabled button exposes its state through `disabled`; a `disabledInteractive` button stays role `button`, focusable, with `aria-disabled="true"`; a disabled link is a placeholder link with `role="link"` and `aria-disabled="true"`, announced as an unavailable link; a toggle button exposes `aria-pressed` and keeps its name; the ARIA of a Trigger on the same element belongs to the Triggers utility. Every value is in the server HTML | Fails for disabled links: Foundation keeps the `href` and writes a valueless `aria-disabled`, which WAI-ARIA reads as `false`; `.disabled` alone disables nothing | axe (`aria-allowed-attr`, `aria-valid-attr-value`, `button-name`, `input-button-name`, `link-name`) in every story; play functions of `button--disabled`, `button--disabled-interactive`, and `button--toggle` assert role, name, and state; browser-level host binding table; SSR smoke |
| 2.5.3 Label in Name | The accessible name of a button with visible text contains that text, starting with it. Names come from content (or from `value` on an `<input>`); `aria-label` is for buttons with no visible text (icon-only, arrow-only), where the criterion has no visible label to match. A consumer who adds `aria-label` or `aria-labelledby` to a button with visible text starts the name with the visible words. The directive adds no name | Passes: Foundation's docs name buttons from content or `.show-for-sr` text | Every story's play function finds each button with `getByRole` and its visible text as the name; `button--icon-only` asserts the screen-reader-only names |
| 1.4.1 Use of Color | The disabled look is not colour alone. Foundation's `button-disabled` fades the whole control to `$button-opacity-disabled` (0.25) and sets `cursor: not-allowed`: a lightness change, which the Understanding document for 1.4.1 counts as an additional visual distinction when the relative luminance difference reaches 3:1. Requirement: for every fill and palette entry, the enabled and disabled renderings differ by at least 3:1 in the background (solid) or in the label (solid with a dark label, hollow, clear); the `nfs-button` compile-time check computes both from `$button-opacity-disabled` and stops with `@error` when neither reaches 3:1. The state is also exposed programmatically (4.1.2). Palette colours carry no meaning the library relies on; a consumer who uses `color="alert"` for a destructive action says so in the label as well | Passes for the default palette: solid `.primary` 3.29:1 between the enabled and disabled background, `.secondary` 3.31:1, `.alert` 3.19:1; solid `.success` and `.warning` 11.0:1 between the enabled and disabled label. Hollow and clear `.success` and `.warning` reach only 1.53:1 and 1.57:1, and are fixed by the required palette of 1.4.3 (3.61 to 4.08:1 for the three changed entries). Raising `$button-opacity-disabled` shrinks every difference | Node-level Sass compile test (`$button-opacity-disabled: 0.6` fails the compile); `button--disabled` shows both states under axe |

The axe gate in every story runs the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, plus `best-practice`) with `parameters.a11y.test = 'error'` (ADR 0018).

### Rendered HTML

Consumer markup and the resulting DOM. Server HTML and hydrated DOM are identical for every row, because every value comes from inputs, static attributes, and `nfsBreakpointsToken`, whose value is the same on both platforms; nothing depends on the platform, the viewport, or a generated id (the responsive classes are chosen from the input value, and CSS media queries apply them). Class order in the `class` attribute is not significant. Angular also renders the directive attribute and every static attribute that feeds an input (`nfsbutton`, `size="small"`); the resulting DOM below leaves them out, as the other specs do.

```html
<!-- Action button -->
<button nfsButton size="small" color="alert">Delete</button>
<button class="button small alert" type="button">Delete</button>

<!-- Link -->
<a nfsButton href="/about">Learn More</a>
<a class="button" href="/about">Learn More</a>

<!-- Submit button, and an Input Group's submit input -->
<button nfsButton type="submit" color="success">Save</button>
<input nfsButton type="submit" value="Submit">
<button class="button success" type="submit">Save</button>
<input class="button" type="submit" value="Submit">

<!-- Fill, a responsive width (needs $button-responsive-expanded: true), and a dropdown arrow -->
<button nfsButton fill="hollow" expanded="medium down" dropdown>Filters</button>
<button class="button hollow medium-down-expanded dropdown" type="button">Filters</button>

<!-- Zero-breakpoint gaps: 'small' is the Zero breakpoint (the second needs $button-responsive-expanded: true) -->
<a nfsButton href="/plans" expanded="small">Plans</a>
<a nfsButton href="/plans" expanded="small down">Plans</a>
<a class="button expanded" href="/plans">Plans</a>
<a class="button small-only-expanded" href="/plans">Plans</a>

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

<!-- Arrow-only button opening a Dropdown pane (a Trigger on the same element) -->
<button nfsButton dropdown arrowOnly [nfsToggle]="saveMenu">
  <span nfsShowForSr>More save options</span>
</button>
<button class="button dropdown arrow-only" type="button" aria-expanded="false" aria-controls="...">
  <span class="show-for-sr">More save options</span>
</button>
```

The Trigger's attributes in the last example belong to the Triggers utility spec and are shown only to place them. `nfsShowForSr` stands for the [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md)'s directive for `.show-for-sr`, under that name until that spec names it. A `jsaction` attribute appears in server HTML only on hosts where the consumer (or another directive, such as a Trigger) declared a listener; `NfsButton` itself never causes one. The split button, a Button Group holding a main action and an arrow-only button, is the [Spec: Button Group](../issues/82-spec-button-group.md)'s.

### Animation

- The only animation is Foundation's `$button-transition` (`background-color` and `color`, 0.25 s ease-out) on hover and focus. It is Foundation CSS, not a library animation: no State class change waits on it, no Completion output exists, and no `transitionend` is observed, so ADR 0003's mechanics have nothing to govern here.
- Reduced motion: no change. WCAG 2.2's definition of motion animation excludes changes of color or opacity that do not alter the element's perceived size, shape, position, or depth, so a color transition is not motion and `prefers-reduced-motion` does not require removing it. The library's reduced-motion rule does not target `.button`. A consumer who wants no transition sets `$button-transition: none` in Sass.
- No `animate.enter`/`animate.leave`: the directive never inserts or removes elements.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the server HTML carries `.button`, the Variant classes, `type`, `disabled`, `aria-disabled`, `role`, and `.disabled` exactly as the hydrated DOM does (rule 1). The Variant classes come from the inputs and the Zero breakpoint of `nfsBreakpointsToken`, which a consumer with a custom Breakpoint map provides at application level for both platforms (ADR 0005). The dehydrated state is fully functional: native buttons activate, links navigate, disabled buttons and placeholder links do nothing, and a focusable disabled submit button cannot submit because it renders `type="button"`.
- Before hydration: the directive touches no DOM outside host bindings, reads no `window`, measures nothing, and starts no timer (rules 3 to 5). Its only DOM reads are the dev-mode checks and the Variant check in `afterRenderEffect`, which never run on the server; the Variant check reads computed style, which the server does not have, so the server HTML carries whatever class a value produced.
- Full hydration: host binding values equal the server's, so hydration changes no attribute and no class; there is no structure to mismatch. The directive is hydration-clean by construction and needs no `ngSkipHydration` (rule 10).
- Incremental hydration: a button needs no hydration boundary of its own; it has no parent or children to register with. When a button is a Trigger, the Trigger's rule applies: the button and its Openable share one boundary.
- Event replay: `NfsButton` declares no listeners, so it adds no `jsaction` and nothing of its own is queued or replayed. Consumer listeners on the element replay normally. A natively disabled button receives no `click` before hydration, so nothing is queued for it. A `disabledInteractive` button does receive clicks: before hydration a click has no default action (the button is `type="button"`), and after hydration the queued click is replayed to the consumer's listeners, which must check the disabled state (see the next bullet). Because the directive has no handler, the replay-handling decision (state first, `preventDefault()` last, the logged error accepted, decided under the triage rule in the [Angular 22.2 @defer, SSR, prerendering, hydration, and event replay for DOM-touching directives](../issues/38-angular-rendering-modes.md) ticket, building-blocks Part 4, Decided item 3) has nothing to apply to here.
- Why no listeners, including for `disabledInteractive`: Angular's JSAction dispatcher calls `preventDefault()` on any `click` whose action element is an `<a>` that carries `jsaction` inside a still-dehydrated block, then hydrates and replays. A host `click` listener on `a[nfsButton]` would therefore cancel the native navigation of every plain `href` link-button inside a dehydrated block, with nothing to perform it afterwards. And during replay Angular calls every listener stashed on the element in turn and maps `stopImmediatePropagation()` to `stopPropagation()`, so a blocking listener could not stop the consumer's own listener on the same element anyway. The consumer's action handler guards itself, as Material documents for its `disabledInteractive` ("you should guard against such cases in your component").
- `@defer`: library templates contain no `@defer` (the directive has no template). A consumer may defer the directive with its entry point. Inside a dehydrated block, the button is its server HTML and works as a native element until the block hydrates, either through its hydrate trigger or through a replayable event on an element that carries `jsaction`. Inside `@defer (hydrate never)`, Angular annotates nothing (no `jsaction`), so buttons and links work as native elements and disabled states hold; consumer `(click)` handlers there never run, which is the consumer's choice of block.
- Prerendering: identical to SSR; the directive reads no request token (rule 11).
- Consumer hazards stated for the docs, both Angular behaviour rather than the directive's: a consumer `(click)` listener on an `a[nfsButton]` inside a dehydrated block makes the dispatcher cancel the native navigation (RouterLink then navigates on replay; a plain `href` does not); and an `<a>` that is itself a root node of a `@defer (hydrate on interaction)` block gets the trigger's `click` and `keydown` `jsaction` and is cancelled the same way, so such a link is wrapped in an element (`hydrate on hover` annotates only `mouseenter`, `mouseover`, and `focusin`, which the dispatcher does not cancel). Links that must navigate natively in deferred regions carry no click listener and are not block root nodes.

## Testing Decisions

A good test here asserts what a user or assistive technology observes: the role, the accessible name, `type`, `disabled`, `aria-disabled`, the classes, whether Tab reaches the element, and whether a click submits, navigates, or reaches a handler. No test reads the directive's fields. There is no prior art in the new repository; the patterns are the building-blocks testing rule, Angular's own `renderApplication`-based SSR tests, and the Angular Components universal-app e2e (hydration counters and no NG05xx errors).

Story ids follow `button--<story>`: `button--basics`, `button--sizes`, `button--colors`, `button--fills`, `button--expanded`, `button--disabled`, `button--disabled-interactive`, `button--dropdown-arrows`, `button--icon-only`, `button--in-form`, `button--toggle`. Stories set Variant inputs through args and use Foundation's default names only, so the library's Storybook program needs no Variant declaration file (ADR 0040); the Storybook preview's required `$button-palette` changes colour values, not names. The Button Group stories are the [Spec: Button Group](../issues/82-spec-button-group.md)'s.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Run by `npx nx test-storybook <lib>`. Every story runs axe with `parameters.a11y.test = 'error'` and the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, plus `best-practice`, which include `target-size`, `color-contrast`, `button-name`, `input-button-name`, and `link-name`), under the Storybook preview settings that carry the required `$button-palette`. No story element carries a Foundation class written in the story.

- `button--basics`: each host has `.button`; the `<button>` has `type="button"`; the `<a>` has an `href` and no `type`; `getByRole('button')` and `getByRole('link')` find them by name.
- `button--sizes`: `size="tiny"` (one labelled `I`), `size="small"`, no size, `size="default"`, and `size="large"`; the computed `font-size` for `size="small"` equals Foundation's `0.75rem`; `size="default"` and no size carry no size class and share the default size.
- `button--colors`: each default palette name sets its class, and the computed background equals Foundation's colour for it under the preview settings; no `color` renders `$button-background`.
- `button--fills`: `fill="hollow"`, `fill="clear"`, and `fill="solid"`; `fill="solid"` sets `.solid` and renders the same computed background as a button with no `fill`, because the default `$button-fill` is solid.
- `button--expanded`: the bare `expanded` attribute and `expanded="small"` both set `.expanded`, and the computed width equals the container's. The responsive forms stay out of stories: the preview settings leave `$button-responsive-expanded` off, as Foundation does, so their classes are not generated and the development Variant check would report them; layer 2 covers their mapping.
- `button--disabled`: the natively disabled button has `disabled`, is skipped by `userEvent.tab()`, and a click does not call the story's spy; the disabled link has no `href`, is still found by `getByRole('link', {name: 'Next'})`, carries `aria-disabled="true"` and `.disabled`, and is skipped by Tab; toggling the story's control back restores `href` and removes `role`, `aria-disabled`, and `.disabled`.
- `button--disabled-interactive`: Tab reaches the disabled button; it has `aria-disabled="true"`, `.disabled`, and `type="button"`; its `aria-describedby` text is exposed; clicking it does not fire the form's `submit`; enabling it restores `type="submit"` and a click submits.
- `button--in-form`: a plain `nfsButton` click does not fire `submit`; `type="submit"` and an `<input type="submit">` host do; `type="reset"` resets a field; the `<input>` host has `.button` and is found by `getByRole('button', {name: 'Submit'})`.
- `button--dropdown-arrows`: `dropdown` sets `.dropdown` and draws the `::after` arrow (computed `border-top-style` of the pseudo-element is `solid`); the `dropdown arrowOnly` buttons, one of them `size="tiny"`, are found by their screen-reader-only name "Show menu".
- `button--icon-only`: the icon-only button is found by its screen-reader-only name "Delete invoice", and its icon is `aria-hidden`.
- `button--toggle`: clicking flips `aria-pressed` between `false` and `true` and the accessible name stays the same.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

Vitest browser mode under the Angular unit-test builder (`npx nx test <lib>`, Chromium headless): TestBed specs in `<name>.spec.ts` next to the directive, over a bare test host component, zoneless with `await fixture.whenStable()`, asserting DOM and ARIA state; no story is mounted here and no axe runs here.

- Host binding table, driven by data: for each host tag (`button`, `input` with each of its three types, `a`) and each combination of `disabled`, `disabledInteractive`, and `type`, assert `type`, `disabled`, `aria-disabled`, `role`, and `.disabled` against the host binding table above, including transitions in both directions.
- Variant classes, driven by data: every value of every Variant input sets exactly the class of the Variant table, including the Zero-breakpoint gaps of `expanded`, with the default Breakpoint map and with a provided `nfsBreakpointsToken` whose Zero breakpoint has another name (values the library's own closed types reject are bound through a typed cast, since the library's test program declares no Class breakpoints); no value, `false`, and `size="default"` set none; a cast value that is not one class token, and a query that cannot be parsed, set none; changing a value swaps its class and leaves `.button`, `.disabled`, and the other Variant classes alone.
- `type` sources: a static `type="submit"`, a `[type]` binding changing at runtime, an `<input>` host's static `type`, and no type at all.
- Echoing: a static `role="switch"` on a `<button>` survives every state; a static `disabled` attribute on `<a>` feeds the input and is removed from the DOM; a consumer's own application class stays through every Variant change.
- RouterLink: with `provideRouter`, `[routerLink]="null"` plus `[disabled]="true"` yields no `href` and the disabled-link attributes; switching to a route restores `href`, and a click navigates.
- Dev-mode checks: a disabled `<a>` with an `href` warns once; an enabled `<a>` with no `href` warns once; `arrowOnly` without `dropdown` warns once, and so does `dropdown` on an `<input>` host; a static `class="small alert hollow medium-expanded disabled submit"` warns once, naming `size`, `color`, `fill`, `expanded`, `disabled`, and `type="submit"`, and the copied `disabled` is absent from the rendered class list while the copied Variant classes remain; a redundant static `button` and the consumer's own classes are not reported; a correctly disabled link, a normal link, and `dropdown arrowOnly` on a `<button>` do not warn.
- Runtime check (the Variant check, ADR 0040): with a style block standing in for the `nfs-button` Variant properties, a listed `color` is silent; an unlisted `color` bound through a cast reports `strictVariantNames` once, naming the directive, the input, the value, and `$button-palette`; `expanded="medium"` with an empty `--nfs-button-responsive-expanded` reports once, naming `$button-responsive-expanded`; with no style block, one `strictVariantProperties` report names `@include nfs-button;`; `provideNfsRuntimeChecks({strictVariantNames: false})` silences the name reports.
- Zoneless: the suite runs with zoneless change detection and `fixture.whenStable()`; no test needs `NgZone`.

### 3. Node-level Vitest

- SSR smoke: `renderApplication` over a fixture component (with `provideRouter`) holding a default button, a `type="submit"` button, an `<input type="submit">` host, a natively disabled button, a `disabledInteractive` disabled submit button, an enabled link, a disabled router link, a button with every Variant input set (`size="small" color="alert" fill="hollow" expanded="medium only" dropdown arrowOnly`, with screen-reader-only text), and an arrow-only `nfsToggle` button with its Dropdown pane. Assert `whenStable()` resolves; the server HTML contains every attribute and class from the Rendered HTML section and the Variant classes of the fully set button; the disabled router link has no `href`; no host that carries no listener from the consumer or another directive has a `jsaction` attribute; and no Runtime check reports on the server. Runs under `npx nx test <lib>` in `<name>.ssr.spec.ts` through the shared `renderServer()` helper; `npx nx test-node <lib>` only if the server path depends on the DOM adapter.
- Pure logic: none worth isolating; the value-to-class mapping is covered through the DOM in layer 2.
- Sass compile, WCAG rules and Variant properties: `@include nfs-button;` over Foundation's defaults fails with `@error` naming `alert` (solid, hollow, clear), `success` (hollow, clear, and the solid arrow), and `warning` (the same); with the required `$button-palette` it compiles and emits the minimum-size rule `.button { min-width: 24px; min-height: 24px; }`, no solid-arrow rule, and on `:root` `--nfs-button-palette: primary secondary success warning alert;`, `--nfs-button-sizes: tiny small large;`, and an empty `--nfs-button-responsive-expanded`; `$button-responsive-expanded: true` writes `--nfs-button-responsive-expanded: small medium large;`; a palette merged with `purple` lists `purple`; `$button-fill: hollow` with the required palette emits `.button.dropdown.solid::after { border-top-color: <$white>; }` and compiles; `$button-opacity-disabled: 0.6` with the required palette fails the 1.4.1 check; a `$button-background` whose pair with `$button-color` is 4.49:1 fails although Foundation's `color-contrast()` reports 4.5.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build:

- Tab order in `button--disabled` and `button--disabled-interactive` in Chromium, Firefox, and WebKit with real key presses (buttons in all three engines; links in Chromium and Firefox, because whether Tab reaches links in WebKit depends on a platform keyboard preference).
- Implicit submission with real key presses in `button--in-form`: Enter in a two-field form whose submit button is `disabledInteractive` and disabled does not submit; with a natively disabled submit button it does not submit; with an enabled one it does.
- WCAG 2.2 AA checks that need real layout, in three engines: target size (2.5.8), every button's border box in `button--sizes` and `button--dropdown-arrows` measures at least 24 by 24 px, including the `size="tiny"` button labelled `I`; focus visible (2.4.7), a screenshot comparison before and after Tab to the `button[nfsButton]` and the `a[nfsButton]` in `button--basics` shows a focus indicator.

Against the prerendered fixture app (the harness from the rendering-mode test seam prototype):

- JavaScript disabled: screenshot plus axe (`@axe-core/playwright` with `withTags` on `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, and `best-practice`) on the server HTML; clicking the disabled router link leaves the URL unchanged; clicking a plain `nfsButton` inside a form does not submit; the natively disabled button ignores clicks.
- Hydration: no NG05xx in the console and `ngDevMode.componentsSkippedHydration === 0`.
- Pre-hydration clicks with the main bundle delayed: an enabled `a[nfsButton]` navigates natively; a button with a consumer `(click)` replays it exactly once after hydration; a natively disabled button produces no replay.
- Dehydrated block: inside `@defer (hydrate when hydrateNow())` with the signal held `false`, an enabled plain-`href` `a[nfsButton]` with no consumer listener, placed as the block's root node, navigates natively when clicked (the regression test for D9: a `when` trigger adds no root-node `jsaction`, so any `jsaction` on the link could only come from the directive).
- `@defer (hydrate never)`: buttons and links inside work natively and disabled states hold.

## Out of Scope

- Button Group: its own spec, the [Spec: Button Group](../issues/82-spec-button-group.md), with the split button. `NfsButton` declares no group token (D10).
- Close Button: its own spec, the [Spec: Close Button](../issues/83-spec-close-button.md). `nfsButton` never shares an element with its directive, because the two class contracts and both `type` bindings collide (D10). `data-closable` belongs to the Triggers spec.
- `<label>` hosts, the Forms page's file-upload `label.button`, until a fix for WCAG 2.2 AA 2.4.7 exists: focus lands on the file input, which Foundation's `.show-for-sr` clips to 1 px, so the label that looks like a button shows no focus indicator (D11). The [Spec: Forms](../issues/98-spec-forms.md) offers the native file input in its place; `<label>` joins this selector only together with a focus fix, such as a `:has()` rule once `:has()` is in the Browser target.
- `<input type="image">` and other `<input>` types: Foundation's docs show only `type="submit"`.
- Runtime appearance defaults and a Defaults token (D4; ADR 0040).
- Foundation's `.submit` marker (D5).
- A toggle-button model (D12) and Material's button toggle group.
- Material's ripple, progress indicator, icon slots, FAB and icon-button variants.
- Runtime theming through custom properties (building-blocks Sass and theming rule).
- How the library's Sass ships next to the consumer's Foundation, decided in [Sass packaging for the new library](../issues/57-sass-packaging.md) (ADR 0012).
- The Variant registries, the helper types, the declaration-file generator, and its CI checks, which belong to the [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md); the Runtime checks' configuration, which belongs to the [Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md).

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | Attribute directive on native `<button>`, `<a>`, and button-type `<input>` elements | ADR 0001; native semantics, keyboard, and form behaviour come free; Material does the same | A component with a template (Material's `MatButton` renders ripple, label, and focus-indicator spans the library does not need) |
| D2 | One class, selector `button[nfsButton], a[nfsButton], input[type=submit][nfsButton], input[type=button][nfsButton], input[type=reset][nfsButton]` | One import covers every host; Material's shape; the static `type` in the `<input>` selectors keeps text fields out | Separate `NfsButton` and `NfsAnchorButton` classes (considered to give only `<button>` a listener; unnecessary once no listener exists) |
| D3 | Variant classes are six typed Variant inputs: `size`, `color`, `fill`, `expanded`, `dropdown`, `arrowOnly` | The class rule ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)): the consumer writes no Foundation class. Typed by [ADR 0040](../adr/0040-variant-input-types.md): `fill` a closed union; `dropdown` and `arrowOnly` booleans through `nfsVariantBoolean`; `size` and `color` Foundation's default names over their Variant registries, chained where `$button-palette` defaults to `$foundation-palette`; `expanded` `true` or a Breakpoint query. Names from building-blocks 1.4 | Consumer-written Variant classes (this spec's first version, [ADR 0010](../adr/0010-button-variant-classes-stay-classes.md), superseded); one input per responsive class (`mediumExpanded`); `booleanAttribute` for `dropdown` and `arrowOnly` (lets `dropdown="flase"` compile and set the class); `arrowOnly` also binding `.dropdown` (one input would set two classes; D21 warns instead) |
| D4 | No Defaults token | Glossary: a Defaults token replaces a Plugin's `Foundation.X.defaults`, and Button has none; a Defaults token never holds a Variant input's default (ADR 0040), so every Variant input left unset sets no class and the Sass settings are the look | `nfsButtonDefaultsToken` modelled on `MAT_BUTTON_CONFIG` |
| D5 | `type` input, default `button`; Foundation's `.submit` marker is not read | Foundation's docs callout; prevents accidental submission; explicit `type="button"` also stays compatible with future Invoker Commands (HTML runs commands for Button-state buttons, not Auto-state ones inside a form). Under the class rule the consumer writes no Foundation class, and `.submit` is one, a docs marker with no CSS, so a submit button says `type="submit"`. A copied `class="submit"` is reported in development (D22) | Honouring the `.submit` marker (the first version: a consumer-written Foundation class read to seed `type`, which building-blocks 1.4 now forbids); no default (Material, HTML); a static host attribute (would also land on `<a>`); a constructor `setAttribute` like Aria's accordion trigger (a construction-time DOM write, which the building-blocks rendering rules forbid) |
| D6 | Native `disabled` is the default on buttons | APG keyboard practice: remove disabled controls from the tab order when their presence can be inferred; the only mode the platform enforces before hydration and in `hydrate never` | Aria's composite-item default (`aria-disabled`, focusable), which the APG reserves for elements that must stay discoverable |
| D7 | `disabledInteractive` opt-in; renders `aria-disabled`, `.disabled`, and `type="button"` while disabled | Material's name and behaviour for the same element; Foundation's CSS styles `.disabled` only; forcing `type="button"` removes the submit and reset default actions natively, in every rendering mode, on `<button>` and `<input>` hosts alike | A click-blocking host listener (fails before hydration and during replay, and would add `jsaction` to every host); leaving submit active (Material's documented caveat) |
| D8 | A disabled link is a placeholder link: the consumer removes the target, the directive adds `role="link"`, `aria-disabled="true"`, `.disabled`, and dev-mode checks | HTML's placeholder link is non-focusable and non-navigable with no script; WAI-ARIA advises against `aria-disabled` on an `href` link; RouterLink owns `href` through its own host binding, so the directive cannot own it | Material's `aria-disabled` plus `tabindex="-1"` plus a click listener (navigates before hydration, in `hydrate never`, and whenever another directive's click listener runs first); the directive owning `href` through an input (collides with RouterLink's `[attr.href]`) |
| D9 | No event listeners at all | Keeps plain links navigating inside dehydrated blocks (dispatcher `preventDefault` on anchors with `jsaction`); replay cannot honour a blocker anyway; recorded as [ADR 0011](../adr/0011-button-listener-free-disabled-contract.md) | Host `(click)` listener |
| D10 | Button Group and Close Button have their own specs; `NfsButton` declares no group token and never shares an element with the Close Button's directive | One spec per Foundation docs page (ADR 0039); `.close-button` is a different class contract (`position: absolute`, its own sizes) whose directive binds its own `type`, and two directives binding `type` on one element resolve by directive order; the Button Group spec found that no group token is needed (its D2) | Group and close-button guidance in this spec (the first version); a group Parent token |
| D11 | `<input type="submit\|button\|reset">` hosts join; `<label>` hosts wait for a 2.4.7 fix | Foundation's Forms page shows `input[type=submit].button` in its Input Group (the Kitchen Sink page repeats it) and a `label.button` file upload, so the first version's "Foundation's docs never show it" was wrong; under the class rule a consumer cannot write `.button` on them, so without a host they lose the look. An `<input>` takes the same native `disabled`, `type`, and `aria-disabled` contract and the same `.button` rules; it holds no content, so its name is its `value` and no arrow can render (D21). The file-upload label's focus lands on a file input clipped to 1 px, so it has no visible focus indicator; the [Spec: Forms](../issues/98-spec-forms.md) offers the native file input instead | No `<input>` hosts (the first version); `label[nfsButton]` now (ships a 2.4.7 failure); `<input>` hosts without the `type` binding (would leave the focusable disabled mode able to submit) |
| D12 | `aria-pressed` stays the consumer's; no `pressed` model | Foundation has no pressed class or style; Toggler's class mode already covers toggling a class with `aria-pressed` | A `pressed` model with a click handler (would need a listener and custom CSS) |
| D13 | No outputs, no methods, no custom harness | Native events and `focus()` suffice; building-blocks testing rule asserts the DOM | Material's `focus(origin)`, `MatButtonHarness` |
| D14 | Static `role` is echoed; `.disabled` is a boolean host binding | A host binding with `null` would erase a consumer's static `role`; under the class rule no consumer writes `.disabled`, so there is no static class for a `true`-or-`undefined` binding to keep, and a copied one is stripped and reported (D22) | Plain `null` for `role`; `.disabled` bound `true` or `undefined` (the first version, which kept a consumer-written `.disabled`) |
| D15 | Library CSS is the `.button` minimum-size rule, the solid-arrow rule under `$button-fill: hollow` (D18), and the Variant properties (D19); everything else is Foundation's | Foundation's `.button`, `.disabled`, and `[disabled]` rules cover every state the directive produces; WCAG 2.2 AA 2.5.8 is required for every directive (ADR 0022) and Foundation has no minimum-size setting, while its default `.tiny` width drops under 24 px for a narrow label | No library CSS (this spec's first version, which left 2.5.8 to settings and labels); `pointer-events: none` on disabled links, which the placeholder link makes unnecessary |
| D16 | The `nfs-button` mixin checks label contrast (4.5:1), arrow contrast (3:1), and the disabled lightness difference (3:1) at compile time with `@error`, unrounded, with each arrow colour computed from Foundation's rules under the consumer's `$button-fill` | ADR 0022; the settings are solid Sass colours, so the check is exact; axe tests only the resting state and has no 1.4.11 rule | A docs recommendation; `@warn` (a consumer on Foundation's defaults would ship failing `.alert` buttons); Foundation's `color-contrast()`, which rounds 4.498 up to 4.5 |
| D17 | Required palette `alert: #bf3f2c`, `success: #177a3d`, `warning: #8a5a00` through `$button-palette` | The only settings-level fix: one palette entry drives the solid, hollow, and clear classes, so the entry must pass on white; it leaves `$foundation-palette` (callouts, labels) alone; `#bf3f2c` matches Abide's required alert colour; the names are unchanged, so no Variant declaration changes | A library rule recolouring `.hollow.success` and friends (re-implements Foundation styles); changing `$foundation-palette` (recolours every component) |
| D18 | Under `$button-fill: hollow`, `nfs-button` emits `.button.dropdown.solid::after { border-top-color: $white; }` | Foundation's `@if $button-fill == hollow` arrow rule recolours every `.dropdown` arrow to `$button-background`, `.solid` included, so a solid dropdown button draws its arrow in its own fill colour, 1:1 (Foundation 6.9.0 compiled with Dart Sass 1.93.2), and an arrow-only button fails 1.4.11. The rule restores Foundation's own solid arrow colour from the consumer's `$white`, so `fill="solid"` renders Foundation's solid look whatever `$button-fill` is, as ADR 0040 states | Documenting `fill="solid"` with `dropdown` as unsupported under `$button-fill: hollow`; an `@error` whenever `$button-fill` is `hollow` (stops every such build, whether or not it uses a solid dropdown button) |
| D19 | The `nfs-button` mixin writes three Variant properties on `:root`: `--nfs-button-palette`, `--nfs-button-sizes`, and `--nfs-button-responsive-expanded` | ADR 0012's dated note and building-blocks 1.13: an entry point with an Open Variant family writes the names its Sass generates, space-separated. The responsive `-expanded` classes are gated by `$button-responsive-expanded`, so their property lists the Class breakpoints while the flag is on and is empty while it is off. An empty property and a missing one both read as the empty string (measured in Chromium 153, Firefox 155, and WebKit 26.6), so the missing-include report reads `--nfs-button-palette` and `--nfs-button-sizes`, never the gated property | Encoding the flag in a registry, so the query form fails to compile while the flag is off (ADR 0040 leaves flag-gated classes to the Runtime check); no property for the gated family (the check could not tell a responsive value from a missing flag) |
| D20 | `expanded` finds the Zero breakpoint through `nfsBreakpointsToken` | Foundation generates no `.<zero>-expanded` or `.<zero>-down-expanded`, so `'small'`, `'small up'`, and `'small down'` map to `.expanded` and `.small-only-expanded` (ADR 0040); the Zero breakpoint is the Breakpoint map's key whose value is 0, which a consumer can rename, and the token's value is the same on server and client, so the class is too | Hard-coding `small`; leaving the gaps unset (a query that sets no class) |
| D21 | A dev-mode warning for an arrow that cannot render: `arrowOnly` without `dropdown`, or either on an `<input>` host | `.arrow-only` only repositions the `.dropdown` arrow, and an `<input>` draws no `::after`; Foundation's markup always writes `dropdown arrow-only` together, and two inputs make it possible to write one without the other | `arrowOnly` also binding `.dropdown` (D3); no check (a silent missing arrow) |
| D22 | A dev-mode warning for a Foundation class copied onto the host: `disabled`, `submit`, the closed Variant names, the responsive `-expanded` pattern, and Foundation's default size and palette names, read through `HostAttributeToken('class')` in development builds only | Building-blocks 1.4: initial state and Variants are bound, never read from a class, and a directive whose dynamic binding meets a copied Foundation class reports it. Copied Foundation markup would otherwise change silently: a copied `disabled` is stripped, a copied `submit` no longer submits, and a copied `small` keeps styling beside `size` without being the contract. After render the class list mixes static and bound classes, so the static attribute is the only place to see what was written; production pays nothing | No check (silent changes for migrating markup); honouring `submit` or `disabled` as seeds (a second, class-based spelling the class rule removes); checking consumer-declared palette and size names too (they need the Variant properties; the Variant check already reports values the CSS lacks); reporting a redundant `button` (it merges with the static host class and does no harm) |

### Usage examples

```ts
@Component({
  selector: 'app-invoice-actions',
  imports: [FormsModule, NfsButton, RouterLink],
  template: `
    <form (ngSubmit)="save()">
      <!-- While saving() is true this renders type="button", so it cannot submit -->
      <button nfsButton type="submit" color="success"
              [disabled]="saving()" disabledInteractive
              aria-describedby="save-hint">Save</button>
      <p id="save-hint">{{ saving() ? 'Saving...' : '' }}</p>

      <!-- Focusable while locked: the click still arrives, so the handler guards itself -->
      <button nfsButton color="alert" fill="hollow"
              [disabled]="locked()" disabledInteractive
              aria-describedby="lock-hint" (click)="remove()">Delete</button>
      <p id="lock-hint">{{ locked() ? 'Paid invoices cannot be deleted.' : '' }}</p>
    </form>

    <a nfsButton size="small" [routerLink]="isLast() ? null : ['/invoices', next()]"
       [disabled]="isLast()">Next invoice</a>

    <button nfsButton fill="clear" [attr.aria-pressed]="pinned()" (click)="togglePin()">Pin</button>

    <!-- Full width on small screens only: needs $button-responsive-expanded: true in Sass,
         which the development Variant check reports when it is off -->
    <button nfsButton [color]="overdue() ? 'warning' : undefined" expanded="small only"
            (click)="remind()">Send reminder</button>
  `,
})
export class InvoiceActions {
  protected readonly saving = signal(false);
  protected readonly locked = signal(false);
  protected readonly pinned = signal(false);
  protected readonly overdue = signal(false);
  // isLast, next, save, and remind omitted

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
<!-- Icon-only button (Foundation's accessibility pattern; the span takes the Visibility Classes directive) -->
<button nfsButton color="alert">
  <span nfsShowForSr>Delete invoice</span>
  <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 16 16"><path d="..."/></svg>
</button>

<!-- A submit input, as in Foundation's Input Group (the Forms spec's directives around it) -->
<input nfsButton type="submit" value="Search">

<!-- A custom palette colour: compiles only once the Variant declaration file lists it -->
<button nfsButton color="purple">Upgrade</button>
```

The consumer's Variant declaration file, as the library's tooling generates it from `$button-palette: map-merge($foundation-palette, (purple: #5b2a86));`:

```ts
import 'ngx-foundation-sites';

declare module 'ngx-foundation-sites' {
  interface NfsButtonPaletteOverrides {
    purple: true;
  }
}
```

With it, `color="purple"` compiles and the editor offers it; `color="pruple"` fails with the compiler's suggestion, and so does `color="purple"` in a program that leaves the file out (ADR 0040).

### Platform features to adopt when the browser target moves

- Invoker Commands (`command`, `commandfor`; Baseline newly available December 2025, out of target): no change needed here. An explicit `type="button"` keeps commands working inside forms, where HTML runs a command only for a button in the Button state and returns early for one in the Auto state. Adoption belongs to the Triggers utility spec.
- `:has()` (out of target) would let a library rule show a focus indicator on a `label.button` whose file input has focus, one candidate for the 2.4.7 fix the `<label>` host waits for (D11).
- Nothing else in the platform research applies to Button. `:focus-visible` is already in target and is what the browser's default focus ring uses.

### Foundation behaviour changed or dropped

- `disable-mouse-outline` (`[data-whatinput='mouse'] .button { outline: 0 }`) relies on the what-input library that Foundation's JavaScript brings in. The library never loads it, so the rule never matches and the browser's own `:focus-visible` heuristic decides when the ring shows (keyboard focus shows it, mouse clicks on buttons do not). Nothing to port.
- Disabled links: Foundation keeps `href` and a valueless `aria-disabled`; the library renders a placeholder link with `role="link"` and `aria-disabled="true"` (D8).
- `.disabled` alone: still Foundation's visual class, now bound only by the directive; the `disabled` input is what disables, and a copied `class="disabled"` is stripped and reported in development (D22).
- `.submit`: dropped; a submit button says `type="submit"` (D5), and a copied `class="submit"` is reported in development (D22).
- The solid dropdown arrow under `$button-fill: hollow`: restored to Foundation's `$white` by one library rule (D18).
- Foundation's docs put `href` on some `<button>` examples and use `<a class="button">` without `href` in Button Group examples; both are docs sloppiness, and the second is caught by the dev-mode placeholder-link warning.

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. The directive relies on Foundation's button partial, included through Foundation's export mixin `foundation-button` and configured through the `$button-*` variables; every class the directive binds (`.button`, the size, colour, and fill classes, the `-expanded` classes, `.dropdown`, `.arrow-only`, `.disabled`) is already styled by it. Its documented custom CSS is the `nfs-button` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-button`. (1) Rules: `.button { min-width: 24px; min-height: 24px; }`, because Foundation's button size comes from font size and em padding with no minimum setting (WCAG 2.2 AA 2.5.8); and, only while `$button-fill` is `hollow`, `.button.dropdown.solid::after { border-top-color: $white; }`, the one declaration that differs from Foundation's rule for that element, because Foundation's hollow-default arrow colour also reaches `.solid` buttons (1.4.11, D18). No rule duplicates or overrides any other Foundation style. (2) Reused settings: `$white` in the arrow rule; the compile-time checks read `$button-color`, `$button-color-alt`, `$button-background`, `$button-background-hover`, `$button-palette` (with its hover lightness), `$button-hollow-hover-lightness`, `$button-fill`, `$body-background`, and `$button-opacity-disabled` from the consumer's compile and stop the build with `@error` when a label, arrow, or disabled pair fails 1.4.3, 1.4.11, or 1.4.1; the Variant properties read `$button-palette`, `$button-sizes`, `$button-responsive-expanded`, and `$breakpoint-classes`. (3) Custom properties: none that the directive writes. (4) Motion classes: none, and no `prefers-reduced-motion` override; Foundation's own `$button-transition` colour change is not motion (Animation). (5) What breaks when the include is missing: the minimum-size rule is absent, so a narrow `size="tiny"` label can fall under 24 by 24 px; the solid arrow under `$button-fill: hollow` disappears; the compile-time checks do not run, so a failing `$button-palette` or `$button-opacity-disabled` compiles with no warning; and no Variant properties exist, so the declaration-file generator finds no Button names and the development Runtime check reports the missing include. (6) Variant properties, on `:root` and space-separated (the mixin joins the map keys with `space`, because Sass interpolates a key list with commas): `--nfs-button-palette` from the keys of `$button-palette` (`primary secondary success warning alert` by default); `--nfs-button-sizes` from the keys of `$button-sizes` other than `default` (`tiny small large`); and `--nfs-button-responsive-expanded` from `$breakpoint-classes` while `$button-responsive-expanded` is true, empty while it is false (the default) (D19).

### Notes

- RTL: Foundation compiles direction into the CSS (`$global-text-direction`, `float: $global-right` for the `.dropdown` arrow); the directive has nothing direction-dependent.
- Target size and contrast: see WCAG 2.2 AA under Implementation Decisions (measured sizes, computed ratios, the `nfs-button` floor rule, and the required palette).
- Static input attributes stay in the DOM, as Angular leaves every static attribute (`<button nfsButton color="alert">` keeps `color="alert"`). None means anything on these hosts except `size` on an `<input>`, which HTML ignores for the submit, button, and reset types; a consumer who wants no stray attribute binds the input instead (`[size]="'small'"`).
- Two boolean conventions meet on this directive: `disabled` and `disabledInteractive` are Options-style `booleanAttribute` inputs (`disabled="flase"` compiles and disables), while `dropdown`, `arrowOnly`, and `expanded` are Variant inputs through `nfsVariantBoolean` (`dropdown="flase"` fails to compile), as building-blocks 1.4 and ADR 0040 rule.
