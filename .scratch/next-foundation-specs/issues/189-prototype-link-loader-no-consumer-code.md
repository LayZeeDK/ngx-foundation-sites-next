# 189. Prototype: a `<link>` family style loader with no consumer code

Type: prototype
Status: resolved
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

## Answer

Resolved 2026-10-01 (Opus 5.5). Prototype: [prototypes/link-family-styles/README.md](../prototypes/link-family-styles/README.md). The workspace is a copy of 184's, at `D:/tmp/nfs-proto-189` (Nx 23.2.1, Angular 22.2.0). It was measured against production SSR builds in Chromium 153, Firefox 155, and WebKit 26.6, with 184's families. The loader is a root service with no provider. Each directive's constructor appends a counted `<link data-nfs-family data-beasties-skip>` to an `inject: false` bundle through `DOCUMENT`, on the server too. The client adopts the server link and holds server instances. The link is removed with 188's host timing. The orchestrator added three checks on 2026-10-01 (its words, not the user's): enter animations, `hydrate on viewport` and `on interaction`, and Beasties' copy. Results were the same in all three engines unless noted. Nothing is decided here; 185 chooses.

- **Consumer setup left: no TypeScript and no new files.** The consumer keeps its settings file. In `angular.json` or `project.json` it adds 1 `styles` line for the library's `global.scss`, 5 lines per family entry (`input`, `bundleName: 'nfs-<family>'`, `inject: false`; 20 for four), and 3 lines of `stylePreprocessorOptions.includePaths`. It also removes Foundation's includes from its `styles.scss`. A schematic or generator could write all of it.
  - Tried: a single entry works, but every family then loads and unloads as one 17.8 kB bundle.
  - Tried: an esbuild plugin through Nx's `@nx/angular:application` `plugins` option removes the per-family entries and passes every measurement 184's lazy carriers pass. It needs Nx's executor (Angular CLI's builder has no `plugins` option), and the CSS becomes an owned `<style>` from a JS chunk.
- **1 Settings: pass**, in every build and deployment tried.
- **2 Lifecycle: pass**, with count `0 1 1 1 0 1 0`.
- **3 Point 1, server HTML:**
  - **Full and incremental hydration: pass.** The link is in the server HTML, it is styled with JavaScript off, and hydration shows 0 mutations and 0 unstyled frames.
  - **Added `hydrate on viewport` and `on interaction`: pass**, 0 unstyled frames.
  - **Client-only `@defer` fails at 300 ms latency**, with 18-20 unstyled frames. Server-rendered preloads did not help, because the service exists only where a family directive rendered on the server. `<link rel="preload">` for every family in `index.html` gives 0 unstyled frames, at the cost of every family's CSS with the page (3.4 kB gzip for four).
- **4 Order: pass with `@layer`**, and the unlayered build fails as in 184. **7 Dehydrated instances: pass with the hold.** Measurement 9 gives 184's numbers.
- **5 Point 5, leave animations: pass in L1, L2, and L3 with public API.** The library owns the link, so Angular's guard never applies. Host timing removes the link in the frame the last host leaves, with 0 unstyled frames during L1's leave.
- **Added, enter animations whose keyframes ship in the family CSS:**
  - **Skipped, never late**, whenever the CSS has not applied one frame after insertion. Angular removes the class after one `requestAnimationFrame` (read from source, `@angular/core` `_debug_node-chunk.mjs:14385-14393`).
  - **On time** from the HTTP cache or with the `index.html` preloads.
  - A cold local fetch was mixed across engines.
- **8 Beasties: fail by default; pass with `data-beasties-skip`.** Without the attribute, Beasties copies the family's critical rules into its inline `<style>`, and a fresh `div.callout` stays styled after the unload. With it, set by the library on its own links, the copy is gone and inlining stays on for the global stylesheet. The family links then become render-blocking, which ticket 190 measures.
- **3 Point 3, URLs:**
  - **`baseHref`, `deployUrl`, and i18n: pass.** The URL prefix is read from the global `styles-*.css` link. A root-absolute `/nfs-*.css` would miss the per-locale folders.
  - **Cache busting fails.** A callout-only settings change changes `nfs-callout.css` but no hashed name, and Angular's `server.ts` serves it with `max-age=31536000`. A fix needs consumer server or CDN code (not built).
- **4 Point 4, cost:** one CSS request per family (gzip 330-1,376 B). Nothing is fetched at hydration. 184 fetches one JS chunk per family at hydration (gzip 458-1,568 B), on top of inlined CSS.
- **gsd-pi** meets "no consumer code" for Foundation's default look only.
  - Its `NfsButton` is a component whose library-compiled `styleUrl` reads a private copy of Foundation's defaults (`nfs-button.ts:31-32`, `nfs-button.scss:24-25`, `internal/_settings.scss:15`, `internal/_foundation-button.scss:30-53`).
  - The consumer's own Foundation settings are ignored (`README.md:150`). Theming is four mixin arguments in the consumer's global stylesheet, emitted a second time and never unloaded (`_button.scss:27-31`, `:58-62`).

| | 184 lazy carriers | 184 eager carriers | This loader | gsd-pi |
| --- | --- | --- | --- | --- |
| Consumer's own Foundation settings | yes | yes | yes | no |
| Consumer TypeScript | carriers, map, provider (9 files, 63 lines + 11) | the same | none (24 JSON lines) | none (default look only) |
| SSR and hydration, 0 unstyled frames | yes | yes | yes | yes (inferred) |
| Client-only `@defer`, 300 ms | 19-20 unstyled frames | 0 | 18-20; 0 with `index.html` preloads | not measured |
| Unload after leave, public API | leaks (L1-L3) | leaks | passes | inherits the leak (inferred) |
| Beasties copy after unload | none | none | none with `data-beasties-skip` | n/a |
| Cache busting | hashed | hashed | fails (unhashed, 1-year cache) | hashed |
