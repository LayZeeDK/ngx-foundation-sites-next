# 12. Decide: which Yeti version the specs target, and how the package tracks it

Type: grilling
Status: open
Blocked by: 05
Labels: wayfinder:grilling
Map: ../map.md

## Question

Which Yeti version do the specs target? The options are a commit of `develop`, `7.0.0-beta`, or `7.0.0` once released. Yeti is unpublished on npm today, so how does the package depend on it: a peer dependency, a pinned version, or vendored? And how do the specs handle what the stability guide leaves unfrozen? That is private `--_yeti-*` tokens, default token values, generated files, and browser minimums.

## How to work it

AFK grilling against [Task: carry the old map's Yeti findings into this bundle](05-task-carry-yeti-findings-from-old-map.md), Yeti's `src/guides/stability.md` and `bin/frozen.js`, its release history, and the announcement (foundation/yeti#15554, read only). Record an ADR. The specs may name only frozen surface, unless this decision says otherwise.
