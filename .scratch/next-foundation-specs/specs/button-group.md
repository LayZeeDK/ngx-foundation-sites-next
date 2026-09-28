# Spec: Button Group

Ticket: [Spec: Button Group](../issues/82-spec-button-group.md), under the class rule of [Triage the out-of-scope Foundation components and variants](../issues/79-triage-out-of-scope-components-and-variants.md) ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)) and the Variant typing of [Decide: typed Variant inputs over open Sass maps](../issues/81-decide-typed-variant-inputs-open-sass-maps.md) ([ADR 0040](../adr/0040-variant-input-types.md)). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass.

## Problem Statement

A developer building an Angular application on Foundation for Sites writes `.button-group` markup by hand. Button Group is a CSS-only component: a container class whose Sass reaches every `.button` inside it through descendant selectors, and a set of Variant classes on the container (sizes, colours, fills, `.no-gaps`, `.expanded`, `.stacked`, `.stacked-for-small`, `.stacked-for-medium`). Under the class rule the developer writes no Foundation class, so without a directive there is no way to get a button group at all. Foundation's contract also leaves several traps:

- The group's Variant classes win over the buttons' own. Measured in Chromium, Firefox, and WebKit: a button's own size class never renders inside a group, because Foundation's group rule resets every button to the default size; a group colour replaces a button's colour on solid groups, and on hollow and clear groups the name that comes later in `$button-palette` wins; a group fill other than `$button-fill` replaces a button's fill. Nothing reports any of this.
- A split button in a hollow or clear group draws its dropdown arrow in `$white` on the page, 1.00:1, because Foundation colours the arrow only for buttons that carry `.hollow` or `.clear` themselves. Under `$button-fill: hollow`, a solid group draws the arrow in `$button-background` on its own fill, 1.00:1 (1.15:1 on an alert fill). Both fail WCAG 2.2 AA 1.4.11 for an arrow-only button, whose arrow is its only visible content.
- `.no-gaps` overlaps each button with the next by `$button-hollow-border-width`, so a one-glyph `.tiny` button at the Button spec's 24 px floor keeps 23 px of unobscured width, which axe's `target-size` rule reports as a violation (2.5.8).
- `.stacked` together with `.stacked-for-small` silently unstacks from `medium` up.
- Foundation's examples use `<a class="button">` without `href`, which is not focusable, and name the split button's arrow "Show menu", which does not say which menu.

A server-rendered application adds the usual requirement: the server HTML must already carry every class, hydration must change nothing, and the group must work inside dehydrated and `hydrate never` blocks.

## Solution

One attribute directive, `nfsButtonGroup`, on the container element the developer already writes. It binds Foundation's `.button-group` and sets every Variant class from a typed input: `size`, `color`, `fill`, `expanded`, `stacked`, `stackedFor`, and `noGaps` ([ADR 0040](../adr/0040-variant-input-types.md)). Its buttons are `nfsButton` hosts from the [Spec: Button](../issues/37-spec-button.md), each carrying `.button`, which is what Foundation's group rules select. Foundation's descendant selectors pass the group's look to its buttons, so the group needs no token, no child registration, and no change to `nfsButton`.

In development builds the directive reports what Foundation's cascade would otherwise hide: a button inside the group whose `size` can never render, a `color` or `fill` set on both the group and a button, `stacked` together with `stackedFor`, and Foundation classes copied onto the host. Its `nfs-button-group` Library mixin adds three rules Foundation lacks: dropdown arrows that follow the label colour in hollow and clear groups, `$white` arrows in solid groups under `$button-fill: hollow` (1.4.11), and a floor that keeps every button in a `.no-gaps` group 24 px wide after the overlap (2.5.8). Every other rule is Foundation's.

The split button is a composition, not a directive: a Button Group holding an action `nfsButton` and an arrow-only `nfsButton` with a Trigger and screen-reader-only text. The directive declares no listeners, reads no DOM in production, and renders the same classes on the server as on the client.

## User Stories

1. As an application developer, I want to put `nfsButtonGroup` on a container of `nfsButton` elements and get Foundation's joined button bar, so that I never write `.button-group`.
2. As an application developer, I want a `size` input on the group that takes Foundation's size names (`tiny`, `small`, `large`), so that every button in the group takes that size, as Foundation's Sizing example shows.
3. As an application developer, I want a `color` input on the group that accepts exactly the colours of my `$button-palette`, including custom names, so that the whole group takes one colour and a name my Sass lacks fails to compile.
4. As an application developer, I want to colour the buttons of a group one by one with their own `color` input, so that Foundation's Coloring example works without classes.
5. As an application developer, I want a `fill` input on the group that takes `solid`, `hollow`, or `clear`, so that the whole group takes one fill whatever my `$button-fill` default is.
6. As an application developer, I want a `noGaps` input, so that the buttons touch with their borders merged, as Foundation's No Gaps examples show.
7. As an application developer, I want an `expanded` input, so that the group fills its container with buttons of equal width.
8. As an application developer, I want a `stacked` input, so that the group becomes vertical.
9. As an application developer, I want a `stackedFor` input that takes `small` or `medium`, so that the group stacks only on small screens, or on small and medium screens, as Foundation's `stacked-for-*` classes do.
10. As an application developer, I want a misspelt value (`size="smal"`, `fill="holow"`, `stackedFor="large"`, `noGaps="flase"`) to fail to compile, so that a typo never ships as a plain group.
11. As an application developer, I want every group input I leave out to set no class, so that my Sass settings decide the look.
12. As an application developer, I want a development-mode warning when a button inside a group sets `size`, so that I learn to set the size on the group, where Foundation's CSS reads it.
13. As an application developer, I want a development-mode warning when a group and a button inside it both set `color`, or both set `fill`, so that I do not depend on which of Foundation's rules happens to win.
14. As an application developer, I want a development-mode warning when I set `stacked` and `stackedFor` together, so that I notice the group unstacking where I asked it to stack.
15. As an application developer migrating Foundation markup, I want a copied `class="small primary button-group"` on the group to be reported in development, so that I learn to bind `size` and `color` instead.
16. As an application developer, I want to build Foundation's split button from a group, an action button, and an arrow-only button that opens a Dropdown pane, so that I get the split button without a new component.
17. As a user with low vision, I want the dropdown arrow of a split button in a hollow or clear group to contrast with the page, so that I can see the arrow-only button at all.
18. As an application developer whose `$button-fill` is `hollow`, I want a solid group's dropdown arrows to stay visible, so that `fill="solid"` on a group looks like Foundation's solid split button.
19. As a pointer and touch user, I want every button in a no-gaps group to keep at least 24 by 24 CSS pixels that my press lands on, so that the joined buttons meet WCAG 2.2's minimum target size.
20. As a screen reader user, I want the arrow-only button of a split button to have a name that says what its menu holds, so that two split buttons on one page are not both "Show menu".
21. As a screen reader user, I want a group whose grouping carries meaning to be announced as a named group, so that I know which buttons belong together.
22. As a keyboard user, I want every button in a group to be its own tab stop in reading order, so that a Button Group behaves like the buttons it holds.
23. As a keyboard user, I want the focus indicator of a button inside a no-gaps group to stay whole, so that the neighbouring button does not cover it.
24. As an application developer, I want to position a group's buttons with Foundation's Flexbox alignment through the Flexbox Utilities directive beside `nfsButtonGroup`, so that the Flexbox Button Group example works without classes.
25. As a developer of a server-rendered application, I want the server HTML to carry `.button-group` and every Variant class, so that the first paint is correct and hydration changes nothing.
26. As a developer using `@defer (hydrate never)`, I want a group inside the block to look and work as it does after hydration, so that static regions need no JavaScript.
27. As a developer of a zoneless application, I want the directive to need no zone.
28. As an application developer, I want to import the directive from its own entry point, so that a `@defer` block can split it.
29. As an application developer, I want a development-mode report when a bound group colour or size has no class in my compiled CSS, so that drift between my Variant declaration file and my Sass shows up before release.
30. As a library maintainer, I want every behaviour asserted through classes, computed styles, roles, and names in stories, browser-level tests, a server-render smoke test, and e2e, so that regressions surface at the layer that owns them.

## Implementation Decisions

### Foundation contract

Button Group has no Plugin, no `defaults` object, no `data-*` Options, no events, and no methods. Its contract is Foundation's button-group Sass partial, included through the export mixin `foundation-button-group`, and its docs page. Dropped options: none, because there are none.

| Feature | Class or markup | Source of the names | Notes |
| --- | --- | --- | --- |
| Button group | `.button-group` on a container; its buttons match `$buttongroup-child-selector` (`.button` by default) | `button-group` mixin | Flex row that wraps (`$global-flexbox`, true by default), `$buttongroup-spacing` (1 px) between buttons, `$buttongroup-margin` below; every button reset to the default size and its own margin removed. The docs examples use `<a class="button">` without `href` |
| Sizes | `.tiny`, `.small`, `.large` on the group | `$button-sizes` without its `default` key | Sizes every button; a button's own size class never renders inside a group (measured, D5) |
| Colors | Palette names on the group, or on each button | `$button-palette` | Group colour wins over a button's on the default fill; in a hollow or clear group with a group colour, the name later in `$button-palette` wins (measured, D5) |
| Fills | `.solid`, `.hollow`, `.clear` on the group, or on each button | `@each $filling in (solid hollow clear)`; no group rule for the fill equal to `$button-fill` | A group fill other than `$button-fill` replaces a button's own fill; the group's colour pairs are the same `button-fill-style` calls as the Button's |
| No gaps | `.no-gaps` | `button-group-no-gaps` | Negative margin of `$button-hollow-border-width` on each button and a transparent leading border on each following one, so neighbours overlap by that width |
| Even-width group | `.expanded` on the group | `button-group-expand` | `flex: 1 1 0px`; without flexbox, widths for up to `$buttongroup-expand-max` (6) buttons |
| Stacking | `.stacked`, `.stacked-for-small`, `.stacked-for-medium` | `button-group-stack` and `button-group-unstack`, with `breakpoint(medium)` and `breakpoint(large)` written literally | The two responsive names are fixed; Foundation's own compile stops when `$breakpoints` has no `small`, `medium`, or `large` (measured). With `.expanded`, extra rules below each unstack point |
| Split button | A group with a `.button` and a `.dropdown.button.arrow-only` holding `.show-for-sr` text | The Button's classes | No behaviour of its own; the docs name the arrow "Show menu" |
| Flexbox alignment | `.align-center`, `.align-right`, `.align-spaced`, `.align-justify` on the group | `foundation-flex-classes` | Flexbox Utilities classes, not the group's |
| Corner radius | `$buttongroup-radius-on-each` | Sass setting | Compile-time; when false, only the first and last buttons are rounded, through `:first-child` and `:last-child` |

### CSS class to Angular mapping

Structural class:

| Foundation class | Angular | Rationale |
| --- | --- | --- |
| `.button-group` | `NfsButtonGroup`, selector `[nfsButtonGroup]`, static host class | The one Structural class (ADR 0001, ADR 0039); any container element, as Foundation's docs use `div` |
| `.button` on each button | `NfsButton` from the [Spec: Button](../issues/37-spec-button.md) | Foundation's default `$buttongroup-child-selector` is `.button`, which every `nfsButton` host carries |

State classes: none. Button Group has no runtime state; its buttons' `.disabled` belongs to `NfsButton`.

Variant classes, one row per family (building-blocks 1.14 item 2):

| Variant classes | Input | Type alias | Sass setting and Variant registry | Value shape | Class each value sets | Variant property |
| --- | --- | --- | --- | --- | --- | --- |
| `.tiny`, `.small`, `.large` | `size` | `NfsButtonSize`, from `ngx-foundation-sites/button` | `$button-sizes`; `NfsButtonSizesOverrides` | Name | The name's class on the group, which sizes every button in it; `'default'` and no value set none | `--nfs-button-sizes`, written by `nfs-button` (D11) |
| Palette classes (`.primary`, `.secondary`, `.success`, `.warning`, `.alert` by default) | `color` | `NfsButtonColor`, from `ngx-foundation-sites/button` | `$button-palette`, which defaults to `$foundation-palette`; `NfsButtonPaletteOverrides`, chained on `NfsFoundationPaletteOverrides` | Name | The name's class on the group, which colours every button in it; no value sets none | `--nfs-button-palette`, written by `nfs-button` (D11) |
| `.solid`, `.hollow`, `.clear` | `fill` | `NfsButtonFill`, from `ngx-foundation-sites/button` | Closed | Name | The name's class, whatever `$button-fill` is (the class equal to `$button-fill` has no group rule, and the bare group already has that fill); no value sets none | None (closed) |
| `.expanded` | `expanded` | `boolean` through `nfsVariantBoolean` | Closed | Boolean | `.expanded` | None (closed) |
| `.stacked` | `stacked` | `boolean` through `nfsVariantBoolean` | Closed | Boolean | `.stacked` | None (closed) |
| `.stacked-for-small`, `.stacked-for-medium` | `stackedFor` | `NfsButtonGroupStackedFor` | Closed: Foundation writes both names and their breakpoints literally | Name | `'small'` sets `.stacked-for-small` (stacked below `medium`); `'medium'` sets `.stacked-for-medium` (stacked below `large`); no value sets none | None (closed) |
| `.no-gaps` | `noGaps` | `boolean` through `nfsVariantBoolean` | Closed | Boolean | `.no-gaps` | None (closed) |

The Flexbox alignment classes on the group are set by `NfsFlexAlign` of the [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md), placed beside `nfsButtonGroup` with its `alignX` input (D9).

### Hierarchy and DI shape

```
[nfsButtonGroup]                                        NfsButtonGroup (standalone directive, no template)
  button[nfsButton] | a[nfsButton] | input[...][nfsButton]   NfsButton (Spec: Button), unchanged
```

- No token, no providers, no host directives, no Defaults token (D2, D3). The group's Variant classes sit on the container and Foundation's descendant selectors apply them to the buttons, so no group value has to reach a button through DI; `NfsButton` declares and reads no group token.
- Children: a `contentChildren(NfsButton, {descendants: true})` query, read only by the development checks (building-blocks 1.9: `contentChildren` is used only for development validation). Buttons rendered by another component's template inside the group are outside the query and are not checked; Foundation's CSS still styles them.
- Injection: in development builds only, `HostAttributeToken('class')` (optional) reads the static class list for the copied-class warning; in development builds, and in production only under the opt-in, the Runtime checks' Variant check (optional; its shape belongs to the [Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md)). No `ElementRef`, no `nfsBreakpointsToken`: `stackedFor`'s names are Foundation's literals, not Class breakpoints.
- Entry point: `ngx-foundation-sites/button-group`, per the building-blocks naming rule. It imports `NfsButton` at run time for the query (a group is always used with buttons, so the chunk holds both anyway), the aliases `NfsButtonSize`, `NfsButtonColor`, and `NfsButtonFill` as types from `ngx-foundation-sites/button`, and `nfsVariantBoolean` and the registries from `ngx-foundation-sites`. It exports `NfsButtonGroup` and `NfsButtonGroupStackedFor`.

### API: `NfsButtonGroup`

Selector `[nfsButtonGroup]`; no `exportAs` (D12); standalone; OnPush does not apply (no template).

```ts
class NfsButtonGroup {
  readonly size: InputSignal<NfsButtonSize | undefined>;                      // default undefined: no class
  readonly color: InputSignal<NfsButtonColor | undefined>;                    // default undefined: no class
  readonly fill: InputSignal<NfsButtonFill | undefined>;                      // default undefined: no class
  readonly expanded: InputSignalWithTransform<boolean, NfsVariantBoolean>;    // default false
  readonly stacked: InputSignalWithTransform<boolean, NfsVariantBoolean>;     // default false
  readonly stackedFor: InputSignal<NfsButtonGroupStackedFor | undefined>;     // default undefined: no class
  readonly noGaps: InputSignalWithTransform<boolean, NfsVariantBoolean>;      // default false
}

type NfsButtonGroupStackedFor = 'small' | 'medium';
```

| Input | Type and transform | Default | Foundation equivalent | Delta |
| --- | --- | --- | --- | --- |
| `size` | `NfsButtonSize` | `undefined` | `.tiny`, `.small`, `.large` on `.button-group` | New input. `'default'` sets no class, as on `nfsButton` |
| `color` | `NfsButtonColor` | `undefined` | Palette classes on `.button-group` | New input. The same type as `nfsButton`'s `color`, because both follow `$button-palette` |
| `fill` | `NfsButtonFill` | `undefined` | `.solid`, `.hollow`, `.clear` on `.button-group` | New input |
| `expanded` | `boolean`, `nfsVariantBoolean` | `false` | `.expanded` on `.button-group` | New input. No Breakpoint query form: Foundation has no responsive even-width class, unlike `nfsButton`'s `expanded` |
| `stacked` | `boolean`, `nfsVariantBoolean` | `false` | `.stacked` | New input |
| `stackedFor` | `NfsButtonGroupStackedFor` | `undefined` | `.stacked-for-small`, `.stacked-for-medium` | New input, named by the `<words>-for-<bp>` rule (building-blocks 1.4). With `stacked` also set, a development warning (D6) |
| `noGaps` | `boolean`, `nfsVariantBoolean` | `false` | `.no-gaps` | New input |

- Each input's JSDoc names Foundation's class template and the Sass setting (AGENTS.md Design Philosophy 5), and says that the group's value wins over the buttons' (D5). Each declares explicit type arguments that name the exported aliases, and the library build's typings assertion covers all seven (ADR 0040).
- Models, outputs, methods: none. The group owns no state and emits nothing; its buttons' events are native.

Host bindings (all on signal state):

| Binding | Value |
| --- | --- |
| static `class` | `button-group` |
| `[class]` | The Variant classes: one `computed` list with at most one class per input, mapped as in the Variant table, and nothing for a value that is not one class token |

- The directive binds no `role` and no `aria-*` (D4). A consumer's static `role` and naming attributes, and the consumer's own application classes, are untouched.
- A `class` attribute copied from Foundation's markup keeps its classes, because a `[class]` list sets only the classes it lists; the development check reports each Foundation class in it (D7). There is no State class that a copied class could fight.
- Development checks, in the one `afterRenderEffect` read phase below, only when `ngDevMode` is on (never on the server, never in production), each warning once per instance:
  1. A button inside the group (from the content query) with `size` set to a value other than `'default'` warns "size on an nfsButton inside nfsButtonGroup has no effect: Foundation's group rule resets its buttons to the default size; set size on nfsButtonGroup".
  2. A button with `color` set while the group's `color` is set warns "color is set on nfsButtonGroup and on an nfsButton inside it: the group's colour wins on solid groups, and on hollow and clear groups the name later in $button-palette wins; set it in one place".
  3. A button with `fill` set while the group's `fill` is set warns "fill is set on nfsButtonGroup and on an nfsButton inside it: a group fill other than your $button-fill replaces the button's; set it in one place".
  4. `stacked` and `stackedFor` both set warns "stacked and stackedFor are both set: stackedFor unstacks the group from the next breakpoint up; bind one of them".
  5. A static class list holding a Foundation class the directive sets warns once, naming each class with its input, for example "class="small primary" is set by nfsButtonGroup: bind size="small" and color="primary" instead"; a Flexbox alignment class is reported as "class="align-center" is a Flexbox Utilities class: use that spec's directive beside nfsButtonGroup". The check knows the closed names (`solid`, `hollow`, `clear`, `expanded`, `stacked`, `stacked-for-small`, `stacked-for-medium`, `no-gaps`), Foundation's default size and palette names, and the four alignment names of the docs page; a redundant `button-group` merges with the static host class and is not reported.
- Variant check: in development builds, and in production only when the consumer lists the checks in `provideNfsProductionRuntimeChecks`, `NfsButtonGroup` reports its bound `color` and `size` to the Runtime checks after the first render. `strictVariantNames` compares them with `--nfs-button-palette` and `--nfs-button-sizes`; `strictVariantProperties` reports a missing `@include nfs-button;` when both read empty, because `nfs-button` is the one writer of both properties (D11). The report shape, the per-realm read, and the configuration are the Runtime checks' ([ADR 0040](../adr/0040-variant-input-types.md)).

### Implementation level and primitives

Implementation level: native platform. A Button Group is a container element whose look Foundation's CSS gives to the native buttons and links inside it; there is no behaviour to implement. `@angular/aria`'s Toolbar is not used: it is a composite widget with one tab stop and arrow-key navigation, which Foundation's Button Group does not have, the APG reserves toolbars for groups of three or more controls (a split button has two), and `nfsButton` on an `ngToolbarWidget` host would fight its `disabled` and `aria-disabled` bindings (the [Re-run: Button spec under the class rule](../issues/128-rerun-button-class-rule.md), decision 21). This is a different pattern, not a fallback from an Aria building block (D10). `@angular/cdk` adds nothing. The Angular layer is a static host class, one `computed` class list over `input()` signals, a development-only content query, and the static `class` read through `HostAttributeToken` in development builds only; no `effect`, no timer, no observer, no listener.

Render hooks and lazy loading (building-blocks 1.5 and 1.9): the only render hook is one `afterRenderEffect` read phase, created only in development builds or when the consumer opts the Variant check into production; it carries the Variant check report and, in development only, the five warnings, and re-runs only when the signals it reads change. `injectAsync` is not used: every effect is a host binding that must be in the server HTML.

Fallback: none needed. Every behaviour the design depends on was measured (below) or is a host binding.

Measured for this spec (Foundation 6.9.0 Sass compiled with Dart Sass 1.104.1 under the Button spec's required `$button-palette`, with the Button spec's floor and D18 rule emulated; Playwright 1.63 in Chromium, Firefox, and WebKit; axe-core 4.13.0; the three engines agree):

- A button's `.small` inside a plain group renders at 14.4 px, the default size; inside a `.large` group at 20 px.
- Group `.primary` with a button `.alert`: primary background. Hollow group `.primary` with a button `.alert`: alert label; hollow group `.alert` with a button `.primary`: alert label. Hollow group with a button `.clear`: the hollow border shows. Solid group (under `$button-fill: solid`) with a button `.hollow`: the button is hollow.
- Arrow of an arrow-only dropdown button, against what it is drawn on, unrounded with Foundation's `color-luminance()`: under `$button-fill: solid`, 1.00:1 in hollow, clear, hollow alert, and hollow groups whose buttons carry their own colour, and 4.59:1 or more in solid groups; under `$button-fill: hollow`, 1.00:1 in a solid group and 1.15:1 in a solid alert group. With the `nfs-button-group` rules, every arrow equals its label colour in hollow and clear groups (4.59:1 primary, 5.25:1 alert, 5.28:1 success on the page) and is `$white` in solid groups.
- A `.no-gaps.tiny` group of one-glyph buttons: each button but the last is overlapped by 1 px; axe `target-size` reports "Target has insufficient size because it is partially obscured (smallest space is 23px by 27.9px, should be at least 24px by 24px)" for each; with the floor rule there is no violation and hit testing gives each button 24 px.
- Keyboard focus on the middle button of a `.no-gaps` group: the focus indicator is drawn whole in all three engines.
- `.stacked.stacked-for-small` at 800 px: side by side.
- `$breakpoints: (xs: 0, md: 640px, lg: 1024px)`: `foundation-button-group` stops the compile ("expected media condition in parentheses").

### Comparison with Angular Material and Angular Aria (22.2)

| Concern | Material `MatButtonToggleGroup` | Aria `Toolbar` | `NfsButtonGroup` |
| --- | --- | --- | --- |
| Purpose | Single or multiple selection among toggle buttons | Composite widget of controls with one tab stop | Visual grouping of independent buttons |
| Kind | Component (`mat-button-toggle-group`) with `mat-button-toggle` components | Directive (`ngToolbar`) with `ngToolbarWidget` items | Directive on the consumer's container |
| Role | `group` (multiple) or `radiogroup` (single) | `toolbar` | None by default; the consumer's `role="group"` with a name where it carries meaning (D4) |
| Keyboard | Radio-group arrow keys in single mode | Arrow keys, Home, End; roving `tabindex` | Native Tab through each button |
| Cascade to children | Parent token: `appearance`, `disabled`, `name` read by each toggle | Parent class injection | Foundation's descendant selectors; no token (D2) |
| Look | `appearance`, `vertical` | None | `size`, `color`, `fill`, `expanded`, `stacked`, `stackedFor`, `noGaps` over Foundation's classes |
| Value, `disabled`, forms | `value`, `multiple`, `disabled`, `disabledInteractive`, ControlValueAccessor | `disabled`, `softDisabled` | None (D8) |

Borrowed: nothing structural; Material's `vertical` is the same idea as Foundation's `stacked`, kept under Foundation's name. Not borrowed: the selection model, the value, the group-level `disabled`, the parent token, and Aria's roving focus.

### ARIA and keyboard

APG pattern: none for the group, which is not a widget; each button follows the Button pattern (Link for `<a>` hosts), per the [Spec: Button](../issues/37-spec-button.md).

| Element or state | Rendered semantics | Source |
| --- | --- | --- |
| `[nfsButtonGroup]` | The host element's own semantics (a `div` has none); no role from the directive | APG names and descriptions: naming a `group` is discretionary; a role is added by the consumer when the grouping carries meaning |
| A group whose grouping carries meaning (a split button, a set of related actions without context in their names) | The consumer writes `role="group"` with `aria-labelledby` pointing at visible text, or `aria-label` | WAI-ARIA `group`; APG names and descriptions |
| Buttons | Native roles and names, as in the Button spec | HTML |
| Split button's arrow-only button | Named from screen-reader-only text that says what the menu holds ("More save options"), inside the Visibility Classes directive; `aria-expanded` and `aria-controls` from the Trigger | Foundation's docs (screen-reader-only text); Triggers utility |

| Key | Behaviour | Owner |
| --- | --- | --- |
| Tab, Shift+Tab | Move through the group's buttons one by one, in DOM order; stacking and alignment change layout, not order | Native |
| Enter, Space | Activate the focused button | Native |

The directive adds no key handling and no tab stop management.

### WCAG 2.2 AA

The target is WCAG 2.2 level AA (ADR 0022). Each criterion is a requirement with the layer that tests it.

| Criterion | Requirement and how it is met | Foundation default | Test |
| --- | --- | --- | --- |
| 2.5.8 Target Size (Minimum) | Every button in a group has at least 24 by 24 CSS px that a press lands on. The `nfs-button` floor gives each button 24 by 24; in a `.no-gaps` group each button but the last is overlapped by its neighbour by `$button-hollow-border-width`, so `nfs-button-group` raises the floor of those buttons by that width: `.button-group.no-gaps .button:not(:last-child) { min-width: calc(24px + 0.0625rem); }` with Foundation's defaults. It changes nothing for buttons already wider | Fails for `size="tiny"` one-glyph buttons in a `.no-gaps` group: 23 px unobscured, an axe violation in three engines (measured) | axe `target-size` in every story (`button-group--no-gaps` includes a `size="tiny"` group of buttons labelled `I`); e2e hit testing in three engines; node-level Sass compile test |
| 1.4.11 Non-text Contrast | The dropdown arrow of every button in a group contrasts at least 3:1 with what it is drawn on. `nfs-button-group` colours the arrow with `currentColor` in hollow and clear groups (the label colour, which the `nfs-button` 1.4.3 check holds at 4.5:1 against `$body-background`, on hover too) and with `$white` in solid groups under `$button-fill: hollow` (the pair the `nfs-button` arrow check holds at 3:1) | Fails: `$white` arrows at 1.00:1 in hollow and clear groups; under `$button-fill: hollow`, fill-coloured arrows at 1.00:1 and 1.15:1 in solid groups (measured in three engines) | `button-group--split-buttons` play function asserts the arrow's computed `border-top-color` equals the label colour in the hollow group; node-level Sass compile test; axe has no 1.4.11 rule |
| 1.4.3 Contrast (Minimum) | Every group label pair is a Button pair: Foundation's group rules call the same `button-fill-style` with the same `$button-palette` entries and the same `auto` hover and label colours as the Button's classes, so the `nfs-button` compile-time check and the Button spec's required `$button-palette` cover them | Fails as the Button's classes do (alert 4.498:1, hollow and clear success and warning under 2:1) | axe `color-contrast` in every story under the Storybook preview settings, which carry the required palette |
| 1.4.1 Use of Color | The disabled look of a grouped button is the Button's `.disabled` and `[disabled]` look, checked by `nfs-button` | As the Button | As the Button |
| 2.4.7 Focus Visible | The browser's own focus indicator on every button; the button-group partial has no outline rule, and in a `.no-gaps` group the indicator is drawn whole (measured in three engines) | Passes | e2e screenshot after Tab to the middle button of `button-group--no-gaps` in three engines |
| 2.1.1 Keyboard | Every button keeps its native keys; the group adds none and removes no tab stop | Foundation's `<a class="button">` examples without `href` are not focusable; the Button's placeholder-link warning reports them | Play functions with `userEvent.tab()` |
| 1.3.1 Info and Relationships | A grouping that carries meaning is exposed as a named `group` by the consumer; a split button's arrow names what it opens | Foundation writes no role and names the arrow "Show menu" | Play function of `button-group--split-buttons` finds the named group and the arrow by name; axe `aria-allowed-role` and `button-name` |
| 1.3.2 Meaningful Sequence, 2.4.3 Focus Order | Stacking and Flexbox alignment change layout only; DOM order is reading and focus order | Passes (none of Foundation's group classes reorders) | Play function of `button-group--stacking` asserts Tab order equals DOM order |
| 4.1.2 Name, Role, Value | As the Button; the Trigger on a split button's arrow renders its state | Passes for named buttons | axe `button-name`, `link-name` in every story |

The axe gate in every story runs the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, plus `best-practice`) with `parameters.a11y.test = 'error'` (ADR 0018).

### Rendered HTML

Consumer markup and the resulting DOM. Server HTML and hydrated DOM are identical for every row: every class comes from inputs, and nothing depends on the platform or the viewport (stacking is CSS media queries). Class order is not significant. Angular also renders the directive attribute and every static attribute that feeds an input (`nfsbuttongroup`, `size="small"`); the resulting DOM below leaves them out.

```html
<!-- Default (Foundation's Basics, with real targets) -->
<div nfsButtonGroup>
  <a nfsButton href="/one">One</a>
  <a nfsButton href="/two">Two</a>
  <a nfsButton href="/three">Three</a>
</div>
<div class="button-group">
  <a class="button" href="/one">One</a>
  <a class="button" href="/two">Two</a>
  <a class="button" href="/three">Three</a>
</div>

<!-- Sized and coloured as a whole, hollow, with no gaps -->
<div nfsButtonGroup size="small" color="primary" fill="hollow" noGaps>
  <button nfsButton>Harder</button>
  <button nfsButton>Better</button>
</div>
<div class="button-group small primary hollow no-gaps">
  <button class="button" type="button">Harder</button>
  <button class="button" type="button">Better</button>
</div>

<!-- Buttons coloured one by one -->
<div nfsButtonGroup>
  <button nfsButton color="secondary">View</button>
  <button nfsButton color="alert">Delete</button>
</div>
<div class="button-group">
  <button class="button secondary" type="button">View</button>
  <button class="button alert" type="button">Delete</button>
</div>

<!-- Even width, stacked on small screens -->
<div nfsButtonGroup expanded stackedFor="small">
  <button nfsButton>How</button>
  <button nfsButton>Low</button>
</div>
<div class="button-group expanded stacked-for-small">
  <button class="button" type="button">How</button>
  <button class="button" type="button">Low</button>
</div>

<!-- Split button: a named group, an action, and an arrow-only Trigger of a Dropdown pane placed after the group -->
<div nfsButtonGroup role="group" aria-label="Save">
  <button nfsButton (click)="save()">Save</button>
  <button nfsButton dropdown arrowOnly [nfsToggle]="saveMenu">
    <span nfsShowForSr>More save options</span>
  </button>
</div>
<div nfsDropdownPane #saveMenu="nfsDropdownPane">...</div>
<div class="button-group" role="group" aria-label="Save">
  <button class="button" type="button">Save</button>
  <button class="button dropdown arrow-only" type="button" aria-expanded="false" aria-controls="...">
    <span class="show-for-sr">More save options</span>
  </button>
</div>

<!-- Flexbox alignment from the Flexbox Utilities directive beside the group -->
<div nfsButtonGroup nfsFlexAlign alignX="center">...</div>
<div class="button-group align-center">...</div>
```

The Trigger's attributes belong to the [Spec: Triggers (shared utility)](../issues/54-spec-triggers.md) and the pane's markup to the [Spec: Dropdown](../issues/26-spec-dropdown.md); they are shown only to place them. `nfsShowForSr` is the [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md)'s directive for `.show-for-sr`, imported as `NfsShowForSr` from `ngx-foundation-sites/visibility`; `nfsFlexAlign` and `alignX` are the [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md)'s. No `jsaction` appears on the group; the buttons carry one only where the consumer or another directive declared a listener.

### Animation

None of the group's own. The buttons keep Foundation's `$button-transition` colour change (the Button spec's Animation section); nothing in the group enters, leaves, or changes state, so ADR 0003's mechanics have nothing to govern and no reduced-motion rule is needed.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7:

- Server-side rendering and first paint: the server HTML carries `.button-group` and every Variant class, exactly as the hydrated DOM does (rule 1); Foundation's CSS styles the first paint, stacking included.
- Before hydration: the directive touches no DOM, reads no `window`, measures nothing, and starts no timer (rules 3 to 5). The content query is read, and the checks run, only in the browser's `afterRenderEffect`, never on the server.
- Full hydration: host binding values equal the server's, so hydration changes no class; the directive is hydration-clean by construction (rule 10).
- Incremental hydration: the group needs no Hydration boundary of its own, since its buttons do not register with it; buttons inside a deferred block inside the group are styled by CSS either way. A split button's Trigger and its Dropdown pane share one Hydration boundary, the Triggers rule.
- Event replay: the directive declares no listeners, adds no `jsaction`, and has nothing to replay; the buttons' listeners follow the Button spec.
- `@defer`: library templates contain no `@defer`. Inside a dehydrated block, and inside `@defer (hydrate never)`, a group is its server HTML and looks and works exactly as after hydration, because everything it does is CSS; the development checks and the Variant check do not run there.
- Prerendering: identical to SSR; the directive reads no request token (rule 11).

## Testing Decisions

A good test here asserts what a user or assistive technology observes: the classes on the group, the computed size, colour, arrow colour, and geometry of its buttons, the role and name of a named group, Tab order, and the development warnings. No test reads the directive's fields. Prior art: the [Spec: Button](../issues/37-spec-button.md)'s layers, whose Variant mapping, copied-class, and Variant check cases this spec follows.

Story ids follow `button-group--<story>`, Foundation's docs examples in docs order after `Default`: `button-group--default`, `button-group--sizing`, `button-group--coloring`, `button-group--hollow-and-clear`, `button-group--no-gaps`, `button-group--even-width`, `button-group--stacking`, `button-group--split-buttons`, `button-group--flexbox`. The Button spec's former `button--button-group` and `button--split-button` stories are these. Stories set inputs, use Foundation's default names only (so the library's Storybook program needs no Variant declaration file), and write no Foundation class; every Foundation `<a class="button">` without `href` becomes a `<button nfsButton>` or a link with an `href`.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Run by `npx nx test-storybook <lib>`. Every story runs axe with `parameters.a11y.test = 'error'` and the WCAG 2.2 AA rule set, under the Storybook preview settings (the Button spec's required `$button-palette`; `nfs-button` and `nfs-button-group` included). Layer 1 runs at a 414 px viewport, below `medium`.

- `button-group--default`: the host has `.button-group`; three buttons found by `getByRole` with their names; `userEvent.tab()` reaches them in DOM order.
- `button-group--sizing`: `size="tiny"`, `size="small"`, and `size="large"` groups; each button's computed `font-size` equals Foundation's size for the group; a group with no size renders the default size.
- `button-group--coloring`: buttons coloured one by one carry their colours' backgrounds; a `color="primary"` group gives every button the primary background.
- `button-group--hollow-and-clear`: buttons with their own `fill`, and `fill="hollow"` and `fill="clear"` groups; the group's buttons have transparent backgrounds and the palette colours as label colours.
- `button-group--no-gaps`: `noGaps` groups, one of them `size="tiny"` with buttons labelled `I`; each button but the last overlaps its neighbour, and its width minus the overlap is at least 24 px; axe `target-size` passes.
- `button-group--even-width`: the buttons of an `expanded` group have equal widths that add up to the group's content width, less the spacing.
- `button-group--stacking`: `stacked`, `stackedFor="small"`, and `stackedFor="medium"` groups are all stacked at 414 px (each button on its own line); Tab order equals DOM order.
- `button-group--split-buttons`: Foundation's split button and one in a `fill="hollow"` group, each a named `group` holding the action and an arrow-only button found by its screen-reader-only name; clicking the arrow toggles `aria-expanded` and opens the Dropdown pane placed after the group; in the hollow group, the arrow's computed `border-top-color` equals the button's computed `color`.
- `button-group--flexbox`: Foundation's four alignments through the Flexbox Utilities directive; the group's computed `justify-content` matches each.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

TestBed specs in `<name>.spec.ts` next to the directive, over a bare test host component, zoneless with `await fixture.whenStable()`, asserting DOM state; no story is mounted and no axe runs here.

- Variant classes, driven by data: every value of every input sets exactly the class of the Variant table; no value, `false`, and `size="default"` set none; a cast value that is not one class token sets none; changing a value swaps its class and leaves `.button-group`, the other Variant classes, and the consumer's own classes alone.
- Development checks: a button with `size="small"` in a group warns once and `size="default"` does not; `color` on both the group and a button warns once, and on only one of them does not; the same for `fill`; `stacked` with `stackedFor` warns once; a static `class="small primary hollow no-gaps stacked-for-small align-center"` warns once, naming `size`, `color`, `fill`, `noGaps`, `stackedFor`, and the Flexbox Utilities directive, and the copied classes stay in the rendered class list; a redundant static `button-group` and the consumer's own classes are not reported; a button rendered by a child component inside the group is not checked.
- Static attributes: a consumer's `role="group"` and `aria-label` stay through every Variant change.
- Runtime check (the Variant check): with a style block standing in for the `nfs-button` Variant properties, a listed `color` is silent; an unlisted `color` bound through a cast reports `strictVariantNames` once, naming `NfsButtonGroup`, the input, the value, and `$button-palette`; with no style block, one `strictVariantProperties` report names `@include nfs-button;`.
- Zoneless: the suite runs with zoneless change detection; no test needs `NgZone`.

### 3. Node-level Vitest

- SSR smoke: `renderApplication` over a fixture component holding a group with every input set (`size="small" color="alert" fill="hollow" expanded stackedFor="medium" noGaps`) and a split button with its Dropdown pane. Assert `whenStable()` resolves; the server HTML carries `.button-group` and the group's Variant classes, the buttons' classes and `type`, and the named group; the group carries no `jsaction`; no Runtime check reports on the server. Runs under `npx nx test <lib>` in `<name>.ssr.spec.ts` through the shared `renderServer()` helper.
- Sass compile: `@include nfs-button-group;` over Foundation's defaults (with the required `$button-palette`) emits `.button-group.hollow .button.dropdown::after` and `.button-group.clear .button.dropdown::after` with `border-top-color: currentColor`, `.button-group.no-gaps .button:not(:last-child) { min-width: calc(24px + 0.0625rem); }`, no `.solid` arrow rule, and no `:root` property; under `$button-fill: hollow` it emits `.button-group.solid .button.dropdown::after { border-top-color: <$white>; }` and the `currentColor` rule for `.clear` only; `$buttongroup-child-selector: '> .button'` appears in every selector.
- Pure logic: none worth isolating; the mapping is covered through the DOM in layer 2.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build, in Chromium, Firefox, and WebKit:

- Stacking at real viewports in `button-group--stacking`: `stackedFor="small"` is stacked below the `medium` width and side by side at it; `stackedFor="medium"` is stacked below the `large` width and side by side at it; `stacked` is stacked at every width.
- Target size in `button-group--no-gaps`: hit testing across each button's row finds at least 24 px that returns the button.
- Focus visible in `button-group--no-gaps`: a screenshot comparison before and after Tab to the middle button shows the whole focus indicator.

Against the prerendered fixture app: JavaScript disabled, a screenshot plus axe (`@axe-core/playwright` with the six tags) on the group route's server HTML; hydration with no NG05xx and `ngDevMode.componentsSkippedHydration === 0`. Pre-hydration clicks and replay are the Button, Triggers, and Dropdown specs' cases.

## Out of Scope

- A default `role="group"` and a naming check (D4).
- A Parent token, child registration, or group values passed to `nfsButton` through DI (D2).
- Toolbar keyboard navigation and Aria's `Toolbar` (D10); a consumer who needs a toolbar builds one outside this directive, without `nfsButton` on its widgets.
- Selection among the group's buttons (Material's button toggle group); a pressed button is the Button spec's `aria-pressed` guidance or a Toggler in class mode.
- A group-level `disabled` (D8).
- A responsive `expanded` on the group: Foundation has no such class.
- The Flexbox alignment classes (the [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md)) and `.show-for-sr` (the [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md)).
- The split button's menu: a Dropdown pane opened by a Trigger (the [Spec: Dropdown](../issues/26-spec-dropdown.md), the [Spec: Triggers (shared utility)](../issues/54-spec-triggers.md)).
- More than `$buttongroup-expand-max` buttons in an even-width group under `$global-flexbox: false`, and renamed breakpoints, both limits of Foundation's own Sass.
- Runtime theming through custom properties (building-blocks 1.13).

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | One attribute directive, `NfsButtonGroup`, selector `[nfsButtonGroup]`, binding `.button-group` | ADR 0001 and ADR 0039: one directive per Structural class; Foundation generates no structure; any container element, as the [Spec: Forms](../issues/98-spec-forms.md)'s `[nfsInputGroup]` | A component with a template; `div[nfsButtonGroup]` only (a group on another element would silently get no class) |
| D2 | No token: the group's Variant classes reach its buttons through Foundation's descendant selectors; `NfsButton` is unchanged | The triage's reason re-checked under typed inputs and measured: a `size="large"` group renders its buttons at 20 px and a `color="primary"` group paints them primary with no value passed to the button; a token would duplicate what the CSS already does and add a second, script-dependent path that is absent before hydration | A parent token feeding `size`, `color`, and `fill` into `nfsButton` (Material's toggle-group cascade), which would need a Button amendment and would disagree with Foundation's own rules where a button sets its own value |
| D3 | Seven Variant inputs: `size`, `color`, `fill`, `expanded`, `stacked`, `stackedFor`, `noGaps`; `size`, `color`, and `fill` reuse `NfsButtonSize`, `NfsButtonColor`, and `NfsButtonFill` | ADR 0040 and building-blocks 1.4 (enum per mutually exclusive set, boolean per single class, `stackedFor` by the `<words>-for-<bp>` rule, which names this very input); the group's families follow `$button-sizes` and `$button-palette` exactly as the Button's do, so one alias per setting keeps one type per registry | Group aliases (`NfsButtonGroupColor`) equal to the Button's; one `stacked: true \| 'small' \| 'medium'` input (building-blocks 1.4 keeps Foundation's words); `stackedFor` typed as a Class breakpoint query (Foundation writes the two names and their breakpoints literally, and its compile stops without them, measured) |
| D4 | No default `role`; the consumer writes `role="group"` with a name where the grouping carries meaning | The triage's decision stands: the APG calls naming a group discretionary, an unnamed `group` adds nothing, and a static host `role` would replace the semantics of any other host element (a `nav`, a `fieldset`); the buttons carry the names WCAG requires. Guidance and the split-button examples show the named form | A static host `role="group"` (Bootstrap's markup); a development check for an unnamed group |
| D5 | Development warnings for a button inside the group with `size`, and for `color` or `fill` set on both the group and a button, from a development-only `contentChildren(NfsButton, {descendants: true})` query | Measured in three engines: Foundation's group rule resets every button to the default size, a group colour wins on solid groups and palette order decides on filled ones, and a non-default group fill wins; the typed inputs make these look supported, and nothing else reports them. Building-blocks 1.9 allows `contentChildren` for development validation, and the query needs no Button change | A group token that `nfsButton` reads to warn (a Button amendment for a development check); a library rule letting a button's own size win (overrides Foundation's cascade); documentation only |
| D6 | A development warning for `stacked` with `stackedFor` | Both classes together unstack from the next breakpoint (measured at 800 px), which neither input's name suggests; two inputs cannot exclude each other in the template type | Binding only one of the two (an explicit value always sets its class, building-blocks 1.4) |
| D7 | A development warning for Foundation classes copied onto the host, through `HostAttributeToken('class')` in development builds only, covering the group's classes and the docs page's four alignment classes | Building-blocks 1.4's initial-state rule; copied classes keep styling beside the inputs' classes without being the contract, and the alignment classes appear on this docs page's own example | No check; checking consumer-declared palette and size names (the Variant check reports values the CSS lacks) |
| D8 | No group-level `disabled`, outputs, methods, or models | Foundation has no group state; each `nfsButton` owns its disabled contract, which a group value could only duplicate | Material's toggle-group `disabled` cascade |
| D9 | Flexbox alignment comes from `nfsFlexAlign` and its `alignX` input, written beside `nfsButtonGroup` | `.align-*` are Utility classes of `foundation-flex-classes`, not of the button-group partial; directive composition over duplication (map, Standing preferences) | An `align` input on the group, which would give one Utility class family two owners |
| D10 | Native implementation level; Aria's `Toolbar` is not used, and this is not a fallback | Foundation's Button Group has no keyboard contract; the APG toolbar pattern changes Tab into arrow keys and is for three or more controls; `nfsButton` on an `ngToolbarWidget` fights its `disabled` and `aria-disabled` bindings | Hosting `ngToolbar` on the group |
| D11 | `nfs-button-group` writes no Variant property; the group's `color` and `size` are checked against `--nfs-button-palette` and `--nfs-button-sizes`, which `nfs-button` alone writes | A Variant property needs one writer: an empty property and a missing one read the same, so a second writer of the same list would keep the properties present when `nfs-button` is missing and hide that include from `strictVariantProperties`; a group is always used with `nfsButton`, so `nfs-button` is always there to write them | Writing both properties again, as a literal reading of building-blocks 1.13 would have it (duplicate CSS that hides a missing `nfs-button`) |
| D12 | No `exportAs` | Nothing reads a group through a template reference; adding it later is additive | `exportAs: 'nfsButtonGroup'` for parity with `nfsButton` and `nfsCloseButton` |
| D13 | `nfs-button-group` emits the arrow rules and the no-gaps floor, and no compile-time check of its own | 1.4.11 and 2.5.8 failures Foundation's settings cannot fix (measured); every label and arrow colour the rules produce is a pair `nfs-button` already checks, because the group calls Foundation's `button-fill-style` with the same settings | A second contrast check duplicating `nfs-button`'s; arrow rules per palette entry mirroring Foundation's button rules (one rule per fill and name, where `currentColor` is one rule per fill) |

### Usage examples

`nfsShowForSr` is the [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md)'s directive for `.show-for-sr`, imported as `NfsShowForSr` from `ngx-foundation-sites/visibility`.

```ts
@Component({
  selector: 'app-document-actions',
  imports: [NfsButtonGroup, NfsButton, NfsToggle, NfsDropdownPane, NfsShowForSr],
  template: `
    <!-- A split button: the arrow's text names its menu -->
    <div nfsButtonGroup fill="hollow" role="group" aria-label="Save">
      <button nfsButton (click)="save()">Save</button>
      <button nfsButton dropdown arrowOnly [nfsToggle]="saveMenu">
        <span nfsShowForSr>More save options</span>
      </button>
    </div>
    <!-- After the group: Foundation's group rules style every button inside the group, the pane's included -->
    <div nfsDropdownPane #saveMenu="nfsDropdownPane">
      <button nfsButton size="small" (click)="saveAs()">Save as...</button>
    </div>

    <!-- A view switcher: one colour for the whole group, stacked on small screens -->
    <div nfsButtonGroup color="secondary" stackedFor="small" noGaps>
      @for (view of views; track view) {
        <button nfsButton [attr.aria-pressed]="view === current()" (click)="current.set(view)">{{ view }}</button>
      }
    </div>
  `,
})
export class DocumentActions {
  protected readonly views = ['Day', 'Week', 'Month'];
  protected readonly current = signal('Week');
  // save and saveAs omitted
}
```

```html
<!-- Development warning: the button's size never renders inside a group; set it on the group -->
<div nfsButtonGroup>
  <button nfsButton size="small">One</button>
</div>

<!-- The corrected form -->
<div nfsButtonGroup size="small">
  <button nfsButton>One</button>
</div>
```

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. The directive relies on Foundation's export mixin `foundation-button-group`, and its buttons on `foundation-button`; every class the directive binds is already styled by it. Its documented custom CSS is the `nfs-button-group` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-button-group` and after `nfs-button`. (1) Rules, each nested under `#{$buttongroup-child-selector}` as Foundation's own group rules are: for each of `hollow` and `clear` that is not `$button-fill`, `.button-group.<fill> .button.dropdown::after { border-top-color: currentColor; }`, because Foundation colours the arrow only for buttons that carry `.hollow` or `.clear` themselves, so a filled group keeps `$white` arrows on the page (1.4.11); the arrow then follows the label's colour on hover too, where Foundation's own button arrows keep the resting colour, which only raises its contrast; while `$button-fill` is `hollow`, `.button-group.solid .button.dropdown::after { border-top-color: $white; }`, because Foundation's hollow-default arrow colour reaches a solid group's buttons, which carry no `.solid` of their own for the Button spec's D18 rule to match (1.4.11); and `.button-group.no-gaps .button:not(:last-child) { min-width: calc(24px + #{rem-calc($button-hollow-border-width)}); }`, because Foundation's no-gaps rule overlaps each button with the next by that width, so the `nfs-button` floor alone leaves 23 px unobscured (2.5.8). No rule duplicates or overrides any other Foundation style. (2) Reused settings and functions: `$button-fill`, `$buttongroup-child-selector`, `$button-hollow-border-width`, `$white`, and `rem-calc()`. No compile-time check of its own: every label, arrow, and disabled pair in a group is one `nfs-button` checks (D13). (3) Custom properties: none that the directive writes. (4) Motion classes: none, and no `prefers-reduced-motion` override. (5) What breaks when the include is missing: split-button arrows disappear in hollow and clear groups, and in solid groups under `$button-fill: hollow`; one-glyph `size="tiny"` buttons in a no-gaps group fall to 23 px of unobscured width; no Runtime check reports it, because the properties the group reads are `nfs-button`'s. (6) Variant properties: none written; the group's `color` and `size` are read against `--nfs-button-palette` and `--nfs-button-sizes`, which `nfs-button` writes (D11).

### Foundation behaviour changed or dropped

- The dropdown arrow in hollow and clear groups, and in solid groups under `$button-fill: hollow`: made visible by one rule each (1.4.11).
- The no-gaps overlap: the floor of each overlapped button grows by the overlap (2.5.8).
- `<a class="button">` without `href` in the docs examples: written as buttons or real links; the Button spec's placeholder-link warning reports the rest.
- "Show menu": the examples name what the menu holds.

### Notes

- A Dropdown pane, or anything holding `nfsButton` hosts, goes outside the group: Foundation's descendant selector styles every `.button` inside the group, so buttons in a pane inside it would take the group's size, colour, and margins.
- A Tooltip on a grouped button inserts its tip beside the button, so the last button stops being `:last-child`: with Foundation's defaults it keeps a 1 px right margin, and with `$buttongroup-radius-on-each: false` it loses its rounded corners. The [Spec: Tooltip](../issues/27-spec-tooltip.md) records this as a limit of the sibling tip (D23). Angular's control-flow comments are not elements and change neither pseudo-class.
- RTL: Foundation compiles direction into the group's margins; the no-gaps floor is the same on either side, and the directive has nothing direction-dependent.
- Static input attributes stay in the DOM (`<div nfsButtonGroup color="primary">` keeps `color="primary"`), as Angular leaves every static attribute; none means anything on a container element.
- `NfsButtonGroup` uses only Variant inputs, so all its booleans go through `nfsVariantBoolean` (`noGaps="flase"` fails to compile).

### Platform features to adopt when the browser target moves

- Nothing in the platform research applies. `:has()` would let a check or rule see a group's buttons from CSS, but no rule here needs it.
