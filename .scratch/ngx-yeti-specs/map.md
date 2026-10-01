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

The user asked, verbatim:

> Create a new map in .scratch/ngx-yeti-specs/map.md where the destination is /to-spec specs output for writing an Angular package that wraps Yeti. It should inherit requirements, ADRs, decisions, and principles from .scratch/next-foundation-specs/ that also make sense for Yeti but abandon those that are based on Foundation for Sites and its ancient browser targets. Compare Angular 22's browser baseline to what Yeti expects to be available in a browser.

`.scratch/next-foundation-specs/` is an input, never a constraint, and nothing in it binds this map until an inheritance ticket records it here. A record is carried over (copied into this bundle and cited to its origin), adapted (rewritten for Yeti with the reason), or abandoned (with the reason: based on Foundation 6.9's Sass, jQuery plugins, class contract, or browser target). The user stopped all work on that map on 2026-10-01 once its running subagents complete: "After the current subagents have completed, stop all work on .scratch\next-foundation-specs". Its open lazy-styles decision stays open there; this map reads its findings as evidence.

### Target platform

Angular 22.2 (`@angular/core`, `forms`, `cdk`, `aria`), Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, as in the old map's Target platform note. Yeti at `develop` (`f52d1e8b9`, 2026-09-25, `7.0.0-alpha.0` in `package.json` while the README says `7.0.0-beta`), until a version decision pins it. The browser target is open: [Decide: the browser target](issues/06-decide-browser-target.md).

### AFK override (user ruling, 2026-10-01)

Asked how decision tickets are worked, the user chose "AFK, like the old map". So this map inherits the old map's AFK override, its triage rule for human-only items (the auto-trap quadrant: only HIGH impact with NOT-HIGH confidence stays `OPEN FOR HUMAN`, recorded under `### Triage`), and its orchestration rules: never ask the user to decide, decide from sources, record `OPEN FOR HUMAN` where sources cannot settle a point, and keep going. Two kinds stay human-only: outward-facing actions under the user's identity (no upstream issues or pull requests without the user's confirmation) and checks that need a person's judgement.

### Process rules carried over (user ruling, 2026-10-01)

The user chose to carry over, as they are:

- **Audits after each wave:** an audit subagent reviews the map, tickets, and documents for compliance with `/wayfinder`, `/domain-modeling`, `/grilling`, `/research`, `/to-spec`, and `/mattpocock-skills:prototype`; findings go to `audits/NNNN-<scope>.md` with a resolution log.
- **Commit rules:** every change under `.scratch/ngx-yeti-specs/` is committed as it lands, as an atomic Conventional Commit (`docs(wayfinder): ...`) with a body that gives the why. Stage files by name and commit with `git commit -F <file>`; one resolved ticket is one commit.
- **Bundle layout:** `map.md`, `issues/NN-<slug>.md`, `research/`, `prototypes/`, `adr/`, `CONTEXT.md`, `building-blocks.md`, `specs/`, `audits/`, `README.md`, all under `.scratch/ngx-yeti-specs/`.

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

- [Decide: whether Yeti's licence and readiness allow this package](issues/15-decide-yeti-licence-and-readiness.md) -- the user ruled FSL-1.1-MIT compatible with the package as a free and open-source MIT project ([ADR 0001](adr/0001-yeti-licence-compatible-with-mit-package.md)). The readiness question moved to the Yeti version decision.
- [Research: Foundation's `llms.txt` and `llms-full.txt` as sources for this map](issues/14-research-foundationcss-llms-txt.md) -- the site-wide files at foundationcss.com cover only Inky and Proton and never mention Yeti (checked by the orchestrator). Yeti's own pair is at `/yeti/llms.txt` and `/yeti/llms-full.txt`, byte-identical to the repository's `docs/` copies at `f52d1e8b9` and generated by `bin/gen-llms.js`. They list 49 items with attribute values, defaults, modules, accessibility contracts, and tokens. The MCP server the README mentions exists nowhere. They can serve as the inventory's index, per-item context for spec agents, and a check of spec attributes in the consistency review.
- [Research: inventory of Yeti's components, layouts, recipes, utilities, and contract](issues/02-research-yeti-inventory.md) -- the built manifest at `f52d1e8b9` holds 49 items: 17 layouts, 3 recipes, 22 components, and 7 utilities (checked by the orchestrator). There are also 297 tokens in 39 groups, 32 vocabularies, 31 markers, 6 events, and 10 optional JS modules. Yeti's own documents disagree in two places: `7.0.0-beta` in the README against `7.0.0-alpha.0` in the manifest, and nine modules in one guide against ten in the stability guide and `dist/js/`. The migration guide drops Accordion Menu, Drilldown, Equalizer, Float Classes, Interchange, Toggler, Abide (`validate.js` remains), and Magellan (`toc` covers part of it). The old map's Smooth Scroll, Responsive Accordion Tabs, shared utilities, and check specs have no counterpart either, by inference. Sixteen Yeti items are new.

## Not yet specified

- The spec waves: one spec ticket per item of the spec list, grouped into waves once the list and the inherited spec shape are decided.
- The building-blocks map for Yeti: which Angular, Aria, CDK, or platform primitive each item is built on, after the inheritance and browser-target decisions.
- Testing: whether the old map's browser testing stack (ADR 0018) and its Playwright component-testing finding carry over unchanged, or need a re-check for Yeti.
- Theming and tokens in Angular: whether and how the package exposes Yeti's runtime tokens (typed inputs, providers, or nothing), after the inheritance tickets decide what replaces the old map's typed Variant inputs (ADR 0040) and class rule (ADR 0039).
- Release policy: whether the old devkit version scheme (ADR 0045) fits a package that tracks both Angular and Yeti.
- The consistency review and the bundle index (`README.md`).

## Out of scope

- Foundation for Sites 6.9 support. `.scratch/next-foundation-specs/` holds that effort, stopped by the user on 2026-10-01.
- Implementing the specs. This map stops at the specs and the building-blocks map.
- Changing Yeti itself, or filing upstream issues or pull requests without the user's confirmation.
- Moving the finished bundle into the implementing repository.
