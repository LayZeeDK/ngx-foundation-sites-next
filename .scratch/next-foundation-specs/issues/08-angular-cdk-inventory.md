# 08. @angular/cdk 22.2 inventory relevant to Foundation plugins

Type: research
Status: resolved
Blocked by: none
Labels: wayfinder:research
Map: ../map.md

## Question

Which CDK 22.2 modules can carry Foundation plugin behaviour, and what do their APIs look like today? The specs need concrete module and directive names, not general awareness.

Cover: `overlay` (OverlayModule, CdkConnectedOverlay, positioning strategies, scroll strategies, and whether it uses native popover), `portal`, `a11y` (FocusTrap, ConfigurableFocusTrap, FocusMonitor, LiveAnnouncer, ListKeyManager, ActiveDescendantKeyManager, InteractivityChecker, `cdkAriaLive`), `layout` (BreakpointObserver, MediaMatcher), `scrolling` (ScrollDispatcher, ViewportRuler, CdkScrollable, virtual scroll), `dialog` (Dialog, CdkDialogContainer, and whether it uses `<dialog>`), `menu` (CdkMenu, CdkMenuBar, CdkMenuTrigger, CdkContextMenuTrigger), `accordion`, `listbox`, `stepper`, `bidi`, `observers` (CdkObserveContent), `platform`, `drag-drop` (only as far as Slider handles go), `coercion`, `keycodes`, plus `cdk-experimental`. Note anything deprecated in favour of `@angular/aria`.

Sources: `d:/projects/github/angular/components/src/cdk/**` and `d:/projects/github/angular/components/src/cdk-experimental/**` (public API files, README, docs `*.md` next to the sources). Online: https://material.angular.dev/cdk/categories.

## Deliverable

`research/angular-cdk-inventory.md`: one section per module with the exported directives and services, key inputs and options, SSR and zoneless notes, and a "Foundation plugins that could use this" line. Cite paths. Plain ASCII.

## Answer

- CDK 22.2.0 (clone branch 22.2.x) has no module deprecated in favour of `@angular/aria`; `rg "angular/aria" src/cdk` is empty. The only deprecation that touches this effort is `DragDrop` service -> `createDragRef` (`@breaking-change 23.0.0`).
- The CDK overlay renders as a native `popover="manual"` element in the top layer by default (`overlay.ts:67-89`, `overlay-ref.ts:454-459`), with `withPopoverLocation('inline')` / `cdkConnectedOverlayUsePopover="inline"` to keep the pane right after its trigger in DOM order. Positioning is still JavaScript (`FlexibleConnectedPositionStrategy`), not CSS anchor positioning. `STANDARD_DROPDOWN_BELOW_POSITIONS` / `_ADJACENT_POSITIONS` are exported.
- The CDK dialog does not use `<dialog>`: it is an overlay + `FocusTrap` + `aria-hidden` on overlay-container siblings (skipping `popover` elements), `role="dialog"`, `ariaModal` default `false`, container element `cdk-dialog-container` (replaceable via `DialogConfig.container`). Reveal needs a prototype to weigh native `<dialog>` against this.
- `@angular/cdk/menu` applies WAI-ARIA `menu`/`menubar`/`menuitem` roles; that is only right for DropdownMenu if the items are actions. A navigation bar of links is the APG disclosure-navigation pattern, which this module does not implement. Flag for the DropdownMenu spec.
- `@angular/cdk/accordion` manages expansion state only and applies no ARIA; `@angular/aria` `ngAccordion*` does. Same story for listbox and menu: Aria counterparts exist (`src/aria/{accordion,combobox,grid,listbox,menu,tabs,toolbar,tree}`), created 2025-10-02 by moving them out of cdk-experimental (commit 5fd56d94a), stable since 2026-05-09 (commit 84f2afd24). Aria peer-depends on the CDK.
- `BreakpointObserver` / `MediaMatcher` replace Foundation's MediaQuery utility, but `Breakpoints` constants are Material's; the library must own a Foundation-named breakpoint-to-query map. SSR: `MediaMatcher` returns a `matches: false` stub off-browser.
- `ScrollDispatcher` / `ViewportRuler` / `CdkScrollable.scrollTo` serve Magellan, Sticky, SmoothScroll as JS fallbacks; native `IntersectionObserver`, `position: sticky`, and `scrollIntoView({behavior: 'smooth'})` are the first rung for each.
- a11y gives `FocusTrap` (Reveal, OffCanvas), `FocusMonitor` + `InputModalityDetector` + `AriaDescriber` (Tooltip), `LiveAnnouncer` (Abide, Orbit), `FocusKeyManager` / `ActiveDescendantKeyManager` / `TreeKeyManager` (DropdownMenu, Drilldown, AccordionMenu, Tabs, Orbit bullets), `_IdGenerator` (ids everywhere). `ListKeyManager` still switches on `keyCode`.
- drag-drop is a poor fit for Slider handles: `CdkDrag` owns the element position via `transform`, while Foundation's `.slider-handle` is positioned by `left`/`bottom` percentages. Native `<input type="range">` or a small Pointer Events handler is smaller.
- cdk-experimental now holds only table and autosize-virtual-scroll pieces; nothing there applies to the 21 plugins.
- SSR and zoneless: every DOM-touching module guards with `Platform.isBrowser`; `NgZone` is used only for `runOutsideAngular`; no `onStable` / `isStable` dependence anywhere in non-test CDK code. Services use Angular 22's `@Service()` decorator; directive inputs are still `@Input` with `booleanAttribute` transforms.
- Surprise: `CdkMenuItem`'s typeahead input alias is `cdkMenuitemTypeaheadLabel` (lowercase `i`), not `cdkMenuItemTypeaheadLabel`.
- Open question (not settled from sources): whether DropdownMenu should be an ARIA menubar (CDK menu / Aria menu) or an APG disclosure navigation (native popover + `aria-expanded`). Belongs to the DropdownMenu spec ticket; OPEN FOR HUMAN if that ticket cannot settle it from the APG clone.
- Not done: https://material.angular.dev/cdk/categories is a client-rendered app; markdown.new returned only the shell. The local `*.md` docs are the same content, so no browser fetch was attempted.

Findings: ../research/angular-cdk-inventory.md
