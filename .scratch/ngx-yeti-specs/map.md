# Map: ngx-yeti-specs

Label: wayfinder:map
Branch: wayfinder
Created: 2026-10-01

## Destination

One published spec (via `/to-spec`) for each Yeti component, layout, recipe, and utility family that the spec-list decision keeps, plus a building-blocks map. Each spec describes the Angular directives (preferred) or component of a new Angular package that wraps Yeti, Foundation's version 7 (`yeti-css`). The building-blocks map records which Angular, CDK, Aria, or native platform primitive each one is built on. The map is done when all specs exist under `specs/`, every carried-over requirement, ADR, decision, and principle from `.scratch/next-foundation-specs/` has been triaged and recorded here, and the consistency review has passed.

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

## Not yet specified

- The spec waves: one spec ticket per item of the spec list, grouped into waves once the list and the inherited spec shape are decided.
- The building-blocks map for Yeti: which Angular, Aria, CDK, or platform primitive each item is built on, after the inheritance and browser-target decisions.
- Testing: the test layers that are new for Yeti (for example checks against Yeti's own validator or `bin/frozen.js`), once [Decide: which ADRs carry over](issues/08-decide-inherited-adrs.md) settles ADR 0018.
- Theming and tokens in Angular: whether and how the package exposes Yeti's runtime tokens (typed inputs, providers, or nothing), after the inheritance tickets decide what replaces the old map's typed Variant inputs (ADR 0040) and class rule (ADR 0039).
- Release policy: how the package versions itself against two upstreams, Angular and a pinned Yeti commit, once [Decide: which ADRs carry over](issues/08-decide-inherited-adrs.md) settles ADR 0045 and [Decide: which Yeti version the specs target, and how the package tracks it](issues/12-decide-yeti-version-policy.md) settles the pin.
- The consistency review and the bundle index (`README.md`).

## Out of scope

- Foundation for Sites 6.9 support. `.scratch/next-foundation-specs/` holds that effort, stopped by the user on 2026-10-01.
- Implementing the specs. This map stops at the specs and the building-blocks map.
- Changing Yeti itself, or filing upstream issues or pull requests without the user's confirmation.
- Moving the finished bundle into the implementing repository.
