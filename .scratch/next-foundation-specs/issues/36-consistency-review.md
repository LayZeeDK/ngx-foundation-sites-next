# 36. Consistency review and bundle index

Type: grilling
Status: open
Blocked by: 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 37, 41, 53, 54, 55, 56, 57, 58, 59, 60
Labels: wayfinder:grilling
Map: ../map.md

## Question

Do the 26 specs (21 plugins, Button, and the four shared utilities: Breakpoint service, Triggers, Anchored pane, Nested menu), the building-blocks map, the glossary, the ADRs, the Sass packaging decision, and the Storybook conventions agree with one another, and is the bundle ready to hand to the new repo?

Check: every plugin, Button, and shared utility has a spec at `specs/<slug>.md`; naming, input and output conventions, and the implementation level in each spec match `building-blocks.md` (update the map where a spec made a better-argued choice, and say so); every plugin spec uses the shared-utility APIs exactly as their specs define them; every prototype verdict is reflected in the specs it blocked; every spec's Testing Decisions names the layers and commands the browser testing stack decision fixed, rewriting the stack-neutral "browser-level test" wording into the decided stack; every spec states its rendering-mode behaviour per the rendering-modes research and ADR 0008 and its animation approach per the map's rules; every spec's Sass notes match the Sass packaging decision and its stories follow `storybook-conventions.md`; every spec's Further Notes carries the Sass subsection the [Sass packaging for the new library](57-sass-packaging.md) decision prescribes (the `nfs-<plugin>` mixin, what it includes, and that it adds no library CSS unless listed with a reason); glossary terms are used consistently; no spec contradicts an ADR without an updated ADR; every `OPEN FOR HUMAN` and `Prototype needed` note is collected into a single list. Write `README.md` in the effort directory as the index: destination, how to read the bundle, the plugin table with links to spec and research, the open list.

Do not write new specs here. Record what was changed and the open list in the answer.
