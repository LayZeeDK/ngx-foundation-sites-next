# 31. Research: Yeti's removed planning documents and its stated roadmap

Type: research
Status: claimed
Blocked by: none
Labels: wayfinder:research
Map: ../map.md

## Question

Yeti's announcement (foundation/yeti#15554) says: "The architecture and every phase spec live in this repository under `docs/superpowers/`. Progress is tracked in milestones." The orchestrator checked on 2026-10-03:

- At the pin `f52d1e8b9`, `.gitignore` lists `docs/superpowers/` and `.superpowers/`.
- Commit `fa61d90d2` (2026-09-12, "chore: keep planning documents out of the repository") deleted five files under `docs/superpowers/`, 3,400 lines in all. They are an architecture design spec, a phase 0 plan and its design, and two research notes.
- `develop` on GitHub has no `docs/superpowers/`.
- The repository has no open milestones. Its 30-plus milestones are all closed Foundation 6 ones, last updated in 2021.

The announcement therefore points at documents that are gone from the tree and at milestones that do not exist. What did the removed documents say about Yeti's architecture, its phases, and its intended future? In particular: which phases come after phase 0, what is planned for the JavaScript modules, the manifest, the tokens, the frozen surface, and the beta and npm release? Does any of it contradict or sharpen what this map has decided (ADRs 0001-0006, 0040, 0060, 0070, and the spec list)? Are the planning documents published anywhere else, for example in Discussions, the docs site, or a later commit or branch?

## User instruction, 2026-10-03

The user's own message, verbatim:

> 53. Did you investigate the foundation/yeti repo's current/future state based on this, both `docs/superpowers/` and milestones? I do not see any milestones at https://github.com/foundation/yeti/ milestones or any https://github.com/foundation/yeti/tree/develop/docs/superpowers though.

## How to work it

Use a `/research` subagent. Read the deleted files from history in the read-only clone at `D:/projects/github/foundation/yeti` with `git show fa61d90d2^:<path>`. Do not check out, fetch, or modify the clone. Read the announcement and the repository's Discussions through `gh api`, read-only. Write `research/yeti-planning-documents.md`, with findings tagged read (with commit and path) or inferred, and append an `## Answer`. Decide nothing.
