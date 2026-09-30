# Audit 0011: the final wave

Date: 2026-10-01
Auditor: audit judge (Opus 5.5), over the reports of four read-only sweepers (Sonnet 5.5); read-only except this file

## Scope

Everything below was audited as committed at HEAD `e7ff40f` ("repair the broken relative links in the trail"). The working tree was clean at the start of the run (`git status --porcelain` empty), so the files read equal the commit.

The wave is every commit in `d59c7f0..e7ff40f`: 11 commits, `git diff --name-status d59c7f0 e7ff40f` over 110 files (9 added, 101 modified, none deleted). It holds:

- `c737cc3`, the map's pointer from the architecture-guide audit's gist to [Decide: the Prototyping Utilities' Library mixin](../issues/173-decide-prototyping-utilities-library-mixin.md), and `ffd6f32`, which opened the two tickets below;
- [Consistency review: the later-milestone waves](../issues/180-consistency-review-later-milestone-waves.md): seven group commits (a `9aa93ee`, b `1777da2`, c `413b057`, d `cc88ad6`, e `5088649`, f `2772715`, g `40a28fa`), each with its report under `research/consistency-review-later-waves-group-<x>.md`, and the closing pass `466bdde`;
- [Task: repair the broken relative links](../issues/181-task-repair-broken-relative-links.md) and its commit `e7ff40f`.

What was checked:

1. The review's own claims: ticket 180's Answer and the seven group reports. Each claimed fix present at HEAD; each "no change needed" spec read in full against the ticket's seven checks (at least one per group); the closing pass's 15 rows applied once each with their amendment lines; the ticket's seven checks applied by the audit to a sample of changed specs and to every shared-document edit.
2. The link repair: ticket 181's Answer, a fresh link and anchor check over the whole bundle, and the word-level diff of `e7ff40f`.
3. Truth against the records: contradictions the wave introduced between specs, ADRs with their dated notes, building-blocks, the glossary, the architecture guide, the Storybook conventions, the README, and the map; the README's counts against the files.
4. The wayfinder process: every ticket resolved with an Answer; each resolved ticket's gist once in the map's Decisions so far; the map's Not yet specified and Out of scope still true; nothing OPEN FOR HUMAN unrecorded.
5. Hygiene over the wave's 110 files and its 11 commit messages.

Governing rules: `/wayfinder`, `/to-spec`, `/domain-modeling`, `docs/agents/issue-tracker.md`, and `map.md` (Destination, Standing preferences with the Milestones and Later-milestone families notes, Spec shape, the triage rule, Audits). Severity definitions and the report shape follow [audit 0009](0009-later-milestone-checks-wave.md), as [audit 0010](0010-later-milestone-families-wave.md) did.

Pre-existing issues outside the wave are reported where they are High, or where the wave's review read the passage and claimed it true (M1's line 16, M2, L2).

## Method

The judge read tickets 180 and 181 in full, the map's Notes, Decisions so far, Not yet specified, and Out of scope, the README in full, audit 0010 in full, and the four sweeper reports, then re-read every cited line of every candidate in the files at HEAD before keeping, merging, or dropping it. The sweepers' slices: 1, groups a and b (Dropdown Menu and Tooltip read in full as "no change" specs; Responsive Menu, Top Bar, Off-canvas, and Tabs read in full; the word diffs of all 16 specs the two groups changed); 2, groups c, d, and e (Equalizer, Card, and Responsive Embed read in full as "no change" specs; Breakpoint service, Sticky, and Table read in full, the Variant declaration tooling nearly so; the word diffs of all 19 specs the three groups changed); 3, groups f and g (Float Grid as the "no change" spec, XY Grid read in full; closing sections of three families checked against the first-milestone specs; adds-back entries sampled against `53144f3`; the landing-order rule in all four check specs); 4, the closing pass, the shared documents, the README, the map, and the process. Sweepers 1, 2, and 4 were stopped by a spend limit and resumed with their context; sweeper 3 finished after its resume.

Mechanical checks, run by the judge with Node scripts written to files (`audit0011/` in the session scratchpad):

- `links.mjs`, over every Markdown file of the bundle except the captured WebAIM page, resolving each `[text](target)` outside code from its own file and each anchor against the target's headings under GitHub's slug rules: 10,044 links, 751 unresolved from their own file, of which 727 resolve from the bundle root, 18 from `adr/`, and 6 from `issues/`; none unresolved from everywhere (exit 0). These are ticket 181's class 2 numbers exactly. Run on the tree of `466bdde` (extracted with `git archive` to the scratchpad), the same script finds 784 unresolved: 754 from the root, 18 from `adr/`, 6 from `issues/`, and 6 from nowhere (the five `(...)` placeholders and the old ADR 0039 name), which are ticket 181's 749 class 2 plus 30 broken plus 5 placeholders. The script's total before the repair is 10,047 against the ticket's 10,044, a difference of extraction rules in three links; the unresolved sets agree link for link. Control: a scratch bundle with one resolving link, one root-form link, one link to a missing file, one to a missing anchor, and one inside inline code: 4 counted, the root-form link classed `root`, both breaks flagged, exit 1.
- `wave-unresolved.mjs`: of the 751 unresolved links, 10 sit on lines the wave added; each is inside a ticket's quoted proposal or gist line, or a research file's quoted replacement text (tickets 130, 156, 157, 180, 181; group b's report; `research/out-of-scope-triage.md:92`, the quoted map line with ADR 0039's current name). A sample of 13 of the other 741, one in every 60, was read: every one is quoted replacement text or a gist line.
- The word-level diff of `e7ff40f`: outside ticket 181 and the map's gist line, the only changes are 29 link targets losing their `issues/` prefix, one ADR 0039 file name, and backticks around the five placeholders. `git show --numstat` gives one to three lines per file; the CRLF line count of every changed file is the same before and after, apart from ticket 181 and the map, which gained lines.
- `hygiene.mjs` over the wave's 110 files: non-ASCII characters 0, banned words and the banned pair 0, table rows whose cell count differs from the header 0 (code fences skipped). Control: a control text with one extra-cell row, one banned word, and one non-ASCII character (all three found).
- The 11 commit messages (written to files with `git log -1 --format=%B`): `hygiene.mjs` finds nothing; every subject is a lower-case `docs(wayfinder): ...`; every body gives the why (9 to 17 lines); no attribution line. Known and recorded, not re-reported: `40a28fa`'s body says the misuse warnings that read a moved family's class land "no later than" that family; `466bdde`'s body corrects it to "no earlier than", as ticket 180's Answer, the misuse warnings spec, and group g's report say.
- `classrule.mjs`: in the 34 first-milestone specs that write a class of one of the eight later families, every sentence of the form "writes no Foundation class", "no Foundation or library class", "writes none", or "no class is left" with no qualifier within 140 characters (control: an unqualified and a qualified sentence, one hit). Every hit was read in context; those whose claim covers markup, stories, or fixtures that do write such a class are M2.
- Counts, by listing: `issues/` 181 tickets, every one `Status: resolved`; 180 carry `## Answer` (L5); the map's Decisions so far 181 lines, one per ticket by first link, none repeated; `specs/` 57; `research/` 73; `adr/` 46; `audits/` 10 before this file; the 15 specs ticket 180 lists as needing no change have an empty diff over the wave, and the other 42 specs a non-empty one.

This file itself passes the same hygiene script (exit 0), every relative link in it resolves from this folder or, inside quoted replacement text, from its target file, and every ticket link's text equals its ticket's H1.

The judge ran no identity scan of the bundle or the commits; the orchestrator runs it. This file carries no email-shaped token and no host name.

Convention in this file: links inside quoted replacement text are written relative to the target file, ready to paste, so they do not resolve from here; every other link is relative to this file. Every spec change a Fix makes is recorded as one line under `### Amendment, 2026-10-01 (audit 0011)` at the end of the spec's amendment home: the ticket that holds its `### Amendment, 2026-09-30 (consistency review of the later-milestone waves)`, or, for a spec with none, the ticket that holds its `### Amendment, 2026-09-29 (consistency review)`. Each Fix names the homes.

### Candidates dropped

- Sweep 2's A7 (`specs/sticky.md:312` cites section 5 for `nfs-sticky`, which the preview block does not list by name): section 5's comment "one @include nfs-<plugin> per plugin that has a Library mixin" (`storybook-conventions.md:122`) covers it.
- Sweep 3's C2 (the Runtime checks' D4 names seven of the eight families): the Float Classes have no Runtime check request, so the list names every family that has one.
- Sweep 3's C3 (D4's "whichever lands first brings the configuration"): the parenthesis that follows says what the forgotten-import checks spec brings, and the Milestone bullet agrees.
- Sweep 3's C4: withdrawn by the sweep (three wordings of one Responsive Embed bullet, each true).
- Sweep 4's A4-6 (ticket 180's Triage says ticket 181 "stays open"): true on the day, in a record.
- Sweep 4's A4-7 (the map's gist of ticket 173 says "in the first milestone"): a gist records its ticket's answer; the next gist, ticket 174's, moves the family, and the README and building-blocks carry the placement since audit 0010's M3.
- Sweep 4's A4-8 (architecture guide P4 does not name the two `contentChildren` uses): pre-existing and not High; P4 restates building-blocks 1.9, which the guide ranks below, and 1.9 now names both.

Merged: sweep 4's A4-1 and A4-2 and the judge's README read are M1; sweep 1's S1-2, S1-3, S1-4, and S1-6, sweep 2's A1 to A6, and the judge's `classrule.mjs` scan are M2; sweep 4's A4-3 is M3; sweep 1's S1-5 is L1; sweep 1's S1-1 is L2; sweep 3's C1 is L3; sweep 4's A4-4 is L4; sweep 4's A4-5 and the judge's count are L5; L6 is the judge's.

## Summary

| Severity | Count |
| --- | --- |
| High | 0 |
| Medium | 3 |
| Low | 6 |
| Total | 9 |

Severity definitions (as in audit 0009):

- High: a document the next repository would read as written would be misled (every spec and building-blocks are read by the implementer), or it contradicts a user rule or an ADR.
- Medium: a skill or map rule is broken in a way that weakens the bundle, without by itself planting a wrong fact in a spec; a false resolution-log claim and a false index count are rated here, and so is a narrow wrong fact that the reader meets as a contradiction or a visible compile error (audit 0009's M4 and M5).
- Low: hygiene.

The main pattern: the review did what its reports say. Every fix the seven reports claim is present at HEAD (sweeps 1 to 3 checked 100% of groups a to f and about 85% of group g), every amendment home carries its one heading and line, the closing pass applied all 15 rows once, and the link repair changed link targets and nothing else. What went wrong comes from the claims that reach past the sentences the reviewers edited. Ticket 180's recorded point 1 says every class-rule sentence of a first-milestone spec now carries the exception; thirteen broad statements of the rule in nine specs do not, beside markup that writes one of the eight families' classes (M2), and the architecture guide's P3, which ticket 180 says needed no change, states the rule with no exception at all (M3). The link repair resolved its own ticket without the README, which still lists it as open (M1). Every finding is a text edit for the fixers; none needs a ticket. No fix changes a decided API, default, or rule, and this audit adds no OPEN FOR HUMAN item.

The wave meets the map's Destination: every spec exists under `specs/` (57), the 26 early specs were re-run under the class rule, building-blocks agrees with the specs (every closing-pass edit to it checked true, question 4 of sweep 4), the Playwright component test solution and the browser testing stack are recorded, and the consistency review has passed, with M2 and M3 as wording its claims overreach and no High finding against it.

## Findings

### M1. The README still lists the link repair as open, and one open item under building-blocks Part 4

- File: `README.md:3`, `:173`, `:223`, `:226` (ticket 181); `README.md:16` (building-blocks Part 4); `README.md:7` (the Destination paragraph).
- Rule: the README indexes the bundle and its statements are true (audit 0009's Medium definition: a false index claim); ticket 180's Answer, "the 57 specs, building-blocks, the ADRs, the glossary, the architecture guide, `storybook-conventions.md`, and `README.md` agree with each other".
- Evidence: `:3` "`issues/` holds 181 tickets, all resolved but [Task: repair the broken relative links](../issues/181-task-repair-broken-relative-links.md)"; `:173` "Open: [Task: repair the broken relative links](../issues/181-task-repair-broken-relative-links.md), which runs after [Consistency review: the later-milestone waves](../issues/180-consistency-review-later-milestone-waves.md) (the last subsection of the waves below)."; `:226` "open, after the review; it finds the relative links in the bundle that do not resolve and repairs them before the bundle moves to the new repository." Ticket 181 is `Status: resolved` at HEAD, and its Answer's "Files changed" list has no README; `e7ff40f` touched 19 files, the README not among them. `:16`, written before the wave (`64432fc`) and read by the closing pass, says "Part 4 the graduated tickets and the one open item, the Prototyping Utilities' Library mixin (Open list)", while `:173` and `:193` say no item is OPEN FOR HUMAN and building-blocks Part 4 holds none. `:7` names the class-rule wave's review as the one that "passed all 53" and does not name the review that passed all 57. Sweep 4 found `:3`, `:173`, `:226`, and `:16`; the judge found `:7`.
- Fix:
  - `README.md:3`: replace "all resolved but [Task: repair the broken relative links](issues/181-task-repair-broken-relative-links.md); the Open list" with "all resolved; the Open list".
  - `:16`: replace "Part 4 the graduated tickets and the one open item, the Prototyping Utilities' Library mixin (Open list)" with "Part 4 the graduated tickets and the items once OPEN FOR HUMAN, none of which is open (Open list)".
  - `:7`: replace "passed all 53 on 2026-09-29." with "passed all 53 on 2026-09-29, and [Consistency review: the later-milestone waves](issues/180-consistency-review-later-milestone-waves.md) passed all 57 on 2026-09-30."
  - `:173`: replace "Open: [Task: repair the broken relative links](issues/181-task-repair-broken-relative-links.md), which runs after [Consistency review: the later-milestone waves](issues/180-consistency-review-later-milestone-waves.md) (the last subsection of the waves below)." with "Open: none; the last two tickets, [Consistency review: the later-milestone waves](issues/180-consistency-review-later-milestone-waves.md) and [Task: repair the broken relative links](issues/181-task-repair-broken-relative-links.md), are resolved (the last subsection of the waves below)."
  - `:223`: replace "(2 tickets, 180 and 181)" with "(2 tickets, 180 and 181; all resolved)".
  - `:226`: replace "open, after the review; it finds the relative links in the bundle that do not resolve and repairs them before the bundle moves to the new repository." with "resolved 2026-09-30, after the review; of 10,044 relative links, the 30 that did not resolve from their own file now do, so the bundle moves to the new repository with a working trail."
- Handling: fixers (text edits).

### M2. Thirteen broad statements of the class rule in nine first-milestone specs still have no exception; ticket 180's recorded point 1 says every one has

- File: `specs/card.md:15`; `specs/breakpoint-service.md:16`, `:140`, `:298`; `specs/slider.md:3`; `specs/orbit.md:3`; `specs/variant-declaration-tooling.md:9`; `specs/dropdown.md:16`, `:579` (D1); `specs/toggler.md:14`; `specs/tabs.md:3`, `:756`; `specs/responsive-toggle.md:9`; `issues/180-consistency-review-later-milestone-waves.md` (recorded point 1, and the list of specs that needed no change).
- Rule: ticket 180's check 1 and its recorded point 1 ("Every sentence of a first-milestone spec that states the class rule, and building-blocks 1.14's shape rule, reads 'no Foundation or library class of a family with a first-milestone spec' (or names the one class the spec writes)"); decision 3 of [Decide: grids, typography, and utilities move to a later milestone](../issues/174-decide-grids-typography-utilities-later-milestone.md) and [ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)'s note of 2026-09-30; audit 0009's Medium definition (a false resolution claim).
- Evidence: each sentence states the rule over the spec's whole markup, and the same spec writes a class of one of the eight families:
  - `card.md:15` "the developer writes no Foundation class at all", while the Card's recipes write `grid-x`, `cell`, `flex-container`, and `no-bullet` (`:81-85`, `:317`, `:337`); group d reported the Card as needing no change, and ticket 180 lists it so.
  - `breakpoint-service.md:16` "the consumer writes no Foundation class"; `:140` "The spec's own examples, stories, and fixtures write no Foundation or NFS class", while the 1.4.4 fixture writes `.show-for-medium` as a normal class (`:309`, group c's B4) and the last usage example writes `<aside class="show-for-large">` (`:559-562`); `:298` "Those classes are host bindings of the directive that owns them ... the consumer never writes them", while `:31`, after group c's B2, says "the consumer writes none of them, except the visibility classes on its own elements". D24 (`:445`) already has the qualified form.
  - `slider.md:3` "the consumer writes no Foundation or library class.", while its example writes `grid-x grid-margin-x` and `cell small-10` (`:641-648`); `orbit.md:3` "the developer writes no Foundation or library class", while its examples write `show-for-sr` (`:371`, `:387`).
  - `variant-declaration-tooling.md:9` "Under the class rule a consumer writes no Foundation class", a statement of the rule itself with no exception.
  - `dropdown.md:16` "the developer writes no Foundation or library class, not even as an input value" and D1 at `:579` "the consumer writes no Foundation or library class", while the spec writes `show-for-sr` (`:138`) and the XY Grid classes in `dropdown-pane--default` (`:495`); group b narrowed D2 and D3 only.
  - `toggler.md:14` "the developer writes no Foundation or library class, not in markup and not as an input value", while its own mapping row has the consumer write `grid-x grid-margin-x` and `cell small-4` (`:114`).
  - `tabs.md:3` "the directives set every Foundation class, so the consumer writes none" and `:756` "The consumer writes no Foundation class", while the vertical layout writes `grid-x` and `cell medium-3` (`:412-416`, `:638-646`) and has a mapping row since group b's T3.
  - `responsive-toggle.md:9` "the developer writes none of Foundation's classes ... and no library class", while group a qualified the Solution and the mapping for the hamburger name's `show-for-sr`.
  The scoped sentences the scan also returned (a Rendered HTML section's "consumer markup carries no Foundation or library class", a user story about the component's own class, a fixture that writes none) are true and stay. None of the thirteen changes what the implementer builds, and each spec states the exception elsewhere, so a reader meets a contradiction, not a wrong API; the Medium is recorded point 1's claim, as audit 0010 rated M7. Sweep 1 found the Dropdown, Toggler, Tabs, and Responsive Toggle sentences and sweep 2 the other seven; the judge's scan confirmed all thirteen and found no other in the 34 specs.
- Fix:
  - `specs/card.md:15`: replace "the developer writes no Foundation class at all, so" with "the developer writes no Foundation class of a family with a first-milestone spec, so".
  - `specs/breakpoint-service.md:16`: replace "the consumer writes no Foundation class, so the looks" with "the consumer writes no Foundation class of a family with a first-milestone spec, so the looks"; `:140`: replace "write no Foundation or NFS class: its demo components" with "write no Foundation or NFS class of a family with a first-milestone spec (the 1.4.4 fixture's `.show-for-medium` and the last usage example's `.show-for-large` are Visibility classes written as normal classes): its demo components"; `:298`: replace "the consumer never writes them," with "the consumer writes none of them except the Visibility classes on its own elements, which it writes as normal classes (a family with no first-milestone spec),".
  - `specs/slider.md:3`: replace "the consumer writes no Foundation or library class." with "the consumer writes no Foundation or library class of a family with a first-milestone spec.".
  - `specs/orbit.md:3`: replace "the developer writes no Foundation or library class; the wrapper" with "the developer writes no Foundation or library class of a family with a first-milestone spec; the wrapper".
  - `specs/variant-declaration-tooling.md:9`: replace "a consumer writes no Foundation class;" with "a consumer writes no Foundation class of a family with a first-milestone spec;".
  - `specs/dropdown.md:16`: replace "the developer writes no Foundation or library class, not even as an input value" with "the developer writes no Foundation or library class of a family with a first-milestone spec, not even as an input value"; `:579` (D1): replace "the consumer writes no Foundation or library class (revised 2026-09-28, class rule)" with "the consumer writes no Foundation or library class of a family with a first-milestone spec (revised 2026-09-28, class rule)".
  - `specs/toggler.md:14`: replace "the developer writes no Foundation or library class, not in markup" with "the developer writes no Foundation or library class of a family with a first-milestone spec, not in markup".
  - `specs/tabs.md:3`: replace "the directives set every Foundation class, so the consumer writes none" with "the directives set every Foundation class of a family with a first-milestone spec, so the consumer writes none of those"; `:756`: replace "The consumer writes no Foundation class and no `data-tabs`" with "The consumer writes no Foundation class of a family with a first-milestone spec and no `data-tabs`".
  - `specs/responsive-toggle.md:9`: replace "the developer writes none of Foundation's classes, not `.title-bar`" with "the developer writes none of the Foundation classes of a family with a first-milestone spec, not `.title-bar`".
  - `issues/180-consistency-review-later-milestone-waves.md`, after recorded point 6: add "Correction (2026-10-01, audit 0011): recorded point 1 held for the sentences the groups edited; audit 0011's M2 qualified thirteen more in nine specs, and the Card, listed above as needing no change, is one of them. Audit 0011's M3 adds the exception to the architecture guide's P3, which the shared-documents paragraph says needed no change."
  - Amendments in [Spec: Card](../issues/90-spec-card.md), [Re-run: Breakpoint service (shared utility) spec under the class rule](../issues/129-rerun-breakpoint-service-class-rule.md), [Re-run: Slider spec under the class rule](../issues/124-rerun-slider-class-rule.md), [Re-run: Orbit spec under the class rule](../issues/125-rerun-orbit-class-rule.md), [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md), [Re-run: Dropdown spec under the class rule](../issues/118-rerun-dropdown-class-rule.md), [Re-run: Toggler spec under the class rule](../issues/109-rerun-toggler-class-rule.md), [Re-run: Tabs spec under the class rule](../issues/108-rerun-tabs-class-rule.md), and [Re-run: Responsive Toggle spec under the class rule](../issues/116-rerun-responsive-toggle-class-rule.md).
- Triage: impact LOW (the qualifier the ruling already gives, in sentences whose specs state the exception elsewhere; no directive, input, or default changes), confidence HIGH (each sentence's own spec writes the class). Decided.
- Handling: fixers (text edits).

### M3. The architecture guide's P3 states the class rule with no exception, and ticket 180 says no guide line needed a change

- File: `architecture-guide.md:76-78` (P3); `issues/180-consistency-review-later-milestone-waves.md` ("Shared documents changed by the closing pass": "No ADR and no line of the architecture guide needed a change").
- Rule: ticket 180's check 4 and its Question (the guide agrees with the class rule and the Later-milestone families ruling); the map's Architecture guide note ("where it restates a record it cites it"; "a conflict is settled by the record, never by the guide"); ADR 0039's note of 2026-09-30; audit 0009's Medium definition (a false resolution claim).
- Evidence: P3 is headed "The consumer writes no Foundation or library class, not even as a value", and its Rule says "no Foundation or `nfs-` class appears in consumer code". `rg "normal class" architecture-guide.md` returns nothing, and no line of the guide names the exception, while ADR 0039's note, building-blocks 1.14 item 2 (edited by the closing pass), and every first-milestone spec now write the eight families' classes as normal classes. The guide ranks below the records, so the record wins, but the review claimed the guide agrees, and the spec audit the guide was written for (map, Architecture guide) would read P3 as broken by every spec that writes `show-for-sr`. The guide carries dated lines for the checks ruling (`:326`), the form a fix takes. Sweep 4 found it.
- Fix: `architecture-guide.md`, after P3's Rule paragraph (`:78`), add the paragraph "2026-09-30: in the first milestone the Foundation classes of a family with no first-milestone spec (the XY, Float, and Flex Grids, Typography Helpers, Prototyping Utilities, Flexbox Utilities, Visibility Classes, and Float Classes) are normal classes the consumer and the library's stories write, with Foundation's global styles loaded; the rule holds for every family with a first-milestone spec ([ADR 0039](adr/0039-directives-manage-every-foundation-class.md), note of 2026-09-30; [Decide: grids, typography, and utilities move to a later milestone](issues/174-decide-grids-typography-utilities-later-milestone.md), decision 3)." Ticket 180's correction line is in M2's Fix.
- Handling: fixers (text edit).

### L1. The Tooltip and the Dropdown still call building-blocks 1.6 rule 1's measurement "the Toggler spec's refinement"

- File: `specs/tooltip.md:423`, `:574` (D19); `specs/dropdown.md:459`.
- Rule: ticket 180's check 4; group b's changes A1 (Accordion) and G2 (Toggler), which made the same sentence read that building-blocks 1.6 rule 1 measures, as it does since 2026-09-28.
- Evidence: `tooltip.md:423` "the Toggler spec's refinement of building-blocks 1.6 rule 1: the duration is set by the consumer's `nfs-motion($duration)`"; D19 "The Toggler spec's refinement: the duration is the consumer's `nfs-motion($duration)`"; `dropdown.md:459` "This is the Toggler spec's measured refinement of building-blocks 1.6 rule 1". Group b reported the Tooltip as needing no change. Sweep 1 found them.
- Fix: `specs/tooltip.md:423`: replace "the Toggler spec's refinement of building-blocks 1.6 rule 1:" with "as building-blocks 1.6 rule 1 (since 2026-09-28) and the Toggler spec measure:"; `:574`: replace "The Toggler spec's refinement:" with "Building-blocks 1.6 rule 1 (since 2026-09-28), as the Toggler spec measures:"; `specs/dropdown.md:459`: replace "This is the Toggler spec's measured refinement of building-blocks 1.6 rule 1:" with "This measures, as building-blocks 1.6 rule 1 (since 2026-09-28) and the Toggler spec do:". Amendments in [Re-run: Tooltip spec under the class rule](../issues/119-rerun-tooltip-class-rule.md) and [Re-run: Dropdown spec under the class rule](../issues/118-rerun-dropdown-class-rule.md).
- Handling: fixers (text edits).

### L2. The Responsive Menu cites two spec tickets' decision numbers as the specs' decisions

- File: `specs/responsive-menu.md:169`; `research/consistency-review-later-waves-group-a.md:115`.
- Rule: ticket 180's check 3 (a name or decision taken from another spec matches the owning spec as it stands).
- Evidence: "`closeOnClick` is exposed by two host directives under the same name, so one binding sets both, each keeping its own default when unbound (Dropdown Menu spec decision 13; Drilldown Menu spec decision 18)". The Dropdown Menu spec's D13 is `$dropdownmenu-min-width` and its D5 is the shared `closeOnClick` ("default `true` here and `false` on Drilldown, one binding reaching both under ResponsiveMenu"); the Drilldown Menu spec's D18 is the inset focus ring, and its `closeOnClick` rows are D12 and D27. Group a's report passed the citation as "ticket decisions 13 and 18 of those spec tickets", which is what it means (`issues/21-spec-dropdown-menu.md:119`, "(decision 13)"), not what it says. Sweep 1 found it.
- Fix: `specs/responsive-menu.md:169`: replace "(Dropdown Menu spec decision 13; Drilldown Menu spec decision 18)" with "(the Dropdown Menu spec's D5; the Drilldown Menu spec's D12 and D27)". Amendment in [Re-run: Responsive Menu spec under the class rule](../issues/115-rerun-responsive-menu-class-rule.md).
- Handling: fixers (text edit).

### L3. The misuse warnings' Flex Grid 1 and XY Grid 1 do not say locally that their Flexbox Utilities clause waits for that family

- File: `specs/misuse-warnings.md:398` (Flex Grid 1), `:796` (XY Grid 1).
- Rule: ticket 180's recorded point 2 (landing order), stated in the same form where a check reads another moved family's class: Button Group 5 (`:338`) and Media Object 1 (`:477`) each end "lands with the later-milestone Flexbox Utilities spec or after it; until then ... the check is silent for it (S1)".
- Evidence: both items say "The Flexbox Utilities' classes that Foundation's ... examples carry ... are reported the same way, naming `nfsFlexAlign` or `nfsFlexChild` and the input to bind", with no such sentence; S1's Not reported paragraph (`:170`) covers them for the reader who reads S1. No sentence says the opposite. Sweep 3 found it.
- Fix: `:398` and `:796`: after "naming `nfsFlexAlign` or `nfsFlexChild` and the input to bind" and before the sentence's full stop (at `:796`, after "as the Button Group reports them"), add "; that clause lands with the later-milestone Flexbox Utilities spec or after it, and until then those are normal classes and the check is silent for them (S1)". Amendment in [Spec: misuse warnings (later milestone)](../issues/161-spec-misuse-warnings-later-milestone.md).
- Handling: fixers (text edits).

### L4. The Progress Bar's closing-pass amendment line says the Slider's rule 13 does not paint the thumb

- File: `issues/95-spec-progress-bar.md`, the last line (under `### Amendment, 2026-09-30 (consistency review of the later-milestone waves, closing pass)`).
- Rule: an amendment line states the change truly.
- Evidence: "D16's rejected alternative says the Slider's rule 13 paints its fill and track (a `Highlight` fill, a `CanvasText` track outline), not its thumb, as that rule reads." Rule 13 does paint the thumbs ("thumbs `background: CanvasText`", `specs/slider.md:690`); what it does not do is paint them the way D16's alternative paints the meter. The spec edit itself ("as the Slider's rule 13 does for its fill and track") and group c's P4 are true. Sweep 4 found it.
- Fix: replace "(a `Highlight` fill, a `CanvasText` track outline), not its thumb, as that rule reads." with "(a `Highlight` fill, a `CanvasText` track outline), the two parts a meter has, as that rule reads.".
- Handling: fixers (text edit).

### L5. Ticket 174 has no `## Answer` heading

- File: `issues/174-decide-grids-typography-utilities-later-milestone.md` (headings: Question, User ruling, Decision, The wave, Triage, Gist for Decisions so far).
- Rule: `docs/agents/issue-tracker.md`, Wayfinding operations, Resolve: "append the answer under an `## Answer` heading, set `Status: resolved`, then append a context pointer"; the brief's check that every resolved ticket has an Answer.
- Evidence: 180 of the 181 tickets carry `## Answer`; this one records its answer under `## Decision`. It predates the wave (last changed in `d5a1eee`), and ticket 173, the other user-ruling ticket of the day, has both a `## Decision` and an `## Answer`. No link in the bundle points at an anchor of ticket 174. Found by the judge's count and by sweep 4.
- Fix: in `issues/174-decide-grids-typography-utilities-later-milestone.md`, insert before `## Decision` the lines "## Answer" and "The user's ruling above, as the decision, the wave, and the triage below record it." (with a blank line between and after), and demote `## Decision`, `## The wave`, and `## Triage` to `###`.
- Handling: fixers (text edit).

### L6. README statements that this audit makes false when it lands

- File: `README.md:24`; `README.md:223` (the heading M1 edits).
- Rule: the README indexes the bundle and its statements are true (audit 0009, L1; audit 0010, L5).
- Evidence: "ten compliance audits (research wave, building blocks, prototypes and first specs, second spec wave, final bundle, open-decision pass, the fixes of audit 0006, the class-rule wave, the later-milestone checks wave, and the later-milestone families wave)" is true at HEAD and false once this file lands, and the section for tickets 180 and 181 names no audit.
- Fix, when this file lands: `README.md:24`, replace "ten compliance audits (" with "eleven compliance audits (" and "the later-milestone checks wave, and the later-milestone families wave)" with "the later-milestone checks wave, the later-milestone families wave, and the final wave)"; `:223`, after M1's edit, replace "(2 tickets, 180 and 181; all resolved)" with "(2 tickets, 180 and 181; all resolved; audited by [Audit 0011: the final wave](audits/0011-final-wave.md))".
- Handling: fixers (text edits).

## Verified OK

The review's claims:

1. Every fix the seven group reports claim is present at HEAD: groups a and b, all 36 edits (sweep 1); groups c, d, and e, all 29 (sweep 2); group f, all 12, and group g, about 85% of its edits read in the word diffs (sweep 3). Each touched spec's amendment home ends with exactly one `### Amendment, 2026-09-30 (consistency review of the later-milestone waves)` heading carrying its line (16 homes for groups a and b, 14 for c to e, 12 for f and g, the four check specs in tickets 160 to 163 and the forgotten-import checks in ticket 150).
2. The 15 specs ticket 180 lists as needing no change have an empty diff over the wave. Read in full under the seven checks: Dropdown Menu and Tooltip (sweep 1; Tooltip apart from L1), Equalizer, Card, and Responsive Embed (sweep 2; the Card apart from M2), Float Grid (sweep 3).
3. The cross-spec edits hold against their owners: the Breakpoint service's query types against `specs/tooltip.md`, `specs/sticky.md`, and `specs/equalizer.md`, and building-blocks 1.3; the Orbit's bound `[value]` on `button[nfsOrbitBullet]`; the Table's four greys against its D17, the Callout's D17, and the Card's D14; the `exportAs` values in the Nested menu's and Smooth Scroll's sketches; the Drilldown's rule 7 `[13]` against the Nested menu's rule 13; Drilldown usage 7 and D28 against its mapping row (sweeps 1 to 3).
4. The closing pass's 15 rows are applied once each, with one line under `### Amendment, 2026-09-30 (consistency review of the later-milestone waves, closing pass)` in tickets 95, 99, 114, 143, and 146; every shared-document edit is true against the spec, ADR, or ruling it cites (building-blocks 1.3, 1.7, 1.9, 1.10, and 1.14; the glossary's Utility class and Variant registry; the Storybook preview, where `foundation-range-input`, `foundation-progress-element`, and `foundation-meter-element` exist in Foundation 6.9 outside `foundation-everything`, and the commented `nfs-xy-grid` line has the form of the other later-milestone lines and matches the XY Grid's Testing Decisions) (sweep 4).
5. The two records' dated notes are present and their text is otherwise unchanged: manifest a's Abide row is 1.4.1 at `53144f3` (`specs/abide.md:351`), and ticket 162's decision 6 is superseded in part; the group f report's dated correction is present (sweep 4).
6. The landing-order rule reads "no earlier than" in the misuse warnings (S1, Button Group 5, Media Object 1, layer 1), the Runtime checks (Milestone bullet, Rendered output, Out of Scope, D4), the family checks, and the build-time checks, and no sentence says the opposite (sweep 3); L3 is a local omission.
7. Group f's closing sections: the XY Grid, Typography Helpers, and Visibility Classes lists name every first-milestone spec that writes the family's classes, and each entry matches that spec (sweep 3). Group g's adds-back entries: seven misuse warnings, seven build-time, and five family-check entries sampled against `53144f3` name a sentence, story, row, or decision that named a check then (sweep 3).

The link repair:

8. Ticket 181's class counts hold link for link against the judge's script, before and after the repair; the 30 repaired links resolve from their own files; the five placeholders are code text; the repair changed nothing but link targets and the placeholders' backticks, and kept each file's line endings (Method).

Truth against the records and the process:

9. The map's `c737cc3` pointer is true against ticket 173, ticket 174, and ADR 0012's notes; Decisions so far has 181 lines, one per ticket, and the lines of tickets 180 and 181 equal their tickets' gists; Not yet specified still holds ("Nothing at the moment"); Out of scope's base-styles line names the Callout's D17, the Card's D14, and the Table's D17, as the specs do (sweep 4 and the judge).
10. The README's counts hold at HEAD: 181 tickets, 57 specs (44 first-milestone, eight later-milestone families, five later-milestone checks), 73 research files (the list adds to 73), 46 ADRs (44 accepted, two superseded), 10 audits, 26 prototype folders plus the five evidence captures; its 572 links resolve (sweep 4 and the judge). M1 names the statements that do not hold.
11. Every ticket is `Status: resolved`; tickets 180's and 181's `Blocked by` tickets are resolved; every OPEN FOR HUMAN mention in tickets 180 and 181 and the group reports records that nothing is open.

Hygiene:

12. No non-ASCII character, no banned word, no banned pair, and no table row with the wrong cell count in the wave's 110 files; no unresolved relative link outside quoted replacement text and gist lines in the whole bundle; the 11 commit messages are lower-case `docs(wayfinder): ...` subjects with bodies that give the why and no attribution line, and the one wrong phrase in `40a28fa` is corrected in `466bdde`'s body.

## Resolution log

Every finding was fixed as its Fix states, by one Opus 5.5 fixer at low effort, in commit `9e1c8d6`; none became a ticket, none was rejected, and none adds an OPEN FOR HUMAN item. Its apply script required each quoted text to match exactly once before it wrote any file, and its check script verified the edits over 29 files, with a positive control. Where a Fix corrects a claim in a resolved ticket, the claim stays as written and a dated note, `Note, 2026-10-01 (audit 0011): ...`, follows it, in place of the Fix's in-place rewrite or its "Correction" label.

| Finding | Where |
| --- | --- |
| M1 | `README.md` (the link repair shown resolved at three places; the open item under building-blocks Part 4 marked as ruled) |
| M2 | thirteen statements in `specs/card.md`, `specs/breakpoint-service.md` (three), `specs/slider.md`, `specs/orbit.md`, `specs/variant-declaration-tooling.md`, `specs/dropdown.md` (two), `specs/toggler.md`, `specs/tabs.md` (two), `specs/responsive-toggle.md`; a dated note after recorded point 6 of [Consistency review: the later-milestone waves](../issues/180-consistency-review-later-milestone-waves.md); amendments in the nine specs' amendment homes |
| M3 | `architecture-guide.md` (a dated paragraph after P3's Rule); a dated note after the closing pass's shared-documents paragraph in [Consistency review: the later-milestone waves](../issues/180-consistency-review-later-milestone-waves.md) |
| L1 | `specs/tooltip.md` (two places), `specs/dropdown.md`; amendments in their amendment homes |
| L2 | `specs/responsive-menu.md`; amendment in its amendment home |
| L3 | `specs/misuse-warnings.md` (Flex Grid 1, XY Grid 1); amendment in [Spec: misuse warnings (later milestone)](../issues/161-spec-misuse-warnings-later-milestone.md) |
| L4 | a dated note after the Progress Bar's closing-pass amendment line, in [Spec: Progress Bar](../issues/95-spec-progress-bar.md) |
| L5 | [Decide: grids, typography, and utilities move to a later milestone](../issues/174-decide-grids-typography-utilities-later-milestone.md) gains its `## Answer` heading; its Decision, The wave, and Triage headings move one level down |
| L6 | `README.md` (eleven audits; the final wave in the audit list; the later-waves section heading names this audit) |

The Card's and the Tooltip's amendment homes hold no 2026-09-30 consistency-review heading, because neither spec changed in that review; the fixer used the tickets this audit's Fixes point to (Spec: Card, and the Tooltip's class-rule re-run, the L1 fallback).
