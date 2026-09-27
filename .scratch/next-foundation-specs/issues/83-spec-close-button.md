# 83. Spec: Close Button

Type: grilling
Status: open
Blocked by: 81
Labels: wayfinder:grilling
Map: ../map.md

## Question

What Angular directives (preferred) or components give Foundation for Sites 6.9's Close Button to the next, from-scratch ngx-foundation-sites repo, under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Foundation's docs page is `docs/pages/close-button.md` and its Sass is `scss/components/_close-button.scss` in the 6.9.0 clone. Publish `specs/close-button.md`.

Known from the triage: Composes with the Triggers utility's `nfsClose`, never `nfsButton`; owns the `type="button"` default and a name check (its glyph is `aria-hidden`); settle where 2.5.8 is met.

## How to work it

Run `/grill-with-docs` (self-grilling, both sides) over the questions this component raises, then publish with `/to-spec` in the map's spec shape; the [Spec: Button](37-spec-button.md) is the nearest precedent. Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this component); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Cover: one directive per Structural class and what else each owns (the ARIA, `type` default, or development and compile-time checks the documented markup lacks for WCAG 2.2 AA, ADR 0022); every Variant as a typed input by the decision above; State classes as host bindings; the Sass mixin only where custom CSS or checks are needed (ADR 0012); the rendering-mode contract; stories with play functions and axe; e2e only where Storybook cannot reach. Record the decisions in this ticket's Answer, and propose shared-file changes (a building-blocks row, glossary terms) for the orchestrator. Model: Opus 5.5.
