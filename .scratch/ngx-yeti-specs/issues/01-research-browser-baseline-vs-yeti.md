# 01. Research: Angular 22's browser baseline against what Yeti expects

Type: research
Status: open
Blocked by:
Labels: wayfinder:research
Map: ../map.md

## Question

Which web platform features does Yeti's CSS and JavaScript use, and which of them fall outside Angular 22's browser baseline? For each one that falls outside, does Yeti guard it with a fallback?

The baselines are:

- Angular 22's: Baseline widely available on 2026-05-07, https://web-platform-dx.github.io/supported-browsers/?widelyAvailableOnDate=2026-05-07&includeDownstream=false, with the core table Chrome, Edge, and Firefox 119 and Safari 17.
- Yeti's: its README says "Yeti targets **Baseline 2025**. Anything that reached Baseline by the end of 2025 is used without guards; newer features sit behind `@supports` with a working fallback."

## User instruction, 2026-10-01

> Compare Angular 22's browser baseline to what Yeti expects to be available in a browser.

An earlier request named these features to check: "container queries, `popover`s, `dialog`s, anchor positioning, cascade layers, native nesting, `light-dark()`, and scroll-snap".

## How to work it

Use a `/research` subagent with a scripted, exhaustive scan rather than a reading.

1. Parse every CSS file under `d:/projects/github/foundation/yeti/src/` with a CSS parser, and every JavaScript module with a JS parser.
2. Map each property, value, selector, at-rule, function, unit, and DOM API to its `web-features` id. Use the `web-features` npm package, pinned, installed under `D:/tmp`.
3. For each feature, record:
   - its Baseline status, low date, and high date;
   - whether it is in Angular 22's set on 2026-05-07;
   - whether it is in Yeti's set, Baseline newly available by 2025-12-31;
   - whether Yeti guards it (`@supports`, a feature check in JS) and what the fallback does;
   - the files and lines that use it.
4. Report the features in Yeti's set but not in Angular's, with their guard status, and say which Yeti components depend on each unguarded one. Report the browser versions each baseline implies.

Write `research/browser-baseline-vs-yeti.md` with the table, the method, and the unknowns. Append an `## Answer`. Decide nothing; [Decide: the browser target](06-decide-browser-target.md) chooses.
