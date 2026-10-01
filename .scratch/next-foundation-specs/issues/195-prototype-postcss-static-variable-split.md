# 195. Prototype: PostCSS integration and the static and setting-dependent split in a real Angular build

Type: prototype
Status: resolved
Blocked by: 191
Labels: wayfinder:prototype
Map: ../map.md

## Question

[Research: splitting Foundation's family CSS into structure and theme](191-research-structure-theme-split.md) proposed a split by compile diffing. The library ships the declarations that no setting changes, and a PostCSS plugin removes them from the consumer's compile. It was measured in Node only, and its cascade was checked for two families in Chromium. Does it work in a real Angular 22.2 build? What else could a PostCSS integration do for loading family styles? And can a consumer keep Tailwind with a `postcss.config.json`?

## User questions and instructions, 2026-10-01

> 11. A PostCSS integration, is that an option we have explored?
> 12. What about a split between static styles and styles that depend on SCSS variables?
> 15. If we could add or reference a recipe/generator for adding Tailwind support to the PostCSS config equivalent to Angular's automatic Tailwind setup, that would be acceptable.
> 16. Verify this unless you have already done so.

Item 16 refers to 191's open points: "the plugin hasn't run in a real Angular build, and the cascade order was checked for Button and Dropdown Menu in Chromium only." Item 12 is the split 191 measured: "static" is 191's invariant part.

## How to work it

Work in a copy of a prior workspace under `D:/tmp/nfs-proto-195`.

1. Run 191's filter as a PostCSS plugin through `postcss.config.json` in production, SSR, and `ng serve` builds. Measure the output size, the computed styles against Foundation's single compile for every first-milestone family in Chromium, Firefox, and WebKit (not two families in one engine), and the cascade order with the static part loaded as a library-owned `<style>`.
2. Survey other PostCSS roles for this question, with sources: splitting a family's CSS by layer, writing a manifest the library reads, or rewriting URLs and hashes for the `<link>` loader. Build any that is cheap.
3. Tailwind: what `@angular/build` 22.2.0 does when a Tailwind config exists and no PostCSS config does (`src/utils/postcss-configuration.js` and its caller), and a `postcss.config.json` recipe or generator that restores that setup beside the filter. Verify it with a Tailwind v4 class in the same build.

Capture the decisive files under `prototypes/postcss-split/`, and append an `## Answer`. Decide nothing; [Decide: how first-milestone directives load and unload their family styles](185-decide-lazy-family-styles.md) chooses.

## Answer

Resolved 2026-10-01 (Opus 5.5). Prototype: [prototypes/postcss-split/README.md](../prototypes/postcss-split/README.md). The workspace is a copy of 184's under `D:/tmp/nfs-proto-195` (Angular 22.2.0 with SSR, Nx 23.2.1, Tailwind 4.3.3), measured on 2,386 elements of every first-milestone family's Foundation doc markup in Chromium 153, Firefox 155, and WebKit 26.6 at 1280px and 375px. The library's invariant sheets ship from a real ng-packagr library. Nothing is decided here; [Decide: how first-milestone directives load and unload their family styles](185-decide-lazy-family-styles.md) chooses.

- **Item 16, the filter in a real build: works.** Loaded from `postcss.config.json` in the production SSR build and under `ng serve` (HMR included), it removed 626 of 626 matching declarations, cut the 35 theme carriers from 70,326 to 55,230 bytes (gzip 17,626 to 12,792), found family sheets by their `@layer nfs.<family>.theme` name, and left the consumer's sheets, Tailwind, and the library's precompiled styles alone. Filter on or off gives the same computed styles. It also filters 189's non-injected `bundleName` sheets.
- **Item 12, the static and setting-dependent split: the cascade does not match.** With 191's theme-then-structure sublayers, about 320 property differences at 1280px (294 at 375px) separate it from Foundation's single compile, the same in all three engines, in every insertion order, hydrated or server HTML only. About 250 come from the split. A later sublayer beats a more specific earlier rule (`label { margin: 0 }` over `[type=checkbox] + label`). The reverse order fails the hollow buttons. One shared layer still leaves about 45 differences from source-order pairs (`.menu.vertical` against `.menu.medium-horizontal`).
- **Found on the way, independent of the split.** With all 35 families in 184's per-family layers, four cross-family rule pairs differ from the single compile (61-66 properties). Sass writes reveal's extended `%reveal-centered` rule outside the `@layer` block, where it beats every layer; the prototype's plugin moves it back in.
- **Item 11, other PostCSS roles.** `@angular/build` runs the plugins on every stylesheet after Sass with the file path, and keeps one output per input and only `dependency` messages (`stylesheet-plugin-factory.js:199`, `:249-257`, `:286-300`). So a plugin can filter or repair a sheet, as built here. It cannot split one compile into family files, put a manifest into the build output, or see the hashed names the `<link>` loader would need (and `bundleName` sheets are unhashed anyway).
- **Item 15, Tailwind: recipe and generator verified.** Angular's automatic setup is Tailwind v3 only, and it is skipped whenever a PostCSS file exists (`options.js:128-133`, `stylesheet-plugin-factory.js:166-174`). `ng add tailwindcss` (`@schematics/angular:tailwind`, also runnable through `nx g`) merges `@tailwindcss/postcss` into an existing `postcss.config.json`. The merged file built a v4 class (`p-[13px]`, emerald text, wavy underline) beside the filter in all three engines. Tailwind's layers come after the `nfs` layers, so utilities named like Foundation classes win (`.sticky`, Chromium). The preflight was not measured.
- **Open.** A filter that keeps the declarations involved in order conflicts, Tailwind v3 through a PostCSS file, states beyond hover and focus, other settings files, and later Foundation releases.
