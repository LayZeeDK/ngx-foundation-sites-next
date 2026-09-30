# 171. Task: shared documents for the later-milestone checks

Type: task
Status: open
Blocked by: 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170
Labels: wayfinder:task
Map: ../map.md

## Question

After the deferred specs exist and the other specs are rewritten, what must the shared documents say?

## How to work it

AFK, Sonnet 5 fixer. Apply the proposals of tickets 160 to 170 and the ruling [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md): building-blocks (1.9's development warnings, every rule and row that relies on a check, Part 3's utilities), the architecture guide (every principle that states a check), the glossary (each check term marked as a later-milestone term), `storybook-conventions.md`, dated notes on ADRs 0012, 0040, 0044, and 0046 and on T9 of [Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md), the README (a later-milestone section listing the five deferred specs, and every count), and the map's gists. Then the wave audit follows (map, Audits).

## Inputs gathered by the orchestrator (2026-09-30)

The proposals to apply are the quoted shared-document changes in the Answers of tickets 160 to 170; where two conflict, the later ticket's Answer says which it replaces (ticket 162 replaces group a's items 9 and 10). Beside them:

1. `specs/variant-declaration-tooling.md` still names `$flexbox-responsive-breakpoints` (near line 128), a property the group b re-run removed.
2. The map's Out of scope line on base element styles still says `nfs-typography-base` checks those colours; that mixin left the first milestone.
3. ADRs outside the shared sweep's files also state checks and need a dated note each: 0004, 0005, 0011, 0013, 0019, 0022, 0028, 0034, 0037, 0038, 0039, 0042, 0043, beside 0012, 0040, 0044, and 0046.
4. [Task: extract the checks from the specs](159-task-extract-checks-from-specs.md) counted 25 Runtime and 190 misuse checks in the component specs; the Runtime checks spec counts 24 (group d's count table holds 5 entries, not 6). Correct the figure where the README or map repeats it.
5. The README's wave section, spec count (57 with the four new specs), and every ticket status in it; the map's gists for 160 to 170 are already in.
6. Boundary questions for the wave audit, not for this task: the "stands alone" report (M5) described in both the forgotten-import and family checks specs; the fourteen family-reading checks kept in the misuse warnings spec; the contrast pairs (Slider, Reveal, Table) that lost their only automated test.
