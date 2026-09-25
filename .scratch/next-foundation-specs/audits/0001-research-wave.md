# Audit 0001: research wave

Date: 2026-09-25
Auditor: audit subagent (read-only except this file)

## Scope

- `map.md` as committed at `9f33cc7` (identical to the working tree when this audit was written).
- Research tickets 01 to 13 and their findings files under `research/`, plus research ticket 38 (resolved in `9f33cc7`) and its findings `research/angular-rendering-modes.md`.
- Open tickets 14 to 37 and 39 to 41 as charted (question text, type, blocking). Ticket 14 was resolved in the working tree while this audit ran; its outputs (`building-blocks.md`, `CONTEXT.md`, `adr/`) belong to the building-blocks wave and were not audited here.

Governing rules: `/wayfinder`, `/research`, `/domain-modeling` (with `CONTEXT-FORMAT.md`, `ADR-FORMAT.md`), `/grill-with-docs` and `/grilling`, `/to-spec`, `/mattpocock-skills:prototype` (with `LOGIC.md`, `UI.md`), `docs/agents/issue-tracker.md`, `docs/agents/domain.md`, and the standing rules in `map.md` Notes.

Method: every governing skill and every file above was read in full. Citations were spot-checked against the local clones named in map.md Sources (foundation-sites at `337be7a8d` "Merge tag 'v6.9.0'", angular/angular and angular/components on branch `22.2.x`, aria-practices at `3f094fd`, w3c/aria at `ffa9651`), against the npm registry for the tooling file, and against raw mdn/browser-compat-data JSON for the web platform file. Foundation option names in tickets were checked against every plugin's `X.defaults` object.

## Summary

| Severity | Count |
| --- | --- |
| High | 6 |
| Medium | 12 |
| Low | 10 |
| Total | 28 |

High means a spec or decision ticket reading the document as written would be misled (wrong fact, unusable citation, or stale version target). Medium means a skill or map rule is broken in a way that weakens later tickets but does not by itself plant a wrong fact. Low is hygiene.

## Findings

### H1. Menus inventory cites line numbers from a concatenated read

- File: `research/foundation-inventory-menus.md`, sections 0.3, 0.6, 2.7, 2.8, 3.2, 3.8, and all of section 5 (ResponsiveToggle).
- Rule: `/research` step 2 ("citing each claim's source"); ticket 02 Deliverable ("Cite the file path and, where practical, the line or function for each claim").
- Evidence: the file itself admits the cause at 0.3: "`foundation.responsiveToggle.js` L178 (file 2 in the concatenated read; standalone line 25)". Section 5 then says "standalone line numbers below" but keeps the concatenated ones. Checked against the clone:
  - `foundation.responsiveToggle.js` has 152 lines. Cited L178 (`$.extend`) is L25; L194 (the `data-tab-bar` error) is L41; L202 (target data merge) is L49; L223 / L225 (listeners) are L70 / L72; defaults "L287-303" start at L134.
  - `foundation.util.triggers.js` has 260 lines; section 0.6 cites L214-248, L270-286, L380-421, L443-457 (also reused in 2.7).
  - `foundation.util.motion.js` has 103 lines; 0.6 cites L349-436 (real `animate` is L54-100).
  - `scss/components/_drilldown.scss` has 140 lines; 2.2 and 2.8 cite L185-311 (for example `$drilldown-transition` "L185" is L11).
  - `scss/components/_dropdown-menu.scss` has 279 lines; 3.2 and 3.8 cite L325-591 (`$dropdownmenu-arrows` "L325" is L11; `.js-dropdown-active` "L589-591" is L275-277).
  - The facts themselves were correct wherever checked; only the locators are wrong.
- Fix: re-run the line lookups per file (not per concatenated buffer) and replace every citation in the listed sections; add a one-line note under the header that line numbers were corrected in this audit's follow-up.

### H2. Forms-media inventory has the same concatenated-read defect for utility files

- File: `research/foundation-inventory-forms-media.md`, header conventions, Slider "Events" and "Dependencies", Orbit "State" table, "Dependencies" and "Behaviour that only jQuery makes easy", cross-plugin notes.
- Rule: as H1 (ticket 04 Deliverable).
- Evidence: `foundation.core.plugin.js` has 49 lines, cited `:279` and `:290` (real `init` trigger L19, `destroyed` L30). `foundation.util.motion.js` (103 lines) cited `:208-209`, `:221-242`, `:226`, `:238`, `:253-298` (real `Move` L22-43, `finished.zf.animate` L27 and L39). `foundation.util.touch.js` (164 lines) cited `:203-241` and `:167-175` (real `addTouch` L118, spotSwipe thresholds L86-87). `foundation.util.imageLoader.js` (42 lines) cited `:52-84`. Plugin-file citations (abide, slider, orbit, equalizer, interchange) were correct.
- Fix: recompute the utility citations per file.

### H3. CDK inventory cites doc lines beyond the end of the doc files

- File: `research/angular-cdk-inventory.md`, sections a11y, menu, accordion, listbox, stepper, bidi, dialog, portal.
- Rule: `/research` step 2; ticket 08 Deliverable ("Cite paths").
- Evidence (line counts from `src/cdk` on `22.2.x`): `menu/menu.md` has 243 lines, cited `978-1010` and `1136-1162`; `accordion/accordion.md` has 13 lines, cited `1222-1227`; `listbox/listbox.md` 204 lines, cited `1366-1368`; `stepper/stepper.md` 68 lines, cited `1485-1499`; `bidi/bidi.md` 49 lines, cited `1544-1551`; `dialog/dialog.md` 229 lines, cited `836-882`; `a11y/a11y.md` 243 lines, cited `485-505`; `portal/portal.md` 104 lines, cited `238`. Source-file citations (`overlay.ts:67-78`, `overlay-ref.ts:454-459`, `dialog-config.ts` `ariaModal` default, `menu-item.ts:79`, `media-matcher.ts:28-32`, `flexible-connected-position-strategy.ts:1443`, `overlay.ts:129` `@Service()`) all held.
- Fix: recompute the `*.md` doc citations per file.

### H4. TypeScript and Vitest targets stale in the API survey; the decision lives only in the map

- Files: `issues/06-angular-22-api-survey.md` Answer, Surprises bullet 1; `research/angular-22-api-survey.md` line 57 and line 412; `map.md` Target platform table and the Decisions-so-far line for the API survey.
- Rules: `/wayfinder` "a decision lives in exactly one place, its ticket, so the map never restates it"; map AFK override ("flags any decision it could not settle from sources as OPEN FOR HUMAN ... rather than guessing").
- Evidence: ticket 06 still says "`map.md` targets typescript 7.0.2. OPEN FOR HUMAN: drop the TS target to 6.0.x or accept `disableTypeScriptVersionCheck`." The research file repeats it (line 57) and also says "map.md pins vitest 5.0.2" (line 412). The map table now says TypeScript 6.0.x "per the Angular API survey" and Vitest 4.1.x "per the tooling research", and the map's gist for the survey says "so the map's version table now says 6.0.x". No ticket records who closed the OPEN FOR HUMAN item or on what basis. A spec author who follows the map's link into the survey reads a 7.0.2 target and an open question.
- Fix: append a dated resolution note to ticket 06 (or to ticket 12, which carries the evidence: peer range `>=6.0 <6.1`, registry facts re-verified by this audit) stating that the target is TypeScript `~6.0.3` and Vitest `~4.1.11`, and whether the human confirmed it or it was settled from sources; add a correction line at the top of `research/angular-22-api-survey.md` pointing to that note; trim the map gist to a pointer ("pins resolved in [Tooling baseline ...]").

### H5. Material reference states Foundation facts that the Foundation inventories contradict

- File: `research/angular-material-reference.md`, sections 3 (Reveal), 4 (Tooltip), 5 (Dropdown), 6 (OffCanvas).
- Rule: `/research` step 1 ("Follow every claim back to the source that owns it"); the Foundation claims here are uncited and wrong against the Foundation clone.
- Evidence, each with the contradicting source:
  - Section 3: "Foundation's `closeme.zf.reveal`/`closed.zf.reveal` pair maps to `beforeClosed`/`closed`." `closeme.zf.reveal` fires just before OPENING so other reveals close (`foundation.reveal.js:265-272`; `research/foundation-inventory-disclosure.md` Reveal events table).
  - Section 6: "Foundation `open.zf.offCanvas`/`opened.zf.offCanvas`/`close.zf.offCanvas`/`closed.zf.offCanvas` map one-to-one onto start/end pairs." There is no `open.zf.offCanvas`; `opened` fires at the START of the transition and `openedEnd` at its end (`research/foundation-inventory-menus.md` 6.4; source `@todo also trigger 'open' event?`).
  - Section 6: "Foundation `data-close-on-click`, `data-close-on-esc` become two inputs." OffCanvas has no `closeOnEsc` option (`OffCanvas.defaults` keys: closeOnClick, contentOverlay, contentId, nested, contentScroll, transitionTime, transition, forceTo, isRevealed, revealOn, inCanvasOn, autoFocus, revealClass, trapFocus). This error propagated into ticket 25 (see H6).
  - Section 5: Foundation `data-position`/`data-alignment` "are the CSS-contract equivalents (`.dropdown-pane.top.left` and so on)". `research/foundation-inventory-positioned.md` Dropdown section: the legacy `.top/.right/.bottom/.left` classes have no Sass rule on `.dropdown-pane`, and the `has-position-*`/`has-alignment-*` classes have no Sass consumer.
  - Section 4: "Foundation's `.tooltip` CSS is positioned relative to the trigger." The plugin appends the tip to `document.body` and positions it with `$.fn.offset` (`foundation.tooltip.js:49-57`; positioned inventory, Tooltip markup contract).
- Fix: correct the five sentences, citing the Foundation inventory lines; flag them to the Reveal, OffCanvas, Dropdown and Tooltip spec tickets through their Read-first lists or a note in the ticket body.

### H6. Spec tickets ask about Foundation options that do not exist in 6.9, and miss real ones

- Files: `issues/16`, `23`, `25`, `26`, `30`, `31`, `33` (plugin-specific questions); upstream sources in `research/web-platform-features.md` and `research/angular-material-reference.md`.
- Rules: map standing preference "Input names come from Foundation `data-*` options in camelCase"; AGENTS.md "Use Foundation's `data-*` attribute names in camelCase"; audit brief item 5 (option names against the source).
- Evidence (checked against each plugin's `X.defaults` in `js/`):
  - Ticket 16 Tabs: `activateOnFocus` is not a Tabs option. Real options not asked: `wrapOnKeys`, `activeCollapse`, `linkActiveClass`, `panelActiveClass`, `deepLinkSmudge*`.
  - Ticket 23 ResponsiveMenu: "the `-tabs` style aliases" do not exist; the rule keys are only `dropdown`, `drilldown`, `accordion` (`foundation.responsiveMenu.js:12-21`).
  - Ticket 25 OffCanvas: `closeOnClickInside` (a DropdownMenu option) and `closeOnEsc` (a Reveal option) are not OffCanvas options; `position` is read from the `.position-*` class, not a `data-*` option (`foundation.offcanvas.js:106`). Not asked: `contentId`, `isRevealed`.
  - Ticket 26 Dropdown: `allowGroupedOpen` does not exist in 6.9 (no hit in `js/`, `scss/`, `docs/pages/`).
  - Ticket 30 Magellan: `barOffset` does not exist (Magellan.defaults: animationDuration, animationEasing, threshold, activeClass, deepLinking, updateHistory, offset). The same name appears as `data-bar-offset` in `research/web-platform-features.md` section 9.
  - Ticket 31 Abide: `validateOnFormChange` does not exist. Not asked: `patterns`, `validators`.
  - Ticket 33 Orbit: `boxOfClass` is `boxOfBullets` in the source; `data-orbit-container` and `data-orbit-slide` appear nowhere in `js/`, `scss/` or `docs/pages/`.
  - Related wrong names in research: `research/web-platform-features.md` uses `data-double` for Slider (real `doubleSided`, `data-double-sided`; sections 14 and plugin table) and `data-animate-in-*` for Orbit (real `animInFromRight` and friends, section 6).
  - Real options missing from other tickets (lower risk): ticket 18 Reveal `showDelay`, `hideDelay`; ticket 20 AccordionMenu `parentLink`; ticket 21 DropdownMenu `disableHoverOnTouch`; ticket 22 Drilldown `animationDuration`, `animationEasing`; ticket 27 Tooltip `disableHover`, `template`, `tipText`; ticket 28 Sticky `container`; ticket 32 Slider `disabledClass`.
- Fix: replace each ticket's option list with the exact `X.defaults` keys from the relevant inventory section (the inventories are correct); correct the three wrong names in `research/web-platform-features.md`.

### M1. Spec tickets do not carry the map's rendering-modes rule or its research

- Files: `issues/15` to `35` and `37`, item 5 and "Read first".
- Rule: map standing preference "Rendering modes (user decision): every directive and component must support and be specified for `@defer` (including hydrate triggers), server-side rendering, prerendering, full and incremental hydration, and event replay. Each spec states how the directive renders on the server, what it must not touch before hydration, which user events replay correctly, and how it behaves inside a deferred block."
- Evidence: every spec ticket is `Blocked by: ... 38`, but none lists `research/angular-rendering-modes.md` in "Read first", and item 5 asks only "State model in signals; SSR, zoneless, and hydration behaviour." Nothing asks for event replay, prerendering, incremental hydration or `@defer` behaviour. The research now provides a per-plugin checklist table built for exactly this (section 7).
- Fix: add `research/angular-rendering-modes.md` to every spec ticket's Read-first list and replace item 5 with the map's four requirements plus "apply the plugin's row of the per-directive checklist".

### M2. Spec tickets name testing seams that differ from the map's testing rule

- Files: `issues/15` to `35` and `37`, item 8.
- Rule: map Testing preference: "every spec's Testing Decisions names its seams as: story play function, browser-level test (stack per ticket 41), node-level Vitest, Playwright e2e."
- Evidence: item 8 reads "which stories with play functions, which Vitest browser tests, which Playwright e2e". It names a stack the map says is undecided (Vitest Browser versus Playwright CT) and omits node-level Vitest, which the rendering-modes research needs for the SSR smoke seam.
- Fix: reword item 8 to the map's four seam names, with the browser-level seam left stack-neutral until the browser testing stack decision resolves.

### M3. Blocking edges missing on the building-blocks and testing-stack decisions

- Files: `issues/14-building-blocks-map.md` (`Blocked by: 01 ... 13`), `issues/41-browser-testing-stack-decision.md` (`Blocked by: 12, 39, 40`).
- Rules: `/wayfinder` Tickets section (blocking gives the frontier; a ticket must not be takeable before the facts it needs exist); tracker `Blocked by: NN, NN`.
- Evidence: ticket 14 decides "State and reactivity: signals, `linkedSignal`, when a service is warranted, SSR and zoneless rules" while the map says the rendering-modes research ticket "supplies the facts"; it was not blocked by 38 and was claimed before 38 resolved. Ticket 41 instructs "update the testing-seams section of `building-blocks.md` to match" but is not blocked by 14, so it could have run before that file existed.
- Fix: add 38 to ticket 14's `Blocked by` and have the building-blocks audit confirm the rendering-modes rules were applied (the file does discuss hydration); add 14 to ticket 41's `Blocked by`.

### M4. "Not yet specified" holds fog that is already a live ticket

- File: `map.md`, Not yet specified.
- Rule: `/wayfinder` Fog of war: "Not yet specified excludes what's already decided, what's already a live ticket, and what's out of scope."
- Evidence: "Shared utilities" is ticket 14 item 11; "Sass and theming pipeline" is ticket 14 item 12; "Deprecated or jQuery-specific plugin behaviour ... Decided plugin by plugin" is item 7 of every spec ticket; "Storybook conventions ... Sharp after the tooling research" names a resolved ticket and overlaps tickets 39 to 41. "Prototype tickets" also lists "Signal Forms as the Abide replacement" while ticket 06's answer states it as settled (see M11).
- Fix: delete the four patches that are live tickets (or rewrite each as the residue those tickets do not cover), and update the prototype patch after ticket 14's answer.

### M5. Map contradicts itself on whether this repo's code is a source

- File: `map.md`, Design criteria and Out of scope.
- Rule: `/wayfinder` Out of scope ("work you've consciously ruled out"); consistency of Notes.
- Evidence: Out of scope: "This repo's existing Angular implementations ... the code here is neither a source nor a constraint." Design criteria: "Modern DI patterns: what this repo already uses, ...". Ticket 13 item 7 researched the repo's accordion code, and `research/angular-22-api-survey.md` line 397 carries the repo's `Token` suffix rule into a relevance note.
- Fix: reword one of them, for example "the repo's AGENTS.md conventions are an input; its component code is neither a source nor a constraint".

### M6. Map does not state every override the effort makes

- File: `map.md`, "Where things live" and "AFK override".
- Rules: `/mattpocock-skills:prototype` rule 6 (capture the prototype on a throwaway branch, out of main); audit brief item 1 (overrides stated explicitly).
- Evidence: ticket 40 copies decisive prototype files into `prototypes/playwright-ct/` inside the effort directory, ticket 36 writes `README.md`, and the audit cadence writes `audits/`. "Where things live" lists none of the three, and no Note says prototypes are captured in the effort directory instead of a throwaway branch. The research-file and glossary overrides are stated correctly.
- Fix: add `prototypes/<name>/`, `audits/NNNN-<scope>.md` and `README.md` to "Where things live", with one sentence that prototypes are captured there rather than on throwaway branches.

### M7. Bare ticket numbers in narration and a ticket title that no longer matches its content

- Files: `map.md` lines 43 ("Research ticket 38 supplies the facts") and 57 ("ticket 41" twice); `issues/36` ("ticket 41", "ticket 38"); `issues/41` ("ticket 38"); `research/angular-rendering-modes.md` line 3 ("Ticket: [38](...)"); `issues/12` title.
- Rule: `/wayfinder` Refer by name ("never by a bare id, number, or slug").
- Evidence: as quoted. Ticket 12 is titled "Tooling baseline: Nx 23.2, Angular 22.2, Storybook 10.6, Vitest 5 browser mode" while its answer pins Vitest 4.1; the map's link text silently shortened it to "... Vitest", so the name the map uses is not the ticket's name.
- Fix: replace the bare numbers with linked names (for example "[Angular 22.2 @defer, SSR, prerendering, hydration, and event replay](issues/38-angular-rendering-modes.md)"); retitle ticket 12 to "... Vitest browser mode" and make the map link text match.

### M8. API survey contradicts the tooling and rendering-modes research and carries no correction note

- File: `research/angular-22-api-survey.md` lines 243 and 412.
- Rule: audit brief item 4 (contradictions between research files); `/research` (the finding must hold at its source).
- Evidence: line 412 says "In an Nx workspace the `@nx/vite:test` executor rather than `@angular/build:unit-test` runs Vitest, so the `angular.json` options above become `vitest.config.mts` settings." `research/tooling-baseline.md` ("What `vitest-angular` writes"): the library generator writes `@nx/angular:unit-test`, "a thin wrapper" over `@angular/build`'s builder, and "there is no `vitest.config.ts` for this path". Line 243 says incremental hydration "needs `provideClientHydration(withIncrementalHydration())`"; `research/angular-rendering-modes.md` section 0 shows it is on by default in 22.x (`packages/platform-browser/src/hydration.ts:146-151, 289-291`, verified) and that event replay comes with it.
- Fix: add a "Corrections" block at the top of the survey pointing to the two later files; fix the two sentences.

### M9. APG mapping states two Foundation facts wrongly

- File: `research/aria-apg-patterns.md`, AccordionMenu section (line 168) and Orbit section (lines 305 and 331).
- Rule: `/research` step 1.
- Evidence: "accordionMenu then ... gives the parent `a` `aria-controls` and `aria-expanded`". The source sets them on the `li` (`$elem = $(this)` over items, `$elem.attr({'aria-controls', 'aria-expanded', 'id'})`, `foundation.accordionMenu.js:74-78`), which `research/foundation-inventory-menus.md` 1.2 records correctly. "`accessible: true` (makes `.orbit-wrapper` focusable ...)" and "drop the focusable `.orbit-wrapper`": the focused element is `.orbit-container` (`this.$wrapper = this.$element.find('.' + containerClass)`, `foundation.orbit.js:59`, `:95-97`), as `research/foundation-inventory-forms-media.md` notes explicitly.
- Fix: correct both; the conclusions (state on a `role=none` element; a focusable non-widget container) still hold for the right elements.

### M10. CDK inventory makes Foundation and platform claims the other research contradicts

- File: `research/angular-cdk-inventory.md`, summary table (platform row), layout, accordion and platform sections.
- Rule: `/research` step 1; audit brief item 4.
- Evidence: "Foundation's `Touch` utility (swipe for Orbit, OffCanvas, Slider)" and "Orbit and OffCanvas swipe": OffCanvas imports no Touch utility (`research/foundation-inventory-menus.md` 6.7 "No Nest, Motion, Box, Touch"; utilities table row OffCanvas, Touch column "-"). Layout section lists "`data-hide-for` / `data-show-for`" and "Dropdown (position/alignment per breakpoint)"; Foundation has neither a `showFor` option nor per-breakpoint Dropdown positioning. Accordion section ranks "native `<details name="...">` grouping" as the level above Aria without noting that `<details name>` misses the browser target (Chrome 120, Firefox 130, Safari 17.2; `research/web-platform-features.md` section 4, BCD re-verified by this audit).
- Fix: correct the three claims and add the target caveat.

### M11. Decisions stated inside research files and answers

- Files: `research/tooling-baseline.md` ("Decision for the specs: the new repo uses `@storybook/angular-vite`", three "Verdict" paragraphs); `issues/06` Answer ("Signal Forms is the Abide replacement"); `research/angular-22-api-survey.md` line 184 ("Accordion, Tabs, Orbit, DropdownMenu, Drilldown are parent directives that enumerate child directives via `contentChildren(..., {descendants: true})`") and line 231 ("Triggers, Keyboard and Nest utilities become host directives"); `research/angular-material-reference.md` ("`animate.enter`/`animate.leave` with those class names is the fitting mechanism"; "A Foundation `MediaQuery` service must ...").
- Rules: `/wayfinder` ("Research: ... to surface a fact a decision waits on"); audit brief item 3 (no decisions smuggled into research).
- Evidence: as quoted. Two of them collide with other documents: the map fog still treats "Signal Forms as the Abide replacement" as a prototype question and ticket 31 asks "Signal Forms versus Reactive Forms"; `research/di-and-composition-patterns.md` section 3c shows Aria deliberately avoids `contentChildren` for item discovery (`src/aria/menu/menu.ts:120-129`), so the survey's line 184 steers specs away from the pattern the DI research recommends. The tooling "Decision" repeats a user decision already on the map, which is harmless in effect but still a decision recorded in research.
- Fix: reword each as a candidate or a consequence ("a candidate replacement", "one option is"), and point the tooling note at the map's Testing preference as the owner of that decision.

### M12. Spec tickets offer out-of-target platform features as plain alternatives

- Files: `issues/14` item 6 (`interpolate-size`), `issues/15` (`<details name>`, `interpolate-size`), `issues/18` (`@starting-style`), `issues/26` (native `popover` plus CSS anchor positioning as a possible first choice), `issues/27` ("popover `hint`").
- Rule: map Browser support preference ("A platform feature counts as available only if it was Baseline widely available on that date; anything newer needs a fallback or is not used").
- Evidence: all of these miss the 2026-05-07 target per `research/web-platform-features.md` (`interpolate-size` Chromium only; `<details name>` Chrome 120; `@starting-style` Firefox 129 / Safari 17.5; popover Firefox 125; anchor positioning 2026; `popover="hint"` no WebKit). The tickets were written before that research resolved and were not updated.
- Fix: annotate each mention with "out of target; fallback required" and the fallback the research names (grid `0fr/1fr`, `toggle` listener for exclusivity, Motion UI class path, CDK Overlay or measured positioning, `popover="manual"`).

### L1. Line drift in a few otherwise correct citations

- Files and evidence: `research/foundation-inventory-positioned.md` cites `scss/components/_tooltip.scss:145` for `position: absolute` (it is at `:63` in the mixin; line 145 is blank); `research/angular-aria-inventory.md` cites `private tree.ts:618` for the forced `multiExpandable` (blank line; the setting is `:373`); `research/di-and-composition-patterns.md` cites `aria/tabs/tab.ts:55` for the id input (`:62`), `material/tabs/tab.ts:25-29` for `MAT_TAB_GROUP` (`:37`), `aria/accordion/accordion-group.ts:62` for the provider (`:69`); `research/angular-material-reference.md` cites `M/expansion/accordion.ts:23` for the directive (an import line).
- Rule: `/research` step 2.
- Fix: correct the numbers.

### L2. Material and DI research disagree on Material's signal-input count

- Files: `research/angular-material-reference.md` 0.1 ("32 `input()`/`model()` and 3 `output()` sites"); `issues/09` Answer ("one `model()`"); `research/di-and-composition-patterns.md` section 8 ("Material is 15 `input(` against 492 `@Input`").
- Evidence: the 492 `@Input` count reproduces (rg over `src/material`, specs and testing excluded). A rough rg for `input(`/`input<` gives 18 and for `model(` gives 1, matching neither 32 nor 15; the counting method is not stated in either file.
- Fix: state the rg command beside the number and make the two files agree.

### L3. Two dates for Aria's promotion to stable

- Files: `research/angular-cdk-inventory.md` ("dropped its developer-preview tag in commit `84f2afd24`, 2026-05-09"); `research/angular-aria-inventory.md` 1.3 ("`CHANGELOG.md` 22.0.0 (2026-06-03)").
- Evidence: both hold (commit date versus release date, verified with `git log` and `CHANGELOG.md:290, 385`), but neither says which event it dates.
- Fix: say "commit date" and "release date".

### L4. Decisions-so-far gists restate findings at length

- File: `map.md`, Decisions so far.
- Rule: `/wayfinder` ("one-line gist of the answer ... enough to judge relevance").
- Evidence: several gists list twenty or more facts (the web platform line enumerates 22 features); the API survey gist also records a map edit (see H4).
- Fix: cut each to one sentence of what the ticket settled and let the link carry the detail.

### L5. Consistency review typed as a task

- File: `issues/36-consistency-review.md`.
- Rule: `/wayfinder` Ticket Types (a task "earns its place by unblocking a decision, not by delivering the destination").
- Evidence: the ticket decides ("update the map where a spec made a better-argued choice") and delivers part of the destination (`README.md`, "the consistency review has passed" is in the Destination).
- Fix: either retype it `grilling` (AFK, per the override) or add one Note line stating that this effort uses a task for the closing review by design.

### L6. APG research was asked to choose, so it chose

- Files: `issues/10` Deliverable ("the chosen pattern"); `research/aria-apg-patterns.md` summary table ("Governing APG pattern", defaults for every menu plugin).
- Rule: `/wayfinder` research surfaces facts; decisions belong to the building-blocks and spec tickets.
- Evidence: "Every menu plugin ... maps to the Disclosure Navigation Menu pattern by default". The facts behind it (three APG cautions) are sound; the choice itself is the ticket's framing.
- Fix: none for this wave; later research tickets should ask for "applicable patterns and the APG's own guidance" rather than "the chosen pattern".

### L7. Research cites sources outside the map's Sources list without saying so

- Files: `research/tooling-baseline.md` (builder schema from a `d:/projects/github/angular/angular-cli` clone "at 22.0.x, the npm 22.2.0 package carries the same option set"); `research/angular-rendering-modes.md` section 6 (this repo's `node_modules/@storybook/angular` 10.1.10).
- Rule: `/research` step 1 (the claim must hold at the source that owns it); map Out of scope (this repo is not a source).
- Evidence: the 22.2.0 equivalence is asserted, not shown; the Storybook observation is about the old repo's installed version, not the target 10.6 `angular-vite` framework (the file says so).
- Fix: verify the builder schema against the 22.2.0 tarball, or mark the claim unverified; keep the node_modules observation but label it "old repo, not the target stack".

### L8. Non-ASCII characters in the map

- File: `map.md` lines 124 to 137 (U+2014 em dash in every Decisions-so-far line).
- Rule: effort convention "Plain ASCII" for research; the user's global preference for ASCII in committed artifacts (look-alike characters defeat literal searches).
- Fix: replace with ` -- ` or `: `. All research and ticket files are pure ASCII.

### L9. A banned word in the positioned inventory

- File: `research/foundation-inventory-positioned.md` line 686 (Magellan public methods, the `reflow()` bullet).
- Rule: the user's banned-word list (the past-tense form of the verb that the list replaces with "connected" or "integrated").
- Fix: "`reflow()` (js:141-144): `calcPoints` + `_updateActive`; bound to `resizeme`." No other banned word appears in the map, tickets or research (`rung` appears alone, never with the paired word the list bans).

### L10. The map lists a tooling ticket's link text and gist that restate numbers owned by the ticket

- File: `map.md` Target platform table.
- Rule: `/wayfinder` index, not store.
- Evidence: the version table carries peer-range reasoning ("5.0.2 is published but refused by @nx/vitest 23.2.1, the Nx Angular library generator, and @storybook/addon-vitest 10.6") that belongs to the tooling ticket. Keeping a version table in Notes is fine as a standing preference; the reasons should be a link.
- Fix: keep the versions, replace the parenthetical reasons with a link to the tooling ticket by name.

## Verified OK

Map (`/wayfinder`):

- Destination names the end state and fixes scope (22 specs, building-blocks map, a Playwright CT answer, a testing-stack decision, a passed consistency review); the 21 plugin names match `js/foundation.*.js` plugin classes.
- Notes carry domain, skills to consult, standing preferences, design criteria, spec shape, model per ticket and audit cadence.
- AFK override, research-files-instead-of-branches override, and glossary/ADR-in-effort-directory override are each stated explicitly.
- The map does not list open tickets (apart from the bare-number references in M7).
- Out of scope entries are all beyond the destination, not fog.
- Decisions so far has one entry per resolved research ticket (01 to 13 and 38), each linking the ticket and the findings file.

Tickets (tracker and `/wayfinder`):

- All 41 ticket files use `Type:`, `Status:`, `Blocked by:`, `Labels: wayfinder:<type>` and `Map:` lines near the top and a `## Question` body, per `docs/agents/issue-tracker.md` and the map's "Where things live".
- Research tickets 01 to 13 and 38 are `Status: resolved`, carry `## Answer` with a gist, surprises, open questions, and a findings link, and paste no findings content wholesale.
- Type labels fit the work for 01 to 13, 38 and 39 (research), 40 (prototype), 14, 15 to 35, 37 and 41 (grilling, AFK per the override).
- Blocking forms an acyclic order: research first, building blocks after research, specs after building blocks and rendering modes, dependent specs after their base (19 after 15 and 16; 23 after 20, 21, 22; 27 after 26; 30 after 29), testing chain 39 to 40 to 41, review last.
- Each question is a single, precise question sized to one session; the fog is not pre-sliced into tickets.
- Ticket 40 follows the prototype skill's intent (throwaway workspace outside the repo, question stated, results table, "what this does not prove"), apart from the capture-location override in M6.

Research (`/research`), with citation spot checks (at least ten per file; all passed except those reported above):

- `foundation-inventory-disclosure.md`: 19 checks passed (for example `accordion.js:23` and `:28-35`, `tabs.js:201`, `responsiveAccordionTabs.js:197` and `:289`, `toggler.js:44`, `:86`, `:143`, `reveal.js:38-40` and `:164`, `triggers.js:15-19`, `_settings.scss:111-117`, `_accordion.scss:134`, `reveal.md:74`, `test/.../reveal.js:158`, `_reveal.scss:182-184`, `core.plugin.js:19`, `:30`, `_tabs.scss:102-106`).
- `foundation-inventory-menus.md`: plugin-file and nest, box, touch, mediaQuery citations passed (`nest.js:4-12`, `box.js:18-20`, `mediaQuery.js:280-294`, `touch.js:21-25, 53-54, 92-97`, `accordionMenu.js:60-86`); failures in H1.
- `foundation-inventory-positioned.md`: 15 checks passed (`positionable.js:5-14`, `:119`, `dropdown.js:37-41`, `:198-215`, `tooltip.js:71-83`, `:133-136`, `box.js:66-68`, `_dropdown.scss:43`, `_breakpoint.scss:14-20`, `magellan.js:42`, `:84-92`, `smoothScroll.js:82`, `magellan.md:95`, defaults for `closeOnClick`, `hoverDelay`, `dynamicHeight`, `checkEvery`; commit `bca6cf55f` dated 2018-04-03).
- `foundation-inventory-forms-media.md`: plugin citations passed (`abide.js:21`, `:459`, `slider.js:40-59`, `:322-330`, `orbit.js:38-47`, `:95-97`, `:372`, `interchange.js:243-247`, `equalizer.js:36-41`, `core.utils.js:20-28`, timer `:4`); failures in H2.
- `foundation-utilities-conventions.md`: 11 checks passed (`core.js:5`, `:230`, `:323-328`, `offcanvas.js:544`, `tooltip.js:366`, `triggers.js:163`, `:244-258`, `motion.js:9-10`, `mediaQuery.js:281-283`, `timer.js:4`, `touch.js:157-162`).
- `angular-22-api-survey.md`: 13 checks passed (`typescript_support.ts:19`, `:29`, `constants.ts:25`, `document.ts:20`, `roadmap.md:62-64`, `CHANGELOG.md:857`, `:859`, `linked_signal.ts:27`, `dom-apis.md:44`, `animations/overview.md:3`, `debounce.ts:32`, root `package.json:130,167`).
- `angular-aria-inventory.md`: 11 checks passed (`accordion-group.ts:93`, `accordion-trigger.ts:73`, `:85`, `tab-list.ts:106`, `:109`, `menu.ts:150`, `deferred-content.ts:27`, `tree.ts:146`, `keyboard-event-manager.ts:33-35`, `CHANGELOG.md` 22.0.0 header and `#33232` row, HEAD `708d4c6e2`); one drift in L1.
- `angular-cdk-inventory.md`: source citations passed (see H3); doc citations failed.
- `angular-material-reference.md`: 9 checks passed (`timepicker-input.ts:122`, `drawer.ts:311`, `dialog-container.ts:38-42`, `animation.ts` imports, `tooltip.ts:94-97`, `cdk/accordion/accordion.ts:22`, `dialog.ts:17`, `slider-input.ts:67-80`, the 492 `@Input` count); Foundation-side claims failed in H5.
- `aria-apg-patterns.md`: 9 checks passed (APG clone `3f094fd` dated 2026-09-15, ARIA clone `ffa9651` dated 2026-09-24, the dialog "DO NOT make the element with role dialog focusable" quote in `dialog-modal/examples/dialog.html:126`, the tooltip "does not yet have task force consensus" banner, no tooltip example directory, the carousel "page would become unusable" quote in both examples, the accordion "approximately 6 panels" caution, the keyboard "strongly advised NOT" quote, anchors `aria-haspopup`, `tooltip`, `aria-current` at the cited ARIA lines); Foundation-side errors in M9.
- `di-and-composition-patterns.md`: 6 checks passed (`cdk/accordion/accordion.ts:22-27` retention comment, `expansion-panel-header.ts:60`, `aria/menu/menu.ts:120-129` contentChildren note, `menu-stack.ts:31-34`, HDI guide `:748-752`, guide length); drift in L1.
- `web-platform-features.md`: 12 BCD values re-read from raw mdn/browser-compat-data on 2026-09-25 all matched (`details`, `details.name`, `:has`, `popover`, `popover.hint`, `inert`, `:user-invalid`, `@starting-style`, `requestClose`, `closedBy`, `showModal`, `anchor-name`); the target-set grading is consistent with the map's browser table.
- `tooling-baseline.md`: registry facts re-verified (`@storybook/addon-vitest@10.6.0` peers `vitest ^3 || ^4` and `@vitest/browser-playwright ^4.0.0`; `@nx/vitest@23.2.1` peers `vitest ^3 || ^4`; `typescript` dist-tags `latest` 7.0.2, `beta` 6.0.0-beta; `@angular/build@22.2.0` peers `vitest ^4.0.8 || ^5.0.0`).
- `angular-rendering-modes.md`: 12 checks passed (`hydration.ts:146-151`, `:286-292`, `api.ts:343-346`, `hooks.ts:227-228`, `animation.ts:63-65`, `error_handling.ts:59-72`, `event_dispatcher.ts:29-31`, `:121-130`, `deferred-content.ts:56-62`, `id-generator.ts:24`, `:47`, `triggers.ts:28` hover names); its section 0 correctly flags the API survey's outdated hydration statement, and its checklist keeps constraints separate from decisions.
- Every research file separates findings from open questions, is plain ASCII, and (apart from L9) uses no banned word.
- Cross-document consistency that holds: breakpoint values (px in Sass, em in the serialised map) agree across the four Foundation files and the CDK file; the Toggler listens only to `toggle.zf.trigger` in both the disclosure and utilities files; the event-naming split (hyphenated lifecycle, camelCase state events) is stated the same way in three files; the TypeScript 6.0.x and Vitest 4.1.x pins agree between the tooling file and the map table; Storybook framework `@storybook/angular-vite` agrees between the tooling file and the map's Testing preference.

## Resolution log

(For the orchestrator: record here which findings were fixed, turned into tickets, or rejected, with the commit that did it.)

Orchestrator, 2026-09-25:

- M4 fixed in commit 60fd449 (graduate the building-blocks fog into tickets): the four live-ticket fog patches were removed and the prototype patch graduated into tickets.
- M1, M2 fixed in the commit "apply mechanical fixes from the research-wave audit": every component spec ticket now reads the rendering-modes research and the prototype answers first, its rendering item names the full rendering-modes contract, and its testing item names the four test layers.
- H6, M12 handled in the same commit by a guard paragraph in every component spec ticket: take option names from the inventories and Foundation source, not the ticket; out-of-target platform features only as a named future upgrade or behind a fallback. The per-ticket option lists were not rewritten.
- M3: the browser testing stack decision now waits on the building-blocks ticket (commit 60fd449). The building-blocks ticket had already resolved; the rendering-modes findings reached it before it finished and its answer records them. The building-blocks wave audit must confirm this.
- M5, M6, M7 fixed on the map in the same commit: the DI criterion is reworded, the new locations and the prototype capture override are listed, bare ticket numbers on the map are replaced by linked names, and the tooling ticket is retitled "... Vitest browser mode" with matching link text. Bare numbers inside the consistency review and testing stack tickets were not all replaced.
- H4: the orchestrator changed the map's versions (TypeScript 6.0.x, Vitest 4.1.x) on the facts in the Angular API survey (compiler-cli pins TypeScript to 6.0.x) and the tooling baseline (Nx 23.2.1 and addon-vitest 10.6 refuse Vitest 5). Still pending: a correction note in the API survey ticket's answer and in research/angular-22-api-survey.md.
- Pending for the next session, one repair agent per research file: H1, H2, H3 (re-derive the line citations), H5 (correct the Foundation facts in the Material reference against the inventories), M8 (correction notes in the API survey), M9, M10 (Foundation and platform facts in the APG and CDK files), M11 (turn stated decisions into options or cite the ticket that decided them), L1 to L10.

Orchestrator, second session, 2026-09-25:

- L8 fixed in commit 2a18a22 (use ASCII dashes on the map).
- L4, L10, and the map part of H4 fixed in the commit "apply the orchestrator's research-wave audit fixes": every Decisions-so-far gist is one sentence, the API survey gist points to the tooling ticket for the pins, and the version table's reasons are replaced by a link to the tooling ticket.
- L5 fixed in the same commit: the consistency review is retyped `grilling` (AFK per the map's override), because it decides where a spec's choice beats the building-blocks map.
- M7 residue fixed in the same commit: the testing stack ticket's "(ticket 38)" is now a linked name; the consistency review ticket already carried none.
- L6 needs no change (the audit said so).
- Research-file repairs (H1 to H3, H4 and M8 in the survey, H5, H6 in the web platform file, M9 to M11, L1 to L3, L7, L9) run as one repair agent per file; each lands as its own commit, recorded below.

- L1 (positioned half) and L9 fixed in the commit "repair the positioned inventory's tooltip citation and wording": `_tooltip.scss:145` is now `:63`, and the Magellan `reflow()` bullet no longer uses the banned word.
- L1 (Aria half) and L3 (Aria half) fixed in the commit "repair the Aria inventory's tree citation and date label": the forced `multiExpandable` is cited at `private/tree/tree.ts:373`, and 2026-06-03 is labelled the 22.0.0 release date.
- M7 (rendering-modes file) and L7 (rendering-modes half) fixed in the commit "name the rendering-modes ticket and label the old Storybook observation": the header links the ticket by name, and the installed `@storybook/angular` 10.1.10 observation is labelled the old repo's stack, not the target.
- M11 (tooling part) and L7 (tooling half) fixed in the commit "reword the tooling baseline's verdicts and verify the builder schema": the Storybook framework note points at the map's Testing preference as its owner, the three verdicts read as findings, and the unit-test builder schema was checked against the `@angular/build@22.2.0` tarball (same options plus a deprecated `splitting` flag). The orchestrator also updated two sentences that still called the map's charting-draft TypeScript 7.0.2 row current.
