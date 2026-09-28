# 140. Research: directive and component architecture principles for Angular UI libraries

Type: research
Status: claimed
Blocked by: none
Labels: wayfinder:research
Map: ../map.md

## Question

The user asked on 2026-09-28 for researched guiding principles for directive and component architecture in Angular UI component libraries, gave a draft to start from ([research/architecture-principles-user-draft.md](../research/architecture-principles-user-draft.md), 15 principles, four layers, a decision framework; the user added the same day that Microsoft Copilot generated the draft with little to no research: it is a list of candidate principles and questions to test, with no weight of its own, and a principle enters the guide only on the research's evidence), and asked for a guide authored from them, an audit of every spec against the guide, and every surviving finding resolved. What do primary sources say about each draft principle and about the principles the draft lacks, and where does each one hold, need a qualification, or conflict with Angular 22.2, the Baseline browser target, Foundation's CSS contract, or this map's recorded decisions?

## How to work it

Three `/research` subagents in parallel, each writing one findings file with a source for every claim:

1. Angular ecosystem (Sonnet 5, an evidence sweep): angular.dev (components, directives, host directives and directive composition, DI and lightweight injection tokens, signals, `input()`/`model()`/`output()`, content projection, the style guide), the angular/components repository's own conventions for Angular Aria, the CDK, and Material (coding standards, API design docs, public API shape), and first-party documentation of other Angular libraries (for example Spartan, ng-primitives, Taiga UI, NG-ZORRO, PrimeNG, Clarity, ng-bootstrap). File: `research/architecture-angular-ecosystem.md`.
2. Headless primitives and the platform (Sonnet 5, an evidence sweep): the design principles of Radix UI, React Aria, Headless UI, Ark UI and Zag, Base UI, shadcn/ui, and Open UI, the WAI-ARIA APG, and the web platform (dialog, popover, anchor positioning, `:has()`, and so on, each checked against the map's Baseline 2026-05-07 target), with how each principle translates to Angular (directives and `hostDirectives` in place of `asChild` or slots, DI in place of React context). File: `research/architecture-headless-primitives.md`.
3. Critique (Opus 5.5, an adversarial lens): each draft principle, layer, and decision rule tested against Angular 22.2's source and docs, the Baseline target, Foundation's class-based styling contract, and this map's recorded decisions (ADRs, building-blocks, the standing preferences and user rulings in the map's Notes); principles the draft lacks (rendering modes, entry points and tree shaking, forms integration, theming and Sass, naming, deprecation and versioning, testing harnesses, internationalisation and direction). File: `research/architecture-principles-critique.md`.

Resolved when the three files exist; the Answer lists them with a few lines each. [Decide: the directive and component architecture guide](141-decide-directive-component-architecture-guide.md) writes the guide from them.
