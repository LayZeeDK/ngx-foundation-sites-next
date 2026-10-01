# 21. Prototype: Yeti as a dependency from GitHub at a pinned commit

Type: prototype
Status: claimed
Blocked by:
Labels: wayfinder:prototype
Map: ../map.md

## Question

Yeti is not on npm, and the user ruled that the package is built against a specific commit of `develop`. How can the package, and an application that uses it, depend on Yeti's built CSS, its JavaScript modules, and its static files (`dist/`, the manifest, and the token catalogue) from GitHub at that commit? The options are `package.json` syntax, esbuild, Vite, or anything else that works.

## User question, 2026-10-01

The user's own message to the orchestrator, verbatim:

> 27. Can we use package.json syntax or ESBuild/Vite to configure foundation/yeti as a JS/CSS/static dependency from GitHub?

## How to work it

Try each in an Angular 22.2 workspace under `D:/tmp/`, with npm as the package manager:

- an npm git dependency (`github:foundation/yeti#<commit>`, `git+https://...#<commit>`), and whether npm runs Yeti's `prepare` or `build` so that `dist/` exists;
- a GitHub tarball URL;
- `npm pack` of a local build;
- a git submodule;
- an esbuild or Vite plugin that fetches or resolves the files;
- anything the research finds.

Record for each:

- whether `dist/` and the `exports` map (`yeti-css/manifest`, `yeti-css/tokens`, `./css/*`, `./js/*`) resolve;
- whether `npm ci` is reproducible from the lockfile;
- install time;
- whether it works offline after the first install;
- what a downstream application of the package installs;
- licence and notice handling under [ADR 0001](../adr/0001-yeti-licence-compatible-with-mit-package.md).

Verify each with a real build that imports Yeti's CSS and one module. Capture under `prototypes/yeti-github-dependency/`, and append an `## Answer`. Decide nothing; [Decide: which Yeti version the specs target, and how the package tracks it](12-decide-yeti-version-policy.md) chooses.
