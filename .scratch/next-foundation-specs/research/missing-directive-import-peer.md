# Detecting a forgotten attribute directive import: in-family checks

Evidence for [Prototype: detecting a forgotten attribute directive import](../issues/145-prototype-missing-directive-import-checks.md), the in-family third; the other two are `research/missing-directive-import-runtime.md` and `research/missing-directive-import-static.md`. This file decides nothing: P24 of [Decide: the directive and component architecture guide](../issues/141-decide-directive-component-architecture-guide.md) is OPEN FOR HUMAN.

## Header

- Question: can the parts of a directive family detect a forgotten import of one of their peers, as Angular Aria's parts check their peers in development and as ng-primitives' children require their parent, reliably, at what cost, and how would it ship? What can neither see, and which of the effort's families may require their parent?
- Date: 2026-09-28. Built and measured AFK by one agent.
- Versions: Angular 22.2.0 (`@angular/core`, `@angular/build`, `@angular/ssr`, `@angular/compiler-cli`), TypeScript 6.0.3, Playwright 1.63.0 with its Chromium, esbuild 0.28 (the one `@angular/build` installs), Node 24.18.0 on Windows 11 arm64. Angular Aria read from the local `angular/components` clone at `ec0f0df` (22.2.x); Angular core from the local clone at `5db6fc4`; ng-primitives read through `gh api` at `37129191c9a04a18cd64058fb80107697d19f358`.
- Prototype: [prototypes/missing-directive-imports/peer/](../prototypes/missing-directive-imports/peer/README.md); experiment directory `D:/tmp/nfs-145-peer/` (not committed). Ports 5490-5497, all stopped.
- Stand-ins (same kinds as the other two prototypes): the Accordion family of four (`[nfsAccordion]`, `[nfsAccordionItem]`, `button[nfsAccordionTitle]`, `[nfsAccordionContent]`), a Dropdown menu family of four (`ul[nfsDropdownMenu]`, `li[nfsMenuItem]`, `ul[nfsSubmenu]`, `button[nfsSubmenuToggle]`, with the Nested menu spec's injections), and `NfsButton` (`button[nfsButton], a[nfsButton]`, a `color` input), each in two variants of one source tree, swapped by `fileReplacements`.
- Runs: 22 cases, each server-rendered and hydrated and again client-only (`RenderMode.Client`), against four SSR builds (each variant in development and production): 176 page loads in Chromium, with a click where a case needs one; plus the dev server (`ng serve`) for four cases and `ngc` for the bound-input cases.

## Headline

- The Aria style, extended with one DOM probe, reports every forgotten member of a family, names the directive and the component whose `imports` need it, and does so inside `@defer`, `@if`, `@for`, a template outlet, projected content, and external templates, with no false positive on the correct pages, the consumer's own `nfs` attributes, or server-rendered `@defer` content that has not hydrated yet (58 reports over the 44 development loads of the 22 cases, each one expected). Angular Aria's own checks report only that a peer did not register ("must have an ngAccordionTrigger"); they cannot tell a forgotten import from missing markup and never name an import.
- The ng-primitives style reports a forgotten parent or middle part only, as NG0201, and never a forgotten leaf (a title, a toggle). In development its message names only the token, so the token's description is the only place to name the import; in production it is a bare `NG0201`. The throw breaks the page in both modes: the server answered HTTP 404 when the router created the page, or logged the error and sent an empty block, and the browser rendered the page or block empty. It also throws, with the same message, for content that is imported but projected or rendered from another template.
- Neither sees a forgotten whole family or a forgotten single directive such as `NfsButton`: no code of the family runs. Those need the runtime manifest check or the static check.
- Cost: the Aria-style checks for eight directives are 2332 B minified (848 B gzip) in development and 0 B in production (the helper module is absent from the production metafile and no message string is left), but only with the guard written inline at every call site; a hoisted `const dev = ...` kept 4336 B of check code in the production bundle. With 500 accordion items the checks run after every render in development for about 1 ms more per render (median 6.4 against 5.4 ms). The ng-primitives style costs nothing but 127 B of development-only token descriptions.

## 1. What Angular Aria and ng-primitives do

- Angular Aria: the panel checks, in a development-mode `afterRenderEffect({read})` guarded by `typeof ngDevMode === 'undefined' || ngDevMode`, that its `contentChild(AccordionContent)` exists and that a trigger has set its `_pattern`, and reports through `reportViolations`, which is two `console.warn` calls (`NC/src/aria/accordion/accordion-panel.ts:91-107`, `NC/src/aria/private/utils/violations.ts:10-17`). The trigger injects `ACCORDION_GROUP` without `optional` (`accordion-trigger.ts:70`), so a forgotten group throws NG0201, and its own check covers only placement and double control (`:99-119`); the group validates expansion state (`accordion-group.ts:118-125`). The second pattern read, Menu: `MenuItem` injects its parent optionally and warns "ngMenuItem must be placed inside an ngMenu or ngMenuBar container" (`NC/src/aria/menu/menu-item.ts:80`, `:109-120`); Tabs' panel requires `TABS` and reports a missing `ngTabContent` or a value with no tab (`NC/src/aria/tabs/tab-panel.ts:70`, `:103-117`). Every check reads what registered, so a forgotten import looks the same as markup never written, and no message names an import.
- ng-primitives: `createPrimitive` returns an injection function that calls `inject(token, {optional, skipSelf})` with `optional` false unless the caller passes it (`packages/ng-primitives/state/src/index.ts:337-350`); the accordion item calls `injectAccordionState()` with no options (`accordion/src/accordion-item/accordion-item-state.ts:65`), so a forgotten `ngpAccordion` throws NG0201. The package has no peer checks (its four `ngDevMode` uses are unrelated).

## 2. The approaches built

### (A) The Aria style, with a DOM probe (`src/lib/aria.ts`, `src/lib/dev.ts`)

Every child injects its parent with `optional: true`. In development builds every directive marks its host element in a module-level `WeakMap<Element, Set<string>>` and runs a check after render; each report is made once per (element, directive), so a forgotten item found by its accordion and by its title and content is reported once.

- Parent check, when the optional injection returned `null`: `host.parentElement.closest('[nfsAccordion]')`. An ancestor that hosts an instance means DI cannot reach it (declared in another template); an ancestor that hosts none means the parent was not imported; no ancestor means the part stands alone (the building-blocks 1.9 warning).
- Child check: every element under the host that carries a child's attribute, whose nearest ancestor with the part's own attribute is this host (so a nested accordion keeps its own items), and that hosts no instance.
- What a part can detect about a peer that was never imported: the peer's element still carries the attribute, because Angular renders a static attribute whether or not a directive matches it (the browser lowercases it; attribute selectors match either case); the part knows whether an instance marked that element; and Angular's development-mode `ng.getOwningComponent(el)` names the component whose template declares it, which is the component whose `imports` must change, the consumer page and not the shell for projected content (measured).
- What it cannot detect: a peer outside its ancestry or subtree (linked by reference, by value, or through a portal); a directive that is imported but whose selector did not match because of the element (`<a nfsAccordionTitle>` against `button[nfsAccordionTitle]` would be reported as a forgotten import; not built); a marker on `ng-template` (a comment node with no attributes; not measured); and anything when no part of the family is imported.
- Two guards the measurement forced. Server-rendered DOM of a `@defer (hydrate on ...)` block is in the page before its directives exist; `ng.getOwningComponent` returns `null` for it, and the probe skips such nodes (without that guard, `defer-hydrate-ok` gave two false reports). A first guard on Angular's private `__ngContext__` property hid real orphans, because Angular does not patch it onto every element it creates: a plain `li` with no directive had none, while the same `li` as a `@for` row or as projected content had it (measured; the projection case is `NG/packages/core/src/render3/node_manipulation.ts:814`). `getOwningComponent` is marked `@publicApi` as part of the debugging global (`NG/packages/core/src/render3/util/discovery_utils.ts:91-105`). And a check for "a part with no child at all", the Aria panel's kind, was dropped: under `@defer`, an `@if` still false, or an empty `@for` it fired before the children arrived, on every such page.
- The render hook: Aria's `afterRenderEffect` reruns only when a signal it read changes. Measured with it, a forgotten title that appears later inside an existing item (`if-leaf`) is never reported, because no peer registers and no new part is created; late content that brings a new part with it (`if-whole`, a hydrated `@defer`) was reported. `afterEveryRender` in development builds catches `if-leaf` too, and is the version measured last.

### (B) The ng-primitives style (`src/lib/ngp.ts`)

Every child injects its parent without `optional`, including the menu item, against building-blocks 1.9. No checks. The token descriptions name the import in development builds only: `new InjectionToken(typeof ngDevMode === 'undefined' || ngDevMode ? 'nfsAccordionToken (import NfsAccordion)' : '')`. `NfsSubmenu` and `NfsSubmenuToggle` inject `NfsMenuItem` by class, whose name NG0201 prints.

## 3. Results

Reports per case in the development builds; "silent" means no message and an unstyled page. Production is its own row below the table. Every row held for the server-rendered and the client-only run alike unless it says otherwise.

| Case | (A) Aria style | (B) ng-primitives style |
| --- | --- | --- |
| Imported correctly (accordion, menu, button) | 0 | 0 |
| Forgotten member, parent: `NfsAccordion` | 1: `<ul nfsAccordion> has no NfsAccordion instance ... add NfsAccordion to the imports of AccNoAccordionPage (found by NfsAccordionItem)` | NG0201 `No provider found for InjectionToken nfsAccordionToken (import NfsAccordion). Source: Environment Injector.`; SSR 404, client page empty |
| Forgotten member, middle: `NfsAccordionItem` (2 items) | 2, one per `li`, naming `NfsAccordionItem` and the page | NG0201 for `nfsAccordionItemToken`; SSR 404, client page empty |
| Forgotten member, leaf: `NfsAccordionTitle` (2 titles) | 2, naming `NfsAccordionTitle` | silent |
| Forgotten member, menu root `NfsDropdownMenu` | 1 | NG0201 for `nfsMenuModeToken (import NfsDropdownMenu)`, only because (B) requires the root |
| Forgotten member, `NfsMenuItem` (3 items, one in a submenu) | 3 | NG0201 naming `_NfsMenuItem` (the class, as esbuild names it) |
| Forgotten member, leaf: `NfsSubmenuToggle` | 1 | silent |
| Forgotten whole family (accordion; menu) | silent | silent |
| Forgotten single directive `NfsButton` | silent | silent |
| Consumer CSS attributes `nfsCard`, `nfsFancyItem`, `nfsHighlight`, `nfsaccordion-note` inside and around an accordion | 0 | 0 |
| Bound input on the missing directive | compile error before any runtime check: NG8002 for `[color]` on `nfsButton` and `[expanded]` on `nfsAccordionTitle`, NG8003 for `#c="nfsAccordionContent"`; the static `color="alert"` compiles silently | same |
| `@defer (on timer)`, item forgotten | 2, after the block renders | NG0201 in the browser (the server renders the placeholder); block empty |
| `@defer (hydrate on interaction)` items, all imported | 0 (2 false reports before hydration without the guard) | 0 |
| `@defer (hydrate on interaction)` items, item forgotten | 2, after the click hydrates the block (none before); client-only: 2 at load | NG0201 on the server (logged, HTTP 200) and again in the browser; block empty |
| `@if`, whole accordion shown later, item forgotten | 2, after the click | NG0201 after the click; block empty |
| `@if`, only the forgotten title shown later | 1 after the click with `afterEveryRender`; missed with `afterRenderEffect` | silent |
| `@for`, 3 items forgotten | 3 | NG0201 (SSR 200 with the error logged); block empty |
| `ng-template` by `NgTemplateOutlet`, accordion inside, item forgotten | 2 | NG0201; block empty |
| Items declared outside the accordion, rendered inside by `NgTemplateOutlet`, all imported | 2: `sits inside a NfsAccordion that its injector cannot reach: it is declared in another template ... DI follows the declaration site` | NG0201 `(import NfsAccordion)`, which misleads: it is imported |
| Items projected into a shell component's accordion, all imported | 2, the same "cannot reach" report | NG0201 `(import NfsAccordion)`, misleading; SSR 404 |
| Items projected, consumer forgot `NfsAccordionItem` | 2, naming `ProjectedNoItemPage`, the consumer, not the shell | NG0201 for the item token; SSR 404 |
| External `templateUrl`, item forgotten | 1 | NG0201; SSR 404 |
| Production build, every case above | nothing: 0 messages in 44 loads, every page HTTP 200, forgotten parts unstyled | a bare `NG0201` with no token name; the same 404s and empty blocks |

Rendering modes: (A) never ran on the server: 0 server log lines over 88 loads, and under `ng serve` its reports reached the terminal only as the dev server's forwarded `(client) [console.warn]` lines. It ran after hydration with no hydration warning logged. (B) threw on the server wherever the markup rendered there. HTTP 404 came when the error was thrown while the router created the page component: the navigation failed and the SSR handler fell through to Express (`Cannot GET /...`); HTTP 200 with the error logged came when it was thrown in a view created later in the render (`@for`, the outlet, a `@defer` block rendered on the server).

Does the message name the missing import? (A): yes, the directive and the declaring component (`AccNoItemPage`; esbuild prints the class as `_AccNoItemPage`, and the prototype strips the underscore). (B): Angular 22.2 prints `No provider found for <token>. Source: Environment Injector.` and no path when the path has one entry (`NG/packages/core/src/di/null_injector.ts:19`, `NG/packages/core/src/render3/errors_di.ts:147-162`), so neither the requesting directive nor the component appears; only a token description or a class token names anything, and in production nothing does.

## 4. Costs measured

| Measure | (A) Aria style | (B) ng-primitives style |
| --- | --- | --- |
| Library alone, esbuild-minified, `@angular/core` external, `ngDevMode` true against false | 6439 against 4107 B (2386 against 1538 B gzip): the checks are 2332 B (848 B gzip) for eight directives | 2987 against 2860 B: 127 B of token descriptions |
| Application production bundle, library bytes from the esbuild metafile | `aria.ts` 3700 B; `dev.ts` absent; no message string, `getOwningComponent`, or `afterEveryRender` in `main.js` or `main.server.mjs` | `ngp.ts` 2857 B |
| Same, with a module-level `const dev = typeof ngDevMode === 'undefined' \|\| !!ngDevMode` and `if (dev)` | `main.js` 295743 B against 291407 B: 4336 B of check code and every message kept | n/a |
| Development render, 500 items (1501 checked parts), 50 renders, two runs | median 6.4-6.5 ms, p90 8.4 ms | median 5.4 ms, p90 6.5-6.9 ms |

The 843 B between the two production libraries is the stand-ins' own behaviour (optional parents handled as `null`, the title, content, submenu, and toggle registries), not check code. The render cost is `afterEveryRender`; with `afterRenderEffect` a check reruns only when a registry changes.

## 5. Which families can require their parent

A required parent turns a forgotten parent import into NG0201, which P23 accepts as the report "a child that cannot stand alone" gives. It cannot be used where the specs keep the injection optional on purpose:

- Required already (the ng-primitives style fits): Accordion item, title, and content (`specs/accordion.md:151`, and Aria's trigger requires `ACCORDION_GROUP` anyway); the Nested menu's `NfsSubmenu` and `NfsSubmenuToggle`, which inject `NfsMenuItem` (`specs/nested-menu.md:141`, `:144`, `:165`); the Slider handle (`specs/slider.md:158`); the Progress meter (`specs/progress-bar.md:105`); the Abide alert (`specs/abide.md:141`); and every part that hosts an Aria directive requiring its container (Tabs' `a[nfsTab]` through Aria's `Tab`, `NC/src/aria/tabs/tab.ts:59`).
- Optional on purpose (cannot require): the menu item, which stands alone and binds no mode classes without a root (`specs/nested-menu.md:140`, `:167`); the Dropdown Menu and Top Bar lookups of `nfsTopBarRightToken`, where projection can hide the provider (building-blocks 1.9, `specs/dropdown-menu.md:158`, `specs/top-bar.md:134`); `nfsClose` and `nfsToggle`, which take a target or the nearest Openable (`specs/triggers.md:123`); the Off-canvas panel, whose sibling form has no enclosing content (`specs/off-canvas.md:173`); the Abide label's input registration (`specs/abide.md:156`); the Equalizer watch, also reached through `hostDirectives` on consumer components (`specs/equalizer.md:136-148`); the Drilldown back item (`specs/drilldown-menu.md:147`); and the development-only lookups of `NfsMenuText`, `NfsBreadcrumbsItem`, the Pagination items, and `nfsSliderFill` (`specs/menu.md:116`, `specs/breadcrumbs.md:108`, `specs/pagination.md:110`, `:155`, `specs/slider.md:153`), which inject nothing in production.
- The optional ones already warn "outside its parent" in development. The prototype's parent probe is the same injection and the same render callback plus one `closest()` and one lookup, and it turns that warning into "import X" when the ancestor carries the parent's attribute without an instance.
- In the real Accordion the leaves are covered by the compiler, not by any runtime check: the title binds `[panel]="c.panel"` and the content is referenced as `#c="nfsAccordionContent"` (`specs/accordion.md:153`), so a forgotten title fails with NG8002 and a forgotten content with NG8003 (both measured on the stand-ins); the accordion and the item are then reported by NG0201. Only the whole family, and the Lazy content marker on `ng-template`, stay silent there.

## 6. How it would ship

- (A) needs nothing from the consumer: each directive carries its own two checks behind an inline `ngDevMode` guard, and a small internal helper (155 lines with comments in the prototype: the marks, the probe, the once-only report) lives in the primary entry point, which every secondary entry point may import, where production builds drop it. It is a development warning in the building-blocks 1.9 and P23 sense, not one of ADR 0040's Runtime checks: a report is always a real defect or a real DI placement, so an opt-out has nothing to switch off, and a production opt-in through `provideNfsProductionRuntimeChecks` would not work as built, because the `ng` global it reads for the owner and the dehydration guard exists only in development.
- (B) ships as the injections the specs already require, with the token descriptions guarded as Angular's own tokens are. If the effort keeps it, the description should also cover the projection case, for example `nfsAccordionToken (provided by NfsAccordion on an ancestor in the same template)`, since the same NG0201 appears when the parent is imported but projected.
- Neither reaches a Storybook story, whose static build runs in production mode (P23), and neither reaches CI unless an e2e test fails on console warnings or on the NG0201 error.

## 7. Failure modes

- (A) misses a whole family, a single directive, and a peer not in its DOM ancestry or subtree (Tabs panels paired by value, `[nfsOpen]` links, portals); it would call an imported directive on the wrong element "forgotten"; it depends on the development `ng` debugging global (`getOwningComponent` is public as a debugging utility, not as an API for library code) and, where that global is missing, treats every node as known and names no component; it reports only in the browser console after render, never on the server or at build time; with `afterRenderEffect` it misses late orphans, and with `afterEveryRender` its cost grows with the family's DOM on every development render.
- (B) misses every forgotten leaf, whole family, and single directive; its message names the import only through a hand-written description, prints nothing useful in production, and says "import" where the fault is projection; and a forgotten import in a branch that development testing never renders ships as a production page that fails with HTTP 404 or renders empty, where (A) ships an unstyled element.
- Both depend on markup the family renders: an `@if` that is never true in development is never checked.

## 8. Recommendation and its limits

- Use (A) as the library's in-family check: optional parents keep the development warning they already have, extended with the parent probe, and every parent also runs the child probe, in `afterEveryRender` behind an inline `typeof ngDevMode === 'undefined' || ngDevMode` at each call site, reported once per element. It is the only one of the two that reports forgotten leaves, names the component to fix, and costs production nothing.
- Keep the required injections the specs already have (NG0201 is the P23 report, and the Accordion's leaves are caught by the compiler); give those tokens a development-only description that names the parent directive and mentions projection. Do not make an optional injection required to gain an error: the parts that are optional are optional for projection, stand-alone use, or `hostDirectives`, and (B) throws in production.
- Limits: this covers forgotten members only. The whole family and the single directive (`NfsButton` and every class directive without peers, most of the library by count) need the runtime manifest check or the static check, or the import array P24 proposes, which also leaves a single directive uncovered. The DOM probe needs each family's peer attributes and scope rule written into its parts, and a family whose peers are linked by value or reference needs a different lookup. Measured in Chromium only; the checks use no engine-specific API.
