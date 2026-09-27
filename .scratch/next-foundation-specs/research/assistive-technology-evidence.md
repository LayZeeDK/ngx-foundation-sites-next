# Assistive-technology evidence: checks 1 to 7

Evidence for [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md), checks 1 to 7 of the README's "Assistive-technology checks" list (Accordion, Tabs, Responsive Accordion Tabs, Reveal, Off-canvas, Tooltip, Nested menu and Responsive Menu). Gathered 2026-09-26 to 2026-09-27 without a person listening to a screen reader, as the user ruled (map, "Open-decision pass"). Each section gives the markup the spec produces, what Chromium, Firefox, and WebKit expose for it at every step of the interaction the check names, the WAI-ARIA 1.2, HTML-AAM, and Core-AAM mappings, the published support data, and a proposed verdict for the judge with a Testing Decisions line.

## Proposed verdicts

| # | Check | Proposed verdict | Deciding evidence |
| --- | --- | --- | --- |
| 1 | Accordion | Spec correct | Both Windows engines expose each title as a focusable button inside a level-3 heading, with the expanded state, the locked title as unavailable (MSAA `STATE_SYSTEM_UNAVAILABLE`, UIA `IsEnabled=false`) while still focusable, the open panel as a region named by its title, and collapsed content absent (inert); 3 of 3 runs. The glyph is in every name (Firefox without a space) and Firefox re-fires the focused title's name on every toggle; that cost is the one the spec already accepted (D18) |
| 2 | Tabs | Spec correct | `a[role="tab"]` without `href` is a page tab / `TabItem` with selected state and position 1 to 3 of 3; the tab list carries its `aria-label` name, each shown panel is a named property page / tab panel; focus and selection events fire on arrow keys; 3 of 3 runs |
| 3 | Responsive Accordion Tabs | Spec correct | Every Mode swap fires exactly one focus event, on the equivalent control, whose ancestor chain carries the new container ("Product details" tab list, or the title's heading and list), with no intermediate focus on the document; 4 swaps x 3 runs x 2 engines. NVDA's source speaks every newly entered ancestor on such a focus change |
| 4 | Reveal | Spec correct | Modal and alert dialogs are exposed as `dialog`/`alertdialog`, named by `aria-labelledby`, modal (`modal: true` in Chromium; the rest of the page leaves both trees); focus lands inside with the dialog as ancestor; focus returns to the Trigger with its collapsed state; the non-modal Reveal stays non-modal; 3 of 3 runs |
| 5 | Off-canvas | Spec defect, with the fix below | Correct for a sibling panel, but a modal panel nested inside `.off-canvas-content` (Foundation's nested form, which the spec supports) is made inert with its content: focus drops to `body` and the dialog leaves the tree in all three engines. Content outside `.off-canvas-content` also stays exposed in Chromium and Firefox, and only some screen readers honour `aria-modal` (Narrator, TalkBack, Orca fail the APG modal test). Inerting every sibling along the panel's ancestor chain fixes both, measured |
| 6 | Tooltip | Spec defect, with the fix below | The kept hidden tip does describe the host (both engines), but Firefox fires a description-change event on the focused host at the first show, at every re-show, and on Escape (3 of 3 runs, identical text), which NVDA speaks by default; and a host with a static consumer `aria-describedby` has no tooltip text in its description at first focus in either engine (HTML-AAM: `title` is not used once `aria-describedby` exists). Registering the text through CDK `AriaDescriber` in the first client render callback removes every such event and the gap, measured 3 of 3 |
| 7 | Nested menu and Responsive Menu | Spec correct | A swap with focus inside an open submenu keeps focus on the same node with no focus loss: Chromium fires no focus event at all, Firefox re-fires focus on the same link when entering drilldown (the node's accessible is rebuilt), a focused toggle whose submenu the swap closes reports `collapsed`, and focus on a back item the swap hides moves to the level's first link with one focus event; 3 of 3 runs |

## Method

### What was measured, and what it stands for

- WinEvents, the MSAA/IAccessible2 event stream a browser process fires. NVDA and JAWS consume this stream in Chromium and Firefox: NVDA maps `EVENT_OBJECT_FOCUS` to `gainFocus`, `EVENT_OBJECT_STATECHANGE` to `stateChange`, `EVENT_OBJECT_NAMECHANGE` to `nameChange`, `EVENT_OBJECT_DESCRIPTIONCHANGE` to `descriptionChange`, and `EVENT_SYSTEM_ALERT` to `alert` (nvaccess/nvda, `source/IAccessibleHandler/internalWinEventHandler.py`, lines 36-58 at commit `f56b2e0d7522da86765e6db64876ecde83c4a9d0`, fetched 2026-09-26). For every event the probe read the object's name, role, states, and description through `AccessibleObjectFromEvent`, and for focus, state, and description events its ancestor chain up to the document.
- The UI Automation tree of the document, read through the native `IUIAutomation` client (raw view). Narrator consumes it. Chromium 153 answered through its own provider (`framework=Chrome`, `chrome.dll`), Firefox 155 through Gecko's own provider (`framework=Gecko`, `xul.dll`).
- The Chromium CDP accessibility tree (`Accessibility.getFullAXTree`, and `getPartialAXTree` for chosen elements with their ignored reasons). This is Blink's internal tree, the same one Chromium maps to IA2, UIA, and Android's AccessibilityNodeInfo (TalkBack).
- Playwright's ARIA snapshot in all three engines. It is Playwright's own role and name computation run against each engine's DOM and style; it was identical across the three engines for every page, and it does not apply `inert` (Playwright 1.63's `isElementHiddenForAria` has no inert rule), so it is used only to cross-check roles and names.
- WebKit: Playwright's WebKit 26.6 on Windows (WinCairo) exposes no accessibility tree and fires no WinEvents (a headed WebKit window was probed: "no document named 'NFSAT tabs' in the window", no events). VoiceOver claims therefore rest on WebKit source (WebKit/WebKit `main` at `c39e3bbd953988fd6c963873ba3c6e53cde93d8f`, 2026-09-26) and on published data.
- None of these says which words a screen reader speaks. Where a verdict needs that, the section cites the screen reader's own source (NVDA) or published test results.

Correction (2026-09-27, from [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)): the NVDA pin. The NVDA mechanisms this file cites from `master` at `f56b2e0` were re-checked in the release `release-2026.2`, the pin of the checks 8 to 13 evidence, and match, with one difference that decides none of checks 1 to 7: the release speaks a state change on a focus ancestor as well as on the focus object. The symbol-level claim of check 1 (`symbols.dic`) was checked only in `master`; a drift there would change how the Accordion's glyph is read, which the Accordion's release test records.

### Environment and versions

Windows 11 Pro 10.0.26200 on ARM64 (Snapdragon X Elite), OS locale Danish (so UIA localized control types read "knap", "dialogboks", "fane"). Playwright 1.63.0 with Chrome for Testing 153.0.8010.12 (headed, `--force-renderer-accessibility`), Firefox 155.0 (Playwright's build, headed), WebKit 26.6 (headless). Foundation for Sites 6.9.0 `dist/css/foundation.css`, plus the specs' Library mixin rules written out as plain CSS (`nfs-accordion` rules 1-7, `nfs-reveal` rules 1-7, `nfs-motion` fades, the CDK `cdk-visually-hidden` rule).

### Pages and interaction

One minimal page per check reproduces the spec's Rendered HTML and the state changes its behaviour rules describe, driven by real key presses and viewport resizes from Playwright. Where Angular would render in a scheduled change-detection tick (zoneless), the page makes the DOM change and any focus move together in one task after the user event, as the tick does (for example the Mode swap: read focus, replace the branch, focus the equivalent control, all in one task). Before measuring, each run brought the browser window to the foreground and read the tree once, because an occluded Firefox window marks its document offscreen and delays events.

### Repeats

The event-bearing scenarios ran three times per engine (runs r1 to r3). A statement that an event does or does not fire is made only where all three runs agree; where runs differ it is said. This matters: one exploratory Chromium run lost a focus event that the next three runs all recorded (the Drilldown open in the menu page), so no single run is evidence of absence. The first focus event after page load in Firefox sometimes read an empty state set through `AccessibleObjectFromEvent` (a cold read of the probe); later focuses on the same element, and the UIA tree, show the full states.

### Files

Everything runnable is outside the repository, in `D:/tmp/nfs-at-evidence-1/`: `pages/` (the minimal pages), `scenarios/` (steps per check), `run.mjs` and `lib.mjs` (the driver), `AtProbe.cs` and `agent.ps1` (the read-only WinEvent and UIA probe, compiled by PowerShell 7), `out/` (the raw captures per scenario, engine, and run, and `summary-<scenario>.txt` with the key events per step across the three runs), `support-data.md` (the published-data notes with fetch details), and `fetch/`, `fetch2/` (the fetched sources). Re-run with `node D:/tmp/nfs-at-evidence-1/run.mjs <scenario> [chromium firefox webkit]` (port 4740; `RUN_TAG=<tag>` suffixes the output files).

Probe core, for the record (`AtProbe.cs`): `SetWinEventHook(0x8000, 0x8019, ..., pid, 0, WINEVENT_OUTOFCONTEXT)` plus `0x0002` (system alert) and `0x0010`-`0x0011` (dialog start and end) on a message-pumping STA thread, location changes dropped; for each event `AccessibleObjectFromEvent(hwnd, idObject, idChild)` then `get_accName`, `get_accRole`, `get_accState`, `get_accDescription`, and `accParent` up to the document. UIA: `CUIAutomation.ElementFromHandle(window)`, raw-view walk from the document named after the page title, reading property IDs 30003 (control type), 30004, 30005, 30008-30010, 30013, 30016, 30022, 30024, 30026, 30028/30070 (expand state), 30036/30079 (selection), 30094-30096 (LegacyIAccessible description, role, state), 30101 (AriaRole), 30102 (AriaProperties), 30104 (ControllerFor), 30105 (DescribedBy), 30107, 30135 (LiveSetting), 30152-30154 (position, size, level), 30158 (landmark), 30159 (FullDescription), 30173 (heading level), 30174 (IsDialog). Browser-chrome events (tab strip, status bar, Juggler controls) are filtered out of the captures.

## Shared mappings

WAI-ARIA 1.2 Recommendation (`https://www.w3.org/TR/wai-aria-1.2/`, fetched 2026-09-26) for the roles and states; HTML-AAM and Core-AAM from the local clone of `w3c/aria` (editor's drafts "HTML Accessibility API Mappings 1.0" and "Core Accessibility API Mappings 1.2", commit `ffa9651`, `html-aam/index.html` last changed 2026-09-24); Accessible Name and Description Computation 1.2 from the same clone.

| Feature | WAI-ARIA / HTML-AAM | MSAA + IA2 | UIA | AX API (VoiceOver) |
| --- | --- | --- | --- | --- |
| `button` | HTML-AAM: `button` role | `ROLE_SYSTEM_PUSHBUTTON` | Control Type `Button` | `AXButton` |
| `h1`-`h6` | `heading` with `aria-level` from the tag | `IA2_ROLE_HEADING`, `xml-roles:heading` | `Text`, localized "heading" | `AXHeading` |
| `region` with a name | landmark | `IA2_ROLE_LANDMARK`, `xml-roles:region` | `Group`, landmark type Custom, localized "region" | `AXGroup` / `AXLandmarkRegion` |
| `a` without `href` | `generic`; here overridden by `role="tab"` | (tab) `ROLE_SYSTEM_PAGETAB` | `TabItem` | `AXRadioButton` / `AXTabButton` |
| `tablist` | | `ROLE_SYSTEM_PAGETABLIST` | `Tab` with Selection pattern | `AXTabGroup` |
| `tabpanel` | | `ROLE_SYSTEM_PANE` or `ROLE_SYSTEM_PROPERTYPAGE` | `Pane` | `AXGroup` / `AXTabPanel` |
| `dialog` (also `<dialog>`) | HTML-AAM: `dialog` role; `open` set by `showModal()` maps to `aria-modal="true"`, by `show()` to `aria-modal="false"` | `ROLE_SYSTEM_DIALOG` | `Pane` | `AXGroup` / `AXApplicationDialog` |
| `alertdialog` | | `ROLE_SYSTEM_DIALOG`; "The user agent SHOULD fire EVENT_SYSTEM_ALERT" | `Pane`; SHOULD fire a system alert event | `AXApplicationAlertDialog` |
| `tooltip` | | `ROLE_SYSTEM_TOOLTIP` | `ToolTip` | `AXUserInterfaceTooltip` |
| `nav` | `navigation` | `IA2_ROLE_LANDMARK`, `xml-roles:navigation` | `Group`, landmark Navigation | `AXLandmarkNavigation` |
| `aria-expanded` true / false | | `STATE_SYSTEM_EXPANDED` / `STATE_SYSTEM_COLLAPSED` | `ExpandCollapseState` Expanded / Collapsed | `AXExpanded` YES / NO |
| `aria-disabled="true"` | | `STATE_SYSTEM_UNAVAILABLE` | `IsEnabled: false` | `AXEnabled: NO` |
| `aria-selected` true | | `STATE_SYSTEM_SELECTABLE`, `STATE_SYSTEM_SELECTED` | `SelectionItem.IsSelected: true` | `AXSelected: YES` |
| `aria-modal="true"` | | `IA2_STATE_MODAL` | `Window.IsModal: true` | "Prune the accessibility tree such that the background content is no longer exposed" |
| `aria-controls` | | `IA2_RELATION_CONTROLLER_FOR` | `ControllerFor` | `AXLinkedUIElements` |
| `aria-describedby` | | `accDescription`, `IA2_RELATION_DESCRIBED_BY` | `FullDescription` | custom content "description" |
| `aria-current` | | object attribute `current:<value>` | `AriaProperties.current` | `AXARIACurrent` |
| `inert` | HTML-AAM: "Nodes that are inert are not exposed to an accessibility API" | not exposed | not exposed | not exposed |
| `hidden` | `aria-hidden="true"` while `display: none` | | | |
| `title` | the name, the description, or not mapped, per the accname computation | | | |

Two computation rules decide checks 1 and 6. Accname, "Name From Generated Content": "For ::before pseudo elements, User agents MUST prepend CSS textual content, without a space, to the textual content of the current node." Accname, "Hidden Not Referenced": a hidden node returns the empty string unless it is part of an `aria-describedby` traversal "where the node directly referenced by that relation was hidden", so "user agents MUST include all nodes in the subtree ... when the node referenced by aria-labelledby or aria-describedby is hidden". HTML-AAM, Accessible Description Computation: user agents "MUST use the first applicable description source, even if its use results in an empty description"; `aria-describedby` comes first, and the `title` attribute is used only "Otherwise".

## 1. Accordion

Check: name, button role, expanded state, the locked title announced as unavailable, region names, and how the plus and minus glyphs read. [Spec: Accordion](../issues/15-spec-accordion.md), [specs/accordion.md](../specs/accordion.md).

### What the spec produces

ARIA and keyboard table (quoted):

> | `button.accordion-title` | Native button with Aria's redundant `role="button"`; `type="button"`; `id`; `aria-expanded`; `aria-controls` = content id; `aria-disabled="true"` when disabled or locked, else `"false"`; `tabindex="0"` (every title is in the Tab order); `data-active` on the focused title | Aria, plus the library's `aria-disabled` override |
> | `.accordion-content` | `role="region"` and `aria-labelledby` = title id (both removed with `[region]="false"`); `id`; `inert` while collapsed | Aria, plus the library's override for `region` |

Rendered HTML, server and hydrated before interaction (quoted, first item and the collapsed content):

```html
<li class="accordion-item is-active">
  <h3>
    <button class="accordion-title" role="button" type="button" id="ng-accordion-trigger-x1-0"
            data-active="false" aria-expanded="true" aria-controls="faq-shipping"
            aria-disabled="true" tabindex="0" jsaction="click:;keydown:;">Shipping</button>
  </h3>
  <div class="accordion-content" role="region" id="faq-shipping"
       aria-labelledby="ng-accordion-trigger-x1-0" ngh="0" jsaction="keydown:;">
...
<div class="accordion-content" role="region" id="faq-returns"
     aria-labelledby="ng-accordion-trigger-x1-1" inert="true" ngh="0" jsaction="keydown:;">
```

State change on clicking "Returns": Shipping gets `aria-expanded="false"`, `aria-disabled="false"`, its content `inert`; Returns gets `aria-expanded="true"`, `aria-disabled="true"` (locked), and loses `inert`. The glyph is Foundation's `::before` (`+`, and U+2013 EN DASH while the item is active), re-created under the heading by `nfs-accordion` rule 3. The page (`pages/accordion.html`) holds the spec's two-item accordion, a disabled accordion (`disabled` on the `ul`, every title `aria-disabled="true"`), and a `[region]="false"` accordion; each panel holds a link so focus can enter it. Below, `<en dash>` stands for U+2013 in a quoted name.

### Measured exposure

| Step | Chromium 153 | Firefox 155 | WebKit 26.6 |
| --- | --- | --- | --- |
| Initial | CDP: `heading "<en dash> Shipping" [level=3]` > `button "<en dash> Shipping" [disabled, expanded]`; `region "<en dash> Shipping"`; `heading "+ Returns"` > `button "+ Returns" [expanded=false]`; `#faq-returns` IGNORED (`inertElement`). UIA: `Button "<en dash> Shipping"` expand=Expanded, `IsEnabled=false`, focusable, LegacyIAccessible state {unavailable, expanded, focusable}; heading `Text` level 3 around it; `Group "<en dash> Shipping"` landmark "region" | UIA: `Button "<en dash>Shipping"` (no space) expand=Expanded, disabled, {unavailable, expanded, focusable}; `Group "<en dash>Shipping"` landmark region; the Returns panel absent | ARIA snapshot only (Playwright's computation, same text as in Chromium; it lists the inert Returns region, which the engine trees do not) |
| Tab to the locked title | `OBJECT_FOCUS PUSHBUTTON "<en dash> Shipping" {unavailable, focused, expanded, focusable}`, ancestors heading "<en dash> Shipping" < listitem < list; 3/3 | same, name "<en dash>Shipping"; 3/3 (runs 2 and 3 read the states empty on this first event of the page, see Method) | not measurable |
| Enter on the locked title | no event; 3/3 | no event; 3/3 | |
| Tab into the open panel | `OBJECT_FOCUS LINK "Shipping rates"`, ancestors grouping < PANE "<en dash> Shipping" (the region; MSAA falls back to pane, IA2 role landmark) < listitem; 3/3 | same, ancestor GROUPING "<en dash>Shipping" (the region); 3/3 | |
| ArrowDown to the collapsed title | `OBJECT_FOCUS PUSHBUTTON "+ Returns" {focused, collapsed, focusable}`; 3/3 | `"+Returns"`, same states; 3/3 | |
| Enter on Returns | `OBJECT_STATECHANGE PUSHBUTTON "+ Shipping" {collapsed}`, `OBJECT_STATECHANGE PUSHBUTTON "<en dash> Returns" {unavailable, focused, expanded}`; 3/3 | the same two state changes, plus `OBJECT_NAMECHANGE` on both titles ("+Shipping", "<en dash>Returns", the focused one included), because the glyph is in the name; 3/3 | |
| Tab into the new panel | `OBJECT_FOCUS LINK "Return policy"`, ancestor region "<en dash> Returns"; 3/3 | same; 3/3 | |
| Disabled accordion title | `OBJECT_FOCUS PUSHBUTTON "+ Warranty" {unavailable, focused, collapsed}`; 3/3 | same; 3/3 | |
| `[region]="false"` panel | link focus with plain grouping ancestors, no landmark; CDP `generic` | same | |

### Mappings

`button`, heading, `region` with a name, `aria-expanded`, `aria-disabled`, `aria-controls`, and `inert` as in Shared mappings; both engines match Core-AAM for each (MSAA/IA2 states and UIA properties above). The generated glyph is part of the name, as accname's "Name From Generated Content" requires; Firefox prepends it "without a space" as written, Chromium puts a space after it (the pseudo-element is absolutely positioned). WAI-ARIA 1.2 `aria-disabled`: the element is "perceivable but disabled, so it is not editable or otherwise operable". APG Accordion pattern (local `aria-practices` clone, commit `3f094fd`, 2026-09-15): "If the accordion panel associated with an accordion header is visible, and if the accordion does not permit the panel to be collapsed, the header button element has aria-disabled set to true."

### Published support data

- `aria-expanded` on a button (a11ysupport.io `aria-expanded.json`, tested 2020-03-30 and 2021-07-23): collapsed and expanded announced on entry and re-announced on activation by JAWS 2021/Chrome 92 ("partial" on activation), JAWS 2020/Firefox 74, NVDA 2021.1/Chrome 92, NVDA 2019.3.1/Firefox 74, Narrator/Edge 44, VoiceOver macOS 10.15.4/Safari 13.1, VoiceOver iOS 13.4, TalkBack 8.1/Chrome 80.
- `aria-disabled="true"` on a button (a11ysupport.io, 2018-11-30 to 2021-08-07): JAWS 2021/Chrome 92 "target button unavailable", NVDA 2021.1/Chrome 92 "Target, button, unavailable", Narrator/Edge 44 "target, button, disabled", TalkBack 8.1 "target, button, disabled", VoiceOver iOS 12.1 and macOS 10.15.6 "target, dimmed, button"; all pass.
- `aria-controls` (a11ysupport.io, 2019-04-09 to 2021-07-15): not announced on entry by any tested screen reader; JAWS can jump to the controlled element. The spec relies on it for nothing a user must hear.
- `region` with `aria-labelledby`: no published per-AT test (a11ysupport.io's `region_role.json` has no assertions; PowerMapper has no region page). ARIA-AT's Accordion report (report 163649, from test plan V25.07.14, candidate) covers "Navigate into an accordion panel": JAWS 2025.2508.120/Chrome 20 of 22 must-haves (2025-12-11), NVDA/Chrome 22 of 22 (2025-08-13), VoiceOver macOS/Safari 14 of 18 (2025-09-04).
- The APG example as a whole (ARIA-AT report 163649): JAWS/Chrome 198 of 200 must-have, NVDA/Chrome 196 of 200, VoiceOver macOS/Safari 134 of 160. No TalkBack or Narrator results.
- CSS generated content in a name: a11ysupport.io (2020-04-17 to 2021-07-29) passes in NVDA/Chrome, JAWS/Firefox, VoiceOver macOS and iOS, TalkBack, and fails in JAWS/Chrome 92 and Narrator/Edge 44; PowerMapper (last updated 2025-12-14) lists NVDA with Chrome and Firefox, JAWS with Chrome, VoiceOver macOS and iOS as "Stable - OK" through their 2025 versions.
- How NVDA speaks the glyphs: `source/locale/en/symbols.dic` gives `+` the text "plus" at level "some" and U+2013 the text "en dash" at level "most"; the default symbol level is 100, "Some" (`configSpec.py` `symbolLevel = integer(default=100)`, `characterProcessing.py` `SOME = 100`). So at default settings NVDA says "plus" before a collapsed title and nothing for the en dash. No published default for JAWS or VoiceOver was found (Freedom Scientific's documentation returned 403).
- Name changes on the focused object: NVDA's `event_nameChange` speaks the new name whenever the object is the focus, with no setting (`source/NVDAObjects/__init__.py`, lines 1409-1413). With Firefox's name-change events above, NVDA re-speaks the focused title's name (with its glyph) after each toggle.

### Proposed verdict: spec correct

Every property the check names is exposed as the spec says in both Windows engines, identically in three runs: button role and name, heading level, expanded and collapsed with state-change events on toggle, the locked and disabled titles as unavailable yet focusable, the open panel as a region named by its title that focus enters inside, collapsed panels absent, and no landmark with `[region]="false"`. The locked title's unavailable state is what the APG asks for, and every screen reader with published data announces `aria-disabled="true"` (unavailable, dimmed, or disabled). The glyph is the cost the spec already weighed in D18: it is in the title's and the heading's name in every engine, NVDA speaks "plus" for the collapsed glyph and nothing for the en dash, and Firefox re-announces the focused title's name after each toggle. The spec's own ways out stay as written (`$accordion-plusminus: false` now, CSS alternative text when the Browser target moves); no spec change.

Testing Decisions line (release test, manual): "Before each release, with NVDA on Firefox and on Chrome and VoiceOver on Safari (macOS), Tab to the open title of `accordion--default` and confirm 'expanded' and 'unavailable' (VoiceOver: 'dimmed') are spoken, press H to confirm each title is reached as a heading, Tab into the open panel and confirm the region's name is spoken, and record how the glyph is read (NVDA default: 'plus' for a collapsed title, nothing for the en dash); a change from this baseline reopens decision D18."

## 2. Tabs

Check: `a[role="tab"]` without `href`, the tab list name, and panel names. [Spec: Tabs](../issues/16-spec-tabs.md), [specs/tabs.md](../specs/tabs.md).

### What the spec produces

ARIA and keyboard table (quoted):

> | `ul.tabs` | `role="tablist"`, `aria-orientation`, `tabindex="-1"` (roving mode), `aria-disabled="false"`; name from the consumer's `aria-label` or `aria-labelledby` (dev warning when absent) | Aria `TabList`; consumer |
> | `li.tabs-title` | `role="presentation"` | `NfsTabsTitle` (APG hiding-semantics practice, Foundation's own markup) |
> | `a` | `role="tab"`, `id`, `tabindex` `0`/`-1`, `aria-selected`, `aria-controls` (panel id), `aria-disabled="false"`, `data-active` | Aria `Tab`; `tabindex` from `NfsTab` |
> | `.tabs-panel` | `role="tabpanel"`, `id`, `aria-labelledby` (tab id), `tabindex="0"` when shown and `-1` when hidden, `inert` when hidden | Aria `TabPanel` |

Rendered HTML (quoted, abbreviated to the first tab and panel):

```html
<ul class="tabs" aria-label="Product details" role="tablist" tabindex="-1"
    aria-disabled="false" aria-orientation="horizontal" jsaction="keydown:;click:;focusin:;">
  <li class="tabs-title is-active" role="presentation">
    <a role="tab" data-active="false" id="ng-tab-x1-0" tabindex="0" aria-selected="true"
       aria-disabled="false" aria-controls="description">Description</a>
  </li>
...
<div class="tabs-panel is-active" role="tabpanel" id="description" tabindex="0"
     aria-labelledby="ng-tab-x1-0"><p>...</p></div>
```

The page (`pages/tabs.html`) has three tabs (Description, Reviews, Shipping) in `follow` mode with the hydrated markup; ArrowRight selects and focuses, panels move `tabindex`, `inert`, and `.is-active`.

### Measured exposure

| Step | Chromium 153 | Firefox 155 | WebKit 26.6 |
| --- | --- | --- | --- |
| Initial | CDP: `tablist "Product details" [orientation=horizontal]` > `tab "Description" [selected]`, `tab "Reviews" [selected=false]`, ...; `tabpanel "Description"`; hidden panels IGNORED (`notRendered`) | UIA: `Tab "Product details"` (control type Tab), `TabItem` children | ARIA snapshot: `tablist "Product details"`, `tab "Description" [selected]`, `tabpanel "Description"` |
| Tab into the strip | `OBJECT_FOCUS PAGETAB "Description" {selected, focused, focusable, selectable}`, ancestor PAGETABLIST "Product details"; 3/3 | same; 3/3 | |
| ArrowRight | `OBJECT_SELECTIONWITHIN PAGETABLIST "Product details"`, `OBJECT_FOCUS PAGETAB "Reviews" {selected, focused}`, `OBJECT_STATECHANGE PAGETAB "Description" {focusable, selectable}`, `OBJECT_SELECTION PAGETAB "Reviews"`; 3/3. UIA: `TabItem "Reviews"` selected=True, position 2 of 3; `Pane "Reviews"` (localized "tab panel") | `OBJECT_FOCUS PAGETAB "Reviews" {selected, focused}`, state changes on both tabs, `OBJECT_SELECTION`; 3/3. UIA: `TabItem "Reviews"` selected=True, pos 2/3; `Pane "Reviews"` | |
| Tab to the shown panel | `OBJECT_FOCUS PROPERTYPAGE "Reviews" {focused, focusable}`; 3/3 | same; 3/3 | |
| Tab into the panel content | `OBJECT_FOCUS LINK "All reviews"`, ancestor PROPERTYPAGE "Reviews"; 3/3 | same; 3/3 | |

The `a` elements carry no `href` and are exposed as tabs, never as links, in both trees; `role="presentation"` on the `li` removes it from both trees (the tabs are direct children of the tab list). The tab list itself is focusable (MSAA state focusable, from Aria's `tabindex="-1"`), which only matters if a pointer lands between tabs.

### Mappings

`tab`, `tablist`, `tabpanel`, `aria-selected`, `aria-orientation`, `aria-labelledby` as in Shared mappings; both engines match Core-AAM (page tab / TabItem, page tab list / Tab with selection, property page / Pane). HTML-AAM maps `a` without `href` to `generic`, so the explicit `role="tab"` is not overriding a link role. WAI-ARIA 1.2 `tab`: "Authors MUST ensure elements with role tab are contained in, or owned by, an element with the role tablist." APG Tabs pattern: "If the tab list has a visible label, the element with role tablist has aria-labelledby ... Otherwise, the tablist element has a label provided by aria-label" and "Each element with role tabpanel has the property aria-labelledby referring to its associated tab element."

### Published support data

- `role="tab"` on an `a` without `href`: no published data (both APG examples use `button`; a11ysupport.io `tab_role.json` has no assertions; no PowerMapper page).
- ARIA-AT "Tabs with Manual Activation" (report 163664, test plan V25.10.20, candidate; button tabs): JAWS 2025.2508.120/Chrome 140 of 140 must-have (2025-10-30), NVDA 2025.2/Chrome 120 of 126 (2025-10-22), VoiceOver macOS 15/Safari 71 of 106 (2025-11-03). Per test: "Navigate forwards into a tab list to a tab that is selected" 16/16, 16/16, 8/12; "Navigate forwards to a tab panel" 9/9, 7/9, 3/6.
- "Tabs with Automatic Activation": no ARIA-AT report ("There is no data for this pattern", embed fetched 2026-09-26).
- Position in set for tabs: no published test; both engines expose it (UIA `PositionInSet`/`SizeOfSet` 2 of 3).

### Proposed verdict: spec correct

A tab written as `a` without `href` is exposed exactly like a button tab: page tab / `TabItem` with a name, selected state, selection events, and position in set, in both engines and three runs; the tab list carries its `aria-label` name as the ancestor of every tab focus event, and each shown panel is named by its tab. Hidden panels are absent (`display: none`, and `inert` besides). Nothing in the markup differs from what the ARIA-AT tests exercise except the host element of the tab, and the platform trees show that difference does not reach assistive technology.

Testing Decisions line (release test, manual): "Before each release, with NVDA on Firefox and VoiceOver on Safari, Tab into `tabs--default` and confirm the tab list's name and the selected tab with its position are spoken, press Right Arrow and confirm the newly selected tab is announced as selected, then Tab and confirm the panel is announced with the tab's name."

## 3. Responsive Accordion Tabs

Check: whether the focus move of a Mode swap (title to tab, tab to title) is announced as a usable change. [Spec: Responsive Accordion Tabs](../issues/19-spec-responsive-accordion-tabs.md), [Prototype: ResponsiveAccordionTabs as one component](../issues/51-prototype-responsive-accordion-tabs.md), [specs/responsive-accordion-tabs.md](../specs/responsive-accordion-tabs.md).

### What the spec produces

Focus rules (quoted): "A Mode swap moves focus only when focus was inside the widget, to the equivalent control of the new mode: title to tab and tab to title for the same `value`; focus anywhere inside a section's content or on a tab panel goes to that section's control." "Swaps are not announced through a live region (Breakpoint service consumer rule 4: layout changes, not content)." The swap is one `afterRenderEffect`: `earlyRead` records the focused section's `value` and sets `mode`; the new branch replaces the old one in the same tick; `write` calls `focus()` on the control with that value.

Rendered HTML (quoted): accordion mode renders `<ul class="accordion" aria-label="Product details">` with `<h3><button class="accordion-title" role="button" ... aria-expanded aria-controls aria-disabled tabindex="0">` and `role="region"` contents; tabs mode renders `<ul class="tabs" aria-label="Product details" role="tablist" tabindex="-1" aria-disabled="false" aria-orientation="horizontal">` with `a[role="tab"]` and `role="tabpanel"` panels. The page (`pages/rat.html`) renders both branches as the spec's Rendered HTML shows, with `rules="accordion medium-tabs"` (swap at 40em, 640 px), and performs the swap as one task after `matchMedia` changes.

### Measured exposure

Key events per swap, three runs per engine (`out/summary-rat.txt`):

| Swap (focus before) | Chromium 153 | Firefox 155 |
| --- | --- | --- |
| 500 to 1300 px, focus on the open, locked title "Specs" | `OBJECT_FOCUS PAGETAB "Specs" {selected, focused, focusable, selectable}`, ancestors PAGETABLIST "Product details" < grouping < document; then state change and selection on the same tab; 3/3 | old subtree `OBJECT_HIDE`, `OBJECT_SHOW PAGETABLIST "Product details"`, `OBJECT_SHOW PROPERTYPAGE "Specs"`, `OBJECT_REORDER`, then `OBJECT_FOCUS PAGETAB "Specs" {selected, focused}`, ancestor PAGETABLIST "Product details"; 3/3 |
| 1300 to 500 px, focus on the tab "Specs" | `OBJECT_SHOW LIST "Product details"`, `OBJECT_FOCUS PUSHBUTTON "<en dash> Specs" {unavailable, focused, expanded}`, ancestors heading "<en dash> Specs" < listitem < LIST "Product details"; 3/3 | `OBJECT_SHOW LIST "Product details"`, `OBJECT_FOCUS PUSHBUTTON "<en dash>Specs" {unavailable, focused, expanded}`, same ancestors; 3/3 |
| 500 to 1300 px, focus on the collapsed title "Reviews" (Specs selected) | `OBJECT_FOCUS PAGETAB "Reviews" {focused, focusable, selectable}` (not selected), then state change and selection on "Specs" (selected); 3/3 | `OBJECT_FOCUS PAGETAB "Reviews" {focused, focusable, selectable}`; 3/3 |
| 1300 to 500 px, focus on the shown tab panel "Reviews" | `OBJECT_FOCUS PUSHBUTTON "<en dash> Reviews" {unavailable, focused, expanded}`, ancestor LIST "Product details"; 3/3 | same; 3/3 |

In no run and no engine did a focus event go to the document, the host element, or `body` between the old control and the new one; the removed control fires no event of its own. `document.activeElement` after each swap is the equivalent control. Chromium also fires an empty `OBJECT_STATECHANGE` on the component's host `div` in some runs, which carries no state.

### Mappings

The focused objects map as in checks 1 and 2 (push button in a heading in a list; page tab in a page tab list). Focus events are `EVENT_OBJECT_FOCUS` (MSAA/IA2) and `UIA_AutomationFocusChangedEventId`; NVDA turns the first into `gainFocus`.

### Published support data

- What NVDA does with such a focus event (primary source, nvaccess/nvda `f56b2e0`): `eventHandler.doPreGainFocus` computes where the new focus's ancestor chain diverges from the old one and runs `focusEntered` for "all new ancestors of the focus" (`source/eventHandler.py`, lines 402-419); `NVDAObject.event_focusEntered` speaks each such ancestor through `speech.speakObject(..., reason=FOCUSENTERED)` when `isPresentableFocusAncestor`, which excludes only layout or unavailable presentation types and the roles tree view item, list item, progress bar, and editable text (`source/NVDAObjects/__init__.py`, lines 1164-1178 and 1358-1363). A tab list, a list, and a heading are all presentable, so NVDA speaks "Product details tab list" before the tab, or the list and heading before the title.
- No published test covers a script-moved focus into a newly inserted container, and the APG has no guidance for focus when content is replaced (the helper searched `content/practices/` of the APG clone).
- The announcements of the target controls themselves are covered by checks 1 and 2's data (tab selected and position; button expanded and unavailable).

### Proposed verdict: spec correct

The swap is exposed to assistive technology as one ordinary focus change onto the equivalent control, in both engines and every run, and the new control arrives with the new container in its ancestor chain, which NVDA's source speaks as a newly entered ancestor. That is a usable change: the user hears where they are (the tab list or the section heading), what they are on, and its state, and nothing is announced for focus leaving the removed control. The one mismatch the spec already decided, focus on an unselected tab after a swap from a collapsed title, is exposed truthfully (focused, selectable, not selected) and is fixed by the user's next Enter, Space, or arrow key. A live-region message is not needed: the focus event already carries the change, and a live region would announce twice.

Testing Decisions line (release test, manual): "Before each release, with NVDA on Firefox and VoiceOver on iOS, put focus on the open title of `responsive-accordion-tabs--default`, cross the medium breakpoint (resize, or rotate the phone), and confirm the tab list's name and the equivalent selected tab are announced, then cross back and confirm the section's heading and title are announced with 'expanded'."

## 4. Reveal

Check: a modal Reveal, an alert dialog, and a non-modal Reveal (role, name, containment, focus return). [Spec: Reveal](../issues/18-spec-reveal.md), [Prototype: Reveal on native `<dialog>` under Foundation Sass](../issues/42-prototype-reveal-dialog.md), [specs/reveal.md](../specs/reveal.md).

### What the spec produces

ARIA table (quoted):

> | `<dialog>` | role | Implicit `dialog`; `role="alertdialog"` from the `role` input |
> | `<dialog>` | modal state | From `showModal()` (the top layer and the inert page); `aria-modal` is never set |
> | `<dialog>` | accessible name | The consumer's `aria-labelledby` pointing at the visible title, else `aria-label` (required; dev check 1) |
> | `<dialog>` | description | The consumer's `aria-describedby`; required for `alertdialog` (dev check 2), omitted when the content is structured (APG) |
> | Trigger | `aria-haspopup="dialog"`, `aria-controls`, `aria-expanded` | Triggers spec, `dialog` Trigger role |

Rendered HTML (quoted):

```html
<button class="button" type="button" aria-haspopup="dialog" aria-controls="signup" aria-expanded="false" jsaction="click:;">Click me for a modal</button>
<dialog id="signup" aria-labelledby="signup-title" class="reveal" jsaction="pointerdown:;pointerup:;keydown:;">
  <h1 id="signup-title">Awesome. I Have It.</h1>
  <p class="lead">Your couch. It is mine.</p>
  <button class="close-button" type="button" aria-label="Close modal" jsaction="click:;"><span aria-hidden="true">&times;</span></button>
</dialog>
```

and the alert and non-modal forms: `<dialog ... class="tiny reveal" role="alertdialog" aria-labelledby="confirm-title" aria-describedby="confirm-text" autofocus="#confirm-cancel">` (the directive removes `autofocus` before `showModal()`), and `<dialog ... class="reveal" aria-label="Note" [overlay]="false">` opened with `show()`. The page (`pages/reveal.html`) opens each from its Trigger with `showModal()`/`show()` in a later task, focuses the first tabbable (the alert dialog: Cancel), intercepts Escape on `window`, and returns focus to the Trigger.

### Measured exposure

| Step | Chromium 153 | Firefox 155 | WebKit 26.6 |
| --- | --- | --- | --- |
| Closed | dialogs IGNORED (`notRendered`); Trigger `button [hasPopup=dialog, expanded=false]` | dialogs absent | ARIA snapshot: dialogs absent |
| Open the modal Reveal | `OBJECT_SHOW DIALOG "Awesome. I Have It."`, `OBJECT_FOCUS PUSHBUTTON "Close modal"`, ancestor DIALOG "Awesome. I Have It."; 3/3. CDP `dialog "Awesome. I Have It." [modal]`; page link, Triggers, and other dialogs IGNORED (`activeModalDialog`). UIA: document holds only `Window "Awesome. I Have It."` (localized "dialog", `IsDialog`) and its content | same events; 3/3. UIA: document holds only `Pane "Awesome. I Have It."` (localized "dialog"; Gecko sets no `IsDialog`) and its content | |
| Escape | `OBJECT_FOCUS PUSHBUTTON "Click me for a modal" {focused, collapsed, focusable, haspopup}`; 3/3; the page is exposed again | same; 3/3 | |
| Open the alert dialog | `SYSTEM_ALERT DIALOG "Delete this couch?" desc="The couch and its reviews are removed for good."`, `OBJECT_SHOW DIALOG`, `OBJECT_FOCUS PUSHBUTTON "Cancel"`, ancestor DIALOG "Delete this couch?"; 3/3. CDP `alertdialog "Delete this couch?" [modal]` with the description; the rest IGNORED (`activeModalDialog`) | `OBJECT_SHOW DIALOG "Delete this couch?" desc="..."`, `OBJECT_FOCUS PUSHBUTTON "Cancel"`, ancestor DIALOG; no `SYSTEM_ALERT`; 3/3. UIA: only `Pane "Delete this couch?"` (AriaRole alertdialog, FullDescription set) and its content | |
| Escape in the alert dialog (`closeOnEsc` false) | no event, stays open; 3/3 | same | |
| Cancel | focus returns to "Delete couch" {collapsed, haspopup}; 3/3 | same; 3/3 | |
| Open the non-modal Reveal | `OBJECT_SHOW DIALOG "Note"`, `OBJECT_FOCUS PUSHBUTTON "Got it"`, ancestors DIALOG "Note" < main; Trigger state change to expanded; 3/3. CDP `dialog "Note" [modal=false]`; the page stays exposed | same; the page stays exposed in UIA; 3/3 | |
| Escape | focus returns to "Show note" {collapsed, haspopup}; 3/3 | same; 3/3 | |

WebKit source for VoiceOver: `AXObjectCache::isModalElement` returns true for `dialog`/`alertdialog` roles with `aria-modal="true"` and for an `HTMLDialogElement` whose `isModal()` is true, so a `showModal()` dialog, with or without `role="alertdialog"`, is WebKit's modal node (`Source/WebCore/accessibility/AXObjectCache.cpp`, lines 558-565); `AccessibilityObject::ignoredFromModalPresence` then ignores every object outside the modal node in the same frame, except objects that control or are the active descendant of something inside it and objects with a higher `z-index` (`AccessibilityObject.cpp`, lines 2921-2963).

### Mappings

`dialog`, `alertdialog`, `aria-modal` as in Shared mappings. HTML-AAM `open` on `dialog`: "If the open attribute is set via the showModal() method then aria-modal="true" and aria-hidden="false". Otherwise, if the open attribute is set via the show() method ... then aria-modal="false"." Chromium follows it (`modal` true for `showModal()`, false for `show()`), for `role="alertdialog"` too. Core-AAM asks for a system alert event for `alertdialog`: Chromium fires it, Firefox does not (a browser gap; the dialog is still announced through focus, below).

### Published support data

- Native `<dialog>` with `showModal()`: no per-AT test was found (a11ysupport.io `dialog_element.json` has no assertions, no PowerMapper page, and the only ARIA-AT dialog plan, "Modal Dialog Example", tests `<div role="dialog" aria-modal="true">`).
- That div-based APG modal dialog (a11ysupport.io, updated 2025-08-15): browse-mode containment passes in NVDA 2024.3/Chrome 129 (lists too) and JAWS 2023/Chrome 108 (items; its element lists show outside content), partial in VoiceOver macOS 13.1 and iOS 16.2, and fails in Narrator/Edge 108, TalkBack 13.5, and Orca 42. ARIA-AT report 147736: JAWS 2025.2508.120/Chrome 111 of 111 must-have (2026-05-06), NVDA/Chrome 105 of 111 (2024-06-24), VoiceOver macOS 15/Safari 70 of 86 (2026-05-06).
- `inert` (a11ysupport.io, 2023-07-08): inert content skipped by JAWS 2023 and NVDA 2023.1 with Chrome, Edge, and Firefox, Narrator/Edge 114, TalkBack 13.5, VoiceOver iOS 16.5.1 and macOS 13.4.1, Orca 42; all pass. Shipping versions (MDN browser-compat-data): Chrome 102, Firefox 112, Safari 15.5, all inside the Browser target.
- Document mode for `dialog` and `alertdialog` (a11ysupport.io, 2019-01-18 to 2024-12-08): neither role switches screen readers to application mode, all tested pass.
- Focus return: APG Dialog (Modal) pattern: "When a dialog closes, focus returns to the element that invoked the dialog unless ..." (design guidance; no per-AT test).
- NVDA reads a dialog's text when focus enters it through the "Report Object descriptions" behaviour its user guide describes ("reporting of whole dialog window right after the dialog opens", `userGuide.md` lines 3380-3382, commit `e88f01b`), which covers Firefox's missing system alert.

### Proposed verdict: spec correct

Containment here does not depend on screen-reader support for `aria-modal`: `showModal()` makes the rest of the page inert, and both Windows engines remove it from their trees (Chromium's reason `activeModalDialog`), while WebKit's source prunes to the modal dialog for VoiceOver. Role, name, description (alert dialog), modal state, focus inside with the dialog as ancestor, and focus return to the Trigger with its collapsed state are exposed as the spec says in three runs per engine. `role="alertdialog"` on a `showModal()` dialog stays modal without `aria-modal` in all three engines (the open question of the ticket). The non-modal Reveal is a non-modal dialog, with the page reachable, as specified. The only engine difference, Firefox's missing `EVENT_SYSTEM_ALERT`, is a browser gap that the focus move into the dialog covers.

Testing Decisions line (release test, manual): "Before each release, with NVDA on Firefox and on Chrome and VoiceOver on Safari (macOS and iOS), open `reveal--basic` and `reveal--alert-dialog` from their Triggers and confirm the dialog's role and name (and for the alert dialog its description) are spoken with focus on the first control, that browse or virtual cursor navigation stays inside the dialog, and that closing returns to the Trigger announced as collapsed; open `reveal--no-overlay` and confirm it is not announced as modal and the page stays reachable."

Correction (2026-09-27, from [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)): the NVDA mechanism that speaks the alert dialog's role, name, and description in Firefox is `event_focusEntered` for the newly entered dialog ancestor, with `FOCUSENTERED` speech keeping the description, not the user guide's dialog reporting cited under Published support data: no `EVENT_SYSTEM_DIALOGSTART` fired in any run. The Triggers measured here carried `aria-expanded`, the markup before [ADR 0036](../adr/0036-modal-dialog-trigger-role.md) removed it from the modal Reveal's Trigger. The exposure of the `modal-dialog` shape (`aria-haspopup="dialog"` and `aria-controls`, no `aria-expanded`) is case B of the panel in [Decide: `aria-expanded` on a modal dialog's opener](../issues/72-decide-aria-expanded-on-modal-opener.md): on focus and on focus return the MSAA and IA2 states are `focused|focusable|haspopup` with `haspopup:dialog` and no expanded or collapsed state in either engine; only Firefox's UI Automation provider reports `Collapsed`, inferred from `aria-haspopup`. Erratum (audit 0006 L15): the release test's `reveal--no-overlay` should read `reveal--without-overlay`, the story's actual id.

## 5. Off-canvas

Check: the modal panel (role, name, containment, the role switch at open), the disclosure Trigger, and the revealed sidebar. [Spec: Off-canvas](../issues/25-spec-off-canvas.md), [specs/off-canvas.md](../specs/off-canvas.md).

### What the spec produces

Modal mode (quoted): "Modal mode is `trapFocus() && hasOverlay()`, the APG's condition (both blocking and obscuring): the panel binds `role="dialog"` and `aria-modal="true"` while it is open and not revealed or in-canvas, the linked content gets `inert` once focus is inside the panel, a CDK `FocusTrap` wraps Tab, and the Trigger role is `dialog`."

ARIA table (quoted):

> | Trigger (`nfsOpen`, `nfsToggle`) | native `button` | `aria-expanded`, `aria-controls` = panel id; plus `aria-haspopup="dialog"` in modal mode | Triggers utility from `triggerRole` |
> | Panel, non-modal | the consumer's element (`nav`, `aside`, or `div` wrapping a named `nav`) | none from the library | Consumer |
> | Panel, modal and open | `dialog` | `role="dialog"`, `aria-modal="true"`; name from the consumer's `aria-labelledby` or `aria-label` | `nfsOffCanvas` (role), consumer (name) |
> | Panel, revealed or in-canvas | the consumer's element | none; no dialog role, no `aria-modal` | nothing |
> | Content | none | `inert` while a modal panel is open, after focus is inside | `nfsOffCanvasContent` |

and: "Modal mode inerts only `.off-canvas-content`; the page's content belongs inside it (Foundation's documented markup), and the `FocusTrap` covers anything left outside for keyboard users."

Rendered HTML (quoted, closed server HTML):

```html
<div class="off-canvas-wrapper">
  <div class="off-canvas position-left is-transition-push is-closed" id="site-nav">
    <button class="close-button" type="button" aria-label="Close menu" jsaction="click:;">...</button>
    <nav aria-label="Main">...</nav>
  </div>
  <div class="js-off-canvas-overlay is-overlay-fixed" jsaction="click:;"></div>
  <div class="off-canvas-content">
    <button class="button" type="button" aria-expanded="false" aria-controls="site-nav" jsaction="click:;">Menu</button>
  </div>
</div>
```

"Modal mode ..., open: the panel adds `role="dialog" aria-modal="true"`, the content adds `inert` after focus has moved into the panel, the Trigger reads `aria-haspopup="dialog" aria-controls="site-nav" aria-expanded="true"`, and CDK focus-trap anchors (`div.cdk-visually-hidden.cdk-focus-trap-anchor[aria-hidden="true"]`) sit before and after the panel." The revealed sidebar: `class="off-canvas position-left is-transition-push is-closed reveal-for-large"`. The spec also supports "a panel nested inside `.off-canvas-content`" that "finds the content by itself" (user story 6; the content link through DI).

Pages: `offcanvas.html` (a non-modal push panel `#site-nav` and a modal overlap panel `#filters` with `aria-labelledby`, sibling panels as in Foundation's docs), `offcanvas-revealed.html` (1280 px, `reveal-for-large`, Trigger hidden with `.hide-for-large`), `offcanvas-nested.html` (the modal panel nested inside `.off-canvas-content`), `offcanvas-outside.html` (a `header` with a link outside `.off-canvas-wrapper`). `?walk` switches a page to the proposed fix below.

### Measured exposure

| Step | Chromium 153 | Firefox 155 | WebKit 26.6 |
| --- | --- | --- | --- |
| Closed | panels IGNORED (`notVisible`: `visibility: hidden` from `is-closed`); Trigger `button "Menu" [expanded=false]`, `button "Filters" [hasPopup=dialog, expanded=false]` | panels absent | |
| Open the non-modal panel | `OBJECT_STATECHANGE PUSHBUTTON "Menu" {expanded}`, `OBJECT_FOCUS PUSHBUTTON "Close menu"` (with `offscreen` while the panel slides in); 3/3. The panel is a plain grouping holding `navigation "Main"` | same (state change after the focus); 3/3 | |
| Tab to Home | `OBJECT_FOCUS LINK "Home"`, ancestors listitem < list < GROUPING "Main" (the named `nav`); 3/3 | same; 3/3 | |
| Escape | `OBJECT_FOCUS PUSHBUTTON "Menu" {focused, collapsed}`; 3/3 | same; 3/3 | |
| Open the modal panel | `OBJECT_SHOW DIALOG "Filters"` (a dialog appears; no role changes on an exposed node, because the closed panel was not in the tree), `OBJECT_FOCUS PUSHBUTTON "Close filters"`, ancestor DIALOG "Filters"; 3/3. CDP `dialog "Filters" [modal]`; `#content`, both Triggers IGNORED (`inertElement`); focus-trap anchors IGNORED (`ariaHiddenElement`). UIA: `Window "Filters"` (`IsDialog`) | same events; 3/3. UIA: `Pane "Filters"` (AriaRole dialog), content absent | |
| Tab through the panel and past its end | focus events on "In stock", "Apply", "Close filters" (the end anchor redirected focus), "In stock", all with ancestor DIALOG "Filters"; no event ever targets an anchor; 3/3 | same; 3/3 | |
| Escape | `OBJECT_FOCUS PUSHBUTTON "Filters" {focused, collapsed, haspopup}`; 3/3 | same; 3/3 | |
| Revealed sidebar at 1280 px | `navigation "Main"` with its list and links, no dialog role, no expanded state; Trigger IGNORED (`notRendered`); Tab focuses "Home" with ancestor GROUPING "Main" | same in UIA (`Group "Main"`, landmark navigation) | Tab does not focus links (Safari's default keyboard setting); ARIA snapshot `navigation "Main"` |
| Modal panel nested inside `.off-canvas-content` (spec as written) | after the open, `document.activeElement` is `body`; `#filters`, `#in-stock`, and the content all IGNORED (`inertElement`); UIA focus on the document; the next Tab stays on `body` | same: focus on `body`, the dialog absent from UIA | `document.activeElement` is `body` after the open and after the next Tab |
| Content outside `.off-canvas-wrapper` (spec as written) | the modal dialog is open, and the outside `header` link is still exposed (`link "Header link outside the wrapper"`, in UIA under the banner landmark) | same: the banner and its link stay in UIA | |
| Proposed fix, nested page | focus on "Close filters" inside `dialog "Filters" [modal]`; the content itself exposed, its other children and the Triggers IGNORED (`inertElement`); Tab moves within the dialog | focus inside the dialog; Tab moves within | focus on the close button, Tab to "In stock" |
| Proposed fix, outside page | the header link IGNORED (`inertElement`); UIA shows only the dialog | the banner absent from UIA | |

### Mappings

`dialog` with `aria-modal="true"`, `aria-expanded`, `aria-haspopup`, `nav`, and `inert` as in Shared mappings. Core-AAM maps `aria-modal="true"` to `IA2_STATE_MODAL` and `Window.IsModal`, and only AX API prunes the background ("Prune the accessibility tree such that the background content is no longer exposed"): Chromium and Firefox keep content outside the dialog in their trees unless it is inert, as measured. WebKit prunes (`AXObjectCache::isModalElement` includes "`dialog`/`alertdialog` with `aria-modal="true"`"; `ignoredFromModalPresence`), and ignores inert objects (`AccessibilityObject::defaultObjectInclusion`: `if (style->effectiveInert()) return AccessibilityObjectInclusion::IgnoreObject;`, `AccessibilityObject.cpp` lines 4404-4409). HTML-AAM `inert`: "an inert node can have descendants that are not inert. For example, a modal dialog can escape an inert subtree"; only a modal `<dialog>` in the top layer escapes, and the off-canvas panel is not a `<dialog>` (ADR 0030), so an inert ancestor makes it inert. APG Dialog (Modal) pattern: "Windows under a modal dialog are inert", and "users of those technologies will experience severe negative ramifications if a dialog is marked modal but does not behave as a modal for other users."

### Published support data

- `aria-modal` on a `div` (the APG modal dialog, a11ysupport.io, updated 2025-08-15): browse-mode containment passes in NVDA 2024.3/Chrome, passes for items but shows outside content in element lists in JAWS/Chrome and fails in JAWS/Firefox lists, is partial in VoiceOver macOS and iOS, and fails in Narrator/Edge ("elements outside the modal were found"), TalkBack 13.5 ("content outside of the modal was announced"), and Orca 42.
- `inert` removes content for every tested screen reader (a11ysupport.io, 2023-07-08), and is supported from Chrome 102, Firefox 112, Safari 15.5.
- Disclosure button (`aria-expanded`) and a named `nav` landmark (a11ysupport.io "named navigation role", 2021-12-11): the landmark and its name are announced by JAWS, NVDA, VoiceOver macOS and iOS on entry; Narrator and TalkBack announce it only with their landmark commands.
- `dialog` role does not start application mode (check 4).

### Proposed verdict: spec defect

For the markup Foundation documents (the panel a sibling of `.off-canvas-content`, all page content inside the content), the spec is exposed as written: the modal panel appears as a named modal dialog with focus inside it and the content inert; the "role switch at open" reaches assistive technology as a dialog appearing, since the closed panel was not in the tree; the focus-trap anchors never receive an accessibility focus event; focus returns to the Trigger with its collapsed state; the disclosure Trigger reports expanded and collapsed; and the revealed sidebar is plain page content under its `nav` landmark with the Trigger gone. Two cases break the modal promise:

1. A modal panel nested inside `.off-canvas-content`, a form the spec supports, is made inert with its enclosing content, because the spec inerts "the linked content", which is then the panel's ancestor. Measured in all three engines: focus falls to `body` and the dialog disappears from the trees. This fails 2.1.1, 2.4.3, and 4.1.2.
2. Content outside `.off-canvas-content` (a header or footer written outside the wrapper) stays exposed in Chromium's and Firefox's trees while the panel claims `aria-modal="true"`. Only NVDA with Chrome, JAWS for item navigation, and VoiceOver hold browse mode inside such a dialog; Narrator, TalkBack, and Orca reach the outside content. That is the mismatch the APG warns about.

Exact fix: make modal mode inert everything outside the panel's ancestor chain instead of the linked content. Measured with the fix (`?walk`): the nested panel works in all three engines (focus inside, dialog exposed, the enclosing content exposed, its other children and the Triggers inert), and the outside header is inert in Chromium and Firefox. Spec edits, in `specs/off-canvas.md`:

- Solution, second bullet: "... and `inert` while a modal panel is open." becomes "...", dropping "and `inert` while a modal panel is open" (the content directive no longer binds `inert`).
- Solution, the modal-mode sentence: "adds `role="dialog"`, `aria-modal="true"`, `inert` on the content, and a CDK `FocusTrap`" becomes "adds `role="dialog"`, `aria-modal="true"`, `inert` on every element outside the panel's ancestor chain (the Modal inert set), and a CDK `FocusTrap`".
- API, the modal-mode paragraph: "the linked content gets `inert` once focus is inside the panel" becomes "once focus is inside the panel, the panel sets `inert` on every element sibling of the panel and of each of its ancestors up to `body` that is not already inert, except `.js-off-canvas-overlay` elements and the CDK focus-trap anchors (the Modal inert set), records the elements it changed, and removes `inert` from exactly those at the close request, before focus returns; a sibling content is in the set, and the enclosing content of a nested panel is an ancestor, so it is never made inert while its other children are".
- State table, Entering and Open rows: move "`inert` once focus is inside (modal)" from the Content classes column to the Panel attributes column as "(modal) the Modal inert set, once focus is inside".
- ARIA table, the Content row becomes: "Everything outside the panel's ancestor chain (a sibling content included) | none | `inert` while a modal panel is open, after focus is inside; overlays and focus-trap anchors excepted | `nfsOffCanvas`".
- The bullet "Modal mode inerts only `.off-canvas-content`; the page's content belongs inside it (Foundation's documented markup), and the `FocusTrap` covers anything left outside for keyboard users." becomes "Modal mode inerts every element outside the panel's ancestor chain, so content outside `.off-canvas-content` and the other children of a nested panel's content are unreachable, as behind a native modal dialog; the `FocusTrap` still wraps Tab through its `aria-hidden` anchors."
- Rendered HTML, the modal paragraph: "the content adds `inert` after focus has moved into the panel" becomes "the content, and every other element outside the panel's ancestor chain except the overlay and the focus-trap anchors, adds `inert` after focus has moved into the panel".
- Testing Decisions: add the story `off-canvas--modal-nested` (a modal panel nested in the content: the play function asserts focus inside the dialog, the content without `inert`, its other children with `inert`) and browser-level cases: an element outside the wrapper is inert while a modal panel is open and not after it closes; an element that was inert before the open is still inert after the close; the overlay stays clickable.

Testing Decisions line (release test, manual): "Before each release, with NVDA on Firefox, Narrator on Edge, and VoiceOver on Safari (macOS and iOS), open `off-canvas--modal` and `off-canvas--modal-nested` from their Triggers and confirm the dialog's name is spoken with focus on its first control and that browse or swipe navigation cannot leave the panel; open `off-canvas--default` and confirm the Trigger is announced as expanded and collapsed; at the large breakpoint confirm `off-canvas--revealed` is read as the 'Main' navigation with no dialog."

Correction (2026-09-27, from [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)): the revealed-sidebar story is `off-canvas--reveal-for-large`, not `off-canvas--revealed`. The exception list of the fix as decided and its Trigger role are that ticket's, not this section's: besides the overlay and the CDK focus-trap anchors, the Modal inert set skips elements carrying `aria-live` or `popover` and CDK's `body` containers `.cdk-overlay-container` and `.cdk-describedby-message-container`, and Off-canvas Modal mode's Triggers take the `modal-dialog` shape (`aria-haspopup="dialog"` and `aria-controls`, no `aria-expanded`), because every Trigger outside the panel is inert while it is open.

## 6. Tooltip

Check: the description on first keyboard focus across the `title` to `aria-describedby` switch, and from the kept hidden tip. [Spec: Tooltip](../issues/27-spec-tooltip.md), [specs/tooltip.md](../specs/tooltip.md).

### What the spec produces

Behaviour rule (quoted): "until the tip exists, the host binds `title` to the text and binds no reference, so the accessible description comes from `title` (accname: `title` is the description when there is no `aria-describedby` and it is not the name), in the server HTML and on the client. When the tip is created, the same render pass removes `title`, adds the tip id to `aria-describedby`, and inserts the tip. After that the reference stays, and the kept tip (hidden when closed) is the description ... A consumer's static `aria-describedby` (read with `HostAttributeToken`) is kept first in the list."

ARIA table (quoted):

> | Host | `title` | The text | Until the tip exists (server HTML included); removed in the pass that creates the tip |
> | Host | `aria-describedby` | The consumer's static value, then the tip id | From the pass that creates the tip; never in server HTML, never pointing at a missing element |
> | Tip | `role` | `tooltip` | Static |
> | Tip | `hidden` | Present | While closed and no leave animation runs |

Rendered HTML (quoted):

```html
<!-- server, and hydrated before the first show -->
The <button type="button" title="Fancy word for a beetle." class="has-tip" jsaction="focusin:;focusout:;">scarabaeus</button><!--container--> hung ...

<!-- hydrated, first show by hover (default top-center), while the fade-in runs -->
The <button type="button" class="has-tip" aria-describedby="nfs-tooltip-a1b2-0">scarabaeus</button>
<nfs-tooltip-tip role="tooltip" id="nfs-tooltip-a1b2-0" class="tooltip nfs-fade-in top align-center"
                 style="top: -57.19px; left: 0.75px;">Fancy word for a beetle.</nfs-tooltip-tip>
...
<nfs-tooltip-tip role="tooltip" id="nfs-tooltip-a1b2-0" class="tooltip top align-center" style="..." hidden="">...</nfs-tooltip-tip>

<!-- hydrated, after the first show -->
<button class="button has-tip disabled" type="button" aria-disabled="true" aria-describedby="plan-note nfs-tooltip-a1b2-2">Export</button>
```

The page (`pages/tooltip.html`) opens the tip on a keyboard `focusin` (`:focus-visible`) in the next task, creating the tip, removing `title`, and adding `aria-describedby` together; `focusout` and Escape fade it out (500 ms) and then set `hidden`. A second host has the spec's static consumer `aria-describedby="plan-note"`.

### Measured exposure (the spec as written)

Key events, three runs per engine (`out/summary-tooltip.txt`):

| Step | Chromium 153 | Firefox 155 |
| --- | --- | --- |
| Initial | CDP: `button "scarabaeus" description="Fancy word for a beetle."` (from `title`) | UIA `FullDescription` "Fancy word for a beetle." |
| First Tab onto the host (tip created in the next task) | `OBJECT_FOCUS PUSHBUTTON "scarabaeus" desc="Fancy word for a beetle."`, `OBJECT_SHOW TOOLTIP`; no description change; 3/3 | `OBJECT_FOCUS ... desc="Fancy word for a beetle."`, `OBJECT_SHOW TOOLTIP`, and `OBJECT_DESCRIPTIONCHANGE` on the focused host with the same text; 3/3 |
| Tab away (tip fades, then `hidden`) | focus moves; nothing on the host; 3/3 | `OBJECT_DESCRIPTIONCHANGE` on the (no longer focused) host, same text; 3/3 |
| Shift+Tab back (description from the hidden kept tip) | `OBJECT_FOCUS ... desc="Fancy word for a beetle."`, CDP description computed while the tip is IGNORED (`notRendered`); no description change; 3/3 | `OBJECT_FOCUS ... desc="Fancy word for a beetle."`, then `OBJECT_DESCRIPTIONCHANGE` on the focused host when the tip shows again; 3/3 |
| Escape (tip hides, focus stays) | no event; 3/3 | `OBJECT_DESCRIPTIONCHANGE` on the focused host, same text; 3/3 |
| First Tab onto the Export host (static `aria-describedby="plan-note"`) | `OBJECT_FOCUS PUSHBUTTON "Export" desc="Exports need the Pro plan."` (no tooltip text), then `OBJECT_DESCRIPTIONCHANGE ... desc="Exports need the Pro plan. Upgrade to export"`; 3/3 | the focus event carries only "Exports need the Pro plan." in run 1 and both texts in runs 2 and 3 (the order of the focus and the switch raced), and `OBJECT_DESCRIPTIONCHANGE` to both texts in every run |

So the kept hidden tip works as a description source in both engines, as accname's "Hidden Not Referenced" rule requires, and the description text never changes. What changes is the event stream: Firefox reports a description change on the host at every creation, show, and hide of the referenced tip, although the text is identical, and every host with a consumer `aria-describedby` starts without the tooltip text.

### Alternatives measured

Page `pages/tooltip-variants.html`, three runs per engine (`out/summary-tooltip-variants.txt`, `out/tooltip-variant-d-*-d1..d3.txt`):

- A: create a stable hidden description element and an `aria-hidden` visible tip at the first show. Firefox still fires one description change on the first focus (the switch); none on hide, re-show, or Escape; Chromium none.
- B: create the stable hidden description element, remove `title`, and set `aria-describedby` in the first client render callback, before any focus; `aria-hidden` visible tip on first show. No description change in either engine at first focus, re-show, or Escape; the Export host's first focus carries both texts.
- C: as B, with the description in CDK `AriaDescriber`'s form: one `visibility: hidden`, visually hidden `cdk-describedby-message-container` at the end of `body`. Same result as B in both engines.
- D: as C (message registered in the first client render callback), but `title` kept until the first show and removed then, as the spec has it. No description change in either engine at the first show (title removal included), re-show, or Escape, 3 of 3; the description is the message text from hydration on (`aria-describedby` wins over `title`).

### Mappings

`tooltip` and `aria-describedby` as in Shared mappings. HTML-AAM's description order makes the consumer-describedby gap normative: `aria-describedby` is "the first applicable description source", and the `title` attribute is used only "Otherwise". WAI-ARIA 1.2 `tooltip`: "Authors SHOULD ensure that elements with the role tooltip are referenced through the use of aria-describedby before or at the time the tooltip is displayed" (the fix below references the `role="tooltip"` message before any display); APG Tooltip pattern (work in progress): "The element that serves as the tooltip container has role tooltip. The element that triggers the tooltip references the tooltip element with aria-describedby." CDK `AriaDescriber.describe(element, message, role?)` sets `role` on its message element, which lives in the `visibility: hidden` container "Screen-readers will still read the description for elements with aria-describedby even when the description element is not visible" (`src/cdk/a11y/aria-describer/aria-describer.ts`, lines 144-199, local clone 22.2.x).

### Published support data

- NVDA speaks a description change on the focused object: `event_descriptionChange` calls `speech.speakObjectProperties(self, description=True, reason=controlTypes.OutputReason.CHANGE)` when `self is api.getFocusObject()` (`source/NVDAObjects/__init__.py`, lines 1415-1419), gated only by "Report Object descriptions" (`speech.py` lines 977-978), which is on by default. So with Firefox, NVDA repeats "Fancy word for a beetle." after the first focus, after each return of focus, and when the user presses Escape to dismiss the tip.
- Description changes on the focused element (a11ysupport.io `aria-describedby.json`, 2021-10-19): NVDA re-announces them; JAWS, Narrator, TalkBack, VoiceOver iOS, and Orca do not, VoiceOver macOS partly. So a host whose description gains the tooltip text only after focus never has that text announced on first focus by those screen readers.
- `aria-describedby` on focus (same test, and PowerMapper, last updated 2025-12-14): announced by all tested screen readers; PowerMapper flags a new problem in JAWS 2025.2508.120 with Firefox for a text input.
- `title` as a description on a named button (a11ysupport.io, 2024-10-05): announced by JAWS, Narrator, NVDA, TalkBack, VoiceOver iOS and macOS.
- `aria-describedby` pointing at a `hidden` element: no published test; measured above in Chromium and Firefox.

### Proposed verdict: spec defect

The spec's premise holds (the hidden kept tip describes the host, and the text is the same before and after the switch), but its mechanism fails in two ways the check exists to catch. In Firefox, the switch and every later show and hide of the referenced tip fire a description change on the focused host, which NVDA speaks by default, so the description is repeated on first focus, on every return, and on Escape (3 of 3 runs). In every engine, a host with a static consumer `aria-describedby` has no tooltip text in its description until the tip is first shown, which HTML-AAM makes normative and which JAWS, VoiceOver, TalkBack, and Narrator then never announce on that first focus. Variants C and D remove both, measured.

Exact fix (variant D, which keeps the spec's `title` behaviour for no-JavaScript users, hover before the first show, and hosts below `showOn`): register the text with CDK `AriaDescriber` in the directive's first client render callback, and make the visible tip presentational. Spec edits, in `specs/tooltip.md`:

- Solution, second paragraph: "At that moment the directive moves the text off the `title` (as Foundation does) and points the trigger's `aria-describedby` at the tip." becomes "In its first client render callback after hydration the directive registers the text with CDK `AriaDescriber` (`describe(host, text, 'tooltip')`), which puts it in CDK's hidden message container and adds the message id to the host's `aria-describedby` after any static consumer value; at the tip's first show the directive removes `title` (as Foundation does). The visible tip is `aria-hidden="true"`, so showing and hiding it never changes the host's description."
- Behaviour rule "`title` and `aria-describedby`": replace with "The host binds `title` to the text until the tip is first shown (server HTML included). In the first client render callback, while the text is non-empty, the directive calls `AriaDescriber.describe(host, text, 'tooltip')`; a text change calls `removeDescription` with the old text and `describe` with the new one, an empty text only `removeDescription`, and destroy `removeDescription`. From that callback on, the description is the message (`aria-describedby` takes precedence over `title`), in every engine and before any focus; the kept tip is `aria-hidden="true"` and is no description source. A consumer's static `aria-describedby` stays first (AriaDescriber appends). Inside a block that never hydrates, the host keeps `title` as its description."
- ARIA table: Host `title` row: "Until the tip is first shown (server HTML included); removed in the pass that creates the tip" (unchanged meaning). Host `aria-describedby` row: "The consumer's static value, then the AriaDescriber message id | From the first client render callback; never in server HTML". Tip rows: `role` becomes "none" (the tip keeps its generated `id`, the Openable contract's `id`, which nothing references any more); add "Tip | `aria-hidden` | `true` | From creation" and remove `aria-hidden` from the "Never" row. Add a row "AriaDescriber message | `role="tooltip"`, the text | In CDK's `cdk-describedby-message-container` at the end of `body`, `visibility: hidden`, from the first client render callback".
- Comparison with Angular Material: move "the hidden copy" and "`aria-hidden` on the visible tip" from Not borrowed to Borrowed ("`AriaDescriber`'s hidden message with `role="tooltip"`, `aria-hidden` on the visible tip"), and change the Description row to "`title` until the first client render callback, then `aria-describedby` to an `AriaDescriber` message (`role="tooltip"`); the visible tip is `aria-hidden`".
- Implementation level and primitives: add `AriaDescriber` from `@angular/cdk/a11y` to the CDK primitives; Render hooks: add "Description registration | `afterNextRender` | client only, before any focus; re-registered from an `afterRenderEffect` on the text".
- Rendered HTML: after hydration the host reads `title="Fancy word for a beetle." aria-describedby="cdk-describedby-message-<id>-0"` until the first show, then without `title`; the tip reads `<nfs-tooltip-tip id="nfs-tooltip-a1b2-0" aria-hidden="true" class="tooltip ...">` with no `role`; the Export example reads `aria-describedby="plan-note cdk-describedby-message-<id>-1"`.
- Development check 5 (a host inside a `label`) is no longer needed for the name, because an `aria-hidden` tip does not join the label's name; keep it only if the tip's visible text inside the label should still be flagged.
- Testing Decisions: browser-level cases: after the first render the host's `aria-describedby` names a message whose text equals the tooltip text, with any static consumer value first; showing and hiding the tip change neither `aria-describedby` nor the message; a text change replaces the message; destroy removes it. E2e (Firefox and Chromium): no description change reaches the platform on show, hide, or Escape (the probe used here, or the CDP tree's description).

Testing Decisions line (release test, manual): "Before each release, with NVDA on Firefox and on Chrome, JAWS on Chrome, and VoiceOver on Safari (macOS and iOS), Tab to the hosts of `tooltip--default` and `tooltip--disabled-interactive` and confirm the tooltip text is spoken once as the description on the first focus (after the consumer's own description), is not repeated when the tip appears or when Escape dismisses it, and is spoken again on the next focus."

Correction (2026-09-27, from [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)): the adopted fix is variant E, not variant D. The judge measured three further pages (J1 to J3 in that ticket): J1, which inert `aria-describedby` targets still describe their host (Chromium drops text referenced through an inert node only while that node is rendered; a `visibility: hidden` or `display: none` target describes its host whether inert or not; Firefox keeps every one); J2, a Tooltip-style description inside a `showModal()` dialog and inside an Off-canvas panel under its Modal inert set (every host keeps its full description in both engines, with either description form); J3, variant E, a hidden `role="tooltip"` element inserted right after the host in the first client render callback and referenced from `aria-describedby` after any static consumer value, with `title` kept until the first show and the visible tip `aria-hidden="true"` with no role (zero description-change events in every step in both engines, three runs). Variant D's `AriaDescriber` description survives only because CDK keeps its `body` container `visibility: hidden`, WebKit's handling of it across a modal boundary was not measured, and the Tooltip spec already ruled out `body`-appended structure (its D23), so the description element beside the host was adopted. Erratum (audit 0006 L15): the release test's `tooltip--default` should read `tooltip--defined-term`, the story's actual id.

## 7. Nested menu and Responsive Menu

Check: a Mode swap with a submenu open and focus inside it. [Spec: Responsive Menu](../issues/23-spec-responsive-menu.md), [Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md), [Prototype: Nested menu directive family with breakpoint mode switching](../issues/50-prototype-nested-menu.md), [specs/responsive-menu.md](../specs/responsive-menu.md), [specs/nested-menu.md](../specs/nested-menu.md).

### What the spec produces

Nested menu, constant across modes (quoted):

> | Root and submenu `ul`, every `li` | Native `list` and `listitem`; no `role`, no `aria-*` |
> | Parent button (`nfsSubmenuToggle`) | Native `button`, `type="button"`, `aria-expanded`, `aria-controls` = the submenu id; name from its text |
> | Closed submenu | `inert` (out of the tab order and the accessibility tree), hidden by Foundation's mode CSS or the accordion grid |
> | Hidden drilldown level | Foundation's `invisible` (`visibility: hidden`) |

Responsive Menu focus rules across a swap (quoted): "Focus on a control inside open submenus: those submenus stay open, focus stays on the same node." "Focus on a toggle whose submenu is open, or on the link of that Hybrid item: entering drilldown closes that submenu (its level would hide the row that holds focus), focus stays; entering dropdown or accordion keeps it open." "Focus inside a drilldown back item, leaving drilldown: focus moves to the first control of that level that is not inside the back item, in the render after the swap." "A swap is not announced through a live region (Breakpoint service consumer rule 4): it changes layout, not content."

Rendered HTML (quoted, drilldown server HTML then dropdown after the swap):

```html
<ul class="vertical medium-horizontal menu drilldown" jsaction="keydown:;click:;">
  <li class="is-drilldown-submenu-parent">
    <button type="button" aria-expanded="false" aria-controls="nfs-submenu-x1-0" jsaction="click:;">Products</button>
    <ul id="nfs-submenu-x1-0" inert=""
        class="menu vertical nested submenu is-drilldown-submenu invisible drilldown-submenu-cover-previous">
...
<ul class="vertical medium-horizontal menu dropdown">
  <li class="is-dropdown-submenu-parent is-active opens-left" data-nfs-expanded="">
    <button type="button" aria-expanded="true" aria-controls="nfs-submenu-x1-0">Products</button>
    <ul id="nfs-submenu-x1-0" data-nfs-shown="" class="menu vertical nested submenu is-dropdown-submenu js-dropdown-active first-sub">...</ul>
```

The page (`pages/menu.html`) is the spec's consumer markup (`nav aria-label="Main"`, Products with a back item, Boards, Wheels; the Services Hybrid item; About) with `drilldown medium-dropdown` rules, the per-mode class maps, `inert` on closed submenus, the back item `hidden` outside drilldown, and the ADR 0035 swap in one task (read focus under the old classes, set the mode and prune the Open path, render, and for a back item refocus after a forced style read).

### Measured exposure

Key events, three runs per engine (`out/summary-menu.txt`):

| Swap (focus before) | Chromium 153 | Firefox 155 |
| --- | --- | --- |
| Drilldown to dropdown (500 to 1024 px), focus on Boards inside the open Products level | no focus, state, or name event; only show and reorder events as the top-level items become visible; focus stays on Boards; CDP `button "Products" [expanded]`, `list` (the submenu), `link "Boards" [focused]`; 3/3 | no focus, state, or name event (hide and show of the re-laid list); focus stays; 3/3 |
| Dropdown to drilldown (1024 to 500 px), focus on Boards | no focus, state, or name event; the root's controls become hidden (`notVisible`), the open level stays exposed; 3/3 | `OBJECT_FOCUS LINK "Boards"` on the same, still focused link (Gecko rebuilt its accessible after the layout change); 3/3 |
| Back item focused, drilldown to dropdown (the back item becomes `hidden`) | `OBJECT_FOCUS LINK "Boards"`, ancestors listitem < list < listitem (Products) < list < ... < GROUPING "Main"; no intermediate focus on the document; 3/3 | same; 3/3 |
| Products toggle focused with its submenu open, dropdown to drilldown | `OBJECT_STATECHANGE PUSHBUTTON "Products" {focused, collapsed}`, focus stays on the toggle; 3/3 | same; 3/3 |

`document.activeElement` is the same element before and after each swap, except the back-item case, where it is Boards. The roles and names of the focused control never change; its ancestor lists do (in dropdown mode the Products item nests Boards' list; in drilldown the root level is `visibility: hidden` and leaves the tree while the open level stays).

### Mappings

Lists, list items, buttons with `aria-expanded`, links with `aria-current`, `inert`, and `nav` as in Shared mappings. HTML-AAM `li`: `listitem` "with aria-setsize ... and aria-posinset", so a hidden back item changes the set size of Boards' list (in drilldown the back item is one of the items). Core-AAM `aria-current`: object attribute `current:<value>` / `AriaProperties.current`.

### Published support data

- NVDA speaks only focus-tied changes and live regions: its `event_focusExited` does nothing ("In the general case, NVDA should not announce anything when focus exits an ancestor control", `source/NVDAObjects/__init__.py` lines 1378-1380, commit `2db695f`); a re-layout with no focus event and no live region has no handler that speaks (inference from the source, not a documented rule). A repeated `gainFocus` on the same object (Firefox's event above) goes through `doPreGainFocus`, which speaks the object again with any newly entered ancestors (check 3's source).
- A state change on the focused object: NVDA speaks it (the "collapsed" case); the `aria-expanded` data of check 1 covers JAWS, VoiceOver, TalkBack, and Narrator re-announcing a changed state on activation.
- `aria-current` changing on the focused link without a live region (a11ysupport.io, 2023-03-04): announced by NVDA and VoiceOver iOS, not by JAWS, Narrator, TalkBack, VoiceOver macOS, or Orca; the swap does not change `aria-current`.
- The APG Disclosure Navigation Menu (ARIA-AT report 163668, test plan V25.10.27, candidate): JAWS 2025.2508.120/Chrome 229 of 233 must-have (2025-11-03), NVDA 2023.1/Chrome 236 of 240 (2025-10-27), VoiceOver macOS 15.1/Safari 145 of 170 (2025-11-03). No published test covers a mode swap.

### Proposed verdict: spec correct

The swap behaves as the spec intends for assistive technology: focus never leaves the control the user is on or falls to the document, the role set never changes, and the only announcements are the ones that carry information. In Chromium a swap with focus inside an open submenu is silent (no focus, state, or name event in any run); in Firefox the move into drilldown re-fires focus on the same link, which NVDA re-speaks as "Boards, link" with its list, a harmless re-orientation. When the swap closes the submenu of a focused toggle, the toggle reports "collapsed"; when it hides a focused back item, focus lands on the level's first link with one focus event. A live-region message is not needed, as the Responsive Menu spec already rules.

Testing Decisions line (release test, manual): "Before each release, with NVDA on Firefox and on Chrome and VoiceOver on Safari, open Products in `responsive-menu--mode-swap` at the Zero breakpoint, move focus to Boards, cross the medium breakpoint both ways, and confirm focus stays on Boards (NVDA with Firefox may re-read 'Boards, link'), that nothing else is announced, and that with focus on the open Products toggle entering drilldown announces 'collapsed'."

Correction (2026-09-27, from [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)): WebKit was run for this check. `D:/tmp/nfs-at-evidence-1/out/menu-webkit.txt` (one run) shows `document.activeElement` on the same element through all four swaps, which corroborates the focus rows above for WebKit; WebKit exposes no accessibility tree on Windows, so no event is recorded for it.

## Observations outside checks 1 to 7

- Drilldown focus handoff (check 9's scope): in an early version of the menu page that rendered the level in the click task and focused Boards in a later task, Chromium fired an intermediate focus event on the Drilldown wrapper `div` while the focused toggle was hidden. With the render and the focus in one task, as the spec's `afterNextRender` handoff does, the intermediate event did not occur in three runs, and Boards' focus event carried `offscreen` while the level slid in (screen readers ignore that state for speech). Worth keeping in mind for the Drilldown evidence: the handoff must stay in the same tick as the render.
- Aria's `TabList` makes the tab list itself focusable (`tabindex="-1"`); a pointer press between tabs can focus the list, which both engines then report as the focused "Product details" tab list. Not a defect.

## Sources

Published data and primary sources, each fetched 2026-09-26 unless stated; full quotes, URLs, commits, and fetch routes are in `D:/tmp/nfs-at-evidence-1/support-data.md`.

- a11ysupport.io test data, GitHub `accessibilitysupported/a11ysupport.io`, `data/tests/`: `aria-expanded.json`, `html_button(type-button--aria-disabled-true).json`, `tech/aria/aria-controls.json`, `tech/css/css_generated_content_button.json`, `apg/modal-dialog-example.json`, `tech/html/inert.json`, `tech/aria/role-navigation-named.json`, `tech/aria/aria-describedby.json`, `tech/html/title-attribute.json`, `tech/aria/role-tooltip-named.json`, `tech/aria/aria-current-change.json`, `aria_dialog_document_mode.json`, `aria_alertdialog_document_mode.json`.
- ARIA-AT reports (https://aria-at.w3.org/report/163649 Accordion, 163664 Tabs with Manual Activation, 147736 Modal Dialog Example, 163668 Disclosure Navigation Menu), rendered with a browser because the site is client-rendered.
- PowerMapper screen reader reliability pages (last updated 2025-12-14): `content/css-generated-content/`, `content/css-generated-content-div/`, `labelling/a-aria-describedby/`, `labelling/input-text-aria-describedby/`, `labelling/a-title/`, `labelling/input-text-title/` under https://www.powermapper.com/tests/screen-readers/.
- NVDA source, nvaccess/nvda at `f56b2e0d7522da86765e6db64876ecde83c4a9d0` (and `2db695f` for `speech.py` and `event_focusExited`, `e88f01b` for the user guide): `source/IAccessibleHandler/internalWinEventHandler.py`, `source/eventHandler.py`, `source/NVDAObjects/__init__.py`, `source/speech/speech.py`, `source/locale/en/symbols.dic`, `source/config/configSpec.py`, `source/characterProcessing.py`, `user_docs/en/userGuide.md`.
- WebKit source, WebKit/WebKit `main` at `c39e3bbd953988fd6c963873ba3c6e53cde93d8f` (2026-09-26): `Source/WebCore/accessibility/AXObjectCache.cpp`, `AccessibilityObject.cpp`.
- MDN browser-compat-data, `html/global_attributes.json`, key `html.global_attributes.inert`.
- W3C: WAI-ARIA 1.2 Recommendation (https://www.w3.org/TR/wai-aria-1.2/); local clone `d:/projects/github/w3c/aria` at `ffa9651` for HTML-AAM 1.0, Core-AAM 1.2, and Accessible Name and Description Computation 1.2 (editor's drafts); local clone `d:/projects/github/w3c/aria-practices` at `3f094fd` for the APG patterns and examples.
- Angular CDK 22.2.x local clone, `src/cdk/a11y/aria-describer/aria-describer.ts`.
