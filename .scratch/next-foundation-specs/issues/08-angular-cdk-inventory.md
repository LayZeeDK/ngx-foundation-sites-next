# 08. @angular/cdk 22.2 inventory relevant to Foundation plugins

Type: research
Status: open
Blocked by: none
Labels: wayfinder:research
Map: ../map.md

## Question

Which CDK 22.2 modules can carry Foundation plugin behaviour, and what do their APIs look like today? The specs need concrete module and directive names, not general awareness.

Cover: `overlay` (OverlayModule, CdkConnectedOverlay, positioning strategies, scroll strategies, and whether it uses native popover), `portal`, `a11y` (FocusTrap, ConfigurableFocusTrap, FocusMonitor, LiveAnnouncer, ListKeyManager, ActiveDescendantKeyManager, InteractivityChecker, `cdkAriaLive`), `layout` (BreakpointObserver, MediaMatcher), `scrolling` (ScrollDispatcher, ViewportRuler, CdkScrollable, virtual scroll), `dialog` (Dialog, CdkDialogContainer, and whether it uses `<dialog>`), `menu` (CdkMenu, CdkMenuBar, CdkMenuTrigger, CdkContextMenuTrigger), `accordion`, `listbox`, `stepper`, `bidi`, `observers` (CdkObserveContent), `platform`, `drag-drop` (only as far as Slider handles go), `coercion`, `keycodes`, plus `cdk-experimental`. Note anything deprecated in favour of `@angular/aria`.

Sources: `d:/projects/github/angular/components/src/cdk/**` and `d:/projects/github/angular/components/src/cdk-experimental/**` (public API files, README, docs `*.md` next to the sources). Online: https://material.angular.dev/cdk/categories.

## Deliverable

`research/angular-cdk-inventory.md`: one section per module with the exported directives and services, key inputs and options, SSR and zoneless notes, and a "Foundation plugins that could use this" line. Cite paths. Plain ASCII.
