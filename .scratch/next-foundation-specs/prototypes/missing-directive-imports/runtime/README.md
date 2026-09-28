# Runtime check for a forgotten attribute directive import (prototype)

Rough prototype for [Prototype: detecting a forgotten attribute directive import](../../../issues/145-prototype-missing-directive-import-checks.md).
Findings: [research/missing-directive-import-runtime.md](../../../research/missing-directive-import-runtime.md).

An Angular 22.2 CLI application with SSR (`outputMode: server`, `withIncrementalHydration()`)
holds a stand-in library under `src/nfs/`: `NfsButton` (`button[nfsButton], a[nfsButton]`, a
static `size` and a bound `expanded` input), the accordion family of four, the class-less
behaviour directive `NfsSmoothScroll`, and two classes named `NfsColumn` (the real library's
Flex Grid and Float Grid). `src/app/cases/` holds one route per test case.

## The check

`src/nfs/import-check/`: a development-only scan, after every application render, of the
elements carrying any attribute in a selector manifest (174 entries: the stand-ins plus every
`[nfs*]` attribute the effort's specs name, `tools/spec-attributes.txt`), with five ways to
decide whether the directive is on the element:

| `?approach=` | Decides by | Needs |
| --- | --- | --- |
| `registry` | a WeakMap every library directive fills from its constructor in development | code in every directive |
| `debug` | `ng.getDirectives(el)`, matched on the compiled selector (private static field) | Angular's development global |
| `debug-name` | `ng.getDirectives(el)`, matched on the class name (public API only) | the same |
| `class` | the Structural class the directive always binds is absent | the manifest's class per directive |
| `hybrid` | `class` when the class is absent, else `debug` | both |

Other URL switches (read in the browser only): `?hook=every` scans the whole document after
every render instead of only the subtrees a MutationObserver saw added; `?start=provider`
starts the scan from `provideNfsRuntimeChecks({})` in the application configuration instead of
from the first library directive; `?typos=1` (with `start=provider`) adds a report for any
`nfs*` attribute the manifest does not list; `?checks=off` opts the check out.

## How to run

```sh
npm install
npm run gen:manifest          # writes src/nfs/import-check/manifest.ts
npm start                     # SSR dev server, http://localhost:5470, --no-hmr
npx playwright test           # in a second shell; writes results/matrix.jsonl
npm run summarize             # one line per case, phase, and approach
HOOK=every npx playwright test --grep-invert "stress|twins:|outlet:|@engines"
node tools/compare-hooks.mjs  # both scan modes give the same verdicts
npm run ng8002                # the bound input on the forgotten NfsButton fails to compile
npm run measure               # builds every approach in development and production
```

`results/` holds the last run: `matrix.txt` (the summary), `bundles.json`, `cmp-probe.jsonl`
(the compiled-definition probe, `e2e/cmp-probe.spec.ts`).

## What it showed

- `registry`, `debug`, `class`, and `hybrid` report the forgotten member, family, and single
  directive, in inline and external templates, inside `@defer`, `@if`, `@for`, an outlet
  template, and projected content, once each rendered; nothing when every import is there.
- `debug-name` reports every directive: the development build names each compiled class
  `_NfsButton`, so class names cannot be matched.
- `registry` reports imported directives in server HTML that has not hydrated yet
  (incremental hydration, and a lazy route before it loads when the scan starts early).
- `class` misses the class-less `NfsSmoothScroll` and a Foundation class copied by hand;
  `hybrid` covers both and has no false report in any case.
- Nothing starts when no library directive is instantiated, unless the application calls
  the provider function.
- Development cost about 43 kB raw (6.6 kB gzip), 34 kB of it the manifest; production: none
  of the check's code (within 50 bytes of the build without it), once no statement at module
  level calls anything.
