# Prototype: PostCSS integration and the static and setting-dependent split

Ticket: [Prototype: PostCSS integration and the static and setting-dependent split in a real Angular build](../../issues/195-prototype-postcss-static-variable-split.md).
Builds on [research/structure-theme-split.md](../../research/structure-theme-split.md) (ticket 191: the invariant list, the filter, the theme-then-structure order) and [prototypes/lazy-family-styles/README.md](../lazy-family-styles/README.md) (ticket 184: per-family carriers, `@layer`). Model: Opus 5.5. Resolved 2026-10-01. This prototype decides nothing.

## Question

The ticket's three points, from the user's items 11, 12, 15, and 16:

1. Does 191's filter work in a real Angular 22.2 build (production, SSR, `ng serve`)? How much does it cut, and do the computed styles of every first-milestone family match Foundation's single compile in Chromium, Firefox, and WebKit with the static ("invariant") part loaded as a library-owned `<style>`?
2. What else could a PostCSS integration do for loading family styles?
3. What does `@angular/build` 22.2.0 do with a Tailwind configuration, and does a `postcss.config.json` recipe or generator restore Tailwind beside the filter?

Families: the 35 first-milestone export mixins of [research/foundation-sass-per-family.md](../../research/foundation-sass-per-family.md) (31 components plus `foundation-forms`, `-range-input`, `-progress-element`, `-meter-element`).

## The mechanism under test

- **Library side, "structure".** `tools/gen.mjs` takes 191's 623 invariant declarations (`D:/tmp/f191/summary.json`, after checking that each standalone default compile equals 191's output byte for byte) and writes a real library, `libs/structure`, built with ng-packagr 22.2.0 in partial compilation mode and installed as `@nfs-proto/structure`. It has one `ViewEncapsulation.None` component per family whose `styleUrl` is 191's invariant sheet wrapped in `@layer nfs.<family>.structure`.
- **Consumer side, "theme".** One carrier per family as in 184 (`src/nfs-families/<family>.scss` and `.ts`, lazily imported through `carriers.ts`), compiled with the consumer's settings (184's six non-default values) and wrapped in `@layer nfs.<family>.theme`.
- **The filter.** `tools/nfs-postcss-split.cjs`, listed in `postcss.config.json` next to `@tailwindcss/postcss`. In every `@layer nfs.<family>.theme` block it removes the declarations whose at-rule context, selector, property, and value match the family's invariant list (`tools/nfs-invariant.json`, the 623 keys in the `expanded` form `@angular/build` hands to PostCSS). Sheets without such a layer pass through, so the layer name is how it tells family sheets from the consumer's own. Whitespace is collapsed before matching because Sass breaks and indents selector lists by nesting depth (the first build matched only 541 of 626 until this was added).
- **Adoption.** Sass writes the rule that extends Foundation's `%reveal-centered` placeholder where the placeholder is, before the `@layer` block (`@media print, screen and (min-width: 40em) { .reveal { right: auto; left: auto; margin: 0 auto } }`), so it is unlayered and beats every layer. The plugin moves rules outside the family layer to the start of the theme layer (`adoptUnlayered`, default on).
- **Loading.** 184's service, changed to create the library's structure component together with each theme carrier (`src/lib/family-styles.ts`). `src/styles.scss` starts with one order statement: `nfs.global`, then for each family in Foundation's order `nfs.<family>.theme, nfs.<family>.structure`.
- **Reference.** The `reference` build has no carriers and puts Foundation's single compile of global styles and all 35 families, unlayered, with the same settings, in `styles.reference.scss`.

Variants: `production` (the split), `badorder` (order statement with structure before theme), `nofilter` (`NFS_SPLIT=off`), `noadopt` (`NFS_SPLIT_ADOPT=off`), `samelayer` (`libs/structure-same`: the library sheet in the family's own `nfs.<family>.theme` layer, so specificity and insertion order decide between the two sheets), and the switches `?order=structure-first`, `?families=reverse`, and `?structure=off` (theme carriers only, the 184 shape with full compiles, served from the `nofilter` build).

## What is here

- `tools/`: `gen.mjs` (writes the invariant keys, both libraries, the carriers, the three global stylesheets, and the page markup), `nfs-postcss-split.cjs` (the plugin), `decls.mjs` (191's declaration parser).
- `project.json`, `postcss.config.json`, `src/styles*.scss`, `src/tailwind.css` (`src/tailwind.scan-app.css` is the first run's file, which also scanned the doc markup), `src/lib/`, `src/app/families-page.ts`, and one carrier pair (`src/nfs-families/callout.*`; the other 34 have the same shape). The page, `/families`, renders every `html` example of each family's Foundation 6.9.0 doc page, the kitchen sink, and 191's 56-button matrix: 2,386 elements.
- `build.sh`, `serve.sh`, `kill-servers.sh`; `measure/compare.mjs` (computed styles), `sizes.mjs`, `summarize.mjs`, `hmr.mjs`.
- `results/`: `summary.txt`, `compare-<engine>-<viewport>.json`, `compare-dev-<engine>.json`, `sizes.json`, `hmr.json`, `filter-log-production.jsonl` and `filter-log-dev.jsonl` (one line per family sheet the plugin changed), and `library-structure-menu.css`.

The runnable workspace is `D:/tmp/nfs-proto-195`, a copy of 184's: Nx 23.2.1, Angular 22.2.0 (`@angular/build`, `@angular/ssr`, ng-packagr 22.2.0), Dart Sass 1.104.1, `foundation-sites` 6.9.0, PostCSS 8.5.28, `tailwindcss` and `@tailwindcss/postcss` 4.3.3, Playwright 1.63.0 with Chromium 153, Firefox 155, and WebKit 26.6, on Windows 11 arm64. It is not committed.

## How to run

```
cd D:/tmp/nfs-proto-195
node tools/gen.mjs
npx ng-packagr -p libs/structure/ng-package.json -c libs/structure/tsconfig.lib.json        # then copy dist/libs/structure
npx ng-packagr -p libs/structure-same/ng-package.json -c libs/structure-same/tsconfig.lib.json  # to node_modules/@nfs-proto/
./build.sh production; ./build.sh reference; ./build.sh badorder; ./build.sh samelayer
NFS_SPLIT=off ./build.sh production dist/nofilter; NFS_SPLIT_ADOPT=off ./build.sh production dist/noadopt
./serve.sh                                    # 4631 split, 4632 reference, 4633 badorder, 4634 nofilter, 4635 noadopt, 4636 samelayer
VIEWPORT=large node measure/compare.mjs chromium   # also small; firefox, webkit; about 25 minutes each
node measure/summarize.mjs; node measure/sizes.mjs
npx nx run fixture:serve; npx nx run fixture:serve:reference   # dev servers on 4621 and 4622
TARGETS=dev node measure/compare.mjs chromium; node measure/hmr.mjs
./kill-servers.sh
```

`compare.mjs` loads `/families` from the reference and from each variant at 1280x900 and 375x800, turns transitions and animations off, and compares every computed property of every element, and of its `::before` and `::after` when they have content. The counts below leave out the layout-derived properties (`width`, `height`, `top`, `left`, `transform-origin`, and the like), which change on every element after a box of another height; the raw files also count the elements whose only differences are of that kind.

## Results

### 1. The filter in real builds: works

| Check | Result |
| --- | --- |
| Plugin loaded from `postcss.config.json` | Yes, in the production SSR build and under `nx serve` (both log 36 family sheets: 35 carriers plus one non-injected `bundleName` sheet). |
| Invariant declarations removed | 626 of 626 in production and in the dev server (623, plus callout's 3 in the extra bundle). |
| Consumer's own sheets | Untouched: `styles.scss`, `tailwind.css`, and the reference build's single compile have no `nfs.<family>.theme` layer. |
| Library sheets | Untouched: in the `samelayer` build the library's menu sheet carries `@layer nfs.menu.theme`, the plugin's own pattern, and still arrives with every declaration (1,892 bytes, `.menu{padding:0;margin:0;...}`). Library component styles reach the consumer precompiled in the FESM and never pass through its stylesheet pipeline (checked by content; the reason is inferred from the build design). |
| Theme carriers, bytes (35 sheets, gzip per sheet summed) | 70,326 B / 17,626 B without the filter, 55,230 B / 12,792 B with it (79% / 73%). |
| Structure sheets | 19,150 B / 8,880 B. Split total 74,380 B / 21,672 B, against 70,326 B / 17,626 B for theme carriers alone (184's shape, no library sheet): 6% more bytes, 23% more gzip. |
| `<link>` loader bundle (189's shape) | The non-injected `nfs-callout.css` drops from 585 to 495 B: the filter works on `bundleName` sheets too. |
| Computed styles: filter on against filter off | The same in every engine and viewport except reveal (2 at 1280px), which adoption fixes; `noadopt` gives exactly the `nofilter` counts. Removing declarations the structure sheet carries changes nothing by itself. |
| HMR under `nx serve` | Editing `callout.scss` updated the theme `<style>` in place with no reload; the new rule applied and the invariant `.callout { position: relative }` was still absent from it (`results/hmr.json`, Chromium). |

### 2. The cascade: the split does not reproduce Foundation's single compile

Non-geometry computed-property differences from the reference on 2,386 elements. Chromium, Firefox, and WebKit gave the same counts to within 3, and the same families.

| Variant | 1280px | 375px | Families (1280px, Chromium) |
| --- | --- | --- | --- |
| Split: theme then structure sublayers (191's order), any insertion order, families reversed, or JavaScript off (server HTML only) | 319-322 | 294 | forms 92, kitchen sink 113-116, accordion 30, media-object 18, menu-icon 16, switch 14, top-bar 13, accordion-menu 8, tabs 6, menu 4, drilldown-menu 2, dropdown-menu 2, off-canvas 1; at 375px also reveal 14 |
| Same under `nx serve` (dev split against dev reference) | 319 | 294 | the same |
| Negative control: structure sublayer before theme | 335-337 | 296 | button 54, accordion 54, reveal 38, forms 33, menu 24, tabs 24, button-group 12, ... |
| Same layer, structure inserted after theme | 108-110 | 79 | forms 18, media-object 18, menu-icon 16, top-bar 13, switch 8, off-canvas 1; at 375px reveal 14 |
| Same layer, structure inserted first | 239-241 | 238 | accordion 54, button 43, forms 26, tabs 18, button-group 12, ... |
| Layering only: 35 theme carriers with full compiles, no structure sheet (184's shape) | 64-66 | 61 | forms 16, media-object 18, switch 8, reveal 2, kitchen sink 22 |

Hover and focus on the split page (1280px): 801 interactive elements, 768 visible, 1,536 checks, 910 property differences in each engine, the same failures as above (the first are the `[type=checkbox] + label` margins).

Why, from the differences against the layering-only build and the invariant list:

- **A later sublayer wins regardless of specificity.** `label { margin: 0 }` is invariant, so it moves to `nfs.forms.structure`, and there it beats the theme's `[type=checkbox] + label { margin-left: .5rem; margin-right: 1rem }` (labels lose 8px and 16px). The same pattern gives the nested-menu `margin-left` (`.menu { margin: 0 }` against `.menu.nested`), the accordion and tabs content borders, the switch cursor, and the small-screen reveal. 191 measured this order only for button and dropdown-menu markup.
- **The reverse order fails other rules.** With structure first, `.button.hollow { background-color: transparent }` loses to the theme's palette rules, as 191 found.
- **One layer for both sheets fixes the specificity cases but not the source-order cases.** Foundation emits `.menu.vertical { flex-direction: column }` (invariant) before `@media (min-width: 40em) { .menu.medium-horizontal { flex-direction: row } }` (dependent, from `$breakpoints`); with the structure sheet inserted after the theme, the vertical rule wins (`menu-icon`, `top-bar`, and `off-canvas` markup, 30 differences). Inserting it first breaks the 191 button case instead. Neither insertion order matches in both kinds of pair. 191's static scan only looked at subject class sets in a subset relation, which `.vertical` and `.medium-horizontal` are not.
- **Layering alone (no split) also differs, in four places.** Family layers give a later family precedence over an earlier family's more specific rule: forms' `.input-group-button` radius against `.button`, switch's paddle `display`, media-object against `.thumbnail` margins. And without adoption, reveal's unlayered placeholder rule beats `.reveal.full` (this applies to 184's carriers as built).

### 3. Tailwind

- **What `@angular/build` 22.2.0 does.** It looks for `postcss.config.json` or `.postcssrc.json` in the project root, then the workspace root (`src/builders/application/options.js:128-129`, `src/utils/postcss-configuration.js:17`, `:69-110`). Only when there is none does it look for `tailwind.config.{js,cjs,mjs,ts}` and resolve `tailwindcss` from it (`options.js:130-133`; `postcss-configuration.js:18-23`, `:43-62`). With such a file it runs `postcss().use(tailwind.default({ config }))` (`src/tools/esbuild/stylesheets/stylesheet-plugin-factory.js:166-174`), and only on stylesheets containing one of `@tailwind`, `@layer`, `@apply`, `@config`, `theme(`, `screen(`, `@screen` (`:64-72`, `:199`). That call is Tailwind v3's plugin API; Tailwind v4's PostCSS plugin is a separate package. With a configuration file every stylesheet goes through the listed plugins (`:199`), each loaded with `require` relative to the file and rejected without `postcss: true` (`:153-160`), and options must be an object or string or the entry is skipped (`postcss-configuration.js:102`).
- **The generator.** `ng add tailwindcss` runs the built-in `@schematics/angular:tailwind` schematic (`@angular/cli/src/commands/add/cli.js:78-81`). It adds `@tailwindcss/postcss` to an existing `.postcssrc.json` or `postcss.config.json` in the workspace or project root, creating one only if neither exists, and adds `@import 'tailwindcss';` to the first `.css` in `styles`, or a new `tailwind.css` (`@schematics/angular/tailwind/index.js:20-21`, `:22-68`, `:69-95`). In Nx 23.2.1, which has no Tailwind generator of its own, `npx nx g @schematics/angular:tailwind --project=fixture --skipInstall` ran it: with a configuration listing only the filter it produced `{ "plugins": { "../../tools/nfs-postcss-split.cjs": {}, "@tailwindcss/postcss": {} } }` and left `project.json` unchanged.
- **The recipe, verified.** `postcss.config.json` with `"@tailwindcss/postcss": {}` and the filter, and a `tailwind.css` in `styles`. In the same production, SSR, and dev builds, the probe `p-[13px] text-emerald-700 underline decoration-wavy` computed `padding-top: 13px`, `color: oklch(0.508 0.118 165.612)`, `text-decoration-style: wavy` in all three engines at both widths, and the filter still removed 626 of 626.
- **Two interactions with Foundation in layers.** The verified file imports Tailwind's theme and utilities only. Tailwind's layers come after the `nfs` layers, so a utility with a Foundation class name wins: when Tailwind also scanned the doc markup, its `.sticky { position: sticky }` beat Foundation's layered `.sticky { position: relative }`, which wins in the unlayered reference (Chromium, first run). The full `@import 'tailwindcss'` that the schematic writes also brings the preflight in `@layer base`, after the `nfs` layers; not measured.

### Point 2: other PostCSS roles

| Role | Through `@angular/build` 22.2.0 | Built here |
| --- | --- | --- |
| Remove the declarations a library sheet carries | Yes: every stylesheet, after Sass (`stylesheet-plugin-factory.js:181-199`), with the source path as `from` (`:249-256`) | Yes (results 1) |
| Repair Sass output for layers (move unlayered rules into the family layer) | Yes, same hook | Yes: adoption, reveal fixed at 1280px |
| Split one compile into several family sheets by layer | No: one input yields one output, `contents: postcssResult.css` (`:257`); a plugin can only regroup rules inside the sheet | No |
| Write a manifest the library reads | Only as a file the plugin writes itself: the builder reads only `dependency` and `dir-dependency` messages, as watch files (`:286-300`), so nothing reaches the build output or the server. The prototype's `NFS_SPLIT_LOG` file is such a side file. A `dependency` message for the invariant list would make the dev server rebuild when the list changes (not built) | Log only |
| Rewrite URLs and hashes for 189's `<link>` loader | Not needed and not possible: PostCSS runs before esbuild bundles and names the output (`:120-131`), and `bundleName` sheets are unhashed under `outputHashing: all` (`dist/split/browser/nfs-callout.css`). The family CSS has no relative `url()` (forms has two `data:` URIs) | No |

## Verdict

- The filter runs unchanged in Angular 22.2's production SSR build and under `ng serve`, including component-style HMR. It removes all 623 invariant declarations and cuts the consumer's family CSS to 79% (73% gzip), tells family sheets from others by the layer name, and leaves library styles and Tailwind alone. On its own it changes no computed style.
- The two-sheet split does not reproduce Foundation's cascade for the first-milestone families, in any of the four sheet orders measured, in any of the three engines, at either width, server-rendered or hydrated. About 250 property differences at 1280px (in the markup of 11 families and the kitchen sink) come from the split, measured against the layering-only build; the best variant, one shared layer with the structure sheet inserted last, still leaves about 45, mostly from source-order pairs between Foundation's breakpoint rules and its fixed rules.
- Independent of the split, 184's per-family layers differ from Foundation's single compile on four rule pairs across families once all 35 families are layered, and reveal's extended placeholder escapes the layer unless something moves it.
- A consumer can keep Tailwind: v4 needs a PostCSS configuration anyway, Angular's own generator merges into an existing `postcss.config.json`, and the merged file builds and applies a v4 class beside the filter. Angular's automatic setup covers only Tailwind v3 with a `tailwind.config.*` file.

## What this prototype does not prove

- Whether a filter that keeps the invariant declarations involved in an order conflict (removing only the rest) would match; such a list would need the cascade analysis the static scan could not do. Not built.
- The four cross-family layering differences were measured, not explained rule by rule beyond the samples above.
- Tailwind v3 through `postcss.config.json` (not installed), Tailwind's preflight with Foundation in layers, and the class-name collisions in Firefox and WebKit.
- States other than hover and focus (`:active`, `:checked` changes, `.is-active` toggles beyond the doc markup), viewports other than 375px and 1280px, and right-to-left settings.
- Foundation releases after 6.9.0, and settings files other than 184's: the invariant list is 191's measurement.
- Web Vitals and request cost of 70 `<style>` elements, left to ticket 190.
