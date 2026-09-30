# 164. Re-run: forgotten-import checks spec for the later milestone

Type: grilling
Status: resolved
Blocked by: 159
Labels: wayfinder:grilling
Map: ../map.md

## Question

The ruling [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md) keeps `specs/forgotten-import-checks.md` as the later milestone's spec for the four forgotten-import checks, and no other spec may name them. The spec's family rule has each family spec list its In-family checks, its `strictParents` rows, and its token descriptions (M7). What must the spec hold so that it is complete on its own?

## How to work it

Opus 5.5, AFK. From the extraction manifests of [Task: extract the checks from the specs](159-task-extract-checks-from-specs.md) and the specs as committed at that ticket: move into the spec, per family, every In-family line, `nfsDirectiveCheck` call, `strictParents` row, and token description the family specs give, verbatim, with the family spec named; rewrite the family rule so it describes what the later milestone adds to each family spec, not what the specs say now; apply items 1 to 4 of [Decide: family checks report a forgotten peer themselves](157-decide-family-checks-report-forgotten-peers.md) as that ticket's scope note says; move in the `strictDirectiveImports` and `strictParents` keys from the Breakpoint service spec's `NfsRuntimeChecks` and the `missing-imports` builder's workspace tooling from the Variant declaration tooling spec; state in the Problem Statement that the spec is planned and implemented in a later milestone and why. Amend [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md) with a dated section.

## Answer

Worked AFK on 2026-09-29 and 2026-09-30 by one Opus 5.5 agent, from the seven extraction manifests and the specs and shared documents as committed at 53144f3. Spec: [specs/forgotten-import-checks.md](../specs/forgotten-import-checks.md), revised in place; [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md) has a dated `### Amendment, 2026-09-29 (later milestone)`.

### Decisions

1. The spec keeps its file and its H1, gains a Milestone line, and its Problem Statement says it is planned and implemented in a later milestone and why: the user's ruling that a forgotten import is Angular's to correct, a smaller first milestone, and the kinds weighed in practice; no WCAG criterion asks for the reports (WCAG binds the consumer's pages; ATAG's checking criteria are for authoring tools). The first milestone ships nothing of it, and no other spec names it or links to it. Out of Scope and design decision D31 say the same.
2. Complete on its own: a new Implementation Decisions section, Family entries, quotes verbatim from the files at 53144f3, per spec with the spec named, section, and lines, every In-family line, `nfsDirectiveCheck` call, token description, and `strictParents` line of 38 specs, and the shared documents' statements (building-blocks, the guide, the glossary, `storybook-conventions.md`, ADRs 0040 and 0046). The quotes were cut from the files, not from the manifests, because four manifest lines differ from their files: two dropped link brackets or list markers (Card 100, Drilldown 168), and two changed words (Drilldown 169, "check:" as "check, because"; the guide's P23, without "beside them"); the verification compares both. D32 records the choice.
3. The family rule now says what the later milestone adds back to each family spec (the five-item line, the token descriptions in place of the plain names, the sentences and tests that name the checks, and 157's changes), and the closing section, What the later milestone adds back, per spec, lists it for each spec by line, with the specific change where 157 names a check.
4. [Decide: family checks report a forgotten peer themselves](157-decide-family-checks-report-forgotten-peers.md), item 1 of its changes, applied: `nfsReportForgottenPeer` in the diagram, the TypeScript block, and a bullet; the two "says nothing" bullets rewritten to decisions 2 to 4 with their lists; the family rule's item 2 points at the rewritten registration bullet; M2 and M3 name the helper; D30; the three test cases in layer 2. Items 2 to 4 are recorded as the changes the later milestone makes when it lands: per family spec in the closing section, and for building-blocks 1.9 as one added sentence, since 1.9 did not state how a family check treats a forgotten import (read at 53144f3).
5. Decision 2 of 157 applies by its wording to two DOM-only placement checks its list did not name: the Top Bar's check 7 (a section whose bar's import was forgotten; no probe covers a bar, so it closes the same gap under `strictDirectiveImports: false`) and the Tabs tab's warning for a parent that is not an `li[nfsTabsTitle]` (its text cites the rule 157 replaced; the strip's probe reports the same element, so no message changes). The Switch's check 6 reads the forgotten input as present and gives no message, so it needs no helper; a new bullet says so. The class-peer checks of other families keep their form, as 157 says.
6. The `NfsRuntimeChecks` keys `strictDirectiveImports` and `strictParents`, their JSDoc, the provider signatures as they touch them, and the Breakpoint service's sentences on them move in (a subsection, The two `NfsRuntimeChecks` keys, and the Family entries); the configuration's owner is now [Spec: Runtime checks (later milestone)](162-spec-runtime-checks-later-milestone.md). If this spec lands first, it brings that configuration surface with only its two keys and the checker token; the production provider comes with the Runtime checks spec (D33).
7. The `missing-imports` builder's workspace tooling moves in from the Variant declaration tooling spec: the Selector manifest as the package's second JSON document, the builder and generator in the collections, D22's clause, and the `angular-html-parser` optional peer dependency (a paragraph under The static check, and the Family entries).
8. Boundary calls, each under the brief's orchestrator notes. The Storybook layer-1 report guard (storybook-conventions section 8 and its checklist item) moves with the checks: unlike the Variant typings check, which is a gate that needs nothing deferred, it only reads reports the deferred checks make, so it guards nothing without them. The In-family parent check's M5, which replaced each family's own outside-the-parent warning (Breadcrumbs check 7, Menu check 3, the Nested menu's checks 3 and 5 in part, Pagination's, the Slider's check 6, the Orbit's check 8, the Equalizer's, the Drilldown's check 3 in part), stays here, as the manifests classify it; building-blocks 1.9's general rule for an optional parent is the family kind's, so [Spec: family checks (later milestone)](160-spec-family-checks-later-milestone.md) and this spec both describe that report, one as the rule and one as the mechanism, which the wave audit should confirm. The Orbit's, the Slider's, and the Equalizer's tests that call `provideNfsRuntimeChecks({strictParents: true})` move with this spec.
9. Taken from the specs at 53144f3 because their manifests do not quote them: the Responsive Accordion Tabs' In-family line (line 186; group d recorded no entry for it), the Equalizer's token description (line 143; named but not quoted), the Breakpoint service's key declarations and sentences (lines 31, 165, 176, 349, 359-362, 375-376, 380, 395, 397, 404; group a quoted the two table rows and line 397), and the Variant declaration tooling's lines 418 and 587. Every check the manifests name as another spec's is in that spec's entry (the menu roots' calls, the Float and Flex Grids' shared rule 2).

### Triage

| Item | Impact | Confidence | Outcome |
| --- | --- | --- | --- |
| Verbatim Family entries and the closing list | LOW: a deferred spec's content; nothing ships | HIGH: the ruling asks each deferred spec for the full design | decided |
| 157's decision 2 applied to the Top Bar's check 7 and the Tabs tab warning | LOW: development messages of a later milestone | HIGH: 157's wording covers them; the gap it closes is the same | decided |
| Landing order with the Runtime checks spec (D33) | LOW: planning order, no public API beyond what both specs give | HIGH: the configuration's shape is fixed by both specs | decided |
| Storybook report guard moves with the checks | LOW | HIGH: it reads only the deferred reports | decided |
| M5 kept here beside the family kind's rule | LOW: both deferred | HIGH: the manifests' classification | decided, routed to the wave audit |

Nothing is OPEN FOR HUMAN.

### Proposed changes for the shared documents

For [Task: shared documents for the later-milestone checks](171-task-shared-documents-later-milestone-checks.md); quoted text is the replacement, written relative to its target file. The other deferred specs' proposals cover the family, misuse, Runtime, and build-time clauses of the same passages.

1. `building-blocks.md` 1.9: replace the bullet "Forgotten imports (2026-09-28, ...)" with:

   > - Imports (2026-09-28, [ADR 0046](adr/0046-forgotten-imports-caught-by-checks.md); 2026-09-29, [Decide: checks move to a later milestone](issues/158-decide-checks-move-to-a-later-milestone.md)): entry points export their directive classes and no import arrays, and a component lists in its `imports` every directive class whose attribute its template writes. A forgotten one renders the element without that directive's classes, ARIA, and behaviour, with no report, unless a bound input or a template reference makes the compiler report it (NG8002, NG8003); each spec's usage examples import every directive they use. A parent token's description is its name (`new InjectionToken<NfsAccordion>('nfsAccordionToken')`).

2. `building-blocks.md` Part 3: "Six, each written" becomes "Five, each written"; item 6 and Table C's Forgotten-import checks row are removed. Table A's Orbit row: "; the five class-only directives inject nothing in production" becomes "; the five class-only directives inject nothing". Table B's Orbit row: "the five class-only directives inject nothing in production (an optional development-only lookup)" becomes "the five class-only directives inject nothing". Table D's Pagination row loses " and a development-only lookup of `NfsPagination` by class in the item directives", and its Breadcrumbs row " and the item's development-only lookup of `NfsBreadcrumbs` by class".
3. `architecture-guide.md` P23: remove `strictDirectiveImports` from the list of Runtime checks, the clause "and `strictDirectiveImports` never does, because it reads Angular's development debugging API;", and the clause "the opt-in `strictParents` flag beside them makes an optional parent injection that found nothing throw, in development builds only;". P24 becomes:

   > #### P24. A forgotten import of an attribute directive fails silently; entry points export classes, not import arrays
   >
   > Rule: Entry points export their directive classes and no import arrays (ADR 0046). A component lists in its `imports` every directive class whose attribute its template writes. A spec's TypeScript usage examples import every directive they use, and its class and ARIA assertions run in the story gate, so a story whose `moduleMetadata.imports` misses a directive fails on the element it leaves bare.
   >
   > Why: Angular reports no error for a static attribute that matches no imported directive; a bound input on the missing directive fails (NG8002, binding to a property that does not exist), a static one does not, and the first milestone ships no report of its own for it ([Decide: checks move to a later milestone](issues/158-decide-checks-move-to-a-later-milestone.md)). An exported array prevents only a forgotten member and hides its members from the unused-imports diagnostic and `ng generate @angular/core:cleanup-unused-imports`; the three specs that exported one (`NFS_ACCORDION`, `NFS_RESPONSIVE_ACCORDION_TABS`, `nfsPrototypeClasses`) dropped it. Material's per-component NgModules are compatibility leftovers, and Angular Aria exports classes and tokens only.
   >
   > Preferred: `imports: [NfsAccordion, NfsAccordionItem, NfsAccordionTitle, NfsAccordionContent]`, which the unused-imports diagnostic can check member by member; `[expanded]="true"` on a title, which fails to compile when `NfsAccordionTitle` is not imported.
   > Avoided: an exported import array such as `NFS_ACCORDION`; a TypeScript example that shows `<button nfsButton>` without its import.
   >
   > Decided by: the user's ruling of 2026-09-28 against import arrays ([ADR 0046](adr/0046-forgotten-imports-caught-by-checks.md)); the user's ruling of 2026-09-29 ([Decide: checks move to a later milestone](issues/158-decide-checks-move-to-a-later-milestone.md)); building-blocks 1.9 (its imports bullet).

   Its Sources line stays; "What this guide adds beyond the records" keeps "P24's import array".
4. `CONTEXT.md`: Forgotten import keeps its definition and gains "The first milestone reports none; the later milestone's forgotten-import checks do ([Spec: forgotten-import checks (shared utility)](issues/150-spec-forgotten-import-checks.md))." Selector manifest and In-family check each gain "A later-milestone term: [Spec: forgotten-import checks (shared utility)](issues/150-spec-forgotten-import-checks.md), planned and implemented in a later milestone ([Decide: checks move to a later milestone](issues/158-decide-checks-move-to-a-later-milestone.md))." The Runtime check term's clauses "or a Forgotten import on a rendered element" and "The `strictParents` flag beside them ..." stay inside that term, under the marker the Runtime checks spec's proposal gives it.
5. `storybook-conventions.md` section 8: replace the bullet "Layer 1 runs in Angular development mode, so the forgotten-import checks run in every story ..." with:

   > - A directive missing from `moduleMetadata.imports` leaves its element without the directive's classes and ARIA, with no report, because a static attribute that matches no imported directive is plain HTML; the story's class and ARIA assertions (section 7) and the Accessibility gate fail on that element, so each story asserts the classes and ARIA of every directive its template writes.

   and remove the section 11 checklist item "The story logs no forgotten-import or wrong-element report."
6. ADR 0046, a dated bullet at the end of Consequences:

   > - 2026-09-29 ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)): the four checks are specified but planned and implemented in a later milestone of the implementing repository, by [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md), which [Re-run: forgotten-import checks spec for the later milestone](../issues/164-rerun-forgotten-import-checks-later-milestone.md) made complete on its own. In the first milestone a forgotten import renders without its directive, with no report, and every spec states the imports it needs as documented usage. The ruling of no import arrays stands on its own, for the unused-imports diagnostic and the cleanup migration.

7. ADR 0040, in its dated note for the ruling (or a bullet of its own): "`strictDirectiveImports` and `strictParents` move with the forgotten-import checks to a later milestone ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), which owns the two keys beside the Runtime checks' configuration."
8. README: the Forgotten-import checks row (line 91) moves to the later-milestone section with the other four deferred specs; the Forgotten imports list's item 3 ends "; since [Re-run: forgotten-import checks spec for the later milestone](issues/164-rerun-forgotten-import-checks-later-milestone.md) the spec itself holds every family spec's In-family lines, token descriptions, and `strictParents` lines, for the later milestone" in place of "the family specs' In-family check lines, token descriptions, and `strictParents` rows are checked by [Audit: the specs against the architecture guide](issues/142-audit-specs-against-architecture-guide.md)"; the later-milestone wave's item 2 marks this ticket resolved.

For the orchestrator, not a shared document: the family checks spec's entries for the checks named in decision 5 and in 157's decisions 2 and 3 should point at this spec's rule, so the two later-milestone specs agree when they land (the wave audit).

### Verification

`verify.mjs` in the scratchpad scanned the three files: no non-ASCII, no banned word, every relative link resolves (proposal quotes and the gist excluded), every table row matches its header's cell count, and every line of every `forgotten-import` entry of the seven manifests (55 entries, 156 lines) is in the spec, verbatim, or after removing link brackets and list markers (two lines), or, for the two reworded lines of decision 2, as the file text they stand for; every quoted range matches the file at 53144f3. Each scan has a positive control. Excluded, as the bundle's convention has it: the proposal sections and gist lines, whose links are relative to their target files.

### Gist for Decisions so far

- [Re-run: forgotten-import checks spec for the later milestone](issues/164-rerun-forgotten-import-checks-later-milestone.md) -- the forgotten-import checks spec is marked for a later milestone and made complete on its own: it quotes verbatim every In-family line, `nfsDirectiveCheck` call, token description, and `strictParents` line of 38 specs and the shared documents' statements, takes in the `strictDirectiveImports` and `strictParents` keys (the Runtime checks spec owns the configuration) and the `missing-imports` tooling of the Variant tooling's package, adds `nfsReportForgottenPeer` and rewrites the two "says nothing" bullets to the user-approved rule (also covering the Top Bar's check 7 and the Tabs tab warning), and ends with what the later milestone adds back to each spec; nothing OPEN FOR HUMAN.

### Amendment, 2026-09-30 (audit 0009)

- [Audit 0009: the later-milestone checks wave](../audits/0009-later-milestone-checks-wave.md), H2: the spec names [Spec: misuse warnings (later milestone)](../issues/161-spec-misuse-warnings-later-milestone.md) as the home of the Orbit's checks 1 and 3, the Off-canvas panel's check 3 (part a), and the Triggers' check 1 (the Problem Statement, the In-family lead, the registration bullet, the usage example, and the closing section).
- [Audit 0009: the later-milestone checks wave](../audits/0009-later-milestone-checks-wave.md), L5: the registration bullet and the closing section's Off-canvas entry add the Off-canvas' check 4 by the same wording.
- [Audit 0009: the later-milestone checks wave](../audits/0009-later-milestone-checks-wave.md), L4: user story 46 asks for the report of a part that sits outside its parent.
