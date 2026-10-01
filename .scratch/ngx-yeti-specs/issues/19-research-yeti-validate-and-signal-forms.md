# 19. Research: what `validate.js` does, and replacing it with Angular Signal Forms

Type: research
Status: claimed
Blocked by: 03
Labels: wayfinder:research
Map: ../map.md

## Question

What is `validate.js` for: its rules, messages, timing, ARIA, and events (`yeti:invalid`)? How would the package replace or complement it with Angular's forms? That means Signal Forms in Angular 22.2 first, then reactive forms. The old map did the same for Foundation 6.9's Forms page and its Abide plugin.

## User instruction, 2026-10-01

The user's own message to the orchestrator, verbatim:

> 24. Analyze the purpose of validate.js and how this could be replaced using Angular Signal Forms, and so on, similar to what we did to spec Foundation for Sites v6.9's Forms and Abide.

## How to work it

Use a `/research` subagent, with these sources:

- `d:/projects/github/foundation/yeti` (`validate.js`, the field component, `range.js`, their manifests and docs);
- `d:/projects/github/angular/angular` at `22.2.x` (`packages/forms`, Signal Forms included, and `adev/src/content/guide/forms/`);
- the old map's `specs/forms.md` and `specs/abide.md` and their tickets under `.scratch/next-foundation-specs/`, as evidence of what that effort decided and why; they bind nothing here.

Cover:

- what Yeti validates, and when;
- how it marks fields invalid and announces errors;
- its interplay with native constraint validation;
- what [Research: Yeti's JavaScript modules and what Angular adds](03-research-yeti-javascript-and-angular.md) found: Angular's form directives prevent submit before `validate.js` runs, and nothing sets `aria-invalid` or `aria-describedby`;
- the Signal Forms API that maps to each behaviour, and the gaps;
- what the old Forms and Abide specs decided that transfers.

Run a small probe under `D:/tmp/` where a claim needs one. Write `research/yeti-validate-and-signal-forms.md`, and append an `## Answer`. Decide nothing.
