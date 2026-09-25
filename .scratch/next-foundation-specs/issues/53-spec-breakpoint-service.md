# 53. Spec: Breakpoint service (shared utility)

Type: grilling
Status: open
Blocked by: 14, 38
Labels: wayfinder:grilling
Map: ../map.md

## Question

What is the API of the library's breakpoint utility, the one source of truth every breakpoint-gated plugin reads, and what does its spec say?

This is a shared-utility spec graduated by the building-blocks decision: plugin specs depend on it, so its API must be settled before they are written. The result must be the best combination of the map's design criteria, applied to a utility: Foundation's own utility behaviour, the platform within the browser target, Angular CDK where it already solves the problem, Material-equivalent API shape, and the modern DI patterns in `research/di-and-composition-patterns.md`.

Read first: `building-blocks.md` (the shared-utilities section and every matrix row that uses this utility), `CONTEXT.md`, `adr/*.md`, `research/foundation-utilities-conventions.md`, `research/angular-cdk-inventory.md`, `research/angular-rendering-modes.md`, `research/web-platform-features.md`, and the resolved answers of the tickets this one is blocked by. Consult the `/angular-developer:angular-developer` skill references and the repo skill `.claude/skills/foundation-api-design/SKILL.md`, reading `building-blocks.md` wherever that skill points at `COMPONENT_BUILDING_BLOCKS.md`.

Run `/grill-with-docs` (self-grilling, both sides) over these questions, then publish the spec with `/to-spec` to `specs/breakpoint-service.md`. The spec is a `/to-spec` spec: its top-level sections are exactly the to-spec template (Problem Statement, Solution, User Stories, Implementation Decisions, Testing Decisions, Out of Scope, Further Notes). The foundation-api-design material lives inside those sections as subsections: under Implementation Decisions put the directive or service hierarchy, the proposed API (inputs, outputs, model signals, public methods, DI tokens and providers), the ARIA requirements it imposes on its consumers where any, and the comparison with the nearest Angular Material or CDK counterpart; under Further Notes put usage examples and the design decisions table. Prose describes the API; short type-level signatures are allowed where prose would be less precise, and no file paths.

1. The API shape and why: service, directive family, tokens, provider functions, default-options token.
2. Which plugin specs consume it and exactly what each needs from it; read the building-blocks matrix rows for those plugins.
3. State model in signals; zoneless behaviour; and the rendering-modes contract from `research/angular-rendering-modes.md` and ADR 0008: server output and first-paint state, what must not run before hydration, hydration boundaries, prerendering, event replay readiness, and behaviour inside `@defer` blocks.
4. Platform features used, all within the map's browser target, with the fallback named where a newer feature would be better.
5. Testing seams, per the map's Testing rule: story play functions, browser-level tests (stack decided by the browser testing stack decision ticket; stay stack-neutral until it resolves), node-level Vitest (server-render smoke test and pure logic), Playwright e2e.

Use the glossary's vocabulary. Add glossary terms to `CONTEXT.md` and ADRs to `adr/` only when the domain-modeling bar is met. The ticket answer holds the decision log (each question and the answer chosen, with its source); the spec holds the synthesis.

Utility-specific questions:

- `NfsMediaQuery` as a signal service, `nfsBreakpointsToken` with Foundation's default map, `atLeast`, `upTo`, `only`, `is`, and the current breakpoint as signals.
- The rule-string parser shared by ResponsiveMenu, ResponsiveAccordionTabs, ResponsiveToggle `hideFor`, Tooltip `showOn`, Sticky `stickyOn`, OffCanvas `revealOn` and `inCanvasOn`, and Interchange named queries (`landscape`, `portrait`, `retina`).
- `reducedMotion()` as a signal.
- The server answer (the building-blocks decision says `small`) and the client-hint `useFactory` recipe reading `REQUEST`.
- How the Sass `$breakpoints` map and the token stay in sync, coordinated with the Sass packaging ticket.
