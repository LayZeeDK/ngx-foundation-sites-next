# 192. Consult: new approaches to loading family styles

Type: research
Status: resolved
Blocked by: 184, 188, 189
Labels: wayfinder:research
Map: ../map.md

## Question

Given what tickets 182 to 189 measured, is there an approach to loading and unloading family styles that none of them tried, and that meets more of the requirements at once? And where are the current candidates weaker than they look?

The requirements:

- no consumer code beyond the Foundation settings file and generated build configuration;
- the consumer's own Foundation Sass settings;
- server HTML, full and incremental hydration, and `@defer`, with no unstyled frame;
- unloading after the last instance and its leave animation;
- enter animations that play;
- cache busting;
- public Angular API;
- no CSS custom properties for theme values (user, 2026-10-01);
- Foundation's own Sass reused, never re-implemented (ADR 0012);
- the browser target on the map.

## User instruction, 2026-10-01

The user wrote, verbatim:

> 8. Consider consulting a fable-* subagent for innovative insights.

## How to work it

A Fable 5.1 consult, at high effort. It reads the research files and prototype READMEs of tickets 182 to 189, and the open tickets 190 and 191 for what they will measure, and checks claims against the local clones where a proposal depends on them. It writes `research/style-loading-consult.md`. Each proposal gets:

- how it works;
- which requirements it meets, and the evidence or the measurement that would settle it;
- its main risk;
- the smallest prototype that would test it.

It also gives a critique of the current candidates. It decides nothing, and every proposal that is not measured is labelled as untested. [Decide: how first-milestone directives load and unload their family styles](185-decide-lazy-family-styles.md) chooses.

## Answer

Resolved 2026-10-01 (Fable 5.1, high effort). Findings: [research/style-loading-consult.md](../research/style-loading-consult.md). Three proposals were probed today in `D:/tmp/nfs-proto-192`, a copy of 189's workspace whose `node_modules` is a junction to 189's (remove the junction before deleting the folder); the rest are read from source or untested, and the findings label each. Nothing is decided; 185 chooses.

- **A, ranked first, measured in three engines: the family's CSS rides in the directive's own chunk.** Each directive module statically imports `nfs-family-css:<family>`, which a library esbuild plugin compiles from Foundation's Sass with the consumer's settings; the string is in memory when the constructor runs, so the library-owned `<style>` is inserted in the same task as the element. On a client-only `@defer` with the chunk delayed 300 ms: 0 unstyled frames (184 and 189 measured 17-20); enter animations on time in 17 of 18 cases (189 measured skipped on every cold fetch); `main.js` holds no family rule; names are hashed; the server HTML carries the `<style>` and hydration adds nothing; no consumer TypeScript. 189's plugin variant was one dynamic `import()` away from this result. Open: Angular CLI without Nx needs a thin library builder over the public `buildApplication` (`@angular/build` `index.d.ts:8-9`), untested; `ng serve` and HMR; CSS optimisation parity. Smallest test: the builder in a plain CLI workspace, a settings edit under `ng serve`, and 188's L1-L3 rerun on this build.
- **B, measured in Sass, untested at runtime: a settings fingerprint as the cache key for 189's unhashed bundles.** A djb2-style checksum over `meta.inspect` of all 489 settings, emitted into the library's `global.scss` as a 65-byte rule, changes the hashed `styles-*.css` name with any setting (three settings files gave three keys; about 150-220 ms per compile), and the library appends it as `?v=` to each family URL it already derives from that link. Smallest test: 189's `production` and `cachebust` builds with the suffix, then a reload after a swap.
- **C, measured in three engines: prune Beasties' critical copy through CSSOM instead of `data-beasties-skip`.** Beasties keeps the family rules in a `CSSLayerBlockRule` named `nfs.<family>`; deleting it at unload drops the probe element from 44px to 0px, keeps the layer statement first, and lets the family re-load; family links can then stay non-render-blocking under critical-CSS inlining. Smallest test: 189's `noskip` build with the pruning in `#unload`, plus 190's render-blocking measurement.
- **D, untested: a paint gate (`[data-nfs-pending] { visibility: hidden }` in the global layer) and an `(animate.enter)` host listener that waits for the sheet**, for any fetch-on-construct loader: unstyled frames become invisible frames and the animation plays after the fetch instead of being skipped; focus and CLS during the gap are open. Smallest test: 189's `/client-defer` and `/enter` at 300 ms with an axe run during the window.
- **E, untested: the plugin's `file` loader**, a hashed CSS asset URL inserted as a `<link>`, for consumers who want CSS files and shared HTTP caching; URL handling under `deployUrl`, `baseHref`, and i18n is open. **F, read from source: `RendererFactory2.createRenderer(dummyElement, { encapsulation: None, styles })`** gives Angular's counted, serialised `<style>` without any component (`dom_renderer.ts:193-217`, `:677`), but the leave-animation guard (`:683`) returns with it. **G, untested: a grace period or `link.disabled` against churn**, for families that open and close often.
- **Critique, main points.** Every leave-animation failure has one cause, letting `SharedStylesHost` own family CSS, and every passing public answer is a way of not doing that; 184's carrier component exists only to get Sass compiled and drags Angular's count along. 189's `<link>` flash is structural (the fetch starts at construct), so preloading every family is the eager variant under another name, and `data-beasties-skip` trades a leak for render-blocking links. 188's `own-style` is the right runtime with the wrong build: with no component there is nothing to intercept and both undocumented dependencies disappear. gsd-pi has the right ownership instinct and gives up the settings; 191's 25% invariant share shows why a defaults sheet cannot be rescued.
- **Critique, further.** "Family = export mixin" is the right unit for compiling and the wrong one for loading; with A, companions (menu before dropdown-menu) are static imports the bundler enforces, and 185's point 8 could define the unit as the CSS modules an entry point's directives import. The unload machinery (a `MutationObserver` on `document`, the hold scan, Beasties handling) is measured for correctness and never for cost or churn. Requirement 1 is stricter than ADR 0040's generated Variant declaration file. The `@layer` fix lets any third-party unlayered stylesheet beat Foundation regardless of source order, which no ticket states. Unmeasured for every candidate: dev server and HMR, prerendering, zone.js, CSP, several applications per page, and route navigation between pages sharing a family.

## Orchestrator note, 2026-10-01

Checked against `@angular/build` 22.2.0 and `@nx/angular` 23.2.1 in `D:/tmp/nfs-proto-lazy-family-styles/node_modules`: proposal A and 189's esbuild-plugin variant both depend on an extension point Angular does not support. `buildApplication` is marked `@experimental`, and its doc comment says "Usage of the `extensions` parameter is NOT supported and may cause unexpected build output or build failures" (`src/builders/application/index.d.ts:16-21`). Nx's `plugins` option passes plugins through that parameter (`dist/src/executors/application/application.impl.js:29-31`, `buildApplication(..., { codePlugins: plugins })`). So "public" in A's Angular CLI route means exported, not supported. On Nx, Nx carries that risk for its users; a library builder would carry it itself. The findings file does not mention it.
