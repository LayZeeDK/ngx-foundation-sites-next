# 09. Angular Material 22.2 counterparts as API-design reference

Type: research
Status: resolved
Blocked by: none
Labels: wayfinder:research
Map: ../map.md

## Question

How does Angular Material 22.2 design the public API of the components that correspond to Foundation plugins, and which CDK or Aria primitives does each sit on? Material is a reference for API shape, not for styling.

Map: Accordion to `expansion`; Tabs to `tabs`; Reveal to `dialog` (and `bottom-sheet`); Tooltip to `tooltip`; Dropdown and DropdownMenu to `menu` and `select`'s panel; OffCanvas to `sidenav`; Slider to `slider`; Abide to `form-field` errors and `input`; Sticky and Magellan to `toolbar` and `sort` (where relevant); Orbit has no counterpart (say so); ResponsiveMenu and ResponsiveToggle to whatever Material does with BreakpointObserver.

For each: the public inputs and outputs and their naming, two-way bindings via `model()`, whether it is a directive or component and why, how it handles animation after the `@angular/animations` deprecation, how it handles SSR and zoneless, the ARIA it emits, and how it is tested (harnesses, unit tests, e2e).

Sources: `d:/projects/github/angular/components/src/material/<name>/**` including `*.md` docs and `testing/` harnesses; the Material docs site https://material.angular.dev/components/<name>/overview via markdown.new when the clone is unclear.

## Deliverable

`research/angular-material-reference.md`: one section per mapped component with an "API patterns worth borrowing" list and an "API patterns that do not fit a CSS-contract library" list. Cite paths. Plain ASCII.

## Answer

Gist (the facts a decision will hang on):

- Material 22.2 is still decorator-based (492 `@Input`, 91 `@Output`) but already carries 32 `input()`/`input<`/`input.required` sites, 1 `model()` site, and 3 `output()`/`output<` sites (counted with `rg -o --glob '!*.spec.ts' --glob '!**/testing/**' -e 'input\(' -e 'input<' -e 'input\.required' src/material | wc -l` and the same pattern for `model(`/`model<` and `output(`/`output<`; see `research/angular-material-reference.md` 0.1); Aria is signal-based (122 `input()`/`model()`, zero `@Input`). Take input NAMES and output SEMANTICS from Material, signal SHAPE from Aria.
- Material's two-way convention is `x` + `xChange` plus derived void streams (`opened`/`closed` = `openedChange.pipe(filter, map)`); with `model()` that is one member. This is the rule for mapping Foundation `open.zf.*`/`close.zf.*` events.
- `@angular/animations` is gone from `src/material` and `src/cdk`; `animate.enter`/`animate.leave` are NOT used either. Every component uses CSS transitions or keyframes plus `transitionend`/`animationend` (or a `setTimeout` for dialog), always with a simulated event when animations are disabled, and always gated by `_animationsDisabled()` (config token, NoopAnimations, or `prefers-reduced-motion`).
- Test bootstrap is zoneless (`test/angular-test.init.ts`); explicit `runOutsideAngular`/`ngZone.run` hygiene remains in the sources. SSR guards are `Platform.isBrowser`, `afterNextRender`, `afterRenderEffect`; tabs render a hidden host and server-only `<ng-content>` for hydration.
- DI: one lightweight `InjectionToken` per parent/child link (`useExisting`, `inject(..., {optional, skipSelf})`), child containers re-provide the parent token as `undefined` to block grandchildren, per-package `*_DEFAULT_OPTIONS` tokens, `HostAttributeToken('tabindex')`, `_IdGenerator` ids.
- Aria adds dev-mode `reportViolations()` from `afterRenderEffect({read})` and lazy content via `DeferredContentAware`/`DeferredContent` with a `preserveContent` model.
- Aria accordion and tabs are ALL directives on consumer markup; tabs pair `ngTab`/`ngTabPanel` by string `value` with `selectedTab = model<string>()`, `focusMode`, `selectionMode` inputs. That is the shape for Foundation Accordion and Tabs.
- Reveal: Material is a service (`MatDialog.open`) on `CDK/dialog`; the borrowable parts are the ref surface, `autoFocus` union, `closePredicate`, `restoreFocus`, `closeOnNavigation`, and the `[mat-dialog-close]` directive shape. Native `<dialog>` is the first rung to test.
- Tooltip: directive on trigger, `aria-describedby` to a hidden copy (`AriaDescriber`), visible bubble `aria-hidden`, delays and touch gestures as inputs, no outputs. Material already routes select's panel through native popover (`cdkConnectedOverlayUsePopover`).
- Menu: trigger owns `aria-haspopup/expanded/controls`, `closed` output carries a reason; Material disclaims `menuitemcheckbox/radio`; Aria `MenuBar` is the menubar pattern Material lacks.
- Sidenav: `opened` as the single two-way state (backed by a signal), open/close/toggle return promises after transition, `mode`/`position` logical values, focus trap only in over/push, `inert` on content, no role set (consumer decides).
- Slider: native `<input type="range">` per thumb with the directive reading native props; only `aria-valuetext` is added.
- Abide: `ErrorStateMatcher` (with a Signal Forms variant), `mat-error`/`mat-hint` ids collected into `aria-describedby`, `aria-live="polite"` container, `aria-invalid` null while empty and required.
- Sticky: nothing in Material. Magellan: `matSort`'s id-keyed active model. Orbit: no carousel anywhere in the repo. Responsive*: `BreakpointObserver.observe()` + `toSignal` recipe from the navigation schematic; Material's `Breakpoints` values are not Foundation's.
- Testing: harnesses assert on DOM/ARIA (class, `aria-expanded`, `aria-disabled`), never on instance fields; `documentRootLoader` for overlay content; e2e is thin (selenium, only slider among mapped components).

Surprises: Material has zero `animate.enter` usage despite the docs recommending it; `MatSelect` already uses the native popover API for its overlay; `MatSortHeader` puts `tabindex`/`role="button"` on an inner div because of an NVDA `<th>` bug; `MatMenuItem` exposes a `role` input for checkbox/radio that the docs say is unsupported.

Open questions not settled here (for the building-blocks or prototype tickets): whether `animate.enter`/`animate.leave` with Motion UI classes can replace Material's transitionend approach for completion outputs; whether native `<dialog>`/popover satisfy the focus-restore-with-origin behaviour `CDK/dialog` provides; how Foundation's breakpoint names reach a `MediaQuery` signal service.

Findings: ../research/angular-material-reference.md
