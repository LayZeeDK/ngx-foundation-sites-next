# 119. Re-run: Tooltip spec under the class rule

Type: grilling
Status: resolved
Blocked by: 81
Labels: wayfinder:grilling
Map: ../map.md

## Question

What does the [Spec: Tooltip](27-spec-tooltip.md) become under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Revise `specs/tooltip.md` in place so that no consumer-written Foundation or NFS class remains: every Structural class the spec leaves to the consumer gets its directive binding, every Variant class the spec leaves consumer-written becomes a typed input by the decision above, and every State class stays or becomes a host binding. Behaviour, ARIA, keyboard, rendering modes, and tests otherwise stay as decided.

## How to work it

Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this spec); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Then revise the spec's Solution, class mapping, API tables, Rendered HTML (server and hydrated), stories and their play functions, tests, SSR smoke, and Design decisions, and remove every consumer-written class from its examples. Where the change reaches another spec, a shared utility, building-blocks, or an ADR, propose the edit for the orchestrator instead of making it. Record the revision as a dated `### Amendment, <date> (class rule)` section in the [Spec: Tooltip](27-spec-tooltip.md) and the answer here. Model: Opus 5.5.

## Answer

Model: Opus 5.5. Worked AFK (map Notes, AFK override): a `/grill-with-docs` session in which the agent played both sides, with `/domain-modeling` for the vocabulary and `/to-spec` for the revision. Spec: [specs/tooltip.md](../specs/tooltip.md), revised in place; the change list is the `### Amendment, 2026-09-28 (class rule)` section of the [Spec: Tooltip](27-spec-tooltip.md). The shared documents were read as the fixer left them.

Sources, cited as: FS = the Foundation 6.9.0 clone (`scss/components/_tooltip.scss`, `js/foundation.tooltip.js`, `docs/pages/tooltip.md`, `docs/pages/javascript.md`); NG = the Angular 22.2.x clone (`packages/core/src/render3/di.ts`, `styling/static_styling.ts`, `view/elements.ts`); BB = `building-blocks.md`; T and X = `research/out-of-scope-triage.md` and `research/out-of-scope-exclusions.md` (rows TT1 to TT11, AP3); REV, DRP, TRG, ACC, TGL = the Answers of [Re-run: Reveal spec under the class rule](110-rerun-reveal-class-rule.md), [Re-run: Dropdown spec under the class rule](118-rerun-dropdown-class-rule.md), [Re-run: Triggers (shared utility) spec under the class rule](130-rerun-triggers-class-rule.md), [Re-run: Accordion spec under the class rule](107-rerun-accordion-class-rule.md), and the resolved `specs/toggler.md` of [Re-run: Toggler spec under the class rule](109-rerun-toggler-class-rule.md); "the spec" = `specs/tooltip.md` before this revision.

### Measurements made for this ticket

Under `D:/tmp/nfs-wave-119/` (not committed; no junction, no server):

- `ratio.mjs`, the exact WCAG relative-luminance formula with `Math.pow`, unrounded, with a 21:1 black-on-white control: tip text `#fefefe` on `#0a0a0a` is 19.6304:1; the `.has-tip` border `#8a8a8a` is 3.4230:1 on `#fefefe` and 3.4522:1 on `#ffffff`. No verdict changes (1.4.3 passes; 1.4.11 is stated for reference only).
- `exclude-probe.ts` and `exclude-control.ts`, `tsc --noEmit --strict` with the repository's TypeScript 5.9.3: `Exclude<string, 'tooltip' | 'has-tip' | 'top' | ...>` accepts `'top'` (exit 0), so TypeScript cannot type "any class except the tip's own"; the control, a closed union given `'app-tip'`, fails with TS2322, so the compiler was checking.
- Read, not run: `injectAttributeImpl` returns `tNode.classes` for `'class'` (NG `di.ts:346-347`), which `computeStaticStyling` fills from `tNode.mergedAttrs` (NG `view/elements.ts:62`, `static_styling.ts:26-51`): the template's static classes merged with every directive's static host classes. So check 6 sees `has-tip`, `button`, and the consumer's copies together; no library directive binds a position name statically, so only a copy can match.

### Grilling record

Round 1 (nothing settled yet): which classes exist, and what did the spec leave to the consumer?

1. **Which classes does Foundation's Tooltip define or read?** FS `_tooltip.scss`: `.has-tip`, `.tooltip`, `.tooltip.top|bottom|left|right`, and `.align-top|bottom|left|right|center` on the tip; nothing else, and no Sass map or palette. FS `foundation.tooltip.js:71-79` also reads `top|left|right|bottom` from the trigger's `className` with `\b(...)\b` for `position: 'auto'`; FS `:106` builds the tip from `tooltipClass` plus `templateClasses`; FS `:65` adds `triggerClass`. Settled.
2. **What did the spec leave to the consumer?** The legacy position classes on the trigger (user story 6, the mapping row, the `position` delta, D9, `tooltip--legacy-position-class`, the browser-level "Legacy class" case, the pure-logic parser, a usage example); `class="button clear"` and `class="button tiny hollow"` in two examples; `class="dropdown-pane"` in one (DRP asks it gone); a consumer CSS recipe selecting `.tooltip.nfs-fade-in, .tooltip.nfs-fade-out` (BB 1.1's recipe rule forbids it); and `templateClasses` with no limit on what it names (ADR 0039's follow-up names it for revision). Every Structural class was already a static host class, and the pip and Motion classes were already host bindings of the tip. Settled.
3. **Is any Tooltip class a Variant class?** No. The pip classes are the resolved Placement: a collision can flip them at run time, so they are State classes (the Dropdown's `has-position-*` precedent, DRP Q3). `position` and `alignment` are Foundation's `data-position` and `data-alignment`: typed names (`NfsPosition`, `NfsAlignment`) that the Positioner maps to those classes, which is what ADR 0039's follow-up asks of an input that selects a class. Retyping them as Variant inputs would remove their Defaults token slots (ADR 0040: a Defaults token never holds a Variant default), a behaviour change the ticket forbids (REV Q6's `overlay` reasoning). So no Variant input, registry, alias, Variant property, or Runtime check request. Settled (decision 1).

Round 2 (depends on 1 to 3): the legacy classes and `templateClasses`.

4. **The legacy position classes: read, drop, or report?** BB 1.4's initial-state rule names "the Tooltip's legacy position classes" among the reads each re-run applies the rule to, and DRP D5 and D27 dropped the Dropdown's twins. For keeping the read: Foundation's docs examples ("Tooltip Top", "Right and Left") keep working unchanged. Against: it is a Foundation class in consumer markup and a second spelling of `position`, which ADR 0039 rules out; the classes style nothing on the trigger (FS `_tooltip.scss` has no `.has-tip.top`); and Foundation's pattern matches `top-bar`. Settled: not read; `auto` resolves to `top`, Foundation's fallback; a copied one is reported in development, naming the `position` value (check 6), with a whole-token match, from a development-only `HostAttributeToken('class')` field initialiser (ACC decision 6's mechanism). Decision 2.
5. **Is `position="top"` itself a Foundation class name in an input value?** No: it is Foundation's Option value, a closed typed name the directive maps (through the Positioner, which may flip it) to the tip's class, exactly the "typed names that the directive maps to its classes" of ADR 0039's follow-up; the Dropdown pane writes `position="top"` the same way. Settled.
6. **`templateClasses`: what may it take, and how is that enforced?** ADR 0039's follow-up keeps it "for application classes". Options: (a) keep a plain string and document the rule; (b) type it to reject Foundation classes; (c) the Motion inputs' dot form (REV decision 3); (d) a development check against every Foundation class; (e) (a) plus filtering and reporting the classes that would break the tip. (b) fails: TypeScript has no "string except these" (measured above), and a closed union of application classes would need a Variant registry that no Sass setting fills. (c) adds nothing: the dot marks the consumer's classes apart from Motion names, and `templateClasses` has no name form; Foundation's `data-template-classes` is plain, and the Dropdown's `parentClass` and the Toggler's `toggler` each keep their Foundation Option's format. (d) needs Foundation's class list in the development bundle (DRP Q9). Between (a) and (e): a pip class there fights the Positioner's binding (`templateClasses="bottom"` on a `top` tip gives its one pip the rules of both sides) and an `nfs-` Motion class fights the phase, silently, in production. Settled: (e). The tip leaves out the classes of Foundation's `foundation-tooltip` mixin (`tooltip`, `has-tip`, the four positions, the five `align-*`) and every `nfs-` class in every build, through one pure filter, and development check 7 reports each at the first render; other Foundation classes are documented as not allowed. The TGL check 3 precedent warns on `is-` and `nfs-` names; `is-` is not taken here, because an application's own `is-*` class on the tip breaks nothing and filtering it would drop the consumer's class in production. Decision 3.
7. **Does the Tooltip have a Motion Option, which would need the shared Motion name types?** No. Foundation's Tooltip has only `fadeInDuration`/`fadeOutDuration` (dropped, TT8); the tip binds the library's `nfs-fade-in`/`nfs-fade-out` itself, so no library class name reaches consumer code and the REV types do not apply. A Motion Option would be new API with no Foundation counterpart. Settled: Out of Scope, `scope-boundary` (decision 4).

Round 3 (depends on 4 to 7): recipes, examples, stories, tests.

8. **The 150 ms recipe?** BB 1.1 (ACC proposal 2): a consumer CSS recipe selects elements, attributes, or the consumer's own classes. The tip is not consumer-authored, so the recipe goes through `templateClasses`: an application class on every tip from the Defaults token, `.app-tip { animation-duration: 150ms; }` after `@include nfs-motion;`, and the same selector at `1ms` under `prefers-reduced-motion: reduce`. The mixin's rules are `.nfs-<name> { animation: ... }` at one class (Sass packaging decision 16), so equal specificity and source order decide, and the measured completion follows. Rejected: selecting the internal `nfs-tooltip-tip` tag (it would make an internal element public API); an `nfs-tooltip` duration mixin (library CSS for what one consumer rule does). Settled (decision 5).
9. **Examples and stories?** Triggers are plain buttons or `nfsButton` with `size` and `fill` (the Button re-run's names); the Dropdown pane example drops its class (DRP's request); the docs' `class="right"` example becomes `position="right"`. The Rendered HTML adds an application-class tip and one block of copied Foundation markup, the only class in consumer markup, shown on purpose (DRP decision 1's practice). Story `tooltip--legacy-position-class` has lost its scenario; it becomes `tooltip--term-positions`, Foundation's two docs examples as defined terms with `position` (no other document names the old id). `tooltip--button` and `tooltip--external-trigger` assert the hosts' class lists, the latter proving the tooltip writes no class on its Trigger. Settled (decisions 6 and 7).
10. **Tests?** Layer 2: a Classes case, the legacy classes not read, check 6 (whole tokens, production reads nothing), the `templateClasses` filter and check 7, seven development warnings in all. Layer 3: the SSR fixture writes no `class`; the legacy parser gives way to the whole-token matcher and the filter. Layer 4: fixture routes and args write no class; containing blocks are inline styles. Settled (decision 7).
11. **Rendering modes?** Unchanged. `.has-tip` is a static host class in server HTML; check 6's read is DI (safe on the server) and its warning waits for the client callback; the tip, and so `templateClasses`, exist only on the client. Settled.
12. **Triggers?** The tooltip writes no class on a Trigger (TRG D18): `.has-tip` sits on its own host, which is not its Trigger (`skipSelf`), even when that element is another Openable's Trigger. Settled.
13. **Out-of-scope categories, and does anything come back into scope?** Each kept item gets its X category (TT1 to TT10 as X rated them); `tooltipClass` and `triggerClass` become `superseded` (X had TT11 as `variant-as-class`, but neither names a look: both are Structural class names the directive now binds, and ADR 0039 bars class names as input values); the dropped legacy read is `superseded`; "Library CSS" leaves Out of Scope (the plugin has none, a fact rather than an exclusion); "A Motion Option on the tooltip" joins it. Nothing returns to scope: no item was excluded for being CSS-only, and no Foundation class is left for the consumer. The Design-decisions rows that exclude a Foundation feature or Option (D5, D6, D9, D14, D15, D18, D23) name the category in their Rationale; design alternatives that are not Foundation items carry none, which is how this ticket reads "a rejected Design-decisions row". Settled (decision 8).
14. **Glossary or ADR?** No ADR: every decision applies ADR 0039, ADR 0040, or BB 1.4, and the one real choice (filtering in `templateClasses`) is small and additive to reverse. Glossary: the specs of this wave say "the consumer's own class", "the developer's own class", and "application class" for one idea on which three inputs and the Motion dot form now turn; `/domain-modeling` asks for one term. **Application class** is proposed below.

The frontier is empty.

### Decisions

1. No Variant input, Variant registry, Variant property, or Runtime check request: Foundation's `foundation-tooltip` has no Variant class. The pip classes are State classes of the tip from the resolved Placement; `position` and `alignment` stay Options with Defaults token slots (spec D24).
2. The legacy `top`/`bottom`/`left`/`right` classes on the trigger are not read; `position: 'auto'` resolves to `top`; development check 6 reports a copied one once per class, naming the `position` value, by whole-token match on a development-only `HostAttributeToken('class')` read (spec D9 rewritten).
3. `templateClasses` stays a plain string of the application's own classes. The tip leaves out every class of Foundation's `foundation-tooltip` mixin (`tooltip`, `has-tip`, `top`, `bottom`, `left`, `right`, `align-top`, `align-bottom`, `align-left`, `align-right`, `align-center`) and every `nfs-` class in every build; development check 7 reports each; other Foundation class names are documented, not checked (spec D7 rewritten).
4. No Motion Option: the tip binds `nfs-fade-in`/`nfs-fade-out` itself, so the shared Motion name types do not apply (Out of Scope, `scope-boundary`).
5. The Foundation-duration recipe selects an application class given to every tip through `nfsTooltipDefaultsToken`'s `templateClasses`, never `.tooltip` or a library class (spec D25).
6. No example, story, test host, or fixture writes a Foundation or library class, except the one Rendered HTML block of copied markup and the browser-level cases that feed copies on purpose: `nfsButton fill="clear"`, `nfsButton size="tiny" fill="hollow"`, `<div nfsDropdownPane #account="nfsDropdownPane">`, `position="right"` (spec D26).
7. Story `tooltip--legacy-position-class` becomes `tooltip--term-positions`; `tooltip--button` and `tooltip--external-trigger` assert class lists; layer 2 adds the class cases and checks 6 and 7; the SSR fixture writes no `class`; pure logic tests the whole-token matcher and the filter (spec D27).
8. Out of Scope, Dropped options, and the excluding Design-decisions rows carry X categories; `tooltipClass` and `triggerClass` are `superseded`; nothing comes back into scope.
9. Contrast figures use the exact formula: 19.63:1 for the tip text, 3.42:1 (3.45:1 on white) for the `.has-tip` border; no verdict changes.
10. The tooltip writes no class on any Trigger (TRG D18, inherited).
11. User stories 6 and 13 rewritten; 43 to 46 appended; D5, D6, D7, D9, D14, D15, D18, D23 revised; D24 to D27 added. Behaviour, ARIA, keyboard, rendering modes, and every other Story id unchanged.

### Triage

Rated per the map's triage rule.

| Item | Impact | Confidence | Outcome and evidence |
| --- | --- | --- | --- |
| Legacy classes not read; `auto` is `top`; check 6 (decision 2) | MEDIUM: changes where migrated `class="right"` markup places the tip, which a development warning reports; additive to reverse | HIGH: BB 1.4 names the Tooltip's legacy classes; ADR 0039; DRP D5 and D27 made the same change; FS `:71-79` | DECIDED |
| `templateClasses` for application classes, filtered and reported (decision 3) | MEDIUM: an Option's contract, named in ADR 0039 | HIGH: ADR 0039's follow-up text; the `Exclude` probe rules out a type; DRP Q9 rules out a full-list check; the filter covers only classes the tip binds itself or the library's namespace | DECIDED |
| No Variant input; `position`/`alignment` stay Options (decisions 1, 4) | LOW: no API change | HIGH: FS `_tooltip.scss` has no Variant class; ADR 0040 on Defaults tokens; REV's `overlay` precedent | DECIDED |
| Recipe through `templateClasses` (decision 5) | LOW: documentation | HIGH: BB 1.1; Sass packaging decision 16 gives the rule shape | DECIDED |
| Examples, stories, tests, the Story id rename (decisions 6, 7) | LOW | HIGH: ADR 0039; the Storybook conventions' class-rule note; no other document names the old id | DECIDED |
| Categories, contrast restatement, Triggers (decisions 8 to 10) | LOW | HIGH: X rows; the exact-formula measurement; TRG D18 | DECIDED |

Nothing is OPEN FOR HUMAN, and no prototype is needed: the one fact a decision depends on (that no type can exclude the tip's classes) was measured here.

### Proposed shared-file changes (for the orchestrator)

1. `building-blocks.md` 1.4, the Dropped options bullet: replace

   "(Tooltip keeps `templateClasses`: the consumer does not author the tip, so it is the only per-tooltip class hook)"

   with

   "(Tooltip keeps `templateClasses` for the consumer's own classes only: the consumer does not author the tip, so it is the only per-tooltip class hook; the tip leaves out a class it binds itself or a library `nfs-` class and reports it in development, [Spec: Tooltip](issues/27-spec-tooltip.md), D7)"

2. `building-blocks.md` 1.4, the initial-state bullet: replace "the Tooltip's legacy position classes," with

   "the Tooltip's legacy position classes (dropped by the [Re-run: Tooltip spec under the class rule](issues/119-rerun-tooltip-class-rule.md), which resolves `position: 'auto'` to `top` and reports a copied one instead of reading it),"

3. `building-blocks.md` Table A, the Tooltip row, first cell: replace "`[nfsTooltip]` on the trigger (text from" with "`[nfsTooltip]` on the trigger, binding `.has-tip`, with no Variant input (text from", and replace "internal `NfsTooltipTip` (`.tooltip`, `aria-hidden="true"`)" with "internal `NfsTooltipTip` (binds `.tooltip`, its pip classes, and its Motion classes, beside the consumer's own classes from `templateClasses`; `aria-hidden="true"`)".

4. `adr/0039-directives-manage-every-foundation-class.md`, Consequences, append:

   "- 2026-09-28 ([Re-run: Tooltip spec under the class rule](../issues/119-rerun-tooltip-class-rule.md)): the Tooltip's `templateClasses` stays a plain string of the consumer's own classes, in Foundation's `data-template-classes` format. The tip leaves out any class of Foundation's `foundation-tooltip` mixin and any `nfs-` class, and reports each in development, because TypeScript has no type for "any string except these" (measured) and no Sass setting lists the consumer's classes for a registry; other Foundation class names are documented as not allowed. The Tooltip's legacy position classes on the trigger are no longer read (building-blocks 1.4)."

5. `CONTEXT.md`, Foundation side, after **Utility class**:

   ```markdown
   **Application class**:
   A CSS class the consumer defines in its own stylesheet, never a Foundation or library class; the only class a consumer writes, on its own elements or as the value of an input that applies or names one (the Toggler's `toggler`, the Tooltip's `templateClasses`, the Dropdown pane's `parentClass`, a Motion input's dot form).
   _Avoid_: custom class, own class (bare), user class
   ```

6. `map.md`, Decisions so far: the gist below.

No change to `README.md` (its Tooltip rows name no class), `storybook-conventions.md`, ADR 0001, ADR 0012, ADR 0022, or ADR 0040.

### What other specs need from this one

- [Re-run: Anchored pane (shared utility) spec under the class rule](131-rerun-anchored-pane-class-rule.md): in the Foundation contract's `position` row, "(the Tooltip spec reads its trigger's legacy class for `auto`; the Dropdown spec drops them)" becomes "(the Tooltip and Dropdown specs drop them and report a copied one in development)". The Tooltip mapping row (`autoPosition` `top`, `autoAlignment` `center`, `pip` 14 x 12) is unchanged. The exclusion row AP3 ("Legacy position classes as defaults, decided by the consumer specs") is now decided by both consumers the same way.
- [Re-run: Button spec under the class rule](128-rerun-button-class-rule.md) (resolved): the Tooltip examples write `nfsButton fill="clear"` and `nfsButton size="tiny" fill="hollow"`; if the names change, those examples follow.
- [Re-run: Dropdown spec under the class rule](118-rerun-dropdown-class-rule.md) (resolved): its request is met; the Tooltip example writes `<div nfsDropdownPane #account="nfsDropdownPane">`.
- [Re-run: Toggler spec under the class rule](109-rerun-toggler-class-rule.md) (resolved): nothing required. Its check 3 warns on `is-` and `nfs-` names in `toggler`; the Tooltip's check 7 filters and reports the tip's own classes and `nfs-` names, and not `is-` names, because on the tip an application's `is-*` class breaks nothing (grilling question 6).
- [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md): TT11 (`tooltipClass`) and `triggerClass` are recategorised `superseded`; the dropped legacy read (`superseded`) and "A Motion Option on the tooltip" (`scope-boundary`) are new rows; "Library CSS" left the Tooltip's Out of Scope. Categories are written as "Category: `<id>`" in Out of Scope, "Dropped (`<id>`)" in the contract table, and "Exclusion category of <item>: `<id>`" in Design-decisions Rationale cells.
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): check that building-blocks 1.4 lists the Tooltip's legacy classes as dropped (proposal 2); that the inputs taking the consumer's own classes (`toggler`, `templateClasses`, `parentClass`, the Motion dot form) use one term (proposal 5) and agree on which library names each reports; and that no spec's consumer CSS recipe selects `.tooltip` or an `nfs-` class.

### Gist for Decisions so far

- [Re-run: Tooltip spec under the class rule](issues/119-rerun-tooltip-class-rule.md) -- the directive already bound `.has-tip` and the tip `.tooltip`, its pip classes (State classes of the resolved Placement), and its fixed `nfs-fade-in`/`nfs-fade-out`; Foundation's tooltip has no Variant class, so no Variant input, registry, or Runtime check, and `position`/`alignment` stay Options; the legacy `top`/`left`/`right`/`bottom` trigger classes are no longer read (`auto` is `top`) and a copied one is reported in development; `templateClasses` takes only application classes, the tip leaving out its own and `nfs-` classes with a development report (no type can exclude them, measured); the 150 ms recipe selects an application class set through the Defaults token; examples use `nfsButton` inputs and a class-free `nfsDropdownPane`; `tooltip--legacy-position-class` becomes `tooltip--term-positions`; exclusions carry categories; behaviour, ARIA, keys, and rendering modes unchanged; impact MEDIUM, confidence HIGH; no ADR. Spec: [specs/tooltip.md](specs/tooltip.md).

### Amendment, 2026-09-29 (consistency review)

From [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md), phase 2 (group f), applying the coordinator's decisions ([research/consistency-review-decisions.md](../research/consistency-review-decisions.md)) and the review's checks CR-A to CR-D; `specs/tooltip.md` was revised in place. The evidence for each change is in [research/consistency-review-group-f.md](../research/consistency-review-group-f.md).

- R57: the `templateClasses` cells of the Foundation contract, the class mapping, and the API table read "Application classes"; D7's rationale gains the reason `is-` names are neither filtered nor reported (this ticket's grilling question 6, now in the spec); "the developer's own class" reads "the consumer's own class", and "the application's own class" reads "Application class".
- Development check 4 reads a name from content as accessible-name computation does: text outside `aria-hidden="true"` subtrees (it read all text content, so a trigger holding only an `aria-hidden` glyph was not reported), the reading the review decided for every such check (its R74).
- CR-B: the class mapping gains rows for the Button's classes on a trigger and the Dropdown pane's class in the usage example.
- Unchanged: R51 (the labelled check-6 input), R65, R66; CR-A, CR-C, CR-D (no component example).
- Impact LOW, confidence HIGH; nothing OPEN FOR HUMAN.

### Amendment, 2026-09-29 (checks move to a later milestone)

From [Re-run: specs without checks, group f](170-rerun-specs-without-checks-group-f.md), under [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md); `specs/tooltip.md` was revised in place. What left the spec, per check:

- Misuse warnings, to [Spec: misuse warnings (later milestone)](161-spec-misuse-warnings-later-milestone.md): checks 1 (host not interactive) and 2 (host not focusable) with CDK's `InteractivityChecker` and the interactive-host classifier; check 3 (no text); check 4 (no name of its own); check 5 (host inside a `label`); check 6 (a copied legacy position class) with its development-only `HostAttributeToken('class')` read, its matcher, and its tests; check 7 (a tip class or `nfs-` class in `templateClasses`, the report only: the filter stays, with its tests). The Render hooks row and the browser-level and pure-logic cases go with them.
- The Positioner's three warnings (same-axis alignment, negative offsets, a tip that is not `position: absolute`) are the Anchored pane spec's; the quote left, and the rules are documented usage in the `alignment` and `vOffset`/`hOffset` rows and the Sass subsection.
- Each rule is documented usage now: the Host, Name, and Classes behaviour rules, the text rule, the documented limits (`label` with `for`), the WCAG rows for 2.1.1, 2.4.11, and 4.1.2, user stories 19, 20, 43, and 44, the migration notes, and D5, D6, D7, and D9 (rewritten); the 1.4.3 row states the colour pair as a requirement.
- Mentions removed: the "no Runtime check request" clauses (class mapping, D24).
- No API, class, ARIA, rendering, or Sass change. Impact LOW, confidence HIGH; nothing OPEN FOR HUMAN.

### Amendment, 2026-09-30 (audit 0009)

- [Audit 0009: the later-milestone checks wave](../audits/0009-later-milestone-checks-wave.md), L8: `NfsTooltipDescription` gets `exportAs: 'nfsTooltipDescription'` and `NfsTooltipTip` gets `exportAs: 'nfsTooltipTip'`. The user was asked on 2026-09-30 whether the Tooltip's two internal components get an `exportAs`, and answered "Name them anyway".
