# Extending Foundation 6.9's styles with runtime custom properties

Ticket: [Research: extending Foundation 6.9's styles with runtime custom properties](../issues/196-research-runtime-custom-properties-over-foundation.md). Model: Opus 5.5. Resolved 2026-10-01.

This file decides nothing. It measures which Foundation 6.9 settings that the first-milestone export mixins read can become a `var(--nfs-<setting>)` reference in a library-compiled Foundation stylesheet, what fails and why, which CSS functions in the map's browser target could replace the Sass math, what one library-compiled stylesheet per family would make possible, and what the approach costs against the bundle's records. Two records it touches are inputs, not questions reopened here: the map's Out of scope line "Runtime theming through custom properties as a component contract" (`map.md:373`), and the user's clarification on ticket 191, which kept that split free of custom properties (`issues/191-research-structure-theme-split.md:21`). Whether to reopen them is the user's call.

Sources and path prefixes:

- `FDN/` = `d:/projects/github/foundation/foundation-sites`, Foundation for Sites 6.9.0, commit `337be7a8d` (unchanged; `git log --oneline -1`).
- `FX/` = `D:/tmp/nfs-research-196`, a throwaway directory outside the repository with the scripts, results, and compiled CSS. Not committed.
- `F191/` = `D:/tmp/f191`, ticket 191's fixtures. Its perturbation results (`F191/results/*.json`) are the input that says which settings each mixin reads and which declarations each changes; its harness was copied, not changed.
- Dart Sass 1.104.1 (`npx sass --version` in `FX/` prints `1.104.1 compiled with dart2js 3.13.3`; the runs use its JavaScript API from the same install).
- Baseline: `web-features` 3.40.1 (`FX/node_modules/web-features/data.json`, queried by `FX/baseline.mjs`, output in `FX/baseline.txt`). The target is the map's: Baseline widely available on 2026-05-07, core table Chrome, Edge and Firefox 119, Safari 17 (`map.md:45-57`).
- Chromium: `playwright-core` 1.63.0 in `FX/`, with the installed Playwright Chromium build.
- Spec, ADR, and map paths are relative to the effort directory (`.scratch/next-foundation-specs/`).

"Measured" means a script in `FX/` produced the number; "inferred" marks a claim drawn from source reading or from the measurements without its own run.

## 1. Findings in brief

1. **Two thirds of the settings survive as a property, one fifth of the declarations read one.** Of the 354 settings the 35 first-milestone export mixins read, 237 (67%) can be replaced whole by `var(--nfs-<setting>)` and still reproduce Foundation's default output once each reference is replaced by the setting's default value; 74 (21%) fail to compile and 43 (12%) compile to a wrong value. Of the 180 elements of the 61 list and map settings, 144 pass as per-element properties. Every one of the 381 passing substitutions also reproduced Foundation's output at one or two further values (section 2). Compiled together, they leave 357 of the 1,714 declarations (21%) reading a property (section 4).
2. **The settings that fail are the ones a theme changes first.** None of the 20 palette colour elements (`$foundation-palette`, `$button-palette`, `$badge-palette`, `$label-palette`), and neither `$black` nor `$white`, can be a property: Foundation's mixins feed them to `scale-color`, `color-pick-contrast`, `smart-scale`, and `mix` (`FDN/scss/components/_button.scss:190-194`, `_callout.scss:71-74`, `_badge.scss:59`). The same holds for `$global-font-size`, `$global-lineheight`, every `$breakpoints` value, and the arithmetic inputs such as `$switch-height` and `$form-spacing`. 93 of the 104 compile failures are in Foundation's mixin and function code, 11 in the settings file's own derived defaults (section 2.3).
3. **Most setting-dependent declarations cannot follow a property.** Of the 1,091 declarations ticket 191 found setting-dependent, 102 (9%) follow properties for every setting they depend on, 81 more follow them for their value while their selector or media query stays compile-time, 336 (31%) depend on a setting only through their selector, media query, or presence, and 572 (52%) depend on at least one setting that cannot be a property. `var()` is valid only in property values, not in selectors, property names, or at-rule preludes (CSS Custom Properties Level 1, https://www.w3.org/TR/2022/CR-css-variables-1-20220616/, section 3), so no CSS function moves the selector and media-query part to runtime (section 3.1).
4. **In the browser target, CSS can replace part of the Sass math.** `calc()`, `min()`/`max()`, `color-mix()`, the trigonometric functions, and cascade layers are Baseline widely available on 2026-05-07; relative colour syntax, `contrast-color()`, `light-dark()`, `round()`, `abs()`/`sign()`, `@property`, `if()`, container style queries, and the exponential functions are not (`FX/baseline.txt`). Measured in Chromium at Foundation's defaults, `color-mix(in srgb, …)` matches `mix()` and `rgba()` exactly and matches `scale-color` within half a unit of 255 when it darkens a colour of HSL lightness up to 50% or lightens one of 50% or more (12 of 17 Foundation cases); the other 5 miss by up to 13.3 of 255 (`$success-color` hover). `color-pick-contrast` and `smart-scale` have no replacement in the target (section 3.2).
5. **One library-compiled stylesheet per family is feasible for the passing part, measured.** Compiling the 35 mixins once with all 237 settings and 22 elements substituted gives 80,035 bytes against Foundation's 71,547 (12% more), plus a `:root` block of 253 default values (9,271 bytes); in Chromium it computes the same styles as Foundation's compile for 100 elements of five families and their `::after`, and eight properties changed at runtime computed the same as Foundation compiled with the matching setting (0 differences, normal and hover states). A directive could load such a sheet with no consumer build step. What a consumer could change without a build is limited to the passing settings: not the palette, the breakpoints, the type scale, any boolean, any map's keys, or the text direction (section 4).
6. **Against the records, the approach is the runtime theming contract the bundle ruled out, and it moves Foundation's math into library CSS for the rest.** The library would compile Foundation and ship its CSS (against ADR 0012's "never imports Foundation" and "No library component or directive carries `styles`", `adr/0012-sass-packaging.md:7`), 253 public `--nfs-*` properties would be a runtime theming API (against P18, `architecture-guide.md:264`, the Out of scope line, `map.md:373`, and `building-blocks.md:245`), and replacing a failing setting's Sass math with `calc()` or `color-mix()` means editing Foundation's mixin code, which P18 forbids. The `--nfs-<setting>` pattern is already the Variant properties' namespace (ADR 0012's 2026-09-27 note, `:26-27`): 14 of the substituted names are names the bundle already uses (section 5).
7. **Yeti and this approach share the runtime model; Yeti builds it from scratch, this approach adds it on top of Foundation's Sass.** Yeti has 297 public `--yeti-*` tokens, derived at runtime with `pow()`, `oklch()`, `light-dark()`, and relative colour, none of which is in the target ([research/yeti-foundation-7.md](yeti-foundation-7.md) section 6.1, section 3.2). Over Foundation 6.9, the derived colours and scales stay compiled at Foundation's defaults, because the CSS that could derive them at runtime is outside the target (section 5.5).

## 2. Point 1: which settings survive as a property reference

### 2.1 Method (measured)

- **Which settings the mixins read.** A setting is read when some perturbation of it in ticket 191's runs changed or added to the output of one of the 35 first-milestone export mixins (`F191/results/*.json`; `FX/classify.mjs`, `readSet`). That gives 354 settings: 191's 341 that changed a default declaration, plus 13 whose perturbation only added declarations (the six whose default is `null`, such as `$button-font-weight`, five booleans, `$meter-radius`, and `$topbar-submenu-background`). By type: 124 numbers, 114 colours, 47 lists, 29 strings, 20 booleans, 14 maps, 6 nulls. `$global-flexbox` and `$xy-grid` stay `true` (user ruling, `map.md:63`).
- **Substitution.** For each setting, the assignment in a copy of `FDN/scss/settings/_settings.scss` becomes `$<setting>: var(--nfs-<setting>);`, so every setting defined from it recomputes from the reference, as it would in a consumer's settings file. For each element of a list or map setting, one more run replaces only that element with `var(--nfs-<setting>-<key or index>)` (`FX/_v.scss`, `-v-at`). That is 354 whole-setting and 180 element substitutions, 534 runs. Each compiles all 35 mixins and `foundation-global-styles` in one Dart Sass compile with markers between them (the 191 harness, `FX/lib.mjs`); when a compile fails after Foundation's import, each mixin is compiled alone to find which fail.
- **Harness checks.** The default compile matches 191's for all 36 mixins byte for byte (`FX/probe.mjs`). A literal `var(--x)` and an unquoted `'var(--x)'` string behave the same once stored in a variable (type `string`, equal, same output under negation; `FX/probe.txt` and a direct compile).
- **Classification** (`FX/classify.mjs`; unit checks in `FX/check.mjs`). Each compiled mixin is parsed with PostCSS into declarations keyed by at-rule context, selector, and property (191's `decls.mjs`). Then:
  - **compile error**: Dart Sass fails.
  - **wrong value**: the compile succeeds, but with every reference replaced in declaration values by the setting's default value as Dart Sass prints it (`.v{x:$setting}`, compressed), the output is not Foundation's default output (multiset match of key and value); or a reference sits where a browser does not substitute `var()`: in a selector, a property name, an at-rule prelude, inside a quoted string or `url()`; or it is glued to a neighbouring token (`-var(…)`, `var(…)1`), which CSS tokenizes as a different value. A substitution that reproduces the default but leaves no reference in the CSS is also a wrong value: setting the property at runtime would change nothing.
  - **passes**: it reproduces Foundation's default output, every reference is in a substitutable position, and every declaration ticket 191 found the setting changes carries the reference. No substitution reproduced the default while leaving such a declaration without the reference, so that fourth case is empty.
- **Second value.** Each of the 381 passing substitutions was compared again at a second value: Foundation compiled with the setting perturbed as in 191 (modes `a` and `b`, or the element perturbed), against the `var()` compile with each reference replaced by the perturbed value (`FX/secondvalue.mjs`, results in `FX/secondvalue.json`). Negative controls: `$button-padding` and `$reveal-zindex` (wrong at the default) also differ at both second values (`FX/check.mjs`).
- **Chromium.** The 22 wrong-value substitutions whose only fault was a declaration difference were checked once more by applying each differing rule block alone to an element and its `::before` and comparing every computed property (`FX/semantic.mjs`). Section 4 adds a full-page check of the joint stylesheet.

### 2.2 Results by type (measured)

| Type | Settings | Passes | Compile error | Wrong value |
| --- | --- | --- | --- | --- |
| number | 124 | 90 | 27 | 7 |
| colour | 114 | 85 | 28 | 1 |
| list | 47 | 42 | 2 | 3 |
| string | 29 | 20 | 4 | 5 |
| boolean | 20 | 0 | 0 | 20 |
| map | 14 | 0 | 13 | 1 |
| null | 6 | 0 | 0 | 6 |
| **Settings** | **354** | **237 (67%)** | **74 (21%)** | **43 (12%)** |
| List elements | 135 | 128 | 3 | 4 |
| Map elements | 45 | 16 | 27 | 2 |
| **Elements** | **180** | **144 (80%)** | **30** | **6** |

Every passing substitution also reproduced Foundation's output at the second values (381 of 381, `FX/secondvalue.json`). `$tooltip-pip-height` is counted as passing: its only difference at the default is that Dart Sass keeps the leading zero inside `calc()` (`calc(100% + 0.6495rem)`, `FDN/scss/components/_tooltip.scss:64`) while the default value prints as `.6495rem`, and Chromium computes the two the same.

Maps pass only element by element, and only the size maps: every element of `$button-sizes`, `$callout-sizes`, `$dropdown-sizes`, `$closebutton-size`, `$closebutton-offset-horizontal`, and `$closebutton-offset-vertical` passes (16 elements), while none of the 20 palette elements, the five `$breakpoints` values, the two `$responsive-embed-ratios`, or the off-canvas sizes does. Of the 19 list and map settings that fail whole, `$button-padding`, `$dropdownmenu-border`, `$input-border`, and the six size maps pass for some or all elements.

The class of every setting and element is in the appendix.

### 2.3 Why the failures fail (measured; source lines read)

The appendix table gives the counts per reason. The main groups:

- **Colour functions on a reference (28 settings, 20 elements; Dart Sass "is not a color").** `scale-color` for hover and background shades (`FDN/scss/components/_button.scss:194`, `:231`; `_callout.scss:71`; `_tabs.scss:99`; `_slider.scss:70`), `color-pick-contrast` and the luminance it computes from colour channels (`FDN/scss/util/_color.scss:26-29`, `:77`; `_badge.scss:59`, `_label.scss:60`, `_menu.scss:384`), `smart-scale` (`_color.scss:103-108`), `mix()` (`FDN/scss/forms/_error.scss:47`), and `background-triangle`, which reads colour channels (`FDN/scss/util/_mixins.scss:150-151`). Seven of these fail in the settings file instead, where a derived default calls a colour function on the reference (`$anchor-color-hover`, `FDN/scss/settings/_settings.scss:177`; `$button-background-hover`, `:304`; `$switch-background-focus`, `:785`; the table hovers, `:809-817`).
- **Arithmetic and comparisons (19 settings).** `Undefined operation` on `var(…) * 2` and the like: `$switch-width: $switch-height * 2` (`FDN/scss/components/_switch.scss:100`), `-1 * $drilldown-arrow-size` (`_drilldown.scss:53`), `($slider-handle-height - $slider-height) * 0.5` (`FDN/scss/forms/_range.scss:43`), `$form-spacing * 0.5` (`forms/_checkbox.scss:22`, and the settings file's `$input-padding`, `:467`), `$tooltip-pip-width * 0.866` (settings file, `:872`), and the off-canvas z-index comparisons (`_off-canvas.scss:87-89`).
- **Number functions (8 settings, 4 elements; "is not a number").** `strip-unit` and `unit` inside `rem-calc` and `-zf-bp-to-em` (`FDN/scss/util/_unit.scss:20`, `:30-41`, `:62-66`), which every `$breakpoints` value and `$global-font-size` pass through, and the lightness amounts given to `scale-color` (`$button-background-hover-lightness`, `$callout-background-fade`). `rem-calc` itself passes a non-number through with a warning (`_unit.scss:79-86`), so a reference that reaches it compiles but keeps its pixel value (measured in `FX/probe.txt`).
- **Selectors and maps (17 settings, 3 elements).** A reference interpolated into a selector fails ("expected selector"): the palette loops (`_button.scss:377`, `_badge.scss:57`, `_label.scss:58`), `$breakpoint-classes` (`_menu.scss:415-427`), `$buttongroup-child-selector` (`_button-group.scss:55`), `$maincontent-class` (`_off-canvas.scss:207`). A whole map replaced by one reference fails in `map-get` and `map-has-key` (`_close-button.scss:72`, `_responsive-embed.scss:24`, `_callout.scss:53`, `FDN/scss/util/_color.scss:126`).
- **Wrong values (43 settings, 6 elements).** Booleans: a reference is a truthy string, so the 15 that default to `true` emit what `true` emits with no reference left, and the five tested by `== true` or defaulting to `false` take another branch (`$table-is-striped`, `FDN/scss/components/_table.scss:242`, `:258`). The six `null` settings: the reference adds a declaration Foundation omits. Keywords that choose a selector, a media query, or a value: `$global-text-direction` (`FDN/scss/_global.scss:127-128`), `$table-stack-breakpoint` and `$topbar-unstack-breakpoint`, where `breakpoint(var(…))` emits the rules with no media query (`_table.scss:312`, `_top-bar.scss:130`), `$button-fill`, `$table-stripe`. `nth()`, map lookups, and comparisons: `$button-padding` and `$input-border` lose their second element, `$topbar-submenu-background` turns on a rule Foundation emits only when it differs from `$topbar-background` (`_top-bar.scss:53-55`). Glued tokens: `$reveal-zindex + 1` becomes `var(…)1` (`_reveal.scss:72`), `rem-calc(-$border-width)` becomes `-var(…)` (`_button-group.scss:92`), `translateX(-$size)` becomes `translateX(-var(…))` (`_off-canvas.scss:202`). Two `$closebutton-position` elements become property names (`_close-button.scss:81-82`).
- **`has-value()` on a zero default (4 settings).** `$global-radius`, `$progress-radius`, `$slider-radius`, and `$meter-radius` default to `0`, and Foundation emits their `border-radius` only when `has-value()` is true (`FDN/scss/util/_value.scss:14-25`; `FDN/scss/components/_progress-bar.scss:35`; `forms/_range.scss:56`; `forms/_meter.scss:48`). The reference makes `has-value()` true, so rule blocks gain a `border-radius` (18 for `$global-radius`, 7, 4, and 7 for the others) that, applied alone, computes the same as Foundation's (`FX/semantic.json`); for `$progress-radius`, the one rerun, the output equals Foundation's at both non-zero second values (`FX/check.mjs`). On a page the added `border-radius: 0` still overrides a less specific rule that sets a radius (inferred).

### 2.4 Derived defaults (measured, with one inference)

Of the 237 passing settings, 99 have a literal default, 107 are plain aliases of another setting (`$tab-background: $white`), and 31 compute from another setting (`$button-background-hover: scale-color($button-background, …)`, `$input-shadow: inset 0 1px 2px rgba($black, 0.1)`). A passing derived setting becomes its own property with Foundation's computed default, so it no longer follows its source. Measured: setting `--nfs-button-background-hover` changes the hover background of the plain `.button` only (5 properties in the hover state), while every palette button keeps the hover colour Sass computed (`FX/runtime.txt`). For a plain alias, a default written as `--nfs-tab-background: var(--nfs-white)` would keep the link (inferred; not compiled), but `$white` itself cannot be a property.

The 11 substitutions that fail in the settings file were rerun with every setting derived from them, directly or through other settings, frozen at its default value, as a library-owned settings file could do (`FX/freeze.mjs`, `FX/freeze.json`). None then passes: 3 still fail in mixin code (`$form-spacing`, the palette's `primary`, `$button-background`), 3 leave no reference because every use goes through a frozen derived setting (`$medium-gray`, `$anchor-color`, `$table-hover-scale`), and 5 reach only the declarations that use them directly.

## 3. Point 2: what fails, and which CSS functions could replace it

### 3.1 Selectors, media queries, and rule presence (measured)

Ticket 191 found that 653 of the 1,091 setting-dependent declarations (60%) depend on a setting through their selector, media query, or presence (`research/structure-theme-split.md` section 3.4). Placing each of the 1,091 by what its settings did in 191's runs and what this ticket's substitutions carry (`FX/joint.mjs`):

| Group | Declarations | What it means for a library-compiled sheet |
| --- | --- | --- |
| Every setting it depends on is a passing property, and none shapes its selector or media query | 102 | Follows the properties for any value. |
| Its value follows passing properties, but a setting also shapes its selector, media query, or presence | 81 | Value runtime, shape fixed at Foundation's defaults. |
| Depends on settings only through selector, media query, presence, or a boolean | 336 | Fixed at Foundation's defaults. |
| Depends on at least one setting that is not a passing property | 572 | That dependency fixed at Foundation's default: 508 through a compile error, 62 through a wrong value, 2 only through 191's joint run. |

The CSS specification rules out the third group outright: "The var() function can not be used as property names, selectors, or anything else besides property values" (https://www.w3.org/TR/2022/CR-css-variables-1-20220616/, section 3). In the browser target nothing else can make a selector, a media query, or a rule's presence depend on a runtime value: container style queries are Baseline newly available only from 2026-05-19, `if()` is not Baseline, and `attr()` beyond `content` is not Baseline (`FX/baseline.txt`). Within the target the only way to keep these settings is the consumer's Sass compile.

### 3.2 Sass math and the CSS that could replace it (Baseline measured; equivalence measured where stated)

| Sass operation on a setting (where) | Settings and elements it stops | CSS candidate | Baseline widely available on 2026-05-07 | Equivalence |
| --- | --- | --- | --- | --- |
| `*`, `/`, `+`, `-`, unary minus (`_switch.scss:100`, `_range.scss:43`, `_drilldown.scss:53`, `_reveal.scss:72`) | 14 compile errors, 5 glued tokens | `calc()` (`calc`, widely since 2018-01-29), `calc(-1 * var(…))` | yes | Inferred exact (plain arithmetic); not measured. |
| Comparisons for z-index (`_off-canvas.scss:87-89`) | 5 | `max()` (`min-max-clamp`, widely since 2023-01-28): `max(var(--push), calc(var(--overlay) + 1))` | yes | Inferred exact for integers; not measured. |
| `rem-calc`, `strip-unit`, `-zf-bp-to-em` unit conversion (`_unit.scss:20-100`) | 8, 4 elements | `calc(var(--x) / 16 * 1rem)` for a unitless input; dividing two lengths needs typed arithmetic, or Yeti's `tan(atan2(a, b))` (`trig-functions`, widely since 2025-09-13; [research/yeti-foundation-7.md](yeti-foundation-7.md) section 6.1) | partly | Not measured. Breakpoints still cannot reach a media query (3.1). |
| `scale-color($c, $lightness: ±p)` (`_button.scss:194`, `:231`, `_callout.scss:71`, settings `:177`, `:304`, `:785`) | most of the 48 colour failures | exact: relative colour `hsl(from var(--c) h s calc(l * 0.85))` (`relative-color`, newly 2024-09-16); approximate: `color-mix(in srgb, var(--c) 85%, black)` or `…, white)` (`color-mix`, widely since 2025-11-09) | relative colour no; `color-mix()` yes | Measured (`FX/colors.txt`): within 0.5 of 255 per channel for 12 of 17 Foundation cases, the ones that darken a colour of HSL lightness up to 50% or lighten one of 50% or more (where an sRGB mix with black or white keeps the HSL saturation); off by 13.3 for `$success-color` hover, 8.0 for its hollow hover, 5.35 for the `$primary-color` callout background, 1.75 and 1.50 for `$alert-color` hover and hollow hover (lightness 50.8%). |
| `color.adjust($c, $lightness: -x)` (settings `:809-817`) | table hovers | relative colour; approximate `color-mix()` | no; yes | Measured on `#fefefe`: 0.08 of 255. Inferred: absolute lightness steps have no `color-mix()` form in general. |
| `mix($a, $b, w)` (`forms/_error.scss:47`) | `$input-background-invalid` | `color-mix(in srgb, a w%, b)` | yes | Measured: 0.10 of 255. |
| `rgba($c, a)` (settings `:337`, `:468`, `:529`-`:553`) | `$black`, `$white` in part | `color-mix(in srgb, var(--c) a%, transparent)` | yes | Measured: exact (0.00). |
| `color-pick-contrast` (`_color.scss:77`; button, badge, label, callout, menu, orbit, tabs) | palette colours, `$black`, `$white`, many component colours | `contrast-color()` | no (newly 2026-04-10) | None in the target. |
| `smart-scale` (lightness threshold, `_color.scss:103-108`) | `$table-background`, `$primary-color` in tabs | relative colour plus a conditional | no | None in the target. |
| `nth()`, `get-side()`, `map-get` on a list or map (`_close-button.scss:81-93`, `forms/_text.scss:86`) | 6 lists and maps whole | one property per element | yes (custom properties) | Measured: 144 of 180 elements pass (section 2.2). |
| `if()`, `@if`, `has-value()` on a value (`_value.scss:14-25`, `_top-bar.scss:53`) | 4 radii, `$topbar-submenu-background`, keyword and boolean switches | CSS `if()`, container style queries | no | None in the target; the radii are harmless at `0` in isolation (2.3). |

Also outside the target, and so not usable for this: `light-dark()` (newly 2024-05-13), `@property` (newly 2024-07-09), `round()`/`mod()` (newly 2024-05-17), `abs()`/`sign()` (newly 2025-06-26), and the exponential functions (`pow()`, widely only from 2026-06-07) (`FX/baseline.txt`).

Every replacement in this table is a rewrite of the Foundation line it names: the math sits in Foundation's mixin and function bodies (93 of the 104 failures), not in the settings file. Section 5.2 takes this up against P18.

## 4. Point 3: one library-compiled stylesheet per family, with no consumer build step (measured)

`FX/joint.mjs` compiles the 35 mixins once from Foundation's own settings file with every passing whole setting (237) substituted, and, for the list and map settings that fail whole, every passing element (22). Results:

- It compiles, and with every reference replaced by its default the output equals Foundation's default compile in 35 of 36 mixins; the 36th, `foundation-tooltip`, differs by the leading zero of 2.2. No `--nfs-` name appears outside a `var()` call.
- 357 of the 1,714 declarations of the 35 mixins read a property, all of them among 191's 1,091 setting-dependent declarations; 253 distinct properties appear. `foundation-sticky` reads none, `foundation-forms` the most (50 declarations, 37 properties).
- Size: 71,547 bytes minified for the 35 mixins becomes 80,035 (12% more), plus one `:root` block of the 253 default values, 9,271 bytes. Gzipped as one concatenation, 11,100 becomes 13,933 bytes; as 35 separate files, each with its own `:root` block, 17,741 becomes 20,743 (17% more). Writing each reference as `var(--nfs-x, <default>)` instead of a `:root` block was not measured.
- In Chromium, for 72 buttons (6 colours, 3 fills, 4 sizes), a dropdown and a disabled button, two dropdown menus with active items, and five callouts with close buttons (100 elements, each with its `::after`), the joint sheet with its `:root` block computes the same styles as Foundation's default compile (0 differences, normal and hover states). Eight properties set at runtime (`--nfs-button-radius: 8px`, `--nfs-button-padding-1`, `--nfs-button-sizes-large`, `--nfs-button-background-hover`, `--nfs-dropdownmenu-min-width`, `--nfs-dropdown-menu-item-color-active`, `--nfs-callout-sizes-large`, `--nfs-closebutton-color`) computed the same as Foundation compiled with the matching setting, 0 differences in both states, while changing up to 592 computed properties from the default (`FX/runtime.mjs`, `FX/runtime.txt`).

Per mixin (dependent = 191's setting-dependent declarations; groups as in 3.1):

| Export mixin | Declarations | Dependent | Dependent reading a property | All settings properties | Value property, shape fixed | Shape only | A setting not a property | Properties | Bytes min, Foundation / with references |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `foundation-button` | 109 | 81 | 13 | 2 | 9 | 1 | 69 | 13 | 8643 / 8873 |
| `foundation-button-group` | 96 | 85 | 7 | 1 | 6 | 21 | 57 | 6 | 15294 / 15467 |
| `foundation-close-button` | 14 | 11 | 9 | 1 | 6 | 0 | 4 | 9 | 330 / 627 |
| `foundation-label` | 19 | 15 | 4 | 1 | 1 | 0 | 13 | 4 | 405 / 477 |
| `foundation-progress-bar` | 23 | 11 | 4 | 2 | 0 | 0 | 9 | 4 | 635 / 738 |
| `foundation-slider` | 50 | 16 | 9 | 6 | 2 | 0 | 8 | 6 | 1143 / 1341 |
| `foundation-switch` | 76 | 52 | 11 | 3 | 2 | 2 | 45 | 9 | 2036 / 2269 |
| `foundation-table` | 34 | 27 | 15 | 3 | 0 | 5 | 19 | 11 | 1334 / 1477 |
| `foundation-badge` | 18 | 15 | 4 | 3 | 0 | 0 | 12 | 4 | 382 / 463 |
| `foundation-breadcrumbs` | 21 | 12 | 8 | 0 | 2 | 3 | 7 | 8 | 508 / 754 |
| `foundation-callout` | 27 | 24 | 12 | 0 | 10 | 0 | 14 | 6 | 853 / 1121 |
| `foundation-card` | 20 | 9 | 9 | 5 | 1 | 0 | 3 | 8 | 437 / 616 |
| `foundation-dropdown` | 16 | 9 | 9 | 3 | 3 | 0 | 3 | 9 | 375 / 577 |
| `foundation-pagination` | 35 | 25 | 17 | 2 | 2 | 8 | 13 | 13 | 1106 / 1568 |
| `foundation-tooltip` | 71 | 18 | 14 | 5 | 0 | 0 | 13 | 10 | 1598 / 1928 |
| `foundation-accordion` | 30 | 22 | 14 | 2 | 7 | 5 | 8 | 11 | 914 / 1270 |
| `foundation-media-object` | 15 | 9 | 5 | 1 | 4 | 4 | 0 | 3 | 650 / 822 |
| `foundation-orbit` | 44 | 18 | 12 | 8 | 0 | 1 | 9 | 10 | 1166 / 1508 |
| `foundation-responsive-embed` | 11 | 4 | 1 | 0 | 0 | 1 | 3 | 1 | 411 / 448 |
| `foundation-tabs` | 38 | 20 | 13 | 6 | 1 | 1 | 12 | 11 | 1076 / 1363 |
| `foundation-thumbnail` | 10 | 6 | 6 | 1 | 1 | 0 | 4 | 6 | 322 / 396 |
| `foundation-menu` | 77 | 40 | 9 | 2 | 6 | 26 | 6 | 5 | 3832 / 4034 |
| `foundation-menu-icon` | 34 | 8 | 4 | 0 | 0 | 0 | 8 | 2 | 727 / 883 |
| `foundation-accordion-menu` | 55 | 31 | 9 | 2 | 4 | 18 | 7 | 6 | 1645 / 1947 |
| `foundation-drilldown-menu` | 65 | 54 | 10 | 1 | 3 | 36 | 14 | 8 | 1746 / 1995 |
| `foundation-dropdown-menu` | 187 | 154 | 22 | 3 | 5 | 107 | 39 | 11 | 5581 / 6252 |
| `foundation-off-canvas` | 174 | 124 | 13 | 6 | 0 | 64 | 54 | 6 | 7443 / 7937 |
| `foundation-reveal` | 68 | 30 | 10 | 1 | 1 | 18 | 10 | 7 | 1621 / 1817 |
| `foundation-sticky` | 13 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 329 / 329 |
| `foundation-title-bar` | 13 | 6 | 6 | 4 | 0 | 0 | 2 | 5 | 335 / 482 |
| `foundation-top-bar` | 28 | 17 | 4 | 3 | 1 | 13 | 0 | 4 | 1070 / 1148 |
| `foundation-forms` | 138 | 82 | 50 | 14 | 4 | 2 | 62 | 37 | 4903 / 5868 |
| `foundation-range-input` | 42 | 25 | 9 | 8 | 0 | 0 | 17 | 4 | 1072 / 1285 |
| `foundation-progress-element` | 26 | 21 | 6 | 2 | 0 | 0 | 19 | 4 | 1016 / 1171 |
| `foundation-meter-element` | 17 | 10 | 9 | 1 | 0 | 0 | 9 | 5 | 609 / 784 |
| **35 mixins** | **1,714** | **1,091** | **357** | **102** | **81** | **336** | **572** | **253 distinct** | **71,547 / 80,035** |

What this would make possible for lazy family styles (inferred from the measurements and from [research/lazy-style-loading.md](lazy-style-loading.md)):

- **A family sheet identical for every consumer.** The sheet is compiled once with the library, so a directive could carry or link it through the mechanisms 182 measured (a library-compiled carrier component's `styles`, M1, or a `<link>` counted by `SharedStylesHost`, M3; `lazy-style-loading.md:22-25`) with no consumer carrier files, generator, or Sass plugin, which the consumer-compiled options of 184 and 191 need (`research/structure-theme-split.md` section 5).
- **Theme by property, within the passing set.** A consumer could change 237 settings and 22 elements at runtime, on `:root` or on any element's subtree, with no build.
- **But the consumer's Sass settings would stop reaching the family sheets.** A consumer who changes a palette colour, `$black`/`$white`, a breakpoint, the type scale, a boolean, a map's keys, the text direction, or any other failing setting gets no effect from the library's sheet, because the sheet holds Foundation's defaults there. That consumer still needs a consumer-compiled sheet, which brings back the 184 and 191 mechanisms, and the library sheet then repeats what the consumer's sheet has. 191's cascade result (theme sheet first, structure second) would apply again to any such pair (not measured here).
- **Families and order are unchanged.** The joint sheet keeps Foundation's per-mixin output and source order, so 183's cross-family needs (menu before drilldown and dropdown menu) and the unscoped rules of the form, table, and global mixins carry over as they are (`research/foundation-sass-per-family.md` section 1, items 4 and 5).

## 5. Point 4: costs against the records, and Yeti

### 5.1 ADR 0012 (inferred from the record's text and the measurements)

- "never imports Foundation itself" and "No library component or directive carries `styles`" (`adr/0012-sass-packaging.md:7`): a library-compiled sheet needs both, as 191's compile diffing did. ADR 0012 rejected component `styles` because they "are compiled at library build time, where the consumer's settings do not exist" (`:13`); properties answer that for the 237 passing settings and not for the other 117, whose values the sheet fixes at Foundation's defaults.
- "A prebuilt CSS file … left out of the first release" (`:14`): the joint sheet is such a file.
- The record's consumer contract, "Their Foundation settings reach the library with no extra arguments" (Consequences), would hold only for consumers who also compile their own family sheets.
- The peer range `^6.9.0`: the set of passing settings is a measurement of 6.9.0 and would be measured again for each Foundation release, as 191's invariant list would.

### 5.2 Architecture guide P18 (record text quoted; consequences inferred)

P18 reads: "the library never imports Foundation and never re-implements a style Foundation has; … no directive or component declares `styles` or `styleUrl`; Sass settings stay compile-time and never become inputs; there is no runtime theming API, and a `--nfs-*` property is an implementation channel for a runtime value CSS must read (a measurement or an input value) or a list the Variant declaration tooling reads (the Variant properties), not theming" (`architecture-guide.md:264`).

- The passing part does not re-implement Foundation: it is Foundation's own mixins compiled with a library-owned settings file. It does make 237 settings runtime values, against "Sass settings stay compile-time", and 253 public properties are a runtime theming API.
- Extending the passing part to the failing settings means rewriting the Foundation lines of section 3.2 (`scale-color` to `color-mix()`, arithmetic to `calc()`, a lightness branch to nothing). 93 of the 104 failures are inside Foundation's mixin and function bodies, so each is a library copy of a Foundation rule, which P18 forbids. Where `color-mix()` approximates `scale-color`, the copy would also compute a different colour from Foundation's (13.3 of 255 for `$success-color` hover), outside the "one code path" spirit of building-blocks 1.2 (inferred).
- The 11 failures in the settings file alone are within the library's own settings file, but freezing their derived settings made none pass (2.4).

### 5.3 The Out of scope line and building-blocks

"Runtime theming through custom properties as a component contract" (`map.md:373`) and "Out of scope for the specs: runtime theming through CSS custom properties as a public contract" (`building-blocks.md:245`): a property per setting that a consumer is told to set is that contract. The orchestrator's note in the ticket records this as an input; the measurement adds only its size (253 properties for the first-milestone families).

### 5.4 Variant declaration tooling (ADR 0040) and the `--nfs-*` namespace (measured where stated)

- **Namespace.** ADR 0012's 2026-09-27 note gives each Open Variant family a `--nfs-<setting>` property on `:root` that lists the names a setting generates (`adr/0012-sass-packaging.md:26-27`), read by the generator and the runtime checks. This approach names properties the same way. Of the 534 substituted names, 14 are names the bundle's specs and records already use (`FX/bundle-names.txt`): 11 Variant properties (`--nfs-button-palette`, `--nfs-breakpoint-classes`, `--nfs-callout-sizes`, `--nfs-button-responsive-expanded`, and the like); `--nfs-slider-handle-width`, which the Slider spec's own custom CSS sets from `rem-calc($slider-handle-width)` (`specs/slider.md:676`); `--nfs-table-is-striped`, a property the Table spec rejected (`specs/table.md:383`); and `--nfs-button-color`, which P18's example lists under "Avoided" as "a documented theming hook" (`architecture-guide.md:269`). Only `--nfs-slider-handle-width` belongs to a passing setting; the others belong to settings that fail whole, but a second meaning for the same pattern is a cost either way.
- **The declaration file.** ADR 0040's generator writes the consumer's Variant declaration file from the Variant properties in the application's compiled global stylesheet (`adr/0040-variant-input-types.md:11`). A consumer with no Sass build has no such stylesheet; but, measured above, the settings that make Variant names (palettes, size map keys, `$breakpoint-classes`) cannot be properties, so a no-build consumer's Variant names are Foundation's defaults and its registries stay empty (inferred). A consumer who changes them is back on a Sass build, so the tooling would serve two kinds of consumer.
- **Defaults.** ADR 0040's "the consumer's Sass default is the look" (`:15`) would become "the library's compiled default plus the consumer's properties" for no-build consumers (inferred).

### 5.5 Compared with Yeti's token model ([research/yeti-foundation-7.md](yeti-foundation-7.md), read 2026-10-01)

| | Foundation 6.9 with runtime properties (this ticket) | Yeti 7.0.0-alpha.0 |
| --- | --- | --- |
| Public runtime values | 253 `--nfs-*` properties in the first-milestone sheet, one per passing setting or element, named after Sass settings | 297 public `--yeti-*` tokens in 39 groups, plus 449 private `--_yeti-*` (yeti section 6.1) |
| Derived values | Fixed at Foundation's compiled defaults for the 117 failing settings; 31 passing derived settings become independent properties | Recomputed at runtime: a type and space scale through `pow()`, colour roles through `oklch()` and `light-dark()`, tones through `color-mix()` and relative colour (yeti section 6.1) |
| Selectors and variants | Fixed at Foundation's default palette, sizes, breakpoints, and booleans; changing them needs the consumer's Sass | Fixed class names and attribute value lists, frozen by policy (yeti section 2.5); no Sass |
| Browser floor | Inside the map's target for what passes; the CSS that could replace the failing math is mostly outside it (3.2) | Baseline 2025; `light-dark()`, `pow()`, relative colour, and `@property` are outside the target (yeti section 3.2) |
| Lazy family styles | One library-compiled sheet per family, the same for every consumer who stays within the passing settings | Every component file identical for every consumer, in its own `@layer yeti.<kind>` (yeti finding 7) |
| Records | Against ADR 0012, P18, and the Out of scope line (5.1 to 5.3) | "The styling model is the one this effort ruled out" (yeti finding 6) |

The difference that matters (inferred): Yeti's runtime model works because its tokens were designed to be derived at runtime with CSS newer than the map's target. Laid over Foundation 6.9, the same model reaches the values Foundation prints directly but not the ones Foundation computes, and those include the palette.

## 6. Open unknowns

1. **Values beyond the three measured.** Each passing substitution matched Foundation at its default and at one or two perturbed values. A threshold in Foundation's code that those values never crossed (like `has-value()` at `0`, found here for four radii) could still make a passing setting wrong at some other value.
2. **Foundation's `!default` variables outside the settings file** (`$contrast-warnings`, `$unit-warnings`, the five `$<name>-color` aliases) were not substituted on their own, as in 191.
3. **The CSS replacements.** Only the colour candidates were computed in a browser, at Foundation's default colours, in Chromium. The `calc()`, `max()`, and unit-conversion forms are not compiled or measured, and no rewritten Foundation mixin exists.
4. **The runtime check covers five families in Chromium.** Firefox and WebKit, the other 30 families' markup, and the focus state were not checked; the textual comparison covers all 35 mixins.
5. **Delivery.** Whether the sheet ships with a `:root` block or with `var(--x, <default>)` fallbacks, its size in that form, and how it behaves with critical-CSS inlining and the `SharedStylesHost` count were not measured.
6. **Aliases as references.** Writing alias defaults as `var(--nfs-<source>)` to keep derived links was not compiled.
7. **`foundation-global-styles`** reads one property in the joint sheet (`$body-font-family` and the like reach only it); it is outside the 35 and not classified separately.

## 7. Reproduction

All under `FX/` (`D:/tmp/nfs-research-196`, not committed), Node 24.18.0, `sass@1.104.1`, `postcss@8`, `web-features@3.40.1`, `playwright-core@1.63.0`:

- `lib.mjs` (compile harness, from 191's), `scan.mjs` and `decls.mjs` (copied from 191), `types.json` (191's), `_v.scss` (element references), `_perturb.scss` (191's perturbation functions).
- `probe.mjs` (harness checks; `probe.txt`), `check.mjs` (unit checks and controls).
- `classify.mjs` (`node classify.mjs 12`; the substitution and classification, results in `results/part-*.json`), `report.mjs` (tallies), `errgroups.mjs`, `wrongdetail.mjs`, `appendix.mjs` (writes `appendix.md`, the appendix below).
- `semantic.mjs` (`semantic.json`), `secondvalue.mjs` (`node secondvalue.mjs 12`; `secondvalue.json`), `freeze.mjs` (`freeze.json`).
- `baseline.mjs` (`node baseline.mjs <ids>`; `baseline.txt`), `colors.mjs` (`colors.txt`).
- `joint.mjs` (`joint.json`, `joint-table.md`, `out-joint/`), `runtime.mjs` (`runtime.txt`).
- `css-variables-1.html`: the CSS Custom Properties Level 1 Candidate Recommendation of 2022-06-16, fetched with `curl` (markdown.new returned a Cloudflare challenge page).

## Appendix: every substitution by class and reason (measured, `FX/appendix.md`)

| Class and reason | Settings | Elements |
| --- | --- | --- |
| passes | 237 | 144 |
| compile error: colour function given a reference (mixin code) | 21 | 19 |
| wrong value: boolean defaulting to true, the reference is truthy and never reaches the CSS | 15 | 0 |
| compile error: arithmetic on a reference (mixin code) | 12 | 0 |
| compile error: reference interpolated into a selector (mixin code) | 9 | 3 |
| compile error: map function given a reference (mixin code) | 8 | 0 |
| compile error: number function given a reference (unit, strip-unit, lightness amount) (mixin code) | 7 | 4 |
| compile error: colour function given a reference (settings file) | 7 | 1 |
| wrong value: default null: the reference adds a declaration Foundation omits | 6 | 0 |
| wrong value: boolean tested by comparison or negation: the reference takes another branch | 5 | 0 |
| wrong value: keyword compared or used to pick a selector, media query, or value | 5 | 0 |
| wrong value: nth(), a map lookup, or a comparison picks a different value or rule | 5 | 2 |
| compile error: comparison on a reference (mixin code) | 5 | 0 |
| wrong value: has-value() branch on 0: extra declarations that compute to the initial value in isolation | 4 | 0 |
| wrong value: reference glued to a sign, a number, or another value (Sass string concatenation) | 3 | 2 |
| compile error: arithmetic on a reference (settings file) | 2 | 0 |
| compile error: Foundation's own guard or lookup (mixin code) | 1 | 1 |
| compile error: list index on a reference (mixin code) | 1 | 2 |
| compile error: number function given a reference (unit, strip-unit, lightness amount) (settings file) | 1 | 0 |
| wrong value: reference becomes a property name | 0 | 2 |

**passes** (237 settings, 144 elements)

- Settings: `accordion-background`, `accordion-content-background`, `accordion-content-border`, `accordion-content-color`, `accordion-content-padding`, `accordion-item-background-hover`, `accordion-item-color`, `accordion-item-padding`, `accordion-minus-content`, `accordion-plus-content`, `accordion-title-font-size`, `accordionmenu-arrow-color`, `accordionmenu-nested-margin`, `accordionmenu-padding`, `accordionmenu-submenu-padding`, `accordionmenu-submenu-toggle-height`, `accordionmenu-submenu-toggle-width`, `badge-background`, `badge-font-size`, `badge-minwidth`, `badge-padding`, `breadcrumbs-item-color-current`, `breadcrumbs-item-color-disabled`, `breadcrumbs-item-color`, `breadcrumbs-item-font-size`, `breadcrumbs-item-margin`, `breadcrumbs-item-separator-color`, `breadcrumbs-item-separator-item`, `breadcrumbs-margin`, `button-background-hover`, `button-border`, `button-font-family`, `button-margin`, `button-opacity-disabled`, `button-radius`, `button-transition`, `buttongroup-margin`, `buttongroup-spacing`, `callout-border`, `callout-margin`, `callout-radius`, `card-background`, `card-border-radius`, `card-border`, `card-divider-background`, `card-font-color`, `card-margin-bottom`, `card-padding`, `card-shadow`, `closebutton-color-hover`, `closebutton-color`, `closebutton-z-index`, `drilldown-arrow-color`, `drilldown-background`, `drilldown-nested-margin`, `drilldown-padding`, `drilldown-submenu-background`, `drilldown-submenu-padding`, `drilldown-transition`, `dropdown-background`, `dropdown-border`, `dropdown-font-size`, `dropdown-menu-item-background-active`, `dropdown-menu-item-color-active`, `dropdown-padding`, `dropdown-radius`, `dropdown-width`, `dropdownmenu-arrow-color`, `dropdownmenu-arrow-padding`, `dropdownmenu-min-width`, `dropdownmenu-nested-margin`, `dropdownmenu-padding`, `dropdownmenu-submenu-background`, `dropdownmenu-submenu-padding`, `fieldset-border`, `fieldset-margin`, `fieldset-padding`, `form-button-radius`, `form-label-color-invalid`, `form-label-color`, `form-label-font-size`, `form-label-font-weight`, `form-label-line-height`, `global-margin`, `global-menu-nested-margin`, `global-menu-padding`, `global-padding`, `global-weight-bold`, `global-weight-normal`, `global-width`, `has-tip-border-bottom`, `has-tip-cursor`, `has-tip-font-weight`, `helptext-color`, `helptext-font-size`, `helptext-font-style`, `input-background-disabled`, `input-background-focus`, `input-background`, `input-border-focus`, `input-color`, `input-cursor-disabled`, `input-error-color`, `input-error-font-size`, `input-error-font-weight`, `input-font-family`, `input-font-weight`, `input-placeholder-color`, `input-prefix-background`, `input-prefix-border`, `input-prefix-color`, `input-prefix-padding`, `input-radius`, `input-shadow-focus`, `input-shadow`, `input-transition`, `label-background`, `label-font-size`, `label-padding`, `label-radius`, `legend-padding`, `light-gray`, `mediaobject-image-width-stacked`, `mediaobject-margin-bottom`, `mediaobject-section-padding`, `menu-icon-spacing`, `menu-items-padding`, `menu-nested-margin`, `menu-simple-margin`, `meter-background`, `meter-fill-bad`, `meter-fill-good`, `meter-fill-medium`, `meter-height`, `offcanvas-background`, `offcanvas-exit-background`, `offcanvas-inner-shadow-color`, `offcanvas-shadow`, `offcanvas-transition-length`, `offcanvas-transition-timing`, `orbit-bullet-background-active`, `orbit-bullet-background`, `orbit-bullet-diameter`, `orbit-bullet-margin-bottom`, `orbit-bullet-margin-top`, `orbit-bullet-margin`, `orbit-caption-padding`, `orbit-control-background-hover`, `orbit-control-padding`, `orbit-control-zindex`, `pagination-arrow-next`, `pagination-arrow-previous`, `pagination-ellipsis-color`, `pagination-font-size`, `pagination-item-background-current`, `pagination-item-background-hover`, `pagination-item-color-current`, `pagination-item-color-disabled`, `pagination-item-color`, `pagination-item-padding`, `pagination-item-spacing`, `pagination-margin-bottom`, `pagination-radius`, `progress-background`, `progress-height`, `progress-margin-bottom`, `progress-meter-background`, `responsive-embed-margin-bottom`, `reveal-background`, `reveal-border`, `reveal-max-width`, `reveal-overlay-background`, `reveal-padding`, `reveal-radius`, `reveal-width`, `select-background`, `select-radius`, `slider-background`, `slider-fill-background`, `slider-handle-width`, `slider-opacity-disabled`, `slider-transition`, `slider-width-vertical`, `small-font-size`, `switch-background-active-focus`, `switch-background-focus`, `switch-cursor-disabled`, `switch-margin`, `switch-opacity-disabled`, `switch-paddle-background`, `switch-paddle-radius`, `switch-paddle-transition`, `switch-radius`, `tab-active-color`, `tab-background-active`, `tab-background`, `tab-content-background`, `tab-content-border`, `tab-content-color`, `tab-content-padding`, `tab-item-background-hover`, `tab-item-font-size`, `tab-item-padding`, `tab-margin`, `table-border`, `table-foot-font-color`, `table-foot-row-hover`, `table-head-font-color`, `table-head-row-hover`, `table-padding`, `table-row-hover`, `table-row-stripe-hover`, `table-striped-background`, `thumbnail-border`, `thumbnail-margin-bottom`, `thumbnail-radius`, `thumbnail-shadow-hover`, `thumbnail-shadow`, `thumbnail-transition`, `titlebar-background`, `titlebar-color`, `titlebar-icon-color-hover`, `titlebar-icon-color`, `titlebar-icon-spacing`, `titlebar-padding`, `titlebar-text-font-weight`, `tooltip-background-color`, `tooltip-color`, `tooltip-font-size`, `tooltip-max-width`, `tooltip-padding`, `tooltip-pip-height`, `tooltip-radius`, `topbar-background`, `topbar-input-width`, `topbar-padding`, `topbar-title-spacing`
- Elements: `accordion-content-border[1]`, `accordion-content-border[2]`, `accordion-content-border[3]`, `accordion-item-padding[1]`, `accordion-item-padding[2]`, `accordionmenu-padding[1]`, `accordionmenu-padding[2]`, `accordionmenu-submenu-padding[1]`, `accordionmenu-submenu-padding[2]`, `breadcrumbs-margin[1]`, `breadcrumbs-margin[2]`, `breadcrumbs-margin[3]`, `breadcrumbs-margin[4]`, `button-border[1]`, `button-border[2]`, `button-border[3]`, `button-margin[1]`, `button-margin[2]`, `button-margin[3]`, `button-margin[4]`, `button-padding[1]`, `button-padding[2]`, `button-sizes[default]`, `button-sizes[large]`, `button-sizes[small]`, `button-sizes[tiny]`, `button-transition[1]`, `button-transition[2]`, `callout-border[1]`, `callout-border[2]`, `callout-border[3]`, `callout-margin[1]`, `callout-margin[2]`, `callout-margin[3]`, `callout-margin[4]`, `callout-sizes[default]`, `callout-sizes[large]`, `callout-sizes[small]`, `card-border[1]`, `card-border[2]`, `card-border[3]`, `closebutton-offset-horizontal[medium]`, `closebutton-offset-horizontal[small]`, `closebutton-offset-vertical[medium]`, `closebutton-offset-vertical[small]`, `closebutton-size[medium]`, `closebutton-size[small]`, `drilldown-padding[1]`, `drilldown-padding[2]`, `drilldown-submenu-padding[1]`, `drilldown-submenu-padding[2]`, `drilldown-transition[1]`, `drilldown-transition[2]`, `drilldown-transition[3]`, `dropdown-border[1]`, `dropdown-border[2]`, `dropdown-border[3]`, `dropdown-sizes[large]`, `dropdown-sizes[small]`, `dropdown-sizes[tiny]`, `dropdownmenu-border[2]`, `dropdownmenu-border[3]`, `dropdownmenu-padding[1]`, `dropdownmenu-padding[2]`, `dropdownmenu-submenu-padding[1]`, `dropdownmenu-submenu-padding[2]`, `fieldset-border[1]`, `fieldset-border[2]`, `fieldset-border[3]`, `fieldset-margin[1]`, `fieldset-margin[2]`, `global-menu-padding[1]`, `global-menu-padding[2]`, `has-tip-border-bottom[1]`, `has-tip-border-bottom[2]`, `has-tip-border-bottom[3]`, `input-border-focus[1]`, `input-border-focus[2]`, `input-border-focus[3]`, `input-border[2]`, `input-border[3]`, `input-prefix-border[1]`, `input-prefix-border[2]`, `input-prefix-border[3]`, `input-shadow-focus[1]`, `input-shadow-focus[2]`, `input-shadow-focus[3]`, `input-shadow-focus[4]`, `input-shadow[1]`, `input-shadow[2]`, `input-shadow[3]`, `input-shadow[4]`, `input-shadow[5]`, `input-transition[1]`, `input-transition[2]`, `label-padding[1]`, `label-padding[2]`, `legend-padding[1]`, `legend-padding[2]`, `menu-items-padding[1]`, `menu-items-padding[2]`, `offcanvas-shadow[1]`, `offcanvas-shadow[2]`, `offcanvas-shadow[3]`, `offcanvas-shadow[4]`, `pagination-item-padding[1]`, `pagination-item-padding[2]`, `reveal-border[1]`, `reveal-border[2]`, `reveal-border[3]`, `slider-transition[1]`, `slider-transition[2]`, `slider-transition[3]`, `switch-paddle-transition[1]`, `switch-paddle-transition[2]`, `switch-paddle-transition[3]`, `tab-item-padding[1]`, `tab-item-padding[2]`, `table-border[1]`, `table-border[2]`, `table-border[3]`, `table-padding[1]`, `table-padding[2]`, `table-padding[3]`, `thumbnail-border[1]`, `thumbnail-border[2]`, `thumbnail-border[3]`, `thumbnail-shadow-hover[1]`, `thumbnail-shadow-hover[2]`, `thumbnail-shadow-hover[3]`, `thumbnail-shadow-hover[4]`, `thumbnail-shadow-hover[5]`, `thumbnail-shadow[1]`, `thumbnail-shadow[2]`, `thumbnail-shadow[3]`, `thumbnail-shadow[4]`, `thumbnail-shadow[5]`, `thumbnail-transition[1]`, `thumbnail-transition[2]`, `thumbnail-transition[3]`, `topbar-title-spacing[1]`, `topbar-title-spacing[2]`, `topbar-title-spacing[3]`, `topbar-title-spacing[4]`

**compile error: colour function given a reference (mixin code)** (21 settings, 19 elements)

- Settings: `badge-color-alt`, `badge-color`, `black`, `body-background`, `body-font-color`, `button-color-alt`, `button-color`, `callout-background`, `callout-font-color`, `dark-gray`, `input-background-invalid`, `label-color-alt`, `label-color`, `menu-item-background-active`, `menu-item-color-active`, `orbit-caption-background`, `select-triangle-color`, `slider-handle-background`, `tab-color`, `table-background`, `white`
- Elements: `badge-palette[alert]`, `badge-palette[primary]`, `badge-palette[secondary]`, `badge-palette[success]`, `badge-palette[warning]`, `button-palette[alert]`, `button-palette[primary]`, `button-palette[secondary]`, `button-palette[success]`, `button-palette[warning]`, `foundation-palette[alert]`, `foundation-palette[secondary]`, `foundation-palette[success]`, `foundation-palette[warning]`, `label-palette[alert]`, `label-palette[primary]`, `label-palette[secondary]`, `label-palette[success]`, `label-palette[warning]`

**wrong value: boolean defaulting to true, the reference is truthy and never reaches the CSS** (15 settings, 0 elements)

- Settings: `abide-inputs`, `abide-labels`, `accordion-plusminus`, `accordionmenu-arrows`, `breadcrumbs-item-separator`, `breadcrumbs-item-uppercase`, `buttongroup-radius-on-each`, `drilldown-arrows`, `dropdownmenu-arrows`, `input-number-spinners`, `menu-centered-back-compat`, `menu-icons-back-compat`, `menu-state-back-compat`, `offcanvas-fixed-reveal`, `pagination-arrows`
- Elements: none

**compile error: arithmetic on a reference (mixin code)** (12 settings, 0 elements)

- Settings: `accordionmenu-arrow-size`, `drilldown-arrow-size`, `dropdownmenu-arrow-size`, `input-font-size`, `offcanvas-inner-shadow-size`, `slider-handle-height`, `slider-height`, `switch-height-large`, `switch-height-small`, `switch-height-tiny`, `switch-height`, `switch-paddle-offset`
- Elements: none

**compile error: reference interpolated into a selector (mixin code)** (9 settings, 3 elements)

- Settings: `badge-palette`, `breakpoint-classes`, `button-palette`, `buttongroup-child-selector`, `closebutton-default-size`, `closebutton-size`, `dropdown-sizes`, `label-palette`, `maincontent-class`
- Elements: `breakpoint-classes[1]`, `breakpoint-classes[2]`, `breakpoint-classes[3]`

**compile error: map function given a reference (mixin code)** (8 settings, 0 elements)

- Settings: `button-sizes`, `callout-sizes`, `closebutton-lineheight`, `closebutton-offset-horizontal`, `closebutton-offset-vertical`, `foundation-palette`, `offcanvas-sizes`, `responsive-embed-ratios`
- Elements: none

**compile error: number function given a reference (unit, strip-unit, lightness amount) (mixin code)** (7 settings, 4 elements)

- Settings: `button-background-hover-lightness`, `button-hollow-hover-lightness`, `callout-background-fade`, `global-font-size`, `global-lineheight`, `input-line-height`, `table-color-scale`
- Elements: `breakpoints[large]`, `breakpoints[medium]`, `breakpoints[xlarge]`, `breakpoints[xxlarge]`

**compile error: colour function given a reference (settings file)** (7 settings, 1 elements)

- Settings: `anchor-color`, `button-background`, `medium-gray`, `switch-background-active`, `switch-background`, `table-foot-background`, `table-head-background`
- Elements: `foundation-palette[primary]`

**wrong value: default null: the reference adds a declaration Foundation omits** (6 settings, 0 elements)

- Settings: `accordion-submenu-toggle-border`, `accordionmenu-border`, `accordionmenu-item-background`, `accordionmenu-submenu-toggle-background`, `button-font-weight`, `dropdownmenu-background`
- Elements: none

**wrong value: boolean tested by comparison or negation: the reference takes another branch** (5 settings, 0 elements)

- Settings: `button-responsive-expanded`, `pagination-mobile-current-item`, `pagination-mobile-items`, `show-header-for-stacked`, `table-is-striped`
- Elements: none

**wrong value: keyword compared or used to pick a selector, media query, or value** (5 settings, 0 elements)

- Settings: `button-fill`, `global-text-direction`, `table-stack-breakpoint`, `table-stripe`, `topbar-unstack-breakpoint`
- Elements: none

**wrong value: nth(), a map lookup, or a comparison picks a different value or rule** (5 settings, 2 elements)

- Settings: `button-padding`, `dropdownmenu-border`, `input-border`, `offcanvas-vertical-sizes`, `topbar-submenu-background`
- Elements: `dropdownmenu-border[1]`, `input-border[1]`

**compile error: comparison on a reference (mixin code)** (5 settings, 0 elements)

- Settings: `offcanvas-overlap-zindex`, `offcanvas-overlay-zindex`, `offcanvas-push-zindex`, `offcanvas-reveal-zindex`, `print-breakpoint`
- Elements: none

**wrong value: has-value() branch on 0: extra declarations that compute to the initial value in isolation** (4 settings, 0 elements)

- Settings: `global-radius`, `meter-radius`, `progress-radius`, `slider-radius`
- Elements: none

**wrong value: reference glued to a sign, a number, or another value (Sass string concatenation)** (3 settings, 2 elements)

- Settings: `button-hollow-border-width`, `input-padding`, `reveal-zindex`
- Elements: `offcanvas-sizes[small]`, `offcanvas-vertical-sizes[small]`

**compile error: arithmetic on a reference (settings file)** (2 settings, 0 elements)

- Settings: `form-spacing`, `tooltip-pip-width`
- Elements: none

**compile error: Foundation's own guard or lookup (mixin code)** (1 settings, 1 elements)

- Settings: `breakpoints`
- Elements: `breakpoints[small]`

**compile error: list index on a reference (mixin code)** (1 settings, 2 elements)

- Settings: `closebutton-position`
- Elements: `responsive-embed-ratios[default]`, `responsive-embed-ratios[widescreen]`

**compile error: number function given a reference (unit, strip-unit, lightness amount) (settings file)** (1 settings, 0 elements)

- Settings: `table-hover-scale`
- Elements: none

**wrong value: reference becomes a property name** (0 settings, 2 elements)

- Settings: none
- Elements: `closebutton-position[1]`, `closebutton-position[2]`

