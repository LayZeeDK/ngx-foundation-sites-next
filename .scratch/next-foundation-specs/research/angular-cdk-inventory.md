# @angular/cdk 22.2 inventory relevant to Foundation plugins

Ticket: `../issues/08-angular-cdk-inventory.md`
Written: 2026-09-25

Corrected 2026-09-25 after [Audit 0001: research wave](../audits/0001-research-wave.md), findings H3, M10, L3: doc citations re-derived per file; three Foundation and platform claims corrected; commit date labelled.

## Sources and method

- Local clone `d:/projects/github/angular/components`, branch `22.2.x`, `package.json` version `22.2.0`. All paths below are relative to `src/cdk/` in that clone unless stated otherwise.
- Each module was read from its `public-api.ts`, its `<module>.md` doc, and the source files that own the claims. Line numbers are from the clone at the time of writing.
- Online cross-check: https://material.angular.dev/cdk/categories is a client-rendered app; markdown.new returned only the page shell (1.5 KB, no module list), so it added nothing beyond the local docs. Not retried with a browser because the local `*.md` files are the same content the site renders.
- Deprecation sweep: `rg -n "@deprecated" src/cdk` excluding specs and schematics. Full result in the "Deprecation notices" section at the end.
- Zoneless sweep: `rg -n "onStable|isStable|onMicrotaskEmpty" src/cdk` excluding specs and `testing/` returns nothing. `NgZone` is injected only for `runOutsideAngular` around high-frequency listeners (29 files), and `afterNextRender` is used where DOM measurement is needed (overlay, a11y, scrolling, dialog, drag-drop). Under zoneless Angular `NgZone` is the noop zone, so these calls are harmless. The per-module notes below name the files.
- SSR sweep: modules guard with `Platform.isBrowser` (`platform/platform.ts:39`, derived from `PLATFORM_ID`). The per-module notes name the guards.

The 21 Foundation plugins referred to below: Abide, Accordion, AccordionMenu, Drilldown, Dropdown, DropdownMenu, Equalizer, Interchange, Magellan, OffCanvas, Orbit, ResponsiveAccordionTabs, ResponsiveMenu, ResponsiveToggle, Reveal, Slider, SmoothScroll, Sticky, Tabs, Toggler, Tooltip.

## Summary table

| Module | Entry point | Directives (selector) | Services / functions | Foundation plugins |
| --- | --- | --- | --- | --- |
| overlay | `@angular/cdk/overlay` | `[cdkOverlayOrigin]`, `[cdkConnectedOverlay]` | `Overlay`, `createOverlayRef`, `OverlayRef`, position and scroll strategies, `OverlayContainer` | Dropdown, DropdownMenu submenus, Tooltip, Reveal (via dialog) |
| portal | `@angular/cdk/portal` | `[cdkPortal]`, `[cdkPortalOutlet]` | `ComponentPortal`, `TemplatePortal`, `DomPortal`, `DomPortalOutlet` | Reveal, Tooltip content, Interchange (template swap) |
| a11y | `@angular/cdk/a11y` | `[cdkTrapFocus]`, `[cdkMonitorElementFocus]`, `[cdkMonitorSubtreeFocus]`, `[cdkAriaLive]` | `FocusTrapFactory`, `ConfigurableFocusTrapFactory`, `FocusMonitor`, `LiveAnnouncer`, `ListKeyManager`, `FocusKeyManager`, `ActiveDescendantKeyManager`, `TreeKeyManager`, `InteractivityChecker`, `AriaDescriber`, `InputModalityDetector`, `HighContrastModeDetector`, `_IdGenerator` | Reveal, OffCanvas, Tooltip, Abide, Orbit, Slider, DropdownMenu, AccordionMenu, Drilldown, Tabs |
| layout | `@angular/cdk/layout` | none | `BreakpointObserver`, `MediaMatcher`, `Breakpoints` | ResponsiveMenu, ResponsiveToggle, ResponsiveAccordionTabs, Interchange, Equalizer, Sticky, OffCanvas, Dropdown |
| scrolling | `@angular/cdk/scrolling` | `[cdkScrollable]`, `<cdk-virtual-scroll-viewport>`, `*cdkVirtualFor`, `[cdkVirtualScrollingElement]` | `ScrollDispatcher`, `ViewportRuler` | Magellan, Sticky, SmoothScroll, Tooltip and Dropdown reposition-on-scroll |
| dialog | `@angular/cdk/dialog` | `<cdk-dialog-container>` | `Dialog`, `DialogRef`, `DialogConfig`, `DIALOG_DATA`, `DEFAULT_DIALOG_CONFIG`, `DIALOG_SCROLL_STRATEGY` | Reveal |
| menu | `@angular/cdk/menu` | `[cdkMenuTriggerFor]`, `[cdkContextMenuTriggerFor]`, `[cdkMenu]`, `[cdkMenuBar]`, `[cdkMenuItem]`, `[cdkMenuItemCheckbox]`, `[cdkMenuItemRadio]`, `[cdkMenuGroup]`, `[cdkTargetMenuAim]` | `MenuStack`, `MENU_STACK`, `MENU_SCROLL_STRATEGY`, `MENU_AIM` | DropdownMenu (only if items are actions, see note), Dropdown with menu content |
| accordion | `@angular/cdk/accordion` | `cdk-accordion, [cdkAccordion]`, `cdk-accordion-item, [cdkAccordionItem]` | `CDK_ACCORDION` | Accordion, AccordionMenu, ResponsiveAccordionTabs (accordion mode) |
| listbox | `@angular/cdk/listbox` | `[cdkListbox]`, `[cdkOption]` | none | none (Foundation has no listbox plugin) |
| stepper | `@angular/cdk/stepper` | `[cdkStepper]`, `cdk-step`, `[cdkStepHeader]`, `[cdkStepLabel]`, `button[cdkStepperNext]`, `button[cdkStepperPrevious]` | `STEPPER_GLOBAL_OPTIONS` | none |
| bidi | `@angular/cdk/bidi` | `[dir]` | `Directionality`, `DIR_DOCUMENT` | Dropdown, DropdownMenu, Tooltip, Orbit, Slider, OffCanvas, Drilldown |
| observers | `@angular/cdk/observers` | `[cdkObserveContent]` | `ContentObserver`, `MutationObserverFactory` | Equalizer, Sticky, Magellan, Tabs |
| platform | `@angular/cdk/platform` | none | `Platform`, feature-detection functions | all (SSR guard), Orbit and Slider swipe/touch (not OffCanvas) |
| drag-drop | `@angular/cdk/drag-drop` | `[cdkDrag]`, `[cdkDragHandle]` (plus list directives out of scope) | `createDragRef`, `DragRef`, `DragDropRegistry` | Slider handles (candidate only) |
| coercion | `@angular/cdk/coercion` | none | `coerceBooleanProperty`, `coerceNumberProperty`, `coerceArray`, `coerceCssPixelValue`, `coerceElement`, `coerceStringArray` | input parsing; mostly superseded by `booleanAttribute` / `numberAttribute` |
| keycodes | `@angular/cdk/keycodes` | none | key code constants, `hasModifierKey` | every plugin with keyboard handling |
| cdk-experimental | `@angular/cdk-experimental` | column-resize, popover-edit, autosize virtual scroll, selection, table-scroll-container | none relevant | none |

## overlay

Entry point `@angular/cdk/overlay`. Public API: `overlay/public-api.ts`. Doc: `overlay/overlay.md`.

Exports:

- `CdkOverlayOrigin`: selector `[cdk-overlay-origin], [overlay-origin], [cdkOverlayOrigin]`, exportAs `cdkOverlayOrigin` (`overlay/overlay-directives.ts:90-91`).
- `CdkConnectedOverlay`: selector `[cdk-connected-overlay], [connected-overlay], [cdkConnectedOverlay]`, exportAs `cdkConnectedOverlay`, applied to an `<ng-template>` (`overlay-directives.ts:137-138`). Inputs (all `@Input` decorator style, `overlay-directives.ts:157-261`):
  - `cdkConnectedOverlayOrigin: CdkOverlayOrigin | FlexibleConnectedPositionStrategyOrigin`
  - `cdkConnectedOverlayPositions: ConnectedPosition[]`
  - `cdkConnectedOverlayPositionStrategy: FlexibleConnectedPositionStrategy`
  - `cdkConnectedOverlayOffsetX: number`, `cdkConnectedOverlayOffsetY: number`
  - `cdkConnectedOverlayWidth`, `Height`, `MinWidth`, `MinHeight: number | string`
  - `cdkConnectedOverlayBackdropClass`, `cdkConnectedOverlayPanelClass: string | string[]`
  - `cdkConnectedOverlayViewportMargin: ViewportMargin` (default 0)
  - `cdkConnectedOverlayScrollStrategy: ScrollStrategy`
  - `cdkConnectedOverlayOpen: boolean` (default false)
  - `cdkConnectedOverlayDisableClose: boolean` (default false)
  - `cdkConnectedOverlayTransformOriginOn: string`
  - boolean-attribute inputs: `cdkConnectedOverlayHasBackdrop`, `LockPosition`, `FlexibleDimensions`, `GrowAfterOpen`, `Push`, `DisposeOnNavigation`, `MatchWidth`
  - `cdkConnectedOverlayUsePopover: FlexibleOverlayPopoverLocation | null` (`overlay-directives.ts:253-254`); default is `'global'` unless `OVERLAY_DEFAULT_CONFIG.usePopover === false`, in which case `null` (`overlay-directives.ts:294`)
  - `cdkConnectedOverlay: CdkConnectedOverlayConfig` (object form of all of the above, `overlay-directives.ts:261`); `CDK_CONNECTED_OVERLAY_DEFAULT_CONFIG` token for app-wide defaults
  - Outputs: `backdropClick: MouseEvent`, `positionChange: ConnectedOverlayPositionChange`, `attach`, `detach`, `overlayKeydown: KeyboardEvent`, `overlayOutsideClick: MouseEvent` (`overlay-directives.ts:269-284`)
- `Overlay` service (`overlay/overlay.ts:129-149`): `create(config?: OverlayConfig): OverlayRef`, `position(): OverlayPositionBuilder`, `scrollStrategies: ScrollStrategyOptions`. Not deprecated. Function alternative: `createOverlayRef(injector, config?)` (`overlay.ts:56`), which is what `Dialog` and `CdkMenuTrigger` use.
- `OverlayRef` (`overlay/overlay-ref.ts`): `attach(portal)`, `detach()`, `dispose()`, `hasAttached()`, `backdropClick()`, `attachments()`, `detachments()`, `keydownEvents()`, `outsidePointerEvents()`, `getConfig()`, `updatePosition()`, `updatePositionStrategy()`, `updateSize()`, `setDirection()`, `getDirection()`, `addPanelClass()`, `removePanelClass()` (`overlay-ref.ts:127-388`). An `OverlayRef` is a `PortalOutlet`.
- `OverlayConfig` (`overlay/overlay-config.ts:14-70`): `positionStrategy`, `scrollStrategy` (default `NoopScrollStrategy`), `panelClass`, `hasBackdrop` (default false), `backdropClass` (default `cdk-overlay-dark-backdrop`), `disableAnimations`, `width/height/minWidth/minHeight/maxWidth/maxHeight`, `direction: Direction | Directionality`, `disposeOnNavigation` (default false), `usePopover?: boolean`, `eventPredicate`.
- `OverlayContainer`, `FullscreenOverlayContainer`, `OverlayPositionBuilder` (`global()`, `flexibleConnectedTo(origin)`; `overlay/position/overlay-position-builder.ts:25-33`).
- Position strategies: `GlobalPositionStrategy` / `createGlobalPositionStrategy(injector)`; `FlexibleConnectedPositionStrategy` / `createFlexibleConnectedPositionStrategy(injector, origin)`. Builder methods on the flexible strategy (`overlay/position/flexible-connected-position-strategy.ts:417-530`): `withScrollableContainers`, `withPositions(ConnectedPosition[])`, `withViewportMargin`, `withFlexibleDimensions`, `withGrowAfterOpen`, `withPush`, `withLockedPosition`, `setOrigin`, `withDefaultOffsetX/Y`, `withTransformOriginOn(selector)`, `withPopoverLocation(location)`. `ConnectedPosition` is `{originX, originY, overlayX, overlayY, weight?, offsetX?, offsetY?, panelClass?}` (`flexible-connected-position-strategy.ts:1372-1383`). Ready-made position sets: `STANDARD_DROPDOWN_BELOW_POSITIONS` and `STANDARD_DROPDOWN_ADJACENT_POSITIONS` (`flexible-connected-position-strategy.ts:1443-1456`).
- Scroll strategies (`overlay/scroll/index.ts`): `NoopScrollStrategy` (default), `CloseScrollStrategy`, `BlockScrollStrategy`, `RepositionScrollStrategy`, each with a `create*ScrollStrategy(injector, config?)` function, plus the `ScrollStrategyOptions` service exposing `noop()`, `close(config?)`, `block()`, `reposition(config?)` (`overlay/scroll/scroll-strategy-options.ts:29-45`).
- Dispatchers: `OverlayKeyboardDispatcher`, `OverlayOutsideClickDispatcher` (`overlay/dispatchers/`).

Native popover: yes. `createOverlayRef` sets `usePopover` to `config.usePopover ?? OVERLAY_DEFAULT_CONFIG.usePopover ?? true`, forced to `false` when `'showPopover' in document.body` is false (`overlay.ts:67-78`). When enabled the host element gets `popover="manual"` and class `cdk-overlay-popover` (`overlay.ts:87-89`) and `OverlayRef.attach` calls `host.showPopover()` (`overlay-ref.ts:454-459`); the backdrop is placed inside the popover so it also reaches the top layer (`overlay-ref.ts:481-482`). Insertion point: `FlexibleConnectedPositionStrategy.withPopoverLocation('global' | 'inline' | {type: 'parent', element})` decides whether the popover lives in the `OverlayContainer` (default) or right after the trigger in DOM order (`flexible-connected-position-strategy.ts:67, 523-541`; doc `overlay.md:119-143`). Disable app-wide with `{provide: OVERLAY_DEFAULT_CONFIG, useValue: {usePopover: false}}`. Positioning is still done by the CDK in JavaScript (measuring rects), not by CSS anchor positioning; there is no `anchor` or `position-anchor` usage in the module.

Styles: `createOverlayRef` loads the structural styles at runtime through `_CdkPrivateStyleLoader` / `_CdkOverlayStyleLoader` (`overlay.ts` top of `createOverlayRef`). The doc still recommends importing `@angular/cdk/overlay-prebuilt.css` (`overlay.md:4-12`). Classes emitted (`overlay/_index.scss`): `.cdk-overlay-container`, `.cdk-global-overlay-wrapper`, `.cdk-overlay-pane`, `.cdk-overlay-backdrop`, `.cdk-overlay-backdrop-showing`, `.cdk-overlay-dark-backdrop`, `.cdk-overlay-transparent-backdrop`, `.cdk-overlay-connected-position-bounding-box`, `.cdk-global-scrollblock`, `.cdk-overlay-popover`.

SSR: `OverlayContainer` only creates its element when `Platform.isBrowser` or in a test environment (`overlay/overlay-container.ts:60, 86`); `FlexibleConnectedPositionStrategy.apply()` and `reapplyLastPosition()` return early off-browser (`flexible-connected-position-strategy.ts:232, 392`). Zoneless: 11 files inject `NgZone`, all for `runOutsideAngular` (keyboard and outside-click dispatchers, `overlay-ref.ts`, `backdrop-ref.ts`); one `afterNextRender`. No signals in inputs; the directive is still decorator-based.

Foundation plugins that could use this: Dropdown (`.dropdown-pane` as the overlay pane with `cdkConnectedOverlayUsePopover="inline"` so DOM order follows the trigger), DropdownMenu submenus (through `@angular/cdk/menu`, which builds on this), Tooltip (`.tooltip` pane with `STANDARD_DROPDOWN_BELOW_POSITIONS`-style positions and `RepositionScrollStrategy`), Reveal (through `@angular/cdk/dialog`). Not OffCanvas (in-flow, transform-driven; no overlay needed).

## portal

Entry point `@angular/cdk/portal`. Public API: `portal/public-api.ts`. Doc: `portal/portal.md`.

Exports:

- Classes: `Portal<T>` (`attach(outlet)`, `detach()`, `isAttached`), `ComponentPortal(component, viewContainerRef?, injector?, componentFactoryResolver?, projectableNodes?)`, `TemplatePortal(templateRef, viewContainerRef, context?, injector?)`, `DomPortal(element)`; outlets: `PortalOutlet` interface (`attach`, `detach`, `dispose`, `hasAttached`), `BasePortalOutlet`, `DomPortalOutlet` (`portal/portal.ts`, `portal/dom-portal-outlet.ts`).
- Directives (`portal/portal-directives.ts`): `CdkPortal` selector `[cdkPortal]`, exportAs `cdkPortal` (usable as `*cdkPortal`); `CdkPortalOutlet` selector `[cdkPortalOutlet]`, exportAs `cdkPortalOutlet`, input `cdkPortalOutlet: Portal<any> | null`, output `attached: CdkPortalOutletAttachedRef`. `ComponentType<T>` type.
- Deprecation: `attachDomPortal` is a property "To be turned into a method", `@breaking-change 10.0.0` (`portal-directives.ts:176-178`, `dom-portal-outlet.ts:139-141`). Stale marker; no action needed.

SSR and zoneless: no `NgZone`, no `isBrowser`, no `afterNextRender`. Pure view manipulation.

Foundation plugins that could use this: Reveal (a `TemplatePortal` or `ComponentPortal` attached to the dialog), Tooltip (template content into the overlay), Interchange (swapping a `TemplatePortal` per breakpoint is one option; `NgTemplateOutlet` with a signal is simpler and needs no CDK). `DomPortal` moves DOM as-is and breaks bindings (`portal.md:82`), so it is not a fit for moving Foundation markup around.

## a11y

Entry point `@angular/cdk/a11y`. Public API: `a11y/public-api.ts`. Doc: `a11y/a11y.md`. `A11yModule` imports `ObserversModule` and exports `CdkAriaLive`, `CdkTrapFocus`, `CdkMonitorFocus`; its constructor applies high-contrast body classes (`a11y/a11y-module.ts:17-23`).

Focus trap:

- `CdkTrapFocus`: selector `[cdkTrapFocus]`, exportAs `cdkTrapFocus` (`a11y/focus-trap/focus-trap.ts:414-415`). Inputs: `cdkTrapFocus: boolean` (booleanAttribute, enables/disables), `cdkTrapFocusAutoCapture: boolean` (default false; when true focuses the initial element on init and restores previous focus on destroy, `focus-trap.ts:428-443, 456-467`). Region attributes: `cdkFocusRegionStart`, `cdkFocusRegionEnd`, `cdkFocusInitial` (`a11y.md:364-383`). Traps Tab only, not mouse (`a11y.md:361`).
- `FocusTrap` class: `enabled`, `attachAnchors()`, `focusInitialElement[WhenReady]()`, `focusFirstTabbableElement[WhenReady]()`, `focusLastTabbableElement[WhenReady]()`, `hasAttached()`, `destroy()` (`focus-trap.ts:88-291`). `FocusTrapFactory.create(element, deferCaptureElements = false)` (`focus-trap.ts:400`).
- `ConfigurableFocusTrap` / `ConfigurableFocusTrapFactory.create(element, config?: ConfigurableFocusTrapConfig)` where config has `defer: boolean` (`a11y/focus-trap/configurable-focus-trap-factory.ts:19-44`, `configurable-focus-trap-config.ts:14-16`). Inert strategy via `FOCUS_TRAP_INERT_STRATEGY` token, default `EventListenerFocusTrapInertStrategy` (`focus-trap-inert-strategy.ts:12`). This is the newer factory; `CdkDialogContainer` still uses `FocusTrapFactory` (`dialog/dialog-container.ts:78`).

Focus monitoring:

- `FocusMonitor` service: `monitor(element, checkChildren?) : Observable<FocusOrigin>`, `stopMonitoring(element)`, `focusVia(element, origin, options?)` (`a11y/focus-monitor/focus-monitor.ts:181-275`). `FocusOrigin = 'touch' | 'mouse' | 'keyboard' | 'program' | null` (`focus-monitor.ts:34`). Adds `.cdk-focused` and `.cdk-<origin>-focused` classes (`a11y.md:430-433`). `FOCUS_MONITOR_DEFAULT_OPTIONS` with `detectionMode: FocusMonitorDetectionMode.IMMEDIATE | EVENTUAL` (`focus-monitor.ts:46-66`).
- `CdkMonitorFocus`: selector `[cdkMonitorElementFocus], [cdkMonitorSubtreeFocus]`, output `cdkFocusChange: FocusOrigin` (`focus-monitor.ts:611-621`).
- `InputModalityDetector`: `modalityDetected`, `modalityChanged: Observable<InputModality>`, `mostRecentModality`, where `InputModality = 'keyboard' | 'mouse' | 'touch' | null` (`a11y/input-modality/input-modality-detector.ts:31, 105-111`). Options token `INPUT_MODALITY_DETECTOR_OPTIONS`.

Live regions:

- `LiveAnnouncer.announce(message, politeness?: AriaLivePoliteness, duration?: number): Promise<void>`, `clear()`; `AriaLivePoliteness = 'off' | 'polite' | 'assertive'`; defaults via `LIVE_ANNOUNCER_DEFAULT_OPTIONS {politeness?, duration?}` (`a11y/live-announcer/live-announcer.ts:60-162`, `live-announcer-tokens.ts:15-36`).
- `CdkAriaLive`: selector `[cdkAriaLive]`, exportAs `cdkAriaLive`, input `cdkAriaLive: AriaLivePoliteness` (anything other than `off`/`assertive` becomes `polite`), input `duration`; announces the host's text content whenever it mutates, using `ContentObserver` (`live-announcer.ts:232-262`).

Key managers (`a11y/key-manager/`):

- `ListKeyManager<T extends ListKeyManagerOption>` (`list-key-manager.ts`): builder methods `skipPredicate(fn)`, `withWrap(bool)`, `withVerticalOrientation(bool)`, `withHorizontalOrientation('ltr' | 'rtl' | null)`, `withAllowedModifierKeys(keys)`, `withTypeAhead(debounceMs = 200)`, `withHomeAndEnd(bool)`, `withPageUpDown(bool, delta = 10)`; runtime `onKeydown(event)`, `setActiveItem(indexOrItem)`, `updateActiveItem(indexOrItem)`, `setFirst/Last/Next/PreviousItemActive()`, `isTyping()`, `destroy()`; state `activeItemIndex`, `activeItem` (backed by signals since `list-key-manager.ts:42-43`), streams `change: Subject<number>`, `tabOut: Subject<void>` (`list-key-manager.ts:87-380`). Items implement `{disabled?: boolean; getLabel?(): string}`.
- `FocusKeyManager<T>` (items implement `focus(origin?)`) and `ActiveDescendantKeyManager<T>` (items implement `setActiveStyles()` / `setInactiveStyles()`) (`focus-key-manager.ts:19-22`, `activedescendant-key-manager.ts:24`).
- `TreeKeyManager<T extends TreeKeyManagerItem>` with `TreeKeyManagerItem {getParent(), getChildren(), isExpanded, expand(), collapse(), focus(), ...}`, strategy interface `onKeydown`, `getActiveItem()`, `getActiveItemIndex()`, `focusItem()`; factory token `TREE_KEY_MANAGER` (`tree-key-manager-strategy.ts:13-138`). `NoopTreeKeyManager` is deprecated, `@breaking-change 21.0.0` (`noop-tree-key-manager.ts:29-32, 76-79`).

Other:

- `InteractivityChecker`: `isDisabled(el)`, `isVisible(el)`, `isTabbable(el)`, `isFocusable(el, config?: IsFocusableConfig {ignoreVisibility})` (`a11y/interactivity-checker/interactivity-checker.ts:15-150`).
- `AriaDescriber`: `describe(host, message: string | HTMLElement, role?)`, `removeDescription(...)`; manages a hidden message container and `aria-describedby` ids (`a11y/aria-describer/aria-describer.ts:64-97`).
- `HighContrastModeDetector.getHighContrastMode(): HighContrastMode` (`NONE` off-browser, `high-contrast-mode-detector.ts:66-68`).
- `_IdGenerator.getId(prefix)`: underscore-prefixed but exported and used by accordion, menu, dialog for unique ids (`a11y/id-generator.ts`; `accordion/accordion.ts:45`, `menu/menu-base.ts:75`).
- Sass: `a11y-visually-hidden` mixin emits `.cdk-visually-hidden`; the old `a11y()` mixin is deprecated (`a11y/_index.scss:38`). `high-contrast` mixin targets `forced-colors` (`a11y.md:226-230`).

SSR: 10 files check `Platform.isBrowser` (focus monitor, input modality, live announcer, high contrast, focus trap, interactivity checker). Zoneless: 7 files inject `NgZone` for `runOutsideAngular`; one `afterNextRender`. `ListKeyManager` state is signal-backed.

Foundation plugins that could use this: Reveal and OffCanvas (`FocusTrap` or the `cdkTrapFocus` directive; `InteractivityChecker` for choosing the initial focus target; dialog already wraps this), Tooltip (`FocusMonitor` to show on keyboard focus only, `InputModalityDetector` for the touch-tap rule, `AriaDescriber` to attach `aria-describedby`), Abide (`LiveAnnouncer` for validation messages if the `.form-error` region is not itself `aria-live`), Orbit (`LiveAnnouncer` for "slide N of M", `FocusKeyManager` for bullets), Slider (`LiveAnnouncer` optional; native range input announces itself), DropdownMenu / Drilldown / Tabs / Orbit bullets (`FocusKeyManager` or `ActiveDescendantKeyManager` with `withHorizontalOrientation(dir)` for RTL), AccordionMenu and Drilldown (`TreeKeyManager` if the spec chooses the APG tree pattern), every component that emits ids (`_IdGenerator`).

## layout

Entry point `@angular/cdk/layout`. Public API: `layout/public-api.ts`. Doc: `layout/layout.md`. Exports `LayoutModule` (empty module), `BreakpointObserver`, `BreakpointState`, `Breakpoints`, `MediaMatcher`.

- `BreakpointObserver.observe(value: string | readonly string[]): Observable<BreakpointState>` and `isMatched(value): boolean` (`layout/breakpoints-observer.ts:63-77`). `BreakpointState = {matches: boolean; breakpoints: {[query: string]: boolean}}` (`breakpoints-observer.ts:16-22`). Multiple queries in one string separated by commas are split (`splitQueries`).
- `MediaMatcher.matchMedia(query): MediaQueryList` wraps `window.matchMedia`; off-browser it returns a `noopMatchMedia` stub with `matches: false` (`layout/media-matcher.ts:20-45, 90`). On WebKit/Blink it injects a style rule so `matchMedia` listeners fire reliably (`media-matcher.ts:42`).
- `Breakpoints` constants are Material's (XSmall 599.98px, Small 600-959.98px, Medium 960-1279.98px, Large 1280-1919.98px, XLarge 1920px+, plus Handset/Tablet/Web portrait and landscape; `layout/breakpoints.ts:11-33`). They do not match Foundation's `$breakpoints` map (small 0, medium 640px, large 1024px, xlarge 1200px, xxlarge 1440px in `foundation-sites/scss/settings/_settings.scss`), so a Foundation port must pass its own query strings; `BreakpointObserver` accepts any media query string.

SSR: `MediaMatcher` falls back to the noop stub (`media-matcher.ts:28-32`), so `isMatched` is `false` and `observe` emits `{matches: false}` on the server. Zoneless: `NgZone` referenced in `breakpoints-observer.ts` only, to run listener callbacks inside the zone; harmless when zoneless.

Foundation plugins that could use this: ResponsiveMenu and ResponsiveToggle (`data-responsive-menu`; ResponsiveToggle's real `hideFor` option, i.e. `data-hide-for`, defaulting to `'medium'` (`foundation.responsiveToggle.js:134-141`)). Foundation has no `data-show-for` plugin option and no per-breakpoint Dropdown positioning: the `.show-for-*` / `.hide-for-*` classes (for example `.show-for-medium`, `.hide-for-small-only`) are Sass/CSS visibility utilities, not plugin configuration, and Dropdown's `position` / `alignment` options (`foundation.dropdown.js:381, 388`) are set once per instance, with no breakpoint variant. Other plugins that could use this module: ResponsiveAccordionTabs (mode by breakpoint), Interchange (`data-interchange` rules are media-query keyed), Equalizer (`data-equalize-on`), Sticky (`data-sticky-on`), OffCanvas (`data-reveal-on` / `.reveal-for-*`). Replaces Foundation's `MediaQuery` utility; the spec must decide whether a `FoundationBreakpoints` token (name to query) lives in the library or the app. Native alternative: `matchMedia` directly, or CSS-only for pure show/hide.

## scrolling

Entry point `@angular/cdk/scrolling`. Public API: `scrolling/public-api.ts`. Doc: `scrolling/scrolling.md`. `ScrollingModule` re-exports `BidiModule`, `CdkScrollableModule`, and the virtual scroll directives (`scrolling/scrolling-module.ts:28-40`).

- `CdkScrollable`: selector `[cdk-scrollable], [cdkScrollable]` (`scrolling/scrollable.ts:40`). Methods: `elementScrolled(): Observable<Event>`, `getElementRef()`, `scrollTo(options: ExtendedScrollToOptions)` where options accept `top/bottom/left/right/start/end` plus `behavior`, and `measureScrollOffset(from: 'top' | 'left' | 'right' | 'bottom' | 'start' | 'end')` which normalises RTL (`scrollable.ts:32, 71-153`). Registers with `ScrollDispatcher`.
- `ScrollDispatcher`: `register(target)`, `deregister(target)`, `scrolled(auditTimeInMs = 20): Observable<ScrollDispatcherTarget | void>` (emits for window scroll too; returns an empty observable off-browser, `scroll-dispatcher.ts:87-88`), `ancestorScrolled(elementOrRef, auditTimeInMs?)`, `getAncestorScrollContainers(elementOrRef)` (`scrolling/scroll-dispatcher.ts:16, 55-145`). `DEFAULT_SCROLL_TIME = 20`.
- `ViewportRuler`: `getViewportSize()`, `getViewportRect()`, `getViewportScrollPosition(): {top, left}`, `change(throttleTime = 20): Observable<Event>` on window `resize` and `orientationchange` (`scrolling/viewport-ruler.ts:15, 46-109`). Off-browser it returns zeros and never emits.
- Virtual scroll: `<cdk-virtual-scroll-viewport>` with inputs `orientation: 'horizontal' | 'vertical'`, `appendOnly` (booleanAttribute), output `scrolledIndexChange: Observable<number>` (`scrolling/virtual-scroll-viewport.ts:70, 104-131`); `cdk-virtual-scroll-viewport[itemSize]` adds `itemSize`, `minBufferPx`, `maxBufferPx` (`fixed-size-virtual-scroll.ts:194-234`); `*cdkVirtualFor` (`virtual-for-of.ts`, same context as `*ngFor` plus `templateCacheSize`); `[cdkVirtualScrollingElement]` and `cdk-virtual-scroll-viewport[scrollWindow]` for external scroll containers (`virtual-scrollable-element.ts:16`, `virtual-scrollable-window.ts:17`); `VIRTUAL_SCROLL_STRATEGY` token for custom strategies.

SSR: `isBrowser` guards in `scroll-dispatcher.ts`, `viewport-ruler.ts`, and the virtual scroll viewport. Zoneless: 6 files inject `NgZone` (`runOutsideAngular` for scroll and resize listeners); `afterNextRender` in 3 files (viewport measurement).

Foundation plugins that could use this: Magellan (`ScrollDispatcher.scrolled()` plus `ViewportRuler.getViewportScrollPosition()` to pick the active target; native `IntersectionObserver` is the first rung and needs neither), Sticky (`ScrollDispatcher` and `ViewportRuler.change()` for the JS fallback; CSS `position: sticky` is the first rung), SmoothScroll (`CdkScrollable.scrollTo({top, behavior: 'smooth'})` on a scroll container; for the window, native `window.scrollTo` / `scrollIntoView({behavior: 'smooth'})` suffices), Dropdown and Tooltip (only indirectly, through the overlay `RepositionScrollStrategy` / `CloseScrollStrategy`, which subscribe to `ScrollDispatcher`). Virtual scroll: no Foundation plugin needs it.

## dialog

Entry point `@angular/cdk/dialog`. Public API: `dialog/public-api.ts`. Doc: `dialog/dialog.md`.

- `Dialog` service (`dialog/dialog.ts`): `open<R, D, C>(componentOrTemplateRef, config?: DialogConfig<D, DialogRef<R, C>>): DialogRef<R, C>` (`dialog.ts:116-160`), `closeAll()`, `getDialogById(id)`, `openDialogs`, `afterOpened: Subject<DialogRef>`, `afterAllClosed: Observable<void>` (`dialog.ts:70-177`). Each open creates its own overlay with `createOverlayRef` and, unless a `positionStrategy` is given, `createGlobalPositionStrategy(...).centerHorizontally().centerVertically()`; the scroll strategy comes from `config.scrollStrategy` or the `DIALOG_SCROLL_STRATEGY` factory; `disposeOnNavigation` mirrors `closeOnNavigation` (`dialog.ts:136, 208-221`).
- `DialogRef<R, C>`: `close(result?, options?: DialogCloseOptions)`, `updatePosition()`, `updateSize(width?, height?)`, `addPanelClass`, `removePanelClass`; streams `closed: Observable<R | undefined>`, `backdropClick`, `keydownEvents`, `outsidePointerEvents`; fields `componentInstance`, `componentRef`, `containerInstance`, `overlayRef`, `config`, `id`, `disableClose` (`dialog/dialog-ref.ts:30-141`).
- `DialogConfig<D, R, C>` fields (`dialog/dialog-config.ts:47-199`): `viewContainerRef`, `injector`, `id`, `role: 'dialog' | 'alertdialog'` (default `dialog`), `panelClass`, `hasBackdrop` (default true), `backdropClass`, `disableClose` (default false), `closePredicate`, `width`, `height`, `minWidth/minHeight/maxWidth/maxHeight`, `positionStrategy`, `data`, `direction`, `ariaDescribedBy`, `ariaLabelledBy`, `ariaLabel`, `ariaModal` (default `false`), `autoFocus: 'dialog' | 'first-tabbable' | 'first-heading' | string | boolean` (default `first-tabbable`; boolean form flagged `@breaking-change 14.0.0`), `restoreFocus: boolean | string | HTMLElement` (default true), `scrollStrategy`, `closeOnNavigation` (default true), `closeOnDestroy` (default true), `closeOnOverlayDetachments` (default true), `disableAnimations`, `providers`, `container` (custom container component or `{type, providers}`), `templateContext`, `bindings`.
- Tokens (`dialog/dialog-injectors.ts`): `DIALOG_DATA`, `DEFAULT_DIALOG_CONFIG` (replaces, does not merge with, built-in defaults: `dialog.md:132-134`), `DIALOG_SCROLL_STRATEGY`.
- `CdkDialogContainer`: selector `cdk-dialog-container`; host bindings `[attr.id]`, `[attr.role]="_config.role"`, `[attr.aria-modal]="_config.ariaModal"`, `[attr.aria-labelledby]`, `[attr.aria-label]`, `[attr.aria-describedby]` (`dialog/dialog-container.ts:54-70`). Focus: creates a `FocusTrap` with `FocusTrapFactory` (`dialog-container.ts:78, 361`), implements the `autoFocus` table (`dialog-container.ts:254-293`), restores focus on close (`dialog-container.ts:300`). Consumers can extend it and pass their own class as `config.container` to own the DOM (`dialog.md:96-101`).

Does it use `<dialog>`? No. There is no `HTMLDialogElement`, `showModal`, or `<dialog>` in `dialog/` (rg over the module returns only the `role` values and `'dialog'` autofocus target). The container is a custom element inside an overlay pane. Modal semantics come from: the focus trap, `aria-modal` (off by default), and `Dialog._hideNonDialogContentFromAssistiveTechnology`, which sets `aria-hidden="true"` on every sibling of the overlay container except `script`, `style`, elements with `aria-live`, and elements with a `popover` attribute (`dialog.ts:395-410`). Because the dialog overlay is created with `createOverlayRef`, it is rendered as a native popover in the top layer when supported (see overlay section).

SSR: `dialog-container.ts:360` guards focus-trap creation with `isBrowser`. Zoneless: one `NgZone` use (`runOutsideAngular` in the container), one `afterNextRender`, one signal.

Foundation plugins that could use this: Reveal. Fit notes for the spec: Foundation's markup is `<div class="reveal-overlay"><div class="reveal">...</div></div>`; with the CDK the backdrop is `.cdk-overlay-backdrop` (style it with `backdropClass: 'reveal-overlay'` or map Foundation's overlay styles onto it) and the panel is the custom container element (use `panelClass: 'reveal'` or a container subclass that renders `.reveal`). `data-close-on-click` maps to `disableClose` plus `backdropClick`; `data-close-on-esc` to `disableClose` / `keydownEvents`; `data-deep-link` and `data-update-history` have no CDK equivalent (History API, Playwright-tested). Native `<dialog>` with `showModal()` is the first rung and gives top layer, focus containment (in modern browsers), Escape handling and `::backdrop` for free; the CDK dialog is the fallback when the spec needs `restoreFocus` variants, `closePredicate`, stacking with `afterAllClosed`, or SSR-safe programmatic opening from a service.

## menu

Entry point `@angular/cdk/menu`. Public API: `menu/public-api.ts`. Doc: `menu/menu.md`. `CdkMenuModule` exports all directives (`menu/menu-module.ts:36`).

Directives, roles and classes (`menu.md:8-40` and the host blocks cited):

- `CdkMenuTrigger`: selector `[cdkMenuTriggerFor]`, exportAs `cdkMenuTriggerFor`; host `class="cdk-menu-trigger"`, `aria-haspopup="menu"`, `aria-expanded`, `aria-controls` (from base), click/keydown/focus handlers. Inputs: `cdkMenuTriggerFor: TemplateRef`, `cdkMenuPosition: ConnectedPosition[]`, `cdkMenuTriggerData`, `cdkMenuTriggerTransformOriginOn`. Outputs: `cdkMenuOpened`, `cdkMenuClosed`. Methods `toggle()`, `open()`, `close()`, `isOpen()` (`menu/menu-trigger.ts:57-131`, `menu/menu-trigger-base.ts:69-140`). Default positions: `STANDARD_DROPDOWN_BELOW_POSITIONS` for a top-level trigger, `STANDARD_DROPDOWN_ADJACENT_POSITIONS` for a submenu trigger inside a menu (`menu-trigger.ts:300-303`). Scroll strategy from `MENU_SCROLL_STRATEGY`, default `createRepositionScrollStrategy` (`menu-trigger-base.ts:35-41`). The menu panel is an overlay (so it renders as a native popover when supported).
- `CdkContextMenuTrigger`: selector `[cdkContextMenuTriggerFor]`; inputs `cdkContextMenuTriggerFor`, `cdkContextMenuPosition`, `cdkContextMenuDisabled` (booleanAttribute); `open(coordinates)`, `close()` (`menu/context-menu-trigger.ts:49-94`).
- `CdkMenu`: selector `[cdkMenu]`, host `role="menu"`, `class="cdk-menu"`, `[class.cdk-menu-inline]`; output `closed`; vertical orientation (`menu/menu.ts:26-44`).
- `CdkMenuBar`: selector `[cdkMenuBar]`, host `role="menubar"`, `class="cdk-menu-bar"`; horizontal inline menu stack (`menu/menu-bar.ts:32-42`).
- `CdkMenuBase` (shared): input `id` (auto `cdk-menu-N`), `orientation`, `isInline`, host `[attr.aria-orientation]`, `tabindex` management; uses `FocusKeyManager` (`menu/menu-base.ts:39-205`).
- `CdkMenuItem`: selector `[cdkMenuItem]`, host `role="menuitem"`, `class="cdk-menu-item"`, `[class.cdk-menu-item-disabled]`, `[tabindex]`, `[attr.aria-disabled]`; inputs `cdkMenuItemDisabled` (booleanAttribute), `cdkMenuitemTypeaheadLabel` (note the lowercase `i` in the alias, `menu-item.ts:79`); output `cdkMenuItemTriggered`; methods `focus()`, `trigger({keepOpen})` (`menu/menu-item.ts:38-130`).
- `CdkMenuItemCheckbox` (`[cdkMenuItemCheckbox]`, role `menuitemcheckbox`), `CdkMenuItemRadio` (`[cdkMenuItemRadio]`, role `menuitemradio`), both with `cdkMenuItemChecked` input and no internal state (`menu.md:172-174, 186-188`); `CdkMenuGroup` (`[cdkMenuGroup]`, role `group`).
- `CdkTargetMenuAim` (`[cdkTargetMenuAim]`) provides `MENU_AIM` with `TargetMenuAim` for submenu hover intent (`menu/menu-aim.ts:266-268`).
- Services and tokens: `MenuStack` with `push`, `close`, `closeSubMenuOf`, `closeAll`, `isEmpty`, `peek`, streams `closed`, `hasFocus`, `emptied` (`menu/menu-stack.ts:72-188`); tokens `MENU_STACK`, `PARENT_OR_NEW_MENU_STACK_PROVIDER`, `PARENT_OR_NEW_INLINE_MENU_STACK_PROVIDER(orientation)`, `CDK_MENU`, `MENU_TRIGGER`, `MENU_AIM`, `MENU_SCROLL_STRATEGY`; `PointerFocusTracker`.

SSR: no `isBrowser` checks in the module itself; the overlay layer beneath it has them. Zoneless: 4 files inject `NgZone` for `runOutsideAngular` on `mouseenter`; one signal.

Foundation plugins that could use this: DropdownMenu, but only when the items are actions. WAI-ARIA `menu`/`menubar` roles are for application menus; a site navigation bar of links (Foundation's DropdownMenu demo) is the APG "disclosure navigation menu" pattern (`d:/projects/github/w3c/aria-practices/content/patterns/disclosure/examples/disclosure-navigation.html`), which uses `aria-expanded` on buttons and no `menu` roles. The DropdownMenu spec must choose; if it picks disclosure navigation, `@angular/cdk/menu` does not apply and the trigger becomes native `popover` plus `aria-expanded`. Dropdown: applicable only when the pane content is a list of `menuitem`s; a `.dropdown-pane` with arbitrary content is a non-modal dialog or plain disclosure, not a menu. Drilldown and AccordionMenu: not menus in the ARIA sense either (nested in-place lists); `TreeKeyManager` or `@angular/aria` tree is closer. `@angular/aria` ships its own `ngMenu`, `ngMenuBar`, `ngMenuItem`, `ngMenuTrigger`, `ngMenuContent` (`src/aria/menu/*.ts`), which the Aria ticket should compare against this module.

## accordion

Entry point `@angular/cdk/accordion`. Public API: `accordion/public-api.ts`. Doc: `accordion/accordion.md`.

- `CdkAccordion`: selector `cdk-accordion, [cdkAccordion]`, exportAs `cdkAccordion`; input `multi` (booleanAttribute, default false); `openAll()` (only when `multi`), `closeAll()`; readonly `id` from `_IdGenerator`; provided as `CDK_ACCORDION` (`accordion/accordion.ts:33-68`).
- `CdkAccordionItem`: selector `cdk-accordion-item, [cdkAccordionItem]`, exportAs `cdkAccordionItem`; inputs `expanded`, `disabled` (both booleanAttribute); outputs `opened`, `closed`, `destroyed`, `expandedChange: boolean`; methods `toggle()`, `open()`, `close()`; readonly `id`; injects `CDK_ACCORDION` with `{optional: true, skipSelf: true}` so it works standalone, and provides `CDK_ACCORDION` as `undefined` to stop nested items registering with the outer accordion (`accordion/accordion-item.ts:31-111`). Single-expansion is coordinated through `UniqueSelectionDispatcher` from `@angular/cdk/collections` (`accordion-item.ts:22, 42, 81`).
- No ARIA is applied; the doc tells you to add `role="button"`, `aria-controls`, `aria-expanded` on the trigger and `role="region"`, `aria-labelledby` on the body yourself (`accordion.md:8-13`).

SSR and zoneless: no `NgZone`, no `isBrowser`; one signal use. Pure state.

Foundation plugins that could use this: Accordion (`data-multi-expand` maps to `multi`, `data-allow-all-closed` has no CDK equivalent and needs a guard in the item), AccordionMenu (expansion state per submenu, if the spec does not go with a tree), ResponsiveAccordionTabs in accordion mode. Because this module manages only expansion state and leaves all ARIA to the consumer, `@angular/aria`'s `ngAccordionGroup` / `ngAccordionTrigger` / `ngAccordionPanel` / `ngAccordionContent` (`src/aria/accordion/*.ts`), which applies roles, `aria-expanded`, `aria-controls`, and keyboard handling, is the higher rung; native `<details name="...">` grouping would be the rung above that, but it misses the Angular 22 browser target: the `name` attribute needs Chrome 120, Firefox 130, Safari 17.2, against the target Chrome/Edge/Firefox 119, Safari 17 (`research/web-platform-features.md` section 4). On the target set, exclusive expansion falls back to a `toggle` event listener that closes sibling `<details>` elements, which degrades gracefully once `name` is available. No deprecation notice on the CDK accordion as of 22.2.0.

## listbox

Entry point `@angular/cdk/listbox`. Public API: `listbox/public-api.ts`. Doc: `listbox/listbox.md`.

- `CdkListbox<T>`: selector `[cdkListbox]`, exportAs `cdkListbox`; host `role="listbox"`, `class="cdk-listbox"`, `aria-disabled`, `aria-multiselectable`, `aria-orientation`, `aria-activedescendant` when enabled. Inputs: `id`, `tabindex`, `cdkListboxValue: readonly T[]`, `cdkListboxMultiple`, `cdkListboxDisabled`, `cdkListboxUseActiveDescendant` (all booleanAttribute), `cdkListboxOrientation: 'horizontal' | 'vertical'`, `cdkListboxCompareWith`, `cdkListboxNavigationWrapDisabled`, `cdkListboxNavigatesDisabledOptions`; output `cdkListboxValueChange`; implements `ControlValueAccessor` (`listbox/listbox.ts:239-378`). Keyboard through `ListKeyManager` / `ActiveDescendantKeyManager` with typeahead.
- `CdkOption<T>`: selector `[cdkOption]`, exportAs `cdkOption`; host `role="option"`, `class="cdk-option"`, `.cdk-option-active`, `aria-selected`, `aria-disabled`; inputs `id`, `cdkOption: T` (value), `cdkOptionTypeaheadLabel`, `cdkOptionDisabled` (`listbox.ts:88-134`).
- Selection does not follow focus (`listbox.md:137-140`).

SSR: `listbox.ts:433-448` guards with `isBrowser`. Zoneless: one `NgZone` use; signals for `useActiveDescendant`.

Foundation plugins that could use this: none. No Foundation plugin implements the listbox pattern (Orbit bullets are a tablist-like control, Tabs are tabs). Listed for completeness; `@angular/aria` has `ngListbox` / `ngOption` (`src/aria/listbox/`).

## stepper

Entry point `@angular/cdk/stepper`. Public API: `stepper/public-api.ts`. Doc: `stepper/stepper.md`.

- `CdkStepper`: selector `[cdkStepper]`, exportAs `cdkStepper`; inputs `linear` (booleanAttribute), `selectedIndex` (numberAttribute), `selected: CdkStep`, `orientation: 'horizontal' | 'vertical'`; outputs `selectionChange: StepperSelectionEvent`, `selectedIndexChange: number`; methods `next()`, `previous()`, `reset()`; `steps: QueryList<CdkStep>` (`stepper/stepper.ts:317-420`, offsets from the class start at line 320). Keyboard: arrow keys move header focus, Enter/Space select (`stepper.md:53-58`). No roles applied; the doc recommends `tablist` / `tab` / `tabpanel` (`stepper.md:60-66`).
- `CdkStep`: selector `cdk-step`, exportAs `cdkStep`, template `<ng-template><ng-content/></ng-template>`; inputs `stepControl: AbstractControl-like`, `label`, `errorMessage`, `aria-label`, `aria-labelledby`, `state: StepState`, `editable`, `optional`, `completed`; output `interacted`; computed `isSelected`, `indicatorType` (`stepper.ts:109-230`). `STEPPER_GLOBAL_OPTIONS {showError?, displayDefaultIndicatorType?}`.
- `CdkStepHeader` (`[cdkStepHeader]`), `CdkStepLabel` (`[cdkStepLabel]`), `CdkStepperNext` (`button[cdkStepperNext]`, `type` default `submit`), `CdkStepperPrevious` (`button[cdkStepperPrevious]`, `type` default `button`) (`stepper/stepper-button.ts:15-40`, `step-header.ts:13`, `step-label.ts:12`).

SSR and zoneless: no `NgZone`, no `isBrowser`; signals for `linear`, `selectedIndex`, step state.

Foundation plugins that could use this: none. Foundation has no wizard plugin; Tabs is a tabs pattern, for which `@angular/aria` `ngTabs` / `ngTabList` / `ngTab` / `ngTabPanel` / `ngTabContent` (`src/aria/tabs/`) is the direct fit.

## bidi

Entry point `@angular/cdk/bidi`. Public API: `bidi/public-api.ts`. Doc: `bidi/bidi.md`.

- `Directionality` (root service): `value: Direction` (getter over `valueSignal: Signal<Direction>`), `change: EventEmitter<Direction>`; initial value read from `DIR_DOCUMENT` `body.dir` or `html.dir`, `auto` resolved from `navigator.language` against a known-RTL locale list rather than the text content (`bidi/directionality.ts:19-58`, `bidi.md:44-49`). `Direction = 'ltr' | 'rtl'`.
- `Dir` directive: selector `[dir]`, exportAs `dir`, host `[attr.dir]`; input `dir`, output `dirChange`; provides itself as `Directionality` so descendants get the nearest `dir` (`bidi/dir.ts:28-58`).
- `DIR_DOCUMENT` token defaults to `DOCUMENT` (`bidi/dir-document-token.ts:26`). `BidiModule` exports `Dir`.

SSR and zoneless: no `NgZone`, no `isBrowser`; `valueSignal` is a signal.

Foundation plugins that could use this: Dropdown and Tooltip (flip `left`/`right` alignment: overlay strategies already take `Directionality`), DropdownMenu and Drilldown (arrow-key direction; `ListKeyManager.withHorizontalOrientation(dir.value)`), Orbit (previous/next and swipe direction), Slider (`data-vertical` no, but horizontal value direction under `dir="rtl"`), OffCanvas (`position-left` / `position-right` semantics under RTL, if the spec wants logical positions). Foundation itself supports RTL through Sass `$global-text-direction`; this module gives the runtime value.

## observers

Entry point `@angular/cdk/observers`. Public API: `observers/public-api.ts`. Doc: `observers/observers.md`.

- `CdkObserveContent`: selector `[cdkObserveContent]`, exportAs `cdkObserveContent`; output `cdkObserveContent: MutationRecord[]`; inputs `cdkObserveContentDisabled` (booleanAttribute), `debounce: number` (`observers/observe-content.ts:176-206`). Observes `characterData`, `childList`, `subtree`.
- `ContentObserver.observe(elementOrRef): Observable<MutationRecord[]>` shares one `MutationObserver` per element (`observe-content.ts:67-98`); `MutationObserverFactory.create(callback)` returns `null` when `MutationObserver` is undefined (`observe-content.ts:59-60`), which is the SSR guard. `ObserversModule` exports the directive.
- A private `SharedResizeObserver` exists under `observers/private/` but is not exported from `@angular/cdk/observers`.

Zoneless: 2 files inject `NgZone` for `runOutsideAngular`.

Foundation plugins that could use this: Equalizer (re-measure when projected content changes; native `ResizeObserver` on the children is the more direct signal and is the first rung), Sticky (container height changes), Magellan (target list changes), Tabs and Orbit (dynamic panels/slides; `contentChildren` signal queries already cover Angular-rendered children, so this is only needed for non-Angular DOM changes).

## platform

Entry point `@angular/cdk/platform`. Public API: `platform/public-api.ts`. Doc: `platform/platform.md` (one paragraph).

- `Platform` (root service): `isBrowser` (from `PLATFORM_ID`), `EDGE`, `TRIDENT`, `BLINK`, `WEBKIT`, `IOS`, `FIREFOX`, `ANDROID`, `SAFARI` booleans, all `false` off-browser (`platform/platform.ts:39-87`).
- Feature functions: `getSupportedInputTypes(): Set<string>` (`features/input-types.ts:43`), `supportsPassiveEventListeners()`, `normalizePassiveListenerOptions(options)` (`features/passive-listeners.ts:16-40`), `supportsScrollBehavior()`, `getRtlScrollAxisType(): RtlScrollAxisType` (`features/scrolling.ts:35-71`), `_supportsShadowDom()`, `_getShadowRoot(el)`, `_getFocusedElementPierceShadowDom()`, `_getEventTarget(event)` (`features/shadow-dom.ts:12-59`), `_isTestEnvironment()` (`features/test-environment.ts:10`). `PlatformModule` is empty.

Foundation plugins that could use this: every plugin that touches `window` or `document` during construction should either use `afterNextRender` or check `Platform.isBrowser` (equivalent to `isPlatformBrowser(inject(PLATFORM_ID))`, so this module is optional). `getSupportedInputTypes()` tells Abide whether `type="email"` and friends are native. Foundation's `Touch` utility is swipe for Orbit and drag for Slider, and tap (outside-touch close detection) for Dropdown, DropdownMenu, Reveal, and Tooltip; OffCanvas imports no Nest, Motion, Box, or Touch utility (`research/foundation-inventory-menus.md` 6.7; `research/foundation-utilities-conventions.md` section 9 utility table). None of this has a CDK equivalent; native Pointer Events replace it. `supportsScrollBehavior()` matters for SmoothScroll's fallback decision.

## drag-drop (Slider handles only)

Entry point `@angular/cdk/drag-drop`. Public API: `drag-drop/public-api.ts`. The local `drag-drop.md` only links to https://angular.dev/guide/drag-drop; the guide text is in the angular/angular clone at `d:/projects/github/angular/angular/adev/src/content/guide/drag-drop.md`.

Free-drag surface relevant to a slider handle:

- `CdkDrag<T>`: selector `[cdkDrag]`, exportAs `cdkDrag` (`drag-drop/directives/drag.ts:61-62`). Inputs (`drag.ts:90-163`): `cdkDragData: T`, `cdkDragLockAxis: 'x' | 'y' | null`, `cdkDragRootElement: string`, `cdkDragBoundary: string | ElementRef | HTMLElement` (a CSS selector is looked up the ancestor chain; guide lines 216-218), `cdkDragStartDelay: number | {touch: number; mouse: number}` (guide 240-244), `cdkDragFreeDragPosition: Point` (set the position programmatically; guide 206-208), `cdkDragDisabled`, `cdkDragConstrainPosition: (userPointerPosition, dragRef, dimensions, pickupPositionInElement) => Point` (`drag-ref.ts:64-68`; the hook for snapping to steps), `cdkDragPreviewClass`, `cdkDragPreviewContainer`, `cdkDragScale` (numberAttribute). Outputs: `cdkDragStarted`, `cdkDragReleased`, `cdkDragEnded`, `cdkDragEntered`, `cdkDragExited`, `cdkDragDropped`, `cdkDragMoved` (`drag.ts:167-196`).
- `CdkDragHandle`: selector `[cdkDragHandle]`, input `cdkDragHandleDisabled` (`drag-drop/directives/drag-handle.ts:34-50`).
- `DragRef<T>` created with `createDragRef(injector, element, config?)` (`drag-drop/drag-ref.ts:130-132`): `lockAxis`, `dragStartDelay`, `constrainPosition`, `scale`; `withHandles`, `withRootElement`, `withBoundaryElement`, `withDirection(direction)`, `withParent`, `getFreeDragPosition()`, `setFreeDragPosition(point)`, `isDragging()`, `reset()`, `disableHandle` / `enableHandle`, `dispose()`; streams `beforeStarted`, `started`, `released`, `ended`, `moved` (`drag-ref.ts:328-694`).
- Deprecation: the `DragDrop` service (`createDrag`, `createDropList`) is deprecated in favour of `createDragRef` / `createDropListRef`, removal `@breaking-change 23.0.0` (`drag-drop/drag-drop.ts:15-42`).

SSR: no `isBrowser` guards in the module; pointer listeners are attached in the browser via `afterNextRender` (1 file) and `runOutsideAngular` (`drag-ref.ts`, `drag-drop-registry.ts`, `drag.ts`). Zoneless: 4 files use signals.

Foundation plugins that could use this: Slider handles, and only as a fallback. `CdkDrag` positions the element with a CSS `transform: translate3d` and expects to own the element's position, while Foundation's `.slider-handle` is positioned with `left` (or `bottom` for `data-vertical`) percentages driven by the fill (`foundation-sites/scss/components/_slider.scss`); combining them means translating `cdkDragMoved` pointer positions back into a percentage and resetting the transform on release. Native `<input type="range">` styled to Foundation's slider (first rung) or a hand-written Pointer Events handler with `setPointerCapture` (custom Angular) are both smaller than importing drag-drop. Not for Orbit swipe (no drop semantics needed) and not for anything else in the plugin list.

## coercion

Entry point `@angular/cdk/coercion`. Public API: `coercion/public-api.ts`. Doc: `coercion/coercion.md`.

Functions and types (`coercion/*.ts`): `coerceBooleanProperty(value): boolean` and `BooleanInput`, `coerceNumberProperty(value, fallback = 0)` and `NumberInput`, `_isNumberValue`, `coerceArray(value)`, `coerceCssPixelValue(value): string` (number to `Npx`), `coerceElement(elementOrRef)`, `coerceStringArray(value, separator = /\s+/)`.

Note for specs: Angular core's `booleanAttribute` and `numberAttribute` input transforms cover the boolean and number cases and are what the CDK itself now uses (for example `overlay-directives.ts:230`, `accordion-item.ts:64`). Signal inputs take `input(false, {transform: booleanAttribute})`. `coerceCssPixelValue` and `coerceElement` remain useful one-liners; `coerceStringArray` fits `class`-list style inputs.

Foundation plugins that could use this: any directive taking Foundation `data-*` option values as attribute strings (`data-multi-expand="true"`, `data-hover-delay="250"`); prefer core transforms, reach for `coerceCssPixelValue` for Sticky margins and Slider sizes.

## keycodes

Entry point `@angular/cdk/keycodes`. Public API: `keycodes/public-api.ts`. Doc: `keycodes/keycodes.md`.

- Numeric `KeyboardEvent.keyCode` constants: `BACKSPACE`, `TAB`, `ENTER`, `ESCAPE`, `SPACE`, `PAGE_UP`, `PAGE_DOWN`, `END`, `HOME`, `LEFT_ARROW`, `UP_ARROW`, `RIGHT_ARROW`, `DOWN_ARROW`, `DELETE`, `ZERO`..`NINE`, `A`..`Z`, `F1`..`F12`, and more (`keycodes/keycodes.ts:10-98`).
- `hasModifierKey(event, ...modifiers: ('altKey' | 'shiftKey' | 'ctrlKey' | 'metaKey')[]): boolean`; with no modifiers listed it returns true if any modifier is pressed (`keycodes/modifiers.ts:9-15`).
- Caveat: the constants are `keyCode` values, a deprecated DOM property; `ListKeyManager.onKeydown` and the menu and listbox directives still switch on `event.keyCode`. New hand-written handlers should compare `event.key` (`'Escape'`, `'ArrowDown'`) and only need `hasModifierKey`.

Foundation plugins that could use this: replaces Foundation's `Keyboard` utility (`foundation-sites/js/foundation.util.keyboard.js`) for Accordion, Tabs, Dropdown, DropdownMenu, Drilldown, AccordionMenu, Orbit, Slider, Reveal (Escape), OffCanvas (Escape), Tooltip (Escape). Where a key manager or `@angular/aria` directive handles keys, nothing is needed from here.

## cdk-experimental

Entry point `@angular/cdk-experimental`. Public API: `src/cdk-experimental/public-api.ts` exports only `VERSION`; each secondary entry point has its own. README: "Nothing in this package is considered stable or production ready" (`src/cdk-experimental/README.md`).

What remains in 22.2.0 (`ls src/cdk-experimental`): `column-resize` (`table[cdk-table][columnResize]` and friends), `popover-edit` (`[cdkPopoverEdit]`, `[cdkRowHoverContent]`, `form[cdkEditControl]`, ...), `scrolling` (`cdk-virtual-scroll-viewport[autosize]` with `minBufferPx` / `maxBufferPx`, `scrolling.md`), `selection` (`[cdkSelection]`, `[cdkSelectionToggle]`, `[cdkSelectAll]`, `[cdkRowSelection]`, `cdk-selection-column`), `table-scroll-container` (`[cdkTableScrollContainer]`). All table-related or virtual-scroll-related; none applies to the 21 Foundation plugins.

What left: commit `5fd56d94a` "build: create angular aria package (#31942)", 2025-10-02, deleted `src/cdk-experimental/{accordion, combobox, deferred-content, listbox, radio-group, tabs, toolbar, tree, ui-patterns}` and moved them to `src/aria` (`git log --diff-filter=D --name-only -- src/cdk-experimental`). `@angular/aria` dropped its developer-preview tag in commit `84f2afd24`, commit date 2026-05-09 (`CHANGELOG.md:385`). `@angular/aria` peer-depends on `@angular/cdk` (`src/aria/package.json`), so adopting Aria still pulls the CDK.

`@angular/aria` 22.2.0 directive selectors, for cross-reference with the Aria ticket (`src/aria/*/`): `[ngAccordionGroup]`, `[ngAccordionTrigger]`, `[ngAccordionPanel]`, `ng-template[ngAccordionContent]`; `[ngCombobox]`, `ng-template[ngComboboxPopup]`, `[ngComboboxWidget]`; `[ngGrid]`, `[ngGridRow]`, `[ngGridCell]`, `[ngGridCellWidget]`; `[ngListbox]`, `[ngOption]`; `[ngMenu]`, `[ngMenuBar]`, `[ngMenuItem]`, `[ngMenuTrigger]`, `ng-template[ngMenuContent]`; `[ngTabs]`, `[ngTabList]`, `[ngTab]`, `[ngTabPanel]`, `ng-template[ngTabContent]`; `[ngToolbar]`, `[ngToolbarWidget]`, `[ngToolbarWidgetGroup]`; `[ngTree]`, `[ngTreeItem]`, `ng-template[ngTreeItemGroup]`. There is no Aria dialog, tooltip, disclosure, or slider; those stay on native elements, the CDK, or custom code.

## Deprecation notices in @angular/cdk 22.2.0

Complete list from `rg -n "@deprecated" src/cdk` (specs and schematics excluded). Nothing in `src/cdk` is deprecated "in favour of `@angular/aria`"; `rg -i "angular/aria" src/cdk` returns no hits.

| Where | What | Replacement | Marker |
| --- | --- | --- | --- |
| `drag-drop/drag-drop.ts:15-42` | `DragDrop` service, `createDrag`, `createDropList` | `createDragRef`, `createDropListRef` | `@breaking-change 23.0.0` |
| `table/table.ts:102-104` | a no-op directive in the table module | remove | `@breaking-change 23.0.0` |
| `a11y/key-manager/noop-tree-key-manager.ts:29-32, 76-79` | `NoopTreeKeyManager` | `TreeKeyManager` or a `TreeKeyManagerStrategy` | `@breaking-change 21.0.0` (still present) |
| `tree/tree.ts:180-182, 1207-1209`, `tree/control/*.ts` | `TreeControl`, `FlatTreeControl`, `NestedTreeControl`, `BaseTreeControl`, `CdkTree.treeControl`, `CdkTreeNode.role` | `levelAccessor` / `childrenAccessor` | `@breaking-change 21.0.0` (still present) |
| `overlay/position/global-position-strategy.ts:127-145` | `GlobalPositionStrategy.width()` / `.height()` | `OverlayConfig.width` / `.height` | `@breaking-change 8.0.0` |
| `portal/portal-directives.ts:176-178`, `portal/dom-portal-outlet.ts:139-141` | `attachDomPortal` as a property | method form | `@breaking-change 10.0.0` |
| `dialog/dialog-container.ts:193-195` | `attachDomPortal` property | method form | `@breaking-change 10.0.0` |
| `dialog/dialog-config.ts:129` | boolean `autoFocus` | `AutoFocusTarget` string | `@breaking-change 14.0.0` |
| `a11y/_index.scss:38` | Sass mixin `a11y()` | `a11y-visually-hidden` | none |
| `text-field/_index.scss:85` | Sass mixin `text-field` | `autosize`, `autofill` | none |
| `testing/component-harness.ts:14-16`, `testing/protractor/*` | `AsyncFactoryFn` alias, Protractor environment | plain `() => Promise<T>`; Protractor no longer works | `@breaking-change 21.0.0` / `13.0.0` |

Only the `drag-drop` row touches any module this effort might use, and only if the Slider spec picks `DragRef`, in which case it must call `createDragRef`.

## Cross-cutting notes for the building-blocks ticket

- The CDK overlay is the one place where "native popover" and "CDK" overlap: it already renders overlays as `popover="manual"` elements in the top layer, but positions them in JavaScript. A Dropdown or Tooltip spec that wants CSS anchor positioning must skip the CDK overlay; one that wants viewport-aware flipping and push behaviour today gets it from `FlexibleConnectedPositionStrategy` with `withPopoverLocation('inline')` keeping DOM order.
- The CDK dialog does not use `<dialog>`; it is an overlay plus a focus trap plus `aria-hidden` on siblings. Reveal needs a prototype ticket to compare native `<dialog>` against `Dialog` on: focus restoration, nested reveals, `closePredicate`, backdrop styling under Foundation's `.reveal-overlay`, and SSR.
- `@angular/cdk/menu`, `/listbox`, `/accordion` are not deprecated but now have `@angular/aria` counterparts that apply ARIA for you; the CDK accordion applies no ARIA at all. The standing preference order (native, Aria, CDK, custom) already ranks Aria above these.
- `BreakpointObserver` is the natural home for Foundation's `MediaQuery` utility, with the library owning a Foundation-named breakpoint map; `Breakpoints` from the CDK are Material's values and should not appear in specs.
- Every module that touches the DOM at construction is SSR-safe by `Platform.isBrowser` guards; every high-frequency listener runs outside the zone; no CDK code waits on `NgZone.onStable`. Nothing here blocks the zoneless and SSR requirements in `map.md`.
- CDK 22.2 services are declared with the Angular 22 `@Service()` decorator imported from `@angular/core` rather than `@Injectable({providedIn: 'root'})` (`overlay/overlay.ts:129`, `a11y/live-announcer/live-announcer.ts:36`, `layout/breakpoints-observer.ts:10`). Directive inputs in the CDK are still decorator-based (`@Input`, `@Output`) with `booleanAttribute` / `numberAttribute` transforms; only internal state has moved to signals. The new library's DI conventions should follow the Angular 22 guidance from the Angular ticket, not the CDK's transitional mix.
