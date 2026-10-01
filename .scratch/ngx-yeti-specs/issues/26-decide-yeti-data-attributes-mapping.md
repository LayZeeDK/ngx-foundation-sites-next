# 26. Decide: how the package maps each of Yeti's `data-*` attributes

Type: grilling
Status: claimed
Blocked by: 02, 07, 11, 16, 18, 20
Labels: wayfinder:grilling
Map: ../map.md

## Question

How does the package expose or manage each `data-*` attribute, marker, and vocabulary value in Yeti's contract? The manifest lists 32 vocabularies and 31 markers, per [Research: inventory of Yeti's components, layouts, recipes, utilities, and contract](02-research-yeti-inventory.md). The ways are:

- a typed input bound to the attribute;
- a host binding the directive owns;
- state Angular owns and writes;
- a static attribute the consumer writes;
- leaving it to the consumer.

What decides which, item by item?

## User instruction, 2026-10-01

The user's own message to the orchestrator, verbatim:

> 42. Audit Yeti's `data-*` attributes and determine how each will be mapped/managed by ngx-yeti.

## How to work it

AFK grilling. Start from the inventory's attribute table and the built manifest (`dist/yeti.manifest.json` of a build of `f52d1e8b9` under `D:/tmp`). Audit every attribute: its element, its values, and its default.

Apply these findings:

- From [Prototype: Yeti under SSR, hydration, `@defer`, event replay, and `animate.enter` and `animate.leave`](18-prototype-yeti-rendering-modes.md): hydration writes static template attributes again, so an attribute a user or a Yeti module can change before load must be Angular-owned state, not a static attribute.
- From [Research: binding Yeti's `yeti:*` events in Angular templates](16-research-yeti-events-in-angular-templates.md): how state changes are reported.
- From [Decide: which standing preferences and user rulings carry over](07-decide-inherited-preferences-and-rulings.md): whether the consumer writes Yeti's attributes at all.

Record one row per attribute in the Answer:

- the attribute;
- its item;
- its values;
- the mapping;
- the input name and type;
- the reason;
- what changes it at run time.

Then record an ADR for the rule that decides the mapping. Every mapping must work zoneless (map, Standing rulings).
