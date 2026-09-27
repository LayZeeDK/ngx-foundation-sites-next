# Variant typing alternatives not weighed in the first dossier

Ticket: [Research: further typing and synchronisation options for Variant inputs](../issues/135-research-further-variant-typing-options.md), item 2 of its How to work it, for [Decide: typed Variant inputs over open Sass maps](../issues/81-decide-typed-variant-inputs-open-sass-maps.md). Model: Fable 5.1. The sibling file `variant-typing-sync-tooling.md` covers item 1 (Nx sync generators, Angular CLI equivalents, reading the Sass, prior art for generating TypeScript from styles).

This file decides nothing. It lists the typing mechanisms that the first dossier ([Research: typed Variant inputs over open Sass maps](../issues/80-research-typed-variant-inputs-open-sass-maps.md), `research/typed-variant-inputs.md`, cited as `D` with its option numbers O1 to O10) did not weigh, measures each with `ngc` 22.2 under strict templates where that was cheap, and compares each with option A: consumer-side declaration merging of library-declared registry interfaces, the consumer's `.d.ts` hand-written or generated from its Sass by an Nx generator (exposed as an Angular CLI schematic) and kept in step by an Nx sync generator (`issues/135-research-further-variant-typing-options.md:11`). Two candidates added by the orchestrator while the work ran are included as N9 (one consumer constant drives both a `provide*()` factory and the declaration merging) and N10 (a `StaticProvider` passed through the `BootstrapContext` argument of `bootstrapApplication`).

Constraints this file works under (`issues/135-research-further-variant-typing-options.md:13`): a tsconfig `paths` remapping of a library type module is vetoed; anything that writes into or overwrites files in `node_modules` is vetoed under all circumstances; directive composition is preferred over subclassing and no consumer is asked to extend a library class (`map.md:37`); no Foundation or NFS class name appears in consumer code, even as an input value ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md), `adr/0039-directives-manage-every-foundation-class.md:25`). The user also said on 2026-09-27 that a development-mode (or optionally production-mode) runtime check and a CI check "sounds like a good idea" (relayed in this ticket's brief); N5 and N6 below are the CI-check candidates.

Sources and path prefixes:

- `NG/` = `d:/projects/github/angular/angular`, branch 22.2.x, the clone the dossier used (`D:10`).
- `PROBE2/` = `D:/tmp/nfs-research-135-alt`, a throwaway workspace that is not committed. Its `node_modules` was a junction to `D:/tmp/nfs-ct-prototype/node_modules` (`@angular/*` 22.2.0, TypeScript 6.0.3, `@schematics/angular` 22.2.0, Node 24.18.0) and `PROBE2/lint/node_modules` a junction to this repository's `node_modules` (angular-eslint 21.1.0, ESLint 9.39.2). Both junctions were removed when the work ended. The decisive code is quoted below.
- `T81` = the judge's probe recorded in the decision ticket (`issues/81-decide-typed-variant-inputs-open-sass-maps.md:29-43`), cases J, S, and L.
- Web sources are pinned to a tag or commit and were read on 2026-09-27.
- Bundle paths are relative to the effort directory.

## 1. Alternatives at a glance

| # | Alternative | Misspelt open name fails to compile | Consumer's own names compile | Editor offers the consumer's names | Composition, not subclassing | Relation to option A |
| --- | --- | --- | --- | --- | --- | --- |
| N1 | Generic directive whose type parameter is inferred from a palette object or name tuple bound on the same element | yes on an element that binds the palette; no on one that does not | yes | no (the language service answers "No content available") | yes | a second type source beside A; A makes it unnecessary |
| N2 | Input transforms with generic or overloaded parameter types | no: a generic transform is not inferred (TS2769), an overloaded one takes its last overload, and a decorator input rejects both (NG1010) | n/a | n/a | n/a | none; a transform's parameter may name a registry type, which is A again |
| N3 | Declared write-type override, `static ngAcceptInputType_<name>` | only against a type the library chose (O1's trade); ignored for a signal input; deprecated | no | no | n/a | none; library-side only, a consumer cannot add one |
| N4 | Consumer directive that hosts the library directive through `hostDirectives` and declares its own `color` | yes, static and bound | yes | no while the library's `color` is exposed under its own name; yes when it is aliased away | yes | independent of A; the composition-shaped twin of O5, and generatable |
| N5 | angular-eslint template rule that checks values against a generated list | at lint time, static and literal-bound values only | yes | no | yes | composes; a second net |
| N6 | Angular extended diagnostics (no registration API) and a stand-alone check on `TemplateTypeChecker` | at CI time, static and literal-bound values only; matches directives as the compiler does, host directives and aliases included | yes | no | yes | composes; a second net |
| N7 | TypeScript 6.0 | nothing new; `types: []`, the `strict` default, the `baseUrl` deprecation, and TypeScript 7 noted | - | - | - | A is unchanged under 6.0 |
| N8 | A TypeScript language-service plugin for completion | no | - | in principle (not measured) | - | composes with O2; A does not need it |
| N9 | One consumer constant drives `provideNfsVariants(theme)` and an `Overrides` augmentation | yes, TS2820 with a suggestion | yes | yes | yes | is A, driven by a value instead of a generated `.d.ts` |
| N10 | `StaticProvider`s through `BootstrapContext.platformRef` or `ApplicationConfig.providers` | no | n/a | no | n/a | none for types; a runtime list only |
| A | Registry interface plus consumer augmentation, measured here as the baseline | yes: TS2322 for a `keyof Registry` type, TS2820 with a suggestion for the literal-union shape | yes | yes | yes | - |

## 2. Measured probes

### 2.1 Workspace and commands

A library compiled with `ngc` in partial mode with `declaration: true` (`PROBE2/lib/tsconfig.json`), consumed through its emitted `.d.ts` by consumer programs whose tsconfig maps `alt-lib` to `../dist/lib/src/index.d.ts` and sets `angularCompilerOptions: {}`, so `strictTemplates` is on by default (`D:120`; `NG/packages/compiler-cli/src/ngtsc/core/src/compiler.ts:1058-1064`). Commands: `node node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js -p lib/tsconfig.json`, then `-p app/<tsconfig>.json` for each consumer variant. Completion: `node tools/completions.mjs`, which drives `tsserver` 6.0.3 with `--globalPlugins @angular/language-service` and asks `completionInfo` inside `color="p|"`, the dossier's method (`D:177`). Lint: `node lint/run.mjs` (ESLint's Node API with `cwd` pinned to `PROBE2/lint`). CI check: `node tools/ttc-check.mjs app/tsconfig.noreg.json`.

### 2.2 Library declarations (`PROBE2/lib/src/index.ts`)

```ts
export type NfsPaletteColor = 'primary' | 'secondary' | 'success' | 'warning' | 'alert';
export type NfsButtonColor = NfsPaletteColor | (string & {});           // the decision's open type

@Directive({selector: 'button[nfsBtn]', host: {class: 'button', '[class]': 'color() ?? ""'}})
export class NfsBtn { readonly color = input<NfsButtonColor>(); }       // baseline

// N1: the palette bound on the same element fixes P; N1b adds NoInfer on color.
export class NfsGenObj<P extends Record<string, unknown> = Record<NfsPaletteColor, unknown>> {
  readonly palette = input<P>();
  readonly color = input<keyof P & string>();
}
export class NfsGenList<const N extends readonly string[] = readonly NfsPaletteColor[]> {
  readonly names = input<N>();
  readonly color = input<N[number]>();
}

// N2: transforms.
export function nfsKeep<K extends string>(value: K): K { return value; }
export function nfsOverloaded(value: NfsPaletteColor): string;
export function nfsOverloaded(value: number): string;
export class NfsTGen { readonly color = input<string | undefined, string>(undefined, {transform: nfsKeep}); }
export class NfsTOv { readonly color = input('', {transform: nfsOverloaded}); }

// N3: the static write-type member beside a decorator input and beside a signal input.
export class NfsCoerced { @Input() color?: string; static ngAcceptInputType_color: NfsPaletteColor | undefined; }
export class NfsCoercedSignal { readonly color = input<string>(); static ngAcceptInputType_color: NfsPaletteColor | undefined; }

// A0: a registry holding the defaults; the consumer merges names in.
export interface NfsButtonColorRegistry { primary: true; secondary: true; success: true; warning: true; alert: true; }
export class NfsReg { readonly color = input<keyof NfsButtonColorRegistry>(); }

// A1: an empty registry that falls back to the defaults; A1b writes the member type out.
export interface NfsBadgeColorRegistry {}
export type NfsBadgeRegColor = keyof NfsBadgeColorRegistry extends never ? NfsPaletteColor : keyof NfsBadgeColorRegistry & string;
export class NfsRegBadge { readonly color = input<NfsBadgeRegColor>(); }
export class NfsRegBadge2 { readonly color: InputSignal<NfsBadgeRegColor | undefined> = input<NfsBadgeRegColor>(); }

// N9: an overrides interface with MUI's true/false semantics, a theme constant, and a provider.
export interface NfsButtonPaletteOverrides {}
type NfsOverwrite<T, U> = Omit<T, keyof U> & U;
type NfsTrueKeys<T> = {[K in keyof T]: T[K] extends true ? K : never}[keyof T];
export type NfsOverridableStringUnion<T extends string, U = {}> = NfsTrueKeys<NfsOverwrite<Record<T, true>, U>>;
export type NfsButtonColorOv = NfsOverridableStringUnion<NfsPaletteColor, NfsButtonPaletteOverrides>;
export class NfsOv { readonly color = input<NfsButtonColorOv>(); }
export class NfsOv2 { readonly color: InputSignal<NfsButtonColorOv | undefined> = input<NfsButtonColorOv>(); }
export interface NfsThemeConfig { readonly buttonColors?: readonly string[]; readonly removedButtonColors?: readonly string[]; }
export function defineNfsTheme<const T extends NfsThemeConfig>(theme: T): T { return theme; }
export const nfsVariantsToken = new InjectionToken<NfsThemeConfig>('nfsVariantsToken');
export function provideNfsVariants<const T extends NfsThemeConfig>(theme: T): EnvironmentProviders { ... }
```

Consumer declarations (`PROBE2/app/src/`):

```ts
type AppColor = NfsPaletteColor | 'purple';

// N4: the consumer's directive hosts the library directive and adds its own input.
@Directive({selector: 'button[appBtn]', hostDirectives: [{directive: NfsBtn, inputs: ['color']}]})
export class AppBtn { readonly color = input<AppColor>(); }
@Directive({selector: 'button[appBtnPass]', hostDirectives: [{directive: NfsBtn, inputs: ['color']}]})
export class AppBtnPass {}
@Directive({selector: 'button[appBtnAlias]', hostDirectives: [{directive: NfsBtn, inputs: ['color: nfsColor']}]})
export class AppBtnAlias { readonly color = input<AppColor>(); }

// A: nfs-registry.d.ts
import 'alt-lib';
declare module 'alt-lib' {
  interface NfsButtonColorRegistry { purple: true }
  interface NfsBadgeColorRegistry { primary: true; secondary: true; success: true; alert: true; purple: true }
}

// N9: nfs-theme.ts, then nfs-theme.augment.d.ts
export const theme = defineNfsTheme({buttonColors: ['brand'], removedButtonColors: ['warning']} as const);

import type {theme} from './nfs-theme';
declare module 'alt-lib' {
  interface NfsButtonPaletteOverrides
    extends Record<(typeof theme.buttonColors)[number], true>,
      Record<(typeof theme.removedButtonColors)[number], false> {}
}
```

### 2.3 Template type checking

Every line below is one binding in a component template compiled by `ngc`. "compiles" means no diagnostic on that line.

| Case | Directive | Binding | Result |
| --- | --- | --- | --- |
| G01 | `NfsGenObj` | `[palette]="palette" color="purple"` (`palette` is an object literal with the six keys) | compiles |
| G02 | same | `[palette]="palette" color="pnik"` | TS2322 `Type '"pnik"' is not assignable to type '"primary" \| "secondary" \| "success" \| "warning" \| "alert" \| "purple" \| undefined'` |
| G03 | same | `color="pnik"`, no palette bound | compiles |
| G04 | same | `[palette]="palette" [color]="str"` (`string`) | TS2322 |
| G05, G06 | `NfsGenList` | `[names]="names"` (an `as const` tuple of the six) with `color="purple"` / `color="pnik"` | compiles / TS2322 listing the six names |
| G07 | same | `[names]="['primary', 'purple']" color="pnik"` | TS2322 `Type '"pnik"' is not assignable to type '"primary" \| "purple" \| undefined'`: the class's `const` type parameter survives Angular's type constructor |
| G08 | `NfsGenObjNoInfer` (`color = input<NoInfer<keyof P & string>>()`) | `[palette]="palette" color="purple"` | compiles |
| G09, G10 | same | `color="pnik"` / `color="primary"`, no palette bound | both compile |
| T01, T02 | `NfsTGen` | `color="anything"` / `[color]="42"` | compiles / TS2322 `Type 'number' is not assignable to type 'string'` |
| T03, T04, T05 | `NfsTOv` | `color="primary"` / `[color]="42"` / `color="pnik"` | TS2322 `Type 'string' is not assignable to type 'number'` / compiles / TS2322 |
| T3, T4 | library compile of `@Input({transform})` with the overloaded / the generic function | - | NG1010 `Input transform function cannot have multiple signatures` / NG1010 `Input transform function cannot be generic` |
| C01, C02, C03 | `NfsCoerced` | `color="primary"` / `color="pnik"` / `[color]="str"` | compiles / TS2322 `Type '"pnik"' is not assignable to type 'NfsPaletteColor \| undefined'` / TS2322 |
| C04, C05 | `NfsCoercedSignal` | `color="primary"` / `color="pnik"` | both compile: the static member does nothing for a signal input |
| H01 to H04 | `AppBtn` | `color="purple"` / `color="pnik"` / `[color]="str"` / `[color]="maybe"` (`AppColor \| undefined`) | compiles / TS2322 `Type '"pnik"' is not assignable to type 'AppColor \| undefined'` / TS2322 / compiles |
| H05 | `AppBtnPass` | `color="pnik"` | compiles: the exposed input keeps the library's open type |
| H06, H07 | `AppBtnAlias` | `color="pnik"` / `nfsColor="pnik"` | TS2322 against `AppColor \| undefined` / compiles |
| A01 to A04, with the registry file | `NfsReg` | `color="purple"` / `color="pnik"` / `[color]="str"` / `[color]="maybe"` | compiles / TS2322 `Type '"pnik"' is not assignable to type 'keyof NfsButtonColorRegistry \| undefined'` / TS2322 / compiles |
| A01, A04, without it | same | `color="purple"` / `[color]="maybe"` | TS2322 / TS2322 `Type 'AppColor \| undefined' is not assignable to type 'keyof NfsButtonColorRegistry \| undefined'` |
| A05, A06, A07 | `NfsRegBadge` | `color="purple"` / `color="warning"` / `color="primary"` | TS2322 against `NfsPaletteColor \| undefined` / compiles / compiles, with or without the registry file (see 2.4) |
| A08, A09, A10, with the registry file | `NfsRegBadge2` | `color="purple"` / `color="warning"` / `color="pnik"` | compiles / TS2322 `Type '"warning"' is not assignable to type '"primary" \| "secondary" \| "success" \| "alert" \| "purple" \| undefined'` / TS2322 |
| A08, A09, A10, without it | same | same | TS2322 against `NfsPaletteColor \| undefined` / compiles / TS2322 |
| N01 to N09, augmentation in a `.d.ts` | `NfsOv`, `NfsOv2` | `color="brand"` / `color="brnad"` / `color="warning"` on each; `color="primary"`; `[color]="str"`; `[color]="danger ? 'alert' : 'brand'"` | compiles / TS2820 `Type '"brnad"' is not assignable to type 'NfsButtonColorOv \| undefined'. Did you mean '"brand"'?` / TS2322 (the removed default) on each; compiles; TS2322; compiles |
| N01 to N09, augmentation in a `.ts` file (`export {}` at the end) | same | same | identical |
| N01 to N09, `isolatedModules: true`, `.d.ts` or `.ts` augmentation | same | same | identical |
| N01 to N09, `provideNfsVariants(theme)` referenced, no augmentation | same | same | `brand` fails: TS2322 on `color="brand"` (both directives), on `[color]="danger ? 'alert' : 'brand'"` (`Type '"alert" \| "brand"' is not assignable to type 'NfsButtonColorOv \| undefined'`), and TS2322 without a suggestion on `brnad` |
| N01 to N09, `bootstrapApplication(N9Cases, {providers: [provideNfsVariants(theme)]}, {platformRef: platformBrowser([{provide: nfsVariantsToken, useValue: theme}])})`, no augmentation | same | same | identical to the previous row |
| N01 to N09, a `.d.ts` with `declare module 'alt-lib' { ... }` and no import or export | same | any | TS2305 `Module '"alt-lib"' has no exported member 'NfsOv'` and the same for `NfsOv2`, `provideNfsVariants`, `defineNfsTheme`: a script file's `declare module` is an ambient module that replaces the library's types |
| N01 to N09, the theme written as `export const themeWide = {buttonColors: ['brand']}` (no `defineNfsTheme`, no `as const`) and merged as `Record<(typeof themeWide.buttonColors)[number], true>` | same | same | every line compiles, `brnad` and `warning` included: `Record<string, true>` widens the union to `string` |

### 2.4 What declaration emit kept (`PROBE2/dist/lib/src/index.d.ts`)

- `NfsReg.color: InputSignal<keyof NfsButtonColorRegistry | undefined>`: the `keyof` of an interface stays unresolved, so a later merge is seen by every consumer program.
- `NfsRegBadge.color: InputSignal<NfsPaletteColor | undefined>`: TypeScript resolved the conditional type at the library's build, when the registry was empty. The alias `NfsBadgeRegColor` is still exported with its conditional, but the member no longer refers to it, which is why A05 fails with the registry present.
- `NfsRegBadge2.color: InputSignal<NfsBadgeRegColor | undefined>`: an explicit member annotation is emitted as written, so the conditional is evaluated in the consumer's program (A08 to A10).
- `NfsOv.color: InputSignal<NfsButtonColorOv | undefined>` and `NfsOv2.color` the same: the mapped-type alias survived inference, so N9 does not need the annotation (N01 to N03 behave like N04 to N06). Whether this holds for every alias shape is not guaranteed by anything measured; the annotation is the safe form.
- `NfsTGen.color: InputSignalWithTransform<string | undefined, string>` and `NfsTOv.color: InputSignalWithTransform<string, number>`: the transform's write type is a fixed type in the `.d.ts` (2.8).
- `NfsCoerced` keeps `static ngAcceptInputType_color: NfsPaletteColor | undefined`; the compiler reads it from the class declaration's members when it loads a `.d.ts` (`NG/packages/compiler-cli/src/ngtsc/metadata/src/util.ts:299`, `NG/packages/compiler-cli/src/ngtsc/metadata/src/dts.ts:337-340`).

### 2.5 Editor completion (`node tools/completions.mjs`, string entries)

| Position | Entries |
| --- | --- |
| `nfsBtn color="p\|"` (open type) | primary, secondary, success, warning, alert |
| `nfsReg color="p\|"` and `[color]="'p\|'"` (registry merged) | the five and purple |
| `nfsRegBadge color="p\|"` (conditional resolved at build) | the five |
| `nfsRegBadge2 color="p\|"` (annotated member, registry merged) | primary, secondary, success, alert, purple |
| `nfsGenObj [palette]="palette" color="p\|"` | the request fails: `success=false`, message "No content available." |
| `appBtn color="p\|"` (host `NfsBtn` exposes `color`, own `color` beside it) | the five: completion follows the library input, as the dossier found for O5 (`D:190-193`) |
| `appBtnAlias color="p\|"` (own `color` only) | the five and purple |
| `nfsOv color="b\|"`, `nfsOv2 color="b\|"`, `nfsOv2 [color]="'b\|'"` (theme constant merged) | primary, secondary, success, alert, brand |

### 2.6 The lint rule (`PROBE2/lint/eslint.config.mjs`, `node lint/run.mjs`)

A local rule for `@angular-eslint/template-parser`: on an `Element` whose attributes or inputs include `nfsBtn` or `appBtn`, a `color` text attribute outside the list is reported, a `[color]` binding whose AST is a `LiteralPrimitive` outside the list is reported, and any other `[color]` expression is reported as unverifiable. The shape copies `button-has-type`, which checks `type` the same way and deliberately ignores non-literal bindings (`node_modules/@angular-eslint/eslint-plugin-template/dist/rules/button-has-type.js:89-111`).

| Fixture line | Result |
| --- | --- |
| `<button nfsBtn color="purple">` | no report |
| `<button nfsBtn color="pnik">` | reported, `"pnik" is not in the palette (...)` |
| `<button nfsBtn [color]="'pnik'">` | reported |
| `<button nfsBtn [color]="danger ? 'alert' : 'pnik'">` | reported as unverifiable |
| `<button nfsBtn [color]="someField">` | reported as unverifiable |
| `<button appBtn color="pnik">` | reported, because `appBtn` was listed in the rule; a host-directive relation is invisible to the rule |
| `<span nfsBadge color="pnik">` | no report (not configured) |
| `<button color="pnik">` | no report |
| inline template in a `.ts` file, `<button nfsBtn color="pnik">` | reported through the `extract-inline-html` processor (the `.ts` file itself also raised a parse error because the probe config gave it no TypeScript parser, which is a config detail, not the rule) |

The parser services a template rule receives are two source-span converters and nothing else (`@angular-eslint/utils` v22.5.0, https://github.com/angular-eslint/angular-eslint/blob/v22.5.0/packages/utils/src/eslint-plugin-template/parser-services.ts#L7-L14; the same two in the installed 21.1.0, `node_modules/@angular-eslint/utils/dist/index.js:36-56`). There is no type checker and no directive matching.

### 2.7 The stand-alone `TemplateTypeChecker` check (`PROBE2/tools/ttc-check.mjs`)

The script builds an `NgtscProgram` from `readConfiguration('app/tsconfig.noreg.json')` (both exported by `@angular/compiler-cli`: `NG/packages/compiler-cli/index.ts:16`, `:35`; `NG/packages/compiler-cli/src/perform_compile.ts:75`), sets `options._enableTemplateTypeChecker = true` (the option the language service uses, "Enable the Language Service APIs for template type-checking for tests", `NG/packages/compiler-cli/src/ngtsc/core/api/src/options.ts:35-38`; without it `getTemplateTypeChecker()` throws, `NG/packages/compiler-cli/src/ngtsc/core/src/compiler.ts:725-731`), and reads `program.compiler.getTemplateTypeChecker()` (`NG/packages/compiler-cli/src/ngtsc/program.ts:40`). For every class it calls `getTemplate` (`NG/packages/compiler-cli/src/ngtsc/typecheck/api/checker.ts:77`), walks the element nodes, and for each element asks `getDirectivesOfNode` (`NG/packages/compiler-cli/src/ngtsc/typecheck/src/checker.ts:462-469`). A match is the library's directive when its class name is `NfsBtn` and its input mapping maps the attribute's public name to the class property `color` (`TypeCheckableDirectiveMeta.inputs: ClassPropertyMapping<InputMapping>`, `NG/packages/compiler-cli/src/ngtsc/typecheck/api/api.ts:31`). Results on the H cases:

| Template line | Finding |
| --- | --- |
| `<button appBtn color="purple">` | `NfsBtn matchSource=1: ok` |
| `<button appBtn color="pnik">` | `NfsBtn matchSource=1: not in primary secondary success warning alert purple` |
| `<button appBtn [color]="str">`, `[color]="maybe"` | `bound expression, not checked statically` |
| `<button appBtnPass color="pnik">` | reported |
| `<button appBtnAlias color="pnik">` | skipped: `NfsBtn.color` is not bound by this attribute (the matched directives are `NfsBtn`, `AppBtnAlias`, `NfsBtn`) |
| `<button appBtnAlias nfsColor="pnik">` | reported as `NfsBtn`: the alias is resolved through the mapping |

`matchSource=1` is `MatchSource.HostDirective` (`NG/packages/compiler/src/render3/view/t2_api.ts:188-194`), set by the host-directives resolver (`NG/packages/compiler-cli/src/ngtsc/metadata/src/host_directives_resolver.ts:64`): `getDirectivesOfNode` lists a hosted directive as its own match with its exposed inputs. Two things did not work: `@angular/compiler-cli` bundles its own copy of `@angular/compiler`, so `instanceof` against classes imported from `@angular/compiler` never matches (the script compares constructor names), and `getSymbolOfNode` (`checker.ts:169-183`) returned `null` for every attribute in this program, although it is the API the language service uses; the symbol builder also notes that "input and output bindings only return the first directive match" (`NG/packages/compiler-cli/src/ngtsc/typecheck/src/template_symbol_builder.ts:118-121`). The cause of the `null` is an open unknown (section 6).

### 2.8 What TypeScript infers for a transform's write type (`PROBE2/lib/src/t1-inference.ts`, `tsc --declaration --emitDeclarationOnly`)

| Call | Emitted type or error |
| --- | --- |
| `input(undefined, {transform: nfsKeep})` (generic transform) | TS2769 `No overload matches this call ... Type '<K extends string>(value: K) => K' is not assignable to type '(v: unknown) => string \| undefined'` |
| `input.required({transform: nfsKeep})` | TS2769, both overloads fail |
| `input<string \| undefined, string>(undefined, {transform: nfsKeep})` | `InputSignalWithTransform<string \| undefined, string>` |
| `input('', {transform: nfsOverloaded})`, `input.required({transform: nfsOverloaded})`, `input(undefined, {transform: nfsOverloaded})` | `InputSignalWithTransform<string, number>`, `<string, number>`, `<string \| undefined, number>`: the last overload's parameter |

The `input()` overloads that take a transform are `<T, TransformT>(initialValue: undefined, opts: InputOptionsWithTransform<T | undefined, TransformT>)` and the `unknown`-typed forms (`PROBE2/node_modules/@angular/core/types/core.d.ts:146-156`, `:166-175` for `required`).

## 3. The alternatives

For every alternative: SSR is unaffected, because each is a compile-time, lint-time, or editor mechanism and the class comes from the same input value on the server and in the browser (host bindings render on the server, `adr/0039-directives-manage-every-foundation-class.md:22`). N4 adds runtime directives; a host directive's host bindings apply to the host element like a template-matched directive's (`NG/adev/src/content/guide/directives/directive-composition-api.md:22`), so it renders the class on the server the same way (not measured in a browser or server run).

### N1. Generic directive, type parameter inferred from a separate input on the same element

Shape: `NfsGenObj<P>` with `palette = input<P>()` and `color = input<keyof P & string>()`, or `NfsGenList<const N>` with a names tuple. The consumer binds `[palette]="palette"` (or `[names]="names"`) on every element beside `color`.

- Measured: with the palette bound, a typo fails and the consumer's names compile, static and bound (G01, G02, G04, G05, G06), and an inline array literal keeps literal element types because the class's `const` type parameter survives Angular's type constructor (G07). With the palette unbound, any name compiles (G03), `NoInfer` included (G09, G10): the type constructor passes every unset input as `0 as any` (`NG/packages/compiler/src/typecheck/ops/directive_constructor.ts:111-116`, `:195-199`), so `P` is inferred from `any` and `keyof P & string` becomes `string`. Inference reads the element's own bindings only (`directive_constructor.ts:86-116`; `D:122`), so a palette bound on an ancestor, provided through DI, or hosted through `hostDirectives` cannot fix `P` for another element.
- Completion: the language service fails the request at that position ("No content available.", 2.5), the same answer the decision's panel got for rules-object keys (`issues/81-decide-typed-variant-inputs-open-sass-maps.md:88`).
- Error text: the resolved literal union, without a suggestion (G02).
- Cost to the library: one type parameter per open family on every directive with one, and a `palette` (or `names`) input that exists only to carry a type; the `.d.ts` keeps the generic class (`NfsGenObj<P extends Record<string, unknown> = ...>`, 2.4).
- Cost to the consumer: one extra binding per element per open family, and a palette object or `as const` tuple in every component that uses it. Foundation's static markup (`color="purple"`) becomes two attributes per element. A consumer who forgets the binding gets no check and no warning (G03).
- Composition: no subclass; but the check depends on per-element markup, not on composition.
- With A: a second source of the same names. If A is adopted, the palette input has no purpose, because the input type already lists the consumer's names.
- Unknowns: none worth a probe; the per-element cost rules it out on its own terms.

### N2. Input transforms with generic or overloaded parameter types

- Measured: TypeScript does not infer `TransformT` from a generic transform function (TS2769, 2.8), so the write type must be written as a type argument, after which it is a fixed type in the `.d.ts` (`InputSignalWithTransform<string | undefined, string>`, 2.4). An overloaded transform's write type is the parameter of its last overload (`<string, number>`, 2.8), so `color="primary"` fails and `[color]="42"` compiles (T03, T04). A decorator `@Input({transform})` rejects a generic function and an overloaded one outright (NG1010, `NG/packages/compiler-cli/src/ngtsc/annotations/directive/src/shared.ts:1610-1624`). The compiler captures no transform type for signal inputs; the write type is the second type argument of `InputSignalWithTransform` (`NG/packages/compiler/src/typecheck/ops/inputs.ts:105-109`, `:174-181`).
- What a transform can still do: its parameter type is the write type, and that type may be a registry-derived type (A) or the decision's `NfsVariantBoolean` (`issues/81-decide-typed-variant-inputs-open-sass-maps.md:47`). Nothing about a transform reaches the consumer's names by itself.
- Cost: none, because there is nothing to adopt.
- With A: neutral. A registry type in a transform's parameter is A.

### N3. Declared write-type override: `static ngAcceptInputType_<name>`

- What it is: a static class member whose type replaces the input's write type in the type-check block (`NG/packages/compiler/src/typecheck/ops/inputs.ts:111-131`). Documented as the pre-TypeScript-4.3 way to widen a setter's accepted type, and "deprecated" since setters may declare a wider type (`NG/adev/src/content/tools/cli/template-typecheck.md:216-294`, deprecation at `:287-288`). A class may not have both a transform and the member (`shared.ts:1626-1638`).
- Measured: it narrows a decorator input's write type as well as widening it (C02, C03 fail against `NfsPaletteColor | undefined`); beside a signal input it is ignored (C04, C05 compile). The compiler reads the member from the class declaration's own members, in source and in a `.d.ts` (`util.ts:299`, `dts.ts:337-340`), so a consumer cannot add or change one from outside: a namespace merged into the class would not be a class member, and the member's type, once declared, cannot be redeclared.
- Cost: decorator inputs only, which the specs do not use (signals for state, `map.md:41`); nothing over declaring the input's type.
- With A: nothing to add. Its only use would be a library-declared member typed by a registry, which is the input type under A with an extra, deprecated step.

### N4. Consumer directive that hosts the library directive and declares its own input

Shape: `@Directive({selector: 'button[appBtn]', hostDirectives: [{directive: NfsBtn, inputs: ['color']}]}) class AppBtn { color = input<AppColor>(); }`, imported in place of `NfsBtn`. The consumer's markup carries `appBtn`, never `nfsBtn`.

- Measured: a typo fails and the consumer's names compile, static and bound (H01 to H04), with the message naming the consumer's alias (`AppColor | undefined`). The exposed library input keeps its own open type on the same element (H05), so the check comes from the consumer's input alone: two inputs named `color` on one element, both assigned. With the library input aliased away (`inputs: ['color: nfsColor']`), `color` is the consumer's only `color` (H06) and `nfsColor` stays open (H07).
- Completion: with both inputs named `color`, the language service offers the library's five names (2.5), as it did for O5 (`D:190-193`); with the alias, the consumer's names appear, the one measured shape in this file, other than A and N9, that completes a consumer name.
- Angular's rules: a host directive's selector is ignored (`directive-composition-api.md:29`); its inputs and outputs are hidden unless listed, and may be aliased (`:31-75`); the consumer directive and the host directive may both inject each other and both define providers, the hosting class's providers winning on a shared token (`:164-168`); a template match of the same directive replaces the host match (`:174-178`). `HostDirectiveMeta` carries the directive, `inputs`, and `outputs` and nothing else (`NG/packages/compiler-cli/src/ngtsc/metadata/src/api.ts:325-343`), so a hosted directive's `exportAs` is not carried (not measured at runtime).
- Cost to the library: none; no type changes, no base classes. Every library directive must be usable as a host directive, which standalone directives are (`:28`).
- Cost to the consumer: one directive per library directive with an open family (a `hostDirectives` entry names one class, so O5's one-selector-list-per-family shortcut does not apply), each listing every input and output it wants to keep (`:33`), and application markup that differs from the library's documented markup (`appBtn` for `nfsBtn`). A Sass edit needs an edit of each consumer directive's type, or a regenerate.
- Composition: this is the composition form the map prefers (`map.md:37`). It is the composition-shaped twin of the decision's Narrowing directive (O5, `D:279-287`; `T81` S01 to S06): O5 sits beside the library directive on the library's selector, N4 wraps it under the consumer's selector. Both fail open in a component that imports and writes `nfsBtn` directly (`T81` L05).
- With A: independent. Under A the library input is already closed by the registry, so N4 adds nothing; without A, the decision's generator could emit N4 instead of O5 for consumers who want their own attribute names and completion of their names (the alias form).
- Unknowns: `exportAs` and template reference variables (`#b="nfsButton"`) on the hosting element; whether every library directive's DI contract (tokens that children inject, `AGENTS.md` Content Projection and DI) holds when the library directive is a host directive rather than a template match; the runtime is documented, not measured here.

### N5. A template lint rule (angular-eslint) checking values against a generated list

- Measured: a rule over the template AST reports a static `color="pnik"` and a literal `[color]="'pnik'"`, and can only flag any other expression as unverifiable (2.6). It matches elements by attribute name, so it knows `appBtn` hosts `NfsBtn` only if configured to, and it cannot see input aliases or `hostDirectives` exposure. Inline templates are covered through the `extract-inline-html` processor. The parser services expose no type checker (2.6).
- Existing rules: none of the installed `@angular-eslint/eslint-plugin-template` rules validates an attribute's value against a configurable list (`node_modules/@angular-eslint/eslint-plugin-template/dist/rules/`); `button-has-type` is the nearest shape.
- Error text: the rule's own message, with the list, in the editor (ESLint extension) and in CI.
- Cost to the library: a rule shipped in a package (`ngx-foundation-sites/eslint-plugin` or similar), which reads a list the generator writes (JSON or a `.ts` module), plus the list of library selectors and inputs, which the decision already plans to ship (`adr/proposed-variant-input-types.md:32`).
- Cost to the consumer: an ESLint config entry and the generated list; nothing per component.
- Composition: neutral; it touches no directive.
- With A: composes, but adds nothing at compile time under A, whose typos already fail. Its value is for consumers on the open type (O2) as a second net beside the Variant check, and as editor feedback without any TypeScript.
- Unknowns: whether a rule can share the generator's list file without a build step between them; angular-eslint's template rules gain no type information in v22.5.0 either (the parser services are the same two functions).

### N6. Angular extended diagnostics, and a stand-alone check on `TemplateTypeChecker`

- Extended diagnostics: the checks are a fixed list in the compiler (`ALL_DIAGNOSTIC_FACTORIES`, `NG/packages/compiler-cli/src/ngtsc/typecheck/extended/index.ts:31-51`), each created from a factory and given a category from `extendedDiagnostics` options (`NG/packages/compiler-cli/src/ngtsc/typecheck/extended/src/extended_template_checker.ts:26-63`). There is no option or API to register a third-party check, so a library cannot add one.
- A stand-alone check: the public exports of `@angular/compiler-cli` (`NgtscProgram`, `readConfiguration`, the `TemplateTypeChecker` API) are enough to walk every template with the compiler's own directive matching (2.7). Measured: it reports a static and a literal-bound typo, it sees a library directive hosted by a consumer directive (`matchSource=1`) and an aliased public name (`nfsColor`), it skips a `color` that binds only to the consumer's directive, and it cannot judge a bound expression (2.7). Its input list would be the same list N5 reads, plus the library's directive names.
- Error text: the tool's own; it can also produce `ts.Diagnostic`s through `makeTemplateDiagnostic` if wanted (not measured).
- Cost to the library: a Node script or an Nx executor (the sibling file's territory) that builds a program per run, the cost of a type check; `_enableTemplateTypeChecker` is an underscore option described as being for tests (`options.ts:35-38`), so it may change without notice.
- Cost to the consumer: one CI target; nothing per component.
- Composition: neutral.
- With A: composes; under A it adds nothing at compile time. Without A it is the CI check the user asked about, with exact directive matching that N5 lacks, and it is the same shape as the decision's `--check` mode, applied to templates instead of to the generated file.
- Unknowns: why `getSymbolOfNode` returned `null` here (the language service path creates its program differently); whether the TCB's types could be read for bound expressions (a `ts.TypeChecker` over the type-check block would give the expression's type, which for `string` says nothing).

### N7. TypeScript 6.0

Read at https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/ (2026-09-27). Nothing in the release adds a typing mechanism for this problem; the release is "a stepping-stone" to the native TypeScript 7.0 and "continues to be API compatible with TypeScript 5.9" (section "Breaking Changes and Deprecations in TypeScript 6.0"). What bears on the alternatives:

- `types` now defaults to `[]` (section of that name): it changes which `node_modules/@types` packages are auto-included, not how a consumer's own `.d.ts` enters a program; the registry `.d.ts` under `src/` is found through `include` or `files`. The Angular CLI's spec tsconfig includes `src/**/*.d.ts` and `src/**/*.spec.ts` (`PROBE2/node_modules/@schematics/angular/application/files/common-files/tsconfig.spec.json.template:10-13`), so a `.d.ts` augmentation under `src/` is in the spec program; a `.ts` augmentation module is in it only when a spec imports it.
- `strict` is now `true` by default, with `module` `esnext` and a floating `target` ("Simple Default Changes"): no bearing; the CLI's template already sets `strict` and `isolatedModules: true` (`PROBE2/node_modules/@schematics/angular/workspace/files/tsconfig.json.template:12`), under which N9 was measured.
- `--baseUrl` is deprecated; `paths` is not (section "Deprecated: `--baseUrl`"). The vetoed remap (O7) is unaffected, and so is its veto.
- "Less Context-Sensitivity on `this`-less Functions": changes inference for function expressions in generic calls; the theme object in N9 carries no functions.
- Earlier features the probes lean on: `const` type parameters (TypeScript 5.0, https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#const-type-parameters) survive Angular's type constructor on a class (G07) and let `defineNfsTheme` keep literal names without `as const`; `NoInfer` (TypeScript 5.4, https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html#the-noinfer-utility-type) does not help N1 (G09). `(string & {})` completion still rests on the closed design limitation microsoft/TypeScript#29729 (`D:125`).
- TypeScript 7.0: the announcement says the deprecated options are removed there and nothing else changes; declaration merging, mapped and conditional types, and `(string & {})` are language features, not options. The language service's completion behaviour under the native port is not measured (section 6).

### N8. A TypeScript language-service plugin for completion

Not measured. A tsserver plugin decorates the language service (https://github.com/microsoft/TypeScript/wiki/Writing-a-Language-Service-Plugin, read 2026-09-27); the Angular language service is itself loaded as one (`--globalPlugins @angular/language-service`, 2.1). A library plugin could add the generated names to completions inside `color="..."` for consumers on the open type (O2), which is the one thing O2 lacks (`D:254`). It changes no type, so a typo still compiles, it runs only in editors that load tsconfig `plugins`, and its interaction with the Angular extension's own tsserver is unknown. With A it is unnecessary, since a merged registry already completes (2.5).

### N9. One consumer constant drives the provider and the declaration merging

Shape (the orchestrator's, measured as written): `export const theme = defineNfsTheme({buttonColors: ['brand'], removedButtonColors: ['warning']} as const);` in consumer source; a consumer `.d.ts` (or `.ts`) with `import type {theme} from './nfs-theme'` and `declare module 'alt-lib' { interface NfsButtonPaletteOverrides extends Record<(typeof theme.buttonColors)[number], true>, Record<(typeof theme.removedButtonColors)[number], false> {} }`; `provideNfsVariants(theme)` in the application config. The library types the input as `NfsOverridableStringUnion<NfsPaletteColor, NfsButtonPaletteOverrides>`, which is MUI's `OverridableStringUnion` (`D:342`): a `true` member adds a name, a `false` member removes a default.

The orchestrator's questions, answered from 2.3 to 2.5:

- An interface inside a module augmentation may extend a type derived from an imported value: `extends Record<(typeof theme.buttonColors)[number], true>` compiled and reached the template type check (N01, N04). The `import type` of a value for use in `typeof` is what makes the file a module; without any import or export the same `declare module 'alt-lib' {}` is an ambient module declaration that replaces the library's types, and every import from the library fails with TS2305 (last rows of 2.3). Svelte's documentation warns about the same trap (https://github.com/sveltejs/svelte/blob/svelte%405.57.1/documentation/docs/07-misc/03-typescript.md#L270).
- A template typo fails with TS2820 and a suggestion: `Type '"brnad"' is not assignable to type 'NfsButtonColorOv | undefined'. Did you mean '"brand"'?` (N02, N05). The registry-of-defaults shape (A0) gives TS2322 without a suggestion because its type prints as `keyof NfsButtonColorRegistry` (A02); the difference is the shape of the type, not the mechanism.
- Custom names complete: `brand` is offered, and the removed `warning` is not, in a static attribute and in a bound literal (2.5).
- `isolatedModules: true`: identical results for the `.d.ts` and the `.ts` augmentation (2.3).
- A spec tsconfig: not run, but the CLI's template includes `src/**/*.d.ts` (N7), so a `.d.ts` augmentation under `src/` is in the spec program and its `import type './nfs-theme'` pulls the constant in. A `.ts` augmentation module is in a program only when imported; the provider-only row of 2.3 shows what a program without the augmentation does: `brand` fails on every use, including inside a ternary (`Type '"alert" | "brand"' is not assignable`).
- Removal: a `false` member removes a default (N03, N06 fail on `warning`), and the same `Record<..., false>` form derives it from the constant. The plain `keyof Registry` shape (A0) cannot remove, because merging only adds members; the conditional fallback (A1) can replace the defaults but needs the annotated member (2.4).
- A `provide*()` factory alone cannot make any template value fail: with `provideNfsVariants` typed `<const T extends NfsThemeConfig>(theme: T)`, referenced from the same program, `brand` still fails (provider-only row), which repeats `D` P8 (`D:168`, `:311-316`) with the provider typed as generically as it can be. N10 extends this to the platform injector.
- What can go wrong silently: a theme written without `defineNfsTheme` or `as const` widens `buttonColors` to `string[]`, the augmentation becomes `Record<string, true>`, and every name compiles, typos included (theme-wide row). The `const` type parameter on `defineNfsTheme` prevents it when the constant goes through the function.

Cost and fit:

- Library: the `Overrides` interface and the mapped type per open family, `defineNfsTheme`, `provideNfsVariants`, and a token the Variant check may read. The library's default input type must be the closed registry-derived type, not the decision's `NfsPaletteColor | (string & {})`, since one outer `(string & {})` would accept every string again.
- Consumer: one constant, one fixed `.d.ts` that never changes (only the constant does), one provider line. The constant is the single place a name is typed; the `.d.ts` is boilerplate a generator or a schematic can write once. A consumer who writes neither gets Foundation's defaults, closed: `purple` fails until the constant lists it (the same day-one trade as O1, `adr/proposed-variant-input-types.md:11`).
- Composition: no subclass, no consumer directive.
- With A: it is A. The registry interfaces, the `.d.ts` in the consumer's tree, and the closed library type are the same; what changes is the source of the names (a value) and the fact that the runtime list (for the Variant check, or for a development-mode comparison with the compiled CSS in the shape of ADR 0005's breakpoint drift check, `adr/0005-breakpoint-source-of-truth.md:7`, `:13`) and the types come from one declaration. The Nx sync generator's job becomes keeping the constant, not the `.d.ts`, in step with the Sass, or the reverse direction where the constant is the source and the Sass map is generated (the sibling file).

### N10. Providers through `bootstrapApplication`: `ApplicationConfig.providers` and `BootstrapContext.platformRef`

- Shape in Angular 22.2: `bootstrapApplication(rootComponent, options?: ApplicationConfig, context?: BootstrapContext)` (`NG/packages/platform-browser/src/browser.ts:123-127`); `BootstrapContext` has one member, `platformRef: PlatformRef` (`:56-61`); the platform is made by `platformBrowser(extraProviders?: StaticProvider[])` (`:236-237`); the application providers are merged at runtime by `createProvidersConfig` (`:166-169`).
- From the compiler's source: the type-check block takes its types from the directive's metadata (its inputs, coerced input fields, type parameters, and host directives) and from the template's bindings (`inputs.ts:89-204`; `directive_constructor.ts:86-116`); the compiler's template type-check code contains no reference to providers or injectors (a search of `NG/packages/compiler/src/typecheck` for `provider`, `Provider`, `injector`, and `Injector` finds none, and `NG/packages/compiler-cli/src/ngtsc/typecheck/api/api.ts` has none). Bootstrap calls are ordinary expressions the compiler does not evaluate. So no provider, wherever it is registered, can make a template value fail to compile.
- Measured: with `provideNfsVariants(theme)` in `ApplicationConfig.providers` and a `StaticProvider` for the same token in the platform through `BootstrapContext.platformRef`, and no augmentation, `brand` fails exactly as in the provider-only program (2.3, the bootstrap row).
- What a provider is for: the runtime list the Variant check can compare with the compiled CSS (O8, `D:311-316`), which N9 supplies from the same constant.

### A. The baseline, measured here

- Reaches the template type check through a partial-compiled `.d.ts`: `keyof NfsButtonColorRegistry` stays unresolved in the `.d.ts` (2.4), a merged `purple` compiles, a typo fails (A01, A02), and completion offers the merged name (2.5). This answers the condition the user set when the veto was narrowed ("a probe confirms it reaches Angular's strict template type check", `D:340`).
- The library's default must be closed. With one outer `(string & {})` on the library type, merging changes nothing, because every string already compiles (`D` P2; `T81` J01).
- Removal and fallback need the right shape: `keyof Registry` only adds (A0); a conditional fallback to the defaults must be written as the member's annotation, or declaration emit freezes it at the library's build (A05 against A08, 2.4); MUI's true/false mapped type (N9) both adds and removes and kept its alias without an annotation (2.4).
- The augmentation file must be a module: an `import` or `export` in it, or the ambient-module trap (N9).
- Error text: TS2322 without a suggestion for `keyof Registry` (A02); TS2820 with a suggestion for the mapped-type shape (N02).
- Every TypeScript program that type-checks templates needs the file: the application, the spec program (N7), Storybook's, and a shared Nx library's. A program without it sees the closed defaults (A01 and A04 without the registry).

## 4. How other ecosystems type theme-extensible props

| Ecosystem | Registry mechanism | Prop or attribute values | Source |
| --- | --- | --- | --- |
| TypeScript's DOM library | `interface HTMLElementTagNameMap`, a global interface every library adds elements to by merging; `document.createElement<K extends keyof HTMLElementTagNameMap>` | not typed for HTML attributes | `PROBE2/node_modules/typescript/lib/lib.dom.d.ts:43099`, `:12929` |
| Lit | recommends `declare global { interface HTMLElementTagNameMap { "my-element": MyElement } }` in published typings | properties typed on the class; no theme registry | https://github.com/lit/lit.dev/blob/4529f776e1c8a23067b008d3299cc10e45ab5391/packages/lit-dev-content/site/docs/v3/tools/publishing.md?plain=1#L161-L175 |
| Stencil | generates `components.d.ts` in the library, with `declare global { ... interface HTMLElementTagNameMap { "tag": HTMLTagElement } }`, shipped to consumers | same | https://github.com/stenciljs/core/blob/v4.45.1/src/compiler/types/generate-app-types.ts#L179-L185 |
| Web components tooling | the custom-elements manifest, turned into VS Code custom data; `@attribute {1,2,3,4} size` becomes the attribute's autocomplete options | editor completion of attribute values from JSDoc, not from types | https://github.com/break-stuff/cem-tools/blob/f709fd69cebf9f9bb1125726da9887dec6612a39/packages/vs-code-integration/README.md?plain=1#L225-L226, `#L257` |
| React | `namespace JSX { interface IntrinsicElements }`, merged for custom elements; MUI's `OverridableStringUnion` over empty `...Overrides` interfaces (`D:342`) | merging | https://github.com/DefinitelyTyped/DefinitelyTyped/blob/de5e8f01d01a14ae4ae502283d3d09f042f1ad89/types/react/index.d.ts#L4262 |
| Vue | `export interface GlobalComponents {}` with the documented `declare module '@vue/runtime-core' { interface GlobalComponents { ... } }`; generic components through `<script setup generic="T">`, inferred per instance from its own props, like N1 | merging; per-instance inference | https://github.com/vuejs/core/blob/v3.5.43/packages/runtime-core/src/component.ts#L174-L181; https://github.com/vuejs/docs/blob/7681134fd8505e61a265d161d73d28acb3c74822/src/api/sfc-script-setup.md?plain=1#L501-L528 |
| Svelte | `<script generics="...">` per instance; `declare module 'svelte/elements' { interface SvelteHTMLElements ... }` for new elements and attributes, with the warning "ensure this is not an ambient module, else types will be overridden instead of augmented" | merging; per-instance inference | https://github.com/sveltejs/svelte/blob/svelte%405.57.1/documentation/docs/07-misc/03-typescript.md?plain=1#L104-L125, `#L243-L270` |
| Solid | `namespace JSX { interface IntrinsicElements }` from dom-expressions; SUID (the MUI port) types `color` as `OverridableStringUnion<..., ButtonPropsColorOverrides>` over empty interfaces | merging | https://github.com/ryansolid/dom-expressions/blob/72437fbe9a5c3dae51d223db4cc9919dcd0bac4b/packages/dom-expressions/src/jsx.d.ts#L22, `#L4248`; https://github.com/swordev/suid/blob/f8d382c07ed7a280dc853cd800b6ee9cf5327cad/packages/material/src/Button/ButtonProps.ts#L15-L19, `#L44-L53` |
| Qwik | `component$<Props>` with explicit prop types and `PropsOf<'button'>`; Qwik UI's styled kit types `look` and `size` as `VariantProps<typeof buttonVariants>` from a `cva` config that the CLI copies into the consumer's project | the consumer owns the config | https://github.com/QwikDev/qwik/blob/%40builder.io%2Fqwik%401.20.1/packages/docs/src/routes/docs/(qwik)/core/overview/index.mdx?plain=1#L256, `#L496`; https://github.com/qwikifiers/qwik-ui/blob/%40qwik-ui%2Fstyled%400.4.1/packages/kit-styled/src/components/button/button.tsx#L3, `#L35-L37` |
| Angular: Nebular | `NbComponentOrCustomStatus = NbComponentStatus \| string`, which collapses to `string` (no completion, `D` P2b) | open string | https://github.com/akveo/nebular/blob/v17.0.0/src/framework/theme/components/component-status.ts#L1-L2 |
| Angular: ng-zorro-antd | closed `NzButtonType` union | closed | https://github.com/NG-ZORRO/ng-zorro-antd/blob/22.1.1/components/button/button.component.ts#L40, `#L97` |
| Angular and others from the dossier | Ionic `LiteralUnion`, PrimeNG and Radix closed, Material `string`, Taiga `string` union, Spartan and shadcn copy-into-project, Mantine and MUI merging, Chakra codegen into `node_modules` | `D:344-366` | `D` section 6 |

Three families, and no fourth: (1) declaration merging of a library- or platform-declared interface, which is TypeScript's own DOM model and what Lit, Stencil, Vue, Svelte, Solid, React, MUI, SUID, and Mantine use; (2) a consumer-owned config value whose type is inferred, which cva, Qwik UI, Spartan, tailwind-merge, and Panda use; (3) open strings. No ecosystem derives prop types from CSS or Sass; every typed one has a TypeScript-side source of truth. N9 is family (2) feeding family (1). Attribute-value completion for plain HTML consumers comes from generated editor data (custom-elements manifest to VS Code custom data), not from types, which is the web-components analogue of N8.

## 5. Against option A plus the generator and the sync generator

Option A, as the ticket states it, is: registry interfaces declared by the library, a consumer `.d.ts` that merges the consumer's names in (hand-written or generated from the Sass by the Nx generator and schematic), and an Nx sync generator that keeps it in step. What each alternative adds to that, what it costs, and whether it composes:

| # | Adds to A | Costs beyond A | Composes with A |
| --- | --- | --- | --- |
| N1 | nothing; the same names through a second channel | one binding per element per family; no completion; fails open when the binding is forgotten | poorly: two type sources for one list |
| N2 | nothing | - | neutral (a registry type in a transform parameter is A) |
| N3 | nothing | deprecated, decorator inputs only, library-side only | neutral |
| N4 | a way to reach compile-time failure without changing any library type, and completion of consumer names in its alias form; a consumer-owned attribute name | one consumer directive per library directive, inputs and outputs re-listed, `exportAs` not carried, markup that differs from the library's docs | independent; under A it is unnecessary; without A it is O5's twin and can be generated by the same tooling |
| N5 | editor and CI feedback with no TypeScript and no per-component code; a check of static values in components outside any generated list | literal values only; attribute-name matching that cannot see aliases or host directives; a rule package and a list file | composes; adds nothing under A at compile time; a second net beside the Variant check under O2 |
| N6 | a CI check with the compiler's own directive matching, host directives and aliases included | literal values only; a program build per run; an underscore option; a script or executor to ship | composes; adds nothing under A at compile time; the template-side counterpart of the sync generator's `--check` |
| N7 | nothing | - | A is unchanged; the `.d.ts` must be in every program (`include`, spec tsconfig) |
| N8 | completion of consumer names under O2 | editor plugin, unmeasured | unnecessary under A |
| N9 | one source for the runtime list and the types; removal through `false`; TS2820 with a suggestion; a `.d.ts` that never changes | `defineNfsTheme` or `as const` is required (a plain object widens to `string` and every name compiles); the closed library default | is A with the constant as the thing the sync generator keeps in step |
| N10 | nothing for types | - | neutral; the runtime list only |

Two facts hold for A under every alternative: the library's default type must be closed (a `(string & {})` member defeats merging), and every program that type-checks templates must include the consumer's `.d.ts`.

## 6. Open unknowns

1. Declaration bundling: the probes used `ngc`'s plain `.d.ts` emit. Whether ng-packagr's declaration bundling keeps `keyof NfsButtonColorRegistry` unresolved, keeps a mapped-type alias (`NfsButtonColorOv`), and keeps an annotated member's alias as the plain emit did is not measured (the dossier's unknown 7 for O7 has the same shape, `D:376`).
2. Secondary entry points: the augmentation targets a module specifier. Whether `declare module 'ngx-foundation-sites/button'` resolves through the package's `exports` subpaths the way the probe's `paths` entry did, and which specifier a consumer must name when a directive's type is re-exported, is not measured.
3. `getSymbolOfNode` returned `null` for every attribute in the stand-alone `TemplateTypeChecker` program (2.7), while the language service relies on it; the cause (program driver, shim state, or `OptimizeFor`) is not found.
4. Several applications with different Sass settings in one Nx workspace: one merged registry per TypeScript program; a shared library's program sees whichever `.d.ts` its own tsconfig includes. Not measured; the sibling file covers the workspace side.
5. Storybook: what `@storybook/angular-vite`'s docgen makes of `keyof Registry`, a mapped-type alias, and a `.d.ts` augmentation that Storybook's program may or may not include (the decision's unknown for the open type, `issues/81-decide-typed-variant-inputs-open-sass-maps.md:156`, applies again).
6. N4 at runtime: `exportAs` and reference variables on the hosting element, a hosted directive's providers as seen by children, and the class rendered on the server; documented (`directive-composition-api.md:22`, `:164-168`), not run.
7. Whether declaration emit keeps every alias shape without an annotation: the conditional alias was resolved (A1), the mapped-type alias was kept (N9); the rule TypeScript applies is not sourced here. The annotated member is the measured safe form.
8. TypeScript 7.0: the announcement promises option removals only; the language service's string completions and `(string & {})` behaviour under the native port are not measured (the dossier's unknown 12 continues, `D:381`).
9. N5 and N6 on bound expressions: both stop at literals; whether reading the type-check block's types adds anything for a `string`-typed field is not measured, and the answer is likely no.
10. Under A, a consumer who runs the sync generator against Sass that removes a default name needs the `false` form (N9) or the annotated fallback (A1b); which the generator writes is a design choice the sibling file and the decision own.
