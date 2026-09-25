# 14. Building-blocks map and cross-cutting architecture decisions

Type: grilling
Status: open
Blocked by: 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13
Labels: wayfinder:grilling
Map: ../map.md

## Question

Given all thirteen research findings, what is the cross-cutting design every plugin spec inherits, and which primitive does each of the 21 plugins build on?

Every directive or component must be the best combination of: Foundation for Sites SCSS; Foundation's component features; the ARIA APG pattern; WHATWG HTML and HTML5+ platform features; WAI-ARIA; Angular Aria; Angular CDK; Angular Material-equivalent accessibility for the similar Material component; Angular Material-equivalent component API (inputs, outputs, public properties and methods, content and view projection); and the modern DI patterns from the DI research (lightweight injection tokens, host-scoped providers, host directives, parent tokens, default-options tokens). The building-blocks map must show, per plugin, how each of these sources contributes.

Decide, and record each as a glossary term in `CONTEXT.md` or an ADR in `adr/` when it meets the ADR bar:

1. **Directive or component per plugin**: a matrix with the rule that produced each answer. Inputs to the rule: the repo skill `.claude/skills/foundation-api-design/SKILL.md` (its "one directive or component per structural CSS class" rule and naming pattern) and the user's standing preference for directives over components where the consumer already writes the Foundation markup. Also fix the spec shape: a `/to-spec` spec whose Implementation Decisions section carries the foundation-api-design tables (CSS class mapping, hierarchy, API, ARIA, keyboard, rendered HTML, Material comparison).
2. **Implementation rung per plugin**: native platform, `@angular/aria`, `@angular/cdk`, or custom, with the reason and the fallback if the first choice fails a prototype.
3. **Naming**: selector prefix, class names, file names, and how Foundation's plugin names map (Reveal stays Reveal, Drilldown versus DrilldownMenu, OffCanvas casing).
4. **Input and output conventions**: camelCased `data-*` options as `input()`, which become `model()`, how Foundation events map to `output()` names, and how to treat options that only exist because of jQuery.
5. **State and reactivity**: signals, `linkedSignal`, when a service is warranted, SSR and zoneless rules, DOM access rules (`afterRenderEffect`, Renderer).
6. **Animation strategy**: Motion UI classes versus `animate.enter` / `animate.leave` versus pure CSS, and `prefers-reduced-motion`.
7. **Breakpoints**: how `data-responsive-*` and `sticky-on`-style options are expressed (CSS media or container queries, CDK BreakpointObserver, a MediaQuery service mirroring Foundation's named breakpoints).
8. **Triggers**: whether `data-open`, `data-close`, `data-toggle` become directives, template references, or the Invoker Commands API.
9. **Accessibility baseline** shared by all specs.
10. **Testing seams** shared by all specs, from the tooling research.
11. **Shared utilities**: which of Foundation's utilities become their own spec (graduate fog if so; note it in the answer so the orchestrator can create tickets).
12. **Sass and theming**: in or out of scope for the specs.

Run `/grill-with-docs` against the research files under `research/` as the primary sources, playing both sides. Write `building-blocks.md` as the deliverable: a table of plugin, directive-or-component, rung, primitives, ARIA pattern, platform features, open risks. Write `CONTEXT.md` (glossary only, using the domain-modeling CONTEXT format) and `adr/NNNN-<slug>.md` files for decisions that meet the ADR bar. Mark anything you could not settle from sources as OPEN FOR HUMAN.
