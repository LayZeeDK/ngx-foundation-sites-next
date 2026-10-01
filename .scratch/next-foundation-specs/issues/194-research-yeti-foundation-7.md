# 194. Research: Yeti, Foundation's version 7

Type: research
Status: claimed
Blocked by:
Labels: wayfinder:research
Map: ../map.md

## Question

What is Yeti (`yeti-css`, version `7.0.0-alpha.0` on the upstream `develop` branch, 473 commits after v6.9.0), and what would it mean for this effort to wrap Yeti instead of Foundation for Sites 6.9?

The orchestrator found on 2026-10-01 that the repository's README calls Yeti "the successor to Foundation for Sites". Its stated traits:

- "CSS-first, native, zero-build", with "No Sass";
- one stylesheet, with runtime custom-property tokens;
- cascade layers, container queries, `light-dark()`, `dialog`, and `popover`;
- status `7.0.0-beta`, with class names, attributes, and token names frozen;
- not published to npm, where `foundation-sites` stays at 6.9.0 and keeps publishing 6.x from a `v6` branch.

## User question, 2026-10-01

> 10. Is there a prerelease version/branch/tag of Foundation for Sites v7 that we can wrap instead of v6.9?

The user then widened the question, verbatim:

> #10 See https://github.com/foundation/yeti (the `develop` branch), https://github.com/foundation/yeti/issues/15554, and its docs at https://www.foundationcss.com/yeti/ (make sure to read https://www.foundationcss.com/yeti/guides/migrating/). Make a local clone and explore its readme, what is locked, what might change after v7.0.0-beta, and how that would affect us wrapping v7 instead of v6.9. Determine whether Angular 22's browser baseline supports all features that Yeti relies on, for example container queries, `popover`s, `dialog`s, anchor positioning, cascade layers, native nesting, `light-dark()`, and scroll-snap. Determine how much of Yeti is driven by JavaScript, what Angular would bring to the table other than replacing its JavaScript, and how it could better enable lazy-loading of component-specific styles.

The orchestrator cloned `foundation/yeti` at `develop` to `d:/projects/github/foundation/yeti` (`f52d1e8b9`, 2026-09-25). Points 6 to 9 below come from this instruction.

## How to work it

Resolve with a `/research` subagent. Start from the local clone `d:/projects/github/foundation/foundation-sites` at `origin/develop` (do not change its checked-out branch; read with `git show origin/develop:<path>` or a separate worktree outside the repo), and the upstream announcement issue it links (#15554, read-only through `gh`). Cover, with sources:

1. Status and timeline: version, the stability guide, the release plan, how often it is pushed, the licence, and the npm package name and publishing plan.
2. Browser support against the map's target: the core browser table and the Baseline widely available set of 2026-05-07. List every platform feature Yeti needs that is not in that set (for example `light-dark()`, `popover`, container style queries).
3. Coverage against this bundle: which Foundation 6.9 components, layout systems, and utilities have a Yeti counterpart, which are dropped, and which are new. Also what JavaScript Yeti ships (`yeti.js`), and which behaviour it leaves to the platform.
4. Styling model: tokens, themes, layers, the manifest and the token JSON, and how a consumer customises it without Sass. Then what that means for the lazy family styles question (182 to 192), the class rule (ADR 0039), typed Variant inputs (ADR 0040), and ADR 0012's Sass packaging.
5. What wrapping Yeti would change in this effort's destination and specs, at a high level; for example which records would be superseded.
6. The docs site (https://www.foundationcss.com/yeti/) and its migration guide (https://www.foundationcss.com/yeti/guides/migrating/): what migrating from 6.x means. Then, from the README and the stability guide, what is locked at `7.0.0-beta` and what may still change before or after `7.0.0`, and how each possible change would affect a library that wraps it.
7. Browser support, feature by feature, against Angular 22's baseline (Baseline widely available on 2026-05-07, and the map's core browser table): container queries (size, and style queries if used), `popover`, `dialog`, anchor positioning, cascade layers, native nesting, `light-dark()`, scroll snap, and every other feature Yeti's CSS or JavaScript uses. For each feature that falls outside the baseline, state whether Yeti provides a fallback.
8. JavaScript: how much of Yeti is JavaScript-driven (files, lines, and behaviours in `yeti.js` and `src/**/*.js`) and how much is CSS and platform. Then what Angular would add beyond replacing that JavaScript: typed inputs, the class rule, accessibility, SSR and hydration, forms, `@defer`, and the like.
9. Lazy loading: how Yeti's file layout (`./css/*` per-component exports, layers, tokens, and the manifest) could make lazy loading of component styles easier than Foundation 6.9's Sass, measured against the requirements of [Consult: new approaches to loading family styles](192-consult-fable-style-loading.md).

Write `research/yeti-foundation-7.md`, and append an `## Answer`. Decide nothing; whether to change the destination is the user's call.
