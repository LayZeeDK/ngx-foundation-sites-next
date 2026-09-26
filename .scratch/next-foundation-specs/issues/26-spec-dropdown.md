# 26. Spec: Dropdown

Type: grilling
Status: open
Blocked by: 14, 38, 54, 55
Labels: wayfinder:grilling
Map: ../map.md

## Question

What is the Angular design for Foundation's Dropdown plugin in the next library, and what does its spec say?

The result must be the best combination of: Foundation for Sites SCSS and the plugin's features; the ARIA APG pattern and WAI-ARIA; WHATWG HTML and HTML5+ platform features; Angular Aria; Angular CDK; Angular Material-equivalent accessibility and Material-equivalent component API (inputs, outputs, public properties and methods, content and view projection) for the similar Material component; and the modern DI patterns recorded in `research/di-and-composition-patterns.md` (lightweight injection tokens, host-scoped providers, host directives, parent tokens, default-options tokens). One plugin may yield several related directives or components (for example a container plus items plus a lazy-content directive); the spec covers the whole set.

Read first: `building-blocks.md`, `CONTEXT.md`, `adr/*.md`, the research files `research/foundation-inventory-positioned.md`, `research/angular-cdk-inventory.md`, `research/aria-apg-patterns.md`, `research/web-platform-features.md`, `research/angular-material-reference.md`, `research/di-and-composition-patterns.md`, `research/angular-rendering-modes.md`, and the resolved answers of every prototype and shared-utility spec ticket this ticket is blocked by. Zoom into the resolved tickets they came from when a claim needs its source. Consult the `/angular-developer:angular-developer` skill (its references live under `~/.claude/plugins/cache/angular-skills/angular-developer/*/references/`, including `signal-forms.md`, `angular-aria.md`, `naming-conventions.md`, `host-elements.md`) and the repo skill at `.claude/skills/foundation-api-design/SKILL.md` for the API design document shape. Where that skill says to read `COMPONENT_BUILDING_BLOCKS.md` or the old `*_API_DESIGN.md` files, read `building-blocks.md` from this effort instead.

Run `/grill-with-docs` (self-grilling, both sides) over these questions, then publish the spec with `/to-spec` to `specs/dropdown.md`. The spec is a `/to-spec` spec: its top-level sections are exactly the to-spec template (Problem Statement, Solution, User Stories, Implementation Decisions, Testing Decisions, Out of Scope, Further Notes). The foundation-api-design material lives inside those sections as subsections: under Implementation Decisions put the CSS class to Angular mapping table, the directive or component hierarchy, the proposed API per directive or component (inputs, outputs, model signals, public methods, projection slots, DI tokens), the ARIA requirements table, the keyboard table, the rendered HTML structure, and the comparison with the Material counterpart; under Further Notes put usage examples and the design decisions table. Prose describes the API; short type-level signatures are allowed where prose would be less precise, and no file paths.

1. Directive or component, and the element or markup it attaches to; how it honours Foundation's CSS class contract.
2. Which implementation rung (platform, Aria, CDK, custom) it lands on, per the building-blocks map, and what a prototype must prove if the map flagged a risk. If a question cannot be settled from sources, write the precise prototype question under `## Prototype needed` in the answer so the orchestrator can create a prototype ticket; do not guess.
3. The ARIA pattern, roles, attributes, and keyboard table.
4. Every input (from Foundation's `data-*` options), its type, default, and whether it is `input()` or `model()`; every output (from Foundation's events); public methods if any.
5. State model in signals; zoneless behaviour; and the rendering-modes contract from `research/angular-rendering-modes.md` and ADR 0008: server render output and first-paint state, what must not run before hydration, full and incremental hydration (`@defer (hydrate on ...)`) boundaries, prerendering, event replay readiness (which listeners replay, and `preventDefault()` ordering), and behaviour inside `@defer` blocks.
6. Animation and reduced-motion behaviour.
7. Foundation behaviours dropped or changed, with the reason.
8. Testing seams, per the map's Testing rule and the testing section of `building-blocks.md`: story play functions (Storybook on `@storybook/angular-vite` with `@storybook/addon-vitest`), browser-level tests (the stack is set by the browser testing stack decision ticket; write them stack-neutral until it resolves), node-level Vitest (a server-render smoke test and pure logic), and Playwright e2e (web-native APIs, the static Storybook build, and the prerendered fixture app for hydration and pre-hydration clicks), in the spec's Testing Decisions.

Plugin-specific questions:

- Positionable options: `position`, `alignment`, `autoFocus`, `allowOverlap`, `allowBottomOverlap`, `vOffset` / `hOffset`, `hover`, `hoverPane`, `hoverDelay`, `closeOnClick`, `forceFollow`, `trapFocus`, `parentClass`, `allowGroupedOpen` semantics.
- Native `popover` plus CSS anchor positioning versus CDK Overlay with a connected position strategy: which is the first rung, what the fallback is, and whether Foundation's `.dropdown-pane` CSS (absolute positioning, `.is-open`) survives either. If sources cannot settle this, write the prototype question precisely.
- Disclosure semantics, not menu semantics: `aria-expanded`, `aria-controls`, focus return.
- Content projection and the trigger-to-pane linking model (Triggers decision).

Two guards from the research-wave audit (`audits/0001-research-wave.md`, findings H6 and M12):

- The option names in the plugin-specific questions above were written while charting, before the inventories existed, and some are wrong or missing. Take the option, event, and method list from the Foundation inventory research and Foundation's own `defaults` object in the plugin source, not from this ticket.
- Platform features outside the map's browser target (see `research/web-platform-features.md`; for example `popover`, CSS anchor positioning, `<details name>`, `interpolate-size`, `@starting-style`, `:has()`, invoker commands) may appear only as a named future upgrade or behind a stated fallback, as the building-blocks decision already ruled.

Use the glossary's vocabulary. Add glossary terms to `CONTEXT.md` and ADRs to `adr/` only when the domain-modeling bar is met. The ticket answer holds the decision log (each question and the answer chosen, with its source); the spec holds the synthesis.

## WCAG 2.2 AA guard (user decision, 2026-09-26)

Every directive and component complies with WCAG 2.2 AA; see the map's Accessibility preference and [ADR 0022](../adr/0022-wcag-2-2-aa-enforcement.md). The spec carries a criteria subsection under Implementation Decisions naming the 2.2 AA criteria this plugin touches (at least 1.4.3, 1.4.11, 2.4.7, 2.4.11, 2.5.8, 4.1.2, and, for overlays and hover content, 1.4.13) and how each is met, as requirements, never recommendations. Where a Foundation default fails a criterion, the spec states the Sass settings the consumer must set or the smallest custom rule the `nfs-<plugin>` mixin adds, with the reason. The story axe gate runs with the WCAG 2.2 AA tags, and the decision log records each criterion addressed.

## Note from the research repairs (2026-09-25)

Audit 0001 finding H5 corrected the Foundation facts in `research/angular-material-reference.md` that this ticket reads. Take these as given:

- `data-position` and `data-alignment` have no CSS side: the legacy `.top/.right/.bottom/.left` classes and the `has-position-*`/`has-alignment-*` classes carry no Sass rule on `.dropdown-pane` (`scss/components/_dropdown.scss`). Foundation positions the pane entirely through inline offsets from Positionable. Do not design the API around a position class; follow ADR 0002 and the Anchored pane spec.
