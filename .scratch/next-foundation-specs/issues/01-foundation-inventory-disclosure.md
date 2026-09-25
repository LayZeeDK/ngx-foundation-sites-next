# 01. Foundation plugin inventory A: Accordion, Tabs, ResponsiveAccordionTabs, Toggler, Reveal

Type: research
Status: resolved
Blocked by: none
Labels: wayfinder:research
Map: ../map.md

## Question

What exactly do Foundation's Accordion, Tabs, ResponsiveAccordionTabs, Toggler, and Reveal plugins do: markup, options, events, methods, keyboard handling, and utility dependencies? The disclosure family shares the show-or-hide-content pattern; capture what is common and what differs.

Sources: `d:/projects/github/foundation/foundation-sites/js/foundation.{accordion,tabs,responsiveAccordionTabs,toggler,reveal}.js` and `d:/projects/github/foundation/foundation-sites/docs/pages/{accordion,tabs,responsive-accordion-tabs,toggler,reveal}.md`. Online fallback: https://get.foundation/sites/docs/<name>.html.
## Deliverable

`research/foundation-inventory-disclosure.md` with one section per plugin containing:

1. **Purpose** in one or two sentences, in Foundation's own words.
2. **Markup contract**: the elements, CSS classes, and state classes (`is-active`, `is-open`, and so on) the plugin expects and toggles. Quote the docs example markup.
3. **Options**: every `data-*` option with its JS default, type, and meaning, from the plugin source (`js/foundation.<name>.js` under `d:/projects/github/foundation/foundation-sites`) cross-checked against `docs/pages/<name>.md`.
4. **Events**: every `*.zf.<plugin>` event the plugin fires or listens for, and what triggers it.
5. **Public methods** and what they do.
6. **Keyboard and ARIA behaviour** the plugin implements today (what it sets, what keys it handles, via `foundation.util.keyboard.js` registrations).
7. **Dependencies on utilities** (MediaQuery, Motion, Triggers, Keyboard, Nest, Box, Touch, Timer, ImageLoader) and on other plugins.
8. **Sass configuration** that shapes behaviour (breakpoint maps, animation settings) as opposed to pure theming.
9. **Behaviour that only jQuery makes easy** and might not carry over (for a later ticket to decide).

Cite the file path and, where practical, the line or function for each claim. Plain ASCII. Do not read this repo's `packages/ngx-foundation-sites/COMPONENT_BUILDING_BLOCKS.md` or the existing Angular implementations: the findings must come from Foundation's own sources.

## Answer

Gist (all from the local 6.9.0 clone; no online fetch was needed):

- Options are ingested as `$.extend({}, defaults, $el.data(), options)`, so `data-multi-expand` -> `multiExpand` is jQuery `.data()` camelCasing plus coercion; `data-options="k: v;"` is parsed by `Foundation.reflow` and wins over individual attributes. `init.zf.<name>` and `destroyed.zf.<name>` come from the `Plugin` base class for all five.
- Accordion: `.accordion[data-accordion]` > `.accordion-item[data-accordion-item].is-active` > first child `<a>` + child `[data-tab-content]`. Options `slideSpeed 250`, `multiExpand false`, `allowAllClosed false`, `deepLink false`, `deepLinkSmudge false`, `deepLinkSmudgeDelay 300`, `deepLinkSmudgeOffset 0`, `updateHistory false`, plus a `disabled` HTML attribute. Events `down`/`up` (after slide animation), `deeplink`. Keys ENTER/SPACE toggle, UP/DOWN/HOME/END move focus and, in single-expand mode, also open the pane; no wrap. ARIA: `aria-controls`/`aria-expanded` on the `<a>`, `role=region`/`aria-labelledby`/`aria-hidden` on content. Content hidden by inline jQuery slide, not by class. Only utility: Keyboard.
- Tabs: `ul.tabs[data-tabs][id]` > `li.tabs-title.is-active` > `a[href=#panel]` or `a[data-tabs-target]`; `.tabs-content[data-tabs-content=id]` > `.tabs-panel.is-active[id]`. Panel visibility is CSS (`.tabs-panel.is-active { display:block }`), and active styling reads `a[aria-selected=true]`. 13 options including the deep-link trio, `autoFocus`, `wrapOnKeys true`, `matchHeight`, `activeCollapse`, and four class-name options. Events `change` [li, panel], `collapse`, `deeplink`, synchronous. Keys ENTER/SPACE, all four arrows with automatic activation and wrap; TAB ignored; no HOME/END; no orientation or RTL awareness. Full tablist/tab/tabpanel ARIA with roving tabindex. Utilities: Keyboard, ImageLoader (matchHeight), `changed.zf.mediaquery`.
- ResponsiveAccordionTabs: `data-responsive-accordion-tabs="accordion medium-tabs large-accordion"`, rule = `[bp-]plugin`, last matching `MediaQuery.atLeast` wins; destroys and re-creates the child plugin on the same element and rewrites the DOM (moves panels in and out of a generated `.tabs-content`, leaves a placeholder div, rewrites hrefs). No own options; all Accordion and Tabs options pass through. Methods `open`, `close` (accordion only), `toggle` (accordion only). Breakpoint names come from Sass `$breakpoints` via the `.foundation-mq` meta font-family.
- Toggler: target `[id][data-toggler=".class"]` or `[data-toggler][data-animate="in out"]`; triggers `[data-toggle]`, `[data-toggle-focus]` via the Triggers utility. Options `toggler` (required unless animate) and `animate false`. Events `on`/`off`. Listens only to `toggle.zf.trigger`. Sets `aria-expanded`/`aria-controls` on triggers. No keyboard, no Sass. `data-closable` belongs to Triggers, not Toggler.
- Reveal: `.reveal[data-reveal][id]`, plugin generates `.reveal-overlay` and MOVES the modal inside it under `appendTo` (body). 16 options; notable defaults `closeOnClick true`, `closeOnEsc true`, `overlay true`, `multipleOpened false`, `vOffset/hOffset 'auto'`. Events `closeme` (before open, closes other reveals through Triggers), `open` (synchronous, before animation ends), `closed` (after). ESC only key; focus moved to the modal (`tabindex=-1`), TAB trapped by Keyboard util, focus returned to the opener. ARIA `role=dialog`, `aria-hidden`; no `aria-modal`, no inert. Scroll lock via `html.is-reveal-open` + `html { top:-scrollTop }`. Below the `medium` breakpoint the modal is always full-screen (Sass).

Surprises:

- ResponsiveAccordionTabs strips tab ARIA from the wrong elements (`$panels.children('a')`, line 197), so title links keep `role=tab`/`aria-selected` after switching to accordion (read from source, not run).
- Toggler matches multi-id triggers with `~=` at init but `=` on update, so `aria-expanded` on multi-target triggers goes stale.
- Reveal docs claim `.full` sets an `escClose` option and creates a close button; neither exists in the JS. The reveal test suite passes a `trapFocus` option that does not exist.
- `data-toggle-focus` toggles on both focus and blur, not open/close.
- Event naming is inconsistent across the family (`open`/`closed`, `down`/`up`, `change`, `on`/`off`, `closeme`), which the output-naming rule ticket will have to reconcile.

Open questions (for later tickets, none blocked research): keep Accordion's arrow-key auto-open and Tabs' automatic activation; how much of Reveal's `closeme`/`appendTo`/offset positioning survives a native `<dialog>`; whether the RAT rule-string syntax is kept as the input format.

Findings: ../research/foundation-inventory-disclosure.md
