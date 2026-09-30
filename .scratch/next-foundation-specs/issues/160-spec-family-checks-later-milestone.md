# 160. Spec: family checks (later milestone)

Type: grilling
Status: resolved
Blocked by: 159
Labels: wayfinder:grilling
Map: ../map.md

## Question

The ruling [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md) specifies family checks: each family's own development checks that read another part of the family (registration, DOM-only placement, and order checks, and the outside-the-parent warnings of building-blocks 1.9), for a later milestone of the implementing repository. What is that spec?

## How to work it

Opus 5.5, AFK under the map's triage rule. Write `specs/family-checks.md` in the map's spec shape and `/to-spec`'s sections, from the extraction manifests of [Task: extract the checks from the specs](159-task-extract-checks-from-specs.md) and the specs as committed at that ticket: its Problem Statement says it is planned and implemented in a later milestone and why (the ruling), and that the user wants the kinds weighed against each other in practice; it holds every check of its kind, per component, with its design as the specs gave it (its trigger, its message, its cost, its tests), so the later milestone loses nothing; its Testing Decisions keep the tests the checks had; and a closing section lists, per component spec, what the later milestone adds back to that spec when it lands. A check the manifests classify under another kind is left to that kind's spec; a boundary case is decided under the triage rule and recorded. The spec may name and link any component spec; no component spec links back to it.

## Answer

Worked AFK on 2026-09-29 and 2026-09-30 by one Opus 5.5 agent, from the seven extraction manifests and the specs and shared documents as committed at 53144f3, and, at HEAD, the finished re-runs' finds ([Re-run: specs without checks, group a](165-rerun-specs-without-checks-group-a.md), [group b](166-rerun-specs-without-checks-group-b.md), [group c](167-rerun-specs-without-checks-group-c.md), [group e](169-rerun-specs-without-checks-group-e.md), [group f](170-rerun-specs-without-checks-group-f.md)) and [Re-run: forgotten-import checks spec for the later milestone](164-rerun-forgotten-import-checks-later-milestone.md) with its spec. Spec: [specs/family-checks.md](../specs/family-checks.md).

### Decisions

Each is the question this ticket asked itself, then its answer.

1. What is a family check, exactly? A directive's own development check that reads another part of its family (parent, child, or peer), or a part of another family it sits beside or inside, through a registration, a lookup, a query, or the DOM (D1). A check that reads only attributes inside its own host's subtree is misuse even when that subtree holds family parts (the Breadcrumbs' and the Pagination's `aria-current` checks); one that reads another part's directive state, registration, or placement relative to another part is family.
2. Where do building-blocks 1.9's outside-the-parent warnings go? The specs at 53144f3 had turned every one into the part's In-family parent check (M5 with an `alone` sentence), which the forgotten-import checks spec keeps (its decision 8). This spec states building-blocks 1.9's rule for them as F9 and cites that spec's parent check as the report, restating neither M5 nor the `alone` sentences; the two specs describe the report as rule and mechanism, which the wave audit should confirm (D2).
3. What shape? One spec: 43 checks from 24 component specs, one entry per component in alphabetical order, each quoting its check verbatim from 53144f3 with its timing, what it reads, its documented-usage sentence (the manifests'), and its tests; the reads and rules that several checks share are stated once, F1 to F9, and each entry points to them (D3, D4). Cost is stated as the specs gave it: development builds only, which render callback, how often, and what it keeps (one `ResizeObserver` per row); F1 adds the measured reason for the inline guard (PEER 4, a hoisted guard kept 4336 B).
4. How does a check treat a forgotten peer? By [Decide: family checks report a forgotten peer themselves](157-decide-family-checks-report-forgotten-peers.md), as the forgotten-import checks spec now writes it: F5 applies that spec's two bullets to exactly the checks it lists (DOM-only placement: the Media Object's check 3, the Sticky's warning 1, the XY Grid's check 2, the Float Grid's check 2, the Flex Grid's check 3, the Top Bar's check 7, the Tabs tab's parent check; registration: the Drilldown's checks 1 and 2, the Nested menu's check 4, the Off-canvas panel's check 3, the Abide's three warnings), and each of those entries cites that spec's rule. The Switch's check 6 needs no helper (it reads a forgotten input as present, and the probe reports it), as that spec says; the class-peer checks of other families and the Responsive Toggle's check 3 keep their form. While the forgotten-import checks are not in the build, each check keeps the specs' silent form, so the two kinds can be built and weighed apart and neither form names the wrong fix (D5).
5. Where does the Nested menu root's check 6 (the Top Bar right-hand-section walk) go? Its owner's manifest (d) classified it misuse; the Dropdown Menu's (b) and the Top Bar's (f) quotes of it were classified family. By the orchestrator's rule a quoted check lands once, from its owner's entry, so it stays with the misuse warnings spec and this spec records the quotes (D11); boundary case 1 below recommends a move.
6. What do the tests keep? A test that asserts a warning fires or stays silent moves with its check; an assertion about the rendered page (DOM order, focus order, geometry, the markup of the library's own examples) stays in the first milestone as the library's own test (D8). Two tests are added, on the forgotten-import checks spec's precedent: every story and Fixture app route logs no family warning, apart from an Anti-pattern story that asserts one (D9), and a production build holds none of this spec's message texts (D10).
7. What comes back with a check besides its text? A lookup, query, or registry that only a check needs comes back with it, in development builds only (F3, D13): the Button Group's content query, the toggle text's toggle lookup, the Responsive Menu's hosted-Menu and Breakpoint-map lookups, the Float Grid column's `InteractivityChecker` and `NfsMediaQuery`, and the Drilldown's back-item registry, which the root "uses ... only for development checks" (a find of group b).
8. Smaller calls: no switch for family checks (D6); message prefixes kept as each spec gives them (D7); the Tabs tab's warning, whose spec states no timing, runs in the tab's own development-only `afterNextRender` (D14).
9. The closing section, Adding the checks back, per component spec, lists for each of the 24 specs the checks, the section they go back into, their tests, and the mentions to restore, and points at the re-runs' answers for the further sentences at 53144f3 that named a check.
10. Coverage. The seven manifests hold 54 `family` headings: 47 in the component manifests, which are 43 checks, three quotes of the Nested menu's checks (the Accordion Menu's, the Dropdown Menu's, and the Top Bar's), and group f's Toggler note that it has none (the 47 of [Task: extract the checks from the specs](159-task-extract-checks-from-specs.md) counts that note; group f's own count table says 4, its checks), and 7 in the shared manifest. Every one is in the spec's trace table, checked by the verification script. The owners of the quoted checks were confirmed in their manifests: the Nested menu's checks 3 and 4 (family) and 5 (misuse) and its parent checks in manifest d; its check 6 in manifest d (misuse). Nothing had to be taken from an owner spec directly.
11. The re-runs' finds, as the coordinator asked. No family check was missing from the manifests. Taken in: the Drilldown's back registry (group b, decision 7); quotes of this spec's checks by other specs, recorded under Checks quoted by one spec and owned by another (the Dropdown Menu's line 237 and the Accordion Menu's line 199 for the Nested menu's checks 3 and 4; the Float Grid's line 167 and the Media Object's D4, Notes, and line 208 for the Flexbox Utilities' checks 2 and 5; the Flexbox Utilities' line 527 for the Sticky's warning 2); and mentions for the closing table (the Abide's lines 158 and 161, the Accordion Menu's lines 205, 214, and 508, the Button Group's Rendering modes sentence, the Slider's "More than two handles is a dev-mode error" and its SSR smoke's "no development warning"). Group f's find 7 (the Nested menu root's warning) is decision 5.

### Boundary cases

Checks a manifest put under misuse that this ticket reads as family by what they read. Each is left in the misuse warnings spec and not copied here (D12); the misuse spec's author or the wave audit may move one, so that it still lands once.

1. The Nested menu root's check 6 (manifest d): a root with a dropdown slot whose Base side the DOM walk changed, because it sits in a `.top-bar-right` that dependency injection could not see. It reads the root's DOM ancestry for another family's section, the cross-family placement read the orchestrator keeps family (the Top Bar's sections), and both quoting manifests and the shared manifest's building-blocks 1.9 entry classify it family. Recommendation: move it here, under Nested menu, with its test ("a projected right-hand root (check 6), and none for a root declared in the section"), the Dropdown Menu's e2e case ("with one development warning naming `alignment="right"`"), and ADR 0043's consequence.
2. The Orbit's checks 1 and 3 (no rotation control, no bullets): registration reads, which 157 and the forgotten-import checks spec call a family's own check that finds a peer by registration; check 2 (the rotation control after the container): an order check between two parts.
3. The Off-canvas panel's check 3, part a (no content linked, a registration read that 157 names), check 4 (its clause on a registered Trigger inside a modal panel), check 5 (`trapFocus` without a registered overlay), and check 6 (a registered Trigger rendered while the panel is revealed): each reads a peer's registration, as the Dropdown's check 3 and the Reveal's check 7 do, which the manifests put here. The two parts of check 3 thus land in two specs; the later re-run keeps the number for both.
4. The Triggers' check 1 (no target): reads the Nearest Openable, the Trigger's parent; 157 names it.
5. The Responsive Accordion Tabs' checks 2 (two sections with one `value`, as the Orbit's check 6), 3 (no section, a count as the Slider's check 1), and 5 (`deepLink` on a section without an `id`, as the Accordion's check 2).
6. The Tabs' warning for a generated panel id under `deepLink`: reads the panels' ids against the strip's input, as the Accordion's check 2.
7. The Progress Bar's meter-text check (D6): compares the text's extent with its meter's, its parent part, as the Flex Grid's check 4 reads its columns.
8. The shared manifest's misuse entries for building-blocks 1.10's Flexbox Utilities and Float Classes lines, and Table D's Float Grid and Flex Grid rows, restate checks the component manifests put here (the Flexbox Utilities' check 5, the Float Classes' check 2, the Float Grid's checks 2 and 4, the Flex Grid's checks 3 to 5); this spec holds the owner entries, and the proposals below treat those shared-document passages as this spec's.

Confirmed where the manifests put them, though a sweep flagged them: the Switch's check 2 (misuse: it reads the input's accessible-name sources, of which the paddle is one label among others); the Breadcrumbs' checks 3 and 4 and the Pagination's check 3 (misuse: attributes inside the host's own subtree); the Button Group's checks 1 to 3 (family: they read the buttons' inputs through a query); the Drilldown's check 3 and the Flexbox Utilities' check 2 (mixed checks kept whole here, as manifest b did); the glossary's "In-family check" (a forgotten-import term, listed here only as a trace).

For [Spec: misuse warnings (later milestone)](161-spec-misuse-warnings-later-milestone.md): the Orbit's checks 1 and 3, the Off-canvas panel's check 3 (part a), and the Triggers' check 1 take 157's registration rule there, as the forgotten-import checks spec lists them.

### Triage

| Item | Impact | Confidence | Outcome |
| --- | --- | --- | --- |
| The kind's boundary (decision 1) | LOW: which later spec holds a check's text | HIGH: the ruling's rule, the manifests' calls, the orchestrator's notes | decided |
| Outside-the-parent: rule here, report in the forgotten-import checks (decision 2) | MEDIUM: what the later milestone gets when it builds one kind alone | HIGH: the specs at 53144f3 made every such warning a parent check; that spec keeps M5 | decided, routed to the wave audit |
| Verbatim entries and shared rules F1 to F9 (decision 3) | LOW | HIGH: the ruling asks each deferred spec for the full design | decided |
| 157 applied as the forgotten-import checks spec writes it, with the silent form as the fallback (decision 4) | MEDIUM: the order in which the later milestone builds two kinds | HIGH: both forms are the specs' or the user's; the list matches that spec's | decided |
| The Nested menu root's check 6 stays with its owner's kind (decision 5, boundary case 1) | LOW: both specs are deferred; moving text is cheap | HIGH on the rule followed; the move is a recommendation | decided, recommendation recorded |
| Added tests: negative controls and the production assertion (decision 6) | LOW: tests of a later milestone | HIGH: the forgotten-import checks' precedent | decided |
| Development-only lookups and registries come back with their checks (decision 7) | LOW | HIGH: each spec says so ("only for development checks") | decided |
| No switch, prefixes as given, the Tabs tab's timing (decision 8) | LOW | HIGH: the Flexbox Utilities' D10; the specs' texts; the family's shared timing | decided |
| Boundary cases 2 to 8 left where the manifests put them | LOW | HIGH: the brief's rule; no check lands twice | decided |

Nothing is OPEN FOR HUMAN.

### Proposed changes for the shared documents

For [Task: shared documents for the later-milestone checks](171-task-shared-documents-later-milestone-checks.md). Quoted text is the replacement, written relative to its target file. The other deferred specs' proposals cover the misuse, Runtime, build-time, and forgotten-import clauses of the same passages; where theirs and these together empty a parenthetical list of checks, the parenthetical goes.

1. `building-blocks.md` 1.9, "Parent handle": replace "`{optional: true}` with a dev-mode `reportViolations`-style warning when the child may stand alone (menu item outside a menu root)" with:

   > `{optional: true}` when the child may stand alone (menu item outside a menu root), where it degrades as its spec documents

2. `building-blocks.md` 1.9, "Ancestry that projection can hide": replace "it may walk the DOM once in its first render callback, only when the token is absent, and reports that case in development builds, because the state it fixes changes at hydration: the Nested menu root and `nfsTopBarRightToken`. A check that only reports placement reads the DOM alone (the Top Bar's section check, its D13)." with:

   > it may walk the DOM once in its first render callback, only when the token is absent: the Nested menu root and `nfsTopBarRightToken`. The state the walk fixes changes at hydration, so the spec documents the declaration that keeps it in the server HTML (`alignment="right"` on a menu that a layout component projects into the Top Bar's right-hand section).

3. `building-blocks.md` 1.9, "Ordered children": replace "`contentChildren` is used only for dev-mode validation." with:

   > `contentChildren` is not used for order.

4. `building-blocks.md` 1.10, the Flexbox Utilities bullet: replace "a requirement shown in every recipe and asserted by every story; in development builds `NfsFlexChild` and `NfsFlexContainer` report a Flex parent whose items holding focusable content are shown in another sequence than the DOM's at the current breakpoint (2.4.3), predicted from computed `order` and `flex-direction` (measured to match the rendered order in three engines), because axe has no rule for it." with:

   > a requirement shown in every recipe and asserted by every story; `order` and a reverse `direction` rearrange only items that hold no focusable content, so keyboard focus follows the order users see (2.4.3), which axe has no rule for.

5. `building-blocks.md` 1.10, the Float Classes bullet: delete "; `NfsFloatClasses` warns in development when a float follows a sibling floated toward the end side of the parent's computed `direction` and either holds focusable content", so the sentence ends at "(1.3.2, 2.4.3).".
6. `building-blocks.md` Table D, the family items of each row's development checks: the Button Group row's "a development-only `contentChildren(NfsButton)` and" (with the misuse proposal's "`HostAttributeToken('class')` for five warnings", the whole clause "a development-only `contentChildren(NfsButton)` and `HostAttributeToken('class')` for five warnings; " goes); the Switch row's "radio switches that no named group holds, the paddle's `for`"; the Top Bar row's "sections outside their bars"; the Media Object row's "a section outside a media object"; the XY Grid row's "placement"; the Float Grid row's "placement" and "and push and pull geometry: focusable columns out of DOM order, a column out of its row or over its neighbour, with `InteractivityChecker` and the Breakpoint service"; the Flex Grid row's "placement, a size in an unstacking row" and "and a development `ResizeObserver` per row (a column that overflows at the current viewport, a nested row that sticks out of a collapsed parent)"; the Flexbox Utilities row's "not in a Flex parent" and "and the visual-order check for 2.4.3 through CDK `InteractivityChecker` and `NfsMediaQuery.current`"; the Visibility Classes row's "sticky placement"; the Float Classes row's "a float after a sibling floated toward the end of the reading direction when either holds focusable content". Table B's DropdownMenu row, "with a development warning": with boundary case 1, whichever spec holds the Nested menu root's check 6.
7. `architecture-guide.md` P4, Rule: replace "optional with a development warning when it can" with "optional when it can"; replace "Where projection can hide a provider, a directive walks the DOM once after hydration, only when the token is absent, and reports it in development." with:

   > Where projection can hide a provider, a directive walks the DOM once after hydration, only when the token is absent.

   and delete the sentence "A lookup that exists only in development builds, for a placement warning, may inject the parent's class instead of a token where both sit in one entry point, because the guard removes it from production (Menu D9; the Breadcrumbs and Pagination items)."
8. `architecture-guide.md` P23: delete "a child outside a parent it may stand without (optional injection)," from the Rule, and "`nfsSliderFill` warning outside a slider;" from Preferred. Conflicts item 3: replace "optional with a development warning when it can" with "optional when it can".
9. `CONTEXT.md`, a new term under Angular side, beside In-family check:

   > **Family check**:
   > A later-milestone term: a development warning from one part of a directive family, or a directive placed beside or inside another family's part, about how the consumer arranged the parts: a registration a part lacks, a part placed where the family's CSS or behaviour does not reach it, or parts in an order the family cannot use; planned and implemented in a later milestone ([Decide: checks move to a later milestone](issues/158-decide-checks-move-to-a-later-milestone.md)), by [Spec: family checks (later milestone)](issues/160-spec-family-checks-later-milestone.md).
   > _Avoid_: In-family check (a Forgotten import report), placement warning, structure check

   In-family check itself takes the forgotten-import checks' marker (164's proposal 4).
10. `storybook-conventions.md`: no change for this kind; it names no family check. The layer-1 negative control of this spec comes back in the later milestone with that spec.
11. ADRs, a dated bullet at the end of each Consequences:
    - ADR 0019, after "a development warning names the case":

      > - 2026-09-29 ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)): the Sticky's development warnings for a parent that is not positioned and for a parent no taller than the element are specified for a later milestone, in [Spec: family checks (later milestone)](../issues/160-spec-family-checks-later-milestone.md); in the first milestone the Sticky spec states both as documented usage, and nothing warns.

    - ADR 0028:

      > - 2026-09-29 ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)): the development warning for single mode starting with several open items is specified for a later milestone, in [Spec: family checks (later milestone)](../issues/160-spec-family-checks-later-milestone.md); in the first milestone the Accordion and Accordion Menu specs state the rule as documented usage, and nothing warns.

    - ADR 0037:

      > - 2026-09-29 ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)): the Orbit's own check for duplicate slide values is specified for a later milestone, in [Spec: family checks (later milestone)](../issues/160-spec-family-checks-later-milestone.md); Aria's own warnings are unchanged.

    - ADR 0043, line 18's warning: the dated note names whichever later-milestone spec holds the Nested menu root's check 6 (boundary case 1).
12. `README.md`, the later-milestone section's table (the Shared utilities table's columns):

    > | Family checks (a family's own registration, placement, and order warnings) | [specs/family-checks.md](specs/family-checks.md) | Custom Angular in development builds only, in each directive's own code | The seven checks-extraction manifests, `research/checks-extraction-a.md` to `-f.md` and `-shared.md` | None needed | 24 component specs: Abide, Accordion, Accordion Menu, Button Group, Drilldown Menu, Dropdown, Flex Grid, Flexbox Utilities, Float Classes, Float Grid, Media Object, Nested menu, Off-canvas, Orbit, Responsive Menu, Responsive Toggle, Reveal, Slider, Sticky, Switch, Tabs, Top Bar, Visibility Classes, XY Grid |

    and the wave list's item 2 marks this ticket resolved with:

    > [specs/family-checks.md](specs/family-checks.md), 43 family checks from 24 component specs

For [Re-run: forgotten-import checks spec for the later milestone](164-rerun-forgotten-import-checks-later-milestone.md), already resolved, nothing to change: its lists of the checks 157 changes and its Switch bullet are the ones this spec's F5 follows.

### Verification

`verify.mjs` in the scratchpad scans the spec and this ticket, each scan with a positive control and an error treated as a failure: no non-ASCII character; no banned word in any inflection; every relative link resolves (the proposal quotes and the gist excluded, by the bundle's convention); every Markdown table row has its header's cell count; every `family` heading of the seven manifests at 53144f3 is in the spec's trace table, 47 in the component manifests (46 checks and the Toggler note) and 7 in the shared one; every heading the manifests' counts name is accounted for.

### Gist for Decisions so far

- [Spec: family checks (later milestone)](issues/160-spec-family-checks-later-milestone.md) -- the later milestone's spec for 43 family checks from 24 component specs (registration, DOM placement, order, and geometry checks between a family's parts, or between parts of two families that sit together), each quoted verbatim with its timing, reads, documented-usage sentence, and tests, and their shared reads and rules stated once (development-only render callbacks, registrations, lookups only a check needs, DOM-only placement, computed order, a development `ResizeObserver`, building-blocks 1.9's outside-the-parent rule, whose report stays the forgotten-import checks' parent check); the user's forgotten-peer rule applies to the checks the forgotten-import checks spec lists, with the specs' silent form while that spec is not built, so the two kinds can be weighed apart; a closing table lists per component spec what the later re-run adds back; fourteen misuse-classified checks read as family, the Nested menu root's check 6 among them, are recorded as boundary cases and left out; impact up to MEDIUM, confidence HIGH; nothing OPEN FOR HUMAN; no ADR. Spec: [specs/family-checks.md](specs/family-checks.md).

### Amendment, 2026-09-30 (audit 0009)

- [Audit 0009: the later-milestone checks wave](../audits/0009-later-milestone-checks-wave.md), M1: the spec counts 43 checks, not 46; the trace table's 47 component rows are 43 checks, three quotes of the Nested menu's checks, and the Toggler note (the spec, this ticket's Answer, and its gist).
- [Audit 0009: the later-milestone checks wave](../audits/0009-later-milestone-checks-wave.md), L4: F4's users add the Flexbox Utilities' check 2 and the Off-canvas' check 9, the Drilldown's check 3 cites F4, and user story 43 states the rule and leaves its report to the forgotten-import checks' parent check.
- [Audit 0009: the later-milestone checks wave](../audits/0009-later-milestone-checks-wave.md), L5: F5's registration list adds the Off-canvas panel's check 4, by the same wording.
