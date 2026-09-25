# 03. Foundation plugin inventory C: Dropdown, Tooltip, Positionable, Sticky, Magellan, SmoothScroll

Type: research
Status: resolved
Blocked by: none
Labels: wayfinder:research
Map: ../map.md

## Question

What exactly do Foundation's Dropdown, Tooltip, Sticky, Magellan, and SmoothScroll plugins do, and what does the shared Positionable base class give Dropdown and Tooltip? Capture the positioning model (position, alignment, auto-position, offsets, collision handling via the Box utility) in enough detail that a later ticket can compare it with CSS anchor positioning and the CDK Overlay.

Sources: `d:/projects/github/foundation/foundation-sites/js/foundation.{dropdown,tooltip,positionable,sticky,magellan,smoothScroll}.js`, `d:/projects/github/foundation/foundation-sites/js/foundation.util.box.js`, and `d:/projects/github/foundation/foundation-sites/docs/pages/{dropdown,tooltip,sticky,magellan,smooth-scroll}.md`. Online fallback: https://get.foundation/sites/docs/<name>.html.
## Deliverable

`research/foundation-inventory-positioned.md` with one section per plugin containing:

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

Gist (all from the local clone at v6.9.0; file:line citations in the findings):

- Positionable is the shared model for Dropdown and Tooltip: 4 positions (left/right/top/bottom) x 3 alignments (left/right/center or top/bottom/center) = 12 candidate placements. `auto` resolves to `bottom` + RTL-aware `left`/`right` (Dropdown, overridable by legacy `.top/.left/.right/.bottom` on the pane and `.float-*` on the anchor) or `top` + `center` (Tooltip). Defaults: `allowOverlap: false`, `allowBottomOverlap: true` (Dropdown) / `false` (Tooltip), `vOffset`/`hOffset: 0`.
- Placement is computed in document coordinates by `Box.GetExplicitOffsets` (full formula table in the findings) and applied with jQuery `.offset()`, which depends on the CSS `position: absolute` on `.dropdown-pane` / `.tooltip`.
- Collision handling: unless `allowOverlap`, loop through the 12 candidates (alignments cyclically within a position, then positions in fixed order left, right, top, bottom) until `Box.OverlapArea` is 0 against the bounding box; else keep the least-overlapping candidate. The "window" bound is the body box at the current scroll offset, not the viewport. Bounding container is `parentClass` for Dropdown, always the body box for Tooltip.
- Dropdown: plugin lives on the pane; anchors are `[data-toggle=id]` (or `[data-open=id]`); toggles `.is-opening` -> `.is-open`, `aria-hidden`, `aria-expanded`, `.hover` on anchors, `has-position-*`/`has-alignment-*` (no Sass consumer). Options: parentClass, hoverDelay 250, hover, hoverPane, trapFocus, autoFocus, closeOnClick, forceFollow true, plus the 6 positioning ones. Events: closeme/show/hide.zf.dropdown; listens to open/close/toggle/resizeme.zf.trigger.
- Tooltip: plugin lives on the trigger; builds `<div class="tooltip" role="tooltip" aria-hidden id>` appended to body, blanks `title`, sets `aria-describedby`. Shows on hover (delay 200), focus, mousedown (`clickOpen` true), tap; hides on mouseleave/focusout; `showOn: 'small'` breakpoint gate; jQuery fadeIn/fadeOut 150 ms; `tooltipHeight` 14 / `tooltipWidth` 12 px pad for the CSS pip. Events: closeme/show/hide.zf.tooltip. No keyboard handling, no ESC.
- Sticky: JS emulation of position: fixed within a range; requires a `[data-sticky-container]` parent (or wraps one); classes `.is-stuck/.is-anchored` + `.is-at-top/.is-at-bottom`; range from `anchor` or `topAnchor`/`btmAnchor` (`id[:top|bottom]` or px); `stickTo` top/bottom; `marginTop/Bottom` in em (default 1); `stickyOn: 'medium'`; `dynamicHeight`, `checkEvery -1`. Events `sticky.zf.stuckto:top|bottom`, `sticky.zf.unstuckfrom:top|bottom`, `pause.zf.sticky`. No public methods, no ARIA. Sass has no variables.
- Magellan: `[data-magellan]` container of `a[href^="#"]`; targets are every `[data-magellan-target]` in the document; toggles `is-active` on the `<a>` (menu Sass expects it on the `<li>`); options animationDuration 500, animationEasing linear, threshold 50, activeClass, deepLinking false, updateHistory false, offset 0; event `update.zf.magellan`; methods calcPoints/scrollToLoc/reflow; delegates scrolling to SmoothScroll. No ARIA (no aria-current).
- SmoothScroll: `[data-smooth-scroll]` on a container or link; static `scrollToLoc(loc, options, cb)` animates `html, body` scrollTop with jQuery; options animationDuration/animationEasing/threshold/offset; no own events.

Surprises:

- Dropdown's ENTER/SPACE keyboard path is dead code: commit bca6cf55f (2018) renamed the commands to `toggle` but the handler map only has `open`/`close`. Buttons still work via the native click. ESC closes and refocuses the anchor.
- After one open where no placement fits, Positionable's `triedPositions` stays full and later opens skip the collision search entirely.
- Reveal reuses the `click.zf.dropdown tap.zf.dropdown` body-handler namespace, so closing a Reveal unbinds an open Dropdown's `closeOnClick` handler.
- Tooltip `touchCloseText` and the `data-is-focus` attributes are written but never read. Tooltip's JSDoc says default position auto, code resolves it to `top`; docs say "appears below".
- Magellan docs name the option `data-deep-link`, which jQuery maps to `deepLink`, not the `deepLinking` option the code reads.
- Magellan's load hook uses a bare `$(window).one('load')`, which never fires if the plugin initializes after load.

Open questions for later tickets (not settled here, by design of this ticket): whether the body-box collision bound should be reproduced or replaced by viewport/CDK/CSS anchor semantics; whether Sticky's two-anchor ranges and stick-to-bottom survive a CSS `position: sticky` implementation; whether Magellan's threshold/direction heuristics map onto IntersectionObserver.

Findings: ../research/foundation-inventory-positioned.md
