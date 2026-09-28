# Detecting a forgotten attribute directive import: the runtime check

Evidence for [Prototype: detecting a forgotten attribute directive import](../issues/145-prototype-missing-directive-import-checks.md), the runtime half; the static half is `research/missing-directive-import-static.md` and the peer checks (Angular Aria style and required parent injection) are `research/missing-directive-import-peer.md`. This file decides nothing: P24 of [Decide: the directive and component architecture guide](../issues/141-decide-directive-component-architecture-guide.md) is OPEN FOR HUMAN.

## Header

- Question: can a development-only check find, in the rendered page, an element that carries a library directive's attribute with no instance of that directive on it, from a selector manifest the library generates, reliably, at what cost, and how would it ship under [ADR 0040](../adr/0040-variant-input-types.md)'s Runtime checks?
- Date: 2026-09-28. Built and measured AFK by one agent.
- Versions: `@angular/core`, `@angular/build`, `@angular/ssr` 22.2.0; TypeScript 6.0.3; `@playwright/test` 1.63.0 (Chromium for the matrix; Chromium, Firefox, and WebKit for the attribute-case test); Node 24.18.0 on Windows 11 arm64 (Snapdragon X Elite). Angular source cited from the local clone at `5db6fc4` (22.2.0); `@angular/build` cited from its installed 22.2.0 package.
- Prototype: [prototypes/missing-directive-imports/runtime/](../prototypes/missing-directive-imports/runtime/README.md); experiment directory `D:/tmp/nfs-145-runtime/` (not committed). One Angular CLI application with SSR (`outputMode: server`, `RenderMode.Server`, `withIncrementalHydration()`), served by `ng serve` on port 5470, stopped after each run.
- Stand-in library (`src/nfs/`, application source): `NfsButton` (`button[nfsButton], a[nfsButton]`, class `button`, a static `size` input and a bound `expanded` input), the Accordion family of four (`[nfsAccordion]`, `[nfsAccordionItem]`, `button[nfsAccordionTitle]`, `[nfsAccordionContent]`, optional parent injection so nothing throws), `NfsSmoothScroll` (`a[nfsSmoothScroll]`, a behaviour directive that binds no class), and two classes both named `NfsColumn` (`[nfsColumn]`), as the real Flex Grid and Float Grid have.
- Manifest: 174 entries, one per attribute of a directive selector, each with directive, entry point, selector, attribute, and the Structural class the directive always binds (or none). 8 come from the stand-ins (`tools/generate-manifest.mjs` reads their decorators and parses selectors with `@angular/compiler`'s `CssSelector`), 166 are synthetic entries for every other `[nfs*]` attribute the effort's specs name (`tools/spec-attributes.txt`), so the manifest has the full library's size.
- Scope: code inside the forgotten directive is not an option (it never runs); the peer checks are the third prototype's. Every approach here runs from library code that does run, or from the application configuration.

## Headline

- A scan of the rendered DOM after every render finds every forgotten import the ticket names: a family member, a whole family, and a single directive, in inline and external templates, inside `@defer`, `@if`, `@for`, an outlet template, and projected content, and a directive attribute on an element its selector does not accept. It reports each when that markup first renders, and nothing when every import is there.
- The approach that decides "is the directive here" matters most. A Structural-class probe (the directive always binds its class, so its absence proves the directive is absent) needs no code in any directive and no debug API, and it even reads server HTML that has not hydrated; it misses class-less directives and a Foundation class the consumer copied by hand. Angular's development global `ng.getDirectives` covers both, but only compared on the compiled selector (a private static field): compared on class names it reports every directive, because the development build names each class `_NfsButton`. A registry every directive fills reports imported directives in server HTML that has not hydrated. The hybrid (class probe first, `ng.getDirectives` otherwise) had no false report in any case.
- It has two hard limits: markup that never renders during development is never checked, and nothing runs in an application whose templates instantiate no library directive, unless the application calls the provider function.
- Cost: about 43 kB raw (6.5 to 6.7 kB gzip) in the development bundle, 34 kB of it the manifest in its readable form; nothing in the production bundle (within 50 bytes of the build without the check, none of five strings only the check contains), but only once no statement at module level calls anything: an `@Injectable` scan service, and then an annotated top-level `new InjectionToken(...)`, each kept the whole 30 kB checker in production.
- Scan time on 2,001 library elements: 4 to 6 ms cold for the class probe and the registry, 11 to 15 ms for `ng.getDirectives` and the hybrid; afterwards 0.0 to 0.1 ms per render when a MutationObserver limits the scan to added subtrees, against 1.5 to 2.1 ms per render for a whole-document scan (6 to 10 ms at 8,001 elements).

## 1. The approaches built

All share one scanner (`src/nfs/import-check/scanner.ts`): it registers `afterEveryRender` with a `read` phase once per application, collects the elements matching one selector list of every manifest attribute (`[nfsbutton],[nfsaccordion],...`), and for each manifest attribute on an element asks the approach for `present`, `missing`, or `unknown` (look again on a later scan). It reports once per realm per subject (directive, owning component, wrong element or not) through `console.warn`, prefixed `ngx-foundation-sites [strictDirectiveImports]`, naming the owning component from `ng.getOwningComponent` when Angular knows the element; a later element with the same subject (a second `@for` row) is recorded, not warned again. A `wrongElement` report ("matches no selector of NfsButton ('button[nfsButton], a[nfsButton]')") is made when the element fails `el.matches(selector)` for every entry of the attribute.

- (A) `registry`: every library directive calls `nfsDevDirective('NfsButton')` from its constructor behind `typeof ngDevMode === 'undefined' || ngDevMode`; the call records the host in a WeakMap of directive names and starts the scan. Present when the element's set holds the directive.
- (B1) `debug-name`: `ng.getDirectives(el)`, present when an instance's `constructor.name` equals the manifest's directive name. Public debug API only.
- (B2) `debug`: `ng.getDirectives(el)`, present when an instance's compiled selector list (the class's private static directive definition field, `selectors`) names the attribute, lowercased. `unknown` while `ng.getOwningComponent(el)` is `null`, which is the case for server HTML Angular has not claimed yet: an element is found only through a patched ancestor's view (`packages/core/src/render3/context_discovery.ts:100-127`; elements are patched only at depth 0 of a view or as directive hosts, `instructions/shared.ts:604-606`), so a dehydrated element resolves to no context.
- (C) `class`: `missing` when the element lacks the Structural class the manifest names for the directive; `unknown` for a directive with none (Smooth Scroll).
- (D) `hybrid`: C when the class is absent; otherwise B2; a B2 `unknown` on a directive with a Structural class counts as present (the class came from a directive, on the server or here).

The scan starts from the first library directive (`nfsDevDirective`, the path with no configuration) or, with `?start=provider`, from `provideNfsRuntimeChecks({...})` in the application configuration, which adds an environment initializer. Where it hooks in:

- Environment initializer: only as the starter. It runs before any render and also on the server, so it only registers the render hook.
- `afterNextRender` alone: not enough. The `@if` branch, the added `@for` rows, the `@defer` blocks, and the blocks that hydrate on interaction were all reported by the third to sixth scan of their page, not the first.
- `afterEveryRender` (built): Angular makes it a no-op on the server (`render3/after_render/hooks.ts:227`), so it is browser-only by construction.
- MutationObserver (built, default): after one whole-document scan, each later scan looks only at subtrees added since the last one, plus the elements still `unknown` (hydration claims server DOM without adding nodes). The scan must call `observer.takeRecords()`: the render that triggers it queued its records as a microtask that has not run yet, and without it the `@if` branch and the third `@for` row were missed until the next render (measured, then fixed). `?hook=every` keeps the whole-document scan; both modes gave identical verdicts on all 115 rows (`tools/compare-hooks.mjs`).
- ApplicationRef stability: not built; it gives no DOM signal of its own and would need the same re-scan logic.

Probed, not built (E): the compiled component definition of each rendered component (private static field `cmp`: `consts` holds every element's static attributes, `directiveDefs` what the component imports; `render3/definition.ts:350-379`). On `/if` its consts named `nfsButton` from the unrendered `@if` branch and its `directiveDefs` lacked `NfsButton`, so it could report markup that has not rendered. On `/defer` it cannot tell `DeferOk` (imports `NfsButton` for its `@defer` block) from `DeferMissing` (imports nothing): both have `nfsButton` in consts and empty `directiveDefs`, because a deferred dependency is not in `directiveDefs`. It also cannot see the element part of a selector. Not pursued; the static check covers unrendered markup without private fields.

## 2. Results

Chromium, `ng serve --no-hmr` with SSR; every page loaded in full (server render, then hydration) unless marked. Counts are distinct elements reported. "False" marks a report on an element whose directive is there. Summary: `prototypes/missing-directive-imports/runtime/results/matrix.txt`.

| Case | Expected | A registry | B1 debug-name | B2 debug | C class | D hybrid |
| --- | --- | --- | --- | --- | --- | --- |
| Every directive imported (`/ok`, 6 library elements) | 0 | 0 | 6 false | 0 | 0 | 0 |
| Forgotten member: `NfsAccordionTitle` (inline) | 1 | 1 | 1 + 3 false | 1 | 1 | 1 |
| Forgotten member, external `templateUrl` | 1 | 1 | 1 + 3 false | 1 | 1 | 1 |
| Forgotten family: 4 accordion elements, plus a class-less `NfsSmoothScroll` written without its import; `NfsButton` imported | 5 | 5 | 5 + 1 false | 5 | 4 (misses Smooth Scroll) | 5 |
| Forgotten single directive: `<button nfsButton size="small">` (the static input compiles silently) | 1 | 1 | 1 + 1 false | 1 | 1 | 1 |
| No library directive instantiated: `nfsButton` and `nfsSmoothScroll` forgotten, nothing else | 2 | 0 (not started) | 0 (not started) | 0 (not started) | 0 (not started) | 0 (not started) |
| The same, scan started by `provideNfsRuntimeChecks({})` | 2 | 2 (before hydration, no owner) | 2 | 2 | 1 (misses Smooth Scroll) | 2 |
| Forgotten `NfsButton` with Foundation's class copied by hand, `class="button"` | 1 | 1 | 1 + 1 false | 1 | 0 | 1 |
| Consumer CSS attribute `nfsHighlight`, a typo `nfsButon` | 0 | 0 | 0 | 0 | 0 | 0 |
| The same with the prefix option `strictUnknownAttributes` | 1 (the typo) | 1 + 1 false | 1 + 1 false | 1 + 1 false | 1 + 1 false | 1 + 1 false |
| `<div nfsButton>` with `NfsButton` imported (wrong element) | 1 | 1 | 1 + 1 false (the imported button beside it) | 1 | 1 | 1 |
| Bound input on the forgotten `NfsButton`, `[expanded]="true"` | compile error | NG8002 from `ngc` (the static `size` beside it compiles); no runtime check runs | same | same | same | same |
| `@defer (on timer)`: `NfsButton` imported only for the block (a lazy dependency); a second block without the import | 1, after load | 1 | 1 + 2 false | 1 | 1 | 1 |
| `@if`, false until a click | 0, then 1 | 0, then 1 | 1 false, then 1 + 1 false | 0, then 1 | 0, then 1 | 0, then 1 |
| `@for`, 1 row, then 3 | 1, then 3 | 1, then 3 (one warning) | + 1 false | 1, then 3 (one warning) | 1, then 3 | 1, then 3 |
| `ng-template` declared without the import, rendered by `NgTemplateOutlet` in a host that imports it; and the reverse | 1 | 1 | 1 + 2 false | 1 | 1 | 1 |
| Content projected into a component that imports `NfsButton`, declared by one that does not; and the reverse | 1 | 1 | 1 + 2 false | 1 | 1 | 1 |
| Incremental hydration before interaction: imported (`hydrate on interaction`), forgotten (`hydrate on interaction`), forgotten (`hydrate never`) | 2 | 3 (1 false) | 1 false | 0 (waits) | 2 | 2 |
| The same after clicking both interactive blocks | 2 | 3 (1 false) | 2 false + 1 | 1 (`hydrate never` never checked) | 2 | 2 |
| The same page reached by client-side navigation (blocks behave as `@defer on idle`) | 2 | 2 | 2 + 8 false | 2 | 2 | 2 |
| Member case reached by client-side navigation | 1 | 1 | 1 + 9 false | 1 | 1 | 1 |
| Two library classes named `NfsColumn` in one chunk, both imported | 0 | 0 | 2 false | 0 | 0 | 0 |
| Provider start on a lazy route (`/css-attr`): the imported `NfsButton` | 0 | 1 false | 1 false | 0 | 0 | 0 |
| Opted out, `provideNfsRuntimeChecks({strictDirectiveImports: false})` | 0 | 0 | 0 | 0 | 0 | 0 |

Further measurements:

- HTML lowercases attribute names: the DOM holds `nfsaccordiontitle`; `querySelector('button[nfsAccordionTitle]')` matches and `hasAttribute('nfsAccordionTitle')` is true, in Chromium, Firefox, and WebKit; the scan reports the member case in all three.
- `ng.getOwningComponent` names the component that declares projected content (`ProjectionMissing`), but for an outlet template it names the host that renders it (`OutletHostImporting`, not `OutletDeclarerMissing`): it walks embedded views up their insertion parents (`render3/util/discovery_utils.ts:105-115`). A report from server HTML before hydration (C, D) has no owner at all.
- Why B1 fails: the development build prints `var NfsButton = class _NfsButton {...}`, so `constructor.name` is `_NfsButton`; the two `NfsColumn` classes became `NfsColumn` and `NfsColumn2`, both named `_NfsColumn`. The owner names in messages needed the same `_` stripped.
- Why A fails before hydration: server HTML of a block that has not hydrated, or of a lazy route whose chunk has not loaded when the scan starts from the environment initializer, holds the attribute and no directive instance; the registry cannot tell that apart from a forgotten import.
- Why C and D read unhydrated HTML correctly: the server rendered the same component with the same imports, so its HTML carries the class exactly when the directive was there (`<button nfsbutton="" class="button" ngb="d0">` against `<button nfsbutton="" ngb="d1">`). C and D report the forgotten `hydrate never` block that B2 never sees.
- `ng serve` defaults to HMR, which loads every `@defer` dependency eagerly (NG0751). A first full run under HMR gave the same verdicts (86 of 88 rows identical, the other 2 differ only in report order).
- The dev server forwards browser console messages to its terminal: every report appeared in the `ng serve` output marked `(client)` (492 lines over the runs); none came from the server render.

## 3. Costs measured

Browser JavaScript of the whole application (all chunks), built once per approach with `fileReplacements`, against the same application whose library has no import check (`tools/measure-bundles.mjs`, `results/bundles.json`):

| Build | A registry | B2 debug | C class | D hybrid |
| --- | --- | --- | --- | --- |
| Development, raw | +42,516 B | +42,763 B | +42,325 B | +43,290 B |
| Development, gzip | +6,521 B | +6,616 B | +6,508 B | +6,693 B |
| Production, raw | -6 B | -6 B | +30 B | -6 B |
| Production, gzip | +38 B | +50 B | +39 B | +37 B |
| Production, check strings found | 0 of 5 | 0 of 5 | 0 of 5 | 0 of 5 |

- Of the development cost, the manifest is 34.4 kB raw (3.8 kB gzip): 174 objects as esbuild prints them unminified. Tuples, with the entry point and Structural class derived from the attribute name where the naming rule holds, would shrink it several times; not measured. The scanner is 6.8 kB, the approaches 1.3 kB, the directive-side call a few bytes per directive.
- The production differences are chunk-name and hashing noise; the five strings searched are the report text, the stats global, a manifest-only attribute (`nfsTopBarTitle`), the scan token's name, and `takeRecords`.
- Production before the fix: with the scan service declared `@Injectable({providedIn: 'root'})`, +30,167 B raw and every string present: the compiled class kept its static provider field, which the build treated as a side effect. With a plain class behind `/* @__PURE__ */ new InjectionToken(...)` at module level, +30,137 B: the token stayed as a bare expression statement without its binding, even though a stand-alone esbuild run drops the same shape (Angular 22.2 now merges chunks with Rolldown by default, `@angular/build` `utils/environment-options.js:96`; which step kept it was not isolated). With both tokens created inside functions on first use, nothing remains. The Breakpoint service spec's mechanism (a root token whose factory returns the checker behind `ngDevMode`, else `null`) has the same effect, because its factory folds to `() => null`.
- Scan time in development (Chromium, dev server, `/stress`: `n` accordion items of 3 library elements, `n` buttons, `n` plain paragraphs; 2,001 library elements at `n=500`, 8,001 at `n=2000`), last run:

| Approach | Cold scan, 2,001 | Cold scan, 8,001 | Per render after, whole document (2,001 / 8,001) | Per render after, MutationObserver |
| --- | --- | --- | --- | --- |
| A registry | 4.2-4.5 ms | 17.0-19.3 ms | 1.8 / 6.7 ms | 0.0 ms |
| B2 debug | 11.4-13.2 ms | 29.4-33.2 ms | 1.8 / 8.3 ms | 0.0-0.1 ms |
| C class | 4.8-5.5 ms | 20.8-22.2 ms | 2.1 / 6.1 ms | 0.0 ms |
| D hybrid | 12.1-15.2 ms | 32.5-33.7 ms | 2.1 / 6.1 ms | 0.0 ms |

  Ten further renders cost 21 to 89 ms in total with the whole-document scan and 0.4 to 1.2 ms with the MutationObserver. An earlier run agreed within about 25 percent.

## 4. How it would ship

- A fourth Runtime check, `strictDirectiveImports`, in `NfsRuntimeChecks` of `ngx-foundation-sites/media-query` beside `strictVariantNames`, `strictVariantProperties`, and `strictBreakpointSync` ([Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md)): on in development with no provider, `provideNfsRuntimeChecks({strictDirectiveImports: false})` opts out. Development only: B2 and D need Angular's development global, which Angular publishes only when `ngDevMode` is on (`application/application_ref.ts:66-67`), so `provideNfsProductionRuntimeChecks` would not accept it. (C alone could run in production, at the manifest's cost in every bundle, to catch pages nobody opened in development; not recommended.)
- Library build: a step after ng-packagr writes the manifest from the compiled partial declarations (each directive's `selector` and its host `classAttribute`), so it cannot drift from the directives; the typings check of [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md) is the same kind of post-build step. The manifest is a module reachable only from the development scanner.
- Who starts it: the scanner hangs off the Runtime checker token. Every directive with a Variant input already injects it through `nfsVariantCheck`; every other library directive adds one development-only call. `provideNfsRuntimeChecks(...)` also starts it from an environment initializer, which is the only way to cover an application that instantiates no library directive at all. The consumer configures nothing; to cover that last case the consumer calls `provideNfsRuntimeChecks({})`, which the setup generator could write into the application configuration (not built).
- Where it runs: in the browser only, after the first render and after every later one; under the dev server's SSR the server render runs nothing, and the browser reports reach the `ng serve` terminal. Consumer unit tests: not measured; the Runtime checks' once-per-realm rule and the opt-out apply.
- Message: names the element's tag and attribute, the directive, its entry point, and the owning component when known, and says "the component whose template declares this element", because the owner Angular reports is wrong for an outlet template.

## 5. Failure modes

- Unrendered markup is never checked: a false `@if` branch, a `@defer` block whose trigger never fires, a route nobody opens, a `hydrate never` block (for B2). Only the static check sees these.
- No library directive instantiated and no provider call: nothing runs, silently.
- A directive on `<ng-template>` or `<ng-container>`, or used with `*`, leaves no element with the attribute in the DOM, so no scan sees it.
- SVG: `setAttribute` keeps the name's case on SVG elements, so a lowercased lookup would miss `nfsFoo` there. Not measured; no stand-in sits on SVG.
- A consumer attribute that equals a manifest name, used for CSS without the directive, is reported (it is indistinguishable from a forgotten import). An attribute that merely starts with `nfs` is not, unless the prefix option is on, which then also reports the consumer's hooks (`nfsHighlight`).
- A: false reports on server HTML that has not hydrated; code in every directive.
- B1: false reports on every directive in the development build (class names `_Name`).
- B2: depends on a private static field's shape (`selectors`, Angular's compiled selector list) and on `ng` being published; checks nothing Angular has not claimed.
- C: blind to class-less directives and to a copied Foundation class, whose own P23 warning runs only inside the directive that is missing.
- D: inherits B2's private-field dependency for the class-less directives and the copied-class case; without `ng` it degrades to C.
- Owner names: wrong for an outlet template, absent for reports from unhydrated HTML.
- Production leak: any module-level call in the check's modules kept the whole checker in the production bundle; the library's production-bundle e2e test (the Breakpoint service spec's) should assert the report text is absent.
- Cost grows with the page: 30 to 40 ms for a first scan of 8,001 library elements with B2 or D, in development only.

## 6. Recommendation and its limits

- If the library ships a runtime check, ship D: the Structural-class probe first and `ng.getDirectives` on the compiled selector otherwise, scanned in `afterEveryRender` over the subtrees a MutationObserver saw added (with `takeRecords()`), started from the Runtime checker token and from `provideNfsRuntimeChecks`, development only, with the manifest generated from the compiled declarations. It was the only approach with no false report and no miss among rendered markup, including unhydrated server HTML and the copied-class case, and it adds no public API beyond one flag in `NfsRuntimeChecks`.
- Its limits: it is a safety net for markup that renders during development, not a proof. It says nothing about templates nobody renders, nothing in an application that neither instantiates a library directive nor calls the provider, and it depends on Angular's development global and one private static field. It reports after the mistake is on screen, where the static check reports at build time with the component and file.
- Next to the other options: it needs no consumer configuration in the common case and catches a forgotten member whether or not the consumer uses an import array; an import array prevents the member case at authoring time but not the forgotten family or single directive, which this check and the static check both report. Choosing among them is the orchestrator's Answer and the user's call under P24.
