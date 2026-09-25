# Map: next-foundation-specs

Label: wayfinder:map
Branch: wayfinder
Created: 2026-09-25

## Destination

One published spec (via `/to-spec`) for every JavaScript plugin in Foundation for Sites 6.9, each describing the Angular directive (preferred) or component that replaces it in the next, from-scratch ngx-foundation-sites repo, plus a building-blocks map that records which Angular, CDK, Aria, or native platform primitive each plugin is built on. The map is done when all 21 plugin specs exist under `specs/`, the building-blocks map agrees with them, and the consistency review has passed.

The 21 plugins (from `node_modules/foundation-sites/js/foundation.*.js`): Abide, Accordion, AccordionMenu, Drilldown, Dropdown, DropdownMenu, Equalizer, Interchange, Magellan, OffCanvas, Orbit, ResponsiveAccordionTabs, ResponsiveMenu, ResponsiveToggle, Reveal, Slider, SmoothScroll, Sticky, Tabs, Toggler, Tooltip.

Plus one CSS-only component the user added to the destination: Button. That makes 22 specs. No spec assumes the Button or Accordion directives and components that exist in this repo today; every spec is designed from scratch on the research in this effort.

## Notes

### Domain

Foundation for Sites 6.9 ships Sass plus jQuery plugins. The next library keeps Foundation's Sass and CSS class contract and replaces every plugin with an Angular directive or component. Foundation's JavaScript is never a dependency.

### Target platform (latest published as of 2026-09-25)

| Package | Version |
| --- | --- |
| @angular/core, forms, cdk, aria, material | 22.2.0 |
| nx, @nx/angular | 23.2.1 |
| storybook, @storybook/angular | 10.6.0 |
| vitest, @vitest/browser-playwright | 5.0.2 |
| typescript | 7.0.2 |
| foundation-sites | 6.9.0 |

Specs target these versions, not the Angular 21 toolchain in this repo.

### Standing preferences for every ticket

- Directive over component wherever the Foundation markup already carries the element. Component only when the plugin owns structure the consumer should not hand-write.
- Implementation order: native platform feature, then `@angular/aria`, then `@angular/cdk`, then custom Angular. Each spec must say which rung it stopped at and why.
- Foundation CSS classes and state classes (`.is-active`, `.is-open`, and so on) are the styling contract. Custom CSS only when documented as unavoidable.
- Input names come from Foundation `data-*` options in camelCase. Outputs mirror Foundation event names (`open.zf.reveal` becomes `opened` or similar; the spec decides and records the rule from the building-blocks ticket).
- Signals for state, `model()` for two-way state, `linkedSignal` for derived-but-writable, OnPush, zoneless-safe, SSR-safe.
- Accessibility: the matching WAI-ARIA APG pattern, WCAG AA, axe-clean.
- Animation (user decision): every JavaScript-driven animation in a Foundation plugin (Motion UI `animateIn`/`animateOut`, jQuery `slideDown`/`slideUp`, Orbit slide transitions, Reveal fades, Drilldown height animation) is converted to Angular `animate.enter` / `animate.leave` bindings plus native CSS animations and transitions. No `@angular/animations`, no JavaScript-timed animation. Specs say which CSS classes and keyframes each state change uses and how `prefers-reduced-motion` is honoured.
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
- Testing: Storybook play functions first, Vitest browser mode for logic, Playwright e2e for web-native APIs.

### Design criteria for every directive or component

Each Angular directive or component (one plugin may yield several related ones) is the best combination of:

- Foundation for Sites SCSS and the plugin's component features
- ARIA APG, WAI-ARIA, WHATWG HTML, and HTML5+ platform features
- Angular Aria and Angular CDK
- Angular Material-equivalent accessibility for the similar Material component
- Angular Material-equivalent component API: inputs, outputs, public properties and methods, content and view projection
- Modern DI patterns: what this repo already uses, [lightweight injection tokens](https://angular.dev/guide/di/lightweight-injection-tokens), and the patterns in Angular Aria, CDK, Material, and the Google product wrappers (youtube-player, google-maps) in the angular/components repo

### Spec shape

Every spec is a `/to-spec` spec: the to-spec template's top-level sections, with the API-design material from the repo skill `.claude/skills/foundation-api-design/SKILL.md` (CSS class mapping, hierarchy, API per directive, ARIA and keyboard tables, rendered HTML, Material comparison, usage examples, design decisions) placed as subsections inside Implementation Decisions and Further Notes. The `angular-developer` skill (`/angular-developer:angular-developer`) supplies the modern Angular API guidance. Spec Kit (`.specify/`, `specs/001-button`) is not used by this effort.

### AFK override

The user has ruled this whole map AFK: no human in the loop. Grilling and prototype tickets, which the wayfinder skill defines as HITL, are worked by an agent that plays both sides of the interview against primary sources, records every question it asked itself and the answer it settled on, and flags any decision it could not settle from sources as `OPEN FOR HUMAN` in the ticket answer rather than guessing. Prototypes may be high fidelity: a worktree of this repo, or a synthetic Nx workspace under `D:/tmp/`.

### Skills each session consults

`/research`, `/grill-with-docs` (which runs `/grilling` with `/domain-modeling`), `/to-spec`, `/mattpocock-skills:prototype`, `/playwright-cli` (for https://www.angular.courses/caniuse), and the `angular-cli` MCP `search_documentation` tool with `version: 22`.

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
- `specs/<slug>.md`: one published spec per plugin.

### Model per ticket (user instruction: pick the best of Opus 5.5, Fable 5.1, Sonnet 5 per subagent)

- Building-blocks decision ticket: Fable 5.1, the one ticket where every cross-cutting call is made.
- Spec tickets (grilling plus to-spec) and the consistency review: Opus 5.5, strong design reasoning at lower spend than Fable.
- Research inventories of local sources and straightforward prototypes: Sonnet 5. The first research wave ran on Fable before this rule existed.
- Prototypes that must settle a contested design question: Opus 5.5.

### Concurrency rules

Subagents edit only their own ticket file and the output files that ticket names. Only the orchestrating session appends to Decisions-so-far, edits other tickets, and commits. Commits stage specific files by name.

## Decisions so far

<!-- one line per closed ticket: gist, then the link that holds the detail -->

- [Foundation plugin inventory A: Accordion, Tabs, ResponsiveAccordionTabs, Toggler, Reveal](issues/01-foundation-inventory-disclosure.md) — full option, event, method, keyboard, and utility inventory of the disclosure family; event names and timing differ across it, and ResponsiveAccordionTabs, Toggler, and Reveal each carry a source bug or doc mismatch the specs must not copy. Findings: [research/foundation-inventory-disclosure.md](research/foundation-inventory-disclosure.md).
- [@angular/aria 22.2 inventory](issues/07-angular-aria-inventory.md) — eight stable headless patterns (accordion, tabs, listbox, combobox, menu, toolbar, tree, grid) with exact inputs, host ARIA, and keyboard tables; Accordion and Tabs fit Foundation directly, AccordionMenu maps to the tree in navigation mode, DropdownMenu only fits menubar with role=menu semantics the Aria guide warns against for site navigation, and no Aria pattern exists for the other fifteen plugins. Findings: [research/angular-aria-inventory.md](research/angular-aria-inventory.md).
- [Foundation plugin inventory D: Abide, Slider, Orbit, Equalizer, Interchange](issues/04-foundation-inventory-forms-media.md) — full inventories; Abide validates on change with 17 named patterns and a class-plus-aria error contract, Slider sets the APG slider ARIA itself and debounces `changed` by 500 ms, Orbit's ARIA is only `aria-live` on the active slide, Equalizer writes inline heights from resize and mutate triggers, Interchange's named queries are `landscape`, `portrait`, `retina` plus the Sass breakpoints; Triggers only snapshot resize targets once at load. Findings: [research/foundation-inventory-forms-media.md](research/foundation-inventory-forms-media.md).
- [Foundation plugin inventory C: Dropdown, Tooltip, Positionable, Sticky, Magellan, SmoothScroll](issues/03-foundation-inventory-positioned.md) — the shared Positionable and Box model (4 positions x 3 alignments, RTL-aware auto-resolution, offset formulas, overlap-area collision, body-box bound) plus per-plugin inventories; Dropdown's Enter and Space key handling is dead code, Tooltip has no Escape handling and defaults to `top`, Magellan marks the link rather than the list item, and Sticky is a JavaScript emulation of `position: sticky` with anchors and a breakpoint gate. Findings: [research/foundation-inventory-positioned.md](research/foundation-inventory-positioned.md).

## Not yet specified

- **Prototype tickets.** Several design questions will likely need a runnable artifact before a spec can commit: native `popover` plus CSS anchor positioning under Foundation's `.dropdown-pane` and `.tooltip` CSS; Signal Forms as the Abide replacement; CSS-only `position: sticky` versus a Sticky directive; scroll-snap for Orbit; a Foundation-styled `<input type="range">` for Slider; `animate.enter`/`animate.leave` with Motion UI classes; `@angular/aria` Accordion and Tabs under Foundation markup. These graduate to `prototype` tickets when a component ticket cannot settle the question from sources.
- **Shared utilities.** Whether Foundation's Triggers (`data-open`, `data-close`, `data-toggle`), MediaQuery, Motion UI, Keyboard, Nest, Box, Touch, Timer, and ImageLoader utilities earn their own directive or service specs or fold into the plugin specs that use them. Sharp after the utilities research and the building-blocks ticket.
- **Sass and theming pipeline for the new repo.** How Foundation's Sass is consumed, whether runtime theming via custom properties is part of the component contract. May be ruled out of scope by the building-blocks ticket.
- **Storybook conventions for the new repo.** Story structure, Foundation Prototype utility classes in demos, the a11y addon, and how play functions and Vitest browser mode share tests. Sharp after the tooling research.
- **Deprecated or jQuery-specific plugin behaviour.** Which Foundation behaviours (Interchange HTML partial loading, Abide live validation on input, Orbit auto-play) carry over and which are dropped. Decided plugin by plugin.

## Out of scope

- CSS-only Foundation components with no JavaScript plugin other than Button (Button Group, Callout, Card, Badge, Label, Table, Grid, Top Bar markup, Menu markup, and so on). The destination covers the 21 JavaScript plugins plus Button; other CSS-only components need no Angular counterpart beyond markup.
- This repo's existing Angular implementations (Button, Accordion, core, util-storybook). The specs are designed from scratch; the code here is neither a source nor a constraint.
- Implementing the specs. The new repo builds from them; this map stops at the specs and the building-blocks map.
- Foundation's jQuery plugin API surface (`$(el).foundation()`, `Foundation.Plugin` registration) and the Motion UI library as a dependency.
- The current repo's Sass optimisation, runtime theming, bundle, and stylesheet plans under `packages/ngx-foundation-sites/*_PLAN.md`. They describe this repo, not the next one.
- Spec Kit artifacts (`.specify/`, `specs/001-button`). The user ruled Spec Kit out; specs here follow `/to-spec`.
