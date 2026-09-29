# 106. Spec: Typography Helpers

Type: grilling
Status: resolved
Blocked by: 81
Labels: wayfinder:grilling
Map: ../map.md

## Question

What Angular directives (preferred) or components give Foundation for Sites 6.9's Typography Helpers to the next, from-scratch ngx-foundation-sites repo, under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Foundation's docs page is `docs/pages/typography-helpers.md` and its Sass is `scss/typography/_helpers.scss, typography/_alignment.scss` in the 6.9.0 clone. Publish `specs/typography-helpers.md`.

Known from the triage: Text alignment (responsive forms included), `.lead`, `.subheader`, `.stat`, `.no-bullet`, and the other helpers on the docs page.

## How to work it

Run `/grill-with-docs` (self-grilling, both sides) over the questions this component raises, then publish with `/to-spec` in the map's spec shape; the [Spec: Button](37-spec-button.md) is the nearest precedent. Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this component); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Cover: one directive per Structural class and what else each owns (the ARIA, `type` default, or development and compile-time checks the documented markup lacks for WCAG 2.2 AA, ADR 0022); every Variant as a typed input by the decision above; State classes as host bindings; the Sass mixin only where custom CSS or checks are needed (ADR 0012); the rendering-mode contract; stories with play functions and axe; e2e only where Storybook cannot reach. Record the decisions in this ticket's Answer, and propose shared-file changes (a building-blocks row, glossary terms) for the orchestrator. Model: Opus 5.5.

## Answer

Resolved 2026-09-28 (Opus 5.5, AFK: both sides of the grilling played against the sources). Spec: [specs/typography-helpers.md](../specs/typography-helpers.md).

Sources read: Foundation 6.9.0's Typography Helpers and Typography Base docs pages, its typography Sass (base, helpers, alignment, print), its settings file, `foundation-everything`, and the XY, Float, and Flex Grid row and gutter mixins; ADR 0001, 0012, 0022, 0039, 0040; building-blocks 1.1 to 1.14 and Table D; `CONTEXT.md`; the map's Notes; `research/out-of-scope-triage.md` (the utility families' rows; the judge's recommendation to keep them out was overruled, ADR 0039), `research/out-of-scope-exclusions.md` (no row names this family), `research/foundation-component-catalogue.md` (its row); the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) through ADR 0040; the [Spec: Prototyping Utilities](102-spec-prototyping-utilities.md) (the Utility directive rule, clauses 0 to 7, and its answer), the [Spec: Media Object](91-spec-media-object.md) (the `align` measurement), the [Spec: Visibility Classes](104-spec-visibility-classes.md), the [Spec: Menu](85-spec-menu.md) and [Spec: Breadcrumbs](88-spec-breadcrumbs.md) (WebKit's list role), the [Spec: Pagination](87-spec-pagination.md), [Spec: Forms](98-spec-forms.md), [Spec: Card](90-spec-card.md), [Spec: XY Grid](99-spec-xy-grid.md), [Spec: Float Grid](100-spec-float-grid.md), [Spec: Flex Grid](101-spec-flex-grid.md), and [Spec: Reveal](18-spec-reveal.md) for the placeholders; [Decide: inputs named like HTML presentational attributes](139-decide-inputs-named-like-presentational-attributes.md); WHATWG HTML (the `hgroup` element and the rendering section's presentational hints); WebKit's accessibility source (`AccessibilityNodeObject::determineListRoleWithCleanChildren`); Angular Material 22.2's `typography-hierarchy`.

Measurements (Dart Sass 1.104.1 over the Foundation 6.9.0 clone; Playwright 1.63.0 with Chromium 153, Firefox 155, and WebKit 26.6; axe-core 4.13.0 with the six tags; Chromium's CDP accessibility tree; scripts under `D:/tmp/nfs-wave-106/`, not committed):

- Contrast, exact formula: `$dark-gray` on `$body-background` 3.423:1 (subheaders, citations), `$medium-gray` 1.625:1 (heading `small`), `#737373` 4.701:1, `$code-color` on `$code-background` 15.863:1 (`$dark-gray` there would be 2.766:1). axe `color-contrast` fails, in three engines, the `h2` to `h6` subheaders at 400 px and the `h5` and `h6` ones at 1100 px, a `p.subheader`, every `cite`, `.cite-block`, `h2 small`, and `.h2 small` at both widths; with the three colours at `#737373` after the settings file, axe reports nothing at either width in three engines.
- `.code-block` with a long line: `overflow-x: auto`, `white-space: pre`, scroll width 2354 px; axe `scrollable-region-focusable` in three engines; Tab reaches it in Chromium and Firefox and skips it in WebKit. With `tabindex="0"`, `role="region"`, and `aria-labelledby` (on `pre` or on `code`), Tab reaches it and two ArrowRight presses scroll it 80 to 88 px in three engines, and axe reports nothing. A `code` inside `pre.code-block` draws an inline code box (1 px border) under `$enable-code-inline`.
- Cascade: `.lead.stat` is 40 px with a 40 px line height; `.h3.lead` 20 px; `h2.h1` 24 px at 400 px and 48 px at 1100 px; `p + .stat` has `margin-top: -16px`; `text-left medium-text-center large-text-right` is left, centre, right at 400, 700, 1100 px; `separator-left text-right` is left and `text-right separator-center` centred; `.button.text-left` and `.badge.text-left` stay centred and `.title-bar-right.text-left` right; `ul.pagination.text-center` is centred (521 and 522 px on either side at 1100 px); `label.middle.text-right` right; `thead th.text-center` centred; `ul.no-bullet.list-square` square with a zero left margin.
- `.no-bullet`: `list-style-type: none` and a zero left margin on `ul` and `ol`; nested lists keep `disc` and `decimal`; a `div.no-bullet` has no rule. On a list that is also a grid, in three engines: an XY margin grid's left margin goes from -10 px (400 px) and -15 px (1100, 1400 px) to 0, and a top-level Float or Flex Grid row's from 100 px (`auto`, 1400 px) to 0, while nested rows keep -10 and -15 px. With the three rules of `nfs-typography-helpers` (Sass subsection) every margin equals that of the same grid without `.no-bullet`, `medium-margin-collapse` and `large-margin-collapse` included, at 400, 800, and 1100 px, and the right-to-left build writes `margin-right`; 683 bytes compressed.
- Presentational attributes, three engines: a static `align="center"` on `p` and `div` centres the text (`-webkit-center`, `-moz-center`), `align="right"` on `h2` right-aligns it; `ol type="i"` gives `lower-roman` under Foundation's CSS; `ul type="none"` and `ul type="square"` stay `disc`, because Foundation's `ul { list-style-type }` rule outranks the hint (WHATWG maps `ul[type=none i]` to `list-style-type: none`); `nfstextalign="center"` does nothing.
- Roles: Chromium's CDP tree exposes `ul.no-bullet` and `ol.no-bullet` as lists (also with `role="list"` and inside a `nav`), `hgroup` as a group holding a heading and a paragraph, `code.code-block` as `code`, `p.h1` as a paragraph, and `h2.h1` as a heading. WebKit's source exposes a `ul` or `ol` without an ARIA role and without visible markers as a group unless it is inside a navigation landmark, and as a list with `role="list"`. axe accepts `role="list"` on `ul` and `ol` and `role="region"` on `code` (`aria-allowed-role` passes).

### Grilling record

Round 1 (the frontier once ADR 0039, ADR 0040, and the Utility directive rule are taken as decided):

1. Directive or component? Directives: every class sits on an element the consumer writes, and Foundation generates nothing (ADR 0001).
2. Which classes? The Typography Helpers page's (alignment with responsive forms, `.subheader`, `.lead`, `.no-bullet`, `.h1` to `.h6`, `.stat`), plus `.cite-block`, `.code-inline`, and `.code-block`, which the same export mixin prints and the Typography Base page documents: no other spec exists for them, and ADR 0039 leaves no class unowned. The print classes, also documented there, are visibility by medium: proposed for the Visibility Classes.
3. Which of the rule's three shapes? The stand-alone shape for every class: each styles whatever element carries it, needs no other class of the family on or around it, and sets its own property; clause 0 names the text alignment classes as its case. No class marks a role another modifies (not the Flexbox shape), and no class uses `<words>-for-<bp>` names or decides one shared effect (not the Visibility shape).
4. What is one directive? Clause 1: one per export mixin. `foundation-text-alignment` is `NfsTextAlignment`; `foundation-typography-helpers` is `NfsTypographyHelpers`, with its element-qualified `.no-bullet` in a directive of its own; `foundation-typography-base` is `NfsTypographyBase`, whose only classes are `.h1` to `.h6`.
5. One class or two for `ul.no-bullet` and `ol.no-bullet`? One: Foundation writes one rule with one meaning for both and has no inner mixin to name two after; the element-qualified selector is what clause 1's element clause is for (the attribute must not exist on a `div`), and the type is the same boolean on both. A clarification of clause 1 is proposed below.
6. Names? `nfsTextAlign` (clause 3's own example, and the published placeholder); booleans after their classes for the six helpers and `.no-bullet`; `.code-inline` and `.code-block` are two single classes, so two booleans, as `nfsFontBold` and `nfsFontNormal` are. `.h<n>` needs a name for its dimension: `nfsHeadingSize` (the docs' "header sizes", in HTML's word for `h1` to `h6`), valued 1 to 6, because the value `h1` would be the class name.
7. The presentational-attribute rule ([Decide: inputs named like HTML presentational attributes](139-decide-inputs-named-like-presentational-attributes.md), until decided): `align` and `type` were considered and rejected; every chosen name renders as an attribute HTML ignores (measured for `nfstextalign`).

Round 2 (hangs on 3 to 7):

8. Values? Closed alignment names over Class breakpoint rules objects; closed heading sizes with their static strings; typed booleans. No family is Open, so no Variant property; the Runtime check covers only the alignment rules keys against `--nfs-breakpoint-classes` (the Visibility Classes' D11 rule).
9. Overlaps? Alignment has one template. The helpers' booleans that share properties are distinct utilities (the Prototyping D21 precedent): Foundation's order decides, and the spec names the pairs. Cross-family pairs measured and named; `nfsTextAlign` loses on the button, badge, title-bar section, input group parts, and Orbit bullets, and wins on the pagination and the form label.
10. `.no-bullet` on a margin grid or a grid row (measured: it moves the grid). Document or fix? Fix in `nfs-typography-helpers`, reusing Foundation's `xy-gutters()` and `breakpoint()`, at a specificity that ties with `ul.no-bullet` and loses to nested rows (measured correct in three engines, collapse classes and nested rows included). It is the Prototyping D8 precedent of printing Foundation's own declarations again to undo a cascade defect, and it keeps the fix with the one class that causes it.
11. Copied classes: report, not strip (clause 5, Prototyping D11).

Round 3 (WCAG 2.2 AA, hangs on the class list):

12. The greys (1.4.3): `@error` in the Library mixin of each export mixin (`nfs-typography-helpers` for subheader, citation, and code; checks-only `nfs-typography-base` for heading `small`), at 4.5:1 whatever the size, with three required `#737373` settings, the colour the Forms and Breadcrumbs specs already require.
13. Scrolling code blocks (2.1.1, 4.1.2): the Prototyping overflow check and recipe, applied to `nfsCodeBlock`; no bound `tabindex`.
14. Lists without markers (1.3.1): clause 5 forbids a role, and the Menu's D14 leaves `role="list"` to the consumer; the recipe adds it where the count matters outside a `nav`, and the Card example gets it.
15. Typescale (1.3.1): `nfsHeadingSize` changes only the look; the heading stays `h1` to `h6` at its level; a paragraph with it is text that is not a heading. Documented, not checked (a check would fire on every documented use).
16. Subtitles (1.3.1): `hgroup` with a `p nfsSubheader`, WHATWG's grouping, instead of the Sass comment's `h2` in a `header`.
17. Statistics (1.3.2): the label paragraph precedes the number, as `p + .stat` expects.
18. Reflow (1.4.10): only a code block scrolls sideways, inside itself, holding code whose line breaks carry meaning; prose never goes in it.

Round 4 (Sass, rendering, tests):

19. Library mixins: `nfs-typography-helpers` (three grid margin rules, one `@error`), checks-only `nfs-typography-base`, none for text alignment (ADR 0012's dated note: one per export mixin that needs one).
20. Rendering modes: host bindings only, the same on server and client from the token; nothing replays, nothing waits.
21. Tests: eight stories; e2e for responsive alignment, keyboard scrolling, grid margins, reflow, and text spacing; the fixture app's first paint and hydration.

The frontier is empty: no question is left open.

### Decisions

1. Four standalone attribute directives in `ngx-foundation-sites/typography-helpers`, one per Foundation export mixin (D1, D3): `NfsTextAlignment` (`[nfsTextAlign]`), `NfsTypographyHelpers` (`[nfsSubheader]`, `[nfsLead]`, `[nfsStat]`, `[nfsCiteBlock]`, `[nfsCodeInline]`, `[nfsCodeBlock]`), `NfsNoBullet` (`ul[nfsNoBullet], ol[nfsNoBullet]`), and `NfsTypographyBase` (`[nfsHeadingSize]`); nine Utility attributes; no all-in-one array.
2. The shape: the Utility directive rule's stand-alone shape (clause 0) for every class, because each class styles whatever element carries it, needs no other class of the family on or around it, and sets its own property; the rule's clause 0 names the text alignment classes as its case. Not the roles shape (no class marks an element whose role another of its classes modifies; `.no-bullet` modifies an HTML list, not a Foundation role) and not the one-effect shape (no `<words>-for-<bp>` names, and the classes decide unrelated things) (D2).
3. Names (D4, D5): `nfsTextAlign`; the booleans `nfsSubheader`, `nfsLead`, `nfsStat`, `nfsCiteBlock`, `nfsCodeInline`, `nfsCodeBlock`, `nfsNoBullet`; `nfsHeadingSize` for `.h1` to `.h6`. Names considered and rejected because they are HTML presentational attributes of their hosts: `align` (for the alignment classes: a static `align` aligns the text of `p`, `div`, and `h2`, measured in three engines) and `type` (for removing list markers, `type="none"`: a static `type="i"` restyles an `ol` under Foundation's CSS, measured). Other rejected names, for other reasons: `nfsAlign`, `nfsCode="inline" | "block"`, `nfsHeader`, `nfsHeaderSize`, `nfsTypescale`, `nfsHeadingLevel`, an un-prefixed `size`, `nfsH1` to `nfsH6`, and a `none` value of `nfsListStyleType`.
4. Values (D6): `NfsTextAlignName` (`'left' | 'right' | 'center' | 'justify'`, closed) with `NfsTextAlignInput` (a name or `NfsClassBreakpointRules`); `NfsHeadingSize` (`1` to `6`, closed) with `NfsHeadingSizeInput` (plus the static strings); booleans through `nfsVariantBoolean`; no value sets no class; no Open family, so no Variant property.
5. Overlaps and pairs (D7): Foundation's cascade decides within `NfsTypographyHelpers` and across families; the spec names each measured pair, including the component hosts on which `nfsTextAlign` changes nothing and the Prototyping separator that overrides it.
6. Grid margins (D8): `nfs-typography-helpers` restores the left margin `.no-bullet` replaces on an XY margin grid (with its margin-collapse classes) and on a top-level Float or Flex Grid row, from Foundation's `xy-gutters()` and `breakpoint()`, at `ul.no-bullet`'s specificity; 683 bytes compressed.
7. Contrast (D9): `nfs-typography-helpers` stops the compile when `$subheader-color` or `$cite-color` is under 4.5:1 against `$body-background` or `$code-color` under 4.5:1 against `$code-background`; checks-only `nfs-typography-base` when `$header-small-font-color` is under 4.5:1; required on Foundation's defaults: all three at `#737373`, set after the settings file.
8. Code blocks (D10): the Scroll region recipe and the Prototyping overflow check, applied to `nfsCodeBlock`; no bound `tabindex`.
9. Lists (D11): no role; `role="list"` in the recipe where the count matters outside a `nav` (WebKit's list heuristic).
10. Headings and subtitles (D12, D13): `nfsHeadingSize` changes only the look; a subtitle is a `p nfsSubheader` in an `hgroup`.
11. Development checks (D14): copied classes in every directive (reported, not stripped); the code block check. Runtime check (D15): `nfsTextAlign` rules keys above the Zero breakpoint against `--nfs-breakpoint-classes` only.
12. Scope (D16): the Typography Base page's `.cite-block`, `.code-inline`, and `.code-block`, and the Typescale's `.h1` to `.h6`, are covered here; the print classes go to the Visibility Classes (proposed below).
13. Out of Scope, each with its category: base element styles (`scope-boundary`); the print classes (`scope-boundary`); logical alignment (`scope-boundary`); the Sass-only code and citation mixins (`scope-boundary`); `$enable-cite-block` and `$enable-code-inline` as inputs (`other`); components' own alignment Variants (`scope-boundary`); the tooling and Runtime-check configuration (`scope-boundary`); runtime theming (`scope-boundary`).
14. Glossary terms: Typography Helpers, Subheader, Heading size (D19). No ADR: the grid margin rules and the colour checks are reversible library CSS, and the scope placement is a dated note on ADR 0039.

### Triage

- The family's public API (four directives, nine attribute names, their types): impact HIGH (public API; other specs already write `nfsTextAlign` and wait for the `.no-bullet` name), confidence HIGH (the names follow the Utility directive rule's clauses mechanically where it gives a name, and `nfsHeadingSize` was chosen against five alternatives from Foundation's own docs wording and HTML's term; no bare default, no contradiction with an ADR or the research). Decided.
- One `NfsNoBullet` class for both elements: impact LOW (one directive class; splitting it later is additive), confidence HIGH (it meets every purpose clause 1 states; the clause's letter assumes per-element types, which a boolean does not have). Decided, with a clarification of clause 1 proposed below.
- The grid margin rules in `nfs-typography-helpers`: impact MEDIUM (library CSS that three grid specs' recipes depend on; reversible), confidence HIGH (measured in three engines, with collapse classes, nested rows, and right-to-left). Decided.
- The three required colours and the two mixins' checks: impact MEDIUM (consumer settings), confidence HIGH (axe and the exact formula in three engines; the bundle's existing `#737373`). Decided.
- Covering the Typography Base page's three helper classes and Typescale here, and sending the print classes to the Visibility Classes: impact MEDIUM (scope placement), confidence HIGH (ADR 0039 leaves no class unowned; the export mixins decide). Decided; the Visibility change needs its own ticket.
- Lists without a bound role, headings without a check, the `hgroup` recipe: impact LOW, confidence HIGH (clause 5, the Menu's D14, WHATWG HTML, WebKit's source). Decided.

Nothing is left OPEN FOR HUMAN. No prototype is needed: the open questions were cascade, contrast, and platform facts, measured above.

### Placeholders in published specs

| Placeholder | Specs that use it | Final name |
| --- | --- | --- |
| `nfsTextAlign`, "the text-alignment directive until that spec names it" | [Spec: Pagination](87-spec-pagination.md) (Solution, class table row `.text-center`, Rendered HTML note, `<ul nfsPagination nfsTextAlign="center">`, the `pagination--centered` story, D10); [Spec: Forms](98-spec-forms.md) (Rendered HTML note, the Label Positioning example `label nfsFormLabel middle nfsTextAlign="right"`) | `nfsTextAlign`, the Utility attribute of `NfsTextAlignment`; the name stays, the placeholder notes go |
| "the Typography Helpers' directive for `.no-bullet`", unnamed | [Spec: XY Grid](99-spec-xy-grid.md) (Rendered HTML note, Out of Scope); [Spec: Float Grid](100-spec-float-grid.md) (Rendered HTML note, Out of Scope); [Spec: Flex Grid](101-spec-flex-grid.md) (1.3.1 row, Rendered HTML note, Out of Scope); [Spec: Card](90-spec-card.md) (Out of Scope; its list-of-cards example) | `nfsNoBullet`, the Utility attribute of `NfsNoBullet`, on `ul` and `ol` |
| "`p.lead`, a Typography Helpers class whose directive the Typography Helpers spec names" | [Spec: Reveal](18-spec-reveal.md) (Rendered HTML) | `nfsLead` of `NfsTypographyHelpers` |
| "the `.text-center` demo class" | [Spec: Flexbox Utilities](103-spec-flexbox-utilities.md) (docs conventions) | `nfsTextAlign="center"` |
| "centring is the Typography Helpers directive" | building-blocks Table D, the Pagination row | `nfsTextAlign="center"` |

Needs the placeholders show: all are met. The Pagination's centring works (measured: the items are centred), and so does the Forms label's right alignment (measured). The grid specs' and the Card's list grids are met only together with `nfs-typography-helpers` included: without it `nfsNoBullet` moves a margin grid by half a gutter and stops a row centring (measured), which D8 fixes. The Card's grid has no margin gutters, so there `nfsNoBullet` removes the markers and the 20 px list indent, as intended.

### What other specs need from this one

- The Card's list-of-cards example, the directive the XY Grid spec found missing (its `<ul nfsGridX>` keeps a 20 px margin and its markers): `nfsNoBullet`, with `role="list"` so WebKit keeps it a list. Replacement text in change 9 below.
- The XY Grid, Float Grid, and Flex Grid list recipes: `nfsNoBullet` plus `role="list"` where the count matters, and `nfs-typography-helpers` included when the list is a margin grid or a row.
- The Pagination and Forms keep `nfsTextAlign` as written and import `NfsTextAlignment` from `ngx-foundation-sites/typography-helpers`.
- The Visibility Classes: Foundation's `.show-for-print` and `.hide-for-print` (printed by `foundation-print-styles` inside `foundation-typography`, documented on the Typography Base page) have no owner; they fit `nfsVisibility` as a `print` condition of `showFor` and `hideFor`. Proposed ticket in change 15.
- [Decide: inputs named like HTML presentational attributes](139-decide-inputs-named-like-presentational-attributes.md), for its audit: this spec's inputs are `nfsTextAlign`, `nfsSubheader`, `nfsLead`, `nfsStat`, `nfsCiteBlock`, `nfsCodeInline`, `nfsCodeBlock`, `nfsNoBullet`, and `nfsHeadingSize`; none is an HTML attribute; `align` and `type` were rejected for that reason, and the measurements above add `p`, `h2`, and `ol type` to the audit's evidence.
- [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md): eight Out of Scope items and the rejected rows of D1 to D19, each with its category.
- A finding for the orchestrator, not decided here: Foundation's `blockquote` text (`$blockquote-color: $dark-gray`) is 3.423:1 on the page (exact formula), a base element style no spec owns; `nfs-typography-base` would be the natural home for its check if the map wants base-style checks.

### Proposed shared-file changes (for the orchestrator)

1. `building-blocks.md`, Table D, the Typography Helpers row, replacing its empty cells:

   > | Typography Helpers | `docs/pages/typography-helpers.md` | [Spec: Typography Helpers](issues/106-spec-typography-helpers.md) | Four directives, one per Foundation export mixin, set every class through nine Utility attributes (the Prototyping Utilities' Utility directive rule, stand-alone shape): `NfsTextAlignment` (`nfsTextAlign`: `left`, `right`, `center`, `justify`, or a Breakpoint rules object), `NfsTypographyHelpers` (`nfsSubheader`, `nfsLead`, `nfsStat`, `nfsCiteBlock`, `nfsCodeInline`, `nfsCodeBlock`), `ul[nfsNoBullet], ol[nfsNoBullet]` (`NfsNoBullet`), and `NfsTypographyBase` (`nfsHeadingSize`, 1 to 6, for the Typescale's `.h1` to `.h6`) | Directives: Utility classes that stand alone, on consumer-written elements; Foundation generates nothing | Native platform (Foundation's CSS on headings, paragraphs, lists, `code`, and `hgroup`); Aria and CDK have nothing for text styles | Host `[class]` bindings over one `computed` class list per directive; `nfsBreakpointsToken` for the Zero breakpoint; development checks in one `afterRenderEffect` (copied classes; a scrolling code block no keyboard can reach, or one without a name); the `strictVariantNames` and `strictVariantProperties` Runtime checks for alignment rules keys against `--nfs-breakpoint-classes`; `nfs-typography-helpers` (a list's grid margin restored where `.no-bullet` replaced it, one `@error` over subheader, citation, and code contrast) and checks-only `nfs-typography-base` (one `@error` over heading `small` contrast) | None; a scrolling code block the consumer names is a WAI-ARIA `region` |

2. `building-blocks.md`, Table D, the Pagination row: replace "centring is the Typography Helpers directive written beside `nfsPagination`" with "centring is the Typography Helpers' `nfsTextAlign="center"` written beside `nfsPagination`".

3. `building-blocks.md` 1.10 Accessibility baseline, a new bullet after the Card bullet (or after the Prototyping Utilities bullet, if that one is applied first):

   > - Typography Helpers ([Spec: Typography Helpers](issues/106-spec-typography-helpers.md)): Foundation's `$dark-gray` subheaders and citations are 3.423:1 and its `$medium-gray` heading `small` text 1.625:1 on the page, which axe fails in three engines, so `nfs-typography-helpers` stops the compile when `$subheader-color` or `$cite-color` is under 4.5:1 against `$body-background` or `$code-color` under 4.5:1 against `$code-background`, and checks-only `nfs-typography-base` does when `$header-small-font-color` is under 4.5:1; the consumer must set all three to `#737373` (4.701:1) on Foundation's defaults, mirrored in the Storybook settings overrides. A `.code-block` that scrolls carries the Scroll region recipe (`tabindex="0"`, `role="region"`, a name), checked in development (2.1.1, 4.1.2); a list without markers whose item count matters outside a `nav` carries `role="list"`, because WebKit exposes such a list as a group (1.3.1); `nfsHeadingSize` changes a heading's look, never its level.

4. `CONTEXT.md`, three terms under Foundation side, after **Utility class** (after **Prototyping Utilities** if that term is applied first):

   > **Typography Helpers**:
   > Foundation's Utility family of text styles: the text alignment classes and their responsive forms, `.subheader`, `.lead`, `.stat`, `.no-bullet`, the Typescale classes `.h1` to `.h6`, and the citation and code looks `.cite-block`, `.code-inline`, and `.code-block`.
   > _Avoid_: typography utilities, text helpers (bare), typography base (for these classes)
   >
   > **Subheader**:
   > Foundation's lighter heading look (`.subheader`): on a paragraph grouped with its heading in an `hgroup` it marks a subtitle; on a heading it lightens the heading of a section of its own.
   > _Avoid_: subheading (for the look), subtitle (for the class), secondary heading
   >
   > **Heading size**:
   > The look of a heading level (`.h1` to `.h6`) given to any element; it never changes the element's own heading level or role.
   > _Avoid_: heading level (for the look), typescale (for the value), header size

5. `adr/0039-directives-manage-every-foundation-class.md`, a dated note at the end of Consequences:

   > - 2026-09-28 ([Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)): Foundation's Typography Base page has no spec, because its element styles have no class, but it documents classes that other export mixins print: `foundation-typography-helpers` prints `.cite-block`, `.code-inline`, and `.code-block`, and `foundation-typography-base` prints the Typescale classes `.h1` to `.h6` that the Typography Helpers page shows. They get directives in the Typography Helpers' entry point (`nfsCiteBlock`, `nfsCodeInline`, `nfsCodeBlock`, `nfsHeadingSize`). The print classes `.show-for-print` and `.hide-for-print`, printed by `foundation-print-styles` inside `foundation-typography` and documented on the same page, are Visibility classes and belong to the [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md).

6. `map.md`, Out of scope, the base-styles line: after "a spec that relies on a base element style documents it." insert "The classes the Typography Base page documents are not base styles: `.cite-block`, `.code-inline`, and `.code-block` are the [Spec: Typography Helpers](issues/106-spec-typography-helpers.md)'s, and `.show-for-print` and `.hide-for-print` are Visibility classes."

7. [Spec: Pagination](87-spec-pagination.md):
   - Class table row: "| `.text-center` | Utility (Typography Helpers) | The [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s `nfsTextAlign="center"` (`NfsTextAlignment`), written beside `nfsPagination` (D10) | Not this entry point's |".
   - Rendered HTML note: replace "`nfsTextAlign` stands for the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s text-alignment directive until that spec names it; its class belongs to that spec and is shown only to place it." with "`nfsTextAlign` is the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s text-alignment attribute (`NfsTextAlignment`, from `ngx-foundation-sites/typography-helpers`); its class belongs to that spec and is shown only to place it."
   - Story: "- `pagination--centered`: Foundation's Centered example with the Typography Helpers' `nfsTextAlign="center"` on the list; the items are centred (computed geometry: equal space on both sides within the list's content box)."

8. [Spec: Forms](98-spec-forms.md), Rendered HTML note: replace "The layout directives (`nfsGridX`, `nfsCell` with `size`) and the text-alignment directive (`nfsTextAlign`) stand for the directives of [Spec: XY Grid](../issues/99-spec-xy-grid.md) and [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md); their names here are placeholders that [Consistency review: the class-rule wave](../issues/133-consistency-review-class-rule-wave.md) replaces with the published ones." with "The layout directives (`nfsGridX`, `nfsCell` with `size`) stand for the directives of [Spec: XY Grid](../issues/99-spec-xy-grid.md), whose names here are placeholders that [Consistency review: the class-rule wave](../issues/133-consistency-review-class-rule-wave.md) replaces with the published ones; `nfsTextAlign` is the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s text-alignment attribute (`NfsTextAlignment`)."

9. [Spec: Card](90-spec-card.md):
   - Usage examples, the first block's comment and opening tag:

     ```html
     <!-- A set of cards that is a list, each an article with a linked title; nfsNoBullet removes the markers and the list indent, and role="list" keeps it a list in WebKit -->
     <ul nfsGridX [up]="{small: 1, medium: 3}" nfsNoBullet role="list">
     ```

     and, in the paragraph after the TypeScript example, after "... until the [Spec: XY Grid](../issues/99-spec-xy-grid.md) and the [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md) name their directives;" insert "`nfsNoBullet` is the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s;".
   - ARIA table row: "| A set of cards that is a list | A `ul` whose list items hold the cards (or carry `nfsCard` themselves), with `nfsNoBullet` for Foundation's markerless look and `role="list"`, because WebKit exposes a list without markers outside a navigation landmark as a group ([Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)); measured in Chromium, the `list` and `listitem` roles stay when the list is an XY block grid | HTML-AAM; WebKit's list heuristic |".
   - Out of Scope: "- Removing the bullets of a list of cards (`.no-bullet`): the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s `nfsNoBullet`, which the list-of-cards recipe uses. Category: `scope-boundary`." and "- Checks of typography colours other than the card's own text and link colours (`$header-color`, `$header-small-font-color`): page-wide settings of Foundation's base typography; `$header-small-font-color` is checked by the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s `nfs-typography-base`, and `$header-color` inherits the card's text colour. Category: `scope-boundary`."

10. [Spec: XY Grid](99-spec-xy-grid.md):
    - Rendered HTML note: replace "a list grid without markers also carries the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s directive for `.no-bullet`, whose name and list-role notes that spec decides, and the example leaves it out until then." with "a list grid without markers also carries the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s `nfsNoBullet`, whose margin reset that spec's `nfs-typography-helpers` keeps off a margin grid's own gutters (measured in three engines), and `role="list"` where its item count matters, because WebKit exposes a list without markers outside a `nav` as a group; the example shows the list grid with its markers."
    - Out of Scope: "- Removing a list grid's markers and margin (`.no-bullet`): the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s `nfsNoBullet`. Category: `scope-boundary`."

11. [Spec: Float Grid](100-spec-float-grid.md):
    - Rendered HTML note: replace "A list row without markers also carries the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s directive for `.no-bullet`, whose name that spec decides, and the examples leave it out until then." with "A list row without markers also carries the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s `nfsNoBullet`, whose margin reset that spec's `nfs-typography-helpers` keeps off a top-level row's `auto` margins (measured in three engines), and `role="list"` where its item count matters (WebKit); the examples show the rows with their markers."
    - Out of Scope: "- Removing a list row's markers (`.no-bullet`): the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s `nfsNoBullet`. Category: `scope-boundary`."

12. [Spec: Flex Grid](101-spec-flex-grid.md):
    - 1.3.1 row: replace "A list row stays a list, with its markers (Typography Helpers for `.no-bullet`)" with "A list row stays a list, with its markers (the Typography Helpers' `nfsNoBullet` removes them; `role="list"` where the count matters)".
    - Rendered HTML note: replace "a list row without markers also carries the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s directive for `.no-bullet`, which the example leaves out until that spec names it." with "a list row without markers also carries the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s `nfsNoBullet`, whose margin reset that spec's `nfs-typography-helpers` keeps off the row's `auto` margins (measured in three engines), and `role="list"` where its item count matters (WebKit)."
    - Out of Scope: "- Removing a list row's markers (`.no-bullet`): the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s `nfsNoBullet`. Category: `scope-boundary`."

13. [Spec: Reveal](18-spec-reveal.md), Rendered HTML: replace "The docs' `p.lead` is a Typography Helpers class whose directive the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md) names, so the examples here leave it out:" with "The docs' `p.lead` is `p nfsLead`, the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s attribute, which the examples here leave out because it changes nothing the dialog owns:".

14. [Spec: Flexbox Utilities](103-spec-flexbox-utilities.md), docs conventions: replace "the `.text-center` demo class and inline `height` (kept as story scaffolding under the Storybook conventions)" with "the `.text-center` demo class (as the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s `nfsTextAlign="center"`) and inline `height` (kept as story scaffolding under the Storybook conventions)".

15. A new ticket for the print classes (the orchestrator numbers it):

    > # NNN. Re-run: Visibility Classes spec for the print classes
    >
    > Type: grilling
    > Status: open
    > Blocked by: 104, 106
    > Labels: wayfinder:grilling
    > Map: ../map.md
    >
    > ## Question
    >
    > Foundation's `foundation-print-styles`, which `foundation-typography` includes, prints `.show-for-print` (`display: none !important` on screen, `display: block !important` in print) and `.hide-for-print` (`display: none !important` in print), documented on the Typography Base page; no spec binds them ([Spec: Typography Helpers](106-spec-typography-helpers.md), Out of Scope). Should `nfsVisibility` take `'print'` as a condition of `showFor` and `hideFor` (`showFor="print"`, `hideFor="print"`), with the forced `display: block` the orientation conditions document, or something else? Measure the pair in three engines' print emulation and with a breakpoint class beside it.

16. [Spec: Prototyping Utilities](102-spec-prototyping-utilities.md), the Utility directive rule, clause 1: after "... named after Foundation's inner mixins (`list-unordered`, `list-ordered`)." add "A class that one rule qualifies by several elements with one meaning and no inner mixin takes one directive class that names every element in its selector, named after the class (`ul[nfsNoBullet], ol[nfsNoBullet]` is `NfsNoBullet`, [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md))." If the proposed building-blocks 1.3 bullet and ADR of that spec are applied, the same sentence belongs in both.

17. `storybook-conventions.md`:
    - Section 5, `preview.scss`, two Library mixin lines beside the others: "`@include nfs-typography-base; // Typography Helpers: the heading small-text contrast check`" and "`@include nfs-typography-helpers; // Typography Helpers: list grid margins under nfsNoBullet and the subheader, citation, and code contrast checks; every typography-helpers--* story and every story whose list grid uses nfsNoBullet`".
    - Section 5, `_settings-overrides.scss`, a block before the feature switches:

      ```scss
      // color-contrast (1.4.3): Foundation's $dark-gray subheaders and citations are 3.423:1 and its $medium-gray
      // heading small text 1.625:1 on the page (axe fails them in three engines), and nfs-typography-helpers and
      // nfs-typography-base stop the compile. Spec: Typography Helpers, typography-helpers--subheader,
      // --code-and-citations, and --typescale; also every story with a cite element or a small inside a heading.
      $subheader-color: #737373;
      $cite-color: #737373;
      $header-small-font-color: #737373;
      ```

    - Section 8, the scaffolding bullet: replace "typography helpers (`.text-center`, `.lead`)" with "the Typography Helpers' attributes (`nfsTextAlign`, `nfsLead`, `nfsNoBullet`, from `ngx-foundation-sites/typography-helpers`)".

18. `map.md`, Decisions so far, one line:

    > - [Spec: Typography Helpers](issues/106-spec-typography-helpers.md) -- four directives, one per Foundation export mixin (the Utility directive rule's stand-alone shape), set every class through nine `nfs` Utility attributes: `nfsTextAlign` (four closed names or a Breakpoint rules object), the booleans `nfsSubheader`, `nfsLead`, `nfsStat`, `nfsCiteBlock`, `nfsCodeInline`, and `nfsCodeBlock`, `nfsNoBullet` on `ul` and `ol`, and `nfsHeadingSize` (1 to 6) for the Typescale's `.h1` to `.h6`, the citation, code, and Typescale classes coming from the Typography Base page and export mixin; no name is an HTML presentational attribute (measured: static `align` and `ol type` restyle the host); measured in three engines: Foundation's subheader and citation greys are 3.423:1 and heading `small` text 1.625:1, so `nfs-typography-helpers` and checks-only `nfs-typography-base` stop the compile and three colours are required (`#737373`), and `.no-bullet` zeroes a margin grid's gutter and a row's centring, which `nfs-typography-helpers` restores from Foundation's own mixins; no role is added: a markerless list whose count matters outside a `nav` carries `role="list"` (WebKit's list heuristic), a subtitle is a `p nfsSubheader` in an `hgroup`, and a scrolling code block is a named Scroll region, checked in development; the print classes go to the Visibility Classes (ticket proposed); impact HIGH, confidence HIGH; no ADR. Spec: [specs/typography-helpers.md](specs/typography-helpers.md).

### Gist for Decisions so far

Four export-mixin directives set every Typography Helpers, Typescale, citation, and code class through nine `nfs` Utility attributes (none named after an HTML presentational attribute), with compile-time colour checks, three required greys, a list-grid margin fix, and no role added.

### Amendment, 2026-09-28 (print helper classes)

By [Re-run: Typography Helpers spec for the print helper classes](144-rerun-typography-helpers-print-classes.md), which holds the measurements, the grilling record, the triage, and the proposed shared-file changes. The [Re-run: Visibility Classes spec for the print classes](143-rerun-visibility-classes-print.md) took `.show-for-print` and `.hide-for-print` and sent the other two classes of `foundation-print-styles` here: `.print-break-inside` and `.ir`. [specs/typography-helpers.md](../specs/typography-helpers.md) is revised in place.

What changed, against the decisions above:

- Decision 1 (directives): five directives and ten Utility attributes; `NfsPrintStyles` (`[nfsPrintBreakInside]`) is `foundation-print-styles`' directive under the Utility directive rule's clause 1, in the same entry point, for its one stand-alone class (spec D20). Rejected: no attribute (`superseded`), the attribute in `NfsTypographyHelpers` (`other`), an entry point of its own (`other`), a value of `nfsVisibility` (`other`).
- Decision 3 (names): adds `nfsPrintBreakInside`, the camelCase of the class. Rejected: `nfsBreakInside` and `nfsPageBreakInside="auto"` (both `other`).
- Decision 4 (values): `nfsPrintBreakInside` is a closed boolean through `nfsVariantBoolean`, default `false`, with no responsive form (Foundation prints the class only for print media), no Variant property, and no Runtime check.
- Decision 5 (pairs): in print, `.print-break-inside` (one class) beats Foundation's `pre, blockquote` and `tr, img` rules (one element each); a consumer print rule of more than one class's specificity beats it. Measured in Chromium 153, Firefox 155, WebKit 26.6, and Edge 153 under print emulation: computed `break-inside` is `avoid` on `pre`, `blockquote`, `tr`, and `img` and `auto` with the class, and `auto` either way on a `div`, a `table`, and a `code.code-block`; through Chromium's and Edge's PDF output (Letter, Foundation's `@page` margin), a `pre`, `blockquote`, or tall `tr` that crosses a page boundary prints on 3 pages without the class and 2 with it, a `pre` longer than a page on 4 and 3, and an `img` on the same count either way, because no engine breaks an image.
- Decision 11 (checks): the copied-class check covers `print-break-inside`; no check for hosts where the attribute changes nothing, and no selector restriction, because Foundation's class is unqualified and the directive cannot read print styles on screen (spec D21, `other`).
- Decision 12 (scope): `.print-break-inside` is covered here; `.ir` is dropped with no attribute and no report of a copy (spec D22): no Foundation rule styles it, no docs page names it, and HTML5 Boilerplate, whose print styles Foundation copied, removed the class and its print rule in 5.0.0 (2015-02-01). Measured in four engines: links inside an `.ir` element print no address, a link carrying it prints its own, and on screen it changes nothing. The print classes are the Visibility Classes' `print` condition, and the spec's placeholder wording says so (that re-run's proposal 5, applied here).
- Decision 13 (Out of Scope) gains: `.ir` (`deprecated-upstream`); Foundation's print rules for elements and their settings (`scope-boundary`); a check or narrower selector for `nfsPrintBreakInside` (`other`); the print-classes item now names the Visibility Classes' `print` condition.
- Decision 14 (glossary): the **Typography Helpers** term gains `.print-break-inside` (proposal in the re-run's Answer).
- Tests: a ninth story, `typography-helpers--print-breaks` (spec D18); e2e print emulation in three engines and a relative page count in the Chromium project; the fixture app's JavaScript-off run adds print emulation; browser-level host-binding and copied-class cases.
- Sass: no `nfs-print-styles` mixin (no custom CSS, no check); a missing `foundation-print-styles` loses nothing the attribute would give and is not reported.
- Spec sections revised: the header, Problem Statement, Solution, User Stories (47, five new), Foundation contract (two rows), class mapping (two rows), the Utility directive rule applied (clauses 0, 1, 3, 4, 6, 7, and a print cascade pair), hierarchy, entry point, API, Material comparison, implementation level, ARIA table, a print note after the WCAG table, Rendered HTML, Rendering modes, Testing Decisions, Out of Scope, design decisions (D3, D4, D16 to D19 amended; D20 to D22 added), usage examples, Foundation behaviour changed, Sass, and Notes.

### Amendment, 2026-09-28 (out-of-scope survivors)

By [Re-run: Typography Helpers spec, out-of-scope survivors](146-rerun-typography-helpers-out-of-scope-survivors.md), which holds the measurements, the grilling record, the triage, and the proposed shared-file changes. [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md) upheld two items for this spec: the finding this ticket left for the orchestrator (`$blockquote-color`, 3.423:1 on the page), and grey text inside tinted containers, which the Callout and Card specs had left to base typography. [specs/typography-helpers.md](../specs/typography-helpers.md) is revised in place.

What changed, against the decisions above:

- Decision 7 (contrast): checks-only `nfs-typography-base` stops the compile with one `@error` listing every failing pair, `$header-small-font-color` and `$blockquote-color` against `$body-background` (spec D9). Measured with axe in Chromium 153, Firefox 155, and WebKit 26.6: Foundation's `$dark-gray` blockquote text fails on the page, and with the three greys this ticket required it still fails there. The other colours `foundation-typography-base` prints stay unchecked, because they pass on Foundation's defaults (`$anchor-color` 4.647:1, `$keystroke-color` 15.863:1, `$header-color` `inherit`) and the map's base-styles line checks a base element colour only where it fails there (`scope-boundary`).
- Decision 7 (required settings): four greys at `#666666` in place of three at `#737373` (spec D23). Measured with axe in the same three engines, `#737373` fails 10 of the 13 light container backgrounds the specs keep: the five callout tints, the card divider, and the table's head, stripes, and footer, at rest and under the pointer of a `hover` table (3.799:1 to 4.465:1, and 4.014:1 on a hovered stripe). `#666666` passes all 13 (4.601:1 at worst, on the card divider). Rejected: `#737373` with `#666666` named for containers (`platform-or-a11y`); a `@warn` or `@error` in `nfs-callout`, `nfs-card`, or `nfs-table`, or container checks in this spec's mixins (`other`); one grey for light and dark containers, which does not exist (`platform-or-a11y`).
- New requirement (1.4.3): the compile checks the greys against the page only, and a grey inside a container reaches 4.5:1 on its background too. The spec's Sass subsection gives the ratios for every light container background. A dark container (a title bar, a tooltip) needs `#797979` or lighter there, set in the consumer's own rule.
- Decision 13 (Out of Scope): the base-styles item names `$blockquote-color` beside `$header-small-font-color` as a colour `nfs-typography-base` checks (`scope-boundary`); a new item leaves out the blockquote's side border (1.4.11; `platform-or-a11y`).
- Tests: `typography-helpers--composition` puts the greys on a card divider and an alert callout, the two lowest ratios, under axe; `--code-and-citations` and `--print-breaks` assert the blockquote's colour; the Sass compile tests name `$blockquote-color`.
- The Callout's and the Card's Out of Scope bullets on typography colours point to the requirement; their D7 and D8 are unchanged.
- Spec sections revised: the header, Problem Statement (one bullet extended, one added), Solution, User Stories (27, 28, and 39 amended, 29 added; 48 in all), Material comparison, the fallback note, the 1.4.3 row, Testing Decisions, Out of Scope, D9 amended, D23 added, Foundation behaviour changed, and Sass (rules, reused settings, missing include, required settings, and a table of container ratios).
