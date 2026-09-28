# 150. Spec: forgotten-import checks (shared utility)

Type: grilling
Status: open
Blocked by: 149
Labels: wayfinder:grilling
Map: ../map.md

## Question

The user ruled on 2026-09-28 ([Prototype: detecting a forgotten attribute directive import](145-prototype-missing-directive-import-checks.md), its user ruling, and ADR 0046): no import arrays, and four checks for a forgotten attribute directive import: in-family checks, a static check on documented APIs only, a runtime manifest check, and an opt-in `strictParents` flag. What exactly does the library ship for each, and what changes in the specs and shared documents?

## How to work it

Publish `specs/forgotten-import-checks.md` with `/to-spec` after `/grill-with-docs` (self-grilling, both sides), from the three prototypes of ticket 145, the documented-API prototype of [Prototype: a static import check on documented APIs only](149-prototype-documented-api-import-check.md), ADR 0040 (runtime checks), ADR 0046, building-blocks 1.9, and the architecture guide's P23 and P24. Decide at least:

1. In-family checks: the shared development helper (`afterEveryRender`, an inline `ngDevMode` guard at every call site, a guard for server-rendered content not yet hydrated, one report per element naming the directive, its entry point, and the component to fix), and the rule each family spec follows to list its peer checks.
2. The runtime manifest check `strictDirectiveImports`: its place among ADR 0040's runtime checks (development default and opt-out), how it starts when no library directive runs, the selector manifest's generation after the library build, and replacing the prototype's one private field with a manifest lookup.
3. `strictParents`: the flag, the families whose parent injection it makes required in development, the development-only token descriptions, and the documented template-outlet pattern (`ngTemplateOutletInjector`) for parts projected across templates.
4. The static check: the builder and Nx target from ticket 149, its options, its notice for unresolvable `imports`, and what the setup generator adds.
5. The edits other records need, as quoted text: drop the import arrays of `specs/accordion.md`, `specs/responsive-accordion-tabs.md`, and `specs/prototyping-utilities.md`; the guide's P24; building-blocks 1.9; ADR 0040's runtime-check list; `specs/variant-declaration-tooling.md` (the builder collection and the manifests); README.
