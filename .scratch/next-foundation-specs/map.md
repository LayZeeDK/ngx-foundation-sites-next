# Map: next-foundation-specs

Label: wayfinder:map
Branch: wayfinder
Created: 2026-09-25

## Destination

One published spec (via `/to-spec`) for every JavaScript plugin in Foundation for Sites 6.9, each describing the Angular directive (preferred) or component that replaces it in the next, from-scratch ngx-foundation-sites repo, plus a building-blocks map that records which Angular, CDK, Aria, or native platform primitive each plugin is built on. The map is done when all plugin specs exist under `specs/`, the building-blocks map agrees with them, a working Playwright component test solution has been identified (or its absence proven and recorded), the browser testing stack has been decided, and the consistency review has passed.

The 21 plugins (from `node_modules/foundation-sites/js/foundation.*.js`): Abide, Accordion, AccordionMenu, Drilldown, Dropdown, DropdownMenu, Equalizer, Interchange, Magellan, OffCanvas, Orbit, ResponsiveAccordionTabs, ResponsiveMenu, ResponsiveToggle, Reveal, Slider, SmoothScroll, Sticky, Tabs, Toggler, Tooltip.

Plus one CSS-only component the user added to the destination: Button. That makes 22 component specs. The building-blocks decision added four shared-utility specs that the component specs depend on (Breakpoint service, Triggers, Anchored pane, Nested menu), so the destination is 26 specs. No spec assumes the Button or Accordion directives and components that exist in this repo today; every spec is designed from scratch on the research in this effort.

## Notes

### Domain

Foundation for Sites 6.9 ships Sass plus jQuery plugins. The next library keeps Foundation's Sass and CSS class contract and replaces every plugin with an Angular directive or component. Foundation's JavaScript is never a dependency.

### Target platform (latest published as of 2026-09-25)

| Package | Version |
| --- | --- |
| @angular/core, forms, cdk, aria, material | 22.2.0 |
| nx, @nx/angular | 23.2.1 |
| storybook, @storybook/angular-vite (preview) | 10.6.0 |
| vitest, @vitest/browser-playwright | 4.1.x |
| typescript | 6.0.x |
| foundation-sites | 6.9.0 |

Specs target these versions, not the Angular 21 toolchain in this repo. Why TypeScript and Vitest are pinned below their latest releases: [Tooling baseline: Nx 23.2, Angular 22.2, Storybook 10.6, Vitest browser mode](issues/12-tooling-baseline.md).

### Standing preferences for every ticket

- Directive over component wherever the Foundation markup already carries the element. Component only when the plugin owns structure the consumer should not hand-write.
- Implementation order: native platform feature, then `@angular/aria`, then `@angular/cdk`, then custom Angular. Each spec must say which rung it stopped at and why.
- Foundation CSS classes and state classes (`.is-active`, `.is-open`, and so on) are the styling contract. The library reuses Foundation for Sites' SCSS (its mixins, partials, settings, and classes) and never re-implements styles Foundation already has; custom CSS only for what Foundation cannot express, as the smallest rule, documented with its reason (user decision, restated 2026-09-26).
- Input names come from Foundation `data-*` options in camelCase. Outputs mirror Foundation event names (`open.zf.reveal` becomes `opened` or similar; the spec decides and records the rule from the building-blocks ticket).
- Signals for state, `model()` for two-way state, `linkedSignal` for derived-but-writable, OnPush, zoneless-safe, SSR-safe.
- Accessibility: the matching WAI-ARIA APG pattern, WCAG AA, axe-clean.
- Animation (user decision): every JavaScript-driven animation in a Foundation plugin (Motion UI `animateIn`/`animateOut`, jQuery `slideDown`/`slideUp`, Orbit slide transitions, Reveal fades, Drilldown height animation) is converted to Angular `animate.enter` / `animate.leave` bindings plus native CSS animations and transitions. No `@angular/animations`, no JavaScript-timed animation. Specs say which CSS classes and keyframes each state change uses and how `prefers-reduced-motion` is honoured.
- Rendering modes (user decision): every directive and component must support and be specified for `@defer` (including hydrate triggers), server-side rendering, prerendering, full and incremental hydration, and event replay. Each spec states how the directive renders on the server, what it must not touch before hydration, which user events replay correctly, and how it behaves inside a deferred block. The [rendering-modes research](issues/38-angular-rendering-modes.md) supplies the facts.
- Browser support (user decision): the target follows Angular 22, that is the Baseline "widely available" browser set on 2026-05-07: https://web-platform-dx.github.io/supported-browsers/?widelyAvailableOnDate=2026-05-07&includeDownstream=false. A platform feature counts as available only if it was Baseline widely available on that date; anything newer needs a fallback or is not used. Within that target, every spec considers the relevant modern JavaScript, web, browser, HTML, and CSS APIs for its directive or component. The core browser set for Angular 22, as given by the user:

  | Browser | Version | Release date |
  | --- | --- | --- |
  | Chrome | 119 | 2023-10-31 |
  | Chrome for Android | 119 | 2023-10-31 |
  | Edge | 119 | 2023-11-02 |
  | Firefox | 119 | 2023-10-24 |
  | Firefox for Android | 119 | 2023-10-24 |
  | Safari | 17 | 2023-09-18 |
  | Safari for iOS | 17 | 2023-09-18 |

  A feature is usable without a fallback only if every browser in this table supports it from the listed version.
- Testing (user decision): unit tests run on Vitest (node, for server-side rendering and pure logic) and Vitest Browser (browser-level); Playwright runs e2e; Storybook uses `@storybook/angular-vite` with Vitest interactions and interaction tests (play functions). The map must identify a working Playwright component test solution for Angular 22.2, evaluating at least `@playwright-labs/selectors-angular`, `@jscutlery/playwright-ct-angular`, `@sand4rt/experimental-ct-angular`, and Playwright's framework-agnostic component testing approach (https://playwright.dev/docs/test-components), ideally mounting and reusing CSF stories between Storybook and Playwright component tests. If a working solution is found, the [browser testing stack decision](issues/41-browser-testing-stack-decision.md) decides whether Playwright component tests replace Vitest Browser for browser-level testing. Until then, every spec's Testing Decisions names its seams as: story play function, browser-level test (stack per the browser testing stack decision), node-level Vitest, Playwright e2e; the consistency review aligns them with the final decision.

### Design criteria for every directive or component

Each Angular directive or component (one plugin may yield several related ones) is the best combination of:

- Foundation for Sites SCSS and the plugin's component features
- ARIA APG, WAI-ARIA, WHATWG HTML, and HTML5+ platform features
- Angular Aria and Angular CDK
- Angular Material-equivalent accessibility for the similar Material component
- Angular Material-equivalent component API: inputs, outputs, public properties and methods, content and view projection
- Modern DI patterns: the conventions in this repo's AGENTS.md (its component code is neither a source nor a constraint), [lightweight injection tokens](https://angular.dev/guide/di/lightweight-injection-tokens), and the patterns in Angular Aria, CDK, Material, and the Google product wrappers (youtube-player, google-maps) in the angular/components repo

### Spec shape

Every spec is a `/to-spec` spec: the to-spec template's top-level sections, with the API-design material from the repo skill `.claude/skills/foundation-api-design/SKILL.md` (CSS class mapping, hierarchy, API per directive, ARIA and keyboard tables, rendered HTML, Material comparison, usage examples, design decisions) placed as subsections inside Implementation Decisions and Further Notes (placement per `building-blocks.md` 1.14: the Material comparison sits under Implementation Decisions, the design decisions table under Further Notes). The `angular-developer` skill (`/angular-developer:angular-developer`) supplies the modern Angular API guidance. Spec Kit (`.specify/`, `specs/001-button`) is not used by this effort. The to-spec `ready-for-agent` label does not apply here: a spec file under `specs/` is published when its ticket is resolved and committed, and the consistency review is the gate before hand-off.

### AFK override

The user has ruled this whole map AFK: no human in the loop. Grilling and prototype tickets, which the wayfinder skill defines as HITL, are worked by an agent that plays both sides of the interview against primary sources, records every question it asked itself and the answer it settled on, and flags any decision it could not settle from sources as `OPEN FOR HUMAN` in the ticket answer rather than guessing. Prototypes may be high fidelity: a worktree of this repo, or a synthetic Nx workspace under `D:/tmp/`. Prototypes here are technical spikes in a real workspace; they replace the prototype skill's single-file logic demo and variant switcher, and keep its rules on stating the question, throwaway code, and capture.

### Skills each session consults

`/wayfinder` (this map's process), `/research`, `/grill-with-docs` (which runs `/grilling` with `/domain-modeling`), `/to-spec`, `/mattpocock-skills:prototype`, `/angular-developer:angular-developer` (modern Angular guidance; the API survey lists where its references disagree with the 22.2 source), the repo skill `.claude/skills/foundation-api-design/SKILL.md` (API design document shape), `/playwright-cli` (for https://www.angular.courses/caniuse and for driving prototypes), and the `angular-cli` MCP `search_documentation` tool with `version: 22`. For Angular docs contents, prefer the local clone, then web search and markdown.new, then playwright-cli.

### Sources

Local clones (read these before fetching anything online):

| Source | Path |
| --- | --- |
| Angular framework and the angular.dev docs (`adev/src/content/guide/**`, including `aria/`, `animations/`, `signals/`, `forms/`) at release branch 22.2.x (version 22.2.0) | `d:/projects/github/angular/angular` |
| Angular CDK (`src/cdk`), Aria (`src/aria`), Material (`src/material`), cdk-experimental at release branch 22.2.x (version 22.2.0) | `d:/projects/github/angular/components` |
| Foundation for Sites 6.9 (docs under `docs/pages`, plugins under `js/`) | `d:/projects/github/foundation/foundation-sites` |
| WAI-ARIA Authoring Practices Guide | `d:/projects/github/w3c/aria-practices` |
| WAI-ARIA specification | `d:/projects/github/w3c/aria` |

Online: https://angular.dev, https://material.angular.dev, https://get.foundation/sites/docs/, https://www.w3.org/WAI/ARIA/apg/, https://html.spec.whatwg.org/, https://www.angular.courses/caniuse. Fetch with markdown.new first, then WebFetch, then playwright-cli.

### Where things live (all committed under `.scratch/next-foundation-specs/`)

- `map.md`: this file.
- `issues/NN-<slug>.md`: one ticket per file. `Type:`, `Status:` (`open`, `claimed`, `resolved`), `Blocked by:` lines near the top; `## Question` body; `## Answer` appended on resolution.
- `research/<topic>.md`: research findings, cited per claim. Kept in the effort directory instead of throwaway branches so the specs can link them and the whole bundle ports to the new repo.
- `building-blocks.md`: the plugin-to-primitive map produced by the building-blocks ticket.
- `CONTEXT.md` and `adr/`: the glossary and decision records for the next library, kept here rather than at the repo root because they describe the new repo.
- `specs/<slug>.md`: one published spec per plugin, per Button, and per shared utility.
- `prototypes/<name>/`: the decisive files of each prototype, with a README stating the question, how to run it, and the verdict. Prototypes are captured here instead of on throwaway branches (an override of the prototype skill) so the new repo receives them with the specs; the full runnable workspace may stay under `D:/tmp/`.
- `audits/NNNN-<scope>.md`: compliance audits, each ending with a resolution log.
- `storybook-conventions.md`: written by the Storybook conventions ticket.
- `README.md`: the bundle index, written by the consistency review.

### Model per ticket (user instruction: pick the best of Opus 5.5, Fable 5.1, Sonnet 5 per subagent)

- Building-blocks decision ticket: Fable 5.1, the one ticket where every cross-cutting call is made.
- Spec tickets (grilling plus to-spec) and the consistency review: Opus 5.5, strong design reasoning at lower spend than Fable.
- Research inventories of local sources and straightforward prototypes: Sonnet 5. The first research wave ran on Fable before this rule existed.
- Prototypes that must settle a contested design question: Opus 5.5.
- Second working session (2026-09-25 to 2026-09-26): the orchestrator started on Opus 5.5 and switched to Fable 5.1 after the usage reset. Fable credit was out at the start of the session and is available again since the reset, so Fable 5.1 is used where a ticket makes cross-cutting calls or where it is clearly the better fit for a spec; the commit body says why whenever a ticket runs on Fable.

### Audits (user instruction)

After every wave (research, building blocks, each spec wave, testing chain, final), the orchestrator spawns an audit subagent that reviews the map, the tickets, and every other document under the effort directory for compliance with the `/wayfinder`, `/domain-modeling`, `/grill-with-docs` (and `/grilling`), `/research`, `/to-spec`, and `/mattpocock-skills:prototype` skills. Findings go to `audits/NNNN-<scope>.md` (ranked, each with file, rule, evidence, fix) and are committed; the orchestrator applies the fixes or turns them into tickets, and records what it did at the end of the audit file.

### Goal condition (set by the user)

"Your goal is achieved when the map and tickets contain decisions to produce specs for an (or multiple related) Angular directive(s)/component(s) for each component in Foundation for Sites based on research, best practices, references, prototypes, the /angular-developer:angular-developer skill, the /foundation-api-design skill (or an improved/extended spec like what it described), and modern Angular APIs."

The Destination above is how this map meets it: every component's spec exists under `specs/`, backed by resolved research, prototype, and grilling tickets.

### Orchestration rules (user instructions)

- Autonomy: the whole map runs AFK with parallel subagents. The orchestrator never asks the user to decide; it decides from sources, records `OPEN FOR HUMAN` where sources cannot settle a point, and keeps going.
- Commits: every change under `.scratch/` is committed as it lands, as an atomic, bisect-safe Conventional Commit (`docs(wayfinder): ...`) with a body that gives the why. Stage files by name, commit with `git commit -F <file>`, confirm the subject with `git log --oneline -1`. One resolved ticket is one commit: the ticket, its deliverables, and its Decisions-so-far line together.
- Waiting: wait for subagent completion notifications. Never poll with shell sleep loops.
- Spend limits: when a subagent stops on a usage or spend limit, resume that same agent with SendMessage after the reset instead of starting a fresh one, so its context is kept.
- Subagent prompts: paste the user's URL fetch fallback chain and the banned-word list into every prompt that reads the web or writes prose; tell the subagent to edit only its own ticket and deliverables and never to commit.
- Local clones: use and create clones under `d:/projects/github/<owner>/<repo>/`; check out the release branch or tag for the target version range in every `angular/*` clone (currently `22.2.x`).
- Tracker: this map uses the local-markdown tracker in `docs/agents/issue-tracker.md`. Frontier = open tickets whose `Blocked by` tickets are all `resolved`; lowest number first.
- Prototypes surfaced by specs: a spec ticket that cannot settle a question from sources writes it under `## Prototype needed` in its answer; the orchestrator graduates each into a prototype ticket that blocks a re-run of that spec, and records the graduation on the map.

### Concurrency rules

Subagents edit only their own ticket file and the output files that ticket names. Only the orchestrating session appends to Decisions-so-far, edits other tickets, and commits. Commits stage specific files by name.

## Decisions so far

<!-- one line per closed ticket: gist, then the link that holds the detail -->

- [Foundation plugin inventory A: Accordion, Tabs, ResponsiveAccordionTabs, Toggler, Reveal](issues/01-foundation-inventory-disclosure.md) -- the disclosure family's full option, event, method, and keyboard inventory, including source bugs in ResponsiveAccordionTabs, Toggler, and Reveal that the specs must not copy. Findings: [research/foundation-inventory-disclosure.md](research/foundation-inventory-disclosure.md).
- [@angular/aria 22.2 inventory](issues/07-angular-aria-inventory.md) -- eight stable headless patterns with exact inputs, host ARIA, and keys; Accordion and Tabs fit Foundation directly and fifteen plugins have no Aria pattern. Findings: [research/angular-aria-inventory.md](research/angular-aria-inventory.md).
- [Foundation plugin inventory D: Abide, Slider, Orbit, Equalizer, Interchange](issues/04-foundation-inventory-forms-media.md) -- full inventories of the forms and media plugins, including Abide's pattern and error contract and the ARIA Slider sets itself. Findings: [research/foundation-inventory-forms-media.md](research/foundation-inventory-forms-media.md).
- [Foundation plugin inventory C: Dropdown, Tooltip, Positionable, Sticky, Magellan, SmoothScroll](issues/03-foundation-inventory-positioned.md) -- the shared Positionable and Box model plus per-plugin inventories, including Dropdown's dead Enter and Space code and Sticky as a JavaScript emulation of `position: sticky`. Findings: [research/foundation-inventory-positioned.md](research/foundation-inventory-positioned.md).
- [Modern Angular 22.2 API survey](issues/06-angular-22-api-survey.md) -- every Angular 22.2 API family the specs use, with its source stability tag and the angular.courses/caniuse table; the version pins are resolved in [Tooling baseline: Nx 23.2, Angular 22.2, Storybook 10.6, Vitest browser mode](issues/12-tooling-baseline.md). Findings: [research/angular-22-api-survey.md](research/angular-22-api-survey.md).
- [Foundation plugin inventory B: AccordionMenu, DrilldownMenu, DropdownMenu, ResponsiveMenu, ResponsiveToggle, OffCanvas](issues/02-foundation-inventory-menus.md) -- the shared Menu and Nest contract, the responsive rule syntax, and per-plugin inventories, including the ARIA Foundation gets wrong on menus. Findings: [research/foundation-inventory-menus.md](research/foundation-inventory-menus.md).
- [Modern DI and composition patterns](issues/13-di-and-composition-patterns.md) -- a 30-row catalogue of DI and composition patterns from Angular, Aria, CDK, Material, and the Google product wrappers. Findings: [research/di-and-composition-patterns.md](research/di-and-composition-patterns.md).
- [@angular/cdk 22.2 inventory](issues/08-angular-cdk-inventory.md) -- module-by-module selectors, services, SSR notes, and plugin fit; nothing in CDK is deprecated in favour of Aria. Findings: [research/angular-cdk-inventory.md](research/angular-cdk-inventory.md).
- [Angular Material 22.2 counterparts as API-design reference](issues/09-angular-material-reference.md) -- per counterpart the API shape, ARIA, animation mechanics, and harnesses, with borrow and do-not-borrow lists. Findings: [research/angular-material-reference.md](research/angular-material-reference.md).
- [Foundation core conventions and shared utilities](issues/05-foundation-utilities-conventions.md) -- plugin lifecycle, Triggers, the breakpoint handshake, Motion UI, Keyboard, and Nest, with the plugin-to-utility matrix and modern counterparts. Findings: [research/foundation-utilities-conventions.md](research/foundation-utilities-conventions.md).
- [WAI-ARIA APG patterns mapped to Foundation plugins](issues/10-aria-apg-patterns.md) -- per plugin the applicable APG pattern, roles, keys, cautions, and a delta against what Foundation emits; two points are left OPEN FOR HUMAN. Findings: [research/aria-apg-patterns.md](research/aria-apg-patterns.md).
- [Tooling baseline: Nx 23.2, Angular 22.2, Storybook 10.6, Vitest browser mode](issues/12-tooling-baseline.md) -- the version matrix and pin set, generator and builder facts, and the test pyramid with Nx commands. Findings: [research/tooling-baseline.md](research/tooling-baseline.md).
- [Native web platform features that can replace Foundation JavaScript](issues/11-web-platform-features.md) -- 41 platform features graded against the Angular 22 browser target, and which plugins the platform can cover. Findings: [research/web-platform-features.md](research/web-platform-features.md).
- [Angular 22.2 @defer, SSR, prerendering, hydration, and event replay](issues/38-angular-rendering-modes.md) -- eleven library rules and a per-plugin checklist for the rendering modes; how a handler detects a replayed event is left OPEN FOR HUMAN. Findings: [research/angular-rendering-modes.md](research/angular-rendering-modes.md).
- [Playwright component testing options for Angular 22.2](issues/39-playwright-component-testing-research.md) -- no off-the-shelf Angular adapter works on Playwright 1.63; the candidate route is Playwright's built-in `mount` fixture over the Storybook iframe, with three ordered candidates for the prototype. Findings: [research/playwright-component-testing.md](research/playwright-component-testing.md).
- [Building-blocks map and cross-cutting architecture decisions](issues/14-building-blocks-map.md) -- directives on consumer-written Foundation markup with three component exceptions, one implementation level per plugin, and the cross-cutting rules every spec inherits. Matrix: [building-blocks.md](building-blocks.md); glossary: [CONTEXT.md](CONTEXT.md); ADRs 0001 to 0008 under [adr/](adr/).
- [Prototype: `animate.enter` at hydration](issues/52-prototype-animate-enter-hydration.md) -- the enter animation plays at hydration in every rendering mode and engine tested, so persistent server-rendered elements must animate through State classes; a signal-gated class list can suppress it, a same-pass CSS gate cannot. Findings: [prototypes/animate-enter-hydration/README.md](prototypes/animate-enter-hydration/README.md).

## Not yet specified

- Nothing at the moment. Prototype questions that spec tickets surface are graduated into tickets as they appear (Orchestration rules), and the hand-off of the bundle is out of scope (below).

## Out of scope

- CSS-only Foundation components with no JavaScript plugin other than Button (Button Group, Callout, Card, Badge, Label, Table, Grid, Top Bar markup, Menu markup, and so on). The destination covers the 21 JavaScript plugins plus Button; other CSS-only components need no Angular counterpart beyond markup.
- This repo's existing Angular implementations (Button, Accordion, core, util-storybook). The specs are designed from scratch; the code here is neither a source nor a constraint.
- Implementing the specs. The new repo builds from them; this map stops at the specs and the building-blocks map.
- Foundation's jQuery plugin API surface (`$(el).foundation()`, `Foundation.Plugin` registration) and the Motion UI library as a dependency.
- The current repo's Sass optimisation, runtime theming, bundle, and stylesheet plans under `packages/ngx-foundation-sites/*_PLAN.md`. They describe this repo, not the next one.
- Spec Kit artifacts (`.specify/`, `specs/001-button`). The user ruled Spec Kit out; specs here follow `/to-spec`.
- Opt-in `role="menu"` variants (DropdownMenu as an APG menubar, Drilldown as a vertical menu) for command menus. The [building-blocks decision](issues/14-building-blocks-map.md) put every menu on disclosure navigation and found no spec in the destination that needs a second role set.
- Runtime theming through custom properties as a component contract. The [building-blocks decision](issues/14-building-blocks-map.md) kept Foundation mixins and documented custom CSS in scope and ruled runtime theming out.
- Moving the finished bundle into the new repository. The destination ends at a reviewed bundle with its index (`README.md` from the [Consistency review and bundle index](issues/36-consistency-review.md)); the move, and any rewriting on the way, is the new repository's first task.
