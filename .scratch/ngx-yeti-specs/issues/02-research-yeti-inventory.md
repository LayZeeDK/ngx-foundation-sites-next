# 02. Research: inventory of Yeti's components, layouts, recipes, utilities, and contract

Type: research
Status: claimed
Blocked by:
Labels: wayfinder:research
Map: ../map.md

## Question

What exactly does Yeti offer, and what is its contract? List every component, layout, recipe, and utility; every class, attribute and value list, marker, public `--yeti-*` token, theme, and event; and every docs page. Mark which parts the stability guide freezes at `7.0.0-beta`. The manifest and the token catalogue are the source.

## How to work it

Use a `/research` subagent against `d:/projects/github/foundation/yeti` at `develop` (`f52d1e8b9`). Use the built manifest and token catalogue (run the repository's own `npm run build` in a copy under `D:/tmp`, never in the clone), `src/`, `docs/`, and `src/guides/stability.md`, citing `file:line` throughout.

Produce one row per item with:

- its name and kind;
- its docs page;
- its classes, attributes, markers, tokens, and events;
- the HTML elements it expects;
- whether it has a JavaScript module;
- its frozen status.

Check the row count against the manifest's own count (the stability guide says "The forty-nine names in the manifest"). Also read https://www.foundationcss.com/yeti/guides/migrating/ and map each Foundation for Sites 6.9 component, layout system, and utility family that `.scratch/next-foundation-specs/` specified to its Yeti counterpart, if any.

Write `research/yeti-inventory.md`, and append an `## Answer`. Decide nothing.
