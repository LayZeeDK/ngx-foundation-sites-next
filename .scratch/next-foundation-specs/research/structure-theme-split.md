# Splitting Foundation's family CSS into structure and theme

Ticket: [Research: splitting Foundation's family CSS into structure and theme](../issues/191-research-structure-theme-split.md), for [Decide: how first-milestone directives load and unload their family styles](../issues/185-decide-lazy-family-styles.md). Model: Opus 5.5. Resolved 2026-10-01.

This file decides nothing. It reports how Angular Material separates component structure from theme (the inspiration), how much of each first-milestone export mixin's output stays the same under every Foundation setting, which Sass-level splits exist and whether each re-implements Foundation, what each costs against the bundle's records, and what each would load lazily. Per the user's clarification quoted in the ticket, the split is in Sass and no option carries theme values through CSS custom properties.

Sources and path prefixes:

- `MAT/` = `d:/projects/github/angular/components`, branch `22.2.x`, `package.json` version 22.2.0, commit `708d4c6e2`.
- `FDN/` = `d:/projects/github/foundation/foundation-sites`, Foundation for Sites 6.9.0 (`package.json` version), commit `337be7a8d`.
- `NGB/` = `@angular/build` 22.2.0 as installed in `D:/tmp/nfs-proto-lazy-family-styles/node_modules/@angular/build` (the [Prototype: a directive that loads and unloads its family's consumer-compiled styles](../issues/184-prototype-lazy-family-styles.md) app). The local `angular-cli` clone is on `22.0.x` and has no `22.2.x` branch, so the installed 22.2.0 package is the source read here.
- `GSD/` = `D:/projects/github/LayZeeDK/ngx-foundation-sites-gsd-pi/packages/ngx-foundation-sites/src`, read only.
- `FX/` = `D:/tmp/f191`, a throwaway directory outside the repository with the scripts, results, and compiled CSS. Not committed.
- Dart Sass 1.104.1 (`npx sass --version` in `FX/` prints `1.104.1 compiled with dart2js 3.13.3`; the measured runs use its JavaScript API, `sass.info` prints `dart-sass 1.104.1`).
- Spec, ADR, and map paths are relative to the effort directory (`.scratch/next-foundation-specs/`).

## 1. Findings in brief

1. **Material's split depends on its component styles having been written for it.** The structural stylesheet is compiled with the library into component `styleUrls`, the theme mixins run in the consumer's build, and the two never emit the same declaration. The mechanism that carries values between them, `--mat-*` custom properties, is out under the user's clarification; what transfers to Sass is the shape: a structure part that reads no theme input, compiled once, and a theme part that emits only what depends on the consumer's choices (section 2).
2. **About a third of Foundation's first-milestone output does not depend on any setting.** Across the 35 first-milestone export mixins, 623 of 1,714 declarations (36%) and 163 of 677 rules (24%) stayed the same in every one of 1,956 perturbed compiles that changed the 487 settings one at a time, and in one compile that changed all 487 together. As a separate stylesheet the invariant part weighs 18,216 of 71,547 bytes minified (25%), 8,226 of 17,741 gzipped. The share runs from 100% (`foundation-sticky`) to 11% (`foundation-button-group`, `foundation-callout`) (section 3).
3. **Foundation interleaves structure and theme inside its own rules and mixins.** 105 of the 677 rules hold both invariant and setting-dependent declarations, and Foundation's sub-mixins mix them too (`button-base`, `FDN/scss/components/_button.scss:97-127`). 60% of the dependent declarations depend on a setting through their selector, media query, or presence, not only their value: palette loops, `$breakpoints`, `$breakpoint-classes`, boolean switches (sections 3.4 and 4.1).
4. **Structure and theme mixins written in Sass from Foundation's own mixins re-implement Foundation.** Foundation's export mixins write declarations directly in their bodies and compose sub-mixins that emit both kinds into one rule, so a pair of library mixins would have to copy each export mixin's selectors and pick its declarations by hand, against ADR 0012 and P18 (section 4.1).
5. **A split by compile diffing does not re-implement Foundation.** The library would ship the invariant declarations, compiled from Foundation's own Sass at library build time and filtered by a perturbation measurement like this one. Sass cannot filter what a mixin emits, so for the consumer's compile to emit only the rest takes a build plugin after Sass: `@angular/build` 22.2.0 runs PostCSS plugins from `postcss.config.json` on every stylesheet. Under two settings files written for earlier tickets, none of the 623 invariant declarations changed, and the filter cut the consumer's output to 81% and 79% of its size. Without a filter, the consumer's full compile repeats the invariant 25% (section 4.2).
6. **Order inside a family matters, and one fixed order measured right.** With the theme sheet first and the structure sheet second, or with two sublayers declared in that order, Chromium computed the same styles as Foundation's single compile for 56 button and 30 dropdown-menu elements in three states. The reverse order gave 30 property differences (`.button.primary.hollow` lost its transparent background). A static scan of all 35 mixins found 28 equal-specificity candidates, and in all 28 the invariant rule comes later in Foundation's order (section 5).
7. **The theme part stays with the consumer's build under every Sass-level split.** About four fifths of the first-milestone family CSS by bytes (the dependent sheets are 79% of a single compile; 64% of declarations) is compiled from the consumer's settings, so a directive can load only the structure part with no consumer code. The theme part needs the 184 prototype's consumer-side carriers or the global stylesheet (section 5).

## 2. Point 1: how Angular Material does it (the inspiration)

- **Structural CSS is compiled with the library and delivered through `styleUrls`.** `MatButton` declares `styleUrls: ['button.css', 'button-high-contrast.css']` and `encapsulation: ViewEncapsulation.None` (`MAT/src/material/button/button.ts:35`, `:40`).
- **The structural stylesheet takes no theme input.** `button.scss` reads its fallbacks from `m3-button.get-tokens()` called with no theme (`MAT/src/material/button/button.scss:9`) and writes themeable values through `token-utils.slot(...)` (`:73-80`). Rules no theme can change are plain CSS in the same file: `.mdc-button` sets `position`, `display: inline-flex`, `min-width: 64px`, `padding: 0 8px` and more (`:29-71`). `slot` returns `var(--mat-<token>, <fallback>)` (`MAT/src/material/core/tokens/_token-utils.scss:50-70`), and with no theme every system value is a `--mat-sys-<name>` reference (`MAT/src/material/core/tokens/m3/_theme.scss:8-35`), so the library's compile needs nothing from the consumer.
- **Theme mixins emit only the theme.** `_button-theme.scss` has `base` ("styles not dependent on the color, typography, or density settings", `:8-18`), `color` (`:25-55`), `typography` (`:57-64`), `density` (`:66-73`), and `overrides` (`:87-89`); each ends in `token-utils.values($tokens)`, which writes `--mat-<key>: <value>` under the current selector or `html` (`_token-utils.scss:73-81`; `MAT/src/material/core/style/_sass-utils.scss:18`). `mat.theme` writes the `--mat-sys-*` values (`MAT/src/material/core/tokens/_system.scss:53-57`).
- **Measured.** Compiling `MAT/src/material/button/button.scss` with Dart Sass 1.104.1 (load path `FX/matpaths`, which forwards `@angular/cdk` to `MAT/src/cdk/_index.scss`) gives 25,250 bytes and 264 declarations, 148 of which read a custom property.
- **Why its mechanism is out here.** It carries every theme value from the consumer's build to the library's CSS through custom properties, which the user's clarification excludes (and which building-blocks, `building-blocks.md:245`, and the map, `map.md:369`, rule out as a public theming contract).
- **What the split depends on, which is what a Sass-level analogue would need.** (a) The component Sass was written for the split: each themeable value is a token key in `get-tokens` (`MAT/src/material/button/_m3-button.scss:10-40` and on), so the structural file and the theme mixins never write the same declaration. (b) Theme input changes values, never selectors or media queries: the M2 colour variants are fixed classes (`.mat-primary`, `.mat-accent`, `.mat-warn`) that the theme fills (`_button-theme.scss:33-53`). (c) Derived values are computed by the theme's Sass, so the structural CSS does no colour arithmetic.

Foundation differs on all three counts: its mixins print setting values into declarations next to fixed ones (`FDN/scss/components/_button.scss:97-127`, where `button-base` writes `display: inline-block` beside `$button-margin`, `$button-radius`, `$button-font-family`), loop over setting maps to make selectors (`$button-palette`, `_button.scss:376`, `:404`; `$breakpoint-classes`, `FDN/scss/components/_dropdown-menu.scss:177`, `_off-canvas.scss:480`, `:503`), build media queries from `$breakpoints` (`FDN/scss/util/_breakpoint.scss:152-185`), and derive colours with Sass functions (`$button-background-hover: scale-color($button-background, $lightness: -15%)`, `FDN/scss/settings/_settings.scss:304`; `color-pick-contrast`, `FDN/scss/util/_color.scss:77`).

## 3. Point 2: how much of each export mixin is invariant

### 3.1 Method

- **Mixins.** The 35 first-milestone export mixins of [research/foundation-sass-per-family.md](foundation-sass-per-family.md) section 1 item 3 (31 components plus `foundation-forms`, `-range-input`, `-progress-element`, `-meter-element`), and `foundation-global-styles` as an extra row outside the totals.
- **Settings.** Every top-level assignment in `FDN/scss/settings/_settings.scss`: 490, less `$global-flexbox` and `$xy-grid` (kept `true`, user ruling, `map.md:63`; `foundation-everything`'s `$flex` is a mixin argument, not a setting, and no fixture calls `foundation-everything`) and the private `$-zf-size`. That leaves 487: 167 numbers, 128 colours, 70 lists, 50 strings, 45 booleans, 21 maps, 6 nulls. Outside the settings file Foundation has seven more `!default` variables (`$contrast-warnings`, `$unit-warnings`, and the five `$<name>-color` aliases that `add-foundation-colors` sets from the palette; `FDN/scss/util/_color.scss`, `FDN/scss/util/_unit.scss`); none was perturbed on its own.
- **How a setting was perturbed.** The settings file was patched as text: the setting's expression became `-p((<expression>), '<mode>')`, so every setting defined from it recomputed as it would in a consumer's file. `-p` is a Sass function (`FX/_perturb.scss`), by type:
  - number: mode a adds 2 to an integer and otherwise gives `x * 1.5 + 0.25` in the same unit (so `0` becomes `0.25` and `0px` becomes `.25px`); mode b adds 1 in the same unit;
  - colour: mode a `mix(x, #8a2be2, 60%)`, mode b `mix(x, #00ff7f, 50%)`;
  - boolean: `not x`;
  - string: mode a swaps known keywords for an alternative (`ltr`/`rtl`, `left`/`right`, `top`/`bottom`, `normal`/`bold`, `medium`/`small`, about 50 pairs) and otherwise appends `-x`; mode b always appends `-x`;
  - null: `3px`, `#123456`, and `nfsx` in three runs;
  - list and map: modes a and b on every element, then one run per element with only that element perturbed, one run per element removed, and one run with an element added.
  - A further 352 runs replaced each scalar setting with a `var()` string, as one more value change; they changed no declaration the other runs left unchanged.
- **Runs.** 1,956 single-setting runs, each compiling all 36 mixins in one Dart Sass compile with a marker rule after each include, split back per mixin. The one rule Foundation emits at import time, the extended `%reveal-centered` placeholder (`FDN/scss/components/_reveal.scss:45-46`), is attributed to `foundation-reveal`. All 36 default outputs match 183's standalone compiles byte for byte (less the byte-order mark). Then one joint compile changed all 487 settings at once, each in the first mode that compiled alone; it compiled with all 487.
- **Errors.** 26 value runs failed on Foundation's own guards (the first breakpoint must be `0`, the palette must keep `primary` and `alert`, `$closebutton-position` needs two values, and the like). Every one of those settings compiled in another mode, so no setting went unmeasured.
- **Diffing** (`FX/decls.mjs`). Each compiled mixin is parsed with PostCSS into declarations keyed by at-rule context, selector, and property, and the value (with `!important`) is compared. A default declaration is invariant when every run's output has the same key with the same value (multiset match, so duplicate fallback declarations count separately). A self-check in the file covers the matcher. A full rerun of the 1,956 runs reproduced every mixin's dependent set exactly.

### 3.2 Results per export mixin

"Invariant sheet" and "dependent sheet" are the mixin's default compile with only the invariant or only the dependent declarations kept (empty rules dropped; `FX/invariant/`, `FX/dependent/`). The two together are larger than the full compile because a rule with both kinds of declarations keeps its selector in both. "Settings" counts the settings whose perturbation changed at least one declaration.

| Export mixin | Declarations invariant | Rules invariant | Bytes min: invariant sheet / dependent sheet / full | gzip: invariant / dependent / full | Settings |
| --- | --- | --- | --- | --- | --- |
| `foundation-button` | 28 of 109 (26%) | 5 of 54 (9%) | 1096 / 7640 / 8643 | 413 / 1290 / 1581 | 23 |
| `foundation-button-group` | 11 of 96 (11%) | 4 of 58 (7%) | 354 / 14954 / 15294 | 173 / 1710 / 1822 | 19 |
| `foundation-close-button` | 3 of 14 (21%) | 1 of 5 (20%) | 94 / 250 / 330 | 98 / 150 / 196 | 11 |
| `foundation-label` | 4 of 19 (21%) | 0 of 6 (0%) | 76 / 336 / 405 | 89 / 170 / 216 | 11 |
| `foundation-progress-bar` | 12 of 23 (52%) | 0 of 8 (0%) | 219 / 453 / 635 | 174 / 180 / 292 | 10 |
| `foundation-slider` | 34 of 50 (68%) | 3 of 11 (27%) | 798 / 495 / 1143 | 361 / 224 / 480 | 14 |
| `foundation-switch` | 24 of 76 (32%) | 6 of 29 (21%) | 622 / 1474 / 2036 | 294 / 430 / 621 | 23 |
| `foundation-table` | 7 of 34 (21%) | 3 of 21 (14%) | 169 / 1171 / 1334 | 137 / 433 / 487 | 27 |
| `foundation-badge` | 3 of 18 (17%) | 0 of 6 (0%) | 64 / 325 / 382 | 83 / 165 / 204 | 10 |
| `foundation-breadcrumbs` | 9 of 21 (43%) | 3 of 8 (38%) | 268 / 292 / 508 | 169 / 194 / 287 | 16 |
| `foundation-callout` | 3 of 27 (11%) | 2 of 10 (20%) | 99 / 763 / 853 | 90 / 318 / 356 | 12 |
| `foundation-card` | 11 of 20 (55%) | 4 of 7 (57%) | 283 / 188 / 437 | 160 / 143 / 230 | 15 |
| `foundation-dropdown` | 7 of 16 (44%) | 2 of 6 (33%) | 171 / 219 / 375 | 119 / 150 / 215 | 11 |
| `foundation-pagination` | 10 of 35 (29%) | 3 of 14 (21%) | 336 / 875 / 1106 | 195 / 355 / 438 | 26 |
| `foundation-tooltip` | 53 of 71 (75%) | 9 of 15 (60%) | 1105 / 601 / 1598 | 311 / 240 / 463 | 17 |
| `foundation-accordion` | 8 of 30 (27%) | 1 of 11 (9%) | 216 / 745 / 914 | 150 / 310 / 387 | 20 |
| `foundation-media-object` | 6 of 15 (40%) | 4 of 10 (40%) | 211 / 453 / 650 | 138 / 220 / 271 | 7 |
| `foundation-orbit` | 26 of 44 (59%) | 8 of 17 (47%) | 644 / 602 / 1166 | 300 / 245 / 450 | 16 |
| `foundation-responsive-embed` | 7 of 11 (64%) | 0 of 3 (0%) | 292 / 321 / 411 | 153 / 152 / 202 | 4 |
| `foundation-tabs` | 18 of 38 (47%) | 7 of 18 (39%) | 457 / 665 / 1076 | 276 / 313 / 495 | 19 |
| `foundation-thumbnail` | 4 of 10 (40%) | 1 of 4 (25%) | 95 / 238 / 322 | 101 / 169 / 215 | 11 |
| `foundation-menu` | 37 of 77 (48%) | 19 of 48 (40%) | 1890 / 2321 / 3832 | 540 / 538 / 867 | 17 |
| `foundation-menu-icon` | 26 of 34 (76%) | 2 of 6 (33%) | 422 / 346 / 727 | 173 / 142 / 261 | 6 |
| `foundation-accordion-menu` | 24 of 55 (44%) | 4 of 16 (25%) | 578 / 1106 / 1645 | 308 / 374 / 500 | 12 |
| `foundation-drilldown-menu` | 11 of 65 (17%) | 4 of 15 (27%) | 337 / 1485 / 1746 | 187 / 394 / 481 | 16 |
| `foundation-dropdown-menu` | 33 of 187 (18%) | 15 of 51 (29%) | 1138 / 4562 / 5581 | 329 / 601 / 766 | 21 |
| `foundation-off-canvas` | 50 of 174 (29%) | 15 of 91 (16%) | 1403 / 6158 / 7443 | 391 / 797 / 1046 | 20 |
| `foundation-reveal` | 38 of 68 (56%) | 9 of 18 (50%) | 782 / 863 / 1621 | 338 / 318 / 539 | 17 |
| `foundation-sticky` | 13 of 13 (100%) | 7 of 7 (100%) | 329 / 0 / 329 | 172 / 0 / 172 | 0 |
| `foundation-title-bar` | 7 of 13 (54%) | 2 of 5 (40%) | 210 / 153 / 335 | 143 / 126 / 212 | 7 |
| `foundation-top-bar` | 11 of 28 (39%) | 4 of 16 (25%) | 332 / 790 / 1070 | 183 / 293 / 370 | 10 |
| `foundation-forms` | 56 of 138 (41%) | 14 of 42 (33%) | 2405 / 3252 / 4903 | 1010 / 1032 / 1735 | 56 |
| `foundation-range-input` | 17 of 42 (40%) | 1 of 12 (8%) | 480 / 787 / 1072 | 240 / 252 / 382 | 12 |
| `foundation-progress-element` | 5 of 26 (19%) | 1 of 20 (5%) | 87 / 938 / 1016 | 93 / 214 / 261 | 7 |
| `foundation-meter-element` | 7 of 17 (41%) | 0 of 9 (0%) | 154 / 510 / 609 | 135 / 185 / 241 | 7 |
| **35 mixins** | **623 of 1,714 (36%)** | **163 of 677 (24%)** | **18,216 / 56,331 / 71,547** | **8,226 / 12,847 / 17,741** | 341 settings change at least one |
| `foundation-global-styles` (not in the 35) | 83 of 96 (86%) | 43 of 49 (88%) | 2792 / 471 / 3154 | 1058 / 313 / 1215 | 12 |

Reading the table:

- Of the 677 rules, 163 are wholly invariant, 409 wholly dependent, and 105 mixed.
- Byte shares are lower than declaration shares because a rule with one dependent declaration puts its whole selector into the dependent sheet, and the longest selectors come from the palette, breakpoint, and size loops. As declaration text alone (`prop:value;`), the invariant part is 9,710 of 31,821 bytes (31%).
- As two sheets, the 35 mixins weigh 74,547 bytes minified (4% more than one compile) and 21,073 gzipped (19% more), before any per-file cost such as the 35-file effect 183 measured.
- The settings that change the most declarations make selectors: `$dropdownmenu-arrows` (115 declarations of `foundation-dropdown-menu`), `$breakpoint-classes` and `$print-breakpoint` (88 of `foundation-dropdown-menu`, 84 of `foundation-off-canvas`), `$buttongroup-child-selector` (82 of `foundation-button-group`), `$foundation-palette` and `$button-palette` (60 and 51 of `foundation-button`). `$global-text-direction` changes declarations in 17 of the 35 mixins.
- Invariant examples: `.button { display: inline-block; vertical-align: middle; -webkit-appearance: none; line-height: 1; text-align: center; cursor: pointer }`; all of `foundation-sticky` (`.sticky-container`, `.sticky`, `.sticky.is-stuck`, `.sticky.is-anchored` and their `is-at-top`/`is-at-bottom` rules); the tooltip triangle's `display`, `width: 0`, `height: 0`, `border-style`, `content` on `.tooltip.top::before` and `.tooltip.bottom::before`. Dependent examples: every colour, every `rem-calc` size, every `@media` block, every `.<palette-name>` modifier, every `left`/`right` value that `$global-text-direction` flips.

### 3.3 Together, and out of sample

- **All settings together.** The joint compile with all 487 settings changed changed 2 declarations that no single change did: `margin-right: 0` on `.drilldown .nested.is-drilldown-submenu` and on `.dropdown.menu .nested.is-dropdown-submenu`. They are counted as dependent above. Type-group joint runs (all numbers at once, all colours at once, and so on) found none beyond the single runs where they compiled.
- **Two independent settings files.** The invariant set was then checked against the custom settings of [research/foundation-sass-per-family.md](foundation-sass-per-family.md) section 3.1 (`$global-radius: 8px`, a changed primary and an added palette entry, an `xlarge` breakpoint class) and the consumer settings of the 184 prototype (`apps/fixture/src/foundation-settings/_settings.scss`, six changed values including `$button-padding`, `$callout-sizes`, `$menu-items-padding`). Under both, all 623 invariant declarations appear unchanged in the consumer's compile (`FX/verify.mjs`).
- **What "invariant" means here.** A declaration is invariant if no measured perturbation changed it. A setting that Foundation compares against a threshold the perturbed values never crossed could still change one; the two out-of-sample files found no such case.

### 3.4 What makes the dependent part large

For each dependent declaration the runs also record whether its context, selector, and property key was missing from some perturbed output, meaning a setting changed its selector or media query or removed it, not just its value (`FX/shape.mjs`). Of the 1,091 dependent declarations, 653 (60%) depend on a setting in this way and 438 (40%) change only in value. The first kind is most common where loops make selectors: `foundation-button-group` 84 of 85, `foundation-dropdown-menu` 142 of 154, `foundation-off-canvas` 104 of 124, `foundation-button` 65 of 81, `foundation-menu` 32 of 40. It is 0 in `foundation-slider`, `-card`, `-tooltip`, `-thumbnail`, `-menu-icon`, `-title-bar`, `-range-input`, and `-meter-element`. A theme part therefore cannot be a fixed rule set that only receives values; it has to be compiled by Foundation's loops from the consumer's maps and lists.

## 4. Point 3: Sass-level ways to split, and what each costs

The records each option meets: ADR 0012 (the library never imports Foundation, never re-implements a style Foundation has, and no library component or directive carries `styles`, `adr/0012-sass-packaging.md:7`), architecture guide P18 (the same three rules, `architecture-guide.md:264`), and the map's lazy-styles ruling (`map.md:62`). A Material-style token split is out: it carries the theme's values through custom properties, which the user's clarification excludes, so it is not costed here.

### 4.1 Structure and theme mixins written in Sass from Foundation's own mixins and settings

- **Shape.** The library would ship, per family, a structure mixin (compiled by the library) and a theme mixin (included by the consumer after its Foundation import), both calling Foundation's sub-mixins and reading its settings, like gsd-pi's `nfs-button.theme`, which builds `.button` rules from Foundation's `button-base`, `button-fill-style`, `button-hollow-style` and the rest (`GSD/scss/_button.scss:33-37`).
- **Feasibility: possible only by re-implementing Foundation's export mixins.** Foundation's export mixins write declarations in their own bodies and choose the selectors: `foundation-button` writes `font-size: $value` per size, `border-top-color: $button-background` for the dropdown arrow, and `.arrow-only::after { top: -0.1em; float: none; margin-left: 0 }` with `$global-left` (`FDN/scss/components/_button.scss:332-420`). Its sub-mixins mix the two kinds in one rule: `button-base` emits `display: inline-block` and `vertical-align: middle` (invariant) with `$button-margin`, `$button-border`, `$button-radius`, `$button-transition`, `$button-font-family`, and `$button-font-weight` (`:97-127`). Measured across the 35 mixins, 105 rules hold both kinds. A Sass structure mixin cannot include `button-base` without emitting its setting-dependent half, and Sass has no way to drop declarations from what a mixin emits (section 4.2), so each structure mixin would copy the export mixin's selectors and write its invariant declarations itself, and each theme mixin would copy the selectors again around the dependent ones. Both copies re-implement styles Foundation has (ADR 0012, P18).
- **Additional costs.** The copies must follow Foundation's source order (section 5) and its loops (section 3.4), and must be compared with Foundation's output for each Foundation release.
- **What loads lazily.** The structure mixin's compiled output, through a library carrier with `styles`; the theme mixins' output from the consumer's build.

### 4.2 Split by compile diffing: the library ships the invariant declarations, the consumer compiles the rest

- **Library side.** At library build time the library compiles each export mixin from Foundation's own Sass with default settings and keeps only the declarations a perturbation run like section 3.1's found invariant: 18,216 bytes minified, 8,226 gzipped, for the 35 mixins. This is Foundation's own output, filtered; nothing is re-implemented.
- **Can the consumer's compile emit only the dependent declarations? Not in Sass.** The `sass:meta` module includes a module's CSS whole (`meta.load-css`, and `meta.css` from Dart Sass 1.105.0, after the pinned 1.104.1; https://sass-lang.com/documentation/modules/meta/, fetched 2026-10-01) and documents no member that returns emitted CSS as a value, so a Sass mixin cannot call `foundation-<x>` and keep half of its output.
- **With a build plugin after Sass: feasible without re-implementing Foundation's mixins.** `@angular/build` 22.2.0 looks for `postcss.config.json` or `.postcssrc.json` in the project root and the workspace root (`NGB/src/builders/application/options.js:127-129`; `NGB/src/utils/postcss-configuration.js:17`, `:69-100`), loads each named plugin with `require` relative to the configuration file and rejects one without `postcss: true` (`NGB/src/tools/esbuild/stylesheets/stylesheet-plugin-factory.js:146-160`), and runs the processor on every stylesheet after the Sass step whenever a configuration exists (`:181-199`). `FX/verify.mjs` holds such a plugin: it removes from the consumer's compile each declaration whose context, selector, property, and value match one in the library's invariant sheet, and leaves every other declaration as Foundation compiled it. Measured: under the 183 custom settings the consumer's 35-mixin output went from 79,211 to 64,014 bytes (81%; gzip 18,382 to 13,499), under the 184 prototype settings from 71,736 to 56,539 bytes (79%; gzip 17,774 to 12,907). Loaded with the library's invariant sheet in the order of section 5, the filtered sheet gave 0 computed-property differences from the consumer's unfiltered compile in Chromium for section 5's button and dropdown-menu markup, under both settings files.
- **Without a filter.** The consumer compiles each family in full, as the 184 prototype does, and the invariant declarations reach the page twice with identical values: 18,216 bytes minified (25%) more, and the library sheet adds nothing the consumer's sheet lacks.
- **Costs against the records and the build.**
  - ADR 0012 says the library never imports Foundation and that no library component or directive carries `styles`; the library side needs both. ADR 0012's reason for rejecting component styles, that they compile "where the consumer's settings do not exist", does not reach the invariant part, which by measurement reads none of those settings, but the record's text does not distinguish the two.
  - The consumer adds a `postcss.config.json` and the library's plugin package. A configuration file turns off the builder's automatic Tailwind CSS setup (`NGB/src/builders/application/options.js:130-133`), so a consumer using `tailwind.config.js` would have to list Tailwind in the same file.
  - The plugin runs on every stylesheet, the consumer's own included, so it needs a way to tell family sheets apart (a path pattern or a marker comment). Not designed or measured here.
  - The invariant list is a measurement of Foundation 6.9.0. The peer range `^6.9.0` (ADR 0012) admits releases it has not seen, so it would be measured again for each; a declaration wrongly listed as invariant would be dropped from the consumer's compile while the library ships Foundation's default value.
  - The consumer still compiles, and has to load, the dependent part: 56,331 of 71,547 bytes unfiltered, about 79% of the consumer's output after filtering (section 5).

### 4.3 Other shapes in the sources, which are not splits

- **A library-compiled default plus a consumer theme mixin (gsd-pi).** `NfsButton` compiles Foundation's button mixins with Foundation's defaults into `@layer nfs-defaults` in its component `styleUrl` (`GSD/lib/nfs-button/nfs-button.scss:17-25`; `GSD/lib/nfs-button/nfs-button.ts:31`, with `ViewEncapsulation.None`), and the consumer's `nfs-button.theme(...)` emits the whole rule set again, unlayered, so it wins; its own comment says "a themed consumer consequently ships the ruleset twice" (`GSD/scss/_button.scss:27-31`). It shows the ticket's premise that a library-compiled default loads lazily with no consumer code, but its theme part repeats the default rather than completing it, the theme mixin writes its own `.button`, `&.hollow`, `&.tiny`, `&.disabled`, and `&.dropdown` selectors around Foundation's sub-mixins (`GSD/scss/_button.scss:80-156`), which is section 4.1's re-implementation, and it passes settings as mixin arguments, which ADR 0012's first rejected option covers.
- **Including a subset of Foundation's sub-mixins.** Foundation splits a component by feature, not by setting dependence: `button-base`, `button-expand`, `button-fill`, `button-fill-style`, `button-style`, `button-hollow`, `button-clear`, `button-disabled`, `button-dropdown` (`FDN/scss/components/_button.scss:97-316`). Every one reads settings, and `button-base` mixes both kinds (`:97-127`), so no subset is settings-free.

## 5. Point 4: what loads lazily, what stays global, and the cascade

| Option | Library-compiled, loadable by a directive with no consumer code | Consumer-compiled | Global |
| --- | --- | --- | --- |
| No split (184 prototype) | nothing | every family sheet, through consumer carrier files a generator could write (`prototypes/lazy-family-styles/README.md:16`) | `foundation-global-styles` and `foundation-forms`, in the first layers (`:18`, `:63`) |
| 4.1 structure and theme mixins | the structure mixins' output (a re-implementation) | the theme mixins' output | as in 184 |
| 4.2 compile diffing, with the filter | the invariant sheets, 25% of family bytes | the filtered remainder, 79% to 81% of the consumer's compile | as in 184 |
| 4.2 compile diffing, without a filter | the invariant sheets (repeated in the consumer's) | every family sheet in full | as in 184 |

Under every option the consumer-compiled part still needs the 184 mechanism (consumer carriers loaded and unloaded per family) or the global stylesheet. Making it global would leave about 79% of the first-milestone family bytes outside the lazy-loading ruling (`map.md:62`).

**Cascade inside a family.** Splitting one family's compile into two sheets changes Foundation's source order wherever an invariant rule follows a dependent rule of equal specificity that sets the same property on the same element. Measured in Chromium (Playwright 1.63.0 from `D:/tmp/nfs-ct-prototype`; every computed property of every element compared with Foundation's single compile; `:hover` and `:focus` forced through the DevTools protocol; transitions off; `FX/cascade.mjs`):

| Markup | Structure sheet first | Theme sheet first | `@layer nfs.<f>.theme, nfs.<f>.structure;` with the structure sheet inserted first |
| --- | --- | --- | --- |
| 56 buttons (6 colours; solid, hollow, clear; enabled, `.disabled`, `[disabled]`) plus dropdown and expanded, in three states | 30 differences in each state (`.button.primary.hollow` takes the primary background instead of `transparent`) | 0 | 0 |
| 5 dropdown-menu submenus (`opens-inner`, `-left`, `-right`, and pairs), in three states | 0 | 0 | 0 |

The same three results hold for the filtered consumer sheet under both out-of-sample settings files. A static scan of all 35 mixins (`FX/order.mjs`) found no key with both an invariant and a dependent declaration, and 28 candidate pairs of equal specificity, one property, and subject class sets in a subset relation (26 in `foundation-button`, 2 in `foundation-dropdown-menu`); in all 28 the invariant rule comes later in Foundation's order. The measured order is therefore the theme part first and the structure part second, inside the family's place in the 184 order statement (`@layer nfs.global, nfs.forms, nfs.button, ...`, `prototypes/lazy-family-styles/README.md:18`). The 184 prototype found that one order statement at the top of the global stylesheet holds in every load order and survives critical-CSS inlining (README measurements 4 and 8, `:58`, `:62`); a split family would name both sublayers in that statement. The two-sublayer form was measured only in the single-family page above, not in the 184 app.

**Cross-family order.** 183 found that `foundation-menu` must precede `foundation-drilldown-menu` and `foundation-dropdown-menu` ([research/foundation-sass-per-family.md](foundation-sass-per-family.md) section 3.3). With families split, the same rule applies to each family's pair of sublayers; not measured here.

## 6. Open unknowns

1. **Coverage of the perturbation.** Invariance is measured, not proven: 1,956 single-setting runs, one joint run of all 487 settings, and two independent settings files. A setting compared against a threshold the chosen values never crossed could still change a declaration counted invariant. Foundation's seven `!default` variables outside the settings file were not perturbed on their own.
2. **Cascade beyond the measured markup.** The order result covers button and dropdown-menu markup in Chromium only. Other families, Firefox and WebKit, and the menu family's cross-family order with split sheets are not measured, and the static scan has the blind spot 183 describes (subject class sets that are not in a subset relation).
3. **The PostCSS filter in a real build.** Read from `@angular/build` 22.2.0's source and run in Node; no Angular application was built with it. How it tells family sheets from the consumer's own stylesheets, how it behaves in the dev server and with hot module replacement, and how it combines with an existing PostCSS or Tailwind setup are open.
4. **Library mixins.** The `nfs-*` Library mixins have no code; their rules read the consumer's settings (ADR 0012), so they belong to the consumer-compiled part under every option. Their sizes are unmeasured.
5. **Later Foundation releases.** The invariant list is specific to 6.9.0; whether 6.9.x patches would change it is unknown.
6. **Page cost of two sheets per family.** The extra 19% gzip for two sheets per family is measured in one batch; requests, caching, and Web Vitals belong to [Prototype: compare the loading options on Web Vitals and accessibility](../issues/190-prototype-loading-options-web-vitals-a11y.md) and were not measured here.
7. **How much of 4.1 would be copied.** The size of the selector and declaration copies a structure and theme mixin pair would need was not counted beyond the 105 mixed rules and the `foundation-button` example.

## 7. Reproduction

All under `FX/` (`D:/tmp/f191`, not committed), Node 24.18.0, with `sass@1.104.1` and `postcss@8` installed there:

- `scan.mjs` lists the settings file's assignments and the `!default` variables outside it; `probe.mjs` checks the harness against 183's outputs and writes `types.json`; `check.mjs` holds positive and negative controls (`$global-radius` changes 16 mixins, an unknown setting name changes none).
- `lib.mjs` (compile and split), `_perturb.scss` (the perturbation functions), `decls.mjs` (declaration diff, with a self-check), `run.mjs` (`node run.mjs 12` for the value runs and `KIND=var node run.mjs 12` for the `var()` string runs; results in `results/` and `results-var/`, the first pass kept in `results-v1/` and `results-var-v1/`).
- `together.mjs` (the joint compile), `analyze.mjs` (section 3.2; writes `invariant/`, `dependent/`, `summary.json`), `shape.mjs` (section 3.4 and the rerun check), `verify.mjs` (section 3.3's out-of-sample check and the filter plugin), `order.mjs` and `cascade.mjs` (section 5; `VARIANT=f184-proto node cascade.mjs` for the filtered consumer sheet).
- `matpaths/` and `mat-button.css`: section 2's Material compile.
