# 123. Re-run: Abide spec under the class rule

Type: grilling
Status: resolved
Blocked by: 81, 98
Labels: wayfinder:grilling
Map: ../map.md

## Question

What does the [Spec: Abide](31-spec-abide.md) become under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Revise `specs/abide.md` in place so that no consumer-written Foundation or NFS class remains: every Structural class the spec leaves to the consumer gets its directive binding, every Variant class the spec leaves consumer-written becomes a typed input by the decision above, and every State class stays or becomes a host binding. Behaviour, ARIA, keyboard, rendering modes, and tests otherwise stay as decided.

Also: form labels, help text, and `.is-invalid-*` classes follow the Forms spec.

## How to work it

Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this spec); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Then revise the spec's Solution, class mapping, API tables, Rendered HTML (server and hydrated), stories and their play functions, tests, SSR smoke, and Design decisions, and remove every consumer-written class from its examples. Where the change reaches another spec, a shared utility, building-blocks, or an ADR, propose the edit for the orchestrator instead of making it. Record the revision as a dated `### Amendment, <date> (class rule)` section in the [Spec: Abide](31-spec-abide.md) and the answer here. Model: Opus 5.5.

## Answer

Model: Opus 5.5

Spec: [specs/abide.md](../specs/abide.md), revised in place; the change list is the `### Amendment, 2026-09-27 (class rule)` section of the [Spec: Abide](31-spec-abide.md).

Sources read: ADR 0039, ADR 0040, ADR 0001, ADR 0006, ADR 0012, ADR 0022, ADR 0026, ADR 0027; the Answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md); the Answer of [Spec: Forms](98-spec-forms.md) (its five items for this re-run) and `specs/forms.md`; the Answer of [Re-run: Button spec under the class rule](128-rerun-button-class-rule.md) and `specs/button.md`; the Accordion and Smooth Scroll re-runs as precedent; `research/out-of-scope-triage.md` (the Callout and Input Group rows, the Forms placement line, "No Structural class to bind"); `research/out-of-scope-exclusions.md` (AB1 to AB13, R3); `research/foundation-component-catalogue.md` (the Abide and Forms rows); `map.md` Notes; `building-blocks.md` 1.1, 1.3, 1.4, 1.5, 1.7, 1.9, 1.10, 1.11, 1.13, 1.14, and Tables A and B; `CONTEXT.md`; `storybook-conventions.md` section 5. Foundation 6.9.0 (FS): `docs/pages/abide.md`, `scss/forms/_error.scss`, `scss/forms/_text.scss`, `scss/forms/_select.scss`, `scss/components/_callout.scss`, `scss/components/_visibility.scss`, `scss/util/_mixins.scss`, `scss/util/_color.scss`.

Measured (Dart Sass 1.93.2 over the FS `scss/` tree, a throwaway probe under `D:/tmp/nfs-wave-123/`, not committed), with Foundation's `color-luminance()` and the WCAG formula, unrounded: the required focus border `$black` (`#0a0a0a`) against the required invalid colour `#bf3f2c` 3.74:1; Foundation's default focus border `$dark-gray` against its default invalid colour `#cc4b37` 1.31:1; `$dark-gray` against `#bf3f2c` 1.53:1; a darker invalid colour `#8b1a10` against `$black` 2.31:1 (while 8.49:1 on the page and 7.09:1 on its tint, so only the new check fails it); `#bf3f2c` 5.25:1 on the page and 4.55:1 on its tint, as the spec already had; positive control `$dark-gray` against `$black` 5.73:1, the Forms spec's figure.

### Grilling log

Both sides, AFK. Each question with the answer settled on:

1. Which Foundation or library classes does the spec still leave to the consumer? `class="alert callout"` on the Form alert (consumer, server, hydrated, and Reactive markup; the mapping row said the consumer keeps them), `class="help-text"` on the hint (and a mapping row with no directive), and `class="success"` on the submit control. `.form-error` is already `NfsFormError`'s static host class; `.is-invalid-input`, `.is-invalid-label`, and `.is-visible` are already host bindings. Foundation's docs also write `.input-group` and its parts, `.button`, and static State classes, which the spec's examples did not copy.
2. Who sets the Form alert's `.callout.alert`? `nfsCallout color="alert"` written beside `nfsAbideAlert`. The other sides lose: `NfsAbideAlert` binding `.callout` and `.alert` itself would make a second directive set Callout's classes, fix the colour in Abide, and put a callout look on Foundation's own visually hidden alert (FS `abide.md:154`); hosting `NfsCallout` through `hostDirectives` would throw NG0309 for a consumer who also writes `nfsCallout` and make the Abide entry point import Callout's, the reason the [Re-run: Smooth Scroll spec under the class rule](121-rerun-smooth-scroll-class-rule.md) placed `nfsMenu` beside rather than hosted (its D13). (Spec D18.)
3. What are the Callout names? The [Spec: Callout](89-spec-callout.md) is claimed in this wave and unpublished. The spec writes `nfsCallout` (the triage's selector) with `color` (building-blocks 1.4 rule 3, `color` for a palette; FS `_callout.scss:96` loops over `$foundation-palette`) and imports it from `ngx-foundation-sites/callout`, and says the Callout spec's names replace these if they differ.
4. Does `hidden` still hide a callout? Yes: `callout-base` sets no `display` (FS `_callout.scss:50-68`), and neither does `element-invisible` behind `.show-for-sr` (FS `_mixins.scss:217-232`), so building-blocks 1.10's `.is-hidden` rule does not apply and `NfsAbideAlert` keeps `hidden` alone.
5. Is a Form alert always a callout? No: Foundation's input group example uses a visually hidden box, written `class="sr-only"`, which Foundation 6.9 does not define (FS `scss/` has only `.show-for-sr`). The spec shows `nfsAbideAlert nfsShowForSr`, the Button re-run's placeholder for the Visibility Classes directive.
6. Help text? `nfsHelpText` from the Forms entry point, with the consumer's id in the field's `aria-describedby`; `NfsAbideInput` already composes consumer ids with the visible Form errors, and the Forms spec's pairing check counts an id composed that way. No API change. (Forms item 2.)
7. A validated label with `.middle`? `nfsFormLabel middle` beside `nfsAbideLabel`; `NfsAbideLabel` does not host `NfsFormLabel` (NG0309 on a doubled match; `middle` would be spelt through two directives). (Forms item 3; spec D19.)
8. The input group case? `abide--label-for` now builds Foundation's input group with `nfsInputGroup`, `nfsInputGroupLabel`, and `nfsInputGroupField` beside `nfsAbideInput`, a `label for` linked by `[nfsAbideLabel]="amount"`, and the Form error after the group; the story asserts the linking, and the Forms spec's `forms--with-abide` owns the two-directive-set assertions. (Forms item 3 of its list.)
9. The submit control? `<button nfsButton type="submit" color="success">`, the Button re-run's `color`; the server HTML keeps the static `color` attribute (Button spec, Notes), and the Button's required palette makes `success` pass.
10. Does Abide have Variant classes? No. Its classes are one Structural class and three State classes; the Variant classes in its examples are Callout's, Forms', and Button's. So no Variant input, registry, Variant property, or Runtime check report, and the Sass subsection's item 6 says so.
11. Copied State classes? Foundation's docs write `class="is-invalid-label"`, `class="is-invalid-input"`, and `class="form-error is-visible"` to show the error look (FS `abide.md:131-141`, `:220-227`). Each is stripped by a binding that is always `true` or `false`. building-blocks 1.4's initial-state rule asks each directive that binds a Foundation class dynamically to read its static `class` through `HostAttributeToken` in development builds only and warn once; Abide's three do. No input exists to name, so the message names the directive and says to remove the class. A redundant `form-error` merges with the static host class. The other side (no check) leaves migrating markup silently without its error look. (Spec D20.)
12. The resting `@warn` checks? Moved to `nfs-forms` as `@error` (Forms D11: the resting look is every form's, and a warning is easy to scroll past); `nfs-abide` keeps `$input-error-color`, `$form-label-color-invalid`, and `$input-background-invalid`. The required settings table keeps Abide's three and points to the Forms spec for `$input-placeholder-color`, `$input-border`, and the added `$input-border-focus: 1px solid $black`. (Forms item 4; spec D15.)
13. Does `nfs-abide` include `nfs-forms`? No. ADR 0012 has the consumer write one Library mixin include after each matching Foundation include, every Abide form's fields come from `foundation-forms`, whose Library mixin is `nfs-forms`, and including it inside `nfs-abide` would hide a dependency and run the checks twice for a consumer who writes both. An Abide form includes both. (Spec D22.)
14. The caret sentence? It holds for text inputs only (Forms item 5). A select has no caret, so its indicator is the focus border. For an invalid select there is one more pair: FS `_error.scss:45` applies the invalid border and tint only under `:not(:focus)`, so focus swaps the invalid border for the focus border. Measured 3.74:1 with the required values, 1.31:1 on Foundation's defaults, 1.53:1 with Abide's settings and Foundation's focus border. The spec adds an `@error` in `nfs-abide`, the `$input-border-focus` colour at least 3:1 from `$input-background-invalid`, the 1.4.1 lightness rule the Forms and Button specs apply, `@error` because the pair carries state (building-blocks 1.10). The other side (state the ratio and add no check) would give a consumer with a darker invalid colour, such as `#8b1a10` at 2.31:1, no signal, against ADR 0022. This is the one addition beyond the class rule and the Forms items. (Spec D21; WCAG 1.4.1 and new 2.4.7 rows.)
15. Which tests change? `abide--label-for` (item 8); `abide--submit` asserts the callout classes beside `hidden`; `abide--invalid-state-contrast` drops the resting placeholder and border (owned by `forms--field-contrast`) and adds a focused invalid select; layer 2 adds the Form alert beside `nfsCallout` and the copied State class cases; the SSR smoke asserts the neighbours' classes; the Sass compile case follows item 12 and 14; the e2e contrast case focuses the select with `focus()` in WebKit, as the Forms spec does. Story ids unchanged (13). No story, host, or fixture writes a class except the copied-class case.
16. Rendering modes? Unchanged. The neighbours' classes are their host bindings and render on the server; the only new read before the first render callback is the static `class` attribute in development builds, which writes nothing.
17. Glossary? **Form error** still calls the element "consumer-written"; the Forms spec's proposal rewords it for the class rule (below). No new term: Callout, Help text, and Form label are the other specs' terms.
18. ADR? None. Placing directives side by side is a standing preference, and the Form alert, help text, and label decisions apply ADR 0039 and the Forms spec's D4 and D5; nothing here is both hard to reverse and a new trade-off.

### Decisions

1. No API member, default, selector, output, or Story id changes. The five Abide directives bind the same classes and ARIA as before.
2. Every class the spec's examples wrote now comes from a directive written beside the Abide directives, never hosted by them: `nfsCallout color="alert"` on the Form alert, `nfsHelpText` on help text, `nfsFormLabel middle` beside `nfsAbideLabel`, `nfsInputGroup` and its parts with `nfsInputGroupField` beside `nfsAbideInput` and the Form error after the group, and `nfsButton color="success"` on the submit control. The Abide entry point imports none of them.
3. `NfsAbideAlert` binds no class and keeps `hidden` alone; a visually hidden alert takes the Visibility Classes directive for `.show-for-sr`.
4. Abide has no Variant family: no Variant input, registry, Variant property, or Runtime check report.
5. `NfsAbideInput`, `NfsAbideLabel`, and `NfsFormError` report a copied static `is-invalid-input`, `is-invalid-label`, or `is-visible` once in development builds through `HostAttributeToken('class')`, read only there; a redundant `form-error` is not reported.
6. `nfs-abide` checks only the invalid state, all `@error`: the three invalid-state settings as before, plus the `$input-border-focus` colour at least 3:1 from `$input-background-invalid`. The resting checks are `nfs-forms`'s. An Abide form includes both mixins; `nfs-abide` does not include `nfs-forms`.
7. Required settings: Abide's three for the invalid state; the Forms spec's three (`$input-placeholder-color: #737373`, `$input-border: 1px solid $dark-gray`, `$input-border-focus: 1px solid $black`) listed with a pointer; the caret sentence now says text inputs only.
8. Tests as in grilling item 15.

### Triage

| Item | Impact | Confidence | Evidence | Outcome |
| --- | --- | --- | --- | --- |
| Neighbouring directives beside, not hosted (2, 3) | MEDIUM: the markup of every validated form | HIGH: ADR 0039, the composition preference, the Forms spec's D4 and D19 reasoning, the Smooth Scroll re-run's D13, FS callout Sass | NG0309 on a doubled match | Decided |
| Callout names `nfsCallout`, `color`, `ngx-foundation-sites/callout` (2) | LOW: example text | NOT HIGH: the Callout spec has not published | The triage's selector; building-blocks 1.4 rule 3 | Decided as placeholders; the Callout spec's names replace them |
| No Variant family (4) | LOW | HIGH: FS `_error.scss` | | Decided |
| Copied State class check (5) | LOW: development only | HIGH: building-blocks 1.4; the Accordion's dev check 7 | | Decided |
| Resting checks to `nfs-forms` as `@error`, two includes (6) | MEDIUM: consumers on Foundation's resting defaults now stop compiling | HIGH: the Forms spec's D11; ADR 0012 | `@error` to `@warn` is a one-line change | Decided |
| Focus border against the invalid border, `@error` (6) | LOW: an additive compile check | HIGH: measured; FS `_error.scss:45`; the Forms and Button 1.4.1 rule | | Decided |

Nothing is OPEN FOR HUMAN, and no prototype is needed: every point is measured, read at its source, or decided by an accepted ADR or the Forms spec.

### Proposed shared-file changes (for the orchestrator)

1. `building-blocks.md`, Table A, the Abide row (`:250` at the time of reading): replace the whole row with:

   "| Abide | `form[nfsAbide]`; `[nfsAbideInput]` on `input`/`select`/`textarea` next to `[formField]`; `label[nfsAbideLabel]`; `[nfsFormError]`, which binds `.form-error`; `[nfsAbideAlert]` on the Form alert element (Foundation's `[data-abide-error]`), with `nfsCallout color="alert"` beside it for Foundation's look; links: the enclosing `nfsAbideLabel` (DI) or a typed template reference; a custom `FormValueControl` links through its wrapping label only (the [Prototype: Abide control kinds, value adoption, and the ready gate](issues/66-prototype-abide-controls-and-ready.md)); no DOM lookup | Directives on the consumer's form elements; the Forms directives (`nfsFormLabel`, `nfsHelpText`, the input group parts), `nfsCallout`, and `nfsButton` sit beside them and are never hosted ([ADR 0039](adr/0039-directives-manage-every-foundation-class.md)) | Custom Angular on Signal Forms (ADR 0006): the platform's Constraint Validation is not what Signal Forms uses (`R:angular` Signal Forms native validation note); no Aria or CDK pattern | `@angular/forms/signals` `form()`, `FormField`, `FORM_FIELD` self-injection; `NgControl` self-injection as courtesy; `_IdGenerator` for error ids; `linkedSignal`; `HostAttributeToken` (`'role'`; `'class'` in development builds only, for copied State classes); the exported `nfsPatterns`/`nfsEqualTo`; a checks-only `nfs-abide` Library mixin (no CSS) for the three invalid-state settings and the focus border against the invalid border; the resting field's checks are `nfs-forms`'s | No APG pattern (`R:apg` Abide); names-and-descriptions practice: `aria-describedby` to `.form-error`, `aria-invalid`, `role="alert"` on the form-level error |"

2. `building-blocks.md` 1.10, new bullet after the Forms bullet (`:155`):

   "- Abide ([Spec: Abide](issues/31-spec-abide.md)): `nfs-abide` checks only the invalid state, each with `@error`: `$input-error-color` and `$form-label-color-invalid` at 4.5:1 on the page, `$input-background-invalid` at 4.5:1 on its 10% tint and 3:1 on the page, and the `$input-border-focus` colour at 3:1 from `$input-background-invalid`, because Foundation's `form-input-error` applies only while the field is not focused, so a focused invalid select shows the focus border in place of the invalid one (3.74:1 with the required `$input-border-focus: 1px solid $black`, 1.31:1 on Foundation's defaults). The resting field's checks are `nfs-forms`'s, and an Abide form includes both mixins."

3. `CONTEXT.md`, **Form error** (`:283-285`): replace the definition line with:

   "A message element (`.form-error`, bound by `nfsFormError`) tied to one field and, optionally, to one error kind, shown only while that field's errors are shown."

   The _Avoid_ line stays as the Forms spec's proposal left it ("hint (which is Help text)").

4. `storybook-conventions.md` section 5: the Forms spec's proposal 7 already splits the Abide block. In its first (Forms) block, replace the comment line "// Spec: Forms, forms--field-contrast and forms--select; also Abide, abide--invalid-state-contrast." with "// Spec: Forms, forms--field-contrast and forms--select; also Abide, abide--invalid-state-contrast (a focused invalid select, 3.74:1 from the invalid border)." If the block is not applied yet, apply the Forms proposal with this line.

5. `specs/forms.md` (for the orchestrator or the consistency review):
   - `:306`, replace "Beside Abide (the Abide directives as the [Spec: Abide](../issues/31-spec-abide.md) defines them; its re-run may rename parts of that API, and this example follows it):" with "Beside Abide (the Abide directives as the [Spec: Abide](../issues/31-spec-abide.md) defines them; its class-rule re-run renamed nothing):".
   - Sass subsection item 2, replace "The first two settings are also required by the [Spec: Abide](../issues/31-spec-abide.md), whose invalid-state settings stay its own." with "The [Spec: Abide](../issues/31-spec-abide.md) points here for all three and keeps its invalid-state settings; its `nfs-abide` also checks this focus border against the invalid border (3:1), because a focused invalid select shows the focus border in place of the invalid one."

6. No ADR change, no README change (the Abide index row's level and prototypes are unchanged), no new glossary term.

7. `map.md`, Decisions so far: the line below.

### What other specs need from this one

- [Spec: Callout](89-spec-callout.md): `nfsCallout` sits beside `nfsAbideAlert` on the Form alert, written `nfsCallout color="alert"` in the Abide spec until you publish; if your selector, input, or entry point differ, the Abide examples change. `NfsAbideAlert` binds `hidden` and `role` on that host, so your directive must bind neither, nor `aria-live`, by default (the triage's "no default live role"), and must not rely on being shown at first render. `hidden` hides a callout only while `callout-base` sets no `display`; a `display` rule would need `.is-hidden` (building-blocks 1.10). The alert's 16.2:1 text contrast is measured on `$foundation-palette`'s alert.
- [Spec: Visibility Classes](104-spec-visibility-classes.md): a visually hidden Form alert is `nfsAbideAlert` with your `.show-for-sr` directive (written `nfsShowForSr`); `hidden` must still hide it, which holds while `element-invisible` sets no `display`.
- [Spec: XY Grid](99-spec-xy-grid.md): the Abide usage example uses the placeholders `nfsGridX` and `nfsCell size`, as the Forms spec does.
- [Spec: Forms](98-spec-forms.md): the two text edits in proposal 5; Abide renamed nothing, so the Forms spec's Abide examples hold; `nfs-abide` no longer checks the placeholder or the resting border.
- [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md): Abide adds no registry to the manifest.
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): replace the placeholders `nfsCallout`, its `color`, `ngx-foundation-sites/callout`, `nfsShowForSr`, `nfsGridX`, and `nfsCell` in the Abide spec; `nfs-abide` and `nfs-forms` both read `$input-border-focus` but check different pairs (against the invalid border, and against the page, the focus background, and the resting border), so the "no two mixins check one pair" check passes.

### Gist for Decisions so far

- [Re-run: Abide spec under the class rule](issues/123-rerun-abide-class-rule.md) -- the five directives already bound `.form-error` and the State classes, so no API changes; the classes the examples still wrote come from their own directives written beside Abide's and never hosted (`nfsCallout color="alert"` on the Form alert, `nfsHelpText`, `nfsFormLabel middle`, the input group directives with the Form error after the group, `nfsButton color="success"`); a copied static State class is reported in development; the resting contrast checks move to `nfs-forms` as `@error`, and `nfs-abide` adds a check that a focused invalid select's focus border is 3:1 from the invalid border (3.74:1 required, 1.31:1 on Foundation's defaults), since the caret argument holds for text inputs only; impact MEDIUM, confidence HIGH. Spec: [specs/abide.md](specs/abide.md).
