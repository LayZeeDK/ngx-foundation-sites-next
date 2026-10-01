# 186. Decide: how later-milestone families manage their styles

Type: grilling
Status: open
Blocked by: 185
Labels: wayfinder:grilling
Map: ../map.md

## Question

The user left this open in the ruling recorded in [Decide: how first-milestone directives load and unload their family styles](185-decide-lazy-family-styles.md): "It's unclear how later milestone's specs should manage styles - whether to keep assuming that their styles are loaded in the consumer's global stylesheets or whether it would be possible to lazy load styles." When the XY Grid, Typography Helpers, Prototyping Utilities, Flexbox Utilities, Visibility Classes, and Float Classes get their directives (the Float and Flex Grids are out of scope since 2026-10-01, [Task: remove the Float Grid and Flex Grid from the bundle](187-task-remove-float-and-flex-grids.md)) in a later milestone, do they keep their styles in the consumer's global stylesheet, or do they adopt the first milestone's mechanism?

## How to work it

Grill once the first-milestone mechanism is decided. Weigh:

1. Feasibility. Until their directives land, a consumer writes these families' Foundation classes directly ([Decide: grids, typography, and utilities move to a later milestone](174-decide-grids-typography-utilities-later-milestone.md)). Styles tied to a directive's lifecycle would stop applying to that markup.
2. Release policy ([ADR 0045](../adr/0045-release-policy-devkit-version-scheme.md)): whether moving these styles from the global stylesheet to lazy loading is a breaking change that must wait for an Angular major, with a deprecation and a migration.
3. Benefit. These classes appear on most pages, so lazy loading may save nothing. Weigh that against their size, which [Research: splitting Foundation 6.9's CSS per family](183-research-foundation-sass-per-family-split.md) measures for three of the six: the XY Grid (35,747 bytes minified), the Flexbox Utilities (2,343), and the Visibility Classes (2,557). The Prototyping Utilities, the Typography Helpers, and the Float Classes were not compiled alone; compile them the same way when this ticket is worked.
4. What the six later-milestone specs and their `Milestone: later` lines say afterwards.
