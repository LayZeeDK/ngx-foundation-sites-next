# Typed Variant inputs over open Sass maps

Ticket: [Research: typed Variant inputs over open Sass maps](../issues/80-research-typed-variant-inputs-open-sass-maps.md), for [Decide: typed Variant inputs over open Sass maps](../issues/81-decide-typed-variant-inputs-open-sass-maps.md). Model: Opus 5.5, with a Sonnet 5 sweep of other libraries' sources (section 6), spot-checked against the downloaded files.

This file decides nothing. It lists the Foundation settings whose keys become Variant class names, the ways to type an Angular input over them without declaration merging, what each costs, and what the panel still needs.

Sources and path prefixes:

- `FDN/` = `d:/projects/github/foundation/foundation-sites`, Foundation for Sites 6.9.0 (`package.json`), commit `337be7a`.
- `NG/` = `d:/projects/github/angular/angular`, branch 22.2.x, version 22.2.0, commit `5db6fc4`.
- `COMP/` = `d:/projects/github/angular/components`, branch 22.2.x, version 22.2.0, commit `708d4c6`.
- `PROBE/` = `D:/tmp/nfs-research-typed-variants`, a throwaway workspace whose `node_modules` is a junction to `D:/tmp/nfs-ct-prototype/node_modules`: `@angular/compiler-cli`, `@angular/core`, `@angular/language-service`, `@angular/build`, `@schematics/angular` 22.2.0, TypeScript 6.0.3 (the map's pin, `map.md:29`), `sass` 1.104.1 (the version ADR 0012 records for `@angular/build` 22.2.0, `adr/0012-sass-packaging.md:7`), Playwright 1.63.0, Node 24.18.0. The decisive probe code is quoted below; the workspace itself is not committed.
- Bundle paths are relative to the effort directory.

The rule this serves: consumers write no Foundation or NFS class, and every Variant class is set by a typed input ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md), `adr/0039-directives-manage-every-foundation-class.md:10`). The user vetoed consumer-side TypeScript `namespace` or `module` augmentation ([Triage the out-of-scope Foundation components and variants](../issues/79-triage-out-of-scope-components-and-variants.md), Answer item 7; `map.md:148`; `adr/0039-directives-manage-every-foundation-class.md:15`).

## 1. Options at a glance

| # | Option | Rejects a typo in a template | Accepts the consumer's own names | Editor offers the consumer's names |
| --- | --- | --- | --- | --- |
| O1 | Closed union of Foundation's defaults | yes | no (compile error) | no (offers the defaults) |
| O2 | Defaults plus the `(string & {})` escape | no | yes | no (offers the defaults) |
| O3 | Generic directive, type parameter left to inference | no | yes | no |
| O4 | Consumer-declared subclass of a generic abstract base | yes | yes | yes |
| O5 | Consumer-declared narrowing directive on the same attribute | yes | yes | no |
| O6 | Branded value type from a typed factory, bound as a property | yes | yes | yes (as member names) |
| O7 | Library type module the consumer remaps with tsconfig `paths` | yes | yes | yes |
| O8 | Typed provider or injection token | no (no template effect) | n/a | no |
| O9 | TypeScript generated from the consumer's Sass settings | supplies the names to O4, O5, O6, or O7 | | |
| O10 | Development-mode runtime check of class availability | at runtime, not at compile time | pairs with any type option | |

Every "yes" and "no" in the last three columns is measured in section 4. O9 and O10 change no input type by themselves.

## 2. Inventory: Foundation 6.9 settings whose keys or values become Variant class names

"Consumer can" follows Foundation's own docs: a palette can be shrunk with `map-remove`, extended with `map-merge`, or replaced (`FDN/docs/pages/button.md:104-131`, the same three forms for Badge and Label at `FDN/docs/pages/badge.md:65-92` and `FDN/docs/pages/label.md:67-94`); `$breakpoint-classes` gains or loses names (`FDN/docs/pages/media-queries.md:97-106`). Every setting below is a `!default` global the consumer overrides before `@import 'foundation'`.

### 2.1 Palettes (open: names are keys)

| Setting | Default | Variant classes generated | Constraints |
| --- | --- | --- | --- |
| `$foundation-palette` | `primary`, `secondary`, `success`, `warning`, `alert` (`FDN/scss/_global.scss:27-33`) | `.callout.<name>` (`FDN/scss/components/_callout.scss:96-100`); `.progress.<name>` (`FDN/scss/components/_progress-bar.scss:45-51`); native `progress.<name>` (`FDN/scss/forms/_progress.scss:70-71`); and the default of the three palettes below | Must keep `primary`, or the compile stops (`FDN/scss/_global.scss:122-124`); the docs warn that removing a key breaks settings that reference it (`FDN/docs/pages/global.md:87-100`) |
| `$button-palette` | `$foundation-palette` (`FDN/scss/components/_button.scss:69`) | `.button.<name>` under each fill (`_button.scss:369-381`); the dropdown arrow colour per name (`:404-409`); `.button-group.<name>` and `.button-group .button.<name>` (`FDN/scss/components/_button-group.scss:232-257`) | None; `primary` may be removed here |
| `$badge-palette` | `$foundation-palette` (`FDN/scss/components/_badge.scss:23`) | `.badge.<name>` (`:56-61`) | None |
| `$label-palette` | `$foundation-palette` (`FDN/scss/components/_label.scss:23`) | `.label.<name>` (`:57-62`) | None |

Callout and Progress Bar have no palette of their own: a consumer changes their colours only through `$foundation-palette`.

### 2.2 Size and ratio maps (open: names are keys)

| Setting | Default | Variant classes generated | Constraints |
| --- | --- | --- | --- |
| `$button-sizes` | `tiny`, `small`, `default`, `large` (`_button.scss:60-65`) | `.button.<size>` for every key except `default` (`:337-341`); `.button-group.<size> .button` (`_button-group.scss:220-224`) | `default` is read as the base size (`_button.scss:105`; `_button-group.scss:59`) and has no class |
| `$callout-sizes` | `small`, `default`, `large` (`_callout.scss:27-31`) | `.callout.<size>` except `default` (`:102-106`) | `default` read as the base padding (`:53`) |
| `$closebutton-size` | `small`, `medium` (`FDN/scss/components/_close-button.scss:40-43`) | `.close-button.<name>` (`:116-126`) | `$closebutton-default-size: medium` (`:22`) must be a key: `.close-button` extends its placeholder (`:111`) |
| `$dropdown-sizes` | `tiny`, `small`, `large` (`FDN/scss/components/_dropdown.scss:35-39`) | `.dropdown-pane.<name>` (`:75-81`) | None |
| `$responsive-embed-ratios` | `default` (4 by 3), `widescreen` (16 by 9) (`FDN/scss/components/_responsive-embed.scss:15-18`) | `.responsive-embed.<name>` and `.flex-video.<name>` except `default` (`:44-56`) | `default` read by the base mixin (`:22-25`) |

`$offcanvas-sizes` and `$offcanvas-vertical-sizes` (`FDN/scss/components/_off-canvas.scss:11-19`) are keyed by breakpoint and produce media queries, not classes (`:199-203`); they are not Variant classes.

### 2.3 Breakpoint lists (open: names are list items or keys)

- `$breakpoints` (`FDN/scss/util/_breakpoint.scss:14-20`): the names every `breakpoint()` media query takes. The first value must be `0` (`:41-43`), and the first key becomes the zero breakpoint (`:45`), whose name appears in `.media-object.stack-for-<zero>` (`FDN/scss/components/_media-object.scss:35`). No other class takes its names directly.
- `$breakpoint-classes` (`_breakpoint.scss:50`, default `small medium large`), each name also a key of `$breakpoints` (`:48`). Its names become Variant classes in:
  - Button: `.button.<bp>-only-expanded`, `.<bp>-down-expanded`, `.<bp>-expanded`, only when `$button-responsive-expanded` is true (`_button.scss:345-365`);
  - Menu: `.menu.<bp>-horizontal`, `-vertical`, `-expanded`, `-simple`, the zero breakpoint excluded (`FDN/scss/components/_menu.scss:414-429`; `FDN/scss/util/_mixins.scss:274-282`);
  - Dropdown Menu: `.<bp>-horizontal`, `.<bp>-vertical`, zero excluded (`FDN/scss/components/_dropdown-menu.scss:177-188`);
  - Top Bar: `.top-bar.stacked-for-<bp>`, zero excluded (`FDN/scss/components/_top-bar.scss:135-143`);
  - Off-canvas: `.position-<side>.reveal-for-<bp>` and `.off-canvas.in-canvas-for-<bp>`, zero excluded (`_off-canvas.scss:480-512`);
  - Visibility Classes: `.hide-for-<bp>`, `.show-for-<bp>`, and their `-only` forms (`FDN/scss/components/_visibility.scss:77-94`);
  - Typography Helpers: `.<bp>-text-<align>` (`FDN/scss/typography/_alignment.scss:6-19`);
  - Flexbox Utilities: `.<bp>-flex-container`, `.<bp>-flex-child-*`, `.<bp>-flex-dir-*` (`FDN/scss/components/_flex.scss:42-65`) and `.<bp>-order-<n>` (`:110-111`);
  - XY Grid: every responsive class, for example `.<bp>-<n>` (`FDN/scss/xy-grid/_classes.scss:90-93`), `.<bp>-up-<n>` (`:196-220`), `.<bp>-margin-collapse` (`:230-239`), `.<bp>-offset-<n>` (`:246-257`), `.<bp>-grid-frame` and `.<bp>-cell-block*` (`:383-399`);
  - Float and Flex Grid: `.<bp>-<n>`, `-push-`, `-pull-`, `-offset-`, `-up-`, `-collapse`, `-centered` (`FDN/scss/grid/_classes.scss:101-160`; `FDN/scss/grid/_flex-grid.scss:192-241`);
  - Prototyping Utilities: the `.<bp>-` form of each family when its `*-breakpoints` flag is on, for example `.<bp>-display-<value>` (`FDN/scss/prototype/_display.scss:38-42`), all off by default (`$global-prototype-breakpoints: false`, `_global.scss:116`).

The bundle's `NfsBreakpointName` covers the keys of `$breakpoints` (`specs/breakpoint-service.md:145`), which is a superset of the names that have classes. Off-canvas types `revealOn` and `inCanvasOn` as `NfsBreakpointName` (`specs/off-canvas.md:161-162`) while `.reveal-for-<bp>` exists only for `$breakpoint-classes` minus the zero breakpoint (`_off-canvas.scss:480-500`); the spec handles the gap with a development check (`specs/off-canvas.md:244`), and the Responsive Toggle spec with an opt-in mixin (`specs/responsive-toggle.md:424`).

### 2.4 Counts (open: numbers)

| Setting | Default | Classes |
| --- | --- | --- |
| `$grid-columns` | 12 (`FDN/scss/xy-grid/_xy-grid.scss:19`) | XY `.<bp>-<n>`, `.<bp>-offset-<n>` (`xy-grid/_classes.scss:90-93`, `:246-257`) |
| `$xy-block-grid-max` | 8 (`_xy-grid.scss:42`) | XY `.<bp>-up-<n>` (`xy-grid/_classes.scss:196-220`) |
| `$grid-column-count`, `$block-grid-max` | 12, 8 (`FDN/scss/grid/_grid.scss:15`, `:35`) | Float and Flex Grid columns and block grids (`grid/_classes.scss:101-134`; `grid/_flex-grid.scss:192-209`) |
| `$flex-source-ordering-count` | 6 (`_flex.scss:11`) | `.<bp>-order-<n>` (`:110-111`) |
| `$prototype-spacers-count` | 3 (`FDN/scss/prototype/_spacing.scss:15`) | `.margin-<n>`, `.padding-<n>`, and directional forms (`:116-131`) |

### 2.5 Prototyping value lists (open: names are list items; Prototyping Utilities are opt-in)

`$prototype-display` (`FDN/scss/prototype/_display.scss:15-21`, classes `:30-31`), `$prototype-position` (`_position.scss:15-20`, `:74-75`), `$prototype-overflow` (`_overflow.scss:15-19`, `:49-56`), `$prototype-sizing` with `$prototype-sizes` (`_sizing.scss:15-27`, `:41-43`), `$prototype-text-decoration` (`_text-decoration.scss:15-19`, `:28-29`), `$prototype-text-transformation` (`_text-transformation.scss:15-19`, `:28-29`), `$prototype-style-type-unordered` and `-ordered` (`_list-style-type.scss:15-31`, `:47`, `:70`), `$prototype-arrow-directions` (`_arrow.scss:11-16`, `:27-28`).

### 2.6 Settings that decide whether a class exists, or rename one

- `$button-fill` (`_button.scss:28`): the fill equal to it gets no class; the other two do (`:369-372`). Measured below: with `$button-fill: hollow`, `.button.hollow` is absent and `.button.solid` and `.button.clear` are present.
- `$button-responsive-expanded: false` (`_button.scss:94`) gates the responsive expanded classes (`:345`).
- `$global-flexbox` (`_global.scss:112`), `$xy-grid` (`xy-grid/_xy-grid.scss:11`), and `foundation-everything($flex, $prototype, $xy-grid)` (`FDN/scss/foundation.scss:78-108`) choose which grid's classes exist; Prototyping classes exist only with `$prototype: true` (`:154`). Every component's classes exist only when the consumer includes its export mixin (`:94-154`).
- Renames: `$grid-column-alias: 'columns'` (`grid/_grid.scss:31`); the Float Grid's class-name parameters `row`, `column`, `collapse`, `offset`, and the rest (`grid/_classes.scss:10-25`); `$maincontent-class: 'off-canvas-content'` (`_off-canvas.scss:70`, used at `:407`), which renames a Structural class, not a Variant class.

### 2.7 Closed Variant sets fixed in Foundation's Sass (for contrast)

`.button.expanded` (`_button.scss:343`), `.dropdown` (`:390`), `.arrow-only` (`:415`); Reveal `.tiny`, `.small`, `.large`, `.full` (`FDN/scss/components/_reveal.scss:173-178`); Switch `.tiny`, `.small`, `.large` (`FDN/scss/components/_switch.scss:273-281`); Button Group `.stacked-for-small` and `.stacked-for-medium`, hard-coded names even though they read like breakpoints (`_button-group.scss:266-298`); Menu `.vertical`, `.expanded`, `.simple`, `.nested`, `.icons` (`_menu.scss:397-438`). The fills are a closed set too: the names are always `solid`, `hollow`, `clear` (`_button.scss:369`), and the one without a class is the default look, so binding any of the three names renders that fill whatever `$button-fill` is (derived from `:369-372` and the compile below).

### 2.8 Measured: which classes a customised consumer compile has

`PROBE/sass/_consumer-settings.scss` extends `$button-palette` with `purple`, removes `warning` from `$label-palette`, adds a `huge` button size, sets `$button-fill: hollow`, and adds `xlarge` to `$breakpoint-classes`, the forms Foundation's docs show. Compiled with `foundation-everything` (`node PROBE/tools/sass-export.mjs`, 168,187 bytes of CSS), `rg -c -F` on the output counts: `.button.purple` 6, `.button.huge` 1, `.button.hollow` 0, `.button.solid` 14, `.button.clear` 15, `.label.warning` 0, `.label.alert` 1, `.xlarge-6` 13, `.hide-for-xlarge` 2, `.xlarge-text-center` 1, `.button.default` 0.

### 2.9 What ADR 0010 said, rechecked

ADR 0010 is superseded (`adr/0039-directives-manage-every-foundation-class.md:3`), but ADR 0039 passes its objections to this decision (`:15`). Against the inventory:

- "the value sets are open (custom palette colors, custom sizes ...)" (`adr/0010-button-variant-classes-stay-classes.md:11`): holds for every row of 2.1 to 2.5.
- "`.solid` existing only when `$button-fill` is not `solid`" (`:11`): holds (2.6), but the fill names stay a closed set that always renders correctly (2.7).
- "responsive `-expanded` classes behind a Sass flag" (`:11`): holds (2.6).
- "the types would either lie or collapse to `string`" (`:11`): a closed union rejects a customised consumer's names (P1 below) and `'a' | string` collapses to `string` (P2b); `(string & {})` keeps completion of the defaults but accepts any string (P2).
- "a runtime default would emit classes that fight" the Sass settings (`:12`): an input default that emits a class does fight them. With `$button-fill: hollow`, a `fill` input defaulting to `'solid'` would emit `.solid`, which exists (2.8), and turn every button solid. A default that emits no class does not fight.

## 3. What Angular 22.2 and TypeScript 6.0 do with an input's type

- `strictTemplates` is on unless a project sets it to `false` (`NG/packages/compiler-cli/src/ngtsc/core/src/compiler.ts:1058-1064`), and it turns on `checkTypeOfAttributes` (`:1100`). The Angular CLI's strict workspace template writes no `strictTemplates` line, so new strict projects get it (`PROBE/node_modules/@schematics/angular/workspace/files/tsconfig.json.template:18-22`). Probe P6b below confirms it with an empty `angularCompilerOptions`.
- A static attribute that feeds an input is checked as a string literal: the type-check block assigns `_t1.cols = ("3");` (`NG/packages/compiler-cli/src/ngtsc/typecheck/test/type_check_block_spec.ts:1413-1429`; the switch is `NG/packages/compiler/src/typecheck/ops/inputs.ts:199`). So `color="purple"` is checked as the type `"purple"`. The docs call this `strictAttributeTypes` (`NG/adev/src/content/tools/cli/template-typecheck.md:115`).
- A generic directive's type parameters are inferred from the bindings on the same element only, through a type constructor call (`NG/packages/compiler/src/typecheck/ops/directive_constructor.ts:24-35`, `:86-120`; docs `template-typecheck.md:55`, `:112`). Nothing from DI reaches that inference.
- The language service offers literal completions inside a static attribute value and inside a string literal in a binding, by asking TypeScript for completions at the mapped type-check position and keeping string entries (`NG/packages/language-service/src/completions.ts:274-279`, `:285-296`, `:1438-1455`). So completion follows the input's TypeScript type.
- `[class]` bound to a string adds every space-separated class in it (`NG/adev/src/content/guide/templates/binding.md:141`, `:149`, `:160-165`). A directive that forwards an open string to a `[class]` host binding therefore lets the input set any class, for example Foundation's `.hide` (`display: none !important`, `_visibility.scss:65-67`), unless the directive or a check restricts it.
- TypeScript reduces `'a' | string` to `string`, and microsoft/TypeScript#29729 ("Literal String Union Autocomplete") was closed on 2024-02-24 as a design limitation, with `T | (string & {})` as the community workaround (https://github.com/microsoft/TypeScript/issues/29729).

## 4. Measured probes

### 4.1 Template type checking

A library (`PROBE/lib/src/index.ts`) compiled with `ngc` in partial mode to `PROBE/dist/lib` (`node PROBE/node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js -p PROBE/lib/tsconfig.json`), consumed through its `.d.ts` by an application (`PROBE/app/src/cases.ts`) under `strict` and `strictTemplates` (`ngc -p PROBE/app/tsconfig.json`). The core declarations:

```ts
export type NfsDefaultColor = 'primary' | 'secondary' | 'success' | 'warning' | 'alert';
export type NfsOpenColor = NfsDefaultColor | (string & {});
export type NfsWideColor = NfsDefaultColor | string;

@Directive({host: {class: 'button', '[class]': 'color() ?? ""'}})
export abstract class NfsButtonBase<C extends string = NfsDefaultColor> {
  readonly color = input<C>();
}

// consumer
type AppColor = NfsDefaultColor | 'purple';
@Directive({selector: 'button[nfsButton]'})
export class AppButton extends NfsButtonBase<AppColor> {}
```

| Probe | Input type | Binding | Result |
| --- | --- | --- | --- |
| P1 | closed union | `color="primary"` | compiles |
| P1 | closed union | `color="purple"` | TS2322 `Type '"purple"' is not assignable to type 'NfsDefaultColor \| undefined'` |
| P1 | closed union | `[color]="danger ? 'alert' : 'primary'"` | compiles |
| P1 | closed union | `[color]="someString"` (a `string` field) | TS2322 |
| P2 | `NfsOpenColor` | `color="purple"`, `color="primray"`, `[color]="someString"` | all compile; the typo is accepted |
| P2b | `NfsWideColor` | `color="primray"` | compiles; the emitted `.d.ts` already reads `InputSignal<string \| undefined>` |
| P3 | `NfsButtonGeneric<C extends string>` | `color="pink"` | compiles (`C` is inferred as `"pink"`) |
| P3 | same | `[color]="42"` | TS2322 `'number' is not assignable to type 'string'` |
| P4 | consumer subclass `AppButton` (same selector as the library's) | `color="purple"` / `color="pink"` | compiles / TS2322 against `AppColor` |
| P5 | branded `NfsColor`, from `nfsPalette([...] as const)` | `color="purple"` | TS2322 `Type 'string' is not assignable to type 'NfsColor'` |
| P5 | same | `[color]="palette.purple"` / `[color]="palette.pink"` | compiles / TS2339 `Property 'pink' does not exist` |
| P6 | `import type {NfsThemeButtonColor} from 'nfs-theme-types'` in the library, remapped by the app's `paths` to its own file | `color="purple"` / `color="pink"` | compiles / TS2322 |
| P6 | same, not remapped, `skipLibCheck: false` | any | TS2307 `Cannot find module 'nfs-theme-types'` in the library's `.d.ts`; no template diagnostics |
| P6 | same, not remapped, `skipLibCheck: true` | `color="pink"` | compiles: the type is silently `any` |
| P6b | the package ships `fake-nfs2/theme-types` with the defaults (package `exports`); `angularCompilerOptions: {}` | `color="purple"` / `color="pink"` | TS2322 / TS2322 |
| P6b | same, app `paths` remaps `fake-nfs2/theme-types` to its own file | `color="purple"` / `color="pink"` | compiles / TS2322 (a `paths` entry wins over the package's own subpath) |
| P7 | library input `NfsOpenColor` plus a consumer directive `button[nfsOpen][color]` with `color = input.required<AppColor>()` | `color="purple"` / `color="pink"` | compiles / TS2322 against `AppColor`; two directives with the same input name on one element compile |
| P8 | P2's component bootstrapped with `provideNfsButtonPalette([..., 'purple'])` (a `const` generic) | `color="primray"` | compiles: the provider changes no template type |
| P9 | a function that declares and returns a `@Directive` class typed by its argument | `imports: [AppFactoryButton]` | NG1010 `'imports' must be an array of components, directives, pipes, or NgModules. Value could not be determined statically.` |

The Angular CLI's workspace template sets `skipLibCheck: true` (`PROBE/node_modules/@schematics/angular/workspace/files/tsconfig.json.template:11`), the case in which an unresolved type module becomes `any` without a diagnostic.

Emitted JavaScript for the consumer's P4 subclass and P7 narrowing directive (`ngc -p PROBE/app/tsconfig.emit.json`): the subclass is a class whose factory comes from Angular's private `getInheritedFactory` instruction and whose directive definition carries the private `InheritDefinitionFeature`; the narrowing directive is a class with one `input.required` field and its directive definition.

### 4.2 Editor completion

`node PROBE/tools/completions.mjs` starts `tsserver` 6.0.3 with `--globalPlugins @angular/language-service --pluginProbeLocations PROBE` (language service 22.2.0) and asks `completionInfo` at the cursor inside `color="p|"` or `[color]="'p|'"` of an inline template (`PROBE/app-ls/src/completions.ts`). String entries returned:

| Position | Entries |
| --- | --- |
| TypeScript: `const x: NfsOpenColor = 'p\|'` | primary, secondary, success, warning, alert |
| TypeScript: `const x: NfsWideColor = 'p\|'` | none |
| Static attribute, closed union (P1) | primary, secondary, success, warning, alert |
| Static attribute, `NfsOpenColor` (P2) | primary, secondary, success, warning, alert |
| Static attribute, `NfsWideColor` (P2b) | none |
| Bound string literal, closed / open / wide | the five / the five / none |
| Static attribute, consumer subclass (P4) | the five and purple |
| Static attribute, remapped type module (P6) | the five and purple |
| Member access `palette.\|` (P5) | alert, primary, purple, secondary, success, warning |
| Static attribute, P7 narrowing directive over `NfsWideColor` | none |
| Static attribute, P7 narrowing directive over `NfsOpenColor` | the five (not purple) |

The narrowing directive (P7) is type-checked but its type does not drive completion: the language service took the entries from the library directive's input.

### 4.3 Reading the Sass names at build time

`node PROBE/tools/sass-export.mjs` compiles the consumer's settings, `@import 'foundation'`, and a stand-in library mixin whose lines call a custom JavaScript function, for example `$-a: nfs-export('NfsButtonColor', map-keys($button-palette));`, through the Sass JS API `functions` option (`PROBE/node_modules/sass/types/options.d.ts:214`). It wrote:

```ts
export type NfsButtonColor = 'primary' | 'secondary' | 'success' | 'warning' | 'alert' | 'purple';
export type NfsButtonSize = 'tiny' | 'small' | 'large' | 'huge';
export type NfsButtonFill = 'solid' | 'clear';
export type NfsLabelColor = 'primary' | 'secondary' | 'success' | 'alert';
export type NfsCalloutColor = 'primary' | 'secondary' | 'success' | 'warning' | 'alert';
export type NfsCalloutSize = 'small' | 'large';
export type NfsClassBreakpoint = 'small' | 'medium' | 'large' | 'xlarge';
```

That compile emits no CSS (108 bytes, the banner) and took 239 ms and 247 ms in two runs, against 1,466 ms and 1,518 ms for the same settings with `foundation-everything` (one cold Node process each, `sass` 1.104.1). `NfsButtonFill` lists the fills that have a class; section 2.7 shows why a type may list all three.

`@angular/build:application` 22.2.0 accepts only `fatalDeprecations`, `silenceDeprecations`, and `futureDeprecations` under `stylePreprocessorOptions.sass`, with `additionalProperties: false`, and its schema has no plugin option (`PROBE/node_modules/@angular/build/src/builders/application/schema.json`, printed with `node` and searched with `rg`), so no custom Sass function can run inside the application's own style compile. A generator runs as its own step: an npm script, an Nx target the build depends on, a custom Architect builder that runs it and then calls `context.scheduleBuilder()` or `context.scheduleTarget()` for the application builder (`NG/adev/src/content/tools/cli/cli-builder.md:24`, `:244`), a watcher beside `ng serve`, or a committed file regenerated on change.

### 4.4 Reading class availability at runtime

`node PROBE/tools/runtime-check.mjs` loads the 168 KB compile, which also includes a stand-in mixin writing

```css
:root {
  --nfs-button-palette: primary, secondary, success, warning, alert, purple;
  --nfs-button-sizes: tiny, small, large, huge;
  --nfs-button-fills: solid clear;
  --nfs-label-palette: primary, secondary, success, alert;
  --nfs-breakpoint-classes: small medium large xlarge;
}
```

into Chromium 153, Firefox 155, and WebKit 26.6 (Playwright 1.63), and runs in the page:

- `getComputedStyle(document.documentElement).getPropertyValue('--nfs-button-palette')` and the three others return exactly the lists above in all three engines.
- A scan of `document.styleSheets` for `/\.button\.purple(?![\w-])/` in `selectorText` finds it, and does not find `.button.pink`, over 1,861 rules (1,862 in Firefox): first scan 11.4 ms, 17 ms, 14 ms; second scan 2.5 ms, 5 ms, 2 ms (Chromium, Firefox, WebKit).

Foundation's own JavaScript reads Sass data the same way: `.foundation-mq` carries the serialized `$breakpoints` in `font-family` (`FDN/scss/_global.scss:144-145`), which `foundation.util.mediaQuery.js` reads through computed style (`FDN/js/foundation.util.mediaQuery.js:90-95`).

## 5. Options

Every option below is compile-time or development-only, so none changes what the server renders or what hydration sees: the class comes from the same input value on the server and in the browser (host bindings render on the server, `adr/0039-directives-manage-every-foundation-class.md:22`). SSR notes are given only where an option adds something.

### O1. Closed union of Foundation's defaults

Shape: `readonly color = input<'primary' | 'secondary' | 'success' | 'warning' | 'alert'>()`, one union per family from 2.1 to 2.5.

- Strict templates: unknown names and typos fail to compile, static or bound; a `string` field fails too (P1). A customised consumer's `purple` fails as well. The escapes are `[color]="$any('purple')"` (`NG/adev/src/content/tools/cli/template-typecheck.md:296-306`) or `strictAttributeTypes: false` for the whole project (`:115`), which the Angular docs list as a way to relax checking (`:104-106`).
- Completion: the defaults (4.2).
- Bundle: none.
- Sass has a name TypeScript lacks: the consumer cannot bind it without `$any()`. TypeScript has a name Sass removed: compiles, and renders a class with no CSS.
- Development-mode check: O10 catches the second case.
- Prior art: Radix Themes `color` is a fixed list; new colours are made by overriding the CSS variables of an existing name (https://github.com/radix-ui/themes/blob/3.3.0/packages/radix-ui-themes/src/props/color.prop.ts#L4-L16; https://www.radix-ui.com/themes/docs/theme/color). PrimeNG `ButtonSeverity` and `size` (https://github.com/primefaces/primeng/blob/21.1.10/packages/primeng/src/types/button/button.types.ts#L113-L127). ngx-bootstrap `ProgressbarType` (https://github.com/valor-software/ngx-bootstrap/blob/v22.0.0/src/progressbar/progressbar-type.interface.ts#L1). Material's `ThemePalette` and `MatButtonAppearance` (`COMP/src/material/core/common-behaviors/palette.ts:10`; `COMP/src/material/button/button-base.ts:31`). `@angular/aria` has closed behaviour unions such as `orientation` (`COMP/src/aria/tree/tree.ts:99`) and no appearance input (a search of `COMP/src/aria` and `COMP/src/cdk` for `color`, `size`, `variant`, `appearance`, or `theme` inputs finds none).

### O2. Defaults plus the `(string & {})` escape

Shape: `type NfsButtonColor = 'primary' | ... | 'alert' | (string & {})`.

- Strict templates: any string compiles, typos included; non-strings fail (P2).
- Completion: the defaults, static and bound; never the consumer's names (4.2). The plain `| string` form offers nothing and its `.d.ts` is `string` (P2b).
- Bundle: none.
- Sass has a name TypeScript lacks: works. TypeScript accepts a name Sass lacks (a typo, a removed key, a gated class such as `medium-expanded` with `$button-responsive-expanded: false`): compiles and renders a class with no CSS, silently. If the directive forwards the string to `[class]`, the value can also set any other class (section 3).
- Development-mode check: O10 is the only way to catch a typo.
- Prior art in this bundle: `NfsBreakpointName` (`specs/breakpoint-service.md:145`), `NfsRevealAutoFocus` (`specs/reveal.md:147`), `NfsOffCanvasAutoFocus` (`specs/off-canvas.md:152`). Elsewhere: Ionic's `Color = LiteralUnion<PredefinedColors, string>`, with custom colours added as `--ion-color-<name>` properties and an `.ion-color-<name>` class (https://github.com/ionic-team/ionic-framework/blob/v9.0.5/core/src/interface.d.ts#L128-L141; https://ionicframework.com/docs/theming/colors); react-bootstrap's `Variant` (https://github.com/react-bootstrap/react-bootstrap/blob/v2.10.10/src/types.tsx#L4-L13). Material types `color` on buttons, chips, toolbars, checkboxes, and slide toggles as plain `string` and prefixes it (`'[class]': 'color ? "mat-" + color : ""'`, `COMP/src/material/button/button-base.ts:58`, `:98`; `COMP/src/material/chips/chip.ts:196`); Taiga UI's appearance type is `string | 'accent' | ...` (https://github.com/taiga-family/taiga-ui/blob/v5.25.0/projects/core/directives/appearance/appearance.options.ts#L4-L36), which by 4.2 offers no completion despite its comment; ng-bootstrap's `NgbAlert.type` is an untyped `string` (https://github.com/ng-bootstrap/ng-bootstrap/blob/21.0.0/src/alert/alert.ts#L67).

### O3. Generic directive, type parameter left to inference

Shape: `class NfsButton<C extends string = NfsDefaultColor> { color = input<C>(); }`.

- Strict templates: the parameter is inferred from the binding itself, so every string compiles (P3). No template can supply the consumer's list, because inference reads only the element's own bindings (section 3). A factory returning a typed directive class does not compile ahead of time (P9).
- Completion: none measured beyond the constraint's; the default parameter is not what inference uses.
- Useful only as the base shape for O4.

### O4. Consumer-declared subclass of a generic abstract base

Shape: the library exports, per directive, an abstract `@Directive()` base generic in each open family (`NfsButtonBase<C, S, ...>`) and a concrete directive typed with O1 or O2. The consumer declares `@Directive({selector: 'button[nfsButton]'}) class AppButton extends NfsButtonBase<AppColor> {}` and imports it instead of the library's.

- Strict templates: the consumer's names are checked, typos fail, across a partial-compiled `.d.ts` (P4).
- Completion: the consumer's names (4.2).
- Bundle: one small class per directive in the consumer (4.1).
- Consumer cost: one subclass per directive that has an open family: Button, Button Group, Callout, Badge, Label, Progress Bar, Dropdown pane, Close Button, Responsive Embed, and every directive with breakpoint classes (2.3), multiplied by the families on each. The names come from a hand-written union or from O9.
- Constraints not measured: importing both the library's directive and the subclass on one element; library code that injects the concrete class would not find the subclass (the repository's `AGENTS.md`, "Content Projection and DI", already has children inject through tokens); the runtime of `InheritDefinitionFeature` over a linked partial declaration was not run in a browser.
- Prior art: tailwind-merge takes custom class groups as explicit type parameters rather than declaration merging (https://github.com/dcastil/tailwind-merge/blob/v3.6.0/src/lib/extend-tailwind-merge.ts#L8-L18). Spartan UI copies its styled directives, whose `variant` and `size` types come from a `cva()` config, into the consumer's project, where the consumer edits them (https://github.com/spartan-ng/spartan/blob/v1.5.0/libs/helm/button/src/lib/hlm-button.ts#L8-L53; https://www.spartan.ng/documentation/cli): the consumer owns the typed code, as in O4, but through a copy rather than a subclass.

### O5. Consumer-declared narrowing directive on the same attribute

Shape: the library types the input as O2; the consumer declares, per family, `@Directive({selector: 'button[nfsButton][color]'}) class AppButtonColor { readonly color = input.required<AppColor>(); }` and imports it next to the library directive.

- Strict templates: both inputs are checked, so the consumer's names pass and typos fail (P7).
- Completion: the library input's entries only; the consumer's names are not offered (4.2).
- Bundle: one small class per family; it receives the value at runtime.
- It fails open: a component that does not import the narrowing directive gets O2's checking.

### O6. Branded value type from a typed factory

Shape: `type NfsColor = string & {readonly [brand]: true}`; `nfsPalette(['primary', ..., 'purple'] as const)` returns `{readonly primary: NfsColor, ...}`; `color = input<NfsColor>()`.

- Strict templates: static strings fail, so every use is a property binding such as `[color]="palette.purple"`; unknown members fail (P5).
- Completion: the palette's names as members (4.2).
- Consumer cost: every component exposes the palette as a field (the probe used `protected readonly palette = palette`), and Foundation's static-attribute markup becomes bindings throughout. The list is hand-written or generated (O9).
- Bundle: the factory and one object per family ship.
- SSR: the palette is a module constant on both sides.

### O7. Library type module the consumer remaps with tsconfig `paths`

Shape: the library types every open family from one types-only subpath (say `ngx-foundation-sites/theme-types`) that ships Foundation's defaults. A consumer with custom settings adds one `paths` entry that points the specifier at its own type file.

- Strict templates: defaults without the entry; the consumer's names with it, although the import sits inside the package (P6b).
- Completion: the consumer's names (4.2).
- Bundle: none (a type-only import).
- Consumer cost: one tsconfig line and one type file, hand-written or from O9; no code per directive.
- Failure without a shipped default: TS2307 with `skipLibCheck: false`, or a silent `any` with the CLI's `skipLibCheck: true` (P6).
- Scope: one set of names per TypeScript program; a workspace with several applications and different Sass settings needs a tsconfig per application (not measured).
- Relation to the veto: no `declare module`, no `declare namespace`, no merged interface; the module is replaced by resolution settings. Whether the veto's reason also covers this is not recorded (section 7).

### O8. Typed provider or injection token

Shape: `provideNfsVariants({buttonColors: [...]})` or a token holding the lists.

- Strict templates and completion: no effect (P8); DI never reaches the type check (section 3), and a provider cannot mint a typed directive (P9).
- What it gives: a runtime list that a development-mode check can compare a bound value against without reading CSS, and that the check can in turn compare with the Sass through O10's properties. This is ADR 0005's shape for breakpoints: `nfsBreakpointsToken` mirrors `$breakpoints` and a development check compares it with `--nfs-breakpoint-*` (`adr/0005-breakpoint-source-of-truth.md:7`; `specs/breakpoint-service.md:290-294`).
- Bundle: the lists ship in production unless provided only in development builds.

### O9. TypeScript generated from the consumer's Sass settings

Shape: a library-supplied script or builder compiles the consumer's settings with Foundation and a library mixin that hands each map's keys to a JavaScript function, and writes a `.ts` file of unions (4.3). The output is consumed by O4 (the unions as type arguments), O5, O6, or O7 (the remapped file).

- Cost measured: one extra Sass compile of about 0.25 s that emits no CSS (4.3); it cannot run inside the application builder's Sass compile (4.3), so it is a separate step, and the file must exist before the type check and the editor see it.
- TypeScript and Sass cannot disagree right after generation; they can once the Sass changes and the file is not regenerated. Running the generator in CI and failing on a diff would catch it (not measured).
- The other direction, TypeScript names as the source with a generated Sass list that an `nfs-*` mixin checks with `@error`, is possible in principle (not measured).
- Prior art: Chakra UI v3's `chakra typegen` writes into the installed package, `node_modules/@chakra-ui/react/types/styled-system/generated`, "which should not be committed", and is run from `postinstall` or `prepare` (https://github.com/chakra-ui/chakra-ui/blob/%40chakra-ui/react%403.37.0/packages/cli/src/commands/typegen.ts#L20-L30; https://chakra-ui.com/docs/get-started/cli); that overwrites a package's declaration file rather than merging into it. Panda CSS's `panda codegen` writes a `styled-system/` folder in the consumer's project (https://panda-css.com/docs/references/cli; docs only, not checked against source).

### O10. Development-mode runtime check of class availability

Not a type: it pairs with any option above, and it is the only check that sees the compiled CSS.

- Custom-property channel: a library mixin writes each map's keys to one custom property on `:root` (4.4); a directive in development mode reads it and warns when a bound value is not in the list. All three engines read the lists back (4.4). One property per family holds the whole list, so names that exist only in Sass are visible, unlike the breakpoint drift check, which reads one property per known name and cannot list properties by prefix (`specs/breakpoint-service.md:294`). About 200 bytes of CSS ship in production unless the include is kept out of production styles.
- Stylesheet-scan channel: finds `.button.purple` and not `.button.pink` in a few milliseconds (4.4). Limits not measured here: a cross-origin stylesheet throws on `cssRules`, constructed stylesheets are not in `document.styleSheets`, and the match depends on the selector text Foundation and the minifier produce.
- SSR: no computed style on the server (the server DOM has no layout or `matchMedia`, `research/angular-rendering-modes.md:31`, and computed-style reads belong in render callbacks, `:51`), so the check runs in the browser after the first render, in development only, as the breakpoint drift check does (`specs/breakpoint-service.md:290`).
- It catches a bound value with no class: typos, removed keys, classes behind a Sass flag, and components whose export mixin is not included (2.6). It cannot catch a name never bound.

### Declaration merging (out, by the user's veto)

Note (2026-09-27, after this file was written): The user settled the veto's reach on 2026-09-27: it rules out every way of changing the library's types from outside the consumer's own code, namely declaration merging (`declare module`, `declare namespace`), a tsconfig `paths` entry that remaps a library type module (O7), and a generator that overwrites a type file inside the installed package (Chakra's `typegen` approach). Consumer-local code stays: a subclass (O4), a narrowing directive (O5), a typed factory (O6), a closed or open union (O1, O2), a development-mode check (O10), and a generator that writes into the consumer's own source tree (O9 feeding O4 to O6). O7 and the package-overwriting form of O9 are therefore out as well; section 7's first unknown is answered.

Note (2026-09-27, later): Later the same day the user narrowed the veto: consumer-side declaration merging (module augmentation of library-declared registry interfaces) is allowed again, on the condition that a probe confirms it reaches Angular's strict template type check; a tsconfig `paths` remapping stays out, and anything that writes into or overwrites files in `node_modules` is out under all circumstances. Subclassing (O4) is disfavoured by the user's general rule that directive composition is preferred over subclassing.

Consumer-side `declare module` or `declare namespace` augmentation is not a candidate ([Triage the out-of-scope Foundation components and variants](../issues/79-triage-out-of-scope-components-and-variants.md), Answer item 7). No reason for the veto is recorded in the bundle. For the record only: MUI types `color`, `size`, and `variant` as `OverridableStringUnion<defaults, ButtonProps...Overrides>` over empty interfaces that consumers augment with `declare module '@mui/material/Button'` (https://github.com/mui/material-ui/blob/v9.4.0/packages/mui-material/src/Button/Button.d.ts#L9-L103; https://mui.com/material-ui/customization/palette/), and Mantine derives `MantineColor` from an augmentable `MantineThemeColorsOverride`, combined with `(string & {})` in its defaults (https://github.com/mantinedev/mantine/blob/9.6.3/packages/%40mantine/core/src/core/MantineProvider/theme.types.ts#L259-L284; https://mantine.dev/theming/colors/).

## 6. Survey of other libraries

From the Sonnet 5 sweep (raw files in `PROBE/survey/`, line numbers spot-checked for MUI, Mantine, Ionic, react-bootstrap, ng-bootstrap, Chakra, Taiga UI, Spartan UI, Radix Themes, tailwind-merge, and tailwind-variants).

| Library (version) | Prop | Mechanism | Declaration merging | Where the custom style comes from |
| --- | --- | --- | --- | --- |
| ng-bootstrap 21.0.0 | `NgbAlert.type`, `NgbProgressbar.type` | plain `string` | no | Bootstrap classes built from the string |
| ngx-bootstrap 22.0.0 | `AlertComponent.type` / `ProgressbarComponent.type` | `input<string>` / closed union | no | Bootstrap classes |
| ng-wizi-bulma (commit `fdfd06d`, no tags) | `ProgressBarComponent.color` | closed union of four; no button component, no size input | no | Bulma `is-*` classes (https://github.com/WiziShop/ng-wizi-bulma/blob/fdfd06dd58701d11246ad83d094b8417fc6b71a7/projects/ng-wizi-bulma/src/lib/progress-bar/progress-bar.component.ts#L38) |
| PrimeNG 21.1.10 | Button `severity`, `size` | closed union | no | `p-button-<value>` classes from its theme package |
| Ionic 9.0.5 | `Color` | `LiteralUnion` (`string & Record<never, never>`) | no | `--ion-color-<name>` properties and `.ion-color-<name>` |
| Taiga UI 5.25.0 | `tuiAppearance` / sizes | `string` union / closed unions | no | stylesheet keyed by `[data-appearance]` |
| Spartan UI 1.5.0 | helm Button `variant`, `size` | inferred from a `cva()` config copied into the consumer's project | no | the copied config |
| MUI 9.4.0 | Button `color`, `size`, `variant` | declaration merging into `...Overrides` | yes | theme palette object |
| Mantine 9.6.3 | `MantineColor` | declaration merging plus `(string & {})` | yes | theme object, emitted as CSS variables |
| Chakra UI 3.37.0 | `colorPalette` | code generation into `node_modules` | no | theme config |
| Radix Themes 3.3.0 | `color` | closed list, no extension | no | CSS variables of existing names |
| class-variance-authority 0.7.1, tailwind-variants 3.3.1 | `VariantProps` | inferred from the consumer's config object (https://github.com/joe-bell/cva/blob/v0.7.1/packages/class-variance-authority/src/index.ts#L25-L68; https://github.com/heroui-inc/tailwind-variants/blob/v3.3.1/src/types.ts#L304-L307) | no | the config's class strings |
| tailwind-merge 3.6.0 | `extendTailwindMerge` | explicit type parameters | no | n/a |
| react-bootstrap 2.10.10 | `Variant`, `Color` | `(string & {})` | no | Bootstrap classes |
| Angular Material 22.2.0 | `color` / `appearance` | closed `ThemePalette` on most, `string` on buttons, chips, toolbars, checkboxes, slide toggles / closed unions | no | `mat-<color>` classes (M2); the button's `color` "has no effect in M3 themes" (`COMP/src/material/button/button-base.ts:92-98`) |

None of the Angular libraries surveyed lets a consumer extend a variant type other than by passing any string.

## 7. Open unknowns for the decision panel

1. The veto's reason is not recorded. Does it also rule out O7 (a module replaced by `paths`) and a Chakra-style generator that overwrites the package's own declaration file (O9's alternative target)? Both reach the same result as declaration merging (one global set of names, configured outside the component) by other TypeScript mechanisms.
2. Does "typed input" in the class rule (`adr/0039-directives-manage-every-foundation-class.md:10`) require that a typo fails to compile (O1, O4, O5, O6, O7), or is O2 with O10's runtime warning enough?
3. What an unconfigured consumer gets: O1 and O7's default reject names added in Sass until the consumer configures TypeScript; O2 accepts typos. Which failure the library prefers is a policy choice the sources do not settle.
4. How many directives in the 51 specs carry an open family, which sets the consumer's cost under O4 and O5. Section 2 lists the settings; the count per spec is not made here.
5. Responsive and numeric families (`.medium-expanded`, `.large-6`, `.small-up-3`, `.medium-order-2`): object-shaped inputs (`{medium: 6}`) against string or template-literal types, and how the language service completes them, are not measured. Class names follow `$breakpoint-classes` while `NfsBreakpointName` follows `$breakpoints` (2.3); whether Variant inputs need their own breakpoint type is open.
6. O4 at runtime: a real ng-packagr build, the linker, and the browser; importing the library's directive and the consumer's subclass together; a library directive that finds another through DI.
7. O7 across tools: ng-packagr packaging of a types-only secondary entry point, the Angular unit-test builder under Vitest, `@storybook/angular-vite`, and Nx workspaces with several applications and different Sass settings.
8. O9's place in the workflow: `ng serve` watch, the editor seeing the file before the first build, whether a generated file is committed, and a CI drift check.
9. O10's custom properties: whether the include can stay out of production styles without a second Sass entry point; whether a development-only metadata rule fits ADR 0012 ("emit only the rules Foundation cannot provide", `adr/0012-sass-packaging.md:7`) and stays clear of the map's out-of-scope line on runtime theming through custom properties (`map.md:251`).
10. Input defaults: section 2.9 shows that a default which emits a class can fight a Sass default (`fill: 'solid'` against `$button-fill: hollow`). Whether every Variant input defaults to "no class" is for the panel.
11. Storybook controls generated from `(string & {})` or from generated unions (the story conventions in `storybook-conventions.md`) are not measured.
12. Completion of `(string & {})` rests on TypeScript's own completion service, which the Angular language service calls (`NG/packages/language-service/src/completions.ts:292-296`); behaviour under TypeScript releases after 6.0 is not measured.
