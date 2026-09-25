# Angular Material 22.2 counterparts as API-design reference

Ticket: `../issues/09-angular-material-reference.md`
Date: 2026-09-25
Scope: API shape only. Material's styling, MDC classes, ripples, theming and
M2/M3 colour inputs are out of scope for a CSS-contract library.

Path legend (all under the local clone `d:/projects/github/angular/components`,
branch `22.2.x`, `package.json` version `22.2.0`):

- `M/` = `src/material/`
- `CDK/` = `src/cdk/`
- `ARIA/` = `src/aria/`
- `ADEV/` = `d:/projects/github/angular/angular/adev/src/content/guide/`

Every claim below cites the file that owns it. Line numbers are from the
clone at the date above.

## 0. Cross-cutting findings

These hold for every mapped component and are the facts a spec can rely on
without re-checking each package.

### 0.1 Decorator inputs still dominate Material; signals dominate Aria

- `M/` has 492 `@Input(` and 91 `@Output(` sites versus 32 `input()`/`model()`
  and 3 `output()` sites (`rg -o` counts, spec and testing dirs excluded).
  The only `model()` in Material is `M/timepicker/timepicker-input.ts:122`.
- `ARIA/` has 122 `input()`/`model()` sites and zero `@Input(`.
- Consequence: Material is the reference for input NAMES, DEFAULTS and
  OUTPUT SEMANTICS; Aria is the reference for the signal SHAPE
  (`input()`, `model()`, `computed()`, `linkedSignal()`, `afterRenderEffect`).
  Copy names from Material, mechanics from Aria.
- Material's two-way convention is `@Input() x` + `@Output() xChange`
  (`CDK/accordion/accordion-item.ts:46-58` `expanded`/`expandedChange`;
  `M/tabs/tab-group.ts:227` `selectedIndexChange`; `M/sidenav/drawer.ts:311`
  `openedChange`; `M/select/select.ts:569` `openedChange`). With `model()`
  that collapses to one member and the `xChange` output is generated.
- Material pairs the boolean two-way state with void "did it" streams derived
  from it: `opened`/`closed` outputs are `openedChange.pipe(filter, map)`
  (`M/sidenav/drawer.ts:316-334`, `M/select/select.ts:572-581`). This is the
  pattern that maps to Foundation's `open.zf.*`/`close.zf.*` events.

### 0.2 Animation after the `@angular/animations` deprecation

- `ADEV/animations/migration.md:3`: `@angular/animations` is deprecated as of
  v20.2; `animate.enter`/`animate.leave` are the replacement. `ADEV/animations/
  enter-and-leave.md` documents both; they are compiler features, not
  directives, and can be host bindings.
- Zero imports of `@angular/animations` remain in `M/` or `CDK/` (non-spec).
  Zero uses of `animate.enter`/`animate.leave` in `M/`, `ARIA/`, `CDK/` either.
  Material chose plain CSS transitions/keyframes plus DOM events over
  `animate.*`.
- The shared switch is `_animationsDisabled()` in `M/core/animation/animation.ts`
  (lines 9-45): returns true when `MATERIAL_ANIMATIONS.animationsDisabled` is
  set, when `ANIMATION_MODULE_TYPE === 'NoopAnimations'`, or when
  `(prefers-reduced-motion)` matches via `MediaMatcher`. Every mapped component
  injects it once and toggles a host class such as
  `mat-expansion-panel-animations-enabled`, `_mat-animation-noopable`,
  `mat-menu-panel-animations-disabled`, `mat-select-panel-animations-enabled`.
- Three completion-detection mechanics, all of which simulate the event when
  animations are off so `afterX` outputs still fire:
  1. `transitionend` on one property: expansion panel listens for
     `grid-template-rows` (`M/expansion/expansion-panel.ts:183-215`,
     CSS `M/expansion/expansion-panel.scss:66-77` using the 0fr/1fr grid trick);
     tab body listens for `transitionstart/end/cancel` on the content element
     and arms a 100 ms fallback timer in case tests disable transitions
     (`M/tabs/tab-body.ts:229-318`); drawer listens for
     `transitionend/transitioncancel` (`M/sidenav/drawer.ts:391-392,691-703`).
  2. `animationstart/end/cancel` with named `@keyframes`: menu
     (`M/menu/menu.html`, `M/menu/menu.scss:34-76`), select panel
     (`M/select/select.scss:18-35,179-183`), bottom sheet
     (`M/bottom-sheet/bottom-sheet-container.ts:35-40`), tooltip
     (`M/tooltip/tooltip.html`, `M/tooltip/tooltip.scss:108-137`).
  3. `setTimeout` for a known duration set through a CSS custom property:
     dialog sets `--mat-dialog-transition-duration` then waits
     `OPEN_ANIMATION_DURATION = 150` / `CLOSE_ANIMATION_DURATION = 75` ms
     (`M/dialog/dialog-container.ts:38-42,106-146`).
- Duration is user-configurable only where Material exposes it: tabs
  `animationDuration` input and `MAT_TABS_CONFIG.animationDuration`, written to
  `--mat-tab-body-animation-duration` (`M/tabs/tab-group.ts:82-83,171-185`);
  dialog `enterAnimationDuration`/`exitAnimationDuration` config
  (`M/dialog/dialog-config.ts:140-152`).

### 0.3 SSR and zoneless

- The test bootstrap for the whole repo is zoneless:
  `test/angular-test.init.ts:12-17` provides `provideZonelessChangeDetection()`
  and `provideCheckNoChangesConfig({exhaustive: true})`. The four
  `*.zone.spec.ts` files (`M/autocomplete`, `M/dialog`, `M/snack-bar`,
  `M/tooltip`) opt back into `provideZoneChangeDetection()` to assert that
  callbacks such as `afterClosed` run inside the zone
  (`M/dialog/dialog.zone.spec.ts:20-59`).
- Zone hygiene is still explicit: `runOutsideAngular` for DOM listeners and
  timers, `_ngZone.run` around emits (`M/expansion/expansion-panel.ts:183-215`,
  `M/tabs/tab-body.ts:229-252`, `M/sidenav/drawer.ts` 9 sites,
  `M/tooltip/tooltip.ts` 4 sites). A zoneless-first library can drop this
  only if it never emits from a native listener attached outside Angular.
- SSR guards: `Platform.isBrowser` (`M/tabs/tab-group.ts:290` `_isServer`,
  `M/sidenav/drawer.ts:154,513,672,852`, `M/slider/slider.ts:440`,
  `M/tooltip/tooltip.ts:875`), `afterNextRender` for measurement
  (`M/tabs/paginated-tab-header.ts:239`, `M/tabs/tab-body.ts:206,314`,
  `M/sidenav/drawer.ts:452,1005`, `M/menu/menu.ts:402`), `afterRenderEffect`
  in Aria for every DOM-touching effect (`ARIA/accordion/accordion-panel.ts`,
  `ARIA/tabs/tab-list.ts`).
- Hydration: `<mat-tab>` renders its host with `hidden` so the server-rendered
  node does not shift layout, and `mat-tab-group` projects `<ng-content/>`
  only when `_isServer` to avoid hydration mismatches
  (`M/tabs/tab.ts:45-48`, `M/tabs/tab-group.html:56-64`).

### 0.4 DI patterns

- Lightweight injection tokens for every parent/child link, always with the
  comment "alternative token to the actual class which could cause unnecessary
  retention": `CDK_ACCORDION` (`CDK/accordion/accordion.ts:22`), `MAT_ACCORDION`
  (`M/expansion/accordion-base.ts:44`), `MAT_EXPANSION_PANEL`, `MAT_TAB_GROUP`,
  `MAT_TAB`, `MAT_TAB_LABEL`, `MAT_TAB_CONTENT`, `MAT_MENU_PANEL`,
  `MAT_MENU_CONTENT`, `MAT_DRAWER_CONTAINER`, `MAT_SLIDER`,
  `MAT_SLIDER_THUMB`, `MAT_ERROR`, `MAT_PREFIX`, `MAT_SUFFIX`, `MAT_FORM_FIELD`.
  Provided with `{provide: TOKEN, useExisting: Class}`; injected with
  `inject(TOKEN, {optional: true, skipSelf: true})`.
- Nesting isolation: a child that is itself a container re-provides the parent
  token as `undefined` so grandchildren do not register with the wrong parent
  (`CDK/accordion/accordion-item.ts:29-33`, `M/expansion/expansion-panel.ts:75`).
  Tabs solve the same problem by filtering `descendants: true` queries on
  `_closestTabGroup === this` (`M/tabs/tab-group.ts:363-373`).
- Default-options tokens per package, two flavours:
  - `providedIn: 'root'` with a factory that supplies defaults
    (`MAT_TOOLTIP_DEFAULT_OPTIONS` `M/tooltip/tooltip.ts:94-104`,
    `MAT_MENU_DEFAULT_OPTIONS` `M/menu/menu.ts:77-88`).
  - Plain token, `inject(..., {optional: true})`, merged over a config class
    (`MAT_DIALOG_DEFAULT_OPTIONS`, `MAT_EXPANSION_PANEL_DEFAULT_OPTIONS`,
    `MAT_TABS_CONFIG`, `MAT_SELECT_CONFIG`, `MAT_SORT_DEFAULT_OPTIONS`,
    `MAT_FORM_FIELD_DEFAULT_OPTIONS`). `M/dialog/dialog.md` warns that the
    provided value REPLACES defaults rather than merging.
- Scroll-strategy factory tokens `providedIn: 'root'` returning
  `() => ScrollStrategy` (`MAT_DIALOG_SCROLL_STRATEGY`,
  `MAT_TOOLTIP_SCROLL_STRATEGY`, `MAT_SELECT_SCROLL_STRATEGY`,
  `MAT_MENU_SCROLL_STRATEGY`).
- Host attribute read once: `inject(new HostAttributeToken('tabindex'),
  {optional: true})` (`M/expansion/expansion-panel-header.ts:63`,
  `M/tabs/tab-nav-bar/tab-nav-bar.ts` MatTabLink constructor).
- IDs from `_IdGenerator` (`CDK/a11y`), prefix per element:
  `'mat-expansion-panel-header-'`, `'cdk-accordion-child-'`, `'ng-tab-'`.

### 0.5 Dev-mode validation (Aria only)

`ARIA/private/utils/violations.ts:10` `reportViolations(violations, element)`
logs `console.warn` in `ngDevMode` from an `afterRenderEffect({read})`. Used
to catch: trigger nested inside its own panel, panel controlled by two
triggers, panel without content template, duplicate tab values, tab without
panel (`ARIA/accordion/accordion-trigger.ts:78-97`,
`ARIA/tabs/tab-list.ts` constructor, `ARIA/tabs/tab.ts` constructor).

### 0.6 Testing approach

- Unit specs per package with Jasmine + TestBed, zoneless by default (0.3).
  Counts: expansion 50 `it(`, tabs 173, menu 179, dialog and others similar.
- Component harnesses under `<package>/testing/` extending `ComponentHarness`
  or `ContentContainerComponentHarness` from `CDK/testing`, with
  `static hostSelector`, `static with(filters)` returning `HarnessPredicate`,
  and `<name>-harness-filters.ts` interfaces. Harnesses read STATE FROM THE
  DOM, never from the component instance: `isExpanded()` is
  `host.hasClass('mat-expanded')`, `isDisabled()` reads `aria-disabled`,
  `isMulti()` reads a class that exists only for the harness
  (`M/expansion/testing/expansion-harness.ts`, `M/expansion/accordion.ts:36-38`).
- Environments: `TestbedHarnessEnvironment.loader(fixture)` for unit tests,
  `SeleniumWebDriverHarnessEnvironment` for e2e (`CDK/testing/test-harnesses.md`).
- E2E is thin: `src/e2e-app` plus a handful of `*.e2e.spec.ts` files using
  raw `selenium-webdriver` (`M/slider/slider.e2e.spec.ts:9-33`). Only slider
  among the mapped components has one.
- Aria specs use `runAccessibilityChecks` from `CDK/testing/private` and
  `waitForMicrotasks` (`ARIA/accordion/accordion.spec.ts:4-6`). Aria ships
  harnesses too (`ARIA/accordion/testing/accordion-harness.ts`).

Map to this repo's rules: the harness idea (assert on rendered DOM and ARIA,
not on instance fields) is exactly what Storybook play functions do with
`within(canvasElement).getByRole(...)`. A harness class is optional; the
DOM-first assertion discipline is the part to keep.

## 1. Accordion -> `M/expansion` (and `ARIA/accordion`)

### Primitives

`MatAccordion extends CdkAccordion` (`CDK/accordion/accordion.ts`),
`MatExpansionPanel extends CdkAccordionItem` (`CDK/accordion/accordion-item.ts`).
Single-open coordination uses `UniqueSelectionDispatcher` from
`CDK/collections` keyed on the accordion id (`accordion-item.ts:64-75,97-110`).
Header keyboard navigation uses `FocusKeyManager(...).withWrap().withHomeAndEnd()`
(`M/expansion/accordion.ts:75`). Lazy body uses `TemplatePortal` +
`CdkPortalOutlet` (`M/expansion/expansion-panel.ts:172-183`,
`expansion-panel.html`).

### Directive or component

- `mat-accordion` is a DIRECTIVE (`M/expansion/accordion.ts:23`): it owns no
  markup, only a host class, `multi`, and the key manager.
- `mat-expansion-panel` and `mat-expansion-panel-header` are COMPONENTS with
  `ViewEncapsulation.None` because they own structure: the panel renders the
  `role="region"` body wrapper and the `inert` toggle; the header renders the
  toggle indicator SVG (`expansion-panel.html`, `expansion-panel-header.html`).
- `mat-panel-title`, `mat-panel-description`, `mat-action-row` are empty
  class-only DIRECTIVES (`expansion-panel-header.ts:245-266`,
  `expansion-panel.ts:230-238`).
- Aria's accordion is ALL DIRECTIVES on consumer markup:
  `[ngAccordionGroup]`, `[ngAccordionTrigger]`, `[ngAccordionPanel]`,
  `ng-template[ngAccordionContent]` (`ARIA/accordion/*.ts`). This is the shape
  a Foundation `.accordion > .accordion-item > .accordion-title + .accordion-content`
  markup wants.

### Public API

`CdkAccordion` / `MatAccordion`:

| Member | Kind | Type / default | Source |
| --- | --- | --- | --- |
| `multi` | input | boolean, `false` | `CDK/accordion/accordion.ts:39` |
| `hideToggle` | input | boolean, `false` | `M/expansion/accordion.ts:57` |
| `displayMode` | input | `'default' \| 'flat'`, `'default'` | `accordion.ts:68` |
| `togglePosition` | input | `'before' \| 'after'`, `'after'` | `accordion.ts:71` |
| `openAll()` / `closeAll()` | method | `openAll` only when `multi` | `CDK/accordion/accordion.ts:42-51` |
| `id` | readonly | `_IdGenerator` `'cdk-accordion-'` | `accordion.ts:36` |

`CdkAccordionItem` / `MatExpansionPanel`:

| Member | Kind | Type / default | Source |
| --- | --- | --- | --- |
| `expanded` | input + `expandedChange` output | boolean, `false` | `CDK/accordion/accordion-item.ts:46-80` |
| `disabled` | input | boolean, `false` (backed by `signal`) | `accordion-item.ts:83-90` |
| `opened` / `closed` / `destroyed` | outputs | `EventEmitter<void>` | `accordion-item.ts:37-41` |
| `afterExpand` / `afterCollapse` | outputs | after transition | `M/expansion/expansion-panel.ts:104-107` |
| `hideToggle`, `togglePosition` | inputs | fall back to accordion value | `expansion-panel.ts:83-101` |
| `toggle()` / `open()` / `close()` | methods | CDK versions respect `disabled` | `accordion-item.ts:131-150` |
| `id` | readonly | `'cdk-accordion-child-'` | `accordion-item.ts:57` |

`MatExpansionPanelHeader`: `expandedHeight`, `collapsedHeight` (string),
`tabIndex` (number, from host attribute) (`expansion-panel-header.ts:121-134`).
`MatExpansionPanelDefaultOptions { expandedHeight, collapsedHeight, hideToggle }`
via `MAT_EXPANSION_PANEL_DEFAULT_OPTIONS` (`expansion-panel.ts:44-60`).

Aria `AccordionGroup`: `disabled` (false), `multiExpandable` (true),
`softDisabled` (true), `wrap` (false), `expandAll()`, `collapseAll()`
(`ARIA/accordion/accordion-group.ts:73-125`). `AccordionTrigger`:
`panel = input.required<AccordionPanel>()`, `id`, `disabled`,
`expanded = model<boolean>(false)`, `active = computed`, `expand()`,
`collapse()`, `toggle()` (`accordion-trigger.ts:58-133`). `AccordionPanel`:
`id`, `visible = computed`, `preserveContent` (host-directive input from
`DeferredContentAware`) (`accordion-panel.ts:36-100`).

### ARIA emitted

Material header host: `role="button"`, `[attr.id]`, `[attr.tabindex]`
(-1 when disabled), `[attr.aria-controls]`=panel id,
`[attr.aria-expanded]`, `[attr.aria-disabled]`, click and keydown
(`expansion-panel-header.ts:41-58`). Body: `role="region"`,
`aria-labelledby`=header id, wrapper `[attr.inert]` when collapsed
(`expansion-panel.html`). Space/Enter toggle without modifier keys; other keys
go to the accordion's `FocusKeyManager` (`expansion-panel-header.ts:201-217`).
Focus is moved back to the header if the body contained focus when it closed
(`expansion-panel-header.ts:82-85`). `expansion.md` states it imitates native
`<details>/<summary>` and warns against interactive children in the header.

Aria trigger host: `role="button"`, `[id]`, `aria-expanded`, `aria-controls`,
`aria-disabled`, `[attr.disabled]` only when hard-disabled, `tabindex` from
the pattern, plus `data-active`; it also sets `type="button"` on a bare
`<button>` (`accordion-trigger.ts:38-49,74-78`). Panel host: `role="region"`,
`aria-labelledby`, `inert` when not visible (`accordion-panel.ts:36-49`).

### Animation

CSS grid `grid-template-rows: 0fr -> 1fr` transition on the content wrapper,
`visibility` transition on the body, enabled only after a 200 ms delay by
adding `mat-expansion-panel-animations-enabled`; completion via
`transitionend` on `grid-template-rows` (`expansion-panel.ts:183-215`,
`expansion-panel.scss:15-18,66-109`). `@supports not (grid-template-rows: 0fr)`
fallback exists (`expansion-panel.scss:84`).

### Testing

`MatExpansionPanelHarness` (`hostSelector '.mat-expansion-panel'`; filters
`title`, `description`, `content`, `expanded`, `disabled`; methods
`isExpanded`, `toggle`, `expand`, `collapse`, `getTitle`, `getDescription`,
`getTextContent`, `focus`, `blur`, `isFocused`, `hasToggleIndicator`,
`getToggleIndicatorPosition`) and `MatAccordionHarness` (`getExpansionPanels`,
`isMulti`) (`M/expansion/testing/*.ts`). Specs: `expansion.spec.ts` (35),
`accordion.spec.ts` (15).

### API patterns worth borrowing

- Split into group + item + trigger + panel + content-template, all directives
  (Aria shape) with the Material NAMES `multi`, `expanded`, `disabled`,
  `opened`, `closed`, `afterExpand`, `afterCollapse`, `openAll`, `closeAll`,
  `toggle`, `open`, `close`. Foundation's `data-multi-expand` maps to
  `multi`/`multiExpandable`; `data-allow-all-closed` has no Material
  equivalent and must be added.
- `expanded = model(false)` on the item (Aria) instead of input + `xChange`.
- Per-item `disabled` guarded inside `toggle/open/close` (CDK) so programmatic
  calls respect it, but note Material's panel OVERRIDES those to ignore
  `disabled` (`expansion-panel.ts:137-150`) and its doc says disabled panels
  "can still be manipulated programmatically". Pick one and document it.
- `UniqueSelectionDispatcher` keyed by group id for single-open mode; it works
  for items that are not in a group (they use their own id as the key).
- Lazy content via `ng-template[...Content]` + `preserveContent` boolean
  (Aria `DeferredContentAware`/`DeferredContent`,
  `ARIA/private/deferred-content/deferred-content.ts`).
- `inert` on the collapsed region rather than `hidden`, so CSS can still
  animate height.
- Header falls back to group-level `hideToggle`/`togglePosition` when its own
  is unset (getter pattern `expansion-panel.ts:83-101`).
- Harness/test reads `aria-expanded`, `aria-disabled` and the state class.

### API patterns that do not fit a CSS-contract library

- `displayMode`, `expandedHeight`, `collapsedHeight`, `hideToggle`,
  `togglePosition`: Material-visual concerns. Foundation's `.accordion-title`
  draws its plus/minus with CSS (`$accordion-plusminus`), so there is nothing
  to toggle at runtime.
- `mat-expansion-panel` as a component that renders its own `role="region"`
  wrapper and SVG indicator: Foundation markup already carries
  `.accordion-content`, and the consumer owns it.
- The `MAT_ACCORDION`/`MAT_EXPANSION_PANEL` "base interface + token" split
  that exists only to break circular imports between files; a single-package
  directive set does not need it beyond one token per parent.
- `_animationsDisabled()` reading `ANIMATION_MODULE_TYPE`: that token comes
  from the deprecated animations module; keep only the
  `prefers-reduced-motion` and explicit-config branches.

## 2. Tabs -> `M/tabs` (and `ARIA/tabs`)

### Primitives

`FocusKeyManager(...).withHorizontalOrientation(dir).withWrap()` plus
Home/End in `MatPaginatedTabHeader` (`M/tabs/paginated-tab-header.ts:225-228`);
`CdkPortalOutlet`/`TemplatePortal` for labels and bodies; `CdkMonitorFocus`
for focus origin; `CdkScrollable` inside the body; `CdkObserveContent` in the
nav bar; `Directionality` for RTL position math (`M/tabs/tab-body.ts:283-291`).

### Directive or component

- `mat-tab-group`, `mat-tab`, `mat-tab-body`, `mat-tab-header` are COMPONENTS.
  The group renders the whole `tablist` from `_tabs` in an `@for`; `mat-tab`
  is a content holder whose own host is `hidden` and whose id is cleared so it
  never appears in the a11y tree (`M/tabs/tab.ts:34-49`, `tab-group.html`).
- `mat-tab-label` (`[mat-tab-label], [matTabLabel]`) extends `CdkPortal`;
  `matTabContent` is a `TemplateRef` holder (`M/tabs/tab-label.ts`,
  `tab-content.ts`). Both DIRECTIVES.
- `[mat-tab-nav-bar]` and `[mat-tab-link]` are attribute-selector COMPONENTS
  on `<nav>`/`<a>` for router-driven tabs; `mat-tab-nav-panel` is a tiny
  component that carries `role="tabpanel"` and `aria-labelledby`
  (`M/tabs/tab-nav-bar/tab-nav-bar.ts:52-80,270-297,447-462`).
- Aria: `[ngTabs]` wrapper, `[ngTabList]`, `[ngTab]`, `[ngTabPanel]`,
  `ng-template[ngTabContent]` are all DIRECTIVES on consumer markup
  (`ARIA/tabs/*.ts`). Tabs and panels are paired by a string `value`, not by
  index, which decouples DOM order from selection.

### Public API

`MatTabGroup` (`M/tabs/tab-group.ts`):

| Member | Kind | Type / default | Line |
| --- | --- | --- | --- |
| `selectedIndex` | input + `selectedIndexChange` | number, clamped in `ngAfterContentChecked` | 158-165, 227 |
| `headerPosition` | input | `'above' \| 'below'`, `'above'` | 168 |
| `animationDuration` | input | string, number, or `{body, header}`; `'500ms'` | 171-185 |
| `contentTabIndex` | input | number or null | 193-201 |
| `disablePagination` | input | boolean, false | 209 |
| `preserveContent` | input | boolean, false | 224 |
| `dynamicHeight` | input | boolean, false | 150 |
| `stretchTabs` (`mat-stretch-tabs`) | input | boolean, true | 141 |
| `alignTabs` (`mat-align-tabs`) | input | `'start' \| 'center' \| 'end'` | 145 |
| `fitInkBarToContent`, `disableRipple`, `color`, `backgroundColor` | inputs | visual | 129-138, 213, 118, 242 |
| `aria-label`, `aria-labelledby` | inputs | forwarded to the `tablist` | 258-261 |
| `selectedTabChange` | output | `MatTabChangeEvent {index, tab}` (async emitter) | 238 |
| `focusChange` | output | `MatTabChangeEvent` | 231 |
| `animationDone` | output | void | 235 |
| `realignInkBar()`, `updatePagination()`, `focusTab(index)` | methods | | 408-434 |

`MatTab`: `disabled`, `label` (alias of `textLabel`), `aria-label`,
`aria-labelledby`, `labelClass`, `bodyClass`, `id` (custom id override)
(`M/tabs/tab.ts:52-99`). `MatTabsConfig` mirrors the group inputs
(`M/tabs/tab-config.ts`).

`MatTabNav`: `tabPanel` input (required in dev mode, `tab-nav-bar.ts:217`),
`fitInkBarToContent`, `stretchTabs`, `animationDuration`, `disableRipple`,
`color`, `backgroundColor`, `updateActiveLink()`. `MatTabLink`: `active`,
`disabled`, `disableRipple`, `tabIndex`, `id` (`tab-nav-bar.ts:283-357`).

Aria `TabList` (`ARIA/tabs/tab-list.ts`): `orientation`
(`'horizontal'`), `wrap` (true), `softDisabled` (true), `focusMode`
(`'roving' | 'activedescendant'`, `'roving'`), `selectionMode`
(`'follow' | 'explicit'`, `'follow'`), `selectedTab = model<string|undefined>()`,
`disabled` (false), `open(value)`, `findTab(value)`. `Tab`: `id`,
`disabled`, `value = input.required<string>()`, `active`, `selected`,
`open()`. `TabPanel`: `id`, `value` (required), `visible`, `preserveContent`.
`selectedTab` is kept in sync with the pattern via a `linkedSignal` plus an
`afterRenderEffect({write})` (`tab-list.ts` `_selectedTabPattern`).

### ARIA emitted

Material: header renders `role="tab"` elements with `id`, `tabIndex` roving
(0 for the last focused or selected tab, `tab-group.ts:462-465`),
`aria-posinset`, `aria-setsize`, `aria-controls`, `aria-selected`,
`aria-label`/`aria-labelledby`; bodies get `role="tabpanel"`, `id`,
`aria-labelledby`, `aria-hidden` when not selected, optional `tabindex`
from `contentTabIndex`, and `[attr.inert]` when not centered
(`tab-group.html`, `tab-body.ts:120-126`). Keyboard: Left/Right (RTL-aware),
Home/End, Space/Enter select the focused tab (`tabs.md` table;
`paginated-tab-header.ts:336-349`). `tabs.md` says both group and nav bar
implement the APG Tabs pattern and that the nav bar switches to
`role="tablist"`/`tab`/`aria-selected` only when `tabPanel` is set, otherwise
it stays a plain link list with `aria-current="page"`
(`tab-nav-bar.ts:257-259,412-441`).

Aria: `[ngTabList]` host `role="tablist"`, `tabindex`, `aria-disabled`,
`aria-orientation`, `aria-activedescendant` (only in activedescendant mode);
`[ngTab]` host `role="tab"`, `id`, `tabindex`, `aria-selected`,
`aria-disabled`, `aria-controls`, `data-active`; `[ngTabPanel]` host
`role="tabpanel"`, `id`, `tabindex`, `inert`, `aria-labelledby`
(`ARIA/tabs/tab-list.ts`, `tab.ts`, `tab-panel.ts`).

### Animation

Bodies slide with CSS transforms keyed off `left | center | right` position
classes; `transitionstart/end/cancel` on the content element drive
`_onCentering`, `_onCentered`, `_afterLeavingCenter`, which in turn attach
and detach the content portal (`tab-body.ts:31-72,229-318`). Height animates
only when `dynamicHeight` is set, by pinning `min-height` across the switch
(`tab-group.ts:320-329,443-459`). `animationDuration: '0ms'` disables it.

### Testing

`MatTabGroupHarness` (`getTabs`, `getSelectedTab`, `selectTab`),
`MatTabHarness` (`getLabel`, `getAriaLabel`, `getAriaLabelledby`,
`isSelected`, `isDisabled`, `select`, `getTextContent`),
`MatTabNavBarHarness` (`getLinks`, `getActiveLink`, `clickLink`,
`getPanel`), `MatTabLinkHarness`, `MatTabNavPanelHarness`
(`M/tabs/testing/*.ts`). Specs: 173 `it(` across group, header, body, nav bar.

### API patterns worth borrowing

- Aria's value-keyed pairing (`ngTab [value]` <-> `ngTabPanel [value]`) and
  `selectedTab = model<string>()`. This matches Foundation's
  `data-tabs-target`/`href="#panel1"` id-based pairing better than Material's
  index model, and survives DOM reordering.
- `selectionMode: 'follow' | 'explicit'` and `focusMode: 'roving' |
  'activedescendant'` as inputs with APG-correct defaults. Foundation's
  `data-active-collapse`, `data-auto-focus`, `data-deep-link`,
  `data-update-history` have no Material equivalent; they must be added.
- `preserveContent` (boolean, default false) with lazy `ng-template[...Content]`.
- Two-tier outputs: a change event carrying `{index, tab}` (or `{value}`) plus
  a plain two-way boolean/value. Foundation's `change.zf.tabs` carries
  `($event, $tab, $targetContent)`; the object-event form covers it.
- Nav-bar variant: the same header can be links with `aria-current="page"`
  or a real tablist depending on whether a panel is bound. Foundation's Tabs
  are used for both in practice.
- Roving `tabindex` computed from "last focused or selected" so keyboard
  users return to where they were (`tab-group.ts:462-465`).

### API patterns that do not fit a CSS-contract library

- `mat-tab` as a hidden content-holder component that the group re-renders
  as a synthetic `tablist`. Foundation's `<ul class="tabs"><li
  class="tabs-title"><a>` and `<div class="tabs-content"><div
  class="tabs-panel">` are consumer markup; the directive set must attach to
  them, not replace them.
- Pagination (`disablePagination`, `updatePagination`, scroll arrows), ink bar
  (`fitInkBarToContent`, `realignInkBar`), `stretchTabs`, `alignTabs`,
  `headerPosition`, `dynamicHeight`, ripples, colours: Material visual
  behaviours with no Foundation CSS counterpart.
- `animationDuration` as an input: Foundation Tabs have no transition;
  Motion UI is opt-in CSS classes.
- Index-based `selectedIndex` clamping in `ngAfterContentChecked` with
  `Promise.resolve().then(...)` deferral (`tab-group.ts:302-345`): a
  signal-based `selectedTab` with `linkedSignal` (Aria) is cleaner.

## 3. Reveal -> `M/dialog` (and `M/bottom-sheet`)

### Primitives

Both sit on `CDK/dialog` (`Dialog` service, `DialogRef`, `DialogConfig`,
`CdkDialogContainer`) which supplies overlay creation, focus trap
(`FocusTrapFactory`), `InteractivityChecker` for `autoFocus`, focus restore,
`aria-hidden` on siblings, and `closeOnNavigation`
(`CDK/dialog/dialog-container.ts:62-87`). Positioning is
`createGlobalPositionStrategy(...).centerHorizontally().centerVertically()`
for dialog and `.centerHorizontally().bottom('0')` for bottom sheet; scroll
blocking is `createBlockScrollStrategy` (`M/dialog/dialog.ts:154-157`,
`M/bottom-sheet/bottom-sheet.ts:79-84`).

### Directive or component

- `MatDialog` and `MatBottomSheet` are SERVICES decorated `@Service()` (a
  v22 alias visible at `M/dialog/dialog.ts:17`, `M/bottom-sheet/bottom-sheet.ts:12`).
  You open with `open(componentOrTemplate, config)` and get a ref. There is
  no declarative `<mat-dialog>` element; the container component
  (`mat-dialog-container`, `mat-bottom-sheet-container`) is created by the
  service inside a CDK overlay. Material chose a service because the dialog
  must live outside the caller's DOM (overlay container) and outlive the
  caller's view.
- Content-structure DIRECTIVES: `[mat-dialog-title]` (adds its id to the
  container's `aria-labelledby` queue), `mat-dialog-content` (host directive
  `CdkScrollable`), `mat-dialog-actions` (`align` input, counts itself so the
  container can add a class), `[mat-dialog-close]` (`type` defaults to
  `'button'`, bound value becomes the result, `aria-label` input)
  (`M/dialog/dialog-content-directives.ts`). When the dialog was opened from a
  `TemplateRef`, these directives find their ref by walking up to
  `.mat-mdc-dialog-container` and matching `id` against `openDialogs`
  (`dialog-content-directives.ts:187-200`).

### Public API

`MatDialog` (`M/dialog/dialog.ts`): `open<T, D, R>(component | template,
config?): MatDialogRef<T, R>`, `closeAll()`, `getDialogById(id)`,
`openDialogs`, `afterOpened: Subject<MatDialogRef>`, `afterAllClosed:
Observable<void>` (emits on subscribe when nothing is open). Nested services
delegate to the parent via `inject(MatDialog, {optional: true, skipSelf: true})`
(lines 53-83).

`MatDialogConfig<D>` (`M/dialog/dialog-config.ts`), defaults in parentheses:
`viewContainerRef`, `injector`, `id`, `role` (`'dialog'`), `panelClass`,
`hasBackdrop` (true), `backdropClass`, `disableClose` (false),
`closePredicate(result, config, componentInstance)`, `width`, `height`,
`minWidth`, `minHeight`, `maxWidth`, `maxHeight`, `position {top, bottom,
left, right}`, `data` (null), `direction`, `ariaDescribedBy`,
`ariaLabelledBy`, `ariaLabel`, `ariaModal` (false, with the comment that it
is redundant because siblings get `aria-hidden`), `autoFocus`
(`'first-tabbable'`; also `'dialog'`, `'first-heading'`, any selector),
`restoreFocus` (true), `delayFocusTrap` (true), `scrollStrategy`,
`closeOnNavigation` (true), `enterAnimationDuration`,
`exitAnimationDuration`, `bindings: Binding[]`.

`MatDialogRef<T, R>` (`M/dialog/dialog-ref.ts`): `componentInstance`,
`componentRef`, `disableClose`, `id`, `close(result?)`, `afterOpened()`,
`afterClosed()`, `beforeClosed()`, `backdropClick()`, `keydownEvents()`,
`updatePosition(pos)`, `updateSize(w, h)`, `addPanelClass`,
`removePanelClass`, `getState(): MatDialogState` (`OPEN | CLOSING | CLOSED`).
Escape without modifier and backdrop click close unless `disableClose`
(lines 108-119). The close interaction type (`'keyboard' | 'mouse'`) is
recorded so focus restore uses the right origin (`_closeDialogVia`,
lines 264-267).

`MatBottomSheet`: `open(...)`, `dismiss(result?)`; only ONE sheet at a time,
opening a second dismisses the first and waits for its exit animation
(`M/bottom-sheet/bottom-sheet.ts:103-113`). `MatBottomSheetRef`:
`instance`, `componentRef`, `disableClose`, `dismiss(result?)`,
`afterDismissed()`, `afterOpened()`, `backdropClick()`, `keydownEvents()`.
Config is a subset of dialog's plus `height`, `minHeight`, `maxHeight`.

### ARIA emitted

Container host: `tabindex="-1"`, `[attr.role]` (`dialog` or `alertdialog`),
`[attr.aria-modal]`, `[id]`, `aria-labelledby` from the queue unless
`ariaLabel` is set, `aria-label`, `aria-describedby`
(`M/dialog/dialog-container.ts:44-57`, same on `CDK/dialog/dialog-container.ts:62-71`).
`dialog.md` Accessibility: APG dialog pattern, Escape closes, first tabbable
element focused, focus restored on close with a note about the
menu-opens-dialog case where the origin element is gone.

### Animation

Dialog: classes `mdc-dialog--opening/--open/--closing` plus
`--mat-dialog-transition-duration`, completion by `setTimeout(duration)`
inside the zone, `requestAnimationFrame` outside it
(`dialog-container.ts:94-146,196-215`). Bottom sheet: named keyframes
`_mat-bottom-sheet-enter/exit` with `animationstart/end/cancel` host
listeners and a simulated event when disabled
(`bottom-sheet-container.ts:35-50,105-130`). Both refs arm a fallback timer
(`totalTime + 100` ms, or 500 ms) in case the exit animation never fires
(`dialog-ref.ts:135-144`, `bottom-sheet-ref.ts:105-116`).

### Testing

`MatDialogHarness` (`getId`, `getRole`, `getAriaLabel`, `getAriaLabelledby`,
`getAriaDescribedby`, `close` via Escape, `getText`, `getTitleText`,
`getContentText`, `getActionsText`) plus `MatTestDialogOpener`, a helper
component that opens a dialog in a test (`M/dialog/testing/dialog-opener.ts`).
Because the dialog lives outside the fixture, tests use
`TestbedHarnessEnvironment.documentRootLoader(fixture)`
(`CDK/testing/test-harnesses.md`, "Using TestbedHarnessEnvironment").

### API patterns worth borrowing

- The ref surface: `close(result)`, `afterOpened()`, `beforeClosed()`,
  `afterClosed()`, `backdropClick()`, `keydownEvents()`, `getState()`. For a
  declarative Foundation Reveal these become outputs `opened`, `closed`,
  `beforeClosed` plus a two-way `open = model(false)`; Foundation's
  `closeme.zf.reveal`/`closed.zf.reveal` pair maps to `beforeClosed`/`closed`.
- `closePredicate(result, config, instance)` as the hook for "block closing
  while dirty", instead of overloading `disableClose`.
- `autoFocus` union type (`'dialog' | 'first-tabbable' | 'first-heading' |
  selector`) and `restoreFocus: RestoreFocusValue` from `CDK/dialog`.
- `role: 'dialog' | 'alertdialog'` as an input.
- Escape closes only when no modifier key is held (`hasModifierKey`).
- The `[mat-dialog-close]` directive shape: default `type="button"`, bound
  value is the result, `aria-label` input. Foundation already has
  `data-close`; make it the same directive with an optional result.
- `closeOnNavigation` (default true) as a config knob, since Foundation
  Reveal has `data-deep-link` and `data-update-history` that interact with
  history.
- `aria-hidden` on sibling content plus optional `ariaModal`.

### API patterns that do not fit a CSS-contract library

- A service-only, imperative `open(Component)` API. Foundation Reveal markup
  is `<div class="reveal" id="x" data-reveal>` in the document; the natural
  Angular shape is a directive on that element with `[open]`, plus optional
  `CDK/dialog` under the hood only if the element must be moved into an
  overlay container. Native `<dialog>` with `showModal()` (map "Not yet
  specified") is the rung to test first; it provides the focus trap, Escape,
  and top layer natively.
- `MatDialogConfig` sizing (`width`, `height`, `min*`, `max*`, `position`):
  Foundation's `.tiny .small .large .full` classes carry sizing.
- MDC-specific animation classes and the `--mat-dialog-transition-duration`
  timer; Foundation Reveal animates with Motion UI classes
  (`data-animation-in/out`), so `animate.enter`/`animate.leave` with those
  class names is the fitting mechanism.
- Bottom sheet's single-instance rule and `Breakpoints.Medium/Large/XLarge`
  class toggling (`bottom-sheet-container.ts:74-92`).

## 4. Tooltip -> `M/tooltip`

### Primitives

`createOverlayRef` + `createFlexibleConnectedPositionStrategy` +
`createRepositionScrollStrategy` from `CDK/overlay`; `ComponentPortal` for
the tooltip component; `AriaDescriber` and `FocusMonitor` from `CDK/a11y`;
`Directionality`; `MediaMatcher` for hover-capability detection
(`M/tooltip/tooltip.ts:9-56,195-203`).

### Directive or component

`[matTooltip]` is a DIRECTIVE on the trigger (`tooltip.ts:186-194`); the
bubble is a separate `mat-tooltip-component` COMPONENT rendered into an
overlay (`tooltip.ts:958-967`). The directive owns all behaviour; the
component is a dumb message renderer with `aria-hidden="true"`.

### Public API

All inputs are aliased with the `matTooltip` prefix (`tooltip.ts:230-362`):

| Input (alias) | Type / default |
| --- | --- |
| `message` (`matTooltip`) | string; setting it re-registers the aria description |
| `position` (`matTooltipPosition`) | `'left' \| 'right' \| 'above' \| 'below' \| 'before' \| 'after'`, `'below'` |
| `positionAtOrigin` (`matTooltipPositionAtOrigin`) | boolean, false |
| `disabled` (`matTooltipDisabled`) | boolean, false; hides if visible |
| `showDelay` (`matTooltipShowDelay`) | number ms, from defaults (0) |
| `hideDelay` (`matTooltipHideDelay`) | number ms, from defaults (0) |
| `touchGestures` (`matTooltipTouchGestures`) | `'auto' \| 'on' \| 'off'`, `'auto'` |
| `tooltipClass` (`matTooltipClass`) | string, string[], Set or map |

Methods: `show(delay = showDelay, origin?)`, `hide(delay = hideDelay)`,
`toggle(origin?)`, `_isTooltipVisible()` (`tooltip.ts:451-493`).
`MatTooltipDefaultOptions` (`tooltip.ts:107-160`): `showDelay`,
`hideDelay`, `touchendHideDelay`, `touchLongPressShowDelay?`,
`touchGestures?`, `position?`, `positionAtOrigin?`,
`disableTooltipInteractivity?`, `tooltipClass?`,
`detectHoverCapability?: boolean | (() => boolean)`. No outputs at all.

### ARIA emitted

The trigger gets `aria-describedby` pointing at a visually hidden copy of
the message maintained by `AriaDescriber.describe(el, message, 'tooltip')`
(`tooltip.ts:919-932`); the visible bubble is `aria-hidden="true"`
(`tooltip.ts:965`). `tooltip.md` states this explicitly: the described-by
target is not the tooltip itself. Show on `mouseenter`, `focus` from
keyboard origin, and long-press `touchstart`; hide on `mouseleave`, blur,
`wheel` leaving the element, `touchend` after `touchendHideDelay`, and
Escape without modifiers via the overlay's keydown stream
(`tooltip.ts:409-425,779-860,943-951`).

### Animation

Keyframes `mat-mdc-tooltip-show` (150 ms) / `mat-mdc-tooltip-hide` (75 ms),
`animationend` handler on the bubble, `_mat-animation-noopable` sets
`animation: none` (`tooltip.html`, `tooltip.scss:44-45,108-137`).

### Testing

`MatTooltipHarness`: `show()`, `hide()`, `isOpen()`, `isDisabled()`,
`getTooltipText()` (`M/tooltip/testing/tooltip-harness.ts`). A
`tooltip.zone.spec.ts` asserts zone behaviour of show/hide.

### API patterns worth borrowing

- Directive on the trigger, text bubble elsewhere. Foundation's
  `data-tooltip` with `title="..."` is the same shape; `message` should read
  from the `title` attribute by default (Foundation `data-tooltip` does, and
  `data-template-classes`, `data-position`, `data-alignment`,
  `data-show-on`, `data-hover-delay`, `data-fade-in-duration` map to inputs).
- `aria-describedby` to a hidden always-present copy (`AriaDescriber`) plus
  `aria-hidden` on the visible bubble. This is the accessible form of a
  hover tooltip and is what axe expects.
- `showDelay`/`hideDelay` inputs with a root-provided defaults token whose
  factory supplies real defaults (0 ms), not `undefined`.
- Escape-closes, keyboard-focus-shows, `touchGestures: 'auto' | 'on' | 'off'`.
- `show(delay)`, `hide(delay)`, `toggle()` as public methods for programmatic
  use; Foundation's `data-click-open` and `data-disable-hover` need
  equivalents (`disabled` covers part).
- Logical positions `before`/`after` in addition to `left`/`right` for RTL.

### API patterns that do not fit a CSS-contract library

- Overlay-rendered bubble via `CDK/overlay`. Foundation's `.tooltip` CSS is
  positioned relative to the trigger and already carries `.top .bottom .left
  .right` and the `.has-tip` trigger class. Native `popover` + CSS anchor
  positioning (map "Not yet specified") keeps the Foundation CSS contract
  without an overlay container; `CDK/overlay` is the fallback rung.
- `tooltipClass` as a map/Set input; a plain `class` string aligned with
  Foundation `data-template-classes` is enough.
- MDC keyframe names and `positionAtOrigin` (follow-the-pointer) behaviour
  that Foundation does not offer.

## 5. Dropdown and DropdownMenu -> `M/menu` and `M/select` panel (and `ARIA/menu`)

### Primitives

Menu: `CDK/overlay` (connected position, backdrop), `TemplatePortal` for the
panel template, `FocusKeyManager(...).withWrap().withTypeAhead().withHomeAndEnd()`
(`M/menu/menu.ts:292-295`), `FocusMonitor` on items, `afterNextRender` to
focus the first item for iOS VoiceOver (`menu.ts:400-402`). Select:
`cdk-connected-overlay` directive with `cdkConnectedOverlayUsePopover`
(native popover for the overlay, `M/select/select.html:37-48`),
`ActiveDescendantKeyManager(...).withTypeAhead().withVerticalOrientation()
.withHomeAndEnd().withPageUpDown().withAllowedModifierKeys(['shiftKey'])`
(`select.ts:1165-1171`), `SelectionModel`, `LiveAnnouncer`.

### Directive or component

- `mat-menu` is a COMPONENT whose template is a single `<ng-template>`
  holding the panel (`menu.html`); nothing renders at the declaration site.
  `[matMenuTriggerFor]` is a DIRECTIVE on any button (`menu-trigger.ts:28-40`).
  `[mat-menu-item]` is an attribute-selector COMPONENT (needs a template for
  the ripple and submenu arrow). `ng-template[matMenuContent]` is a DIRECTIVE
  for lazy panels (`menu-content.ts:33-36`).
- `mat-select` is a COMPONENT implementing `MatFormFieldControl` and
  `ControlValueAccessor`; the panel is inside a `cdk-connected-overlay`
  template (`select.ts:151-181`, `select.html`).
- Aria: `[ngMenuTrigger]`, `[ngMenu]`, `[ngMenuBar]`, `[ngMenuItem]`,
  `ng-template[ngMenuContent]` are DIRECTIVES; the menu directive owns
  `visible`, `tabIndex`, `itemSelected = output<V>()`, `typeaheadDelay`
  (500), `expansionDelay` (100), `wrap`, `softDisabled`
  (`ARIA/menu/menu.ts:103-150`, `menu-trigger.ts:41-80`,
  `menu-item.ts:65-92`, `menu-bar.ts:85-109`).

### Public API

`MatMenu` (`M/menu/menu.ts`):

| Member | Kind | Type / default |
| --- | --- | --- |
| `xPosition` | input | `'before' \| 'after'`, `'after'` (validated in dev) |
| `yPosition` | input | `'above' \| 'below'`, `'below'` |
| `overlapTrigger` | input | boolean, false |
| `hasBackdrop` | input | boolean or null (null = use default) |
| `backdropClass` | input | string, `'cdk-overlay-transparent-backdrop'` |
| `class` / `classList` / `panelClass` | input | forwarded to the panel |
| `aria-label`, `aria-labelledby`, `aria-describedby` | inputs | forwarded to the panel; nulled on the host |
| `closed` (`close` deprecated alias) | output | `MenuCloseReason = void \| 'click' \| 'keydown' \| 'tab'` |
| `focusFirstItem(origin)`, `resetActiveItem()`, `setPositionClasses(x, y)` | methods | used by the trigger |
| `panelId` | readonly | `'mat-menu-panel-'` |

`MatMenuDefaultOptions` (`menu.ts:56-88`): `xPosition`, `yPosition`,
`overlapTrigger`, `backdropClass`, `overlayPanelClass?`, `hasBackdrop?`,
root-provided with real defaults.

`MatMenuTrigger` (`menu-trigger.ts:28-139`): inputs `matMenuTriggerFor`
(`MatMenuPanel | null`), `matMenuTriggerData` (template context),
`matMenuTriggerRestoreFocus` (true); outputs `menuOpened`, `menuClosed`
(`onMenuOpen`/`onMenuClose` deprecated aliases); methods `toggleMenu()`,
`openMenu()`, `closeMenu()`, `updatePosition()`, `triggersSubmenu()`;
property `menuOpen`.

`MatMenuItem` (`menu-item.ts:31-73`): `role` (`'menuitem' |
'menuitemradio' | 'menuitemcheckbox'`, `'menuitem'`), `disabled`,
`disabledInteractive`, `disableRipple`. It is also a submenu trigger when
`[matMenuTriggerFor]` is present on the same element.

`MatSelect` (`select.ts:336-591`), the panel-relevant subset: `panelClass`,
`panelWidth` (`'auto'` = match trigger), `disableOptionCentering`,
`typeaheadDebounceInterval`, `hideSingleSelectionIndicator`,
`canSelectNullableOptions`, `sortComparator`, `compareWith`, `multiple`
(cannot change after init), `value`, `placeholder`, `required`,
`disabled`, `tabIndex`, `id`, `aria-label`, `aria-labelledby`,
`aria-describedby`, `errorStateMatcher`; outputs `openedChange: boolean`,
`opened`, `closed`, `selectionChange: MatSelectChange {source, value}`,
`valueChange`; methods `open()`, `close()`, `toggle()`, `focus()`,
`writeValue`, `registerOnChange`, `setDisabledState`. `MatSelectConfig`
(`select.ts:105-132`) mirrors the panel inputs.

### ARIA emitted

Menu trigger host: `aria-haspopup="menu"` when a menu is bound,
`[attr.aria-expanded]`, `[attr.aria-controls]` = panel id only while open
(`menu-trigger.ts:30-38`). Panel: `role="menu"`, `tabindex="-1"`, `id`,
`aria-label`/`aria-labelledby`/`aria-describedby` (`menu.html`). Items:
`[attr.role]`, roving `tabindex`, `aria-disabled`, `[attr.disabled]`
(`menu-item.ts:34-46`). `menu.md` Accessibility: trigger is a standard
button; on open the first item is focused; on close focus returns to the
trigger; `menuitemcheckbox`/`menuitemradio` are NOT supported despite the
`role` input; menus should contain nothing interactive except items.

Select host: `role="combobox"`, `aria-haspopup="listbox"`,
`aria-controls` while open, `aria-expanded`, `aria-label`, `aria-required`,
`aria-disabled`, `aria-invalid`, `aria-activedescendant`; panel
`role="listbox"`, `aria-multiselectable`, `aria-labelledby`
(`select.ts:157-179`, `select.html:50-65`). `select.md` says to prefer
native `<select>` and that it follows the ARIA 1.2 combobox pattern.

Aria menu trigger host: `aria-haspopup`, `aria-expanded`, `aria-controls`,
`aria-disabled`, `[attr.disabled]` only when not soft-disabled, click,
keydown, focusin/out (`ARIA/menu/menu-trigger.ts:41-55`).

### Animation

Menu: `@keyframes _mat-menu-enter` 120 ms / `_mat-menu-exit` 100 ms with
`animationstart/end/cancel` on the panel, plus an "if animationend never
fires" fallback because some apps set `* { animation: none !important }` in
tests (`menu.ts:456-505`, `menu.scss:34-76`). Select: `_mat-select-enter`
120 ms / `_mat-select-exit` 100 ms behind
`mat-select-panel-animations-enabled` (`select.scss:18-35,179-183`);
`select.ts:752,767` still carry "Simulate the animation event before we
moved away from `@angular/animations`" comments.

### Testing

`MatMenuHarness` (`isDisabled`, `isOpen`, `getTriggerText`, `focus`,
`blur`, `isFocused`, `open`, `close`, `getItems`, `clickItem` following a
path of submenus) and `MatMenuItemHarness` (`isDisabled`, `getText`,
`focus`, `blur`, `isFocused`, `click`, `hasSubmenu`, `getSubmenu`)
(`M/menu/testing/menu-harness.ts`). `MatSelectHarness` exists under
`M/select/testing`. Specs: `menu.spec.ts` 158, `context-menu-trigger.spec.ts` 21.

### API patterns worth borrowing

- Trigger directive + panel element with the trigger owning
  `aria-haspopup`, `aria-expanded`, `aria-controls` (only while open), and a
  reference to the panel by template ref (`[matMenuTriggerFor]="menu"`).
  Foundation's `data-toggle="id"` on the button is the same link by id.
- `closed` output typed with the reason (`'click' | 'keydown' | 'tab' |
  void`). Foundation's `close.zf.dropdown` has no reason; adding one is
  cheap and lets consumers restore focus correctly.
- `menuOpened`/`menuClosed` on the trigger and `closed` on the panel: two
  vantage points for the same event. Keep one canonical place (the panel)
  and re-emit from the trigger only if the spec needs it.
- `xPosition`/`yPosition` logical values (`before/after`, `above/below`).
  Foundation's `data-position` (`top|bottom|left|right`) and
  `data-alignment` (`left|right|center`) are the CSS-contract equivalents
  (`.dropdown-pane.top.left` and so on), so the directive's inputs should
  carry Foundation's values and compute the class.
- `hasBackdrop: boolean | null` where null means "use the default"; menus
  default to a transparent backdrop, which is what gives click-outside close.
- `restoreFocus` (default true) on the trigger.
- Aria `softDisabled` (focusable but inert) versus hard `disabled`.
- Lazy `ng-template[...Content]` with a template context (`menuData`).
- For DropdownMenu (a `menubar`), `ARIA/menu` `MenuBar` with
  `value = model<V[]>([])`, `itemSelected = output<V>()`, hover-to-expand
  `expansionDelay`, and typeahead are the APG Menubar pattern; Material has
  no menubar component.
- `cdkConnectedOverlayUsePopover`: Material already routes its select panel
  through the native popover API when asked, which supports the native
  `popover` rung for Foundation dropdown panes.

### API patterns that do not fit a CSS-contract library

- `mat-menu` as a component that renders nothing in place and portals a
  `role="menu"` div into an overlay. Foundation's `.dropdown-pane` is a
  sibling element in the document with `data-dropdown`; a directive on it
  toggling `.is-open` keeps the CSS contract. `CDK/overlay` is only needed
  if the pane must escape an `overflow: hidden` ancestor.
- Material's refusal to support `menuitemcheckbox`/`menuitemradio` (the
  `role` input exists but `menu.md` disclaims it).
- `mat-select` entirely: it is a form control with `ControlValueAccessor`,
  `MatFormFieldControl`, `SelectionModel`, `compareWith`, `multiple`; none
  of that is a Foundation Dropdown concern. Only its panel mechanics
  (connected overlay, `aria-controls` while open, `role="listbox"` +
  `aria-activedescendant`) are relevant, and only if a future combobox spec
  needs them.
- Ripples, `disabledInteractive`, elevation classes, `overlapTrigger`.

## 6. OffCanvas -> `M/sidenav`

### Primitives

`FocusTrapFactory`/`FocusTrap` from `CDK/a11y` (created in `over`/`push`
modes only), `FocusMonitor` for the opening origin, `InteractivityChecker`
for `autoFocus`, `CdkScrollable` on the inner container, `Directionality`
for start/end resolution, `Platform.isBrowser` (`M/sidenav/drawer.ts:11-48,
192-205`). No overlay: the drawer is a sibling of the content inside the
container, and the container renders the backdrop itself
(`drawer-container.html`).

### Directive or component

All COMPONENTS: `mat-drawer-container` renders backdrop + projects drawers
and content and auto-wraps unprojected content in `mat-drawer-content`
(`drawer-container.html`); `mat-drawer` renders one inner scroll container
(`drawer.html`); `mat-drawer-content` extends `CdkScrollable` and applies
margins pushed from the container (`drawer.ts:82-99`). `mat-sidenav*` are
subclasses adding `fixedInViewport`, `fixedTopGap`, `fixedBottomGap`
(`sidenav.ts:60-93`). Material chose components because the container
computes content margins (`updateContentMargins`, `drawer.ts:925`) and must
own the backdrop element; the drawer's role is deliberately left to the
consumer (`sidenav.md` Accessibility).

### Public API

`MatDrawer` (`drawer.ts:215-348`):

| Member | Kind | Type / default |
| --- | --- | --- |
| `position` | input | `'start' \| 'end'`, `'start'`; emits `positionChanged` |
| `mode` | input | `'over' \| 'push' \| 'side'`, `'over'`; updates focus-trap state |
| `disableClose` | input | boolean, false (Escape and backdrop) |
| `autoFocus` | input | `AutoFocusTarget \| string \| boolean`; default depends on mode (`'dialog'` for over/push, `false` for side) |
| `opened` | input + `openedChange` (async emitter) | boolean; setter calls `toggle()`; backed by `_opened = signal(false)` |
| `opened` (output alias `_openedStream`) / `closed` | outputs | `openedChange` filtered |
| `openedStart` / `closedStart` | outputs | from `_animationStarted` |
| `positionChanged` | output | void |
| `open(openedVia?)`, `close()`, `toggle(isOpen?, openedVia?)` | methods | return `Promise<'open' \| 'close'>` resolved after the transition |

`MatDrawerContainer` (`drawer.ts:773-797`): `autosize` (boolean, from
`MAT_DRAWER_DEFAULT_AUTOSIZE`, root-provided false), `hasBackdrop`
(boolean or null = derived from drawer modes), `backdropClick` output,
`open()`, `close()`, `updateContentMargins()`, plus `start`/`end` drawer
getters. Duplicate drawers at one position throw
`throwMatDuplicatedDrawerError` (`drawer.ts:54`).

### ARIA emitted

The drawer sets NO role. Host: `tabIndex="-1"` unless `mode === 'side'`,
`[attr.align]="null"`, state classes `mat-drawer-end/over/push/side`
(`drawer.ts:173-188`). `sidenav.md` Accessibility instructs the consumer to
add `role="navigation"`, `role="directory"` or `role="region"` on the
drawer and `role="main"`/`role="region"` on the content. Focus: trap active
in `over`/`push`; first tabbable focused on open (or `cdkFocusInitial`);
focus restored on close using the opening origin (`drawer.ts:436-500`).
Escape without modifiers closes unless `disableClose` (`drawer.ts:383`).
The content element gets `inert` while an over/push drawer is open, delayed
50 ms after the animation so focus movement is not interrupted
(`drawer.ts:107-145`).

### Animation

CSS `transform` transitions enabled by the container after first render
when `!animationsDisabled && isBrowser` (`drawer.ts:852`);
`transitionend/transitioncancel` drive `_animationEnd`; `_animationStarted`
is emitted from a `setTimeout` rather than `transitionrun` because that
event might not fire (`drawer.ts:597-647,691-703`). When transitions are
disabled both subjects fire synchronously.

### Testing

`MatDrawerHarness` (`isOpen` via `mat-drawer-opened` class, `getPosition`,
`getMode`), `MatDrawerContainerHarness` (`getDrawers`, `getContent`),
`MatSidenavHarness` adds `isFixedInViewport`; content harnesses
(`M/sidenav/testing/*.ts`). Specs: `drawer.spec.ts`, `sidenav.spec.ts`.

### API patterns worth borrowing

- `opened` as the single two-way state (`model(false)`), with `opened`,
  `closed`, `openedStart`, `closedStart` as derived void outputs. Foundation
  `open.zf.offCanvas`/`opened.zf.offCanvas`/`close.zf.offCanvas`/
  `closed.zf.offCanvas` map one-to-one onto start/end pairs.
- `open()`/`close()`/`toggle()` returning a promise resolved after the
  transition ends, with the focus origin passed through (`openedVia`).
- `mode: 'over' | 'push' | 'side'` and `position: 'start' | 'end'`
  (logical, RTL-aware). Foundation has `.position-left/right/top/bottom`
  and `data-transition="push|overlap"`; the directive should carry
  Foundation's values but the same semantics (side = Foundation's
  `.is-open` with `.off-canvas-content` margin in "reveal on large" mode).
- `disableClose` covering both Escape and backdrop
  (Foundation `data-close-on-click`, `data-close-on-esc` become two inputs).
- Focus trap only in over/push, `autoFocus` union type, `inert` on the
  content while open (Foundation `data-content-overlay`,
  `data-trap-focus`, `data-auto-focus` already name these).
- `hasBackdrop: boolean | null` derived from mode when null.
- Leaving `role` to the consumer, with documented recommendations, since the
  same drawer can be navigation, a filter panel or a dialog. The navigation
  schematic sets `role` to `'dialog'` on handset and `'navigation'`
  otherwise (`M/schematics/ng-generate/navigation/.../component.html.template:5-7`).

### API patterns that do not fit a CSS-contract library

- Container-computed margins (`updateContentMargins`, `autosize`,
  `[style.margin-left.px]` on the content) and the drawer/content wrapper
  components. Foundation's `.off-canvas-wrapper > .off-canvas +
  .off-canvas-content` markup and `.is-open`/`.is-transition-push` classes
  already do the layout in CSS; the directive only toggles classes.
- `fixedInViewport`, `fixedTopGap`, `fixedBottomGap`: Foundation has
  `.position-*` and `.is-open` fixed positioning in Sass.
- Backdrop rendered by the container: Foundation renders
  `.js-off-canvas-overlay` next to the panel; the directive creates or
  toggles that element, not a Material backdrop.
- Duplicate-position error: Foundation allows several panels per wrapper.

## 7. Slider -> `M/slider`

### Primitives

A real `<input type="range">` per thumb (`M/slider/slider-input.ts:67-80`
host `type: 'range'`); `ControlValueAccessor` on the input directive
(`MAT_SLIDER_THUMB_VALUE_ACCESSOR`); `Directionality`; `Platform`;
`afterRenderEffect` for track/thumb geometry (`slider.ts:421`);
`MAT_RIPPLE_GLOBAL_OPTIONS` for the visual thumb. No CDK a11y primitive is
needed because the native range input supplies keyboard and ARIA.

### Directive or component

- `mat-slider` is a COMPONENT that renders track, tick marks and the visual
  thumb(s) (`slider.ts:62-79`, `slider.html`).
- `input[matSliderThumb]` and `input[matSliderStartThumb] /
  input[matSliderEndThumb]` are DIRECTIVES on consumer-written `<input>`
  elements projected into the slider (`slider-input.ts:67-86,605-613`).
  The value lives on the native element: `value`, `min`, `max`, `step`,
  `disabled` getters read `_hostElement.*` (`slider-input.ts:94-193`).

### Public API

`MatSlider` (`slider.ts:103-366`): `disabled` (false), `discrete` (false,
shows value indicator), `showTickMarks` (false), `min` (0), `max` (100),
`step` (1), `displayWith: (value) => string`, `color`, `disableRipple`.
`MatSliderThumb` (`slider-input.ts:94-135`): `value` (number, two-way via
`valueChange`), outputs `valueChange: number`, `dragStart` and `dragEnd:
MatSliderDragEvent {source, parent, value}`; native `change` and `input`
events are the documented way to observe changes (`MatSliderChange` is
deprecated in favour of them, `slider-interface.ts:69-83`). Range thumbs
expose `getSibling()`, `getMinPos()`, `getMaxPos()` for the visual layer.

### ARIA emitted

Only `[attr.aria-valuetext]` from `displayWith` on the input
(`slider-input.ts:73,223`); everything else (`aria-valuemin/max/now`,
arrow keys, Home/End, PageUp/Down) comes from the native range input.
`slider.md` Accessibility: label the input with `aria-label` or
`aria-labelledby`; keep a 3:1 contrast between active and inactive track.

### Animation

Class `_mat-animation-noopable` on the host when disabled
(`slider.ts:73`); thumb/track movement is CSS transitions on transform
driven by inline styles computed in `afterRenderEffect`.

### Testing

`MatSliderHarness` (`getStartThumb`, `getEndThumb`, `isRange`,
`isDisabled`, `getStep`, `getMaxValue`, `getMinValue`) and
`MatSliderThumbHarness` (`getPosition`, `getValue`, `setValue`,
`getPercentage`, `getMaxValue`, `getMinValue`, `getDisplayValue`,
`isDisabled`, `getName`, `getId`, `focus`, `blur`, `isFocused`)
(`M/slider/testing/*.ts`). `slider.e2e.spec.ts` is the only e2e among the
mapped components (selenium-webdriver, drives real pointer events).

### API patterns worth borrowing

- Native `<input type="range">` as the value carrier, with the directive
  reading and writing the native `value/min/max/step/disabled` properties.
  Foundation Slider has `data-initial-start`, `data-start`, `data-end`,
  `data-step`, `data-disabled`, `data-vertical`, `data-double-sided`, and a
  hidden `<input>` for the value; the native rung is exactly this.
- Range = two inputs with start/end directives that know their sibling.
- `valueChange`, `dragStart`, `dragEnd` outputs; `change`/`input` native
  events for everything else. Foundation `moved.zf.slider` maps to `input`,
  `changed.zf.slider` maps to `change`.
- `displayWith` feeding `aria-valuetext`.
- `ControlValueAccessor` on the input directive so it works with Reactive
  Forms and Signal Forms without extra code.

### API patterns that do not fit a CSS-contract library

- Rendering the track, ticks and visual thumbs from a component. Foundation
  `.slider > .slider-handle + .slider-fill` is consumer markup styled by
  Sass. Whether a Foundation-styled `<input type="range">` (using the Sass
  mixins for `::-webkit-slider-thumb`/`::-moz-range-thumb`) can replace
  that markup is the prototype question in the map.
- `discrete` value indicator, `showTickMarks`, ripples, `color`.
- `MatSliderChange` and `MatSliderDragEvent` carrying `parent`/`source`
  instances: a signal-based `value = model<number>()` suffices.
- Vertical orientation: Material has none; Foundation `data-vertical` needs
  `writing-mode`/`appearance: slider-vertical` handling or custom markup.

## 8. Abide -> `M/form-field` errors and `M/input`

### Primitives

`ErrorStateMatcher` from `M/core/error/error-options.ts:32-44` decides when
errors show: `control.invalid && (control.touched || form.submitted)`, and a
signal-forms variant `isSignalErrorState(field)` = `field().invalid() &&
field().touched()`. `MatFormFieldControl<T>` is the abstract contract a
control implements so the field can read `errorState`, `required`,
`disabled`, `empty`, `focused`, `shouldLabelFloat`, `autofilled`,
`describedByIds`, `userAriaDescribedBy`, and call `setDescribedByIds(ids)`
and `onContainerClick(event)`; each boolean is `boolean | Signal<boolean>`
and there is an optional `ngField?: Field<T>` from `@angular/forms/signals`
(`M/form-field/form-field-control.ts`). `_IdGenerator` gives every error
and hint an id.

### Directive or component

- `mat-form-field` is a COMPONENT: it renders the label, notched outline,
  prefix/suffix slots and the subscript area with `aria-live="polite"`
  (`form-field.html:100`, `form-field.ts:146-172`).
- `mat-error, [matError]` and `mat-hint` are DIRECTIVES that only carry a
  class and an id (`directives/error.ts`, `directives/hint.ts`). `mat-label`,
  `matPrefix`, `matSuffix` likewise.
- `input[matInput], textarea[matInput], select[matNativeControl], ...` is a
  DIRECTIVE on native controls (`M/input/input.ts:60-90`).

### Public API

`MatFormField` (`form-field.ts:239-312`): `hideRequiredMarker`,
`floatLabel` (`'always' | 'auto'`), `appearance` (`'fill' | 'outline'`),
`subscriptSizing` (`'fixed' | 'dynamic'`), `hintLabel`, `color`; content
queries for `MatFormFieldControl`, `MAT_PREFIX`, `MAT_SUFFIX`, `MAT_ERROR`,
`MatHint`, `MatLabel`. `MatError`: `id` input. `MatHint`: `align`
(`'start' | 'end'`), `id`. `MatInput` (`input.ts:158-283`): `disabled`,
`id`, `placeholder`, `name`, `required` (falls back to
`hasValidator(Validators.required)`), `type` (`'text'`),
`errorStateMatcher`, `aria-describedby` (`userAriaDescribedBy`), `value`,
`readonly`, `disabledInteractive`; `errorState` getter.

### ARIA emitted

Input host: `[id]`, `[disabled]`, `[required]`, `[attr.name]`,
`[attr.readonly]`, `[attr.aria-disabled]` (only with
`disabledInteractive`), `[attr.aria-invalid]` = `errorState` but null while
`empty && required` to avoid redundancy with `aria-required`,
`[attr.aria-required]` (`input.ts:77-90`). Form field: label is a native
`<label for>`; hint and error ids are pushed into the control's
`aria-describedby` via `setDescribedByIds`; the subscript container is
`aria-atomic="true" aria-live="polite"` so errors are announced
(`form-field.md` Accessibility, `form-field.html:100`). Errors are hidden
until `ErrorStateMatcher` says otherwise, and hints hide while errors show
(`form-field.md` "Error messages").

### Animation

Subscript/label transitions gated by `mat-form-field-animations-enabled`;
not relevant to Abide.

### Testing

`MatFormFieldHarness` (`getLabel`, `hasErrors`, `getErrors`,
`getTextErrors`, `getTextHints`, `isControlValid`, ...), `MatErrorHarness`,
`MatInputHarness` under `M/form-field/testing`, `M/input/testing`.

### API patterns worth borrowing

- `ErrorStateMatcher` as an injectable, overridable policy with a
  signal-forms method. Foundation Abide has `data-live-validate`,
  `data-validate-on-blur`, `data-validate-on="fieldChange"` and
  `validateOnBlur`; those are exactly the matcher policy and belong in one
  injectable, not per-input booleans.
- `mat-error`/`mat-hint` as id-carrying directives whose ids are collected
  into the control's `aria-describedby`; `aria-live="polite"` on the
  container of errors. Foundation's `.form-error` (`data-form-error-for`)
  and `.is-invalid-input`/`.is-invalid-label` classes are the CSS contract
  to toggle.
- `aria-invalid` null while `empty && required` (avoids double
  announcement).
- `required` derived from the control's validators when not set as an
  attribute (`input.ts:203-209`).
- `MatFormFieldControl`-style contract with `boolean | Signal<boolean>`
  members so both decorator-based and signal-based controls fit, and the
  optional `ngField` for Signal Forms (the map's Abide-replacement
  candidate).
- Hidden hints while errors show, and the doc rule that the consumer
  toggles which of several errors renders with `@if`.

### API patterns that do not fit a CSS-contract library

- `mat-form-field` as a component rendering outline/notch/floating label.
  Foundation form markup is `<label>` + `<input>` + `<span class="form-error">`
  with `.is-invalid-input`, `.is-invalid-label`, `.is-visible`; a directive
  set on that markup is the fit.
- `appearance`, `floatLabel`, `subscriptSizing`, `hideRequiredMarker`,
  `color`, prefix/suffix slots.
- Material has no validator library, no pattern registry
  (`Abide.defaults.patterns`), no `data-equalto`, no form-level
  `formvalid.zf.abide`/`forminvalid.zf.abide` events. Those come from
  Angular forms (Reactive or Signal Forms), not from the field component.

## 9. Sticky and Magellan -> `M/toolbar` and `M/sort`

### Toolbar

`mat-toolbar` is a COMPONENT with a `color` input and `mat-toolbar-row`
content children; it throws in dev mode if rows and loose content are
mixed (`M/toolbar/toolbar.ts:24-71`). It sets NO role or ARIA; `toolbar.md`
says it is decorative and that `role="toolbar"` plus a label should be
added by the consumer only when the APG Toolbar pattern applies. There is
no sticky/position behaviour at all: `toolbar.md` "does not perform any
positioning of its content". For a sticky pattern Material offers nothing;
`ARIA/toolbar` (`[ngToolbar]`, `[ngToolbarWidget]`,
`[ngToolbarWidgetGroup]`) implements the APG Toolbar roving-focus pattern
with `orientation`, `wrap`, `softDisabled`, `disabled` inputs
(`ARIA/toolbar/toolbar.ts:45-90`), which is unrelated to Sticky.

### Sort (as a Magellan analogue: a set of triggers with one active target)

`[matSort]` is a DIRECTIVE (`M/sort/sort.ts:68-126`): inputs
`matSortActive` (id string), `matSortStart` (`'asc'`), `matSortDirection`
(validated), `matSortDisableClear`, `matSortDisabled`; output
`matSortChange: Sort {active, direction}`; `sortables: Map<string,
MatSortable>`; `initialized` observable. `[mat-sort-header]` is an
attribute COMPONENT (`sort-header.ts:47-118`) with inputs `mat-sort-header`
(id), `arrowPosition`, `start`, `disabled`, `sortActionDescription`,
`disableClear`; it registers with the parent by id. ARIA: host
`[attr.aria-sort]`; the inner container carries `tabindex="0"` and
`role="button"` (not the `<th>`, because of an NVDA bug documented in
`sort-header.html:1-10`). `sort.md` Accessibility: `aria-sort` changes are
not announced by most screen readers, so consumers should announce with
`LiveAnnouncer` on `matSortChange`; Material does not do it for them
(no `LiveAnnouncer` use in `sort.ts`/`sort-header.ts`).

### API patterns worth borrowing

- Parent directive with `active` (id) input + `activeChange`-style output
  (`matSortChange`), and child directives registering by string id into a
  `Map`: this is Magellan's `data-magellan` + `<a href="#section">` list
  with `.is-active` on the current link. `active = model<string>()` on the
  container is the signal form.
- `sortActionDescription`-style input: an accessible description for what
  activating the trigger does.
- Leaving `role="toolbar"` and `aria-current` decisions to the consumer with
  documented guidance, and recommending `LiveAnnouncer` for state changes
  that `aria-*` attributes alone do not announce.
- For Sticky: nothing to borrow from Material. CSS `position: sticky` is
  the native rung; the only directive concern is toggling Foundation's
  `.is-stuck`/`.is-at-top`/`.is-at-bottom`/`.is-anchored` classes, which
  Material has no analogue for.

### API patterns that do not fit a CSS-contract library

- `mat-toolbar-row` mixed-mode error, `color`.
- Sort's `direction` cycling, `disableClear`, arrow rendering, and the
  `<th>`-specific tabindex workaround.
- `MatSortHeaderIntl` service for localized strings: overkill for Magellan.

## 10. Orbit -> no counterpart

There is no carousel or slideshow anywhere in the components repo:
`rg -il carousel` over `M/`, `CDK/`, `src/cdk-experimental/` and `ARIA/`
returns nothing, and `src/cdk-experimental` contains only `column-resize`,
`popover-edit`, `scrolling`, `selection`, `table-scroll-container`. The
closest primitives are unrelated to a carousel's needs; the map's
scroll-snap prototype and the APG Carousel pattern
(`d:/projects/github/w3c/aria-practices`, patterns/carousel) are the
sources for that spec. Reusable pieces from this document: the tabs
value-keyed pairing and roving focus (section 2) for the slide indicators
(`.orbit-bullets`), the `_animationsDisabled()` reduced-motion switch
(0.2) for auto-play and transitions, and `LiveAnnouncer` for slide
announcements.

## 11. ResponsiveMenu and ResponsiveToggle -> `CDK/layout` usage in Material

### The primitive

`BreakpointObserver` (`CDK/layout/breakpoints-observer.ts:43-74`,
`providedIn: 'root'`): `isMatched(query | query[]): boolean` and
`observe(query | query[]): Observable<BreakpointState {matches,
breakpoints}>`. `MediaMatcher` (`media-matcher.ts:19-45`) wraps
`window.matchMedia` and is the thing to fake in tests. `Breakpoints`
constants (`breakpoints.ts`) are Material-spec pixel ranges (`XSmall`
599.98px, `Small`, `Medium`, `Large`, `XLarge`, `Handset`, `Tablet`, `Web`
and orientation variants) and have nothing to do with Foundation's
`$breakpoints` map (`small: 0, medium: 640px, large: 1024px, xlarge: 1200px,
xxlarge: 1440px`).

### How Material uses it

Material has no "responsive component"; it uses `BreakpointObserver`
inside components for layout side effects only:

- `M/bottom-sheet/bottom-sheet-container.ts:74-92` toggles
  `mat-bottom-sheet-container-medium/large/xlarge` classes from
  `Breakpoints.Medium/Large/XLarge`.
- `M/snack-bar/snack-bar.ts:211-216` toggles a handset class on the overlay
  from `Breakpoints.HandsetPortrait`.
- `M/autocomplete/autocomplete-trigger.ts:788-802` switches overlay
  position options on `Breakpoints.HandsetLandscape`.
- The navigation schematic (`M/schematics/ng-generate/navigation/files/...
  component.ts.template:34-37` and `.html.template:1-7`) is the consumer-side
  recipe: `isHandset = toSignal(breakpointObserver.observe(Breakpoints.Handset)
  .pipe(map(r => r.matches)), {initialValue: false})`, then
  `[mode]="isHandset ? 'over' : 'side'"`, `[opened]="isHandset === false"`,
  `[attr.role]="isHandset ? 'dialog' : 'navigation'"`.

### API patterns worth borrowing

- `BreakpointObserver.observe()` piped into `toSignal` with an
  `initialValue`, then plain input bindings on the target component. That
  is what ResponsiveToggle (`data-responsive-toggle`, `data-hide-for`) and
  ResponsiveMenu (`data-responsive-menu="drilldown medium-dropdown"`) do in
  jQuery: swap a mode by breakpoint. The Angular shape is a signal of the
  current Foundation breakpoint name plus a `@switch` or an input binding,
  not a component.
- `MediaMatcher` as the injectable seam for tests and SSR (it returns a
  no-op `MediaQueryList` when `matchMedia` is missing).
- `isMatched()` for one-shot checks, `observe()` for reactive ones.

### API patterns that do not fit a CSS-contract library

- Material's `Breakpoints` values. A Foundation `MediaQuery` service must
  read Foundation's named breakpoints (from the `meta.foundation-mq` CSS
  custom property or a provided map), expose `is('medium')`, `atLeast`,
  `upTo`, `only`, `current`, and emit `changed.zf.mediaquery`-style changes
  as a signal. Nothing in Material does this.
- Component-internal class toggling from breakpoints (bottom sheet, snack
  bar): the Foundation Sass already emits `.show-for-medium`,
  `.hide-for-large` and so on, so class toggling in TypeScript duplicates
  the CSS contract.

## 12. Summary table

| Foundation plugin | Material reference | Directive or component in Material | Primitive under it | Lift for the next repo |
| --- | --- | --- | --- | --- |
| Accordion | expansion + Aria accordion | dir (group), comp (panel, header) / Aria all dir | `CdkAccordion`, `UniqueSelectionDispatcher`, `FocusKeyManager` / Aria pattern | Aria directive set, Material names |
| Tabs | tabs + Aria tabs | comp / Aria all dir | `FocusKeyManager`, portals / Aria pattern | Aria value-keyed model, `selectedTab` model, nav-bar dual role |
| Reveal | dialog, bottom-sheet | service + container comp + content dirs | `CDK/dialog`, `CDK/overlay` | ref surface, `autoFocus`, `closePredicate`, `[close]` directive; native `<dialog>` first |
| Tooltip | tooltip | dir on trigger + overlay comp | `CDK/overlay`, `AriaDescriber` | describer pattern, delays, gestures; native popover first |
| Dropdown, DropdownMenu | menu, select panel, Aria menu | comp panel + dir trigger / Aria all dir | `CDK/overlay`, `FocusKeyManager`, popover | trigger ARIA, `closed` reason, Aria menubar |
| OffCanvas | sidenav | comps | `FocusTrap`, `CdkScrollable` | `opened` model, open/close promises, mode/position, inert content |
| Slider | slider | comp + input dirs | native `<input type="range">`, CVA | native range, sibling thumbs, `displayWith` |
| Abide | form-field, input | comp field + dirs | `ErrorStateMatcher`, `MatFormFieldControl` | matcher policy, error/hint ids, `aria-invalid` rule |
| Sticky, Magellan | toolbar, sort | comp / dir + comp | none / id registry | id-keyed active model; nothing for Sticky |
| Orbit | none | - | - | tabs pairing, reduced-motion switch, `LiveAnnouncer` |
| ResponsiveMenu, ResponsiveToggle | `BreakpointObserver` usage | service | `MediaMatcher` | `toSignal(observe())` recipe; Foundation breakpoints needed |
