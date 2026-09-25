# 36. Consistency review and bundle index

Type: task
Status: open
Blocked by: 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 37, 41
Labels: wayfinder:task
Map: ../map.md

## Question

Do the 22 specs (21 plugins plus Button), the building-blocks map, the glossary, and the ADRs agree with one another, and is the bundle ready to hand to the new repo?

Check: every plugin and Button has a spec at `specs/<slug>.md`; naming, input and output conventions, and the implementation level in each spec match `building-blocks.md` (update the map where a spec made a better-argued choice, and say so); every spec's Testing Decisions names the layers and commands the browser testing stack decision (ticket 41) fixed, rewriting the stack-agnostic "browser-level test" placeholder into the decided stack; every spec states its rendering-mode behaviour (ticket 38) and its animation approach per the map's rules; glossary terms are used consistently; no spec contradicts an ADR without an updated ADR; every `OPEN FOR HUMAN` and `Prototype needed` note is collected into a single list. Write `README.md` in the effort directory as the index: destination, how to read the bundle, the plugin table with links to spec and research, the open list.

Do not write new specs here. Record what was changed and the open list in the answer.
