# 13. Modern DI and composition patterns in Angular, Aria, CDK, Material, and Google product wrappers

Type: research
Status: open
Blocked by: none
Labels: wayfinder:research
Map: ../map.md

## Question

Which dependency-injection and composition patterns do Angular's own libraries use in 22.2 for parent-child component relationships, content projection, optional integration, and tree-shakable public APIs, and which of them does this repo already use? Every spec must state its DI shape (tokens, host directives, content queries) using these patterns rather than inventing new ones.

Cover:

1. **Lightweight injection tokens** (`d:/projects/github/angular/angular/adev/src/content/guide/di/lightweight-injection-tokens.md`): the pattern, when it applies to a library, and concrete uses in `d:/projects/github/angular/components/src` (search for abstract-class tokens and `InjectionToken` used to avoid retaining components).
2. **Hierarchical DI and host-scoped providers** (`d:/projects/github/angular/angular/adev/src/content/guide/di/hierarchical-dependency-injection.md`, `defining-dependency-providers.md`): `providers` versus `viewProviders`, `host` / `self` / `skipSelf` / `optional` `inject()` flags, and why content-projected children resolve against the declaration site.
3. **Parent discovery patterns** in Aria, CDK, and Material: injection tokens for parents (for example `MAT_ACCORDION`, `CDK_ACCORDION`, `MAT_MENU_PANEL`, `MatTabGroup` via token), `contentChildren` with `descendants`, and how `@angular/aria` patterns discover items.
4. **Host directives** (`hostDirectives`) as a composition tool in Aria, CDK, and Material, with examples.
5. **Configuration tokens** (`MAT_TOOLTIP_DEFAULT_OPTIONS`-style default option tokens, `provideXxx()` functions) and how consumers override defaults globally.
6. **Google product wrappers** in `d:/projects/github/angular/components/src/youtube-player` and `d:/projects/github/angular/components/src/google-maps`: how they wrap an external DOM or script API in signals and inputs, load scripts lazily, handle SSR, and expose events (`map-event-manager.ts`); what transfers to wrapping Foundation markup.
7. **This repo's own patterns**: the content-projection DI rule in `AGENTS.md` and the token usage under `packages/ngx-foundation-sites/src/lib/accordion` and `core`. Report what it does; do not copy its naming into the findings as a decision.
8. **Public API surfaces**: how Material exposes public properties and methods on directives (for example `open()`, `close()`, `toggle()`, `opened` signals), how outputs are named, and how `model()` is used for two-way state, so the specs can be Material-equivalent in API shape.

Sources under `d:/projects/github/angular/angular` and `d:/projects/github/angular/components`; online https://angular.dev/guide/di via markdown.new when needed.

## Deliverable

`research/di-and-composition-patterns.md`: one section per item with concrete cited examples, and a closing "pattern catalogue" table (pattern, when to use, example path) the building-blocks ticket can adopt. Plain ASCII.
