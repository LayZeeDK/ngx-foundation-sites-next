# Evidence dossier: Slider vertical orientation

Ticket: [Decide: Slider vertical orientation](../issues/73-decide-slider-vertical-orientation.md). Collected 2026-09-26 and 2026-09-27, AFK, for the panel the map's "Open-decision pass" note prescribes. This file holds facts and their sources only; it makes no recommendation. Every fact carries its citation: a file and line (local clones at the commit named in "Sources"), a URL pinned to a tag or commit where one exists, or the command that produced it and its output.

## Sources and abbreviations

| Short name | What | Revision |
| --- | --- | --- |
| ARIA | WAI-ARIA editor's draft, `d:/projects/github/w3c/aria/index.html` | commit `ffa9651ce866` (2026-09-24) |
| APG | WAI-ARIA Authoring Practices, `d:/projects/github/w3c/aria-practices` | commit `3f094fde1c81` (2026-09-15) |
| HTML-ARIA | ARIA in HTML, `https://raw.githubusercontent.com/w3c/html-aria/9fd6a745b6be74dc17d24197ba3cf9c056f12e81/index.html` | commit `9fd6a745` (2026-09-03) |
| HTML | WHATWG HTML, rendering section, `https://html.spec.whatwg.org/multipage/rendering.html` | fetched 2026-09-26 |
| WCAG | `https://raw.githubusercontent.com/w3c/wcag/71c891a49f50f58766597a8980f6b2d2eedd5679/...` | commit `71c891a4` |
| WF | `web-features` 3.40.0 (`data.json`, npm tarball) | 3.40.0 |
| BCD | `@mdn/browser-compat-data` 8.1.3 (`data.json`, npm tarball, timestamp 2026-09-24T13:25:51Z) | 8.1.3 |
| BBM | `baseline-browser-mapping` 2.11.26 (`getCompatibleVersions`) | 2.11.26 |
| FS | Foundation for Sites, `d:/projects/github/foundation/foundation-sites` | `v6.9.0-1-g337be7a8d` |
| NG | Angular, `d:/projects/github/angular/angular` | branch `22.2.x`, commit `5db6fc44532b` |
| NGC | Angular components, `d:/projects/github/angular/components` | branch `22.2.x`, commit `708d4c6e2bf9` |
| EXP | This dossier's throwaway experiments, `D:/tmp/nfs-decision-slider-vertical/` | see "Measured behaviour" |
| P45 | [Prototype: Foundation-styled `<input type="range">` Slider](../issues/45-prototype-slider-range-input.md) and `prototypes/slider-range-input/` | as committed |

Fetching followed the user's chain (markdown.new, then WebFetch, then a headless render with Playwright for client-rendered pages). No upstream issue, pull request, or discussion was created, commented on, or reacted to; `gh` was used only for read-only `gh api` GET and `gh search` calls.

## 1. The decision

Question (from the ticket): how the vertical Slider (`.slider.vertical`) is built, given that the [Spec: Slider](../issues/32-spec-slider.md) uses one native `<input type="range">` per Handle and rotates it, and that Chromium exposes the rotated input as horizontal.

### Current default (applied in the spec)

Native rotated inputs with `aria-orientation="vertical"`:

- Each Handle is a native `input[type=range][nfsSliderHandle]` inside Foundation's flipped `.slider.vertical`; the `nfs-slider` Library mixin's rule 11 gives the container `container-type: size` and `--nfs-slider-length: 100cqh`, and rotates each input a quarter turn about its anchored end (`transform-origin`, `translateY(-50%) rotate(90deg)`) with `direction: ltr` (`specs/slider.md:629`).
- Each Handle binds `aria-orientation="vertical"` on a vertical slider (`specs/slider.md:233`, `:287`, rendered at `:361-365`).
- Keys are native and identical in both orientations: Up and Right increase, Down and Left decrease (user story 10, `specs/slider.md:37`; key table `:295-297`).
- Origin: P45 decision 4 (`issues/45-prototype-slider-range-input.md:103`) and the spec ticket's decision 29 (`issues/32-spec-slider.md:91`).
- Planned upgrade: "Vertical form controls through `writing-mode: vertical-lr` (Chrome 124, Firefox 120, Safari 17.4): replaces rule 11's rotation and the size container, and lets browsers expose vertical orientation natively" when the Browser target moves (`specs/slider.md:641-643`).
- Status: OPEN FOR HUMAN 1, triaged as HIGH impact and NOT-HIGH confidence (`issues/32-spec-slider.md:118-120`, `:165-168`); listed as trap-quadrant decision 2 in the bundle index (`README.md:150`).

### Alternatives named by the ticket

- B. The same native input laid out with CSS `writing-mode` (for example `writing-mode: vertical-lr; direction: rtl`) where supported, falling back to rotation elsewhere.
- C. A custom `role="slider"` Handle for the vertical form only; native inputs stay for the horizontal form.
- D. Dropping the vertical form until the platform catches up.

### Variants and alternatives the sources add

- B1. `writing-mode` with no fallback, relying on per-engine support for vertical range inputs inside the Browser target, which is older than the web-features group date (section 2.3: Chromium's source has range vertical writing mode enabled from M119; Firefox 119's range frame honours the writing mode; BCD records Safari 16.5 for vertical range sliders).
- B2. `writing-mode` behind a CSS feature query used as a proxy, with rotation (or a non-standard switch) as the fallback. Fluent UI React v9 uses `@supports (writing-mode: sideways-lr)` as the proxy (section 2.7). `@supports (writing-mode: vertical-lr)` itself is true in every Browser-target engine (BCD: Chrome 48, Firefox 43, Safari 9) and cannot tell the engines apart.
- B3. `writing-mode` with a client-side check that falls back to rotation. The spec requires the server HTML to be the final DOM (`specs/slider.md:24`, `:322`), which a client-side check would change after hydration.
- Bk. Any B variant plus a directive keydown handler that normalises the arrow keys on vertical Handles, because the measured native key directions under `writing-mode` differ by engine (section 2.4, table 3).
- E. Non-standard per-engine switches: `-webkit-appearance: slider-vertical` (Chromium, WebKit) with Firefox's `orient="vertical"` attribute. MDN names both for older browsers (`mdn/content` at `100cf25d`, `files/en-us/web/html/reference/elements/input/range/index.md:306`); Fluent UI uses them as its fallback (section 2.7).
- F. A visually hidden native range input that carries the role, keyboard, and (through `writing-mode`) the orientation, with a separately positioned visible thumb. This is the shape of MUI Material UI and Base UI (section 2.7); for this library the visible thumb could be Foundation's `.slider-handle` span, with pointer handling in the directive.

## 2. Facts

### 2.1 Normative specifications

WAI-ARIA:

- `slider` role: "Elements with the role `slider` have an implicit `aria-orientation` value of `horizontal`." `aria-orientation` is in its supported states and properties, and the implicit value table says "Default for `aria-orientation` is `horizontal`" (ARIA `index.html:9306`, `:9327`, `:9388`, `:9420`).
- `aria-orientation` "Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous"; values `horizontal`, `vertical`, `undefined` (default); the note says slider defaults to horizontal (ARIA `index.html:14794-14800` and the values table after it).
- Conflicts with host language semantics: "host languages MUST explicitly declare where the use of WAI-ARIA attributes on each host language element conflicts with native features for that element. When a host language declares a WAI-ARIA attribute to be in direct semantic conflict with a native feature for a given element, user agents MUST ignore the WAI-ARIA attribute and instead use the host language feature with the same implicit semantic" (ARIA `index.html:16482-16489`, section `#host_general_conflict`). The same section also says "user agents MUST ignore WAI-ARIA states and properties when a host language feature with the same implicit WAI-ARIA semantic is provided on the same object" (`:16521`).

Accessibility API mappings:

- Core-AAM 1.2 (W3C Candidate Recommendation Draft, 23 September 2026), `https://www.w3.org/TR/core-aam-1.2/#aria-orientation-horizontal` and `#aria-orientation-vertical`: `aria-orientation="vertical"` maps to IAccessible2 "State: IA2_STATE_VERTICAL" (and "IA2_STATE_HORIZONTAL not exposed"), UIA "Property: Orientation: vertical", ATK/AT-SPI "State: STATE_VERTICAL", AX API "Property: AXOrientation: AXVerticalOrientation", Android "TBD"; `horizontal` maps to the horizontal counterparts (local editor's draft `d:/projects/github/w3c/aria/core-aam/index.html:9484-9620`, same text). The `slider` role maps to UIA control type Slider with the RangeValue pattern, IA2 `ROLE_SYSTEM_SLIDER` with `IAccessibleValue`, AX `AXSlider`, and Android `android.widget.SeekBar`, with nothing about orientation (`#role-map-slider`).
- HTML-AAM (W3C Working Draft, 23 September 2026), `https://www.w3.org/TR/html-aam-1.0/#el-input-range`: `input type=range` maps to the WAI-ARIA `slider` role ("Use WAI-ARIA mapping" for every API) with an empty Comments cell; the word "orientation" does not occur in the HTML-AAM editor's draft (local copy `d:/projects/github/w3c/aria/html-aam/index.html`, entry at line 3996; `rg -c -i "orientation"` exits 1 with no match).
- Open standards discussions on logical orientation values and reversed ranges (w3c/aria issues 2750 and 2759, w3c/csswg-drafts issue 9832) were open on 2026-09-26.

HTML (WHATWG), rendering section:

- 15.5.8 "The input element as a range control": "When this control has a horizontal writing mode, the control is expected to be a horizontal slider. Its lowest value is on the right if the 'direction' property has a computed value of 'rtl', and on the left otherwise. When this control has a vertical writing mode, it is expected to be a vertical slider. Its lowest value is on the bottom if the 'direction' property has a computed value of 'rtl', and on the top otherwise." The same subsection ends "Need to detail the primitive appearance" (HTML, `#the-input-element-as-a-range-control`). The quoted expectations describe the native appearance; `foundation-range-input` sets `appearance: none` (FS `scss/forms/_range.scss:51`).
- 15.5.2 "Writing mode": a vertical writing mode is a computed `writing-mode` of `vertical-rl`, `vertical-lr`, `sideways-rl`, or `sideways-lr` (HTML, `#writing-mode`).
- web-features links the feature to CSS Writing Modes 4, `https://drafts.csswg.org/css-writing-modes-4/#vertical-modes` (WF `features["vertical-form-controls"].spec`).

WCAG 2.2 (normative text from WCAG `guidelines/sc/...`):

- 4.1.2 Name, Role, Value (A): "the name and role can be programmatically determined; states, properties, and values that can be set by the user can be programmatically set; and notification of changes to these items is available to user agents, including assistive technologies." Its note: "standard HTML controls already meet this success criterion when used according to specification" (`guidelines/sc/20/name-role-value.html`).
- Understanding 4.1.2: "What roles and states are appropriate to convey to assistive technology will depend on what the control represents. Specifics about such information are defined by other specifications, such as WAI-ARIA, or the relevant platform standards. Another factor to consider is whether there is sufficient accessibility support with assistive technologies to convey the information as specified" (`understanding/20/name-role-value.html`).
- 1.3.1 Info and Relationships (A): "Information, structure, and relationships conveyed through presentation can be programmatically determined or are available in text" (`guidelines/sc/20/info-and-relationships.html`).
- 2.5.8 Target Size (Minimum) (AA): 24 by 24 CSS pixels with five exceptions; "Targets that allow for values to be selected spatially based on position within the target are considered one target for the purpose of the success criterion. Examples include sliders"; "For inline targets the line-height should be interpreted as perpendicular to the flow of text" (`guidelines/sc/22/target-size-minimum.html`).
- 1.3.4 Orientation (AA) concerns the display orientation of the content ("portrait or landscape"), not the orientation of a control (`guidelines/sc/21/orientation.html`).

### 2.2 The APG and ARIA in HTML

ARIA in HTML:

- `input type=range`: implicit `role=slider`; "No `role` other than `slider`, which is NOT RECOMMENDED"; "Authors SHOULD NOT use the `aria-valuemax` or `aria-valuemin` attributes on `input type=range`"; "Otherwise, any global `aria-*` attributes and any other `aria-*` attributes applicable to the `slider` role" (HTML-ARIA `index.html:1792-1811`). `aria-orientation` is applicable to `slider` (section 2.1).
- The string `aria-orientation` does not occur anywhere in the ARIA in HTML source (command: `rg -n "aria-orientation" html-aria.html` on the pinned file, no match), so the document declares no conflict for it on `input type=range`.
- A Chromium triager wrote in 2020 that "The aria-orientation attribute is not supported on <input> since you can't have a vertical <input> control" (Chromium issue 40736841, comment 9, 2020-12-17; section 2.8); ARIA in HTML's text above allows the attribute.

The APG:

- Slider pattern, keyboard: "Right Arrow: Increase the value of the slider by one step. Up Arrow: Increase ... Left Arrow: Decrease ... Down Arrow: Decrease ... Home: Set the slider to the first allowed value in its range. End: ... last allowed value"; Page Up and Page Down optional (APG `content/patterns/slider/slider-pattern.html:51-58`). Note: "In some circumstances, reversing the direction of the value change for the keys specified above, e.g., having Up Arrow decrease the value, could create a more intuitive experience" (`:64`).
- Roles, states, properties: "If the slider is vertically oriented, it has aria-orientation set to vertical. The default value of aria-orientation for a slider is horizontal" (`:82-83`). The multi-thumb pattern says the same (`content/patterns/slider-multithumb/slider-multithumb-pattern.html:78-79`).
- Warning in both patterns: touch-based assistive technologies may not operate a slider built on this pattern, and authors "should fully test slider widgets using assistive technologies on devices where touch is a primary input mechanism" (`slider-pattern.html`, "About This Pattern").
- The vertical example is "Vertical Temperature Slider": an SVG `<g role="slider" aria-orientation="vertical" tabindex="0" aria-valuetext="25.0 degrees Celsius" ...>` (APG `content/patterns/slider/examples/slider-temperature.html:44`, `:65`); its script is 256 lines (`wc -l content/patterns/slider/examples/js/slider-temperature.js`); the multi-thumb example script is 394 lines. The example page embeds the ARIA-AT report `https://aria-at.w3.org/embed/reports/apg/vertical-temperature-slider` (`slider-temperature.html:282-287`); its data is in section 2.8.
- No APG example uses a native `<input type="range">` for a vertical slider (the four slider examples and the multi-thumb example are custom `role="slider"` elements: `slider-color-viewer.html`, `slider-rating.html`, `slider-seek.html`, `slider-temperature.html`, `slider-multithumb.html`).

### 2.3 Browser support and Baseline status

Browser target (map, "Browser support"): the Baseline widely available set on 2026-05-07: Chrome 119, Edge 119, Firefox 119, and Safari 17, desktop and mobile; "A platform feature counts as available only if it was Baseline widely available on that date; anything newer needs a fallback or is not used" and "A feature is usable without a fallback only if every browser in this table supports it from the listed version" (`map.md:44-56`). Angular 22's Baseline date is 2026-05-07; Angular picks "a chosen date near the release date for that major" (NG `adev/src/content/reference/versions.md:75-87`).

web-features 3.40.0, feature `vertical-form-controls`:

- Description: "The writing-mode CSS property orients form elements (such as radio buttons, progress bars, or select menus) vertically when the writing mode is vertical-lr or vertical-rl. The direction CSS property sets whether inputs flow from top to bottom or bottom to top."
- `status.baseline: "low"`, `baseline_low_date: "2024-04-18"`, support Chrome and Edge 124, Firefox 120, Safari 17.4 (desktop and mobile). Compat keys: `css.properties.writing-mode.vertical_oriented_form_controls` (Baseline low 2024-04-18) and `css.properties.direction.vertical_slider_direction` (`baseline: false`, Chrome and Edge 124 only in its summary).
- Command: `node D:/tmp/nfs-decision-slider-vertical/data/query.mjs` over the unpacked tarball.

Baseline widely available sets (BBM 2.11.26, `getCompatibleVersions({ widelyAvailableOnDate, includeDownstreamBrowsers: false })`, script `D:/tmp/nfs-decision-slider-vertical/bbm/sets.mjs`):

| Date | Core set | Contains vertical form controls (Chrome/Edge 124, Firefox 120, Safari 17.4)? |
| --- | --- | --- |
| 2026-05-07 (Browser target) | Chrome 119, Edge 119, Firefox 119, Safari 17 | no |
| 2026-09-26 and 2026-09-27 (today) | Chrome 123, Edge 123, Firefox 124, Safari 17.4 | no |
| 2026-10-17 | Chrome 123, Edge 123, Firefox 125, Safari 17.4 | no |
| 2026-10-18 | Chrome 124, Edge 124, Firefox 125, Safari 17.4 | yes |
| 2027-05-07 | Chrome 130, Edge 130, Firefox 132, Safari 18 | yes |

So vertical form controls were not Baseline widely available on 2026-05-07, are not today, and become so on 2026-10-18 (BBM output above; web-features' low date plus 30 months).

Angular's cadence: a major every 12 months since v22; v22 released 2026-06-03, active until 2027-06, LTS until 2028-06; v23.0 "~ June 2027" (NG `adev/src/content/reference/releases.md:62-66`, `:69`, `:77-84`, `:101`). The Browser target is tied to Angular 22 (map, "Target platform").

BCD 8.1.3:

| Key | Chrome / Edge | Firefox | Safari |
| --- | --- | --- | --- |
| `html.elements.input.type_range.vertical_orientation` ("Vertically-oriented range sliders") | 124 via `writing-mode`; `<=67` to 124 partial via `-webkit-appearance: slider-vertical`; Edge 12 via `writing-mode: bt-lr` | 120 via `writing-mode`; 23 to 120 partial via `orient="vertical"` | 16.5 via `writing-mode`; 3.1 to 16.5 partial via `-webkit-appearance: slider-vertical` |
| `css.properties.writing-mode.vertical_oriented_form_controls` | 124 ("select, button, textarea, textual input, range slider, meter, and progress"); 121 to 124 partial (select, button, textarea, textual input); 119 to 121 partial ("Only supported for select and button elements") | 120 | 17.4; 16.5 to 17.4 partial ("Support for range sliders, textual inputs, and textareas only") |
| `css.properties.direction.vertical_slider_direction` | 124 | 120, partial ("Only supported for vertical range sliders") | 16.5, partial ("Only supported for vertical range sliders") |
| `css.properties.writing-mode.sideways-lr` | 132 | 43 | 18.4 |
| `css.properties.writing-mode.vertical-lr` | 48 (Edge 12) | 43 | 9 |

caniuse, `https://caniuse.com/wf-vertical-form-controls` (fetched through markdown.new 2026-09-26): Chrome and Edge 124+, Firefox 120+, Safari and Safari on iOS 17.4+, global usage 89.9%.

Chromium source and status entries (these disagree with BCD for range inputs in Chrome 119 to 123):

- `third_party/blink/renderer/platform/runtime_enabled_features.json5` at `refs/branch-heads/6045` (M119) and `6099` (M120): `FormControlsVerticalWritingModeSupport` has `status: "stable"` under the comment "Allow these form controls to have vertical writing mode: select, meter, progress, button and non-text-based input types"; `FormControlsVerticalWritingModeDirectionSupport` has no status. At `refs/branch-heads/6367` (M124) the direction feature is `status: "stable"` (lines 1888-1895, 1958-1965, 1928-1936 of the three files; fetched with `curl .../+/refs/branch-heads/<n>/...?format=TEXT | base64 -d`).
- `third_party/blink/renderer/core/html/forms/slider_thumb_element.cc` at `refs/branch-heads/6045`: `const bool is_vertical = !thumb_box->StyleRef().IsHorizontalWritingMode();` (line 108); without the direction feature a vertical left-to-right range is inverted, that is drawn bottom to top (lines 121-146).
- chromestatus `5602118873907200` "Form Controls Support Vertical Writing Mode": enabled by default in 118, "we will slowly rollout the change for a number of form controls in 118 and continue in future milestones"; `5082460523331584` "... Vertical Writing Mode Direction Support": milestone 124, "If direction is rtl, the value is rendered from bottom to top. If direction is ltr, the value is rendered from top to bottom"; `6001359429566464` "Remove non-standard appearance keyword slider-vertical": "No active development", with the Firefox view "Already deprecated" and the Safari view "Currently still supporting the slider-vertical value, but agreed to deprecate" (`https://chromestatus.com/api/v0/features?q=vertical%20writing%20mode`, fetched 2026-09-26).

Firefox source: `layout/forms/nsRangeFrame.cpp` is byte-identical at tags `FIREFOX_119_0_RELEASE` and `FIREFOX_120_0_RELEASE` of `mozilla-firefox/firefox` (command `diff`, no output); `nsRangeFrame::IsHorizontal()` returns horizontal unless `orient="vertical"` is set or `GetWritingMode().IsVertical()` (lines 735-745). The MDN release notes for Firefox 119 and 120 do not mention vertical range sliders (`mdn/content` at `7ed7b730` and `f69b6693`, `files/en-us/mozilla/firefox/releases/{119,120}/index.md`, no match for `vertical|writing-mode|range`).

WebKit source: `VerticalFormControlsEnabled`, `status: stable`, default `true` for `"PLATFORM(COCOA) || USE(THEME_ADWAITA)"` and `false` otherwise (`WebKit/WebKit` at `23e2202805b7`, `Source/WTF/Scripts/Preferences/UnifiedWebPreferences.yaml:6610-6618`). Safari is a Cocoa port; Playwright's Windows WebKit is not (section 2.4 shows the Windows builds 17.4 and 26.0 not applying `writing-mode` to range inputs, and 26.6 applying it).

MDN guidance (`mdn/content` at `100cf25d`, `files/en-us/web/html/reference/elements/input/range/index.md`): "To create a vertical range wherein the thumb slides up and down, set the writing-mode property with a value of either vertical-rl or vertical-lr" (line 290); "You can also set the CSS appearance property to the non-standard slider-vertical value if you want to support older versions of Chrome and Safari, and include the non-standard orient="vertical" attribute to support older versions of Firefox" (line 306).

The effort's own research graded "Vertical form controls via `writing-mode`" as Baseline 2024, newly available 2024-04-18, Chrome 124, Firefox 120, Safari 17.4, not in target (`research/web-platform-features.md:70`, `:364-368`, `:514`), and building-blocks lists "vertical form controls via `writing-mode`" among the features outside the target (`building-blocks.md:32`).

### 2.4 Measured behaviour

#### The experiment

- Location: `D:/tmp/nfs-decision-slider-vertical/`. Pages: `page.html` (16 cases), `keys.html` (9 Foundation-styled cases), `fnd.html` (Foundation's `foundation-range-input` output under `writing-mode`). Scripts: `measure.mjs`, `summarize.mjs`, `measure-keys.mjs`, `measure-fnd.mjs`, and the UI Automation probe under `uia/` (a copy of a read-only UIA reader from another agent's evidence workspace, extended to read `UIA_OrientationPropertyId` 30023 and the RangeValue properties; its page server listened on 127.0.0.1:4726 and was stopped). No server or browser of this experiment is still running.
- Engines (all Playwright builds; WebKit is Playwright's Windows port, not Safari):

  | Set | Playwright | Chromium | Firefox | WebKit |
  | --- | --- | --- | --- | --- |
  | target era | 1.40.0 (workspace of P45, `D:/tmp/nfs-proto-slider-range-input/old-engines/`) | 120.0.6099.28 | 119.0 | 17.4 |
  | recent | 1.56.1 (installed locally under `pw156/`, the last version with `page.accessibility`) | 141.0.7390.37 | 142.0.1 | 26.0 |
  | current | 1.63.0 | 153.0.8010.12 | 155.0 | 26.6 |

- Machine: Windows 11 Pro ARM64 (Snapdragon X Elite), OS locale Danish.
- Accessibility readouts: Chromium's CDP `Accessibility.getFullAXTree` (`orientation` property) in every set; Playwright's `page.accessibility.snapshot({ interestingOnly: false })` `orientation` field in the 1.40 and 1.56 sets (removed from Playwright in 1.57: "After 3 years of being deprecated, we removed `page.accessibility` from our API", Playwright release notes, `docs/src/release-notes-js.md`, Version 1.57); the Windows UI Automation tree (`UIA_OrientationPropertyId`) for headed Chromium 153 and Firefox 155. A run of the 1.56 client against the 1.63 Firefox and WebKit binaries hung at launch and was abandoned, so Firefox 155 and WebKit 26.6 have no accessibility-tree orientation readout other than UIA for Firefox.
- Commands: `node measure.mjs <playwright-core>/index.mjs <label>` then `node summarize.mjs pw140 pw156 pw163`; `node measure-keys.mjs <playwright-core>/index.mjs <label>`; `node measure-fnd.mjs <playwright-core>/index.mjs <label>`; `node uia/run.mjs vertical chromium firefox`. The 1.40 and 1.56 sets ran with `PLAYWRIGHT_BROWSERS_PATH` pointing at their local browser folders.

Cases in `page.html` (each `<input type="range" value="50">` with an `aria-label` equal to its id; `.v-size` is `width: 24px; height: 200px`):

| Id | Markup and CSS |
| --- | --- |
| `h-plain` | horizontal, 200 px wide |
| `h-aria-vertical` | horizontal, `aria-orientation="vertical"` |
| `rot-aria` | `transform: rotate(-90deg)`, `aria-orientation="vertical"` |
| `rot-noaria` | `transform: rotate(-90deg)` |
| `fnd-rot-aria` | the spec's rule 11 shape: input rotated `translateY(-50%) rotate(90deg)` about `0 50%`, `direction: ltr`, inside a `transform: scale(1, -1)` container with `container-type: size`; `aria-orientation="vertical"` |
| `wm-vlr` | `writing-mode: vertical-lr`, `.v-size` |
| `wm-vlr-rtl` | `writing-mode: vertical-lr; direction: rtl`, `.v-size` |
| `wm-vlr-rtl-aria` | as `wm-vlr-rtl`, plus `aria-orientation="vertical"` |
| `wm-vlr-aria-h` | as `wm-vlr-rtl`, plus `aria-orientation="horizontal"` |
| `wm-vrl` | `writing-mode: vertical-rl`, `.v-size` |
| `wm-styled` | `appearance: none` with a 24 by 24 px styled thumb, `vertical-lr; direction: rtl`, `.v-size` |
| `h-styled` | `appearance: none` with a styled thumb, horizontal |
| `orient` | `orient="vertical"`, `.v-size` |
| `appearance-sv` | `-webkit-appearance: slider-vertical; appearance: slider-vertical`, `.v-size` |
| `div-v` | `div role="slider" aria-orientation="vertical"` (control) |
| `div-h` | `div role="slider"` (control) |

#### Table 1: exposed orientation

Cells: CDP / Playwright snapshot for Chromium; Playwright snapshot for Firefox and WebKit (`-` = no orientation reported); UIA where measured. Playwright's Firefox snapshot reads `orientation` from the accessible's object attributes, not from its states (`microsoft/playwright` at `v1.56.1`, `browser_patches/firefox/juggler/content/PageAgent.js:682-694`). Source: `results-pw140.json`, `results-pw156.json`, `results-pw163.json`, `summary.txt`, `uia/out/vertical-chromium.txt`, `uia/out/vertical-firefox.txt`.

| Case | Chromium 120 | Chromium 141 | Chromium 153 (CDP; UIA) | Firefox 119 | Firefox 142 | Firefox 155 (UIA) | WebKit 17.4 | WebKit 26.0 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `h-plain` | horizontal | horizontal | horizontal; Horizontal | - | - | None | horizontal | horizontal |
| `h-aria-vertical` | horizontal | horizontal | horizontal; Horizontal | vertical | vertical | None | vertical | vertical |
| `rot-aria` | horizontal | horizontal | horizontal; Horizontal | vertical | vertical | None | vertical | vertical |
| `rot-noaria` | horizontal | horizontal | horizontal; Horizontal | - | - | None | horizontal | horizontal |
| `fnd-rot-aria` | horizontal | horizontal | horizontal; Horizontal | vertical | vertical | None | vertical | vertical |
| `wm-vlr` | vertical | vertical | vertical; Vertical | - | - | None | horizontal (not applied, see below) | horizontal (not applied) |
| `wm-vlr-rtl` | vertical | vertical | vertical; Vertical | - | - | None | horizontal (not applied) | horizontal (not applied) |
| `wm-vlr-rtl-aria` | vertical | vertical | vertical; Vertical | vertical | vertical | None | vertical | vertical |
| `wm-vlr-aria-h` | vertical | vertical | vertical; Vertical | horizontal | horizontal | None | horizontal | horizontal |
| `wm-vrl` | vertical | vertical | vertical; Vertical | - | - | None | horizontal (not applied) | horizontal (not applied) |
| `wm-styled` | vertical | vertical | vertical; Vertical | - | - | None | horizontal (not applied) | horizontal (not applied) |
| `orient` | horizontal | horizontal | horizontal; Horizontal | - | - | None | horizontal | horizontal |
| `appearance-sv` | horizontal | vertical | vertical; Vertical | - | - | None | vertical | vertical |
| `div-v` | vertical | vertical | vertical; Vertical | vertical | vertical | None | vertical | vertical |
| `div-h` | horizontal | horizontal | horizontal; Horizontal | - | - | None | horizontal | horizontal |

Readings of table 1, each a direct restatement of cells above:

- Chromium (120, 141, 153) never changes a native range input's orientation for `aria-orientation`: `h-aria-vertical` and all rotated cases are horizontal, and `wm-vlr-aria-h` stays vertical. It reports vertical for a native range laid out with `writing-mode` (all three versions) and for `appearance: slider-vertical` (141 and 153; not 120). Chromium's UIA `Orientation` matches its CDP value in every case (Chromium 153).
- Firefox (119, 142) carries `aria-orientation` of a native range input as an `orientation` object attribute (the Playwright field above) and nothing for `writing-mode` alone. Firefox 155's UIA provider reports `Orientation=None` for every slider, the `div role="slider" aria-orientation="vertical"` control included. Gecko sets no horizontal or vertical state on a native range without a `role` attribute (engine source below).
- WebKit (Playwright Windows 17.4 and 26.0) reports the orientation given by `aria-orientation` on a native range input, and vertical for `appearance: slider-vertical`. These two builds do not apply `writing-mode` to a range input (the computed `writing-mode` is `horizontal-tb`), so their `writing-mode` rows say nothing about Safari.
- The P45 prototype had measured the same Chromium 153 result: `{"name":"native-vertical","value":50,"valuetext":"50","orientation":"horizontal"}` and `{"name":"custom",...,"orientation":"vertical"}` (`prototypes/slider-range-input/logs/probe-valuetext.log`).

#### Table 2: layout and native interaction (unstyled cases)

Pointer: value after a click 6 px inside the top and bottom of the element's box (starting from 50). Keys: value after one press from 50. Source: `summary.txt`.

| Case | Engine | Computed `writing-mode` / `direction` | Click top / bottom | Up / Down / Right / Left | Home / End |
| --- | --- | --- | --- | --- | --- |
| `wm-vlr` | Chromium 120 | vertical-lr / ltr | 100 / 0 | 51 / 49 / 51 / 49 | 0 / 100 |
| `wm-vlr` | Chromium 141, 153 | vertical-lr / ltr | 0 / 100 | 49 / 51 / 51 / 49 | 0 / 100 |
| `wm-vlr` | Firefox 119, 142, 155 | vertical-lr / ltr | 0 / 100 | 51 / 49 / 51 / 49 | 0 / 100 |
| `wm-vlr` | WebKit 26.6 | vertical-lr / ltr | 0 / 100 | 51 / 49 / 49 / 51 | 100 / 0 |
| `wm-vlr` | WebKit 17.4, 26.0 | horizontal-tb / ltr | 39 / 39 | 51 / 49 / 51 / 49 | 0 / 100 |
| `wm-vlr-rtl` | Chromium 120 | vertical-lr / rtl | 100 / 0 | 51 / 49 / 49 / 51 | 0 / 100 |
| `wm-vlr-rtl` | Chromium 141, 153 | vertical-lr / rtl | 100 / 0 | 51 / 49 / 51 / 49 | 0 / 100 |
| `wm-vlr-rtl` | Firefox 119, 142, 155 | vertical-lr / rtl | 100 / 0 | 51 / 49 / 49 / 51 | 0 / 100 |
| `wm-vlr-rtl` | WebKit 26.6 | vertical-lr / rtl | 100 / 0 | 51 / 49 / 49 / 51 | 100 / 0 |
| `rot-aria`, `fnd-rot-aria` | every engine and version | horizontal-tb / ltr | 100 / 0 | 51 / 49 / 51 / 49 | 0 / 100 |
| `appearance-sv` | WebKit 17.4, 26.0, 26.6 | horizontal-tb / ltr | 100 / 0 | 51 / 49 / 49 / 51 | 100 / 0 |
| `appearance-sv` | Firefox (all) | horizontal-tb / ltr | 43 or 50 / same (not vertical) | 51 / 49 / 51 / 49 | 0 / 100 |
| `orient` | Firefox (all) | horizontal-tb / ltr | 100 / 0 | 51 / 49 / 51 / 49 | 0 / 100 |
| `orient` | Chromium, WebKit (all) | horizontal-tb / ltr | not vertical (51 or 39 both ends) | 51 / 49 / 51 / 49 | 0 / 100 |

Readings: Chromium 120 draws a vertical range bottom to top whatever `direction` says, and Chromium 141 and 153 follow `direction` as HTML 15.5.8 describes; Firefox honours `direction` for the position in all three versions; WebKit 26.6 with native appearance reverses Home and End on vertical ranges (Home 100, End 0), as WebKit 17.4 to 26.6 do for `appearance: slider-vertical`.

#### Table 3: Foundation-styled (`appearance: none`) vertical inputs

`keys.html`: every input has `appearance: none`, a 24 by 24 px thumb in `#ff0000` styled through `::-webkit-slider-thumb` and `::-moz-range-thumb`, and is 24 by 200 px. "Thumb at 0" is the red centroid's y in the element screenshot at value 0 (of 200 px; 11.5 = top, 187.5 = bottom). Keys from 50. Source: `keys-pw140.txt`, `keys-pw156.txt`, `keys-pw163.txt`.

| Case | Engine | Thumb at 0 | Up / Down / Right / Left | Home / End | Exposed orientation (Chromium CDP) |
| --- | --- | --- | --- | --- | --- |
| `vertical-lr; direction: rtl` | Chromium 120 | bottom | 51 / 49 / 49 / 51 | 0 / 100 | vertical |
| `vertical-lr; direction: rtl` | Chromium 141, 153 | bottom | 51 / 49 / 51 / 49 | 0 / 100 | vertical |
| `vertical-lr; direction: rtl` | Firefox 119, 142, 155 | bottom | 51 / 49 / 49 / 51 | 0 / 100 | n/a |
| `vertical-lr; direction: rtl` | WebKit 26.6 | bottom | 51 / 49 / 51 / 49 | 0 / 100 | n/a |
| `vertical-lr; direction: ltr` | Chromium 120 | bottom | 51 / 49 / 51 / 49 | 0 / 100 | vertical |
| `vertical-lr; direction: ltr` | Chromium 141, 153 | top | 49 / 51 / 51 / 49 | 0 / 100 | vertical |
| `vertical-lr; direction: ltr` | Firefox 119, 142, 155 | top | 51 / 49 / 51 / 49 | 0 / 100 | n/a |
| `vertical-lr; direction: ltr` | WebKit 26.6 | top | 51 / 49 / 51 / 49 | 0 / 100 | n/a |
| `vertical-lr; direction: ltr` inside `scale(1, -1)` (Foundation's flip) | Chromium 120 | top | 51 / 49 / 51 / 49 | 0 / 100 | vertical |
| same | Chromium 141, 153 | bottom | 49 / 51 / 51 / 49 | 0 / 100 | vertical |
| same | Firefox 119, 142, 155 | bottom | 51 / 49 / 51 / 49 | 0 / 100 | n/a |
| same | WebKit 26.6 | bottom | 51 / 49 / 51 / 49 | 0 / 100 | n/a |
| `vertical-lr` inheriting `direction: rtl` from a `dir="rtl"` ancestor | Chromium 141, 153; WebKit 26.6 | bottom | 51 / 49 / 51 / 49 | 0 / 100 | vertical |
| same | Firefox 119, 142, 155; Chromium 120 | bottom | 51 / 49 / 49 / 51 | 0 / 100 | vertical (Chromium) |
| spec rule 11 shape (rotated, `aria-orientation="vertical"`) | every engine and version | bottom | 51 / 49 / 51 / 49 | 0 / 100 | horizontal |
| `-webkit-appearance: slider-vertical` with the styled thumb | Chromium 120, 153; WebKit 17.4, 26.6 | no red thumb painted (the styled thumb is replaced by the native one) | Chromium 51 / 49 / 51 / 49; WebKit 51 / 49 / 49 / 51 | Chromium 0 / 100; WebKit 100 / 0 | Chromium 120 horizontal, 153 vertical |
| any `writing-mode` case | WebKit 17.4, 26.0 (Windows port) | thumb does not move (writing mode not applied) | 51 / 49 / 51 / 49 | 0 / 100 | n/a |

Readings, restating the cells:

- With `vertical-lr; direction: rtl`, the minimum is at the bottom and Up increases in every measured engine that applies the writing mode, including Chromium 120; Right increases in Chromium 141 and 153 and WebKit 26.6 and decreases in Firefox 119 to 155 and in Chromium 120.
- With `vertical-lr; direction: ltr` inside Foundation's flipped container, the minimum is at the bottom in Chromium 141 and 153, Firefox, and WebKit 26.6, but Up decreases in Chromium 141 and 153; in Chromium 120 the minimum is at the top.
- No measured `writing-mode` configuration gives "Up and Right increase" (spec user story 10) in every current engine without a key handler; the rotated rule 11 shape does, in every engine and version measured.
- The rotated rule 11 shape is exposed as horizontal by Chromium in every version (tables 1 and 3).

#### Table 4: Foundation's `foundation-range-input` output under `writing-mode`

`fnd.html` reproduces the mixin's output at Foundation's default settings (FS `scss/forms/_range.scss:41-110`: input `width: 100%; height: auto; margin-top: 0.45rem`, track `height: 0.5rem`, thumb 1.4rem with `margin-top: -0.45rem`), then applies `input[type='range'].v { writing-mode: vertical-lr; direction: rtl; width: 24px; height: 200px; margin: 0 }`. A first run with the selector `.v` lost to the mixin's `input[type='range']` selector on specificity (the element kept `width: 100%; height: auto`), which the Library mixin's `.slider > input[type='range']` rules would also have to outrank. Source: `fnd-pw140.txt`, `fnd-pw163.txt`.

| Engine | Thumb at 0 / at 100 (y range of the red thumb in a 200 px box) | Painted track |
| --- | --- | --- |
| Chromium 120, 153; WebKit 26.6 | 178-199 / 0-21 | fills the input's width (23 px) and the free length |
| Firefox 155 | 178-199 / 0-21 | a 3 by 8 px box in the middle (the `height: 0.5rem` track collapsed) |
| Firefox 119 | 178-199 / 0-21 | not painted |
| WebKit 17.4 (Windows port) | 89-110 / 89-110 (not vertical) | horizontal |

With the track and thumb rules swapped for the vertical axis (`height: auto; width: 0.5rem` on the track, `margin-top: 0; margin-left: -0.45rem` on the thumb), every engine but WebKit 17.4 paints an 8 px wide full-length track. The spec's rule 2 already makes the input's own track transparent (`specs/slider.md:619`).

#### Engine source that explains the measurements

Collected from each engine's source at a pinned revision; the Chromium and WebKit functions were re-read for this dossier.

- Chromium (tag `153.0.8010.55`, GitHub mirror `chromium/chromium`): every `input type=range` gets an `AXSlider` (`third_party/blink/renderer/modules/accessibility/ax_object_cache_impl.cc:1320-1324`). `AXSlider::Orientation()` returns vertical when the computed writing mode is vertical, otherwise reads the `appearance` (`slider-vertical` counts while the stable `NonStandardAppearanceValueSliderVertical` flag is on), and never reads `aria-orientation` or `transform` (`ax_slider.cc:46-78`; the method is `final`, `ax_slider.h:56`). The generic `AXNodeObject::Orientation()`, which reads `aria-orientation`, is the path a `div role="slider"` takes (`ax_node_object.cc:3944-3986`). The orientation becomes a `kVertical` or `kHorizontal` state (`ax_object.cc:2396-2399`) that drives UIA `Orientation` (`ui/accessibility/platform/ax_platform_node_win.cc:5559-5577`), `IA2_STATE_VERTICAL`/`HORIZONTAL` (same file, `:7174-7179`), ATK states (`ax_platform_node_auralinux.cc:3142-3159`), and macOS `AXOrientation` (`browser_accessibility_cocoa.mm:1167-1176`); the Android slider (`android.widget.SeekBar`) carries no orientation (`content/browser/accessibility/browser_accessibility_android.cc`, no match for `orientation|vertical|horizontal`). Chromium's own expectations list six default ranges as `slider horizontal` and `IA2_STATE_HORIZONTAL` (`content/test/data/accessibility/html/input-range-expected-blink.txt:4-9`, `-expected-win.txt:3-8`). The writing-mode branch came with commit `5a252fef36ac` (2023-04-17, "Allow input type=range to have writing mode vertical") behind `FormControlsVerticalWritingModeSupport`; the flag was removed in `309547db5ce8` (2024-04-30).
- Chromium keyboard: `RangeInputType::HandleKeydownEvent` accepts all four arrows and maps them with `PhysicalToLogical` on the computed writing direction; `slider-vertical` is treated as `vertical-rl; rtl`; a `transform` does not enter this code (`third_party/blink/renderer/core/html/forms/range_input_type.cc:199` onwards, `:235-239`).
- Gecko (`mozilla-firefox/firefox` at `c32abda01905`): `HTMLRangeAccessible` implements role, value, minimum, maximum, and step only, with no state code (`accessible/html/HTMLFormControlAccessible.cpp:587-638`). Horizontal and vertical states come only from the ARIA role map (`accessible/base/ARIAMap.cpp:1191-1202`, `ARIAStateMap.cpp:217-226`), which applies only when the element has an explicit `role` attribute (`accessible/generic/LocalAccessible.cpp:1777`; `ARIAMap.cpp:1556-1564`). `aria-orientation` is also exposed as an object attribute (`ARIAMap.cpp:1492`, `ATTR_VALTOKEN`), which is what Playwright's snapshot shows. On macOS, Firefox's range accessible reads `aria-orientation` for `AXOrientation` and not the writing mode (`accessible/mac/mozActionElements.mm:149-162`). Firefox's UIA provider has no orientation code (`accessible/windows/uia/uiaRawElmProvider.cpp`, no match for `orient`), matching the measured `Orientation=None`. The writing mode and `orient` are read only by layout (`layout/forms/nsRangeFrame.cpp:622-632` at this revision).
- WebKit (`WebKit/WebKit` at `c39e3bbd9539`): `AccessibilitySlider::explicitOrientation()` returns the `aria-orientation` value first, then vertical only for a used appearance of `SliderVertical` or `SliderThumbVertical`, otherwise horizontal (`Source/WebCore/accessibility/AccessibilitySlider.cpp:60-83`). The writing mode reaches it only through the automatic appearance (`Source/WebCore/rendering/RenderTheme.cpp:433`: a range control gets `SliderVertical` when its writing mode is vertical). With `appearance: none`, as `foundation-range-input` sets, the used appearance is not a slider value, so without `aria-orientation` the result is horizontal (reading of the code; not measured, because the Windows builds with an accessibility snapshot did not apply the writing mode). WebKit added the `aria-orientation` check for range inputs in commit `e99b534d0706` (2021-01-05, "AX: aria-orientation is ignored on input[type="range"]"), with the test `LayoutTests/accessibility/mac/range-orientation.html` expecting `AXVerticalOrientation` for `type="range" aria-orientation="vertical"`. On iOS only a non-default orientation is exposed (`ios/WebAccessibilityObjectWrapperIOS.mm:3466-3479`).

### 2.5 Foundation 6.9 source

- The Slider plugin's handle is a `span` with `role="slider"`, and the plugin writes `'aria-orientation': this.options.vertical ? 'vertical' : 'horizontal'` on it (FS `js/foundation.slider.js:322-330`).
- `vertical` option: "Set to true and use the `vertical` class to change alignment to vertical" (`:622-627`); the docs require both `.vertical` and `data-vertical="true"` (FS `docs/pages/slider.md:40-58`).
- Vertical maths and positioning: value interpolated from `end` at the top (`:155-158`); handle and fill positioned with `top` and `height` instead of `left` and `width` (`:219-221`, `:362-367`); the pointer maths inverts for right-to-left only when not vertical (`:388`).
- Keys: `ltr` map Right and Up increase, Down and Left decrease; `rtl` map Left increases and Right decreases (`:40-58`).
- `invertVertical` is declared and never read (`:679-684`; `research/foundation-inventory-forms-media.md:339`).
- Sass: `slider-vertical` mixin gives the container `width: $slider-width-vertical; height: 12.5rem; transform: scale(1, -1)` and swaps the handle's width and height (FS `scss/components/_slider.scss:84-105`); `$slider-width-vertical` "Doesn't apply to the native slider" (`:12-14`); the right-to-left mirror applies to `.slider:not(.vertical)` only (`:134-139`).
- `foundation-range-input` sizes the track and thumb with physical `height`, `width`, and `margin-top` (FS `scss/forms/_range.scss:41-110`).
- The native slider docs list "No support for vertical orientation" and "No support for two handles" (FS `docs/pages/slider.md:182-183`).

### 2.6 Angular, CDK, Aria, and Material source

- `@angular/aria` 22.2 ships accordion, combobox, grid, listbox, menu, tabs, toolbar, and tree; no slider (NGC `src/aria/` listing; `README.md:167`).
- `@angular/cdk` has no slider primitive; the effort's CDK inventory rejected `drag-drop` for Slider handles (`specs/slider.md:247`).
- `MatSlider` 22.2 has no vertical orientation: `rg -n -i "vertical|orientation" src/material/slider --glob '!*.spec.ts'` returns only a `vertical-align` declaration (`slider.scss:300`); the effort's Material research records "Vertical orientation: Material has none" (`research/angular-material-reference.md:1128`). Material 15 re-implemented `mat-slider` on MDC with "a new API that requires a `<input matSliderThumb>` element" (NGC `CHANGELOG.md:4635` and its line 28 below); the pre-MDC slider had a "vertical mode" (NGC `CHANGELOG_ARCHIVE.md:7166`).
- Angular's browser support is the Baseline widely available set of a date chosen per major (section 2.3).

### 2.7 Other design systems

From a source survey of each library at a pinned tag or commit (read-only `gh api` and raw file fetches). The MUI documentation warning and Fluent UI's feature query were re-read directly for this dossier.

| Library (version) | Element with the slider role | Vertical technique | `aria-orientation` on | Two thumbs vertical | Source |
| --- | --- | --- | --- | --- | --- |
| MUI Material UI `Slider` (`@mui/material` 9.4.0) | visually hidden native range input | `writing-mode: vertical-lr` (LTR) or `vertical-rl` (RTL) on the hidden input; visible parts positioned with CSS | the hidden input | yes | `mui/material-ui` at `v9.4.0`, `packages/mui-material/src/Slider/useSlider.ts:860-863`, `:885`, `:902` |
| MUI Base UI `Slider` (`@base-ui/react` 1.8.0) | visually hidden native range input | same `writing-mode` scheme; a test asserts it does not set `-webkit-appearance: slider-vertical` "because it changes horizontal keyboard navigation in WebKit" | the hidden input | by design; no demo | `mui/base-ui` at `v1.8.0`, `packages/react/src/slider/thumb/SliderThumb.tsx:304-317`, `:445`; `root/SliderRoot.test.tsx:481-495` |
| React Aria `useSlider`/`useSliderThumb` (`react-aria` 3.48.0) | native range input (hidden by the consumer) | custom `top`/`left` percentage positioning, no `writing-mode` | the native input | yes | `adobe/react-spectrum` at `ca748178`, `packages/react-aria/src/slider/useSliderThumb.ts:236-238`, `:280`, `:293-297` |
| `@react-spectrum/slider` 3.9.0 | native range input | none (no vertical) | not set | n/a | same commit, `packages/@adobe/react-spectrum/src/slider/Slider.tsx:22-40` |
| Radix UI Slider (`@radix-ui/react-slider` 1.4.7) | `span role="slider"` | custom positioning | the thumb | yes | `radix-ui/primitives` at `1.6.7`, `packages/react/slider/src/slider.tsx:690-704` |
| Zag.js slider 1.44.0 (Ark UI, Chakra UI v3) | element with `role="slider"` | custom positioning | the thumb | yes | `chakra-ui/zag` at `@zag-js/slider@1.44.0`, `packages/machines/slider/src/slider.connect.ts:177-182` |
| Fluent UI React v9 `Slider` (9.6.6) | native range input with `opacity: 0` | `@supports (writing-mode: sideways-lr) { writing-mode: vertical-lr; direction: rtl }`, else `-webkit-appearance: slider-vertical`; plus `orient="vertical"` | not set by Fluent | no | `microsoft/fluentui` at `fc4b14cf`, `packages/react-components/react-slider/library/src/components/Slider/useSliderStyles.styles.ts:255-269`, `useSlider.ts:67` |
| Fluent UI Web Components `<fluent-slider>` 3.1.3 | custom element, role through `ElementInternals` | custom positioning | the host (`ElementInternals.ariaOrientation`) | no | `microsoft/fluentui` at `44cf3fb9`, `packages/web-components/src/slider/slider.ts:505-528` |
| Web Awesome `<wa-slider>` 3.14.0 | custom `role="slider"` | custom positioning | each thumb | yes | `shoelace-style/webawesome` at `v3.14.0`, `packages/webawesome/src/components/slider/slider.ts:927-990` |
| Shoelace `<sl-range>` 2.20.1; Adobe `sp-slider` 1.12.2; Carbon 11.117.0; Bootstrap `.form-range` 5.3.8 | native (Shoelace, Spectrum WC, Bootstrap) or custom (Carbon) | none: no vertical form | not set | n/a | respective tags |
| PrimeNG `p-slider` 21.1.10 | `span role="slider"` | custom positioning | each thumb | yes | `primefaces/primeng` at `21.1.10`, `packages/primeng/src/slider/slider.ts:79`, `:104`, `:129` |
| ng-zorro-antd `nz-slider` 22.1.1 | `div` with no role | custom positioning | not set | structurally | `NG-ZORRO/ng-zorro-antd` at `22.1.1`, `components/slider/handle.component.ts:141-155` |
| daisyUI `range-vertical` 5.7.46 | native range input | `writing-mode: vertical-lr; direction: rtl` | not set | no | `saadeghi/daisyui` at `v5.7.46`, `packages/daisyui/src/components/range.css:197-224` |
| GOV.UK Frontend 6.5.1 | no slider component | n/a | n/a | n/a | `alphagov/govuk-frontend` at `v6.5.1`, components directory |

Related discussions (read only):

- MUI's documentation, verbatim: "Chrome versions below 124 implement `aria-orientation` incorrectly for vertical sliders and expose them as `'horizontal'` in the accessibility tree. ([Chromium issue #40736841](https://issues.chromium.org/issues/40736841)) The `-webkit-appearance: slider-vertical` CSS property can be used to correct this for these older versions, with the trade-off of causing a console warning in newer Chrome versions" (`mui/material-ui` at `v9.4.0`, `docs/data/material/components/slider/slider.md:104-113`). Table 1 measured Chromium 120 exposing `appearance: slider-vertical` as horizontal and Chromium 141 and 153 as vertical, and every measured Chromium version ignoring `aria-orientation` on a native range, including 141 and 153.
- mui/material-ui pull request 44537, "[material-ui][Slider] Set CSS `writing-mode` and update vertical slider docs", merged 2024-12-10; mui/base-ui issue 635, "[slider] Vertical slider incorrectly exposed as horizontal in the accessibility tree in Chrome<124", closed 2024-10-28.
- microsoft/fluentui issue 33944 (Chrome's console warning for `slider-vertical`: "Use `<input type=range style="writing-mode: vertical-lr; direction: rtl">` instead") and pull request 34022, merged 2025-03-20, which added the `@supports` fallback.
- shoelace-style/webawesome issue 77, closed 2025-06-05: moved `<wa-slider>` to a custom `role="slider"` element, listing "Add support for dual thumbs" and "Add support for vertical orientation" among the reasons.
- adobe/spectrum-web-components issue 5514, "[Feat]: Vertical Sliders", open since 2025-06-04, discussing `writing-mode: vertical-lr`, `orient`, and `appearance`.
- saadeghi/daisyui pull request 4554, merged 2026-06-15: "Uses native `writing-mode` + `direction` for orientation instead of a `transform: rotate()` hack, so keyboard interaction, focus, and the accessibility tree all work natively."

### 2.8 Published assistive-technology support data

ARIA-AT, "Vertical Temperature Slider" test plan V25.07.24 (the APG example: a custom `role="slider"` element with `aria-orientation="vertical"`). The embed page is headed "Warning! Unapproved Report": candidate tests "in review by assistive technology developers and lack consensus regarding: 1. applicability and validity of the tests, and 2. accuracy of test results" (`https://aria-at.w3.org/embed/reports/apg/vertical-temperature-slider`, fetched through markdown.new). Per-target pages were rendered headlessly (`D:/tmp/nfs-decision-slider-vertical/data/render.mjs`; outputs `data/ariaat-0.txt` to `ariaat-3.txt`) and the SHOULD assertion "Convey orientation, 'vertical'" counted with `rg`:

| Target (report page) | Report completed | "Convey orientation, 'vertical'" | Example response |
| --- | --- | --- | --- |
| JAWS 2025.2508.120 and Chrome (`https://aria-at.w3.org/report/163650/targets/495`) | 2026-05-06 | 12 passed | "Temperature Temperature  up down slider  25.0 degrees Celsius" |
| JAWS 2025 or later and Chrome (`.../targets/434`) | 2025-08-19 | 12 passed | |
| VoiceOver for macOS 15.1 or later and Safari (`.../targets/432`) | 2025-08-25 | 7 passed, 1 untestable | "25.0 degrees Celsius Temperature vertical slider You are currently on a vertical slider." |
| NVDA 2024.4 or later and Chrome (`.../targets/433`) | 2025-08-08 | 10 failed, 2 untestable | "Temperature slider 25.0 degrees Celsius" |

ARIA-AT, "Color Viewer Slider" (horizontal custom sliders; `https://aria-at.w3.org/report/163630/targets/{496,325,482}`, outputs `data/ariaat-cv-*.txt`): JAWS 2025.2508.120 with Chrome says "Red  left right slider  128 min 0 max 255" and "Convey orientation 'horizontal'" (a MAY assertion) is "Supported" 12 times; NVDA 2020.4 or later with Chrome: "Unsupported" 12 times; VoiceOver for macOS 15.0 with Safari: "128 Red horizontal slider has keyboard focus", "Supported" 2, "Unsupported" 5, "Untestable" 1.

No ARIA-AT target covers Firefox, Edge, Narrator, TalkBack, or VoiceOver on iOS for these plans (the reports index lists only the targets above for both plans, `data/ariaat-reports-0.txt`). The ARIA-AT assertion "Orientation, 'vertical', is conveyed" has priority 2 (SHOULD) in the test plan (`w3c/aria-at` at `b75f57f711c2`, `tests/apg/vertical-temperature-slider/data/assertions.csv:12`; priority mapping in `resources/aria-at-test-io-format.mjs:1419`). Every ARIA-AT subject above is an ARIA slider, not a native range input.

a11ysupport.io (`accessibilitysupported/a11ysupport.io` at `6730ad42e83d`):

- `data/tech/aria/aria-orientation_attribute.json` and `data/tech/aria/slider_role.json` have `"assertions": []` (updated 2019-01-06): no orientation tests.
- `data/tests/tech/html/input/input-range.json` tests a plain horizontal range (no orientation markup); JAWS 2021.2107.12 with Chrome 92 and Edge 92 says "volume, left right slider. 6, min 0, max 11."; JAWS 2020.1912.11 with Firefox 72 says "left right slider" on one command and "up down slider" on another, marked partial; NVDA 2021.1 with Chrome and Edge 92 says "volume, slider, 6"; VoiceOver on iOS 13.1.3 says "volume, 6, 54.5%, adjustable, swipe up or down with one finger to adjust the value"; TalkBack 7.3.0 with Chrome 77 says "54%, volume, slider, use volume keys to adjust" (dates 2019-10-23 to 2021-07-29).

PowerMapper's screen reader reliability tests (`https://www.powermapper.com/tests/screen-readers/aria/`, page dated 2025-12-14) cover no slider role, `aria-orientation`, or `input type=range`.

Chromium issue 40736841, "aria-orientation is ignored on input[type="range"]" (created 2020-12-13, status New, P2, S4, label `Status_ExternalDependency`; read through `https://issues.chromium.org/action/issues/40736841` on 2026-09-26). Comment 6: "The behavior is seen from M-75". Comment 9 (Google triager): "This is expected behavior as the same result is observed on Firefox. The aria-orientation attribute is not supported on <input> since you can't have a vertical <input> control." Comment 11 reopened it. Screen-reader observations recorded in comments 11 and 13 (2020, reported by the commenters, not measured here): JAWS with Chrome "left right slider" for `input` plus `aria-orientation="vertical"` and "up down slider" for a `role="slider"` with vertical orientation; JAWS with IE11 and Edge 15 "up down slider" for the native input with `aria-orientation="vertical"`; NVDA "slider 50"; VoiceOver on iOS "adjustable, swipe up or down with one finger to adjust the value". The same thread states "users can use, the up/down arrow keys and the left/right arrow keys regardless of the screen reader they are using for both vertical and horizontal sliders". The issue description gives the workaround "If I style the input with `appearance: slider-verical` the computed orientation is 'vertical'".

Screen-reader source and documentation:

- NVDA (`nvaccess/nvda` at `f56b2e0d7522`): `controlTypes.State` has no horizontal or vertical member (`source/controlTypes/state.py:48-105`), and the IA2 state map has no `IA2_STATE_HORIZONTAL`/`VERTICAL` (`source/IAccessibleHandler/__init__.py:237-249`). Issue nvaccess/nvda 6283, "NVDA does not pronounce 'aria-orientation' attribute", open since 2016-08-19 (last comment 2024-07-02). NVDA switches to focus mode on a slider, so arrow keys go to the page (`source/browseMode.py:326-343`, `ALWAYS_SWITCH_TO_PASS_THROUGH_ROLES` includes `Role.SLIDER`).
- Orca (`GNOME/orca` at `6020c8a71233`): the role name becomes "horizontal slider" or "vertical slider" from `Atspi.StateType.HORIZONTAL`/`VERTICAL` (`src/orca/ax_utilities_role.py:433-440`; strings `object_properties.py:366`, `:375`), with the translator comment "in some applications and toolkits, it can dictate which keyboard keys should be used to modify the value of the widget."
- JAWS: no Freedom Scientific statement of the rule was found; the measured phrasing is in the ARIA-AT and a11ysupport data above. Narrator: nothing found in Microsoft's documentation.
- VoiceOver on iOS: "When a VoiceOver user swipes up with a slider in focus, Safari automatically simulates an arrow-key right event. And similarly, if a VoiceOver user swipes down ..., an arrow key left event will be simulated" (Apple, WWDC22 session 10153 "What's new in web accessibility", transcript at `https://developer.apple.com/videos/play/wwdc2022/10153/`). WebKit's code picks Up/Down for a vertical ARIA slider and Right/Left otherwise when it synthesises keys (`Source/WebCore/accessibility/AccessibilityNodeObject.cpp:1885-1902` at `c39e3bbd9539`); for a native range, `AccessibilitySlider::setValue` sets the value directly (`AccessibilitySlider.cpp:144-153`).
- TalkBack and Android: `AccessibilityNodeInfo.RangeInfo` has type, minimum, maximum, and current value, and no orientation (developer.android.com reference, last updated 2026-08-03); TalkBack adjusts a slider through scroll actions with no orientation logic (`google/talkback` at `229212fdf584`, `talkback/.../actor/NumberAdjustor.java:62-111`).
- A cross-engine table of arrow keys on vertical `writing-mode` ranges by a Chromium engineer (w3c/aria issue 2759, comment 4315678257, 2026-04-24) reports that under `direction: rtl` Right increases in Blink and decreases in Gecko and WebKit, and that the `ltr` results are "all over the map"; Chromium issue 505068939 tracks "right/left arrow key behavior is inverted in the following RTL vertical slider". Table 3 above measured WebKit 26.6 with `appearance: none` differently (Right increases); with native appearance WebKit 26.6 matched the table (Right decreases, table 2).

### 2.9 The effort's own tickets, specs, prototypes, and ADRs

- Spec: vertical input and class (`specs/slider.md:90`, `:123`, `:191`, `:227`); `aria-orientation` binding (`:233`); ARIA table, "Chromium ignores it on a native range and reports horizontal (OPEN FOR HUMAN 1)" (`:287`); keys (`:37`, `:295-297`); the fallback line "If OPEN FOR HUMAN 1 ... is ruled unacceptable, the vertical form alone moves to a custom `role="slider"` handle, whose cost the prototype estimated (the APG vertical example is 256 lines, Foundation's plugin 718, Material's slider and input 1,807)" (`:255`); Material comparison row "`vertical` (rotated inputs; `writing-mode` later)" (`:266`); Out of Scope, "A custom `role="slider"` handle and Foundation's `.slider-handle` span markup (not supported ...)" (`:508`); rule 11 (`:629`); rule 12 scoped to `.slider:not(.vertical)` (`:630`); the upgrade note (`:641-643`); stories `slider--vertical` and `slider--vertical-two-handles` (`:439`, `:447`); e2e pixels and drags cover vertical (`:486`, `:489`); WCAG 4.1.2 row (`:318`).
- Constraints any alternative must keep (from the spec): non-linear Handles carry the Bar position natively with `aria-valuetext` carrying the value ([ADR 0020](../adr/0020-slider-non-linear-bar-position.md); `specs/slider.md:252`); the range form sizes each input with `--nfs-slider-span` along the physical `width` in rule 3 (`:620`) and positions the fill with `top`/`height` on vertical sliders (rule 11); forced colours are rule 13 (`:631`); right-to-left: rule 12 and the per-engine linear arrow direction (`:295`, `:305`, `:630`), with rule 11 setting `direction: ltr` on vertical inputs "because an RTL range would put the minimum at the top after rotation" (`:629`); hydration: server HTML is the final DOM, the live value is written after the first render, pre-hydration native changes are adopted by the replayed `input` event, and the `hydrate never` residue is the native control (`:24`, `:417-425`); track-press geometry reads the container rectangle and computed direction at event time (`:254`); a thumb and input box of at least 24 by 24 CSS px (`:314`, rules 5 and 5a).
- Spec ticket: decision 29 (`issues/32-spec-slider.md:91`); OPEN FOR HUMAN 1 (`:120`); triage: impact HIGH because "the applied default freezes the consumer markup of the vertical form ... moving the vertical form to a custom `role="slider"` handle later changes that markup for every consumer and adds a second implementation path"; confidence NOT HIGH because the default is carried from the prototype and "4.1.2 can be read as requiring the orientation to be programmatically determinable"; "What would raise confidence: a screen-reader check of the vertical native range in Chromium (NVDA and JAWS with Chrome and Edge, TalkBack)" (`:165-168`).
- P45: result "Vertical orientation for assistive tech: PARTIAL: Chromium reports `orientation: horizontal` for a native range with `aria-orientation="vertical"`; the control `div[role=slider]` reports vertical ... Firefox and WebKit not measurable here" (`issues/45-prototype-slider-range-input.md:47`); vertical keys pass (`:46`); decision 4 (`:103`); OPEN FOR HUMAN 1: "sources cannot settle how much it matters to AT users" (`:113`); not proven: "Orientation exposure in Firefox and WebKit" and "Non-square thumbs ... Foundation swaps them for vertical handles), vertical RTL, and a non-linear double slider" (`:90-92`); the custom fallback was not built, costed at 256 (APG vertical), 394 (APG multi-thumb), 718 (Foundation), and 1,807 (Material) lines against the native prototype's 374 lines of TypeScript (`:94`).
- [Prototype: Slider before hydration, non-linear bounds, and RTL](../issues/64-prototype-slider-hydration-nonlinear.md): "Vertical RTL, or RTL combined with a non-linear scale" not tested (`:79`).
- [ADR 0022](../adr/0022-wcag-2-2-aa-enforcement.md): "Chromium's orientation announcement for rotated range inputs" was left OPEN FOR HUMAN by kind (`:20`); the map's open-decision pass later ruled that assistive-technology checks are decided from evidence in this pass (`map.md:141`).
- [ADR 0008](../adr/0008-rendering-modes-contract.md): first-paint state is a host binding; browser-only reads and writes live in render callbacks; activation listeners change state before `preventDefault()`.
- Building-blocks: Slider row, "vertical orientation is announced as horizontal by Chromium until `writing-mode` is in target (OPEN FOR HUMAN in that ticket)" (`building-blocks.md:230`); "`writing-mode` vertical and `::slider-*` pseudo-elements when in target" (`:257`).
- Map: the Browser target rule (`map.md:44-56`), the triage rule (`:137`), and the open-decision pass (`:141`).

## 3. Consequences per option

Shared facts used below: JAWS with Chrome says "up down slider" for a slider exposed as vertical and "left right slider" for one exposed as horizontal, and VoiceOver with Safari says "vertical slider" and "horizontal slider"; NVDA with Chrome did not convey orientation in either plan (section 2.8). Chromium exposes a rotated native range as horizontal and a `writing-mode` range as vertical, in its accessibility tree and in UIA (table 1). What JAWS says today for a rotated native range in Chrome was not observed; the ARIA-AT responses are for custom sliders, and the only report for a native range with `aria-orientation="vertical"` in Chrome is a 2020 bug comment ("left right slider", section 2.8). Chromium's code maps the exposed orientation to UIA, IA2, ATK, and macOS alike (section 2.4, engine source), so the horizontal readout applies on every desktop platform API; Android exposes no orientation at all.

### A. Rotated native inputs with `aria-orientation="vertical"` (current default)

- WCAG 2.2 AA: 4.1.2 and 1.3.1 touched through the orientation Chromium exposes (horizontal) against the orientation the page shows (vertical). 2.1.1: native keys work, Up and Right increase in every measured engine (table 3). 2.5.8: rules 5 and 5a apply to the rotated input box as today. 2.5.7: unchanged. Forced colours (1.4.11): rule 13 unchanged.
- Users affected: Chromium-based browsers expose horizontal (Chrome, Edge, and other Chromium browsers; measured Chromium 120, 141, 153; UIA in Chromium 153). Playwright's WebKit (17.4, 26.0) exposes vertical from `aria-orientation`, as WebKit's source does for any range with the attribute. Firefox (119, 142) carries `aria-orientation` as an object attribute; by its source it sets no IA2 or ATK orientation state on a native range and exposes the attribute as `AXOrientation` on macOS, and Firefox 155's UIA exposes no orientation for any slider. JAWS users with Chrome are the group whose announcement depends on the exposed orientation (section 2.8); NVDA with Chrome did not announce orientation even for a correctly exposed vertical slider.
- Contract frozen: consumer markup `input[type=range][nfsSliderHandle]` inside `.slider.vertical`; the `vertical` input; `aria-orientation` binding (spec triage, `issues/32-spec-slider.md:166`).
- Reversibility: moving to B later changes Library mixin rules (rule 11) and not the consumer markup; moving to C or F later changes the consumer markup (spec triage).
- Cost: none now; the spec already carries it. The upgrade note (`specs/slider.md:641-643`) names the later change. The Browser target tied to Angular 22 holds until the library moves to a later Angular major (v23.0 "~ June 2027"); vertical form controls become Baseline widely available on 2026-10-18 (section 2.3).
- Rendering modes: native control before hydration and in `hydrate never`; server HTML final; no change.

### B. Native inputs laid out with `writing-mode`

- WCAG 2.2 AA: 4.1.2 and 1.3.1: Chromium exposes vertical from the layout (tables 1 and 3) and ignores `aria-orientation` on the input; Firefox carries only `aria-orientation` (table 1), and Firefox 155's UIA exposes no orientation either way; by WebKit's source, an `appearance: none` range with a vertical writing mode is horizontal unless `aria-orientation` says otherwise (section 2.4, engine source; not measured). Keeping `aria-orientation="vertical"` alongside `writing-mode` therefore changes the result in Firefox and WebKit and not in Chromium. 2.1.1: all keys still move the value, but the native direction of Right and Left differs by engine under `direction: rtl` (Firefox and Chromium 120: Right decreases), and Up decreases in Chromium 141 and 153 under `direction: ltr` inside Foundation's flip (table 3); user story 10 ("Up and Right increase", `specs/slider.md:37`) is met natively in no single measured configuration across current engines, so Bk (a directive key handler for vertical linear Handles) or a change to user story 10 would follow; the APG allows reversed key directions "in some circumstances" (APG `slider-pattern.html:64`). 2.5.8: the thumb stays 24 by 24 px with rule 5a's physical sizes (Foundation's default thumb is square); the input box floor of rule 5 (`height`) would apply to the other axis. Forced colours: rule 13 is not tied to rotation, not measured under `writing-mode`.
- Browser target: web-features puts the group at Baseline low 2024-04-18, widely available 2026-10-18, after the 2026-05-07 target; for range inputs specifically, per-engine sources report earlier support than the group (Chromium M119 source and a measured Chromium 120, bottom to top only; Firefox 119 source and measurement; BCD Safari 16.5), while BCD records Chrome 124 and Firefox 120 for range (section 2.3). B1 relies on the per-engine facts; B2 uses a proxy query (`sideways-lr`: Chrome 132, Firefox 43, Safari 18.4), so Chrome 124 to 131 and Safari 17.4 to 18.3 would take the fallback although they support vertical range inputs; B3 changes the DOM after hydration.
- Contract: consumer markup unchanged (`input[type=range][nfsSliderHandle]` inside `.slider.vertical`); rules 3, 10, and 11 of the Library mixin change (the range form's width-based `--nfs-slider-span` sizing, the fill, the size container), and the Foundation `foundation-range-input` output needs the specificity and physical-property adjustments in table 4.
- Reversibility: Library mixin and directive internals only; consumers are not touched.
- Cost to the spec: rule 11 rewritten; rule 3 and the track-press geometry reconsidered for the vertical axis (not measured); the RTL statements for vertical Handles (rule 12 is `.slider:not(.vertical)`; rule 11's `direction: ltr` becomes a deliberate `direction` choice); the key table and user story 10; the e2e and story cases for vertical. The two-handle vertical form, non-linear vertical Handles, forced colours, and the track press under `writing-mode` were not measured by this dossier or by P45 (P45 rotated; `issues/45-prototype-slider-range-input.md:90-92`).
- Rendering modes: native control before hydration and in `hydrate never` (B1 and B2 are pure CSS, so the server HTML is final); B3 adds a client-side switch after the first render.

### C. Custom `role="slider"` Handle for the vertical form only

- WCAG 2.2 AA: 4.1.2 and 1.3.1: every measured engine exposes `aria-orientation` on a custom `role="slider"` (table 1 `div-v`; Firefox 155 UIA excepted, which exposes no orientation for any slider). The Handle then owns `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-valuetext`, and its name; the dependent bounds of the range form become ARIA attributes (APG multi-thumb) rather than native `min`/`max`. 2.1.1: all keys implemented by the directive. 2.5.7 and 2.5.8: pointer handling and target size owned by the directive and the Library mixin.
- Users affected: the APG's touch-AT warning applies to custom sliders (APG `slider-pattern.html`, "About This Pattern"; `specs/slider.md:9`, `:521` D1); the spec's reason for choosing native inputs.
- Contract frozen: a second Handle element for vertical sliders (Foundation's `.slider-handle` span or another element) beside the native input for horizontal sliders; form association through a hidden input or the directive (the spec removed the hidden inputs, `specs/slider.md:121`); `FormValueControl` on a non-input element.
- Reversibility: going back to native Handles later changes consumer markup again.
- Cost: the spec's own estimate points at the APG vertical example (256 lines), Foundation's plugin (718), and Material's slider and input (1,807) (`specs/slider.md:255`); pointer capture, keys (including right-to-left), value maths, non-linear scales, and ARIA state move into the directive for the vertical form only, a second implementation path (spec triage, `issues/32-spec-slider.md:166`).
- Rendering modes: before hydration and in `hydrate never` a custom Handle is not operable (no native keyboard or pointer behaviour); its server HTML must carry `aria-valuenow` and the position; replayed `keydown` and `pointerdown` must be handled after hydration (ADR 0008 replay rules); this differs from the native residue the spec lists for `hydrate never` (`specs/slider.md:425`).

### D. Drop the vertical form until the platform catches up

- WCAG 2.2 AA: nothing to meet for a form that does not exist.
- Users affected: consumers who use Foundation's documented vertical slider (FS `docs/pages/slider.md:40-58`) have no counterpart; the spec's user stories 9 and 10 and the `vertical` input go.
- Contract: removes the `vertical` input and `.vertical` binding; adding them later is additive.
- Reversibility: adding the form back is additive for consumers.
- Cost: the spec loses rule 11, two stories, and vertical e2e cases; the destination of the map covers every Foundation plugin feature through the specs (map, "Destination"), and Foundation's Slider has the vertical form as a documented feature.
- Rendering modes: none.

### E. Non-standard switches (`appearance: slider-vertical`, `orient="vertical"`)

- Measured: `-webkit-appearance: slider-vertical` replaces the Foundation-styled thumb with the native one in Chromium and WebKit (table 3, no red thumb painted), because `foundation-range-input` needs `appearance: none` (FS `_range.scss:51`, `:81`); Chromium 120 exposes it as horizontal, Chromium 141 and 153 as vertical; WebKit reverses Home and End for it (table 2). Firefox ignores `slider-vertical`, and `orient="vertical"` lays the range out vertically in Firefox with no orientation state (tables 1 and 2). Chromium's status entry to remove `slider-vertical` is at "No active development" and Chrome prints a console warning for it (section 2.3, section 2.7).

### F. Visually hidden native input with a positioned visible thumb (MUI shape)

- Accessibility: the hidden native input with `writing-mode` exposes vertical in Chromium (table 1 `wm-*` rows; MUI sets `aria-orientation` on it as well for other engines, `useSlider.ts:885`).
- Contract and cost: the visible thumb (for example Foundation's `.slider-handle` span) needs directive positioning and pointer handling, which the native input does today; the pointer maths becomes the directive's; server HTML must position the visible thumb from the value.
- Rendering modes: before hydration the hidden native input is keyboard-operable, the visible thumb does not move until hydration (no measurement in this dossier).

## 4. Open unknowns

- Real Chrome 119 to 123 and real Firefox 119 on vertical range inputs. BCD says Chrome 124 and Firefox 120; Chromium's M119 source, chromestatus ("slowly rollout"), Firefox 119's source, and Playwright's Chromium 120 and Firefox 119 builds say earlier (section 2.3, tables 2 and 3). What would settle it: running the official Chrome 119 and Firefox 119 release builds (not Playwright builds) on `keys.html`, and reading Chrome's field-trial configuration for `FormControlsVerticalWritingModeSupport` in those milestones.
- Real Safari 17.0 to 17.3 and Safari 17.4 or later. BCD records Safari 16.5 for vertical range sliders; this machine has only Playwright's Windows WebKit, whose 17.4 and 26.0 builds keep the preference off (section 2.3). What would settle it: Safari on macOS and iOS at 17.0 and 17.4 with `keys.html` and the Accessibility Inspector.
- Firefox 155 and WebKit 26.6 accessibility trees for `writing-mode` inputs: no readout (Playwright 1.57 removed `page.accessibility`; the cross-version run hung). IAccessible2 states (`IA2_STATE_VERTICAL`/`HORIZONTAL`) were not measured for any case; by Chromium's source they follow the same state as UIA, and by Gecko's source a native range gets neither (section 2.4, engine source). What would settle it: an IA2 reader or Accessibility Insights for Windows on headed Chrome and Firefox; macOS Accessibility Inspector for Safari.
- What JAWS says for a rotated native range in Chrome (expected from section 2.8 to follow the exposed orientation, not observed), and whether any screen reader changes behaviour on the orientation (VoiceOver on iOS and TalkBack were not covered by ARIA-AT for these plans). What would settle it: a JAWS and TalkBack run on `page.html`.
- The ARIA-AT reports are unapproved candidate results.
- The two-handle vertical form, non-linear vertical Handles, forced colours, right-to-left pages, touch input, and the track press under `writing-mode`; whether rule 3's width-based span and the fill rules carry over to the inline axis; the cost of a key-normalising handler for vertical linear Handles (Bk). What would settle it: a prototype extending the P45 workspace with `writing-mode` vertical Handles in the single and range forms, measured in three engines at the target-era and current builds.
- Whether per-engine support for vertical range inputs that predates the web-features group date counts as "available" under the map's Browser target rule, which names Baseline widely available status (`map.md:44-56`): a reading of the rule, not a fact the sources settle.
