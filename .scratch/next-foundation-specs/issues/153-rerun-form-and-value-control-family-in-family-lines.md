# 153. Re-run: form and value-control family specs, In-family check lines

Type: grilling
Status: resolved
Blocked by: none
Labels: wayfinder:grilling
Map: ../map.md

## Question

[Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md) found that the specs written before ADR 0046 lack the In-family check lines, parent token descriptions, and `strictParents` effects that [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md) requires of a multi-directive family. What does each spec of the form and value-control family (`specs/abide.md`, `specs/forms.md`, `specs/switch.md`, `specs/slider.md`, `specs/progress-bar.md`) state?

## How to work it

Revise each spec in place and append a dated `### Amendment, 2026-09-29 (in-family check lines)` to the ticket the map's Decisions so far cites last for that spec. The items, evidence, and what to decide are in the audit ticket's Answer, section "Re-run tickets", item R3, and the five points above it that every re-run decides; `specs/forgotten-import-checks.md` (its family rule, the `strictParents` table, and the token-description form) and the Accordion spec's worked example are the model. It also applies the audit Answer's fixer items X9 (the Slider's non-linear value text) and X10 (the five NG0309 edits in Forms and Abide), since this ticket owns those specs. Run `/grill-with-docs` (self-grilling, both sides) where a point needs deciding, and keep every other part of each spec unchanged. Propose shared-document changes as quoted text in the Answer.

## Answer

Worked AFK on 2026-09-29 by one Opus 5.5 agent, self-grilling both sides under the map's AFK override (the `/grill-with-docs` skill is not installed under that name in this session, so the grilling ran inline and is recorded below). Sources: the audit's Answer (R3, the five points above it, X9, X10), `specs/forgotten-import-checks.md` (the verdict, the In-family checks, the family rule, the `strictParents` table and its kept-optional list, M1 to M8), [ADR 0046](../adr/0046-forgotten-imports-caught-by-checks.md), building-blocks 1.9, the architecture guide's P23 and P24, the Accordion's worked example (`accordion.md:156`), and the five specs as they stood. No measurement was needed. Specs revised in place: [specs/abide.md](../specs/abide.md), [specs/forms.md](../specs/forms.md), [specs/switch.md](../specs/switch.md), [specs/slider.md](../specs/slider.md), [specs/progress-bar.md](../specs/progress-bar.md). Dated amendments: [Re-run: Abide spec under the class rule](123-rerun-abide-class-rule.md), [Spec: Forms](98-spec-forms.md), [Re-run: Switch spec, out-of-scope survivors](147-rerun-switch-out-of-scope-survivors.md), [Re-run: Slider spec under the class rule](124-rerun-slider-class-rule.md), [Spec: Progress Bar](95-spec-progress-bar.md), the tickets the map's Decisions so far cites last for each spec.

### Grilling log

1. Which children does `NfsAbide` probe? For its DI children only (the input and the alert): the label and the Form error register with a field, not the form. Against: the Accordion's model probes every DOM-nested child, and a bare `nfsAbideLabel` or `nfsFormError` compiles as silently as `nfsAbideAlert` or an unreferenced `nfsAbideInput`; the bound forms have no DOM attribute, so the probe never sees them, and their forgotten import fails with NG8002 anyway. Settled: all four; `NfsAbideLabel` also probes the input and bare Form error inside it, and the one report function keeps a doubly probed element to one report.
2. Do `NfsAbideInput` and `NfsFormError` pass a parent? For: a parent check would report a field outside a form. Against: `nfsDirectiveCheck` throws under `strictParents` for every part that passes a parent not found, the shared table is fixed, and its kept-optional list keeps `NfsAbideInput` optional because its `null` is supported (`forgotten-import-checks.md:248`); a Form error linked by `[nfsFormError]="field"` needs no label, which construction cannot tell from a bare one without a new attribute read. Settled: neither passes a parent; `NfsFormError`'s existing "no field resolves" warning stays the report for a bare Form error outside a label; the kept-optional list gains `NfsFormError` (proposal P1).
3. Should `NfsAbideLabel`'s "no field resolves" warning go silent when its probe finds a forgotten `NfsAbideInput`? For: one cause, one report. Against: the warning comes from DI registration, not from the DOM, and stays true; the case needs a field that no reference names, because a native control's Form error links by `#x="nfsAbideInput"`, whose forgotten import fails with NG8003; silencing it would tie the label's own check to the probe. Settled: kept, and the probe's report names the cause.
4. Forms and Abide decided together (`forms.md:148`): does either set probe the other's directives on the same element? For: a forgotten `NfsFormLabel` on a validated label is a static `middle` that compiles silently. Against: the two sets are built never to know each other (neither injects, hosts, or imports the other), a probe looks under its host and never at the host's own element, and the shared verdict already decides each attribute on its own: `NfsFormLabel`'s manifest `hostClass` is null (it binds only `[class.middle]`), so verdict step 2 does not decide, and step 4 finds `NfsAbideLabel` in the host record, which does not list `nfsFormLabel`, so the attribute is missing and the runtime check reports it (M1), as the static check does (NFS9001). Settled: no cross-family probes; each spec says so; proposal P2 writes the rule into the shared spec.
5. Point 3 of the audit, for Forms and Abide: does a DOM-only check's message still hold when a neighbour's import is forgotten? The Forms checks read `labels`, `control`, `aria-describedby`, and `closest('label')`, never a library class: a consumer's static `aria-describedby` stays on a field whose `NfsAbideInput` is missing, so `NfsHelpText`'s pairing check stays silent, correctly. Abide's checks resolve fields through DI and references, and its in-label check reads the `label` element. Settled: no message changes; each spec states it.
6. Point 3 for the Switch: check 6 finds the input "seen as the class it binds". With `NfsSwitchInput` not imported, the input carries the attribute and not the class, so check 6 warns that the paddle "must directly follow its nfsSwitchInput", which it does, beside `NfsSwitch`'s probe report of the real cause. Against changing it: none beyond one more attribute test; the attribute alone would miss an input whose `NfsSwitchInput` a consumer's directive hosts. Settled: the class or the attribute; new D19 and its layer-2 case.
7. Should a Switch or input group part gain a parent check (an input outside its `nfsSwitch`, a field outside its group)? For: `.switch-input` is `opacity: 0`, so a switch input outside its container is invisible. Against: no part of either family injects another (the cascade does the parent's work), a parent check needs an optional injection and would join the `strictParents` table, which [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md) fixed; the Forms spec already ruled that a part outside a group only looks unjoined; a forgotten container import is reported by the runtime check, and a container never written is a markup error that shows at once. Settled: no parent check in either family.
8. The Slider fill: its development check 6 becomes the parent check with an `alone` sentence (point 2). Does M4, "declared in another template", falsely report a fill projected into a slider, whose look needs nothing from DI? Against a false report: the Handles must be declared inside the `nfsSlider` element in the same template (Rendering modes), so a projected slider already needs the template-outlet pattern, which gives the fill the slider's injector too; `strictParents` makes it throw exactly as the table lists. Settled: M4 holds, and the spec says why.
9. Does the Slider's probe of the Handle add anything? A forgotten `NfsSliderHandle` under `[formField]` takes Signal Forms' native element path and compiles without a word (the spec's own Forms bullet: control detection prefers a directive with a `value` model, and none is there). Settled: stated in the line.
10. The Progress meter text injects `NfsProgressMeter` required and by class, the one form whose NG0201 no description reaches (`forgotten-import-checks.md:265`). A token instead? For: M7's description would name the entry point. Against: a new exported token is a public name frozen at the first release (ADR 0045) for one development message, the class name already says which directive to import, and the spec kept the link by class on purpose (nothing outside the entry point needs the meter). Settled: kept by class, and the line says so.
11. Token descriptions and several providers: `nfsAbideToken`, `nfsAbideLabelToken`, `nfsSliderToken`, and `nfsProgressToken` each have one library provider; `nfsProgressToken` is exported so that a consumer can provide an alternative (AGENTS.md), and the description names the library's provider, which is what a developer who sees NG0201 needs. `nfsAbideLabelToken` is never injected required, so NG0201 never prints it today; it gets the description all the same, because the rule covers every parent token. Settled: M7's form, verbatim, for all four.
12. X10 names five NG0309 edits. A sixth copy of the claim, unnamed, sits in `forms.md:203` ("the one measured risk (a directive matched twice on one element) is avoided by keeping the Forms and Abide label directives separate"). For leaving it: the ticket names five. Against: it is finding T10's cause in the same spec, and leaving it would contradict the five edits. Settled: removed too, reported here.
13. Point 5: no part of the five families sits on `ng-template` or `ng-container`; each spec says so.
14. Tests: add probe cases to each spec's layer 2? The Accordion has none: the shared spec's own suite covers the mechanism, and layer 1 fails any story that logs a forgotten-import report. Settled: only the cases whose expectation changed (Switch check 6, Slider check 6).

### Decisions

Abide (`specs/abide.md`):

1. `NfsAbide` calls `nfsDirectiveCheck('NfsAbide', {children: ['NfsAbideInput', 'NfsAbideLabel', 'NfsFormError', 'NfsAbideAlert']})`; no parent, no peers; `strictParents` changes nothing.
2. `NfsAbideInput`: no parent check (both lookups kept optional with a supported `null`), no probes; peers by reference (its label and Form errors, NG8002 and NG8003 when forgotten) and by id (its help text); a custom control's hosted instance records itself and carries no attribute to probe.
3. `NfsAbideLabel` probes `NfsAbideInput` and `NfsFormError` inside it; no parent check; peers by reference; its "no field resolves" warning stays.
4. `NfsFormError`: no parent check (its label lookup kept optional: the reference form needs no label); its "no field resolves" warning stays the report for a bare Form error outside a label; peers by reference.
5. `NfsAbideAlert`: parent check none (required `nfsAbideToken`, NG0201 with its description); no probes, no peers.
6. `nfsAbideToken` and `nfsAbideLabelToken` get M7's development-only descriptions.
7. X10's three Abide edits (`abide.md:154`, D18, D19), as quoted in the audit.

Forms (`specs/forms.md`):

8. `NfsInputGroup` probes `NfsInputGroupLabel`, `NfsInputGroupField`, and `NfsInputGroupButton`; the three parts, `NfsFormLabel`, `NfsHelpText`, and `NfsFieldset` have no parent check and no probe; `NfsFormLabel`'s control (by `for`) and `NfsHelpText`'s field (by the id in `aria-describedby`) are peers by value; `strictParents` changes nothing.
9. With Abide (decided together): no cross-family probes; the shared verdict decides each attribute on an element on its own, so a forgotten `NfsFormLabel` beside `NfsAbideLabel`, or a forgotten `NfsInputGroupField` beside `NfsAbideInput`, is still reported; the three DOM-only development checks keep their messages.
10. X10's two Forms edits (`forms.md:148`, D4), and the sixth copy at `forms.md:203`, whose fallback line now reads "Fallback: none needed. Nothing depends on unverified behaviour."

Switch (`specs/switch.md`):

11. `NfsSwitch` probes `NfsSwitchInput` and `NfsSwitchPaddle`; the paddle probes `NfsSwitchActive` and `NfsSwitchInactive`; no part has a parent check; the paddle's `for` link to its input is a peer by value; `strictParents` changes nothing.
12. Check 6 takes a previous sibling carrying the `nfsSwitchInput` attribute as the input, as well as one carrying its class (new D19; layer-2 case added).

Slider (`specs/slider.md`):

13. `NfsSlider` probes `NfsSliderHandle` and `NfsSliderFill`; `NfsSliderHandle` has no parent check (required `nfsSliderToken`, NG0201 with its description) and no peers.
14. `NfsSliderFill` passes `{parent: {directives: ['NfsSlider'], found, alone}}`, with the `alone` sentence "The nfs-slider Library mixin positions a fill only inside a slider (.slider > .slider-fill), so this one never shows the selected part of the track."; development check 6 is that parent check now (the fill creates no `afterRenderEffect` of its own); under `strictParents` it throws M8 at construction, in development only; D24, the tree comment, the fill's API bullet, and the layer-2 case follow.
15. `nfsSliderToken` gets M7's development-only description, in the X6 form.
16. X9: the `[attr.aria-valuetext]` row now reads `` `${value}` `` for a non-linear Handle without `displayWith`, as quoted in the audit.

Progress Bar (`specs/progress-bar.md`):

17. `NfsProgress` probes `NfsProgressMeter`; `NfsProgressMeter` probes `NfsProgressMeterText` and has no parent check (required `nfsProgressToken`); `NfsProgressMeterText` has no parent check (required `NfsProgressMeter`, by class); `NfsProgressElement` has no parent, probe, or peer; `strictParents` changes nothing.
18. The meter text keeps its lookup by class; its NG0201 prints `_NfsProgressMeter`, which names the directive to import.
19. `nfsProgressToken` gets M7's development-only description.

### Triage

| Item | Impact | Confidence | Verdict |
| --- | --- | --- | --- |
| Decisions 1 to 5, 8, 11, 13, 14, 17 (the In-family lines) | MEDIUM: development-only checks in five specs; no public API changes, and the `strictParents` part list is the shared table's | HIGH: ADR 0046, building-blocks 1.9, and the shared spec's rule, table, and kept-optional list decide every line | Decided |
| Decisions 6, 15, 19 (token descriptions) | LOW: development builds only | HIGH: M7's form, verbatim | Decided |
| Decision 9 (Forms and Abide together) | LOW | HIGH: the verdict's steps, walked for both same-element pairs | Decided |
| Decision 12 (Switch check 6) | LOW: one development condition | HIGH: the shared spec's one-report rule (D8) | Decided |
| Decision 18 (meter text by class) | LOW: one development message | HIGH: the shared spec names the form, and the spec's own reason for the class stands | Decided |
| Decisions 7, 10 (X10 and its sixth copy) | LOW: a wrong reason | HIGH: measured with Angular 22.2.0 (building-blocks 1.9, `menu.md:133`) | Decided |
| Decision 16 (X9) | MEDIUM: what assistive technology speaks | HIGH: the audit's triage | Decided |
| P1, P2 | LOW | HIGH | Proposed |

Nothing is OPEN FOR HUMAN. No ADR. No prototype was needed.

### Proposed shared-file changes (for the orchestrator)

- P1. `specs/forgotten-import-checks.md:248`, the kept-optional list: replace "- `NfsAbideInput` to `nfsAbideToken` and `nfsAbideLabelToken`: a field outside a form works with the Defaults token policy, and only a custom control's label provides the label token ([Spec: Abide](../issues/31-spec-abide.md))." with:

  > - `NfsAbideInput` to `nfsAbideToken` and `nfsAbideLabelToken`, and `NfsFormError` to `nfsAbideLabelToken`: a field outside a form works with the Defaults token policy, only a custom control's label provides the label token, and a Form error linked by reference needs no label ([Spec: Abide](../issues/31-spec-abide.md)).

- P2. `specs/forgotten-import-checks.md`, the family rule: after item 5 ("What `strictParents` changes for the part (the table below), or "nothing".") and before the sentence on a single directive's spec, insert:

  > A part probes only its own family's directives. A directive of another family written beside a part on one element, or inside it (a Callout beside the Abide alert, a Forms directive beside an Abide one, an `nfsButton` inside an input group button), is left to the runtime check and the static check, whose verdict decides each attribute on an element on its own.

No change to `building-blocks.md`, `architecture-guide.md`, an ADR, or `CONTEXT.md` is needed: P23's and P24's "`nfsSliderFill` warning outside a slider" still holds (the warning is the fill's parent check now), and the audit's E5 already carries X9's text into P21.

No banned word had to be rewritten out of a quoted replacement.

### What other specs need from this one

- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): check that every re-run states cross-family neighbours the same way (P2, or its equivalent sentence in each spec: Smooth Scroll beside Menu, Callout beside the Abide alert, the Flexbox Utilities beside a Flex parent's directive); and that a development check that finds a peer by its class (the Switch's check 6 here; the Media Object's check 3, the XY Grid's check 2, and the Flex Grid's DOM check in the other re-runs) either also accepts the peer's attribute or says why its message still holds for a forgotten import.
- [Re-run: navigation family specs, In-family check lines](151-rerun-navigation-family-in-family-lines.md), [Re-run: disclosure and carousel family specs, In-family check lines](152-rerun-disclosure-and-carousel-family-in-family-lines.md), [Re-run: CSS-only component and free-behaviour family specs, In-family check lines](154-rerun-css-only-component-and-free-behaviour-family-in-family-lines.md), [Re-run: layout system and flex utility family specs, In-family check lines](155-rerun-layout-system-and-flex-utility-family-in-family-lines.md): nothing; the one reading they share, that a kept-optional injection passes no parent because a part that passes one throws under `strictParents`, comes from the shared spec's own mechanism.
- [Spec: Button](37-spec-button.md), [Spec: Callout](89-spec-callout.md), [Spec: Visibility Classes](104-spec-visibility-classes.md): nothing; no Abide or Forms part probes their directives.

### Gist for Decisions so far

- [Re-run: form and value-control family specs, In-family check lines](issues/153-rerun-form-and-value-control-family-in-family-lines.md) -- the Abide, Forms, Switch, Slider, and Progress Bar specs list their In-family checks per part: each container probes its DOM-nested parts (the Abide form all four, the Abide label its input and bare Form error, the input group, the switch and its paddle, the slider, the progress bar and its meter); the required parents (Abide alert, Slider handle, Progress meter and meter text) have no parent check, NG0201 being the report; `NfsAbideInput` and `NfsFormError` pass no parent, their `null` being supported, so the shared kept-optional list gains `NfsFormError`; the Slider fill's development check becomes its parent check with the family's sentence and throws under `strictParents`; the four parent tokens get their development descriptions, and the Progress meter text keeps its lookup by class; no part probes another family's directive beside it, and the shared verdict decides each attribute alone, so a forgotten Forms directive beside an Abide one is still reported; the Switch's paddle check also accepts the input's attribute, so a forgotten input import reports once; X9 (`` `${value}` `` for a non-linear Handle) and X10's NG0309 edits applied, plus a sixth copy in Forms; MEDIUM, HIGH; no ADR.
