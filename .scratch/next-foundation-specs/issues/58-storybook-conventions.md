# 58. Storybook conventions for the new library

Type: grilling
Status: resolved
Blocked by: 41
Labels: wayfinder:grilling
Map: ../map.md

## Question

What conventions do the new library's stories follow, so the 26 specs' story play functions are consistent and reusable by the browser-level and e2e layers? Refine the `<plugin>--<story>` story id scheme from `building-blocks.md` 1.3 only where the stack decision requires it; decide the story file layout per directive, `parameters.a11y.test = 'error'` with the WCAG 2.2 AA rule set, Foundation Prototype utility classes in demos, the animations-disabled token in `preview.ts`, how composed stories are shared with the browser-level layer (per the browser testing stack decision), and how e2e tests address stories in the static build.

Read first: `research/tooling-baseline.md`, `research/playwright-component-testing.md`, the answers of the Playwright component testing prototype and the browser testing stack decision, `building-blocks.md` (testing seams), and this repo's `AGENTS.md` Storybook sections as prior art (conventions only, not code).

Run `/grill-with-docs` (self-grilling, both sides). Write the result to `storybook-conventions.md` in the effort directory, record the decision log under `## Answer`, and add an ADR only if the domain-modeling bar is met.

## Answer

Resolved 2026-09-26 by self-grilling (AFK), both sides, against: the [Decide the browser testing stack: Playwright component tests, Vitest Browser, or both](41-browser-testing-stack-decision.md) answer and ADR 0018; ADR 0022; ADR 0012 and the [Sass packaging for the new library](57-sass-packaging.md) answer; `building-blocks.md` 1.3, 1.6, 1.10, 1.12; the [Prototype: Playwright component tests mounting CSF stories from @storybook/angular-vite](40-playwright-component-testing-prototype.md) answer and its `.storybook/` files; `research/tooling-baseline.md`; the Testing Decisions of the twelve published specs; this repo's AGENTS.md and `packages/ngx-foundation-sites/.storybook/` as prior art; Foundation 6.9's `scss/` (local clone); and the published tarballs `storybook@10.6.0`, `@storybook/angular-vite@10.6.0`, `@storybook/addon-a11y@10.6.0`, `@storybook/addon-vitest@10.6.0`, `axe-core@4.13.0`, `playwright@1.63.0`, packed into the scratchpad. The conventions document is [storybook-conventions.md](../storybook-conventions.md).

### Gist

One CSF file per plugin, `<plugin>/<plugin>.stories.ts`, importing the library only through its public entry points. Story ids stay `<plugin>--<story>`; the only refinement is that `<plugin>` is the entry point folder name, pinned by a string-literal `meta.id`, so the sidebar title can group plugins without touching ids. `preview.ts` sets the Accessibility gate once (`test: 'error'`, the six tags) and provides nothing else: no global `nfsAnimationsToken`, because Storybook already settles animations before axe runs and the Toggler spec tests animations on the same Story ids. One `preview.scss` imports Foundation's settings file unchanged, a short overrides file for failing Foundation defaults, Foundation, and the library source, then includes `foundation-everything($prototype: true)` and every `nfs-*` mixin. The only exception to the gate is an Anti-pattern story, which disables exactly the rules it demonstrates through `options.rules`, proves the defect in its play function, and is listed in its spec. Play functions assert DOM and ARIA state with `canvas`, `userEvent`, and the `storybook/test` helpers; args are public inputs plus output spies; e2e mounts stories by id with `embed=true` and arg names as props. No ADR: nothing here is hard to reverse.

### Decision log

Round 1 (prerequisites settled by ADR 0018, ADR 0022, ADR 0012).

1. **Which stories feed which layer?** Unchanged from ADR 0018: play functions are layer 1 and the single home of interaction tests; layer 4 mounts the same Story ids with `embed=true`; layer 2 never mounts or composes a story. Composed stories are therefore not shared with the browser-level layer (the ticket question); what layer 2 shares with stories is story-only helper code (decision 4). Source: stack ticket decisions 8 to 11.
2. **Does the stack decision require refining the id scheme?** Only to make it stable: layers 1 and 4 address the same string, so the id must not change when a title changes. Storybook builds ids as `toId(meta.id || meta.title, storyNameFromExport(exportName))` at runtime (`storybook@10.6.0` `dist/preview/runtime.js:34546, 34567-34570`) and in the static indexer (`dist/_node-chunks/chunk-PG6QDVJT.js:551`), and the indexer reads `id` as a literal (`:330`). Decision: every stories file sets a string-literal `id: '<plugin>'`. Rejected: deriving ids from a flat `title: 'Accordion'`, which ties ids to sidebar text, and this repo's `Components/Accordion` titles, which produce `components-accordion--...` and break every published spec's ids.
3. **What is `<plugin>`?** The secondary entry point folder name, which is what the published specs already use (`media-query--` for the Breakpoint service, `triggers--`, `anchored-pane--`). Source: specs' Story id lines; `building-blocks.md` 1.3 Files.
4. **Where does story-only code live?** Unexported inside the stories file when one file uses it; a sibling `*.test-helpers.ts` when browser-level specs use it too (the Triggers test Openable, the Anchored pane test consumers, which both specs say "live with the tests and the stories"). `tsconfig.lib.json` excludes both patterns. Source: `specs/triggers.md`, `specs/anchored-pane.md` Testing Decisions; the prototype's `tsconfig.lib.json`.
5. **Relative or entry-point imports in stories?** Entry point (`ngx-foundation-sites/<plugin>`), so a story can only use what consumers can import. `@storybook/angular-vite` 10.6 turns on `resolve.tsconfigPaths` by default for dev and build (`dist/preset.js:1112-1120`).

Round 2 (depends on 2-3).

6. **Story naming?** PascalCase export names with one capital per word; the id part is `sanitize(storyNameFromExport(name))` (`runtime.js:14296-14318`), so `Rtl` gives `rtl` and `RawMediaQuery` gives `raw-media-query`; `name` changes only the label; `parameters.__id` is never set. Every id in the published specs is derivable this way.
7. **Titles?** `Plugins/<Foundation docs name>`, `CSS-only components/Button`, `Shared utilities/<glossary name>`. Display only, because of decision 2.
8. **Typed `Stories` registry?** Not adopted. `StoryId` is `keyof Stories | (string & {})` and `StoryProps<T>` expects a function or class story (`playwright@1.63.0` `types/test.d.ts:7977-7987`), so a registry never rejects a mistyped id (the gallery does, at run time) and cannot type CSF args without a generated map. `mount` is called without a type argument.

Round 3 (preview and Sass; depends on 1).

9. **Is `nfsAnimationsToken` provided in `preview.ts`?** No. Storybook pauses CSS animations at their end and disables transitions before `afterEach` in Vitest browser mode, and waits up to 5 s for running animations elsewhere (`runtime.js:35010-35062, 35242, 35670`), so the gate never scans a mid-animation state. `specs/toggler.md` ("Stories set `nfsAnimationsToken` only where noted; animated stories wait for the Completion output") and its e2e test on `toggler--visibility-animated` need animations on. A story that needs them off provides the token through its own `applicationConfig`, which wins because the decorator appends story providers last (`@storybook/angular-vite` `dist/_browser-chunks/chunk-THQDNKQS.js:51-62`). Browser-level specs keep `{disabled: true}` (`building-blocks.md` 1.6 rule 5).
10. **Other global providers?** None. Zoneless is the framework default (`dist/preset.js:1079-1081`, `chunk-UJ3I56EP.js:549`); `nfsBreakpointsToken` has a root factory; Router and Defaults tokens are story-level.
11. **The a11y parameters?** `test: 'error'` and `options.runOnly` with the six tags in `preview.ts`, and no preview-level rule disabling: the addon disables `region` itself (`@storybook/addon-a11y@10.6.0` `chunk-P5J2FJ2Z.js:42-46`) and page-level rules (`landmark-one-main`, `page-has-heading-one`, `bypass`) select `html:not(html *)`, outside the addon's `include: document.body` context (`chunk-P5J2FJ2Z.js:74-77`; `axe.js:32583-32586, 33111-33113, 33331-33333`). This repo's preview disables them; not carried over.
12. **How are Foundation's Sass and the `nfs-*` mixins compiled for stories?** One `.storybook/preview.scss`, imported from `preview.ts`: `@import 'foundation-sites/scss/settings/settings'`, `@import 'settings-overrides'`, `@import 'foundation-sites/scss/foundation'`, `@import '../index'`, `@include foundation-everything($prototype: true)`, spec-requested extra Export mixins, then `nfs-breakpoint-properties`, `nfs-motion`, and each `nfs-<plugin>`. Per-component includes per story were rejected: CSS is global in the story iframe, so per-story stylesheets would accumulate anyway, and `foundation-everything` is exactly the union of the per-component includes (`foundation.scss:79-155`). The library is imported relatively because the repository is its source; the `sass` export condition is proved by ADR 0012's built-package test.
13. **Copy Foundation's settings file or import it?** Import it unchanged, then a short overrides file: stories then render Foundation 6.9's defaults exactly and every deviation is one reviewed line. A script comparing the settings file with the component `!default` values found all 490 single-line settings equal. Foundation's settings file needs `node_modules/foundation-sites/scss` on the load path (its line 2 is `@import 'util/util'`), added in `main.ts` `viteFinal`; if addon-vitest's run does not pick it up, the same path goes into `storybookAngularVitest({stylePreprocessorOptions})` (`dist/preset.js:1294-1310`). The first story of the new repository proves which; this is a setup check, not an open question.
14. **Format of a settings override?** One variable per failing default, commented with the axe rule id or SC, the spec, and the story, and repeated in that spec's Sass subsection (ADR 0018; stack ticket decision 20; `specs/tabs.md` already names its tab overrides). Never an exception to the gate.

Round 4 (the gate exception; depends on 11).

15. **Should anti-pattern stories exist at all?** Rarely: ADR 0022 and ADR 0018 keep a per-story exception only for documented anti-pattern demos, and no published spec lists one. Default: an anti-pattern is a snippet in the spec's usage notes or the docs; a rendered Anti-pattern story only when seeing it fail teaches something a snippet cannot.
16. **How is the exception declared?** Export name `AntiPattern...`, `name` starting `Anti-pattern: `, `tags: ['anti-pattern']`, and `parameters.a11y.options.rules = {'<rule-id>': {enabled: false}}` for exactly the violated rules with `test` still `'error'`. Verified mechanics: Storybook deep-merges plain-object parameters and replaces arrays (`combineParameters`, `runtime.js:14120-14129`), so `options.rules` merges with the preview's `runOnly`; axe applies a per-rule `enabled` before tag matching (`ruleShouldRun`, `axe.js:20569-20583`). Rejected: `test: 'todo'` or `'off'` and `globals.a11y.manual` (they switch off every rule, `chunk-P5J2FJ2Z.js` `afterEach`), `config.rules` (an array, so a story's value replaces the preview's instead of merging; the addon copies it into `options.rules` only under `runOnly`, `:47-62`), and `context.exclude` (hides the element from every rule).
17. **How is it reviewed?** The play function asserts the demonstrated defect; the JSDoc names the SC, the rule ids, and the correct story; the spec's Testing Decisions lists each Anti-pattern story; reviewers and the consistency review run `rg -n "enabled: false" --glob "*.stories.ts"` and match every hit to a listed, tagged story; e2e never mounts one. No custom lint: one `rg` line does the check and nothing yet uses the exception.

Round 5 (authoring; depends on 1, 9, 11).

18. **Play function API?** `({ canvas, userEvent, args, step })` from the context, `expect`, `fn`, `waitFor`, `within` from `storybook/test` (all exported by `storybook@10.6.0` `dist/test`; context `canvas` per `research/tooling-baseline.md` and the prototype's stories). `within` only to scope a subtree: the library renders every element in place (directive-first, no overlays), so nothing leaves the canvas.
19. **What a play function asserts and never does?** Asserts DOM and ARIA state, focus, spies, and the geometry or computed style the spec names (`building-blocks.md` 1.12); waits on Completion outputs, never on time; never reads instance fields or `window.ng`, runs axe, changes viewport or media, reloads, asserts server HTML, or leaves global state changed. Ends in a documented state because `embed=true` e2e never runs it.
20. **Viewport in layer 1?** Vitest's default, 414 px wide (`vitest@4` `resolved.browser.viewport.width ??= 414`, checked in this repo's `vitest@4.0.9`), below `medium`; not changed, because the Equalizer and Sticky specs already assume a narrow runner.
21. **Args and controls?** `meta.component` is the primary directive (the docgen server documents directive classes, `dist/docgen/docgen-worker.js:210, 545`); `render` with Foundation markup; args are public inputs (models bound two-way) and outputs as `fn()`; public signals and methods are shown through the template, never args. `propsTable` stays `'api'`: `'inputs'` would drop outputs from the argTypes, and its effect on output spies in args was not verified, so it is not adopted.
22. **Prototype utilities and inline styles?** All Prototype utilities are compiled (`$prototype: true`) and allowed on scaffolding only, never on Structural class elements; Foundation's typography, visibility, float, and flex classes too. The `.text-primary`-style classes in AGENTS.md are not Foundation classes (no such selector in Foundation 6.9's Sass; this repo defines them itself in `src/storybook/styles.scss`) and are dropped under the no-custom-CSS rule. Inline styles only for `--nfs-*` properties and values Foundation has no class for, as AGENTS.md says.
23. **RTL?** `dir="rtl"` on a template wrapper with CDK `Dir` imported; no global direction toolbar (a global the Vitest run never sets would leave the scenario untested).

Round 6 (e2e and rendering modes; depends on 1-2, 21).

24. **How does e2e address stories?** `mount('<plugin>--<story>', props)` with `baseURL` `.../iframe.html?embed=true` in all three engine projects (`embed=true` sets `shouldAutoplay` false, `runtime.js:36017`); props are arg names; the gallery is installed by calling an exported function from `preview.ts` (the prototype's `sideEffects: false` failure) plus the `previewHead` stub; fallback `iframe.html?id=<id>&viewMode=story&args=...` if the gallery's internals are ruled out (stack ticket OPEN FOR HUMAN 1, not re-opened here).
25. **Static build port?** 4410 as in the prototype, not 4400: `storybook dev` runs on 4400 (AGENTS.md), and `reuseExistingServer: true` would silently reuse a running dev server in place of the static build.
26. **Do stories cover rendering modes?** No. CSR only; server HTML is layer 3, hydration and replay are the fixture half of layer 4. Plain client `@defer` inside a story is allowed.
27. **Fixture app routes and Story ids?** The stack decision does not link them and ADR 0018 keeps the fixture app separate from Storybook. Convention only: one route per plugin at `/<plugin>`, the same segment as the Story id, so a spec's two e2e halves read alike.
28. **Docs pages?** `tags: ['autodocs']` in `preview.ts`, as in this repo's preview; args-driven e2e-only stories carry `'!autodocs'`.
29. **ADR?** Not written. Each decision is reversible by editing conventions and stories files; the one surprising choice (no global animation token) is recorded here and in the conventions with its reason, and the gate exception's existence is already ADR 0022's.

### Triage

Per the map's "Triage of human-only items" rule. Impact HIGH means later specs inherit it or it freezes a contract; confidence is NOT HIGH when the default is bare, carried over without deliberation, or contradicts the effort's research or ADRs.

| Item | Impact | Confidence | Outcome and evidence |
| --- | --- | --- | --- |
| Anti-pattern exception mechanism (decisions 15-17) | HIGH (every spec's gate) | HIGH: follows ADR 0018 and ADR 0022 literally; merge and axe rule precedence verified in the 10.6.0 and 4.13.0 sources | Decided |
| Story id refinement through `meta.id` (decisions 2-3) | HIGH (ids are the layer 1 and 4 contract) | HIGH: keeps every published id; mechanics verified in runtime and indexer | Decided |
| No global `nfsAnimationsToken` (decision 9) | MEDIUM (one decorator to change) | HIGH: Storybook's own animation settling verified; Toggler spec depends on it | Decided |
| Settings file imported plus overrides file (decisions 13-14) | MEDIUM | HIGH: ADR 0018's wording; 490 settings compared | Decided; load-path placement is a first-run setup check |
| `foundation-everything($prototype: true)` (decision 12) | LOW | HIGH | Decided |
| Typed `Stories` registry not adopted (decision 8) | LOW | HIGH: Playwright types read | Decided |
| Static build port 4410 (decision 25) | LOW | HIGH | Decided |
| Dropping AGENTS.md text colour classes (decision 22) | LOW | HIGH: not in Foundation's Sass; user's no-re-implementation rule | Decided |

### OPEN FOR HUMAN

None from this ticket. The gallery's dependence on Storybook preview internals stays OPEN FOR HUMAN in the [browser testing stack decision](41-browser-testing-stack-decision.md); the conventions keep its fallback one mechanical rewrite away.

### Proposed glossary changes for `CONTEXT.md` (orchestrator applies)

- **Story id** (replace): "Storybook's id of a story, `<plugin>--<story>`, where `<plugin>` is the secondary entry point folder name fixed by the stories file's `meta.id`; a spec's play functions and its Playwright e2e tests address the same story by it." _Avoid_: story name, test id, scenario. (Also drops "browser-level tests", as the stack ticket proposed.)
- New, **Anti-pattern story**: "A story that renders markup the library tells consumers not to write, to show why; the only story allowed to switch off Accessibility gate rules, and only the ones it demonstrates." _Avoid_: bad example, negative story, a11y exception.
- New (requested by the orchestrator during this ticket), **Accessibility gate**: "The story-level axe run with the WCAG 2.2 AA tags that fails a story on any violation; the check that enforces the library's accessibility requirement." _Avoid_: a11y check, axe run (as the name), lint.

### Other proposed shared-file changes (orchestrator applies)

- `building-blocks.md` 1.3 Story ids bullet: add "`<plugin>` is the entry point folder name, pinned by `meta.id`; conventions in [storybook-conventions.md](storybook-conventions.md)".
- `building-blocks.md` 1.6 rule 5: add "Stories do not provide it globally (Storybook conventions, section 4)".
- `building-blocks.md` 1.10 (orchestrator's request during this ticket, outside this ticket's edit scope): a first bullet stating WCAG 2.2 AA as a requirement with the criteria subsection, the Sass settings or smallest `nfs-<plugin>` rule for failing Foundation defaults (1.4.3, 1.4.11, 2.5.8, 2.4.11 so far), the six axe tags, the story gate as the enforcing check, and the compile-time `color-contrast()` check where axe has no rule (ADR 0022); and the gate bullet rewritten to name `runOnly` with `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice` instead of "widened to WCAG 2.2 AA", and "opt out" replaced by "the Anti-pattern story exception in the Storybook conventions".
- Consistency review checks: specs that list five tags without `best-practice` (`specs/sticky.md`, `specs/smooth-scroll.md`, `specs/toggler.md`) follow `preview.ts`'s six; every spec's Story ids derive from PascalCase export names (all current ones do); `anchored-pane--fixture` could be renamed (for example `anchored-pane--geometry`) so "fixture" stays reserved for the Fixture app, and it takes `!autodocs`; every spec's Sass overrides for failing defaults appear in `_settings-overrides.scss` form.
- `map.md` Decisions so far: one line for this ticket.
