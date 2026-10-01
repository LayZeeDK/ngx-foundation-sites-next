# 13. Decide: how component styles load and unload

Type: grilling
Status: open
Blocked by: 04, 06, 08
Labels: wayfinder:grilling
Map: ../map.md

## Question

How does each component's CSS reach the page? The options are Yeti's single stylesheet, loaded globally, or per-component files loaded and unloaded with the directives. If per component, by which mechanism? And what is the loading unit, and what does the consumer write?

## How to work it

AFK grilling against [Research: Yeti's styling model, and loading component styles lazily](04-research-yeti-styles-and-lazy-loading.md), and the old map's measured evidence (its tickets 182 to 198), whether this requirement carries over ([Decide: which standing preferences and user rulings carry over](07-decide-inherited-preferences-and-rulings.md)), and the browser target ([Decide: the browser target](06-decide-browser-target.md)). Record an ADR. Settle the loading unit's name with [Decide: the glossary](10-decide-glossary.md).
