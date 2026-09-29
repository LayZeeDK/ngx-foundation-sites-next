# 124. Re-run: Slider spec under the class rule

Type: grilling
Status: resolved
Blocked by: 81, 134
Labels: wayfinder:grilling
Map: ../map.md

## Question

What does the [Spec: Slider](32-spec-slider.md) become under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Revise `specs/slider.md` in place so that no consumer-written Foundation or NFS class remains: every Structural class the spec leaves to the consumer gets its directive binding, every Variant class the spec leaves consumer-written becomes a typed input by the decision above, and every State class stays or becomes a host binding. Behaviour, ARIA, keyboard, rendering modes, and tests otherwise stay as decided.

Also: `.slider-fill` gains its directive; SL9: state why Foundation's Shift+Arrow fast step is dropped (Page Up and Page Down are the APG large step) or keep it.

## How to work it

Read first: ADR 0039; the answer of [Prototype: a non-linear Slider Handle that assistive-technology increments move](134-prototype-slider-nonlinear-at-increment.md), whose changes land in `specs/slider.md` before this re-run (keep its non-linear native attributes, the Handle's four added listeners, the assistive-technology rule, and D22 as they leave the spec; in the revised Rendered HTML the non-linear native values and bounds stay integers); the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this spec); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Then revise the spec's Solution, class mapping, API tables, Rendered HTML (server and hydrated), stories and their play functions, tests, SSR smoke, and Design decisions, and remove every consumer-written class from its examples. Where the change reaches another spec, a shared utility, building-blocks, or an ADR, propose the edit for the orchestrator instead of making it. Record the revision as a dated `### Amendment, <date> (class rule)` section in the [Spec: Slider](32-spec-slider.md) and the answer here. Model: Opus 5.5.

## Answer

Model: Opus 5.5. Resolved 2026-09-28, AFK under the map's override: self-grilled on both sides with `/grill-with-docs` (the `/grilling` rounds plus `/domain-modeling` for vocabulary), then the spec revised in place in the `/to-spec` shape. Spec: [specs/slider.md](../specs/slider.md); the dated amendment is in the [Spec: Slider](32-spec-slider.md) under `### Amendment, 2026-09-28 (class rule)`. Sources: ADR 0039, ADR 0040, ADR 0001, ADR 0012, ADR 0020, ADR 0022, building-blocks 1.3, 1.4 (with the initial-state rule), 1.7, 1.9, 1.10, 1.13, and 1.14 as they stand, the answers of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md), [Prototype: a non-linear Slider Handle that assistive-technology increments move](134-prototype-slider-nonlinear-at-increment.md) (kept as it left the spec), [Re-run: Accordion spec under the class rule](107-rerun-accordion-class-rule.md) (the initial-state rule and Angular's styling resolution), [Re-run: Button spec under the class rule](128-rerun-button-class-rule.md) (two boolean conventions on one directive), [Re-run: Nested menu (shared utility) spec under the class rule](132-rerun-nested-menu-class-rule.md) (the class-only `span` directive shape), and [Spec: Top Bar](86-spec-top-bar.md) (the exact-luminance finding), `research/out-of-scope-triage.md` (SL9 and the judge's `.slider-fill` row), `research/out-of-scope-exclusions.md` (SL1 to SL11), `research/foundation-component-catalogue.md` (Slider), `map.md` Notes, `CONTEXT.md`, the Foundation 6.9.0 clone (`scss/components/_slider.scss`, `scss/forms/_range.scss`, `scss/util/_mixins.scss`, `js/foundation.slider.js`), and the APG slider pattern (`content/patterns/slider/slider-pattern.html`). Ratios were computed with the exact WCAG relative-luminance formula by a throwaway script outside the repository, which reproduced the Top Bar spec's two controls (2.9379 and 4.4373); no experiment workspace was needed.

Gist: the published spec already bound `.slider` as a static host class and `.disabled` as a host binding. What the consumer still wrote goes: the fill `span` gets `span[nfsSliderFill]`, which binds `.slider-fill`; `vertical` becomes a Closed Variant family boolean through `nfsVariantBoolean`; `vertical` and `disabled` no longer default from Foundation's static classes, whose copies are stripped and reported in development builds, as is a copied `slider-handle` on a Handle; the data binding example's grid takes the XY Grid directives. The contrast checks move to the exact WCAG formula, SL9 gets its reason, and every Out of Scope item, Dropped option, and rejected alternative gets its category. Behaviour, ARIA, keys, the non-linear rule, rendering modes, and Story ids are unchanged.

### Decisions

1. **Which classes did the published spec leave to the consumer?** Three sets: `class="slider-fill"` on the fill in every consumer example (the mapping row "Plain consumer markup", D2, user story 4); `class="vertical disabled"` on the container as the seed of the `vertical` and `disabled` inputs (user stories 9 and 11, the input defaults, the production `HostAttributeToken('class')` injection, D12, the Rendered HTML example "written with Foundation's classes only"); and `grid-x grid-margin-x`, `cell small-10`, `cell small-2` in the data binding example. `.slider` was a static host class and `.disabled` a host binding already. Source: the spec before this revision.
2. **Does the fill get a directive?** Yes: `NfsSliderFill` on `span[nfsSliderFill]`, a static host class and nothing else (D24). For keeping markup: the fill has no behaviour. Against: ADR 0039 names `.slider-fill` among the Structural classes left as markup for exactly that reason, and the user's rule leaves no Foundation class to the consumer. The selector keeps Foundation's `span`, as the Nested menu's `span[nfsSubmenuToggleText]` does; a `div` would work equally, but a `span` carries no role and nothing asks for another element.
3. **Does the fill inject `nfsSliderToken`?** Only in development builds, optionally, for new development check 6 (a fill outside a slider, which rule 10's `.slider > .slider-fill` never positions). A required injection would throw in production for a class holder that needs nothing from the container; the Handle's required injection is justified because it needs the scale and its sibling (building-blocks 1.9).
4. **Do the fill custom properties move onto the fill?** No. The container computes both ends from every Handle and the fill inherits them, so the container stays their one writer and the server HTML is unchanged. Moving them would make the fill inject the token in production and duplicate state.
5. **Is `vertical` a Variant input or an Option?** A Variant input, a boolean of a Closed Variant family through `nfsVariantBoolean`, declared `input<boolean, NfsVariantBoolean>` with the alias named (D23). Building-blocks 1.4 naming rule 1 cites "Slider `vertical`" by name, and the decision on typed Variant inputs lists "Slider's `vertical`" as closed. The argument for an Option: it changes behaviour (`aria-orientation`, the track-press axis). The Reveal kept `overlay` an Option for that reason plus two the Slider lacks: Foundation's docs never write `.without-overlay`, and `overlay` has a Defaults token slot. Foundation's docs write `.vertical`, and `vertical` has no Defaults slot, so the behaviour simply follows the Variant input. Consequence: `vertical="flase"` fails to compile, where `booleanAttribute` let it through.
6. **Registry, Variant property, Runtime check?** None. `foundation-slider` writes `.slider.vertical` unconditionally and no Sass setting lists it, so there is nothing to generate or check at runtime; the Sass subsection's item (6) reads "none", and no directive of the entry point calls `nfsVariantCheck`. The Variant declaration tooling gets no manifest entry.
7. **The static-class seed?** Removed (D12 reversed), under building-blocks 1.4's initial-state rule. `[class.disabled]` becomes a plain boolean (it was `true` or `undefined` so that a static class survived, the case of the Button re-run's D14); `vertical()` and the boolean `.disabled` binding strip a copied class on server and client, because Angular's styling resolution consults a static class only when every binding for it is `undefined` (the Accordion re-run's reading of `findStylingValue`). `HostAttributeToken('class')` survives only in development builds, for development check 5. A consumer's own class on the container stays.
8. **A copied `slider-handle` on a Handle?** Reported by check 5. The Handle binds no class, so the copy is not stripped, and building-blocks 1.4 has hosts that bind no class report the Foundation classes Foundation's markup puts on their element. From the cascade (not measured): the Library mixin's rules outrank most of Foundation's `.slider-handle` declarations on the input, but none sets `transition`, so `$slider-transition` would animate the width a range-form input takes from its sibling. Redundant `slider` and `slider-fill` merge with their static host classes and are not reported.
9. **SL9, Shift+Arrow?** Kept dropped, with the reason now stated (D25, the keyboard table, Out of Scope, Foundation behaviour dropped). The APG Slider pattern's larger step is Page Up and Page Down (optional keys in the pattern), which every engine's native range implements on linear Handles (ten percent of the range) and the non-linear handler implements as ten value steps, Foundation's own Shift+Arrow amount (`step * 10`, FS `js/foundation.slider.js`, `increaseFast`). Keeping Shift+Arrow would take over Shift+Arrow on linear Handles, whose keys are otherwise native, and a replayed pre-hydration press, whose native default already moved one step, would add ten more; a non-linear-only version would give one slider two key maps by scale type. Category `superseded`.
10. **The contrast checks?** The exact WCAG relative-luminance formula through the library's internal contrast helper, unrounded (D17 revised, rule 0a, the WCAG 1.4.11 row, the Sass bullet, the compile test), because the Top Bar spec measured Foundation's `color-luminance()` passing failing pairs. Exact ratios: `$medium-gray` #cacaca on `$light-gray` #e6e6e6 1.3133:1 (was "about 1.3"), `$primary-color` #1779ba on #e6e6e6 3.7554:1 (was "about 3.8"). No verdict moves. The compile test gains the Top Bar's false pass as a slider case (`#116666` on a `#0a0a0a` track: 2.94:1 exact, 3.01:1 through Foundation's function). The helper composites a translucent colour over `$body-background`; the fill and thumb are painted on the track, so for a translucent setting that is an approximation, and the check is exact for the solid colours Foundation's settings hold, as the spec already said.
11. **Categories.** Every Out of Scope item, Dropped option, and rejected Design-decisions alternative carries a one-line reason and one category of `research/out-of-scope-exclusions.md`. Changes in kind: SL8 is split, because its parts have different reasons: more than two handles stays `scope-boundary`, while tick marks, the value badge, and a colour input are `other` (not a Foundation feature); `.is-dragging` joins Out of Scope (`superseded`: the fill transition is removed by rule 10 and the span handle no longer exists). Being CSS-only is the reason for none.
12. **User stories?** 1, 4, 9, and 11 rewritten in place; 45 (copied classes reported) and 46 (a misspelt `vertical` fails to compile) appended; numbering kept.
13. **Examples and stories?** No example writes a Foundation or library class. The data binding example uses `nfsGridX` and `nfsCell size="10"` / `size="2"` for Foundation's `small-10` and `small-2`, the names building-blocks gives until the [Spec: XY Grid](99-spec-xy-grid.md) names them (as the Forms, Tabs, Abide, and Magellan specs write them), with `.grid-margin-x` left out until that spec names its input. The stories set `vertical` and `disabled` as args and use no grid, so they depend on no other entry point.
14. **Tests?** Browser-level: the host binding table over a class-free host, the `vertical` transform (`true`, `''`, `'true'` against `false`, `'false'`, `null`, `undefined`), the copied-class cases, and six development checks. SSR smoke: a fixture with no `class` attribute renders `slider`, `slider-fill`, and `vertical` and `disabled` from their inputs. Sass: the exact-formula case and no Variant property. Story ids unchanged; e2e unchanged.
15. **Rendering modes?** Unchanged. Every class is a static host class or a host binding, so the server HTML carries it; the fill's class is static, so a fill in a dehydrated block renders the same, and the fill has no listener to replay. Nothing reads a class before or after hydration in production.
16. **Glossary or ADR?** No ADR: everything follows from ADR 0039 and ADR 0040, and the one choice with alternatives (the fill's development-only lookup) is additive to reverse. One glossary term, **Fill**, proposed below: the spec leans on "the fill" throughout, and "fill" is also the Button's `solid`/`hollow`/`clear` Variant input.

### Triage

Rated per the map's triage rule.

| Item | Impact | Confidence | Outcome and evidence |
| --- | --- | --- | --- |
| `span[nfsSliderFill]` (decisions 2 to 4) | HIGH (a new public selector in every slider's markup) | HIGH (ADR 0039 names the class; the Nested menu's class-only `span` precedent) | Decided |
| `vertical` as a closed Variant boolean (5, 6) | HIGH (public input type) | HIGH (building-blocks 1.4 and the typed-Variant decision name it; ADR 0040's probes measured `nfsVariantBoolean`) | Decided |
| Static-class seed removed, copies reported (7, 8) | MEDIUM (consumer markup; a development-only check) | HIGH (building-blocks 1.4's initial-state rule; Angular's styling resolution, read by the Accordion re-run); the `transition` effect of a copied `slider-handle` is read from the cascade, not measured, and only motivates a warning | Decided |
| SL9 reason (9) | LOW (no API change) | HIGH (the APG pattern and Foundation's source read) | Decided |
| Exact-formula checks (10) | MEDIUM (Library mixin internals) | HIGH (computed; the Top Bar's controls reproduced) | Decided |
| Categories, stories, examples, tests (11 to 14) | LOW | HIGH | Decided |
| XY Grid names in one example (13) | LOW (one example) | NOT HIGH (the XY Grid spec has not run) | Decided as placeholders, replaced when that spec names them |

Nothing is `OPEN FOR HUMAN`; no `## Prototype needed`.

### Proposed shared-file changes (for the orchestrator)

1. `building-blocks.md`, Table A, the Slider row. Second cell: replace "`[nfsSlider]` on `.slider`; `input[type="range"][nfsSliderHandle]` (one, or two for the range form); `value` model per handle" with:

   > `[nfsSlider]` (binds `.slider`; the `vertical` Variant input; the `.disabled` State class); `input[type="range"][nfsSliderHandle]` (one, or two for the range form); `span[nfsSliderFill]` (binds `.slider-fill`); `value` model per handle

   Third cell: replace "Directives on native inputs (Material `matSliderThumb` shape, `R:material` 7)" with:

   > Directives on the native inputs and on Foundation's container and fill, one per Structural class ([ADR 0039](adr/0039-directives-manage-every-foundation-class.md); Material `matSliderThumb` shape, `R:material` 7)

   Fifth cell: replace "Native range input, `.slider-fill` positioned by `--nfs-slider-lo`/`--nfs-slider-hi` style bindings," with:

   > Native range input, the fill positioned by the container's `--nfs-slider-lo`/`--nfs-slider-hi` style bindings, which it inherits, `nfsVariantBoolean` for `vertical`, `HostAttributeToken('class')` in development builds only (copied classes),

2. `building-blocks.md`, Table B, the Slider row, DI shape cell: after "`nfsSliderDefaultsToken` (`step`, `decimal`, `nonLinearBase`, `positionValueFunction`)" append:

   > ; `span[nfsSliderFill]` injects nothing in production (in development builds, an optional lookup of `nfsSliderToken` for its warning)

3. `building-blocks.md`, 1.4, the initial-state bullet: replace "the Slider's `vertical` and `disabled`," with:

   > the Slider's `vertical` and `disabled` (removed by the [Re-run: Slider spec under the class rule](issues/124-rerun-slider-class-rule.md), which binds both from their inputs and reports a copied one),

4. `CONTEXT.md`, Foundation side, after **Bar position**:

   > **Fill**:
   > The part of a Slider that paints the selected stretch of its track, from the track's start to the one Handle or between the two; Foundation's `.slider-fill`. Distinct from the `fill` Variant input of a Button, which chooses `solid`, `hollow`, or `clear`.
   > _Avoid_: range, bar, progress, track fill

5. `research/out-of-scope-triage.md`, section 3: at the end of the SL9 row's "Change needed" cell append:

   > (2026-09-28, [Re-run: Slider spec under the class rule](../issues/124-rerun-slider-class-rule.md): kept dropped with this reason recorded, the Slider spec's D25.)

   and at the end of the first row's "Change needed" cell (the judge-found rows) append:

   > (2026-09-28: the Slider's `.slider-fill` is `span[nfsSliderFill]`, [Re-run: Slider spec under the class rule](../issues/124-rerun-slider-class-rule.md).)

6. `map.md`, Decisions so far: the gist line below.

No change to any ADR, `README.md`, or another spec is needed from this ticket. The Top Bar ticket's building-blocks 1.10 and ADR 0022 proposals (the exact-luminance helper) already cover the Slider's check; this spec now names the helper.

### What other specs need from this one

- [Spec: XY Grid](99-spec-xy-grid.md): the Slider's data binding example writes `<div nfsGridX>` with `<div nfsCell size="10">` and `<div nfsCell size="2">` for Foundation's `grid-x`, `cell small-10`, and `cell small-2`, and leaves out `.grid-margin-x` until your gutter input is named; if you name them otherwise, that one example follows.
- [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md): `vertical` is closed; the Slider adds no registry, manifest `uses` entry, or Variant property. The typings assertion covers `NfsSlider.vertical`'s write type `NfsVariantBoolean`.
- [Spec: Top Bar](86-spec-top-bar.md) (its contrast helper): the Slider calls it for two pairs drawn on the track (`$slider-fill-background` and `$slider-handle-background` against `$slider-background`). If the helper ever takes the backdrop as an argument, the Slider would pass the composited track, which makes translucent fills exact; nothing else changes.
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): check that no Slider example or story writes `slider`, `slider-fill`, `slider-handle`, `vertical`, or `disabled` as a class; that `NfsSlider` carries both boolean conventions (`disabled`, `disabledInteractive`, `clickSelect` through `booleanAttribute`; `vertical` through `nfsVariantBoolean`), the case ADR 0040's dissent names as its reopening trigger; and that the Slider quotes 1.31:1 and 3.76:1.
- [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md): the Slider's Out of Scope, Dropped options, "Foundation behaviour changed or dropped", and every rejected alternative in D1 to D25 carry a reason and a category; SL8 is split (more than two handles `scope-boundary`; tick marks, the value badge, and a colour input `other`, not a Foundation feature), and `.is-dragging` is a new row (`superseded`).

### Gist for Decisions so far

- [Re-run: Slider spec under the class rule](issues/124-rerun-slider-class-rule.md) -- the consumer writes no class: `span[nfsSliderFill]` binds `.slider-fill` (a static host class, no production injection, a development warning outside a slider) while the container keeps the fill's custom properties; `vertical` becomes a Closed Variant family boolean through `nfsVariantBoolean` with no registry, Variant property, or Runtime check; `vertical` and `disabled` no longer default from Foundation's static classes, whose copies are stripped by the bindings and reported in development builds, as is a copied `slider-handle` on a Handle; Shift+Arrow stays dropped because Page Up and Page Down are the APG's larger step and a native linear key takeover would double-count replayed presses; the contrast checks use the exact WCAG formula (fill 1.31:1, thumb 3.76:1 on Foundation's defaults); every exclusion carries a category; behaviour, ARIA, keys, the non-linear rule, rendering modes, and Story ids unchanged; impact HIGH, confidence HIGH. Spec: [specs/slider.md](specs/slider.md).

### Amendment, 2026-09-29 (in-family check lines)

From the [Re-run: form and value-control family specs, In-family check lines](153-rerun-form-and-value-control-family-in-family-lines.md), under [ADR 0046](../adr/0046-forgotten-imports-caught-by-checks.md) and the family rule of the [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md); `specs/slider.md` was revised in place, and the decision log is that ticket's Answer. Behaviour, API, ARIA, keys, the rendering modes, and the Story ids are unchanged. Changed:

- Hierarchy and DI shape gains the In-family check lines, one per directive: `NfsSlider` probes `NfsSliderHandle` and `NfsSliderFill`; the Handle has no parent check, because its required injection's NG0201 is the report; the fill's development check 6 becomes its parent check over `NfsSlider`, with the family's `alone` sentence, so a fill outside a slider reports once, and under `strictParents` it throws at construction, as the shared spec's table lists (D24 and the layer-2 case follow).
- `nfsSliderToken` gains its development-only description ("nfsSliderToken (provided by NfsSlider from 'ngx-foundation-sites/slider' on an ancestor element declared in the same template)").
- A non-linear Handle without `displayWith` speaks `` `${value}` ``, JavaScript's number-to-string conversion with no locale format, as Material's default `displayWith` ([Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md), fixer X9).
