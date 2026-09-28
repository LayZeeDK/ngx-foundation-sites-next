# Detecting a forgotten attribute directive import: the static check on documented APIs only

Evidence for [Prototype: a static import check on documented APIs only](../issues/149-prototype-documented-api-import-check.md). It is compared with the compiler-based check of [Prototype: detecting a forgotten attribute directive import](../issues/145-prototype-missing-directive-import-checks.md), whose findings are `research/missing-directive-import-static.md`. The choice to ship a static check on documented APIs is the user's ruling, recorded in [ADR 0046](../adr/0046-forgotten-imports-caught-by-checks.md); this file decides nothing further, and [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md) specifies.

## Header

- Question: can TypeScript's compiler API (scope), Prettier's `angular-html-parser` (templates), and a selector matcher over the library's manifest match the compiler-based check on the same cases and workspaces, within the scope the user set, and at what cost?
- Date: 2026-09-28. Built and measured AFK by one agent.
- Versions: TypeScript 6.0.3; `angular-html-parser` 10.13.0 (released 2026-09-21; its lexer's block list equals Angular 22.2.0's, `@boundary` and `@content` included); `@angular/core` and `@angular/common` 22.2.0 for the consumer workspace's types; `@angular-devkit/architect` 0.2202.0; the compiler check and `ngc` from the static prototype's experiment (`@angular/compiler-cli` 22.2.0); Node 24.18.0 on Windows 11 arm64 (Snapdragon X Elite). Angular source cited from the local clone at `5db6fc4` (22.2.0).
- Prototype: [prototypes/missing-directive-imports/documented/](../prototypes/missing-directive-imports/documented/README.md); experiment directory `D:/tmp/nfs-149/` (not committed), which reuses `D:/tmp/nfs-145-static/` read-only. No server was started and no port was used.
- Inputs, the same for both checks on every run: the static prototype's stand-in library, manifest format, 33 case components, workspace generator, and scoring; three more stand-in directives (`NfsTooltip`, `[nfsTooltip]` with an input of that name; `NfsToggler`, `[nfsToggler]` with a model input; `NfsShowFor`, a structural `[nfsShowFor]`), so the manifest lists nine directives; 14 more case components for the ticket's in-scope forms the static set does not exercise; and each generated workspace (240 and 1000 components) in two forms: the static prototype's mixed import styles (classes, `NFS_ACCORDION`, a consumer array; its generator puts every forgotten import in a classes-style component) and classes only, the one style ADR 0046 leaves.

## Headline

- In scope, the documented check gives the compiler check's findings element by element (file, line, column, directive) on every case and on both workspaces, with one exception where the compiler check is the one that is wrong: a library attribute inside `ngNonBindable` content, where Angular's runtime resolves no directive. 106 of 106 and 442 of 442 expected reports in the generated components, none extra; every in-scope case exact.
- Out of scope, it reports nothing and says so: ten case components are skipped with a one-line NFS9002 notice (library and consumer arrays, `as const`, a function call, spreads in an NgModule's `exports`, `standalone: false`). Three of them hold a forgotten import the compiler check reports. In the mixed-style workspaces the notice also covers 144 of 240 and 600 of 1000 generated components, all fault-free by construction.
- Cost: 798 and 1092 ms per fresh run at 287 and 1047 components, against 1559 and 2948 ms for the compiler check, 2058 and 3915 ms for `ngc`, and 660 and 1145 ms for a `tsc` type check. It is the cheaper of the two by half or more, because it builds a TypeScript program and asks the type checker only about the identifiers in `imports`, with no Angular analysis.
- Its price is code that copies Angular's rules: 404 lines (543 with comments and blank lines) against the compiler check's 129, carrying twelve rules from Angular's selector matching, template syntax, and scope (section 4). A differential run with 36 synthetic selectors over the same workspace, 11966 matched elements, found one divergence beyond `ngNonBindable`: `*ngIf="x; else y"` gives the template an `ngIfElse` attribute the check does not derive.
- It depends on no Angular API: TypeScript's public API, `angular-html-parser` (MIT, 204 kB unpacked, no dependencies, a new install for the consumer), and the library's manifest. It ships as the same builder and target the static prototype proposed; the setup generator would add the parser as a development dependency.

## 1. What was built (`check/check.mjs`, `builder.mjs`)

Scope, with TypeScript's compiler API only (`readConfigFile`, `parseJsonConfigFileContent`, `createProgram`, `getTypeChecker`, `getSymbolAtLocation`, `getAliasedSymbol`, `getExportsOfModule`, `resolveModuleName`, `getDecorators`: public declarations of `typescript.d.ts`, the program and type-checker entry points being the ones TypeScript's wiki page "Using the Compiler API" describes):

- The library's classes: for each manifest directive, its entry point is resolved with the workspace's module resolution and the class taken from that module's exports, so a library class is known by its declaration node, whatever name or path the consumer imports it under.
- Angular's decorators: `@Component`, `@Directive`, `@NgModule`, and `@Pipe` whose symbol, through aliases, is declared in `@angular/core`.
- Each standalone component: its own class, then each element of `imports` and `deferredImports`. An element must be an identifier or a property access (a namespace import) that the type checker resolves, through renamed imports, path aliases, `export *`, and named re-exports, to a class declaration. A library class is in scope; another package's class (`NgTemplateOutlet`) brings nothing the check can see; a workspace NgModule brings its `exports` literal, transitively; a workspace directive or component brings the library directives it hosts, through `hostDirectives` (identifiers and `{ directive }` entries), transitively, and from a decorated base class, but only on elements its own `selector` matches.
- Anything else is a skip with a notice naming the reason: an element that is a call, a spread, or not a class (an array, `as const` or not), `standalone: false`, a decorator argument that is not a plain object literal, a non-literal `template`, a missing `templateUrl` file, or a template that does not parse.

Templates, with `angular-html-parser`'s documented `parse(input, { tokenizeAngularBlocks: true, tokenizeAngularLetDeclaration: true })`; the first option also turns on ICU expansion forms (`dist/index.mjs`), as Angular's own parse does. Inline templates are read from the string literal and located at the literal's line in the `.ts` file; `templateUrl` is resolved against the component file, so a template in another folder is read. The walk reads node `kind`, `name`, `attrs`, `children`, and `startSourceSpan`, which the package's declaration files type; its README still says `type` for the node kind, which 10.13.0 calls `kind`.

Matching: the check's own parser and matcher for Angular's selector syntax, over the manifest. For each element it builds the descriptor Angular matches against (the element name and the attribute names and values that count, section 4), plus one for the implicit template of a `*` attribute. A library directive whose selector matches a descriptor and which neither the scope's library classes nor a host directive of a matching workspace directive brings in is a finding: `NFS9001: <attr> matches <Directive>, which <Component>'s imports do not include; import <Directive> from '<entry point>'.`

Builder: `builder.mjs` has the static prototype's shape (`buildTarget` read through `context.getTargetOptions`, or `tsConfig`), logs each skip as a warning and each finding as an error, and fails on a finding and when no component was checked, the guard the static findings asked for. Run as `shop:nfs-imports` through Architect's Node API: 171 findings, 10 skipped, `success: false`, 541 ms in process. Architect loads the builder with `require()`, and the check has no top-level await.

Not used, by the ticket's rule: `@angular/compiler`, `@angular/compiler-cli`, and any private Angular symbol. The stand-in library is still built with `ngc`, as a real release would be, and the comparison runs the static prototype's compiler check in its own process.

## 2. Results

Reports are one per element and directive; "expected" is what Angular matches, read from each case and confirmed by the compiler check's `getDirectivesOfNode`, except where the runtime differs (the `ngNonBindable` row). The static cases ran once inline and once external, with the same result in both forms; the added pairs did too.

| Case | Expected | Compiler check | Documented check |
| --- | --- | --- | --- |
| Forgotten member, `NfsAccordionTitle` | 2 | 2 | 2 |
| Forgotten family | 7 | 7 | 7 |
| Forgotten single directive | 1 | 1 | 1 |
| Imported correctly by class | 0 | 0 | 0 |
| Imported through `NFS_ACCORDION` | 0 | 0 | skipped: not a class (an array; out of scope) |
| Imported through a consumer array in another file | 0 | 0 | skipped: not a class |
| Imported through a consumer NgModule whose `exports` spreads `NFS_ACCORDION` | 0 | 0 | skipped: a spread |
| Consumer CSS attributes (`nfsHighlight`, `nfs-note`, `data-nfs-callout`, `class="nfs-card"`, `nfsButton` on a `div`) | 0 | 0 | 0 |
| Bound and static input on the missing `NfsCallout` | 2 | 2 | 2 |
| `@defer`, `@if`, `@for`, `ng-template` with `NgTemplateOutlet`, projected content | 5 | 5 | 5 |
| The same with `NfsButton` imported | 0 | 0 | 0 |
| Three components in one file | 1 | 1 | 1 |
| `imports: [buttonImports()]` | 1 | 1 | skipped: a call (out of scope) |
| `UI_IMPORTS` array through a path alias | 1 | 1 | skipped: not a class |
| `DS_IMPORTS` tuple from an installed package | 0 | 0 | skipped: not a class |
| `templateUrl` in another folder | 1 | 1 | 1 |
| Renamed import `NfsButton as Btn` | 0 | 0 | 0 |
| Consumer directive hosting `NfsButton` | 0 | 0 | 0 |
| Component declared in an NgModule | 1 | 1 | skipped: `standalone: false` (out of scope) |
| Added: `[nfsTooltip]`, `bind-nfsTooltip`, static `nfsTooltip`, `nfsTooltip="{{ tip }}"`, `[(nfsToggler)]`, `*nfsShowFor`, `(nfsCallout)`; `[attr.nfsCallout]` and `[class.nfsCallout]` match nothing | 7 | 7 | 7 |
| Added: the same with every directive imported | 0 | 0 | 0 |
| Added: `@switch` with `@case` and `@default`, `ng-container *nfsShowFor` with a button inside, `ng-template [nfsShowFor]` | 5 | 5 | 5 |
| Added: the same with `NfsButton` and `NfsShowFor` imported | 0 | 0 | 0 |
| Added: `NfsButton` through a path alias, `export *`, and a named re-export; `nfsCallout` forgotten | 1 | 1 | 1 |
| Added: `NfsCallout` re-exported as `UiCallout` through the alias | 0 | 0 | 0 |
| Added: namespace import `button.NfsButton`; `nfsCallout` forgotten | 1 | 1 | 1 |
| Added: a workspace NgModule exporting `NfsCallout` and another NgModule that exports `NfsButton`; `nfsAccordion` forgotten | 1 | 1 | 1 |
| Added: host directives through a chain with an object entry, and from an abstract base directive; `nfsButton` on an element the host does not match | 1 | 1 | 1 |
| Added: template syntax; ng-content fallback content matched, ICU cases (inside and outside `i18n`) not | 1 | 1 | 1 |
| Added: the same template, a `<button nfsButton>` inside `ngNonBindable` | 0 | 1, false | 0 |
| 240 generated, mixed styles | 106 | 106 of 106, 240 checked | 106 of 106, 96 checked, 144 skipped |
| 240 generated, classes only | 106 | 106 of 106 | 106 of 106, all 240 checked |
| 1000 generated, mixed styles | 442 | 442 of 442, 1000 checked | 442 of 442, 400 checked, 600 skipped |
| 1000 generated, classes only | 442 | 442 of 442 | 442 of 442, all 1000 checked |

- Element by element on every component the documented check checked: 171 against 172 findings at 240 and 507 against 508 at 1000 (cases included), every documented finding at the compiler check's file, line, and column, the one compiler finding more being the `ngNonBindable` one.
- `ngNonBindable`: the compiler's binder matches directives on the text attributes of non-bindable descendants (`r3_template_transform.ts:1191-1215` builds them as elements), so the compiler check reports the forgotten import, and would go silent once it is imported; the runtime resolves directives only while bindings are enabled (`core/src/render3/view/elements.ts:44`) and disables them for the descendants (`compiler/src/template/pipeline/src/phases/nonbindable.ts:27-31`), so neither state applies the directive. The documented check follows the runtime and does not descend.
- Already reported by the compiler without either check, in the added bound-names case: NG8002 for `[nfsTooltip]`, `bind-nfsTooltip`, `nfsTooltip="{{ tip }}"`, and `[(nfsToggler)]`, and the NG8116 warning (missing structural directive) for `*nfsShowFor` on an element or `ng-container`; not reported: the static `nfsTooltip`, the `(nfsCallout)` event, and `<ng-template [nfsShowFor]>`, which gets no NG8002 because a template's property bindings are not checked against the DOM schema.
- The compiler check names no attribute for `(nfsCallout)`: its attribute lookup reads attributes, inputs, and template attributes but not outputs, so its message would print `undefined`; Angular matches selectors against output names (`render3/view/util.ts`, `getAttrsForDirectiveMatching`), and the documented check names the attribute.
- Differential run (`tools/synthetic-manifest.json`, 36 selectors no class implements, so both checks report every element each one matches; classes-only 240 workspace): 11966 against 11970 matched elements, equal per selector for element names with and without namespaces, `#id`, classes (case-folded), attribute values, `:not()` (two in one selector), selector lists, output names (`click`, `keydown.enter`, `resize` from `window:resize`), two-way `value`/`valueChange`, `animate.enter` as a text attribute and `[animate.leave]` as a binding, and no match on `attr.`, `class.`, `style.` bindings, `i18n` markers, references, `let-`, `ng-content`, or `<style>`. The four differences: three selectors on the `ngNonBindable` button, and `[ngIfElse]`.

## 3. Costs measured

Median wall time of a fresh process (`tools/bench.mjs`, 5 runs each; classes-only workspaces with the cases: 287 and 1047 components):

| Command | 287 components | 1047 components |
| --- | --- | --- |
| `tsc -p` type check (TypeScript alone, for scale) | 660 ms | 1145 ms |
| `ngc -p` type check (the build's analysis, for scale) | 2058 ms | 3915 ms |
| Compiler check (static prototype) | 1559 ms | 2948 ms |
| Documented check | 798 ms | 1092 ms |
| Documented, in process: program / scope, templates, and matching | 425 / 105 ms | 575 / 228 ms |
| Compiler check, in process: analysis / templates and matching | 840 / 284 ms | 1793 / 801 ms |

- The documented check costs 51 and 37 percent of the compiler check and about one `tsc` type check; the program build is most of it, and it asks the type checker only for the symbols of `imports`, `hostDirectives`, `exports`, base classes, and decorators.
- Matching is a linear scan of the manifest per element: 36 selectors instead of 9 added about 120 ms at 1047 components, most of it building 12000 findings. An index by attribute name would remove the scan if the real manifest grows to a hundred directives.
- In the mixed-style workspaces it is faster still (560 and 706 ms in process), because it skips the components that import arrays.

Code and surface:

| | Compiler check (static prototype) | Documented check |
| --- | --- | --- |
| Code | 174 lines (129 without blank and comment lines), a 21-line builder | 543 lines (404): selectors 59, template reading 92, scope 118, imports, program, components, and output 135; a 27-line builder |
| Knows the scope by | the compiler's own analysis: every scope rule, evaluated `imports`, NgModules, `.d.ts` metadata | twelve copied rules (section 4) over syntax the type checker resolves |
| Angular API it depends on | `@angular/compiler-cli` and `@angular/compiler` exports that Angular's public-API policy does not cover | none; it recognizes `@angular/core` decorators by name and declaring package |
| What the consumer installs | nothing new | `angular-html-parser` (not in an Angular workspace: Prettier bundles its own copy) |
| Upstream it tracks | compiler internals, which may change in any minor | Angular's template syntax and matching rules, through the parser's releases and the copied rules; TypeScript's JavaScript API |
| Scope it covers | everything Angular accepts | identifiers resolving to classes, NgModule `exports` literals, host directives in workspace source |

## 4. Angular rules the check reimplements

Every place the check copies an Angular rule rather than asking Angular. Sources are in angular/angular at `5db6fc4` (22.2.0); paths under `packages/compiler/src` unless marked `compiler-cli` (`packages/compiler-cli/src/ngtsc`) or `core` (`packages/core/src`).

| # | Rule | What the check does | Where Angular defines it | Exercised by |
| --- | --- | --- | --- | --- |
| 1 | Selector grammar | element, `.class`, `#id` as `[id=...]`, `[attr]` and `[attr=value]` with optional quotes, several non-nested `:not()`, a bare `:not()` taking element `*`, comma lists; attribute values and class names lower-cased, `\` escapes removed | `directive_matching.ts:9-21` (`_SELECTOR_REGEXP`), `:58-121` (`CssSelector.parse`), `:193-199` (`addAttribute`, `addClassName`) | every case; synthetic `#main`, `.menu`, `form.grid-x`, `[name]:not([type=email])`, `:not(div):not(span)` |
| 2 | Selector matching | element equal or `*`; every class present; every attribute present and, when the selector gives a value, equal after lower-casing; no `:not()` part matching; a selector list matching once | `directive_matching.ts:340-420` (`match`, `_matchTerminal` with `*`), `:460-478` (`SelectorContext.finalize`) | every case; synthetic run |
| 3 | What an element offers the matcher | element name without its namespace prefix (`:svg:use` is `use`), attribute names without theirs (`:xlink:href` is `href`), the `class` value split into classes; a `*` template matched as `ng-template` with only its template attributes; an explicit `<ng-template>` with its own attributes, inputs, and outputs | `render3/view/util.ts:170-230` (`createCssSelectorFromNode`, `getAttrsForDirectiveMatching`), `ml_parser/tags.ts:27` (`splitNsName`) | switch-container, syntax; synthetic `use[href]`, `svg`, `ng-template` |
| 4 | Which attribute forms count | text attributes with their values; `[x]`, `bind-x`, and an interpolated `x="{{...}}"` as `x` with no value; `[(x)]` and `bindon-x` as `x` and `xChange`; `(x)` and `on-x` as `x`, after a `target:` prefix; not `let-`, `ref-`, `#`, `@x`, `i18n`, `i18n-*`, not `attr.`, `class.`, `style.`, `animate.` bindings, not `animate-` or `@` legacy animations | `render3/r3_template_transform.ts:40` (`BIND_NAME_REGEXP`), `:57` (`BINDING_DELIMS`), `:643-730` (`prepareAttributes`), `:734-930` (`parseAttribute`, interpolation at `:927`); `template_parser/binding_parser.ts:43-48`, `:365-380`, `:544-630` (`createBoundElementProperty`: only `Property` and `TwoWay` match), `:699` (`splitAtColon`); `render3/view/i18n/util.ts:20` (`isI18nAttribute`) | bound-names; synthetic `[click]`, `[resize]`, `[value]`, `[valueChange]`, `[animate.enter]`, `[aria-label]`, `[i18n]` |
| 5 | Structural `*x` | the element is wrapped in a template carrying attribute `x`; the secondary keys (`xOf`, `xElse`) are not derived, since that needs Angular's expression parser | `expression_parser/parser.ts:1407-1440` (`parseTemplateBindings`: a keyword becomes `templateKey` plus the capitalized keyword), `template_parser/binding_parser.ts:198-260` (`parseInlineTemplateBinding`) | bound-names, switch-container; synthetic `[ngIf]` equal, `[ngIfElse]` the divergence |
| 6 | Where directives are matched | every element in every block's children (`@if`, `@else`, `@for`, `@empty`, `@switch`, `@case`, `@default`, `@defer` and its sub-blocks, `@boundary`, `@content`) and in ng-content's fallback content; not ng-content itself, `<script>`, `<style>`, `<link rel="stylesheet">`, ICU cases, or `ngNonBindable` descendants | `render3/view/t2_binder.ts:626-760` (`DirectiveBinder` visits), `:991` (`visitIcu` matches nothing); `render3/r3_template_transform.ts:149-200` (preparse, `t.Content`), `:307-312` (ICU dropped outside `i18n`); `template_parser/template_preparser.ts:16-60`; `core` `render3/view/elements.ts:44` with `template/pipeline/src/phases/nonbindable.ts:27-31` (no directive while bindings are disabled) | contexts, switch-container, syntax |
| 7 | Standalone scope | the component itself, then each `imports` and `deferredImports` entry: a directive or component as itself, an NgModule as its exported scope; standalone is the default from Angular 19 | `compiler-cli` `scope/src/standalone.ts:30-150`, `compiler-cli` `core/src/compiler.ts:482-484` (`implicitStandaloneValue`), `compiler-cli` `annotations/directive/src/shared.ts:380-388` | every case |
| 8 | NgModule exported scope | `exports`, an exported NgModule bringing its own exported scope, transitively | `compiler-cli` `scope/src/local.ts:456-500` | module-classes |
| 9 | Host directives | a matched directive brings its host directives, transitively, including those of decorated base classes, on the elements its own selector matches | `compiler-cli` `scope/src/typecheck.ts:208-252` (`getSelectorMatcher`, `combineWithHostDirectives`), `metadata/src/host_directives_resolver.ts:25-70`, `metadata/src/inheritance.ts:79-81` | hard-host-directive, host-chain |
| 10 | Which classes are Angular's | a `@Component`, `@Directive`, `@NgModule`, or `@Pipe` decorator from `@angular/core`, through aliases | `compiler-cli` `annotations/common/src/util.ts:107-160` (`isAngularCore`, `isAngularDecorator`) | every case |
| 11 | Where the template is | an inline `template` string, or `templateUrl` resolved against the component file | `compiler-cli` `annotations/component/src/resources.ts:403`, `:466` (`resourceLoader.resolve(templateUrl, containingFile)`) | hard-far-template, every external case |
| 12 | How the template parses | not copied: `angular-html-parser` is a fork of Angular's `ml_parser`, called with blocks, `@let`, and expansion forms on, as Angular parses; the check relies on its lexer tracking Angular's | `ml_parser/lexer.ts:144-158` (`SUPPORTED_BLOCKS`, equal to the parser's) | every case; synthetic run |

Not copied, and out of scope or unneeded: evaluating expressions in `imports` (calls, spreads, arrays, `as const`, `forwardRef`), NgModule declaration scope, `.d.ts` metadata (the compiled directive and NgModule declaration types, whose barred-o prefix Angular's policy marks private, hence no third-party host directives and no packaged NgModule exports), selectorless scope (`compiler-cli` `scope/src/standalone.ts:39` gives such a component no standalone scope), schemas, and host directive input and output mappings.

## 5. How it would ship

As the static prototype proposed for the compiler check, in the Variant tooling's collection ([Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md), `specs/variant-declaration-tooling.md`):

- The library build writes the selector manifest from its own sources, beside the Variant manifest, read from the install location and never exported. The manifest generator also rejects a structural directive whose selector names a secondary microsyntax key (rule 5), so the check never needs Angular's expression parser for the library's own selectors.
- The package's `builders.json` gains `missing-imports` beside `variant-types`, a plain Architect builder with `buildTarget` (default `<project>:build`) and `tsConfig`, a draft-07 schema, run by the Angular CLI and by Nx as an Angular-compatible builder, as the Variant builder was measured to run in [Prototype: Variant declaration tooling in real Nx and Angular CLI workspaces](../issues/137-prototype-variant-declaration-tooling.md). It loads `typescript` and `angular-html-parser` only when it runs, and ends with the Variant spec's missing-package message (M9) when the parser is not installed.
- The setup generator: opt-in, as its own generator in the same collection (`ngx-foundation-sites:missing-imports`, the Nx generator exposed to the Angular CLI through `convertNxGenerator`), reusing the Variant setup's target writing. Per application project it would add:
  - the target `"nfs-imports": { "executor": "ngx-foundation-sites:missing-imports", "options": { "buildTarget": "<project>:build" } }` (`builder` in `angular.json`), and a `spec` configuration with `"tsConfig": "tsconfig.spec.json"` for components declared in tests;
  - under Nx, `"cache": true` and `"inputs": ["default", "^default", { "externalDependencies": ["ngx-foundation-sites", "typescript", "angular-html-parser"] }]` on that target in `project.json`, not in `targetDefaults` (the Variant spec's reason: an executor-keyed default hides the name-keyed ones);
  - `angular-html-parser` in the workspace's `devDependencies`, at the range the library release was tested with;
  - nothing else: no sync generator (it writes no file), no tsconfig edit, no CI file; it prints the CI step, `npx nx run-many -t nfs-imports` or `npx ng run <project>:nfs-imports`.
- The library's own CI keeps the compiler check as a test oracle, never shipped: on every Angular minor it runs both checks over this prototype's cases, the classes-only workspace, and the synthetic manifest, and fails on any difference other than the known `ngNonBindable` one. That run is what catches a changed Angular rule the documented check still copies.

## 6. Failure modes

- Skipped forms are unchecked, and the notice is the only signal: a consumer who keeps `const SHARED_IMPORTS = [...]` (the static generator's `shared` style, one component in three) gets no check in those components. Following a plain `const` array literal to its classes would be a few lines more; the user's ruling excludes `as const` arrays and function calls, and the orchestrator's default skips every array, so whether plain consumer arrays should be followed is open.
- Rules that drift: a new binding form, block, or matching rule in an Angular release is copied by hand (section 4), and until then the check can match differently in silence. A parser that lags a new template syntax fails to parse (a skip with a notice) or parses it differently (silent). The library CI's oracle run is the guard.
- `angular-html-parser` is a third-party package on Prettier's release schedule (five releases from June to September 2026); a broken or late release blocks the check until the pinned range moves.
- TypeScript: the check uses TypeScript 6.0's JavaScript API. TypeScript's announced native port (TypeScript 7) exposes a different programmatic API; Angular's compiler faces the same move, and the check could keep its own TypeScript 6 until then.
- Secondary microsyntax keys (`xOf`, `xElse`) are not derived (rule 5); harmless for the library's selectors once the manifest generator rejects them.
- Coverage is the compiler check's: one TypeScript program per target, no Storybook `render()` templates, `TestBed.overrideTemplate`, or JIT strings, no editor feedback.
- A consumer attribute equal to a library selector's attribute on an element the selector admits is reported with no way to silence it; an ignore option is for the spec.
- Inline templates are located by the cooked string, so an escaped newline (`\n`) in a string-literal template would shift the reported line.

## 7. Recommendation and its limits

Recommendation: ship this check as the static check of ADR 0046, as the opt-in `ngx-foundation-sites:missing-imports` builder and `nfs-imports` target in the Variant tooling's collection, with its own setup generator adding the target and `angular-html-parser`, and with the compiler check kept in the library's CI as the oracle that tells when a copied rule has drifted. On the scope the user set it is exact against the compiler, costs half or less of the compiler check's run time and no Angular API outside the public-API policy's cover, and its one departure from the compiler check (`ngNonBindable`) follows the runtime, not the compiler's binder.

Limits:

- It is exact only where it checks: the notice is all a consumer gets for the forms the ruling leaves out, and in a workspace with shared import arrays that is most components.
- About 400 lines copy twelve Angular rules; the oracle run in the library's CI is required, not optional, to keep them honest across Angular minors.
- It adds a dependency the consumer installs, where the compiler check needed none.
- Open for the spec: whether to follow plain consumer `const` arrays; an ignore option for a consumer attribute; the manifest's rule against secondary microsyntax keys in library selectors; an attribute index if the manifest grows past a few dozen directives.
