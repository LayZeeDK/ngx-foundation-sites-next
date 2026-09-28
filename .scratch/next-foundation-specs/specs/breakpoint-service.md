# Spec: Breakpoint service (shared utility)

Ticket: [Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Decided upstream in ADR 0005 (Breakpoint source of truth), ADR 0008 (Rendering-modes contract), ADR 0012 (Sass packaging), ADR 0014 (first-render handoff), ADR 0039 (the class rule), and ADR 0040 (Variant input types, which puts the Runtime checks in this entry point); the decision log with sources is in the ticket answer, and the class-rule revision's is in the [Re-run: Breakpoint service (shared utility) spec under the class rule](../issues/129-rerun-breakpoint-service-class-rule.md). The Class breakpoint types and the Variant property format come from the [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md).

## Problem Statement

Eight of Foundation's 21 Plugins change behaviour with the viewport: ResponsiveMenu and ResponsiveAccordionTabs switch mode per breakpoint, ResponsiveToggle and OffCanvas change at a named breakpoint, Tooltip, Sticky and Equalizer switch themselves off below one, and Interchange swaps sources by breakpoint or by orientation and pixel density; and three more, Orbit, SmoothScroll, and Magellan, should stop moving things when the user asks for reduced motion. In Foundation the eight all ask one utility, `Foundation.MediaQuery`, which learns the breakpoints by reading a serialised Sass map out of the computed `font-family` of a `<meta class="foundation-mq">` element and re-checks them on every window `resize`.

That design cannot carry over to an Angular library that must render on the server:

- The `font-family` handshake needs a rendered stylesheet and computed style. The server has neither, and prerendering has no browser at all, so the library cannot learn the breakpoints the way Foundation does.
- The server does not know the viewport. CDK's `MediaMatcher` answers `false` to every query on the server, including the always-true `small`, so a directive that asks it naively renders a state no viewport has.
- If each directive reads `matchMedia` on its own, each picks its own moment and its own answer; a directive that reads the real viewport while hydrating renders something the server never sent, and one Plugin may disagree with another about the current breakpoint.
- A developer who customises Foundation's `$breakpoints` in Sass has to repeat the values for JavaScript, and nothing tells them when the two drift apart.
- Foundation's rule strings (`drilldown medium-dropdown`, `accordion medium-tabs`) are parsed separately in each Plugin, with their quirks: rule order decides which rule wins, a breakpoint name with a hyphen breaks the parser, and an unknown mode throws later.
- Under the class rule (ADR 0039) the consumer writes no Foundation class, so the looks that change per breakpoint (`.show-for-medium`, `.medium-horizontal`, `.reveal-for-large`, `.medium-only-expanded`) are set by directives from typed inputs. Foundation generates those classes only for the breakpoints in `$breakpoint-classes` (`small medium large` by default), not for every breakpoint of the map, so a type that accepts every breakpoint name would let `expanded="xlarge only"` compile against a class that does not exist, and Foundation's JavaScript never needed to know that list at all.
- Once Variant inputs are typed from the consumer's Sass (ADR 0040), the compiler rejects typos, but it cannot see a Variant declaration file that has drifted from the compiled CSS, a forgotten Library mixin include, a class a Sass flag leaves out, or a value cast past its type. Only a check in the browser that reads the compiled CSS sees those. The breakpoint drift check is already such a check; without one home for all of them, every directive would read the CSS, word its warnings, and decide when to run in its own way, and each would ship its checking code in production bundles.

Developers need one source of truth for breakpoints that works in the browser, on the server, while prerendering, and during hydration, and library authors need one API that every breakpoint-gated Plugin spec can build on and one place every directive with a Variant input reports to.

## Solution

A root service, `NfsMediaQuery`, that answers Foundation's MediaQuery questions from a TypeScript Breakpoint map instead of from CSS:

- The Breakpoint map comes from `nfsBreakpointsToken`, whose root factory holds Foundation's default map (`small` 0, `medium` 640, `large` 1024, `xlarge` 1200, `xxlarge` 1440, in px). A developer who changed `$breakpoints` in Sass provides the same values once, at application level.
- `current` is a signal holding the name of the current breakpoint; `atLeast()`, `upTo()`, `only()`, and `is('medium down')` answer Foundation's questions as reactive reads of that signal; `resolve()` picks the mode a Breakpoint rule assigns to the current breakpoint; `matches()` tracks any other media query (Interchange's `landscape`, `portrait`, `retina`); `reducedMotion` is a signal for `prefers-reduced-motion: reduce`.
- The media queries are exactly Foundation's (`only screen and (min-width: 40em)`), built from the map in em as Foundation's Sass does, and read through CDK `MediaMatcher` in the browser.
- On the server and while prerendering the service answers with the Server breakpoint, `small` by default. On the client it keeps answering with the same Server breakpoint until its first render callback, then switches to the live viewport inside the same change-detection pass, so hydration always starts from exactly what the server sent. A server that picks its breakpoint per request (for example from client hints) hands the choice to the client through Angular's `TransferState`.
- One pure parser reads Foundation's Breakpoint rule strings for ResponsiveMenu and ResponsiveAccordionTabs, typed by the modes each Plugin allows; rules resolve by the order of the Breakpoint map, not by the order they are written.
- The Class breakpoints, Foundation's `$breakpoint-classes`, are typed apart from the map's names. Variant inputs, and the Options that set a class only for Class breakpoints (Off-canvas `revealOn`, `inCanvasOn`), take `NfsClassBreakpoint` from the primary entry point, closed over Foundation's `small`, `medium`, and `large` and extended by the consumer's Variant declaration file; behaviour Options and this service's own API keep the open `NfsBreakpointName`. The developer's `@include nfs-breakpoint-properties;` also lists the Class breakpoints as `--nfs-breakpoint-classes`.
- The library's Runtime checks live here, with one configuration. `strictBreakpointSync` compares the Breakpoint map with the Breakpoint properties that `nfs-breakpoint-properties` emits from the developer's Sass `$breakpoints`, and reports a Class breakpoint the map lacks. `strictVariantNames` and `strictVariantProperties` read the Variant properties for every library directive that reports its Variant inputs through `nfsVariantCheck()`. All three run in development builds unless `provideNfsRuntimeChecks` opts one out; none runs in production unless `provideNfsProductionRuntimeChecks` lists it, and a production bundle without that call carries none of the checker's code (measured). Every report is made once, in the browser, after the first render.

Anything that only looks different per breakpoint stays in Foundation's CSS: the Visibility classes and the breakpoint classes (`.show-for-*`, `.hide-for-*`, `.<bp>-horizontal`, `.reveal-for-<bp>`, `.in-canvas-for-<bp>`), which the directive that owns each family sets from its Variant input or Option (a Visibility Classes directive's `showFor`, a Menu's `[orientation]` rules, Off-canvas `revealOn`), so the consumer writes none of them and the server HTML carries them. The service is for behaviour; it reads no class and writes none.

## User Stories

1. As an application developer, I want the library to know Foundation's default breakpoints without any setup, so that breakpoint-gated Plugins work out of the box with Foundation's default Sass settings.
2. As an application developer who customised `$breakpoints` in Sass, I want to provide the same values once in TypeScript, so that every Plugin switches at the widths my CSS uses.
3. As an application developer who customised `$breakpoints` or `$breakpoint-classes`, I want a development-mode report naming each breakpoint whose TypeScript and Sass values differ, and each Class breakpoint my token lacks, so that I notice drift before users do.
4. As an application developer who forgot the `nfs-breakpoint-properties` include, I want one report that names the include, so that I know exactly which line to add.
5. As an application developer, I want each report to appear once, not on every render or for every Plugin, so that my console stays readable.
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
22. As an application developer using `@defer (hydrate never)`, I want to know that widgets there keep the Server breakpoint's state, so that I rely on the Visibility classes a directive sets from its input, which are in the server HTML, for anything that must look right at every width.
23. As an application developer, I want a widget created later inside a plain `@defer` block to render the live breakpoint straight away, so that content in a plain `@defer` block has no swap at all.
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
36. As an OffCanvas or ResponsiveToggle author, I want `atLeast(revealOn)` and `atLeast(hideFor)` to agree with Foundation's `.reveal-for-<bp>` and `.hide-for-<bp>` classes, which my directive binds from the same Option, so that behaviour and CSS switch at the same width.
37. As a printing user, I want printing a page not to switch menus and tabs to their small-screen modes, so that the printout shows the layout I was looking at.
38. As a library directive author, I want the service's live values available in every render callback phase after its own first one, so that measurements and timers in `afterNextRender` see the real viewport.
39. As a library directive author, I want replayed events to see the live breakpoint, so that a hover or click made before hydration is judged against the real viewport.
40. As a test author, I want to replace `MediaMatcher` with a fake, so that browser-level tests can drive breakpoint changes without resizing a window.
41. As a test author, I want pure functions for rule parsing, width-to-breakpoint mapping, and query building, so that I can test them in Node without a browser.
42. As an accessibility reviewer, I want every breakpoint swap in a consuming Plugin to keep focus on the equivalent control, so that keyboard and screen reader users do not lose their place when the viewport changes.
43. As a library maintainer, I want one service to be the only place the library calls `matchMedia`, so that the rendering-modes rules are enforced in one spot.
44. As an application developer, I want a development-mode report when a Variant value my template renders has no class in my compiled CSS (a name my Sass removed that my Variant declaration file still lists, a responsive form a Sass flag leaves out, or a value cast past its type), so that I notice before a user sees an unstyled element.
45. As an application developer who forgot a Library mixin include, I want one report naming the include, even where no Variant input is bound, so that I know which line to add.
46. As an application developer, I want the Runtime checks on in development with no setup, and each one switched off by one provider (for example in unit tests that do not compile my Sass), so that the default catches drift and the exception costs one line.
47. As an application developer whose Variant values come from runtime data such as a CMS, I want to opt single checks into production with my own report callback, so that I learn about values my CSS has no class for without shipping every check.
48. As an application developer, I want a production bundle that does not opt in to contain none of the checker's code, so that the checks cost nothing where they do not run.
49. As an application developer, I want every report to name its check (`strictVariantNames`, `strictVariantProperties`, `strictBreakpointSync`), so that I know which flag controls it.
50. As an application developer whose `$breakpoint-classes` includes `xlarge`, I want a report when `nfsBreakpointsToken` lacks `xlarge`, so that an Off-canvas `revealOn="xlarge"` does not stay closed in JavaScript while Foundation's CSS reveals the panel.
51. As an application developer, I want responsive Variant inputs to accept only Class breakpoints and behaviour Options to accept every breakpoint of my map, so that `expanded="xlarge only"` fails to compile unless my Sass generates `xlarge` classes while `stickyOn="xlarge"` works from the map alone.
52. As a library directive author, I want one call that reports my directive's Variant values and Library mixin to the Runtime checks, so that every directive reads the Variant properties, words its reports, and runs its checks the same way.
53. As a library directive author, I want the Zero breakpoint's name without constructing the Breakpoint service, so that a directive with a responsive Variant input fills Foundation's Zero-breakpoint gaps identically on the server and the client and adds no `TransferState` entry to the page.
54. As a library maintainer, I want the Runtime checks never to run on the server and never to write the DOM, so that server HTML, hydration, and event replay are the same with and without them.

## Implementation Decisions

### Foundation contract

What Foundation 6.9's MediaQuery utility does (its source, the "JavaScript" part of Foundation's Media Queries docs, and the utilities research, section 3):

| Foundation | Behaviour | Library counterpart |
| --- | --- | --- |
| `$breakpoints` Sass map (`small: 0, medium: 640px, large: 1024px, xlarge: 1200px, xxlarge: 1440px`; the first value must be `0`) | Source of truth for Sass and, through the handshake, for JavaScript | Sass stays the consumer's; JavaScript reads `nfsBreakpointsToken` (ADR 0005) |
| `.foundation-mq { font-family: 'small=0em&medium=40em&...' }` plus the `<meta class="foundation-mq">` the plugin appends to `<head>` | Serialised map read back from computed style | Dropped: needs computed style, which the server lacks, and a class the library would have to add to the page. The Breakpoint properties are the `strictBreakpointSync` Runtime check's channel instead |
| `$breakpoint-classes` (`small medium large`; "each value in this list must also be in the `$breakpoints` map", and Foundation's `breakpoint()` warns at compile time when one is not) | Sass only: the breakpoints Foundation generates responsive classes for (Visibility classes, grid sizes, `-expanded`, `.<bp>-horizontal`, `.reveal-for-<bp>`); Foundation's JavaScript never reads it | `--nfs-breakpoint-classes`, written by `nfs-breakpoint-properties`; the Class breakpoint types of the primary entry point (ADR 0040) |
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

### CSS class mapping

The utility is a service and pure functions, so it has no element and no Structural, Variant, or State class of its own, and the class rule (ADR 0039) adds no host binding here. What the rule changes is where the breakpoint-dependent classes come from, and it confirms what the service reads (building-blocks 1.14 item 2):

| Kind | Class or property | Owner | Notes |
| --- | --- | --- | --- |
| Structural | none | | The utility renders nothing |
| Variant | none of its own | the directives that set them | The responsive Variant classes (`.medium-only-expanded`, `.medium-horizontal`, `.medium-6`), the Visibility classes, and `.reveal-for-<bp>` and `.in-canvas-for-<bp>` are set by their directives from Variant inputs or Options typed `NfsClassBreakpoint`; this entry point supplies only the Zero breakpoint's name through `nfsBreakpointsToken` and `nfsBreakpointForWidth` (API) |
| State | none | | |
| Foundation classes read | none | | The `.foundation-mq` handshake is dropped. No part of this entry point reads a class to learn a breakpoint, seed a state, or pick a Variant (building-blocks 1.4, "Initial state is bound, never read from a class") |
| Custom properties read (not classes) | `--nfs-breakpoint-<name>`, `--nfs-breakpoint-classes`, and each `--nfs-<setting>` a directive reports | the Runtime checks | In the browser only, after the first render, once per property per realm |
| Variant property written | `--nfs-breakpoint-classes` | the `nfs-breakpoint-properties` Library mixin | From `$breakpoint-classes`; Variant registry `NfsBreakpointClassesOverrides`; read by `strictVariantNames` for every responsive Variant input, by `strictBreakpointSync`, and by the Variant declaration tooling |

The spec's own examples, stories, and fixtures write no Foundation or NFS class: its demo components print into a plain `<table>`, which Foundation styles by tag and which carries no Variant class, so it needs no directive (ADR 0039, dated note), and into `<output>` elements.

### Hierarchy and DI shape

There is no directive family; the utility is one service, one configuration token, pure functions, and the Runtime checks.

```
nfsBreakpointsToken (InjectionToken, root factory: Foundation's default map)
      |                                   \
      v                                    \ inject(nfsBreakpointsToken): the Zero breakpoint
NfsMediaQuery (@Service(), root singleton)  \  (directives with a responsive Variant input)
  uses: MediaMatcher (@angular/cdk/layout), TransferState, DOCUMENT, Injector (afterNextRender), DestroyRef,
        the Runtime checker (strictBreakpointSync)
      ^
      | inject(NfsMediaQuery)
ResponsiveMenu, ResponsiveAccordionTabs, ResponsiveToggle, OffCanvas, Sticky, Equalizer,
Tooltip, Interchange, Orbit, SmoothScroll, Magellan, and application code

Runtime checks:
nfsRuntimeCheckerToken (internal; root factory: the development checker behind ngDevMode, else null)
  <- provideNfsRuntimeChecks(checks)                       development overrides (an internal value token), nothing in production
  <- provideNfsProductionRuntimeChecks(checks, {report})   replaces the factory: the production opt-in
nfsVariantCheck(directive) -> NfsVariantCheck | null        every library directive whose Variant inputs read a Variant property

Pure functions (no DI): parseNfsBreakpointRules, nfsBreakpointForWidth
Constants: nfsDefaultBreakpointMap, nfsDefaultNamedQueries
```

- `nfsBreakpointsToken`: `InjectionToken<NfsBreakpoints>` with `providedIn: 'root'` and a factory returning `{map: nfsDefaultBreakpointMap}`. This is Material's Shape A (required configuration with a root factory, from the DI patterns research), not a per-Plugin Defaults token: the service always needs a map. Named `nfsBreakpointsToken` per ADR 0009.
- Provided at application level only: in the application configuration for every platform, and in the server configuration for a server-only Server breakpoint. The service is a root singleton, so a provider at route or element level is never read; no check looks for one.
- `NfsMediaQuery`: `@Service()` (root singleton, tree-shaken when unused, per Angular's services guide). One instance per application, which on the server means one per request, because each request bootstraps its own application.
- No provider function for the Breakpoint map: one token needs none (building-blocks 1.9; the components repo ships `provide*` only to swap a class). Consumers write `{provide: nfsBreakpointsToken, useValue: ...}` or `useFactory` for the per-request recipe. The entry point's two provider functions, `provideNfsRuntimeChecks` and `provideNfsProductionRuntimeChecks`, configure the Runtime checks, not the map, and are two rather than one umbrella `provideNfs()` (ADR 0040; building-blocks 1.9).
- No Defaults token of its own: Breakpoint queries and rules are Options of the consuming Plugins, whose Defaults tokens hold their defaults. Named queries belong to Interchange, the only Plugin that uses them, so they are the `namedQueries` field of Interchange's Defaults token (building-blocks Table B, Interchange), defaulting to `nfsDefaultNamedQueries`.
- Entry point: its own secondary entry point, `ngx-foundation-sites/media-query` (Foundation's utility name, building-blocks 1.3), imported by the consuming Plugins' entry points so a consumer's `@defer` block pulls it in with the first gated Plugin. It also exports the Runtime-check API (`NfsRuntimeChecks`, `NfsRuntimeCheckReport`, `provideNfsRuntimeChecks`, `provideNfsProductionRuntimeChecks`, `nfsVariantCheck`, `NfsVariantCheck`, `NfsVariantNeed`), so every entry point with a Variant input imports it too. What such an entry point keeps of it in a production build without the opt-in is the `nfsVariantCheck` call and one injection of a token whose factory returns `null` (Runtime checks, measured); `NfsMediaQuery` itself is tree-shaken from an application that never injects it.
- The Class breakpoint types (`NfsClassBreakpoint`, `NfsClassBreakpointQuery<M>`, `NfsClassBreakpointRules<V>`) and their Variant registry `NfsBreakpointClassesOverrides` are not exported here: they live in the primary entry point `ngx-foundation-sites` with every other Variant registry (ADR 0040; the [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md) declares them). This entry point needs none of them: its own API takes `NfsBreakpointName`, to which every Class breakpoint is assignable (API).

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

Breakpoint names and Class breakpoints. Two sets of names, typed apart because they differ by default (`xlarge` and `xxlarge` are in the Breakpoint map and in no Foundation class) and are configured in different places:

| Type | Declared in | Names | Open or closed | Types | Checked by |
| --- | --- | --- | --- | --- | --- |
| `NfsBreakpointName` | this entry point | the Breakpoint map's keys, from `nfsBreakpointsToken` | open: Foundation's five names plus `(string & {})` | behaviour Options (Tooltip `showOn`, Sticky `stickyOn`, Equalizer `equalizeOn`, ResponsiveMenu and ResponsiveAccordionTabs rules keys, Responsive Toggle `hideFor` while its spec emits the classes for every breakpoint) and this service's API | the service's development warning for an unknown name (at run time) |
| `NfsClassBreakpoint`, with `NfsClassBreakpointQuery<M>` and `NfsClassBreakpointRules<V>` | the primary entry point, over the Variant registry `NfsBreakpointClassesOverrides` | `$breakpoint-classes` | closed: `small`, `medium`, `large`, extended or shrunk by the consumer's Variant declaration file | every responsive Variant input, and the Options that set a class only for Class breakpoints (Off-canvas `revealOn` and `inCanvasOn`) | the compiler; `strictVariantNames` against `--nfs-breakpoint-classes`; `strictBreakpointSync` for a Class breakpoint the map lacks |

- Every Class breakpoint must be a breakpoint of the map: Foundation's settings say so, its `breakpoint()` warns at compile time otherwise, and `strictBreakpointSync` reports a Class breakpoint `nfsBreakpointsToken` lacks. So an `NfsClassBreakpoint` is always assignable to `NfsBreakpointName` (the open member accepts it), and a directive passes its Class-breakpoint Option straight to the service (`mq.atLeast(this.revealOn())`).
- `NfsBreakpointName` stays open, as ADR 0040 decides. The map reaches JavaScript through the token, a runtime value, not through a Variant registry, so a typo in a behaviour Option compiles and is caught at run time by the service's development warning for an unknown name.
- `NfsBreakpointModifier` (`'up' | 'only' | 'down'`) stays here; the primary entry point's `NfsClassBreakpointQuery<M>` constrains `M` by the same three words. If the Variant declaration tooling ever declares the union there, this entry point re-exports it instead of declaring a second one.
- The Zero breakpoint for Variant inputs: a directive that fills one of Foundation's Zero-breakpoint gaps (Button `expanded="small down"` sets `.small-only-expanded`; a Menu rule for the Zero breakpoint sets `.vertical`; building-blocks 1.4) reads the Zero breakpoint's name as `nfsBreakpointForWidth(inject(nfsBreakpointsToken).map, 0)`, once, at construction. That is the token's key whose value is 0, the same on the server and the client, so the class is in the server HTML. The directive does not inject `NfsMediaQuery` for it: the service registers a render callback and writes a `TransferState` entry into every server-rendered page, which a CSS-only directive has no use for.

`NfsMediaQuery` public surface:

| Member | Type | Meaning |
| --- | --- | --- |
| `current` | `Signal<NfsBreakpointName>` | The current breakpoint: the largest breakpoint whose query matches, or the Server breakpoint before the service goes live (see Rendering modes) |
| `serverBreakpoint` | `NfsBreakpointName` | Read-only; the breakpoint the service started from: the transferred value, else the token's, else the Zero breakpoint. Stays the same after the service goes live, so a directive or component can start every instance from it (ResponsiveAccordionTabs, ResponsiveMenu) |
| `reducedMotion` | `Signal<boolean>` | `(prefers-reduced-motion: reduce)` matches; `false` on the server and before the service goes live |
| `breakpoints` | `readonly NfsBreakpointName[]` | The map's names from smallest to largest |
| `atLeast(name)` | `boolean` | `current` is `name` or larger |
| `upTo(name)` | `boolean` | `current` is `name` or smaller; `true` for the largest breakpoint |
| `only(name)` | `boolean` | `current` is `name` |
| `is(query)` | `boolean` | A Breakpoint query: `'<name>'` or `'<name> up'` as `atLeast`, `'<name> only'` as `only`, `'<name> down'` as `upTo`; `'all'` and `''` are `true` |
| `resolve(rules, breakpoint?)` | `M \| undefined` | The mode of the largest rule breakpoint at or below `breakpoint`, default `current`; `undefined` when no rule applies yet (Foundation's "no match" case, left to the consuming spec). The optional second argument lets a consumer resolve against `serverBreakpoint` instead of `current` (ResponsiveAccordionTabs' `instance` strategy, and ResponsiveMenu until its first render callback) |
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

Named query tokens (Interchange): a token is a breakpoint name, answered by `atLeast(name)`, or a key of the named-query map from Interchange's Defaults token, answered by `matches(namedQueries[key])`; a token containing whitespace or `(` is a media query answered by `matches(token)`; any other unknown token warns and answers `false`. Interchange's own rule order (the last matching rule wins) stays Interchange's, because its rules mix breakpoints with orientation and density queries that have no single order.

Consumers and what each reads (building-blocks Part 2 and Part 3):

| Consumer | Reads | Option |
| --- | --- | --- |
| ResponsiveMenu | `parseNfsBreakpointRules(rules, ['dropdown', 'drilldown', 'accordion'], mq.breakpoints)`, then `resolve(parsed, serverBreakpoint)` until the first render callback and `resolve(parsed)` after | `rules` |
| ResponsiveAccordionTabs | `parseNfsBreakpointRules(rules, ['accordion', 'tabs'], mq.breakpoints)`, then `resolve(parsed, serverBreakpoint)` for the mode each instance starts from and `resolve(parsed)` for the live mode it swaps to in its first render callback | `rules` |
| ResponsiveToggle | `atLeast(hideFor)` for the open logic; first paint from Foundation's `.hide-for-<bp>`/`.show-for-<bp>` classes, which its directives bind from `hideFor`; `reducedMotion` (binds no consumer Motion class, consumer rule 3) | `hideFor` (`NfsBreakpointName` while its spec emits the classes for every breakpoint, building-blocks 1.7), `animate` |
| OffCanvas | `atLeast(revealOn)`, `atLeast(inCanvasOn)`; first paint from `.reveal-for-<bp>`/`.in-canvas-for-<bp>`, which its directive binds from the same Options | `revealOn`, `inCanvasOn` (`NfsClassBreakpoint`); both reported through `nfsVariantCheck` while bound, the Zero breakpoint setting no class |
| Sticky | `is(stickyOn)` | `stickyOn` |
| Equalizer | `is(equalizeOn)` | `equalizeOn` |
| Tooltip | `is(showOn)` at show time | `showOn` |
| Interchange | named query tokens through `atLeast` and `matches`, `nfsDefaultNamedQueries` | `rules` (breakpoint tokens are Breakpoint map names, `NfsBreakpointName`, not Class breakpoints), Defaults token `namedQueries` |
| Orbit | `reducedMotion` (autoplay off) | `autoPlay` |
| SmoothScroll; Magellan through the composed `NfsSmoothScroll` | `reducedMotion` (`behavior: 'instant'` instead of `'smooth'`) | none |
| Accordion, Tabs, ResponsiveAccordionTabs | `reducedMotion` (`behavior: 'instant'` for the deep-link smudge scroll, and for Tabs' `autoFocus` scroll) | `deepLinkSmudge`, `autoFocus` (Tabs) |
| Drilldown | `reducedMotion` (`behavior: 'instant'` for the `scrollTop` scroll) | `scrollTop` |
| Dropdown pane | `reducedMotion` (binds no Motion class, consumer rule 3) | `animate` |
| Directives with a responsive Variant input (Button `expanded`, Menu `orientation` and `expanded`, the Visibility Classes directives, the grid cells, Button Group and Top Bar `stackedFor`) | the Zero breakpoint as `nfsBreakpointForWidth(inject(nfsBreakpointsToken).map, 0)`, never `current`: their classes are Foundation's media-query CSS, not JavaScript | their Variant inputs, typed over `NfsClassBreakpoint` |
| Every directive whose Variant inputs read a Variant property (an Open Variant family, a responsive Variant input, a flag-gated family) | `nfsVariantCheck(directive)`: `include()` at its first render, whether or not a value is bound, and `value()` for each rendered Variant value (Runtime checks). A directive whose Variant families are all closed reads no Variant property and needs no call (Tabs); it may still call `value()` to report a value that maps to no class | none |

### Implementation level and primitives

Level: custom Angular service over CDK `MediaMatcher`, per ADR 0005. The platform supplies the queries (`matchMedia`, `MediaQueryList` `change` events, `prefers-reduced-motion`, all Baseline widely available and in the Browser target per the web platform research); `@angular/aria` has nothing for viewport state; CDK has `MediaMatcher` and `BreakpointObserver`, and the service uses only the first.

- `MediaMatcher.matchMedia(query)` for every query, because it adds the empty `@media` style rule that makes WebKit and Blink fire `change` reliably, honours `CSP_NONCE`, and is the documented seam to fake in tests. On the server `MediaMatcher` returns a stub whose `matches` is `false` (except for `''` and `'all'`, which it reports `true`) and which has `addListener` but no `addEventListener`; the service never reaches that stub, because it calls `MediaMatcher` only inside a render callback, and render callbacks do not run on the server (`afterNextRender` returns a no-op when `ngServerMode` is set).
- One `MediaQueryList` per breakpoint query and one for `(prefers-reduced-motion: reduce)`, each with `addEventListener('change', ...)` (not the deprecated `addListener` CDK's observer still uses). A `change` on any breakpoint query recomputes `current` as the largest matching breakpoint; queries are nested min-width ranges, so this equals Foundation's `atLeast` on each query.
- Going live: the constructor registers `afterNextRender({earlyRead})` without a view (so it runs after the next application render). The `earlyRead` callback creates the lists, sets `current`, `reducedMotion`, and every `matches()` signal requested so far, attaches the listeners, and, when a Runtime checker exists, runs `strictBreakpointSync`. Signals set there mark the views that read them, and `ApplicationRef` re-runs change detection before it returns (its synchronisation loop runs after-render hooks at the end of each pass and loops while views are dirty), so the live values reach the DOM in the same tick, before the browser paints.
- No lazy loading: `injectAsync` is not used, because the service is needed at the first render callback of every breakpoint-gated directive and by the handoff itself, so it loads eagerly with the first directive that injects it; `afterEveryRender` is not used either, because the service reacts to `MediaQueryList` `change` events, not to renders (audit 0004, M6).
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

1. Focus continuity on swaps: when a breakpoint change swaps a widget's mode (ResponsiveMenu, ResponsiveAccordionTabs) or hides the element holding focus, the consuming directive moves focus to the equivalent control in the new mode, in a render callback, only when focus was inside the widget. This includes the swap at the first render (Server breakpoint to live): it moves focus like any other swap, because server-rendered controls can hold focus before hydration, so a consumer records whether focus is inside the widget, and on which item, while the old nodes still exist, and focuses the equivalent control in a render callback keyed on rendered state (building-blocks 1.5). Where it records depends on where the swap happens: in the render callback that itself commits the swap, when the displayed mode changes only there (an `earlyRead` callback, as the [Prototype: ResponsiveAccordionTabs as one component](../issues/51-prototype-responsive-accordion-tabs.md) does in case 15, and the Nested menu root's swap callback for ResponsiveMenu); in the change-detection code that removes the old nodes or re-classes them, when the swap is driven straight from this service's reads (a template `@if` on `atLeast()`, or the Interchange outlet's effect), because for a runtime change change detection swaps before any render callback runs; or continuously from `focusin`/`focusout` on a host that survives the swap. The [Re-run: Interchange spec, the `replaced` timing and the outlet's focus rule](../issues/67-rerun-interchange-replaced-timing.md) measured this in three engines. In a client-rendered app nothing can hold focus inside the widget before its first render, so the same code path finds nothing and moves nothing.
2. No server-bound hiding of content Foundation's CSS shows at a larger breakpoint: a breakpoint-gated hidden or inert state that Foundation shows at a larger breakpoint is expressed with Foundation's Visibility and breakpoint classes, never as a `hidden` or `inert` binding computed from `current` (audit 0002 H4; ADR 0008 Consequences). Those classes are host bindings of the directive that owns them, computed from its Option or Variant input, so they are in the server HTML; the consumer never writes them, and no directive learns its breakpoint from a static Visibility or breakpoint class on its host (building-blocks 1.4: a copied class is stripped where the directive binds it and reported by that directive's development check).
3. Reduced motion: JavaScript-driven motion (Orbit autoplay, smooth scrolling) reads `reducedMotion` and stops; auto-rotating content keeps its visible stop control regardless (WCAG 2.2.2). CSS motion is handled by the Library mixins' reduced-motion rules, not by this signal, with one permitted exception: a directive may bind no consumer Motion class while `reducedMotion` is true and complete the change in the same tick, which also covers a consumer keyframe class that carries no reduced-motion rule of its own (Responsive Toggle, Dropdown); Reveal and Toggler rely on the `nfs-motion` override and the consumer's own rule instead.
4. No announcements: breakpoint changes are not announced through live regions; they change layout, not content.

### WCAG 2.2 AA

The target is WCAG 2.2 level AA (user rule; ADR 0022). The service renders nothing, so it meets no criterion on its own; it imposes the criteria below on every consuming Plugin, and each consuming spec inherits the named test and runs it on its own stories and fixture route. Each is a requirement, not advice.

| Criterion | Requirement imposed on consumers, and what the service provides | Foundation default | Test each consumer spec inherits |
| --- | --- | --- | --- |
| 1.4.10 Reflow | At 320 CSS px wide (a 1280 px window at 400 percent zoom) no consumer makes the page scroll horizontally. Zoom shrinks the CSS viewport, so the em queries report the Zero breakpoint there and `current` follows through `MediaQueryList` `change` events with no reload; the service therefore guarantees that 320 px is always answered by the Zero breakpoint's mode (640 px is Foundation's first threshold). The requirement on consumers: the mode a Breakpoint rule assigns to the Zero breakpoint (a bare mode) and the state a Breakpoint query gives it must fit 320 px, so ResponsiveMenu's Zero-breakpoint mode is `drilldown` or `accordion`, never a horizontal `dropdown` bar that overflows, and ResponsiveAccordionTabs and a consumer's own `@if` branches stack there | Passes for Foundation's documented rule examples (`drilldown medium-dropdown`, `accordion medium-tabs`); a bare `dropdown` rule on a wide menu overflows | e2e at a 320 by 640 px viewport on the consumer's stories in three engines: `document.documentElement.scrollWidth <= 320`, with every menu or panel open that the story can open |
| 1.4.4 Resize Text | Breakpoint behaviour follows the user's text size: queries are Foundation's em strings (`only screen and (min-width: 40em)`), which media queries resolve against the browser's default font size, so a 20 px default moves `medium` to 800 CSS px and a text-heavy layout keeps its small-screen mode instead of squeezing enlarged text. The requirement on consumers: never build breakpoint queries in px, never compare `window.innerWidth` with the Breakpoint map, and always ask the service (`atLeast`, `is`, `resolve`, `get`) so JavaScript and Foundation's CSS switch at the same point | Passes: Foundation's Sass builds its media queries in em with `-zf-bp-to-em`, the same px / 16 conversion the service uses | Node-level query builder cases (`640` to `40em`, `1100` to `68.75em`); e2e in Firefox with the `font.size.variable.x-western` user preference at 20: at 640 px `current` is `small`, at 800 px `medium`, and the consumer's mode and Foundation's `.show-for-medium` (set by a Visibility Classes directive from `showFor="medium"`) switch at the same width |
| 2.4.3 Focus Order | Focus continuity on a breakpoint swap, at runtime and at the first-render handoff: consumer rule 1 above. A swap never drops focus to `body`: when focus was inside the widget, it lands on the equivalent control; when it was outside, it does not move. The service provides the live values in the `earlyRead` phase of the handoff pass, before any consumer's swap callback runs | Fails: Foundation's ResponsiveMenu and ResponsiveAccordionTabs destroy and rebuild plugins on a breakpoint change with no focus handling | Browser-level test with the fake `MediaMatcher`: focus inside the widget, dispatch `change` across the threshold, focus is on the equivalent control; focus outside, it stays. e2e on a real resize in three engines. Fixture e2e: focus a server-rendered control before hydration (main bundle held) at a viewport whose live mode differs from the Server breakpoint's; after hydration focus is on the equivalent control (the ResponsiveAccordionTabs prototype's case 15) |
| 2.2.2 Pause, Stop, Hide | Anything a breakpoint or `reducedMotion` change starts (Orbit autoplay enabled only from a breakpoint up, a consumer's own animation) that moves for more than 5 s has a visible pause or stop control in every mode where it can run; a breakpoint change never restarts motion the user paused or stopped; while `reducedMotion` is `true` nothing starts automatically. The service provides `reducedMotion` live in both directions, so a consumer can stop at once and must not restart on its own when the setting clears after a user pause | Fails: Foundation's Orbit autoplays with no reduced-motion check | Browser-level test: with the fake `MediaMatcher`, pause, cross a threshold, still paused; `reducedMotion` `true` starts nothing. e2e with `page.emulateMedia({reducedMotion: 'reduce'})`: no motion starts |
| 1.3.4 Orientation | Named queries (`landscape`, `portrait`) may change layout but never restrict content or functionality to one orientation: every Interchange rule and consumer branch keyed on orientation shows equivalent content in both | Passes for Foundation's documented Interchange examples, which swap image sources only | e2e on the consumer's stories at 640 by 360 and 360 by 640 px: the same controls and text are present in both |

Breakpoint changes are not announced (consumer rule 4), so 4.1.3 Status Messages does not apply; the change is layout, not a status. The Runtime checks report to the console or to the consumer's callback, never to the page, so they add no criterion. The service needs no Sass setting for these criteria: the Sass inputs are the consumer's `$breakpoints` and `$breakpoint-classes`, emitted as the Breakpoint properties and `--nfs-breakpoint-classes` for the Runtime checks.

### Rendered output

The service renders no DOM and binds no class. What reaches the page:

- The Breakpoint properties and the Class breakpoints, emitted by the developer's `@include nfs-breakpoint-properties;` from their own `$breakpoints` and `$breakpoint-classes` (ADR 0012 and its dated note; ADR 0005, dated note; Sass packaging decisions 13 to 15):

  ```css
  :root {
    --nfs-breakpoint-small: 0px;
    --nfs-breakpoint-medium: 640px;
    --nfs-breakpoint-large: 1024px;
    --nfs-breakpoint-xlarge: 1200px;
    --nfs-breakpoint-xxlarge: 1440px;
    --nfs-breakpoint-classes: small medium large;
  }
  ```

- The `TransferState` entry `nfsServerBreakpoint` in a server-rendered page's `ng-state` script (Rendering modes).
- Nothing from the Runtime checks: they write no DOM, add no class, attribute, or listener, and report to the console or to the consumer's callback (below).

### Runtime checks

The library's Runtime checks (ADR 0040) live in this entry point beside the breakpoint drift check they grew from. There are three, configured in the direction of NgRx's `runtimeChecks` (per-check flags over defaults), with this library's own production opt-in, which NgRx lacks:

```ts
export interface NfsRuntimeChecks {
  /** A rendered Variant value the compiled CSS has no class for (not in its --nfs-<setting> list), a value that is not one class token, or a Breakpoint query or rules key that cannot be parsed. */
  strictVariantNames: boolean;
  /** Variant properties missing from :root: a Library mixin include was forgotten. */
  strictVariantProperties: boolean;
  /** nfsBreakpointsToken and the Breakpoint properties disagree, or a Class breakpoint is missing from the token (ADR 0005's drift check). */
  strictBreakpointSync: boolean;
}

export interface NfsRuntimeCheckReport {
  readonly check: keyof NfsRuntimeChecks;
  readonly message: string;
  readonly directive?: string;
  readonly input?: string;
  readonly value?: unknown;
  readonly setting?: string;
  readonly names?: readonly string[];
}

/** Development overrides: every check is on without this provider; returns no providers when ngDevMode is false. */
export function provideNfsRuntimeChecks(checks: Partial<NfsRuntimeChecks>): EnvironmentProviders;

/** Production opt-in, per check; all off unless listed; the only production code path that references the checker. */
export function provideNfsProductionRuntimeChecks(
  checks: Partial<NfsRuntimeChecks>,
  options?: {report?: (report: NfsRuntimeCheckReport) => void},
): EnvironmentProviders;
```

| Check | Reports | Reads | Runs in | Development build | Production build |
| --- | --- | --- | --- | --- | --- |
| `strictVariantNames` | A rendered Variant value whose name its property does not list, or a count above its property's count; a value that maps to no class | The `--nfs-<setting>` of each need a directive reports | Each directive's render callback, through `nfsVariantCheck` | On; `provideNfsRuntimeChecks({strictVariantNames: false})` opts out | Off; `provideNfsProductionRuntimeChecks({strictVariantNames: true})` opts in |
| `strictVariantProperties` | A Library mixin whose listed properties are all missing | The properties a directive names in `include()` | The same | Same form | Same form |
| `strictBreakpointSync` | Breakpoint map drift, a Class breakpoint the token lacks, a missing `nfs-breakpoint-properties` include | `--nfs-breakpoint-<name>`, `--nfs-breakpoint-classes` | The service's go-live callback | Same form | Same form |

Configuration:

- Defaults: with no provider, a development build runs all three and reports through `console.warn`, each message prefixed with its check's name ("ngx-foundation-sites [strictVariantNames]: ..."). A production build runs none.
- `provideNfsRuntimeChecks(checks)` switches single checks off, or back on, in development builds. In production builds it returns no providers (the shape of Angular's own `provideCheckNoChangesConfig`), so an application that calls it in its shared configuration ships nothing for it.
- `provideNfsProductionRuntimeChecks(checks, options)` runs only the listed checks in production builds and sends their reports to `options.report`, or to `console.warn` when there is none. Each function affects only its own kind of build: in a development build the production call changes nothing, so development reports always go to the console, and the `report` path is tested on a production build (Testing Decisions, e2e).
- Both are provided at application level only, like `nfsBreakpointsToken`: the checker is a root singleton, so a route or element provider is never read.
- Mechanism, the part that keeps production bundles clean: an internal root token holds the checker. Its factory returns the development checker behind `typeof ngDevMode === 'undefined' || ngDevMode`, and `null` otherwise; the development checker reads its overrides from an internal value token that only `provideNfsRuntimeChecks` provides. `provideNfsProductionRuntimeChecks` replaces the token's factory. Nothing else constructs the checker, so when the Angular CLI defines `ngDevMode` as `false` (script optimization on) and the production call is absent, the checker's code is removed. Measured under `@angular/build:application` 22.2.0 with an ng-packagr 22.2.0 library resolved through its package `exports` (the re-run's decision log): no checker code in the production bundle, and 62 bytes more for an application that only calls `provideNfsRuntimeChecks`; with the production call, 3,976 bytes more minified (about 1.2 kB transferred), which includes Angular's `afterRenderEffect` for an application that used none.

When and where:

- In the browser only, after the first render: every read is in a render callback (`afterRenderEffect` or `afterNextRender`), both of which Angular makes a no-op on the server. The server has no computed style, so the server HTML carries whatever class a value produced, unchecked (building-blocks 1.11 decision 3).
- They write no DOM and add no listener, so hydration, event replay, and `@defer` behave the same with and without them. A directive inside a `hydrate never` block is never checked, because it never runs on the client; one inside a `hydrate on ...` block is checked when the block hydrates.
- Once per realm: each property is read once per JavaScript realm (a module-level cache), and each report is made once per realm per check and distinct subject: the directive, input, and failing name or value for `strictVariantNames`; the Library mixin for `strictVariantProperties`; the whole comparison for `strictBreakpointSync`. Reason, as for the first drift check: consumer unit tests that do not compile the Sass would otherwise report in every test; per realm is one report per test file, and a consumer can also switch the checks off in its test setup (usage examples). Limit, stated in the docs: a stylesheet added or hot-replaced after a property's first read is seen after the next page load.
- A `report` callback that throws is handed to Angular's `ErrorHandler` like any render-callback error (the after-render manager catches it), and the other checks go on.

#### The Variant check: `nfsVariantCheck()`

How a library directive reports to `strictVariantNames` and `strictVariantProperties`:

```ts
/** For library directives, in an injection context: the Runtime checks' handle for one directive, or null when none runs (every production build that does not opt in). */
export function nfsVariantCheck(directive: string): NfsVariantCheck | null;

export interface NfsVariantCheck {
  /** Presence only, no bound value needed: reports the mixin as missing when every listed property reads empty. `settings` are properties the mixin never leaves empty on Foundation's defaults. */
  include(mixin: string, settings: readonly string[]): void;
  /** One rendered Variant value: the names its class needs, `[]` when its class always exists, `null` when it maps to no class. */
  value(input: string, value: unknown, needs: readonly NfsVariantNeed[] | null): void;
}

export interface NfsVariantNeed {
  /** A Sass setting without `$`, read as `--nfs-<setting>`: 'button-palette', 'breakpoint-classes'. */
  readonly setting: string;
  /** A name the property must list, or a number its count must reach. */
  readonly name: string | number;
}
```

- `directive` is the selector name a consumer writes (`nfsButton`); every report names it.
- A directive calls `nfsVariantCheck` once, at construction, and uses the handle only in a render callback of its own (an `afterRenderEffect` read phase that reads its Variant inputs), which it creates only when the handle is not `null`. A production build without the opt-in therefore keeps the call site and runs nothing.
- In that callback the directive calls `include()` first, on every run, whether or not a Variant input is bound (the [Spec: Close Button](../issues/83-spec-close-button.md)'s presence request for its 2.5.8 floor), then `value()` once per Variant input that has a value. Repeated calls cost a cache lookup, because reads and reports happen once per realm; a directive whose Variant property is read only for a value that may stay unbound, and whose own mixin holds nothing it needs, calls `include()` only while that value is bound (Off-canvas `revealOn` and `inCanvasOn`, Top Bar `stackedFor`), so an application that binds none is not asked for the include.
- `include(mixin, settings)`: when every listed property reads empty, `strictVariantProperties` reports once per mixin, for example "ngx-foundation-sites [strictVariantProperties]: nfsButton found none of --nfs-button-palette, --nfs-button-sizes on :root. Add `@include nfs-button;` after its Foundation export mixin in the stylesheet that compiles Foundation, or switch this check off with provideNfsRuntimeChecks({strictVariantProperties: false})." `setting` is the first listed setting and `names` lists them all. A directive lists only properties its mixin never leaves empty on Foundation's defaults, never a flag-gated one, because an empty property and a missing one both read as the empty string (ADR 0040, dated note; measured again in this re-run): the Button lists `button-palette` and `button-sizes` for `nfs-button`, the Close Button `closebutton-size` for `nfs-close-button`, the Menu `breakpoint-classes` for `nfs-breakpoint-properties`. A directive that reads the properties of two mixins calls `include()` for each (a grid cell: its grid's mixin and `nfs-breakpoint-properties`). A property that two mixins write (`--nfs-foundation-palette`, written by `nfs-callout` and `nfs-progress-bar`) reports only when both are missing.
- `value(input, value, needs)`: `needs` comes from the same mapping that sets the directive's classes, so the check and the class always agree. `null` (a cast or `$any()` value that is not one class token, a Breakpoint query that cannot be parsed, a rules object with a key that is not a name) reports once under `strictVariantNames` that the value binds no class. Each need is then compared with its property: a name the property does not list, or a number above its count, reports once under `strictVariantNames`, naming the directive, the input, the value, the setting, and the listed names, for example "ngx-foundation-sites [strictVariantNames]: nfsButton color "purple" has no class in the compiled CSS: $button-palette generates primary secondary success warning alert. Add it to $button-palette, or regenerate the Variant declaration file if it still lists purple."
- A need whose property an `include()` found missing is skipped, so a missing include makes one report, not one per value. Any other property that reads empty is an empty list: a flag-gated family while its flag is off, so the Button's `expanded="medium only"` against an empty `--nfs-button-responsive-expanded` reports, naming `$button-responsive-expanded`.
- `needs` returns `[]` for a value whose class always exists: no value, `false`, `'default'`, a boolean modifier, a closed name, or a Zero-breakpoint query that maps to an always-generated class (Button `expanded="small"` sets `.expanded`).
- The property format is the Variant property format of the [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md), which its generator reads from the compiled CSS text. The checker trims the computed value, splits names on whitespace and commas (Sass prints `map-keys()` as a comma list), reads a count as one whole number, and takes an empty value as an empty list, or, for a property an `include()` lists, as missing.

#### `strictBreakpointSync`, the drift check

It runs once per realm in the service's go-live `earlyRead` callback, so only in applications that construct the Breakpoint service. From `getComputedStyle(documentElement)` it reads:

1. `--nfs-breakpoint-<name>` for each name of the Breakpoint map, trimmed and parsed as `px` (unregistered custom properties compute to their specified text, for example `640px`);
2. `--nfs-breakpoint-classes`, the Class breakpoints;
3. `--nfs-breakpoint-<name>` for each Class breakpoint the map lacks.

Outcomes, in one report:

- Every map property is empty: "ngx-foundation-sites [strictBreakpointSync]: no --nfs-breakpoint-* custom properties were found on :root. Add `@include nfs-breakpoint-properties;` after `@import 'ngx-foundation-sites';` in the stylesheet that compiles Foundation, so this check can compare nfsBreakpointsToken with your Sass $breakpoints."
- Some differ, some are missing, or a Class breakpoint is missing from the token: one report listing each name with both values, for example "ngx-foundation-sites [strictBreakpointSync]: nfsBreakpointsToken and your Sass $breakpoints disagree: medium is 640px in the token and 768px in --nfs-breakpoint-medium; xxlarge is missing from the CSS; xlarge is a Class breakpoint in --nfs-breakpoint-classes (1200px) but missing from the token. Provide nfsBreakpointsToken with the values of your Sass $breakpoints (in px)." `setting` is `breakpoints` and `names` lists the names that disagree.
- All match within 0.01 px: nothing.
- A missing `--nfs-breakpoint-classes` beside present map properties (a hand-written block, or library Sass older than the list) adds nothing here; a directive that reads the list reports it through `include()`.
- Limit, stated in the docs and narrowed by the class list: a breakpoint that exists only in Sass and is not a Class breakpoint is not detected, because computed style cannot list custom properties by prefix; any Plugin Option that names it gets the unknown-name warning instead.
- An application that never constructs the service runs no breakpoint sync. Its directives with responsive Variant inputs use only the token's Zero breakpoint name, so a Zero breakpoint renamed in Sass but not in the token goes unreported there; the docs say to rename both together.

#### What stays outside the Runtime checks

The service's own development diagnostics are not Runtime checks: the warning for an unknown breakpoint name or modifier in `atLeast`, `upTo`, `is`, `resolve`, or a named-query token; the warnings for invalid Breakpoint rule tokens; and the error for an invalid Breakpoint map or Server breakpoint at construction. They report misuse of this API, not drift between TypeScript and the compiled CSS, read no CSS, and stay development-only behind `ngDevMode` with no switch, as before.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: `current` is the Server breakpoint for the whole request; `atLeast`, `upTo`, `only`, `is`, and `resolve` derive from it (so the Zero breakpoint answers `true`, unlike CDK's stub); `matches()` and `reducedMotion` are `false`. The service makes no `MediaMatcher`, `window`, or `getComputedStyle` call on the server. The chosen Server breakpoint goes into `TransferState`.
- The client before its first render callback: the same Server breakpoint, read from `TransferState` when the page was server-rendered or prerendered, else from the client token (a client-rendered app or a `RenderMode.Client` route). Nothing reads the viewport yet (1.11 decision 3).
- Going live: in the first `earlyRead` phase after the first application render. With full hydration, that render is the hydration pass, which claims the server nodes with exactly the server's values; the live values then re-render in the same tick: class and attribute bindings are rewritten, and an `@if` or `@switch` branch that differs is rebuilt, which hydration treats as a re-render at that spot, not an error (rendering-modes research, section 2, "Control flow and content projection"). In a client-rendered app the switch happens in the same tick as the first render, so the Server breakpoint's layout is never painted. The [Prototype: Breakpoint handoff under hydration](../issues/60-prototype-breakpoint-handoff-hydration.md) confirmed the handoff in Chromium, Firefox, and WebKit: no painted frame of the Server breakpoint on a client-rendered route, a clean branch rebuild after full hydration of server-rendered and prerendered routes, and a `hydrate on viewport` block hydrating into the live branch, with a per-request Server breakpoint carried through `TransferState`. Every render callback in the `write`, `mixedReadWrite`, and `read` phases of that pass, and every later callback, sees live values.
- What must not run before hydration: no `matchMedia`, no listener, no computed-style read, and no DOM write; the service never writes the DOM at all (CDK's style rule goes into `<head>`, outside the application root, and only from the render callback). The Runtime checks read computed style only in render callbacks and write nothing, so they run neither on the server nor before hydration.
- Incremental hydration: once the application has rendered, the service is live, so a breakpoint-gated directive inside a `@defer (hydrate on ...)` block hydrates with the live breakpoint. If that differs from the Server breakpoint, the block's classes are rewritten or its branch rebuilt during the block's hydration render. A replayed event whose target sat in a rebuilt branch is the consuming spec's concern (ResponsiveAccordionTabs states it). ResponsiveAccordionTabs itself starts each instance from the Server breakpoint's mode instead of `current` (the `instance` strategy, `resolve(rules, serverBreakpoint)`), so its own blocks hydrate as sent, with no rebuild at hydration. ResponsiveMenu, like ResponsiveAccordionTabs, starts each instance from `resolve(rules, serverBreakpoint)` and swaps in its first render callback, so its blocks hydrate as sent, with no re-classing at hydration (ADR 0035).
- `hydrate never`: widgets there keep the Server breakpoint's state forever. This is why anything visible at first paint that differs per breakpoint uses Foundation's CSS classes (ResponsiveToggle, OffCanvas reveal, the Visibility classes) rather than the service: the directives bind those classes from their inputs as host bindings, which are in the server HTML, so Foundation's media queries work in a block that never hydrates. The Runtime checks never run there.
- Plain `@defer` (client-created content, route changes): the service is already live, so a directive that reads `current` renders live at its first render and has no swap. ResponsiveAccordionTabs and ResponsiveMenu are the exceptions: they start every instance from the Server breakpoint's mode and swap in their first render callback, in the same tick, so the Server breakpoint's mode is never painted.
- Event replay: the service declares no template or host listeners, so it adds no `jsaction` and nothing of its own replays. Replay runs after the hydrating render's `afterNextRender` callbacks (rendering-modes research, section 3), so a replayed handler that reads `is(showOn)` or `atLeast(hideFor)` sees live values.
- Hydration boundaries: the service is application-wide and is not part of any widget's boundary.
- Prerendering: SSR at build time; `REQUEST` is `null`, so a per-request factory falls back to the default and the page carries the default Server breakpoint. The library itself reads no request token (1.11 decision 11); the client-hint recipe is consumer code.

## Testing Decisions

A good test asserts what a consumer observes: the breakpoint name and booleans the service reports, the DOM a consuming fixture renders from them, the server HTML, the console warnings, the Runtime check reports, and what a production bundle contains, never the service's or the checker's private fields, caches, or listener bookkeeping. There is no prior art in the new repository; the patterns are CDK's own `MediaMatcher`-faking layout specs, Angular's `renderApplication`-based SSR tests, and the Angular Components universal-app e2e.

Story ids follow `media-query--<story>`: `media-query--current-breakpoint`, `media-query--breakpoint-queries`, `media-query--breakpoint-rules`, `media-query--named-queries`, `media-query--reduced-motion`, `media-query--custom-breakpoint-map`; unchanged by the class rule. The Storybook preview stylesheet includes `nfs-breakpoint-properties` and every other Library mixin, so no story makes a Runtime check report. The demo components write no Foundation or NFS class: they print into a plain `<table>` and `<output>` elements with no scaffolding classes, and inline styles only for values Foundation has no class for (Storybook conventions, section 8).

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Run by `npx nx test-storybook <lib>`. Each story renders a small demo component that prints the service's values; every story runs axe with `parameters.a11y.test = 'error'` and the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, plus `best-practice`). Play functions assert relationships that hold at any iframe width, because viewport widths are Playwright's job:

- `media-query--current-breakpoint`: the printed `current` equals the largest breakpoint whose `get()` query `window.matchMedia` reports as matching; the `atLeast`, `upTo`, and `only` table agrees with that breakpoint's index for every name.
- `media-query--breakpoint-queries`: `is()` rows for `medium`, `medium up`, `medium only`, `medium down`, `all`, and the empty string agree with `atLeast`, `only`, and `upTo`.
- `media-query--breakpoint-rules`: the rule strings `drilldown medium-dropdown`, `medium-dropdown drilldown`, and the object form print the same resolved mode.
- `media-query--named-queries`: `landscape` and `portrait` rows agree with `window.matchMedia` on Foundation's strings, and exactly one of them is `true`.
- `media-query--reduced-motion`: the printed `reducedMotion` equals `window.matchMedia('(prefers-reduced-motion: reduce)').matches`.
- `media-query--custom-breakpoint-map`: with a story-level `nfsBreakpointsToken` of `{small: 0, medium: 768, large: 1100, xlarge: 1200, xxlarge: 1440}` and a matching Breakpoint properties style block (custom properties only; `--nfs-breakpoint-classes` comes from the preview stylesheet), `get('medium')` prints `only screen and (min-width: 48em)` and `get('large')` prints `only screen and (min-width: 68.75em)`.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

Vitest browser mode under the Angular unit-test builder (`npx nx test <lib>`, Chromium headless): TestBed specs in `<name>.spec.ts` next to the directive, over a bare test host component, zoneless with `await fixture.whenStable()`, asserting DOM and ARIA state; no story is mounted here and no axe runs here.

A fake `MediaMatcher` provided in the test's environment injector returns controllable `MediaQueryList` objects (`matches` plus a `change` dispatcher).

- Handoff: before the first render `current` is the Server breakpoint (token default, a token override, and a seeded `TransferState` value each win in that order); after `await fixture.whenStable()` it is the live breakpoint; a fixture template bound to `current` shows the live value after that one stable, with no intermediate state left in the DOM. `serverBreakpoint` reads the same value throughout and keeps it after `current` goes live; `resolve(rules, serverBreakpoint)` keeps resolving the Server breakpoint's mode after `current` has moved on, while `resolve(rules)` follows `current`.
- Changes: dispatching `change` across each threshold updates `current`, `atLeast`, `upTo`, `only`, `is`, and `resolve`, and a fixture's host bindings, under zoneless change detection with `whenStable()` and no `NgZone`.
- No match: when every breakpoint list reports `false` (print media), `current` keeps its value.
- `matches()`: a query first read before the first render is subscribed when the service goes live; one first read later subscribes immediately; one list per distinct query.
- `reducedMotion`: follows `change` both ways.
- Cleanup: destroying the environment injector removes every listener from the fake lists.
- Validation: a map without `0`, with duplicate values, or with an unknown `serverBreakpoint` throws the development-mode error at construction; an unknown name in `atLeast`, `is`, or a named query token warns once per string and answers `false`.
- Transfer: a `TransferState` seeded with a name absent from the client map warns and falls back to the client token.

Runtime checks. Reads and reports are once per realm, and Vitest's default `isolate: true` gives each test file its own browser realm, so each case below that needs a first read or a first report of its own sits in its own test file (named after the case). Test style blocks write custom properties on `:root` only, never a class. The fixture directive for the Variant check is a test host directive in the spec file that calls `nfsVariantCheck('nfsProbe')`, `include('nfs-probe', ['probe-palette'])`, and `value()` from its own `afterRenderEffect`, as a library directive does.

- `strictBreakpointSync` (one file per outcome): no properties produces the include report; a style block with `--nfs-breakpoint-medium: 768px` produces the drift report naming `medium` with both values; a `--nfs-breakpoint-classes: small medium large xlarge` beside a map without `xlarge` reports `xlarge` with its `--nfs-breakpoint-xlarge` value; matching properties produce nothing; a second application in the same file produces no second report; each report's `check` is `strictBreakpointSync` and its message carries the prefix.
- Configuration: with no provider all three checks report in a development build; `provideNfsRuntimeChecks({strictBreakpointSync: false})` silences the drift report and leaves the Variant checks on; `provideNfsRuntimeChecks({strictVariantNames: false})` silences name reports only; in a development build `provideNfsProductionRuntimeChecks({strictVariantNames: true}, {report})` changes nothing (every check still reports, to `console.warn`, and `report` is not called).
- Presence: with no probe property, a probe directive with no bound value reports `strictVariantProperties` once, naming `nfs-probe`; ten such directives still report once; with the property present, nothing.
- Names: with `--nfs-probe-palette: primary secondary` a bound `primary` is silent; `purple` through a cast reports `strictVariantNames` once, with `directive`, `input`, `value`, `setting`, and `names`; changing the value to `teal` reports `teal` once; changing it back to `purple` reports nothing new; a `null` need (a value with a space) reports once that it binds no class.
- Formats: a comma list (`primary, secondary`), a line-broken list, and a count (`--nfs-probe-columns: 12`, where 12 is silent and 13 reports) read as the Variant property format says; an empty property that no `include()` lists is an empty list, so any name reports under `strictVariantNames` and nothing reports under `strictVariantProperties`; a need whose property an `include()` found missing makes no second report.
- Timing: nothing is read or reported before the fixture's first `whenStable()` (a `getComputedStyle` spy records no call until then); a probe directive created later in a plain `@defer` block reports at its own first render.

### 3. Node-level Vitest

- Pure logic (table-driven): `parseNfsBreakpointRules` for bare modes, prefixed modes, both orders, a hyphenated breakpoint name (`x-large-dropdown` with `x-large` in the map), repeated breakpoints, unknown modes, unknown breakpoints, extra whitespace, and the object form; the Breakpoint query grammar including `all`, the empty string, and bad modifiers; resolution by map order; `nfsBreakpointForWidth` at 0, 639, 640, 1023, 1024, 1439, 1440, and 5000 px; the query builder (`0` to `0em`, `640` to `40em`, `1100` to `68.75em`, `1440` to `90em`); map validation and sorting of an unordered map; the Zero breakpoint as `nfsBreakpointForWidth(map, 0)` for the default map and for a map whose zero key is renamed (`xs`); the checker's pure Variant property reader over an empty value, whitespace only, `small medium large`, `primary, purple`, a line-broken list, duplicates, and `12`.
- SSR smoke: `renderApplication` over a fixture that prints `current`, `serverBreakpoint`, `atLeast('medium')`, `is('large down')`, a resolved rule, `resolve(rules, serverBreakpoint)`, `matches()` of `landscape`, and `reducedMotion`, and holds one probe directive that reports to `nfsVariantCheck` with a value its (absent) property does not list. Assert `whenStable()` resolves; the HTML shows `small`, `small`, `false`, `true`, the bare rule's mode, the same bare rule's mode, `false`, `false`, and no class, attribute, or `jsaction` from this entry point; the `ng-state` script contains `nfsServerBreakpoint: "small"`; with a server provider `{map, serverBreakpoint: 'large'}` the HTML shows `large` for both `current` and `serverBreakpoint` and the script says so; with the client-hint recipe's factory and a `REQUEST` carrying `Sec-CH-Viewport-Width: 1300` the HTML shows `xlarge`; with `REQUEST` `null` (the prerender path) it shows `small`; a `MediaMatcher` spy and a `getComputedStyle` spy record no call, and no Runtime check reports on the server. Runs under `npx nx test <lib>` in `<name>.ssr.spec.ts` through the shared `renderServer()` helper; `npx nx test-node <lib>` only if the server path depends on the DOM adapter.
- Sass: the Breakpoint properties output itself is tested by the Sass packaging ticket's compile tests (decision 18); this spec adds the `--nfs-breakpoint-classes` cases to them: Foundation's defaults write `small medium large`, a `$breakpoint-classes: (small, medium, large, xlarge)` comma list writes `small medium large xlarge` space-separated, and an empty `$breakpoint-classes` compiles (written with `unquote('')`, since `#{()}` is a Sass error).

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build (`media-query--current-breakpoint`, `media-query--breakpoint-rules`, `media-query--custom-breakpoint-map`, `media-query--reduced-motion`) in Chromium, Firefox, and WebKit:

- `page.setViewportSize` at 639, 640, 1023, 1024, 1199, 1200, 1439, and 1440 px: `current` changes exactly at Foundation's thresholds; resizing without a reload updates the printed values; with the custom map the thresholds move to 768 and 1100 px.
- At 320 by 640 px (1.4.10): `current` is `small` and the demo page does not scroll horizontally.
- Resize text (1.4.4), Firefox only, with the `font.size.variable.x-western` user preference at 20: `current` is `small` at 640 px and `medium` at 800 px.
- `page.emulateMedia({reducedMotion: 'reduce'})` and back: `reducedMotion` follows without a reload.
- `page.emulateMedia({media: 'print'})`: `current` keeps its screen value.

Against the prerendered fixture app (the harness from the [Prototype: Rendering-mode test seam](../issues/59-prototype-rendering-mode-test-seam.md)):

- JavaScript disabled at a 1300 px viewport: the first paint shows the Server breakpoint's state (`small` output, the bare rule's mode), screenshot plus axe (`@axe-core/playwright` with `withTags` on `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, and `best-practice`).
- Hydration at 1300 px: after hydration the page shows `xlarge` and the `medium` rule's mode; no NG05xx in the console; `ngDevMode.componentsSkippedHydration === 0`.
- A `@defer (hydrate on viewport)` block below the fold with a breakpoint-dependent `@if`: scrolling it into view at 1300 px hydrates it into the `xlarge` branch with no NG05xx.
- The drift report does not appear (the fixture includes the Breakpoint properties); a second fixture route built without the include logs the `strictBreakpointSync` include report once.

Against production builds of the fixture app (the production-bundle measurement; a second build configuration with script optimization on, so `ngDevMode` is `false`, in two variants: the fixture as it is, and the fixture with `provideNfsProductionRuntimeChecks({strictVariantNames: true}, {report})` in its application configuration). A test with no page reads each build's JavaScript; a second test serves the opt-in build:

- Without the production call, the bundle contains none of the checker's report texts (`has no class in the compiled CSS`, `were found on :root`) and no `getPropertyValue` from this entry point; with only `provideNfsRuntimeChecks({strictVariantProperties: false})` added, the same holds.
- With the production call, the texts are present; served, a probe value cast past its type reaches the `report` callback once with `check: 'strictVariantNames'`, the drift fixture reports nothing (not listed), and the console shows no development report.

## Out of Scope

- Container queries as the breakpoint mechanism: Foundation documents its breakpoint Options as viewport breakpoints (ADR 0005); container queries stay allowed inside library CSS for component-internal sizing.
- Foundation's `meta.foundation-mq` handshake and reading breakpoints from CSS as the source of truth (ADR 0005).
- A `changed` output or event stream: services have no outputs, and `current` covers it; consumers who want an Observable use `toObservable`.
- HiDPI breakpoints (`$breakpoints-hidpi`) as JavaScript breakpoints: Foundation's JavaScript never read them; Interchange's `retina` named query stays a fixed string.
- `$print-breakpoint` semantics in JavaScript: Foundation's JavaScript ignores print; the service keeps the screen breakpoint while printing.
- A library-owned client-hint reader: nothing in the library reads request tokens (1.11 decision 11); the recipe is documented consumer code.
- Element-level or route-level Breakpoint maps: the viewport is application-wide, so the token is provided at application level only.
- A testing entry point with a fake `MediaMatcher`: consumers provide their own fake, as CDK's own tests do; a shipped test double can be added later without breaking anything.
- Registering the Breakpoint properties with `@property`: it would change the Sass packaging decision's output and stays a possible follow-up. The names-list half of this former item is decided by ADR 0040: `--nfs-breakpoint-classes` lists the Class breakpoints. A list of every `$breakpoints` key stays out; the drift check's limit is only a Sass-only breakpoint that is not a Class breakpoint.
- Each consuming Plugin's swap behaviour, focus rule, and first-paint CSS: those belong to the Plugin specs; this spec fixes only what they can rely on.
- Each directive's Variant inputs, value-to-class mapping, Zero-breakpoint gaps, and Variant properties: those belong to its spec; this spec fixes how a directive reports them.
- The Variant registries, the Class breakpoint types, the Variant property format, the Variant declaration file, and its generator, sync, and CI checks: the [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md) owns them.
- Runtime checks on the server: the server has no computed style.
- A Runtime check that compares every name the Variant declaration file declares with the CSS, rendered or not: it would need the declared names at run time, which a declaration file does not carry (ADR 0040's dissent on a theme constant); the CI check compares them.
- A report destination per check, or a development `report` callback: the console is the development destination, and a consumer who wants telemetry opts the checks into production.
- A Breakpoint-query parsing helper for the Variant directives: each family maps its own query words and Zero-breakpoint gaps to its own classes, and the grammar is two words.

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
| 19 | Drift check | The `strictBreakpointSync` Runtime check (revised 2026-09-27, ADR 0040): once per realm, token names plus the Class breakpoints, px text parse; on in development with a per-check opt-out, off in production unless opted in | Once per application (a report in every consumer unit test); development only with no switch (this spec's first version, overruled by the user's rulings recorded in ADR 0040) |
| 20 | Missing properties | One report naming the include | Silence (the Sass ticket's recommended default was the warning) |
| 21 | Invalid map | Development error at construction | Warning (every breakpoint-gated Plugin would misbehave silently) |
| 22 | Entry point | `ngx-foundation-sites/media-query`, which also exports the Runtime-check API (ADR 0040) | Inside each Plugin (duplicated), or the primary entry point (defeats per-Plugin `@defer`; since 2026-09-27 the primary entry point holds types and one pure function only) |
| 23 | Server breakpoint exposed as `serverBreakpoint`; `resolve` takes an optional breakpoint | Lets a consumer whose first-render swap could lose focus start every instance from the Server breakpoint's mode without re-implementing the handoff or the rule parser: ResponsiveAccordionTabs, whose swap removes focused nodes (ADR 0032), and ResponsiveMenu, whose swap re-classes them in the Nested menu root's render callback (ADR 0035) | A private field with no public read (every consumer would need its own handoff state); a second method instead of an optional argument (a second spelling of `resolve`) |
| 24 | Class rule (ADR 0039) | No Structural, Variant, or State class and no class read; the responsive classes belong to the directives that set them from typed inputs; examples, stories, and fixtures write no class | A Visibility-class helper in this entry point (the Visibility Classes spec owns those directives); reading Foundation's `.foundation-mq` or any static class (building-blocks 1.4) |
| 25 | Two breakpoint types | `NfsBreakpointName` (open, the map) for behaviour Options and this API; `NfsClassBreakpoint` (closed, `$breakpoint-classes`, primary entry point) for Variant inputs and class-setting Options | One type for both (either `xlarge` Variants compile with no class, or `stickyOn="xlarge"` fails for a map breakpoint that has no classes); a registry over `$breakpoints` (ADR 0040 keeps behaviour Options open) |
| 26 | `--nfs-breakpoint-classes` | Written by `nfs-breakpoint-properties`, read by `strictVariantNames`, `strictBreakpointSync`, and the Variant declaration tooling | A separate mixin (a second include for one property the same settings produce); a names list of every `$breakpoints` key (the class list already narrows the drift check's limit to breakpoints that no class uses) |
| 27 | Runtime-check configuration | Two provider functions, each affecting only its own build; development reports to `console.warn`, production to `report` or `console.warn`; application level only | One umbrella `provideNfs()` (building-blocks 1.9; ADR 0040's dissent); a tri-state per check (every caller ships the checker); a `report` callback that also receives development reports (a function named for production acting in development, and telemetry fed with development noise) |
| 28 | Production tree-shaking | An internal root token whose factory returns the development checker behind `ngDevMode`, else `null`; only the production call replaces it | A runtime flag the directives read with the checker always imported (the checker ships in every bundle, 595 B in SYNC 8.3's stand-in); an `ngDevMode`-only check (no production opt-in) |
| 29 | Variant check interface | `nfsVariantCheck(directive)` returns a handle or `null`; the directive calls `include(mixin, settings)` and `value(input, value, needs)` from its own render callback | A registration call that creates the render callback itself (a second callback in directives that already have one for their development warnings, as the Button does); a per-input registration with no presence request (the Close Button could not report a missing include while `size` is unset) |
| 30 | Missing include versus empty list | `include()` lists only properties the mixin never leaves empty on Foundation's defaults; every other empty property is an empty list | Treating any empty property as missing (a flag-gated family's empty list would report a missing include; an empty and a missing property read the same, ADR 0040's dated note, re-measured); a sentinel for the empty list (`none` can be a name; the Variant property format keeps whitespace only) |
| 31 | Once per realm | Property reads and reports cached per realm, for all three checks | Per application (a report per consumer unit test); on every render (a report per instance and pass); re-reading on every check (a computed-style read per value) |
| 32 | Zero breakpoint for Variant directives | `nfsBreakpointForWidth(inject(nfsBreakpointsToken).map, 0)`, no new export | Injecting `NfsMediaQuery` (a render callback and a `TransferState` entry on every server-rendered page with a button); the literal `small` (breaks a renamed map); a new `nfsZeroBreakpoint()` export (the existing function answers it) |
| 33 | The service's own development warnings | Stay development-only diagnostics outside the Runtime checks | Folding them into `strictBreakpointSync` or a fourth check (they report misuse of this API, not CSS drift, and the check set is ADR 0040's) |

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
  readonly #live = signal(false); // set in the first render callback (Responsive Menu spec, ADR 0035)
  // The requested mode, handed to the Nested menu root's drive(); the public `mode` is the displayed mode
  // the root commits in its render callback, as the Responsive Menu spec defines it.
  readonly #requested = computed(() =>
    this.#live() ? this.#mq.resolve(this.#parsed()) : this.#mq.resolve(this.#parsed(), this.#mq.serverBreakpoint),
  );
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

When only the look changes, no service is involved: a directive sets Foundation's class from its input, the class is in the server HTML, and Foundation's media query does the rest, even in a `hydrate never` block (the selector is illustrative; the [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md) names it, and building-blocks 1.4 gives the input):

```html
<aside nfsVisibility showFor="large">Only from large up</aside>
<!-- server HTML: <aside class="show-for-large">Only from large up</aside> -->
```

Runtime checks (every check is on in development without any of this):

```ts
// application configuration
import {provideNfsProductionRuntimeChecks, provideNfsRuntimeChecks} from 'ngx-foundation-sites/media-query';

export const appConfig: ApplicationConfig = {
  providers: [
    // Development: switch one check off. In a production build this returns no providers.
    provideNfsRuntimeChecks({strictBreakpointSync: false}),
    // Production: callout colours come from a CMS, so report names the CSS lacks to telemetry.
    // The only production code path that keeps the checker.
    provideNfsProductionRuntimeChecks({strictVariantNames: true}, {report: (report) => telemetry.warn(report.message, report)}),
  ],
};
```

A consumer's unit tests that do not compile the application's Sass:

```ts
TestBed.configureTestingModule({
  providers: [provideNfsRuntimeChecks({strictVariantProperties: false, strictBreakpointSync: false})],
});
```

A library directive reporting to the Variant check (the shape the component specs follow; names illustrative):

```ts
export class NfsCallout {
  readonly color = input<NfsCalloutColor | undefined>(undefined);
  readonly #check = nfsVariantCheck('nfsCallout'); // null in a production build without the opt-in

  constructor() {
    const check = this.#check;

    if (check) {
      afterRenderEffect({
        read: () => {
          // Presence first, on every run, bound value or not.
          check.include('nfs-callout', ['callout-sizes']);
          const color = this.color();

          if (color !== undefined) {
            // The same test the class binding uses: one class token, or no class and a null need.
            check.value('color', color, /^[\w-]+$/.test(color) ? [{setting: 'foundation-palette', name: color}] : null);
          }
        },
      });
    }
  }
}
```

A directive with a responsive Variant input finds the Zero breakpoint without the service:

```ts
readonly #zero = nfsBreakpointForWidth(inject(nfsBreakpointsToken).map, 0); // 'small' by default
```

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This utility relies on Foundation's `$breakpoints` and `$breakpoint-classes` settings and its `-zf-bp-to-em` function; it uses no Export mixin. Its CSS is the `nfs-breakpoint-properties` Library mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included once anywhere in the global stylesheet (it has no ordering constraint):

1. Rules: one `:root` rule with `--nfs-breakpoint-<name>: <px>` for each key of `$breakpoints`, in map order, and `--nfs-breakpoint-classes` listing `$breakpoint-classes`. Foundation's CSS cannot provide them because Foundation has no custom-property output for breakpoints; its only JavaScript channel is the `.foundation-mq` `font-family` string that this library does not use.
2. Reuse: the values are `-zf-bp-to-em($value)` times 16 px, read from the consumer's `$breakpoints` (the mixin's optional `$map` parameter defaults to it), so they equal Foundation's media queries by construction; `--nfs-breakpoint-classes` is the consumer's `$breakpoint-classes`, joined with `space` (a comma-separated setting prints space-separated). No value is copied.
3. Properties the directives write: none. The Runtime checks only read the Breakpoint properties and `--nfs-breakpoint-classes`, in the browser, after the first render.
4. Motion classes and reduced motion: none; the utility adds no animation. `reducedMotion` is a JavaScript signal; the CSS reduced-motion rules belong to `nfs-motion` and the Plugins' Library mixins.
5. What breaks when the include is missing: nothing at runtime, because JavaScript reads `nfsBreakpointsToken` and every class a directive sets is Foundation's; in development `strictBreakpointSync` makes the one report that names the include and cannot compare the token with the Sass, `strictVariantProperties` reports the missing `--nfs-breakpoint-classes` for every directive with a responsive Variant input, and the Variant declaration tooling cannot read the Class breakpoints.
6. Variant properties: `--nfs-breakpoint-classes`, the property of the `$breakpoint-classes` Variant registry `NfsBreakpointClassesOverrides`, in the Variant property format of the [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md): space-separated names, and whitespace only (written with `unquote('')`, because Sass rejects `#{()}`) for an empty `$breakpoint-classes`. No flag gates it.

### Platform features to adopt when the browser target moves

- Cross-browser viewport client hints (`Sec-CH-Viewport-Width` is Chromium-only and experimental on MDN today): the per-request recipe would then cover every visitor instead of Chromium's.
- `@property` registration of the Breakpoint properties with `syntax: '<length>'` (not Baseline widely available by 2026-05-07): computed style would return absolute lengths, so the drift check could accept any unit; this needs a change to the Sass packaging decision's output.
- CSS `@custom-media`, if it ever reaches the target: Foundation's breakpoints could be named once in CSS for consumers' own media queries. It would not replace the token, because the server still has no CSS.

### Foundation behaviour changed or dropped

- The `meta.foundation-mq` handshake, `_init`/`_reInit`, `next()`, `queries`, and the `matchMedia` polyfill are dropped.
- `changed.zf.mediaquery` becomes the `current` signal.
- Rule resolution by map order, bare modes from the Zero breakpoint, last-hyphen splitting, non-throwing invalid input, and the print hold are the deltas listed under Foundation contract.
- Foundation re-evaluated on every `resize` event; the service reacts only to `MediaQueryList` `change` events, which fire once per threshold crossing.
- `$breakpoint-classes`, which Foundation's JavaScript never read, reaches JavaScript types through the Class breakpoint types and the run time through `--nfs-breakpoint-classes`, so a responsive Variant can only name a breakpoint Foundation generates classes for.
