# 26. Spec: Dropdown

Type: grilling
Status: open
Blocked by: 14, 38
Labels: wayfinder:grilling
Map: ../map.md

## Question

What is the Angular design for Foundation's Dropdown plugin in the next library, and what does its spec say?

The result must be the best combination of: Foundation for Sites SCSS and the plugin's features; the ARIA APG pattern and WAI-ARIA; WHATWG HTML and HTML5+ platform features; Angular Aria; Angular CDK; Angular Material-equivalent accessibility and Material-equivalent component API (inputs, outputs, public properties and methods, content and view projection) for the similar Material component; and the modern DI patterns recorded in `research/di-and-composition-patterns.md` (lightweight injection tokens, host-scoped providers, host directives, parent tokens, default-options tokens). One plugin may yield several related directives or components (for example a container plus items plus a lazy-content directive); the spec covers the whole set.

Read first: `building-blocks.md`, `CONTEXT.md`, `adr/*.md`, the research files `research/foundation-inventory-positioned.md`, `research/angular-cdk-inventory.md`, `research/aria-apg-patterns.md`, `research/web-platform-features.md`, `research/angular-material-reference.md`, and `research/di-and-composition-patterns.md`. Zoom into the resolved tickets they came from when a claim needs its source. Consult the `/angular-developer:angular-developer` skill (its references live under `~/.claude/plugins/cache/angular-skills/angular-developer/*/references/`, including `signal-forms.md`, `angular-aria.md`, `naming-conventions.md`, `host-elements.md`) and the repo skill at `.claude/skills/foundation-api-design/SKILL.md` for the API design document shape. Where that skill says to read `COMPONENT_BUILDING_BLOCKS.md` or the old `*_API_DESIGN.md` files, read `building-blocks.md` from this effort instead.

Run `/grill-with-docs` (self-grilling, both sides) over these questions, then publish the spec with `/to-spec` to `specs/dropdown.md`. The spec is a `/to-spec` spec: its top-level sections are exactly the to-spec template (Problem Statement, Solution, User Stories, Implementation Decisions, Testing Decisions, Out of Scope, Further Notes). The foundation-api-design material lives inside those sections as subsections: under Implementation Decisions put the CSS class to Angular mapping table, the directive or component hierarchy, the proposed API per directive or component (inputs, outputs, model signals, public methods, projection slots, DI tokens), the ARIA requirements table, the keyboard table, the rendered HTML structure, and the comparison with the Material counterpart; under Further Notes put usage examples and the design decisions table. Prose describes the API; short type-level signatures are allowed where prose would be less precise, and no file paths.

1. Directive or component, and the element or markup it attaches to; how it honours Foundation's CSS class contract.
2. Which implementation rung (platform, Aria, CDK, custom) it lands on, per the building-blocks map, and what a prototype must prove if the map flagged a risk. If a question cannot be settled from sources, write the precise prototype question under `## Prototype needed` in the answer so the orchestrator can create a prototype ticket; do not guess.
3. The ARIA pattern, roles, attributes, and keyboard table.
4. Every input (from Foundation's `data-*` options), its type, default, and whether it is `input()` or `model()`; every output (from Foundation's events); public methods if any.
5. State model in signals; SSR, zoneless, and hydration behaviour.
6. Animation and reduced-motion behaviour.
7. Foundation behaviours dropped or changed, with the reason.
8. Testing seams: which stories with play functions, which Vitest browser tests, which Playwright e2e, in the spec's Testing Decisions.

Plugin-specific questions:

- Positionable options: `position`, `alignment`, `autoFocus`, `allowOverlap`, `allowBottomOverlap`, `vOffset` / `hOffset`, `hover`, `hoverPane`, `hoverDelay`, `closeOnClick`, `forceFollow`, `trapFocus`, `parentClass`, `allowGroupedOpen` semantics.
- Native `popover` plus CSS anchor positioning versus CDK Overlay with a connected position strategy: which is the first rung, what the fallback is, and whether Foundation's `.dropdown-pane` CSS (absolute positioning, `.is-open`) survives either. If sources cannot settle this, write the prototype question precisely.
- Disclosure semantics, not menu semantics: `aria-expanded`, `aria-controls`, focus return.
- Content projection and the trigger-to-pane linking model (Triggers decision).

Use the glossary's vocabulary. Add glossary terms to `CONTEXT.md` and ADRs to `adr/` only when the domain-modeling bar is met. The ticket answer holds the decision log (each question and the answer chosen, with its source); the spec holds the synthesis.
