# 116. Re-run: Responsive Toggle spec under the class rule

Type: grilling
Status: open
Blocked by: 81, 86
Labels: wayfinder:grilling
Map: ../map.md

## Question

What does the [Spec: Responsive Toggle](24-spec-responsive-toggle.md) become under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Revise `specs/responsive-toggle.md` in place so that no consumer-written Foundation or NFS class remains: every Structural class the spec leaves to the consumer gets its directive binding, every Variant class the spec leaves consumer-written becomes a typed input by the decision above, and every State class stays or becomes a host binding. Behaviour, ARIA, keyboard, rendering modes, and tests otherwise stay as decided.

Also: the Title Bar and Menu Icon (and the menu icon's hit area) now come from the Top Bar spec; RT6: the title directive returns, the generated id and the `aria-label` input stay out.

## How to work it

Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this spec); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Then revise the spec's Solution, class mapping, API tables, Rendered HTML (server and hydrated), stories and their play functions, tests, SSR smoke, and Design decisions, and remove every consumer-written class from its examples. Where the change reaches another spec, a shared utility, building-blocks, or an ADR, propose the edit for the orchestrator instead of making it. Record the revision as a dated `### Amendment, <date> (class rule)` section in the [Spec: Responsive Toggle](24-spec-responsive-toggle.md) and the answer here. Model: Opus 5.5.
