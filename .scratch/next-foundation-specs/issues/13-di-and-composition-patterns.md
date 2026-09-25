# 13. Modern DI and composition patterns in Angular, Aria, CDK, Material, and Google product wrappers

Type: research
Status: resolved
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

## Answer

- Parent handles in Aria, CDK, and Material are `InjectionToken` constants, not abstract classes: `ACCORDION_GROUP`, `TABS`/`TAB_LIST`, `LISTBOX`, `MENU_COMPONENT`, `CDK_ACCORDION`, `MAT_ACCORDION`, `MAT_TAB_GROUP`, `MAT_MENU_PANEL`. Parent declares `providers: [{provide: TOKEN, useExisting: Parent}]`; Aria keeps tokens in `*-tokens.ts` with `import type`. CDK and Material comments cite class retention and circular imports as the reasons. The abstract-class form from the lightweight-token guide appears only where the token is a contract consumers implement (`MatFormFieldControl`).
- Content-projected children resolve DI at their declaration site; a parent reachable from consumer markup must use `providers`, never `viewProviders`. The guide's escape hatch is `<ng-template>` plus `[ngTemplateOutletInjector]`.
- Flag vocabulary in use: `{optional, skipSelf}` plus a `useValue: undefined` shadow provider for same-kind parents (CdkAccordionItem, MatExpansionPanel); `{optional, self}` for a sibling directive on the same element (CdkMenuItem, MatInput with Signal Forms `FORM_FIELD`); `{host: true}` for a projected child that must fail outside its parent (MatExpansionPanelHeader); `HostAttributeToken` for static attributes.
- Aria does not use `contentChildren` for item discovery. Children inject the parent token and `register()`/`unregister()` into a parent-owned `SortedCollection` that sorts by DOM order with a `MutationObserver`; Material uses `@ContentChildren(X, {descendants: true})` filtered by `closestParent === this`. Non-nested pairs link by `input.required<Target>()` (trigger to panel, trigger to menu) or by string value (tab to tabpanel).
- `hostDirectives` is Aria's composition primitive: selector-less `DeferredContentAware`/`DeferredContent` are applied as host directives on panels and `ng-template` content; the official examples wrap Aria behaviors in Foundation-style wrappers (`hostDirectives: [{directive: Menu}]` plus `host: {class, popover: 'manual'}` and `inject(Menu)`). Host directives must be exported from the package.
- Config tokens come in two shapes: `X_DEFAULT_OPTIONS` with `{providedIn: 'root', factory}` injected required (tooltip, menu), or bare `X_CONFIG` injected `{optional: true}` and applied in the constructor (tabs, expansion, youtube-player). `provideX()` functions exist only for the date adapters; none in CDK or Aria.
- Google wrappers transfer four habits: `isPlatformBrowser`/`Platform.isBrowser` guard with a static server state, `inject(Parent)` from content-projected children, dev-mode `_assertInitialized`/`reportViolations` guards, and restoring patched globals on destroy. Their lazy `Observable` outputs need a subscriber hook that signal `output()` lacks.
- Material API vocabulary: `open()/close()/toggle()`, `openAll()/closeAll()`, past-tense outputs (`opened`, `closed`, `afterExpand`, `menuClosed`), `xChange` two-way companions, `exportAs` on every directive. Aria is 100 percent signal inputs with `model()` for `expanded`/`selectedTab`/`value` and `linkedSignal` bridging model to internal state; Material is still 492 `@Input` to 15 `input()`.
- This repo: `AGENTS.md` documents the CDK token pattern (`nfsAccordionToken`, `optional` + `skipSelf`), but the accordion code uses no `InjectionToken`; it builds a per-item `Injector.create({providers: [{provide: NfsAccordionItemDef, useValue: item}]})` and renders `ng-template` items through `[ngTemplateOutletInjector]`, with header/content directives self-registering by constructor injection. It wraps Aria inside its own component view and owns all Foundation markup. Its template binds `[panelId]` on Aria trigger/panel, which is the Angular 21 API, not 22.2's `[panel]`/`id`.

Surprises: Aria abandoned `contentChildren` for menus because the query shrank on each open/close (documented in `menu.ts`); Material has only one `hostDirectives` use; `MAT_TAB_GROUP` and `MAT_TAB` are typed `any`.

Open questions: whether the new library exposes wrappers as directives with `hostDirectives` over Aria (the examples' shape) or as components that own the markup (this repo's shape) is a per-plugin decision for the building-blocks ticket; whether outputs that need lazy listener attachment should stay `outputFromObservable` or accept always-on `host` listeners.

Findings: ../research/di-and-composition-patterns.md
