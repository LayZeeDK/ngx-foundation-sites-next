# 31. Spec: Abide

Type: grilling
Status: resolved
Blocked by: 14, 38, 49
Labels: wayfinder:grilling
Map: ../map.md

## Question

What is the Angular design for Foundation's Abide plugin in the next library, and what does its spec say?

The result must be the best combination of: Foundation for Sites SCSS and the plugin's features; the ARIA APG pattern and WAI-ARIA; WHATWG HTML and HTML5+ platform features; Angular Aria; Angular CDK; Angular Material-equivalent accessibility and Material-equivalent component API (inputs, outputs, public properties and methods, content and view projection) for the similar Material component; and the modern DI patterns recorded in `research/di-and-composition-patterns.md` (lightweight injection tokens, host-scoped providers, host directives, parent tokens, default-options tokens). One plugin may yield several related directives or components (for example a container plus items plus a lazy-content directive); the spec covers the whole set.

Read first: `building-blocks.md`, `CONTEXT.md`, `adr/*.md`, the research files `research/foundation-inventory-forms-media.md`, `research/angular-22-api-survey.md`, `research/web-platform-features.md`, `research/angular-material-reference.md`, `research/aria-apg-patterns.md`, `research/di-and-composition-patterns.md`, `research/angular-rendering-modes.md`, and the resolved answers of every prototype and shared-utility spec ticket this ticket is blocked by. Zoom into the resolved tickets they came from when a claim needs its source. Consult the `/angular-developer:angular-developer` skill (its references live under `~/.claude/plugins/cache/angular-skills/angular-developer/*/references/`, including `signal-forms.md`, `angular-aria.md`, `naming-conventions.md`, `host-elements.md`) and the repo skill at `.claude/skills/foundation-api-design/SKILL.md` for the API design document shape. Where that skill says to read `COMPONENT_BUILDING_BLOCKS.md` or the old `*_API_DESIGN.md` files, read `building-blocks.md` from this effort instead.

Run `/grill-with-docs` (self-grilling, both sides) over these questions, then publish the spec with `/to-spec` to `specs/abide.md`. The spec is a `/to-spec` spec: its top-level sections are exactly the to-spec template (Problem Statement, Solution, User Stories, Implementation Decisions, Testing Decisions, Out of Scope, Further Notes). The foundation-api-design material lives inside those sections as subsections: under Implementation Decisions put the CSS class to Angular mapping table, the directive or component hierarchy, the proposed API per directive or component (inputs, outputs, model signals, public methods, projection slots, DI tokens), the ARIA requirements table, the keyboard table, the rendered HTML structure, and the comparison with the Material counterpart; under Further Notes put usage examples and the design decisions table. Prose describes the API; short type-level signatures are allowed where prose would be less precise, and no file paths.

1. Directive or component, and the element or markup it attaches to; how it honours Foundation's CSS class contract.
2. Which Implementation level (platform, Aria, CDK, custom) it lands on, per the building-blocks map, and what a prototype must prove if the map flagged a risk. If a question cannot be settled from sources, write the precise prototype question under `## Prototype needed` in the answer so the orchestrator can create a prototype ticket; do not guess.
3. The ARIA pattern, roles, attributes, and keyboard table.
4. Every input (from Foundation's `data-*` options), its type, default, and whether it is `input()` or `model()`; every output (from Foundation's events); public methods if any.
5. State model in signals; zoneless behaviour; and the rendering-modes contract from `research/angular-rendering-modes.md` and ADR 0008: server render output and first-paint state, what must not run before hydration, full and incremental hydration (`@defer (hydrate on ...)`) boundaries, prerendering, event replay readiness (which listeners replay, and `preventDefault()` ordering), and behaviour inside `@defer` blocks.
6. Animation and reduced-motion behaviour.
7. Foundation behaviours dropped or changed, with the reason.
8. Testing seams, per the map's Testing rule and the testing section of `building-blocks.md`: story play functions (Storybook on `@storybook/angular-vite` with `@storybook/addon-vitest`), browser-level tests (the stack is set by the browser testing stack decision ticket; write them stack-neutral until it resolves), node-level Vitest (a server-render smoke test and pure logic), and Playwright e2e (web-native APIs, the static Storybook build, and the prerendered fixture app for hydration and pre-hydration clicks), in the spec's Testing Decisions.

Plugin-specific questions:

- The validator set (`required`, patterns such as `email`, `url`, `number`, `date`, `color`, `equalTo`, `data-validator`, `data-abide-ignore`), `liveValidate`, `validateOnBlur`, `validateOn`, `formErrorSelector`, `labelErrorClass`, `inputErrorClass`, `formErrorClass`, `a11yAttributes`, `a11yErrorLevel`, `validateOnFormChange`, and the `.form-error.is-visible` markup.
- Signal Forms versus Reactive Forms as the model; Constraint Validation API (`:user-invalid`, `setCustomValidity`) as the platform Implementation level; whether the directive is a bridge that maps any Angular form control's status to Foundation's error classes.
- How Foundation's pattern names map to Angular or platform validators, and which are dropped.
- Do Foundation's 17 named patterns compile and behave under the `v` regex flag (check each with a Node script; record any that need rewriting)?
- Error message association: `aria-describedby`, `aria-invalid`, live announcement.

Two guards from the research-wave audit (`audits/0001-research-wave.md`, findings H6 and M12):

- The option names in the plugin-specific questions above were written while charting, before the inventories existed, and some are wrong or missing. Take the option, event, and method list from the Foundation inventory research and Foundation's own `defaults` object in the plugin source, not from this ticket.
- Platform features outside the map's browser target (see `research/web-platform-features.md`; for example `popover`, CSS anchor positioning, `<details name>`, `interpolate-size`, `@starting-style`, `:has()`, invoker commands) may appear only as a named future upgrade or behind a stated fallback, as the building-blocks decision already ruled.

Use the glossary's vocabulary. Add glossary terms to `CONTEXT.md` and ADRs to `adr/` only when the domain-modeling bar is met. The ticket answer holds the decision log (each question and the answer chosen, with its source); the spec holds the synthesis.


## Answer

Resolved 2026-09-26. Spec: [specs/abide.md](../specs/abide.md).

Gist: five attribute directives on Foundation's form markup, driven by Signal Forms field state with Reactive Forms as a courtesy: `form[nfsAbide]` (the Error-state policy `validateOn`/`liveValidate`/`validateOnBlur`, `a11yErrorLevel`, a `submitted` signal from the native `submit` event, and a `ready` signal), `[nfsAbideInput]` (self-injects `FORM_FIELD`, else `NgControl`; `.is-invalid-input`, `aria-invalid`, `aria-describedby` to visible errors only; Enter flush; adoption of values typed before hydration), `label[nfsAbideLabel]` (`.is-invalid-label`), `[nfsFormError]` (`.form-error`, `.is-visible` per `formErrorOn` kind, generated `id`, `role="alert"`), and `[nfsAbideAlert]` (the Form alert, `hidden` until a submit fails). Links go through the enclosing `nfsAbideLabel` or a typed template reference, never Abide's DOM lookup. Validation is Signal Forms; the library exports `nfsPatterns` (Foundation's 17 patterns, all under the `v` flag, 7 rewritten with escape-only changes and 0 mismatches) and `nfsEqualTo()`. No library CSS; five Foundation settings make the invalid state pass WCAG 2.2 AA. Worked as a self-grilling against the sources in the brief; every question and the answer settled on is below.

### Decision log

Each entry: the question, the answer, the source.

1. **Directive or component?** Five attribute directives on consumer-written markup; no component. Foundation's form markup already carries every element. Source: ADR 0001; building-blocks Table A.
2. **Label, Form errors, and Form alert: explicit directives or Abide's DOM lookup?** Explicit directives (`label[nfsAbideLabel]`, `[nfsFormError]`, `[nfsAbideAlert]`). The alert's `hidden` is first-paint state that 1.11 decision 1 requires as a server-rendered host binding; the always-on `a11yAttributes` roles then render on the server; 1.5 limits `Renderer2` writes; the prototype's flat-markup trap disappears; links are typed. The DOM route stays the fallback. Source: prototype decision 6 and result "Flat markup"; building-blocks 1.5, 1.11; proposed ADR below.
3. **How does a label or error find its field?** The enclosing `nfsAbideLabel` through `nfsAbideLabelToken` (wrapping-label markup needs no references), else a typed template reference `[nfsAbideLabel]="ref"` / `[nfsFormError]="ref"` (`exportAs: 'nfsAbideInput'`); the bare attribute means "the enclosing label's field". Replaces `data-form-error-for`. Source: ADR 0013 target shape; building-blocks 1.9 links between non-nested elements.
4. **Field state source?** `inject(FORM_FIELD, {self: true, optional: true})` first, then `NgControl` `{self, optional}`; Reactive state through `control.events`. Source: prototype decision 1; Material `MatInput` (`input.ts` injections); `form_field.ts` provides `InteropNgControl`.
5. **The Error-state policy?** One pure function, `invalid && (submitted || (liveValidate && dirty) || (validateOnBlur && touched) || (validateOn === 'fieldChange' && changed))`, exported as `nfsAbideErrorState`; `changed` from a `(change)` host listener. Source: prototype decision 2 and the failing `dirty && touched` case; Material `ErrorStateMatcher`.
6. **Where do the policy options live, and is there a Defaults token?** On `NfsAbide` as inputs, seeded from `nfsAbideDefaultsToken` (`validateOn`, `liveValidate`, `validateOnBlur`, `a11yErrorLevel`); a form-less `nfsAbideInput` reads the token. No per-input matcher. Source: building-blocks 1.4 and 1.9 defaults tokens; Foundation's options are form-level.
7. **`validateOn` values?** `'fieldChange' | null`; any other string is manual, as Foundation binds nothing then. Source: `Abide.defaults.validateOn` and its `_events` code.
8. **How do `changed` and `submitted` reset?** Both are `linkedSignal`s: `changed` resets when the field's `dirty` changes; `submitted` resets when every registered field is untouched again, which Signal Forms `reset()` and Reactive `reset()` produce. No native `reset` listener (a native reset button does not reset a Signal Forms model). Source: `FieldState.reset()` in `api/types.ts`; building-blocks 1.4 `linkedSignal`.
9. **Does a programmatic `submit(form)` count as submitted?** No; the docs direct consumers to `form.requestSubmit()` or a submit button, so `FormRoot` and `nfsAbide` see the same event. Signal Forms has `submitting` but no submitted state. Source: `api/types.ts` (`submitting`), `form_root.ts`.
10. **Enter-key flush?** `(keydown.enter)` on `input` hosts calls `FieldState.markAsTouched()`; not on `textarea` (newline) or `select`, and not under Reactive Forms (`FormGroupDirective` syncs pending controls on submit). Source: prototype decision 3.
11. **`aria-invalid`: Foundation or Material?** `"true"` whenever the error shows (Foundation); the policy already hides errors on pristine fields, so Material's empty-and-required case does not arise. Never on `input[type=radio]`: WAI-ARIA lists `aria-invalid` for `radiogroup`, not `radio`, and ARIA 1.2 deprecates it as a global. Source: `w3c/aria` `aria-invalid` definition and role tables; Material reference section 8.
12. **`aria-describedby`?** Consumer ids (input aliased `aria-describedby`, Material's `userAriaDescribedBy`) plus the ids of visible Form errors only. Source: prototype decision 5; `MatInput`.
13. **Per-field announcement (4.1.3)?** `role="alert"` on each Form error unless the consumer set a role (Abide's `a11yAttributes`; ARIA19); Material's polite container needs a wrapper Foundation markup lacks. Screen-reader behaviour of several alerts at once is OPEN FOR HUMAN (assistive technology). Source: prototype addendum "WCAG 2.2 AA audit" (4.1.3 row); Material reference section 8.
14. **`a11yErrorLevel`?** Kept as a form input: `assertive` -> `role="alert"`, `polite` -> `role="status"`, `off` -> no role on the Form alert; a static consumer role wins. Source: `Abide.defaults.a11yErrorLevel`.
15. **Form alert visibility?** `hidden` while not (`submitted && invalid`); it hides as soon as the form is valid (Abide waited for the next submit). Source: prototype `showAlert`; Abide `validateForm`.
16. **Every `Abide.defaults` option mapped or dropped?** `validateOn`, `liveValidate`, `validateOnBlur`, `a11yErrorLevel` -> inputs; `a11yAttributes` -> always on; `labelErrorClass`, `inputErrorClass`, `formErrorClass`, `formErrorSelector` -> Dropped options (classes are the contract); `patterns` -> `nfsPatterns`; `validators` -> `nfsEqualTo` plus `validate()`. `validateOnFormChange` is not an option. Source: `Abide.defaults`; building-blocks 1.4; audit 0001 H6.
17. **Events and methods?** No outputs, no public methods; field state signals and Signal Forms' `onInvalid` cover the five `*.zf.abide` events; each method's replacement is listed in the spec. Source: building-blocks 1.4 event mapping; ADR 0006.
18. **Do the 17 patterns compile under `v`?** A Node 24 script (seeded corpus, about 20,000 strings per pattern; positive control `[a-]` throws under `v`) found: `alpha`, `alpha_numeric`, `card`, `cvv`, `domain`, `date`, `time`, `dateISO`, `color` compile unchanged; `integer`, `email`, `month_day_year`, `day_month_year` fail under `v` only (unescaped `-`, `{`, `|`, `}` in classes); `number` and `url` fail under `u` too (`\,`; unescaped `(`, `)`, `{`, `}`); `datetime` fails on `\:` and `\-` outside a class. All seven rewrites are escape-only and matched Foundation on every string (0 mismatches); every source also compiles as an HTML `pattern` body `^(?:source)$` with `v`. `website` (an object with `test()`) becomes one RegExp union, 0 mismatches on 25,451 strings. Source: Foundation 6.9.0 `Abide.defaults.patterns`; the script's output.
19. **Pattern names and fixes?** camelCase keys (`alphaNumeric`, `monthDayYear`, `dayMonthYear`; `dateISO` kept); `date` gains the missing `^` anchor (Foundation accepts `xx2026-09-26`, a source bug); `card` keeps the source's Mastercard 2-series range; `alpha` stays ASCII with `\p{L}` shown in docs; exactly the `v` flag, never `g`/`y` (`pattern()` calls `test()`); built with `new RegExp(source, 'v')` when the TypeScript target is below ES2024. Source: building-blocks 1.4 camelCase; `pattern.ts`; Abide docs on alpha.
20. **`equalTo`, `data-validator`, `data-min-required`, `data-abide-ignore`?** `nfsEqualTo(path, other, {message})` with kind `equalTo`; custom validators are `validate()` rules whose kind `formErrorOn` targets; min-required is a documented `validate()` recipe per checkbox path; ignore is no rule or `disabled()`/`hidden()`, which Signal Forms skips (`shouldSkipValidation`). Source: ADR 0006; `field/validation.ts`.
21. **Constraint Validation attributes mirrored?** Signal Forms mirrors `required`, `min`, `max`, `minlength`, `maxlength`; the library adds nothing (no `pattern` attribute, no `setCustomValidity`), because Signal Forms deliberately does not mirror `pattern` and its guide says not to rely on native validity. This reverses Table B's "library binds it". Source: `directive/bindings.ts`, `form_field.ts` `elementAcceptsNativeProperty`; the Signal Forms validation guide, "Native HTML validation".
22. **`:user-invalid` for CSS-only styling?** Not in library CSS (same guide; divergence from field state). Documented only for JavaScript-free forms. Source: as 21; web-platform research section 13.
23. **`inputmode` for card, cvv, number?** Documented per pattern (`numeric` for card and cvv with `autocomplete`, `decimal`/`numeric` only when no sign is expected), not bound: the directive cannot know which pattern is meant. Source: web-platform research section 19.
24. **Value rescue: ship or document?** Ship it (adoption of values typed before hydration), guarded to run only when the saved value differs from what the control shows after the first forms write and is not empty or unchecked (the prototype's rule would have marked server-prefilled fields dirty). Mechanism: write back and dispatch `input` (plus `change` for checkbox and radio) so each control parses through its own path; fallback `controlValue.set()` (proven for text and checkbox). Source: prototype result "with the rescue", addendum 3.3.7 row; Slider's adoption rule in Table B. Triage below.
25. **Pre-hydration submit: stance?** Default: server-rendered forms bind a native `disabled` on the submit control to `!nfsAbide.ready()`; progressive-enhancement forms use `method="post"` instead. Native `disabled`, not `disabledInteractive` (ADR 0011: a one-field form would submit implicitly). Recommend `form(model, schema, {name})` for predictable names. Source: prototype result "Submit before hydration", addendum 3.3.7 row; HTML implicit submission; CWE-598; `api/structure.ts` `name` option; proposed ADR below. Triage below.
26. **Contrast (1.4.3, 1.4.11)?** The five settings from the prototype addendum, stated as requirements in the spec's Sass subsection and the story preview settings: `$input-error-color`, `$form-label-color-invalid`, `$input-background-invalid` at `#bf3f2c` (5.25:1; placeholder on tint 4.55:1), `$input-placeholder-color: #737373` (4.70:1), `$input-border: 1px solid #8a8a8a` (3.42:1). I re-measured the defaults with Foundation's own `color-contrast()` and exact ratios (4.498:1 text, 3.937:1 placeholder on tint, 1.625:1 resting border) and agree. Source: prototype addendum; my Sass probe.
27. **Other WCAG 2.2 AA criteria?** Recorded in the spec's criteria table: 1.3.5 (`autocomplete` in examples), 1.4.1 (dev warning for an error with no visible text), 2.5.8 (native checkboxes are user-agent controls, wrapped in labels; axe `target-size` on), 3.3.1, 3.3.2, 3.3.3 (`formErrorOn`), 3.3.4 (consumer's review step; invalid forms never run the action), 3.3.7 (entries kept; adoption; `ready`), 3.3.8 (no paste blocking), 4.1.3 (`role="alert"`). Source: prototype addendum; WCAG 2.2 Understanding documents as cited there.
28. **Focus after a failed submit?** Not built in (Foundation does not move focus); documented recipe `onInvalid: (f) => f().errorSummary()[0]?.fieldTree().focusBoundControl()`. Source: Signal Forms field state guide, `focusBoundControl()` section; rendering-modes research checklist row.
29. **Implementation level?** Custom Angular on Signal Forms; CDK only for `_IdGenerator`; no Aria. Not used: `provideSignalFormsConfig({classes})`. Source: ADR 0006; prototype decision 7.
30. **Rendering modes?** Pristine server HTML with all first-paint state as host bindings; only a `value` read at construction; `change` and `submit` replay without `preventDefault()`; one hydration boundary for the whole form; `hydrate on interaction` works with adoption; Abide forms do not go in `hydrate never` (1.11 decision 7's "native constraint attributes keep working" is refined). Source: ADR 0008; rendering-modes research section 7 checklist row; prototype SSR results.
31. **Animation?** None; Foundation toggles `display`. Source: `forms/_error.scss`.
32. **Testing seams?** Four layers per ADR 0018 with the wording from the browser testing stack decision (it resolved while this ticket ran; the spec uses its final wording instead of the stack-neutral placeholder); 13 story ids; the pre-hydration typing and submit cases on the fixture app. Source: ADR 0018; building-blocks 1.12.
33. **Five skill-versus-source corrections?** Taken from the clone, as the prototype found (`when` on every validator, `null` is valid, both `submit` overloads, `validateAsync` exists, `FORM_FIELD`/`FormRoot`/`controlValue`/`markAsTouched` absent from the skill). The spec relies only on clone-verified APIs. Source: prototype results "Skill vs clone".

### Triage

Rated per the map's triage rule (impact: hard to reverse; confidence: evidence-backed rather than a bare default).

| Item | Impact | Confidence | Outcome |
| --- | --- | --- | --- |
| Pre-hydration submit stance (entry 25) | Medium: an additive `ready` signal plus documented guidance; switching guidance later touches no shipped behaviour | High: prototype evidence (the GET with the password in the URL), WCAG 3.3.7 Understanding, CWE-598, HTML's implicit-submission rule for a disabled default button, ADR 0011's one-field caveat | Decided: submit disabled until `ready()`, `method="post"` for progressive enhancement |
| Value rescue (entry 24) | Low: internal behaviour, no API | High: proven in three engines, required by 3.3.7 per the addendum, consistent with Slider | Decided: ship it; the event-based mechanism for all types is a Prototype needed item with the proven fallback |
| Explicit directives versus DOM lookup (entry 2) | High: public selectors | High: the effort's own rules (1.5, 1.11 decision 1) and the prototype's trap finding | Decided; proposed ADR |
| `nfsPatterns` keys and fixes (entries 18, 19) | High: exported names | High: 1.4 camelCase rule, script evidence | Decided |
| `aria-invalid` form (entry 11) | Low | High: WAI-ARIA applicability | Decided |
| `pattern` attribute not bound (entry 21) | Low: additive later | High: Signal Forms guide | Decided |
| Screen-reader behaviour of `role="alert"` errors (entry 13) | Medium | Not high | Human-only regardless (needs assistive technology): OPEN FOR HUMAN 1 |
| Upstream Angular reports | n/a | n/a | Human-only regardless (outward-facing): OPEN FOR HUMAN 2 |

### OPEN FOR HUMAN

1. **Screen-reader check of the error announcements** (needs assistive technology). Default applied: `role="alert"` on every Form error and on the Form alert (Abide's `a11yAttributes`, ARIA19), which the prototype asserted structurally. Competing option: Material's single `aria-live="polite"` container, which Foundation markup has no element for. What to hear: a failed submit with four errors (several alerts plus the Form alert at once), an error appearing on blur while focus lands on the next field, and error text inside a wrapping label, which becomes part of the input's name once visible.
2. **Upstream Angular issues** (outward-facing; the user's confirmation required), carried from the prototype's items 1 to 3: (a) `submit()` does not flush debounced child fields (`field/node.ts` `markAsTouched` flushes only the root), which the library works around with the Enter flush; (b) hydration overwrites values typed or checked before hydration for every `[formField]` and Reactive control, which the library works around with adoption; (c) a dehydrated Signal Forms form submits natively with generated `name` attributes (`FormField` renders `name`, `FormRoot` renders `novalidate`), which the library works around with `ready`. The library's defaults do not depend on the answers.

## Prototype needed

One prototype ticket extending the Signal Forms prototype workspace; the spec's defaults hold until it reports.

1. **Groups and other controls under the explicit directives.** Radio groups (one Signal Forms field bound to several radios: do classes, `aria-describedby` to one shared Form error by reference, and no `aria-invalid` on radios behave and pass axe?), a checkbox group with the per-checkbox min-required recipe, `select`, `textarea`, and one custom `FormValueControl`. Default assumed: each control carries `nfsAbideInput`; radios share field state so their classes move together; `label[nfsAbideLabel]` only on `label` (a `legend` host is added only if the prototype shows it is needed).
2. **Event-based value adoption for every native type and for Reactive Forms.** On the prerendered fixture app with the bundle held back: text, email, password, number, date, checkbox, radio, `select`, `textarea`, under Signal Forms and Reactive Forms: does write-back plus a dispatched `input` (and `change` for checkbox and radio) in `afterNextRender` keep each value, parse it to the model type, mark the field dirty, and leave a server-prefilled untouched field clean? Default assumed: yes; fallback `controlValue.set()` plus `control.setValue()` and `markAsDirty()`.
3. **The `ready` pattern end to end.** A pre-hydration click on the disabled submit control and a pre-hydration Enter in a field: no navigation, no query string, in three engines; the control enables in the first client pass without a hydration mismatch; inside `@defer (hydrate on interaction)` the first keystroke hydrates and the typed character survives. Default assumed: as specified.

### Proposed glossary terms

**Error-state policy**:
The rule that decides when a field's validation errors are shown (after a committed change, while typing, after leaving the field, or after a submit), as opposed to whether the field is invalid.
_Avoid_: validation mode, error matcher, validateOn (as the name of the whole rule)

**Form error**:
A consumer-written message element (`.form-error`) tied to one field and, optionally, to one error kind, shown only while that field's errors are shown.
_Avoid_: error message (bare), inline error, hint (which is `.help-text`)

**Form alert**:
The one form-level message (Foundation's `[data-abide-error]` box) shown while a submitted form is invalid.
_Avoid_: global error, error summary, abide error

**Pre-hydration input**:
A value the user typed, checked, or selected in a server-rendered control before hydration, which hydration overwrites unless the directive adopts it.
_Avoid_: lost input, early input, queued value

### Proposed ADR

1. [adr/0026-abide-explicit-error-directives.md](../adr/0026-abide-explicit-error-directives.md): "Abide's label, Form errors, and Form alert are explicit directives, not Abide's DOM lookup". Hard to reverse (public selectors), surprising (Foundation and the prototype use DOM lookup), a real trade-off (verbatim markup versus server-rendered bindings and typed links).
2. [adr/0027-abide-pre-hydration-submit.md](../adr/0027-abide-pre-hydration-submit.md): "Server-rendered Abide forms keep their submit control disabled until the form is ready". Surprising (a disabled submit at first paint), a real trade-off (no-JavaScript submission versus a secret leak and a 3.3.7 failure), and it adds public API (`ready`).

### Proposed building-blocks changes

1. Table A, Abide row, selector sketch: keep the five selectors and add "links: the enclosing `nfsAbideLabel` (DI) or a typed template reference; no DOM lookup". Primitives: add `linkedSignal`, `HostAttributeToken`; remove `validate`/`pattern`/`debounce` from the library's primitives (they are the consumer's schema) and add the exported `nfsPatterns`/`nfsEqualTo`. Reason: entries 2, 3, 8, 18.
2. Table B, Abide row, platform features: replace "`:user-invalid` for CSS-only styling; `inputmode` on card/cvv/number patterns; ...; `pattern` attribute not mirrored (library binds it)" with "Constraint attributes `required`/`min`/`max`/`minlength`/`maxlength` mirrored by Signal Forms; no `pattern` attribute, no `setCustomValidity`, no `:user-invalid` rule (Signal Forms: do not rely on native validity); `inputmode` documented per pattern, not bound; `nfsPatterns` carry the `v` flag so their source works in a consumer-written `pattern`". Reason: entries 21 to 23.
3. Table B, Abide row, DI shape: add `nfsAbideLabelToken`; "`nfsFormError` registers with its field, whose `aria-describedby` lists visible errors only". Material counterpart: replace "`aria-invalid` null while empty-and-required" with "not borrowed: `aria-invalid="true"` whenever shown, never on radios". Reason: entries 3, 11, 12.
4. Table B, Abide row, rendering: add "values typed before hydration are adopted in `afterNextRender`; submit controls stay natively disabled until `nfsAbide.ready()`; `change` and `submit` replay without `preventDefault()`". Open risks cell: "Resolved by the prototype; the `v`-flag check found 7 of 16 regexes needing escape-only rewrites". Reason: entries 18, 24, 25.
5. 1.11 decision 7, `hydrate never` residue: replace "native constraint attributes for Abide keep working" with "Abide forms do not go in `hydrate never` (Signal Forms never runs and the `ready`-bound submit stays disabled); a JavaScript-free form is a plain `method="post"` form whose native constraint attributes validate". Reason: entry 30.

### Other proposed shared-file changes

- CONTEXT.md: the four terms above, in an "Abide" or "Forms" subsection under "Angular side" (Pre-hydration input could sit next to **Replayed event**).
- Map, Decisions so far: one line for this ticket.

### Amendment, 2026-09-26

Folded into `specs/abide.md` from the [Prototype: Abide control kinds, value adoption, and the ready gate](66-prototype-abide-controls-and-ready.md), "Decision handed to the Spec: Abide" items 2 to 4, with its Triage item 2 as decided by the orchestrator. The prototype passed all three of its cases in three engines, so the spec's design stands; these are the restrictions and limits it found.

1. Item 2, custom controls: a new Hierarchy and DI bullet says a custom `FormValueControl` applies `NfsAbideInput` through `hostDirectives` and links to its label and Form error through the wrapping label (DI), not a typed template reference, because such a reference crashes the compiler; the error text is quoted (`Error: Could not resolve [object Object] / [object Object]`, at `Scope.resolve` from `TcbReferenceOp.execute`, with `ng build` reporting only "Angular compilation diagnostics failed."). D3's rationale records the restriction. Filing the crash upstream stays OPEN FOR HUMAN in the prototype ticket.
2. Item 3, groups: a new Hierarchy and DI bullet says the single Form error of a radio group, or of a checkbox group whose boxes share one `validate()` rule, links to any one control of the group.
3. Item 4 and Triage item 2, the mid-typing race: the Rendering modes subsection's incremental-hydration bullet documents that typing on through the keystroke that hydrates a `hydrate on interaction` block can drop one character in some engines (Chromium 2 of 3 runs, WebKit 3 of 3, Firefox 0 of 3), distinct from the pre-hydration rescue and without effect on the `ready` gate, and recommends `hydrate on viewport`, `on idle`, or `on immediate` for blocks that hold text-entry fields.
4. Tests, where the prototype's evidence suggests them: a browser-level "Control kinds" case (the custom control linked by its wrapping label with no template reference, the radio and checkbox group errors linked to one control, `select` and `textarea`, under both form APIs); the fixture's `hydrate on interaction` e2e case now says the race is not asserted, because it depends on the engine and did not occur in every run.
