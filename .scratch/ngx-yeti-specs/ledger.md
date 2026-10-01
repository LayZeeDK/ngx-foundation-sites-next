# Accessibility and parity ledger

Every standards, accessibility, and Angular Aria, CDK, or Material parity feature the package adds that Yeti itself does not provide, and every accessibility gap found in Yeti, whether or not the package closes it. The user asked for it on 2026-10-01 (map, Standing rulings, items 36 and 44), and, about the forced-colours gap, wrote, verbatim: "Track in accessibility ledger."

The format is provisional. [Decide: the building-blocks map for every ngx-yeti item](issues/25-decide-building-blocks-map.md) sets the final one, and every spec adds its rows. Upstream bugs that are not accessibility issues go in [upstream-bugs.md](upstream-bugs.md).

Columns:

- **Source:** the standard, criterion, or pattern: WHATWG, WAI-ARIA, a WCAG 2.2 criterion, an APG pattern, or Angular Aria, CDK, or Material parity.
- **Verified:** *measured* (reproduced in a browser), *read* (found in source or docs), or *inferred*.
- **Minimal reproduction:** a standalone example showing only the gap; none yet for any row.
- **Package:** what the package does about it. *Undecided* until the user rules on whether the package may add CSS of its own where Yeti's CSS fails WCAG 2.2 AA (the OPEN FOR HUMAN item of [Decide: which standing preferences and user rulings carry over](issues/07-decide-inherited-preferences-and-rulings.md)), and until the owning spec decides behaviour and ARIA.
- **Owner:** the spec that closes it, once the spec list exists.

All rows come from [Research: Yeti against WHATWG, WAI-ARIA, the APG, and Angular Aria, CDK, and Material patterns](issues/17-research-yeti-accessibility-and-standards.md) and its findings file, at Yeti `f52d1e8b9`.

| ID | Yeti item | Gap | Source | Verified | Minimal reproduction | Package | Owner |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A11Y-1 | button, buttons, tabs, field (checkbox, radio, switch, range), progress, pagination | No `forced-colors` rules: under forced colours a pressed or checked toggle, the selected tab, checkbox, radio, switch, and range state, the native progress bar, and the current page are not visible | WCAG 2.2 1.4.11 Non-text Contrast, under forced-colours mode; CDK `high-contrast` mixin and Material per-control rules for parity | measured | none | undecided | - |
| A11Y-2 | tooltip | Escape does not dismiss the tooltip | WCAG 2.2 1.4.13 Content on Hover or Focus; APG tooltip | measured | none | undecided | - |
| A11Y-3 | dropdown, nav | Panels stay open when focus leaves them | APG disclosure; Material menu parity | measured (dropdown), read (nav) | none | undecided | - |
| A11Y-4 | carousel | No previous and next buttons, no slide roles, no current-slide marker | APG carousel | read | none | undecided | - |
| A11Y-5 | tabs | The vertical example has no `aria-orientation` | WAI-ARIA `tablist`; APG tabs | read | none | undecided | - |
| A11Y-6 | field | The required `*` is part of the field's accessible name | WCAG 2.2 2.5.3 Label in Name (inferred criterion); APG naming guidance | measured | none | undecided | - |
| A11Y-7 | demo | The resize grip has no `aria-controls` and no Enter handling | APG window splitter | read | none | undecided | - |
| A11Y-8 | dialog | In Chromium and WebKit, Tab from the last control of a modal dialog moves into the browser's own UI instead of wrapping | APG dialog (modal); CDK `FocusTrap` parity | inferred (headless `activeElement` became `body`) | none | undecided | - |
| A11Y-9 | center | The layout overflows by 2 px at 320 px | WCAG 2.2 1.4.10 Reflow | measured | none | undecided | - |
| A11Y-10 | timeline, layer, breakout, media, lede | axe left `color-contrast` incomplete; each needs a manual contrast check | WCAG 2.2 1.4.3 Contrast (Minimum) | measured (incomplete) | none | undecided | - |
| A11Y-11 | accordion | The header is not a button inside a heading | APG accordion | read | none | undecided | - |
| A11Y-12 | buttons | A button group has no toolbar's single Tab stop | APG toolbar; Aria `ngToolbar` parity | read | none | undecided | - |
| A11Y-13 | spinner | The spinner animates indefinitely, with no way to pause it | WCAG 2.2 2.2.2 Pause, Stop, Hide (open whether it applies) | read | none | undecided | - |
