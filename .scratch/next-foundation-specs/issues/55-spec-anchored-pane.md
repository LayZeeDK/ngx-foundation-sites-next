# 55. Spec: Anchored pane (shared utility)

Type: grilling
Status: open
Blocked by: 14, 38, 44
Labels: wayfinder:grilling
Map: ../map.md

## Question

What is the API of the shared anchored-pane utility that Dropdown and Tooltip position and dismiss through, and what does its spec say?

This is a shared-utility spec graduated by the building-blocks decision: plugin specs depend on it, so its API must be settled before they are written. The result must be the best combination of the map's design criteria, applied to a utility: Foundation's own utility behaviour, the platform within the browser target, Angular CDK where it already solves the problem, Material-equivalent API shape, and the modern DI patterns in `research/di-and-composition-patterns.md`.

Read first: `building-blocks.md` (the shared-utilities section and every matrix row that uses this utility), `CONTEXT.md`, `adr/*.md`, `research/foundation-inventory-positioned.md`, `research/angular-cdk-inventory.md`, `research/angular-rendering-modes.md`, and the resolved answers of the tickets this one is blocked by. Consult the `/angular-developer:angular-developer` skill references and the repo skill `.claude/skills/foundation-api-design/SKILL.md`, reading `building-blocks.md` wherever that skill points at `COMPONENT_BUILDING_BLOCKS.md`.

Run `/grill-with-docs` (self-grilling, both sides) over these questions, then publish the spec with `/to-spec` to `specs/anchored-pane.md`. The spec is a `/to-spec` spec: its top-level sections are exactly the to-spec template (Problem Statement, Solution, User Stories, Implementation Decisions, Testing Decisions, Out of Scope, Further Notes). The foundation-api-design material lives inside those sections as subsections: under Implementation Decisions put the directive or service hierarchy, the proposed API (inputs, outputs, model signals, public methods, DI tokens and providers), the ARIA requirements it imposes on its consumers where any, and the comparison with the nearest Angular Material or CDK counterpart; under Further Notes put usage examples and the design decisions table. Prose describes the API; short type-level signatures are allowed where prose would be less precise, and no file paths.

1. The API shape and why: service, directive family, tokens, provider functions, default-options token.
2. Which plugin specs consume it and exactly what each needs from it; read the building-blocks matrix rows for those plugins.
3. State model in signals; zoneless behaviour; and the rendering-modes contract from `research/angular-rendering-modes.md` and ADR 0008: server output and first-paint state, what must not run before hydration, hydration boundaries, prerendering, event replay readiness, and behaviour inside `@defer` blocks.
4. Platform features used, all within the map's browser target, with the fallback named where a newer feature would be better.
5. Testing seams, per the map's Testing rule: story play functions, browser-level tests (stack decided by the browser testing stack decision ticket; stay stack-neutral until it resolves), node-level Vitest (server-render smoke test and pure logic), Playwright e2e.

Use the glossary's vocabulary. Add glossary terms to `CONTEXT.md` and ADRs to `adr/` only when the domain-modeling bar is met. The ticket answer holds the decision log (each question and the answer chosen, with its source); the spec holds the synthesis.

Utility-specific questions:

- The positioner service (placements, alignment, offsets, auto-position, body-box bound, RTL) per the anchored pane prototype's verdict, and the CDK Overlay fallback path.
- The light-dismiss registry: outside click, Escape, focus leaving, nested panes, and one-open-at-a-time groups.
- Hover intent with `pointerenter`, which event replay does not cover, and the pre-hydration click path.
