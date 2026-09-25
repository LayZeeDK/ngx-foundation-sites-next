# 06. Modern Angular 22.2 API survey

Type: research
Status: resolved
Blocked by: none
Labels: wayfinder:research
Map: ../map.md

## Question

Which Angular 22.2 APIs are available, at what stability, for building a directive-first component library, and what do they look like? The specs must be written against these, not against Angular 21 habits.

Cover at minimum: `signal`, `computed`, `effect`, `linkedSignal`, `resource` / `rxResource` / `httpResource`, `input` / `model` / `output`, `viewChild` / `contentChildren` and friends, `afterRenderEffect` and `afterNextRender`, host directives, `host` bindings, `@defer`, `animate.enter` / `animate.leave` and the state of `@angular/animations` (deprecated?), native CSS animation guidance, Signal Forms (`@angular/forms/signals`: `form`, `FormField`, schema validators, `Field` directive, stability), route-level features (route resources, `withComponentInputBinding`, `withViewTransitions`, `withInMemoryScrolling` and anchor scrolling), zoneless default, hydration and SSR constraints for DOM-touching directives, `DOCUMENT` and `PLATFORM_ID` replacements, `inject` options, `DestroyRef`, `ElementRef` and `Renderer2` guidance, the Vitest unit-test builder, and TypeScript 7 support.

Method:

1. Read the docs in the local clone first: `d:/projects/github/angular/angular/adev/src/content/guide/{signals,animations,forms,templates,components,directives,routing,testing}/**` and `d:/projects/github/angular/angular/adev/src/content/reference/**`. Version is 22.2.0 (release branch 22.2.x). Also read the `angular-developer` skill references under `~/.claude/plugins/cache/angular-skills/angular-developer/*/references/` (notably `signal-forms.md`, `angular-animations.md`, `angular-aria.md`, `resource.md`, `linked-signal.md`, `effects.md`, `host-elements.md`, `naming-conventions.md`, `data-resolvers.md`) and record where they and the clone disagree.
2. Use https://www.angular.courses/caniuse through the `/playwright-cli` skill to list the modern APIs it tracks and the version each became available or stable; capture that table. Load the skill file at `~/.claude/skills/playwright-cli/SKILL.md` for the command set. Close the browser when done.
3. Use the `angular-cli` MCP `search_documentation` tool (load it with ToolSearch, pass `version: 22`, `includeTopContent: true`) to confirm stability labels on angular.dev for anything the clone leaves ambiguous. Prefer markdown.new for full pages: POST JSON `{"url": "<target_url>", "method": "auto", "retain_images": true}` to `https://markdown.new/`.

## Deliverable

`research/angular-22-api-survey.md`: one section per API family with stability (stable, developer preview, experimental), a minimal signature or usage sketch, the doc path or URL it came from, and a short "relevance to a component library" note. Include the caniuse table. Plain ASCII.

## Answer

Gist (all cited in the findings file; source tags in `packages/**` are the authority, docs and caniuse second):

- Stable in 22.2 and safe to spec against: `signal`/`computed`/`untracked`, `linkedSignal` (with the new `set`/`rawSet` write-back option), `effect`, `afterRenderEffect`, `afterNextRender`/`afterEveryRender`, `input`/`model`/`output`, signal queries, `host` metadata, `hostDirectives` (now with de-duplication and diamond merging), `@defer` plus incremental hydration, `animate.enter`/`animate.leave` (also as host bindings), `resource`/`rxResource`/`httpResource` (publicApi 22.0), Signal Forms (`form()` publicApi 22.0, "Stable (v22+)"), `@angular/aria` (promoted to stable in v22), `withComponentInputBinding`, `withInMemoryScrolling` (`anchorScrolling`), `inject()` options, `DestroyRef`, `@Service()` (new v22 shorthand for `@Injectable({providedIn: 'root'})`, inject()-only), `injectAsync`, `DOCUMENT` from `@angular/core`, Vitest builder.
- Developer preview: `withViewTransitions` (19.0), route `resources`/`withRouterResources`/`nonBlocking` (22.2), `@boundary` error boundaries, `PendingTasks.run`, `pendingUntilEvent`, `provideCheckNoChangesConfig`. Experimental: `debounced`, `resourceFromSnapshots`, WebMCP, `withExperimentalPlatformNavigation`, `ExperimentalIsolatedShadowDom`.
- Deprecated: the whole `@angular/animations` package and its providers (20.2, "Intent to remove in v23"); `ChangeDetectionStrategy.Default` (use `Eager`; OnPush is the default in 22); `Router.getCurrentNavigation()` (use the `currentNavigation` signal); `Router.isActive` (use the `isActive()` function); `withFetch` (fetch is the default backend, `withXhr` opts out); `TestBed.flushEffects` (use `tick()`); `*ngIf`/`*ngFor`/`*ngSwitch`; `@HostBinding`/`@HostListener` are backwards-compat only.
- Zoneless is the default since v21 and OnPush the default component strategy in v22; a library component that hosts user components via `ViewContainerRef.createComponent` may need `Eager`, plain content projection does not.
- SSR/hydration rules for DOM-touching directives: no DOM mutation outside render callbacks, `ngSkipHydration` only on component hosts, no `isPlatformBrowser` template branches, prefer platform-specific providers, `Renderer2` cannot mutate DOM on the server, `REQUEST`/`RESPONSE_INIT` tokens in core.
- Signal Forms is the Abide replacement: schema rules (`required/min/max/minLength/maxLength/pattern/validate/validateTree/validateHttp/validateStandardSchema`, `disabled/hidden/readonly/debounce`), `FormField`/`FormRoot` directives, `FormValueControl`/`FormCheckboxControl` for custom controls, `transformedValue`, `focusBoundControl`; native constraint attributes are mirrored (except `pattern`) but native validity is not used.
- caniuse table captured (220 features, 22 down to 14) and embedded; it marks `debounced` and `resourceFromSnapshots` stable where the source says experimental.

Surprises:

- TypeScript 7 is not supported: `compiler-cli/src/typescript_support.ts` pins `>=6.0.0 <6.1.0`; roadmap says tsgo support is being prototyped. `map.md` targets typescript 7.0.2. OPEN FOR HUMAN: drop the TS target to 6.0.x or accept `disableTypeScriptVersionCheck`.
- `@Service()` exists and the v22 docs use it everywhere; `@Injectable` stays for constructor DI and advanced providers.
- `DOCUMENT` moved to `@angular/core`; `@angular/common` keeps a compatibility re-export.
- The `angular-developer` skill's `signal-forms.md` disagrees with the clone on `when` (not required-only), `null` in models (allowed), validator return (`null` fine), and `submit()` shape (`{action}` / `FormRoot`); its `linked-signal.md` misses the `set` option. Clone wins.
- `overview.md` for Signal Forms still says reactive forms are the choice for "production stability guarantees" while `comparison.md` and the v22 event page say Stable; treat as stale wording.
- playwright-cli: the default Chrome channel crashed the daemon twice (libuv assertion on Windows arm64); `--browser=msedge` worked on attempt 3.

Open questions not settled from sources:

- `validateAsync` (documented in the skill) was not verified in the clone guides; specs should cite `validateHttp` or check the API reference before using it.
- Whether Nx 23's Vitest executor exposes the Angular builder's `providersFile`/`animationsEnabled` conveniences is a tooling-ticket question.

Findings: ../research/angular-22-api-survey.md
