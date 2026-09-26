# Audit 0004: second spec wave

Date: 2026-09-26
Auditor: audit subagent (read-only except this file)

## Scope

Everything below was audited as committed at HEAD `d70625e` ("record audit 0003's resolution log"), read from a `git archive` snapshot of that commit, never from the working tree. Other agents were editing `specs/orbit.md`, the [Re-run: Orbit spec, the slide's ARIA contract and the focus handoff](../issues/70-rerun-orbit-slide-contract-and-focus-handoff.md), the [Spec: Responsive Menu](../issues/23-spec-responsive-menu.md) (with a new `specs/responsive-menu.md`), and a proposed ADR while this audit ran; those files are out of scope, and the Orbit spec is cited only where an in-scope document depends on it.

- The second spec wave: `specs/reveal.md`, `off-canvas.md`, `dropdown.md`, `tooltip.md`, `responsive-accordion-tabs.md`, `nested-menu.md`, `accordion-menu.md`, `dropdown-menu.md`, `drilldown-menu.md`, with the [Spec: Reveal](../issues/18-spec-reveal.md), [Spec: Responsive Accordion Tabs](../issues/19-spec-responsive-accordion-tabs.md), [Spec: Off-canvas](../issues/25-spec-off-canvas.md), [Spec: Dropdown](../issues/26-spec-dropdown.md), [Spec: Tooltip](../issues/27-spec-tooltip.md), [Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md), [Spec: Accordion Menu](../issues/20-spec-accordion-menu.md), [Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md), and [Spec: Drilldown Menu](../issues/22-spec-drilldown-menu.md) tickets and ADRs 0030 to 0033.
- The prototypes and re-runs resolved since audit 0003's snapshot (`1138297`): the [Prototype: Smooth Scroll under Router scroll restoration and replay](../issues/62-prototype-smooth-scroll-router-restoration.md), [Prototype: Sticky measurement refinements](../issues/63-prototype-sticky-measurement.md), [Prototype: Slider before hydration, non-linear bounds, and RTL](../issues/64-prototype-slider-hydration-nonlinear.md), [Prototype: Orbit keyboard scrolling and hydration details](../issues/65-prototype-orbit-keyboard-hydration.md), [Prototype: Abide control kinds, value adoption, and the ready gate](../issues/66-prototype-abide-controls-and-ready.md), [Re-run: Interchange spec, the `replaced` timing and the outlet's focus rule](../issues/67-rerun-interchange-replaced-timing.md), [Re-run: Slider spec, hydration adoption, non-linear bounds, and forced colours](../issues/68-rerun-slider-hydration-findings.md), and [Prototype: Reveal `'auto'` offsets in CSS](../issues/69-prototype-reveal-auto-offsets.md), with their captures under `prototypes/` (`smooth-scroll-router`, `sticky-measurement`, `slider-hydration-nonlinear`, `orbit-keyboard-hydration`, `abide-controls-and-ready`, `interchange-replaced-timing`, `reveal-auto-offsets`); the [Prototype: Interchange template outlet under hydration](../issues/61-prototype-interchange-outlet-hydration.md) was read as the input to the Interchange re-run. Also the spec revisions they caused (`specs/slider.md`, `interchange.md`, `sticky.md`, `reveal.md`, `abide.md`, `smooth-scroll.md`, `magellan.md`, `breakpoint-service.md`) and whether each failed case reopened its spec as the map's rule says.
- The 25 fix commits since audit 0003 (`git log bee6e1a..d70625e`): whether audit 0003's Resolution log holds, with at least one claimed fix spot-checked per finding.
- Cross-bundle agreement at the snapshot: `building-blocks.md` (every Table A, B, C row and Part 1 rule touched since `bee6e1a`), `CONTEXT.md`, `map.md` (one Decisions-so-far line per resolved ticket matching its ticket, Not yet specified, OPEN FOR HUMAN items only of the kinds the triage rule allows), `storybook-conventions.md`, and every spec's agreement with the shared utility specs it consumes (Triggers, Breakpoint service, Anchored pane, Nested menu) and with the rendered-state rule in building-blocks 1.5.

Not in scope: the research files and research tickets, first-wave specs except where revised since `1138297` or consumed by a second-wave spec, and the open tickets except for their status lines.

Governing rules: `/wayfinder`, `/research`, `/domain-modeling` (with `CONTEXT-FORMAT.md`, `ADR-FORMAT.md`), `/grill-with-docs` and `/grilling`, `/to-spec`, `/mattpocock-skills:prototype` (with `LOGIC.md`, `UI.md`), `docs/agents/issue-tracker.md`, `docs/agents/domain.md`, the repo skill `.claude/skills/foundation-api-design/SKILL.md`, and the standing rules, spec shape, AFK override, and orchestration rules (the triage quadrant and the prototype-reopens-spec rule) in `map.md` Notes. The user's standing rules checked in every spec: Foundation SCSS reused, never re-implemented; WCAG 2.2 AA as requirements with the six axe tags; unrounded contrast checks; the browser testing stack wording (ADR 0018); render hooks and `injectAsync` stated per spec.

## Method

The governing skills, `map.md`, `building-blocks.md`, `CONTEXT.md`, audit 0003, ADRs 0022 and 0030 to 0033, the two `docs/agents` files, and the foundation-api-design skill were read in full by the auditor. The rest was split across five read-only sub-audits that shared one checklist and one report format and read their files in full from the same snapshot:

1. Reveal, Off-canvas, Dropdown, Tooltip, their tickets, ADRs 0030 and 0031 (with ADRs 0002, 0007, 0013, 0024), and the Triggers, Anchored pane, and Breakpoint service specs as consumed.
2. Responsive Accordion Tabs, Nested menu, Accordion Menu, Dropdown Menu, Drilldown Menu, their tickets, ADRs 0032 and 0033 (with ADRs 0004, 0008, 0014, 0028), and the Accordion, Tabs, Anchored pane, and Breakpoint service specs as consumed.
3. The eight prototype and re-run tickets and the Interchange outlet prototype, their captures (READMEs, the decisive files they name, captured logs and results), the revised specs, and their spec tickets.
4. Audit 0003's Resolution log, row by row, against the snapshot and against `git show --stat` of every cited commit.
5. The shared documents: every `building-blocks.md` hunk since `bee6e1a`, `CONTEXT.md`, `map.md`, `storybook-conventions.md`.

Every finding rated High was re-checked by the auditor against the snapshot, and the contrast finding also against the Foundation clone. The commit times were used to date rules against specs: the unrounded contrast rule reached `specs/button.md` in `6120db8` (10:27) and building-blocks 1.10 in `5acccc7` (14:02); the Off-canvas spec resolved in `d0e6fc1` (10:24) and the Reveal spec in `0466985` (10:29); the Dropdown Menu and Drilldown Menu specs resolved in `45f44fc` and `85603c7` (14:06), and the last matrix carry, `fc47a1c` (14:14), did not apply their proposals.

A Node script ran over 240 in-scope files (every file changed between `1138297` and `d70625e` in the effort directory, less the three out-of-scope files: 109 Markdown files plus captured code, logs, and configuration; images skipped) and again over all 169 Markdown files of the snapshot. It checked for:

- non-ASCII characters;
- the banned-word list with inflections, including the one banned word pair;
- bare ticket references in narration and undefined citation keys;
- email-shaped tokens, by allowlist inversion;
- every relative Markdown link and heading anchor, resolved against the file's own directory;
- link texts that differ from the linked ticket's title.

Positive controls: a governing skill file (55 non-ASCII characters found), the user's instruction file (15 banned-word hits and one non-approved email-shaped token found, not reproduced here), and a control Markdown file carrying a banned word, a bare ticket number, a missing target, and two missing anchors (all found). `rg -P '[^\x00-\x7F]'` over the whole snapshot exits 1 (no match), as does a banned-word `rg`; the script exits 1 on the findings listed below. At least 25 facts were spot-checked against the local clones (foundation-sites v6.9.0; angular/angular and angular/components on `22.2.x`; aria-practices; aria); they are under Verified OK.

Convention in this file: links inside proposed replacement text are written relative to this file so they resolve here; rewrite them relative to the target document when applying.

## Summary

| Severity | Count |
| --- | --- |
| High | 3 |
| Medium | 9 |
| Low | 10 |
| Total | 22 |

Severity definitions:

- High: a document the next repository or a pending spec would read as written would be misled, or it contradicts a user rule or an ADR.
- Medium: a skill or map rule is broken in a way that weakens the bundle, without by itself planting a wrong fact in a pending spec.
- Low: hygiene.

The main pattern: the nine second-wave specs are thorough, follow the to-spec shape, state their Implementation level, render hooks, and `injectAsync` decisions, and consume the shared utilities member for member. What lags is the bundle around them. Two cross-cutting rules have not reached every spec: the unrounded contrast rule (H1), which even ADR 0022 contradicts, and the rendered-state rule of 1.5, added after the specs it now governs (M4). The shared-document proposals of the last two menu specs were never carried, while the Responsive Menu spec is being written from the matrix (H2). Several matrix cells still pose prototype questions that have been answered (M2). Audit 0003's Resolution log opens with "Every finding is fixed", but 12 of its 27 rows are only partly fixed at the snapshot (see the Resolution log check below).

## Findings

### H1. Five specs and ADR 0022 check contrast with Foundation's rounding `color-contrast()`, against the user's unrounded rule and building-blocks 1.10

- File: `adr/0022-wcag-2-2-aa-enforcement.md:7`; `specs/reveal.md:328`, `:676`, `:678`; `specs/off-canvas.md:326`, `:327`, `:642`, `:644`; `specs/accordion-menu.md:256`, `:576`, `:578`; `specs/nested-menu.md:354`, `:704`; `specs/accordion.md:550` (D19), `:659`; `specs/responsive-accordion-tabs.md:679`; `issues/18-spec-reveal.md:96`; `issues/20-spec-accordion-menu.md:162`; `issues/25-spec-off-canvas.md:96-97`.
- Rule: the user's standing rule (unrounded contrast checks); `building-blocks.md:120` (1.10: "the mixin checks at compile time with the unrounded contrast ratio from Foundation's `color-luminance()` function and the WCAG contrast formula, never Foundation's `color-contrast()`, which rounds to one decimal and would pass a failing pair") and `:129`; one rule per Library mixin.
- Evidence:
  - Foundation's function rounds: `$ratio: round($ratio * 10) * 0.1;` (`foundation-sites/scss/util/_color.scss:65`), so a 2.95:1 pair reads 3.0 and the alert button's 4.498:1 reads 4.5, the case 1.10 names.
  - ADR 0022 `:7`: "where axe has no rule for a criterion (non-text contrast), the mixin checks it at compile time with Foundation's own `color-contrast()`". The ADR is the source 1.10 cites, and it states the opposite rule.
  - `specs/reveal.md:328`: "The `nfs-reveal` mixin computes the three ratios with Foundation's `color-contrast()` from the consumer's settings and emits `@warn`"; `:676` writes the checks as `color-contrast($closebutton-color, $reveal-background)`; `:678` lists `color-contrast()` as a reused function.
  - `specs/off-canvas.md:327`: "The mixin stops the compile with `@error` ... when `color-contrast($offcanvas-background, $closebutton-color) < 3`"; `:642` adds a `@warn` on `color-contrast($offcanvas-background, $anchor-color)` under 4.5.
  - `specs/accordion-menu.md:576`: "All computed with Foundation's `color-contrast()` from the consumer's values"; `specs/nested-menu.md:354`: "with Foundation's own `color-contrast()`". The same Nested menu spec's Sass checks, `:702`, say the reverse ("Ratios are computed from Foundation's `color-luminance()` with the WCAG formula and compared unrounded ... because Foundation's `color-contrast()` rounds to one decimal and lets 2.95:1 pass a 3:1 threshold"), so one `nfs-accordion-menu` mixin has two rules; the amendment `c794398` changed `:702` only.
  - `specs/accordion.md:659` keeps the `color-contrast(...)` `@warn` that the Responsive Accordion Tabs spec inherits (`:679`).
  - Button, Slider (`specs/slider.md:536`, D17), Responsive Toggle (`:422`), Dropdown Menu (`:630`), and Drilldown Menu (`:663`) follow the unrounded rule, so the bundle states both.
  - `specs/orbit.md:566` has the same form; it is out of scope here and listed only so the Orbit re-run picks it up.
- Fix:
  - ADR 0022 `:7`: replace "with Foundation's own `color-contrast()`" with "with the unrounded ratio from Foundation's `color-luminance()` and the WCAG contrast formula, never Foundation's `color-contrast()`, which rounds to one decimal (building-blocks 1.10)".
  - In every spec line listed, replace each `color-contrast(<a>, <b>)` comparison with the Drilldown Menu spec's wording (`specs/drilldown-menu.md:663`: "the ratio of `<a>` against `<b>`, computed from Foundation's `color-luminance()` with the WCAG formula and compared unrounded"), and in each Sass item (2) list `color-luminance()` instead of `color-contrast()`. Change Accordion D19 to "a Sass `@warn` from the unrounded ratio". Record the change in each spec ticket's decision log (the Reveal, Off-canvas, Accordion Menu, Nested menu, and Accordion tickets).

### H2. The Dropdown Menu and Drilldown Menu tickets' building-blocks and glossary proposals were never carried, so the matrix contradicts both specs while the Responsive Menu spec is written from it

- File: `building-blocks.md:218` (Table A Drilldown), `:245` (Table B Drilldown), `:247` (Table B DropdownMenu), `:254` (Table B ResponsiveMenu, DI cell), `:45` (1.3), `:58` and `:59` (1.4), `:69` (1.5), `:179` (1.13); `CONTEXT.md` (no Base side, Drilldown level, or Drilldown wrapper).
- Rule: map Concurrency rules (the orchestrator applies a ticket's shared-file changes); map Destination ("the building-blocks map agrees with them"); `/wayfinder` (a decision lives in one place); `/domain-modeling` ("Update CONTEXT.md inline"); audit 0003 H3 (the same pattern, rated High because a pending spec reads the rows).
- Evidence:
  - The [Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md) proposes four Table B edits (`:148-153`) and the Base side term (`:138-142`); the [Spec: Drilldown Menu](../issues/22-spec-drilldown-menu.md) proposes seven edits (`:157-165`) and two terms (`:143-151`). Their Nested menu amendments were carried (`c2b906f`); the building-blocks and glossary ones were not, and `fc47a1c`, the last matrix commit, touched only the AccordionMenu row among the menus.
  - Table B DropdownMenu `:247` still reads "optional keyframes via `animate` input", "hover-intent timers per item as signals", "`closed` reason (`'click' | 'keydown' | 'tab' | 'sibling'`, from Light dismiss)", and "Risk: `alignment: auto` reads `.top-bar-right` ancestry and RTL". The spec rejects the first by quoting the table (`specs/dropdown-menu.md:519`, D12; `:407` "No `animate` input") and the third (`:254`, `:259`, D7 `:514`).
  - Table A Drilldown `:218` still reads "`[nfsDrilldownBack]` on the consumer-written `li.js-drilldown-back > button`; wrapper `div.is-drilldown` written by the consumer" and "`scrollIntoView` for `scrollTop`"; the spec adds `[nfsDrilldownWrapper]` (`specs/drilldown-menu.md:21`, D1 `:518`), puts the back directive on the `li` (D7 `:524`), and rejects `scrollIntoView` by naming the table (D13 `:530`). Table B Drilldown `:245` still has "`nfsDrilldownBack` injects the owning `nfsSubmenu`" and "`closeOnClick` body listener attached in `afterNextRender`" against the spec's `:127-130`, `:243`.
  - 1.13 `:179` still names "drilldown wrapper height" as a `--nfs-*` channel and 1.5 `:69` "inline `min-height` from a measurement" as a `Renderer2` write; the spec binds a host style from a measured signal (D4 `:521`; Sass item 3 `:667`, "Custom properties: none"). 1.4 `:59` lacks the dropped `autoApplyClass` and `backButtonPosition` (`:81`, `:83`). The entry point `drilldown-menu` (D2 `:519`, a HIGH-impact triage item in the ticket) is recorded nowhere, and 1.3 `:45` reads as if the folder were `drilldown`.
  - "Base side" appears 10 times in `specs/dropdown-menu.md` and 7 times in `specs/nested-menu.md`, "Drilldown level" 12 times in `specs/drilldown-menu.md`; `rg "Base side|Drilldown level|Drilldown wrapper" CONTEXT.md` exits 1.
  - Not proposed by any ticket, same area: Table B ResponsiveMenu `:254` still calls the mode token "a signal of the active mode", while the Nested menu spec made it the `NfsMenuRoot` handle and rejects a bare signal (`specs/nested-menu.md:134`, D2 `:565`).
  - The open [Spec: Responsive Menu](../issues/23-spec-responsive-menu.md) (blocked by the three menu specs) composes `NfsDrilldown` and `NfsDropdownMenu` and reads these rows.
- Fix: apply the Dropdown Menu ticket's edits (`:150-153`) and the Drilldown Menu ticket's edits (`:159-165`) verbatim, add "entry point `drilldown-menu`" to the Table A Drilldown selector cell, and add the three drafted terms to `CONTEXT.md` (Base side after Open path; Drilldown level and Drilldown wrapper after Nested menu). Replace the first clause of the Table B ResponsiveMenu DI cell with "`nfsMenuModeToken` carrying the Nested menu's `NfsMenuRoot`, from `nfsMenuRootProviders` on the ResponsiveMenu root, whose provider wins over the three host directives'; `drive()` takes the breakpoint-resolved mode". One carry commit naming both tickets.

### H3. Five email-shaped tokens other than the approved address are committed in the Abide prototype's README

- File: `prototypes/abide-controls-and-ready/README.md:140`, `:141`, `:146`, `:147`, `:148`.
- Rule: the user's rule that no email address other than the approved public one is written into the repository (the effort's environment rules and the identity-hygiene allowlist inversion).
- Evidence: the "Mid-typing race console output" block (`:138-150`) records what the email field held after keystrokes were dropped during hydration. Five of its nine lines are the approved address with one or two letters missing, so each is a well-formed address that is not the approved one and could belong to someone else. The script's allowlist inversion found these five and no other non-approved token in the 240 in-scope files; the captured e2e specs type only the approved address (`e2e/ready.spec.ts:38`, `:104`), and the Abide prototype ticket quotes none of the five.
- Fix: rewrite the block so no line is email-shaped, for example one line per run naming the engine and the dropped characters with their positions ("chromium: 'a' at index 1 dropped"; "chromium: no character dropped"), and state the typed value once as "the approved test address". Run the allowlist inversion over captured logs before a capture is committed.

### M1. The Orbit keyboard prototype's failed case did not reopen the Orbit spec, and ADR 0025 and the matrix still state the measured-broken gate

- File: `issues/33-spec-orbit.md:4` (`Status: resolved`) and the end of its answer; `adr/0025-orbit-live-inert.md:7`, `:17`, `:18`; `building-blocks.md:252` (Table B Orbit, rendering and risk cells); `map.md:136`, `:190`; `audits/0003-prototypes-and-first-specs.md:523` (Resolution log, M11); `issues/62-prototype-smooth-scroll-router-restoration.md:13-16`.
- Rule: map Orchestration rules ("a failed case reopens the spec (Status back to open, the verdict appended)"); the prototype ticket's own `:16` ("If a case fails, the orchestrator reopens the Orbit spec"); `/mattpocock-skills:prototype` rule 6.
- Evidence:
  - The [Prototype: Orbit keyboard scrolling and hydration details](../issues/65-prototype-orbit-keyboard-hydration.md) records "Inert gate: no slide inert in server HTML | FAIL x3" (`:49`) and hands the spec "The `inert` gate cannot be implemented as an attribute-binding override of Aria `TabPanel`" (`:83`). Aria binds `'[attr.inert]': '!visible() ? true : null'` on every hidden panel (`components/src/aria/tabs/tab-panel.ts:49`).
  - The [Spec: Orbit](../issues/33-spec-orbit.md) is still `Status: resolved`, and `rg -i "reopen|65-prototype|70-rerun"` over it exits 1. The commit that resolved the prototype, `2bc94ac` ("resolve the Orbit keyboard prototype and reopen the slide contract"), does not touch the spec ticket.
  - ADR 0025 `:17-18` still says the wrapper's binding "must equal Aria's whenever both apply ... the spec defines it that way" and "Server-render tests assert that no slide carries `inert`", with no note of the failure. Table B Orbit `:252` still reads "none `inert` (applied only once live)" and points at "remaining questions in the [Spec: Orbit] Prototype needed section"; `map.md:190` still gists the live gate with no pointer (only `:209` names the failure).
  - The other failed cases took two paths the rule does not describe in full: the [Spec: Interchange](../issues/35-spec-interchange.md) (`:135-137`) and the [Spec: Slider](../issues/32-spec-slider.md) (`:177-179`) appended a "Re-run" section after a re-run ticket; the [Spec: Reveal](../issues/18-spec-reveal.md) appended the verdict (`:170-172`) and was corrected through the prototype's triage. No failed case set a spec ticket back to `Status: open`.
  - Audit 0003's Resolution log (M11 row) says the Orbit prototype "reopened [its spec] through re-run tickets". It also claims the case ordering for the Sticky prototype only; the [Prototype: Smooth Scroll under Router scroll restoration and replay](../issues/62-prototype-smooth-scroll-router-restoration.md) still names no deciding question (audit 0003 M11 fix bullet 3).
  - The [Re-run: Orbit spec, the slide's ARIA contract and the focus handoff](../issues/70-rerun-orbit-slide-contract-and-focus-handoff.md) exists and the consistency review waits on it, which is why this is Medium.
- Fix:
  - After the Orbit re-run's current edits land, append to the Orbit spec ticket a dated "Reopened" paragraph: "Reopened by the [Prototype: Orbit keyboard scrolling and hydration details](../issues/65-prototype-orbit-keyboard-hydration.md): ADR 0025's live `inert` gate loses to Aria `TabPanel`'s own binding in server HTML, and the focus handoff must wait for the render that lifts `inert`; worked in the [Re-run: Orbit spec, the slide's ARIA contract and the focus handoff](../issues/70-rerun-orbit-slide-contract-and-focus-handoff.md)", with `Status: open` until the re-run resolves.
  - ADR 0025 Consequences: "Measured not to hold (the [Prototype: Orbit keyboard scrolling and hydration details](../issues/65-prototype-orbit-keyboard-hydration.md)): Aria `TabPanel`'s `[attr.inert]` wins over the wrapper's binding in server HTML; the [Re-run: Orbit spec, the slide's ARIA contract and the focus handoff](../issues/70-rerun-orbit-slide-contract-and-focus-handoff.md) decides the replacement." Point Table B Orbit's two cells and `map.md:190` at the same two tickets.
  - Reword the map rule to the practice: "a failed case appends the verdict to the spec ticket and is worked by a re-run ticket that the consistency review waits on, or, for a text correction the prototype's triage decides, the verdict is appended and the spec corrected in place". Add to the Smooth Scroll router prototype ticket: "Question 1 decides a reopen of the Smooth Scroll spec, question 3 of the Magellan spec; question 2 refines only."

### M2. Five matrix cells still pose questions that resolved prototypes answered, one with the `ngDoCheck` fallback the Interchange re-run dropped

- File: `building-blocks.md:249` (Table B Interchange, risk cell), `:250` (Magellan, risk cell), `:258` (SmoothScroll, risk cell), `:256` (Reveal, risk cell), `:215` and `:242` (Table A and B Abide); `audits/0003-prototypes-and-first-specs.md:536` (Resolution log, unrecorded departure 2).
- Rule: `/mattpocock-skills:prototype` rule 6 (the verdict reaches the documents it settles); map Destination; `/wayfinder` (a decision lives in one place).
- Evidence:
  - Interchange `:249`: "Effect-driven outlet under rendering modes: does a directive on `<ng-container>` ... Default assumed: yes ...; fallback is comparing and swapping in `ngDoCheck` if it fails." The [Re-run: Interchange spec, the `replaced` timing and the outlet's focus rule](../issues/67-rerun-interchange-replaced-timing.md) dropped the fallback (the Interchange ticket's decision 39: "Is the `ngDoCheck` fallback kept? A: No. In a zoneless app ... the fallback kept the Server breakpoint's view on every route, in three engines"); `specs/interchange.md:189` "No `ngDoCheck` fallback". `git log -S"ngDoCheck" -- building-blocks.md` names only the commit that added it. Audit 0003's log records departure 2 as settled, but this cell was never revised.
  - Magellan `:250` ("Router history interplay ... (Prototype needed in the [Spec: Magellan])") and SmoothScroll `:258` (the Router question with "Default assumed") were both answered by the [Prototype: Smooth Scroll under Router scroll restoration and replay](../issues/62-prototype-smooth-scroll-router-restoration.md) (`map.md:213`).
  - Reveal `:256` says the offsets check "is graduated to" the [Prototype: Reveal `'auto'` offsets in CSS](../issues/69-prototype-reveal-auto-offsets.md), which resolved (`9bfcd7a`), with nothing on its verdict.
  - Abide `:215` and `:242` do not carry the [Prototype: Abide control kinds, value adoption, and the ready gate](../issues/66-prototype-abide-controls-and-ready.md) results the spec now states: a custom `FormValueControl` links only through its wrapping label (`specs/abide.md:135`), and text entry inside `hydrate on interaction` has a documented limit and trigger recommendation (`:427`). The prototype ticket proposed no building-blocks change, so nothing was queued.
- Fix:
  - Interchange: "Settled by the [Prototype: Interchange template outlet under hydration](../issues/61-prototype-interchange-outlet-hydration.md) (server HTML, clean hydration, swap in the handoff tick) and the [Re-run: Interchange spec, the `replaced` timing and the outlet's focus rule](../issues/67-rerun-interchange-replaced-timing.md) (`replaced` and the focus move wait on the rendered-rule signal, 1.5); no `ngDoCheck` fallback, which never swaps in a zoneless app."
  - Magellan and SmoothScroll: "Settled by the [Prototype: Smooth Scroll under Router scroll restoration and replay](../issues/62-prototype-smooth-scroll-router-restoration.md): the Router undoes unhandled native jumps; in a dehydrated block the replayed handler's scroll stands; `replaceState` survives route round trips; `pushState` restores the wrong position under enabled restoration."
  - Reveal: "... confirmed by the [Prototype: Reveal `'auto'` offsets in CSS](../issues/69-prototype-reveal-auto-offsets.md) within Foundation's rounding; a dialog taller than rule 4's cap sits at `min(50px, 5vh)`."
  - Abide: add the wrapping-label link for custom controls to Table A, and "text-entry blocks use `hydrate on viewport`, `idle`, or `immediate`, not `on interaction`" to the Table B rendering cell.

### M3. Triage-decided items still read OPEN FOR HUMAN on the map, in ADR 0017, in four spec tickets, and in three prototype write-ups

- File: `map.md:157`, `:176`, `:177`, `:178`, `:179`, `:183`, `:185`, `:186`, `:189`; `adr/0017-smooth-scroll-click-handling.md:13`; `issues/17-spec-toggler.md:112-114`, `issues/24-spec-responsive-toggle.md:119-121`, `issues/29-spec-smooth-scroll.md:104-106`, `issues/35-spec-interchange.md:99-101`; `issues/42-prototype-reveal-dialog.md:133`; `issues/61-prototype-interchange-outlet-hydration.md:132`, `:142-146` and its README `:240`, `:253`; `prototypes/abide-controls-and-ready/README.md:240-242`, `:251-253`; `prototypes/sticky-measurement/README.md:41-43` and `styles.scss:7-9`.
- Rule: map Orchestration rules, triage ("every other item is decided with the applied default"); `/wayfinder` (the Decisions-so-far gist matches its ticket); audit 0003 M3, whose fix covered other lines of the same kind and is reported fixed.
- Evidence:
  - `map.md:177` (Interchange) "focus after a swap is OPEN FOR HUMAN": the [Spec: Interchange](../issues/35-spec-interchange.md) Triage says "DECIDED: move focus to the first tabbable element" (`:131`), refined by the re-run's decision 40.
  - `:178` (Toggler) "a disclosure-role switch for class mode is OPEN FOR HUMAN": the [Spec: Toggler](../issues/17-spec-toggler.md) Triage `:157` "DECIDED: no role override".
  - `:179` (Smooth Scroll) "URL fragment writing is OPEN FOR HUMAN": the [Spec: Smooth Scroll](../issues/29-spec-smooth-scroll.md) Triage `:139` "DECIDED: the URL stays unchanged"; the item that does stay open (the `<base href>` links, trap quadrant) is not named. ADR 0017 `:13` still says "left OPEN FOR HUMAN in the ticket", the bullet audit 0003 M3 named.
  - `:183` (Equalizer) "whether to ship the directive in the first release is OPEN FOR HUMAN": the [Spec: Equalizer](../issues/34-spec-equalizer.md) `:127` "DECIDED: ship the optional directive pair", and `building-blocks.md:248` "decided at triage".
  - `:185` (Responsive Toggle) "open state across a breakpoint change is OPEN FOR HUMAN": the [Spec: Responsive Toggle](../issues/24-spec-responsive-toggle.md) Triage `:160` "DECIDED: `isOpen` persists".
  - Earlier gists superseded by later decisions: `:157` "two points are left OPEN FOR HUMAN" (both decided, `building-blocks.md:329-330`); `:176` the pre-hydration submit (ADR 0027); `:186` the expanded-item class hook (ADR 0033); `:189` "the `auto` offsets stay OPEN FOR HUMAN" (decided in the Reveal spec, confirmed by the offsets prototype; the [Prototype: Reveal on native `<dialog>` under Foundation Sass](../issues/42-prototype-reveal-dialog.md) `:133` still lists it).
  - The Toggler, Responsive Toggle, Smooth Scroll (item 1), and Interchange tickets still list the decided item under `### OPEN FOR HUMAN` with "Default applied" and no "Decided under the triage rule below" marker, the form the Equalizer, browser testing stack, and Sass packaging tickets received.
  - The [Prototype: Interchange template outlet under hydration](../issues/61-prototype-interchange-outlet-hydration.md) and its README still list the `replaced` mechanism as OPEN FOR HUMAN, decided by the Interchange re-run (`issues/67-rerun-interchange-replaced-timing.md:115`); the Abide prototype README keeps "Outcome: STAYS OPEN FOR HUMAN" while its ticket (`:94`, `:99`) records the orchestrator's decision; the Sticky measurement README and `styles.scss` call Dart Sass's `@import` removal OPEN FOR HUMAN, decided "no action now" in [Sass packaging for the new library](../issues/57-sass-packaging.md).
- Fix: rewrite each map gist to the outcome (for example `:179` "URL fragment writing is decided (triage): the URL stays unchanged; `<base href>`-resolved `#` links after hydration stay OPEN FOR HUMAN"); append "(later decided: ...)" with the deciding ADR or spec to `:157`, `:176`, `:186`, `:189`. ADR 0017 `:13`: "decided at triage: the URL stays unchanged; Magellan owns URL writing through `deepLinking`". In the four spec tickets, replace each decided item under `### OPEN FOR HUMAN` with "Decided under the triage rule below". In the three prototype write-ups and the Reveal dialog prototype ticket, add "Settled: see ..." with the deciding ticket.

### M4. Four render callbacks after a breakpoint-driven change do not follow building-blocks 1.5's rendered-state rule, or state why they need not

- File: `specs/off-canvas.md:233`, `:259`, `:464`, `:482`; `specs/responsive-toggle.md:195-198`; `specs/nested-menu.md:208`, `:264`; `specs/drilldown-menu.md:172`, `:177`, `:244`; `building-blocks.md:68`; `specs/breakpoint-service.md:251`.
- Rule: `building-blocks.md` 1.5 (`:68`): render callbacks that act on a breakpoint-driven render "depend on rendered state, never directly on `NfsMediaQuery` reads or state derived from them", and "'Focus was inside the removed content' is recorded while the old nodes still exist ... A render callback that runs after change detection has already removed the nodes is too late, because the browser has already moved focus to `<body>`"; the Breakpoint service's consumer rule 1 (`:251`) names the three places where focus may be recorded.
- Evidence:
  - Off-canvas `:233`: "Crossing out of the range while the now hidden panel contains `document.activeElement` moves focus to the first registered Trigger"; `:259`: "`earlyRead` reads focus containment, `write` closes or moves focus", keyed on `computed`s over `NfsMediaQuery.atLeast()`. The panel is hidden by Foundation's CSS (`.reveal-for-<bp>` stops matching and `.off-canvas.is-closed { visibility: hidden }` applies, `scss/components/_off-canvas.scss:167-168`), so the browser's focus fixup can run before the callback. None of consumer rule 1's three places is used; the browser-level case (`:464`) uses a fake `MediaMatcher` with no CSS change, and the e2e case (`:482`) resizes with the panel closed.
  - Responsive Toggle `:198`: "When a crossing to `hideFor` or above hides the bar while it contains `document.activeElement`, focus moves to the first tabbable element in the menu", from one `afterRenderEffect` (`:195`); the bar is hidden by Foundation's `.hide-for-<bp>` CSS in the same way. The Interchange re-run asked that spec's author to confirm (`issues/67-rerun-interchange-replaced-timing.md:91`, "likely unaffected ... Its author may confirm"); no confirmation is recorded.
  - Nested menu `:208`: the dropdown collision check's `earlyRead` "returns nothing unless the mode is dropdown and the item is expanded, else measures the submenu"; under ResponsiveMenu the mode is breakpoint-derived (`:244`), so at the first-render handoff with a statically open submenu the measurement can run before change detection applies the dropdown classes (the ordering the Interchange re-run measured), and `write` sets `opens-*` from a drilldown-mode rectangle.
  - Drilldown `:172` and `:244`: `scrollTop` scrolls "on every change of `currentLevel` after the first render", and `currentLevel` is `null` outside drilldown mode (`:177`). A Menu mode swap into drilldown with a submenu open, or out of it, is such a change, so `window.scrollTo` moves the page on a resize, against the effort's own rule that a breakpoint crossing re-runs no scroll ([Spec: Responsive Accordion Tabs](../issues/19-spec-responsive-accordion-tabs.md) decision 18).
  - The rule was added in `fc47a1c` (14:14), after all four specs; no ticket compares them. Interchange and Responsive Accordion Tabs follow it (`specs/responsive-accordion-tabs.md:233-236`), and the Nested menu swap rule is safe (a class change on surviving nodes) but does not say so.
- Fix:
  - Off-canvas and Responsive Toggle: record focus containment continuously from `focusin`/`focusout` host listeners on the panel and on the bar (consumer rule 1's third place; both hosts survive the crossing), and add an e2e case per spec with real CSS ("keyboard focus inside, viewport crossed: focus lands on the Trigger / the first menu link, never `<body>`", three engines).
  - Nested menu `:208` and its render-hook row: act only when the item's rendered mode, a signal written by an `effect()` beside the item's class-map binding, equals `mode()`; add a fixture case (statically open submenu, prerendered at `small`, hydrated at 1280 px, ends with the side class a fresh open gives). Add one sentence to the swap-rule row saying why the focus clause does not apply.
  - Drilldown `:172` and `:244`: "a change of `currentLevel` that comes from a Menu mode swap records the new value and does not scroll"; add a browser-level case.

### M5. The Off-canvas spec names five axe tags, so its gate would not run the `aria-dialog-name` rule its dialog row relies on

- File: `specs/off-canvas.md:337`, `:441` (against its own `:486`); `audits/0003-prototypes-and-first-specs.md:518` (Resolution log, M6).
- Rule: ADR 0018 Consequences and ADR 0022 `:7` (the six tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`); `building-blocks.md:134`, `:168`; the user's standing rule (the six axe tags).
- Evidence: `:337` and `:441` list the five WCAG tags only (`rg best-practice specs/off-canvas.md` exits 1), while `:441` counts `aria-dialog-name`, a `best-practice` rule, among what the gate runs, and `:486` names "the six tags" for `@axe-core/playwright`. The spec resolved at 10:24 and was not touched again, so the M6 pass that audit 0003's log reports for "every spec" did not reach it. The other eight second-wave specs name all six.
- Fix: name the six tags in both places, or write "the six tags of the preview's rule set (Storybook conventions, section 4)".

### M6. Five in-scope specs do not state the `injectAsync` decision, two of which audit 0003's log reports fixed

- File: `specs/interchange.md` (`:188` states the render hook only); `specs/breakpoint-service.md` (`:226`); `specs/slider.md` (`:249`); `specs/sticky.md`; `specs/smooth-scroll.md`; `audits/0003-prototypes-and-first-specs.md:533` (Resolution log, L10).
- Rule: the user's standing rule (render hooks and `injectAsync` stated per spec); `building-blocks.md:113` (1.9: "each spec that owns such a piece decides eager or `injectAsync` in its decision log"); audit 0003 L10.
- Evidence: `rg -c injectAsync` returns nothing for the five files, and `git log -S'injectAsync'` over `interchange.md` and `breakpoint-service.md` is empty: the clause audit 0003 L10 asked for was never added to those two, and the cited commit `cad80fb` touches neither. The nine second-wave specs, Abide, Accordion, Anchored pane, Orbit, and Reveal state the decision with a reason. Outside this wave, Button, Triggers, Equalizer, Magellan, Responsive Toggle, Tabs, and Toggler also have no `injectAsync` statement; the consistency review can close them in the same pass.
- Fix: add one clause to each, for example for the Breakpoint service "`injectAsync` not used: the service is needed at the first render callback of every breakpoint-gated directive, so it loads eagerly with them", and for the plugin specs "`injectAsync` not used: the plugin is its own entry point, which a consumer `@defer` splits; `afterEveryRender` not needed: `afterRenderEffect` re-runs on its signals".

### M7. Two ADRs and one utility spec keep text that later decisions replaced

- File: `adr/0008-rendering-modes-contract.md:24`; `adr/0024-anchored-pane-light-dismiss-model.md:18`; `specs/anchored-pane.md:95`; `audits/0003-prototypes-and-first-specs.md:514` (Resolution log, M2).
- Rule: `/domain-modeling` (an ADR records the decision as made); `/mattpocock-skills:prototype` rule 6; audit 0003 M2 fix bullet 3.
- Evidence:
  - ADR 0008 `:24`: "Persistent elements animate through State classes until the [Prototype: `animate.enter` at hydration] shows whether `animate.enter` replays at hydration." The prototype resolved long ago (`map.md:163`), and `building-blocks.md:87`, `:159` state its verdict. The commit the log cites, `88b9849`, changed only ADR 0008's Considered options bullet 3.
  - ADR 0024 `:18`: "Dropdown's `closeOnClick` and Tooltip's `clickOpen` switch only the pointer rule"; the Tooltip spec keeps the pointer rule always on and lets `clickOpen` decide pinning (`specs/tooltip.md:207`, D12 `:516`), and the Anchored pane spec was amended to match at `:271` and `:604` but not in its contract table (`:95`, "The Tooltip spec switches the pointer rule on for click-opened tips").
- Fix: ADR 0008 `:24`: "Persistent elements animate through State classes only, because `animate.enter` plays at hydration in every rendering mode (the [Prototype: `animate.enter` at hydration](../issues/52-prototype-animate-enter-hydration.md))." ADR 0024 `:18`: "Dropdown's `closeOnClick` switches only the pointer rule; for tooltips the pointer rule is always on and `clickOpen` decides whether a press pins the tip." `specs/anchored-pane.md:95`, third cell: "The Tooltip spec leaves the pointer rule on; `clickOpen` decides whether a press pins the tip."

### M8. The Smooth Scroll router prototype misreads its own log for `restoration: 'disabled'` and for Firefox, and the Magellan spec's guidance rests on the misreading

- File: `issues/62-prototype-smooth-scroll-router-restoration.md:40`, `:54`, `:57`; `prototypes/smooth-scroll-router/README.md:19`, `:35`, `:38`; `prototypes/smooth-scroll-router/logs/3-e2e-annotations.log:62`, `:66`, `:72`, `:90`; `specs/magellan.md:241`.
- Rule: `/research` step 1 (each claim goes back to its source); `/mattpocock-skills:prototype` rule 6 (capture the answer accurately).
- Evidence:
  - The verdict (`:40`) says that under `'disabled'` "the browser's own native per-entry scroll restoration gets it right (or very close)", and row 3d (`:57`) that it "lands within a few hundred px of each section's real position".
  - The log's `pushState` rows under `'disabled'` read `back1ScrollY=12149 | back2ScrollY=12130` (Firefox, `:72`) and `back1ScrollY=12143 | back2ScrollY=12125` (WebKit, `:90`). Section 2 sits at 13761 px (the ticket's own exact match) and section 1 at 12528 px (`README.md:38`), so Back to `#m-s2` lands about 1600 px off in two of three engines, above section 1; only Chromium's first Back is exact.
  - Row 3a (`:54`) says Forward returns to `#m-s3` "at `scrollY=0` (`enabled`/`top`)"; the Firefox rows (`:62`, `:66`) read `forward1ScrollY=15000` for both.
  - `specs/magellan.md:241` keeps "`updateHistory` is documented for pages without the Router's scroll restoration", which reads as "correct there"; the log does not show that.
- Fix: in the ticket and README, replace the 3d result with "Engine-dependent: Chromium restores `#m-s2` exactly and `#m-s1` 403 px short; Firefox and WebKit land near 12130 to 12149 px for both entries, about 1600 px from section 2", and correct the Firefox part of 3a. Add to the Magellan spec: "Without the Router's restoration, Back over `updateHistory` entries uses the browser's own restoration, measured exact only in Chromium; the entries are for Foundation parity, not exact positions."

### M9. The Off-canvas spec's documented `.menu-icon` Trigger gets its 24 px target only from the Responsive Toggle mixin, which the Off-canvas Sass subsection never names, and the shared-mixin question sits only in a matrix cell

- File: `specs/off-canvas.md:330` (2.5.8 row), `:557-561` (usage example), `:636-647` (Sass subsection); `building-blocks.md:251` (Table B OffCanvas, last cell); `map.md:217`; `issues/36-consistency-review.md`.
- Rule: map Standing preferences (a failing 2.2 AA criterion gets the setting or rule that makes it pass, "never ... as a recommendation"); `/wayfinder` Fog of war (in-scope fog lives in Not yet specified or a ticket).
- Evidence: `:330` says a `.title-bar .menu-icon` Trigger "gets the Responsive Toggle spec's hit area", and the example at `:559` is exactly that button inside `.title-bar` with no ResponsiveToggle. The hit area is emitted by `nfs-responsive-toggle` (`specs/responsive-toggle.md:495`), whose item (5) says that without the include the hamburger "passes 2.5.8 only through the spacing exception"; the Off-canvas Sass subsection names `foundation-off-canvas`, `foundation-close-button`, `foundation-visibility-classes`, and `nfs-off-canvas` only. `building-blocks.md:251` parks the fix as "a shared title-bar or menu-icon Library mixin that both specs reference is worth considering", while `map.md:217` says nothing is unspecified and the [Consistency review and bundle index](../issues/36-consistency-review.md) question does not carry the note.
- Fix: add to the Off-canvas 2.5.8 row and Sass subsection "A `.title-bar .menu-icon` Trigger needs `@include nfs-responsive-toggle;` for its 24 by 24 px hit area (WCAG 2.5.8), with or without ResponsiveToggle." Move the shared-mixin question into the consistency review's question or a Not yet specified bullet, and leave the matrix cell as a pointer.

### L1. Bare ticket numbers and undefined labels in narration

- File and lines:
  - New in this wave: `specs/tooltip.md:387` ("(prototype 47)"); `issues/25-spec-off-canvas.md:66`, `:83` ("prototype 47", no key in its Sources line); `prototypes/abide-controls-and-ready/README.md:23`, `:55` ("prototype 49"); `issues/64-prototype-slider-hydration-nonlinear.md:100` ("ticket 45"); `issues/18-spec-reveal.md:104`, `:168` ("BB Part 4 item 4"; the item is OPEN FOR HUMAN item 1, `building-blocks.md:335`).
  - Audit 0003 L1 residue: the fix added key lines defining `P43` (`issues/15-spec-accordion.md:50`) and `P52` (`issues/47-prototype-motion-ui-animate-enter.md:25`, README `:5`), but the narration still spells "prototype 43" (the Accordion ticket, 11 places, `:53-88`) and "prototype 52" (the Motion UI ticket at `:29`, `:31`, `:37`, `:50`, `:90`, `:95`, `:101`, `:149`; its README at `:90`, `:101`, `:143`, `:149`, `:154`, `:155`, `:225`, `:234`, `:236`).
  - Audit 0003's own Resolution log: `:516`, `:523`, `:527` ("ticket 47", "ticket 63", "tickets 42, 43, 47, 51, 52").
- Rule: `/wayfinder` Refer by name; audit 0003 L1.
- Fix: write the linked title, relative to the file (from `specs/`: "the [Prototype: `animate.enter` and `animate.leave` with Motion UI transition classes](../issues/47-prototype-motion-ui-animate-enter.md)"), or add a key line and use the key; replace "prototype 43" with "P43" and "prototype 52" with "P52" where the key exists; in the Reveal ticket write "building-blocks Part 4, OPEN FOR HUMAN item 1".

### L2. Link texts that are not the linked ticket's exact title

- File and lines: `map.md:153`, `:154`, `:160`, `:204` (Decisions so far; `:204` "Spec: Nested menu shared utility" is new since audit 0003, and the other three drop part of the title); `map.md:43`, `:57`, `:227`, `:228` (descriptive texts such as "rendering-modes research" and "building-blocks decision"); `specs/anchored-pane.md:408` and `specs/tabs.md:456` ("browser testing stack decision"); `specs/smooth-scroll.md:157` ("Prototype needed in the ticket"); `issues/41-browser-testing-stack-decision.md:17` and `research/angular-rendering-modes.md:3` (title cut before "for DOM-touching directives"); `prototypes/sticky-measurement/README.md:3`, `:83` ("63. " prefix, which audit 0003 L1 retired) and `:9` (a paraphrased title that links the Sticky CSS README rather than the ticket).
- Rule: `/wayfinder` (`- [<closed ticket title>](link)` in Decisions so far; a name is the ticket's title).
- Fix: use the exact titles; in the Sticky measurement README link the [Prototype: CSS `position: sticky` with IntersectionObserver sentinels for Sticky](../issues/48-prototype-sticky-css.md) by its exact title.

### L3. Quoted proposals whose relative links do not resolve, without the effort-root note

- File: `issues/21-spec-dropdown-menu.md:153`; `issues/27-spec-tooltip.md:174`, `:179`; `issues/56-spec-nested-menu.md:157`; `issues/67-rerun-interchange-replaced-timing.md:82` (two links); `issues/68-rerun-slider-hydration-findings.md:37`; `issues/58-storybook-conventions.md:101`.
- Rule: hygiene (every relative link resolves); audit 0003 L3, whose resolution ("an effort-root relative note above each quoted proposal") reached only the Orbit, Equalizer, and Anchored pane tickets.
- Evidence: the proposals are written relative to `building-blocks.md` (`issues/...`), so from `issues/` they resolve to `issues/issues/...`; the script found these eight links, the two audit 0001 placeholders (out of scope), and the eight already noted in the three tickets that carry the note. No heading anchor fails anywhere in the snapshot.
- Fix: add "(paths relative to the effort root)" above each proposal list, as the Equalizer ticket does.

### L4. Stale "proposed", "pending", and "open" wording for decisions and ADRs already in place

- File and lines: `specs/accordion-menu.md:357`, `:410`; `specs/dropdown-menu.md:274`, `:279`, `:431`, `:445`, `:494`, D10 `:517`, D11 `:518`; `specs/drilldown-menu.md:209`; `specs/responsive-accordion-tabs.md:157`, `:463`, D8 `:572`; `specs/nested-menu.md:104`; `specs/off-canvas.md:19`, `:249`, `:502`, `:514`, `:640`, `:652` and `issues/25-spec-off-canvas.md:88`, `:120`, `:134`; `specs/magellan.md:240`, `:241`, `:419`; `specs/smooth-scroll.md:157`, `:179`; `building-blocks.md:110`, `:154`, `:155`, `:164`, `:223`, `:236`, `:243`.
- Rule: `/to-spec` (the spec is the hand-off, stating the decision as made); prototype rule 6.
- Evidence: examples: `specs/accordion-menu.md:357` calls the `transition: none` rule "a proposed amendment to the Nested menu spec", which `specs/nested-menu.md:462` carries; `specs/drilldown-menu.md:209` asks the Nested menu to add `element`, which `:217` has; `specs/off-canvas.md:640` says the Sticky measurement prototype "checks `overflow: clip` ... if it fails, this rule is dropped", while that prototype resolved before the spec and `building-blocks.md:251` says it confirmed the rule; `specs/magellan.md:240` calls the Router prototype "open"; `building-blocks.md:110`, `:154`, `:155`, `:223`, `:236`, `:243` say "proposed ADR" for ADRs 0028, 0017, 0029, and 0010.
- Fix: state each as settled with its reference ("(ADR 0033)", "`NfsSubmenu.element`", "confirmed by the [Prototype: Sticky measurement refinements](../issues/63-prototype-sticky-measurement.md), case 3", "([ADR 0029](../adr/0029-magellan-targets-from-links.md))").

### L5. Small inaccuracies in `building-blocks.md` and two tickets

- File: `building-blocks.md:38` (1.2 CDK bullet), `:58` (1.4 event mapping), `:256` (Table B Reveal, Animation cell), `:92` (1.7) and `:280` (Table C Breakpoint service); `issues/53-spec-breakpoint-service.md:69`, `:112`; `issues/42-prototype-reveal-dialog.md:85`, `:142`.
- Rule: map Destination (the matrix agrees with the specs); `/wayfinder` (a spec ticket records each revision).
- Evidence:
  - `:38` limits OffCanvas's `FocusTrap` to "modal mode", while Table A OffCanvas (`:224`) and `specs/off-canvas.md:194` use it "whenever `trapFocus` is on, with or without an overlay".
  - `:58` maps `opened/closed.zf.offCanvas` to `opened`/`closed`, while `specs/off-canvas.md:98` maps `openedEnd.zf.offCanvas` to `opened` and `opened`/`close.zf.offCanvas` to `isOpenChange`, as 1.4's own `:56` requires (Foundation fires `opened.zf.offCanvas` at transition start, `js/foundation.offcanvas.js:472`, and `openedEnd` on `transitionend`, `:479`).
  - `:256` says "Motion UI names accepted on `animationIn`/`animationOut`"; `specs/reveal.md:187`, `:412` accept keyframe Motion classes only and warn on Motion UI transition names.
  - `:92` and `:280` omit the read-only `serverBreakpoint` and write `resolve` without the optional breakpoint (`specs/breakpoint-service.md:163`, `:170`, from ADR 0032), and the Breakpoint service ticket's decision 19 still reads "exposed as `resolve(rules)`" with no amendment recording the addition.
  - The Reveal dialog prototype ticket still names `$offcanvas-overlay-background`, which Foundation does not define (`scss/components/_off-canvas.scss:67` defines `$offcanvas-exit-background`); the Off-canvas ticket's proposal 6 corrected the Reveal spec (`specs/reveal.md:697`) but not the prototype answer.
- Fix: `:38` "(OffCanvas `trapFocus`, modal or not; Dropdown `trapFocus` with `role="dialog"`)"; `:58` "`openedEnd/closed.zf.offCanvas` -> `opened`/`closed` (`opened`/`close.zf.offCanvas` become `isOpenChange`)"; `:256` "keyframe Motion classes only; Motion UI transition names warn and do not animate"; add `serverBreakpoint` and `resolve(rules, breakpoint?)` at `:92` and `:280` and a dated amendment to the Breakpoint service ticket; correct the setting name in the Reveal dialog prototype ticket at `:85` and `:142`.

### L6. Shared-utility specs and their consumers disagree in small places

- File: `specs/triggers.md:417`, `:511`, `:550`; `specs/anchored-pane.md:272`, `:408`, `:452`; `specs/nested-menu.md:206`, `:702`.
- Rule: checklist H (a consumer calls the utility with its signature and meaning); ADR 0018 (layer wording); `/wayfinder` (one place per decision).
- Evidence:
  - `triggers.md:417` still says OffCanvas is `dialog` in modal mode "if its spec follows the APG's modal-dialog reading" (decided, `specs/off-canvas.md:203`); `:550` says "the Reveal spec decides whether it syncs `isOpen` from the dialog's `close` event" (decided, `specs/reveal.md:218`, D18); `:511` describes the Tooltip example as a link and credits the interactive-host rule to the building-blocks ticket, while the example is a button (`:483`) and the rule was decided in the [Spec: Tooltip](../issues/27-spec-tooltip.md) Triage.
  - `anchored-pane.md:452` (Out of Scope) says neither Reveal nor OffCanvas dismissal is an Anchored pane concern, while `:131` lists non-modal Reveals as a Light dismiss consumer (ADR 0031). `:408` keeps the stack-neutral layer 2 heading audit 0003 M7 asked to replace (the log reports "Every spec uses the stack decision's layer wording"). `:272` says "`autoclose` false keeps click-opened items open"; Foundation closes on leave only while `autoclose` is on (`js/foundation.dropdownMenu.js:158-159`), so `autoclose` false keeps every hover-opened submenu open, as the Nested menu and Dropdown Menu specs state.
  - `nested-menu.md:206` calls `nfsHoverIntent` without `isOpen`, which `anchored-pane.md:227` declares required (timers clear when it changes by another path). `nested-menu.md:702`, the list the plugin specs "refer to" (`:481`), lacks the two `nfs-drilldown` checks the Drilldown spec adds (row height; the Hybrid arrow against the drilldown backgrounds when the toggle background is `null`; `specs/drilldown-menu.md:663`, D20 `:537`).
- Fix: update the three Triggers notes to the decisions; `anchored-pane.md:452` "OffCanvas dismissal (its own overlay) and modal Reveal dismissal (`<dialog>`); a non-modal Reveal uses Light dismiss only"; retitle `:408` "Browser-level test (Vitest browser mode, `npx nx test <lib>`)" with ADR 0018's opening sentence; correct `:272`; add `isOpen: expanded` to the Nested menu call; add the two checks to `nested-menu.md:702`.

### L7. Numbers and evidence that disagree with the captures or the sources

- File: `issues/65-prototype-orbit-keyboard-hydration.md:45`; `issues/62-prototype-smooth-scroll-router-restoration.md:55-57` and its README `:36-38`; `issues/69-prototype-reveal-auto-offsets.md:34` and its README `:23`; `prototypes/slider-hydration-nonlinear/README.md:15`; the `sticky-measurement`, `abide-controls-and-ready`, and `interchange-replaced-timing` captures; `prototypes/orbit-keyboard-hydration/results/*.jsonl`; `issues/67-rerun-interchange-replaced-timing.md:52`; `specs/reveal.md:328` and `issues/18-spec-reveal.md:96`; `specs/dropdown.md:322` and `issues/26-spec-dropdown.md:112`; `issues/47-prototype-motion-ui-animate-enter.md:94` and its README `:153`; `prototypes/responsive-accordion-tabs/README.md:13`; `adr/0022-wcag-2-2-aa-enforcement.md:7` and `storybook-conventions.md:110`.
- Rule: `/research` step 1; `/mattpocock-skills:prototype` rule 6 and the map's capture override; audit 0003 L4, L5, M5.
- Evidence:
  - The Orbit keyboard ticket gives one set of page positions "identical in all three engines"; the captured results differ per engine (Firefox `PageDown` 766, WebKit 640, Chromium `Home` 1041).
  - The Smooth Scroll router ticket cites log lines one below the data. The Reveal offsets ticket says 12 tests per engine, its README 14, and `e2e/offsets.spec.ts` defines 13. The Slider hydration README promises "a reproducible root cause (below)" that is not below; the ticket says the cause is "narrowed but not fully confirmed".
  - Three captures cite runs (147 of 147; 27 of 27; 84, 252, 186) with no log and no "not kept" note; the Orbit results hold only case 1; the Interchange re-run lists a modified `e2e/interchange-outlet.spec.ts` among its decisive files that the capture does not hold.
  - The Reveal spec's 3.45:1 and the Dropdown spec's 19.8:1 are ratios against `#ffffff`; against Foundation's `$white` (`#fefefe`) they are 3.42:1 and 19.6:1, as the Off-canvas and Tooltip specs give.
  - Audit 0003 L4 residue: the Motion UI prototype ticket and README still say the app used zone.js; its captured `package.json` has no `zone.js`, and "Zoneless is the default in Angular v21+" (`adev/src/content/guide/zoneless.md:14`). Audit 0003 M5 residue: the ResponsiveAccordionTabs prototype README still recommends the darkened `$tab-active-color` with no superseded note.
  - ADR 0022 and `storybook-conventions.md:110` still give the selected tab as 3.75:1, where the bundle writes "about 3.76:1 (axe reports 3.75)" (the unrounded value is 3.755).
- Fix: correct each figure to its capture or source; copy the missing run logs and the modified spec file from the `D:/tmp/` workspaces, or add "run log not kept" to each README; apply audit 0003's L4 and M5 wording to the two READMEs.

### L8. Glossary hygiene: one example names a Dropped option, and four definitions carry implementation detail

- File: `CONTEXT.md:66` (Motion class), `:152` (Scroll lock), `:164` (Tip), `:264` (Replay guard), `:280` (Story id).
- Rule: `CONTEXT-FORMAT.md` ("Define what it IS, not what it does"); `/domain-modeling` ("totally devoid of implementation details").
- Evidence: Motion class lists `animInFromRight`, which `building-blocks.md:60` drops; Scroll lock adds "the scroll offset the library writes when the first modal opens and restores when the last one closes"; Tip "creates on first show as the next sibling of its host"; Replay guard "A `keydown` listener ... that stops propagation"; Story id "fixed by the stories file's `meta.id`".
- Fix: use `animationOut` as the example, and trim each mechanism clause (for example Scroll lock: "Keeping the page behind an open modal Reveal from scrolling, as Foundation's `html.is-reveal-open` rule does").

### L9. File paths and one `_Avoid_` word in specs

- File: `specs/responsive-accordion-tabs.md:83`, `:252`, `:273`, `:290`, `:459` (`research/*.md` paths), `:488` (`preview.ts`), `:539` (`main.js`), `:89` ("Mode switch"); `specs/tooltip.md:392` (`research/angular-rendering-modes.md` section 7); `specs/orbit.md:79` (audit 0003 L8 residue; out of scope, for the Orbit re-run).
- Rule: `/to-spec` ("Do NOT include specific file paths"); `CONTEXT.md` Mode swap (`_Avoid_`: mode switch); audit 0003 L8.
- Fix: name research by title and section ("the rendering-modes research, section 7"), write "the Storybook preview" and "the main bundle", and write "Mode swap" at `:89`.

### L10. Enforcement and capture hygiene

- File: `specs/reveal.md:328`, D19 `:555` against `specs/off-canvas.md:327`, D21 `:533`; `map.md:205` against `issues/68-rerun-slider-hydration-findings.md:44` and `specs/slider.md:426`; `storybook-conventions.md:107-117`; `prototypes/sticky-measurement/styles.scss:2`; `prototypes/abide-controls-and-ready/e2e/controls.spec.ts:7` and `issues/66-prototype-abide-controls-and-ready.md:35`; `audits/0003-prototypes-and-first-specs.md:506`, `:513`, `:514`, `:533`.
- Rule: map Standing preferences (a 2.2 AA criterion is a requirement); `/wayfinder` (the gist matches its ticket); ADR 0012 and audit 0003 L5; ADR 0018; hygiene.
- Evidence:
  - The same close-glyph 1.4.11 pair is an `@error` in `nfs-off-canvas` and only a `@warn` in `nfs-reveal` ("Foundation's defaults pass, so a warning, not an error"), so a failing theme compiles inside a Reveal.
  - `map.md:205` gists the Slider re-run as having fixed the Firefox pre-hydration key; the re-run's Triage rates confidence "NOT HIGH that the fix passes until it runs", and the spec says "Not yet run".
  - The `storybook-conventions.md` overrides block shows the Tabs and Button overrides only, while the specs require more than fifteen lines of the same file (Abide, Accordion, Orbit, Slider, Off-canvas, Dropdown, Dropdown Menu and Nested menu, the Top Bar background); the block does not say it is an example, and a preview built from it alone would stop at the Slider, Orbit, and Off-canvas `@error` checks.
  - The Sticky measurement capture imports Foundation with `@use` and no prototype-only note; the Abide prototype runs axe with five tags and its ticket reports "the five WCAG 2.2 AA tag sets", with no note that this is not the library's gate.
  - Audit 0003's log says "Every finding is fixed" (`:506`) and cites commits that do not carry the fixes it lists (M2's `88b9849`, L10's `cad80fb`, L3's `843069f`) or omits one that does (M1 omits `6120db8`, which carried the Triggers example).
- Fix: use `@error` for the Reveal close-glyph pairs, or record the difference in both design-decision tables; change `map.md:205` to "proposes a fix for the Firefox pre-hydration key, unverified in code; the e2e case decides it, with the limitation text as the fallback"; mark the overrides block "example; the full list is each spec's Sass subsection" or list every override; add the prototype-only `@use` note and the five-tag note; after the fixes above land, append a dated addendum to audit 0003's log for each partial row rather than rewriting its rows.

## Unrecorded departures and Sass conflicts

Departures of a published spec (or the matrix) from `building-blocks.md` or a shared utility spec at HEAD that no ticket proposed:

1. The Reveal, Off-canvas, Accordion Menu, and Accordion specs check contrast with the rounding `color-contrast()`, against 1.10 (H1).
2. Table B ResponsiveMenu's "a signal of the active mode" against the Nested menu's `NfsMenuRoot` handle (H2).
3. Table B Interchange's risk cell against the Interchange spec's dropped `ngDoCheck` fallback (M2).
4. The Nested menu's dropdown collision effect and Drilldown's `scrollTop` effect keyed on breakpoint-derived state, against 1.5 (M4).
5. The Off-canvas and Responsive Toggle focus moves after a breakpoint crossing, against 1.5 and the Breakpoint service's consumer rule 1 (M4).
6. Off-canvas registration effects that write signals (panel to content, overlay to panel; `specs/off-canvas.md:140-141`, `:255`) against 1.5 (`:66`, `effect` "never to propagate state between signals") and 1.9 (`:108`, registration in `ngOnInit`). The spec argues from the Triggers and Responsive Toggle precedent, and Table B ResponsiveToggle mentions an effect registration, but no amendment was proposed. Fix: add to 1.5 "except a registration of a reference input with its target, which writes only the target's registry signal (Triggers, Responsive Toggle, Off-canvas)".
7. Tooltip hides the kept tip with `hidden` alone (`specs/tooltip.md:220`, `:406`), where 1.10 (`:123`) says the library also binds `.is-hidden` whenever it hides a Foundation-classed element with `hidden`. The spec's reason holds (`.tooltip` sets no `display`, `scss/components/_tooltip.scss:62-75`), but 1.10 is unconditional. Fix: qualify 1.10 with "when a Foundation rule sets `display` on it".
8. Dropdown binds no Motion class under `reducedMotion()` (`specs/dropdown.md:395`, D21), against the Breakpoint service's consumer rule 3 (`specs/breakpoint-service.md:253`: "CSS motion is handled by the Library mixins' reduced-motion rules, not by this signal"). The Dropdown ticket records the Responsive Toggle precedent but proposed no change to the utility spec. Fix: amend rule 3 with "except that a directive may skip binding consumer Motion classes under `reducedMotion` (Responsive Toggle, Dropdown)".

Every other departure found (the Dropdown Menu and Drilldown Menu rows, 1.3, 1.4, 1.5, 1.13, three glossary terms, the stale prototype cells) was proposed in a ticket or answered by a prototype and is waiting to be carried (H2, M2).

Conflicting Sass settings: none. Every setting two specs require has one value: `$topbar-background: $white` (Dropdown Menu, Nested menu, Magellan, Responsive Toggle); `$dropdownmenu-min-width: min(200px, 45vw)` (Dropdown Menu, Nested menu); `$accordion-item-color: scale-color($primary-color, $lightness: -15%)` (Accordion, Responsive Accordion Tabs); `$tab-background-active: $primary-color; $tab-active-color: $white;` (Tabs, Responsive Accordion Tabs, `storybook-conventions.md:111-112`); the alert colour `#bf3f2c` (Button palette, Abide). Two checks give different results for one input: the same close-glyph pair is an `@error` in Off-canvas and a `@warn` in Reveal (L10), and the menu family's arrow checks round in two specs and not in two others (H1).

## Resolution log check (audit 0003)

Every cited commit is an ancestor of `d70625e` and a descendant of audit 0003's snapshot `1138297`. Two cited commits (`6120db8`, 10:27; `dacf30e`, 10:32) predate audit 0003's own commit `bee6e1a` (10:34), so parts of M5, M6, and M7 were fixed before the findings were recorded; that is legitimate but worth knowing.

| Row | Holds at the snapshot | Where it fails |
| --- | --- | --- |
| H1 | Yes (`specs/breakpoint-service.md:163`, `:170`, `:251`; ADR 0014) | |
| H2 | Yes (ADR 0007 `:12`, `:16`, `:17`; `building-blocks.md:256`) | |
| H3 | Yes (ADR 0002; `building-blocks.md:38`, `:219`, `:235`, `:246`, `:247`, `:262`, `:271`, `:282`; `CONTEXT.md:147-181`) | |
| M1 | Yes, all eight resolutions | The row omits `6120db8` (L10) |
| M2 | Partly | ADR 0008 `:24` (M7) |
| M3 | Partly | ADR 0017 `:13`, five map gists, four tickets (M3) |
| M4 | Yes (`specs/responsive-toggle.md:193`; `building-blocks.md:81`) | |
| M5 | Partly | The ResponsiveAccordionTabs prototype README (L7) |
| M6 | Partly | The Off-canvas spec's five tags (M5) |
| M7 | Partly | `specs/anchored-pane.md:408` (L6) |
| M8 | Yes (`specs/button.md` Sass subsection) | |
| M9 | Yes (every proposed term in `CONTEXT.md`) | |
| M10 | Yes (`specs/anchored-pane.md:277`, `:556-563`) | |
| M11 | Partly | The Orbit spec ticket not reopened; the Smooth Scroll router prototype names no deciding question (M1) |
| L1 | Partly | "prototype 43" and "prototype 52" narration kept beside the new keys (L1) |
| L2 | Yes, the nine places | A new instance in the Sticky measurement README (L2) |
| L3 | Partly | The Storybook conventions ticket and six newer tickets (L3) |
| L4 | Partly | The Motion UI prototype ticket and README (L7) |
| L5 | Yes | |
| L6 | Yes (ADR 0005 fixed; titles kept, as recorded) | |
| L7 | Yes | |
| L8 | Partly | `specs/orbit.md:79`, out of scope (L9) |
| L9 | Yes | |
| L10 | Partly | Interchange and the Breakpoint service (M6) |
| L11 | Yes (`storybook-conventions.md:97`, `:121`) | |
| Departure 1 | Yes | |
| Departure 2 | Partly | Table B Interchange (M2) |

15 rows hold and 12 hold only in part.

## Verified OK

To-spec shape and standing preferences (the nine second-wave specs):

- Exactly the seven template sections in order; the Material comparison under Implementation Decisions after Implementation level and the design decisions table first under Further Notes (1.14), for example `specs/reveal.md:5-533`, `specs/nested-menu.md:248`, `:274`, `:560`, `specs/drilldown-menu.md:228`, `:254`, `:514`.
- Directive over component with the reason, and the two component exceptions justified by 1.1 (Responsive Accordion Tabs, case 1; the Tooltip tip, case 3, `specs/tooltip.md:505`).
- The Implementation level, why it stopped there, and the fallback in each (for example `specs/off-canvas.md:249`, `:274`; `specs/dropdown.md:244`, `:262`).
- Render hooks and `injectAsync` decided with reasons in all nine (for example `specs/reveal.md:254-265`, `specs/accordion-menu.md:180-192`, `specs/responsive-accordion-tabs.md:256-267`).
- The Further Notes Sass subsection in the 1.13 form with items (1) to (5) and `@import 'ngx-foundation-sites';` after Foundation, or "No library CSS; there is no `nfs-<plugin>` mixin" (Responsive Accordion Tabs `:675`, Tooltip `:596`).
- Animation through State classes, measured completion, fallback timers outside the zone, and reduced motion; rendering-modes subsections covering server output, pre-hydration rules, replay, the hydration boundary, `@defer`, and `hydrate never`.
- A WCAG 2.2 AA criteria subsection written as requirements in all nine; the six axe tags in eight (Off-canvas is M5); the four test layers in the ADR 0018 wording with `renderServer()` in `<name>.ssr.spec.ts`; Story ids `<entry-point>--<story>` (`drilldown-menu` chosen deliberately, D2).

Shared-utility consumption (checklist, member by member):

- `NfsOpenable` in Reveal, Off-canvas, Dropdown, and Tooltip matches `specs/triggers.md:128-136` (`isOpen`, `id`, `triggerRole`, `open(trigger?)`, `close(result?)`, `toggle(trigger?)`, `registerTrigger`).
- `nfsLightDismiss` options and `NfsDismissReason` (`specs/anchored-pane.md:150`, `:201-208`) match the Dropdown, Reveal, Tooltip, Nested menu, and Dropdown Menu calls; dismissal is kept apart from `close(result?)` in Dropdown (`:232`), Reveal (`:203`), and the utility sketch (`:556-563`), so audit 0003 M10 holds. `nfsPositioner`, `nfsDocumentRect`, `nfsBodyBounds`, and `nfsOverlap` are called with the options the utility defines (the one slip is L6).
- The Breakpoint service members used exist with the same meaning: `atLeast`, `is` with `'all'`, `reducedMotion`, the read-only `serverBreakpoint`, and `resolve(rules, breakpoint?)` (`specs/breakpoint-service.md:163-170`, `:212-215`).
- The three menu roots match the Nested menu's `configure()` slots, `nfsMenuRootProviders(mode)`, the item, submenu, and toggle members, and its three key tables (`specs/nested-menu.md:149-159`, `:174-217`, `:309-343`); Responsive Accordion Tabs uses the Accordion and Tabs members as those specs define them (`specs/accordion.md:192-228`, `specs/tabs.md:181-189`) and follows 1.5 through a view query of the displayed mode.

Bundle agreement, tickets, and domain modeling:

- `map.md` Decisions so far has exactly one line per resolved ticket (67 resolved, 67 lines, no duplicates) and none for the open Responsive Menu spec, consistency review, and Orbit re-run; the lines added since `1138297` match their tickets' answers except `:205` (L10), and each links its ticket and deliverable (link texts aside, L2); older lines lag at `:190` (M1) and at the lines listed in M3.
- Carried at the snapshot, item by item: the Reveal, Off-canvas (proposals 1 to 5), Dropdown, Tooltip, Responsive Accordion Tabs, Accordion Menu, and Nested menu tickets' building-blocks, glossary, ADR, and other-spec changes; the Interchange re-run's three building-blocks items and its Breakpoint service amendment; the Slider re-run's Table B Slider items; the Nested menu amendments from the three menu specs (`c794398`, `c2b906f`).
- The nine spec tickets carry numbered decision logs with sources and a `### Triage` section rating impact and confidence; OPEN FOR HUMAN is left only for screen-reader checks and upstream filings (human-only by kind); every `## Prototype needed` item was graduated (the Reveal spec's to the auto-offsets prototype) or is "None" with reasons.
- ADRs 0030 to 0033 carry `status: accepted`, meet the three-part bar (hard to reverse, surprising without context, real alternatives recorded), and match the specs (ADR 0033's `nfs-accordion-content-shown` is used in `specs/accordion.md` and `specs/responsive-accordion-tabs.md:409`; the Sticky spec's `data-nfs-sticky-on` at `specs/sticky.md:106`).
- The glossary terms added in this wave (Scroll lock, Backdrop press, the amended Light dismiss, Revealed panel, In-canvas panel, Modal mode, Tip, Hybrid item, Open path, Mode swap) follow CONTEXT-FORMAT, apart from L8; no `_Avoid_` word is used for a glossary concept in the four overlay specs.

Prototypes and re-runs:

- Each of the eight tickets and the Interchange outlet prototype states its question, a verdict, a results table, exact error text (or "none" with transient failures quoted), what it does not prove, the decision handed on, its `D:/tmp/` workspace, and a triage section; each README states the question, how to run it, the verdict, and the captured files.
- Captured numbers that match: the Smooth Scroll router run "48 passed" and its 2a/2b targets 6259/9976; the Slider hydration run "29 passed, 2 failed, 2 skipped" with the exact Firefox failure text; the Reveal offsets "33 of 36" and "102 comparisons per engine"; the Sticky measurement "147 = 49 x 3".
- Spec revisions carry every handed-on decision: the Slider's six, the Sticky padding-box stick line, the Reveal's five text changes (rule 4, rule 7, the fallback, the tall-content e2e row, the keyframe `translate` rule), Abide's custom-control linking and `hydrate on interaction` limit, the Interchange rendered-rule handoff with no fallback, and the Smooth Scroll click-order correction; the Interchange and Slider spec tickets record their re-runs.
- The Slider, Reveal, and Abide captures import Foundation with `@import` after the settings, as ADR 0012 requires.

Hygiene:

- No non-ASCII character and no banned word in the 240 in-scope files or anywhere in the snapshot (script and `rg`, both exit 1 on the snapshot; positive controls found 55 characters and 15 banned-word hits).
- The only email-shaped tokens in scope other than the approved address are the five in H3.
- All relative links resolve except the quoted-proposal links in L3; every heading anchor resolves.

Spot checks against the local clones (all hold unless a finding says otherwise):

1. Foundation's `color-contrast()` rounds with `round($ratio * 10) * 0.1` -- `foundation-sites/scss/util/_color.scss:65`; `color-luminance()` is at `:26` -- holds (H1, building-blocks 1.10).
2. `Reveal.defaults`: `closeOnClick` true, `closeOnEsc` true, `multipleOpened` false, `vOffset`/`hOffset` `'auto'`, `overlay` true, `deepLink` false -- `js/foundation.reveal.js:554`, `:561`, `:568`, `:575`, `:582`, `:596`, `:611` -- holds.
3. Reveal's `'auto'` offset uses `parseInt((outerHeight - height) / 4)` and `min(100, vh / 10)` when taller -- `js/foundation.reveal.js:108-139` -- holds (the auto-offsets prototype).
4. `.reveal` has a literal `top: 100px` at medium and up -- `scss/components/_reveal.scss:158` -- holds.
5. `OffCanvas.defaults`: `transition` `'push'`, `autoFocus` true, `trapFocus` false -- `js/foundation.offcanvas.js:648`, `:688`, `:705` -- holds.
6. `opened.zf.offCanvas` fires at transition start and `openedEnd.zf.offCanvas` on `transitionend` -- `js/foundation.offcanvas.js:472`, `:479` -- holds (L5).
7. `.off-canvas.is-closed { visibility: hidden }` -- `scss/components/_off-canvas.scss:167-168` -- holds.
8. `$offcanvas-exit-background: rgba($white, 0.25)` exists and no `$offcanvas-overlay-background` -- `scss/components/_off-canvas.scss:67` -- holds (L5).
9. Dropdown registers Enter and Space as `toggle`, which the handler never defines -- `js/foundation.dropdown.js:37-41`, `:198-215` -- holds.
10. `$dropdown-width: 300px` and `$dropdown-sizes` 100/200/400 px -- `scss/components/_dropdown.scss:27`, `:35-38` -- holds.
11. `Tooltip.defaults`: `hoverDelay` 200, `showOn` `'small'`, `clickOpen` true -- `js/foundation.tooltip.js:308`, `:366`, `:388` -- holds.
12. `.tooltip` sets no `display` -- `scss/components/_tooltip.scss:62-75` -- holds (departure 7).
13. `DropdownMenu.defaults`: `hoverDelay` 50, `closingTime` 500, `alignment` `'auto'`, `forceFollow` true -- `js/foundation.dropdownMenu.js:401-479` -- holds.
14. The `'auto'` Base side comes from `rightClass`, RTL, or a `.top-bar-right` ancestor -- `js/foundation.dropdownMenu.js:63-76` -- holds.
15. `AccordionMenu.defaults`: `slideSpeed` 250, `submenuToggle` false, `multiOpen` true -- `js/foundation.accordionMenu.js:317-343` -- holds.
16. `Drilldown.defaults`: `autoApplyClass` true, `backButtonPosition` `'top'`, `scrollTop` false, `animationDuration` 500 -- `js/foundation.drilldown.js:568-653` -- holds (H2).
17. `ResponsiveAccordionTabs.defaults = {}` -- `js/foundation.responsiveAccordionTabs.js:289` -- holds.
18. Nest stamps `menubar`/`menuitem`/`none`, `aria-haspopup`, and a copied `aria-label` -- `js/foundation.util.nest.js:5-45` -- holds.
19. Foundation's expanded-state selector is attribute-keyed: `.is-accordion-submenu-parent[aria-expanded='true'] > a::after` -- `scss/components/_accordion-menu.scss:116` -- holds (ADR 0033).
20. `.is-drilldown { position: relative; overflow: hidden; }` -- `scss/components/_drilldown.scss:74-76` -- holds (Table A Drilldown's `overflow: clip` adjusts one declaration).
21. Settings: `$closebutton-color: $dark-gray` (`:380`), `$dropdownmenu-min-width: 200px` (`:418`), `$offcanvas-background: $light-gray` (`:528`), `$tab-background-active: $light-gray` and `$tab-active-color: $primary-color` (`:829-830`), `$topbar-background: $light-gray` (`:879`), `$breakpoint-classes: (small medium large)` (`:126`) -- `scss/settings/_settings.scss` -- holds.
22. `foundation-everything` (`scss/foundation.scss:80-155`) never includes `foundation-range-input` (`scss/forms/_range.scss:41`; no `@include foundation-range-input` anywhere in `scss/`) -- holds (`storybook-conventions.md:97`, `:121`).
23. Aria `TabPanel` binds `'[attr.inert]': '!visible() ? true : null'` -- `components/src/aria/tabs/tab-panel.ts:49` -- holds (M1).
24. Aria `AccordionTrigger` binds `'role': 'button'` and `TabList` its `role`, `tabindex`, `aria-disabled`, `aria-orientation` -- `src/aria/accordion/accordion-trigger.ts:48`, `src/aria/tabs/tab-list.ts:50-53` -- holds.
25. CDK `FocusTrapFactory` loads the visually-hidden style in its constructor -- `src/cdk/a11y/focus-trap/focus-trap.ts:386-390` -- holds (Dropdown's lazy resolution).
26. `InteractivityChecker.isFocusable` includes `isVisible` unless `ignoreVisibility` -- `src/cdk/a11y/interactivity-checker/interactivity-checker.ts:144-150` -- holds.
27. The Router scrolls restored positions with `{behavior: 'instant'}` and stores positions per navigation id -- `angular/packages/router/src/router_scroller.ts:43-45`, `:109` -- holds (the Smooth Scroll router prototype).
28. Render hooks run phase by phase in one `execute` loop, and a phase node dirtied before its phase "will be reached naturally" -- `packages/core/src/render3/after_render/manager.ts:40-44`, `:79`; `reactivity/after_render_effect.ts:105-109` -- holds (the Interchange re-run, 1.5).
29. `MAXIMUM_REFRESH_RERUNS = 10` and `runEffectsInView` before `detectChangesInEmbeddedViews` -- `packages/core/src/application/application_ref.ts:153`; `render3/instructions/change_detection.ts:273-274` -- holds.
30. "Zoneless is the default in Angular v21+" -- `adev/src/content/guide/zoneless.md:14` -- holds (fails the Motion UI prototype's zone.js claim, L7).
31. APG: "Please DO NOT make the element with role dialog focusable" -- `aria-practices/content/patterns/dialog-modal/examples/dialog.html:126` -- holds (the Reveal spec).
32. APG tooltip: tooltip widgets do not receive focus, and hover content with focusable elements is a non-modal dialog -- `aria-practices/content/patterns/tooltip/tooltip-pattern.html:31-32`, `:49` -- holds (the Tooltip and Dropdown specs).
33. WAI-ARIA treats `aria-haspopup="true"` as `menu` -- `w3c/aria/index.html:13969` -- holds (Dropdown and Triggers never emit it).
34. The APG hybrid disclosure example names each toggle "More <section> pages" -- `aria-practices/content/patterns/disclosure/examples/disclosure-navigation-hybrid.html:79` -- holds (the Accordion Menu spec).

## Resolution log

Recorded by the orchestrator on 2026-09-26. Every finding is fixed except the two parts handed to the consistency review, which are named below.

| Finding | Outcome | Commits |
| --- | --- | --- |
| H1 | Fixed. ADR 0022 and every spec compare the unrounded WCAG ratio from `color-luminance()`; the Nested menu's 1.4.11 row matches its Sass checks | `d17749f`, `aff6fd9`, `c13eb23` |
| H2 | Fixed. The Dropdown Menu and Drilldown Menu proposals and glossary terms are carried; the ResponsiveMenu DI cell names the Nested menu root | `6fcf4b3`, `730d236` |
| H3 | Fixed. The Abide README's console log is replaced by a table that does not reproduce the typed value (the tokens remain in the history of `d99f426`; they are the approved public address with letters dropped, not another identity) | `6087313` |
| M1 | Fixed. The Orbit spec ticket records the reopen and the re-run (ADR 0034); ADR 0025 says its second consequence was measured not to hold; the map rule describes the practice; the router prototype names its deciding questions | `ac78f51`, `d17749f`, `6fcf4b3` |
| M2 | Fixed | `a2cfa8a` |
| M3 | Fixed | `d17749f`, `b0692d0` |
| M4 | Fixed. Off-canvas and Responsive Toggle record focus from `focusin`/`focusout` and act on the host's computed visibility; the Nested menu collision flip waits on the rendered mode; Drilldown's `scrollTop` ignores swaps in both directions | `aff6fd9`, `c13eb23`, `afd1294` |
| M5 | Fixed | `aff6fd9` |
| M6 | Fixed, including Button, Triggers, Equalizer, Magellan, Responsive Toggle, Toggler, and the Breakpoint service | `aff6fd9`, `730d236` |
| M7 | Fixed | `d17749f`, `aff6fd9` |
| M8 | Fixed | `d17749f`, `aff6fd9` |
| M9 | Fixed in the Off-canvas spec (the Responsive Toggle mixin is required for a title-bar menu icon). Whether the hit area moves to a shared mixin is handed to the consistency review | `aff6fd9`, `15743e8` |
| L1 | Fixed | `aff6fd9`, `d17749f`, `b0692d0` |
| L2 | Fixed | `aff6fd9`, `a2cfa8a`, `c13eb23`, `d17749f` |
| L3 | Fixed | `d17749f`, `c13eb23` |
| L4 | Fixed at every line the audit lists; the sweep of other specs for the same wording is handed to the consistency review | `aff6fd9`, `a2cfa8a`, `c13eb23`, `15743e8` |
| L5 | Fixed | `a2cfa8a`, `c13eb23`, `d17749f` |
| L6 | Fixed | `aff6fd9`, `c13eb23` |
| L7 | Fixed; the Interchange re-run's run logs and modified test file are now captured, and the Abide and Sticky measurement READMEs say no run log was kept | `aff6fd9`, `a2cfa8a`, `d17749f` |
| L8 | Fixed | `a2cfa8a` |
| L9 | Fixed | `aff6fd9` |
| L10 | Fixed. Reveal's close-glyph pairs are `@error`; the dialog-edge pair stays `@warn` because building-blocks 1.10 requires `@error` only for pairs that carry state. Audit 0003's log has a dated addendum | `aff6fd9`, `a2cfa8a`, `d17749f` |
| Unrecorded departures 1 to 8 | Closed with H1, H2, M2, M4, and, for 6 to 8, by the consistency review's sweep (Off-canvas registration effects, the Tooltip tip's `hidden`, Dropdown under `reducedMotion`), which the review must confirm | as above |
