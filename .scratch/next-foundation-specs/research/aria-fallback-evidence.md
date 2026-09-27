# `@angular/aria` fallback evidence dossier

Ticket: [Decide the `@angular/aria` fallback confirmation](../issues/75-evidence-aria-fallback-confirmation.md)
Date: 2026-09-26
Scope: the nine fallbacks listed in `README.md` under "Confirmation: `@angular/aria` building blocks not used". Facts only; each claim carries its source. This file states no recommendation.

## Sources and conventions

Local clones, read at these revisions (paths below are relative to them):

- `NGC/` = `d:/projects/github/angular/components`, branch `22.2.x`, HEAD `708d4c6e2` (`git describe`: `v22.2.0-15`). `git log v22.2.0..22.2.x -- src/aria` is empty, so `src/aria` here is byte-identical to the published 22.2.0.
- `NG/` = `d:/projects/github/angular/angular`, branch `22.2.x`, HEAD `5db6fc4453`.
- `FS/` = `d:/projects/github/foundation/foundation-sites` (`v6.9.0-1`).
- `APG/` = `d:/projects/github/w3c/aria-practices` (`3f094fd`); `ARIA/` = `d:/projects/github/w3c/aria` (`ffa9651`), file `index.html`.
- Effort files are cited relative to the effort root (`specs/`, `adr/`, `issues/`, `prototypes/`, `research/`).

"Source reading" marks a claim read from code that no test or prototype exercised. "Measured" names the capture.

### What is on `main` or newer (applies to all nine fallbacks)

- The local `main` branch of `NGC/` is stale: it points at `5fcd95217` "release: cut the v22.2.0-next.1 release" (2026-08-12), older than `22.2.x`. `main` was therefore read as `origin/main` (`ef29b7eae`, 2026-09-25) and on GitHub.
- `git diff 22.2.x origin/main -- src/aria` is empty. The last two `src/aria` commits on `main` (`508b45a09` "replace hasOwnProperty with Object.hasOwn", `6a9f2d05e` "fix(aria/accordion): ensure right attribute is set when used as a host directive") were cherry-picked to `22.2.x` (`67c4cfbc8`, `24ff8891f`) and are in the `v22.2.0` tag. GitHub `main` (`gh api repos/angular/components/commits?sha=main&path=src/aria`, read 2026-09-26) has no later `src/aria` commit.
- npm (`registry.npmjs.org/@angular/aria`, read 2026-09-26): dist-tags `latest` 22.2.0, `next` 22.2.0-rc.0, `v21-lts` 21.2.14; no 22.3 or 23 prerelease exists.
- The Aria guides and examples in `NG/` (`adev/src/content/guide/aria`, `adev/src/content/examples/aria`) do not differ between `22.2.x` and `origin/main` (`e4fc745633`, 2026-09-25).
- Open upstream items (read-only `gh`, 2026-09-26): no open issue or PR under the labels `area: aria/accordion`, `area: aria/tabs`, `area: aria/tree`; under `area: aria/menu`, issue #32731 (a shared menu component from `aria/menu`), PR #33491 (close an open submenu when typeahead moves focus in a menubar), PR #32437 (emit selection values for a menu trigger). None of them touches a stated reason below.

Result for every section's "main or newer" question: nothing changes the 22.2 facts.

### Probes run for this dossier

The effort's prototypes did not exercise Aria's lazy templates, Aria menus, or Aria trees. To test the stated reasons, this dossier ran six small probes with the Angular 22.2.0 compiler and server renderer already installed in the [Prototype: `@angular/aria` Accordion and Tabs under Foundation markup](../issues/43-prototype-aria-accordion-tabs.md) workspace (`D:/tmp/nfs-proto-aria-accordion-tabs/app/node_modules`: `@angular/*` 22.2.0, `@angular/aria` 22.2.0, `@angular/compiler-cli` 22.2.0; Node 24.18.0). The probe files lived in the session scratchpad and are not kept; the method and the captured output are quoted here. Nothing was installed and the prototype workspace was not modified (bare imports were resolved from its `node_modules` through a Node resolve hook).

- Probe A (compile, `ngc`, `strictTemplates`): a directive with `hostDirectives: [{directive: TabPanel, inputs: ['value', 'id', 'preserveContent']}]`. Result: `error NG2017: Directive TabPanel does not have an input with a public name of preserveContent.`
- Probe B (compile): the same with `AccordionPanel` and `inputs: ['id', 'preserveContent']`. Result: `error NG2017: Directive AccordionPanel does not have an input with a public name of preserveContent.`
- Probe C (compile): a wrapper hosting `TabPanel` (inputs `value`, `id`) that declares its own `preserveContent = input(false, {transform: booleanAttribute})`, and a consumer writing the bare attribute `preserveContent`. Result: `error TS2322: Type 'string' is not assignable to type 'boolean'.` on the attribute: the consumer's attribute also binds the nested `DeferredContentAware.preserveContent` model, which has no transform.
- Probe D (compile): wrappers hosting `TabPanel` (inputs `value` only) and `AccordionPanel` (inputs `id` only), with the consumer binding `[preserveContent]="true"` on the wrapper's element. Result: exit 0 (one unrelated NG8113 "not used" warning).
- Probe E (runtime, `renderApplication` from `@angular/platform-server`, zoneless, development mode): probe D's wrappers render the nested `DeferredContentAware.preserveContent()` as `data-preserve`, inside an `ngTabs` set with `ng-template ngTabContent` panels and an `ngAccordionGroup` whose first trigger has `[expanded]="true"` and whose panels hold `ng-template ngAccordionContent`. Captured server HTML, showing only the two tab panels and the accordion headings and panels (the tab list and the wrapping elements are left out):

  ```html
  <div role="tabpanel" probetabspanel="" id="ng-tabpanel-a34408-0" value="a" tabindex="-1" inert="true" aria-labelledby="ng-tab-a34408-0" data-preserve="true"><!--container--></div>
  <div role="tabpanel" probetabspanel="" id="ng-tabpanel-a34408-1" value="b" tabindex="-1" inert="true" aria-labelledby="ng-tab-a34408-1" data-preserve="false"><!--container--></div>
  <h3><button role="button" ngaccordiontrigger="" type="button" id="ng-accordion-trigger-a34408-0" data-active="false" aria-expanded="true" aria-controls="ap-1" aria-disabled="false" tabindex="0">One</button></h3>
  <div role="region" probeaccordioncontent="" id="ap-1" aria-labelledby="ng-accordion-trigger-a34408-0" data-preserve="true"><!--container--></div>
  <h3><button role="button" ngaccordiontrigger="" type="button" id="ng-accordion-trigger-a34408-1" data-active="false" aria-expanded="false" aria-controls="ap-2" aria-disabled="false" tabindex="0">Two</button></h3>
  <div role="region" probeaccordioncontent="" id="ap-2" aria-labelledby="ng-accordion-trigger-a34408-1" inert="true" data-preserve="false"><!--container--></div>
  ```

  Read-out: the expanded accordion panel (`aria-expanded="true"`, no `inert`) contains only the `<!--container-->` anchor, so its lazy content is absent from server HTML; `[preserveContent]="true"` reached the nested `DeferredContentAware` (`data-preserve="true"`) without the wrapper forwarding it; both accordion triggers carry `tabindex="0"`.
- Probe F (runtime, same renderer): Foundation-shaped `ul > li > a + ul` markup under `ngMenuBar` (one submenu with items placed directly in `ngMenu`, one with items inside `ng-template ngMenuContent`), a `button[ngMenuTrigger]` with a standalone `ngMenu`, and an `ngTree [nav]="true"` whose parent item has `[expanded]="true"` and an `ng-template ngTreeItemGroup` inside `ul role="group"`. Captured server HTML, one element per line, abbreviated with `...` only inside the two nav wrappers:

  ```html
  <ul role="menubar" ngmenubar="" id="mb1" class="dropdown menu" aria-disabled="false" tabindex="-1">
  <li role="none">
  <a ngmenuitem="" value="one" href="#one" role="menuitem" tabindex="-1" data-active="false" aria-haspopup="true" aria-expanded="false" aria-disabled="false" aria-controls="sub1">One</a>
  <ul role="menu" ngmenu="" id="sub1" class="menu" aria-disabled="false" tabindex="-1" data-visible="false">
  <li role="none">
  <a ngmenuitem="" value="one-a" href="#one-a" role="menuitem" tabindex="-1" data-active="false" aria-haspopup="false" aria-disabled="false">One A</a>
  ...
  <ul role="menu" ngmenu="" id="sub2" class="menu" aria-disabled="false" tabindex="0" data-visible="false">
  <!--container-->
  </ul>
  ...
  <button ngmenutrigger="" id="trigger3" type="button" tabindex="0" aria-disabled="false" aria-haspopup="true" aria-expanded="false" aria-controls="m3">Actions</button>
  <div role="menu" ngmenu="" id="m3" aria-disabled="false" tabindex="-1" data-visible="false">
  <div ngmenuitem="" value="x" role="menuitem" tabindex="-1" data-active="false" aria-haspopup="false" aria-disabled="false">X</div>
  </div>
  <ul role="tree" ngtree="" id="tree" tabindex="-1" aria-orientation="vertical" aria-multiselectable="false" aria-disabled="false">
  <li role="none">
  <a role="treeitem" ngtreeitem="" value="p" href="#p" id="ng-tree-item-a41516-0" data-active="false" aria-expanded="true" aria-disabled="false" aria-level="1" aria-setsize="1" aria-posinset="1" tabindex="-1">Parent</a>
  <ul role="group" id="group">
  <!--container-->
  </ul>
  ```

  Read-out: submenu items placed directly in `ngMenu` are in server HTML, items inside `ngMenuContent` are not; the expanded tree item's children are not; no menubar item, menubar, tree, or tree item has `tabindex="0"` in server HTML; the menu trigger renders `aria-haspopup="true"`.

### Shared mechanism: Aria's deferred content (fallbacks 2 to 6)

- `DeferredContent` creates its embedded view only inside `afterRenderEffect({write})` and destroys it when the content is not visible and `preserveContent()` is false (`NGC/src/aria/private/deferred-content/deferred-content.ts:56-69`); `preserveContent` defaults to `false` (`:27`); its own spec asserts "removes the content when hidden." (`deferred-content.spec.ts:23`). It injects `DeferredContentAware` with `{optional: true}` (`:47`) and renders only when that container's `contentVisible()` is true (`:58`); `ngOnDestroy` destroys the view (`:72-74`).
- `afterRenderEffect` returns a no-op reference when `ngServerMode` is set (`NG/packages/core/src/render3/reactivity/after_render_effect.ts:419-421`), so no Aria lazy view exists in server or prerendered HTML (probe E, probe F). Inside a dehydrated `@defer` block no directive is constructed until hydration, and inside `hydrate never` never (`research/angular-rendering-modes.md` section 3, "What a dehydrated block is"), so such content stays absent there too (source reading of the combination).
- The panel-side directives set `contentVisible` in another `afterRenderEffect`: `AccordionPanel` (`NGC/src/aria/accordion/accordion-panel.ts:85-89`), `TabPanel` (`tabs/tab-panel.ts:96-100`), `Menu` (`menu/menu.ts:166-177`), `TreeItem` (`tree/tree-item.ts:122-126`).
- The Angular Aria guides say the opposite of the source about the default: "By default, content remains in the DOM after the panel collapses. Set `[preserveContent]="false"` to remove ..." (`NG/adev/src/content/guide/aria/accordion.md:160`; `tabs.md:193`). The source and its spec set the default to removal (above; also `research/angular-aria-inventory.md` 1.5).
- `preserveContent` is an input of `DeferredContentAware`, exposed by each panel directive's own `hostDirectives` entry (`accordion-panel.ts:45-50`, `tab-panel.ts:52-57`, `menu.ts:73-78`). The published typings list only `id` (and `value` for `TabPanel`) as the panel's own inputs, with `preserveContent` on the host-directive entry (`@angular/aria` 22.2.0 `types/accordion.d.ts:58`, `types/tabs.d.ts:165`). The compiler validates a `hostDirectives` input mapping against the host directive's own inputs only (`NG/packages/compiler-cli/src/ngtsc/annotations/common/src/diagnostics.ts:267-297`, inputs read from the declaration at `metadata/src/dts.ts:199`; runtime check `NG/packages/core/src/render3/features/host_directives_feature.ts:318-331`), hence probes A and B. At runtime, nested host directives are collected recursively with their own exposure maps (`host_directives_feature.ts:126-175`), hence probes D and E.
- The public entry points re-export `DeferredContent` and `DeferredContentAware` under Angular's private prefix (two U+0275 characters before the class name) "because it's used by the accordion components" (`NGC/src/aria/accordion/public-api.ts:15-20`; the same in `tabs/public-api.ts`, `menu/public-api.ts`; `tree/public-api.ts` re-exports only `DeferredContent`). Upstream issue #32590 (`preserveContent` input causing NG3004 in library builds, closed 2025-12-24 as a duplicate of #32584) is the history of that re-export.

### Summary of the source checks

Facts only; the verdict column says whether each part of the stated reason matches the sources above.

| # | Fallback | Part of the stated reason | Against the source |
| --- | --- | --- | --- |
| 1 | Orbit slide without `TabPanel` | Aria's `inert` reaches server HTML and no slide binding keeps it out | Matches (measured, three engines; mechanism from source) |
| 2 | Orbit without `TabContent` | Lazy slides would be missing from server HTML and without JavaScript | Matches; also, without a hosted `TabPanel` a `TabContent` never renders |
| 3 | Accordion without `AccordionContent` | Open lazy panel empty in server HTML | Matches (probe E) |
| 3 | | Content removed before the close animation | Matches for the default `preserveContent` false (source reading) |
| 3 | | `preserveContent` cannot be forwarded through a second host-directive level | Forwarding fails (NG2017), but a consumer binding on the element reaches it anyway (probes D, E) |
| 4 | Tabs `TabContent` opt-in only | Selected lazy panel empty in server HTML | Matches (probe E) |
| 5 | Responsive Accordion Tabs, no lazy form | Sections re-created on every swap | Matches (spec; P51 case 14) |
| 5 | | Must be in server HTML | Applies to the tabs-mode (Aria) lazy form; the Accordion's own lazy form renders open panels on the server |
| 6 | Menus without `ngMenuBar`/`ngMenu`/`ngTree` | Roles applied, roving tab stop | Matches |
| 6 | | APG advises against these roles for site navigation | Matches (three APG cautions) |
| 6 | | Angular Aria guide advises against them | Matches for `ngMenu`; the guide lists site navigation as a use for `ngTree` |
| 6 | | `ng-template` groups and `[parent]` break Foundation's nested `ul` | Tree: `ng-template` and `[parent]` required; menu: `ng-template` optional, `[submenu]` required |
| 6 | | Drilldown fits neither; menubar horizontal only | Matches |
| 6 | | Menubar renders submenus outside server HTML | Only with `ngMenuContent`; direct items are in server HTML (probe F); tree children always absent |
| 7 | Accordion Menu without Aria accordion | A `region` per panel | Aria sets it; a wrapper binding removes it (the Accordion spec does) |
| 7 | | One roving tab stop over the triggers | Does not match: every enabled trigger has `tabindex="0"` (source; P43 case 10; probe E) |
| 7 | | Required `[panel]` binding per trigger | Matches |
| 8 | Dropdown pane without Aria menu | `role="menu"` promises menu keys a pane of arbitrary content lacks | Matches; Aria's menu also intercepts printable keys typed inside it (source reading) |
| 9 | Triggers without `MenuTrigger` | Renders `aria-haspopup="menu"` and menu semantics | Renders `aria-haspopup="true"`, which WAI-ARIA requires user agents to treat as `menu`; menu semantics match |

## 1. Orbit slides do not host Aria's `TabPanel`

### 1.1 The fallback and its stated reason

README item 1: "Orbit slides do not host Aria's `TabPanel`: its own `inert` binding turns on in a later server pass, so no binding of the slide can keep `inert` out of server HTML, which ADR 0025 requires (measured in three engines); the slide binds the tab panel contract itself, and the bullets keep Aria `Tabs`, `TabList`, `Tab`."

`specs/orbit.md` (Implementation level, "Why custom for the slides"): "Aria comes first, and Aria's `TabPanel` is the tab panel primitive, but it binds `inert` on every unselected panel itself, server HTML included, and no binding of the hosting directive can keep that value out of the server HTML (binding precedence, above). ADR 0025 requires server HTML with no `inert` slide, so the slide cannot host `TabPanel`." The decision record is [ADR 0034](../adr/0034-orbit-slide-contract.md), from the [Re-run: Orbit spec, the slide's ARIA contract and the focus handoff](../issues/70-rerun-orbit-slide-contract-and-focus-handoff.md); the requirement is [ADR 0025](../adr/0025-orbit-live-inert.md).

### 1.2 Facts that test the reason

- `TabPanel` binds `'[attr.inert]': '!visible() ? true : null'` (`NGC/src/aria/tabs/tab-panel.ts:49`), with `visible = computed(() => !this._pattern.hidden())` (`:84`) and `TabPanelPattern.hidden = computed(() => this.inputs.tab()?.expanded() === false)` (`NGC/src/aria/private/tabs/tabs.ts:98`). While the panel finds no tab (`tab()` undefined), `hidden` is false and no `inert` renders; once a tab of equal `value` is registered and not expanded, `inert` renders. The panel looks its tab up in `Tabs._tabMap()` (`tab-panel.ts:76-78`), which is built from the tab list's registered tabs (`tabs/tabs.ts:88-97`); tabs register in `ngOnInit`.
- Angular writes an attribute binding only when that binding's own value changed: `if (bindingUpdated(lView, bindingIndex, value))` (`NG/packages/core/src/render3/instructions/attribute.ts:34`). Host directives run before their host "so that its host bindings can be overwritten" (`host_directives_feature.ts:164`). ADR 0034 derives the rule from these two facts: a wrapper's binding holds only while Aria's value never changes after the wrapper's last write, or equals it whenever it changes.
- Measured: in the [Prototype: Orbit keyboard scrolling and hydration details](../issues/65-prototype-orbit-keyboard-hydration.md), server HTML had `beforeInert: [false, true, true, true]` in Chromium, Firefox, and WebKit, with both a host-directive wrapper binding and a plain template binding, while a diagnostic attribute showed the wrapper's own value as absent; hydration stayed clean (`errors: []`, `componentsSkippedHydration: 0`); the same override pattern held for the bullets' `tabindex` over Aria's `Tab` (issue answer, Results table; test `prototypes/orbit-keyboard-hydration/e2e-hydration/hydration.spec.ts:14-36`).
- The prototype's isolated reproduction (a wrapper over a plain directive, and over one with its own nested host directive) did not reproduce the failure ("What the prototype does not prove" in that answer). The later explanation (Aria's value absent in the first server pass because the bullets follow the slides in the document, present in a later pass while the wrapper's value is unchanged) is source reading consistent with the numbers; the re-run triage rated it "HIGH from the Angular and Aria sources ... not re-measured" (Re-run answer, Triage item 2).
- Foundation's documented markup puts the container before the bullets (`FS/docs/pages/orbit.md:31-63`: `.orbit-wrapper` with `ul.orbit-container`, then `nav.orbit-bullets`).
- `main` and newer: no change (see "What is on `main` or newer").

### 1.3 What hosting `TabPanel` would require and cost

- API: `NfsOrbitSlide` would list `TabPanel` in `hostDirectives` and expose `value` (required by Aria, NG2019 otherwise, per the Aria prototype's case 1 mechanism) and `id`. ADR 0034's rejected options record the variants: wrapper or template override (measured failing), a `Renderer2` write in a render callback (never runs on the server, `after_render_effect.ts` and `hooks.ts` guards), giving `TabPanel` its `value` only once live (a host directive's input cannot be set from code; before hydration the slide would also lose `aria-labelledby` and the bullet `aria-controls`), registering slides in Aria's panel collection (underscore member), dropping Aria for the bullets too.
- Server HTML and hydration (ADR 0008): measured `inert` on every unselected slide in server HTML; hydration clean either way.
- ADR 0025 and WCAG 2.2: ADR 0025 decided no slide is `inert` before the directives are live, arguing that a scrollable but `inert` slide shows sighted users content assistive technology and the pointer cannot reach (it names 1.3.1) in no-JavaScript and `hydrate never` states. Building-blocks 1.11 decision 7 records the residue "Orbit keeps native scroll-snap scrolling with every slide reachable and usable".
- APG: the tabbed carousel gives each slide container role `tabpanel` without `aria-roledescription` in the pattern text (`APG/content/patterns/carousel/carousel-pattern.html:157`), and the tab, tablist, and tabpanel follow the tabs pattern (`:167`). Both designs render `role="tabpanel"`, `tabindex`, `aria-labelledby`, `id`, `inert` (the fallback per `specs/orbit.md` host binding table).
- What hosting would give that the fallback rebuilds: Aria's `Tab` binds `aria-controls` to `_pattern.controls()` (`tabs/tab.ts:48`), which is `tabPanel()?.id()` (`private/tabs/tabs.ts:70`); without a registered `TabPanel` it renders none, and `NfsOrbitBullet` binds it itself (ADR 0034 Consequences). Dev-mode warnings swap: with the fallback each `Tab` reports "ngTab with value '...' does not have a corresponding ngTabPanel." (`tab.ts:101-110`, two `console.warn` lines per bullet per ADR 0034's audit note); hosting `TabPanel` with projected content reports "ngTabPanel must have an ngTabContent structural directive to render." per slide instead (`tab-panel.ts:108-110`). Ids: `ng-tabpanel-` prefix (`tab-panel.ts:73`) versus the library's `nfs-orbit-slide-`.
- Foundation markup: `li.orbit-slide` becomes `div.orbit-slide` in both designs, because `tabpanel` is not an allowed role on `li` (`specs/orbit.md` class mapping, prototype axe failures `aria-allowed-role`, `list`).

### 1.4 Open unknowns

- Not measured: whether an Orbit whose bullets precede the slides in the document (Aria's `inert` present from the first pass, so constant afterwards) would let a slide binding hold under ADR 0034's rule. Foundation's order is the opposite.
- The root-cause explanation was not separately reproduced (the prototype's minimal repro did not fail).
- The upstream documentation question on host-binding override precedence is unfiled ([Re-run: Orbit spec, the slide's ARIA contract and the focus handoff](../issues/70-rerun-orbit-slide-contract-and-focus-handoff.md), OPEN FOR HUMAN 1).

## 2. Orbit offers no Aria `TabContent` for lazy slides

### 2.1 The fallback and its stated reason

README item 2: "Orbit offers no Aria `TabContent` for lazy slides: slide content is projected so every slide is in server HTML and reachable without JavaScript."

`specs/orbit.md` (Hierarchy and DI shape): "Slide content is projected, never placed in `ngTabContent`, so every slide is in the server HTML." Rendering modes: "A `@defer` block inside a slide: a consumer puts `@defer (on viewport)` inside a slide (not around it), which loads code, not the glossary's Lazy content (the Orbit offers none) ... `loading="lazy"` on slide images after the first is the platform form of the same. Aria's `ngTabContent` is not offered." [Spec: Orbit](../issues/33-spec-orbit.md) decision 45: "no `ngTabContent`, which would empty slides in server HTML (BB 1.11 decision 2)".

### 2.2 Facts that test the reason

- `TabContent` is `ng-template[ngTabContent]` with `hostDirectives: [DeferredContent]` (`NGC/src/aria/tabs/tab-content.ts:30-32`); its view is created only in a render callback, never on the server (shared mechanism; probe E shows `<!--container-->` in every lazy tab panel).
- `DeferredContent` renders only when an injected `DeferredContentAware` reports `contentVisible()` (`deferred-content.ts:47`, `:58`); `TabPanel` supplies it (`tab-panel.ts:52-57`). Since the slides host no `TabPanel` (fallback 1), a `TabContent` inside a slide has no `DeferredContentAware` and would never render (source reading). This fallback therefore depends on fallback 1.
- Where a `TabPanel` is hosted, `contentVisible` follows the panel's own `visible()` (`tab-panel.ts:96-100`), which is true only for the selected tab's panel (`private/tabs/tabs.ts:98`). In a scroll-snap carousel every slide can be scrolled into view natively (`specs/orbit.md` Solution); content of an unselected slide would be absent until the observer selects that slide (source reading of the combination).
- Foundation's Orbit has no lazy option (`FS/js/foundation.orbit.js` defaults, lines 431-551; `rg -i lazy` finds nothing in the Orbit, Accordion, Tabs, or ResponsiveAccordionTabs plugins).
- `main` and newer: no change.

### 2.3 What adopting `TabContent` would require and cost

- API: slides would first have to host `TabPanel` (conflicts with fallback 1's measured result), then accept `ng-template` content. The alternative the spec offers is consumer `@defer (on viewport)` inside a slide plus `loading="lazy"` images (story `orbit--defer-in-slide`).
- Server HTML and hydration: lazy slides empty in server HTML and prerendered HTML; permanently empty in `hydrate never`; created on the client after hydration (shared mechanism). ADR 0025 describes the Dehydrated state as "a usable scroll-snap gallery".
- WCAG 2.2 AA: no success criterion was found that requires content to exist before JavaScript; the effort's own rule is building-blocks 1.11 decision 2 and ADR 0008.
- APG: the carousel pattern says nothing about lazy slide content.
- Measured evidence: no prototype put `ngTabContent` in a slide; the [Prototype: Orbit on CSS scroll snap](../issues/46-prototype-orbit-scroll-snap.md) and the keyboard prototype used projected content.

### 2.4 Open unknowns

- None from source. Whether consumers need lazy slides beyond `@defer` is a product question the sources do not answer.

## 3. Accordion does not use Aria's `AccordionContent`, even for Lazy content

### 3.1 The fallback and its stated reason

README item 3: "Accordion does not use Aria's `AccordionContent`, even for Lazy content: Aria creates the view in a render callback, so an open panel would be empty in server HTML (ADR 0008), it removes content before the close animation, and its `preserveContent` cannot be forwarded through a second host-directive level."

`specs/accordion.md` Primitives: "not Aria's `AccordionContent`/`DeferredContent` (its view is created in `afterRenderEffect`, so an open lazy panel would be empty in server HTML ...)". D12: "Lazy content rendered by the wrapper's own template (`@if` plus `NgTemplateOutlet`), while shown or with `preserveContent` | Open lazy panels render on the server and hydrate ...; content stays through the closing transition; no dependency on Aria's private `DeferredContentAware` | Aria's `ngAccordionContent` (empty in server HTML, destroys content before the close animation)". [Spec: Accordion](../issues/15-spec-accordion.md) decision 30 adds: "whose `preserveContent` cannot be forwarded through a second host-directive level (ngtsc validates exposed inputs against the host directive's own inputs ...)".

### 3.2 Facts that test the reason

- Empty open panel in server HTML: `AccordionContent` is `ng-template[ngAccordionContent]` hosting `DeferredContent` (`NGC/src/aria/accordion/accordion-content.ts:30-34`); `AccordionPanel` sets `contentVisible` in a render callback (`accordion-panel.ts:85-89`); neither runs on the server. Measured by probe E: the expanded panel `ap-1` is `<div role="region" ... id="ap-1" ...><!--container--></div>`. Matches.
- Removal before the close animation: on collapse, `visible()` turns false, the panel's render effect sets `contentVisible` false, and `DeferredContent` destroys the view unless `preserveContent()` is true (`deferred-content.ts:64-66`); nothing in Aria waits for a transition. With `preserveContent` true the view stays from its first showing on (`deferred-content.spec.ts:49-55`). Matches for the default; source reading, not measured (the Aria prototype did not exercise the lazy mode, [Prototype: `@angular/aria` Accordion and Tabs under Foundation markup](../issues/43-prototype-aria-accordion-tabs.md), "What the prototype does not prove").
- Forwarding `preserveContent`: listing it in a wrapper's `hostDirectives` inputs fails with NG2017 (probes A and B; compiler source in the shared mechanism). A consumer can nevertheless bind `[preserveContent]="true"` on the element that carries the wrapper, because `AccordionPanel`'s own `hostDirectives` entry already exposes it (`accordion-panel.ts:45-50`): probe D compiles, and probe E's server HTML shows the value arriving (`data-preserve="true"` on `ap-1`). The bare attribute form fails type-checking under `strictTemplates` (probe C), because the model has no boolean transform. The Tabs spec relies on this exposure for `NfsTabsPanel.preserveContent` (`specs/tabs.md` API, "`preserveContent: ModelSignal<boolean>; // Aria`"; [Spec: Tabs](../issues/16-spec-tabs.md) decision 18). The statement "cannot be forwarded" is literally true; the consequence (the input is unreachable) does not follow.
- "No dependency on Aria's private `DeferredContentAware`": a consumer binding needs no import of it; library code that reads or writes the model would use the private-prefixed re-export (probe C used `inject()` on it), which exists in `accordion/public-api.ts:15-20`.
- `main` and newer: no change.

### 3.3 What adopting `AccordionContent` would require and cost

- API: `ng-template[nfsAccordionLazyContent]` would host `AccordionContent` through `hostDirectives`, the shape the Tabs spec uses for `TabContent` (`specs/tabs.md` class mapping row "(Lazy content)"; queries match host directives, per [Spec: Tabs](../issues/16-spec-tabs.md) decision 18). `preserveContent` would move from the lazy template (`specs/accordion.md` API table, `NfsAccordionLazyContent` row) to the `[nfsAccordionContent]` element, bindable only in bound form (probe C). `NfsAccordionContent` is an attribute-selector component with its own template around `<ng-content>` (`specs/accordion.md` class mapping); the lazy `ng-template` would sit in the consumer's projected content, where `AccordionPanel`'s `contentChild(AccordionContent)` query looks (source reading; probe E used a directive host, not a component).
- Server HTML and hydration (ADR 0008): an open-by-default lazy panel is empty in server and prerendered HTML and fills in after hydration (probe E); it stays empty inside `hydrate never`. ADR 0008 "Considered options" rejected Aria's content directives "as the default content mechanism" and kept them "as an opt-in lazy mode"; building-blocks 1.11 decision 2 allows opt-in client-only lazy content "and the spec says so". The Accordion spec's own lazy template renders an open lazy panel on the server (D12). No hydration mismatch arises from a view created after hydration into an empty container (`research/angular-rendering-modes.md` section 2, control flow; not measured for this case).
- Animation (ADR 0003): the close transition is a `grid-template-rows` CSS transition keyed on `.is-active` (`specs/accordion.md` Animation and Behaviour rules); with Aria's default the content is destroyed at the start of that transition; the library's lazy template keeps it "while `expanded() || !settled()`" and removes it after `closed` (`specs/accordion.md` Behaviour rules, "Lazy content").
- Dev-mode warnings: `AccordionPanel` warns "ngAccordionPanel must have an ngAccordionContent to render." (`accordion-panel.ts:98`) for every panel without the template; adopting `AccordionContent` for lazy panels silences it only for those panels (projected panels keep it, the Aria prototype's case 17).
- WCAG 2.2 AA: no criterion found that fails from client-only content; ARIA roles and states are unchanged.
- APG: unchanged (the content mechanism does not alter the accordion pattern).
- Foundation markup and classes: unchanged (an `ng-template` inside `.accordion-content`).

### 3.4 Open unknowns

- The close-timing loss with `preserveContent` false is source reading; no capture exists.
- `AccordionContent` discovered through a component host (`NfsAccordionContent`) rather than a directive host is not measured.

## 4. Tabs uses Aria's `TabContent` only behind the opt-in lazy template

### 4.1 The fallback and its stated reason

README item 4: "Tabs uses Aria's `TabContent` only behind the opt-in lazy template; by default panel content is projected, for the same server-HTML reason."

`specs/tabs.md` Solution: "`ng-template[nfsTabsLazyContent]`, opt-in, for Lazy content the developer accepts as client-only." API: "Its view is created when the panel becomes visible and destroyed when hidden unless `preserveContent` is true (Aria's `DeferredContent`, created in a render callback: never in server HTML)." Rendering modes: "Lazy content (`nfsTabsLazyContent`) is created in a render callback, so it is empty in server HTML even for the selected panel and appears after hydration; the consumer chooses it knowingly."

### 4.2 Facts that test the reason

- `TabPanel` sets `contentVisible` in a render callback (`tab-panel.ts:96-100`) and `TabContent` hosts `DeferredContent` (`tab-content.ts:30-32`): the selected panel's lazy content is absent from server HTML (probe E: both tab panels contain only `<!--container-->`). Matches. The spec's SSR smoke test asserts "an empty lazy panel" (`specs/tabs.md` Testing Decisions).
- `TabPanel` works without a `TabContent` child apart from a dev-mode warning (`tab-panel.ts:108-110`); measured by the Aria prototype: projected selected-panel content is present in server HTML (case 9), with one warning pair per panel in development (case 17), silent in production.
- `preserveContent` on `NfsTabsPanel` is reachable only through `TabPanel`'s own exposure, not by listing it in `NfsTabsPanel`'s `hostDirectives` (probes A, D, E).
- The Tabs spec's D19 gives "Consistent with Accordion" as the reason for hosting Aria's `TabContent`, while the Accordion spec's D12 does not use `AccordionContent` (section 3). The two specs' lazy mechanisms differ.
- `main` and newer: no change.

### 4.3 What using `TabContent` by default would require and cost

- API: every panel's content inside an `ng-template`; the dev warning disappears for those panels.
- Server HTML and hydration: the selected panel would be empty in server HTML and inside `hydrate never`; the Aria prototype measured the projected default present (case 9) and first paint without JavaScript showing tab panel 1 (case 11).
- Animation: none affected; panel switches are instant (`specs/tabs.md` Animation).
- A library-owned lazy template rendered in the panel's own view during change detection would render the selected lazy panel on the server (`research/angular-rendering-modes.md` section 5, second bullet; the Accordion spec's D12 mechanism); the Tabs spec does not use one.
- WCAG 2.2 AA and APG: unchanged by the content mechanism.
- Foundation markup: unchanged (`.tabs-panel` content wrapped in `ng-template`).

### 4.4 Open unknowns

- The opt-in path (`NfsTabsLazyContent` hosting `TabContent`, found by `TabPanel`'s `contentChild(TabContent)` through host-directive matching) has no capture; the Aria prototype skipped the lazy mode.

## 5. Responsive Accordion Tabs exposes neither lazy form

### 5.1 The fallback and its stated reason

README item 5: "Responsive Accordion Tabs exposes neither lazy form: sections are created again on every Mode swap and must be in server HTML."

`specs/responsive-accordion-tabs.md`: dropped list, "Accordion features the component does not expose: ... Lazy content (`nfsAccordionLazyContent`, `nfsTabsLazyContent`)"; Rendering modes, "the open section's content (projected into the Accordion's wrapper or the Tabs panel, never Aria's lazy content)"; Behaviour rules, "a swap destroys the displayed branch and instantiates every section template again in the other branch"; Out of Scope, "Lazy content in sections (`nfsAccordionLazyContent`, `nfsTabsLazyContent`); a consumer `@defer` inside a section loads code." The [Spec: Responsive Accordion Tabs](../issues/19-spec-responsive-accordion-tabs.md) triage rates leaving Lazy content out "Not HIGH: each is additive".

### 5.2 Facts that test the reason

- Re-creation: the Mode swap is an `@if` branch in the component's own template (`specs/responsive-accordion-tabs.md` D3); measured by the [Prototype: ResponsiveAccordionTabs as one component](../issues/51-prototype-responsive-accordion-tabs.md) case 14: text typed into an input in a panel is lost after an accordion-to-tabs swap (`prototypes/responsive-accordion-tabs/results.log:26`, `FINDING input value in Specs panel after accordion->tabs swap: ""`). A preserved Aria lazy view would be destroyed with its branch (`deferred-content.ts:72-74`). Matches, for any lazy form.
- Server HTML: in tabs mode the lazy form is Aria's `TabContent` (section 4), empty in server HTML. In accordion mode the lazy form is the Accordion's own template, which renders an open lazy panel on the server (section 3). The server-HTML part of the reason therefore applies to the tabs-mode form only; the accordion-mode form is not an Aria building block.
- The component starts every instance in the Server breakpoint's mode and swaps in its first render callback when the viewport differs ([ADR 0032](../adr/0032-responsive-accordion-tabs-instance-first-render.md); `specs/responsive-accordion-tabs.md` Solution), so a client on another breakpoint re-creates section content once after hydration in any case.
- `main` and newer: no change.

### 5.3 What exposing a lazy form would require and cost

- API: a per-section lazy template on the section directive, rendered by both branches (the component owns both templates and writes `[panel]` and `value` itself, `specs/responsive-accordion-tabs.md` Solution); `preserveContent` would reset on every swap.
- Server HTML and hydration: tabs-mode lazy sections empty in server HTML (Aria); accordion-mode lazy sections present when open (library template).
- Dev warnings: the Aria panel warnings already appear once per panel on every render of a mode (P51 case 24).
- WCAG 2.2 AA and APG: unchanged by the content mechanism.

### 5.4 Open unknowns

- No prototype exercised lazy content inside the component.

## 6. The menus use neither `ngMenuBar`/`ngMenu` nor `ngTree`

### 6.1 The fallback and its stated reason

README item 6: "The menus (the Nested menu family behind AccordionMenu, Drilldown, DropdownMenu, and ResponsiveMenu) use neither `ngMenuBar`/`ngMenu` nor `ngTree`: they apply the `menubar`, `menu`, `menuitem`, and `tree` roles that the APG and the Angular Aria guide advise against for site navigation, with a roving tab stop, and their `ng-template` groups and `[parent]` inputs break Foundation's nested `ul`; Drilldown fits neither; Aria's menubar is also horizontal only and renders submenus outside server HTML ([ADR 0004](../adr/0004-menus-use-disclosure-navigation.md))."

The same reason appears in `specs/nested-menu.md` (Implementation level), `specs/dropdown-menu.md` (Implementation level, `@angular/aria` bullet: "submenus are separate `ngMenu` elements linked by `[submenu]` references and rendered from `ng-template` content, which breaks Foundation's nested `ul` markup and leaves open submenus out of server HTML; and it opens on hover only after a first keyboard or click interaction"), `specs/accordion-menu.md`, `specs/drilldown-menu.md`, and `specs/responsive-menu.md`. The map lists "Opt-in `role="menu"` variants ... for command menus" as out of scope (`map.md` Out of scope).

### 6.2 Facts that test the reason

Roles and tab stop:

- Roles: `ngMenuBar` host `role="menubar"` (`NGC/src/aria/menu/menu-bar.ts:59`), `ngMenu` `role="menu"` (`menu.ts:61`), `ngMenuItem` `[attr.role]` from an input defaulting to `'menuitem'` (`menu-item.ts:47`, `:77`), `ngTree` `role="tree"` (`tree/tree.ts:73`), `ngTreeItem` `role="treeitem"` (`tree-item.ts:46`); all present in probe F's server HTML. Matches.
- Roving tab stop: `MenuBar` passes `focusMode: () => 'roving'` (`menu-bar.ts:116`), `Menu` the same (`menu.ts:158`), `Tree` defaults `focusMode` to `'roving'` (`tree.ts:119`). The first active item is set only in a render callback (`menu-bar.ts:124`, `menu.ts:191`, `tree.ts:189`), so in server HTML every item and container has `tabindex="-1"` (probe F). Matches; the pre-hydration consequence is in 6.3.

What the guidance says:

- APG, three cautions: the disclosure navigation example "does not use the menu role because it does not provide the complex functionality that assistive technologies expect" (`APG/content/patterns/disclosure/examples/disclosure-navigation.html:35-37`); the Navigation Menubar Example: "The `menubar` pattern requires complex functionality that is unnecessary for typical site navigation ... A pattern more suited for typical site navigation with expandable groups of links is the Disclosure Pattern" (`menubar/examples/menubar-navigation.html:34-39`); the Navigation Treeview Example: "Correct implementation of the `tree` role requires implementation of complex functionality that is not needed for typical site navigation" (`treeview/examples/treeview-navigation.html:32-38`). Each pattern page still lists a navigation example (`menubar/menu-and-menubar-pattern.html:42`, `treeview/treeview-pattern.html:45`). Matches.
- Angular Aria guide: `menu.md:53` "Avoid menus when: Building site navigation (use navigation landmarks instead)"; `menubar.md:57` lists "Navigation belongs in a sidebar or header navigation pattern" under "Avoid menubars when", while `menubar.md:46` lists "Creating persistent navigation that stays visible across the interface" under "Use menubars when" and `menu.md:143` says "Standalone menus work well for always-visible action lists or navigation"; `tree.md:27` and `tree.md:30` list "Creating nested menu structures" and "Implementing site navigation with nested sections" under "Use trees when", and `tree.md:52-66` shows a "Navigation tree" example with `[nav]="true"`. So the Aria guide advises against `ngMenu` for site navigation and recommends `ngTree` for it. Partly matches.

Markup:

- Tree: child items must sit in `ng-template[ngTreeItemGroup]` (`tree-item-group.ts:43`) with a required `ownedBy` (`:66`), and every `ngTreeItem` needs a required `parent` (`tree-item.ts:75`); an item is expandable only when it owns a group (`tree-item.ts:113-115`, `:147`). The consumer supplies the `role="group"` element around the template (`tree-item-group.ts:29-38`), so Foundation's nested `ul` can be that element (probe F), with `role="none"` on each `li` inside `ul[role=tree]`/`[role=group]` (as Foundation's own Nest does, `FS/js/foundation.util.nest.js:8`). The Angular example puts `a[ngTreeItem]` directly inside `ul[ngTree]`, with the group `ul` as a sibling rather than inside an `li` (`NG/adev/src/content/examples/aria/tree/src/nav/basic/app/app.html`).
- Menu: a submenu is a separate `ngMenu` element linked from its parent item by `[submenu]` (`menu-item.ts:83`) and may be nested in the DOM under the parent `li`; `ngMenuContent` is optional (`menu-content.ts:12-25`); probe F renders Foundation's `li > a + ul` shape with `li role="none"`. The `ng-template` part of the reason applies to the tree and to menus that choose `ngMenuContent`. Partly matches.
- Drilldown: Aria 22.2 ships `accordion`, `grid`, `listbox`, `menu`, `combobox`, `tabs`, `toolbar`, `tree` (`NGC/src/aria/config.bzl:2-20`); none replaces a level in place (`research/angular-aria-inventory.md` 6.4). Matches.
- Orientation: `MenuBar` passes `orientation: () => 'horizontal'` (`menu-bar.ts:117`); the guide calls it "a horizontal navigation bar" (`menubar.md:11`). A vertical root would have to be a standalone `ngMenu` (vertical, `menu.ts:159`; visible when it has no parent, `private/menu/menu.ts:92-94`), with `role="menu"`. Matches.

Server HTML:

- With `ngMenuContent`, submenu items are created in a render callback (`menu.ts:166-177`) and absent from server HTML (probe F, `sub2`); with items placed directly in `ngMenu`, they are present (probe F, `sub1`); the adev menubar example places submenus in `cdkConnectedOverlay` templates (`research/angular-aria-inventory.md` 6.3). Aria does not hide a closed menu: it renders `data-visible="false"` (`menu.ts:65`) for consumer CSS. Partly matches.
- Tree: nested levels are always in `ng-template[ngTreeItemGroup]`, so they are absent from server HTML even when expanded (probe F: `aria-expanded="true"` with an empty `ul role="group"`).

Behaviour facts outside the stated reason:

- Enter on a link: `MenuPattern` maps Enter to `trigger()`, which calls `submit()` on a leaf item (`private/menu/menu.ts:181`, `:397-421`), and `MenuBarPattern` maps Enter to `open()` (`:532`); `KeyboardEventManager` calls `preventDefault()` after every handled key by default (`private/behaviors/event-manager/keyboard-event-manager.ts:32-36`, `event-manager.ts:67-80`). Source reading, not measured: a native `a[href]` menu item does not follow its link on Enter; navigation would come from the consumer's `itemSelected` handler. The tree's `nav` mode skips `preventDefault()` for Enter (`private/tree/tree.ts:263`, `:269`).
- Hover: a menubar item opens its submenu on hover only while the previously active item is already expanded (`private/menu/menu.ts:579-585`, `:604-612`); the guide: "Submenus open on hover after first keyboard or click interaction" (`menubar.md:63`); submenu hover delay `expansionDelay` 100 ms (`menu.ts:150`). Foundation opens on the first hover with `hoverDelay` 50 and `closingTime` 500 (`FS/js/foundation.dropdownMenu.js` defaults).
- Expansion: the tree forces `multiExpandable: () => true` (`private/tree/tree.ts:373`); Foundation's AccordionMenu defaults `multiOpen: true` (`FS/js/foundation.accordionMenu.js` defaults) and can be set to `false`.
- Foundation's own JavaScript stamps these roles: `role="menubar"` on the root and submenus, `role="menuitem"` on links, `role="none"` on items, `aria-haspopup="true"` on parent links (`FS/js/foundation.util.nest.js:5-8`, `:23`, `:37`). The effort's specs drop all of them (`specs/nested-menu.md` Foundation contract table).
- `main` and newer: no change; open PR #33491 and issue #32731 concern typeahead and a shared menu component.

### 6.3 What adopting `ngMenuBar`/`ngMenu` or `ngTree` would require and cost

- API shape: DropdownMenu as `ul[ngMenuBar]`, `a[ngMenuItem][submenu]`, `ul[ngMenu]` per submenu, `role="none"` on each `li`, a `value` per item; AccordionMenu as `ul[ngTree][nav]`, `[ngTreeItem][parent][value]`, one `ng-template[ngTreeItemGroup][ownedBy]` inside each nested `ul`. Drilldown has no Aria pattern. ResponsiveMenu would switch between different Aria directive sets per breakpoint; ADR 0004 records that "Angular cannot swap directives on an element at runtime", which is why one Nested menu family keeps roles identical in every mode (ADR 0004 Considered options and Consequences; [ADR 0035](../adr/0035-responsive-menu-swap-commit.md)).
- Server HTML and hydration (ADR 0008): no tab stop in server HTML for menubar or tree (probe F), so before hydration and inside `hydrate never` the Tab key cannot reach the menu's links; the Tabs spec fixes the same gap for Aria's `Tab` with a wrapper `tabindex` override (`specs/tabs.md` `NfsTab`, the Aria prototype's case 10), whose soundness depends on ADR 0034's binding rule. Tree child levels absent from server HTML; menubar submenu items present when placed directly.
- WCAG 2.2 AA: 2.1.1 in the pre-hydration and `hydrate never` states follows from the missing tab stop (probe F). For 4.1.2, Aria implements the keys its roles promise (inventory 6.2, 8); the APG cautions concern unnecessary complexity for navigation, not a failure of these roles as implemented.
- APG: Menubar and Tree View are APG patterns with navigation examples, each carrying the caution above; the disclosure navigation pattern is the APG's suggested alternative for typical site navigation.
- Foundation markup and classes: Foundation's CSS keys on classes (`is-dropdown-submenu`, `js-dropdown-active`, `is-accordion-submenu`), which the library would still bind (for example from `menu.visible()`); the markup changes are `role="none"` on items, `ng-template` groups (tree), and per-item references (`[submenu]`, `[parent]`, `[ownedBy]`).
- Measured evidence: none for Aria menus or trees under Foundation markup. For the chosen design, the [Prototype: Nested menu directive family with breakpoint mode switching](../issues/50-prototype-nested-menu.md) measured no roles in any mode (case 4), server HTML carrying classes and `aria-expanded` (case 17), and axe with zero violations in every mode (case 19; `prototypes/nested-menu/evidence/playwright-run.log`).

### 6.4 Open unknowns

- Not measured: axe results for Aria's menubar or tree on Foundation's `li` markup; the Enter-on-link behaviour in a browser; whether a wrapper `tabindex` override for the pre-hydration tab stop would hold under ADR 0034's rule for menubar and tree; screen reader output for either.

## 7. Accordion Menu does not use Aria's accordion

### 7.1 The fallback and its stated reason

README item 7: "Accordion Menu does not use Aria's accordion: it is the APG Accordion pattern for page sections (a `region` per panel, one roving tab stop over the triggers), where disclosure navigation keeps every button and link in the tab sequence; each trigger would also need a required `[panel]` binding."

`specs/accordion-menu.md` (Implementation level): "Aria's accordion (`ngAccordionGroup`, `ngAccordionTrigger`, `ngAccordionPanel`), which the Accordion plugin hosts, is the APG Accordion pattern for page sections, not navigation: every panel becomes a `region` landmark, which the APG advises against when panels are many, as a site menu's sections are; its triggers share one roving tab stop and its arrow keys move between triggers only, where disclosure navigation keeps every button and link in the tab sequence and Foundation's arrow keys move across links too; and each trigger needs a required `[panel]` binding."

### 7.2 Facts that test the reason

- Region: `AccordionPanel` has a static `role="region"` with `aria-labelledby` (`accordion-panel.ts:52-54`). The APG makes the region optional and says "Avoid using the `region` role in circumstances that create landmark region proliferation, e.g., in an accordion that contains more than approximately 6 panels that can be expanded at the same time" (`APG/content/patterns/accordion/accordion-pattern.html:82-84`). A wrapper binding removes the role: the Accordion spec's `region` input "removes `role="region"` and `aria-labelledby` from every content" (`specs/accordion.md` API table and D17). Partly matches: Aria sets it, the library can remove it.
- Tab stop: `AccordionTriggerPattern.tabIndex = computed(() => this.inputs.accordionGroup().focusBehavior.isFocusable(this) ? 0 : -1)` (`NGC/src/aria/private/accordion/accordion.ts:196-198`), and `isFocusable(item)` is `!item.disabled() || this.inputs.softDisabled()` (`private/behaviors/list-focus/list-focus.ts:115-117`), not "is the active item" (that rule is `getItemTabIndex`, `:86-94`, which the accordion does not use). Every enabled trigger is a tab stop. Measured: server HTML "accordion trigger tabindex values: 0,0,0,0,0,0,0" (`prototypes/aria-accordion-tabs/results.log:2`, the Aria prototype's case 10); probe E: both triggers `tabindex="0"`. `research/angular-aria-inventory.md` 2.1 describes the trigger `tabindex` as "roving", which the source does not support. Does not match.
- Arrow keys: ArrowUp, ArrowDown, Home, End move among triggers only (`private/accordion/accordion.ts:57-81`). The group's `onKeydown` handles every keydown that reaches it without checking the target (`:94-96`), so an arrow key pressed on a link inside an open section would move focus to a trigger unless stopped; the Accordion spec adds a content key guard for exactly this (`specs/accordion.md` Behaviour rules, "Content key guard"). Matches ("arrow keys move between triggers only").
- The APG accordion keyboard section: "Tab: Moves focus to the next focusable element; all focusable elements in the accordion are included in the page Tab sequence" (`accordion-pattern.html:62`); it lists no arrow keys. It wraps each header button in a heading, "The `button` element is the only element inside the `heading` element" (`:72-75`); Aria does not enforce headings.
- Required `[panel]`: `readonly panel = input.required<AccordionPanel>()` (`NGC/src/aria/accordion/accordion-trigger.ts:73`); a wrapper can neither set nor hide it (NG2019, NG8008; the Aria prototype's case 1). Matches.
- The Angular Aria guide: "Avoid accordions when: Building navigation menus (use the Menu component instead)" (`NG/adev/src/content/guide/aria/accordion.md:32`), while the Menu guide advises against menus for site navigation (section 6).
- Expansion: `AccordionGroup.multiExpandable` defaults to `true` (`accordion-group.ts:93`), matching Foundation's AccordionMenu `multiOpen: true`; single-open would use the Accordion wrapper's policy ([ADR 0028](../adr/0028-accordion-expansion-policy.md)).
- `main` and newer: no change.

### 7.3 What adopting Aria's accordion would require and cost

- API shape: each level's `ul` an accordion group, each nested `ul` an `AccordionPanel`, each parent's toggle button an `AccordionTrigger` with `[panel]`; nested levels are nested accordions, each with its own group (the Accordion spec's decision 19); the Hybrid item's link stays a plain link beside the trigger button. ResponsiveMenu would need these directives in accordion mode only, which the single directive family avoids (ADR 0004).
- Guards: the content key guard (section above) and the Replay guard (the Aria prototype's cases 24 and 25) on every level.
- Server HTML and hydration: state as host bindings and triggers reachable by Tab before hydration (the Aria prototype's cases 8 and 10); ids with Aria's `ng-accordion-trigger-`/`ng-accordion-panel-` prefixes.
- WCAG 2.2 AA: the Aria prototype's axe run found no structural violation for Aria's accordion under Foundation markup (case 18). Landmark count grows by one open `region` per open section unless removed.
- APG: Accordion pattern (sections) against Disclosure navigation (the APG's suggested pattern for navigation, section 6).
- Foundation markup and classes: `li > a + ul.nested` keeps its shape; the parent needs a `button` trigger (the effort already uses a button or a Hybrid toggle, ADR 0004).
- Measured evidence: no prototype built an accordion menu on Aria's accordion.

### 7.4 Open unknowns

- Not measured: the accordion-menu arrangement on Aria's accordion (nested groups, links in panels, the key guard), and screen reader announcements of per-section regions.

## 8. The Dropdown pane does not use Aria's menu

### 8.1 The fallback and its stated reason

README item 8: "The Dropdown pane does not use Aria's menu: a pane holds arbitrary content, so `role="menu"` would promise menu keys it does not have; it is a disclosure or a non-modal dialog."

`specs/dropdown.md` (Implementation level): "`@angular/aria` 22.2 has no disclosure or dialog pattern, and its menu pattern is the wrong role for a pane of arbitrary content." ARIA and keyboard: "Never the Menu Button pattern, and never `aria-haspopup="true"`, which WAI-ARIA treats as `menu`."

### 8.2 Facts that test the reason

- `ngMenu` renders `role="menu"` (`menu.ts:61`). Its keyboard manager handles ArrowDown, ArrowUp, Home, End, Enter, Escape, the expand and collapse arrows, Space, and every single printable character as typeahead (`private/menu/menu.ts:175-186`, `typeaheadRegexp = /^.$/` at `:149`), on any keydown that reaches the menu element, with no target check (`:233-236`), calling `preventDefault()` and `stopPropagation()` by default (`keyboard-event-manager.ts:32-36`). Source reading, not measured: characters, Space, Home, and End typed into a text field inside an `ngMenu` would be cancelled.
- WAI-ARIA `menu` required owned elements: `menuitem`, `menuitemcheckbox`, `menuitemradio`, a `group` of those, `separator` (`ARIA/index.html:6229-6238`). axe-core 4.13.0 (`aria-required-children`, `axe.js:27717-27749` in the Aria prototype workspace) fails an element whose owned children have other roles or are focusable without an allowed role.
- `MenuTrigger.menu` accepts only a `Menu` (`menu/menu-trigger.ts:68`).
- Foundation's first documented pane is a form with text inputs (`FS/docs/pages/dropdown.md:30-42`); Foundation's Dropdown stamps `aria-haspopup="true"` on its anchors (`FS/js/foundation.dropdown.js:57`).
- Aria 22.2 has no disclosure or dialog entry point (`config.bzl:2-20`); its combobox with `popupType: 'dialog'` would expose the trigger as a combobox (`research/angular-aria-inventory.md` 5).
- `main` and newer: no change.

### 8.3 What adopting Aria's menu would require and cost

- API shape: pane content limited to `ngMenuItem`s (plus groups and separators); forms, text, and other widgets in a pane not expressible.
- Server HTML: a trigger-owned `ngMenu` renders `role="menu"`, `data-visible="false"`, items with `tabindex="-1"` (probe F, `m3`); Foundation's `.dropdown-pane` visibility would still need `.is-open` bound from `menu.visible()`.
- WCAG 2.2 AA: a `role="menu"` holding form fields fails axe's `aria-required-children` (above), and ADR 0022 enforces axe; typed characters in fields would be cancelled (source reading).
- APG: the Menu Button pattern fits a pane that is a list of actions or commands; the Dropdown spec's patterns are Disclosure and a non-modal dialog (`specs/dropdown.md` ARIA and keyboard).
- A pane that is purely a list of commands is the narrow case where Aria's menu fits (`research/angular-aria-inventory.md` 6.4); the map keeps opt-in menu roles out of scope.
- Measured evidence: none.

### 8.4 Open unknowns

- The key interception inside an `ngMenu` is source reading; not run in a browser.

## 9. Triggers do not use Aria's `MenuTrigger`

### 9.1 The fallback and its stated reason

README item 9: "Triggers do not use Aria's `MenuTrigger`: it renders `aria-haspopup="menu"` and menu semantics, wrong for every Openable."

`specs/triggers.md` (Implementation level): "`@angular/aria` 22.2 has no disclosure, dialog, or trigger pattern. `@angular/cdk` has no generic trigger: `cdkMenuTriggerFor` and Material's `matMenuTriggerFor` open overlay menus with `aria-haspopup="menu"`, which is wrong for every Openable here". ARIA and keyboard: "`aria-haspopup="true"` is never rendered: WAI-ARIA treats it as `menu`, and no Openable is a menu."

### 9.2 Facts that test the reason

- `MenuTrigger` binds `'[attr.aria-haspopup]': 'hasPopup()'` (`menu/menu-trigger.ts:48`, `:74`), and `MenuTriggerPattern.hasPopup = () => true` (`private/menu/menu.ts:664`); probe F renders `aria-haspopup="true"`. WAI-ARIA: "user agents MUST treat an `aria-haspopup` value of `true` as equivalent to a value of `menu`" (`ARIA/index.html:13968-13969`), and the value table defines `true` as "Indicates the popup is a menu" (`:14028-14029`). The literal value in the README is not what Aria renders; the meaning is.
- Menu semantics: the `menu` input accepts only a `Menu` (`menu-trigger.ts:68`) and links back with `effect(() => this.menu()?.parent.set(this))` (`:91`); Space, Enter, ArrowDown open on the first item, ArrowUp on the last, Escape closes and refocuses, all with `preventDefault()` (`private/menu/menu.ts:678-685`); click toggles (`:718-722`); focus leaving the trigger and the menu closes it (`:730-741`). The open state is the trigger's own `expanded` signal (`:652`), so the trigger, not the target, owns it.
- The effort's Openables and their Trigger roles are `disclosure`, `dialog`, `toggle-button`, and `none` (`specs/triggers.md` ARIA table); several Triggers may operate one Openable, whose own `isOpen` is the state (`specs/triggers.md` Solution and Behaviour rules).
- Aria 22.2 has no disclosure, dialog, or toggle trigger (`config.bzl:2-20`).
- `main` and newer: no change; open PR #32437 changes menu-trigger selection values, not `aria-haspopup`.

### 9.3 What adopting `MenuTrigger` would require and cost

- API shape: targets restricted to `ngMenu`; Reveal, Off-canvas, the Dropdown pane, and Toggler are not menus, so the reference would not type-check; state would live in each trigger instead of the Openable.
- Server HTML: `MenuTrigger` itself is server-safe (probe F: `tabindex="0"`, `aria-expanded="false"`, `aria-controls` in server HTML).
- WCAG 2.2 AA (4.1.2): `aria-haspopup="true"` on a disclosure or dialog trigger announces a menu; the Triggers spec renders `aria-haspopup="dialog"` for dialogs and nothing for disclosures.
- APG: Menu Button pattern, against Disclosure and Dialog patterns for these Openables.
- Measured evidence: none needed beyond probe F's attribute capture.

### 9.4 Open unknowns

- None from source.
