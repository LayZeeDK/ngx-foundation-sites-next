# Spec: forgotten-import checks (shared utility)

Ticket: [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md). Targets Angular 22.2, Nx 23.2, TypeScript 6.0.x, `angular-html-parser` 10.13.x, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, and Foundation for Sites 6.9.0. Decided upstream in [ADR 0046](../adr/0046-forgotten-imports-caught-by-checks.md) (no import arrays, four checks, the user's ruling of 2026-09-28), [ADR 0040](../adr/0040-variant-input-types.md) (the Runtime checks), [ADR 0039](../adr/0039-directives-manage-every-foundation-class.md) (the class rule), [ADR 0009](../adr/0009-nfs-prefix-and-token-naming.md) (the `nfs` prefix and token names), and [ADR 0045](../adr/0045-release-policy-devkit-version-scheme.md) (what may change in a minor); building-blocks 1.9 and the architecture guide's P23 and P24. The decision log, with every question this spec asked itself and its triage, is in the ticket answer.

Evidence is cited as: RUNTIME, STATIC, and PEER, the three prototypes of [Prototype: detecting a forgotten attribute directive import](../issues/145-prototype-missing-directive-import-checks.md) (the runtime manifest check, the static check over Angular's compiler, and the in-family checks), with their section numbers; DOC, [Prototype: a static import check on documented APIs only](../issues/149-prototype-documented-api-import-check.md), with its section numbers; and "this ticket's probe", the template-outlet measurement in this spec's ticket answer (Angular 22.2.0, prerendered and hydrated in Chromium).

## Problem Statement

A developer writes `<button nfsButton color="primary">Save</button>` and forgets to add `NfsButton` to the component's `imports`. Angular compiles the template without a word: a static attribute that matches no imported directive is plain HTML (the Angular team has said the compiler cannot make it an error, angular/angular#17874). The button renders without `.button`, its colour, its disabled contract, and its ARIA. A bound input on the missing directive (`[color]="tone"`) fails with NG8002 and an element selector fails with NG8001, but the static form, which most Foundation markup uses, fails silently.

Foundation's own JavaScript never had this failure: `Foundation.reflow` finds every `[data-<plugin>]` element for every registered plugin, so a Foundation developer never imports anything. The class rule makes it common here: every Foundation class becomes a directive attribute (ADR 0039), so every element of a card, a grid, or a menu carries an attribute whose directive the component must import, and the three failures look different:

- A forgotten member of a family (`NfsAccordionTitle` in a working accordion) renders one part unstyled and without its ARIA inside a family that otherwise works, which is easy to miss.
- A forgotten whole family or single directive runs no library code at all, so no check inside the family can report it.
- A template that never renders in development (a false `@if` branch, a route nobody opened, a `@defer` block whose trigger never fired) is never seen by any browser check.

The architecture guide's P24 had left an import array per entry point as the provisional answer. The user ruled against import arrays (ADR 0046): an exported array prevents only a forgotten member, costs about fifty public names, and hides its members from the unused-imports diagnostic and `ng generate @angular/core:cleanup-unused-imports`, because the compiler treats an exported array as possibly shared. The library instead catches a forgotten import with four checks, and developers need each of them specified precisely enough that it reports every forgotten import in its reach, names the fix, reports nothing for correct markup, and costs production nothing.

## Solution

Entry points export their directive classes and no import arrays. The library ships four checks, all built on one list, the Selector manifest, which the library's build generates from its own directives:

- In-family checks, in development builds only: each part of a directive family reports a peer's element that carries the peer's attribute with no instance of it (a forgotten parent, a forgotten child), a parent that dependency injection cannot reach because the part is declared in another template, and a part that stands outside its parent. One call per directive, `nfsDirectiveCheck(...)`, behind an inline `ngDevMode` guard, runs them after every render.
- The runtime manifest check `strictDirectiveImports`, the fourth Runtime check (ADR 0040): in development builds, after every render, it reports any rendered element that carries a library directive's attribute with no library directive on it, whether the import of a member, a whole family, or a single directive was forgotten, and any library attribute on an element that no selector of its directive admits. It is on by default with an opt-out, and never runs in production. It starts from the first library directive, or from `provideNfsRuntimeChecks()` when no library directive runs at all.
- The opt-in `strictParents` flag: in development builds, a part whose parent injection is optional throws at construction when no parent is found, instead of warning. A part that a component projects into its parent from another template then renders through a template outlet with the parent element's injector, a documented pattern this spec measured.
- The static check, opt-in, in CI: the `ngx-foundation-sites:missing-imports` Architect builder behind an `nfs-imports` target resolves each standalone component's `imports` with TypeScript's public compiler API, reads its template with `angular-html-parser`, and matches every element against the Selector manifest. It is the only check that sees templates that never render in development. It checks classes written directly in `imports` and skips, with the NFS9002 notice, a component whose `imports` hold an array of any form, a call, or a spread, and every NgModule-declared component (the user's ruling). A setup generator of the same name adds the target, and the library's own CI keeps a compiler-based check as an unshipped oracle.

Every report is made once per element and directive, in the browser console with the element attached, and names the directive, its entry point, and the component whose `imports` must change.

## User Stories

1. As an application developer, I want a development warning when I write `<button nfsButton>` without importing `NfsButton`, naming `NfsButton`, `ngx-foundation-sites/button`, and my component, so that I fix the import instead of debugging the missing style.
2. As an application developer, I want the same warning when I forget a whole family (an accordion with no accordion import), so that a family that runs no library code is still reported.
3. As an application developer, I want a warning when I forget one member of a family (`NfsAccordionTitle`), so that the one part that renders without its ARIA inside a working family does not slip through.
4. As an application developer, I want to be told when I write a library attribute on an element its directive does not accept (`<div nfsButton>`, `<a nfsAccordionTitle>`), so that I move it to the element the directive needs instead of adding an import that changes nothing.
5. As an application developer, I want each forgotten import reported once, not once per `@for` row or once per part that notices it, so that my console stays readable.
6. As an application developer, I want the warning to carry the element, so that the browser's developer tools take me to it.
7. As an application developer, I want no warning for correct markup, for my own `nfs`-less attributes, or for server-rendered content that has not hydrated yet, so that every report is a real defect.
8. As an application developer, I want content inside `@if`, `@for`, `@defer`, template outlets, and projected content checked when it renders, so that late content is covered.
9. As an application developer, I want a forgotten import in a `hydrate never` block reported when the missing directive has a Structural class, so that the server HTML is checked too.
10. As an application developer who forgot every library import in a new application, I want one provider call to start the runtime check anyway, so that my first page is not silently unstyled.
11. As an application developer, I want to switch the runtime check off with `provideNfsRuntimeChecks({strictDirectiveImports: false})`, so that I control my development console.
12. As an application developer, I want nothing of any check in my production bundle, so that the checks cost my users nothing.
13. As an application developer on the dev server with SSR, I want the reports in my `ng serve` terminal as well as in the browser, so that I see them where I work.
14. As an application developer, I want a part that sits inside its parent's element but cannot reach it through dependency injection (declared in another template) reported as such, with the fix, so that I do not add an import I already have.
15. As an application developer, I want an opt-in mode in which a missing parent throws, so that a forgotten parent import cannot pass unnoticed in development.
16. As an application developer who opts in to `strictParents`, I want production unchanged, so that a missing parent never blanks a page for my users.
17. As an application developer who projects menu items into a layout component's menu, I want a documented pattern that gives them the menu's injector, so that `strictParents` and the required parent injections work across templates.
18. As an application developer who sees NG0201, I want the token's description to name the directive that provides it, its entry point, and the same-template rule, so that the error tells me what to import or where to move the element.
19. As a CI maintainer, I want a static check that fails on a forgotten import in any component, rendered in development or not, with the file, line, column, directive, entry point, and component, so that nothing ships unstyled from an untested branch.
20. As a CI maintainer, I want the static check to use no Angular API outside Angular's public-API policy, so that an Angular minor cannot break it silently.
21. As a CI maintainer, I want a one-line notice for every component the check skipped and why, and a summary with the counts, so that I know what was not checked.
22. As a CI maintainer, I want the check to fail when it finds no component at all, so that a broken setup does not pass as clean.
23. As a CI maintainer on Nx, I want the target cacheable on the project's sources, its dependencies' sources, and the installed versions of the library, TypeScript, and the parser, so that an unchanged project is not checked again.
24. As a CI maintainer, I want a second configuration that checks the components my tests declare, so that test templates are covered when I want them.
25. As an application developer on Nx or the Angular CLI, I want one opt-in generator that adds the target and the parser, so that setup is one command.
26. As an application developer who imports my workspace's own directive that hosts a library directive, I want the static check to see the hosted directive, so that it reports no false forgotten import.
27. As an application developer who writes `nfsMenu` beside `nfsDropdownMenu`, I want the static check to know that the root hosts the Menu directive, so that it does not report the Menu as forgotten.
28. As an application developer who imports classes through renamed imports, path aliases, re-exports, or namespace imports, I want the static check to resolve them, so that my import style does not matter.
29. As an application developer, I want the static check to skip `ngNonBindable` content, as Angular's runtime does, so that it never asks me to import a directive Angular would not apply there.
30. As an application developer on an NgModule application, I want the library's directives, the in-family checks, and the runtime check to work for me, so that only the static check leaves my NgModule-declared components out.
31. As a library maintainer, I want one Selector manifest generated from the library's directives and checked against the built package, so that the checks never drift from what ships.
32. As a library maintainer, I want the build to fail when two directives with one class name have different selectors, or when a structural directive's selector names a secondary microsyntax key, so that the manifest's shortcuts stay safe.
33. As a library maintainer, I want the compiler-based check to run beside the documented one in the library's CI on every Angular minor, so that a copied Angular rule that drifts is caught before a release.
34. As a library maintainer, I want one development helper for every directive, so that each family's checks are one line and its guard is written the same way everywhere.
35. As a family spec author, I want a rule for listing my family's in-family checks, so that every family spec states its peers the same way.
36. As a library maintainer, I want every library story to fail when it logs a forgotten-import report, so that a story whose `moduleMetadata.imports` misses a directive is caught, since no static check sees a story's template.
37. As a library maintainer, I want every Fixture app route to log no forgotten-import report, so that the whole library is a negative control for false reports.
38. As a consumer who writes unit tests, I want each report once per test file at most, and an opt-out for my test setup, so that my test output stays readable.
39. As an application developer upgrading the library, I want a new directive in a release to be covered by the checks without any change on my side, so that the manifest travels with the package.
40. As an application developer who sets up the static check on the Angular CLI, I want a clear message naming the package to install when the parser is missing, so that the failure explains itself.

## Implementation Decisions

### Foundation contract

There is no Foundation counterpart. Foundation's JavaScript initialises every registered plugin on every `[data-<plugin>]` element it finds (`Foundation.reflow`), and its CSS classes need no initialisation at all, so a Foundation developer has nothing to import. The next library replaces both with directives, so the checks exist to make up for a failure Foundation never had. No Foundation option, event, or class is involved.

What Angular reports without these checks (STATIC 2, DOC 2):

| Form | Angular's report |
| --- | --- |
| A static attribute of a directive not imported (`<button nfsButton color="primary">`) | none |
| A bound input of it (`[color]="tone"`, `bind-color`, an interpolated `color="{{ c }}"`, `[(x)]`) | NG8002, a compile error |
| A template reference to its `exportAs` (`#c="nfsAccordionContent"`) | NG8003, a compile error |
| An element selector (`<nfs-responsive-accordion-tabs>`) | NG8001, a compile error |
| A structural `*nfsX` on an element or `ng-container` | NG8116, a warning |
| An event binding (`(nfsCallout)`), `<ng-template [nfsX]>` | none |

So the checks cover attribute selectors only, which is every library directive and every attribute-selector component; element-selector components are the compiler's.

### Hierarchy and package shape

```
ngx-foundation-sites/media-query   (the Runtime checks' entry point, Breakpoint service spec)
  NfsRuntimeChecks: + strictDirectiveImports, + strictParents
  provideNfsRuntimeChecks(checks?)          now also starts the strictDirectiveImports scan
  provideNfsProductionRuntimeChecks(...)    accepts neither new key
  nfsDirectiveCheck(directive, family?)     for library directives, development builds only
  NfsFamilyPeers
  (development only, reachable only from nfsDirectiveCheck and the development checker:)
    the host record, the verdict, the one report function, the scan, the Selector manifest module

every library directive or component with an attribute selector
  constructor: if (typeof ngDevMode === 'undefined' || ngDevMode) { nfsDirectiveCheck('NfsX', {...}); }

Workspace tooling (Node, CommonJS, beside the Variant tooling; Spec: Variant declaration tooling, D22)
  Selector manifest (JSON), read from the install location, never exported
  builder    ngx-foundation-sites:missing-imports   (package "builders": Angular CLI and Nx)
  generator  ngx-foundation-sites:missing-imports   (package "generators"; "schematics" via convertNxGenerator)

The library's own workspace, never shipped
  the Selector manifest generator and its post-build assertion
  the compiler-based check (STATIC), the oracle
```

- The development pieces live in `ngx-foundation-sites/media-query`, beside `nfsVariantCheck`, the Runtime checks' existing home and the precedent for a function exported for library directives. The primary entry point imports nothing at runtime ([Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md), D2), and the helper needs `@angular/core`. An entry point that had no reason to import `ngx-foundation-sites/media-query` (the Accordion) now imports `nfsDirectiveCheck` from it; the call sits behind the inline guard, so a production build keeps nothing of it (PEER 4, RUNTIME 3).
- The guard is written inline at every call site. A hoisted `const dev = typeof ngDevMode === 'undefined' || !!ngDevMode` kept 4336 B of check code and every message in the production bundle (PEER 4). Nothing in the development modules runs at module level: an `@Injectable` scan service and a module-level `new InjectionToken(...)` each kept the whole 30 kB checker in production (RUNTIME 3); the checker hangs off the existing root token whose factory returns the development checker behind `ngDevMode`, else `null` (the Breakpoint service spec's mechanism).
- A directive or component whose host is an `ng-template` or `ng-container` (the Lazy content markers, `ng-container[nfsInterchange]`) calls nothing: the DOM holds no element for it, so only the static check can see it.

### The Selector manifest

The library's list of its exported directives and components that have an attribute selector. The static check reads it as JSON from the package's install location, never through `exports`, as the Variant tooling reads the Variant manifest. The development checks import it as a generated module inside `ngx-foundation-sites/media-query` that only the development code reaches.

```ts
interface NfsSelectorManifest {
  readonly version: 1;
  readonly directives: readonly NfsSelectorManifestDirective[];
}

interface NfsSelectorManifestDirective {
  readonly directive: string; // 'NfsButton': the exported class name
  readonly entryPoint: string; // 'ngx-foundation-sites/button'
  readonly selector: string; // 'button[nfsButton], a[nfsButton], input[type=submit][nfsButton], ...'
  readonly hostClass: string | null; // 'button': the first class of its static host `class`, which it always binds; null when it binds none
  readonly hosts: readonly string[]; // library directives it hosts through hostDirectives, transitively: NfsDropdownMenu -> ['NfsMenu']
}
```

- Generation. A step before the library build reads every exported directive and component decorator of the library's sources with TypeScript's parser (class name, entry point, selector, static host `class`, `hostDirectives`) and writes both the JSON and the module; entry points are built in dependency order, and the module sits in an early one, so the data cannot come from the other entry points' build output first. After the build, a second step reads each entry point's compiled partial declarations in the packed package (`selector`, `host.classAttribute`, `hostDirectives`) and fails when any directive is missing from the manifest or differs from it, so the manifest cannot drift from what ships, as the Variant typings check guards the Variant manifest. Both steps run in the library's own workspace; consumers never run them.
- Rules the generator enforces, failing the build:
  1. Every exported declarable with an attribute selector is listed; one with only element selectors is left out (NG8001 covers it).
  2. Two directives with one class name (the Float Grid's and the Flex Grid's `NfsRow` and `NfsColumn`) have the same selector and host class, because the development record keys hosts by class name (below).
  3. No selector names a secondary microsyntax key: no attribute of any selector is the attribute of a directive that injects `TemplateRef` followed by an uppercase letter (the shape of `ngIfElse` after `ngIf`), because the static check does not derive those keys (DOC 4, rule 5).
- `hosts` is what lets the static check see a library directive that another library directive hosts (the menu roots and `NfsSubmenu` host `NfsMenu`, Magellan hosts `NfsSmoothScroll`), which the documented check cannot read from the typings, whose declaration types Angular's policy marks private (DOC 4).
- Size: about 170 attribute entries for the whole library; the development module is the development bundle's largest part of the checks (34 kB readable, 3.8 kB gzip for the prototype's 174 entries, RUNTIME 3). Its shape is internal and may be compacted.

### API: `nfsDirectiveCheck` and the shared development record

```ts
/**
 * For library directives and components, once, from the constructor, and only inside
 * `if (typeof ngDevMode === 'undefined' || ngDevMode) { ... }`. Records the host as carrying `directive`,
 * starts the strictDirectiveImports scan, runs the directive's In-family checks after every render,
 * and, when strictParents is on, throws at once if the optional parent injection found nothing.
 */
export function nfsDirectiveCheck(directive: string, family?: NfsFamilyPeers): void;

export interface NfsFamilyPeers {
  /** The parent this part injects optionally. */
  readonly parent?: {
    /** The directives whose elements provide the parent: its provider and every directive that hosts it. */
    readonly directives: readonly string[];
    /** Whether the optional injection returned the parent. */
    readonly found: boolean;
    /** The family's own sentence for a part that stands outside its parent, replacing the default one. */
    readonly alone?: string;
  };
  /** The child directives whose elements in this part's scope must host an instance. */
  readonly children?: readonly string[];
}
```

- `directive` and every name in `family` are Selector manifest class names. The helper reads the attributes, selectors, entry points, and host classes from the manifest, so a directive passes names only.
- The host record: a development-only `WeakMap<Element, Set<string>>` of the class names of the library directives constructed on each element, filled by `nfsDirectiveCheck`. Only the directive itself adds to it. It replaces the runtime prototype's read of Angular's private compiled selector field (RUNTIME 1, approach B2): a hosted directive (`NfsMenu` under a root) and a directive reached through a consumer's `hostDirectives` construct and record themselves too.
- The verdict for one element and one library attribute on it, shared by both checks:
  1. Wrong element: no selector of any manifest directive listing the attribute matches the element (`element.matches(selector)`). Reported as a wrong-element misuse.
  2. Missing: every directive that lists the attribute and whose selector matches the element has a `hostClass`, and the element carries none of them. The server rendered the same template with the same imports, so its HTML carries the class exactly when the directive was there; this decides even for server HTML that has not hydrated (RUNTIME 2).
  3. Not yet claimed: Angular's development debugging API `ng.getOwningComponent(element)` returns `null` (server HTML of a block not hydrated yet, or of a lazy route whose chunk has not loaded). Present when the element carries one of those host classes, as the runtime prototype's hybrid measured; undecided otherwise, and looked at again on a later render. Without the `ng` global (a test environment that does not publish it), every element counts as claimed. The one miss this leaves: a Foundation class the consumer copied by hand onto unclaimed server HTML (a `hydrate never` block) reads as present.
  4. Otherwise: present when the host record holds any directive that lists the attribute; missing otherwise. A hosted library directive (`NfsMenu` under a root) records itself, because it runs its own constructor.
- One report function for both checks: at most one report per element and directive, and at most one per realm per subject (the directive, the kind of report, and the owning component), so a forgotten import in a 500-row `@for` warns once and the part that notices it second stays silent. Reports go to `console.warn(message, element)`.
- Owning component: `ng.getOwningComponent` names the component whose template declares the element for projected content, but the host that renders an outlet template rather than the template's declarer (RUNTIME 2), so the message says "the component whose template declares this element" and adds Angular's name in parentheses when there is one. The development build prints classes as `_Name`; the leading underscore is removed (PEER 3).

### In-family checks

Each part of a family checks its peers in an `afterEveryRender` read callback created in its own injection context, which Angular makes a no-op on the server. A part creates the callback only when it has children to probe or its parent injection returned `null`.

- Parent check, when `family.parent.found` is `false`: `host.parentElement.closest()` over the parent directives' attributes.
  - An ancestor whose element the host record shows hosting a parent: the part is declared in another template (content projection or a template outlet) and dependency injection follows the declaration site; reported as out of reach, with the outlet pattern as the fix.
  - An ancestor that carries a parent's attribute and gets the verdict "missing": the parent's import was forgotten; reported on the ancestor, naming the parent directive (the report of the forgotten element, "found by" this part).
  - No such ancestor: the part stands outside its parent; reported with the family's `alone` sentence, or the default one. This is the development warning building-blocks 1.9 already requires for an optional parent.
- Child probe, for each child directive: every element under the host that carries one of the child's attributes, whose nearest ancestor carrying one of this part's own attributes is this host (so a nested instance keeps its own children), is given the verdict above, and a forgotten import or a wrong element is reported.
- Not reported: a part with no child at all. Under `@defer`, an empty `@for`, or an `@if` still false, that state is legal and temporary, and it fired before the children arrived on every such page (PEER 2).
- `afterEveryRender`, not Angular Aria's `afterRenderEffect`: an effect reruns only when a signal it read changes, so a forgotten title that appears later inside an existing item was never reported with it (PEER 2). Cost: about 1 ms more per development render at 500 accordion items (PEER 4).
- They are development warnings in the building-blocks 1.9 and P23 sense, not Runtime checks: every report is a real defect or a real placement, so they have no switch, and the `ng` global they read exists only in development (PEER 6). They run whether or not `strictDirectiveImports` is on.
- What they cannot see (PEER 7): a forgotten whole family or single directive (no family code runs), and peers linked by reference or by value rather than by the DOM (Tabs panels by `value`, `[nfsOpen]` targets, portals); the runtime check and the static check cover those.

The rule each family spec follows. A spec with more than one directive lists its In-family checks under Hierarchy and DI shape, one line per part:

1. The part's `nfsDirectiveCheck` name.
2. Its parent check: the parent directives (the provider and every directive that hosts it) when its parent injection is optional, with the family's `alone` sentence if it has one; "none" when the injection is required, because NG0201 is the report (P23), with the token's description (below).
3. Its child probes: the child directives it probes, or "none" for a leaf.
4. Its peers linked by reference or by value, which get no probe.
5. What `strictParents` changes for the part (the table below), or "nothing".

A spec with a single directive and no parent, child, or peer adds no line: building-blocks 1.9, which every spec inherits, gives the directive the call with its class name.

### The runtime manifest check: `strictDirectiveImports`

The fourth Runtime check of `NfsRuntimeChecks` (ADR 0040; the [Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md) owns the configuration):

| | `strictDirectiveImports` |
| --- | --- |
| Reports | A rendered element carrying a library directive's attribute with no library directive on it (a forgotten import of a member, a family, or a single directive), and a library attribute on an element no selector of its directive admits |
| Reads | The DOM, the host record, the Selector manifest, and `ng.getOwningComponent` |
| Runs in | One `afterEveryRender` read callback per application, in the browser |
| Development build | On; `provideNfsRuntimeChecks({strictDirectiveImports: false})` opts out |
| Production build | Never: `provideNfsProductionRuntimeChecks` does not accept it, because the `ng` global it reads exists only in development (Angular publishes it only when `ngDevMode` is on) |

- Start. The development checker starts the scan once per application, from the first `nfsDirectiveCheck` call or from `provideNfsRuntimeChecks(...)`, which adds an environment initializer that only registers the render callback. The environment initializer is the only way to cover an application whose templates instantiate no library directive at all (RUNTIME 2: nothing ran without it), so `provideNfsRuntimeChecks`'s argument becomes optional and the library's install docs put `provideNfsRuntimeChecks()` in every application configuration. In production it returns no providers, as before.
- Scan. The first scan reads the whole document with one selector list of every manifest attribute (`[nfsbutton],[nfsaccordion],...`; attribute selectors match either case, and HTML lowercases the names, RUNTIME 2). A `MutationObserver` on the document then limits each later scan to the subtrees added since the last one, plus the elements still undecided, because hydration claims server DOM without adding nodes. Each scan calls `observer.takeRecords()` first: the render that triggers it queued its records as a microtask that has not run yet, and without it an `@if` branch and a new `@for` row were missed until the next render (RUNTIME 1).
- Cost, development only: about 6.5 to 6.7 kB gzip in the development bundle, most of it the manifest; a cold scan of 2,001 library elements in 12 to 15 ms and of 8,001 in 32 to 34 ms, then 0.0 to 0.1 ms per render (RUNTIME 3). Production: nothing (within 50 bytes of the build without the check, none of its strings present; RUNTIME 3).
- A report from unclaimed server HTML (verdict step 2) has no owner name; the message then names only the directive and entry point.

### `strictParents`

A field of `NfsRuntimeChecks`, `false` by default, development only: `provideNfsRuntimeChecks({strictParents: true})` turns it on, and `provideNfsProductionRuntimeChecks` does not accept it. It is configured beside the Runtime checks, as NgRx keeps flags with different defaults in one `runtimeChecks` object, but it is not a Runtime check: it acts at construction, on the server as in the browser, and it throws instead of reporting.

- Mechanism. `nfsDirectiveCheck` reads the flag at construction. When it is on and `family.parent.found` is `false`, it throws the library's own error (M8), which names the part, the parent directives, the import, and the outlet pattern, where Angular's NG0201 would name only the token (PEER 3). In development the throw breaks the page or block the way NG0201 does: the dev server answers HTTP 404 when the router was creating the page component, and logs the error and sends an empty block when a later view threw (PEER 3). Production is unchanged, because the call is guarded.
- Which parts it makes required: every part whose parent injection is optional only so that a part outside its parent degrades with a development warning. A part whose `null` is a supported form keeps it.

| Part | Optional injection | Without the flag (development) | With `strictParents` |
| --- | --- | --- | --- |
| `li[nfsMenuItem]` (Nested menu) | `nfsMenuModeToken` | warns; binds no mode classes | throws |
| `span[nfsSubmenuToggleText]` (Nested menu) | `NfsSubmenuToggle`, development only | warns | throws |
| `li[nfsMenuText]` (Menu) | `NfsMenu`, development only | warns | throws |
| `li[nfsBreadcrumbsItem]` (Breadcrumbs) | `NfsBreadcrumbs`, development only | warns | throws |
| `li[nfsPaginationPrevious]`, `li[nfsPaginationNext]`, `li[nfsPaginationEllipsis]` (Pagination) | `NfsPagination`, development only | warns | throws |
| `span[nfsSliderFill]` (Slider) | `nfsSliderToken`, development only | warns | throws |
| `[nfsOrbitWrapper]`, `[nfsOrbitControls]`, `figure[nfsOrbitFigure]`, `img[nfsOrbitImage]`, `figcaption[nfsOrbitCaption]` (Orbit) | `nfsOrbitToken`, development only | warns | throws |
| `[nfsEqualizerWatch]` (Equalizer) | `nfsEqualizerToken` | warns; does nothing | throws |
| `li[nfsDrilldownBack]` (Drilldown) | `NfsDrilldown` | warns | throws |

Kept optional, with the reason each `null` is a supported form:

- `nfsClose` and `nfsToggle` to `nfsOpenableToken`: a bound target replaces the Nearest Openable, and inputs are not set at construction ([Spec: Triggers (shared utility)](../issues/54-spec-triggers.md)).
- The Off-canvas panel to `nfsOffCanvasContentToken`: the sibling form binds `content` instead ([Spec: Off-canvas](../issues/25-spec-off-canvas.md)).
- `NfsAbideInput` to `nfsAbideToken` and `nfsAbideLabelToken`: a field outside a form works with the Defaults token policy, and only a custom control's label provides the label token ([Spec: Abide](../issues/31-spec-abide.md)).
- `ul[nfsDrilldown]` to `NfsDrilldownWrapper`: a Responsive Menu whose rules do not name drilldown has no wrapper, and the Drilldown's check runs only while drilldown is the live mode, which construction cannot know ([Spec: Drilldown Menu](../issues/22-spec-drilldown-menu.md)).
- `NfsMenuItem` to `NfsSubmenu`, and `NfsDrilldownBack` to `NfsSubmenu`: `null` means the root's level, which every root provides as `null` on purpose.
- The Nested menu root to `nfsTopBarRightToken`: context, not a parent, which projection may hide and a DOM walk recovers (ADR 0043).
- A component projected into a Reveal to `nfsRevealToken`: an optional handle, as Material's `MatDialogRef` is.
- Defaults tokens, `HostAttributeToken`, `FORM_FIELD`, and `NgControl`: not parents.

Parent tokens' development descriptions. Every lightweight parent token (a token a directive provides for its descendants, not a Defaults or configuration token) has a description, in development builds only, that names the directive providing it, its entry point, and the same-template rule, because NG0201 prints the description and nothing else about the requester (PEER 3):

```ts
export const nfsAccordionToken = new InjectionToken<NfsAccordion>(
  typeof ngDevMode === 'undefined' || ngDevMode
    ? "nfsAccordionToken (provided by NfsAccordion from 'ngx-foundation-sites/accordion' on an ancestor element declared in the same template)"
    : '',
);
```

It serves the injections that are required already (the Accordion's parts, the Slider handle, the Progress meter, the Abide alert, the Orbit parts with behaviour), which throw NG0201 with or without `strictParents`. A lookup by class (`inject(NfsMenuItem)`) prints the class's name, which the development build prefixes with `_`; that is the one form no description can reach.

The template-outlet pattern for parts projected across templates. Dependency injection follows the declaration site, and `inject()` has no option that follows projection, so a part that a component projects with `<ng-content>` into a parent in its own template cannot reach that parent: the required injections throw NG0201, and under `strictParents` the optional ones throw too. The component takes the consumer's markup as a template instead and renders it inside the parent element with that element's injector:

```ts
@Component({
  selector: 'app-shell-nav',
  imports: [NfsDropdownMenu, NgTemplateOutlet],
  template: `
    <ul nfsDropdownMenu>
      <ng-container [ngTemplateOutlet]="items()" [ngTemplateOutletInjector]="menuInjector()" />
    </ul>
  `,
})
export class ShellNav {
  protected readonly items = contentChild.required(TemplateRef);
  protected readonly menuInjector = viewChild.required(NfsDropdownMenu, { read: Injector });
}
```

```html
<!-- the consumer, which imports NfsMenuItem, NfsSubmenu, NfsSubmenuToggle -->
<app-shell-nav>
  <ng-template>
    <li nfsMenuItem><a routerLink="/docs">Docs</a></li>
  </ng-template>
</app-shell-nav>
```

Angular resolves a token inside an embedded view through the view's nodes, then the view's embedded injector, before it goes up to the declaration's view (`lookupTokenUsingEmbeddedInjector`), and a signal view query is readable in the template's first update pass, once the creation pass is over. Measured by this ticket's probe with required parent injections (an accordion whose items and titles inject their parent tokens without `optional`, and a menu whose items do): the prerendered HTML carried every part's classes, the parents counted 2 and 3 registered parts in the same render, and the page hydrated with no warning (4 components, 0 skipped) and handled a click. The pattern is the guide's own for projected content (`adev` hierarchical dependency injection, "Giving projected content access to a view injector"), applied to the parent element's injector rather than the component's.

### The static check

The `ngx-foundation-sites:missing-imports` builder, behind an `nfs-imports` target, opt-in, run in CI. It uses TypeScript's public compiler API, `angular-html-parser`'s documented `parse()`, and a selector matcher of its own over the Selector manifest, and imports nothing from `@angular/compiler` or `@angular/compiler-cli` (DOC 1).

| Option | Type | Default | Meaning |
| --- | --- | --- | --- |
| `buildTarget` | `string` | `<project>:build` | The build target whose `tsConfig` the check reads, through `context.getTargetOptions` |
| `tsConfig` | `string` | none | A TypeScript configuration to check instead of the build target's (the `spec` configuration's `tsconfig.spec.json`) |

- Program: `readConfigFile`, `parseJsonConfigFileContent`, `createProgram`, and the type checker. Every standalone component declared in the program's source files outside `node_modules` is checked; a workspace library's components are checked in each application program that includes them.
- Library classes: for each manifest directive, its entry point is resolved with the workspace's module resolution and the class taken from that module's exports, so a class is known by its declaration whatever name or path it is imported under.
- Scope of a standalone component: the component itself, then each entry of `imports` and `deferredImports` that is an identifier or a namespace property access the type checker resolves to a class, through renamed imports, path aliases, `export *`, and named re-exports. A library class brings itself and its manifest `hosts`; a workspace NgModule brings its `exports` literal, transitively; a workspace directive or component brings the library directives it hosts, through `hostDirectives` and decorated base classes, transitively, on the elements its own selector matches; any other package's class brings nothing the check can see.
- Skipped with the NFS9002 notice, never guessed at: an `imports` or `exports` entry that is an array of any form (a consumer's plain `const`, `as const`, a library's or a package's array), a call (`forwardRef` included), a spread, or anything that does not resolve to a class; a component declared in an NgModule (`standalone: false`); a decorator argument that is not an object literal; a `template` that is not a string literal; a `templateUrl` whose file does not exist; a template that does not parse. The user ruled every array out on 2026-09-28, the plain `const` arrays included ([Prototype: a static import check on documented APIs only](../issues/149-prototype-documented-api-import-check.md), user ruling on arrays).
- Templates: `parse(input, { tokenizeAngularBlocks: true, tokenizeAngularLetDeclaration: true })`; inline templates are located at the string literal's line in the `.ts` file, and `templateUrl` is resolved against the component file, a template in another folder included.
- Matching: for each element, the check builds what Angular matches against (the element name without its namespace, and the attribute names and values that count: text attributes, `[x]`, `bind-x`, interpolated `x="{{...}}"`, `[(x)]` as `x` and `xChange`, `(x)` and `on-x`, not `let-`, references, `i18n`, or `attr.`, `class.`, `style.`, `animate.` bindings), plus the implicit `ng-template` of a `*x`. It visits every block's children and ng-content fallback content, but not ICU cases, `<script>`, `<style>`, or `ngNonBindable` descendants, where Angular's runtime applies no directive (DOC 2). A library directive whose selector matches and that the scope does not bring in is NFS9001; a library attribute on an element that no selector of the directives carrying it admits is NFS9003.
- Manifest lookup: an index by attribute name, so each element is matched only against the directives whose selectors name one of its attributes; a linear scan over 36 selectors already cost about 120 ms at 1047 components (DOC 3), and the real manifest lists about 170 attributes.
- Results: each finding logged as an error with file, line, and column; each skip as a warning; then a summary line. The builder fails on any NFS9001 or NFS9003, and when the program declares no Angular component at all (NFS9004), the guard against an API change that would check nothing and pass (STATIC 5, DOC 1). A program whose every component is skipped succeeds with its notices.
- Dependencies: it loads `typescript` (in every Angular workspace) and `angular-html-parser` (MIT, 204 kB, no dependencies; an optional peer dependency of the package at the range each release is tested with) only when it runs, and ends with M9 when one is missing. The builder imports neither `nx` nor `@nx/devkit`, so the Angular CLI needs only `@angular-devkit/architect`. Architect loads builders with `require()`, so the module has no top-level await (STATIC 1).
- Cost: 798 and 1092 ms per fresh run at 287 and 1047 components, about one `tsc` type check (DOC 3).
- Copied Angular rules (DOC 4): the check copies twelve of Angular's rules (the selector grammar, selector matching, what an element offers the matcher, which attribute forms count, the structural `*x` template, where directives are matched, standalone scope, NgModule exported scope, host directives, which classes are Angular's, where the template is, and, through the parser, how the template parses). The library's CI oracle is what keeps them honest.

The setup generator, `ngx-foundation-sites:missing-imports` (an Nx generator, exposed to the Angular CLI as a schematic through `convertNxGenerator`, in the Variant tooling's collection; opt-in and separate from `ngx-foundation-sites:variant-types`):

| Option | Type | Default | Meaning |
| --- | --- | --- | --- |
| `projects` | `string[]` | every application project with an Angular application build target | The projects to set up |
| `buildTarget` | `string` | `<project>:build` | Only with one project |
| `tsConfig` | `string` | none | Only with one project; a library project names its own `tsconfig.lib.json` |

Per project, idempotently:

1. Add the target, `"nfs-imports": {"executor": "ngx-foundation-sites:missing-imports", "options": {"buildTarget": "<project>:build"}, "configurations": {"spec": {"tsConfig": "<project root>/tsconfig.spec.json"}}}`, the `spec` configuration only when that file exists; in `angular.json` with `builder` for `executor`, edited by the generator itself, as the Variant setup does ([Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md), setup step 2).
2. Under Nx, on that target in `project.json`: `"cache": true` and `"inputs": ["default", "^default", {"externalDependencies": ["ngx-foundation-sites", "typescript", "angular-html-parser"]}]`; never in `targetDefaults`, for the Variant spec's reason (an executor key hides the name-keyed defaults).
3. Add `angular-html-parser` to the workspace's `devDependencies` at the tested range.
4. Nothing else: no sync generator (the check writes no file, and a sync generator would repeat a whole analysis before every task), no tsconfig edit, no application configuration edit, no CI file. It prints the CI step (M10).

CI steps: `npx nx run-many -t nfs-imports` (Nx; `-c spec` for test components), or `npx ng run <project>:nfs-imports` per project (Angular CLI).

The library's own CI keeps the compiler-based check (STATIC 1, approach b) as an oracle, never shipped: on every Angular minor it runs both checks over the prototypes' cases, the classes-only generated workspace, and the synthetic manifest, and fails on any difference other than the known `ngNonBindable` one, where the documented check follows Angular's runtime (DOC 2, DOC 5). The oracle is library-internal code over `@angular/compiler-cli`, so a change in that API breaks the oracle, never a consumer.

### Messages

Every development message starts with `ngx-foundation-sites`, a Runtime check's with its name in brackets, and passes the element as the second `console.warn` argument. Placeholders in angle brackets; `<attr>` is the manifest's spelling.

| Id | When | Text |
| --- | --- | --- |
| M1 | Forgotten import, from the runtime check | "ngx-foundation-sites [strictDirectiveImports]: <tag attr> has no <Directive>, so it renders without its classes, ARIA, and behaviour. Add <Directive> from '<entry point>' to the imports of the component whose template declares this element (Angular names <Owner>), or switch this check off with provideNfsRuntimeChecks({strictDirectiveImports: false})." |
| M2 | The same, from an In-family check | "ngx-foundation-sites: <tag attr> has no <Directive>, so it renders without its classes, ARIA, and behaviour. Add <Directive> from '<entry point>' to the imports of the component whose template declares this element (Angular names <Owner>). Found by <Part>." |
| M3 | Wrong element, from the runtime check | "ngx-foundation-sites [strictDirectiveImports]: <tag attr> matches no selector of <Directive> ('<selector>'), so nothing applies it. Move <attr> to an element the selector names." From an In-family check, the same without the bracketed name and with "Found by <Part>." |
| M4 | Out of reach (In-family) | "ngx-foundation-sites: <tag attr> sits inside a <Parent> that its injector cannot reach: it is declared in another template (content projection or a template outlet), and dependency injection follows the declaration site. Declare it in the template of the <Parent> element, or render it there through a template outlet with that element's injector (ngTemplateOutletInjector)." |
| M5 | Stands alone (In-family) | "ngx-foundation-sites: <tag attr> is not inside an element of <Parent list>." then the family's `alone` sentence when it has one |
| M6 | Owner unknown | M1 to M3 without the parenthesis naming Angular's owner |
| M7 | Token description (NG0201) | "<tokenName> (provided by <Directive> from '<entry point>' on an ancestor element declared in the same template)" |
| M8 | `strictParents` error, thrown | "ngx-foundation-sites [strictParents]: <tag attr> found no <Parent list> on an ancestor element declared in the same template. Add the parent directive to the imports of the component that declares the parent element, write this element inside it, or, when a component projects this element into the parent from another template, render it through a template outlet with the parent element's injector (ngTemplateOutletInjector). strictParents is on in provideNfsRuntimeChecks." |
| NFS9001 | Static, forgotten import (error) | "<file>:<line>:<col>: NFS9001: <attr> matches <Directive>, which <Component>'s imports do not include; import <Directive> from '<entry point>'." (two directives with one class name: "from '<entry point>' or '<entry point>'") |
| NFS9002 | Static, component skipped (warning) | "<file>:<line>:<col>: NFS9002: <Component> is not checked: <reason>. List each directive class in imports to have its template checked." Reasons: "its imports hold an array (<text>)", "a call (<text>)", "a spread (<text>)", "an entry that is not a class (<text>)"; "it is declared in an NgModule (standalone: false)"; "its decorator argument is not an object literal"; "its template is not a string literal"; "its templateUrl '<path>' does not exist"; "its template does not parse: <parser message>" |
| NFS9003 | Static, wrong element (error) | "<file>:<line>:<col>: NFS9003: <attr> on <tag> matches no selector of <Directive> ('<selector>'); move it to an element the selector names." |
| NFS9004 | Static, nothing to check (error) | "NFS9004: the program of <tsConfig> declares no Angular component, so nothing was checked. Check that <tsConfig> includes the project's components." |
| M9 | Missing package | The Variant tooling's M9: "the missing-imports <builder or generator> needs <package>. Install it: npm install --save-dev <package>@<range>" |
| M10 | Summary (builder) and setup summary (generator) | "ngx-foundation-sites: checked <n> components in <tsConfig>, skipped <m> (NFS9002), found <k> forgotten imports and <w> misplaced attributes." The generator: what it added per project, then "Add this step to CI: <step>." |

### Comparison with Angular Material, the CDK, Angular Aria, and prior art

| Concern | Prior art | This library | Why |
| --- | --- | --- | --- |
| Importing a family | Material: a per-component NgModule (`MatButtonModule`), kept for compatibility after its move to standalone declarables; Aria: classes and tokens only | Classes only (ADR 0046) | An exported array or module hides its members from the unused-imports diagnostic and the cleanup migration |
| A forgotten part | Aria: a part reports that a peer did not register ("must have an ngAccordionTrigger"), in a development `afterRenderEffect`, and cannot tell a forgotten import from missing markup | In-family checks that probe the peer's attribute and name the import | The DOM still carries the attribute of a directive that was never imported (PEER 1) |
| A forgotten parent | Aria's accordion trigger and ng-primitives' children require their parent: NG0201, in production too | Required where the part cannot stand alone; optional with a warning elsewhere; `strictParents` makes the optional ones throw in development only | NG0201 blanks the page or makes the server answer 404 in production (PEER 3) |
| A forgotten family or single directive | Nothing in Material, the CDK, Aria, or ng-primitives | `strictDirectiveImports` and the static check | No family code runs |
| Compile-time check | The compiler's extended diagnostics cover only `*` syntax (NG8116), from a fixed list with no registration point | A separate builder in CI | A library cannot add an extended diagnostic (STATIC 1) |
| Lint | angular-eslint template rules | Not adopted (ADR 0046) | Syntax alone cannot resolve scope: two misses and four false positives (STATIC 2) |

### Implementation level and primitives

Development code: custom Angular, because no Aria or CDK piece reports a forgotten import (Aria's checks read what registered, PEER 1). Primitives: `afterEveryRender` (a no-op on the server), `inject`, `ElementRef`, `provideEnvironmentInitializer`, the platform's `MutationObserver` (with `takeRecords()`), `Element.closest()` and `Element.matches()`, and Angular's development debugging API `ng.getOwningComponent`, marked `@publicApi` as part of the debugging global. No private Angular field is read.

Workspace tooling: TypeScript's public compiler API, `angular-html-parser`'s documented `parse()`, `@angular-devkit/architect` (`createBuilder`, `getTargetOptions`), and `@nx/devkit` with `convertNxGenerator` for the generator. The library's own oracle uses `@angular/compiler-cli`, which is never shipped.

### ARIA and keyboard

None: nothing here renders or takes input.

### WCAG 2.2 AA

The checks render nothing and change no markup, so no criterion applies to them. They exist partly for accessibility: a forgotten import removes the directive's ARIA as well as its look (a title without `aria-expanded`, a slide without its `inert` handling), a 4.1.2 failure that axe may not flag on an unstyled element, and the checks surface it in development and CI.

### Rendered output

None. The development code writes no DOM, no attribute, and no class, and adds no listener; its only output is console messages and, under `strictParents`, a thrown error.

### Rendering modes

- Server rendering and prerendering: the In-family checks and the scan register only `afterEveryRender` callbacks, which Angular makes no-ops on the server, so nothing reports there (RUNTIME 2 and PEER 3: no server log line in any run). `nfsDirectiveCheck` records hosts on the server too, which costs nothing and is never read. `strictParents` throws at construction on the server as in the browser, because it stands for a required injection.
- Before hydration: nothing runs; server HTML is checked only after the application's first client render.
- Hydration: the checks write no DOM, so hydration is unaffected (no hydration warning in any run, RUNTIME 2, PEER 3). Server HTML that Angular has not claimed yet is decided from the Structural class alone, or left undecided (verdict step 3).
- Incremental hydration: a `hydrate on ...` block is checked when it hydrates; in a `hydrate never` block, a forgotten directive with a Structural class is reported from the server HTML, and a class-less one never.
- `@defer`: a deferred block's content is checked when it renders; a directive imported only for a `@defer` block (a deferred dependency) is recorded when the block loads.
- Event replay: the checks declare no listener and replay nothing.
- The dev server: `ng serve` forwards browser console messages to its terminal, so every report also appears there, marked `(client)` (RUNTIME 2).

## Testing Decisions

A good test asserts what a developer observes: the console messages (text, count, and the element passed), a thrown error, the builder's exit status and output, and the workspace files the generator leaves; never the host record's or the scan's internal state. Prior art: the three prototypes' case matrices, which the tests keep, the Breakpoint service spec's Runtime-check tests and production-bundle measurement, and the Variant tooling's builder, generator, and workspace tests.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`, `npx nx test-storybook <lib>`)

No stories of their own: the checks render nothing. Layer 1 runs in Angular development mode, so every story of the library is a negative control: the Storybook preview fails a story whose render logs a forgotten-import or wrong-element report, because a story's `render()` template is outside the static check (the proposed storybook-conventions rule). An Anti-pattern story that demonstrates a forgotten import asserts its report in its play function instead.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

In `ngx-foundation-sites/media-query`'s tests, over the library's own directives as fixtures: `NfsButton` (a single directive with a Structural class), the Accordion (required parents), the Nested menu with the Dropdown Menu root (an optional parent, a hosted `NfsMenu`), `NfsSmoothScroll` (class-less), and the two `NfsColumn` classes (one class name). Each case that needs a first report of its own sits in its own test file, because reports are once per realm.

- Runtime check: a forgotten member, family, and single directive each report once with the directive, entry point, and owner (M1); a copied `class="button"` without `NfsButton` still reports; `<div nfsButton>` reports M3 whether `NfsButton` is imported or not; `nfsHighlight` and correct markup report nothing; three `@for` rows report once; an `@if` branch reports only after it renders; a `@defer` block reports after it loads, and a directive imported only for it reports nothing; an element projected by a page into a component that imports the directive reports, naming the page; `provideNfsRuntimeChecks({strictDirectiveImports: false})` silences it; with no library directive in the fixture, nothing reports until `provideNfsRuntimeChecks()` is provided, and then the forgotten `nfsButton` reports; `nfsMenu` beside an imported `nfsDropdownMenu` reports nothing.
- In-family checks: a forgotten child reports M2 once even though the scan sees it too; a forgotten optional parent reports on the ancestor; an item declared in another template and rendered inside the root reports M4; a part outside its parent reports M5 with the family's sentence; a part with no children reports nothing; a title shown later inside an existing item reports (the `afterEveryRender` case).
- `strictParents`: off, a menu item outside a root warns; on, it throws M8 at construction; on, items rendered through the template-outlet pattern with the root element's injector construct and register; the required Accordion items rendered the same way construct; an NG0201 for a required token carries its development description (M7).

### 3. Node-level Vitest

In the library's `test` target, and, for the workspace cases, in the tooling e2e project.

- SSR smoke: `renderServer()` over a fixture with a forgotten `nfsButton` and a forgotten accordion title resolves `whenStable()`, logs no report, and the HTML lacks `.button` and `.accordion-title`; with `strictParents` on, a menu item outside a root makes the render reject with M8.
- The Selector manifest generator: a fixture library's decorators give the expected JSON and module; rules 1 to 3 each fail the build on their case; the post-build assertion fails when a compiled selector, host class, or host directive differs from the manifest and when a directive is missing.
- The static check, over the prototypes' 47 case components (inline and external), the added cases for library host directives (`nfsMenu` beside `nfsDropdownMenu`, `nfsSmoothScroll` beside `nfsMagellan`), NFS9003 (`<div nfsButton>`, now expected once where the static prototype expected nothing), and the generated classes-only workspaces of 240 and 1000 components: every NFS9001 at the expected file, line, and column, none extra; every skip with its NFS9002 reason; the synthetic-manifest differential equal to the oracle's except `ngNonBindable`; NFS9004 on a program with no component; M9 without the parser.
- The builder under Architect's `TestingArchitectHost`: `buildTarget` and `tsConfig` resolution, the `spec` configuration, exit status on findings, and success with notices only.
- The setup generator on a virtual tree (Nx and Angular CLI layouts): the target, the `spec` configuration only where the file exists, the Nx cache inputs on the target and not in `targetDefaults`, the development dependency, and a second run that changes nothing.
- Workspace e2e, against the packed package in scratch Nx 23.2 and Angular CLI 22.2 workspaces: the generator writes the target; `nfs-imports` exits 1 with NFS9001 on a forgotten import and 0 after the fix; an array-importing component gives NFS9002 and a zero exit.
- The oracle, as its own target in the library's CI on every Angular minor (Implementation Decisions).

### 4. Playwright e2e (`npx nx e2e <fixture-app>-e2e` against the prerendered Fixture app)

The Fixture app is built in the development configuration, so the development checks run in it. A `forgotten-imports` route group holds the runtime matrix of RUNTIME 2 and PEER 3 as real routes: a forgotten member, family, and single directive; a class-less directive; a copied class; a wrong element; `@defer`; `hydrate on interaction` with the directive imported and forgotten; `hydrate never` with the directive forgotten; projection; an outlet template; the template-outlet pattern. In Chromium, Firefox, and WebKit, each route logs exactly its expected reports, and none before hydration for the imported cases; every other route of the Fixture app logs no forgotten-import report, which makes the whole library a negative control for false reports. The library's CI also runs `nfs-imports` over the Fixture app and asserts exactly the NFS9001 and NFS9003 findings of the `forgotten-imports` routes.

A production build of the Fixture app contains none of the checks' texts (`[strictDirectiveImports]`, `found by`, `[strictParents]`), no manifest-only attribute name, and no `getOwningComponent`, and a forgotten import there logs nothing and throws nothing, with or without `provideNfsRuntimeChecks({strictParents: true})`.

The Storybook half: none, because the static Storybook build runs in production mode (P23); layer 1 covers stories.

## Out of Scope

- An import array per entry point or per family (`NFS_ACCORDION`), and a Material-style NgModule per family: ruled out by the user (ADR 0046), because an array hides its members from the unused-imports diagnostic and the cleanup migration and prevents only a forgotten member. Category: `superseded`.
- Following arrays of any form, function-built `imports`, and spreads in the static check: ruled out by the user; such a component is skipped with NFS9002. Category: `scope-boundary`.
- NgModule-declared components in the static check: ruled out by the user; the library, the In-family checks, and the runtime check still support NgModule applications (ADR 0046). Category: `scope-boundary`.
- A third-party packaged directive that hosts a library directive: its host directives are visible only through compiled declaration types that Angular's policy marks private, and the user ruled the case out; writing the library attribute beside it and importing the library directive too is harmless, because Angular creates a directive reached both ways once. Category: `scope-boundary`.
- Templates no `@Component` declares (a story's `render()` template, `TestBed.overrideTemplate`, a JIT string) in the static check: there is no component to read; the library's stories are covered by layer 1's report guard, and a consumer's by the runtime check when they render. Category: `scope-boundary`.
- Shipping the compiler-based check: it relies on `@angular/compiler-cli` API that Angular's public-API policy does not cover (ADR 0046); it stays in the library's CI as the oracle. Category: `other`.
- An ESLint rule: syntax alone could not resolve scope (two misses and four false positives, STATIC 2), and it would add a published plugin (ADR 0046). Category: `other`.
- Required parent injection by default: a forgotten parent throws NG0201 in production too, blanking the page or making the server answer 404, and its message misleads for projected content (ADR 0046, PEER 3). Category: `other`.
- `strictDirectiveImports` and `strictParents` in production: the first reads Angular's development debugging global, and a thrown parent error in production is what ADR 0046 rejected. Category: `other`.
- An extended diagnostic, or any check inside `ng build`: Angular's extended checks are a fixed list with no registration point, and the application builder has no plugin point for a library's diagnostic (STATIC 1). Category: `other`.
- Editor feedback (a language-service plugin): no Angular extension point for it exists, and the Language Service already imports a directive whose attribute is picked from completion. Category: `other`.
- A directive on `ng-template` or `ng-container`, or used with `*`, at run time: the DOM holds no element with the attribute; the static check covers them. Category: `other`.
- Reporting unknown `nfs`-prefixed attributes (typos such as `nfsButon`): an attribute no library selector names is the consumer's, and the prefix mode reported the consumer's own `nfsHighlight` in every case measured (RUNTIME 2). Category: `other`.
- An ignore option for the static check: the library owns the `nfs` attribute prefix (ADR 0009), so a library attribute without its directive is always a defect, and the one false report the ruling leaves (the packaged host directive above) is fixed by importing the library directive; an option can be added in any release (ADR 0045). Category: `other`.
- Reporting array members a component never uses: there are no library arrays left to report on. Category: `superseded`.
- Writing `provideNfsRuntimeChecks()` into the application configuration from a generator: no `ng add` or install generator exists for the library ([Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md), Out of Scope), and editing an application configuration's providers needs AST edits of several bootstrap shapes; the install docs name the line, and a generator can add it in any release. Category: `scope-boundary`.

## Further Notes

### Design decisions

| # | Decision | Chosen | Alternatives not taken, and why |
| --- | --- | --- | --- |
| D1 | Imports | Entry points export classes and no import arrays (ADR 0046) | An array per entry point or family (the user's ruling; `superseded`) |
| D2 | Home of the development code | `ngx-foundation-sites/media-query`, beside `nfsVariantCheck` | The primary entry point (it imports nothing at runtime, Variant tooling D2; `other`); a new entry point (a second home for the Runtime checks' code; `other`) |
| D3 | Per-directive call | One `nfsDirectiveCheck(directive, family?)` behind an inline `ngDevMode` guard | Separate mark, parent, and child calls (three lines per part for one idea; `other`); an unguarded call returning `null` in production like `nfsVariantCheck` (the strings and peer lists would stay in production; `other`); a hoisted guard (kept 4336 B in production, PEER 4; `other`) |
| D4 | Peer data | Class names in the call; attributes, selectors, and entry points from the Selector manifest | Attributes written in each call (a second list that can drift from the selectors; `other`) |
| D5 | "Is the directive here" | Structural class, then Angular's owner for unclaimed HTML, then a development host record keyed by manifest class name | Angular's private compiled selector field (RUNTIME's hybrid; private API; `other`); `ng.getDirectives` compared by class name (development builds name classes `_Name`, and two `NfsColumn` collide, RUNTIME 2; `other`); the class probe alone (misses class-less directives and a copied class, RUNTIME 2; `other`) |
| D6 | Render hook | `afterEveryRender` read callbacks | `afterRenderEffect` (missed a late orphan, PEER 2; `other`); `afterNextRender` alone (missed `@if`, `@for`, `@defer`, and hydrating blocks, RUNTIME 1; `other`) |
| D7 | Scan scope | A first whole-document scan, then a `MutationObserver` with `takeRecords()` over added subtrees and undecided elements | A whole-document scan on every render (1.5 to 2.1 ms per render at 2,001 elements, 6 to 10 ms at 8,001, RUNTIME 3; `other`) |
| D8 | Report dedupe | One report function: once per element and directive, once per realm per subject, whichever check sees it first | A report per part that notices it (three reports for one forgotten item, PEER 2; `other`); a report per `@for` row (`other`) |
| D9 | Wrong element | Reported, by all three checks | Treated as a forgotten import (would ask for an import that changes nothing; `other`); ignored, as the static prototype's consumer-attribute case expected (the library owns the `nfs` prefix, ADR 0009; `other`) |
| D10 | Start without library directives | `provideNfsRuntimeChecks()` with an optional argument, in the install docs | A generator edit of the application configuration (no install generator exists; `scope-boundary`); running the scan in production to cover it (`other`) |
| D11 | `strictDirectiveImports` in production | Never | Through `provideNfsProductionRuntimeChecks` (needs the development global; the class probe alone would ship the manifest in every bundle, RUNTIME 4; `other`) |
| D12 | In-family checks' switch | None; development warnings | An opt-out (every report is a real defect or placement, PEER 6; `other`) |
| D13 | Family spec rule | One line per part: name, parent check, child probes, peers by reference or value, `strictParents` effect | A table of every family in this spec (a second place for each family's DI; `other`) |
| D14 | `strictParents` home | A field of `NfsRuntimeChecks`, off by default, development only | Its own provider function (a second configuration call for one flag; `other`); a Runtime check on by default (it throws, and would break every supported stand-alone form; `other`) |
| D15 | `strictParents` mechanism | The helper throws the library's own error at construction | `inject(token, {optional: !strict})` (NG0201 names only the token, and a class token as `_Name`, PEER 3; `other`); a deferred throw in a render callback (reaches `ErrorHandler` without breaking the view, which is not a required injection; `other`) |
| D16 | Which parts | Every optional parent injection whose `null` only degrades with a warning (the table) | Every optional injection (would throw for Triggers with a target, the Off-canvas sibling form, a field outside a form, a Responsive Menu without drilldown; `other`) |
| D17 | Token descriptions | Every parent token, development only, naming provider, entry point, and the same-template rule | The token name alone (NG0201 then says nothing about the import; `other`); descriptions in production too (strings in every bundle; `other`) |
| D18 | Parts projected across templates | The template-outlet pattern with the parent element's injector from `viewChild(Parent, {read: Injector})`, measured | The projecting component's own `inject(Injector)`, the guide's example (does not see providers on an element inside its view; `other`); a library directive that exposes an injector (API for one documented recipe; `other`) |
| D19 | Static check engine | TypeScript's public API, `angular-html-parser`, the check's own matcher (ADR 0046) | The compiler-based check (uncovered API; kept as the oracle; `other`); an ESLint rule (`other`) |
| D20 | Arrays | Every array skipped with NFS9002 (the user's ruling) | Following plain consumer `const` arrays (ruled out by the user; `scope-boundary`) |
| D21 | Library host directives | `hosts` in the Selector manifest | Reading the typings' compiled declaration types (private; `other`); ignoring them (a false NFS9001 on `nfsMenu` beside a root; `other`) |
| D22 | Manifest lookup | An index by attribute name from the start | A linear scan (about 120 ms more at 1047 components for 36 selectors, DOC 3, and the real manifest is about five times larger; `other`) |
| D23 | Microsyntax keys | The manifest generator rejects a secondary key in any library selector | Deriving keys with Angular's expression parser (an Angular API the check avoids; `other`) |
| D24 | Ignore option | None | A per-attribute or per-file ignore list (nothing supported needs it; additive later; `other`) |
| D25 | Zero-component guard | Fail when the program declares no component; succeed when all are skipped | Fail when nothing was checked (would fail a workspace for its import style alone; `other`) |
| D26 | Manifest generation | From sources before the build, asserted against the compiled declarations after it | From the compiled output only (the development module must be inside an early entry point's build; `other`); by hand (drifts; `other`) |
| D27 | Setup | Its own opt-in generator in the Variant tooling's collection, adding the target, Nx cache inputs, and the parser | A mode of `ngx-foundation-sites:variant-types` (a different input and a different opt-in; `other`); a sync generator (writes no file; `other`) |
| D28 | Oracle | The compiler-based check in the library's CI on every Angular minor | No oracle (twelve copied rules could drift in silence, DOC 6; `other`) |
| D29 | Stories | Layer 1 fails a story that logs a forgotten-import report | Nothing (no static check sees a story template; `other`) |

### Usage examples

A consumer's application configuration, which also starts the runtime check when a page instantiates no library directive:

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(withIncrementalHydration()),
    provideNfsRuntimeChecks(), // development only; returns no providers in production
  ],
};
```

A forgotten title in an accordion, and the report:

```ts
@Component({
  selector: 'app-faq',
  imports: [NfsAccordion, NfsAccordionItem, NfsAccordionContent], // NfsAccordionTitle forgotten
  template: `
    <ul nfsAccordion>
      <li nfsAccordionItem>
        <h2><button nfsAccordionTitle>Shipping</button></h2>
        <div nfsAccordionContent>Orders ship within two days.</div>
      </li>
    </ul>
  `,
})
export class Faq {}
```

```
ngx-foundation-sites: <button nfsAccordionTitle> has no NfsAccordionTitle, so it renders without its classes, ARIA, and behaviour. Add NfsAccordionTitle from 'ngx-foundation-sites/accordion' to the imports of the component whose template declares this element (Angular names Faq). Found by NfsAccordionItem.
```

(In the real Accordion the title binds `[panel]`, so this form also fails to compile with NG8002; the static-attribute form above is what no compiler reports.)

A library directive's call, the Accordion item as the worked example of the family rule:

```ts
export class NfsAccordionItem {
  readonly #accordion = inject(nfsAccordionToken); // required: NG0201 with its development description

  constructor() {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      nfsDirectiveCheck('NfsAccordionItem', { children: ['NfsAccordionTitle', 'NfsAccordionContent'] });
    }
  }
}
```

and the Nested menu item, whose parent is optional:

```ts
export class NfsMenuItem {
  readonly #root = inject(nfsMenuModeToken, { optional: true });

  constructor() {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      nfsDirectiveCheck('NfsMenuItem', {
        parent: {
          directives: ['NfsDropdownMenu', 'NfsAccordionMenu', 'NfsDrilldown', 'NfsResponsiveMenu'],
          found: this.#root !== null,
          alone: 'It binds no Nest or mode classes; its submenu shows as a plain nested Menu.',
        },
        children: ['NfsSubmenu', 'NfsSubmenuToggle'],
      });
    }
  }
}
```

Turning on `strictParents` in development:

```ts
provideNfsRuntimeChecks({ strictParents: true });
```

Setting up the static check, then CI:

```
npx nx g ngx-foundation-sites:missing-imports
npx nx run-many -t nfs-imports
```

```
npm install --save-dev nx @nx/devkit
npx ng g ngx-foundation-sites:missing-imports
npx ng run shop:nfs-imports
```

A CI run:

```
faq.html:3:9: NFS9001: nfsAccordionTitle matches NfsAccordionTitle, which Faq's imports do not include; import NfsAccordionTitle from 'ngx-foundation-sites/accordion'.
toolbar.ts:12:3: NFS9002: Toolbar is not checked: its imports hold an array (SHARED_IMPORTS). List each directive class in imports to have its template checked.
ngx-foundation-sites: checked 287 components in tsconfig.app.json, skipped 1 (NFS9002), found 1 forgotten imports and 0 misplaced attributes.
```

### Tooling changes to adopt when they arrive

- An Angular extension point for library diagnostics, or a documented template-scope API: the static check could ask Angular for each element's matched directives, as the oracle does, and drop the twelve copied rules.
- TypeScript's native port (TypeScript 7) with a different programmatic API: the check keeps TypeScript 6's API until then, as Angular's compiler does.
- An `inject()` option that follows content projection: the template-outlet pattern would no longer be needed for `strictParents` and the required injections.
- A public Angular API naming the directives on an element outside the debugging global: the host record could go.
