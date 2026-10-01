# 14. Research: Foundation's `llms.txt` and `llms-full.txt` as sources for this map

Type: research
Status: claimed
Blocked by:
Labels: wayfinder:research
Map: ../map.md

## Question

What do https://www.foundationcss.com/llms.txt and https://www.foundationcss.com/llms-full.txt contain? How do they relate to the repository's generated `docs/llms.txt` and `docs/llms-full.txt`, the manifest, the token catalogue, and the MCP server the README mentions ("the docs, type hints, and an MCP server are generated from it")? And how can this map use them?

## User instruction, 2026-10-01

> 19. Use subagents to read https://www.foundationcss.com/llms.txt and https://www.foundationcss.com/llms-full.txt and consider how they can be used for the new map.

## How to work it

Use a `/research` subagent. Fetch both URLs with the fallback chain; `llms-full.txt` may be large, so save it to `D:/tmp` and read it in parts. Then cover:

1. Their structure and coverage: Yeti only, or Foundation for Sites 6 too; which pages they include; their size; and what they say about versions and dates.
2. How they differ from `d:/projects/github/foundation/yeti/docs/llms.txt` and `llms-full.txt` at `f52d1e8b9`, measured by a diff; and which file the generator (`bin/`) writes them from.
3. The MCP server: where it lives, what tools it offers, whether it can run locally, and what it would give the agents of this map.
4. Concrete uses for this map, each with what it would save or risk. For example: a source for the inventory ticket, a context file for spec agents, a check that a spec names only documented attributes, or a frozen-surface check with `bin/frozen.js`. Include the risk that these files lag the `develop` branch.

Write `research/foundationcss-llms-txt.md`, and append an `## Answer`. Decide nothing; recommend how other tickets should use the files, and name the tickets.
