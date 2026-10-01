# Spec: forgotten-import checks (shared utility)

Ticket: [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md); revised for the later milestone by [Re-run: forgotten-import checks spec for the later milestone](../issues/164-rerun-forgotten-import-checks-later-milestone.md). Milestone: later. This spec is planned and implemented in a later milestone of the implementing repository, not in the first ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md); Problem Statement). Targets Angular 22.2, Nx 23.2, TypeScript 6.0.x, `angular-html-parser` 10.13.x, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, and Foundation for Sites 6.9.0. Decided upstream in [ADR 0046](../adr/0046-forgotten-imports-caught-by-checks.md) (no import arrays, four checks, the user's ruling of 2026-09-28; the four checks moved to a later milestone by the user's ruling of 2026-09-29), [Decide: family checks report a forgotten peer themselves](../issues/157-decide-family-checks-report-forgotten-peers.md) (`nfsReportForgottenPeer`), [ADR 0040](../adr/0040-variant-input-types.md) (the Runtime checks, which [Spec: Runtime checks (later milestone)](../issues/162-spec-runtime-checks-later-milestone.md) specifies for the same later milestone), [ADR 0039](../adr/0039-directives-manage-every-foundation-class.md) (the class rule), [ADR 0009](../adr/0009-nfs-prefix-and-token-naming.md) (the `nfs` prefix and token names), and [ADR 0045](../adr/0045-release-policy-devkit-version-scheme.md) (what may change in a minor); building-blocks 1.9 and the architecture guide's P23 and P24 as they stood before the checks moved. The decision log, with every question this spec asked itself and its triage, is in the ticket answer; the later-milestone revision's is in the re-run's answer.

Evidence is cited as: RUNTIME, STATIC, and PEER, the three prototypes of [Prototype: detecting a forgotten attribute directive import](../issues/145-prototype-missing-directive-import-checks.md) (the runtime manifest check, the static check over Angular's compiler, and the in-family checks), with their section numbers; DOC, [Prototype: a static import check on documented APIs only](../issues/149-prototype-documented-api-import-check.md), with its section numbers; and "this ticket's probe", the template-outlet measurement in this spec's ticket answer (Angular 22.2.0, prerendered and hydrated in Chromium).

## Problem Statement

A developer writes `<button nfsButton color="primary">Save</button>` and forgets to add `NfsButton` to the component's `imports`. Angular compiles the template without a word: a static attribute that matches no imported directive is plain HTML (the Angular team has said the compiler cannot make it an error, angular/angular#17874). The button renders without `.button`, its colour, its disabled contract, and its ARIA. A bound input on the missing directive (`[color]="tone"`) fails with NG8002 and an element selector fails with NG8001, but the static form, which most Foundation markup uses, fails silently.

Foundation's own JavaScript never had this failure: `Foundation.reflow` finds every `[data-<plugin>]` element for every registered plugin, so a Foundation developer never imports anything. The class rule makes it common here: every Foundation class becomes a directive attribute (ADR 0039), so every element of a card, a grid, or a menu carries an attribute whose directive the component must import, and the three failures look different:

- A forgotten member of a family (`NfsAccordionTitle` in a working accordion) renders one part unstyled and without its ARIA inside a family that otherwise works, which is easy to miss.
- A forgotten whole family or single directive runs no library code at all, so no check inside the family can report it.
- A template that never renders in development (a false `@if` branch, a route nobody opened, a `@defer` block whose trigger never fired) is never seen by any browser check.

The architecture guide's P24 had left an import array per entry point as the provisional answer. The user ruled against import arrays (ADR 0046): an exported array prevents only a forgotten member, costs about fifty public names, and hides its members from the unused-imports diagnostic and `ng generate @angular/core:cleanup-unused-imports`, because the compiler treats an exported array as possibly shared. The library instead catches a forgotten import with four checks, and developers need each of them specified precisely enough that it reports every forgotten import in its reach, names the fix, reports nothing for correct markup, and costs production nothing.

This spec is planned and implemented in a later milestone of the implementing repository, not in the first. The user ruled on 2026-09-29 ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)) that at the core of it a forgotten import is an issue Angular should correct, not a third-party Angular component library, and that the first milestone stays simpler and smaller in scope; every kind of check is still specified, because the user wants to analyse how each works in practice and weigh the kinds against each other. No WCAG criterion asks the library for these reports: WCAG's conformance requirements bind the pages the consumer ships, and ATAG 2.0's checking criteria are for authoring tools, which a component library is not. So the first milestone ships a library with nothing of this spec: a forgotten import renders the element without its directive, with no report, and each spec states the imports it needs as documented usage. No other spec depends on this one, names its checks, or links to it, so this spec is complete on its own: it holds the whole design, including every line the other specs gave these checks before they moved (Family entries, under Implementation Decisions, copied verbatim as of [Task: extract the checks from the specs](../issues/159-task-extract-checks-from-specs.md)), and its closing section lists what the later milestone adds back to each spec.

## Solution

Entry points export their directive classes and no import arrays, in the first milestone as in the later one (ADR 0046). In the later milestone the library ships four checks, all built on one list, the Selector manifest, which the library's build generates from its own directives:

- In-family checks, in development builds only: each part of a directive family reports a peer's element that carries the peer's attribute with no instance of it (a forgotten parent, a forgotten child), a parent that dependency injection cannot reach because the part is declared in another template, and a part that stands outside its parent. One call per directive, `nfsDirectiveCheck(...)`, behind an inline `ngDevMode` guard, runs them after every render. A family's own development check that looks for a peer's element ([Spec: family checks (later milestone)](../issues/160-spec-family-checks-later-milestone.md), and five checks of [Spec: misuse warnings (later milestone)](../issues/161-spec-misuse-warnings-later-milestone.md)) hands an element that carries the peer's attribute without its directive to `nfsReportForgottenPeer(...)`, which reports that forgotten import in the same form, so its report does not depend on `strictDirectiveImports`.
- The runtime manifest check `strictDirectiveImports`, the fourth Runtime check (ADR 0040), configured beside the Runtime checks of [Spec: Runtime checks (later milestone)](../issues/162-spec-runtime-checks-later-milestone.md): in development builds, after every render, it reports any rendered element that carries a library directive's attribute with no library directive on it, whether the import of a member, a whole family, or a single directive was forgotten, and any library attribute on an element that no selector of its directive admits. It is on by default with an opt-out, and never runs in production. It starts from the first library directive, or from `provideNfsRuntimeChecks()` when no library directive runs at all.
- The opt-in `strictParents` flag: in development builds, a part whose parent injection is optional throws at construction when no parent is found, instead of warning. A part that a component projects into its parent from another template then renders through a template outlet with the parent element's injector, a documented pattern this spec measured.
- The static check, opt-in, in CI: the `ngx-foundation-sites:missing-imports` Architect builder behind an `nfs-imports` target resolves each standalone component's `imports` with TypeScript's public compiler API, reads its template with `angular-html-parser`, and matches every element against the Selector manifest. It is the only check that sees templates that never render in development. It checks classes written directly in `imports` and skips, with the NFS9002 notice, a component whose `imports` hold an array of any form, a call, or a spread, and every NgModule-declared component (the user's ruling). A setup generator of the same name adds the target, and the library's own CI keeps a compiler-based check as an unshipped oracle.

Every report is made once per element and directive, in the browser console with the element attached, and names the directive, its entry point, and the component whose `imports` must change.

When the later milestone lands, each spec gets back the lines it gave these checks before they moved, with the changes this spec records (Further Notes, What the later milestone adds back, per spec).

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
32. As a library maintainer, I want the build to fail when two exported directives share a class name, or when a structural directive's selector names a secondary microsyntax key, so that the manifest's shortcuts stay safe.
33. As a library maintainer, I want the compiler-based check to run beside the documented one in the library's CI on every Angular minor, so that a copied Angular rule that drifts is caught before a release.
34. As a library maintainer, I want one development helper for every directive, so that each family's checks are one line and its guard is written the same way everywhere.
35. As a family spec author, I want a rule for listing my family's in-family checks, so that every family spec states its peers the same way.
36. As a library maintainer, I want every library story to fail when it logs a forgotten-import report, so that a story whose `moduleMetadata.imports` misses a directive is caught, since no static check sees a story's template.
37. As a library maintainer, I want every Fixture app route to log no forgotten-import report, so that the whole library is a negative control for false reports.
38. As a consumer who writes unit tests, I want each report once per test file at most, and an opt-out for my test setup, so that my test output stays readable.
39. As an application developer upgrading the library, I want a new directive in a release to be covered by the checks without any change on my side, so that the manifest travels with the package.
40. As an application developer who sets up the static check on the Angular CLI, I want a clear message naming the package to install when the parser is missing, so that the failure explains itself.
41. As an application developer, I want a family's own warning that looks for a peer (an auto-playing Orbit with no rotation control) to report the forgotten import instead when the peer's element is there without its directive, naming the import to add, so that the message never names the wrong fix.
42. As an application developer who switches `strictDirectiveImports` off, I want a forgotten peer that no child probe covers (a Drilldown wrapper, the Openable around a bare Trigger) still reported by the family's own check, so that the opt-out never leaves a forgotten import unreported.
43. As a library maintainer planning the later milestone, I want every In-family line, `nfsDirectiveCheck` call, token description, and `strictParents` line the specs gave before the checks moved in this spec, verbatim and with its spec named, so that I add each back without reading the history.
44. As a library maintainer, I want this spec planned on its own, beside the Runtime checks spec when both land and with that spec's configuration shape when it lands first, so that the later milestone can weigh each kind of check in practice.
45. As an application developer on the first milestone, I want a library that works without any of these checks, with each spec stating the imports its directives need, so that the first milestone stays small and I import each directive as its spec documents.
46. As an application developer, I want a development warning when a part that may stand alone (a menu item, a breadcrumb, a pagination item, a slider fill, an Orbit caption) sits outside its parent, saying what it loses there with the family's `alone` sentence, and a different report when the parent's import is forgotten or the part is declared in another template, so that I apply the right fix.

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
ngx-foundation-sites/media-query   (the Breakpoint service's entry point, and the Runtime checks', Spec: Runtime checks (later milestone))
  NfsRuntimeChecks: + strictDirectiveImports, + strictParents
  provideNfsRuntimeChecks(checks?)          now also starts the strictDirectiveImports scan
  provideNfsProductionRuntimeChecks(...)    accepts neither new key
  nfsDirectiveCheck(directive, family?)     for library directives, development builds only
  NfsFamilyPeers
  nfsReportForgottenPeer(element, directive, foundBy)   for library directives' own development checks, development builds only
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

- The development pieces live in `ngx-foundation-sites/media-query`, beside `nfsVariantCheck`, the Runtime checks' home ([Spec: Runtime checks (later milestone)](../issues/162-spec-runtime-checks-later-milestone.md)) and the precedent for a function exported for library directives. The entry point exists in the first milestone for the Breakpoint service, without any check. The primary entry point imports nothing at runtime ([Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md), D2), and the helper needs `@angular/core`. An entry point that had no reason to import `ngx-foundation-sites/media-query` (the Accordion) now imports `nfsDirectiveCheck` from it; the call sits behind the inline guard, so a production build keeps nothing of it (PEER 4, RUNTIME 3).
- The guard is written inline at every call site. A hoisted `const dev = typeof ngDevMode === 'undefined' || !!ngDevMode` kept 4336 B of check code and every message in the production bundle (PEER 4). Nothing in the development modules runs at module level: an `@Injectable` scan service and a module-level `new InjectionToken(...)` each kept the whole 30 kB checker in production (RUNTIME 3); the checker hangs off the existing root token whose factory returns the development checker behind `ngDevMode`, else `null` (the Runtime checks spec's mechanism, which the Breakpoint service spec held before the checks moved).
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
  2. No two exported directives share a class name, because the development record keys hosts by class name (below).
  3. No selector names a secondary microsyntax key: no attribute of any selector is the attribute of a directive that injects `TemplateRef` followed by an uppercase letter (the shape of `ngIfElse` after `ngIf`), because the static check does not derive those keys (DOC 4, rule 5).
- `hosts` is what lets the static check see a library directive that another library directive hosts (the menu roots and `NfsSubmenu` host `NfsMenu`, Magellan hosts `NfsSmoothScroll`), which the documented check cannot read from the typings, whose declaration types Angular's policy marks private (DOC 4).
- Size: about 170 attribute entries for the whole library; the development module is the development bundle's largest part of the checks (34 kB readable, 3.8 kB gzip for the prototype's 174 entries, RUNTIME 3). Its shape is internal and may be compacted.

### API: `nfsDirectiveCheck`, `nfsReportForgottenPeer`, and the shared development record

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

/**
 * For a library directive's own development check, development builds only. When `element` carries
 * one of `directive`'s attributes and the verdict is "missing" or "wrong element", reports it once
 * through the one report function (M2 or M3, "Found by <foundBy>.") and returns true; otherwise
 * returns false, and the caller gives its own message.
 */
export function nfsReportForgottenPeer(element: Element, directive: string, foundBy: string): boolean;
```

- `directive` and every name in `family` are Selector manifest class names.
- `nfsReportForgottenPeer` is for a family's own development check that looks for a peer's element ([Spec: family checks (later milestone)](../issues/160-spec-family-checks-later-milestone.md), and the five registration checks of [Spec: misuse warnings (later milestone)](../issues/161-spec-misuse-warnings-later-milestone.md) that the registration bullet below names; [Decide: family checks report a forgotten peer themselves](../issues/157-decide-family-checks-report-forgotten-peers.md)), called behind the same inline `ngDevMode` guard as `nfsDirectiveCheck`. `directive` and `foundBy` are Selector manifest class names; the helper takes the attributes, selectors, and entry point from the manifest, gives `element` the verdict below, and reports through the report function, which finds the owner component and makes the report at most once per element and directive. It runs whether or not `strictDirectiveImports` is on, because its report is the family's, not the runtime check's. The helper reads the attributes, selectors, entry points, and host classes from the manifest, so a directive passes names only.
- The host record: a development-only `WeakMap<Element, Set<string>>` of the class names of the library directives constructed on each element, filled by `nfsDirectiveCheck`. Only the directive itself adds to it. It replaces the runtime prototype's read of Angular's private compiled selector field (RUNTIME 1, approach B2): a hosted directive (`NfsMenu` under a root) and a directive reached through a consumer's `hostDirectives` construct and record themselves too.
- The verdict for one element and one library attribute on it, shared by both checks and by `nfsReportForgottenPeer`:
  1. Wrong element: no selector of any manifest directive listing the attribute matches the element (`element.matches(selector)`). Reported as a wrong-element misuse.
  2. Missing: every directive that lists the attribute and whose selector matches the element has a `hostClass`, and the element carries none of them. The server rendered the same template with the same imports, so its HTML carries the class exactly when the directive was there; this decides even for server HTML that has not hydrated (RUNTIME 2).
  3. Not yet claimed: Angular's development debugging API `ng.getOwningComponent(element)` returns `null` (server HTML of a block not hydrated yet, or of a lazy route whose chunk has not loaded). Present when the element carries one of those host classes, as the runtime prototype's hybrid measured; undecided otherwise, and looked at again on a later render. Without the `ng` global (a test environment that does not publish it), every element counts as claimed. The one miss this leaves: a Foundation class the consumer copied by hand onto unclaimed server HTML (a `hydrate never` block) reads as present.
  4. Otherwise: present when the host record holds any directive that lists the attribute; missing otherwise. A hosted library directive (`NfsMenu` under a root) records itself, because it runs its own constructor.
- One report function for both checks and for `nfsReportForgottenPeer`: at most one report per element and directive, and at most one per realm per subject (the directive, the kind of report, and the owning component), so a forgotten import in a 500-row `@for` warns once and the part that notices it second stays silent. Reports go to `console.warn(message, element)`.
- Owning component: `ng.getOwningComponent` names the component whose template declares the element for projected content, but the host that renders an outlet template rather than the template's declarer (RUNTIME 2), so the message says "the component whose template declares this element" and adds Angular's name in parentheses when there is one. The development build prints classes as `_Name`; the leading underscore is removed (PEER 3).

### In-family checks

Each part of a family checks its peers in an `afterEveryRender` read callback created in its own injection context, which Angular makes a no-op on the server. A part creates the callback only when it has children to probe or its parent injection returned `null`.

- Parent check, when `family.parent.found` is `false`: the nearest ancestor of the host that carries one of the parent directives' attributes or that the host record shows hosting one of them (a directive reached through a consumer's `hostDirectives` writes no attribute on its host).
  - An ancestor whose element the host record shows hosting a parent: the part is declared in another template (content projection or a template outlet) and dependency injection follows the declaration site; reported as out of reach, with the outlet pattern as the fix.
  - An ancestor that carries a parent's attribute and gets the verdict "missing": the parent's import was forgotten; reported on the ancestor, naming the parent directive (the report of the forgotten element, "found by" this part).
  - No such ancestor: the part stands outside its parent; reported with the family's `alone` sentence, or the default one. This is the development warning building-blocks 1.9 required for an optional parent before the checks moved; the later milestone restores that rule.
- Child probe, for each child directive: every element under the host that carries one of the child's attributes, whose nearest ancestor that carries one of this part's own attributes, or that the host record shows hosting this part, is this host (so a nested instance keeps its own children, and a part reached through a consumer's `hostDirectives` probes its own: a card component with `hostDirectives: [NfsCard]` probes the sections of its template), is given the verdict above, and a forgotten import or a wrong element is reported.
- Not reported: a part with no child at all. Under `@defer`, an empty `@for`, or an `@if` still false, that state is legal and temporary, and it fired before the children arrived on every such page (PEER 2).
- `afterEveryRender`, not Angular Aria's `afterRenderEffect`: an effect reruns only when a signal it read changes, so a forgotten title that appears later inside an existing item was never reported with it (PEER 2). Cost: about 1 ms more per development render at 500 accordion items (PEER 4).
- They are development warnings in the building-blocks 1.9 and P23 sense, not Runtime checks: every report is a real defect or a real placement, so they have no switch, and the `ng` global they read exists only in development (PEER 6). They run whether or not `strictDirectiveImports` is on.
- What they cannot see (PEER 7): a forgotten whole family or single directive (no family code runs), and peers linked by reference or by value rather than by the DOM (Tabs panels by `value`, `[nfsOpen]` targets, portals); the runtime check and the static check cover those.
- A family's own development check ([Spec: family checks (later milestone)](../issues/160-spec-family-checks-later-milestone.md) specifies each, apart from the Orbit's checks 1 and 3, the Off-canvas panel's check 3 (part a) and check 4, and the Triggers' check 1, which [Spec: misuse warnings (later milestone)](../issues/161-spec-misuse-warnings-later-milestone.md) specifies) reports a forgotten peer itself, through `nfsReportForgottenPeer`, as the next three bullets say ([Decide: family checks report a forgotten peer themselves](../issues/157-decide-family-checks-report-forgotten-peers.md), decisions 2 to 4, which replace the "says nothing" rule these bullets stated before).
- A family's own development check that reports placement from the DOM alone (building-blocks 1.9; the Media Object's check 3, the Sticky's warning 1, the XY Grid's check 2, and, by the same wording, the Top Bar's check 7 and the Tabs tab's warning for a parent that is not an `li[nfsTabsTitle]`) calls `nfsReportForgottenPeer` for a parent element that carries a parent directive's attribute without its host class, and gives its placement message only when the helper returns false: that element is a forgotten import, which the helper reports once with the import to add (M2, found by the part), so the placement message never names the wrong fix, and the report is made also where no probe covers the parent and `strictDirectiveImports` is off. A warning about a separate misuse that stays wrong once the import is added still reads such an element as the parent and still fires (an `offset` under a forgotten `nfsGridY`).
- A family's own development check that finds a peer by registration (the Drilldown's checks 1 and 2, the Nested menu's check 4, the Orbit's checks 1 and 3, the Off-canvas panel's check 3 and, by the same wording, its check 4 for a modal panel's close control (an element inside the panel that carries `nfsClose` or `nfsToggle` and registered nothing), the Triggers' check 1, the Abide label's and Form error's "no field resolves" warnings and its field's warning for an error state with no visible Form error) calls `nfsReportForgottenPeer` for each element it finds that carries the peer's attribute and registered nothing, and gives its own message only when no such element exists: a forgotten child, which its parent's child probe reports too, and a forgotten parent that no parent check covers, because its injection stays optional (the Drilldown wrapper, the Openable around a bare Trigger), are each reported once (M2, found by whichever sees it first), whether or not `strictDirectiveImports` is on, and the family message never names the wrong fix. Two cases keep their message as they are: a registration check that looks for no element, because its peer is linked only by a required reference whose forgotten import fails to compile (the Responsive Toggle's check 3: the bar reaches its menu through `[nfsResponsiveToggle]="menu"`, NG8002 or NG8003 when either import is forgotten), and a check that is the report for a truly bare part, with no element carrying the peer's attribute at all (the kept-optional case of the family rule's item 2).
- Every such report is made once per element and directive (D8), whichever of the child probe, the parent check, `strictDirectiveImports`, or the family's own check sees it first, and it is made whether or not `strictDirectiveImports` is on. A family check that reads a forgotten peer as present and finds nothing wrong makes no report of its own and needs no helper: the Switch's check 6 takes a previous sibling that carries the `nfsSwitchInput` attribute as the input, and `NfsSwitch`'s probe reports that input.
- A family's own development check that finds a peer of another family by that peer's class reads the peer directive's attribute too where one directive owns the class, so a forgotten import of that directive neither hides a misuse that stays once the import is added nor draws a message that names the wrong fix (the Top Bar's check 3 with `nfsButton` and `nfsCloseButton` beside `nfsMenuIcon`, the Visibility Classes' check 3 with an enclosing `nfsSticky`, the Close Button's check 3 with `nfsButton` on its element, the Dropdown pane's check 8 with an enclosing `nfsButtonGroup`); where any family's directive can be the peer, the check keeps its class read and its message names the forgotten-import case (the Flexbox Utilities' check 2).

What the later milestone adds to each family spec. In the first milestone no spec names these checks: each spec states the imports its directives need as documented usage (in an Imports bullet, or through its usage examples, which import every directive they write; the architecture guide's P24), gives each parent token its name as its description (`new InjectionToken<NfsOrbit>('nfsOrbitToken')`), and says nothing of a forgotten import's report. When this spec lands, each spec with more than one directive gets back, under Hierarchy and DI shape, its In-family check lines, one line per part:

1. The part's `nfsDirectiveCheck` name.
2. Its parent check: the parent directives (the provider and every directive that hosts it) when its parent injection is optional only so that a part outside its parent degrades (the table under `strictParents`), with the family's `alone` sentence if it has one; "none" when the injection is required, because NG0201 is the report (P23), with the token's description (below); "none" when the injection stays optional because its `null` is a supported form (the kept-optional list under `strictParents`), because a parent check would report that correct form as standing alone, and the family's own development check, if it has one, stays the report for the case that needs the parent and has none, while an element that carries the parent's attribute without its directive is reported by that check through `nfsReportForgottenPeer` (the bullet on checks that find a peer by registration, above; the Triggers' check 1, the Off-canvas panel's check 3).
3. Its child probes: the child directives it probes, or "none" for a leaf.
4. Its peers linked by reference or by value, which get no probe.
5. What `strictParents` changes for the part (the table below), or "nothing".

The lines each spec gets back are its entry under Family entries, below, as the specs gave them before the checks moved; beside them it gets back each parent token's development-only description (M7) in place of the plain name, the sentences elsewhere in the spec that name these checks, and the tests that exercised them, with the changes of decisions 2 to 4 of [Decide: family checks report a forgotten peer themselves](../issues/157-decide-family-checks-report-forgotten-peers.md) where they name a check of the family: the check's text says it calls `nfsReportForgottenPeer` for such an element and gives its own message only when the helper returns false; its In-family line and every sentence that says the check "says nothing", or leaves the report to `strictDirectiveImports` or a probe, follow; and its browser-level tests assert the M2 report in place of silence, with one case under `strictDirectiveImports: false` where no probe covers the peer. The closing section (Further Notes, What the later milestone adds back, per spec) lists all of it per spec.

A part probes only its own family's directives. A directive of another family written beside a part on one element, or inside it (a Callout beside the Abide alert, a Forms directive beside an Abide one, an `nfsButton` inside an input group button), is left to the runtime check and the static check, whose verdict decides each attribute on an element on its own.

A spec with a single directive and no parent, child, or peer gets back no line: building-blocks 1.9, once the later milestone restores its forgotten-imports bullet, gives the directive the call with its class name.

### Family entries, as the specs gave them

Each entry quotes the lines a spec gave these checks as committed at 53144f3, the commit of [Task: extract the checks from the specs](../issues/159-task-extract-checks-from-specs.md), whose extraction manifests (`research/checks-extraction-a.md` to `-f.md` and `-shared.md`) list the same checks with their tests and mentions. Each quote names its spec, its section, and its lines, and is verbatim, so it names this spec by its ticket, calls it "the shared spec", and still says "says nothing" where decisions 2 to 4 of [Decide: family checks report a forgotten peer themselves](../issues/157-decide-family-checks-report-forgotten-peers.md) change the text; the changes, the tests, and the other sentences each spec gets back are in the closing section. Three entries come from the specs rather than from a manifest: the Responsive Accordion Tabs' line, which the group d manifest recorded as having no entry of its own; the Equalizer token's description, which its manifest named without quoting; and the Breakpoint service's key declarations and sentences beside the two table rows its manifest quoted. The Variant declaration tooling's lines 418 and 587 come from the spec for the same reason. The last entry quotes the shared documents. The glossary's In-family check term is the shared manifest's `family:` entry, whose boundary call gives its content to this kind, as the family checks spec records.

#### Abide

[Spec: Abide](../issues/31-spec-abide.md), `specs/abide.md`:

Hierarchy and DI shape, lines 157-158:

````markdown
- `nfsAbideToken` (`InjectionToken<NfsAbide>`, lightweight, `import type`), provided by `NfsAbide` with `useExisting`. Its description, in development builds only, is "nfsAbideToken (provided by NfsAbide from 'ngx-foundation-sites/abide' on an ancestor element declared in the same template)" (`typeof ngDevMode === 'undefined' || ngDevMode ? "..." : ''`, M7 of the [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)). `NfsAbideInput` injects it `{optional: true}`: a field outside an `nfsAbide` form still works with the Defaults token policy and never counts as submitted. `NfsAbideAlert` injects it without `optional`: an alert outside a form is an error (NG0201, which prints that description).
- `nfsAbideLabelToken` (lightweight, `import type`), provided by `NfsAbideLabel`, with the description "nfsAbideLabelToken (provided by NfsAbideLabel from 'ngx-foundation-sites/abide' on an ancestor element declared in the same template)" in development builds only, in the same form. An input inside the label registers itself (`inject(nfsAbideLabelToken, {optional: true, skipSelf: true})`); a bare `nfsFormError` inside the label resolves its field through it. That form is for custom `FormValueControl` hosts only; a native control's Form error goes after the label with a reference (the development check).
````

Hierarchy and DI shape, lines 166-172:

````markdown
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part:
  - `NfsAbide` calls `nfsDirectiveCheck('NfsAbide', {children: ['NfsAbideInput', 'NfsAbideLabel', 'NfsFormError', 'NfsAbideAlert']})`: no parent check (it has no parent); it probes the four Abide parts inside the form, because their static forms (`nfsAbideAlert`, a bare `nfsAbideLabel` or `nfsFormError`, an `nfsAbideInput` that no reference names) compile without a word when their import is forgotten; no peers; `strictParents` changes nothing.
  - `NfsAbideInput` calls `nfsDirectiveCheck('NfsAbideInput')`: no parent check, because both its injections, `nfsAbideToken` and `nfsAbideLabelToken`, stay optional with a supported `null` (a field outside a form works with the Defaults token policy; only a custom control's label provides the label token), so it passes no parent and `strictParents` changes nothing; no child probes; peers: its label and Form errors linked by reference (`[nfsAbideLabel]="pw"` and `[nfsFormError]="pw"` with `#pw="nfsAbideInput"`), whose forgotten imports fail to compile (NG8002 for the binding, NG8003 for the reference), and the help text its `aria-describedby` names by id. A custom control that applies it through `hostDirectives` carries no `nfsAbideInput` attribute, so no probe looks for one, and the hosted directive records itself when it constructs.
  - `NfsAbideLabel` calls `nfsDirectiveCheck('NfsAbideLabel', {children: ['NfsAbideInput', 'NfsFormError']})`: no parent check (it injects no parent: a label outside a form works as its field does); it probes the input and the bare Form error of the wrapping-label form; peers: its field linked by reference, as above; `strictParents` changes nothing. Its warning when no field resolves finds the field by registration, so, by the shared spec's rule for such checks, it says nothing while the label holds an element that carries the `nfsAbideInput` attribute: that element is a forgotten import, which this label's probe reports once (M2); a label with no such element keeps the warning.
  - `NfsFormError` calls `nfsDirectiveCheck('NfsFormError')`: no parent check, because its `nfsAbideLabelToken` lookup stays optional with a supported `null` (a Form error linked by `[nfsFormError]="field"` needs no label), so it passes no parent and `strictParents` changes nothing; its warning when no field resolves stays the report for a bare Form error outside a label, and says nothing for a bare Form error whose nearest `label` ancestor carries the `nfsAbideLabel` attribute with no `NfsAbideLabel` on it, a forgotten import that `strictDirectiveImports` reports once (M1), as the Drilldown's check 1 does for its wrapper; no child probes; peers: its field linked by reference, as above. The field's warning for an error state with no visible Form error finds its Form errors by registration too, and says nothing while the field's wrapping label holds an element that carries the `nfsFormError` attribute with no `NfsFormError` on it, which the label's probe reports once (M2).
  - `NfsAbideAlert` calls `nfsDirectiveCheck('NfsAbideAlert')`: parent check none, because its `nfsAbideToken` injection is required and NG0201 is the report, with the token's description; no child probes; no peers; `strictParents` changes nothing.
  - The Forms, Callout, Button, and Visibility Classes directives written beside these on the same elements belong to other families: no Abide part probes them, and no Forms part probes an Abide one (decided with the [Spec: Forms](../issues/98-spec-forms.md)). The shared verdict decides each attribute on an element on its own, from the directives that list that attribute, so a forgotten `NfsFormLabel` beside a working `NfsAbideLabel`, or a forgotten `NfsAbideInput` beside a working `NfsInputGroupField`, is still reported. The development checks above resolve fields through DI and references, and the in-label check reads the `label` element, not a directive on it, so a forgotten neighbour changes none of their messages. No Abide part sits on `ng-template` or `ng-container`.
````

#### Accordion

[Spec: Accordion](../issues/15-spec-accordion.md), `specs/accordion.md`:

Hierarchy and DI shape, line 152:

````markdown
- Tokens: `nfsAccordionToken` and `nfsAccordionItemToken` are lightweight `InjectionToken`s typed with `import type` of the class (building-blocks 1.9, ADR 0009). Children inject them without `optional`: an item, title, or content outside its parent cannot work, because Aria's `AccordionTrigger` requires `ACCORDION_GROUP` and throws NG0201 anyway. Each has a description in development builds only, in M7's form (`typeof ngDevMode === 'undefined' || ngDevMode ? "..." : ''`): "nfsAccordionToken (provided by NfsAccordion from 'ngx-foundation-sites/accordion' on an ancestor element declared in the same template)" and "nfsAccordionItemToken (provided by NfsAccordionItem from 'ngx-foundation-sites/accordion' on an ancestor element declared in the same template)". No token is re-provided as `undefined`: every nested accordion is its own `nfsAccordion`, which provides its own tokens, so nothing registers upward.
````

Hierarchy and DI shape, lines 157-163:

````markdown
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part:
  - `NfsAccordion`: `nfsDirectiveCheck('NfsAccordion', {children: ['NfsAccordionItem']})`; no parent check (it has no parent); it probes `NfsAccordionItem`; no peers; `strictParents` changes nothing.
  - `NfsAccordionItem`: `nfsDirectiveCheck('NfsAccordionItem', {children: ['NfsAccordionTitle', 'NfsAccordionContent']})`; parent check none, because its `nfsAccordionToken` injection is required and NG0201 is the report, with the token's description; it probes `NfsAccordionTitle` and `NfsAccordionContent`; no peers; `strictParents` changes nothing.
  - `NfsAccordionTitle`: `nfsDirectiveCheck('NfsAccordionTitle')`; parent check none (its `nfsAccordionItemToken` injection is required, NG0201 with the token's description); no child probes; its content is a peer by reference, the `[panel]` binding, which needs no probe, because its forgotten form fails with NG8002; `strictParents` changes nothing.
  - `NfsAccordionContent`: `nfsDirectiveCheck('NfsAccordionContent')`; parent check none (required `nfsAccordionItemToken`, as the title's); no child probes; its title is the peer by reference above; `strictParents` changes nothing.
  - `NfsAccordionLazyContent` sits on `ng-template` and calls nothing, so only the static check sees a forgotten one.
  - The `nfsButton` controls of the stories and examples belong to another family: no accordion part probes them.
````

#### Accordion Menu

[Spec: Accordion Menu](../issues/20-spec-accordion-menu.md), `specs/accordion-menu.md`:

Hierarchy and DI shape, line 161:

````markdown
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsAccordionMenu` calls `nfsDirectiveCheck('NfsAccordionMenu', {children: ['NfsMenuItem']})`, the probe the [Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md) requires of every menu root, and its hosted `NfsMenu` probes `NfsMenuText` (the [Spec: Menu](../issues/85-spec-menu.md)); it has no parent check, because its injections are `self`, no peers, and `strictParents` changes nothing.
````

#### Breadcrumbs

[Spec: Breadcrumbs](../issues/88-spec-breadcrumbs.md), `specs/breadcrumbs.md`:

Hierarchy and DI shape, lines 116-118:

````markdown
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part:
  - `NfsBreadcrumbs`: `nfsDirectiveCheck('NfsBreadcrumbs', {children: ['NfsBreadcrumbsItem']})`; no parent check, because it injects none; it probes `NfsBreadcrumbsItem`; no peers; `strictParents` changes nothing.
  - `NfsBreadcrumbsItem`: `nfsDirectiveCheck('NfsBreadcrumbsItem', {parent})`, its development-only `inject(NfsBreadcrumbs, {optional: true})` giving `found`. Parent check over `NfsBreadcrumbs`, with the `alone` sentence "Foundation's disabled look applies only inside the trail." (Foundation scopes `.disabled` under `.breadcrumbs`), which replaces development check 7, so an item outside a trail is reported once. No child probes. No peers. `strictParents`: it throws at construction when no trail is found.
````

Development checks, line 164:

````markdown
7. No `NfsBreadcrumbs` above it in the injector tree: reported once by its In-family parent check (Hierarchy and DI shape), whose sentence says Foundation's disabled look applies only inside the trail; the item runs no check of its own for it.
````

#### Breakpoint service (shared utility)

[Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md), `specs/breakpoint-service.md`:

Hierarchy and DI shape, line 165:

````markdown
nfsDirectiveCheck(directive, family?)                       every library directive with an attribute selector, development builds only (forgotten-import checks)
````

Runtime checks, line 349:

````markdown
The library's Runtime checks (ADR 0040) live in this entry point beside the breakpoint drift check they grew from. There are four, and one flag, configured in the direction of NgRx's `runtimeChecks` (per-check flags over defaults), with this library's own production opt-in, which NgRx lacks; `strictDirectiveImports` and the `strictParents` flag are specified by the [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md):
````

Runtime checks, lines 359-362:

````markdown
  /** A rendered element carrying a library directive's attribute with no library directive on it, or on an element no selector of that directive admits. Development builds only. */
  strictDirectiveImports: boolean;
  /** Off by default. In development builds, a part whose optional parent injection found nothing throws at construction. A flag, not a Runtime check; development builds only. */
  strictParents: boolean;
````

Runtime checks, lines 375-376:

````markdown
/** Development overrides: every check but strictParents is on without this provider; it also starts strictDirectiveImports when no library directive runs; returns no providers when ngDevMode is false. */
export function provideNfsRuntimeChecks(checks?: Partial<NfsRuntimeChecks>): EnvironmentProviders;
````

Runtime checks, line 380:

````markdown
  checks: Partial<Omit<NfsRuntimeChecks, 'strictDirectiveImports' | 'strictParents'>>,
````

Runtime checks, lines 390-391:

````markdown
| `strictDirectiveImports` | A rendered element carrying a library directive's attribute with no library directive on it; a library attribute on an element no selector of its directive admits | The DOM, the development host record, the Selector manifest, `ng.getOwningComponent` | One `afterEveryRender` callback per application, started by the first library directive or by `provideNfsRuntimeChecks()` | Same form | Never (the production provider does not accept it) |
| `strictParents` (a flag, not a Runtime check) | Throws at construction when an optional parent injection that the forgotten-import checks list found nothing | The part's injection result | `nfsDirectiveCheck`, at construction, on the server and in the browser | Off; `provideNfsRuntimeChecks({strictParents: true})` opts in | Never |
````

Runtime checks, line 397:

````markdown
- `provideNfsRuntimeChecks()` also adds an environment initializer that starts the `strictDirectiveImports` scan, the only start for an application whose templates instantiate no library directive; its argument is optional, and the install docs put `provideNfsRuntimeChecks()` in every application configuration.
````

Solution, line 31 (fragment):

````markdown
`strictDirectiveImports` ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)) reports a rendered element that carries a library directive's attribute with no library directive on it.
````

Solution, line 31 (fragment):

````markdown
The same configuration holds the opt-in `strictParents` flag, which that spec owns.
````

Hierarchy and DI shape, line 176 (fragment):

````markdown
It also exports the Runtime-check API (`NfsRuntimeChecks`, `NfsRuntimeCheckReport`, `provideNfsRuntimeChecks`, `provideNfsProductionRuntimeChecks`, `nfsVariantCheck`, `NfsVariantCheck`, `NfsVariantNeed`, and the forgotten-import checks' `nfsDirectiveCheck` and `NfsFamilyPeers`), so every entry point with a Variant input or an attribute selector imports it too.
````

Runtime checks, line 395 (fragment):

````markdown
and `strictParents` is off.
````

Runtime checks, line 404 (fragment):

````markdown
`strictParents` is the exception: it acts at construction, on the server too.
````

#### Card

[Spec: Card](../issues/90-spec-card.md), `specs/card.md`:

Hierarchy and DI shape, line 98:

````markdown
- Injection: none. In development builds each directive's only code is its `nfsDirectiveCheck` call (In-family checks, below). There is no copied-class check, because the Card has no Variant or State class to strip and a redundant Structural class merges with the static host class (building-blocks 1.4), and no Runtime check, because there is no Variant property.
````

Hierarchy and DI shape, line 100:

````markdown
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsCard` calls `nfsDirectiveCheck('NfsCard', {children: ['NfsCardDivider', 'NfsCardSection', 'NfsCardImage']})` and probes its three parts, a nested card keeping its own; `NfsCardDivider`, `NfsCardSection`, and `NfsCardImage` each call `nfsDirectiveCheck` with their class name and probe nothing. No part has a parent check, because none injects a parent: a part outside a card is legal and not reported (above), so a forgotten `NfsCard` around imported parts is the `strictDirectiveImports` check's report and the static check's. No part has a peer linked by reference or value, and `strictParents` changes nothing. The entry point imports `nfsDirectiveCheck` from `ngx-foundation-sites/media-query` for this call alone; the call sits behind the inline `ngDevMode` guard, so a production build keeps nothing of it.
````

Design decisions, line 313:

````markdown
| D10 | No development checks of its own and no injection: no copied-class check, no placement check, no `alt` check; only the In-family checks' `nfsDirectiveCheck` call, which every library directive makes (ADR 0046) | The Card has no Variant or State class to strip, and redundant Structural classes merge (building-blocks 1.4); a misplaced part is harmless; axe `image-alt` reports a missing `alt` on every run | An `alt` check over the card's images (the image carries no library directive, and a walk over the card's content duplicates axe) (`platform-or-a11y`); a parent token with a warning for a part outside a card (nothing depends on the parent, and projection hides the DI context) (`other`) |
````

#### Drilldown Menu

[Spec: Drilldown Menu](../issues/22-spec-drilldown-menu.md), `specs/drilldown-menu.md`:

Hierarchy and DI shape, lines 168-171:

````markdown
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part; a hosted part probes from its host's element, because the shared spec's child probe also counts the host record:
  - `NfsDrilldown`: `nfsDirectiveCheck('NfsDrilldown', {children: ['NfsMenuItem', 'NfsDrilldownBack']})`. It probes every `NfsMenuItem` of its tree, as every menu root does (the Nested menu spec), and every `NfsDrilldownBack` in its levels; hosted by a ResponsiveMenu, it probes both from the responsive `ul`; its hosted `NfsMenu` probes `NfsMenuText`. No parent check: its `NfsDrilldownWrapper` injection stays optional, because a Responsive Menu whose rules do not name drilldown has no wrapper and development check 1 runs only while drilldown is the live mode, which construction cannot know (the shared spec's kept-optional list); its other injections are `self`. No peers: `scrollTopElement` is an element or a selector, not a library directive. `strictParents` changes nothing.
  - `NfsDrilldownWrapper`: `nfsDirectiveCheck('NfsDrilldownWrapper', {children: ['NfsDrilldown']})`; no parent check, because it injects none; it probes `NfsDrilldown`; no peers; `strictParents` changes nothing.
  - `NfsDrilldownBack`: `nfsDirectiveCheck('NfsDrilldownBack', {parent})`, its `inject(NfsDrilldown, {optional: true})` giving `found`. Parent check over `NfsDrilldown` and `NfsResponsiveMenu`, which hosts it, with the `alone` sentence "It stays hidden and closes no level.", which replaces development check 3's outside-a-drilldown-root case, so a back item outside a drilldown root is reported once. Its `NfsSubmenu` injection has no parent check, because `null` means the root's level, which every root provides on purpose; check 3 still reports a back item outside any submenu. No child probes. No peers. `strictParents`: it throws at construction when no drilldown root is found.
````

#### Dropdown Menu

[Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md), `specs/dropdown-menu.md`:

Hierarchy and DI shape, line 178:

````markdown
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsDropdownMenu` calls `nfsDirectiveCheck('NfsDropdownMenu', {children: ['NfsMenuItem']})`, the probe the [Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md) requires of every menu root, and its hosted `NfsMenu` probes `NfsMenuText` (the [Spec: Menu](../issues/85-spec-menu.md)); it has no parent check, because its injections are `self` and the root handle's optional `nfsTopBarRightToken` is context, not a parent ([ADR 0043](../adr/0043-menu-root-top-bar-right-section-token.md)); no peers; `strictParents` changes nothing.
````

#### Equalizer

[Spec: Equalizer](../issues/34-spec-equalizer.md), `specs/equalizer.md`:

Hierarchy and DI shape, line 143:

````markdown
- Parent handle: `nfsEqualizerToken = new InjectionToken<NfsEqualizer>(typeof ngDevMode === 'undefined' || ngDevMode ? "nfsEqualizerToken (provided by NfsEqualizer from 'ngx-foundation-sites/equalizer' on an ancestor element declared in the same template)" : '')`, its description in development builds only, declared with a type-only import of the class (building-blocks 1.9). `NfsEqualizer` provides it with `useExisting`.
````

Hierarchy and DI shape, line 146:

````markdown
- An `nfsEqualizerWatch` with no equalizer does nothing, and its In-family parent check (below) reports it once in development builds: as out of reach when an `nfsEqualizer` ancestor is declared in another template, and otherwise as standing outside any equalizer, with the family's sentence. DI follows the declaration site: an equalizer inside a child component's own template does not see watched elements projected into it; the equalizer goes on an element of the template that declares them, or on the projecting component's host, or the component renders them inside the equalizer's element through a template outlet with that element's injector (the shared spec's template-outlet pattern).
````

Hierarchy and DI shape, line 153:

````markdown
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsEqualizer` calls `nfsDirectiveCheck('NfsEqualizer', {children: ['NfsEqualizerWatch']})` and probes the `nfsEqualizerWatch` elements whose nearest `nfsEqualizer` ancestor is its host, so an inner group keeps its own, and the shared element of Foundation's nesting example, whose own `nfsEqualizer` is not its ancestor, belongs to the outer group, as its `skipSelf` registration does; it has no parent check. `NfsEqualizerWatch` calls `nfsDirectiveCheck('NfsEqualizerWatch', {parent: {directives: ['NfsEqualizer'], found: this.#equalizer !== null, alone: 'It belongs to no group, so no equalizer sets its min-height.'}})` and probes nothing; no library directive hosts `NfsEqualizer`, so it is the one parent directive, and the parent check replaces the spec's earlier "found no nfsEqualizer" warning, so the part reports once. Neither has a peer linked by reference or value (`register` and `unregister` go through the token). `strictParents` makes `NfsEqualizerWatch` throw the shared spec's `strictParents` error at construction, on the server as in the browser, when it found no equalizer, instead of warning and doing nothing; it changes nothing for `NfsEqualizer`. The token carries the development description every parent token has (the shared spec's D17), although this optional injection never throws NG0201.
````

#### Flexbox Utilities

[Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md), `specs/flexbox-utilities.md`:

Hierarchy and DI shape, line 135:

````markdown
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsFlexContainer`, `NfsFlexAlign`, and `NfsFlexChild` each call `nfsDirectiveCheck` with their class name (`nfsDirectiveCheck('NfsFlexChild')`), with no parent check, no child probes, and no peers, because no directive of the family needs another: any family's directive, or the consumer's CSS, makes an element a Flex parent, so `NfsFlexChild` has no parent directive to name and `NfsFlexContainer` no child part to probe, and the not-a-Flex-parent warning (check 2) reads the computed `display` instead. `NfsFlexAlign` makes its call in its own constructor also where `NfsFlexContainer` hosts it, so the host record shows it on that element and an `nfsFlexAlign` attribute written there is reported by no check, the static check reading the hosted directive from the Selector manifest's `hosts`. The Flex parents' and Flex children's own directives written beside these (`nfsGridX`, `nfsCell`, `nfsButtonGroup`, `nfsMediaObjectSection`) belong to other families: no part here probes them, and the runtime check and the static check decide each attribute on its own (the shared spec's family rule). `strictParents` changes nothing.
````

#### Forms

[Spec: Forms](../issues/98-spec-forms.md), `specs/forms.md`:

Hierarchy and DI shape, lines 143-149:

````markdown
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part:
  - `NfsInputGroup` calls `nfsDirectiveCheck('NfsInputGroup', {children: ['NfsInputGroupLabel', 'NfsInputGroupField', 'NfsInputGroupButton']})`: no parent check; it probes its three parts; no peers; `strictParents` changes nothing.
  - `NfsInputGroupLabel`, `NfsInputGroupField`, and `NfsInputGroupButton` each call `nfsDirectiveCheck` with their class name: no parent check (they inject no parent: a part outside a group only looks unjoined), no child probes (the `nfsButton` inside `nfsInputGroupButton` is the Button family's), and no peers; `strictParents` changes nothing.
  - `NfsFormLabel` calls `nfsDirectiveCheck('NfsFormLabel')`: no parent check, no child probes; peers: the control its `for` names by id, which its development check reads; `strictParents` changes nothing.
  - `NfsHelpText` calls `nfsDirectiveCheck('NfsHelpText')`: no parent check, no child probes; peers: the field whose `aria-describedby` lists its id, which its development check reads; `strictParents` changes nothing.
  - `NfsFieldset` calls `nfsDirectiveCheck('NfsFieldset')`, with no parent check, no child probes, and no peers, and `strictParents` changes nothing.
  - Beside the Abide directives (decided with the [Spec: Abide](../issues/31-spec-abide.md)): neither set probes the other's directives, and the shared verdict decides each attribute on an element on its own, from the directives that list that attribute, so a forgotten `NfsFormLabel` beside a working `NfsAbideLabel`, or a forgotten `NfsInputGroupField` beside a working `NfsAbideInput`, is still reported (the second by `NfsInputGroup`'s probe as well). The three development checks read the DOM and native properties only (`labels`, `control`, `aria-describedby`, `closest('label')`), and none of them looks for a library directive, so their messages hold when a neighbouring directive's import is forgotten: a consumer's static `aria-describedby` stays on a field whose `NfsAbideInput` is missing. No Forms directive sits on `ng-template` or `ng-container`.
````

#### Interchange

[Spec: Interchange](../issues/35-spec-interchange.md), `specs/interchange.md`:

Hierarchy and DI shape, line 146:

````markdown
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsInterchange` calls `nfsDirectiveCheck('NfsInterchange')`, with no parent check, no child probes, and no peers, and `strictParents` changes nothing; `NfsInterchangeOutlet` sits on `ng-container` and calls nothing, so only the static check sees a forgotten outlet.
````

#### Media Object

[Spec: Media Object](../issues/91-spec-media-object.md), `specs/media-object.md`:

Hierarchy and DI shape, line 118:

````markdown
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsMediaObject` calls `nfsDirectiveCheck('NfsMediaObject', {children: ['NfsMediaObjectSection']})` and probes its sections, a nested media object keeping its own; `NfsMediaObjectSection` calls `nfsDirectiveCheck('NfsMediaObjectSection')` and probes nothing. Neither has a parent check, because neither injects a parent: a section's placement is development check 3's DOM read (D10), which leaves a parent that carries `nfsMediaObject` without `.media-object`, a forgotten `NfsMediaObject`, to the `strictDirectiveImports` check and the static check. No peer is linked by reference or value; the Flexbox Utilities' and Thumbnail's directives written beside or inside belong to their own families and are not probed; `strictParents` changes nothing.
````

#### Menu

[Spec: Menu](../issues/85-spec-menu.md), `specs/menu.md`:

Hierarchy and DI shape, lines 135-137:

````markdown
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part:
  - `NfsMenu`: `nfsDirectiveCheck('NfsMenu', {children: ['NfsMenuText']})`. No parent check: it injects no parent. It probes `NfsMenuText` on a plain `ul[nfsMenu]` and, hosted, on every menu Plugin root and every `ul[nfsSubmenu]`, because the shared spec's child probe also counts the host record, in which a hosted `NfsMenu` records its host element. No peers linked by reference or value. `strictParents` changes nothing.
  - `NfsMenuText`: `nfsDirectiveCheck('NfsMenuText', {parent})`, its development-only `inject(NfsMenu, {optional: true})` giving `found`. Parent check over `NfsMenu` and every directive that hosts it: `NfsAccordionMenu`, `NfsDrilldown`, `NfsDropdownMenu`, `NfsResponsiveMenu`, and `NfsSubmenu`, with the `alone` sentence "It is unstyled outside a menu." (Foundation scopes `.menu-text` under `.menu`), which replaces development check 3's warning, so an item outside a menu is reported once. No child probes: it is a leaf. No peers. `strictParents`: it throws the shared spec's error at construction when no menu is found.
````

Development checks and runtime checks, line 186:

````markdown
3. `NfsMenuText` with no `NfsMenu` above it in its injector tree: reported once by its In-family parent check (Hierarchy and DI shape), whose sentence says the item is unstyled outside a menu; the directive runs no check of its own for it.
````

#### Nested menu (shared utility)

[Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md), `specs/nested-menu.md`:

Hierarchy and DI shape, lines 170-175:

````markdown
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part; a hosted part probes from its host's element, because the shared spec's child probe also counts the host record, and `nfsMenuModeToken`'s development-only description is under `NfsMenuRoot` and `nfsMenuModeToken` (API):
  - Each plugin root, `NfsAccordionMenu`, `NfsDrilldown`, `NfsDropdownMenu`, and `NfsResponsiveMenu` (the call is its spec's; this utility's consumer contract requires it): `nfsDirectiveCheck('<Root>', {children: ['NfsMenuItem']})`, probing every `NfsMenuItem` of its tree (the Drilldown also probes `NfsDrilldownBack`, its spec). No parent check: `nfsMenuModeToken` and the hosted `NfsMenu` are `self` injections of its own element, and the root handle's `nfsTopBarRightToken` is context, not a parent, and stays optional ([ADR 0043](../adr/0043-menu-root-top-bar-right-section-token.md)). A root hosted by `NfsResponsiveMenu` probes from the responsive `ul`, so `NfsResponsiveMenu` calls `nfsDirectiveCheck('NfsResponsiveMenu')` with its name only; the hosted `NfsMenu` probes `NfsMenuText` (the [Spec: Menu](../issues/85-spec-menu.md)). No peers. `strictParents` changes nothing.
  - `NfsMenuItem`: `nfsDirectiveCheck('NfsMenuItem', {parent, children: ['NfsSubmenu', 'NfsSubmenuToggle']})`, the shared spec's usage example. Parent check over `NfsAccordionMenu`, `NfsDrilldown`, `NfsDropdownMenu`, and `NfsResponsiveMenu`, `found` from `nfsMenuModeToken`, with the `alone` sentence "It binds no Nest or mode classes; its submenu shows as a plain nested Menu.", which replaces development check 5's item warning, so an item without a root is reported once. Its `NfsSubmenu` injection has no parent check, because `null` means the root's level, which every root provides on purpose. It probes `NfsSubmenu` and `NfsSubmenuToggle`. No peers. `strictParents`: it throws at construction when no root is found.
  - `NfsSubmenu`: no parent check, because `inject(NfsMenuItem)` is required and NG0201 is the report (a lookup by class, which the development build names `_NfsMenuItem` and no token description reaches). It probes `NfsMenuItem`, its items; its hosted `NfsMenu` probes `NfsMenuText`. No peers. `strictParents` changes nothing.
  - `NfsSubmenuToggle`: no parent check, for the submenu's reason (a required `inject(NfsMenuItem)`). It probes `NfsSubmenuToggleText`. No peers: `aria-controls` comes from the registered submenu. `strictParents` changes nothing.
  - `NfsSubmenuToggleText`: parent check over `NfsSubmenuToggle`, its development-only `inject(NfsSubmenuToggle, {optional: true})` giving `found`, with the `alone` sentence "Its visually hidden text names nothing outside a hybrid toggle.", which replaces the outside-any-toggle half of development check 3. No child probes. No peers. `strictParents`: it throws at construction when no toggle is found.
````

`NfsMenuRoot` and `nfsMenuModeToken`, line 218:

````markdown
`nfsMenuModeToken = new InjectionToken<NfsMenuRoot>(typeof ngDevMode === 'undefined' || ngDevMode ? "nfsMenuModeToken (provided by NfsAccordionMenu from 'ngx-foundation-sites/accordion-menu', NfsDrilldown from 'ngx-foundation-sites/drilldown-menu', NfsDropdownMenu from 'ngx-foundation-sites/dropdown-menu', or NfsResponsiveMenu from 'ngx-foundation-sites/responsive-menu', on an ancestor element declared in the same template)" : '')`, its description in development builds only and naming all four roots, because each provides the token through `nfsMenuRootProviders` from its own entry point (M7 of the [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md), in its form for a token several directives provide, as `nfsOpenableToken`'s), lives in a token file that imports `NfsMenuRoot` as a type only (building-blocks 1.9). `nfsMenuRootProviders(mode: NfsMenuMode): Provider[]` returns the two providers shown in the hierarchy.
````

#### Off-canvas

[Spec: Off-canvas](../issues/25-spec-off-canvas.md), `specs/off-canvas.md`:

Hierarchy and DI shape, line 175:

````markdown
- `nfsOffCanvasContentToken = new InjectionToken<NfsOffCanvasContent>(typeof ngDevMode === 'undefined' || ngDevMode ? "nfsOffCanvasContentToken (provided by NfsOffCanvasContent from 'ngx-foundation-sites/off-canvas' on an ancestor element declared in the same template)" : '')`, its description in development builds only (M7 of the [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), in a token file that imports only types (lightweight token). No panel token: nothing injects the panel by class; `nfsOpenableToken` serves descendants and `exportAs` serves templates. No wrapper token (D26).
````

Hierarchy and DI shape, lines 180-185:

````markdown
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part:
  - `NfsOffCanvas` calls `nfsDirectiveCheck('NfsOffCanvas')` under both selectors: no parent check, because its `nfsOffCanvasContentToken` injection stays optional with a supported `null`: a sibling panel binds `content` instead, and inputs are not set at construction, so it passes no parent. Development check 3 stays the report for a panel whose configuration needs a content and has none, the bare case the family rule's item 2 names. A panel inside an element that carries `nfsOffCanvasContent` without its directive has lost that content's import, which `strictDirectiveImports` reports with the import to add (M1), and a working wrapper's child probe (M2), so check 3 says nothing there (the shared spec's rule for a check that finds a peer by registration). No child probes: the close button, the Triggers, the title bar, and the menu inside the panel belong to other families, and an Openable probes no Trigger ([Spec: Triggers (shared utility)](../issues/54-spec-triggers.md)). Peers: its `content`, by reference (`[content]="page"` with `#page="nfsOffCanvasContent"`), whose forgotten import fails to compile with NG8003, and its overlay, which reaches it by reference (below); `strictParents` changes nothing (the kept-optional list of the forgotten-import checks spec).
  - `NfsOffCanvasContent` calls `nfsDirectiveCheck('NfsOffCanvasContent', {children: ['NfsOffCanvas']})`: no parent check (it injects none); it probes the panels nested in it, which reach it through dependency injection and often through no reference, so a nested panel whose import was forgotten is reported (M2); no peers of its own (a sibling panel names it by reference); `strictParents` changes nothing.
  - `NfsOffCanvasOverlay` calls `nfsDirectiveCheck('NfsOffCanvasOverlay')`: no parent check (its panel is a required reference, not an injection); no child probes; peers: its panel, by reference (`[nfsOffCanvasOverlay]="nav"`), so a forgotten overlay import fails to compile with NG8002 and a forgotten panel import with NG8003 on `#nav="nfsOffCanvas"`; `strictParents` changes nothing.
  - `NfsOffCanvasWrapper` calls `nfsDirectiveCheck('NfsOffCanvasWrapper', {children: ['NfsOffCanvas', 'NfsOffCanvasContent']})`: no parent check (it injects none and provides nothing, D26); it probes the panels and contents inside it, so a forgotten panel or content import inside a working wrapper is reported (M2) even where no reference names the element; no peers; `strictParents` changes nothing. A wrapper written as `nfsOffCanvasWrapper` whose own import was forgotten is reported by `strictDirectiveImports` (M1) and the static check, and development check 3 leaves it to them.
  - No Off-canvas directive sits on `ng-template` or `ng-container`.
````

#### Orbit

[Spec: Orbit](../issues/33-spec-orbit.md), `specs/orbit.md`:

Hierarchy and DI shape, line 169:

````markdown
- Parent handle: `nfsOrbitToken = new InjectionToken<NfsOrbit>(typeof ngDevMode === 'undefined' || ngDevMode ? "nfsOrbitToken (provided by NfsOrbit from 'ngx-foundation-sites/orbit' on an ancestor element declared in the same template)" : '')`, its description in development builds only (M7 of the [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), in the plugin's token file with an `import type` of the class; `NfsOrbit` provides it with `useExisting`. Every child with behaviour injects it without `optional`: none can exist outside an Orbit (building-blocks 1.9). The five class-only directives inject nothing in production, because a required injection would throw for a class holder that needs nothing from the Orbit; in development builds each looks the token up with `{optional: true}` for its In-family parent check, formerly dev check 8 (the Slider fill's shape). A nested Orbit inside a slide provides its own token, so its children bind to it; the token is never re-provided as `undefined`.
````

Hierarchy and DI shape, lines 178-182:

````markdown
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part:
  - `NfsOrbit` calls `nfsDirectiveCheck('NfsOrbit', {children: ['NfsOrbitRotation', 'NfsOrbitWrapper', 'NfsOrbitControls', 'NfsOrbitPrevious', 'NfsOrbitNext', 'NfsOrbitContainer', 'NfsOrbitSlide', 'NfsOrbitFigure', 'NfsOrbitImage', 'NfsOrbitCaption', 'NfsOrbitBullets', 'NfsOrbitBullet']})`: no parent check (it has no parent); it probes all twelve parts, because each depends on the root (the seven with behaviour inject its token, the five class-only ones look it up in development), a nested Orbit inside a slide keeping its own; no peers; `strictParents` changes nothing. Dev checks 1 and 3 (no rotation control, no bullets) stay the report for an Orbit that has no such element, and say nothing where the element they look for carries the part's attribute without its directive (a `button` carrying `nfsOrbitRotation`, an element carrying `nfsOrbitBullets`, or a bullet carrying `nfsOrbitBullet`): that is a forgotten import, which this probe reports once with the import to add (M2), so the defect is reported once and the Orbit's message never names the wrong fix (the shared spec's rule for a check that finds a peer by registration). The rotation control's `nfsButton` and the arrows' and bullets' `nfsShowForSr` belong to other families and are not probed.
  - `NfsOrbitRotation`, `NfsOrbitPrevious`, `NfsOrbitNext`, `NfsOrbitContainer`, `NfsOrbitSlide`, `NfsOrbitBullets`, and `NfsOrbitBullet` each call `nfsDirectiveCheck` with their class name (`nfsDirectiveCheck('NfsOrbitSlide')`): parent check none, because their `nfsOrbitToken` injection is required and NG0201 is the report, with the token's description; no child probes (the root probes every part); peers: each slide and the bullet of the same `value`, which no probe pairs (Aria reports a slide without a bullet and a bullet without a slide, and dev check 6 a repeated slide value); `strictParents` changes nothing. The slide, the bullets, and the bullet host Aria's `TabPanel`, `TabList`, and `Tab`, which inject Aria's `TABS` or `TAB_LIST` without `optional`, and Angular runs a host directive's constructor before its host's (the directive composition guide). With the root missing or its import forgotten, a part earlier in Foundation's markup order that hosts nothing (the rotation control, an arrow, or at the latest the container) throws first, with the description; a bullet inside an `nfsOrbitBullets` element whose import was forgotten throws Aria's NG0201 for `TAB_LIST`, which names no library directive, and the static check reports that import (NFS9001).
  - `NfsOrbitWrapper`, `NfsOrbitControls`, `NfsOrbitFigure`, `NfsOrbitImage`, and `NfsOrbitCaption` each call `nfsDirectiveCheck('<Class>', {parent: {directives: ['NfsOrbit'], found}})`, where `found` says whether their development-only `inject(nfsOrbitToken, {optional: true})` returned an Orbit, and the caption adds `alone`, "Outside an Orbit its caption band is positioned against whatever ancestor is positioned, so it can cover unrelated content.": the parent check replaces dev check 8, so a part outside any Orbit reports once (M5, with the caption's sentence), a part inside an Orbit element but declared in another template reports M4, and a part inside an `nfsOrbit` element whose `NfsOrbit` import was forgotten reports the root (M2); no child probes; no peers; under `strictParents` each throws M8 at construction when the lookup found no Orbit, in development builds only. M4 and the throw hold for a class-only part projected from another template although it needs nothing from the Orbit in production, as the shared spec's `strictParents` table says of class-only parts: every Orbit part with behaviour must be declared inside the `[nfsOrbit]` element in the same template (Rendering modes), so a projected Orbit already needs the template-outlet pattern, which gives the class-only parts the Orbit's injector too (the Slider fill's reasoning).
  - No Orbit directive sits on `ng-template` or `ng-container`.
````

#### Pagination

[Spec: Pagination](../issues/87-spec-pagination.md), `specs/pagination.md`:

Hierarchy and DI shape, lines 121-123:

````markdown
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part:
  - `NfsPagination`: `nfsDirectiveCheck('NfsPagination', {children: ['NfsPaginationPrevious', 'NfsPaginationNext', 'NfsPaginationEllipsis']})`; no parent check, because it injects none; it probes the three item directives; no peers; `strictParents` changes nothing. The Typography Helpers' `nfsTextAlign` written beside it belongs to another family and is not probed; the runtime and static checks decide it on its own.
  - `NfsPaginationPrevious`, `NfsPaginationNext`, `NfsPaginationEllipsis`: each calls `nfsDirectiveCheck` with its class name and a parent, its development-only `inject(NfsPagination, {optional: true})` giving `found`. Parent check over `NfsPagination`, with the `alone` sentence "Foundation lays out and draws pagination items only inside a pagination." (its item layout and `.ellipsis` glyph are scoped under `.pagination`), which replaces their outside-the-pagination warning, so an item outside a pagination is reported once. No child probes. No peers. `strictParents`: each throws at construction when no pagination is found.
````

Development checks, line 158:

````markdown
`NfsPaginationPrevious`, `NfsPaginationNext`, and `NfsPaginationEllipsis` with no `NfsPagination` above them in the injector tree are reported once, by their In-family parent check (Hierarchy and DI shape); they run no check of their own for it.
````

#### Progress Bar

[Spec: Progress Bar](../issues/95-spec-progress-bar.md), `specs/progress-bar.md`:

Hierarchy and DI shape, line 112:

````markdown
- Parent handle (building-blocks 1.9): `nfsProgressToken`, an `InjectionToken<NfsProgress>` in the entry point's tokens file with `import type`, provided by `NfsProgress` with `useExisting` and exported, so a consumer can provide an alternative (AGENTS.md). `NfsProgressMeter` injects it required, because a meter outside a progress bar has no value to show; outside one it fails with Angular's missing-provider error (NG0201), which prints the token's description, in development builds only "nfsProgressToken (provided by NfsProgress from 'ngx-foundation-sites/progress-bar' on an ancestor element declared in the same template)" (`typeof ngDevMode === 'undefined' || ngDevMode ? "..." : ''`, M7 of the [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)). Element injectors follow the template where the meter is declared, so a meter in a child component's template inside the bar finds it too.
````

Hierarchy and DI shape, lines 118-123:

````markdown
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part:
  - `NfsProgress` calls `nfsDirectiveCheck('NfsProgress', {children: ['NfsProgressMeter']})`: no parent check; it probes the meter; no peers; `strictParents` changes nothing.
  - `NfsProgressMeter` calls `nfsDirectiveCheck('NfsProgressMeter', {children: ['NfsProgressMeterText']})`: parent check none, because its `nfsProgressToken` injection is required and NG0201 is the report, with the token's description; it probes the meter text; no peers; `strictParents` changes nothing.
  - `NfsProgressMeterText` calls `nfsDirectiveCheck('NfsProgressMeterText')`: parent check none, because its injection of `NfsProgressMeter` is required; being by class, its NG0201 prints the class name (`_NfsProgressMeter` in a development build), the one form no token description reaches, which stays, because the name already says which directive to import and a token would add a public name for one message; no child probes; no peers; `strictParents` changes nothing.
  - `NfsProgressElement` calls `nfsDirectiveCheck('NfsProgressElement')`, with no parent check, no child probes, and no peers, and `strictParents` changes nothing.
  - `<meter>` has no directive, and no part sits on `ng-template` or `ng-container`. The development checks read their own host, and the meter text reads its meter's host through DI, so no check infers a part from its class, and a forgotten part changes none of their messages.
````

#### Prototyping Utilities

[Spec: Prototyping Utilities](../issues/102-spec-prototyping-utilities.md), `specs/prototyping-utilities.md`:

Hierarchy and DI shape, line 193:

````markdown
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): each of the eighteen directives calls `nfsDirectiveCheck` with its class name (`nfsDirectiveCheck('NfsPrototypeSpacing')`), with no parent check, no child probes, and no peers, because no directive of the family needs another on any element, and `strictParents` changes nothing.
````

#### Responsive Accordion Tabs

[Spec: Responsive Accordion Tabs](../issues/19-spec-responsive-accordion-tabs.md), `specs/responsive-accordion-tabs.md`:

Hierarchy and DI shape, line 186:

````markdown
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): none of the entry point's own. `NfsResponsiveAccordionTabs` has an element selector, so a forgotten import fails to compile (NG8001), and `NfsResponsiveAccordionTabsPanel` sits on `ng-template` and calls nothing, so only the static check sees a forgotten panel import (the component then renders no section and dev check 3 warns). The Accordion and Tabs directives the component's own template renders make their calls and probes by their specs' In-family lines, and the component imports every one of them.
````

#### Responsive Menu

[Spec: Responsive Menu](../issues/23-spec-responsive-menu.md), `specs/responsive-menu.md`:

Hierarchy and DI shape, line 176:

````markdown
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsResponsiveMenu` calls `nfsDirectiveCheck('NfsResponsiveMenu')` with its name only: its three hosted roots probe `NfsMenuItem`, and the hosted `NfsDrilldown` probes `NfsDrilldownBack`, from the responsive `ul`, because the child probe also counts the host record; it is a parent directive in the parent checks of `NfsMenuItem`, `NfsMenuText`, and `NfsDrilldownBack`; it has no parent check, no peers, and `strictParents` changes nothing.
````

#### Responsive Toggle

[Spec: Responsive Toggle](../issues/24-spec-responsive-toggle.md), `specs/responsive-toggle.md`:

Hierarchy and DI shape, lines 130-133:

````markdown
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part:
  - `NfsResponsiveToggle` calls `nfsDirectiveCheck('NfsResponsiveToggle')`: no parent check (it injects no parent); no child probes: the bare `nfsToggle` on the menu icon and the Top Bar spec's directives beside and inside the bar belong to the Triggers and Top Bar families, and an Openable probes no Trigger ([Spec: Triggers (shared utility)](../issues/54-spec-triggers.md)); peers: its menu, by the required reference `[nfsResponsiveToggle]="menu"` with `#menu="nfsResponsiveToggleMenu"`, so a forgotten `NfsResponsiveToggle` fails to compile with NG8002 and a forgotten `NfsResponsiveToggleMenu` with NG8003; `strictParents` changes nothing.
  - `NfsResponsiveToggleMenu` calls `nfsDirectiveCheck('NfsResponsiveToggleMenu')`: no parent check (it injects none; the bar reaches it by that reference and registers with it); no child probes (a Top Bar or Menu inside it is its own family); peers: the bar, by the same reference; `strictParents` changes nothing. Development check 3 (no registered title bar) reads a registration and keeps its message: the shared spec's rule silences a check that finds a peer by registration only where the element it looks for carries the peer directive's attribute, and check 3 looks for no element: the bar reaches the menu only through the required reference `[nfsResponsiveToggle]="menu"`, whose forgotten import on either side fails to compile (NG8002, NG8003).
  - No Responsive Toggle directive sits on `ng-template` or `ng-container`.
````

#### Reveal

[Spec: Reveal](../issues/18-spec-reveal.md), `specs/reveal.md`:

Hierarchy and DI shape, line 161:

````markdown
- `nfsRevealToken = new InjectionToken<NfsReveal>(typeof ngDevMode === 'undefined' || ngDevMode ? "nfsRevealToken (provided by NfsReveal from 'ngx-foundation-sites/reveal' on an ancestor element declared in the same template)" : '')`, its description in development builds only, in a token file that imports only types (building-blocks 1.9, ADR 0009): a component projected into the dialog injects it with `{optional: true}` to call `close(result)`, the declarative counterpart of injecting Material's `MatDialogRef`. A nested Reveal provides its own, so the nearest wins.
````

#### Slider

[Spec: Slider](../issues/32-spec-slider.md), `specs/slider.md`:

Hierarchy and DI shape, line 158:

````markdown
- Parent handle: `nfsSliderToken = new InjectionToken<NfsSlider>(typeof ngDevMode === 'undefined' || ngDevMode ? "nfsSliderToken (provided by NfsSlider from 'ngx-foundation-sites/slider' on an ancestor element declared in the same template)" : '')`, its description in development builds only (M7 of the [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), in the plugin's token file with an `import type` of the class; `NfsSlider` provides it with `useExisting`. A handle injects it without `optional`, so a handle outside a slider fails at construction with NG0201, which prints that description (building-blocks 1.9: the child cannot exist alone; a lone range input needs no directive). Inputs cannot contain inputs, so no nested slider exists and the token is never re-provided. The fill does not inject the token in production: it binds only its class and needs nothing from the container, so a misplaced fill is a development report of its In-family parent check, not a construction error (D24), unless `strictParents` is on in development.
````

Hierarchy and DI shape, lines 165-169:

````markdown
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part:
  - `NfsSlider` calls `nfsDirectiveCheck('NfsSlider', {children: ['NfsSliderHandle', 'NfsSliderFill']})`: no parent check; it probes the Handles and the fill, which matters for a Handle bound with `[formField]`, because a range input without `NfsSliderHandle` takes that binding on the native element path and compiles without a word; no peers; `strictParents` changes nothing.
  - `NfsSliderHandle` calls `nfsDirectiveCheck('NfsSliderHandle')`: parent check none, because its `nfsSliderToken` injection is required and NG0201 is the report, with the token's description; no child probes; no peers (its sibling Handle comes from the container's handle list, not from a reference); `strictParents` changes nothing.
  - `NfsSliderFill` calls `nfsDirectiveCheck('NfsSliderFill', {parent: {directives: ['NfsSlider'], found, alone}})`, where `found` says whether its development-only `inject(nfsSliderToken, {optional: true})` returned the slider and `alone` is "The nfs-slider Library mixin positions a fill only inside a slider (.slider > .slider-fill), so this one never shows the selected part of the track.": the parent check replaces development check 6, so a fill outside any slider reports once (M5 with that sentence), a fill inside a slider element but declared in another template reports M4, and a fill inside an `nfsSlider` element whose `NfsSlider` import was forgotten reports the container (M2); no child probes; no peers; under `strictParents` it throws M8 at construction when the lookup found no slider, in development builds only. The fill follows the Handles' same-template rule (Rendering modes, Hydration boundary), so M4's template-outlet fix is the one the Handles need anyway.
  - No Slider directive sits on `ng-template` or `ng-container`.
````

#### Sticky

[Spec: Sticky](../issues/28-spec-sticky.md), `specs/sticky.md`:

Hierarchy and DI shape, line 135:

````markdown
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsStickyContainer` calls `nfsDirectiveCheck('NfsStickyContainer', {children: ['NfsSticky']})` and probes the `nfsSticky` elements inside it; `NfsSticky` calls `nfsDirectiveCheck('NfsSticky')` and probes nothing (its sentinels are its own elements and carry no directive attribute). Neither has a parent check, because neither injects a parent (above): a sticky element may sit in any parent, and development warning 1 reads the parent's computed `position` from the DOM, leaving a parent that carries `nfsStickyContainer` without `.sticky-container`, a forgotten `NfsStickyContainer`, to the `strictDirectiveImports` check and the static check. No peer is linked by reference or value (`#s="nfsSticky"` is the consumer's read, and the bar, callout, and cell directives written beside belong to their own families); `strictParents` changes nothing.
````

#### Switch

[Spec: Switch](../issues/84-spec-switch.md), `specs/switch.md`:

Hierarchy and DI shape, lines 129-134:

````markdown
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part:
  - `NfsSwitch` calls `nfsDirectiveCheck('NfsSwitch', {children: ['NfsSwitchInput', 'NfsSwitchPaddle']})`: no parent check; it probes the input and the paddle; no peers; `strictParents` changes nothing.
  - `NfsSwitchInput` calls `nfsDirectiveCheck('NfsSwitchInput')`: no parent check (no directive of the family injects another: the cascade does the parent's work), no child probes; peers: its paddle, linked by the paddle's `for` (a value), which check 6 reads from the paddle's side and check 2 from the input's; `strictParents` changes nothing.
  - `NfsSwitchPaddle` calls `nfsDirectiveCheck('NfsSwitchPaddle', {children: ['NfsSwitchActive', 'NfsSwitchInactive']})`: no parent check; it probes the two inner labels; peers: its input, as above; `strictParents` changes nothing.
  - `NfsSwitchActive` and `NfsSwitchInactive` each call `nfsDirectiveCheck` with their class name, with no parent check, no child probes, and no peers, and `strictParents` changes nothing.
  - Check 6 reads the DOM alone, so it also takes a previous sibling that carries the `nfsSwitchInput` attribute as the input: an input whose `NfsSwitchInput` import was forgotten carries the attribute without the class, `NfsSwitch`'s probe reports it once (M2), and check 6 adds no second report saying the paddle does not follow its input, which it does. No Switch directive sits on `ng-template` or `ng-container`.
````

#### Table

[Spec: Table](../issues/92-spec-table.md), `specs/table.md`:

Hierarchy and DI shape, line 108:

````markdown
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsTableScroll` calls `nfsDirectiveCheck('NfsTableScroll', {children: ['NfsTable']})` and probes an `nfsTable` inside it, so a forgotten `NfsTable` in a wrapper is reported, as is an `nfsTable` on an element other than a `table`; a plain table carries no attribute and is never reported. `NfsTable` calls `nfsDirectiveCheck('NfsTable')` and probes nothing, because the caption, row groups, rows, and cells carry no directive. Neither has a parent check, because neither injects a parent and a table outside a wrapper is Foundation's usual form; neither has a peer linked by reference or value (a region's `aria-labelledby` names the consumer's caption, not a directive); `strictParents` changes nothing. The entry point imports `nfsDirectiveCheck` from `ngx-foundation-sites/media-query` for this call alone; the call sits behind the inline `ngDevMode` guard, so a production build keeps nothing of it.
````

#### Tabs

[Spec: Tabs](../issues/16-spec-tabs.md), `specs/tabs.md`:

Hierarchy and DI shape, line 156:

````markdown
- Lightweight tokens in the plugin's token file with `import type` only: `nfsTabsGroupToken` (`InjectionToken<NfsTabsGroup>`), `nfsTabsToken` (`InjectionToken<NfsTabs>`), `nfsTabsDefaultsToken` (`InjectionToken<NfsTabsDefaults>`, Shape B, injected optional). Each parent provides its token with `useExisting` (ADR 0009 naming). The two parent tokens carry a description in development builds only (M7 of the [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `nfsTabsGroupToken = new InjectionToken<NfsTabsGroup>(typeof ngDevMode === 'undefined' || ngDevMode ? "nfsTabsGroupToken (provided by NfsTabsGroup from 'ngx-foundation-sites/tabs' on an ancestor element declared in the same template)" : '')`, and `nfsTabsToken` the same with "nfsTabsToken (provided by NfsTabs from 'ngx-foundation-sites/tabs' on an ancestor element declared in the same template)"; the Defaults token is not a parent token.
````

Hierarchy and DI shape, lines 165-173:

````markdown
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part:
  - `NfsTabsGroup` calls `nfsDirectiveCheck('NfsTabsGroup', {children: ['NfsTabs', 'NfsTabsContent', 'NfsTabsPanel']})`: no parent check (it has no parent); it probes the strip, the content box, and the panels, the three parts that inject its token, a tab set nested in a panel keeping its own; no peers; `strictParents` changes nothing.
  - `NfsTabs` calls `nfsDirectiveCheck('NfsTabs', {children: ['NfsTabsTitle', 'NfsTab']})`: parent check none, because its `nfsTabsGroupToken` injection is required and NG0201 is the report; it probes the titles, which inject nothing, and the tabs, which inject its token; no peers; `strictParents` changes nothing.
  - `NfsTabsTitle` calls `nfsDirectiveCheck('NfsTabsTitle')`: no parent check (it injects no parent; the strip probes it); no child probes (the strip probes its tab); no peers; `strictParents` changes nothing.
  - `NfsTab` calls `nfsDirectiveCheck('NfsTab')`: parent check none, because its `nfsTabsToken` injection is required; no child probes; peers: its panel, paired by `value`, which no probe checks (Aria warns on a repeated value); `strictParents` changes nothing. Its development warning for a tab whose parent element is not an `li[nfsTabsTitle]` reads the element and the attribute, so a title whose `NfsTabsTitle` import was forgotten does not trip it: an `li` that carries the `nfsTabsTitle` attribute without `.tabs-title` is a forgotten import, which the strip's probe reports once (M2), the shared spec's rule for a family check that reports placement from the DOM alone.
  - `NfsTabsContent` calls `nfsDirectiveCheck('NfsTabsContent')`: parent check none, because its `nfsTabsGroupToken` injection is required, with the token's description; no child probes (the group probes the panels, which register with the group, not with the content box); no peers; `strictParents` changes nothing.
  - `NfsTabsPanel` calls `nfsDirectiveCheck('NfsTabsPanel')`: parent check none, because its `nfsTabsGroupToken` injection is required; no child probes; peers: its tab, by `value`; `strictParents` changes nothing.
  - `NfsTabsLazyContent` sits on `ng-template` and calls nothing, so only the static check sees a forgotten one.
  - The NG0201 a developer sees: `NfsTabs`, `NfsTab`, and `NfsTabsPanel` host Aria's `TabList`, `Tab`, and `TabPanel`, which inject Aria's own `TABS` or `TAB_LIST` token without `optional`, and Angular runs a host directive's constructor before its host's (the directive composition guide, "Directive execution order"). A strip or panel outside a group, or a tab outside a strip, including under an element whose `NfsTabsGroup` or `NfsTabs` import was forgotten, therefore throws Aria's NG0201 for `TABS` or `TAB_LIST`, which names no library directive, before the part's own injection runs, and the view throws before the probes or `strictDirectiveImports` see a render. The two descriptions are printed where the library's injection is the first to fail: `NfsTabsContent` outside a group (it hosts nothing), and a part under a consumer's own Aria `ngTabs` or `ngTabList`. The static check reports a forgotten `NfsTabsGroup` or `NfsTabs` (NFS9001).
````

#### Toggler

[Spec: Toggler](../issues/17-spec-toggler.md), `specs/toggler.md`:

Hierarchy and DI shape, line 139:

````markdown
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsToggler` calls `nfsDirectiveCheck('NfsToggler')` and `NfsClassToggler` calls `nfsDirectiveCheck('NfsClassToggler')`, each with no parent check, no child probes, and no peers (a Trigger reaches either by template reference or as the Nearest Openable, links the Triggers spec lists), and `strictParents` changes nothing.
````

#### Top Bar

[Spec: Top Bar](../issues/86-spec-top-bar.md), `specs/top-bar.md`:

Hierarchy and DI shape, line 154:

````markdown
- `nfsTopBarRightToken` is the one token. It is a lightweight token (building-blocks 1.9): a menu root imports the token, not the directive class. Its description exists in development builds only, in the M7 form of the [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md): `new InjectionToken<NfsTopBarRight>(typeof ngDevMode === 'undefined' || ngDevMode ? "nfsTopBarRightToken (provided by NfsTopBarRight from 'ngx-foundation-sites/top-bar' on an ancestor element declared in the same template)" : '')`. A menu that reaches the right-hand section only through content projection finds no token; the Nested menu root then reads the section from the DOM after hydration and, in development builds, warns naming `alignment="right"`, which puts the side in the server HTML (D9). (The removed advice has no good value to offer: the token's value is the directive instance, and a second `nfsTopBarRight` inside the section binds `.top-bar-right` twice.)
````

Hierarchy and DI shape, lines 158-162:

````markdown
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part. Each of the nine calls `nfsDirectiveCheck` with its class name; none injects a parent, so none has a parent check, and `strictParents` changes nothing for any of them:
  - `NfsTopBar`: `nfsDirectiveCheck('NfsTopBar', {children: ['NfsTopBarLeft', 'NfsTopBarRight', 'NfsTopBarTitle', 'NfsMenuIcon']})`, probing its sections, its title, and a menu icon inside it. No peers.
  - `NfsTitleBar`: `nfsDirectiveCheck('NfsTitleBar', {children: ['NfsTitleBarLeft', 'NfsTitleBarRight', 'NfsTitleBarTitle', 'NfsMenuIcon']})`, probing its sections, its title, and its menu icons. No peers.
  - `NfsTopBarLeft`, `NfsTopBarRight`, `NfsTitleBarLeft`, `NfsTitleBarRight`: no parent check, because a section injects no bar (D13); development check 7 reads its bar from the DOM. No child probes. No peers. `NfsTopBarRight` provides `nfsTopBarRightToken`, which the Nested menu root injects optionally as context, not as a parent, and which stays optional ([ADR 0043](../adr/0043-menu-root-top-bar-right-section-token.md)).
  - `NfsTopBarTitle`, `NfsTitleBarTitle`, `NfsMenuIcon`: leaves, with no parent check, no child probes, and no peers; the Trigger written beside a menu icon links to its Openable, not to the icon.
````

#### Triggers (shared utility)

[Spec: Triggers (shared utility)](../issues/54-spec-triggers.md), `specs/triggers.md`:

Hierarchy and DI shape, line 130:

````markdown
- The contract is a lightweight token: `nfsOpenableToken = new InjectionToken<NfsOpenable>(typeof ngDevMode === 'undefined' || ngDevMode ? "nfsOpenableToken (provided by NfsReveal from 'ngx-foundation-sites/reveal', NfsOffCanvas from 'ngx-foundation-sites/off-canvas', NfsDropdownPane from 'ngx-foundation-sites/dropdown-pane', NfsToggler or NfsClassToggler from 'ngx-foundation-sites/toggler', NfsResponsiveToggle from 'ngx-foundation-sites/responsive-toggle', NfsTooltip from 'ngx-foundation-sites/tooltip', or a component that implements NfsOpenable, on an ancestor element declared in the same template)" : '')` typed by an exported interface, its description in development builds only (M7 of the [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), in a token file that imports only types. The description names every library Openable and ends with the application's own implementations, because several directives provide the token and a consumer's wrapper component may too ([ADR 0013](../adr/0013-triggers-target-resolution.md)); the library injects it only optionally, so the description serves an application's own required `inject(nfsOpenableToken)`, and an Openable added in a later release adds itself to the list. Trigger inputs are typed by the interface too, so a Trigger retains no Openable class and an Openable retains no Trigger (the lightweight-injection-token guide; Material's `MatMenuPanel` interface behind `matMenuTriggerFor`; Aria's `import type` token files). An interface rather than the guide's abstract class, because consumers implement it (wrapper components) without extending a library class.
````

Hierarchy and DI shape, lines 137-140:

````markdown
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part:
  - `NfsOpen` calls `nfsDirectiveCheck('NfsOpen')`: no parent check, because it injects no parent (its target is a required reference); no child probes; peers: its targets, linked by reference (`[nfsOpen]="signup"` with `#signup="nfsReveal"`, or an array of references), so a forgotten `NfsOpen` fails to compile with NG8002 on the binding and a forgotten Openable with NG8003 on the reference; `strictParents` changes nothing.
  - `NfsClose` calls `nfsDirectiveCheck('NfsClose')` and `NfsToggle` calls `nfsDirectiveCheck('NfsToggle')`: no parent check, because their Nearest Openable injection stays optional with a supported `null`: a bound target replaces it, and inputs are not set at construction, so construction cannot tell whether the Trigger needs the Nearest Openable and passes no parent. Development check 1, which runs after the inputs are set, stays the report for a bare Trigger with no Nearest Openable and no element around it that carries an Openable's attribute; where the enclosing element carries one whose directive was not imported, check 1 says nothing and `strictDirectiveImports` reports that element with the import to add (M1), the shared spec's rule for a check that finds a peer by registration. No child probes; peers: their bound targets, linked by reference as for `NfsOpen`; `strictParents` changes nothing (the kept-optional list of the forgotten-import checks spec).
  - An Openable probes no Trigger, and a Trigger probes nothing: a Trigger reaches its Openable by template reference or as the Nearest Openable, and the classes on its host belong to the directive beside it (`nfsButton`, `nfsCloseButton`, `nfsMenuIcon`), another family, so a bare `nfsClose` or `nfsToggle` whose import was forgotten is reported by `strictDirectiveImports` and the static check. No Trigger sits on `ng-template` or `ng-container`.
````

#### Typography Helpers

[Spec: Typography Helpers](../issues/106-spec-typography-helpers.md), `specs/typography-helpers.md`:

Hierarchy and DI shape, line 167:

````markdown
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsTextAlignment`, `NfsTypographyHelpers`, `NfsNoBullet`, `NfsTypographyBase`, and `NfsPrintStyles` each call `nfsDirectiveCheck` with their class name, with no parent check, no child probes, and no peers, and `strictParents` changes nothing.
````

Notes, line 593:

````markdown
- A forgotten import: a static `nfsPrintBreakInside` without `NfsPrintStyles` in the template's `imports` sets nothing, and the loss shows only on paper; in development the `strictDirectiveImports` Runtime check reports the attribute on screen and the opt-in static check reports it in CI ([ADR 0046](../adr/0046-forgotten-imports-caught-by-checks.md)), the usage example names the import, and the `--print-breaks` e2e case covers the library's own stories (the architecture guide's P24).
````

#### Variant declaration tooling

[Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md), `specs/variant-declaration-tooling.md`:

Registry to property and input mapping: the Variant manifest, line 136:

````markdown
The Variant manifest is a JSON document inside the package, read by the tooling from its own install location, never exported through the package's `exports` and never loaded by application code. It is the one list the library's Sass, types, generator, and typings check agree on. The package ships a second JSON document under the same rules, the Selector manifest of [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md), which the `ngx-foundation-sites:missing-imports` builder reads; that spec owns its shape and its build steps. Its shape:
````

Hierarchy and package shape, lines 197-199:

````markdown
  Selector manifest (JSON), for the forgotten-import checks
    <- setup generator  ngx-foundation-sites:missing-imports   (package "generators"; "schematics" via convertNxGenerator)
    <- builder          ngx-foundation-sites:missing-imports   (package "builders": Angular CLI and Nx)
````

Workspace configuration, line 418:

````markdown
- Dependencies: the Variant tooling adds no dependency to applications and no `dependencies` entry to the package; the opt-in `ngx-foundation-sites:missing-imports` setup adds `angular-html-parser`, an optional peer dependency of the package, to a workspace's `devDependencies` ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)). It loads, only when it runs: `sass-embedded` (or `sass`) and `esbuild`, both dependencies of `@angular/build`, and `typescript` (in every Angular workspace), `@angular-devkit/architect` (the builder), `nx` and `@nx/devkit` (the generators; optional peer dependencies of the package at the Nx major the release is tested with, `^23.0.0` first), and `prettier` if installed. A missing package ends the run with M9 naming the install command. The schematic therefore needs `nx` and `@nx/devkit` as development dependencies on an Angular CLI workspace (36 MB on win32-arm64, SYNC 5.3); the check builder does not.
````

Design decisions, line 587:

````markdown
| D22 | Packaging | CommonJS tooling beside the Angular entry points; generators and schematics in one collection; one Architect builder per tool for both workspace kinds (`variant-types`, and `missing-imports` of the forgotten-import checks) | A separate tooling package (a second version to keep in step with the manifest); an Nx executor beside the builder (two implementations of the check) |
````

#### Visibility Classes

[Spec: Visibility Classes](../issues/104-spec-visibility-classes.md), `specs/visibility-classes.md`:

Hierarchy and DI shape, line 140:

````markdown
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsVisibility`, `NfsShowForSr`, and `NfsShowOnFocus` each call `nfsDirectiveCheck` with their class name, with no parent check, no child probes, and no peers, and `strictParents` changes nothing.
````

#### XY Grid

[Spec: XY Grid](../issues/99-spec-xy-grid.md), `specs/xy-grid.md`:

Hierarchy and DI shape, line 135:

````markdown
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), in development builds only: `NfsGridContainer` calls `nfsDirectiveCheck('NfsGridContainer', {children: ['NfsGridX', 'NfsGridY']})` and probes the grids it holds, because Foundation's container exists to contain a grid ("To contain it horizontally use the `grid-container` class") and reaches its padding grid through `.grid-container:not(.full) > .grid-padding-x`; `NfsGridX` and `NfsGridY` each probe their cells (`nfsDirectiveCheck('NfsGridX', {children: ['NfsCell']})`, and the same for `NfsGridY`); `NfsCell` calls `nfsDirectiveCheck('NfsCell')` and probes nothing, because a cell holds the consumer's content and a grid nested in it is a grid of its own, as the Accordion's content probes no nested accordion. No part has a parent check, because none injects a parent (a cell outside a grid is check 2's, read from the DOM), and none has a peer linked by reference or value; the probes read the DOM in development only, so production keeps no link (D14); `strictParents` changes nothing.
````

#### Shared documents

`building-blocks.md`:

1.9 DI patterns, line 143:

````markdown
- Forgotten imports (2026-09-28, [ADR 0046](adr/0046-forgotten-imports-caught-by-checks.md), [Spec: forgotten-import checks (shared utility)](issues/150-spec-forgotten-import-checks.md)): entry points export their directive classes and no import arrays. Every library directive and component with an attribute selector calls `nfsDirectiveCheck('<Class>', family?)` from `ngx-foundation-sites/media-query` once, from its constructor, inside an inline `if (typeof ngDevMode === 'undefined' || ngDevMode)` block (a hoisted guard kept the checks in production bundles); the call records its host for the `strictDirectiveImports` Runtime check and runs its In-family checks. A part whose parent injection is optional passes the directives that provide or host its parent and whether the injection found one, and a part with children passes the child directives it probes; each family spec lists these per part by that spec's rule. A required parent injection needs no parent check, because NG0201 is the report, and every parent token's description names, in development builds only, the directive that provides it, its entry point, and the same-template rule (`typeof ngDevMode === 'undefined' || ngDevMode ? "nfsAccordionToken (provided by NfsAccordion from 'ngx-foundation-sites/accordion' on an ancestor element declared in the same template)" : ''`). Under the opt-in `strictParents` flag, a part in that spec's table throws at construction in development builds when its optional parent injection found nothing; a part that a component projects into its parent from another template renders there through a template outlet with the parent element's injector (`viewChild(Parent, {read: Injector})` and `ngTemplateOutletInjector`, measured with Angular 22.2.0), which the required injections need already.
````

Part 3, item 6, line 383:

````markdown
6. **Forgotten-import checks** (the Selector manifest; `nfsDirectiveCheck` and the In-family checks; the `strictDirectiveImports` Runtime check and the `strictParents` flag in `ngx-foundation-sites/media-query`; the static check, the `ngx-foundation-sites:missing-imports` builder and setup generator behind each project's `nfs-imports` target). Consumers: every library directive and component with an attribute selector (one `nfsDirectiveCheck` call each) and every family spec (its In-family check lines). Decided in ADR 0046; the [Spec: forgotten-import checks (shared utility)](issues/150-spec-forgotten-import-checks.md) fixes the API and the tooling.
````

Part 3, Table C, the Forgotten-import checks row, line 398:

````markdown
| Forgotten-import checks | `nfsDirectiveCheck(directive, family?)` and `NfsFamilyPeers`; `strictDirectiveImports` and `strictParents` in `NfsRuntimeChecks`; the Selector manifest; the Architect builder and setup generator `ngx-foundation-sites:missing-imports` behind each project's `nfs-imports` target | A development-only function, two Runtime-check keys, and Node workspace tooling; no directive, service, or public token: the checks run from the library's own directives and from CI (ADR 0046) | Custom Angular in development builds only (no Aria or CDK piece reports a forgotten import); Node tooling over TypeScript's public compiler API and `angular-html-parser` | `afterEveryRender`, `MutationObserver` with `takeRecords()`, `Element.closest()` and `matches()`, `ng.getOwningComponent`, `provideEnvironmentInitializer`; TypeScript `createProgram` and the type checker, `angular-html-parser` `parse()`, `createBuilder`, `getTargetOptions`, `convertNxGenerator` | None |
````

Table A, the Orbit row, line 300 (fragment):

````markdown
the five class-only directives inject nothing in production
````

Table B, the Orbit row, line 329 (fragment):

````markdown
the five class-only directives inject nothing in production (an optional development-only lookup)
````

Table D, the Pagination row, line 353 (fragment):

````markdown
and a development-only lookup of `NfsPagination` by class in the item directives
````

Table D, the Breadcrumbs row, line 354 (fragment):

````markdown
and the item's development-only lookup of `NfsBreadcrumbs` by class
````

`architecture-guide.md`:

P23, line 324 (fragments):

````markdown
and `strictDirectiveImports` never does, because it reads Angular's development debugging API;
````

````markdown
the opt-in `strictParents` flag beside them makes an optional parent injection that found nothing throw, in development builds only; the Storybook half of the e2e layer sees none of them, because the static Storybook build runs in production mode.
````

P24, lines 334-343:

````markdown
#### P24. A forgotten import of an attribute directive fails silently; checks catch it, not import arrays

Rule: Entry points export their directive classes and no import arrays (ADR 0046). A spec's TypeScript usage examples import every directive they use, and its class and ARIA assertions run in the story gate. Every library directive and component with an attribute selector calls `nfsDirectiveCheck` from its constructor behind an inline `ngDevMode` guard, and each family spec lists its In-family checks per part by the rule of [Spec: forgotten-import checks (shared utility)](issues/150-spec-forgotten-import-checks.md): the parent check of an optional parent injection, the child probes, the peers linked by reference or value, and what `strictParents` changes. The library also ships the `strictDirectiveImports` Runtime check, the opt-in `strictParents` flag, and the opt-in static check (`ngx-foundation-sites:missing-imports`).

Why: Angular reports no error for a static attribute that matches no imported directive; a bound input on the missing directive fails (NG8002, binding to a property that does not exist), a static one does not, and a family's own checks run only inside a directive that exists, so a forgotten whole family or single directive needs the runtime check or the static check. An exported array prevents only a forgotten member and hides its members from the unused-imports diagnostic and `ng generate @angular/core:cleanup-unused-imports`; the three specs that exported one (`NFS_ACCORDION`, `NFS_RESPONSIVE_ACCORDION_TABS`, `nfsPrototypeClasses`) dropped it. Material's per-component NgModules are compatibility leftovers, and Angular Aria exports classes and tokens only.

Preferred: `imports: [NfsAccordion, NfsAccordionItem, NfsAccordionTitle, NfsAccordionContent]`, which the unused-imports diagnostic can check member by member; `nfsDirectiveCheck('NfsAccordionItem', {children: ['NfsAccordionTitle', 'NfsAccordionContent']})` inside `if (typeof ngDevMode === 'undefined' || ngDevMode)`; `[expanded]="true"` on a title, which fails to compile when `NfsAccordionTitle` is not imported; `nfsSliderFill` warning outside a slider.
Avoided: an exported import array such as `NFS_ACCORDION`; a TypeScript example that shows `<button nfsButton>` without its import; a check call behind a hoisted `const dev`; a static attribute as the only way to reach a directive whose absence nothing reports.

Decided by: the user's ruling of 2026-09-28 against import arrays and for four checks ([ADR 0046](adr/0046-forgotten-imports-caught-by-checks.md)); building-blocks 1.9 (optional injection with a development warning, and its forgotten-imports bullet); [Spec: forgotten-import checks (shared utility)](issues/150-spec-forgotten-import-checks.md).
````

`CONTEXT.md`:

Runtime check, line 592 (fragments):

````markdown
or a Forgotten import on a rendered element;
````

````markdown
The `strictParents` flag beside them is not one: it is off unless the consumer opts in, and makes a missing parent throw at construction.
````

Forgotten import, lines 595-597:

````markdown
**Forgotten import**:
A library attribute written in a template whose component's imports do not bring in the directive it names, so the element renders without that directive's classes, ARIA, and behaviour, with no compiler error.
_Avoid_: missing import, unimported directive, dead attribute
````

Selector manifest, lines 599-601:

````markdown
**Selector manifest**:
The library's list of its exported directives and components that have an attribute selector, each with its class name, entry point, selector, the Structural class it always binds, and the library directives it hosts; the list the forgotten-import checks match templates and rendered elements against.
_Avoid_: directive manifest, import manifest, selector list
````

In-family check, lines 603-605:

````markdown
**In-family check**:
A development warning from one part of a directive family about a peer: an element that carries the peer's attribute with no instance of it, or a parent that dependency injection cannot reach from the part's template.
_Avoid_: peer check, family validation, sibling check
````

`storybook-conventions.md`:

Section 8, line 320:

````markdown
- Layer 1 runs in Angular development mode, so the forgotten-import checks run in every story ([Spec: forgotten-import checks (shared utility)](issues/150-spec-forgotten-import-checks.md)): `preview.ts` spies on `console.warn` in a `beforeEach` and fails the story when the library logs a forgotten-import or wrong-element report, because a story's `render()` template is outside the static check, so a directive missing from `moduleMetadata.imports` fails its story. An Anti-pattern story that demonstrates a forgotten import asserts that report in its play function instead (section 6).
````

Section 11, the checklist, line 368:

````markdown
- [ ] The story logs no forgotten-import or wrong-element report.
````

[ADR 0040](../adr/0040-variant-input-types.md):

Consequences, the note of 2026-09-28, line 61:

````markdown
- 2026-09-28 ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): ADR 0046 adds a fourth check, `strictDirectiveImports`, and one flag, `strictParents`, to `NfsRuntimeChecks`, both development only: `provideNfsProductionRuntimeChecks` accepts neither, because the import check reads Angular's development debugging API and a thrown parent error in production is what ADR 0046 rejected. `strictDirectiveImports` is on by default like the other three and runs in the browser after every render; `strictParents` is off unless `provideNfsRuntimeChecks({strictParents: true})` turns it on, and acts at construction, on the server too, so it is a flag beside the Runtime checks rather than one of them. `provideNfsRuntimeChecks`'s argument becomes optional, because `provideNfsRuntimeChecks()` is how an application whose templates instantiate no library directive starts the import check.
````

[ADR 0046](../adr/0046-forgotten-imports-caught-by-checks.md):

Opening paragraph, line 7 (fragment):

````markdown
and the library catches a forgotten import with four checks.
````

The four checks, lines 9-12:

````markdown
- In-family checks: each part of a family reports, in development builds only, a peer attribute with no instance, once per element, naming the directive, its entry point, and the component to fix (the Angular Aria style, building-blocks 1.9, the guide's P23).
- A static check on documented APIs only: an opt-in builder and Nx target run in CI, resolving each standalone component's `imports` with TypeScript's compiler API, reading templates with a documented parser, and matching the library's selector manifest; it is the only check that sees templates never rendered in development. Its scope, by the user's ruling: class identifiers written directly in `imports`, not function-built imports, arrays of any form (plain `const` arrays included, a component that imports one is skipped with a notice), NgModule-declared components, or third-party packaged directives that host a library directive.
- A runtime manifest check: a development-only `strictDirectiveImports` runtime check (ADR 0040) that reports an element carrying a library directive's attribute with no library directive on it, in markup that renders during development.
- An opt-in `strictParents` flag: in development builds, parent injections that are optional by default become required, so a forgotten parent throws; production stays optional. Parts projected across templates then render through a template outlet with the parent's injector, since `inject()` has no option that follows projection.
````

Consequences, lines 24, 26, and 27:

````markdown
- [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md) specifies the four checks, after [Prototype: a static import check on documented APIs only](../issues/149-prototype-documented-api-import-check.md) confirms the documented-API static check against the compiler-based one.
````

````markdown
- A forgotten whole family or single directive is caught by the static check and the runtime manifest check only; in-family checks and `strictParents` catch forgotten members.
- 2026-09-28 ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): specified. One development call per directive, `nfsDirectiveCheck`, behind an inline `ngDevMode` guard, records its host, starts the runtime check, and runs the In-family checks. The runtime check decides from the Structural class, then Angular's public debugging `getOwningComponent` for server HTML not yet claimed, then that development record keyed by the Selector manifest's class names, so no private Angular field is read. All three development checks share one report per element and directive, and also report a library attribute on an element no selector of its directive admits. `strictParents` is an `NfsRuntimeChecks` field, off by default and development only, that throws the library's own error at construction for fifteen parts of eight families; the template-outlet pattern with the parent element's injector was measured with Angular 22.2.0. The Selector manifest also lists the library directives each library directive hosts, which the static check applies; the static check has no ignore option.
````

### The runtime manifest check: `strictDirectiveImports`

The fourth Runtime check of `NfsRuntimeChecks` (ADR 0040; [Spec: Runtime checks (later milestone)](../issues/162-spec-runtime-checks-later-milestone.md) owns the configuration, which the [Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md) held before the checks moved):

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

#### The two `NfsRuntimeChecks` keys

This spec owns two keys of the Runtime checks' configuration, in the form the Breakpoint service spec gave them (Family entries, Breakpoint service); the Runtime checks spec owns the interface, its other keys, `NfsRuntimeCheckReport`, both provider functions, and the checker token:

```ts
export interface NfsRuntimeChecks {
  // strictVariantNames, strictVariantProperties, strictBreakpointSync: Spec: Runtime checks (later milestone)
  /** A rendered element carrying a library directive's attribute with no library directive on it, or on an element no selector of that directive admits. Development builds only. */
  strictDirectiveImports: boolean;
  /** Off by default. In development builds, a part whose optional parent injection found nothing throws at construction. A flag, not a Runtime check; development builds only. */
  strictParents: boolean;
}

/** Development overrides: every check but strictParents is on without this provider; it also starts strictDirectiveImports when no library directive runs; returns no providers when ngDevMode is false. */
export function provideNfsRuntimeChecks(checks?: Partial<NfsRuntimeChecks>): EnvironmentProviders;

/** Production opt-in, per check; all off unless listed; the only production code path that references the checker. */
export function provideNfsProductionRuntimeChecks(
  checks: Partial<Omit<NfsRuntimeChecks, 'strictDirectiveImports' | 'strictParents'>>,
  options?: {report?: (report: NfsRuntimeCheckReport) => void},
): EnvironmentProviders;
```

- Defaults: with no provider, a development build runs `strictDirectiveImports` with the other Runtime checks, and `strictParents` is off; a production build runs neither.
- Landing order: the later milestone may plan this spec and the Runtime checks spec together or apart. If this spec lands first, it brings the configuration surface in the Runtime checks spec's shape with only these two keys: `NfsRuntimeChecks`, `provideNfsRuntimeChecks` with its optional argument and its environment initializer, and the internal root token whose factory returns the development checker behind `ngDevMode`, else `null`; `provideNfsProductionRuntimeChecks`, which accepts neither key, comes with the Runtime checks spec. Either way, no first-milestone spec depends on the keys.

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

A class-only part (the Slider fill, the Orbit's wrapper, controls, figure, image, and caption) needs nothing from its parent in production, yet it is in the table: projected into its parent from another template, it looks right but reports M4, and under `strictParents` it throws, as every part in the table does. The template-outlet pattern below gives it the parent element's injector and fixes both; the flag stays opt-in.

Kept optional, with the reason each `null` is a supported form:

- `nfsClose` and `nfsToggle` to `nfsOpenableToken`: a bound target replaces the Nearest Openable, and inputs are not set at construction ([Spec: Triggers (shared utility)](../issues/54-spec-triggers.md)).
- The Off-canvas panel to `nfsOffCanvasContentToken`: the sibling form binds `content` instead ([Spec: Off-canvas](../issues/25-spec-off-canvas.md)).
- `NfsAbideInput` to `nfsAbideToken` and `nfsAbideLabelToken`, and `NfsFormError` to `nfsAbideLabelToken`: a field outside a form works with the Defaults token policy, only a custom control's label provides the label token, and a Form error linked by reference needs no label ([Spec: Abide](../issues/31-spec-abide.md)).
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

A part that hosts an Angular Aria directive which itself requires a parent token throws Aria's NG0201 first when that parent is missing, because Angular runs a host directive's constructor before its host's (the directive composition guide, "Directive execution order"): a Tabs strip, tab, or panel outside its group or strip, and an Orbit bullet inside an `nfsOrbitBullets` element whose import was forgotten, report Aria's `TABS` or `TAB_LIST`, which carry no library description, and the view throws before the In-family checks or `strictDirectiveImports` see a render. There the static check names the import; elsewhere the library's description is printed wherever its own injection is the first to fail (the Accordion's item hosts nothing and is constructed before its title and content, so the Accordion is not affected).

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
<!-- the consumer, which imports NfsMenuItem, the one library directive its template writes -->
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

In the Variant declaration tooling's package ([Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md), which in the first milestone carries none of this): the package ships the Selector manifest as a second JSON document beside the Variant manifest, under the same rules (read by the tooling from its own install location, never exported through the package's `exports`, never loaded by application code), while this spec owns its shape and its build steps; the `missing-imports` setup generator and builder are entries of the package's `generators` and `builders` collections beside `variant-types`, one Architect builder per tool for both workspace kinds (the Variant tooling's D22); and the setup adds `angular-html-parser`, an optional peer dependency of the package, to a workspace's `devDependencies`, while the Variant tooling itself adds no dependency to applications. The Variant tooling spec gets these lines back when this spec lands (Family entries, Variant declaration tooling; closing section).

The library's own CI keeps the compiler-based check (STATIC 1, approach b) as an oracle, never shipped: on every Angular minor it runs both checks over the prototypes' cases, the classes-only generated workspace, and the synthetic manifest, and fails on any difference other than the known `ngNonBindable` one, where the documented check follows Angular's runtime (DOC 2, DOC 5). The oracle is library-internal code over `@angular/compiler-cli`, so a change in that API breaks the oracle, never a consumer.

### Messages

Every development message starts with `ngx-foundation-sites`, a Runtime check's with its name in brackets, and passes the element as the second `console.warn` argument. Placeholders in angle brackets; `<attr>` is the manifest's spelling.

| Id | When | Text |
| --- | --- | --- |
| M1 | Forgotten import, from the runtime check | "ngx-foundation-sites [strictDirectiveImports]: <tag attr> has no <Directive>, so it renders without its classes, ARIA, and behaviour. Add <Directive> from '<entry point>' to the imports of the component whose template declares this element (Angular names <Owner>), or switch this check off with provideNfsRuntimeChecks({strictDirectiveImports: false})." |
| M2 | The same, from an In-family check, or from a family's own development check through `nfsReportForgottenPeer` | "ngx-foundation-sites: <tag attr> has no <Directive>, so it renders without its classes, ARIA, and behaviour. Add <Directive> from '<entry point>' to the imports of the component whose template declares this element (Angular names <Owner>). Found by <Part>." |
| M3 | Wrong element, from the runtime check | "ngx-foundation-sites [strictDirectiveImports]: <tag attr> matches no selector of <Directive> ('<selector>'), so nothing applies it. Move <attr> to an element the selector names." From an In-family check, or from a family's own development check through `nfsReportForgottenPeer`, the same without the bracketed name and with "Found by <Part>." |
| M4 | Out of reach (In-family) | "ngx-foundation-sites: <tag attr> sits inside a <Parent> that its injector cannot reach: it is declared in another template (content projection or a template outlet), and dependency injection follows the declaration site. Declare it in the template of the <Parent> element, or render it there through a template outlet with that element's injector (ngTemplateOutletInjector)." |
| M5 | Stands alone (In-family) | "ngx-foundation-sites: <tag attr> is not inside an element of <Parent list>." then the family's `alone` sentence when it has one |
| M6 | Owner unknown | M1 to M3 without the parenthesis naming Angular's owner |
| M7 | Token description (NG0201) | "<tokenName> (provided by <Directive> from '<entry point>' on an ancestor element declared in the same template)". For a token several directives provide, each is written "<Directive> from '<entry point>'" (two directives of one entry point as "<Directive> or <Directive> from '<entry point>'"), joined with commas and "or", and for a contract token an application may also provide, the list ends with "or a component that implements <Interface>" (`nfsOpenableToken`) |
| M8 | `strictParents` error, thrown | "ngx-foundation-sites [strictParents]: <tag attr> found no <Parent list> on an ancestor element declared in the same template. Add the parent directive to the imports of the component that declares the parent element, write this element inside it, or, when a component projects this element into the parent from another template, render it through a template outlet with the parent element's injector (ngTemplateOutletInjector). strictParents is on in provideNfsRuntimeChecks." |
| NFS9001 | Static, forgotten import (error) | "<file>:<line>:<col>: NFS9001: <attr> matches <Directive>, which <Component>'s imports do not include; import <Directive> from '<entry point>'." |
| NFS9002 | Static, component skipped (warning) | "<file>:<line>:<col>: NFS9002: <Component> is not checked: <reason>. List each directive class in imports to have its template checked." Reasons: "its imports hold an array (<text>)", "a call (<text>)", "a spread (<text>)", "an entry that is not a class (<text>)"; "it is declared in an NgModule (standalone: false)"; "its decorator argument is not an object literal"; "its template is not a string literal"; "its templateUrl '<path>' does not exist"; "its template does not parse: <parser message>" |
| NFS9003 | Static, wrong element (error) | "<file>:<line>:<col>: NFS9003: <attr> on <tag> matches no selector of <Directive> ('<selector>'); move it to an element the selector names." |
| NFS9004 | Static, nothing to check (error) | "NFS9004: the program of <tsConfig> declares no Angular component, so nothing was checked. Check that <tsConfig> includes the project's components." |
| M9 | Missing package | The Variant tooling's M9 in this tool's form: "the missing-imports <builder or generator> needs <package>. Install it: npm install --save-dev <package>@<range>" |
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

The checks render nothing and change no markup, so no criterion applies to them. They exist partly for accessibility: a forgotten import removes the directive's ARIA as well as its look (a title without `aria-expanded`, a slide without its `inert` handling), a 4.1.2 failure that axe may not flag on an unstyled element, and the checks surface it in development and CI. No criterion requires them either: WCAG binds the consumer's pages, and the library's own bar is that its components, used as documented, pass axe and WCAG AA, which its own stories prove; so the first milestone ships without them, and a consumer who forgets an import fails 4.1.2 on their own page with no report ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)).

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

A good test asserts what a developer observes: the console messages (text, count, and the element passed), a thrown error, the builder's exit status and output, and the workspace files the generator leaves; never the host record's or the scan's internal state. Prior art: the three prototypes' case matrices, which the tests keep, the Runtime checks spec's tests and production-bundle measurement (the Breakpoint service spec's before the checks moved), and the Variant tooling's builder, generator, and workspace tests. The tests the family specs gave these checks, and the changes decisions 2 to 4 of [Decide: family checks report a forgotten peer themselves](../issues/157-decide-family-checks-report-forgotten-peers.md) make to them, come back to each spec with its lines (Further Notes, What the later milestone adds back, per spec). In the first milestone none of these tests exists, and no library test asserts a forgotten-import report.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`, `npx nx test-storybook <lib>`)

No stories of their own: the checks render nothing. Layer 1 runs in Angular development mode, so every story of the library is a negative control: the Storybook preview fails a story whose render logs a forgotten-import or wrong-element report, because a story's `render()` template is outside the static check (storybook-conventions' rule before the checks moved, which the later milestone adds back; closing section). An Anti-pattern story that demonstrates a forgotten import asserts its report in its play function instead.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

In `ngx-foundation-sites/media-query`'s tests, over the library's own directives as fixtures: `NfsButton` (a single directive with a Structural class), the Accordion (required parents), the Nested menu with the Dropdown Menu root (an optional parent, a hosted `NfsMenu`), and `NfsSmoothScroll` (class-less). Each case that needs a first report of its own sits in its own test file, because reports are once per realm.

- Runtime check: a forgotten member, family, and single directive each report once with the directive, entry point, and owner (M1); a copied `class="button"` without `NfsButton` still reports; `<div nfsButton>` reports M3 whether `NfsButton` is imported or not; `nfsHighlight` and correct markup report nothing; three `@for` rows report once; an `@if` branch reports only after it renders; a `@defer` block reports after it loads, and a directive imported only for it reports nothing; an element projected by a page into a component that imports the directive reports, naming the page; `provideNfsRuntimeChecks({strictDirectiveImports: false})` silences it; with no library directive in the fixture, nothing reports until `provideNfsRuntimeChecks()` is provided, and then the forgotten `nfsButton` reports; `nfsMenu` beside an imported `nfsDropdownMenu` reports nothing.
- In-family checks: a forgotten child reports M2 once even though the scan sees it too; a forgotten optional parent reports on the ancestor; an item declared in another template and rendered inside the root reports M4; a part outside its parent reports M5 with the family's sentence; a part with no children reports nothing; a title shown later inside an existing item reports (the `afterEveryRender` case).
- `nfsReportForgottenPeer`: an auto-playing Orbit whose `button nfsOrbitRotation` import is forgotten reports one M2 found by `NfsOrbit` and no WCAG 2.2.2 warning, also with `strictDirectiveImports: false`; a Drilldown wrapper whose import is forgotten reports M2 with `strictDirectiveImports: false`; an auto-playing Orbit with no rotation element keeps check 1's message.
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

The Storybook half: none, because the static Storybook build runs in production mode (ADR 0018); layer 1 covers stories.

## Out of Scope

- Any of this spec in the first milestone of the implementing repository: the user's ruling of 2026-09-29 ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)); the first milestone accepts a forgotten import with no report, and every other spec states the imports it needs as documented usage. Category: `scope-boundary`.
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
| D5 | "Is the directive here" | Structural class, then Angular's owner for unclaimed HTML, then a development host record keyed by manifest class name | Angular's private compiled selector field (RUNTIME's hybrid; private API; `other`); `ng.getDirectives` compared by class name (development builds name classes `_Name`, RUNTIME 2; `other`); the class probe alone (misses class-less directives and a copied class, RUNTIME 2; `other`) |
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
| D30 | A family check that finds a forgotten peer | One development-only helper, `nfsReportForgottenPeer(element, directive, foundBy)`, that reports through the report function and tells the caller whether it did ([Decide: family checks report a forgotten peer themselves](../issues/157-decide-family-checks-report-forgotten-peers.md)) | "Says nothing" and leave it to a probe or `strictDirectiveImports` (a peer no probe covers went unreported under `strictDirectiveImports: false`; `other`); a family message that names the import itself (it would repeat the report function's owner lookup and its once-per-element rule; `other`) |
| D31 | Milestone | Specified in full, planned and implemented in a later milestone of the implementing repository; the first milestone ships none of it (the user's ruling, [Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)) | The checks in the first milestone (a problem Angular should correct, and a larger first milestone; `scope-boundary`); dropping the spec (the user wants the kinds weighed in practice; `superseded`) |
| D32 | Where each family's lines live until then | Here, verbatim, per spec, with a closing list of what each spec gets back | Left in the family specs (the ruling bars any other spec from naming a deferred check; `superseded`); recovered from the history when the milestone starts (a search through old commits, and no record of what changed since; `other`) |
| D33 | The two `NfsRuntimeChecks` keys | Owned here, in the Runtime checks spec's configuration; this spec brings that surface with only its two keys if it lands first | Keys of their own provider (a second configuration call, which D14 rejected; `other`); waiting for the Runtime checks spec (the kinds could not be weighed apart; `other`) |

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

A family's own check that looks for a peer, the Orbit's check 1 (an auto-playing Orbit with no rotation control; its trigger and message are the misuse warnings spec's), inside the Orbit's development-only render callback:

```ts
let reported = false;

for (const button of rotationCandidates(host)) {
  // each button in this Orbit's scope that carries nfsOrbitRotation and registered nothing
  reported = nfsReportForgottenPeer(button, 'NfsOrbitRotation', 'NfsOrbit') || reported;
}

if (!reported) {
  warnNoRotationControl(); // check 1's own message (WCAG 2.2.2)
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

### What the later milestone adds back, per spec

When this spec lands, each spec below gets back, in the sections they stood in, the lines quoted for it under Family entries (Implementation Decisions), the other sentences and the tests named here, and the changes listed. Line numbers are those of 53144f3. Every restored token description replaces the plain name the first milestone gives the token ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md), decision 4). "Decision 2" and "decision 3" are those of [Decide: family checks report a forgotten peer themselves](../issues/157-decide-family-checks-report-forgotten-peers.md), applied by the family rule (In-family checks); each check they change is specified by [Spec: family checks (later milestone)](../issues/160-spec-family-checks-later-milestone.md) or, for the Orbit's checks 1 and 3, the Off-canvas panel's check 3 (part a) and check 4, and the Triggers' check 1, by [Spec: misuse warnings (later milestone)](../issues/161-spec-misuse-warnings-later-milestone.md), and gets back its text from that spec with the change made here. Where a quoted line names a directive of a family that [Decide: grids, typography, and utilities move to a later milestone](../issues/174-decide-grids-typography-utilities-later-milestone.md) moved (`nfsShowForSr` in the Orbit's, `nfsTextAlign` in the Pagination's, the Visibility Classes' directives in the Abide's, the Flexbox Utilities' in the Media Object's, the XY Grid's cell in the Sticky's), that clause comes back as quoted only where the spec writes the directive again; while it writes Foundation's class as a normal class, the clause names the class. A spec that is not listed has a single directive with no parent, child, or peer (the Anchored pane, Badge, Button, Button Group, Callout, Close Button, Dropdown, Float Classes, Label, Magellan, Responsive Embed, Smooth Scroll, Thumbnail, and Tooltip specs) and gets back no line of its own: building-blocks 1.9's bullet, once restored, gives each of its directives the call with its class name.

- [Spec: Abide](../issues/31-spec-abide.md): the two token descriptions (lines 157-158) and the In-family lines (166-172); the `NfsAbideLabel` and `NfsFormError` API paragraphs' exceptions for an element that carries `nfsAbideInput` or `nfsFormError` without its directive (254, 265); the browser-level Linking case's three forgotten-import cases (505). Decision 3 changes the label's and the Form error's "no field resolves" warnings and the field's warning for an error state with no visible Form error: each calls `nfsReportForgottenPeer` for each element it finds that carries `nfsAbideInput`, `nfsAbideLabel`, or `nfsFormError` and registered nothing (found by `NfsAbideLabel`, `NfsFormError`, and `NfsAbideInput`), and warns only when no such element exists, so the lines' "says nothing" clauses, the `NfsFormError` line's "a forgotten import that `strictDirectiveImports` reports once (M1)", and the API exceptions follow; the Linking case asserts one M2 for each of the three, the bare Form error's also under `strictDirectiveImports: false` outside an `nfsAbide` form, where no probe covers its label.
- [Spec: Accordion](../issues/15-spec-accordion.md): the token descriptions (152) and the In-family lines (157-163). No change; its parts are this spec's layer-2 fixtures.
- [Spec: Accordion Menu](../issues/20-spec-accordion-menu.md): the In-family line (161). No change.
- [Spec: Breadcrumbs](../issues/88-spec-breadcrumbs.md): the In-family lines (116-118) and development check 7 (164); the diagram's development-only `inject(NfsBreadcrumbs, {optional: true})` (108), which exists for the parent check; the declaration-site note (115), which the first milestone dropped, restored after the Placement bullet, whose last sentence ("gets the look too") then adds that the item's parent check reports it as out of reach (M4); the browser-level case "`nfsBreadcrumbsItem` outside a trail warns (check 7)" (331). No change.
- [Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md): nothing of its own. The two keys and their table rows, the start sentence (397), and the sentences of lines 31, 165, 176, 349, 395, and 404 go back with the Runtime checks' configuration, wherever [Spec: Runtime checks (later milestone)](../issues/162-spec-runtime-checks-later-milestone.md) restores it (The two `NfsRuntimeChecks` keys, above).
- [Spec: Card](../issues/90-spec-card.md): the injection bullet's development call (98), the In-family line (100), and D10 (313); the Implementation level's "outside the development-only `nfsDirectiveCheck` call, whose render callback on `NfsCard` probes its parts" (131) and Rendering modes' "and `NfsCard`'s development In-family callback runs only after a client render" (228). No change.
- [Spec: Drilldown Menu](../issues/22-spec-drilldown-menu.md): the In-family lines (168-171); checks 1 to 3's sentences that leave a forgotten wrapper, a forgotten back item, and a back item outside a root to these checks (249-251); the browser-level cases for a back item outside a drilldown root (495) and for a wrapper or a back item written without its import (507). Decision 3 changes checks 1 and 2: check 1 calls `nfsReportForgottenPeer` for a parent element that carries `nfsDrilldownWrapper` and registered no wrapper, check 2 for each element in a level that carries `nfsDrilldownBack` and registered nothing (both found by `NfsDrilldown`), and each warns only when no such element exists; the case at 507 asserts one M2 for each, the wrapper's also under `strictDirectiveImports: false`, since no probe covers a wrapper.
- [Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md): the In-family line (178). No change.
- [Spec: Equalizer](../issues/34-spec-equalizer.md): the token description (143), the placement note (146), and the In-family line (153); user story 29 (57); the browser-level Nesting and DI case, with its `strictParents` and template-outlet halves (348). No change.
- [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md): the In-family line (135). No change: check 2 (193) keeps its class read and its message names the forgotten-import case, because any family's directive can be its peer.
- [Spec: Forms](../issues/98-spec-forms.md): the In-family lines (143-149). No change.
- [Spec: Interchange](../issues/35-spec-interchange.md): the In-family line (146). No change.
- [Spec: Media Object](../issues/91-spec-media-object.md): the In-family line (118); check 3's sentence on a parent that carries the attribute without the class (167) and D10's "a parent that carries `nfsMediaObject` without its class is a forgotten import, left to the `strictDirectiveImports` report" (392). Decision 2 changes check 3: it calls `nfsReportForgottenPeer` for a parent element that carries `nfsMediaObject` without `.media-object` (found by `NfsMediaObjectSection`) and warns only when the helper returns false, so the In-family line's "which leaves a parent that carries `nfsMediaObject` without `.media-object`, a forgotten `NfsMediaObject`, to the `strictDirectiveImports` check and the static check", check 3's "says nothing there", and D10 follow; its test asserts M2, also under `strictDirectiveImports: false`, since no probe covers a forgotten Media Object.
- [Spec: Menu](../issues/85-spec-menu.md): the In-family lines (135-137) and development check 3 (186); the development-only `inject(NfsMenu, {optional: true})` for the parent check, with D9's rejected `nfsMenuToken` "(the same entry point, a development-only lookup)" (427); the browser-level case "`li[nfsMenuText]` outside a menu warns once" (375). No change.
- [Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md): the In-family lines (170-175) and `nfsMenuModeToken`'s description (218); development checks 3 and 5's sentences on the parent checks (292, 294) and check 4's on a forgotten toggle (293); the browser-level dev-mode case for check 4 (605). Decision 3 changes check 4: it calls `nfsReportForgottenPeer` for each element in the item that carries `nfsSubmenuToggle` and registered nothing (found by `NfsMenuItem`) and warns only when no such element exists; the case at 605 asserts one M2.
- [Spec: Off-canvas](../issues/25-spec-off-canvas.md): the token description (175) and the In-family lines (180-185); check 3's sentences on a forgotten content and a forgotten wrapper (293); the browser-level development-checks case for them (550). Decision 3 changes check 3: it calls `nfsReportForgottenPeer` for an ancestor that carries `nfsOffCanvasContent` or `nfsOffCanvasWrapper` without its directive (found by `NfsOffCanvas`) and warns only when no such element exists, so the `NfsOffCanvas` line's "which `strictDirectiveImports` reports with the import to add (M1), and a working wrapper's child probe (M2), so check 3 says nothing there" and the `NfsOffCanvasWrapper` line's "reported by `strictDirectiveImports` (M1) and the static check, and development check 3 leaves it to them" follow; the case at 550 asserts one M2 for each in place of the `strictDirectiveImports` report, both also under `strictDirectiveImports: false`, where a forgotten wrapper has no probe. By the same wording, decision 3 changes check 4's clause on a registered Trigger inside a modal panel: it calls `nfsReportForgottenPeer` for each element inside the panel that carries `nfsClose` or `nfsToggle` and registered nothing (found by the panel's class), and warns only when every call returns false.
- [Spec: Orbit](../issues/33-spec-orbit.md): the token description (169) and the In-family lines (178-182); the class-only directives' development-only lookup (143), the check 8 note and checks 1 and 3's exceptions (249), and D23's parent-check clause (571); the browser-level dev-mode case, with its `provideNfsRuntimeChecks({strictParents: true})` call (495), which configures this spec's flag. Decision 3 changes checks 1 and 3: each calls `nfsReportForgottenPeer` for each `button` carrying `nfsOrbitRotation`, element carrying `nfsOrbitBullets`, or bullet carrying `nfsOrbitBullet` in the Orbit that registered nothing (found by `NfsOrbit`) and warns only when no such element exists, so the `NfsOrbit` line's "say nothing where the element they look for carries the part's attribute without its directive" follows; the case at 495 asserts one M2 found by `NfsOrbit` and no WCAG 2.2.2 warning, also under `strictDirectiveImports: false` (this spec's layer 2).
- [Spec: Pagination](../issues/87-spec-pagination.md): the In-family lines (121-123) and the sentence on items outside a pagination (158); the declaration-site note (120), which the first milestone dropped; the browser-level case "an item directive outside `nfsPagination` warns once" (327). No change.
- [Spec: Progress Bar](../issues/95-spec-progress-bar.md): the token description (112) and the In-family lines (118-123). No change; its DI case (359) stays in the first milestone, because NG0201 is Angular's report.
- [Spec: Prototyping Utilities](../issues/102-spec-prototyping-utilities.md): the In-family line (193) and the entry-point bullet's "and the forgotten-import checks name the directive of an attribute written without its import" (192). No change.
- [Spec: Responsive Accordion Tabs](../issues/19-spec-responsive-accordion-tabs.md): the In-family line (186), which says the entry point has none of its own. No change.
- [Spec: Responsive Menu](../issues/23-spec-responsive-menu.md): the In-family line (176). No change.
- [Spec: Responsive Toggle](../issues/24-spec-responsive-toggle.md): the In-family lines (130-133). No change: check 3 looks for no element and keeps its message.
- [Spec: Reveal](../issues/18-spec-reveal.md): the token description (161). No change.
- [Spec: Slider](../issues/32-spec-slider.md): the token description, with its clause on `strictParents` (158), and the In-family lines (165-169); the fill's development-only lookup (241), check 6's note (251), and D24's parent-check clause (597); the browser-level dev-mode case, with its `provideNfsRuntimeChecks({strictParents: true})` call (512). No change.
- [Spec: Sticky](../issues/28-spec-sticky.md): the In-family line (135); warning 1's exception for a parent that carries `nfsStickyContainer` without its class (169). Decision 2 changes warning 1: it calls `nfsReportForgottenPeer` for a parent element that carries `nfsStickyContainer` without `.sticky-container` (found by `NfsSticky`) and warns only when the helper returns false, so the In-family line's "leaving a parent that carries `nfsStickyContainer` without `.sticky-container`, a forgotten `NfsStickyContainer`, to the `strictDirectiveImports` check and the static check" follows; its test asserts M2, also under `strictDirectiveImports: false`, since no probe covers a forgotten container.
- [Spec: Switch](../issues/84-spec-switch.md): the In-family lines (129-134); check 6's attribute read (171), D19 (458), and the browser-level check 6 case (378). No change: check 6 reads the forgotten input as present, and `NfsSwitch`'s probe reports it.
- [Spec: Table](../issues/92-spec-table.md): the In-family line (108) and the sentence "Only the wrapper's development In-family check names `NfsTable`" (104). No change.
- [Spec: Tabs](../issues/16-spec-tabs.md): the token descriptions (156) and the In-family lines (165-173); the tab warning's attribute test (259) and its browser-level case (516). Decision 2, by its wording, changes the tab's warning for a parent that is not an `li[nfsTabsTitle]`: it calls `nfsReportForgottenPeer` for a parent `li` that carries `nfsTabsTitle` without `.tabs-title` (found by `NfsTab`) and warns only when the helper returns false; the strip's probe reports the same element, so the case at 516 still sees one M2.
- [Spec: Toggler](../issues/17-spec-toggler.md): the In-family line (139). No change.
- [Spec: Top Bar](../issues/86-spec-top-bar.md): the token description (154) and the In-family lines (158-162); check 7's sentence on a bar whose import was forgotten (217). Decision 2, by its wording, changes check 7: it calls `nfsReportForgottenPeer` for an ancestor that carries `nfsTopBar` or `nfsTitleBar` without its class (found by the section's directive) and warns only when the helper returns false; its test asserts M2, also under `strictDirectiveImports: false`, since no probe covers a forgotten bar. Check 3 (213) finds a peer of another family by its class and keeps its form.
- [Spec: Triggers (shared utility)](../issues/54-spec-triggers.md): the token description (130) and the In-family lines (137-140); check 1's sentence on an enclosing Openable whose import was forgotten (208) and its browser-level case (381). Decision 3 changes check 1: it calls `nfsReportForgottenPeer` for the enclosing element that carries an Openable's attribute and registered no Openable, once for each Openable directive whose attribute it carries (found by `NfsClose` or `NfsToggle`), and warns only when no such element exists, so the `NfsClose` and `NfsToggle` line's "check 1 says nothing and `strictDirectiveImports` reports that element with the import to add (M1)" follows; the case at 381 asserts one M2, also under `strictDirectiveImports: false`, since an Openable probes no Trigger.
- [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md): the In-family line (167) and the forgotten-import bullet (593). No change.
- [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md): the Selector manifest sentence (136), the package diagram's Selector manifest lines (197-199), the `angular-html-parser` clause of the dependencies bullet (418), and D22's "and `missing-imports` of the forgotten-import checks" (587). No change.
- [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md): the In-family line (140). No change: check 3 (186) finds a peer of another family by its class and keeps its form.
- [Spec: XY Grid](../issues/99-spec-xy-grid.md): the In-family line (135); check 2's sentence on a grid whose import was forgotten (213). Decision 2 changes check 2: it calls `nfsReportForgottenPeer` for a parent element that carries `nfsGridX` or `nfsGridY` without its class (found by `NfsCell`) and warns only when the helper returns false; its test asserts M2, also under `strictDirectiveImports: false`, for a grid that no container holds.

The shared documents get back what they said (Family entries, Shared documents), with one addition:

- `building-blocks.md`: 1.9's forgotten-imports bullet (line 143), with one sentence for decisions 2 to 4, which 1.9 did not state before ([Decide: family checks report a forgotten peer themselves](../issues/157-decide-family-checks-report-forgotten-peers.md), item 3 of its changes): "A family's own development check that looks for a peer's element hands an element that carries the peer's attribute without its directive to `nfsReportForgottenPeer`, which reports the forgotten import once, and gives its own message only when the helper returns false."; Part 3's item 6 (383) with the count of shared utilities; Table C's row (398); the Orbit rows' "in production" (300, 329) and the Pagination and Breadcrumbs rows' development-only lookups (353, 354).
- `architecture-guide.md`: P23's `strictDirectiveImports` and `strictParents` clauses (324) and P24 as it stood (334-343).
- `CONTEXT.md`: the Forgotten import, Selector manifest, and In-family check terms, and the Runtime check term's two clauses, without the later-milestone marker they carry in the first milestone.
- `storybook-conventions.md`: section 8's report guard (320) and section 11's checklist item (368).
- ADR 0040 and ADR 0046: nothing; they keep their text, with a dated pointer to the ruling.
