# Angular 22.2 API survey for a directive-first component library

Ticket: `../issues/06-angular-22-api-survey.md`
Date: 2026-09-25
Clone surveyed: `d:/projects/github/angular/angular` at release branch 22.2.x, `package.json` version 22.2.0. Components clone `d:/projects/github/angular/components` version 22.2.0.
Paths below are relative to the Angular clone unless prefixed. `adev/...` is the angular.dev source; `packages/...` is framework source, where a JSDoc `@publicApi <ver>`, `@developerPreview <ver>`, `@experimental <ver>` or `@deprecated <ver>` tag is the authoritative stability label.

Corrected 2026-09-25 after [Audit 0001: research wave](../audits/0001-research-wave.md), findings H4, M8, M11: see Corrections.

## Corrections

- H4: "Version compatibility and TypeScript 7" and "Testing: Vitest builder and browser mode" stated a stale TypeScript 7.0.2 / Vitest 5.0.2 target and left it open. The target is TypeScript 6.0.x and Vitest 4.1.x, pinned by [Tooling baseline: Nx 23.2, Angular 22.2, Storybook 10.6, Vitest browser mode](../issues/12-tooling-baseline.md). Both sentences are fixed below.
- M8: the same "Testing: Vitest builder and browser mode" relevance note also named the wrong Nx executor; fixed against the tooling research. "`@defer` and incremental hydration" stated incremental hydration needs an explicit feature flag; fixed against [Angular 22.2 @defer, SSR, prerendering, hydration, and event replay for DOM-touching directives](../issues/38-angular-rendering-modes.md) section 0.
- M11: "Queries" and "Host bindings and host directives" stated composition choices as settled; both are reworded as candidates, owned by [Building-blocks map and cross-cutting architecture decisions](../issues/14-building-blocks-map.md).

## How to read stability labels

From `adev/src/content/reference/releases.md`:

- Stable: normal deprecation policy applies (lines 1-160).
- Developer Preview (line 163-168): "fully functional and polished, but ... not ready to stabilize under our normal deprecation policy"; may change in any minor.
- Experimental (line 171-175): "might not become stable at all"; can change in any patch.

The source sweep (`rg '@(developerPreview|experimental)' packages/{core,common,router,forms,animations,platform-browser,platform-server}`) found only these non-stable public symbols in 22.2. Everything else in the public API of those packages carries a plain `@publicApi` tag, so the default for any API not listed here is stable:

| Symbol | Label | Source |
| --- | --- | --- |
| `withViewTransitions`, `ViewTransitionsFeatureOptions`, `ViewTransitionInfo` | developerPreview 19.0 | `packages/router/src/provide_router.ts:890`, `utils/view_transition.ts:24,46` |
| `withRouterResources`, `RouterResourcesFeature`, `Route.resources`, `ResourceContext`, `ResourceResult`, `ActivatedRoute.resources`, `nonBlocking`, `routerResource` | developerPreview 22.2 | `packages/router/src/provide_router.ts:912,933`, `models.ts:30-65,765`, `router_state.ts:177,402`, `router_resource.ts:55` |
| `withExperimentalPlatformNavigation` | experimental 21.1 | `packages/router/src/provide_router.ts:200,244` |
| `PlatformNavigation` | experimental 21.0.0 | `packages/common/src/navigation/platform_navigation.ts:44` |
| `RouteReuseStrategy.shouldDestroyInjector` | experimental 17.0 | `packages/router/src/router_config.ts:273` |
| `ErrorDetails` (for `@boundary`) | developerPreview 22.2 | `packages/core/src/error_handler.ts:25` |
| `ViewEncapsulation.ExperimentalIsolatedShadowDom` | experimental 21.0 | `packages/core/src/metadata/view.ts:52` |
| `PendingTasks.run` | developerPreview 19.0 | `packages/core/src/pending_tasks.ts:74` |
| `pendingUntilEvent` | developerPreview 20.0 | `packages/core/rxjs-interop/src/pending_until_event.ts:19` |
| `provideCheckNoChangesConfig` | developerPreview 20.0 | `packages/core/src/change_detection/provide_check_no_changes_config.ts:22,35` |
| `debounced`, `DebouncedOptions`, `DebounceTimer` | experimental 22.0 | `packages/core/src/resource/debounce.ts:32`, `api.ts:316,331` |
| `resourceFromSnapshots` | experimental (no version) | `packages/core/src/resource/from_snapshots.ts:19` |
| WebMCP: `provideExperimentalWebMcpTools`, `declareExperimentalWebMcpTool`, `Client`, `Execute`, `Annotations`, `ToolDescriptor` | experimental 22.0 / 22.2 | `packages/core/src/webmcp/*` |
| `provideExperimentalWebMcpForms`, `form(..., {experimentalWebMcpTool})` | experimental | `packages/forms/signals/src/webmcp/registration.ts:155`, `api/structure.ts:64` |

Deprecations that matter to a component library:

| Symbol | Deprecated since | Replacement | Source |
| --- | --- | --- | --- |
| `@angular/animations` package, `provideAnimations`, `provideAnimationsAsync`, `provideNoopAnimations`, `BrowserAnimationsModule`, `NoopAnimationsModule` | 20.2, "Intent to remove in v23" | `animate.enter` / `animate.leave` + CSS | `packages/platform-browser/animations/src/module.ts:23,38,95,109,138`, `animations/async/src/providers.ts:50` |
| `ChangeDetectionStrategy.Default` | 21.2 | `ChangeDetectionStrategy.Eager`; `OnPush` is now the default | `packages/core/src/change_detection/constants.ts:25-40`, `CHANGELOG.md:859` |
| `Router.getCurrentNavigation()` | 20.2 | `Router.currentNavigation` signal | `packages/router/src/router.ts:177,368` |
| `Router.isActive()` | 21.1 | `isActive()` function from `@angular/router` | caniuse; `adev/src/content/guide/routing/read-route-state.md:329-354` |
| `withExperimentalAutoCleanupInjectors` | 22.2 | `withAutoCleanupInjectors` (publicApi 22.2) | `packages/router/src/provide_router.ts:758-773` |
| `withFetch` | 22 | nothing; `FetchBackend` is the default `HttpBackend`; `withXhr` opts back in | `packages/common/http/src/provider.ts:307-334` |
| `TestBed.flushEffects` | - | `TestBed.tick()` | `packages/core/testing/src/test_bed.ts:201-210` |
| `*ngIf`, `*ngFor`, `*ngSwitch` | 20 | `@if`, `@for`, `@switch` | caniuse table below |
| `@HostBinding`, `@HostListener` | not deprecated, "exist exclusively for backwards compatibility" | `host` metadata | `adev/src/content/guide/components/host-elements.md:106-109` |

## Version compatibility and TypeScript 7

- `adev/src/content/reference/versions.md` lists 22.0.x with Node `^22.22.3 || ^24.15.0 || ^26.0.0`, TypeScript `>=6.0.0 <6.1.0`, RxJS `^6.5.3 || ^7.4.0`. The angular.dev page (`https://angular.dev/reference/versions`, fetched through the `angular-cli` MCP `search_documentation` tool with `version: 22`) shows the same row.
- `packages/compiler-cli/src/typescript_support.ts:19,29`: `MIN_TS_VERSION = '6.0.0'`, `MAX_TS_VERSION = '6.1.0'` (exclusive). The compiler throws for other versions unless `angularCompilerOptions.disableTypeScriptVersionCheck` is set.
- Root `package.json:130,167` pins `typescript` 6.0.3. `CHANGELOG.md:857` (22.0.0): "TypeScript versions older than 6.0 are no longer supported."
- TypeScript 7 (the Go port, tsgo) is NOT supported by 22.2. `adev/src/content/reference/roadmap.md:62-64`: "We're in the process of prototyping and exploring what this support would look like." No `tsgo`, `native-preview`, or `7.0` string appears anywhere in `package.json`, `compiler-cli`, or `adev/src/content`.
- Browser baseline for v22: "widely available" Baseline as of 2026-05-07 (`versions.md`, Browser support table). This is what decides whether native `popover`, CSS anchor positioning, `@starting-style`, `calc-size()` and scroll-snap are in bounds for the specs.

Resolved: the target is TypeScript 6.0.x, not 7.0.2. Angular 22.2.0's `compiler-cli` accepts only `>=6.0.0 <6.1.0` and rejects 7.0.2 at compile time; [Tooling baseline: Nx 23.2, Angular 22.2, Storybook 10.6, Vitest browser mode](../issues/12-tooling-baseline.md) pins `~6.0.3` from this fact and the peer ranges of `@angular/build` and `@angular/compiler-cli`.

## Signals: `signal`, `computed`, `untracked`

Stability: stable. Roadmap (`adev/src/content/reference/roadmap.md`, "Deliver Angular Signals"): "In Angular v20 we graduated all the fundamental reactivity primitives to stable including signal, effect, linkedSignal, signal-based queries, and inputs."

Sketch (`adev/src/content/guide/signals/overview.md`):

```ts
import {signal, computed, untracked, isSignal, isWritableSignal, assertNotInReactiveContext} from '@angular/core';

const count = signal(0);                       // WritableSignal<number>
count.set(3); count.update((v) => v + 1);
const readonlyCount = count.asReadonly();     // Signal<number>
const doubled = computed(() => count() * 2);  // lazy, memoized, dynamic deps
const data = signal(['a'], {equal: deepEqual}); // custom equality, default Object.is
```

Rules from the guide: reactive contexts are `effect`, `afterRenderEffect`, `computed`, `linkedSignal`, `resource` params/loader, and template rendering including `host` bindings (line 129-135). Reads after an `await` are not tracked (line 187-214). `untracked(fn)` reads without a dependency. `assertNotInReactiveContext(fn)` guards imperative helpers.

Relevance: every directive holds its state in signals; `host` bindings read signals directly, which is what makes OnPush and zoneless work without `markForCheck`.

## `linkedSignal`

Stability: stable, `@publicApi 20.0` (`packages/core/src/render3/reactivity/linked_signal.ts:27,44`). caniuse: S 20+, DP 19.

Signatures (`adev/src/content/guide/signals/linked-signal.md`):

```ts
linkedSignal<D>(computation: () => D, options?: {equal?, set?}): WritableSignal<D>;
linkedSignal<S, D>({
  source: Signal<S>,
  computation: (source: S, previous?: {source: S; value: D}) => D,
  equal?: (a: D, b: D) => boolean,
  set?: (value: D, rawSet: (value: D) => void) => void,   // write-back to a source of truth
}): WritableSignal<D>;
```

The `set` option (lines 137-197) is new relative to older guides: `set` runs on `.set()`/`.update()` and can push the write into a parent signal (`order.update(...)`) or call `rawSet` to bypass the computation. The skill reference `references/linked-signal.md` does not mention `set`.

Relevance: the natural home for "derived but user-overridable" directive state, e.g. the active tab or accordion panel derived from an input but changed by clicks; the `set` option lets a child directive write back into a parent's `model()` without an effect.

## `effect` and `afterRenderEffect`

Stability: `effect` stable `@publicApi 20.0` (`packages/core/src/render3/reactivity/effect.ts:135`); `afterRenderEffect` `@publicApi` (`after_render_effect.ts:316-395`), caniuse S 20+.

Sketch (`adev/src/content/guide/signals/effect.md`):

```ts
constructor() {
  effect((onCleanup) => { const v = this.value(); const t = setTimeout(...); onCleanup(() => clearTimeout(t)); });
  effect(() => {...}, {injector: this.injector, manualCleanup: true}); // outside an injection context
  afterNextRender({write: () => {...}});                                 // once, client only
  afterRenderEffect({earlyRead: (cleanup) => {...}, write: (prev, cleanup) => {...}, read: (prev, cleanup) => {...}});
}
```

Guidance from the guide: "Effects should be the last API you reach for" (line 19); never propagate state with effects (line 28-32); "View effects" run before their component is checked, "Root effects" before all components (line 71-84); `EffectRef.destroy()`; `afterRenderEffect` runs after DOM commit, default phase `mixedReadWrite` is the slowest (line 184); phases pass return values forward as signals; client only, and hydration is not guaranteed complete when it runs (line 203-207). "APIs like ResizeObserver, MutationObserver and IntersectionObserver are preferred to effect or afterRenderEffect when possible" (line 146).

Relevance: Sticky, Equalizer, Magellan and Tooltip measure layout; use `afterRenderEffect` read/write phases or native observers, never `ngAfterViewChecked`.

## `resource`, `rxResource`, `httpResource`, `debounced`

Stability: `resource` `@publicApi 22.0` (`packages/core/src/resource/resource.ts:50,64`); `rxResource` `@publicApi 22.0` (`packages/core/rxjs-interop/src/rx_resource.ts:49`); `httpResource` `@publicApi 22.0` (`packages/common/http/src/resource.ts:215`). caniuse: all S 22, E 19-21. Roadmap "Reactivity ... promoted these APIs to developer stable. Completed in 2026". `debounced` is `@experimental 22.0`; `resourceFromSnapshots` is `@experimental`.

Sketch (`adev/src/content/guide/signals/resource.md`, `debounced.md`):

```ts
const user = resource({
  params: () => ({id: userId()}),                 // undefined params => status 'idle', loader skipped
  loader: ({params, previous, abortSignal}) => fetch(`/u/${params.id}`, {signal: abortSignal}),
  id: 'user',                                     // optional: TransferState cache across SSR -> hydration
});
resource({stream: () => someWritableSignal});     // multi-value sources (WebSocket, SSE)
resource({params: ({chain}) => chain(user)?.companyId, loader: ...}); // status-propagating chaining
user.value(); user.hasValue(); user.error(); user.isLoading(); user.status(); user.reload(); user.snapshot;
// status: 'idle' | 'error' | 'loading' | 'reloading' | 'resolved' | 'local'
rxResource({params, stream: ({params}) => observable$});   // rxjs-interop: `stream`, not `loader`
const q = debounced(query, 300, {equal?, injector?});      // returns Resource<T>; experimental
```

Relevance: Interchange (loading HTML partials or images by media query) is the one Foundation plugin with an async loader; `resource` with `abortSignal` and an `id` for SSR replaces Foundation's ImageLoader/XHR. `debounced` could back Sticky/Equalizer resize handling but is experimental, so prefer a plain `ResizeObserver`.

Disagreement: caniuse marks `debounced` and `resourceFromSnapshots` as stable in 22; the clone source tags both `@experimental`. Trust the source.

## `input`, `model`, `output`

Stability: stable. `model` `@publicApi 19.0` (`packages/core/src/authoring/model/model.ts:111`), `output` `@publicApi 19.0` (`authoring/output/output.ts:67`), `input` graduated with the v20 reactivity set (roadmap). caniuse: inputs S 19+, model S 19+, output S 19+.

Sketch (`adev/src/content/guide/components/inputs.md`, `outputs.md`):

```ts
value = input(0);                                    // InputSignal<number>
label = input<string>();                             // InputSignal<string | undefined>
id = input.required<string>();
disabled = input(false, {transform: booleanAttribute});   // accepts "" / "false" / boolean
delay = input(0, {transform: numberAttribute});
alias = input(0, {alias: 'sliderValue'});
open = model(false);                                 // ModelSignal<boolean>; creates `openChange` output automatically
open = model.required<boolean>();                    // no transforms on model()
closed = output<void>();                             // OutputEmitterRef<void>; .emit(), .subscribe() -> OutputRefSubscription
changed = output<number>({alias: 'valueChanged'});
```

Rules from the guides: `input`/`output` only in property initializers, compile-time static; inputs and outputs are inherited; "Avoid prefixing output names with 'on'"; "Always use camelCase output names"; avoid names that collide with DOM properties or events (outputs.md:115-121). Custom events do not bubble. `SimpleChanges<UserProfile>` accepts a generic for typed `ngOnChanges` (`lifecycle.md:111-126`). Two-way binding `[(open)]="signalOrProperty"` requires a `model()` on the child (`templates/two-way-binding.md`).

Relevance: Foundation `data-*` options map to `input(default, {transform: booleanAttribute | numberAttribute})`; open/closed state that Foundation exposes as methods plus events maps to `model()`, which yields both `[(open)]` and `(openChange)`.

## Queries: `viewChild`, `viewChildren`, `contentChild`, `contentChildren`

Stability: stable, `@publicApi 19.0` (`packages/core/src/authoring/queries.ts:108-318`). caniuse: S 19+.

Sketch (`adev/src/content/guide/components/queries.md`):

```ts
header = viewChild(CustomCardHeader);                        // Signal<T | undefined>
header = viewChild.required(CustomCardHeader);
save = viewChild<ElementRef<HTMLButtonElement>>('save');     // template ref locator
items = contentChildren(MenuItem);                           // Signal<readonly T[]>; direct children only
items = contentChildren(MenuItem, {descendants: true});
toggle = contentChild(ExpandoContent, {read: TemplateRef});  // contentChild traverses descendants by default
innerInjector = viewChild('inner', {read: Injector});
subItem = contentChild(SUB_ITEM_TOKEN);                      // any ProviderToken works as a locator
```

Queries never pierce component boundaries. Decorator queries remain supported. Results become available as signals; `ngAfterContentInit`/`ngAfterViewInit` are only needed for decorator queries.

Relevance: one option is for Accordion, Tabs, Orbit, DropdownMenu, Drilldown parent directives to enumerate child directives via `contentChildren(..., {descendants: true})` and index them for keyboard navigation, paired with the token-based DI pattern for projected children. `@angular/aria` deliberately avoids `contentChildren` for item discovery: it "has an issue where it will return a successively smaller list each time that the menu is open and closed" (`di-and-composition-patterns.md` section 3c, `src/aria/menu/menu.ts:120-129`), and registers items into a parent-owned sorted collection instead. [Building-blocks map and cross-cutting architecture decisions](../issues/14-building-blocks-map.md) owns which mechanism the specs use.

## Render hooks: `afterNextRender`, `afterEveryRender`

Stability: stable, `@publicApi 20.0` (`packages/core/src/render3/after_render/hooks.ts:134,196,313,379`). caniuse: S 20+ (DP 16-19). `afterRender` was renamed `afterEveryRender`.

Sketch (`adev/src/content/guide/components/lifecycle.md:225-293`, `dom-apis.md`):

```ts
afterNextRender({write: () => {...; return changed;}, read: (didWrite) => {...}});
afterEveryRender(() => elementRef.nativeElement.querySelector('input')?.focus());
```

Must be called in an injection context. Phases `earlyRead`, `write`, `mixedReadWrite` (default), `read`. "Render callbacks never run during server-side rendering or build-time pre-rendering" (dom-apis.md:44). "Never directly manipulate the DOM inside of other Angular lifecycle hooks" (dom-apis.md:46).

## Host bindings and host directives

Stability: stable (`host` metadata; directive composition API shipped v15 per roadmap).

Sketch (`adev/src/content/guide/components/host-elements.md`):

```ts
@Directive({
  selector: '[nfsAccordionTitle]',
  host: {
    'role': 'button',
    '[attr.aria-expanded]': 'expanded()',
    '[class.is-active]': 'expanded()',
    '[style.--nfs-accent]': 'accent()',        // CSS custom property binding
    '[tabIndex]': 'disabled() ? -1 : 0',
    '(keydown.code.Enter)': 'toggle()',        // physical key; '(keydown.enter)' matches KeyboardEvent.key
    '(window:resize)': 'measure()',            // global targets: document:, window:, body:
    'ngSkipHydration': 'true',                 // opt a component out of hydration (hydration.md:155-163)
  },
})
```

Collision rules (host-elements.md:111-135): static vs static, instance wins; static vs dynamic, dynamic wins; dynamic vs dynamic, the host binding wins. `inject(new HostAttributeToken('variation'), {optional: true})` reads static attributes.

Host directives (`adev/src/content/guide/directives/directive-composition-api.md`):

```ts
@Directive({hostDirectives: [{directive: MenuBehavior, inputs: ['menuId: id'], outputs: ['menuClosed: closed']}]})
```

Constraints: applied statically; host directive selectors are ignored; host directives run constructor, `ngOnInit` and host bindings before the host; the host's providers win over host-directive providers; a component and its host directives can inject each other. New in this branch (lines 170-266): de-duplication. A template selector match beats a `hostDirectives` match ("a host directive match represents `Partial<YourDirective>`"); the same directive reached twice through `hostDirectives` is merged into one instance (diamond problem solved); conflicting aliases raise NG8024.

Relevance: this is a composition primitive candidate for the building-blocks map. One option is for Foundation's shared Triggers (`data-open`, `data-close`, `data-toggle`), Keyboard and Nest utilities to become host directives that Reveal, OffCanvas, Dropdown, Toggler share, where de-duplication would let a `TriggerRef`-style shared behaviour be declared safely in several plugins. [Building-blocks map and cross-cutting architecture decisions](../issues/14-building-blocks-map.md) owns which composition mechanism the specs use.

## `@defer` and incremental hydration

Stability: `@defer` stable since v18 (roadmap; caniuse S 18+). Incremental hydration stable since v20 (roadmap; caniuse `withIncrementalHydration` S 20+).

Sketch (`adev/src/content/guide/templates/defer.md`):

```html
@defer (on viewport({trigger: el, rootMargin: '100px', threshold: 0.5}); prefetch on idle(500)) {
  <heavy-cmp />
} @placeholder (minimum 500ms) { ... } @loading (after 100ms; minimum 1s) { ... } @error { ... }
@defer (hydrate on viewport) { ... }     <!-- incremental hydration, on by default with plain provideClientHydration() in 22.x -->
```

Triggers: `idle` (optional timeout), `viewport` (options object new here), `interaction`, `hover`, `immediate`, `timer`, `when`; multiple `on` triggers are OR-ed. `provideIdleServiceWith(CustomIdleService)` customises idle. Only standalone dependencies are deferred; dependencies referenced outside the block or in view queries are eager; barrel imports defeat chunk splitting (lines 385-412). SSR renders the placeholder unless `hydrate` triggers are used. Testing: `TestBed.configureTestingModule({deferBlockBehavior: DeferBlockBehavior.Manual})` and `fixture.getDeferBlocks()`. Accessibility note: wrap in `aria-live` when the swap should be announced (lines 426-447).

Relevance: Foundation Interchange and Orbit lazy content, Reveal modal bodies and Drilldown submenus can be deferred. `@defer (on viewport)` replaces hand-rolled IntersectionObserver (matches the current repo's AGENTS.md preference).

## Animations: `animate.enter`, `animate.leave`, and the deprecated package

Stability: `animate.enter`/`animate.leave` are compiler syntax, not directives; their public types `AnimationCallbackEvent`, `MAX_ANIMATION_TIMEOUT`, `AnimationFunction` are `@publicApi 20.2` (`packages/core/src/animation/interfaces.ts:26-56`); `ANIMATIONS_DISABLED` token at line 13. `@angular/animations` is deprecated since 20.2 with "Intent to remove in v23" (see deprecation table). `adev/src/content/guide/animations/overview.md:3` (the legacy guide): "The @angular/animations package is now deprecated. The Angular team recommends using native CSS with animate.enter and animate.leave".

Sketch (`adev/src/content/guide/animations/enter-and-leave.md`):

```html
<div animate.enter="fade-in slide-in">...</div>              <!-- string, space-separated, or string[] -->
<div [animate.leave]="leaveClasses()">...</div>               <!-- bindable -->
<div (animate.leave)="onLeave($event)">...</div>              <!-- $event: AnimationCallbackEvent {target, animationComplete()} -->
```

```ts
@Directive({host: {'animate.enter': 'is-entering', 'animate.leave': 'is-leaving'}})   // "also as a host binding" (line 10)
providers: [{provide: MAX_ANIMATION_TIMEOUT, useValue: 6000}]                          // default 4000 ms auto-complete (line 84-88)
TestBed.configureTestingModule({animationsEnabled: true});                              // default false (line 96-104)
```

Behaviour: classes are removed after the longest animation/transition ends; `animate.leave` delays DOM removal; a leave animation on a descendant in the same template runs before the parent is removed, but not across component boundaries (lines 58-68); legacy and new animations cannot mix in one component or across projection (line 92). CSS guidance (`css.md`, `migration.md`): pair transitions with `@starting-style`, animate auto height with `grid-template-rows: 0fr -> 1fr` or `calc-size()`, stagger with `animation-delay`, control with `Element.getAnimations()`, respect `prefers-reduced-motion`. Route transitions use `withViewTransitions()` (developer preview 19.0).

Relevance: Foundation Motion UI classes (`.slide-in-down`, `.fade-out`) map one-to-one onto `animate.enter`/`animate.leave` class lists; Reveal, OffCanvas, Dropdown, Toggler and Orbit get enter/leave animation without `@angular/animations`. The `(animate.leave)` function form lets a spec keep Foundation's `animationIn`/`animationOut` option names. `Renderer2` animation hooks mentioned in `dom-apis.md:60-63` refer to the deprecated system.

Skill reference `references/angular-animations.md` agrees with the clone (prefer native CSS from 20.2, legacy DSL deprecated) but omits the host-binding form, `MAX_ANIMATION_TIMEOUT`, `ANIMATIONS_DISABLED`, and the same-template restriction on child leave animations.

## Signal Forms (`@angular/forms/signals`)

Stability: stable in v22. `form()` is `@publicApi 22.0` (`packages/forms/signals/src/api/structure.ts:118,167,217`); `adev/src/content/guide/forms/signals/comparison.md:16` "Status | Stable (v22+)"; `adev/src/content/events/v22.md:7` "Signal Forms, Asynchronous Signals, and Angular Aria are now stable"; roadmap "Completed projects: Signal Forms ... now stable. Completed in 2026". caniuse: S 22, E 21. Only the WebMCP hooks remain experimental. Note `overview.md:18` still says "if you need production stability guarantees, reactive forms remain a solid choice", stale wording that contradicts the Stable label two files over.

Sketch (`models.md`, `validation.md`, `schemas.md`, `field-state-management.md`, `custom-controls.md`):

```ts
import {form, FormField, FormRoot, submit, schema, apply, applyWhen, applyWhenValue, applyEach,
        required, email, min, max, minLength, maxLength, pattern, validate, validateTree, validateHttp,
        validateStandardSchema, disabled, hidden, readonly, debounce, transformedValue,
        FormValueControl, FormCheckboxControl, ValidationError, DisabledReason, WithOptionalFieldTree,
        SchemaPath, SchemaPathTree, FieldTree, FieldState} from '@angular/forms/signals';

model = signal({email: '', age: 0, address: {zip: ''}, tags: [] as string[], birthday: null as Date | null});
f = form(this.model, (p) => {                               // schema fn runs ONCE; rules are reactive
  required(p.email, {message: '...', when: ({valueOf}) => valueOf(p.age) > 17});
  disabled(p.address.zip, {when: ({valueOf}) => valueOf(p.age) < 18});
  hidden(p.tags, {when: ({value}) => ...}); readonly(p.email);
  debounce(p.email, 300); debounce(p.email, 'blur');
  validate(p.email, ({value, state, field, valueOf, stateOf, fieldTreeOf, pathKeys}) => null | undefined | {kind, message});
  validateTree(p, (ctx) => ({kind, message, fieldTree: ctx.fieldTree.address}));
  validateHttp(p.email, {request: ({value}) => url, onSuccess: (r) => err | null, onError: (e) => err});
  validateStandardSchema(p, zodSchema | () => schemaSignal());
  applyWhen(p.address, ({valueOf}) => valueOf(p.country) === 'US', usZipSchema);
  applyWhenValue(p, isCreditCard, (cc) => required(cc.cardNumber));     // type-guard narrowing
  applyEach(p.tags, (tag) => required(tag));
}, {injector?, name?, submission: {action: async (f) => {...}}});

f.email();                       // FieldState: value (WritableSignal), valid, invalid, errors, pending, touched, dirty,
                                 //   disabled, hidden, readonly, markAsTouched({skipDescendants}), reset(value?),
                                 //   focusBoundControl({preventScroll}), errorSummary()
f.email().value.set('x'); this.model.set({...});   // both directions stay in sync
submit(f, {action: ...});        // or <form [formRoot]="f"> which sets novalidate and calls submit
```

Template: `<input [formField]="f.email">`, `<select [formField]="f.country">`, `<input type="checkbox" [formField]="f.agree">`, `<input type="radio" value="a" [formField]="f.tier">`; `@for (item of f.tags; track item)` tracks by field identity.

Custom controls: implement `FormValueControl<T>` with `value = model<T>()`, or `FormCheckboxControl` with `checked = model<boolean>()`; optional inputs `touched`, `disabled`, `disabledReasons`, `readonly`, `hidden`, `invalid`, `errors`, `pending`, `required`, `min`, `max`, `minLength`, `maxLength`, `pattern`, `name`, plus `touch = output<void>()` on blur and a `focus()` method for `focusBoundControl()`. `transformedValue(this.value, {parse, format})` handles display-vs-model conversion and parse errors. "Custom Signal Form Controls can be used with Signal, Reactive and Template-Driven Forms without any extra compatibility code" (`custom-controls.md:9`). Controls must not run their own effects for form state (`custom-controls.md:544`).

Native validation: Signal Forms does not use constraint validation; `required`, `min`, `max`, `minLength`, `maxLength` are mirrored to native attributes for accessibility, `pattern` is not; do not style with `:invalid` (`validation.md:55-67`). Model structural layer must be plain objects/arrays; `undefined` removes a field; `null` is allowed for optional leaves (`models.md:43-147`).

Relevance: a candidate Abide replacement (the decision is [ADR 0006](../adr/0006-signal-forms-replaces-abide.md)). Foundation's `data-abide` markup (`.is-invalid-input`, `.form-error.is-visible`, `data-live-validate`, `data-validate-on-blur`) maps to class bindings on `touched() && invalid()`, `debounce(path, 'blur')`, and the `FormField` directive; Abide's custom validators (`equalTo`, patterns like `alpha`, `url`, `card`) become `validate()` wrappers or a companion `schema()` exported next to the directive. A Foundation-styled control that implements `FormValueControl` works in Signal Forms and legacy forms alike.

Disagreements between `references/signal-forms.md` (skill) and the clone:

- Skill: "`when` is only available for required". Clone: `when` is accepted by `required`, `disabled`, `hidden`, `readonly` ("Conditional rules like disabled() and required() accept optional configuration, including a when function", `schemas.md:7`; `field-state-management.md:314,362`).
- Skill: "Do NOT return null from validators". Clone: `null` or `undefined` both mean valid (`validation.md:450-453`).
- Skill: `submit(form, async () => {...})`. Clone: `submit(form, {action})` with `FormSubmitOptions`, or `form(model, schema, {submission: {action}})` plus the `FormRoot` directive (`field-state-management.md:688-732`).
- Skill: "NEVER use null or undefined as initial values". Clone: `null` is the documented empty value for optional leaves and `Date | null` inputs (`models.md:129-145`); only `undefined` is excluded.
- Skill documents `validateAsync({params, factory, onSuccess, onError})`; the clone guides read here document `validateHttp` instead. `validateAsync` was not verified in the clone.
- Skill: "Do NOT use [disabled] on an input". Clone agrees the directive binds `disabled`/`readonly` automatically (`field-state-management.md:297-299,404`).

## Router features

Stability per source: `withComponentInputBinding` stable (`packages/router/src/provide_router.ts:850`, no preview tag; caniuse S since 16); `withInMemoryScrolling` stable (line 182); `withViewTransitions` developerPreview 19.0 (line 890); `withRouterResources` developerPreview 22.2 (line 933); `withAutoCleanupInjectors` publicApi 22.2 (line 758); `withExperimentalPlatformNavigation` experimental 21.1.

Sketch:

```ts
provideRouter(routes,
  withComponentInputBinding(),                          // params, query params, matrix params, data, resolved data, blocking resources -> input()
  withInMemoryScrolling({scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled'}), // router_config.ts:149-157
  withViewTransitions({onViewTransitionCreated: ({transition, from, to}) => transition.skipTransition()}),
  withRouterResources(),
  withAutoCleanupInjectors());

{ path: 'user/:id', component: UserProfile,
  resources: (ctx) => ({ user: resource({params: () => ctx.params()['id'], loader: ...}),
                         report: nonBlocking(resource({...})) }) }   // ctx: {params, queryParams, fragment, data} signals
user = input.required<User>();                  // blocking: value bound
report = input.required<Resource<Report>>();    // nonBlocking: Resource bound, isLoading()/error() available
inject(ActivatedRoute).resources?.['user']?.reload();
isSettings = isActive('/settings', inject(Router), {paths: 'subset', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored'}); // Signal<boolean>
inject(Router).currentNavigation();             // signal; getCurrentNavigation() deprecated 20.2
```

`data-fetching-with-resources.md` documents parallel execution across matched routes, `RedirectCommand` thrown from a loader, frozen resources during pending navigation, and rollback recovery. `TrailingSlashPathLocationStrategy` / `NoTrailingSlashPathLocationStrategy` exist in `@angular/common` (`customizing-route-behavior.md:128-153`).

Relevance: Magellan and SmoothScroll compete with `anchorScrolling: 'enabled'` and `ViewportScroller`; a deep-linkable Accordion/Tabs reads `ActivatedRoute.fragment`. Route resources are developer preview, so specs should not depend on them.

## Zoneless and OnPush defaults

Stability: zoneless stable since 20.2 and the default since v21 (`adev/src/content/guide/zoneless.md:14`; roadmap "As of Angular v20.2, Zoneless Angular is now stable"). OnPush is the default `changeDetection` in v22 (`packages/core/src/change_detection/constants.ts:25` "NOTE: OnPush is enabled by default"; `CHANGELOG.md:859` "Component with undefined changeDetection property are now OnPush by default. Specify changeDetection: ChangeDetectionStrategy.Eager to keep the previous behavior"; roadmap line 102). caniuse: "default OnPush strategy" S 22, `ChangeDetectionStrategy.Eager` S 21.2, `Default` D 21.2.

Requirements (`zoneless.md:45-129`): change detection is scheduled only by `markForCheck` (AsyncPipe), `ComponentRef.setInput`, template-read signal updates, bound host/template listeners, and attaching dirty views. `NgZone.onStable`/`onMicrotaskEmpty`/`isStable` never emit; replace with `afterNextRender`/`afterEveryRender` or `MutationObserver`. `NgZone.run`/`runOutsideAngular` stay compatible. Library caveat (line 61-63): a library component that hosts user components through `ViewContainerRef.createComponent` cannot assume OnPush-compatible children, so it may need `Eager`; plain content projection is fine. Reactive forms updates do not schedule CD (line 125-129). SSR needs `PendingTasks.run()`/`add()` or `pendingUntilEvent()` for async work that must finish before serialization. Dev check: `provideCheckNoChangesConfig({exhaustive: true, interval})` (developer preview). TestBed: zoneless when `zone.js` is absent; prefer `await fixture.whenStable()` over `fixture.detectChanges()` (line 133-166).

Relevance: every directive must express state as signals read in `host` bindings or templates; anything driven by `setTimeout`, `requestAnimationFrame`, or a third-party listener must write into a signal. Explicitly setting `changeDetection: ChangeDetectionStrategy.OnPush` is now redundant but harmless.

## Hydration and SSR constraints for DOM-touching directives

Sources: `adev/src/content/guide/hydration.md`, `ssr.md`, `incremental-hydration.md`, `components/dom-apis.md`.

- The server HTML and client DOM must match, including whitespace and comment nodes; direct DOM manipulation (`appendChild`, `innerHTML`, moving nodes, querying `document`) during construction or lifecycle hooks causes mismatch errors (`hydration.md:97-111`). Fix by moving the work into `afterNextRender`/`afterEveryRender`/`afterRenderEffect`, which never run on the server (`dom-apis.md:44`), or set `ngSkipHydration` on the component host as a last resort (`hydration.md:147-171`; only valid on component host nodes, not directives).
- Valid HTML structure is required: `<table>` with `<tbody>`, no `<div>` in `<p>`, no nested `<a>` (`hydration.md:113-125`). Foundation's Menu and Top Bar markup is fine; Table needs `<tbody>`.
- Do not branch templates on `isPlatformBrowser` (`hydration.md:214-216`; `ssr.md:264`). "Prefer platform-specific providers over runtime checks with isPlatformBrowser or isPlatformServer" (`ssr.md:262,273-332`): declare an abstract service, provide the browser implementation in `app.config.ts` and the server one in `app.config.server.ts`.
- `DOCUMENT` is exported from `@angular/core` (`packages/core/src/document.ts:20`); `@angular/common` keeps a "Backwards compatibility re-export" (`packages/common/src/common.ts:115-116`). `PLATFORM_ID` still exists in `packages/core/src/application/application_tokens.ts:89` with `isPlatformBrowser`/`isPlatformServer` in `@angular/common`, but the guides now steer away from them. `REQUEST`, `RESPONSE_INIT`, `REQUEST_CONTEXT` come from `@angular/core` and are `null` in CSR/SSG (`ssr.md:358-391`).
- `Renderer2` "APIs do not support DOM manipulation in server-side rendering or build-time pre-rendering contexts" and otherwise behave like native DOM apart from style encapsulation and the deprecated animation hooks (`dom-apis.md:52-66`). Prefer `ElementRef.nativeElement` inside render callbacks plus native observers (`dom-apis.md:68-85`); never set `innerHTML` directly.
- Event replay (`withEventReplay()`) captures native events before hydration and is on automatically with incremental hydration (`hydration.md:64-95`). Directives that rely on early clicks (Reveal open triggers, OffCanvas toggles) benefit without extra work.
- `hydration.md:135-139` still says custom or noop Zone.js is not supported; with zoneless default this section reads as legacy, and stability is tracked through `PendingTasks` (`zoneless.md:85-123`).
- `provideStabilityDebugging()` logs pending tasks that block hydration (`hydration.md:177-193`).

Relevance: Sticky, Equalizer, Magellan, Tooltip and Dropdown positioning read layout and set styles; they must do so in `afterRenderEffect` phases, keep the server-rendered DOM untouched, and store measurements in signals. Reveal and OffCanvas that move elements to `document.body` should render in place (or via CDK overlay after render) rather than relocate server-rendered nodes.

## Dependency injection

Sources: `adev/src/content/guide/di/dependency-injection-context.md`, `creating-and-using-services.md`, `lightweight-injection-tokens.md`, `packages/core/src/di/*`.

```ts
inject(Token);                                           // InjectOptions: {optional?, skipSelf?, self?, host?}  (interface/injector.ts:59-81)
inject(nfsAccordionToken, {optional: true, skipSelf: true});
inject(new HostAttributeToken('type'), {optional: true}); // string | null
inject(DestroyRef).onDestroy(() => ...); inject(DestroyRef).destroyed;      // lifecycle.md:137-165
runInInjectionContext(injector, () => inject(X)); assertInInjectionContext(fn);
const loadChart = injectAsync(() => import('./chart').then((m) => m.ChartService));   // () => Promise<T>, @publicApi 22.0 (di/inject_async.ts:48-58)

@Service()                                   // new in v22, stable (di/service.ts:57-82; caniuse S 22)
export class Store {}                        // = @Injectable({providedIn: 'root'}) shorthand; inject() only, no constructor DI
@Service({autoProvided: false}) export class Scoped {}      // user must list it in providers
@Service({factory: () => inject(FLAG) ? new A() : new B()}) export class A {}
```

`creating-and-using-services.md:44-112`: keep `@Injectable` for constructor injection, `useClass`/`useValue`/`useExisting`/`useFactory`, and `providedIn: 'platform'`. `@Injectable` is not deprecated. Injection context exists in constructors, field initializers, provider factories, `InjectionToken` factories, router guards, and `runInInjectionContext` frames. `effect`, `afterNextRender`, `debounced`, `resource` all require it or an explicit `injector` option.

Relevance: `@Service()` fits the singleton helpers the specs will need (MediaQuery breakpoint service, a Triggers registry). Tokens stay `new InjectionToken<T>('name')` with the camelCase `Token` suffix rule from the current repo; the parent/child DI pattern in AGENTS.md (`{optional: true, skipSelf: true}`) is unchanged.

## Templates: control flow, `@let`, `@boundary`

- `@if`/`@for`/`@switch` stable since 18; `@let` stable since 19 (caniuse). `@for` requires `track`.
- `@boundary { ... } @error (let err; reset = $reset; when cond) { ... }` is developer preview (`adev/src/content/guide/templates/error-boundaries.md:3`; `ErrorDetails` developerPreview 22.2). Errors from projected content are not caught by a boundary inside the receiving component (line 84-108). `ErrorHandler.onViewError(error, details)` hook.
- `SimpleChanges<T>` generic (`lifecycle.md:111-126`).
- Key modifiers: `(keydown.enter)` matches `KeyboardEvent.key`; `(keydown.code.Enter)` matches the physical key (`host-elements.md:67-70`).

## Testing: Vitest builder and browser mode

Stability: Vitest is the default and stable unit-test runner since v21 (roadmap "Following the stable release of Vitest in Angular v21"; caniuse `Vitest @angular/build` S 21-22, E 20). The Karma-to-Vitest migration schematic is experimental (`migrating-to-vitest.md:5,137`).

From `adev/src/content/guide/testing/overview.md`: builder `@angular/build:unit-test`; options `include`, `exclude`, `setupFiles`, `providersFile` (default export of providers), `coverage`, `browsers`, `runnerConfig` (custom `vitest-base.config.ts`, CLI overrides `test.projects` and `test.include`). Node + `jsdom` (or `happy-dom`) by default; browser mode via `npm i -D @vitest/browser-playwright playwright` and `browsers: ['chromium']` or `--browsers=chromiumHeadless`; `CI=true` forces headless single run. `zone.js/plugins/vitest-patch` restores `fakeAsync`/`flush` but Vitest fake timers are recommended (`migrating-to-vitest.md:226-232`). TestBed: `TestBed.tick()` (flushEffects deprecated), `animationsEnabled`, `deferBlockBehavior`, `inferTagName`, `TestBed.getLastFixture` (caniuse S 22), `await fixture.whenStable()` for zoneless.

Relevance: the pinned target is Vitest 4.1.x and `@vitest/browser-playwright`, per [Tooling baseline: Nx 23.2, Angular 22.2, Storybook 10.6, Vitest browser mode](../issues/12-tooling-baseline.md) (Vitest 5.0.2 is refused by `@nx/vitest` 23.2.1 and `@storybook/addon-vitest` 10.6). In an Nx workspace, the Nx Angular library generator's publishable-library path writes `@nx/angular:unit-test`, a thin wrapper over `@angular/build`'s unit-test builder; there is no `vitest.config.ts` on this path, so the target options above are the configuration surface, not a `vitest.config.mts` file. The Angular-specific parts that carry over are `TestBed` zoneless behaviour, `animationsEnabled`, and component harnesses (`@angular/cdk/testing`, `@angular/aria/*/testing`, `references/angular-aria.md` section 9).

## `@angular/aria` (context only; per-pattern tickets cover the API)

Stability: stable in v22. Roadmap (`adev/src/content/reference/roadmap.md:75`): "In Angular v21, we launched Angular Aria in developer preview ... In Angular v22, we promoted Angular Aria to stable". Components clone `CHANGELOG.md:385` "remove developer preview tag from aria (#33232)". caniuse: S 22, DP 21. `adev/src/content/guide/aria/overview.md` lists Autocomplete, Listbox, Select, Multiselect, Combobox, Menu, Menubar, Toolbar, Accordion, Tabs, Tree, Grid. Directive selectors are `ng`-prefixed (`ngAccordionGroup`, `ngTabList`, `ngMenuTrigger`) and expose `model()` signals, so they work as Signal Forms controls out of the box (`references/angular-aria.md` section 10). The skill reference's "Never use native HTML elements like `<select>`" rule is an agent instruction, not Angular guidance; the clone's overview says native controls are the right choice for simple forms (`aria/overview.md:108`).

## Other v22 facts the caniuse table surfaced (verified in the clone where noted)

- `withXhr()` new; `withFetch()` deprecated because `FetchBackend` is the default (`packages/common/http/src/provider.ts:307-334`).
- `injectAsync` publicApi 22.0 (`packages/core/src/di/inject_async.ts:48`).
- `ComponentFactoryResolver`, `ComponentFactory`, `createNgModuleRef`, Hammer integration, `provideRoutes`, `ApplicationConfig` from `@angular/platform-browser` (import from `@angular/core`): removed in 22.
- Webpack builders and `CommonEngine` deprecated in 22; `@angular/build` (esbuild/Vite) is the only supported path.
- `provideBrowserGlobalErrorListeners` stable since 20; `APP_INITIALIZER`/`ENVIRONMENT_INITIALIZER` deprecated since 19 (`provideAppInitializer`/`provideEnvironmentInitializer`).
- `enableProfiling()` experimental; WebMCP (`provideExperimentalWebMcpTools`) experimental.

## Skill references versus the clone: summary of disagreements

| Reference | Disagreement |
| --- | --- |
| `references/signal-forms.md` | `when` on `required` only (clone: also `disabled`, `hidden`, `readonly`); "never null" (clone: `null` allowed, `undefined` excluded); validators must return `undefined` (clone: `null` or `undefined`); `submit(form, async fn)` (clone: `submit(form, {action})` / `FormRoot`); `validateAsync` shown, `validateHttp` absent; no `transformedValue`, `focusBoundControl`, `errorSummary`, `markAsTouched`, `FormRoot`. |
| `references/angular-animations.md` | Agrees on deprecation and native CSS; omits host-binding form, `MAX_ANIMATION_TIMEOUT`, `ANIMATIONS_DISABLED`, `animationsEnabled`, cross-component leave limitation. |
| `references/linked-signal.md` | Omits the `set`/`rawSet` write-back option. |
| `references/effects.md` | Consistent with the clone; omits `manualCleanup`, `injector` option, view vs root effect ordering, and the "prefer native observers" advice. |
| `references/resource.md` | Omits `stream`, `id` (SSR cache), `chain`, `snapshot`, `resourceFromSnapshots`, `debounced`; consistent otherwise. |
| `references/host-elements.md` | Consistent; omits `keydown.code.*`, global event targets, `ngSkipHydration` as host attr, CSS custom property binding. |
| `references/naming-conventions.md` | Not contradicted by the clone; suffix-less class and file names (`class Accordion` in `accordion.ts`) are the v20+ style guide. The current repo's `Nfs*` class prefix and `nfs-`/`nfs` selectors are a repo convention on top of it. |
| `references/data-resolvers.md` | Describes `ResolveFn` + `withComponentInputBinding`; the clone now prefers route `resources` (developer preview) and documents resolvers as the "traditional" path (`data-fetching-with-resources.md:5-12`). |
| `references/angular-aria.md` | Says "confirm `@angular/aria` is installed"; adds a "never use `<select>`" rule the clone does not make. Directive names match the clone guides. |

## caniuse table (https://www.angular.courses/caniuse)

Captured 2026-09-25 with `playwright-cli` (msedge channel; the default Chrome channel crashed the daemon twice with a libuv assertion, the chromium channel was not installed). 220 features, scrolled to load all rows, statuses read from each cell's `aria-label`. Codes: S stable, DP developer preview, E experimental, D deprecated, R removed, `-` not available. A trailing `x.y` is the minor version the site records for that status.

Known disagreements with the clone: `debounced` and `resourceFromSnapshots` are listed S in 22 but tagged `@experimental` in source; `PendingTasks` and `provideZonelessChangeDetection` are attributed to `@angular/ssr` / `@angular/platform-browser` but live in `@angular/core`; `withComponentInputBinding` is attributed to 16+ (it shipped in 16.0).

| Feature | Package | 22 | 21 | 20 | 19 | 18 | 17 | 16 | 15 | 14 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| resource() | @angular/core | S | E | E | E | - | - | - | - | - |
| rxResource() | @angular/core/rxjs-interop | S | E | E | E | - | - | - | - | - |
| httpResource() | @angular/common/http | S | E | E | E 19.2 | - | - | - | - | - |
| Signal forms | @angular/forms | S | E | - | - | - | - | - | - | - |
| Angular Aria | @angular/aria | S | DP | - | - | - | - | - | - | - |
| ResourceSnapshot | @angular/core | S | E 21.2 | - | - | - | - | - | - | - |
| resourceFromSnapshots | @angular/core | S | E 21.2 | - | - | - | - | - | - | - |
| withFetch | @angular/common/http | D | S | S | S | S | S 17.1 | DP 16.1 | - | - |
| withXhr | @angular/common/http | S | - | - | - | - | - | - | - | - |
| TestBed.getLastFixture | @angular/core/testing | S | - | - | - | - | - | - | - | - |
| HTML element comments | @angular/compiler | S | - | - | - | - | - | - | - | - |
| default OnPush strategy | @angular/core | S | - | - | - | - | - | - | - | - |
| @Service decorator | @angular/core | S | - | - | - | - | - | - | - | - |
| provideExperimentalWebMcpTools | @angular/core | E | - | - | - | - | - | - | - | - |
| injectAsync | @angular/core | S | - | - | - | - | - | - | - | - |
| debounced | @angular/core | S | - | - | - | - | - | - | - | - |
| ComponentFactoryResolver | @angular/core | R | D | D | D | D | D | D | D | D |
| ComponentFactory | @angular/core | R | D | D | D | D | D | D | D | D |
| Webpack Builders | @angular-devkit/build-* | D | S | S | S | S | S | S | S | S |
| CommonEngine | @angular/ssr | D | S | S | S | S | S | S | S | S |
| Jest builder | @angular/devkit/build-angular:jest | R | D | E | E | E | E | E | - | - |
| Web Test Runner builder | @angular-devkit/build-angular:web-test-runner | R | D | E | E | E | E | - | - | - |
| createNgModuleRef | @angular/core | R | D | D | D | D | D | D | D | D 14.1 |
| ModuleWithComponentFactories | @angular/core | R | D | D | D | D | D | D | D | D |
| HAMMER_GESTURE_CONFIG | @angular/platform-browser | R | D | D | S | S | S | S | S | S |
| HAMMER_LOADER | @angular/platform-browser | R | D | D | S | S | S | S | S | S |
| HammerGestureConfig | @angular/platform-browser | R | D | D | S | S | S | S | S | S |
| HammerLoader | @angular/platform-browser | R | D | D | S | S | S | S | S | S |
| HammerModule | @angular/platform-browser | R | D | D | S | S | S | S | S | S |
| provideRoutes | @angular/router | R | D | D | D | D | D | D | D | S |
| getAngularLib | @angular/upgrade/static | R | D | D | D | D | D | D | D | D |
| setAngularLib | @angular/upgrade/static | R | D | D | D | D | D | D | D | D |
| Standalone API | @angular/core | S | S | S | S | S | S | S | S | E |
| @defer | @angular/core | S | S | S | S | S | DP | - | - | - |
| @for | @angular/core | S | S | S | S | S | DP | - | - | - |
| @switch | @angular/core | S | S | S | S | S | DP | - | - | - |
| @if | @angular/core | S | S | S | S | S | DP | - | - | - |
| Functional guards/resolvers | @angular/router | S | S | S | S | S | S | S | S | S 14.2 |
| Functional interceptors | @angular/router | S | S | S | S | S | S | S | S | - |
| @let | @angular/core | S | S | S | S | DP 18.1 | - | - | - | - |
| Signal (core) | @angular/core | S | S | S | S | S | S | DP | - | - |
| Signal inputs | @angular/core | S | S | S | S | DP | DP 17.1 | - | - | - |
| output() | @angular/core | S | S | S | S | DP | DP 17.3 | - | - | - |
| Signal queries | @angular/core | S | S | S | S | DP | DP 17.2 | - | - | - |
| Signal model | @angular/core | S | S | S | S | DP | DP 17.2 | - | - | - |
| Signal effect | @angular/core | S | S | S | DP | DP | DP | DP | - | - |
| Signal inputs converter | @angular/language-service | S | S | S | S | - | - | - | - | - |
| withEventReplay | @angular/platform-browser | S | S | S | S | DP | - | - | - | - |
| provideZonelessChangeDetection | @angular/platform-browser | S | S | DP 20.0 | E | E | - | - | - | - |
| withI18nSupport | @angular/platform-browser | S | S | S | DP | DP | - | - | - | - |
| createRequestHandler | @angular/ssr | S | S | S | DP | - | - | - | - | - |
| createNodeRequestHandler | @angular/ssr | S | S | S | DP | - | - | - | - | - |
| isMainModule | @angular/ssr | S | S | S | DP | - | - | - | - | - |
| PendingTasks | @angular/ssr | S | S | S | DP | E | - | - | - | - |
| AngularAppEngine | @angular/ssr | S | S | S | DP | - | - | - | - | - |
| AngularNodeAppEngine | @angular/ssr | S | S | S | DP | - | - | - | - | - |
| createWebRequestFromNodeRequest | @angular/ssr | S | S | S | DP | - | - | - | - | - |
| writeResponseToNodeResponse | @angular/ssr | S | S | S | DP | - | - | - | - | - |
| RenderMode | @angular/ssr | S | S | S | DP | - | - | - | - | - |
| PrerenderFallback | @angular/ssr | DP | DP | DP | DP | - | - | - | - | - |
| ServerRoute | @angular/ssr | S | S | S | DP | - | - | - | - | - |
| provideServerRendering | @angular/ssr | S | S | S | DP | - | - | - | - | - |
| afterEveryRender | @angular/core | S | S | S | DP | DP | DP | DP | - | - |
| afterNextRender | @angular/core | S | S | S | DP | DP | DP | DP | - | - |
| afterRenderEffect | @angular/core | S | S | S | E | - | - | - | - | - |
| withViewTransitions | @angular/router | DP | DP | DP | DP | E | E | - | - | - |
| toSignal | @angular/core/rxjs-interop | S | S | S | DP | DP | DP | DP | - | - |
| toObservable | @angular/core/rxjs-interop | S | S | S | DP | DP | DP | DP | - | - |
| takeUntilDestroyed | @angular/core/rxjs-interop | S | S | S | S | DP | DP | DP | - | - |
| outputFromObservable | @angular/core/rxjs-interop | S | S | S | S | DP | DP | DP | - | - |
| outputToObservable | @angular/core/rxjs-interop | S | S | S | S | DP | DP | DP | - | - |
| auto-csp | @angular/build | DP | DP | DP | E | - | - | - | - | - |
| experimentalPlatform | @angular/build | E | E | E | E | - | - | - | - | - |
| withIncrementalHydration | @angular/platform-browser | S | S | S | DP | - | - | - | - | - |
| pendingUntilEvent | @angular/core/rxjs-interop | DP | DP | DP | E | - | - | - | - | - |
| linkedSignal | @angular/core | S | S | S | DP | - | - | - | - | - |
| withRequestsMadeViaParent | @angular/common/http | S | S | S | S | DP | DP | DP | DP | - |
| ngOptimizedImage | @angular/common | S | S | S | S | S | S | S | S | DP 14.2 |
| provideClientHydration | @angular/platform-browser | S | S | S | S | S | S | DP | - | - |
| *ngIf | @angular/common | D | D | D | S | S | S | S | S | S |
| *ngFor | @angular/common | D | D | D | S | S | S | S | S | S |
| *ngSwitch | @angular/common | D | D | D | S | S | S | S | S | S |
| HammerJS integration | @angular/platform-browser | D | D | D | S | S | S | S | S | S |
| platformServerTesting | @angular/platform-server/testing | D | D | D | S | S | S | S | S | S |
| ServerTestingModule | @angular/platform-server/testing | D | D | D | S | S | S | S | S | S |
| TestBed.get | @angular/core/testing | R | R | R | D | D | D | D | D | D |
| TestBed.flushEffects | @angular/core/testing | D | D | D | DP | DP | DP | - | - | - |
| provideCheckNoChangesConfig | @angular/core | DP | DP | DP | E | E | - | - | - | - |
| Vitest | @angular/build | S | S | E | - | - | - | - | - | - |
| withComponentInputBinding | @angular/router | S | S | S | S | S | S | S | - | - |
| Unified control state change events | @angular/forms | S | S | S | S | S | - | - | - | - |
| provideBrowserGlobalErrorListeners | @angular/core | S | S | S | - | - | - | - | - | - |
| inject() | @angular/core | S | S | S | S | S | S | S | S | S |
| NG_BUILD_OPTIMIZE_CHUNKS | @angular/cli | E | E | E | E | E | - | - | - | - |
| provideAnimationsAsync | @angular/animations | D | D | D 20.2 | S | S | S | - | - | - |
| @angular/animations package | @angular/animations | D | D | D 20.2 | S | S | S | S | S | S |
| Router.getCurrentNavigation | @angular/router | D | D | D 20.2 | S | S | S | S | S | S |
| withExperimentalPlatformNavigation | @angular/router | E | E 21.1 | - | - | - | - | - | - | - |
| FormArrayDirective | @angular/forms | S | S | - | - | - | - | - | - | - |
| enableProfiling() | @angular/core | E | E | - | - | - | - | - | - | - |
| VERSION | @angular/upgrade | D | D 21.1 | S | S | S | S | S | S | S |
| Router.isActive | @angular/router | D | D 21.1 | S | S | S | S | S | S | S |
| withExperimentalAutoCleanupInjectors | @angular/router | E | E 21.1 | - | - | - | - | - | - | - |
| ChangeDetectionStrategy.Default | @angular/core | D | D 21.2 | S | S | S | S | S | S | S |
| ChangeDetectionStrategy.Eager | @angular/core | S | S 21.2 | - | - | - | - | - | - | - |
| ChangeDetectorRef.checkNoChanges | @angular/core | S | S | S | S | S | S | S | S | S |
| NoopAnimationDriver | @angular/animations/browser | D | D | D 20.2 | S | S | S | R | R | R |
| MockAnimationDriver | @angular/animations/browser/testing | D | D | D 20.2 | S | S | S | S | S | S |
| MockAnimationPlayer | @angular/animations/browser/testing | D | D | D 20.2 | S | S | S | S | S | S |
| animate | @angular/animations | D | D | D 20.2 | S | S | S | S | S | S |
| animateChild | @angular/animations | D | D | D 20.2 | S | S | S | S | S | S |
| AnimateChildOptions | @angular/animations | D | D | D 20.2 | S | S | S | S | S | S |
| AnimateTimings | @angular/animations | D | D | D 20.2 | S | S | S | S | S | S |
| animation | @angular/animations | D | D | D 20.2 | S | S | S | S | S | S |
| AnimationAnimateChildMetadata | @angular/animations | D | D | D 20.2 | S | S | S | S | S | S |
| AnimationAnimateMetadata | @angular/animations | D | D | D 20.2 | S | S | S | S | S | S |
| AnimationAnimateRefMetadata | @angular/animations | D | D | D 20.2 | S | S | S | S | S | S |
| AnimationGroupMetadata | @angular/animations | D | D | D 20.2 | S | S | S | S | S | S |
| AnimationKeyframesSequenceMetadata | @angular/animations | D | D | D 20.2 | S | S | S | S | S | S |
| AnimationMetadata | @angular/animations | D | D | D 20.2 | S | S | S | S | S | S |
| AnimationOptions | @angular/animations | D | D | D 20.2 | S | S | S | S | S | S |
| AnimationPlayer | @angular/animations | D | D | D 20.2 | S | S | S | S | S | S |
| AnimationQueryMetadata | @angular/animations | D | D | D 20.2 | S | S | S | S | S | S |
| AnimationQueryOptions | @angular/animations | D | D | D 20.2 | S | S | S | S | S | S |
| AnimationReferenceMetadata | @angular/animations | D | D | D 20.2 | S | S | S | S | S | S |
| AnimationSequenceMetadata | @angular/animations | D | D | D 20.2 | S | S | S | S | S | S |
| AnimationStaggerMetadata | @angular/animations | D | D | D 20.2 | S | S | S | S | S | S |
| AnimationStateMetadata | @angular/animations | D | D | D 20.2 | S | S | S | S | S | S |
| AnimationStyleMetadata | @angular/animations | D | D | D 20.2 | S | S | S | S | S | S |
| AnimationTransitionMetadata | @angular/animations | D | D | D 20.2 | S | S | S | S | S | S |
| AnimationTriggerMetadata | @angular/animations | D | D | D 20.2 | S | S | S | S | S | S |
| AUTO_STYLE | @angular/animations | D | D | D 20.2 | S | S | S | S | S | S |
| group | @angular/animations | D | D | D 20.2 | S | S | S | S | S | S |
| keyframes | @angular/animations | D | D | D 20.2 | S | S | S | S | S | S |
| NoopAnimationPlayer | @angular/animations | D | D | D 20.2 | S | S | S | S | S | S |
| query | @angular/animations | D | D | D 20.2 | S | S | S | S | S | S |
| sequence | @angular/animations | D | D | D 20.2 | S | S | S | S | S | S |
| stagger | @angular/animations | D | D | D 20.2 | S | S | S | S | S | S |
| state | @angular/animations | D | D | D 20.2 | S | S | S | S | S | S |
| style | @angular/animations | D | D | D 20.2 | S | S | S | S | S | S |
| transition | @angular/animations | D | D | D 20.2 | S | S | S | S | S | S |
| trigger | @angular/animations | D | D | D 20.2 | S | S | S | S | S | S |
| useAnimation | @angular/animations | D | D | D 20.2 | S | S | S | S | S | S |
| HttpClientJsonpModule | @angular/common/http | D | D | D | D | D | S | S | S | S |
| HttpClientModule | @angular/common/http | D | D | D | D | D | S | S | S | S |
| HttpClientXsrfModule | @angular/common/http | D | D | D | D | D | S | S | S | S |
| HttpClientTestingModule | @angular/common/http/testing | D | D | D | D | D | S | S | S | S |
| DATE_PIPE_DEFAULT_TIMEZONE | @angular/common | D | D | D | D | D | D | D | D | S |
| getCurrencySymbol | @angular/common | D | D | D | D | D | S | S | S | S |
| getLocaleCurrencyCode | @angular/common | D | D | D | D | D | S | S | S | S |
| getLocaleCurrencyName | @angular/common | D | D | D | D | D | S | S | S | S |
| getLocaleCurrencySymbol | @angular/common | D | D | D | D | D | S | S | S | S |
| getLocaleDateFormat | @angular/common | D | D | D | D | D | S | S | S | S |
| getLocaleDateTimeFormat | @angular/common | D | D | D | D | D | S | S | S | S |
| getLocaleDayNames | @angular/common | D | D | D | D | D | S | S | S | S |
| getLocaleDayPeriods | @angular/common | D | D | D | D | D | S | S | S | S |
| getLocaleDirection | @angular/common | D | D | D | D | D | S | S | S | S |
| getLocaleEraNames | @angular/common | D | D | D | D | D | S | S | S | S |
| getLocaleExtraDayPeriodRules | @angular/common | D | D | D | D | D | S | S | S | S |
| getLocaleExtraDayPeriods | @angular/common | D | D | D | D | D | S | S | S | S |
| getLocaleFirstDayOfWeek | @angular/common | D | D | D | D | D | S | S | S | S |
| getLocaleId | @angular/common | D | D | D | D | D | S | S | S | S |
| getLocaleMonthNames | @angular/common | D | D | D | D | D | S | S | S | S |
| getLocaleNumberFormat | @angular/common | D | D | D | D | D | S | S | S | S |
| getLocaleNumberSymbol | @angular/common | D | D | D | D | D | S | S | S | S |
| getLocalePluralCase | @angular/common | D | D | D | D | D | S | S | S | S |
| getLocaleTimeFormat | @angular/common | D | D | D | D | D | S | S | S | S |
| getLocaleWeekEndRange | @angular/common | D | D | D | D | D | S | S | S | S |
| getNumberOfCurrencyDigits | @angular/common | D | D | D | D | D | S | S | S | S |
| Time | @angular/common | D | D | D | D | D | S | S | S | S |
| APP_INITIALIZER | @angular/core | D | D | D | D | S | S | S | S | S |
| BootstrapOptions | @angular/core | D | D | D 20.2 | S | S | S | S | S | S |
| Compiler | @angular/core | D | D | D | D | D | D | D | D | D |
| DefaultIterableDiffer | @angular/core | D | D | D | D | D | D | D | D | D |
| ENVIRONMENT_INITIALIZER | @angular/core | D | D | D | D | S | S | S | S | S |
| getModuleFactory | @angular/core | D | D | D | D | D | D | D | D | D |
| PLATFORM_INITIALIZER | @angular/core | D | D | D | D | S | S | S | S | S |
| JitCompilerFactory | @angular/platform-browser-dynamic | D | D | D | D | D | D | D | D | D |
| platformBrowserDynamic | @angular/platform-browser-dynamic | D | D | D | S | S | S | S | S | S |
| BrowserDynamicTestingModule | @angular/platform-browser-dynamic/testing | D | D | D | S | S | S | S | S | S |
| platformBrowserDynamicTesting | @angular/platform-browser-dynamic/testing | D | D | D | S | S | S | S | S | S |
| BrowserAnimationsModule | @angular/platform-browser/animations | D | D | D 20.2 | S | S | S | S | S | S |
| BrowserAnimationsModuleConfig | @angular/platform-browser/animations | D | D | D 20.2 | S | S | S | S | S | S |
| NoopAnimationsModule | @angular/platform-browser/animations | D | D | D 20.2 | S | S | S | S | S | S |
| provideAnimations | @angular/platform-browser/animations | D | D | D 20.2 | S | S | S | S | S | S |
| provideNoopAnimations | @angular/platform-browser/animations | D | D | D 20.2 | S | S | S | S | S | S |
| CanActivate | @angular/router | S | S | S | S | S | D | D | D 15.2 | S |
| CanActivateChild | @angular/router | S | S | S | S | S | D | D | D 15.2 | S |
| CanDeactivate | @angular/router | S | S | S | S | S | D | D | D 15.2 | S |
| CanLoad | @angular/router | D | D | D | D | D | D | D | D 15.1 | S |
| CanLoadFn | @angular/router | D | D | D | D | D | D | D | D 15.1 | S |
| CanMatch | @angular/router | S | S | S | S | S | D | D | D 15.2 | S |
| DeprecatedGuard | @angular/router | D | D | D | D | D | D | D | D 15.2 | R |
| DeprecatedResolve | @angular/router | D | D | D | R | R | R | R | R | R |
| Resolve | @angular/router | S | S | S | S | S | D | D | D 15.2 | S |
| RouterTestingModule | @angular/router/testing | D | D | D | D | D | D 17.3 | S | S | S |
| downgradeModule | @angular/upgrade/static | D | D 21.2 | D 20.3 | D 19.2 | D 18.2 | D 17.3 | D 16.2 | D 15.2 | D 14.3 |
| ImportedNgModuleProviders | @angular/core | R | R | D | D | D | D | D | D | S |
| NgProbeToken | @angular/core | R | R | D | D | D | D | S | S | S |
| PACKAGE_ROOT_URL | @angular/core | R | R | D | D | D | D | D 16.2 | S | S |
| ApplicationConfig | @angular/platform-browser | R | R | D 20.3 | D 19.2 | D 18.2 | D 17.3 | D 16.2 | S | S |
| UpgradeAdapter | @angular/upgrade | R | R | D | D | D | D | D | D | D |
| UpgradeAdapterRef | @angular/upgrade | R | R | D | D | D | D | D | D | D |
| isPlatformWorkerApp | @angular/common | R | R | R | R | R | D | D | S | S |
| isPlatformWorkerUi | @angular/common | R | R | R | R | R | D | D | S | S |
| async | @angular/core/testing | R | R | R | R | R | D | D | D | D |
| RESOURCE_CACHE_PROVIDER | @angular/platform-browser-dynamic | R | R | R | R | R | D | D | D | D |
| makeStateKey | @angular/platform-browser | R | R | R | R | R | D 17.3 | D 16.2 | S | S |
| StateKey | @angular/platform-browser | R | R | R | R | R | D 17.3 | D 16.2 | S | S |
| platformDynamicServer | @angular/platform-server | R | R | R | R | R | D | D | S | S |
| ServerTransferStateModule | @angular/platform-server | R | R | R | R | R | D | D | D | D 14.2 |
| setupTestingRouter | @angular/router/testing | R | R | R | R | R | R | D | D 15.1 | S |
| UpdateActivatedEvent | @angular/service-worker | R | R | R | R | R | R | D | D | D |
| UpdateAvailableEvent | @angular/service-worker | R | R | R | R | R | R | D | D | D |
| XhrFactory | @angular/common/http | R | R | R | R | R | R | R | D | D |
| ANALYZE_FOR_ENTRY_COMPONENTS | @angular/core | R | R | R | R | R | R | R | D | D |
| ReflectiveKey | @angular/core | R | R | R | R | R | R | R | D | D |
| BrowserTransferStateModule | @angular/platform-browser | R | R | R | R | R | R | R | D | D 14.2 |
| renderModuleFactory | @angular/platform-server | R | R | R | R | R | R | R | D | D |
| NgOptimizedImageModule | @angular/common | R | R | R | R | R | R | R | R | R |
