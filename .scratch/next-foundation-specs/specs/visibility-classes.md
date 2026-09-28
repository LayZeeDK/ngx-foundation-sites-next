# Spec: Visibility Classes

Ticket: [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Written under the class rule ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)) and the Variant typing rules ([ADR 0040](../adr/0040-variant-input-types.md)).

## Problem Statement

A developer on Foundation for Sites shows or hides content with Foundation's Visibility Classes: `.show-for-medium` hides an element below `medium`, `.show-for-medium-only` shows it only at `medium`, `.hide-for-large` and `.hide-for-large-only` do the opposite, `.hide` and `.invisible` hide it always, `.show-for-landscape`, `.show-for-dark-mode`, and `.show-for-sticky` show it under a condition, `.show-for-sr` hides it from sight but not from a screen reader, and `.show-on-focus` shows it only while it has focus, which is how Foundation builds a skip link. The family is CSS only: Foundation's media queries decide, so server HTML is right at every width. The markup contract leaves the hard parts to the author:

- The breakpoint classes exist only for the breakpoints in `$breakpoint-classes` (`small medium large` by default), and not for every form: there is no `.show-for-small` or `.hide-for-small`, and the docs send the reader to `.hide`. A `show-for-xlarge` or a misspelt `show-for-meduim` renders a plain, always visible element, and nothing reports it.
- Where the orientation and dark-mode classes show an element they set `display: block !important`, and `.hide-for-dark-mode` sets `display: block` at all times. Measured in Chromium, Firefox, WebKit, and Edge: a `span` or a flex `.menu` becomes a block, and beside a breakpoint class they win, so `show-for-medium show-for-landscape` shows below `medium` in landscape and `show-for-medium show-for-dark-mode` shows below `medium` in dark mode.
- `.show-for-sticky` and `.hide-for-sticky` react to an enclosing stuck Sticky element; on the Sticky element itself `.show-for-sticky` never shows (measured).
- `.show-for-ie` and `.hide-for-ie` detect Internet Explorer through `-ms-high-contrast`, which no browser of the Angular 22 target matches: measured in Chromium 153, Firefox 155, WebKit 26.6, and Edge 153, with and without forced colours, `.show-for-ie` always hides and `.hide-for-ie` does nothing.
- On a focusable element, `.show-for-sr` leaves a 1 by 1 px box that takes focus with no visible indicator (WCAG 2.4.7): measured in three engines on a visually hidden file input, the File Upload recipe of Foundation's Forms docs. axe reports nothing.
- `.show-on-focus` shows only the element that has focus. Written on a wrapper around the link, it paints nothing while the link has focus (0 pixels in three engines), and axe reports nothing. Foundation's skip link example gives `<main>` a `tabindex="0"`, an extra tab stop, and a bare `href="#mainContent"`, which `<base href>` resolves to another document on every route but the base URL ([ADR 0038](../adr/0038-smooth-scroll-same-document-links.md)).
- Hidden content is hidden from everyone, assistive technology included. Content shown in one orientation only fails 1.3.4, and content hidden below a breakpoint is lost at 320 CSS px and at 400 percent zoom (1.4.10) unless another element carries it. The docs say nothing about either.
- Under the library's class rule the developer writes no Foundation class at all, so every Visibility class needs an Angular home.

A server-rendered application adds the usual second problem: whatever the Angular layer does must already be right in the server HTML at every viewport width, with no JavaScript deciding what is visible, must not break hydration, and must keep working inside dehydrated `@defer` blocks and `hydrate never`.

## Solution

Three attribute directives in one entry point, each nothing but host bindings that are already in the server HTML; none declares a listener or reads the viewport.

- `nfsVisibility` sets the conditional and generic hiding classes from four typed Variant inputs. `showFor` and `hideFor` keep Foundation's words and take a Breakpoint query over the developer's Class breakpoints (`showFor="medium"`, `hideFor="large only"`), or a condition: `'landscape'`, `'portrait'`, `'dark-mode'`, or `'sticky'`. `hideFor` written alone means "always", which is Foundation's `.hide`, and so does `hideFor` at the Zero breakpoint, as Foundation's docs advise. `invisible` and `visible` set Foundation's `visibility` classes. A misspelt or undeclared breakpoint, a `down` modifier (for which Foundation generates no class), and a Foundation class name fail to compile.
- `nfsShowForSr` binds `.show-for-sr` for text that names or describes something to assistive technology without being seen: the name of an icon-only button, the end of a link's or button's visible text, a visually hidden live region.
- `nfsShowOnFocus` binds `.show-on-focus` on the focusable element itself; the skip link is `nfsShowOnFocus` beside `nfsSmoothScroll`, with an `href` built from the live current path.

Foundation's media queries do all the work, so the page is right before any script runs. In development builds the directives warn about what axe and the compiler miss: visually hidden text that takes focus, `nfsShowOnFocus` on an element that never gets focus, a pair of classes Foundation's CSS cannot combine, a sticky condition outside a Sticky element, a second directive binding Visibility classes on the same element, and Foundation's classes copied onto the host. The library adds no CSS. The Plugin directives that own a Visibility class for their own behaviour (the Responsive Toggle's bar and menu, a Drilldown level's `invisible`) keep binding it themselves, and `nfsVisibility` stays off their elements.

## User Stories

1. As an application developer, I want to write `nfsVisibility showFor="medium"` on any element and get Foundation's `.show-for-medium`, so that I write no Foundation class.
2. As an application developer, I want `showFor="medium only"` and `hideFor="medium only"` for Foundation's `-only` classes, so that one input covers both forms of the class.
3. As an application developer, I want `hideFor="large"` to hide an element from `large` up, so that Foundation's hide classes carry over word for word.
4. As an application developer, I want `hideFor` written alone, or `hideFor="small"` at the Zero breakpoint, to hide an element at every width through Foundation's `.hide`, so that I never look for a `hide-for-small` class Foundation does not have.
5. As an application developer, I want `showFor` at the Zero breakpoint to set no class, so that a bound value can mean "shown at every width".
6. As an application developer whose Sass adds `xlarge` to `$breakpoint-classes`, I want `showFor="xlarge"` to compile once my Variant declaration file lists it, so that my Sass settings stay the list of breakpoints.
7. As an application developer, I want a misspelt breakpoint, a breakpoint my Sass generates no classes for, a `down` modifier, or a Foundation class name as a value to fail to compile, so that a typo never ships an element that is always visible.
8. As an application developer, I want to bind `[showFor]` and `[hideFor]` from component state, so that one element can switch its range and the binding is type-checked.
9. As an application developer, I want `showFor` and `hideFor` together on one element (`showFor="medium" hideFor="large only"`), so that I can show it in a range Foundation's single classes do not name.
10. As an application developer, I want `showFor="landscape"`, `showFor="portrait"`, and their `hideFor` forms, so that orientation hints keep Foundation's classes.
11. As an application developer, I want `showFor="dark-mode"` and `hideFor="dark-mode"`, so that content that differs by colour scheme keeps Foundation's classes.
12. As an application developer using the Sticky directive, I want `showFor="sticky"` and `hideFor="sticky"` on elements inside the sticky element, so that a compact title can replace a full one while the bar is stuck.
13. As an application developer, I want `invisible` to hide an element while it keeps its space, and `visible` to show a descendant of an invisible element, so that Foundation's `visibility` classes have an input each.
14. As an application developer, I want a development warning when I combine an orientation value, or `showFor="dark-mode"`, with a second value on the same element, so that I learn Foundation's CSS lets the first override the second and move one to a wrapper.
15. As an application developer, I want a development warning when a sticky condition sits outside a Sticky element or on the Sticky element itself, so that I learn why it never changes.
16. As an application developer migrating Foundation markup, I want a copied `class="show-for-medium"` to be reported in development, naming the input to bind, so that I remove the class.
17. As an application developer, I want a development warning when another library directive on the same element binds Visibility classes, so that the Responsive Toggle and my `nfsVisibility` do not silently fight over one class.
18. As an application developer, I want a development report when I bind a breakpoint my compiled CSS has no class for, or forget `@include nfs-breakpoint-properties;`, so that drift between my Sass and my types surfaces early.
19. As an application developer, I want the library to tell me that the IE detection classes are gone and why, so that I delete them instead of looking for an input.
20. As an application developer, I want `nfsShowForSr` on a `span` inside an icon-only button to name the button, so that the button has an accessible name without an `aria-label` that hides the text from translation tools.
21. As an application developer, I want `nfsShowForSr` on the end of a control's visible text ("Back" plus " to Products"), so that the name starts with what sighted users see (2.5.3).
22. As an application developer, I want `nfsShowForSr` on a live region (`role="status"`, Abide's Form alert) that stays hidden from sight, so that announcements need no visible box.
23. As an application developer, I want a development warning when `nfsShowForSr` sits on a focusable element or holds one, so that no keyboard user lands on something they cannot see.
24. As an application developer, I want `nfsShowOnFocus` on a skip link, so that the link appears when a keyboard user reaches it and is hidden otherwise.
25. As an application developer, I want a development warning when `nfsShowOnFocus` sits on an element Tab never reaches, naming the link inside it when there is one, so that my skip link actually appears.
26. As an application developer on the Router, I want the skip link recipe to use a live current-path `href` and `nfsSmoothScroll`, so that it moves focus to the main content on every route instead of loading the home page.
27. As an application developer, I want the spec to tell me that hidden content must exist in another form (a navigation above `large`, a jump menu below it), so that I do not lose content on small screens or in one orientation.
28. As an application developer, I want the directives to leave `hidden`, `aria-hidden`, `role`, `id`, and `tabindex` to me, so that they compose with the platform and with other directives.
29. As an application developer, I want to import the three directives from one entry point, so that a `@defer` block can split them and every spec that uses `nfsShowForSr` shares one import.
30. As a keyboard user, I want the first Tab on a page to show a "Skip to content" link, and Enter on it to move focus into the main content, so that I bypass the navigation (2.4.1).
31. As a keyboard user, I want never to land on an invisible element, so that I always see where focus is (2.4.7).
32. As a screen reader user, I want visually hidden text to be part of the name or description of the control it belongs to, so that an icon button says what it does.
33. As a screen reader user, I want the skip link to be announced even before it is shown, so that I can use it from the virtual cursor.
34. As a screen reader user, I want content hidden for a breakpoint, an orientation, or a colour scheme to be hidden from me as well, so that I never hear two copies of the same content.
35. As a user at a 320 CSS px viewport or 400 percent zoom, I want everything the page offers at a wide viewport to be available in some form, so that the page reflows without losing content.
36. As a user who locks my device in one orientation, I want no content to be available only in the other one, so that the page works in the orientation I use (1.3.4).
37. As a user of a Windows contrast theme, I want the breakpoint and screen-reader classes to behave exactly as without it, so that nothing appears or disappears because of the theme (measured: forced colours change no computed display).
38. As a developer of a server-rendered application, I want the server HTML to carry every Visibility class, so that the first paint is right at every width and hydration changes nothing.
39. As a developer using `@defer (hydrate never)`, I want visibility to keep working there, so that static regions need no JavaScript.
40. As a developer of a zoneless application, I want the directives to need no zone, so that they work with zoneless change detection.
41. As a library maintainer, I want every behaviour asserted through classes, computed display, accessible names, focus, and geometry in stories, browser-level tests, a server-render smoke test, and e2e sweeps of viewport, orientation, colour scheme, and print, so that regressions surface at the layer that owns them.

## Implementation Decisions

### Foundation contract

Visibility Classes has no Plugin, no `defaults` object, no `data-*` Options, no events, and no methods. Its whole contract is Foundation's `foundation-visibility-classes` Export mixin (in `foundation-everything`), the `show-for()`, `show-for-only()`, `hide-for()`, and `hide-for-only()` mixins it calls, Foundation's `element-invisible()` and `element-invisible-off()`, and the docs page. Dropped options: none, because there are none.

| Feature | Classes | Rule (Foundation 6.9.0) | Notes |
| --- | --- | --- | --- |
| Show by screen size | `.show-for-<bp>` for every Class breakpoint but the Zero breakpoint; `.show-for-<bp>-only` for every Class breakpoint | `display: none !important` below the breakpoint (`show-for`), or outside it (`show-for-only`); `screen` media only | Sets no `display` where the element shows, so the element keeps its own. In print every `show-for` element shows (measured) |
| Hide by screen size | `.hide-for-<bp>` for every Class breakpoint but the Zero breakpoint; `.hide-for-<bp>-only` for every Class breakpoint | `display: none !important` from the breakpoint up, or within it; the query includes `print` for breakpoints up to `$print-breakpoint` | So in print a `hide-for-<bp>` element up to `large` hides (measured) |
| Generic | `.hide`, `.invisible`, `.visible` | `display: none !important`; `visibility: hidden`; `visibility: visible` | "There's no `.hide-for-small` class ... use the plain old `.hide` class". `.visible` shows a descendant of an `.invisible` element (measured) |
| Orientation | `.show-for-landscape`, `.hide-for-portrait` (one rule); `.hide-for-landscape`, `.show-for-portrait` (one rule) | `display: block !important` in the orientation that shows, `display: none !important` in the other | Forces `block` (D13); overrides a breakpoint class on the same element (measured) |
| Dark mode | `.show-for-dark-mode`, `.hide-for-dark-mode` | `.show-for-dark-mode { display: none }`, and `display: block !important` under `prefers-color-scheme: dark`; `.hide-for-dark-mode { display: block }`, and `display: none !important` under dark | Follows the user's system preference only; `.hide-for-dark-mode` forces `block` at all times, `.show-for-dark-mode` overrides a breakpoint class in dark mode, and `.hide-for-dark-mode` combines with one (measured) |
| Sticky | `.show-for-sticky`, `.hide-for-sticky` | `.show-for-sticky { display: none }`; `.is-stuck .show-for-sticky { display: block }`; `.is-stuck .hide-for-sticky { display: none }` | Descendant selectors on the Sticky element's `.is-stuck` State class (bound by `nfsSticky`); no `!important`, so they combine with a breakpoint class (measured) |
| Screen readers | `.show-for-sr`, `.show-on-focus` | `element-invisible()`: absolute, 1 by 1 px, clipped, `!important`; `.show-on-focus:active`, `.show-on-focus:focus` get `element-invisible-off()`: static, auto size, unclipped | "Need a `hide-for-sr` class? Add `aria-hidden='true'`" (Foundation's Sass comment) |
| IE10+ | `.show-for-ie`, `.hide-for-ie` | `-ms-high-contrast` media queries | Matches in no browser of the target (measured, D6) |

Docs conventions kept or corrected: the classes on any element (kept); `.hide` for "always" (kept, as `hideFor` alone, D3); the skip link on the link itself (kept) with a `tabindex="0"` `<main role="main">` target (corrected: `tabindex="-1"`, no redundant `role`, and a current-path `href` with `nfsSmoothScroll`, D15); `aria-hidden="true"` for "hide for screen readers" (kept as the native attribute, D16); the IE classes (dropped, D6); nothing said about alternatives, orientation, or focus (corrected: requirements in the WCAG table, D14).

### CSS class to directive mapping

`<zero>` is the Zero breakpoint (`small` by default), read from `nfsBreakpointsToken`. `<bp>` is any other Class breakpoint.

| Foundation class | Kind | Angular | Type, Sass setting, and Variant registry | Value shape | Class each value sets | Variant property |
| --- | --- | --- | --- | --- | --- | --- |
| `.show-for-<bp>`, `.show-for-<bp>-only`, `.show-for-<zero>-only` | Utility (Visibility class) | `showFor` Variant input of `NfsVisibility` | `NfsVisibilityShowFor`, whose breakpoint part is `NfsClassBreakpointQuery<'up' \| 'only'>` over `$breakpoint-classes` (`NfsBreakpointClassesOverrides`, Open Variant family) | a Breakpoint query | `'medium'` and `'medium up'` set `.show-for-medium`; `'medium only'` sets `.show-for-medium-only`; `'small only'` sets `.show-for-small-only`. Zero-breakpoint gap: `'small'` and `'small up'` set none (shown at every width). No value sets none | `--nfs-breakpoint-classes`, written by `nfs-breakpoint-properties` |
| `.show-for-landscape`, `.show-for-portrait`, `.show-for-dark-mode`, `.show-for-sticky` | Utility (Visibility class) | `showFor` | the condition part of `NfsVisibilityShowFor`: `'landscape' \| 'portrait' \| 'dark-mode' \| 'sticky'` (closed) | a name | `'landscape'` sets `.show-for-landscape`, and so on | none |
| `.hide`, `.hide-for-<bp>`, `.hide-for-<bp>-only`, `.hide-for-<zero>-only` | Utility (Visibility class) | `hideFor` Variant input of `NfsVisibility` | `NfsVisibilityHideFor`: `boolean`, the same Breakpoint query, and the same conditions; the transform maps `NfsVariantBoolean` through `nfsVariantBoolean` and passes the rest through | `true` (or the bare attribute) or a Breakpoint query | `true` sets `.hide`; `'large'` and `'large up'` set `.hide-for-large`; `'large only'` sets `.hide-for-large-only`; `'small only'` sets `.hide-for-small-only`. Zero-breakpoint gap: `'small'` and `'small up'` set `.hide`. `false` and no value set none | `--nfs-breakpoint-classes`, for the breakpoint values |
| `.hide-for-landscape`, `.hide-for-portrait`, `.hide-for-dark-mode`, `.hide-for-sticky` | Utility (Visibility class) | `hideFor` | the condition part of `NfsVisibilityHideFor` (closed) | a name | `'portrait'` sets `.hide-for-portrait`, and so on | none |
| `.invisible` | Utility (Visibility class) | `invisible` Variant input of `NfsVisibility` | `boolean` through `nfsVariantBoolean` (closed) | a boolean | `.invisible` | none |
| `.visible` | Utility (Visibility class) | `visible` Variant input of `NfsVisibility` | `boolean` through `nfsVariantBoolean` (closed) | a boolean | `.visible` | none |
| `.show-for-sr` | Utility (Visibility class) | `NfsShowForSr` (`[nfsShowForSr]`), static host class | - | - | `show-for-sr` | - |
| `.show-on-focus` | Utility (Visibility class) | `NfsShowOnFocus` (`[nfsShowOnFocus]`), static host class | - | - | `show-on-focus` | - |
| `.show-for-ie`, `.hide-for-ie` | Utility (Visibility class) | None: dropped (D6); a copy is reported | - | - | - | - |
| `.is-stuck` (read by the sticky classes) | State class of Sticky | `nfsSticky`'s host binding ([Spec: Sticky](../issues/28-spec-sticky.md)) | - | - | - | - |

State classes: none of this family's own. No class is left for the consumer to write (ADR 0039). The Visibility classes that Plugin directives bind for their own behaviour stay theirs and are not this entry point's (D7): the Responsive Toggle's `.hide-for-<hideFor>` on its bar and `.show-for-<hideFor>` on its menu ([Spec: Responsive Toggle](../issues/24-spec-responsive-toggle.md)), and the Nested menu's `invisible` on hidden Drilldown levels ([Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md)).

Binding rule: `NfsVisibility` binds one `computed` class list holding only the classes its inputs select, never a record of the family's classes set to `false` (D8). So a copied Visibility class is not stripped, and the directive, which never sets a class to `false`, meets another directive's binding only on a class both bind, which development check 4 reports.

### Hierarchy and DI shape

```
[nfsVisibility]   NfsVisibility   (standalone directive, no template)
[nfsShowForSr]    NfsShowForSr    (standalone directive, no template)
[nfsShowOnFocus]  NfsShowOnFocus  (standalone directive, no template)
```

- Three independent directives: no parent, no children, no Parent token, no providers, and no host directives. Nothing finds them through DI, and no library directive hosts them (D7).
- No Defaults token: the family has no Options, and a Defaults token never holds a Variant input's default (building-blocks 1.4).
- Injection, `NfsVisibility`: `nfsBreakpointsToken` (the Zero breakpoint, as `nfsBreakpointForWidth(map, 0)`, the same on server and client; never `NfsMediaQuery`); `ElementRef` for the development checks; in development builds only, `HostAttributeToken('class')` (optional) for the copied-class warning; the Runtime checks' `nfsVariantCheck('nfsVisibility')` handle. All from `ngx-foundation-sites/media-query`, except the Angular core tokens.
- Injection, `NfsShowForSr` and `NfsShowOnFocus`: `ElementRef`, and in development builds only CDK's `InteractivityChecker` for the focus checks. Nothing else.
- Entry point: `ngx-foundation-sites/visibility` (one per Foundation docs page), exporting the three directives and the aliases `NfsVisibilityShowFor`, `NfsVisibilityHideFor`, `NfsVisibilityQuery`, and `NfsVisibilityCondition`. `NfsClassBreakpointQuery`, `NfsBreakpointClassesOverrides`, `NfsVariantBoolean`, and `nfsVariantBoolean` live in the primary entry point; this entry point uses them as types and `nfsVariantBoolean` as the transform.

### API: `NfsVisibility`

Selector `[nfsVisibility]`; `exportAs: 'nfsVisibility'`; standalone; no template.

```ts
type NfsVisibilityQuery = NfsClassBreakpointQuery<'up' | 'only'>;
type NfsVisibilityCondition = 'landscape' | 'portrait' | 'dark-mode' | 'sticky';
type NfsVisibilityShowFor = NfsVisibilityQuery | NfsVisibilityCondition;
type NfsVisibilityHideFor = boolean | NfsVisibilityQuery | NfsVisibilityCondition;

class NfsVisibility {
  readonly showFor: InputSignal<NfsVisibilityShowFor | undefined>; // default undefined: no class
  readonly hideFor: InputSignalWithTransform<NfsVisibilityHideFor, NfsVariantBoolean | NfsVisibilityQuery | NfsVisibilityCondition>; // default false
  readonly invisible: InputSignalWithTransform<boolean, NfsVariantBoolean>; // default false
  readonly visible: InputSignalWithTransform<boolean, NfsVariantBoolean>; // default false
}
```

| Input | Type | Default | Foundation equivalent | Delta |
| --- | --- | --- | --- | --- |
| `showFor` | `NfsVisibilityShowFor`, declared with explicit type arguments naming the alias; no transform | `undefined`: no class | `.show-for-<bp>`, `.show-for-<bp>-only`, `.show-for-landscape`, `.show-for-portrait`, `.show-for-dark-mode`, `.show-for-sticky`; `$breakpoint-classes` | New. One input for the whole show family; the Zero breakpoint's `up` form sets no class; no `down` (D2) |
| `hideFor` | `NfsVisibilityHideFor`; the transform maps `NfsVariantBoolean` values through `nfsVariantBoolean` and passes a query or condition through, as `NfsButton`'s `expanded` does | `false`: no class | `.hide`, `.hide-for-<bp>`, `.hide-for-<bp>-only`, `.hide-for-landscape`, `.hide-for-portrait`, `.hide-for-dark-mode`, `.hide-for-sticky`; `$breakpoint-classes` | New. `true` and the Zero breakpoint's `up` form set `.hide` (D3) |
| `invisible` | `boolean` through `nfsVariantBoolean` | `false` | `.invisible` | New |
| `visible` | `boolean` through `nfsVariantBoolean` | `false` | `.visible` | New; for a descendant of an `invisible` element |

- Models, outputs, and methods: none. The directive has no state; the browser's media queries decide.
- Each input's JSDoc names Foundation's class template and `$breakpoint-classes` (AGENTS.md Design Philosophy 5).

Host bindings, all on signal state:

| Binding | Value |
| --- | --- |
| `[class]` | one `computed` list of the classes the four inputs select (the mapping table); the consumer's own static and bound classes stay, because Angular combines static classes and class bindings |

- The mapping is one pure function over `(input, value, zeroBreakpoint)` returning the class and the Runtime check's needs, so the check and the class always agree. A value that is not a Class breakpoint name with an optional `up` or `only`, and not a condition, binds nothing; under the closed types only a cast or `$any()` reaches that guard, and the Variant check reports it.
- Attribute ownership: the directive owns the classes it lists. It never touches `hidden`, `aria-hidden`, `inert`, `role`, `id`, `tabindex`, or `style`.
- Development-mode checks, in the directive's one `afterRenderEffect` read phase, which it creates only when `ngDevMode` is on or the Variant check handle is not `null` (never on the server, and in a production build only under the Runtime checks' opt-in). The warnings run only while `ngDevMode` is on, each once per instance, at the first render:
  1. Copied classes (D8): a static class list holding a Visibility class warns, naming each class with the input to bind, for example "class="show-for-medium" is set by nfsVisibility: bind showFor="medium" instead". `show-for-sr` and `show-on-focus` name `nfsShowForSr` and `nfsShowOnFocus`; `show-for-ie` and `hide-for-ie` say "Internet Explorer detection matches no supported browser (-ms-high-contrast); remove the class". A copied class is not stripped, so it keeps styling until removed; one equal to a class the inputs select merges with it and is not reported; the consumer's own classes are not reported.
  2. A combination Foundation's CSS cannot give (D4): `showFor` or `hideFor` holds `'landscape'` or `'portrait'`, or `showFor` holds `'dark-mode'`, while the other input holds any value: "nfsVisibility: Foundation's show-for-landscape sets display: block !important where it shows the element, which overrides <the other class>; put one condition on a wrapper element". Measured in four engines: the pairs with a breakpoint class and `.hide` all fail this way, `hideFor="dark-mode"` and the sticky conditions combine correctly, so neither warns.
  3. A sticky condition out of place (D4): `showFor` or `hideFor` is `'sticky'` and no ancestor of the host carries `.sticky` (the class `nfsSticky` binds), or the host carries it itself: "nfsVisibility: showFor="sticky" reacts to an enclosing nfsSticky element's stuck state; put it on an element inside nfsSticky". A placement check reads the DOM alone (building-blocks 1.9).
  4. A second owner (D7): a class this directive lists is missing from the host's class list, or the host carries a Visibility class that neither this directive nor the static `class` attribute put there: "nfsVisibility: another directive on this element binds Visibility classes (<class>); put nfsVisibility on a wrapper element". The Responsive Toggle's class records, whose `false` entries win over a `true` in a lower-priority binding (Angular consults a binding's value unless it is `undefined`), are the case it catches.
  5. `invisible` and `visible` both true: "nfsVisibility: .visible overrides .invisible on the same element; set one".
- Runtime check (D11): in the same read phase, only while `showFor` or `hideFor` holds a Breakpoint query, `NfsVisibility` calls `include('nfs-breakpoint-properties', ['breakpoint-classes'])`, then `value('showFor', value, needs)` and `value('hideFor', value, needs)` for each bound value: `[{setting: 'breakpoint-classes', name: <bp>}]` for a class of a breakpoint, `[]` for a condition, `.hide`, or the Zero breakpoint's `showFor` (whose meaning needs no class), and `null` for a value that maps to no class. `strictVariantNames` reports a breakpoint `--nfs-breakpoint-classes` does not list; `strictVariantProperties` reports a missing `@include nfs-breakpoint-properties;`. `invisible` and `visible` are closed and need no call. The directive writes no Variant property; `nfs-breakpoint-properties` is the one writer of `--nfs-breakpoint-classes` ([Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md)).

### API: `NfsShowForSr`

Selector `[nfsShowForSr]`; standalone; no template; no inputs, outputs, or `exportAs`.

| Binding | Value |
| --- | --- |
| static `class` | `show-for-sr` |

- It binds nothing else: the host keeps its text in the accessibility tree (no `aria-hidden`, no `hidden`), and `hidden` bound by another directive (Abide's Form alert) still hides it, because `element-invisible()` sets no `display`.
- Development check (D9), once, in an `afterNextRender` created only when `ngDevMode` is on: the host, or an element inside it, is tabbable by CDK's `InteractivityChecker` (`isFocusable`, then `isTabbable`): "nfsShowForSr: <tag> is visually hidden but takes focus, so keyboard users land on a 1 by 1 px box they cannot see (WCAG 2.4.7). Keep the control visible and put the hidden text inside it; for a skip link, use nfsShowOnFocus". A host inside a focusable control (the text of a button) is silent: only the host and its descendants are checked.

### API: `NfsShowOnFocus`

Selector `[nfsShowOnFocus]`; standalone; no template; no inputs, outputs, or `exportAs`.

| Binding | Value |
| --- | --- |
| static `class` | `show-on-focus` |

- Development check (D9), once, in an `afterNextRender` created only when `ngDevMode` is on: the host is not tabbable by `NfsShowForSr`'s test. With a tabbable descendant: "nfsShowOnFocus: .show-on-focus shows only the element that has focus, so this <tag> stays hidden while its <a> has focus; put nfsShowOnFocus on the <a> itself". Without one: "nfsShowOnFocus: Tab never reaches this <tag>, so it never shows; use a link with an href or a button".
- It moves no focus and handles no click; a skip link composes `nfsSmoothScroll` beside it for the scroll and the focus move (D15).

### Comparison with Angular Material (22.2)

Material has no visibility directives. The CDK ships the pieces nearest to this family.

| Concern | Angular Material and CDK | This entry point |
| --- | --- | --- |
| Visually hidden text | `.cdk-visually-hidden`, a class printed by the CDK's `a11y-visually-hidden` mixin that Material's own templates write (option, datepicker, stepper header); no directive | `nfsShowForSr`, binding Foundation's `.show-for-sr` (`element-invisible()`) |
| Announcements | `LiveAnnouncer` writes into a visually hidden live element of its own | The consumer's own visually hidden live region with `nfsShowForSr`, already in the server HTML; no announcer |
| Show or hide by viewport | `BreakpointObserver` and `MediaMatcher` in code, with the consumer's `@if` | Foundation's media-query classes through typed inputs; no JavaScript decides (D12) |
| Skip link | None | `nfsShowOnFocus` on the link, beside `nfsSmoothScroll` |

Borrowed: the CDK's practice that a component's visually hidden text is a class, not a component. Not borrowed: `BreakpointObserver` for visibility, because a server render knows no viewport, so a JavaScript decision would render the Server breakpoint's answer and change it at hydration; `LiveAnnouncer`, which would copy text the page already holds; the CDK's own visually hidden rule, since Foundation's `element-invisible()` is the one the consumer's Sass already compiles.

### Implementation level and primitives

Implementation level: native platform. Visibility is Foundation's CSS media queries (`min-width`, `max-width`, `orientation`, `prefers-color-scheme`, `print`) and `visibility`; the visually hidden technique is `position: absolute` with `clip`; the skip link is a native link whose activation the browser handles before hydration and `nfsSmoothScroll` after. `@angular/aria` has no visibility, visually hidden, or skip-link pattern, and `@angular/cdk` supplies only `InteractivityChecker`, in development builds, for the two focus checks. The Angular layer is host bindings over `input()` signals, one `computed` class list, development-only render callbacks, and the Runtime check requests. No `effect`, no listener, no timer, no observer, no Breakpoint service.

Fallback: none needed. The risks, Foundation's combinations, the sticky placement, the focus behaviour of the two screen-reader classes, and the IE queries, were measured by this spec's ticket in three engines and Edge.

### ARIA and keyboard

APG pattern: none. The skip link is WCAG technique G1 for 2.4.1; visually hidden text is technique C7.

| Element or state | Rendered semantics | Source |
| --- | --- | --- |
| `nfsVisibility` hidden by a breakpoint, orientation, colour scheme, sticky state, or `hideFor` | `display: none`: out of the accessibility tree and the tab order, for everyone (measured in Chromium's tree: a `.hide` paragraph and a `.show-for-medium` paragraph at 400 px are absent) | CSS; HTML-AAM |
| `invisible` | `visibility: hidden`: out of the accessibility tree and the tab order, its space kept (measured: absent from Chromium's tree) | CSS |
| `visible` inside an `invisible` element | Shown and exposed (measured) | CSS |
| `nfsShowForSr` | In the accessibility tree; its text joins the name of the control that holds it or the content around it (measured: a button named "Close" by its hidden span, a `status` region reading "3 results") | Foundation's `element-invisible()` |
| `nfsShowOnFocus`, not focused | In the accessibility tree and the tab order while visually hidden (measured: the link "Skip to Content" is in Chromium's tree before focus) | Foundation's `element-invisible()` |
| `nfsShowOnFocus`, focused or pressed | Shown in the flow at its place, 109 by 17 px for Foundation's example text at 16 px (measured in three engines) | `element-invisible-off()` |
| Hiding from assistive technology only | The consumer's `aria-hidden="true"` on a purely visual element, never on a focusable one (axe `aria-hidden-focus`) | Foundation's docs; building-blocks 1.10 |

| Key | Result | Owner |
| --- | --- | --- |
| Tab from the start of the page | Focuses the skip link, which shows | Native |
| Enter on the skip link | After hydration, `nfsSmoothScroll` scrolls to the main content and focuses it; before hydration and without JavaScript the browser follows the in-page link and focuses the `tabindex="-1"` target (measured in three engines and Edge; without a `tabindex` focus stays on the body, and the next Tab still continues inside the target in Chromium and Firefox) | Native, [Spec: Smooth Scroll](../issues/29-spec-smooth-scroll.md) |
| Tab on a visually hidden control | Never happens: `nfsShowForSr` warns on a tabbable host | Development check |

Focus: the directives move no focus. When a resize hides an element that has focus, the browser moves focus to the document body; the library does not follow it (Out of Scope). WebKit's Tab skips links unless the user turns on keyboard navigation (measured: Tab went past the skip link to the `tabindex="0"` target), which is Safari's platform behaviour; Option+Tab reaches the link there.

### WCAG 2.2 AA

The target is WCAG 2.2 level AA (user rule; ADR 0022). Each criterion below is a requirement with the layer that tests it; none is advice. Geometry and computed styles were measured in Chromium 153, Firefox 155, and WebKit 26.6 through Playwright 1.63, and in Edge 153, with axe-core 4.13.0 and the six WCAG 2.2 AA tags.

| Criterion | Requirement and how it is met | Foundation default | Test |
| --- | --- | --- | --- |
| 1.4.10 Reflow | Content hidden below a breakpoint exists in another form at that width: a navigation shown from `large` up has a jump menu or an Off-canvas panel below it, and each of a pair is the other's alternative. The directive cannot know content, so the docs require it and every story shows pairs. Zoom is covered by the same rule, since 400 percent zoom of a 1280 px window is a 320 CSS px viewport | The docs show single hidden paragraphs and say nothing about alternatives | e2e in three engines at 320 and 1100 px: in `visibility--alternatives` exactly one of each pair is displayed and it carries the same links; play function: exactly one displayed at the test viewport |
| 1.3.4 Orientation | `showFor` and `hideFor` with `'landscape'` or `'portrait'` only on an alternative presentation of content the other orientation also carries (a hint, a second layout), never on content available in one orientation only | The docs example is a hint pair; nothing is said | e2e in three engines in both orientations: exactly one of each `visibility--conditions` pair is displayed; play function the same at the test viewport |
| 2.4.1 Bypass Blocks | The skip link is the first focusable element of the page, `nfsShowOnFocus` on the link itself, with `nfsSmoothScroll` beside it and an `href` built from the live current path; the target is the `main` element with `tabindex="-1"` (D15) | Foundation's example puts the class on the link; its `href="#mainContent"` leaves the page under `<base href>` on any route but the base URL | Play function of `visibility--skip-link`; e2e in three engines; the fixture app's route under a deep path |
| 2.4.3 Focus Order | Activating the skip link moves focus into the main content, so the next Tab continues there; `tabindex="-1"` makes the target focusable without adding a tab stop | Foundation's `tabindex="0"` on `main` adds a tab stop that holds no control (measured: the second Tab lands on `main`) | `visibility--skip-link`: after Enter the next Tab reaches the first link inside `main`; e2e |
| 2.4.7 Focus Visible | No visually hidden element takes focus: `nfsShowForSr` warns in development when its host or a descendant is tabbable; `nfsShowOnFocus` sits on the focused element itself and warns otherwise (D9). The revealed skip link keeps the browser's focus ring | A focused `.show-for-sr` input is a 1 by 1 px box, and `.show-on-focus` on a wrapper paints 0 pixels while its link has focus, in three engines; axe reports neither | Browser-level tests of both checks; `visibility--skip-link` asserts the focused link's box is larger than 1 by 1 px and its computed `outline-style` is not `none` |
| 2.4.11 Focus Not Obscured (Minimum) | The revealed skip link is in the flow at the start of the page, above any sticky header, so nothing covers it | Passes | e2e: the focused link's rectangle does not intersect a sticky Top Bar's in `visibility--skip-link` |
| 2.5.3 Label in Name | Visually hidden text that adds to a control's name follows the visible text ("Back" plus " to Products"), or names a control whose visible content is a glyph; it never precedes or replaces visible words | The docs examples have no visible text in their controls | Play function of `visibility--screen-reader-text` finds each control by a name that starts with its visible text |
| 3.3.2 Labels or Instructions | A form field's label is visible; visually hidden text never replaces it ([Spec: Switch](../issues/84-spec-switch.md), [Spec: Forms](../issues/98-spec-forms.md)) | Foundation's Switch names its input only with `.show-for-sr` text | Those specs' checks |
| 4.1.2 Name, Role, Value | Visually hidden text names an icon-only control; the directives change no role or state | Passes | axe `button-name` and `link-name` in every story; play functions find controls by `getByRole` and name |
| 4.1.3 Status Messages | A visually hidden status or alert region exists before its text changes and holds the whole message | Nothing is said | Play function of `visibility--screen-reader-text`: after the click the hidden status reads "Saved" and focus stays on the button |
| 2.5.8 Target Size (Minimum) | The revealed skip link passes through its spacing: axe's `target-size` passes it while focused, 17 px tall, beside a menu of links (measured); a consumer who styles it larger needs nothing more | Passes | axe in `visibility--skip-link` after the focus step |

The axe gate in every story runs the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, plus `best-practice`) with `parameters.a11y.test = 'error'` (ADR 0018). axe passed Foundation's docs markup verbatim and both focus failures above, so the checks those failures need are the development checks and the play functions, not the gate.

### Rendered HTML

Consumer markup, then the server HTML. The hydrated DOM equals the server HTML: the directives declare no listener; the `jsaction` on the skip link comes from `nfsSmoothScroll`'s click listener. Class order is not significant; Angular also renders the directive attributes and the static attributes that feed inputs (`nfsvisibility=""`, `showfor="medium"`), which the resulting DOM below leaves out, as the other specs do.

```html
<!-- Show by screen size -->
<p nfsVisibility showFor="medium">You are on a medium screen or larger.</p>
<p nfsVisibility showFor="small only">You are <em>definitely</em> on a small screen.</p>

<p class="show-for-medium">You are on a medium screen or larger.</p>
<p class="show-for-small-only">You are <em>definitely</em> on a small screen.</p>

<!-- Hide by screen size, and always -->
<p nfsVisibility hideFor="large">You are <em>not</em> on a large screen or larger.</p>
<p nfsVisibility hideFor="medium only">You are <em>definitely not</em> on a medium screen.</p>
<p nfsVisibility hideFor>Can't touch this.</p>
<p nfsVisibility hideFor="small">Can't touch this either.</p>
<p nfsVisibility invisible>Can sort of touch this.</p>

<p class="hide-for-large">You are <em>not</em> on a large screen or larger.</p>
<p class="hide-for-medium-only">You are <em>definitely not</em> on a medium screen.</p>
<p class="hide">Can't touch this.</p>
<p class="hide">Can't touch this either.</p>
<p class="invisible">Can sort of touch this.</p>

<!-- A range no single class names -->
<aside nfsVisibility showFor="medium" hideFor="large only">From medium up, except at large.</aside>

<aside class="show-for-medium hide-for-large-only">From medium up, except at large.</aside>

<!-- A condition, on a block element (D13) -->
<div nfsVisibility showFor="portrait">Rotate your device to see every column.</div>

<div class="show-for-portrait">Rotate your device to see every column.</div>

<!-- Inside a Sticky element -->
<div nfsStickyContainer>
  <div nfsSticky>
    <p nfsVisibility hideFor="sticky">We be scrolling...</p>
    <p nfsVisibility showFor="sticky">I'm going to rest here for a sec. You keep scrolling.</p>
  </div>
</div>

<div class="sticky-container">
  <div class="sticky is-anchored is-at-top" ...>
    <p class="hide-for-sticky">We be scrolling...</p>
    <p class="show-for-sticky">I'm going to rest here for a sec. You keep scrolling.</p>
  </div>
</div>

<!-- Visually hidden text -->
<button nfsCloseButton><span aria-hidden="true">&times;</span><span nfsShowForSr>Close</span></button>
<div nfsShowForSr role="status">{{ saveMessage() }}</div>

<button class="close-button" type="button"><span aria-hidden="true">&times;</span><span class="show-for-sr">Close</span></button>
<div class="show-for-sr" role="status">Saved</div>

<!-- The skip link, first in the application shell; path() is the live current path (Usage examples) -->
<a nfsShowOnFocus nfsSmoothScroll [href]="path() + '#main-content'">Skip to content</a>
<main id="main-content" tabindex="-1">...</main>

<a class="show-on-focus" href="/orders/42#main-content" jsaction="click:;">Skip to content</a>
<main id="main-content" tabindex="-1">...</main>
```

`close-button` and `type="button"` are the [Spec: Close Button](../issues/83-spec-close-button.md)'s bindings, and the Sticky element's classes and attributes the [Spec: Sticky](../issues/28-spec-sticky.md)'s; they are shown only to place them. Server and hydrated DOM are identical for every example: the classes are static host classes and host bindings on signal state, and the Zero breakpoint comes from a token that is the same on both platforms.

### Animation

None. Foundation's visibility partial declares no transition, and the library adds none: every class switches `display` or `visibility`, which Foundation does not animate. An element that must animate as it appears or disappears is a Toggler in visibility mode, whose typed Motion input animates it (building-blocks 1.6). No Motion classes and no `prefers-reduced-motion` override.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the server HTML carries every Visibility class exactly as the hydrated DOM does, and Foundation's media queries apply them at the viewport the page is shown at, so the first paint is right at every width, orientation, and colour scheme, with no Server breakpoint involved (building-blocks 1.7, CSS first; 1.11 decision 8).
- Before hydration: the directives touch no DOM outside host bindings, measure nothing, and start no timer. The development checks and the Runtime check requests run in render callbacks, which do nothing on the server.
- Full and incremental hydration: host binding values equal the server's, so hydration changes nothing and there is no structure to mismatch. The directives have no Hydration boundary of their own.
- Event replay: none of the three directives declares a listener or adds `jsaction`. A skip link's pre-hydration Enter or click is a native in-page jump, which the browser completes at once; after hydration `nfsSmoothScroll` handles it ([Spec: Smooth Scroll](../issues/29-spec-smooth-scroll.md)).
- `@defer`: library templates contain no `@defer`. Inside a dehydrated block, and inside `@defer (hydrate never)` for good, visibility keeps working, because it is CSS; a visually hidden live region there never updates, so live regions do not go in `hydrate never`.
- Prerendering: identical to server-side rendering; the directives read no request token.
- Print: Foundation's `show-for` queries are `screen` only and its `hide-for` queries include `print` up to `$print-breakpoint` (`large`), so a printout shows every `showFor` element and hides every `hideFor` breakpoint element up to `large` (measured); a pair written `hideFor="large"` and `showFor="large"` prints its large form.

## Testing Decisions

A good test asserts what a user or assistive technology observes: the classes, the computed `display` and `visibility` at a known viewport, orientation, colour scheme, and medium, the accessibility tree membership and names, where focus lands, and the geometry of a focused element. No test reads the directives' fields. The patterns are the four layers of building-blocks 1.12, the [Spec: Label](../issues/94-spec-label.md)'s class-list and copied-class tests, the [Spec: Responsive Toggle](../issues/24-spec-responsive-toggle.md)'s viewport e2e, and the [Spec: Smooth Scroll](../issues/29-spec-smooth-scroll.md)'s skip-link and focus tests, the nearest precedents.

Story ids follow `visibility--<story>`: `visibility--breakpoints`, `visibility--alternatives`, `visibility--hide-and-invisible`, `visibility--conditions`, `visibility--sticky`, `visibility--screen-reader-text`, `visibility--skip-link`. `meta.component` is `NfsVisibility`; `showFor`, `hideFor`, `invisible`, and `visible` are args of `visibility--breakpoints`. Stories use Foundation's default Class breakpoints only, so the library's Storybook program needs no Variant declaration file (ADR 0040). No story element carries a Foundation class written in the story. Layer 1 runs at the 414 px default viewport ([storybook-conventions.md](../storybook-conventions.md), section 4), so play functions assert classes and assertions that hold at any viewport; the viewport, orientation, colour-scheme, and print sweeps are layer 4.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Run by `npx nx test-storybook <lib>`. Every story runs axe with `parameters.a11y.test = 'error'` and the six tags (which include `button-name`, `link-name`, `aria-hidden-focus`, and `target-size`).

- `visibility--breakpoints`: Foundation's show and hide examples, each paragraph's text naming its range, plus the `showFor="medium" hideFor="large only"` range. Each element carries exactly the class of the mapping table for its value, and changing the `showFor` arg from `'medium'` to `'large only'` swaps `.show-for-medium` for `.show-for-large-only`; the `hideFor` bare-attribute and `'small'` paragraphs carry `.hide` and are not displayed.
- `visibility--alternatives`: a navigation (`nav` with `ul[nfsMenu]`) with `showFor="large"` and a jump-menu `select` inside a labelled form with `hideFor="large"`, both listing the same destinations; exactly one of the two is displayed at the test viewport, and it holds every destination (1.4.10).
- `visibility--hide-and-invisible`: a `hideFor` paragraph (computed `display: none`, absent from the accessibility tree), an `invisible` list keeping its height, and inside it a `visible` item, which is displayed with computed `visibility: visible` and found by `getByText`.
- `visibility--conditions`: a landscape and portrait pair of hints and a light and dark pair, each on a `div`; exactly one of each pair is displayed at the test viewport and colour scheme.
- `visibility--sticky`: Foundation's sticky example inside `nfsStickyContainer` and `nfsSticky`; before any scroll the `hideFor="sticky"` title is displayed and the `showFor="sticky"` one is not.
- `visibility--screen-reader-text`: an icon-only close button named "Close" by `nfsShowForSr` text, a back button named "Back to Products" whose visible text is "Back", and a `role="status"` region with `nfsShowForSr`; each control is found by `getByRole` and its name; each hidden span's box is 1 by 1 px with computed `position: absolute`; after the story's Save button is clicked, the status region's text is "Saved" and focus stays on the button.
- `visibility--skip-link`: an application shell whose first element is the skip link (`nfsShowOnFocus nfsSmoothScroll`, `href="#visibility-main"`, in-page in the story iframe, which has no `<base href>`, as the Smooth Scroll stories do), a Top Bar navigation, and `main` with `tabindex="-1"`. Before focus the link's box is 1 by 1 px and it is found by `getByRole('link', {name: 'Skip to content'})`; after `userEvent.tab()` it has focus, its box is larger than 1 by 1 px, and its computed `outline-style` is not `none`; after Enter, `main` has focus; the next Tab reaches the first link inside `main`; axe runs after the focus step.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

TestBed specs next to the directives over a bare test host component, zoneless with `await fixture.whenStable()`; no story is mounted and no axe runs here.

- Class mapping, driven by data: every `showFor` and `hideFor` value of the mapping table, including the Zero-breakpoint gaps, sets exactly its class, with the default Breakpoint map and with a provided `nfsBreakpointsToken` whose Zero breakpoint has another name (values the library's closed types reject are bound through a typed cast); `hideFor` as the bare attribute, `true`, and `'true'` set `.hide`, and `false`, `'false'`, and no value set none; `invisible` and `visible` set their classes; a cast value that is not a breakpoint query or condition, and one containing a space, set none; changing a value swaps its class and leaves the consumer's own static class and `[class]` binding alone; the directive adds no attribute.
- `nfsShowForSr` and `nfsShowOnFocus` bind their static classes, and a redundant copy merges without a report.
- Development checks of `NfsVisibility`: a static `class="show-for-medium hide-for-ie show-for-sr"` warns once, naming `showFor`, the IE removal, and `nfsShowForSr`; `showFor="landscape"` with `hideFor="medium"`, `hideFor="portrait"` with `showFor="large"`, and `showFor="dark-mode"` with `hideFor` written alone each warn once, while `hideFor="dark-mode"` with `showFor="medium"` and `showFor="sticky"` with `hideFor="medium"` are silent; `showFor="sticky"` outside an element carrying `.sticky`, and on that element itself, warn once, and inside it is silent; a sibling test directive whose `[class]` binding sets `hide-for-large` to `false` and takes priority (the test first asserts the class is absent) warns once beside `hideFor="large"`, and one binding `hide-for-medium` beside `showFor="large"` warns once; `invisible` with `visible` warns once.
- Development check of `NfsShowForSr`: on a `button`, on a `span` holding a link, and on a `.show-for-sr` file input, it warns once; on a `span` inside a button, on a `div role="status"`, and on a `span` holding a `tabindex="-1"` element, it is silent.
- Development check of `NfsShowOnFocus`: on a `p` holding a link it warns naming the link; on a `span` with no focusable content it warns that Tab never reaches it; on a link with an `href` and on a `button` it is silent.
- Nothing is checked or warned when `ngDevMode` is false.
- Runtime check: with `--nfs-breakpoint-classes: small medium large` on the test document, `showFor="medium"` is silent and `showFor="xlarge"` through a cast reports `strictVariantNames` once, naming `nfsVisibility`, `showFor`, the value, and `$breakpoint-classes`; in a test file of its own, with the property absent, `hideFor="large"` reports `strictVariantProperties` once, naming `@include nfs-breakpoint-properties;`; a directive with only `hideFor` written alone, a condition, or `invisible` set makes no `include()` request.
- Zoneless: the suite runs with zoneless change detection; no test needs `NgZone`.

### 3. Node-level Vitest

- SSR smoke through the shared `renderServer()` helper, under `npx nx test <lib>`: a fixture with one element per mapping-table row, the sticky example, the visually hidden button text and status region, and the skip link with `nfsSmoothScroll`. `whenStable()` resolves; the server HTML carries every class of the mapping table, `show-for-sr`, and `show-on-focus`; no element carries `jsaction` except the skip link, from `nfsSmoothScroll`; no development warning or Runtime check report is made on the server.
- Pure logic: the class mapping function, table-driven over every input and value, including the Zero-breakpoint gaps under a renamed Zero breakpoint and the needs it returns for the Runtime check.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build, in Chromium, Firefox, and WebKit:

- Breakpoint, orientation, colour scheme, and print sweep of `visibility--breakpoints` and `visibility--conditions`, asserting each element's computed `display` against the expectations below, which are the measured results of Foundation 6.9.0's default settings:

  | State | Displayed | Not displayed |
  | --- | --- | --- |
  | 320 by 640 (small, portrait) | `showFor="small only"`, `hideFor="medium"`, `hideFor="medium only"`, `hideFor="large"`, `hideFor="large only"`, `showFor="portrait"` | `showFor="medium"`, `showFor="medium only"`, `showFor="large only"`, `hideFor="small only"`, `hideFor`, `showFor="landscape"` |
  | 900 by 600 (medium, landscape) | `showFor="medium"`, `showFor="medium only"`, `hideFor="small only"`, `hideFor="large"`, `hideFor="large only"`, `showFor="landscape"` | `showFor="small only"`, `showFor="large only"`, `hideFor="medium"`, `hideFor="medium only"`, `hideFor`, `showFor="portrait"` |
  | 1100 by 800 (large, landscape) | `showFor="medium"`, `showFor="large only"`, `hideFor="small only"`, `hideFor="medium only"`, `showFor="landscape"` | `showFor="small only"`, `showFor="medium only"`, `hideFor="medium"`, `hideFor="large"`, `hideFor="large only"`, `hideFor`, `showFor="portrait"` |
  | 1300 by 800 (xlarge, landscape) | `showFor="medium"`, `hideFor="small only"`, `hideFor="medium only"`, `hideFor="large only"`, `showFor="landscape"` | `showFor="small only"`, `showFor="medium only"`, `showFor="large only"`, `hideFor="medium"`, `hideFor="large"`, `hideFor`, `showFor="portrait"` |
  | dark colour scheme (`emulateMedia`) | `showFor="dark-mode"` | `hideFor="dark-mode"` |
  | print at 1100 (`emulateMedia`) | every `showFor` breakpoint element | `hideFor="small only"`, `hideFor="medium"`, `hideFor="medium only"`, `hideFor="large"`, `hideFor="large only"` |
  | forced colours at 1100 (`emulateMedia`) | the same as 1100 by 800 | the same as 1100 by 800 |

- Reflow (1.4.10) and orientation (1.3.4): at 320 by 640 and 1100 by 800, and at 600 by 320 and 320 by 600, exactly one of each pair in `visibility--alternatives` and `visibility--conditions` is displayed.
- Sticky: scrolling `visibility--sticky` until the Sticky element carries `.is-stuck` displays the `showFor="sticky"` title and hides the `hideFor="sticky"` one; scrolling back restores both.
- Skip link: in Chromium and Firefox a real Tab from the page start focuses the link and shows it; in WebKit the link is focused with `focus()`, because WebKit's Tab skips links by default (measured); in all three the focused box is larger than 1 by 1 px, does not intersect the sticky Top Bar, and Enter moves focus to `main`.

Against the prerendered fixture app, on the Visibility route and on a deep route of the same page (`/visibility/nested`):

- JavaScript disabled, at 320 and 1100 px: screenshot plus axe (`@axe-core/playwright` with the six tags) on the server HTML; the displayed elements match the table above before any script runs.
- Hydration: no NG05xx in the console and `ngDevMode.componentsSkippedHydration === 0`.
- The skip link on the deep route: its `href` is the deep route's path with `#main-content`, and Enter after hydration keeps the URL and focuses `main`.

Manual release test (ADR 0022): with NVDA on Firefox and Chrome, JAWS on Chrome, and VoiceOver on Safari, `visibility--skip-link` announces the skip link from the virtual cursor before it is shown, and activating it moves the reading position into the main content; `visibility--screen-reader-text` announces "Close", "Back to Products", and "Saved".

## Out of Scope

- `.show-for-ie` and `.hide-for-ie`: they detect Internet Explorer 10 and 11 through the non-standard `-ms-high-contrast` media feature, which no browser of the Browser target matches (measured in Chromium 153, Firefox 155, WebKit 26.6, and Edge 153, with and without forced colours), so `.show-for-ie` always hides and `.hide-for-ie` does nothing; a copy is reported (D6). Category: `platform-or-a11y`.
- A `hide-for-sr` directive or input: Foundation has no such class and advises `aria-hidden="true"`, the native attribute, which the consumer writes on purely visual elements (D16). Category: `platform-or-a11y`.
- Showing or hiding from JavaScript (an `@if` over the Breakpoint service, a structural directive, a `hidden` binding per breakpoint): a server render knows no viewport, so it would render the Server breakpoint's answer and change it at hydration; Foundation's media queries are right from the first byte (D12; building-blocks 1.7 and 1.11 decision 8). Category: `platform-or-a11y`.
- Moving focus when a resize hides the focused element: which element is its equivalent is the consumer's knowledge; the Responsive Toggle and Responsive Accordion Tabs keep focus for their own swaps. Category: `other`.
- Visibility classes for breakpoints outside `$breakpoint-classes`: Foundation's own setting generates them; the consumer adds the breakpoint there and to its Variant declaration file, and the types follow (the Responsive Toggle's `nfs-responsive-toggle(<bp>)` stays that spec's, for its open `hideFor` Option). Category: `other`.
- A library rule that stops the orientation and dark-mode classes from forcing `display: block`: a block wrapper avoids it with no library CSS, while the rule would override Foundation's `!important` declarations with the library's own copy of them (D13). Category: `other`.
- A site theme switch for the dark-mode classes: Foundation's classes follow the user's system `prefers-color-scheme` only; a theme toggle of the application's own is the application's CSS. Category: `scope-boundary`.
- The Visibility classes Plugin directives bind for their own behaviour: the Responsive Toggle's `.hide-for-<bp>` and `.show-for-<bp>` ([Spec: Responsive Toggle](../issues/24-spec-responsive-toggle.md)) and the Nested menu's `invisible` on Drilldown levels ([Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md)). Category: `scope-boundary`.
- `.is-hidden` (Foundation's global styles), which the library binds with `hidden` where a Foundation rule sets `display` (building-blocks 1.10). Category: `scope-boundary`.
- `.is-stuck` and the Sticky element's other State classes: the [Spec: Sticky](../issues/28-spec-sticky.md). Category: `scope-boundary`.
- The skip link's scrolling and focus move, and the base-href rule for its `href`: the [Spec: Smooth Scroll](../issues/29-spec-smooth-scroll.md) and [ADR 0038](../adr/0038-smooth-scroll-same-document-links.md). Category: `scope-boundary`.
- Images that differ by colour scheme or viewport: `<picture>` with `media` sources, which download one image, the [Spec: Interchange](../issues/35-spec-interchange.md)'s rule for images. Category: `platform-or-a11y`.
- The Variant registries, the helper types, the manifest rows, and the declaration-file generator: [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md); the Runtime checks' configuration and `nfs-breakpoint-properties`: [Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md). Category: `scope-boundary`.
- Runtime theming through custom properties (building-blocks 1.13). Category: `scope-boundary`.

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | Three attribute directives in `ngx-foundation-sites/visibility`: `[nfsVisibility]` (`NfsVisibility`, `exportAs: 'nfsVisibility'`) for the conditional and generic hiding classes, and `[nfsShowForSr]` (`NfsShowForSr`) and `[nfsShowOnFocus]` (`NfsShowOnFocus`), each binding one class | ADR 0039 gives utility families directives; building-blocks 1.3 lets a utility family's spec name them: the family's shared directive takes the docs page's name, a single-class directive its class's name (1.3's class rule); the screen-reader classes keep a different contract (visible to assistive technology) with checks of their own, and a dozen published specs already write `nfsShowForSr`; one entry point per docs page | A directive per class template with the query as its selector input (`nfsShowFor="medium"`, `nfsHideFor`, `nfsInvisible`): building-blocks 1.4 names the inputs `showFor` and `hideFor`, two directives cannot see each other's value for the combination check, and it adds five public classes (`other`); `.show-for-sr` and `.show-on-focus` as `nfsVisibility` inputs (a different contract behind one attribute, and a rename in a dozen specs) (`other`); a skip-link component (Foundation's skip link is the consumer's link with one class; ADR 0001) (`scope-boundary`); consumer-written classes (ADR 0039) (`variant-as-class`) |
| D2 | `showFor` and `hideFor` take `NfsClassBreakpointQuery<'up' \| 'only'>`, named with Foundation's words; no `down` | ADR 0040 and building-blocks 1.4: an on or off responsive family takes a Breakpoint query whose modifiers are those Foundation generates classes for, and a `<words>-for-<bp>` class keeps Foundation's words (the rule's own example is `showFor="large only"`); Foundation generates `show-for-<bp>`, `-only`, `hide-for-<bp>`, and `-only`, never a `down` form; closed over `$breakpoint-classes`, so a misspelt or undeclared breakpoint fails to compile | A `down` modifier mapped to the next breakpoint's `hide-for` class (a second spelling that has no class for the last Class breakpoint, where the type could not know it) (`other`); one input per breakpoint (`mediumUp`) (ADR 0040 rule 5) (`other`); a rule string (its tokens would be Foundation class names) (`variant-as-class`) |
| D3 | Zero-breakpoint gaps: `showFor` at the Zero breakpoint's `up` form sets no class; `hideFor` written alone, `true`, or at the Zero breakpoint's `up` form sets `.hide` | Foundation generates neither `show-for-<zero>` nor `hide-for-<zero>` and names `.hide` for "always hidden"; building-blocks 1.4 maps each value to the one class with its meaning, as `expanded="small"` sets `.expanded`; `.hide` is the unconditional form of the hide family, as `.expanded` is of the expanded family; the Zero breakpoint comes from `nfsBreakpointsToken`, the same on server and client | A separate `hide` boolean (ADR 0040 rule 5 folds the unconditional form into the family's input) (`other`); a warning for `showFor` at the Zero breakpoint (a bound value uses it to mean "shown at every width") (`other`); binding `hidden` in place of `.hide` (`[hidden]` loses to a Foundation component's `display` rule, building-blocks 1.10) (`platform-or-a11y`) |
| D4 | The conditions are values of the same two inputs: `'landscape'`, `'portrait'`, `'dark-mode'`, `'sticky'`; one value per input; development warnings for a combination Foundation's CSS cannot give and for a sticky condition out of place | Foundation's classes are `show-for-<condition>` and `hide-for-<condition>`, so its words hold; measured in four engines, the orientation rules and `.show-for-dark-mode` set `display: block !important` and override a breakpoint class or `.hide` on the same element, while `.hide-for-dark-mode` and the sticky rules combine; `.show-for-sticky` on the Sticky element itself never shows | An `orientation` input (Menu and Tabs already take `orientation` for `.vertical`, and Angular sets one attribute on every directive of the element that declares the input) (`other`); a `colorScheme` input (Foundation's word is `dark-mode`) (`other`); lists of conditions per input (they would promise combinations the CSS does not give) (`other`) |
| D5 | `invisible` and `visible` booleans through `nfsVariantBoolean`; a development warning when both are set | Building-blocks 1.4 rule 4: two single classes that come from no Sass setting or loop are booleans named after their classes; `.visible` exists to show a descendant of an `invisible` element, so the two sit on different elements in every meaningful use | One enum input `visibility: 'invisible' \| 'visible'` (rule 3 needs one setting or loop, and the name would repeat the directive's) (`other`); `booleanAttribute` (lets `invisible="flase"` compile and set the class) (`other`) |
| D6 | `.show-for-ie` and `.hide-for-ie` are dropped; a copy is reported naming the reason | Measured in Chromium 153, Firefox 155, WebKit 26.6, and Edge 153, with and without forced colours: no engine matches `-ms-high-contrast`, so the classes are constant; Internet Explorer is outside the Browser target | A `showFor="ie"` value (an input whose value can never change anything) (`platform-or-a11y`) |
| D7 | Plugin directives that own a Visibility class for their own behaviour keep binding it and never host `NfsVisibility`; `nfsVisibility` stays off their elements, which development check 4 reports | The Responsive Toggle binds `hide-for-<bp>` and `show-for-<bp>` from class records over the Breakpoint map, driven by its open `hideFor` Option with library CSS for breakpoints outside `$breakpoint-classes`; the Nested menu binds `invisible` on Drilldown levels as a State class; two owners of one class on one element resolve by binding priority, and a `false` wins over a `true` in a lower-priority binding; and the Responsive Toggle's Option is also named `hideFor`, so one attribute on a shared element would set both directives' inputs | The Responsive Toggle hosting `NfsVisibility` (it would expose `showFor` and `hideFor` on the bar and the menu, and the closed Class-breakpoint type cannot express its open Option) (`other`); a documented rule with no check (a silent conflict) (`other`) |
| D8 | One `computed` class list of the selected classes, not a record of the family set to `false`; copied Visibility classes reported, not stripped | A record would contradict the Responsive Toggle's and the Nested menu's records on shared keys; the Label's and Badge's list binding, which reports copies (their D7) | A record that strips copies (fights Plugin directives on the same element) (`other`); no copy check (a silent second spelling) (`other`) |
| D9 | `nfsShowForSr` warns when its host or a descendant is tabbable; `nfsShowOnFocus` warns when its host is not tabbable, naming a tabbable descendant; both in development builds, once, at the first render | Measured in three engines: a focused `.show-for-sr` input is a 1 by 1 px box (2.4.7), and `.show-on-focus` on a wrapper paints 0 pixels while its link has focus; axe reports neither; the Forms spec already rejected the label-as-button file upload over a visually hidden input | Library CSS revealing a focused `.show-for-sr` element (it would show text the author meant to hide, and duplicate `.show-on-focus`) (`other`); no check (axe is silent) (`platform-or-a11y`) |
| D10 | Five development checks on `NfsVisibility`: copied classes, impossible combinations, sticky placement, a second owner, `invisible` with `visible` | Building-blocks 1.4 (copied Foundation classes are reported); each check catches a measured or source-confirmed failure the compiler and axe cannot see; production pays nothing | A check that an orientation or dark-mode value sits on an inline element (it cannot know the element's intended display) (`other`); re-checking after every render (costs more than it finds) (`other`) |
| D11 | The Runtime check: `include('nfs-breakpoint-properties', ['breakpoint-classes'])` only while a Breakpoint query is bound; `value()` per bound `showFor` and `hideFor`; no Variant property of its own | The Breakpoint service spec's rule for a directive whose property is read only for a value that may stay unbound and whose own mixin holds nothing (Off-canvas `revealOn`, Top Bar `stackedFor`); `nfs-breakpoint-properties` is the one writer of `--nfs-breakpoint-classes` | Requesting the include on every run (would ask an application that uses only `invisible` for a mixin it does not need) (`other`) |
| D12 | CSS first: no JavaScript decides visibility, and nothing reads the viewport | The ticket's known constraint and building-blocks 1.7 and 1.11 decision 8: Foundation's media queries make server HTML right at every width, in dehydrated blocks, and in `hydrate never` | An `@if` over `NfsMediaQuery` or a structural directive (renders the Server breakpoint's answer and swaps at hydration) (`platform-or-a11y`) |
| D13 | No Library mixin and no library CSS; the forced `display: block` of the orientation and dark-mode classes is documented: put those conditions on a block element or wrapper | Foundation's CSS covers every class the inputs set; the forced block is layout, not an accessibility failure, and a wrapper avoids it; the Variant property is `nfs-breakpoint-properties`'s | An `nfs-visibility` rule overriding Foundation's orientation and dark-mode rules without `display: block` (a library copy of Foundation's `!important` rules) (`other`); a checks-only mixin (nothing to check at compile time) (`other`) |
| D14 | Content rules, stated as requirements and shown by every story: hide only a presentation another element also carries (1.4.10, 1.3.4); visually hidden text follows a control's visible text or names a glyph (2.5.3); a form field keeps a visible label (3.3.2) | Hidden content is hidden from assistive technology too, so a lone hidden element is lost to everyone at that width or orientation; the directive cannot read meaning, so the requirement is content, as the Callout's, Label's, and Progress Bar's are | A check that each hidden element has a displayed alternative (no way to know which element is the alternative) (`other`) |
| D15 | The skip link recipe: `<a nfsShowOnFocus nfsSmoothScroll [href]="path() + '#main-content'">` first in the shell, with the Smooth Scroll spec's live current path, and `<main id="main-content" tabindex="-1">`; Foundation's `tabindex="0"` and `role="main"` dropped | ADR 0038: a bare `#` link leaves the page under `<base href>`; `nfsSmoothScroll` focuses the target after hydration, and `tabindex="-1"` lets the browser focus it natively before, without a tab stop (measured: `tabindex="0"` makes `main` the next tab stop); `role="main"` repeats the element's role | A `nfsShowOnFocus` that scrolls and focuses itself (duplicates `nfsSmoothScroll`, which may sit on any element, building-blocks 1.9) (`other`); `routerLink` with `fragment` (the Router scrolls but moves no focus) (`platform-or-a11y`) |
| D16 | No `hide-for-sr` directive: `aria-hidden="true"` is the consumer's native attribute on purely visual elements | Foundation's own advice; building-blocks 1.10 keeps `aria-hidden` out of the library's hiding and leaves it for masking visuals; axe's `aria-hidden-focus` guards its misuse | A directive binding `aria-hidden` (a second spelling of a native attribute, with no class to manage) (`platform-or-a11y`) |
| D17 | Native implementation level; no Aria; CDK only for the development `InteractivityChecker` | CSS media queries, `visibility`, and the visually hidden technique cover the family; `InteractivityChecker` is the CDK's tested tabbability test, dropped from production builds with the checks | A hand-written focusable selector (a second copy of the CDK's rules for `a` without `href`, `contenteditable`, frames, and media controls) (`other`) |
| D18 | Seven stories that hold at the 414 px test viewport; e2e for the viewport, orientation, colour-scheme, print, and forced-colours sweep, sticky scrolling, and the skip link in three engines; the fixture app for first paint, hydration, and the deep-route skip link; a manual screen-reader release test | Media queries need real viewports and emulated media; WebKit's Tab behaviour needs its own path (measured); announcements need assistive technology | An Anti-pattern story for visually hidden focus (axe is silent on it, so there is no rule to switch off; the browser-level test covers the warning) (`other`) |
| D19 | Glossary: **Visibility class** widened to the whole family; **Visually hidden** and **Skip link** added | The specs say "screen-reader-only directive", "Visibility Classes directive", and "visually hidden text" for one idea; the existing term named only the breakpoint classes | "Screen-reader-only class" as the term (describes one technology, and the text also serves braille and speech input) (`other`) |

### Usage examples

```html
<!-- A navigation from large up and its jump menu below large: one presentation each (1.4.10) -->
<nav nfsVisibility showFor="large" aria-label="Sections">
  <ul nfsMenu>
    <li><a href="#intro">Introduction</a></li>
    <li><a href="#setup">Setup</a></li>
  </ul>
</nav>
<form nfsVisibility hideFor="large">
  <label for="jump">Jump to section</label>
  <select id="jump">...</select>
</form>

<!-- An icon-only button named by visually hidden text -->
<button nfsButton><svg aria-hidden="true" ...></svg><span nfsShowForSr>Delete invoice</span></button>

<!-- A visible label completed for assistive technology (2.5.3: the name starts with "Back") -->
<button type="button">Back<span nfsShowForSr> to Products</span></button>

<!-- A compact title while the bar is stuck -->
<div nfsStickyContainer>
  <div nfsSticky>
    <h2 nfsVisibility hideFor="sticky">Quarterly report 2026</h2>
    <p nfsVisibility showFor="sticky">Q3 report</p>
  </div>
</div>
```

The skip link in an application shell under `<base href>`, with the [Spec: Smooth Scroll](../issues/29-spec-smooth-scroll.md)'s live current path, which follows every navigation because the shell outlives them:

```ts
@Component({
  selector: 'app-root',
  imports: [NfsShowOnFocus, NfsSmoothScroll, RouterOutlet],
  template: `
    <a nfsShowOnFocus nfsSmoothScroll [href]="path() + '#main-content'">Skip to content</a>
    <app-site-header />
    <main id="main-content" tabindex="-1"><router-outlet /></main>
  `,
})
export class App {
  readonly #location = inject(Location);
  readonly #currentPath = () => this.#location.prepareExternalUrl(this.#location.path());
  protected readonly path = signal(this.#currentPath());

  constructor() {
    inject(DestroyRef).onDestroy(this.#location.onUrlChange(() => this.path.set(this.#currentPath())));
  }
}
```

A visually hidden status region that exists before its text changes:

```ts
@Component({
  selector: 'app-save',
  imports: [NfsButton, NfsShowForSr],
  template: `
    <button nfsButton (click)="save()">Save</button>
    <div nfsShowForSr role="status">{{ message() }}</div>
  `,
})
export class Save {
  protected readonly message = signal('');

  protected save(): void {
    // save, then:
    this.message.set('Saved');
  }
}
```

The consumer's Variant declaration file, as the library's tooling generates it from `$breakpoint-classes: (small medium large xlarge);`, after which `showFor="xlarge"` compiles and `showFor="xxlarge"` still fails:

```ts
import 'ngx-foundation-sites';

declare module 'ngx-foundation-sites' {
  interface NfsBreakpointClassesOverrides {
    xlarge: true;
  }
}
```

`NfsVisibility`, `NfsShowForSr`, and `NfsShowOnFocus` come from `ngx-foundation-sites/visibility`; `NfsSmoothScroll`, `NfsButton`, `NfsMenu`, `NfsSticky`, and `NfsStickyContainer` from their own entry points, and are shown only to place them.

### Platform features to adopt when the browser target moves

- Scroll-state container queries (`@container scroll-state(stuck: top)`) could show and hide content inside a stuck element without the Sticky directive's `.is-stuck`; Foundation's sticky classes would still need that class, so the library would adopt it only with a Foundation rule that uses it.

### Foundation behaviour changed or dropped

- `.show-for-ie` and `.hide-for-ie` are gone (D6).
- The skip link's target is `tabindex="-1"` without `role="main"`, its `href` is the live current path, and `nfsSmoothScroll` moves focus after hydration (D15).
- The docs gain the content rules: hidden content has a displayed alternative, orientation content exists in both orientations, visually hidden text follows visible text (D14).
- Combining an orientation condition or `showFor="dark-mode"` with another value, and a sticky condition outside a Sticky element, are reported in development (D4).

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This entry point relies on Foundation's export mixin `foundation-visibility-classes` (part of `foundation-everything`), configured through `$breakpoint-classes`, `$breakpoints`, and `$print-breakpoint`; the sticky conditions also need the Sticky spec's `foundation-sticky` and `nfsSticky`. No library CSS; there is no `nfs-visibility` mixin.

1. Rules: none.
2. Reused, read from the consumer's compile: every class above, as `foundation-visibility-classes` prints it.
3. Custom properties the directives write: none.
4. Motion classes: none, and no `prefers-reduced-motion` override, because nothing animates.
5. Missing include: without `foundation-visibility-classes` every element shows and every visually hidden text is visible at full size; without `@include nfs-breakpoint-properties;` the `strictVariantProperties` Runtime check reports it in development while a Breakpoint query is bound, and the Variant declaration file's generator cannot list the Class breakpoints.
6. Variant properties: none of its own. `showFor` and `hideFor` loop over `$breakpoint-classes`, whose property, `--nfs-breakpoint-classes`, `nfs-breakpoint-properties` writes.

No required setting: Foundation's defaults pass every criterion this entry point touches.

### Notes

- Two directives on one element: `nfsVisibility` binds only Visibility classes, so it sits beside `nfsButton`, `nfsMenu`, `nfsCallout`, or a Trigger on the same element; the Button's `inline-block`, the Menu's flex row, and the Callout's block keep their `display` where the element shows, because the breakpoint classes set `display` only where they hide.
- A Drilldown level's `invisible` is the Nested menu's State class; `visible` belongs on elements no library directive hides.
- RTL: nothing flips; the visually hidden box is 1 by 1 px, clipped, at its static position, and no rule or `Directionality` is needed.
- Forced colours: measured, a Windows contrast theme changes no computed `display` or `visibility` of any class.
- A visually hidden live region is not `aria-live` on a hidden element: `.show-for-sr` keeps it in the accessibility tree, which a `hidden` region is not, so it announces.
