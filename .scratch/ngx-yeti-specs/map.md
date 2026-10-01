# Map: ngx-yeti-specs

Label: wayfinder:map
Branch: wayfinder
Created: 2026-10-01

## Destination

One published spec (via `/to-spec`) for each Yeti component, layout, recipe, and utility family that the spec-list decision keeps, plus a building-blocks map and a ledger (`ledger.md`) of every standards, accessibility, and Angular Aria, CDK, or Material feature the package adds that Yeti itself lacks. Each spec describes the Angular directives (preferred) or component of a new Angular package that wraps Yeti, Foundation's version 7 (`yeti-css`). The building-blocks map records which Angular, CDK, Aria, or native platform primitive each one is built on. The map is done when all specs exist under `specs/`, every carried-over requirement, ADR, decision, and principle from `.scratch/next-foundation-specs/` has been triaged and recorded here, and the consistency review has passed.

## Notes

### Domain

Yeti (https://github.com/foundation/yeti, `develop` branch; docs at https://www.foundationcss.com/yeti/) is the successor to Foundation for Sites. Its README describes "a CSS-first, native, zero-build layout and styling framework": one stylesheet, no Sass, cascade layers, container queries, runtime `--yeti-*` tokens, and optional JavaScript modules. Its README says it targets Baseline 2025, and its stability guide (`src/guides/stability.md`) lists what `7.0.0-beta` froze. The Angular package wraps Yeti's CSS and attribute contract and replaces or complements its optional JavaScript; which of those it does is decided here.

The user ruled Yeti's FSL-1.1-MIT licence compatible with this package as a free and open-source MIT project ([ADR 0001](adr/0001-yeti-licence-compatible-with-mit-package.md)). Yeti's announcement (foundation/yeti#15554) says of `develop`, "unstable until the beta. Do not build on it yet." The user ruled on readiness, verbatim: "Readiness: We will spec and build against a specific commit of `foundation/yeti`'s `develop` branch." Which commit, how the pin moves, and how the package depends on unpublished Yeti are decided in [Decide: which Yeti version the specs target, and how the package tracks it](issues/12-decide-yeti-version-policy.md).

### Inheritance from next-foundation-specs (user instruction, 2026-10-01)

The user asked, verbatim (the user's own message to the orchestrator, 2026-10-01; the orchestrator holds the conversation):

> Create a new map in .scratch/ngx-yeti-specs/map.md where the destination is /to-spec specs output for writing an Angular package that wraps Yeti. It should inherit requirements, ADRs, decisions, and principles from .scratch/next-foundation-specs/ that also make sense for Yeti but abandon those that are based on Foundation for Sites and its ancient browser targets. Compare Angular 22's browser baseline to what Yeti expects to be available in a browser.

`.scratch/next-foundation-specs/` is an input, never a constraint, and nothing in it binds this map until an inheritance ticket records it here. A record is carried over (copied into this bundle and cited to its origin), adapted (rewritten for Yeti with the reason), or abandoned (with the reason: based on Foundation 6.9's Sass, jQuery plugins, class contract, or browser target). The user stopped all work on that map on 2026-10-01 once its running subagents complete (the user's own message to the orchestrator, 2026-10-01; the orchestrator holds the conversation): "After the current subagents have completed, stop all work on .scratch\next-foundation-specs". Its open lazy-styles decision stays open there; this map reads its findings as evidence.

### Target platform

Angular 22.2 (`@angular/core`, `forms`, `cdk`, `aria`), Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, as in the old map's Target platform note. Yeti at `develop` (`f52d1e8b9`, 2026-09-25, `7.0.0-alpha.0` in `package.json` while the README says `7.0.0-beta`), until a version decision pins it. The browser target is open: [Decide: the browser target](issues/06-decide-browser-target.md).

### AFK override (user ruling, 2026-10-01)

Asked how decision tickets are worked, the user chose "AFK, like the old map" (the label of the option the user picked in the orchestrator's question, 2026-10-01). So this map inherits the old map's AFK override, its triage rule for human-only items (the auto-trap quadrant: only HIGH impact with NOT-HIGH confidence stays `OPEN FOR HUMAN`, recorded under `### Triage`), and its orchestration rules: never ask the user to decide, decide from sources, record `OPEN FOR HUMAN` where sources cannot settle a point, and keep going. Two kinds stay human-only: outward-facing actions under the user's identity (no upstream issues or pull requests without the user's confirmation) and checks that need a person's judgement.

### Process rules carried over (user ruling, 2026-10-01)

The user chose to carry over, as they are:

- **Audits after each wave:** an audit subagent reviews the map, tickets, and documents for compliance with `/wayfinder`, `/domain-modeling`, `/grilling`, `/research`, `/to-spec`, and `/mattpocock-skills:prototype`; findings go to `audits/NNNN-<scope>.md` with a resolution log.
- **Commit rules:** every change under `.scratch/ngx-yeti-specs/` is committed as it lands, as an atomic Conventional Commit (`docs(wayfinder): ...`) with a body that gives the why. Stage files by name and commit with `git commit -F <file>`; one resolved ticket is one commit.
- **Bundle layout:** `map.md`, `issues/NN-<slug>.md`, `research/`, `prototypes/`, `adr/`, `CONTEXT.md`, `building-blocks.md`, `specs/`, `audits/`, `README.md`, all under `.scratch/ngx-yeti-specs/`.

### Standing rulings (the user's own messages to the orchestrator, 2026-10-01)

- Browser target: "26. Browser baseline: For this project, accept Yeti's Baseline 2025 or the least common denominator browser set/baseline supporting browser/CSS features Yeti relies on." [Decide: the browser target](issues/06-decide-browser-target.md) chooses between the two.
- Components for styles: "28. If using Angular components with styles/styleUrl(s) can be used for lazy-loading/unloading component-specific styles and to pass requirements and bugs Angular's leave-animation guard and Beasties critical CSS, that's a valid reason to use components instead of directives where applicable." This relaxes the old map's "directive over component" preference for this map, wherever a component's `styleUrl` is what makes lazy styles meet the requirements. [Decide: which standing preferences and user rulings carry over](issues/07-decide-inherited-preferences-and-rulings.md) and [Decide: how component styles load and unload](issues/13-decide-style-loading.md) apply it.
- Deployment URLs: "29. `deployUrl`/`--deploy-url` is unsupported/to-be-removed as per https://angular.dev/tools/cli/build-system-migration#manual-migration-to-the-new-application-builder so we don't need to support it. Only `baseHref`/`--base-href`/`<base href>` should be supported." No spec supports or tests `deployUrl`.
- Hydration features: "We must not forget about support for `withEventReplay()`, `provideClientHydration()`, [incremental hydration](https://angular.dev/guide/incremental-hydration), and `withI18nSupport()`." Every spec states how its directives or components behave under each of these, and [Prototype: Yeti under SSR, hydration, `@defer`, event replay, and `animate.enter` and `animate.leave`](issues/18-prototype-yeti-rendering-modes.md) measures them.
- Building Yeti: "31. As written in Yeti's documentation, it is expected that in this alpha stage, the consumer must run npm build in the repo and `esbuild` locally to use their CSS (and JS). If we need to compile it, we can use an `@nx/*` plugin/executor to automate this process. Note that Nx 24 was just released and removes all/most executors, replacing them with inferred task plugins. Read its docs and README on building, consuming, and customizing/theming it." The user then pointed at https://nx.dev/blog/look-mum-no-executors. The orchestrator read it on 2026-10-01: the post (dated 2026-09-29) says Nx v24 "ships in a few weeks", and npm's `latest` is still 23.2.1. v24 removes the deprecated built-in executors, among them `@nx/vite:*`, `@nx/vitest:test`, `@nx/storybook:*`, `@nx/playwright:playwright`, `@nx/eslint:lint`, and `@nx/jest:jest`, in favour of inferred-task plugins. It keeps `nx:run-commands`, the `@nx/js` build executors, `@nx/esbuild:esbuild`, and every `@nx/angular` executor. So the specs plan on inferred tasks for testing and linting, and ticket 22 decides how Yeti gets built. Asked about trying Nx 24 and whether 23.3.0-beta.7 becomes it, the orchestrator found on 2026-10-01 that it does not. Nx 21, 22, and 23 each began their own `X.0.0-beta.0` line 3 to 13 weeks before release, while the previous major's minor betas shipped as that minor. No 24.x exists on npm. nrwl/nx's `next-major` branch is 0 commits ahead of master, and the removal is in open draft PRs such as #37160. Until `24.0.0-beta.0` appears, prototypes stay on Nx 23.2 and are made v24-ready by construction: `nx g infer-targets`, and no target on v24's removal list. The orchestrator recommended this plan, and the user approved it, verbatim: "41. Approve recommendation." So it is a ruling.
- Accessibility and parity ledger: "36. Every accessibility/browser spec feature (including WHATWG, WAI-ARIA, WCAG, ARIA APG, and so on) added that isn't supported by Yeti itself must be documented in a ledger or something like that, for example to keep track of which accessibilty checks that is compliant because of ngx-yeti, not because of Yeti itself. The same goes for features added inspired by or for feature parity/overlap with Angular Aria/CDK/Material." The bundle keeps `ledger.md`; every spec adds its rows, and [Decide: the building-blocks map for every ngx-yeti item](issues/25-decide-building-blocks-map.md) sets its format.
- Angular Aria and CDK first: "37. Make sure we utilize Angular Aria and CDK where possible to replace Yeti's JavaScript modules and comply with accessibility standards and best practices."
- Building-blocks audit: "38. Make a building blocks audit for every component going into ngx-yeti like we did for Foundation for Sites v6.9 components going into ngx-foundation-sites." Ticket 25 is that audit.
- Zoneless: "43. All specs must support zoneless." Every directive, component, and service works under zoneless change detection, and each spec's tests run zoneless. [Prototype: Yeti under SSR, hydration, `@defer`, event replay, and `animate.enter` and `animate.leave`](issues/18-prototype-yeti-rendering-modes.md) found that a plain field written from a Yeti event listener does not refresh the view zoneless, while a signal does.
- Upstream bugs: "44. Keep a ledger of upstream bugs found and whether they have been verified and have a minimal reproducible example. Accessibility issues go in the accessibility ledger." The bundle keeps [upstream-bugs.md](upstream-bugs.md) for Yeti, Angular, and other upstreams, and `ledger.md` holds accessibility issues. No upstream report is filed without the user's confirmation.
- `data-*` attributes: "42. Audit Yeti's `data-*` attributes and determine how each will be mapped/managed by ngx-yeti." [Decide: how the package maps each of Yeti's `data-*` attributes](issues/26-decide-yeti-data-attributes-mapping.md) does the audit.
- Temporary files: the user's temporary replies file in the repository root is never referenced, read as evidence, staged, or committed (item 30). Every brief says so.

### Models and briefs (user ruling, 2026-10-01)

Model, effort, and prompting follow the user's global CLAUDE.md and `~/.claude/references/subagent-model-choice.md` and `prompting-<model>.md`, re-read before each wave. Every subagent is a `<model>-<effort>` type with `model` unset. As read on 2026-10-01:

- `sonnet-medium`: fixed-brief inventories, checks against stated criteria, and audits, each with a real check named in the brief and the research search nudge.
- `opus-medium`: specs, judgment calls, and prototypes; `opus-high` where a prototype must settle a contested question.
- `fable-high`: open-ended research, architecture, and cross-cutting decisions; `fable-low` for long research loops.

Every background brief names the finish line and carries the model's unattended-run block. Every brief asks the agent to separate what it checked from what it inferred, gives the user's approvals only as the user's own words, forbids identity searches, and carries the banned-word list and the URL fetch fallback chain.

### Skills each session consults

`/wayfinder`, `/research`, `/grilling` with `/domain-modeling`, `/to-spec`, `/mattpocock-skills:prototype`, `/angular-developer:angular-developer`, and the `angular-cli` MCP `search_documentation` tool with `version: 22`.

### Sources

| Source | Path |
| --- | --- |
| Yeti at `develop` | `d:/projects/github/foundation/yeti` |
| Angular framework and docs, 22.2.x | `d:/projects/github/angular/angular` |
| Angular CDK, Aria, Material, 22.2.x | `d:/projects/github/angular/components` |
| WAI-ARIA APG and WAI-ARIA | `d:/projects/github/w3c/aria-practices`, `d:/projects/github/w3c/aria` |
| The old bundle (evidence only) | `.scratch/next-foundation-specs/` |

Online: https://www.foundationcss.com/yeti/, https://github.com/foundation/yeti/issues/15554, https://web-platform-dx.github.io/web-features-explorer/. Fetch with markdown.new first, then WebFetch, then playwright-cli.

### Concurrency rules

Subagents edit only their own ticket and the output files it names. Only the orchestrating session appends to Decisions so far, edits other tickets, and commits.

## Decisions so far

- [Decide: whether Yeti's licence and readiness allow this package](issues/15-decide-yeti-licence-and-readiness.md) -- the user ruled FSL-1.1-MIT compatible with the package as a free and open-source MIT project ([ADR 0001](adr/0001-yeti-licence-compatible-with-mit-package.md)); readiness moved to the Yeti version decision.
- [Research: Foundation's `llms.txt` and `llms-full.txt` as sources for this map](issues/14-research-foundationcss-llms-txt.md) -- Yeti's own `/yeti/llms.txt` and `/yeti/llms-full.txt` match the repository's generated copies and list all 49 items; the domain-root pair covers other tools, and the MCP server the README mentions does not exist.
- [Research: inventory of Yeti's components, layouts, recipes, utilities, and contract](issues/02-research-yeti-inventory.md) -- 49 items (17 layouts, 3 recipes, 22 components, 7 utilities), 297 tokens, and 10 optional modules; eight old specs have no counterpart per the migration guide, and 16 Yeti items are new.
- [Research: Yeti's JavaScript modules and what Angular adds](issues/03-research-yeti-javascript-and-angular.md) -- 760 lines across ten optional modules, and most items need types only; a template cannot bind a `yeti:`-prefixed event, and `validate.js` never runs on a form under an Angular form directive.
- [Research: Angular 22's browser baseline against what Yeti expects](issues/01-research-browser-baseline-vs-yeti.md) -- Angular 22 implies Chrome, Edge, and Firefox 119 and Safari 17; Yeti implies Chrome and Edge 141, Firefox 145, and Safari 26.2. 33 Yeti features fall outside Angular's set and 27 are unguarded, `light-dark()` and invoker commands among them (per web-features data).
- [Research: Yeti's styling model, and loading component styles lazily](issues/04-research-yeti-styles-and-lazy-loading.md) -- on static light-scheme pages, each of the 49 part files loads alone beside Yeti's always-loaded group (one earlier difference on the demo pages was not reproduced or explained). Most of the old map's constraints disappear; Angular's leave-animation guard remains, and the library's own `styleUrl` per part passed except for that leak.
- [Research: binding Yeti's `yeti:*` events in Angular templates](issues/16-research-yeti-events-in-angular-templates.md) -- `(yeti:close)` fails at compile time, before any plugin sees it. Three ways work (measured, zoneless and SSR): an event manager plugin that maps an alias such as `(yeti-close)`, typed only through a global `HTMLElementEventMap` entry; a re-dispatcher, which costs one extra event per Yeti event and a fixed name list; and a directive `output()`, typed with no global entry but needing one output per event. None replays events, and an event fired before bootstrap is lost. `HammerModule` is gone from Angular 22.2 (checked by the orchestrator), and no package maps colon-named events.
- [Research: what `validate.js` does, and replacing it with Angular Signal Forms](issues/19-research-yeti-validate-and-signal-forms.md) -- `validate.js` has no rules of its own: on submit it marks the controls the browser's native validation rejects, writes the browser's message into the error slot, focuses the first, and dispatches `yeti:invalid`. Under Signal Forms or reactive forms it never runs (measured in three engines). Signal Forms covers the rules, submit blocking, `onInvalid`, and focus. Nothing in Angular sets `aria-invalid` or `aria-describedby` or fills the error slot, so the package must. The old Forms and Abide specs' error-state policy, composed `aria-describedby`, and pre-hydration gate may transfer (inferred).
- [Prototype: Yeti as a dependency from GitHub at a pinned commit](issues/21-prototype-yeti-as-github-dependency.md) -- a plain git dependency (`github:foundation/yeti#f52d1e8b9`) or the GitHub tarball installs without `dist/`, because `dist/` is git-ignored and Yeti has no `prepare` script (checked by the orchestrator), so `ng build` fails. Four options pass `npm ci` and `ng build` with Yeti's CSS and a module in the output: an `npm pack` tarball of a local build (the most reproducible: integrity hash, no network at install), a git submodule built in place, a `prebuild` script that fetches and builds the pinned commit, and a git dependency on a commit that adds a `prepare` script, which needs a change in Yeti. Downstream installs and Linux CI were not tested.
- [Prototype: Yeti's modules in a single-page Angular app](issues/20-prototype-yeti-in-single-page-apps.md) -- measured in three engines under `<base href="/sub/">`, the three inferred failures are real. Loaded as documented, `tabs.js`, `toc.js`, and `enter.js` run before Angular bootstraps, so they miss even the first route: every tab panel shows until the first click. A bare `#id` link reloads the page onto the home route. A popover or modal dialog in the persistent shell stays open across navigation, and the page stays inert. Re-running the modules stacks listeners, firing N+1 `yeti:select`. Owner directives work in about 150 lines. Closing overlays on `NavigationStart` (about 15 lines) and a `#id` click interceptor through `location.hash` fix the other two. Hover, carousel, validate, and range were not tested.
- [Research: Yeti against WHATWG, WAI-ARIA, the APG, and Angular Aria, CDK, and Material patterns](issues/17-research-yeti-accessibility-and-standards.md) -- axe with the WCAG 2.2 AA tags finds 0 violations on all 49 docs examples in three engines, light and dark, and the Nu Html Checker finds 0 errors. Every focus ring meets 3:1. Most interactive items follow their APG pattern. The deviations: the tooltip ignores Escape; dropdown and nav panels stay open on focus-out; the carousel has no previous and next buttons, slide roles, or current-slide marker; vertical tabs lack `aria-orientation`; the required `*` is in a field's name; and Yeti has no `forced-colors` rules (both checked by the orchestrator), so pressed, checked, and selected states vanish under forced colours. The Angular blocks that supply what is missing include CDK's `high-contrast` mixin, `FocusMonitor`, `FocusKeyManager`, `FocusTrap`, `LiveAnnouncer`, Aria's tab list and toolbar, and Material's input ARIA bindings.
- [Prototype: Yeti under SSR, hydration, `@defer`, event replay, and `animate.enter` and `animate.leave`](issues/18-prototype-yeti-rendering-modes.md) -- measured in eight production SSR builds in three engines. Every item renders styled with JavaScript off. In Angular 22.2, `provideClientHydration()` includes incremental hydration and event replay unless `withNoIncrementalHydration()` is passed (checked by the orchestrator). Hydration writes static template attributes again, so a static `open` or `aria-selected` undoes what the user or a Yeti module changed before load. Without `withI18nSupport()`, an `i18n` component re-renders and loses its state. Client-rendered `@defer` blocks get tabs that `tabs.js` never sets up. A `hydrate never` block loses its `styleUrl` styles when the last live instance leaves. A function-form `(animate.leave)` keeps styles loaded; the class form does not. The minified `--yeti-duration-fast` (`.15s`) makes `alert.js` fade for 0.15 ms (checked: `alert.js:12` reads it as milliseconds).

## Not yet specified

- The spec waves: one spec ticket per item of the spec list, grouped into waves once the list and the inherited spec shape are decided.
- Testing: the test layers that are new for Yeti (for example checks against Yeti's own validator or `bin/frozen.js`), once [Decide: which ADRs carry over](issues/08-decide-inherited-adrs.md) settles ADR 0018.
- Theming and tokens in Angular: whether and how the package exposes Yeti's runtime tokens (typed inputs, providers, or nothing), after the inheritance tickets decide what replaces the old map's typed Variant inputs (ADR 0040) and class rule (ADR 0039).
- Release policy: how the package versions itself against two upstreams, Angular and a pinned Yeti commit, once [Decide: which ADRs carry over](issues/08-decide-inherited-adrs.md) settles ADR 0045 and [Decide: which Yeti version the specs target, and how the package tracks it](issues/12-decide-yeti-version-policy.md) settles the pin.
- The consistency review and the bundle index (`README.md`).

## Out of scope

- Foundation for Sites 6.9 support. `.scratch/next-foundation-specs/` holds that effort, stopped by the user on 2026-10-01.
- Implementing the specs. This map stops at the specs and the building-blocks map.
- Changing Yeti itself, or filing upstream issues or pull requests without the user's confirmation.
- Moving the finished bundle into the implementing repository.
