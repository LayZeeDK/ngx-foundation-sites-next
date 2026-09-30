# 98. Spec: Forms

Type: grilling
Status: resolved
Blocked by: 81
Labels: wayfinder:grilling
Map: ../map.md

## Question

What Angular directives (preferred) or components give Foundation for Sites 6.9's Forms to the next, from-scratch ngx-foundation-sites repo, under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Foundation's docs page is `docs/pages/forms.md` and its Sass is `scss/forms/_forms.scss and the other files under forms/` in the 6.9.0 clone. Publish `specs/forms.md`.

Known from the triage: One spec for the Forms docs page: Input Group (a labelled-field check, since Foundation's own example fails axe `label`), Help Text, form labels and their Variants (`.middle`), fieldsets, selects, checkboxes, radios, and text inputs; how these directives sit beside the Abide directives on the same elements.

## How to work it

Run `/grill-with-docs` (self-grilling, both sides) over the questions this component raises, then publish with `/to-spec` in the map's spec shape; the [Spec: Button](37-spec-button.md) is the nearest precedent. Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this component); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Cover: one directive per Structural class and what else each owns (the ARIA, `type` default, or development and compile-time checks the documented markup lacks for WCAG 2.2 AA, ADR 0022); every Variant as a typed input by the decision above; State classes as host bindings; the Sass mixin only where custom CSS or checks are needed (ADR 0012); the rendering-mode contract; stories with play functions and axe; e2e only where Storybook cannot reach. Record the decisions in this ticket's Answer, and propose shared-file changes (a building-blocks row, glossary terms) for the orchestrator. Model: Opus 5.5.

## Answer

Model: Opus 5.5

Spec: [specs/forms.md](../specs/forms.md).

Sources read: ADR 0039, ADR 0040, ADR 0001, ADR 0012, ADR 0022; the Answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md); `research/out-of-scope-triage.md` (the Input Group, Help Text, Fieldset row, its dissent, the "No Structural class to bind" line, and B4); `research/foundation-component-catalogue.md` (the nine Forms rows); `research/out-of-scope-exclusions.md` (no Forms-specific row; B4 and AB rows); `map.md` Notes; `building-blocks.md` 1.1 to 1.14 and Tables A, B, and D; `CONTEXT.md`; `storybook-conventions.md`; the [Spec: Button](37-spec-button.md) and [Spec: Abide](31-spec-abide.md) specs; Foundation 6.9.0's Forms and Abide docs pages and every forms partial; Angular 22.2.x's duplicate-directive check; Material 22.2.x's form-field hint and prefix directives; the WCAG 2.2 Understanding documents for 2.4.7 and 1.4.11 (the w3c/wcag sources, fetched raw from GitHub after markdown.new hit a Cloudflare challenge).

Measured (Dart Sass 1.93.2 over the Foundation 6.9.0 clone, throwaway files under `D:/tmp/nfs-wave-98/`, not committed): with Foundation's `color-luminance()` and the WCAG formula, unrounded, on the default `#fefefe` backgrounds: placeholder `#cacaca` 1.63:1; field border `#cacaca` 1.63:1; focus border `#8a8a8a` 3.42:1 against the page and the focus background, 2.11:1 from Foundation's resting border and 1:1 from the `$dark-gray` resting border the Abide spec requires; `$select-triangle-color` 3.42:1; `#737373` placeholder 4.70:1; `$black` focus border 19.63:1 against both, 5.73:1 from `$dark-gray`; label and help text 19.63:1; input group label 15.86:1. A throwaway sketch of the `nfs-forms` checks failed Foundation's defaults on three settings, failed the Abide spec's five settings on the focus border alone, and passed the three required settings with no CSS emitted.

### Grilling log

Both sides, AFK. Each question with the answer settled on:

1. Which elements on the Forms page get a directive? The six Structural classes (`.input-group`, `.input-group-label`, `.input-group-field`, `.input-group-button`, `.help-text`, `.fieldset`) get one each, and the form `label` gets one for its `.middle` Variant. Text inputs, `textarea`, `select`, checkboxes, radios, file inputs, bare `fieldset` and `legend` get none: styled by tag or type (ADR 0039).
2. The triage research listed "the form `label` and its `.middle` Variant" under "No Structural class to bind". Does the label still get a directive? Yes. ADR 0040's consequence (an element Foundation styles by tag gets a directive once Foundation gives it a Variant class) came after the triage, and `label.middle` is exactly that case; without a directive the consumer would write `.middle`, which ADR 0039 forbids.
3. What is the label directive called? `NfsFormLabel`, `label[nfsFormLabel]`, from Foundation's `form-label` mixin and `$form-label-*` settings. `NfsLabel` belongs to the Label component (`.label`); the other side (`nfsLabel` on form labels) would collide with it.
4. How is `.middle` typed? A boolean `middle` through `nfsVariantBoolean` (building-blocks 1.4 rule 4), default `false`, which sets no class; closed family, no registry, no Variant property.
5. Who binds `.is-invalid-input`, `.is-invalid-label`, `.form-error`, and `.is-visible`? Abide's directives, as now. Foundation documents them on the Abide page and leaves the error partial out of the Forms page's Sass. The other side (`NfsAbideLabel` hosting `NfsFormLabel` so a validated label needs one attribute) loses: a consumer who also writes `nfsFormLabel` matches the directive twice, which Angular 22.2 rejects (`assertNoDuplicateDirectives`, NG0309), and `middle` would be spelt through two directives. A Forms label reading field state through a token couples Forms to validation. The two sets sit beside each other; neither imports the other.
6. How is help text paired with its field? The consumer writes the id and the field's `aria-describedby`, as Foundation's docs prescribe; `nfsHelpText` checks the pairing in development mode. The accessibility lens's alternative (help text registering with its field) works only where the field has a directive: Abide's input can compose ids, a native field has no directive to bind the attribute, and writing it from the help text would be a DOM write on another host and a second writer of `aria-describedby`.
7. What does the labelled-field check accept? An associated label (`labels`), an `aria-labelledby` that resolves, or a non-empty `aria-label`. Not a placeholder (it disappears on input, 3.3.2), a `title`, or the prefix text.
8. Should the input group add ARIA to its prefix? No. The field's `aria-describedby` belongs to the consumer and Abide; `aria-hidden` on the prefix would hide the only unit when the label omits it. The examples put the unit in the label ("Amount in dollars").
9. Does the input group need a parent token? No: its Sass is child and descendant selectors (the triage's Button Group reasoning); a part outside a group only looks unjoined.
10. Which selectors are element-restricted? The field (`input`, `select`, `textarea`, as `NfsAbideInput`), `.fieldset` (`fieldset`, so the box always has group semantics), and `.middle` (`label`, Foundation's `label.middle`). The other four take any element.
11. Is `.fieldset` a Structural class or a Variant of a tag-styled `fieldset`? Structural: Foundation calls it the class that holds a fieldset's styles. No `legend` check: every documented fieldset has one, axe has no rule, and a check is additive later.
12. Which WCAG 2.2 AA failures do Foundation's form defaults have? Measured: placeholder 1.63:1 (1.4.3), field border 1.63:1 (1.4.11), and, once the border is fixed to `$dark-gray`, a select menu (and a colour input) with no text caret whose only focus change is Foundation's 1.63:1 glow (1.4.11 for focus indicators, 2.4.7). The Understanding document for 1.4.11 accepts the caret for text inputs, which is why the Abide spec's reasoning held for text inputs but not for selects. Required settings: `$input-placeholder-color: #737373`, `$input-border: 1px solid $dark-gray`, `$input-border-focus: 1px solid $black`.
13. How is the focus border's difference from the resting border judged? At least 3:1 in luminance, the 1.4.1 lightness rule the Button spec applies to its disabled state. The Understanding document says 1.4.11 does not compare the two states, so 1.4.1 is where the rule comes from; without some difference a select has no indicator at all.
14. `@error` or `@warn`? `@error`, as Button's label checks. The Abide spec chose `@warn` for these two resting pairs; the defaults fail by a wide margin, and a warning is easy to scroll past. The resting checks move from `nfs-abide` to `nfs-forms`.
15. What does the File Upload Button section become? The native `<input type="file">` with its own label: keyboard operable, the browser's focus ring, the chosen file shown. Foundation's recipe puts focus on a clipped 1 px input (2.4.7). Whether `nfsButton` takes `label` hosts is the Button re-run's (B4).
16. Do text inputs, selects, checkboxes, or radios need a directive for a check? No. Checkboxes, radios, and file inputs keep the browser's focus ring; their size is the user agent's (the 2.5.8 exception); axe `label` and `select-name` cover them in stories.
17. Forced colours for the select arrow? Unmeasured; the select stays identifiable by its border and text. No rule now (LOW impact, additive).
18. How are the grid and text alignment written in examples? With the XY Grid and Typography Helpers directives, whose names are not published yet; the spec uses placeholders (`nfsGridX`, `nfsCell size`, `nfsTextAlign`) and says so, for the consistency review to replace.
19. Rendering-mode contract? Static host classes and one host class binding; no listeners, no DOM writes, no timers; development checks in `afterNextRender` only when `ngDevMode` is on. Server HTML equals the hydrated DOM; `hydrate never` works natively.
20. Does the entry point declare a Variant registry or write Variant properties? No: the page has no Open Variant family, so `nfs-forms` is checks-only.

### Decisions

1. Seven attribute directives in `ngx-foundation-sites/forms`: `NfsInputGroup` (`[nfsInputGroup]`), `NfsInputGroupLabel` (`[nfsInputGroupLabel]`), `NfsInputGroupField` (`input|select|textarea[nfsInputGroupField]`), `NfsInputGroupButton` (`[nfsInputGroupButton]`), `NfsHelpText` (`[nfsHelpText]`), `NfsFieldset` (`fieldset[nfsFieldset]`), and `NfsFormLabel` (`label[nfsFormLabel]`). Each binds its class as a static host class; no component.
2. No directive for text inputs, `textarea`, `select`, checkboxes, radios, file inputs, bare `fieldset`, or `legend`; the spec documents them.
3. `NfsFormLabel.middle`: a closed boolean Variant input through `nfsVariantBoolean`, default `false`, binding `.middle`. The name comes from Foundation's `form-label`, because `NfsLabel` is the Label component's.
4. Forms directives never bind validation state. `.is-invalid-input`, `.is-invalid-label`, `.form-error`, and `.is-visible` stay with Abide's directives, and the two sets sit beside each other on the same elements with no shared attribute. `NfsAbideLabel` does not host `NfsFormLabel` (NG0309 on a doubled match).
5. Help text pairing stays consumer-written (id plus the field's `aria-describedby`); `NfsHelpText` warns once in development mode for a missing id, an id no element lists, or a `label` ancestor.
6. `NfsInputGroupField` warns once in development mode when the field has no label, resolving `aria-labelledby`, or `aria-label`. `NfsFormLabel` warns once when its `for` names no control.
7. No ARIA on the input group; the label carries the unit.
8. No tokens, providers, parent discovery, Defaults token, outputs, methods, or `exportAs`.
9. A checks-only `nfs-forms` Library mixin, included after `foundation-forms`, with five `@error` checks (placeholder 4.5:1; field boundary 3:1 by border or background; focus border 3:1 against the page and the focus background; focus border 3:1 from the resting border; select arrow 3:1 unless `transparent`), and three required settings: `$input-placeholder-color: #737373`, `$input-border: 1px solid $dark-gray`, `$input-border-focus: 1px solid $black`. No library CSS, no Variant properties.
10. The file control is the native `<input type="file">` with its label; the label-as-button recipe is not offered here.
11. Rendering modes: static host classes, no listeners, hydration-clean, works as native HTML under `hydrate never`; no Hydration boundary of its own.
12. Stories `forms--default`, `forms--number-input`, `forms--textarea`, `forms--select`, `forms--select-multiple`, `forms--checkboxes-and-radios`, `forms--fieldset`, `forms--help-text`, `forms--label-positioning`, `forms--input-group`, `forms--file-upload`, `forms--with-abide`, `forms--field-contrast`, title `CSS-only components/Forms`, `component: NfsFormLabel`; no Anti-pattern story.
13. e2e only where Storybook cannot reach: the select's focus border in three engines, the browser's focus ring on checkboxes and file inputs, and the fixture route's JavaScript-disabled axe, hydration counters, and a `hydrate never` variant.
14. Label alignment, floats, and grid placement come from the Typography Helpers, Float Classes, and XY Grid directives; the examples use placeholder names for them.

### Triage

| Item | Impact | Confidence | Evidence | Outcome |
| --- | --- | --- | --- | --- |
| Directive set, names, selectors (1, 3) | HIGH: public API | HIGH: building-blocks 1.3 and 1.4 rules, the triage row, ADR 0040's tag-styled rule, Foundation's `label.middle` selector | Not a bare default; consistent with the ADRs | Decided |
| Validation State classes stay with Abide; sets side by side (4) | HIGH: the Abide re-run follows it | HIGH: Foundation's page split, the composition rule, Angular's duplicate-directive check read in source | | Decided |
| Help text pairing consumer-written, checked (5) | MEDIUM: adding automatic pairing later is additive | HIGH: the triage judge's row; the alternative cannot work for native fields | Accessibility lens's dissent recorded (Q6) | Decided |
| Development checks (6) | LOW: development-only | HIGH | | Decided |
| `nfs-forms` checks and three required settings, `@error` (9) | MEDIUM: consumers on defaults stop compiling; `@error` to `@warn` is a one-line change | HIGH: measured ratios; the Understanding documents for 1.4.11 and 2.4.7; the Button spec's 1.4.1 rule and `@error` precedent | Differs from `nfs-abide`'s `@warn` for the same two pairs; routed to the Abide re-run | Decided |
| Native file input (10) | LOW | HIGH | B4 routed to the Button re-run | Decided |
| No forced-colours rule for the select arrow (Q17) | LOW: additive | MEDIUM: unmeasured | | Decided (no rule), noted in the spec |
| Placeholder layout names in examples (14) | LOW: example text | HIGH | | Decided; the consistency review aligns them |

Nothing is left OPEN FOR HUMAN, and no prototype is needed: every open point is either measured above, settled from primary sources, or LOW impact.

### Proposed shared-file changes

For the orchestrator; line numbers at commit `46b7d0a`.

1. `building-blocks.md`, Table D, the Forms row (`:322`), replace with:

   "| Forms (Input Group, Help Text, labels, fieldsets, and native controls) | `docs/pages/forms.md` | [Spec: Forms](issues/98-spec-forms.md) | `[nfsInputGroup]`, `[nfsInputGroupLabel]`, `input\|select\|textarea[nfsInputGroupField]`, `[nfsInputGroupButton]`; `[nfsHelpText]`; `fieldset[nfsFieldset]`; `label[nfsFormLabel]` with the boolean `middle` Variant input; no directive for text inputs, `textarea`, `select`, checkboxes, radios, file inputs, bare `fieldset`, or `legend` | Directives, one per Structural class (ADR 0039), plus one on the tag-styled `label` for its `.middle` Variant class (ADR 0040); none binds validation state, which stays with the Abide directives placed beside them | Native platform: labels, `fieldset` and `legend`, `aria-describedby`, and native controls; static host classes; no Aria or CDK pattern applies | Static host classes, `nfsVariantBoolean`, development checks in `afterNextRender` (`labels`, `control`, an `aria-describedby` lookup); a checks-only `nfs-forms` Library mixin (placeholder 4.5:1, field boundary 3:1, focus border 3:1 against the page and focus background and 3:1 from the resting border, select arrow 3:1) with three required settings | None; names and descriptions practice (labels, `legend` as the group name, help text as the description) |"

2. `building-blocks.md` 1.10, new bullet after the Button bullet (`:154`):

   "- Forms ([Spec: Forms](issues/98-spec-forms.md)): a select menu and a colour input have no text caret, so their focus indicator is `$input-border-focus`, which must reach 3:1 against the page and the focus background and 3:1 from the resting `$input-border`; the consumer must set `$input-placeholder-color: #737373;` (1.4.3), `$input-border: 1px solid $dark-gray;` (1.4.11), and `$input-border-focus: 1px solid $black;` (1.4.11, 1.4.1, 2.4.7), because Foundation's default focus border equals the resting border that 1.4.11 requires; the checks-only `nfs-forms` mixin stops the compile on each with the unrounded `color-luminance()` ratio. Text inputs pass 2.4.7 through the caret, as the Understanding document for 1.4.11 accepts."

3. `building-blocks.md` 1.3, the "Class names" bullet (`:44`), append:

   "An element Foundation styles by tag that gets a directive only for its Variant classes is named after Foundation's mixin or docs term for it: the form `label` is `NfsFormLabel` (`label[nfsFormLabel]`, from `form-label`), because `NfsLabel` is the Label component's ([Spec: Forms](issues/98-spec-forms.md))."

4. `CONTEXT.md`, Foundation side, after **Utility class** (`:57-59`), new term:

   ```markdown
   **Form label**:
   A `<label>` element that names a form control, styled by Foundation by tag, with one Variant class (`.middle`); distinct from Foundation's Label component (`.label`), a coloured text tag.
   _Avoid_: label (bare, where the Label component could be meant), field label, caption
   ```

5. `CONTEXT.md`, Angular side, after **Form alert** (`:279-281`), new term:

   ```markdown
   **Help text**:
   A `.help-text` element that describes one field through the id the field lists in its `aria-describedby`, shown at all times; distinct from a Form error, which shows only while the field's errors are shown.
   _Avoid_: hint, helper text, description (for the element)
   ```

   And in **Form error** (`:275-277`), "_Avoid_: error message (bare), inline error, hint (which is `.help-text`)" becomes "_Avoid_: error message (bare), inline error, hint (which is Help text)".

6. `adr/0039-directives-manage-every-foundation-class.md`, Consequences, new last bullet:

   "- 2026-09-27 ([Spec: Forms](../issues/98-spec-forms.md)): the form `label` is another element Foundation styles by tag and gives a Variant class (`label.middle`), so it gets `label[nfsFormLabel]` for its `middle` Variant input; a bare `fieldset` still gets no directive, and `fieldset[nfsFieldset]` binds the opt-in Structural class `.fieldset`. The research line that listed the form label and `.middle` under "No Structural class to bind" predates [ADR 0040](0040-variant-input-types.md)'s rule."

7. `storybook-conventions.md` section 5, the Abide override block (`:135-142`), replace with:

   ```scss
   // color-contrast (1.4.3) and non-text contrast (1.4.11): the placeholder is 1.63:1, the input border 1.63:1,
   // and the focus border equals the required resting border, which leaves a focused select with a 1.63:1 glow.
   // Spec: Forms, forms--field-contrast and forms--select; also Abide, abide--invalid-state-contrast.
   $input-placeholder-color: #737373;
   $input-border: 1px solid $dark-gray;
   $input-border-focus: 1px solid $black;

   // color-contrast (1.4.3) and non-text contrast (1.4.11): the alert colour is 4.49:1 on #fefefe, the invalid
   // placeholder 3.93:1 on its tint. Spec: Abide, abide--invalid-state-contrast.
   $input-error-color: #bf3f2c;
   $form-label-color-invalid: #bf3f2c;
   $input-background-invalid: #bf3f2c;
   ```

8. `README.md`, a row for the spec in the index table the consistency review extends for the class-rule wave:

   "| Forms (CSS-only component) | [specs/forms.md](specs/forms.md) | Native platform (labels, `fieldset`, `aria-describedby`, native controls) with class-only directives ([ADR 0039](adr/0039-directives-manage-every-foundation-class.md)) | No inventory: Foundation's Forms docs and forms Sass | None needed |"

### What other specs need from this one

- [Re-run: Abide spec under the class rule](123-rerun-abide-class-rule.md):
  - `.is-invalid-input`, `.is-invalid-label`, `.form-error`, and `.is-visible` stay host bindings of `NfsAbideInput`, `NfsAbideLabel`, and `NfsFormError`; no Forms directive binds them.
  - `.help-text` in its examples becomes `nfsHelpText` with the same consumer id; `aria-describedby` stays the consumer's, composed by `NfsAbideInput` as now.
  - A label that needs `.middle` carries `nfsFormLabel middle` beside `nfsAbideLabel`; `NfsAbideLabel` must not host `NfsFormLabel`.
  - Its input group case (user story 13, `abide--label-for`) uses `nfsInputGroup` and its parts, with the Form error after the group.
  - Its Sass: the `@warn` checks for `$input-placeholder-color` and `$input-border` move to `nfs-forms` as `@error`; `nfs-abide` keeps its three invalid-state `@error` checks; its required settings table points to the Forms spec for the two resting settings and adds `$input-border-focus: 1px solid $black`. Its sentence "focus stays visible through the caret and Foundation's `$input-shadow-focus`" holds for text inputs only; a focused `select` needs the focus border.
  - **Form error**'s glossary definition ("A consumer-written message element (`.form-error`)") predates the class rule; the re-run's glossary proposal can make it "A message element (`.form-error`, bound by `nfsFormError`)".
- [Re-run: Button spec under the class rule](128-rerun-button-class-rule.md): Foundation's input group example uses `<input type="submit" class="button">` inside `.input-group-button`, and its File Upload Button uses `label.button` (B4). The Forms spec uses `<button nfsButton type="submit">` and the native file input either way. If the re-run offers `label[nfsButton]` for file upload, focus lands on the hidden input, so it needs a visible indicator on the label: `:focus-within` on a label that wraps the input is in the Browser target; `:has()` is not.
- [Spec: XY Grid](99-spec-xy-grid.md), [Spec: Typography Helpers](106-spec-typography-helpers.md), [Spec: Float Classes](105-spec-float-classes.md): their directives must work on `label` and on the cells around form fields; the Forms examples use the placeholders `nfsGridX`, `nfsCell` with `size`, and `nfsTextAlign` until they publish.
- [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md): `NfsFormLabel.middle` uses `NfsVariantBoolean` and `nfsVariantBoolean`; Forms adds no registry to the manifest.
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): replace the three placeholder names in the Forms spec; check that `nfs-abide` and `nfs-forms` no longer check the same settings; add the Forms spec to the README index.

### Gist for Decisions so far

- [Spec: Forms](issues/98-spec-forms.md) -- seven class directives in one entry point (`nfsInputGroup` and its label, field, and button parts, `nfsHelpText`, `fieldset[nfsFieldset]`, and `label[nfsFormLabel]` with a boolean `middle` Variant), none for native controls, which Foundation styles by tag; validation State classes stay with the Abide directives, placed beside these on the same elements; development checks for an unlabelled input group field, a `for` that names nothing, and unpaired help text; a checks-only `nfs-forms` mixin requires three settings, one of them a darker focus border because a focused select has no caret; the native file input replaces the label-as-button recipe. Spec: [specs/forms.md](specs/forms.md).

### Note, 2026-09-28 (out-of-scope reasons)

- 2026-09-28: the Out of Scope reasons named in [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md) are corrected in the spec.

### Amendment, 2026-09-29 (in-family check lines)

From the [Re-run: form and value-control family specs, In-family check lines](153-rerun-form-and-value-control-family-in-family-lines.md), under [ADR 0046](../adr/0046-forgotten-imports-caught-by-checks.md) and the family rule of the [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md); `specs/forms.md` was revised in place, and the decision log is that ticket's Answer. Behaviour, API, ARIA, the rendering modes, and the Story ids are unchanged. Changed:

- Hierarchy and DI shape gains the In-family check lines, one per directive: `NfsInputGroup` probes `NfsInputGroupLabel`, `NfsInputGroupField`, and `NfsInputGroupButton`; every other directive has no parent check and no probe; the label's and the help text's value-linked peers (`for`, the id in `aria-describedby`) get no probe. Decided with the Abide spec: neither set probes the other's directives, the shared verdict decides each attribute on an element on its own, and the three development checks read only the DOM and native properties, so their messages hold when a neighbour's import is forgotten.
- The NG0309 reason is removed from Beside the Abide directives and D4 ([Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md), fixer X10), and from the fallback line, which called the same double match "the one measured risk"; building-blocks 1.9 measured that a directive a template also matches is created once. D4 stands on `middle` being spelt through one directive.

### Amendment, 2026-09-29 (consistency review)

From [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md), phase 2, group c, under the decisions of phase 1 ([research/consistency-review-decisions.md](../research/consistency-review-decisions.md)); the review's record for this spec is [research/consistency-review-group-c.md](../research/consistency-review-group-c.md). `specs/forms.md` was revised in place. Items applied: R4, R48 (this note), CR-B, CR-C, CR-D. Changed:

- WCAG 2.2 AA opening, D11, the Sass checks, and the required-settings sentence: every ratio is the exact WCAG relative-luminance ratio, computed by the library's internal contrast helper, never with Foundation's `color-luminance()` or `color-contrast()` (R4's S1 and S2); every figure stands (1.63, 4.70, 3.42, 2.11, 19.63, 5.73, 15.86).
- CSS class to directive mapping gains rows for the other families' classes the examples and Foundation's page use: the Button (with no `label` host), the Typography Helpers, the Float Classes, the XY Grid, the Flexbox Utilities' `.align-center`, the Visibility Classes' `.show-for-sr`, and the Slider (CR-B).
- The Out of Scope label-as-button bullet, the paragraph on other sections' classes, and D12 no longer defer to the Button re-run: `nfsButton` takes `<input type="submit|button|reset">` hosts and no `label` host ([Spec: Button](37-spec-button.md), D11) (CR-C).
- The `app-donate` example drops `NfsFormLabel` from its imports and its import statement, because its template writes no `nfsFormLabel` (CR-D).
- R48: the NG0309 reason in this ticket's records (grilling question 5, decision 4, and the triage row "Validation State classes stay with Abide; sets side by side (4)") is superseded by building-blocks 1.9: since Angular 22.0 a template match discards the host-directive match of the same directive, so a consumer's `nfsFormLabel` beside a hosting directive would be one instance, not an error. The decision stands on its other reasons (`middle` spelt through one directive, and the Forms and Abide entry points import nothing from each other); the spec's sentences were already corrected by the [Re-run: form and value-control family specs, In-family check lines](153-rerun-form-and-value-control-family-in-family-lines.md). The records above are not rewritten.

Unchanged: the seven directives, their API, the development checks, the In-family lines, ARIA, the rendering modes, and the Story ids. Confirmed: R9/R23 (the grid and alignment names), R17 (no `exportAs`, D8), R33, R73 (`#737373` as the placeholder), CR-A. Impact LOW, confidence HIGH; nothing OPEN FOR HUMAN.

### Amendment, 2026-09-29 (exportAs on every directive)

From [Decide: an exportAs on every directive](156-decide-exportas-on-every-directive.md), which reverses R17 and D8's 2026-09-28 reading: `specs/forms.md`'s seven directives gain `exportAs: 'nfsFormLabel'`, `exportAs: 'nfsHelpText'`, `exportAs: 'nfsFieldset'`, `exportAs: 'nfsInputGroup'`, `exportAs: 'nfsInputGroupLabel'`, `exportAs: 'nfsInputGroupField'`, and `exportAs: 'nfsInputGroupButton'` (the Models/outputs/methods bullet and D8).

### Amendment, 2026-09-29 (checks move to a later milestone)

From [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md), applied by [Re-run: specs without checks, group c](167-rerun-specs-without-checks-group-c.md): `specs/forms.md` describes and accepts a library with no checks. What left the spec, per check:

- Misuse warnings: `NfsFormLabel`'s `for` check, `NfsHelpText`'s id, pairing, and placement check, and `NfsInputGroupField`'s name check, with their messages, their browser-level cases, the `afterNextRender` read callback (D14), the development-only `ElementRef` injections, and the SSR smoke's no-warning clause.
- Forgotten-import checks: the In-family bullets for the seven directives, and the paragraph on the Abide directives beside them.
- Build-time checks: the `nfs-forms` Library mixin's five `@error` checks (D11), with the Sass compile test. The mixin held nothing else (no rule, no Variant property), so the entry point has no Library mixin, as the Abide spec's `nfs-abide` went; the Storybook preview no longer includes it. The quotes of the Abide and Switch specs' own compile checks go too.

Each rule is stated as documented usage: the JSDoc of `NfsFormLabel`, `NfsHelpText`, and `NfsInputGroupField` (a new usage-rule column in the API table), the Solution, the mapping table's notes, and the 1.3.1 and 3.3.2 rows. The five ratios are in Sass item 2 with the three required settings, and the 1.4.1, 1.4.3, and 1.4.11 rows point at them; `forms--field-contrast` and the e2e focus test still assert them. A new Imports bullet says what a forgotten import does. D5, D6, D9, D10, D11, and D14 are rewritten to what the spec now decides; user stories 8, 9, 12, 15, and 26 state documentation, not warnings. Unchanged: the seven directives, `middle`, the class mapping, the Abide composition, ARIA, the rendering modes, the stories, and the e2e tests.

### Amendment, 2026-09-30 (later-milestone families)

From [Decide: grids, typography, and utilities move to a later milestone](174-decide-grids-typography-utilities-later-milestone.md), applied by [Re-run: specs without the later-milestone families, group b](177-rerun-specs-without-later-families-group-b.md): `specs/forms.md` no longer assumes the XY, Float, or Flex Grid, the Typography Helpers, or the four Utilities specs, names none of their directives, and links none of them. Their classes are Foundation's normal classes, which the consumer and the library's own stories write, with Foundation's global styles loaded (ADR 0039's exception for a family with no first-milestone spec). What changed:

- Label Positioning's `.text-right`, `.float-right`, and `.float-left`, every example's XY grid classes, the Label Positioning grid's `.align-center`, and the File Upload Button's `.show-for-sr` are normal classes: the Foundation contract paragraph and the five class-mapping rows say so, and the Rendered HTML's Label Positioning and Abide examples write `class="grid-x"`, `class="cell small-3"`, and `class="text-right"` beside `nfsFormLabel`.
- User story 36, the two Out of Scope bullets, and D15 are restated; the "Foundation behaviour changed or dropped" bullet about those classes is removed, because they are now written as Foundation writes them.
- Unchanged: the seven directives, `middle`, the Abide composition, ARIA, the rendering modes, the stories, and the e2e tests.

### Amendment, 2026-09-30 (audit 0010)

From [Audit 0010: the later-milestone families wave](../audits/0010-later-milestone-families-wave.md); `specs/forms.md` was revised in place:

- L1: the Problem Statement and the class sentence are narrowed to families with a first-milestone spec.
