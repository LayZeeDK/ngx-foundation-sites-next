# 189. Prototype: a `<link>` family style loader with no consumer code

Type: prototype
Status: claimed
Blocked by: 184
Labels: wayfinder:prototype
Map: ../map.md

## Question

Can family styles load and unload lazily, compiled with the consumer's Foundation Sass settings, with no code in the consumer's codebase beyond its settings and build configuration? The candidate is this repository's `NfsStyleLoader` approach: the library ships one `.scss` entry per family, the consumer's build compiles each as a non-injected global style bundle (`inject: false`, `bundleName`), and a library service inserts and removes a reference-counted `<link>`.

## User instruction, 2026-10-01

Asked who writes the per-family carrier files, the user wrote, verbatim:

> Did you consider an approach like the `NfsStyleLoader` already used in this repo? Ideally no additional code needs to go into the conumer's codebase while supporting SCSS variables passed to Foundation for Sites SCSS in their codebase.
>
> Alternatively, also consider the solution used by the D:\projects\github\LayZeeDK\ngx-foundation-sites-gsd-pi implementation.

## How to work it

Start from `packages/ngx-foundation-sites/src/lib/core/nfs-style-loader.service.ts` and `packages/ngx-foundation-sites/docs/accordion/phase-11-styles-architecture.md` in this repository, [research/lazy-style-loading.md](../research/lazy-style-loading.md) section 5.3, and the 184 workspace (`D:/tmp/nfs-proto-lazy-family-styles`). Build the loader as the next library would, and measure it against 184's ten measurements in Chromium, Firefox, and WebKit, against a production SSR build. In particular:

1. Server HTML: today's loader runs in `afterNextRender`, so a server-rendered page has no family CSS. Find a public-API way to render the `<link>` on the server and adopt it at hydration, and measure unstyled frames under full and incremental hydration and in a client-only `@defer` block on a slow network.
2. Consumer setup: what is left in the consumer's project. Count the files and lines, and whether TypeScript is needed at all. Try to shrink it to the settings file plus configuration that a library `ng add` schematic or Nx generator writes: the `styles` entries and `stylePreprocessorOptions.includePaths`. Also try a single entry, or an esbuild plugin through Nx's `@nx/angular:application` executor `plugins` option, if either removes the per-family entries.
3. URLs: `deployUrl`, `<base href>`, i18n subpaths, cache busting of unhashed bundle names, and a library that cannot know the bundle URL.
4. Cost: one request per family, against 184's carrier chunks.
5. The unload timing after leave animations. Use the simplest public candidate; [Prototype: unloading family styles after leave animations without private API](188-prototype-unload-after-leave-without-private-api.md) owns the full answer.

Also record, from reading `D:/projects/github/LayZeeDK/ngx-foundation-sites-gsd-pi` (`packages/ngx-foundation-sites/src/lib/nfs-button/`, `src/scss/`), how its approach works and how it meets this question's two conditions: no consumer code, and the consumer's Foundation settings. Reading it is enough unless a measurement is cheap.

Capture the decisive files and a README under `prototypes/link-family-styles/`. Append an `## Answer` with a verdict per measurement and a comparison table of 184's carriers, this loader, and the gsd-pi approach. Decide nothing; [Decide: how first-milestone directives load and unload their family styles](185-decide-lazy-family-styles.md) chooses.
