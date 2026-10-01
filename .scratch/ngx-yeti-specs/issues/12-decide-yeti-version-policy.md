# 12. Decide: which Yeti version the specs target, and how the package tracks it

Type: grilling
Status: open
Blocked by: 05, 21, 22
Labels: wayfinder:grilling
Map: ../map.md

## Question

Which Yeti version do the specs target? The options are a commit of `develop`, `7.0.0-beta`, or `7.0.0` once released. Yeti is unpublished on npm today, so how does the package depend on it: a peer dependency, a pinned version, or vendored? And how do the specs handle what the stability guide leaves unfrozen? That is private `--_yeti-*` tokens, default token values, generated files, and browser minimums.

Moved here on 2026-10-01 from [Decide: whether Yeti's licence and readiness allow this package](15-decide-yeti-licence-and-readiness.md), whose licence half the user decided. The question is whether Yeti's release state allows specs to be written against it now. The announcement (foundation/yeti#15554) says "The `develop` branch is now Yeti 7 and is unstable until the beta. Do not build on it yet." The README says `7.0.0-beta`, `package.json` says `7.0.0-alpha.0`, no tag exists, and nothing is on npm. Under the triage rule this is HIGH impact; if confidence is not HIGH, it stays `OPEN FOR HUMAN`.

## User ruling, 2026-10-01

The user settled readiness, verbatim:

> Readiness: We will spec and build against a specific commit of `foundation/yeti`'s `develop` branch.

Orchestrator's reading: the specs target, and the package builds against, one pinned commit of `develop`, not a tag, a beta, or an npm release. This ticket still decides:

1. Which commit to pin first. The candidate is `f52d1e8b9` (2026-09-25), the clone's commit, which every research ticket reads.
2. When and how the pin moves: what triggers a move, whether `bin/frozen.js` gates it, and how the specs record the commit they target.
3. How the package depends on an unpublished Yeti: a git dependency at the commit, vendored built files, or a build step. [ADR 0001](../adr/0001-yeti-licence-compatible-with-mit-package.md) applies: Yeti's files keep Yeti's licence and notice.
4. How the specs treat what the stability guide leaves unfrozen.

## How to work it

AFK grilling against [Task: carry the old map's Yeti findings into this bundle](05-task-carry-yeti-findings-from-old-map.md), Yeti's `src/guides/stability.md` and `bin/frozen.js`, its release history, and the announcement (foundation/yeti#15554, read only). Record an ADR. Whether the specs may name only frozen surface is open (point 4); the user's readiness ruling does not say. Also an input: the MCP server Yeti's README mentions does not exist anywhere ([Research: Foundation's `llms.txt` and `llms-full.txt` as sources for this map](14-research-foundationcss-llms-txt.md)).

Note, 2026-10-01 (audit 0002, M6): also read [Prototype: Yeti as a dependency from GitHub at a pinned commit](21-prototype-yeti-as-github-dependency.md) and [Prototype: building, consuming, and theming Yeti from a pinned commit with Nx](22-prototype-building-and-consuming-yeti-with-nx.md); point 3 is what they measured.
