# Spec: Typography Helpers

Ticket: [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Written under the class rule ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)), the Variant typing rules ([ADR 0040](../adr/0040-variant-input-types.md)), and the Utility directive rule of the [Spec: Prototyping Utilities](../issues/102-spec-prototyping-utilities.md) (its clauses 0 to 7), whose stand-alone shape every class here takes.

## Problem Statement

A developer on Foundation for Sites styles text with Foundation's Typography Helpers: `.text-left`, `.text-right`, `.text-center`, and `.text-justify` with a responsive form for every Class breakpoint (`.medium-text-center`), `.subheader` for a lighter heading, `.lead` for an introductory paragraph, `.no-bullet` on a `ul` or `ol`, `.h1` to `.h6` to give any element a heading level's size (the Typescale section), and `.stat` for a large number. The same Sass mixin also prints `.cite-block`, `.code-inline`, and `.code-block`, which Foundation documents on its Typography Base page. The markup contract leaves the hard parts to the author:

- Foundation's default `$subheader-color` and `$cite-color` are `$dark-gray`, 3.423:1 on the page (exact WCAG formula), and `$header-small-font-color`, the colour of a `small` inside a heading or a `.h<n>` element, is `$medium-gray`, 1.625:1. Measured in Chromium, Firefox, and WebKit with axe: at 400 px the `h2` to `h6` subheaders of Foundation's own example fail `color-contrast` (only the 24 px `h1` passes as large text), at 1100 px the `h5` and `h6` subheaders still fail, and every `cite`, `.cite-block`, and heading `small` fails at both widths (WCAG 2.2 success criterion 1.4.3).
- `.code-block` is `overflow: auto` with `white-space: pre`, so a long line scrolls inside the block. Such a block with no focusable content is out of the tab order in WebKit (measured in WebKit 26.6, and in Chromium before version 130, which the Browser target includes), and axe reports it (`scrollable-region-focusable`) in every engine (2.1.1). Foundation's example shows the class alone.
- `.no-bullet` removes the markers and sets `margin-left: 0` at a specificity of one class and one element. On a list that is also an XY margin grid, or a Float or Flex Grid row, that replaces the grid's own left margin (measured in three engines: a margin grid loses its negative gutter and moves half a gutter to the right; a row stops centring). The XY Grid, Float Grid, Flex Grid, and Card specs all leave their list grids' markers to this spec.
- WebKit exposes a `ul` or `ol` with no ARIA role and no visible markers as a group, not a list, unless it sits inside a navigation landmark (WebKit's list heuristic), so a list of cards without bullets loses its item count in VoiceOver (1.3.1).
- The Typescale section's own callout says that heading levels must not be skipped and that `.h1` on an `h2` keeps the outline right; its "For text" example (`<p class="h1">`) makes a paragraph look like a heading, which is a 1.3.1 failure wherever that text is a heading. Foundation's Sass comment for `.subheader` pairs an `h1` with an `h2` in a `header`, which gives a subtitle a section heading of its own; HTML now groups a heading with its subtitle in `hgroup`.
- A static attribute named after an HTML presentational attribute changes the host: measured in three engines, `align="center"` on a `p` or `div` and `align="right"` on an `h2` align the text, and `type="i"` on an `ol` switches its markers to roman numerals under Foundation's CSS. An input named `align` for these classes, or `type` for list styles, would do that whenever it is written as a static attribute ([Decide: inputs named like HTML presentational attributes](../issues/139-decide-inputs-named-like-presentational-attributes.md)).
- Foundation prints the typography classes before every component, at the same specificity as most component rules, so `.text-left` on a `.button`, `.badge`, or `.title-bar-right` changes nothing (measured in three engines), and the Prototyping Utilities' `.separator-*` (`!important`) overrides any alignment class.
- Under the library's class rule the developer writes none of these classes, so every one of them needs an Angular home.

A server-rendered application adds the usual second problem: whatever the Angular layer does must already be right in the server HTML, must not break hydration, and must leave the page styled before hydration and inside dehydrated `@defer` blocks.

## Solution

Four attribute directives, one per Foundation export mixin (the Utility directive rule, clause 1), set every class through nine Utility attributes written where Foundation's docs write the class. `NfsTextAlignment` sets the alignment classes from `nfsTextAlign`, a closed name (`nfsTextAlign="center"`) or a Breakpoint rules object (`[nfsTextAlign]="{small: 'left', medium: 'center'}"`). `NfsTypographyHelpers` sets `.subheader`, `.lead`, `.stat`, `.cite-block`, `.code-inline`, and `.code-block` from the booleans `nfsSubheader`, `nfsLead`, `nfsStat`, `nfsCiteBlock`, `nfsCodeInline`, and `nfsCodeBlock`. `NfsNoBullet` on a `ul` or `ol` sets `.no-bullet` from `nfsNoBullet`. `NfsTypographyBase` sets `.h1` to `.h6` from `nfsHeadingSize`, a heading level from 1 to 6 (`<h2 nfsHeadingSize="1">`), so no class name is ever written as a value. A misspelt alignment, a seventh heading size, or `nfsNoBullet` bound on a `div` fails to compile. No attribute is named after an HTML presentational attribute.

The directives bind only their own classes, declare no listener, and add no role, so they sit beside each other and beside any component directive: `<ul nfsPagination nfsTextAlign="center">`, `<ul nfsGridX [up]="{small: 1, medium: 3}" nfsNoBullet role="list">`. Two Library mixins, one per export mixin that needs one: `nfs-typography-helpers` gives a list that is also a margin grid or a grid row its own left margin back and stops the compile when the subheader, citation, or code colours are under 4.5:1; checks-only `nfs-typography-base` stops the compile when a heading's `small` text is under 4.5:1. On Foundation's defaults the developer sets three colours to `#737373` (4.701:1). In development a code block that scrolls but no keyboard can reach, and Foundation's classes copied onto a host, are reported. The recipes carry the rest: a subtitle is a `p nfsSubheader` in an `hgroup`, a heading keeps its level and takes another level's look with `nfsHeadingSize`, a statistic follows its label, and a list whose count matters outside a `nav` carries `role="list"`.

## User Stories

1. As an application developer, I want to write `nfsTextAlign="center"` where Foundation's docs write `class="text-center"`, so that I align text with no Foundation class.
2. As an application developer, I want `nfsTextAlign` to take `left`, `right`, `center`, and `justify` only, so that `nfsTextAlign="centre"` and `nfsTextAlign="text-center"` fail to compile.
3. As an application developer, I want `[nfsTextAlign]="{small: 'left', medium: 'center'}"` to give left-aligned text on small screens and centred text from medium up, so that Foundation's responsive alignment classes need no class string.
4. As an application developer who adds `xlarge` to `$breakpoint-classes`, I want `[nfsTextAlign]="{xlarge: 'right'}"` to compile once my Variant declaration file lists it, so that my own Class breakpoints are typed.
5. As an application developer, I want a development report when a rules key names a Class breakpoint my compiled CSS lacks, so that drift between my Sass and my types surfaces early.
6. As an application developer, I want `nfsTextAlign="center"` on my `ul nfsPagination` to centre its items, so that Foundation's Centered pagination needs no class.
7. As an application developer, I want `nfsTextAlign="right"` beside `nfsFormLabel` to right-align a form label, so that Foundation's Label Positioning example needs no class.
8. As an application developer, I want the spec to tell me which component classes keep their own alignment whatever `nfsTextAlign` says (a button, a badge, a title bar's right section, input group labels and buttons, Orbit's bullets) and that a Prototyping separator overrides it, so that I do not wonder why nothing changes.
9. As an application developer, I want `nfsSubheader` on a heading or paragraph, so that I get Foundation's lighter heading look.
10. As an application developer, I want the spec's subtitle recipe (`hgroup` with a `p nfsSubheader`), so that a subtitle does not become a section heading of its own.
11. As an application developer, I want `nfsLead` on a paragraph, so that I get Foundation's lead paragraph.
12. As an application developer, I want `nfsNoBullet` on a `ul` or `ol`, so that I remove its markers and indent as Foundation's `.no-bullet` does.
13. As an application developer, I want `nfsNoBullet` to compile only on `ul` and `ol`, so that I cannot ask for a class Foundation's CSS has no rule for.
14. As an application developer, I want a list that is an XY margin grid, or a Float or Flex Grid row, to keep its grid's margins when I add `nfsNoBullet`, so that removing the markers does not move my grid.
15. As an application developer, I want the spec to tell me when to add `role="list"` to a list without markers, so that VoiceOver still announces a list of cards as a list.
16. As an application developer, I want `nfsHeadingSize="1"` on an `h2`, so that the heading keeps its level and takes the `h1` size, as Foundation's Typescale section advises.
17. As an application developer, I want `nfsHeadingSize` to take 1 to 6 and a static string such as `"3"`, and `nfsHeadingSize="7"` or `nfsHeadingSize="h1"` to fail to compile, so that no class name reaches my template.
18. As an application developer, I want the spec to tell me that `nfsHeadingSize` changes only the look, so that I keep headings as `h1` to `h6` at the level the outline needs and use the attribute on a paragraph only for text that is not a heading.
19. As an application developer, I want `nfsStat` on the element after its label paragraph, so that I get Foundation's statistic with its tightened spacing.
20. As an application developer, I want `nfsCodeInline` and `nfsCodeBlock`, so that I get Foundation's code looks on elements that are not `code`, or on a `code` block.
21. As an application developer, I want a development warning when an `nfsCodeBlock` region scrolls, holds nothing focusable, and has no `tabindex`, so that I add `tabindex="0"`, `role="region"`, and a name before a keyboard user meets it.
22. As an application developer, I want a development warning when a focusable code block has no name, so that screen reader users know what the region holds.
23. As an application developer, I want `nfsCiteBlock`, so that an element that is not `cite` takes the citation look.
24. As an application developer, I want the library's Sass to stop the compile when `$subheader-color`, `$cite-color`, or `$header-small-font-color` is under 4.5:1 on the page, or `$code-color` under 4.5:1 on `$code-background`, naming each setting and its ratio, so that I never ship Foundation's failing greys.
25. As an application developer, I want the spec to give me the three settings that pass on Foundation's defaults and where to set them, so that the check passes on the first compile.
26. As an application developer, I want every boolean attribute to work bare, with `true`, or bound to a boolean, and to reject any other string, so that on-or-off classes read like Foundation's.
27. As an application developer, I want no value to set no class, so that an unbound attribute changes nothing.
28. As an application developer, I want no attribute of this family to be named after an HTML presentational attribute (`align`, `type`), so that writing it as a static attribute never realigns my text or restyles my list.
29. As an application developer migrating Foundation markup, I want a copied `class="lead"` or `class="text-center"` on an element that carries this family's attribute to be reported in development, naming the attribute to write.
30. As an application developer, I want these attributes beside component directives and beside the Prototyping Utilities, so that `<p nfsLead nfsTextAlign="center" nfsMarginBottom="2">` works like Foundation's class list.
31. As a keyboard user, I want to reach and scroll every code block that scrolls, so that no line of code is out of reach.
32. As a screen reader user, I want a heading styled larger or smaller to keep its level, so that heading navigation matches the page's outline.
33. As a screen reader user, I want a list without bullets still announced as a list where its count matters, so that I know how many items it holds.
34. As a screen reader user, I want a statistic read after its label, so that I know what the number counts.
35. As a user with low vision, I want subheaders, citations, and the small part of headings to reach 4.5:1, so that I can read them.
36. As a user who zooms to 320 CSS px or enlarges text spacing, I want only a code block to scroll sideways, inside itself, and prose never to sit in one, so that the page reflows.
37. As a developer of a server-rendered application, I want the server HTML to carry every class these attributes set, responsive classes included, so that the first paint is final and hydration changes nothing.
38. As a developer using `@defer (hydrate never)`, I want these classes to stay applied, so that static text keeps its look without JavaScript.
39. As a developer of a zoneless application, I want the directives to need no zone.
40. As an application developer, I want to import the directives from their own entry point, so that a `@defer` block can split them.
41. As a Storybook author, I want to lay out story scaffolding with these attributes (`nfsTextAlign`, `nfsLead`, `nfsNoBullet`) instead of Foundation's classes, so that stories follow the class rule.
42. As a library maintainer, I want every behaviour asserted through classes, computed styles, roles, focus, and geometry in stories, browser-level tests, a server-render smoke test, a Sass compile test, and e2e, so that regressions surface at the layer that owns them.

## Implementation Decisions

### Foundation contract

Typography Helpers have no Plugin, no `defaults` object, no `data-*` Options, no events, and no methods. The contract is Foundation's typography Sass, its settings, its Typography Helpers docs page, and the three helper classes its Typography Base page documents. Dropped options: none, because there are none. Every class exists in every compile that includes `foundation-typography` (which `foundation-everything` includes) or the export mixin itself; there is no Sass flag.

| Docs section (export mixin) | Classes | Declarations | Notes |
| --- | --- | --- | --- |
| Text Alignment (`foundation-text-alignment`) | `.text-left`, `.text-right`, `.text-center`, `.text-justify`; `.<bp>-text-<align>` for every Class breakpoint above the Zero breakpoint | `text-align: <align>` | The four names are fixed in the mixin. Printed breakpoint by breakpoint in `min-width` order, so a larger breakpoint's class wins (measured: `text-left medium-text-center large-text-right` is left, centre, and right at 400, 700, and 1100 px in three engines). Physical, as the names say |
| Subheader (`foundation-typography-helpers`) | `.subheader` | `margin-top: $subheader-margin-top` (0.2rem), `margin-bottom: $subheader-margin-bottom` (0.5rem), `font-weight: $subheader-font-weight` (normal), `line-height: $subheader-lineheight` (1.4), `color: $subheader-color` (`$dark-gray`) | On any element; the docs put it on headings, the Sass comment pairs an `h1` with an `h2.subheader` in a `header` |
| Lead Paragraph (same) | `.lead` | `font-size: $lead-font-size` (1.25 times `$global-font-size`, 20 px measured), `line-height: $lead-lineheight` (1.6) | |
| Un-bulleted List (same) | `ul.no-bullet`, `ol.no-bullet` | `margin-<$global-left>: 0; list-style: none` | Qualified by element (one rule for both); nested lists keep their markers (measured: `disc` and `decimal`); a `div.no-bullet` has no rule |
| Statistics (same) | `.stat` | `font-size: $stat-font-size` (2.5rem), `line-height: 1`; `p + .stat { margin-top: -1rem }` | The docs put the label in the paragraph before the number |
| Cite block, on the Typography Base page (same) | `.cite-block` | `display: block`, `color: $cite-color` (`$dark-gray`), `font-size: $cite-font-size` (13 px), `::before` with `$cite-pseudo-content` (an em dash and a space) | Foundation's `cite` element takes the same look while `$enable-cite-block` is true (the default) |
| Code, on the Typography Base page (same) | `.code-inline`, `.code-block` | Both: `$code-border`, `$code-background` (`$light-gray`), `$code-font-family`, `$code-font-weight`, `color: $code-color` (`$black`). Inline: `display: inline; max-width: 100%; word-wrap: break-word`, `$code-padding`. Block: `display: block; overflow: auto; white-space: pre`, `$code-block-padding`, `$code-block-margin-bottom` | Foundation's `code` element takes the inline look while `$enable-code-inline` is true (the default), so a `code` inside a `pre` that carries the block look draws an inline box of its own (measured: a 1 px border); the docs write the block look on `code` itself |
| Typescale (`foundation-typography-base`) | `.h1` to `.h6` | The heading elements' own rule, selector by selector (`h1, .h1`): `$header-font-family`, `$header-font-style`, `$header-font-weight`, `$header-color`, `$header-text-rendering`, and per breakpoint of `$header-styles` the font size, line height, and margins; `.h<n> small` gets `line-height: 0` and `color: $header-small-font-color` (`$medium-gray`) | A class outranks the element selector, so `<h2 class="h1">` takes the `h1` size at every breakpoint (measured: 24 px at 400 px, 48 px at 1100 px) |
| Print, on the Typography Base page (`foundation-print-styles`, also in `foundation-typography`) | `.show-for-print`, `.hide-for-print` | `display: none` or `display: block` by print media, `!important` | Visibility by medium, not a typography helper: Out of Scope, proposed for the Visibility Classes |

Docs conventions kept or corrected: the alignment examples (kept); the six subheaders (kept, with the required `$subheader-color`), and the Sass comment's `header` holding an `h1` and an `h2.subheader` (corrected: a subtitle is a paragraph with `nfsSubheader` in an `hgroup`, D13); the lead paragraph (kept); the unordered and ordered lists with nested lists (kept); Typescale's headings with another level's size (kept) and its "For text" paragraphs (kept for text that is not a heading, D12); the statistic after its label paragraph (kept); `<code class="code-block">` (kept on `code`; a block that can scroll carries the Scroll region recipe, D10); the Typography Base page's advice to use `.code-inline` and `.code-block` without code markup only for text displayed as code (kept, with the reflow limit that prose never goes in a block, 1.4.10).

### CSS class to directive mapping

Every class is a Utility class. There are no Structural classes, Variant classes, or State classes, and no class is left for the consumer to write (ADR 0039).

| Foundation classes | Directive and Utility attribute | Type alias; setting or closed | Value shape | Class each value sets | Variant properties the Runtime check reads |
| --- | --- | --- | --- | --- | --- |
| `.text-<align>` and `.<bp>-text-<align>` | `NfsTextAlignment`: `nfsTextAlign` | `NfsTextAlignInput` over `NfsTextAlignName`: `'left' \| 'right' \| 'center' \| 'justify'` (Closed: the mixin writes the four names itself); rules keys are `NfsClassBreakpoint` over `NfsBreakpointClassesOverrides` | A name, which applies from the Zero breakpoint, or `NfsClassBreakpointRules<NfsTextAlignName>` | A bare name sets `.text-<v>`; in a rules object the Zero breakpoint's key sets `.text-<v>` and every key above it sets `.<bp>-text-<v>`, one class per key | `--nfs-breakpoint-classes` (written by `nfs-breakpoint-properties`) for each key above the Zero breakpoint |
| `.subheader` | `NfsTypographyHelpers`: `nfsSubheader` | `NfsVariantBoolean` (Closed) | A boolean | `.subheader` | None |
| `.lead` | `NfsTypographyHelpers`: `nfsLead` | as above | A boolean | `.lead` | None |
| `.stat` | `NfsTypographyHelpers`: `nfsStat` | as above | A boolean | `.stat` | None |
| `.cite-block` | `NfsTypographyHelpers`: `nfsCiteBlock` | as above | A boolean | `.cite-block` | None |
| `.code-inline` | `NfsTypographyHelpers`: `nfsCodeInline` | as above | A boolean | `.code-inline` | None |
| `.code-block` | `NfsTypographyHelpers`: `nfsCodeBlock` | as above | A boolean | `.code-block` | None |
| `ul.no-bullet`, `ol.no-bullet` | `NfsNoBullet` (`ul[nfsNoBullet], ol[nfsNoBullet]`): `nfsNoBullet` | as above | A boolean | `.no-bullet` | None |
| `.h1` to `.h6` | `NfsTypographyBase`: `nfsHeadingSize` | `NfsHeadingSizeInput` over `NfsHeadingSize`: `1 \| 2 \| 3 \| 4 \| 5 \| 6` (Closed: Foundation's heading rule names the six itself, and each key of `$header-styles` is also an element selector) | A number; a static attribute's string (`"1"`) is its number | `n` sets `.h<n>` | None |

- No family here is Open: the alignment names, the heading sizes, and the booleans are fixed by Foundation's Sass, and the only Sass list involved is `$breakpoint-classes`, whose registry the primary entry point already declares. So these directives write no Variant property and the family's Library mixins write none.
- Every value maps to exactly the class the table gives, and to nothing for a value that is not one class token (reachable only through a cast or `$any()`).

### The Utility directive rule, applied

The [Spec: Prototyping Utilities](../issues/102-spec-prototyping-utilities.md) states the rule; this family applies it as follows.

0. Scope: the stand-alone shape, for every class. Each class styles whatever element carries it (`.no-bullet` any list, the rest any element), no other class of the family must be on that element or around it, and the family's templates do not together express one effect; clause 0 names the text alignment classes as its case. Not the roles shape: no class here marks an element whose role another of its classes modifies (`.no-bullet` modifies an HTML list, not a Foundation role). Not the one-effect shape: no class uses Foundation's `<words>-for-<bp>` names, and the classes decide unrelated things (alignment, size, colour, markers). Every attribute is `nfs`-prefixed, so no input shares its name with another directive's.
1. Unit: one directive class per export mixin that prints the family's classes. `foundation-text-alignment` is `NfsTextAlignment`; `foundation-typography-helpers` is `NfsTypographyHelpers` for its classes that any element takes, and its one element-qualified class, `.no-bullet`, gets its own directive class with the elements in its selector, so the attribute exists only on `ul` and `ol`; `foundation-typography-base` is `NfsTypographyBase`, because its only classes are `.h1` to `.h6`. Foundation qualifies `.no-bullet` with one rule for both elements and one meaning, and no inner mixin, so one directive class names both elements (`ul[nfsNoBullet], ol[nfsNoBullet]`), named `NfsNoBullet` after the class (D3).
2. Utility attributes: each class template is one input whose public name is one of its directive's attribute selectors; any of them creates the directive, and an element gets one instance per directive class.
3. Names: `nfsTextAlign` is the CSS property the classes set, because the `text` stem is shared with the Prototyping Utilities' transformation and decoration templates; the six helpers and `.no-bullet` are classes with no value, so each is a boolean named with the camelCase of its class (`nfsCodeInline` and `nfsCodeBlock` are two single classes, not values of a template, as the Prototyping Utilities' `nfsFontBold` and `nfsFontNormal` are); `.h<n>` has a one-letter stem that abbreviates "heading" and sets several properties, so its attribute is named for the dimension Foundation's docs give it ("Foundation's existing header sizes") in HTML's term for `h1` to `h6`: `nfsHeadingSize` (D5).
4. Values: typed by ADR 0040: a closed union for the alignments, a closed number union for the heading sizes, typed booleans; the responsive form is the same attribute (a Breakpoint rules object for `nfsTextAlign`, the only family with responsive classes); no value sets no class.
5. Composition: each directive binds only its own classes through one computed class list, and declares no listener and no role, name, or state; so no directive adds `role="list"` or a heading level (D11, D12).
6. Overlap: text alignment has one template, so nothing overlaps within it. The helpers' booleans that set the same property (`nfsLead` and `nfsStat` both set `font-size` and `line-height`; `nfsCodeInline` and `nfsCodeBlock` set the same code look with a different `display`) are different Foundation utilities asked of one element, as the Prototyping Utilities' `nfsFontBold` and `nfsFontNormal` are: Foundation's cascade decides, and the pairs are named below and in D7. Foundation prints no responsive rule of this family out of order.
7. Ownership: each directive owns its development checks; `nfs-typography-helpers` and `nfs-typography-base`, one per export mixin that needs one (ADR 0012, dated note of 2026-09-28), hold the compile-time checks and the grid margin correction; `foundation-text-alignment` needs neither, so it has no Library mixin.

Cascade pairs, measured in Chromium 153, Firefox 155, and WebKit 26.6 where a measurement is given; the others follow from Foundation's print order and selectors:

- Within `NfsTypographyHelpers`: `nfsStat` beats `nfsLead` (measured: 40 px and a 40 px line height on an element with both, printed later); by the same print order `nfsLead` and `nfsStat` beat `nfsSubheader`'s line height, `nfsCiteBlock` beats its colour, and `nfsCodeBlock` beats `nfsCodeInline`.
- Across this spec's directives: `nfsLead`, `nfsStat`, and `nfsSubheader` beat `nfsHeadingSize` on the properties they share (Foundation prints `foundation-typography-helpers` after `foundation-typography-base`: an `h3`-sized paragraph with `nfsLead` is 20 px).
- With other families: the Prototyping Utilities' `nfsSeparator` sets `text-align` with `!important` and beats `nfsTextAlign` (`separator-left text-right` is left; `text-right separator-center` is centred); their font, spacing, and list utilities, printed after the typography classes, beat the helpers on the property they share (`ul.no-bullet.list-square` has square markers and keeps the zero left margin); `.button`, `.badge`, `.title-bar-right`, `.input-group-label`, `.input-group-button`, and `.orbit-bullets` set their own `text-align` at one class, printed after the typography classes, so `nfsTextAlign` on an `nfsButton`, `nfsBadge`, `nfsTitleBarRight`, `nfsInputGroupLabel`, `nfsInputGroupButton`, or `nfsOrbitBullets` host changes nothing (measured for the button, badge, and title-bar section; the others follow from the same selectors). `nfsTextAlign="center"` on `nfsPagination` centres its items (measured: equal space on both sides), and `nfsTextAlign="right"` on `nfsFormLabel` aligns the label, because neither class sets `text-align`.
- With the grids: `.no-bullet`'s `margin-left: 0` outranks `.grid-margin-x` and a top-level `.row`; `nfs-typography-helpers` gives such a list the grid's margin back (Sass subsection, D8), while nested rows (`.row .row`) and container rules outrank `.no-bullet` and never needed it.

### Hierarchy and DI shape

```
[nfsTextAlign]                                                                      NfsTextAlignment
[nfsSubheader], [nfsLead], [nfsStat], [nfsCiteBlock], [nfsCodeInline], [nfsCodeBlock] NfsTypographyHelpers
ul[nfsNoBullet], ol[nfsNoBullet]                                                    NfsNoBullet
[nfsHeadingSize]                                                                    NfsTypographyBase
```

- Four standalone directives with no template, no parent, no children, no Parent token, no providers, and no host directives. Nothing finds them through DI.
- No Defaults token: the family has no Options, and a Defaults token never holds a Variant input's default (building-blocks 1.4).
- Injection: `NfsTextAlignment` injects `nfsBreakpointsToken` for the Zero breakpoint (`nfsBreakpointForWidth(map, 0)`) and the order of Class breakpoints, without `NfsMediaQuery`, and creates the Runtime checks' handle `nfsVariantCheck('nfsTextAlign')` of `ngx-foundation-sites/media-query`; every directive injects `ElementRef` for its development checks and, in development builds only, `HostAttributeToken('class')` (optional) for the copied-class check.
- Entry point: `ngx-foundation-sites/typography-helpers` (one per Foundation docs page). It exports the four directives and the aliases `NfsTextAlignName`, `NfsTextAlignInput`, `NfsHeadingSize`, and `NfsHeadingSizeInput`. `NfsClassBreakpointRules`, `NfsVariantBoolean`, `nfsVariantBoolean`, and the Class breakpoint registry live in the primary entry point `ngx-foundation-sites` and are used here as types only (and `nfsVariantBoolean` as its one runtime import). There is no all-in-one array: four imports need none (D17).

### API

Every directive: standalone, no template, no `exportAs` (it has no state or method to read), no model, no output, no method. Every attribute is an `input()` whose public name is the attribute (the class member drops the `nfs` prefix), declared with explicit type arguments that name the exported aliases (building-blocks 1.4), with the JSDoc naming Foundation's class or class template.

```ts
type NfsTextAlignName = 'left' | 'right' | 'center' | 'justify';
type NfsTextAlignInput = NfsTextAlignName | NfsClassBreakpointRules<NfsTextAlignName>; // a bare name applies from the Zero breakpoint
type NfsHeadingSize = 1 | 2 | 3 | 4 | 5 | 6;
type NfsHeadingSizeInput = NfsHeadingSize | `${NfsHeadingSize}`; // a static attribute's string is its number

class NfsTextAlignment {
  readonly textAlign: InputSignal<NfsTextAlignInput | undefined>; // 'nfsTextAlign'; default undefined
}
class NfsTypographyHelpers {
  readonly subheader: InputSignalWithTransform<boolean, NfsVariantBoolean>; // 'nfsSubheader'; default false
  // lead: 'nfsLead'; stat: 'nfsStat'; citeBlock: 'nfsCiteBlock'; codeInline: 'nfsCodeInline'; codeBlock: 'nfsCodeBlock': the same shape
}
class NfsNoBullet {
  readonly noBullet: InputSignalWithTransform<boolean, NfsVariantBoolean>; // 'nfsNoBullet', on ul and ol; default false
}
class NfsTypographyBase {
  readonly headingSize: InputSignalWithTransform<NfsHeadingSize | undefined, NfsHeadingSizeInput | undefined>; // 'nfsHeadingSize'; default undefined
}
```

| Attribute | Transform | Default | Foundation equivalent | Delta |
| --- | --- | --- | --- | --- |
| `nfsTextAlign` | none | `undefined`: no class | `.text-<align>`, `.<bp>-text-<align>` | A rules object in place of several classes |
| `nfsSubheader`, `nfsLead`, `nfsStat`, `nfsCiteBlock`, `nfsCodeInline`, `nfsCodeBlock` | `nfsVariantBoolean` | `false` | `.subheader`, `.lead`, `.stat`, `.cite-block`, `.code-inline`, `.code-block` | None |
| `nfsNoBullet` | `nfsVariantBoolean` | `false` | `ul.no-bullet`, `ol.no-bullet` | On a margin grid or grid row the grid keeps its margin (D8) |
| `nfsHeadingSize` | a pure function of the entry point: a static attribute's string becomes its number, anything else passes | `undefined` | `.h1` to `.h6` | A number in place of the class name |

- Host: one `[class]` binding per directive to a `computed` list of its classes. The consumer's static classes, its own `[class]` and `[class.x]` bindings, and every other directive's classes stay, because Angular combines static classes and class bindings. No attribute, no style, no listener.
- `nfsTextAlign`'s class list is one class per rules key (a bare value is the Zero breakpoint's rule), the key's name taken as the prefix above the Zero breakpoint, so Foundation's `min-width` rules carry each value up to the next key; a key that repeats the previous key's value adds its class anyway, which changes nothing.
- Development-mode checks, in each directive's one `afterRenderEffect` read phase, which it creates only when `ngDevMode` is on or, for `NfsTextAlignment`, the Variant check handle is not `null` (never on the server, and in a production build only under the Runtime checks' opt-in); the warnings run only while `ngDevMode` is on, each once per instance, at the first render:
  1. Copied classes, every directive (D14): a static class list that holds a class of the directive's own family with Foundation's names warns, naming the attribute to write ("class="text-center" is set by nfsTextAlign: write nfsTextAlign="center" instead"; "class="h2" is set by nfsHeadingSize: write nfsHeadingSize="2" instead"; `medium-text-center` names the rules object). A copied class is not stripped, because the `[class]` list binds only the classes it sets, so it keeps styling until removed. Other classes are not reported.
  2. Unreachable code block, `NfsTypographyHelpers` while `nfsCodeBlock` is true (D10): the Prototyping Utilities' scroll-region check with the attribute's name: when the host's computed `overflow-x` or `overflow-y` is `auto` or `scroll` and its scroll size exceeds its client size on that axis, and the host has no `tabindex` attribute and no focusable descendant (`a[href]`, `button`, `input`, `select`, `textarea`, `[tabindex]` other than `-1`, `[contenteditable]`, none disabled): "nfsCodeBlock: this code block scrolls but a keyboard cannot reach it; add tabindex="0", role="region", and aria-label or aria-labelledby (WCAG 2.1.1; axe scrollable-region-focusable)". When the host has `tabindex` of 0 or more and no non-blank `aria-label` or `aria-labelledby`: "nfsCodeBlock: a focusable code block needs a name (WCAG 4.1.2)". An implementation may share one library-internal helper with `NfsPrototypeOverflow`.
- Runtime check (D15), `NfsTextAlignment` only, in the same read phase, and only while `nfsTextAlign` holds a rules key above the Zero breakpoint: `include('nfs-breakpoint-properties', ['breakpoint-classes'])`, then `value('nfsTextAlign', value, needs)` with `{setting: 'breakpoint-classes', name: bp}` for each key above the Zero breakpoint, `[]` for the Zero breakpoint's key (its class always exists), and `null` for a value that maps to no class. `strictVariantNames` reports a breakpoint `--nfs-breakpoint-classes` does not list; `strictVariantProperties` reports a missing `@include nfs-breakpoint-properties;`. A bare value reads no property and makes no call. `NfsTypographyHelpers`, `NfsNoBullet`, and `NfsTypographyBase` have only closed families, read no Variant property, and make no call.

### Comparison with Angular Material (22.2)

Material's typography is Sass: `typography-hierarchy` prints classes the consumer writes (`.mat-headline-large`, `.mat-body-medium`, and the older `.mat-h1` to `.mat-h6`, `.mat-body-strong`, `.mat-small`) and styles native headings inside a `.mat-typography` scope. It ships no typography directive, no alignment helper, and no list helper.

| Concern | Angular Material (22.2) | Typography Helpers |
| --- | --- | --- |
| A heading level's look on another element | Consumer-written classes from `typography-hierarchy` (`.mat-h1`, `.mat-headline-large`) | `nfsHeadingSize` on any element, typed 1 to 6; the heading element keeps its level |
| Text alignment, lead text, statistics, list markers | The application's CSS | Foundation's classes through Utility attributes |
| Contrast of secondary text | Theme tokens; no build-time check | Compile-time checks on the subheader, citation, code, and heading `small` colours |
| Testing | Component harnesses | DOM-first assertions; no harness |

Borrowed: nothing; Material has no counterpart API. Not borrowed: consumer-written typography classes (ADR 0039).

### Implementation level and primitives

Implementation level: native platform. The helpers are Foundation's CSS on the consumer's elements, breakpoints are Foundation's media queries, and heading levels, lists, `hgroup`, scrolling, and focus are HTML's. `@angular/aria` has no pattern for text styles, and `@angular/cdk` adds nothing: the Breakpoint map comes from the library's own token, and `InteractivityChecker` would be a heavier stand-in for the code block check's selector. The Angular layer per directive is `input()` signals, one `computed` class list, one host `[class]` binding, a development-only render callback, and, for `NfsTextAlignment`, the Runtime check requests. No `effect`, no listener, no timer, no observer, no `Renderer2` write.

Fallback: none needed. The facts this spec relies on were measured by its ticket with Dart Sass 1.104.1 over Foundation 6.9.0 in Chromium 153, Firefox 155, and WebKit 26.6 through Playwright 1.63 with axe-core 4.13.0, and from Chromium's CDP accessibility tree and WebKit's list heuristic in its accessibility source.

### ARIA and keyboard

APG pattern: none; the helpers are presentation. A code block a keyboard must reach follows the practice of the APG's scrollable examples, the Prototyping Utilities' overflow recipe, and the [Spec: Table](../issues/92-spec-table.md)'s Scroll region: `tabindex="0"`, `role="region"`, and a name.

| Element or state | Rendered semantics | Source |
| --- | --- | --- |
| Any attribute of this family | The host element's own role, name, and state; the directives add none | WHATWG HTML; HTML-AAM |
| `nfsHeadingSize` | The look of heading level `n`; the host keeps its own role and level (measured in Chromium: an `h2` with it is still a level-2 heading, a `p` still a paragraph) | HTML-AAM |
| `hgroup` holding a heading and a `p nfsSubheader` | A group holding the heading and a paragraph (measured in Chromium: `group`); the subtitle adds no section heading. HTML: "The hgroup element represents a heading and related content. The element may be used to group an h1-h6 element with one or more p elements containing content representing a subheading, alternative title, or tagline." | WHATWG HTML; HTML-AAM |
| `ul nfsNoBullet`, `ol nfsNoBullet` | A list in Chromium (measured through the CDP tree) and Firefox; in WebKit a `ul` or `ol` with no ARIA role and no visible markers is exposed as a group, not a list, unless it is inside a navigation landmark, and with `role="list"` and list items it is a list (WebKit's list heuristic, the same fact the [Spec: Menu](../issues/85-spec-menu.md) and the [Spec: Breadcrumbs](../issues/88-spec-breadcrumbs.md) record). A list whose item count matters outside a `nav` (a list of cards, a list of results) carries the consumer's `role="list"`, which axe accepts on `ul` and `ol` (measured) | HTML-AAM; WebKit |
| `nfsStat` after its label paragraph | Two elements read in DOM order, label first | WHATWG HTML |
| `nfsCodeBlock` on `code` | `code` (measured in Chromium); with the Scroll region recipe, a named `region` (axe accepts the role on `code`, measured) | HTML-AAM; WAI-ARIA `region` |
| `nfsCiteBlock` | The host's own role; the `::before` em dash is generated content and becomes part of the text | CSS Generated Content; accname |

| Key | Result | Owner |
| --- | --- | --- |
| Tab, Shift+Tab | Reaches a code block that carries `tabindex="0"` (measured in three engines; without it WebKit skips the block) | Native |
| Arrow keys, Page Up, Page Down, Home, End | Scroll a focused code block (measured: two ArrowRight presses scroll it 80 to 88 px in three engines) | Native |

Focus: the directives move no focus.

### WCAG 2.2 AA

The target is WCAG 2.2 level AA (user rule; ADR 0022). Each criterion below is a requirement with the layer that tests it; none is advice. Ratios are computed with the exact WCAG relative-luminance formula (`math.pow`), unrounded, never Foundation's `color-luminance()` or `color-contrast()`.

| Criterion | Requirement and how it is met | Foundation default | Test |
| --- | --- | --- | --- |
| 1.4.3 Contrast (Minimum) | `$subheader-color`, `$cite-color`, and `$header-small-font-color` reach 4.5:1 against `$body-background`, and `$code-color` 4.5:1 against `$code-background`; `nfs-typography-helpers` and `nfs-typography-base` stop the compile otherwise (D9), at 4.5:1 whatever the size, because a subheader or citation can sit on any element. On Foundation's defaults the consumer sets the first three to `#737373` (4.701:1) | `$dark-gray` subheaders and citations 3.423:1, `$medium-gray` heading `small` text 1.625:1; axe fails the `h2` to `h6` subheaders at 400 px, the `h5` and `h6` subheaders at 1100 px, every `cite`, `.cite-block`, and heading `small` at both (three engines); `$code-color` on `$code-background` is 15.863:1. With the three settings axe reports nothing (measured) | axe `color-contrast` in every story, with the settings in the Storybook overrides; node-level Sass compile tests |
| 2.1.1 Keyboard | A code block that scrolls holds focusable content or carries `tabindex="0"`; the recipe also gives it `role="region"` and a name. `NfsTypographyHelpers` warns in development (check 2) | A long line scrolls the block; WebKit skips it in the tab order, Chromium and Firefox reach it, and axe reports it in all three (measured) | axe `scrollable-region-focusable` in `typography-helpers--code-and-citations`; browser-level tests of the check; e2e Tab and arrow-key scrolling in three engines |
| 4.1.2 Name, Role, Value | A focusable code block has `role="region"` and a name; the directives change no other role, name, or state | Foundation adds none | Play function finds the block by `getByRole('region', {name})`; browser-level test of the name warning |
| 1.3.1 Info and Relationships | Text that is a heading is an `h1` to `h6` at the level the outline needs; `nfsHeadingSize` changes only its look, and on a non-heading element it styles text that is not a heading (documented, D12). A subtitle is a `p nfsSubheader` in an `hgroup` with its heading (D13). A list without markers whose count matters outside a `nav` carries `role="list"` (D11) | The Typescale "For text" example styles paragraphs as headings; the Sass comment gives a subtitle an `h2`; WebKit drops the list role of markerless lists outside a `nav` | Play functions find each heading by `getByRole('heading', {level})` with its level unchanged; `typography-helpers--no-bullet` finds the card list by `getByRole('list')`; axe `heading-order` (best-practice) in every story |
| 1.3.2 Meaningful Sequence | A statistic follows its label in the DOM, as Foundation's `p + .stat` rule expects | Passes | Play function of `typography-helpers--statistics` asserts the label precedes the number |
| 1.4.10 Reflow | At 320 CSS px only a code block scrolls sideways, inside itself: it holds preformatted code whose line breaks carry meaning (content that requires two-dimensional layout), and prose never goes in it; `nfsCodeInline` wraps (`word-wrap: break-word`) | A long code line scrolls the block, not the page (measured) | e2e at 320 by 640 px in three engines: `documentElement.scrollWidth` at most 320 in `typography-helpers--code-and-citations`, `--typescale`, and `--statistics` |
| 1.4.12 Text Spacing | No helper sets a height, so nothing clips when the spacing grows | Passes | e2e with the text-spacing stylesheet at 320 by 640 px in the same stories: no element's `scrollHeight` exceeds its `clientHeight` except the code block's own scroller |
| 2.4.6 Headings and Labels | A heading styled with `nfsHeadingSize` or `nfsSubheader` still describes its section; the helpers change no text | Passes | Review of the stories |

The axe gate in every story runs the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, plus `best-practice`) with `parameters.a11y.test = 'error'` (ADR 0018).

### Rendered HTML

Consumer markup, then the server HTML. The hydrated DOM equals the server HTML: the directives declare no listener, so nothing adds `jsaction`. Class order is not significant; Angular also renders the directive attributes that feed inputs (`nfstextalign="center"`, `nfsheadingsize="1"`), which HTML gives no meaning (measured: `nfstextalign` leaves `text-align` at `start`) and which the resulting DOM below leaves out, as the other specs do. `nfsPagination`, `nfsGridX`, and `up` are their specs' directives, shown only to place these beside them.

```html
<!-- Text alignment, fixed and responsive -->
<p nfsTextAlign="justify">...</p>
<p [nfsTextAlign]="{small: 'left', medium: 'center'}">...</p>

<p class="text-justify">...</p>
<p class="text-left medium-text-center">...</p>

<!-- A subtitle under its heading -->
<hgroup>
  <h1>The Psychohistorians</h1>
  <p nfsSubheader>Set in the year 0 F.E.</p>
</hgroup>

<hgroup>
  <h1>The Psychohistorians</h1>
  <p class="subheader">Set in the year 0 F.E.</p>
</hgroup>

<!-- Lead paragraph and a statistic after its label -->
<p nfsLead>What are your cats <em>really</em> dreaming about while they sleep?</p>
<p>Days without merge conflict</p>
<div nfsStat>128</div>

<p class="lead">What are your cats <em>really</em> dreaming about while they sleep?</p>
<p>Days without merge conflict</p>
<div class="stat">128</div>

<!-- Lists without markers -->
<ul nfsNoBullet><li>...</li></ul>
<ol nfsNoBullet><li>...</li></ol>

<ul class="no-bullet"><li>...</li></ul>
<ol class="no-bullet"><li>...</li></ol>

<!-- Typescale: the heading keeps level 2 and takes level 1's size; text that is not a heading takes level 3's -->
<h2 nfsHeadingSize="1">Lorem Ipsum Dolor</h2>
<p nfsHeadingSize="3">Lorem Ipsum Dolor</p>

<h2 class="h1">Lorem Ipsum Dolor</h2>
<p class="h3">Lorem Ipsum Dolor</p>

<!-- Code and citations; a block that can scroll is a named Scroll region -->
<p>Run <span nfsCodeInline>nx sync</span> before a build.</p>
<h3 id="config-heading">Configuration</h3>
<code nfsCodeBlock tabindex="0" role="region" aria-labelledby="config-heading">{ "extends": "./tsconfig.base.json" }</code>
<p>Quoted from <span nfsCiteBlock>Isaac Asimov</span></p>

<p>Run <span class="code-inline">nx sync</span> before a build.</p>
<h3 id="config-heading">Configuration</h3>
<code class="code-block" tabindex="0" role="region" aria-labelledby="config-heading">{ "extends": "./tsconfig.base.json" }</code>
<p>Quoted from <span class="cite-block">Isaac Asimov</span></p>

<!-- Beside component directives: a centred pagination, and a list of cards that is a block grid -->
<nav aria-label="Pagination"><ul nfsPagination nfsTextAlign="center">...</ul></nav>
<ul nfsGridX [up]="{small: 1, medium: 3}" nfsNoBullet role="list">...</ul>

<nav aria-label="Pagination"><ul class="pagination text-center">...</ul></nav>
<ul class="grid-x small-up-1 medium-up-3 no-bullet" role="list">...</ul>
```

Server and hydrated DOM are identical for every example: the classes are host bindings on signal state, computed the same way on both.

### Animation

None. Foundation's typography declares no transition, and the library adds none. An element that appears or disappears with `@if` takes only the consumer's own keyframe class in `animate.enter` and `animate.leave` (building-blocks 1.6 rule 2). No Motion classes and no `prefers-reduced-motion` override.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the server HTML carries every class, responsive alignment classes included, exactly as the hydrated DOM does; the Zero breakpoint and the breakpoint order come from `nfsBreakpointsToken`, the same on server and client, so no class depends on the viewport, and Foundation's media queries do the rest.
- Before hydration: the directives touch no DOM outside host bindings, measure nothing, and start no timer. The development checks and the Runtime check requests run in a render callback, a no-op on the server.
- Full and incremental hydration: host binding values equal the server's, so hydration changes nothing; there is no structure to mismatch and no Hydration boundary of its own.
- Event replay: no directive declares a listener or adds `jsaction`; a code block scrolls natively before hydration.
- `@defer`: library templates contain no `@defer`. Inside a dehydrated block a helper is its server HTML. Inside `@defer (hydrate never)` every helper stays applied for good; a bound value that should change later does not go in `hydrate never`.
- Prerendering: identical to SSR; the directives read no request token.

## Testing Decisions

A good test asserts what a user or assistive technology observes: the classes on each element, the computed alignment, sizes, line heights, margins, colours, and list markers, the roles and heading levels, what Tab reaches and how far a code block scrolls, and the accessible names. No test reads a directive's fields. The patterns are the four layers of building-blocks 1.12 and the [Spec: Prototyping Utilities](../issues/102-spec-prototyping-utilities.md)'s tests, the nearest precedent; the cascade and contrast cases are this spec's ticket's measurements, kept as tests.

Story ids follow `typography-helpers--<story>`: `typography-helpers--text-alignment`, `--subheader`, `--lead`, `--no-bullet`, `--typescale`, `--statistics`, `--code-and-citations`, `--composition`. `meta.component` is `NfsTypographyHelpers`; the stories import the four directives, and their attributes are args. Stories use Foundation's default names only, so the library's Storybook program needs no Variant declaration file (ADR 0040). The Storybook preview includes `nfs-typography-base` and `nfs-typography-helpers` and its settings overrides carry the three required colours (the Storybook conventions change the Answer proposes). No story element carries a Foundation class written in the story.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Run by `npx nx test-storybook <lib>`. Every story runs axe with `parameters.a11y.test = 'error'` and the six tags (which include `color-contrast`, `scrollable-region-focusable`, and the best-practice `heading-order`).

- `typography-helpers--text-alignment`: Foundation's four paragraphs, one per name (computed `text-align`), and a paragraph with `[nfsTextAlign]="{small: 'left', medium: 'center'}"` that carries `text-left medium-text-center`; the e2e layer asserts the geometry per breakpoint.
- `typography-helpers--subheader`: Foundation's six subheaders, each found by `getByRole('heading', {level})` with its computed colour equal to the required `$subheader-color`; the subtitle recipe, an `hgroup` whose heading is found by role and whose `p nfsSubheader` is not a heading.
- `typography-helpers--lead`: Foundation's lead paragraph (computed `font-size` 20 px, `line-height` 32 px).
- `typography-helpers--no-bullet`: Foundation's unordered and ordered lists with nested lists (computed `list-style-type` `none` and a zero left margin on the outer list; the nested lists keep `disc` and `decimal`); each is found by `getByRole('list')` with its items by `getAllByRole('listitem')`; a list of three cards with `role="list"`.
- `typography-helpers--typescale`: Foundation's headings (`h2 nfsHeadingSize="1"` to `h6 nfsHeadingSize="5"`), each found by `getByRole('heading', {level})` at its own level with the computed `font-size` of the level it borrows; Foundation's paragraphs `p nfsHeadingSize="1"` to `"6"`, none of which is a heading; an `h2` holding a `small`, whose computed colour is the required `$header-small-font-color`.
- `typography-helpers--statistics`: Foundation's label paragraph and `div nfsStat` (computed `font-size` 40 px, `margin-top` -16 px); the label precedes the number in DOM order.
- `typography-helpers--code-and-citations`: a sentence with `span nfsCodeInline`; the Configuration code block of the Rendered HTML with a line longer than the story viewport, found by `getByRole('region', {name: 'Configuration'})`, focusable, computed `overflow-x` `auto`; a `span nfsCiteBlock` and a `cite` in a `blockquote`, each at the required `$cite-color`.
- `typography-helpers--composition`: `ul nfsPagination nfsTextAlign="center"` in a named `nav` (the items centred: equal space on both sides within the list's content box); `ul nfsGridX gridMarginX [up]="{small: 1, medium: 3}" nfsNoBullet role="list"` (computed left margin equal to that of the same grid without `nfsNoBullet`, the negative half gutter); `p nfsLead nfsTextAlign="center"` with a consumer class (the element carries the union); toggling a bound `nfsLead` removes only `.lead`.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

TestBed specs next to the directives over bare test host components, zoneless with `await fixture.whenStable()`; no story is mounted and no axe runs here.

- Host bindings, driven by data: every name of `nfsTextAlign` sets its class; a rules object sets the unprefixed class for the Zero breakpoint's key and `<bp>-` classes above it; every boolean's `true`, bare attribute, and `'true'` set its class, and `false`, `'false'`, and no value set none; `nfsHeadingSize` 1 to 6, bound as numbers and written as static strings, sets `.h1` to `.h6`; a value reached through `$any()` that holds a space sets none; changing one attribute swaps only its own class and leaves the consumer's static class, its `[class]` binding, and other directives' classes alone.
- Element-qualified list: `ul nfsNoBullet` and `ol nfsNoBullet` set `no-bullet`.
- Composition: `nfsPagination`, `nfsTextAlign`, a consumer static class, and a consumer `[class.x]` binding on one element: the element carries the union.
- Breakpoint order: with `nfsBreakpointsToken` providing `xlarge`, `[nfsTextAlign]="{small: 'left', xlarge: 'right'}"` binds `text-left xlarge-text-right`; with the Zero breakpoint renamed in the token, its rule sets the unprefixed class.
- Development checks: the copied-class check for one class of each directive (warns once, naming the attribute) and silence for a consumer class; the code block check for an overflowing block without `tabindex` and without focusable content (warns), with a link inside (silent), with `tabindex="0"` and no name (warns about the name), with `tabindex="0"`, `role="region"`, and `aria-labelledby` (silent), and for content that fits (silent); nothing is checked or warned when `ngDevMode` is false.
- Runtime check: with a style block standing in for `--nfs-breakpoint-classes: small medium large`, `[nfsTextAlign]="{medium: 'center'}"` is silent; a key outside the property bound through a cast reports `strictVariantNames` once, naming `nfsTextAlign`, the value, and `$breakpoint-classes`; in a test file of its own, with no style block, one `strictVariantProperties` report names `@include nfs-breakpoint-properties;`; a bare `nfsTextAlign="center"` makes no request.
- Zoneless: the suite runs with zoneless change detection; no test needs `NgZone`.

### 3. Node-level Vitest

- SSR smoke through the shared `renderServer()` helper, under `npx nx test <lib>`: a fixture with every example of the Rendered HTML. `whenStable()` resolves; the server HTML carries every expected class and the consumer's own attributes (`role="list"`, `tabindex`, `aria-labelledby`); no element carries `jsaction` from a directive; no development warning or Runtime check report is made on the server.
- Pure logic: the alignment mapping over a truth table (a bare name, the Zero breakpoint key, keys above it, a custom breakpoint order, a renamed Zero breakpoint, a value that is not one class token); the heading-size transform (`'1'` to `'6'` become numbers, numbers pass).
- Sass compile, over Foundation 6.9.0's settings file and an overrides file after it, with `@import 'ngx-foundation-sites';` and `@include foundation-typography;` before the library includes:
  - Foundation's defaults plus `@include nfs-typography-helpers;` stop with one `@error` naming `$subheader-color` and `$cite-color` against `$body-background` (3.423:1 each); `@include nfs-typography-base;` stops with one naming `$header-small-font-color` (1.625:1).
  - With `$subheader-color: #737373; $cite-color: #737373; $header-small-font-color: #737373;` both compile; `nfs-typography-base` emits no CSS, and `nfs-typography-helpers` emits exactly the grid margin rules of the Sass subsection (683 bytes compressed on Foundation's defaults, measured).
  - `$code-color: $dark-gray` stops the compile (2.766:1 on `$code-background`); a translucent `$subheader-color` is composited over `$body-background` before the ratio.
  - `$global-text-direction: rtl` makes the grid margin rules set `margin-right` (measured).
  - Rendered in a browser page, the compiled CSS of these cases gives the measured margins: a margin grid list with `.no-bullet`, alone and with `medium-margin-collapse` and `large-margin-collapse`, has the left margin of the same grid without it at 400, 800, and 1100 px; a top-level Float or Flex Grid row list centres; a nested row list keeps its negative margin; a plain `.grid-x` list and a padding grid list lose the 20 px list indent (layer 4 repeats the first two in three engines).

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build, in Chromium, Firefox, and WebKit:

- Responsive alignment: `typography-helpers--text-alignment` at 400 and 700 px: the responsive paragraph's computed `text-align` is `left`, then `center`.
- Keyboard scrolling: in `typography-helpers--code-and-citations`, Tab reaches the Configuration block and ArrowRight twice scrolls it (`scrollLeft` above 0 once the scroll settles).
- Grid margins: `typography-helpers--composition` at 400 and 1400 px: the card list's left margin is -10 px, then -15 px, as for the same grid without `nfsNoBullet`.
- Reflow and text spacing: at 320 by 640 px, with and without the text-spacing stylesheet, `document.documentElement.scrollWidth` is at most 320 in `--code-and-citations`, `--typescale`, and `--statistics`.

Against the prerendered fixture app, on the Typography Helpers route:

- JavaScript disabled: screenshot plus axe (`@axe-core/playwright` with the six tags) on the server HTML; every element carries its classes before any script runs.
- Hydration: no NG05xx in the console and `ngDevMode.componentsSkippedHydration === 0`.

## Out of Scope

- Foundation's base element styles (`h1` to `h6`, `p`, `a`, lists, `blockquote`, `abbr`, `kbd`, and the `code` and `cite` elements' default looks) and their settings other than `$header-small-font-color`: they style elements by tag, with no class to set (ADR 0039; the map's base-styles line). `$header-small-font-color` is checked here because `.h<n> small` carries it. Category: `scope-boundary`.
- `.show-for-print` and `.hide-for-print`, which `foundation-print-styles` prints inside `foundation-typography` and the Typography Base page documents: they decide whether an element shows by medium, the Visibility Classes' one-effect shape; proposed as a `print` condition of that spec's `showFor` and `hideFor`. Category: `scope-boundary`.
- Logical alignment (`text-align: start` and `end`) for right-to-left layouts: Foundation's classes are physical; a right-to-left build flips only `.no-bullet`'s side (`$global-left`). Alignment that follows the reading direction is the consumer's own CSS. Category: `scope-boundary`.
- Foundation's Sass-only helpers (`cite-block`, `code-style`, `code-inline`, and `code-block` mixins) in the consumer's Sass for its own classes: they print no class, so there is nothing for a directive to set. Category: `scope-boundary`.
- `$enable-cite-block` and `$enable-code-inline` as inputs: Sass booleans are compile-time configuration (building-blocks 1.13). Category: `other`.
- The alignment Variant classes of components (the Menu's `align`, which [Decide: inputs named like HTML presentational attributes](../issues/139-decide-inputs-named-like-presentational-attributes.md) decides): they belong to their components' directives. Category: `scope-boundary`.
- The Variant registries, the helper types, and the declaration-file generator: [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md); the Runtime checks' configuration: [Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md). Category: `scope-boundary`.
- Runtime theming through custom properties (building-blocks 1.13). Category: `scope-boundary`.

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | Attribute directives on the consumer's elements; entry point `ngx-foundation-sites/typography-helpers` | ADR 0001 and ADR 0039: the utility families get directives, and Foundation generates nothing; one entry point per docs page, so a `@defer` block can split it | A component that wraps text (Foundation's markup carries the element; ADR 0001) (`scope-boundary`); no directives, the classes written by the consumer (overruled by the user, ADR 0039) (`superseded`) |
| D2 | Every class takes the Utility directive rule's stand-alone shape (clause 0) | Each class styles whatever element carries it, needs no other class of its family, and decides its own property; clause 0 names the text alignment classes as its case | The roles shape (no class marks an element whose role another class modifies) (`other`); the one-effect shape (no `<words>-for-<bp>` names; the classes decide unrelated things) (`other`) |
| D3 | Four directive classes, one per export mixin, with `.no-bullet` in its own class: `NfsTextAlignment`, `NfsTypographyHelpers`, `NfsNoBullet` (`ul[nfsNoBullet], ol[nfsNoBullet]`), `NfsTypographyBase` | Clause 1: the export mixin is the unit the consumer includes; its element-qualified class gets a directive whose selector names the elements, so `nfsNoBullet` does not exist on a `div`; Foundation qualifies `.no-bullet` with one rule for both elements and one meaning, so one class names both | One directive for the whole page (every instance would create every input, and `nfsNoBullet` would compile on any element through another attribute) (`other`); `.no-bullet` in `NfsTypographyHelpers`'s selector list (`<div nfsLead nfsNoBullet>` would compile and bind a class with no rule) (`other`); two classes for `ul` and `ol` (the same boolean on both, and no inner mixin to name them after) (`other`); one class per helper (seven imports for one export mixin's classes, against clause 1) (`other`) |
| D4 | `nfsTextAlign` for the alignment classes; the booleans `nfsSubheader`, `nfsLead`, `nfsStat`, `nfsCiteBlock`, `nfsCodeInline`, `nfsCodeBlock`, and `nfsNoBullet` | Clause 3: the CSS property where the `text` stem is shared, and the camelCase of a class with no value; the published placeholders already use `nfsTextAlign`; no name is an HTML presentational attribute | `align` (an HTML presentational attribute of `p`, `div`, `h1` to `h6`, and table cells: measured, a static `align="center"` on a `p` or `div` and `align="right"` on an `h2` align the text in three engines) (`platform-or-a11y`); `nfsAlign` (reads as the Menu's or the Flexbox Utilities' alignment) (`other`); `nfsCode="inline"` and `"block"` (two single classes are booleans, building-blocks 1.4 rule 4, as the Prototyping Utilities' `nfsFontBold` and `nfsFontNormal` are) (`other`); `type="none"` on the list, or a `none` value of the Prototyping Utilities' `nfsListStyleType` (`type` is an HTML presentational attribute of `ol`: measured, a static `type="i"` gives roman numerals under Foundation's CSS; and `.no-bullet` also removes the indent, which a list-style value does not) (`platform-or-a11y`) |
| D5 | `nfsHeadingSize` on `NfsTypographyBase`, a closed heading level from 1 to 6, for `.h1` to `.h6` | The six classes are one loop's mutually exclusive names, so one enum (building-blocks 1.4 rule 3), named for the dimension the docs give them ("Foundation's existing header sizes") in HTML's term for `h1` to `h6`; the value is the level, never the class name (ADR 0039) | `nfsHeadingSize="h1"` (the value would be the class name) (`variant-as-class`); `nfsHeader` or `nfsHeaderSize` (reads as the HTML `header` element) (`other`); `nfsTypescale` (the docs section's name says nothing about the value) (`other`); `nfsHeadingLevel` (suggests `aria-level`, which the attribute never changes) (`platform-or-a11y`); an un-prefixed `size` (the Button's and others' Variant input on the same element, against clause 5) (`other`); six booleans `nfsH1` to `nfsH6` (mutually exclusive names from one loop are one enum) (`other`) |
| D6 | Values typed by ADR 0040: the four alignments closed, rules objects over Class breakpoints for alignment only, typed booleans, heading sizes closed with their static strings | Foundation's mixins fix every name; only alignment has responsive classes; a misspelt or class-name value must fail to compile | A registry for the alignment names (the mixin writes the four names itself; a registry would type classes that never exist) (`other`); `booleanAttribute` (accepts any value, ADR 0040) (`other`) |
| D7 | Within `NfsTypographyHelpers` and across families, Foundation's cascade decides, and the spec names each pair | The pairs are different Foundation utilities asked of one element, not an overlap within one template (the Prototyping Utilities' D21 names `nfsFontBold` with `nfsFontNormal` and `nfsRounded` with `nfsRadius` the same way); none of them has a more specific member to prefer | Resolving pairs in the directive (no attribute is more specific than another, and the combinations have no meaning) (`other`); a development warning for `nfsLead` with `nfsStat` (reports a combination Foundation's order already settles) (`other`) |
| D8 | `nfs-typography-helpers` gives a list that is also a margin grid or a top-level grid row the grid's left margin back, from Foundation's `xy-gutters()` and `breakpoint()` with `$grid-margin-gutters`, at a specificity that ties with `ul.no-bullet` and loses to Foundation's nested-row and container rules | Measured in three engines: `.no-bullet`'s `margin-left: 0` replaces a margin grid's -10 and -15 px gutters and a row's `auto`; with the rules the margins equal those of the same grid without `.no-bullet`, with margin-collapse classes and nested rows; the list grid is the Card spec's first recipe and the XY Grid spec's list example has margin gutters; 683 bytes compressed | Documenting the pair only (every list grid of cards with gutters would move, with no class-free way to remove markers) (`other`); rules in the XY Grid, Float Grid, and Flex Grid mixins (three owners for one side effect of one class) (`other`); a development warning (reports what one rule can fix) (`other`) |
| D9 | `nfs-typography-helpers` stops the compile when `$subheader-color` or `$cite-color` is under 4.5:1 against `$body-background`, or `$code-color` under 4.5:1 against `$code-background`; checks-only `nfs-typography-base` when `$header-small-font-color` is under 4.5:1 against `$body-background`; required settings `#737373` for the first three on Foundation's defaults | ADR 0022 and building-blocks 1.10; measured with axe in three engines and the exact formula; `#737373` (4.701:1) is the colour the Forms and Breadcrumbs specs already require; one Library mixin per export mixin (ADR 0012) | `@warn` (Foundation's defaults would ship failing text on every page that uses a subheader or `cite`) (`platform-or-a11y`); 3:1 for large text (a subheader or citation sits on any element; the `h5` and `h6` subheaders fail at every breakpoint) (`platform-or-a11y`); leaving `$header-small-font-color` to base typography (`.h<n> small` is this spec's class) (`other`) |
| D10 | `nfsCodeBlock`: the Scroll region recipe and a development check; the directive binds no `tabindex` | Measured: WebKit leaves a scrolling code block out of the tab order and axe reports it in three engines; with the recipe it is reached and scrolled in all three; a block scrolls only when its content overflows, and the name must be the consumer's (the Prototyping Utilities' D13) | A bound `tabindex="0"` (a tab stop on blocks that never scroll, and a second writer beside the consumer's attribute) (`platform-or-a11y`) |
| D11 | Lists: no role added; the recipe adds `role="list"` where the item count matters outside a `nav` | Clause 5 forbids a utility directive a role; WebKit's list heuristic exposes a markerless list outside a navigation landmark as a group, and `role="list"` restores it, which axe accepts (measured); the Menu spec's D14 leaves the same choice to the consumer | Binding `role="list"` (clause 5, a redundant role on every list that does not need it, and a second writer beside the consumer's) (`platform-or-a11y`); a development check (the directive cannot tell whether the count matters) (`other`) |
| D12 | `nfsHeadingSize` changes only the look; text that is a heading is an `h1` to `h6` at its level; documented, not checked | Foundation's own Typescale callout; the host keeps its role and level (measured in Chromium); large text that is not a heading is a documented use | A warning on non-heading hosts (would fire on every documented use) (`other`); binding `role="heading"` or `aria-level` (clause 5; a size says nothing about the level) (`platform-or-a11y`) |
| D13 | A subtitle is a `p nfsSubheader` in an `hgroup` with its heading; `nfsSubheader` on a heading is for a heading of its own section | WHATWG HTML's `hgroup` groups a heading with paragraphs "representing a subheading, alternative title, or tagline" (measured in Chromium: a `group` holding a heading and a paragraph) | Foundation's Sass comment, an `h2.subheader` under an `h1` in a `header` (gives the subtitle a section of its own in the outline) (`platform-or-a11y`) |
| D14 | One computed class list per directive; copied Foundation classes are reported in development, not stripped | Clause 5 and the Prototyping Utilities' D11 | A class record that strips copies (a second shape for one family's classes) (`other`) |
| D15 | Runtime check for `nfsTextAlign` only, while a rules key above the Zero breakpoint is bound; no Variant property of the family's own | The Visibility Classes' D11 rule for a directive whose only property is `--nfs-breakpoint-classes`; every other family here is closed | A Variant property listing the alignment names (a closed set, nothing to verify) (`other`); requesting the include for a bare value (would ask for a mixin the value does not need) (`other`) |
| D16 | `.cite-block`, `.code-inline`, and `.code-block` (on the Typography Base page, printed by `foundation-typography-helpers`) and `.h1` to `.h6` (printed by `foundation-typography-base`, shown on this page) are covered here | ADR 0039: no class is left for the consumer; this page's export mixins print them, and no Typography Base spec exists, because its element styles have no class | Leaving them to a Typography Base spec (none is in the Destination; the classes would have no home) (`other`) |
| D17 | No `exportAs`, Defaults token, role, name, state, listener, providers, or all-in-one array | The helpers have no state and no Options; four imports need no list | An `nfsTypography` array after Foundation's `foundation-typography` (that mixin also prints the print classes, which are not this family's) (`other`) |
| D18 | Eight stories; e2e for responsive alignment, keyboard scrolling, grid margins, reflow, and text spacing in three engines, and the fixture app's first paint and hydration | Breakpoints, real keys, and geometry need real engines; everything else is DOM state a play function reads | A story per class (thirteen stories for what eight cover) (`other`) |
| D19 | Glossary terms **Typography Helpers**, **Subheader**, and **Heading size** | The family's name, the look that a subtitle and a heading share, and the look that is not a heading level need names that keep them apart | A term per helper (`.lead` and `.stat` are Foundation's classes, not domain language) (`other`) |

### Usage examples

```html
<!-- An article's header (inside the article, so it is not the page's banner): the title, its subtitle, and a lead paragraph -->
<article>
  <header>
    <hgroup>
      <h1>Release 22.2</h1>
      <p nfsSubheader>Signal forms and zoneless by default</p>
    </hgroup>
    <p nfsLead>Everything that changed since 22.1, in the order you will meet it.</p>
  </header>
  ...
</article>

<!-- A section heading that keeps its level and takes a smaller level's size -->
<h2 nfsHeadingSize="4">Deprecations</h2>

<!-- A dashboard figure -->
<p>Days without merge conflict</p>
<div nfsStat>128</div>

<!-- A list of results without bullets, still a list in WebKit -->
<ul nfsNoBullet role="list">
  @for (result of results(); track result.id) {
    <li><a [href]="result.url">{{ result.title }}</a></li>
  }
</ul>
```

```ts
@Component({
  selector: 'app-changelog-entry',
  imports: [NfsTypographyHelpers, NfsTextAlignment, NfsTypographyBase],
  template: `
    <h3 nfsHeadingSize="5" [nfsTextAlign]="{small: 'left', medium: 'right'}">{{ version() }}</h3>
    <p>Run <span nfsCodeInline>nx migrate latest</span> first.</p>
    <h4 [id]="headingId()">Migration</h4>
    <code nfsCodeBlock tabindex="0" role="region" [attr.aria-labelledby]="headingId()">{{ migration() }}</code>
  `,
})
export class ChangelogEntry {
  readonly version = input.required<string>();
  readonly migration = input.required<string>();
  readonly headingId = input.required<string>();
}
```

`NfsTypographyHelpers`, `NfsTextAlignment`, and `NfsTypographyBase` come from `ngx-foundation-sites/typography-helpers`.

### Platform features to adopt when the browser target moves

- Keyboard-focusable scroll containers: as the Prototyping Utilities record, Chromium from version 130 and Firefox focus a scroller with no focusable content, and WebKit does not (measured in WebKit 26.6). When every engine of the target does, the code block check's `tabindex` warning can go; its name warning stays.

### Foundation behaviour changed or dropped

- A list that is also a margin grid or a top-level grid row keeps the grid's left margin when its markers are removed (D8).
- Three colours are required on Foundation's defaults, and the compile stops when they, or the code colour, fail 1.4.3 (D9).
- A subtitle is a paragraph in an `hgroup`, not an `h2` in a `header` (D13).
- A code block that can scroll carries `tabindex="0"`, `role="region"`, and a name (D10).
- Typescale's paragraphs are for text that is not a heading (D12).

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. These directives rely on Foundation's export mixins `foundation-text-alignment`, `foundation-typography-helpers`, and `foundation-typography-base` (all three included by `foundation-typography`, which `foundation-everything` includes). Its documented custom CSS is the `nfs-typography-helpers` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-typography-helpers`, and the checks-only `nfs-typography-base`, included after `foundation-typography-base`: one Library mixin per export mixin that needs one (ADR 0012, dated note of 2026-09-28). `foundation-text-alignment` needs no custom CSS or check, so there is no `nfs-text-alignment` mixin.

1. Rules. `nfs-typography-helpers`: (a) `ul.grid-margin-x:where(.no-bullet), ol.grid-margin-x:where(.no-bullet)` with Foundation's `xy-gutters($gutters: $grid-margin-gutters, $gutter-type: margin, $gutter-position: $global-left, $negative: true)`; then, for every Class breakpoint in `$breakpoint-classes`, `ul.<bp>-margin-collapse:where(.no-bullet), ol.<bp>-margin-collapse:where(.no-bullet)` with `margin-<$global-left>: 0` inside Foundation's `breakpoint(<bp>)`; then `ul.row:where(.no-bullet), ol.row:where(.no-bullet)` with `margin-<$global-left>: auto`. Reason: Foundation's `ul.no-bullet` sets `margin-<$global-left>: 0` at one class and one element, which outranks the one-class rules of `.grid-margin-x`, its margin-collapse classes, and a top-level `.row` (measured in three engines, D8). The rules repeat exactly the declarations `.no-bullet` replaced, from Foundation's own mixins and settings, at the specificity of `ul.no-bullet`, which they follow, so they win over it and still lose to Foundation's nested-row and container rules (`.row .row`, `.grid-container:not(.full) > .grid-padding-x`), which `.no-bullet` never outranked; a plain `.grid-x` list and a padding grid list keep losing the list indent, which is what `.no-bullet` is for. `:where()` is in the Browser target. 683 bytes compressed on Foundation's defaults (measured). (b) A compile-time check that emits no CSS: one `@error` listing every pair under 4.5:1, `$subheader-color` and `$cite-color` against `$body-background`, `$code-color` against `$code-background`, each with the setting names and the ratio, computed by the library's exact relative-luminance helper (`math.pow`, a translucent colour composited over its background first), unrounded. `nfs-typography-base`: one `@error` when `$header-small-font-color` is under 4.5:1 against `$body-background`, computed the same way; it emits no CSS.
2. Reused, read from the consumer's compile: `$global-left`, `$grid-margin-gutters`, `$breakpoint-classes`, `$subheader-color`, `$cite-color`, `$code-color`, `$code-background`, `$header-small-font-color`, `$body-background`, and Foundation's `xy-gutters()` and `breakpoint()` mixins. No Foundation value is copied; `auto` and `0` are the CSS values Foundation's own rules write there, and 4.5 is WCAG's number. The mixins take no parameters.
3. Custom properties the directives write: none.
4. Motion classes: none, and no `prefers-reduced-motion` override, because nothing animates.
5. Missing include: without `nfs-typography-helpers`, a list that is also a margin grid or a top-level grid row moves when `nfsNoBullet` is on it, and the colour checks do not run; without `nfs-typography-base`, the heading `small` check does not run. Neither mixin writes a Variant property, so the Runtime checks cannot report the missing include.
6. Variant properties: none. `nfsTextAlign`'s rules keys are checked against `--nfs-breakpoint-classes`, which `nfs-breakpoint-properties` writes.

Required settings on Foundation's defaults, in an overrides file after Foundation's settings file (which assigns them without `!default`), for 1.4.3:

```scss
$subheader-color: #737373; // nfs-typography-helpers: $dark-gray is 3.423:1 on $body-background
$cite-color: #737373; // nfs-typography-helpers: also the look of every cite element
$header-small-font-color: #737373; // nfs-typography-base: $medium-gray is 1.625:1
```

```scss
@import 'settings/settings';
@import 'settings-overrides'; // the three lines above
@import 'foundation';
@include foundation-everything;
@import 'ngx-foundation-sites';
@include nfs-breakpoint-properties;
@include nfs-typography-base;
@include nfs-typography-helpers;
```

### Notes

- Names and HTML attributes: Angular renders every static attribute that feeds an input, and HTML gives `align` on `p`, `div`, `h1` to `h6`, and table cells, and `type` on `ol` (and on `ul`, where Foundation's `ul` rule overrides it), a presentational meaning (measured). No attribute here is named after one: `nfsTextAlign`, `nfsNoBullet`, `nfsHeadingSize`, and the other booleans have no meaning in HTML. The names considered and rejected for that reason are `align` (for the alignment classes) and `type` (for removing list markers), D4.
- RTL: alignment is physical, as Foundation's classes are: `nfsTextAlign="left"` stays left in a right-to-left page. A build with `$global-text-direction: rtl` flips `.no-bullet`'s margin and the grid margin rules to the right side.
- Justified text: `nfsTextAlign="justify"` meets AA; WCAG's 1.4.8 (AAA) asks for text that is not justified, so long reading text stays left-aligned where the site aims higher.
- Forced colours: the helpers draw only text and the code block's border and background, which take system colours; nothing carries information by colour alone.
- Composition: the directives bind nothing another directive binds, so they sit beside component directives, beside each other, and beside the consumer's own `[class]` bindings; the cascade pairs are listed in "The Utility directive rule, applied".
- A code block's look belongs on `code` itself, as Foundation's docs write it: under `$enable-code-inline`, a `code` inside a `pre nfsCodeBlock` draws an inline code box of its own (measured).
- The attributes feed a directive only on the elements their selectors name: a static `nfsNoBullet` on a `div` is an unknown attribute that sets nothing, and a bound one fails to compile.
- Story scaffolding: stories align and emphasise scaffolding text with these attributes wherever Foundation has a class.
