# 159. Task: extract the checks from the specs

Type: task
Status: open
Blocked by: 158
Labels: wayfinder:task
Map: ../map.md

## Question

The ruling [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md) moves five kinds of check out of the first milestone: forgotten-import checks, family checks, misuse warnings, Runtime checks, and build-time checks (the Library mixins' `@error` and `@warn` checks and the Variant declaration tooling's check mode). Before the deferred specs are written and the other specs are rewritten, where is every check, and what exactly does each say?

## How to work it

AFK, seven Sonnet 5 sweeps, read only except their manifests: one per spec group of [Re-run: specs without checks, group a](165-rerun-specs-without-checks-group-a.md) to [group f](170-rerun-specs-without-checks-group-f.md) (group c also covers `specs/forgotten-import-checks.md`), and one over the shared documents (`building-blocks.md`, `architecture-guide.md`, `CONTEXT.md`, `storybook-conventions.md`, and ADRs 0012, 0039, 0040, 0044, and 0046). Each reads its files as committed at this ticket's parent commit and writes `research/checks-extraction-<group>.md`: per file, every check, each with its kind (by the ruling's classification rule, exactly one kind), its location (section and line), its text verbatim, the tests and stories that exercise it, the Sass or TypeScript it needs, and the rule it enforces written as one documented-usage sentence the rewritten spec can state (or "none", where the check enforces nothing a consumer must do). The ticket resolves when the seven manifests are committed.
