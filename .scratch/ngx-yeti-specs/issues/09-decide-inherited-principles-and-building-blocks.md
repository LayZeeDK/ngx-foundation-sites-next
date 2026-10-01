# 09. Decide: which architecture principles and building-blocks rules carry over

Type: grilling
Status: claimed
Blocked by: 06, 07
Labels: wayfinder:grilling
Map: ../map.md

## Question

For each principle of the old `architecture-guide.md` (P1 to P26) and each cross-cutting section of the old `building-blocks.md` (1.1 to 1.14), decide whether it is carried over, adapted, or abandoned for Yeti, with the reason. Examples:

- DI and parent discovery;
- host directives;
- entry points and tree shaking;
- the rendered-state rule;
- render hooks;
- animation rules;
- the Breakpoint service;
- the Anchored pane;
- Triggers;
- the Nested menu;
- the spec shape.

## How to work it

AFK grilling against the research tickets and the decisions this ticket is blocked by. Some shared utilities may be replaced by the platform under the chosen browser target, for example the Anchored pane by CSS anchor positioning or Triggers by invoker commands. Say so with the evidence. Write `architecture-guide.md` and the cross-cutting part of `building-blocks.md` here, keeping each principle's origin, and list abandoned ones in this ticket's Answer.
