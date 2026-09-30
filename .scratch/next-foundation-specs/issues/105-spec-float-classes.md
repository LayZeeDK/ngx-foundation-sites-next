# 105. Spec: Float Classes

Type: grilling
Status: resolved
Blocked by: 81
Labels: wayfinder:grilling
Map: ../map.md

## Question

What Angular directives (preferred) or components give Foundation for Sites 6.9's Float Classes to the next, from-scratch ngx-foundation-sites repo, under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Foundation's docs page is `docs/pages/float-classes.md` and its Sass is `scss/components/_float.scss` in the 6.9.0 clone. Publish `specs/float-classes.md`.

Known from the triage: Float left and right, clearfix, and centring.

## How to work it

Run `/grill-with-docs` (self-grilling, both sides) over the questions this component raises, then publish with `/to-spec` in the map's spec shape; the [Spec: Button](37-spec-button.md) is the nearest precedent. Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this component); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Cover: one directive per Structural class and what else each owns (the ARIA, `type` default, or development and compile-time checks the documented markup lacks for WCAG 2.2 AA, ADR 0022); every Variant as a typed input by the decision above; State classes as host bindings; the Sass mixin only where custom CSS or checks are needed (ADR 0012); the rendering-mode contract; stories with play functions and axe; e2e only where Storybook cannot reach. Record the decisions in this ticket's Answer, and propose shared-file changes (a building-blocks row, glossary terms) for the orchestrator. Model: Opus 5.5.

## Answer

Resolved 2026-09-28 (Opus 5.5, AFK: both sides of the grilling played against the sources). Spec: [specs/float-classes.md](../specs/float-classes.md).

Sources read: Foundation 6.9.0's `docs/pages/float-classes.md`, `scss/components/_float.scss`, the `clearfix` mixin in `scss/util/_mixins.scss`, and `foundation-everything` in `scss/foundation.scss`; Foundation's Forms page (label positioning); ADR 0001, 0012, 0022, 0039, 0040; building-blocks 1.1 to 1.14 and Table D as amended; `CONTEXT.md`; the map's Notes; `research/out-of-scope-triage.md` (section 4, the utility families, overruled by the user in ADR 0039), `research/foundation-component-catalogue.md` (its Float Classes row), `research/out-of-scope-exclusions.md` (no row names this family; AP3 and DP4 are the Anchored pane's and Dropdown's legacy `.float-*` reading, decided there); the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md); the [Spec: Prototyping Utilities](102-spec-prototyping-utilities.md) (the Utility directive rule, clauses 0 to 7) and its Answer; the [Spec: Flexbox Utilities](103-spec-flexbox-utilities.md), [Spec: Visibility Classes](104-spec-visibility-classes.md), [Spec: Media Object](91-spec-media-object.md) (D3, the `align` measurement), [Spec: Responsive Embed](96-spec-responsive-embed.md) (its note for this spec), [Spec: Forms](98-spec-forms.md), [Spec: Dropdown](26-spec-dropdown.md), and [Spec: Anchored pane (shared utility)](55-spec-anchored-pane.md); [Decide: inputs named like HTML presentational attributes](139-decide-inputs-named-like-presentational-attributes.md).

Measurements (Dart Sass 1.104.1 over the Foundation 6.9.0 clone, `foundation-everything($prototype: true)` on Foundation's settings; Playwright 1.63.0 with Chromium 153, Firefox 155, and WebKit 26.6; axe-core 4.13.0; scripts `measure.mjs` and `tab.mjs` under `D:/tmp/nfs-wave-105/`, not committed). Identical in the three engines unless noted:

- The docs example (`.callout.clearfix` with a `.float-left` and a `.float-right` button): floats `left` and `right`; the callout contains them; without `.clearfix` it is 34 px tall and does not.
- `.float-center` in a 600 px container: a 200 px box has 200 px on each side; a `width: 50%` box 150 px on each side (the docs say percentages do not work); an `auto`-width box 0 and 0. With `.display-inline-block` the box is `inline-block` and sits at the start; with `.margin-horizontal-1` its margins are 16 px and it sits at the start. With the `hidden` attribute its computed `display` is `block` (normalize's `[hidden]` comes first in the compiled CSS).
- `dir="rtl"`: `.float-left` stays at the left edge.
- Order: two `.float-right` elements are drawn with the second left of the first; `.float-right` Next then `.float-left` Previous draws Previous left of Next; in `dir="rtl"` two `.float-left` elements draw the second right of the first. Real Tab through two right-floated buttons written Save, Cancel: Save (x 536) then Cancel (x 461); through one right-floated group holding Cancel, Save: Cancel (456) then Save (536). WebKit's default settings leave links out of the tab order, so the stories use buttons.
- `.clearfix` on `.flex-container.align-justify` (600 px, two 100 px children): the second child ends 267 px short of the right edge (0 px without the clearfix); its `::after` computes `display: table`, `order: 1`.
- `.float-right` on a flex item stays at x 0; its computed `float` is `right` in Chromium and Firefox and `none` in WebKit. `.float-left` with `.position-absolute` computes `float: none`.
- HTML presentational attributes (for the names this spec avoids): `img align="right"` computes `float: right`; `br clear="all"` computes `clear: both`; a 200 px `table align="center"` sits 400 px from the left of a 1000 px viewport (automatic margins).
- Accessible names, Chromium CDP full accessibility tree: `<button class="clearfix">Save</button>` is named " Save "; a link holding two floated spans with the clearfix " Read more ".
- axe (six tags) over the measurement page: no violation other than `page-has-heading-one` (the page has no `h1`).

### Grilling record

Round 1 (the frontier once ADR 0039, ADR 0040, and the Utility directive rule are taken as decided):

1. Directive or component? Directive: Foundation generates nothing, and every class sits on an element the consumer writes (ADR 0001).
2. Which of the rule's three shapes (clause 0)? Stand-alone. A float needs no clearfix parent, a clearfix contains floats of any origin, and `.float-center` needs neither; no class modifies an element another class of the family gives a role (so not the Flexbox Utilities' roles shape); and the templates do not express one effect under `<words>-for-<bp>` names (so not the Visibility Classes' shape). The rule's clause 0 already lists "Foundation's float classes and `.clearfix`" under this shape, and nothing measured contradicts it.
3. Unit (clause 1)? One directive class for `foundation-float-classes`, `NfsFloatClasses`, the rule's own example. Two classes (`NfsFloat`, `NfsClearfix`) were weighed: they would split one export mixin and put two instances on a floated container that is also a clearfix. Rejected.
4. Names (clause 3)? `nfsFloat` for `.float-<v>`; `.float-center` fits the template, so it is `nfsFloat="center"` although it sets no `float`; `nfsClearfix` for `.clearfix`. A separate `nfsFloatCenter` or `nfsCenter` would allow `nfsFloat="left" nfsFloatCenter`, which Foundation's CSS resolves by dropping the centring (a float ignores automatic margins); one attribute makes the combination impossible.
5. Values (clause 4)? `nfsFloat` a closed union `'left' | 'right' | 'center'` (the export mixin writes the three classes itself; no setting, no registry); `nfsClearfix` a typed boolean through `nfsVariantBoolean`. No responsive form: Foundation has none.

Round 2 (hangs on 3 to 5):

6. Class list or class record (clause 5)? With four classes a record that strips copies would be cheap, and building-blocks 1.4 strips copies of a component's own classes. But clause 5 says "one computed class list", every utility family of the wave reports copies rather than strips them, and a record's `false` entries would outrank another binding of the same class (the Visibility Classes' D8). Decided: the list, applied as written; copies reported in development.
7. Overlap (clause 6)? None within the family: the placements share one attribute, and `.clearfix` styles only pseudo-elements. Across families, measured: `nfsDisplay` and horizontal spacing (`!important`) cancel the centring; an absolutely positioned element does not float; `nfsFloat`'s `!important` overrides a component's own float. Documented, not resolved (clause 6).
8. Library mixin? None: no Open family, no flag, no order to fix, no compile-time check (ADR 0012, dated note). No Variant property, so no Runtime check call.

Round 3 (WCAG 2.2 AA and correctness, hangs on the class list):

9. Reading order (1.3.2, 2.4.3): measured reversal for floats toward the end side. Document, check by geometry, or check by computed style? Decided: a development check by computed `float` and `direction` on the host and its previous element sibling, limited to pairs where either holds focusable content (the Flexbox Utilities' precedent), with the recipe of one floated group in reading order. Geometry was rejected because wrapping at narrow widths changes the answer; the computed direction was chosen over `Directionality`, because CSS direction decides where a float goes.
10. Floats that do nothing: a float on a flex or grid item, and a clearfix on a flex or grid container, whose pseudo-elements shift `justify-content` (measured). Decided: a development check each; `nfsFloat="center"` is not reported on a flex item, where automatic margins still centre. The float check reads the parent's `display`, because WebKit reports `float: none` on a flex item while Chromium and Firefox report `right`.
11. `.float-center`'s width condition, and the `hidden` attribute: documented; a width check depends on the viewport at first render (the Prototyping Utilities' D18), and the `hidden` case is the Flexbox Utilities' and XY Grid's documented rule.
12. The docs' markup: anchors without `href` become buttons (building-blocks 1.10), and the image gets an `alt`. The clearfix's `content: ' '` enters accnames as whitespace (measured in Chromium); the label stays contained (2.5.3), so no check, and the spec says a clearfix belongs on a container.

Round 4 (names against HTML presentational attributes, the brief's rule until the decision ticket rules):

13. Is any name an HTML presentational attribute of its hosts? `nfsFloat` and `nfsClearfix` render as `nfsfloat` and `nfsclearfix`, which are no HTML attributes. Rejected for that reason: `align` and `clear` (below).

Round 5 (rendering, tests):

14. Rendering modes: one host binding on signal state, the same on server and client; no token, listener, or timer.
15. Tests: six stories; e2e for real Tab order in three engines, reflow, text spacing, and the fixture app. No pure-logic or Sass test: the class list is a two-input lookup, and there is no library Sass.

The frontier is empty: no question is left open.

### Decisions

1. Shape: the Float Classes take the stand-alone shape of the Utility directive rule (clause 0), because each class styles whatever element carries it: floats need no clearfix parent, a clearfix contains floats of any origin, `.float-center` needs neither, no class modifies a role another gives, and the templates express three different effects, none under `<words>-for-<bp>` names. Spec D2.
2. One standalone attribute directive, `NfsFloatClasses`, selector `[nfsFloat], [nfsClearfix]`, in the entry point `ngx-foundation-sites/float-classes`, which exports it and `NfsFloatName`. No `exportAs`, Defaults token, providers, host directives, role, name, state, or listener. Spec D1, D3.
3. `nfsFloat`: `InputSignal<NfsFloatName | undefined>`, `NfsFloatName = 'left' | 'right' | 'center'` (closed, no registry); `'left'`, `'right'`, and `'center'` set `.float-left`, `.float-right`, and `.float-center`; no value sets none; a bare `nfsFloat`, a misspelt name, and `nfsFloat="float-left"` fail to compile. Spec D4.
4. `nfsClearfix`: `InputSignalWithTransform<boolean, NfsVariantBoolean>` through `nfsVariantBoolean`, default `false`; `true` sets `.clearfix`. Spec D5.
5. No responsive form and no `nfsBreakpointsToken`: Foundation generates no responsive float class. Spec D6.
6. One computed class list; copied Foundation classes are reported in development, not stripped (clause 5 as written). Spec D7.
7. Development checks, in one `afterRenderEffect` read phase created only when `ngDevMode` is on, each once per instance: (1) copied `float-left`, `float-right`, `float-center`, or `clearfix`, naming the attribute; (2) a left or right float whose previous element sibling floats toward the end of the parent's computed `direction`, when either is or holds focusable content (1.3.2, 2.4.3); (3) a left or right float on a flex or grid item, and a clearfix on a flex or grid container. Spec D8, D9.
8. Documented requirements, not checks: floated content in reading order, with the recipe of one floated group; `nfsFloat="center"` needs a width narrower than its container (a percentage works, `auto` does not, correcting Foundation's docs); the `hidden` attribute does not hide an `nfsFloat="center"` element; the classes are physical in right-to-left pages; no fixed-width float wider than its container (1.4.10); a clearfix container has no fixed height (1.4.12).
9. No Library mixin, Variant property, or Runtime check call. Spec D10.
10. Across families, Foundation's cascade decides, named in the spec's Notes: `nfsDisplay` and horizontal spacing attributes cancel `nfsFloat="center"`; `nfsPosition` absolute or fixed cancels a float; `nfsFloat` overrides a component's own float on the same element; `nfsTextAlign` is independent; a Responsive Embed beside a float keeps its container's ratio (the Responsive Embed ticket's measurement); a float on a Dropdown or Tooltip Trigger moves only the Trigger. Spec D12.
11. Names avoid HTML presentational attributes (see below). Spec D11.
12. Six stories (`float-classes--float-left-right`, `--float-center`, `--clearfix`, `--reading-order`, `--rtl`, `--composition`), `title: 'Utilities/Float Classes'`; browser-level tests of every value and check; an SSR smoke; e2e for real Tab order in three engines, reflow and text spacing at 320 px, and the fixture app's first paint and hydration. Spec D13.
13. Out of Scope, each with its category: responsive float classes (`scope-boundary`); logical floats (`scope-boundary`); the `clearfix` Sass mixin (`scope-boundary`); hiding a centred element with `hidden` (`scope-boundary`); a width check for `nfsFloat="center"` (`other`); detecting a missing `foundation-float-classes` include (`platform-or-a11y`); runtime theming (`scope-boundary`). Every rejected Design-decisions row carries a reason and a category.
14. Glossary term **Clearfix** (proposed below). No ADR: every decision applies the Utility directive rule and ADR 0040; none is hard to reverse on its own beyond the public names the rule already derives.

Names considered and rejected because they are HTML presentational attributes of the hosts (the brief's rule until [Decide: inputs named like HTML presentational attributes](139-decide-inputs-named-like-presentational-attributes.md) rules; its audit can list this spec's two names, `nfsFloat` and `nfsClearfix`, as rendered `nfsfloat` and `nfsclearfix`, which no engine styles):

- `align`, for the placements: HTML maps `align="left"` and `align="right"` on `img`, `iframe`, `embed`, `object`, `input type="image"`, and `table` to `float`, `align="center"` on `table` to automatic side margins, and `align` on `div`, `p`, and headings to `text-align`. Measured here: `img align="right"` computes `float: right` and `table align="center"` is centred in three engines; the Media Object ticket measured the `text-align` effect.
- `clear`, for the clearfix: HTML maps `br clear` to the `clear` property; measured here: `br clear="all"` computes `clear: both` in three engines.

Names rejected for other reasons: `float` without the prefix (clause 3: every Utility attribute starts with `nfs`, so none captures another directive's input); `nfsFloatCenter` and `nfsCenter` (clause 3: a class that fits a template is its value, and a second attribute would allow a float and a centring together); `nfsClear` (not the class's name, and it reads as the CSS `clear` property, which `.clearfix` does not set on its host); `nfsAlign` (the family's stem is `float`, and "align" is the Typography Helpers' and Flexbox Utilities' word).

### Triage

- The family's public API (`NfsFloatClasses`, `nfsFloat`, `nfsClearfix`, `NfsFloatName`, the entry point): impact HIGH (public names), confidence HIGH (derived mechanically from the committed Utility directive rule, whose clause 1 names `NfsFloatClasses` and whose D4 names `nfsFloat` and `nfsClearfix`, and typed by ADR 0040; no bare default; nothing contradicts the research or an ADR). Decided.
- The class list over a record: impact LOW (a binding detail, reversible), confidence HIGH (clause 5 as written; the other utility families). Decided.
- The development checks: impact LOW, confidence HIGH (measured in three engines; the Flexbox Utilities' and Media Object's precedents). Decided.
- No Library mixin: impact LOW, confidence HIGH (ADR 0012, dated note). Decided.

Nothing is left OPEN FOR HUMAN. No prototype is needed: the open questions were cascade, layout, and platform facts, measured above.

### Placeholders in published specs

None: `specs/` names no directive of this family under a placeholder. The final names are the ones the [Spec: Prototyping Utilities](102-spec-prototyping-utilities.md) already uses as examples (clause 1 `NfsFloatClasses`; clause 3 and D4 `nfsFloat` and `nfsClearfix`), so nothing there changes. Related mentions, all consistent with this spec and needing no edit:

- [Spec: Forms](98-spec-forms.md) (Label Positioning's `.float-right` and `.float-left`, set by the Float Classes directives; D15 rejects `float` inputs on `NfsFormLabel`): met by `nfsFloat` beside `nfsFormLabel`, as the spec's Rendered HTML shows; its examples use only `nfsTextAlign`, so no placeholder to replace.
- [Spec: Dropdown](26-spec-dropdown.md) (`.float-left`, `.float-right` on the Trigger are not read) and [Spec: Anchored pane (shared utility)](55-spec-anchored-pane.md) (D22): unchanged; `nfsFloat` beside a Trigger moves only the Trigger.
- [Spec: Responsive Embed](96-spec-responsive-embed.md) ("the Spec: Float Classes can note it"): noted in this spec's Notes.

No placeholder usage shows a need this API does not meet.

### What other specs need from this one

- The [Spec: Typography Helpers](106-spec-typography-helpers.md): Foundation's Forms page offers `.text-right` or `.float-right` to right-align a label; this spec treats `nfsTextAlign` as independent of `nfsFloat` (text alignment against float), and names it only by the Utility directive rule's name.
- The [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): Storybook scaffolding that floats or clears uses `nfsFloat` and `nfsClearfix` (the storybook-conventions change below).
- The [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md): seven Out of Scope items with categories, listed in Decision 13.

### Proposed shared-file changes (for the orchestrator)

1. `building-blocks.md`, Table D, the Float Classes row, replacing its empty cells:

   > | Float Classes | `docs/pages/float-classes.md` | [Spec: Float Classes](issues/105-spec-float-classes.md) | `[nfsFloat], [nfsClearfix]` (`NfsFloatClasses`, one directive for `foundation-float-classes`, set through two Utility attributes: `nfsFloat` with the closed `'left' \| 'right' \| 'center'` for `.float-left`, `.float-right`, and `.float-center`, and the boolean `nfsClearfix` for `.clearfix`); no responsive form | Directive: Utility classes that stand alone (the Utility directive rule's stand-alone shape), on consumer-written elements; Foundation generates nothing | Native platform (CSS floats, automatic margins, and Foundation's clearfix on the consumer's elements); Aria and CDK have nothing for layout helpers | One host `[class]` binding over one `computed` class list; `nfsVariantBoolean`; development checks in one `afterRenderEffect` (copied classes, a float after a sibling floated toward the end of the reading direction when either holds focusable content, a float on a flex or grid item, a clearfix on a flex or grid container); no Runtime check call and no Library mixin | None; floated content keeps the reading order in the DOM |

2. `building-blocks.md` 1.10 Accessibility baseline, a new bullet after the Prototyping Utilities bullet:

   > - Float Classes ([Spec: Float Classes](issues/105-spec-float-classes.md)): a float toward the end of the reading direction reverses the order of the floats it shares a line with (measured in three engines: two right-floated buttons written Save, Cancel are drawn Cancel, Save and reached by Tab right to left), so floated content is written in reading order and a group of controls at the end of a line is one floated element holding them in that order (1.3.2, 2.4.3); `NfsFloatClasses` warns in development when a float follows a sibling floated toward the end side of the parent's computed `direction` and either holds focusable content.

3. `CONTEXT.md`, Foundation side, after **Utility family**:

   > **Clearfix**:
   > Foundation's `clearfix` mixin and the `.clearfix` class it prints: two table-display pseudo-elements that make an element contain its floated children; the element itself neither floats nor clears, and on a flex or grid container the pseudo-elements become items.
   > _Avoid_: clear, clear-both, float container

4. `storybook-conventions.md` section 8, in the scaffolding bullet, replace "float and flex classes," with "the Float Classes' `nfsFloat` and `nfsClearfix` (from `ngx-foundation-sites/float-classes`), flex classes,".

5. `map.md`, Decisions so far, one line:

   > - [Spec: Float Classes](issues/105-spec-float-classes.md) -- one directive, `NfsFloatClasses`, in the Utility directive rule's stand-alone shape, sets Foundation's four float classes through two Utility attributes: `nfsFloat` (closed `'left' | 'right' | 'center'`, so a float and a centring cannot meet on one element) and the typed boolean `nfsClearfix`; one class list, no responsive form, no Library mixin; development checks for a float after a sibling floated toward the end of the reading direction when either holds focusable content (measured: two right-floated buttons are reached by Tab right to left in three engines), a float on a flex or grid item, and a clearfix on a flex or grid container (measured: 267 px lost from a `space-between` row); names avoid the presentational `align` and `clear`; impact HIGH, confidence HIGH. Spec: [specs/float-classes.md](specs/float-classes.md).

### Gist for Decisions so far

One stand-alone Utility directive, `NfsFloatClasses`, sets `.float-left`, `.float-right`, `.float-center`, and `.clearfix` through `nfsFloat` (closed `left | right | center`) and `nfsClearfix`, with development checks for reversed float order, floats on flex or grid items, and a clearfix on a flex or grid container.

### Amendment, 2026-09-29 (consistency review)

From [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md), phase 2, group c, under the decisions of phase 1 ([research/consistency-review-decisions.md](../research/consistency-review-decisions.md)); the review's record for this spec is [research/consistency-review-group-c.md](../research/consistency-review-group-c.md). `specs/float-classes.md` was revised in place. Items applied: R16, R32/R64, R36, CR-B. Changed:

- Out of Scope, the `hidden` bullet, takes R16's shared sentence: `.float-center` sets `display: block` after normalize's `[hidden]`, so the element is removed with `@if` or hidden with a Toggler in Visibility mode (`.is-hidden`) or `nfsVisibility` with a bare `hideFor`, and the Thumbnail, Flexbox Utilities, XY Grid, and Flex Grid specs state the same rule; `.float-left`, `.float-right`, and `.clearfix` set no `display` on their host, so `hidden` hides such an element.
- Rendered HTML: the Float Center image's server line drops `src` (the `NgOptimizedImage` output rule of building-blocks 1.2); the percentage-width box is written `nfsWidth="50"`, the Prototyping Utilities' attribute for Foundation's `.width-50`, in place of an inline width, and renders `class="float-center width-50"`; the lead-in names `nfsWidth`.
- Stories: `float-classes--float-center` takes `nfsWidth="50"` (`NfsPrototypeSizing` in its `moduleMetadata.imports`), because storybook-conventions section 8 keeps inline styles for values Foundation has no class for; the scaffolding sentence lists `NfsPrototypeSizing` and `NfsPrototypeSpacing`.
- CSS class mapping gains a table of the other families' classes the examples, stories, and Foundation's page use (Callout, Button, XY Grid, the Forms' `.middle`, Prototyping Utilities), each with its directive and owning spec.

Unchanged: the API, the two attributes' types and defaults, the development checks, ARIA, the WCAG rows, the rendering modes, and the Story ids. Confirmed: R39 (placements), CR-A, CR-C (no placeholder), CR-D (the `app-order-header` imports). Impact LOW, confidence HIGH; nothing OPEN FOR HUMAN.

### Amendment, 2026-09-29 (exportAs on every directive)

From [Decide: an exportAs on every directive](156-decide-exportas-on-every-directive.md): `specs/float-classes.md`'s `NfsFloatClasses` gains `exportAs: 'nfsFloatClasses'` (the API line).

### Amendment, 2026-09-29 (checks move to a later milestone)

From [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md), applied by [Re-run: specs without checks, group c](167-rerun-specs-without-checks-group-c.md): `specs/float-classes.md` describes and accepts a library with no checks. What left the spec, per check:

- Misuse warnings: development check 1 (copied `float-*` and `clearfix` classes, D7) and check 3 (a float on a flex or grid item, and a clearfix on a flex or grid container, D9), with their messages, the browser-level cases, and the development-only `HostAttributeToken('class')` and `ElementRef` injections.
- Family checks: development check 2 (a float after a sibling floated toward the end of the reading direction when either holds focusable content, D8), with its message, its browser-level cases (right to left included), the `console.warn` spy of `float-classes--reading-order`, and the development-only render callback.
- Also gone: the "Runtime checks: none" bullet, the SSR smoke's no-warning clause, and two Out of Scope bullets that named checks (a width check for `nfsFloat="center"`, and detecting a missing `foundation-float-classes` include).

Each rule is stated as documented usage: the JSDoc of `nfsFloat` and `nfsClearfix`, two usage rules in the API section (reading order; no effect on flex and grid items and containers), the Solution, the 1.3.2 and 2.4.3 row, and the RTL note. A new Imports bullet says what a forgotten import does (a plain element; a bound input fails with NG8002). A copied class is still not stripped (D7), and the host-bindings test keeps that assertion. D7, D8, D9, and D10 are rewritten to what the spec now decides; user stories 12, 13, 15, 16, and 19 state documentation, not warnings; the mapping table's last column is "Variant properties". Unchanged: the directive, its two attributes and their types, ARIA, the rendering modes, the stories, and the e2e tests.
