# @angular/aria 22.2 inventory

Ticket: ../issues/07-angular-aria-inventory.md
Date: 2026-09-25
Sources: local clone `d:/projects/github/angular/components` (branch 22.2.x, HEAD 708d4c6e2
"build: lock file maintenance", CHANGELOG top entry 22.2.0 dated 2026-09-23) and the guides
under `d:/projects/github/angular/angular/adev/src/content/guide/aria/*.md`. Paths below are
relative to those two roots unless written in full. npm registry checked for dist-tags only.

## 1. Package shape and stability

### 1.1 Entry points

`src/aria/config.bzl` lists the secondary entry points: `accordion`, `combobox`, `grid`,
`listbox`, `menu`, `tabs`, `toolbar`, `tree`, each with a `<name>/testing` sibling, plus
`private`. The root entry point `@angular/aria` exports only `VERSION`
(`goldens/aria/index.api.md`, `src/aria/public-api.ts`). Everything usable lives under
`@angular/aria/<pattern>`.

`@angular/aria/private` (`src/aria/private/public-api.ts`) re-exports the UI pattern classes
(`ListboxPattern`, `MenuPattern`, `TabListPattern`, `AccordionGroupPattern`, `TreePattern`,
`GridPattern`, `ComboboxPattern`, `ToolbarPattern`, ...), the behaviors (`List`, `ListFocus`,
`ListNavigation`, `ListSelection`, `ListTypeahead`, `ListExpansion`, event managers), and the
utilities `DeferredContent`, `DeferredContentAware`, `SortedCollection`, `reportViolations`,
`tabIndexTransform`. The public entry points re-export `DeferredContent` and
`DeferredContentAware` under Angular's private prefix (two U+0275 characters before the
class name) because `hostDirectives` need them at compile time (`src/aria/accordion/public-api.ts:15-20`, referencing angular/components#30663).
The private entry point is importable but carries no API guarantee beyond its name.

### 1.2 Dependencies

`src/aria/package.json`: peer deps `@angular/cdk` and `@angular/core`; runtime dep `tslib`;
`sideEffects: false`. The directives import from `@angular/cdk/a11y` (`_IdGenerator`),
`@angular/cdk/bidi` (`Directionality.valueSignal`), `@angular/cdk/platform`
(`_getEventTarget`), and `@angular/cdk/testing` (harnesses). No overlay, portal, or
animation dependency: positioning of popups is left to the consumer (see 7.4).

Published: `registry.npmjs.org/@angular/aria` dist-tags on 2026-09-25: `latest` 22.2.0
(published 2026-09-23), `next` 22.2.0-rc.0, `v21-lts` 21.2.14. Peer range of 22.2.0:
`@angular/cdk` 22.2.0 exact, `@angular/core` `^22.0.0 || ^23.0.0`. First published
prerelease was 21.0.0-next.8.

### 1.3 Stability labels

- No `@developerPreview` or `@experimental` JSDoc tag remains anywhere under `src/aria`
  outside spec files (`rg -n -i 'developer preview|experimental|@developerPreview' src/aria`
  returns only an unrelated `selectionStabled` signal in the grid behavior).
- `CHANGELOG.md` 22.0.0 (2026-06-03), section "multiple": "remove developer preview tag from
  aria (#33232)". So every entry point is stable as of 22.0.0.
- `CHANGELOG.md` 22.0.0 Breaking Changes, section "aria": the legacy combobox and autocomplete
  were removed and `SimpleCombobox` was promoted to `Combobox`; all `simple-combobox` selectors
  and tokens renamed to `combobox` (`SIMPLE_COMBOBOX_POPUP` -> `COMBOBOX_POPUP`).
- `CHANGELOG.md` 22.0.0 "aria": test harnesses were added for accordion (#33046), combobox
  (#33194), grid (#33081), listbox (#33064), menu (#33067), tabs (#33079), toolbar (#33068),
  tree (#33066). Also "rename values to value for signal forms compatibility (#33012)".
- `CHANGELOG.md` 22.2.0 "aria": "export aria injection tokens to support custom subclasses
  (#33607)". The tokens are listed per pattern below.
- `CHANGELOG.md` 22.1.x: "avoid instanceof checks in aria directives (#33587)", "account for
  shadow dom in aria directives (#33691)", "combobox: empty aria-controls when the popup widget
  has no id (#33635)".
- `@angular/material` 22.2.x does not import `@angular/aria` anywhere
  (`rg -l "@angular/aria" src/material` is empty). `src/aria/BUILD.bazel:40` grants
  visibility to `material-experimental`, but nothing there imports it either.

### 1.4 Shared design of every directive

Read from the sources listed per pattern; the same shape repeats:

- Attribute selectors with the `ng` prefix and an `exportAs` of the same name
  (`[ngAccordionGroup]` / `exportAs: 'ngAccordionGroup'`). Structural content directives use
  `ng-template[ngXContent]`.
- Nothing renders markup. Every directive decorates a consumer-supplied element via `host`
  bindings; consumers own structure and CSS.
- State is signal-based: `input()`, `model()`, `computed()`, and each directive instantiates a
  UI pattern class from `@angular/aria/private` (`_pattern`) that holds the keyboard, focus,
  selection, and expansion logic. Directive host listeners forward `keydown`, `click`,
  `focusin`, `focusout`, `mouseover` to the pattern.
- Child registration uses `SortedCollection` (`src/aria/private/utils/collection.ts:149`):
  children call `register()` in `ngOnInit`, the parent starts a `MutationObserver`
  (`childList`, `subtree`) in `afterNextRender` to keep DOM order. Consequence: children may
  be projected from anywhere in the DOM subtree, `@for` and `@if` work, but ordering is
  DOM-order and updates after a microtask.
- Ids default to `_IdGenerator.getId('ng-<thing>-', true)` and are overridable via an `id`
  input.
- `softDisabled` (default `true`) on every container: disabled items stay focusable with
  `aria-disabled`; `false` skips them in navigation and, where the element supports it, sets
  the native `disabled` attribute.
- `textDirection` comes from `Directionality.valueSignal`; horizontal arrow keys flip in RTL.
- Dev-mode validation: `afterRenderEffect` calls `reportViolations()` which `console.warn`s
  structural mistakes (`src/aria/private/utils/violations.ts:123`).
- `<button>` hosts get `type="button"` added when no `type` is present (accordion trigger,
  tab, menu trigger; CHANGELOG 22.0.0 "prevent form submissions in aria directives (#33297)").
- Keyboard handling uses `KeyboardEventManager` with defaults `ignoreRepeat: true`,
  `preventDefault: true`, `stopPropagation: true`
  (`src/aria/private/behaviors/event-manager/keyboard-event-manager.ts:33-35`). Arrow-key
  handlers opt into `ignoreRepeat: false`. Every handled key is therefore prevented and
  stopped at the container.
- `data-active="true|false"` is set on the active (focused) item of every list-like pattern,
  which is the styling hook for focus-visible-like states.
- Host-directive use is supported: `AccordionTrigger` and `ToolbarWidget` set their own
  selector attribute in `host` so the pattern can find them when composed as a
  `hostDirectives` entry (`src/aria/accordion/accordion-trigger.ts:56-59`,
  `src/aria/toolbar/toolbar-widget.ts:49-50`). Menu, tabs, listbox, combobox, tree, grid do
  not need this because they resolve children by registration or by `role` selectors.

### 1.5 Deferred content

`src/aria/private/deferred-content/deferred-content.ts`: `DeferredContentAware` (host
directive on panel-like directives) exposes `contentVisible = signal(false)` and
`preserveContent = model(false)`. `DeferredContent` (host directive on the
`ng-template[ngXContent]` directives) creates the embedded view when `contentVisible()` turns
true and destroys it when it turns false unless `preserveContent()` is true (lines 56-70).
Spec `deferred-content.spec.ts:23-27` confirms "removes the content when hidden" by default.

Surprise: the accordion and tabs guides say the opposite ("By default, content remains in the
DOM after the panel collapses. Set `[preserveContent]="false"` to remove",
`guide/aria/accordion.md` Lazy content rendering, `guide/aria/tabs.md` Lazy content
rendering). The source and its spec win: the default is destroy-on-collapse; pass
`[preserveContent]="true"` to keep content. The adev tabs example does exactly that
(`adev/src/content/examples/aria/tabs/src/explicit-selection/app/app.html`).

## 2. Accordion (`@angular/aria/accordion`)

Files: `src/aria/accordion/accordion-group.ts`, `accordion-trigger.ts`, `accordion-panel.ts`,
`accordion-content.ts`, `accordion-tokens.ts`. Guide: `guide/aria/accordion.md`. APG:
Accordion. Stability: stable (1.3).

### 2.1 Directives

`AccordionGroup`, selector `[ngAccordionGroup]`, exportAs `ngAccordionGroup`, provides
`ACCORDION_GROUP` token (`accordion-tokens.ts:13`).

| Member | Kind | Type / default | Source |
| --- | --- | --- | --- |
| `disabled` | input | boolean, `false`, `booleanAttribute` | accordion-group.ts:90 |
| `multiExpandable` | input | boolean, `true` | :93 |
| `softDisabled` | input | boolean, `true` | :99 |
| `wrap` | input | boolean, `false` | :102 |
| `expandAll()`, `collapseAll()` | methods | `expandAll` only acts when `multiExpandable` | :133-140 |
| `element`, `textDirection` | public fields | | :76, :87 |

Host: `(keydown)`, `(click)`, `(focusin)` forwarded to `AccordionGroupPattern`. No role or
ARIA attribute is set on the group element. Orientation is fixed `'vertical'`
(accordion-group.ts:110).

`AccordionTrigger`, selector `[ngAccordionTrigger]`, exportAs `ngAccordionTrigger`. Injects
`ACCORDION_GROUP` (required; must sit inside an `ngAccordionGroup`).

| Member | Kind | Type / default | Source |
| --- | --- | --- | --- |
| `panel` | input, required | `AccordionPanel` (template ref) | accordion-trigger.ts:73 |
| `id` | input | string, generated `ng-accordion-trigger-N` | :76 |
| `disabled` | input | boolean, `false` | :82 |
| `expanded` | model | boolean, `false` | :85 |
| `active` | computed | boolean | :88 |
| `panelId` | computed | string | :79 |
| `expand()`, `collapse()`, `toggle()` | methods | | :141-154 |

Host attributes: `role="button"`, `[id]`, `aria-expanded`, `aria-controls` (panel id),
`aria-disabled`, `disabled` (only when hard-disabled: `disabled && !group.softDisabled`),
`tabindex` (0 when focusable, else -1; roving), `data-active`
(accordion-trigger.ts:46-60; `AccordionTriggerPattern` in
`src/aria/private/accordion/accordion.ts:196-208`).

`AccordionPanel`, selector `[ngAccordionPanel]`, exportAs `ngAccordionPanel`, hostDirectives
`DeferredContentAware` with `preserveContent` input forwarded.

| Member | Kind | Type / default | Source |
| --- | --- | --- | --- |
| `id` | input | string, generated `ng-accordion-panel-N` | accordion-panel.ts:71 |
| `preserveContent` | model (via host directive) | boolean, `false` | :45-50 |
| `visible` | computed | boolean (trigger expanded) | :74 |
| `expand()`, `collapse()`, `toggle()` | methods | delegate to trigger pattern | :110-123 |

Host attributes: `role="region"`, `[attr.id]`, `aria-labelledby` (trigger id), `inert` when
not visible (accordion-panel.ts:51-56). Visual hiding is the consumer's job; `inert` only
removes it from the accessibility tree and tab order.

`AccordionContent`, selector `ng-template[ngAccordionContent]`, hostDirectives
`DeferredContent`. Required inside the panel (dev-mode violation "ngAccordionPanel must have
an ngAccordionContent to render", accordion-panel.ts:97-99).

### 2.2 Keyboard (`src/aria/private/accordion/accordion.ts:57-92`)

| Key | Action |
| --- | --- |
| ArrowDown / ArrowUp | next / previous trigger (vertical only; repeat allowed) |
| Home / End | first / last trigger |
| Space, Enter | toggle the active trigger |
| Click on a trigger | goto + toggle |
| focusin | makes the focused trigger active |

No Escape handling. Single-expand mode is enforced by `ListExpansion.open()` closing all
others (`src/aria/private/behaviors/expansion/expansion.ts:582-590`). Every panel may be
closed at once; there is no "keep one open" option.

### 2.3 Markup rules and validation

- Trigger and panel are siblings linked by `[panel]="panelRef"`; the trigger must not be
  inside its panel (violation, accordion-trigger.ts:105-109), and a panel may have one trigger
  (:110-114).
- Group validation: with `multiExpandable=false`, more than one initially expanded trigger
  warns (private accordion.ts:131-144).
- Guide example wraps the trigger in `<h3>` and puts the directive on a `<span>` or
  `<button>` (`adev/src/content/examples/aria/accordion/src/single-expansion/basic/app/app.html`).

### 2.4 Foundation match

Foundation Accordion: direct match. Notes for the spec: Foundation defaults
`data-multi-expand=false` while Aria defaults `multiExpandable=true`; Foundation
`data-allow-all-closed` defaults `false` (one panel must stay open) and Aria has no
equivalent (all panels may close); Foundation `data-slide-speed` is animation, out of Aria's
scope; Foundation `data-deep-link`/`update-history` are consumer concerns. Foundation puts
`.accordion-title` on an `<a>`; Aria adds `role="button"` to whatever element carries the
trigger, so a `<button class="accordion-title">` is the cleaner host.

## 3. Tabs (`@angular/aria/tabs`)

Files: `src/aria/tabs/tabs.ts`, `tab-list.ts`, `tab.ts`, `tab-panel.ts`, `tab-content.ts`,
`tab-tokens.ts`. Guide: `guide/aria/tabs.md`. APG: Tabs. Stability: stable.

### 3.1 Directives

`Tabs`, selector `[ngTabs]`, exportAs `ngTabs`, provides `TABS`. No inputs, no host
attributes; it is the registry that links tabs to panels by `value` (tabs.ts:78-97).

`TabList`, selector `[ngTabList]`, exportAs `ngTabList`, provides `TAB_LIST`, injects `TABS`
(required).

| Member | Kind | Type / default | Source |
| --- | --- | --- | --- |
| `orientation` | input | `'horizontal' \| 'vertical'`, `'horizontal'` | tab-list.ts:80 |
| `wrap` | input | boolean, `true` | :86 |
| `softDisabled` | input | boolean, `true` | :92 |
| `focusMode` | input | `'roving' \| 'activedescendant'`, `'roving'` | :99 |
| `selectionMode` | input | `'follow' \| 'explicit'`, `'follow'` | :106 |
| `selectedTab` | model | `string \| undefined` (tab value) | :109 |
| `disabled` | input | boolean, `false` | :121 |
| `open(value): boolean`, `findTab(value)` | methods | | :179-185 |

Host: `role="tablist"`, `tabindex`, `aria-disabled`, `aria-orientation`,
`aria-activedescendant` (only meaningful in activedescendant mode), `(keydown)`, `(click)`,
`(focusin)` (tab-list.ts:49-58). `selectedTab` is a `linkedSignal`-backed two-way binding: it
is written back after render to the value of the pattern's selected tab (:143-149). Duplicate
tab values warn (:157-161).

`Tab`, selector `[ngTab]`, exportAs `ngTab`, injects `TAB_LIST`.

| Member | Kind | Type / default | Source |
| --- | --- | --- | --- |
| `value` | input, required | string | tab.ts:73 |
| `id` | input | string, generated `ng-tab-N` | :62 |
| `disabled` | input | boolean, `false` | :70 |
| `active`, `selected` | computed | boolean | :76-79 |
| `open()` | method | | :90 |

Host: `role="tab"`, `id`, `tabindex` (roving), `aria-selected`, `aria-disabled`,
`aria-controls` (panel id), `data-active` (tab.ts:41-49). Warns when no panel shares its
value (:104-110).

`TabPanel`, selector `[ngTabPanel]`, exportAs `ngTabPanel`, injects `TABS`, hostDirectives
`DeferredContentAware` (`preserveContent` forwarded).

| Member | Kind | Type / default | Source |
| --- | --- | --- | --- |
| `value` | input, required | string | tab-panel.ts:81 |
| `id` | input | string, generated `ng-tabpanel-N` | :73 |
| `preserveContent` | model | boolean, `false` | :52-57 |
| `visible` | computed | boolean | :84 |

Host: `role="tabpanel"`, `id`, `tabindex` (0 when visible, -1 hidden;
`TabPanelPattern.tabIndex` private tabs.ts:331), `inert` when hidden, `aria-labelledby` (tab
id) (tab-panel.ts:45-51). Requires an `ngTabContent` child (violation :108-110).

`TabContent`, selector `ng-template[ngTabContent]`, exportAs `ngTabContent`, hostDirectives
`DeferredContent`.

### 3.2 Keyboard (`src/aria/private/tabs/tabs.ts:388-428`)

| Key | Action |
| --- | --- |
| ArrowLeft / ArrowRight (horizontal, flipped in RTL) or ArrowUp / ArrowDown (vertical) | previous / next tab; in `follow` mode also opens it |
| Home / End | first / last tab (opens in `follow` mode) |
| Space, Enter | open the active tab |
| Click | goto and open, in both modes (`clickManager`, :424-428) |

The selected tab cannot be collapsed by re-activating it (`ListExpansion.open` returns
false if already expanded; `multiExpandable` is forced `false`, :443-446). Default state:
active item is the selected tab, else the first focusable tab (:457-475), applied until the
first interaction (`hasBeenInteracted`).

### 3.3 Markup rules

`ngTabList` and every `ngTabPanel` must be inside the same `ngTabs`; a tab and a panel pair
by equal `value` strings. Panels may live anywhere in the `ngTabs` subtree. Example markup
uses `<div ngTab>` (adev explicit-selection example) or `<li ngTab>` (tab-list.ts doc
comment); Aria sets `role="tab"` on that element.

### 3.4 Foundation match

Foundation Tabs: direct match. Foundation `ul.tabs > li.tabs-title > a` puts `.is-active` on
the `li` and `aria-selected` on the `a`; with Aria the `role="tab"` element is whichever
element carries `ngTab`, so the spec must decide whether `ngTab` goes on the `li` (Foundation
styles `.tabs-title > a[aria-selected="true"]`, so the anchor is the natural host) and how
`.is-active` on the `li` is derived (`tab.selected()` via `exportAs`). Foundation options:
`data-active-collapse` (no Aria equivalent, tabs cannot collapse), `data-auto-focus`,
`data-wrap-on-keys` (`wrap`), `data-match-height` (CSS/consumer), `data-link-class` /
`data-panel-class` (styling), `data-deep-link` / `data-update-history` (consumer, History
API). ResponsiveAccordionTabs also maps here (see 10).

## 4. Listbox (`@angular/aria/listbox`)

Files: `src/aria/listbox/listbox.ts`, `option.ts`, `tokens.ts`. Guide:
`guide/aria/listbox.md` plus the composed patterns `select.md`, `multiselect.md`,
`autocomplete.md`. APG: Listbox. Stability: stable.

`Listbox<V>`, selector `[ngListbox]`, exportAs `ngListbox`, provides `LISTBOX`.

| Member | Kind | Type / default | Source |
| --- | --- | --- | --- |
| `id` | input | string, generated `ng-listbox-N` | listbox.ts:72 |
| `orientation` | input | `'vertical' \| 'horizontal'`, `'vertical'` | :87 |
| `multi` | input | boolean, `false` | :90 |
| `wrap` | input | boolean, `true` | :93 |
| `softDisabled` | input | boolean, `true` | :99 |
| `focusMode` | input | `'roving' \| 'activedescendant'`, `'roving'` | :106 |
| `selectionMode` | input | `'follow' \| 'explicit'`, `'follow'` | :113 |
| `typeaheadDelay` | input | number ms, `500` | :116 |
| `disabled` | input | boolean, `false` | :119 |
| `readonly` | input | boolean, `false` | :122 |
| `tabIndex` | input, alias `tabindex` | number \| undefined | :125 |
| `value` | model | `V[]`, `[]` | :131 |
| `activeDescendant` | computed | string \| undefined | :137 |
| `scrollActiveItemIntoView()`, `gotoFirst()`, `gotoIndex(i)` | methods | | :204-221 |

Host: `role="listbox"`, `id`, `tabindex`, `aria-readonly`, `aria-disabled`,
`aria-orientation`, `aria-multiselectable`, `aria-activedescendant`, `(keydown)`, `(click)`,
`(focusin)` (listbox.ts:55-67). Values not matching any option are pruned from `value` after
render (:188-197). Validation warns on multiple selected values in single mode, duplicate
values, duplicate ids (private listbox.ts:210-232).

`Option<V>`, selector `[ngOption]`, exportAs `ngOption`, injects `LISTBOX`. Inputs: `value`
(required, V), `id` (generated `ng-option-N`), `disabled` (false), `label` (string, typeahead
text). Computed: `active`, `selected`. Host: `role="option"`, `id`, `tabindex`,
`aria-selected`, `aria-disabled`, `data-active` (option.ts:44-51).

Keyboard (`src/aria/private/listbox/listbox.ts:81-165`): arrows by orientation/RTL, Home,
End, typeahead on any single printable character (`/^.$/`), Space/Enter toggle (explicit
mode), Shift+arrows and Shift+Home/End range selection, Ctrl/Meta+A toggle all (multi),
Ctrl/Meta+arrows move without selecting (multi + follow), Ctrl/Meta+Space toggle. Readonly
listboxes navigate only. Click: select-one, toggle, or Shift-click range depending on mode
(:168-200).

Foundation match: none. Foundation has no listbox or select plugin. Kept in the inventory
because the combobox (5) composes it and because it is the pattern the guides route
"Select", "Multiselect" and "Autocomplete" through.

## 5. Combobox (`@angular/aria/combobox`)

Files: `src/aria/combobox/combobox.ts`, `combobox-popup.ts`, `combobox-widget.ts`,
`combobox-tokens.ts`. Guide: `guide/aria/combobox.md`. APG: Combobox. Stability: stable
since 22.0.0 (renamed from `SimpleCombobox`, 1.3).

`Combobox`, selector `[ngCombobox]`, exportAs `ngCombobox`, extends `DeferredContentAware`
(so it carries `preserveContent` and `contentVisible` itself). Applied to the trigger element:
an `<input>`/`<textarea>` for editable comboboxes or any other element for a select-style
trigger; editability is detected from `tagName` (`ComboboxPattern.isEditable`, private
combobox.ts:836-840).

| Member | Kind | Type / default | Source |
| --- | --- | --- | --- |
| `disabled`, `readonly`, `softDisabled`, `alwaysExpanded` | inputs | boolean; `false`, `false`, `true`, `false` | combobox.ts:95-104 |
| `tabIndex` | input, alias `tabindex` | number \| undefined | :107 |
| `expanded` | model | boolean, `false` | :113 |
| `value` | model | string, `''` (input text) | :116 |
| `inlineSuggestion` | input | string \| undefined | :119 |
| `preserveContent` | model (inherited) | boolean, `false` | deferred-content.ts:27 |

Host: `role="combobox"`, `aria-autocomplete` (`none`/`inline`/`list`/`both`, computed from
popup type and `inlineSuggestion`, private :810-824), `aria-disabled`, `aria-readonly`
(non-editable only), `aria-expanded`, `aria-activedescendant`, `aria-controls` (popup widget
id), `aria-haspopup` (popup type), `tabindex`, native `disabled` (hard-disabled) and
`readonly` (editable), listeners `keydown`, `focusin`, `focusout`, `click`, `input`
(combobox.ts:62-80).

`ComboboxPopup`, selector `ng-template[ngComboboxPopup]`, exportAs `ngComboboxPopup`,
hostDirectives `DeferredContent`, provides `COMBOBOX_POPUP`. Inputs: `combobox` (required,
the `Combobox` instance), `popupType` (`'listbox' | 'tree' | 'grid' | 'dialog'`, default
`'listbox'`). The template renders while `expanded` is true (`contentVisible` tracks
`isExpanded`, combobox.ts:134-136).

`ComboboxWidget`, selector `[ngComboboxWidget]`, exportAs `ngComboboxWidget`, injects
`COMBOBOX_POPUP`. Input `activeDescendant` (string, to be bound from the inner listbox/tree/
grid). Reads or assigns the host `id` imperatively and watches it with a `MutationObserver`
so `aria-controls` on the trigger stays correct (combobox-widget.ts:54-78).

Keyboard (private combobox.ts:855-928): collapsed: ArrowDown expands (and Enter/Space for
non-editable). Expanded: ArrowUp/ArrowDown (plain and Shift), Home, End, PageUp, PageDown,
Enter are relayed to the popup widget through `keyboardEventRelay` (re-dispatched to the
widget element); Escape collapses unless `alwaysExpanded`; non-editable, non-readonly
triggers also relay Space, Ctrl/Meta+A, Shift+Home/End and printable characters. Click on a
non-editable, non-readonly trigger toggles `expanded`. Editable comboboxes push `value` into
the native input and apply the inline-suggestion highlight (`highlightEffect`).

Popup positioning: not provided. The adev select example uses `cdkConnectedOverlay` with
`usePopover: 'inline'` and `matchWidth: true`
(`adev/src/content/examples/aria/select/src/basic/app/app.html`).

Foundation match: none. Foundation has no select, autocomplete or combobox plugin. The
Dropdown (pane) plugin is not a combobox: its trigger is a plain button and its pane is
arbitrary content, so `ngCombobox` with `popupType="dialog"` would misreport the widget as a
combobox to assistive technology.

## 6. Menu and Menubar (`@angular/aria/menu`)

Files: `src/aria/menu/menu.ts`, `menu-bar.ts`, `menu-item.ts`, `menu-trigger.ts`,
`menu-content.ts`, `menu-tokens.ts`. Guides: `guide/aria/menu.md`, `guide/aria/menubar.md`.
APG: Menu and Menubar, Menu Button. Stability: stable (menu introduced in 21.x, CHANGELOG
"menu: create the aria menu (#32080)").

### 6.1 Directives

`MenuTrigger<V>`, selector `[ngMenuTrigger]`, exportAs `ngMenuTrigger`.

| Member | Kind | Type / default | Source |
| --- | --- | --- | --- |
| `menu` | input | `Menu<V> \| undefined` (template ref) | menu-trigger.ts:68 |
| `disabled`, `softDisabled` | inputs | boolean, `false` / `true` | :77-80 |
| `expanded`, `hasPopup` | computed | boolean | :71-74 |
| `open()`, `close()` | methods | `open` focuses first item | :101-108 |

Host: `tabindex` (0, or -1 while the menu owns focus), native `disabled` when hard-disabled,
`aria-disabled`, `aria-haspopup="true"`, `aria-expanded`, `aria-controls` (menu id), and
`click`, `keydown`, `focusout`, `focusin` listeners (menu-trigger.ts:44-55). No `role` is
set; the guide puts it on a `<button>`. Focus leaving both the trigger and the menu closes
the menu (private menu.ts:730-741).

`Menu<V>`, selector `[ngMenu]`, exportAs `ngMenu`, provides `MENU_COMPONENT`, hostDirectives
`DeferredContentAware` (`preserveContent` forwarded).

| Member | Kind | Type / default | Source |
| --- | --- | --- | --- |
| `id` | input | string, generated `ng-menu-N` | menu.ts:103 |
| `wrap` | input | boolean, `true` | :106 |
| `typeaheadDelay` | input | number ms, `500` | :109 |
| `disabled`, `softDisabled` | inputs | boolean, `false` / `true` | :112-118 |
| `expansionDelay` | input | number ms, `100` (hover open/close delay for submenus) | :150 |
| `itemSelected` | output | `V \| undefined` | :147 |
| `visible`, `tabIndex` | computed | | :141-144 |
| `parent` | signal (set by trigger or parent item) | `MenuTrigger \| MenuItem \| undefined` | :115 |
| `close()` | method | | :212 |

Host: `role="menu"`, `id`, `aria-disabled`, `tabindex`, `data-visible`, listeners `keydown`,
`mouseover`, `mouseout`, `focusout`, `focusin`, `click` (menu.ts:60-72). `visible()` is
`parent.expanded()` when it has a parent and `true` for a standalone menu (private
menu.ts:92-94). Aria does not hide the menu: the consumer must bind `visible()` (or
`data-visible`) to CSS or an overlay. Content deferral: a menu owned by a menubar item keeps
its content rendered; other menus render content while visible or after the parent has been
interacted with (menu.ts:166-177).

`MenuBar<V>`, selector `[ngMenuBar]`, exportAs `ngMenuBar`, provides `MENU_COMPONENT`.
Inputs `disabled` (false), `softDisabled` (true), `wrap` (true), `typeaheadDelay` (500);
model `value: V[]` (`[]`); output `itemSelected`. Host: `role="menubar"`, native `disabled`
when hard-disabled, `aria-disabled`, `tabindex`, listeners `keydown`, `mouseover`, `click`,
`focusin`, `focusout` (menu-bar.ts:58-68). Orientation fixed horizontal (:117).

`MenuItem<V>`, selector `[ngMenuItem]`, exportAs `ngMenuItem`, injects `MENU_COMPONENT`
optionally (warns when absent, menu-item.ts:113-116).

| Member | Kind | Type / default | Source |
| --- | --- | --- | --- |
| `id` | input | string, generated `ng-menu-item-N` | menu-item.ts:65 |
| `value` | input | `V \| undefined` | :68 |
| `disabled` | input | boolean, `false` (no transform) | :71 |
| `searchTerm` | model | string, `''` (typeahead) | :74 |
| `role` | input | `'menuitem' \| 'menuitemradio' \| 'menuitemcheckbox'`, `'menuitem'` | :77 |
| `submenu` | input | `Menu<V> \| undefined` | :83 |
| `active`, `expanded`, `hasPopup` | computed | | :86-92 |
| `open()`, `close()` | methods | | :132-139 |

Host: `[attr.role]` from the `role` input, `tabindex` (roving), `data-active`,
`aria-haspopup`, `aria-expanded` (null without submenu), `aria-disabled`, `aria-controls`
(submenu id), `focusin` (menu-item.ts:46-55). Note `aria-checked` is not managed for the
radio/checkbox roles; the consumer binds it.

`MenuContent`, selector `ng-template[ngMenuContent]`, exportAs `ngMenuContent`,
hostDirectives `DeferredContent`. Optional: items may also be placed directly inside
`ngMenu`.

### 6.2 Keyboard

`MenuPattern` (private menu.ts:175-186): ArrowDown next, ArrowUp previous, Home, End, Enter
and Space trigger (open submenu with first item focused, or submit), Escape close all the
way to the root and refocus the trigger, ArrowRight (ArrowLeft in RTL) expand submenu or move
to the next menubar item, ArrowLeft (ArrowRight in RTL) close submenu and refocus its item or
move to the previous menubar item, single printable characters typeahead (Space is disabled
while typing). Submit closes the whole menu tree, refocuses the trigger and emits
`itemSelected(value)` on the root menu or menubar (:404-421). Hover: `mouseover` on an item
opens its submenu after `expansionDelay` and closes the sibling's submenu after the same
delay (:239-294); focus follows hover only when the root is a trigger-owned menu or when the
menubar/menu already has focus (`shouldFocus`, :121-133).

`MenuBarPattern` (:526-536): ArrowRight/ArrowLeft next/previous (flipped in RTL), Home, End,
Enter, ArrowDown and Space open the active item's submenu on its first item, ArrowUp opens it
on its last item, typeahead. The guide states submenus open on hover "after first keyboard
or click interaction" (`guide/aria/menubar.md` Features).

`MenuTriggerPattern` (:678-684): Space, Enter, ArrowDown open on first item; ArrowUp opens on
last item; Escape closes and refocuses; click toggles.

### 6.3 Markup rules

`ngMenuItem` must be inside `ngMenu` or `ngMenuBar`. A submenu is a separate `ngMenu`
element referenced by template variable from `[submenu]` on the owning item; it can be placed
anywhere (the adev menubar example places each submenu inside a `cdkConnectedOverlay`
template with `usePopover: 'inline'` and `cdkAttachPopoverAsChild`,
`adev/src/content/examples/aria/menubar/src/basic/app/app.html`). The trigger references
its menu with `[menu]`.

### 6.4 Foundation match

Foundation DropdownMenu (`ul.dropdown.menu > li > a + ul.menu`): behavioural match
(`ngMenuBar` + `ngMenuItem[submenu]` + `ngMenu`, hover open with delay, click open, arrow
keys, Escape, typeahead), semantic mismatch. Foundation's dropdown menu is site navigation
made of links; `ngMenu` applies `role="menu"`/`role="menuitem"` which the Aria guide itself
says to avoid for site navigation ("Avoid menus when building site navigation (use navigation
landmarks instead)", `guide/aria/menu.md` Usage). The APG has the same split (Menubar for
application commands, navigation menubar example, and the "disclosure navigation" pattern for
links). The DropdownMenu spec must choose; the Aria menu only fits when the items are
commands. Foundation options `data-hover-delay` maps to `expansionDelay`, `data-disable-hover`
and `data-click-open` have no direct input (hover is always on after interaction),
`data-closing-time`, `data-alignment`, `data-close-on-click`, `data-close-on-click-inside`,
`data-force-follow`, `data-vertical-class`, `data-right-class` have no Aria equivalent.

Foundation Drilldown: no match. Drilldown replaces the current panel with the submenu in
place; `ngMenu` submenus open beside their item and keep the parent visible. AccordionMenu:
see Tree (7). Dropdown (pane): no match; the pane is arbitrary content, not a list of
menu items, and `ngMenuTrigger` only accepts an `ngMenu`.

## 7. Toolbar (`@angular/aria/toolbar`)

Files: `src/aria/toolbar/toolbar.ts`, `toolbar-widget.ts`, `toolbar-widget-group.ts`,
`toolbar-tokens.ts`. Guide: `guide/aria/toolbar.md`. APG: Toolbar. Stability: stable.

`Toolbar`, selector `[ngToolbar]`, exportAs `ngToolbar`. Inputs `orientation`
(`'horizontal'`), `softDisabled` (true), `disabled` (false), `wrap` (true). Host:
`role="toolbar"`, `tabindex`, `aria-disabled`, `aria-orientation`, listeners `keydown`,
`click`, `pointerdown`, `focusin` (toolbar.ts:45-57). Children inject the `Toolbar` class
directly (no token).

`ToolbarWidget`, selector `[ngToolbarWidget]`, exportAs `ngToolbarWidget`. Inputs `id`
(generated `ng-toolbar-widget-N`), `disabled` (false). Computed `hardDisabled`, `active`.
Host: `ngToolbarWidget=""` (for host-directive use), `data-active`, `tabindex` (roving),
`inert` and native `disabled` when hard-disabled, `aria-disabled`, `id`
(toolbar-widget.ts:45-57). No role: the widget keeps its native semantics (button, radio,
checkbox) and native activation (Enter/Space are not handled by the toolbar).

`ToolbarWidgetGroup`, selector `[ngToolbarWidgetGroup]`, exportAs `ngToolbarWidgetGroup`,
provides `TOOLBAR_WIDGET_GROUP`. Input `disabled` (false). No host attributes; the guide
puts `role="radiogroup"` or `role="group"` on it by hand. Must sit inside `ngToolbar`
(violation, toolbar-widget-group.ts:70-72).

Keyboard (private toolbar.ts:80-130): next/previous by orientation and RTL, Home, End; while
the active widget is inside a group the perpendicular arrow keys move within the group
(`_altNextKey`/`_altPrevKey`, :96-127).

Foundation match: none of the 21 plugins. Foundation Button Group is CSS-only and out of
scope; `ngToolbar` would be the pattern to apply to a `.button-group` if a future spec wants
keyboard navigation there.

## 8. Tree (`@angular/aria/tree`)

Files: `src/aria/tree/tree.ts`, `tree-item.ts`, `tree-item-group.ts`. Guide:
`guide/aria/tree.md`. APG: Tree View (and Navigation Treeview via `nav`). Stability: stable.

`Tree<V>`, selector `[ngTree]`, exportAs `ngTree`. Children inject the `Tree` class via the
`parent` input rather than a token.

| Member | Kind | Type / default | Source |
| --- | --- | --- | --- |
| `id` | input | string, generated `ng-tree-N` | tree.ts:96 |
| `orientation` | input | `'vertical' \| 'horizontal'`, `'vertical'` | :99 |
| `multi` | input | boolean, `false` (forced false when `nav`) | :102; private tree.ts:600 |
| `disabled` | input | boolean, `false` | :105 |
| `selectionMode` | input | `'explicit' \| 'follow'`, `'explicit'` | :112 |
| `focusMode` | input | `'roving' \| 'activedescendant'`, `'roving'` | :119 |
| `wrap` | input | boolean, `true` | :122 |
| `softDisabled` | input | boolean, `true` | :128 |
| `typeaheadDelay` | input | number, `500` | :131 |
| `tabIndex` | input, alias `tabindex` | | :134 |
| `value` | model | `V[]`, `[]` | :140 |
| `nav` | input | boolean, `false` (navigation tree: `aria-current` instead of `aria-selected`) | :146 |
| `currentType` | input | `'page' \| 'step' \| 'location' \| 'date' \| 'time' \| 'true' \| 'false'`, `'page'` | :152 |
| `activeDescendant` | computed | | :160 |
| `scrollActiveItemIntoView()` | method | | :208 |

Host: `role="tree"`, `id`, `aria-orientation`, `aria-multiselectable`, `aria-disabled`,
`aria-activedescendant`, `tabindex`, listeners `keydown`, `click`, `focusin` (tree.ts:72-83).

`TreeItem<V>`, selector `[ngTreeItem]`, exportAs `ngTreeItem`, extends
`DeferredContentAware`. Inputs: `id` (generated `ng-tree-item-N`), `value` (required),
`parent` (required: the `Tree` or the owning `TreeItemGroup`), `disabled` (false),
`selectable` (true), `label` (typeahead text; defaults to `textContent`); model `expanded`
(false); computed `active`, `level`, `selected`, `visible`. Host: `role="treeitem"`, `id`,
`aria-expanded` (only when it has children), `aria-selected` (non-nav) / `aria-current`
(nav, value from `currentType` when selected), `aria-disabled`, `aria-level`,
`aria-setsize`, `aria-posinset`, `tabindex`, `data-active` (tree-item.ts:44-56; private
tree.ts:344-361).

`TreeItemGroup<V>`, selector `ng-template[ngTreeItemGroup]`, exportAs `ngTreeItemGroup`,
hostDirectives `DeferredContent`. Input `ownedBy` (required, the parent `TreeItem`). The
template content (child `ngTreeItem`s) is created when the owner expands and destroyed when
it collapses unless `preserveContent` is set on the owning item. The consumer supplies the
`role="group"` wrapper element around the template (doc comment tree-item-group.ts:29-38).

Keyboard (private tree.ts:429-559): ArrowUp/ArrowDown previous/next visible item (vertical),
Home, End, typeahead, Shift+`*` expands all siblings, ArrowRight (ArrowLeft in RTL) expands
or moves to first child, ArrowLeft collapses or moves to parent; selection keys mirror the
listbox matrix (Space/Enter toggle or select-one, Shift ranges, Ctrl/Meta+A, Ctrl/Meta+arrows).
In `nav` mode Enter does not `preventDefault`, so a link inside the item can navigate
(:508, :514).

Foundation match: AccordionMenu (`ul.vertical.menu.accordion-menu` with nested `ul.menu`,
`data-multi-open`, `data-submenu-toggle`). `ngTree` with `nav="true"` is the APG Navigation
Treeview and gives arrow-key expand/collapse, `aria-expanded` on parents and `aria-current`
on the active link. Differences to record: Aria expands and collapses only via the item's
`expanded` model or arrow keys, there is no separate toggle button (`data-submenu-toggle`);
`multiExpandable` is forced true on the tree (private tree.ts:618), so Foundation's
`multiOpen=false` (close siblings) needs consumer logic; nested items must be wrapped in
`ng-template ngTreeItemGroup` and each item needs `[parent]`, so the Foundation nested-`ul`
markup cannot be used verbatim without a wrapping directive. Drilldown is not a tree either
(panels replace each other).

## 9. Grid (`@angular/aria/grid`)

Files: `src/aria/grid/grid.ts`, `grid-row.ts`, `grid-cell.ts`, `grid-cell-widget.ts`,
`grid-tokens.ts`. Guide: `guide/aria/grid.md`. APG: Grid. Stability: stable (introduced
21.x, CHANGELOG "grid: create the aria grid (#32092)").

`Grid`, selector `[ngGrid]`, exportAs `ngGrid`, provides `GRID`. Inputs: `enableSelection`
(false), `disabled` (false), `softDisabled` (true), `focusMode` (`'roving'`), `rowWrap` and
`colWrap` (`'continuous' | 'loop' | 'nowrap'`, default `'loop'`), `multi` (false),
`selectionMode` (`'follow'`), `tabIndex`. Host: `role="grid"`, `tabindex`, `aria-disabled`,
`aria-multiselectable`, `aria-activedescendant`, listeners `keydown`, `click`, `focusin`,
`focusout` (grid.ts:54-69).

`GridRow`, selector `[ngGridRow]`, provides `GRID_ROW`; input `rowIndex`; host `role="row"`,
`aria-rowindex`. `GridCell`, selector `[ngGridCell]`, provides `GRID_CELL`; inputs `id`,
`role` (`'gridcell' | 'columnheader' | 'rowheader'`), `rowSpan`, `colSpan`, `rowIndex`,
`colIndex`, `disabled`, `selectable`, `tabindex`; model `selected`. Attributes (`role`, `id`,
`rowspan`, `colspan`, `aria-rowspan`, `aria-colspan`, `data-active`, `data-anchor`,
`aria-disabled`, `aria-rowindex`, `aria-colindex`, `aria-selected`, `tabindex`) are written
in one batched `afterRenderEffect` for performance (grid-cell.ts:120-144). `GridCellWidget`,
selector `[ngGridCellWidget]`: inputs `id`, `widgetType` (`'simple' | 'complex' |
'editable'`), `disabled`, `focusTarget`, `tabindex`; outputs `activated`, `deactivated`;
methods `activate()`, `deactivate()`.

Keyboard (private grid.ts:98-175, widget.ts:83-120): ArrowUp/Down, ArrowLeft/Right (RTL
aware), Home/End first/last cell in row, Ctrl+Home/End first/last cell in grid, Enter/Space
select when `enableSelection`, Ctrl/Meta+A select all, Shift+Space select row, Ctrl/Meta+Space
select column. Widgets: simple widgets fire `activated` on Enter/Space; complex and editable
widgets activate on Enter (editable also on any alphanumeric key) and deactivate on Escape
(editable also on Enter), pausing grid navigation while active.

Foundation match: none. Foundation has no data grid plugin.

## 10. Foundation plugin coverage summary

| Foundation plugin | Aria pattern | Verdict |
| --- | --- | --- |
| Accordion | `@angular/aria/accordion` | Match. Gaps: `allowAllClosed=false` not expressible; default expansion mode differs. |
| Tabs | `@angular/aria/tabs` | Match. Gaps: `activeCollapse` not expressible; deep-linking is consumer code. |
| ResponsiveAccordionTabs | accordion + tabs | Both halves exist; the breakpoint switch is custom. |
| AccordionMenu | `@angular/aria/tree` with `nav` | Closest match (APG navigation treeview); markup needs `ngTreeItemGroup` templates and `[parent]` inputs. |
| DropdownMenu | `@angular/aria/menu` (`ngMenuBar` + `ngMenu`) | Behaviour matches; semantics (`role=menu`) only fit command menus, not link navigation. Spec decides. |
| Drilldown | none | Panel replacement is not a menu, tree, or tabs pattern. |
| Dropdown (pane) | none | Not a combobox; native `popover` plus anchor positioning is the platform path. |
| Reveal, OffCanvas | none | Dialog territory: native `<dialog>` or `@angular/cdk/dialog`. |
| Tooltip | none | |
| Orbit | none | APG carousel has no Aria directive. |
| Slider | none | Native `<input type="range">`. |
| Toggler, Equalizer, Interchange, Magellan, SmoothScroll, Sticky, ResponsiveMenu, ResponsiveToggle, Abide | none | Not interaction patterns Aria covers. |

Aria patterns with no Foundation plugin: Listbox, Combobox (Select, Multiselect,
Autocomplete), Toolbar, Grid.

## 11. How Aria is tested in the clone

Read from `src/aria/accordion/accordion.spec.ts`, `accordion/testing/accordion-harness.spec.ts`,
`combobox/combobox.zone.spec.ts`, `src/aria/*/BUILD.bazel`, `test/angular-test.init.ts`,
`src/cdk/testing/private/run-accessibility-checks.ts`, and `tools/defaults.bzl`.

### 11.1 Runner and environment

- Bazel `ng_web_test_suite` targets per entry point (`src/aria/accordion/BUILD.bazel:36-39`),
  which is Karma plus Jasmine in a browser (`tools/defaults.bzl:3,20`; `test/karma.conf.js`).
- Zoneless by default: `test/angular-test.init.ts:17` registers
  `provideZonelessChangeDetection()` and `provideCheckNoChangesConfig({exhaustive: true})`
  for every test. The only Zone.js spec is `combobox/combobox.zone.spec.ts`, which adds
  `provideZoneChangeDetection()` explicitly (line 21).
- Each spec configures `TestBed` with `provideFakeDirectionality('ltr')` (or `'rtl'` for RTL
  cases) and `_IdGenerator` (`accordion.spec.ts:66-70`).

### 11.2 Directive specs (behaviour)

- A small host component per scenario, declared inside the spec file with `imports:` of the
  directives and `ChangeDetectionStrategy.OnPush`, driven by signals
  (`accordion.spec.ts:1-11`, host components at the bottom of the file).
- Elements are located with `fixture.debugElement.queryAll(By.directive(AccordionTrigger))`
  (`accordion.spec.ts:46-51`).
- Interaction is raw DOM events, no harness: `dispatchEvent(new PointerEvent('click',
  {bubbles: true}))`, `dispatchEvent(new KeyboardEvent('keydown', {bubbles: true, key}))`,
  then `await fixture.whenStable()` (`accordion.spec.ts:20-35`).
- Assertions read attributes (`role`, `aria-expanded`, `aria-controls`, `data-active`,
  `inert`, `tabindex`) directly (`accordion.spec.ts:55-63`).
- `afterEach(async () => runAccessibilityChecks(fixture.nativeElement))` runs axe-core
  over the rendered fixture and fails on any violation
  (`accordion.spec.ts:72-74`; `src/cdk/testing/private/run-accessibility-checks.ts:27-32`).
- `waitForMicrotasks()` (`src/aria/private/testing/test-helpers.ts:13`) is used when a test
  depends on `MutationObserver` callbacks, for example after adding or removing items.
- Spec count by convention: accordion 30 `whenStable`/a11y calls, toolbar 38, grid 85, menu
  36, combobox 39 (rg count over `*.spec.ts`).

### 11.3 Harnesses (`@angular/aria/<pattern>/testing`)

All harnesses extend `ComponentHarness` or `ContentContainerComponentHarness` from
`@angular/cdk/testing` and are used through `TestbedHarnessEnvironment.loader(fixture)`
(`accordion/testing/accordion-harness.spec.ts:44-51`; every guide's Testing section).

| Entry point | Harness classes (hostSelector) | Notable API |
| --- | --- | --- |
| accordion/testing | `AccordionGroupHarness` (`[ngAccordionGroup]`), `AccordionHarness` (`[ngAccordionTrigger]`) | `with({title, expanded, disabled})`, `isExpanded`, `toggle`, `expand`, `collapse`, `focus`; the root loader is re-pointed at the panel found by `aria-controls` so `getHarness` inside an item queries panel content (accordion-harness.ts:62-67) |
| tabs/testing | `TabsHarness` (`[ngTabs]`), `TabHarness` (`[ngTab]`) | `getTabs`, `getSelectedTab`, `selectTab`; `TabHarness.select/isSelected/isDisabled/isActive`, loader re-pointed at the tab panel (tabs-harness.ts:228-233) |
| menu/testing | `MenuHarness` (`[ngMenu], [ngMenuBar]`), `MenuItemHarness` (`[ngMenuItem]`) | `with({triggerText})`, `isOpen`, `isMenuBar`, `open`, `close`, `getItems`; item `click`, `hasSubmenu`, `getSubmenu`, `isExpanded` |
| listbox/testing | `ListboxHarness` (`[ngListbox]`), `ListboxOptionHarness` (`[ngOption]`) | `getOptions`, `isMulti`, `getOrientation`, `getActiveDescendantId`; option `isSelected`, `click` |
| combobox/testing | `ComboboxHarness` (`[ngCombobox]`) | `isOpen`, `open`, `close`, `getValue`, `setValue`, `getPopupLoader`, `getPopupWidget(ListboxHarness)` |
| toolbar/testing | `ToolbarHarness`, `ToolbarWidgetHarness`, `ToolbarWidgetGroupHarness` | `getWidgets`, `getWidgetGroups`, `getOrientation`; widget `isActive`, `isSelected` (reads `aria-pressed`/`aria-checked`) |
| tree/testing | `TreeHarness` (`[ngTree]`), `TreeItemHarness` (`[ngTreeItem]`) | `getItems`, `getTreeStructure()` (text tree), item `getLevel`, `isExpanded`, `isSelected` |
| grid/testing | `GridHarness`, `GridRowHarness`, `GridCellHarness` | `getRows`, `getCells`, `getCellTextByIndex`, `isMultiSelectable` |

Harness specs are separate `*-harness.spec.ts` files with their own `BUILD.bazel`
`unit_tests` target (`accordion/testing/BUILD.bazel`).

### 11.4 Docs and examples

- Guides: `adev/src/content/guide/aria/{overview,accordion,tabs,listbox,combobox,select,
  multiselect,autocomplete,menu,menubar,toolbar,tree,grid}.md`, published at
  https://angular.dev/guide/aria/<name>.
- API reference is generated per entry point (`extract_api_to_json` rule in each
  `BUILD.bazel`, `src/aria/BUILD.bazel:55-70`) and published at
  https://angular.dev/api/aria/<entry>/<Class>.
- Runnable examples: `adev/src/content/examples/aria/<pattern>/src/<variant>/{basic,material,
  retro}/app/` in the angular/angular clone and `src/components-examples/aria/<pattern>` in
  angular/components. Each guide shows a Basic (unstyled), Material, and Retro styling of the
  same directives, which is the proof that Foundation CSS can be layered the same way.

### 11.5 What the next repo can mirror

- Zoneless TestBed, `provideFakeDirectionality`, raw `KeyboardEvent`/`PointerEvent`
  dispatch, `await fixture.whenStable()`, attribute assertions, and an axe pass after each
  test map one-to-one onto Vitest browser mode with `@angular/cdk/testing/testbed` and
  `axe-core`.
- `TestbedHarnessEnvironment` needs a `ComponentFixture`, which Storybook play functions do
  not have; use the DOM-level approach (roles, attributes, `data-active`) in play functions
  and reserve the `@angular/aria/*/testing` harnesses for Vitest specs.

## 12. Open questions not settled from sources

- Whether `role="menu"` semantics are acceptable for Foundation DropdownMenu as site
  navigation, or whether the spec should target the APG disclosure-navigation pattern with
  custom code and keep Aria out. The Aria guide argues against `menu` for navigation.
- Whether AccordionMenu should use `ngTree` (requires restructuring nested lists into
  `ng-template ngTreeItemGroup` and `[parent]` inputs) or nested `ngAccordionGroup`s (no
  `aria-level`, no arrow-key expand/collapse). The tree is the APG-correct answer; the cost
  is markup shape.
- The guides' `preserveContent` text contradicts the source default; the deliverable follows
  the source. Worth re-checking when 22.3 docs land.
