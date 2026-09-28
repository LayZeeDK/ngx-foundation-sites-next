# Prototype: in-family checks for a forgotten directive import (peer)

Throwaway prototype for [Prototype: detecting a forgotten attribute directive import](../../../issues/145-prototype-missing-directive-import-checks.md). Findings: [research/missing-directive-import-peer.md](../../../research/missing-directive-import-peer.md).

Angular 22.2.0, `@angular/build` application builder with SSR (`outputMode: server`), incremental hydration, strict templates, Chromium through Playwright 1.63.

## What it builds

Two variants of the same stand-in directives (an accordion family of four, a dropdown menu family of four, and `NfsButton` alone), swapped by `fileReplacements` on `src/lib/index.ts`:

- `src/lib/aria.ts` with `src/lib/dev.ts`: the Angular Aria style. Every child injects its parent with `optional: true`; every part runs a development-only check after render. The parent check reports a forgotten parent import (an ancestor carries the parent's attribute but hosts no instance), a parent that projection hides from DI, or no parent at all. The child check reports every element in the part's scope that carries a child's attribute but hosts no instance. Instances mark their host element in a development-only `WeakMap`; the declaring component comes from Angular's development-mode `ng.getOwningComponent`, which also returns `null` for server-rendered DOM that has not hydrated yet, so that DOM is skipped. Each report is made once per element.
- `src/lib/ngp.ts`: the ng-primitives style. Every child injects its parent without `optional`, so a forgotten parent throws NG0201. No checks. The token descriptions name the directive to import, in development builds only.

`src/app/cases.ts` holds one page per test case (the route is the case id), each importing a deliberate subset; every case is also served client-only under `/csr/<id>`. `compile-fail/bound-input.ts` holds the bound-input cases, compiled on their own.

## How to run

Install outside the repository (the folder carries no lockfile):

```sh
cp -r . D:/tmp/nfs-145-peer/app && cd D:/tmp/nfs-145-peer/app
npm install
npm run build:all          # dist/aria-dev, aria-prod, ngp-dev, ngp-prod, each with browser-stats.json
node measure.mjs results.json            # 22 cases x ssr/csr x 4 builds, ports 5490-5493
node summarize.mjs aria-dev results.json # one block per run: HTTP status, messages, server log
node sizes.mjs                           # library bytes per build from the esbuild metafile
node timing.mjs                          # render time with 500 items, ports 5496-5497
npx ngc -p tsconfig.compile-fail.json    # NG8002 and NG8003 for the bound-input cases
npx ng serve                             # port 5495, then: node serve-check.mjs
```

`dev.ts` has a `HOOK` constant: `'every'` (`afterEveryRender`, the version measured last) or `'effect'` (Angular Aria's `afterRenderEffect`).

## What it showed

- `results/aria-dev.txt`: the Aria style, `HOOK = 'every'`. Every forgotten member is reported with the directive and the component whose `imports` need it, in every container; no report for the correct page, the consumer's CSS attributes, or dehydrated `@defer` content. A whole family and `NfsButton` are silent.
- `results/aria-dev-effect.txt`: the same with `afterRenderEffect`; it misses a forgotten title that appears later inside an existing item (`if-leaf`). Its "claimed" counts come from `__ngContext__`, the later files' from `ng.getOwningComponent`.
- `results/aria-dev-noguard.txt`: the dehydration guard turned off; two false reports on `defer-hydrate-ok`.
- `results/aria-dev-draft.txt`: the first draft, whose "no child at all" check reported every `@defer` and `@if` page before its children arrived, and whose `__ngContext__` guard hid real orphans; both were removed.
- `results/aria-prod.txt`: nothing in production (0 messages, every page HTTP 200).
- `results/ngp-dev.txt`, `results/ngp-prod.txt`: NG0201 for a forgotten parent or middle part only; the server answers 404 or logs the error, and the page or block renders empty; production prints a bare `NG0201`.

Angular prints the DI error class as U+0275 followed by `NotFound`; the result files drop that character to stay ASCII.
