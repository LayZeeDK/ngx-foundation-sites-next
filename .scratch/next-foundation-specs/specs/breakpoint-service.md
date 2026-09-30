# Spec: Breakpoint service (shared utility)

Ticket: [Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Decided upstream in ADR 0005 (Breakpoint source of truth), ADR 0008 (Rendering-modes contract), ADR 0012 (Sass packaging), ADR 0014 (first-render handoff), ADR 0039 (the class rule), and ADR 0040 (Variant input types); the decision log with sources is in the ticket answer, and the class-rule revision's is in the [Re-run: Breakpoint service (shared utility) spec under the class rule](../issues/129-rerun-breakpoint-service-class-rule.md). The Class breakpoint types and the Variant property format come from the [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md).

## Problem Statement

Eight of Foundation's 21 Plugins change behaviour with the viewport: ResponsiveMenu and ResponsiveAccordionTabs switch mode per breakpoint, ResponsiveToggle and OffCanvas change at a named breakpoint, Tooltip, Sticky and Equalizer switch themselves off below one, and Interchange swaps sources by breakpoint or by orientation and pixel density; and three more, Orbit, SmoothScroll, and Magellan, should stop moving things when the user asks for reduced motion. In Foundation the eight all ask one utility, `Foundation.MediaQuery`, which learns the breakpoints by reading a serialised Sass map out of the computed `font-family` of a `<meta class="foundation-mq">` element and re-checks them on every window `resize`.

That design cannot carry over to an Angular library that must render on the server:

- The `font-family` handshake needs a rendered stylesheet and computed style. The server has neither, and prerendering has no browser at all, so the library cannot learn the breakpoints the way Foundation does.
- The server does not know the viewport. CDK's `MediaMatcher` answers `false` to every query on the server, including the always-true `small`, so a directive that asks it naively renders a state no viewport has.
- If each directive reads `matchMedia` on its own, each picks its own moment and its own answer; a directive that reads the real viewport while hydrating renders something the server never sent, and one Plugin may disagree with another about the current breakpoint.
- A developer who customises Foundation's `$breakpoints` in Sass has to repeat the values for JavaScript.
- Foundation's rule strings (`drilldown medium-dropdown`, `accordion medium-tabs`) are parsed separately in each Plugin, with their quirks: rule order decides which rule wins, a breakpoint name with a hyphen breaks the parser, and an unknown mode throws later.
- Under the class rule (ADR 0039) the consumer writes no Foundation class, so the looks that change per breakpoint (`.medium-horizontal`, `.reveal-for-large`, `.medium-only-expanded`) are set by directives from typed inputs. Foundation generates those classes only for the breakpoints in `$breakpoint-classes` (`small medium large` by default), not for every breakpoint of the map, so a type that accepts every breakpoint name would let `expanded="xlarge only"` compile against a class that does not exist, and Foundation's JavaScript never needed to know that list at all.

Developers need one source of truth for breakpoints that works in the browser, on the server, while prerendering, and during hydration, and library authors need one API that every breakpoint-gated Plugin spec can build on.

## Solution

A root service, `NfsMediaQuery`, that answers Foundation's MediaQuery questions from a TypeScript Breakpoint map instead of from CSS:

- The Breakpoint map comes from `nfsBreakpointsToken`, whose root factory holds Foundation's default map (`small` 0, `medium` 640, `large` 1024, `xlarge` 1200, `xxlarge` 1440, in px). A developer who changed `$breakpoints` in Sass provides the same names and values once, in px, at application level (a renamed Zero breakpoint is renamed in both), and keeps every name of `$breakpoint-classes` a key of that map (documented usage).
- `current` is a signal holding the name of the current breakpoint; `atLeast()`, `upTo()`, `only()`, and `is('medium down')` answer Foundation's questions as reactive reads of that signal; `resolve()` picks the mode a Breakpoint rule assigns to the current breakpoint; `matches()` tracks any other media query (Interchange's `landscape`, `portrait`, `retina`); `reducedMotion` is a signal for `prefers-reduced-motion: reduce`.
- The media queries are exactly Foundation's (`only screen and (min-width: 40em)`), built from the map in em as Foundation's Sass does, and read through CDK `MediaMatcher` in the browser.
- On the server and while prerendering the service answers with the Server breakpoint, `small` by default. On the client it keeps answering with the same Server breakpoint until its first render callback, then switches to the live viewport inside the same change-detection pass, so hydration always starts from exactly what the server sent. A server that picks its breakpoint per request (for example from client hints) hands the choice to the client through Angular's `TransferState`.
- One pure parser reads Foundation's Breakpoint rule strings for ResponsiveMenu and ResponsiveAccordionTabs, typed by the modes each Plugin allows; rules resolve by the order of the Breakpoint map, not by the order they are written.
- The Class breakpoints, Foundation's `$breakpoint-classes`, are typed apart from the map's names. Variant inputs, and the Options that set a class only for Class breakpoints (Off-canvas `revealOn`, `inCanvasOn`), take `NfsClassBreakpoint` from the primary entry point, closed over Foundation's `small`, `medium`, and `large` and extended by the consumer's Variant declaration file; behaviour Options and this service's own API keep the open `NfsBreakpointName`. The developer's `@include nfs-breakpoint-properties;` writes the Class breakpoints as `--nfs-breakpoint-classes`, which the Variant declaration tooling reads from the compiled CSS to type them.

Anything that only looks different per breakpoint stays in Foundation's CSS: the Visibility classes and the breakpoint classes (`.show-for-*`, `.hide-for-*`, `.<bp>-horizontal`, `.reveal-for-<bp>`, `.in-canvas-for-<bp>`), which the directive that owns each family sets from its Variant input or Option (a Menu's `[orientation]` rules, Off-canvas `revealOn`, the Responsive Toggle's `hideFor`), so the consumer writes none of them, except the visibility classes on its own elements, a family with no first-milestone spec, which the consumer writes as normal classes with Foundation's global styles loaded; either way the server HTML carries them. The service is for behaviour; it reads no class and writes none.

## User Stories

1. As an application developer, I want the library to know Foundation's default breakpoints without any setup, so that breakpoint-gated Plugins work out of the box with Foundation's default Sass settings.
2. As an application developer who customised `$breakpoints` in Sass, I want to provide the same values once in TypeScript, so that every Plugin switches at the widths my CSS uses.
3. As an application developer who customised `$breakpoints` or `$breakpoint-classes`, I want the documentation to say that `nfsBreakpointsToken` takes my `$breakpoints` values in px and every Class breakpoint as a key, so that TypeScript and CSS switch at the same widths.
4. As an application developer, I want `@include nfs-breakpoint-properties;` to write my Class breakpoints as `--nfs-breakpoint-classes`, so that the Variant declaration tooling can type my responsive Variant inputs from my Sass.
5. As an application developer, I want the service to write nothing to the console in any build, so that my console holds only my application's messages.
6. As an application developer, I want to read the current breakpoint name as a signal, so that my own components can react to it in templates and `computed` values.
7. As an application developer, I want `atLeast('medium')`, `upTo('medium')`, `only('medium')`, and `is('medium down')` with Foundation's meanings, so that code and knowledge from Foundation's MediaQuery docs carry over.
8. As an application developer, I want these answers to update my templates when the viewport crosses a breakpoint, without subscribing or unsubscribing, so that responsive logic is one expression.
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
22. As an application developer using `@defer (hydrate never)`, I want to know that widgets there keep the Server breakpoint's state, so that I rely on Foundation's visibility and breakpoint classes, which are in the server HTML, for anything that must look right at every width.
23. As an application developer, I want a widget created later inside a plain `@defer` block to render the live breakpoint straight away, so that content in a plain `@defer` block has no swap at all.
24. As a developer of a zoneless application, I want breakpoint changes to update the view without `NgZone`, so that the library fits Angular 22's default change detection.
25. As a developer of a zone-based application, I want the same service to work unchanged, so that I can adopt the library before migrating.
26. As a ResponsiveMenu or ResponsiveAccordionTabs author, I want Foundation's rule strings parsed into a typed object, so that I do not write a parser per Plugin.
27. As an application developer, I want `accordion medium-tabs` and `medium-tabs accordion` to mean the same, so that rule order never changes behaviour (Foundation's docs say the order does not matter).
28. As an application developer, I want a rule without a breakpoint prefix to apply from the smallest breakpoint of my map, even if I renamed `small`, so that rules follow my Breakpoint map.
29. As an application developer with a breakpoint name that contains a hyphen (`x-large`), I want rules like `x-large-dropdown` to work, so that Foundation's single-hyphen split does not limit my naming.
30. As an application developer, I want the object form `{small: 'drilldown', medium: 'dropdown'}` accepted wherever a rule string is, so that I can bind rules from code with type checking.
31. As an application developer, I want an unknown mode or breakpoint in a rule string skipped, and the documentation to list the modes each Plugin accepts, so that a typo drops only its own token and I can find it against that list.
32. As a Tooltip, Sticky, or Equalizer author, I want `showOn`, `stickyOn`, and `equalizeOn` values (`medium`, `large only`, `medium down`, `all`) answered by one call, so that every Plugin reads Breakpoint queries the same way.
33. As an application developer, I want a Breakpoint query with an unknown name or modifier to answer `false`, so that a typo in a template does not crash my app.
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
44. As an application developer who adds a breakpoint to `$breakpoint-classes`, I want to regenerate my Variant declaration file from my compiled CSS, so that my responsive Variant inputs accept the new breakpoint.
45. As an application developer who has not added `@include nfs-breakpoint-properties;`, I want the service to keep working from `nfsBreakpointsToken` alone, so that only the Variant declaration tooling, which reads the Class breakpoints, needs the include.
46. As an application developer, I want unit tests that do not compile my Sass to need no setup for the service, so that the default Breakpoint map, or my own token, is all a test needs.
47. As an application developer whose Variant values come from runtime data such as a CMS, I want the documentation to say that a value my CSS has no class for renders no class, so that I validate such data against my Sass settings myself.
48. As an application developer, I want a production bundle to carry only the parts of this entry point I use, so that an application that never injects the service ships none of it.
49. As an application developer, I want the service's answers to be the same in development and production builds, so that the behaviour I test in development is the behaviour I ship.
50. As an application developer whose `$breakpoint-classes` includes `xlarge`, I want the documentation to say that `nfsBreakpointsToken` needs `xlarge` too, so that an Off-canvas `revealOn="xlarge"` does not stay closed in JavaScript while Foundation's CSS reveals the panel.
51. As an application developer, I want responsive Variant inputs to accept only Class breakpoints and behaviour Options to accept every breakpoint of my map, so that `expanded="xlarge only"` fails to compile unless my Sass generates `xlarge` classes while `stickyOn="xlarge"` works from the map alone.
52. As a library directive author, I want every Class breakpoint to be assignable to `NfsBreakpointName`, so that a directive passes its Class-breakpoint Option straight to the service (`mq.atLeast(this.revealOn())`) with no cast.
53. As a library directive author, I want the Zero breakpoint's name without constructing the Breakpoint service, so that a directive with a responsive Variant input fills Foundation's Zero-breakpoint gaps identically on the server and the client and adds no `TransferState` entry to the page.
54. As a library maintainer, I want the service never to read computed style and never to write the DOM, so that server HTML, hydration, and event replay depend only on `nfsBreakpointsToken` and the Server breakpoint.

## Implementation Decisions

### Foundation contract

What Foundation 6.9's MediaQuery utility does (its source, the "JavaScript" part of Foundation's Media Queries docs, and the utilities research, section 3):

| Foundation | Behaviour | Library counterpart |
| --- | --- | --- |
| `$breakpoints` Sass map (`small: 0, medium: 640px, large: 1024px, xlarge: 1200px, xxlarge: 1440px`; the first value must be `0`) | Source of truth for Sass and, through the handshake, for JavaScript | Sass stays the consumer's; JavaScript reads `nfsBreakpointsToken` (ADR 0005) |
| `.foundation-mq { font-family: 'small=0em&medium=40em&...' }` plus the `<meta class="foundation-mq">` the plugin appends to `<head>` | Serialised map read back from computed style | Dropped: needs computed style, which the server lacks, and a class the library would have to add to the page. JavaScript reads `nfsBreakpointsToken` instead (ADR 0005) |
| `$breakpoint-classes` (`small medium large`; "each value in this list must also be in the `$breakpoints` map", and Foundation's `breakpoint()` warns at compile time when one is not) | Sass only: the breakpoints Foundation generates responsive classes for (Visibility classes, grid sizes, `-expanded`, `.<bp>-horizontal`, `.reveal-for-<bp>`); Foundation's JavaScript never reads it | `--nfs-breakpoint-classes`, written by `nfs-breakpoint-properties`; the Class breakpoint types of the primary entry point (ADR 0040) |
| `queries`: `{name, value: 'only screen and (min-width: <em>)'}` in map order | One min-width query per breakpoint | Same strings, built from the token in em (px / 16), exposed through `get(name)` |
| `current` | Name of the largest matching query, recomputed on every window `resize` | `current` signal, updated from `MediaQueryList` `change` events |
| `atLeast(size)` | `matchMedia(get(size)).matches`; `false` for unknown names | Same meaning; unknown name answers `false` |
| `upTo(size)` | `!atLeast(next(size))`, `true` for the last breakpoint; throws for unknown names | Same meaning; unknown name answers `false` |
| `only(size)` | `size === current` | Same |
| `is('medium')`, `is('medium up')`, `is('medium only')`, `is('medium down')` | Dispatch to `atLeast`/`only`/`upTo`; throws on any other modifier | Same grammar plus `all` (Tooltip's keyword) and the empty string (Equalizer's "no gate"), both `true`; a bad modifier answers `false` |
| `get(size)` | Query string or `null` | Same |
| `next(size)` | Following breakpoint name | Dropped from the public API (no directive or documented use needs the following breakpoint's name; Foundation's own `upTo` is its only caller) |
| `changed.zf.mediaquery` on `window` with `[newSize, oldSize]` | Broadcast on breakpoint change | The `current` signal; a directive or application derives with `computed`, `linkedSignal`, or `effect` |
| `_init()`, `_reInit()`, `isInitialized` | Lazy initialisation and re-reading late CSS | Dropped (DI constructs the service; the token does not depend on CSS) |
| `window.matchMedia` polyfill | For pre-IE10 browsers | Dropped (`matchMedia` and `MediaQueryList` `change` are in the Browser target) |
| Interchange `SPECIAL_QUERIES` (`landscape`: `screen and (orientation: landscape)`, `portrait`: `screen and (orientation: portrait)`, `retina`: the six-part device-pixel-ratio list), extensible by assignment | Named queries for Interchange rules | `nfsDefaultNamedQueries` constant with Foundation's three strings verbatim; `matches(query)` tracks any of them; custom named queries go in Interchange's Defaults token |

Breakpoint rule syntax (ResponsiveMenu `data-responsive-menu`; ResponsiveAccordionTabs `data-responsive-accordion-tabs`; both Plugins carry the same parser): space-separated tokens, each `<breakpoint>-<mode>` or a bare `<mode>` meaning `small`; parsed by `rule.split('-')`; the winning rule is the last one in written order whose breakpoint `atLeast` matches. Modes: ResponsiveMenu `dropdown`, `drilldown`, `accordion`; ResponsiveAccordionTabs `accordion`, `tabs`.

Breakpoint query users: Tooltip `showOn` (default `'small'`; `'all'` bypasses the check), Sticky `stickyOn` (default `'medium'`), Equalizer `equalizeOn` (default `''`, which skips the check). Breakpoint name users through `atLeast`: ResponsiveToggle `hideFor` (default `'medium'`), OffCanvas `revealOn` and `inCanvasOn` (default `null`).

Deltas from Foundation, each deliberate:

- Rules resolve by the Breakpoint map's order (the largest rule breakpoint at or below `current` wins), not by written order. Every documented Foundation example lists rules smallest first, where both orders agree, and the ResponsiveAccordionTabs docs say "the accordion/tabs values can be in any order", which only map order makes true.
- A bare mode applies from the Zero breakpoint (the breakpoint whose minimum width is 0), not from the hard-coded name `small`.
- A token splits at its last hyphen, so hyphenated breakpoint names work; modes contain no hyphen.
- Unknown modes and breakpoints are skipped at parse time; Foundation stores `undefined` and throws when that breakpoint later matches.
- Unknown names never throw; they answer `false`.
- While no breakpoint query matches (the media type is not `screen`, for example while printing), `current` keeps its previous value instead of becoming `undefined`, which also matches Foundation's behaviour in practice, because Foundation recomputed only on `resize`.

### CSS class mapping

The utility is a service and pure functions, so it has no element and no Structural, Variant, or State class of its own, and the class rule (ADR 0039) adds no host binding here. What the rule changes is where the breakpoint-dependent classes come from, and it confirms what the service reads (building-blocks 1.14 item 2):

| Kind | Class or property | Owner | Notes |
| --- | --- | --- | --- |
| Structural | none | | The utility renders nothing |
| Variant | none of its own | the directives that set them | The responsive Variant classes (`.medium-only-expanded`, `.medium-horizontal`), and `.reveal-for-<bp>` and `.in-canvas-for-<bp>` are set by their directives from Variant inputs or Options typed `NfsClassBreakpoint`; the visibility classes and grid sizes (`.show-for-medium`, `.medium-6`) belong to families with no first-milestone spec and are normal classes the consumer writes; this entry point supplies only the Zero breakpoint's name through `nfsBreakpointsToken` and `nfsBreakpointForWidth` (API) |
| State | none | | |
| Foundation classes read | none | | The `.foundation-mq` handshake is dropped. No part of this entry point reads a class to learn a breakpoint, seed a state, or pick a Variant (building-blocks 1.4, "Initial state is bound, never read from a class") |
| Custom properties read (not classes) | none | | The service reads no CSS: it answers from `nfsBreakpointsToken` |
| Variant property written | `--nfs-breakpoint-classes` | the `nfs-breakpoint-properties` Library mixin | From `$breakpoint-classes`; Variant registry `NfsBreakpointClassesOverrides`; read from the compiled CSS by the Variant declaration tooling's generator |

The spec's own examples, stories, and fixtures write no Foundation or NFS class: its demo components print into a plain `<table>`, which Foundation styles by tag and which carries no Variant class, so it needs no directive (ADR 0039, dated note), and into `<output>` elements.

### Hierarchy and DI shape

There is no directive family; the utility is one service, one configuration token, and pure functions.

```
nfsBreakpointsToken (InjectionToken, root factory: Foundation's default map)
      |                                   \
      v                                    \ inject(nfsBreakpointsToken): the Zero breakpoint
NfsMediaQuery (@Service(), root singleton)  \  (directives with a responsive Variant input)
  uses: MediaMatcher (@angular/cdk/layout), TransferState, DOCUMENT, Injector (afterNextRender), DestroyRef
      ^
      | inject(NfsMediaQuery)
ResponsiveMenu, ResponsiveAccordionTabs, ResponsiveToggle, OffCanvas, Sticky, Equalizer,
Tooltip, Interchange, Orbit, SmoothScroll, Magellan, and application code

Pure functions (no DI): parseNfsBreakpointRules, nfsBreakpointForWidth
Constants: nfsDefaultBreakpointMap, nfsDefaultNamedQueries
```

- `nfsBreakpointsToken`: `InjectionToken<NfsBreakpoints>` with `providedIn: 'root'` and a factory returning `{map: nfsDefaultBreakpointMap}`. This is Material's Shape A (required configuration with a root factory, from the DI patterns research), not a per-Plugin Defaults token: the service always needs a map. Named `nfsBreakpointsToken` per ADR 0009; its description is its plain name (`new InjectionToken<NfsBreakpoints>('nfsBreakpointsToken', ...)`).
- Provided at application level only (documented usage): in the application configuration for every platform, and in the server configuration for a server-only Server breakpoint. The service is a root singleton, so a provider at route or element level is never read.
- `NfsMediaQuery`: `@Service()` (root singleton, tree-shaken when unused, per Angular's services guide). One instance per application, which on the server means one per request, because each request bootstraps its own application.
- No provider function for the Breakpoint map: one token needs none (building-blocks 1.9; the components repo ships `provide*` only to swap a class). Consumers write `{provide: nfsBreakpointsToken, useValue: ...}` or `useFactory` for the per-request recipe. The service itself needs no provider: it is `@Service()`.
- No Defaults token of its own: Breakpoint queries and rules are Options of the consuming Plugins, whose Defaults tokens hold their defaults. Named queries belong to Interchange, the only Plugin that uses them, so they are the `namedQueries` field of Interchange's Defaults token (building-blocks Table B, Interchange), defaulting to `nfsDefaultNamedQueries`.
- Entry point: its own secondary entry point, `ngx-foundation-sites/media-query` (Foundation's utility name, building-blocks 1.3), imported by the consuming Plugins' entry points so a consumer's `@defer` block pulls it in with the first gated Plugin. The entry points of directives with a responsive Variant input import `nfsBreakpointsToken` and `nfsBreakpointForWidth` from it for the Zero breakpoint (API); `NfsMediaQuery` itself is tree-shaken from an application that never injects it.
- The Class breakpoint types (`NfsClassBreakpoint`, `NfsClassBreakpointQuery<M>`, `NfsClassBreakpointRules<V>`) and their Variant registry `NfsBreakpointClassesOverrides` are not exported here: they live in the primary entry point `ngx-foundation-sites` with every other Variant registry (ADR 0040; the [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md) declares them). This entry point needs none of them: its own API takes `NfsBreakpointName`, to which every Class breakpoint is assignable (API).

### API

Types:

```ts
type NfsBreakpointName = 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge' | (string & {});
type NfsBreakpointMap = Readonly<Record<NfsBreakpointName, number>>; // minimum widths in px
interface NfsBreakpoints {
  map: NfsBreakpointMap; // the names and values of your Sass $breakpoints, in px: finite, unique, exactly one 0
  serverBreakpoint?: NfsBreakpointName; // a key of map; defaults to the Zero breakpoint
}
type NfsBreakpointModifier = 'up' | 'only' | 'down';
type NfsBreakpointRules<M extends string> = Readonly<Partial<Record<NfsBreakpointName, M>>>;
```

- `NfsBreakpointMap` values are CSS pixels, the unit of Foundation's default settings. Order does not matter: the service sorts by value. Documented usage: the values are finite, non-negative, and unique, with exactly one `0` (Foundation's Sass rule that the first breakpoint is `0`), the names and values equal the consumer's Sass `$breakpoints` (a Zero breakpoint renamed in Sass is renamed in the token too), and `serverBreakpoint`, when set, is a key of the map. The service does not validate the token; its answers for a map that breaks these rules are unspecified.
- The Zero breakpoint is the key whose value is `0`; the Server breakpoint defaults to it.

Breakpoint names and Class breakpoints. Two sets of names, typed apart because they differ by default (`xlarge` and `xxlarge` are in the Breakpoint map and in no Foundation class) and are configured in different places:

| Type | Declared in | Names | Open or closed | Types | A typo is caught by |
| --- | --- | --- | --- | --- | --- |
| `NfsBreakpointName` | this entry point | the Breakpoint map's keys, from `nfsBreakpointsToken` | open: Foundation's five names plus `(string & {})` | behaviour Options (ResponsiveMenu and ResponsiveAccordionTabs rules keys, Responsive Toggle `hideFor` while its spec emits the classes for every breakpoint, and the name part of Tooltip `showOn`, Sticky `stickyOn`, and Equalizer `equalizeOn`, Breakpoint queries typed `string`) and this service's API | nothing: an unknown name answers `false` at run time |
| `NfsClassBreakpoint`, with `NfsClassBreakpointQuery<M>` and `NfsClassBreakpointRules<V>` | the primary entry point, over the Variant registry `NfsBreakpointClassesOverrides` | `$breakpoint-classes` | closed: `small`, `medium`, `large`, extended or shrunk by the consumer's Variant declaration file | every responsive Variant input, and the Options that set a class only for Class breakpoints (Off-canvas `revealOn` and `inCanvasOn`) | the compiler |

- Every Class breakpoint must be a breakpoint of the map: Foundation's settings say so, and its `breakpoint()` warns at compile time otherwise. Documented usage: every Class breakpoint is also a key of `nfsBreakpointsToken`'s map. So an `NfsClassBreakpoint` is always assignable to `NfsBreakpointName` (the open member accepts it), and a directive passes its Class-breakpoint Option straight to the service (`mq.atLeast(this.revealOn())`).
- `NfsBreakpointName` stays open, as ADR 0040 decides. The map reaches JavaScript through the token, a runtime value, not through a Variant registry, so a typo in a behaviour Option compiles, and the unknown name answers `false` at run time.
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
| `resolve(rules, breakpoint?)` | `M \| undefined` | The mode of the largest rule breakpoint at or below `breakpoint`, default `current`; `undefined` when no rule applies yet (Foundation's "no match" case, left to the consuming spec). The optional second argument lets a directive or application resolve against `serverBreakpoint` instead of `current` (ResponsiveAccordionTabs' `instance` strategy, and ResponsiveMenu until its first render callback) |
| `matches(mediaQuery)` | `boolean` | Whether an arbitrary media query matches (named queries); `false` on the server and before the service goes live |
| `get(name)` | `string \| null` | Foundation's query string for a breakpoint, `only screen and (min-width: <px / 16>em)`, for example `only screen and (min-width: 40em)`, `(min-width: 68.75em)` for 1100 px, `(min-width: 0em)` for the Zero breakpoint |

Reactivity and memoisation:

- `current` and `reducedMotion` are the service's state, each a private writable signal exposed read-only. `atLeast`, `upTo`, `only`, `is`, and `resolve` are reactive reads: each reads `current` and compares breakpoint indexes, so it is reactive wherever it is called inside a reactive context (a template, a host binding, `computed`, `linkedSignal`, `effect`, `afterRenderEffect`), and a snapshot anywhere else, which is Foundation's own behaviour.
- The service memoises nothing for these: each call is a map lookup and an integer comparison. A directive or application memoises through `computed` over its inputs, for example `canStick = computed(() => mq.is(this.stickyOn()))`, which recomputes only when `stickyOn` or `current` changes.
- `matches(query)` keeps one signal and one `MediaQueryList` per distinct query string, created on first read, because each arbitrary query needs its own listener. The set is small and fixed by the app's templates; listeners are removed when the application is destroyed.
- Why not signal-returning methods (`atLeast(name): Signal<boolean>`): templates would read `mq.atLeast('medium')()`, directives would unwrap a signal inside every `computed`, and the service would need a cache per argument to avoid creating a `computed` on every change-detection pass. Reactive reads give the same reactivity with neither cost.

Pure functions and constants (usable without DI, so Node-level tests reach them directly):

| Export | Signature | Meaning |
| --- | --- | --- |
| `nfsDefaultBreakpointMap` | `NfsBreakpointMap` (frozen) | `{small: 0, medium: 640, large: 1024, xlarge: 1200, xxlarge: 1440}` |
| `nfsDefaultNamedQueries` | `Readonly<Record<string, string>>` (frozen) | Foundation's `landscape`, `portrait`, `retina` strings, verbatim |
| `parseNfsBreakpointRules` | `<M extends string>(rules: string \| NfsBreakpointRules<M>, modes: readonly M[], breakpoints: readonly NfsBreakpointName[]) => NfsBreakpointRules<M>` | Parses a Breakpoint rule string, or validates the object form, against the allowed modes and the ordered breakpoint names (pass `mq.breakpoints`); invalid tokens (an unknown mode or breakpoint) are skipped |
| `nfsBreakpointForWidth` | `(map: NfsBreakpointMap, widthPx: number) => NfsBreakpointName` | The largest breakpoint whose minimum width is at or below `widthPx`; for the server recipe and for tests |

Breakpoint rule grammar (whitespace-separated, case-sensitive like Foundation):

```
rules    := token (WS token)*
token    := mode | breakpoint "-" mode      (split at the last "-")
mode     := one of the modes the consuming Plugin passes
breakpoint := a name of the Breakpoint map
```

A bare `mode` maps to the Zero breakpoint. A repeated breakpoint keeps the last token. The object form is validated with the same rules. The typed result is `NfsBreakpointRules<M>`, for example `{small: 'drilldown', medium: 'dropdown'}`.

Breakpoint query grammar (`is()`): `'all' | '' | <breakpoint> | <breakpoint> WS ('up' | 'only' | 'down')`, whitespace-trimmed.

Named query tokens (Interchange): a token is a breakpoint name, answered by `atLeast(name)`, or a key of the named-query map from Interchange's Defaults token, answered by `matches(namedQueries[key])`; a token containing whitespace or `(` is a media query answered by `matches(token)`; any other token answers `false`. Interchange's own rule order (the last matching rule wins) stays Interchange's, because its rules mix breakpoints with orientation and density queries that have no single order.

Consuming directives and what each reads (building-blocks Part 2 and Part 3):

| Consuming directive | Reads | Option |
| --- | --- | --- |
| ResponsiveMenu | `parseNfsBreakpointRules(rules, ['dropdown', 'drilldown', 'accordion'], mq.breakpoints)`, then `resolve(parsed, serverBreakpoint)` until the first render callback and `resolve(parsed)` after | `rules` |
| ResponsiveAccordionTabs | `parseNfsBreakpointRules(rules, ['accordion', 'tabs'], mq.breakpoints)`, then `resolve(parsed, serverBreakpoint)` for the mode each instance starts from and `resolve(parsed)` for the live mode it swaps to in its first render callback | `rules` |
| ResponsiveToggle | `atLeast(hideFor)` for the open logic; first paint from Foundation's `.hide-for-<bp>`/`.show-for-<bp>` classes, which its directives bind from `hideFor`; `reducedMotion` (binds no Motion class, consuming-directive rule 3) | `hideFor` (`NfsBreakpointName` while its spec emits the classes for every breakpoint, building-blocks 1.7), `animate` (`NfsMotionPair`) |
| OffCanvas | `atLeast(revealOn)`, `atLeast(inCanvasOn)`; first paint from `.reveal-for-<bp>`/`.in-canvas-for-<bp>`, which its directive binds from the same Options | `revealOn`, `inCanvasOn` (`NfsClassBreakpoint`); the Zero breakpoint sets no class |
| Sticky | `is(stickyOn)` | `stickyOn` |
| Equalizer | `is(equalizeOn)` | `equalizeOn` |
| Tooltip | `is(showOn)` at show time | `showOn` |
| Interchange | named query tokens through `atLeast` and `matches`, `nfsDefaultNamedQueries` | `rules` (breakpoint tokens are Breakpoint map names, `NfsBreakpointName`, not Class breakpoints), Defaults token `namedQueries` |
| Orbit | `reducedMotion` (autoplay off) | `autoPlay` |
| SmoothScroll; Magellan through the composed `NfsSmoothScroll` | `reducedMotion` (`behavior: 'instant'` instead of `'smooth'`) | none |
| Accordion, Tabs, ResponsiveAccordionTabs | `reducedMotion` (`behavior: 'instant'` for the deep-link smudge scroll, and for Tabs' `autoFocus` scroll) | `deepLinkSmudge`, `autoFocus` (Tabs) |
| Drilldown | `reducedMotion` (`behavior: 'instant'` for the `scrollTop` scroll) | `scrollTop` |
| Dropdown pane | `reducedMotion` (binds no Motion class, consuming-directive rule 3) | `animate` (`NfsMotionPair`) |
| Directives with a responsive Variant input (Button `expanded`, Menu `orientation` and `expanded`, Button Group and Top Bar `stackedFor`) | the Zero breakpoint as `nfsBreakpointForWidth(inject(nfsBreakpointsToken).map, 0)`, never `current`: their classes are Foundation's media-query CSS, not JavaScript | their Variant inputs, typed over `NfsClassBreakpoint` |

### Implementation level and primitives

Level: custom Angular service over CDK `MediaMatcher`, per ADR 0005. The platform supplies the queries (`matchMedia`, `MediaQueryList` `change` events, `prefers-reduced-motion`, all Baseline widely available and in the Browser target per the web platform research); `@angular/aria` has nothing for viewport state; CDK has `MediaMatcher` and `BreakpointObserver`, and the service uses only the first.

- `MediaMatcher.matchMedia(query)` for every query, because it adds the empty `@media` style rule that makes WebKit and Blink fire `change` reliably, honours `CSP_NONCE`, and is the documented seam to fake in tests. On the server `MediaMatcher` returns a stub whose `matches` is `false` (except for `''` and `'all'`, which it reports `true`) and which has `addListener` but no `addEventListener`; the service never reaches that stub, because it calls `MediaMatcher` only inside a render callback, and render callbacks do not run on the server (`afterNextRender` returns a no-op when `ngServerMode` is set).
- One `MediaQueryList` per breakpoint query and one for `(prefers-reduced-motion: reduce)`, each with `addEventListener('change', ...)` (not the deprecated `addListener` CDK's observer still uses). A `change` on any breakpoint query recomputes `current` as the largest matching breakpoint; queries are nested min-width ranges, so this equals Foundation's `atLeast` on each query.
- Going live: the constructor registers `afterNextRender({earlyRead})` without a view (so it runs after the next application render). The `earlyRead` callback creates the lists, sets `current`, `reducedMotion`, and every `matches()` signal requested so far, and attaches the listeners. Signals set there mark the views that read them, and `ApplicationRef` re-runs change detection before it returns (its synchronisation loop runs after-render hooks at the end of each pass and loops while views are dirty), so the live values reach the DOM in the same tick, before the browser paints.
- No lazy loading: `injectAsync` is not used, because the service is needed at the first render callback of every breakpoint-gated directive and by the handoff itself, so it loads eagerly with the first directive that injects it; `afterEveryRender` is not used either, because the service reacts to `MediaQueryList` `change` events, not to renders (audit 0004, M6).
- Server breakpoint handoff: the constructor reads `TransferState` key `nfsServerBreakpoint` with the token's `serverBreakpoint` (or the Zero breakpoint) as the default, uses the result as the initial `current`, and writes it back. On the server that serialises the per-request choice into the page's `ng-state` script, which `provideServerRendering()` already emits; on the client `TransferState` reads that script at first injection. The write is symmetric and needs no platform check; on the client it is never serialised. A transferred name the client's map lacks falls back to the client token.
- Zoneless: every update is a signal write; zoneless change detection is scheduled by template-read signal updates (Angular's zoneless guide). No `NgZone.run` (CDK's observer needs it only because it emits through RxJS and patched `addListener`). In a zone-based app the same writes schedule change detection, and zone.js also runs the `change` callback in the Angular zone.
- Cleanup: `DestroyRef.onDestroy` removes every listener when the application (or a `TestBed` environment) is destroyed.
- Fallback if a target browser misbehaved with `MediaQueryList` `change`: a `ResizeObserver` on the document element recomputing `current` from `matches` in the same callback, which keeps the same public API. Not expected: `change` events are Baseline widely available and CDK's style-rule workaround covers the two known engine quirks.

### Comparison with Angular Material and CDK

| Concern | CDK `BreakpointObserver` / Material `Breakpoints` | `NfsMediaQuery` | Why |
| --- | --- | --- | --- |
| Breakpoint values | `Breakpoints` constants: Material's ranges (`XSmall` below 600 px, `Small` 600 to 960 px, and so on) | Foundation's `$breakpoints` from `nfsBreakpointsToken` | The constants have nothing to do with Foundation's map (ADR 0005) |
| Query shape | Arbitrary strings, often closed ranges (`and (max-width: 959.98px)`) in px | Foundation's open min-width strings in em | Same thresholds as Foundation's CSS, including under a changed default font size |
| Reading state | `isMatched(query): boolean` and `observe(query): Observable<BreakpointState>`; consumers wrap with `toSignal` (Material's navigation schematic) | `current` signal and reactive reads | Signals are the library's state model (building-blocks 1.5); no RxJS in a directive or application that reads them |
| Change timing | First value synchronous, later values debounced by `debounceTime(0)` | Synchronous signal writes | The zoneless scheduler already coalesces writes into one pass |
| Server | `MediaMatcher` stub: `false` for every query, including `(min-width: 0)` | The Server breakpoint: the Zero breakpoint is `true`, larger ones `false`, configurable per request | Server HTML must equal a real viewport's state (rendering-modes research, section 7 rule 9) |
| Hydration | Reads `matchMedia` whenever first asked, including during hydration | Server breakpoint until the first render callback, then live | Hydration starts from the server's state; 1.11 decision 3 forbids `matchMedia` before render callbacks |
| Reduced motion | Material's `_getAnimationsState()` reads `MediaMatcher('(prefers-reduced-motion)')` once and caches it for the page lifetime | `reducedMotion` signal that follows the setting live | Orbit must stop and restart autoplay if the user changes the setting |
| Testing | Fake `MediaMatcher` | Fake `MediaMatcher` | Same seam, borrowed |

Borrowed: a root service over `MediaMatcher`, `MediaMatcher` as the test seam, `@Service()` as CDK 22.2 declares its services. Not borrowed: `BreakpointObserver` itself, `Breakpoints`, `BreakpointState`, comma splitting of query lists, the Observable API, `LayoutModule`.

### ARIA requirements imposed on consuming directives

The service renders nothing and has no role, state, or keyboard behaviour. It imposes four rules on the Plugins that consume it (building-blocks 1.10 and 1.11 decision 8):

1. Focus continuity on swaps: when a breakpoint change swaps a widget's mode (ResponsiveMenu, ResponsiveAccordionTabs) or hides the element holding focus, the consuming directive moves focus to the equivalent control in the new mode, in a render callback, only when focus was inside the widget. This includes the swap at the first render (Server breakpoint to live): it moves focus like any other swap, because server-rendered controls can hold focus before hydration, so a consuming directive records whether focus is inside the widget, and on which item, while the old nodes still exist, and focuses the equivalent control in a render callback keyed on rendered state (building-blocks 1.5). Where it records depends on where the swap happens: in the render callback that itself commits the swap, when the displayed mode changes only there (an `earlyRead` callback, as the [Prototype: ResponsiveAccordionTabs as one component](../issues/51-prototype-responsive-accordion-tabs.md) does in case 15, and the Nested menu root's swap callback for ResponsiveMenu); in the change-detection code that removes the old nodes or re-classes them, when the swap is driven straight from this service's reads (a template `@if` on `atLeast()`, or the Interchange outlet's effect), because for a runtime change change detection swaps before any render callback runs; or continuously from `focusin`/`focusout` on a host that survives the swap. The [Re-run: Interchange spec, the `replaced` timing and the outlet's focus rule](../issues/67-rerun-interchange-replaced-timing.md) measured this in three engines. In a client-rendered app nothing can hold focus inside the widget before its first render, so the same code path finds nothing and moves nothing.
2. No server-bound hiding of content Foundation's CSS shows at a larger breakpoint: a breakpoint-gated hidden or inert state that Foundation shows at a larger breakpoint is expressed with Foundation's Visibility and breakpoint classes, never as a `hidden` or `inert` binding computed from `current` (audit 0002 H4; ADR 0008 Consequences). Those classes are host bindings of the directive that owns them, computed from its Option or Variant input, so they are in the server HTML; the consumer never writes them, and no directive learns its breakpoint from a static Visibility or breakpoint class on its host (building-blocks 1.4: a copied class is stripped where the directive binds it).
3. Reduced motion: JavaScript-driven motion (Orbit autoplay, smooth scrolling) reads `reducedMotion` and stops; auto-rotating content keeps its visible stop control regardless (WCAG 2.2.2). CSS motion is handled by the Library mixins' reduced-motion rules, not by this signal, with one permitted exception: a directive may bind no Motion class while `reducedMotion` is true, neither the library's class mapped from a Motion name nor the consumer's own class in the dot form, and complete the change in the same tick, which also covers a consumer keyframe class that carries no reduced-motion rule of its own (Responsive Toggle, Dropdown); Reveal and Toggler rely on the `nfs-motion` override and the consumer's own rule instead.
4. No announcements: breakpoint changes are not announced through live regions; they change layout, not content.

### WCAG 2.2 AA

The target is WCAG 2.2 level AA (user rule; ADR 0022). The service renders nothing, so it meets no criterion on its own; it imposes the criteria below on every consuming Plugin, and each consuming spec inherits the named test and runs it on its own stories and fixture route. Each is a requirement, not advice.

| Criterion | Requirement imposed on consuming directives, and what the service provides | Foundation default | Test each consuming spec inherits |
| --- | --- | --- | --- |
| 1.4.10 Reflow | At 320 CSS px wide (a 1280 px window at 400 percent zoom) no consuming directive makes the page scroll horizontally. Zoom shrinks the CSS viewport, so the em queries report the Zero breakpoint there and `current` follows through `MediaQueryList` `change` events with no reload; the service therefore guarantees that 320 px is always answered by the Zero breakpoint's mode (640 px is Foundation's first threshold). The requirement on consuming directives: the mode a Breakpoint rule assigns to the Zero breakpoint (a bare mode) and the state a Breakpoint query gives it must fit 320 px, so ResponsiveMenu's Zero-breakpoint mode is `drilldown` or `accordion`, never a horizontal `dropdown` bar that overflows, and ResponsiveAccordionTabs and a consumer's own `@if` branches stack there | Passes for Foundation's documented rule examples (`drilldown medium-dropdown`, `accordion medium-tabs`); a bare `dropdown` rule on a wide menu overflows | e2e at a 320 by 640 px viewport on the consuming spec's stories in three engines: `document.documentElement.scrollWidth <= 320`, with every menu or panel open that the story can open |
| 1.4.4 Resize Text | Breakpoint behaviour follows the user's text size: queries are Foundation's em strings (`only screen and (min-width: 40em)`), which media queries resolve against the browser's default font size, so a 20 px default moves `medium` to 800 CSS px and a text-heavy layout keeps its small-screen mode instead of squeezing enlarged text. The requirement on consuming directives: never build breakpoint queries in px, never compare `window.innerWidth` with the Breakpoint map, and always ask the service (`atLeast`, `is`, `resolve`, `get`) so JavaScript and Foundation's CSS switch at the same point | Passes: Foundation's Sass builds its media queries in em with `-zf-bp-to-em`, the same px / 16 conversion the service uses | Node-level query builder cases (`640` to `40em`, `1100` to `68.75em`); e2e in Firefox with the `font.size.variable.x-western` user preference at 20: at 640 px `current` is `small`, at 800 px `medium`, and the consuming directive's mode and Foundation's `.show-for-medium` (a Visibility class the fixture writes as a normal class, with Foundation's global styles loaded) switch at the same width |
| 2.4.3 Focus Order | Focus continuity on a breakpoint swap, at runtime and at the first-render handoff: consuming-directive rule 1 above. A swap never drops focus to `body`: when focus was inside the widget, it lands on the equivalent control; when it was outside, it does not move. The service provides the live values in the `earlyRead` phase of the handoff pass, before any consuming directive's swap callback runs | Fails: Foundation's ResponsiveMenu and ResponsiveAccordionTabs destroy and rebuild plugins on a breakpoint change with no focus handling | Browser-level test with the fake `MediaMatcher`: focus inside the widget, dispatch `change` across the threshold, focus is on the equivalent control; focus outside, it stays. e2e on a real resize in three engines. Fixture e2e: focus a server-rendered control before hydration (main bundle held) at a viewport whose live mode differs from the Server breakpoint's; after hydration focus is on the equivalent control (the ResponsiveAccordionTabs prototype's case 15) |
| 2.2.2 Pause, Stop, Hide | Anything a breakpoint or `reducedMotion` change starts (Orbit autoplay enabled only from a breakpoint up, a consumer's own animation) that moves for more than 5 s has a visible pause or stop control in every mode where it can run; a breakpoint change never restarts motion the user paused or stopped; while `reducedMotion` is `true` nothing starts automatically. The service provides `reducedMotion` live in both directions, so a directive or application can stop at once and must not restart on its own when the setting clears after a user pause | Fails: Foundation's Orbit autoplays with no reduced-motion check | Browser-level test: with the fake `MediaMatcher`, pause, cross a threshold, still paused; `reducedMotion` `true` starts nothing. e2e with `page.emulateMedia({reducedMotion: 'reduce'})`: no motion starts |
| 1.3.4 Orientation | Named queries (`landscape`, `portrait`) may change layout but never restrict content or functionality to one orientation: every Interchange rule and consumer branch keyed on orientation shows equivalent content in both | Passes for Foundation's documented Interchange examples, which swap image sources only | e2e on the consuming spec's stories at 640 by 360 and 360 by 640 px: the same controls and text are present in both |

Breakpoint changes are not announced (consuming-directive rule 4), so 4.1.3 Status Messages does not apply; the change is layout, not a status. The service needs no Sass setting for these criteria: its Sass input is the consumer's `$breakpoint-classes`, emitted as `--nfs-breakpoint-classes` for the Variant declaration tooling, and the consumer's `$breakpoints` reach it through `nfsBreakpointsToken`.

### Rendered output

The service renders no DOM and binds no class. What reaches the page:

- The Class breakpoints, emitted by the developer's `@include nfs-breakpoint-properties;` from their own `$breakpoint-classes` (ADR 0012 and its dated note; ADR 0005, dated note):

  ```css
  :root {
    --nfs-breakpoint-classes: small medium large;
  }
  ```

- The `TransferState` entry `nfsServerBreakpoint` in a server-rendered page's `ng-state` script (Rendering modes).

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: `current` is the Server breakpoint for the whole request; `atLeast`, `upTo`, `only`, `is`, and `resolve` derive from it (so the Zero breakpoint answers `true`, unlike CDK's stub); `matches()` and `reducedMotion` are `false`. The service makes no `MediaMatcher`, `window`, or `getComputedStyle` call on the server. The chosen Server breakpoint goes into `TransferState`.
- The client before its first render callback: the same Server breakpoint, read from `TransferState` when the page was server-rendered or prerendered, else from the client token (a client-rendered app or a `RenderMode.Client` route). Nothing reads the viewport yet (1.11 decision 3).
- Going live: in the first `earlyRead` phase after the first application render. With full hydration, that render is the hydration pass, which claims the server nodes with exactly the server's values; the live values then re-render in the same tick: class and attribute bindings are rewritten, and an `@if` or `@switch` branch that differs is rebuilt, which hydration treats as a re-render at that spot, not an error (rendering-modes research, section 2, "Control flow and content projection"). In a client-rendered app the switch happens in the same tick as the first render, so the Server breakpoint's layout is never painted. The [Prototype: Breakpoint handoff under hydration](../issues/60-prototype-breakpoint-handoff-hydration.md) confirmed the handoff in Chromium, Firefox, and WebKit: no painted frame of the Server breakpoint on a client-rendered route, a clean branch rebuild after full hydration of server-rendered and prerendered routes, and a `hydrate on viewport` block hydrating into the live branch, with a per-request Server breakpoint carried through `TransferState`. Every render callback in the `write`, `mixedReadWrite`, and `read` phases of that pass, and every later callback, sees live values.
- What must not run before hydration: no `matchMedia`, no listener, no computed-style read, and no DOM write; the service never writes the DOM at all (CDK's style rule goes into `<head>`, outside the application root, and only from the render callback).
- Incremental hydration: once the application has rendered, the service is live, so a breakpoint-gated directive inside a `@defer (hydrate on ...)` block hydrates with the live breakpoint. If that differs from the Server breakpoint, the block's classes are rewritten or its branch rebuilt during the block's hydration render. A replayed event whose target sat in a rebuilt branch is the consuming spec's concern (ResponsiveAccordionTabs states it). ResponsiveAccordionTabs itself starts each instance from the Server breakpoint's mode instead of `current` (the `instance` strategy, `resolve(rules, serverBreakpoint)`), so its own blocks hydrate as sent, with no rebuild at hydration. ResponsiveMenu, like ResponsiveAccordionTabs, starts each instance from `resolve(rules, serverBreakpoint)` and swaps in its first render callback, so its blocks hydrate as sent, with no re-classing at hydration (ADR 0035).
- `hydrate never`: widgets there keep the Server breakpoint's state forever. This is why anything visible at first paint that differs per breakpoint uses Foundation's CSS classes (ResponsiveToggle, OffCanvas reveal, the visibility classes) rather than the service: the directives bind those classes from their inputs as host bindings, and the consumer writes the visibility classes as normal classes, so all are in the server HTML, so Foundation's media queries work in a block that never hydrates.
- Plain `@defer` (client-created content, route changes): the service is already live, so a directive that reads `current` renders live at its first render and has no swap. ResponsiveAccordionTabs and ResponsiveMenu are the exceptions: they start every instance from the Server breakpoint's mode and swap in their first render callback, in the same tick, so the Server breakpoint's mode is never painted.
- Event replay: the service declares no template or host listeners, so it adds no `jsaction` and nothing of its own replays. Replay runs after the hydrating render's `afterNextRender` callbacks (rendering-modes research, section 3), so a replayed handler that reads `is(showOn)` or `atLeast(hideFor)` sees live values.
- Hydration boundaries: the service is application-wide and is not part of any widget's boundary.
- Prerendering: SSR at build time; `REQUEST` is `null`, so a per-request factory falls back to the default and the page carries the default Server breakpoint. The library itself reads no request token (1.11 decision 11); the client-hint recipe is consumer code.

## Testing Decisions

A good test asserts what a directive or application observes: the breakpoint name and booleans the service returns, the DOM a consuming fixture renders from them, and the server HTML, never the service's private fields, caches, or listener bookkeeping. There is no prior art in the new repository; the patterns are CDK's own `MediaMatcher`-faking layout specs, Angular's `renderApplication`-based SSR tests, and the Angular Components universal-app e2e.

Story ids follow `media-query--<story>`: `media-query--current-breakpoint`, `media-query--breakpoint-queries`, `media-query--breakpoint-rules`, `media-query--named-queries`, `media-query--reduced-motion`, `media-query--custom-breakpoint-map`; unchanged by the class rule. The Storybook preview stylesheet includes `nfs-breakpoint-properties` and every other Library mixin. The demo components write no Foundation or NFS class: they print into a plain `<table>` and `<output>` elements with no scaffolding classes, and inline styles only for values Foundation has no class for (Storybook conventions, section 8).

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Run by `npx nx test-storybook <lib>`. Each story renders a small demo component that prints the service's values; every story runs axe with `parameters.a11y.test = 'error'` and the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, plus `best-practice`). Play functions assert relationships that hold at any iframe width, because viewport widths are Playwright's job:

- `media-query--current-breakpoint`: the printed `current` equals the largest breakpoint whose `get()` query `window.matchMedia` reports as matching; the `atLeast`, `upTo`, and `only` table agrees with that breakpoint's index for every name.
- `media-query--breakpoint-queries`: `is()` rows for `medium`, `medium up`, `medium only`, `medium down`, `all`, and the empty string agree with `atLeast`, `only`, and `upTo`.
- `media-query--breakpoint-rules`: the rule strings `drilldown medium-dropdown`, `medium-dropdown drilldown`, and the object form print the same resolved mode.
- `media-query--named-queries`: `landscape` and `portrait` rows agree with `window.matchMedia` on Foundation's strings, and exactly one of them is `true`.
- `media-query--reduced-motion`: the printed `reducedMotion` equals `window.matchMedia('(prefers-reduced-motion: reduce)').matches`.
- `media-query--custom-breakpoint-map`: with a story-level `nfsBreakpointsToken` of `{small: 0, medium: 768, large: 1100, xlarge: 1200, xxlarge: 1440}`, `get('medium')` prints `only screen and (min-width: 48em)` and `get('large')` prints `only screen and (min-width: 68.75em)`.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

Vitest browser mode under the Angular unit-test builder (`npx nx test <lib>`, Chromium headless): TestBed specs in `<name>.spec.ts` next to the directive, over a bare test host component, zoneless with `await fixture.whenStable()`, asserting DOM and ARIA state; no story is mounted here and no axe runs here.

A fake `MediaMatcher` provided in the test's environment injector returns controllable `MediaQueryList` objects (`matches` plus a `change` dispatcher).

- Handoff: before the first render `current` is the Server breakpoint (token default, a token override, and a seeded `TransferState` value each win in that order); after `await fixture.whenStable()` it is the live breakpoint; a fixture template bound to `current` shows the live value after that one stable, with no intermediate state left in the DOM. `serverBreakpoint` reads the same value throughout and keeps it after `current` goes live; `resolve(rules, serverBreakpoint)` keeps resolving the Server breakpoint's mode after `current` has moved on, while `resolve(rules)` follows `current`.
- Changes: dispatching `change` across each threshold updates `current`, `atLeast`, `upTo`, `only`, `is`, and `resolve`, and a fixture's host bindings, under zoneless change detection with `whenStable()` and no `NgZone`.
- No match: when every breakpoint list reports `false` (print media), `current` keeps its value.
- `matches()`: a query first read before the first render is subscribed when the service goes live; one first read later subscribes immediately; one list per distinct query.
- `reducedMotion`: follows `change` both ways.
- Cleanup: destroying the environment injector removes every listener from the fake lists.
- Unknown names: an unknown name in `atLeast`, `upTo`, `is`, or a named query token answers `false`, throws nothing, and writes nothing to the console.
- Transfer: a `TransferState` seeded with a name absent from the client map falls back to the client token.
- No stylesheet: with no `nfs-breakpoint-properties` include in the test page, the service answers every question from the token, and a `getComputedStyle` spy records no call.

### 3. Node-level Vitest

- Pure logic (table-driven): `parseNfsBreakpointRules` for bare modes, prefixed modes, both orders, a hyphenated breakpoint name (`x-large-dropdown` with `x-large` in the map), repeated breakpoints, unknown modes, unknown breakpoints, extra whitespace, and the object form; the Breakpoint query grammar including `all`, the empty string, and bad modifiers; resolution by map order; `nfsBreakpointForWidth` at 0, 639, 640, 1023, 1024, 1439, 1440, and 5000 px; the query builder (`0` to `0em`, `640` to `40em`, `1100` to `68.75em`, `1440` to `90em`); sorting of an unordered map; the Zero breakpoint as `nfsBreakpointForWidth(map, 0)` for the default map and for a map whose zero key is renamed (`xs`).
- SSR smoke: `renderApplication` over a fixture that prints `current`, `serverBreakpoint`, `atLeast('medium')`, `is('large down')`, a resolved rule, `resolve(rules, serverBreakpoint)`, `matches()` of `landscape`, and `reducedMotion`. Assert `whenStable()` resolves; the HTML shows `small`, `small`, `false`, `true`, the bare rule's mode, the same bare rule's mode, `false`, `false`, and no class, attribute, or `jsaction` from this entry point; the `ng-state` script contains `nfsServerBreakpoint: "small"`; with a server provider `{map, serverBreakpoint: 'large'}` the HTML shows `large` for both `current` and `serverBreakpoint` and the script says so; with the client-hint recipe's factory and a `REQUEST` carrying `Sec-CH-Viewport-Width: 1300` the HTML shows `xlarge`; with `REQUEST` `null` (the prerender path) it shows `small`; a `MediaMatcher` spy and a `getComputedStyle` spy record no call. Runs under `npx nx test <lib>` in `<name>.ssr.spec.ts` through the shared `renderServer()` helper; `npx nx test-node <lib>` only if the server path depends on the DOM adapter.
- Sass compile test of `nfs-breakpoint-properties` (ADR 0012's compile test): Foundation's defaults write `--nfs-breakpoint-classes: small medium large`, a `$breakpoint-classes: (small, medium, large, xlarge)` comma list writes `small medium large xlarge` space-separated, and an empty `$breakpoint-classes` compiles (written with `unquote('')`, since `#{()}` is a Sass error).

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

## Out of Scope

- Container queries as the breakpoint mechanism: Foundation documents its breakpoint Options as viewport breakpoints (ADR 0005); container queries stay allowed inside library CSS for component-internal sizing.
- Foundation's `meta.foundation-mq` handshake and reading breakpoints from CSS as the source of truth (ADR 0005).
- A `changed` output or event stream: services have no outputs, and `current` covers it; a directive or application that wants an Observable uses `toObservable`.
- HiDPI breakpoints (`$breakpoints-hidpi`) as JavaScript breakpoints: Foundation's JavaScript never read them; Interchange's `retina` named query stays a fixed string.
- `$print-breakpoint` semantics in JavaScript: Foundation's JavaScript ignores print; the service keeps the screen breakpoint while printing.
- A library-owned client-hint reader: nothing in the library reads request tokens (1.11 decision 11); the recipe is documented consumer code.
- Element-level or route-level Breakpoint maps: the viewport is application-wide, so the token is provided at application level only.
- A testing entry point with a fake `MediaMatcher`: consumers provide their own fake, as CDK's own tests do; a shipped test double can be added later without breaking anything.
- Custom properties for the `$breakpoints` values, or a list of every `$breakpoints` key: nothing in this entry point reads them, because the service answers from `nfsBreakpointsToken` (ADR 0005); `--nfs-breakpoint-classes` lists the Class breakpoints (ADR 0040).
- Each consuming Plugin's swap behaviour, focus rule, and first-paint CSS: those belong to the Plugin specs; this spec fixes only what they can rely on.
- Each directive's Variant inputs, value-to-class mapping, Zero-breakpoint gaps, and Variant properties: those belong to its spec; this spec supplies only the Zero breakpoint's name and the relation between the two breakpoint types.
- The Variant registries, the Class breakpoint types, the Variant property format, the Variant declaration file, and its generator: the [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md) owns them.
- A Breakpoint-query parsing helper for the Variant directives: each family maps its own query words and Zero-breakpoint gaps to its own classes, and the grammar is two words.

## Further Notes

### Design decisions

| # | Decision | Chosen | Alternatives not taken, and why |
| --- | --- | --- | --- |
| 1 | Shape | One `@Service()` plus `nfsBreakpointsToken` plus pure functions | A directive family (nothing to attach to); per-Plugin `matchMedia` (disagreeing answers, the hydration rule enforced in ten places) |
| 2 | Token shape | `{map, serverBreakpoint?}`, map in px, sorted by value, Server breakpoint defaults to the Zero breakpoint | A flat map with a `serverBreakpoint` key (collides with a breakpoint of that name); em values (px is the unit of Foundation's defaults) |
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
| 14 | Invalid input | An unknown name or modifier answers `false` and an invalid rule token is skipped, the same in every build and with no console output; the valid names and modes are documented usage | Foundation's throws and deferred crashes |
| 15 | No match (print) | Keep the previous `current` | `undefined` (Foundation's value) or the Zero breakpoint (would switch menus while printing) |
| 16 | Named queries | Foundation's three strings in `nfsDefaultNamedQueries`; custom ones in Interchange's Defaults token; tracked by `matches()` | A named-query field on `nfsBreakpointsToken` (only Interchange uses named queries; building-blocks Table B already places them) |
| 17 | `retina` string | Foundation's six-part list verbatim | A shorter `(min-resolution: 2dppx)` (a behaviour change for no gain; the extra parts evaluate to false harmlessly) |
| 18 | Reduced motion | Live `reducedMotion` signal | Material's cached read (cannot restart autoplay when the setting changes) |
| 19 | TypeScript and Sass in step | Documented usage: the consumer provides `nfsBreakpointsToken` with the names and values of their Sass `$breakpoints` in px, and every name of `$breakpoint-classes` as a key of the map; the service reads no CSS | Reading the breakpoints from CSS (the server has no CSS, ADR 0005) |
| 20 | Missing `nfs-breakpoint-properties` include | Changes nothing at run time: the service answers from the token; only the Variant declaration tooling, which reads `--nfs-breakpoint-classes`, needs the include | Making the service depend on the stylesheet (the server and prerendering have none) |
| 21 | Invalid map | Documented usage: finite, non-negative, unique values with exactly one `0`, and a `serverBreakpoint` that is a key; the service does not validate the token, and its answers for an invalid one are unspecified | Normalising an invalid map (a guess at what the consumer meant, which would hide the mistake) |
| 22 | Entry point | `ngx-foundation-sites/media-query` | Inside each Plugin (duplicated), or the primary entry point (defeats per-Plugin `@defer`; since 2026-09-27 the primary entry point holds types and one pure function only) |
| 23 | Server breakpoint exposed as `serverBreakpoint`; `resolve` takes an optional breakpoint | Lets a consuming directive whose first-render swap could lose focus start every instance from the Server breakpoint's mode without re-implementing the handoff or the rule parser: ResponsiveAccordionTabs, whose swap removes focused nodes (ADR 0032), and ResponsiveMenu, whose swap re-classes them in the Nested menu root's render callback (ADR 0035) | A private field with no public read (every consuming directive would need its own handoff state); a second method instead of an optional argument (a second spelling of `resolve`) |
| 24 | Class rule (ADR 0039) | No Structural, Variant, or State class and no class read; the responsive classes belong to the directives that set them from typed inputs, or, for a family with no first-milestone spec, to the consumer who writes them (revised 2026-09-30, later-milestone families); examples, stories, and fixtures write no class of a family that has a first-milestone spec | A visibility-class helper in this entry point (a later milestone adds directives for those classes); reading Foundation's `.foundation-mq` or any static class (building-blocks 1.4) |
| 25 | Two breakpoint types | `NfsBreakpointName` (open, the map) for behaviour Options and this API; `NfsClassBreakpoint` (closed, `$breakpoint-classes`, primary entry point) for Variant inputs and class-setting Options | One type for both (either `xlarge` Variants compile with no class, or `stickyOn="xlarge"` fails for a map breakpoint that has no classes); a registry over `$breakpoints` (ADR 0040 keeps behaviour Options open) |
| 26 | `--nfs-breakpoint-classes` | Written by `nfs-breakpoint-properties`, read from the compiled CSS by the Variant declaration tooling's generator; the mixin writes no other property | A separate mixin (a second include for one property the same settings produce); a names list of every `$breakpoints` key, or a property per breakpoint value (nothing reads them: the service answers from the token) |
| 32 | Zero breakpoint for Variant directives | `nfsBreakpointForWidth(inject(nfsBreakpointsToken).map, 0)`, no new export | Injecting `NfsMediaQuery` (a render callback and a `TransferState` entry on every server-rendered page with a button); the literal `small` (breaks a renamed map); a new `nfsZeroBreakpoint()` export (the existing function answers it) |

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
      // The same values as $breakpoints, in px; every name of $breakpoint-classes is a key here too.
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

When only the look changes, no service is involved: Foundation's class is in the server HTML, set by a directive from its input or, for a family with no first-milestone spec such as the visibility classes, written by the consumer as a normal class with Foundation's global styles loaded, and Foundation's media query does the rest, even in a `hydrate never` block:

```html
<aside class="show-for-large">Only from large up</aside>
<!-- server HTML: <aside class="show-for-large">Only from large up</aside> -->
```

A directive with a responsive Variant input finds the Zero breakpoint without the service:

```ts
readonly #zero = nfsBreakpointForWidth(inject(nfsBreakpointsToken).map, 0); // 'small' by default
```

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This utility relies on Foundation's `$breakpoint-classes` setting (the consumer's `$breakpoints` reach JavaScript through `nfsBreakpointsToken`, documented usage); it uses no Export mixin. Its CSS is the `nfs-breakpoint-properties` Library mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included once anywhere in the global stylesheet (it has no ordering constraint):

1. Rules: one `:root` rule with `--nfs-breakpoint-classes` listing `$breakpoint-classes`, which the Variant declaration tooling's generator reads from the compiled CSS to type the Class breakpoints. Foundation's CSS cannot provide it because Foundation has no custom-property output for breakpoints; its only JavaScript channel is the `.foundation-mq` `font-family` string that this library does not use.
2. Reuse: `--nfs-breakpoint-classes` is the consumer's `$breakpoint-classes`, joined with `space` (a comma-separated setting prints space-separated). No value is copied.
3. Properties the directives write: none, and no directive reads this property at run time.
4. Motion classes and reduced motion: none; the utility adds no animation. `reducedMotion` is a JavaScript signal; the CSS reduced-motion rules belong to `nfs-motion` and the Plugins' Library mixins.
5. What breaks when the include is missing: nothing at runtime, because JavaScript reads `nfsBreakpointsToken` and every class a directive sets is Foundation's; the Variant declaration tooling cannot read the Class breakpoints.
6. Variant properties: `--nfs-breakpoint-classes`, the property of the `$breakpoint-classes` Variant registry `NfsBreakpointClassesOverrides`, in the Variant property format of the [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md): space-separated names, and whitespace only (written with `unquote('')`, because Sass rejects `#{()}`) for an empty `$breakpoint-classes`. No flag gates it.

### Platform features to adopt when the browser target moves

- Cross-browser viewport client hints (`Sec-CH-Viewport-Width` is Chromium-only and experimental on MDN today): the per-request recipe would then cover every visitor instead of Chromium's.
- CSS `@custom-media`, if it ever reaches the target: Foundation's breakpoints could be named once in CSS for consumers' own media queries. It would not replace the token, because the server still has no CSS.

### Foundation behaviour changed or dropped

- The `meta.foundation-mq` handshake, `_init`/`_reInit`, `next()`, `queries`, and the `matchMedia` polyfill are dropped.
- `changed.zf.mediaquery` becomes the `current` signal.
- Rule resolution by map order, bare modes from the Zero breakpoint, last-hyphen splitting, non-throwing invalid input, and the print hold are the deltas listed under Foundation contract.
- Foundation re-evaluated on every `resize` event; the service reacts only to `MediaQueryList` `change` events, which fire once per threshold crossing.
- `$breakpoint-classes`, which Foundation's JavaScript never read, reaches JavaScript types through the Class breakpoint types, which the Variant declaration tooling generates from `--nfs-breakpoint-classes`, so a responsive Variant can only name a breakpoint Foundation generates classes for.
