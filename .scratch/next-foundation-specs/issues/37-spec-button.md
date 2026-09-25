# 37. Spec: Button

Type: grilling
Status: open
Blocked by: 14, 38
Labels: wayfinder:grilling
Map: ../map.md

## Question

What is the Angular design for Foundation's Button component in the next library, and what does its spec say? Button has no Foundation JavaScript plugin; it is a CSS component the user added to the destination, so the spec must earn its directive with something beyond applying a class.

The result must be the best combination of: Foundation for Sites SCSS and the component's features; the ARIA APG button pattern and WAI-ARIA; WHATWG HTML (`<button>`, `<a>`, `<input type="submit">`, the `disabled` attribute, `aria-disabled`, form-associated behaviour); Angular Aria and Angular CDK where they apply; Angular Material-equivalent accessibility and Material-equivalent component API (Material's button is a directive family on native `button` and `a` elements with appearance variants); and the modern DI patterns recorded in `research/di-and-composition-patterns.md`. One component may yield several related directives (for example button, button group, close button); the spec covers the set it decides on.

Read first: `building-blocks.md`, `CONTEXT.md`, `adr/*.md`, `research/di-and-composition-patterns.md`, `research/angular-material-reference.md`, `research/aria-apg-patterns.md`, `research/web-platform-features.md`, and `research/angular-22-api-survey.md`. For Foundation's side read `d:/projects/github/foundation/foundation-sites/docs/pages/button.md`, `docs/pages/button-group.md`, `docs/pages/close-button.md`, and `scss/components/_button.scss` and `_button-group.scss` (the Sass map of sizes, colors, and the `hollow`, `clear`, `expanded`, `disabled`, `dropdown`, `arrow-only` modifiers). For Material's side read `d:/projects/github/angular/components/src/material/button/**` (selectors, appearance inputs, `disabledInteractive`, `MAT_BUTTON_CONFIG`, harness). For the APG read `d:/projects/github/w3c/aria-practices/content/patterns/button/`. Do not read this repo's existing Button implementation or `packages/ngx-foundation-sites/BUTTON_API_DESIGN.md` and `BUTTON_REVIEW.md`; the design starts from scratch. Consult the `/angular-developer:angular-developer` skill references and the repo skill at `.claude/skills/foundation-api-design/SKILL.md` for the API design document shape, reading `building-blocks.md` wherever that skill points at `COMPONENT_BUILDING_BLOCKS.md`.

Run `/grill-with-docs` (self-grilling, both sides) over these questions, then publish the spec with `/to-spec` to `specs/button.md`. The spec is a `/to-spec` spec: its top-level sections are exactly the to-spec template (Problem Statement, Solution, User Stories, Implementation Decisions, Testing Decisions, Out of Scope, Further Notes). The foundation-api-design material lives inside those sections as subsections: under Implementation Decisions put the CSS class to Angular mapping table, the directive hierarchy, the proposed API per directive (inputs, outputs, model signals, public methods, projection slots, DI tokens), the ARIA requirements table, the keyboard table, the rendered HTML structure, and the comparison with the Material counterpart; under Further Notes put usage examples and the design decisions table. Prose describes the API; short type-level signatures are allowed where prose would be less precise, and no file paths.

1. Directive on native `button` and `a` (and `input[type=submit]`?) elements versus a component; selector shape (attribute selector on native elements, as Material does) and how it honours Foundation's `.button` class contract.
2. Which implementation level (platform, Aria, CDK, custom) it lands on; what a prototype must prove if the map flagged a risk. If a question cannot be settled from sources, write the precise prototype question under `## Prototype needed` in the answer; do not guess.
3. ARIA: native semantics first; `aria-disabled` versus `disabled` (Material's `disabledInteractive`), toggle buttons (`aria-pressed`), icon-only buttons and accessible names, the `.close-button` case, and `a.button` without `href`.
4. Inputs: size (`tiny`, `small`, `default`, `large`), color (`primary`, `secondary`, `success`, `warning`, `alert`), `hollow`, `clear`, `expanded`, `disabled`, `dropdown` arrow, `arrowOnly`; which become `input()` with transforms, which are enums, and whether a default-options token sets them library-wide. Outputs: none beyond native events unless the grilling finds one.
5. Button group: `.button-group` with `expanded`, `stacked`, `stacked-for-small`, sizes and colors inherited by children; whether it is a directive that provides defaults to child buttons through DI (parent token) or plain markup guidance.
6. State model in signals; SSR, zoneless, and hydration behaviour; host bindings for classes.
7. Foundation behaviours dropped or changed, with the reason.
8. Testing seams: which stories with play functions, which Vitest browser tests, which Playwright e2e, in the spec's Testing Decisions.

Use the glossary's vocabulary. Add glossary terms to `CONTEXT.md` and ADRs to `adr/` only when the domain-modeling bar is met. The ticket answer holds the decision log (each question and the answer chosen, with its source); the spec holds the synthesis.
