---
status: accepted
---

# Forgotten directive imports are caught by checks, not by import arrays

A static attribute that matches no imported directive is legal in Angular, so a forgotten import of a library attribute directive renders unstyled and without its ARIA or behaviour, with no error; the Angular team has said the compiler cannot make it an error (angular/angular#17874). The architecture guide's P24 left an import array per entry point OPEN FOR HUMAN, and three prototypes ([Prototype: detecting a forgotten attribute directive import](../issues/145-prototype-missing-directive-import-checks.md)) measured the alternatives. On 2026-09-28 the user chose: entry points export their directive classes and no import arrays, as Angular Aria does, and the library catches a forgotten import with four checks.

- In-family checks: each part of a family reports, in development builds only, a peer attribute with no instance, once per element, naming the directive, its entry point, and the component to fix (the Angular Aria style, building-blocks 1.9, the guide's P23).
- A static check on documented APIs only: an opt-in builder and Nx target run in CI, resolving each standalone component's `imports` with TypeScript's compiler API, reading templates with a documented parser, and matching the library's selector manifest; it is the only check that sees templates never rendered in development. Its scope, by the user's ruling: identifiers written directly in `imports`, not function-built imports, `as const` arrays, NgModule-declared components, or third-party packaged directives that host a library directive.
- A runtime manifest check: a development-only `strictDirectiveImports` runtime check (ADR 0040) that reports an element carrying a library directive's attribute with no library directive on it, in markup that renders during development.
- An opt-in `strictParents` flag: in development builds, parent injections that are optional by default become required, so a forgotten parent throws; production stays optional. Parts projected across templates then render through a template outlet with the parent's injector, since `inject()` has no option that follows projection.

## Considered options

- An import array per entry point (`NFS_ACCORDION`), or per multi-part family: it prevents only a forgotten family member, costs about fifty public names, and hides its members from the unused-imports diagnostic and `ng generate @angular/core:cleanup-unused-imports` (the compiler treats an exported array as possibly shared), which the user judged a significant cost. Angular Material's per-component NgModules, the precedent for bundling, are compatibility leftovers of its move to standalone declarables.
- A static check over Angular's own compiler (`NgCompiler` with the template type checker): exact in every case measured, but it relies on `@angular/compiler-cli` API that Angular's public-API policy does not cover.
- An ESLint rule: syntax alone could not resolve scope (it missed two harder cases and raised four false positives) and would add a published plugin.
- Required parent injection by default (the ng-primitives style): a forgotten parent throws NG0201 in production too, blanking the page or making the server answer 404, and its message misleads for projected content.

## Consequences

- The Accordion, Responsive Accordion Tabs, and Prototyping Utilities specs drop the import arrays they export; the guide's P24 is no longer provisional.
- [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md) specifies the four checks, after [Prototype: a static import check on documented APIs only](../issues/149-prototype-documented-api-import-check.md) confirms the documented-API static check against the compiler-based one.
- NgModule consumers stay supported by the library: its standalone directives remain importable into an NgModule's `imports`; only the static check leaves NgModule-declared components out.
- A forgotten whole family or single directive is caught by the static check and the runtime manifest check only; in-family checks and `strictParents` catch forgotten members.
