# 17. Research: Yeti against WHATWG, WAI-ARIA, the APG, and Angular Aria, CDK, and Material patterns

Type: research
Status: claimed
Blocked by: 02, 03
Labels: wayfinder:research
Map: ../map.md

## Question

For each of Yeti's 49 items, does its documented markup and behaviour conform to the WHATWG HTML standard, WAI-ARIA, and the matching WAI-ARIA APG pattern, and meet WCAG 2.2 AA? Where Yeti falls short or leaves a choice open, which patterns or accessibility techniques should the package adopt from `@angular/aria`, `@angular/cdk`, or Angular Material?

## User instruction, 2026-10-01

The user's own message to the orchestrator, verbatim:

> 22. We should also evaluate Yeti for compatibility with WHATWG, WAI-ARIA, ARIA APG, and component patterns/accessibility techniques to adopt from Angular Aria/CDK/Material.

## How to work it

Use a `/research` subagent with these local sources:

- `d:/projects/github/foundation/yeti` at `f52d1e8b9` (manifest accessibility notes, `src/`, `docs/`);
- `d:/projects/github/w3c/aria-practices` and `d:/projects/github/w3c/aria`;
- `d:/projects/github/angular/components` at `22.2.x` (`src/aria`, `src/cdk`, `src/material`);
- the WHATWG HTML standard online.

Run axe with the WCAG 2.2 AA rule set over each item's docs example in Chromium, Firefox, and WebKit, and record the engines' accessibility trees for the interactive items. Then, per item, record:

- the APG pattern and the deviations, citing the pattern's file;
- HTML conformance;
- the axe result;
- keyboard and focus behaviour;
- the Angular Aria, CDK, or Material building block that would supply what is missing, with its `file:line`.

Mark what was measured and what was read. Write `research/yeti-accessibility-and-standards.md`, and append an `## Answer`. Decide nothing.
