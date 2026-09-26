# Spec: Tabs

Ticket: [Spec: Tabs](../issues/16-spec-tabs.md). Targets Angular 22.2 (`@angular/aria` and `@angular/cdk` 22.2), Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Accessibility target: WCAG 2.2 AA, every criterion a requirement.

## Problem Statement

A developer building an Angular application on Foundation for Sites wants Foundation's tabs: a `ul.tabs` strip of `li.tabs-title > a` titles and a `.tabs-content` box of `.tabs-panel` panels, styled by Foundation's `foundation-tabs` Sass. Foundation makes them work with a jQuery plugin that the developer cannot use as is:

- Tabs pair with panels through `href="#panel1"` or `data-tabs-target`, and the content box finds its tab strip through `data-tabs-content="<strip id>"`. Every link is an id string, so an Angular app has to invent stable ids for every tab set, and generated ids differ between the server and the browser.
- The ARIA (`role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, roving `tabindex`) is stamped by the plugin at initialisation, so it is missing from server HTML and wrong until the script runs.
- The keyboard model binds Up and Down on horizontal tab strips (the APG reserves them for page scrolling), has no Home or End, ignores right-to-left layouts, and gives vertical tab strips no `aria-orientation`.
- Options that exist only because of jQuery (`linkClass`, `panelClass`, `linkActiveClass`, `panelActiveClass`, `deepLinkSmudgeDelay`) or that fight the pattern (`activeCollapse`, which leaves a tab strip with no selected tab) sit next to useful ones (`deepLink`, `updateHistory`, `wrapOnKeys`, `autoFocus`).
- `matchHeight` measures hidden panels by forcing them visible, after images load, from JavaScript.
- Foundation's default palette renders the selected tab's text at 3.76:1 against its background, below WCAG 1.4.3, and marks the selected tab only with a background 1.24:1 away from its neighbours.

A server-rendered Angular application adds more: the selected panel must be in the server HTML with its content, the tab strip must be reachable by the Tab key before hydration, hydration must not flash, and a click or arrow key pressed before hydration must still select the right tab afterwards, inside `@defer (hydrate on ...)` blocks too.

## Solution

Five attribute directives on Foundation's own markup plus one wrapping element, built on `@angular/aria/tabs` through host directives:

- `[nfsTabsGroup]` on an element the developer writes around the tab strip and the content box, because Aria needs one common ancestor and Foundation's strip and content are siblings. A Foundation grid row that already holds both (the vertical tabs layout) can carry it.
- `ul[nfsTabs]` on `ul.tabs`: the tab list, its keyboard, the `selected` model (by value), and Foundation's deep linking.
- `li[nfsTabsTitle]` on `li.tabs-title`: `role="presentation"` and Foundation's `.is-active` State class.
- `a[nfsTab]` on the title's anchor, with a required `value`: the tab.
- `[nfsTabsPanel]` on `.tabs-panel`, with the same `value`: the panel, as a plain directive; its content is the developer's projected markup, so the selected panel is in the server HTML.
- `ng-template[nfsTabsLazyContent]`, opt-in, for Lazy content the developer accepts as client-only.

Tabs pair with panels by `value`, so no id is needed except where the URL must name a panel (`deepLink`). Selection is automatic by default (the APG's recommended activation) with `selectionMode="explicit"` for manual activation. Every piece of first-paint state is a host binding on signal state, including a tab stop on the selected tab in the server HTML. Foundation's `.tabs-content` box needs no directive, and the tabs pattern needs no library CSS; the documented Sass settings make the selected tab pass WCAG 2.2 AA contrast.

## User Stories

1. As an application developer, I want to put a few attributes on Foundation's documented tabs markup, so that I keep Foundation's look without writing new markup.
2. As an application developer, I want tabs to pair with panels by a `value` I choose, so that I do not invent ids for every tab set.
3. As an application developer, I want the first tab selected when I bind nothing, so that a plain tab set shows a panel at first paint.
4. As an application developer, I want `[(selected)]` bound to a signal holding a tab value, so that my component reads and changes the selected tab.
5. As an application developer, I want `(selectionChange)` to give me the new value and tab when the selection changes, and not at first paint, so that I can load data or log analytics only for real changes.
6. As an application developer, I want tabs rendered by `@for` from data that arrives later to get a selected tab once they exist, so that an async tab set is not left blank.
7. As an application developer, I want to wrap the tab strip and the content in any element I already have, including a Foundation grid row, so that the extra element costs me no layout change.
8. As an application developer, I want vertical tabs by writing Foundation's `.vertical` classes plus `orientation="vertical"`, so that Up and Down move between tabs and assistive technology hears the orientation.
9. As an application developer, I want a dev-mode warning when the `.vertical` class and `orientation` disagree, so that looks and keys cannot drift apart.
10. As an application developer, I want `selectionMode="explicit"`, so that panels with costly content load only when the user presses Enter, Space, or clicks.
11. As an application developer, I want `wrapOnKeys="false"`, so that arrow keys stop at the first and last tab, as Foundation's option did.
12. As an application developer, I want `deepLink`, so that a URL hash naming a panel id opens that tab after the page loads and while the hash changes.
13. As an application developer, I want the URL hash to follow the selected tab when `deepLink` is on, with `updateHistory` choosing a new history entry over replacing the current one, so that links and the Back button behave as in Foundation.
14. As an application developer, I want `deepLinkSmudge` and `deepLinkSmudgeOffset`, so that a deep link scrolls the tab strip into view below my sticky header.
15. As an application developer, I want `(deepLinked)` to report the value a hash selected, so that I can react to arrivals from links.
16. As an application developer using the Router, I want a documented recipe that keeps the selected tab in a query parameter, so that the server renders the right tab and the Router owns the history.
17. As an application developer, I want `autoFocus`, so that a page whose purpose is the tab set starts with focus on its selected tab.
18. As an application developer, I want app-wide defaults for the deep-linking options, so that I set Foundation's `Tabs.defaults` equivalent once.
19. As an application developer, I want Lazy content through `ng-template[nfsTabsLazyContent]` with `preserveContent`, so that heavy panels render only when shown and optionally stay rendered.
20. As an application developer, I want to know that Lazy content is empty in server HTML, so that I choose it only for panels crawlers and no-JS users do not need.
21. As an application developer, I want `#p="nfsTabsPanel"` to expose `visible()`, so that my own `@defer (when p.visible())` block can load code for a panel on first show.
22. As an application developer, I want a documented CSS grid recipe for equal panel heights, so that I get `matchHeight` with no JavaScript measurement.
23. As an application developer, I want Foundation's tabs look for a navigation bar of links with `aria-current="page"`, so that page navigation looks like tabs without pretending to be a tab list.
24. As an application developer, I want dev-mode warnings for an `href` on a tab, a tab outside `li[nfsTabsTitle]`, a tab list with no accessible name, and a generated panel id under `deepLink`, so that I catch markup that breaks behaviour or accessibility.
25. As a keyboard user, I want Left and Right (flipped in right-to-left pages) to move between tabs and Home and End to jump to the ends, so that the tab strip follows the APG.
26. As a keyboard user, I want Up and Down on a horizontal tab strip to scroll the page, so that the tabs do not steal keys the APG leaves to the browser.
27. As a keyboard user, I want one tab stop on the tab strip that lands on the selected tab, and the next Tab to move into the panel, so that I do not tab through every title.
28. As a keyboard user, I want the Tab key to reach the selected tab before the page hydrates, so that server-rendered tabs are never a keyboard dead end.
29. As a keyboard user, I want an arrow key I press before hydration to take effect once the page hydrates, so that early input is not lost.
30. As a keyboard user, I want a visible focus indicator on the focused tab, so that I always know where I am (WCAG 2.4.7).
31. As a screen reader user, I want the strip announced as a named tab list, each title as a tab with its position and selected state, and each panel as a tab panel named by its tab, so that I understand the structure (WCAG 4.1.2).
32. As a screen reader user, I want hidden panels removed from the accessibility tree, so that I never land in content that is not shown.
33. As a low-vision user, I want the selected tab's text at 4.5:1 or better and its selected look at 3:1 or better against its neighbours, so that I can read and find it (WCAG 1.4.3, 1.4.11).
34. As a pointer user on a touch screen, I want tab titles at least 24 by 24 CSS pixels or spaced so, so that I hit the tab I aim for (WCAG 2.5.8).
35. As a user of a page with a sticky header, I want a focused or deep-linked tab strip not hidden behind the header when I set an offset, so that I see where focus is (WCAG 2.4.11).
36. As a developer of a server-rendered application, I want the selected panel's content, `aria-selected`, `.is-active`, and `inert` on hidden panels in the server HTML, so that the first paint is final and hydration changes nothing.
37. As a developer of a server-rendered application, I want a click on a tab before hydration to select it once the page hydrates, so that early clicks count.
38. As a developer using incremental hydration, I want a tab set inside `@defer (hydrate on interaction)` to hydrate and select on the first click, so that deferred tab sets work.
39. As a developer, I want a replayed arrow key in tabs nested inside an accordion panel to move within the tabs only, so that replay does not move focus in the outer widget.
40. As a developer of a zoneless application, I want the directives to need no zone, so that they work with zoneless change detection.
41. As a developer of a prerendered site, I want the same output as server rendering, so that prerendering needs no special handling.
42. As a developer, I want to import tabs from their own entry point, so that a `@defer` block splits them with the widget.
43. As a library maintainer, I want every behaviour asserted through roles, ARIA, State classes, focus, and URL in stories, browser-level tests, a server-render smoke test, and e2e, so that regressions surface at the layer that owns them.

## Implementation Decisions

### Foundation contract

Inventory from Foundation 6.9's Tabs plugin (`Tabs.defaults`, events, methods) and its `foundation-tabs` Sass:

| Foundation feature | 6.9 behaviour | Library counterpart |
| --- | --- | --- |
| `ul.tabs[data-tabs]` with an `id` | Tab strip; plugin root | `ul[nfsTabs]` |
| `li.tabs-title` (`linkClass`) | Title; gets `.is-active` (`linkActiveClass`) when selected; `role="presentation"` | `li[nfsTabsTitle]` |
| `li.tabs-title > a[href="#id"]` or `a[data-tabs-target="id"]` | The tab; `role="tab"`, `aria-selected`, `aria-controls`, roving `tabindex`, `id` kept or `<panel id>-label` | `a[nfsTab]` with a required `value`; no `href` |
| `.tabs-content[data-tabs-content="<strip id>"]` | Content box, found by the strip's id | Plain Foundation class, no directive; `[nfsTabsGroup]` on a common ancestor replaces the id link |
| `.tabs-panel` (`panelClass`) with an `id` | Panel; `.is-active` (`panelActiveClass`) when shown; `role="tabpanel"`, `aria-labelledby`, `aria-hidden` when hidden | `[nfsTabsPanel]` with the same `value`; `inert` instead of `aria-hidden` |
| `.vertical` on strip and content | CSS only; no `aria-orientation` | Consumer-written classes plus `orientation="vertical"` |
| `.simple`, `.primary` | CSS variants | Consumer-written Variant classes |
| `deepLink` (`false`) | Read `location.hash` at init and on `hashchange`; write `pathname + search + #id` on change | `deepLink` input |
| `deepLinkSmudge` (`false`) | Animate scroll so the strip is at the top after a deep link | `deepLinkSmudge` input, `scrollIntoView` |
| `deepLinkSmudgeDelay` (`300`) | Scroll animation duration; reused by `autoFocus` | Dropped: the browser owns smooth-scroll timing |
| `deepLinkSmudgeOffset` (`0`) | Pixels subtracted from the scroll target | `deepLinkSmudgeOffset` input, applied as `scroll-margin-top` |
| `updateHistory` (`false`) | `pushState` instead of `replaceState` | `updateHistory` input |
| `autoFocus` (`false`) | On window load, scroll to the selected tab and focus it | `autoFocus` input, first render callback |
| `wrapOnKeys` (`true`) | Arrow keys wrap | `wrapOnKeys`, Aria's `wrap` aliased |
| `matchHeight` (`false`) | Every panel gets the tallest panel's `min-height`, measured after images load and on breakpoint change | Dropped; documented CSS grid recipe |
| `activeCollapse` (`false`) | Clicking the selected tab collapses it, leaving no tab selected | Dropped: Aria tabs cannot collapse and the APG requires a rendered panel for the selected tab |
| `linkClass`, `linkActiveClass`, `panelClass`, `panelActiveClass` | Class names | Dropped: the classes are the contract (building-blocks 1.4) |
| `change.zf.tabs` `[$tabLi, $panel]` | After a different tab was selected | `selectedChange` (the `selected` model's output, carrying the value) and `selectionChange` (`{value, tab}`) |
| `collapse.zf.tabs` | After `activeCollapse` closed the tab | Dropped with `activeCollapse` |
| `deeplink.zf.tabs` `[$link, $anchor]` | A hash matched a tab | `deepLinked` output, carrying the value |
| `init.zf.tabs`, `destroyed.zf.tabs` | Lifecycle | None (Angular lifecycle) |
| `mutateme.zf.trigger` to `[data-mutate]` in the shown panel | Nested plugins re-measure | Dropped: nested directives observe their own size (`ResizeObserver`) |
| `selectTab(elem, historyHandled)` | Select by panel element or id | The `selected` model |
| `destroy()` | Unbinds and hides titles and panels inline | Angular destroy; nothing hidden |
| Keys: Enter/Space open; Right and Down next; Left and Up previous, always activating; no Home/End; no RTL flip | Keyboard | Aria's APG table below |

Dropped options: `activeCollapse`, `matchHeight`, `linkClass`, `linkActiveClass`, `panelClass`, `panelActiveClass`, `deepLinkSmudgeDelay`, `data-options`; also `data-tabs-content`, `href`/`data-tabs-target` pairing, and the `mutateme` re-dispatch.

### CSS class to Angular mapping

| Foundation class | Angular | Rationale |
| --- | --- | --- |
| (none; the element enclosing strip and content) | `NfsTabsGroup`, selector `[nfsTabsGroup]`, hosts Aria `Tabs` | Aria pairs tabs and panels inside one `ngTabs` ancestor; Foundation's strip and content are siblings, so one element must enclose both. Named after the plugin, since no Structural class exists (building-blocks 1.3) |
| `.tabs` | `NfsTabs`, selector `ul[nfsTabs]`, hosts Aria `TabList` | The tab list; Foundation's options live here as on `ul[data-tabs]` |
| `.tabs-title` | `NfsTabsTitle`, selector `li[nfsTabsTitle]` | Binds `role="presentation"` and `.is-active`, which sit on the `li` while the tab is its child |
| `.tabs-title > a` | `NfsTab`, selector `a[nfsTab]`, hosts Aria `Tab` | Foundation styles `.tabs-title > a` and keys the selected look on `a[aria-selected='true']`, so the anchor is the tab |
| `.tabs-content` | None | Purely a styling class once the group wrapper replaces `data-tabs-content`; the prototype needed no directive (foundation-api-design skill: a class that only styles gets no directive) |
| `.tabs-panel` | `NfsTabsPanel`, selector `[nfsTabsPanel]`, hosts Aria `TabPanel` | A directive, not a Wrapper component: Aria's panel works without a template child and Tabs has no height animation (the Aria prototype; building-blocks 1.1 case 2 does not apply) |
| `.is-active` on `.tabs-title` and `.tabs-panel` | Host class bindings on `NfsTabsTitle` and `NfsTabsPanel` | State classes are bindings, never directives |
| `.vertical`, `.simple`, `.primary` | None | Variant classes the consumer writes (ADR 0010) |
| (Lazy content) | `NfsTabsLazyContent`, selector `ng-template[nfsTabsLazyContent]`, hosts Aria `TabContent` | Opt-in client-only content; the Accordion's `nfsAccordionLazyContent` counterpart |

### Hierarchy and DI shape

```
[nfsTabsGroup]                      hosts Tabs (provides TABS); provides nfsTabsGroupToken; panel registry
|-- ul[nfsTabs].tabs                hosts TabList (provides TAB_LIST); provides nfsTabsToken
|   '-- li[nfsTabsTitle].tabs-title contentChild(NfsTab) -> .is-active
|       '-- a[nfsTab]               hosts Tab; injects nfsTabsToken for the pre-hydration tab stop
'-- .tabs-content                   no directive
    '-- [nfsTabsPanel].tabs-panel   hosts TabPanel; registers with nfsTabsGroupToken
        '-- ng-template[nfsTabsLazyContent]   optional; hosts TabContent
```

- Lightweight tokens in the plugin's token file with `import type` only: `nfsTabsGroupToken` (`InjectionToken<NfsTabsGroup>`), `nfsTabsToken` (`InjectionToken<NfsTabs>`), `nfsTabsDefaultsToken` (`InjectionToken<NfsTabsDefaults>`, Shape B, injected optional). Each parent provides its token with `useExisting` (ADR 0009 naming).
- Panel registry: `NfsTabsPanel` injects `nfsTabsGroupToken` (required: Aria's `TabPanel` already requires `TABS`, so a panel outside a group fails either way) and registers in `ngOnInit`, unregistering on destroy (building-blocks 1.9 parent-owned registration). `NfsTabs` reads the registry to map a URL hash to a panel id and value. Aria's own panel map is private, so the library keeps this small list of `{id, value}` signals.
- First-tab default: `NfsTabs` queries its tabs with `contentChildren(NfsTab, {descendants: true})`, because the default must be written during the server render, where Aria's DOM-ordered collection (a `MutationObserver` started after the first render) does not run; template order equals DOM order for tabs inside one `ul`. This is the one non-validation content query, justified by the server render (building-blocks 1.9 keeps queries for validation otherwise).
- `NfsTabsTitle` reads its child tab with `contentChild(NfsTab)` (Table B's shape, proven by the prototype).
- `NfsTab` injects `nfsTabsToken` (required; Aria's `Tab` already requires `TAB_LIST`).
- Aria composition: each wrapper lists its Aria directive in `hostDirectives`, exposes only the inputs below (aliased to Foundation names), and reaches the instance with `inject()`. The wrapper's own host bindings apply after the host directive's in each change-detection pass (Angular's directive composition order), but each attribute binding writes only when its own value changes, so a wrapper binding on an attribute Aria also binds holds only when Aria's value never changes after the wrapper's last write, or equals the wrapper's whenever it changes (ADR 0034, from the [Re-run: Orbit spec, the slide's ARIA contract and the focus handoff](../issues/70-rerun-orbit-slide-contract-and-focus-handoff.md)). An override that must differ from an Aria value that can still change is not a binding. The one override here, `NfsTab`'s `tabindex`, is correct under that rule: until the tab list has an active tab, Aria's value is `-1` on every tab and does not change, so the wrapper's `0` on the selected tab stands; from the first active tab on, the wrapper computes Aria's own value (active `0`, others `-1`, exact because `focusMode` and `disabled` are not exposed), so whenever Aria's value changes it equals the wrapper's.
- Defaults token: `NfsTabsDefaults` holds only the options the library owns (`deepLink`, `deepLinkSmudge`, `deepLinkSmudgeOffset`, `updateHistory`, `autoFocus`). A wrapper cannot change the default of an Aria `input()` (the Aria prototype, case 4), so `wrapOnKeys`, `selectionMode`, and `orientation` keep Aria's defaults, which equal Foundation's where Foundation has the option.
- Entry point: `ngx-foundation-sites/tabs`, importing the Breakpoint service from `ngx-foundation-sites/media-query` for `reducedMotion`.

### API

All six are standalone directives with no template; the plugin has no component.

`NfsTabsGroup`, selector `[nfsTabsGroup]`, `exportAs: 'nfsTabsGroup'`. No inputs, outputs, or public methods. Its registration methods are internal (Aria's `_register` convention) and not documented API.

`NfsTabs`, selector `ul[nfsTabs]`, `exportAs: 'nfsTabs'`:

```ts
class NfsTabs {
  // exposed from Aria TabList through hostDirectives
  selected: ModelSignal<string | undefined>;         // alias of TabList.selectedTab; [(selected)]
  selectionMode: InputSignal<'follow' | 'explicit'>; // default 'follow'
  wrapOnKeys: InputSignal<boolean>;                  // alias of TabList.wrap; default true
  orientation: InputSignal<'horizontal' | 'vertical'>; // default 'horizontal'
  // owned by the library
  readonly deepLink: InputSignalWithTransform<boolean, unknown>;          // default false
  readonly deepLinkSmudge: InputSignalWithTransform<boolean, unknown>;    // default false
  readonly deepLinkSmudgeOffset: InputSignalWithTransform<number, unknown>; // default 0 (px)
  readonly updateHistory: InputSignalWithTransform<boolean, unknown>;     // default false
  readonly autoFocus: InputSignalWithTransform<boolean, unknown>;         // default false
  readonly selectionChange: OutputEmitterRef<NfsTabChange>;
  readonly deepLinked: OutputEmitterRef<NfsTabChange>;
}

interface NfsTabChange {
  readonly value: string;  // the selected tab's value
  readonly tab: NfsTab;    // the selected tab
}
```

| Input or model | Type | Default | Foundation | Kind | Delta |
| --- | --- | --- | --- | --- | --- |
| `selected` | `string \| undefined` (a tab value) | first tab's value when unbound | `.is-active` in markup, `selectTab()` | `model()` (Aria's `selectedTab`, aliased) | By value, not index or id |
| `selectionMode` | `'follow' \| 'explicit'` | `'follow'` | None (always automatic) | Aria `input()` | New: manual activation per the APG |
| `wrapOnKeys` | boolean | `true` | `data-wrap-on-keys` | Aria `input()` (`wrap`) | None |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Implied by `.vertical` | Aria `input()` | New: drives `aria-orientation` and the arrow axis |
| `deepLink` | boolean | `false` | `data-deep-link` | `input()`, `booleanAttribute` | Hash names the panel `id` (Foundation's contract); needs consumer ids |
| `deepLinkSmudge` | boolean | `false` | `data-deep-link-smudge` | `input()`, `booleanAttribute` | Browser smooth scroll; instant under reduced motion |
| `deepLinkSmudgeOffset` | number (px) | `0` | `data-deep-link-smudge-offset` | `input()`, `numberAttribute` | Applied as `scroll-margin-top` on the strip |
| `updateHistory` | boolean | `false` | `data-update-history` | `input()`, `booleanAttribute` | `history.state` preserved |
| `autoFocus` | boolean | `false` | `data-auto-focus` | `input()`, `booleanAttribute` | Runs in the first render callback, not on window load |

Library-owned inputs read their default from `nfsTabsDefaultsToken` when provided, else Foundation's.

| Output | Payload | Foundation event | When |
| --- | --- | --- | --- |
| `selectedChange` | `string \| undefined` | `change.zf.tabs` (value half) | The `selected` model's output, for two-way binding: whenever the model changes, including user selection (after Aria writes the model back in its render callback), a deep link, a programmatic write, and once when the first-tab default is written into an unbound model |
| `selectionChange` | `NfsTabChange` (`{value, tab}`) | `change.zf.tabs` `[$tabLi, $panel]` | The container-level aggregate output (building-blocks 1.4, Material's two-tier `selectedIndexChange` plus `selectedTabChange`): after the selection moved from one tab to another on the client, by user, deep link, or model write; not for the first-tab default and never during the server render, matching Foundation, which fires `change.zf.tabs` only on a change |
| `deepLinked` | `NfsTabChange` | `deeplink.zf.tabs` `[$link, $anchor]` | After a hash (at first render or on `hashchange`) selected a tab of this group, also when that tab was already selected |

- Selection by value: a `value` is a string unique within the tab list (Aria warns on duplicates in dev mode). A value that names no tab leaves no tab selected until the next content check writes the first tab again.
- First-tab default: at content init and after every content check, while `selected` is `undefined` and at least one tab exists, `NfsTabs` writes the first tab's value into the model (the prototype's server-side write, extended to tabs that `@for` renders later). There is no deliberate "no tab selected" state, because the APG requires a rendered panel for the selected tab and `activeCollapse` is dropped.
- `selectionChange`: an `afterRenderEffect` reads the model; its first run records the value without emitting, and every later run whose value differs from the recorded one emits `{value, tab}` with the `NfsTab` of that value, then records it. It never runs on the server, so server rendering emits nothing; a model change back to `undefined` emits nothing until the first-tab default selects again.
- Deep linking (only when `deepLink` is true; all of it after the first render, never on the server):
  1. In the first render callback, and on every `hashchange` (a `window` listener added in an `afterRenderEffect` keyed on `deepLink`, removed in its cleanup and on destroy), the hash without `#` is looked up among the group's registered panel ids. A match writes that panel's value into `selected`, emits `deepLinked`, and, with `deepLinkSmudge`, scrolls the strip into view. No match leaves the tab set alone (Foundation's "not own anchor" rule).
  2. A `hashchange` to an empty hash restores the value that was selected when the first render finished (Foundation's `_initialAnchor`).
  3. When the model changes for any other reason, the directive writes `location.pathname + location.search + '#' + <panel id>` with `history.replaceState(history.state, '', url)`, or `pushState` with `updateHistory`. The current `history.state` object is passed through so the Router's own bookkeeping in it survives. A change caused by the hash itself writes nothing (Foundation's `historyHandled`). The first-tab default writes nothing.
  4. Panel ids must be consumer-supplied; a panel whose id is generated (it starts with Aria's `ng-tabpanel-` prefix) triggers a dev-mode warning while `deepLink` is on.
- Smudge and focus: `deepLinkSmudge` calls `scrollIntoView({block: 'start', behavior})` on the strip, and `autoFocus` does the same in the first render callback and then focuses the selected tab with `focus({preventScroll: true})`; `behavior` is `'instant'` while the Breakpoint service's `reducedMotion()` is true and `'smooth'` otherwise. `deepLinkSmudgeOffset` is bound as `[style.scroll-margin-top.px]` on the strip (null when 0), so both scrolls and every browser-initiated scroll to the strip respect it.
- Replay guard: a `keydown` host listener on the strip calls `stopPropagation()` for the keys Aria's tab list handles on this orientation (Left and Right, or Up and Down; Home, End, Enter, Space) when no modifier key is held. It changes no state and never calls `preventDefault()`. It exists because a replayed key throws in Aria's trailing `preventDefault()` and skips Aria's `stopPropagation()`, so an enclosing Aria widget (an accordion around the tab set) would handle the same key again (the Aria prototype, cases 24 and 25). Live keys are unaffected: Aria has already stopped them.
- Dev-mode checks (one `afterRenderEffect`, only when `ngDevMode` is on, each warning once per instance): the strip has neither `aria-label` nor `aria-labelledby`; the static `class` contains `vertical` while `orientation` is `'horizontal'`, or the reverse; a generated panel id while `deepLink` is on.
- Methods: none. `selected` is the programmatic API; Foundation's `selectTab()` becomes a model write.

`NfsTabsTitle`, selector `li[nfsTabsTitle]`, no `exportAs`. Host: `role="presentation"` and `[class.is-active]` from its child tab's `selected()`. No inputs or outputs.

`NfsTab`, selector `a[nfsTab]`, `exportAs: 'nfsTab'`:

```ts
class NfsTab {
  value: InputSignal<string>;  // Aria Tab.value, required
  id: InputSignal<string>;     // Aria Tab.id, generated 'ng-tab-...' unless written
  readonly selected: Signal<boolean>; // Aria Tab.selected
}
```

- Pre-hydration tab stop: `NfsTab` binds `[attr.tabindex]` itself, overriding Aria's binding on the same attribute. The value equals Aria's (roving: `0` on the active tab, `-1` on the others) once the tab list has an active tab; before that, which is the whole server render and the time before hydration, the selected tab gets `0`. Aria sets its first active tab only in a render callback, so without this binding every tab is `tabindex="-1"` in server HTML and the tab strip cannot be reached by the Tab key until hydration (the Aria prototype, case 10). The rule is exact because `focusMode` and `disabled` are not exposed (roving focus, no disabled tabs), so Aria's value is always "active ? 0 : -1".
- No `href`: a tab carries no `href`. Aria's click handling does not cancel navigation, so an `href="#panel2"` would jump and change the hash behind `deepLink`'s back. Dev mode warns on an `href`, and on a tab whose parent element is not an `li[nfsTabsTitle]` (an `li` without `role="presentation"` inside a `tablist` breaks the required-children rule).
- `disabled` is not exposed: Foundation's Sass has no disabled-tab look.

`NfsTabsPanel`, selector `[nfsTabsPanel]`, `exportAs: 'nfsTabsPanel'`:

```ts
class NfsTabsPanel {
  value: InputSignal<string>;          // Aria TabPanel.value, required
  id: InputSignal<string>;             // Aria TabPanel.id, generated 'ng-tabpanel-...' unless written
  preserveContent: ModelSignal<boolean>; // Aria, default false; only affects nfsTabsLazyContent
  readonly visible: Signal<boolean>;   // Aria TabPanel.visible
}
```

Host: `[class.is-active]` from `visible()`. Aria adds `role`, `id`, `tabindex`, `inert`, `aria-labelledby`.

`NfsTabsLazyContent`, selector `ng-template[nfsTabsLazyContent]`, no inputs. Its view is created when the panel becomes visible and destroyed when hidden unless `preserveContent` is true (Aria's `DeferredContent`, created in a render callback: never in server HTML).

`NfsTabsDefaults`:

```ts
interface NfsTabsDefaults {
  deepLink?: boolean;
  deepLinkSmudge?: boolean;
  deepLinkSmudgeOffset?: number;
  updateHistory?: boolean;
  autoFocus?: boolean;
}
```

### Implementation level and primitives

Implementation level: `@angular/aria/tabs`. Native platform first: HTML has no tabs element; `<details name>` (exclusive disclosure groups) is outside the Browser target and would give disclosure semantics, not tab semantics. Aria's tabs pattern is a direct match for Foundation's markup (Aria inventory 3.4), stable in 22.2, and the Aria prototype proved the host-directive wrappers under Foundation markup with projected content, server rendering, hydration, and replay in Chromium, Firefox, and WebKit. CDK has no tabs primitive; Material's tab group renders its own markup.

Primitives: Aria `Tabs`, `TabList`, `Tab`, `TabPanel`, `TabContent` through `hostDirectives`; `model()` exposure, `input()` with `booleanAttribute` and `numberAttribute`, `computed()` for the tab stop and the classes, `contentChildren`/`contentChild`, `afterNextRender` and `afterRenderEffect` for hash reads, listeners, history writes, scrolling, focus, and dev checks; the History API; `scrollIntoView`; `NfsMediaQuery.reducedMotion()`; `DOCUMENT`; `DestroyRef`. No timers, no observers of its own, no `NgZone`.

Render hooks and lazy loading (building-blocks 1.5 and 1.9): the first-render hash read and `autoFocus` run in the first render callback (`afterNextRender`); the `hashchange` listener, the history writes, `selectionChange`, and the development checks run in `afterRenderEffect`s keyed on their signals, so none of them runs on the server. `afterEveryRender` is not needed: each `afterRenderEffect` re-runs on its signals. No render callback acts on a breakpoint-driven render, so the rendered-state rule of 1.5 does not apply. `injectAsync` is not used: the tab set is live at hydration so a replayed click or key finds Aria's listeners, the only service it injects is the Breakpoint service, read in the first render callback for the `autoFocus` and smudge scrolls, and the entry point is its own, so a consumer's `@defer` splits it.

Fallback: none needed. Composition is proven; if a future Aria release breaks it, the fallback is the one building-blocks names for Aria-hosted plugins, custom ARIA and keys over the same markup, costed in the Aria prototype ticket.

### Comparison with Angular Material

| Concern | Material `mat-tab-group` / `mat-tab-nav-bar` | Tabs |
| --- | --- | --- |
| Shape | Components that render the tab list from `mat-tab` content holders | Directives on the consumer's Foundation markup |
| Selection | `selectedIndex` plus `selectedIndexChange`; clamped each check | `selected` model by value (Aria); first-tab default |
| Change event | `selectedIndexChange` plus `selectedTabChange: MatTabChangeEvent {index, tab}`; `focusChange` | `selectedChange` (the model's value) plus `selectionChange: NfsTabChange {value, tab}`; no focus event (Aria's `data-active` and `:focus` cover focus) |
| Activation | Selection on Enter/Space, focus moves with arrows | `selectionMode`: `'follow'` (APG automatic, default) or `'explicit'` |
| Focus | `FocusKeyManager`, roving `tabindex` from last focused or selected | Aria roving `tabindex`, plus the server-side tab stop on the selected tab |
| Lazy content | `matTabContent` template, `preserveContent` | `nfsTabsLazyContent` template, `preserveContent` |
| Labels | `label` input, `mat-tab-label` template | The anchor's own content |
| Names | `aria-label`, `aria-labelledby` inputs on the group | Native attributes on the `ul`, which the consumer owns |
| Nav bar | `mat-tab-nav-bar` with `mat-tab-link` links; tablist roles only when `tabPanel` is set, else `aria-current="page"` | Links in Foundation's tabs markup with no directive and `aria-current="page"`; one Library mixin rule gives the current link the selected look |
| Visual options | `animationDuration`, pagination, ink bar, `stretchTabs`, `alignTabs`, `headerPosition`, `dynamicHeight`, colours | None; Foundation's Sass settings and Variant classes |
| Disabled tabs | `disabled` on `mat-tab` | Not offered (no Foundation look) |

Borrowed: `preserveContent` with a lazy template, the two-tier change outputs (with a value instead of an index), the automatic/explicit split (through Aria), the nav bar's `aria-current` role split. Not borrowed: index selection, `focusChange`, pagination and ink bar, animation duration, disabled tabs, label templates.

### ARIA and keyboard

APG pattern: Tabs, automatic activation by default (the APG recommends it when panels display without noticeable latency), manual activation with `selectionMode="explicit"`.

| Element | Role and attributes | Source |
| --- | --- | --- |
| `ul.tabs` | `role="tablist"`, `aria-orientation`, `tabindex="-1"` (roving mode), `aria-disabled="false"`; name from the consumer's `aria-label` or `aria-labelledby` (dev warning when absent) | Aria `TabList`; consumer |
| `li.tabs-title` | `role="presentation"` | `NfsTabsTitle` (APG hiding-semantics practice, Foundation's own markup) |
| `a` | `role="tab"`, `id`, `tabindex` `0`/`-1`, `aria-selected`, `aria-controls` (panel id), `aria-disabled="false"`, `data-active` | Aria `Tab`; `tabindex` from `NfsTab` |
| `.tabs-panel` | `role="tabpanel"`, `id`, `aria-labelledby` (tab id), `tabindex="0"` when shown and `-1` when hidden, `inert` when hidden | Aria `TabPanel` |
| Nav bar link (no directive) | Native link; `aria-current="page"` on the current one; no tab roles | Consumer or `RouterLinkActive` |

`aria-hidden` is never set; `inert` removes hidden panels from focus and the accessibility tree, and Foundation's `.tabs-panel { display: none }` hides them visually.

| Key | Horizontal | Vertical | Owner |
| --- | --- | --- | --- |
| Tab | Into the strip: the selected tab (or the last active one); out: the shown panel (`tabindex="0"`), then its content | Same | Browser, roving `tabindex` |
| Right Arrow | Next tab, wrapping unless `wrapOnKeys` is false; selects it in `follow` mode; previous tab in right-to-left pages | Not handled | Aria |
| Left Arrow | Previous tab; next in right-to-left pages | Not handled | Aria |
| Down Arrow | Not handled (page scrolls) | Next tab | Aria |
| Up Arrow | Not handled (page scrolls) | Previous tab | Aria |
| Home, End | First, last tab (selects in `follow` mode) | Same | Aria |
| Enter, Space | Selects the focused tab (`explicit` mode; already selected in `follow` mode) | Same | Aria |
| Click | Selects the clicked tab in both modes | Same | Aria |

Deltas from Foundation: Up and Down no longer act on horizontal strips; Home and End are added; arrows flip in right-to-left pages (`Directionality`); vertical strips get `aria-orientation`.

Known deviation (decided; the [Spec: Orbit](../issues/33-spec-orbit.md) triage, applied here by the [Consistency review and bundle index](../issues/36-consistency-review.md)): once the user has operated the strip, a selection change from outside Aria (a bound `selected` write, a deep link applied on `hashchange`) leaves Aria's roving tab stop on the last tab the user operated, so Tab enters the strip there rather than on the selected tab. Aria's `TabList` stops realigning its active item with the selection after the first interaction and has no public API to move it, and the library uses no underscore members. `NfsTab`'s `tabindex` binding equals Aria's whenever Aria has an active item, so it never fights Aria. Asking angular/components for a public way to move the active item stays human-only (the Orbit spec's OPEN FOR HUMAN 1).

WCAG 2.2 AA, per criterion:

| Criterion | How it is met |
| --- | --- |
| 1.3.1 Info and Relationships | `tablist`/`tab`/`tabpanel` roles, `aria-controls` and `aria-labelledby` as bindings; `role="presentation"` on the `li` |
| 1.4.3 Contrast (Minimum) | Foundation's defaults give the selected and focused tab 3.76:1. Required settings: `$tab-background-active: $primary-color; $tab-active-color: $white;`, giving 4.65:1 for selected and focused tabs; inactive tabs are 4.65:1 (`$tab-color` on `$tab-background`) and hovered ones 5.92:1 under Foundation's defaults. Computed with Dart Sass from Foundation 6.9's settings; the story gate enforces it with axe `color-contrast` |
| 1.4.11 Non-text Contrast | The selected look is its background; with the required settings it is 4.65:1 against the neighbouring unselected tabs (1.24:1 under Foundation's defaults). A story play function asserts at least 3:1 between the computed backgrounds of a selected and an unselected tab, since axe has no rule for state indicators |
| 2.1.1 Keyboard | Aria's key table; the selected tab is a tab stop in server HTML (`NfsTab`'s binding), and keys pressed before hydration replay |
| 2.4.3 Focus Order | One tab stop for the strip, then the shown panel |
| 2.4.7 Focus Visible | Foundation's `.tabs-title > a:focus` background plus the browser's focus outline, which the library never removes (Foundation's `disable-mouse-outline` only acts on what-input's mouse state, which the library does not install) |
| 2.4.11 Focus Not Obscured (Minimum) | Tabs are in page flow and the library overlays nothing; `deepLinkSmudgeOffset` sets `scroll-margin-top` so focus and deep-link scrolls clear a sticky header; consumers with sticky headers set it or `scroll-padding-top` |
| 2.5.8 Target Size (Minimum) | Foundation's default title padding (`1.25rem 1.5rem` around 12 px text) gives about 52 px height; `.tabs.simple` removes the padding and passes only through the spacing exception with titles at least 24 px wide; axe `target-size` is in the gate |
| 4.1.2 Name, Role, Value | Roles from Aria; name of the tab from its content, of the panel from its tab, of the list from the consumer's attribute (dev warning when missing); `aria-selected` as the value |
| 3.2.1 On Focus | Automatic activation shows a panel on focus, which the APG does not count as a change of context; `explicit` mode for panels that load slowly |

`.tabs.primary` is not covered by the required settings: its links take `color-pick-contrast($primary-color)`, and with `$tab-background-active: $primary-color` the selected tab matches the bar. A consumer who uses `.primary` chooses a `$tab-background-active` with 3:1 against `$primary-color` and 4.5:1 under white text (for example `$black`) and checks it with their own axe run.

Focus rules: the directives move focus only for `autoFocus` (once, in the first render callback) and through Aria's arrow-key navigation. Focus never moves on selection by click, model write, or deep link.

### Rendered HTML

Consumer markup:

```html
<div nfsTabsGroup>
  <ul nfsTabs class="tabs" aria-label="Product details" deepLink>
    <li nfsTabsTitle class="tabs-title"><a nfsTab value="description">Description</a></li>
    <li nfsTabsTitle class="tabs-title"><a nfsTab value="reviews">Reviews</a></li>
  </ul>
  <div class="tabs-content">
    <div nfsTabsPanel class="tabs-panel" value="description" id="description"><p>...</p></div>
    <div nfsTabsPanel class="tabs-panel" value="reviews" id="reviews"><p>...</p></div>
  </div>
</div>
```

Server HTML (static selector and input attributes such as `nfstabs=""` and `value="..."` are rendered as written and omitted here; tab ids are generated and differ from the client's):

```html
<div>
  <ul class="tabs" aria-label="Product details" role="tablist" tabindex="-1"
      aria-disabled="false" aria-orientation="horizontal" jsaction="keydown:;click:;focusin:;">
    <li class="tabs-title is-active" role="presentation">
      <a role="tab" data-active="false" id="ng-tab-x1-0" tabindex="0" aria-selected="true"
         aria-disabled="false" aria-controls="description">Description</a>
    </li>
    <li class="tabs-title" role="presentation">
      <a role="tab" data-active="false" id="ng-tab-x1-1" tabindex="-1" aria-selected="false"
         aria-disabled="false" aria-controls="reviews">Reviews</a>
    </li>
  </ul>
  <div class="tabs-content">
    <div class="tabs-panel is-active" role="tabpanel" id="description" tabindex="0"
         aria-labelledby="ng-tab-x1-0"><p>...</p></div>
    <div class="tabs-panel" role="tabpanel" id="reviews" tabindex="-1" inert="true"
         aria-labelledby="ng-tab-x1-1"><p>...</p></div>
  </div>
</div>
```

Hydrated, before any interaction: identical except that `jsaction` is gone, tab ids and `aria-labelledby` carry the client's generated ids, and the selected tab has `data-active="true"` (Aria's default active tab). With `#reviews` in the URL and `deepLink` on, the first render callback then selects Reviews: `.is-active`, `aria-selected`, `tabindex`, and `inert` move, and the hash stays. After ArrowRight in `follow` mode from Description, the same move happens and the hash becomes `#reviews` through `replaceState`.

Vertical tabs in Foundation's grid layout, with the grid row as the group:

```html
<div class="grid-x" nfsTabsGroup>
  <div class="cell medium-3">
    <ul nfsTabs class="vertical tabs" orientation="vertical" aria-label="Settings">...</ul>
  </div>
  <div class="cell medium-9">
    <div class="tabs-content vertical">...</div>
  </div>
</div>
<!-- the ul renders aria-orientation="vertical"; Up and Down move between tabs -->
```

Lazy content:

```html
<div nfsTabsPanel class="tabs-panel" value="stats" preserveContent>
  <ng-template nfsTabsLazyContent><app-stats-chart /></ng-template>
</div>
<!-- server HTML: <div class="tabs-panel" role="tabpanel" ...></div> with no content, even when selected -->
```

Nav bar (no library directive):

```html
<nav aria-label="Account">
  <ul class="tabs">
    <li class="tabs-title" routerLinkActive="is-active">
      <a routerLink="/account/profile" ariaCurrentWhenActive="page">Profile</a>
    </li>
    <li class="tabs-title" routerLinkActive="is-active">
      <a routerLink="/account/billing" ariaCurrentWhenActive="page">Billing</a>
    </li>
  </ul>
</nav>
<!-- current link: <a href="/account/profile" aria-current="page">; styled by the nfs-tabs rule -->
```

### Animation

None added and none awaited. Panel visibility is Foundation's `display: none` / `.is-active { display: block }`, so a switch is instant; Foundation's `.tabs-content { transition: all 0.5s ease }` is kept unchanged and animates no size change (the content box's height is automatic). There is no Completion output: `selectedChange` and `selectionChange` fire on the model change, which is also when the State classes move. No `animate.enter`/`animate.leave` (panels persist; the Aria prototype and the `animate.enter` at hydration prototype rule them out for persistent elements), no Motion classes, and therefore no `prefers-reduced-motion` override; reduced motion affects only `deepLinkSmudge` and `autoFocus` scrolling, which become instant. Lazy content views appear without animation.

### Rendering modes

Per ADR 0008 and the rendering-modes research rules 1 to 11:

- Server render and first paint: every visible state is a host binding on signals that exist on the server: `aria-selected`, `.is-active` on title and panel, `inert` and `tabindex` on panels, the tab stop on the selected tab, `role="presentation"`, and the first-tab default written into Aria's model during content init. The selected panel's projected content is in the HTML; Foundation's CSS shows it and hides the others. No template branches on the platform.
- Before hydration: nothing outside host bindings. The hash is not read, no listener is added, nothing scrolls or focuses, and history is untouched; all of that runs in `afterNextRender`/`afterRenderEffect`, which never run on the server. Pointer clicks on titles do nothing natively (no `href`); the Tab key reaches the selected tab; the selected panel is readable.
- Full hydration: host binding values equal the server's except generated ids (rewritten, because `aria-controls` and `aria-labelledby` are bindings) and Aria's `data-active`, so there is no flash and no structural difference. The prototype measured a clean hydration with no NG05xx.
- Event replay: Aria's tab list declares `click`, `keydown`, and `focusin` host listeners on the strip, so the `ul` carries `jsaction="keydown:;click:;focusin:;"`. A click on a title before hydration bubbles to the strip, is queued, and replays after hydration: the tab is selected with no error, because Aria's click handling calls no `preventDefault()`. A key before hydration replays too: state changes as for a live key, then Aria's trailing `preventDefault()` throws and Angular's `ErrorHandler` logs ``ERROR Error: `preventDefault` called during event replay.`` once per replayed key; the library accepts that log (decided in the ticket's triage, building-blocks Part 4, Decided item 3). The replay guard keeps the replayed key from reaching an enclosing Aria widget. The library's own handler (the guard) never calls `preventDefault()`. `hashchange` is a `window` listener and does not replay, which is correct: the hash is read at the first render callback anyway.
- Deep links apply after hydration (the server never sees the fragment), so a page opened with `#reviews` paints Description first and switches once hydrated. Server-correct deep links need state the server can see: bind `selected` from a query parameter (Further Notes, Router recipe).
- Hydration boundary: the group, the strip, its tabs, and every panel belong to one hydration boundary. A panel inside a separate dehydrated block has not registered, so its tab loses `aria-controls` at hydration and its content cannot be selected until that block hydrates. A consumer `@defer` wraps the whole tab set, never part of it.
- `@defer`: library templates contain no `@defer`. Inside `@defer (hydrate on interaction)` the tab set is its server HTML; the first click or key on the strip hydrates the block and replays (the click cleanly, the key with the logged error). `hydrate on viewport` and the other triggers behave the same once fired. Inside `@defer (hydrate never)` the tab set stays its server HTML: the selected panel is readable and reachable, and the other panels stay hidden and unreachable, so tabs belong there only when the first panel is all that matters. Plain `@defer` without hydrate triggers renders the tab set on the client, where the first-tab default and deep links run as in a client render.
- Lazy content (`nfsTabsLazyContent`) is created in a render callback, so it is empty in server HTML even for the selected panel and appears after hydration; the consumer chooses it knowingly. A consumer `@defer (on viewport)` or `@defer (when panel.visible())` inside a panel loads code; on the server it renders its `@placeholder`.
- Prerendering: identical to server rendering; no request token is read.
- Zoneless: all state is signals; nothing needs `NgZone`.

### Sass and custom CSS

The tabs pattern needs no library CSS: Foundation's `.tabs-panel.is-active` shows the panel and `.tabs-title > a[aria-selected='true']` styles the selected tab, both driven by host bindings (the Aria prototype). The `nfs-tabs` Library mixin carries one rule, for the nav bar only, because a link must not carry `aria-selected`. Contrast is fixed with Foundation settings, never with library CSS. The Sass subsection under Further Notes gives the required content.

## Testing Decisions

A good test asserts what a user or assistive technology observes: roles, `aria-selected`, `aria-controls`, `aria-orientation`, `tabindex`, `inert`, `.is-active`, which panel is visible, where focus lands, the URL, and scroll position. No test reads private fields or Aria's pattern objects. Prior art: the Aria prototype's Playwright suite (server HTML, hydration, replay) and the Triggers spec's four layers; nothing exists in the new repository yet. Where Aria is hosted, Aria's own tabs harness may be used in browser-level tests; no custom harness is written.

Story ids follow `tabs--<story>`: `tabs--default`, `tabs--bound-selection`, `tabs--explicit-selection`, `tabs--vertical`, `tabs--no-wrap`, `tabs--rtl`, `tabs--dynamic-tabs`, `tabs--deep-link`, `tabs--lazy-content`, `tabs--equal-heights`, `tabs--nav-bar`. The library's Storybook compiles Foundation with the required tab settings (`$tab-background-active: $primary-color; $tab-active-color: $white;`).

### 1. Story play function

Stack: `@storybook/angular-vite` 10.6 with `@storybook/addon-vitest` on Vitest 4.1 browser mode, Playwright Chromium headless; inferred `test-storybook`: `npx nx test-storybook <lib>`. Axe: `@storybook/addon-a11y`, `parameters.a11y.test = 'error'`, `parameters.a11y.options.runOnly = {type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']}` in the Storybook preview configuration, the enforcing gate, so `color-contrast` and `target-size` are part of it. CSR only; the single home of interaction tests.

- `tabs--default`: unbound tab set; the first tab has `aria-selected="true"`, its `li` and panel `.is-active`, the other panel `inert`; clicking the second tab moves all of it; the tab list has a name; the panel's name is its tab's text; the computed backgrounds of the selected and an unselected tab differ by at least 3:1 (1.4.11 check); pressing Tab from before the strip focuses the selected tab and the focused tab's background changes (2.4.7 check).
- `tabs--bound-selection`: `[(selected)]` shown in the story; clicking updates it; a button that sets it to the third value selects the third tab; the story lists `selectedChange` values and `selectionChange` events, and the first paint produces no `selectionChange`.
- `tabs--explicit-selection`: `selectionMode="explicit"`; ArrowRight moves focus without changing `aria-selected`; Enter then Space select.
- `tabs--vertical`: `.vertical` plus `orientation="vertical"` in Foundation's grid; `aria-orientation="vertical"`; ArrowDown and ArrowUp move and select; ArrowRight does nothing.
- `tabs--no-wrap`: `wrapOnKeys="false"`; ArrowRight on the last tab keeps it; with wrapping (the default story) it moves to the first.
- `tabs--rtl`: `dir="rtl"`; ArrowLeft selects the next tab.
- `tabs--dynamic-tabs`: tabs from `@for` over a signal that fills after a delay; once filled, the first tab is selected; removing the selected tab selects the first remaining one.
- `tabs--deep-link`: `deepLink` with consumer ids; clicking a tab sets the iframe's `location.hash` to the panel id (asserted inside the story's own document).
- `tabs--lazy-content`: a panel with `nfsTabsLazyContent` renders its content only when selected; with `preserveContent` it stays after switching away, without it it is removed.
- `tabs--equal-heights`: the documented grid recipe; every panel box has the tallest panel's height and hidden panels stay `inert`.
- `tabs--nav-bar`: links with `aria-current="page"` on one; no `tablist` role; the current link's computed background equals the selected-tab background from the settings.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

Vitest browser mode under the Angular unit-test builder (`npx nx test <lib>`, Chromium headless): TestBed specs in `<name>.spec.ts` next to the directive, over a bare test host component, zoneless with `await fixture.whenStable()`, asserting DOM and ARIA state; no story is mounted here and no axe runs here. Stack detail (per the [Decide the browser testing stack: Playwright component tests, Vitest Browser, or both](../issues/41-browser-testing-stack-decision.md) answer): `@angular/build:unit-test` through `@nx/angular:unit-test`, `"browsers": ["chromiumHeadless"]` in the target options.

- Composition: each wrapper exposes exactly the listed inputs; `#t="nfsTabs"`, `#a="nfsTab"`, `#p="nfsTabsPanel"` resolve; `NfsTab.selected()` and `NfsTabsPanel.visible()` follow selection.
- First-tab default: unbound writes the first value, emits `selectedChange` once, and emits no `selectionChange`; each later change emits one `selectionChange` whose `tab` is the selected `NfsTab`; a deep link emits `deepLinked` with the same shape; a bound initial value wins; tabs arriving later through `@for` get the default; an unknown value falls back to the first tab after the next check.
- Tab stop rule, driven by data: before Aria's default state (asserted in a host whose tab list has not rendered its first callback yet, or through the SSR smoke) the selected tab is `0`; after it, Aria's active tab is `0` and the rest `-1`, after arrow navigation too; in `explicit` mode the focused, unselected tab holds the stop.
- Deep linking with a real `location`: an initial hash naming a panel selects it and emits `deepLinked`; a hash naming an element outside the group changes nothing; `hashchange` selects; an empty hash restores the initial value; a user selection calls `replaceState` (or `pushState` with `updateHistory`) with the existing `history.state` object and the panel id; a hash-driven selection and the first-tab default write no history; turning `deepLink` off removes the listener.
- Smudge and focus: with `deepLinkSmudge`, `scrollIntoView` is called on the strip with `behavior: 'smooth'`, and `'instant'` under a reduced-motion fake of the Breakpoint service; `autoFocus` focuses the selected tab with `preventScroll`; `deepLinkSmudgeOffset` renders `scroll-margin-top` and 0 renders none.
- Defaults token: library-owned defaults apply when the attribute is absent and are overridden by it.
- Replay guard: inside an outer element with a `keydown` spy, dispatch a `keydown` for ArrowRight, Home, and Enter whose `eventPhase` reads 101 and whose `preventDefault` throws; the tab selection changes, the outer spy is not called, and a vertical strip lets horizontal arrows through while stopping vertical ones; a key with a modifier is not stopped.
- RTL: a `Directionality` double set to `rtl` flips the arrows.
- Dev-mode warnings: each fires once for its case (`href` on a tab, a tab outside `li[nfsTabsTitle]`, no list name, `.vertical` against `orientation`, a generated panel id under `deepLink`) and not for correct markup.
- `DeferBlockBehavior.Manual`: a panel's consumer `@defer (when p.visible())` stays in its placeholder until the tab is selected.

### 3. Node-level Vitest

Stack: the same `test` target and run; `renderApplication` through the shared `renderServer()` helper (providers built inside the bootstrap callback); `npx nx test <lib>`, SSR specs and pure-logic specs. Fallback `test-node` (`npx nx test-node <lib>`) only if a server path depends on the DOM adapter, which none here does.

- SSR smoke (`renderApplication` through the shared `renderServer()` helper): a bound tab set, an unbound one, a vertical one, one with `deepLink` and consumer ids, and one with a lazy panel selected. Assert `whenStable()` resolves; the server HTML matches the Rendered HTML section: `role="tablist"` with `aria-orientation`, `role="presentation"` on titles, `tabindex="0"` on exactly the selected tab and `-1` on the others, `aria-selected`, `.is-active` on the selected title and panel, `inert` on hidden panels, projected content in the selected panel, an empty lazy panel, `jsaction="keydown:;click:;focusin:;"` on each strip, no `data-active="true"`, no `scroll-margin-top` unless an offset is set, and the deep-link tab set still showing its first-tab default (no hash on the server).
- Deferred fixture: a tab set inside `@defer (hydrate on interaction)` renders its main content with `ngb` on the block and `jsaction` including `click` and `keydown` on the block root.
- Pure logic, table-driven: the tab stop function (selected, active, list has active), the hash-to-value lookup (empty hash, `#` only, unknown id, own id), and the replay guard's key set per orientation.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Storybook half: `@playwright/test` 1.63, Chromium, Firefox, WebKit projects; `mount(storyId, props?)` over `iframe.html?embed=true` of the static build; `npx nx e2e <lib>-e2e` (webServer `npx nx run <lib>:static-storybook`). Axe: the addon-a11y report (same rule set) through `storyFinished` rejects `mount()`; `@axe-core/playwright` with `withTags` on the same six tags for states no play function reaches. Play functions are not re-run.

- `tabs--default`: real Tab, ArrowRight, ArrowLeft, Home, End presses; ArrowDown on a horizontal strip scrolls the page instead of changing tabs.
- `tabs--vertical` and `tabs--rtl`: the arrow axis and direction with real keys.
- `tabs--deep-link` through the public `iframe.html?id=tabs--deep-link` URL with a hash: loading with `#reviews` selects Reviews after hydration; clicking tabs rewrites the hash; with `updateHistory`, Back and Forward restore the previous tabs through `hashchange`; `deepLinkSmudge` with an offset leaves the strip's top at the offset below the viewport top; under `emulateMedia({reducedMotion: 'reduce'})` the scroll is instant.

Fixture half: the same runner against the prerendered Nx fixture app (development build, `outputMode: 'static'`, `RenderMode.Prerender`, `serve-static` on a fixed port), one tabs route; `npx nx e2e <fixture-app>-e2e` (webServer `npx nx run <fixture-app>:serve-static`); `@axe-core/playwright` with `withTags` on the same six tags, on the JavaScript-disabled page and after hydration.

- JavaScript disabled: screenshot plus axe on the server HTML; the selected panel is visible with content; pressing Tab reaches the selected tab (2.1.1 before hydration).
- Hydration: no NG05xx and `ngDevMode.componentsSkippedHydration === 0`; no visible change between the screenshot before and after hydration.
- Pre-hydration input with the main bundle held back: a click on the second tab selects it once after hydration with no error; Tab to the selected tab then ArrowRight selects the next tab after hydration and logs exactly one ``preventDefault` called during event replay`` error (the accepted behaviour, decided in the ticket's triage); tabs inside an Accordion panel (the Accordion spec's directives): a pre-hydration ArrowRight leaves focus inside the tab strip.
- Router and deep links: a route using the Router with `deepLink` and `updateHistory`: a tab click adds a history entry; Back restores the previous tab and the Router logs no navigation error; the query-parameter recipe route renders the selected tab from `?tab=reviews` in the server HTML.
- `@defer (hydrate on interaction)`: the first click on a tab loads the chunk, hydrates, and selects.
- `@defer (hydrate never)`: the selected panel is readable, clicks change nothing, no error is logged.

## Out of Scope

- `activeCollapse` and a collapsed state with no selected tab (APG: a selected tab has a rendered panel; Accordion covers collapsing).
- `matchHeight` as code (documented grid recipe instead).
- Disabled tabs and a disabled tab list (no Foundation look; Aria's `disabled` and `softDisabled` stay unexposed).
- `focusMode="activedescendant"`: focus would stay on the `ul`, so Foundation's `:focus` look on the anchor never applies and a visible focus indicator would need library CSS.
- `button[nfsTab]`: Foundation's `tabs-title` mixin styles only `> a`, so a button would need Foundation's declarations copied ([ADR 0023](../adr/0023-tabs-anchor-tab-hosts.md)).
- A directive on `.tabs-content`.
- Closable tabs (the APG's optional Delete key), pagination and scroll buttons, ink bars, and any Material visual option.
- A nav-bar directive: links with `aria-current` need none.
- ResponsiveAccordionTabs (its own spec, which reuses this directive set) and Orbit's bullet tab list (its own spec).
- Panel switch animation (no Foundation animation exists; View Transitions are a future upgrade).

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | Five directives on Foundation markup plus the `[nfsTabsGroup]` ancestor | ADR 0001; Aria needs one ancestor for list and panels, and Foundation's strip and content are siblings | Hosting Aria `Tabs` on `.tabs-content` (does not enclose the strip); a tabs component rendering its own markup (Material's shape) |
| D2 | No directive on `.tabs-content` | It only styles once the group replaces `data-tabs-content`; the prototype needed none | `[nfsTabsContent]` (building-blocks sketch) with no behaviour |
| D3 | `[nfsTabsPanel]` is a directive | Aria's panel works without `ngTabContent`; the only effect is a dev warning a component could not silence either (the Aria prototype) | A Wrapper component |
| D4 | Tabs pair by `value`; ids only for deep links | Aria's pairing; generated ids differ across platforms; no id bookkeeping for most tab sets | Foundation's `href`/`data-tabs-target` id pairing |
| D5 | Tab host is `<a>` without `href` | Foundation's Sass styles `.tabs-title > a` and keys the selected look on `a[aria-selected]`; an `href` would navigate behind `deepLink` | `<button role="tab">` (needs Foundation's declarations copied); `<a href="#id">` (jumps and rewrites the hash) |
| D6 | `selected` is Aria's `selectedTab` model aliased, by value; first tab written when unbound | Building-blocks 1.4; the prototype's server-side write gives unbound tab sets a first paint; later tabs get it too | Index selection (Material); leaving unbound sets blank until hydration |
| D7 | Two change outputs: `selectedChange` (the model's value) and `selectionChange` (`{value, tab}`, only on a change after first paint); `deepLinked` carries the same shape | Two-way binding needs the model output; building-blocks 1.4 gives container-level outputs the item; Material's two tiers; Foundation fires `change.zf.tabs` only on a change | One value-only output (drops the item payload building-blocks 1.4 requires); Material's index |
| D8 | `selectionMode` exposed, `'follow'` default | APG recommends automatic activation; manual for slow panels; Foundation was always automatic | No manual mode |
| D9 | `focusMode`, `disabled`, `softDisabled` not exposed | Foundation's look covers neither activedescendant focus nor disabled tabs; keeps the tab-stop rule exact | Exposing Aria's full input set |
| D10 | `NfsTab` overrides `tabindex` so the selected tab is a tab stop before Aria's first render callback | WCAG 2.1.1 before hydration (the prototype's case 10); the override holds under ADR 0034's binding rule, because Aria's value is a constant `-1` until its first active tab and equals the override from then on (the Aria composition bullet) | Documenting the gap; writing Aria's private active item |
| D11 | Replay guard on the strip | A replayed key skips Aria's `stopPropagation()` and would reach an enclosing Aria widget (the prototype's cases 24 and 25) | No guard (wrong focus in nested widgets) |
| D12 | Deep links on the History API with `history.state` passed through; Router recipe for server-correct state | Foundation's contract; preserving the state keeps the Router's bookkeeping; the server never sees the fragment | Injecting the Router (a dependency most tab sets do not need); a raw `{}` state |
| D13 | `deepLinkSmudgeOffset` becomes `scroll-margin-top` | One CSS property serves smudge, `autoFocus`, and browser scrolls; helps 2.4.11 | Subtracting the offset in a manual `scrollTo` |
| D14 | `matchHeight` becomes a CSS grid recipe | No measurement, no image wait, correct on the server | Porting the measurement |
| D15 | `activeCollapse` dropped | Aria cannot collapse a selected tab; the APG requires a panel for the selected tab | A collapse emulation with every tab unselected |
| D16 | Defaults token covers only library-owned options | A wrapper cannot change an Aria input's default (the prototype's case 4) | A token that silently ignores `wrapOnKeys` and `selectionMode` |
| D17 | Required tab settings `$tab-background-active: $primary-color; $tab-active-color: $white` | 4.65:1 text and 4.65:1 state contrast; Foundation's defaults fail 1.4.3 (3.76:1) and the state indicator (1.24:1); settings, never library CSS | The text-only fix `$tab-active-color: scale-color($primary-color, $lightness: -14%)` (4.78:1 text, state indicator still 1.24:1) |
| D18 | Nav bar is plain links with `aria-current` plus one `nfs-tabs` rule | APG: navigation is links, and `aria-current` is not a substitute for `aria-selected` in a tab list; a link cannot carry `aria-selected`, which is what Foundation styles | A nav-bar directive; `aria-selected` on links |
| D19 | Lazy content through `nfsTabsLazyContent` hosting Aria's `TabContent` | Consistent with Accordion; queries match host directives, so Aria's panel finds it | Consumers importing Aria's `ngTabContent` directly |
| D20 | No animation | Foundation has none for panel switches; persistent panels cannot use `animate.enter` | Motion classes on panels |

### Usage examples

```ts
@Component({
  selector: 'app-product',
  imports: [NfsTabsGroup, NfsTabs, NfsTabsTitle, NfsTab, NfsTabsPanel, NfsTabsLazyContent],
  template: `
    <div nfsTabsGroup>
      <ul nfsTabs class="tabs" aria-label="Product details" [(selected)]="tab" deepLink deepLinkSmudge
          [deepLinkSmudgeOffset]="64" (selectionChange)="track($event)">
        <li nfsTabsTitle class="tabs-title"><a nfsTab value="description">Description</a></li>
        <li nfsTabsTitle class="tabs-title"><a nfsTab value="reviews">Reviews ({{ reviews().length }})</a></li>
        <li nfsTabsTitle class="tabs-title"><a nfsTab value="stats">Statistics</a></li>
      </ul>
      <div class="tabs-content">
        <div nfsTabsPanel class="tabs-panel" value="description" id="description">
          <p>{{ product().description }}</p>
        </div>
        <div nfsTabsPanel class="tabs-panel" value="reviews" id="reviews" #reviewsPanel="nfsTabsPanel">
          @defer (when reviewsPanel.visible()) {
            <app-review-list [reviews]="reviews()" />
          } @placeholder {
            <p>Reviews load when you open this tab.</p>
          }
        </div>
        <div nfsTabsPanel class="tabs-panel" value="stats" id="stats" preserveContent>
          <ng-template nfsTabsLazyContent><app-stats-chart /></ng-template>
        </div>
      </div>
    </div>
  `,
})
export class AppProduct {
  readonly product = input.required<Product>();
  readonly reviews = input.required<Review[]>();
  protected readonly tab = signal<string | undefined>(undefined);

  protected track(change: NfsTabChange): void {
    // analytics
  }
}
```

Vertical tabs, explicit selection, no wrapping:

```html
<div class="grid-x" nfsTabsGroup>
  <div class="cell medium-3">
    <ul nfsTabs class="vertical tabs" orientation="vertical" selectionMode="explicit"
        wrapOnKeys="false" aria-labelledby="settings-heading">
      <li nfsTabsTitle class="tabs-title"><a nfsTab value="profile">Profile</a></li>
      <li nfsTabsTitle class="tabs-title"><a nfsTab value="security">Security</a></li>
    </ul>
  </div>
  <div class="cell medium-9">
    <div class="tabs-content vertical">
      <div nfsTabsPanel class="tabs-panel" value="profile">...</div>
      <div nfsTabsPanel class="tabs-panel" value="security">...</div>
    </div>
  </div>
</div>
```

Router recipe, server-correct and Router-owned history (the component uses `withComponentInputBinding()`):

```ts
@Component({
  selector: 'app-account',
  imports: [NfsTabsGroup, NfsTabs, NfsTabsTitle, NfsTab, NfsTabsPanel],
  template: `
    <div nfsTabsGroup>
      <ul nfsTabs class="tabs" aria-label="Account" [selected]="tab()" (selectedChange)="select($event)">
        ...
      </ul>
      ...
    </div>
  `,
})
export class AppAccount {
  readonly tab = input<string | undefined>(); // bound from ?tab=
  readonly #router = inject(Router);

  protected select(value: string | undefined): void {
    this.#router.navigate([], {queryParams: {tab: value}, queryParamsHandling: 'merge', replaceUrl: true});
  }
}
```

Nav bar with Foundation's tabs look:

```html
<nav aria-label="Account">
  <ul class="tabs">
    <li class="tabs-title" routerLinkActive="is-active">
      <a routerLink="/account/profile" ariaCurrentWhenActive="page">Profile</a>
    </li>
    <li class="tabs-title" routerLinkActive="is-active">
      <a routerLink="/account/billing" ariaCurrentWhenActive="page">Billing</a>
    </li>
  </ul>
</nav>
```

Equal panel heights (`matchHeight` replacement), consumer CSS:

```css
/* Stack every panel in one grid cell so the box takes the tallest panel's height.
   Hidden panels stay inert (Aria) and invisible. */
.tabs-content.equal-heights {
  display: grid;
}

.tabs-content.equal-heights > .tabs-panel {
  display: block;
  grid-area: 1 / 1;
  visibility: hidden;
}

.tabs-content.equal-heights > .tabs-panel.is-active {
  visibility: visible;
}
```

App-wide defaults:

```ts
bootstrapApplication(App, {
  providers: [{provide: nfsTabsDefaultsToken, useValue: {deepLink: true, deepLinkSmudge: true}}],
});
```

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This plugin relies on Foundation's export mixin `foundation-tabs` (and `foundation-xy-grid-classes` or `foundation-grid` for the vertical layout). Its documented custom CSS is the `nfs-tabs` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-tabs`. (1) Rules: one, `.tabs-title > a[aria-current]:not([aria-current='false'])` with `background` and `color`, the nav bar's current link, because Foundation keys the selected look on `aria-selected`, which a link must not carry; the tabs pattern itself needs no rule. (2) Reused settings: `$tab-background-active` and `$tab-active-color`, read from the consumer's compile; no mixin parameter. Required settings for WCAG 2.2 AA, set by the consumer before Foundation's import and by the library's Storybook: `$tab-background-active: $primary-color; $tab-active-color: $white;` (4.65:1 for selected and focused text and for the selected background against unselected tabs, where Foundation's defaults give 3.76:1 and 1.24:1); `.tabs.primary` needs its own `$tab-background-active` as described under ARIA and keyboard. (3) Custom properties: none. (4) Motion classes: none; the plugin adds and awaits no animation, so there is no `prefers-reduced-motion` override. (5) What breaks when the include is missing: the nav bar's current link has no selected look; tabs are unaffected.

### Platform features to adopt when the browser target moves

- `hidden="until-found"` with the `beforematch` event: hidden panels could stay findable by find-in-page, and `beforematch` would select the matching tab. It replaces Foundation's `display: none` for hidden panels only through a documented rule, so it waits for the Browser target and a decision on that rule.
- View Transitions (same-document): an animated panel switch without JavaScript timing, keyed on the model change.
- `:has()`: `.tabs-title:has(> [aria-selected='true'])` could style the title without `NfsTabsTitle`'s class binding; the class stays the contract, so this only matters to consumer CSS.
- `<details name>` is not a replacement: it gives disclosure semantics, not tabs.

### Foundation behaviour changed or dropped

- `href="#id"` and `data-tabs-target` pairing becomes `value` pairing; `data-tabs-content` becomes the `[nfsTabsGroup]` ancestor.
- Up and Down on horizontal strips no longer switch tabs; Home, End, and the right-to-left flip are added; vertical strips get `aria-orientation`.
- `aria-hidden` on hidden panels becomes `inert`; visible panels become focusable (`tabindex="0"`).
- `activeCollapse`, `matchHeight`, the class-name options, `deepLinkSmudgeDelay`, the `mutateme` broadcast, `selectTab()`, and `destroy()`'s inline hiding are dropped; jQuery-only mechanics go with them: measuring hidden panels by forcing them visible, `$('html, body').animate` scrolling, `[href$="#id"]` lookups.
- `autoFocus` runs at the first render callback rather than on window load, and scrolls with the browser's smooth scroll.
- The default palette's selected tab is no longer accepted: the required settings replace it.
