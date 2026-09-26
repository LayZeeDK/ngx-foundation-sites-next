# Storybook conventions for the new library

Ticket: [Storybook conventions for the new library](issues/58-storybook-conventions.md). Written 2026-09-26. Every spec's stories follow this document; where a published spec says something different, this document wins and the [Consistency review and bundle index](issues/36-consistency-review.md) aligns the spec (the list is in the ticket answer).

Versions: `storybook`, `@storybook/angular-vite`, `@storybook/addon-vitest`, `@storybook/addon-a11y` 10.6.0; Vitest 4.1 browser mode; `@playwright/test` 1.63; axe-core 4.13.0 (map, Target platform). `<lib>` is the library project, `<plugin>` a secondary entry point folder name.

## 1. Purpose

A story is three things at once, and the conventions exist so it can be all three without being written twice:

1. The consumer-facing demo of one scenario of one plugin, rendered under Foundation's CSS as a consumer compiles it.
2. The single home of that scenario's interaction test (its play function) and of its accessibility check, run by `npx nx test-storybook <lib>` through `@storybook/addon-vitest` (layer 1 of the pyramid in `building-blocks.md` 1.12 and ADR 0018).
3. The artifact the Playwright e2e layer opens by Story id in three engines, through `mount(storyId, props?)` over the static build (layer 4, Storybook half).

Stories are never mounted by browser-level tests (layer 2) and never render server HTML (ADR 0018).

## 2. File layout

- One CSF file per plugin: `<plugin>/<plugin>.stories.ts`, next to the directive, in the plugin's secondary entry point folder (`building-blocks.md` 1.3). A shared utility follows the same rule in its own folder (`triggers/triggers.stories.ts`, `media-query/media-query.stories.ts`).
- Library symbols are imported only through public entry points: `import { NfsAccordion, NfsAccordionItem } from 'ngx-foundation-sites/accordion';`, also inside the plugin's own stories file. A story therefore uses exactly what a consumer can import, and a symbol missing from `public-api.ts` fails the story. `@storybook/angular-vite` 10.6 resolves these through tsconfig paths in both `storybook dev` and `storybook build` (`resolve.tsconfigPaths` defaults to `true` in its `viteFinal`, `dist/preset.js:1112-1120`).
- Story-only code (demo components that print a service's values, log components, test Openables, test panes and tips) is never exported from an entry point:
  - used by one stories file only: declared, not exported, inside that `.stories.ts` file (CSF treats every named export as a story);
  - also used by browser-level specs (the Triggers test Openable, the Anchored pane test consumers): a sibling `<name>.test-helpers.ts`, imported relatively.
- `tsconfig.lib.json` excludes `**/*.stories.ts` and `**/*.test-helpers.ts` (the prototype's `tsconfig.lib.json` already excluded stories); `.storybook/tsconfig.json` includes both patterns and `.storybook/*.ts`.
- Storybook configuration lives in `<lib>/.storybook/`: `main.ts`, `preview.ts`, `preview.scss`, `_settings-overrides.scss`, `playwright-gallery.ts`, `tsconfig.json`; `vitest.config.ts` at the project root as written by `npx storybook add @storybook/addon-vitest --config-dir <lib>/.storybook`.
- `main.ts`: `framework: '@storybook/angular-vite'`, `stories: ['../**/*.stories.ts']`, addons `@storybook/addon-docs`, `@storybook/addon-a11y`, `@storybook/addon-vitest`, and the gallery's `previewHead` stub (section 10). Zoneless needs no option: the framework defaults to it (`resolveZoneless`, `dist/preset.js:1079-1081`).

## 3. Ids and naming

### Story id

`<plugin>--<story>`, kebab case, where `<plugin>` is the secondary entry point folder name (`accordion`, `off-canvas`, `media-query` for the Breakpoint service, `triggers`, `anchored-pane`) and `<story>` is derived from the story's export name.

- Every stories file sets `id: '<plugin>'` in its default export. Storybook builds a story id as `toId(meta.id || meta.title, storyNameFromExport(exportName))` both at runtime (`storybook@10.6.0` `dist/preview/runtime.js:34567-34570, 34546`) and in the static index (`dist/_node-chunks/chunk-PG6QDVJT.js:551`), so pinning `meta.id` keeps ids stable whatever the sidebar title says. `id` and `title` must be string literals: the indexer reads them from the source without running it (`chunk-PG6QDVJT.js:330`).
- The `<story>` part comes from the export name only: `storyNameFromExport` start-cases it (`RawMediaQuery` becomes "Raw Media Query") and `sanitize` lowercases it and turns every non-alphanumeric run into one hyphen (`runtime.js:14296-14318`). A story's `name` changes the sidebar label, not the id. Never set `parameters.__id`.
- Export names are PascalCase with one capital per word, so the id is the spec's kebab id: `DisabledInteractive` -> `disabled-interactive`, `Rtl` -> `rtl` (not `RTL`), `TwoHandles` -> `two-handles`. Digits become their own word (`Step5` -> `step-5`).
- The ids a spec lists in its Testing Decisions are the contract; adding a story adds an id to the spec, renaming one is a breaking change to that spec's e2e tests.

### Title

`title: '<Group>/<Name>'` with three groups: `Plugins/<Foundation docs name>` (`Plugins/Accordion`, `Plugins/Off-canvas`), `CSS-only components/Button`, `Shared utilities/<glossary name>` (`Shared utilities/Breakpoint service`, `Shared utilities/Triggers`). The title is display only; the id comes from `meta.id`.

### Story names

One scenario per story, named for the scenario, not for the test: `Default` (Foundation's docs markup, used as-is) comes first when the plugin has a docs example; then Foundation's docs examples in docs order; then library scenarios (`Rtl`, `DisabledInteractive`, `SignalForms`). Stories that show a platform alternative with no directive (Interchange `Picture`, Equalizer `CssFlexCells`) say so in their JSDoc and belong to the plugin whose job they replace. Stories that exist only as args-driven targets for e2e geometry sweeps (the Anchored pane's matrix story) carry the `!autodocs` tag; they still pass the Accessibility gate.

## 4. Preview configuration

`preview.ts` holds the whole global configuration; a stories file adds only what its own scenarios need.

```ts
import type { Preview } from '@storybook/angular-vite';
import './preview.scss';
import { installPlaywrightGallery } from './playwright-gallery';

installPlaywrightGallery();

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    a11y: {
      test: 'error',
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'],
        },
      },
    },
  },
};

export default preview;
```

- No global decorators and no global `applicationConfig` providers. In particular `nfsAnimationsToken` is not provided in `preview.ts`: stories run with animations on, as a consumer's app does. Reasons: the Toggler spec's `toggler--visibility-animated` play function and its e2e test assert the keyframes and the Completion output on the same Story id, which a global `{disabled: true}` would make impossible; the addon's axe run never sees an animation in flight anyway, because Storybook jumps CSS animations to their end and turns transitions off before `afterEach` in Vitest browser mode (`pauseAnimations`, `runtime.js:35020-35037, 35242, 35670`) and waits up to 5 s for running animations everywhere else (`waitForAnimations`, `runtime.js:35038-35062`). A story that needs animations off provides `{provide: nfsAnimationsToken, useValue: {disabled: true}}` through its own `applicationConfig` decorator, and its JSDoc says why. Story-level `applicationConfig` providers win over outer ones: the decorator concatenates the outer providers first and the story's last (`@storybook/angular-vite` `dist/_browser-chunks/chunk-THQDNKQS.js:51-62`), and the last provider for a token wins. Browser-level specs keep providing `{disabled: true}` (`building-blocks.md` 1.6 rule 5); that rule is about TestBed, not stories.
- Other providers are story-level too: `provideRouter` for a router story, a story-level `nfsBreakpointsToken` or Defaults token, a `Directionality` source. `nfsBreakpointsToken` needs no preview provider: its root factory returns Foundation's default map, which `preview.scss` also compiles.
- `parameters.a11y` is set once, here. The six tags are named because axe-core 4.13.0 ships `target-size` (SC 2.5.8, tag `wcag22aa`) disabled and a tag-matched rule runs even when shipped disabled (ADR 0018, decision 20 of the stack ticket). No rule is disabled in `preview.ts`: the addon already disables `region` (`@storybook/addon-a11y@10.6.0` `dist/_browser-chunks/chunk-P5J2FJ2Z.js:42-46`), and page-level rules such as `landmark-one-main`, `page-has-heading-one`, and `bypass` select `html:not(html *)`, which is outside the addon's context (`include: document.body`, `chunk-P5J2FJ2Z.js:74-77`; `axe.js:32583-32586, 33111-33113, 33331-33333`), so they are never applicable. The current repo's preview disables them anyway; that is not carried over.
- Right-to-left scenarios put `dir="rtl"` on a wrapper element in the story template and import CDK's `Dir` directive (`@angular/cdk/bidi`) so `Directionality` follows it. No direction toolbar: the prior art's global toolbar is not carried over, because a story whose correctness depends on a global the Vitest run never sets is a story nobody tests.
- `layout: 'fullscreen'` is set per story where the scenario is about the page (Sticky, Smooth Scroll, OffCanvas); the default `padded` elsewhere.
- Layer 1 runs at Vitest browser mode's default viewport, 414 px wide (`vitest@4` `resolved.browser.viewport.width ??= 414`), which is below Foundation's `medium` breakpoint. `vitest.config.ts` does not change it. Play functions therefore hold at any width or compute the expected breakpoint from `window.matchMedia` (the Breakpoint service and Interchange specs do); viewport sweeps are Playwright's.

## 5. Sass

One stylesheet for every story, `.storybook/preview.scss`, imported by `preview.ts`. It is the consumer stylesheet from [Sass packaging for the new library](issues/57-sass-packaging.md) (ADR 0012), unchanged except for the three marked lines:

```scss
@import 'foundation-sites/scss/settings/settings'; // Foundation 6.9's settings file, unchanged
@import 'settings-overrides'; // (1) .storybook/_settings-overrides.scss
@import 'foundation-sites/scss/foundation';
@import '../index'; // (2) the library's own _index.scss (this project is its source)

@include foundation-everything($prototype: true); // (3) every Export mixin plus the Prototype utilities

// Extra Foundation Export mixins a spec asks for, one line each with the spec named:
// @include foundation-grid; // Equalizer: equalizer--float-grid (no class overlap with the XY grid)
// @include foundation-range-input; // Slider: every slider--* story

@include nfs-breakpoint-properties;
@include nfs-motion;
@include nfs-accordion;
// ... one @include nfs-<plugin> per plugin that has a Library mixin, after foundation-everything,
// with the arguments its spec names (for example @include nfs-responsive-toggle(xlarge xxlarge);).
@include nfs-smooth-scroll; // Smooth Scroll: smooth native jumps on html; play functions scroll with behavior: 'instant'
```

- Foundation's settings file is imported, not copied: stories then show Foundation 6.9's defaults exactly, and every deviation is visible in one short file. The settings file's own first line, `@import 'util/util'`, needs `node_modules/foundation-sites/scss` on the Sass load path, as Foundation's docs tell every consumer; `main.ts` adds it in `viteFinal` (`css.preprocessorOptions.scss.loadPaths`). Whether `@storybook/addon-vitest`'s run picks up that `viteFinal` the same way `storybook build` does is proved by the first story of the new repository; if it does not, the same path goes into `storybookAngularVitest({stylePreprocessorOptions: {includePaths: [...]}})`, which the framework's options plugin turns into Sass load paths (`@storybook/angular-vite` `dist/preset.js:1294-1310`).
- `_settings-overrides.scss` is the only place a story changes a Foundation setting. Each override is one variable per failing Foundation default, with a comment naming the axe rule id or the WCAG 2.2 SC, the spec, and the story that fails without it, and the same override is listed in that spec's Sass subsection (ADR 0018, ADR 0022):

  ```scss
  // color-contrast (1.4.3): Foundation's selected tab is about 3.76:1 (axe reports 3.75). Spec: Tabs, tabs--default;
  // also Responsive Accordion Tabs in tabs mode.
  $tab-background-active: $primary-color;
  $tab-active-color: $white;

  // color-contrast (1.4.3) and non-text contrast (1.4.11): Foundation's alert button fill is 4.498:1,
  // hollow and clear success 1.799:1 and warning 1.842:1. Spec: Button, button--colors and button--fills.
  $button-palette: map-merge($foundation-palette, ('alert': #bf3f2c, 'success': #177a3d, 'warning': #8a5a00));

  // color-contrast (1.4.3): Foundation's default Top Bar puts $anchor-color links at 3.76:1.
  // Spec: Dropdown Menu, dropdown-menu--top-bar; also required by the Nested menu, Magellan
  // (magellan--sticky-top-bar), and Responsive Toggle (responsive-toggle--default) stories that show a Top Bar.
  $topbar-background: $white;

  // 1.4.10 Reflow: Foundation's 200px minimum does not fit every side at 320 CSS px.
  // Spec: Dropdown Menu, dropdown-menu--fixture; also the Nested menu and Responsive Menu in dropdown mode.
  $dropdownmenu-min-width: min(200px, 45vw);

  // color-contrast (1.4.3): the accordion title is 3.76:1 on its hover and focus background.
  // Spec: Accordion; also Responsive Accordion Tabs in accordion mode.
  $accordion-item-color: scale-color($primary-color, $lightness: -15%);

  // color-contrast (1.4.3) and non-text contrast (1.4.11): the alert colour is 4.49:1 on #fefefe, the invalid
  // placeholder 3.93:1 on its tint, the placeholder 1.63:1, the input border 1.63:1.
  // Spec: Abide, abide--invalid-state-contrast.
  $input-error-color: #bf3f2c;
  $form-label-color-invalid: #bf3f2c;
  $input-background-invalid: #bf3f2c;
  $input-placeholder-color: #737373;
  $input-border: 1px solid $dark-gray;

  // Non-text contrast (1.4.11) and 1.4.3 over images: nfs-orbit stops the compile on Foundation's bullets
  // (1.6:1) and caption band (3.7:1). Spec: Orbit, every orbit--* story.
  $orbit-bullet-background: $dark-gray;
  $orbit-bullet-background-active: $black;
  $orbit-caption-background: rgba($black, 0.6);

  // Non-text contrast (1.4.11): nfs-slider stops the compile on Foundation's fill against its track
  // (about 1.3:1); the Slider spec's example passing fill. Spec: Slider, every slider--* story.
  $slider-fill-background: $primary-color;

  // Non-text contrast (1.4.11) and color-contrast (1.4.3): nfs-off-canvas stops the compile on the close
  // button (2.77:1 on $light-gray), and links are 3.76:1. Spec: Off-canvas, every off-canvas--* story.
  $offcanvas-background: $white;

  // 1.4.10 Reflow: a fixed pane width over 160px can leave no fitting Placement at 320 CSS px.
  // Spec: Dropdown, dropdown-pane--reflow.
  $dropdown-width: min(300px, 45vw);
  $dropdown-sizes: (
    tiny: 100px,
    small: min(200px, 45vw),
    large: min(400px, 45vw),
  );
  ```

  This is every override the published specs require; each spec's Sass subsection is the source, and a spec that adds or changes one changes its line here. An override is a consumer-side setting, never an exception to the Accessibility gate. The overrides come after Foundation's settings file and before `foundation`, so Foundation's `!default` component variables pick them up and they can refer to settings such as `$primary-color`.
- The library's Sass is imported relatively (line 2) because inside its own repository the package is source. The consumer path through the `sass` export condition is proved by the Sass packaging ticket's built-package compile test (decision 18b), not by Storybook.
- `foundation-everything` (`foundation-sites/scss/foundation.scss:79-155`) is the union of the per-component includes a consumer writes, except `foundation-range-input`, which the Slider spec adds, so each story sees exactly the rules its Export mixins print; a spec that needs an Export mixin outside it (`foundation-grid`) adds one line, and the spec states that the new classes do not overlap existing ones. `$prototype: true` adds the Prototype utilities (section 8); they are additive classes that restyle no component.
- Every `nfs-<plugin>` include comes after `foundation-everything`, as ADR 0012 requires (library rules override Foundation's at equal specificity through source order). A Library mixin that refuses to compile with a Foundation default (the Slider's fill contrast check) is satisfied through `_settings-overrides.scss`, never by skipping its include.
- No story, stories file, or demo component declares `styles` or `styleUrl`, and no stories file imports CSS. Scenario scaffolding that needs a value Foundation has no class for (a scroll container's height, a tall page for Sticky) uses an inline `style` in the template (section 8).

## 6. Accessibility gate and the anti-pattern exception

The Accessibility gate is the story-level axe run: `@storybook/addon-a11y` in each story's `afterEach`, with `parameters.a11y.test = 'error'` and the six tags from `preview.ts`, which fails the story (and `npx nx test-storybook <lib>` in CI) on any violation (ADR 0018, ADR 0022). The addon's report reaches the e2e layer through `storyFinished`, so `mount()` rejects a story the gate fails.

Not allowed in any story: `parameters.a11y.test` set to `'todo'` or `'off'`; `parameters.a11y.disable`; `globals.a11y.manual`; `parameters.a11y.context` narrowing the scan; `parameters.a11y.config` or `parameters.a11y.options` changing rules or tags; a CSS class or attribute added only to satisfy axe. A failing Foundation default is fixed by a settings override (section 5) or by a library rule in the plugin's Library mixin when the failing element is the directive's own markup; a failing library behaviour is fixed in the directive.

### The one exception: an Anti-pattern story

An Anti-pattern story renders markup the library's documentation tells consumers not to write, to show why (for example Foundation's `<a href="#">` accordion title next to the library's `<button>`). First choice is not to render it at all: an anti-pattern belongs in a spec's usage notes or a docs code snippet. A spec adds an Anti-pattern story only when seeing the failure rendered teaches something the snippet cannot, and then:

1. Name: the export name starts with `AntiPattern` (`AntiPatternLinkTitle`, id `accordion--anti-pattern-link-title`), and `name` starts with `Anti-pattern: `.
2. Tag: `tags: ['anti-pattern']`, so the sidebar tag filter can show or hide them and a search finds every one.
3. Scope of the exception: `parameters.a11y.options.rules` disables exactly the axe rule ids the anti-pattern violates, as `{ '<rule-id>': { enabled: false } }`. `test` stays `'error'`, so every other rule still gates the story. This works because Storybook deep-merges plain-object parameters (`combineParameters`, `runtime.js:14120-14129`), so the story's `options.rules` merges with the preview's `options.runOnly`, and axe applies a per-rule `enabled` before tag matching (`ruleShouldRun`, `axe.js:20569-20583`). The array form, `config.rules`, is not used: Storybook replaces arrays instead of merging them, and the addon only copies it into `options.rules` when `runOnly` is present (`chunk-P5J2FJ2Z.js:47-62`).
4. Proof: the play function asserts the defect it demonstrates (for example that the link title is not reachable as a button, or that it has no accessible name), so the exception cannot outlive the anti-pattern.
5. Documentation: the story's JSDoc names the WCAG 2.2 SC, the disabled rule ids, and the Story id of the correct pattern, which must exist in the same file.
6. Listing and review: the spec's Testing Decisions lists every Anti-pattern story with its rule ids; the consistency review and every code review check that `rg -n "enabled: false" --glob "*.stories.ts"` finds only stories tagged `anti-pattern` and that each one is listed in its spec.
7. No e2e test mounts an Anti-pattern story, and no Anti-pattern story is used as the fixture for any other assertion.

## 7. Play functions

Shape: `play: async ({ canvas, userEvent, args, step }) => { ... }` with `expect`, `fn`, `waitFor`, and `within` imported from `storybook/test` (`storybook@10.6.0` exports). `canvas` and `userEvent` come from the context so the Interactions panel records every step; `within(element)` only to scope queries to a subtree of the story.

A play function asserts what a user or assistive technology observes:

- Queries, in order of preference: `getByRole(role, {name})`, `getByLabelText`, `getByText`; `getByTestId` only for an element with no role or name; `canvasElement.querySelector` only for technical checks with no semantic handle (Sticky's sentinel spans, a computed style the spec names). The same order as AGENTS.md's locator rule for e2e.
- Assertions: roles, accessible names, `aria-*`, State classes, `hidden`, `inert`, focus (`toHaveFocus()`), native `value`/`disabled`, computed style or geometry where the spec names the relationship, and outputs through `fn()` spies in `args` (`toHaveBeenCalledWith`, `toHaveBeenCalledOnce`).
- Input: `userEvent.click`, `userEvent.keyboard('{Enter}')`, `userEvent.tab()`, `userEvent.type`; programmatic `scrollTo` where the scenario is scrolling, with `behavior: 'instant'` whenever the play function asserts a position soon after, because `preview.scss` includes `nfs-smooth-scroll`, which makes a root scroll without a `behavior` smooth under `prefers-reduced-motion: no-preference` (Smooth Scroll spec).
- Animations: wait for the Completion output spy or the final state with `waitFor(() => expect(...))`, never a fixed timeout.
- Group phases with `step('...', async () => ...)` when a story has more than one.
- End in a state the story's JSDoc describes. The e2e layer mounts with `embed=true`, which does not run the play function, so e2e tests always start from the story's initial args, never from where a play function left off.

A play function never:

- reads a directive's or service's fields, `window.ng`, or anything Angular-internal;
- sleeps (`setTimeout`, fixed delays);
- runs axe or a second accessibility check (the gate does);
- resizes the viewport, emulates media, reloads, navigates the top-level page, or relies on a second engine (layer 4);
- asserts server HTML, hydration, event replay, or `@defer` hydrate triggers (layers 3 and 4, fixture half);
- leaves global state changed: a story that changes `location.hash`, `document` classes, or scroll position of the iframe document restores it in a `beforeEach` cleanup it returns.

## 8. Args, controls, and demo markup

- `meta.component` is the plugin's primary directive or component class, so the docs props table and the controls come from its declared inputs and outputs (the framework's docgen server documents directive classes as well as components, `@storybook/angular-vite` `dist/docgen/docgen-worker.js:210, 545`). The `propsTable` framework option keeps its default, `'api'`.
- Stories render through `render: (args) => ({ props: args, template: \`...\` })` with the Foundation markup written out, because the library is directive-first and the markup is part of what a story documents. `moduleMetadata.imports` lists the entry point's directives; components come from `imports` too.
- `args` hold only the public API: inputs (including `model()` inputs, bound two-way in the template), and outputs as `fn()` spies. Public signals, methods, and `exportAs` references are shown through the template (a printed value, a button calling a method), never as args. Nothing private or story-internal is an arg. `argTypes` are added only where docgen cannot infer a control (a string-literal union input gets `control: 'select'` with its options).
- The arg names are the e2e `props` names (section 10), so an arg rename is a breaking change to the spec's e2e tests.
- Outputs shown in the story (a log line, a printed value) are for readers; assertions use the spy.
- Demo scaffolding (wrappers, spacing, lists, filler content) uses Foundation's own CSS: component classes (`.callout`, grid classes), typography helpers (`.text-center`, `.lead`), visibility classes (`.show-for-sr`, `.hide-for-*`), float and flex classes, and the Prototype utilities compiled by `foundation-everything($prototype: true)`: spacing (`.margin-*`, `.padding-*`, 0 to 3 with directions), display, overflow, sizing, list style (`.no-bullet`, `.list-disc`), and the text utilities. Prototype classes go on scaffolding only, never on a plugin's Structural class elements, whose look must be Foundation's component CSS unaltered. The `.text-primary`-style colour classes in this repo's AGENTS.md are not Foundation classes (Foundation 6.9's Sass defines no such class) and are not used; colour comes from Foundation components.
- Inline `style` only for: `--nfs-*` custom properties a scenario demonstrates, values Foundation has no class for (a scroll container height, a tall page), and nothing else. `dir="rtl"` is an attribute, not a style.

## 9. What stories do not cover

Stories run client-side rendering only, in Chromium, in Angular development mode (layer 1) or production mode (the static build). They do not cover, and no story pretends to:

- server rendering, prerendering, hydration, incremental hydration triggers, `hydrate never`, event replay, or first paint without JavaScript: layer 3 (`<name>.ssr.spec.ts` through `renderServer()`) and the Playwright e2e fixture half against the prerendered Fixture app (`npx nx e2e <fixture-app>-e2e`). Plain client-side `@defer` inside a story is fine (Interchange's `template-deferred` scenario);
- TestBed-only cases (DI overrides, `DeferBlockBehavior.Manual`, dev-mode warnings, replay-shaped events): layer 2;
- viewport breakpoints, `emulateMedia` (reduced motion, print), real key presses in Firefox and WebKit, History and hash across navigation, storage, reload: layer 4, on the same Story ids.

The Fixture app is not built from stories: it has its own components, one route per plugin at `/<plugin>` (the same kebab segment as the Story id, so a spec's two e2e halves read alike), because its routes must be prerendered and hydrated, which Storybook cannot do.

## 10. How the e2e layer uses stories

- Project `<lib>-e2e`, specs `src/<plugin>.spec.ts`, Chromium, Firefox, and WebKit projects, all with `baseURL: 'http://localhost:4410/iframe.html?embed=true'`; `webServer.command: 'npx nx run <lib>:static-storybook'` with `reuseExistingServer: true`, and `static-storybook` pinned to port 4410 in `project.json`, as in the prototype, so it never collides with `storybook dev` on 4400 (AGENTS.md), which `reuseExistingServer` would otherwise reuse in place of the static build. `embed=true` turns off play-function autoplay (`shouldAutoplay` is `!shouldEmbed`, `storybook@10.6.0` `dist/preview/runtime.js:36017`), so Playwright owns the interaction; there is no project without `embed`.
- A test calls `const root = await mount('<plugin>--<story>', props?)`, where `props` uses the story's arg names, queries from `root` with `getBy*` locators, and may call `root.update(props)`. `mount` rejects on an unknown id, a render error, and a failed Accessibility gate report; the test needs no axe call for the initial state. `@axe-core/playwright` with `withTags` on the six tags runs only after Playwright-driven interactions that no play function performs.
- The gallery is `.storybook/playwright-gallery.ts`, installed by calling its exported `installPlaywrightGallery()` from `preview.ts` (a bare side-effect import is dropped from the build because the library's `package.json` says `"sideEffects": false`), plus the `previewHead` stub in `main.ts` that defines `window.mount`/`window.unmount` before Storybook loads `preview.ts`. It is the one file on Storybook preview internals; it is adopted (triage in the [Decide the browser testing stack: Playwright component tests, Vitest Browser, or both](issues/41-browser-testing-stack-decision.md) ticket), and asking Storybook for a public API stays human-only. The fallback is `page.goto('/iframe.html?id=<story-id>&viewMode=story&args=<name>:<value>')`, which these conventions keep one mechanical rewrite away by addressing stories only by Story id and arg names.
- `mount` is called without a type argument. Playwright 1.63's typed `Stories` registry (`interface Stories {}` in `types/test.d.ts`) is not generated: `StoryId` is `keyof Stories | (string & {})`, so a registry gives completion but never rejects a mistyped id (the gallery does, at run time), and `StoryProps<T>` expects a function or class story, not a CSF `StoryObj`, so typing `props` would need a generated map from `index.json` for no check the run does not already make.
- e2e tests mount only Story ids their spec lists, never an Anti-pattern story, and never re-implement a play function's steps (ADR 0018).

## 11. Checklist for every stories file

- [ ] File is `<plugin>/<plugin>.stories.ts`; library imports come from `ngx-foundation-sites/<entry-point>`; story-only helpers are unexported or in `*.test-helpers.ts`.
- [ ] Default export has string-literal `id: '<plugin>'` and `title: '<Group>/<Name>'`, and `component` set to the primary class.
- [ ] Every Story id in the spec's Testing Decisions exists, derived from a PascalCase export name; no `parameters.__id`.
- [ ] No `parameters.a11y`, `globals.a11y`, or rule changes, except in stories tagged `anti-pattern` that follow section 6 exactly; `rg -n "enabled: false" --glob "*.stories.ts"` finds only those.
- [ ] Every Foundation default a story needed to change is one line in `_settings-overrides.scss` with its rule id or SC, and in the spec's Sass subsection.
- [ ] Every Library mixin the plugin has is included in `preview.scss` after `foundation-everything`; no `styles`, `styleUrl`, or CSS import in any story or demo component.
- [ ] `args` hold only inputs and `fn()` output spies; controls change only public inputs.
- [ ] Play functions use `canvas`, `userEvent`, `step` from the context and `expect`, `fn`, `waitFor`, `within` from `storybook/test`; they assert DOM and ARIA state, wait on Completion outputs rather than time, hold at a 414 px viewport, and restore any global state.
- [ ] Any provider a story needs (`nfsAnimationsToken` off, Router, a Defaults token) is a story-level `applicationConfig`, with the reason in the story's JSDoc.
- [ ] Demo scaffolding uses Foundation classes and Prototype utilities only; inline styles only for `--nfs-*` properties and values Foundation has no class for.
- [ ] `npx nx test-storybook <lib>` passes with the Accessibility gate, and the spec's e2e tests mount the same ids with `embed=true`.
