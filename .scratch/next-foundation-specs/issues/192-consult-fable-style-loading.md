# 192. Consult: new approaches to loading family styles

Type: research
Status: claimed
Blocked by: 184, 188, 189
Labels: wayfinder:research
Map: ../map.md

## Question

Given what tickets 182 to 189 measured, is there an approach to loading and unloading family styles that none of them tried, and that meets more of the requirements at once? And where are the current candidates weaker than they look?

The requirements:

- no consumer code beyond the Foundation settings file and generated build configuration;
- the consumer's own Foundation Sass settings;
- server HTML, full and incremental hydration, and `@defer`, with no unstyled frame;
- unloading after the last instance and its leave animation;
- enter animations that play;
- cache busting;
- public Angular API;
- no CSS custom properties for theme values (user, 2026-10-01);
- Foundation's own Sass reused, never re-implemented (ADR 0012);
- the browser target on the map.

## User instruction, 2026-10-01

The user wrote, verbatim:

> 8. Consider consulting a fable-* subagent for innovative insights.

## How to work it

A Fable 5.1 consult, at high effort. It reads the research files and prototype READMEs of tickets 182 to 189, and the open tickets 190 and 191 for what they will measure, and checks claims against the local clones where a proposal depends on them. It writes `research/style-loading-consult.md`. Each proposal gets:

- how it works;
- which requirements it meets, and the evidence or the measurement that would settle it;
- its main risk;
- the smallest prototype that would test it.

It also gives a critique of the current candidates. It decides nothing, and every proposal that is not measured is labelled as untested. [Decide: how first-milestone directives load and unload their family styles](185-decide-lazy-family-styles.md) chooses.
