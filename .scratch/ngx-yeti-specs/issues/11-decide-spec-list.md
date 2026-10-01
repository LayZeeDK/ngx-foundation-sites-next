# 11. Decide: the spec list

Type: grilling
Status: claimed
Blocked by: 02, 03, 07
Labels: wayfinder:grilling
Map: ../map.md

## Question

Which Yeti components, layouts, recipes, and utilities get a spec, and at what granularity: one per docs page, as the old map ruled, or another unit? For each, is it directives, a component, or nothing beyond documented usage? And which shared-utility specs does the package need?

## User instruction, 2026-10-01

The user's own message to the orchestrator, verbatim:

> Use the LLMs files, docs sitemap, and clone file/folder layout/structure to inform the number and names of specs the destination contains.

The three sources, as the orchestrator found them on 2026-10-01:

- **The LLMs files:** https://www.foundationcss.com/yeti/llms.txt and https://www.foundationcss.com/yeti/llms-full.txt, which the user confirmed are the intended files ("Oh, so the yeti/llms.txt and yeti/llms-full.txt URLs were what I intended.", 2026-10-01). They are identical to `docs/llms*.txt` at `f52d1e8b9` and list the manifest's 49 items.
- **The docs sitemap:** https://www.foundationcss.com/sitemap.xml, the one `robots.txt` names; `/yeti/sitemap.xml` returns 404. It holds 72 `/yeti/` URLs, including guides.
- **The clone's layout:** `d:/projects/github/foundation/yeti`.
  - `docs/` has 50 top-level `.md` pages.
  - `src/` has `components/`, `layouts/`, `recipes/`, `utilities/`, `base/`, `tokens/`, `themes/`, `guides/`, and `starter/`.
  - `src/` holds the 10 `.js` modules (`dist/js/` exists only after a build).

The counts differ (49 items, 50 docs pages, 72 sitemap URLs), so the decision reconciles them. Its Answer gives one table: each candidate spec, its name in each of the three sources, whether each source lists it, the reason for including it or leaving it out, and the final count and names. A spec's name follows Yeti's own name for the item, as the old map's naming rule did for Foundation.

## How to work it

AFK grilling against [Research: inventory of Yeti's components, layouts, recipes, utilities, and contract](02-research-yeti-inventory.md), [Research: Yeti's JavaScript modules and what Angular adds](03-research-yeti-javascript-and-angular.md), and [Decide: which standing preferences and user rulings carry over](07-decide-inherited-preferences-and-rulings.md). Record the list in this ticket's Answer, and add the Destination's count to the map. Each entry gets one line: the item, its kind, its docs page, its Angular shape, and why. The spec tickets graduate from this list.
