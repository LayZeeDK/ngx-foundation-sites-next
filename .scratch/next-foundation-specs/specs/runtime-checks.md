# Spec: Runtime checks (later milestone)

Ticket: [Spec: Runtime checks (later milestone)](../issues/162-spec-runtime-checks-later-milestone.md). Milestone: later. Planned and implemented in a later milestone of the implementing repository, by the user's ruling in [Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md). Targets Angular 22.2, Nx 23.2, TypeScript 6.0.x, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, and Foundation for Sites 6.9.0 Sass. Decided upstream in [ADR 0040](../adr/0040-variant-input-types.md) (the Runtime checks and their configuration), [ADR 0005](../adr/0005-breakpoint-source-of-truth.md) (the drift check), [ADR 0012](../adr/0012-sass-packaging.md) (the Breakpoint properties and the Variant properties as verification channels), [ADR 0044](../adr/0044-utility-directive-rule.md) (the handle of a directive several attributes create), and building-blocks 1.4, 1.7, 1.9, and 1.13. The design is the specs' as committed at `53144f3`: the [Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md) held the configuration, `nfsVariantCheck`, and `strictBreakpointSync`, and twenty component specs held their directives' requests. [Task: extract the checks from the specs](../issues/159-task-extract-checks-from-specs.md) listed every one of them, verbatim, in [research/checks-extraction-a.md](../research/checks-extraction-a.md) to `-f.md` and [research/checks-extraction-shared.md](../research/checks-extraction-shared.md). The decision log, with the triage of every call this spec made, is in the ticket answer.

Evidence is cited as the specs cite it: the Breakpoint service spec's measurements, recorded in [Re-run: Breakpoint service (shared utility) spec under the class rule](../issues/129-rerun-breakpoint-service-class-rule.md), and each component spec's own.

## Problem Statement

A developer's Variant inputs are typed from their own Sass (ADR 0040), so a misspelt colour fails to compile. Four failures stay invisible to the compiler, because the compiled CSS decides them:

- A Variant declaration file that drifted from the compiled CSS: a colour removed from `$button-palette` but still declared, so `color="purple"` compiles and renders a button whose colour class nothing styles.
- A forgotten Library mixin include: without `@include nfs-close-button;` a close button loses its 24 px floor (WCAG 2.2 2.5.8), and nothing says so.
- A class a Sass flag leaves out: `expanded="medium only"` while `$button-responsive-expanded` is off.
- A value cast past its type (`$any()`, a string from a CMS).

A fifth comes from the Breakpoint map: a developer who changed `$breakpoints` in Sass must give `nfsBreakpointsToken` the same values, and a Class breakpoint in `$breakpoint-classes` that the token lacks leaves an Off-canvas `revealOn="xlarge"` closed in JavaScript while Foundation's CSS reveals the panel.

Foundation never had these failures: its JavaScript read the breakpoints out of the compiled CSS, and its consumers wrote the classes by hand. Only a check in the browser that reads the compiled CSS sees them. Without one home for all of them, every directive would read the CSS, word its reports, and decide when to run in its own way, and each would ship its checking code in production bundles.

The specs gave the library such checks, the Runtime checks. On 2026-09-29 the user ruled that every check is specified but planned and implemented in a later milestone: "The reason I include so many different types of check is that I want to analyze how each works in practice and evaluate trade-offs. However, all checks should be deferred to a later milestone because at the core of it, this is an issue Angular should correct, not 3rd-party Angular component libraries." And: "I want to keep the initial milestone simpler and smaller in scope." The first milestone therefore ships a library with no Runtime check: a Variant value that has no class in the compiled CSS renders without its look and nothing reports it, a forgotten Library mixin include is reported by nothing, and Breakpoint drift goes unnoticed. Each first-milestone spec states the rule these checks enforced as documented usage (the Library mixin to include; the token to keep in step with `$breakpoints`).

This spec keeps the whole design, so the later milestone loses nothing, and so the Runtime checks can be weighed in practice against the other four kinds of check the ruling defers (forgotten-import checks, family checks, misuse warnings, and build-time checks), which is why the user specified so many kinds.

## Solution

- Three Runtime checks, configured in the direction of NgRx's `runtimeChecks` (per-check flags over defaults), with a production opt-in NgRx lacks, in the Breakpoint service's entry point `ngx-foundation-sites/media-query`:
  - `strictVariantNames`: a rendered Variant value whose name its Variant property does not list, or a count above its property's count; a value that maps to no class.
  - `strictVariantProperties`: a Library mixin whose listed Variant properties are all missing, that is, a forgotten include.
  - `strictBreakpointSync`: `nfsBreakpointsToken` and the Breakpoint properties disagree, a Class breakpoint is missing from the token, or the `nfs-breakpoint-properties` include is missing (ADR 0005's drift check).
- All three run in development builds unless `provideNfsRuntimeChecks` opts one out, and in production only when `provideNfsProductionRuntimeChecks` lists them, with an optional `report` callback. A production bundle without that call carries none of the checker's code (measured).
- Every library directive whose Variant inputs read a Variant property reports through one handle, `nfsVariantCheck(directive)`: from its own render callback it calls `include()` for its Library mixin and `value()` for each rendered value, with the needs from the same mapping that sets its classes. Twenty specs' directives do (Per component, below).
- Every read and every report happens once per realm, in the browser, after the first render. Nothing runs on the server, and nothing writes the DOM.
- The same configuration holds `strictDirectiveImports` and the `strictParents` flag, which the [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md) specifies.

## User Stories

Each story names the spec that gave it at `53144f3` and its number there.

1. As an application developer who customised `$breakpoints` or `$breakpoint-classes`, I want a development-mode report naming each breakpoint whose TypeScript and Sass values differ, and each Class breakpoint my token lacks, so that I notice drift before users do. (Breakpoint service, 3)
2. As an application developer who forgot the `nfs-breakpoint-properties` include, I want one report that names the include, so that I know exactly which line to add. (Breakpoint service, 4)
3. As an application developer, I want each report to appear once, not on every render or for every Plugin, so that my console stays readable. (Breakpoint service, 5)
4. As an application developer, I want a development-mode report when a Variant value my template renders has no class in my compiled CSS (a name my Sass removed that my Variant declaration file still lists, a responsive form a Sass flag leaves out, or a value cast past its type), so that I notice before a user sees an unstyled element. (Breakpoint service, 44)
5. As an application developer who forgot a Library mixin include, I want one report naming the include, even where no Variant input is bound, so that I know which line to add. (Breakpoint service, 45)
6. As an application developer, I want the Runtime checks on in development with no setup, and each one switched off by one provider (for example in unit tests that do not compile my Sass), so that the default catches drift and the exception costs one line. (Breakpoint service, 46)
7. As an application developer whose Variant values come from runtime data such as a CMS, I want to opt single checks into production with my own report callback, so that I learn about values my CSS has no class for without shipping every check. (Breakpoint service, 47)
8. As an application developer, I want a production bundle that does not opt in to contain none of the checker's code, so that the checks cost nothing where they do not run. (Breakpoint service, 48)
9. As an application developer, I want every report to name its check (`strictVariantNames`, `strictVariantProperties`, `strictBreakpointSync`), so that I know which flag controls it. (Breakpoint service, 49)
10. As an application developer whose `$breakpoint-classes` includes `xlarge`, I want a report when `nfsBreakpointsToken` lacks `xlarge`, so that an Off-canvas `revealOn="xlarge"` does not stay closed in JavaScript while Foundation's CSS reveals the panel. (Breakpoint service, 50)
11. As a library directive author, I want one call that reports my directive's Variant values and Library mixin to the Runtime checks, so that every directive reads the Variant properties, words its reports, and runs its checks the same way. (Breakpoint service, 52)
12. As a library maintainer, I want the Runtime checks never to run on the server and never to write the DOM, so that server HTML, hydration, and event replay are the same with and without them. (Breakpoint service, 54)
13. As an application developer, I want a development report when I bind a colour my compiled CSS has no class for, or forget the `nfs-badge` include, so that drift between my Sass and my types surfaces early. (Badge, 17)
14. As an application developer, I want a development-mode report when a bound Variant value has no class in my compiled CSS (a responsive `expanded` while `$button-responsive-expanded` is off, a colour removed from `$button-palette` but still declared, a missing `nfs-button` include), so that drift between my Variant declaration file and my Sass shows up before release. (Button, 43)
15. As an application developer, I want a development-mode report when a bound group colour or size has no class in my compiled CSS, so that drift between my Variant declaration file and my Sass shows up before release. (Button Group, 29)
16. As an application developer, I want a development-time report when I bind a colour or size my compiled CSS has no class for, or forget the `nfs-callout` include, so that drift between my Sass and my types surfaces early. (Callout, 29)
17. As an application developer, I want a development-time report when I bind a size my compiled CSS has no class for, or forget the `nfs-close-button` include, so that drift between my Sass and my types surfaces early. (Close Button, 27)
18. As an application developer, I want a missing `@include nfs-dropdown-pane;` reported in development, so that I learn that neither the size names nor the 320 px width warning reach my build. (Dropdown, 48)
19. As an application developer, I want a development report when a bound size, offset, block-grid count, or breakpoint has no class in my compiled CSS, or when I forgot the `nfs-flex-grid` include, so that drift between my Sass and my types surfaces early. (Flex Grid, 31)
20. As an application developer, I want a development-mode report when a responsive helper value needs `$flexbox-responsive-breakpoints` and my Sass has it off, so that a class that does not exist is caught before release. (Flexbox Utilities, 24)
21. As an application developer, I want a development-mode report when I forget the `nfs-flexbox-utilities` include, so that the Runtime checks and the Variant declaration file's generator can read my settings. (Flexbox Utilities, 25)
22. As an application developer, I want a development report when a bound size, offset, push, pull, block-grid count, gutter, or breakpoint has no class in my compiled CSS, or when I forgot the `nfs-float-grid` include, so that drift between my Sass and my types surfaces early. (Float Grid, 26)
23. As an application developer, I want a development report when I bind a colour my compiled CSS has no class for, or forget the `nfs-label` include, so that drift between my Sass and my types surfaces early. (Label, 18)
24. As an application developer, I want a development report when I bind `alignment` in a flexbox build, where Foundation styles no `.middle` or `.bottom`, so that a silently lost alignment is caught. (Media Object, 12)
25. As an application developer, I want the report to tell me when I forgot `@include nfs-media-object;`, rather than blaming my build, so that I fix the right thing. (Media Object, 13)
26. As an application developer, I want a Runtime check to report a `revealOn` or `inCanvasOn` breakpoint that my compiled CSS has no class for, or a missing `nfs-breakpoint-properties` include, so that a declaration file that drifted from my Sass does not leave a sidebar hidden without a word. (Off-canvas, 46)
27. As an application developer, I want a development report when I bind a colour my compiled CSS has no class for, or forget the `nfs-progress-bar` include, so that drift between my Sass and my types surfaces early. (Progress Bar, 21)
28. As an application developer, I want a responsive value for a family whose Sass flag is off to be reported in development, naming the flag, so that I do not wonder why nothing changes. (Prototyping Utilities, 20)
29. As an application developer, I want a development report when I bind a name my compiled CSS has no class for, or forget the `nfs-prototype-classes` include, so that drift between my Sass and my types surfaces early. (Prototyping Utilities, 25)
30. As an application developer, I want a development report when my stylesheet lacks `@include nfs-responsive-embed;`, so that the focus rule and the Variant property never go missing silently. (Responsive Embed, 10)
31. As an application developer, I want a bound ratio my compiled CSS has no class for to be reported in development, so that a stale Variant declaration file shows up. (Responsive Embed, 11)
32. As an application developer, I want a development report when I bind a breakpoint my compiled CSS has no class for, or forget `@include nfs-breakpoint-properties;`, so that drift between my Sass and my types surfaces early. (Visibility Classes, 22)
33. As an application developer, I want a development report when a bound size, offset, block-grid count, or breakpoint has no class in my compiled CSS, or when I forgot the `nfs-xy-grid` include, so that drift between my Sass and my types surfaces early. (XY Grid, 32)
34. As the library's maintainer, I want the Runtime checks planned apart from the first milestone, with their whole design kept, so that I can weigh them against the other kinds of check in practice. (This spec, from the ruling)
35. As the author of the later milestone, I want each check with its trigger, message, cost, and tests in one spec, and a list of what each component spec gains back, so that adding the checks is mechanical. (This spec)
36. As an application developer, I want a development report when a rules key names a Class breakpoint my compiled CSS lacks, so that drift between my Sass and my types surfaces early. (Typography Helpers, 5)

## Implementation Decisions

### Milestone and what this spec needs

- Planned and implemented in a later milestone. No first-milestone spec names these checks or links here; each describes, and accepts, a library without them, and states each rule they enforced as documented usage (the ruling, Decision items 1 and 2).
- What the first milestone already ships, which this spec reads and adds no Sass to:
  - The registry Variant properties that every Library mixin of an entry point with an Open Variant family writes, `--nfs-breakpoint-classes` among them: a Library mixin loses its checks and keeps its CSS rules and its Variant properties, because the Variant declaration tooling's generate mode reads them (the ruling, Decision item 4). For the eight families that [Decide: grids, typography, and utilities move to a later milestone](../issues/174-decide-grids-typography-utilities-later-milestone.md) moved to a later milestone (the XY, Float, and Flex Grids, the Typography Helpers, and the Prototyping Utilities, Flexbox Utilities, Visibility Classes, and Float Classes), the registries and Variant properties go with the family (its decision 4): the family's own spec writes them when it lands, and that family's entry under Per component lands no earlier.
  - The one-writer rule of building-blocks 1.13, which the first milestone keeps as a rule on who writes a Variant property; its reason, that a second writer would hide a missing include from `strictVariantProperties`, is this spec's (Shared mechanisms, Writers).
  - The Breakpoint service, `nfsBreakpointsToken`, and `nfsBreakpointForWidth`, and the service's go-live `earlyRead` callback, to which `strictBreakpointSync` is added.
  - The typed Variant inputs and each directive's value-to-class mapping, from which the needs come.
- What another deferred spec holds, on which this spec depends:
  - The presence markers, the `:root` properties that only these checks read, which the [Spec: build-time checks (later milestone)](../issues/163-spec-build-time-checks-later-milestone.md) writes and specifies (its Presence markers, P1 to P5), because the ruling puts "presence markers read only by a check" with the build-time checks: P1 `--nfs-button-responsive-expanded`, P2 `--nfs-flexbox-responsive-breakpoints`, and P4 the sixteen `--nfs-prototype-<flag>-breakpoints`, each a flag-gated family's property written as the empty list while its flag is off; P3 `--nfs-media-object-section`, the one property of two families one flag gates in opposite directions, and the only output of `nfs-media-object`, which exists only in the later milestone; and P5 the Breakpoint properties `--nfs-breakpoint-<name>` that `nfs-breakpoint-properties` writes beside `--nfs-breakpoint-classes`. None is in the Variant manifest, so the generator does not read them. This spec only reads them, and says here nothing of how they are written. The later milestone lands each marker no later than the check that reads it: P1 with the Button's responsive `expanded` request, P2 with the Flexbox Utilities' responsive helpers, P3 with the Media Object section's request and the consumer's new `@include nfs-media-object;`, P4 with the Prototyping Utilities' responsive classes, and P5 with `strictBreakpointSync`.
  - The forgotten-import checks' two keys and the environment initializer that `provideNfsRuntimeChecks()` adds: they extend this spec's configuration ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)). If this spec lands first, it brings the whole configuration (API: configuration, Configuration rules, and The checker); if the forgotten-import checks spec lands first, it brings `NfsRuntimeChecks` with only its two keys, `provideNfsRuntimeChecks` with its environment initializer, and the checker token, and `provideNfsProductionRuntimeChecks` and the three keys here come with this spec (that spec's The two `NfsRuntimeChecks` keys).
  - The misuse warnings' render callback: at `53144f3` most directives held their development-mode warnings and their Runtime check requests in one `afterRenderEffect` read phase, created only when `ngDevMode` is on or the handle is not `null` ([Spec: misuse warnings (later milestone)](../issues/161-spec-misuse-warnings-later-milestone.md)). Landed alone, this spec's requests run in a read phase each directive creates only when its handle is not `null`; landed with the misuse warnings, both share the one read phase, as the specs gave it.
  - Two reports the specs split between kinds so that one mistake makes one report: the Off-canvas panel's development check 7 and the Top Bar's development check 6 report a `revealOn`, `inCanvasOn`, or `stackedFor` that names the Zero breakpoint, so these checks pass `[]` for it. Landed without the misuse warnings, that value is reported by neither kind.

### Foundation contract

There is no Foundation counterpart. Foundation's JavaScript learned the breakpoints from the compiled CSS (the serialised map in `.foundation-mq`'s `font-family`), so it could not drift from the Sass, and its consumers wrote the Variant classes by hand, so no type could promise a class the CSS lacks. The library replaced the handshake with `nfsBreakpointsToken` (ADR 0005) and the classes with typed inputs (ADR 0039, ADR 0040); the Breakpoint properties are the `strictBreakpointSync` check's channel in place of the handshake, and the Variant properties are the Variant checks' (ADR 0012, dated note). One Foundation diagnostic sits nearby and stays Foundation's: its `breakpoint()` warns at compile time when a `$breakpoint-classes` entry is not a key of `$breakpoints`.

### Hierarchy and package shape

```
ngx-foundation-sites/media-query   (the Breakpoint service's entry point, and the Runtime checks' home)
  NfsRuntimeChecks, NfsRuntimeCheckReport
  provideNfsRuntimeChecks(checks?)                         development overrides (an internal value token), nothing in production
  provideNfsProductionRuntimeChecks(checks, {report})      replaces the checker token's factory: the production opt-in
  nfsVariantCheck(directive) -> NfsVariantCheck | null     every library directive whose Variant inputs read a Variant property
  NfsVariantCheck, NfsVariantNeed
  (internal) nfsRuntimeCheckerToken                        root factory: the development checker behind ngDevMode, else null
  NfsMediaQuery's go-live earlyRead callback               runs strictBreakpointSync when a checker exists

every library directive whose Variant inputs read a Variant property (Per component, below)
  field:       readonly #check = nfsVariantCheck('<directive>');   null in a production build without the opt-in
  constructor: when #check is not null, afterRenderEffect({read}): include(...) first, then value(...) per rendered value
```

- The entry point is `ngx-foundation-sites/media-query` (Foundation's utility name, building-blocks 1.3), as at `53144f3`: it exports the Runtime-check API (`NfsRuntimeChecks`, `NfsRuntimeCheckReport`, `provideNfsRuntimeChecks`, `provideNfsProductionRuntimeChecks`, `nfsVariantCheck`, `NfsVariantCheck`, `NfsVariantNeed`), so every entry point with a Variant input imports it too. What such an entry point keeps of it in a production build without the opt-in is the `nfsVariantCheck` call and one injection of a token whose factory returns `null` (measured); `NfsMediaQuery` itself is tree-shaken from an application that never injects it.
- An entry point that imports nothing else from `ngx-foundation-sites/media-query` in the first milestone (the Badge, the Label, the Callout, the Close Button, the Button Group, the Progress Bar, the Responsive Embed) gains that import when this spec lands.
- `strictBreakpointSync` runs inside the Breakpoint service, in its go-live callback, so this spec changes that service's implementation: the callback runs the drift check "when a Runtime checker exists".

### API: configuration

The library's Runtime checks (ADR 0040) live in the Breakpoint service's entry point, beside the breakpoint drift check they grew from. There are three, configured in the direction of NgRx's `runtimeChecks` (per-check flags over defaults), with this library's own production opt-in, which NgRx lacks. The same interface holds `strictDirectiveImports`, the fourth Runtime check, and the `strictParents` flag, which the [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md) specifies; they are shown here as the specs gave the interface at `53144f3`:

```ts
export interface NfsRuntimeChecks {
  /** A rendered Variant value the compiled CSS has no class for (not in its --nfs-<setting> list), a value that is not one class token, or a Breakpoint query or rules key that cannot be parsed. */
  strictVariantNames: boolean;
  /** Variant properties missing from :root: a Library mixin include was forgotten. */
  strictVariantProperties: boolean;
  /** nfsBreakpointsToken and the Breakpoint properties disagree, or a Class breakpoint is missing from the token (ADR 0005's drift check). */
  strictBreakpointSync: boolean;
  /** A rendered element carrying a library directive's attribute with no library directive on it, or on an element no selector of that directive admits. Development builds only. (The forgotten-import checks spec.) */
  strictDirectiveImports: boolean;
  /** Off by default. In development builds, a part whose optional parent injection found nothing throws at construction. A flag, not a Runtime check; development builds only. (The forgotten-import checks spec.) */
  strictParents: boolean;
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

/** Development overrides: every check but strictParents is on without this provider; it also starts strictDirectiveImports when no library directive runs; returns no providers when ngDevMode is false. */
export function provideNfsRuntimeChecks(checks?: Partial<NfsRuntimeChecks>): EnvironmentProviders;

/** Production opt-in, per check; all off unless listed; the only production code path that references the checker. */
export function provideNfsProductionRuntimeChecks(
  checks: Partial<Omit<NfsRuntimeChecks, 'strictDirectiveImports' | 'strictParents'>>,
  options?: {report?: (report: NfsRuntimeCheckReport) => void},
): EnvironmentProviders;
```

| Check | Reports | Reads | Runs in | Development build | Production build |
| --- | --- | --- | --- | --- | --- |
| `strictVariantNames` | A rendered Variant value whose name its property does not list, or a count above its property's count; a value that maps to no class | The `--nfs-<setting>` of each need a directive reports | Each directive's render callback, through `nfsVariantCheck` | On; `provideNfsRuntimeChecks({strictVariantNames: false})` opts out | Off; `provideNfsProductionRuntimeChecks({strictVariantNames: true})` opts in |
| `strictVariantProperties` | A Library mixin whose listed properties are all missing | The properties a directive names in `include()` | The same | Same form | Same form |
| `strictBreakpointSync` | Breakpoint map drift, a Class breakpoint the token lacks, a missing `nfs-breakpoint-properties` include | `--nfs-breakpoint-<name>`, `--nfs-breakpoint-classes` | The service's go-live callback | Same form | Same form |

The forgotten-import checks spec gives the rows of `strictDirectiveImports` (development only, never in production) and `strictParents` (a flag, off by default, never in production).

### Configuration rules

- Defaults: with no provider, a development build runs every Runtime check and reports through `console.warn`, each message prefixed with its check's name ("ngx-foundation-sites [strictVariantNames]: ..."), and `strictParents` is off. A production build runs none.
- `provideNfsRuntimeChecks(checks)` switches single checks off, or back on, in development builds. In production builds it returns no providers (the shape of Angular's own `provideCheckNoChangesConfig`), so an application that calls it in its shared configuration ships nothing for it. Its argument is optional; the forgotten-import checks spec adds the environment initializer that `provideNfsRuntimeChecks()` then provides.
- `provideNfsProductionRuntimeChecks(checks, options)` runs only the listed checks in production builds and sends their reports to `options.report`, or to `console.warn` when there is none. Each function affects only its own kind of build: in a development build the production call changes nothing, so development reports always go to the console, and the `report` path is tested on a production build (Testing Decisions, e2e).
- Both are provided at application level only, like `nfsBreakpointsToken`: the checker is a root singleton, so a route or element provider is never read.

### The checker, and what keeps production bundles clean

- An internal root token holds the checker. Its factory returns the development checker behind `typeof ngDevMode === 'undefined' || ngDevMode`, and `null` otherwise; the development checker reads its overrides from an internal value token that only `provideNfsRuntimeChecks` provides. `provideNfsProductionRuntimeChecks` replaces the token's factory. Nothing else constructs the checker, so when the Angular CLI defines `ngDevMode` as `false` (script optimization on) and the production call is absent, the checker's code is removed.
- Cost, measured under `@angular/build:application` 22.2.0 with an ng-packagr 22.2.0 library resolved through its package `exports` (the Breakpoint service re-run's decision log): no checker code in the production bundle, and 62 bytes more for an application that only calls `provideNfsRuntimeChecks`; with the production call, 3,976 bytes more minified (about 1.2 kB transferred), which includes Angular's `afterRenderEffect` for an application that used none.
- In the browser only, after the first render: every read is in a render callback (`afterRenderEffect` or `afterNextRender`), both of which Angular makes a no-op on the server. The server has no computed style, so the server HTML carries whatever class a value produced, unchecked (building-blocks 1.11 decision 3).
- The checks write no DOM and add no listener, so hydration, event replay, and `@defer` behave the same with and without them. A directive inside a `hydrate never` block is never checked, because it never runs on the client; one inside a `hydrate on ...` block is checked when the block hydrates.
- Once per realm: each property is read once per JavaScript realm (a module-level cache), and each report is made once per realm per check and distinct subject: the directive, input, and failing name or value for `strictVariantNames`; the Library mixin for `strictVariantProperties`; the whole comparison for `strictBreakpointSync`. Reason, as for the first drift check: consumer unit tests that do not compile the Sass would otherwise report in every test; per realm is one report per test file, and a consumer can also switch the checks off in its test setup (Usage examples). Limit, stated in the docs: a stylesheet added or hot-replaced after a property's first read is seen after the next page load.
- A `report` callback that throws is handed to Angular's `ErrorHandler` like any render-callback error (the after-render manager catches it), and the other checks go on.

### The Variant check: `nfsVariantCheck()`

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

- `directive` is the selector name a consumer writes (`nfsButton`); every report names it. A utility directive that any of several Utility attributes creates passes the camelCase of its class (`nfsPrototypeSpacing`), and each `value()` names the attribute as its input (ADR 0044: "A Runtime-check handle of a directive that several attributes create is named after the directive class").
- A directive calls `nfsVariantCheck` once, at construction, and uses the handle only in a render callback of its own (an `afterRenderEffect` read phase that reads its Variant inputs), which it creates only when the handle is not `null`. A production build without the opt-in therefore keeps the call site and runs nothing.
- In that callback the directive calls `include()` first, on every run, whether or not a Variant input is bound (the Close Button's presence request for its 2.5.8 floor), then `value()` once per Variant input that has a value. Repeated calls cost a cache lookup, because reads and reports happen once per realm. A directive whose Variant property is read only for a value that may stay unbound, and whose own mixin holds nothing it needs, calls `include()` only while that value is bound (Off-canvas `revealOn` and `inCanvasOn`, Top Bar `stackedFor`), so an application that binds none is not asked for the include.
- `include(mixin, settings)`: when every listed property reads empty, `strictVariantProperties` reports once per mixin (message R1). `setting` is the first listed setting and `names` lists them all. A directive lists only properties its mixin never leaves empty on Foundation's defaults, never a flag-gated one, because an empty property and a missing one both read as the empty string (a property shared by two families that one flag gates in opposite directions is never empty while its mixin is included and may be listed: the Media Object section lists `media-object-section` for `nfs-media-object`) (ADR 0040, dated note; measured again in the Breakpoint service re-run): the Button lists `button-palette` and `button-sizes` for `nfs-button`, the Close Button `closebutton-size` for `nfs-close-button`, the Menu `breakpoint-classes` for `nfs-breakpoint-properties`. A directive that reads the properties of two mixins calls `include()` for each (a grid cell: its grid's mixin and `nfs-breakpoint-properties`). A property that two mixins write (`--nfs-foundation-palette`, written by `nfs-callout` and `nfs-progress-bar`) reports only when both are missing.
- `value(input, value, needs)`: `needs` comes from the same mapping that sets the directive's classes, so the check and the class always agree. `null` (a cast or `$any()` value that is not one class token, a Breakpoint query that cannot be parsed, a rules object with a key that is not a name) reports once under `strictVariantNames` that the value binds no class (R3). Each need is then compared with its property: a name the property does not list, or a number above its count, reports once under `strictVariantNames`, naming the directive, the input, the value, the setting, and the listed names (R2).
- A need whose property an `include()` found missing is skipped, so a missing include makes one report, not one per value. Any other property that reads empty is an empty list: a flag-gated family while its flag is off, so the Button's `expanded="medium only"` against an empty `--nfs-button-responsive-expanded` reports, naming `$button-responsive-expanded`.
- `needs` returns `[]` for a value whose class always exists: no value, `false`, `'default'`, a boolean modifier, a closed name, or a Zero-breakpoint query that maps to an always-generated class (Button `expanded="small"` sets `.expanded`).
- The property format is the Variant property format of the [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md), which its generator reads from the compiled CSS text. The checker trims the computed value, splits names on whitespace and commas (Sass prints `map-keys()` as a comma list), reads a count as one whole number, and takes an empty value as an empty list, or, for a property an `include()` lists, as missing.
- A directive whose Variant families are all closed reads no Variant property and needs no call (Tabs); it may still call `value()` to report a value that maps to no class.

### `strictBreakpointSync`, the drift check

It runs once per realm in the Breakpoint service's go-live `earlyRead` callback, so only in applications that construct the service. From `getComputedStyle(documentElement)` it reads:

1. `--nfs-breakpoint-<name>` for each name of the Breakpoint map, trimmed and parsed as `px` (unregistered custom properties compute to their specified text, for example `640px`);
2. `--nfs-breakpoint-classes`, the Class breakpoints;
3. `--nfs-breakpoint-<name>` for each Class breakpoint the map lacks.

Outcomes, in one report:

- Every map property is empty: message R4, naming the include.
- Some differ, some are missing, or a Class breakpoint is missing from the token: one report listing each name with both values (R5). `setting` is `breakpoints` and `names` lists the names that disagree.
- All match within 0.01 px: nothing.
- A missing `--nfs-breakpoint-classes` beside present map properties (a hand-written block, or library Sass older than the list) adds nothing here; a directive that reads the list reports it through `include()`.
- Limit, stated in the docs and narrowed by the class list: a breakpoint that exists only in Sass and is not a Class breakpoint is not detected, because computed style cannot list custom properties by prefix; any Plugin Option that names it gets the service's unknown-name warning instead.
- An application that never constructs the service runs no breakpoint sync. Its directives with responsive Variant inputs use only the token's Zero breakpoint name, so a Zero breakpoint renamed in Sass but not in the token goes unreported there; the docs say to rename both together.
- Going live: the service's constructor registers `afterNextRender({earlyRead})` without a view; the `earlyRead` callback creates the lists, sets `current`, `reducedMotion`, and every `matches()` signal requested so far, attaches the listeners, and, when a Runtime checker exists, runs `strictBreakpointSync`.

### What stays outside the Runtime checks

The Breakpoint service's own development diagnostics are not Runtime checks: the warning for an unknown breakpoint name or modifier in `atLeast`, `upTo`, `is`, `resolve`, or a named-query token; the warnings for invalid Breakpoint rule tokens; and the error for an invalid Breakpoint map or Server breakpoint at construction. They report misuse of the service's API, not drift between TypeScript and the compiled CSS, read no CSS, and stay development-only behind `ngDevMode` with no switch (the Breakpoint service spec's D33). They are the misuse warnings' kind, so this spec does not hold them.

### Messages

Every message starts with `ngx-foundation-sites` and the check's name in brackets. The specs give the verbatim texts below as examples; where they give only what a report says, this spec gives that and invents no text.

| Id | Check | When | Text, or what it says |
| --- | --- | --- | --- |
| R1 | `strictVariantProperties` | An `include()` finds every listed property empty | For the Button: "ngx-foundation-sites [strictVariantProperties]: nfsButton found none of --nfs-button-palette, --nfs-button-sizes on :root. Add `@include nfs-button;` after its Foundation export mixin in the stylesheet that compiles Foundation, or switch this check off with provideNfsRuntimeChecks({strictVariantProperties: false})." `setting` is the first listed setting; `names` lists them all |
| R2 | `strictVariantNames` | A need's name the property does not list, or a number above its count | For the Button: "ngx-foundation-sites [strictVariantNames]: nfsButton color "purple" has no class in the compiled CSS: $button-palette generates primary secondary success warning alert. Add it to $button-palette, or regenerate the Variant declaration file if it still lists purple." For the Media Object section: "ngx-foundation-sites [strictVariantNames]: nfsMediaObjectSection alignment "middle" has no class in the compiled CSS: $media-object-section generates main-section". The report carries `directive`, `input`, `value`, `setting`, and `names` |
| R3 | `strictVariantNames` | A `null` need: a value that maps to no class | That the value binds no class, once; the specs give no verbatim text |
| R4 | `strictBreakpointSync` | Every map property is empty | "ngx-foundation-sites [strictBreakpointSync]: no --nfs-breakpoint-* custom properties were found on :root. Add `@include nfs-breakpoint-properties;` after `@import 'ngx-foundation-sites';` in the stylesheet that compiles Foundation, so this check can compare nfsBreakpointsToken with your Sass $breakpoints." |
| R5 | `strictBreakpointSync` | Values differ, some are missing, or a Class breakpoint is missing from the token | For example "ngx-foundation-sites [strictBreakpointSync]: nfsBreakpointsToken and your Sass $breakpoints disagree: medium is 640px in the token and 768px in --nfs-breakpoint-medium; xxlarge is missing from the CSS; xlarge is a Class breakpoint in --nfs-breakpoint-classes (1200px) but missing from the token. Provide nfsBreakpointsToken with the values of your Sass $breakpoints (in px)." `setting` is `breakpoints`; `names` lists the names that disagree |

### Per component: each directive's requests

Twenty component specs gave their directives Runtime check requests. Each entry below copies its spec's text at `53144f3`; the only changes are the pointers that named the Breakpoint service spec or ADR 0040 as the home of "the report shape, the per-realm read, and the configuration", which are this spec's sections above.

#### Shared mechanisms

Said once here; each component entry names the ones it uses.

- The handle. Each directive creates its handle once, at construction, with its selector name (`nfsVariantCheck('nfsBadge')`), or with the camelCase of its class where several attributes create one instance (the Prototyping Utilities, ADR 0044). An Off-canvas panel passes the name of the selector that matched (`'nfsOffCanvas'` or `'nfsOffCanvasAbsolute'`).
- The render callback. The requests run in an `afterRenderEffect` read phase the directive creates only when its handle is not `null`; at `53144f3` most directives shared that read phase with their development-mode warnings, created "only when `ngDevMode` is on or the Variant check handle is not `null` (never on the server, and in a production build only under the Runtime checks' opt-in)" (Milestone and what this spec needs). Two directives keep a read callback of their own for the requests: the Dropdown pane ("one more `afterRenderEffect`") and the Responsive Embed ("its own `afterRenderEffect` read callback").
- Presence request, rule Q1, on every run whether or not a value is bound, because the directive's own mixin holds a rule or a check every instance needs: the Badge, the Label, the Button, the Button Group (naming `nfs-button`), the Callout, the Close Button, the Dropdown pane, the Progress Bar, the Responsive Embed, and the Prototyping Utilities.
- Presence request, rule Q2, only while a value that reads a property is bound, because the mixin holds nothing the directive needs otherwise: the Off-canvas panel, the Top Bar, the Menu, the Visibility Classes, the Typography Helpers' `NfsTextAlignment`, the Media Object section, the three grids, and the Flexbox Utilities.
- Needs, from the same mapping that sets the classes:
  - N1, a one-token name: `{setting, name}` for a value that is one class token, `null` otherwise: the Badge, the Label, the Callout, the Close Button, the Dropdown pane, the Progress Bar, the Responsive Embed, the Button, and the Button Group.
  - N2, a Class breakpoint: `{setting: 'breakpoint-classes', name: bp}` for each breakpoint above the Zero breakpoint, and `[]` for the Zero breakpoint, whose class always exists, with the exceptions each entry names (the XY Grid's Zero-breakpoint collapse, the Flexbox Utilities' `order`): the Off-canvas panel, the Top Bar, the Menu, the Visibility Classes, the Typography Helpers, the three grids, and the Flexbox Utilities.
  - N3, a count: a size `n` needs `n`, an offset (and a Float Grid push or pull) `n` needs `n + 1`, and a block grid `up` count `n` needs `n`: the three grids.
  - N4, a flag-gated family: a need on a property written as the empty list while its flag is off, so a responsive value is reported naming the flag: the Button (`$button-responsive-expanded`, P1), the Flexbox Utilities (`$flexbox-responsive-breakpoints`, P2), and the Prototyping Utilities (`$prototype-<flag>-breakpoints`, P4); the Media Object section reads one property that one flag writes in opposite directions (P3). The P numbers are the build-time checks spec's presence markers, which that spec writes.
- Writers (ADR 0040, dated notes; building-blocks 1.13). Each Variant property has one writer, so a directive decides its own mixin's absence from a property only that mixin writes. Three exceptions: `nfs-callout` and `nfs-progress-bar` both write `--nfs-foundation-palette`, so a missing `nfs-progress-bar` is reported only while `nfs-callout` is missing too; the Float Grid's and the Flex Grid's mixins both write `--nfs-grid-column-count` and `--nfs-block-grid-max`, so each grid's missing mixin is reported only while the other's is missing too; and a family over another entry point's settings reads that entry point's properties and writes none (the Button Group reads `nfs-button`'s).
- An emptied map. A consumer whose map leaves a property empty (an empty `$badge-palette` or `$label-palette`, a `$responsive-embed-ratios` with only `default`, a Callout without sizes, an emptied `$dropdown-sizes`) gets a `strictVariantProperties` report and opts that check out.
- The class guard. Every directive's class mapping binds nothing for a value that is not one class token (or a query or rules key it cannot parse); under the closed types only a cast or `$any()` reaches that guard, and the Variant check reports it (R3).

| Spec | Directive | Handle | `include()` | Rule | `value()` inputs | Properties read |
| --- | --- | --- | --- | --- | --- | --- |
| Badge | `NfsBadge` | `nfsBadge` | `('nfs-badge', ['badge-palette'])` | Q1 | `color` | `--nfs-badge-palette` |
| Button | `NfsButton` | `nfsButton` | `('nfs-button', ['button-palette', 'button-sizes'])` | Q1 | `color`, `size`, responsive `expanded` | `--nfs-button-palette`, `--nfs-button-sizes`, `--nfs-button-responsive-expanded` |
| Button Group | `NfsButtonGroup` | `nfsButtonGroup` | `('nfs-button', ['button-palette', 'button-sizes'])` | Q1 | `color`, `size` | `--nfs-button-palette`, `--nfs-button-sizes` |
| Callout | `NfsCallout` | `nfsCallout` | `('nfs-callout', ['callout-sizes'])` | Q1 | `color`, `size` | `--nfs-foundation-palette`, `--nfs-callout-sizes` |
| Close Button | `NfsCloseButton` | `nfsCloseButton` | `('nfs-close-button', ['closebutton-size'])` | Q1 | `size` | `--nfs-closebutton-size` |
| Dropdown | `NfsDropdownPane` | `nfsDropdownPane` | `('nfs-dropdown-pane', ['dropdown-sizes'])` | Q1 | `size` | `--nfs-dropdown-sizes` |
| Flex Grid | `NfsColumn`, `NfsRow` | `nfsColumn`, `nfsRow` | `('nfs-flex-grid', ['grid-column-count'])` or `['block-grid-max']`; `('nfs-breakpoint-properties', ['breakpoint-classes'])` | Q2 | `size`, `offset`, `up`, and the responsive keys | `--nfs-grid-column-count`, `--nfs-block-grid-max`, `--nfs-breakpoint-classes` |
| Flexbox Utilities | `NfsFlexContainer`, `NfsFlexChild` | `nfsFlexContainer`, `nfsFlexChild` | `('nfs-flexbox-utilities', ['flex-source-ordering-count'])`; `('nfs-breakpoint-properties', ['breakpoint-classes'])` | Q2 | `order`, `nfsFlexChild`, `direction`, `nfsFlexContainer` | `--nfs-flex-source-ordering-count`, `--nfs-flexbox-responsive-breakpoints`, `--nfs-breakpoint-classes` |
| Float Grid | `NfsColumn`, `NfsRow` | `nfsColumn`, `nfsRow` | `('nfs-float-grid', ['grid-column-count'])` or `['block-grid-max']`; `('nfs-breakpoint-properties', ['breakpoint-classes'])` | Q2 | `size`, `offset`, `push`, `pull`, `up`, `gutter`, and the rules keys | `--nfs-grid-column-count`, `--nfs-block-grid-max`, `--nfs-grid-column-gutter`, `--nfs-breakpoint-classes` |
| Label | `NfsLabel` | `nfsLabel` | `('nfs-label', ['label-palette'])` | Q1 | `color` | `--nfs-label-palette` |
| Media Object | `NfsMediaObjectSection` | `nfsMediaObjectSection` | `('nfs-media-object', ['media-object-section'])` | Q2 | `alignment`, `mainSection` | `--nfs-media-object-section` |
| Menu | `NfsMenu` | `nfsMenu` | `('nfs-breakpoint-properties', ['breakpoint-classes'])` | Q2 | `orientation`, `expanded` | `--nfs-breakpoint-classes` |
| Off-canvas | the panel | `nfsOffCanvas` or `nfsOffCanvasAbsolute` | `('nfs-breakpoint-properties', ['breakpoint-classes'])` | Q2 | `revealOn`, `inCanvasOn` | `--nfs-breakpoint-classes` |
| Progress Bar | `NfsProgress`, `NfsProgressElement` | `nfsProgress`, `nfsProgressElement` | `('nfs-progress-bar', ['foundation-palette'])` | Q1 | `color` | `--nfs-foundation-palette` |
| Prototyping Utilities | every directive of the family | the camelCase of its class (`nfsPrototypeSpacing`) | `('nfs-prototype-classes', ['prototype-spacers-count', <its own registry settings>])` | Q1 | each bound attribute | the ten registry properties and the sixteen flag properties |
| Responsive Embed | `NfsResponsiveEmbed` | `nfsResponsiveEmbed` | `('nfs-responsive-embed', ['responsive-embed-ratios'])` | Q1 | `ratio` | `--nfs-responsive-embed-ratios` |
| Top Bar | `NfsTopBar` | `nfsTopBar` | `('nfs-breakpoint-properties', ['breakpoint-classes'])` | Q2 | `stackedFor` | `--nfs-breakpoint-classes` |
| Typography Helpers | `NfsTextAlignment` | `nfsTextAlign` | `('nfs-breakpoint-properties', ['breakpoint-classes'])` | Q2 | `nfsTextAlign` | `--nfs-breakpoint-classes` |
| Visibility Classes | `NfsVisibility` | `nfsVisibility` | `('nfs-breakpoint-properties', ['breakpoint-classes'])` | Q2 | `showFor`, `hideFor` | `--nfs-breakpoint-classes` |
| XY Grid | `NfsCell`, `NfsGridX`, `NfsGridY` | `nfsCell`, `nfsGridX`, `nfsGridY` | `('nfs-xy-grid', ['grid-columns'])` or `['xy-block-grid-max']`; `('nfs-breakpoint-properties', ['breakpoint-classes'])` | Q2 | `size`, `offset`, `up`, and the responsive keys | `--nfs-grid-columns`, `--nfs-xy-block-grid-max`, `--nfs-breakpoint-classes` |

Directives that host another's inputs report through it: the Accordion Menu, Dropdown Menu, Drilldown, and Responsive Menu roots and the Nested menu's submenus host `NfsMenu`, whose requests are the Menu's.

#### Badge

[Spec: Badge](../issues/93-spec-badge.md). Mechanisms: Q1, N1.

- Handle: the Runtime checks' `nfsVariantCheck('nfsBadge')` handle of `ngx-foundation-sites/media-query`.
- Request: in the directive's one `afterRenderEffect` read phase, on every run, `NfsBadge` calls `include('nfs-badge', ['badge-palette'])` whether or not `color` is bound, then `value('color', color, needs)` with the need `{setting: 'badge-palette', name: color}` for a one-token value and `null` otherwise (D11). `strictVariantNames` compares a bound `color` with `--nfs-badge-palette` and reports a value that is not one class token; `strictVariantProperties` reports a missing `@include nfs-badge;` when that property reads empty. Only `nfs-badge` writes it, so the one-writer rule holds.
- D11: the Runtime check, `include('nfs-badge', ['badge-palette'])` on every run and `value()` for a bound colour; `--nfs-badge-palette` has one writer. Why: the include carries the contrast check and the pick correction, so a missing one is worth reporting where no `color` is bound; `$badge-palette` is the Badge's own setting, so no second mixin writes its property. Not taken: reading `--nfs-foundation-palette` (another entry point's property, and not the setting the classes loop over) (`other`).
- Missing include (Sass item 5): the Variant property is absent, which the `strictVariantProperties` Runtime check reports in development, naming the include (D11). An empty `$badge-palette` writes the property empty (Sass item 6); such a consumer opts `strictVariantProperties` out.
- User story 13 above.

#### Breakpoint service

[Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md). The home of the configuration, of `nfsVariantCheck`, and of `strictBreakpointSync` at `53144f3`: its whole Runtime checks section (lines 347 to 460 there) is API: configuration, Configuration rules, The checker, The Variant check, `strictBreakpointSync`, and What stays outside above, copied in full. Its other text on the checks, as it stood:

- Problem Statement: "A developer who customises Foundation's `$breakpoints` in Sass has to repeat the values for JavaScript, and nothing tells them when the two drift apart."; the bullet on what the compiler cannot see (this spec's Problem Statement); and "library authors need ... one place every directive with a Variant input reports to".
- CSS class mapping: the custom properties read (not classes), `--nfs-breakpoint-<name>`, `--nfs-breakpoint-classes`, and each `--nfs-<setting>` a directive reports, owned by the Runtime checks, "in the browser only, after the first render, once per property per realm"; and `--nfs-breakpoint-classes`, written by `nfs-breakpoint-properties`, "read by `strictVariantNames` for every responsive Variant input, by `strictBreakpointSync`, and by the Variant declaration tooling".
- Hierarchy and DI shape: the Runtime checks block (Hierarchy and package shape above); the service's `uses` list names "the Runtime checker (strictBreakpointSync)"; the entry point's two provider functions configure the Runtime checks, not the map, "and are two rather than one umbrella `provideNfs()` (ADR 0040; building-blocks 1.9)".
- API, the two breakpoint types: `NfsClassBreakpoint` is "Checked by" "the compiler; `strictVariantNames` against `--nfs-breakpoint-classes`; `strictBreakpointSync` for a Class breakpoint the map lacks", and `NfsBreakpointName` by "the service's development warning for an unknown name (at run time)"; "Every Class breakpoint must be a breakpoint of the map: Foundation's settings say so, its `breakpoint()` warns at compile time otherwise, and `strictBreakpointSync` reports a Class breakpoint `nfsBreakpointsToken` lacks."
- API, the consumer table: the Off-canvas row's `revealOn`, `inCanvasOn` "both reported through `nfsVariantCheck` while bound, the Zero breakpoint setting no class", and the last row, "Every directive whose Variant inputs read a Variant property", which is Shared mechanisms above.
- Implementation level: going live runs `strictBreakpointSync` when a Runtime checker exists (`strictBreakpointSync` above).
- WCAG 2.2 AA: "The Runtime checks report to the console or to the consumer's callback, never to the page, so they add no criterion"; the Sass inputs are "emitted as the Breakpoint properties and `--nfs-breakpoint-classes` for the Runtime checks".
- Rendered output: the Breakpoint properties and the Class breakpoints on `:root` (P5 of the build-time checks spec, and the first milestone's `--nfs-breakpoint-classes`), and "Nothing from the Runtime checks".
- Rendering modes: "The Runtime checks read computed style only in render callbacks and write nothing, so they run neither on the server nor before hydration"; in `hydrate never` "The Runtime checks never run there".
- Testing Decisions: its intro's reports and production-bundle contents; "The Storybook preview stylesheet includes `nfs-breakpoint-properties` and every other Library mixin, so no story makes a Runtime check report"; the `media-query--custom-breakpoint-map` story's "matching Breakpoint properties style block (custom properties only; `--nfs-breakpoint-classes` comes from the preview stylesheet)", which keeps the drift check silent under its custom map (Testing Decisions, layer 1).
- Sass items 1 to 3 and 5, on the `--nfs-breakpoint-<name>` output and what breaks without the include: the build-time checks spec's P5 for the writing side; item 5's "in development `strictBreakpointSync` makes the one report that names the include and cannot compare the token with the Sass, `strictVariantProperties` reports the missing `--nfs-breakpoint-classes` for every directive with a responsive Variant input" is this spec's.

User stories 1 to 12 above.

#### Button

[Spec: Button](../issues/37-spec-button.md). Mechanisms: Q1, N1, N4.

- Handle: in development builds or under a production opt-in, the Runtime checks' Variant check (optional).
- Request: `NfsButton` creates the handle `nfsVariantCheck('nfsButton')` (development builds, and production only when the consumer lists the checks in `provideNfsProductionRuntimeChecks`) and, in its `afterRenderEffect` read phase, calls `include('nfs-button', ['button-palette', 'button-sizes'])` on every run, never the flag-gated `button-responsive-expanded`, then `value()` for each bound `color`, `size`, and responsive `expanded`. `strictVariantNames` compares `color`, `size`, and the Breakpoint of a responsive `expanded` with `--nfs-button-palette`, `--nfs-button-sizes`, and `--nfs-button-responsive-expanded`, and reports any value that is not one class token or a query it cannot parse. A responsive `expanded` value (every query except the Zero breakpoint's `up` form, which sets `.expanded`) whose Breakpoint `--nfs-button-responsive-expanded` does not list is reported naming `$button-responsive-expanded`, since that list is empty while the flag is off. `strictVariantProperties` reports a missing `@include nfs-button;` when `--nfs-button-palette` and `--nfs-button-sizes` both read empty, never from the gated property, which is empty by default (D19).
- Render hook: the only render hook is one `afterRenderEffect` read phase, created only in development builds or when the consumer opts the Variant check into production; it carries the Variant check report and, in development only, the link, arrow, and copied-class warnings.
- Before hydration: its only DOM reads are the dev-mode checks and the Variant check in `afterRenderEffect`, which never run on the server; the Variant check reads computed style, which the server does not have, so the server HTML carries whatever class a value produced.
- D19 (the Runtime-check part): an empty property and a missing one both read as the empty string (measured in Chromium 153, Firefox 155, and WebKit 26.6), so the missing-include report reads `--nfs-button-palette` and `--nfs-button-sizes`, never the gated property. Not taken: encoding the flag in a registry, so the query form fails to compile while the flag is off (ADR 0040 leaves flag-gated classes to the Runtime check); no property for the gated family (the check could not tell a responsive value from a missing flag).
- Missing include (Sass item 5): no Variant properties exist, so the declaration-file generator finds no Button names and the development Runtime check reports the missing include.
- Stories: the responsive forms stay out of stories: the preview settings leave `$button-responsive-expanded` off, as Foundation does, so their classes are not generated and the development Variant check would report them; layer 2 covers their mapping.
- User story 14 above.

#### Button Group

[Spec: Button Group](../issues/82-spec-button-group.md). Mechanisms: Q1, N1, Writers.

- Handle: in development builds, and in production only under the opt-in, the Runtime checks' Variant check (optional).
- Request: `NfsButtonGroup` creates the handle `nfsVariantCheck('nfsButtonGroup')` (development builds, and production only when the consumer lists the checks in `provideNfsProductionRuntimeChecks`) and, in its read phase, calls `include('nfs-button', ['button-palette', 'button-sizes'])` on every run, naming `nfs-button`, the one writer of both properties (D11), then `value()` for a bound `color` and `size`. `strictVariantNames` compares them with `--nfs-button-palette` and `--nfs-button-sizes`; `strictVariantProperties` reports a missing `@include nfs-button;` when both read empty, because `nfs-button` is the one writer of both properties (D11).
- Render hook: the only render hook is one `afterRenderEffect` read phase, created only in development builds or when the consumer opts the Variant check into production; it carries the Variant check report and, in development only, the five warnings.
- `@defer`: inside a dehydrated block, and inside `@defer (hydrate never)`, the development checks and the Variant check do not run.
- D11: `nfs-button-group` writes no Variant property; the group's `color` and `size` are checked against `--nfs-button-palette` and `--nfs-button-sizes`, which `nfs-button` alone writes. Why: a Variant property needs one writer: an empty property and a missing one read the same, so a second writer of the same list would keep the properties present when `nfs-button` is missing and hide that include from `strictVariantProperties`; a group is always used with `nfsButton`, so `nfs-button` is always there to write them. Not taken: writing both properties again, as a literal reading of building-blocks 1.13 would have it (duplicate CSS that hides a missing `nfs-button`).
- Missing include (Sass item 5): a missing `nfs-button-group` is reported by no Runtime check, because the properties the group reads are `nfs-button`'s.
- Prior art for its tests: the Button's layers, whose Variant check cases this spec follows.
- User story 15 above.

#### Callout

[Spec: Callout](../issues/89-spec-callout.md). Mechanisms: Q1, N1, Writers.

- Handle: the Runtime check hook of `ngx-foundation-sites/media-query`, which every directive with a Variant input uses.
- Request: `NfsCallout` creates the handle `nfsVariantCheck('nfsCallout')` and, from its first render on, calls `include('nfs-callout', ['callout-sizes'])` on every run whether or not an input is bound, then `value()` for a bound `color` (need on `foundation-palette`) and `size` (need on `callout-sizes`) (D12). `strictVariantNames` compares a bound `color` with `--nfs-foundation-palette` and a bound `size` with `--nfs-callout-sizes` (`'default'` is never compared), and reports a value that is not one class token. `strictVariantProperties` reports a missing `@include nfs-callout;` when `--nfs-callout-sizes` reads empty. That property, and not `--nfs-foundation-palette`, decides, because `nfs-progress-bar` also writes the palette property, so its presence says nothing about `nfs-callout`.
- Before hydration: the development check and the Runtime check request run in a render callback, never on the server.
- D12: the Runtime check, names for bound values, and a presence request for `callout-sizes` from the first render on, whether or not an input is bound. Why: the include carries the contrast checks and the 1.4.12 rule, so a missing include is an accessibility gap worth reporting even where no input is bound (the Close Button's D10); `--nfs-callout-sizes` is the property only `nfs-callout` writes. Not taken: deciding from `--nfs-foundation-palette` (`nfs-progress-bar` writes it too); requesting only when an input is bound.
- Missing include (Sass item 5): the Variant properties are absent, which the `strictVariantProperties` Runtime check reports in development, naming the include (D12).
- The Breakpoint service spec's usage example of a library directive reporting to the Variant check is the Callout's (Usage examples, below).
- User story 16 above.

#### Close Button

[Spec: Close Button](../issues/83-spec-close-button.md). Mechanisms: Q1, N1.

- Handle: the Runtime check hook of `ngx-foundation-sites/media-query`, which every directive with a Variant input uses.
- Request: `NfsCloseButton` creates the handle `nfsVariantCheck('nfsCloseButton')` and, from its first render on, calls `include('nfs-close-button', ['closebutton-size'])` on every run whether or not `size` is bound, then `value('size', ...)` for a bound size (D10). `strictVariantNames` reports a bound size that `--nfs-closebutton-size` does not list, which only a cast or `$any()` can reach. `strictVariantProperties` reports a missing `--nfs-closebutton-size` and names `@include nfs-close-button;`, whose absence also removes the 2.5.8 floor.
- Before hydration: the development checks and the Runtime check request run in a render callback, never on the server.
- D10: the directive requests `closebutton-size` from the Runtime check from its first render on, bound or not. Why: the Variant property is also the only run-time evidence that the include carrying the 2.5.8 floor is present. Not taken: requesting only when `size` is bound (a missing include would go unreported wherever the default size is used).
- Missing include (Sass item 5): the Variant property is absent, which the `strictVariantProperties` Runtime check reports in development, naming the include (D10). The Reveal's Sass item 5 names this report for a close button inside a dialog.
- User story 17 above.

#### Dropdown

[Spec: Dropdown](../issues/26-spec-dropdown.md). Mechanisms: Q1, N1.

- Handle: `nfsVariantCheck('nfsDropdownPane')`, called once at construction.
- Request: when it returns a handle (development builds, or production with `provideNfsProductionRuntimeChecks`), the directive creates one more `afterRenderEffect` whose `read` phase calls `include('nfs-dropdown-pane', ['dropdown-sizes'])` on every run, whether or not `size` is bound, then `value('size', size(), needs)` when `size` has a value, with `needs` `[{setting: 'dropdown-sizes', name: size()}]` from the same mapping that sets the class, or `null` for a value that is not one class token. So `strictVariantNames` reports a size the compiled CSS lacks, naming `$dropdown-sizes` and the listed names, and `strictVariantProperties` reports a missing `@include nfs-dropdown-pane;` when `--nfs-dropdown-sizes` reads empty (D28). A consumer who empties `$dropdown-sizes` gets that report too and switches the check off. No Runtime check runs on the server.
- Render hook: the Variant check is a second `afterRenderEffect`, `read`, created only when `nfsVariantCheck` returns a handle; it reads `size` and the Variant property after the class is rendered, re-runs only when `size` changes, and never exists in a production build without the opt-in.
- D28: the Variant check requests `nfs-dropdown-pane` whether or not `size` is bound, and reports bound sizes. Why: the include carries the compile-time 1.4.10 warning, so a missing include is an accessibility gap worth reporting even with no `size` (the Callout's D12, the Close Button's D10); `--nfs-dropdown-sizes` is written by `nfs-dropdown-pane` alone and is never empty on Foundation's defaults. Not taken: requesting only when `size` is bound (a missing include on the commonest pane would go unreported).
- D29 (the Runtime-check part): without the property, the declaration-file generator and the Runtime check would have nothing to read.
- Missing include (Sass item 5): `--nfs-dropdown-sizes` is absent, which the `strictVariantProperties` Runtime check reports in development, naming the include (D28).
- User story 18 above.

#### Flex Grid

[Spec: Flex Grid](../issues/101-spec-flex-grid.md). Mechanisms: Q2, N2, N3, Writers.

- Handle: the Runtime checks' handles, `nfsVariantCheck('nfsRow')` and `nfsVariantCheck('nfsColumn')`.
- Request, in the same read phase: each directive calls `include()` only while a value that reads a property is bound, because `nfs-flex-grid` carries no rule the grid needs (the XY Grid's rule): `NfsColumn` calls `include('nfs-flex-grid', ['grid-column-count'])` while `size` or `offset` holds a count, `NfsRow` calls `include('nfs-flex-grid', ['block-grid-max'])` while `up` is bound, and each calls `include('nfs-breakpoint-properties', ['breakpoint-classes'])` while a bound value names a Class breakpoint above the Zero breakpoint. Then `value(input, value, needs)` for each bound input, with the needs from the same mapping that sets its classes: a size `n` needs `{setting: 'grid-column-count', name: n}`, an offset `n` needs `{setting: 'grid-column-count', name: n + 1}`, an `up` count `n` needs `{setting: 'block-grid-max', name: n}`, every breakpoint above the Zero breakpoint needs `{setting: 'breakpoint-classes', name: bp}`, and the Zero breakpoint needs nothing, because Foundation's iterator always adds it. `'shrink'`, whose class always exists, and a value that intentionally sets no class (`'expand'` or `unstack` at the Zero breakpoint) pass `[]`; a value that maps to no class passes `null`. `expanded`, `isCollapseChild`, `columnBlock`, and the bare `collapse` are closed and make no call.
- Missing include (Sass item 5): the Variant properties are absent, so the declaration-file generator finds no column or block-grid count and the development Runtime check reports the missing include once a count is bound. `--nfs-grid-column-count` and `--nfs-block-grid-max` are written with the same values by the Float Grid's mixin (D12).
- User story 19 above.

#### Flexbox Utilities

[Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md). Mechanisms: Q2, N2, N4.

- Handle: the Runtime checks' handles, `nfsVariantCheck('nfsFlexContainer')` and `nfsVariantCheck('nfsFlexChild')` (`NfsFlexAlign` makes no call).
- Request: in the same read phase, through the handle of `nfsVariantCheck('nfsFlexContainer')` or `nfsVariantCheck('nfsFlexChild')`. A directive of this family calls `include()` only while a value that reads a Variant property is bound, because the mixin holds nothing a directive needs otherwise (the Off-canvas and Top Bar rule of the Runtime checks): `NfsFlexChild` while `order` is bound or `nfsFlexChild` holds a rules key above the Zero breakpoint, `NfsFlexContainer` while `nfsFlexContainer` is a query above the Zero breakpoint or `direction` holds a rules key above it. Then it calls `include('nfs-flexbox-utilities', ['flex-source-ordering-count'])` and `include('nfs-breakpoint-properties', ['breakpoint-classes'])`, and `value()` per bound input with the needs from the same mapping that sets its classes: for `order`, `{setting: 'flex-source-ordering-count', name: n}` and `{setting: 'breakpoint-classes', name: bp}` per class, the Zero breakpoint's name included; for a responsive helper class above the Zero breakpoint, `{setting: 'breakpoint-classes', name: bp}` and `{setting: 'flexbox-responsive-breakpoints', name: bp}`; `[]` for a class that always exists; `null` for a value that binds no class (D11). `strictVariantNames` then reports an order above the compiled count, a breakpoint the compiled Class breakpoints lack, and a responsive helper while `--nfs-flexbox-responsive-breakpoints` is empty, naming `$flexbox-responsive-breakpoints`; `strictVariantProperties` reports a missing `@include nfs-flexbox-utilities;` or `@include nfs-breakpoint-properties;`. `NfsFlexAlign` has only closed families, reads no Variant property, and makes no call.
- D11: Variant check needs from the same mapping as the classes; `include()` only while a value that reads a property is bound; `NfsFlexAlign` makes no call. Why: ADR 0040 and the Runtime checks' rules: the family's mixin holds nothing a directive needs, so an application that binds no order or responsive value is not asked for the include; the closed alignment families read no property. Not taken: reading `--nfs-breakpoint-classes` for the vanilla helpers' responsive keys alone (misses the flag, which only the gated property shows) (`other`).
- Properties: `--nfs-flex-source-ordering-count` is the Flexbox Utilities spec's registry property, which the generator reads too; `--nfs-flexbox-responsive-breakpoints` is presence marker P2, which the build-time checks spec writes and only these checks read.
- Missing include (Sass item 5): no layout changes; the Variant properties are absent, which the `strictVariantProperties` Runtime check reports in development while an order or a responsive helper value is bound, naming the include (D11).
- User stories 20 and 21 above.

#### Float Grid

[Spec: Float Grid](../issues/100-spec-float-grid.md). Mechanisms: Q2, N2, N3, Writers.

- Handle: the Runtime checks' handle in both, `nfsVariantCheck('nfsRow')` and `nfsVariantCheck('nfsColumn')`.
- Request, in the same read phase: each directive calls `include()` only while a value that reads a property is bound, because `nfs-float-grid` carries no rule the grid needs: `NfsColumn` calls `include('nfs-float-grid', ['grid-column-count'])` while `size`, `offset`, `push`, or `pull` holds a count; `NfsRow` calls `include('nfs-float-grid', ['block-grid-max'])` while `up` or `gutter` is bound, naming the count because `--nfs-grid-column-gutter` is legitimately empty under a static gutter; each calls `include('nfs-breakpoint-properties', ['breakpoint-classes'])` while a rules key above the Zero breakpoint is bound. Then `value(input, value, needs)` for each bound input, with the needs from the same mapping that sets its classes: a size `n` needs `{setting: 'grid-column-count', name: n}`; an offset, push, or pull `n` needs `{setting: 'grid-column-count', name: n + 1}`; an `up` count `n` needs `{setting: 'block-grid-max', name: n}`; a gutter key needs `{setting: 'grid-column-gutter', name: key}`; every rules key above the Zero breakpoint needs `{setting: 'breakpoint-classes', name: bp}`. The Zero breakpoint needs no `breakpoint-classes` name, because every Float Grid family adds it to `$breakpoint-classes` (measured). `.collapse`, `expanded`, `end`, and `columnBlock` need nothing. A value that maps to no class passes `null`. One writer: `nfs-float-grid` alone writes `--nfs-grid-column-gutter`; `--nfs-grid-column-count` and `--nfs-block-grid-max` belong to settings the Flex Grid loops over too, so its Library mixin writes them as well (D12), and a missing `nfs-float-grid` is reported only while the Flex Grid's mixin is missing too, as a missing `nfs-progress-bar` is only while `nfs-callout` is missing.
- Missing include (Sass item 5): the development Runtime check reports the missing include once a count is bound, unless the Flex Grid's mixin writes the counts (D12).
- Its check 3 (no Float Grid in the stylesheet, D10) is a development warning, not a Runtime check; D10 rejected "a `strictVariantProperties` report (the Variant properties can be present from the Flex Grid's mixin, D12, and prove nothing about `foundation-grid`)".
- User story 22 above.

#### Label

[Spec: Label](../issues/94-spec-label.md). Mechanisms: Q1, N1. The Badge's shape, applied to Foundation's other coloured text tag.

- Handle: the Runtime checks' handle `nfsVariantCheck('nfsLabel')` of `ngx-foundation-sites/media-query`.
- Request: in the same read phase, on every run, `NfsLabel` calls `include('nfs-label', ['label-palette'])` whether or not `color` is bound, then `value('color', color, needs)` with the need `{setting: 'label-palette', name: color}` for a one-token value and `null` otherwise (D11). `strictVariantNames` compares a bound `color` with `--nfs-label-palette` and reports a value that is not one class token; `strictVariantProperties` reports a missing `@include nfs-label;` when that property reads empty. Only `nfs-label` writes it, so the one-writer rule holds.
- D11: the Runtime check, `include('nfs-label', ['label-palette'])` on every run and `value()` for a bound colour; `--nfs-label-palette` has one writer. Why: the include carries the contrast check and the pick correction, so a missing one is worth reporting where no `color` is bound; `$label-palette` is the Label's own setting, so no second mixin writes its property. Not taken: reading `--nfs-foundation-palette` (another entry point's property, and not the setting the classes loop over) (`other`).
- Missing include (Sass item 5): the Variant property is absent, which the `strictVariantProperties` Runtime check reports in development, naming the include (D11). An empty `$label-palette` writes the property empty (Sass item 6); such a consumer opts `strictVariantProperties` out.
- User story 23 above.

#### Media Object

[Spec: Media Object](../issues/91-spec-media-object.md). Mechanisms: Q2, N4 (one property for two families).

- Handle: `NfsMediaObjectSection` takes the Runtime checks' handle from `nfsVariantCheck('nfsMediaObjectSection')`. `NfsMediaObject` reads no Variant property and makes no call: `stackFor`'s class exists in every compile of `foundation-media-object`, and a drifted Zero breakpoint name is `strictBreakpointSync`'s report (D2: the class name follows `$breakpoints`' first key, which the token mirrors and `strictBreakpointSync` checks).
- Request: `NfsMediaObjectSection` calls `nfsVariantCheck('nfsMediaObjectSection')` at construction and, in a render callback it creates only when the handle is not `null`, while `alignment` has a value or `mainSection` is true, calls `include('nfs-media-object', ['media-object-section'])`, then `value('alignment', value, needs)` and `value('mainSection', true, needs)`. The needs are `[{setting: 'media-object-section', name: 'middle'}]`, `'bottom'`, or `'main-section'`, and `null` for a value that is not one of the names. `strictVariantNames` then reports an `alignment` bound in a flexbox build (the property lists `main-section`) and a `mainSection` bound in a table build (it lists `middle bottom`), for example R2's second text; `strictVariantProperties` reports a missing `@include nfs-media-object;` once. An application that binds neither is not asked for the include. They run in the browser after the first render, never on the server.
- Why both families live on the section: the consumer's `$global-flexbox` decides which one Foundation's CSS styles; the library cannot know the build at render time (the server has no computed style), so both are typed, both are set as bound, and the Runtime check reports a value the compile does not style.
- D6 (the reading side; the property is presence marker P3, which the build-time checks spec writes with `nfs-media-object`): `NfsMediaObjectSection` reports both families through `--nfs-media-object-section` and names it in `include()`. Why: the two families are gated by one flag in opposite directions, so one list that names whichever classes the compile generates is never empty while the mixin is included, which is what lets `include()` tell a missing include from a build that lacks a class; the check then reports the one silent failure, `alignment` in Foundation's default build. Not taken: two properties, each empty while its flag is off (neither may be named in `include()`, so a missing include makes `mainSection` report as a missing class in Foundation's default build) (`other`); a development check from the section's computed `display` (building-blocks 1.13 puts flag-gated families on the Runtime checks, which a production opt-in can also run) (`other`); no check (an `alignment` in the default build is lost silently) (`other`).
- Missing include (Sass item 5): nothing visible breaks, because the mixin styles nothing; while `alignment` or `mainSection` is bound, `strictVariantProperties` reports the missing include once, naming `nfs-media-object`, and `strictVariantNames` stays silent for the section. In a `$global-flexbox: false` build `mainSection` has no rule, and the Runtime check says so once.
- User stories 24 and 25 above.

#### Menu

[Spec: Menu](../issues/85-spec-menu.md). Mechanisms: Q2, N2. Hosted by every menu root and by the Nested menu's submenus.

- The Variant property the runtime check reads is `--nfs-breakpoint-classes` for every breakpoint-keyed value; the closed names need none.
- Request: `NfsMenu` creates the handle `nfsVariantCheck('nfsMenu')` and, only while an `orientation` rules key or an `expanded` query names a Class breakpoint above the Zero breakpoint, calls `include('nfs-breakpoint-properties', ['breakpoint-classes'])`, then `value()` for those values, because `nfs-breakpoint-properties` holds nothing else the Menu needs (the Top Bar's rule); under `strictVariantNames`, a breakpoint above the Zero breakpoint named by an `orientation` rules key or an `expanded` query that `--nfs-breakpoint-classes` does not list (drift between the Variant declaration file and the compiled Sass), and a value that maps to no class; under `strictVariantProperties`, a missing `--nfs-breakpoint-classes`, naming `@include nfs-breakpoint-properties;`. They run in the browser after the first render, never on the server.
- A value that maps to no class (reachable only through `$any()` or a cast) binds nothing and is reported.

#### Off-canvas

[Spec: Off-canvas](../issues/25-spec-off-canvas.md). Mechanisms: Q2, N2, and the Zero-breakpoint split with the misuse warnings.

- Handle: `nfsVariantCheck('nfsOffCanvas')` (or `'nfsOffCanvasAbsolute'`, by selector); the entry point imports `nfsVariantCheck` from the media-query entry point.
- A breakpoint that is a Class breakpoint in the Variant declaration file but has no classes in the compiled CSS is not a development check: the Runtime check reports it, in development by default and in production on opt-in.
- Request: the panel calls `nfsVariantCheck` once at construction and, when the handle is not `null`, reports from its own `afterRenderEffect` read phase, which also holds the development checks and exists only when `ngDevMode` is on or the handle exists. While `revealOn` or `inCanvasOn` is bound it calls `include('nfs-breakpoint-properties', ['breakpoint-classes'])`, then `value('revealOn', value, needs)` and `value('inCanvasOn', value, needs)` for each bound one, with `needs` `[{setting: 'breakpoint-classes', name: value}]` for a Class breakpoint above the Zero breakpoint and `[]` for the Zero breakpoint (check 7 reports that one, so one mistake makes one report). With neither bound the panel reads no Variant property and calls nothing, so an application without reveal or in-canvas panels needs no `nfs-breakpoint-properties` include for this entry point. `position` is a closed family that reads no property, and the overlay, content, and wrapper have no Variant input.
- D28 (the Runtime-check part): `strictVariantNames` reports a Class breakpoint the compiled CSS lacks, and `strictVariantProperties` a missing `nfs-breakpoint-properties`, while either is bound; `nfs-off-canvas` emits no reveal or in-canvas rules of its own.
- Missing include (Sass item 5): a missing `nfs-breakpoint-properties` is reported by `strictVariantProperties` while `revealOn` or `inCanvasOn` is bound.
- User story 26 above.

#### Progress Bar

[Spec: Progress Bar](../issues/95-spec-progress-bar.md). Mechanisms: Q1, N1, Writers.

- Handles: `nfsVariantCheck('nfsProgress')` in `NfsProgress` and `nfsVariantCheck('nfsProgressElement')` in `NfsProgressElement`.
- Request, `NfsProgress`: in the same read phase, on every run, `NfsProgress` calls `include('nfs-progress-bar', ['foundation-palette'])` whether or not `color` is bound, then `value('color', color, needs)` with the need `{setting: 'foundation-palette', name: color}` for a one-token value and `null` otherwise (D14). `strictVariantNames` compares a bound `color` with `--nfs-foundation-palette`; `strictVariantProperties` reports a missing `@include nfs-progress-bar;` when that property reads empty. `nfs-callout` writes the same property, so in an application that includes `nfs-callout`, a missing `nfs-progress-bar` is not reported (D14).
- Request, `NfsProgressElement`: `include('nfs-progress-bar', ['foundation-palette'])` and `value('color', ...)`, as `NfsProgress` does.
- D14: the Runtime check, `include('nfs-progress-bar', ['foundation-palette'])` at every run and `value()` for a bound colour; `nfs-progress-bar` and `nfs-callout` both write `--nfs-foundation-palette`. Why: the include carries the meter text rule and check, so a missing one is worth reporting; the palette property is the Progress Bar's only Variant property; `$foundation-palette` belongs to no entry point, so each mixin whose classes loop over it writes it, and a progress-bar-only application still gets it. Limit: with `nfs-callout` included, a missing `nfs-progress-bar` is not reported; its visible consequence, success and warning meter text at 1.80 and 1.84:1, is still an axe `color-contrast` violation wherever such a bar with meter text is rendered. Not taken: a property only `nfs-progress-bar` writes (none exists without a presence marker that is not a Variant property, a new Runtime-check concept, recorded as the upgrade path); one shared writer mixin for the palette property (one more include, and the Progress Bar's own include still undetected).
- Missing include (Sass item 5): the Variant property is absent unless `nfs-callout` writes it, which the `strictVariantProperties` Runtime check reports in development, naming the include (D14).
- User story 27 above.

#### Prototyping Utilities

[Spec: Prototyping Utilities](../issues/102-spec-prototyping-utilities.md). Mechanisms: Q1, N4, and a count need of its own (`prototype-spacers-count`).

- Handle: the Runtime checks' handle of `ngx-foundation-sites/media-query`, `nfsVariantCheck('<directive>')` with the camelCase of the directive's class (`nfsVariantCheck('nfsPrototypeSpacing')`, ADR 0044), because several attributes create one instance.
- Request (D19): in the same read phase, on every run, each directive calls `include('nfs-prototype-classes', ['prototype-spacers-count', <its own registry settings>])`, never a `prototype-<flag>-breakpoints` flag property, which is empty while its flag is off, whether or not an attribute is bound, then `value(<attribute>, value, needs)` for each bound attribute, with `needs` from the same mapping that sets its classes: `{setting: 'prototype-spacers-count', name: n}` for each spacing class, the registry setting and name for each named class (none for the closed separator and the fixed position forms), and `{setting: 'prototype-<flag>-breakpoints', name: bp}` for each class above the Zero breakpoint. `strictVariantNames` reports a name or count its property lacks, and a responsive class while its flag's property is empty, naming the flag (`$prototype-spacing-breakpoints`); `strictVariantProperties` reports a missing `@include nfs-prototype-classes;`. Each report names the attribute as its input.
- The mapping table's last column, "Variant properties the Runtime check reads", lists each row's properties; every value that is not one class token is "reported by the Variant check".
- Library mixin: `nfs-prototype-classes` is the Prototyping Utilities' one Library mixin, named after Foundation's umbrella `foundation-prototype-classes` ([Decide: the Prototyping Utilities' Library mixin](../issues/173-decide-prototyping-utilities-library-mixin.md)). Per-export mixins (`nfs-prototype-spacing` and so on) may split it later; each directive's `include` then names its own family's mixin.
- D19: every directive includes `nfs-prototype-classes` with `prototype-spacers-count` as the presence marker plus its own registry settings; a responsive class needs its family's flag property; the handle is named after the directive class. Why: `--nfs-prototype-spacers-count` is never empty, so it tells a missing include from an emptied list; the flag properties follow building-blocks 1.13's gated-family rule and name the flag the consumer must set; several attributes create one instance, so no single attribute names it. Not taken: a presence property that is not a Variant property (building-blocks 1.13 does not adopt one) (`other`); one handle per attribute (the contract creates one per directive, at construction) (`other`).
- Overlap resolution: a key the token's map lacks sorts after the map's breakpoints; the `strictBreakpointSync` Runtime check already reports that drift.
- Missing include (Sass item 5): the Variant properties are absent, which the `strictVariantProperties` Runtime check reports in development, naming the include (D19). The sixteen flag properties are presence marker P4, which the build-time checks spec writes and only these checks read.
- User stories 28 and 29 above.

#### Responsive Embed

[Spec: Responsive Embed](../issues/96-spec-responsive-embed.md). Mechanisms: Q1, N1.

- Handle: the Runtime check hook `nfsVariantCheck('nfsResponsiveEmbed')` of `ngx-foundation-sites/media-query`, which every directive with a Variant property uses.
- Request: in its own `afterRenderEffect` read callback, created only when the handle is not `null`, `NfsResponsiveEmbed` calls `include('nfs-responsive-embed', ['responsive-embed-ratios'])` on every run, whether or not `ratio` is bound, because the mixin holds the focus rule every box needs; then `value('ratio', ratio, needs)` with the need `{setting: 'responsive-embed-ratios', name: ratio}` for a one-token value other than `'default'`, `[]` for no value and `'default'`, and `null` for anything else. `strictVariantNames` compares a bound `ratio` with `--nfs-responsive-embed-ratios` and reports a value that is not one class token; `strictVariantProperties` reports a missing `@include nfs-responsive-embed;` when the property reads empty. A consumer whose map keeps only `default` has an empty property and opts `strictVariantProperties` out, as the Callout's consumer without sizes does.
- An embed that never changes sits inside `@defer (hydrate never)` within the box; the box still hydrates, so the Runtime check still runs.
- Missing include (Sass item 5): a focused video's ring is cut off again, silently for users, because axe cannot see it; the Variant property is absent, which the `strictVariantProperties` Runtime check reports in development, naming the include.
- User stories 30 and 31 above.

#### Top Bar

[Spec: Top Bar](../issues/86-spec-top-bar.md). Mechanisms: Q2, N2, and the Zero-breakpoint split with the misuse warnings.

- Request: `NfsTopBar` creates the handle `nfsVariantCheck('nfsTopBar')` and, only while `stackedFor` is bound, calls `include('nfs-breakpoint-properties', ['breakpoint-classes'])`, then `value('stackedFor', value, needs)` with `needs` `[{setting: 'breakpoint-classes', name: value}]` for a Class breakpoint above the Zero breakpoint and `[]` for the Zero breakpoint (development check 6 reports that one, so one mistake makes one report), as the Off-canvas panel does for `revealOn` and `inCanvasOn`; `strictVariantNames` reports a breakpoint `--nfs-breakpoint-classes` does not list (drift between the Variant declaration file and the compiled Sass) and a value that is not one class token, and `strictVariantProperties` reports a missing `--nfs-breakpoint-classes`, naming `@include nfs-breakpoint-properties;`. `dark` is closed and needs none. They run in the browser after the first render, never on the server.

#### Typography Helpers

[Spec: Typography Helpers](../issues/106-spec-typography-helpers.md). Mechanisms: Q2, N2.

- Handle: `NfsTextAlignment` creates the Runtime checks' handle `nfsVariantCheck('nfsTextAlign')` of `ngx-foundation-sites/media-query`; its read phase exists when `ngDevMode` is on or the Variant check handle is not `null`.
- Request (D15): `NfsTextAlignment` only, in the same read phase, and only while `nfsTextAlign` holds a rules key above the Zero breakpoint: `include('nfs-breakpoint-properties', ['breakpoint-classes'])`, then `value('nfsTextAlign', value, needs)` with `{setting: 'breakpoint-classes', name: bp}` for each key above the Zero breakpoint, `[]` for the Zero breakpoint's key (its class always exists), and `null` for a value that maps to no class. `strictVariantNames` reports a breakpoint `--nfs-breakpoint-classes` does not list; `strictVariantProperties` reports a missing `@include nfs-breakpoint-properties;`. A bare value reads no property and makes no call. `NfsTypographyHelpers`, `NfsNoBullet`, `NfsTypographyBase`, and `NfsPrintStyles` have only closed families, read no Variant property, and make no call.
- D15: Runtime check for `nfsTextAlign` only, while a rules key above the Zero breakpoint is bound; no Variant property of the family's own. Why: the Visibility Classes' D11 rule for a directive whose only property is `--nfs-breakpoint-classes`; every other family here is closed. Not taken: a Variant property listing the alignment names (a closed set, nothing to verify) (`other`); requesting the include for a bare value (would ask for a mixin the value does not need) (`other`).
- Limit (Sass item 5): neither `nfs-typography-helpers` nor `nfs-typography-base` writes a Variant property, so the Runtime checks cannot report either missing include.
- User story 36 above.

#### Visibility Classes

[Spec: Visibility Classes](../issues/104-spec-visibility-classes.md). Mechanisms: Q2, N2.

- Handle: the Runtime checks' `nfsVariantCheck('nfsVisibility')` handle.
- The mapping is one pure function over `(input, value, zeroBreakpoint)` returning the class and the Runtime check's needs, so the check and the class always agree.
- Request (D11): in the same read phase, only while `showFor` or `hideFor` holds a Breakpoint query, `NfsVisibility` calls `include('nfs-breakpoint-properties', ['breakpoint-classes'])`, then `value('showFor', value, needs)` and `value('hideFor', value, needs)` for each bound value: `[{setting: 'breakpoint-classes', name: <bp>}]` for a class of a breakpoint, `[]` for a condition, `.hide`, or the Zero breakpoint's `showFor` (whose meaning needs no class), and `null` for a value that maps to no class. `strictVariantNames` reports a breakpoint `--nfs-breakpoint-classes` does not list; `strictVariantProperties` reports a missing `@include nfs-breakpoint-properties;`. `invisible` and `visible` are closed and need no call. The directive writes no Variant property; `nfs-breakpoint-properties` is the one writer of `--nfs-breakpoint-classes`.
- D11: the Runtime check, `include('nfs-breakpoint-properties', ['breakpoint-classes'])` only while a Breakpoint query is bound; `value()` per bound `showFor` and `hideFor`; no Variant property of its own. Why: the rule for a directive whose property is read only for a value that may stay unbound and whose own mixin holds nothing (Off-canvas `revealOn`, Top Bar `stackedFor`); `nfs-breakpoint-properties` is the one writer of `--nfs-breakpoint-classes`. Not taken: requesting the include on every run (would ask an application that uses only `invisible` for a mixin it does not need) (`other`). D20: the `print` condition needs nothing from the Runtime check.
- Missing include (Sass item 5): without `@include nfs-breakpoint-properties;` the `strictVariantProperties` Runtime check reports it in development while a Breakpoint query is bound.
- User story 32 above.

#### XY Grid

[Spec: XY Grid](../issues/99-spec-xy-grid.md). Mechanisms: Q2, N2, N3.

- Handles: `nfsVariantCheck('nfsGridX')`, `nfsVariantCheck('nfsGridY')`, and `nfsVariantCheck('nfsCell')`, in `NfsGridX`, `NfsGridY`, and `NfsCell`. `NfsGridContainer` makes no call: its families are closed (the Tabs precedent).
- Request, in the same read phase: each directive calls `include()` only while a value that reads a property is bound, because `nfs-xy-grid` carries no rule the grid needs: `NfsCell` calls `include('nfs-xy-grid', ['grid-columns'])` while `size` or `offset` holds a count, `NfsGridX` calls `include('nfs-xy-grid', ['xy-block-grid-max'])` while `up` is bound, and each calls `include('nfs-breakpoint-properties', ['breakpoint-classes'])` while a bound value names a Class breakpoint above the Zero breakpoint. Then `value(input, value, needs)` for each bound input, with the needs from the same mapping that sets its classes: a size `n` needs `{setting: 'grid-columns', name: n}`, an offset `n` needs `{setting: 'grid-columns', name: n + 1}`, an `up` count `n` needs `{setting: 'xy-block-grid-max', name: n}`, and every breakpoint above the Zero breakpoint needs `{setting: 'breakpoint-classes', name: bp}`; a Zero-breakpoint collapse needs `{setting: 'breakpoint-classes', name: <zero>}` too, because Foundation loops the collapse classes over `$breakpoint-classes` alone, while every other family adds the Zero breakpoint itself. A value that maps to no class passes `null`. `nfs-xy-grid` alone writes its two properties, so the one-writer rule holds.
- D12: the runtime checks cannot see which parts `foundation-xy-grid-classes(...)` switched off; the docs say that a consumer who turns a part off binds none of its inputs. Why: the library's mixin cannot read another mixin's arguments; the parts are all on by default and in `foundation-everything`. Not taken: `nfs-xy-grid` mirroring Foundation's eight arguments with one gated Variant property per part (a second list the consumer keeps in step, for a rare configuration; add it if consumers report the gap) (`other`).
- Missing include (Sass item 5): the Variant properties are absent, so the declaration-file generator finds no column or block-grid count and the development Runtime check reports the missing include once a count is bound.
- User story 33 above.

### Comparison with Angular Material, the CDK, Angular Aria, and prior art

| Concern | Prior art | This library | Why |
| --- | --- | --- | --- |
| Per-check configuration | NgRx `runtimeChecks`: per-check flags over defaults, and every check forced off in production | `NfsRuntimeChecks`: on in development with a per-check opt-out, off in production unless listed | The user wants a production opt-in; a tri-state per check in one options object would ship the checker to every caller (ADR 0040, Considered options: 87 bytes for the shape, against 895 once installed) |
| A missing stylesheet | Angular Material's `MatCommonModule` sanity checks until 19.0.0 (removed in angular/components commit 54875a3, #29688): in development builds it appended a `.mat-theme-loaded-marker` element and warned when the theme had not set its computed `display` to `none`, beside a doctype and a version check, configured through `MATERIAL_SANITY_CHECKS` (`true`, `false`, or `GranularSanityChecks`) and skipped in test environments. Removed "since they won't execute with standalone by default, they mostly aren't necessary now that we're loading structural styles automatically and they produce some concrete styles that are problematic for the new theming APIs" | `strictVariantProperties` reads the Variant properties on `:root` and writes no DOM | Each directive reports through its own handle and the service runs the drift check, so a standalone application runs them; no library CSS loads itself (the consumer compiles Foundation and includes each Library mixin, ADR 0012); the properties it reads are ones the Variant declaration tooling reads anyway |
| A production-free provider | Angular's `provideCheckNoChangesConfig`, which returns nothing in production builds | `provideNfsRuntimeChecks` returns no providers in production | An application may call it in its shared configuration and ship nothing for it |
| Reading compiled CSS against inputs | Nothing in the CDK or Angular Aria; Material's checks above read one marker, never an input's value | `strictVariantNames` compares each rendered value with the names the compiled CSS generates | Declaration merging moves the names to the consumer's Sass (ADR 0040), so only the compiled CSS can show drift |

### Implementation level and primitives

Custom Angular in development builds, with one opt-in production path. Neither `@angular/aria` nor `@angular/cdk` compares a directive's inputs with the compiled CSS; the platform supplies the read. Primitives: `afterRenderEffect` (each directive's read phase), `afterNextRender({earlyRead})` (the service's go-live callback), `getComputedStyle(document.documentElement).getPropertyValue(...)`, an `InjectionToken` with a root factory behind `typeof ngDevMode === 'undefined' || ngDevMode`, `EnvironmentProviders`, and Angular's `ErrorHandler` for a throwing `report` callback. No private Angular field is read.

### ARIA and keyboard

None: nothing here renders or takes input.

### WCAG 2.2 AA

The Runtime checks report to the console or to the consumer's callback, never to the page, so they add no criterion. They exist partly for accessibility: a missing Library mixin include removes rules and compile-time checks that WCAG 2.2 AA needs, which axe does not always see, and these checks name the include: the Close Button's 24 px floor (2.5.8, D10), the Callout's room for its close button (1.4.12) and its contrast checks (D12), the Dropdown pane's 1.4.10 warning (D28), the Responsive Embed's focus rule (2.4.7), the Progress Bar's meter text rule (1.4.3, D14), and the Badge's and the Label's contrast checks and pick corrections (1.4.3, D11).

### Rendered output

None. The checks write no DOM, add no class, attribute, or listener, and report to the console or to the consumer's callback. What they read on `:root` is the Library mixins' output: the registry Variant properties (the first milestone's, and the eight later families' with their own specs) and `--nfs-breakpoint-classes`, and the presence markers P1 to P5 of the build-time checks spec.

### Rendering modes

- Server rendering and prerendering: every read is in a render callback, which Angular makes a no-op on the server, so nothing reads or reports there; the server has no computed style, and the server HTML carries whatever class a value produced, unchecked.
- Before hydration: nothing reads computed style and nothing writes; the checks run neither on the server nor before hydration.
- Hydration: the checks write no DOM, so hydration is unaffected.
- Incremental hydration: a directive inside a `hydrate on ...` block is checked when the block hydrates; one inside `hydrate never` is never checked, because it never runs on the client.
- `@defer`: a directive created later in a plain `@defer` block reports at its own first render.
- Event replay: the checks declare no listener and replay nothing.

## Testing Decisions

A good test asserts what a developer observes: the reports (their `check`, message text, fields, and count), whether they go to `console.warn` or to the `report` callback, and what a production bundle contains; never the checker's private fields, caches, or bookkeeping. Prior art: the Breakpoint service spec's Runtime-check tests and production-bundle measurement, and each component spec's Runtime check case, which the tests below keep as the specs gave them.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`, `npx nx test-storybook <lib>`)

No stories of their own: the checks render nothing. Layer 1 runs in Angular development mode, so the checks run in every story; the Storybook preview stylesheet includes `nfs-breakpoint-properties` and every other Library mixin, so no story makes a Runtime check report. The `media-query--custom-breakpoint-map` story, which provides a story-level `nfsBreakpointsToken` of `{small: 0, medium: 768, large: 1100, xlarge: 1200, xxlarge: 1440}`, carries a matching Breakpoint properties style block (custom properties only; `--nfs-breakpoint-classes` comes from the preview stylesheet), so the drift check stays silent there. The Button's responsive `expanded` forms stay out of stories, because the preview settings leave `$button-responsive-expanded` off, as Foundation does, and the development Variant check would report them; layer 2 covers their mapping.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

The shared cases, in `ngx-foundation-sites/media-query`'s tests (the Breakpoint service spec's). Reads and reports are once per realm, and Vitest's default `isolate: true` gives each test file its own browser realm, so each case below that needs a first read or a first report of its own sits in its own test file (named after the case). Test style blocks write custom properties on `:root` only, never a class. The fixture directive for the Variant check is a test host directive in the spec file that calls `nfsVariantCheck('nfsProbe')`, `include('nfs-probe', ['probe-palette'])`, and `value()` from its own `afterRenderEffect`, as a library directive does.

- `strictBreakpointSync` (one file per outcome): no properties produces the include report; a style block with `--nfs-breakpoint-medium: 768px` produces the drift report naming `medium` with both values; a `--nfs-breakpoint-classes: small medium large xlarge` beside a map without `xlarge` reports `xlarge` with its `--nfs-breakpoint-xlarge` value; matching properties produce nothing; a second application in the same file produces no second report; each report's `check` is `strictBreakpointSync` and its message carries the prefix.
- Configuration: with no provider all three checks report in a development build; `provideNfsRuntimeChecks({strictBreakpointSync: false})` silences the drift report and leaves the Variant checks on; `provideNfsRuntimeChecks({strictVariantNames: false})` silences name reports only; in a development build `provideNfsProductionRuntimeChecks({strictVariantNames: true}, {report})` changes nothing (every check still reports, to `console.warn`, and `report` is not called).
- Presence: with no probe property, a probe directive with no bound value reports `strictVariantProperties` once, naming `nfs-probe`; ten such directives still report once; with the property present, nothing.
- Names: with `--nfs-probe-palette: primary secondary` a bound `primary` is silent; `purple` through a cast reports `strictVariantNames` once, with `directive`, `input`, `value`, `setting`, and `names`; changing the value to `teal` reports `teal` once; changing it back to `purple` reports nothing new; a `null` need (a value with a space) reports once that it binds no class.
- Formats: a comma list (`primary, secondary`), a line-broken list, and a count (`--nfs-probe-columns: 12`, where 12 is silent and 13 reports) read as the Variant property format says; an empty property that no `include()` lists is an empty list, so any name reports under `strictVariantNames` and nothing reports under `strictVariantProperties`; a need whose property an `include()` found missing makes no second report.
- Timing: nothing is read or reported before the fixture's first `whenStable()` (a `getComputedStyle` spy records no call until then); a probe directive created later in a plain `@defer` block reports at its own first render.

The component cases, each in its own spec's tests, one test file per case that needs a first report of its own:

- Badge: with `--nfs-badge-palette: primary secondary success warning alert` on the test document, a listed `color` is silent; an unlisted `color` bound through a cast reports `strictVariantNames` once, naming the directive, the input, the value, and `$badge-palette`; in a test file of its own, with the property absent, a badge with no `color` reports `strictVariantProperties` once, naming `@include nfs-badge;`.
- Button: with a style block standing in for the `nfs-button` Variant properties, a listed `color` is silent; an unlisted `color` bound through a cast reports `strictVariantNames` once, naming the directive, the input, the value, and `$button-palette`; `expanded="medium"` with an empty `--nfs-button-responsive-expanded` reports once, naming `$button-responsive-expanded`; in a test file of its own, with no style block, one `strictVariantProperties` report names `@include nfs-button;`; `provideNfsRuntimeChecks({strictVariantNames: false})` silences the name reports.
- Button Group: with a style block standing in for the `nfs-button` Variant properties, a listed `color` is silent; an unlisted `color` bound through a cast reports `strictVariantNames` once, naming `nfsButtonGroup`, the input, the value, and `$button-palette`; in a test file of its own, with no style block, one `strictVariantProperties` report names `@include nfs-button;`.
- Callout: with `--nfs-foundation-palette: primary secondary success warning alert` and `--nfs-callout-sizes: small large` on the test document, a listed `color` and `size` are silent; an unlisted `color` bound through a cast reports `strictVariantNames` once, naming the directive, the input, the value, and `$foundation-palette`; in a test file of its own, with `--nfs-callout-sizes` absent, a callout with no input bound reports `strictVariantProperties` once, naming `@include nfs-callout;`, even while `--nfs-foundation-palette` is present.
- Close Button: with `--nfs-closebutton-size: small medium` on the test document, `size="small"` is silent and `'large'` through `$any()` reports once under `strictVariantNames`; in a test file of its own, with the property absent, a close button with no `size` reports once under `strictVariantProperties`, naming `nfs-close-button`.
- Dropdown: with `--nfs-dropdown-sizes: tiny small large` on the test document, a listed `size` is silent; an unlisted `size` cast past the type reports `strictVariantNames` once, naming `nfsDropdownPane`, `size`, the value, and `$dropdown-sizes`; in a test file of its own, with the property absent, a pane with no `size` bound reports `strictVariantProperties` once, naming `@include nfs-dropdown-pane;`; `provideNfsRuntimeChecks({strictVariantProperties: false})` silences it; without a checker (the production double) the Variant check's `afterRenderEffect` is never created.
- Flex Grid: with a style block writing `--nfs-grid-column-count: 12; --nfs-block-grid-max: 8; --nfs-breakpoint-classes: small medium large;`, bound values within range are silent; `size` 13 and `up` 9 through a cast report `strictVariantNames` once each, naming `$grid-column-count` and `$block-grid-max`; an `xlarge` key through a cast reports naming `$breakpoint-classes`; in a test file of its own, with no properties, a column with `size="6"` reports `strictVariantProperties` once naming `@include nfs-flex-grid;`, and a column with `size="shrink"` and a row with only `collapse` ask for nothing.
- Flexbox Utilities, one test file per case: with `--nfs-flex-source-ordering-count: 6`, `--nfs-flexbox-responsive-breakpoints: medium large`, and `--nfs-breakpoint-classes: small medium large` on the test document, `order="6"` and `{medium: 'row'}` are silent; `order` 7 through a cast reports `strictVariantNames` once, naming `nfsFlexChild`, `order`, and `$flex-source-ordering-count`; `{xlarge: 2}` through a cast reports naming `$breakpoint-classes`; with an empty `--nfs-flexbox-responsive-breakpoints`, `{medium: 'row'}` reports naming `$flexbox-responsive-breakpoints`, while a bare `direction="row"` stays silent; with no properties, `order` bound makes one `strictVariantProperties` report naming `@include nfs-flexbox-utilities;` and one naming `@include nfs-breakpoint-properties;`; directives with no bound value that needs a property request nothing; `NfsFlexAlign` never reports.
- Float Grid, one test file per case: with a style block writing `--nfs-grid-column-count: 12; --nfs-block-grid-max: 8; --nfs-grid-column-gutter: small medium; --nfs-breakpoint-classes: small medium large;`, bound values within range are silent; `size` 13, `push` 12, and `up` 9 through a cast report `strictVariantNames` once each, naming `$grid-column-count` and `$block-grid-max`; `gutter="large"` through a cast reports naming `$grid-column-gutter`; with `--nfs-grid-column-gutter` empty, `gutter="small"` reports the name and no missing include; an `xlarge` rules key through a cast reports naming `$breakpoint-classes`; with no properties, a column with `size="6"` reports `strictVariantProperties` once naming `@include nfs-float-grid;`, and a row with only `collapse` or `expanded` asks for nothing.
- Label: with `--nfs-label-palette: primary secondary success warning alert` on the test document, a listed `color` is silent; an unlisted `color` bound through a cast reports `strictVariantNames` once, naming the directive, the input, the value, and `$label-palette`; in a test file of its own, with the property absent, a label with no `color` reports `strictVariantProperties` once, naming `@include nfs-label;`.
- Media Object: with `--nfs-media-object-section: main-section` on the test document, `mainSection` is silent and `alignment="middle"` reports once under `strictVariantNames`, naming `nfsMediaObjectSection`, `alignment`, `middle`, and `$media-object-section`; with `middle bottom`, `alignment` is silent and `mainSection` reports once; in a test file of its own, with the property absent and `alignment` bound, `strictVariantProperties` reports once, naming `nfs-media-object`, and no name is reported; with neither input bound, nothing is requested; `provideNfsRuntimeChecks({strictVariantNames: false})` silences the name reports.
- Menu: a listed breakpoint is silent; an `orientation` rules key or `expanded` query for a breakpoint missing from a test `--nfs-breakpoint-classes` on the document root reports once under `strictVariantNames`; a cast value binds no class and reports once; in a test file of its own, with the property absent and an `orientation` rules key above the Zero breakpoint bound, `strictVariantProperties` reports once, naming `nfs-breakpoint-properties`; a menu with no responsive value requests nothing.
- Off-canvas, one test file per case, with test style blocks writing custom properties on `:root` only: `revealOn="large"` against `--nfs-breakpoint-classes: small medium large` is silent; `revealOn` set by a cast to `xlarge` against the same property reports once under `strictVariantNames`, naming `nfsOffCanvas`, `revealOn`, `$breakpoint-classes`, and the listed names; with no property, `revealOn` bound makes one `strictVariantProperties` report naming `nfs-breakpoint-properties`, and a panel with neither Option bound makes none; `revealOn` naming the Zero breakpoint makes no Runtime check report.
- Progress Bar: with `--nfs-foundation-palette: primary secondary success warning alert` on the test document, a listed `color` is silent and an unlisted one bound through a cast reports `strictVariantNames` once, naming the directive, the input, the value, and `$foundation-palette`; in a test file of its own, with the property absent, a bar with no `color` reports `strictVariantProperties` once, naming `@include nfs-progress-bar;`. `NfsProgressElement` shares the case.
- Prototyping Utilities: with a style block standing in for the `nfs-prototype-classes` Variant properties on Foundation's defaults with every flag on, every default value is silent; a count above `--nfs-prototype-spacers-count` bound through a cast reports `strictVariantNames` once, naming `nfsPrototypeSpacing`, the attribute, the value, and `$prototype-spacers-count`; with `--nfs-prototype-spacing-breakpoints` empty, `[nfsMargin]="{medium: 1}"` reports once, naming `$prototype-spacing-breakpoints`; in a test file of its own, with no style block, one `strictVariantProperties` report names `@include nfs-prototype-classes;` however many directives render.
- Responsive Embed: with `--nfs-responsive-embed-ratios: widescreen` on the test document, `ratio="widescreen"` and `'default'` are silent; an unlisted `ratio` bound through a cast reports `strictVariantNames` once, naming the directive, the input, the value, and `$responsive-embed-ratios`; in a test file of its own, with the property absent, a box with no `ratio` bound reports `strictVariantProperties` once, naming `@include nfs-responsive-embed;`.
- Top Bar: with `--nfs-breakpoint-classes: small medium large` on the test document, `stackedFor="medium"` is silent and `'xlarge'` through `$any()` reports once under `strictVariantNames`; in a test file of its own, with the property absent and `stackedFor` bound, `strictVariantProperties` reports once, naming `nfs-breakpoint-properties`; an unbound `stackedFor` requests nothing.
- Typography Helpers: with a style block standing in for `--nfs-breakpoint-classes: small medium large`, `[nfsTextAlign]="{medium: 'center'}"` is silent; a key outside the property bound through a cast reports `strictVariantNames` once, naming `nfsTextAlign`, the value, and `$breakpoint-classes`; in a test file of its own, with no style block, one `strictVariantProperties` report names `@include nfs-breakpoint-properties;`; a bare `nfsTextAlign="center"` makes no request.
- Visibility Classes: with `--nfs-breakpoint-classes: small medium large` on the test document, `showFor="medium"` is silent and `showFor="xlarge"` through a cast reports `strictVariantNames` once, naming `nfsVisibility`, `showFor`, the value, and `$breakpoint-classes`; in a test file of its own, with the property absent, `hideFor="large"` reports `strictVariantProperties` once, naming `@include nfs-breakpoint-properties;`; a directive with only `hideFor` written alone, a condition (`showFor="print"` among them), or `invisible` set makes no `include()` request.
- XY Grid: with a style block writing `--nfs-grid-columns: 12; --nfs-xy-block-grid-max: 8; --nfs-breakpoint-classes: small medium large;`, bound values within range are silent; `size` 13 and `up` 9 through a cast report `strictVariantNames` once each, naming `$grid-columns` and `$xy-block-grid-max`; an `xlarge` key through a cast reports naming `$breakpoint-classes`; in a test file of its own, with no properties, a cell with `size="6"` reports `strictVariantProperties` once naming `@include nfs-xy-grid;`, and a cell with no count and a Zero-breakpoint value asks for nothing; `NfsGridContainer` makes no report.

### 3. Node-level Vitest

- Pure logic: the checker's pure Variant property reader over an empty value, whitespace only, `small medium large`, `primary, purple`, a line-broken list, duplicates, and `12`. The Visibility Classes' class mapping function, table-driven, includes the needs it returns for the Runtime check.
- SSR smoke (the Breakpoint service spec's): the `renderApplication` fixture holds one probe directive that reports to `nfsVariantCheck` with a value its (absent) property does not list; a `getComputedStyle` spy records no call, and no Runtime check reports on the server.
- Every component spec's SSR smoke asserts that no Runtime check report is made on the server: the Badge, the Button, the Button Group, the Callout, the Dropdown (with no development check running), the Flex Grid, the Flexbox Utilities, the Float Grid, the Label, the Off-canvas panel (with no `getComputedStyle` call), the Progress Bar, the Prototyping Utilities, the Typography Helpers, the Visibility Classes, and the XY Grid.

### 4. Playwright e2e

Against the prerendered fixture app (`npx nx e2e <fixture-app>-e2e`):

- The drift report does not appear (the fixture includes the Breakpoint properties); a second fixture route built without the include logs the `strictBreakpointSync` include report once.

Against production builds of the fixture app (the production-bundle measurement; a second build configuration with script optimization on, so `ngDevMode` is `false`, in two variants: the fixture as it is, and the fixture with `provideNfsProductionRuntimeChecks({strictVariantNames: true}, {report})` in its application configuration). A test with no page reads each build's JavaScript; a second test serves the opt-in build:

- Without the production call, the bundle contains none of the checker's report texts (`has no class in the compiled CSS`, `were found on :root`) and no `getPropertyValue` from this entry point; with only `provideNfsRuntimeChecks({strictVariantProperties: false})` added, the same holds.
- With the production call, the texts are present; served, a probe value cast past its type reaches the `report` callback once with `check: 'strictVariantNames'`, the drift fixture reports nothing (not listed), and the console shows no development report.

The Storybook half of the e2e layer sees none of the checks, because the static Storybook build runs in production mode (ADR 0018).

## Out of Scope

- The checks in the first milestone: the user's ruling of 2026-09-29 plans and implements them in a later milestone, and the first-milestone specs state each rule they enforced as documented usage. Category: `superseded`.
- Runtime checks on the server: the server has no computed style. Category: `platform-or-a11y`.
- A Runtime check that compares every name the Variant declaration file declares with the CSS, rendered or not: it would need the declared names at run time, which a declaration file does not carry (ADR 0040's dissent on a theme constant); the Variant declaration tooling's CI check compares them. Category: `other`.
- A report destination per check, or a development `report` callback: the console is the development destination, and a consumer who wants telemetry opts the checks into production. Category: `other`.
- A breakpoint that exists only in Sass and is not a Class breakpoint: computed style cannot list custom properties by prefix, so `strictBreakpointSync` cannot see it; a Plugin Option that names it gets the service's unknown-name warning. Category: `platform-or-a11y`.
- A missing include of a Library mixin that writes no Variant property, or of a Foundation export mixin: the checks read the Variant properties a Library mixin writes, not Foundation's rules. So a Prototyping Utilities family whose export mixin is missing, a missing `foundation-float-classes`, the Typography Helpers' two mixins, and the Card's, Thumbnail's, Switch's, Table's, Pagination's, and Breadcrumbs' includes are not reported by a Runtime check (the Table's, the Pagination's, and the Breadcrumbs' own development checks cover theirs, and the Card's and the Switch's stories catch theirs in the library's CI). Category: `platform-or-a11y`.
- A presence property that is not a Variant property, which would let a missing `nfs-progress-bar` be reported while `nfs-callout` is included, and a missing `nfs-switch` at all: recorded by the Progress Bar spec (D14) as the upgrade path; building-blocks 1.13 and ADR 0040's dated note do not adopt one. Category: `other`.
- The parts `foundation-xy-grid-classes(...)` switched off: the library's mixin cannot read another mixin's arguments (the XY Grid's D12). Category: `platform-or-a11y`.
- A compile-time or runtime check that `$grid-column-count` equals `$grid-columns` on a page that compiles both the Float Grid and the XY Grid: neither Library mixin can tell whether the other grid's classes were compiled; the Float Grid spec states the requirement instead. Category: `other`.
- A `--nfs-table-is-striped` property and a `strictVariantNames` report for the Table's stripe pair: a report for a binding that looks right (the Table's D5). Category: `other`.
- The Breakpoint service's own development diagnostics (unknown names, invalid rule tokens, an invalid map): the misuse warnings' kind, [Spec: misuse warnings (later milestone)](../issues/161-spec-misuse-warnings-later-milestone.md). Category: `scope-boundary`.
- `strictDirectiveImports` and `strictParents`: the forgotten-import checks' ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), which extends this configuration. Category: `scope-boundary`.
- Writing what the checks read: the registry Variant properties and `--nfs-breakpoint-classes` are first-milestone Sass, apart from the eight later families' registries, which their own specs write, and the presence markers P1 to P5 (the flag-gated properties, `--nfs-media-object-section`, and the Breakpoint properties) are the [Spec: build-time checks (later milestone)](../issues/163-spec-build-time-checks-later-milestone.md)'s. Category: `scope-boundary`.
- Registering the Breakpoint properties with `@property`: it would change the Sass packaging decision's output and stays a possible follow-up (Platform features, below). A list of every `$breakpoints` key stays out; the drift check's limit is only a Sass-only breakpoint that is not a Class breakpoint (ADR 0040 decides the names list: `--nfs-breakpoint-classes`). Category: `other`.
- The Variant registries, the Class breakpoint types, the Variant property format, the Variant declaration file, and its generator, sync, and CI checks: the [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md) and, for the CI checks, the build-time checks spec own them. Category: `scope-boundary`.
- Interchange's rules: their breakpoint names are the Breakpoint map's (`NfsBreakpointName`), behaviour, not Variant classes, so no Runtime check reads them ([Spec: Interchange](../issues/35-spec-interchange.md), D19). Category: `scope-boundary`.

## Further Notes

### Design decisions

| # | Decision | Chosen | Alternatives not taken, and why |
| --- | --- | --- | --- |
| D1 | Milestone | Planned and implemented in a later milestone; the first milestone has no Runtime check and states each rule as documented usage (the ruling) | The checks in the first milestone (overruled by the user on 2026-09-29; `superseded`) |
| D2 | Home of the configuration | This spec: `NfsRuntimeChecks`, `NfsRuntimeCheckReport`, both provider functions, the internal checker token, and `nfsVariantCheck`; the forgotten-import checks spec adds its two keys and the environment initializer | The Breakpoint service spec, which held them at `53144f3` (it now describes a first milestone with no checks; `superseded`); the forgotten-import checks spec (a spec of another kind would own three Runtime checks; `other`) |
| D3 | Entry point (Breakpoint service D22) | `ngx-foundation-sites/media-query`, which also exports the Runtime-check API (ADR 0040) | Inside each Plugin (duplicated), or the primary entry point (defeats per-Plugin `@defer`; since 2026-09-27 the primary entry point holds types and one pure function only); a new entry point for the checks (a second home, while `strictBreakpointSync` runs in the service's callback; `other`) |
| D4 | Order of landing | Whichever of this spec and the forgotten-import checks spec lands first brings the configuration (the forgotten-import checks spec only its two keys and the development path); the requests of the three grids, the Flexbox and Prototyping Utilities, the Typography Helpers, and the Visibility Classes land no earlier than their own specs ([Decide: grids, typography, and utilities move to a later milestone](../issues/174-decide-grids-typography-utilities-later-milestone.md)); a presence marker lands no later than the check that reads it; the requests run in their own read phase when the misuse warnings have not landed | Landing the three checks without the configuration (nothing could switch them; `other`); making the Zero-breakpoint reports of the Off-canvas panel and the Top Bar Runtime checks when the misuse warnings are absent (changes the specs' split, "one mistake makes one report"; `other`) |
| D5 | Drift check (Breakpoint service D19) | The `strictBreakpointSync` Runtime check (revised 2026-09-27, ADR 0040): once per realm, token names plus the Class breakpoints, px text parse; on in development with a per-check opt-out, off in production unless opted in | Once per application (a report in every consumer unit test); development only with no switch (the Breakpoint service spec's first version, overruled by the user's rulings recorded in ADR 0040) |
| D6 | Missing properties (Breakpoint service D20) | One report naming the include | Silence (the Sass ticket's recommended default was the warning) |
| D7 | `--nfs-breakpoint-classes` (Breakpoint service D26) | Written by `nfs-breakpoint-properties`, read by `strictVariantNames`, `strictBreakpointSync`, and the Variant declaration tooling | A separate mixin (a second include for one property the same settings produce); a names list of every `$breakpoints` key (the class list already narrows the drift check's limit to breakpoints that no class uses) |
| D8 | Runtime-check configuration (Breakpoint service D27) | Two provider functions, each affecting only its own build; development reports to `console.warn`, production to `report` or `console.warn`; application level only | One umbrella `provideNfs()` (building-blocks 1.9; ADR 0040's dissent); a tri-state per check (every caller ships the checker); a `report` callback that also receives development reports (a function named for production acting in development, and telemetry fed with development noise) |
| D9 | Production tree-shaking (Breakpoint service D28) | An internal root token whose factory returns the development checker behind `ngDevMode`, else `null`; only the production call replaces it | A runtime flag the directives read with the checker always imported (the checker ships in every bundle, 595 B in SYNC 8.3's stand-in); an `ngDevMode`-only check (no production opt-in) |
| D10 | Variant check interface (Breakpoint service D29) | `nfsVariantCheck(directive)` returns a handle or `null`; the directive calls `include(mixin, settings)` and `value(input, value, needs)` from its own render callback | A registration call that creates the render callback itself (a second callback in directives that already have one for their development warnings, as the Button does); a per-input registration with no presence request (the Close Button could not report a missing include while `size` is unset) |
| D11 | Missing include versus empty list (Breakpoint service D30) | `include()` lists only properties the mixin never leaves empty on Foundation's defaults; every other empty property is an empty list | Treating any empty property as missing (a flag-gated family's empty list would report a missing include; an empty and a missing property read the same, ADR 0040's dated note, re-measured); a sentinel for the empty list (`none` can be a name; the Variant property format keeps whitespace only) |
| D12 | Once per realm (Breakpoint service D31) | Property reads and reports cached per realm, for all three checks | Per application (a report per consumer unit test); on every render (a report per instance and pass); re-reading on every check (a computed-style read per value) |
| D13 | The service's own development warnings (Breakpoint service D33) | Stay development-only diagnostics outside the Runtime checks | Folding them into `strictBreakpointSync` or a fourth check (they report misuse of the service's API, not CSS drift, and the check set is ADR 0040's) |
| D14 | Messages | The specs' verbatim texts where they gave them; where they gave only what a report says, that, with no invented text | Writing the missing texts here (new design this spec was not asked for; `other`) |

Each component's own decisions are cited in its entry under Per component (the Badge's and the Label's D11, the Button's D19, the Button Group's D11, the Callout's D12, the Close Button's D10, the Dropdown's D28 and D29, the Flexbox Utilities' D11, the Flex Grid's D12, the Float Grid's D10 and D12, the Media Object's D2 and D6, the Off-canvas D28, the Progress Bar's D14, the Prototyping Utilities' D19, the Typography Helpers' D15, the Visibility Classes' D11 and D20, and the XY Grid's D12).

### Usage examples

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

A report, for a value cast past its type:

```
ngx-foundation-sites [strictVariantNames]: nfsButton color "purple" has no class in the compiled CSS: $button-palette generates primary secondary success warning alert. Add it to $button-palette, or regenerate the Variant declaration file if it still lists purple.
```

### Platform features to adopt when the browser target moves

- `@property` registration of the Breakpoint properties with `syntax: '<length>'` (not Baseline widely available by 2026-05-07): computed style would return absolute lengths, so the drift check could accept any unit; this needs a change to the Sass packaging decision's output.

### Where the shared documents stated these checks

The shared sweep ([research/checks-extraction-shared.md](../research/checks-extraction-shared.md)) found eleven statements of the Runtime checks in the shared documents at `ba07780`, all restating the design above; [Task: shared documents for the later-milestone checks](../issues/171-task-shared-documents-later-milestone-checks.md) points each at this spec.

| Document | Location | Statement | Held here |
| --- | --- | --- | --- |
| building-blocks | 1.4 | `nfsVariantCheck(directive)`, `include()` and `value()`, the missing-property case in a test file of its own | The Variant check; Per component, Shared mechanisms |
| building-blocks | 1.7 | `strictBreakpointSync` reports token and CSS drift and a Class breakpoint the token lacks | `strictBreakpointSync`, the drift check |
| building-blocks | 1.13 | The three checks read the Variant properties after the first render, once per realm, tree-shaken without the production call | The checker, and what keeps production bundles clean |
| architecture guide | P23 | A missing Library mixin include is reported | `strictVariantProperties`; Per component |
| architecture guide | P23 | The three checks run in development with an opt-out and in production through the opt-in provider | Configuration rules |
| CONTEXT.md | Runtime check | The glossary term | Solution; API: configuration |
| storybook-conventions.md | section 5 | The Flexbox Utilities' include "for the Runtime checks" in the preview stylesheet | Testing Decisions, layer 1 |
| ADR 0012 | 2026-09-27 dated note | The Variant properties are a verification channel the runtime checks read | Milestone and what this spec needs |
| ADR 0040 | Runtime checks bullet | NgRx-style configuration, on in development, off in production unless opted in | API: configuration |
| ADR 0040 | Consequences | The three checks and the two provider functions; browser only, after the first render | API: configuration; Configuration rules |
| ADR 0044 | Consequences | A Runtime-check handle of a directive several attributes create is named after the directive class | The Variant check |

### Manifest entries this spec holds

Every entry the seven manifests classify as `runtime`, by its heading. The component manifests hold 24 (group d's count table says 6 for its five entries), and the shared manifest 11.

| Manifest | File | Entry |
| --- | --- | --- |
| a | specs/badge.md | NfsBadge Variant checks |
| a | specs/breakpoint-service.md | NfsRuntimeChecks configuration surface |
| a | specs/breakpoint-service.md | nfsVariantCheck (strictVariantNames, strictVariantProperties) |
| a | specs/breakpoint-service.md | strictBreakpointSync |
| a | specs/button-group.md | NfsButtonGroup Variant check |
| a | specs/button.md | NfsButton Variant check |
| b | specs/callout.md | Callout Variant check |
| b | specs/close-button.md | Close Button Variant check |
| b | specs/dropdown.md | Dropdown Pane Variant check |
| b | specs/flex-grid.md | Flex Grid Variant check |
| b | specs/flexbox-utilities.md | Flexbox Utilities Variant check |
| c | specs/float-grid.md | `strictVariantNames`/`strictVariantProperties` for `size`, `offset`, `push`, `pull`, `up`, `gutter`, breakpoint keys |
| c | specs/label.md | `include('nfs-label', ...)`/`value('color', ...)` (D11) |
| c | specs/media-object.md | `include('nfs-media-object', ...)`/`value('alignment'/'mainSection', ...)` |
| c | specs/menu.md | `include('nfs-breakpoint-properties', ...)`/`value()` for `orientation`/`expanded` breakpoint keys |
| d | specs/off-canvas.md | Runtime check for `revealOn`/`inCanvasOn` (ADR 0040) |
| d | specs/progress-bar.md | Runtime check, `NfsProgress` |
| d | specs/progress-bar.md | Runtime check, `NfsProgressElement` |
| d | specs/prototyping-utilities.md | Runtime check (D19, every directive) |
| d | specs/responsive-embed.md | Runtime check |
| f | specs/top-bar.md | `NfsTopBar`'s `nfsVariantCheck('nfsTopBar')` Runtime checks |
| f | specs/typography-helpers.md | `NfsTextAlignment`'s Runtime check |
| f | specs/visibility-classes.md | `NfsVisibility`'s Runtime check (D11) |
| f | specs/xy-grid.md | Each directive's Runtime check |
| shared | building-blocks.md | Variant-property presence report (`nfsVariantCheck`) |
| shared | building-blocks.md | `strictBreakpointSync` Breakpoint drift check |
| shared | building-blocks.md | `strictVariantNames`, `strictVariantProperties`, `strictBreakpointSync` browser checks |
| shared | architecture-guide.md | Missing Library mixin include, detected via an absent Variant property (P23) |
| shared | architecture-guide.md | Three Runtime checks named together (`strictVariantNames`, `strictVariantProperties`, `strictBreakpointSync`) (P23) |
| shared | CONTEXT.md | "Runtime check" glossary term |
| shared | storybook-conventions.md | Sass comment naming the Runtime checks' dependency on Flexbox Utilities' Variant properties |
| shared | adr/0012-sass-packaging.md | Variant properties are "a verification channel... read by the runtime checks" |
| shared | adr/0040-variant-input-types.md | "Runtime checks" configured NgRx-`runtimeChecks`-style |
| shared | adr/0040-variant-input-types.md | `strictVariantNames`, `strictVariantProperties`, `strictBreakpointSync`; `provideNfsRuntimeChecks`/`provideNfsProductionRuntimeChecks` |
| shared | adr/0044-utility-directive-rule.md | Runtime-check handle naming for a multi-attribute directive |

Group e has none, and group f's "Runtime checks - not present for Toggler" heading records an absence, not a check.

### What the later milestone adds back to each spec

When this spec lands, each component spec gets back what it held at `53144f3` (`git show 53144f3:.scratch/next-foundation-specs/specs/<name>.md`): its entry under Per component, its case under Testing Decisions, and the sentences listed below, restored in the sections named. Every pointer that named the Breakpoint service spec as the home of the Runtime checks' configuration points to this spec instead, and the documented-usage sentence the first-milestone re-run wrote for the same rule stays beside the check. The misuse warnings' cross-references (a copied-class warning that leaves "consumer-declared names" to the Variant check) return with whichever of the two specs lands second. Where a sentence at `53144f3` also says how a presence marker (P1 to P5) is written, this spec restores the reading half and the [Spec: build-time checks (later milestone)](../issues/163-spec-build-time-checks-later-milestone.md) the writing half.

| Spec | Its check (Per component) | Its tests | Sentences to restore, by section at `53144f3` |
| --- | --- | --- | --- |
| `breakpoint-service.md` | The configuration, the checker, the Variant check, `strictBreakpointSync`, and What stays outside (this spec's sections) | Layer 2's Runtime-check cases, the pure Variant property reader, the SSR smoke's probe, the drift route, and the production-bundle measurement | Problem Statement (the drift bullet, the bullet on what the compiler cannot see, and the closing sentence's "one place every directive with a Variant input reports to"), Solution (the Runtime checks bullet), User Stories 3, 4, 5, 44 to 50, 52, 54, Foundation contract (the `.foundation-mq` row's last sentence), CSS class mapping (the custom properties read and the Variant property row), Hierarchy and DI shape (the Runtime checks block, the checker in the service's `uses`, the two provider functions "rather than one umbrella `provideNfs()`", the entry point's exports), API (the Class breakpoint table's "Checked by" cell, the Class breakpoint rule's report, the consumer table's Off-canvas and last rows), Implementation level (the go-live callback runs `strictBreakpointSync`), WCAG 2.2 AA (the reports add no criterion), Rendered output, Runtime checks, Rendering modes (the checks never run on the server or in `hydrate never`), Testing Decisions (the reports in a good test; the preview stylesheet sentence; the custom-map story's style block), Out of Scope (the `@property` and names-list item, the Variant tooling item, and the three Runtime-check items), Design decisions 19, 20, 22, 26 to 31, 33, Usage examples (the Runtime checks, the unit tests, the Callout), Platform features (`@property`), Sass items 3 and 5 (with P5's writing side, items 1, 2, and the rest of 5, from the build-time checks spec) |
| `badge.md` | Badge | Badge | Solution (the Variant property's readers), User story 17, Hierarchy and DI shape (the handle), API (the class guard's last clause, the read phase's creation clause, the copied-class check's last clause, the Runtime check bullet), Implementation level (the Runtime check requests), Rendering modes (before hydration), SSR smoke (no report on the server), Out of Scope (the configuration's pointer), D11, Sass items 5 and 6 |
| `button.md` | Button | Button | User story 43, Hierarchy and DI shape (the Variant check injection), API (the class guard's last clause, the Variant check bullet), Render hooks, Rendering modes (before hydration), the `button--expanded` story's reason, SSR smoke, Out of Scope (the pointer), D19 (its Runtime-check parts; P1's writing side is the build-time checks spec's), D22's alternative, Usage examples (the comment on the responsive form), Sass item 5 |
| `button-group.md` | Button Group | Button Group | User story 29, Hierarchy and DI shape (the Variant check injection), API (the Variant check bullet), Render hooks, Rendering modes (`@defer`), Testing Decisions (prior art), SSR smoke, D7's alternative, D11, Sass item 5 |
| `callout.md` | Callout | Callout | Solution, User story 29, Hierarchy and DI shape (the hook), API (the class guard, the copied-class check's last clause, the Runtime check bullet), Implementation level, Rendering modes (before hydration), SSR smoke, Out of Scope (the pointer), D11's alternative, D12, Sass item 5 |
| `close-button.md` | Close Button | Close Button | Solution, User story 27, Hierarchy and DI shape (the hook), API (the Runtime check bullet), Implementation level, Rendering modes (before hydration), D10, Sass item 5 |
| `dropdown.md` | Dropdown | Dropdown | User story 48, Hierarchy and DI shape (the `nfsVariantCheck` line), API (the Variant check bullet, check 7's last clause), Primitives, the render-hook table's Variant check row, Rendering modes (the checks in client render callbacks only), SSR smoke, Out of Scope (the pointer), D28, D29's alternative, Sass item 5 |
| `flex-grid.md` | Flex Grid | Flex Grid | Solution (the Variant properties' readers), User story 31, Hierarchy and DI shape (the handles), API (the class guard, the read phase's creation clause, the Runtime check bullet), Rendering modes (before hydration), SSR smoke, Out of Scope (the pointer), Sass item 5 |
| `flexbox-utilities.md` | Flexbox Utilities | Flexbox Utilities | Solution, User stories 24 and 25, Hierarchy and DI shape (the handles), API (the class guard, the read phase's creation clause, the Runtime check bullet), Rendering modes (before hydration), SSR smoke, Out of Scope (the pointer), D11, Sass item 5, and the reading half of items 1 and 6 (P2's writing side is the build-time checks spec's) |
| `float-grid.md` | Float Grid | Float Grid | Solution, User story 26, Hierarchy and DI shape (the handles), API (the class guard, the read phase's creation clause, the Runtime check bullet), Rendering modes (before hydration), SSR smoke, Out of Scope (the grid-count check and the pointer), D10's alternative, D12's presence-property alternative, Sass item 5 |
| `label.md` | Label | Label | Solution, User story 18, Hierarchy and DI shape (the handle), API (the class guard, the read phase's creation clause, the copied-class check's last clause, the Runtime check bullet), Implementation level, Rendering modes (before hydration), SSR smoke, Out of Scope (the pointer), D11, Sass items 5 and 6 |
| `media-object.md` | Media Object | Media Object | Solution, User stories 12 and 13, the mapping table's `stack-for` row, Hierarchy and DI shape (the handle), API (the class guard, why both families live on the section), Development checks and runtime checks (its heading and the Runtime checks paragraph), Rendering modes (before hydration), D2 (the `strictBreakpointSync` clause), D6 (its reading side; P3 and `nfs-media-object` are the build-time checks spec's), Sass item 5, Notes (the table build) |
| `menu.md` | Menu | Menu | CSS class to Angular mapping (the property the runtime check reads), Hierarchy and DI shape (the runtime checks), API (a value that maps to no class is reported), Development checks and runtime checks (its heading and the Runtime checks paragraph) |
| `off-canvas.md` | Off-canvas | Off-canvas | User story 46, Hierarchy and DI shape (the injection and the entry point's imports), API (the Class breakpoint paragraph and the Runtime checks paragraph), the render-hook table's row, Rendering modes (before hydration), SSR smoke (no report), Out of Scope (the pointer), D28, Sass (the `nfs-breakpoint-properties` clause and item 5), Foundation behaviour changed (the Runtime checks) |
| `progress-bar.md` | Progress Bar | Progress Bar | Solution, User story 21, Hierarchy and DI shape (the handles), API (the read phase's creation clause, the copied-class check's last clause, both Runtime check bullets), Implementation level, Rendering modes (before hydration), SSR smoke, Out of Scope (the pointer), D14, Sass item 5 |
| `prototyping-utilities.md` | Prototyping Utilities | Prototyping Utilities | Solution, User stories 20 and 25, the mapping table's last column and its guard sentence, Overlap resolution (the drift sentence), Hierarchy and DI shape (the handle), API (the read phase's creation clause, the Runtime check bullet), Implementation level, Rendering modes (before hydration), SSR smoke, Out of Scope (the export mixins and the pointer), D19, Sass item 5 and item 6's reading clause (P4's writing side is the build-time checks spec's) |
| `responsive-embed.md` | Responsive Embed | Responsive Embed | User stories 10 and 11, Hierarchy and DI shape (the hook), API (the copied-class check's last clause, the Runtime check paragraph), Implementation level, Rendering modes (the `hydrate never` recipe's last sentence), Sass items 5 and 6 |
| `top-bar.md` | Top Bar | Top Bar | Hierarchy and DI shape (the runtime checks), Development checks and runtime checks (its heading and the Runtime checks paragraph) |
| `typography-helpers.md` | Typography Helpers | Typography Helpers | User story 5, the mapping table's last column, Hierarchy and DI shape (the handle), API (the read phase's creation clause, the Runtime check bullet), Implementation level, Rendering modes (before hydration), SSR smoke, Out of Scope (the pointer), D15, Sass item 5 (the limit) |
| `visibility-classes.md` | Visibility Classes | Visibility Classes | User story 22, Hierarchy and DI shape (the handle), API (the mapping function's needs, the class guard, the read phase's creation clause, the Runtime check bullet), Implementation level, Rendering modes (before hydration), SSR smoke, the pure-logic test's needs, Out of Scope (the pointer), D11, D20's clause, Sass item 5 |
| `xy-grid.md` | XY Grid | XY Grid | Solution, User story 32, Hierarchy and DI shape (the handles), API (the class guard, the read phase's creation clause, the Runtime check bullet), Rendering modes (before hydration), SSR smoke, Out of Scope (the pointer), D12, Sass item 5 |
| `accordion-menu.md`, `dropdown-menu.md`, `drilldown-menu.md`, `nested-menu.md`, `responsive-menu.md` | The Menu's, through the hosted `NfsMenu` | The Menu's | The mapping tables' "runtime checks" in the Menu's cells, the Out of Scope items that name the Menu's runtime checks, and the Responsive Menu's two sentences, in CSS class to Angular mapping ("reported to the runtime checks by `NfsMenu`") and API ("declared, typed, and reported to the runtime checks by the [Spec: Menu]") |
| `reveal.md` | None of its own | None | Sass item 5's clause naming the Close Button's `strictVariantProperties` report |
| `responsive-toggle.md` | None of its own | None | API (the "No Runtime check is requested" sentence) and Out of Scope (the `strictBreakpointSync` pointer) |
| `variant-declaration-tooling.md` | None of its own | None | The ticket line, Foundation contract (the flag-gated properties "which only the runtime check reads"), the Variant property format (its readers), Rendering modes, the browser-level layer's pointer, Out of Scope (the runtime checks' owner, now this spec), the usage example's comment, and Sass item 5 |
| `abide.md`, `accordion.md`, `anchored-pane.md`, `breadcrumbs.md`, `card.md`, `equalizer.md`, `float-classes.md`, `interchange.md`, `orbit.md`, `pagination.md`, `responsive-accordion-tabs.md`, `slider.md`, `smooth-scroll.md`, `sticky.md`, `switch.md`, `table.md`, `tabs.md`, `thumbnail.md`, `toggler.md`, `tooltip.md`, `triggers.md` | None | None | Optional: each spec's sentence that it has no Variant property and so no Runtime check, where the first-milestone re-run removed it (nothing to implement) |

The forgotten-import checks spec keeps its own list: [Re-run: forgotten-import checks spec for the later milestone](../issues/164-rerun-forgotten-import-checks-later-milestone.md) points its configuration at this spec.
