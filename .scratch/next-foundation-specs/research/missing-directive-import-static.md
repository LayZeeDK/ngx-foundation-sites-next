# Detecting a forgotten attribute directive import: the static check

Evidence for [Prototype: detecting a forgotten attribute directive import](../issues/145-prototype-missing-directive-import-checks.md), the static half; the runtime half is `research/missing-directive-import-runtime.md`. This file decides nothing: P24 of [Decide: the directive and component architecture guide](../issues/141-decide-directive-component-architecture-guide.md) is OPEN FOR HUMAN.

## Header

- Question: can a check over the consumer's templates report an element that carries a library directive's attribute when the component's scope does not bring that directive in, reliably, at what cost, and how would it ship? Compared: (a) an ESLint rule on `@angular-eslint`'s template parser, (b) a Node check over the Angular compiler's own program and template type checker, fed a selector manifest the library generates, runnable as an Architect builder or Nx target.
- Date: 2026-09-28. Built and measured AFK by one agent.
- Versions: `@angular/core`, `@angular/compiler`, `@angular/compiler-cli` 22.2.0; TypeScript 6.0.3; ESLint 10.11.0; `@angular-eslint/template-parser` and `@angular-eslint/eslint-plugin-template` 22.5.0 (bundling `@angular/compiler` 22.1.4); `typescript-eslint` 8.70.1; `@angular-devkit/architect` 0.2202.0; Node 24.18.0 on Windows 11 arm64 (Snapdragon X Elite). Angular source cited from the local clone at `5db6fc4` (22.2.0).
- Prototype: [prototypes/missing-directive-imports/static/](../prototypes/missing-directive-imports/static/README.md); experiment directory `D:/tmp/nfs-145-static/` (not committed). No server was started and no port was used.
- Stand-in library: `ngx-foundation-sites` compiled by `ngc` in partial mode and installed as a package with `exports`, so the consumer reads it through `.d.ts` metadata as it would a real release: `NfsButton` (`button[nfsButton], a[nfsButton]`, a `color` input), the Accordion family of four (`[nfsAccordion]`, `[nfsAccordionItem]`, `button[nfsAccordionTitle]`, `[nfsAccordionContent]`) with `NFS_ACCORDION`, and `NfsCallout` (`[nfsCallout]`, a `color` input). The selector manifest `nfs-selectors.json` lists each directive's name, entry point, and selector, and each import array's members; `tools/gen-manifest.mjs` writes it from the library source with TypeScript's parser.
- Workspace: the ticket's cases (33 components, each base case once inline and once external), plus 240 generated components (and a second run with 1000): half inline, half external templates of about 40 to 60 lines with filler markup, `@if`, `@for` with `@empty`, `@defer`, two child components each, three import styles (classes, `NFS_ACCORDION`, a consumer array), and a forgotten member, family, or single directive on every tenth component (24 of 240, 106 expected reports; 100 of 1000, 442). Faults use static attributes only, so the compiler reports none of them.

## Headline

- Both checks report every case the ticket names, inline and external, in every template context, with no false positive on the correctly imported cases or on the consumer's own `nfs`-looking attributes: 141 of 141 expected reports and no extra one at 273 components, 477 of 477 at 1033.
- They part on scope. (b) reads the scope the compiler computed, so it matched Angular in all seven harder cases (an `imports` built by a function, a path-aliased workspace library, an installed design-system package, a template in another folder, a renamed import, a consumer directive hosting a library directive, a component declared in an NgModule). (a) has to rebuild the scope from syntax and matched in two: it skipped two (silent misses) and gave four false positives in three.
- Cost: at 273 and 1033 components, (b) takes 1790 and 3655 ms, 80 and 71 percent of an `ngc` type check of the same program (2228 and 5124 ms); the ESLint rule adds 259 and 690 ms to an ESLint run that already parses the templates (1406 and 2736 ms). Only (a) gives editor feedback (6 to 28 ms per warm file).
- (b) needs no new dependency and no private field, but it depends on compiler-cli exports that are not documented public API. (a) needs a published ESLint plugin, `@angular-eslint`'s parser and processor in the consumer's config, about 350 lines that re-implement parts of Angular's scope resolution, and it goes stale under ESLint's `--cache`.
- (b) fits the Variant tooling's packaging and builder shape, as a second builder in the same collection, not as a mode of the `nfs-variants` target and not as a sync generator.

## 1. The approaches built

### (a) ESLint rule on the template parser (`eslint-plugin/missing-directive-import.cjs`)

A template rule sees one template AST and nothing else, so it has to find the owning component and read the imports itself:

- Inline templates: `@angular-eslint/eslint-plugin-template`'s `extract-inline-html` processor lints each inline template as a virtual file `<component>.ts/inline-template-<basename>-<n>.component.html`, numbering only components that have an inline `template` and no `templateUrl`. The rule re-parses the physical `.ts` file and takes the n-th such component, counted the same way (a file with a `templateUrl` component followed by two inline ones is a case, `multi.ts`).
- External templates: the linted file is the `.html`. The rule tries the `.ts` file with the same base name (Angular CLI layout), then every `.ts` file of the template's folder, for a component whose `templateUrl` resolves to it. A template in any other folder has no owner, and the rule reports nothing for it. A first version scanned the whole folder for every template: 17.4 s at 1000 components in one folder, against 3.0 s with the same-name file first.
- Imports: TypeScript's parser only, no type checker. A library name is looked up in the manifest (an import array expands to its members); a local `const`, a spread, `as const`, `forwardRef`, a namespace import, a renamed import, a relative or tsconfig-`paths` import (resolved with `ts.resolveModuleName` and the nearest tsconfig), `export *` and named re-exports, and an NgModule's `exports` are followed into workspace files. A module resolved into `node_modules` that is not the library is assumed to provide none of its directives. Anything else (a call, a conditional) marks the component unresolved: the rule reports nothing for it, and says so only with its `reportUnresolved` option.
- Matching: Angular's `CssSelector` and `SelectorMatcher` from the bundled compiler, over the manifest's selectors. `createCssSelectorFromNode` could not be used as is: the template parser overwrites each binding's numeric `type` with its class name (keeping the number in `__originalType`), so Angular's `i.type === BindingType.Property` test (`packages/compiler/src/render3/view/util.ts:214`) never passes and bound inputs would drop out of the selector; the rule carries a copy of that function that reads `__originalType`.
- Caching: the rule's in-process parse cache is keyed on the file's modification time. Without that, a long-lived ESLint process (an editor's server) kept the old `imports` after an edit (measured: 0 reports where 1 was due).

### (b) Node check over the compiler (`ngtsc-check/check.mjs`, `builder.mjs`)

- Program: `readConfiguration(tsconfig)`, then `NgTscPlugin.wrapHost()`, `ts.createProgram()`, and `NgTscPlugin.setupCompilation()`. `NgtscProgram` and `NgTscPlugin` both create their compiler with the template type checker off (`packages/compiler-cli/src/ngtsc/program.ts:120`, `tsc_plugin.ts:147`), and `getTemplateTypeChecker()` then throws ("does not work without `enableTemplateTypeChecker`", `core/src/compiler.ts:728`). Only the language service turns it on. So the check creates a second `NgCompiler` over the same `ts.Program` with `freshCompilationTicket(..., /* enableTemplateTypeChecker */ true, false)` and `NgCompiler.fromTicket(ticket, host)`, taking the host from `wrapHost()` and the program driver and perf recorder from the plugin's compiler. A first version took the host from `NgtscProgram`'s compiler's private `adapter` field; the plugin route needs no private field.
- Templates: `analyzeAsync()`, then for each class `TemplateTypeChecker.getTemplate()` (the first call with `OptimizeFor.WholeProgram`, which builds every type-check shim in one program update) and a `TmplAstRecursiveVisitor` over every element and `ng-template`, which reaches every block's children.
- Matching: for each element, `createCssSelectorFromNode()` against a `SelectorMatcher` of the manifest's selectors gives the library directives the element would get; `getDirectivesOfNode(component, node)` gives the directives the compiler actually matched there, host directives included. A candidate the compiler did not match is a finding, located at the element's start tag (the `.ts` file's line for an inline template) and naming the entry point and, for a family member, its array.
- Builder: `builder.mjs` is a plain Architect builder (`createBuilder`) with the Variant tooling builder's option shape: `buildTarget` (default `<project>:build`), whose `tsConfig` it reads through `context.getTargetOptions`, or `tsConfig` directly; it fails when a finding is reported. `tools/run-builder.mjs` ran it as `shop:nfs-imports` through Architect's Node API, the path `ng run` takes: 481 findings, `success: false`. Architect loads a builder with `require()`, which rejects an ESM graph with top-level await (`ERR_REQUIRE_ASYNC_MODULE`), so the check module has none.
- Not possible: an extended diagnostic. The extended checks are a fixed list inside the compiler (`ALL_DIAGNOSTIC_FACTORIES`, `typecheck/extended/index.ts:31`), with no registration point for a library's check. The nearest one, `missingStructuralDirective`, reports only `*name` syntax, and checks it by searching matched selectors for `[name]` (`checks/missing_structural_directive/index.ts:79`).

## 2. Results

Reports are one per element and directive. "Angular" is the truth: what the compiler matches, checked by (b)'s `getDirectivesOfNode` and by reading each case. Every base case ran once inline and once external, with the same result in both forms; reports land in the `.html` file for an external template and in the `.ts` file at the template's line for an inline one.

| Case | Expected reports | Compiler alone | (b) ngtsc check | (a) ESLint rule |
| --- | --- | --- | --- | --- |
| Forgotten member: `NfsAccordionTitle` not imported, two titles | 2 | silent | 2 | 2 |
| Forgotten family: no accordion import, 1 + 2 x 3 elements | 7 | silent (static attributes only; any bound input on a member gives NG8002) | 7 | 7 |
| Forgotten single directive: `<button nfsButton color="primary">` | 1 | silent | 1 | 1 |
| Imported correctly: by class; `NFS_ACCORDION`; a consumer array in another file spreading `NFS_ACCORDION`; a consumer NgModule re-exporting | 0 each | clean | 0 | 0 |
| Consumer CSS attributes: `nfsHighlight`, `nfs-note`, `data-nfs-callout`, `class="nfs-card"`, and `nfsButton` on a `div` | 0 | clean | 0 | 0 |
| Bound input on the missing directive: `<div nfsCallout [color]="tone">` and `<div nfsCallout color="warning">` | 2 | NG8002 on the bound one only | 2 | 2 |
| Contexts: inside `@defer`, `@if`, `@for`, an `ng-template` rendered by `NgTemplateOutlet`, and content projected into a consumer `app-card` that imports `NfsButton` itself | 5 | silent | 5, each in the declaring template | 5, each in the declaring template |
| The same contexts with `NfsButton` imported (a deferred dependency inside `@defer`) | 0 | clean | 0 | 0 |
| Three components in one file: a `templateUrl` one, an inline one forgetting `NfsButton`, an inline one importing it | 1 | silent | 1 | 1 |
| `imports: [buttonImports()]`, a function returning `[NfsButton] as const`; `nfsCallout` forgotten | 1 | silent | 1 | 0 (unresolved, skipped) |
| `UI_IMPORTS` from a tsconfig path alias `@acme/ui` (`export *`); `nfsCallout` forgotten | 1 | silent | 1 | 1 |
| `DS_IMPORTS` from an installed package `@acme/design-system` (`.d.ts` tuple of `typeof NfsButton, typeof NfsCallout`) | 0 | clean | 0 | 2 false |
| `templateUrl: './far-templates/...'`, a template in a subfolder; `NfsButton` forgotten | 1 | silent | 1 | 0 (no owner, skipped) |
| Renamed import `NfsButton as Btn` | 0 | clean | 0 | 0 |
| Consumer directive `[appPrimary]` with `hostDirectives: [NfsButton]`, markup `<button nfsButton appPrimary>` | 0 | clean | 0 | 1 false |
| Component declared in an NgModule (`standalone: false`) that imports `NfsButton`; `nfsCallout` forgotten | 1 | silent | 1 | 2 (1 false) |
| 240 generated components, 24 faulty | 106 | silent | 106, none extra | 106, none extra |
| 1000 generated components, 100 faulty | 442 | silent | 442, none extra | 442, none extra |

- The `nfs`-looking consumer attributes: both checks match whole selectors, not a prefix, so an attribute no library selector names is never reported, and `nfsButton` on a `div` is not either, because the selector admits only `button` and `a`. Neither reports that misplacement; the same matcher could, by matching attribute names alone, as a separate message. A consumer attribute equal to a library selector's attribute on an element the selector admits is reported, which is right while the library owns the `nfs` prefix (ADR 0009); (a) can be silenced per line with an ESLint comment, and (b) would need an ignore option, which the prototype does not have.
- The bound input: NG8002 already stops the build on the bound form; both checks report it again, and the static form, which nothing else reports.
- Projected content is reported in the parent that declares it even though `app-card` imports `NfsButton`: Angular matches directives in the declaring template's scope, and both checks do the same.
- (b) gave the same 145 findings with `strictTemplates: false` and `fullTemplateTypeCheck: false`.
- Neither check sees a template no `@Component` declares: a Storybook story's `render()` template, `TestBed.overrideTemplate`, or a JIT-compiled string. Components declared in spec files are covered by (b) only when it is run over the spec tsconfig.

## 3. Costs measured

Median wall time of a fresh process (5 runs at 273 components, 3 at 1033; `tools/bench.mjs`):

| Command | 273 components | 1033 components |
| --- | --- | --- |
| `ngc -p` type check of the workspace (the build's own analysis and template type check, for scale) | 2228 ms | 5124 ms |
| (b) ngtsc check | 1790 ms | 3655 ms |
| of which analysis / templates and matching (in-process) | 973 / 347 ms | 2118-2395 / 1025-1046 ms |
| ESLint over `src/**/*.{ts,html}` with the template parser and inline processor, rule off | 1406 ms | 2736 ms |
| ESLint with the rule on (a) | 1665 ms | 3426 ms |
| Editor-like: one ESLint instance, first file / each later file | 762-1192 ms / 6-28 ms | same |
| Architect builder run of (b) (in-process time) | -- | 3415 ms |

- (b) runs a second full Angular analysis beside the build's, because the build's compiler cannot be asked for its template type checker; it adds nothing to `ng build` and costs one target run in CI.
- (a) is cheap on top of an ESLint run the consumer already has; a consumer who does not lint templates with `@angular-eslint` pays the whole ESLint row.

Maintenance and API surface:

| | (a) ESLint rule | (b) ngtsc check |
| --- | --- | --- |
| Code | 471 lines (346 without blank and comment lines): owner lookup, the syntactic import resolver, a copy of Angular's attribute collection | 174 lines (129) with its CLI, a 21-line builder, `builders.json`, a draft-07 `schema.json` |
| Knows the scope by | re-implementing parts of the compiler's scope resolution from syntax, one form at a time | the compiler's own scope: standalone `imports`, NgModule scopes, host directives, `.d.ts` metadata, evaluated expressions |
| New public surface | an ESLint plugin (a package or a subpath export of the tooling), a rule name, its options (`manifest`, `reportUnresolved`), flat-config documentation | one builder, `ngx-foundation-sites:missing-imports`, with `buildTarget` and `tsConfig`, and its message |
| What the consumer must install and configure | ESLint 9 or 10, `@angular-eslint/template-parser` and `@angular-eslint/eslint-plugin-template` (for the processor), the plugin in `eslint.config` for `**/*.html` and the processor for `**/*.ts` | nothing new: `@angular/compiler-cli`, `@angular/compiler`, and `typescript` are in every Angular workspace, and `@angular-devkit/architect` comes with `@angular/build`; a target in `angular.json` or `project.json` |
| Upstream it depends on | angular-eslint's AST changes (`type` overwritten), the processor's virtual file names and numbering, the bundled compiler it ships (22.1.4 inside 22.5.0, a minor behind), ESLint's major versions | compiler-cli exports that are not documented public API: `NgTscPlugin`, `freshCompilationTicket`, `NgCompiler.fromTicket`, `TrackedIncrementalBuildStrategy`, `OptimizeFor`, `TemplateTypeChecker.getTemplate` and `getDirectivesOfNode` (the language service's API, `index.ts:34-70`); `@angular/compiler`'s `SelectorMatcher`, `CssSelector`, `createCssSelectorFromNode`, `TmplAstRecursiveVisitor` |
| Editor feedback | yes | no |

## 4. How each would ship

(b), as a builder of the Variant tooling's collection ([Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md), D22):

- The library build generates the selector manifest from its own sources beside the Variant manifest, as a sibling JSON or as `directives` and `arrays` keys of that manifest; the tooling reads it from its install location, never through `exports`. The runtime check could read the same list. (b) could also derive the list from the installed typings, since `.d.ts` metadata carries every selector, but a manifest is simpler and is written at the one moment the library knows its entry points.
- The package's `builders.json` gains `missing-imports` beside `variant-types`; the Angular CLI runs it, and Nx runs it as an Angular-compatible builder, as the Variant builder was measured to run in [Prototype: Variant declaration tooling in real Nx and Angular CLI workspaces](../issues/137-prototype-variant-declaration-tooling.md).
- The consumer (or the setup generator `ngx-foundation-sites:variant-types`, which already adds `nfs-variants` per application) adds a target `"nfs-imports": {"executor": "ngx-foundation-sites:missing-imports", "options": {"buildTarget": "shop:build"}}`. CI runs `ng run shop:nfs-imports` or `nx run-many -t nfs-imports`; under Nx the target is cacheable on the project's sources, its tsconfig, and the installed library version. A second target with `tsConfig: "tsconfig.spec.json"` covers components declared in tests.
- What it reuses from the Variant tooling: the collection and packaging, the builder declared under `builders` with no Nx executor, the `buildTarget` option read through `context.getTargetOptions` (the Variant builder reads `styles` the same way; this one reads `tsConfig`, measured), the draft-07 schema, the message style, the setup generator's target writing, and the CI step shape. What it does not reuse: the Sass core, the declaration-file reader and writer, and the sync generator. It should not be a mode of `nfs-variants`, whose input is the compiled Sass, not a TypeScript program; and not a sync generator, which exists to write files and would repeat a full analysis before every task.

(a), as an ESLint plugin:

- A CommonJS plugin beside the tooling (a subpath export such as `ngx-foundation-sites/eslint-plugin`) or a separate package, with optional peer dependencies on `eslint` and `@angular-eslint/template-parser`.
- The consumer adds the plugin and rule to the `**/*.html` block of `eslint.config` and needs angular-eslint's processor on `**/*.ts` for inline templates; it runs in `ng lint`, `nx lint`, and the editor. The docs would have to say not to trust `eslint --cache` for this rule (below), and which layouts and import forms it cannot check.

## 5. Failure modes

(a):

- Silent misses where it cannot rebuild the scope: an `imports` built by a call or a conditional, a template outside its component's folder (both measured); a barrel or alias TypeScript cannot resolve from the nearest tsconfig. It fails open by design; the alternative, reporting everything it cannot resolve, turns each of these into noise.
- False positives where syntax is not scope: a component declared in an NgModule (its scope is the module's `imports`, which the rule would have to find across the workspace), a consumer directive that hosts a library directive (the rule would have to apply `hostDirectives` only where the consumer directive's selector matches), and a package that re-exports the library's directives (its `.d.ts` tuple would have to be read) (all measured). Each can be patched with more code that copies a piece of Angular's scope rules.
- Staleness: ESLint's `--cache` keys a result on the linted file and the config, so a template keeps its old result after its component's `imports` change (measured: 0 reports cached against 1 uncached). Nx's task cache hashes the project's files, so a component change would rerun an Nx lint task (not measured here); ESLint's own cache is the one that goes stale.
- Upstream: the processor's numbering, the parser's AST changes, and the bundled compiler's version are all angular-eslint's, and the rule breaks silently when they change.

(b):

- Compiler API drift: an Angular minor could change the exports it uses. A throw is loud; a changed `getTemplate` that returns `null` would check no component and pass, so the builder must fail when it checks zero components (not in the prototype). A `getDirectivesOfNode` that returned nothing would report every element, which is loud.
- Coverage: only the programs of the tsconfigs it is given; not Storybook `render()` templates, `TestBed.overrideTemplate`, or JIT strings.
- Feedback only at CI or on demand, never in the editor; a developer sees the unstyled element first.
- A second analysis in CI: about 70 to 80 percent of a type check of the same program.
- A consumer attribute equal to a library selector's attribute is reported with no way to silence it until an ignore option exists.

Both: neither reports a library attribute on an element its selector excludes (`<div nfsButton>`), and neither can run inside `ng build`: the compiler has no plugin point for a library's diagnostic, and running inside the application builder was not measured.

## 6. Recommendation and its limits

Recommendation: if the library ships a static check, ship (b), as the opt-in `ngx-foundation-sites:missing-imports` builder in the Variant tooling's collection, added to each application by the setup generator and run as its own CI step. It is the only one of the two that is exact: it asks the compiler which directives it matched on each element, so it inherits every scope rule (NgModules, host directives, packages, evaluated `imports`) rather than copying them. It adds no consumer dependency and no ESLint surface. ADR 0040 turned down both kinds of check for Variant typing, for their library API and upkeep and because the registry-typed input already rejects the literals at compile time (considered options); here no type catches the case, so that second reason does not carry over, and the upkeep argument counts against (a) far more than against (b). Do not ship (a): to reach (b)'s results it would have to copy most of Angular's scope resolution into a lint rule.

Limits:

- No editor feedback, and no report before CI unless the developer runs the target. The runtime check, the story gate's class assertions, and NG8002 for bound inputs remain the faster signals.
- It relies on compiler-cli exports that are not documented public API, so every Angular major, and ideally every minor, needs a run of the prototype's cases in the library's own CI, and it needs the zero-components guard.
- It checks one TypeScript program per target, and never sees story or test templates that no `@Component` declares.
- It catches forgotten imports whatever the import style: a forgotten member is reported when a consumer imports classes one by one, so detection does not depend on the provisional import array. The check also has the data the arrays hide from the unused-imports diagnostic, which stays silent on members of an imported exported array (`validation/src/rules/unused_standalone_imports_rule.ts:155-182`): `getUsedDirectives` per component could report array members a component never uses. That report was not built. Whether this changes P24's array choice is for the user.
- Side finding for P24: a library array declared `as const` does not compile in an NgModule's `imports` or `exports` (TS2322: the readonly tuple is not assignable to `any[]`); an NgModule consumer has to spread it (`[...NFS_ACCORDION]`), which the component `imports` of a standalone component does not need.
