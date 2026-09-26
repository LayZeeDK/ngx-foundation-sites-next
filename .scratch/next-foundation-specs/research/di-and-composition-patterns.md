# Modern DI and composition patterns in Angular 22.2, Aria, CDK, Material, and the Google product wrappers

Ticket: `../issues/13-di-and-composition-patterns.md`
Sources: `d:/projects/github/angular/angular` (22.2.0, `adev/src/content/guide/**`) and `d:/projects/github/angular/components` (22.2.0, `src/**`). Paths below are relative to those two roots unless they start with `packages/` (this repo) or `AGENTS.md`. Line numbers are from the 22.2.x branch as cloned on 2026-09-25.

Reading order suggestion: sections 2 and 3 carry the rules every spec's "DI shape" paragraph will cite; section 9 is the catalogue.

Corrected 2026-09-25 after [Audit 0001: research wave](../audits/0001-research-wave.md),
findings L1, L2: corrected three drifted line citations and settled the Material
signal-input count.

## 1. Lightweight injection tokens

### The guide's pattern

`adev/src/content/guide/di/lightweight-injection-tokens.md`:

- A class ends up in the bundle whenever it sits in a *value position*: the token argument of `contentChild`/`contentChildren`, or the argument of `inject()`. Type-position references are erased. So `readonly header = contentChild(LibHeader)` retains `LibHeader` even when no template ever uses `<lib-header>`.
- The fix is a small token that stands in for the class. The guide's form is an abstract class:

```ts
abstract class LibHeaderToken { abstract doSomething(): void; }

@Component({
  selector: 'lib-header',
  providers: [{provide: LibHeaderToken, useExisting: LibHeader}],
})
class LibHeader extends LibHeaderToken { doSomething() {} }

@Component({selector: 'lib-card'})
class LibCard { readonly header = contentChild(LibHeaderToken); }
```

- Four parts: (1) abstract-class token, (2) implementation extends it, (3) parent queries or injects the token, (4) implementation provides itself under the token with `useExisting`.
- Naming rule from the guide: component base name plus `Token` suffix, `LibHeaderToken`.
- Scope note from the guide: "Lightweight injection tokens are only useful with components"; services should use tree-shakable `providedIn: 'root'` providers instead.

### What the components repo actually does

The components repo applies the same idea with `InjectionToken` constants rather than abstract classes. The retention motive is stated verbatim in three places:

- `src/cdk/accordion/accordion.ts:22-27`: `CDK_ACCORDION = new InjectionToken<CdkAccordion>('CdkAccordion')`, "It serves as alternative token to the actual `CdkAccordion` class which could cause unnecessary retention of the class and its directive metadata."
- `src/material/tabs/tab-label.ts:12-17`: `MAT_TAB_LABEL`, same wording.
- `src/material/tabs/tab-content.ts:10-16`: `MAT_TAB_CONTENT`, same wording.

The type argument keeps the API typed without a runtime import of the directive. Aria takes this one step further and uses `import type` in every token file so the token module carries no runtime dependency on the directive at all:

- `src/aria/accordion/accordion-tokens.ts`: `import type {AccordionGroup}`; `ACCORDION_GROUP = new InjectionToken<AccordionGroup>('ACCORDION_GROUP')`.
- `src/aria/tabs/tab-tokens.ts`: `TABS`, `TAB_LIST`.
- `src/aria/listbox/tokens.ts`: `LISTBOX`.
- `src/aria/menu/menu-tokens.ts`: `MENU_COMPONENT = new InjectionToken<Menu<any> | MenuBar<any>>` (one token, two providers).
- `src/aria/combobox/combobox-tokens.ts`: `COMBOBOX_POPUP`.
- `src/aria/grid/grid-tokens.ts`: `GRID`, `GRID_ROW`, `GRID_CELL`.
- `src/aria/toolbar/toolbar-tokens.ts`: `TOOLBAR_WIDGET_GROUP`.

A second motive in Material is breaking circular imports between parent and child files, and those tokens are typed to an interface or `any` rather than the class:

- `src/material/expansion/accordion-base.ts:39-43`: `MAT_ACCORDION = new InjectionToken<MatAccordionBase>('MAT_ACCORDION')`, "Used primarily to avoid circular imports between `MatAccordion` and `MatExpansionPanel`." `MatAccordionBase` is an interface extending `CdkAccordion`.
- `src/material/expansion/expansion-panel-base.ts:21-25`: `MAT_EXPANSION_PANEL = new InjectionToken<MatExpansionPanelBase>`.
- `src/material/tabs/tab.ts:37`: `MAT_TAB_GROUP = new InjectionToken<any>('MAT_TAB_GROUP')`, "Used to provide a tab group to a tab without causing a circular dependency."
- `src/material/tabs/tab-label.ts:19-23`: `MAT_TAB = new InjectionToken<any>('MAT_TAB')`.
- `src/material/menu/menu-panel.ts:19` plus the `MatMenuPanel<T>` interface: the token's type is a documented interface so `matMenuTriggerFor` accepts custom panels.

Content queries by token (the guide's step 3) appear in Material as: `@ContentChildren(MAT_PREFIX, {descendants: true})`, `MAT_SUFFIX`, `MAT_ERROR` at `src/material/form-field/form-field.ts:231-233`; `@ContentChildren(MAT_OPTGROUP, {descendants: true})` at `src/material/autocomplete/autocomplete.ts:156`; `@ContentChildren(MAT_SLIDER_RANGE_THUMB, {descendants: false})` at `src/material/slider/slider.ts:99`.

The abstract-class form from the guide does exist in the repo where the token also defines a contract: `export abstract class MatFormFieldControl<T>` at `src/material/form-field/form-field-control.ts:16`, provided by `MatInput` (`src/material/input/input.ts:94`) and `MatSelect` (`src/material/select/select.ts:181`) with `{provide: MatFormFieldControl, useExisting: ...}` and queried by `MatFormField`. Material chose the abstract class there because consumers implement it; for pure parent handles it chose `InjectionToken`.

Provider shape used by every parent in all three packages:

```ts
providers: [{provide: ACCORDION_GROUP, useExisting: AccordionGroup}]   // src/aria/accordion/accordion-group.ts:69
providers: [{provide: CDK_ACCORDION, useExisting: CdkAccordion}]       // src/cdk/accordion/accordion.ts:35
providers: [{provide: MAT_TAB_GROUP, useExisting: MatTabGroup}]        // src/material/tabs/tab-group.ts:76-80
```

Naming: CDK and Material use `SCREAMING_SNAKE` prefixed by package (`CDK_`, `MAT_`); Aria uses bare `SCREAMING_SNAKE` (`TABS`, `LISTBOX`). None use the guide's `XxxToken` suffix.

## 2. Hierarchical DI and host-scoped providers

Source: `adev/src/content/guide/di/hierarchical-dependency-injection.md` (HDI) and `adev/src/content/guide/di/defining-dependency-providers.md` (DDP).

### Two hierarchies

HDI lines 7-13: `EnvironmentInjector` (configured by `@Service()`/`providedIn` or `ApplicationConfig.providers`) and `ElementInjector` (one per DOM element, empty unless a directive or component on it declares `providers` or `viewProviders`). Resolution walks the element injector chain first, then the environment chain.

### `providers` versus `viewProviders`

HDI 628-632: "Providers in `viewProviders` are only visible inside the component's own view -- content projected into the component via `<ng-content>` cannot see them." `providers` are visible to both the view and projected content. Rule for a library: a parent that must be reachable from consumer-written children uses `providers`; `viewProviders` is only for things the component's own template consumes.

### Why projected content resolves against the declaration site

HDI 320-352 introduces the logical `<#VIEW>` tree. HDI 748-752: "Content projected with `<ng-content>` can't see a component's `viewProviders`, because Angular resolves injection against the injector where the content is declared, not where it renders." A child written in the consumer's template belongs to the consumer's view; its element injector chain runs up through the *consumer's* elements. The parent library component is still on that chain (it is the element the child is nested under in the consumer's template), which is why `inject(PARENT_TOKEN)` in a projected child works when the parent uses `providers`. It fails when the parent uses `viewProviders`, or when the child is not a DOM descendant of the parent in the consumer's template.

The guide's escape hatch (HDI 752-782): accept an `<ng-template>` via `contentChild.required(TemplateRef)` and render it with `[ngTemplateOutlet]` plus `[ngTemplateOutletInjector]="injector"` where `injector = inject(Injector)` inside the component. The projected markup is then created with the component's injector and sees its `viewProviders`. Cost: an `<ng-template>` wrapper on the consumer side.

### `inject()` flags and where each is used

HDI 167-306. Flags: `optional`, `self`, `skipSelf`, `host`. `host` "lets you designate a component as the last stop in the injector tree"; the search stops at the edge of the host component's `<#VIEW>`. `self` restricts to the current element injector; `skipSelf` starts at the parent element injector.

Concrete usage in the components repo:

- `skipSelf + optional` for "my parent of the same kind, if any", combined with a `useValue: undefined` provider so nested instances do not find a grandparent:

```ts
// src/cdk/accordion/accordion-item.ts:25-33
@Directive({
  providers: [{provide: CDK_ACCORDION, useValue: undefined}], // stop nested items registering upward
})
export class CdkAccordionItem {
  accordion = inject<CdkAccordion>(CDK_ACCORDION, {optional: true, skipSelf: true})!;
```

  Same in `src/material/expansion/expansion-panel.ts:74-80` and `:139`. Also `MatDialog._parentDialog = inject(MatDialog, {optional: true, skipSelf: true})` (`src/material/dialog/dialog.ts:61`), `MatSnackBar`, `MatBottomSheet`, `cdk/dialog/dialog.ts:59`, and `CdkVirtualForOf._viewport = inject(CDK_VIRTUAL_SCROLL_VIEWPORT, {skipSelf: true})` (`src/cdk/scrolling/virtual-for-of.ts:90`).

- `skipSelf` inside a `useFactory` to mean "reuse the ancestor's instance or create one": `PARENT_OR_NEW_MENU_STACK_PROVIDER = {provide: MENU_STACK, useFactory: () => inject(MENU_STACK, {optional: true, skipSelf: true}) || new MenuStack()}` (`src/cdk/menu/menu-stack.ts:31-34`).

- `self + optional` for "a sibling directive on my own element":
  - `CdkMenuItem._menuTrigger = inject(CdkMenuTrigger, {optional: true, self: true})` (`src/cdk/menu/menu-item.ts:69-70`, "if one is added to the same element").
  - `MatMenuTriggerBase._menuItemInstance = inject(MatMenuItem, {optional: true, self: true})` (`src/material/menu/menu-trigger-base.ts:73`).
  - `MatInput.ngControl = inject(NgControl, {optional: true, self: true})` (`src/material/input/input.ts:102`) and `inject(FORM_FIELD, {optional: true, self: true})` where `FORM_FIELD` is imported from `@angular/forms/signals` (`input.ts:31, 303`): the Signal Forms field directive on the same element.

- `host: true` for "the component whose content I am projected into": `MatExpansionPanelHeader.panel = inject(MatExpansionPanel, {host: true})` (`src/material/expansion/expansion-panel-header.ts:60`). The header is written by the consumer inside `<mat-expansion-panel>`, so its declaration-site chain reaches the panel's element injector; `host` stops the search there so a header outside a panel fails loudly. Note it injects the class, not `MAT_EXPANSION_PANEL`; the panel is always present when a header exists, so retention is not a concern.

- `HostAttributeToken` for reading static host attributes at construction: `inject(new HostAttributeToken('tabindex'), {optional: true})` (`expansion-panel-header.ts:66`, `src/material/radio/radio.ts:600`, `src/material/button-toggle/button-toggle.ts:679`).

### Providers and host directives

`adev/src/content/guide/directives/directive-composition-api.md:162-168`: a class with `hostDirectives` and its host directives can inject each other; both may declare providers; on a shared token "the providers defined by class with `hostDirectives` take precedence over providers defined by the host directives."

### Where to declare providers (DDP)

DDP "Where can you specify providers?": bootstrap (`bootstrapApplication` providers), element (`@Component`/`@Directive` `providers`), route (`Route.providers`). DDP notes that element-level providers are "Always included in the same JavaScript bundle as the component or directive, even if the value is never injected", and that if "multiple directives on the same element provide the same token, one will win, but which one is undefined." DDP's library-author section recommends `provideX(config, ...features)` functions returning `Provider[]` with `withX()` feature helpers, matching `provideRouter`/`provideHttpClient`.

## 3. Parent discovery patterns

Five mechanisms are in use. Aria uses (a), (c), (d), (e); CDK and Material use (a) and (b).

### (a) Token on the parent, `inject()` in the child, child registers itself

Parent: `providers: [{provide: TOKEN, useExisting: Parent}]`. Child: `inject(TOKEN)` (required) or `inject(TOKEN, {optional: true})`, then registers in `ngOnInit` and unregisters in `ngOnDestroy`.

- `src/aria/accordion/accordion-trigger.ts:66, 129-141`: `_accordionGroup = inject(ACCORDION_GROUP)`; `ngOnInit` builds `_pattern`, sets `this.panel()._pattern = this._pattern`, then `this._accordionGroup._collection.register(this)`.
- `src/aria/tabs/tab-list.ts:63, 178-185`: `_tabsParent = inject(TABS)`; `ngOnInit` calls `_tabsParent._register(this)`. `Tabs` stores it in `_tabList = signal<TabList | undefined>()` (`tabs.ts:62`).
- `src/aria/tabs/tab.ts:52, 118-124`: `_tabList = inject(TAB_LIST)`; registers in `_tabList._collection`.
- `src/aria/tabs/tab-panel.ts:65, 129-135`: `_tabs = inject(TABS)`; registers in `_tabs._collection`.
- `src/aria/listbox/option.ts:61, 91-97`: `_listbox = inject(LISTBOX)`.
- `src/aria/menu/menu-item.ts:77, 108-114`: `parent = inject<Menu<V> | MenuBar<V>>(MENU_COMPONENT, {optional: true})`; `ngOnInit` calls `this.parent?._collection.register(this)`; a missing parent is reported in dev mode through `reportViolations(['ngMenuItem must be placed inside an ngMenu or ngMenuBar container.'])` (`menu-item.ts:96-105`).
- Material: `MatMenuItem._parentMenu = inject(MAT_MENU_PANEL, {optional: true})` then `_parentMenu?.addItem?.(this)` (`src/material/menu/menu-item.ts:56, 89`); `MatTab._closestTabGroup = inject(MAT_TAB_GROUP, {optional: true})` (`tab.ts:53`); `MatTabLabel._closestTab = inject(MAT_TAB, {optional: true})` (`tab-label.ts:32`); `MatRadioButton` injects `MAT_RADIO_GROUP` (`radio.ts:599`); `MatButtonToggle` injects `MAT_BUTTON_TOGGLE_GROUP` (`button-toggle.ts:678`); `MatDrawer._container = inject(MAT_DRAWER_CONTAINER, {optional: true})` (`sidenav/drawer.ts:202`).
- Direct class injection instead of a token, where the parent is unavoidable: `ToolbarWidgetGroup._toolbar = inject(Toolbar, {optional: true})` (`src/aria/toolbar/toolbar-widget-group.ts:38`); `MapMarker._googleMap = inject(GoogleMap)` (`src/google-maps/map-marker/map-marker.ts:41`).

### (b) Content queries with `descendants: true`, filtered by closest parent

Used where the parent needs an ordered list and the children may be nested inside other markup (or inside nested instances of the same component):

- `src/material/tabs/tab-group.ts:118`: `@ContentChildren(MatTab, {descendants: true}) _allTabs`; `:422-425` filters to tabs whose `_closestTabGroup === this` so nested tab groups do not leak tabs upward. The token injected in (a) exists to make this filter possible.
- `src/material/expansion/accordion.ts:49-52, 76-83`: `@ContentChildren(MatExpansionPanelHeader, {descendants: true}) _headers`, filtered by `header.panel.accordion === this` into `_ownHeaders`, then fed to `FocusKeyManager`.
- `src/material/menu/menu.ts:124, 200`: both `_allItems` (`descendants: true`) and `items` (`descendants: false`).
- Aria uses signal queries sparingly: `contentChildren(ToolbarWidget, {descendants: true})` (`toolbar-widget-group.ts:46`), `contentChild(GridCellWidget, {descendants: true})` (`grid-cell.ts:59`), and `contentChild(AccordionContent)` in `AccordionPanel` for a dev-mode violation check only (`accordion-panel.ts:59, 86-90`).
- `descendants: false` is the choice when only direct children count: `MatTabHeader` label wrappers, `MatList` avatars/icons, `MatSlider` range thumbs.

### (c) Aria's `SortedCollection`: manual registration plus DOM-order sorting

`src/aria/private/utils/collection.ts`: `register(item)`/`unregister(item)` update a `signal<Set<T>>`; `orderedItems` is a `computed` that sorts by DOM position (`sortDirectives`, using `element` on each item); `startObserving(element)` installs a `MutationObserver({childList: true, subtree: true})` that bumps a version signal on structural change so order recomputes. Every Aria container calls `afterNextRender(() => this._collection.startObserving(this.element))` and `stopObserving()` in `ngOnDestroy` (`accordion-group.ts:104-114`, `tabs.ts:95-101`, `menu.ts:190-196`).

Why not `contentChildren`: `src/aria/menu/menu.ts:120-129` documents "contentChildren has an issue where it will return a successively smaller list each time that the menu is open and closed"; registration also works when items are created by `@for`, `@defer`, or `DeferredContent` embedded views, and across projection boundaries, without any query at all. The container owns the `_collection`; children reach it through the token from (a).

### (d) Explicit links by template reference or by value

Where two directives are not nested, Aria links them with inputs instead of DI:

- `AccordionTrigger.panel = input.required<AccordionPanel>()` (`accordion-trigger.ts:69`); the consumer writes `<button ngAccordionTrigger [panel]="panel1">` and `<div ngAccordionPanel #panel1="ngAccordionPanel">`.
- `MenuTrigger.menu = input<Menu<V>>()` and `MenuItem.submenu = input<Menu<V>>()` (`menu-trigger.ts:66`, `menu-item.ts:80`).
- `ComboboxPopup.combobox = input.required<Combobox>()` (`combobox-popup.ts:37`); the popup registers itself with `this.combobox()._registerPopup(this)` in `ngOnInit`.
- Material: `@Input('matMenuTriggerFor') menu: MatMenuPanel | null` (`menu-trigger.ts:47-53`).
- Value-keyed pairing: Aria tabs match `ngTab value` to `ngTabPanel value` through `Tabs._panelMap`/`_tabMap` computed maps (`tabs.ts:71-92`), so tab list and panels can live anywhere under `ngTabs`.

### (e) Reverse link through a writable signal on the target

`Menu.parent = signal<MenuTrigger<V> | MenuItem<V> | undefined>()` (`menu.ts:88`) is set by the trigger's `effect(() => this.menu()?.parent.set(this))` (`menu-trigger.ts:93`, `menu-item.ts:95`). `AccordionPanel._pattern` is likewise assigned by its trigger (`accordion-trigger.ts:135`).

## 4. Host directives as a composition tool

### Aria's private `DeferredContent` pair

`src/aria/private/deferred-content/deferred-content.ts`:

```ts
@Directive()  // no selector: host-directive only
export class DeferredContentAware {
  readonly contentVisible = signal(false);
  readonly preserveContent = model(false);
}

@Directive()
export class DeferredContent implements OnDestroy {
  private readonly _deferredContentAware = inject(DeferredContentAware, {optional: true});
  private readonly _templateRef = inject(TemplateRef);
  private readonly _viewContainerRef = inject(ViewContainerRef);
  readonly deferredContentAware = signal(this._deferredContentAware);
  // afterRenderEffect: create embedded view when contentVisible(), destroy it when hidden unless preserveContent()
}
```

Applied as host directives:

- Container side, exposing one input: `hostDirectives: [{directive: DeferredContentAware, inputs: ['preserveContent']}]` on `AccordionPanel` (`accordion-panel.ts:45-50`), `TabPanel` (`tab-panel.ts:52-57`), `Menu` (`menu.ts:73-78`). The container injects its own host directive (`inject(DeferredContentAware)`, `accordion-panel.ts:57`) and pushes visibility into it inside `afterRenderEffect({write})`.
- Template side: `hostDirectives: [DeferredContent]` on `ng-template[ngAccordionContent]`, `ng-template[ngTabContent]`, `ng-template[ngMenuContent]`, `ng-template[ngComboboxPopup]`, and `TreeItemGroup`.
- When the template is not a DOM descendant of the container (combobox popup), the popup re-targets manually: `this._deferredContent.deferredContentAware.set(this.combobox())` (`combobox-popup.ts:59`), and `Combobox extends DeferredContentAware` by inheritance instead of hostDirectives (`combobox.ts`).
- Packaging consequence: host directives must be exported, so `public-api.ts` re-exports them under Angular's private-export prefix (two U+0275 "theta" characters, the `DeferredContent as <theta><theta>DeferredContent` form) with a comment pointing at angular/components#30663.

### Material

`MatDialogContent` uses `hostDirectives: [CdkScrollable]` (`src/material/dialog/dialog-content-directives.ts:156`). That is Material's only use; Material predates the API and composes by inheritance (`MatExpansionPanel extends CdkAccordionItem`, `MatAccordion extends CdkAccordion`, `MatTabLabel extends CdkPortal`).

### The wrapping shape the Aria examples demonstrate

`src/components-examples/aria/menu/simple-menu.ts`:

```ts
@Directive({
  selector: '[ng-menu]',
  hostDirectives: [{directive: Menu}],
  host: {class: 'example-menu', popover: 'manual', '(beforetoggle)': 'onBeforeToggle()'},
})
export class SimpleMenu {
  menu = inject(Menu);
  constructor() {
    afterRenderEffect(() => {
      this.menu.visible() ? this.menu.element.showPopover() : this.menu.element.hidePopover();
    });
  }
}

@Directive({
  selector: '[ng-menu-item]',
  hostDirectives: [{directive: MenuItem, inputs: ['value', 'disabled', 'submenu']}],
  host: {class: 'example-menu-item'},
})
export class SimpleMenuItem {
  menuItem = inject<MenuItem<string>>(MenuItem);
  constructor() { effect(() => this.menuItem.searchTerm.set(this.menuItem.value() ?? '')); }
}
```

and `src/components-examples/aria/toolbar/simple-toolbar.ts`: `selector: 'button[toolbar-button]'`, `hostDirectives: [{directive: ToolbarWidget, inputs: ['disabled']}]`, `host: {type: 'button', class: '...'}`. This is the exact shape for a Foundation-classed directive that layers a CSS class contract and native platform behavior (here `popover`) over an Aria behavior directive: the wrapper's `host` class bindings apply after the host directive's, the wrapper picks which Aria inputs to expose (optionally aliased, per the guide's `inputs: ['menuId: id']` form), and it reaches the Aria instance with `inject(Menu)`.

Aria guards against one consequence: `AccordionTrigger` sets `'ngAccordionTrigger': ''` in `host` because "it might not be [there] when the trigger is a host directive" and the group pattern finds the closest trigger by attribute (`accordion-trigger.ts:44-49`). Any Aria directive that does DOM lookups by its own selector needs the same guard when hosted.

### Semantics to keep in mind (composition guide)

`directive-composition-api.md`: host directives are applied statically; their `selector` is ignored; their inputs/outputs are hidden unless listed; they run constructor, hooks, and bindings *before* the hosting class, so the host's bindings win; a directive matched both by selector and as a host directive is de-duplicated to the selector match; the same host directive reached twice (diamond) is merged into one instance.

## 5. Configuration tokens and `provideXxx()` functions

### Shape A: default-options token with a root factory (inject required)

```ts
// src/material/tooltip/tooltip.ts:94-104
export const MAT_TOOLTIP_DEFAULT_OPTIONS = new InjectionToken<MatTooltipDefaultOptions>(
  'mat-tooltip-default-options',
  {providedIn: 'root', factory: () => ({showDelay: 0, hideDelay: 0, touchendHideDelay: 1500})},
);
// src/material/tooltip/tooltip.ts:207
private _defaultOptions = inject<MatTooltipDefaultOptions>(MAT_TOOLTIP_DEFAULT_OPTIONS, {optional: true});
```

Same shape: `MAT_MENU_DEFAULT_OPTIONS` (`menu.ts:77-87`, injected required at `:277`), `MAT_TOOLTIP_SCROLL_STRATEGY` and every `*_SCROLL_STRATEGY` token (factory returns a function that builds a strategy from the injector), `MAT_DRAWER_DEFAULT_AUTOSIZE` (factory `() => false`), `MAT_DATE_LOCALE`, `TREE_KEY_MANAGER`. The factory makes the token tree-shakable and self-providing; consumers override with `{provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: {...}}` at bootstrap, route, or element level and the nearest wins.

### Shape B: bare config token, injected optional, applied in the constructor

```ts
// src/material/expansion/expansion-panel.ts:65-66, 154-163
export const MAT_EXPANSION_PANEL_DEFAULT_OPTIONS =
  new InjectionToken<MatExpansionPanelDefaultOptions>('MAT_EXPANSION_PANEL_DEFAULT_OPTIONS');
constructor() {
  const defaultOptions = inject(MAT_EXPANSION_PANEL_DEFAULT_OPTIONS, {optional: true});
  if (defaultOptions) { this.hideToggle = defaultOptions.hideToggle; }
}
```

Same shape: `MAT_TABS_CONFIG` (`tab-config.ts:48`; read at `tab-group.ts:293`), `MAT_CARD_CONFIG`, `MAT_LIST_CONFIG`, `MAT_BADGE_CONFIG`, `MAT_BUTTON_CONFIG`, `MAT_INPUT_CONFIG`, `YOUTUBE_PLAYER_CONFIG` (`src/youtube-player/youtube-player.ts:37-39`, read in the constructor with `?? true` fallbacks). Defaults seed the initial input values; per-instance inputs override afterwards.

Naming: `MAT_<X>_DEFAULT_OPTIONS` with interface `Mat<X>DefaultOptions` (Shape A, all-required fields) or `MAT_<X>_CONFIG` with `Mat<X>Config` (Shape B, all-optional fields). The interface is exported next to the token.

### Cross-cutting config through a token plus helper function

`src/material/core/animation/animation.ts`: `MATERIAL_ANIMATIONS = new InjectionToken<AnimationsConfig>` and `_animationsDisabled()` which, in an injection context, reads `MATERIAL_ANIMATIONS`, `ANIMATION_MODULE_TYPE`, and `MediaMatcher('(prefers-reduced-motion)')`. Components call `private readonly _animationsDisabled = _animationsDisabled();` as a field initializer (`expansion-panel.ts:99`). A library-wide switch with a one-line consumer.

### `provideXxx()` functions

The only ones in the components repo: `provideNativeDateAdapter(formats = MAT_NATIVE_DATE_FORMATS): Provider[]` returning `[{provide: DateAdapter, useClass: NativeDateAdapter}, {provide: MAT_DATE_FORMATS, useValue: formats}]` (`src/material/core/datetime/index.ts:30-38`) and the moment/luxon/date-fns equivalents. Neither CDK nor Aria exports a `provide*` function; `cdk/testing/private/fake-directionality.ts` has a test helper. The Angular guide (DDP, "Library author patterns") recommends `provideX(config, ...withFeatures)` for anything that needs several providers or has side effects; Material only reaches for it when swapping a class-based `DateAdapter`. A single options token does not need a `provide*` wrapper.

## 6. Google product wrappers (youtube-player, google-maps)

### youtube-player (`src/youtube-player/youtube-player.ts`)

- Still decorator-based (`@Input`, `@Output`, `@ViewChild`), not signals. Inputs use `numberAttribute`/`booleanAttribute` transforms and a local `coerceTime` transform.
- SSR: `_isBrowser = isPlatformBrowser(inject(PLATFORM_ID))` in the constructor; `_load()` returns early when not in a browser; `_shouldShowPlaceholder()` returns `true` permanently on the server so a static placeholder renders. The placeholder is a real child component (`YouTubePlayerPlaceholder`) toggled with `@if`.
- Lazy script loading: module-level `let apiLoaded = false` plus `loadApi(nonce)` that appends a `<script>` once, sets `apiLoaded = true` immediately to prevent double loads, flips it back on `error`; uses `CSP_NONCE` (`inject(CSP_NONCE, {optional: true})`) and `safevalues` `trustedResourceUrl`. The global `onYouTubeIframeAPIReady` callback is chained with any pre-existing one and restored in `ngOnDestroy`.
- Zone: the player is constructed in `runOutsideAngular` (it starts a 250ms interval); callbacks re-enter with `_ngZone.run` and call `markForCheck`.
- Events: `_getLazyEmitter(name)` returns an `Observable` built from a `BehaviorSubject<YT.Player | undefined>` (`_playerChanges`) piped through `switchMap` to `fromEventPattern(add, remove)`; the underlying listener is attached only while someone is subscribed and moves to a new player when the player is recreated; `takeUntil(_destroyed)`. The outputs are typed `Observable<T>` fields with `@Output()`. The `ready` output stays an `EventEmitter` because it fires before `_playerChanges` emits.
- Calls before ready: `PendingPlayerState` queues `playVideo/pauseVideo/seekTo/mute/setVolume/setPlaybackRate` and `_applyPendingPlayerState` replays them on `onReady`; getters return safe defaults (`0`, `[]`, `''`).
- `ngOnChanges` distinguishes changes that require recreating the player (`videoId`, `playerVars`, `disableCookies`, `disablePlaceholder`) from ones applied through the API (`width/height`, `suggestedQuality`, `startSeconds/endSeconds`).
- Config: `YOUTUBE_PLAYER_CONFIG` optional token seeds `loadApi`, `disablePlaceholder`, `placeholderButtonLabel`, `placeholderImageQuality`.

### google-maps (`src/google-maps/**`)

- `MapEventManager` (`map-event-manager.ts`) is a plain class, constructed as `new MapEventManager(inject(NgZone))` in each directive. `getLazyEmitter<T>(name, type?: 'custom' | 'native')` pipes a `BehaviorSubject` of the target through `switchMap`; a subscription made before `setTarget()` is parked in `_pending` and replayed when the target arrives; listeners are removed on unsubscribe and on `destroy()`; every emission is wrapped in `_ngZone.run`. `type: 'native'` uses `addEventListener/removeEventListener` for DOM-like targets (advanced markers) and dev-mode-throws if they are missing.
- `GoogleMap` (`google-map/google-map.ts`) is a component with template `<div class="map-container"></div><ng-content />`; child directives (`<map-marker>`, `<map-info-window>`, ...) are content-projected and `inject(GoogleMap)` directly (`map-marker.ts:41`). Init is in `ngOnInit` guarded by `_isBrowser`; if `google.maps.Map` is not yet loaded it awaits `google.maps.importLibrary('maps')` outside the zone. Children await `Promise.all([this._googleMap._resolveMap(), google.maps.importLibrary('marker')])` (`map-marker.ts:303-312`) where `_resolveMap()` resolves immediately or on the `mapInitialized` emitter.
- Inputs are setter-backed `@Input`s copied into private fields; `ngOnChanges` maps each changed input to the corresponding API setter; `_combineOptions()` merges a bulk `options` input with individual inputs, individual winning (`google-map.ts:487-500`, `map-marker.ts:473-486`).
- Public methods mirror the wrapped API one-to-one (`fitBounds`, `panTo`, `getZoom`, `getPosition`...) and each starts with `_assertInitialized()`, a dev-mode throw with a message telling the consumer to wait for init (`google-map.ts:504-511`). Also exposes the raw object (`googleMap?: google.maps.Map`, `marker?: google.maps.Marker`) for escape hatches.
- Tokens: `MAP_MARKER = new InjectionToken<MarkerDirective>('MAP_MARKER')` with the `MarkerDirective` interface (`marker-utilities.ts`) lets the clusterer collect marker directives without depending on either marker class (lightweight-token pattern); `MapAnchorPoint` interface (`map-anchor-point.ts`) lets `MapInfoWindow.open(anchor)` accept any directive exposing `getAnchor()`.
- Globals are restored on destroy (`gm_authFailure`, `google-map.ts:335-340`).

### What transfers to wrapping Foundation markup

Foundation's plugins are CSS-class state machines, not remote script APIs, so the script-loading and pending-state parts do not transfer. What does:

1. Platform guard: `isPlatformBrowser(inject(PLATFORM_ID))` (youtube, maps) or `!inject(Platform).isBrowser` (`src/material/tabs/tab-group.ts:290`) before touching `window`, `document`, `matchMedia`, `ResizeObserver`, `IntersectionObserver`, `history`. Render a static, correct DOM state on the server (the placeholder approach).
2. Parent component with content-projected child directives that inject the parent class directly (`inject(GoogleMap)`) when the child cannot exist without the parent. Use a token instead when the child is optional or must not retain the parent (section 1).
3. Lazy subscription: attach a native listener only while an output has subscribers. Both wrappers rely on `Observable`-typed `@Output()` fields for this. Signal `output()` has no subscriber hook, so a spec that wants this must either keep `outputFromObservable` from `@angular/core/rxjs-interop` for that output or accept always-on listeners (cheap for DOM events; the Aria directives simply bind in `host`).
4. `_assertInitialized()`-style dev-mode guards using `typeof ngDevMode === 'undefined' || ngDevMode`, and Aria's `reportViolations(violations, element)` in `afterRenderEffect({read})` for structural misuse (`accordion-panel.ts:83-98`).
5. Restore any global you patched (hash, `history` state, body classes) in `ngOnDestroy`.
6. Bulk `options`-object input merged with individual inputs, individual winning: the shape Foundation's `data-*` option bags map to if a spec wants an `options` input alongside camelCase inputs.
7. `runOutsideAngular` is for zoned apps; the target is zoneless, so it becomes a no-op but is harmless. The `_ngZone.run` wrappers are unnecessary in zoneless.

## 7. This repo's own patterns (reported, not adopted)

### The rule in `AGENTS.md`

`AGENTS.md`, "Content Projection and DI": export the token so consumers can provide alternatives; child uses optional injection with `skipSelf`; standalone child usage allowed. Example: `export const nfsAccordionToken = new InjectionToken<NfsAccordion>('nfsAccordionToken')`; parent `providers: [{provide: nfsAccordionToken, useExisting: NfsAccordion}]`; child `readonly accordion = inject(nfsAccordionToken, {optional: true, skipSelf: true})`. Stated reason: "Angular's DI for content-projected elements follows the declaration site injector, not the DOM tree." Token naming rule (Design Philosophy item 6): camelCase with `Token` suffix. This is the CDK accordion shape from section 2, with the guide's `Token` suffix naming from section 1.

### What the accordion code actually does

`packages/ngx-foundation-sites/src/lib/accordion/` contains no `InjectionToken` at all. The pattern is the guide's "explicit injector for projected templates" (HDI 748-782), not the AGENTS.md token pattern:

- `NfsAccordion` (`accordion.ts`) is a component, selector `nfs-accordion`, `encapsulation: None`, OnPush. It queries `readonly itemDefs = contentChildren(NfsAccordionItemDef)` where `NfsAccordionItemDef` is `ng-template[nfsAccordionItem]` (`accordion-item-def.ts`) carrying `panelId = input.required<string>()`, `expanded = model(false)`, `disabled = input(false)`, `templateRef = inject(TemplateRef)`, and two registration signals `headerDef`/`lazyContentDef`.
- Per item it builds `Injector.create({providers: [{provide: NfsAccordionItemDef, useValue: item}], parent: this.#injector})`, caches it in a `WeakMap`, and renders `<ng-container [ngTemplateOutlet]="item.templateRef" [ngTemplateOutletInjector]="getItemInjector(item)" />` (`accordion.html`). The class `NfsAccordionItemDef` is the DI token (class-as-token with `useValue`).
- `NfsAccordionHeaderDef` and `NfsAccordionContentDef` (`ng-template[nfsAccordionHeader]`, `ng-template[nfsAccordionContent]`) register by injection in their constructor: `inject(NfsAccordionItemDef, {optional: true})?.headerDef.set(this)`.
- Because the header is needed before first render, `ngAfterContentInit` instantiates every item template into a throwaway embedded view (`createEmbeddedView(item.templateRef, null, {injector})`, `detectChanges()`, `destroy()`) to force registration, then sets `initialized` so the template's `@if (initialized())` gate opens.
- The component owns all Foundation markup and wraps Aria inside its own view: `<ul ngAccordionGroup class="accordion">`, `<li class="accordion-item" [class.is-active]="item.expanded()">`, `<button ngAccordionTrigger class="accordion-title" [(expanded)]="item.expanded">`, `<div ngAccordionPanel class="accordion-content">`; `protected readonly accordionGroup = viewChild(AccordionGroup)` backs `expandAll()`/`collapseAll()`. Lazy content renders with `@defer (when item.expanded())`.
- The template binds `[panelId]` on `ngAccordionTrigger` and `ngAccordionPanel`; in Aria 22.2 those inputs are `panel = input.required<AccordionPanel>()` and `id = input(...)` (section 3d), so this markup targets the Angular 21 Aria API. Version drift to note, not a design fact.
- Services: `AccordionDeepLinkService` is `@Injectable({providedIn: 'root'})`, injects `DOCUMENT`, calls the `history` global directly (no platform guard). `NfsStyleLoader` (`core/nfs-style-loader.service.ts`) is `@Injectable({providedIn: 'platform'})`, reference-counts `<link>` elements per stylesheet id, and components pair `afterNextRender(() => load(...))` with `DestroyRef.onDestroy(() => unload(...))`. This is a runtime analogue of Material's `_CdkPrivateStyleLoader.load(_StructuralStylesLoader)` (`src/cdk/private/style-loader.ts:37-46`, used at `expansion-panel-header.ts:63`), which loads a styles-only component once per app instead of a `<link>`.

Net: the repo documents pattern (a) from section 3 but implements the explicit-injector pattern from section 2, with class-as-token `useValue` providers and constructor-time self-registration. Member visibility follows AGENTS.md (`#` fields, `protected` for template/query access).

## 8. Public API surfaces (Material-equivalent shape)

### Methods

Imperative verbs, unprefixed, on the directive the consumer holds a reference to (via `exportAs` or a query):

- `open()`, `close()`, `toggle()`: `CdkAccordionItem` (`accordion-item.ts:158-178`, each checks `disabled`), `MatExpansionPanel` (`expansion-panel.ts:175-188`), `MatDrawer` (`drawer.ts:536-559`, `toggle(isOpen = !this.opened, openedVia?: FocusOrigin): Promise<MatDrawerToggleResult>` resolving `'open' | 'close'`), `MatDrawerContainer.open()/close()` fan out to children, Aria `MenuTrigger.open()/close()`, `MenuItem.open()/close()`, `Menu.close()`.
- `expand()`, `collapse()`, `toggle()` on Aria `AccordionTrigger` and `AccordionPanel`; `expandAll()`, `collapseAll()` on `AccordionGroup`; `openAll()`, `closeAll()` on `CdkAccordion`/`MatAccordion` (`openAll` is a no-op unless `multi`).
- Prefixed only when the directive sits on a foreign element and the verb would be ambiguous: `MatMenuTrigger.openMenu()/closeMenu()/toggleMenu()` (`menu-trigger.ts`).
- Tabs: Aria `TabList.open(value: string): boolean`, `Tab.open()`; Material `MatTabGroup.focusTab(index)`, `realignInkBar()`.
- Focus helpers as public methods: `MatMenu.focusFirstItem(origin)`, `resetActiveItem()`.

### State exposure

- Aria: everything is a signal. `expanded = model<boolean>(false)` (`accordion-trigger.ts:85`), derived read-only `active = computed(...)`, `visible = computed(...)`, `selected = computed(...)`, `hasPopup`, `tabIndex`. Consumers read `trigger.expanded()`.
- Material: getters and inputs (`menuOpen` getter on the trigger, `opened` input on `MatDrawer`, `expanded` getter/setter on `CdkAccordionItem`).
- Every directive declares `exportAs` (`ngAccordionGroup`, `ngTabList`, `matAccordion`, `matDrawer`, `matMenuTrigger`) so `#ref="ngTabList"` gives templates the instance.

### Outputs and naming

- Past-tense event nouns: `opened`, `closed` (`CdkAccordionItem`; `MatTimepicker.opened = output()` and `closed = output()` at `timepicker.ts:181-184`), `afterExpand`, `afterCollapse` (post-animation, `expansion-panel.ts:120-124`), `menuOpened`, `menuClosed` (trigger, `menu-trigger.ts:79-100`), `selectedTabChange`, `focusChange`, `animationDone` (`tab-group.ts:274-285`), `itemSelected = output<V | undefined>()` (`aria/menu/menu.ts:151`), `selected = output<MatTimepickerSelected<D>>()`.
- Two-way companions end in `Change`: `expandedChange` (`accordion-item.ts:53`, marked `@docs-private`), `openedChange` (`drawer.ts:311`), `selectedIndexChange` (`tab-group.ts:274`). With `model()` the `xChange` output is generated.
- Animation-phase streams as `Observable` fields: `openedStart`, `closedStart` (`drawer.ts:324-338`).
- Close reasons as a typed payload: `closed: EventEmitter<MenuCloseReason>` where `MenuCloseReason = void | 'click' | 'keydown' | 'tab'` (`menu.ts:52, 265`).
- Deprecations show the direction: `close` -> `closed`, `onMenuOpen` -> `menuOpened` (`menu.ts:268-272`, `menu-trigger.ts:83-100`). No `on` prefix, no bare verbs.
- Aria wraps outputs into its pattern with an arrow: `itemSelected: (value) => this.itemSelected.emit(value)` (`menu.ts:172`).

### Inputs and two-way state

- Aria is 100 percent signal inputs (100 `input(`/`input.required(`, zero `@Input`); Material has 32 `input(`/`input<`/`input.required` sites and 1 `model()` site against 492 `@Input` (only `button-base.ts`, `slider*.ts`, `stepper.ts` and `timepicker/*` migrated), and 3 `output(`/`output<` sites against 91 `@Output`. Counted with `rg -o --glob '!*.spec.ts' --glob '!**/testing/**' -e 'input\(' -e 'input<' -e 'input\.required' src/material | wc -l` (32; same command with `model\(`/`model<` gives 1, with `output\(`/`output<` gives 3, with `@Input\(` gives 492), run from the components clone root. Aria is therefore the reference for signal-era API shape; Material is the reference for naming and method vocabulary.
- `model()` for two-way state: Aria `AccordionTrigger.expanded`, `TabList.selectedTab = model<string | undefined>()`, `Listbox.value = model<V[]>([])`, `MenuBar.value`, `Tree.value`, `TreeItem.expanded`, `GridCell.selected`, `Combobox.expanded` and `value`, `MenuItem.searchTerm`, `DeferredContentAware.preserveContent`; Material `MatTimepickerInput.value = model<D | null>(null)`.
- `linkedSignal` bridges a `model` to internal state that can diverge: `TabList._selectedTabPattern = linkedSignal(() => this.findTab(this.selectedTab())?._pattern)` with an `afterRenderEffect({write})` syncing back to `selectedTab` (`tab-list.ts:111-118, 145-152`).
- Boolean inputs always take `{transform: booleanAttribute}`; link inputs are `input.required<T>()`; ids default from the CDK generator: `id = input(inject(_IdGenerator).getId('ng-tab-', true))` (`tab.ts:62`); `tabindex` is `input(undefined, {alias: 'tabindex', transform: tabIndexTransform})` (`listbox.ts:125-128`).
- Cross-directive internals are `_underscored` public fields (`_pattern`, `_collection`, `_register`), private-to-file members use TypeScript `private readonly`, and cross-package internals use Angular's double-theta (U+0275 U+0275) private-export prefix.
- Selector conventions: Aria attribute selectors `[ngTabs]`, `ng-template[ngTabContent]`; Material `mat-tab-group`, `[matMenuTriggerFor]`; Aria class names are unprefixed (`Tabs`, `Menu`), Material's carry `Mat`.

## 9. Pattern catalogue

| Pattern | When to use | Example path |
| --- | --- | --- |
| `InjectionToken<Parent>` in a `*-tokens.ts` file with `import type`, parent `providers: [{provide: TOKEN, useExisting: Parent}]` | Every parent that children reach by DI; avoids retaining the parent class and circular imports | `src/aria/accordion/accordion-tokens.ts`, `accordion-group.ts:69`; `src/cdk/accordion/accordion.ts:22-35` |
| Abstract class as token with `useExisting` | Token that consumers implement (contract, not just handle) | `src/material/form-field/form-field-control.ts:16`; guide `di/lightweight-injection-tokens.md` |
| Child `inject(TOKEN)` required, or `{optional: true}` with a dev-mode violation report | Required parent (Aria triggers, tabs, options) vs standalone-capable child (Aria `MenuItem`, Material `MatTab`) | `src/aria/accordion/accordion-trigger.ts:66`; `src/aria/menu/menu-item.ts:77, 96-105` |
| `inject(TOKEN, {optional: true, skipSelf: true})` plus `providers: [{provide: TOKEN, useValue: undefined}]` on the child | Parent of the same kind, and nested instances must not register with a grandparent | `src/cdk/accordion/accordion-item.ts:25-33`; `src/material/expansion/expansion-panel.ts:74-80, 139` |
| `useFactory: () => inject(TOKEN, {optional: true, skipSelf: true}) \|\| new X()` | Share an ancestor's service or create a fresh one at this level | `src/cdk/menu/menu-stack.ts:31-34` |
| `inject(Sibling, {optional: true, self: true})` | Another directive on the same element (trigger on an item, `NgControl`, Signal Forms `FORM_FIELD`) | `src/cdk/menu/menu-item.ts:70`; `src/material/input/input.ts:102, 303` |
| `inject(Parent, {host: true})` | Child is projected into the parent and must fail outside it | `src/material/expansion/expansion-panel-header.ts:60` |
| `inject(new HostAttributeToken('tabindex'), {optional: true})` | Read a static host attribute once, in the constructor | `expansion-panel-header.ts:66`; `src/material/radio/radio.ts:600` |
| Parent-owned `SortedCollection` with `register/unregister` in `ngOnInit/ngOnDestroy` and `MutationObserver` ordering | Ordered item list that survives `@for`, `@defer`, deferred content, projection, and nesting | `src/aria/private/utils/collection.ts`; `src/aria/tabs/tabs.ts:95-101` |
| `contentChildren(Child, {descendants: true})` filtered by `child.closestParent === this` | Ordered list where a query is acceptable and nesting must be excluded | `src/material/tabs/tab-group.ts:118, 422-425`; `src/material/expansion/accordion.ts:49-52, 76-83` |
| `contentChild(X)` for validation only | Warn in dev mode when required content is missing | `src/aria/accordion/accordion-panel.ts:59, 86-90` |
| `input.required<Target>()` template-reference link, target exposes `exportAs` | Trigger and target are not nested (accordion trigger/panel, menu trigger/menu, combobox/popup) | `src/aria/accordion/accordion-trigger.ts:69`; `src/aria/menu/menu-trigger.ts:66` |
| Value-keyed pairing through computed maps on the common ancestor | Many-to-many pairing by string key (tab/tabpanel) | `src/aria/tabs/tabs.ts:71-92` |
| Reverse link via `parent = signal<...>()` set from an `effect` on the referrer | Target needs to know who opened it | `src/aria/menu/menu.ts:88`; `menu-trigger.ts:93` |
| `hostDirectives: [{directive: AriaDirective, inputs: [...]}]` on a selector-bearing wrapper that adds `host` class and native behavior and `inject(AriaDirective)` | Foundation-classed directive over an Aria behavior; wrapper's host bindings win; expose only chosen inputs | `src/components-examples/aria/menu/simple-menu.ts`; `simple-toolbar.ts`; guide `directives/directive-composition-api.md` |
| Selector-less `@Directive()` pair `XAware` (state) and `X` (`TemplateRef` renderer) applied as host directives | Lazy content on `ng-template` driven by a container's visibility | `src/aria/private/deferred-content/deferred-content.ts`; `accordion-panel.ts:45-50`; `accordion-content.ts` |
| Host attribute self-stamp `'ngX': ''` | Directive that finds itself in the DOM by selector and may be applied as a host directive | `src/aria/accordion/accordion-trigger.ts:44-49` |
| `<ng-template>` content rendered with `[ngTemplateOutlet]` and `[ngTemplateOutletInjector]` | Projected content must see the component's own view-level providers or instance | guide `di/hierarchical-dependency-injection.md:748-782`; `packages/ngx-foundation-sites/src/lib/accordion/accordion.html` |
| `X_DEFAULT_OPTIONS = new InjectionToken(desc, {providedIn: 'root', factory})` injected required | Global defaults that always have a value; override with `useValue` anywhere in the tree | `src/material/tooltip/tooltip.ts:94-104`; `src/material/menu/menu.ts:77-87` |
| `X_CONFIG = new InjectionToken(desc)` injected `{optional: true}`, applied in constructor | Global defaults that are all optional | `src/material/tabs/tab-config.ts:48`; `src/youtube-player/youtube-player.ts:37-39` |
| Injection-context helper `_xDisabled()` reading a token plus platform state | Library-wide switch consumed as a field initializer | `src/material/core/animation/animation.ts` |
| `provideX(config): Provider[]` | Several providers or a class swap must be configured together | `src/material/core/datetime/index.ts:30-38`; guide `di/defining-dependency-providers.md` (library author patterns) |
| `isPlatformBrowser(inject(PLATFORM_ID))` / `inject(Platform).isBrowser` guard with a static server state | Anything touching `window`, `document`, observers, `history`, `matchMedia` | `src/youtube-player/youtube-player.ts` (`_isBrowser`, `_shouldShowPlaceholder`); `src/material/tabs/tab-group.ts:290` |
| Lazy event emitter (`BehaviorSubject` target + `switchMap` + `fromEventPattern`) | Attach expensive listeners only while an output is subscribed; needs an `Observable` output | `src/youtube-player/youtube-player.ts` (`_getLazyEmitter`); `src/google-maps/map-event-manager.ts` |
| Dev-mode structural validation: `reportViolations` in `afterRenderEffect({read})`, `_assertInitialized()` throws | Tell consumers about wrong markup or too-early calls without shipping checks to prod | `src/aria/accordion/accordion-panel.ts:83-98`; `src/google-maps/google-map/google-map.ts:504-511` |
| `model()` for two-way state, `linkedSignal` for derived-but-writable, `computed` for read-only derived, `output()` past-tense | Signal-era API shape (Aria) | `src/aria/tabs/tab-list.ts:109-118`; `src/aria/accordion/accordion-trigger.ts:85` |
| `open()/close()/toggle()`, `expandAll()/collapseAll()`, `xChange` companions, `afterX` post-animation outputs | Material-equivalent method and output vocabulary | `src/cdk/accordion/accordion-item.ts:158-178`; `src/material/sidenav/drawer.ts:311-338, 536-559` |
| `id = input(inject(_IdGenerator).getId('prefix-', true))` | Stable, overridable ids for ARIA relationships | `src/aria/tabs/tab.ts:62`; `src/cdk/a11y/id-generator.ts:22-31` |

Correction (2026-09-26, from the [Re-run: Orbit spec, the slide's ARIA contract and the focus handoff](../issues/70-rerun-orbit-slide-contract-and-focus-handoff.md)): the `hostDirectives` row's "wrapper's host bindings win" holds only when each binding writes only on its own value change. The wrapper's host binding on an attribute the Aria directive also binds is applied after Aria's in each pass, but each binding writes only when its own value changes, so the override holds only when Aria's value never changes after the wrapper's last write (Orbit's bullet `aria-controls`, absent without a panel) or equals the wrapper's whenever it changes (the Tabs and Orbit bullet `tabindex` before and after Aria's first active item). An override that must differ from an Aria value that can still change is not a binding: the element does without that Aria directive ([adr/0034-orbit-slide-contract.md](../adr/0034-orbit-slide-contract.md)), which is why `NfsOrbitSlide` leaves out Aria's `TabPanel`.
