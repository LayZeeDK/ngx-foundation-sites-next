# 102. Spec: Prototyping Utilities

Type: grilling
Status: resolved
Blocked by: 81
Labels: wayfinder:grilling
Map: ../map.md

## Question

What Angular directives (preferred) or components give Foundation for Sites 6.9's Prototyping Utilities to the next, from-scratch ngx-foundation-sites repo, under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Foundation's docs page is `docs/pages/prototyping-utilities.md` and its Sass is `scss/prototype/` in the 6.9.0 clone. Publish `specs/prototyping-utilities.md`.

Known from the triage: Opt-in and disabled by default; many families (spacing, sizing, borders, shadows, display, overflow, position, text): how directives cover them without one directive per class, and how they compose on one element.

## How to work it

Run `/grill-with-docs` (self-grilling, both sides) over the questions this component raises, then publish with `/to-spec` in the map's spec shape; the [Spec: Button](37-spec-button.md) is the nearest precedent. Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this component); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Cover: one directive per Structural class and what else each owns (the ARIA, `type` default, or development and compile-time checks the documented markup lacks for WCAG 2.2 AA, ADR 0022); every Variant as a typed input by the decision above; State classes as host bindings; the Sass mixin only where custom CSS or checks are needed (ADR 0012); the rendering-mode contract; stories with play functions and axe; e2e only where Storybook cannot reach. Record the decisions in this ticket's Answer, and propose shared-file changes (a building-blocks row, glossary terms) for the orchestrator. Model: Opus 5.5.

## Answer

Resolved 2026-09-28 (Opus 5.5, AFK: both sides of the grilling played against the sources). Spec: [specs/prototyping-utilities.md](../specs/prototyping-utilities.md).

Sources read: Foundation 6.9.0's docs page and every partial of its prototype Sass, its settings file, `foundation-everything`, and its global styles; ADR 0001, 0012, 0022, 0039, 0040; building-blocks 1.1 to 1.14 and Table D; `CONTEXT.md`; the map's Notes; `research/out-of-scope-triage.md` (section 4, the utility families; the judge's recommendation to keep them out was overruled by the user, ADR 0039), `research/out-of-scope-exclusions.md` (no row names this family), `research/foundation-component-catalogue.md` (its row), `research/typed-variant-inputs.md` sections 2.3 to 2.5; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md); the [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md) (its prototype registry rows and the spacer range); the Runtime-check contract of the [Spec: Breakpoint service (shared utility)](53-spec-breakpoint-service.md); the [Spec: Label](94-spec-label.md), [Spec: Menu](85-spec-menu.md), [Spec: Button](37-spec-button.md), [Spec: Switch](84-spec-switch.md), [Spec: Card](90-spec-card.md), and [Spec: Sticky](28-spec-sticky.md) as precedents; Angular 22.2's binding-collision and class-binding docs.

Measurements (Dart Sass 1.104.1 over the Foundation 6.9.0 clone; Playwright 1.63.0 with Chromium 153, Firefox 155, and WebKit 26.6; axe-core 4.13.0; scripts under `D:/tmp/nfs-wave-102/`, not committed):

- Foundation's prototype output has 123 classes on its defaults and 357 with every breakpoint flag on.
- Overlap by source order, the same in three engines: `margin-2 margin-top-1` gives a 32 px top margin; `margin-horizontal-2 margin-left-1` a 32 px left margin; `overflow-scroll overflow-x-hidden` and `overflow-hidden overflow-x-scroll` both scroll horizontally.
- Responsive spacing is printed count by count, every other family breakpoint by breakpoint: at 1100 px `medium-margin-1 large-margin-0` keeps 16 px and `medium-padding-2 large-padding-1` 32 px. Reprinting the responsive spacing rules for every Class breakpoint after the first responsive one, in breakpoint order, from Foundation's own mixins, gives 0 and 16 px, and 0 px for `medium-margin-2 large-margin-1 xlarge-margin-0` at 1300 px with `xlarge` added, in three engines; it costs 4087 bytes compressed on Foundation's breakpoints and 8224 with `xlarge`.
- A scroller with no focusable content and no `tabindex` is in the tab order in Chromium 153 and Firefox 155, not in WebKit 26.6; axe reports it (`scrollable-region-focusable`) in all three; with `tabindex="0"`, `role="region"`, and a name it is reached by Tab and scrolls with the arrow keys in all three.
- `$global-prototype-breakpoints: true` in an overrides file after Foundation's settings file leaves the compiled CSS byte-identical; each family's flag set there works.
- `$prototype-arrow-color` set before `@import 'foundation'` is replaced by `$black` (the arrow partial has no `!default`); set after the import it is kept.
- `foundation-prototype-typescale`, named in the docs' include list, does not exist in Foundation 6.9.0's Sass.

### Grilling record

Round 1 (the frontier once ADR 0039 and ADR 0040 are taken as decided):

1. Directive or component? Directives: Foundation generates nothing, and every class sits on an element the consumer writes (ADR 0001).
2. Which classes are in scope? Every class the prototype export mixins print, responsive forms included; the Sass-only mixins print no class and stay the consumer's Sass. The docs' `foundation-prototype-typescale` does not exist.
3. What is one directive? Options: one per class (hundreds), one per attribute (42 imports; overlapping attributes cannot see each other), one per page (every instance creates every one of 42 inputs), one per Foundation export mixin. Decided: one per export mixin, eighteen in all (the list style mixin qualifies its classes by element, so it gives two). It is the unit the consumer includes in Sass, and its classes are the ones that overlap.
4. How does a consumer write a class? Options: plain inputs on one host attribute (`nfsPrototype margin="1" position="relative"`), or inputs whose names are the directive's attribute selectors (`nfsMarginTop="1"`). Decided: selector-named `nfs` inputs, Utility attributes. Plain `position`, `size`, `color`, `width`, and `height` would also feed the Dropdown pane's and Tooltip's `position`, the Button's `size` and `color`, and an image's native attributes (Angular binds an attribute to every matching input on the element).
5. How are the attributes named? The class stem where it is the property or the utility's word; the CSS property where templates share or shorten a stem (`nfsTextTransform`, `nfsTextDecoration`, `nfsListStyleType`); a class that fits another template becomes its value (`nfsPosition="fixed-top"`); a class without a value is a boolean named after it (`nfsBordered`, `nfsMaxWidth100`). The published placeholders of the neighbouring families (`nfsTextAlign`, `nfsShowForSr`) already fit.
6. How are values typed? By ADR 0040 over the registries the tooling spec already declares: names for the Open lists, a count 0 to `$prototype-spacers-count`, a closed union for the separator's three classes, typed booleans. Size names are strings, as the declaration file writes numeric-like names.
7. Responsive forms? The same attribute: a bare value or a Breakpoint rules object for valued attributes, `true` or a Breakpoint query with `up` only for booleans, Class breakpoints only; every flag-gated family gets its own Variant property (building-blocks 1.13).

Round 2 (hangs on 3 to 7):

8. Foundation resolves overlapping classes by source order (measured). Bind as written, warn, or resolve? Decided: resolve per side at each breakpoint, most specific attribute wins, no two bound classes set one side; Foundation's order then never decides.
9. Responsive spacing is out of breakpoint order (measured). Document a limit or fix? Decided: `nfs-prototyping-utilities` prints the rules again in breakpoint order from Foundation's mixins, only while the flag is on, and only for breakpoints after the first responsive one (measured correct in three engines).
10. `ul.list-*` and `ol.list-*` share a stem but not their lists. Decided: two directive classes with element-qualified selectors, so `ol nfsListStyleType="disc"` fails to compile.
11. `$prototype-sizing` lists CSS properties, which would have to become attribute names. Decided: `nfsWidth` and `nfsHeight` only; the registry is dropped (a type nothing reads); a keyed input for consumer-added properties is additive later.
12. Composition with other library directives and across families? Side by side: disjoint class lists merge. Across families Foundation's cascade decides, and the spec names each pair (D21).
13. Copied classes: strip or report? Report: a class record that strips copies would hold hundreds of `false` keys per instance; the Label's precedent.
14. Class and alias names? Classes from the export mixins (`NfsPrototypeSpacing`), because `NfsPosition` is the Anchored pane's type; aliases with `Name`, `Count`, `Input`, and `Value` suffixes, so no alias collides with a directive class.
15. An all-in-one import? `nfsPrototypeClasses`, after Foundation's `foundation-prototype-classes`; prototyping is this family's purpose.

Round 3 (WCAG 2.2 AA, hangs on the family list):

16. Scroll regions (2.1.1, 4.1.2): bind `tabindex` or check? Check plus recipe; a bound `tabindex` would fight an Aria-hosted element's own and the consumer's value, and the name must be the consumer's.
17. Fixed bars (2.4.11): the Sticky spec's rule, required `scroll-padding` and a development warning.
18. `.text-hide`: a warning when nothing visible replaces the text (2.4.7, 2.5.8); the recipe puts `alt=""` on a logo that shows the hidden words.
19. `.bordered` and `.border-none` on form fields undo the Forms spec's 3:1 boundary (1.4.11): a warning.
20. Arrow contrast: `@warn` under 3:1 against `$body-background` (an arrow may be decoration, as the dark menu icon may be).
21. Truncation, `nowrap`, `overflow: hidden`, CSS tables, and positioned order: documented requirements with story and e2e coverage, not checks; the directives cannot read content.

Round 4 (Sass, Runtime checks, rendering, tests):

22. Library mixin: the spacing order copy, ten registry properties, sixteen flag properties, the arrow warning; no required setting on Foundation's defaults.
23. Runtime checks: every directive includes `nfs-prototyping-utilities` with `prototype-spacers-count` as the presence marker; the handle is named after the directive class, since several attributes create one instance (a contract clarification proposed below).
24. Rendering modes: host bindings only, computed the same on server and client from the token; nothing replays, nothing waits.
25. Tests: eleven stories; e2e only for breakpoints, real keys, geometry, reflow, text spacing, and the fixture app.

Round 5 (reopened by the coordinator once the Flexbox Utilities, Visibility Classes, XY Grid, and Table specs were committed):

26. Do the committed role-directive shapes contradict the rule? Not once the rule states its scope by kind of family: roles (Flexbox) keep building-blocks 1.4's shape, one effect under `<words>-for-<bp>` names (Visibility) keeps its named directive, and classes that stand alone and set independent properties take Utility attributes. What all three must share is collision safety for un-prefixed inputs. Decided: clause 0 and D24; neither committed spec changes.
27. Does the Table's Scroll region change the overflow decision? No: `nfsTableScroll` binds `tabindex` and `role` on the element it owns, which always scrolls; an overflow utility keeps the check and the recipe, now named with the Table's term.

The frontier is empty: no question is left open.

### Decisions

1. Eighteen standalone attribute directives in `ngx-foundation-sites/prototyping-utilities`, one per Foundation export mixin (two for list style), with 42 Utility attributes; `nfsPrototypeClasses` lists them all.
2. The Utility directive rule, the precedent for the Float Classes and Typography Helpers specs:
   0. Scope (written after the coordinator's request, once the Flexbox Utilities, Visibility Classes, XY Grid, and Table specs were committed): Utility classes that stand alone and set independent properties. Two other shapes of the same wave cover the rest, one per kind of family: roles (the Flexbox Utilities' flex parent and flex child, with the alignment classes that work only on a flex parent) take building-blocks 1.4's Structural class shape; a family whose templates all express one effect under Foundation's `<words>-for-<bp>` names (the Visibility Classes' `nfsVisibility` with `showFor` and `hideFor`, which building-blocks 1.4 names) takes one directive with those words as inputs, and its single-class directives (`nfsShowForSr`, `nfsShowOnFocus`) are this rule's booleans. In every shape an un-prefixed input either shares no name with another directive's input that can sit on the same element or is reported in development (the Visibility spec's check for the Responsive Toggle's `hideFor`). Spec D24.
   1. One directive class per Foundation export mixin, `Nfs` + the PascalCase of the mixin without `foundation-`; one per element where the mixin qualifies its classes by element.
   2. Each class template is one input whose public name is also one of the directive's attribute selectors; the selector lists them all.
   3. Names: `nfs` + the stem, or the CSS property where templates share or shorten a stem; a fitting class is a value; a class without a value is a boolean named after it.
   4. Values typed by ADR 0040; the responsive form is the same attribute; no value sets no class.
   5. A utility directive binds only its own classes through one computed list, with no un-prefixed input, listener, or ARIA, so directives compose side by side.
   6. Overlap within a family is resolved per side by the directive; out-of-order responsive rules are printed again in order by the family's Library mixin; across families Foundation's cascade decides and the spec names the pairs.
   7. Each directive owns its WCAG 2.2 AA development checks; the entry point's Library mixin writes every Variant property and holds its compile-time checks and order fixes.
3. Values: names over the registries `NfsPrototypeDisplayOverrides`, `NfsPrototypePositionOverrides`, `NfsPrototypeOverflowOverrides`, `NfsPrototypeSizesOverrides`, `NfsPrototypeTextDecorationOverrides`, `NfsPrototypeTextTransformationOverrides`, `NfsPrototypeStyleTypeUnorderedOverrides`, `NfsPrototypeStyleTypeOrderedOverrides`, `NfsPrototypeArrowDirectionsOverrides`; the count over `NfsPrototypeSpacersCountOverrides` (0 to 3); the separator closed; booleans through typed transforms; size names as strings.
4. Responsive forms: rules objects and `up` queries over Class breakpoints; each of the sixteen flags has a Variant property that lists `$breakpoint-classes` while on and is empty while off, and a responsive value against an empty one is reported naming the flag.
5. Overlap resolution per side for spacing (margin and padding separately) and per axis for overflow, at each Class breakpoint in the Breakpoint map's order; only changed sides get classes at a breakpoint.
6. `nfs-prototyping-utilities` reprints responsive spacing in breakpoint order (only while `$prototype-spacing-breakpoints` is on, for breakpoints after the first responsive one), writes the Variant properties, and warns on arrow contrast. No required setting.
7. List style: `ul[nfsListStyleType]` and `ol[nfsListStyleType]`, each typed over its own list.
8. Sizing: `nfsWidth`, `nfsHeight`, `nfsMaxWidth100`, `nfsMaxHeight100`; `$prototype-sizing` is not a registry.
9. Copied classes are reported in development, not stripped.
10. Development checks: copied classes; an overflowing scroll region with no `tabindex` and nothing focusable, or focusable with no name; a `fixed-top` or `fixed-bottom` bar taller than the document's `scroll-padding` on its edge; `nfsTextHide` with nothing visible in its place; `nfsBordered` or `nfsBorderNone` on `input`, `select`, or `textarea`.
11. Documented requirements, not checks: truncated or clipped text available in full where it leads; `nfsTextNowrap` on short text only; CSS tables are layout; positioned content keeps a DOM order that matches the visual order; the arrow is decoration and the state is its control's.
12. No `exportAs`, Defaults token, role, name, state, listener, providers, or `Renderer2` write; native implementation level.
13. Runtime checks: `include('nfs-prototyping-utilities', ['prototype-spacers-count', ...own])` on every run; the handle named `nfsPrototype<Family>`.
14. Out of Scope, each with its category: the Sass-only helpers (`scope-boundary`); `foundation-prototype-typescale` (`other`); a keyed input for consumer-added `$prototype-sizing` names (`other`); detecting a missing Foundation prototype export mixin (`platform-or-a11y`); logical-direction spacing (`scope-boundary`); the classes the docs send to Flexbox, Visibility, and Typography (`scope-boundary`); the tooling and Runtime-check configuration (`scope-boundary`); runtime theming (`scope-boundary`).
15. Glossary terms: Utility family, Utility attribute, Prototyping Utilities.
16. An ADR for the Utility directive rule (proposed below), because it is hard to reverse (the public API of five families), surprising (neither one directive per class nor one per page, and inputs named after their selectors), and the result of a real trade-off.

### Triage

- The Utility directive rule and the family's public API: impact HIGH (later specs inherit it and it freezes a public API), confidence HIGH (ADR 0039 and ADR 0040 decide the class and typing rules; the shape follows from Angular's documented directive matching and binding collisions, the measured Foundation cascade, and the bundle's naming and composition rules; no default is bare, and none contradicts the research or an ADR). Decided.
- Overlap resolution and the spacing order copy: impact MEDIUM (a behaviour of the directives and one Library mixin rule, reversible), confidence HIGH (measured in three engines). Decided.
- Dropping the `$prototype-sizing` registry: impact MEDIUM (a registry of the tooling spec), confidence HIGH (Foundation documents extending `$prototype-sizes`, not this list; a keyed input stays additive). Decided.
- The WCAG checks and the arrow `@warn`: impact LOW, confidence HIGH (the Sticky, Close Button, Top Bar, and Forms precedents; the scroll-region facts measured). Decided.
- The Runtime-check handle name for multi-attribute directives: impact LOW, confidence HIGH. Decided, with the contract clarification proposed below.

Nothing is left OPEN FOR HUMAN. No prototype is needed: the open questions were cascade and platform facts, measured above.

### Placeholders in published specs

None: no published spec names a directive of this family under a placeholder. Related notes for the orchestrator and the [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md):

- [Spec: Sticky](28-spec-sticky.md), D19 and the `sticky--overflow-hidden-ancestor` story: the first overflow value can now be `nfsOverflow="hidden"`; `overflow: clip` stays inline (Foundation has no class for it). The Sticky re-run left this to the consistency review.
- [Spec: Anchored pane (shared utility)](55-spec-anchored-pane.md), Testing Decisions: the `position: relative` containing block can be `nfsPosition="relative"`; the `overflow: auto` scroller, the pane width, the trigger coordinates, and the tall body stay inline, since Foundation's default lists have no class for them and stories use Foundation's defaults.
- [Spec: Card](90-spec-card.md), D7's rejected alternative, "the Prototyping Utilities' text-wrap directive": it is `nfsTextWrap` of `NfsPrototypeTextUtilities`; the rejection stands.
- [Spec: XY Grid](99-spec-xy-grid.md), D3's rejected alternative says a `width` enum on `NfsGridContainer` could collide with the Prototyping Utilities' sizing input; the sizing attribute is `nfsWidth`, so it would not. D3 stands on its other reason (an invented name for two classes from no setting). Proposed replacement of that parenthesis: "(an invented name for two classes that come from no setting or loop)".
- [Spec: Pagination](87-spec-pagination.md)'s remark that a bare `nfsEllipsis` would read as a text-truncation utility agrees with the attribute `nfsTextTruncate`; no change.
- The [Spec: Visibility Classes](104-spec-visibility-classes.md) (`nfsVisibility` with un-prefixed `showFor` and `hideFor`; its D1 rejects `nfsShowFor`-style attributes) and the [Spec: Flexbox Utilities](103-spec-flexbox-utilities.md) (`nfsFlexContainer`, `nfsFlexAlign`, and `nfsFlexChild` with `direction`, `alignX`, `alignY`, `alignSelf`, and `order`; its D1 rejects one directive per class family) resolved in the same wave with other shapes. The scope clause (rule clause 0, spec D24) makes the three shapes one rule by kind of family, so no spec contradicts another and neither committed spec changes: Flexbox is the roles case, Visibility the one-effect case, and the Prototyping Utilities, Float Classes, and Typography Helpers the stand-alone case. The collision requirement the clause states holds for both: the only shared input name found is `hideFor`, the Responsive Toggle's Option, which the Visibility spec's second-owner check reports.
- The [Spec: Table](92-spec-table.md)'s **Scroll region** (its proposed glossary term) is the contract the overflow recipe reaches; the spec uses the term and says why `nfsTableScroll` binds `tabindex` and `role` while an overflow utility only checks (it owns an element that always scrolls; a utility sits on any element, other directives' included).

### What other specs need from this one

- The [Spec: Float Classes](105-spec-float-classes.md) and the [Spec: Typography Helpers](106-spec-typography-helpers.md) follow the Utility directive rule (spec section "The Utility directive rule", clauses 0 to 7): for example `NfsFloatClasses` with `nfsFloat` and `nfsClearfix`, and `NfsTextAlignment` with `nfsTextAlign` (the Pagination and Forms placeholder already has that name).
- The Storybook scaffolding of every spec may use these attributes wherever Foundation has a class (the Storybook conventions change below).
- The [Spec: Forms](98-spec-forms.md)'s 3:1 field boundary is protected by the `nfsBordered` and `nfsBorderNone` field check; no change there.

### Proposed shared-file changes (for the orchestrator)

1. `building-blocks.md`, Table D, the Prototyping Utilities row, replacing its empty cells:

   > | Prototyping Utilities | `docs/pages/prototyping-utilities.md` | [Spec: Prototyping Utilities](issues/102-spec-prototyping-utilities.md) | Eighteen directives, one per Foundation export mixin, set through 42 Utility attributes (the spec's Utility directive rule): `NfsPrototypeSpacing` (`nfsMargin`, `nfsMarginTop` to `nfsMarginVertical`, `nfsPadding` to `nfsPaddingVertical`; counts over `$prototype-spacers-count`), `NfsPrototypeSizing` (`nfsWidth`, `nfsHeight`, `nfsMaxWidth100`, `nfsMaxHeight100`), `NfsPrototypeDisplay` (`nfsDisplay`), `NfsPrototypeOverflow` (`nfsOverflow`, `nfsOverflowX`, `nfsOverflowY`), `NfsPrototypePosition` (`nfsPosition`, with `fixed-top` and `fixed-bottom`), `NfsPrototypeBorderBox`, `NfsPrototypeBorderNone`, `NfsPrototypeBordered`, `NfsPrototypeRounded` (`nfsRounded`, `nfsRadius`), `NfsPrototypeShadow`, `NfsPrototypeArrow` (`nfsArrow`), `NfsPrototypeSeparator` (`nfsSeparator`), `NfsPrototypeFontStyling`, `ul[nfsListStyleType]` and `ol[nfsListStyleType]` (`NfsPrototypeListUnordered`, `NfsPrototypeListOrdered`), `NfsPrototypeTextUtilities` (`nfsTextHide`, `nfsTextTruncate`, `nfsTextNowrap`, `nfsTextWrap`), `NfsPrototypeTextTransformation` (`nfsTextTransform`), `NfsPrototypeTextDecoration` (`nfsTextDecoration`); `nfsPrototypeClasses` lists all eighteen | Directives: Utility classes that stand alone, on consumer-written elements; Foundation generates nothing | Native platform (Foundation's CSS and media queries on the consumer's elements); Aria and CDK have nothing for layout helpers | Host `[class]` bindings over one `computed` class list per directive, with a pure per-side resolution of overlapping attributes; `nfsBreakpointsToken` for the Zero breakpoint and the breakpoint order; development checks in one `afterRenderEffect` (copied classes, an unreachable or unnamed scroll region, a fixed bar without `scroll-padding`, hidden text with nothing in its place, a border utility on a form field); the `strictVariantNames` and `strictVariantProperties` Runtime checks; `nfs-prototyping-utilities` (the responsive spacing rules again in breakpoint order, ten registry and sixteen flag Variant properties, a `@warn` on arrow contrast) | None; a scroll region the consumer names is a WAI-ARIA `region` |

2. `building-blocks.md` 1.3 Naming, a new bullet after the one on class names:

   > - Utility families (2026-09-28, [Spec: Prototyping Utilities](issues/102-spec-prototyping-utilities.md)): a family of Utility classes that stand alone gets one directive class per Foundation export mixin, `Nfs` + the PascalCase of the mixin without `foundation-` (`NfsPrototypeSpacing`, `NfsFloatClasses`, `NfsTextAlignment`), or one per element where the mixin qualifies its classes by element (`ul[nfsListStyleType]`, `ol[nfsListStyleType]`). Its inputs are Utility attributes (1.4) named `nfs` + the class template's stem (`nfsDisplay`, `nfsMarginTop`, `nfsOverflowX`), the CSS property where templates share or shorten a stem (`nfsTextTransform`, `nfsTextAlign`, `nfsListStyleType`), or, for a class without a value, the camelCase of the class (`nfsBordered`, `nfsClearfix`). Value aliases end in `Name`, `Count`, or the dimension (`NfsPrototypeDisplayName`, `NfsPrototypeSpacerCount`, `NfsPrototypeSeparatorAlign`) and attribute aliases in `Input`, or `Value` for a transformed read type, so no alias collides with a directive class. A family with roles (the Flexbox Utilities' flex parent and flex child) names each role's directive after its class, as above, and a family whose templates express one effect under `<words>-for-<bp>` names (the Visibility Classes) names its directive after the docs page and its inputs with Foundation's words (1.4); in every shape an un-prefixed input shares no name with another directive's input on the same element, or the spec reports the case.

3. `building-blocks.md` 1.4 Inputs and outputs, a new bullet after the Variant inputs bullet:

   > - Utility attributes (2026-09-28, [Spec: Prototyping Utilities](issues/102-spec-prototyping-utilities.md)): the inputs of a utility family's directive are named after their own attribute selectors, `nfs`-prefixed, so any of them creates the directive, an element gets one instance per family, and no utility captures another directive's input or a native attribute (`position`, `size`, `color`, `width`, `height`). They are typed and default as Variant inputs are; the responsive form is the same attribute: a bare value from the Zero breakpoint or a Breakpoint rules object for a valued attribute, `true` or a Breakpoint query with only the modifiers Foundation generates for a boolean. Where two templates of one family set the same property on one side (`.margin-2` and `.margin-top-1`; `.overflow-scroll` and `.overflow-x-hidden`), the directive resolves them: at each Class breakpoint the most specific attribute wins for each side, and no two bound classes set one side, because Foundation resolves them by source order (measured in three engines). Across families Foundation's cascade decides, and each spec names the pairs.

4. `building-blocks.md` 1.10 Accessibility baseline, a new bullet after the Label bullet:

   > - Prototyping Utilities ([Spec: Prototyping Utilities](issues/102-spec-prototyping-utilities.md)): a region that scrolls holds focusable content or carries `tabindex="0"`, `role="region"`, and a name (2.1.1, 4.1.2; measured: WebKit 26.6 leaves a plain scroller out of the tab order, and axe 4.13.0 reports it in three engines), and `NfsPrototypeOverflow` warns in development; a `fixed-top` or `fixed-bottom` bar needs `scroll-padding` of its height on the scrolling element (2.4.11), checked as Sticky's is; `nfsTextHide` warns when nothing visible replaces its text (2.4.7, 2.5.8); `nfsBordered` and `nfsBorderNone` warn on form fields, whose 3:1 boundary they undo (1.4.11); `nfs-prototyping-utilities` warns when `$prototype-arrow-color` is under 3:1 against `$body-background`; text that `nfsTextTruncate` or `nfsOverflow="hidden"` clips is available in full where it leads (1.4.10, 1.4.12).

5. `CONTEXT.md`, three terms. Under Foundation side, after **Utility class**:

   > **Utility family**:
   > The Utility classes one Foundation export mixin prints (`foundation-prototype-spacing`, `foundation-float-classes`), which one library directive sets through its Utility attributes.
   > _Avoid_: utility group, helper set, utility module
   >
   > **Prototyping Utilities**:
   > Foundation's opt-in Prototype mode: the Utility families of spacing, sizing, display, overflow, position, borders, corners, shadows, arrows, separators, font and list styles, and text helpers, printed only when the consumer includes them.
   > _Avoid_: prototype classes, helpers (bare), prototype mode (for the classes)

   Under Angular side, after **Variant input**:

   > **Utility attribute**:
   > An `nfs`-prefixed input of a Utility family's directive whose name is also one of that directive's attribute selectors (`nfsMarginTop="1"`, `nfsBordered`), written where Foundation's docs write the Utility class and typed like a Variant input.
   > _Avoid_: utility input, utility directive (for the attribute), helper attribute

6. A new ADR, `adr/00NN-utility-directive-rule.md` (the next free number, 0044 unless another ticket of the wave takes it):

   > ---
   > status: accepted
   > ---
   >
   > # Utility families: one directive per Foundation export mixin, set through Utility attributes
   >
   > [ADR 0039](0039-directives-manage-every-foundation-class.md) gives Foundation's utility families directives, and the Prototyping Utilities alone print 123 classes, 357 with their breakpoint flags on, none of which names an element of a component. We decided, in [Spec: Prototyping Utilities](../issues/102-spec-prototyping-utilities.md), that a family of Utility classes that stand alone becomes one attribute directive per Foundation export mixin (`foundation-prototype-spacing` is `NfsPrototypeSpacing`), whose inputs are Utility attributes: each input's public name is also one of the directive's attribute selectors, `nfs`-prefixed and named after the class it sets (`nfsMarginTop="1"` for `.margin-top-1`, `nfsBordered` for `.bordered`), typed like a Variant input ([ADR 0040](0040-variant-input-types.md)), with its responsive forms as a Breakpoint rules object or query on the same attribute. Within a family the directive resolves overlapping classes per side, so Foundation's source order never decides, and the family's Library mixin prints out-of-order responsive rules again in order. The export mixin is the unit a consumer includes, and its classes are the ones that overlap; the `nfs` prefix keeps a utility from capturing another directive's input (`position`, `size`, `color`) or a native attribute (`width`, `height`).
   >
   > ## Considered options
   >
   > - One directive for the whole page with plain inputs (`<div nfsPrototype margin="1" position="relative">`): rejected. `position` would also feed a Dropdown pane or Tooltip on the element, `width` would capture an image's attribute, and every instance would create every input of the page.
   > - One directive per class or per attribute: rejected. Dozens of imports, and overlapping attributes (`nfsMargin`, `nfsMarginTop`) could not see each other to resolve the overlap.
   > - Binding each attribute's class as written: rejected. Measured in three engines, Foundation's source order makes `margin-2 margin-top-1` a 2rem top margin and keeps `medium-margin-1` over `large-margin-0` at large widths.
   >
   > ## Consequences
   >
   > - The Float Classes and Typography Helpers specs follow this shape. Two families of the same wave take the other shapes the scope clause names: the Flexbox Utilities' roles (flex parent, flex child) keep building-blocks 1.4's Structural class shape, and the Visibility Classes, whose templates all decide whether an element shows, keep one directive with Foundation's `showFor` and `hideFor` words. In every shape an un-prefixed input shares no name with another directive's input on the same element, or its spec reports the case.
   > - Value and attribute aliases take suffixes (`Name`, `Count`, `Input`, `Value`), so they never collide with the directive classes.
   > - A Runtime-check handle of a directive that several attributes create is named after the directive class.

7. [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md):
   - Delete the settings-table row `| $prototype-sizing | NfsPrototypeSizingOverrides | --nfs-prototype-sizing | names | width height | none | Prototyping Utilities |`.
   - Under "Settings that are deliberately not registries", add: "- `$prototype-sizing`: its names are CSS properties, which become the attribute names `nfsWidth` and `nfsHeight`; a template cannot grow attributes from Sass, so names a consumer adds generate classes no attribute sets ([Spec: Prototyping Utilities](../issues/102-spec-prototyping-utilities.md), D10)."
   - In the package shape block, "Variant registries (26 empty interfaces)" becomes "Variant registries (25 empty interfaces)".
   - In "Known `mixins` today", replace "The grid, flexbox, Prototyping, and Button Group specs name theirs." with "`nfs-prototyping-utilities` writes the ten `$prototype-*` registry properties, and one flag property per `$prototype-*-breakpoints` flag outside the manifest ([Spec: Prototyping Utilities](../issues/102-spec-prototyping-utilities.md)). The grid, flexbox, and Button Group specs name theirs."
8. [Spec: Breakpoint service (shared utility)](53-spec-breakpoint-service.md), the `nfsVariantCheck()` contract, replacing "- `directive` is the selector name a consumer writes (`nfsButton`); every report names it." with: "- `directive` is the selector name a consumer writes (`nfsButton`); every report names it. A utility directive that any of several Utility attributes creates passes the camelCase of its class (`nfsPrototypeSpacing`), and each `value()` names the attribute as its input ([Spec: Prototyping Utilities](../issues/102-spec-prototyping-utilities.md))."
9. `storybook-conventions.md`:
   - Section 5, `preview.scss`, a Library mixin line beside the others: "`@include nfs-prototyping-utilities; // Prototyping Utilities: responsive spacing in breakpoint order and the Variant properties; every prototyping-utilities--* story and every story whose scaffolding uses a Utility attribute`".
   - Section 5, `_settings-overrides.scss`, a block after the accessibility overrides: "`// Feature switches, not accessibility overrides. Prototyping Utilities: prototyping-utilities--responsive. $global-prototype-breakpoints does nothing here: the settings file assigned each flag from it.` then `$prototype-spacing-breakpoints: true;`, `$prototype-sizing-breakpoints: true;`, `$prototype-display-breakpoints: true;`, `$prototype-bordered-breakpoints: true;`".
   - Section 8, in the scaffolding bullet, replace "and the Prototype utilities compiled by `foundation-everything($prototype: true)`: spacing (`.margin-*`, `.padding-*`, 0 to 3 with directions), display, overflow, sizing, list style (`.no-bullet`, `.list-disc`), and the text utilities. Prototype classes go on scaffolding only," with "and the Prototyping Utilities' attributes (`nfsMargin*`, `nfsPadding*`, `nfsDisplay`, `nfsOverflow*`, `nfsWidth`, `nfsHeight`, `nfsListStyleType`, and the text utilities, from `ngx-foundation-sites/prototyping-utilities`; `nfsPrototypeClasses` imports them all), compiled by `foundation-everything($prototype: true)`; `.no-bullet` belongs to the Typography Helpers. They go on scaffolding only,".
   - Section 11, the checklist line "Demo scaffolding uses Foundation classes and Prototype utilities only until their directives are specified, then those directives (section 8); ..." becomes "Demo scaffolding uses the directives of the CSS-only components and utility families, the Prototyping Utilities' attributes among them (section 8); inline styles only for `--nfs-*` properties and values Foundation has no class for."
10. `map.md`, Decisions so far, one line:

   > - [Spec: Prototyping Utilities](issues/102-spec-prototyping-utilities.md) -- eighteen directives, one per Foundation export mixin, set all 357 Prototype classes through 42 `nfs`-prefixed Utility attributes named after their selectors (`nfsMarginTop="1"`, `nfsBordered`, `ol nfsListStyleType="lower-roman"`), typed by ADR 0040 with rules objects and queries for the responsive forms; the directive resolves overlaps within a family per side (measured: Foundation's source order makes `margin-2 margin-top-1` a 2rem top margin), and `nfs-prototyping-utilities` reprints responsive spacing in breakpoint order (measured: `medium-margin-1 large-margin-0` keeps 16 px), writes the Variant properties, and warns on arrow contrast; development checks for unreachable scroll regions, fixed bars without `scroll-padding`, hidden text with nothing in its place, and border utilities on form fields; the Utility directive rule is the shape the Float Classes and Typography Helpers specs follow (ADR proposed); impact HIGH, confidence HIGH. Spec: [specs/prototyping-utilities.md](specs/prototyping-utilities.md).

### Gist for Decisions so far

Eighteen export-mixin directives set all 357 Prototype classes through 42 `nfs`-prefixed, selector-named Utility attributes typed by ADR 0040, resolve overlaps per side, and reprint responsive spacing in breakpoint order; the Utility directive rule is the precedent for Float Classes and Typography Helpers.

### Note, 2026-09-29 (architecture audit)

- 2026-09-29: the fixer items of [Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md) are applied to the spec.

### Amendment, 2026-09-29 (consistency review)

From [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md), phase 2, group d, applying the coordinator's decisions in [research/consistency-review-decisions.md](../research/consistency-review-decisions.md) and the forgotten-import checks spec's rules for family checks; `specs/prototyping-utilities.md` was revised in place. The reviewer's record is [research/consistency-review-group-d.md](../research/consistency-review-group-d.md).

- R32/R64: the rendered image-replacement `img` shows no `src`; the usage example's hero image takes `priority` (building-blocks 1.2 image rule 2: the likely largest contentful paint).
- R59: `include()` names no `prototype-<flag>-breakpoints` flag property; the injection bullet names the handle with its argument (`nfsVariantCheck('nfsPrototypeSpacing')`, the directive class's camelCase).
- R4: Sass rule (c) gains the canonical helper sentence (S1).
- ADR 0046 (no import arrays): the story line no longer says each story imports `nfsPrototypeClasses`, the array D2 rejects; each story lists the directives of the families it uses in `moduleMetadata.imports`.
- CR-C: D4's "published placeholders" becomes a statement citing the Typography Helpers and Visibility Classes specs; the story line's pointer to a change this ticket's Answer proposed points at storybook-conventions section 5, which carries it.
- Left open, not touched: T9 of [Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md) (one Library mixin for seventeen export mixins), OPEN FOR HUMAN since that audit.
- Unchanged, confirmed: R39, R41/R42, R43, CR-A, CR-D (the usage component).

### Amendment, 2026-09-29 (audit 0008)

- M1, [Audit 0008: the class-rule wave](../audits/0008-class-rule-wave.md): the Sass subsection states that the Library mixin question, T9 of [Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md), is OPEN FOR HUMAN, and applies the one mixin until the user rules.

### Amendment, 2026-09-29 (exportAs on every directive)

- [Decide: an exportAs on every directive](156-decide-exportas-on-every-directive.md): all eighteen directives (`NfsPrototypeSpacing`, `NfsPrototypeSizing`, `NfsPrototypeDisplay`, `NfsPrototypeOverflow`, `NfsPrototypePosition`, `NfsPrototypeBorderBox`, `NfsPrototypeBorderNone`, `NfsPrototypeBordered`, `NfsPrototypeRounded`, `NfsPrototypeShadow`, `NfsPrototypeArrow`, `NfsPrototypeSeparator`, `NfsPrototypeFontStyling`, `NfsPrototypeListUnordered`, `NfsPrototypeListOrdered`, `NfsPrototypeTextUtilities`, `NfsPrototypeTextTransformation`, `NfsPrototypeTextDecoration`) gain an `exportAs` for the first time, each its class name with a lowercase first letter; D20's rejected `exportAs` alternative is now the decision.

### Amendment, 2026-09-29 (checks move to a later milestone)

From [Re-run: specs without checks, group d](168-rerun-specs-without-checks-group-d.md), under [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md); `specs/prototyping-utilities.md` was revised in place and describes a library with no checks. What left the spec, per check (each check's full text stays in [research/checks-extraction-d.md](../research/checks-extraction-d.md) for the later milestone's specs):

- Forgotten-import checks: the In-family line of the eighteen directives and the Entry point bullet's clause on the forgotten-import checks. An "Imports (documented usage)" bullet says what a directive left out of the imports does (a static attribute sets no class, a bound one fails with NG8002, an `exportAs` reference with NG8003); the no-import-array ruling of ADR 0046 stands; user story 4 is rewritten in place.
- Misuse warnings: development checks 1 (copied classes), 2 (an unreachable or unnamed scroll region), 3 (a fixed bar with no reserved `scroll-padding`), 4 (hidden text with nothing visible in its place), and 5 (a border utility on a form field), their messages, the render callback, the `ElementRef` and `HostAttributeToken('class')` injections, and the browser-level "Development checks" bullet. They are now rules 1 to 5 of the API's Documented usage, stated in the attributes' JSDoc; user stories 24 and 26 to 30, D11, and D13 to D16 are rewritten in place, the WCAG rows 2.1.1, 4.1.2, 2.4.11, 2.4.7 and 2.5.8, and 1.4.11 cite the rules, and D7, D9, D15, and D18 lose rejected check alternatives.
- Runtime checks: every directive's `nfsVariantCheck` handle and its `include` and `value` calls, the `strictBreakpointSync` sentence of Overlap resolution, the browser-level Runtime check bullet, the Out of Scope item on detecting Foundation's export mixins, the pointer to the Runtime checks' configuration, and D19's reporting design. The rule is Documented usage rule 6 (compiled names, the family's flag, the includes); user stories 20 and 25 and D19 are rewritten in place. The sixteen flag properties `--nfs-prototype-<flag>-breakpoints`, which only the Runtime checks read and which the Variant manifest never listed, go with them: the mapping table's last column keeps only the registry properties, and the Sass items 2, 5, and 6 and the Sass compile cases drop them.
- Build-time checks: the `nfs-prototyping-utilities` `@warn` for `$prototype-arrow-color` under 3:1 (rule (c), D17) and its Sass compile case. It is now a required setting for an arrow that shows a menu's presence, in the Sass subsection and the 1.4.11 row; user story 31 and D17 are rewritten in place.
- The Utility directive rule: clause 0's collision case and clause 7 (Ownership) now speak of documented usage, so the Float Classes and Typography Helpers specs that follow the rule inherit no check; D24 likewise.
- Kept: the eighteen directives, the 42 Utility attributes and their types, overlap resolution, the spacing copy (rule (a)) and the ten registry properties, every story and its axe gate, the host-binding, resolution, list, composition, breakpoint-order, and zoneless browser-level cases, the SSR smoke, the pure resolution test, the remaining Sass compile cases, and the e2e layer. The T9 note on one Library mixin per export mixin stays OPEN FOR HUMAN as ticket 158 rules. Decision numbers are unchanged.
- No API, class, ARIA, keyboard, or rendering change. Impact LOW, confidence HIGH (a user ruling applied); nothing OPEN FOR HUMAN.

### Amendment, 2026-09-30 (the Library mixin)

- [Decide: the Prototyping Utilities' Library mixin](173-decide-prototyping-utilities-library-mixin.md), the user's ruling on T9 of [Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md): the page's one Library mixin is renamed `nfs-prototype-classes`, after Foundation's umbrella export mixin `foundation-prototype-classes`, and is included after it; its content is unchanged (the responsive spacing rules and the ten registry Variant properties). The name used above in this ticket is the old one, kept as history.
- `specs/prototyping-utilities.md`: every mention of the mixin renamed; the Sass subsection states the ruling in place of the OPEN FOR HUMAN sentence audit 0008 added, including the accepted cost (a consumer who compiles some families still gets every family's Variant properties) and the later milestone's per-export mixins; D25 records the ruling.
- No directive, attribute, class, ARIA, or story change. Impact LOW, confidence HIGH (a user ruling applied); nothing OPEN FOR HUMAN.

### Amendment, 2026-09-30 (later-milestone families)

From [Re-run: grid, typography, and utility specs for the later milestone](175-rerun-grid-typography-utility-specs-later-milestone.md), under [Decide: grids, typography, and utilities move to a later milestone](174-decide-grids-typography-utilities-later-milestone.md): `specs/prototyping-utilities.md` is marked as a later-milestone spec; its design is unchanged.

- A `Milestone: later` line under the Ticket line, and a closing Problem Statement paragraph: the spec is planned and implemented in a later milestone of the implementing repository, because the user ruled on 2026-09-30 that the grids, Typography Helpers, and the Utilities leave the first milestone to make it simpler and more minimal, each a whole and separate spec; until then a consumer, and the library's own stories, write Foundation's Prototyping Utilities classes as normal classes with Foundation's global styles loaded, and no first-milestone spec assumes the spec, names its directives, or links to it.
- Restated: nothing; the spec made no claim that a first-milestone spec, story, or example depends on it.
- Added: Further Notes, What the later milestone changes, per spec: per first-milestone spec, the Prototyping Utilities classes it writes in the first milestone and the directives that replace them, read from the directives each spec wrote before the ruling.
- No directive, input, class, ARIA row, story, or test changes. Impact LOW, confidence HIGH (a user ruling applied); nothing OPEN FOR HUMAN.
