# Spec: Visibility Classes

Ticket: [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md), revised 2026-09-28 for the print classes by the [Re-run: Visibility Classes spec for the print classes](../issues/143-rerun-visibility-classes-print.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Written under the class rule ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)) and the Variant typing rules ([ADR 0040](../adr/0040-variant-input-types.md)).

Milestone: later. This spec is planned and implemented in a later milestone of the implementing repository, not in the first ([Decide: grids, typography, and utilities move to a later milestone](../issues/174-decide-grids-typography-utilities-later-milestone.md); Problem Statement). Revised for the later milestone by [Re-run: grid, typography, and utility specs for the later milestone](../issues/175-rerun-grid-typography-utility-specs-later-milestone.md).

## Problem Statement

A developer on Foundation for Sites shows or hides content with Foundation's Visibility Classes: `.show-for-medium` hides an element below `medium`, `.show-for-medium-only` shows it only at `medium`, `.hide-for-large` and `.hide-for-large-only` do the opposite, `.hide` and `.invisible` hide it always, `.show-for-landscape`, `.show-for-dark-mode`, and `.show-for-sticky` show it under a condition, `.show-for-print` and `.hide-for-print` (printed by Foundation's print styles and documented on its Typography Base page) show it only on paper or only on screen, `.show-for-sr` hides it from sight but not from a screen reader, and `.show-on-focus` shows it only while it has focus, which is how Foundation builds a skip link. The family is CSS only: Foundation's media queries decide, so server HTML is right at every width. The markup contract leaves the hard parts to the author:

- The breakpoint classes exist only for the breakpoints in `$breakpoint-classes` (`small medium large` by default), and not for every form: there is no `.show-for-small` or `.hide-for-small`, and the docs send the reader to `.hide`. A `show-for-xlarge` or a misspelt `show-for-meduim` renders a plain, always visible element, and nothing reports it.
- Where the orientation and dark-mode classes show an element they set `display: block !important`, and `.hide-for-dark-mode` sets `display: block` at all times. Measured in Chromium, Firefox, WebKit, and Edge: a `span` or a flex `.menu` becomes a block, and beside a breakpoint class they win, so `show-for-medium show-for-landscape` shows below `medium` in landscape and `show-for-medium show-for-dark-mode` shows below `medium` in dark mode.
- `.show-for-sticky` and `.hide-for-sticky` react to an enclosing stuck Sticky element; on the Sticky element itself `.show-for-sticky` never shows (measured).
- In print, measured in the same four engines: `.show-for-print` sets `display: block !important` on everything but a table and its rows, cells, head, and body, so a print-only list item loses its marker and a flex menu or grid its row; beside it, in Foundation's own include order, every hide class up to `$print-breakpoint`, `.hide`, and `.hide-for-print` hide the element everywhere, the orientation hide classes show it on screen in one orientation, and the others do nothing; and `.show-for-landscape` beside `.hide-for-print` still prints. The other conditions print as fixed answers: Foundation's orientation and dark-mode queries are `screen` only, so on paper `.show-for-landscape` always shows, `.show-for-portrait` never does, and the dark-mode classes act as in light mode under any colour scheme.
- `.show-for-ie` and `.hide-for-ie` detect Internet Explorer through `-ms-high-contrast`, which no browser of the Angular 22 target matches: measured in Chromium 153, Firefox 155, WebKit 26.6, and Edge 153, with and without forced colours, `.show-for-ie` always hides and `.hide-for-ie` does nothing.
- On a focusable element, `.show-for-sr` leaves a 1 by 1 px box that takes focus with no visible indicator (WCAG 2.4.7): measured in three engines on a visually hidden file input, the File Upload recipe of Foundation's Forms docs. axe reports nothing.
- `.show-on-focus` shows only the element that has focus. Written on a wrapper around the link, it paints nothing while the link has focus (0 pixels in three engines), and axe reports nothing. Foundation's skip link example gives `<main>` a `tabindex="0"`, an extra tab stop, and a bare `href="#mainContent"`, which `<base href>` resolves to another document on every route but the base URL ([ADR 0038](../adr/0038-smooth-scroll-same-document-links.md)).
- Hidden content is hidden from everyone, assistive technology included. Content shown in one orientation only fails 1.3.4, and content hidden below a breakpoint is lost at 320 CSS px and at 400 percent zoom (1.4.10) unless another element carries it. Print-only content is hidden on every screen: a print-only `caption` leaves its table unnamed there (measured in Chromium's tree), and axe reports nothing. The docs say nothing about any of these.
- Under the library's class rule the developer writes no Foundation class at all, so every Visibility class needs an Angular home, the print pair from another docs page included.

A server-rendered application adds the usual second problem: whatever the Angular layer does must already be right in the server HTML at every viewport width and on paper, with no JavaScript deciding what is visible, must not break hydration, and must keep working inside dehydrated `@defer` blocks and `hydrate never`.

This spec is planned and implemented in a later milestone of the implementing repository, not in the first. The user ruled on 2026-09-30 ([Decide: grids, typography, and utilities move to a later milestone](../issues/174-decide-grids-typography-utilities-later-milestone.md)) that the XY Grid, Typography Helpers, and the four Utilities specs (Prototyping Utilities, Flexbox Utilities, Visibility Classes, Float Classes) move to a later milestone, each a whole and separate spec, so that the first milestone is simpler and more minimal. Until then a consumer who needs a Visibility class writes Foundation's own classes as normal classes (`class="show-for-sr"`, `class="hide-for-large"`) with Foundation's global styles loaded; the library's own stories write the same classes, because the class rule exempts a family with no first-milestone spec (decision 3 of the ruling). No first-milestone spec assumes this spec, names its directives, or links to it; the Plugin directives that bind a Visibility class for their own behaviour (D7) are first-milestone directives and keep binding it. The design below is the later milestone's and stays whole; the closing section (Further Notes, What the later milestone changes, per spec) lists, per first-milestone spec, the Foundation classes that this spec's directives replace there.

## Solution

Three attribute directives in one entry point, each nothing but host bindings that are already in the server HTML; none declares a listener or reads the viewport.

- `nfsVisibility` sets the conditional and generic hiding classes from four typed Variant inputs. `showFor` and `hideFor` keep Foundation's words and take a Breakpoint query over the developer's Class breakpoints (`showFor="medium"`, `hideFor="large only"`), or a condition: `'landscape'`, `'portrait'`, `'dark-mode'`, `'sticky'`, or `'print'` (`showFor="print"` for what only a printout needs, `hideFor="print"` for controls and navigation that mean nothing on paper). `hideFor` written alone means "always", which is Foundation's `.hide`, and so does `hideFor` at the Zero breakpoint, as Foundation's docs advise. `invisible` and `visible` set Foundation's `visibility` classes. A misspelt or undeclared breakpoint, a `down` modifier (for which Foundation generates no class), and a Foundation class name fail to compile.
- `nfsShowForSr` binds `.show-for-sr` for text that names or describes something to assistive technology without being seen: the name of an icon-only button, the end of a link's or button's visible text, a visually hidden live region.
- `nfsShowOnFocus` binds `.show-on-focus` on the focusable element itself; the skip link is `nfsShowOnFocus` beside `nfsSmoothScroll`, with an `href` built from the live current path.

Foundation's media queries do all the work, so the page is right before any script runs, on screen and in print. The documentation states what axe and the compiler miss: visually hidden text never takes focus, `nfsShowOnFocus` sits on the focusable element itself, some pairs of values Foundation's CSS cannot combine (`showFor="print"` with any `hideFor` value among them), a sticky condition sits inside a Sticky element, `nfsVisibility` stays off an element where another directive binds Visibility classes, and Foundation's classes are never copied onto the host. The library adds no CSS. The Plugin directives that own a Visibility class for their own behaviour (the Responsive Toggle's bar and menu, a Drilldown level's `invisible`) keep binding it themselves, and `nfsVisibility` stays off their elements.

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
13. As an application developer, I want `showFor="print"` for content only a printout needs (the page address, a print date) and `hideFor="print"` for controls and navigation that mean nothing on paper, so that Foundation's print classes carry over word for word.
14. As an application developer, I want the spec to tell me what prints without a print value (every `showFor` breakpoint element prints; every `hideFor` breakpoint element up to `$print-breakpoint` does not; `showFor="landscape"` and `hideFor="portrait"` always print, their opposites never; the dark-mode conditions print as in light mode), so that I can predict a printout.
15. As an application developer, I want the spec to tell me which elements `showFor="print"` turns into blocks on paper, so that I put it on a block element or a wrapper and a print-only list item or menu keeps its layout.
16. As an application developer, I want `invisible` to hide an element while it keeps its space, and `visible` to show a descendant of an invisible element, so that Foundation's `visibility` classes have an input each.
17. As an application developer, I want the documentation to say that an orientation value, or `showFor="dark-mode"`, takes no second value on the same element (except `hideFor="print"` where the pair prints right), so that I learn Foundation's CSS lets the first override the second and move one to a wrapper.
18. As an application developer, I want the documentation to say that `showFor="print"` takes no `hideFor` value, so that I learn the element would show nowhere or the second value would do nothing.
19. As an application developer, I want the documentation to say that a sticky condition goes on an element inside a Sticky element, never outside it or on the Sticky element itself, so that I learn why it would never change.
20. As an application developer migrating Foundation markup, I want the mapping table to name the input that replaces each class (`class="show-for-medium"` becomes `showFor="medium"`), so that I remove the class.
21. As an application developer, I want the documentation to say that `nfsVisibility` stays off an element where another library directive binds Visibility classes, so that the Responsive Toggle and my `nfsVisibility` never fight over one class.
22. As an application developer, I want the Variant declaration tooling to keep my breakpoint types in step with `$breakpoint-classes`, so that I bind only breakpoints my compiled CSS has classes for.
23. As an application developer, I want the library to tell me that the IE detection classes are gone and why, so that I delete them instead of looking for an input.
24. As an application developer, I want `nfsShowForSr` on a `span` inside an icon-only button to name the button, so that the button has an accessible name without an `aria-label` that hides the text from translation tools.
25. As an application developer, I want `nfsShowForSr` on the end of a control's visible text ("Back" plus " to Products"), so that the name starts with what sighted users see (2.5.3).
26. As an application developer, I want `nfsShowForSr` on a live region (`role="status"`, Abide's Form alert) that stays hidden from sight, so that announcements need no visible box.
27. As an application developer, I want the documentation to say that `nfsShowForSr` never sits on a focusable element or holds one, so that no keyboard user lands on something they cannot see.
28. As an application developer, I want `nfsShowOnFocus` on a skip link, so that the link appears when a keyboard user reaches it and is hidden otherwise.
29. As an application developer, I want the documentation to say that `nfsShowOnFocus` goes on the link or button itself, never on a wrapper around one, so that my skip link actually appears.
30. As an application developer on the Router, I want the skip link recipe to use a live current-path `href` and `nfsSmoothScroll`, so that it moves focus to the main content on every route instead of loading the home page.
31. As an application developer, I want the spec to tell me that hidden content must exist in another form (a navigation above `large`, a jump menu below it), so that I do not lose content on small screens or in one orientation.
32. As an application developer, I want the directives to leave `hidden`, `aria-hidden`, `role`, `id`, and `tabindex` to me, so that they compose with the platform and with other directives.
33. As an application developer, I want to import the three directives from one entry point, so that a `@defer` block can split them and every component that uses `nfsShowForSr` shares one import.
34. As a keyboard user, I want the first Tab on a page to show a "Skip to content" link, and Enter on it to move focus into the main content, so that I bypass the navigation (2.4.1).
35. As a keyboard user, I want never to land on an invisible element, so that I always see where focus is (2.4.7).
36. As a screen reader user, I want visually hidden text to be part of the name or description of the control it belongs to, so that an icon button says what it does.
37. As a screen reader user, I want the skip link to be announced even before it is shown, so that I can use it from the virtual cursor.
38. As a screen reader user, I want content hidden for a breakpoint, an orientation, or a colour scheme to be hidden from me as well, so that I never hear two copies of the same content.
39. As a screen reader user, I want print-only content hidden from me on screen, as it is from sighted users, and never to lose the caption, label, or legend of something on screen to it, so that the screen page is complete without the printout.
40. As a user at a 320 CSS px viewport or 400 percent zoom, I want everything the page offers at a wide viewport to be available in some form, so that the page reflows without losing content.
41. As a user who locks my device in one orientation, I want no content to be available only in the other one, so that the page works in the orientation I use (1.3.4).
42. As a user of a Windows contrast theme, I want the breakpoint and screen-reader classes to behave exactly as without it, so that nothing appears or disappears because of the theme (measured: forced colours change no computed display).
43. As a developer of a server-rendered application, I want the server HTML to carry every Visibility class, so that the first paint is right at every width and hydration changes nothing.
44. As a user who prints a server-rendered or prerendered page before its scripts have run, or with JavaScript off, I want the printout to show and hide what it shows and hides after hydration, so that an early print is right.
45. As a developer using `@defer (hydrate never)`, I want visibility to keep working there, so that static regions need no JavaScript.
46. As a developer of a zoneless application, I want the directives to need no zone, so that they work with zoneless change detection.
47. As a library maintainer, I want every behaviour asserted through classes, computed display, accessible names, focus, and geometry in stories, browser-level tests, a server-render smoke test, and e2e sweeps of viewport, orientation, colour scheme, and print, so that regressions surface at the layer that owns them.

## Implementation Decisions

### Foundation contract

Visibility Classes has no Plugin, no `defaults` object, no `data-*` Options, no events, and no methods. Its whole contract is Foundation's `foundation-visibility-classes` Export mixin (in `foundation-everything`), the `show-for()`, `show-for-only()`, `hide-for()`, and `hide-for-only()` mixins it calls, Foundation's `element-invisible()` and `element-invisible-off()`, and the docs page, plus the two print classes of Foundation's `foundation-print-styles` mixin, which `foundation-typography` includes, and the Print Styles section of the Typography Base docs page that documents them (D20). Dropped options: none, because there are none.

| Feature | Classes | Rule (Foundation 6.9.0) | Notes |
| --- | --- | --- | --- |
| Show by screen size | `.show-for-<bp>` for every Class breakpoint but the Zero breakpoint; `.show-for-<bp>-only` for every Class breakpoint | `display: none !important` below the breakpoint (`show-for`), or outside it (`show-for-only`); `screen` media only | Sets no `display` where the element shows, so the element keeps its own. In print every `show-for` element shows (measured) |
| Hide by screen size | `.hide-for-<bp>` for every Class breakpoint but the Zero breakpoint; `.hide-for-<bp>-only` for every Class breakpoint | `display: none !important` from the breakpoint up, or within it; the query includes `print` for breakpoints up to `$print-breakpoint` | So in print a `hide-for-<bp>` element up to `large` hides (measured) |
| Generic | `.hide`, `.invisible`, `.visible` | `display: none !important`; `visibility: hidden`; `visibility: visible` | "There's no `.hide-for-small` class ... use the plain old `.hide` class". `.visible` shows a descendant of an `.invisible` element (measured) |
| Orientation | `.show-for-landscape`, `.hide-for-portrait` (one rule); `.hide-for-landscape`, `.show-for-portrait` (one rule) | `display: block !important` in the orientation that shows, `display: none !important` in the other; the orientation queries are `screen` only, and the rule outside them is the `block` one for the first pair and the `none` one for the second | Forces `block` (D13); overrides a breakpoint class on the same element (measured). In print the rule outside the queries applies at any page shape: `.show-for-landscape` and `.hide-for-portrait` always print, `.hide-for-landscape` and `.show-for-portrait` never do (measured at 1100 by 800 and 320 by 640) |
| Dark mode | `.show-for-dark-mode`, `.hide-for-dark-mode` | `.show-for-dark-mode { display: none }`, and `display: block !important` under `screen and (prefers-color-scheme: dark)`; `.hide-for-dark-mode { display: block }`, and `display: none !important` under dark | Follows the user's system preference only; `.hide-for-dark-mode` forces `block` at all times, `.show-for-dark-mode` overrides a breakpoint class in dark mode, and `.hide-for-dark-mode` combines with one (measured). In print both act as in light mode, under a dark colour scheme too (measured) |
| Sticky | `.show-for-sticky`, `.hide-for-sticky` | `.show-for-sticky { display: none }`; `.is-stuck .show-for-sticky { display: block }`; `.is-stuck .hide-for-sticky { display: none }` | Descendant selectors on the Sticky element's `.is-stuck` State class (bound by `nfsSticky`); no `!important`, so they combine with a breakpoint class (measured) |
| Screen readers | `.show-for-sr`, `.show-on-focus` | `element-invisible()`: absolute, 1 by 1 px, clipped, `!important`; `.show-on-focus:active`, `.show-on-focus:focus` get `element-invisible-off()`: static, auto size, unclipped | "Need a `hide-for-sr` class? Add `aria-hidden='true'`" (Foundation's Sass comment) |
| Print (`foundation-print-styles`, Typography Base page) | `.show-for-print`, `.hide-for-print` | `.show-for-print { display: none !important }`; under `print`, `.show-for-print { display: block !important }`, with `table`, `thead`, `tbody`, `tr`, `td`, and `th` given their own table displays, and `.hide-for-print { display: none !important }` | "Attach `.show-for-print` to an element to only show when printing, and `.hide-for-print` to hide something when printing". `.hide-for-print` keeps the element's own display on screen (a `span` stays inline, a `.menu` flex). `.show-for-print` prints a `li`, `caption`, `tfoot`, `img`, `span`, `a.button`, flex `.menu`, and `.grid-x` as `block` (measured, D13). Printed before `foundation-visibility-classes` in `foundation-everything`, so an `!important` Visibility rule of equal specificity wins in print (D21) |
| IE10+ | `.show-for-ie`, `.hide-for-ie` | `-ms-high-contrast` media queries | Matches in no browser of the target (measured, D6) |

Docs conventions kept or corrected: the classes on any element (kept); `.hide` for "always" (kept, as `hideFor` alone, D3); the skip link on the link itself (kept) with a `tabindex="0"` `<main role="main">` target (corrected: `tabindex="-1"`, no redundant `role`, and a current-path `href` with `nfsSmoothScroll`, D15); `aria-hidden="true"` for "hide for screen readers" (kept as the native attribute, D16); the IE classes (dropped, D6); the print classes on any element (kept, as the `print` condition, D20); nothing said about alternatives, orientation, focus, or print-only content (corrected: requirements in the WCAG table and D14).

### CSS class to directive mapping

`<zero>` is the Zero breakpoint (`small` by default), read from `nfsBreakpointsToken`. `<bp>` is any other Class breakpoint.

| Foundation class | Kind | Angular | Type, Sass setting, and Variant registry | Value shape | Class each value sets | Variant property |
| --- | --- | --- | --- | --- | --- | --- |
| `.show-for-<bp>`, `.show-for-<bp>-only`, `.show-for-<zero>-only` | Utility (Visibility class) | `showFor` Variant input of `NfsVisibility` | `NfsVisibilityShowFor`, whose breakpoint part is `NfsClassBreakpointQuery<'up' \| 'only'>` over `$breakpoint-classes` (`NfsBreakpointClassesOverrides`, Open Variant family) | a Breakpoint query | `'medium'` and `'medium up'` set `.show-for-medium`; `'medium only'` sets `.show-for-medium-only`; `'small only'` sets `.show-for-small-only`. Zero-breakpoint gap: `'small'` and `'small up'` set none (shown at every width). No value sets none | `--nfs-breakpoint-classes`, written by `nfs-breakpoint-properties` |
| `.show-for-landscape`, `.show-for-portrait`, `.show-for-dark-mode`, `.show-for-sticky`, `.show-for-print` | Utility (Visibility class) | `showFor` | the condition part of `NfsVisibilityShowFor`: `'landscape' \| 'portrait' \| 'dark-mode' \| 'sticky' \| 'print'` (closed; `.show-for-print` comes from `foundation-print-styles`, D20) | a name | `'landscape'` sets `.show-for-landscape`, and so on; `'print'` sets `.show-for-print` | none |
| `.hide`, `.hide-for-<bp>`, `.hide-for-<bp>-only`, `.hide-for-<zero>-only` | Utility (Visibility class) | `hideFor` Variant input of `NfsVisibility` | `NfsVisibilityHideFor`: `boolean`, the same Breakpoint query, and the same conditions; the transform maps `NfsVariantBoolean` through `nfsVariantBoolean` and passes the rest through | `true` (or the bare attribute) or a Breakpoint query | `true` sets `.hide`; `'large'` and `'large up'` set `.hide-for-large`; `'large only'` sets `.hide-for-large-only`; `'small only'` sets `.hide-for-small-only`. Zero-breakpoint gap: `'small'` and `'small up'` set `.hide`. `false` and no value set none | `--nfs-breakpoint-classes`, for the breakpoint values |
| `.hide-for-landscape`, `.hide-for-portrait`, `.hide-for-dark-mode`, `.hide-for-sticky`, `.hide-for-print` | Utility (Visibility class) | `hideFor` | the condition part of `NfsVisibilityHideFor` (closed) | a name | `'portrait'` sets `.hide-for-portrait`, and so on; `'print'` sets `.hide-for-print` | none |
| `.invisible` | Utility (Visibility class) | `invisible` Variant input of `NfsVisibility` | `boolean` through `nfsVariantBoolean` (closed) | a boolean | `.invisible` | none |
| `.visible` | Utility (Visibility class) | `visible` Variant input of `NfsVisibility` | `boolean` through `nfsVariantBoolean` (closed) | a boolean | `.visible` | none |
| `.show-for-sr` | Utility (Visibility class) | `NfsShowForSr` (`[nfsShowForSr]`), static host class | - | - | `show-for-sr` | - |
| `.show-on-focus` | Utility (Visibility class) | `NfsShowOnFocus` (`[nfsShowOnFocus]`), static host class | - | - | `show-on-focus` | - |
| `.show-for-ie`, `.hide-for-ie` | Utility (Visibility class) | None: dropped (D6) | - | - | - | - |
| `.is-stuck` (read by the sticky classes) | State class of Sticky | `nfsSticky`'s host binding ([Spec: Sticky](../issues/28-spec-sticky.md)) | - | - | - | - |
| `.sticky-container`, `.sticky` (the Sticky element the sticky conditions sit in) | Another family's: Structural classes of Sticky | `NfsStickyContainer` and `NfsSticky` ([Spec: Sticky](../issues/28-spec-sticky.md)) | - | - | - | - |
| `.close-button` | Another family's: the Close Button's Structural class | `NfsCloseButton` (`button[nfsCloseButton]`) ([Spec: Close Button](../issues/83-spec-close-button.md)) | - | - | - | - |
| `.button` | Another family's: the Button's Structural class | `NfsButton` (`button[nfsButton]`) ([Spec: Button](../issues/37-spec-button.md)) | - | - | - | - |
| `.menu` | Another family's: the Menu's Structural class | `NfsMenu` (`ul[nfsMenu]`) ([Spec: Menu](../issues/85-spec-menu.md)) | - | - | - | - |
| `.top-bar` and its section classes (`visibility--skip-link`) | Another family's: the Top Bar's Structural classes | `NfsTopBar` and its section directives ([Spec: Top Bar](../issues/86-spec-top-bar.md)) | - | - | - | - |

State classes: none of this family's own. No class is left for the consumer to write (ADR 0039). The Visibility classes that Plugin directives bind for their own behaviour stay theirs and are not this entry point's (D7): the Responsive Toggle's `.hide-for-<hideFor>` on its bar and `.show-for-<hideFor>` on its menu ([Spec: Responsive Toggle](../issues/24-spec-responsive-toggle.md)), and the Nested menu's `invisible` on hidden Drilldown levels ([Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md)).

Binding rule: `NfsVisibility` binds one `computed` class list holding only the classes its inputs select, never a record of the family's classes set to `false` (D8). So a copied Visibility class is not stripped, and the directive, which never sets a class to `false`, meets another directive's binding only on a class both bind, which is why `nfsVisibility` stays off such an element (D7).

### Hierarchy and DI shape

```
[nfsVisibility]   NfsVisibility   (standalone directive, no template)
[nfsShowForSr]    NfsShowForSr    (standalone directive, no template)
[nfsShowOnFocus]  NfsShowOnFocus  (standalone directive, no template)
```

- Three independent directives: no parent, no children, no Parent token, no providers, and no host directives. Nothing finds them through DI, and no library directive hosts them (D7).
- No Defaults token: the family has no Options, and a Defaults token never holds a Variant input's default (building-blocks 1.4).
- Injection, `NfsVisibility`: `nfsBreakpointsToken` from `ngx-foundation-sites/media-query` (the Zero breakpoint, as `nfsBreakpointForWidth(map, 0)`, the same on server and client; never `NfsMediaQuery`). Nothing else.
- Injection, `NfsShowForSr` and `NfsShowOnFocus`: nothing.
- Entry point: `ngx-foundation-sites/visibility` (one per Foundation docs page), exporting the three directives and the aliases `NfsVisibilityShowFor`, `NfsVisibilityHideFor`, `NfsVisibilityQuery`, and `NfsVisibilityCondition`. `NfsClassBreakpointQuery`, `NfsBreakpointClassesOverrides`, `NfsVariantBoolean`, and `nfsVariantBoolean` live in the primary entry point; this entry point uses them as types and `nfsVariantBoolean` as the transform.
- Imports (documented usage): a component imports each of the three directives whose attribute its template writes. A forgotten `NfsVisibility` fails to compile where the template binds one of its inputs (`[showFor]`, `[hideFor]`, NG8002); with static attributes only, the element shows at every width and in print, with no error; a forgotten `NfsShowForSr` or `NfsShowOnFocus` leaves its text visible, with no error.

### API: `NfsVisibility`

Selector `[nfsVisibility]`; `exportAs: 'nfsVisibility'`; standalone; no template.

```ts
type NfsVisibilityQuery = NfsClassBreakpointQuery<'up' | 'only'>;
type NfsVisibilityCondition = 'landscape' | 'portrait' | 'dark-mode' | 'sticky' | 'print';
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
| `showFor` | `NfsVisibilityShowFor`, declared with explicit type arguments naming the alias; no transform | `undefined`: no class | `.show-for-<bp>`, `.show-for-<bp>-only`, `.show-for-landscape`, `.show-for-portrait`, `.show-for-dark-mode`, `.show-for-sticky`, `.show-for-print`; `$breakpoint-classes` | New. One input for the whole show family; the Zero breakpoint's `up` form sets no class; no `down` (D2) |
| `hideFor` | `NfsVisibilityHideFor`; the transform maps `NfsVariantBoolean` values through `nfsVariantBoolean` and passes a query or condition through, as `NfsButton`'s `expanded` does | `false`: no class | `.hide`, `.hide-for-<bp>`, `.hide-for-<bp>-only`, `.hide-for-landscape`, `.hide-for-portrait`, `.hide-for-dark-mode`, `.hide-for-sticky`, `.hide-for-print`; `$breakpoint-classes` | New. `true` and the Zero breakpoint's `up` form set `.hide` (D3) |
| `invisible` | `boolean` through `nfsVariantBoolean` | `false` | `.invisible` | New |
| `visible` | `boolean` through `nfsVariantBoolean` | `false` | `.visible` | New; for a descendant of an `invisible` element |

- Models, outputs, and methods: none. The directive has no state; the browser's media queries decide.
- Each input's JSDoc names Foundation's class template and `$breakpoint-classes` (AGENTS.md Design Philosophy 5); `showFor` and `hideFor` also name `$print-breakpoint` and say that `'print'` needs `foundation-print-styles`, which `foundation-typography` includes.

Host bindings, all on signal state:

| Binding | Value |
| --- | --- |
| `[class]` | one `computed` list of the classes the four inputs select (the mapping table); the consumer's own static and bound classes stay, because Angular combines static classes and class bindings |

- The mapping is one pure function over `(input, value, zeroBreakpoint)` returning the class. A value that is not a Class breakpoint name with an optional `up` or `only`, and not a condition, binds nothing; under the closed types only a cast or `$any()` reaches that guard.
- Attribute ownership: the directive owns the classes it lists. It never touches `hidden`, `aria-hidden`, `inert`, `role`, `id`, `tabindex`, or `style`.
- Documented usage, stated in the inputs' JSDoc:
  1. Classes (D8): Visibility classes are set through the inputs and the two screen-reader directives, never written in `class` (the mapping table names the input for each class; `show-for-sr` and `show-on-focus` are `nfsShowForSr` and `nfsShowOnFocus`; `show-for-ie` and `hide-for-ie` have no replacement, D6). A copied class is not stripped, so it keeps styling until removed.
  2. Combinations Foundation's CSS cannot give (D4, D21):
     1. `showFor` or `hideFor` holding `'landscape'` or `'portrait'` takes no value in the other input, except `showFor="portrait"` with `hideFor="print"`: Foundation's orientation rules set `display: block !important` where they show the element, which overrides the other class; put one condition on a wrapper element.
     2. `showFor="dark-mode"` takes no `hideFor` value but `'print'`, for the same reason.
     3. `showFor="print"` takes no `hideFor` value: in print the other class either hides the element as well or has no effect.

     Measured in four engines under `foundation-everything`'s include order: the orientation and `show-for-dark-mode` pairs with a breakpoint class and `.hide` all fail by the override; `show-for-landscape` beside `hide-for-print` still prints, and `hide-for-landscape` or `hide-for-portrait` beside `show-for-print` shows the element on screen in one orientation; `show-for-print` beside a hide class up to `$print-breakpoint`, `.hide`, or `hide-for-print` never shows, and beside a hide class above `$print-breakpoint`, `hide-for-dark-mode`, or `hide-for-sticky` it prints as it would alone. `hideFor="dark-mode"` and the sticky conditions combine with a breakpoint class, and `hideFor="print"` combines with every breakpoint `showFor`, `showFor="sticky"`, `showFor="dark-mode"`, and `showFor="portrait"` (whose own rule already hides it in print), so none of those is ruled out. Under the reverse include order (the Visibility classes before `foundation-typography`, measured) every `showFor="print"` pair prints as the element would alone and `showFor="landscape"` with `hideFor="print"` combines; the documented usage keeps them out anyway, because each pair is then either pointless or right only by source order.
  3. Sticky placement (D4): `showFor="sticky"` and `hideFor="sticky"` go on an element inside an `nfsSticky` element, never on the Sticky element itself, because they react to the enclosing Sticky element's stuck state.
  4. One owner (D7): `nfsVisibility` stays off an element where another directive binds Visibility classes (the Responsive Toggle's bar and menu, whose class records' `false` entries win over a `true` in a lower-priority binding, and a Drilldown level); put it on a wrapper element.
  5. `invisible` and `visible` are not set together: `.visible` overrides `.invisible` on the same element (D5).
- The directive writes no Variant property; `nfs-breakpoint-properties` is the one writer of `--nfs-breakpoint-classes` ([Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md)), from which the Variant declaration tooling types the breakpoint values (D11).

### API: `NfsShowForSr`

Selector `[nfsShowForSr]`; `exportAs: 'nfsShowForSr'`; standalone; no template; no inputs or outputs.

| Binding | Value |
| --- | --- |
| static `class` | `show-for-sr` |

- It binds nothing else: the host keeps its text in the accessibility tree (no `aria-hidden`, no `hidden`), and `hidden` bound by another directive (Abide's Form alert) still hides it, because `element-invisible()` sets no `display`.
- Documented usage (D9, 2.4.7): the host is not focusable and holds nothing focusable, because keyboard users would land on a 1 by 1 px box they cannot see; keep the control visible and put the hidden text inside it, and for a skip link use `nfsShowOnFocus`. A host inside a focusable control (the text of a button) is the intended use.

### API: `NfsShowOnFocus`

Selector `[nfsShowOnFocus]`; `exportAs: 'nfsShowOnFocus'`; standalone; no template; no inputs or outputs.

| Binding | Value |
| --- | --- |
| static `class` | `show-on-focus` |

- Documented usage (D9): the host is the focusable element itself, a link with an `href` or a button. `.show-on-focus` shows only the element that has focus, so on a wrapper around a link it stays hidden while the link has focus, and on an element Tab never reaches it never shows.
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

Implementation level: native platform. Visibility is Foundation's CSS media queries (`min-width`, `max-width`, `orientation`, `prefers-color-scheme`, `print`) and `visibility`; the visually hidden technique is `position: absolute` with `clip`; the skip link is a native link whose activation the browser handles before hydration and `nfsSmoothScroll` after. `@angular/aria` has no visibility, visually hidden, or skip-link pattern, and `@angular/cdk` adds nothing. The Angular layer is host bindings over `input()` signals and one `computed` class list. No render callback, no `effect`, no listener, no timer, no observer, no Breakpoint service.

Fallback: none needed. The risks, Foundation's combinations, the sticky placement, the focus behaviour of the two screen-reader classes, and the IE queries, were measured by this spec's ticket in three engines and Edge, and the print classes, alone and in every pair, by its re-run in the same engines.

### ARIA and keyboard

APG pattern: none. The skip link is WCAG technique G1 for 2.4.1; visually hidden text is technique C7.

| Element or state | Rendered semantics | Source |
| --- | --- | --- |
| `nfsVisibility` hidden by a breakpoint, orientation, colour scheme, sticky state, or `hideFor` | `display: none`: out of the accessibility tree and the tab order, for everyone (measured in Chromium's tree: a `.hide` paragraph and a `.show-for-medium` paragraph at 400 px are absent) | CSS; HTML-AAM |
| `showFor="print"` on screen | `display: none`: out of the accessibility tree on every screen (measured in Chromium's tree: a print-only paragraph is absent on screen and present under print emulation; a print-only `caption` leaves its table unnamed on screen) | Foundation's `foundation-print-styles` |
| `hideFor="print"` on screen | Unchanged: the element keeps its display, role, name, and tab stop (measured: a Print button inside is in Chromium's tree on screen and absent under print emulation) | Foundation's `foundation-print-styles` |
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
| Tab on a visually hidden control | Never happens under the documented usage: `nfsShowForSr` goes on no tabbable host and holds none | Consumer |

Focus: the directives move no focus. When a resize hides an element that has focus, the browser moves focus to the document body; the library does not follow it (Out of Scope). WebKit's Tab skips links unless the user turns on keyboard navigation (measured: Tab went past the skip link to the `tabindex="0"` target), which is Safari's platform behaviour; Option+Tab reaches the link there.

### WCAG 2.2 AA

The target is WCAG 2.2 level AA (user rule; ADR 0022). Each criterion below is a requirement with the layer that tests it; none is advice. Geometry and computed styles were measured in Chromium 153, Firefox 155, and WebKit 26.6 through Playwright 1.63, and in Edge 153, with axe-core 4.13.0 and the six WCAG 2.2 AA tags.

| Criterion | Requirement and how it is met | Foundation default | Test |
| --- | --- | --- | --- |
| 1.4.10 Reflow | Content hidden below a breakpoint exists in another form at that width: a navigation shown from `large` up has a jump menu or an Off-canvas panel below it, and each of a pair is the other's alternative. The directive cannot know content, so the docs require it and every story shows pairs. Zoom is covered by the same rule, since 400 percent zoom of a 1280 px window is a 320 CSS px viewport | The docs show single hidden paragraphs and say nothing about alternatives | e2e in three engines at 320 and 1100 px: in `visibility--alternatives` exactly one of each pair is displayed and it carries the same links; play function: exactly one displayed at the test viewport |
| 1.3.4 Orientation | `showFor` and `hideFor` with `'landscape'` or `'portrait'` only on an alternative presentation of content the other orientation also carries (a hint, a second layout), never on content available in one orientation only | The docs example is a hint pair; nothing is said | e2e in three engines in both orientations: exactly one of each `visibility--conditions` pair is displayed; play function the same at the test viewport |
| 2.4.1 Bypass Blocks | The skip link is the first focusable element of the page, `nfsShowOnFocus` on the link itself, with `nfsSmoothScroll` beside it and an `href` built from the live current path; the target is the `main` element with `tabindex="-1"` (D15) | Foundation's example puts the class on the link; its `href="#mainContent"` leaves the page under `<base href>` on any route but the base URL | Play function of `visibility--skip-link`; e2e in three engines; the fixture app's route under a deep path |
| 2.4.3 Focus Order | Activating the skip link moves focus into the main content, so the next Tab continues there; `tabindex="-1"` makes the target focusable without adding a tab stop | Foundation's `tabindex="0"` on `main` adds a tab stop that holds no control (measured: the second Tab lands on `main`) | `visibility--skip-link`: after Enter the next Tab reaches the first link inside `main`; e2e |
| 2.4.7 Focus Visible | No visually hidden element takes focus: `nfsShowForSr` goes on no tabbable host and holds none, and `nfsShowOnFocus` sits on the focused element itself (documented usage, D9). The revealed skip link keeps the browser's focus ring | A focused `.show-for-sr` input is a 1 by 1 px box, and `.show-on-focus` on a wrapper paints 0 pixels while its link has focus, in three engines; axe reports neither | `visibility--skip-link` asserts the focused link's box is larger than 1 by 1 px and its computed `outline-style` is not `none` |
| 2.4.11 Focus Not Obscured (Minimum) | The revealed skip link is in the flow at the start of the page, above any sticky header, so nothing covers it | Passes | e2e: the focused link's rectangle does not intersect a sticky Top Bar's in `visibility--skip-link` |
| 2.5.3 Label in Name | Visually hidden text that adds to a control's name follows the visible text ("Back" plus " to Products"), or names a control whose visible content is a glyph; it never precedes or replaces visible words | The docs examples have no visible text in their controls | Play function of `visibility--screen-reader-text` finds each control by a name that starts with its visible text |
| 3.3.2 Labels or Instructions | A form field's label is visible; visually hidden text never replaces it ([Spec: Switch](../issues/84-spec-switch.md), [Spec: Forms](../issues/98-spec-forms.md)) | Foundation's Switch names its input only with `.show-for-sr` text | Those specs' stories |
| 4.1.2 Name, Role, Value | Visually hidden text names an icon-only control; the directives change no role or state | Passes | axe `button-name` and `link-name` in every story; play functions find controls by `getByRole` and name |
| 4.1.3 Status Messages | A visually hidden status or alert region exists before its text changes and holds the whole message | Nothing is said | Play function of `visibility--screen-reader-text`: after the click the hidden status reads "Saved" and focus stays on the button |
| 2.5.8 Target Size (Minimum) | The revealed skip link passes through its spacing: axe's `target-size` passes it while focused, 17 px tall, beside a menu of links (measured); a consumer who styles it larger needs nothing more | Passes | axe in `visibility--skip-link` after the focus step |

The axe gate in every story runs the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, plus `best-practice`) with `parameters.a11y.test = 'error'` (ADR 0018). axe passed Foundation's docs markup verbatim and both focus failures above, so those failures are covered by the documented usage and the play functions, not the gate.

Print: no WCAG 2.2 criterion covers printed output. The screen side of the `print` condition follows D14: `showFor="print"` holds only what a printout adds to the screen page (the page address, a print date, a signature line), never information screen users need, and never the caption, label, or legend of something shown on screen; `hideFor="print"` hides only what means nothing on paper (a Print button, a toolbar, navigation). axe passed a page with a print-only header, a caption, and a hidden-in-print toolbar in three engines on screen and under print emulation, and did not report the print-only caption's unnamed table, so the rule is a documented requirement shown by `visibility--conditions`.

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

<!-- Print only, and screen only (block elements, D13) -->
<p nfsVisibility showFor="print">Printed from example.com/orders/42</p>
<div nfsVisibility hideFor="print"><button nfsButton type="button" (click)="print()">Print this page</button></div>

<p class="show-for-print">Printed from example.com/orders/42</p>
<div class="hide-for-print"><button class="button" type="button" jsaction="click:;">Print this page</button></div>

<!-- Inside a Sticky element -->
<div nfsStickyContainer>
  <div nfsSticky>
    <p nfsVisibility hideFor="sticky">We be scrolling...</p>
    <p nfsVisibility showFor="sticky">I'm going to rest here for a sec. You keep scrolling.</p>
  </div>
  <!-- The container also holds the content the element scrolls past: the Sticky range is the sticky element's parent (ADR 0019) -->
  <main>...</main>
</div>

<div class="sticky-container">
  <div class="sticky is-anchored is-at-top" ...>
    <p class="hide-for-sticky">We be scrolling...</p>
    <p class="show-for-sticky">I'm going to rest here for a sec. You keep scrolling.</p>
  </div>
  <main>...</main>
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

`close-button` and `type="button"` are the [Spec: Close Button](../issues/83-spec-close-button.md)'s bindings, `button` the [Spec: Button](../issues/37-spec-button.md)'s, the Print button's `jsaction` its consumer `(click)` handler's, and the Sticky element's classes and attributes the [Spec: Sticky](../issues/28-spec-sticky.md)'s; they are shown only to place them. Server and hydrated DOM are identical for every example: the classes are static host classes and host bindings on signal state, and the Zero breakpoint comes from a token that is the same on both platforms. Measured for the print pair with Angular 22.2.0's `renderApplication` over a stand-in directive that binds the same `computed` class list: the server HTML carries `show-for-print` and `hide-for-print`, merged with a static class of the consumer's (`class="lead show-for-print"`) and beside another condition (`class="hide-for-print show-for-dark-mode"`).

### Animation

None. Foundation's visibility partial declares no transition, and the library adds none: every class switches `display` or `visibility`, which Foundation does not animate. An element that must animate as it appears or disappears is a Toggler in visibility mode, whose typed Motion input animates it (building-blocks 1.6). No Motion classes and no `prefers-reduced-motion` override.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the server HTML carries every Visibility class exactly as the hydrated DOM does, and Foundation's media queries apply them at the viewport the page is shown at, so the first paint is right at every width, orientation, and colour scheme, with no Server breakpoint involved (building-blocks 1.7, CSS first; 1.11 decision 8).
- Before hydration: the directives touch no DOM outside host bindings, measure nothing, and start no timer.
- Full and incremental hydration: host binding values equal the server's, so hydration changes nothing and there is no structure to mismatch. The directives have no Hydration boundary of their own.
- Event replay: none of the three directives declares a listener or adds `jsaction`. A skip link's pre-hydration Enter or click is a native in-page jump, which the browser completes at once; after hydration `nfsSmoothScroll` handles it ([Spec: Smooth Scroll](../issues/29-spec-smooth-scroll.md)).
- `@defer`: library templates contain no `@defer`. Inside a dehydrated block, and inside `@defer (hydrate never)` for good, visibility keeps working, because it is CSS; a visually hidden live region there never updates, so live regions do not go in `hydrate never`. A block without a hydrate trigger renders its `@placeholder` on the server and stays its placeholder until its trigger fires, so a printout carries the placeholder, not the block's `showFor="print"` content (measured on the server: an `on viewport` block rendered its placeholder, while `hydrate never` and `hydrate on viewport` blocks rendered their content with `show-for-print`); print-only content goes outside such blocks.
- Prerendering: identical to server-side rendering; the directives read no request token.
- Print: the print classes are in the server HTML, so a page printed before hydration, or a prerendered page with JavaScript off, prints what it prints after hydration (measured on static HTML with no script under print emulation in three engines and Edge). Foundation's `show-for` queries are `screen` only and its `hide-for` queries include `print` up to `$print-breakpoint` (`large`), so a printout shows every `showFor` breakpoint element and hides every `hideFor` breakpoint element up to `large`, and with `$print-breakpoint: medium` it prints `hideFor="large"` and `hideFor="large only"` elements (measured); a pair written `hideFor="large"` and `showFor="large"` prints its large form. The page's width, orientation, and colour scheme change nothing in print (measured at 320 by 640, 1100 by 800, and 1300 by 800, light and dark): `showFor="landscape"`, `hideFor="portrait"`, and `hideFor="dark-mode"` print, and `showFor="portrait"`, `hideFor="landscape"`, and `showFor="dark-mode"` do not. Visually hidden text and the unfocused skip link print nothing: they stay 1 by 1 px and clipped (measured).

## Testing Decisions

A good test asserts what a user or assistive technology observes: the classes, the computed `display` and `visibility` at a known viewport, orientation, colour scheme, and medium, the accessibility tree membership and names, where focus lands, and the geometry of a focused element. No test reads the directives' fields. The patterns are the four layers of building-blocks 1.12, the [Spec: Label](../issues/94-spec-label.md)'s class-list tests, the [Spec: Responsive Toggle](../issues/24-spec-responsive-toggle.md)'s viewport e2e, and the [Spec: Smooth Scroll](../issues/29-spec-smooth-scroll.md)'s skip-link and focus tests, the nearest precedents.

Story ids follow `visibility--<story>`: `visibility--breakpoints`, `visibility--alternatives`, `visibility--hide-and-invisible`, `visibility--conditions`, `visibility--sticky`, `visibility--screen-reader-text`, `visibility--skip-link`. `meta.component` is `NfsVisibility`; `showFor`, `hideFor`, `invisible`, and `visible` are args of `visibility--breakpoints`. Stories use Foundation's default Class breakpoints only, so the library's Storybook program needs no Variant declaration file (ADR 0040). No story element carries a Foundation class written in the story. Layer 1 runs at the 414 px default viewport ([storybook-conventions.md](../storybook-conventions.md), section 4), so play functions assert classes and assertions that hold at any viewport; the viewport, orientation, colour-scheme, and print sweeps are layer 4.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Run by `npx nx test-storybook <lib>`. Every story runs axe with `parameters.a11y.test = 'error'` and the six tags (which include `button-name`, `link-name`, `aria-hidden-focus`, and `target-size`).

- `visibility--breakpoints`: Foundation's show and hide examples, each paragraph's text naming its range, plus the `showFor="medium" hideFor="large only"` range. Each element carries exactly the class of the mapping table for its value, and changing the `showFor` arg from `'medium'` to `'large only'` swaps `.show-for-medium` for `.show-for-large-only`; the `hideFor` bare-attribute and `'small'` paragraphs carry `.hide` and are not displayed.
- `visibility--alternatives`: a navigation (`nav` with `ul[nfsMenu]`) with `showFor="large"` and a jump-menu `select` inside a labelled form with `hideFor="large"`, both listing the same destinations; exactly one of the two is displayed at the test viewport, and it holds every destination (1.4.10).
- `visibility--hide-and-invisible`: a `hideFor` paragraph (computed `display: none`, absent from the accessibility tree), an `invisible` list keeping its height, and inside it a `visible` item, which is displayed with computed `visibility: visible` and found by `getByText`.
- `visibility--conditions`: a landscape and portrait pair of hints and a light and dark pair, each on a `div`, and a print pair: a `p` with `showFor="print"` holding the page address and a `div` with `hideFor="print"` holding a Print button; exactly one of each pair is displayed at the test viewport and colour scheme; on screen the Print button is found by `getByRole('button', {name: 'Print this page'})`, and the print-only paragraph is not displayed and is not in the accessibility tree.
- `visibility--sticky`: Foundation's sticky example inside `nfsStickyContainer` and `nfsSticky`, the container also holding a tall body (an inline height, Storybook conventions section 8); before any scroll the `hideFor="sticky"` title is displayed and the `showFor="sticky"` one is not.
- `visibility--screen-reader-text`: an icon-only close button named "Close" by `nfsShowForSr` text, a back button named "Back to Products" whose visible text is "Back", and a `role="status"` region with `nfsShowForSr`; each control is found by `getByRole` and its name; each hidden span's box is 1 by 1 px with computed `position: absolute`; after the story's Save button is clicked, the status region's text is "Saved" and focus stays on the button.
- `visibility--skip-link`: an application shell whose first element is the skip link (`nfsShowOnFocus nfsSmoothScroll`, `href="#visibility-main"`, in-page in the story iframe, which has no `<base href>`, as the Smooth Scroll stories do), a Top Bar navigation, and `main` with `tabindex="-1"`. Before focus the link's box is 1 by 1 px and it is found by `getByRole('link', {name: 'Skip to content'})`; after `userEvent.tab()` it has focus, its box is larger than 1 by 1 px, and its computed `outline-style` is not `none`; after Enter, `main` has focus; the next Tab reaches the first link inside `main`; axe runs after the focus step.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

TestBed specs next to the directives over a bare test host component, zoneless with `await fixture.whenStable()`; no story is mounted and no axe runs here.

- Class mapping, driven by data: every `showFor` and `hideFor` value of the mapping table, including the Zero-breakpoint gaps, sets exactly its class, with the default Breakpoint map and with a provided `nfsBreakpointsToken` whose Zero breakpoint has another name (values the library's closed types reject are bound through a typed cast); `hideFor` as the bare attribute, `true`, and `'true'` set `.hide`, and `false`, `'false'`, and no value set none; `invisible` and `visible` set their classes; a cast value that is not a breakpoint query or condition, and one containing a space, set none; changing a value swaps its class and leaves the consumer's own static class and `[class]` binding alone; the directive adds no attribute.
- `nfsShowForSr` and `nfsShowOnFocus` bind their static classes, and a redundant copy merges with them.
- Copied classes: a static `class="show-for-medium"` beside `showFor="large"` keeps both classes, because the list binds only the classes the inputs select.
- Zoneless: the suite runs with zoneless change detection; no test needs `NgZone`.

### 3. Node-level Vitest

- SSR smoke through the shared `renderServer()` helper, under `npx nx test <lib>`: a fixture with one element per mapping-table row, the sticky example, the visually hidden button text and status region, and the skip link with `nfsSmoothScroll`. `whenStable()` resolves; the server HTML carries every class of the mapping table, `show-for-sr`, and `show-on-focus`; no element carries `jsaction` except the skip link, from `nfsSmoothScroll`.
- Pure logic: the class mapping function, table-driven over every input and value, including the Zero-breakpoint gaps under a renamed Zero breakpoint.

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
  | print at 1100 (`emulateMedia`) | every `showFor` breakpoint element, `showFor="print"`, `showFor="landscape"`, `hideFor="dark-mode"` | `hideFor="small only"`, `hideFor="medium"`, `hideFor="medium only"`, `hideFor="large"`, `hideFor="large only"`, `hideFor`, `hideFor="print"`, `showFor="portrait"`, `showFor="dark-mode"` |
  | print at 320 by 640, and print at 1100 under the dark colour scheme (`emulateMedia`) | the same as print at 1100 | the same as print at 1100 |
  | forced colours at 1100 (`emulateMedia`) | the same as 1100 by 800 | the same as 1100 by 800 |

  In every screen state `hideFor="print"` is displayed and `showFor="print"` is not; in print the `showFor="print"` paragraph's computed `display` is `block`.

- Reflow (1.4.10) and orientation (1.3.4): at 320 by 640 and 1100 by 800, and at 600 by 320 and 320 by 600, exactly one of each pair in `visibility--alternatives` and `visibility--conditions` is displayed.
- Sticky: scrolling `visibility--sticky` until the Sticky element carries `.is-stuck` displays the `showFor="sticky"` title and hides the `hideFor="sticky"` one; scrolling back restores both.
- Skip link: in Chromium and Firefox a real Tab from the page start focuses the link and shows it; in WebKit the link is focused with `focus()`, because WebKit's Tab skips links by default (measured); in all three the focused box is larger than 1 by 1 px, does not intersect the sticky Top Bar, and Enter moves focus to `main`.

Against the prerendered fixture app, on the Visibility route and on a deep route of the same page (`/visibility/nested`):

- JavaScript disabled, at 320 and 1100 px, on screen and under print emulation: screenshot plus axe (`@axe-core/playwright` with the six tags) on the server HTML; the displayed elements match the table above before any script runs.
- Hydration: no NG05xx in the console and `ngDevMode.componentsSkippedHydration === 0`.
- The skip link on the deep route: its `href` is the deep route's path with `#main-content`, and Enter after hydration keeps the URL and focuses `main`.

Manual release test (ADR 0022): with NVDA on Firefox and Chrome, JAWS on Chrome, and VoiceOver on Safari, `visibility--skip-link` announces the skip link from the virtual cursor before it is shown, and activating it moves the reading position into the main content; `visibility--screen-reader-text` announces "Close", "Back to Products", and "Saved".

## Out of Scope

- `.show-for-ie` and `.hide-for-ie`: they detect Internet Explorer 10 and 11 through the non-standard `-ms-high-contrast` media feature, which no browser of the Browser target matches (measured in Chromium 153, Firefox 155, WebKit 26.6, and Edge 153, with and without forced colours), so `.show-for-ie` always hides and `.hide-for-ie` does nothing (D6). Category: `platform-or-a11y`.
- A `hide-for-sr` directive or input: Foundation has no such class and advises `aria-hidden="true"`, the native attribute, which the consumer writes on purely visual elements (D16). Category: `platform-or-a11y`.
- Showing or hiding from JavaScript (an `@if` over the Breakpoint service, a structural directive, a `hidden` binding per breakpoint): a server render knows no viewport, so it would render the Server breakpoint's answer and change it at hydration; Foundation's media queries are right from the first byte (D12; building-blocks 1.7 and 1.11 decision 8). Category: `platform-or-a11y`.
- Moving focus when a resize hides the focused element: which element is its equivalent is the consumer's knowledge; the Responsive Toggle and Responsive Accordion Tabs keep focus for their own swaps. Category: `other`.
- Visibility classes for breakpoints outside `$breakpoint-classes`: Foundation's own setting generates them; the consumer adds the breakpoint there and to its Variant declaration file, and the types follow (the Responsive Toggle's `nfs-responsive-toggle(<bp>)` stays that spec's, for its open `hideFor` Option). Category: `other`.
- A library rule that stops the orientation and dark-mode classes from forcing `display: block`: a block wrapper avoids it with no library CSS, while the rule would override Foundation's `!important` declarations with the library's own copy of them (D13). Category: `other`.
- A library rule that gives a print-only `li`, `caption`, `tfoot`, inline element, or flex or grid container its own display back in print: paper layout, not an accessibility failure, which a block wrapper avoids, while the rule would copy Foundation's `!important` print rule (D13). Category: `other`.
- Foundation's other print rules (black text on transparent backgrounds, a link's `href` after its text, borders on `pre` and `blockquote`, page-break rules, the `@page` margin) and their settings `$print-transparent-backgrounds` and `$print-hrefs`: base element styles of the Typography Base page with no class to manage (ADR 0039), and Sass booleans stay compile-time configuration (AGENTS.md Design Philosophy 5). Category: `scope-boundary`.
- `.print-break-inside`, the other class `foundation-print-styles` prints (it lets a `pre`, `blockquote`, or `tr` break across pages; no engine breaks an image), and `.ir`, a class its print rule reads (`.ir a:after`) that no Foundation rule styles and no docs page names: neither decides whether an element shows, so neither is a Visibility class; `.print-break-inside` is the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s `nfsPrintBreakInside`, and `.ir` is dropped there (`deprecated-upstream`) ([Re-run: Typography Helpers spec for the print helper classes](../issues/144-rerun-typography-helpers-print-classes.md)). Category: `scope-boundary`.
- The printed address after in-page links written with the current path: Foundation's print rule appends a link's `href` and exempts only an `href` starting with `#`, so the current-path links of [ADR 0038](../adr/0038-smooth-scroll-same-document-links.md) print their address (measured in three engines and Edge); that rule and those links are the [Spec: Smooth Scroll](../issues/29-spec-smooth-scroll.md)'s, and a navigation made of them can take `hideFor="print"`. Category: `scope-boundary`.
- A site theme switch for the dark-mode classes: Foundation's classes follow the user's system `prefers-color-scheme` only; a theme toggle of the application's own is the application's CSS. Category: `scope-boundary`.
- The Visibility classes Plugin directives bind for their own behaviour: the Responsive Toggle's `.hide-for-<bp>` and `.show-for-<bp>` ([Spec: Responsive Toggle](../issues/24-spec-responsive-toggle.md)) and the Nested menu's `invisible` on Drilldown levels ([Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md)). Category: `scope-boundary`.
- `.is-hidden` (Foundation's global styles), which the library binds with `hidden` where a Foundation rule sets `display` (building-blocks 1.10). Category: `scope-boundary`.
- `.is-stuck` and the Sticky element's other State classes: the [Spec: Sticky](../issues/28-spec-sticky.md). Category: `scope-boundary`.
- The skip link's scrolling and focus move, and the base-href rule for its `href`: the [Spec: Smooth Scroll](../issues/29-spec-smooth-scroll.md) and [ADR 0038](../adr/0038-smooth-scroll-same-document-links.md). Category: `scope-boundary`.
- Images that differ by colour scheme or viewport: `<picture>` with `media` sources, which download one image, the [Spec: Interchange](../issues/35-spec-interchange.md)'s rule for images. Category: `platform-or-a11y`.
- The Variant registries, the helper types, the manifest rows, and the declaration-file generator: [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md); `nfs-breakpoint-properties`: [Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md). Category: `scope-boundary`.
- Runtime theming through custom properties (building-blocks 1.13). Category: `scope-boundary`.

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | Three attribute directives in `ngx-foundation-sites/visibility`: `[nfsVisibility]` (`NfsVisibility`) for the conditional and generic hiding classes, and `[nfsShowForSr]` (`NfsShowForSr`) and `[nfsShowOnFocus]` (`NfsShowOnFocus`), each binding one class | ADR 0039 gives utility families directives; building-blocks 1.3 lets a utility family's spec name them: the family's shared directive takes the docs page's name, a single-class directive its class's name (1.3's class rule); the screen-reader classes keep a different contract (visible to assistive technology) with usage rules of their own, and a dozen first-milestone specs, which write Foundation's `.show-for-sr` until this spec lands, get `nfsShowForSr` back then (What the later milestone changes, per spec); one entry point per docs page | A directive per class template with the query as its selector input (`nfsShowFor="medium"`, `nfsHideFor`, `nfsInvisible`): building-blocks 1.4 names the inputs `showFor` and `hideFor`, one directive's value says nothing about the other's for the combination rules, and it adds five public classes (`other`); `.show-for-sr` and `.show-on-focus` as `nfsVisibility` inputs (a different contract behind one attribute, and a rename in the dozen specs that get `nfsShowForSr` back) (`other`); a skip-link component (Foundation's skip link is the consumer's link with one class; ADR 0001) (`scope-boundary`); consumer-written classes (ADR 0039) (`variant-as-class`) |
| D2 | `showFor` and `hideFor` take `NfsClassBreakpointQuery<'up' \| 'only'>`, named with Foundation's words; no `down` | ADR 0040 and building-blocks 1.4: an on or off responsive family takes a Breakpoint query whose modifiers are those Foundation generates classes for, and a `<words>-for-<bp>` class keeps Foundation's words (the rule's own example is `showFor="large only"`); Foundation generates `show-for-<bp>`, `-only`, `hide-for-<bp>`, and `-only`, never a `down` form; closed over `$breakpoint-classes`, so a misspelt or undeclared breakpoint fails to compile | A `down` modifier mapped to the next breakpoint's `hide-for` class (a second spelling that has no class for the last Class breakpoint, where the type could not know it) (`other`); one input per breakpoint (`mediumUp`) (ADR 0040 rule 5) (`other`); a rule string (its tokens would be Foundation class names) (`variant-as-class`) |
| D3 | Zero-breakpoint gaps: `showFor` at the Zero breakpoint's `up` form sets no class; `hideFor` written alone, `true`, or at the Zero breakpoint's `up` form sets `.hide` | Foundation generates neither `show-for-<zero>` nor `hide-for-<zero>` and names `.hide` for "always hidden"; building-blocks 1.4 maps each value to the one class with its meaning, as `expanded="small"` sets `.expanded`; `.hide` is the unconditional form of the hide family, as `.expanded` is of the expanded family; the Zero breakpoint comes from `nfsBreakpointsToken`, the same on server and client | A separate `hide` boolean (ADR 0040 rule 5 folds the unconditional form into the family's input) (`other`); a class for `showFor` at the Zero breakpoint (Foundation generates none, and a bound value uses it to mean "shown at every width") (`other`); binding `hidden` in place of `.hide` (`[hidden]` loses to a Foundation component's `display` rule, building-blocks 1.10) (`platform-or-a11y`) |
| D4 | The conditions are values of the same two inputs: `'landscape'`, `'portrait'`, `'dark-mode'`, `'sticky'`, and `'print'` (D20); one value per input; the combinations Foundation's CSS cannot give and the sticky placement are documented usage | Foundation's classes are `show-for-<condition>` and `hide-for-<condition>`, so its words hold; measured in four engines, the orientation rules and `.show-for-dark-mode` set `display: block !important` and override a breakpoint class or `.hide` on the same element, while `.hide-for-dark-mode` and the sticky rules combine; `.show-for-sticky` on the Sticky element itself never shows | An `orientation` input (Menu and Tabs already take `orientation` for `.vertical`, and Angular sets one attribute on every directive of the element that declares the input) (`other`); a `colorScheme` input (Foundation's word is `dark-mode`) (`other`); lists of conditions per input (they would promise combinations the CSS does not give) (`other`) |
| D5 | `invisible` and `visible` booleans through `nfsVariantBoolean`; setting both on one element is documented as pointless | Building-blocks 1.4 rule 4: two single classes that come from no Sass setting or loop are booleans named after their classes; `.visible` exists to show a descendant of an `invisible` element, so the two sit on different elements in every meaningful use | One enum input `visibility: 'invisible' \| 'visible'` (rule 3 needs one setting or loop, and the name would repeat the directive's) (`other`); `booleanAttribute` (lets `invisible="flase"` compile and set the class) (`other`) |
| D6 | `.show-for-ie` and `.hide-for-ie` are dropped, and the documentation gives the reason | Measured in Chromium 153, Firefox 155, WebKit 26.6, and Edge 153, with and without forced colours: no engine matches `-ms-high-contrast`, so the classes are constant; Internet Explorer is outside the Browser target | A `showFor="ie"` value (an input whose value can never change anything) (`platform-or-a11y`) |
| D7 | Plugin directives that own a Visibility class for their own behaviour keep binding it and never host `NfsVisibility`; `nfsVisibility` stays off their elements (documented usage) | The Responsive Toggle binds `hide-for-<bp>` and `show-for-<bp>` from class records over the Breakpoint map, driven by its open `hideFor` Option with library CSS for breakpoints outside `$breakpoint-classes`; the Nested menu binds `invisible` on Drilldown levels as a State class; two owners of one class on one element resolve by binding priority, and a `false` wins over a `true` in a lower-priority binding; and the Responsive Toggle's Option is also named `hideFor`, so one attribute on a shared element would set both directives' inputs | The Responsive Toggle hosting `NfsVisibility` (it would expose `showFor` and `hideFor` on the bar and the menu, and the closed Class-breakpoint type cannot express its open Option) (`other`) |
| D8 | One `computed` class list of the selected classes, not a record of the family set to `false`; copied Visibility classes are not stripped, and the documented usage sets every class through the inputs | A record would contradict the Responsive Toggle's and the Nested menu's records on shared keys; the Label's and Badge's list binding (their D7) | A record that strips copies (fights Plugin directives on the same element) (`other`) |
| D9 | Documented usage: `nfsShowForSr` goes on no tabbable host and holds nothing tabbable; `nfsShowOnFocus` goes on the tabbable element itself | Measured in three engines: a focused `.show-for-sr` input is a 1 by 1 px box (2.4.7), and `.show-on-focus` on a wrapper paints 0 pixels while its link has focus; axe reports neither; the Forms spec already rejected the label-as-button file upload over a visually hidden input | Library CSS revealing a focused `.show-for-sr` element (it would show text the author meant to hide, and duplicate `.show-on-focus`) (`other`) |
| D10 | Five documented-usage rules on `NfsVisibility`, in its JSDoc: no copied classes, no combination Foundation's CSS cannot give (the print pairs among them, D21), sticky conditions inside a Sticky element, one owner of the Visibility classes per element, not `invisible` with `visible` | Each rule states a measured or source-confirmed failure the compiler and axe cannot see | Library CSS or directive logic that resolves the pairs (a copy of Foundation's `!important` rules, D13) (`other`) |
| D11 | No Variant property of its own; the breakpoint values are typed from `--nfs-breakpoint-classes` | `nfs-breakpoint-properties` is the one writer of `--nfs-breakpoint-classes`; the conditions and the booleans are closed | A Variant property of the family's own (nothing in the family's own Sass is open) (`other`) |
| D12 | CSS first: no JavaScript decides visibility, and nothing reads the viewport | The ticket's known constraint and building-blocks 1.7 and 1.11 decision 8: Foundation's media queries make server HTML right at every width, in dehydrated blocks, and in `hydrate never` | An `@if` over `NfsMediaQuery` or a structural directive (renders the Server breakpoint's answer and swaps at hydration) (`platform-or-a11y`) |
| D13 | No Library mixin and no library CSS; the forced `display: block` of the orientation and dark-mode classes, and of `.show-for-print` in print, is documented: put those conditions on a block element or wrapper | Foundation's CSS covers every class the inputs set; the forced block is layout, not an accessibility failure, and a wrapper avoids it; measured in four engines, a print-only `li`, `caption`, `tfoot`, `img`, `span`, `a.button`, flex `.menu`, and `.grid-x` print as `block`, while a table and its head, body, rows, and cells keep their table displays; the Variant property is `nfs-breakpoint-properties`'s | An `nfs-visibility` rule overriding Foundation's orientation and dark-mode rules without `display: block` (a library copy of Foundation's `!important` rules) (`other`); an `nfs-visibility` rule giving print-only list items, table parts, and flex or grid containers their displays back in print (the same copy, for paper layout) (`other`) |
| D14 | Content rules, stated as requirements and shown by every story: hide only a presentation another element also carries (1.4.10, 1.3.4); visually hidden text follows a control's visible text or names a glyph (2.5.3); a form field keeps a visible label (3.3.2); `showFor="print"` holds only what a printout adds, never information screen users need and never the caption, label, or legend of something on screen, and `hideFor="print"` only what means nothing on paper | Hidden content is hidden from assistive technology too, so a lone hidden element is lost to everyone at that width or orientation, and print-only content on every screen (measured: a print-only `caption` leaves its table unnamed in Chromium's tree, and axe is silent); the directive cannot read meaning, so the requirement is content, as the Callout's, Label's, and Progress Bar's are; no WCAG 2.2 criterion covers printed output | Directive logic that decides which element is the alternative (the directive cannot read meaning) (`other`); a rule for `showFor="print"` on a `caption`, `label`, or `legend` alone (any `showFor` or `hideFor` value on those elements loses the same name at some width, which the content rule covers) (`other`) |
| D15 | The skip link recipe: `<a nfsShowOnFocus nfsSmoothScroll [href]="path() + '#main-content'">` first in the shell, with the Smooth Scroll spec's live current path, and `<main id="main-content" tabindex="-1">`; Foundation's `tabindex="0"` and `role="main"` dropped | ADR 0038: a bare `#` link leaves the page under `<base href>`; `nfsSmoothScroll` focuses the target after hydration, and `tabindex="-1"` lets the browser focus it natively before, without a tab stop (measured: `tabindex="0"` makes `main` the next tab stop); `role="main"` repeats the element's role | A `nfsShowOnFocus` that scrolls and focuses itself (duplicates `nfsSmoothScroll`, which may sit on any element, building-blocks 1.9) (`other`); `routerLink` with `fragment` (the Router scrolls but moves no focus) (`platform-or-a11y`) |
| D16 | No `hide-for-sr` directive: `aria-hidden="true"` is the consumer's native attribute on purely visual elements | Foundation's own advice; building-blocks 1.10 keeps `aria-hidden` out of the library's hiding and leaves it for masking visuals; axe's `aria-hidden-focus` guards its misuse | A directive binding `aria-hidden` (a second spelling of a native attribute, with no class to manage) (`platform-or-a11y`) |
| D17 | Native implementation level; no Aria and no CDK | CSS media queries, `visibility`, and the visually hidden technique cover the family | CDK's `BreakpointObserver` (D12) (`platform-or-a11y`) |
| D18 | Seven stories that hold at the 414 px test viewport, the print pair in `visibility--conditions`; e2e for the viewport, orientation, colour-scheme, print, and forced-colours sweep, sticky scrolling, and the skip link in three engines; the fixture app for first paint on screen and in print, hydration, and the deep-route skip link; a manual screen-reader release test | Media queries need real viewports and emulated media, and a play function runs on screen only; WebKit's Tab behaviour needs its own path (measured); announcements need assistive technology | An Anti-pattern story for visually hidden focus (axe is silent on it, so there is no rule to switch off; D9's documented usage covers it) (`other`) |
| D19 | Glossary: **Visibility class** widened to the whole family, the print pair included (D20); **Visually hidden** and **Skip link** added | The specs say "screen-reader-only directive", "Visibility Classes directive", and "visually hidden text" for one idea; the existing term named only the breakpoint classes | "Screen-reader-only class" as the term (describes one technology, and the text also serves braille and speech input) (`other`) |
| D20 | `'print'` is a fifth condition of `showFor` and `hideFor`, setting Foundation's `.show-for-print` and `.hide-for-print`, which `foundation-print-styles` (inside `foundation-typography`) prints and the Typography Base page documents; the condition part of the types stays closed | Foundation's words are `show-for-print` and `hide-for-print`, the `<words>-for-<condition>` shape of the other conditions, and the classes decide one effect, whether the element shows, the Visibility shape that building-blocks 1.3 and ADR 0044's consequences give this family; the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md) sent them here (its D16); one directive holds both inputs for the combination rules (D21); one value per input loses little, because every `hideFor` breakpoint up to `$print-breakpoint` already hides in print and every `showFor` breakpoint already prints (measured), so only a `hideFor` above `$print-breakpoint`, `hideFor="dark-mode"`, or `hideFor="sticky"` together with print needs a wrapper element | One directive for `foundation-print-styles` under ADR 0044's clause 1 (`NfsPrintStyles` with `nfsShowForPrint` and `nfsHideForPrint`, in the Typography Helpers entry point) (the directive of that name exists and holds only `nfsPrintBreakInside`): a second directive setting Visibility classes on one element beside `nfsVisibility` (D7), and a spelling unlike every other `show-for-<condition>` class (`other`); `showForPrint` and `hideForPrint` booleans on `nfsVisibility` (D4 makes Foundation's conditions values of its show and hide words, and booleans would let print sit beside an orientation, which the CSS cannot give) (`other`); lists of values per input so print can join a breakpoint (D4) (`other`) |
| D21 | The print pairs as documented usage: `showFor="print"` takes no `hideFor` value; `hideFor="print"` beside an orientation follows the orientation rule, except `showFor="portrait"`; `showFor="dark-mode"` with `hideFor="print"` combines | Measured in four engines under `foundation-everything`'s include order, in which the print styles come before the Visibility classes, so an `!important` Visibility rule of equal specificity wins in print: beside `.show-for-print` every `hide-for` class up to `$print-breakpoint`, `.hide`, and `.hide-for-print` hide the element everywhere, the orientation hide classes show it on screen in one orientation, and the rest have no effect; `.show-for-landscape` prints beside `.hide-for-print`; `.show-for-portrait` and `.show-for-dark-mode` already hide in print, so their pairs with `.hide-for-print` print right; axe sees none of this | Library CSS making the pairs combine (a library copy of Foundation's `!important` rules, D13) (`other`); ruling out `showFor="portrait"` and `showFor="dark-mode"` beside `hideFor="print"` too (measured right in both include orders) (`other`); allowing `showFor="print"` beside the hide classes above `$print-breakpoint` (they change nothing beside it, so no such pair is worth writing) (`other`) |

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
  <!-- The container also holds the content the element scrolls past: the Sticky range is the sticky element's parent (ADR 0019) -->
  <main>...</main>
</div>

<!-- A navigation shown from large up and never printed: hideFor="print" combines with a breakpoint -->
<nav nfsVisibility showFor="large" hideFor="print" aria-label="Site">...</nav>

<!-- A print-only list item prints as a block (D13), so the print-only content is a block of its own -->
<ul>
  <li>Pen</li>
</ul>
<p nfsVisibility showFor="print">Prices as of the print date.</p>
```

The skip link in an application shell under `<base href>`, with the [Spec: Smooth Scroll](../issues/29-spec-smooth-scroll.md)'s live current path, which follows every navigation because the shell outlives them:

```ts
@Component({
  selector: 'app-root',
  imports: [NfsShowOnFocus, NfsSmoothScroll, RouterOutlet, SiteHeader],
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

`NfsVisibility`, `NfsShowForSr`, and `NfsShowOnFocus` come from `ngx-foundation-sites/visibility`; `NfsSmoothScroll`, `NfsButton`, `NfsMenu`, `NfsSticky`, and `NfsStickyContainer` from their own entry points, and are shown only to place them. `SiteHeader` is the application's own header component, such as the [Spec: Top Bar](../issues/86-spec-top-bar.md)'s usage example.

### Platform features to adopt when the browser target moves

- Scroll-state container queries (`@container scroll-state(stuck: top)`) could show and hide content inside a stuck element without the Sticky directive's `.is-stuck`; Foundation's sticky classes would still need that class, so the library would adopt it only with a Foundation rule that uses it.

### Foundation behaviour changed or dropped

- `.show-for-ie` and `.hide-for-ie` are gone (D6).
- The skip link's target is `tabindex="-1"` without `role="main"`, its `href` is the live current path, and `nfsSmoothScroll` moves focus after hydration (D15).
- The docs gain the content rules: hidden content has a displayed alternative, orientation content exists in both orientations, visually hidden text follows visible text, print-only content only adds to the screen page (D14).
- Combining an orientation condition or `showFor="dark-mode"` with another value, and a sticky condition outside a Sticky element, are documented as unsupported (D4).
- The print classes, which Foundation documents on its Typography Base page, are the `print` condition of the Visibility inputs, and combining `showFor="print"` with any `hideFor` value is documented as unsupported (D20, D21).

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This entry point relies on Foundation's export mixin `foundation-visibility-classes` (part of `foundation-everything`), configured through `$breakpoint-classes`, `$breakpoints`, and `$print-breakpoint`; the `print` condition also needs `foundation-print-styles`, which `foundation-typography` includes (part of `foundation-everything`, before `foundation-visibility-classes`); the sticky conditions also need the Sticky spec's `foundation-sticky` and `nfsSticky`. No library CSS; there is no `nfs-visibility` mixin.

1. Rules: none.
2. Reused, read from the consumer's compile: every class above, as `foundation-visibility-classes` and, for the print pair, `foundation-print-styles` print them.
3. Custom properties the directives write: none.
4. Motion classes: none, and no `prefers-reduced-motion` override, because nothing animates.
5. Missing include: without `foundation-visibility-classes` every element shows and every visually hidden text is visible at full size; without `foundation-typography` (or `foundation-print-styles`) every `showFor="print"` element shows on screen and every `hideFor="print"` element prints; without `@include nfs-breakpoint-properties;` the Variant declaration file's generator cannot list the Class breakpoints, so a Class breakpoint the consumer added fails to compile.
6. Variant properties: none of its own. `showFor` and `hideFor` loop over `$breakpoint-classes`, whose property, `--nfs-breakpoint-classes`, `nfs-breakpoint-properties` writes.

No required setting: Foundation's defaults pass every criterion this entry point touches.

### Notes

- Two directives on one element: `nfsVisibility` binds only Visibility classes, so it sits beside `nfsButton`, `nfsMenu`, `nfsCallout`, or a Trigger on the same element; the Button's `inline-block`, the Menu's flex row, and the Callout's block keep their `display` where the element shows, because the breakpoint classes set `display` only where they hide.
- A Drilldown level's `invisible` is the Nested menu's State class; `visible` belongs on elements no library directive hides.
- RTL: nothing flips; the visually hidden box is 1 by 1 px, clipped, at its static position, and no rule or `Directionality` is needed.
- Forced colours: measured, a Windows contrast theme changes no computed `display` or `visibility` of any class.
- Include order: the print results in this spec hold for `foundation-everything`'s order, typography before the Visibility classes. A consumer who includes `foundation-visibility-classes` first changes which `!important` rule wins in print (measured: every `showFor="print"` pair then prints as the element would alone), and D21's documented pairs hold either way.
- A visually hidden live region is not `aria-live` on a hidden element: `.show-for-sr` keeps it in the accessibility tree, which a `hidden` region is not, so it announces.

### What the later milestone changes, per spec

In the first milestone no spec names this spec's directives or links to it. Where a first-milestone spec needs a Visibility class, its examples, stories, and tests write Foundation's own class as a normal class, with Foundation's global styles loaded ([Decide: grids, typography, and utilities move to a later milestone](../issues/174-decide-grids-typography-utilities-later-milestone.md), decisions 2 and 5). When this spec lands, the later milestone replaces those classes with this spec's directives, imported from `ngx-foundation-sites/visibility`, and gives each spec back the sentences that name them. The list is read from the directives and links each spec wrote before the ruling; [Re-run: specs without the later-milestone families, group a](../issues/176-rerun-specs-without-later-families-group-a.md), [Re-run: specs without the later-milestone families, group b](../issues/177-rerun-specs-without-later-families-group-b.md), and [Re-run: specs without the later-milestone families, group c](../issues/178-rerun-specs-without-later-families-group-c.md) hold the class forms each spec writes now.

`class="show-for-sr"` becomes `nfsShowForSr` in:

- [Spec: Abide](../issues/31-spec-abide.md): a visually hidden Form alert, beside `nfsAbideAlert`.
- [Spec: Badge](../issues/93-spec-badge.md): the hidden text inside a badge.
- [Spec: Button](../issues/37-spec-button.md): the text of an icon-only or arrow-only button.
- [Spec: Button Group](../issues/82-spec-button-group.md): the split button's arrow-only text.
- [Spec: Drilldown Menu](../issues/22-spec-drilldown-menu.md): the back buttons' hidden suffix (that spec's D29).
- [Spec: Dropdown](../issues/26-spec-dropdown.md): the name of the split button's arrow-only Trigger.
- [Spec: Label](../issues/94-spec-label.md): an icon-only label's text (`label--icons`).
- [Spec: Menu](../issues/85-spec-menu.md): an icon-only link's text.
- [Spec: Orbit](../issues/33-spec-orbit.md): the arrows' and bullets' text (that spec's D26).
- [Spec: Responsive Menu](../issues/23-spec-responsive-menu.md): the back items' hidden suffix.
- [Spec: Responsive Toggle](../issues/24-spec-responsive-toggle.md): the hamburger's name given as hidden text; the bar's and menu's own Visibility classes stay that spec's bindings (D7).
- [Spec: Top Bar](../issues/86-spec-top-bar.md): a menu icon's name given as hidden text.
- [Spec: Breadcrumbs](../issues/88-spec-breadcrumbs.md), [Spec: Pagination](../issues/87-spec-pagination.md), and [Spec: Switch](../issues/84-spec-switch.md): the lines that say their recipes need no visually hidden text name `nfsShowForSr` again.
- [Spec: Forms](../issues/98-spec-forms.md): the File Upload Button's `.show-for-sr` row, the line on other families' classes, and the Out of Scope line on the label-as-button file upload name `nfsShowForSr` again.
- [Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md): D30's rejected alternative, Foundation's `.show-for-sr` class, names `nfsShowForSr` again.

The other Visibility classes become `nfsVisibility` in:

- [Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md): the CSS-only example, `class="show-for-large"`, becomes `nfsVisibility showFor="large"`, the WCAG 1.4.4 row's e2e fixture, which writes `.show-for-medium` as a normal class, sets it with `nfsVisibility showFor="medium"` again, and `NfsVisibility` rejoins the directives with a responsive Variant input that read the Zero breakpoint from `nfsBreakpointsToken`.
- [Spec: Magellan](../issues/30-spec-magellan.md): the jump menu's `class="hide-for-large"` and the navigation's `class="show-for-large"` become `nfsVisibility hideFor="large"` and `nfsVisibility showFor="large"`.
- [Spec: Menu](../issues/85-spec-menu.md): a plain menu's items shown or hidden by breakpoint name `nfsVisibility` again.
- [Spec: Off-canvas](../issues/25-spec-off-canvas.md): the Trigger hidden at the reveal breakpoint, `class="hide-for-large"`, becomes `nfsVisibility hideFor="large"` in that spec's usage rule, its stories, and its usage example.
- [Spec: Responsive Embed](../issues/96-spec-responsive-embed.md): the composition bullet, which names Foundation's visibility classes, names this spec's directives again.
- [Spec: Thumbnail](../issues/97-spec-thumbnail.md): the hiding rule's `class="hide"` becomes `nfsVisibility` with a bare `hideFor` (that spec's D9).
- [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md): the manifest row of `NfsVisibility` comes back; its breakpoint values read `NfsBreakpointClassesOverrides`, which stays in the first milestone.
- The Variant declaration tooling's Known `mixins` and `uses` entries for this spec, which [Re-run: specs without the later-milestone families, group c](../issues/178-rerun-specs-without-later-families-group-c.md) removed from that spec's manifest; they come back with this spec, as that spec listed them at commit d5a1eee:
  - Known `uses` under `NfsBreakpointClassesOverrides`: [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md) adds `{entryPoint: 'ngx-foundation-sites/visibility', directive: 'NfsVisibility', input: 'showFor', alias: 'NfsVisibilityShowFor', shape: 'query'}` and `{entryPoint: 'ngx-foundation-sites/visibility', directive: 'NfsVisibility', input: 'hideFor', alias: 'NfsVisibilityHideFor', shape: 'query'}`.
