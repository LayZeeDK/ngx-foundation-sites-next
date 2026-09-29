# Checks extraction, group a

Group: a. Files: `specs/abide.md`, `specs/accordion-menu.md`, `specs/accordion.md`, `specs/anchored-pane.md`, `specs/badge.md`, `specs/breadcrumbs.md`, `specs/breakpoint-service.md`, `specs/button-group.md`, `specs/button.md`. Commit read: `ba07780` (branch `wayfinder`). Classification rule's source: ticket 158, [Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md), Decision item 1, applied per ticket 159's per-kind wording.

Kinds: `forgotten-import` (ADR 0046's four checks), `family` (a family's own development check reading another part of its family), `misuse` (a directive's own development warning reading only its host, inputs, content, or the page), `runtime` (ADR 0040's Runtime checks), `build-time` (Library mixin `@error`/`@warn` checks and the Variant declaration tooling's check mode). A check fitting two kinds by wording goes to the kind of what it reads, forgotten-import first; boundary calls are recorded inline and summarized at the end.

## specs/abide.md

### forgotten-import: In-family checks (Abide family)

Location: "Hierarchy and DI shape", lines 166-172.

Text:

````
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part:
  - `NfsAbide` calls `nfsDirectiveCheck('NfsAbide', {children: ['NfsAbideInput', 'NfsAbideLabel', 'NfsFormError', 'NfsAbideAlert']})`: no parent check (it has no parent); it probes the four Abide parts inside the form, because their static forms (`nfsAbideAlert`, a bare `nfsAbideLabel` or `nfsFormError`, an `nfsAbideInput` that no reference names) compile without a word when their import is forgotten; no peers; `strictParents` changes nothing.
  - `NfsAbideInput` calls `nfsDirectiveCheck('NfsAbideInput')`: no parent check, because both its injections, `nfsAbideToken` and `nfsAbideLabelToken`, stay optional with a supported `null` (a field outside a form works with the Defaults token policy; only a custom control's label provides the label token), so it passes no parent and `strictParents` changes nothing; no child probes; peers: its label and Form errors linked by reference (`[nfsAbideLabel]="pw"` and `[nfsFormError]="pw"` with `#pw="nfsAbideInput"`), whose forgotten imports fail to compile (NG8002 for the binding, NG8003 for the reference), and the help text its `aria-describedby` names by id. A custom control that applies it through `hostDirectives` carries no `nfsAbideInput` attribute, so no probe looks for one, and the hosted directive records itself when it constructs.
  - `NfsAbideLabel` calls `nfsDirectiveCheck('NfsAbideLabel', {children: ['NfsAbideInput', 'NfsFormError']})`: no parent check (it injects no parent: a label outside a form works as its field does); it probes the input and the bare Form error of the wrapping-label form; peers: its field linked by reference, as above; `strictParents` changes nothing. Its warning when no field resolves finds the field by registration, so, by the shared spec's rule for such checks, it says nothing while the label holds an element that carries the `nfsAbideInput` attribute: that element is a forgotten import, which this label's probe reports once (M2); a label with no such element keeps the warning.
  - `NfsFormError` calls `nfsDirectiveCheck('NfsFormError')`: no parent check, because its `nfsAbideLabelToken` lookup stays optional with a supported `null` (a Form error linked by `[nfsFormError]="field"` needs no label), so it passes no parent and `strictParents` changes nothing; its warning when no field resolves stays the report for a bare Form error outside a label, and says nothing for a bare Form error whose nearest `label` ancestor carries the `nfsAbideLabel` attribute with no `NfsAbideLabel` on it, a forgotten import that `strictDirectiveImports` reports once (M1), as the Drilldown's check 1 does for its wrapper; no child probes; peers: its field linked by reference, as above. The field's warning for an error state with no visible Form error finds its Form errors by registration too, and says nothing while the field's wrapping label holds an element that carries the `nfsFormError` attribute with no `NfsFormError` on it, which the label's probe reports once (M2).
  - `NfsAbideAlert` calls `nfsDirectiveCheck('NfsAbideAlert')`: parent check none, because its `nfsAbideToken` injection is required and NG0201 is the report, with the token's description; no child probes; no peers; `strictParents` changes nothing.
  - The Forms, Callout, Button, and Visibility Classes directives written beside these on the same elements belong to other families: no Abide part probes them, and no Forms part probes an Abide one (decided with the [Spec: Forms](../issues/98-spec-forms.md)). The shared verdict decides each attribute on an element on its own, from the directives that list that attribute, so a forgotten `NfsFormLabel` beside a working `NfsAbideLabel`, or a forgotten `NfsAbideInput` beside a working `NfsInputGroupField`, is still reported. The development checks above resolve fields through DI and references, and the in-label check reads the `label` element, not a directive on it, so a forgotten neighbour changes none of their messages. No Abide part sits on `ng-template` or `ng-container`.
````

Tests and stories: line 505 (browser-level test): "Linking: ... an unresolved label or error warns once in dev mode; a field in error with no visible Form error warns once; a bare label holding an element that carries `nfsAbideInput` without its directive, a bare Form error inside a label that carries `nfsAbideLabel` without its directive, and a field in error whose label holds an element that carries `nfsFormError` without its directive make none of these three warnings (the probe or `strictDirectiveImports` reports the forgotten import once); the in-label development warning fires once for a native control's Form error inside its label, and not for a custom `FormValueControl` or an after-label error."

Needs: the shared `nfsDirectiveCheck(class, {children})` utility (from `specs/forgotten-import-checks.md`, out of group a); each Abide part's own call, quoted above, is this file's only contribution.

Rule as documented usage: "The consumer must import each Abide directive class (`NfsAbide`, `NfsAbideInput`, `NfsAbideLabel`, `NfsFormError`, `NfsAbideAlert`) they write an attribute for; a forgotten import renders the Foundation markup without state or ARIA, with no error."

Mentions: user story 40, line 68 ("dev-mode warnings when a label or Form error cannot find its field" -- partly this check's peer-compile-error framing, partly the family checks C/D below); line 172's closing paragraph on cross-family attribute resolution.

### forgotten-import: parent token descriptions (M7)

Location: "Hierarchy and DI shape", lines 157-158.

Text:

````
- `nfsAbideToken` (`InjectionToken<NfsAbide>`, lightweight, `import type`), provided by `NfsAbide` with `useExisting`. Its description, in development builds only, is "nfsAbideToken (provided by NfsAbide from 'ngx-foundation-sites/abide' on an ancestor element declared in the same template)" (`typeof ngDevMode === 'undefined' || ngDevMode ? "..." : ''`, M7 of the [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)). `NfsAbideInput` injects it `{optional: true}`: a field outside an `nfsAbide` form still works with the Defaults token policy and never counts as submitted. `NfsAbideAlert` injects it without `optional`: an alert outside a form is an error (NG0201, which prints that description).
- `nfsAbideLabelToken` (lightweight, `import type`), provided by `NfsAbideLabel`, with the description "nfsAbideLabelToken (provided by NfsAbideLabel from 'ngx-foundation-sites/abide' on an ancestor element declared in the same template)" in development builds only, in the same form.
````

Tests and stories: none found in this file (the description string is exercised only through Angular's own NG0201 message, which this file does not assert directly).

Needs: the token description string literal, guarded by `typeof ngDevMode === 'undefined' || ngDevMode`; also feeds the required parent injection's NG0201 error for `NfsAbideAlert` (kept, not a check).

Rule as documented usage: none (the description text names the same required-parent rule already carried by the kept NG0201 injection; it adds no new consumer obligation).

Mentions: line 171 ("parent check none, because its `nfsAbideToken` injection is required and NG0201 is the report, with the token's description").

### family: NfsAbideLabel field-resolution warning

Location: "API per directive", `NfsAbideLabel`, line 254.

Text:

````
Host: `[class.is-invalid-label]` = the resolved field's `errorState()`. Dev mode: warns once in `afterNextRender` when no field resolves, unless the label holds an element carrying `nfsAbideInput` with no `NfsAbideInput` on it, which its probe reports instead (In-family checks).
````

Tests and stories: line 505, "Linking" bullet quoted above under the forgotten-import check ("an unresolved label ... warns once in dev mode").

Needs: the field-registration mechanism ("Registration: inputs register with the form ... and Form errors register with their field", line 163) -- also used by the form's `invalid` signal and the field's `aria-describedby` list (functional, not check-only).

Rule as documented usage: "The consumer must give every `nfsAbideLabel` a resolvable field, either nested inside it or referenced with `[nfsAbideLabel]='field'`."

Mentions: user story 40, line 68.

### family: NfsFormError field-resolution warning

Location: "API per directive", `NfsFormError`, line 265.

Text:

````
Host: static `class="form-error"` (merged with any class the consumer's application adds), `[id]`, `[class.is-visible]` = `visible()`, `[attr.role]` = the static `role` attribute when the consumer wrote one (read through `HostAttributeToken('role')`), else `'alert'`. Dev mode: warns once when no field resolves (not for a bare Form error inside a label that carries `nfsAbideLabel` with no `NfsAbideLabel` on it, which `strictDirectiveImports` reports; In-family checks) ...
````

Tests and stories: line 505 ("an unresolved label or error warns once in dev mode").

Needs: same registration mechanism as the label check above.

Rule as documented usage: "The consumer must give every `nfsFormError` a resolvable field, either nested inside an `nfsAbideLabel` or referenced with `[nfsFormError]='field'`."

Mentions: user story 40, line 68.

### family: NfsFormError descendant-of-label placement warning

Location: "API per directive", `NfsFormError`, line 265.

Text:

````
... warns once when it is a descendant of a `label` and its field is a native control (a defect, not a style preference: Firefox then reads the error as part of the field's name, and Chromium fires no alert event for it, so NVDA with Chrome never announces it when it appears while focus is elsewhere; place it after the label and link it by reference) ...
````

Tests and stories: line 499, "`abide--default`, `abide--submit`, `abide--checkbox`, and `abide--reactive-forms` assert that no visible Form error of a native control is a descendant of its `label`; `abide--checkbox` and `abide--reactive-forms` use the after-label markup."; release test, line 542 (NVDA/Chrome/Firefox/VoiceOver announcement check tied to the same defect).

Needs: none beyond a plain DOM ancestor read (`closest('label')`-equivalent); no shared code.

Rule as documented usage: "For a native control, the consumer must place its `nfsFormError` after the wrapping label and link it by reference, not inside the label."

Mentions: D3, line 564 ("a native control's Form error goes after the label with a reference, because inside the label Firefox makes it part of the field's name and Chromium fires no alert event for it"); "Foundation behaviour dropped or changed", line 772.

### family: NfsAbideInput no-visible-error warning

Location: "API per directive", `NfsFormError`, line 265.

Text:

````
... and the field warns once when it enters its error state with no visible Form error (WCAG 3.3.1 and 1.4.1 need visible text), unless its wrapping label holds an element carrying `nfsFormError` with no `NfsFormError` on it, which the label's probe reports instead.
````

Tests and stories: line 505 ("a field in error with no visible Form error warns once ... a field in error whose label holds an element that carries `nfsFormError` without its directive make none of these three warnings").

Needs: the Form-error registration list read by the field (same registration mechanism as above).

Rule as documented usage: "The consumer must give every field that can show an error at least one `nfsFormError` for it (WCAG 3.3.1, 1.4.1)."

Mentions: user story 40, line 68; WCAG table row 3.3.1, line 356.

### misuse: copied State class warning (D20)

Location: "CSS class to Angular mapping" line 269; "Further Notes" D20, line 581.

Text:

````
Copied State classes (building-blocks 1.4, the initial-state rule): Foundation's Abide docs show the error look with static `class="is-invalid-label"`, `class="is-invalid-input"`, and `class="form-error is-visible"`. Each is stripped on server and client by the directive's own class binding, because Angular's styling resolution consults a static class only when every binding for it is `undefined`, and these bindings are always `true` or `false`. So `NfsAbideInput`, `NfsAbideLabel`, and `NfsFormError` each read their host's static `class` with `inject(new HostAttributeToken('class'), {optional: true})` in a field initialiser that runs only when `ngDevMode` is on, and warn once when it holds the State class they set: "class="is-invalid-input" is set by nfsAbideInput from the field's error state; remove it" (and the same for `is-invalid-label` with `nfsAbideLabel` and `is-visible` with `nfsFormError`). A redundant `form-error` merges with `NfsFormError`'s static host class and is not reported. No Abide directive reads a static class to seed state.
````

Tests and stories: line 511 (browser-level test): "Copied State classes: hosts that copy `class="is-invalid-input"`, `class="is-invalid-label"`, and `class="form-error is-visible"` render without the State class while the field is valid, gain it only from field state, and each directive warns once naming the class and the directive that sets it; `class="form-error"` alone is kept and not reported; the static class is read in development builds only (a production-mode fixture logs nothing)."; SSR smoke section (line 522) implicitly (no `is-invalid-*` etc. in server HTML).

Needs: `inject(new HostAttributeToken('class'), {optional: true})`, read only under `ngDevMode` (line 269, 461: "apart from the static `class` attribute that development builds read through `HostAttributeToken` for the copied State class check").

Rule as documented usage: "The consumer must not write the static `is-invalid-input`, `is-invalid-label`, or `is-visible` class; each directive sets it from field state."

Mentions: user story 44, line 72; D20 rationale/rejected-alternative row, line 581; "Foundation behaviour dropped or changed", line 773.

### build-time: nfs-abide Sass contrast checks

Location: "Sass and custom CSS", line 474; "Sass" subsection item 1, lines 720-727; D15, D21, D22, lines 576, 582-583.

Text:

````
The `nfs-abide` Library mixin emits no CSS: it holds only the compile-time contrast checks for the invalid state that ADR 0022 and building-blocks 1.10 require where axe has no rule (placeholder text, borders, the focus border of a caret-less control), each an `@error`, so a consumer on a failing setting learns it in their own compile, not only from a failing story in the library's CI.
````

````
1. Rules the library emits: none. Checks, each an `@error` that names the setting to change. ... Border colours are read from the shorthands with Foundation's `get-border-value()`:
   - `$input-error-color` and `$form-label-color-invalid` against `$body-background`, at least 4.5:1 (1.4.3, the error text and the invalid label);
   - `$input-background-invalid` against the invalid tint Foundation's `form-input-error` mixin paints, `mix($input-background-invalid, $white, 10%)` at that mixin's default, at least 4.5:1 (1.4.3, the invalid placeholder), and against `$body-background`, at least 3:1 (1.4.11, the invalid border);
   - the `$input-border-focus` colour against `$input-background-invalid`, at least 3:1 (1.4.1 and 2.4.7: `form-input-error` applies only while the field is not focused, so focusing an invalid select, which has no caret, swaps the invalid border for the focus border, and the swap must be more than a change of hue; D21).

   No `@warn` remains: the resting pairs (`$input-placeholder-color` against `$input-background`, the `$input-border` colour against `$body-background`) moved to `nfs-forms` as `@error` checks, beside that mixin's focus border checks. Reason: axe checks neither placeholder text nor borders, so without these checks a consumer on Foundation's defaults gets no signal (ADR 0022).
````

Tests and stories: line 524 (Node-level Vitest, "Sass compile"): "Foundation's default settings plus `@include nfs-abide;` stop with the `@error` naming `$input-error-color`, `$form-label-color-invalid`, `$input-background-invalid`, and `$input-border-focus` (1.31:1 from the invalid border); the three invalid-state values with Foundation's default focus border stop with the error naming `$input-border-focus` (1.54:1); the three invalid-state values with the Forms spec's `$input-border-focus: 1px solid $black` compile and emit no CSS, no `@error`, and no `@warn` ...; a pair at 4.498:1 fails although Foundation's rounding `color-contrast()` would report 4.5; an invalid colour 2.12:1 from the focus border (`#8b1a10` against `$black`) fails."; `abide--invalid-state-contrast` story, line 498 (computed-style assertions of the same ratios); e2e repeat, line 532.

Needs: the library's shared unrounded WCAG-contrast Sass helper (`math.pow`, building-blocks 1.10) -- also used by every other plugin's build-time checks; `get-border-value()` (Foundation's own function).

Rule as documented usage: "The consumer must set `$input-error-color`, `$form-label-color-invalid`, and `$input-background-invalid` to the values the Sass subsection requires (1.4.3, 1.4.11), and `$input-border-focus` at least 3:1 from `$input-background-invalid` (1.4.1, 2.4.7, D21); nothing in Foundation's CSS stops a failing value from compiling."

Mentions: user story 39, line 67; user story 41, line 69; WCAG table rows 1.4.1, 1.4.3, 1.4.11, lines 351-353; D15, D21, D22, lines 576, 582-583; "What breaks when the include is missing" item 5, line 748.

### Kept (not a check), abide.md

- Required parent injection of `nfsAbideToken` by `NfsAbideAlert` and its NG0201 error (lines 157, 171) -- the injection and its Angular-generated error, not the M7 description text (captured above).
- Typed template references (`#pw="nfsAbideInput"`) failing to compile with NG8002/NG8003 when the referenced directive is not imported (line 168) -- Angular's own compile diagnostics.
- ARIA and keyboard behaviour (the whole "ARIA and keyboard" section, lines 334-375).
- Typed inputs and their compile errors (the "API per directive" type signatures, lines 174-209, 226-267).
- The value-adoption, `ready`, and error-state-policy logic (lines 220-247) -- functional, not a check.
- Registration of inputs with the form and Form errors with their field (line 163) -- functional; also read by the family checks above.
- The story axe gate and every story's `parameters.a11y.test = 'error'` run (line 484) -- the library's own tests.
- No Variant family, no Variant property, no Runtime checks for Abide (line 137, 749) -- explicit absence, noted for completeness.

## specs/accordion.md

### forgotten-import: In-family checks (Accordion family)

Location: "Hierarchy and DI shape", lines 157-163.

Text:

````
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part:
  - `NfsAccordion`: `nfsDirectiveCheck('NfsAccordion', {children: ['NfsAccordionItem']})`; no parent check (it has no parent); it probes `NfsAccordionItem`; no peers; `strictParents` changes nothing.
  - `NfsAccordionItem`: `nfsDirectiveCheck('NfsAccordionItem', {children: ['NfsAccordionTitle', 'NfsAccordionContent']})`; parent check none, because its `nfsAccordionToken` injection is required and NG0201 is the report, with the token's description; it probes `NfsAccordionTitle` and `NfsAccordionContent`; no peers; `strictParents` changes nothing.
  - `NfsAccordionTitle`: `nfsDirectiveCheck('NfsAccordionTitle')`; parent check none (its `nfsAccordionItemToken` injection is required, NG0201 with the token's description); no child probes; its content is a peer by reference, the `[panel]` binding, which needs no probe, because its forgotten form fails with NG8002; `strictParents` changes nothing.
  - `NfsAccordionContent`: `nfsDirectiveCheck('NfsAccordionContent')`; parent check none (required `nfsAccordionItemToken`, as the title's); no child probes; its title is the peer by reference above; `strictParents` changes nothing.
  - `NfsAccordionLazyContent` sits on `ng-template` and calls nothing, so only the static check sees a forgotten one.
  - The `nfsButton` controls of the stories and examples belong to another family: no accordion part probes them.
````

Tests and stories: none specific to this file (the shared probe mechanism's tests live in `specs/forgotten-import-checks.md`, out of group a).

Needs: the shared `nfsDirectiveCheck(class, {children})` utility.

Rule as documented usage: "The consumer must import each Accordion directive class (`NfsAccordion`, `NfsAccordionItem`, `NfsAccordionTitle`, `NfsAccordionContent`, `NfsAccordionLazyContent`) they write an attribute for; a forgotten import renders the markup without state or ARIA, with no error."

Mentions: none beyond the quoted lines.

### forgotten-import: parent token descriptions (M7)

Location: "Hierarchy and DI shape", line 152.

Text:

````
Tokens: `nfsAccordionToken` and `nfsAccordionItemToken` are lightweight `InjectionToken`s typed with `import type` of the class (building-blocks 1.9, ADR 0009). Children inject them without `optional`: an item, title, or content outside its parent cannot work, because Aria's `AccordionTrigger` requires `ACCORDION_GROUP` and throws NG0201 anyway. Each has a description in development builds only, in M7's form (`typeof ngDevMode === 'undefined' || ngDevMode ? "..." : ''`): "nfsAccordionToken (provided by NfsAccordion from 'ngx-foundation-sites/accordion' on an ancestor element declared in the same template)" and "nfsAccordionItemToken (provided by NfsAccordionItem from 'ngx-foundation-sites/accordion' on an ancestor element declared in the same template)".
````

Tests and stories: none found in this file.

Needs: the two description string literals, guarded by `typeof ngDevMode === 'undefined' || ngDevMode`; feed the required parent injections' NG0201 errors (kept, not checks).

Rule as documented usage: none (the description text names the same required-parent rule already carried by the kept NG0201 injections).

Mentions: lines 158-161 ("with the token's description", repeated for `NfsAccordionItem`, `NfsAccordionTitle`, `NfsAccordionContent`); D22, line 571.

### misuse: title outside a heading (dev check 1)

Location: "Behaviour rules", dev-mode checks list, line 254, item (1).

Text:

````
Dev-mode checks, in one `afterNextRender` per directive that exists only when `ngDevMode` is on, each warning once per instance: (1) a title whose parent is not `h1`-`h6`, or not the heading's only element child (APG; 1.3.1); ...
````

Tests and stories: line 511 (Node-level Vitest): "the heading check over parent tag names"; WCAG table row 1.3.1, line 315 ("checked by dev check 1 and the SSR smoke").

Needs: a read of the host's parent element's tag name; no shared code.

Rule as documented usage: "The consumer must place every `nfsAccordionTitle` as the sole element child of an `h1`-`h6` heading (WCAG 1.3.1, APG)."

Mentions: user story 28, line 59; D3, line 552.

### family: deepLink content id generated (dev check 2)

Location: "Behaviour rules", dev-mode checks list, line 254, item (2).

Text:

````
(2) `deepLink` with a content id that starts with Aria's generated prefix; ...
````

Tests and stories: none specific found beyond the general "Dev-mode checks: each of the seven warnings fires once for its case and not for correct markup" (line 504).

Needs: reads every registered item's content `id` (a child, via the accordion's item registry, line 153) against `deepLink`, its own input.

Rule as documented usage: "The consumer must set an explicit `id` on every `nfsAccordionContent` used with `deepLink`, instead of leaving Aria's generated id."

Mentions: user story 27, line 58; user story 28, line 59.

### misuse: deepLink with hash-route-shaped hash (dev check 3)

Location: "Behaviour rules", dev-mode checks list, line 254, item (3).

Text:

````
(3) `deepLink` while the hash looks like a hash route (`#/`), which this feature does not support; ...
````

Tests and stories: line 511 (Node-level Vitest): "the hash lookup (encoded ids, `#/` routes, empty hash)" (the matching logic this check's condition reuses).

Needs: reads `location.hash` (the page) and its own `deepLink` input; no shared code.

Rule as documented usage: "The consumer must not combine `deepLink` with `HashLocationStrategy` routing, whose fragment is the route (see Out of Scope)."

Mentions: user story 28, line 59; "Out of Scope", line 538.

### family: several items bound open with multiExpand false (dev check 4)

Location: "Behaviour rules", line 248; dev-mode checks list, line 254, item (4).

Text:

````
Binding writes do not make the model emit, so no expansion policy runs for them: two titles bound open in single mode both stay open, which dev check 4 reports.
````

````
(4) more than one item open at first render while `multiExpand` is `false`; ...
````

Tests and stories: line 493 (browser-level test): "two titles bound open in single mode keep both open and fire dev check 4"; line 504 ("each of the seven warnings fires once for its case").

Needs: reads every item's `expanded` state (the family's children) against the accordion's own `multiExpand` input.

Rule as documented usage: "The consumer should not bind more than one sibling title `[expanded]='true'` while `multiExpand` is off; every bound-open panel still renders open, with no automatic close."

Mentions: user story 28, line 59; D8, line 557 ("the previous seed from a static `is-active`... a bare `expanded` attribute").

### misuse: collapseAll() while allowAllClosed is false (dev check 5)

Location: API table, line 233; "Behaviour rules", dev-mode checks list, line 254, item (5).

Text:

````
| | `collapseAll()` | method | | none | Does nothing unless `allowAllClosed` (Foundation cannot close the last pane); dev warning otherwise |
````

````
(5) `collapseAll()` called while `allowAllClosed` is `false`; ...
````

Tests and stories: line 504 ("each of the seven warnings fires once for its case").

Needs: reads the accordion's own `allowAllClosed` input at call time; no shared code beyond Aria's `collapseAll()` it delegates to.

Rule as documented usage: "The consumer should not call `collapseAll()` while `allowAllClosed` is off; it does nothing, because Foundation's accordion cannot close its last open pane."

Mentions: user story 12, line 43; user story 28, line 59.

### misuse: expanded content computed display none (dev check 6)

Location: "Behaviour rules", dev-mode checks list, line 254, item (6).

Text:

````
(6) an expanded content whose computed `display` is `none` ("include `nfs-accordion` after `foundation-accordion`"); ...
````

Tests and stories: line 691 ("Without the contrast setting, the `@warn` fires..."; the mixin-missing case itself is documented at line 691's neighbour, "(5) What breaks without the include: open panels never show..., which dev check 6 reports").

Needs: reads the content's own computed `display` style in a render callback; no shared code.

Rule as documented usage: "The consumer must include `nfs-accordion` after `foundation-accordion` in their Sass; without it, open panels do not visually show."

Mentions: user story 28, line 59; "Sass" subsection item 5, line 691.

### misuse: copied is-active class on item (dev check 7)

Location: "Behaviour rules", line 248; dev-mode checks list, line 254, item (7); D25, line 574.

Text:

````
A static `class="is-active"` copied onto an item from Foundation's markup is stripped on server and client alike, because the item's dynamic `[class.is-active]` binding wins over a static class of the same name (Angular's styling resolution consults static classes only when every binding for the class is `undefined`); dev check 7 reports it.
````

````
(7) an item whose static `class` list contains `is-active` ("the class is set by `nfsAccordionItem`; bind `[expanded]="true"` on the title instead"), read with `inject(new HostAttributeToken('class'), {optional: true})` in a field initialiser that runs only when `ngDevMode` is on, because the rendered class list no longer shows the copied class once the host binding has stripped it. Structural classes written redundantly (`class="accordion"`) merge with the static `host` classes and are not reported.
````

Tests and stories: line 493 ("a host that copies `class="is-active"` onto an item renders it without `.is-active` and collapsed, and fires dev check 7 once"); line 511 ("dev check 7's class-list test (`is-active` as a whole token among other classes and extra whitespace; `is-activated` and `my-is-active` do not match)"); "one deliberate exception" noted at line 467 (Testing Decisions intro).

Needs: `inject(new HostAttributeToken('class'), {optional: true})`, read only under `ngDevMode` (line 451, 467).

Rule as documented usage: "The consumer must not write the static `is-active` class; bind `[expanded]='true'` on the title instead."

Mentions: user story 28, line 59; user story 51, line 82; D25, line 574; "Out of Scope", line 541; "Foundation behaviour changed or dropped", line 708.

### build-time: nfs-accordion Sass @warn contrast check

Location: WCAG table row 1.4.3, line 319; D19, line 568; "Sass" subsection item 1, line 683.

Text:

````
The `nfs-accordion` mixin raises a Sass `@warn` when the ratio of `$accordion-item-color` against `$accordion-item-background-hover` or against `$accordion-background`, or of `$accordion-content-color` against `$accordion-content-background`, is below 4.5, each ratio computed with the exact WCAG relative-luminance formula by the library's internal contrast helper and compared unrounded (Foundation's `color-contrast()` is not used, because it rounds to one decimal and would pass 4.498:1 as 4.5); the library's Storybook settings carry the fix, so the gate would catch its removal
````

````
Plus compile-time checks that emit no CSS: `@warn` when the ratio of `$accordion-item-color` against `$accordion-background` or against `$accordion-item-background-hover`, or of `$accordion-content-color` against `$accordion-content-background`, is below 4.5 (WCAG 2.2 1.4.3 for Foundation's 12 px title and body text), naming the setting to change. Every contrast ratio the mixin checks is computed unrounded with the exact WCAG 2.2 relative-luminance formula by the library's internal contrast helper (`math.pow`), which composites a translucent colour over `$body-background` first (building-blocks 1.10); never with Foundation's `color-luminance()`, whose approximate power overstates some ratios, or its `color-contrast()`, which rounds to one decimal.
````

Tests and stories: line 510 (Node-level Vitest Sass compile): "`nfs-accordion` compiled after Foundation with default settings emits the seven rule groups and one `@warn` for contrast; with `$accordion-item-color: scale-color($primary-color, $lightness: -15%)` it emits no warning; with `$accordion-plusminus: false` the re-included title rules carry no `::before`."; story gate note, line 473 (the preview settings carry the fix "with a `color-contrast` comment").

Needs: the library's shared unrounded WCAG-contrast Sass helper (`math.pow`).

Rule as documented usage: "The consumer must set `$accordion-item-color` so it reaches 4.5:1 against `$accordion-background` and `$accordion-item-background-hover` (Foundation's default is 3.76:1 on hover/focus); nothing in Foundation's CSS stops a failing value from compiling."

Mentions: Problem Statement, line 16; user story 29, line 60; user story 38, line 69; D19, line 568; "What breaks without the include" item 5, line 691.

### Kept (not a check), accordion.md

- Required parent injections (`nfsAccordionToken`, `nfsAccordionItemToken`) and their NG0201 errors (line 152) -- the injections themselves, not the M7 description text (captured above).
- Typed template reference / `[panel]` binding compile errors (NG8002, NG8008) when a peer is not imported or bound (lines 160-161, 237) -- Angular's own compile diagnostics.
- ARIA and keyboard behaviour, the expansion policy, focus-return, and content key/replay guards (lines 245-326) -- functional, not checks.
- Aria's own dev-mode checks ("trigger inside its panel, panel with two triggers", and its `console.warn` for a panel without `ngAccordionContent`, lines 254, 458) -- `@angular/aria`'s own behaviour, outside this library's checks.
- Typed inputs and their compile errors (the API section type signatures, lines 165-243).
- Animation, completion timing, and rendering-mode/hydration behaviour (lines 430-459) -- functional.
- The library's own accessibility gate (axe on every story, line 471) and e2e/release-test suite.
- No Variant input, no Variant registry or property, and no Runtime checks for Accordion (lines 122, 540, 693) -- explicit absence.

## specs/accordion-menu.md

### forgotten-import: In-family checks (Accordion Menu root)

Location: "Hierarchy and DI shape", line 161.

Text:

````
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsAccordionMenu` calls `nfsDirectiveCheck('NfsAccordionMenu', {children: ['NfsMenuItem']})`, the probe the [Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md) requires of every menu root, and its hosted `NfsMenu` probes `NfsMenuText` (the [Spec: Menu](../issues/85-spec-menu.md)); it has no parent check, because its injections are `self`, no peers, and `strictParents` changes nothing.
````

Tests and stories: none specific to this file (the shared probe mechanism's tests live in `specs/nested-menu.md`, out of group a).

Needs: the shared `nfsDirectiveCheck(class, {children})` utility (`specs/forgotten-import-checks.md`).

Rule as documented usage: "The consumer must import `NfsAccordionMenu`, `NfsMenuItem`, and, if written, `NfsMenuText`; a forgotten import renders the list markup without the accordion behaviour, with no error."

Mentions: none beyond the quoted line.

### family: multiOpen-off siblings-bound-open warning (D8)

Location: "Behaviour rules the root adds", line 196; "Development-mode checks", line 199 item (1); D8, line 499.

Text:

````
- Bound open sections and `multiOpen` off: Foundation's `_init` ran `down()` on every pre-open submenu in turn, so with `multiOpen` off only the last one stayed open. The library keeps every section bound open at first render open, because the server HTML must show the state the consumer bound and a close after hydration would move content under the reader; in development the root warns once when, at first render, `multiOpen` is off and a level holds more than one expanded item (the Accordion spec's rule for single mode, ADR 0028 consequences).
````

````
Development-mode checks, in one `afterNextRender` that exists only under `ngDevMode`, each warning once per instance: (1) `multiOpen` off with several expanded siblings, as above.
````

Tests and stories: line 441 (browser-level test): "Development check: with `multiOpen` off and two siblings bound `[expanded]="true"`, one warning at first render and both stay open; none with `multiOpen` on, none for one open section per level, none under a driving test root while another mode is live."; line 451 (Node-level Vitest): "Pure logic, table-driven: the development check's rule (a description of levels and expanded flags, with `multiOpen`, gives warn or not)."

Needs: the root's read of every child item's `expanded` state at first render (a level's sibling items, part of the same family).

Rule as documented usage: "The consumer should not bind more than one sibling item `expanded` at a level while `multiOpen` is off; every bound-open section still renders open, with no automatic close."

Mentions: user story 17, line 44; D8, line 499.

### misuse: expandAll() with multiOpen off warning

Location: Foundation contract table, line 91; API table, line 187-188.

Text:

````
| `showAll()` | `down()` on every submenu, also when `multiOpen` is `false` | `expandAll()`: opens every submenu while `multiOpen` is on; otherwise does nothing and warns in development (Nested menu; CDK's `openAll()` and Aria's `expandAll()` have the same rule) |
````

````
| `expandAll()` | method | | | `showAll()` | Delegates to `NfsMenuRoot.expandAll()`: opens every submenu while `multiOpen` is on; with it off, does nothing and warns in development |
````

Tests and stories: line 440 (browser-level test): "Methods: `expandAll()` opens every submenu with `multiOpen` on and does nothing plus one warning with it off ..."; story `accordion-menu--expand-collapse-all`, line 425 ("with `multiOpen` off, 'Expand all' changes nothing").

Needs: the root's own `multiOpen` input, read at call time; no shared code beyond the Nested menu root's `expandAll()` method it delegates to.

Rule as documented usage: "The consumer should not call `expandAll()` while `multiOpen` is off; it opens nothing."

Mentions: D7, line 498.

### misuse: Nested menu's copied-class and toggle-name checks (referenced)

Location: "Development-mode checks", line 199.

Text:

````
The Nested menu's own checks also apply: a copied Foundation class on an item, a submenu, or a toggle, naming what to bind (a pre-open `is-active` names `[expanded]`, a current-page `is-active` names `aria-current`, `submenu-toggle` names `hybrid`), ... a Hybrid toggle whose name is missing or outside its `span[nfsSubmenuToggleText]`, ...
````

Tests and stories: line 437 (browser-level test, "Foundation's docs markup" bullet): "the root renders `menu accordion-menu` without `vertical` and warns once naming `orientation`; ... the `is-active` submenu is closed and `inert` and warns once naming `[expanded]`; ... the leaf's `is-active` is stripped and warns once naming `aria-current`; the Hybrid toggle warns once naming `span[nfsSubmenuToggleText]`; no warning is emitted during a server render."

Needs: `HostAttributeToken('class')` reads on the Nested menu parts (canonical definition and code in `specs/nested-menu.md`, out of group a).

Rule as documented usage: "The consumer must not write Foundation's `vertical`, `is-active`, or `submenu-toggle` classes; use `orientation`, `[expanded]`, `aria-current`, and `hybrid` instead."

Mentions: none beyond the quoted lines. Boundary call: this passage's canonical home is `specs/nested-menu.md`; recorded here only because `accordion-menu.md` restates it and its own browser-level test (line 437) exercises it against this spec's root.

### family: Nested menu's structural placement/registration checks (referenced)

Location: "Development-mode checks", line 199.

Text:

````
... a span outside a Hybrid toggle, a parent item without a toggle, `expandAll()` with `multiOpen` off, and an item without a root.
````

Tests and stories: none specific to this file.

Needs: canonical definition in `specs/nested-menu.md` (out of group a).

Rule as documented usage: "Every `span[nfsSubmenuToggleText]` must sit inside a Hybrid toggle, every parent item must carry a toggle, and every item must sit inside a menu root."

Mentions: none beyond the quoted line. Boundary call: as above, canonical home is `specs/nested-menu.md`; the `expandAll()` clause in this same sentence is this file's own misuse check, already captured separately above (it is not a placement/registration check).

### build-time: nfs-accordion-menu Sass @error checks

Location: WCAG table rows 1.4.1, 1.4.11, 2.5.8, lines 283, 286, 296; D12, D18, line 503, 509; "Sass" subsection, line 623.

Text:

````
`nfs-menu` stops the compile below 3:1 against `$body-background`; `nfs-accordion-menu` stops it, naming the setting, below 3:1 against `$accordionmenu-item-background` when that is not `null`, because Foundation's `.accordion-menu a` paints every link with it and the current link's rule (specificity 0,2,1) outranks that one (0,1,1), so the pair is the fill against the item background (the Nested menu's Sass checks)
````

````
`nfs-accordion-menu` stops the compile with `@error` naming the setting when the ratio of `$accordionmenu-arrow-color` against its background is below 3: against `$accordionmenu-item-background` or else `$body-background` (the parent-button arrow, only while `$accordionmenu-arrows` is on) and against `$accordionmenu-submenu-toggle-background` when that is not `null` (the Hybrid toggle's arrow, which Foundation draws whatever `$accordionmenu-arrows` says)
````

````
`nfs-accordion-menu` stops the compile with `@error` when either toggle setting is below 24 px, or when a row (`1rem` plus twice the first value of `$accordionmenu-padding` or `$accordionmenu-submenu-padding`, through Foundation's `rem-calc()`) is below 24 px, because row height is a consumer setting and a small padding gives stacked rows under 24 px, where the spacing exception does not apply
````

````
Checks (no CSS output): `@error` naming the setting when the ratio of `$accordionmenu-arrow-color` against `$accordionmenu-item-background`, or else `$body-background`, is below 3 while `$accordionmenu-arrows` is on; when `$accordionmenu-submenu-toggle-background` is not `null` and the ratio of `$accordionmenu-arrow-color` against it is below 3, whatever `$accordionmenu-arrows` says (1.4.11); when `$accordionmenu-submenu-toggle-width` or `$accordionmenu-submenu-toggle-height` is below 24 px (2.5.8); when `1rem` plus twice the first value of `$accordionmenu-padding` or `$accordionmenu-submenu-padding`, converted with `rem-calc()`, is below `rem-calc(24)` (2.5.8, rows at line height 1; amended 2026-09-26, audit 0005 M1); and when `$menu-item-background-active`, the current link's fill, is below 3:1 against `$accordionmenu-item-background` while that is not `null` (1.4.1; the Nested menu's check, added 2026-09-28 under the class rule; `nfs-menu` checks the fill against `$body-background`).
````

Tests and stories: story `accordion-menu--current-page`, line 427 (computed-style 3:1/4.5:1 assertions); Node-level Vitest "Sass compile test", line 452 (`$duration`, `$accordionmenu-arrows: false`, failing-colour and failing-size cases for the arrow, toggle, padding, and current-fill checks); e2e text-spacing and reflow cases, lines 458-459 (exercise the clip/size rules the same mixin also emits as CSS, not the checks themselves).

Needs: the library's shared unrounded WCAG-contrast Sass helper (`math.pow`); Foundation's `rem-calc()`.

Rule as documented usage: "The consumer must keep `$accordionmenu-arrow-color`, `$accordionmenu-submenu-toggle-background`, and `$menu-item-background-active` (when `$accordionmenu-item-background` is set) at the stated contrast ratios (1.4.1, 1.4.11), and `$accordionmenu-submenu-toggle-width`/`-height` and the padding-derived row height at or above 24 px (2.5.8); nothing in Foundation's CSS stops a failing value from compiling."

Mentions: user story 35, line 62; user story 47, line 74; D12, D18, lines 503, 509.

### Kept (not a check), accordion-menu.md

- No check for a copied `accordion-menu` class on the root (D24, lines 199, 515) -- explicit absence: the binding is always `true`, so a copy merges and is not reported.
- No default-orientation check (D20, line 511) -- explicit absence.
- ARIA and keyboard behaviour (lines 243-273), `aria-expanded`/`aria-controls`/`inert` host bindings.
- `RouterLinkActive`/`ariaCurrentWhenActive` current-page marking (not a library check; Router/Angular behaviour).
- Completion outputs (`opened`/`closed`), animation timing, and hydration/rendering-mode behaviour (lines 378-404) -- functional.
- The library's own accessibility gate (axe on every story, line 418) and e2e suite.
- No Runtime checks for this file: no Variant registry or property of its own (line 106).

## specs/anchored-pane.md

This is a shared utility with no directive of its own selector (three injection-context functions consuming directives call); it declares no Variant, no Runtime check request, and no Library mixin (lines 127, 656: "No Variant class... Runtime check request"; "(6) Variant properties: none; the utility has no Variant class"). Its only checks are the Positioner's own dev-mode warnings.

### misuse: Positioner dev-mode warnings

Location: "API", "Positioner", line 201.

Text:

````
Dev-mode warnings (only when `ngDevMode`): a position and alignment on the same axis (`top` with `top`), treated as `center` as Foundation's formula does; negative offsets, which can make the pane cover its trigger (2.4.11); a placed element whose computed `position` is not `absolute`, which means the Foundation export mixin for the class its directive binds is missing (`foundation-dropdown`, `foundation-tooltip`), or, for a developer's own anchored element, that its Application class sets no `position: absolute`; the message names both. The utility reads no class for any of the three.
````

Tests and stories: line 442 (browser-level test): "Dev-mode warnings: same-axis alignment, negative offsets, a placed element that is not `position: absolute` (the message names the missing export mixin and the Application-class case); none for correct input, including a test host element styled `position: absolute` by an Application class."

Needs: reads only the calling directive's own `position`/`alignment`/`vOffset`/`hOffset` options and its own host's computed `position` style; no shared registry or cross-family read (the Positioner runs inside the consuming directive itself, so "its host" is that directive's own element).

Rule as documented usage: "The consumer must not set `position` and `alignment` to the same axis (it resolves to `center`); must not set a negative `vOffset`/`hOffset` (WCAG 2.4.11); and must include the matching Foundation export mixin (`foundation-dropdown`, `foundation-tooltip`) or give a custom anchored element `position: absolute` of its own."

Mentions: WCAG table row 2.4.11, line 355 ("dev warning below 0"); "Sass" subsection item 5, line 656 ("a missing Foundation export mixin, or an Application class without `position: absolute`, leaves the element unpositioned, which the dev-mode `position` check reports").

### misuse: copied legacy position class (referenced, owned by consuming specs)

Location: CSS class to Angular mapping table, line 122; user story 44, line 74; D22, line 512.

Text:

````
| Legacy `.top`, `.bottom`, `.left`, `.right`; `.float-left`, `.float-right` | Not read, not bound | None: the utility reads no class, and the Dropdown and Tooltip specs report a copied one in development | Dropped, `superseded`: `position` and `alignment` replace them (D22) |
````

Tests and stories: none in this file.

Needs: canonical definition and code live in `specs/dropdown.md` and `specs/tooltip.md` (out of group a); this utility "reads no class for any of the three" (line 201) and is explicitly not the owner.

Rule as documented usage: "The consumer must spell a pane's side and alignment with `position`/`alignment` inputs, never a legacy `.top`/`.float-right` class."

Mentions: user story 44, line 74 ("the consuming directive reports a copied class in development"); D22, line 512 ("both consuming specs dropped those reads"). Also line 401: "a Dropdown pane bound `[isOpen]="true"`, never a copied `.is-open`, which the pane's binding strips and its development check reports" -- a second copied-class check (the pane's `.is-open` State class), also owned by `specs/dropdown.md`, not this utility. Boundary call: both checks' home is the Dropdown and Tooltip specs, not this shared utility; recorded here only because this file documents that the utility itself performs no such read.

### Kept (not a check), anchored-pane.md

- The Light dismiss registry's rules (inside/ancestry, pointer, Escape, focus, sibling; lines 227-234) -- functional dismissal behaviour, not development-only checks.
- The hover-intent helper's timers and touch filtering (lines 251-255) -- functional.
- ARIA requirements imposed on consuming directives (lines 327-336) -- behavioural contract, not a check.
- No Variant input, no Variant registry/property, no Runtime check request, no Library mixin (lines 127, 412, 656) -- explicit absence.
- The library's own accessibility gate (axe on every story, line 422) and e2e suite.

## specs/badge.md

`NfsBadge` is one standalone directive with no parent, no children, no Parent token, and no host directives ("Nothing finds a badge through DI", line 103), so this file has no In-family checks / forgotten-import content (confirmed by search: no hits for `nfsDirectiveCheck`, `In-family`, `strictParents`, `strictDirectiveImports`, `Selector manifest`, `nfsReportForgottenPeer`, or `missing-imports`).

### misuse: no screen-reader text warning (D5)

Location: "API: NfsBadge", development-mode checks list, line 136; D5, line 325.

Text:

````
1. No text (D5). The host's text, from its text nodes outside any element with `aria-hidden="true"` (visually hidden text counts), or the non-blank `alt` of an `img` or the non-blank `aria-label` of an element with `role="img"` inside it (read as accessible-name computation reads an embedded image), is blank, the host is not itself `aria-hidden="true"`, and it is not `role="img"` with a non-blank `aria-label` or `aria-labelledby`: "nfsBadge: this badge has no text for screen readers; add visually hidden text that says what it shows, and aria-hidden="true" on its icon (WCAG 1.1.1). aria-label is not allowed on a badge without a role (axe aria-prohibited-attr)". The last sentence is added only when the host carries `aria-label`.
````

Tests and stories: line 266 (browser-level test): "Development text check: a badge with text, with only visually hidden text, with an `aria-hidden` icon beside hidden text, and holding only an `img` with a non-blank `alt` is silent; an icon-only badge warns once; a badge whose only text is inside `aria-hidden="true"` warns; `aria-label` on a badge without a role warns with the `aria-prohibited-attr` sentence; `role="img"` with `aria-label` or `aria-labelledby` is silent; a host with `aria-hidden="true"` is silent; the check runs once ...".

Needs: reads only the host's own content (text nodes, `alt`, `aria-label`, `aria-hidden`) in the directive's own `afterRenderEffect`; no shared code.

Rule as documented usage: "The consumer must give every `nfsBadge` text for screen readers (visible or visually hidden), or hide its icon with `aria-hidden='true'` and name it another way (WCAG 1.1.1)."

Mentions: user story 14, line 42; user story 15, line 43; WCAG table row 1.1.1, line 188; D5, line 325.

### misuse: copied palette class warning (D7)

Location: "API: NfsBadge", development-mode checks list, line 137; D7, line 327.

Text:

````
2. Copied classes (D7): a static class list that holds Foundation's default palette names warns, naming each class with its input, for example "class="alert" is set by nfsBadge: bind color="alert" instead". A copied Variant class is not stripped (the `[class]` list sets only its own classes), so it keeps styling until removed; a redundant `badge` merges with the static host class and is not reported; the consumer's own classes are not reported. Consumer-declared names are left to the Variant check (the Button spec's D22 rule).
````

Tests and stories: line 267 (browser-level test): "Copied classes: `class="badge alert"` warns once naming `color`; a redundant `class="badge"` and the consumer's own class do not warn."

Needs: `HostAttributeToken('class')`, injected optionally in development builds only (line 105: "in development builds only, `HostAttributeToken('class')` (optional) for the copied-class warning (D7)").

Rule as documented usage: "The consumer must not write a Foundation default palette class (`alert`, `success`, ...); bind `color` instead."

Mentions: user story 16, line 44; D7, line 327.

### misuse: badge on a link warning (D12)

Location: "API: NfsBadge", development-mode checks list, line 138; D12, line 332.

Text:

````
3. On a link (D12): the host is an `a` element: "nfsBadge: a badge is not a link's look; on a link, Foundation's link hover and focus colour replaces an uncoloured badge's text colour (1.27:1 on Foundation's defaults, WCAG 1.4.3), which axe does not test. Put the badge inside the link instead: <a href="..."><span nfsBadge>...</span></a>". It warns whatever `color` is, as the Label's check 3 does, because a coloured badge on a link fails as soon as its bound `color` becomes `undefined`.
````

Tests and stories: line 268 (browser-level test): "Link host: an `a` host warns once, with or without `color`; a badge inside a link does not."

Needs: reads only the host's own tag name; no shared code.

Rule as documented usage: "The consumer must not write `nfsBadge` directly on an `a` element; put the badge inside the link instead."

Mentions: WCAG table row 1.4.3, line 186 ("`NfsBadge` warns in development and the recipe puts the badge inside the link (D12)"); D12, line 332.

### runtime: NfsBadge Variant checks

Location: "API: NfsBadge", line 139; D11, line 331.

Text:

````
Runtime check: in the same read phase, on every run, `NfsBadge` calls `include('nfs-badge', ['badge-palette'])` whether or not `color` is bound, then `value('color', color, needs)` with the need `{setting: 'badge-palette', name: color}` for a one-token value and `null` otherwise (D11). `strictVariantNames` compares a bound `color` with `--nfs-badge-palette` and reports a value that is not one class token; `strictVariantProperties` reports a missing `@include nfs-badge;` when that property reads empty. Only `nfs-badge` writes it, so the one-writer rule holds. The report shape, the per-realm read, and the configuration are the Runtime checks' ([Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md)).
````

Tests and stories: line 270 (browser-level test): "Runtime check: with `--nfs-badge-palette: primary secondary success warning alert` on the test document, a listed `color` is silent; an unlisted `color` bound through a cast reports `strictVariantNames` once, naming the directive, the input, the value, and `$badge-palette`; in a test file of its own, with the property absent, a badge with no `color` reports `strictVariantProperties` once, naming `@include nfs-badge;`."

Needs: `nfsVariantCheck('nfsBadge')` handle of `ngx-foundation-sites/media-query` (line 105); the `--nfs-badge-palette` Variant property, which `nfs-badge` alone writes (also read by the Variant declaration tooling's generator, line 411 -- shared with that build-time tool, out of scope here).

Rule as documented usage: none (a runtime check enforces nothing new a consumer must do beyond what the build-time check and the typed `color` input already require; deferred with ADR 0040's other Runtime checks).

Mentions: user story 17, line 45; "Hierarchy and DI shape", line 105; D11, line 331; "Sass" item 5, line 411 ("the Variant property is absent, which the `strictVariantProperties` Runtime check reports in development, naming the include").

### build-time: nfs-badge Sass @error contrast checks

Location: WCAG table row 1.4.3, line 186; D8 (referenced), D9, D10, lines 329-330; "Sass" subsection item 1(c), line 407.

Text:

````
`nfs-badge` stops the compile with one `@error` naming the setting, the palette name, the colour, and both ratios for every pair under 4.5:1 (D8).
````

````
(c) Compile-time checks that emit no CSS, D8: one `@error` listing every failing pair, each with the setting, the palette name, the colour, and both ratios, computed by the library's exact relative-luminance helper (`math.pow`, a translucent colour composited over `$body-background` first), unrounded, never with Foundation's `color-luminance()`, whose approximate power overstates some ratios, or its `color-contrast()`, which rounds to one decimal (building-blocks 1.10): `$badge-color` on `$badge-background` under 4.5:1, and every `$badge-palette` entry whose better candidate is under 4.5:1.
````

Tests and stories: "Sass compile" bullets, lines 276-285 (Node-level Vitest): default settings fail naming `$badge-palette` alert; the required setting compiles and emits only the Variant property; a `$foundation-palette` merge alone still fails (D10); custom palettes with `purple`, `black/red/purple`, `pink: #e10f69` (D9's pick correction, a CSS rule, not itself a check), an `rgba()` entry, `#777777` and `#1177dd` (pins the exact helper against Foundation's `color-luminance()`), `$badge-background: #ffae00` with default and overridden `$badge-color`, and an empty `$badge-palette`.

Needs: the library's shared unrounded WCAG-contrast Sass helper (`math.pow`); Foundation's `color-pick-contrast()`, read only to learn which colour Foundation emitted (not to compute the check itself).

Rule as documented usage: "The consumer must set `$badge-palette` (Foundation's defaults need `alert: #bf3f2c`) so every entry's better text colour reaches 4.5:1 on its background, and `$badge-color` on `$badge-background` for the uncoloured badge; nothing in Foundation's CSS stops a failing value from compiling."

Mentions: user story 18, line 46; user story 19, line 47; user story 20, line 48; user story 21, line 49; D8 (defined via D9/D10 cross-references), D9, D10, lines 329-330; "Sass" item 5, line 411.

### Kept (not a check), badge.md

- The `nfs-badge` pick-correction CSS rule (Sass item 1(a), line 407; D9, line 329) -- an emitted CSS declaration, not a check.
- The `--nfs-badge-palette` Variant property the mixin writes (Sass item 6, line 412) -- a Library mixin's own CSS output, read by the runtime check above and by the Variant declaration tooling's generator (out of scope).
- ARIA and keyboard behaviour, `role="status"` usage (lines 160-178) -- consumer-written, not a library check.
- Typed `color` input and its compile errors (API section, lines 108-124).
- The library's own accessibility gate (axe on every story, line 253) and e2e/release-test suite.
- No parent/child DI, so no In-family checks (line 103) -- explicit absence.
- No development warning for a badge on a `button` or other focusable host, and no development check on text length (D12, D13, lines 332-333) -- explicitly rejected alternatives, not implemented.

## specs/breadcrumbs.md

### forgotten-import: In-family checks (Breadcrumbs family)

Location: "Hierarchy and DI shape", lines 116-118; cross-referenced at development check 7, line 164.

Text:

````
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part:
  - `NfsBreadcrumbs`: `nfsDirectiveCheck('NfsBreadcrumbs', {children: ['NfsBreadcrumbsItem']})`; no parent check, because it injects none; it probes `NfsBreadcrumbsItem`; no peers; `strictParents` changes nothing.
  - `NfsBreadcrumbsItem`: `nfsDirectiveCheck('NfsBreadcrumbsItem', {parent})`, its development-only `inject(NfsBreadcrumbs, {optional: true})` giving `found`. Parent check over `NfsBreadcrumbs`, with the `alone` sentence "Foundation's disabled look applies only inside the trail." (Foundation scopes `.disabled` under `.breadcrumbs`), which replaces development check 7, so an item outside a trail is reported once. No child probes. No peers. `strictParents`: it throws at construction when no trail is found.
````

````
7. No `NfsBreadcrumbs` above it in the injector tree: reported once by its In-family parent check (Hierarchy and DI shape), whose sentence says Foundation's disabled look applies only inside the trail; the item runs no check of its own for it.
````

Tests and stories: line 331 (browser-level test): "`nfsBreadcrumbsItem` outside a trail warns (check 7)".

Needs: the shared `nfsDirectiveCheck(class, {parent} | {children})` utility; `NfsBreadcrumbsItem`'s development-only `inject(NfsBreadcrumbs, {optional: true})` lookup (line 108, "in development builds only").

Rule as documented usage: "The consumer must import `NfsBreadcrumbs` and `NfsBreadcrumbsItem`, and must declare an `nfsBreadcrumbsItem` inside its own `ul[nfsBreadcrumbs]`/`ol[nfsBreadcrumbs]` template, not projected from another; a forgotten import or a misplaced item renders without Foundation's disabled look, with no error."

Mentions: "DI follows the declaration site" note, line 115 ("an item projected into a `ul[nfsBreadcrumbs]` from another template does not find it and warns in development").

### misuse: unnamed-landmark warning (check 1)

Location: "Development checks", line 155.

Text:

````
1. Landmark, the Pagination's check 1 with this component's name: the host has no `nav` or `[role=navigation]` ancestor, or that ancestor has neither `aria-label` nor `aria-labelledby`: "nfsBreadcrumbs: wrap the breadcrumbs in a named navigation landmark, for example <nav aria-label="Breadcrumb">".
````

Tests and stories: line 331: "a trail outside a `nav`, inside an unnamed `nav`, and inside a `div role="navigation"` with no name warn with check 1's text, and a `nav` with `aria-label` or `aria-labelledby` is silent".

Needs: reads only the host's own ancestor chain (the page); shares its wording and `afterEveryRender` self-destroying pattern with the Pagination spec's check 1 (out of group a).

Rule as documented usage: "The consumer must wrap the trail in a `nav` (or `[role=navigation]`) with `aria-label` or `aria-labelledby`."

Mentions: user story 11, line 41; user story 12, line 42; WCAG table row 1.3.1, line 215.

### misuse: copied Foundation class warning (check 2)

Location: "Development checks", line 156; "CSS class to Angular mapping", line 99.

Text:

````
2. Copied Foundation classes on the items: `disabled` on an `li` without the `nfsBreadcrumbsItem` attribute: "class="disabled" is set by nfsBreadcrumbsItem: write <li nfsBreadcrumbsItem disabled>"; `current` or `is-active` on any `li`, in the Pagination's words: "class="current" has no ARIA state: remove it and put aria-current="page" on the page's link" (Foundation's breadcrumbs CSS has no rule for either class, so the copy draws nothing either). A redundant `breadcrumbs` on the host merges with its static class and is not reported.
````

Tests and stories: line 331: "a copied `disabled` on a plain `li`, and a copied `current` or `is-active`, warn with check 2's texts".

Needs: reads only the host's own content (child `li` elements' static classes); no shared code.

Rule as documented usage: "The consumer must not write `disabled`, `current`, or `is-active` as classes on a step; use `nfsBreadcrumbsItem disabled` and `aria-current='page'`."

Mentions: user story 8, line 38; user story 9, line 39; "CSS class to Angular mapping" note, line 99.

### misuse: aria-current placement warning (check 3)

Location: "Development checks", line 157.

Text:

````
3. Current page placement: `aria-current`, present and neither `false` nor empty, on an `li` that holds a link, or on an element inside the host that is neither an `a` nor an `li`: "put aria-current on the current page's link, or on its item when the current page is text".
````

Tests and stories: line 331: "`aria-current` on an `li` holding a link and on a `span` warn (check 3), on a link or a text `li` are silent".

Needs: reads only the host's own content; no shared code.

Rule as documented usage: "The consumer must put `aria-current='page'` on the current page's link, or on its `li` only when the current page is plain text."

Mentions: user story 14, line 44.

### misuse: multiple current-page warning (check 4)

Location: "Development checks", line 158.

Text:

````
4. One current page: more than one element inside the host carries `aria-current` other than `false` or empty: "N steps carry aria-current: mark only the current page (with RouterLinkActive, bind [routerLinkActiveOptions]="{exact: true}")". `RouterLinkActive` without exact matching marks every ancestor of the current URL, and every step of a trail is one.
````

Tests and stories: line 331 ("two `aria-current` steps warn (check 4)"); line 332 (browser-level test): "without `{exact: true}` all three links carry it and check 4 warns once."

Needs: reads only the host's own content (every descendant's `aria-current`); no shared code.

Rule as documented usage: "The consumer must mark exactly one step `aria-current='page'`; with `RouterLinkActive`, bind `[routerLinkActiveOptions]=\"{exact: true}\"` on every step."

Mentions: user story 13, line 43; D12, line 393; Rendering modes, line 303.

### misuse: link without href warning (check 5)

Location: "Development checks", line 159.

Text:

````
5. Links: an `a` inside the host with no `href`: "a link without href is not focusable: add an href, or write the step as text with nfsBreadcrumbsItem disabled". A `[routerLink]` bound to `null` removes the `href` and is reported the same way.
````

Tests and stories: line 331: "an `a` without `href`, and `[routerLink]="null"`, warn (check 5)".

Needs: reads only the host's own content; no shared code.

Rule as documented usage: "The consumer must give every step link an `href`, or write a step with no page as `nfsBreadcrumbsItem disabled` text instead of an unfocusable link."

Mentions: user story 15, line 45.

### misuse: missing include warning (check 6)

Location: "Development checks", line 160.

Text:

````
6. Missing include: the first `a` inside the host has the computed `display` `inline`: "the links are under 24 px and the separators are read aloud: @include nfs-breadcrumbs; after foundation-breadcrumbs". Foundation's CSS leaves breadcrumb links inline and `nfs-breadcrumbs` makes them `inline-block` (measured in three engines), so an inline link means the include (or Foundation's breadcrumbs CSS) is missing.
````

Tests and stories: line 331: "with a test stylesheet that makes breadcrumb links `inline-block` the trail is silent, and without it check 6 warns".

Needs: reads only the host's own content's computed style; no shared code. This check also stands in for a Runtime check: "Runtime checks (ADR 0040): none. Breadcrumbs has no Variant input and its mixin writes no Variant property, so there is nothing for `strictVariantNames` or `strictVariantProperties` to read; check 6 covers the missing include instead, as the Pagination's check 5 does." (line 168)

Rule as documented usage: "The consumer must include `@include nfs-breadcrumbs;` after `foundation-breadcrumbs`; without it, links stay under 24 px and separators are read aloud."

Mentions: user story 17, line 47; line 168 (explicit statement that this replaces a Runtime check); "Sass" item 5, line 489.

### misuse: disabled step with link warning (check 8)

Location: "Development checks", line 165.

Text:

````
8. `disabled` with an `a` inside the item: "a disabled step is text: remove its link, or remove disabled". Foundation colours the link, not the item, so the step would look like a link and still navigate.
````

Tests and stories: line 331: "`disabled` over a link warns (check 8)".

Needs: reads only the item's own content (a nested `a`); no shared code.

Rule as documented usage: "The consumer must not put a link inside a step marked `nfsBreadcrumbsItem disabled`."

Mentions: user story 16, line 46.

### misuse: copied disabled class warning on item (check 9)

Location: "Development checks", line 166; "API: NfsBreadcrumbsItem", line 147.

Text:

````
9. A static `class` holding `disabled`, read through `HostAttributeToken('class')` in development builds only: "class="disabled" is set by nfsBreadcrumbsItem: bind disabled instead". The class is stripped while `disabled` is `false` and redundant while it is `true`; it is reported either way (building-blocks 1.4).
````

Tests and stories: line 331 ("a static `class="disabled"` warns (check 9)"); line 330 (browser-level test): "a static `class="disabled step"` with `disabled` `false` renders `class="step"`, and with `disabled` `true` renders both".

Needs: `HostAttributeToken('class')`, injected optionally in development builds only ("uses: ... in development builds only, `HostAttributeToken('class')`", line 109).

Rule as documented usage: "The consumer must not write the static `disabled` class on an `nfsBreadcrumbsItem`; bind the `disabled` input instead."

Mentions: user story 9, line 39.

### build-time: nfs-breadcrumbs Sass @error contrast checks

Location: WCAG table row 1.4.3, line 218; "Sass" subsection, line 481.

Text:

````
`nfs-breadcrumbs` stops the compile with `@error` naming the setting. A disabled step is text, not an inactive control, so the exemption does not apply.
````

````
Checks (no CSS output), one `@error` listing every failing colour with its setting and its exact unrounded ratio from the library's helper (a translucent colour composited over `$body-background` first; never Foundation's `color-luminance()`, whose approximate power overstates some ratios, or its `color-contrast()`, which rounds to one decimal, building-blocks 1.10): `$breadcrumbs-item-color`, `$breadcrumbs-item-color-current`, and `$breadcrumbs-item-color-disabled` on `$body-background` under 4.5:1 (1.4.3). Over Foundation 6.9.0's defaults: 4.6473, 19.6304, and 1.6252:1, so the compile stops on the disabled colour until the required setting is made.
````

Tests and stories: "Sass compile" bullets, lines 338-343 (Node-level Vitest): default settings fail naming `$breadcrumbs-item-color-disabled` at 1.625:1; the required setting compiles and emits the four rules; `$breadcrumbs-item-color: #1177dd` fails at 4.423:1 (pins the exact helper against Foundation's `color-luminance()` 4.357:1); `$breadcrumbs-item-color-current: $dark-gray` fails at 3.422:1; a translucent `$breadcrumbs-item-color-disabled: rgba(#0a0a0a, 0.5)` is composited first and fails at 3.708:1.

Needs: the library's shared unrounded WCAG-contrast Sass helper (`math.pow`).

Rule as documented usage: "The consumer must set `$breadcrumbs-item-color-disabled` (Foundation's default needs `#737373`) and keep `$breadcrumbs-item-color`/`$breadcrumbs-item-color-current` so every text colour reaches 4.5:1 on `$body-background`; nothing in Foundation's CSS stops a failing value from compiling."

Mentions: user story 18, line 48; user story 19, line 49; D5, D9, lines 386, 390; "Sass" item 5, line 489.

### Kept (not a check), breadcrumbs.md

- No Variant input, no Variant registry/property, and no `strictVariantNames`/`strictVariantProperties` Runtime checks (line 90, 168) -- explicit absence; check 6 above substitutes for the missing-include signal.
- ARIA and keyboard behaviour (lines 193-207) -- native, no library check.
- Typed `disabled` input and its compile errors (API section, lines 120-147).
- The Sass rules the mixin emits (current-page colour, drawn separator, float, target-size boxes; "Sass" item 1, line 477) -- CSS output, not a check.
- The library's own accessibility gate (axe on every story, line 318) and e2e/release-test suite.

## specs/breakpoint-service.md

This file is the shared home of ADR 0040's Runtime checks (`strictVariantNames`, `strictVariantProperties`, `strictBreakpointSync`) and, in the same `NfsRuntimeChecks` interface and the same two provider functions, of two ADR 0046 forgotten-import mechanisms (`strictDirectiveImports`, `strictParents`). No family/parent-child directive relationships exist here (it is one service, one token, and pure functions, "There is no directive family", line 146), so there are no In-family checks and no family-kind checks in this file.

**Boundary call:** the ticket's classification rule lists `provideNfsRuntimeChecks`, `provideNfsProductionRuntimeChecks`, and the `NfsRuntimeChecks` keys under the `runtime` bullet, and separately lists `strictDirectiveImports` and `strictParents` under the `forgotten-import` bullet. Both are true at once here, because this file's single `NfsRuntimeChecks` interface and its two provider functions configure all five keys together. Resolution: the interface, the report type, and the two provider functions are classified `runtime` below (the container), while `strictDirectiveImports` and `strictParents` -- two of its five keys -- are extracted as separate `forgotten-import` checks, per "the kind of what it reads" (forgotten-import first). A rewritten spec must keep the provider-function shape even after the forgotten-import checks move, because `strictVariantNames`/`strictVariantProperties`/`strictBreakpointSync` still need it.

### runtime: NfsRuntimeChecks configuration surface

Location: "Runtime checks", lines 347-408.

Text:

````
The library's Runtime checks (ADR 0040) live in this entry point beside the breakpoint drift check they grew from. There are four, and one flag, configured in the direction of NgRx's `runtimeChecks` (per-check flags over defaults), with this library's own production opt-in, which NgRx lacks; `strictDirectiveImports` and the `strictParents` flag are specified by the [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md):

```ts
export interface NfsRuntimeChecks {
  /** A rendered Variant value the compiled CSS has no class for (not in its --nfs-<setting> list), a value that is not one class token, or a Breakpoint query or rules key that cannot be parsed. */
  strictVariantNames: boolean;
  /** Variant properties missing from :root: a Library mixin include was forgotten. */
  strictVariantProperties: boolean;
  /** nfsBreakpointsToken and the Breakpoint properties disagree, or a Class breakpoint is missing from the token (ADR 0005's drift check). */
  strictBreakpointSync: boolean;
  /** A rendered element carrying a library directive's attribute with no library directive on it, or on an element no selector of that directive admits. Development builds only. */
  strictDirectiveImports: boolean;
  /** Off by default. In development builds, a part whose optional parent injection found nothing throws at construction. A flag, not a Runtime check; development builds only. */
  strictParents: boolean;
}

export interface NfsRuntimeCheckReport {
  readonly check: keyof NfsRuntimeChecks;
  readonly message: string;
  readonly directive?: string;
  readonly input?: string;
  readonly value?: unknown;
  readonly setting?: string;
  readonly names?: readonly string[];
}

/** Development overrides: every check but strictParents is on without this provider; it also starts strictDirectiveImports when no library directive runs; returns no providers when ngDevMode is false. */
export function provideNfsRuntimeChecks(checks?: Partial<NfsRuntimeChecks>): EnvironmentProviders;

/** Production opt-in, per check; all off unless listed; the only production code path that references the checker. */
export function provideNfsProductionRuntimeChecks(
  checks: Partial<Omit<NfsRuntimeChecks, 'strictDirectiveImports' | 'strictParents'>>,
  options?: {report?: (report: NfsRuntimeCheckReport) => void},
): EnvironmentProviders;
```
````

Also the configuration rules (line 395-400) and the "When and where" timing rules (line 402-407): defaults (all four checks on in development via `console.warn`, `strictParents` off; none in production); `provideNfsRuntimeChecks(checks)` switches checks off/on in development, returns no providers in production; `provideNfsRuntimeChecks()` also starts the `strictDirectiveImports` scan; `provideNfsProductionRuntimeChecks(checks, options)` is the only production code path that references the checker; both provided at application level only; browser-only after first render (`strictParents` excepted, which acts at construction including on the server); no DOM/listener writes; once per realm per check per distinct subject; a throwing `report` callback reaches `ErrorHandler`.

Tests and stories: line 511 ("Runtime checks. Reads and reports are once per realm..."); line 512 ("Configuration: with no provider all three checks report in a development build; `provideNfsRuntimeChecks({strictBreakpointSync: false})` silences the drift report and leaves the Variant checks on; ... in a development build `provideNfsProductionRuntimeChecks({strictVariantNames: true}, {report})` changes nothing"); lines 541-544 (production-bundle measurement: bundle contains none of the checker's text without the production call; with it, texts present and `report` receives a report).

Needs: an internal root token whose factory returns the development checker behind `typeof ngDevMode === 'undefined' || ngDevMode`, else `null`; an internal value token only `provideNfsRuntimeChecks` provides for development overrides (line 400).

Rule as documented usage: none (a runtime check enforces nothing new a consumer must do; deferred with ADR 0040's other Runtime checks per the ruling).

Mentions: user stories 44-49, lines 80-85; Solution section, line 31; Hierarchy diagram, lines 160-165; "Rendered output", line 345; D19, D27, D28, D31, lines 589, 597-598, 601.

### runtime: nfsVariantCheck (strictVariantNames, strictVariantProperties)

Location: "The Variant check: `nfsVariantCheck()`", lines 409-439.

Text:

````
export function nfsVariantCheck(directive: string): NfsVariantCheck | null;

export interface NfsVariantCheck {
  /** Presence only, no bound value needed: reports the mixin as missing when every listed property reads empty. `settings` are properties the mixin never leaves empty on Foundation's defaults. */
  include(mixin: string, settings: readonly string[]): void;
  /** One rendered Variant value: the names its class needs, `[]` when its class always exists, `null` when it maps to no class. */
  value(input: string, value: unknown, needs: readonly NfsVariantNeed[] | null): void;
}

export interface NfsVariantNeed {
  /** A Sass setting without `$`, read as `--nfs-<setting>`: 'button-palette', 'breakpoint-classes'. */
  readonly setting: string;
  /** A name the property must list, or a number its count must reach. */
  readonly name: string | number;
}
````

Plus the report-message templates (line 435-437): `strictVariantProperties` example ("nfsButton found none of --nfs-button-palette, --nfs-button-sizes on :root. Add \`@include nfs-button;\` after its Foundation export mixin...") and `strictVariantNames` example ("nfsButton color \"purple\" has no class in the compiled CSS: $button-palette generates primary secondary success warning alert. Add it to $button-palette, or regenerate the Variant declaration file if it still lists purple.").

Tests and stories: lines 509-517 (browser-level test): the whole "Runtime checks" subsection -- presence (`strictVariantProperties`), names (`strictVariantNames`), formats (comma list, line-broken list, count), and timing (nothing read/reported before first `whenStable()`) cases, using a test host directive that calls `nfsVariantCheck('nfsProbe')`; Node-level test, line 520 ("the checker's pure Variant property reader over an empty value, whitespace only, ... duplicates, and `12`"); SSR smoke, line 521 (a probe directive that reports a value its absent property does not list; no report on the server); production-bundle measurement, lines 541-544.

Needs: the Variant property format of the Variant declaration tooling spec (out of scope here, cross-referenced); the `--nfs-<setting>` custom properties each directive's `include()`/`value()` calls name, written by that directive's own Library mixin (shared with the build-time checks and the Variant declaration tooling's generator, out of scope).

Rule as documented usage: none (enforces nothing new beyond the typed Variant input and the required Library mixin include, both stated elsewhere as documented usage; deferred per the ruling).

Mentions: user story 44, line 80; user story 45, line 81; user story 46, line 82; user story 47, line 83; user story 52, line 88; Hierarchy diagram, line 164; "Rendered output", line 345; D29, D30, lines 599-600.

### runtime: strictBreakpointSync

Location: "`strictBreakpointSync`, the drift check", lines 441-456.

Text:

````
It runs once per realm in the service's go-live `earlyRead` callback, so only in applications that construct the Breakpoint service. From `getComputedStyle(documentElement)` it reads:

1. `--nfs-breakpoint-<name>` for each name of the Breakpoint map, trimmed and parsed as `px` (unregistered custom properties compute to their specified text, for example `640px`);
2. `--nfs-breakpoint-classes`, the Class breakpoints;
3. `--nfs-breakpoint-<name>` for each Class breakpoint the map lacks.

Outcomes, in one report:

- Every map property is empty: "ngx-foundation-sites [strictBreakpointSync]: no --nfs-breakpoint-* custom properties were found on :root. Add `@include nfs-breakpoint-properties;` after `@import 'ngx-foundation-sites';` in the stylesheet that compiles Foundation, so this check can compare nfsBreakpointsToken with your Sass $breakpoints."
- Some differ, some are missing, or a Class breakpoint is missing from the token: one report listing each name with both values, for example "ngx-foundation-sites [strictBreakpointSync]: nfsBreakpointsToken and your Sass $breakpoints disagree: medium is 640px in the token and 768px in --nfs-breakpoint-medium; xxlarge is missing from the CSS; xlarge is a Class breakpoint in --nfs-breakpoint-classes (1200px) but missing from the token. Provide nfsBreakpointsToken with the values of your Sass $breakpoints (in px)." `setting` is `breakpoints` and `names` lists the names that disagree.
- All match within 0.01 px: nothing.
````

Tests and stories: line 511 ("`strictBreakpointSync` (one file per outcome): no properties produces the include report; a style block with `--nfs-breakpoint-medium: 768px` produces the drift report naming `medium` with both values; a `--nfs-breakpoint-classes: small medium large xlarge` beside a map without `xlarge` reports `xlarge` with its `--nfs-breakpoint-xlarge` value; matching properties produce nothing..."); fixture e2e, line 539 ("The drift report does not appear (the fixture includes the Breakpoint properties); a second fixture route built without the include logs the `strictBreakpointSync` include report once.").

Needs: the `--nfs-breakpoint-<name>` and `--nfs-breakpoint-classes` custom properties written by `nfs-breakpoint-properties` (also read by `strictVariantNames` for every responsive Variant input and by the Variant declaration tooling, out of scope).

Rule as documented usage: none (enforces nothing new a consumer must do beyond keeping `nfsBreakpointsToken` and Sass `$breakpoints` in step, which the "documented usage" text elsewhere already states as a plain instruction; deferred per the ruling).

Mentions: user story 3, line 39; user story 50, line 86; D19, D20, D26, lines 589-590, 596.

### forgotten-import: strictDirectiveImports

Location: `NfsRuntimeChecks` interface, line 359-360 (quoted in the configuration-surface check above); Runtime checks table, line 390; configuration text, line 397, 404-405.

Text:

````
| `strictDirectiveImports` | A rendered element carrying a library directive's attribute with no library directive on it; a library attribute on an element no selector of its directive admits | The DOM, the development host record, the Selector manifest, `ng.getOwningComponent` | One `afterEveryRender` callback per application, started by the first library directive or by `provideNfsRuntimeChecks()` | Same form | Never (the production provider does not accept it) |
````

````
`provideNfsRuntimeChecks()` also adds an environment initializer that starts the `strictDirectiveImports` scan, the only start for an application whose templates instantiate no library directive; its argument is optional, and the install docs put `provideNfsRuntimeChecks()` in every application configuration.
````

Tests and stories: covered indirectly through the Runtime checks configuration tests (line 512); the check's own DOM-scan behavior and its "host record"/"Selector manifest" mechanics are specified in `specs/forgotten-import-checks.md` (out of group a).

Needs: "the development host record, the Selector manifest, `ng.getOwningComponent`" (line 390) -- all defined in `specs/forgotten-import-checks.md`.

Rule as documented usage: "The consumer must import every library directive class they use; a forgotten import renders the Foundation markup without ARIA or state, with no error."

Mentions: Runtime checks intro, line 349 ("`strictDirectiveImports` and the `strictParents` flag are specified by the [Spec: forgotten-import checks (shared utility)]"); Rendering modes, line 405 ("The Runtime checks never run there [`hydrate never`]"); Solution section, line 31.

### forgotten-import: strictParents flag

Location: `NfsRuntimeChecks` interface, line 361-363 (quoted in the configuration-surface check above); Runtime checks table, line 391.

Text:

````
| `strictParents` (a flag, not a Runtime check) | Throws at construction when an optional parent injection that the forgotten-import checks list found nothing | The part's injection result | `nfsDirectiveCheck`, at construction, on the server and in the browser | Off; `provideNfsRuntimeChecks({strictParents: true})` opts in | Never |
````

Tests and stories: covered through the Runtime checks configuration tests (line 512); the flag's throw behavior is specified in `specs/forgotten-import-checks.md` (out of group a).

Needs: `nfsDirectiveCheck`'s per-part parent-injection result, defined in `specs/forgotten-import-checks.md`.

Rule as documented usage: "An application developer who opts into `strictParents` accepts that a part with a forgotten or missing required-by-convention parent throws at construction in development, including on the server."

Mentions: Runtime checks intro, line 349; Rendering modes, line 404 ("`strictParents` is the exception: it acts at construction, on the server too"); Solution section, line 31.

### misuse: NfsMediaQuery's own API-misuse warnings (excluded from Runtime checks)

Location: "What stays outside the Runtime checks", lines 458-460; Foundation contract table rows for `atLeast`/`upTo`/`is`, lines 105-108; Deltas from Foundation, lines 125-126; API section, lines 194, 238, 250, 254, 284.

Text:

````
The service's own development diagnostics are not Runtime checks: the warning for an unknown breakpoint name or modifier in `atLeast`, `upTo`, `is`, `resolve`, or a named-query token; the warnings for invalid Breakpoint rule tokens; and the error for an invalid Breakpoint map or Server breakpoint at construction. They report misuse of this API, not drift between TypeScript and the compiled CSS, read no CSS, and stay development-only behind `ngDevMode` with no switch, as before.
````

````
Development builds throw a descriptive error at service construction for an invalid map or a `serverBreakpoint` that is not a key; production builds skip validation.
````

````
Unknown modes and breakpoints warn in development at parse time and are skipped; Foundation stores `undefined` and throws when that breakpoint later matches. Unknown names never throw; they warn once per distinct string in development and answer `false`.
````

Related instances: `parseNfsBreakpointRules` -- "invalid tokens are skipped with a development-mode warning" (line 238) and "A repeated breakpoint keeps the last token and warns" (line 250); named-query tokens -- "any other unknown token warns and answers `false`" (line 254); server-breakpoint handoff -- "A transferred name the client's map lacks warns in development and falls back to the client token" (line 284).

Tests and stories: line 506 (browser-level test): "Validation: a map without `0`, with duplicate values, or with an unknown `serverBreakpoint` throws the development-mode error at construction; an unknown name in `atLeast`, `is`, or a named query token warns once per string and answers `false`."; line 507: "Transfer: a `TransferState` seeded with a name absent from the client map warns and falls back to the client token."; Node-level test, line 520 (`parseNfsBreakpointRules` table-driven cases for unknown modes, unknown breakpoints, repeated breakpoints, extra whitespace; map validation and sorting).

Needs: reads only the service's own construction-time inputs (`nfsBreakpointsToken`'s map/`serverBreakpoint`) and call-time arguments (a name, modifier, rule token, or query string a caller passed in); no shared checker infrastructure, no CSS read -- explicitly distinct from the Runtime checks above.

Rule as documented usage: "The consumer must pass a valid Breakpoint map (unique finite values with exactly one `0`) and a `serverBreakpoint` that is one of its keys, and must spell breakpoint names, modifiers, and rule tokens correctly; an invalid map throws at construction, and an unknown name or token is ignored with `false`."

Mentions: user story 31, line 67; user story 33, line 69; D14, D21, line 584, 591.

### Kept (not a check), breakpoint-service.md

- `current`, `reducedMotion`, `atLeast`/`upTo`/`only`/`is`/`resolve`/`matches`/`get` as functional API, not checks (lines 209-230).
- The four ARIA/behavioural rules the service imposes on consuming directives (focus continuity, no server-bound hiding, reduced motion, no announcements; lines 304-311) -- requirements on consuming specs, not this file's own checks.
- The Server breakpoint handoff, `TransferState`, and hydration/rendering-mode mechanics (lines 462-476) -- functional.
- `nfs-breakpoint-properties`'s CSS output (`--nfs-breakpoint-*`, `--nfs-breakpoint-classes`; "Sass" section, lines 779-786) -- a Library mixin's CSS/property output, not a check; it is read BY the runtime checks above.
- The library's own accessibility gate (axe on every story, line 485) and e2e suite.
- No family/parent-child directive relationships in this file, so no In-family checks (line 146) -- explicit absence.

## specs/button-group.md

`NfsButtonGroup` has no token, no providers, no host directives, and no Defaults token ("No token, no providers, no host directives, no Defaults token (D2, D3)", line 116); its Variant classes reach `nfsButton` hosts through Foundation's CSS descendant selectors, not DI, so there is no forgotten-import mechanism here (confirmed by search: no hits for `nfsDirectiveCheck`, `In-family`, `strictParents`, `strictDirectiveImports`, `Selector manifest`, `nfsReportForgottenPeer`, or `missing-imports`). It also emits "no compile-time check of its own" (D13, line 399): the label/arrow contrast pairs its Sass rules produce are checked by `nfs-button` (`specs/button.md`, also in group a), not by `nfs-button-group`.

### family: button size-inside-group warning (dev check 1)

Location: "API: NfsButtonGroup", development checks list, line 162; D5, line 391.

Text:

````
1. A button inside the group (from the content query) with `size` set to a value other than `'default'` warns "size on an nfsButton inside nfsButtonGroup has no effect: Foundation's group rule resets its buttons to the default size; set size on nfsButtonGroup".
````

Tests and stories: line 347 (browser-level test): "a button with `size="small"` in a group warns once and `size="default"` does not".

Needs: `contentChildren(NfsButton, {descendants: true})`, a development-only query read only by the development checks (line 117: "Children: a `contentChildren(NfsButton, {descendants: true})` query, read only by the development checks (building-blocks 1.9: `contentChildren` is used only for development validation)").

Rule as documented usage: "The consumer must set `size` on `nfsButtonGroup`, not on a button inside it; Foundation's group rule resets every button to the default size."

Mentions: user story 12, line 38; D5, line 391 ("Measured in three engines: Foundation's group rule resets every button to the default size...").

### family: group/button color conflict warning (dev check 2)

Location: "API: NfsButtonGroup", development checks list, line 163; D5, line 391.

Text:

````
2. A button with `color` set while the group's `color` is set warns "color is set on nfsButtonGroup and on an nfsButton inside it: the group's colour wins on solid groups, and on hollow and clear groups the name later in $button-palette wins; set it in one place".
````

Tests and stories: line 347: "`color` on both the group and a button warns once, and on only one of them does not".

Needs: the same `contentChildren(NfsButton, {descendants: true})` query as dev check 1.

Rule as documented usage: "The consumer must set `color` on either the group or its buttons, never both; the group's colour wins on solid groups, and the name later in `$button-palette` wins on hollow/clear groups."

Mentions: user story 13, line 39; D5, line 391.

### family: group/button fill conflict warning (dev check 3)

Location: "API: NfsButtonGroup", development checks list, line 164; D5, line 391.

Text:

````
3. A button with `fill` set while the group's `fill` is set warns "fill is set on nfsButtonGroup and on an nfsButton inside it: a group fill other than your $button-fill replaces the button's; set it in one place".
````

Tests and stories: line 347: "the same for `fill`".

Needs: the same `contentChildren(NfsButton, {descendants: true})` query as dev check 1.

Rule as documented usage: "The consumer must set `fill` on either the group or its buttons, never both; a non-default group fill replaces a button's own."

Mentions: user story 13, line 39; D5, line 391.

### misuse: stacked-with-stackedFor warning (dev check 4)

Location: "API: NfsButtonGroup", development checks list, line 165; D6, line 392.

Text:

````
4. `stacked` and `stackedFor` both set warns "stacked and stackedFor are both set: stackedFor unstacks the group from the next breakpoint up; bind one of them".
````

Tests and stories: line 347: "`stacked` with `stackedFor` warns once".

Needs: reads only the group's own two inputs; no shared code.

Rule as documented usage: "The consumer must bind only one of `stacked` or `stackedFor`; together, `stackedFor` unstacks the group from the next breakpoint up."

Mentions: user story 14, line 40; D6, line 392.

### misuse: copied Foundation class warning (dev check 5)

Location: "API: NfsButtonGroup", development checks list, line 166; D7, line 393.

Text:

````
5. A static class list holding a Foundation class the directive sets warns once, naming each class with its input, for example "class="small primary" is set by nfsButtonGroup: bind size="small" and color="primary" instead"; a Flexbox alignment class is reported as "class="align-center" is a Flexbox Utilities class: use that spec's directive beside nfsButtonGroup". The check knows the closed names (`solid`, `hollow`, `clear`, `expanded`, `stacked`, `stacked-for-small`, `stacked-for-medium`, `no-gaps`), Foundation's default size and palette names, and the four alignment names of the docs page; a redundant `button-group` merges with the static host class and is not reported.
````

Tests and stories: line 347: "a static `class="small primary hollow no-gaps stacked-for-small align-center"` warns once, naming `size`, `color`, `fill`, `noGaps`, `stackedFor`, and the Flexbox Utilities directive, and the copied classes stay in the rendered class list; a redundant static `button-group` and the consumer's own classes are not reported".

Needs: `HostAttributeToken('class')`, injected optionally in development builds only (line 118: "in development builds only, `HostAttributeToken('class')` (optional) reads the static class list for the copied-class warning").

Rule as documented usage: "The consumer must not write Foundation's group Variant classes (size, palette, fill, `expanded`, `stacked`, `stacked-for-*`, `no-gaps`) or the Flexbox alignment classes as static classes; bind the matching input, or use `nfsFlexAlign` beside the group for alignment."

Mentions: user story 15, line 41; D7, line 393.

### runtime: NfsButtonGroup Variant check

Location: "API: NfsButtonGroup", line 167; D11, line 397.

Text:

````
Variant check: `NfsButtonGroup` creates the handle `nfsVariantCheck('nfsButtonGroup')` (development builds, and production only when the consumer lists the checks in `provideNfsProductionRuntimeChecks`) and, in its read phase, calls `include('nfs-button', ['button-palette', 'button-sizes'])` on every run, naming `nfs-button`, the one writer of both properties (D11), then `value()` for a bound `color` and `size`. `strictVariantNames` compares them with `--nfs-button-palette` and `--nfs-button-sizes`; `strictVariantProperties` reports a missing `@include nfs-button;` when both read empty, because `nfs-button` is the one writer of both properties (D11). The report shape, the per-realm read, and the configuration are the Runtime checks' ([ADR 0040](../adr/0040-variant-input-types.md)).
````

Tests and stories: line 349 (browser-level test): "Runtime check (the Variant check): with a style block standing in for the `nfs-button` Variant properties, a listed `color` is silent; an unlisted `color` bound through a cast reports `strictVariantNames` once, naming `NfsButtonGroup`, the input, the value, and `$button-palette`; in a test file of its own, with no style block, one `strictVariantProperties` report names `@include nfs-button;`."; SSR smoke, line 354 ("no Runtime check reports on the server").

Needs: `nfsVariantCheck(directive)` from `specs/breakpoint-service.md` (this group); the `--nfs-button-palette` and `--nfs-button-sizes` properties, which `nfs-button` alone writes (D11) -- shared with button.md's own Variant check (same properties, same writer).

Rule as documented usage: none (a runtime check enforces nothing new a consumer must do beyond the typed `color`/`size` inputs and the required `nfs-button` include; deferred per the ruling).

Mentions: user story 29, line 55; Hierarchy and DI shape, line 118; D11, line 397.

### Kept (not a check), button-group.md

- No compile-time check of its own in `nfs-button-group` (D13, line 399) -- the arrow-color and no-gaps-floor rules it emits are CSS output; the contrast/size checks for those same pairs belong to `nfs-button` (`specs/button.md`).
- ARIA and keyboard behaviour (lines 201-217) -- native, no library check; a named `role="group"` is the consumer's own choice (D4), not checked; D4 explicitly rejects "a development check for an unnamed group" as an alternative (line 390).
- Typed Variant inputs (`size`, `color`, `fill`, `expanded`, `stacked`, `stackedFor`, `noGaps`) and their compile errors (API section, lines 121-150).
- The `nfs-button-group` Sass rules (arrow colour, no-gaps floor; "Sass" section, line 451) -- CSS output, not a check.
- The library's own accessibility gate (axe on every story, line 330) and e2e suite.

## specs/button.md

`NfsButton` has "No parent, no children, no Parent token, no host directives, no providers. Nothing needs to find a button through DI" (line 130), so there is no forgotten-import mechanism here (confirmed by search: no hits for `nfsDirectiveCheck`, `In-family`, `strictParents`, `strictDirectiveImports`, `Selector manifest`, `nfsReportForgottenPeer`, or `missing-imports`).

### misuse: disabled link still has href warning

Location: "API: NfsButton", development checks, line 194.

Text:

````
Dev-mode checks, in the one `afterRenderEffect` read phase below, only when `ngDevMode` is on (never on the server, never in production), each warning once per instance: an `<a>` host that is `disabled` but still has an `href` warns "disabled link still navigates: bind its href or routerLink to null"; ...
````

Tests and stories: line 371 (browser-level test): "a disabled `<a>` with an `href` warns once"; e2e, line 391 ("clicking the disabled router link leaves the URL unchanged").

Needs: reads only the host's own `disabled` input and `href` attribute; no shared code.

Rule as documented usage: "The consumer must bind a disabled link's `href` (or `routerLink`) to `null`; a disabled link that still has an `href` still navigates."

Mentions: user story 22, line 50; D8, line 424.

### misuse: enabled link with no href warning

Location: "API: NfsButton", development checks, line 194.

Text:

````
... an `<a>` host that is not `disabled` and has no `href` warns "a placeholder link is not focusable: use button[nfsButton] or add an href"; ...
````

Tests and stories: line 371: "an enabled `<a>` with no `href` warns once"; line 259 (WCAG table, 2.1.1 row): "Foundation's `<a class="button">` without `href` in its Button Group examples is not focusable, which the dev-mode placeholder-link warning reports".

Needs: reads only the host's own `disabled` input and `href` attribute; no shared code.

Rule as documented usage: "The consumer must give an enabled `nfsButton` link an `href`, or use `button[nfsButton]` instead; a link with no `href` is not focusable."

Mentions: user story 23, line 51; "Foundation behaviour changed or dropped", line 535.

### misuse: arrowOnly/dropdown mismatch warning (D21)

Location: "API: NfsButton", development checks, line 194; D21, line 437.

Text:

````
... `arrowOnly` without `dropdown`, or either on an `<input>` host, warns "no dropdown arrow can render here: arrowOnly needs dropdown, and an <input> draws no ::after arrow; use button[nfsButton] dropdown" (D21); ...
````

Tests and stories: line 371: "`arrowOnly` without `dropdown` warns once, and so does `dropdown` on an `<input>` host; ... `dropdown arrowOnly` on a `<button>` do[es] not warn."

Needs: reads only the host's own `dropdown`/`arrowOnly` inputs and host tag (read once at construction via `ElementRef`, line 132); no shared code.

Rule as documented usage: "The consumer must set `dropdown` whenever `arrowOnly` is set, and must not set either on an `<input>` host, which draws no arrow."

Mentions: user story 45, line 73; D21, line 437.

### misuse: copied Foundation class warning (D22)

Location: "API: NfsButton", development checks, line 194; D22, line 438.

Text:

````
... a static class list that holds a Foundation class the directive sets or replaces warns once, naming each class with its input, for example "class="small alert" and class="disabled" are set by nfsButton: bind size="small", color="alert", and [disabled] instead", and "class="submit" has no effect: write type="submit"" (D22). The copied-class check knows the closed names (`disabled`, `submit`, `solid`, `hollow`, `clear`, `expanded`, `dropdown`, `arrow-only`), the responsive `-expanded` pattern, and Foundation's default size and palette names; a redundant `button` merges with the static host class and is not reported.
````

Tests and stories: line 371: "a static `class="small alert hollow medium-expanded disabled submit"` warns once, naming `size`, `color`, `fill`, `expanded`, `disabled`, and `type="submit"`, and the copied `disabled` is absent from the rendered class list while the copied Variant classes remain; a redundant static `button` and the consumer's own classes are not reported."

Needs: `HostAttributeToken('class')`, injected optionally in development builds only (line 132: "In development builds only, `HostAttributeToken('class')` (optional) reads the static class list for the copied-class warning (D22)").

Rule as documented usage: "The consumer must not write `disabled`, `submit`, or any of the closed/palette/size Variant class names as static classes; bind the matching input (`[disabled]`, `type='submit'`, `size`, `color`, `fill`, `expanded`, `dropdown`, `arrowOnly`) instead."

Mentions: user story 46, line 74; D22, line 438; "Foundation behaviour changed or dropped", lines 532-533.

### runtime: NfsButton Variant check

Location: "API: NfsButton", line 195; D19, line 435.

Text:

````
Variant check: `NfsButton` creates the handle `nfsVariantCheck('nfsButton')` (development builds, and production only when the consumer lists the checks in `provideNfsProductionRuntimeChecks`) and, in its `afterRenderEffect` read phase, calls `include('nfs-button', ['button-palette', 'button-sizes'])` on every run, never the flag-gated `button-responsive-expanded`, then `value()` for each bound `color`, `size`, and responsive `expanded`. `strictVariantNames` compares `color`, `size`, and the Breakpoint of a responsive `expanded` with `--nfs-button-palette`, `--nfs-button-sizes`, and `--nfs-button-responsive-expanded`, and reports any value that is not one class token or a query it cannot parse. A responsive `expanded` value (every query except the Zero breakpoint's `up` form, which sets `.expanded`) whose Breakpoint `--nfs-button-responsive-expanded` does not list is reported naming `$button-responsive-expanded`, since that list is empty while the flag is off. `strictVariantProperties` reports a missing `@include nfs-button;` when `--nfs-button-palette` and `--nfs-button-sizes` both read empty, never from the gated property, which is empty by default (D19). The report shape, the per-realm read, and the configuration are the Runtime checks' ([ADR 0040](../adr/0040-variant-input-types.md)).
````

Tests and stories: line 372 (browser-level test): "Runtime check (the Variant check, ADR 0040): with a style block standing in for the `nfs-button` Variant properties, a listed `color` is silent; an unlisted `color` bound through a cast reports `strictVariantNames` once, naming the directive, the input, the value, and `$button-palette`; `expanded="medium"` with an empty `--nfs-button-responsive-expanded` reports once, naming `$button-responsive-expanded`; in a test file of its own, with no style block, one `strictVariantProperties` report names `@include nfs-button;`; `provideNfsRuntimeChecks({strictVariantNames: false})` silences the name reports."; SSR smoke, line 377 ("no Runtime check reports on the server").

Needs: `nfsVariantCheck(directive)` from `specs/breakpoint-service.md` (this group); the `--nfs-button-palette`, `--nfs-button-sizes`, and `--nfs-button-responsive-expanded` properties, which `nfs-button` alone writes (D19) -- `--nfs-button-palette`/`--nfs-button-sizes` also read by `specs/button-group.md`'s Variant check.

Rule as documented usage: none (enforces nothing new beyond the typed Variant inputs and the required `nfs-button` include, both documented usage elsewhere; deferred per the ruling).

Mentions: user story 43, line 71; D19, line 435.

### build-time: nfs-button Sass @error contrast checks

Location: WCAG table rows 1.4.3, 1.4.11, 1.4.1, lines 256-257, 262; D16, line 432; "Sass" section item 2, line 539.

Text:

````
The `nfs-button` mixin checks label contrast (4.5:1), arrow contrast (3:1), and the disabled lightness difference (3:1) at compile time with `@error`, unrounded, with each arrow colour computed from Foundation's rules under the consumer's `$button-fill`
````

````
No button label is large text (`.large` is 20 px at normal weight), so 4.5:1 applies at every size; disabled buttons are exempt as inactive components. The `nfs-button` mixin checks every pair at compile time and stops with `@error` naming the setting and the fill.
````

````
The same compile-time check covers it [the dropdown arrow] at 3:1, computing each arrow colour from Foundation's rules under the consumer's `$button-fill`.
````

````
the `nfs-button` compile-time check computes both from `$button-opacity-disabled` and stops with `@error` when neither reaches 3:1 [the enabled/disabled lightness difference, 1.4.1].
````

Tests and stories: "Sass compile" bullet, line 379 (Node-level Vitest): default palette fails naming `alert`, `success`, and `warning` (solid/hollow/clear and the solid arrow); the required palette compiles and emits the minimum-size rule, no solid-arrow rule, and the three Variant properties; `$button-fill: hollow` with the required palette emits the solid-arrow restoration rule and compiles; `$button-opacity-disabled: 0.6` with the required palette fails the 1.4.1 check; a `$button-background`/`$button-color` pair at 4.49:1 fails although Foundation's `color-contrast()` reports 4.5. Story-level axe `color-contrast` covers the resting state only (line 256).

Needs: the library's shared unrounded WCAG-contrast Sass helper (`math.pow`); Foundation's `color-pick-contrast()`, read as emitted and not corrected (D23, line 439).

Rule as documented usage: "The consumer must set `$button-palette` (Foundation's defaults need `alert: #bf3f2c`, `success: #177a3d`, `warning: #8a5a00`) so every label and arrow pair reaches its ratio (1.4.3, 1.4.11), and must keep `$button-opacity-disabled` low enough that the enabled/disabled states differ by at least 3:1 (1.4.1); nothing in Foundation's CSS stops a failing value from compiling."

Mentions: user story 41, line 69; user story 42, line 70; user story 44, line 72; D16, D17, D18, D23, lines 432-434, 439.

### Kept (not a check), button.md

- ARIA and keyboard behaviour, the native disabled/placeholder-link/`disabledInteractive` contract (lines 224-247) -- native platform behaviour, not a library check.
- Typed Variant inputs (`size`, `color`, `fill`, `expanded`, `dropdown`, `arrowOnly`) and their compile errors (API section, lines 139-170).
- The `nfs-button` Sass rules (minimum-size floor, solid-arrow restoration; "Sass" section item 1, line 539) -- CSS output, not a check.
- The library's own accessibility gate (axe on every story, line 348) and e2e suite.

## Counts and boundary calls

Verified by a mechanical count of every `### forgotten-import:`, `### family:`, `### misuse:`, `### runtime:`, and `### build-time:` heading in this file (`rg -n "^### (forgotten-import|family|misuse|runtime|build-time):"`), 59 checks total.

### Counts per kind

- forgotten-import: 8 (abide.md 2, accordion.md 2, accordion-menu.md 1, breadcrumbs.md 1, breakpoint-service.md 2 [strictDirectiveImports, strictParents])
- family: 11 (abide.md 4, accordion.md 2, accordion-menu.md 2, button-group.md 3)
- misuse: 28 (abide.md 1, accordion.md 5, accordion-menu.md 2, anchored-pane.md 2, badge.md 3, breadcrumbs.md 8, breakpoint-service.md 1, button-group.md 2, button.md 4)
- runtime: 6 (badge.md 1, breakpoint-service.md 3 [configuration surface, nfsVariantCheck, strictBreakpointSync], button-group.md 1, button.md 1)
- build-time: 6 (abide.md 1, accordion.md 1, accordion-menu.md 1, badge.md 1, breadcrumbs.md 1, button.md 1)

### Counts per file

- specs/abide.md: 8 checks (forgotten-import 2, family 4, misuse 1, build-time 1)
- specs/accordion.md: 10 checks (forgotten-import 2, family 2, misuse 5, build-time 1)
- specs/accordion-menu.md: 6 checks (forgotten-import 1, family 2, misuse 2, build-time 1)
- specs/anchored-pane.md: 2 checks (misuse 2)
- specs/badge.md: 5 checks (misuse 3, runtime 1, build-time 1)
- specs/breadcrumbs.md: 10 checks (forgotten-import 1, misuse 8, build-time 1)
- specs/breakpoint-service.md: 6 checks (runtime 3, forgotten-import 2, misuse 1)
- specs/button-group.md: 6 checks (family 3, misuse 2, runtime 1)
- specs/button.md: 6 checks (misuse 4, runtime 1, build-time 1)

### Boundary calls (all, collected)

1. `specs/accordion-menu.md`, "Development-mode checks" line 199: the sentence mixes a misuse-kind clause (copied Foundation classes, Hybrid toggle naming) with family-kind clauses (span outside a toggle, parent item without a toggle, item without a root); split into two entries, both marked as canonically owned by `specs/nested-menu.md` (out of group a), recorded here only because `accordion-menu.md` restates them and tests them against its own root.
2. `specs/anchored-pane.md`, CSS mapping line 122 and D22 line 512: the copied-legacy-position-class check is textually about this utility ("the utility reads no class") but its check is implemented and owned by `specs/dropdown.md` and `specs/tooltip.md` (out of group a); classified misuse and recorded as a reference only.
3. `specs/breakpoint-service.md`: `provideNfsRuntimeChecks`, `provideNfsProductionRuntimeChecks`, and the `NfsRuntimeChecks` interface are classified `runtime` (the ticket's own bullet lists them there), even though two of the interface's five keys (`strictDirectiveImports`, `strictParents`) are `forgotten-import` per the same ticket's other bullet. Resolution: the configuration surface is one `runtime` entry; `strictDirectiveImports` and `strictParents` are extracted as separate `forgotten-import` entries, by "the kind of what it reads" (forgotten-import first).
4. `specs/breakpoint-service.md`: the service's own "unknown breakpoint name/modifier/rule token/invalid map" diagnostics are explicitly stated in the source as NOT Runtime checks ("What stays outside the Runtime checks", line 458). Classified `misuse` (they read only the service's own construction-time and call-time inputs), not `runtime`, honoring the source's own exclusion.

Everything else classified in this manifest was single-kind by its own wording; no other boundary call was needed.

### Unsure / flagged for the orchestrator

- `specs/button-group.md`'s three dev checks (1-3) read via a `contentChildren(NfsButton, {descendants: true})` query -- classified `family` because they read another directive instance's inputs, distinct from `specs/accordion.md`'s and `specs/breadcrumbs.md`'s misuse-kind checks that read only their own host's static content. If the family-checks spec (ticket 160) draws its boundary at "reads via DI/registration" rather than "reads any other directive instance," these three may need reclassifying; flagged for that ticket's author.
- `specs/breadcrumbs.md` checks 2-6 (copied classes, `aria-current` placement/count, missing `href`, missing include) all read the host's own descendant DOM (not a registered peer instance), so they were classified `misuse` rather than `family`, in contrast to `specs/button-group.md`'s content-query checks above. This is a judgment call about what counts as "another part of the family" versus "its own content"; flagged for ticket 160's author to confirm the line.
