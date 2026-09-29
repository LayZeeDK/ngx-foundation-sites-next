# Spec: Prototyping Utilities

Ticket: [Spec: Prototyping Utilities](../issues/102-spec-prototyping-utilities.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Written under the class rule ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)) and the Variant typing rules ([ADR 0040](../adr/0040-variant-input-types.md)). The first utility family spec: its Utility directive rule (Implementation Decisions) is the shape the [Spec: Float Classes](../issues/105-spec-float-classes.md) and the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md) follow.

## Problem Statement

A developer on Foundation for Sites who wants to turn a sketch into a working page quickly turns on Foundation's Prototype mode and writes its Prototyping Utilities: classes for spacing (`.margin-top-1`, `.padding-2`), sizing (`.width-50`), display, overflow, position, borders, rounded corners, shadows, arrows, separators, font styling, list styles, and text helpers. Prototype mode is off by default; the developer opts in through `foundation-everything($prototype: true)`, `foundation-prototype-classes`, or one export mixin per family, and can turn on a responsive form of almost every class (`.medium-margin-1`) through one Sass flag per family. With Foundation's three Class breakpoints that is 123 classes, and 357 with every flag on (counted from the compiled CSS). The markup contract leaves the hard parts to the author:

- Foundation resolves overlapping classes by source order, not by which class is more specific. Measured in Chromium, Firefox, and WebKit: `class="margin-2 margin-top-1"` gives a 2rem top margin, because `.margin-2` is printed after `.margin-top-1`; `margin-horizontal-2 margin-left-1` gives a 2rem left margin; `overflow-scroll overflow-x-hidden` scrolls horizontally. Whether a side class wins depends on its number.
- Foundation prints the responsive spacing classes spacer by spacer, not breakpoint by breakpoint, so a larger breakpoint that asks for less spacing loses. Measured in three engines at 1100 px: `medium-margin-1 large-margin-0` keeps 16 px, and `medium-padding-2 large-padding-1` keeps 32 px. Every other family prints its responsive classes breakpoint by breakpoint and is correct.
- A `.overflow-scroll` region with no focusable content is out of the tab order in WebKit (measured in WebKit 26.6) and in Chromium before version 130, which the Browser target includes, and axe reports it (`scrollable-region-focusable`) in every engine, so keyboard users cannot scroll it (WCAG 2.2 success criterion 2.1.1). Foundation's docs show the class alone.
- `.position-fixed-top` and `.position-fixed-bottom` pin a bar over the page edge; a focused link scrolled under it is hidden (2.4.11) unless the page reserves the bar's height with `scroll-padding`. The docs say nothing.
- `.text-hide` hides text with `font: 0/0`; with nothing else visible inside it, a link carrying it has no visible box to focus or press (2.4.7, 2.5.8). The docs' example keeps both the logo's `alt` and the hidden text, so the name says "zurb logo Zurb".
- `.bordered` gives a form field Foundation's `$medium-gray` border, about 1.6:1 on the page, and `.border-none` removes the field's boundary; both undo the 3:1 field boundary the [Spec: Forms](../issues/98-spec-forms.md) requires (1.4.11).
- `.text-truncate`, `.text-nowrap`, and `.overflow-hidden` cut text off, and a fixed-width or fixed-height box that holds them loses content at 320 CSS px or under text spacing (1.4.10, 1.4.12).
- `$prototype-arrow-size` and `$prototype-arrow-color` are assigned without `!default` in Foundation's arrow partial, so a value set in the developer's copy of the settings file, or anywhere before `@import 'foundation'`, is replaced by `0.4375rem` and `$black` (measured). The docs' "simply set `$global-prototype-breakpoints` to true" does nothing from an overrides file after Foundation's settings file, which assigns each family's flag from it (measured: the compiled CSS is byte-identical).
- The docs' list of per-family includes names `foundation-prototype-typescale`, a mixin Foundation 6.9.0 does not have.
- Under the library's class rule the developer writes no Foundation class at all, so all 357 classes need an Angular home, without one directive per class.

A server-rendered application adds the usual second problem: whatever the Angular layer does must already be right in the server HTML, must not break hydration, and must leave the page styled before hydration and inside dehydrated `@defer` blocks.

## Solution

Eighteen attribute directives, one per Foundation export mixin of the Prototype mode, set every Prototyping Utility class through 42 Utility attributes. A Utility attribute is an input whose name is also one of its directive's attribute selectors, written where Foundation's docs write the class: `nfsMarginTop="1"` for `.margin-top-1`, `nfsDisplay="inline-block"` for `.display-inline-block`, `nfsBordered` for `.bordered`, `ol nfsListStyleType="lower-roman"` for `ol.list-lower-roman`. Each attribute's values are typed like a Variant input (ADR 0040): the names of the developer's Sass lists, Foundation's defaults extended or shrunk by the Variant declaration file, a spacer count up to `$prototype-spacers-count`, or a boolean, so a misspelt or missing name fails to compile. The same attribute takes a Breakpoint rules object (`[nfsPadding]="{small: 1, large: 3}"`) or a Breakpoint query (`nfsShadow="medium"`) for Foundation's responsive classes. No value sets no class.

The directives bind only their own Utility classes, declare no listener, and add no role, so any number of them and any library component directive sit on one element side by side: `<button nfsButton color="primary" nfsRadius nfsBordered nfsShadow>`. Within one family the directive resolves overlaps: the most specific attribute wins for each side, and the classes it binds never set one property twice, so `nfsMargin="2" nfsMarginTop="1"` gives the 1rem top margin the markup asks for. The `nfs-prototyping-utilities` Library mixin prints the responsive spacing classes again in breakpoint order, so a rules object that decreases across breakpoints renders as written, writes the Variant properties the Runtime checks and the declaration file's generator read, and warns when the arrow colour is under 3:1. In development the directives report copied Foundation classes, a scroll region no keyboard can reach, a fixed bar with no reserved `scroll-padding`, hidden text with nothing visible in its place, and a border utility on a form field.

## User Stories

1. As an application developer, I want to write `nfsMarginTop="1"` where Foundation's docs write `class="margin-top-1"`, so that I prototype with the utilities I know and write no Foundation class.
2. As an application developer, I want every Prototyping Utility family (spacing, sizing, display, overflow, position, border box, border none, bordered, rounded, shadow, arrow, separator, font styling, list style, text utilities, text transformation, text decoration) to have attributes, so that nothing Prototype mode prints is out of reach.
3. As an application developer, I want to import one directive per family, matching the Foundation export mixin I include in Sass, so that my template imports mirror my stylesheet.
4. As an application developer who is prototyping, I want the editor to add the right directive when I pick a Utility attribute from completion, and a development warning naming the directive and its entry point when I type one without its import, so that I do not hunt for eighteen classes while sketching.
5. As an application developer, I want to put several utility attributes and a component directive on one element, so that `<div nfsCallout nfsShadow nfsRadius nfsPaddingVertical="2">` works like Foundation's class list.
6. As an application developer, I want the utility attributes never to capture another directive's input or a native attribute such as `width`, `height`, or `position`, so that composition has no surprises.
7. As an application developer, I want `nfsMargin="2" nfsMarginTop="1"` to give a 1rem top margin and 2rem elsewhere, so that the more specific attribute wins as CSS shorthands and longhands do.
8. As an application developer, I want `nfsOverflow="hidden" nfsOverflowY="scroll"` to scroll vertically and clip horizontally, whatever Foundation's source order says.
9. As an application developer, I want a spacer count typed from 0 to my `$prototype-spacers-count`, so that `nfsPadding="4"` fails to compile on Foundation's defaults and compiles once my Sass and declaration file raise the count.
10. As an application developer who adds `33: 33.333%` to `$prototype-sizes`, I want `nfsWidth="33"` to compile once my Variant declaration file lists it, so that my own sizes are typed like Foundation's.
11. As an application developer who adds `flex` to `$prototype-display`, I want `nfsDisplay="flex"` to compile once my declaration file lists it, and a misspelt `nfsDisplay="blok"` to fail with the compiler's suggestion.
12. As an application developer, I want a Foundation class name passed as a value, such as `nfsDisplay="display-block"`, to fail to compile, so that no class name reaches my templates.
13. As an application developer, I want `nfsPosition="fixed-top"` and `nfsPosition="fixed-bottom"` beside `static`, `relative`, `absolute`, and `fixed`, so that one attribute sets the element's position.
14. As an application developer, I want `ul nfsListStyleType="square"` and `ol nfsListStyleType="upper-roman"` to compile, and `ol nfsListStyleType="disc"` to fail, so that I only ask for classes Foundation's CSS has for that list.
15. As an application developer, I want `nfsSeparator="left"` on a heading, so that I get Foundation's separator line.
16. As an application developer, I want `nfsArrow="down"` on an empty element, so that I draw Foundation's CSS triangle.
17. As an application developer, I want boolean attributes (`nfsBordered`, `nfsShadow`, `nfsRounded`, `nfsRadius`, `nfsBorderBox`, `nfsBorderNone`, `nfsFontBold`, `nfsTextTruncate`, and the rest) that work bare, with `true`, or bound to a boolean, so that on-or-off classes read like Foundation's.
18. As an application developer who turned on `$prototype-spacing-breakpoints`, I want `[nfsMargin]="{small: 0, medium: 2, large: 1}"` to give 0, 2rem, and 1rem at the three breakpoints, so that a value that decreases at a larger breakpoint renders as written.
19. As an application developer, I want `nfsBordered="medium"` to set `.medium-bordered`, so that on-or-off classes take a Breakpoint query.
20. As an application developer, I want a responsive value for a family whose Sass flag is off to be reported in development, naming the flag, so that I do not wonder why nothing changes.
21. As an application developer, I want the spec to tell me how to turn the flags on from an overrides file, where `$global-prototype-breakpoints` alone does nothing, so that the responsive classes exist.
22. As an application developer, I want the spec to tell me that the arrow's size and colour must be set after `@import 'foundation'`, so that my arrow colour is not silently replaced.
23. As an application developer, I want no value to set no class, so that an unbound attribute changes nothing.
24. As an application developer migrating Foundation markup, I want a copied `class="margin-top-1"` on an element that already carries a spacing attribute to be reported in development, naming the attribute to write.
25. As an application developer, I want a development report when I bind a name my compiled CSS has no class for, or forget the `nfs-prototyping-utilities` include, so that drift between my Sass and my types surfaces early.
26. As an application developer, I want a development warning when a scroll region I made with `nfsOverflowY="scroll"` overflows, holds nothing focusable, and has no `tabindex`, so that I add `tabindex="0"`, `role="region"`, and a name before a keyboard user meets it.
27. As an application developer, I want a development warning when a focusable scroll region has no name, so that screen reader users know what they are scrolling.
28. As an application developer, I want a development warning when a `fixed-top` or `fixed-bottom` bar is taller than the document's `scroll-padding` on that edge, so that focused content is never hidden under it.
29. As an application developer, I want a development warning when `nfsTextHide` hides text and nothing visible takes its place, so that a logo link never becomes an invisible target.
30. As an application developer, I want a development warning when I put `nfsBordered` or `nfsBorderNone` on an input, select, or textarea, so that I do not erase the field boundary the Forms spec requires.
31. As an application developer, I want the library's Sass to warn when my arrow colour is under 3:1 against the page, so that an arrow that shows a menu's presence stays visible.
32. As an application developer, I want the spec to state which utilities can lose content at 320 CSS px or under text spacing (`nfsTextTruncate`, `nfsTextNowrap`, `nfsOverflow="hidden"`), and what makes them safe, so that prototypes stay accessible.
33. As an application developer, I want the spec to tell me that `nfsDisplay="table"` and `"table-cell"` lay out and do not make a data table, so that tabular data stays a `<table>`.
34. As an application developer, I want the spec to tell me that positioned content keeps a DOM order that matches what users see, so that `nfsPosition="absolute"` never breaks reading or focus order.
35. As an application developer, I want the Sass-only helpers (the box, rotate, and relational mixins, and `margin()`, `padding()`, and `position()`) documented as consumer Sass with no directive, so that I know where they belong.
36. As a keyboard user, I want to reach and scroll every scroll region, so that clipped content is never out of reach.
37. As a keyboard user, I want a focused link never to sit under a fixed bar, so that I always see where focus is.
38. As a screen reader user, I want a focusable scroll region to be announced as a named region, so that I know what it holds.
39. As a screen reader user, I want a logo link whose text Foundation hides to be announced by that text alone, so that its name is not doubled.
40. As a user who enlarges text spacing or zooms to 320 CSS px, I want truncated or clipped text to be available in full where it leads, so that nothing is lost.
41. As a developer of a server-rendered application, I want the server HTML to carry every Utility class the attributes set, overlaps resolved, so that the first paint is final and hydration changes nothing.
42. As a developer using `@defer (hydrate never)`, I want utilities there to stay applied, so that static regions keep their layout without JavaScript.
43. As a developer of a zoneless application, I want the directives to need no zone, so that they work with zoneless change detection.
44. As an application developer, I want to import the directives from their own entry point, so that a `@defer` block can split them.
45. As a Storybook author, I want to lay out story scaffolding with these attributes instead of inline styles wherever Foundation has a class, so that stories follow the class rule.
46. As a library maintainer, I want every behaviour asserted through classes, computed styles, focus, names, and geometry in stories, browser-level tests, a server-render smoke test, a pure resolution test, a Sass compile test, and e2e, so that regressions surface at the layer that owns them.

## Implementation Decisions

### Foundation contract

Prototyping Utilities have no Plugin, no `defaults` object, no `data-*` Options, no events, and no methods. The contract is Foundation's prototype Sass partials, its settings, its docs page, and the markup the docs show. Dropped options: none, because there are none. Prototype mode is opt-in: every class exists only when the consumer includes its export mixin, directly, through `foundation-prototype-classes`, or through `foundation-everything($prototype: true)`.

| Family (export mixin) | Classes | Names from | Responsive form and its flag | Notes |
| --- | --- | --- | --- | --- |
| Spacing (`foundation-prototype-spacing`) | `.margin-<n>`, `.margin-<side>-<n>`, `.padding-<n>`, `.padding-<side>-<n>`; `<side>` is `top`, `right`, `bottom`, `left`, `horizontal`, `vertical` | `<n>` from 0 to `$prototype-spacers-count` (3), times `$global-margin` or `$global-padding` (1rem) | `.<bp>-margin-<n>` and the rest, `$prototype-spacing-breakpoints` | `!important`. Printed spacer by spacer: all sides, then the six sides, then the next count; the responsive block likewise, count outermost, so its rules are not in breakpoint order (measured) |
| Sizing (`foundation-prototype-sizing`) | `.<sizing>-<size>`, `.max-width-100`, `.max-height-100` | `<sizing>` from `$prototype-sizing` (`width`, `height`), `<size>` from the keys of `$prototype-sizes` (25, 50, 75, 100 as percentages) | `.<bp>-<sizing>-<size>`, `$prototype-sizing-breakpoints`; the two `max-*` classes have none | `!important` |
| Display (`foundation-prototype-display`) | `.display-<v>` | `$prototype-display` (`inline`, `inline-block`, `block`, `table`, `table-cell`) | `.<bp>-display-<v>`, `$prototype-display-breakpoints` | `!important`; the docs send `display: flex` to the Flexbox Utilities and `display: none` to the Visibility Classes |
| Overflow (`foundation-prototype-overflow`) | `.overflow-<v>`, `.overflow-x-<v>`, `.overflow-y-<v>` | `$prototype-overflow` (`visible`, `hidden`, `scroll`) | `.<bp>-overflow-<v>` and the axis forms, `$prototype-overflow-breakpoints` | `!important`; `scroll` adds `-webkit-overflow-scrolling: touch`. Per value: the shorthand, then x, then y, so a later value's shorthand beats an earlier value's axis class (measured) |
| Position (`foundation-prototype-position`) | `.position-<v>`, `.position-fixed-top`, `.position-fixed-bottom` | `$prototype-position` (`static`, `relative`, `absolute`, `fixed`); the two fixed forms are fixed classes | `.<bp>-position-<v>` and the two fixed forms, `$prototype-position-breakpoints` | `!important`; the fixed forms set `top` or `bottom` and `left` and `right` to 0 and `z-index: $prototype-position-z-index` (975) |
| Border box (`foundation-prototype-border-box`) | `.border-box` | - | `.<bp>-border-box`, `$prototype-border-box-breakpoints` | `box-sizing: border-box !important`; Foundation's global styles already make every element inherit `border-box` from `html` |
| Border none (`foundation-prototype-border-none`) | `.border-none` | - | `.<bp>-border-none`, `$prototype-border-none-breakpoints` | `border: 0 !important` |
| Bordered (`foundation-prototype-bordered`) | `.bordered` | - | `.<bp>-bordered`, `$prototype-bordered-breakpoints` | `border: $prototype-border-width $prototype-border-type $prototype-border-color` (1px solid `$medium-gray`), no `!important` |
| Rounded (`foundation-prototype-rounded`) | `.rounded`, `.radius` | - | `.<bp>-rounded`, `.<bp>-radius`, `$prototype-rounded-breakpoints` | `.rounded` is `border-radius: 5000px !important` and also rounds a descendant `.switch-paddle` and its knob; `.radius` is `$prototype-border-radius` (3px) |
| Shadow (`foundation-prototype-shadow`) | `.shadow` | - | `.<bp>-shadow`, `$prototype-shadow-breakpoints` | `box-shadow: $prototype-box-shadow` |
| Arrow (`foundation-prototype-arrow`) | `.arrow-<dir>` | `$prototype-arrow-directions` (`down`, `up`, `right`, `left`) | none | Foundation's `css-triangle` on the element itself (`display: block`, zero size, borders), `$prototype-arrow-size` and `$prototype-arrow-color` (`$black`), both assigned without `!default` (measured, D17) |
| Separator (`foundation-prototype-separator`) | `.separator-center`, `.separator-left`, `.separator-right` | fixed classes | `.<bp>-separator-<align>`, `$prototype-separator-breakpoints` | `text-align: <align> !important`, a clearfix, and an `::after` line (`$prototype-separator-width` by `$prototype-separator-height`, `$prototype-separator-background`) |
| Font styling (`foundation-prototype-font-styling`) | `.font-wide`, `.font-normal`, `.font-bold`, `.font-italic` | - | `.<bp>-font-*`, `$prototype-font-breakpoints` | Letter spacing, weight, and style; only `.font-italic` is `!important` |
| List style (`foundation-prototype-list-style-type`) | `ul.list-<type>`, `ol.list-<type>` | `$prototype-style-type-unordered` (`disc`, `circle`, `square`), `$prototype-style-type-ordered` (`decimal`, `lower-alpha`, `lower-latin`, `lower-roman`, `upper-alpha`, `upper-latin`, `upper-roman`) | `ul.<bp>-list-<type>`, `ol.<bp>-list-<type>`, `$prototype-list-breakpoints` | Qualified by element: a `list-disc` on an `ol` has no rule |
| Text utilities (`foundation-prototype-text-utilities`) | `.text-hide`, `.text-truncate`, `.text-nowrap`, `.text-wrap` | - | `.<bp>-text-*`, `$prototype-utilities-breakpoints` | Image replacement (`font: 0/0 a`, transparent text and background, no border), one-line ellipsis (`$prototype-text-overflow`), `white-space: nowrap`, `word-wrap: break-word` |
| Text transformation (`foundation-prototype-text-transformation`) | `.text-<v>` | `$prototype-text-transformation` (`lowercase`, `uppercase`, `capitalize`) | `.<bp>-text-<v>`, `$prototype-transformation-breakpoints` | `!important` |
| Text decoration (`foundation-prototype-text-decoration`) | `.text-<v>` | `$prototype-text-decoration` (`overline`, `underline`, `line-through`) | `.<bp>-text-<v>`, `$prototype-decoration-breakpoints` | `!important` |
| Sass-only helpers | none | - | - | The box, rotate, and relational (`nth-child`) mixins, and the `margin()`, `padding()`, `position()`, `display()`, and other per-family mixins, for the consumer's own CSS; no class, so no directive (Out of Scope) |

Responsive forms: each flag defaults to `$global-prototype-breakpoints` (`false`); a responsive class exists for every Class breakpoint except the Zero breakpoint, whose form is the unprefixed class. The Zero breakpoint's responsive form is therefore always a gap the directive fills with the unprefixed class (building-blocks 1.4).

Docs conventions kept or corrected: the class-for-class attributes (kept, as attributes); the Component Styling examples on buttons, a switch, a card, a table, and an image (kept, composed beside the component directives; the switch named by a visible label, as the [Spec: Switch](../issues/84-spec-switch.md) requires, in place of the example's hidden paddle text); the Arrow examples' `display-inline-block margin-right-1` beside an arrow (kept, as `nfsDisplay` and `nfsMarginRight` beside `nfsArrow`); `.text-hide` around an image with an `alt` and the same text (corrected: `alt=""` when the hidden text names the link, D15); overflow regions (corrected: a region that scrolls gets `tabindex="0"`, `role="region"`, and a name, or holds focusable content, D13); the "set `$global-prototype-breakpoints` to true" instruction and the per-family include list (corrected in the Sass subsection).

### CSS class to directive mapping

Every class is a Utility class. There are no Structural classes and no State classes, and no class is left for the consumer to write (ADR 0039). Each row is one Utility attribute or one set of attributes of one template; "rules" means a bare value, which applies from the Zero breakpoint, or an `NfsClassBreakpointRules` object; "query" means `true`, the bare attribute, or an `NfsClassBreakpointQuery<'up'>`.

| Foundation classes | Directive and Utility attributes | Type alias; Sass setting and Variant registry | Value shape | Class each value sets | Variant properties the Runtime check reads |
| --- | --- | --- | --- | --- | --- |
| `.margin-<n>`, `.margin-<side>-<n>`, and `.<bp>-` forms | `NfsPrototypeSpacing`: `nfsMargin`, `nfsMarginTop`, `nfsMarginRight`, `nfsMarginBottom`, `nfsMarginLeft`, `nfsMarginHorizontal`, `nfsMarginVertical` | `NfsPrototypeSpacingInput` over `NfsPrototypeSpacerCount`: 0 to `$prototype-spacers-count`, `NfsPrototypeSpacersCountOverrides` (Open, a count) | rules of counts; a static attribute's string (`"1"`) is its number | Resolved per side across the seven attributes (Overlap resolution): an attribute alone sets its own class (`nfsMarginTop="1"` sets `.margin-top-1`); a key for a Class breakpoint above the Zero breakpoint sets the `.<bp>-` form | `--nfs-prototype-spacers-count`; `--nfs-prototype-spacing-breakpoints` for every class above the Zero breakpoint |
| `.padding-<n>`, `.padding-<side>-<n>`, and `.<bp>-` forms | `NfsPrototypeSpacing`: `nfsPadding`, `nfsPaddingTop`, `nfsPaddingRight`, `nfsPaddingBottom`, `nfsPaddingLeft`, `nfsPaddingHorizontal`, `nfsPaddingVertical` | as margin | as margin | as margin, with `padding` | as margin |
| `.width-<size>`, `.height-<size>`, and `.<bp>-` forms | `NfsPrototypeSizing`: `nfsWidth`, `nfsHeight` | `NfsPrototypeSizingInput` over `NfsPrototypeSizeName`: the keys of `$prototype-sizes` as strings (`'25' \| '50' \| '75' \| '100'`), `NfsPrototypeSizesOverrides` (Open) | rules of names | `.width-<size>`, `.<bp>-width-<size>`; `height` likewise | `--nfs-prototype-sizes`; `--nfs-prototype-sizing-breakpoints` |
| `.max-width-100`, `.max-height-100` | `NfsPrototypeSizing`: `nfsMaxWidth100`, `nfsMaxHeight100` | `NfsVariantBoolean` (Closed) | a boolean | the class | none |
| `.display-<v>` and `.<bp>-` forms | `NfsPrototypeDisplay`: `nfsDisplay` | `NfsPrototypeDisplayInput` over `NfsPrototypeDisplayName`: `$prototype-display`, `NfsPrototypeDisplayOverrides` (Open) | rules of names | `.display-<v>`, `.<bp>-display-<v>` | `--nfs-prototype-display`; `--nfs-prototype-display-breakpoints` |
| `.overflow-<v>`, `.overflow-x-<v>`, `.overflow-y-<v>`, and `.<bp>-` forms | `NfsPrototypeOverflow`: `nfsOverflow`, `nfsOverflowX`, `nfsOverflowY` | `NfsPrototypeOverflowInput` over `NfsPrototypeOverflowName`: `$prototype-overflow`, `NfsPrototypeOverflowOverrides` (Open) | rules of names | Resolved per axis across the three attributes (Overlap resolution); an attribute alone sets its own class | `--nfs-prototype-overflow`; `--nfs-prototype-overflow-breakpoints` |
| `.position-<v>`, `.position-fixed-top`, `.position-fixed-bottom`, and `.<bp>-` forms | `NfsPrototypePosition`: `nfsPosition` | `NfsPrototypePositionInput` over `NfsPrototypePositionName`: `$prototype-position`, `NfsPrototypePositionOverrides` (Open), plus the closed `'fixed-top' \| 'fixed-bottom'` | rules of names | `.position-<v>`, `.<bp>-position-<v>` | `--nfs-prototype-position` (the fixed forms always exist); `--nfs-prototype-position-breakpoints` |
| `.border-box` and `.<bp>-border-box` | `NfsPrototypeBorderBox`: `nfsBorderBox` | `NfsPrototypeToggleInput` (Closed; Class breakpoints over `NfsBreakpointClassesOverrides`) | query | `true` or a Zero-breakpoint query sets `.border-box`; `'medium'` or `'medium up'` sets `.medium-border-box`; `only` and `down` do not compile | `--nfs-prototype-border-box-breakpoints` for a query above the Zero breakpoint |
| `.border-none` and `.<bp>-` forms | `NfsPrototypeBorderNone`: `nfsBorderNone` | as above | query | as above | `--nfs-prototype-border-none-breakpoints` |
| `.bordered` and `.<bp>-` forms | `NfsPrototypeBordered`: `nfsBordered` | as above | query | as above | `--nfs-prototype-bordered-breakpoints` |
| `.rounded`, `.radius`, and `.<bp>-` forms | `NfsPrototypeRounded`: `nfsRounded`, `nfsRadius` | as above | query | as above | `--nfs-prototype-rounded-breakpoints` |
| `.shadow` and `.<bp>-shadow` | `NfsPrototypeShadow`: `nfsShadow` | as above | query | as above | `--nfs-prototype-shadow-breakpoints` |
| `.arrow-<dir>` | `NfsPrototypeArrow`: `nfsArrow` | `NfsPrototypeArrowDirectionName`: `$prototype-arrow-directions`, `NfsPrototypeArrowDirectionsOverrides` (Open) | a name (Foundation has no responsive arrow) | `.arrow-<dir>` | `--nfs-prototype-arrow-directions` |
| `.separator-<align>` and `.<bp>-` forms | `NfsPrototypeSeparator`: `nfsSeparator` | `NfsPrototypeSeparatorInput` over `NfsPrototypeSeparatorAlign`: `'center' \| 'left' \| 'right'` (Closed: the partial writes the three classes itself) | rules of names | `.separator-<align>`, `.<bp>-separator-<align>` | `--nfs-prototype-separator-breakpoints` |
| `.font-wide`, `.font-normal`, `.font-bold`, `.font-italic`, and `.<bp>-` forms | `NfsPrototypeFontStyling`: `nfsFontWide`, `nfsFontNormal`, `nfsFontBold`, `nfsFontItalic` | `NfsPrototypeToggleInput` | query | as the border box row | `--nfs-prototype-font-breakpoints` |
| `ul.list-<type>` and `ul.<bp>-list-<type>` | `NfsPrototypeListUnordered` (`ul[nfsListStyleType]`): `nfsListStyleType` | `NfsPrototypeListUnorderedInput` over `NfsPrototypeStyleTypeUnorderedName`: `$prototype-style-type-unordered`, `NfsPrototypeStyleTypeUnorderedOverrides` (Open) | rules of names | `.list-<type>`, `.<bp>-list-<type>` | `--nfs-prototype-style-type-unordered`; `--nfs-prototype-list-breakpoints` |
| `ol.list-<type>` and `ol.<bp>-list-<type>` | `NfsPrototypeListOrdered` (`ol[nfsListStyleType]`): `nfsListStyleType` | `NfsPrototypeListOrderedInput` over `NfsPrototypeStyleTypeOrderedName`: `$prototype-style-type-ordered`, `NfsPrototypeStyleTypeOrderedOverrides` (Open) | rules of names | as above | `--nfs-prototype-style-type-ordered`; `--nfs-prototype-list-breakpoints` |
| `.text-hide`, `.text-truncate`, `.text-nowrap`, `.text-wrap`, and `.<bp>-` forms | `NfsPrototypeTextUtilities`: `nfsTextHide`, `nfsTextTruncate`, `nfsTextNowrap`, `nfsTextWrap` | `NfsPrototypeToggleInput` | query | as the border box row | `--nfs-prototype-utilities-breakpoints` |
| `.text-<transformation>` and `.<bp>-` forms | `NfsPrototypeTextTransformation`: `nfsTextTransform` | `NfsPrototypeTextTransformationInput` over `NfsPrototypeTextTransformationName`: `$prototype-text-transformation`, `NfsPrototypeTextTransformationOverrides` (Open) | rules of names | `.text-<v>`, `.<bp>-text-<v>` | `--nfs-prototype-text-transformation`; `--nfs-prototype-transformation-breakpoints` |
| `.text-<decoration>` and `.<bp>-` forms | `NfsPrototypeTextDecoration`: `nfsTextDecoration` | `NfsPrototypeTextDecorationInput` over `NfsPrototypeTextDecorationName`: `$prototype-text-decoration`, `NfsPrototypeTextDecorationOverrides` (Open) | rules of names | `.text-<v>`, `.<bp>-text-<v>` | `--nfs-prototype-text-decoration`; `--nfs-prototype-decoration-breakpoints` |

- `$prototype-sizing` is not a registry: its names are the attributes `nfsWidth` and `nfsHeight`, and a template's attribute names cannot grow from Sass. Names a consumer adds to it generate classes no attribute sets (Out of Scope, D10).
- Every value maps to exactly the classes the table gives, and to nothing for a value that is not one class token (reachable only through a cast or `$any()`, and reported by the Variant check).

### The Utility directive rule

This spec sets the shape every utility family's directives take. The [Spec: Float Classes](../issues/105-spec-float-classes.md) and the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md) follow it; the other layout systems and utility families may.

0. Scope. Utility classes that stand alone and set independent properties: each styles whatever element carries it, no other class of its family must be on that element or around it, and the family's templates do not together express one effect (every Prototyping Utility, Foundation's float classes and `.clearfix`, its text alignment classes). Two other shapes, specified in the same wave, cover the families this one does not, and a family takes exactly one of the three for each of its classes:
   - Roles. A family whose docs give elements roles that its other classes modify takes building-blocks 1.4's Structural class shape: one directive per role, the modifying classes its Variant inputs. The [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md) is the case: a flex parent and a flex child, and the alignment classes that work only on a flex parent (`nfsFlexContainer`, `nfsFlexAlign`, `nfsFlexChild`).
   - One effect. A family whose templates all say whether the element is shown, under Foundation's `<words>-for-<bp>` names, takes one directive for the effect whose inputs keep those words, which building-blocks 1.4 already names (`showFor`, `hideFor`). The [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md) is the case (`nfsVisibility`); its single-class directives (`nfsShowForSr`, `nfsShowOnFocus`) are this rule's booleans.
   - In every shape, an input without the `nfs` prefix must not share its name with an input of another directive that can sit on the same element, or the spec reports that case in development, as the Visibility spec does for the Responsive Toggle's `hideFor` Option. This rule meets the requirement with the prefix.
1. Unit. One directive class per Foundation export mixin that prints the family's Utility classes, named `Nfs` + the PascalCase of the mixin's name without `foundation-` (`foundation-prototype-spacing` is `NfsPrototypeSpacing`, `foundation-float-classes` is `NfsFloatClasses`, `foundation-text-alignment` is `NfsTextAlignment`). Where the export mixin qualifies its classes by element, one directive class per element, with the element in its selector, so each element's type holds only the names its CSS has (`ul[nfsListStyleType]` and `ol[nfsListStyleType]`), named after Foundation's inner mixins (`list-unordered`, `list-ordered`). A class that one rule qualifies by several elements with one meaning and no inner mixin takes one directive class that names every element in its selector, named after the class (`ul[nfsNoBullet], ol[nfsNoBullet]` is `NfsNoBullet`, [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)).
2. Utility attributes. Each class template of the family, the class with its value and breakpoint removed, is one input whose public name is also one of the directive's attribute selectors; the directive's selector lists them all. Any of them creates the directive, an element gets one instance per family whatever it carries, and the attributes whose classes overlap share that instance.
3. Names. `nfs` + the camelCase of the template's stem where the stem is the CSS property or the utility's own word (`.display-<v>` is `nfsDisplay`, `.margin-top-<n>` is `nfsMarginTop`, `.overflow-x-<v>` is `nfsOverflowX`, `.arrow-<dir>` is `nfsArrow`, `.float-<v>` is `nfsFloat`). Where several templates share a stem or the stem shortens the property, the CSS property the classes set (`.text-<transformation>` is `nfsTextTransform`, `.text-<decoration>` is `nfsTextDecoration`, `.text-<align>` is `nfsTextAlign`, `.list-<type>` is `nfsListStyleType`). A class that fits another template of the family is a value of that template's attribute (`.position-fixed-top` is `nfsPosition="fixed-top"`). A class with no value is a boolean named with the camelCase of the class (`nfsBordered`, `nfsTextTruncate`, `nfsMaxWidth100`, `nfsClearfix`). Every name starts with `nfs`, so no Utility attribute captures another directive's input or a native attribute (`width`, `height`, `position`, `size`, `color`).
4. Values. Typed by ADR 0040, like Variant inputs: names over the setting's Variant registry for an Open family, a literal union for a fixed list, a count over its registry, a boolean through a typed transform. The responsive form is the same attribute: a valued attribute takes a bare value, which applies from the Zero breakpoint, or a Breakpoint rules object; a boolean takes `true` or a Breakpoint query with only the modifiers Foundation generates (`up` for every Prototype family). No value sets no class, and a Class breakpoint name is the only way a breakpoint appears.
5. Composition. A utility directive binds only its own Utility classes, through one computed class list, declares no input without the `nfs` prefix, no listener, and no role, name, or state, so any number of utility directives and any library component directive sit on one element side by side, and Angular combines their class lists with the consumer's own classes.
6. Overlap. Where two templates of one family set the same property on the same side (an all-sides margin and a side margin; `overflow` and `overflow-x`), the directive resolves them: at each Class breakpoint the most specific attribute wins for each side, and the classes it binds never set one property twice at one breakpoint, so Foundation's source order never decides. Where Foundation prints a family's responsive rules out of breakpoint order, the family's Library mixin prints them again in order. Across families, Foundation's cascade decides, and the spec names each such pair.
7. Ownership. Each directive owns the development-mode checks its classes need for WCAG 2.2 AA (ADR 0022), and the entry point's `nfs-<entry point>` Library mixin writes the Variant properties of every registry and every breakpoint flag of the page and holds its compile-time checks and order fixes.

### Overlap resolution

Spacing, for margin and padding separately. Let `A` be the all-sides attribute (`nfsMargin`), `H` and `V` the axis attributes, and `T`, `R`, `B`, `L` the side attributes. For each Class breakpoint `b` in the order of the Breakpoint map (`nfsBreakpointsToken`), each attribute's value at `b` is its rule for the largest key at or below `b` (a bare value is the Zero breakpoint's rule), or nothing:

- top at `b` is `T`, else `V`, else `A`; bottom is `B`, else `V`, else `A`; left is `L`, else `H`, else `A`; right is `R`, else `H`, else `A`.
- The sides whose value at `b` differs from their value at the Class breakpoint before `b` (at the Zero breakpoint: the sides that have a value) get classes at `b`: one all-sides class when all four changed to one value; otherwise one axis class for a changed pair of equal values (top and bottom, left and right), and one side class for each changed side left over.
- The class prefix is none at the Zero breakpoint and `<b>-` above it.

The classes bound at one breakpoint therefore never set one side twice, and a side that keeps its value keeps the earlier breakpoint's class, which Foundation's `min-width` media queries carry up. Examples: `nfsMargin="2" nfsMarginTop="1"` binds `.margin-top-1`, `.margin-horizontal-2`, and `.margin-bottom-2`; `nfsMarginHorizontal="2" nfsMarginLeft="1"` binds `.margin-left-1` and `.margin-right-2`; `[nfsPadding]="{small: 1, large: 3}"` binds `.padding-1` and `.large-padding-3`; a single attribute binds its own class. Overflow is the same with two sides: x is `nfsOverflowX`, else `nfsOverflow`; y is `nfsOverflowY`, else `nfsOverflow`; one shorthand class when both changed to one value, else one axis class each (`nfsOverflow="hidden" nfsOverflowY="scroll"` binds `.overflow-x-hidden` and `.overflow-y-scroll`).

Between breakpoints, the resolution relies on each breakpoint's rules following the smaller breakpoints' rules in the CSS. Foundation's responsive blocks do, except spacing's, which `nfs-prototyping-utilities` prints again in breakpoint order (Sass subsection, D8). A key the token's map lacks sorts after the map's breakpoints; the `strictBreakpointSync` Runtime check already reports that drift.

### Hierarchy and DI shape

```
[nfsMargin], [nfsMarginTop], ... [nfsPaddingVertical]          NfsPrototypeSpacing
[nfsWidth], [nfsHeight], [nfsMaxWidth100], [nfsMaxHeight100]   NfsPrototypeSizing
[nfsDisplay]                                                   NfsPrototypeDisplay
[nfsOverflow], [nfsOverflowX], [nfsOverflowY]                  NfsPrototypeOverflow
[nfsPosition]                                                  NfsPrototypePosition
[nfsBorderBox]                                                 NfsPrototypeBorderBox
[nfsBorderNone]                                                NfsPrototypeBorderNone
[nfsBordered]                                                  NfsPrototypeBordered
[nfsRounded], [nfsRadius]                                      NfsPrototypeRounded
[nfsShadow]                                                    NfsPrototypeShadow
[nfsArrow]                                                     NfsPrototypeArrow
[nfsSeparator]                                                 NfsPrototypeSeparator
[nfsFontWide], [nfsFontNormal], [nfsFontBold], [nfsFontItalic] NfsPrototypeFontStyling
ul[nfsListStyleType]                                           NfsPrototypeListUnordered
ol[nfsListStyleType]                                           NfsPrototypeListOrdered
[nfsTextHide], [nfsTextTruncate], [nfsTextNowrap], [nfsTextWrap] NfsPrototypeTextUtilities
[nfsTextTransform]                                             NfsPrototypeTextTransformation
[nfsTextDecoration]                                            NfsPrototypeTextDecoration
```

- Eighteen standalone directives with no template, no parent, no children, no Parent token, no providers, and no host directives. Nothing finds them through DI, and they find nothing but the Breakpoint map.
- No Defaults token: the family has no Options, and a Defaults token never holds a Variant input's default (building-blocks 1.4).
- Injection: `nfsBreakpointsToken` for the Zero breakpoint (`nfsBreakpointForWidth(map, 0)`) and the order of Class breakpoints, in every directive with a responsive form (all but `NfsPrototypeArrow`), without `NfsMediaQuery`; `ElementRef` for the development checks; in development builds only, `HostAttributeToken('class')` (optional) for the copied-class check; the Runtime checks' `nfsVariantCheck()` handle of `ngx-foundation-sites/media-query`.
- Entry point: `ngx-foundation-sites/prototyping-utilities` (one per Foundation docs page). It exports the eighteen directives and the aliases below, and no import array ([ADR 0046](../adr/0046-forgotten-imports-caught-by-checks.md)): a component lists the directive of each family it uses, and the forgotten-import checks name the directive of an attribute written without its import. The Variant registries, `NfsOverridableStringUnion`, `NfsOverridableCount`, `NfsVariantBoolean`, `nfsVariantBoolean`, and the Class breakpoint types live in the primary entry point `ngx-foundation-sites` and are used here as types only (and `nfsVariantBoolean` as its one runtime import).
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): each of the eighteen directives calls `nfsDirectiveCheck` with its class name (`nfsDirectiveCheck('NfsPrototypeSpacing')`), with no parent check, no child probes, and no peers, because no directive of the family needs another on any element, and `strictParents` changes nothing.

### API

Every directive: standalone, no template, no `exportAs` (it has no state or method to read), no model, no output, no method. Every attribute is an `input()` whose public name is the attribute (the class member drops the `nfs` prefix: `nfsMarginTop` is `marginTop`), declared with explicit type arguments that name the exported aliases (building-blocks 1.4), with the JSDoc naming Foundation's class template and Sass setting.

```ts
// Value sets: Foundation's defaults over the Variant registries of the primary entry point.
type NfsPrototypeSpacerCount = NfsOverridableCount<3, NfsPrototypeSpacersCountOverrides, 0>; // 0 to $prototype-spacers-count
type NfsPrototypeSizeName = NfsOverridableStringUnion<'25' | '50' | '75' | '100', NfsPrototypeSizesOverrides>;
type NfsPrototypeDisplayName = NfsOverridableStringUnion<'inline' | 'inline-block' | 'block' | 'table' | 'table-cell', NfsPrototypeDisplayOverrides>;
type NfsPrototypeOverflowName = NfsOverridableStringUnion<'visible' | 'hidden' | 'scroll', NfsPrototypeOverflowOverrides>;
type NfsPrototypePositionName = NfsOverridableStringUnion<'static' | 'relative' | 'absolute' | 'fixed', NfsPrototypePositionOverrides> | 'fixed-top' | 'fixed-bottom';
type NfsPrototypeArrowDirectionName = NfsOverridableStringUnion<'down' | 'up' | 'right' | 'left', NfsPrototypeArrowDirectionsOverrides>;
type NfsPrototypeSeparatorAlign = 'center' | 'left' | 'right';
type NfsPrototypeStyleTypeUnorderedName = NfsOverridableStringUnion<'disc' | 'circle' | 'square', NfsPrototypeStyleTypeUnorderedOverrides>;
type NfsPrototypeStyleTypeOrderedName = NfsOverridableStringUnion<'decimal' | 'lower-alpha' | 'lower-latin' | 'lower-roman' | 'upper-alpha' | 'upper-latin' | 'upper-roman', NfsPrototypeStyleTypeOrderedOverrides>;
type NfsPrototypeTextTransformationName = NfsOverridableStringUnion<'lowercase' | 'uppercase' | 'capitalize', NfsPrototypeTextTransformationOverrides>;
type NfsPrototypeTextDecorationName = NfsOverridableStringUnion<'overline' | 'underline' | 'line-through', NfsPrototypeTextDecorationOverrides>;

// Attribute types: a bare value applies from the Zero breakpoint; a rules object sets one class per Class breakpoint.
type NfsPrototypeSpacingValue = NfsPrototypeSpacerCount | NfsClassBreakpointRules<NfsPrototypeSpacerCount>;
type NfsPrototypeSpacingInput = NfsPrototypeSpacingValue | `${NfsPrototypeSpacerCount}`;
type NfsPrototypeSizingInput = NfsPrototypeSizeName | NfsClassBreakpointRules<NfsPrototypeSizeName>;
type NfsPrototypeDisplayInput = NfsPrototypeDisplayName | NfsClassBreakpointRules<NfsPrototypeDisplayName>;
type NfsPrototypeOverflowInput = NfsPrototypeOverflowName | NfsClassBreakpointRules<NfsPrototypeOverflowName>;
type NfsPrototypePositionInput = NfsPrototypePositionName | NfsClassBreakpointRules<NfsPrototypePositionName>;
type NfsPrototypeSeparatorInput = NfsPrototypeSeparatorAlign | NfsClassBreakpointRules<NfsPrototypeSeparatorAlign>;
type NfsPrototypeListUnorderedInput = NfsPrototypeStyleTypeUnorderedName | NfsClassBreakpointRules<NfsPrototypeStyleTypeUnorderedName>;
type NfsPrototypeListOrderedInput = NfsPrototypeStyleTypeOrderedName | NfsClassBreakpointRules<NfsPrototypeStyleTypeOrderedName>;
type NfsPrototypeTextTransformationInput = NfsPrototypeTextTransformationName | NfsClassBreakpointRules<NfsPrototypeTextTransformationName>;
type NfsPrototypeTextDecorationInput = NfsPrototypeTextDecorationName | NfsClassBreakpointRules<NfsPrototypeTextDecorationName>;
type NfsPrototypeToggleValue = boolean | NfsClassBreakpointQuery<'up'>;
type NfsPrototypeToggleInput = NfsVariantBoolean | NfsClassBreakpointQuery<'up'>;

class NfsPrototypeSpacing {
  // margin: 'nfsMargin'; marginTop: 'nfsMarginTop'; marginRight, marginBottom, marginLeft, marginHorizontal, marginVertical likewise;
  // padding: 'nfsPadding'; paddingTop ... paddingVertical likewise: fourteen inputs of this one shape
  readonly marginTop: InputSignalWithTransform<NfsPrototypeSpacingValue | undefined, NfsPrototypeSpacingInput | undefined>; // default undefined
}
class NfsPrototypeSizing {
  readonly width: InputSignal<NfsPrototypeSizingInput | undefined>; // 'nfsWidth'; height: 'nfsHeight' likewise
  readonly maxWidth100: InputSignalWithTransform<boolean, NfsVariantBoolean>; // 'nfsMaxWidth100'; maxHeight100: 'nfsMaxHeight100'; default false
}
class NfsPrototypeDisplay { readonly display: InputSignal<NfsPrototypeDisplayInput | undefined>; } // 'nfsDisplay'
class NfsPrototypeOverflow { readonly overflow: InputSignal<NfsPrototypeOverflowInput | undefined>; } // 'nfsOverflow'; overflowX, overflowY likewise
class NfsPrototypePosition { readonly position: InputSignal<NfsPrototypePositionInput | undefined>; } // 'nfsPosition'
class NfsPrototypeBorderBox { readonly borderBox: InputSignalWithTransform<NfsPrototypeToggleValue, NfsPrototypeToggleInput>; } // 'nfsBorderBox'; default false
// NfsPrototypeBorderNone (borderNone), NfsPrototypeBordered (bordered), NfsPrototypeRounded (rounded, radius), NfsPrototypeShadow (shadow),
// NfsPrototypeFontStyling (fontWide, fontNormal, fontBold, fontItalic), NfsPrototypeTextUtilities (textHide, textTruncate, textNowrap, textWrap): the same toggle shape
class NfsPrototypeArrow { readonly arrow: InputSignal<NfsPrototypeArrowDirectionName | undefined>; } // 'nfsArrow'
class NfsPrototypeSeparator { readonly separator: InputSignal<NfsPrototypeSeparatorInput | undefined>; } // 'nfsSeparator'
class NfsPrototypeListUnordered { readonly listStyleType: InputSignal<NfsPrototypeListUnorderedInput | undefined>; } // 'nfsListStyleType', on ul
class NfsPrototypeListOrdered { readonly listStyleType: InputSignal<NfsPrototypeListOrderedInput | undefined>; } // 'nfsListStyleType', on ol
class NfsPrototypeTextTransformation { readonly textTransform: InputSignal<NfsPrototypeTextTransformationInput | undefined>; } // 'nfsTextTransform'
class NfsPrototypeTextDecoration { readonly textDecoration: InputSignal<NfsPrototypeTextDecorationInput | undefined>; } // 'nfsTextDecoration'
```

| Attribute kind | Transform | Default | Foundation equivalent | Delta |
| --- | --- | --- | --- | --- |
| Spacing (14) | a pure function of the entry point: a static attribute's string becomes its number, anything else passes | `undefined`: no class | `.margin-<n>`, `.margin-<side>-<n>`, the padding forms, and their `.<bp>-` forms | Resolved per side (Overlap resolution); a rules object in place of several classes |
| Named and valued (display, sizing, overflow, position, list, separator, transformation, decoration) | none | `undefined` | `.<template>-<v>` and `.<bp>-<template>-<v>` | A rules object in place of several classes; overflow resolved per axis |
| `nfsArrow` | none | `undefined` | `.arrow-<dir>` | None |
| Toggles (14) | a pure function of the entry point whose parameter is `NfsPrototypeToggleInput`: `nfsVariantBoolean`'s result for `NfsVariantBoolean` values, the query itself otherwise (the Menu's `expanded` transform; the [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md) may hoist one shared transform for every on-or-off responsive family into the primary entry point) | `false` | `.<class>` and `.<bp>-<class>` | A Breakpoint query in place of the responsive class |
| `nfsMaxWidth100`, `nfsMaxHeight100` | `nfsVariantBoolean` | `false` | `.max-width-100`, `.max-height-100` | None |

- Size names are strings, as the Variant declaration file writes numeric-like names: `nfsWidth="50"` and `[nfsWidth]="'50'"` compile, `[nfsWidth]="50"` does not (D5).
- Host: one `[class]` binding per directive to a `computed` list of its Utility classes. The consumer's static classes, its own `[class]` and `[class.x]` bindings, and every other directive's classes stay, because Angular combines static classes and class bindings. No attribute, no style, no listener.
- Development-mode checks, in each directive's one `afterRenderEffect` read phase, which it creates only when `ngDevMode` is on or the Variant check handle is not `null` (never on the server, and in a production build only under the Runtime checks' opt-in); the warnings run only while `ngDevMode` is on, each once per instance, at the first render:
  1. Copied classes, every directive (D11): a static class list that holds a class of the directive's own family with Foundation's default names warns, naming the attribute to write ("class="margin-top-1" is set by nfsMarginTop: write nfsMarginTop="1" instead"). A copied class is not stripped, because the `[class]` list binds only the classes it sets, so it keeps styling until removed. The consumer's own classes and consumer-declared names are not reported (the Button spec's D22 rule).
  2. Unreachable scroll region, `NfsPrototypeOverflow` (D13): for each axis whose computed `overflow-x` or `overflow-y` is `scroll` or `auto` and whose scroll size exceeds its client size, when the host has no `tabindex` attribute and no focusable descendant (`a[href]`, `button`, `input`, `select`, `textarea`, `[tabindex]` other than `-1`, `[contenteditable]`, none disabled): "nfsOverflowY: this region scrolls but a keyboard cannot reach it; add tabindex="0", role="region", and aria-label or aria-labelledby, or put focusable content in it (WCAG 2.1.1; axe scrollable-region-focusable)". When the host has `tabindex` of 0 or more and no non-blank `aria-label` or `aria-labelledby`: "... a focusable region needs a name (WCAG 4.1.2)".
  3. Fixed bar, `NfsPrototypePosition` (D14): when the host's computed position is `fixed` with `top` (or `bottom`) at `0px` and `left` and `right` at `0px`, and the document element's computed `scroll-padding-top` (or `-bottom`) is smaller than the host's height: "nfsPosition="fixed-top": this bar is <h> px tall and covers focused content; set scroll-padding-top: <h>px or more on the scrolling element (WCAG 2.4.11)". The check reads the document scroller only.
  4. Nothing replaces hidden text, `NfsPrototypeTextUtilities` (D15): when the host's computed `font-size` is `0px` because of `nfsTextHide`, it has no `img`, `svg`, `picture`, `canvas`, or `video` descendant, and its computed `background-image` is `none`: "nfsTextHide: nothing visible takes the place of this element's hidden text; add the image it replaces, or use nfsShowForSr for text that should only be read (WCAG 2.4.7, 2.5.8)". `nfsShowForSr` is the [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md)'s directive.
  5. Border utility on a form field, `NfsPrototypeBordered` and `NfsPrototypeBorderNone` (D16): the host is an `input`, `select`, or `textarea`: "nfsBordered on a form field replaces its $input-border with $prototype-border-color, about 1.6:1 on Foundation's defaults, and nfsBorderNone removes it; a field boundary needs 3:1 (WCAG 1.4.11). Style the field through the Forms settings instead."
- Runtime check (D19): in the same read phase, on every run, each directive calls `include('nfs-prototyping-utilities', ['prototype-spacers-count', <its own registry settings>])` whether or not an attribute is bound, then `value(<attribute>, value, needs)` for each bound attribute, with `needs` from the same mapping that sets its classes: `{setting: 'prototype-spacers-count', name: n}` for each spacing class, the registry setting and name for each named class (none for the closed separator and the fixed position forms), and `{setting: 'prototype-<flag>-breakpoints', name: bp}` for each class above the Zero breakpoint. `strictVariantNames` reports a name or count its property lacks, and a responsive class while its flag's property is empty, naming the flag (`$prototype-spacing-breakpoints`); `strictVariantProperties` reports a missing `@include nfs-prototyping-utilities;`. The handle is created as `nfsVariantCheck('nfsPrototypeSpacing')`, the camelCase of the directive's class, because several attributes create one instance; each report names the attribute as its input.

### Comparison with Angular Material (22.2)

Material and the CDK ship no utility classes and no utility directives. Material's components take layout and spacing from the application's own CSS and expose look through their own inputs and Sass theming mixins; its typography and density helpers are Sass mixins, not classes. Angular's own tools for classes, `[class]` bindings and `NgClass`, put class names in the consumer's template, which the class rule forbids.

| Concern | Angular Material and CDK (22.2) | Prototyping Utilities |
| --- | --- | --- |
| Utility classes or directives | None | Eighteen directives over Foundation's 357 classes |
| Spacing and layout | The application's CSS | Utility attributes typed from the application's Sass lists |
| Responsive helpers | CDK `BreakpointObserver` for code | Foundation's `min-width` classes through rules objects and queries; no breakpoint logic in JavaScript |
| Theming | Sass mixins and design tokens | Foundation's settings; the Variant properties are a verification channel, not theming |
| Testing | Component harnesses | DOM-first assertions; no harness |

Borrowed: nothing; there is no counterpart. Not borrowed: `NgClass`-style class strings (ADR 0039), and runtime media queries in JavaScript (the classes carry the breakpoints).

### Implementation level and primitives

Implementation level: native platform. The utilities are Foundation's CSS on the consumer's elements; breakpoints are Foundation's media queries; scrolling, focus, and `scroll-padding` are the platform's. `@angular/aria` has no pattern for layout helpers, and `@angular/cdk` adds nothing: the Breakpoint map comes from the library's own token, and `InteractivityChecker` would be a heavier stand-in for a development check's selector. The Angular layer per directive is `input()` signals, one `computed` class list over a pure resolution function, one host `[class]` binding, a development-only render callback, and the Runtime check requests. No `effect`, no listener, no timer, no observer, no `Renderer2` write.

Fallback: none needed. The two Foundation cascade defects the directives and the mixin own, overlap by source order and out-of-order responsive spacing, were measured by this spec's ticket with Dart Sass 1.104.1 over Foundation 6.9.0 in Chromium 153, Firefox 155, and WebKit 26.6 through Playwright 1.63, together with the corrected CSS.

### ARIA and keyboard

APG pattern: none; the utilities are presentation. A scroll region a keyboard must reach follows the practice of the APG's scrollable examples: `tabindex="0"`, `role="region"`, and a name.

| Element or state | Rendered semantics | Source |
| --- | --- | --- |
| Any utility attribute | The host element's own role, name, and state; the directive adds none | WHATWG HTML; HTML-AAM |
| `nfsDisplay="table"` or `"table-cell"` | CSS table layout on a generic element; no table, row, or cell semantics. Tabular data stays a `<table>` (1.3.1) | CSS Display; HTML-AAM |
| `ul`/`ol` with `nfsListStyleType` | A list with its items; the marker style changes nothing in the tree | HTML-AAM |
| A scroll region (`nfsOverflow*="scroll"` or an added `auto`) | Holds focusable content, or carries the consumer's `tabindex="0"`, `role="region"`, and `aria-label` or `aria-labelledby`, which makes it a Scroll region, the contract the [Spec: Table](../issues/92-spec-table.md)'s scroll wrapper binds itself; the development check warns otherwise. Measured: a region without `tabindex` and without focusable content is in the tab order in Chromium 153 and Firefox 155 but not in WebKit 26.6, and axe 4.13.0 reports it in all three; with the recipe it is reached by Tab and scrolls with the arrow keys in all three | WAI-ARIA `region`; WCAG 2.1.1, 4.1.2 |
| `nfsTextHide` | The hidden text stays in the accessibility tree and names its element; an image inside it that shows the same words takes `alt=""`, so the name is not doubled (Foundation's example says "zurb logo Zurb") | accname |
| `nfsTextTruncate`, `nfsOverflow="hidden"` | Clipped text stays in the accessibility tree in full; only sighted users lose it | CSS; accname |
| `nfsArrow` | An empty element with no role, name, or text; the state an arrow suggests (a menu below, open or closed) is the control's (`aria-expanded`, the Nested menu's), never the arrow's | WAI-ARIA |
| `nfsSeparator` | A decorative `::after` line; the heading's text is unchanged | CSS Generated Content (a pseudo-element with empty `content` adds no text) |

| Key | Result | Owner |
| --- | --- | --- |
| Tab, Shift+Tab | Reaches a scroll region that carries `tabindex="0"`, or the focusable content inside it | Native |
| Arrow keys, Page Up, Page Down, Home, End, Space | Scroll a focused scroll region | Native |

Focus: the directives move no focus. `nfsPosition` never changes DOM order; absolutely and fixed-positioned content keeps a DOM order that matches its visual order (1.3.2, 2.4.3), and a fixed bar reserves its height with `scroll-padding` (2.4.11).

### WCAG 2.2 AA

The target is WCAG 2.2 level AA (user rule; ADR 0022). Each criterion below is a requirement with the layer that tests it; none is advice. Ratios are computed with the exact WCAG relative-luminance formula (`math.pow`), unrounded, never Foundation's `color-luminance()` or `color-contrast()`; cascade and keyboard facts were measured by this spec's ticket in Chromium 153, Firefox 155, and WebKit 26.6 through Playwright 1.63 with axe-core 4.13.0.

| Criterion | Requirement and how it is met | Foundation default | Test |
| --- | --- | --- | --- |
| 2.1.1 Keyboard | Every region that scrolls holds focusable content or carries `tabindex="0"`; the recipe also gives it `role="region"` and a name. `NfsPrototypeOverflow` warns in development (check 2) | The docs show `.overflow-scroll` alone; WebKit leaves such a region out of the tab order and axe reports it in every engine (measured) | axe `scrollable-region-focusable` in `prototyping-utilities--overflow`; browser-level tests of the check; e2e Tab and arrow-key scrolling in three engines |
| 4.1.2 Name, Role, Value | A focusable scroll region has `role="region"` and a name; the directives change no other role, name, or state | Foundation adds none | Play function of `prototyping-utilities--overflow` finds the region by `getByRole('region', {name})`; browser-level test of the name warning |
| 2.4.11 Focus Not Obscured (Minimum) | A `fixed-top` or `fixed-bottom` bar is never over focused content: the consumer sets `scroll-padding-top` (or `-bottom`) on the scrolling element to at least the bar's height, and `NfsPrototypePosition` warns in development when the document scroller's padding is smaller (check 3), as the [Spec: Sticky](../issues/28-spec-sticky.md) does | The docs say nothing; `z-index: 975` puts the bar over the page | e2e in three engines: Tab through the links of `prototyping-utilities--fixed-top`; every focused link's rectangle is clear of the bar |
| 2.4.7 Focus Visible; 2.5.8 Target Size (Minimum) | An `nfsTextHide` element shows what replaces its text (an image or a background image), so a link keeps a visible, pressable box; `NfsPrototypeTextUtilities` warns in development when nothing does (check 4) | `font: 0/0` collapses a text-only link to no box | Browser-level tests of the check; axe `target-size` in `prototyping-utilities--text-helpers` |
| 1.1.1 Non-text Content; 2.5.3 Label in Name | An image inside an `nfsTextHide` link that shows the hidden words takes `alt=""`, and the hidden text is the name, which contains the visible logo text | The docs' example names the link "zurb logo Zurb" | Play function finds the link by `getByRole('link', {name: 'ZURB'})` |
| 1.4.11 Non-text Contrast | A form field keeps the 3:1 boundary the [Spec: Forms](../issues/98-spec-forms.md) requires: `nfsBordered` and `nfsBorderNone` are not written on `input`, `select`, or `textarea`, and warn there in development (check 5). An arrow that shows a menu's presence reaches 3:1 against the page: `nfs-prototyping-utilities` warns (`@warn`, D17) when `$prototype-arrow-color` is under 3:1 against `$body-background`. `nfsBordered` elsewhere is decoration, since a card's or button's content already identifies it | `.bordered` is `$medium-gray`, about 1.6:1 on `$body-background`, and on a field it replaces `$input-border` by source order; the default arrow `$black` reaches 19.6:1 | Browser-level tests of the field check; node-level Sass compile test of the arrow warning; `prototyping-utilities--arrows-and-separators` asserts the arrow's computed border colour |
| 1.4.10 Reflow | At 320 CSS px no utility scrolls the page sideways: `nfsTextNowrap` holds only short text, sizes are percentages, and `nfsWidth` never sits on a box whose content is wider than its share (documented, D18) | Foundation's examples fit | e2e at 320 by 640 px in three engines: `scrollWidth` at most 320 in `prototyping-utilities--spacing`, `--sizing`, and `--text-helpers` |
| 1.4.12 Text Spacing | Text that `nfsTextTruncate` or `nfsOverflow="hidden"` clips is available in full where it leads (the truncated link's page, an expanded view); a clipping box around text has no fixed height (documented, D18) | The docs truncate a paragraph with no way to read the rest | e2e with the text-spacing stylesheet at 320 by 640 px: the truncated link in `prototyping-utilities--text-helpers` keeps its full title as its accessible name and its target |
| 1.3.1 Info and Relationships | `nfsDisplay="table"` and `"table-cell"` are layout; tabular data is a `<table>` (documented) | The docs list them without comment | Review of the stories: none lays out tabular data with them |
| 1.3.2 Meaningful Sequence; 2.4.3 Focus Order | Positioned content keeps a DOM order that matches its visual order (documented) | Passes where the markup's order is the visual order | Play function of `prototyping-utilities--display-and-position` tabs through a positioned group in visual order |
| 1.4.3 Contrast (Minimum) | The utilities change no text colour. `nfsSeparator`'s line is decoration (`$prototype-separator-background`) and needs no ratio | Passes | axe `color-contrast` in every story |

The axe gate in every story runs the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, plus `best-practice`) with `parameters.a11y.test = 'error'` (ADR 0018).

### Rendered HTML

Consumer markup, then the server HTML. The hydrated DOM equals the server HTML: the directives declare no listener, so nothing adds `jsaction`. Class order is not significant; Angular also renders the directive attributes that feed inputs (`nfsmargintop="1"`), and `NgOptimizedImage` its own image attributes, which the resulting DOM below leaves out, as the other specs do. Responsive examples assume the family's flag is on. `nfsButton`, `nfsSwitch`, `nfsSwitchInput`, `nfsSwitchPaddle`, `nfsCard`, and `nfsCardSection` are their specs' directives, shown only to place the utilities beside them; the switch follows the [Spec: Switch](../issues/84-spec-switch.md)'s naming, a visible `<label for>` and an empty paddle.

```html
<!-- One attribute, one class -->
<div nfsMarginTop="1" nfsPadding="2">...</div>

<div class="margin-top-1 padding-2">...</div>

<!-- Overlap: the side attribute wins, and no two classes set one side -->
<div nfsMargin="2" nfsMarginTop="1">...</div>

<div class="margin-top-1 margin-horizontal-2 margin-bottom-2">...</div>

<!-- Responsive: a rules object; the Zero breakpoint's rule is the unprefixed class -->
<section [nfsPadding]="{small: 1, large: 3}" [nfsDisplay]="{small: 'block', medium: 'table'}" nfsShadow="medium">...</section>

<section class="padding-1 large-padding-3 display-block medium-display-table medium-shadow">...</section>

<!-- Component Styling: utilities beside component directives -->
<button nfsButton color="primary" nfsRadius nfsBordered nfsShadow>Primary</button>
<div nfsCard nfsRadius nfsBordered nfsShadow><div nfsCardSection>...</div></div>
<label for="kittens">Download kittens</label>
<div nfsSwitch nfsRounded>
  <input nfsSwitchInput type="checkbox" role="switch" id="kittens" name="kittens" />
  <label nfsSwitchPaddle for="kittens"></label>
</div>

<button class="button primary radius bordered shadow" type="button">Primary</button>
<div class="card radius bordered shadow"><div class="card-section">...</div></div>
<label for="kittens">Download kittens</label>
<div class="switch rounded">
  <input class="switch-input" type="checkbox" role="switch" id="kittens" name="kittens" />
  <label class="switch-paddle" for="kittens"></label>
</div>

<!-- A keyboard-reachable scroll region -->
<h3 id="terms-heading">Terms</h3>
<div nfsOverflowY="scroll" style="height: 12rem" tabindex="0" role="region" aria-labelledby="terms-heading">...</div>

<div class="overflow-y-scroll" style="height: 12rem" tabindex="0" role="region" aria-labelledby="terms-heading">...</div>

<!-- Image replacement: the hidden text names the link; the logo image is decorative (NgOptimizedImage) -->
<a href="/" nfsTextHide><img ngSrc="/logo.svg" width="100" height="30" alt="" />ZURB</a>

<a href="/" class="text-hide"><img src="/logo.svg" width="100" height="30" alt="" />ZURB</a>

<!-- Lists and an arrow beside a label -->
<ol nfsListStyleType="lower-roman"><li>...</li></ol>
<button nfsButton aria-expanded="false" aria-controls="topics">Topics <span nfsArrow="down" nfsDisplay="inline-block" nfsMarginLeft="1"></span></button>

<ol class="list-lower-roman"><li>...</li></ol>
<button class="button" type="button" aria-expanded="false" aria-controls="topics">Topics <span class="arrow-down display-inline-block margin-left-1"></span></button>
```

Server and hydrated DOM are identical for every example: the classes are host bindings on signal state, computed the same way on both.

### Animation

None. Foundation's prototype partials declare no transition, and the library adds none. An element that appears or disappears with `@if` takes only the consumer's own keyframe class in `animate.enter` and `animate.leave` (building-blocks 1.6 rule 2). No Motion classes and no `prefers-reduced-motion` override.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the server HTML carries every Utility class, overlaps resolved and responsive classes included, exactly as the hydrated DOM does; the Zero breakpoint and the breakpoint order come from `nfsBreakpointsToken`, the same on server and client, so no class depends on the viewport, and Foundation's media queries do the rest.
- Before hydration: the directives touch no DOM outside host bindings, measure nothing, and start no timer. The development checks and the Runtime check requests run in a render callback, a no-op on the server.
- Full and incremental hydration: host binding values equal the server's, so hydration changes nothing; there is no structure to mismatch and no Hydration boundary of its own.
- Event replay: no directive declares a listener or adds `jsaction`; a scroll region scrolls natively before hydration.
- `@defer`: library templates contain no `@defer`. Inside a dehydrated block a utility is its server HTML. Inside `@defer (hydrate never)` every utility stays applied for good, which suits layout; a bound value that should change later does not go in `hydrate never`.
- Prerendering: identical to SSR; the directives read no request token.

## Testing Decisions

A good test asserts what a user or assistive technology observes: the classes on each element, the computed margins, paddings, sizes, display, position, overflow, radii, borders, shadows, list markers, and text styles, what Tab reaches and how far a region scrolls, where a focused element sits, and the accessible names. No test reads a directive's fields. The patterns are the four layers of building-blocks 1.12 and the [Spec: Label](../issues/94-spec-label.md)'s and [Spec: Menu](../issues/85-spec-menu.md)'s tests, the nearest precedents; the cascade cases are this spec's ticket's measurement, kept as tests.

Story ids follow `prototyping-utilities--<story>`: `prototyping-utilities--component-styling`, `--spacing`, `--sizing`, `--display-and-position`, `--fixed-top`, `--overflow`, `--text-helpers`, `--fonts-and-lists`, `--arrows-and-separators`, `--responsive`, `--composition`. `meta.component` is `NfsPrototypeSpacing`; each story imports `nfsPrototypeClasses`, and its attributes are args. Stories use Foundation's default names only, so the library's Storybook program needs no Variant declaration file (ADR 0040). The Storybook preview turns every prototype breakpoint flag on and includes `nfs-prototyping-utilities` (Sass subsection; the Storybook conventions change the Answer proposes). No story element carries a Foundation class written in the story.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Run by `npx nx test-storybook <lib>`. Every story runs axe with `parameters.a11y.test = 'error'` and the six tags (which include `scrollable-region-focusable`, `color-contrast`, and `target-size`).

- `prototyping-utilities--component-styling`: Foundation's Component Styling: five `nfsButton` buttons with `color`, `nfsRadius` or `nfsRounded`, `nfsBordered`, and `nfsShadow`; a card with `nfsRadius nfsBordered nfsShadow`; a switch with `nfsRounded`, named by a visible `<label for>` as the [Spec: Switch](../issues/84-spec-switch.md) requires; an `NgOptimizedImage` image with `nfsRadius` and an `alt`. Each host carries its component's and its utilities' classes; the rounded button's computed `border-radius` is 5000px and the radius button's 3px; the switch paddle's computed radius is 5000px; `box-shadow` is not `none` on shadowed hosts; `border-top-width` is 1px on bordered ones.
- `prototyping-utilities--spacing`: one box per spacing attribute at counts 0 to 3, and three overlap boxes: `nfsMargin="2" nfsMarginTop="1"` (computed top 16px, other sides 32px), `nfsMarginHorizontal="2" nfsMarginLeft="1"` (left 16px, right 32px), `nfsPadding="1" nfsPaddingVertical="3"` (top and bottom 48px, sides 16px); on every box, no two bound classes name the same side.
- `prototyping-utilities--sizing`: boxes with `nfsWidth` and `nfsHeight` in a parent of known size (computed width 25, 50, 75, and 100 percent of it); a box with an inline `width: 600px` and `nfsMaxWidth100` in a 300 px parent, which renders 300 px wide (images need no attribute: Foundation's base styles already give `img` `max-width: 100%`).
- `prototyping-utilities--display-and-position`: one element per display name (computed `display`); a `nfsPosition="relative"` group with a `nfsPosition="absolute"` child (computed positions), whose links Tab reaches in visual order.
- `prototyping-utilities--fixed-top`: a `nfsPosition="fixed-top"` bar over a tall list of links; the story's `beforeEach` sets `scroll-padding-top` on the document element to the bar's height and restores it afterwards. The bar's computed position is `fixed`, `top` 0, `z-index` 975; no development warning is logged.
- `prototyping-utilities--overflow`: the Terms region of the Rendered HTML (found by `getByRole('region', {name: 'Terms'})`, focusable, computed `overflow-y` `scroll`); a region of links with `nfsOverflowY="scroll"` and no `tabindex`, whose first link Tab reaches; an `nfsOverflow="hidden"` box; the overlap box `nfsOverflow="hidden" nfsOverflowY="scroll"` (computed x `hidden`, y `scroll`).
- `prototyping-utilities--text-helpers`: the image-replacement link of the Rendered HTML, found by `getByRole('link', {name: 'ZURB'})`, with a visible box of at least 24 by 24 px; paragraphs with each `nfsTextTransform` and `nfsTextDecoration` name (computed `text-transform` and `text-decoration-line`); a list of article links with `nfsTextTruncate` whose accessible names are the full titles (computed `text-overflow` `ellipsis`); short `nfsTextNowrap` labels; a long URL with `nfsTextWrap` inside a narrow box.
- `prototyping-utilities--fonts-and-lists`: `nfsFontWide`, `nfsFontNormal`, `nfsFontBold`, `nfsFontItalic` (computed `letter-spacing`, `font-weight`, `font-style`); a `ul` per unordered name and an `ol` per ordered name (computed `list-style-type`), each still a list with its items (`getByRole('list')`, `getAllByRole('listitem')`).
- `prototyping-utilities--arrows-and-separators`: a disclosure button with a decorative `nfsArrow="down"` beside its text, and the four arrows (computed width 0 and the arrow colour on the pointing border); three headings with `nfsSeparator` names (computed `text-align`; the `::after` line's computed width `3rem`), each found by its heading name unchanged.
- `prototyping-utilities--responsive`: `[nfsMargin]="{small: 0, medium: 2, large: 1}"`, `[nfsDisplay]="{small: 'block', medium: 'inline-block'}"`, `nfsBordered="medium"`, and `[nfsWidth]="{small: '100', medium: '50'}"`; the play function asserts the bound classes (`margin-0 medium-margin-2 large-margin-1`, and so on); the e2e layer asserts the geometry per breakpoint.
- `prototyping-utilities--composition`: `nfsCallout color="primary" nfsShadow nfsRadius nfsBorderNone nfsPaddingVertical="2"` and a consumer class on one element: the element carries the callout's classes, the four utilities' classes, and the consumer's class; toggling a bound `nfsShadow` removes only `.shadow`.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

TestBed specs next to the directives over bare test host components, zoneless with `await fixture.whenStable()`; no story is mounted and no axe runs here.

- Host bindings, driven by data: every attribute of every family, with every default name or count, sets exactly its classes; a rules object sets the unprefixed class for the Zero breakpoint's key and `<bp>-` classes above it; a toggle's `true`, bare attribute, `'true'`, `'small'`, and `'small up'` set the unprefixed class, and `'medium'` and `'medium up'` the `medium-` class; `false`, `'false'`, and no value set none; a static spacing string sets its count; a value reached through `$any()` that holds a space sets none; changing one attribute swaps only its own classes and leaves the consumer's static class, its `[class]` binding, and other directives' classes alone.
- Resolution through the DOM: the three spacing overlap boxes and the overflow overlap of the stories; a rules object that changes one side at `medium` binds only that side's `medium-` class.
- Element-qualified lists: `ul nfsListStyleType="square"` sets `list-square`; `ol nfsListStyleType="upper-roman"` sets `list-upper-roman`.
- Composition: `nfsButton`, three utility directives, a consumer static class, and a consumer `[class.x]` binding on one element: the element carries the union.
- Breakpoint order: with `nfsBreakpointsToken` providing `xlarge`, `[nfsMargin]="{small: 2, xlarge: 0}"` binds `margin-2 xlarge-margin-0`; with the Zero breakpoint renamed in the token, its rule sets the unprefixed class.
- Development checks: the copied-class check for one class of each family (warns once, naming the attribute) and silence for a consumer class; the overflow check for an overflowing region without `tabindex` and without focusable content (warns), with a link inside (silent), with `tabindex="0"` and no name (warns about the name), with `tabindex="0"`, `role="region"`, and `aria-labelledby` (silent), and for content that fits (silent); the fixed bar check with no `scroll-padding` (warns, naming the height) and with enough (silent); the text-hide check with only text (warns), with an `img` (silent), and with a background image (silent); the field check for `nfsBordered` and `nfsBorderNone` on `input`, `select`, and `textarea` (warns) and on a `div` (silent). Nothing is checked or warned when `ngDevMode` is false.
- Runtime check: with a style block standing in for the `nfs-prototyping-utilities` Variant properties on Foundation's defaults with every flag on, every default value is silent; a count above `--nfs-prototype-spacers-count` bound through a cast reports `strictVariantNames` once, naming `nfsPrototypeSpacing`, the attribute, the value, and `$prototype-spacers-count`; with `--nfs-prototype-spacing-breakpoints` empty, `[nfsMargin]="{medium: 1}"` reports once, naming `$prototype-spacing-breakpoints`; in a test file of its own, with no style block, one `strictVariantProperties` report names `@include nfs-prototyping-utilities;` however many directives render.
- Zoneless: the suite runs with zoneless change detection; no test needs `NgZone`.

### 3. Node-level Vitest

- SSR smoke through the shared `renderServer()` helper, under `npx nx test <lib>`: a fixture with one element per family, the spacing and overflow overlaps, a rules object, a query toggle, a list of each kind, and a scroll region. `whenStable()` resolves; the server HTML carries every expected class and the consumer's own attributes; no element carries `jsaction` from a directive; no development warning or Runtime check report is made on the server.
- Pure logic: the resolution function over a truth table: every combination of the seven spacing attributes as bare values at two counts; rules objects that change one side, one axis, and all sides at `medium` and `large`; a side that keeps its value across breakpoints (no class above the first); the Zero breakpoint key; a custom breakpoint order; the overflow pair. Each case asserts the class set and that no two classes at one breakpoint name the same side.
- Sass compile, over Foundation 6.9.0's settings file and an overrides file after it, with `@import 'ngx-foundation-sites';` and `@include foundation-prototype-classes;` before the library include:
  - Foundation's defaults plus `@include nfs-prototyping-utilities;` emit exactly one `:root` rule with the ten registry properties (`--nfs-prototype-display: inline inline-block block table table-cell;`, `--nfs-prototype-position: static relative absolute fixed;`, `--nfs-prototype-overflow: visible hidden scroll;`, `--nfs-prototype-sizes: 25 50 75 100;`, `--nfs-prototype-text-decoration: overline underline line-through;`, `--nfs-prototype-text-transformation: lowercase uppercase capitalize;`, `--nfs-prototype-style-type-unordered: disc circle square;`, `--nfs-prototype-style-type-ordered: decimal lower-alpha lower-latin lower-roman upper-alpha upper-latin upper-roman;`, `--nfs-prototype-arrow-directions: down up right left;`, `--nfs-prototype-spacers-count: 3;`) and the sixteen flag properties empty, and no other rule.
  - Each flag set to `true` after the settings file writes its property as `small medium large`; `$global-prototype-breakpoints: true` alone after the settings file writes them all empty (the documented no-op, Sass subsection).
  - `$prototype-spacing-breakpoints: true` adds the spacing copy for `large` only, in breakpoint order, 4087 bytes compressed (measured); with `$breakpoint-classes: (small medium large xlarge)` it prints `large` then `xlarge` (8224 bytes, measured); with the flag off it prints nothing.
  - Rendered in a browser page, the compiled CSS of these cases gives the measured values: `medium-margin-1 large-margin-0` is 0 at 1100 px; `medium-margin-2 large-margin-1 xlarge-margin-0` is 0 at 1300 px with `xlarge` added (layer 4 repeats it in three engines).
  - `$prototype-arrow-color: #bbbbbb` set after `@import 'foundation'` warns once, naming the setting, the colour, `$body-background`, and the ratio (1.90:1); the default compiles silently.
  - `$prototype-sizes` merged with `33: 33.333%` lists `25 50 75 100 33`; `$prototype-spacers-count: 5` writes `5`; `$prototype-display: ()` writes the property empty.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build, in Chromium, Firefox, and WebKit:

- Responsive geometry: `prototyping-utilities--responsive` at 400, 700, and 1100 px: margin 0, 32, and 16 px (the decreasing case Foundation's order breaks without `nfs-prototyping-utilities`), display `block` then `inline-block`, border width 0 then 1px, width 100 then 50 percent.
- Keyboard scrolling: in `prototyping-utilities--overflow`, Tab reaches the Terms region, ArrowDown twice scrolls it (`scrollTop` above 0 after the smooth scroll settles), and Tab reaches the first link of the region of links.
- Focus not obscured: in `prototyping-utilities--fixed-top`, Tab through every link; each focused link's rectangle lies below the bar's bottom edge.
- Reflow and text spacing: at 320 by 640 px, with and without the text-spacing stylesheet, `document.documentElement.scrollWidth` is at most 320 in `--spacing`, `--sizing`, and `--text-helpers`.

Against the prerendered fixture app, on the Prototyping Utilities route:

- JavaScript disabled: screenshot plus axe (`@axe-core/playwright` with the six tags) on the server HTML; every element carries its classes and the layout is final before any script runs.
- Hydration: no NG05xx in the console and `ngDevMode.componentsSkippedHydration === 0`.

## Out of Scope

- Foundation's Sass-only helpers: the box, rotate, and relational (`nth-child`) mixins and the per-family mixins (`margin()`, `padding()`, `position()`, `display()`, and the rest). They print no class, so there is nothing for a directive to set; they stay the consumer's Sass for its own CSS, as Foundation's docs recommend for production. Category: `scope-boundary`.
- `foundation-prototype-typescale`: the docs' include list names it, but Foundation 6.9.0 has no such mixin (searched in its Sass), so there are no classes to cover. Category: `other`.
- An attribute or a keyed input for names a consumer adds to `$prototype-sizing` (for example `min-width`): the list names CSS properties, which are attribute names fixed at compile time; Foundation documents extending `$prototype-sizes`, not this list; a keyed input is additive if a consumer asks (D10). Category: `other`.
- Detecting which of Foundation's prototype export mixins a consumer included: the Runtime checks read the Variant properties the library mixin writes, not Foundation's rules, so a family whose export mixin is missing renders no style and is not reported (D19). Category: `platform-or-a11y`.
- Logical-direction spacing (`margin-inline-start`) for right-to-left layouts: Foundation's classes are physical; a margin that follows the reading direction is the consumer's own CSS. Category: `scope-boundary`.
- `display: flex` (`.flex-container`), `display: none` (`.hide`), text alignment (`.text-center`), and `.no-bullet`, which the docs point to: the [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md), the [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md), and the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md). Category: `scope-boundary`.
- The Variant registries, the helper types, the manifest rows, and the declaration-file generator: [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md); the Runtime checks' configuration: [Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md). Category: `scope-boundary`.
- Runtime theming through custom properties (building-blocks 1.13). Category: `scope-boundary`.

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | Attribute directives on the consumer's elements; entry point `ngx-foundation-sites/prototyping-utilities` | ADR 0001 and ADR 0039: the utility families get directives, and Foundation generates nothing; one entry point per docs page, so a `@defer` block can split it | A component that wraps content (Foundation's markup carries the element; ADR 0001) (`scope-boundary`); no directives, the classes written by the consumer (overruled by the user, ADR 0039) (`superseded`) |
| D2 | One directive class per Foundation export mixin, eighteen in all, and no import array (the Utility directive rule, clause 1; ADR 0046) | The export mixin is the unit the consumer includes in Sass, so imports mirror the stylesheet; its classes are the ones that overlap, so the attributes that must be resolved together share an instance; an element gets one instance per family it uses | One directive class for the whole page (every instance would create all 42 attribute inputs on every element that carries one, and every family's code would ship as one) (`other`); one directive class per attribute (42 imports, and the overlapping attributes could not see each other) (`other`); one class per docs section (Foundation's docs group Component Styling and Text Helpers differently from its mixins, so imports would not mirror the includes) (`other`); `nfsPrototypeClasses`, a read-only array of the eighteen for a one-line import (it hides its members from the unused-imports diagnostic and the cleanup migration, ADR 0046) (`superseded`) |
| D3 | Utility attributes: each input's public name is one of its directive's attribute selectors, `nfs`-prefixed (clause 2) | The attribute reads like Foundation's class where the docs write it; `nfs` names cannot capture another directive's input or a native attribute (the Dropdown pane's and Tooltip's `position`, the Button's `size` and `color`, `img` and `iframe` `width` and `height`); any attribute creates the directive, so none is required | One `nfsPrototype` attribute with plain inputs (`<div nfsPrototype margin="1" position="relative">`: `position` would also feed a Dropdown pane or Tooltip on the element, and `width` would capture an image's native attribute) (`other`) |
| D4 | Attribute names from the class stem, the CSS property where the stem is shared or shortened, fitting classes as values, and booleans named after their classes (clause 3) | Mechanical, so the Float Classes and Typography Helpers specs derive theirs (`nfsFloat`, `nfsClearfix`, `nfsTextAlign`) and the published placeholders `nfsTextAlign` and `nfsShowForSr` already fit; `nfsText` would be ambiguous between transformation, decoration, and alignment | `nfsList` (an ambiguous stem that reads as a list component) (`other`); enums for Foundation's single classes that share a property (`nfsFontWeight="bold"` for `.font-bold`; the rule of building-blocks 1.4 makes a single class a boolean) (`other`) |
| D5 | Values typed by ADR 0040: names over the registries of the [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md), a count 0 to `$prototype-spacers-count`, the closed separator alignments, booleans through a typed transform; size names are strings | The user wants a misspelt or removed name to fail to compile; the tooling spec already declares the prototype registries and the spacer range; the declaration file writes numeric-like names as quoted strings, and a bare numeric key measured there broke the union | Numbers for size names (a second spelling of each name, and a transform for a family whose names need not be numeric) (`other`); `booleanAttribute` for toggles (accepts any value, ADR 0040) (`other`) |
| D6 | The responsive form is the same attribute: a rules object for valued attributes, a Breakpoint query with `up` only for toggles; Class breakpoints only | Building-blocks 1.4 and 1.7; Foundation generates only `min-width` forms for the Prototype families, so `only` and `down` would offer classes that do not exist | One attribute per breakpoint (`nfsMediumMargin`) (building-blocks 1.4 forbids it) (`variant-as-class`); a rule string (would spell class names, ADR 0039) (`variant-as-class`) |
| D7 | Overlap within a family resolved by the directive: the most specific attribute wins per side at each breakpoint, and no two bound classes set one side (clause 6) | Measured in three engines: Foundation's source order makes `margin-2 margin-top-1` a 2rem top margin, `margin-horizontal-2 margin-left-1` a 2rem left margin, and `overflow-scroll overflow-x-hidden` scroll horizontally; the result would depend on the numbers | Binding each attribute's class as written (the measured source-order results) (`other`); a development warning for overlapping attributes (reports what the directive can fix) (`other`); a library CSS rule re-ordering the side classes (Foundation's all-sides and axis classes would still override each other by value) (`other`) |
| D8 | `nfs-prototyping-utilities` prints Foundation's responsive spacing rules again in breakpoint order, for every Class breakpoint after the first responsive one, from Foundation's `breakpoint()`, `margin()`, `padding()`, `margin-direction()`, and `padding-direction()` mixins, only while `$prototype-spacing-breakpoints` is on | Measured in three engines: Foundation prints them count by count, so `medium-margin-1 large-margin-0` keeps 16 px at 1100 px; with the copy it is 0, and the three-breakpoint case with `xlarge` is right too; the first responsive breakpoint needs no copy, since only base rules precede it; 4087 bytes compressed on Foundation's breakpoints, nothing while the flag is off | Documenting that a larger breakpoint may not ask for less spacing (a typed rules object would then accept values that render wrong) (`other`); the directive choosing classes to avoid the conflict (no class set can, because every responsive class is a `min-width` rule) (`other`) |
| D9 | Two directive classes for list style, `ul[nfsListStyleType]` and `ol[nfsListStyleType]`, typed over their own lists | Foundation qualifies the classes by element, so `ol.list-disc` has no rule; element-qualified selectors give each element the type of its own list, so the mistake fails to compile | One directive over both lists with a development check (a class with no CSS compiles) (`other`) |
| D10 | `nfsWidth` and `nfsHeight` are the sizing attributes; `$prototype-sizing` is not a registry | Its names are CSS properties, which become attribute names, and a template cannot grow attributes from Sass; Foundation documents extending `$prototype-sizes`, which stays a registry | A keyed `[nfsSizing]="{width: '50'}"` input for every name (a second spelling of the common case; additive later) (`other`); the registry kept with no input over it (a type that checks nothing) (`other`) |
| D11 | One computed class list per directive; copied Foundation classes are reported in development, not stripped | The families own hundreds of classes, and a class record holding each as `false` to strip copies would be that large per instance; the Label's and Callout's precedent | A class record that strips copies (the Menu's shape, sized for a handful of classes) (`other`); no check (a silent second spelling) (`other`) |
| D12 | Directive classes `NfsPrototype<Family>`; value aliases with `Name`, `Count`, or `Align`, attribute aliases with `Input` and, for transformed inputs, `Value` | Derived from the export mixins, the class names collide with no Structural class directive or type (a bare `NfsPosition` is the Anchored pane's placement type); the suffixes keep the aliases apart from the classes | `NfsDisplay`, `NfsPosition`, and the like (collide with the Anchored pane's `NfsPosition`) (`other`); `NfsPrototypeDisplay` as the value alias (collides with the directive class) (`other`) |
| D13 | Scroll regions: a development check and the recipe (`tabindex="0"`, `role="region"`, a name, or focusable content); the directive binds no `tabindex` | Measured: WebKit leaves a plain scroller out of the tab order, and axe reports it in every engine; a name must come from the consumer; a bound `tabindex` would fight an Aria-hosted element's own (a scrollable tab panel) and the consumer's static or bound value. The [Spec: Table](../issues/92-spec-table.md)'s `nfsTableScroll` does bind `tabindex` and `role`, because it owns Foundation's wrapper element, which always scrolls; an overflow utility sits on any element, other directives' included, and scrolls only when its content overflows | A bound `tabindex="0"` whenever a scroll value is set (collides with Aria's `tabindex` binding and adds a tab stop to regions that hold focusable content) (`platform-or-a11y`); relying on the platform (Chromium before 130, in the Browser target, and WebKit do not focus scrollers) (`platform-or-a11y`) |
| D14 | A fixed bar at the top or bottom edge warns when the document scroller's `scroll-padding` on that edge is smaller than the bar | 2.4.11; the [Spec: Sticky](../issues/28-spec-sticky.md) meets the same criterion with required consumer `scroll-padding` and a development warning | A library `scroll-padding` rule (the library cannot know the bar's height, and `html` is the consumer's) (`other`) |
| D15 | `nfsTextHide` warns in development when nothing visible replaces the text; the recipe puts `alt=""` on an image that shows the hidden words | A text-only element under `font: 0/0` has no visible box (2.4.7, 2.5.8); Foundation's example doubles the name | Dropping `.text-hide` (the class exists and has a correct use with a background image or a decorative logo) (`other`); a check for a doubled name (not a WCAG failure) (`other`) |
| D16 | `nfsBordered` and `nfsBorderNone` warn on `input`, `select`, and `textarea` | `.bordered` replaces the field's `$input-border` by source order with a colour about 1.6:1 on the page, and `.border-none` removes the boundary; the Forms spec requires 3:1 (1.4.11) | A compile-time check of `$prototype-border-color` (it is decoration everywhere but on a field, and the mixin cannot see where it is used) (`other`) |
| D17 | `nfs-prototyping-utilities` warns (`@warn`) when `$prototype-arrow-color` is under 3:1 against `$body-background`; the docs set the arrow settings after `@import 'foundation'` | An arrow that shows a menu's presence is a graphical object (1.4.11), but it may be decoration and sits on unknown backgrounds, so a warning, as `nfs-menu-icon` warns for the dark menu icon; measured, Foundation's arrow partial assigns both settings without `!default`, so an earlier value is replaced | `@error` (refuses a decorative light arrow) (`other`); no check (`other`) |
| D18 | `nfsTextTruncate`, `nfsTextNowrap`, `nfsOverflow="hidden"`, `nfsDisplay="table"` and `"table-cell"`, and positioned content get documented requirements and story coverage, not checks | Whether truncated text is available elsewhere, text is short, a table is tabular, or DOM order matches the visual order is content the directives cannot read | Development checks on widths and heights (resize-dependent, with no stable first-render answer) (`other`) |
| D19 | Runtime checks: every directive includes `nfs-prototyping-utilities` with `prototype-spacers-count` as the presence marker plus its own registry settings; a responsive class needs its family's flag property; the handle is named after the directive class | `--nfs-prototype-spacers-count` is never empty, so it tells a missing include from an emptied list; the flag properties follow building-blocks 1.13's gated-family rule and name the flag the consumer must set; several attributes create one instance, so no single attribute names it | A presence property that is not a Variant property (building-blocks 1.13 does not adopt one) (`other`); one handle per attribute (the contract creates one per directive, at construction) (`other`) |
| D20 | No `exportAs`, Defaults token, role, name, state, listener, or providers | The utilities have no state to read and no Options; everything they do is a class | `exportAs` for parity with component directives (nothing to read but the attribute the consumer wrote) (`other`) |
| D21 | Across families, Foundation's cascade decides: `nfsTextTruncate`'s `overflow: hidden` loses to `nfsOverflow` (printed later), `nfsRounded` beats `nfsRadius` (`!important`), `nfsFontBold` beats `nfsFontNormal` (printed later), `nfsBordered` and `nfsBorderNone` meet by `!important`, and `nfsSeparator`'s `::after` replaces another `::after` drawing on the same element (a Button's dropdown arrow) | Each pair is two different Foundation utilities asked of one element, not an overlap within one template; documented in the Notes | Resolving across directives (would couple independent families through DI for combinations with no meaning) (`other`) |
| D22 | Eleven stories; e2e for responsive geometry, keyboard scrolling, focus under a fixed bar, reflow, and text spacing in three engines, and the fixture app's first paint and hydration | Breakpoints, real keys, and geometry need real engines; everything else is DOM state a play function reads | A story per family (seventeen stories for what eleven cover) (`other`) |
| D23 | Glossary terms **Utility family** and **Utility attribute**, and **Prototyping Utilities** on the Foundation side | The rule needs names for the unit and for the input shape the next utility specs reuse | Calling the attributes Variant inputs (a Variant input selects a look for a Structural class, and a utility family has none) (`other`) |
| D24 | The rule's scope clause (clause 0): Utility attributes for classes that stand alone and set independent properties; building-blocks 1.4's role shape for families with roles (Flexbox Utilities); one directive with Foundation's `<words>-for-<bp>` inputs for a family that expresses one effect (Visibility Classes); in every shape, an un-prefixed input either shares no name with another directive's input on the same element or is reported | The three families differ in kind: Flexbox's alignment classes work only on a flex parent, so they modify a role; Visibility's templates all decide one thing, whether the element shows, and building-blocks 1.4 already names their inputs `showFor` and `hideFor`; the Prototyping Utilities' seventeen export mixins set unrelated properties, so no host or role could name their inputs without collisions (D3). Collision safety is what all three must guarantee | One shape for every utility family (reopens two resolved specs whose shapes follow building-blocks 1.4, and a single host for seventeen unrelated properties is the collision-prone shape D3 rejects) (`other`) |

### Usage examples

```html
<!-- A quick layout: spacing, sizing, and display side by side -->
<section nfsPaddingVertical="3" nfsMarginBottom="2">
  <img ngSrc="/hero.jpg" width="1200" height="600" alt="Harbour at dawn" nfsRadius />
  <p nfsTextTransform="uppercase" nfsFontWide>Now boarding</p>
</section>

<!-- A responsive card row: stacked on small screens, side by side from medium -->
<div nfsCard [nfsWidth]="{small: '100', medium: '50'}" [nfsDisplay]="{small: 'block', medium: 'inline-block'}" nfsShadow="medium">...</div>

<!-- A fixed bar with its height reserved in the page's own CSS: html { scroll-padding-top: 4rem; } -->
<header nfsPosition="fixed-top" nfsPaddingHorizontal="1">...</header>

<!-- A scroll region a keyboard can reach -->
<h2 id="log-heading">Build log</h2>
<pre nfsOverflowY="scroll" tabindex="0" role="region" aria-labelledby="log-heading">...</pre>
```

```ts
@Component({
  selector: 'app-release-notes',
  imports: [NfsCallout, NfsPrototypeListOrdered, NfsPrototypeRounded, NfsPrototypeSeparator, NfsPrototypeShadow, NfsPrototypeSpacing, NfsPrototypeTextUtilities],
  template: `
    <div nfsCallout nfsShadow nfsRadius [nfsPadding]="compact() ? 1 : 3">
      <h2 nfsSeparator="left">Release notes</h2>
      <ol nfsListStyleType="lower-roman">
        @for (note of notes(); track note.id) {
          <li><a [href]="note.url" nfsTextTruncate>{{ note.title }}</a></li>
        }
      </ol>
    </div>
  `,
})
export class ReleaseNotes {
  readonly notes = input.required<readonly { id: string; url: string; title: string }[]>();
  readonly compact = input(false);
}
```

The consumer's Variant declaration file, as the library's tooling generates it from `$prototype-sizes: map-merge($prototype-sizes, (33: 33.333%));`, `$prototype-display: (inline, inline-block, block, flex);`, and `$prototype-spacers-count: 5;`:

```ts
import 'ngx-foundation-sites';

declare module 'ngx-foundation-sites' {
  interface NfsPrototypeDisplayOverrides {
    flex: true;
    table: false;
    'table-cell': false;
  }
  interface NfsPrototypeSizesOverrides {
    '33': true;
  }
  interface NfsPrototypeSpacersCountOverrides {
    count: 5;
  }
}
```

With it, `nfsWidth="33"`, `nfsDisplay="flex"`, and `nfsMargin="5"` compile; `nfsDisplay="table"` and `nfsMargin="6"` fail (ADR 0040). `NfsCallout` comes from `ngx-foundation-sites/callout` and is shown only to place it.

### Platform features to adopt when the browser target moves

- Keyboard-focusable scroll containers: Chromium focuses a scroller with no focusable content from version 130 (Chrome Platform Status; measured in Chromium 153), and Firefox does (measured in Firefox 155), but WebKit does not (measured in WebKit 26.6), and the Browser target starts at Chrome 119. When every engine of the target does, the overflow check's `tabindex` warning can go; its name warning stays for regions users land on, and axe's `scrollable-region-focusable` rule would have to follow.

### Foundation behaviour changed or dropped

- Overlapping attributes of one family are resolved per side, so the more specific one wins whatever its number (D7).
- Responsive spacing is printed again in breakpoint order by `nfs-prototyping-utilities`, so a larger breakpoint may ask for less (D8).
- List style attributes are typed per list element (D9).
- A scroll region takes `tabindex="0"`, `role="region"`, and a name, or holds focusable content (D13); a fixed bar reserves its height with `scroll-padding` (D14).
- The image-replacement example puts `alt=""` on a logo that shows the hidden words (D15).
- The docs' per-family include list loses `foundation-prototype-typescale`, which does not exist, and the arrow settings and the breakpoint flags are set in the forms the Sass subsection gives.

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. These directives rely on Foundation's export mixins `foundation-prototype-classes`, or the family mixins `foundation-prototype-spacing`, `-sizing`, `-display`, `-overflow`, `-position`, `-border-box`, `-border-none`, `-bordered`, `-rounded`, `-shadow`, `-arrow`, `-separator`, `-font-styling`, `-list-style-type`, `-text-utilities`, `-text-transformation`, and `-text-decoration` (Prototype mode; `foundation-everything($prototype: true)` includes all of them), configured through the `$prototype-*` settings. Its documented custom CSS is the `nfs-prototyping-utilities` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after Foundation's prototype export mixins.

1. Rules. (a) While `$prototype-spacing-breakpoints` is on, for every Class breakpoint after the first one above the Zero breakpoint, in `$breakpoint-classes` order and inside Foundation's `breakpoint()` for it, every spacing class of that breakpoint again, count by count: `.<bp>-margin-<n>` and `.<bp>-padding-<n>` through Foundation's `margin()` and `padding()` with the count on all four sides, and `.<bp>-margin-<side>-<n>` and `.<bp>-padding-<side>-<n>` through Foundation's `margin-direction()` and `padding-direction()`. Reason: Foundation prints its responsive spacing rules count by count, so a larger breakpoint's rule with a smaller count loses by source order (measured in three engines, D8); the copies carry the same selectors and `!important` declarations and win by following Foundation's, in breakpoint order. On Foundation's breakpoints it prints the `large` rules only (4087 bytes compressed); with the flag off, nothing. (b) `:root { ... }` with the Variant properties in (6). (c) A compile-time check that emits no CSS: `@warn` when `$prototype-arrow-color` is under 3:1 against `$body-background`, naming both colours and the ratio, computed by the library's exact relative-luminance helper (`math.pow`, a translucent colour composited over `$body-background` first), unrounded (D17).
2. Reused, read from the consumer's compile: `$breakpoint-classes`, `$breakpoints` (through `breakpoint()`), `$prototype-spacing-breakpoints`, `$prototype-spacers-count`, `$global-margin` and `$global-padding` (through `margin()` and `padding()`), every `$prototype-*` list and flag in (6), `$prototype-arrow-color`, `$body-background`, and Foundation's `breakpoint()`, `margin()`, `padding()`, `margin-direction()`, and `padding-direction()` mixins. No Foundation value is copied; 3 is WCAG's number. The mixin takes no parameters.
3. Custom properties the directives write: none.
4. Motion classes: none, and no `prefers-reduced-motion` override, because nothing animates.
5. Missing include: a responsive spacing value that decreases at a larger breakpoint renders the smaller breakpoint's spacing; the Variant properties are absent, which the `strictVariantProperties` Runtime check reports in development, naming the include (D19), and the Variant declaration file's generator cannot list the prototype names; the arrow check does not run.
6. Variant properties: the registry properties `--nfs-prototype-display`, `--nfs-prototype-position`, `--nfs-prototype-overflow`, `--nfs-prototype-sizes` (the keys of `$prototype-sizes`), `--nfs-prototype-text-decoration`, `--nfs-prototype-text-transformation`, `--nfs-prototype-style-type-unordered`, `--nfs-prototype-style-type-ordered`, `--nfs-prototype-arrow-directions`, and `--nfs-prototype-spacers-count` (a bare count), each list joined with `space`, because Sass interpolates a list with commas, and written empty (`#{''}`) when the list is empty; and the flag properties `--nfs-prototype-<flag>-breakpoints` for `border-box`, `border-none`, `bordered`, `display`, `font`, `list`, `overflow`, `position`, `rounded`, `separator`, `shadow`, `sizing`, `spacing`, `decoration`, `transformation`, and `utilities`, each listing `$breakpoint-classes` while its flag is on and written empty while it is off, read only by the Runtime checks and not in the Variant manifest. Only `nfs-prototyping-utilities` writes them.

Required settings on Foundation's defaults: none.

Turning on the responsive forms: Foundation's settings file assigns every family's flag from `$global-prototype-breakpoints` in its own Prototype sections, so `$global-prototype-breakpoints: true` works only in the consumer's copy of the settings file, at its Global section; in an overrides file after the settings file it does nothing (measured). From an overrides file, set each flag the application needs before `@import 'foundation'`:

```scss
$prototype-spacing-breakpoints: true;
$prototype-display-breakpoints: true;
```

The arrow settings: Foundation's arrow partial assigns `$prototype-arrow-size` and `$prototype-arrow-color` without `!default`, so a value in the consumer's copy of the settings file, or anywhere before `@import 'foundation'`, is replaced (measured). Set them after the import and before the arrow's export mixin:

```scss
@import 'foundation';
$prototype-arrow-color: $dark-gray;
@include foundation-prototype-classes;
@import 'ngx-foundation-sites';
@include nfs-prototyping-utilities;
```

### Notes

- RTL: every side and alignment is physical, as Foundation's classes are: `nfsMarginLeft` stays on the left, and `nfsSeparator="left"` aligns left in a right-to-left page; `position-fixed-top` spans both edges. No rule or `Directionality` is needed.
- Forced colours: borders, arrows (border colours), and separators take system colours; shadows are removed by the engine; nothing the utilities draw carries information on its own.
- Composition: the directives bind nothing another directive binds, so they sit beside component directives, beside each other, and beside a consumer's own `[class]` bindings. The cross-family pairs in D21 follow Foundation's cascade. `nfsSeparator` belongs on headings: its `::after` line replaces another `::after` drawing on the same element.
- `nfsArrow` belongs on an empty element; its `display: block` stacks it unless `nfsDisplay="inline-block"` sits beside it, as the docs' own arrows do.
- Story scaffolding: stories lay out their scaffolding with these attributes wherever Foundation has a class, and keep inline styles for values it has none for (an `overflow: auto` or `overflow: clip` region, a tall page, a fixed pixel width).
- The attributes feed a directive only on the elements their selectors name: a static `nfsListStyleType` on a `div` is an unknown attribute that sets nothing, and a bound one fails to compile.
