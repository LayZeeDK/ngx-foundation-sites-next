# 118. Re-run: Dropdown spec under the class rule

Type: grilling
Status: resolved
Blocked by: 81
Labels: wayfinder:grilling
Map: ../map.md

## Question

What does the [Spec: Dropdown](26-spec-dropdown.md) become under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Revise `specs/dropdown.md` in place so that no consumer-written Foundation or NFS class remains: every Structural class the spec leaves to the consumer gets its directive binding, every Variant class the spec leaves consumer-written becomes a typed input by the decision above, and every State class stays or becomes a host binding. Behaviour, ARIA, keyboard, rendering modes, and tests otherwise stay as decided.

## How to work it

Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this spec); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Then revise the spec's Solution, class mapping, API tables, Rendered HTML (server and hydrated), stories and their play functions, tests, SSR smoke, and Design decisions, and remove every consumer-written class from its examples. Where the change reaches another spec, a shared utility, building-blocks, or an ADR, propose the edit for the orchestrator instead of making it. Record the revision as a dated `### Amendment, <date> (class rule)` section in the [Spec: Dropdown](26-spec-dropdown.md) and the answer here. Model: Opus 5.5.

## Answer

Model: Opus 5.5. Worked AFK: the agent played both sides of the interview (map Notes, AFK override), with `/domain-modeling` for vocabulary and `/to-spec` for the revision. Spec: [specs/dropdown.md](../specs/dropdown.md), revised in place; the dated amendment is in the [Spec: Dropdown](26-spec-dropdown.md).

Read first, as the ticket lists: ADR 0039 and ADR 0040; the Answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md); `research/out-of-scope-triage.md` (DP3 in the R2 row); `research/foundation-component-catalogue.md` (the Dropdown row); `research/out-of-scope-exclusions.md` (DP1 to DP17); `map.md` Notes; `building-blocks.md` 1.1 to 1.14 and Tables A, B, and D; `CONTEXT.md`; ADR 0001, 0012, and 0022. Also, as the brief asked: the Answers of [Spec: Button Group](82-spec-button-group.md), [Re-run: Button spec under the class rule](128-rerun-button-class-rule.md), and [Re-run: Accordion spec under the class rule](107-rerun-accordion-class-rule.md); the user decision in [Re-run: Magellan spec under the class rule](122-rerun-magellan-class-rule.md); and, once they landed, the Answer and spec of [Re-run: Triggers (shared utility) spec under the class rule](130-rerun-triggers-class-rule.md) (its D18), the Answer of [Re-run: Reveal spec under the class rule](110-rerun-reveal-class-rule.md), and the in-progress `specs/toggler.md` of [Re-run: Toggler spec under the class rule](109-rerun-toggler-class-rule.md). The shared documents were read as the fixer left them. Sources are cited as FS, the Foundation 6.9.0 clone (`scss/components/_dropdown.scss`, `docs/pages/dropdown.md`, `js/foundation.dropdown.js`). Almost every point follows from ADR 0039, ADR 0040, building-blocks 1.4, and measurements other tickets already made: the Button and Callout re-runs for the `[class]` list and Variant properties, and the Reveal re-run for the Motion name types under strict templates.

Two small measurements were made under `D:/tmp/nfs-wave-118/` (not committed):
- `motion-pair.ts`, a `tsc --noEmit --strict` probe with the repository's TypeScript 5.9.3. It checks the plain type, not Angular's template checker, which the Reveal re-run measured for the same template-literal form. `NfsMotionPair` accepts `''`, `fade-in`, `fade-in fade-out`, `hinge-in-from-top spin-out`, `fade-out` alone, `.app-pop-in`, `.app-pop-in .app-pop-out`, and mixed pairs. It rejects `fade-inn`, `fade-out fade-in`, `nfs-fade-in`, `nfs-fade-in nfs-fade-out`, `fade-in fast`, and `fade-in slide-in-down`; each rejection is an `@ts-expect-error` line, and a control directive on a valid value was reported unused.
- `ratio.mjs`, the exact WCAG ratio with `Math.pow`, with a 21:1 black-on-white control: pane text `#0a0a0a` on `#fefefe` is 19.6304:1, and `$dropdown-border` `#cacaca` on `#fefefe` is 1.6252:1 (1.6390:1 on pure white).

### Grilling record

Round 1 (nothing settled yet).

- Q1, which Foundation or library classes does the published spec leave to the consumer? Found:
  - `class="dropdown-pane"` in every example, which is redundant because the directive already binds it as a static host class;
  - the size classes (the mapping row said "None; the consumer writes them");
  - `animate="nfs-fade-in nfs-fade-out"`, library class names as an input value;
  - `class="card"` with `parentClass="card"`, a Foundation class in markup and as an input value;
  - `class="small"` on an `nfsButton` and `class="reveal"` on the Reveal example;
  - the positions story's source, Foundation's docs markup with the legacy `.top`, `.left`, `.right`, `.bottom` pane classes.

  Settled: all go (decisions 1 to 11).
- Q2, the Structural class: any change of mechanism? No. `.dropdown-pane` stays a static host class, and a redundant copy merges with it and is not reported, as the Accordion re-run found (decision 2).
- Q3, State classes: `.is-open`, `has-position-*`, and `has-alignment-*` were already host bindings. Does anything else hold one? Foundation's `.hover` on the anchors is written on the Triggers. Under the Triggers re-run's D18, no Openable writes a class on its Triggers, and no Foundation Sass reads `.hover`, so it stays dropped. The Magellan user decision (a `Renderer2` State class on an element that carries no library directive) does not apply: every class the pane manages sits on its own host, and every Trigger carries a library directive (decision 3).
- Q4, the size classes: which input, which type? By building-blocks 1.4 rule 3, `size`. `$dropdown-sizes` is a consumer map, so the family is Open: `NfsDropdownPaneSize = NfsOverridableStringUnion<'tiny' | 'small' | 'large', NfsDropdownSizesOverrides>`, with the registry named by building-blocks 1.3 and already listed in the Variant declaration tooling spec's registry table. FS `_dropdown.scss:35-39, 75-81` has no `default` key and no responsive form, so there is no `'default'` value and no Breakpoint query. Rejected: `(string & {})` (a typo compiles, ADR 0040) and a closed union (fails the sizes Foundation's docs let consumers add) (decision 4).

Round 2 (Q1 to Q4 settled).

- Q5, the Variant property and its writer. The entry point has an Open family, so its Library mixin writes `--nfs-dropdown-sizes` (building-blocks 1.13). `nfs-dropdown-pane` already exists for the 1.4.10 warning, so this is its first emitted rule; it is the property's only writer. The names are joined with `space`, as the Button re-run measured (decision 5).
- Q6, the Runtime check: request the include only when `size` is bound? For: the Button requests it that way. Against: the include carries the compile-time 1.4.10 warning, so a missing include is an accessibility gap on every pane, which is the Callout's D12 and the Close Button's D10 reasoning. Settled: `include()` on every run, `value()` for a bound size. A consumer who empties `$dropdown-sizes` gets a false missing-include report and switches the check off; that edge is accepted (decision 6).
- Q7, copied Foundation markup (building-blocks 1.4, initial-state rule). A copied `is-open` is stripped by `[class.is-open]`, and the pane renders closed with no signal. A copied size or Placement class survives the `[class]` list. A copied legacy position class survives but no longer places the pane, and a copied `is-opening` shows a closed pane invisibly (FS `_dropdown.scss:60-62`). Settled: dev check 7, reading `HostAttributeToken('class')` in development builds only. It names the input to bind, matches whole tokens only, and does not report a redundant `dropdown-pane`, the consumer's own classes, or consumer-declared sizes (the Variant check reports those) (decision 7).
- Q8, `animate`. ADR 0039 says a Motion input takes `'fade-in'`, never `'nfs-fade-in'`, and applies it as a State class on a persistent element. The pane is persistent, so the mechanism is unchanged and only the values change. Options:
  - (a) the shared Motion types of building-blocks 1.6 rule 4, which the resolved Reveal re-run named: Motion names that bind `nfs-<name>`, and the consumer's own keyframe classes in Foundation's dot form. The pane's one-string pair is typed over them, as that rule asks.
  - (b) the Toggler re-run's draft form, which types the consumer's own classes as an object (`{in, out}`);
  - (c) a Dropdown-only Motion type;
  - (d) keep the string.

  (d) breaks ADR 0039, and (c) would give one mechanism two spellings. Between (a) and (b), the coordinator asked every Motion input to take the Reveal's names and types, and (a) needs no second binding form for one input. Settled: (a).
  - `NfsMotionPair` is `NfsMotionIn`, or `NfsMotionOutName` alone, or the template literal `` `${NfsMotionInName | NfsMotionClassList} ${NfsMotionOutName | NfsMotionClassList}` ``, measured above. `NfsMotionPair` is also the name the Toggler draft uses.
  - `nfsMotionClasses` maps each half.
  - Because a typed name hides the `nfs-` prefix that told the consumer to include `nfs-motion`, dev check 5 becomes the Reveal's check 3, the measured "started no animation" warning (decision 9).
- Q9, `parentClass`. `parentClass="card"` puts a Foundation class name in an input value, which ADR 0039 bars; the consumer's own classes stay allowed. Options:
  - (a) keep `parentClass` for the consumer's own classes;
  - (b) add a `boundary` element input;
  - (c) drop `parentClass` as a class-name Option.

  (c) breaks Foundation's naming rule for a lookup that works. (b) is additive later (D6's own words) and is not needed while an application class on the bounding element works. A check that tells a consumer class from a Foundation class would need Foundation's class list in the development bundle. Settled: (a), documented, with no check (decision 10).

Round 3 (Q5 to Q9 settled).

- Q10, the split button (resolved by the Button Group spec): the pane goes after the group, never inside it. Is a check worth it? Dev check 3 (the pane follows its Trigger) passes for a pane inside the group, so it would not catch the mistake. `parentElement.closest('.button-group')` in the existing development render callback is one read. Settled: dev check 8, and a split-button usage example (decision 11).
- Q11, stories. The Story ids stay. The reflow arg becomes `size`. The default story drops the docs' XY Grid scaffolding, whose directives the XY Grid spec has not named. The parent-class story bounds by a plain box with the story's own class. The positions story takes the docs' legacy-class examples as `position` values. Settled (decision 12).
- Q12, tests and the SSR smoke. Layer 2 adds classes, copied classes, the Variant check, and eight dev checks. The SSR fixture writes no `class`. Pure logic adds the size mapping and the whole-token matcher. The Sass compile test asserts the one `:root` rule. The e2e reflow matrix uses `size`. Settled (decision 13).
- Q13, rendering modes. The size class is a host binding on server state, so the server HTML carries it. The Runtime checks and the development checks run only in client render callbacks, and the development static-class read is DI. Nothing else changes (decision 14).
- Q14, vocabulary. Structural class, Variant class, State class, Variant input, Variant registry, Variant property, Runtime check, and Motion class carry the concepts; no new term is needed. The **Motion class** definition's refresh is the Triggers re-run's proposal 6, left to the Toggler and Reveal proposals and the consistency review. No ADR: every change applies ADR 0039 and ADR 0040, and the one real choice (Q9) is additive to reverse.

The frontier is empty.

### Decisions

1. Every consumer-written Foundation or library class leaves the spec's markup, stories, fixtures, and examples. The one deliberate exception is the Rendered HTML case that shows what copied Foundation markup does. `account-box` and `story-bound` are the application's and the story's own classes.
2. `.dropdown-pane` stays a static host class of `NfsDropdownPane` (D1 revised). The consumer writes `<div nfsDropdownPane>`.
3. State classes stay host bindings: `[class.is-open]`, plus one `computed` `[class]` list with the size class, the two Placement classes, and the current phase's Motion classes. The pane writes no class on its Triggers, and `.hover` stays dropped (Triggers spec, D18). No `Renderer2` class write exists or is needed.
4. `size`: `input<NfsDropdownPaneSize | undefined>(undefined)`, no transform, with the explicit alias type argument that building-blocks 1.4 requires.
   - Type: `NfsDropdownPaneSize = NfsOverridableStringUnion<'tiny' | 'small' | 'large', NfsDropdownSizesOverrides>`, with the registry in the primary entry point.
   - An unset `size` sets no class. There is no `'default'` value and no Breakpoint form, and `size` is not in the Defaults token (D26).
5. `nfs-dropdown-pane` writes `:root { --nfs-dropdown-sizes: tiny small large; }` on Foundation's defaults, space-joined. It is the only writer, and this is its one emitted rule (D29, Sass item 6).
6. The Variant check: `nfsVariantCheck('nfsDropdownPane')` at construction, and a `read`-phase `afterRenderEffect` that exists only with a handle.
   - In that phase: `include('nfs-dropdown-pane', ['dropdown-sizes'])` on every run, then `value('size', ...)` when `size` is bound.
   - Nothing runs on the server (D28).
7. Dev check 7 reports copied classes: `is-open`, the default size names, the legacy position classes, `has-position-*`, `has-alignment-*`, and `is-opening`. It reads `HostAttributeToken('class')` in a development-only field initialiser, names the input to bind, and matches whole tokens (D27).
8. Initial state is bound: open at first paint is `[isOpen]="true"`, never a copied `.is-open` (building-blocks 1.4).
9. `animate` takes Motion names or the consumer's own keyframe classes with a leading dot, with the same names and types as the Reveal re-run (`NfsMotionInName`, `NfsMotionOutName`, `NfsMotionClassList`, `NfsMotionIn`, `NfsMotionOut`, `nfsMotionClasses`, all in the primary entry point).
   - One difference, stated as the coordinator asked: the pane's input is one string holding an entering and a leaving half, the form of Foundation's Toggler `data-animate="<in> <out>"`, which the pane's mechanism reuses. The Reveal instead has two inputs, `animationIn` and `animationOut`, named after its Foundation Options, and Foundation's Dropdown has no animation Option to name two inputs after. So the pane's type is the pair alias `NfsMotionPair` over the Reveal's aliases, as building-blocks 1.6 rule 4 (the Reveal's proposal 2) asks.
   - In the pair each half is one token, split at whitespace, so a dot-form class list carries one class per direction, where the Reveal's `animationIn` can take several. A leaving name alone animates only the close.
   - The State-class mechanism is unchanged.
   - Dev check 5 becomes the Reveal's check 3 applied to `animate`, plus a more-than-two-tokens warning for dot-form classes that pass the type (D20 revised).
10. `parentClass` names the consumer's own class, never a Foundation or library class. A pane bounded by a library-classed element names an application class that the consumer adds to that element. There is no check, and a `boundary` element input stays the additive upgrade path (D6 revised).
11. A split button's pane goes after the Button Group, and dev check 8 warns when a pane sits inside one. The usage examples show the composition, with the `nfsShowForSr` placeholder of the Button and Button Group specs (D30).
12. Stories: the ids are unchanged; `size` and `animate` are args; stories use only Foundation's default size names, so the Storybook program needs no Variant declaration file; scaffolding without a directive yet is left out or inline-styled (Q11).
13. Tests:
    - layer 2 adds classes, copied classes, the Variant check, and eight dev checks, with check 5 also covering missing keyframes;
    - the SSR fixture writes no `class`, and the server HTML carries `.large` on the `size="large"` pane, with no Runtime or development check on the server;
    - pure logic adds the size mapping and the whole-token matcher;
    - the Sass compile test expects the one `:root` rule, a custom `xlarge`, and the warning for a fixed-width custom size;
    - the e2e reflow runs over no `size`, `size="small"`, and `size="large"`.
14. Rendering modes and behaviour are unchanged. The size class is in the server HTML, and the checks are client-only.
15. User stories 1, 5 to 7, and 38 are rewritten, and 46 to 50 are added; the numbering is kept, so citations still hold. D1, D6, D20, and D22 are revised, and D26 to D30 are added.
16. Contrast (the Top Bar finding that Foundation's `color-luminance()` rounds): the pane has no compile-time contrast check; `nfs-dropdown-pane` checks only widths. The WCAG table's two documented ratios are restated by the exact formula: 1.4.3, pane text on `$dropdown-background`, was "about 19.6:1" and is 19.63:1; 1.4.11, `$dropdown-border` on `$white`, was "about 1.6:1" and is 1.63:1. Neither verdict changes: 1.4.3 passes, and 1.4.11 does not apply to the container edge.

### Triage

Rated per the map's triage rule.

| Item | Impact | Confidence | Outcome and evidence |
| --- | --- | --- | --- |
| Class-free consumer markup (decisions 1, 2, 8) | HIGH (the consumer markup contract) | HIGH (ADR 0039 decides it; the directive already bound the classes) | Decided |
| `size` Variant input and its type (decision 4) | HIGH (public API and a type name in the manifest) | HIGH (building-blocks 1.3 and 1.4 name it mechanically; FS `_dropdown.scss` fixes the defaults, the missing `default` key, and the lack of a responsive form; the registry was already in the tooling spec's table) | Decided |
| The Variant property and check (decisions 5, 6) | MEDIUM (library CSS output and a development report) | HIGH (building-blocks 1.13; the Button re-run's measurements; the Callout's D12 reasoning for requesting the include) | Decided |
| Dev checks 7 and 8 (decisions 7, 11) | LOW (development only, additive) | HIGH (building-blocks 1.4; FS `_dropdown.scss:60-62` for `is-opening`; the Button Group's decision) | Decided |
| `animate` over the Reveal's shared Motion types, with the pair alias `NfsMotionPair` (decision 9) | HIGH (a public type the four Motion inputs share) | HIGH: ADR 0039 names `'fade-in'`; the names, the dot form, and their strict-template behaviour are the resolved Reveal re-run's, measured with `ngc` 22.2.0; the pair alias was measured here with `tsc`; building-blocks 1.6 rule 4 (the Reveal's proposal 2) asks a one-string pair input to type its pair over those aliases; the coordinator asked every Motion input to use them. The concurrent Toggler draft's object form for the consumer's classes is the one open difference, which the Reveal Answer already routes to the [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md) | Decided |
| `parentClass` keeps the consumer's own class, no `boundary` input (decision 10) | MEDIUM (an Option's contract) | HIGH (ADR 0039 keeps the consumer's own classes; a `boundary` input is additive later) | Decided |
| Stories, tests, rendering modes (decisions 12 to 14) | LOW | HIGH | Decided |

No `OPEN FOR HUMAN` item, and no `## Prototype needed`.

### Proposed shared-file changes (for the orchestrator)

1. `building-blocks.md`, Table A, the Dropdown (pane) row. First cell: replace "`[nfsDropdownPane]` on `.dropdown-pane`; trigger `button[nfsToggle]="pane"` (or `nfsOpen`); Anchored pane utility" with:

   "`[nfsDropdownPane]` (binds `.dropdown-pane`; Variant input `size` over `NfsDropdownSizesOverrides`; `animate` takes typed Motion names); trigger `button[nfsToggle]="pane"` (or `nfsOpen`); Anchored pane utility; a split button's pane goes after its Button Group"

   Same row, the primitives cell: after "both resolved from the `Injector` on first need" insert:

   "; `nfsVariantCheck()` for `size`; `HostAttributeToken('class')` in development builds only, for the copied-class warning"

2. `building-blocks.md`, Table B, the Dropdown (pane) row, the animation cell: replace "State class `.is-open` plus `nfs-fade-in`/`nfs-fade-out` keyframes when `animate` is set (Foundation has none by default)" with:

   "State class `.is-open` plus `nfs-fade-in`/`nfs-fade-out` keyframes when `animate="fade-in fade-out"` is set, the typed Motion names mapped to the library's keyframe classes by `nfsMotionClasses` (Foundation has none by default)"

3. `building-blocks.md` 1.6 rule 4, in the text of the Reveal re-run's proposal 2 once it is applied: replace its last clause, "an input that takes an entering and a leaving value in one string (`animate="<in> <out>"`) types the pair over the same aliases in its own spec.", with:

   "an input that takes an entering and a leaving value in one string (the Toggler's and the Dropdown pane's `animate`, `"<in> <out>"`) is typed `NfsMotionPair`, declared beside them: `NfsMotionIn`, a leaving name alone, or `` `${NfsMotionInName | NfsMotionClassList} ${NfsMotionOutName | NfsMotionClassList}` ``, split at whitespace into one token per direction, each mapped by `nfsMotionClasses` ([Re-run: Dropdown spec under the class rule](issues/118-rerun-dropdown-class-rule.md))."

4. `map.md`, Decisions so far: the gist line at the end of this Answer.

No change is needed to `CONTEXT.md`, any ADR, or `README.md`, whose Dropdown row names no class. The **Motion class** definition is left to the Triggers re-run's proposal 6 and the Reveal's wording.

### What other specs need from this one

- [Re-run: Toggler spec under the class rule](109-rerun-toggler-class-rule.md):
  - The Dropdown pane types its `animate` as `NfsMotionPair` over the Reveal's shared Motion types (`NfsMotionIn`, a leaving name alone, or an in-half and an out-half, each a Motion name or one dot-form class), mapped per half by the shared `nfsMotionClasses`. Your draft uses the same pair name with different `NfsMotionIn`/`NfsMotionOut` definitions (name unions without the dot form) and an object form (`NfsKeyframeClasses`) for the consumer's classes. The pane follows the Reveal's names and dot form, as the coordinator asked of every Motion input. If your Answer keeps the object form, the consistency review picks one form for all four inputs.
  - The pane's dev check 5 is the Reveal's check 3 applied to `animate`.
- [Re-run: Anchored pane (shared utility) spec under the class rule](131-rerun-anchored-pane-class-rule.md): your composition example writes `<div nfsDropdownPane #account="nfsDropdownPane" id="account-pane" class="dropdown-pane" vOffset="7">`. Drop `class="dropdown-pane"`; the server HTML lines stay as they are, because the directive binds the class. `parentClass` names the consumer's own class (the Dropdown spec's D6).
- [Re-run: Tooltip spec under the class rule](119-rerun-tooltip-class-rule.md): your example `<div nfsDropdownPane #account="nfsDropdownPane" class="dropdown-pane">` becomes `<div nfsDropdownPane #account="nfsDropdownPane">`.
- [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md): the manifest entry for `NfsDropdownSizesOverrides` keeps `mixins: ['nfs-dropdown-pane']` and gains `uses: [{entryPoint: 'ngx-foundation-sites/dropdown-pane', directive: 'NfsDropdownPane', input: 'size', alias: 'NfsDropdownPaneSize', shape: 'name'}]`. The typings assertion covers `NfsDropdownPane.size`.
- [Spec: Breakpoint service (shared utility)](53-spec-breakpoint-service.md), optional wording: in the `include(mixin, settings)` bullet, after "the Menu `breakpoint-classes` for `nfs-breakpoint-properties`" add ", the Dropdown pane `dropdown-sizes` for `nfs-dropdown-pane`, whether or not `size` is bound, because the include carries its 1.4.10 warning".
- [Spec: Button Group](82-spec-button-group.md) (resolved; optional amendment in place): after the split-button Rendered HTML, the sentence "The Trigger's attributes belong to ..." can add "A pane written inside the group warns in development (the [Spec: Dropdown](../issues/26-spec-dropdown.md), dev check 8)."
- [Spec: Card](90-spec-card.md): nothing required. A pane bounded by a card uses `parentClass` with an application class that the consumer adds to the card's host, never `parentClass="card"`.
- [Spec: Visibility Classes](104-spec-visibility-classes.md): the Dropdown split-button example uses the `nfsShowForSr` placeholder.
- [Spec: XY Grid](99-spec-xy-grid.md): the `dropdown-pane--default` story leaves out Foundation's docs grid scaffolding until your directives exist.
- [Spec: Float Classes](105-spec-float-classes.md): the pane does not read `.float-*` on its Trigger; `alignment` replaces it.
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md):
  - replace the `nfsShowForSr` placeholder;
  - check that the Toggler, Reveal, Responsive Toggle, and Dropdown pane Motion inputs share one form for the consumer's own classes (the Reveal and the Dropdown pane use the leading dot; the Toggler draft used an object) and one pair type (`NfsMotionPair`, proposal 3);
  - check that no `class="dropdown-pane"` remains in the Anchored pane, Tooltip, or Triggers examples.

### Gist for Decisions so far

- [Re-run: Dropdown spec under the class rule](issues/118-rerun-dropdown-class-rule.md) -- the pane is written `<div nfsDropdownPane>` with no class: the directive already bound `.dropdown-pane` and its State classes, and the size classes become the Open Variant input `size` (`NfsDropdownPaneSize` over `NfsDropdownSizesOverrides`, no `'default'`, no Breakpoint form), whose `--nfs-dropdown-sizes` `nfs-dropdown-pane` now writes and whose include the Runtime check requests on every pane, because it carries the 1.4.10 warning; `animate` takes Motion names (`fade-in fade-out`) or the consumer's own keyframe classes with a leading dot, over the Reveal's shared Motion types through a one-string pair alias, `NfsMotionPair`, with the Reveal's "started no animation" warning; `parentClass` names the consumer's own class; copied Foundation classes (`is-open`, sizes, legacy position and Placement classes, `is-opening`) and a pane inside a Button Group warn in development; no class on Triggers (`.hover` stays dropped); behaviour, ARIA, rendering modes, and Story ids unchanged; impact HIGH, confidence HIGH; no ADR. Spec: [specs/dropdown.md](specs/dropdown.md).
