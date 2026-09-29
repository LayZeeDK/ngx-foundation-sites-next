# 157. Decide: family checks report a forgotten peer themselves

Type: grilling
Status: resolved
Blocked by: 133, 150
Labels: wayfinder:grilling
Map: ../map.md

## Question

The [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md) has two bullets for a family's own development checks. A check that reports placement from the DOM alone, and a check that finds a peer by registration, "says nothing" where the element it looks for carries the peer directive's attribute without its directive, and leaves the Forgotten import to a child probe or to `strictDirectiveImports`. Can the family's check give the correct message itself?

## Answer

### User ruling, 2026-09-29

The user asked: "Is it possible to make Check 1 give the correct message?" (the Orbit's development check 1, which warns that an auto-playing Orbit has no rotation control). The orchestrator answered yes and recommended the rule below, and the user approved the recommendation.

### What was weighed

- The shared checks already hold the means. The spec's one report function (D8) reports at most once per element and directive, whichever check sees it first, and message M2 ("<tag attr> has no <Directive> ... Add <Directive> from '<entry point>' to the imports of the component whose template declares this element (Angular names <Owner>). Found by <Part>.") names the correct fix. A family check that hands the element to that function gives the correct message, and the console still shows one report.
- The gap in "says nothing". In-family checks have no switch; `strictDirectiveImports` is a Runtime check with an opt-out, `provideNfsRuntimeChecks({strictDirectiveImports: false})`. For a forgotten peer that no child probe covers (the Drilldown wrapper, whose injection stays optional; the Openable around a bare Trigger), `strictDirectiveImports` was the only report, so with the opt-out the silent family check left the Forgotten import with no report at all. A family check that reports M2 itself does not depend on that switch.
- The cost. Each check must name the peer's class and entry point, which it already knows, since it looks for that peer; the report function finds the owner component. All of it runs only when `ngDevMode` is on, so production pays nothing.
- Unchanged: a family check that finds another family's peer by its class (the Top Bar's check 3, the Close Button's check 3, the Dropdown pane's check 8, the Visibility Classes' check 3, the Flexbox Utilities' check 2). A part probes only its own family's directives, and another family's directive is left to the runtime check and the static check (the spec's family rule), so these keep their current form.

### Decision

1. A new development-only helper beside `nfsDirectiveCheck` in `ngx-foundation-sites/media-query`, for library directives only and called behind the same inline `ngDevMode` guard:

   ```ts
   /**
    * For a library directive's own development check, development builds only. When `element` carries
    * one of `directive`'s attributes and the verdict is "missing" or "wrong element", reports it once
    * through the one report function (M2 or M3, "Found by <foundBy>.") and returns true; otherwise
    * returns false, and the caller gives its own message.
    */
   export function nfsReportForgottenPeer(element: Element, directive: string, foundBy: string): boolean;
   ```

2. A family's own development check that reports placement from the DOM alone (the Media Object's check 3, the Sticky's warning 1, the XY Grid's check 2, the Float Grid's check 2, the Flex Grid's check 3) calls `nfsReportForgottenPeer` for a parent element that carries a parent directive's attribute without its host class, and gives its placement message only when the helper returns false. A warning about a separate misuse that stays wrong once the import is added still reads such an element as the parent and still fires (an `offset` under a forgotten `nfsGridY`, a sized column row under a forgotten outer `nfsRow`).
3. A family's own development check that finds a peer by registration (the Drilldown's checks 1 and 2, the Nested menu's check 4, the Orbit's checks 1 and 3, the Off-canvas panel's check 3, the Triggers' check 1, the Abide label's and Form error's "no field resolves" warnings and its field's warning for an error state with no visible Form error) calls `nfsReportForgottenPeer` for each element it finds that carries the peer's attribute and registered nothing, and gives its own message only when no such element exists. Two cases keep their message as now: a check that looks for no element, because its peer is linked only by a required reference whose forgotten import fails to compile (the Responsive Toggle's check 3, NG8002 or NG8003), and a check that is the report for a truly bare part, with no element carrying the peer's attribute (the kept-optional case of the family rule's item 2).
4. Every such report is made once per element and directive (D8), whichever of the child probe, the parent check, `strictDirectiveImports`, or the family's check sees it first, and it is made whether or not `strictDirectiveImports` is on.

This replaces the two "says nothing" bullets of the forgotten-import checks spec (its In-family checks section), the rule the phase-2 reviewers of [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md) aligned the family specs to, and the orchestrator's note that the disclosure re-run's sentence was not adopted; those records stay as written, each with a dated pointer here.

### Changes to apply

Scope, 2026-09-29: the same day the user ruled that every check is specified but planned and implemented in a later milestone, and that no other spec mentions one ([Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md)). So [Re-run: forgotten-import checks spec for the later milestone](164-rerun-forgotten-import-checks-later-milestone.md) applies item 1 in the checks spec, and records items 2 to 4 there as the changes the later milestone makes to the family specs and to building-blocks when it lands; no family spec is edited for this ticket now. Items 5 and 6 are made with this ticket.

1. `specs/forgotten-import-checks.md`:
   - the API sketch lists `nfsReportForgottenPeer(element, directive, foundBy)` beside `nfsDirectiveCheck`, and the TypeScript block gains the declaration above;
   - the two bullets on a family's DOM-only placement checks and registration checks are rewritten to decisions 2 to 4, with their lists of checks kept;
   - item 2 of the family rule points at the rewritten registration bullet for an element that carries the parent's attribute without its directive;
   - the M2 and M3 rows say they come from an In-family check or from a family's own development check through `nfsReportForgottenPeer`;
   - the decisions table gains a row for the helper (chosen: one helper that reports through the report function and tells the caller whether it did; rejected: "says nothing", which left a peer no probe covers unreported under the opt-out; a family message that names the import itself, which would duplicate the report function's owner lookup and dedupe);
   - Testing Decisions gain three cases: an auto-playing Orbit whose `button nfsOrbitRotation` import is forgotten reports one M2 found by `NfsOrbit` and no WCAG 2.2.2 warning, also with `strictDirectiveImports: false`; a Drilldown wrapper whose import is forgotten reports M2 with `strictDirectiveImports: false`; an auto-playing Orbit with no rotation element keeps check 1's message.
2. Each family spec whose check decisions 2 and 3 name (media-object, sticky, xy-grid, float-grid, flex-grid, drilldown-menu, nested-menu, orbit, off-canvas, triggers, abide): the check's text says it calls `nfsReportForgottenPeer` for such an element and gives its own message only when the helper returns false; its In-family line and any sentence that says the check "says nothing" or leaves the report to `strictDirectiveImports` or a probe follow; its browser-level tests assert the M2 report in place of silence, with one case under `strictDirectiveImports: false` where no probe covers the peer. The Responsive Toggle spec's check 3 is unchanged.
3. `building-blocks.md` 1.9, where it states how a family's own check treats a forgotten import (if it does), follows decisions 2 to 4.
4. Each changed spec gets one line in a dated `### Amendment, 2026-09-29 (family checks report a forgotten peer)` at the end of the ticket that holds its `### Amendment, 2026-09-29 (consistency review)`; [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md) gets its own.
5. A dated pointer, `### Note, 2026-09-29 (family checks report a forgotten peer)`, one line, at the end of [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md).
6. `map.md`: in the gist of [Consistency review: the class-rule wave](issues/133-consistency-review-class-rule-wave.md), after "aligned the forgotten-import checks' registration and class-peer rules across the specs" add "(later changed: a family's own check reports the forgotten peer itself, [Decide: family checks report a forgotten peer themselves](issues/157-decide-family-checks-report-forgotten-peers.md), and every check moves to a later milestone, [Decide: checks move to a later milestone](issues/158-decide-checks-move-to-a-later-milestone.md))"; append this ticket's gist. `README.md` lists this ticket beside [Decide: an exportAs on every directive](156-decide-exportas-on-every-directive.md).

### Triage

A user ruling, so no triage decides it; the helper's name and signature are the orchestrator's, rated impact LOW (a development-only helper for the library's own directives, not a consumer API), confidence HIGH (it reuses the report function, the verdict, and M2 and M3 as the spec defines them). Nothing is OPEN FOR HUMAN.

### Gist for Decisions so far

- [Decide: family checks report a forgotten peer themselves](issues/157-decide-family-checks-report-forgotten-peers.md) -- the user approved that a family's own development check, where the element it looks for carries a peer's attribute without its directive, reports that Forgotten import itself through the one report function (M2 or M3, found by the part, once per element and directive) with a new development-only `nfsReportForgottenPeer(element, directive, foundBy)`, and gives its own message only when no such element exists; this closes the gap where a peer no probe covers went unreported under `strictDirectiveImports: false`, and replaces the two "says nothing" bullets.
