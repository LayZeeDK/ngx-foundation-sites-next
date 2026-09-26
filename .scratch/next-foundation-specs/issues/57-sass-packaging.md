# 57. Sass packaging for the new library

Type: grilling
Status: resolved
Blocked by: 14
Labels: wayfinder:grilling
Map: ../map.md

## Question

How does the new library ship its Sass next to the consumer's Foundation Sass: how are the per-plugin `_nfs-<plugin>.scss` partials and the `_nfs-motion.scss` keyframe classes packaged and imported, is `foundation-sites` a peer dependency and at which range, and how are `--nfs-breakpoint-*` custom properties emitted from Foundation's `$breakpoints` so the breakpoint token and the Sass stay in sync?

Read first: `building-blocks.md` (the Sass and theming decision and the animation mechanics), `adr/0003-animation-mechanics.md`, `adr/0005-breakpoint-source-of-truth.md`, `research/foundation-utilities-conventions.md` (the breakpoint handshake), and `research/tooling-baseline.md`. Check how Angular Material and CDK ship Sass in `d:/projects/github/angular/components` (package exports for `_index.scss`, `@use` entry points) for the packaging mechanics.

Ownership (per audit 0002 finding M2): this ticket owns how the library Sass emits the `--nfs-breakpoint-*` custom properties from Foundation's `$breakpoints`; the Breakpoint service spec owns the `nfsBreakpointsToken` shape and the dev-mode drift check that compares the token with those properties, and it waits on this ticket.

Run `/grill-with-docs` (self-grilling, both sides). Record the decision log under `## Answer`, write an ADR under `adr/` if the domain-modeling bar is met, and state what every plugin spec's Further Notes must say about its Sass. Runtime theming as a contract is already out of scope per the building-blocks decision.

## Answer

Resolved 2026-09-26 by self-grilling (AFK). Sources: the local clones; the published tarballs `@angular/material@22.2.0`, `@angular/cdk@22.2.0`, `foundation-sites@6.9.0`, `ng-packagr@22.2.1`, `@angular/build@22.2.0`, and `vite@8.3.1` (packed into a scratchpad); and two Dart Sass 1.104.1 compile experiments (Evidence below). Midway through, the coordinator restated a standing user rule: the library reuses Foundation's SCSS and does not re-implement it. That rule reversed the first draft, a `@use` module that received values as arguments; decision 1 records the rule and decision 5 the reversal.

### Gist

The library ships `_index.scss` at the package root. It is reached through a `sass` condition on the `.` export (the shape `@angular/material` and `@angular/cdk` publish) and copied into the package by ng-packagr `assets`. The consumer `@import`s it after Foundation, into the same compile, so every library mixin reads the consumer's own Foundation settings and calls Foundation's own mixins and functions. The library never imports Foundation itself, and never emits a copy of a Foundation rule. Importing it emits nothing; a guard stops the compile with a clear message when Foundation was not imported first. It defines global mixins in Foundation's style:

- `nfs-<plugin>` for each plugin with documented custom CSS;
- `nfs-motion` for the `nfs-*` keyframe Motion classes and their reduced-motion override;
- `nfs-breakpoint-properties`, which writes `--nfs-breakpoint-<name>: <px>` on `:root` from the consumer's `$breakpoints` through Foundation's `-zf-bp-to-em`.

No library component or directive carries `styles`. `foundation-sites` is a required peer dependency at `^6.9.0`. ADR: `adr/0012-sass-packaging.md`, for the orchestrator to number.

Consumer stylesheet (Angular CLI, Foundation loaded as its docs describe):

```scss
@import 'settings'; // the consumer's Foundation settings, $breakpoints included
@import 'foundation-sites/scss/foundation';
@import 'ngx-foundation-sites'; // after Foundation; imports no Foundation code itself

@include foundation-global-styles;
@include foundation-accordion;
@include foundation-reveal;

@include nfs-breakpoint-properties;
@include nfs-motion;
@include nfs-accordion;
@include nfs-reveal;
```

The library's breakpoint emission as compiled in the experiment (the one piece of Sass this ticket owns):

```scss
@use 'sass:math';

/// Emits --nfs-breakpoint-<name> in px on :root from Foundation's map,
/// converting with Foundation's own -zf-bp-to-em (media-query em is 16px).
@mixin nfs-breakpoint-properties($map: $breakpoints) {
  :root {
    @each $name, $value in $map {
      --nfs-breakpoint-#{$name}: #{math.div(-zf-bp-to-em($value), 1em) * 16px};
    }
  }
}
```

### Decision log

Round 1 (no prerequisites).

1. Q: What is the library's Sass allowed to contain? A: Only what Foundation cannot give: the documented custom rules each spec cannot get from Foundation's CSS, and the `nfs-*` keyframe Motion classes. Everything else is reused from the consumer's Foundation compile: settings variables, export mixins (`foundation-accordion`, ...), helper mixins and functions (`breakpoint()`, `-zf-bp-to-em`). No copy of a Foundation rule, no second set of defaults, no second breakpoint map. Where a library rule needs a Foundation value, it reads the consumer's setting or calls Foundation's mixin; where a Foundation rule needs adjusting, the library overrides only the declaration that differs. Source: the user's standing rule, restated by the coordinator on 2026-09-26; AGENTS.md Styling Guidelines ("Prefer Foundation's existing styles over custom CSS ... leverage Foundation's battle-tested CSS rather than duplicating or overriding it"; "Only add custom CSS when necessary"); map Domain ("keeps Foundation's Sass and CSS class contract"); `building-blocks.md` 1.13 ("Foundation Sass is a consumer-side dependency compiled from the consumer's settings").
2. Q: What Sass does the consumer compile, and how? A: Foundation 6.9 as its docs describe: `@import 'settings'` (whose first line imports `util/util`), then `@import 'foundation'`, then the export mixins. Foundation is `@import`-based throughout; its only `@use` rules load `sass:math` and `sass:color`. Source: `foundation-sites/scss/foundation.scss:9-77`; `docs/pages/sass.md` "Compiling Manually", "Adjusting CSS Output", "The Settings File"; `rg '^@use' scss` (5 files, all `sass:` built-ins).

Round 2 (depends on 1-2).

3. Q: Can a `@use`d library module reuse the consumer's Foundation? A: No. A mixin in a module resolves names in its own module scope. The fixture that read `$breakpoints` from a module failed with "Undefined variable" even though the consumer had imported Foundation. `@use ... with (...)` cannot help, because `@use` must precede every `@import` ("@use rules must be written before any other rules" when reversed), so the settings do not exist yet. Source: experiment A fixtures `styles-global`, `styles-order`.
4. Q: Can the library load Foundation itself (`@use 'foundation-sites/scss/foundation'`)? A: It compiles (about 200 ms, and it emits Foundation's banner comment), but it creates a second Foundation with default settings. `breakpoint(medium)` there would use Foundation's default map, not the consumer's, which breaks decision 1 ("same settings, same breakpoints"). It would also evaluate Foundation twice per compile. Rejected. Source: experiment A fixtures `styles-read`, `styles-module2`.
5. Q: Then how does library Sass reach the consumer's Foundation? A: By being `@import`ed into the same compile after Foundation. Imported files share the importer's global scope, so library mixins see `$breakpoints`, `$reveal-overlay-background`, `breakpoint()`, and `-zf-bp-to-em` exactly as Foundation's own export mixins do. Experiment B: with customised `$breakpoints` (em, px, rem mixed), `$reveal-overlay-background`, and `$reveal-max-width`, a sample `nfs-reveal` rule used the consumer's colour, `breakpoint(medium)` produced the consumer's `min-width: 48em`, and `nfs-breakpoint-properties` emitted the consumer's map. Rejected alternative, and this ticket's first draft: a `@use` module whose mixins take Foundation values as arguments (`nfs.breakpoint-properties($breakpoints)`, `nfs.reveal($reveal-overlay-background: ...)`). It compiled (experiment A), but it re-implements `-zf-bp-to-em` and `breakpoint()`, copies Foundation's setting defaults into parameter defaults, and makes consumers pass every customised setting by hand, so it fails decision 1. The cost of the chosen design is that the library shares `@import`'s deprecation (decision 12) and Foundation's global namespace (decision 9); Foundation already imposes both on every consumer.
6. Q: Is `foundation-sites` a peer dependency, and at which range? A: A required peer at `^6.9.0`. The library's Sass calls Foundation's functions and reads its settings at compile time, and the directives' class contract was researched against 6.9. `^` follows semver for minors; 6.9.0 (2024-09-27) is the latest release, with no 6.10 or 7 on the registry. Side effect: `foundation-sites@6.9.0` declares `jquery >=3.6.0`, `motion-ui latest`, and `what-input >=5.2.10` as required peers with no `peerDependenciesMeta`, so npm 7 and later installs them too (observed with npm 11.16.0). That happens whenever anyone installs Foundation; the library never imports or bundles them, so "Foundation's JavaScript is never a dependency" (map, Domain) holds at runtime. `sass` is not a peer: the consumer's builder brings it (`@angular/build` 22.2.0 depends on `sass` 1.104.1 exactly). `foundation-sites` 6.9.0 is a devDependency of the library repo, and ng-packagr strips devDependencies from the published package. Rejected: optional peer or no peer (the Sass needs the package at compile time). Source: tarball `package.json` files; `npm view foundation-sites time`; ng-packagr `write-package.transform.js` (`devDependencies` removed, non-peer dependency check).

Round 3 (depends on 5-6).

7. Q: How is the Sass exposed in the package? A: As Material and CDK do it: the library's source `package.json` declares `"exports": { ".": { "sass": "./_index.scss" } }`. ng-packagr merges that entry and keeps custom conditions ahead of the ones it generates, producing `{ "sass", "types", "default" }` in that order. That matches the published `@angular/material@22.2.0` and `@angular/cdk@22.2.0` `.` entries. Order matters because resolvers take the first matching condition. Every consumer toolchain honours `sass`, for `@import` and `@use` alike: `@angular/build` 22.2.0 resolves stylesheet URLs with conditions `['style', 'sass', ...]` (`src/tools/esbuild/stylesheets/bundle-options.js:58-59`, used by the importer in `sass-language.js`); Vite 8.3.1's Sass resolver uses `conditions: ['sass', 'style', ...]` (`dist/node/chunks/node.js`); Dart Sass's `NodePackageImporter` resolved `@import 'pkg:ngx-foundation-sites'` in experiment B. A plain load path also resolves the directory's `_index.scss` (fixture `imp-bare`). Source: ng-packagr `src/lib/utils/package-json.js` `generatePackageExports`; the two Angular tarballs.
8. Q: One Sass entry point or one per TypeScript secondary entry point? A: One. Importing it emits no CSS (fixture `imp-empty`: output identical to Foundation alone, 108 bytes), so per-plugin opt-in is which `nfs-*` mixins the consumer includes, as with Foundation's export mixins. Material also publishes Sass on `.` only (plus `./theming`). The TypeScript secondary entry points (`building-blocks.md` 1.3) exist so `@defer` can split per plugin, which does not apply to a global stylesheet.
9. Q: How are files and members named? A: Files: `_index.scss` at the library project root, next to `package.json` and `ng-package.json`, with `_breakpoints.scss` and `_motion.scss` beside it. Each plugin's library CSS sits in its entry-point folder as `<plugin>/_<plugin>.scss` (`accordion/_accordion.scss`, `off-canvas/_off-canvas.scss`), the name `building-blocks.md` 1.3 already uses, and `_index.scss` `@import`s each one. Members live in the global namespace they share with Foundation, so they follow Foundation's convention: public mixins `nfs-<plugin>` (the plugin's kebab-case folder name, parallel to `foundation-<component>`), `nfs-motion`, and `nfs-breakpoint-properties`; internal helpers `-nfs-*` (parallel to `-zf-*`). Built-ins come through `@use 'sass:math'` and the like, which an imported partial may use (experiment B), never as global built-ins and never through Sass `if()`, so library files add no deprecation warnings (experiment B with `quietDeps: false`: none from library files; the first draft tripped `if-function` twice in experiment A). The `_nfs-<plugin>.scss` and `_nfs-motion.scss` names in `building-blocks.md` 1.6, 1.13, and Part 3 predate this ticket; specs name the mixin (`nfs-accordion`), not the file.
10. Q: What does ng-packagr do with `.scss` in a secondary entry point? A: Two things only. (a) A component's `styleUrl`/`styles` is compiled at library build time, with the library's own `styleIncludePaths`/`sass` options, and inlined into the compiled component, where the consumer's settings can never reach it. (b) A loose partial is not shipped unless the primary `ng-package.json` lists it in `assets`. The secondary entry-point schema has only `lib` (`entryFile`, `flatModuleFile`, `cssUrl`, `styleIncludePaths`, `sass`), and `copyAssets` runs for the primary entry point only. A string asset is a glob relative to the project root, copied with its relative path kept, so a single `assets` array lists every partial: `["_index.scss", "_breakpoints.scss", "_motion.scss", "*/_*.scss"]`. These globs are illustrative; decision 17's build check is what proves them. Source: `ng-packagr@22.2.1` `ng-entrypoint.schema.json`, `ng-package.schema.json` (`assets`), `src/lib/ng-package/entry-point/write-package.transform.js` (`copyAssets`, string-glob branch).
11. Q: May library components (the `.accordion-content` wrapper, the Tooltip tip, ResponsiveAccordionTabs) carry CSS as component `styles`, so a forgotten include cannot break them? A: No. Such styles are compiled at library build time (decision 10a), where the consumer's settings do not exist. Most library CSS sits on directive hosts (`dialog.reveal`, `::backdrop`, `.accordion-title` buttons), which cannot carry styles anyway. And a second channel would compete with Foundation's global CSS on source order and specificity: the wrapper's `display: grid` must beat Foundation's `.accordion-content { display: none }` (`scss/components/_accordion.scss:134`), which is safe only when both sit in one stylesheet in a known order. The cost is that a forgotten include breaks the plugin visibly, so every spec names that symptom. No dev-mode presence check: Material removed its theme-presence check (no marker left in the 22.2.x clone), and the breakpoint drift check covers the one include whose absence could go unnoticed.
12. Q: Order, guard, and deprecation output? A: Order: `@import 'ngx-foundation-sites'` after Foundation (or, for a consumer on Foundation's compiled CSS, after `@import 'foundation-sites/scss/util/util'`, which emits nothing: fixture `imp-util`). Each `nfs-<plugin>` include comes after its `foundation-<component>` include, because library rules override Foundation's at equal specificity through source order (the `display` example above). `nfs-breakpoint-properties` and `nfs-motion` have no ordering constraint. Guard: `_index.scss` starts with `@if not global-variable-exists('breakpoints') or not mixin-exists('breakpoint') { @error ... }`. It fires for Foundation-after-library (fixture `imp-order`) and for `@use 'ngx-foundation-sites'` (fixture `imp-use`), which is not supported. Deprecations: the consumer sees one `import` warning per own `@import` line, the library's included. Everything inside Foundation and the library is silenced by `@angular/build`'s `quietDeps: true` (`sass-language.js:170`). Consumers may add `"stylePreprocessorOptions": { "sass": { "silenceDeprecations": ["import"] } }` (application builder schema).

Round 4 (depends on 5, 9).

13. Q: How are the `--nfs-breakpoint-*` properties emitted: a mixin the consumer includes, an automatic `:root` rule, or both? A: A mixin only, `@include nfs-breakpoint-properties;`. Importing the library must emit nothing (decision 8, and Foundation's export-mixin model), and an automatic rule would print on every import. Output: one `--nfs-breakpoint-<name>` per key of `$breakpoints`, in map order, on `:root` (`building-blocks.md` 1.7), in px, the unit of `nfsBreakpointsToken` (ADR 0005). The value is computed with Foundation's own `-zf-bp-to-em`, the conversion Foundation's `breakpoint()` uses for its media queries (px and unitless as px, rem as em, all 16px-based: `scss/util/_unit.scss:62-70`), times 16px. The properties therefore equal Foundation's media queries by construction. Experiment B: `(small: 0, medium: 48em, large: 1100px, xlarge: 75rem, xxlarge: 90em)` emits `0px`, `768px`, `1100px`, `1200px`, `1440px`. `math.div(..., 1em)` is used because Foundation's `strip-unit` turns zero into `-0px`. `-zf-bp-to-em` is private by Foundation's convention (`@access private`); the peer range and the Sass test (decision 17) guard that dependency. `$breakpoints-hidpi` is not emitted: no token field mirrors it, and Interchange's `retina` query is fixed in JavaScript (`research/foundation-utilities-conventions.md` 3.1, 3.3).
14. Q: Does the mixin take the map as an argument? A: An optional `$map` parameter defaulting to the global `$breakpoints`, as Foundation writes its own mixins (`@mixin reveal-overlay($background: $reveal-overlay-background)`, `scss/components/_reveal.scss:56`). The default is the map the consumer actually compiles Foundation with, so a consumer who customised `$breakpoints` gets matching properties with no extra step. If the token is then left at its defaults, the drift check sees the difference.
15. Q: What does a consumer with customised breakpoints do? A: Two steps beyond Foundation's own. First, set `$breakpoints` in the Foundation settings (Foundation's step, unchanged); `@include nfs-breakpoint-properties;` is the same line for every consumer. Second, provide `nfsBreakpointsToken` with the same values in px (provider shape owned by the [Spec: Breakpoint service (shared utility)](53-spec-breakpoint-service.md)). The dev-mode drift check compares the two. Rejected: generating TypeScript from the Sass map at build time (Sass cannot write files, so a custom consumer build step would be needed), and reading the properties as the source of truth (ADR 0005: no computed style on the server). Handed to the Breakpoint service spec: behaviour when the properties are absent because the include is missing (recommended default: one dev-mode warning naming the include), and the fact that unregistered custom properties compute to their specified text (`640px`).

Round 5 (depends on 1, 9; the class set is `building-blocks.md` 1.6).

16. Q: How do the `nfs-*` keyframe Motion classes and the reduced-motion rules ship? A: `@include nfs-motion($duration: 500ms, $timing-function: linear);`. The parameters are library-owned, because Foundation has no motion settings. Their defaults follow Motion UI's default speed and easing (`motion-ui/src/_settings.scss` `$motion-ui-speeds`, `$motion-ui-easings`, read from the installed `motion-ui@2.0.8`), and Motion UI stays a non-dependency. For each class in `building-blocks.md` 1.6 rule 4, the mixin emits `@keyframes nfs-<name>` and `.nfs-<name> { animation: nfs-<name> $duration $timing-function both; }`, plus one `@media (prefers-reduced-motion: reduce)` block setting `animation-duration: 1ms` on those classes (1.6 rule 5). One include covers the whole set of a dozen classes. A spec that needs a class outside the set adds it to `nfs-motion` and says so. Motion UI transition classes stay unsupported (1.6 rule 4; the [Prototype: `animate.enter` and `animate.leave` with Motion UI transition classes](47-prototype-motion-ui-animate-enter.md) owns the confirmation).
17. Q: Who emits the reduced-motion override for animations outside the Motion classes (the accordion grid-row transition, and Foundation's own `.off-canvas` and `.drilldown` transitions, which directives await)? A: The `nfs-<plugin>` mixin that adds or awaits the animation, scoped to that plugin's selectors, setting only `transition-duration`/`animation-duration` to `1ms`. That is an override of the one differing declaration, not a copy of Foundation's rule (decision 1). The value is `1ms`, not `0`, because a zero-duration transition fires no `transitionend`, and 1.6 rule 5 needs the completion event. Rejected: a universal `*, ::before, ::after` rule, which would reach into the consumer's own CSS.
18. Q: How are the packaging and the reuse kept honest? A: Two checks in the library repo, both node-level Vitest (the map's seam). (a) Compile fixture stylesheets with Dart Sass against the source `_index.scss` and Foundation 6.9 from devDependencies, and assert: the `--nfs-breakpoint-*` output for Foundation's default map and for a customised em/rem/px map; that importing emits nothing; that the guard fires when Foundation is missing; and that each `nfs-<plugin>` output follows a changed Foundation setting (proof that it reads the setting rather than a copy). (b) After the library build, compile one consumer fixture against the built package through the `sass` export condition, which proves decision 10's `assets` globs and decision 7's `exports` merge.
19. Q: A prebuilt CSS file (like `@angular/cdk/overlay-prebuilt.css`) or an `nfs-everything` mixin (like `foundation-everything`)? A: Neither in the first release. Every Angular CLI app already compiles Sass (`@angular/build` depends on `sass`), a prebuilt file would freeze Foundation's default settings (against decision 1), and Foundation's docs list includes one by one. Either can be added later without breaking anything.

### Evidence: compile experiments

Scratchpad packages mocked the published layout (`package.json` exports `.` -> `{ sass, types, default }`), compiled with `sass@1.104.1` (`sass.compile`, `NodePackageImporter`, `loadPaths: ['node_modules']`, `quietDeps: true` unless stated) against `foundation-sites@6.9.0`.

Experiment A, a `@use` module whose mixins take arguments (the rejected first draft):

| Fixture | Result |
| --- | --- |
| `styles-ok`: `@use 'pkg:ngx-foundation-sites' as nfs;`, custom `$breakpoints`, `@import` Foundation, mixins with arguments | compiles |
| `styles-global`: module mixin reads `$breakpoints` without an argument | Error: Undefined variable |
| `styles-order`: `@use` after `@import` | Error: @use rules must be written before any other rules |
| `styles-read`, `styles-module2`: `@use 'foundation-sites/scss/foundation' as zf` | compiles (about 200 ms, banner comment); a second Foundation with default settings |
| library compiled directly, `quietDeps: false` | 2 `if-function` warnings until Sass `if()` was removed |

Experiment B, the chosen design (`_index.scss` with the guard, `@import`ing `_breakpoints.scss`, `_motion.scss`, `reveal/_reveal.scss`; the sample `nfs-reveal` reads `$reveal-overlay-background` and `$reveal-max-width` and calls `breakpoint(medium)`):

| Fixture | Result |
| --- | --- |
| `imp-ok`: custom settings, `@import` Foundation, `@import 'pkg:ngx-foundation-sites'`, all mixins | compiles; custom map emitted in px (`0px`, `768px`, `1100px`, `1200px`, `1440px`); backdrop uses the consumer's colour; `breakpoint(medium)` gives `min-width: 48em`; warnings: the two consumer `@import` lines only |
| `imp-ok` with `quietDeps: false` | no warning from any library file |
| `imp-bare`: `@import 'ngx-foundation-sites'` through a load path | compiles; default map emitted |
| `imp-util`: `@import 'foundation-sites/scss/util/util'` only, then the library | compiles; default map emitted (the compiled-CSS consumer path) |
| `imp-empty` vs `imp-foundation-only` | identical output (108 bytes): importing the library emits nothing |
| `imp-order`: library before Foundation | guard error: "@import Foundation (or its util/util) before ngx-foundation-sites." |
| `imp-use`: `@use 'ngx-foundation-sites'` | same guard error |

### What every plugin spec's Further Notes must say about its Sass

Each spec carries a "Sass" subsection under Further Notes with this content (Button and the shared utilities included):

> Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This plugin relies on Foundation's export mixins `<list, for example foundation-accordion>`. Its documented custom CSS is the `nfs-<plugin>` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `<the Foundation export mixin>`. The subsection lists: (1) every rule the mixin emits, with its selector and the reason Foundation's CSS cannot provide it (AGENTS.md Styling Guidelines); where it adjusts a Foundation rule, only the declarations that differ; (2) the Foundation settings, mixins, and functions each rule reuses (`$reveal-overlay-background`, `breakpoint()`), read from the consumer's compile and never copied as literal values or parameter defaults; a mixin parameter exists only for a value Foundation has no setting for, and the spec names it; (3) any `--nfs-<plugin>-*` property the directive writes and the mixin reads (an implementation channel, not theming, `building-blocks.md` 1.13); (4) the Motion classes from `nfs-motion` it uses by default, and the `prefers-reduced-motion` override its mixin emits for each transition or animation it adds or awaits; (5) what visibly breaks when the include is missing. A plugin with no custom CSS says "No library CSS; there is no `nfs-<plugin>` mixin" and still lists (4) when it uses Motion classes. No directive or component declares `styles` or `styleUrl`. Breakpoint-gated behaviour reads `nfsBreakpointsToken`, whose CSS mirror is `nfs-breakpoint-properties`, never a per-plugin rule.

### OPEN FOR HUMAN

1. What happens when Dart Sass 3.0 removes `@import`. Foundation 6.9 and the library's Sass (which follows Foundation into the same compile, decision 5) will then stop compiling together. Sources cannot settle the response: Sass gives no 3.0 date beyond "no sooner than two years after Dart Sass 1.80.0" (released 2024-10-17, so October 2026 at the earliest; sass-lang.com Breaking Change: `@import`); the registry shows no Foundation release after 6.9.0; and `@angular/build` 22.2.0 pins Dart Sass 1.104.1, so Angular CLI consumers stay on 1.x until Angular moves. The options are a user call: wait for a module-based Foundation (the library then switches to `@use` of the same Foundation module URLs, and Sass's load-once module semantics would share the consumer's configured instance), document pinning Dart Sass 1.x, or maintain a module-system port of Foundation's Sass. Default applied here: nothing now; the pinned Angular toolchain carries consumers.

### Proposed glossary terms

**Export mixin**:
A Foundation Sass mixin that prints one component's CSS (`foundation-accordion`, `foundation-reveal`), included by the consumer and compiled from the consumer's settings.
_Avoid_: Foundation styles, component mixin

**Library mixin**:
A mixin of the library's Sass (`nfs-accordion`, `nfs-motion`) that prints only the documented custom CSS Foundation cannot provide, reusing the consumer's Foundation settings and mixins in the same compile; included after the matching Export mixin.
_Avoid_: `_nfs-<plugin>.scss`, custom stylesheet, theme mixin

**Breakpoint properties**:
The `--nfs-breakpoint-<name>` custom properties on `:root`, in px, that mirror the Sass `$breakpoints` the consumer compiles Foundation with, and that the Breakpoint service's drift check compares with the Breakpoint map.
_Avoid_: breakpoint variables, CSS breakpoints, breakpoint tokens

### Proposed ADR

`adr/0012-sass-packaging.md`: "The library's Sass is imported after the consumer's Foundation and reuses its settings, mixins, and functions instead of loading or copying Foundation". It meets the bar. Hard to reverse: it is the public Sass API consumers write into their stylesheets. Surprising: a reader would expect a `@use` module like Material's. A real trade-off: the options it records.

### Proposed shared-file changes (for the orchestrator)

- `building-blocks.md` 1.6 rules 4 and 5: "the library ships `_nfs-motion.scss`" -> "the library's `nfs-motion` mixin (Sass packaging)". 1.13: replace "`_nfs-<plugin>.scss`" with "the plugin's `nfs-<plugin>` Library mixin"; replace the last sentence ("How the new repo packages ... is a repo-setup ticket (Part 4), not a spec") with a link to [Sass packaging for the new library](57-sass-packaging.md) and the new ADR. Part 3 "Motion" bullet: "`_nfs-motion.scss` is a stylesheet, listed in the repo-setup ticket" -> "the `nfs-motion` mixin, decided in Sass packaging". 1.7 bullet 1: "the library Sass also emits them as `--nfs-breakpoint-<name>` custom properties on `:root`" -> "the consumer's `@include nfs-breakpoint-properties;` emits them from its own `$breakpoints` as px custom properties on `:root`".
- `CONTEXT.md`: add the three glossary terms above (Export mixin under "Foundation side"; Library mixin and Breakpoint properties under "Angular side").
- `map.md` Decisions so far: one line for this ticket.
- [Spec: Breakpoint service (shared utility)](53-spec-breakpoint-service.md): its Sass-sync question is answered by decisions 13-15; the spec keeps the token shape, the drift check, and the absent-properties behaviour.
- [Consistency review and bundle index](36-consistency-review.md): add "every spec has the Sass subsection this ticket prescribes" to its checks.
- ADR 0005 needs no change ("the library Sass emits the same values" stays true: the library mixin emits them).

### Orchestrator note, 2026-09-26

Per [Spec: Slider](32-spec-slider.md) (decision 40): `foundation-range-input` is not included in `foundation-everything` (`foundation-sites/scss/foundation.scss`); a consumer using the Slider must `@include foundation-range-input;` explicitly.

### Triage (auto-trap quadrant), 2026-09-26

Rule: [map](../map.md), Orchestration rules, "Triage of human-only items". Only HIGH impact with NOT-HIGH confidence stays OPEN FOR HUMAN; upstream filings and assistive-technology checks stay human-only by kind.

1. What happens when Dart Sass 3.0 removes `@import`. Applied: nothing now; the pinned Angular toolchain carries consumers.
   - Impact: not HIGH for the item as decided. Deferring freezes nothing new: the packaging model (`@import` after Foundation) was decided separately in ADR 0012, and every later response (switch to `@use` of a module-based Foundation, document pinning Dart Sass 1.x, or maintain a module port) stays available when the facts arrive.
   - Confidence: HIGH. `@angular/build` 22.2.0 pins Dart Sass 1.104.1, so Angular CLI consumers stay on 1.x until Angular moves; Sass gives no 3.0 date beyond "no sooner than two years after 1.80.0" (October 2026 at the earliest); no Foundation release after 6.9.0 exists to switch to. Choosing a response now would be a bare guess.
   - Outcome: DECIDED: no action now; revisit when an Angular release moves to Dart Sass 3 or Foundation publishes a module-based release.
