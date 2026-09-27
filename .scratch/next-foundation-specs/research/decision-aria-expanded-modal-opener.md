# Evidence dossier: `aria-expanded` on a modal dialog's opener

Decision ticket: [Decide: `aria-expanded` on a modal dialog's opener](../issues/72-decide-aria-expanded-on-modal-opener.md). Compiled 2026-09-26 for the open-decision panel (map, "Open-decision pass"). This file collects facts; it states no recommendation.

Citation keys used below:

| Key | Source | Version or date |
| --- | --- | --- |
| ARIA13 | WAI-ARIA 1.3 Editor's Draft, local clone `d:/projects/github/w3c/aria`, `index.html` (line numbers) | commit `ffa9651`, 2026-09-24 |
| ARIA12 | WAI-ARIA 1.2 W3C Recommendation, https://www.w3.org/TR/wai-aria-1.2/ (fetched with curl 2026-09-26; line numbers of the fetched HTML) | Recommendation 2023-06-06 |
| APG | WAI-ARIA Authoring Practices, local clone `d:/projects/github/w3c/aria-practices`, `content/` | commit `3f094fd`, 2026-09-15 |
| HTMLAAM | HTML Accessibility API Mappings, https://w3c.github.io/html-aam/ (curl 2026-09-26) | Editor's Draft 2026-07-29 |
| HTMLARIA | ARIA in HTML, https://w3c.github.io/html-aria/ (curl 2026-09-26) | Editor's Draft, Last-Modified 2026-09-03 |
| WHATWG | HTML Living Standard, https://html.spec.whatwg.org/multipage/ (curl 2026-09-26) | as fetched |
| WCAG22 | WCAG 2.2, https://www.w3.org/TR/WCAG22/ (curl 2026-09-26) | Recommendation 2024-12-12 |
| FS | Foundation for Sites clone `d:/projects/github/foundation/foundation-sites`; `git diff --stat v6.9.0 HEAD` over the three plugin files and the two docs pages is empty, so HEAD line numbers equal v6.9.0 | HEAD `337be7a` |
| NGC | angular/components clone `d:/projects/github/angular/components`, branch 22.2.x | HEAD `708d4c6`, 2026-09-25 |
| NG | angular/angular clone `d:/projects/github/angular/angular`, branch 22.2.x | HEAD `5db6fc4`, 2026-09-25 |
| WF | `web-features` npm package `data.json` (https://cdn.jsdelivr.net/npm/web-features@3.40.0/data.json) | 3.40.0 |
| EXP | This dossier's experiment under `D:/tmp/nfs-decision-aria-expanded/` (section 2.4); decisive files captured at [prototypes/modal-opener-aria/](../prototypes/modal-opener-aria/README.md) | run 2026-09-26 |

## 1. The decision

### 1.1 The question, stated neutrally

When a Trigger (`nfsOpen`, `nfsToggle`) opens an Openable that is a modal dialog, does the Trigger render `aria-expanded`? The Trigger role union is part of the public `NfsOpenable` interface that every Openable implements and that consumers may implement ([Spec: Triggers (shared utility)](../issues/54-spec-triggers.md), Triage item 1; `specs/triggers.md:126-136`).

The modal cases in the specs as written:

| Openable and configuration | Modality in its spec | Element and mechanism | Trigger role today |
| --- | --- | --- | --- |
| Reveal, `overlay: true` (default) | Modal | `<dialog>` opened with `showModal()`; page inert by the platform; no `aria-modal` (`specs/reveal.md:181`, `:297`, `:302`) | `dialog` (`specs/reveal.md:153`, `:208`) |
| Reveal, `overlay: false` | Non-modal | `<dialog>` opened with `show()`; Light dismiss (`specs/reveal.md:181`, `:139`) | `dialog` |
| Off-canvas in Modal mode (`trapFocus` and an overlay) | Modal | Not a `<dialog>` (ADR 0030); `role="dialog"`, `aria-modal="true"`, `inert` on the content "once focus is inside the panel", CDK `FocusTrap` (`specs/off-canvas.md:207`, `:224`) | `dialog` (`specs/off-canvas.md:169`, `:204`) |
| Off-canvas, every other configuration | Disclosure | (`specs/off-canvas.md:19`) | `disclosure` |
| Dropdown pane, `role="dialog"`, with or without `trapFocus` | Non-modal: "no `aria-modal`, trapped or not" (`specs/dropdown.md:287`, `:293`) | Anchored pane; page not inert; `trapFocus` wraps Tab with CDK `FocusTrap` (`specs/dropdown.md:216`, `:299`) | `dialog` (`specs/dropdown.md:205`, `:218`) |

Scope fact the panel needs: the ticket's Question lists "a Dropdown pane with `role="dialog"` and `trapFocus`" among modal openers, while the Dropdown spec defines that pane as a non-modal dialog with no `aria-modal` and no inert page (`specs/dropdown.md:287`, `:293`, `:514`). Under every option below, whether that pane counts as modal decides whether its Trigger changes.

### 1.2 Current default

One `dialog` Trigger role for every dialog opener, modal or not. `nfsOpen` and `nfsToggle` render `aria-haspopup="dialog"`, `aria-controls` (the target ids), and `aria-expanded` (`"true"`/`"false"` from `isOpen`); `nfsClose` renders nothing (`specs/triggers.md:220-230`, design decision D7 at `:403`). Recorded as OPEN FOR HUMAN 1 in the Triggers ticket (`issues/54-spec-triggers.md:97`), building-blocks Part 4 OPEN FOR HUMAN item 1 (`building-blocks.md:335`), and README trap-quadrant item 1 (`README.md:149`).

### 1.3 Options

- **A. Status quo.** `dialog` renders `aria-haspopup="dialog"`, `aria-controls`, `aria-expanded` on every dialog opener.
- **B. Modal openers omit `aria-expanded`; non-modal dialog openers keep it.** Modal openers render `aria-haspopup="dialog"` and `aria-controls`. Two ways to carry modality, both named in the ticket:
  - **B1.** A fifth union value (for example `'modal-dialog'`), so `NfsTriggerRole = 'disclosure' | 'dialog' | 'modal-dialog' | 'toggle-button' | 'none'`.
  - **B2.** The union stays four values; the contract gains a modality signal (for example an optional `modal?: Signal<boolean>` on `NfsOpenable`) that the Trigger reads when the role is `dialog`.
- **C. (suggested by sources, not in the ticket) Modal openers omit both `aria-expanded` and `aria-controls`; keep `aria-haspopup="dialog"`.** Basis: the HTML-AAM mapping for `command="show-modal"` adds no mapping at all (2.1.4), the Open UI Invoker Commands explainer rejects `aria-controls` and `aria-expanded` for modal invokers (2.8.7), and the effort's APG research notes "`aria-controls` on the opener is not part of the pattern" (`research/aria-apg-patterns.md:375`). Needs B1 or B2 to carry modality.
- **D. (suggested by sources, not in the ticket) Modal openers render nothing extra (a plain button).** Basis: every APG modal dialog example's opener (2.2.2), the HTML-AAM `show-modal` mapping (2.1.4), and several design systems (2.7). Can be expressed without any contract change by having a modal Openable report the existing `'none'` role (which renders nothing, `specs/triggers.md:225`, `:231`), or through B1/B2.
- **E. (suggested by one design system, outside the ticket's question) Dialog openers keep `aria-expanded` and drop `aria-haspopup`.** React Aria's `useOverlayTrigger` renders `aria-expanded` (always) and `aria-controls` (while open) and omits `aria-haspopup` for dialogs (2.7). Listed for completeness because it changes the other attribute of the same role.

## 2. Facts

### 2.1 Normative specifications

1. `aria-expanded` definition. ARIA13: "Indicates whether a related element is expanded (shown) or collapsed (hidden)"; "applied to a focusable, interactive element that toggles visibility of content of a different element"; the relationship is identified "using `aria-controls`" (ARIA13 `index.html:13741-13750`). Values: `false` "The grouping element this element controls or is the accessibility parent of is collapsed", `true` "... is expanded", `undefined` (default) "The element does not own or control a grouping element that is expandable" (ARIA13 `:13815-13823`). ARIA12 wording: "Indicates whether a grouping element owned or controlled by this element is expanded or collapsed" and the same three values with "owns or controls" (ARIA12 fetched HTML `:11476`, `:11536-11544`). Neither version defines "grouping element" as a term (`rg '<dfn[^>]*>[^<]*group' index.html` returns nothing) and neither mentions dialogs, modality, or inertness in this definition.
2. `aria-haspopup`. "Indicates the availability and type of interactive popup element, such as menu or dialog"; authors MUST make the popup container's role one of menu, listbox, tree, grid, dialog and match the value; `true` equals `menu`; "A tooltip is not considered to be a popup"; note: "most relevant to use when there is a visual indicator ... If there is no visual indication that an element will trigger a popup, authors are advised to consider whether use of `aria-haspopup` is necessary, and avoid using it when it's not"; deprecated as a global in 1.2 (ARIA13 `:13953-13976`, `dialog` value `:14049`; ARIA12 `:11631-11700` same text). The definition's Related Concepts lists `aria-controls` only; it says nothing about `aria-expanded` (ARIA12 fetched text; ARIA13 `:13993-13995`).
3. Roles. `button` supports `aria-haspopup`, `aria-expanded`, `aria-pressed` (ARIA13 `:2141-2148`). `combobox` REQUIRES `aria-expanded`: "Authors MUST set `aria-expanded` to `true` on an element with role `combobox` when it is expanded and `false` when it is collapsed" (ARIA13 `:2811`, required list `:2921-2923`). `dialog`: "A dialog that is designed to interrupt workflow and prevent users from interacting with the primary web application is usually modal"; "In lieu of using robust host language features for marking content of the primary web application as inert, authors SHOULD use the `aria-modal` attribute" (ARIA13 `:3620-3634`). `aria-modal`: "authors SHOULD mark all other contents as inert (such as 'inert subtrees' in HTML)" (ARIA13 `:14601-14616`).
4. HTML-AAM (HTMLAAM, sections 3.6.25-3.6.27, 3.6.109): a `button` whose `command` is in the Toggle/Show/Hide popover states maps `aria-expanded` to the popover's shown state; "A `command` attribute in the close and show-modal states provide no additional accessibility mappings to the button element" (MSAA, UIA, ATK, AX: "Not mapped"); `popovertarget` maps `aria-expanded` true/false, and none "If the associated element is not a valid `popover` element" (fetched HTML `:9540-9760`, `:13953-13983`). Change log: "2-April-2025: Add `command` and `commandfor` attribute mappings. See GitHub ARIA PR 2354" (`:17176`).
5. HTML inertness (WHATWG `interaction.html`, 6.3): "Inert nodes generally cannot be focused, and user agents do not expose the inert nodes to accessibility APIs or assistive technologies"; 6.3.1: while "A Document document is blocked by a modal dialog subject", "every node that is connected to document, with the exception of the subject element and its flat tree descendants, must become inert". The spec's own `command="show-modal"` example button carries no ARIA (WHATWG `interactive-elements.html`, the `commandfor` example: `<button type=button commandfor="the-dialog" command="show-modal">Delete</button>`).
6. WCAG 2.2 SC 4.1.2 Name, Role, Value (Level A): "For all user interface components ..., the name and role can be programmatically determined; states, properties, and values that can be set by the user can be programmatically set; and notification of changes to these items is available to user agents, including assistive technologies." Glossary "state": "dynamic property expressing characteristics of a user interface component that may change in response to user action or automated processes" (WCAG22 fetched HTML, SC 4.1.2 and glossary). The normative text names no ARIA attribute.

### 2.2 The APG and ARIA in HTML

1. Dialog (Modal) pattern (`APG/patterns/dialog-modal/dialog-modal-pattern.html`): its "WAI-ARIA Roles, States, and Properties" section lists only the dialog container's `role`, `aria-modal`, `aria-labelledby`/`aria-label`, `aria-describedby`; it says nothing about the opener's attributes. On close, "focus returns to the element that invoked the dialog". Note on `aria-modal`: "mark a dialog modal only when both: Application code prevents all users from interacting in any way with content outside of it. Visual styling obscures the content outside of it."
2. The pattern's two examples: every opener is a plain `<button type="button">` with no `aria-haspopup`, `aria-expanded`, or `aria-controls` (`dialog-modal/examples/dialog.html:52`, `:91`, `:144`; `datepicker-dialog.html:62`, whose script changes only the button's `aria-label`, `js/datepicker-dialog.js:466-474`). `rg 'aria-expanded|aria-haspopup|aria-controls'` over `patterns/dialog-modal` and `patterns/alertdialog` returns no match. All their dialogs carry `aria-modal="true"` (`dialog.html:54`, `:98`, `:150`, `:162`; `datepicker-dialog.html:68`; `alertdialog.html:86`).
3. The one APG example whose opener carries `aria-haspopup="dialog"` and `aria-expanded` opens a modal dialog: the Date Picker Combobox. `input role="combobox" aria-expanded="false" aria-haspopup="dialog" aria-controls="cb-dialog-1"` (`combobox/examples/combobox-datepicker.html:64`) opens `div role="dialog" aria-modal="true"` (`:76`); its attribute table documents `aria-expanded` false/true "i.e., the 'Choose Date' dialog is (not) displayed" (`:459-471`); the script flips it (`js/combobox-datepicker.js:234`, `:253`). The opener there is a `combobox`, for which ARIA requires `aria-expanded` (2.1.3).
4. No APG example contains a non-modal dialog: `rg 'role="dialog"'` over the APG content finds six dialogs, all with `aria-modal="true"` (the files in items 2 and 3).
5. Disclosure pattern: "When the content is visible, the element with role button has `aria-expanded` set to `true`. When the content area is hidden, it is set to `false`"; `aria-controls` optional (`disclosure/disclosure-pattern.html:56-60`). Menu Button pattern: `aria-haspopup` `menu` or `true`; `aria-expanded` `true` when displayed, `false` when hidden (`menu-button/menu-button-pattern.html:58-61`).
6. APG issue tracker (read-only `gh api`): w3c/aria-practices#1130 "Clarify usage of aria-haspopup and aria-expanded for elements that trigger dialogs" proposes that dialog triggers carry `aria-haspopup=dialog` and "use aria-expanded to reflect whether the dialog is showing"; open since 2019-08-14 with zero comments. #1033 "Should we add aria-haspopup to he modal trigger?" (open, 2019); carmacleod: "I think it should. Otherwise, AT users might be confused by the change of context" (2019-05-22). #1383 "Should the button to open the dialog have aria-haspopup="dialog"" (open, 2020): sinabahram (2020-04-18) reported JAWS and NVDA announcing menu semantics; Adriani90 (2023-05-05): NVDA alpha reports it properly; kentr (2025-07-09): JAWS fixed, VoiceOver and Narrator announce correctly. #1495 (closed 2023-08-01) asked why the date picker dialog example omits `aria-haspopup=dialog`; the example at the clone's commit still omits it (2.2.2). #1926 (open): mcking65 (2021-06-01): "Short answer: NO" to "should all popup use cases have aria-haspopup", linking his w3c/aria#1024 comment. #3286 (closed 2025): mcking65 (2025-06-10) for an inline calendar: "remove aria-haspopup since this is inline ... To show/hide content inline, use the disclosure pattern."
7. ARIA in HTML (HTMLARIA): `button` allows global `aria-*` and any attribute applicable to its allowed roles, which include `aria-expanded` and `aria-haspopup` (the `el-button` row, fetched HTML `:747-790`); `dialog` allows `alertdialog` and "any `aria-*` attributes applicable to the `dialog` role" (`:982-1000`). No rule addresses `aria-expanded` on an element that opens a dialog, `popovertarget`, or `commandfor` (`rg -i 'popovertarget|commandfor|aria-expanded'` over the rendered text returns only an unrelated `list` input rule).

### 2.3 Browser support and Baseline

`aria-expanded` and `aria-haspopup` have no `web-features` entry (WF: no feature id contains "expanded" or "haspopup"). The platform features the options touch, from WF `status` (low date = newly available, high date = widely available), against the Browser target (Baseline widely available on 2026-05-07; map "Browser support"):

| Feature (WF id) | Low date | High date | Widely available on 2026-05-07 | Widely available today (2026-09-26) | Support |
| --- | --- | --- | --- | --- | --- |
| `<dialog>` (`dialog`) | 2022-03-14 | 2024-09-14 | yes | yes | Chrome 37, Firefox 98, Safari 15.4 |
| `inert` (`inert`) | 2023-04-11 | 2025-10-11 | yes | yes | Chrome 102, Firefox 112, Safari 15.5 |
| `ariaExpanded` IDL reflection (`aria-attribute-reflection`) | 2023-10-24 | 2026-04-24 | yes | yes | Chrome 103, Firefox 119, Safari 16.4 |
| `popover` (`popover`) | 2025-01-27 | none | no | no | Chrome 116, Firefox 125, Safari 17, Safari iOS 18.3 |
| Invoker Commands (`invoker-commands`) | 2025-12-12 | none | no | no | Chrome 135, Firefox 144, Safari 26.2 |
| `closedby` (`dialog-closedby`) | none | none | no | no | Chrome 134, Firefox 141, no Safari |

Command: `node baseline.mjs` over WF 3.40.0 (EXP). The platform mappings that make a modal opener expose no expanded state natively (HTML-AAM `show-modal`, 2.1.4) and that make popover invokers expose it (`popovertarget`) belong to features outside the Browser target on both dates.

### 2.4 Measured behaviour

Setup (EXP): Windows 11 Pro 10.0.26200 ARM64 (Snapdragon X Elite), Node v24.18.0, `playwright-core` 1.63.0 with its bundled Chromium 153.0.8010.12 (Chrome for Testing), Firefox 155.0, and WebKit 26.6. Page `probe.html` served on port 4720 by `server.mjs`. Every scripted opener sets its state first and then opens, and on close sets its state, closes, and focuses the opener (the order the Triggers and Reveal specs use). UI locale is Danish, so UIA localized control types read "knap" (button). Cases:

| Case | Markup and behaviour |
| --- | --- |
| A | `button aria-haspopup="dialog" aria-controls aria-expanded` opens a `<dialog>` with `showModal()` (option A for a modal Reveal) |
| B | Same without `aria-expanded` (option B) |
| C | `aria-expanded` opener, `<dialog>` opened with `show()` (non-modal Reveal) |
| D | `aria-expanded` opener inside `<main>`, which gets `inert` while a `div role="dialog" aria-modal="true"` panel is open (Off-canvas Modal mode) |
| E | `aria-expanded` opener, `div role="dialog"` pane, page not inert (Dropdown pane dialog) |
| F | `button commandfor command="show-modal"`, no author ARIA (the platform's modal invoker) |
| G | `button popovertarget`, no author ARIA (the platform's popover invoker) |
| H | As A, but `aria-expanded` flips 300 ms before `showModal()` (a state change that lands before the page becomes inert) |

1. Engine accessibility tree, Chromium, through CDP `Accessibility.getPartialAXTree` on the opener (`node measure.mjs all`; output `out-measure-all.json`):

| Case | Before opening | While open | After closing (opener focused) |
| --- | --- | --- | --- |
| A | `role=button expanded=false hasPopup=dialog` | `ignored=true (activeModalDialog) role=none` | `expanded=false hasPopup=dialog` |
| B | `role=button expanded=- hasPopup=dialog` | `ignored=true (activeModalDialog)` | `expanded=- hasPopup=dialog` |
| C | `expanded=false` | `ignored=false expanded=true` | `expanded=false` |
| D | `expanded=false` | `ignored=true (inertElement)` | `expanded=false` |
| E | `expanded=false` | `ignored=false expanded=true` | `expanded=false` |
| F | `expanded=- hasPopup=-` | `ignored=true (activeModalDialog)` | `expanded=- hasPopup=-` |
| G | `expanded=false hasPopup=-` | `expanded=true` | `expanded=false` |

`:modal` matched the dialogs of A, B, F in all three engines while open; `'command' in HTMLButtonElement.prototype` was `true` in all three.

2. Windows UI Automation (what Narrator and UIA clients read), headed engines with `--force-renderer-accessibility` for Chromium and `accessibility.force_disabled=-1` for Firefox, read-only tree walk after each step (`node uia-run.mjs chromium|firefox uia-dump.ps1`, and the COM probe `axprobe.ps1` compiled from `AxProbe.cs`; outputs `out-uia-*.txt`):

| Case | Chromium ExpandCollapse before / open / after | Firefox ExpandCollapse before / open / after |
| --- | --- | --- |
| A | Collapsed / opener absent from tree / Collapsed | Collapsed / absent / Collapsed |
| B | LeafNode / absent / LeafNode | Collapsed / absent / Collapsed |
| C | Collapsed / Expanded / Collapsed | Collapsed / Expanded / Collapsed |
| D | Collapsed / absent / Collapsed | Collapsed / absent / Collapsed |
| E | Collapsed / Expanded / Collapsed | Collapsed / Expanded / Collapsed |
| F | no ExpandCollapse pattern / absent / no pattern | no pattern / absent / no pattern |
| G | Collapsed / Expanded / Collapsed | Collapsed / Expanded / Collapsed |

Firefox's Collapsed for case B is deliberate in its source: "If aria-haspopup is specified without aria-expanded, we should still expose collapsed, since aria-haspopup infers that it can be expanded. The alternative is ExpandCollapseState_LeafNode" (mozilla-firefox/firefox `accessible/windows/uia/uiaRawElmProvider.cpp:54-60`, commit `c32abda`; the pattern is present when the state has `EXPANDABLE` or `HASPOPUP`, `:1516-1519`).

3. MSAA states (the stream NVDA and JAWS consume), read by `AccessibleObjectFromEvent` on each WinEvent (`node events-run.mjs chromium|firefox`, listener `D:/tmp/nfs-at-evidence-2/uia.ps1 -Mode listen`, read-only; outputs `events-chromium.txt`, `events-firefox.txt`). Focus event on the opener:
   - Chromium A: `role=pushbutton name="Open A" states=focused|collapsed|focusable|haspopup ia2attrs{haspopup:dialog}`; B: `states=focused|focusable|haspopup ia2attrs{haspopup:dialog}` (no `collapsed`).
   - Firefox A: `states=focused|collapsed|focusable|haspopup ia2attrs{haspopup:dialog}`; B: `states=focused|focusable|haspopup ia2attrs{haspopup:dialog}` (no `collapsed`).
   - The same Firefox button B read through the UIA LegacyIAccessible pattern reports `msaaState=0x100400 [COLLAPSED|FOCUSABLE]` (`axprobe.ps1`), so Firefox's UIA-derived legacy state and its MSAA state differ for case B.
4. Events across the open step:
   - Case A: between Enter on the opener and focus landing on the dialog's button, neither engine fired `OBJ_STATECHANGE` or a UIA `ExpandCollapseState` property change for the opener (Chromium lines 7-13, Firefox lines 7-14 of the event logs). When `aria-expanded` flips in the same task as `showModal()`, no "expanded" notification reached the platform in these runs.
   - Case H: both engines fired `PROP ExpandCollapseState=1` and `WE OBJ_STATECHANGE ... states=focused|expanded|focusable|haspopup` on the still-focused opener before focus moved into the dialog (Chromium log lines 41-43; Firefox lines 27-30).
   - Case C (non-modal): both engines fired the expanded state change on the unfocused opener after focus moved into the dialog, and the collapsed change when it closed.
5. Playwright's own ARIA snapshot (`locator.ariaSnapshot()`) reported `- button "Open A" [expanded]` and `- button "Open D" [expanded]` while open in Chromium, Firefox, and WebKit, although Chromium's tree and both engines' UIA trees exclude those openers. The string `inert` does not occur in `playwright-core` 1.63.0 `lib/coreBundle.js`, which holds its role computation (`rg -c inert` returns nothing), so Playwright assertions do not model inertness.
6. Not measured: WebKit's platform accessibility tree (the Windows WebKit build offers no inspection path used here), macOS VoiceOver, iOS, Android, any screen reader's speech, and the Browser target's floor versions (Chrome 119, Firefox 119, Safari 17).

### 2.5 Foundation 6.9 source

1. Reveal stamps the first `[data-open]` (else `[data-toggle]`) anchor with `aria-controls`, `aria-haspopup: 'dialog'`, and `tabindex: 0`; it never sets `aria-expanded` (FS `js/foundation.reveal.js:53-58`; `rg aria-expanded js/foundation.reveal.js` returns nothing). Foundation's Reveal adds no `inert` and no `aria-modal`, so its opener stays exposed to assistive technology while the modal is open (`specs/reveal.md:11`; `research/aria-apg-patterns.md:361`).
2. Off-canvas stamps every `[data-open]`, `[data-close]`, `[data-toggle]` pointing at the panel with `aria-expanded="false"` and `aria-controls` at init and flips `aria-expanded` on open and close, whatever `trapFocus` is (FS `js/foundation.offcanvas.js:99-103`, `:421`, `:513`). Its `trapFocus` mode adds no dialog semantics (`research/aria-apg-patterns.md:298`).
3. Dropdown stamps anchors with `aria-controls`, `aria-haspopup: true`, `aria-expanded: false` and flips `aria-expanded` on open and close (FS `js/foundation.dropdown.js:52-58`, `:253`, `:294`).
4. Foundation's docs markup for a Reveal opener includes one example with a hand-written `aria-controls` and no `aria-expanded` (FS `docs/pages/reveal.md:90`).

So "matching Foundation" holds for Reveal (no `aria-expanded`) and does not hold for Off-canvas (which renders `aria-expanded` on its openers in every mode) or Dropdown.

### 2.6 Angular, CDK, Aria, and Material source

1. CDK Dialog and Material Dialog set no `aria-haspopup`, `aria-expanded`, or `aria-controls` anywhere (`rg` over NGC `src/cdk/dialog` and `src/material/dialog`: zero matches); they have no opener API. CDK Dialog hides every sibling of the overlay container with `aria-hidden="true"` while open (NGC `src/cdk/dialog/dialog.ts:393-414`), which covers a typical opener; `MatDialogConfig.ariaModal` defaults to `false` "because ... the dialog marks all outside content as `aria-hidden` anyway" (`src/material/dialog/dialog-config.ts:118-123`). Focus returns to the previously focused element (`src/material/dialog/dialog.md:174-178`). The dialog guides' Accessibility sections say nothing about the opener (`src/material/dialog/dialog.md:142-181`, `src/cdk/dialog/dialog.md:186-201`).
2. `MatDatepickerToggle`: `[attr.aria-haspopup]="datepicker ? 'dialog' : null"` and `[attr.aria-expanded]="datepicker ? datepicker.opened : null"` (NGC `src/material/datepicker/datepicker-toggle.html:1-10`); the calendar content is `role="dialog"` with `[attr.aria-modal]="true"` in both touch and popup modes (`datepicker-content.html:1-5`); touch mode differs only in overlay presentation (`datepicker-base.ts:731-755`). The datepicker input carries `aria-haspopup="dialog"` and `aria-owns`, not `aria-expanded` (`datepicker-input.ts:41-45`).
3. `mat-menu` trigger: `aria-haspopup="menu"`, `aria-expanded`, `aria-controls` only while open (`src/material/menu/menu-trigger.ts:30-34`).
4. Angular Aria 22.2 has no dialog or disclosure pattern (`research/angular-aria-inventory.md`; README Aria confirmation list). Its combobox supports `popupType` `'dialog'` and binds `aria-expanded` and `aria-haspopup` on the combobox (NGC `src/aria/combobox/combobox.ts:67`, `:70`; `combobox-popup.ts:54`); its menu trigger binds both (`src/aria/menu/menu-trigger.ts:48-49`).
5. Angular's change detection applies host bindings and then runs render hooks in the same `synchronize()` call (NG `packages/core/src/application/application_ref.ts:588-683`: view refresh, then `afterRenderManager.execute()`), which is how the Reveal spec orders the Trigger's `aria-expanded` binding before `showModal()` in its render callback (`specs/reveal.md:258`). Both land in one task, the shape of case A in 2.4 (derived from source; not measured in an Angular build).

### 2.7 Other design systems

Read from source at the named commit by a delegated pass on 2026-09-26; the Radix, React Aria, and USWDS lines were re-read for this dossier.

| Library | Modal opener renders `aria-expanded`? | `aria-haspopup` | `aria-controls` | Citation |
| --- | --- | --- | --- | --- |
| Radix `Dialog.Trigger` (modal by default) | yes, live | `"dialog"` | only while open | radix-ui/primitives `packages/react/dialog/src/dialog.tsx:127-132` @ `f7ecd5a`; the `modal` prop is not read by the trigger (`:121-139`); modal content calls `hideOthers(content)` "better supported equivalent to setting aria-modal" (`:306-309`) |
| Radix `Popover.Trigger` (non-modal) | yes | `"dialog"` | only while open | `packages/react/popover/src/popover.tsx:160-165` |
| React Aria `useOverlayTrigger` (React Aria Components and Spectrum 2 `DialogTrigger`, any Modal/Popover/Tray) | yes, always | none for dialogs: "we only add it for menus for now because screen readers often announce it as a menu even for other values" | only while open | adobe/react-spectrum `packages/react-aria/src/overlays/useOverlayTrigger.ts:53-75` @ `16eead6`; `packages/react-aria-components/src/Dialog.tsx:87` |
| React Spectrum 1 `DialogTrigger` `type="modal"` (default), tray, fullscreen | no | no | no | `packages/@adobe/react-spectrum/src/dialog/DialogTrigger.tsx:118-165`, `:231-260` (popover type uses `useOverlayTrigger`, `:194-219`) |
| Ariakit `DialogDisclosure` | yes | `"dialog"` (derived) | yes | ariakit/ariakit `dialog-disclosure.tsx:40`; `disclosure.tsx:104-105` @ `cf6956c` |
| Zag.js dialog trigger (Chakra UI v3, Ark UI) | yes | `"dialog"` | yes | chakra-ui/zag `packages/machines/dialog/src/dialog.connect.ts:38-42` @ `7bff8b7` |
| Angular Material datepicker toggle (opens `aria-modal="true"` dialog) | yes | `"dialog"` | no | 2.6 item 2 |
| Primer React Dialog | no opener API; its stories' openers carry no ARIA | no | no | primer/react `Dialog.stories.tsx:72`, `:113` @ `6794582` |
| Primer ViewComponents `Alpha::Dialog` show button | no | no | no (`data-show-dialog-id`) | primer/view_components `app/components/primer/alpha/dialog.rb:60-71` @ `f617990` |
| USWDS modal | no | no; commented out: "Can uncomment when aria-haspopup="dialog" is supported ... might announce as opening a menu" | yes (static markup) | uswds/uswds `packages/usa-modal/src/usa-modal.twig:8`; `src/index.js:370-390` @ `59ea069` |
| GOV.UK Frontend | no modal component exists; no Design System component or pattern for modals | n/a | n/a | alphagov/govuk-frontend components listing @ `86f2333`; design-system.service.gov.uk components and patterns pages |
| Bootstrap 5 modal | no | no | no | twbs/bootstrap `site/src/content/docs/components/modal.mdx:109-111`; `js/src/modal.js:339-367` @ `46a8804` |
| Fluent UI v9 `DialogTrigger` | no (runtime sets none; type allows `'aria-haspopup'?: 'dialog'`) | no | no | microsoft/fluentui `react-dialog/library/src/components/DialogTrigger/DialogTrigger.types.ts:30` @ `8add8c8` |
| a11y-dialog | no | no | no | KittyGiraudel/a11y-dialog `src/a11y-dialog.ts:273`, `:284` @ `9c322dd`; `docs/usage.quick_start.md:9` |
| Headless UI, Shoelace, Web Awesome | no opener component | n/a | n/a | tailwindlabs/headlessui `dialog.tsx:602-608`; shoelace `dialog.component.ts:78` |

Counts from this table (modal openers with a library-owned opener): `aria-expanded` rendered by Radix, React Aria, Ariakit, Zag, and the Material datepicker toggle; not rendered by Spectrum 1, Primer ViewComponents, USWDS, Bootstrap, Fluent v9, and a11y-dialog. Background hiding while open, where checked: Radix hides the rest of the page with `hideOthers`, so its opener's `aria-expanded="true"` sits in hidden content; the Material datepicker marks its calendar `aria-modal="true"` and traps focus (`cdkTrapFocus`, `datepicker-content.html:1-5`), but whether its toggle is hidden while open was not checked; React Aria's, Ariakit's, and Zag's background hiding was not checked (UNVERIFIED).

### 2.8 Published assistive-technology support data and expert writing

Collected by a delegated pass on 2026-09-26 (snapshots under `D:/tmp/nfs-decision-aria-expanded/at-support/`); the a11ysupport.io, ARIA-AT, and Open UI figures below were re-read from those snapshots.

1. a11ysupport.io, `aria-expanded` (https://a11ysupport.io/tech/aria/aria-expanded_attribute, rendered with playwright-cli): "Screen Reader support level: partial (80/88)"; results "range from 2 years ago to 6 years ago". Tests: "Disclosure widget (show/hide)" on `button` (updated 2021-07-23) and an APG combobox (2025-08-15); no dialog-opener test. On the disclosure button, "convey the 'false' value" and "'true' value" are supported in all 11 combinations (JAWS with Chrome, Edge, Firefox; Narrator with Edge; NVDA with Chrome, Edge, Firefox; Orca with Firefox; TalkBack with Chrome; VoiceOver iOS and macOS with Safari); "convey change in value" is partial in JAWS with Chrome and Edge. Its example text: "Most screen readers will announce the state as 'collapsed'".
2. a11ysupport.io, `aria-haspopup` (https://a11ysupport.io/tech/aria/aria-haspopup_attribute): "partial (79/99)"; "MUST convey the 'dialog' value" on `button` (updated 2023-09-05): supported in 9 of 11 combinations, partial in Narrator with Edge and TalkBack with Chrome.
3. PowerMapper: its screen reader test suite has no `aria-expanded` or `aria-haspopup` test (sitemap.xml has no such URL under `/tests/screen-readers/`; the ARIA index dated 2025-12-14 lists only `aria-describedby`, `aria-label`, `aria-labelledby`, `aria-level`, `role`).
4. Steve Faulkner, "aria-haspopup: less is more", https://html5accessibility.com/stuff/2023/06/20/aria-haspopup-less-is-more/ (updated 2023-09-04): JAWS (June 2023 update) and NVDA 2023.2 "now support all aria-haspopup values on button and link"; for `dialog` on a button: JAWS "button hasPopUp dialog", NVDA "button opens dialog", VoiceOver "dialog pop-up button", Narrator "button hasPopUp" (value not spoken). The page does not test `aria-expanded`.
5. Scott O'Hara's test page https://scottaohara.github.io/tests/aria-haspopup/ (undated; tested versions suggest about 2019) records older undifferentiated announcements (JAWS "button menu", NVDA "button, submenu" for `dialog` on a button). Scott O'Hara, "The current state of modal dialog accessibility", TPGi, 2018-06-29: "Until support for the dialog value has better implementation, it's probably best to not use aria-haspopup on the element that opens the modal dialog."
6. ARIA-AT (https://aria-at.w3.org/, rendered with playwright-cli), all reports marked "Unapproved Report":
   - Modal Dialog Example plan V24.06.07 (report 147736; JAWS 2025.2508.120 with Chrome completed 2026-05-06, also JAWS 2021, NVDA 2020.4, VoiceOver macOS 11.6 and 15.0): no test examines the opener before activation; on "Close a modal dialog" the assertions for the returned-to button are "Convey role 'button'" and "Convey name 'Add Delivery Address'", with no state assertion; captured JAWS output "Add Delivery Address [Button] To activate press Enter." The example's openers carry neither attribute (2.2.2).
   - Disclosure Navigation Menu plan V25.10.27 (report 163668): MUST "Convey state of the button, 'collapsed'" (aria-expanded ARIA Specification), passing in JAWS 2025.2508.120 and 2023, VoiceOver macOS 15.1 and 14.0 (all Must-Have 100%), NVDA 2023.1 14 of 16.
   - Action Menu Button plan V25.10.26 (report 163666): SHOULD "Convey state 'collapsed'"; the captured page shows it Passed for one command and Failed for another, with JAWS output "Actions button menu" (no state word) on the failing command.
7. Open UI, "Invoker Commands (Explainer)", https://open-ui.org/components/invokers.explainer/ (authors keithamus, lukewarlow; created 2023-10-06; last updated 2026-08-18; retrieved via markdown.new 2026-09-26). Section "Buttons with `command=show-modal`", "Other considerations not explicitly proposed": "aria-expanded: Similar to `aria-details`, the `aria-expanded` state redundant, given the dialog is opened as modal. For the user to have navigated to a button that opens a modal dialog, the dialog must not be open. If the dialog is open then the button will be inert, therefore non-navigable, therefore it is redundant to provide it an implicit `aria-expanded=true` state also." "aria-controls: ... not useful for a dialog that is closed, and non-navigable for a dialog that is open as modal." On `aria-haspopup=dialog`: "buttons that open dialogs rarely come with additional visual treatment, and so the lack of a visual analog means that using this attribute likely provides surplus information ... aria-haspopup is not present by default." For popover commands: "Buttons will also implicitly receive an `aria-expanded` value." For `command=close` outside a non-modal dialog the explainer proposes an implicit `aria-expanded`; HTML-AAM did not adopt that (item 8).
8. w3c/aria PR 2354 (HTML-AAM `command` mappings, opened by keithamus 2024-10-11, merged 2025-04-02): scottaohara review 2024-11-11: "being a button that opens a modal dialog and where focus will automatically be put into the dialog once it's opened, there's no need for any additional mappings"; scottaohara 2024-12-10: "the only major change I made was removed the mappings for aria-expanded for the close command".
9. w3c/aria#1024 "Clarify usage of aria-haspopup" (closed 2023-09-22 by scottaohara "for now"): opening post (2019-08-01) recorded JAWS and NVDA treating `button aria-haspopup=dialog` as a menu button. mcking65 (https://github.com/w3c/aria/issues/1024#issuecomment-706833969, 2020-10-12), who writes that he drafted the aria-haspopup token pull requests: "I now see the tokens as solutions looking for a problem"; "when people started adding haspopup equal dialog on buttons, they got menu buttons that open dialogs". jscholes (#issuecomment-1024931180, 2022-01-29): "`aria-expanded` indicates state, `aria-haspopup` conveys intent/impact ... It does not feel reasonable for the purpose of `aria-expanded` to be overloaded in this way, nor should its state be relevant to the user while in a modal context." mitchellevan (2023-09-16): closing is right "because this minimum support or better is now in latest versions of screen readers with widespread use".
10. w3c/core-aam#51 (2019): `aria-haspopup` on a button maps to a menu-button role in some APIs; reported JAWS/IE11 output "button menu" with no `aria-expanded` announcement.
11. Hidde de Vries with Scott O'Hara, "On popover accessibility: what the browser does and doesn't do", https://hidde.blog/popover-accessibility/ (updated 2025-03-15): for `popovertarget` "the browser will automatically convey whether the popover is in the expanded (rendered) state ... implemented in Edge, Chrome, Firefox and Safari"; it does not cover modal dialogs.
12. Other writing found touches only neighbouring questions: Adrian Roselli, "Link + Disclosure Widget Navigation" (updated 2026-07-10: disclosure needs `aria-expanded`, no `aria-haspopup`); Manuel Matuzovic, "aria-haspopup might not do what you think it does" (2026-02-23: navigation submenus; recommends `aria-expanded` there; Narrator/Edge said "expanded" for an `aria-haspopup="menu"` button); WebAIM list thread 10078 (2021: treats `aria-expanded` as the non-modal case). No located primary source argues for `aria-expanded` specifically on a modal opener. A search-engine summary attributing such a statement to Heydon Pickering's paid "Inclusive Components" dialog chapter could not be verified (UNVERIFIED).

### 2.9 The effort's own tickets, specs, prototypes, and ADRs

1. Origin. The building-blocks ticket first decided: "`aria-expanded` plus `aria-controls` for disclosures, `aria-haspopup="dialog"` plus `aria-controls` for Reveal" (`issues/14-building-blocks-map.md:117`, decision 38, citing the APG research's Reveal opener note). The Triggers ticket reopened it (decision 18, `issues/54-spec-triggers.md:69`) and building-blocks 1.8 was reworded to the Triggers spec, with the modal question left open (`building-blocks.md:99`).
2. Triggers ticket decisions 16 to 20 (`issues/54-spec-triggers.md:67-71`): 16 maps roles to ARIA and adds `toggle-button`; 17 never `aria-haspopup="true"`; 18 renders `aria-expanded` on dialog openers because non-modal dialogs keep the opener reachable and "for a modal Reveal the opener is inert while open, so only 'collapsed' is ever announced", noting "The sources allow both; the default here is one role value per ARIA shape"; 19 `nfsClose` renders nothing; 20 multi-target semantics. Triage (`:155-158`): impact HIGH (a public union; "adding a fifth value later widens a public union (a compile break for exhaustive `switch` statements over it)"), confidence NOT HIGH ("departs from the effort's own APG research for the modal case").
3. Triggers spec text: `dialog` rationale bullet cites "the non-modal dialog shape drawn from the APG (a trigger with `aria-haspopup="dialog"` and `aria-expanded`)" (`specs/triggers.md:228`); that shape is the effort's synthesis in `research/aria-apg-patterns.md:218`, and no APG example contains a non-modal dialog (2.2.4). The story `triggers--dialog-role` asserts `aria-haspopup="dialog"`, `aria-controls`, `aria-expanded` (`:338`); the browser-level ARIA table is data-driven over every role (`:350`); the WCAG 4.1.2 row states both options conform ("OPEN FOR HUMAN 1 ... both options are 4.1.2-conformant", `issues/54-spec-triggers.md:103`).
4. Reveal spec: `triggerRole: Signal<'dialog'>` "Always `'dialog'`" (`specs/reveal.md:153`, `:208`); Trigger row of the ARIA table (`:308`); Rendered HTML shows the Trigger with `aria-expanded="false"` then `"true"` (`:358`, `:371`); story `reveal--basic` asserts "the Trigger shows `aria-expanded="true"`" while "the page behind is inert" (`:454`), a state Chromium's and both UIA trees do not expose (2.4.1, 2.4.2) and Playwright's snapshot does report (2.4.5). The Reveal ticket did not reopen the point (`issues/18-spec-reveal.md:104`, `:168`).
5. Reveal `[isOpen]="true"` (open by default): the model is true on the server, the server HTML keeps the dialog closed "whatever `isOpen` is", and the dialog opens with `showModal()` after hydration (`specs/reveal.md:201`, `:421`, `:423`, D17 `:553`). The Trigger's ARIA are host bindings on the Openable's `isOpen` (`specs/triggers.md:315`). Derived, not measured: under option A the server HTML of that Trigger carries `aria-expanded="true"` while its dialog is closed and the page is not inert, until hydration (and indefinitely without JavaScript); under B, C, and D a modal opener carries no `aria-expanded`.
6. Off-canvas spec: `triggerRole: Signal<'disclosure' | 'dialog'>`, `'dialog'` only in Modal mode (`specs/off-canvas.md:169`, `:204`, `:207`); Modal mode's `inert` on the content is bound "once focus is inside the panel" (`:207`, `:224`); ARIA table (`:302`), 4.1.2 row (`:333`), Rendered HTML Modal mode "the Trigger reads `aria-haspopup="dialog" aria-controls="site-nav" aria-expanded="true"`" (`:398`), story `off-canvas--modal` (`:448`). Glossary: Modal mode (`CONTEXT.md:143-145`).
7. Dropdown spec: `role` input makes a non-modal dialog; `trapFocus` requires `role="dialog"`; "no `aria-modal`, trapped or not" (`specs/dropdown.md:205`, `:216`, `:287`, `:293`, D3 `:514`, D14 `:525`).
8. Non-modal openers and focus: a non-modal Reveal closes when Tab leaves it and on Escape from anywhere (`specs/reveal.md:313`, `:457`); an untrapped Dropdown pane closes when Tab leaves it (`specs/dropdown.md:318`); Light dismiss includes "when focus moves outside it" (`CONTEXT.md:147-149`). So a keyboard user who moves focus back to a non-modal dialog's opener closes the dialog first; the opener's `"true"` state is reachable by pointer, and by screen reader reading modes if they do not move focus (not measured).
9. Glossary "Trigger role": "(disclosure, dialog opener, toggle button, or plain command)" (`CONTEXT.md:127-129`). ADR 0013 requires every Openable spec to state its Trigger role (`adr/0013-triggers-target-resolution.md:20`). ADR 0007 (Reveal on native `<dialog>`) and ADR 0030 (Off-canvas not a `<dialog>`) fix the two modal mechanisms.
10. Triggers spec's upgrade path: when Invoker Commands enter the target, a Reveal Trigger would render `commandfor` with `show-modal` (`specs/triggers.md:555`), whose platform mapping adds no `aria-expanded` (2.1.4); the spec says the click listener stays because `command` does not replay.
11. Prototypes: the Reveal prototype did not examine opener ARIA (`prototypes/reveal-dialog/README.md`); it measured that WebKit does not focus a button on mouse click, so the invoker comes from the Trigger (`:45`), and focus return to the Trigger in three engines (`:69`). No prototype in `prototypes/` asserts `aria-expanded` or `aria-haspopup` on a dialog opener (`rg -i 'aria-expanded|haspopup' prototypes/`).
12. Related open work: README assistive-technology checks 4 (Reveal) and 5 (Off-canvas) (`README.md:136-137`), worked by [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md).
13. Implementation status: implementing the specs is out of the map's scope (`map.md:232`); no library code or consumer depends on the union yet.

## 3. Consequences per option

### 3.1 WCAG 2.2 AA criteria touched

| Criterion | A | B (B1/B2) | C | D | E |
| --- | --- | --- | --- | --- | --- |
| 4.1.2 Name, Role, Value | Expanded state exposed before open and after close; while open the opener is excluded from engine trees (2.4.1-2.4.2), so the `"true"` value is not exposed in the modal cases | No expanded state on modal openers; non-modal unchanged. Firefox UIA still reports Collapsed from `aria-haspopup` (2.4.2) | As B, and no `aria-controls` relationship | No state, no popup hint | Expanded state kept; popup type not exposed |
| 1.3.1 Info and Relationships | `aria-controls` names the dialog | Same | Relationship dropped for modal openers; while open it is not navigable anyway (2.8.7) | Dropped | Kept while open (React Aria shape) |
| 2.4.3 Focus Order, 2.4.11, 2.1.1, 2.1.2, 2.5.8, 2.4.7 | Unaffected: focus return and keyboard handling are the Openable's (`specs/triggers.md:241`, `:254`) | Unaffected | Unaffected | Unaffected | Unaffected |

The Triggers ticket records that both A and B conform to 4.1.2 (`issues/54-spec-triggers.md:103`); the WCAG normative text names no attribute (2.1.6).

### 3.2 Users affected

- Screen reader users on the modal opener, before opening and on focus return. Engines expose `collapsed` under A and not under B, C, D in Chromium and in Firefox's MSAA state, while Firefox UIA reports Collapsed for any `aria-haspopup` button (2.4.2-2.4.3). The announcement text itself is not measured (section 4).
- Screen reader users of the popup hint: B keeps the "opens dialog"/"has pop-up dialog" announcement recorded in 2.8.4; D and E drop it.
- Pointer and keyboard users without assistive technology: no visible change under any option; Triggers add no CSS (`specs/triggers.md:412`).
- Voice control users: the accessible name is unchanged under every option.
- Test authors: Playwright's ARIA snapshot and attribute assertions see the DOM attribute, not the engine's exclusion of inert nodes (2.4.5).

### 3.3 Public API or contract frozen

- A: `NfsTriggerRole` stays four values; `dialog` always means all three attributes.
- B1: fifth union value. Adding it later to a shipped library widens the union (additive for implementers; breaks exhaustive `switch` statements over it, `issues/54-spec-triggers.md:156`); removing it later breaks implementers that return it. Reveal's role type becomes a two-value union from `overlay`; Off-canvas's `'dialog'` becomes the new value (its `dialog` role only occurs in Modal mode); Dropdown unchanged unless its trapped pane is reclassified.
- B2: an optional member on `NfsOpenable` (additive for implementers; the union is unchanged); wrapper components that delegate to a Reveal (`specs/triggers.md:520-546`) would have to forward it; an optional member that a wrapper omits compiles and falls back to the non-modal output (inference from the wrapper example, which declares `triggerRole` as a constant `'dialog'`). Under B1 the same wrapper's constant `'dialog'` would also misreport a modal Reveal unless changed.
- C: as B1 or B2, plus the rule that modal openers omit `aria-controls`.
- D via `'none'`: no contract change; the meaning of `'none'` widens from "tooltip or plain command" to include modal dialog openers (`CONTEXT.md:128`; Tooltip spec `specs/tooltip.md:192`, D17 `:522`).
- E: changes the `dialog` role's `aria-haspopup` output for all dialogs; outside the ticket's question.

### 3.4 Reversibility

The specs are unimplemented (2.9.13), so every option is a text change today. After a first release: A to B changes every modal opener's exposed state (a behaviour change, and a union change under B1); B to A adds a state back (behaviour change; under B1 removing a union value breaks implementers). The Invoker Commands upgrade path (2.9.10) would move modal openers to a platform mapping with no `aria-expanded` and no `aria-haspopup` unless the library also binds them as author ARIA.

### 3.5 Cost to the specs and to the future implementation

| Artefact | A | B1 | B2 | C | D via `'none'` |
| --- | --- | --- | --- | --- | --- |
| Triggers spec (`specs/triggers.md`): union `:126`, ARIA table `:220-231`, 4.1.2 row `:249`, story `:338`, browser-level table `:350`, SSR smoke `:360`, D6/D7 `:402-403`, Consumers table `:418-420`, Rendered HTML `:282` | Close OPEN FOR HUMAN wording only | New row and value in each; new story or story case | ARIA table rule and contract member; story case | As B plus `aria-controls` rule | Consumers table rows for Reveal and Off-canvas; ARIA table note |
| Reveal spec (`:153`, `:208`, `:308`, `:358`, `:371`, `:454`) | Optional: `reveal--basic` asserts `aria-expanded="true"` on an inert Trigger | Role type from `overlay`; ARIA row; Rendered HTML; story assertion | Modality member; same text rows | As B plus `aria-controls` | Role `'none'` when modal; same rows |
| Off-canvas spec (`:169`, `:204`, `:207`, `:302`, `:333`, `:398`, `:448`) | None | Role value in Modal mode; rows | Modality member | As B | `'none'` in Modal mode |
| Dropdown spec | None | None (non-modal) unless reclassified | None | None | None |
| building-blocks 1.8 (`:99`) and Part 4 item 1 (`:335`) | Move item to Decided | Union text in 1.8; move item | Contract text in 1.8; move item | Same | Role-use text; move item |
| README trap-quadrant item 1 (`README.md:149`) | Remove | Remove | Remove | Remove | Remove |
| CONTEXT.md "Trigger role" (`:127-129`) | None | Add "modal dialog opener" | None | As B1/B2 | Widen "plain command" |
| Implementation | Four-role pure function (`specs/triggers.md:361`) | Five-role function; Openables compute role from modality | Four roles plus one flag read | As B plus `aria-controls` condition | Openables compute `'none'` from modality |

### 3.6 Rendering modes

- SSR and prerendering: the Trigger's ARIA are host bindings in server HTML (`specs/triggers.md:315`). Under A, an open-by-default modal Reveal's Trigger ships `aria-expanded="true"` next to a closed dialog and a live page until hydration, and forever without JavaScript (2.9.5, derived). Under B, C, D no modal opener ships `aria-expanded`. Non-modal openers behave the same under every option.
- Hydration: host binding values equal the server's under every option (`specs/triggers.md:317`); modality inputs (`overlay`, `trapFocus`, overlay presence) are known on the server, so B1, B2, C, D compute the same value on both sides. Off-canvas Modal mode depends on `hasOverlay()` (`specs/off-canvas.md:207`); how that is known on the server is set by the Off-canvas spec, not examined here.
- Event replay: no difference; the click listener and the absence of `preventDefault()` are the same (`specs/triggers.md:318`).
- `@defer`: no difference; a Trigger and its Openable share one Hydration boundary under every option (`specs/triggers.md:320-321`).
- Timing within the open: when the state flip and `showModal()` land in one task, no expanded notification reached the platform in either engine (2.4.4 case A); when the flip lands earlier, both engines notify "expanded" on the focused opener (case H). Angular's `synchronize()` puts the Reveal's binding and `showModal()` in one call (2.6.5). Off-canvas binds `inert` only after focus moves (2.9.6); whether that lands in the same task was not measured.

## 4. Open unknowns

1. Speech output. No screen reader was run. Whether JAWS, NVDA, VoiceOver, Narrator, and TalkBack say "collapsed" for a button with both `aria-haspopup="dialog"` and `aria-expanded="false"`, and in which order with "opens dialog", is unmeasured; the published data tests the two attributes separately (2.8.1-2.8.4), and one ARIA-AT capture shows JAWS omitting the state word on an `aria-haspopup="menu"` button (2.8.6). Would settle it: an ARIA-AT style run of cases A and B with each screen reader and browser pair, or the NVDA source's state-presentation rules for `haspopup` plus `collapsed`.
2. Firefox UIA's Collapsed without `aria-expanded` (2.4.2). Whether Narrator on Firefox then says "collapsed" for option B, making A and B sound alike there, is unmeasured. Would settle it: Narrator on Firefox, or Narrator's documented handling of `ExpandCollapseState_Collapsed` on buttons.
3. VoiceOver and WebKit. WebKit's platform tree and VoiceOver on macOS and iOS were not measured (2.4.6). Would settle it: `AXExpanded` and `AXHasPopup` read on macOS Safari for cases A and B.
4. Browser target floor. Only current engines were measured; the inert exclusion in Chrome 119, Firefox 119, Safari 17 is assumed from their `inert` and `<dialog>` support dates (2.3). Would settle it: the same probe on those versions.
5. Screen reader reading modes and non-modal openers. Whether moving a virtual cursor onto a non-modal opener moves focus, which would trigger Light dismiss and flip the state (2.9.8), is unmeasured. It affects the rationale for A's non-modal half, which every option keeps.
6. Classification of the trapped Dropdown pane. The ticket calls it modal; the Dropdown spec calls it non-modal (1.1). The evidence shows its opener stays exposed with `expanded=true` while open (2.4.1 case E, 2.4.2); which classification applies is a design point the sources do not settle.
7. Off-canvas Modal mode timing. Whether the content's `inert` lands in the same task as the Trigger's `aria-expanded="true"` and the focus move (2.9.6, 3.6) is unmeasured. Would settle it: the event listener of 2.4.4 against an Angular build of the Off-canvas spec (no Off-canvas prototype exists under `prototypes/`).
8. Consumer impact of a union change. No shipped consumer exists (2.9.13); how many future wrapper components would switch exhaustively over `NfsTriggerRole` cannot be known.
9. The ARIA-AT data are unapproved reports (2.8.6), and a11ysupport.io's dialog-value results are from 2023 (2.8.2); newer screen reader releases may differ.
