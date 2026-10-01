# 22. Prototype: building, consuming, and theming Yeti from a pinned commit with Nx

Type: prototype
Status: claimed
Blocked by: 21
Labels: wayfinder:prototype
Map: ../map.md

## Question

How does an Nx workspace build Yeti from a pinned `develop` commit, and consume and theme it, the way Yeti's own documentation expects in its alpha stage? It must do so with Nx 23.2 today and still work under Nx 24, which removes most built-in executors in favour of inferred tasks.

## User instruction, 2026-10-01

The user's own message to the orchestrator, verbatim:

> 31. As written in Yeti's documentation, it is expected that in this alpha stage, the consumer must run npm build in the repo and `esbuild` locally to use their CSS (and JS). If we need to compile it, we can use an `@nx/*` plugin/executor to automate this process. Note that Nx 24 was just released and removes all/most executors, replacing them with inferred task plugins. Read its docs and README on building, consuming, and customizing/theming it.

The user then pointed at https://nx.dev/blog/look-mum-no-executors. The orchestrator's summary is in the map's Standing rulings: v24 is announced, not yet released, and it keeps `nx:run-commands`, `@nx/esbuild:esbuild`, the `@nx/js` build executors, and every `@nx/angular` executor.

## How to work it

1. Read Yeti's own documentation on building, consuming, and customising or theming, and cite each with `file:line`:
   - `README.md`;
   - `src/guides/install.md`, `theming.md`, `color.md`, and `components.md`;
   - `bin/build.js` and the `package.json` scripts;
   - the docs site pages at https://www.foundationcss.com/yeti/.
2. Read the Nx docs on inferred tasks and on writing an inferred-tasks plugin (`createNodesV2`), through the `nx_docs` tool or nx.dev, citing the pages.
3. In a workspace under `D:/tmp/` with Yeti at `f52d1e8b9`, build and measure:
   - an inferred target for Yeti's build: a small local plugin, or `nx:run-commands` over Yeti's `npm run build`;
   - `@nx/esbuild:esbuild`, if Yeti's build reduces to esbuild;
   - the [Prototype: Yeti as a dependency from GitHub at a pinned commit](21-prototype-yeti-as-github-dependency.md) options that need a build step.
4. For each, record cache inputs and outputs, `nx affected` behaviour when the pin moves, and what an application of the package must add.
5. Theme one component with Yeti's documented mechanism, and confirm it in Chromium, Firefox, and WebKit.

Capture under `prototypes/yeti-nx-build/`, and append an `## Answer`. Decide nothing; [Decide: which Yeti version the specs target, and how the package tracks it](12-decide-yeti-version-policy.md) chooses.
