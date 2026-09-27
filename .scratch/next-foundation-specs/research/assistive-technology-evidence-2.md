# Assistive-technology evidence: checks 8 to 13

Evidence for [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md), checks 8 to 13 of the README's "Assistive-technology checks" list: Dropdown Menu, Drilldown Menu, Abide, Slider, Orbit, and Magellan. Gathered AFK on 2026-09-26 and 2026-09-27 under the user's ruling that these checks are decided from evidence (map, "Open-decision pass"). No screen reader was installed or run. Each section gives the spec's markup, the exposure measured in three engines, the WAI-ARIA and AAM mappings, published support data, what NVDA's source code does with the measured events, and a proposed verdict with a Testing Decisions line.

## Proposed verdicts at a glance

| # | Check | Proposed verdict | Deciding evidence |
| --- | --- | --- | --- |
| 8 | Dropdown Menu: expanded state, submenu read after its button, silent hover opening, touch double tap | Spec correct | `aria-expanded` maps to the platform expanded and collapsed states on every parent button and Hybrid toggle, and the focused button fires a state change on toggle (measured, Chromium and Firefox); the open submenu is the next sibling of its button in every tree measured; a hover opening fires only a state change on a button that does not have focus, plus show and reorder events outside any live region, which NVDA's code does not speak; a screen reader's activation reaches the toggle as a simulated click with no `pointerenter` (Chromium and WebKit source) |
| 9 | Drilldown Menu: what is announced when focus lands in a Drilldown level and returns, and whether levels need names | Spec defect (low impact): name each Drilldown level after its parent control | On opening, the only event is focus on the level's first control: the toggle's expanded state change never reaches assistive technology, because the toggle is hidden by the same render that moves focus (measured, both engines), so the level itself is the only context left, and it is an unnamed list; a name through `aria-labelledby` is exposed while the toggle is hidden (measured) and NVDA speaks named list ancestors on focus entry (source; ARIA-AT confirms NVDA announces list boundaries on Tab). Returning to the toggle announces it with its collapsed state (measured) |
| 10 | Abide: `role="alert"` Form errors and the Form alert (several at once, on blur, inside a wrapping label) | Spec defect: Form errors of native controls go after the `label`, not inside a wrapping label; the rest is correct | Inside a wrapping label, a shown Form error becomes part of the field's accessible name in Firefox (measured; accname 1.2 step 2F requires it), so the error is read twice and the field fires a name change; Chromium leaves it out of the name but fires no `EVENT_SYSTEM_ALERT` for an alert inside a `label` (measured, reproducible). Several alerts at once and an alert on blur are exposed in DOM order right after the focus move (measured), and NVDA queues alert speech at one priority without the alerts cutting each other off (source) |
| 11 | Slider: `aria-valuetext` on native range inputs | Spec correct | `aria-valuetext` on `input type=range` is the MSAA value, the IAccessible2 `valuetext` attribute, and the UIA `Value.Value` in Chromium and Firefox, on focus and on every key step (measured); WebKit maps it to `AXValueDescription` for any slider (source); Chromium on Android puts it in the Android state description and stops reporting a percentage (source); NVDA speaks the value of the focused control on a value change (source) |
| 12 | Orbit: toggled `aria-live`, "carousel" and "slide" role descriptions, slides entering and leaving `inert`, focus handoff | Spec correct | Role descriptions are exposed (IAccessible2 `roledescription` in both engines; UIA localized control type in Chromium); without the "slide" description NVDA would call each slide "property page" (source), so "slide" reads better; text inserted into the container is ignored by NVDA while it is `aria-live="off"` and reported while `polite` (source; measured events); `inert` slides are absent from the platform trees (measured); the handoff fires a focus event on the new slide with its name and role description (measured) |
| 13 | Magellan: the Current section's link with `aria-current="true"`, and silence while it moves | Spec correct | `aria-current` maps to IAccessible2 `current:true` and UIA `AriaProperties current=true` (measured); moving it fires attribute (and in Firefox state) change events on links without focus and nothing else (measured); NVDA speaks those changes only for the object with focus (source) and reads the link as "current" (source; a11ysupport.io results for JAWS, NVDA, VoiceOver, TalkBack) |

## Method

### What was measured

For each check, a minimal static page reproduces the spec's server HTML and hydrated DOM with Foundation 6.9.0's compiled CSS (`dist/css/foundation.css` from the local clone at tag v6.9.0, commit `337be7a8d`, "Version 6.9.0" in its header), plus a small script that applies the state changes the spec's Rendered HTML and ARIA sections describe, in the order and the task the spec gives (for example, class and ARIA changes and the focus move in one task, as Angular's change detection followed by `afterNextRender` does). A Node script drives each page through the interaction steps the check names and records, per step:

- Playwright's ARIA snapshot (`locator.ariaSnapshot()`) in Chromium, Firefox, and WebKit.
- In Chromium, the CDP accessibility tree (`Accessibility.getFullAXTree`), rendered as roles, names, descriptions, and properties.
- On Windows, for Chromium and Firefox (headed), the UI Automation subtree read through the COM `IUIAutomation` interface (control type, localized control type, name, `FullDescription`, `AriaRole`, `AriaProperties`, `LiveSetting`, expand and collapse state, range value, value, selection, focus, offscreen).
- On Windows, a continuous event log: UIA focus, live-region, notification, and property-change events, and the MSAA and IAccessible2 WinEvents raised by the browser process (through an out-of-context `SetWinEventHook`, read-only), each resolved with `AccessibleObjectFromEvent` to its MSAA role, name, value, description, states, and IAccessible2 role and object attributes (`xml-roles`, `container-live`, `live`, `roledescription`, `current`, `valuetext`). NVDA and JAWS read Chromium and Firefox through MSAA and IAccessible2, not UI Automation, so this event log is the stream those two screen readers consume; UI Automation is what Narrator consumes.

What this does not give: the spoken words. Where a verdict depends on what a screen reader does with an event, the evidence is NVDA's source code at its latest release (NVDA is open source) and published support data for the others (JAWS and VoiceOver are closed).

### Environment

| Item | Version |
| --- | --- |
| OS | Windows 11 Pro 10.0.26200.9550, ARM64 (UI in Danish, so UIA localized control types are Danish words; translations are given where they matter) |
| Chromium | 153.0.8010.12 (Chrome for Testing, Playwright build 1243), launched with `--force-renderer-accessibility` |
| Firefox | 155.0 (Playwright build 1543; exposes native UIA and IAccessible2) |
| WebKit | 26.6 (Playwright build 2359; no platform accessibility API on Windows, so ARIA snapshot only) |
| Playwright | `playwright-core` 1.63.0 |
| PowerShell | 7.6.3 on .NET 10.0.9 |
| UIA interop | `Interop.UIAutomationClient` 10.19041.0 (NuGet), used from a compiled C# helper |

### Source pins

| Source | Pin |
| --- | --- |
| NVDA source | tag `release-2026.2` (published 2026-08-31), https://github.com/nvaccess/nvda |
| Chromium source | commit `cdf7131c86a0fba30b7a3bca78ecdf33c36b370a` (2026-09-26) |
| WebKit source | commit `c39e3bbd953988fd6c963873ba3c6e53cde93d8f` (2026-09-26) |
| WAI-ARIA, Core-AAM, HTML-AAM, accname (editor's drafts) | local clone `w3c/aria` at `ffa9651c` (2026-09-24); the definitions cited are unchanged from WAI-ARIA 1.2 (https://www.w3.org/TR/wai-aria-1.2/) and Core-AAM 1.2 (https://www.w3.org/TR/core-aam-1.2/) unless noted |
| APG | local clone `w3c/aria-practices` at `3f094fde` (2026-09-15) |
| a11ysupport.io data | https://github.com/accessibilitysupported/a11ysupport.io at `6730ad42` (2026-08-15), `data/tests/**` |
| ARIA-AT reports | https://aria-at.w3.org, read through its public GraphQL API (`/api/graphql`) on 2026-09-26, because the report pages are client-rendered |
| PowerMapper screen reader reliability | https://www.powermapper.com/tests/screen-readers/ (Dec 14, 2025 run): no tests for any feature in checks 8 to 13 (its ARIA page covers only columnheader, grid, heading, note, presentation, row, rowgroup, table, `aria-describedby`, `aria-label`, `aria-labelledby`, `aria-level`) |

### Tooling findings the Testing Decisions must account for

Three measured differences between what the specs' test tools report and what the engines expose. They matter for how every release test below is written.

1. **Playwright's ARIA snapshot and `getByRole` do not exclude `inert` content.** On `<div inert><button>Inert button</button></div>`, all three engines report `getByRole('button')` count 2 and list the inert button in the ARIA snapshot, while a click on it is refused (Playwright 1.63.0, Chromium 153, Firefox 155, WebKit 26.6; script `probe-inert-webkit.mjs`). The Orbit slides that the platform trees omit (UIA dump: `slide-0`, `slide-1`, `slide-3` "not in the UIA tree") all appear in the ARIA snapshot. A test that asserts "out of the accessibility tree" through Playwright's role queries passes for the wrong reason or fails wrongly; it must assert the `inert` or `hidden` attribute, or read the Chromium CDP tree.
2. **Playwright's ARIA snapshot computes names itself.** For a textbox inside a wrapping `label` that contains a shown `role="alert"` Form error, the snapshot says `textbox "Email (required) Enter your email address."` while Chromium's own name (CDP, UIA, MSAA) is `Email (required)` (check 10). Names asserted through the snapshot are Playwright's accname, not the engine's.
3. **The CDP `valuetext` property is not `aria-valuetext` on a native range input.** CDP reports `valuetext="309.016994374947"` on a handle whose `aria-valuetext` is `50`, while UIA `Value.Value`, MSAA `accValue`, and the IAccessible2 `valuetext` attribute all report `50` (check 11). Tests read the DOM attribute, not CDP.

### Harness

Throwaway workspace `D:/tmp/nfs-at-evidence-2/` (not in the repository): `server.mjs` (static server, port 4750), one page and one driver per check (`dropdown-menu.html` and `check08-dropdown.mjs`, `drilldown.html` and `check09-drilldown.mjs`, `abide.html` with `check10-abide.mjs` and `check10b-abide-submit.mjs`, `alert-probe.html` and `probe-alert.mjs`, `slider.html` and `check11-slider.mjs`, `orbit.html` and `check12-orbit.mjs`, `magellan.html` and `check13-magellan.mjs`), the shared driver `harness.mjs`, and the C# helpers `UiaTool.cs` (UIA dump and event handlers), `WinEv.cs` (WinEvent hook), `Ia2.cs` and `Ia2Probe.cs` (IAccessible2 attributes), run through `uia.ps1`. Outputs are `out/<check>-<engine>.txt` (per-step snapshots and trees, and the merged event log). The logs quoted below are trimmed to the relevant lines; timestamps are Unix milliseconds. Focus events from the OS appear only while the browser window is the foreground window; other agents' browser windows ran at the same time, so a few steps were rerun until the window held the foreground, and the UIA dumps' `FOCUSED` flag (document focus) is quoted where the OS event is missing.

---

## Check 8: Dropdown Menu

The README asks: "expanded state on parent buttons and Hybrid toggles, an open overlaying submenu read after its button, silent hover opening, touch double tap." Source of the check: [Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md), OPEN FOR HUMAN 1.

### What the spec renders

From [specs/dropdown-menu.md](../specs/dropdown-menu.md), ARIA and keyboard:

| Element | Semantics | Source |
| --- | --- | --- |
| Root and submenu `ul`, every `li` | Native `list` and `listitem`; no `role`, no `aria-*` | Nested menu |
| Parent button (`nfsSubmenuToggle`) | Native `button`, `type="button"`, `aria-expanded`, `aria-controls` = the submenu id; named by its text | Nested menu |
| Hybrid item | `a[href]` that navigates, then the toggle with `.submenu-toggle`, named by its `.submenu-toggle-text` span ("Products pages") | Nested menu; APG hybrid example |
| Closed submenu | `inert`, and Foundation's `display: none` on `.is-dropdown-submenu` without `.js-dropdown-active` | Nested menu; Foundation CSS |

Server HTML (Rendered HTML, abbreviated): `<li class="is-dropdown-submenu-parent opens-right"><button type="button" aria-expanded="false" aria-controls="nfs-submenu-x1-0">Item 1</button><ul id="nfs-submenu-x1-0" inert="" class="menu submenu is-dropdown-submenu first-sub">...`, and the Hybrid item `<a href="/products">Products</a><button type="button" class="submenu-toggle" aria-expanded="false" aria-controls="nfs-submenu-x1-2"><span class="submenu-toggle-text">Products pages</span></button>`. Opened (hover for 50 ms or a click): the `li` gains `is-active` and `data-nfs-expanded`, the button `aria-expanded="true"`, the submenu drops `inert` and gains `js-dropdown-active`; "Focus stays where it was." Hover uses code-added `pointerenter`/`pointerleave` and ignores `pointerType: 'touch'`.

### Reproduction

`dropdown-menu.html`: the spec's server HTML with fixed ids, Foundation CSS, the `nfs-dropdown-menu` parent-button rule (a), and a script emulating the dropdown mode: a toggle click opens (closing open siblings) or closes; hover opens after 50 ms for non-touch pointers; Escape inside a submenu closes it and refocuses its toggle; focus leaving an open item closes it. Steps (`check08-dropdown.mjs`): 0 focus a link before the menu; 1 Tab to "Item 1"; 2 Enter; 3 Tab into the submenu; 4 Escape; 5 Tab twice to the Hybrid toggle; 6 Space; 7 focus a link after the menu; 8 mouse over "Item 1" with focus still on the link after the menu; 9 mouse away.

### Measured exposure

Expanded state and order (step 2, "Item 1" open, focus on its button):

| Engine | Exposure |
| --- | --- |
| Chromium 153 (UIA) | `Button name="Item 1" ariaProps="expanded=true" FOCUSED expandCollapse=Expanded`, followed in the same `ListItem` by `List id=sub1` with "Item 1A" (link) and "Item 1B" (button, `Collapsed`) |
| Chromium 153 (CDP) | `button name="Item 1" focused=true expanded=true controls="sub1"`, then `list` with the two items, in the same `listitem` |
| Firefox 155 (UIA) | `Button name="Item 1" FOCUSED expandCollapse=Expanded`, then `List id=sub1` with the two items, in the same `ListItem` |
| All three (ARIA snapshot) | `button "Item 1" [expanded]` followed by `list:` with `link "Item 1A"` and `button "Item 1B"` |

Events when the focused button toggles (step 2 and step 4, Chromium; Firefox identical in kind):

```
[...307333] WE IA2_TEXT_INSERTED role=listitem states=readonly
[...307334] PROP ExpandCollapseState=1 on Button name="Item 1" ... FOCUSED expandCollapse=Expanded
[...307337] WE OBJ_STATECHANGE role=pushbutton name="Item 1" states=focused|expanded|focusable
[...307339] WE OBJ_SHOW role=list states=readonly
[...311789] PROP ExpandCollapseState=0 on Button name="Item 1" ... FOCUSED expandCollapse=Collapsed   (Escape)
[...311796] WE OBJ_FOCUS role=pushbutton name="Item 1" states=focused|collapsed|focusable
```

Hybrid toggle (steps 5 and 6): Chromium `FOCUS Button name="Products pages" expandCollapse=Collapsed`, then on Space `PROP ExpandCollapseState=1` and `OBJ_STATECHANGE role=pushbutton name="Products pages" states=focused|expanded|focusable`; Firefox the same. The link "Products" before it carries no expanded state.

Hover opening with focus elsewhere (step 8, rerun with IAccessible2 attributes; page log `pointerenter li1 type=mouse`, `opened li1`):

```
Chromium:
PROP ExpandCollapseState=1 on Button name="Item 1" ... expandCollapse=Expanded      (no FOCUSED)
WE IA2_TEXT_INSERTED role=listitem states=readonly ia2role=34
WE OBJ_STATECHANGE role=pushbutton name="Item 1" states=expanded|focusable ia2role=43
WE OBJ_SHOW role=list states=readonly ia2role=33
Firefox:
PROP ExpandCollapseState=1 on Button name="Item 1" ... expandCollapse=Expanded
WE OBJ_SHOW role=list states=readonly ia2role=33
WE IA2_TEXT_INSERTED role=listitem name="Item 1 Item 1A Item 1B" states=readonly ia2role=34
WE OBJ_STATECHANGE role=pushbutton name="Item 1" states=expanded|focusable ia2role=43
WE OBJ_NAMECHANGE role=listitem name="Item 1 Item 1A Item 1B"
```

No focus event, no `EVENT_SYSTEM_ALERT`, no UIA live-region event, and no object in the step carries `container-live` (the IAccessible2 attributes read for each event list none).

Touch activation: not measurable here (no touch screen reader). Evidence from the engines' accessibility activation paths, which TalkBack and VoiceOver on iOS use:

- Chromium (TalkBack through Chrome for Android): `AXObject::OnNativeClickAction()` focuses the element and calls `AccessKeyAction(SimulatedClickCreationScope::kFromAccessibility)`; `EventDispatcher::DispatchSimulatedClick` then dispatches `pointerdown`, `mousedown`, `pointerup`, `mouseup`, and `click` on the element (`third_party/blink/renderer/modules/accessibility/ax_object.cc`, `core/dom/events/event_dispatcher.cc` at the pinned commit). No `pointerenter` or `pointerover` is dispatched, so hover intent never runs; the click toggles.
- WebKit (VoiceOver on iOS): `AccessibilityObject::press()` dispatches touch events only when the element has a touch event listener (`#if PLATFORM(IOS_FAMILY) if (hasTouchEventListener()) dispatchedEvent = dispatchTouchEvent();`), otherwise `accessKeyAction(true)` or `dispatchSimulatedClick(nullptr, SendMouseUpDownEvents)` (`Source/WebCore/accessibility/AccessibilityObject.cpp`). The library adds pointer listeners, not touch listeners, so a double tap is a simulated click on the toggle.

### Mappings

| Feature | WAI-ARIA 1.2 / HTML-AAM | Core-AAM (MSAA + IA2 / UIA) |
| --- | --- | --- |
| `button` | HTML-AAM: `button` maps to the `button` role | `ROLE_SYSTEM_PUSHBUTTON` / Control Type `Button` |
| `aria-expanded=true` / `false` | Supported on `button` | `STATE_SYSTEM_EXPANDED` / `STATE_SYSTEM_COLLAPSED`; UIA `ExpandCollapse.ExpandCollapseState` Expanded / Collapsed (Core-AAM `#ariaExpandedTrue`, `#ariaExpandedFalse`) |
| `ul`, `li` | HTML-AAM: `list`, `listitem` | `ROLE_SYSTEM_LIST` with `STATE_SYSTEM_READONLY` / Control Type `List` |
| `inert` | HTML-AAM `#att-inert`: "Nodes that are inert are not exposed to an accessibility API." | Not mapped |
| Subtree shown | Core-AAM "Changes to document content or node visibility" | `EVENT_OBJECT_SHOW`; live-region events only "if in a live region" |

### Published support data

- ARIA-AT "Disclosure Navigation Menu Example" (candidate, test plan version 163668; reports finalized 2025-10-27 and 2025-11-03). "[MUST] Change in state, to 'expanded', is conveyed" and "to 'collapsed'" when operating the focused button: JAWS 2025.2508.120 + Chrome 4/4 pass, JAWS >= 2023.2307.37 + Chrome 4/4, NVDA >= 2023.1 + Chrome 4/4, VoiceOver >= 14.0 + Safari 3/3 pass, VoiceOver 15.1 (exact) + Safari 0/3 (outputs "[activation click sound]", "No output was detected."). "[MUST] State of the button, 'collapsed'/'expanded', is conveyed" on navigation: JAWS and NVDA pass every scenario; VoiceOver passes most (fails 1 of 3 or 4 in some scenarios).
- a11ysupport.io, test "Disclosure widget (show/hide)" (`data/tests/tech/aria/aria-expanded.json`, updated 2021-07-23): the `true` and `false` values are conveyed by JAWS 2021.2107 (Chrome, Edge), NVDA 2021.1 (Chrome, Edge), NVDA 2019.3 + Firefox 74, Narrator, TalkBack 8.1, VoiceOver iOS 13.4, VoiceOver macOS 10.15.4; the change in value is conveyed by all of them except JAWS 2021.2107 + Chrome/Edge, marked partial.
- No published test isolates an `aria-expanded` change on a button that does not have focus (checked ARIA-AT's 44 test plans and a11ysupport.io's test list): a gap, not a negative result.

### What NVDA does with these events (source, `release-2026.2`)

- `NVDAObjects/__init__.py`, `event_stateChange`: speaks the state only when the object "is the current focus" or a focus ancestor (`if inFocus: speech.speakObjectProperties(self, states=True, reason=...CHANGE)`). The focused toggle's change is spoken ("expanded"); the hover-opened button's change is not.
- `nvdaHelper/remote/ia2LiveRegions.cpp`: `EVENT_OBJECT_SHOW` and `IA2_EVENT_TEXT_INSERTED` are reported only when the object has `container-live` of `polite`, `assertive`, or `rude` (`if(!live) { return; }`). The hover opening's show and text-inserted events are ignored.
- `eventHandler.py`, `shouldAcceptEvent`: `show` events are accepted only for a few window classes (tooltips, notification bars), `hide` never.

### Proposed verdict: spec correct

The expanded state is exposed on parent buttons and Hybrid toggles and changes are announced on the focused control (measured; ARIA-AT JAWS and NVDA pass); the open submenu sits right after its button in every tree, so it is read after it; a hover opening produces no event any screen reader is designed to speak (measured events; NVDA source); a screen reader's activation on touch is a simulated click with no hover events, so it toggles (Chromium and WebKit source). The VoiceOver 15.1 failure to speak the change on a focused disclosure button is a VoiceOver regression across every disclosure button, not something the markup can fix; VoiceOver >= 14.0 passes the same test.

Testing Decisions line (layer 4, release test, manual): "Before each release, with VoiceOver on iOS and TalkBack, double tap a parent button and a Hybrid toggle on `dropdown-menu--default` and `dropdown-menu--hybrid`: each double tap toggles the submenu once, the new state is announced, and swiping on from the button reaches the submenu's first item; with VoiceOver on macOS and NVDA with Chrome, hovering a parent with focus elsewhere produces no speech. The automated layers assert the attributes (`aria-expanded`, `inert`) and DOM order, not Playwright role queries, which do not treat `inert` as hidden."

Correction (2026-09-27, from [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)): the WebKit touch sentence under Measured exposure, and the verdict's "(Chromium and WebKit source)" for WebKit, are wrong. Pointer events are in WebKit's `TouchRelated` event category (`EventNames.json`), so the item's `pointerenter` and `pointerleave` listeners make `hasTouchEventListener()` true (it walks ancestors, `AccessibilityObjectIOS.mm`), and `press()` then dispatches touch events and returns before `dispatchSimulatedClick` when that succeeds (`AccessibilityObject.cpp`). Whether that yields exactly one click on iOS is closed source; the Dropdown Menu's release test is the gate. The statement that a hover opening produces no event "any screen reader is designed to speak" is measured and source-backed for NVDA only; for other screen readers it is an inference.

---

## Check 9: Drilldown Menu

The README asks: "what is announced when focus lands in a level and returns to its toggle, and whether each level list needs a name." Source: [Spec: Drilldown Menu](../issues/22-spec-drilldown-menu.md), OPEN FOR HUMAN 1 ("whether the back button's suffix gives enough context or each level list needs a name").

### What the spec renders

From [specs/drilldown-menu.md](../specs/drilldown-menu.md), ARIA and keyboard:

| Element | Semantics | Rendered by |
| --- | --- | --- |
| Root and submenu `ul`, every `li` (back item included) | Native `list` and `listitem`; no `role`, no `aria-*` | Consumer markup; utility adds no roles |
| Parent toggle | Native `button`, `type="button"`, `aria-expanded`, `aria-controls` = the submenu id, name from its text | Utility |
| Back button | Native `button`, `type="button"`, name "Back" plus a visually hidden suffix naming the level it returns to; no `aria-expanded` | Consumer markup, `NfsDrilldownBack` behaviour |
| Closed submenu | `inert` plus Foundation's `invisible` | Utility |
| Hidden ancestor level (root included) | Foundation's `invisible` (`visibility: hidden`: out of the tab order and the accessibility tree); never `inert` | Utility and `NfsDrilldown` |

Rendered HTML: "After a click on Products: the root gains `invisible`; the Products `li` gains `data-nfs-expanded`; its button `aria-expanded="true"`; its submenu drops `inert` and `invisible` and gains `is-active visible`, then `data-nfs-shown` once the slide ends ...; focus is on Boards (the first control not inside the back item)." "After Back: the Products submenu gains `is-closing` and `inert` (still `is-active visible`) until its `transform` transition ends ...; the root drops `invisible` at once; focus is on the Products button." The focus move runs in the Nested menu's `afterNextRender`, which runs right after the change-detection pass that applied the classes, in the same task.

### Reproduction

`drilldown.html`: the spec's server HTML (wrapper `div.is-drilldown` with the measured `min-height`, three levels, back items first, a Hybrid item, `aria-current="page"` on Repairs), Foundation CSS, `nfs-drilldown` rules 1, 5, and 7, and a script that applies the class and ARIA changes and then the focus move in one later task (the default, matching Angular), or, with `?timing=frames`, applies them at once and moves focus two frames later. Variant `?named=1` adds `aria-labelledby` from each level list to its parent toggle (the Hybrid level to the link "Services"). Steps (`check09-drilldown.mjs`): 0 focus a link before the menu; 1 Tab to "Products"; 2 Enter; 3 Tab to "Wheels", ArrowRight; 4 Escape; 5 Shift+Tab twice to "Back to Shop", Enter.

### Measured exposure

Open and back, spec timing (both engines, OS focus events):

```
Chromium 153
STEP 1  FOCUS Button name="Products" expandCollapse=Collapsed ; WE OBJ_FOCUS role=pushbutton states=focused|collapsed
STEP 2  FOCUS Hyperlink name="Boards" ; WE OBJ_FOCUS role=link name="Boards" states=focused|focusable|linked
STEP 3  FOCUS Button name="Wheels" expandCollapse=Collapsed ; then FOCUS Hyperlink name="Street"
STEP 4  FOCUS Button name="Wheels" expandCollapse=Collapsed ; WE OBJ_FOCUS role=pushbutton states=focused|collapsed
STEP 5  FOCUS Button name="Back to Shop" ; then FOCUS Button name="Products" expandCollapse=Collapsed
Firefox 155: the same sequence (FOCUS Boards; FOCUS Wheels, Street; FOCUS Wheels Collapsed; FOCUS Back to Shop, Products Collapsed)
```

On opening (steps 2 and 3), neither engine fires any state-change or `ExpandCollapseState` event for the toggle: the toggle's `aria-expanded="true"` and its ancestor's `visibility: hidden` are applied in the same render, so the toggle leaves the accessibility tree before its state change is reported, and the only event is the focus event on the level's first control. On going back (steps 4 and 5), the focus event on the toggle carries its collapsed state.

Tree at step 2 (Chromium CDP; Firefox and Chromium UIA the same): `navigation "Shop"` > `generic` (wrapper) > `list` > `listitem` > `button "Back to Shop"`, `listitem` > `link "Boards" focused`, `listitem` > `button "Wheels" expanded=false`. The root list, its items, and the Products toggle are not in the tree (their `visibility: hidden` excludes them), so the open level's list is a child of the wrapper. The back button's name is "Back to Shop" in both engines.

Named variant, step 2: Chromium UIA `List name="Products" ariaRole=list id=sub-products`, Firefox UIA `List name="Products" ariaRole=list id=sub-products`; the name comes from the hidden toggle through `aria-labelledby` in both engines.

`?timing=frames` (focus moved two frames after the class change): Chromium fires `FOCUS Group name="Shop" landmark=navigation` and `WE OBJ_FOCUS role=grouping` before `FOCUS Hyperlink name="Boards"`; Firefox fires `FOCUS Document` and `WE OBJ_FOCUS role=document` before Boards. When a paint separates the class change from the focus move, focus visibly drops to the landmark or document for a frame and screen readers receive that focus event.

WebKit 26.6: document focus lands on Boards (`document.activeElement: a#l-boards`); the ARIA snapshot of the level is `list` > `button "Back to Shop"`, `link "Boards"`, `button "Wheels"`. (The snapshot of the whole `nav` prints only `navigation "Shop"` in all three engines, a Playwright snapshot limitation under a `visibility: hidden` ancestor; the level's own snapshot and `getByRole('link', {name: 'Boards'})` find it in all three.)

### Mappings

| Feature | Mapping |
| --- | --- |
| `visibility: hidden` | Core-AAM "Exclusion of elements from the accessibility tree"; a `visible` descendant is exposed (measured) |
| `inert` | HTML-AAM `#att-inert`: not exposed |
| `list` name | WAI-ARIA 1.2 `list`: name from author, not required; `aria-labelledby` may reference a hidden element, whose subtree is then included (accname 1.2 "LabelledBy" and "Hidden Not Referenced") |
| `aria-expanded` | As check 8 |

### Published support data

- ARIA-AT "Disclosure Navigation Menu Example", assertion "[MAY] List boundary is conveyed" on the first Tab stop into a list (reports as in check 8): NVDA >= 2023.1 + Chrome passes 5/5 in every navigation mode ("list with 3 items"); JAWS + Chrome passes 3 of 5 (fails when Tab lands directly on a control: output "About Button collapsed"); VoiceOver + Safari passes 2 of 4 (fails on plain Tab: "About collapsed button").
- a11ysupport.io `aria-current` test outputs show NVDA's browse-mode phrasing on entering a list, "navigation landmark, list with 3 items, bullet, visited link, current page, Home" (NVDA 2021.1 + Chrome 91, 2021-07-15).
- No published data tests a named `ul` (a11ysupport.io's `list_role` page has no expectations yet): a gap.

### What NVDA does (source)

- `eventHandler.py`, `doPreGainFocus`: "Fire focus entered events for all new ancestors of the focus if this is a gainFocus event" (`for parent in api.getFocusAncestors()[api.getFocusDifferenceLevel():]: executeEvent("focusEntered", parent)`).
- `NVDAObjects/__init__.py`, `_get_isPresentableFocusAncestor`: lists are presentable (only tree items, list items, progress bars, and editable text are excluded); `event_focusEntered` speaks the ancestor with `speech.speakObject(self, reason=...FOCUSENTERED)`. In browse mode, `speech.getControlFieldSpeech` announces a list as "list with N items" and takes the name when the reason is focus (`if reason in [OutputReason.FOCUS, OutputReason.QUICKNAV] ...: name = attrs.get("name", "")`).
- So for NVDA, moving focus from the Products toggle (in the root list) to Boards (in the level's list) announces the level's list, then the link: today "list with 3 items, Boards, link", with a name "Products, list with 3 items, Boards, link" (derived from source, not heard).

### Proposed verdict: spec defect (low impact); each Drilldown level needs a name

Returning to the toggle is right as specified: focus lands on the toggle and it is announced with its name and collapsed state (measured in both engines, both levels). Opening a level is where context is lost: the toggle's change to expanded never reaches assistive technology (measured: no state event in either engine, because the toggle is hidden in the same render), the back button that names the way back is skipped by the focus move, and the level is an unnamed list. For NVDA users, who hear list boundaries on Tab (ARIA-AT), a level name is the one cue that says which level they entered; for JAWS and VoiceOver, which do not announce list boundaries on Tab, the name is still available when reading the level. The cost is two host bindings, and the name is exposed in both engines while the toggle is hidden (measured).

Exact fix:

1. [specs/nested-menu.md](../specs/nested-menu.md): `NfsSubmenuToggle` binds `[attr.id]` (the consumer's static `id`, else a generated `nfs-submenu-toggle-<n>` from `_IdGenerator`, rewritten at hydration like the submenu ids); `NfsSubmenu` binds `[attr.aria-labelledby]` to its item's toggle id while the live mode is `drilldown`, `null` otherwise. In the ARIA table, the row "Root and submenu `ul`, every `li` | Native `list` and `listitem`; no `role`, no `aria-*`" gains "except, in drilldown mode, `aria-labelledby` on each submenu naming its Drilldown level after its parent toggle (a Hybrid item's level is named by its toggle's `.submenu-toggle-text`)".
2. [specs/drilldown-menu.md](../specs/drilldown-menu.md): the same row in its ARIA table, the Rendered HTML server output gains `aria-labelledby="nfs-submenu-toggle-a1-0"` on each submenu and `id` on each toggle, and a design decision records the reason (the toggle's expanded state is never exposed on open; NVDA announces named list ancestors on focus entry).
3. Testing Decisions (layer 2): "Each submenu in drilldown mode has `aria-labelledby` resolving to its parent toggle, and none in accordion or dropdown mode." Layer 2 also: "Opening a level moves focus in the same task as the render that lifts `inert`: no `focusout` with a `null` `relatedTarget` occurs on the toggle" (the `?timing=frames` measurement shows the landmark or document receiving focus otherwise).

Testing Decisions line (layer 4, release test, manual): "Before each release, with NVDA and JAWS on Chrome and Firefox and VoiceOver on macOS, open and close a Drilldown level on `drilldown-menu--default` by keyboard and by click: entering a level is announced with the level's name and its first control, and going back announces the parent toggle as collapsed."

Correction (2026-09-27, from [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)): the Hybrid level is named by its toggle, whose name is its `.submenu-toggle-text` ("Services pages"), one rule for every level; the `?named=1` variant's reference from the Hybrid level to the link "Services" is not the decided markup.

---

## Check 10: Abide

The README asks: "`role="alert"` Form errors and the Form alert (several at once, on blur, inside a wrapping label)." Source: [Spec: Abide](../issues/31-spec-abide.md), OPEN FOR HUMAN 1 ("a failed submit with four errors ..., an error appearing on blur while focus lands on the next field, and error text inside a wrapping label, which becomes part of the input's name once visible").

### What the spec renders

From [specs/abide.md](../specs/abide.md), ARIA and keyboard:

| Element | ARIA and state | Source |
| --- | --- | --- |
| Field (`nfsAbideInput`) | Native label; native `required` (Signal Forms mirrors it); `aria-invalid="true"` while the error shows (not on radios); `aria-describedby` = hints plus visible Form errors | WAI-ARIA `aria-invalid` applicability; WCAG 3.3.1 |
| Form error (`nfsFormError`) | `id`; `role="alert"` unless the consumer set a role; hidden by Foundation's `display: none` until `.is-visible`, so never in the accessibility tree while hidden | Abide `a11yAttributes`; WCAG 4.1.3; ARIA19 |
| Form alert (`nfsAbideAlert`) | `role="alert"` (`assertive`), `role="status"` (`polite`), or none (`off`); `hidden` until a submit fails | Abide `a11yErrorLevel`; WCAG 4.1.3 |

Rendered HTML, hydrated after a failed submit (abbreviated): `<div nfsabidealert="" class="alert callout" role="alert">...</div> <label nfsabidelabel="" class="is-invalid-label"> Email (required) <input type="email" ... class="is-invalid-input" aria-invalid="true" aria-describedby="email-hint nfs-form-error-b7c0"> <span ... class="form-error is-visible" id="nfs-form-error-b7c0" role="alert">Enter your email address.</span> <span ... class="form-error" ... role="alert">Enter a complete email address, with an @ and a domain.</span> </label>`. User story 14: "the wrapping-label markup to link label, field, and errors with no references".

### Reproduction

`abide.html`: the hydrated form of the Rendered HTML (Form alert, the wrapping-label email with its two Form errors, the `label[for]` password pair), plus a Name field (so a failed submit shows at least four errors) and a comparison "Work email" field whose Form error sits after its `label[for]`. A script applies `validateOnBlur` state (blur marks touched), `.is-invalid-input`, `aria-invalid`, `.is-visible` per kind, `aria-describedby` = hint ids plus visible error ids, and the Form alert's `hidden` while submitted and invalid. `alert-probe.html` isolates the label effect: two `role="alert"` Form errors inside wrapping labels, one after a `label[for]`, one in a plain `div`, revealed one at a time with focus elsewhere. Scenario A (`check10-abide.mjs`): focus Email, Tab away (error on blur), Shift+Tab back, the same on Work email, then submit. Scenario B (`check10b-abide-submit.mjs`): a pristine form submitted with Enter, so five Form errors and the Form alert appear in one pass.

### Measured exposure

Inside a wrapping label (scenario A step 3, focus back on Email with its error visible):

| Engine | Name of the Email field | Description |
| --- | --- | --- |
| Chromium 153 (CDP, UIA, MSAA) | `Email (required)` | `We never share it. Enter your email address.` |
| Firefox 155 (UIA, MSAA) | `Email (required) Enter your email address.` | `We never share it. Enter your email address.` |
| Playwright ARIA snapshot (its own accname, all three engines) | `Email (required) Enter your email address.` | n/a |
| WebKit (source, not measured) | Excludes the alert's text: in `textUnderElement`, a child whose role does not derive its name from content (alert) contributes only its author name (`shouldDeriveNameFromAuthor` then `accessibleNameForNode`, which returns empty for an unnamed alert), `AccessibilityNodeObject.cpp` at the pinned commit | n/a |

In Firefox the error appearing also fires a name change on the field (step 2): `PROP Name=Email (required) Enter your email address.` and `WE OBJ_NAMECHANGE role=text name="Email (required) Enter your email address."`. The "Work email" field, whose Form error follows its label, keeps the name `Work email (...)` with the error only in its description, in both engines.

Alert events by placement (`probe-alert.mjs`, focus on a link elsewhere, one reveal per step):

| Form error | Chromium 153 | Firefox 155 |
| --- | --- | --- |
| A, inside a wrapping label | `LIVE_REGION_CHANGED` (UIA), `IA2_TEXT_INSERTED`, `OBJ_SHOW role=alert` with `container-live:assertive`; no `SYSTEM_ALERT` | `OBJ_SHOW role=alert`, `SYSTEM_ALERT`, and a name change on the field |
| B, after its `label[for]` | UIA `LIVE_REGION_CHANGED`, `IA2_TEXT_INSERTED`, `SYSTEM_ALERT`, `OBJ_SHOW` | `OBJ_SHOW`, `IA2_TEXT_INSERTED`, `SYSTEM_ALERT` |
| C, inside a wrapping label | as A: no `SYSTEM_ALERT` | as A |
| D, in a plain `div` | as B | as B |

Chromium's alert objects carry `xml-roles:alert;live:assertive;relevant:additions text;atomic:true;container-live:assertive`; Firefox's carry `xml-roles:alert` only (no `container-live`).

On blur (scenario A step 2, Tab from the empty Email field to Password):

```
Chromium  FOCUS Edit name="Password (required)"                                  [+0 ms]
          WE OBJ_DESCRIPTIONCHANGE role=text name="Email (required)" desc="We never share it. Enter your email address."
          WE OBJ_SHOW role=alert ... container-live:assertive                      [+14 ms]
          LIVE_REGION_CHANGED Text lct=alert id=err-email-req                       [+17 ms]
Firefox   FOCUS Edit name="Password (required)"                                  [+0 ms]
          WE OBJ_SHOW role=alert ia2attrs{xml-roles:alert}                          [+10 ms]
          WE SYSTEM_ALERT role=alert                                                [+19 ms]
          WE OBJ_NAMECHANGE role=text name="Email (required) Enter your email address."
```

With the Form error outside a label (Work email, step 4, Chromium): `FOCUS Button name="Sign up"`, `OBJ_DESCRIPTIONCHANGE` on the field, `SYSTEM_ALERT`, `OBJ_SHOW role=alert`, `LIVE_REGION_CHANGED`. The focus event comes first in every case.

Several at once (scenario B, five Form errors and the Form alert in one pass, focus stays on the submit button): Chromium fires six `OBJ_SHOW role=alert` and six UIA `LIVE_REGION_CHANGED` in DOM order (Form alert first) within 30 ms, and five `SYSTEM_ALERT` (the Email error, inside its label, gets none); Firefox fires six `OBJ_SHOW` and then six `SYSTEM_ALERT` within 60 ms. Every field gets `aria-invalid` and its description in the same pass (`OBJ_DESCRIPTIONCHANGE`).

### Mappings

| Feature | Mapping |
| --- | --- |
| `alert` | Core-AAM `#role-map-alert`: `ROLE_SYSTEM_ALERT`, "The user agent SHOULD fire `EVENT_SYSTEM_ALERT`" with Note 2: "This specification does not currently contain guidance for when user agents should fire system alert events"; UIA Control Type Group, localized control type "alert", LiveSetting Assertive |
| `status` | `ROLE_SYSTEM_STATUSBAR`, `container-live:polite`, `live:polite`; UIA LiveSetting Polite |
| Showing a subtree | `EVENT_OBJECT_SHOW`; UIA live-region changed "if in a live region" |
| `aria-describedby` | `accDescription`, `IA2_RELATION_DESCRIBED_BY`; UIA `FullDescription`; change event `EVENT_OBJECT_DESCRIPTIONCHANGE` |
| `aria-invalid=true` | `IA2_STATE_INVALID_ENTRY`; UIA `IsDataValidForForm: false` |
| Name from a `label` | HTML-AAM accessible name computation: "use the associated `label` element or elements accessible name(s)"; accname 1.2 "Name From Content" applies when "the current node ... is a native host language text alternative element (e.g. label in HTML), or is a descendant of a native host language text alternative element", so every visible descendant of the label, the alert included, contributes (Firefox follows this; Chromium and WebKit skip descendants whose role takes its name from the author only) |

### Published support data

- ARIA-AT "Alert Example" (candidate, test plan version 163670; single test "Trigger an alert"): "[MUST] Text 'Hello' is conveyed" passes for JAWS >= 2021.2111.13 + Chrome (4/4, finalized 2025-11-03), JAWS 2025.2508.120 + Chrome (4/4, 2026-06-02), NVDA >= 2020.4 + Chrome (4/4, 2025-11-03), VoiceOver >= 11.6 + Safari (3/3, 2025-11-03). "[MAY] Role 'alert' is conveyed" passes for NVDA and the older JAWS, fails for JAWS 2025.2508.120 and VoiceOver.
- a11ysupport.io "unnamed alert role" and "named alert role" (`data/tests/tech/aria/alert-role-*.json`, updated 2022-08-31; results mostly 2020-07 to 2021-07): the automatic announcement is supported by JAWS, NVDA, Narrator, TalkBack, VoiceOver iOS and macOS (not Orca); the assertive interruption is not conveyed by JAWS 2020 + Chrome, JAWS 2021 + Edge, or TalkBack 8.1.
- a11ysupport.io "aria-describedby attribute that references role="alert"" (`aria-describedby-with-role-alert.json`, 2019-02-08 to 2021-07-23): the description is conveyed on focus by JAWS, NVDA, Narrator, and TalkBack ("Example label, edit, error"), and not by VoiceOver iOS 14.4 ("Example label, text field") or VoiceOver macOS 11.2.2 + Safari 14.0.3 ("Example label, edit text"). Old results; a release-test item.
- a11ysupport.io "aria-describedby attribute on a text input", "convey description change" (2021-10-19): conveyed by JAWS and NVDA (Chrome, Edge, Firefox), partially by VoiceOver macOS, not by Narrator, TalkBack, or VoiceOver iOS.
- No published test covers several alerts at once or an alert while focus moves to another field (ARIA-AT, a11ysupport.io): a gap.

### What NVDA does (source)

- `NVDAObjects/IAccessible/__init__.py`, `event_alert` (from `EVENT_SYSTEM_ALERT`): ignores events on non-alerts and empty alerts, returns "If the focus is within the alert object", otherwise `speech.speakObject(self, reason=...FOCUS, priority=speech.Spri.NOW)`.
- `speech/priorities.py`: `NOW` "should be spoken right now, interrupting low priority speech. After it is spoken, interrupted speech will resume. Note that this does not interrupt previously queued speech at the same priority." Several alerts at once are therefore queued and all spoken in event order; an alert on blur interrupts the new field's announcement, which then resumes.
- `nvdaHelper/remote/ia2LiveRegions.cpp` and `NVDAHelper.nvdaControllerInternal_reportLiveRegion`: an `EVENT_OBJECT_SHOW` for an object with `container-live:assertive` is reported as live-region text with priority `NEXT` (after the current utterance). Chromium's alerts carry `container-live:assertive`, so in Chromium NVDA reaches every shown alert through this path, and additionally through `event_alert` where Chromium fires `EVENT_SYSTEM_ALERT`. No de-duplication between the two paths was found in the source; whether NVDA with Chrome speaks such an error twice is not verified here (release test). Firefox's alerts carry no `container-live`, so only `event_alert` applies there.

### Proposed verdict: spec defect for the wrapping-label placement; the rest is correct

Correct as specified: the Form alert and the Form errors are exposed as alerts in DOM order when a submit fails, all within one render; on blur the next field's focus event arrives first and the error follows (measured in both engines); NVDA's code queues alert speech at one priority without cutting earlier alerts off and resumes the interrupted field announcement (source); the text is conveyed by JAWS, NVDA, and VoiceOver (ARIA-AT). Several alerts at once are verbose but meet 4.1.3, and the spec already offers `a11yErrorLevel="polite"` for the Form alert.

Defective: a Form error inside a wrapping label. In Firefox, following accname 1.2, the visible error becomes part of the field's accessible name, so NVDA and JAWS with Firefox read it twice on focus (name and description), and a name change fires on the field whenever an error appears or clears (measured). In Chromium the name is unaffected, but no `EVENT_SYSTEM_ALERT` is fired for an alert inside a `label`, so screen readers that rely on that event get the error only through the live-region path (measured; Core-AAM gives no rule, so neither engine is out of conformance). Putting the Form error after the label removes both effects in both engines (measured on "Work email" and probe B).

Exact fix:

1. [specs/abide.md](../specs/abide.md), Rendered HTML consumer markup: the email field's Form errors move after `</label>` and link by reference: `<label nfsAbideLabel>Email (required) <input type="email" autocomplete="email" nfsAbideInput #email="nfsAbideInput" [formField]="f.email" aria-describedby="email-hint" /></label> <span [nfsFormError]="email" formErrorOn="required">Enter your email address.</span> <span [nfsFormError]="email" formErrorOn="email">Enter a complete email address, with an @ and a domain.</span>`, with the server and hydrated HTML updated to match.
2. User story 14 becomes: "As an application developer, I want the wrapping-label markup to link label and field with no references, and Form errors placed after the label to link by a typed template reference, so that errors never become part of the field's name."
3. `NfsFormError` adds a development-mode check (in the existing `afterNextRender` dev checks): warn once when the Form error is a descendant of a `label` and its field is a native control, naming the Firefox duplicate and the `label` alert-event gap. A custom `FormValueControl` keeps in-label linking (its typed reference crashes the compiler, as the spec records), documented as a known limitation until that is fixed.
4. The Foundation contract table records the change from Foundation's docs markup, which puts `.form-error` inside the label.

Testing Decisions line (layer 4, release test, manual): "Before each release, with NVDA and JAWS on Chrome and Firefox and VoiceOver on macOS and iOS, on `abide--submit` and `abide--validate-on-blur`: a failed submit announces the Form alert and each Form error once, in DOM order, without an error cutting off the one before it; leaving an empty required field announces its error and then the next field; focusing an invalid field announces its label, invalid state, and error once (no duplicated error text); on VoiceOver, the error is read as the field's description. The automated layers assert the DOM (`role`, `.is-visible`, `aria-describedby`, `aria-invalid`) and, in Chromium, the CDP name and description, not Playwright's computed names."

---

## Check 11: Slider

The README asks: "`aria-valuetext` on native range inputs." Source: [Spec: Slider](../issues/32-spec-slider.md), OPEN FOR HUMAN 2 ("NVDA with Chrome and Firefox, VoiceOver on macOS and iOS, TalkBack"). The vertical orientation question is a separate trap-quadrant decision and is not evidenced here.

### What the spec renders

From [specs/slider.md](../specs/slider.md), ARIA and keyboard:

| Element or state | Rendered semantics | Source |
| --- | --- | --- |
| Handle | Native `input[type=range]`: implicit role `slider`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` from the native value, `min`, `max` | WHATWG HTML range state; ARIA in HTML |
| Dependent bounds | The first handle's native `max` is the second's value and the second's native `min` is the first's value (on a non-linear slider, each sibling's Bar position times 1000, so `aria-valuemin`/`aria-valuemax` are positions like `aria-valuenow`, and `aria-valuetext` carries the value) | APG Multi-Thumb |
| Value text | `aria-valuetext` from `displayWith`, and always on a non-linear handle, where `aria-valuenow` is the Bar position | APG Slider |

Host binding: `[attr.aria-valuetext]` = "`displayWith(value)`; for a non-linear handle without `displayWith`, the value as text; otherwise absent". Rendered HTML examples: `<input type="range" aria-label="Budget" min="0" max="1000" step="any" value="309.02" aria-valuetext="50" ...>` (non-linear, log, base 5) and the non-linear range pair with `aria-valuetext="25"` and `"75"`.

### Reproduction

`slider.html`: a single Handle `Volume` (0..200, value 50) with `displayWith` percent text, a linear range pair (Minimum price 25, Maximum price 75, dependent bounds), and the non-linear `Budget` Handle (native 309.0169..., `aria-valuetext="50"`). A script rewrites `aria-valuetext` in a later task after each native `input` event (as the host binding does in the next change detection) and, for Budget, applies one value step per arrow key, writes the native Bar position, dispatches `input` and `change`, and updates `aria-valuetext` in a later task. Steps (`check11-slider.mjs`): Tab to Volume; ArrowRight; PageUp; Tab to Minimum price, ArrowRight; focus Budget; ArrowRight.

### Measured exposure

| Step | Chromium 153 | Firefox 155 |
| --- | --- | --- |
| Focus Volume | UIA `Slider name="Volume" range=50 [0..200] value="50 percent"`, `AriaProperties valuetext=50 percent` | UIA `Slider name="Volume" range=50 [0..200] value="50 percent"`; MSAA `value="50 percent"`, IA2 `valuetext:50 percent` |
| ArrowRight | `PROP RangeValue` (51), two `WE OBJ_VALUECHANGE role=slider name="Volume" value="51 percent"` (native change, then the attribute) | `PROP RangeValue=51`, `PROP Value=51 percent`, two `OBJ_VALUECHANGE value="51 percent"` |
| PageUp | Native 71; `OBJ_VALUECHANGE value="71 percent"` after the attribute update | `RangeValue=71`, `Value=71 percent` |
| Minimum price ArrowRight | `OBJ_VALUECHANGE name="Minimum price" value="26"`; Maximum's `valuemin` becomes 26 | `OBJ_VALUECHANGE` on both Handles (Maximum `value="75"`, `range=75 [26..100]`) |
| Focus Budget (non-linear) | `FOCUS Slider name="Budget" range=309.01... [0..1000] value="50"`; `WE OBJ_FOCUS role=slider name="Budget" value="50"`, IA2 `valuetext:50` | `FOCUS Slider name="Budget" range=309.016994374947 [0..1000] value="50"`; MSAA `value="50"` |
| Budget ArrowRight | `RangeValue` 318.09, `OBJ_VALUECHANGE value="51"`, IA2 `valuetext:51` | `RangeValue=318.08681662017`, `OBJ_VALUECHANGE value="51"`, `Value=51` |

The value string that MSAA, IAccessible2, and UIA `Value.Value` expose is `aria-valuetext` in both engines, on focus and after every step; only the numeric `RangeValue` carries the Bar position. Playwright's ARIA snapshot prints `slider "Budget": "318.08681662017"` (it shows `aria-valuenow`, not `aria-valuetext`), and CDP's `valuetext` property shows the native number (tooling finding 3). WebKit: `AccessibilityNodeObject::valueDescription()` returns `aria-valuetext` whenever `isRangeControl()`, which is true for any object with the slider role, the native range input included (`AccessibilityNodeObject.cpp`, `AccessibilityObject.cpp` at the pinned commit); Core-AAM maps that to `AXValueDescription`, which VoiceOver reads. Chromium on Android: `BrowserAccessibilityAndroid` adds `aria-valuetext` of a range control to the Android state description ("For range controls, retrieve the aria-valuetext."), and `IsRangeControlWithoutAriaValueText()` stops the percentage it otherwise reports ("Exclude sliders with an aria-valuetext set, as a percentage is not meaningful in those cases.") (`content/browser/accessibility/browser_accessibility_android.cc` at the pinned commit). TalkBack reads the state description.

### Mappings

| Feature | Mapping |
| --- | --- |
| `input type=range` | HTML-AAM `#el-input-range`: `slider` role, "Use WAI-ARIA mapping" |
| `slider` | `ROLE_SYSTEM_SLIDER`, `IAccessibleValue`; UIA Control Type Slider, RangeValue pattern |
| `aria-valuenow` | `IAccessibleValue::currentValue()`; `IAccessible::get_accValue()` "if `aria-valuetext` is not defined"; UIA `RangeValue.Value` |
| `aria-valuetext` | `IAccessible::get_accValue()`, object attribute `valuetext:<value>`; UIA `Value.Value`; AX API `AXValueDescription`; change event `EVENT_OBJECT_VALUECHANGE` / UIA property change of `AriaProperties` |
| WAI-ARIA 1.2 | `aria-valuetext` is supported on `slider`; ARIA in HTML allows it on `input type=range` |

### Published support data

- ARIA-AT candidate reports for custom sliders that use `aria-valuetext` (`aria-valuetext` feature metrics): Media Seek Slider, JAWS 2021.2111.13 + Chrome 20/20 (2025-03-26), JAWS 2025.2508.120 + Chrome 20/20 (2026-05-06), NVDA >= 2020.4 + Chrome 17/20 (2025-03-26), VoiceOver >= 11.6 + Safari 17/20 (2025-03-26); Vertical Temperature Slider, JAWS 2025.2508.120 + Chrome 64/64 (2026-05-06), NVDA >= 2024.4 + Chrome 55 passed, 1 failed of 64 (2025-08-08), VoiceOver >= 15.1 + Safari 48 passed, 0 failed of 56 (2025-08-25). These are `role="slider"` widgets, not native range inputs.
- a11ysupport.io "Basic html range input test" (`input-range.json`, 2019-10-22 to 2021-07-29; no `aria-valuetext`): the value and its changes are conveyed by JAWS, NVDA, VoiceOver iOS and macOS; Narrator 1903 conveyed neither; TalkBack 7.3 + Chrome 77 read a percentage ("54%") and did not announce changes (2019). a11ysupport.io has no expectations for `aria-valuetext` yet.
- No published test covers `aria-valuetext` on a native range input specifically: a gap the measured mapping fills for Windows.

### What NVDA does (source)

- `NVDAObjects/__init__.py`, `event_valueChange`: `if self is api.getFocusObject(): speech.speakObjectProperties(self, value=True, reason=...CHANGE)`; the value of an IAccessible object is `accValue`, which both engines set to `aria-valuetext`.
- `IAccessibleHandler/orderedWinEventLimiter.py`: "Only allow one event for one specific object at a time: though push it further forward in time if a duplicate tries to get added." The two `EVENT_OBJECT_VALUECHANGE` events a key step produces (native change, then the `aria-valuetext` update in the next task) are merged into one when they arrive in the same cycle, and the value is read when the event is processed.

### Proposed verdict: spec correct

`aria-valuetext` on a native range input is the value string every Windows accessibility API reports in Chromium and Firefox, at focus and after each step, including on the non-linear Handle whose numeric value is the Bar position (measured); WebKit and Chromium on Android pass it to VoiceOver and TalkBack (source); JAWS, NVDA, and VoiceOver convey `aria-valuetext` on sliders (ARIA-AT). The spec's rule to bind it always on non-linear Handles is what keeps TalkBack from reading a percentage of the Bar position (Chromium source).

Testing Decisions line (layer 4, release test, manual): "Before each release, with NVDA and JAWS on Chrome and Firefox, VoiceOver on macOS and iOS, and TalkBack on Chrome, on `slider--step` and the non-linear story: focus and each arrow, Page, Home, and End step announce the `displayWith` text (on the non-linear Handle, the value, never the Bar position or a percentage), and the announced text is the new value after the step, not the previous one. The automated layers assert the `aria-valuetext` attribute after each step, not CDP's `valuetext` property."

---

## Check 12: Orbit

The README asks: "the toggled `aria-live`, the "carousel" and "slide" role descriptions (including whether a tab-panel slide reads better with the "slide" role description, which the APG's tabbed example sets and its pattern text omits), slides entering and leaving `inert`, and the focus handoff to a newly selected slide." Sources: [Spec: Orbit](../issues/33-spec-orbit.md), OPEN FOR HUMAN 2, and [Re-run: Orbit spec, the slide's ARIA contract and the focus handoff](../issues/70-rerun-orbit-slide-contract-and-focus-handoff.md).

### What the spec renders

From [specs/orbit.md](../specs/orbit.md), ARIA and keyboard:

| Element | Rendered semantics | Owner | Source |
| --- | --- | --- | --- |
| Root `.orbit` | `role="region"` (or `group`), `aria-roledescription="carousel"`, `aria-label` or `aria-labelledby` without the word "carousel" | Consumer markup | APG carousel |
| Rotation control | Native `button`, first focusable element inside the root; label toggles "Stop automatic slide show" / "Start automatic slide show"; no `aria-pressed`; `aria-controls` the container | Directive plus consumer text | APG |
| Container | `aria-live="off"` while rotating, `polite` otherwise; `aria-atomic="false"`; `tabindex="-1"` | Directive | APG |
| Slide | `role="tabpanel"`, `aria-roledescription="slide"`, `aria-labelledby` its bullet, `tabindex="0"` when shown and `-1` otherwise, `inert` when not shown (once live) | `NfsOrbitSlide`; `aria-roledescription` consumer markup | APG tabbed example (D22) |
| Bullets | `role="tablist"`, `aria-label` | Aria | APG tabbed example |
| Bullet | `role="tab"`, `aria-selected`, `aria-controls` its slide, roving `tabindex`, named by `.show-for-sr` text such as "Slide 2: Lots of green space." | Aria | APG Tabs |

Rendered HTML: the server HTML has no `inert`; after the first render callback "the two unselected slides gain `inert="true"`"; "After the user presses "next": `.is-active` and `tabindex="0"` move to the second slide, `inert` moves to the first and third"; "After ArrowRight on the focused first slide: ... one change-detection pass moves `.is-active` and `tabindex="0"` to the second slide, removes its `inert`, and adds `inert` to the first; then the handoff's `write` phase focuses the second slide (mechanic 8)."

### Reproduction

`orbit.html`: the hydrated markup of the Rendered HTML with four slides (inline SVG images with `alt`, captions), the scroll-snap layout rules from `nfs-orbit`, and a script that, in one later task, writes what a change-detection pass writes (`.is-active`, `tabindex`, `inert` on unselected slides, `aria-selected`, the bullet tab stop, `aria-live` from the rotation state, the rotation label), scrolls the container, and performs the focus handoff when focus was inside the slide that loses the selection. Steps (`check12-orbit.mjs`): 0 rotating, focus outside; 1 a rotation tick; 2 Tab to the Rotation control; 3 Enter (rotation stops); 4 Tab to Next, Enter; 5 Tab to the visible slide; 6 ArrowRight on the focused slide (handoff); 7 Tab to the selected bullet, ArrowRight.

### Measured exposure

Role descriptions and names (step 5, both engines; IAccessible2 read from the MSAA tree):

| Object | Chromium 153 | Firefox 155 |
| --- | --- | --- |
| Root | UIA `Group lct="carousel" name="Favorite space pictures" landmark=region`; MSAA role 16 (pane), IA2 role 1069 (landmark), `xml-roles:region;roledescription:carousel` | UIA localized control type is the Danish word for "region" (the role description is not used); MSAA role 20 (grouping), IA2 role 1069, `xml-roles:region;roledescription:carousel` |
| Visible slide | UIA `Pane lct="slide" name="Slide 3: Encapsulating the universe." FOCUSED`; MSAA role 38 (property page), `xml-roles:tabpanel;roledescription:slide;container-live:polite` | UIA `Pane lct="fanepanel"` (Danish for "tab panel") with the same name; MSAA role 38, `xml-roles:tabpanel;roledescription:slide;container-live:polite` |
| Unselected slides | Not in the UIA tree (`slide-0`, `slide-1`, `slide-3`), not in the CDP tree | Not in the UIA tree |
| Bullets | UIA `Tab name="Choose slide to display"`, items `TabItem name="Slide N: ..." pos=N/4 selected=...` | Same |

`aria-live` toggling:

```
Rotating (aria-live off), step 1 rotation tick, focus outside:
Chromium  WE IA2_TEXT_REMOVED / IA2_TEXT_INSERTED role=grouping ia2attrs{live:off;...;container-live:off}   (no UIA live-region event)
Firefox   WE IA2_TEXT_REMOVED / IA2_TEXT_INSERTED role=grouping ia2attrs{live:off;container-live:off}
Rotation stopped, step 3:
Chromium  PROP LiveSetting=1 on Group id=oc
Firefox   WE IA2_OBJECT_ATTRIBUTE_CHANGED role=grouping ia2attrs{live:polite;container-live:polite}
aria-live polite, step 4 (Next):
Chromium  LIVE_REGION_CHANGED Group id=oc live=polite ; WE IA2_TEXT_INSERTED role=grouping ...container-live:polite ; WE OBJ_LIVEREGIONCHANGED
Firefox   LIVE_REGION_CHANGED Group id=oc live=polite (x2) ; WE IA2_TEXT_INSERTED role=grouping ...container-live:polite
```

Focus handoff (step 6, ArrowRight on the focused slide 3):

```
Chromium  LIVE_REGION_CHANGED Group id=oc live=polite
          FOCUS Pane lct="slide" name="Slide 4: Outta this world." FOCUSED
          WE IA2_TEXT_INSERTED role=grouping ...container-live:polite
          WE OBJ_FOCUS role=propertypage name="Slide 4: Outta this world." states=focused|focusable
               ia2attrs{xml-roles:tabpanel;roledescription:slide;...;container-live:polite}
          WE OBJ_SHOW role=propertypage name="Slide 4: Outta this world."
          WE OBJ_SELECTION role=pagetab name="Slide 4: Outta this world."
Firefox   LIVE_REGION_CHANGED (x2) ; WE OBJ_SHOW role=propertypage name="Slide 4: Outta this world." ; FOCUS Pane name="Slide 4: ..."
          WE IA2_TEXT_INSERTED role=grouping ...container-live:polite ; WE OBJ_FOCUS role=propertypage ... roledescription:slide
```

Focus never passes through the document or `body`: the only focus event is on the new slide. Step 7 (bullet ArrowRight): `FOCUS TabItem name="Slide 1: Space, the final frontier." selected=True`, with the live-region insertion of slide 1 in the same tick (the APG's intended behaviour for tabs).

### Mappings

| Feature | Mapping |
| --- | --- |
| `region` with a name | Core-AAM `#role-map-region`: `IA2_ROLE_LANDMARK`, `xml-roles:region`; UIA Group, localized control type "region", landmark Custom |
| `tabpanel` | `ROLE_SYSTEM_PANE` or `ROLE_SYSTEM_PROPERTYPAGE` (both engines use property page); UIA Pane |
| `tab` / `tablist` | `ROLE_SYSTEM_PAGETAB` / `ROLE_SYSTEM_PAGETABLIST`; UIA TabItem / Tab with Selection |
| `aria-roledescription` | IAccessible2 `localizedExtendedRole()` (both engines also expose the `roledescription` object attribute); UIA "Localized Control Type: `<value>`" (Chromium follows; Firefox does not); AX API `AXRoleDescription`. WAI-ARIA 1.2: a global attribute; the APG pattern says the label should not repeat the role description word |
| `aria-live` | `live`, `container-live` object attributes on the region and descendants; UIA `LiveSetting`; text inserted in a live region: `IA2_EVENT_TEXT_INSERTED`, UIA live-region changed |
| `inert` | HTML-AAM: not exposed (measured: absent from both platform trees) |

### Published support data

- a11ysupport.io "aria-roledescription attribute with HTML section" (2018-11-12 to 2021-08-07): the role description is conveyed by JAWS 2021.2107 + Chrome/Edge ("custom section role"), NVDA 2021.1 + Chrome/Edge, NVDA 2019.2 + Firefox 76, VoiceOver macOS 10.14.6, Orca; not by JAWS 2019 + Firefox 69, TalkBack 7.3, or VoiceOver iOS 12.4.1 (older results).
- a11ysupport.io "HTML inert attribute test" (`inert.json`, 2023-07-08): inert content is removed from the reading order and made non-interactive in every combination tested (JAWS 2023.2306 with Chrome, Edge, Firefox; NVDA 2023.1 with the same; Narrator; TalkBack 13.5; VoiceOver iOS 16.5.1 and macOS 13.4.1; Orca).
- a11ysupport.io "aria-live test" (2020-02-05 to 2022-11-04): polite regions are announced by JAWS 2023.2210, NVDA 2022.3.1, Narrator, TalkBack 13.5, VoiceOver iOS 16.1, Orca; VoiceOver macOS 13.0 announces them but interrupts ("convey polite": none). `off` is honoured by all.
- ARIA-AT "Tabs with Manual Activation" (candidate, test plan version 163664): "[MUST] Name of the tab panel, 'Peter Muller', is conveyed" (name from `aria-labelledby`) passes 2 of 3 for JAWS >= 2025.2508.120 + Chrome (2025-10-30) and NVDA >= 2025.2 + Chrome (2025-10-22), 1 of 2 for VoiceOver >= 15.0 + Safari (2025-11-03).
- ARIA-AT has no carousel test plan; the APG carousel examples carry no support table.
- APG tabbed example (`content/patterns/carousel/examples/carousel-2-tablist.html`): slides are `role="tabpanel" aria-roledescription="slide" aria-label="1 of 6"`, tabs `aria-label="Slide 1"`; its live-region row says polite "causes screen readers to automatically announce the content of a slide when its associated tab is activated", and its script sets `aria-live="polite"` when a tab receives focus (`handleTabFocus`).

### What NVDA does (source)

- `NVDAObjects/IAccessible/ia2Web.py`, `_get_roleText`: "`roleText = self.IA2Attributes.get("roledescription")`", used in place of the role name. Without it, the slide's MSAA role 38 maps to `controlTypes.Role.PROPERTYPAGE` (`IAccessibleHandler/__init__.py`), spoken "property page" (`controlTypes/role.py`). So a focused slide reads "Slide 3: Encapsulating the universe., slide" with the role description and "..., property page" without it (derived from source).
- `nvdaHelper/remote/ia2LiveRegions.cpp`: text inserted into a container whose `container-live` is `off` is ignored; with `polite` it is reported at normal priority. The rotation's changes are silent; manual changes while rotation is off are announced.
- The handoff's focus event is spoken first (focus speech); the live-region text of the inserted slide (its image `alt` and caption) follows at normal priority.

### Proposed verdict: spec correct

Every property the APG tabbed carousel prescribes reaches the platform trees as specified (measured); the role descriptions are honoured by NVDA, JAWS, and VoiceOver on macOS (a11ysupport.io) and NVDA uses them as the spoken role (source); `inert` slides are out of the trees in both engines and out of every screen reader's reading order (measured; a11ysupport.io 2023); the live region is silent while rotating and announces manual changes when stopped (measured events; NVDA source); the handoff lands focus on the new slide with its name and role description and never on `body` (measured). A tab-panel slide reads better with `aria-roledescription="slide"` than without, because NVDA's alternative is "property page" (source); D22 stands.

Two limits the judge may note without a spec change: Firefox's UIA ignores the role description (only Narrator with Firefox is affected), and VoiceOver on iOS and TalkBack do not convey role descriptions (a11ysupport.io), so they say "tab panel". Optional wording change, not a defect: because the slide is named by its bullet ("Slide 3: ...") and described as "slide", NVDA says "slide" twice; the APG example avoids that by naming slides "3 of 6". Changing it would mean the slide stops being named by its tab, which the Tabs pattern prefers; the default is kept.

Testing Decisions line (layer 4, release test, manual): "Before each release, with NVDA and JAWS on Chrome and Firefox, VoiceOver on macOS and iOS, and TalkBack, on `orbit--autoplay` and `orbit--default`: while rotating, slide changes produce no speech; after the Rotation control stops rotation, Next and the bullets announce the new slide's content; the carousel is announced with its label and "carousel", a focused slide with its name and "slide"; ArrowRight on a focused slide moves focus to the new slide and announces it; slides out of view are never read. The automated layers assert the `inert` attribute and `aria-live` value, not Playwright role queries, which include `inert` slides."

Correction (2026-09-27, from [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)): the handoff's focus speech carries no slide content. NVDA reports an object's text content in focus speech only for objects with navigable text, which a tab panel or property page is not (`speech/speech.py`, `getObjectSpeech`, and `NVDAObjects/__init__.py`, `_get__hasNavigableText`, at `release-2026.2`), so focus speech is the slide's name and "slide", and the content is announced once, from the live region. Erratum (audit 0006 L15): the release test's `orbit--default` should read `orbit--basics`, the story's actual id.

---

## Check 13: Magellan

The README asks: "how the Current section's link reads with `aria-current="true"`, and silence while `aria-current` moves during scrolling." Source: [Spec: Magellan](../issues/30-spec-magellan.md), OPEN FOR HUMAN 1 (NVDA, JAWS, VoiceOver; `true`, with `location` for comparison).

### What the spec renders

From [specs/magellan.md](../specs/magellan.md), ARIA and keyboard:

| Element or state | Rendered semantics | Source |
| --- | --- | --- |
| Navigation | The consumer's `nav` (implicit `navigation` landmark) with `aria-label` (for example "On this page") whenever the page has another `nav` | APG landmark practice |
| Links | Native `a[href]`, role `link`; Magellan adds nothing but the current marker | APG Link pattern |
| Current section's link | `aria-current="true"` (or the `ariaCurrentWhenActive` token), on every link of that section, removed from all others; absent above the first section and in server HTML | WAI-ARIA `aria-current` |
| Announcements | None. `aria-current` changes during scrolling are not announced by screen readers and need not be | Material sort accessibility note; AT confirmation is a human check (ticket) |

Rendered HTML, reader in the second section: `<li class="is-active"><a href="#second" class="is-active" aria-current="true">Second Arrival</a></li>`.

### Reproduction

`magellan.html`: Foundation's docs example (sticky `nav aria-label="On this page"`, `ul.menu.expanded`, three tall sections, `scroll-padding-top`), with a script that marks the Current section's link and `li` exactly as the spec does, from the Activation line on scroll; `?token=location` sets the token. Steps (`check13-magellan.mjs`): 0 focus a link above the sections; 1 scroll to the second section; 2 scroll to the third; 3 focus "Third Arrival" (`preventScroll`); 4 scroll to the first section with focus on "Third Arrival"; 5 focus "First Arrival".

### Measured exposure

```
Chromium 153
STEP 1 (focus on the link above)  WE IA2_OBJECT_ATTRIBUTE_CHANGED role=link name="First Arrival"
                                  WE IA2_OBJECT_ATTRIBUTE_CHANGED role=link name="Second Arrival" ia2attrs{current:true}
STEP 2                            the same pair for Second (removed) and Third (current:true)
STEP 3                            FOCUS Hyperlink name="Third Arrival" ariaProps="current=true"
                                  WE OBJ_FOCUS role=link name="Third Arrival" states=focused|focusable|linked ia2attrs{current:true}
STEP 4 (focus on Third Arrival)   IA2_OBJECT_ATTRIBUTE_CHANGED name="First Arrival" ia2attrs{current:true}
                                  IA2_OBJECT_ATTRIBUTE_CHANGED name="Third Arrival" states=focused|... (current removed)
STEP 5                            FOCUS Hyperlink name="First Arrival" ariaProps="current=true"
Firefox 155: each move also fires WE OBJ_STATECHANGE on both links before the attribute change; focus events as Chromium.
```

No focus, alert, live-region, name, or description event is fired by a move in either engine. MSAA on the current link (Chromium, step 3): role 30 (link), `ia2attrs{...current:true;class:is-active...}`; UIA `AriaProperties current=true` (Chromium and Firefox). With `?token=location`: UIA `ariaProps="current=location"` in both engines. WebKit: Playwright's ARIA snapshot does not print `aria-current`; Core-AAM maps it to `AXARIACurrent`.

### Mappings

| Feature | Mapping |
| --- | --- |
| `aria-current` (non-`false`) | Core-AAM `#ariaCurrent`: IA2 object attribute `current:<value>`; UIA `AriaProperties.current: <value>`; ATK `current:<value>` and `STATE_ACTIVE`; AX API `AXARIACurrent: <value>`. WAI-ARIA 1.2: global; `true` "Represents the current item within a set"; `location` "Represents the current location within an environment or context"; unknown values are treated as `true` |
| Attribute change | Core-AAM gives no event for `aria-current` changes; Chromium fires `IA2_EVENT_OBJECT_ATTRIBUTE_CHANGED`, Firefox also `EVENT_OBJECT_STATECHANGE` (measured) |

### Published support data

- a11ysupport.io "aria-current attribute" (`aria-current.json`, 2019-03-29 to 2021-11-19): the `true` value is conveyed as "current" by JAWS 2020.2006 + Chrome 84 ("bullet, visited, current, link, apples"), JAWS 2021.2105 + Edge 91, JAWS 2018 + Firefox 66, NVDA 2021.1 + Chrome and Edge ("list with 3 items, bullet, visited link, current, Apples"), NVDA 2019 + Firefox 66, VoiceOver iOS 12.2 and macOS 10.14.4 ("current"), and TalkBack 12.1 + Chrome 96 ("current item"); not by Narrator (Windows 10 1809) or Orca. `location` is read "current location" by the same set.
- a11ysupport.io "aria-current change test" (`aria-current-change.json`, 2023-03-04): when `aria-current="page"` is added to the link that has focus (activated with Enter), NVDA 2023.1 (Chrome, Edge, Firefox) says "current page" and VoiceOver iOS 16.4 "about (target) current page link"; JAWS 2023.2302, Narrator, TalkBack 13.5, VoiceOver macOS 13.2.1, and Orca say nothing. The test covers the focused link only.
- ARIA-AT "Disclosure Navigation Menu Example", "[MUST] State of the link, 'current page' is conveyed": JAWS 5/5 and 4/4, NVDA 6/6, VoiceOver 3 of 4 in both reports (the failure lands on a heading instead of the link).
- No published test covers `aria-current` moving on links that do not have focus: a gap the measured events and NVDA's source fill.

### What NVDA does (source)

- `NVDAObjects/IAccessible/ia2Web.py`, `event_IA2AttributeChange`: "`if self is api.getFocusObject(): # Report aria-current if it changed.`" Changes on links without focus are not spoken.
- `NVDAObjects/__init__.py`, `event_stateChange`: speaks only for the focus object or its ancestors (Firefox's state-change events on links without focus are not spoken).
- `controlTypes/isCurrent.py`: `true` is "current", `location` "current location", `page` "current page", `step` "current step"; `speech.getPropertiesSpeech` appends it when not `false`.
- One case speaks during scrolling: if the link that has focus becomes current (focus rests on a navigation link while the reader scrolls with the wheel), NVDA says "current". Link activation moves focus into the section (Smooth Scroll), so after Enter the link does not hold focus.

### Proposed verdict: spec correct

The Current section's link exposes `aria-current="true"` in every platform API (measured) and is read "current" by JAWS, NVDA, VoiceOver, and TalkBack (a11ysupport.io; NVDA source); moving the marker during scrolling fires only attribute and state changes on links without focus (measured), which NVDA does not speak (source) and which JAWS, TalkBack, and VoiceOver on macOS do not announce even for the focused link (a11ysupport.io 2023). `location` would read "current location"; the spec's configurable token covers it and `true` stays the default.

Testing Decisions line (layer 4, release test, manual): "Before each release, with NVDA and JAWS on Chrome and Firefox and VoiceOver on macOS and iOS, on `magellan--menu`: reading the page and scrolling through the sections produces no speech from the navigation; tabbing to the Current section's link reads it as current, and the other links without it."

Correction (2026-09-27, from [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)): the verdict summary, here and in the table at the top, omits that the change is announced on a focused link: when the link that holds focus gains `aria-current`, NVDA 2023.1 says "current page" and VoiceOver iOS 16.4 "current page link" (a11ysupport.io change test), and NVDA's source speaks it for the focus object (the fourth bullet under What NVDA does). A keyboard user who tabs to a Magellan link and then scrolls by wheel or scrollbar hears "current" when that section becomes current; the Magellan spec's ARIA table now says so.

Correction (2026-09-27, audit 0006 L8): the change test above sets `aria-current="page"`, so its "current page" is the `page` token's phrase. Magellan renders `true` by default, which this file's `aria-current` attribute results record as "current" for VoiceOver on iOS, and which NVDA's `controlTypes/isCurrent.py` maps to "current". The Magellan spec now expects VoiceOver on iOS to say "current" for its focused link.

---

## Gaps and limits of this evidence

- No speech output was captured. Every "announces" or "silent" statement for NVDA is derived from its source at `release-2026.2` applied to the measured event streams; for JAWS, VoiceOver, TalkBack, and Narrator it rests on the published data cited, some of it from 2019 to 2023.
- WebKit's platform tree was not measured (no accessibility API on Windows); WebKit statements come from its source at the pinned commit.
- The NVDA with Chrome double path for alerts (check 10) and the two `EVENT_OBJECT_VALUECHANGE` events per slider step (check 11) are the two places where the source reading cannot say what the listener hears; both are in the release-test lines.
- Pages are emulations of the specs' rendered DOM and state order, not the library; the timing of the Drilldown focus move (check 9) and the Orbit handoff (check 12) was reproduced as the specs describe (one task), and the Drilldown frames variant shows what happens if an implementation misses that.
