# Spec: Interchange

Ticket: [Spec: Interchange](../issues/35-spec-interchange.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Builds on the [Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md) (`NfsMediaQuery`, `nfsDefaultNamedQueries`, the Server breakpoint, and the first-render handoff of ADR 0014) and on ADR 0001 (Directive-first), ADR 0005 (Breakpoint source of truth), ADR 0008 (Rendering-modes contract), and ADR 0012 (Sass packaging). The decision log with sources is in the ticket answer.

## Problem Statement

Foundation's Interchange Plugin swaps content by media query. A developer writes `data-interchange="[small.jpg, small], [large.jpg, large]"` and the Plugin sets an image's `src`, an element's inline `background-image`, or, for paths that are not images, fetches an HTML partial with jQuery `$.get`, inserts it with `.html()`, and runs `$(response).foundation()` on it. It re-evaluates every rule on each window resize and applies the last one that matches.

None of that carries over to an Angular library that renders on the server and hydrates:

- The server does not know the viewport. A directive that sets an image `src` from a media query renders one fixed choice on the server and swaps it after hydration, so a desktop visitor downloads the small image, then the large one, and the largest contentful paint waits for JavaScript. The browser already solves this without any script: `<picture>`, `<source media>`, `srcset`, and `sizes` pick the right image at parse time, in the preload scanner, before any JavaScript runs, and Angular's `NgOptimizedImage` generates `srcset` and `sizes` for the common case of one image at several sizes. Foundation's docs never mention them.
- The HTML-partial mode cannot exist in Angular at all: markup inserted with `innerHTML` is not compiled, so Angular directives inside it never run, and Foundation's own `$(response).foundation()` step has no counterpart. What developers used partials for (a light mobile block and a heavy desktop block) is what Angular's `@defer` and resource APIs do.
- Two needs remain that the platform does not cover in markup: a background image whose URLs are data (from a CMS or an API, not known when the stylesheet compiles) chosen by breakpoint, orientation, or pixel density; and a whole block of template content chosen the same way, for example a different layout or a differently cropped image whose alternative text says something different.
- Foundation's rule syntax has quirks: a query that contains `, ` breaks the parser (the retina query and any media query list do), a path containing `, ` loses the separator, a rule that stops matching leaves the previous content in place so the result depends on resize history, and custom named queries are added by mutating a global object.

Developers migrating from Foundation need to know which of Interchange's uses the platform now covers with no directive, and need a small directive for the uses it does not, one that renders correctly on the server, hydrates cleanly, and speaks Foundation's rule syntax.

## Solution

Interchange becomes documentation plus two small directives that share one attribute, `nfsInterchange`:

- Images get no directive. The spec documents `<picture>` with `<source media>` for art direction (a different crop per breakpoint) and `NgOptimizedImage` (`ngSrc` with `sizes`) or plain `srcset`/`sizes` for resolution switching (one image at several sizes). Both are rendered on the server, choose the right file before any JavaScript runs, and keep working in every rendering mode, including inside `@defer (hydrate never)`. Putting `nfsInterchange` on an `<img>` raises a development-mode error that points at `<picture>`.
- Background mode, `NfsInterchange`: on any element except `<ng-container>`, `nfsInterchange="[hero-small.jpg, small], [hero-large.jpg, large]"` binds the element's inline `background-image` to the last Interchange rule whose query matches. Foundation's rule string is accepted unchanged, and a typed tuple form, `[['hero-small.jpg', 'small'], ['hero-large.jpg', 'large']]`, is accepted for URLs that come from data. Backgrounds whose URLs are known when the stylesheet compiles need no directive: the developer's own stylesheet uses Foundation's `breakpoint()` mixin and CSS `image-set()`.
- Template mode, `NfsInterchangeOutlet`: on an `<ng-container>`, `[nfsInterchange]="[[compact, 'small'], [full, 'large']]"` renders the `<ng-template>` of the last matching rule, the way `NgTemplateOutlet` renders one template. This replaces the HTML-partial mode: code splitting is a consumer `@defer` block inside the template, and fetched data is a consumer `httpResource` or `resource` inside the rendered component.
- Queries are Foundation's: a breakpoint name (`medium`) means "at least that breakpoint", a Named query (`landscape`, `portrait`, `retina`, or the developer's own from `nfsInterchangeDefaultsToken`) means its media query, and anything else that looks like a media query is used as written. All of it is answered by the Breakpoint service, so the server renders the Server breakpoint's rule deterministically and the client switches to the live viewport at the service's first render callback.
- A `replaced` output reports the rule that was applied once the page shows it (after the change-detection pass that rendered it, so a handler sees the new content with its bindings applied), and a read-only `selected` signal gives the current rule.

## User Stories

1. As a developer migrating from Foundation, I want the spec to tell me that images need no directive, so that I use `<picture>` and `srcset` instead of porting `data-interchange` on `<img>`.
2. As a developer, I want a `<picture>` example that uses Foundation's breakpoint widths in `<source media>`, so that my art-directed images switch at the same widths as my Foundation CSS.
3. As a developer, I want to know that `<picture>` takes the first matching `<source>` while Interchange takes the last matching rule, so that I write my sources largest first.
4. As a developer, I want an `NgOptimizedImage` example for one image at several sizes, so that I get generated `srcset`, lazy loading, and priority preloading from Angular.
5. As a developer, I want to know that `NgOptimizedImage` does not support `<picture>` in Angular 22.2, so that I use a plain `<img>` inside `<picture>` for art direction.
6. As a developer who put `nfsInterchange` on an `<img>` out of Foundation habit, I want a development-mode error that names `<picture>`, so that I do not ship an image that swaps after hydration.
7. As a visitor on a slow network, I want images chosen before JavaScript runs, so that I download one image, not two.
8. As a visitor with JavaScript disabled, I want the right image for my screen, so that the page works without scripts.
9. As a developer, I want to write `nfsInterchange="[hero-small.jpg, small], [hero-large.jpg, large]"` on a `<div>`, so that Foundation's background-image markup works almost verbatim.
10. As a developer whose background URLs come from a CMS, I want to bind a typed tuple array, so that I build rules from data with type checking.
11. As a developer, I want the rule string and the tuple form to mean the same thing, so that I can switch between them freely.
12. As a developer, I want rules evaluated in order with the last match winning, so that Foundation's documented rule order carries over.
13. As a developer, I want `retina` rules to work even though the retina query contains commas, so that high-density backgrounds do not break the parser as they do in Foundation.
14. As a developer, I want paths with parentheses or quotes to produce a valid `background-image`, so that unusual file names do not break the style.
15. As a developer, I want `landscape`, `portrait`, and `retina` available without setup, so that Foundation's named queries carry over.
16. As a developer, I want to add my own named queries through `nfsInterchangeDefaultsToken`, so that I can write rules like `[dark-hero.jpg, dark]`.
17. As a developer, I want to provide that token at bootstrap, route, or element level with the nearest provider winning, so that one section of my app can have its own names.
18. As a developer, I want to write a raw media query in a rule, as Foundation documents, so that one-off queries need no named query.
19. As a developer, I want a development-mode warning for an unknown bare name in a rule, so that a typo such as `meduim` does not silently never match.
20. As a developer, I want a warning when my custom named query has the same name as a breakpoint, so that I know the breakpoint wins.
21. As a developer, I want the background removed when no rule matches, so that the result depends only on the current viewport and not on resize history.
22. As a developer, I want my stylesheet's own `background-image` to show when no rule matches, so that I can give a default in CSS.
23. As a developer whose background URLs are static, I want a documented stylesheet recipe with Foundation's `breakpoint()` mixin and `image-set()`, so that I need no directive and get a correct first paint at every width.
24. As a developer, I want to choose between whole blocks of template content by breakpoint or named query, so that I can show a compact layout on phones and a full one on desktops.
25. As a developer, I want template mode to take `<ng-template>` references in the same tuple shape, so that one rule syntax covers both modes.
26. As a developer, I want to put a `@defer` block inside a rule's template, so that the desktop block's code is only downloaded where it is shown.
27. As a developer who used HTML partials, I want the spec to tell me to fetch data with `httpResource` inside a component instead of fetching markup, so that my content is compiled and interactive.
28. As a developer, I want a `replaced` output with the applied rule, so that I can react when the content changes (for example to re-measure a layout or log which variant was shown).
29. As a developer, I want `replaced` to fire once for the initial content on the client, so that I learn what was applied without reading the DOM.
30. As a developer, I want a read-only `selected` signal through `#ic="nfsInterchange"`, so that nearby template code can read the current rule.
31. As an SSR developer, I want the server HTML to carry the Server breakpoint's background and template, so that crawlers and first paint see content.
32. As an SSR developer who sets the Server breakpoint from client hints, I want the server's choice to be what the client hydrates, so that Chromium desktop visitors get no swap at all.
33. As an SSR developer, I want to know that a background can be fetched twice on viewports that differ from the Server breakpoint, so that I pick the stylesheet recipe or client hints when that matters.
34. As a developer using incremental hydration, I want an Interchange block inside `@defer (hydrate on viewport)` to hydrate with the live breakpoint, so that it is correct once it is interactive.
35. As a developer using `@defer (hydrate never)`, I want to know that backgrounds and templates keep the Server breakpoint's choice there while `<picture>` keeps working fully, so that I choose the right tool for static regions.
36. As a developer of a zoneless app, I want breakpoint changes to update the background and the rendered template without `NgZone`, so that the directives fit Angular 22's defaults.
37. As a keyboard user, I want focus kept inside the new content when a rotation or resize swaps the block I was in, so that I do not lose my place.
38. As a screen reader user, I want every image's alternative text to stay true for whichever source is shown, so that what I hear matches what others see.
39. As a screen reader user, I want informative background images to have their information in the page text, so that nothing is conveyed by a background alone.
40. As a screen reader user, I want no announcement when the layout swaps, so that resizing does not interrupt me.
41. As a test author, I want to fake `MediaMatcher` and drive the directives, so that browser-level tests need no window resizing.
42. As a test author, I want the rule parser as a pure function, so that I can test Foundation's rule strings in Node.
43. As a library maintainer, I want the directives to call `matchMedia` only through the Breakpoint service, so that the rendering-modes rules are enforced in one place.

## Implementation Decisions

### Foundation contract

From `Interchange.defaults`, `Interchange.SPECIAL_QUERIES`, and the Interchange docs (the forms and media inventory research, Interchange section):

| Foundation | Behaviour | Library counterpart |
| --- | --- | --- |
| `data-interchange="[path, query], ..."` | Rules on the element; parsed with `/\[.*?, .*?\]/g`, each split on `', '`, the last piece is the query and the rest are joined with an empty string as the path | `nfsInterchange` attribute value (input `rules`): the same string, parsed by `parseNfsInterchangeRules`, which splits each rule at its first comma and trims (see Deltas) |
| Option `rules` (default `null`): an array of `"[path, query]"` strings for programmatic use | Replaces the attribute | The typed tuple form of the same input, `readonly NfsInterchangeRule<T>[]` |
| Option `type` (`data-interchange-type`, default `'auto'`; `'src'`, `'background'`, `'html'`) | Chooses the replacement; `auto` picks `src` for `<img>`, `background` for image-extension paths, `html` otherwise | Dropped: the host decides the mode (any element: background; `<ng-container>`: template); `src` is replaced by `<picture>` and `srcset`, `html` by template mode |
| Query tokens: a key of `SPECIAL_QUERIES` (breakpoint names added at init as `only screen and (min-width: <em>)`, plus `landscape`, `portrait`, `retina`), otherwise the token is used as a media query | Resolved per rule | Breakpoint name through `NfsMediaQuery.atLeast`; Named query key from the Defaults token's `namedQueries` (default `nfsDefaultNamedQueries`) through `NfsMediaQuery.matches`; any other token containing whitespace or `(` through `matches` as written; an unknown bare word warns in development and never matches |
| `Foundation.Interchange.SPECIAL_QUERIES[name] = query` | Global custom named queries | `nfsInterchangeDefaultsToken` with `namedQueries` (replaces the default map; spread `nfsDefaultNamedQueries` to extend it) |
| `_reflow()` on `resizeme.zf.trigger`: `window.matchMedia(query).matches` per rule, last match wins, no match leaves the element unchanged | Evaluation | `selected` is a `computed` over the parsed rules and the Breakpoint service, re-evaluated when a `MediaQueryList` `change` fires; last match wins; no match clears the content (see Deltas) |
| `replace(path)` with a `currentPath` guard | Imperative apply | Dropped as public API: content is derived from `rules`; change the rules instead. Signal equality replaces the guard |
| `src` mode: sets `src`, records `currentPath` on `load` | Image swap | Dropped (no directive for images) |
| `background` mode: `background-image: url(<path>)` with `(` and `)` percent-encoded | Background swap | `[style.background-image]` host binding with `url("<path>")`, the path escaped as a CSS string |
| `html` mode: `$.get`, `.html(response)`, `$(response).foundation()` | Partial loading | Dropped; template mode plus consumer `@defer` and `httpResource`/`resource` |
| `replaced.zf.interchange` | Fired right after `src` or the style is set (before the image loads), or after a partial is inserted | `replaced` output, emitted from a render callback that runs after the change-detection pass that rendered the new rule (decision 12; building-blocks 1.4 mapping) |
| Generated `id` (`<6 chars>-interchange`) and `data-resize` | For the Triggers resize bus | Dropped: no id is needed, and the Breakpoint service replaces the resize bus |
| `init.zf.interchange`, `destroyed.zf.interchange` | Lifecycle | No counterpart (Angular lifecycle, building-blocks 1.4) |

Deltas from Foundation, each deliberate:

- A rule splits at its first comma, not its last: media query lists (the `retina` query, `print, (min-width: 40em)`) contain commas, while paths almost never do (a comma in a URL can be percent-encoded as `%2C`). Whitespace around the path and query is trimmed, so `[a.jpg,small]` also works.
- No match clears the background or the rendered template instead of keeping the previous one, so the result depends only on the current media state. This is what makes the server output deterministic and the `hydrate never` residue predictable.
- A raw media query is recognised by whitespace or a parenthesis; a bare word is always a name. A bare media type (`print`) is therefore written as a query (`only print`).
- A custom named query cannot shadow a breakpoint name: breakpoint names are resolved first and the shadowing key warns once in development.

Dropped options: `type` (the host element decides the mode) and the `"[path, query]"` string-array form of the programmatic `rules` option (the tuple form replaces it). The `data-interchange` rule string itself stays, as the `nfsInterchange` value. Dropped public method: `replace(path)`.

### CSS class to Angular mapping

None. Interchange has no Foundation CSS class, Structural or State, and no Export mixin. The directives add no class; the classes the consumer writes on the host (`.hero`, `.thumbnail`, a grid cell) are untouched. Per building-blocks 1.3, a Plugin with no Structural class takes the Plugin name: `NfsInterchange`, and `NfsInterchangeOutlet` for the template form, named after `NgTemplateOutlet`, whose job it does.

### Hierarchy and DI shape

No container and no items; two independent directives that share one internal selection helper.

```
nfsInterchangeDefaultsToken (optional Defaults token: namedQueries)
NfsMediaQuery (root service, Breakpoint service spec)
      ^
      | inject
      +-- NfsInterchange        selector [nfsInterchange]:not(ng-container)   background mode
      +-- NfsInterchangeOutlet  selector ng-container[nfsInterchange]         template mode

Pure function (public): parseNfsInterchangeRules
Internal: the selection computed (rules + NfsMediaQuery + namedQueries), the rendered-rule signal, the CSS url() escaper
```

- The two selectors are disjoint, so exactly one directive matches an element and the template type checker types `nfsInterchange` per element: strings or string tuples on elements, template tuples on `<ng-container>`. This is Material's `matButton` shape (one attribute, `MatButton` on `<button>` and `MatAnchor` on `<a>`). Angular's selector parser accepts `:not(<element>)` and element-qualified selectors on `<ng-container>` (its compiler matches `ng-container[directiveA]` in its own tests).
- `nfsInterchangeDefaultsToken`: `InjectionToken<NfsInterchangeDefaults>`, Shape B (building-blocks 1.4 and 1.9), read with `inject(nfsInterchangeDefaultsToken, {optional: true})`; the nearest provider wins (bootstrap, route, or an element injector). It holds the Named queries because the Breakpoint service spec placed them here: only Interchange uses them.
- No parent or child tokens: nothing registers with anything. No `nfsOpenableToken`: Interchange is not an Openable.
- `NfsMediaQuery` is injected, never re-provided. CDK `InteractivityChecker` is injected by the outlet for the focus rule.
- Entry point: `ngx-foundation-sites/interchange`, which imports `ngx-foundation-sites/media-query`, so a consumer `@defer` block pulls in both with the first Interchange use.

### API

Types:

```ts
/** One Interchange rule: Foundation's `[path, media_query]` as a labelled tuple. */
type NfsInterchangeRule<T> = readonly [content: T, query: string];

interface NfsInterchangeDefaults {
  /** Named queries by name; replaces nfsDefaultNamedQueries (spread it to extend). */
  namedQueries?: Readonly<Record<string, string>>;
}

declare const nfsInterchangeDefaultsToken: InjectionToken<NfsInterchangeDefaults>;

/** Parses Foundation's `data-interchange` string into rules; invalid segments warn in dev and are skipped. */
declare function parseNfsInterchangeRules(rules: string): NfsInterchangeRule<string>[];
```

`NfsInterchange` (background mode). Selector `[nfsInterchange]:not(ng-container)`, `exportAs: 'nfsInterchange'`.

| Member | Kind | Type | Default | Foundation | Meaning |
| --- | --- | --- | --- | --- | --- |
| `rules` | `input.required`, alias `nfsInterchange` | `string \| readonly NfsInterchangeRule<string>[]` | none | `data-interchange`, option `rules` | Background URLs and their queries; a string is parsed with `parseNfsInterchangeRules` |
| `selected` | read-only signal (`computed`) | `Signal<NfsInterchangeRule<string> \| undefined>` | | `currentPath` | The last rule whose query matches, or `undefined` |
| `replaced` | `output` | `NfsInterchangeRule<string> \| undefined` | | `replaced.zf.interchange` | Emitted from a render callback after the change-detection pass that wrote the rule's `background-image`, when that rule differs from the last one reported, starting with the first client render (once, with the live rule; see Emission timing); `undefined` when the background was cleared |
| host `[style.background-image]` | host binding | `string \| null` | | `background` mode | `url("<escaped path>")` of `selected`, or `null` (no inline property) |

`NfsInterchangeOutlet` (template mode). Selector `ng-container[nfsInterchange]`, `exportAs: 'nfsInterchange'`.

| Member | Kind | Type | Default | Foundation | Meaning |
| --- | --- | --- | --- | --- | --- |
| `rules` | `input.required`, alias `nfsInterchange` | `readonly NfsInterchangeRule<TemplateRef<unknown>>[]` | none | `data-interchange` in `html` mode | Templates and their queries; no string form, because a string cannot name a template |
| `selected` | read-only signal (`computed`) | `Signal<NfsInterchangeRule<TemplateRef<unknown>> \| undefined>` | | | The last rule whose query matches |
| `replaced` | `output` | `NfsInterchangeRule<TemplateRef<unknown>> \| undefined` | | `replaced.zf.interchange` | Emitted from a render callback after the change-detection pass that created the new view and ran its first update pass (bindings, control flow, child component inputs), and after the focus rule (see ARIA), starting with the first client render (once, with the live rule; see Emission timing); `undefined` when the outlet was cleared |

Neither directive has a `model()` (nothing is two-way: the viewport owns the state), public methods, or content projection slots. The rendered template gets no context object: its bindings read the declaring component, as with `@if`.

Query resolution (one internal helper, used by both directives), per rule in written order, last match wins:

1. The query is a name of the Breakpoint map (`mq.breakpoints`): `mq.atLeast(query)`, which matches Foundation's `only screen and (min-width: <em>)` meaning.
2. The query is a key of `namedQueries` (the Defaults token's map, else `nfsDefaultNamedQueries`): `mq.matches(namedQueries[query])`.
3. The query contains whitespace or `(`: `mq.matches(query)`, a raw media query as Foundation documents ("`media_query` can be any CSS media query").
4. Otherwise: a development warning once per distinct string ("unknown Interchange query 'meduim'; use a breakpoint name, a named query, or a media query") and no match.

`selected` reads the input, the Defaults token's map, and the service's reactive reads inside one `computed`, so it recomputes when the rules change or when `current` or a `matches()` signal changes, and nowhere else.

Emission timing (decision 12). `selected` is the rule the directive wants; the rendered rule is the one change detection has put on the page. Each directive keeps the rendered rule in a private signal that is written only in change detection, by the same `effect()` that performs the swap (template mode) or by an `effect()` that runs in the same change-detection pass as the host binding that writes the style (background mode). The render callback that emits `replaced` depends on the rendered rule, never on `selected` alone, and acts only when the two are equal and the rule differs from the last one reported. This is what makes the order hold when the write that changes `selected` comes from another render callback, as the Breakpoint service's first-render handoff does: that write happens in an `earlyRead` callback, and a later-phase render callback that read `selected` directly would run in the same batch of render hooks, before the change-detection pass that renders the swap (the [Prototype: Interchange template outlet under hydration](../issues/61-prototype-interchange-outlet-hydration.md) measured exactly that, in both modes and in three engines). With the rendered rule, that batch sees the two disagree and does nothing; the swap's write to the rendered rule schedules the callback again, and Angular runs render hooks only after a change-detection pass that leaves no view dirty, so the new view's bindings and control flow are in the DOM when `replaced` fires. At the first client render `replaced` fires once, with the live rule: when the handoff replaces the Server breakpoint's rule before the first paint, that rule is never reported, because it was never shown. The [Re-run: Interchange spec, the `replaced` timing and the outlet's focus rule](../issues/67-rerun-interchange-replaced-timing.md) verified this in three engines under client rendering, full hydration, prerendering, and `@defer (hydrate on viewport)`, for the handoff, for a later write made inside a render callback, and for a later plain signal write.

Development-mode checks (stripped from production builds): `NfsInterchange` on an `<img>` host throws "nfsInterchange does not support <img>: use <picture> with <source media> for art direction, or srcset/sizes (NgOptimizedImage) for resolution switching" (a construction-time read of the host's `nodeName`, which is also safe on the server); an unparseable segment of a rule string warns and is skipped; an unknown bare name warns once; a `namedQueries` key equal to a breakpoint name warns once that the breakpoint wins.

### Implementation level and primitives

- Images: native platform. `<picture>`, `<source media>`, `srcset`, `sizes`, and `<img loading="lazy">` are all in the Browser target (web platform research section 12), so images stop at the first level with no library code. `NgOptimizedImage` (Angular, not this library) is the documented tool for resolution switching.
- Background and template modes: custom Angular directives over the Breakpoint service. The platform supplies the media queries (`matchMedia` and `MediaQueryList` `change`, reached only through `NfsMediaQuery`, which wraps CDK `MediaMatcher`); `@angular/aria` has no pattern for this; CDK contributes `MediaMatcher` (inside the service) and `InteractivityChecker` (the outlet's focus rule). No `@defer` in the library (building-blocks 1.11 decision 7).
- Background: one host style binding on a `computed`; no `Renderer2`, no `ElementRef` writes, no listeners. One `effect()` writes `selected()` into the rendered-rule signal; a directive's view effects run in the same change-detection pass of the declaring view that applies its host bindings, so the rendered rule and the style change together, and the `replaced` render callback runs after that pass.
- Template: the outlet injects `ViewContainerRef`; an `effect()` compares the selected template with the one currently rendered and, when it differs, first records whether the live `document.activeElement` is inside the view it is about to remove (only then does that view still exist; the check is a DOM read, no layout), then clears the container and calls `createEmbeddedView`; in every run it writes `selected()` into the rendered-rule signal. The effect runs on the server too, which is what puts the Server breakpoint's template into the server HTML; creating a view is Angular rendering, not a DOM write behind Angular's back, and it is the same `ViewContainerRef` path `NgTemplateOutlet` takes, whose dehydrated views hydration claims by template id. Angular runs a view's effects before it refreshes that view's embedded views, so the new view gets its first update pass in the same change-detection pass. The [Prototype: Interchange template outlet under hydration](../issues/61-prototype-interchange-outlet-hydration.md) confirmed the effect-driven view under SSR, hydration, `@defer (hydrate on viewport)`, and the Breakpoint service's same-tick switch (the swap lands before the first paint in three engines).
- Render hooks (building-blocks 1.5): each directive has one `afterRenderEffect` with only a `mixedReadWrite` phase, depending on the rendered-rule signal and `selected`. In the outlet it reads `document.activeElement` and tabbability (CDK `InteractivityChecker`, which reads layout), moves focus (a write), then emits `replaced`; in background mode it only emits. `mixedReadWrite` because the focus rule reads and then writes, and because a `replaced` handler may do both (the documented place for a consumer's own focus move or a re-measure), so emitting in `read` would invite writes into a read phase; the cost is one callback per swap, not per frame. Not `earlyRead`: that phase also holds the Breakpoint service's handoff write, ordered by registration, and a callback in it could still read the Server breakpoint's value (ADR 0014 guarantees live values from the `write` phase on).
- No `ngDoCheck` fallback. The prototype confirmed the `effect()` path, and it showed that the `ngDoCheck` form does not work in a zoneless app: nothing marks the declaring view for check when `selected` changes, so `ngDoCheck` never runs again after the handoff. In the prototype it appeared to swap only because the early `replaced` handler wrote a signal the page template read, which re-checked the page; once `replaced` waits for the rendered rule, the `ngDoCheck` outlet keeps the Server breakpoint's view (the [Re-run: Interchange spec, the `replaced` timing and the outlet's focus rule](../issues/67-rerun-interchange-replaced-timing.md), three engines).
- Why the swap stays in change detection rather than moving into the render callback beside the emission: a view created in a render callback has had only its creation pass when the same callback continues, so `@if` content, bound attributes, and child inputs are missing when `replaced` fires and when the focus rule looks for a tabbable element (measured in the re-run: the new view's `@if` link was absent at emission and focus stayed on `<body>`, in three engines). An explicit `detectChanges()` on the new view fixes that, but it needs two swap paths (the effect for server HTML and the hydration pass, the render callback afterwards) and change detection inside a render callback, and it does not carry over to directives whose swap is an `@if` in their own template.
- Why not host `NgTemplateOutlet` through `hostDirectives`: a host directive's inputs can be set only from a template, not by the host directive's own class (the same limit building-blocks 1.9 records for Aria's required inputs), and `NgTemplateOutlet` reacts only to `ngOnChanges`.
- Why no background style through `--nfs-interchange-*` custom properties plus a Library mixin with per-breakpoint media queries (which would give a correct first paint at every width): it covers breakpoint names only, not Named queries, raw media queries, or last-match-wins across mixed queries, so it would be a second code path with different semantics (building-blocks 1.2 "one code path per behaviour"). Static URLs already have the stylesheet recipe under Further Notes, which needs no library code.

### Comparison with Angular Material and `NgOptimizedImage`

Angular Material has no counterpart: there is no responsive-content or responsive-image component in Material 22.2, and its only related piece, CDK `BreakpointObserver` with Material's `Breakpoints`, is compared in the Breakpoint service spec and not used.

`NgOptimizedImage` (`img[ngSrc]`, Angular 22.2) is the nearest Angular piece, and the reason images get no directive:

| Concern | `NgOptimizedImage` | Plain `<picture>` / `srcset` | A hypothetical `img[nfsInterchange]` |
| --- | --- | --- | --- |
| Resolution switching (one image, several widths) | Generates `srcset` from a loader and `sizes`; prefixes `sizes` with `auto, ` for lazy images, which WHATWG HTML allows as a fallback list | `srcset` and `sizes` written by hand | Only by breakpoint rule, never by layout width or pixel density |
| Art direction (different crop per breakpoint) | Not supported: its guide says it does not work with `<picture>` yet | `<source media>`, first match wins | Yes, but see the next rows |
| Chosen before JavaScript | Yes (server-rendered attributes) | Yes (preload scanner) | No: the server renders the Server breakpoint's file, the client swaps after hydration, and a desktop visitor downloads both |
| LCP helpers | `priority` sets `fetchpriority` and emits a preload link on the server; enforces `width`/`height` | By hand (`width`/`height`, `loading`) | None |
| Inside `@defer (hydrate never)` | Works (native attributes) | Works | Stuck on the Server breakpoint's file |
| Verdict | Use for resolution switching | Use for art direction | Not built |

Borrowed from `NgOptimizedImage`: nothing in the API; the spec's image guidance defers to it.

### ARIA and keyboard

No APG pattern applies (APG patterns research, Interchange). The directives add no role, state, or property, and no keyboard handling.

| Content | Rule | Who ensures it |
| --- | --- | --- |
| `<img>` inside `<picture>` | The one `alt` must be true for every source; art-directed crops may differ in framing, not in what the image conveys. If the meaning changes per breakpoint, use template mode with one `<img alt>` per template | Consumer (documented) |
| Decorative image | `alt=""` (the native form of `role="presentation"`) | Consumer |
| Background image (background mode) | Carries no text alternative; if it conveys information, the information is in the page text. The directive adds no `aria-label` or `role="img"` | Consumer (documented) |
| Template view | Brings its own semantics; each template's content must be accessible on its own | Consumer |
| Swap while focused (template mode) | When a swap removes the view that contains `document.activeElement`, the outlet moves focus to the first tabbable element of the new view (CDK `InteractivityChecker.isTabbable`). Two steps, because the removed view no longer exists once the new one is rendered: the swap `effect()` records, just before it clears the container, whether the live `activeElement` is inside the old view; the render callback, after the change-detection pass that rendered the new view (bindings and control flow included), moves focus only when that record is set and focus has fallen to `<body>` (so a focus move the user or other code made in between is kept), and then emits `replaced`. If the new view has no tabbable element, focus is left where the browser put it and the consumer can move it from `replaced`. The swap at the first render (Server breakpoint to live) follows the same rule: in a client-rendered app nothing is focused yet, so nothing moves; on a server-rendered or prerendered page a keyboard user may already be on a server-rendered link inside the view before hydration, and focus then moves into the live view (Breakpoint service spec, consumer rule 1) | Library (Breakpoint service spec, ARIA rule 1; APG keyboard practice on persistence of focus) |
| Announcements | Swaps are not announced through live regions: they change layout, not content (Breakpoint service spec, ARIA rule 4) | Library (nothing added) |

Keyboard table: none. Neither directive handles keys or pointer events; controls inside a rendered template keep their own keyboard behaviour.

WCAG 2.2 AA requirements (requirements, not recommendations; the story gate runs axe with the WCAG 2.2 AA rule set, and the criteria axe cannot judge, such as whether an `alt` is true, are checked in review against the stories):

| Criterion | Requirement for Interchange | Foundation default and what makes it pass |
| --- | --- | --- |
| 1.1.1 Non-text Content | Every `<img>` has an `alt` that is true for every source that can be shown: a `<picture>`'s single `alt` for all its sources, one `alt` per `<img>` in each template of template mode. Swapping sources never makes the `alt` false; if the meaning differs per breakpoint, the images go into template mode with separate `alt` values. Decorative images use `alt=""` | Foundation emits no `alt`; this is consumer markup, and every story's image carries a true `alt` |
| 1.3.1 Info and Relationships | A background image set by background mode is decoration only: any information it carries is also in the page text, for every rule's image, so a swap never changes what the text conveys. The directive adds no `role="img"` or `aria-label` to make a background into content; an image that carries meaning is an `<img>` (in `<picture>` or a template) | Foundation's background mode had the same gap; the spec documents the rule and the stories show text that carries the information |
| 1.4.3 Contrast (Minimum) | Text placed over a background image meets 4.5:1 (3:1 for large text) against every rule's image, not only the one the author looked at, or sits on a solid or overlay background that meets it | No Foundation setting applies; consumer CSS. The `interchange--background` story places its text on a Foundation `.callout` (solid background from `$callout-background`) so axe's contrast check is decidable |
| 1.4.5 Images of Text | Swapped images do not carry text that could be real text (headings, slogans, labels in a crop); where a chart or logo must be an image, its text is in the `alt` or the page. Art direction may not introduce text into a crop that the other crops lack | Consumer content; documented |
| 1.4.10 Reflow | Images and backgrounds fit 320 CSS px without two-dimensional scrolling at every rule | Foundation's `foundation-global-styles` sets `img { max-width: 100%; height: auto; }`, which covers `<img>` inside `<picture>` and templates; a consumer who does not include `foundation-global-styles` adds the same two declarations. Background hosts take their width from the layout (Foundation grid), never a fixed width wider than 320 px |
| 2.4.3 Focus Order and 2.4.11 Focus Not Obscured (Minimum) | A template swap that removes the focused view moves focus into the new view (the focus rule above), at runtime and at the first-render handoff, so focus neither stays on `<body>` nor lands on hidden content. The move happens only after the new view is rendered with its bindings and control flow, so the target is the first tabbable element the user actually sees, and before `replaced`, so a consumer's handler sees where focus is | Library behaviour of the outlet |
| 3.2.1 On Focus, 3.2.2 On Input | Swaps are driven by the viewport and media features only, never by focus or input, so no context change follows a focus or an input. The outlet moves focus only when the swap removed the element that held it; a swap never takes focus from anywhere else, and never moves focus when nothing inside the removed view was focused | By construction: the directives declare no listeners |

### Rendered HTML

Default Server breakpoint (`small`), viewport 1300 px (`xlarge`), portrait flag false.

Images, no directive. Consumer markup, server HTML, and hydrated DOM are identical; the browser picks `hero-large.jpg` at parse time:

```html
<picture>
  <source media="(min-width: 64em)" srcset="hero-large.jpg" />
  <source media="(min-width: 40em)" srcset="hero-medium.jpg" />
  <img src="hero-small.jpg" alt="Harbour at dawn" width="1200" height="600" loading="lazy" />
</picture>
```

Background mode. Consumer markup:

```html
<div class="hero" nfsInterchange="[hero-small.jpg, small], [hero-large.jpg, large]"></div>
```

Server HTML (the Server breakpoint's rule; no `jsaction`, because the directive declares no listener):

```html
<div class="hero" nfsinterchange="[hero-small.jpg, small], [hero-large.jpg, large]" style="background-image: url(&quot;hero-small.jpg&quot;);"></div>
```

Hydrated DOM after the Breakpoint service goes live (same node, style rewritten in the same tick):

```html
<div class="hero" nfsinterchange="[hero-small.jpg, small], [hero-large.jpg, large]" style="background-image: url(&quot;hero-large.jpg&quot;);"></div>
```

With a rule list that matches nothing on the server, for example `[[a.jpg, 'landscape'], [b.jpg, 'portrait']]`, the server HTML has no inline `background-image` (Named queries answer `false` on the server), and the client adds it at the first render callback.

Template mode. Consumer markup:

```html
<ng-container [nfsInterchange]="[[compact, 'small'], [full, 'large']]" />
<ng-template #compact><app-product-cards /></ng-template>
<ng-template #full>@defer (on immediate) { <app-product-table /> } @placeholder { <p>Loading table</p> }</ng-template>
```

Server HTML (comment anchors simplified):

```html
<!--ng-container--><app-product-cards>...</app-product-cards><!--container-->
```

Hydrated DOM: hydration claims the `compact` view by template id; the service then goes live, the outlet destroys that view and renders `full`, whose `@defer (on immediate)` block loads the table's code:

```html
<!--ng-container--><app-product-table>...</app-product-table><!--container-->
```

### Animation

None. Foundation's Interchange animates nothing; `background-image` is not interpolable, and the library adds no Motion class, `animate.enter`, or transition. Nothing to reduce for `prefers-reduced-motion`. A consumer who puts `animate.enter` on an element inside a rule's template should know that server-rendered elements play their enter animation at hydration (the [Prototype: `animate.enter` at hydration](../issues/52-prototype-animate-enter-hydration.md)), so the Server breakpoint's view animates in when it hydrates.

### Rendering modes

Per ADR 0008, ADR 0014, and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: `selected` derives from the Breakpoint service's server answer (the Server breakpoint; breakpoint names up to it match; Named queries and raw media queries do not). Background mode renders the matching URL as an inline style host binding; template mode renders the matching template's view. `<picture>` and `srcset` render as written and are correct at every width. No `matchMedia`, `window`, or measurement on the server (rule 9).
- Before hydration: nothing outside host bindings and view creation. The background host binding is the only DOM effect of `NfsInterchange`; the outlet's view creation is Angular rendering. The outlet's swap effect reads `document.activeElement` when it swaps (a read of document state, no layout; on the server there is no previous view to test, and a missing `activeElement` counts as "not inside"). No listeners, observers, timers, or focus calls (rules 3 to 5); `focus()` is called only from the render callback. The rendered-rule signal is written on the server too, where no render callback reads it.
- Client rendering: the first change-detection pass renders the Server breakpoint's rule; the service goes live in the first `earlyRead` callback of that tick; the outlet's `replaced` callback, in the same batch of render hooks, sees the rendered rule disagree with `selected` and waits; the next pass swaps (the effect) or rewrites the style (the host binding) and records the rendered rule; the hooks after that pass emit `replaced` once, with the live rule. All of it happens inside one `ApplicationRef` tick, before the first paint (measured in the re-run: in all three engines the swap lands 1 to 3 ms after the handoff write and `replaced` 0 to 3 ms after the swap, all before the first paint entry).
- Full hydration: the hydration pass claims the server's style and view with the server's values (the Breakpoint service reports the Server breakpoint until its first `earlyRead` callback). The service then goes live and the same tick re-renders: the style binding is rewritten, and the outlet swaps its view if the live rule differs. The swap is a re-render inside the outlet, not a hydration error, the same as an `@if` branch that differs (rendering-modes research section 2). `replaced` follows the order of the Client rendering bullet: it fires once, after the swap's pass, with the live rule; the Server breakpoint's rule is not reported when it is replaced in the handoff tick. If a keyboard user focused a server-rendered link inside the outlet's view before hydration, the swap effect sees it and the focus rule moves focus into the live view.
- Double fetch: a server-rendered inline background starts downloading when the page parses, before hydration. On a viewport whose rule differs from the Server breakpoint's, the client then requests the other file. This is the accepted cost of background mode; the mitigations are the stylesheet recipe (static URLs) and a per-request Server breakpoint from client hints (Breakpoint service spec), which removes the swap for Chromium visitors. `<picture>` has no such cost, which is why images use it.
- Strict CSP: a page whose `style-src` forbids inline styles ignores the server-rendered `style` attribute, so under such a policy the background appears only when hydration writes it through the CSSOM (which CSP allows). The stylesheet recipe avoids this.
- Event replay: neither directive declares a template or host listener, so no Interchange host gets `jsaction` and nothing of Interchange replays. Listeners inside a rendered template are the consumer's and replay as usual. A pre-hydration click on an element inside a view that the first client render swaps out is lost, because replay runs after that render and its target is gone; consumers who need such clicks set the Server breakpoint from client hints or place interactive content outside the swapped template.
- Hydration boundary: each directive is self-contained; the outlet and its `<ng-template>` references belong to one template, so they share a boundary by construction (a `@defer` block is its own view, so a template declared inside it cannot be named from outside).
- Incremental hydration: inside `@defer (hydrate on ...)`, the directive hydrates after the application has rendered, when the service is already live, so the block's hydration render rewrites the background or swaps the view at once if the live rule differs (ADR 0014 Consequences). `replaced` fires once, in the render hooks after that render, with the live rule and the view in the DOM (measured in the re-run in three engines).
- `@defer (hydrate never)`: background and template keep the Server breakpoint's choice forever; `<picture>` and `srcset` keep working fully (building-blocks 1.11 decision 7). Regions that must be right at every width without JavaScript use `<picture>` or the stylesheet recipe. The directive never runs on the client there, so `replaced` never fires and no focus is moved.
- Plain `@defer` (client-created): the service is live, so the directive's first render is live and there is no swap; `replaced` fires once after that render. Wrapping template mode in `@defer (on viewport)` therefore trades server content for no swap and no extra code on first load; wrapping each rule template's content in `@defer` keeps server content for the Server breakpoint's view and splits the others' code. The second is the recommended form for replacing HTML partials. On a client-rendered route, a block that has only `hydrate` triggers is still created on the client shortly after load (the prototypes observed it tens of milliseconds after the first render, consistent with Angular's default `on idle` trigger), so it behaves as this bullet says.
- Prerendering: SSR at build time with the default Server breakpoint (`REQUEST` is `null`); nothing in Interchange reads request tokens (rule 11).
- Zoneless: every change is a signal read in a `computed` feeding a host binding or the swap effect, and the `replaced` render callback is scheduled by the rendered-rule signal those effects write; no `NgZone`, no `markForCheck`, and no lifecycle hook that would need something else to re-check the view (the reason there is no `ngDoCheck` form).

### Sass and custom CSS

No library CSS and no `nfs-interchange` mixin (full subsection under Further Notes). No directive declares `styles` or `styleUrl`.

## Testing Decisions

A good test asserts what a user or a crawler observes: the element's inline `background-image`, which template's content is in the DOM, the image file the browser chose (`currentSrc`), where focus is, the server HTML, and the values `replaced` emits. No test reads a directive's private fields. The Breakpoint service is driven through a fake CDK `MediaMatcher` (the service's documented seam) in browser-level tests and through real viewports in Playwright. There is no prior art in the new repository; the patterns are the Breakpoint service spec's tests, Angular's `renderApplication`-based SSR tests, and the Angular Components universal-app e2e.

Story ids follow `interchange--<story>`: `interchange--picture` (no directive), `interchange--optimized-image` (no directive), `interchange--background`, `interchange--background-rule-forms`, `interchange--named-queries`, `interchange--custom-named-query`, `interchange--raw-media-query`, `interchange--no-match`, `interchange--template`, `interchange--template-deferred`, `interchange--template-focus`.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Every story runs axe with `parameters.a11y.test = 'error'` against WCAG 2.2 AA. Play functions assert relationships that hold at any iframe width (viewport widths are Playwright's job): the expected rule is computed in the play function from `window.matchMedia` on Foundation's query strings.

- `interchange--picture`: the `<img>` has a non-empty `alt`; `img.currentSrc` ends with the file of the first `<source>` whose `media` matches, or the `src` when none does.
- `interchange--optimized-image`: an `img[ngSrc]` with `sizes` renders `srcset`, `loading="lazy"`, and a `sizes` value starting with `auto, `.
- `interchange--background`: the host's inline `background-image` equals `url("<file>")` of the last matching rule; the story's `replaced` log shows that rule once; the headline over the image sits on a Foundation `.callout`, so axe's contrast check passes for every rule's image (WCAG 1.4.3), and the information the image illustrates is in that text (1.3.1).
- `interchange--background-rule-forms`: a rule string and the equivalent tuple array on two elements produce the same `background-image`; a rule string with the full `retina` query inline parses (no warning in the story's console panel).
- `interchange--named-queries`: `landscape` and `portrait` rules produce the image of whichever orientation `window.matchMedia` reports; a `retina` rule agrees with `window.matchMedia` on Foundation's retina string.
- `interchange--custom-named-query`: with a story-level `nfsInterchangeDefaultsToken` adding `dark: '(prefers-color-scheme: dark)'`, the `dark` rule applies exactly when `window.matchMedia` says so.
- `interchange--raw-media-query`: a rule `[wide.jpg, (min-aspect-ratio: 2/1)]` applies exactly when that query matches.
- `interchange--no-match`: with rules that cannot match (`[x.jpg, (max-width: 1px)]`), the host has no inline `background-image` and the story stylesheet's default background shows (computed style).
- `interchange--template`: the text of the template chosen by the last matching rule is present and the other template's text is absent; `replaced` logged once.
- `interchange--template-deferred`: the desktop template's content sits in `@defer (on immediate)`; at the story's width the expected content (or its placeholder, then content) appears; axe passes on both states.
- `interchange--template-focus`: a button with the story's `toggle` control switches the rules from breakpoint to raw queries so the other template is selected while a link inside the current view has focus; afterwards focus is on the first link of the new view.

### 2. Browser-level test (stack per the [browser testing stack decision](../issues/41-browser-testing-stack-decision.md); stack-neutral)

A fake `MediaMatcher` provided in the test's environment injector returns controllable `MediaQueryList` objects.

- Resolution order: a breakpoint name uses `atLeast`; a Named query key uses its media query; a token with whitespace or `(` is matched as written; an unknown bare word warns once per distinct string and never matches; a `namedQueries` key equal to a breakpoint name warns once and the breakpoint wins.
- Last match wins across mixed queries (`[a, small], [b, retina], [c, large]` at `large` on a 2x fake gives `c`; at `medium` on 2x gives `b`).
- Changes: dispatching `change` across a threshold updates `selected`, the host `background-image`, and the rendered view under zoneless change detection with `whenStable()`; `replaced` emits once per change with the rule, `undefined` when the content is cleared, and nothing when a `change` leaves the selected rule the same.
- First client render: `replaced` emits once with the initial rule after the first `whenStable()`.
- Ordering (decision 12): each rule template holds an `@if` block with a link carrying a bound attribute, and the test's `replaced` handler records, synchronously, whether the reported rule's view, its `@if` link, and the bound attribute are in the DOM (template mode), or whether the host's inline `background-image` names the reported file (background mode). All must be present on every emission, in three cases: the first client render with a fake `MediaMatcher` whose live answer differs from the Server breakpoint (the handoff); a later change whose signal write is made inside an `afterNextRender({earlyRead})` callback (the handoff's shape, which the published design failed); and a later `change` dispatched on the fake `MediaQueryList` (a plain listener write). In the handoff case the handler is called once, with the live rule, never with the Server breakpoint's rule.
- Defaults token: element-level provider beats a bootstrap provider; a token without `namedQueries` falls back to `nfsDefaultNamedQueries`.
- Rules input changes at runtime re-select without any media change.
- Outlet: the previous view is destroyed (a test component's `DestroyRef` callback runs) and the new one created; with focus inside the old view, focus lands on the first tabbable element of the new view, including one rendered inside an `@if` of that view, and the `replaced` handler already sees `document.activeElement` on it; this holds for the two later-change cases of the ordering item (write inside a render callback, plain listener write); with focus elsewhere, focus does not move; a new view with no tabbable element leaves focus on `<body>`.
- Escaping: a path containing `"`, `\`, `(`, `)`, and a space yields a `background-image` the browser accepts (computed style is not `none`).
- Development checks: `nfsInterchange` on `<img>` throws the documented error; a malformed rule-string segment warns and the other rules still apply.

### 3. Node-level Vitest

- Pure logic (table-driven): `parseNfsInterchangeRules` on Foundation's docs examples, whitespace variants (`[a.jpg,small]`, extra spaces), a query list with commas (the `retina` string, `print, (min-width: 40em)`), a path with parentheses, an empty string, a missing bracket, and a segment without a comma (warn and skip); the query classifier (breakpoint name, named key, raw query, unknown word); the CSS `url()` escaper.
- SSR smoke: `renderApplication` over a fixture with a background element, a template outlet, a `<picture>`, and a rule list that only has `landscape`/`portrait`. Assert `whenStable()` resolves; the background host carries `background-image: url("hero-small.jpg")`; the outlet rendered the `small` template's text and not the `large` one's; the orientation-only element has no inline `background-image`; no Interchange host carries `jsaction`; the `<picture>` is serialised unchanged; with a server provider `{map, serverBreakpoint: 'large'}` the background and template are the `large` ones; a `MediaMatcher` spy records no call. Runs in its own file or process because `provideServerRendering()` leaves `ngServerMode` set; whether under `@angular/build:unit-test` or a separate Vitest project is the [Prototype: Rendering-mode test seam](../issues/59-prototype-rendering-mode-test-seam.md).

### 4. Playwright e2e

Against the static Storybook build, in Chromium, Firefox, and WebKit:

- `page.setViewportSize` at 639, 640, 1023, and 1024 px on `interchange--background`, `interchange--template`, and `interchange--picture`: the background, the rendered template, and `img.currentSrc` change exactly at Foundation's thresholds, and resizing back without a reload restores them.
- Orientation: a 800 x 600 viewport then 600 x 800 on `interchange--named-queries` flips the landscape and portrait images.
- Density: a new browser context with `deviceScaleFactor: 2` selects the `retina` rule; `deviceScaleFactor: 1` does not.
- Focus across a real resize on `interchange--template-focus`: with keyboard focus inside the compact view, resizing past 1024 px moves focus to the first link of the full view.

Against the prerendered fixture app (the harness from the [Prototype: Rendering-mode test seam](../issues/59-prototype-rendering-mode-test-seam.md)):

- JavaScript disabled at 1300 px: the `<picture>` shows the large file (`currentSrc`), the background and the template show the Server breakpoint's (`small`) choice; screenshot plus axe.
- Hydration at 1300 px: the background becomes the large file and the outlet the full template; no NG05xx in the console; `ngDevMode.componentsSkippedHydration === 0`. The fixture's `replaced` handlers record the DOM at emission (as in the browser-level ordering item): each fires once, with the large rule, and sees the large view with its `@if` content and the large background; the same on the fixture's client-rendered route, where the swap also lands at or before the first Paint Timing entry.
- Focus before hydration at 1300 px, main bundle held: a link inside the server-rendered `small` template has keyboard focus; after hydration, focus is on the first link of the `large` view.
- Network: at 1300 px the page requests only the large `<picture>` file, and requests both background files (documenting the accepted double fetch; a change in either count surfaces here); at 360 px each background file is requested once.
- `@defer (hydrate on viewport)` block below the fold holding a background and an outlet: scrolling it into view at 1300 px hydrates it into the large choice with no NG05xx, and its `replaced` handlers see the large view and background at emission.
- `@defer (hydrate never)` block: the background and the template keep the small choice and no error is logged; a `<picture>` inside it still shows the large file.
- Pre-hydration click with the main bundle delayed, at 360 px: a button inside the rendered `small` template is clicked before hydration and its handler runs once after hydration (the view is not swapped at this width).

## Out of Scope

- An image mode (`img[nfsInterchange]`) and any wrapper around `<picture>` or `NgOptimizedImage`: images use the platform and Angular's directive (proposed ADR in the ticket answer).
- The HTML-partial mode, runtime compilation of fetched markup, and any `innerHTML` insertion by the library (proposed ADR).
- A `type` input and `auto` detection by file extension.
- A public `replace(path)` method.
- A component that generates `<picture>` from Interchange rules: `<picture>` is short to write and a component would re-render markup the consumer owns (ADR 0001).
- Background selection through custom properties and a Library mixin (Implementation level, last bullet).
- Container queries as Interchange queries: Foundation's Interchange queries are viewport media queries (ADR 0005); consumers who need element-width switching use `srcset` with `sizes` for images or container queries in their own stylesheet.
- Waiting for the image to load before emitting `replaced`: background images have no load event on the element, and Foundation emitted before load too.
- Each consuming layout's focus rule beyond the first-tabbable default: consumers refine it from `replaced`.

## Further Notes

### Design decisions

| # | Decision | Chosen | Alternatives not taken, and why |
| --- | --- | --- | --- |
| 1 | Images | No directive; `<picture>` for art direction, `NgOptimizedImage` or `srcset`/`sizes` for resolution switching; dev error on `img[nfsInterchange]` | A `src`-binding directive (server renders one file, client swaps after hydration, double download, LCP after JavaScript, stuck in `hydrate never`); silently ignoring `<img>` (Foundation migrants would ship broken images) |
| 2 | HTML partials | Dropped; template mode plus consumer `@defer` and `httpResource`/`resource` | Fetch and `innerHTML` (not compiled, no directives, a sanitisation and XSS surface, Foundation's `$(response).foundation()` has no counterpart); a `PendingTasks`-backed loader for server HTML (a data-fetching API inside a layout directive, which `httpResource` already is) |
| 3 | Shape | Two directives on one attribute with disjoint selectors, `NfsInterchange` and `NfsInterchangeOutlet` | One directive detecting the mode from the value type (a host style binding on `<ng-container>` has no element to write to); two attribute names (Foundation's `data-interchange` covers both modes) |
| 4 | Template mode as a directive | Kept, per building-blocks Table A, for Foundation's rule syntax, Named queries, and last-match-wins | Documentation only, `@if`/`@switch` over `NfsMediaQuery` (still documented as the equivalent for code that needs none of those; see Usage examples) |
| 5 | Rule forms | Foundation's string (elements only) and a labelled tuple `[content, query]` | Objects `{path, query}` (longer in templates; `path` is wrong for templates); string only (no typed data binding) |
| 6 | Rule split | First comma, trimmed | Foundation's `', '` split with the last piece as query (breaks the retina query and any media query list, drops commas from paths) |
| 7 | Query tokens | Breakpoint name, then Named query key, then raw media query (whitespace or `(`), else warn | Names only, as the Breakpoint service spec's paragraph reads (drops Foundation's documented raw media queries; proposed amendment in the ticket answer) |
| 8 | Custom Named queries | `namedQueries` in `nfsInterchangeDefaultsToken`, replacing the default map | A field on `nfsBreakpointsToken` (only Interchange uses them; Breakpoint service spec decision 16); merging automatically (the binding example spreads `nfsDefaultNamedQueries` explicitly) |
| 9 | No match | Clear the content | Keep the previous content, Foundation's behaviour (depends on resize history; server and `hydrate never` output would not be a function of the media state) |
| 10 | Background binding | `[style.background-image]` host binding, `url("...")` with CSS string escaping | `Renderer2.setStyle` (not rendered on the server, forbidden before hydration); percent-encoding only parentheses (quotes and backslashes still break the value) |
| 11 | Template rendering | `ViewContainerRef.createEmbeddedView` from an `effect()` on both platforms (confirmed by the outlet prototype); no fallback | `NgTemplateOutlet` as a host directive (its input cannot be set from the class); `afterRenderEffect` alone (does not run on the server, so no server content); the swap in `afterRenderEffect` after the first client render (the new view has had only its creation pass when the callback goes on to focus and emit; with `detectChanges()` it works but needs two swap paths); `ngDoCheck` (never runs again in a zoneless app once nothing else re-checks the declaring view; re-run measurement) |
| 12 | `replaced` timing and payload | From an `afterRenderEffect` (`mixedReadWrite`) that depends on a private rendered-rule signal written in change detection by the swap (or style) effect, and emits only when the rendered rule equals `selected` and differs from the last one reported; once at the first client render, with the live rule; the rule tuple, or `undefined` when cleared. Revised on 2026-09-26 after the outlet prototype showed the published form (a render callback reading `selected`) firing before the swap when the triggering write comes from another render callback | Reading `selected` in the render callback (fires in the same hook batch as the handoff write, before the swap: measured in both modes, three engines); swap and emit in one render callback (see 11); Foundation's synchronous emit before load; emitting on the server (outputs have no listener there and render callbacks do not run) |
| 13 | Public state | Read-only `selected` signal via `exportAs: 'nfsInterchange'` | A `model()` (the viewport owns the state; nothing to write back) |
| 14 | Focus on swap | First tabbable element of the new view when focus was inside the old one: containment recorded by the swap effect just before it clears the container, focus moved in the `replaced` render callback before the emission, only if focus has fallen to `<body>`; applies at the first-render handoff too | No focus handling (APG: do not remove the focused element without moving focus); a focus-target input (API for a rare case that `replaced` covers); checking containment in the render callback (after a runtime swap the old view is gone and the browser has already moved focus to `<body>`) |
| 15 | Static backgrounds | Stylesheet recipe with Foundation's `breakpoint()` and `image-set()` | Directive for every background (double fetch and CSP cost with no benefit when URLs are static) |
| 16 | Library CSS | None | A Library mixin for custom-property backgrounds (Implementation level, last bullet) |

### Usage examples

Art direction with `<picture>` (no directive). Sources are listed largest first because `<picture>` takes the first matching `<source>`; the `media` values are Foundation's default breakpoints in em (px / 16, as Foundation's Sass computes them):

```html
<picture>
  <source media="(min-width: 64em)" srcset="harbour-wide.jpg, harbour-wide-2x.jpg 2x" />
  <source media="(min-width: 40em)" srcset="harbour-medium.jpg, harbour-medium-2x.jpg 2x" />
  <img src="harbour-square.jpg" srcset="harbour-square-2x.jpg 2x" alt="Fishing boats in the harbour at dawn" width="800" height="800" />
</picture>
```

With a customised Breakpoint map, bind the strings from the Breakpoint service so they follow `nfsBreakpointsToken`; `get()` returns Foundation's `only screen and (min-width: <em>)`, which does not match print media, so a printed page shows the `<img>` fallback:

```html
<picture>
  <source [attr.media]="mq.get('large')" srcset="harbour-wide.jpg" />
  <img src="harbour-square.jpg" alt="Fishing boats in the harbour at dawn" width="800" height="800" />
</picture>
```

Resolution switching with `NgOptimizedImage` (one image, the browser picks the width):

```html
<img ngSrc="harbour.jpg" width="1600" height="900" sizes="(min-width: 64em) 50vw, 100vw" alt="Fishing boats in the harbour at dawn" />
```

A static background in the developer's stylesheet (no directive), compiled with their Foundation settings:

```scss
.hero {
  background-image: image-set(url('hero-small.jpg') 1x, url('hero-small-2x.jpg') 2x);

  @include breakpoint(large) {
    background-image: image-set(url('hero-large.jpg') 1x, url('hero-large-2x.jpg') 2x);
  }
}
```

Background mode with Foundation's markup, then with data:

```html
<div class="hero" nfsInterchange="[hero-small.jpg, small], [hero-medium.jpg, medium], [hero-large.jpg, large], [hero-large-2x.jpg, retina]"></div>

<section
  class="callout"
  [nfsInterchange]="[[banner().mobileUrl, 'small'], [banner().desktopUrl, 'large']]"
  (replaced)="log($event)"
></section>
```

A custom Named query, application-wide:

```ts
import {nfsDefaultNamedQueries} from 'ngx-foundation-sites/media-query';
import {nfsInterchangeDefaultsToken} from 'ngx-foundation-sites/interchange';

export const appConfig: ApplicationConfig = {
  providers: [
    {provide: nfsInterchangeDefaultsToken, useValue: {namedQueries: {...nfsDefaultNamedQueries, dark: '(prefers-color-scheme: dark)'}}},
  ],
};
```

```html
<div class="hero" nfsInterchange="[hero-light.jpg, small], [hero-dark.jpg, dark]"></div>
```

Template mode replacing an HTML partial: the compact view is server-rendered for the Server breakpoint, the full view's code is split by `@defer`, and its data comes from `httpResource` inside the component:

```html
<ng-container [nfsInterchange]="[[compact, 'small'], [full, 'large']]" #ic="nfsInterchange" (replaced)="onLayout($event)" />

<ng-template #compact>
  <app-product-cards />
</ng-template>

<ng-template #full>
  @defer (on immediate) {
    <app-product-table />
  } @placeholder {
    <p>Loading the product table</p>
  }
</ng-template>
```

```ts
@Component({
  selector: 'app-product-table',
  template: `
    @if (products.hasValue()) {
      <table class="hover">...</table>
    }
  `,
})
export class ProductTable {
  protected readonly products = httpResource<Product[]>(() => '/api/products');
}
```

Art direction whose meaning changes per breakpoint (one `alt` cannot describe both), in template mode:

```html
<ng-container [nfsInterchange]="[[chartSmall, 'small'], [chartLarge, 'large']]" />
<ng-template #chartSmall><img src="sales-2026.png" alt="Sales rose 12% in 2026" width="400" height="300" /></ng-template>
<ng-template #chartLarge><img src="sales-by-region-2026.png" alt="Sales rose 12% in 2026; the north region grew fastest at 20%" width="1200" height="600" /></ng-template>
```

The equivalent without the directive, for code that needs no Named queries or rule strings:

```html
@if (mq.atLeast('large')) {
  @defer (on immediate) { <app-product-table /> }
} @else {
  <app-product-cards />
}
```

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. Interchange relies on no Foundation export mixin: Foundation ships no Interchange CSS, and the directives add no class. No library CSS; there is no `nfs-interchange` mixin. (1) Rules: none; background mode writes an inline style host binding, and template mode renders consumer templates. (2) Reused settings: none in library CSS; breakpoint-named queries read `nfsBreakpointsToken`, whose CSS mirror is `nfs-breakpoint-properties`, and the static-background recipe under Usage examples is consumer CSS that calls Foundation's `breakpoint()` mixin with the consumer's own `$breakpoints`. (3) Custom properties: none; the directive writes no `--nfs-interchange-*` property. (4) Motion classes: none, and no `prefers-reduced-motion` override, because Interchange animates nothing. (5) A missing include breaks nothing, because there is none; without `nfs-breakpoint-properties` only the Breakpoint service's development drift check is lost.

### Platform features to adopt when the browser target moves

- Bare `sizes="auto"` on lazy images (Chromium 126, Gecko 150, WebKit 27; not in the Browser target): the image guidance can drop hand-written fallback sizes. Until then, `sizes="auto, <fallback>"` is valid HTML that older engines read as the fallback list, and `NgOptimizedImage` already emits it for lazy images.
- `<iframe loading="lazy">` (Firefox 121; not in the target): embeds that developers used to load as HTML partials (maps, videos) can load lazily in markup. Until then, an iframe inside a rule's template, or inside a consumer `@defer (on viewport)` block, loads only when that view renders.
- `NgOptimizedImage` support for `<picture>` (on Angular's roadmap, not in 22.2): art-directed images then get Angular's loader, `srcset` generation, and priority preloading too; this spec's `<picture>` guidance switches to it with no library change.

### Foundation behaviour changed or dropped

- `src` mode, `html` mode, `type`, `auto` detection by file extension, and `replace(path)` are dropped (decisions 1, 2, and the Foundation contract).
- `$.get` plus `.html()` plus `$(response).foundation()` becomes template mode with `@defer` and `httpResource` or `resource`.
- `resizeme.zf.trigger` re-evaluation on every resize and the load-time `[data-resize]` snapshot (which missed elements added later) become `MediaQueryList` `change` events through the Breakpoint service, which fire once per threshold crossing and reach elements created at any time.
- Manual `(`/`)` percent-encoding becomes CSS string escaping inside `url("...")`.
- The `src` quirk that emitted `replaced` before the image loaded and re-set `src` on a resize during loading disappears with `src` mode.
- Generated `id` and `data-resize` attributes are no longer written.
- No match clears instead of keeping the previous content; the rule split and the raw-media-query recognition are the Deltas under Foundation contract.
