# 162. Spec: Runtime checks (later milestone)

Type: grilling
Status: resolved
Blocked by: 159
Labels: wayfinder:grilling
Map: ../map.md

## Question

The ruling [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md) specifies Runtime checks: ADR 0040's checks (a Variant value with no class in the compiled CSS, missing Variant properties, Breakpoint drift), `provideNfsRuntimeChecks`, `provideNfsProductionRuntimeChecks`, and the `NfsRuntimeChecks` keys, now specified by the Breakpoint service spec, for a later milestone of the implementing repository. What is that spec?

## How to work it

Opus 5.5, AFK under the map's triage rule. Write `specs/runtime-checks.md` in the map's spec shape and `/to-spec`'s sections, from the extraction manifests of [Task: extract the checks from the specs](159-task-extract-checks-from-specs.md) and the specs as committed at that ticket: its Problem Statement says it is planned and implemented in a later milestone and why (the ruling), and that the user wants the kinds weighed against each other in practice; it holds every check of its kind, per component, with its design as the specs gave it (its trigger, its message, its cost, its tests), so the later milestone loses nothing; its Testing Decisions keep the tests the checks had; and a closing section lists, per component spec, what the later milestone adds back to that spec when it lands. A check the manifests classify under another kind is left to that kind's spec; a boundary case is decided under the triage rule and recorded. The spec may name and link any component spec; no component spec links back to it.

## Answer

Resolved 2026-09-30 by self-grilling (AFK, Opus 5.5), from the seven manifests of [Task: extract the checks from the specs](159-task-extract-checks-from-specs.md) and the specs, ADRs, and shared documents at `53144f3`, and, for the boundaries with the other kinds, the committed Answers at HEAD of [Spec: build-time checks (later milestone)](163-spec-build-time-checks-later-milestone.md) and of the re-runs of groups a, b, c, e, and f. Spec: [specs/runtime-checks.md](../specs/runtime-checks.md).

### Decisions

1. Scope: the spec holds every `runtime` entry of the manifests, 35 in all. The component manifests hold 24 (a 6, b 5, c 4, d 5, e 0, f 4) and the shared manifest 11. Group d's count table says 6 for its five entries (off-canvas 1, progress-bar 2, prototyping-utilities 1, responsive-embed 1), and ticket 159's total of 25 carries that error; group f's "Runtime checks - not present for Toggler" heading records an absence and is not counted. The spec's Manifest entries table lists all 35 by heading, and the verification script checks each against the manifests.
2. Owner of the configuration: this spec owns `NfsRuntimeChecks` (its three Runtime-check keys), `NfsRuntimeCheckReport`, `provideNfsRuntimeChecks`, `provideNfsProductionRuntimeChecks`, the internal checker token, and `nfsVariantCheck`, which the Breakpoint service spec held at `53144f3` (group a's decision 4 removes them there). The interface is shown with all five keys, as at `53144f3`, marking `strictDirectiveImports` and `strictParents` as the [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md)'s, which extends this configuration and already points here. Whichever of the two specs the later milestone plans first brings this spec's configuration sections with it (D2, D4).
3. Entry point: `ngx-foundation-sites/media-query`, as at `53144f3`. `strictBreakpointSync` runs in the Breakpoint service's go-live callback, so landing it touches that service's implementation; an entry point that imports nothing else from `ngx-foundation-sites/media-query` in the first milestone (the Badge, the Label, the Callout, the Close Button, the Button Group, the Progress Bar, the Responsive Embed) gains that import (D3).
4. Copied design: the Breakpoint service spec's whole Runtime checks section (lines 347 to 460 at `53144f3`) is copied in full, as group a's Answer asks, and every other passage of that spec on the checks is listed in its Per component entry (the Problem Statement, the CSS mapping rows, the "Checked by" cells, the umbrella-provider sentence, the consumer table, going live, WCAG, Rendered output, Rendering modes, the drift check's limits, D19, D20, D22, D26 to D31, D33, the Out of Scope items, the usage examples, the `@property` item, the Storybook note, and the custom-map story's style block). Each component's request is copied from its spec at `53144f3`, verbatim except the pointer "the report shape, the per-realm read, and the configuration are the Runtime checks' (Breakpoint service spec or ADR 0040)", which is now this spec. Tests are copied verbatim into Testing Decisions.
5. Shared mechanisms, said once and named in each entry: the handle; the render callback; two presence-request rules (P1 on every run, P2 only while bound); four need shapes (N1 a one-token name, N2 a Class breakpoint, N3 a count, N4 a flag-gated family); the writers and their three exceptions; an emptied map; the class guard. A summary table lists the twenty specs' handles, `include()` calls, rules, inputs, and properties.
6. What the checks read, and who writes it: the registry Variant properties and `--nfs-breakpoint-classes` are first-milestone Sass (the ruling's item 4); the presence markers, the flag-gated properties (`--nfs-button-responsive-expanded`, `--nfs-flexbox-responsive-breakpoints`, the sixteen `--nfs-prototype-<flag>-breakpoints`), `--nfs-media-object-section`, and the Breakpoint properties `--nfs-breakpoint-<name>`, are written by the build-time checks spec as P1 to P5; this spec only reads them and points there for the writing side (the coordinator's instruction; ticket 163's decision 7; group a's decisions 5 and 7; groups b and c). The later milestone lands each marker no later than the check that reads it. Every component entry that at `53144f3` also said how a marker is written (the Flexbox Utilities' Sass items 1 and 6, the Media Object's D6, the Prototyping Utilities' item 6, the Button's D19) keeps only its reading half.
7. The one-writer rule stays a first-milestone rule on who writes a Variant property; its reason, that a second writer would hide a missing include from `strictVariantProperties`, is this spec's (Shared mechanisms, Writers), as ticket 163's proposal 4 says.
8. Landing with the misuse warnings: at `53144f3` most directives shared one read phase between their development warnings and their requests. Landed alone, the requests run in a read phase created only when the handle is not `null`; landed together, they share it. The Off-canvas panel's check 7 and the Top Bar's check 6 report a Zero-breakpoint value, so the Runtime check passes `[]` for it; landed without the misuse warnings, that value goes unreported, and the spec keeps the split rather than changing it (D4).
9. Messages: the specs' verbatim texts (R1, R2 with the Button's and the Media Object's examples, R4, R5) are kept; where the specs give only what a report says (R3, a `null` need; the counts and the flag-gated names), the spec says that and invents no text (D14).
10. Prior art, a new row: Angular Material's `MatCommonModule` sanity checks, which read a theme marker through computed style and were configured per check through `MATERIAL_SANITY_CHECKS`, removed in 19.0.0 (angular/components commit 54875a3, #29688) because "they won't execute with standalone by default"; read in the local clone at 22.2.x. It informs the later milestone's weighing and changes no design.
11. Closing section: per component spec, its entry, its tests, and the sentences to restore, by section at `53144f3`, for the twenty specs with requests and the Breakpoint service; the menu roots that host `NfsMenu`; the Reveal, Responsive Toggle, and Variant declaration tooling specs, which name another spec's check; and the specs whose only mention is a disclaimer (optional to restore). Every pointer that named the Breakpoint service spec as the configuration's home points to this spec when it lands.

### Boundary cases

Checks the manifests put under another kind, judged and left there (never copied here):

- The Breakpoint service's own development diagnostics (unknown names and modifiers, invalid rule tokens, an invalid map or Server breakpoint): misuse, as the spec itself says ("What stays outside the Runtime checks", D33). The spec keeps that section's text as a boundary and holds none of them.
- `strictDirectiveImports` and `strictParents`: forgotten-import, though they are keys of `NfsRuntimeChecks` (manifest a's boundary call 3; ADR 0040's dated note of 2026-09-28).
- The Float Grid's check 3 (no Float Grid in the stylesheet), the Responsive Toggle's check 5 (a missing Visibility class), and the Pagination's check 5, the Breadcrumbs' check 6, and the Table's hidden header check, which read computed style for a missing include no Runtime check can see: misuse. The Float Grid's D10 rejected a `strictVariantProperties` report, and the spec records it.
- The copied-class warnings that leave "consumer-declared names" to the Variant check (Badge, Callout, Dropdown, Label, Progress Bar, Responsive Embed): misuse, with a cross-reference that returns with whichever of the two specs lands second.
- building-blocks 1.13's one-writer rule and flag-gated markers (manifest shared, filed build-time): the markers are the build-time checks spec's P1 to P4, and the rule is first-milestone Sass; only the rule's reason is here (decisions 6 and 7).
- The Breakpoint properties: manifest a kept them as a Library mixin's output; by group a's decision 5 and ticket 163's P5 they are presence markers read only by `strictBreakpointSync`, written by the build-time checks spec. The spec follows that (decision 6).
- The Button's story rule (the responsive forms stay out of stories) and the preview stylesheet's includes: the library's own story setup, which stays; their Runtime-check reasons are this spec's layer 1.
- Interchange's rules and the specs' "no Runtime check" disclaimers: not checks; Interchange is recorded in Out of Scope (group c's note), and the disclaimers are optional in the closing section.
- The group d re-run ([Re-run: specs without checks, group d](168-rerun-specs-without-checks-group-d.md)) sends here the Prototyping Utilities' sixteen `--nfs-prototype-<flag>-breakpoints` flag properties, read side only, and its Out of Scope item on detecting which of Foundation's prototype export mixins a consumer included. Both are taken from `specs/prototyping-utilities.md` at `53144f3`: the flag properties as the Prototyping Utilities entry's needs and N4 (their writing side is the build-time checks spec's P4), and the Out of Scope item in this spec's Out of Scope (a missing include of a Foundation export mixin is not reported, because the checks read the Variant properties a Library mixin writes, not Foundation's rules; D19).
- The orchestrator's note on sweeps that left checks out of a file's manifest: every Runtime check another spec names is in its owner's manifest (the Close Button's report in the Reveal, `strictBreakpointSync` in the Responsive Toggle, the Media Object, and the Prototyping Utilities, the Menu's checks in the five menu specs, the Variant tooling's mentions in the Breakpoint service's); none had to be taken from an owner spec. What the Breakpoint service manifest summarised, the spec takes from the spec at `53144f3` in full (decision 4).

### Triage

- Decisions 1, 4, 5, 9, 10, 11 and every boundary case: impact LOW (the layout and sources of a spec that ships nothing before the later milestone), confidence HIGH (the manifests, the specs at `53144f3`, the ruling).
- Decisions 2 and 3: impact MEDIUM (they fix where a public configuration API is specified), confidence HIGH (the design is the one the specs gave at `53144f3`, unchanged; group a's decision 4 and the forgotten-import checks spec at HEAD already point here).
- Decisions 6 and 7: impact LOW to MEDIUM (which spec writes the presence markers; restoring them is additive), confidence HIGH (the ruling's build-time kind names "presence markers read only by a check"; ticket 163's decision 7; the coordinator's instruction).
- Decision 8: impact LOW (a planning order of the later milestone), confidence HIGH (the split is the specs' own, "so one mistake makes one report").

Nothing is OPEN FOR HUMAN.

### Proposed shared-document changes

For [Task: shared documents for the later-milestone checks](171-task-shared-documents-later-milestone-checks.md). Each quote is written relative to its target file. They add to the shared manifest's entries and to the proposals of tickets 163 and 165 to 170; where one of those already replaces a whole passage below, that proposal covers it.

`building-blocks.md`:

1. 1.4, the Defaults and binding bullet: delete the sentence from "A directive whose Variant inputs read a Variant property reports them through `nfsVariantCheck(directive)`" through "because reads and reports are once per realm ([Spec: Breakpoint service (shared utility)](issues/53-spec-breakpoint-service.md), Runtime checks)."
2. 1.7, the Service bullet: delete the sentence "The entry point also holds the Runtime checks ([ADR 0040](adr/0040-variant-input-types.md)): `provideNfsRuntimeChecks`, `provideNfsProductionRuntimeChecks`, and `nfsVariantCheck(directive)`, through which every directive with a Variant property reports ([Spec: Breakpoint service (shared utility)](issues/53-spec-breakpoint-service.md), Runtime checks)." The source-of-truth bullet is group a's item 1.
3. 1.9, the Defaults tokens bullet: delete the sentence "The runtime checks are configured by two provider functions of `ngx-foundation-sites/media-query`, `provideNfsRuntimeChecks` (development overrides) and `provideNfsProductionRuntimeChecks` (production opt-in), not by an umbrella `provideNfs()` ([ADR 0040](adr/0040-variant-input-types.md))."
4. 1.13: delete the bullet that begins "The runtime checks: `strictVariantNames`, `strictVariantProperties`, and `strictBreakpointSync` read the same properties". The Variant properties bullet is ticket 163's proposal 4 and group a's item 6.
5. Part 3, the Breakpoint service item: delete the sentence "It is also the home of the Runtime checks ([ADR 0040](adr/0040-variant-input-types.md)), which every directive with a Variant property reports to."
6. Table C, the Breakpoint service row: delete "; the Runtime checks: `provideNfsRuntimeChecks`, `provideNfsProductionRuntimeChecks`, `nfsVariantCheck()`" and ", `getComputedStyle` in render callbacks (Runtime checks)".
7. Table B, the OffCanvas row: replace "take Class breakpoints (`NfsClassBreakpoint`) and report through the Runtime checks, so" with "take Class breakpoints (`NfsClassBreakpoint`), so".
8. Tables A and D, drop each Runtime-check clause: the Dropdown (pane) row's "`nfsVariantCheck()` for `size`;" (group b's item 4 covers it); the Button Group row's "the Variant check against `nfs-button`'s properties;"; the Media Object row's "the Variant check of `alignment` and `mainSection` against `--nfs-media-object-section`;"; the Close Button, Callout, Badge, Label, Progress Bar, Responsive Embed, Prototyping Utilities, and Flexbox Utilities rows' "the `strictVariantNames` and `strictVariantProperties` Runtime checks;"; the Visibility Classes row's "the `strictVariantNames` and `strictVariantProperties` Runtime checks over `--nfs-breakpoint-classes`;"; the Typography Helpers row's "the `strictVariantNames` and `strictVariantProperties` Runtime checks for alignment rules keys against `--nfs-breakpoint-classes`;"; and the XY Grid, Float Grid, and Flex Grid rows' "the Runtime checks;".

`architecture-guide.md`:

9. The building-block table's "Shared service, function, token, or type" row: delete "; `provideNfsRuntimeChecks`" from its examples.
10. P18: replace "or a verification channel (Breakpoint and Variant properties), not theming" with:

    > or a list the Variant declaration tooling reads (the Variant properties), not theming

11. P22, Preferred: delete "; `provideNfsProductionRuntimeChecks()`".
12. P23: in the Rule, delete "a missing Library mixin include," from the list, and delete the sentence part "The Runtime checks (`strictVariantNames`, `strictVariantProperties`, `strictBreakpointSync`, `strictDirectiveImports`) run by default in development with a per-check opt-out; the first three also run in production through the opt-in provider, and `strictDirectiveImports` never does, because it reads Angular's development debugging API;" (the forgotten-import proposals cover `strictDirectiveImports` and `strictParents` in the same sentence); in Why, delete "; the compiled Sass is the source of truth for names, so the check reads the Variant properties in the browser after the first render"; in Preferred, delete "; `provideNfsRuntimeChecks({strictVariantNames: false})`". Where ticket 171 marks the whole of P23 as a later-milestone principle, it adds:

    > The Runtime checks are specified by the [Spec: Runtime checks (later milestone)](issues/162-spec-runtime-checks-later-milestone.md).

`CONTEXT.md`:

13. **Runtime check**: mark it a later-milestone term, and replace "or a Forgotten import on a rendered element; the Variant and Breakpoint checks can also be opted into production." with:

    > or, through `strictDirectiveImports`, a Forgotten import on a rendered element; the Variant and Breakpoint checks can also be opted into production. A later-milestone term: the first milestone has no Runtime check ([Spec: Runtime checks (later milestone)](issues/162-spec-runtime-checks-later-milestone.md)).

14. **Breakpoint properties**: group a's item 9 says they "are specified with the Runtime checks"; ticket 163 writes them as presence marker P5. Use one sentence in place of both:

    > A later-milestone term: the Breakpoint properties are written by the [Spec: build-time checks (later milestone)](issues/163-spec-build-time-checks-later-milestone.md) and read by the `strictBreakpointSync` Runtime check of the [Spec: Runtime checks (later milestone)](issues/162-spec-runtime-checks-later-milestone.md); in the first milestone `nfs-breakpoint-properties` writes only `--nfs-breakpoint-classes`.

15. **Variant properties**: group a's item 9 ("read by the library's generator (and, in a later milestone, by the Runtime checks)") stands.

`storybook-conventions.md`:

16. The `nfs-flexbox-utilities` comment: ticket 163's replacement ("--nfs-flex-source-ordering-count") stands; nothing more.

ADRs, each a dated note after the last one:

17. [ADR 0040](../adr/0040-variant-input-types.md):

    > 2026-09-30 ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)): the Runtime checks bullet and its consequence, the three checks `strictVariantNames`, `strictVariantProperties`, and `strictBreakpointSync`, `provideNfsRuntimeChecks`, `provideNfsProductionRuntimeChecks` with its `report` callback, and `nfsVariantCheck`, are specified by the [Spec: Runtime checks (later milestone)](../issues/162-spec-runtime-checks-later-milestone.md), not the Breakpoint service spec, and planned for a later milestone. The first milestone ships the closed types, the registries, the declaration file and its generate mode, and the registry Variant properties, and no Runtime check; a value that bypasses the type, a drifted declaration file, and a missing Library mixin include go unreported, and each spec states the include as documented usage.

18. [ADR 0005](../adr/0005-breakpoint-source-of-truth.md), in place of group a's item 10, whose last clause predates ticket 163:

    > 2026-09-30 ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)): the drift check, `strictBreakpointSync`, is specified by the [Spec: Runtime checks (later milestone)](../issues/162-spec-runtime-checks-later-milestone.md) and planned for a later milestone, with the `--nfs-breakpoint-<name>` properties it reads, which the [Spec: build-time checks (later milestone)](../issues/163-spec-build-time-checks-later-milestone.md) writes. In the first milestone the consumer keeps `nfsBreakpointsToken` in step with `$breakpoints` as documented usage, and `nfs-breakpoint-properties` writes only `--nfs-breakpoint-classes`, which the Variant declaration tooling reads. The first consequence's "the dev-mode check catches the mismatch" holds only in the later milestone.

19. [ADR 0012](../adr/0012-sass-packaging.md), with the notes of group a (item 11) and ticket 163:

    > 2026-09-30 ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)): "the runtime checks read them in the browser" in the 2026-09-27 note belongs to the [Spec: Runtime checks (later milestone)](../issues/162-spec-runtime-checks-later-milestone.md); in the first milestone the generator is the Variant properties' only reader.

20. [ADR 0044](../adr/0044-utility-directive-rule.md):

    > 2026-09-30 ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)): the consequence that names a Runtime-check handle after the directive class applies when the [Spec: Runtime checks (later milestone)](../issues/162-spec-runtime-checks-later-milestone.md) lands; the first milestone creates no handle.

`README.md`:

21. In the Shared utilities table, a row after the build-time checks row that ticket 163 proposes:

    > | Runtime checks, later milestone (`strictVariantNames`, `strictVariantProperties`, `strictBreakpointSync`, `provideNfsRuntimeChecks`, `provideNfsProductionRuntimeChecks`, `nfsVariantCheck`) | [specs/runtime-checks.md](specs/runtime-checks.md) | Custom Angular in development builds, with one opt-in production path, in `ngx-foundation-sites/media-query` ([ADR 0040](adr/0040-variant-input-types.md), [ADR 0005](adr/0005-breakpoint-source-of-truth.md)) | The seven [checks extraction manifests](research/checks-extraction-shared.md) | None needed | The twenty specs whose directives report a Variant property, the Breakpoint service's go-live callback, and the forgotten-import checks, which extend its configuration |

22. The Variant declaration tooling row's Consumers cell: replace "the Breakpoint service's runtime checks (the Variant property format)" with "the later milestone's Runtime checks (the Variant property format)".
23. The wave list's item 2: mark [Spec: Runtime checks (later milestone)](issues/162-spec-runtime-checks-later-milestone.md) resolved.

### Gist for Decisions so far

- [Spec: Runtime checks (later milestone)](issues/162-spec-runtime-checks-later-milestone.md) -- every Runtime check of the seven manifests (24 component entries and 11 shared statements) is specified for a later milestone: the configuration (`NfsRuntimeChecks`, `NfsRuntimeCheckReport`, `provideNfsRuntimeChecks`, `provideNfsProductionRuntimeChecks`, the checker token), `nfsVariantCheck`, and `strictBreakpointSync`, copied in full from the Breakpoint service spec, and the requests of twenty component specs, each with its trigger, message, cost, and tests and the shared mechanisms said once; the spec stays in `ngx-foundation-sites/media-query`, the forgotten-import checks extend its configuration, and it only reads the presence markers the build-time checks spec writes; a closing section lists what each spec adds back; impact MEDIUM at most, confidence HIGH, nothing OPEN FOR HUMAN. Spec: [specs/runtime-checks.md](specs/runtime-checks.md).

### Amendment, 2026-09-30 (audit 0009)

- [Audit 0009: the later-milestone checks wave](../audits/0009-later-milestone-checks-wave.md), L3: the two presence-request rules are Q1 and Q2, apart from the presence markers P1 to P5; the entry points that gain a `media-query` import add the Button Group, the Progress Bar, and the Responsive Embed (the spec and decision 3); the production-mode Storybook build cites ADR 0018.
