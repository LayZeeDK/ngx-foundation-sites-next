# Spec: Breakpoint service (shared utility)

Ticket: [Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Decided upstream in ADR 0005 (Breakpoint source of truth), ADR 0008 (Rendering-modes contract), and ADR 0012 (Sass packaging); the decision log with sources is in the ticket answer.

## Problem Statement

Nine of Foundation's 21 Plugins change behaviour with the viewport: ResponsiveMenu and ResponsiveAccordionTabs switch mode per breakpoint, ResponsiveToggle and OffCanvas change at a named breakpoint, Tooltip, Sticky and Equalizer switch themselves off below one, Interchange swaps sources by breakpoint or by orientation and pixel density, and Orbit, SmoothScroll, and Magellan should stop moving things when the user asks for reduced motion. In Foundation they all ask one utility, `Foundation.MediaQuery`, which learns the breakpoints by reading a serialised Sass map out of the computed `font-family` of a `<meta class="foundation-mq">` element and re-checks them on every window `resize`.

That design cannot carry over to an Angular library that must render on the server:

- The `font-family` handshake needs a rendered stylesheet and computed style. The server has neither, and prerendering has no browser at all, so the library cannot learn the breakpoints the way Foundation does.
- The server does not know the viewport. CDK's `MediaMatcher` answers `false` to every query on the server, including the always-true `small`, so a directive that asks it naively renders a state no viewport has.
- If each directive reads `matchMedia` on its own, each picks its own moment and its own answer; a directive that reads the real viewport while hydrating renders something the server never sent, and one Plugin may disagree with another about the current breakpoint.
- A developer who customises Foundation's `$breakpoints` in Sass has to repeat the values for JavaScript, and nothing tells them when the two drift apart.
- Foundation's rule strings (`drilldown medium-dropdown`, `accordion medium-tabs`) are parsed separately in each Plugin, with their quirks: rule order decides which rule wins, a breakpoint name with a hyphen breaks the parser, and an unknown mode throws later.

Developers need one source of truth for breakpoints that works in the browser, on the server, while prerendering, and during hydration, and library authors need one API that every breakpoint-gated Plugin spec can build on.

## Solution

A root service, `NfsMediaQuery`, that answers Foundation's MediaQuery questions from a TypeScript Breakpoint map instead of from CSS:

- The Breakpoint map comes from `nfsBreakpointsToken`, whose root factory holds Foundation's default map (`small` 0, `medium` 640, `large` 1024, `xlarge` 1200, `xxlarge` 1440, in px). A developer who changed `$breakpoints` in Sass provides the same values once, at application level.
- `current` is a signal holding the name of the current breakpoint; `atLeast()`, `upTo()`, `only()`, and `is('medium down')` answer Foundation's questions as reactive reads of that signal; `resolve()` picks the mode a Breakpoint rule assigns to the current breakpoint; `matches()` tracks any other media query (Interchange's `landscape`, `portrait`, `retina`); `reducedMotion` is a signal for `prefers-reduced-motion: reduce`.
- The media queries are exactly Foundation's (`only screen and (min-width: 40em)`), built from the map in em as Foundation's Sass does, and read through CDK `MediaMatcher` in the browser.
- On the server and while prerendering the service answers with the Server breakpoint, `small` by default. On the client it keeps answering with the same Server breakpoint until its first render callback, then switches to the live viewport inside the same change-detection pass, so hydration always starts from exactly what the server sent. A server that picks its breakpoint per request (for example from client hints) hands the choice to the client through Angular's `TransferState`.
- One pure parser reads Foundation's Breakpoint rule strings for ResponsiveMenu and ResponsiveAccordionTabs, typed by the modes each Plugin allows; rules resolve by the order of the Breakpoint map, not by the order they are written.
- In development builds, the service compares the Breakpoint map with the Breakpoint properties that the developer's `@include nfs-breakpoint-properties;` emits from their Sass `$breakpoints`, and warns once when they disagree or when the include is missing.

Anything that only looks different per breakpoint stays in Foundation's CSS (`.show-for-*`, `.hide-for-*`, `.<bp>-horizontal`, `.reveal-for-<bp>`, `.in-canvas-for-<bp>`); the service is for behaviour.

## User Stories

1. As an application developer, I want the library to know Foundation's default breakpoints without any setup, so that breakpoint-gated Plugins work out of the box with Foundation's default Sass settings.
2. As an application developer who customised `$breakpoints` in Sass, I want to provide the same values once in TypeScript, so that every Plugin switches at the widths my CSS uses.
3. As an application developer who customised `$breakpoints`, I want a development-mode warning naming each breakpoint whose TypeScript and Sass values differ, so that I notice drift before users do.
4. As an application developer who forgot the `nfs-breakpoint-properties` include, I want one warning that names the include, so that I know exactly which line to add.
5. As an application developer, I want the warning to appear once, not on every render or for every Plugin, so that my console stays readable.
6. As an application developer, I want to read the current breakpoint name as a signal, so that my own components can react to it in templates and `computed` values.
7. As an application developer, I want `atLeast('medium')`, `upTo('medium')`, `only('medium')`, and `is('medium down')` with Foundation's meanings, so that code and knowledge from Foundation's MediaQuery docs carry over.
8. As an application developer, I want these checks to update my templates when the viewport crosses a breakpoint, without subscribing or unsubscribing, so that responsive logic is one expression.
9. As an application developer, I want `get('medium')` to return Foundation's media query string, so that I can put the same query on a `<source media>` or in my own `matchMedia` code.
10. As an application developer, I want the queries to use em, as Foundation's Sass does, so that JavaScript and CSS switch at the same point when the user changes the browser's default font size.
11. As an application developer, I want `reducedMotion` as a signal, so that my own autoplay or scroll animations stop when the user asks for less motion, and start again if they change the setting.
12. As a user who has asked the operating system for reduced motion, I want carousels to stop rotating and smooth scrolling to jump, so that the page does not move on its own.
13. As an SSR application developer, I want the server to render one well-defined breakpoint, so that server HTML is deterministic and cacheable.
14. As an SSR application developer, I want that breakpoint to be `small` unless I choose otherwise, so that the server HTML follows Foundation's mobile-first base.
15. As an SSR application developer, I want to choose a different Server breakpoint in my server configuration, so that a desktop-heavy site can render desktop markup first.
16. As an SSR application developer, I want a documented recipe that picks the Server breakpoint per request from client hints, so that Chromium visitors get their own layout in the server HTML.
17. As an SSR application developer, I want the client to start from whatever breakpoint the server chose, even when my client configuration does not know it, so that hydration never meets a markup mismatch caused by the breakpoint.
18. As an SSR application developer, I want prerendered pages to use the default Server breakpoint, so that prerendering works even though there is no request.
19. As an SSR application developer, I want no `matchMedia` call and no stylesheet read to happen on the server or before hydration, so that the library respects Angular's hydration rules.
20. As an application developer using a plain client-rendered app, I want no visible flash of the Server breakpoint's layout, so that client rendering looks as if the service knew the viewport from the start.
21. As an application developer using incremental hydration, I want a breakpoint-gated widget inside a `@defer (hydrate on ...)` block to hydrate with the live breakpoint, so that it is correct from the moment it becomes interactive.
22. As an application developer using `@defer (hydrate never)`, I want to know that widgets there keep the Server breakpoint's state, so that I rely on Foundation's visibility classes for anything that must look right at every width.
23. As an application developer, I want a widget created later inside a plain `@defer` block to render the live breakpoint straight away, so that deferred content has no swap at all.
24. As a developer of a zoneless application, I want breakpoint changes to update the view without `NgZone`, so that the library fits Angular 22's default change detection.
25. As a developer of a zone-based application, I want the same service to work unchanged, so that I can adopt the library before migrating.
26. As a ResponsiveMenu or ResponsiveAccordionTabs author, I want Foundation's rule strings parsed into a typed object, so that I do not write a parser per Plugin.
27. As an application developer, I want `accordion medium-tabs` and `medium-tabs accordion` to mean the same, so that rule order never changes behaviour (Foundation's docs say the order does not matter).
28. As an application developer, I want a rule without a breakpoint prefix to apply from the smallest breakpoint of my map, even if I renamed `small`, so that rules follow my Breakpoint map.
29. As an application developer with a breakpoint name that contains a hyphen (`x-large`), I want rules like `x-large-dropdown` to work, so that Foundation's single-hyphen split does not limit my naming.
30. As an application developer, I want the object form `{small: 'drilldown', medium: 'dropdown'}` accepted wherever a rule string is, so that I can bind rules from code with type checking.
31. As an application developer, I want a development-mode warning that quotes an unknown mode or breakpoint in a rule string, so that a typo does not silently disable a mode.
32. As a Tooltip, Sticky, or Equalizer author, I want `showOn`, `stickyOn`, and `equalizeOn` values (`medium`, `large only`, `medium down`, `all`) answered by one call, so that every Plugin reads Breakpoint queries the same way.
33. As an application developer, I want a Breakpoint query with an unknown name or modifier to warn in development and answer `false`, so that a typo in a template does not crash my app.
34. As an Interchange author, I want Foundation's named queries (`landscape`, `portrait`, `retina`) available as a constant and trackable as live signals, so that Interchange can match them like breakpoints.
35. As an application developer, I want to add my own named queries through Interchange's Defaults token, so that I can use names such as `dark` or `wide-landscape` in Interchange rules.
36. As an OffCanvas or ResponsiveToggle author, I want `atLeast(revealOn)` and `atLeast(hideFor)` to agree with Foundation's `.reveal-for-<bp>` and `.hide-for-<bp>` classes, so that behaviour and CSS switch at the same width.
37. As a printing user, I want printing a page not to switch menus and tabs to their small-screen modes, so that the printout shows the layout I was looking at.
38. As a library directive author, I want the service's live values available in every render callback phase after its own first one, so that measurements and timers in `afterNextRender` see the real viewport.
39. As a library directive author, I want replayed events to see the live breakpoint, so that a hover or click made before hydration is judged against the real viewport.
40. As a test author, I want to replace `MediaMatcher` with a fake, so that browser-level tests can drive breakpoint changes without resizing a window.
41. As a test author, I want pure functions for rule parsing, width-to-breakpoint mapping, and query building, so that I can test them in Node without a browser.
42. As an accessibility reviewer, I want every breakpoint swap in a consuming Plugin to keep focus on the equivalent control, so that keyboard and screen reader users do not lose their place when the viewport changes.
43. As a library maintainer, I want one service to be the only place the library calls `matchMedia`, so that the rendering-modes rules are enforced in one spot.

## Implementation Decisions

### Foundation contract

What Foundation 6.9's MediaQuery utility does (its source, the "JavaScript" part of Foundation's Media Queries docs, and the utilities research, section 3):

| Foundation | Behaviour | Library counterpart |
| --- | --- | --- |
| `$breakpoints` Sass map (`small: 0, medium: 640px, large: 1024px, xlarge: 1200px, xxlarge: 1440px`; the first value must be `0`) | Source of truth for Sass and, through the handshake, for JavaScript | Sass stays the consumer's; JavaScript reads `nfsBreakpointsToken` (ADR 0005) |
| `.foundation-mq { font-family: 'small=0em&medium=40em&...' }` plus the `<meta class="foundation-mq">` the plugin appends to `<head>` | Serialised map read back from computed style | Dropped: needs computed style, which the server lacks. The Breakpoint properties are the development-mode check channel instead |
| `queries`: `{name, value: 'only screen and (min-width: <em>)'}` in map order | One min-width query per breakpoint | Same strings, built from the token in em (px / 16), exposed through `get(name)` |
| `current` | Name of the largest matching query, recomputed on every window `resize` | `current` signal, updated from `MediaQueryList` `change` events |
| `atLeast(size)` | `matchMedia(get(size)).matches`; `false` for unknown names | Same meaning; unknown name warns in development and answers `false` |
| `upTo(size)` | `!atLeast(next(size))`, `true` for the last breakpoint; throws for unknown names | Same meaning; unknown name warns and answers `false` |
| `only(size)` | `size === current` | Same |
| `is('medium')`, `is('medium up')`, `is('medium only')`, `is('medium down')` | Dispatch to `atLeast`/`only`/`upTo`; throws on any other modifier | Same grammar plus `all` (Tooltip's keyword) and the empty string (Equalizer's "no gate"), both `true`; a bad modifier warns and answers `false` |
| `get(size)` | Query string or `null` | Same |
| `next(size)` | Following breakpoint name | Dropped from the public API (no consumer; `upTo` covers it) |
| `changed.zf.mediaquery` on `window` with `[newSize, oldSize]` | Broadcast on breakpoint change | The `current` signal; consumers derive with `computed`, `linkedSignal`, or `effect` |
| `_init()`, `_reInit()`, `isInitialized` | Lazy initialisation and re-reading late CSS | Dropped (DI constructs the service; the token does not depend on CSS) |
| `window.matchMedia` polyfill | For pre-IE10 browsers | Dropped (`matchMedia` and `MediaQueryList` `change` are in the Browser target) |
| Interchange `SPECIAL_QUERIES` (`landscape`: `screen and (orientation: landscape)`, `portrait`: `screen and (orientation: portrait)`, `retina`: the six-part device-pixel-ratio list), extensible by assignment | Named queries for Interchange rules | `nfsDefaultNamedQueries` constant with Foundation's three strings verbatim; `matches(query)` tracks any of them; custom named queries go in Interchange's Defaults token |

Breakpoint rule syntax (ResponsiveMenu `data-responsive-menu`; ResponsiveAccordionTabs `data-responsive-accordion-tabs`; both Plugins carry the same parser): space-separated tokens, each `<breakpoint>-<mode>` or a bare `<mode>` meaning `small`; parsed by `rule.split('-')`; the winning rule is the last one in written order whose breakpoint `atLeast` matches. Modes: ResponsiveMenu `dropdown`, `drilldown`, `accordion`; ResponsiveAccordionTabs `accordion`, `tabs`.

Breakpoint query users: Tooltip `showOn` (default `'small'`; `'all'` bypasses the check), Sticky `stickyOn` (default `'medium'`), Equalizer `equalizeOn` (default `''`, which skips the check). Breakpoint name users through `atLeast`: ResponsiveToggle `hideFor` (default `'medium'`), OffCanvas `revealOn` and `inCanvasOn` (default `null`).

Deltas from Foundation, each deliberate:

- Rules resolve by the Breakpoint map's order (the largest rule breakpoint at or below `current` wins), not by written order. Every documented Foundation example lists rules smallest first, where both orders agree, and the ResponsiveAccordionTabs docs say "the accordion/tabs values can be in any order", which only map order makes true.
- A bare mode applies from the Zero breakpoint (the breakpoint whose minimum width is 0), not from the hard-coded name `small`.
- A token splits at its last hyphen, so hyphenated breakpoint names work; modes contain no hyphen.
- Unknown modes and breakpoints warn in development at parse time and are skipped; Foundation stores `undefined` and throws when that breakpoint later matches.
- Unknown names never throw; they warn once per distinct string in development and answer `false`.
- While no breakpoint query matches (the media type is not `screen`, for example while printing), `current` keeps its previous value instead of becoming `undefined`, which also matches Foundation's behaviour in practice, because Foundation recomputed only on `resize`.

### Hierarchy and DI shape

There is no directive family; the utility is one service, one configuration token, and pure functions.

```
nfsBreakpointsToken (InjectionToken, root factory: Foundation's default map)
      |
      v
NfsMediaQuery (@Service(), root singleton)
  uses: MediaMatcher (@angular/cdk/layout), TransferState, DOCUMENT, Injector (afterNextRender), DestroyRef
      ^
      | inject(NfsMediaQuery)
ResponsiveMenu, ResponsiveAccordionTabs, ResponsiveToggle, OffCanvas, Sticky, Equalizer,
Tooltip, Interchange, Orbit, SmoothScroll, Magellan, and application code

Pure functions (no DI): parseNfsBreakpointRules, nfsBreakpointForWidth
Constants: nfsDefaultBreakpointMap, nfsDefaultNamedQueries
```

- `nfsBreakpointsToken`: `InjectionToken<NfsBreakpoints>` with `providedIn: 'root'` and a factory returning `{map: nfsDefaultBreakpointMap}`. This is Material's Shape A (required configuration with a root factory, from the DI patterns research), not a per-Plugin Defaults token: the service always needs a map. Named `nfsBreakpointsToken` per ADR 0009.
- Provided at application level only: in the application configuration for every platform, and in the server configuration for a server-only Server breakpoint. The service is a root singleton, so a provider at route or element level is never read; the development-mode check does not look for one.
- `NfsMediaQuery`: `@Service()` (root singleton, tree-shaken when unused, per Angular's services guide). One instance per application, which on the server means one per request, because each request bootstraps its own application.
- No `provideNfs*()` function: one token needs none (building-blocks 1.9; the components repo ships `provide*` only to swap a class). Consumers write `{provide: nfsBreakpointsToken, useValue: ...}` or `useFactory` for the per-request recipe.
- No Defaults token of its own: Breakpoint queries and rules are Options of the consuming Plugins, whose Defaults tokens hold their defaults. Named queries belong to Interchange, the only Plugin that uses them, so they are the `namedQueries` field of Interchange's Defaults token (building-blocks Table B, Interchange), defaulting to `nfsDefaultNamedQueries`.
- Entry point: its own secondary entry point, `ngx-foundation-sites/media-query` (Foundation's utility name, building-blocks 1.3), imported by the consuming Plugins' entry points so a consumer's `@defer` block pulls it in with the first gated Plugin.

### API

Types:

```ts
type NfsBreakpointName = 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge' | (string & {});
type NfsBreakpointMap = Readonly<Record<NfsBreakpointName, number>>; // minimum widths in px
interface NfsBreakpoints {
  map: NfsBreakpointMap;
  serverBreakpoint?: NfsBreakpointName; // defaults to the Zero breakpoint
}
type NfsBreakpointModifier = 'up' | 'only' | 'down';
type NfsBreakpointRules<M extends string> = Readonly<Partial<Record<NfsBreakpointName, M>>>;
```

- `NfsBreakpointMap` values are CSS pixels, the unit of the Breakpoint properties and of Foundation's default settings. Order does not matter: the service sorts by value. Valid means finite, non-negative, unique values with exactly one `0` (Foundation's Sass rule that the first breakpoint is `0`). Development builds throw a descriptive error at service construction for an invalid map or a `serverBreakpoint` that is not a key; production builds skip validation.
- The Zero breakpoint is the key whose value is `0`; the Server breakpoint defaults to it.

`NfsMediaQuery` public surface:

| Member | Type | Meaning |
| --- | --- | --- |
| `current` | `Signal<NfsBreakpointName>` | The current breakpoint: the largest breakpoint whose query matches, or the Server breakpoint before the service goes live (see Rendering modes) |
| `reducedMotion` | `Signal<boolean>` | `(prefers-reduced-motion: reduce)` matches; `false` on the server and before the service goes live |
| `breakpoints` | `readonly NfsBreakpointName[]` | The map's names from smallest to largest |
| `atLeast(name)` | `boolean` | `current` is `name` or larger |
| `upTo(name)` | `boolean` | `current` is `name` or smaller; `true` for the largest breakpoint |
| `only(name)` | `boolean` | `current` is `name` |
| `is(query)` | `boolean` | A Breakpoint query: `'<name>'` or `'<name> up'` as `atLeast`, `'<name> only'` as `only`, `'<name> down'` as `upTo`; `'all'` and `''` are `true` |
| `resolve(rules)` | `M \| undefined` | The mode of the largest rule breakpoint at or below `current`; `undefined` when no rule applies yet (Foundation's "no match" case, left to the consuming spec) |
| `matches(mediaQuery)` | `boolean` | Whether an arbitrary media query matches (named queries); `false` on the server and before the service goes live |
| `get(name)` | `string \| null` | Foundation's query string for a breakpoint, `only screen and (min-width: <px / 16>em)`, for example `only screen and (min-width: 40em)`, `(min-width: 68.75em)` for 1100 px, `(min-width: 0em)` for the Zero breakpoint |

Reactivity and memoisation:

- `current` and `reducedMotion` are the service's state, each a private writable signal exposed read-only. `atLeast`, `upTo`, `only`, `is`, and `resolve` are reactive reads: each reads `current` and compares breakpoint indexes, so it is reactive wherever it is called inside a reactive context (a template, a host binding, `computed`, `linkedSignal`, `effect`, `afterRenderEffect`), and a snapshot anywhere else, which is Foundation's own behaviour.
- The service memoises nothing for these: each call is a map lookup and an integer comparison. Consumers memoise through `computed` over their inputs, for example `canStick = computed(() => mq.is(this.stickyOn()))`, which recomputes only when `stickyOn` or `current` changes.
- `matches(query)` keeps one signal and one `MediaQueryList` per distinct query string, created on first read, because each arbitrary query needs its own listener. The set is small and fixed by the app's templates; listeners are removed when the application is destroyed.
- Why not signal-returning methods (`atLeast(name): Signal<boolean>`): templates would read `mq.atLeast('medium')()`, directives would unwrap a signal inside every `computed`, and the service would need a cache per argument to avoid creating a `computed` on every change-detection pass. Reactive reads give the same reactivity with neither cost.

Pure functions and constants (usable without DI, so Node-level tests reach them directly):

| Export | Signature | Meaning |
| --- | --- | --- |
| `nfsDefaultBreakpointMap` | `NfsBreakpointMap` (frozen) | `{small: 0, medium: 640, large: 1024, xlarge: 1200, xxlarge: 1440}` |
| `nfsDefaultNamedQueries` | `Readonly<Record<string, string>>` (frozen) | Foundation's `landscape`, `portrait`, `retina` strings, verbatim |
| `parseNfsBreakpointRules` | `<M extends string>(rules: string \| NfsBreakpointRules<M>, modes: readonly M[], breakpoints: readonly NfsBreakpointName[]) => NfsBreakpointRules<M>` | Parses a Breakpoint rule string, or validates the object form, against the allowed modes and the ordered breakpoint names (pass `mq.breakpoints`); invalid tokens are skipped with a development-mode warning |
| `nfsBreakpointForWidth` | `(map: NfsBreakpointMap, widthPx: number) => NfsBreakpointName` | The largest breakpoint whose minimum width is at or below `widthPx`; for the server recipe and for tests |

Breakpoint rule grammar (whitespace-separated, case-sensitive like Foundation):

```
rules    := token (WS token)*
token    := mode | breakpoint "-" mode      (split at the last "-")
mode     := one of the modes the consuming Plugin passes
breakpoint := a name of the Breakpoint map
```

A bare `mode` maps to the Zero breakpoint. A repeated breakpoint keeps the last token and warns. The object form is validated with the same rules. The typed result is `NfsBreakpointRules<M>`, for example `{small: 'drilldown', medium: 'dropdown'}`.

Breakpoint query grammar (`is()`): `'all' | '' | <breakpoint> | <breakpoint> WS ('up' | 'only' | 'down')`, whitespace-trimmed.

Named query tokens (Interchange): a token is a breakpoint name, answered by `atLeast(name)`, or a key of the named-query map from Interchange's Defaults token, answered by `matches(namedQueries[key])`; anything else warns and answers `false`. Interchange's own rule order (the last matching rule wins) stays Interchange's, because its rules mix breakpoints with orientation and density queries that have no single order.

Consumers and what each reads (building-blocks Part 2 and Part 3):

| Consumer | Reads | Option |
| --- | --- | --- |
| ResponsiveMenu | `parseNfsBreakpointRules(rules, ['dropdown', 'drilldown', 'accordion'], mq.breakpoints)`, then `resolve()` | `rules` |
| ResponsiveAccordionTabs | `parseNfsBreakpointRules(rules, ['accordion', 'tabs'], ...)`, then `resolve()` | `rules` |
| ResponsiveToggle | `atLeast(hideFor)` for the open logic; first paint from Foundation's `.hide-for-<bp>`/`.show-for-<bp>` classes | `hideFor` |
| OffCanvas | `atLeast(revealOn)`, `atLeast(inCanvasOn)`; first paint from `.reveal-for-<bp>`/`.in-canvas-for-<bp>` | `revealOn`, `inCanvasOn` |
| Sticky | `is(stickyOn)` | `stickyOn` |
| Equalizer | `is(equalizeOn)` | `equalizeOn` |
| Tooltip | `is(showOn)` at show time | `showOn` |
| Interchange | named query tokens through `atLeast` and `matches`, `nfsDefaultNamedQueries` | `rules`, Defaults token `namedQueries` |
| Orbit | `reducedMotion` (autoplay off) | `autoPlay` |
| SmoothScroll, Magellan | `reducedMotion` (`behavior: 'auto'` instead of `'smooth'`) | none |

### Implementation level and primitives

Level: custom Angular service over CDK `MediaMatcher`, per ADR 0005. The platform supplies the queries (`matchMedia`, `MediaQueryList` `change` events, `prefers-reduced-motion`, all Baseline widely available and in the Browser target per the web platform research); `@angular/aria` has nothing for viewport state; CDK has `MediaMatcher` and `BreakpointObserver`, and the service uses only the first.

- `MediaMatcher.matchMedia(query)` for every query, because it adds the empty `@media` style rule that makes WebKit and Blink fire `change` reliably, honours `CSP_NONCE`, and is the documented seam to fake in tests. On the server `MediaMatcher` returns a stub whose `matches` is `false` and which has `addListener` but no `addEventListener`; the service never reaches that stub, because it calls `MediaMatcher` only inside a render callback, and render callbacks do not run on the server (`afterNextRender` returns a no-op when `ngServerMode` is set).
- One `MediaQueryList` per breakpoint query and one for `(prefers-reduced-motion: reduce)`, each with `addEventListener('change', ...)` (not the deprecated `addListener` CDK's observer still uses). A `change` on any breakpoint query recomputes `current` as the largest matching breakpoint; queries are nested min-width ranges, so this equals Foundation's `atLeast` on each query.
- Going live: the constructor registers `afterNextRender({earlyRead})` without a view (so it runs after the next application render). The `earlyRead` callback creates the lists, sets `current`, `reducedMotion`, and every `matches()` signal requested so far, attaches the listeners, and runs the development-mode drift check. Signals set there mark the views that read them, and `ApplicationRef` re-runs change detection before it returns (its synchronisation loop runs after-render hooks at the end of each pass and loops while views are dirty), so the live values reach the DOM in the same tick, before the browser paints.
- Server breakpoint handoff: the constructor reads `TransferState` key `nfsServerBreakpoint` with the token's `serverBreakpoint` (or the Zero breakpoint) as the default, uses the result as the initial `current`, and writes it back. On the server that serialises the per-request choice into the page's `ng-state` script, which `provideServerRendering()` already emits; on the client `TransferState` reads that script at first injection. The write is symmetric and needs no platform check; on the client it is never serialised. A transferred name the client's map lacks warns in development and falls back to the client token.
- Zoneless: every update is a signal write; zoneless change detection is scheduled by template-read signal updates (Angular's zoneless guide). No `NgZone.run` (CDK's observer needs it only because it emits through RxJS and patched `addListener`). In a zone-based app the same writes schedule change detection, and zone.js also runs the `change` callback in the Angular zone.
- Cleanup: `DestroyRef.onDestroy` removes every listener when the application (or a `TestBed` environment) is destroyed.
- Fallback if a target browser misbehaved with `MediaQueryList` `change`: a `ResizeObserver` on the document element recomputing `current` from `matches` in the same callback, which keeps the same public API. Not expected: `change` events are Baseline widely available and CDK's style-rule workaround covers the two known engine quirks.

### Comparison with Angular Material and CDK

| Concern | CDK `BreakpointObserver` / Material `Breakpoints` | `NfsMediaQuery` | Why |
| --- | --- | --- | --- |
| Breakpoint values | `Breakpoints` constants: Material's ranges (`XSmall` below 600 px, `Small` 600 to 960 px, and so on) | Foundation's `$breakpoints` from `nfsBreakpointsToken` | The constants have nothing to do with Foundation's map (ADR 0005) |
| Query shape | Arbitrary strings, often closed ranges (`and (max-width: 959.98px)`) in px | Foundation's open min-width strings in em | Same thresholds as Foundation's CSS, including under a changed default font size |
| Reading state | `isMatched(query): boolean` and `observe(query): Observable<BreakpointState>`; consumers wrap with `toSignal` (Material's navigation schematic) | `current` signal and reactive reads | Signals are the library's state model (building-blocks 1.5); no RxJS in consumers |
| Change timing | First value synchronous, later values debounced by `debounceTime(0)` | Synchronous signal writes | The zoneless scheduler already coalesces writes into one pass |
| Server | `MediaMatcher` stub: `false` for every query, including `(min-width: 0)` | The Server breakpoint: the Zero breakpoint is `true`, larger ones `false`, configurable per request | Server HTML must equal a real viewport's state (rendering-modes research, section 7 rule 9) |
| Hydration | Reads `matchMedia` whenever first asked, including during hydration | Server breakpoint until the first render callback, then live | Hydration starts from the server's state; 1.11 decision 3 forbids `matchMedia` before render callbacks |
| Reduced motion | Material's `_getAnimationsState()` reads `MediaMatcher('(prefers-reduced-motion)')` once and caches it for the page lifetime | `reducedMotion` signal that follows the setting live | Orbit must stop and restart autoplay if the user changes the setting |
| Testing | Fake `MediaMatcher` | Fake `MediaMatcher` | Same seam, borrowed |

Borrowed: a root service over `MediaMatcher`, `MediaMatcher` as the test seam, `@Service()` as CDK 22.2 declares its services. Not borrowed: `BreakpointObserver` itself, `Breakpoints`, `BreakpointState`, comma splitting of query lists, the Observable API, `LayoutModule`.

### ARIA requirements imposed on consumers

The service renders nothing and has no role, state, or keyboard behaviour. It imposes four rules on the Plugins that consume it (building-blocks 1.10 and 1.11 decision 8):

1. Focus continuity on swaps: when a breakpoint change swaps a widget's mode (ResponsiveMenu, ResponsiveAccordionTabs) or hides the element holding focus, the consuming directive moves focus to the equivalent control in the new mode, in a render callback, only when focus was inside the widget. A swap at the first render (Server breakpoint to live) never moves focus, because nothing inside the widget can hold focus before the first render callback, and the directive checks the live `document.activeElement` rather than assuming.
2. No server-bound hiding of content Foundation's CSS shows at a larger breakpoint: a breakpoint-gated hidden or inert state that Foundation shows at a larger breakpoint is expressed with Foundation's visibility and breakpoint classes, never as a `hidden` or `inert` binding computed from `current` (audit 0002 H4; ADR 0008 Consequences).
3. Reduced motion: JavaScript-driven motion (Orbit autoplay, smooth scrolling) reads `reducedMotion` and stops; auto-rotating content keeps its visible stop control regardless (WCAG 2.2.2). CSS motion is handled by the Library mixins' reduced-motion rules, not by this signal.
4. No announcements: breakpoint changes are not announced through live regions; they change layout, not content.

### Rendered output

The service renders no DOM. Two things reach the page:

- The Breakpoint properties, emitted by the developer's `@include nfs-breakpoint-properties;` from their own `$breakpoints` (ADR 0012; Sass packaging decisions 13 to 15):

  ```css
  :root {
    --nfs-breakpoint-small: 0px;
    --nfs-breakpoint-medium: 640px;
    --nfs-breakpoint-large: 1024px;
    --nfs-breakpoint-xlarge: 1200px;
    --nfs-breakpoint-xxlarge: 1440px;
  }
  ```

- The development-mode drift check, which runs once per JavaScript realm (a module-level flag), in the service's first `earlyRead` callback, only when `ngDevMode` is on (stripped from production builds). For each name of the Breakpoint map it reads `getComputedStyle(documentElement).getPropertyValue('--nfs-breakpoint-<name>')`, trims it, and parses a `px` value (unregistered custom properties compute to their specified text, for example `640px`). Outcomes:
  - Every property is empty: one warning, "ngx-foundation-sites: no --nfs-breakpoint-* custom properties were found on :root. Add `@include nfs-breakpoint-properties;` after `@import 'ngx-foundation-sites';` in the stylesheet that compiles Foundation, so this check can compare nfsBreakpointsToken with your Sass $breakpoints."
  - Some differ or are missing: one warning listing each name with both values, for example "ngx-foundation-sites: nfsBreakpointsToken and your Sass $breakpoints disagree: medium is 640px in the token and 768px in --nfs-breakpoint-medium; xxlarge is missing from the CSS. Provide nfsBreakpointsToken with the values of your Sass $breakpoints (in px)."
  - All match within 0.01 px: nothing.
  - Limit, stated in the docs: a breakpoint that exists only in Sass is not detected, because computed style cannot list custom properties by prefix; any Plugin Option that names it then gets the unknown-name warning instead.
  - Why once per realm and not once per application: consumer unit tests that do not compile the Sass would otherwise warn in every test; once per realm is one line per test file.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: `current` is the Server breakpoint for the whole request; `atLeast`, `upTo`, `only`, `is`, and `resolve` derive from it (so the Zero breakpoint answers `true`, unlike CDK's stub); `matches()` and `reducedMotion` are `false`. The service makes no `MediaMatcher`, `window`, or `getComputedStyle` call on the server. The chosen Server breakpoint goes into `TransferState`.
- The client before its first render callback: the same Server breakpoint, read from `TransferState` when the page was server-rendered or prerendered, else from the client token (a client-rendered app or a `RenderMode.Client` route). Nothing reads the viewport yet (1.11 decision 3).
- Going live: in the first `earlyRead` phase after the first application render. With full hydration, that render is the hydration pass, which claims the server nodes with exactly the server's values; the live values then re-render in the same tick: class and attribute bindings are rewritten, and an `@if` or `@switch` branch that differs is rebuilt, which hydration treats as a re-render at that spot, not an error (rendering-modes research, section 2, "Control flow and content projection"). In a client-rendered app the switch happens in the same tick as the first render, so the Server breakpoint's layout is never painted. Every render callback in the `write`, `mixedReadWrite`, and `read` phases of that pass, and every later callback, sees live values.
- What must not run before hydration: no `matchMedia`, no listener, no computed-style read, and no DOM write; the service never writes the DOM at all (CDK's style rule goes into `<head>`, outside the application root, and only from the render callback).
- Incremental hydration: once the application has rendered, the service is live, so a breakpoint-gated directive inside a `@defer (hydrate on ...)` block hydrates with the live breakpoint. If that differs from the Server breakpoint, the block's classes are rewritten or its branch rebuilt during the block's hydration render. A replayed event whose target sat in a rebuilt branch is the consuming spec's concern (ResponsiveAccordionTabs states it).
- `hydrate never`: widgets there keep the Server breakpoint's state forever. This is why anything visible at first paint that differs per breakpoint uses Foundation's CSS classes (ResponsiveToggle, OffCanvas reveal) rather than the service.
- Plain `@defer` (client-created content, route changes): the service is already live, so the directive's first render is live and there is no swap.
- Event replay: the service declares no template or host listeners, so it adds no `jsaction` and nothing of its own replays. Replay runs after the hydrating render's `afterNextRender` callbacks (rendering-modes research, section 3), so a replayed handler that reads `is(showOn)` or `atLeast(hideFor)` sees live values.
- Hydration boundaries: the service is application-wide and is not part of any widget's boundary.
- Prerendering: SSR at build time; `REQUEST` is `null`, so a per-request factory falls back to the default and the page carries the default Server breakpoint. The library itself reads no request token (1.11 decision 11); the client-hint recipe is consumer code.

## Testing Decisions

A good test asserts what a consumer observes: the breakpoint name and booleans the service reports, the DOM a consuming fixture renders from them, the server HTML, and the console warnings, never the service's private fields or listener bookkeeping. There is no prior art in the new repository; the patterns are CDK's own `MediaMatcher`-faking layout specs, Angular's `renderApplication`-based SSR tests, and the Angular Components universal-app e2e.

Story ids follow `media-query--<story>`: `media-query--current-breakpoint`, `media-query--breakpoint-queries`, `media-query--breakpoint-rules`, `media-query--named-queries`, `media-query--reduced-motion`, `media-query--custom-breakpoint-map`. The Storybook preview stylesheet includes `nfs-breakpoint-properties`, so stories carry no drift warning.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Each story renders a small demo component that prints the service's values; every story runs axe with `parameters.a11y.test = 'error'` against WCAG 2.2 AA. Play functions assert relationships that hold at any iframe width, because viewport widths are Playwright's job:

- `media-query--current-breakpoint`: the printed `current` equals the largest breakpoint whose `get()` query `window.matchMedia` reports as matching; the `atLeast`, `upTo`, and `only` table agrees with that breakpoint's index for every name.
- `media-query--breakpoint-queries`: `is()` rows for `medium`, `medium up`, `medium only`, `medium down`, `all`, and the empty string agree with `atLeast`, `only`, and `upTo`.
- `media-query--breakpoint-rules`: the rule strings `drilldown medium-dropdown`, `medium-dropdown drilldown`, and the object form print the same resolved mode.
- `media-query--named-queries`: `landscape` and `portrait` rows agree with `window.matchMedia` on Foundation's strings, and exactly one of them is `true`.
- `media-query--reduced-motion`: the printed `reducedMotion` equals `window.matchMedia('(prefers-reduced-motion: reduce)').matches`.
- `media-query--custom-breakpoint-map`: with a story-level `nfsBreakpointsToken` of `{small: 0, medium: 768, large: 1100, xlarge: 1200, xxlarge: 1440}` and a matching Breakpoint properties style block, `get('medium')` prints `only screen and (min-width: 48em)` and `get('large')` prints `only screen and (min-width: 68.75em)`.

### 2. Browser-level test (stack per [Decide the browser testing stack: Playwright component tests, Vitest Browser, or both](../issues/41-browser-testing-stack-decision.md); stack-neutral)

A fake `MediaMatcher` provided in the test's environment injector returns controllable `MediaQueryList` objects (`matches` plus a `change` dispatcher).

- Handoff: before the first render `current` is the Server breakpoint (token default, a token override, and a seeded `TransferState` value each win in that order); after `await fixture.whenStable()` it is the live breakpoint; a fixture template bound to `current` shows the live value after that one stable, with no intermediate state left in the DOM.
- Changes: dispatching `change` across each threshold updates `current`, `atLeast`, `upTo`, `only`, `is`, and `resolve`, and a fixture's host bindings, under zoneless change detection with `whenStable()` and no `NgZone`.
- No match: when every breakpoint list reports `false` (print media), `current` keeps its value.
- `matches()`: a query first read before the first render is subscribed when the service goes live; one first read later subscribes immediately; one list per distinct query.
- `reducedMotion`: follows `change` both ways.
- Cleanup: destroying the environment injector removes every listener from the fake lists.
- Validation: a map without `0`, with duplicate values, or with an unknown `serverBreakpoint` throws the development-mode error at construction; an unknown name in `atLeast`, `is`, or a named query token warns once per string and answers `false`.
- Drift check, in its own test file (one realm): no properties produces the include warning; a style block with `--nfs-breakpoint-medium: 768px` produces the drift warning naming `medium` with both values; matching properties produce nothing; a second application in the same file produces no second warning.
- Transfer: a `TransferState` seeded with a name absent from the client map warns and falls back to the client token.

### 3. Node-level Vitest

- Pure logic (table-driven): `parseNfsBreakpointRules` for bare modes, prefixed modes, both orders, a hyphenated breakpoint name (`x-large-dropdown` with `x-large` in the map), repeated breakpoints, unknown modes, unknown breakpoints, extra whitespace, and the object form; the Breakpoint query grammar including `all`, the empty string, and bad modifiers; resolution by map order; `nfsBreakpointForWidth` at 0, 639, 640, 1023, 1024, 1439, 1440, and 5000 px; the query builder (`0` to `0em`, `640` to `40em`, `1100` to `68.75em`, `1440` to `90em`); map validation and sorting of an unordered map.
- SSR smoke: `renderApplication` over a fixture that prints `current`, `atLeast('medium')`, `is('large down')`, a resolved rule, `matches()` of `landscape`, and `reducedMotion`. Assert `whenStable()` resolves; the HTML shows `small`, `false`, `true`, the bare rule's mode, `false`, `false`; the `ng-state` script contains `nfsServerBreakpoint: "small"`; with a server provider `{map, serverBreakpoint: 'large'}` the HTML shows `large` and the script says so; with the client-hint recipe's factory and a `REQUEST` carrying `Sec-CH-Viewport-Width: 1300` the HTML shows `xlarge`; with `REQUEST` `null` (the prerender path) it shows `small`; a `MediaMatcher` spy records no call. Runs in its own file or process because `provideServerRendering()` leaves `ngServerMode` set.
- Sass: the Breakpoint properties output itself is tested by the Sass packaging ticket's compile tests (decision 18), not here.

### 4. Playwright e2e

Against the static Storybook build (`media-query--current-breakpoint`, `media-query--breakpoint-rules`, `media-query--custom-breakpoint-map`, `media-query--reduced-motion`) in Chromium, Firefox, and WebKit:

- `page.setViewportSize` at 639, 640, 1023, 1024, 1199, 1200, 1439, and 1440 px: `current` changes exactly at Foundation's thresholds; resizing without a reload updates the printed values; with the custom map the thresholds move to 768 and 1100 px.
- `page.emulateMedia({reducedMotion: 'reduce'})` and back: `reducedMotion` follows without a reload.
- `page.emulateMedia({media: 'print'})`: `current` keeps its screen value.

Against the prerendered fixture app (the harness from the [Prototype: Rendering-mode test seam](../issues/59-prototype-rendering-mode-test-seam.md)):

- JavaScript disabled at a 1300 px viewport: the first paint shows the Server breakpoint's state (`small` output, the bare rule's mode), screenshot plus axe.
- Hydration at 1300 px: after hydration the page shows `xlarge` and the `medium` rule's mode; no NG05xx in the console; `ngDevMode.componentsSkippedHydration === 0`.
- A `@defer (hydrate on viewport)` block below the fold with a breakpoint-dependent `@if`: scrolling it into view at 1300 px hydrates it into the `xlarge` branch with no NG05xx.
- The drift warning does not appear (the fixture includes the Breakpoint properties); a second fixture route built without the include logs the include warning once.

## Out of Scope

- Container queries as the breakpoint mechanism: Foundation documents its breakpoint Options as viewport breakpoints (ADR 0005); container queries stay allowed inside library CSS for component-internal sizing.
- Foundation's `meta.foundation-mq` handshake and reading breakpoints from CSS as the source of truth (ADR 0005).
- A `changed` output or event stream: services have no outputs, and `current` covers it; consumers who want an Observable use `toObservable`.
- HiDPI breakpoints (`$breakpoints-hidpi`) as JavaScript breakpoints: Foundation's JavaScript never read them; Interchange's `retina` named query stays a fixed string.
- `$print-breakpoint` semantics in JavaScript: Foundation's JavaScript ignores print; the service keeps the screen breakpoint while printing.
- A library-owned client-hint reader: nothing in the library reads request tokens (1.11 decision 11); the recipe is documented consumer code.
- Element-level or route-level Breakpoint maps: the viewport is application-wide, so the token is provided at application level only.
- A testing entry point with a fake `MediaMatcher`: consumers provide their own fake, as CDK's own tests do; a shipped test double can be added later without breaking anything.
- Registering the Breakpoint properties with `@property`, and a names-list property that would let the drift check detect Sass-only breakpoints: both would change the Sass packaging decision's output and are recorded as possible follow-ups, not decided here.
- Each consuming Plugin's swap behaviour, focus rule, and first-paint CSS: those belong to the Plugin specs; this spec fixes only what they can rely on.

## Further Notes

### Design decisions

| # | Decision | Chosen | Alternatives not taken, and why |
| --- | --- | --- | --- |
| 1 | Shape | One `@Service()` plus `nfsBreakpointsToken` plus pure functions | A directive family (nothing to attach to); per-Plugin `matchMedia` (disagreeing answers, the hydration rule enforced in ten places) |
| 2 | Token shape | `{map, serverBreakpoint?}`, map in px, sorted by value, Server breakpoint defaults to the Zero breakpoint | A flat map with a `serverBreakpoint` key (collides with a breakpoint of that name); em values (px is the unit of Foundation's defaults and of the Breakpoint properties) |
| 3 | Token scope | Application level only | Element or route overrides (the service is a root singleton and the viewport is global) |
| 4 | Config helper | None; `{provide, useValue}` or `useFactory` | `provideNfsBreakpoints()` (one token needs no wrapper, building-blocks 1.9) |
| 5 | State model | `current` and `reducedMotion` signals; predicates as reactive reads | Signal-returning predicates (double calls in templates, a per-argument cache); an Observable API (building-blocks 1.5) |
| 6 | Query strings | Foundation's `only screen and (min-width: <em>)`, em = px / 16 | Range syntax or px (would diverge from Foundation's CSS under a changed default font size and from Foundation's `get()`) |
| 7 | Primitive | CDK `MediaMatcher`, `addEventListener('change')` | Raw `matchMedia` (loses CDK's engine workaround, nonce, and test seam); `BreakpointObserver` (RxJS, debounce, Material constants) |
| 8 | Server answer | The Server breakpoint, derived predicates (Zero breakpoint `true`), `matches()` and `reducedMotion` `false` | CDK's all-`false` stub (a state no viewport has) |
| 9 | Client before live | The Server breakpoint until the first `earlyRead` callback, then live in the same tick | Live at construction (reads `matchMedia` during hydration against 1.11 decision 3, and makes hydration start from a state the server never sent); per-instance gating (more code for no visible difference, since the first render's switch never paints) |
| 10 | Per-request Server breakpoint | Carried to the client through `TransferState` | Client token only (a server that chose `large` from client hints would hydrate against a client that assumes `small`) |
| 11 | Rule resolution | Largest rule breakpoint at or below `current` (map order) | Foundation's written order (order-sensitive, contradicts Foundation's own "any order" note) |
| 12 | Bare mode | Applies from the Zero breakpoint | Foundation's hard-coded `small` (breaks a renamed map) |
| 13 | Token split | At the last hyphen | Foundation's first-hyphen split (breaks hyphenated breakpoint names) |
| 14 | Invalid input | Development warning once per string, answer `false`, skip the rule token | Foundation's throws and deferred crashes |
| 15 | No match (print) | Keep the previous `current` | `undefined` (Foundation's value) or the Zero breakpoint (would switch menus while printing) |
| 16 | Named queries | Foundation's three strings in `nfsDefaultNamedQueries`; custom ones in Interchange's Defaults token; tracked by `matches()` | A named-query field on `nfsBreakpointsToken` (only Interchange uses named queries; building-blocks Table B already places them) |
| 17 | `retina` string | Foundation's six-part list verbatim | A shorter `(min-resolution: 2dppx)` (a behaviour change for no gain; the extra parts evaluate to false harmlessly) |
| 18 | Reduced motion | Live `reducedMotion` signal | Material's cached read (cannot restart autoplay when the setting changes) |
| 19 | Drift check | Development only, once per realm, token names only, px text parse | Once per application (a warning in every consumer unit test); an opt-out field (more API for a development warning) |
| 20 | Missing properties | One warning naming the include | Silence (the Sass ticket's recommended default was the warning) |
| 21 | Invalid map | Development error at construction | Warning (every breakpoint-gated Plugin would misbehave silently) |
| 22 | Entry point | `ngx-foundation-sites/media-query` | Inside each Plugin (duplicated), or the primary entry point (defeats per-Plugin `@defer`) |

### Usage examples

Application code:

```ts
import {Component, computed, inject, linkedSignal} from '@angular/core';
import {NfsMediaQuery} from 'ngx-foundation-sites/media-query';

@Component({
  selector: 'app-product-list',
  template: `
    @if (mq.atLeast('large')) {
      <app-product-table />
    } @else {
      <app-product-cards [compact]="mq.only('small')" />
    }
  `,
})
export class ProductList {
  protected readonly mq = inject(NfsMediaQuery);
  readonly columns = computed(() => (this.mq.is('xlarge up') ? 4 : this.mq.atLeast('medium') ? 2 : 1));
  // Derived but writable: open by default from large up, reset whenever the viewport crosses large,
  // and toggled by the user in between.
  readonly filtersOpen = linkedSignal({source: () => this.mq.atLeast('large'), computation: (wide) => wide});
}
```

A customised Breakpoint map (the Sass side sets `$breakpoints: (small: 0, medium: 768px, large: 1100px, xlarge: 1200px, xxlarge: 1440px)`):

```ts
// application configuration
import {nfsBreakpointsToken} from 'ngx-foundation-sites/media-query';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: nfsBreakpointsToken,
      useValue: {map: {small: 0, medium: 768, large: 1100, xlarge: 1200, xxlarge: 1440}},
    },
  ],
};
```

A desktop-first server render:

```ts
// server configuration
{provide: nfsBreakpointsToken, useValue: {map: nfsDefaultBreakpointMap, serverBreakpoint: 'large'}}
```

The client-hint recipe (consumer code; Chromium sends `Sec-CH-Viewport-Width` only after the server has sent `Accept-CH: Sec-CH-Viewport-Width` on an earlier response, and responses that depend on it should send `Vary: Sec-CH-Viewport-Width`; Firefox and Safari send no client hints, so they get the default):

```ts
// server configuration
import {inject, REQUEST} from '@angular/core';
import {nfsBreakpointForWidth, nfsBreakpointsToken, nfsDefaultBreakpointMap} from 'ngx-foundation-sites/media-query';

function serverBreakpointFromClientHints() {
  const request = inject(REQUEST); // null when prerendering
  const width = Number(request?.headers.get('Sec-CH-Viewport-Width'));

  return width > 0 ? nfsBreakpointForWidth(nfsDefaultBreakpointMap, width) : undefined;
}

export const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    {
      provide: nfsBreakpointsToken,
      // useFactory runs per request; useValue would be shared by every request
      useFactory: () => ({map: nfsDefaultBreakpointMap, serverBreakpoint: serverBreakpointFromClientHints()}),
    },
  ],
};
```

A consuming directive (the shape the Plugin specs follow; names illustrative):

```ts
const menuModes = ['dropdown', 'drilldown', 'accordion'] as const;

export class NfsResponsiveMenu {
  readonly #mq = inject(NfsMediaQuery);
  readonly rules = input.required<string | NfsBreakpointRules<(typeof menuModes)[number]>>();
  readonly #parsed = computed(() => parseNfsBreakpointRules(this.rules(), menuModes, this.#mq.breakpoints));
  readonly mode = computed(() => this.#mq.resolve(this.#parsed()));
}

export class NfsOrbit {
  readonly #mq = inject(NfsMediaQuery);
  readonly autoPlay = input(true, {transform: booleanAttribute});
  readonly #rotating = computed(() => this.autoPlay() && !this.#mq.reducedMotion());
}
```

Interchange with a custom named query:

```ts
{provide: nfsInterchangeDefaultsToken, useValue: {namedQueries: {...nfsDefaultNamedQueries, dark: '(prefers-color-scheme: dark)'}}}
```

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This utility relies on Foundation's `$breakpoints` setting and its `-zf-bp-to-em` function; it uses no Export mixin. Its CSS is the `nfs-breakpoint-properties` Library mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included once anywhere in the global stylesheet (it has no ordering constraint):

1. Rules: one `:root` rule with `--nfs-breakpoint-<name>: <px>` for each key of `$breakpoints`, in map order. Foundation's CSS cannot provide it because Foundation has no custom-property output for breakpoints; its only JavaScript channel is the `.foundation-mq` `font-family` string that this library does not use.
2. Reuse: the values are `-zf-bp-to-em($value)` times 16 px, read from the consumer's `$breakpoints` (the mixin's optional `$map` parameter defaults to it), so they equal Foundation's media queries by construction; no value is copied.
3. Properties the directives write: none. The service only reads the Breakpoint properties, and only in the development-mode drift check.
4. Motion classes and reduced motion: none; the utility adds no animation. `reducedMotion` is a JavaScript signal; the CSS reduced-motion rules belong to `nfs-motion` and the Plugins' Library mixins.
5. What breaks when the include is missing: nothing at runtime, because JavaScript reads `nfsBreakpointsToken`; development builds log the one warning that names the include, and the drift check cannot compare the token with the Sass.

### Platform features to adopt when the browser target moves

- Cross-browser viewport client hints (`Sec-CH-Viewport-Width` is Chromium-only and experimental on MDN today): the per-request recipe would then cover every visitor instead of Chromium's.
- `@property` registration of the Breakpoint properties with `syntax: '<length>'` (not Baseline widely available by 2026-05-07): computed style would return absolute lengths, so the drift check could accept any unit; this needs a change to the Sass packaging decision's output.
- CSS `@custom-media`, if it ever reaches the target: Foundation's breakpoints could be named once in CSS for consumers' own media queries. It would not replace the token, because the server still has no CSS.

### Foundation behaviour changed or dropped

- The `meta.foundation-mq` handshake, `_init`/`_reInit`, `next()`, `queries`, and the `matchMedia` polyfill are dropped.
- `changed.zf.mediaquery` becomes the `current` signal.
- Rule resolution by map order, bare modes from the Zero breakpoint, last-hyphen splitting, non-throwing invalid input, and the print hold are the deltas listed under Foundation contract.
- Foundation re-evaluated on every `resize` event; the service reacts only to `MediaQueryList` `change` events, which fire once per threshold crossing.
