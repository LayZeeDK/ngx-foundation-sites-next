# 161. Spec: misuse warnings (later milestone)

Type: grilling
Status: resolved
Blocked by: 159
Labels: wayfinder:grilling
Map: ../map.md

## Question

The ruling [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md) specifies misuse warnings: each directive's own development warnings about how the consumer used it, reading only its host, its inputs, its content, or the page, for a later milestone of the implementing repository. What is that spec?

## How to work it

Opus 5.5, AFK under the map's triage rule. Write `specs/misuse-warnings.md` in the map's spec shape and `/to-spec`'s sections, from the extraction manifests of [Task: extract the checks from the specs](159-task-extract-checks-from-specs.md) and the specs as committed at that ticket: its Problem Statement says it is planned and implemented in a later milestone and why (the ruling), and that the user wants the kinds weighed against each other in practice; it holds every check of its kind, per component, with its design as the specs gave it (its trigger, its message, its cost, its tests), so the later milestone loses nothing; its Testing Decisions keep the tests the checks had; and a closing section lists, per component spec, what the later milestone adds back to that spec when it lands. A check the manifests classify under another kind is left to that kind's spec; a boundary case is decided under the triage rule and recorded. The spec may name and link any component spec; no component spec links back to it.

## Answer

Worked AFK on Opus 5.5 under the map's triage rule, from the `misuse` entries of the seven manifests of [Task: extract the checks from the specs](159-task-extract-checks-from-specs.md) and the specs at `53144f3`, with the finds of the re-runs' Answers (groups a, c, e, and f, and the orchestrator's notes on groups d and on the family checks spec). Deliverable: [specs/misuse-warnings.md](../specs/misuse-warnings.md), in the map's spec shape: the to-spec sections, with the API-design material under Implementation Decisions and Further Notes.

### Decisions

1. One spec holds every misuse warning: the common contract (eight rules), twelve shared mechanisms said once (S1 to S12: the copied-class read, the static insertion-timing attribute, names read as accessible-name computation reads them, the Scroll region, the named navigation landmark, the Motion value that starts no animation, the missing include seen in the computed style, the Zero-breakpoint names, deep links on generated ids, link hosts, inputs that cannot apply together, and silence where a forgotten import is the cause), then 48 component entries in the order of the spec file names. Each check keeps its spec's number, trigger, message text, render hook, once rule, what it reads, and its tests by the four layers of ADR 0018. Its Problem Statement gives the ruling and the user's aim of weighing the kinds in practice. Its closing section lists, per component spec (50 specs, the Dropdown Menu and Equalizer quotes included), what comes back: the checks into the section that held them, their tests, and the sentences that named them. A coverage table maps all 213 manifest entries to the place that holds them.
2. The common contract adds three decisions the specs implied but did not state together: an inline `ngDevMode` guard at every site (a hoisted guard kept 4336 B and every message in production, measured by the forgotten-import prototype); one `afterRenderEffect` read phase shared with a Runtime check where the directive has a Variant check handle, created under `ngDevMode` alone until the Runtime checks land; and no switch or production form (P23).
3. Order of landing (D11): the misuse warnings land independently of the other four kinds, except the Triggers' check 1, which reads the forgotten-import checks' shared verdict and lands with them or after them. Every other silence rule for a forgotten import (S12) reads only an attribute and a Structural class.
4. Boundary cases, each recorded in the spec's design decisions:
   - D2: the Nested menu's check 6 (a menu projected into a Top Bar's right-hand section) is held here from its owner's entry (manifest d, misuse), once; manifests b and f filed its quotes (Dropdown Menu, Top Bar) as family. It reads an ancestor's class, context ADR 0043 calls "not a parent".
   - D3: three shared-manifest entries that the component manifests file as family checks are left to the family checks spec: the Flexbox Utilities' visual-order report and the Float Classes' reading-order warning (building-blocks 1.10), and the geometry clauses of the Float and Flex Grid rows of Table D. The coverage table records each.
   - D4: checks of other kinds with a misuse half are left to their kind, as filed: the Drilldown's check 3, the Flexbox Utilities' check 2, the Responsive Menu's check 3, and the Accordion's check 2 (which reads the same kind of generated id the Tabs check reads, but from its content part).
   - D5: fourteen misuse-classified checks that read another part of their family are kept here as the manifests classify them; the family checks spec leaves them here as boundary cases, and each entry says so in one line (for the wave audit): the Nested menu's check 6; the Orbit's checks 1, 2, and 3; the Off-canvas' checks 3 (its first half), 4, 5, and 6; the Triggers' check 1; the Responsive Accordion Tabs' checks 2, 3, and 5; the Tabs' warning for a generated panel id; and the Progress Bar's meter-text check. The Switch's check 2, which reads the paddle's text (the group e manifest's least settled call), stays here too.
   - D6: two checks no manifest lists are taken from the specs at `53144f3`: the Off-canvas' development check 8 (a revealed fixed top or bottom panel whose height exceeds the document's `scroll-padding`, 2.4.11), found by this ticket's comparison of every numbered development-check list with the manifests' headings and also by [Re-run: specs without checks, group d](168-rerun-specs-without-checks-group-d.md); and the Orbit's warning for an unknown `selected` value ("an unknown value is ignored with a dev-mode warning"), found by that re-run.
   - D7: every check one spec quotes and another owns is held once, from its owner. Confirmed in their owners' manifests: the Positioner's three warnings (manifest a, anchored-pane), the Breakpoint service's unknown-name rule behind the Equalizer's `equalizeOn`, the Responsive Toggle's `hideFor`, and the Sticky's `stickyOn` (manifest a), the Menu's check 1 on the Accordion Menu root (manifest c), the Smooth Scroll's `<base href>` check that Magellan quotes (manifest e), the Top Bar's menu-icon checks, the Close Button's name checks, the Button's placeholder-link and copied-class checks, the Triggers' checks 3 and 4, the Forms' help-text check, and the Accordion's check 7. The orchestrator's "Nested menu's nameless back button warning quoted in the Dropdown Menu spec" is the Nested menu's nameless Hybrid toggle warning (its check 2, manifest d), which the Dropdown Menu's 2.4.6 row quotes; the Drilldown's nameless back button is its family check 3.
5. The re-runs' finds taken into the spec: the Tabs' node-level copied-class test (group e); the SSR-smoke "no development warning" assertions of the Slider, Switch, Table, and Top Bar; the Sticky's `stickyOn` quote; the Breakpoint service's ARIA rule 2 and D33 mentions and the Float Grid's quote of the Flex Grid's reverse stylesheet check (group a and c), in the closing section; the Triggers' check 2 (group f's item 5): the check is in manifest f, and a click on a non-Openable target in a non-strict build throws a `TypeError` without it, which the first milestone accepts; a quiet guard is behaviour the Triggers spec owns, not a misuse warning (D12). Group f's item 7 suggests the family checks spec for the Nested menu's check 6; D2 holds it here, and the family checks spec left it here. The finds that name build-time or Runtime checks (group a's `nfs-menu` quotes, group c's `nfs-abide` and `nfs-switch` quotes, group e's Sass items) are not this spec's.
6. Manifest counts: 190 misuse entries in the six component manifests (a 28, b 18, c 23, d 47, e 39, f 35) and 23 in the shared manifest, 213 in all, counted by the verify script from the headings and matched row for row by the coverage table. Manifest d's own count table says 41; its per-file counts and headings give 47, which ticket 159's total of 190 uses.
7. Tests: each check keeps the tests its spec gave it. A test statement written for a list that holds several kinds ("each of the seven warnings fires once") keeps its wording in both deferred specs, each naming its numbers. The e2e assertions about development warnings (the Sticky's 2.4.11 case, the Table's narrow viewport) run against the Fixture app in the development configuration, because the static Storybook build runs in production mode (D13, ADR 0018).
8. Messages stay exactly as the specs wrote them; no common prefix is added (D14).
9. Out of Scope lists every check the specs considered and rejected, from the specs and the re-runs' finds, so the later milestone does not add them by accident.

### Triage

Every item is impact LOW: the placement of a deferred check in one of two deferred specs, test wording, or a development-only diagnostic's timing; none freezes a public name, input, or output, and a check moves between two deferred specs at no cost. Confidence is HIGH for decisions 1 to 3 and 5 to 9 (they follow the ruling, the manifests, the specs' own text, or a measurement), and MEDIUM for D2 and D5 (the manifests disagree, and the family checks spec left the fourteen here). No item is HIGH impact with NOT-HIGH confidence, so nothing is OPEN FOR HUMAN.

### Proposed shared-document changes

For [Task: shared documents for the later-milestone checks](171-task-shared-documents-later-milestone-checks.md). Each quote is written relative to its target file. The ruling lets only the map, the README, the glossary, and the records that must say where the design went name a deferred check, so the building-blocks and guide texts become documented usage with no link, and the ADRs get dated notes. Where groups a, c, e, and f proposed a change to the same sentence, one merged edit applies both.

1. `building-blocks.md` 1.4, input kind 3 (`insertion`): replace ", the spec documents the bound form and the Defaults token, and the directive reports a static attribute in development through `HostAttributeToken`, as the Dropdown pane's check 6 does." with:

   > , the spec documents the bound form and the Defaults token and says that a static attribute is not supported there.

2. `building-blocks.md` 1.4, the initial-state bullet: replace "each such directive reads its host's static `class` through `HostAttributeToken` in development builds only and warns once, naming the input to bind ([Spec: Accordion](issues/15-spec-accordion.md), dev check 7)" with "so a copy has no effect, and each spec names the input to bind instead ([Spec: Accordion](issues/15-spec-accordion.md))"; delete ", and its development check reads the class before that write"; replace "is reported the same way, naming what replaces it" with "is documented the same way, naming what replaces it"; replace "strips a copied State class the same way and does not report it" with "strips a copied State class the same way"; replace "reads the host's static `class` the same way and reports the Foundation classes Foundation's markup put on the plugin's element, because there they are not stripped but style the host itself" with "documents that the Foundation classes Foundation's markup put on the plugin's element are not stripped there but style the host itself"; and in the list of re-runs at the end, replace each "reports a copied ..." with "strips a copied ..." (the Nested menu's `is-active`, the Toggler's `is-hidden`, the Slider's `vertical` and `disabled`, the Tooltip's legacy position classes, the Button's `.submit`), and "stripped by the panel's class record and reported by development check 1 of" with "stripped by the panel's class record in".
3. `building-blocks.md` 1.5, Ids: replace "; the deep-linking inputs warn in dev mode when the id was generated." with:

   > ; each deep-linking input's spec says so.

4. `building-blocks.md` 1.6, rule 4: replace "maps to no class in either direction and is reported in development" with "maps to no class in either direction".
5. `building-blocks.md` 1.8: replace "the directive warns in dev mode on a non-focusable host (`R:apg` Toggler delta)" with "a non-focusable host is not supported (`R:apg` Toggler delta)", and "(confirmed by the Triggers spec, which warns in dev mode on a typeless `<button>` Trigger inside a form)" with "(confirmed by the Triggers spec: a typeless `<button>` Trigger inside a form submits it)".
6. `building-blocks.md` 1.10, Names: replace "A development check that reads a name or text from content (the host's, a referenced element's, a `label`'s, a `legend`'s, a `caption`'s) reads it as accessible-name computation does:" with:

   > A spec that requires a name or text in content (the host's, a referenced element's, a `label`'s, a `legend`'s, a `caption`'s) counts it as accessible-name computation does:

   and "so it never reports a name or text that assistive technology has" with "so a name or text that assistive technology has always counts".
7. `building-blocks.md` 1.10, the component lines: delete "`NfsProgressMeterText` warns in development when its text is wider than its meter, which axe marks incomplete." and write "A meter text is used only where the meter is always wider than its text; axe marks the case incomplete."; replace "and `NfsBadge` warns in development, as `NfsLabel` does" with "as for the Label"; replace "which the directive reports in development" (Responsive Embed) with "so nothing else is written in the box"; replace "`NfsLabel` warns in development and the recipe puts the label inside the link" with "the recipe puts the label inside the link"; replace "; `NfsThumbnail` warns in development" with ""; in the Prototyping Utilities line replace "and `NfsPrototypeOverflow` warns in development", "checked as Sticky's is", "`nfsTextHide` warns when nothing visible replaces its text", and "`nfsBordered` and `nfsBorderNone` warn on form fields, whose 3:1 boundary they undo" with "as documented usage", "as documented usage", "`nfsTextHide` needs something visible in its text's place", and "`nfsBordered` and `nfsBorderNone` are not written on form fields, whose 3:1 boundary they undo"; replace ", checked in development (2.1.1, 4.1.2)" (the `.code-block` line, also group f's) with " (2.1.1, 4.1.2)"; replace "and a development check reports an unnamed Scroll region" with "and a Scroll region without a name is not supported"; replace "which it reports in development (measured in three engines: ...)" and "which it reports in development (measured: ...)" (Visibility Classes) with "(measured in three engines: ...)" and "(measured: ...)", keeping the measurements; replace "checked by a development warning and an e2e case" (Sticky) with "asserted by an e2e case".
8. `building-blocks.md` Table A, the Dropdown (pane) row: replace "(only valid with `role="dialog"`, else a development warning)" with "(only valid with `role="dialog"`)". Table B, the Tooltip row: delete " (development warning)". Table D: in each row's development-checks parenthetical, delete the misuse items (copied classes, names, placement of a name, the include checks, the Scroll region names, the Zero-breakpoint values), leaving what group a's and the family checks spec's proposals leave. Part 4, Decided item 2: replace "interactive hosts only, enforced by a development warning" with "interactive hosts only, as documented usage".
9. `architecture-guide.md` P17: replace "Each directive owns the ARIA, `type` default, and development check its documented markup lacks;" with:

   > Each directive owns the ARIA and `type` default its documented markup lacks, and its spec states each rule the markup must follow as documented usage;

   P23: add under its Rule a dated line:

   > 2026-09-29: the warnings, Runtime checks, and `strictParents` this principle describes are planned and implemented in a later milestone of the implementing repository ([Decide: checks move to a later milestone](issues/158-decide-checks-move-to-a-later-milestone.md)); in the first milestone each misuse it lists is stated as documented usage in the directive's spec.

10. `adr/0039-directives-manage-every-foundation-class.md`, a dated note:

    > - 2026-09-29 ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)): the development-mode checks named in the decision, and the Tooltip's report of a dropped `templateClasses` token (the 2026-09-28 note), are planned and implemented in a later milestone ([specs/misuse-warnings.md](../specs/misuse-warnings.md)); in the first milestone each spec states the rule as documented usage, and a copied class is stripped or keeps styling with no report.

11. Dated notes on the other ADRs that name a misuse warning, each after the last note:
    - `adr/0011-button-listener-free-disabled-contract.md`:

      > - 2026-09-29 ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)): the dev-mode checks of the Button and the Pagination for a disabled link that keeps its target and a placeholder link that is not focusable are planned for a later milestone ([specs/misuse-warnings.md](../specs/misuse-warnings.md)); in the first milestone the two bindings are documented usage.

    - `adr/0013-triggers-target-resolution.md`:

      > - 2026-09-29 ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)): without strict templates, a target that is not an Openable gets no dev-mode report in the first milestone; the check is planned for a later milestone ([specs/misuse-warnings.md](../specs/misuse-warnings.md)).

    - `adr/0019-sticky-native-range.md`:

      > - 2026-09-29 ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)): the development warnings for a leftover anchor attribute and for a container no taller than the bar are planned for a later milestone ([specs/misuse-warnings.md](../specs/misuse-warnings.md), [specs/family-checks.md](../specs/family-checks.md)); in the first milestone the Sticky spec states both as documented usage.

    - `adr/0038-smooth-scroll-same-document-links.md`:

      > - 2026-09-29 ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)): the development checks named above (a `#`-only link that `<base href>` resolves to another document, and Magellan's warning for a host with no in-page links) are planned for a later milestone ([specs/misuse-warnings.md](../specs/misuse-warnings.md)); in the first milestone the Smooth Scroll and Magellan specs state the rule as documented usage.

    - `adr/0042-menu-current-page-aria-current.md`:

      > - 2026-09-29 ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)): the development reports of a copied leaf `is-active` (the Menu) and of several current steps (the Breadcrumbs) are planned for a later milestone ([specs/misuse-warnings.md](../specs/misuse-warnings.md)); in the first milestone `aria-current` on the page's link and `{exact: true}` are documented usage.

    - `adr/0043-menu-root-top-bar-right-section-token.md`:

      > - 2026-09-29 ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)): the menu root's development warning for a menu projected into the right-hand section is planned for a later milestone ([specs/misuse-warnings.md](../specs/misuse-warnings.md)); in the first milestone the side still changes at hydration with no report, and `alignment="right"` is the documented fix.

12. `CONTEXT.md`, a new term after **In-family check**:

    > **Misuse warning**:
    > A directive's own development warning about how the consumer used it, reading only its host, its inputs, its content, or the page: a copied Foundation class, a missing accessible name, a value the directive cannot use. A later-milestone term: planned and implemented in a later milestone ([specs/misuse-warnings.md](specs/misuse-warnings.md)); in the first milestone each rule it reports is documented usage in the directive's spec.
    > _Avoid_: dev check, lint, sanity check

13. `storybook-conventions.md`, the layer list: replace "TestBed-only cases (DI overrides, `DeferBlockBehavior.Manual`, dev-mode warnings, replay-shaped events): layer 2;" with "TestBed-only cases (DI overrides, `DeferBlockBehavior.Manual`, replay-shaped events): layer 2;".
14. `README.md`, the later-milestone section that ticket 171 adds, one row:

    > | Misuse warnings | [specs/misuse-warnings.md](specs/misuse-warnings.md) | Each directive's own development warnings about how the consumer used it: the common contract, twelve shared mechanisms, the checks of 48 component specs under their own numbers, and what comes back to each spec |

    and the count of specs gains one.

### Gist for Decisions so far

- [Spec: misuse warnings (later milestone)](issues/161-spec-misuse-warnings-later-milestone.md) -- every directive's own development warning about how the consumer used it (a copied Foundation class, a missing name, a value it cannot use, a missing include seen in the computed style) is specified for a later milestone in one spec: a common contract (inline `ngDevMode` guard, render callbacks, once per instance, no switch, one read phase with a Runtime check), twelve shared mechanisms, the checks of 48 component specs under their own numbers with their messages and tests, all 213 manifest entries mapped, two checks the manifests missed (the Off-canvas' check 8, the Orbit's unknown `selected`), fourteen family-shaped checks kept here as boundary cases, and a per-spec list of what comes back; impact LOW, nothing OPEN FOR HUMAN. Spec: [specs/misuse-warnings.md](specs/misuse-warnings.md).

### Amendment, 2026-09-30 (audit 0009)

- [Audit 0009: the later-milestone checks wave](../audits/0009-later-milestone-checks-wave.md), H2: S12, the Off-canvas' check 3, and the Triggers' check 1 apply decision 3 of [Decide: family checks report a forgotten peer themselves](../issues/157-decide-family-checks-report-forgotten-peers.md): built with the forgotten-import checks, each registration check calls `nfsReportForgottenPeer` and gives its own message only when every call returns `false`.
- [Audit 0009: the later-milestone checks wave](../audits/0009-later-milestone-checks-wave.md), L5: the Off-canvas' check 4, in its clause on a registered Trigger inside a modal panel, falls under the same rule by its wording; S12 gains its silent-form bullet and names it among the five checks.
