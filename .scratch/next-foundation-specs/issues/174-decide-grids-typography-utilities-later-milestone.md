# 174. Decide: grids, typography, and utilities move to a later milestone

Type: grilling
Status: resolved
Blocked by: 158, 173
Labels: wayfinder:grilling
Map: ../map.md

## Question

Which layout and utility families stay in the implementing repository's first milestone? And what do the first-milestone specs use in place of a family that moves?

## User ruling, 2026-09-30

The user asked, verbatim:

> Change the specs so that XY Grid, Float Grid, Flex Grid, Typography, and Utilities are deferred to a later milestone. No spec may assume that these are implemented and they should be in separate specs. This makes the initial milestone simpler and more minimal.

Foundation's docs group these pages under Grid (XY Grid, Float Grid, Flex Grid), Utilities (Prototyping Utilities, Flexbox Utilities, Visibility Classes, Float Classes) and Typography (Base, Helpers). Only Typography Helpers has a spec here, because base styles are Foundation's own CSS. Asked which specs move, the user chose "All eight".

On what replaces them, the user said:

> Use Foundation for Sites global styles not covered by specs included in the initial milestone as normal classes, for example .show-for-sr. Assume that consumers load global Foundation for Sites styles.

On how to staff the work:

> Use subagents as per my global CLAUDE.md and its references/ documents.

## Decision

1. Eight specs are planned and implemented in a later milestone of the implementing repository:
   - `specs/xy-grid.md`
   - `specs/float-grid.md`
   - `specs/flex-grid.md`
   - `specs/typography-helpers.md`
   - `specs/prototyping-utilities.md`
   - `specs/flexbox-utilities.md`
   - `specs/visibility-classes.md`
   - `specs/float-classes.md`

   Each stays a separate, whole spec, marked as later milestone. [Decide: the Prototyping Utilities' Library mixin](173-decide-prototyping-utilities-library-mixin.md) applies there.
2. No first-milestone spec assumes these specs are implemented, names their directives, or links them. A consumer who needs one of these families in the first milestone writes Foundation's own classes as normal classes, for example `.show-for-sr`, `grid-x` and `cell`, `text-center`, or `hide-for-medium`, and loads Foundation's global styles. First-milestone specs assume those styles are loaded.
3. The class rule ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)) gains an exception. A Foundation class that belongs to a family with no first-milestone spec is a normal class that the consumer, or the library's own stories, may write. For every family that has a first-milestone spec, the class rule holds as before.
4. The Variant declaration tooling, the Breakpoint service, and the later-milestone checks specs keep what the first milestone needs. The registries and Variant properties of the eight families go with those families.
5. A spec whose behaviour, not only its examples, relied on one of the eight states the Foundation classes the consumer writes instead. Examples:
   - the Responsive Toggle's visibility classes;
   - a layout that an example laid out with a grid.

## The wave

| Ticket | Kind | Blocked by |
| --- | --- | --- |
| [Re-run: grid, typography, and utility specs for the later milestone](175-rerun-grid-typography-utility-specs-later-milestone.md) | grilling (Opus) | this ticket |
| [Re-run: specs without the later-milestone families, group a](176-rerun-specs-without-later-families-group-a.md) to [group c](178-rerun-specs-without-later-families-group-c.md) | grilling (Opus) | this ticket |
| [Task: shared documents for the later-milestone families](179-task-shared-documents-later-milestone-families.md) | task (Opus, low effort) | 175 to 178 |

The wave audit follows (map, Audits).

## Triage

This is a user ruling, so no triage decides it. The orchestrator made three calls, each impact LOW and confidence HIGH:
- The eight specs were read from Foundation's docs navigation.
- The class-rule exception is decision 2 stated as a rule.
- The registries go with their families.

Nothing is OPEN FOR HUMAN.

### Gist for Decisions so far

- [Decide: grids, typography, and utilities move to a later milestone](issues/174-decide-grids-typography-utilities-later-milestone.md) -- the user ruled that the XY, Float, and Flex Grids, Typography Helpers, and the four Utilities specs (Prototyping Utilities, Flexbox Utilities, Visibility Classes, Float Classes) are planned and implemented in a later milestone, each a separate spec. No first-milestone spec assumes them. A consumer writes Foundation's own classes for those families (`.show-for-sr`, `grid-x`) with Foundation's global styles loaded, which the class rule now allows for a family with no first-milestone spec.
