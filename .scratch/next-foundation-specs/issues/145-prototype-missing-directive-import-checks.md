# 145. Prototype: detecting a forgotten attribute directive import

Type: prototype
Status: claimed
Blocked by: none
Labels: wayfinder:prototype
Map: ../map.md

## Question

A static attribute that matches no imported directive is legal in Angular, so `<button nfsButton>` without `NfsButton` in `imports` renders unstyled with no error; the Angular team has said the compiler cannot make it an error (angular/angular#17874), the extended diagnostics cover only structural and control-flow directives, and the Language Service imports a directive only when its attribute is picked from completion. The guide's P24 in [Decide: the directive and component architecture guide](141-decide-directive-component-architecture-guide.md) leaves the library's answer OPEN FOR HUMAN, and the user asked on 2026-09-28 for prototypes of a runtime check and a lint check. Can either detect a forgotten import of a library attribute directive reliably, at what cost, and how would each ship?

The user's notes the same day, for the evaluation: Angular Material's `Mat*Module`s are compatibility leftovers of a move to standalone declarables, and Angular Aria better reflects modern guidance; an import array per entry point hides its members from the unused-imports diagnostic and the cleanup schematic (the compiler treats an exported array as possibly shared, `unused_standalone_imports_rule.ts:155-182`), so the consumer can no longer measure which directives it uses; Angular Aria's accordion already reports a forgotten trigger or content from the panel in development builds and throws NG0201 for a forgotten group, and ng-primitives throws NG0201 for a forgotten parent only.

## How to work it

Two Opus 5.5 prototype agents in parallel, each writing rough, runnable code under `prototypes/missing-directive-imports/<runtime|static>/` and one findings file, `research/missing-directive-import-<runtime|static>.md`:

1. Runtime check: a development-only check (ADR 0040's runtime checks, default on in development with a per-check opt-out, nothing in production) that finds elements carrying a library directive's attribute with no library directive instance on them, from a selector manifest the library generates. Measure: detection of a forgotten member, a forgotten family, and a single directive; false positives; where the check runs (browser, dev-server SSR, inside `@defer` and incremental hydration); what it needs when no library directive at all is instantiated; its development bundle cost and zero production cost.
2. Static check: a check over the consumer's templates, compared across at least an ESLint rule on `@angular-eslint`'s template parser and a script over the Angular compiler's own template type checker (the effort's Architect builder and Nx target shape, `specs/variant-declaration-tooling.md`, is a possible home). Measure: detection of the same three cases in inline and external templates, false positives, what each needs to know the component's imports, run time on a workspace of realistic size, and the maintenance and API surface each adds (the user judged an ESLint plugin not worth it for Variant typing, for surface and maintenance reasons).

The orchestrator then records a short Answer comparing the two with the import-array options, and takes the choice to the user, since P24 is OPEN FOR HUMAN.
