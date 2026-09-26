# WAI-ARIA APG patterns mapped to Foundation for Sites 6.9 plugins

Ticket: `../issues/10-aria-apg-patterns.md`
Date: 2026-09-25

Corrected 2026-09-25 after [Audit 0001: research wave](../audits/0001-research-wave.md), finding M9: two Foundation element facts corrected.

## Sources and how to read the citations

| Short name | What | Where |
| --- | --- | --- |
| `APG/` | WAI-ARIA Authoring Practices Guide, local clone at commit `3f094fd` (2026-09-15) | `d:/projects/github/w3c/aria-practices/content/` |
| `ARIA:` | WAI-ARIA 1.3 Editor's Draft, local clone at commit `ffa9651` (2026-09-24), single file; numbers are line numbers of the role/attribute anchor | `d:/projects/github/w3c/aria/index.html` |
| `FND/` | Foundation for Sites 6.9 clone | `d:/projects/github/foundation/foundation-sites/` |

Online equivalents: `APG/patterns/<p>/<p>-pattern.html` is `https://www.w3.org/WAI/ARIA/apg/patterns/<p>/`; `APG/patterns/<p>/examples/<e>.html` is `https://www.w3.org/WAI/ARIA/apg/patterns/<p>/examples/<e>/`; `APG/practices/<x>/<x>-practice.html` is `https://www.w3.org/WAI/ARIA/apg/practices/<x>/`. Nothing in this document needed an online fetch; the clone is ten days old and complete.

Two APG caveats apply to every section below (`APG/practices/read-me-first/read-me-first-practice.html`):

- "A role is a promise": applying a role means the author also ships the keyboard behaviour the role implies. "No ARIA is better than Bad ARIA."
- The APG illustrates ARIA 1.2 and deliberately does not work around browser or AT gaps; "testing assistive technology interoperability is essential before using code from this guide in production." The guide "does not indicate which examples are compatible with mobile browsers or touch interfaces."

## Summary table

| Foundation plugin | Governing APG pattern | Alternative or opt-in | Best matching example |
| --- | --- | --- | --- |
| Accordion | Accordion | Disclosure (FAQ) when panels are independent | `APG/patterns/accordion/examples/accordion.html` |
| AccordionMenu | Disclosure Navigation Menu (hybrid variant when `data-submenu-toggle="true"`) | Tree View (opt-in, sidebar page trees) | `APG/patterns/disclosure/examples/disclosure-navigation-hybrid.html` |
| Drilldown | No dedicated pattern; Disclosure per level inside one `nav` | Menu and Menubar (vertical, opt-in for action menus) | `APG/patterns/menubar/menu-and-menubar-pattern.html` (keys), `APG/patterns/disclosure/examples/disclosure-navigation.html` (roles) |
| Dropdown (`.dropdown-pane`) | Disclosure | Non-modal `dialog` for form-like panes; Menu Button only if the pane is a real menu | `APG/patterns/disclosure/examples/disclosure-faq.html`; `APG/patterns/menu-button/examples/menu-button-links.html` |
| DropdownMenu | Disclosure Navigation Menu | Menu and Menubar (opt-in) | `APG/patterns/disclosure/examples/disclosure-navigation.html`; `APG/patterns/menubar/examples/menubar-navigation.html` |
| Equalizer | none (layout only) | - | - |
| Interchange | none; `img` naming rules | - | `APG/practices/names-and-descriptions/` (img row) |
| Magellan | none; `navigation` landmark + Link + `aria-current` | Breadcrumb pattern is the closest cousin | `APG/patterns/landmarks/examples/navigation.html` |
| OffCanvas | Dialog (Modal) when it traps focus and obscures the page; otherwise Disclosure + landmark | - | `APG/patterns/dialog-modal/examples/dialog.html` |
| Orbit | Carousel (tabbed style recommended) | Carousel grouped style keeps Foundation's bullet buttons | `APG/patterns/carousel/examples/carousel-2-tablist.html` |
| ResponsiveAccordionTabs | Accordion below breakpoint, Tabs above; full role swap | - | both accordion and tabs examples |
| ResponsiveMenu | none; composes the three menu plugins, full role swap | - | - |
| ResponsiveToggle | Disclosure | - | `APG/patterns/disclosure/examples/disclosure-navigation.html` |
| Reveal | Dialog (Modal); Alert Dialog for confirmations | - | `APG/patterns/dialog-modal/examples/dialog.html`; `APG/patterns/alertdialog/examples/alertdialog.html` |
| Slider | Slider; Slider (Multi-Thumb) for two handles | native `<input type="range">` (APG's own touch warning favours it) | `APG/patterns/slider/examples/slider-temperature.html`; `APG/patterns/slider-multithumb/examples/slider-multithumb.html` |
| SmoothScroll | none; Link pattern (focus must follow the scroll) | - | `APG/patterns/link/link-pattern.html` |
| Sticky | none | - | - |
| Tabs | Tabs (automatic activation) | Tabs (manual activation) | `APG/patterns/tabs/examples/tabs-automatic.html` |
| Toggler | Disclosure; Button (toggle) when a class rather than visibility is toggled | Switch | `APG/patterns/disclosure/examples/disclosure-faq.html`; `APG/patterns/button/examples/button.html` |
| Tooltip | Tooltip (APG marks it work in progress, no consensus, no example) | - | none exists; issues 127 and 128 in the APG repo |

Patterns read but mapped to no plugin: Feed (infinite-scroll list of `article`s; nothing in Foundation loads content on scroll), Toolbar (a single-tab-stop group of 3+ controls; the carousel pattern deliberately keeps its controls as separate tab stops, so Orbit does not use it), Button (used only as a building block: Orbit controls, disclosure triggers, toggle buttons), Link and Landmarks (used as building blocks for Magellan, SmoothScroll, menus).

## Cross-cutting practices

### Developing a Keyboard Interface

Source: `APG/practices/keyboard-interface/keyboard-interface-practice.html`.

- `Tab` and `Shift+Tab` move between components; arrow keys move inside a composite. "The tab sequence should include only one focusable element of a composite UI component."
- Two focus-management strategies: roving `tabindex` (one element `tabindex="0"`, others `-1`, move `tabindex` and call `focus()` on navigation; "one benefit ... is that the user agent will scroll the newly focused element into view") and `aria-activedescendant` (container focused; referenced element must be a DOM descendant, or owned via `aria-owns`, or reached through `aria-controls` from a combobox/textbox/searchbox).
- `tabindex` values 1 and above: "Authors are strongly advised NOT to use these values." Foundation's docs use `tabindex="1"` on slider handles and tooltip spans (`FND/docs/pages/slider.md`, `FND/docs/pages/tooltip.md`); the slider JS itself writes `tabindex: 0` (`FND/js/foundation.slider.js:329`).
- Where focus lands on `Tab` into a composite: last-focused element (grids), the selected element (radio groups, tabs, listboxes, trees), or the first element (menubars, toolbars).
- Selection follows focus is "often beneficial ... but in some circumstances ... extremely detrimental": fine when the panel is already in the DOM, harmful when activation triggers a network request or page refresh. When it does not follow focus, `Enter` or `Space` selects.
- "Persistence of focus: It is essential that there is always a component within the user interface that is active (document.activeElement is not null or is not the body element)". Closing a dialog or removing the focused element must move focus deliberately, otherwise browsers drop it on `body`.
- Do not set initial focus on page load except when the page has one primary function used immediately, or is used often.
- Disabled controls: use HTML `disabled` (removed from the tab order) when nearby focusable controls make the disabled one inferable; use `aria-disabled="true"` (stays focusable) when discoverability matters. The APG examples keep menu items, tabs, tree items, listbox options and toolbar buttons focusable when disabled.
- Pointer interactions must update the same `tabindex` or `aria-activedescendant` state as keyboard navigation would, or keyboard and pointer users get a mismatch.
- Shortcut conflicts to avoid: any modifier + `Tab`/`Enter`/`Space`/`Escape`; `Meta` + single key; `Alt` + function key; `Caps Lock`, `Insert`, `Scroll Lock` combinations; macOS `Control+Option` combinations; browser address bar, refresh, find, bookmarks.

### Providing Accessible Names and Descriptions

Source: `APG/practices/names-and-descriptions/names-and-descriptions-practice.html`.

Cardinal rules: heed warnings and test; prefer visible text; prefer native techniques (`label`, `caption`); avoid browser fallback (`title`, `placeholder` "typically yields low quality accessible names"); compose brief, useful names.

Roles named from content by default: `button`, `cell`, `checkbox`, `columnheader`, `gridcell`, `heading`, `link`, `menuitem` (child `menu` content excluded), `menuitemcheckbox`, `menuitemradio`, `option`, `radio`, `row`, `rowheader`, `switch`, `tab`, `tooltip`, `treeitem` (child `group` content excluded). Warning: `aria-label` or `aria-labelledby` on any of these hides the descendant content from AT "except in rare circumstances where hiding content from assistive technology users is beneficial". Foundation's Nest utility sets `aria-label` equal to the link text on every parent menu link (`FND/js/foundation.util.nest.js:22-25`) and its Orbit demos put `aria-label="previous"` on a button that already contains "Previous Slide" text (`FND/docs/pages/orbit.md:200`); both are exactly the pattern this warning covers.

`aria-labelledby`: highest precedence; concatenates multiple IDs in order; includes hidden elements and input values; "cannot be chained"; duplicate references are ignored.

Naming necessity for the roles this map uses (table under "Accessible Name Guidance by Role"):

| Role | Necessity | Guidance |
| --- | --- | --- |
| `button`, `link`, `tab`, `menuitem`, `treeitem`, `tooltip` | Required only if content insufficient | named by visible descendant content; `aria-label`/`aria-labelledby` hide content |
| `dialog`, `alertdialog`, `region`, `tabpanel`, `tree`, `slider`, `img` | Required | `aria-labelledby` if a visible label exists, else `aria-label`; `tabpanel` points at its `tab`; `img` uses `alt`; a slider on an `input` can use `label` |
| `navigation`, `menu`, `menubar`, `tablist`, `toolbar`, `feed` | Recommended | `menu` is labelled by the menuitem or button that opens it; a `menubar` name plays the role a menu button's name would; `toolbar` naming is required when more than one exists |
| `group`, `list` | Discretionary | `fieldset`/`legend` for groups; do not name the `group` a `details` element creates; naming a list nested inside a named `nav` adds verbosity |
| `listitem` | Do not name | ATs do not support it |
| `generic`, `none`, `presentation` | Prohibited | the element is not in the accessibility tree |

Descriptions: `aria-describedby` for a short flat description; `aria-details` when the description has structure or is long (`ARIA:14601` region and `ARIA:13186` region text on `aria-description`/`aria-details`).

### Landmark Regions

Source: `APG/practices/landmark-regions/landmark-regions-practice.html`; pattern page `APG/patterns/landmarks/landmarks-pattern.html`.

- HTML elements that create landmarks: `aside` -> `complementary`; `footer`/`header` in `body` context -> `contentinfo`/`banner`; `main`; `nav` -> `navigation`; `section` with an accessible name -> `region`; `search`.
- "A general rule of thumb is that a page contains seven or fewer landmark regions." All perceivable content should sit inside a landmark.
- Duplicate landmark roles need unique labels, except when the content is identical (two identical pagination navs may share a label).
- "Do not use the landmark role as part of the label": a nav labelled "Site Navigation" is announced "Site Navigation Navigation".
- "Wrapping the content of a modal dialog in a landmark region is unnecessary" and cannot benefit users.
- `region` must have a label; `banner`, `main`, `complementary`, `contentinfo` are top-level.

### Hiding Semantics with the Presentation Role

Source: `APG/practices/hiding-semantics/hiding-semantics-practice.html`.

- `role="presentation"` (`none` is its synonym) on `li` inside a `ul[role=tablist|menu|tree]` removes the orphaned `listitem` semantics; the practice shows precisely Foundation's `ul.tabs > li.tabs-title > a` markup.
- Presentation is ignored on a focusable element or one with global ARIA attributes.
- Roles whose descendants are always presentational: `button`, `checkbox`, `img`, `meter`, `menuitemcheckbox`, `menuitemradio`, `option`, `progressbar`, `radio`, `scrollbar`, `separator`, `slider`, `switch`, `tab`. A heading inside a `tab` is not exposed; a heading inside an accordion header `button` is not exposed either, which is why the APG puts the button inside the heading and not the reverse.

### Structural Roles

Source: `APG/practices/structural-roles/structural-roles-practice.html`. "Do not use an ARIA role or property if it is possible to use an HTML element that has equivalent semantics." Exceptions: the HTML element cannot be styled as required, testing shows better AT support for ARIA, legacy retrofits, custom elements. This is the same rule as the map's "native platform feature first".

### ARIA spec facts the plugin sections depend on

| Fact | Source |
| --- | --- |
| `aria-haspopup`: "Authors MUST ensure that the role of the element that serves as the container for the popup content is menu, listbox, tree, grid, or dialog, and that the value of aria-haspopup matches"; `true` is treated as `menu`; "A tooltip is not considered to be a popup"; avoid it when there is no visual indicator; deprecated as a global in 1.2 (still supported on `button`, `link`, `menuitem`, `tab`, `treeitem`, `slider`) | `ARIA:13953` |
| `aria-expanded` is supported on `link` (as well as `button`, `menuitem`, `tab`, `treeitem`, `application`, `gridcell`, `row`); the element carrying it should not be the accessibility parent of the content it expands unless it is a `treeitem` or treegrid `row`; use `aria-controls` for the relationship | `ARIA:13741`, `ARIA:5273` (link role, supported states) |
| `role="none"`/`presentation`: "user agents MUST ignore role-specific WAI-ARIA states and properties" on such an element when it is not focusable | `ARIA:6830` block, "none" definition |
| `aria-modal`: "authors MUST ensure the interface can be controlled using only descendants of the modal element"; "authors SHOULD mark all other contents as inert (such as 'inert subtrees' in HTML)" | `ARIA:14601` |
| `dialog`: "In lieu of using robust host language features for marking content of the primary web application as inert, authors SHOULD use the aria-modal attribute"; dialogs SHOULD have a name, a focusable descendant, initial focus, and constrained focus; prefer `aria-describedby` over `aria-description` | `ARIA:3620` |
| `alertdialog`: SHOULD be modal; SHOULD set focus to an active element such as a confirmation button; SHOULD use `aria-describedby` for the message | `ARIA:1587` |
| `region`: "Authors MUST give each element with role region a brief label"; limit `region` to content no other landmark describes | `ARIA:7990` |
| `tooltip`: name from content; `aria-label`/`aria-labelledby` are prohibited on it; "Authors SHOULD ensure that elements with the role tooltip are referenced through the use of aria-describedby before or at the time the tooltip is displayed"; typical delay 1-5 s | `ARIA:11278` |
| `slider`: `aria-valuenow` required; `aria-valuemin`/`max` default 0/100 like `input[type=range]`; implicit `aria-orientation="horizontal"`; children presentational; name required | `ARIA:9306` |
| `tab`: must be an accessibility child of `tablist`; an active tab must have a rendered `tabpanel`; associate via `aria-controls` and/or `aria-labelledby`; children presentational; implicit `aria-selected="false"` | `ARIA:10218` |
| `menuitem`: must be an accessibility child of `menu`, `menubar`, or a `group` inside one; `aria-haspopup="true"` on it means it opens a sub-level menu | `ARIA:6381` |
| `menu` implicit orientation vertical; `menubar` implicit horizontal; `tree` vertical; `tablist` horizontal; all four "MUST manage focus of descendants" | `ARIA:6172`, `ARIA:6281`, `ARIA:11376`, `ARIA:10456` |
| `treeitem`: nested `group` elements imply level; otherwise `aria-level`, `aria-posinset`, `aria-setsize` MUST be explicit; do not mix `aria-selected` and `aria-checked` | `ARIA:11574` |
| `aria-current` tokens: `page`, `step`, `location`, `date`, `time`, `true`; unknown values read as `true`; "Authors SHOULD only mark one element in a set of elements as current"; not a substitute for `aria-selected` in a tablist; `aria-current="page"` and `aria-selected` may coexist in a navigation tree | `ARIA:13186` |
| `aria-roledescription`: limit to "clarifying the purpose of non-interactive container roles like group or region, or to providing a more specific description of a widget"; ATs keep role-based navigation | `ARIA:15393` |
| `aria-pressed`: presence makes a button a toggle button; `mixed` allowed | `ARIA:15084` |
| `aria-hidden="false"` is now a synonym of `undefined` (ARIA 1.3) | `ARIA:14054` |
| `group` "is not intended to be included in a page summary or table of contents"; use `region` when it should be | `ARIA:4739` |

## Accordion

Foundation markup: `ul.accordion[data-accordion] > li.accordion-item > a.accordion-title[href="#"] + div.accordion-content[data-tab-content]` (`FND/docs/pages/accordion.md`). Options `multiExpand`, `allowAllClosed`, `disabled`, deep linking.

Pattern: Accordion, `APG/patterns/accordion/accordion-pattern.html`. Example: `APG/patterns/accordion/examples/accordion.html` (headers are `h3 > button`, panels are `div[role=region][aria-labelledby]`).

Roles, states, properties:

- Each header title is in an element with role `button`; that button "is wrapped in an element with role `heading` that has a value set for `aria-level` that is appropriate for the information architecture of the page"; a native `h1`-`h6` is fine. "The `button` element is the only element inside the `heading` element."
- Header button: `aria-expanded="true|false"`; `aria-controls` -> panel id.
- "If the accordion panel associated with an accordion header is visible, and if the accordion does not permit the panel to be collapsed, the header `button` element has `aria-disabled` set to `true`." That is Foundation's `allowAllClosed: false` default (one panel must stay open).
- Optionally each panel container has role `region` with `aria-labelledby` -> its button. "Avoid using the `region` role in circumstances that create landmark region proliferation, e.g., in an accordion that contains more than approximately 6 panels that can be expanded at the same time." Region "is especially helpful ... when panels contain heading elements or a nested accordion."

Keyboard (the current pattern has no arrow, Home or End keys):

| Key | Behaviour |
| --- | --- |
| `Enter` or `Space` | On a collapsed panel's header: expands it; if only one panel may be open, collapses the other. On an expanded panel's header: collapses it "if the implementation supports collapsing". |
| `Tab` / `Shift+Tab` | Next/previous focusable element; "all focusable elements in the accordion are included in the page `Tab` sequence." |

Foundation delta:

- The header is `<a href="#">` with `aria-expanded` and `aria-controls` (`FND/js/foundation.accordion.js:54-58`); no `button` role, no heading wrapper. `aria-expanded` is valid on `link` (`ARIA:5273`) but the APG requires `button` inside a heading.
- Every panel gets `role="region"` unconditionally (`FND/js/foundation.accordion.js:60`), so a `multiExpand` accordion with many panels hits the proliferation warning.
- Foundation binds `ARROW_DOWN`/`ARROW_UP`/`HOME`/`END` to move between headers (`FND/js/foundation.accordion.js:28-35`). The current APG pattern does not list them; they are harmless extras but not required and, per the disclosure-navigation example, screen readers in reading mode intercept them anyway.
- `disabled` option: expose as `aria-disabled="true"` on every header, or `disabled` on the buttons; the keyboard practice's convention says keep them focusable when discoverability matters.
- `aria-hidden` on collapsed panels (`FND/js/foundation.accordion.js:60`) is redundant if the panel is hidden with `hidden`/`display:none` and wrong if content is merely off-screen.

When to prefer Disclosure instead: an FAQ list of independent show/hide items with no "only one open" rule is the APG's disclosure-faq example (`APG/patterns/disclosure/examples/disclosure-faq.html`), which keeps native `ul/li` semantics and needs no heading wrapper or `region`.

## AccordionMenu

Foundation markup: `ul.vertical.menu.accordion-menu[data-accordion-menu] > li > a + ul.menu.vertical.nested` (`FND/docs/pages/accordion-menu.md`); `data-submenu-toggle="true"` adds a separate toggle so the parent `a` stays a real link.

What Foundation emits today: Nest gives the root `role="menubar"`, every `a` `role="menuitem"`, every `li` `role="none"` and every nested `ul` `role="menubar"` (`FND/js/foundation.util.nest.js:5-8,37`); accordionMenu then overrides nested `ul` to `role="group"` with `aria-labelledby` and `aria-hidden`, gives the parent `li` `aria-controls` and `aria-expanded` (`FND/js/foundation.accordionMenu.js:74-78`), and sets `aria-multiselectable` on the root (`FND/js/foundation.accordionMenu.js:53-55`). Result: `menubar > none[aria-controls][aria-expanded] > menuitem + group`, which is neither the menu pattern (submenus must be `menu`) nor the tree pattern (items must be `treeitem` inside `tree`). `aria-multiselectable` is not supported on `menubar`.

Pattern: Disclosure Navigation Menu, `APG/patterns/disclosure/disclosure-pattern.html`, examples `APG/patterns/disclosure/examples/disclosure-navigation.html` and, for `data-submenu-toggle="true"`, `APG/patterns/disclosure/examples/disclosure-navigation-hybrid.html` (top-level link plus a separate disclosure button). The APG's own caution, printed at the top of both the menubar and treeview navigation examples: "it does not use the WAI-ARIA menu role ... because it does not provide the complex functionality that assistive technologies expect in a widget that has the menu role. Typical site navigation does not need all the keyboard interactions specified by the menu and menubar pattern" (`APG/patterns/disclosure/examples/disclosure-navigation.html`, "Important"); "Correct implementation of the `tree` role requires implementation of complex functionality that is not needed for typical site navigation that is styled to look like a tree with expandable sections" (`APG/patterns/treeview/examples/treeview-navigation.html`, "Caution!").

Roles, states, properties (disclosure navigation):

- Wrap in `nav` with `aria-label` (the example names it after the site, "Mythical University", never "navigation").
- Keep native `ul`/`li` semantics: "The semantics of the list structure communicates the hierarchy of the navigation system to assistive technology users." No `menubar`, `menuitem`, `none`, `group` roles.
- Each parent item is a `button` with `aria-expanded` and `aria-controls` -> the nested `ul`. In the hybrid variant the `li` contains `a[href]` followed by the `button`.
- The link to the current page has `aria-current="page"`.
- `[aria-expanded]` attribute selectors drive the visual state.
- Escape closes an open dropdown and returns focus to its button; "Moving focus out of the navigation region also closes an open dropdown." The example says the Escape behaviour "is necessary to meet the WCAG 2.1 1.4.13: Content on Hover or Focus criterion." (For an accordion menu whose panels stay open in flow, closing on focus-out is not required; that rule targets dropdowns that overlay content.)

Keyboard:

| Key | Behaviour |
| --- | --- |
| `Tab` / `Shift+Tab` | Move among top-level links and buttons and, when a group is open, through its links. Every link and button stays in the tab sequence. |
| `Enter` / `Space` | On a disclosure button: toggle. On a link: activate; the example also moves `aria-current="page"` to that link. |
| `Escape` | Close the open group, focus its button. |
| `Down`/`Right`, `Up`/`Left`, `Home`, `End` (optional) | Move among buttons/links without opening or closing. "Optional navigation key support is primarily for the benefit of keyboard users who are not running a screen reader" and "supplement, but do not replace, tabbing." |

Foundation's bindings are tree-like (`Enter`/`Space` toggle, `Right` open, `Left` close, `Up`/`Down` move, `Escape` closeAll; `FND/js/foundation.accordionMenu.js:30-38`). Keeping `Right` to open and `Left` to close is allowed as an optional extra, but must not remove any element from the tab sequence.

Opt-in Tree View (for sidebar page trees where the consumer wants single-stop arrow navigation): `APG/patterns/treeview/treeview-pattern.html`, example `APG/patterns/treeview/examples/treeview-navigation.html`. Requirements: `ul[role=tree][aria-label]`, `li[role=none]`, `a[role=treeitem]` with roving `tabindex` (the current page's item is the only `tabindex="0"`, and `aria-current="page"` sits on it), parent items `aria-expanded`, child `ul[role=group]` referenced with `aria-owns` from the parent `a` (the example uses `aria-owns` because the `a` is not the DOM parent of the `ul`); end nodes have no `aria-expanded`; the tree is wrapped in `nav[aria-label]` with the same label. Keys: `Down`/`Up` move without opening; `Right` opens a closed node or moves to the first child; `Left` closes an open node or moves to the parent; `Home`/`End`; type-ahead ("recommended for all trees, especially ... more than 7 root nodes"); `*` expands siblings; `Enter`/`Space` activate the link. Focus after navigation: either move focus to the new content's `h1`, or keep focus in the tree and move `aria-current`. Note: hidden branches must not contain the current page item when focus leaves the tree; the example re-expands that branch. `aria-selected` is not used in the navigation example.

## Drilldown

Foundation markup: same nested `ul.menu` syntax with `data-drilldown`; the plugin generates a `li.js-drilldown-back > a` back link in every submenu and slides panels sideways (`FND/docs/pages/drilldown-menu.md`, `FND/js/foundation.drilldown.js:88`). Nest marks it `menubar/menuitem/none`, puts `aria-haspopup="true"` on parent links and `aria-expanded` on the `li` (`FND/js/foundation.util.nest.js:22-32`), and drilldown sets `role="group"` plus `aria-hidden` on submenus (`FND/js/foundation.drilldown.js:57,93`). `aria-expanded` on a `li[role=none]` is ignored by user agents (spec rule on presentational elements), so the expanded state is currently invisible to AT.

The APG has no drilldown or "stacked panels" pattern. Two defensible mappings:

1. Default: Disclosure per level inside one `nav[aria-label]`. Each parent item is a `button[aria-expanded][aria-controls]`; the revealed level is a `ul` of links (plus the back `button`); ancestor levels are hidden with `hidden` (not off-screen) so the reading order equals what is visible; activating a parent moves focus to the first item of the new level (or to the back button); the back button returns focus to the parent button. This keeps the disclosure keyboard table from the AccordionMenu section and satisfies "persistence of focus" from the keyboard practice.
2. Opt-in: Menu and Menubar pattern with a vertical root, `APG/patterns/menubar/menu-and-menubar-pattern.html`. The keys already fit the drilldown gesture: "`Right Arrow`: When focus is in a `menu` and on a `menuitem` that has a submenu, opens the submenu and places focus on its first item"; "`Left Arrow`: When focus is in a submenu of an item in a `menu`, closes the submenu and returns focus to the parent `menuitem`"; `Escape` closes the menu that contains focus and returns focus to its opener. Roles: root `ul[role=menu]` (a persistent vertical one may be `menubar` with `aria-orientation="vertical"`), each level `ul[role=menu]` that is "the sibling element immediately following its parent `menuitem`", `li[role=none]`, `a[role=menuitem]` with `aria-haspopup="menu"` and `aria-expanded` on parents, one `tabindex="0"` item, all others `tabindex="-1"`, `aria-labelledby` on each submenu pointing at its parent item, type-ahead optional, disabled items focusable with `aria-disabled`. Only for menus of commands or when the consumer accepts the full key set; the APG caution on site navigation applies.

Correction (2026-09-26, from the [Prototype: Nested menu directive family with breakpoint mode switching](../issues/50-prototype-nested-menu.md) row 9, carried by the [Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md)): option 1's "ancestor levels are hidden with `hidden`" cannot work, because the open level is a descendant of every ancestor level, so `hidden` or `inert` on an ancestor hides or disables the open level too (`focus()` on the open level does nothing inside an `inert` root). Hidden ancestor levels, the root included, use Foundation's `invisible` class (`visibility: hidden`, which the open level overrides with Foundation's `visible` class), and only closed submenus get `inert`. The reading-order goal of option 1 still holds: `visibility: hidden` removes the ancestor levels from the accessibility tree.

Foundation's bindings (`Enter`/`Space` open, `Right` next, `Left` previous, `Up`/`Down`, `Escape` close; `FND/js/foundation.drilldown.js:31-39`) are the menu pattern's set, but Foundation's roles are wrong for it (submenus are `group` not `menu`, no roving `tabindex`, `aria-expanded` on the wrong element).

## Dropdown (`.dropdown-pane`)

Foundation markup: `button[data-toggle="id"]` + `div.dropdown-pane#id[data-dropdown]` holding arbitrary content, often a form (`FND/docs/pages/dropdown.md`). Options: `hover`, `hoverPane`, `hoverDelay`, `autoFocus`, `trapFocus`, `closeOnClick`. The plugin sets `aria-controls`, `aria-haspopup="true"`, `aria-expanded` on the trigger, `aria-labelledby` (trigger id) and `aria-hidden` on the pane, `Enter`/`Space` toggle, `Escape` close (`FND/js/foundation.dropdown.js:37-80`).

Pattern choice depends on the pane's content; the APG has no generic "popover" pattern:

- Content is a small block of text or a form: Disclosure, `APG/patterns/disclosure/disclosure-pattern.html`. Trigger is a `button` with `aria-expanded`, optionally `aria-controls`. No role on the pane. Example for the shape: `APG/patterns/disclosure/examples/disclosure-faq.html`.
- Content is a dialog-like task (several fields, its own close button) that must not be modal: non-modal `dialog`. The tooltip pattern says "A hover that contains focusable elements can be made using a non-modal dialog"; the dialog pattern's opening paragraph describes non-modal dialogs as ones that "contain their tab sequence" but "provide means for moving keyboard focus outside". Roles: pane `role="dialog"` with `aria-labelledby`/`aria-label`, no `aria-modal`; trigger `aria-haspopup="dialog"` and `aria-expanded`; `Escape` closes and returns focus.
- Content is a list of actions or links styled as a menu: Menu Button, `APG/patterns/menu-button/menu-button-pattern.html`, example `APG/patterns/menu-button/examples/menu-button-links.html` (`button[aria-haspopup=true][aria-expanded][aria-controls]` + `ul[role=menu][aria-labelledby=button]` + `li[role=none]` + `a[role=menuitem][tabindex=-1]`; `Enter`/`Space`/`Down` open and focus the first item, `Up` opens and focuses the last; inside: `Up`/`Down` wrap, `Home`/`End`, type-ahead, `Escape` closes and focuses the button, `Enter`/`Space` activate). Only when the full menu key set is implemented.

Foundation delta that matters most: `aria-haspopup="true"` on every dropdown trigger tells AT the popup is a `menu` (`ARIA:13953`: "user agents MUST treat an `aria-haspopup` value of `true` as equivalent to a value of `menu`", and the container's role MUST match). A `.dropdown-pane` holding a form is not a menu; drop the attribute (disclosure) or set `aria-haspopup="dialog"` with `role="dialog"` on the pane. `trapFocus: true` without an obscuring overlay must not become `aria-modal="true"`: the dialog pattern says "mark a dialog modal only when both: application code prevents all users from interacting in any way with content outside of it; visual styling obscures the content outside of it." `hover: true` panes must still be dismissable with `Escape` and remain open while the pointer is over the pane (`hoverPane`), as the disclosure-navigation example's 1.4.13 note and the tooltip pattern's hover rule describe.

Keyboard (disclosure or non-modal dialog):

| Key | Behaviour |
| --- | --- |
| `Enter` / `Space` on trigger | Toggle the pane. |
| `Tab` / `Shift+Tab` | Through the pane's controls and out the far side (non-modal: no wrap). |
| `Escape` | Close the pane, return focus to the trigger. |

## DropdownMenu

Foundation markup: `ul.dropdown.menu[data-dropdown-menu] > li > a + ul.menu` with arbitrary nesting; `.vertical` for a vertical root; submenus open on hover and click (`FND/docs/pages/dropdown-menu.md`). Emitted roles: root `menubar`, every nested `ul` also `menubar`, `a` -> `menuitem`, `li` -> `none`, parent links `aria-haspopup="true"` + `aria-label` (`FND/js/foundation.util.nest.js`); no `aria-expanded` on parents; keys `Enter`/`Space` open, arrows, `Escape` close (`FND/js/foundation.dropdownMenu.js:37-45`).

Pattern (default): Disclosure Navigation Menu, `APG/patterns/disclosure/examples/disclosure-navigation.html` (buttons only at top level) or `.../disclosure-navigation-hybrid.html` (top-level link plus button). See the AccordionMenu section for roles and keys; the difference is that the revealed `ul` overlays the page, so the example's "Escape closes and focuses the button" and "moving focus out of the navigation region closes an open dropdown" rules are required here. Foundation's parent `a[href]` that both navigates and opens is the case the menubar pattern says "it is recommended that authors avoid" (`APG/patterns/menubar/menu-and-menubar-pattern.html`, Note); the hybrid example resolves it with a separate button.

Pattern (opt-in): Menu and Menubar, `APG/patterns/menubar/menu-and-menubar-pattern.html`, example `APG/patterns/menubar/examples/menubar-navigation.html`. The example's own header: "Caution! ... The `menubar` pattern requires complex functionality that is unnecessary for typical site navigation ... A pattern more suited ... is the Disclosure Pattern."

Menubar roles, states, properties:

- Container `ul[role=menubar][aria-label]` (or `aria-labelledby`); wrapped in `nav` whose `aria-label` matches. Vertical root: `aria-orientation="vertical"`.
- Items are `a[role=menuitem]` (the navigation example keeps links so link behaviours survive; the menu-button-links example explains `menuitem` goes on the `a` because "the semantics of descendants of `menuitem` elements are not exposed"). `li[role=none]`.
- Submenu: `ul[role=menu]` (not `menubar`), "contained inside the same `menu` element as its parent `menuitem`" and "the sibling element immediately following its parent `menuitem`"; labelled by `aria-label` or `aria-labelledby` -> parent item. Vertical by default; `aria-orientation="horizontal"` if laid out horizontally.
- Parent item: `aria-haspopup="menu"` (or `true`) and `aria-expanded`.
- Focus: roving `tabindex` (one `menuitem` with `tabindex="0"`, all others `-1`) or `aria-activedescendant` on a focusable container.
- `aria-current="page"` on the current link; the example adds a `title` "Contains current page link" on ancestors.
- Disabled items: `aria-disabled="true"`, still focusable. Separators: `role="separator"`, not focusable.
- Note on `aria-owns`: owned items are read after DOM children; visual focus order must match.

Menubar keyboard (horizontal root, vertical submenus):

| Key | In `menubar` | In a `menu` |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | Enter the menubar on the first item (optionally the last focused); leaving closes all menus. `Tab` never enters a `menu`. | Leaves and closes all menus. |
| `Enter` | Parent item: open submenu, focus first item. Else activate and close. | Same. |
| `Space` | Optional: same as `Enter`; toggles `menuitemcheckbox`/`menuitemradio` without closing. | Same. |
| `Down` | Parent item: open submenu, focus first item. | Next item, optional wrap. |
| `Up` | Optional: open submenu, focus last item. | Previous item, optional wrap. |
| `Right` | Next item, optional wrap. | Parent item: open submenu, focus first. Otherwise: close all, move to next menubar item and (recommended) open its submenu without moving focus into it. |
| `Left` | Previous item, optional wrap. | Close submenu, focus parent item; if the parent is in the menubar, also move to the previous menubar item and open its submenu. |
| `Home` / `End` | First / last item (if no wrapping). | First / last item. |
| Printable character | Optional type-ahead. | Optional type-ahead. |
| `Escape` | - | Close the menu containing focus; focus returns to the opener. |

Vertical menubar with horizontal submenus swaps the arrow roles ("`Down Arrow` performs as `Right Arrow` ... and vice versa").

Foundation delta: submenus must become `menu`; parents need `aria-expanded`; roving `tabindex` is missing (Foundation leaves every `a[href]` in the tab sequence, which the pattern forbids for a composite); `aria-label` copies on parent links should go; hover-open must not bypass the expanded state.

## Equalizer

No APG pattern. Equalizer only sets heights. The one accessibility rule that applies is from the keyboard practice: the tab sequence and reading order follow DOM order, so equalizing must never reorder DOM to achieve layout. Nothing to add for ARIA.

## Interchange

No APG pattern. Interchange swaps `img[src]`, background images or HTML partials by media query. Rules that apply:

- `img` naming is Required: "For the HTML `img` element, use the `alt` attribute. For other elements with the `img` role, use `aria-labelledby` or `aria-label`" (names practice, role table). Swapping `src` must keep `alt` truthful; if art direction changes the meaning, the `alt` must change with it.
- Decorative images: `role="presentation"` "is equivalent to giving the image null alt text" (hiding-semantics practice); `alt=""` is the native form.
- A swapped HTML partial brings its own semantics and must not remove the focused element without moving focus (keyboard practice, persistence of focus).
- Background images carry no text alternative; if they convey information, the alternative must be in the DOM.

## Magellan

Foundation markup: `ul.menu[data-magellan] > li > a[href="#section"]` plus `section[id][data-magellan-target]`; the plugin toggles `.is-active` on the link for the section in view and optionally updates the URL hash (`FND/docs/pages/magellan.md`, `FND/js/foundation.magellan.js:186-187`). No ARIA is emitted.

No widget pattern. Composition:

- `navigation` landmark: wrap the list in `nav` with `aria-label` when the page has more than one nav; "If a page includes more than one `navigation` landmark, each should have a unique label" (`APG/patterns/landmarks/examples/navigation.html`, `APG/practices/landmark-regions/`). Foundation's own table-of-contents example already uses `nav.sticky-container`.
- Link pattern: native `a[href="#id"]` ("Authors are strongly encouraged to use a native host language link element"; `Enter` "executes the link and moves focus to the link target"; `APG/patterns/link/link-pattern.html`).
- Current section: `aria-current` on the active link, one at a time. The APG only shows `aria-current="page"` (disclosure and menubar navigation examples, breadcrumb pattern) and that token means "current page within a set of pages" (`ARIA:13186`), which a same-page section is not. The spec's other tokens: `location` ("current location within an environment or context") or `true` ("current item within a set"). Unknown tokens are treated as `true`. OPEN: the spec leaves the choice between `location` and `true` for in-page scroll spies; the safe default is `true` (any AT reads it correctly), `location` is the more specific token.
- The target `section` elements become `region` landmarks only when they have an accessible name; with many sections that runs into the "seven or fewer landmark regions" rule of thumb, so do not label them unless they should be navigable landmarks.
- Keyboard: no scripting; the focus that follows a link activation must land on the target section (see SmoothScroll).

Closest APG cousin: Breadcrumb (`APG/patterns/breadcrumb/breadcrumb-pattern.html`): a `nav` landmark with a label and `aria-current="page"` on the current item; "Keyboard Interaction: Not applicable."

## OffCanvas

Foundation markup: `div.off-canvas.position-left#id[data-off-canvas]` sibling of `div.off-canvas-content[data-off-canvas-content]`; triggers `[data-open]`/`[data-toggle]`; options `transition` (`push`/`overlap`), `contentOverlay`, `closeOnClick` (default true), `autoFocus` (default true), `trapFocus` (default false), `revealOn`/`.reveal-for-large`, `inCanvasOn`, nested panels (`FND/docs/pages/off-canvas.md`, `FND/js/foundation.offcanvas.js:600-705`). Emitted: `aria-hidden` on the panel, `aria-expanded` and `aria-controls` on triggers, `Escape` closes, `Keyboard.trapFocus` when `trapFocus` is true.

Two modes, two patterns:

1. Overlay panel that traps focus (`trapFocus: true`, `contentOverlay: true`): Dialog (Modal), `APG/patterns/dialog-modal/dialog-modal-pattern.html`. The panel gets `role="dialog"`, `aria-modal="true"`, `aria-labelledby` (a visible title in the panel) or `aria-label`; focus moves into the panel on open (first focusable element by default, or a `tabindex="-1"` static element when the content is long); `Tab`/`Shift+Tab` wrap inside; `Escape` closes; focus returns to the trigger on close; "It is strongly recommended that the tab sequence of all dialogs include a visible element with role `button` that closes the dialog" (Foundation's docs already show `button.close-button[aria-label="Close menu"][data-close]`). Interacting with the overlay to close is allowed ("in some implementations, attempts to interact with the inert content cause the dialog to close"). Do not wrap the panel's content in a landmark (landmark practice); the `nav` inside a modal off-canvas is superfluous but harmless only if not counted on.
2. Everything else (default `trapFocus: false`, `push` transition, `reveal-for-*`, in-canvas): Disclosure on the trigger (`button[aria-expanded][aria-controls]`, which Foundation already sets), and the panel's own content supplies the landmark (`nav[aria-label]` for a menu, `aside` for a sidebar). No `role="dialog"`, no `aria-modal`. The dialog pattern's note is the rule: mark modal "only when both" application code blocks interaction outside and styling obscures it; Foundation's default overlay obscures but does not block keyboard access, so `aria-modal` would be a lie for AT users ("severe negative ramifications").

Both modes: the closed panel must be hidden from AT, and `aria-hidden="true"` on an off-screen but rendered panel does that (Foundation does this); `hidden`/`inert` is the native alternative (`ARIA:14601`: "authors SHOULD mark all other contents as inert (such as 'inert subtrees' in HTML)" for the modal case). When the panel is revealed permanently (`reveal-for-large`) the `aria-hidden`, `aria-expanded` and dialog semantics must all be removed, and the trigger hidden. `Escape` closes in both modes (Foundation has it).

Keyboard (modal mode): see Reveal. Keyboard (non-modal mode): the disclosure table in the Dropdown section.

## Orbit

Foundation markup: `div.orbit[role=region][aria-label][data-orbit] > div.orbit-wrapper > (div.orbit-controls > button.orbit-previous + button.orbit-next) + ul.orbit-container > li.orbit-slide > figure.orbit-figure > img + figcaption`, then `nav.orbit-bullets > button[data-slide]` with `span.show-for-sr` labels and a `[data-slide-active-label]` "Current Slide" span (`FND/docs/pages/orbit.md`). Defaults: `autoPlay: true`, `timerDelay: 5000`, `pauseOnHover: true`, `infiniteWrap: true`, `accessible: true` (makes `.orbit-container` focusable with `tabindex="0"` and binds `Left`/`Right` arrows) (`FND/js/foundation.orbit.js:38-47,59,95-97,474-509`). The active slide receives `aria-live="polite"` whenever it is shown, including during auto-rotation (`FND/js/foundation.orbit.js:348,363`). There is no stop/start control and no pause on keyboard focus (only `mouseenter`).

Pattern: Carousel, `APG/patterns/carousel/carousel-pattern.html`. Examples: `APG/patterns/carousel/examples/carousel-1-prev-next.html` (basic) and `APG/patterns/carousel/examples/carousel-2-tablist.html` (tabbed; recommended because "Because each slide selector button adds an element to the page tab sequence, [the grouped] style is the least friendly for keyboard users").

Roles, states, properties (basic elements, all styles):

- Container: `role="region"` or `role="group"` ("depends on the information architecture of the page"; see the landmark practice), `aria-roledescription="carousel"`, `aria-labelledby` or `aria-label`; "since the `aria-roledescription` is set to 'carousel', the label does not contain the word 'carousel'". The example uses `section[aria-label]` whose implied role is `region`. Foundation's `div[role=region][aria-label]` needs only the roledescription.
- Rotation control, next and previous controls: native `button`s ("recommended"). Rotation control label toggles between e.g. "Stop slide rotation" and "Start slide rotation"; "since the label changes, the rotation control does not have any states, e.g., `aria-pressed`". The example labels are "Stop Automatic Slide Show" / "Start Automatic Slide Show". Buttons carry `aria-controls` -> the slides container.
- Each slide: `role="group"`, `aria-roledescription="slide"`, `aria-labelledby` (visible caption) or `aria-label` ("N of M" is acceptable here because `group` "does not support `aria-setsize` or `aria-posinset`"); the label omits the word "slide". Foundation's `ul/li` needs `li[role=group]` (which also removes the orphaned `listitem`) or `div`s.
- Optional live region: the element wrapping all slides has `aria-atomic="false"` and `aria-live="off"` while auto-rotating, `polite` when not. The example is emphatic: "if automatic rotation is turned on, the live region is disabled. If it were not, the page would become unusable as announcements of the continuously changing content constantly interrupt anything else the user is reading." Foundation's `aria-live="polite"` on the rotating active slide is the failure this warns about.
- Hidden slides must be hidden, not off-screen: "the screen reader experience can be confusing and disorienting if slides that are not visible on screen are incorrectly hidden, e.g., displayed off-screen."

Tabbed style (slide pickers as tabs): each slide is `role="tabpanel"` (no roledescription; the example still adds `aria-roledescription="slide"` and `aria-label="X of Y"` so it announces "Slide 1 of 6"); pickers are `button[role=tab][aria-selected][aria-controls][aria-label="Slide N"]` inside `div[role=tablist][aria-label="Slides"]` (or "Choose slide to display"); roving `tabindex` (`-1` on unselected tabs; the selected `button` simply has no `tabindex`); the tabs implement the Tabs pattern with automatic activation. The example notes "making a tab panel live is not recommended for typical tabs" and treats the carousel as the exception.

Grouped style (keeps Foundation's bullet buttons): pickers in `div[role=group][aria-label="Choose slide to display"]`, each a native `button` named after its slide (e.g. `aria-labelledby` -> the slide `group`), and "the picker button representing the currently displayed slide has the property `aria-disabled` set to `true`. Note: `aria-disabled` is preferable to the HTML `disabled` attribute because ... screen reader users benefit from the disabled button being included in the page `Tab` sequence." Foundation's `nav.orbit-bullets` is the wrong landmark for this; use `group`.

Rotation rules ("Features needed to provide sufficient rotation control"): a button to stop and restart; "Stops rotating when keyboard focus enters the carousel. It does not restart unless the user explicitly requests it to do so"; "Stops rotating whenever the mouse is hovering over the carousel." The prev/next example resumes after hover ends and after focus leaves; the tabs example resumes only via the Play button. Both examples start paused when the OS reduced-motion preference is set and offer a "disable auto-rotation" option that removes the rotation button.

Keyboard:

| Key | Behaviour |
| --- | --- |
| `Tab` / `Shift+Tab` | Through the carousel's interactive elements in DOM order; "scripting for `Tab` is not necessary." The rotation control "is the first element in the `Tab` sequence inside the carousel. It is essential that it precede the rotating content." |
| `Enter` / `Space` on a button | Button pattern. "Activating the rotation control, next slide, and previous slide do not move focus, so users may easily repetitively activate them." |
| `Left` / `Right` / `Home` / `End` on a tab (tabbed style only) | Tabs pattern, automatic activation: move focus and show that slide. |

Foundation delta: add the rotation control (first in tab order), pause on `focusin`, turn `aria-live` off while rotating, add `aria-roledescription` on container and slides, name the slides, replace `nav.orbit-bullets` with `tablist` (or `group` + `aria-disabled`), drop the focusable `.orbit-container` (a focusable element with no widget role and arrow-key handling is outside every APG pattern; the tablist gives arrow navigation legitimately), hide inactive slides with `hidden`, and honour reduced motion.

## ResponsiveAccordionTabs

Foundation takes accordion or tabs markup and re-initialises the other plugin per breakpoint, stripping the previous roles and attributes first (`FND/js/foundation.responsiveAccordionTabs.js:191-197`; `FND/docs/pages/responsive-accordion-tabs.md`).

No combined pattern exists. Rules: each mode must satisfy its own pattern in full (Accordion section above below the breakpoint, Tabs section below above it). Two consequences from the practices:

- Heading semantics flip. In accordion mode each header should be a heading containing a button; in tabs mode the same element becomes a `tab`, whose descendants are presentational, so any heading inside it disappears from AT ("`<li role="tab"><h2>Title of My Tab</h2></li>` ... the heading does not exist", hiding-semantics practice). The rendered element per mode should therefore differ (heading + button versus a bare tab), not just its attributes.
- Focus continuity. Re-rendering while the header has focus must not drop `document.activeElement` to `body` (keyboard practice, "Persistence of focus"); the mode switch must refocus the equivalent control.
- Tabs mode needs `tablist` labelling and `tabpanel[tabindex=0]` for panels without focusable content; accordion mode needs `aria-disabled` on the sole open header when `allowAllClosed` is false and must limit `region` roles.

## ResponsiveMenu

`data-responsive-menu="drilldown medium-dropdown"` swaps between Drilldown, AccordionMenu and DropdownMenu per breakpoint (`FND/docs/pages/responsive-navigation.md`). Each mode follows its own section above. The `nav[aria-label]` landmark stays constant across modes, and the same focus-continuity rule as ResponsiveAccordionTabs applies. With the disclosure mapping as the default for all three menu plugins, the role set is identical in every mode (buttons with `aria-expanded`/`aria-controls`, native lists, `aria-current="page"`), which removes most of the swap.

## ResponsiveToggle

Foundation markup: `div.title-bar[data-responsive-toggle="menu-id"][data-hide-for="medium"] > button.menu-icon[data-toggle="menu-id"] + div.title-bar-title` and the target `#menu-id` (`FND/docs/pages/responsive-navigation.md`). The plugin emits no ARIA (`FND/js/foundation.responsiveToggle.js`, no matches for `aria`).

Pattern: Disclosure, `APG/patterns/disclosure/disclosure-pattern.html`; the mobile navigation button of the disclosure-navigation example is the shape. Requirements: the trigger is a `button` with `aria-expanded` and `aria-controls` -> the menu; `Enter`/`Space` toggle. Naming: `button.menu-icon` has no content, so it needs a name; the names practice prefers visible text, so `aria-labelledby` pointing at `.title-bar-title` ("Menu") beats an `aria-label` (and the practice's rule 2 suggests the design include the visible label). Above the breakpoint the title bar is `display:none` and the menu is always visible, so the disclosure state is simply absent; the target itself is a `nav` landmark. If `data-animate` is used, the toggled content still needs `hidden` when closed.

## Reveal

Foundation markup: `div.reveal#id[data-reveal]` with content and `button.close-button[data-close][aria-label="Close modal"]`; opener `[data-open="id"]`; options `closeOnClick` (default true), `closeOnEsc`, `overlay` (default true), `fullScreen`, `multipleOpened`, `deepLink`; nested modals allowed (`FND/docs/pages/reveal.md`). Emitted: `role="dialog"` and `aria-hidden` on the modal, `aria-controls` + `aria-haspopup="dialog"` on the opener, focus moved onto the `.reveal` element itself and `Keyboard.trapFocus`, focus returned to `$activeAnchor` on close, `Escape` closes (`FND/js/foundation.reveal.js:38-70,285-317,447,484`). No `aria-modal`, no `aria-labelledby` unless the consumer adds it (the docs' Accessibility section recommends it).

Pattern: Dialog (Modal), `APG/patterns/dialog-modal/dialog-modal-pattern.html`; example `APG/patterns/dialog-modal/examples/dialog.html`. Confirmation dialogs: Alert Dialog, `APG/patterns/alertdialog/alertdialog-pattern.html`, example `APG/patterns/alertdialog/examples/alertdialog.html`.

Roles, states, properties:

- Container `role="dialog"` (or `alertdialog`); "All elements required to operate the dialog are descendants of the element that has role `dialog`"; `aria-modal="true"`; `aria-labelledby` -> visible title, else `aria-label` (name Required).
- Optional `aria-describedby` -> the element(s) describing the dialog's purpose; omit it "if the dialog content includes semantic structures, such as lists, tables, or multiple paragraphs". For `alertdialog` it is required and points at the message.
- Modal only when both conditions hold (see OffCanvas). With `data-overlay="false"` the page is not obscured; either keep the trap and accept the mismatch or drop `aria-modal` and treat it as a non-modal dialog. Foundation's `closeOnClick` outside the modal is permitted by the pattern.
- `aria-modal` "replaces `aria-hidden`" on the background; if `aria-hidden` is used instead, it goes on every element containing a portion of the inert layer and the dialog must not be inside any of them. The spec's preference is host-language inert (`ARIA:3620`, `ARIA:14601`).
- Focus: "When a dialog opens, focus moves to an element inside the dialog", usually the first focusable element; for long text, a `tabindex="-1"` static element at the top (title or first paragraph); for irreversible actions, "the least destructive action"; for OK/Continue-only dialogs, the most frequently used button. The example is explicit: "Please DO NOT make the element with role dialog focusable!" (large focus target, no visible indicator, screen readers read the whole content). Foundation focuses the `.reveal` element (`FND/js/foundation.reveal.js:288,316`), which is exactly this anti-pattern.
- On close, focus returns to the invoker unless it no longer exists or the workflow logically continues elsewhere. Foundation does this.
- "It is strongly recommended that the tab sequence of all dialogs include a visible element with role `button` that closes the dialog." Foundation's `.close-button` with `aria-label="Close modal"` satisfies it (the `x` inside is `aria-hidden`).
- Nested dialogs: the example "demonstrates multiple layers of modal dialogs"; each layer traps focus and returns focus to the button in the previous layer.
- Opener: `aria-haspopup="dialog"` is a valid token (`ARIA:13953`); the spec advises using `aria-haspopup` only when a visual indicator suggests a popup, so it is optional, not required. `aria-controls` on the opener is not part of the pattern.

Keyboard:

| Key | Behaviour |
| --- | --- |
| `Tab` | Next tabbable element inside the dialog; from the last, wraps to the first. |
| `Shift+Tab` | Previous; from the first, wraps to the last. |
| `Escape` | Closes the dialog. |

Alert dialog specifics: same keys; initial focus on the least destructive button ("No"); `aria-disabled` rather than `disabled` on buttons that must stay discoverable (example's "Accessibility Features").

## Slider

Foundation markup: `div.slider[data-slider][data-initial-start][data-end] > span.slider-handle[data-slider-handle][role=slider][tabindex] + span.slider-fill + input[type=hidden]`; two handles and two inputs for a range; `.vertical` + `data-vertical="true"`; `.disabled` class; `aria-controls` from handle to an external `input[type=number]` for data binding; `data-step`, non-linear value functions (`FND/docs/pages/slider.md`). Emitted on each handle: `role="slider"`, `aria-controls` (bound input), `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-orientation`, `tabindex="0"` (`FND/js/foundation.slider.js:323-329`); keys `Right`/`Up` increase, `Left`/`Down` decrease, `Shift+Arrow` fast, `Home` min, `End` max, RTL map (`FND/js/foundation.slider.js:40-60`). The docs also describe the native `<input type="range">` styling, which "has no support for vertical orientation" and "no support for two handles" in Foundation's CSS.

Pattern: Slider, `APG/patterns/slider/slider-pattern.html`; two handles: Slider (Multi-Thumb), `APG/patterns/slider-multithumb/slider-multithumb-pattern.html`. Examples: `APG/patterns/slider/examples/slider-temperature.html` (vertical, `aria-valuetext` with a unit) and `APG/patterns/slider-multithumb/examples/slider-multithumb.html`.

APG warning, verbatim in both patterns: "Some users of touch-based assistive technologies may experience difficulty utilizing widgets that implement this slider pattern because the gestures their assistive technology provides for operating sliders may not yet generate the necessary output ... Authors should fully test slider widgets using assistive technologies on devices where touch is a primary input mechanism before considering incorporation into production systems." A native `<input type="range">` does not carry this risk, which supports the map's "native first" preference and the prototype the map lists.

Roles, states, properties:

- The focusable thumb has `role="slider"` ("Focus is placed on the slider (the visual object that the mouse user would move, also known as the thumb"). `aria-valuenow` (decimal; spec MUST), `aria-valuemin`, `aria-valuemax`; `aria-valuetext` when the number is not user friendly (units, day names); `aria-labelledby` -> visible label, else `aria-label` (name Required; Foundation sets none); `aria-orientation="vertical"` when vertical (default horizontal).
- Multi-thumb: each thumb is its own `slider`; "the tab order remains constant regardless of thumb value and visual position"; when one thumb bounds the other, "the values of `aria-valuemin` or `aria-valuemax` of the dependent sliders are updated when the value changes" (Foundation clamps but does not update the ARIA bounds, `FND/js/foundation.slider.js:210-213`).
- Children of a `slider` are presentational (spec), so value text rendered inside the thumb is not exposed separately.
- `.disabled`: expose with `aria-disabled="true"` (the pattern does not say; the keyboard practice's convention decides focusability).

Keyboard:

| Key | Behaviour |
| --- | --- |
| `Right` / `Up` | Increase by one step. |
| `Left` / `Down` | Decrease by one step. |
| `Home` / `End` | First / last allowed value. |
| `Page Up` / `Page Down` (optional) | Larger step (the examples use 10 or 20 steps). |

"In some circumstances, reversing the direction of the value change for the keys specified above, e.g., having `Up Arrow` decrease the value, could create a more intuitive experience" covers Foundation's RTL map. Foundation's `Shift+Arrow` fast step is an extra; `Page Up`/`Page Down` are the conventional keys.

## SmoothScroll

Foundation markup: `a[href="#id"][data-smooth-scroll]` or a `ul.menu[data-smooth-scroll]` of such links (`FND/docs/pages/smooth-scroll.md`). No ARIA is emitted.

No pattern. Link pattern applies: native `a[href]`; "`Enter`: Executes the link and moves focus to the link target." When JavaScript intercepts the click to animate the scroll, it must still move focus to the target (the keyboard practice's persistence and predictability rules), otherwise the next `Tab` starts from the link, not from the section the user sees. The carousel examples' reduced-motion handling ("If the user has chosen reduced motion in system settings ...") is the only APG statement on motion preferences; the same courtesy applies to animated scrolling. Native `scroll-behavior: smooth` plus fragment navigation gives both the focus move and the reduced-motion respect without script (outside APG scope, recorded for the "native first" rule).

## Sticky

No pattern. `position: sticky`/`fixed` does not change DOM order, so tab order and reading order are unaffected (keyboard practice: "The default order of elements in the tab sequence is the order of elements in the DOM"). A sticky bar that overlaps focused content is a visual-focus-indicator problem, not an ARIA one. Nothing else applies.

## Tabs

Foundation markup: `ul.tabs[data-tabs] > li.tabs-title > a[href="#panel1"]` + `div.tabs-content[data-tabs-content] > div.tabs-panel#panel1`; `.vertical`; `data-active-collapse="true"` lets the active tab collapse; deep linking (`FND/docs/pages/tabs.md`). Emitted: `ul[role=tablist]`, `li[role=presentation]`, `a[role=tab][aria-controls][aria-selected][tabindex=0|-1]`, panels `role="tabpanel"` with `aria-labelledby` and `aria-hidden`; keys `Enter`/`Space` open, `Right`/`Down` next, `Left`/`Up` previous with activation on move, `wrapOnKeys` default true, `autoFocus` default false (`FND/js/foundation.tabs.js:28-37,48-81,219-235,492-500`).

Pattern: Tabs, `APG/patterns/tabs/tabs-pattern.html`. Examples: `APG/patterns/tabs/examples/tabs-automatic.html` (recommended: "It is recommended that tabs activate automatically when they receive focus as long as their associated tab panels are displayed without noticeable latency") and `APG/patterns/tabs/examples/tabs-manual.html`.

Roles, states, properties:

- `tablist` container with `aria-labelledby` (visible label) or `aria-label`; `aria-orientation="vertical"` when vertical (Foundation's `.vertical` class does not set it).
- Each `tab` inside the `tablist`, `aria-controls` -> its `tabpanel`, `aria-selected="true"` on the active tab and `false` on the rest; `aria-haspopup` only if the tab has a popup menu.
- Each `tabpanel` with `aria-labelledby` -> its tab; "When the tabpanel does not contain any focusable elements or the first element with content is not focusable, the tabpanel should set `tabindex="0"`"; the automatic example recommends all panels be focusable if any panel needs it.
- Roving `tabindex` on tabs (`-1` on unselected; a native `button` tab needs no explicit `0`). The hiding-semantics practice shows `li[role=presentation]` around `a[role=tab]`, Foundation's structure.
- Tab descendants are presentational; do not put headings inside tabs.
- `aria-current` is not a substitute for `aria-selected` in a tablist (`ARIA:13186`).

Keyboard:

| Key | Behaviour |
| --- | --- |
| `Tab` | Into the tablist: focus the active tab. Out of it: "moves focus to the next element in the page tab sequence outside the tablist, which is the tabpanel unless the first element containing meaningful content inside the tabpanel is focusable." |
| `Left` / `Right` (horizontal) | Previous / next tab, wrapping; optionally activates (automatic activation). |
| `Up` / `Down` | Only when `aria-orientation="vertical"`: "If the tab list is horizontal, it does not listen for `Down Arrow` or `Up Arrow` so those keys can provide their normal browser scrolling functions." |
| `Space` / `Enter` | Activates the tab "if it was not activated automatically on focus". |
| `Home` / `End` (optional) | First / last tab, optionally activating. |
| `Shift+F10` | Opens the tab's popup menu if it has one. |
| `Delete` (optional) | Closes the tab and its panel; focus moves to the following tab, or the preceding one if it was last. |

Foundation delta: Up/Down are bound on horizontal tab lists (should be vertical-only, `FND/js/foundation.tabs.js:32-33`); no `tablist` label; no `aria-orientation`; no `tabindex="0"` on panels; `aria-hidden` on panels is redundant with `hidden`. `activeCollapse` (no tab selected, no panel shown) has no APG support and sits awkwardly with the spec's "if a `tab` is active, a corresponding `tabpanel` ... is rendered"; if kept, the collapsed state must leave every tab `aria-selected="false"` and, being an accordion behaviour, is better served by the Accordion pattern.

## Toggler

Foundation markup: any element `#id[data-toggler=".class"]` or `[data-toggler][data-animate="in out"]`, toggled by `[data-toggle="id"]` (the docs use `<a data-toggle>` without `href`), `[data-toggle-focus="id"]` (toggle on focus/blur), `[data-closable]` + `[data-close]` (remove once), multiple targets (`FND/docs/pages/toggler.md`). Emitted: `aria-expanded` and `aria-controls` on triggers, updated from the target's visibility or class (`FND/js/foundation.toggler.js:54-76,145`).

Patterns, by what is toggled:

- Visibility of another element (`data-animate`, `is-hidden`, `.expanded` on a menu): Disclosure. Trigger `button[aria-expanded][aria-controls]`; content hidden with `hidden` when collapsed. Foundation's `<a data-toggle>` with no `href` is not focusable and has no role; it must be a `button`. Example: `APG/patterns/disclosure/examples/disclosure-faq.html`.
- A state class on the target that is not visibility (theme, layout mode): Button pattern toggle button, `APG/patterns/button/button-pattern.html`: `button[aria-pressed="true|false"]`; "it is critical the label on a toggle does not change when its state changes ... if the design were to call for the button label to change from 'Mute' to 'Unmute', the aria-pressed attribute would not be needed." Example: `APG/patterns/button/examples/button.html`. `aria-expanded` would be wrong here because nothing is expanded.
- An on/off setting: Switch, `APG/patterns/switch/switch-pattern.html` (`role="switch"` + `aria-checked`, or `input[type=checkbox][role=switch]` with a `label`; `Space` toggles, `Enter` optional; label must not change with state).
- `data-closable`: a plain Button that removes content; the keyboard practice's persistence rule requires moving focus to a logical element (e.g. the next item or the container) when the focused close button disappears with its callout.
- `data-toggle-focus`: content shown on focus and hidden on blur. The APG covers content-on-focus only through the disclosure-navigation example's note that dismiss-on-`Escape` "is necessary to meet WCAG 2.1 1.4.13: Content on Hover or Focus". Record it as a design constraint (Escape dismissal and hoverable/focusable persistence) rather than an APG pattern.

Keyboard (disclosure and toggle button): `Enter` / `Space` activate; focus stays on the trigger ("If activating the button does not dismiss the current context, then focus typically remains on the button after activation", button pattern).

## Tooltip

Foundation markup: `span[data-tooltip][tabindex][title="..."]` or `button[data-tooltip][title]`; the plugin moves `title` into a generated `div[role=tooltip][aria-hidden]` and sets `aria-describedby` on the trigger; options `clickOpen` (default true: a click keeps it open until a click elsewhere), `disableHover`, `showOn` breakpoint, `tipText`, positioning (`FND/docs/pages/tooltip.md`, `FND/js/foundation.tooltip.js:44-61,108-109,329-388`). No `Escape` handling.

Pattern: Tooltip, `APG/patterns/tooltip/tooltip-pattern.html`, with its own banner: "NOTE: This design pattern is work in progress; it does not yet have task force consensus. Progress and discussions are captured in issue 128" and "Work to develop a tooltip example is tracked by issue 127." There is no example directory in the clone (`APG/patterns/tooltip/` holds only the pattern page).

Roles, states, properties:

- Tooltip container `role="tooltip"`; the trigger references it with `aria-describedby`. The spec adds: reference it "before or at the time the tooltip is displayed" (`ARIA:11278`); Foundation sets `aria-describedby` at init, which satisfies this even while the tip is `aria-hidden` (the description is still computed from hidden content only if the browser follows accname's hidden-reference rule; the safe reading is to keep the tip in the DOM and toggle `hidden`).
- Name: tooltip is named from content; `aria-label`/`aria-labelledby` are prohibited on it (`ARIA:11278`, names table).
- "Tooltip widgets do not receive focus. A hover that contains focusable elements can be made using a non-modal dialog."
- The tooltip is not a popup for `aria-haspopup` purposes (`ARIA:13953`).

Keyboard and pointer:

| Trigger | Behaviour |
| --- | --- |
| `Escape` | Dismisses the tooltip. Foundation has no `Escape` binding (delta). |
| Focus | "Focus stays on the triggering element while the tooltip is displayed"; "If the tooltip is invoked when the trigger element receives focus, then it is dismissed when it no longer has focus (onBlur)." |
| Hover | "If the tooltip is invoked when a pointing cursor moves over the trigger element, then it remains open as long as the cursor is over the trigger or the tooltip." |
| Delay | "typically appears after a small delay"; spec: "Typical tooltip delays last from one to five seconds." |

Foundation delta and open points: `tabindex="1"` in the docs (use `0`); a `span` made focusable only to host a tooltip is a focusable `generic` with no role and a prohibited name, which the APG never shows; the pattern presumes the trigger is a natively focusable element (`button`, `a`, `input`). OPEN: whether the next library allows tooltips on non-interactive text at all, or requires an interactive host. `clickOpen: true` (sticky open on click) is outside the pattern; if kept, `Escape` must still dismiss. Because the pattern lacks consensus, the spec should treat the tooltip rules as the minimum and expect revision.

## Foundation-to-APG delta summary (facts a spec will need)

| Plugin | Foundation today (6.9) | Required change per APG or spec |
| --- | --- | --- |
| Accordion | `a[href=#][aria-expanded][aria-controls]`, unconditional `role=region`, arrow/Home/End keys | `hN > button`; `aria-disabled` on the un-collapsible open header; `region` only when panels are few or structured; arrow keys optional |
| AccordionMenu | `menubar/menuitem/none` + `group` + `aria-multiselectable` | native lists + `button[aria-expanded][aria-controls]` (+ link in hybrid), `nav[aria-label]`, `aria-current="page"`; or full Tree View |
| Drilldown | `menubar/menuitem/none`, `aria-expanded` on `li[role=none]` (ignored), `group` submenus | disclosure per level with focus handoff, or full Menu (vertical) with `menu` submenus and roving `tabindex` |
| Dropdown | `aria-haspopup="true"` (= menu) on trigger for arbitrary pane | drop it (disclosure) or `aria-haspopup="dialog"` + `role=dialog`; never `aria-modal` without an obscuring overlay |
| DropdownMenu | nested `menubar`s, no `aria-expanded`, all links tabbable, hover-open | disclosure navigation by default; menubar opt-in needs `menu` submenus, `aria-expanded`, roving `tabindex`, full key table |
| Magellan | `.is-active` only | `nav[aria-label]`, `aria-current` (`true` or `location`; OPEN) |
| OffCanvas | `aria-hidden`, trigger `aria-expanded`/`aria-controls`, optional trap, no `role` | `dialog` + `aria-modal` only in trap-and-overlay mode; disclosure + landmark otherwise |
| Orbit | region + label, sr-only button text, `aria-live=polite` while rotating, focusable wrapper with arrows, no stop button, `nav` bullets | `aria-roledescription`, slide `group`/`tabpanel` naming, live region off while rotating, rotation control first, pause on focus, tablist bullets, reduced motion |
| Reveal | `role=dialog`, trap, focus on the dialog element, `aria-haspopup=dialog` on opener, no `aria-modal` | `aria-modal="true"`, focus an element inside (never the dialog), `aria-labelledby`, optional `aria-describedby`; `alertdialog` for confirmations |
| Slider | `role=slider` + values + orientation + `tabindex=0`, no name, Shift+Arrow fast step | `aria-labelledby`/`aria-label`, `aria-valuetext` where useful, Page Up/Down, dependent min/max updates for two thumbs; native range avoids the APG touch warning |
| Tabs | correct roles and roving `tabindex`; Up/Down bound horizontally; no tablist label/orientation; `activeCollapse` | vertical-only Up/Down, `aria-orientation`, `tablist` name, `tabpanel[tabindex=0]`; drop or isolate `activeCollapse` |
| Toggler | `aria-expanded`/`aria-controls` on possibly non-focusable `<a>` triggers | `button`; `aria-pressed` when a non-visibility state is toggled; focus handoff on `data-closable` |
| Tooltip | `role=tooltip` + `aria-describedby`, `title` moved, `tabindex=1`, no Escape | `Escape` dismiss, `tabindex=0`, interactive hosts; pattern itself is unsettled |
| ResponsiveToggle | no ARIA | `button[aria-expanded][aria-controls]` named via `aria-labelledby` -> title text |
