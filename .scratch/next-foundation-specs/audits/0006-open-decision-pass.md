# Audit 0006: open-decision pass

Date: 2026-09-27
Auditor: audit subagent (read-only except this file)

## Scope

Everything below was audited as committed at HEAD `e0ed7f6` ("bring four specs in line with the assistive-technology decisions"), read from a `git archive e0ed7f6 .scratch/next-foundation-specs` snapshot, never from the working tree. Nothing else was being edited. The snapshot's file list equals `git ls-tree -r e0ed7f6` for the effort directory, and `git status --short .scratch/` prints nothing.

- The open-decision pass (map Notes, "Open-decision pass"): the seven tickets it added, with their evidence dossiers and research files:
  - [Decide: `aria-expanded` on a modal dialog's opener](../issues/72-decide-aria-expanded-on-modal-opener.md) (below: the modal-opener panel), with `research/decision-aria-expanded-modal-opener.md`;
  - [Decide: Slider vertical orientation](../issues/73-decide-slider-vertical-orientation.md) (the Slider panel), with `research/decision-slider-vertical.md`;
  - [Decide: `#`-only links that `<base href>` resolves to another document](../issues/74-decide-base-href-hash-links.md) (the base-href panel), with `research/decision-base-href-hash-links.md`;
  - [Decide the `@angular/aria` fallback confirmation](../issues/75-evidence-aria-fallback-confirmation.md) (the fallback decision), with `research/aria-fallback-evidence.md` and the capture `prototypes/orbit-slide-derived-inert/`;
  - [Upstream filings](../issues/76-evidence-upstream-filing-readiness.md);
  - [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md) (the assistive-technology decision), with `research/assistive-technology-evidence.md` and `research/assistive-technology-evidence-2.md`;
  - [Decide: the server state of an open-by-default non-modal Reveal's Trigger](../issues/78-decide-open-by-default-non-modal-reveal-server-state.md) (the Reveal server-state decision).
- ADRs 0036, 0037, and 0038, and every fold-in commit that carried the decisions into specs and shared documents: `git log --oneline 842946d..e0ed7f6` lists fourteen (`1c8476f`, `8933d5d`, `6a4ea65`, `0cc7d03`, `8abf735`, `e34f731`, `89f91cd`, `d4f83eb`, `4f030f5`, `bfebdba`, `e42d9d0`, `3167e3e`, `e513886`, `e0ed7f6`), touching 91 files.
- For the four panel decisions: whether the process the map's note prescribes was followed, whether the judge's deciding claims hold against their sources, and whether every change the judge listed reached the file it names. For the assistive-technology decision: all thirteen verdicts and every change. For the Reveal server-state decision: the decision against the HTML standard's dialog rules and the Reveal spec as edited.
- Cross-bundle consequences: the `modal-dialog` Trigger role (ADR 0036) across the specs, the Triggers consumers table, building-blocks 1.8 and Table C, the glossary; ADR 0037 against ADR 0034, ADR 0025, the Orbit spec, and building-blocks; ADR 0038 against the Smooth Scroll and Magellan specs and ADR 0017.
- The README's open list, counts, and ticket links; the user's rulings for this pass (no upstream filings; everything else resolved autonomously, so no item left OPEN FOR HUMAN).

Not in scope: the older audits except as records, and research files other than the six named above except for link texts and references.

Governing rules: `/wayfinder`, `/research`, `/domain-modeling` (with `CONTEXT-FORMAT.md`, `ADR-FORMAT.md`), `/grill-with-docs` and `/grilling`, `/to-spec`, `/mattpocock-skills:prototype` (with `LOGIC.md`, `UI.md`), `docs/agents/issue-tracker.md`, `docs/agents/domain.md`, the repo skill `.claude/skills/foundation-api-design/SKILL.md`, and the standing rules, spec shape, AFK override, and orchestration rules (the triage quadrant and the prototype-reopens-spec rule) in `map.md` Notes. The user's standing rules checked on every edited spec part: Foundation SCSS reused, never re-implemented; WCAG 2.2 AA as requirements with the six axe tags; unrounded contrast checks; the browser testing stack wording (ADR 0018); render hooks and `injectAsync` stated per spec.

## Method

The governing skills, `map.md`, `building-blocks.md`, `CONTEXT.md`, `README.md`, audit 0005, ADRs 0036, 0037, and 0038, the two `docs/agents` files, and the foundation-api-design skill were read in full by the auditor. The rest was split across five read-only sub-audits that shared one checklist (process P1 to P6, deciding claims J, changes C, cross-bundle agreement X, the spec gate G on edited parts, hygiene H) and one report format, and read their files in full from the same snapshot:

1. The modal-opener panel and its dossier, the Reveal server-state decision, the Triggers and Reveal specs, the Triggers and Reveal tickets' amendments, and every `modal-dialog`, `triggerRole`, and `aria-haspopup` statement in the bundle; the HTML standard's dialog and inert sections fetched.
2. The Slider and base-href panels and their dossiers, ADRs 0038, 0017, 0029, 0020, 0002, and the Slider, Smooth Scroll, and Magellan specs.
3. The fallback decision and its dossier, ADRs 0037, 0034, 0025, 0008, 0004, the Orbit spec, every file of `prototypes/orbit-slide-derived-inert/`, and the spec sections the other eight fallback items changed.
4. The assistive-technology decision, both evidence files, and the Off-canvas and Tooltip specs, with every cited NVDA, WebKit, and Chromium source file fetched from its pinned revision.
5. The assistive-technology decision's other changes (Dropdown Menu, Drilldown Menu, Abide, Magellan, Nested menu in full; the confirmed specs' edited sections), the upstream-filings ruling, and every OPEN FOR HUMAN or "human-only" hit in the snapshot.

The harness refused the sub-audits' report files, so each returned its report as text; the auditor merged them. Both High findings were re-checked by the auditor against the snapshot (`building-blocks.md:18`, `:235`, `:262`, `specs/anchored-pane.md:319`, `:362-365`, `:575-580`, `specs/tooltip.md:21`, `:225`; `specs/responsive-menu.md:24`, `:259`, `:264`, `:355-376`, `:478`, `:508`, `specs/nested-menu.md:227`, `:243`, `:303`), and so were the map, README, and ADR statements in M1, M2, M3, and L12 to L14.

A Node script ran over the 91 in-scope files (every file changed in `842946d..e0ed7f6`) and again over all 632 text files of the snapshot. It checked for:

- non-ASCII characters;
- the banned-word list with inflections, and the one banned word pair per file;
- bare ticket references in narration (tracker header lines and ticket H1s excepted);
- email-shaped tokens, by allowlist inversion (any hit printed masked, as lengths only);
- every relative Markdown link and heading anchor, resolved against the file's own directory;
- link texts that differ from the linked ticket's title.

Positive controls: a control ticket carrying one non-ASCII character, two bare ticket references, a missing target, a missing anchor, and a wrong link text (all found, exit 1); the user's instruction file (16 banned-word hits, the banned pair, and one non-approved email-shaped token found, not reproduced here); a governing skill file (55 non-ASCII characters found). A second method agrees: `rg -uu -P '[^\x00-\x7F]'` and a banned-word `rg` with word boundaries both exit 1 (no match) on the snapshot and exit 0 on their controls; no file contains the first word of the banned pair. An `rg -o` of email-shaped tokens over the snapshot finds only the approved address (17 occurrences), and the author and committer of all fourteen commits are the approved address; the commit messages carry no email token, no banned word, and no attribution line.

The script exits 1 on the snapshot for these reasons only: six false bare-number hits, all external issue numbers (NVDA's `#141`, one web component library's issue number, four Playwright issue numbers in `research/playwright-component-testing.md`); and 96 missing link targets, all effort-root-relative or ADR-relative links inside quoted proposals, of which the 23 in the modal-opener, Slider, base-href, assistive-technology, and Reveal server-state tickets and the three ADR-relative ones in the base-href and fallback tickets stand under no path note (L14). No heading anchor link fails, and no link text differs from its ticket's title.

Convention in this file: links inside proposed replacement text are written relative to this file so they resolve here; rewrite them relative to the target document when applying.

## Summary

| Severity | Count |
| --- | --- |
| High | 2 |
| Medium | 9 |
| Low | 15 |
| Total | 26 |

Severity definitions:

- High: a document the next repository would read as written would be misled (every spec and building-blocks are read by the implementer), or it contradicts a user rule or an ADR.
- Medium: a skill or map rule is broken in a way that weakens the bundle, without by itself planting a wrong fact in a spec.
- Low: hygiene.

The main pattern: the decisions are sound and their own specs carry them. All four panels ran as the map prescribes (four named lenses on two model families, two adversarial panelists, a judge who re-measured the deciding facts, weighed each argument, and recorded dissent with reopening facts), and every deciding claim the sub-audits checked holds against its source (over 100 checks, none failing). What did not keep up is the propagation of the last two decisions to documents their change lists did not name: the assistive-technology decision changed the Tooltip's description mechanism and the Nested menu's drilldown markup, and building-blocks, the Anchored pane spec, and the Responsive Menu spec still describe the old ones (H1, H2). The map's index was not brought along either: three judges' map edits never landed, and fourteen gists still say items are open (M1), while the upstream-filing ruling reached [Upstream filings](../issues/76-evidence-upstream-filing-readiness.md), the map, and the README but not the fifteen tickets, two specs, building-blocks, ADR 0018, and the Storybook conventions that still call a filing "human-only" (M2). ADRs 0030 and 0036 keep their superseded Off-canvas outcome in the decision paragraph, corrected only by a last bullet (M3). Three decisions left their measurements under `D:/tmp/` only (M7), and three answers do not name a model the map requires them to name (M9).

## Findings

### H1. Building-blocks and the Anchored pane spec still describe the kept tip as the Tooltip's description

- File: `building-blocks.md:18` (1.1 case 3), `:235` (Table A Tooltip), `:262` (Table B Tooltip); `specs/anchored-pane.md:319`, `:360-365`, `:572-580`; against `specs/tooltip.md:21`, `:203`, `:223`, `:225`, `:273`, `:284`, `:288`, `:342-345`.
- Rule: map Destination (`map.md:9`: "the building-blocks map agrees with them"); `/wayfinder` (a decision lives in one place and the others point at it correctly); the Anchored pane spec is a shared-utility spec that the Tooltip spec consumes.
- Evidence:
  - The assistive-technology decision's check 6 replaced the description: in its first client render callback the Tooltip directive inserts a hidden internal `nfs-tooltip-description` (`role="tooltip"`) as the host's next sibling and references it from `aria-describedby`; the visible tip is `aria-hidden="true"` (`specs/tooltip.md:21`, `:225`).
  - `building-blocks.md:235`: "internal `NfsTooltipTip` component (`.tooltip`, `role="tooltip"`) created on first show as a sibling and kept" and "`aria-describedby` bound only once the tip exists (none in server HTML)".
  - `building-blocks.md:262`: "an always-present description (`aria-describedby` to the kept tip, not Material's hidden copy, because the tip stays in the DOM once created)" and "the tip, the reference, and the `title` removal land together on first show"; the spec now borrows Material's hidden copy (`specs/tooltip.md:273`).
  - `specs/anchored-pane.md:319`: "a tooltip host carries `aria-describedby` to the tip once it exists"; its rendered HTML (`:362-365`) shows `aria-describedby="nfs-tooltip-1"` on the host pointing at `<nfs-tooltip-tip ... role="tooltip">`, and its tip sketch (`:578`) binds `role: 'tooltip'` "as the trigger's next sibling", which is now the description element's place.
  - The decision's change list (`issues/77-evidence-assistive-technology-checks.md:345-351`) names building-blocks edits for 1.8, Part 4, and the OffCanvas rows only, and nothing for the Anchored pane spec; `3167e3e` touched only those. An implementer who works from the matrix or the Anchored pane spec builds the design check 6 rejected (Firefox's description-change events, and a host's own `aria-describedby` losing the tooltip text, `issues/77-...md:129`).
- Fix:
  - `building-blocks.md:235`: "internal `NfsTooltipDescription` (`nfs-tooltip-description`, `hidden`, `role="tooltip"`) created in the first client render callback as the host's next sibling, and internal `NfsTooltipTip` (`.tooltip`, `aria-hidden="true"`) created on first show after it and kept"; "`aria-describedby` to the description element from the pass after the first client render callback (none in server HTML)".
  - `building-blocks.md:262`: "an always-present description through Material's hidden copy, kept beside the host instead of in `AriaDescriber`'s `body` container, with `aria-hidden` on the visible tip"; "the description element and the reference arrive in the first client render callback; the tip and the `title` removal land together on first show"; "`_IdGenerator` for the tip and description ids".
  - `building-blocks.md:18`: append "; in its first client render callback it also creates a hidden internal `NfsTooltipDescription` beside the host ([Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md))".
  - `specs/anchored-pane.md:319`: "a tooltip host carries `aria-describedby` to its hidden description element, and the tip is `aria-hidden` (the Tooltip spec)"; replace `:362-365` with the Tooltip spec's hydrated markup (`specs/tooltip.md:342-345`); at `:578` `role: 'tooltip'` becomes `'aria-hidden': 'true'`; at `:362` and `:573` "as the trigger's next sibling" becomes "after the description element".
  - Dated amendments in the [Spec: Tooltip](../issues/27-spec-tooltip.md) and the [Spec: Anchored pane (shared utility)](../issues/55-spec-anchored-pane.md).

### H2. The Responsive Menu spec, building-blocks, and the glossary contradict the Nested menu's Drilldown level names and toggle ids

- File: `specs/responsive-menu.md:24`, `:259`, `:262`, `:264`, `:355-376` (server HTML, drilldown at `small`), `:388-400` (hydrated at 1280 px), `:478` (SSR smoke); `building-blocks.md:227`, `:254`; `CONTEXT.md:196`; against `specs/nested-menu.md:227`, `:243`, `:303`, `:412-424`.
- Rule: the Responsive Menu spec consumes the Nested menu as that spec defines it (`specs/responsive-menu.md:512`); map Destination (building-blocks agrees with the specs); the assistive-technology decision's check 9.
- Evidence:
  - The Nested menu now binds `[attr.aria-labelledby]` on every submenu "its item's toggle id while the live mode is `drilldown`, else absent" (`:227`), and `[attr.id]` on every toggle in every mode (`:243`); its ARIA intro reads "Constant across modes, except the Drilldown level names that drilldown mode adds" (`:303`).
  - The Responsive Menu spec still says "The role set never changes, so a swap changes classes and keys only" (`:259`) and "A Mode swap changes classes and key handling on the same nodes, never roles" (`:24`); its ARIA row gives every submenu `ul` "no `role`, no `aria-*`" (`:264`) under a heading "constant across modes" (`:262`); its drilldown server HTML (`:360-374`) has no toggle `id` and no submenu `aria-labelledby`; and its SSR smoke asserts that "the HTML matches the Rendered HTML section" (`:478`), so the test an implementer writes from this spec fails against the Nested menu it composes.
  - The spec contradicts itself: its release test expects "on entering drilldown the level's name 'Products'" (`:508`), and the [Spec: Responsive Menu](../issues/23-spec-responsive-menu.md) amendment records that name (`:144`). `e0ed7f6` corrected the Nested menu's intro and rendered HTML only.
  - `building-blocks.md:227` ("so only keys and layout change"), `:254` ("changes classes and key handling but not roles"), and `CONTEXT.md:196` ("a class and key change on the same nodes for the menu Plugins") carry the same omission.
- Fix:
  - `specs/responsive-menu.md:259`: "The role set never changes, so a swap changes classes, keys, and, in drilldown mode, the Drilldown level names only." `:24`: "A Mode swap changes classes, key handling, and the Drilldown level names on the same nodes, never roles." `:262`: "Semantics". `:264`: "Native `list` and `listitem`; no `role`, and no `aria-*` except, in drilldown mode, `aria-labelledby` on each submenu naming its Drilldown level after its parent toggle (Nested menu)."
  - Server HTML: `id="nfs-submenu-toggle-a1-<n>"` on each toggle and `aria-labelledby="nfs-submenu-toggle-a1-<n>"` on each drilldown `ul`; hydrated dropdown HTML (`:390`): the toggle id without `aria-labelledby`. SSR smoke (`:478`): add "`aria-labelledby` on each submenu only in drilldown mode, resolving to its parent toggle's `id`".
  - `building-blocks.md:227`: "so only keys, layout, and the Drilldown level names change"; `:254`: "changes classes, key handling, and the Drilldown level names, but not roles". `CONTEXT.md:196`: "a class and key change on the same nodes for the menu Plugins, which drilldown mode extends with level names".
  - A dated amendment in the [Spec: Responsive Menu](../issues/23-spec-responsive-menu.md).

### M1. The map's index still says fourteen decided items are open, and three judges' map edits never landed

- File: `map.md:175`, `:185`, `:188`, `:220` (edits the judges listed); `:174`, `:225` (gists the modal-opener and assistive-technology decisions changed); `:166`, `:171`, `:180`, `:181`, `:182`, `:186`, `:192`, `:193`, `:200` (upstream and screen-reader clauses); against `issues/73-decide-slider-vertical-orientation.md:123`, `issues/74-decide-base-href-hash-links.md:136`, `issues/75-evidence-aria-fallback-confirmation.md:246`.
- Rule: `/wayfinder` (the map is the index; its gists point at the decision correctly); checklist C (every change a judge lists reaches the file it names); the user's ruling (`map.md:143`); the map's own "(later decided: ...)" convention (`:163`, `:182`, `:192`, `:195`).
- Evidence:
  - The Slider judge listed "(vertical announcement later decided: ...)" for `:175` and `:188`; the base-href judge replaced "`<base href>`-resolved `#` links after hydration stay OPEN FOR HUMAN" at `:185`; the fallback decision's change L replaced "and the Aria fallback awaits the user's confirmation" at `:220`. No commit in the pass touches those lines.
  - `:174` still says "whether a modal opener carries `aria-expanded` is OPEN FOR HUMAN"; `:225` says Off-canvas Modal mode keeps `dialog`, which the assistive-technology decision reversed.
  - Nine more gists say an upstream filing or a screen-reader check "stays human-only" or "OPEN FOR HUMAN" (for example `:200`, "three upstream filings and a screen-reader check stay human-only"), with no pointer to [Upstream filings](../issues/76-evidence-upstream-filing-readiness.md) or [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md).
- Fix: apply the three judges' texts as written (`:175`, `:188` with both the Slider decision and the assistive-technology decision named, since `aria-valuetext` was decided by the latter; `:185`; `:220`); append "(later changed: Off-canvas Modal mode reports `modal-dialog`, [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md))" to `:225` and "(later decided: [Decide: `aria-expanded` on a modal dialog's opener](../issues/72-decide-aria-expanded-on-modal-opener.md))" to `:174`; append "(later: not filed, by the user's ruling, [Upstream filings](../issues/76-evidence-upstream-filing-readiness.md))" to each upstream clause and "(later decided: [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md))" to each screen-reader clause.

### M2. Upstream filings and two decided screen-reader checks are still worded as open outside the map, with no pointer to the rulings that closed them

- File:
  - Specs and shared documents: `specs/orbit.md:296`, `:395`; `specs/tabs.md:310`; `building-blocks.md:327`; `adr/0018-browser-testing-stack.md:13`; `storybook-conventions.md:236`.
  - Tickets whose upstream items have no link to the upstream-filings ruling: `issues/15-spec-accordion.md:118-120`, `:166`, `:188`; `issues/16-spec-tabs.md:100`, `:144`, `:166`; `issues/18-spec-reveal.md:131-134`, `:202`, `:239`; `issues/19-spec-responsive-accordion-tabs.md:116`, `:155`, `:163`; `issues/31-spec-abide.md:106`, `:156`, `:173`, `:193`; `issues/33-spec-orbit.md:136-138`, `:201`, `:217`, `:264`; `issues/40-playwright-component-testing-prototype.md:108`, `:118`; `issues/41-browser-testing-stack-decision.md:69`, `:93`; `issues/42-prototype-reveal-dialog.md:129`, `:140`; `issues/43-prototype-aria-accordion-tabs.md:110`, `:112`; `issues/46-prototype-orbit-scroll-snap.md:154`, `:160`; `issues/49-prototype-signal-forms-abide.md:136`, `:139`, `:148`, `:152-153`; `issues/51-prototype-responsive-accordion-tabs.md:107`; `issues/65-prototype-orbit-keyboard-hydration.md:96`, `:104`; `issues/66-prototype-abide-controls-and-ready.md:90`, `:98`.
  - Screen-reader checks the pass decided, still open: `issues/42-prototype-reveal-dialog.md:139` (item 2), `issues/51-prototype-responsive-accordion-tabs.md:106` (item 1).
- Rule: the user's ruling (`map.md:143`: the upstream filings "are closed as not filed", the assistive-technology checks "decided from evidence"); the brief's check that no item stays OPEN FOR HUMAN anywhere; `/wayfinder` (a decision lives in one ticket and the others point at it).
- Evidence: specs tell the implementer that an action "stays human-only" (`specs/orbit.md:296`: "asking angular/components for a public API stays human-only, the ticket's OPEN FOR HUMAN 1"; `:395`; `specs/tabs.md:310`), as do `building-blocks.md:327` ("an upstream Aria filing stays human-only"), ADR 0018 (`:13`), and the Storybook conventions (`:236`). Only the consistency review, the map, and the README link the upstream-filings ruling; several assistive-technology amendments say "Item 1 (the upstream filing) is not touched here" (`issues/16-spec-tabs.md:166`; the same in the Accordion, Reveal, Responsive Accordion Tabs, Abide, and Orbit tickets). The parallel Nested menu prototype got its screen-reader amendment (`issues/50-prototype-nested-menu.md:173`), the Reveal dialog and Responsive Accordion Tabs prototypes did not. Nothing was filed or drafted as filed anywhere: the only upstream URLs cite existing threads. Rated Medium, not High: no statement changes what an implementer builds, and the ruling itself is recorded in the ticket, the map, and the README.
- Fix: in each listed ticket, "### Amendment, 2026-09-27 (open-decision pass)": "The upstream items are closed as not filed, by the user's ruling ([Upstream filings](../issues/76-evidence-upstream-filing-readiness.md)); no workaround here depends on them." For the two screen-reader items, name the decision and the spec holding each release test ([Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md), checks 4 and 3). In the two specs, building-blocks, the Storybook conventions, and ADR 0018 (as a dated bullet), replace each "stays human-only" clause with "is not filed, by the user's ruling ([Upstream filings](../issues/76-evidence-upstream-filing-readiness.md))".

### M3. ADRs 0036 and 0030 still decide the superseded Off-canvas outcome; the corrections are last bullets, not beside the parts they reverse

- File: `adr/0036-modal-dialog-trigger-role.md:5`, `:7`, `:13`, `:22-23`; `adr/0030-off-canvas-no-dialog.md:5`, `:7`, `:18`, `:20`; `README.md:107`, `:113`; `specs/off-canvas.md:207`, `:241`, `:270`, `:313`, `:334`; `building-blocks.md:99`, `:332`; against `issues/72-decide-aria-expanded-on-modal-opener.md:150-151`, `issues/77-evidence-assistive-technology-checks.md:351`, `:362`.
- Rule: `README.md:18` ("Later findings are dated bullets beside the part they qualify, and a changed decision gets a new record"); the assistive-technology decision's own instruction ("ADR 0030, beside the second Consequences bullet"); ADR 0036's rule (`:7`: "reports it only when the platform makes every Trigger outside it inert for as long as it is open").
- Evidence:
  - ADR 0036's decision paragraph (`:7`) still says an Off-canvas panel in Modal mode keeps `dialog` with `aria-expanded` and "does not qualify"; considered option 3 (`:13`) reads "rejected by measurement". Only the last Consequences bullet (`:23`) reverses it. Its title (`:5`) and README row (`:113`) name the Reveal only.
  - ADR 0030's decision paragraph (`:7`) still builds modal mode from "`inert` on the linked `.off-canvas-content`", its title and README row (`:5`, `README.md:107`) still read "modal mode makes the content inert instead", and the dated bullet sits at `:20`, after the third Consequences bullet, not beside the second (`:18`) where the decision told the orchestrator to put it. The decision's reason for no new record ("each ADR named this change in advance or keeps its decision") holds for ADR 0036, whose option 3 named it, not for ADR 0030, and the decision rates the change HIGH impact (`:362`).
  - The rule's guarantee has accepted exceptions the specs do not state: the Modal inert set applies "once focus is inside the panel" (`specs/off-canvas.md:207`, `:270`), Modal mode with `autoFocus: false` is allowed (`:241`), and the modal-opener panel's amendment (`:151`) accepts cases in which a Trigger stays reachable while the panel is open (inside an exception, an `nfsToggle` inside its own panel, an element added after the set was taken, a modal panel open by default before hydration, `autoFocus: false`). `specs/off-canvas.md:313` ("so an expanded state could never be read as true"), `:207`, `:334`, `building-blocks.md:99`, and `:332` state the guarantee without them.
- Fix:
  - ADR 0036: after `:7` and after `:13`, a dated line: "2026-09-27: Off-canvas Modal mode now reports `modal-dialog` ([Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)): its Modal inert set makes every Trigger outside the panel inert while it is open, except the edge cases [Decide: `aria-expanded` on a modal dialog's opener](../issues/72-decide-aria-expanded-on-modal-opener.md) accepts in its 2026-09-27 amendment, in which only Firefox's UI Automation infers 'collapsed'."
  - ADR 0030: move `:20` under `:18`, and add under `:7`: "2026-09-27: modal mode's `inert` now covers the Modal inert set, every element outside the panel's ancestor chain with named exceptions; the no-`<dialog>` decision stands ([Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md))". `README.md:107`: "...; modal mode makes the rest of the page inert instead (the Modal inert set)". If the README rule is read strictly, a new record superseding only ADR 0030's modal-mode clause.
  - `specs/off-canvas.md:313`: append "apart from the edge cases the modal-opener decision accepts (a Trigger inside an exception, an `nfsToggle` inside its own panel, an element added after the set was taken, a panel open by default before hydration, `autoFocus: false`)"; the same qualifier at `:207`, `:334`, and in building-blocks 1.8 and Part 4 item 4.

### M4. The Reveal's new focus-restore fallback and its development warning reached one bullet of the spec

- File: applied at `specs/reveal.md:238`; not at `:208`, `:226`, `:485`, `:489`, `:558`; `specs/triggers.md:147`, `:257`, `:430`; against `issues/78-decide-open-by-default-non-modal-reveal-server-state.md:144`, `issues/18-spec-reveal.md:229-231`.
- Rule: `/to-spec` (Testing Decisions state what each decision asserts); checklist C.
- Evidence: the orchestrator's follow-up to the Reveal server-state decision (`:144`) sets the restore order `restoreFocus`, then the `trigger`, then the element focused at open when that was not `body`, "then the first registered Trigger, and in development mode closing with no usable target logs a warning naming the `restoreFocus` input". The Restore bullet has it (`:238`); the development-check paragraph still lists six checks (`:226`), the browser-level test still says "each of the six warnings fires once" (`:489`), the focus test has no first-registered-Trigger or warning case (`:485`), D14 still reads "Restore focus to the Trigger from `open(trigger)`, CDK's guard, and a fallback up closed Reveals" (`:558`), and the `registerTrigger` row serves Light dismiss only (`:208`). The Triggers spec's inherited rule stops at "else to the element focused before opening" (`:147`, `:257`, `:430`).
- Fix: `reveal.md:226` append "(7) at close, no usable restore target (the `restoreFocus` target, the `trigger`, the element focused at open, and every registered Trigger missing or unfocusable): the warning names the `restoreFocus` input"; `:489` "each of the seven warnings"; `:485` add "to the first registered Trigger when the Reveal was open at its first render and focus sat on `body`, and the development warning when no target is usable"; D14 append "; the first registered Trigger as the last fallback (a Reveal open at its first render has no `trigger`)"; `:208` append "; the first registered Trigger is also the last focus-restore fallback"; `triggers.md:430` "else (where the Openable says so, as Reveal does) to its first registered Trigger".

### M5. The Off-canvas Modal inert set is removed only at the close request, never on destroy

- File: `specs/off-canvas.md:207`, `:258`, `:465`, `:469`, `:532` (D14).
- Rule: building-blocks 1.9 (`building-blocks.md:114`: "Restore any global the directive touched (hash, `history` state, `body` classes, `inert` on content) in `DestroyRef.onDestroy`").
- Evidence: the panel writes `inert` onto page elements it does not own and removes it "from exactly those at the close request, before focus returns" (`:207`, D14); the cleanup row "clears the timer" (`:258`), and only the `body` class is "removed on destroy" (`:469`). A panel destroyed while open (a route component replaced, an enclosing `@if` turned false) runs no close request and leaves the rest of the page inert. Before the assistive-technology decision `inert` was a host binding on `nfsOffCanvasContent` and went with the directive; the new mechanism lost that.
- Fix: `:207` append "; a panel destroyed while the set is applied removes it in `DestroyRef.onDestroy`"; `:258` "clears the timer and removes an applied Modal inert set"; D14 "removed at the close request, or on destroy, from exactly the elements it changed"; `:465` add the browser-level case "destroying an open modal panel removes `inert` from every element the set changed"; a dated amendment in the [Spec: Off-canvas](../issues/25-spec-off-canvas.md).

### M6. The Tooltip's new `NfsTooltipDescription` component stands outside ADR 0001's named exceptions, and no record weighs it

- File: `specs/tooltip.md:124-125`, `:225`, `:523` (D1 names only `nfs-tooltip-tip`); `building-blocks.md:14-18` ("Three cases qualify"); `adr/0001-directive-first-with-named-exceptions.md:7`, `:25`.
- Rule: ADR 0001 ("a component is allowed only where Foundation's JavaScript generated structure the consumer never wrote and that structure is not a single plain element"; "Specs that find they need generated structure must first look for a platform feature or a one-element consumer authoring step before proposing a component"); `docs/agents/domain.md` ("Flag ADR conflicts").
- Evidence: Foundation never generated a description element (its tip was the description); the new element's template is `{{ text() }}`, a single plain element; check 6 and Tooltip changes 2 and 5 (`issues/77-...md:272`, `:275`) add it as a component without citing ADR 0001, and neither D1 nor building-blocks 1.1 case 3 names it.
- Fix: ADR 0001, a dated bullet: "2026-09-27: the Tooltip exception also covers the tip's hidden description element, created in the first client render callback and never authored ([Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md))"; the same clause in building-blocks 1.1 case 3 (with H1); `specs/tooltip.md:523` D1 "plus the internal `nfs-tooltip-tip` and `nfs-tooltip-description` components".

### M7. Four decisions left their measurements under `D:/tmp/` only, and nothing says so

- File: `issues/72-decide-aria-expanded-on-modal-opener.md:31-36`, `research/decision-aria-expanded-modal-opener.md:20`, `:92-142`; `issues/73-decide-slider-vertical-orientation.md:30-31`, `:40`, `:42`, `:48`, `:51`, `:57`, `research/decision-slider-vertical.md:20`, `:155`; `issues/74-decide-base-href-hash-links.md:31`, `:32`, `:40`, `:42`, `research/decision-base-href-hash-links.md:17`, `:82-93`; `issues/78-decide-open-by-default-non-modal-reveal-server-state.md:115`; the assistive-technology decision's judge captures (`D:/tmp/nfs-at-evidence-1/out/judge77-*`).
- Rule: `map.md:100`, `:104` (evidence is kept in the effort so the bundle ports; a prototype's decisive files go under `prototypes/<name>/`); `/mattpocock-skills:prototype` rule 6; `/research` step 2; the audit 0005 L1 convention (say when a capture keeps less than the ticket cites).
- Evidence: the judges' "verified" marks point at files the snapshot does not hold (UIA and MSAA outputs, compile probes, `decision.spec.ts` and `run2.log`, `keys-pw*.txt`, `probe-pw156.txt`, `annotations.log`, `summary-e.log`, the J1 to J3 captures). The sub-audits found each one still under `D:/tmp/` and matching its citation (for example `run2.log` ends "54 passed (1.5m)"; `annotations.log:23`, `:52`), so no fact is wrong; but the fallback decision in the same pass captured its equivalent as `prototypes/orbit-slide-derived-inert/`, and the bundle's first move is to another repository.
- Fix: capture the decisive files under `prototypes/modal-opener-aria/`, `prototypes/slider-vertical-orientation/`, `prototypes/base-href-hash-links/`, `prototypes/reveal-open-first-paint/`, and the judge captures of the assistive-technology decision under its evidence directory, each with a README, and repoint the citations; or add to each dossier's source table and to the Reveal server-state ticket: "The experiment and panel workspaces under `D:/tmp/` are not part of the bundle; the tables in this file are the record of what they measured."

### M8. The one probe that would reopen the Slider decision is no longer in any spec or list

- File: `issues/73-decide-slider-vertical-orientation.md:68`, `:76`; `README.md:125-127`; `research/assistive-technology-evidence-2.md:356`; `specs/slider.md:506`.
- Rule: the Slider decision's own Triage guard (d) and Dissent (second reopening fact); `/to-spec` (release checks belong in the spec).
- Evidence: `4f030f5` put the probe into README assistive-technology check 11 ("whether any screen reader or touch assistive technology fails to change a rotated Handle's value because Chromium exposes it as horizontal"); the assistive-technology evidence set it aside as "a separate trap-quadrant decision and ... not evidenced here" (`-2.md:356`); `3167e3e` replaced the README's numbered checks with a summary, which removed it; the Slider release test (`:506`) covers `aria-valuetext` only. The reopening fact now has no check that could produce it.
- Fix: append to `specs/slider.md:506`: "On `slider--vertical` and `slider--vertical-two-handles`, with JAWS on Chrome and Edge and TalkBack on Chrome: each Handle's value changes with the arrow keys and with the screen reader's own slider commands and gestures; if any fails to change a rotated Handle's value because Chromium exposes it as horizontal, reopen [Decide: Slider vertical orientation](../issues/73-decide-slider-vertical-orientation.md) (its Dissent, second fact)." Add a dated note under that ticket's Triage naming where guard (d) lives, and a dated amendment in the [Spec: Slider](../issues/32-spec-slider.md).

### M9. Three answers do not name a model the map requires them to name

- File: `issues/72-decide-aria-expanded-on-modal-opener.md:21`; `issues/75-evidence-aria-fallback-confirmation.md:19`; `issues/77-evidence-assistive-technology-checks.md:19`.
- Rule: `map.md:117` ("each ticket answer names the model per role").
- Evidence: the modal-opener panel names its four panelists' models but not the judge's, which appears only in the body of `8933d5d` ("a Fable judge"), committed 19 seconds before the substitution note `6a4ea65`, so no substitution applied. The fallback decision names its reviewers (overrule side Opus, confirm side Fable) and says the judge "replaced one whose model ran out of credit", but names neither judge's model; `8abf735` says "an Opus judge". The assistive-technology decision names the review and its helper (Sonnet 5) and the judge (Opus 5.5), but not the model of the two evidence agents. The bundle is meant to port without its git history (`map.md:246`).
- Fix: `issues/72-...md:21` "Judge's ruling (Fable 5.1, before the credit ran out)"; `issues/75-...md:19` "Resolved 2026-09-27 by the judge (Opus 5.5, AFK). This judge replaced a Fable 5.1 judge whose credit ran out"; `issues/77-...md:19` "The two evidence agents (E1, E2) ran on <model>."

### L1. Several Triggers and building-blocks cells explain `modal-dialog` through the Reveal only

- File: `specs/triggers.md:146`, `:408`, `:424`; `building-blocks.md:99`, `:251`, `:332`; `README.md:113`.
- Rule: `/to-spec`; `/wayfinder` (attribute each decision to the ticket that made it).
- Evidence: the `triggerRole` row (`triggers.md:146`) lists the Toggler, Dropdown pane, and Reveal as switching roles, not OffCanvas (`disclosure` or `modal-dialog`, `specs/off-canvas.md:204`); D7 (`:408`) gives only "a `showModal()` dialog makes its Trigger inert while open"; the Consumers row (`:424`) attributes OffCanvas's `modal-dialog` to the Off-canvas spec "from the APG's modal-dialog reading", while the assistive-technology decision assigned it under ADR 0036's rule. Building-blocks 1.8 introduces the role "for a modal Reveal (`modal-dialog`, a `<dialog>` opened with `showModal()`)" before adding Off-canvas (`:99`); Part 4 item 4 says "the platform makes inert around", while for Off-canvas it is the library's Modal inert set (`:332`); Table B OffCanvas, Material column, keeps "`inert` on content while open" (`:251`). The README's ADR 0036 row adds a clause its H1 does not have (`:113`).
- Fix: `triggers.md:146` append ", and OffCanvas between `disclosure` and `modal-dialog` from its modal mode"; `:408` insert ", as does an Off-canvas panel in Modal mode through its Modal inert set"; `:424` "assigned by [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md) because its Modal inert set makes every Trigger outside the panel inert while it is open"; `building-blocks.md:99` "for a modal Reveal or an Off-canvas panel in Modal mode (`modal-dialog`)"; `:332` "reported only by an Openable whose Triggers outside it are all inert while it is open"; `:251` "the Modal inert set while open (Material puts `inert` on its content)"; README row: the ADR's H1.

### L2. Two Reveal edges of the server-state decision are not stated where a reader looks for them

- File: `specs/reveal.md:202`, `:336`, `:426`, `:429`; `specs/triggers.md:430`; `issues/78-...md:29`, `:57`, `:73`.
- Rule: `triggers.md:430` ("keep `isOpen` a model whose server value is its first-paint state"); the user's WCAG 2.2 AA rule; `/to-spec`.
- Evidence: the Reveal spec names its exception ("A modal Reveal open by default is the one case whose server `isOpen` differs from its first paint", `:426`), the shared-utility rule it departs from does not. Replay runs after the first render callbacks (`:29`), so an `nfsToggle` click before hydration on a modal Reveal open by default replays after `showModal()` and closes a dialog the user never saw; `:429` states that inversion only for the old non-modal design, and `:202` still says "`[isOpen]="true"` opens by default after hydration". The 2.4.11 row (`:336`) relies on Light dismiss, which cannot act before hydration for a non-modal Reveal shown at first paint (`:429`), the obstruction the decision's own dissent names (`:73`).
- Fix: `triggers.md:430` add "(the one named exception: a modal Reveal open by default, whose server HTML stays closed because `showModal()` cannot promote a dialog opened by attribute)"; `reveal.md:429` add "For a modal Reveal open by default, an `nfsToggle` click before hydration replays after the first render callback has shown the dialog and closes it; its Triggers use `nfsOpen`."; `:202` "`[isOpen]="true"` opens a modal Reveal after hydration and renders a non-modal one shown from the first paint"; `:336` append the pre-hydration window and the first-render focus rule, citing the decision's dissent.

### L3. Smooth Scroll keeps two traces of the old rule

- File: `specs/smooth-scroll.md:16`; `issues/29-spec-smooth-scroll.md:107`, `:143`, `:173`.
- Rule: `/to-spec` (decisions stated as made); `/wayfinder`.
- Evidence: the Problem Statement lists the states "whenever no script handles it: before hydration, inside `@defer (hydrate never)`, for crawlers, and on middle-click", which implies the directive handles the link after hydration, the old default; the rest of the spec states the new rule (`:30`, `:140`, `:149`, `:261`, D9). The ticket keeps three "STAYS OPEN FOR HUMAN" lines whose decision is only in the amendment (`:183-185`), where the Slider ticket prefixes its line inline (`issues/32-spec-slider.md:120`).
- Fix: `:16` from "so on any route other than the root" to the end of the bullet: "so on any route other than the base URL it is a cross-document navigation to the home page in every rendering mode, after hydration too, because the directive handles only links the browser treats as same-document (D9, ADR 0038)." Prefix `issues/29-...md:107` with "DECIDED 2026-09-27 by [Decide: `#`-only links that `<base href>` resolves to another document](../issues/74-decide-base-href-hash-links.md): option (b), ADR 0038." and append "Outcome (open-decision pass): DECIDED; see the amendment of 2026-09-27." to `:143` and `:173`.

### L4. The Slider WCAG table has no 1.3.1 row for the vertical form

- File: `specs/slider.md:309-318`; against `research/decision-slider-vertical.md:393`, `issues/73-...md:32`.
- Rule: ADR 0022 (the criteria subsection names every criterion the plugin touches).
- Evidence: the dossier and the ruling treat 4.1.2 and 1.3.1 as both touched; only the 4.1.2 part reached the spec (`:318`).
- Fix: add a 1.3.1 row: the range form's `role="group"` named by `aria-labelledby`, each Handle's own label, and `aria-orientation="vertical"` in the markup (exposed by Firefox and WebKit, Chromium's horizontal readout accepted by the Slider decision); enforced by axe in every story and the `slider--two-handles` and `slider--vertical` assertions. Record it in the Slider ticket's amendment.

### L5. The Orbit spec's binding-precedence paragraph keeps the superseded cause beside the new one

- File: `specs/orbit.md:226`; against `adr/0037-orbit-slide-hosts-tab-panel.md:25`, `prototypes/orbit-slide-derived-inert/probe/g-orbit-order.ts:171-184`, `probe/g-output.txt:18-21`.
- Rule: `/to-spec`; ADR 0037.
- Evidence: the paragraph gives the cause as "the bullets have not registered yet (they follow the slides in the document)" and later the `@for` cause, adding "static markup does not fail this way (`g4`)"; `g4` keeps Foundation's order and holds, so document order is not the cause.
- Fix: "(inside `@for`, the bullets' embedded views register after the slides bind)".

### L6. The fallback decision's capture keeps less than its ticket cites

- File: `issues/75-...md:29`, `:39`, `:131`; `prototypes/orbit-slide-derived-inert/README.md:11`, `:17`, `:21`; `probe/prototype-server-html.txt:10`; `judge/pw-hydration.log:6-7`, `:10`, `:27-47`; `judge/judge.spec.ts:62`, `:72`.
- Rule: `/mattpocock-skills:prototype` rules 2 and 6; audit 0005 L7 (capture claims agree with captured files).
- Evidence: the `?selected=2` server HTML (no `inert`, `tabindex="0"` on slide 2, Aria's `aria-controls` on every bullet) is cited in the Why, the Triage confidence, and the README verdict, but the only captured server HTML is the unbound page. The hydration log records "1 failed, 20 passed" from an earlier version of the judge probe (tests at `:55` and `:74`) than the captured `judge.spec.ts` (tests at `:62` and `:72`), whose 6-of-6 run is `pw-judge.log`; the hydration suite itself is 15 of 15. The README's run steps omit the suite switch, the ports, and the `ngc` step that section O of the ticket (`:270`) gives.
- Fix: capture the `?selected=2` page as `probe/prototype-server-html-selected-2.txt` (the workspace still exists) or mark the claim "(read by the judge; not captured)"; note under README `:17` that the log's two extra cases come from an unkept first probe version; replace README `:21` with section O's run lines plus `npx ngc -p tsconfig.g.json` and `node --import ./register.mjs out-g/g-orbit-order.js`.

### L7. Leftover text and stale pointers in the pass's own tickets

- File: `issues/75-...md:23`, `:145`, `:214`; `issues/76-evidence-upstream-filing-readiness.md:21`; `issues/33-spec-orbit.md:201`, `:252`; `issues/36-consistency-review.md:128`, against `issues/77-...md:355`.
- Rule: hygiene; `/wayfinder` (cite the current record); checklist C.
- Evidence: the fallback decision keeps the ADR-number substitution text ("If 0037 is assigned elsewhere first, substitute ...", "'ADR 0037' stands for the number the orchestrator assigns", "the orchestrator renames it to `adr/0037-...`", the same name). The upstream-filings ruling points at ADR 0034 for the binding rule, right when written (`1c8476f` precedes ADR 0037) and stale now. The Orbit ticket's stale-reference list (`:252`) omits `:201`, which still calls an upstream question "human-only". The assistive-technology decision listed "its open-list count drops the 13 assistive-technology checks" for the consistency review; the applied text keeps the counts as recorded and states every item decided, and only `e0ed7f6`'s commit body says why.
- Fix: `75:23` "ADR number: 0037 (`adr/0037-orbit-slide-hosts-tab-panel.md`), after 0036 went to the modal-dialog Trigger role on 2026-09-27"; delete the `:145` sentence; `:214` "New: `adr/0037-orbit-slide-hosts-tab-panel.md`, `status: accepted`, `supersedes: 0034`". `76:21` "(building-blocks 1.9, ADR 0037, which superseded ADR 0034)". Add `:201` to the Orbit ticket's list. In the assistive-technology decision's change list: "Applied instead: the consistency review keeps its counts as recorded and states every item decided (orchestrator, 2026-09-27)."

### L8. Magellan expects VoiceOver on iOS to say "current page" for `aria-current="true"`

- File: `specs/magellan.md:259`, `:434`; `issues/77-...md:205`, `:209`, `:342`; `issues/30-spec-magellan.md:227`; `research/assistive-technology-evidence-2.md:565-566`, `:583`.
- Rule: `/research` step 1 (a claim follows its source).
- Evidence: the a11ysupport.io change test behind that wording sets `aria-current="page"` (pinned `6730ad42`, `data/tests/html/aria/aria-current-change.html:33`, `:47`); for `true` a11ysupport.io records VoiceOver on iOS reading "current" (`-2.md:565`), and NVDA's `release-2026.2` maps `true` to "current" and `page` to "current page" (`source/controlTypes/isCurrent.py:42-44`). Magellan renders `true` by default (`specs/magellan.md:168`). The same row's Source cell still says "attribute changes are not announced" beside corrected text that says a focused link's change is announced.
- Fix: `:259` "VoiceOver on iOS is expected to say 'current' (a11ysupport.io; its change test, run with `page`, heard 'current page')"; Source cell "attribute changes on elements without focus are not announced"; `:434` "(VoiceOver on iOS may say 'current')"; the same in check 13, the Magellan ticket, and a dated note in the evidence file.

### L9. The Abide spec does not document the custom-control limitation its tickets call documented

- File: `specs/abide.md:135`, `:233`; `issues/77-...md:177`; `issues/31-spec-abide.md:191`.
- Rule: `/to-spec`; checklist C.
- Evidence: the assistive-technology decision keeps the in-label Form error for a custom `FormValueControl` host, "the missing system alert there is the documented limitation", and the Abide ticket repeats it; the Custom controls bullet (`:135`) says nothing about it, and the spec's only related text is the native-control warning (`:233`) and D3.
- Fix: add to `:135`: "Its Form error stays inside the wrapping label, where Chromium fires no system alert event for a `role="alert"` element; the error still reaches screen readers through the live-region path. A known limitation while custom controls link through their wrapping label ([Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md), check 10)."

### L10. The Accordion Menu and Dropdown Menu rendered HTML omit the toggle `id` the Nested menu binds in every mode

- File: `specs/accordion-menu.md:309`, `:312`, `:322`, `:340`; `specs/dropdown-menu.md:366`, `:370`, `:379`, `:395`; against `specs/nested-menu.md:243`, `:437`, `:450`.
- Rule: the menu specs consume the Nested menu as it defines itself.
- Evidence: `e0ed7f6` updated only the Nested menu's examples; the generated ids are harmless to omit from an illustration, but both specs' SSR smokes compare with their Rendered HTML.
- Fix: add `id="nfs-submenu-toggle-..."` to each toggle, with a note in each ticket's amendment.

### L11. Changed behaviours are missing from WCAG rows, SSR smokes, and design decisions

- File: `specs/drilldown-menu.md:309` (1.3.1), `:479` (SSR smoke); `specs/nested-menu.md:360` (1.3.1), `:575-599`; `specs/abide.md:327` (4.1.3); `specs/dropdown-menu.md:317` (2.4.3).
- Rule: building-blocks 1.10 (the criteria subsection says how each criterion is met); building-blocks 1.14.
- Evidence: the Drilldown level names are in server HTML, but no 1.3.1 row names them and the Drilldown SSR smoke does not check them; the Nested menu records no design decision for the hover guard or the level names (the Drilldown spec records the names as D23); Abide's 4.1.3 row does not give the after-label placement or its reason; Dropdown Menu's 2.4.3 row does not say that hover never moves keyboard focus.
- Fix: append the level names to both 1.3.1 rows and to the Drilldown SSR smoke; add a Nested menu design decision for the hover guard and the level names; Abide 4.1.3: "a native control's Form error sits after its label, because inside a `label` Chromium fires no alert event and Firefox adds the error to the field's name"; Dropdown Menu 2.4.3: "hover never moves keyboard focus".

### L12. The glossary's new and old terms drift from the specs and the format

- File: `CONTEXT.md:147-149` (Modal inert set), `:167-168` (Tip); `specs/off-canvas.md:207`, `:307`, `:399`.
- Rule: `/domain-modeling` ("CONTEXT.md should be totally devoid of implementation details"); CONTEXT-FORMAT ("Define what it IS").
- Evidence: the Modal inert set entry names the sibling-and-ancestor walk, CDK's focus-trap anchors, and CDK's container classes, which the spec already holds (`:207`). It and the spec's ARIA rows promise "live regions" stay reachable, while the rule exempts only chain siblings carrying `aria-live` or `popover` (as CDK Dialog does, `components/src/cdk/dialog/dialog.ts:393-413`), so a `role="status"` region without `aria-live`, or a live region inside an inerted element, is inert. The Tip is still "The `.tooltip` element whose text describes a Tooltip's host", while the tip is now `aria-hidden` and the description element describes the host.
- Fix: "**Modal inert set**: Everything on the page outside an OffCanvas panel in Modal mode that the panel makes inert while it is open; the overlay and page-level live regions and popovers stay reachable." "**Tip**: The `.tooltip` element a Tooltip shows beside its host, carrying the same text as the host's description; distinct from the Tooltip Plugin and from the host that triggers it." `specs/off-canvas.md:207`: "live regions placed along the chain, such as CDK's `LiveAnnouncer` element, stay announceable; a live region inside an inerted element is inert with it"; `:307`, `:399`: "`aria-live` elements".

### L13. The README's index statements and counts lag the pass

- File: `README.md:21`, `:22`, `:41`, `:119`, `:129`.
- Rule: hygiene (the index describes the bundle as it is); map Orchestration rules (the triage rule's kinds).
- Evidence: step 7 calls `research/` "the fifteen research files" and lists fifteen; the directory holds 21, and the six the pass added (three decision dossiers, the fallback dossier, two assistive-technology evidence files) are not indexed, though ADRs and tickets cite them. Step 8 counts "23 prototypes and re-runs"; `prototypes/` holds 24 directories, the new `orbit-slide-derived-inert/` being the fallback decision's evidence capture, which the Orbit row (`:41`) does not list although ADR 0037 cites it. The open list's opening sentence (`:119`) names the triage rule's kinds as "an item of HIGH impact with NOT-HIGH confidence, plus outward-facing actions", dropping the two kinds it still has sections for (assistive-technology checks and Aria fallbacks). The trap-quadrant heading still says "default applied" over "None" (`:129`).
- Fix: step 7 "the twenty-one research files: the fifteen the specs cite by title and section (...), and the six evidence files of the open-decision pass (the three decision dossiers, the fallback dossier, and the two assistive-technology evidence files)", each linked; step 8 "the captured decisive files of 23 prototypes and re-runs, plus the evidence of the [Decide the `@angular/aria` fallback confirmation](../issues/75-evidence-aria-fallback-confirmation.md) (`prototypes/orbit-slide-derived-inert/`)", and the capture in the Orbit row; `:119` "..., plus outward-facing actions under the user's identity, checks that need assistive technology, and fallbacks from `@angular/aria` building blocks"; `:129` "### Trap-quadrant decisions (0; all decided)".

### L14. Effort-root links in the pass's quoted proposals carry no path note

- File: `issues/72-...md:111`, `:115`, `:143`; `issues/73-...md:99`, `:101`, `:116`, `:123`, `:129`; `issues/74-...md:125`, `:130`, `:136`, `:140`; `issues/75-...md:215`, `:216`; `issues/77-...md:347`, `:349`, `:368`; `issues/78-...md:140`.
- Rule: the effort-root note convention (audit 0004 L3, applied to every ticket whose quoted proposals carry effort-root paths).
- Evidence: 23 links in the five tickets resolve from the effort root (the proposals for building-blocks, the map, and the README), with no "(paths relative to the effort root)" note; `issues/74-...md:125` and `issues/75-...md:215-216` link `0038-...md` and `0037-...md`, relative to `adr/`, under the fallback ticket's "Paths relative to the effort root" note (`:145`). Every link is right for its target document.
- Fix: add "(paths relative to the effort root; links inside proposed ADR text are relative to `adr/`)" above each ticket's change list.

### L15. Two small slips in the pass's files

- File: `building-blocks.md:258`; `research/assistive-technology-evidence.md:297`, `:473`; `research/assistive-technology-evidence-2.md:512`.
- Rule: hygiene; `/research` (errata stated where they apply).
- Evidence: the base-href fold-in starts a sentence in lower case ("hazard). a link host whose `href`..."). The evidence files' proposed test lines name story ids that do not exist (`reveal--no-overlay`, `tooltip--default`, `orbit--default`; the specs' stories are `reveal--without-overlay`, `tooltip--defined-term`, `orbit--basics`), with an erratum for one other id only (`:386`); the ticket's verbatim release steps use the right ids, so no spec is wrong.
- Fix: "A link host"; a dated erratum under each of the three sections.

## Unrecorded departures and Sass conflicts

Departures of a published spec (or the matrix) from `building-blocks.md`, a shared-utility spec, or an ADR at HEAD that no ticket records:

1. The Responsive Menu spec's ARIA table, drilldown server HTML, and SSR smoke omit the Drilldown level names and toggle ids of the Nested menu it composes; building-blocks Tables A and B ResponsiveMenu and the glossary's Mode swap say the same (H2).
2. Building-blocks Tables A and B Tooltip, 1.1 case 3, and the Anchored pane spec disagree with the Tooltip spec's description element (H1).
3. The Tooltip's `NfsTooltipDescription` component is outside ADR 0001 and building-blocks 1.1 (M6).
4. The Off-canvas Modal inert set is not restored on destroy, against building-blocks 1.9 (M5).
5. The Accordion Menu and Dropdown Menu rendered HTML omit the toggle ids the Nested menu binds (L10).
6. A modal Reveal open by default has a server `isOpen` that differs from its first paint, recorded in the Reveal spec (`:426`) and the Reveal server-state decision, but not in the Triggers spec rule it departs from (`specs/triggers.md:430`) (L2).
7. Building-blocks Table B OffCanvas, Material column, keeps "`inert` on content while open" against the Modal inert set (L1).

Conflicting Sass settings: none. No decision of the pass changed a Sass setting or a compile-time check: the Off-canvas mixin (`specs/off-canvas.md:644-653`) and the Orbit settings (`specs/orbit.md:407`, `:417`) are unchanged, Tooltip still ships no library CSS (`specs/tooltip.md:421`), and the Slider decision keeps rule 11 and the `foundation-range-input` Sass as they were.

## Verified OK

Process, per decision:

| Decision | Dossier | Panel or review, with models | Judge | Triage | ADR |
| --- | --- | --- | --- | --- | --- |
| Modal opener | Linked, cited per claim, key table (`research/decision-aria-expanded-modal-opener.md:5-20`) | a11y (Opus), api (Fable), vsdefault (Opus, against the default), vsalt (Fable, against the alternatives) (`issues/72-...md:21`) | Fable, before the substitution (commit body only, M9); re-read or re-ran every deciding fact, weighed each panelist (`:38-43`), dissent with reopening facts (`:45-52`) | HIGH impact, HIGH confidence (`:54-58`) | ADR 0036, bar argued (`:115`) |
| Slider vertical | Linked, cited, no recommendation | a11y (Opus), api (Fable), vsdefault (Opus), vsalt (Fable) | Opus, Fable substitution recorded (`issues/73-...md:21`); weighing (`:55-60`), dissent (`:62-70`) | MEDIUM impact, HIGH confidence (`:72-76`) | None, justified (`:106`) |
| Base href | Linked, cited | a11y (Opus), api (Sonnet 5 for Fable), vsdefault (Opus), vsalt (Sonnet 5 for Fable) (`issues/74-...md:21`) | Opus; weighing, dissent | HIGH, HIGH | ADR 0038, bar stated |
| Aria fallback | Linked; source revisions pinned (`research/aria-fallback-evidence.md:9-15`); probes A to F with output | Overrule side (Opus), confirm side (Fable) | Replacement judge after Fable ran out (model unnamed, M9); per item Decision, Why, Weighing, Dissent (`:35-125`); re-ran probe G and the keyboard prototype | All nine rated (`:127-139`) | ADR 0037, `supersedes: 0034` |
| Assistive-technology checks | Two evidence files, pinned sources (NVDA `f56b2e0` and `release-2026.2`, WebKit `c39e3bbd`, Chromium `cdf7131c`) | Adversarial review on all thirteen (Sonnet 5, with a helper on checks 8 to 10) | Opus 5.5; "Review weighed" per check; re-measured the strongest finding (J1 to J3, `:27-32`) | Complete (`:358-364`) | Dated bullets only (M3 for ADR 0030) |
| Reveal server state | The HTML standard, sources, and a three-engine measurement | Single agent (Opus 5.5), with an adversarial pass against its own first answer (`issues/78-...md:61-69`) | Not a panel item (MEDIUM impact); 16-question log (`:40-59`), dissent (`:71-74`) | MEDIUM, HIGH (`:76-80`) | None, justified (`:59`) |

The commit order fits `map.md:117`: the modal-opener decision (`8933d5d`, 00:22:34) precedes the substitution note (`6a4ea65`, 00:22); every later decision (05:22 to 06:20) names the substitution where a Fable role ran on another model.

Changes and cross-bundle agreement:

- The modal-opener panel's changes are all applied: the Triggers spec (`specs/triggers.md:21`, `:67`, `:127`, `:146`, `:219`, `:225`, `:230-231`, `:252`, `:275-287`, `:332`, `:342-343`, `:365`, `:407-408`, `:423-424`, `:538`, `:554`, `:562`, `:569`), the Reveal spec (`specs/reveal.md:154`, `:182`, `:209`, `:310`, `:357-360`, `:373`, `:386`, `:459`, `:462`, `:496`, `:565`), building-blocks 1.8, Table B Reveal, Table C Triggers, Part 4 item 4 and "None.", the glossary's Trigger role, the README row, and both tickets' amendments; the Dropdown spec is rightly unchanged (its pane is non-modal). Both routed follow-ups went where the judge sent them: the first became the Reveal server-state decision (`d4f83eb`, blocked by the modal-opener panel), the second was closed by the Modal inert set (`issues/72-...md:145-155`).
- Only the Reveal and Off-canvas report `modal-dialog`; every other Openable matches the Triggers consumers table (`specs/triggers.md:423-428`; Dropdown `specs/dropdown.md:187`, Toggler `specs/toggler.md:136`, `:149`, Responsive Toggle `specs/responsive-toggle.md:126`, Tooltip `specs/tooltip.md:163`); no spec, building-blocks cell, or glossary entry says Off-canvas Modal mode renders `aria-expanded`.
- The Reveal server-state decision's changes are all in the Reveal spec (`:17`, `:23`, `:67`, `:72`, `:203`, `:216`, `:224`, `:254`, `:308`, `:357`, `:387-388`, `:426`, `:428`, `:429`, `:431`, `:462`, `:478`, `:496`, `:516-520`, D17, D22), in building-blocks (`:154`, `:256`) and the rendering-modes research (`:221`) verbatim, and in the Reveal ticket's amendments; the Triggers spec is rightly unchanged, since the Openable contract did not change; "54 of 54" matches `run2.log` ("54 passed (1.5m)", 18 tests in three engines).
- The Slider decision's twelve spec changes, building-blocks 1.2 (`:36`), Tables A (`:230`) and B (`:257`), the ADR 0022 bullet, and the Slider and Slider prototype tickets are applied; the base-href decision's 21 Smooth Scroll and 4 Magellan changes, building-blocks `:22`, `:231`, `:258`, the ADR 0017 bullet, the README row and counts, and both tickets are applied (checked with `rg -F` on each), apart from the map edits (M1). ADR 0038 agrees with the Smooth Scroll spec (step 3, D9, the development check, Rendering modes), the Magellan spec (Activation row, development check), ADR 0017, ADR 0029, building-blocks 1.1 and Tables A and B, and the map gist (`:228`); `href^="#"` survives only as a description of Foundation's selector or in superseded ticket logs. The assistive-technology edits to the Slider and Magellan specs contradict neither decision.
- The fallback decision's changes A to N are applied (the Orbit, Tabs, Accordion Menu, Nested menu, Dropdown Menu, Drilldown Menu, and Triggers specs; building-blocks H1 to H5; ADRs I1 to I5; README K1 to K4; research M1 to M3; nine dated ticket amendments), apart from change L (M1); the Accordion and Responsive Accordion Tabs specs are rightly unchanged. ADR 0037 agrees with ADR 0025, ADR 0034 (`status: superseded by ADR-0037`, dated pointer), the Orbit spec, building-blocks 1.2 (`:39`), 1.5 (`:72`), 1.9 (`:108`, `:110`), 1.11 (`:151`, `:156`), Tables A and B Orbit (`:225`, `:252`), the README (`:41`, `:74`, `:114`, `:137`), and the map gist (`:227`); no `nfs-orbit-slide-` id, bullet `aria-controls` override, or per-bullet `ngTab` warning is stated as current anywhere.
- The capture holds what ADR 0037 and the ticket say: probe G `g0` and `g1` put `inert` on slides b to d, `g2` to `g6` on none, `g7` and `g8` on a, and the judge's re-run is identical apart from the random app id; hydration 15 of 15 and keyboard 12 of 12 in three engines; `beforeInert` false everywhere; the transient runs set and remove in consecutive writes in three engines with focus unchanged.
- The assistive-technology decision: every verdict matches its evidence and survives the review; a script found all 58 anchors of its change list present at `e0ed7f6` (and 57 of 58 absent at `e42d9d0`, the positive control); thirteen specs carry exactly one release test each, verbatim, before Out of Scope, naming 26 story ids that all exist; every errata note the judge listed is in the evidence files; building-blocks 1.8, Part 4 item 4, Tables A and B OffCanvas, the glossary's Modal mode and Modal inert set, and the dated bullets of ADRs 0022, 0030, and 0036 are present; fifteen spec tickets carry matching dated amendments.
- The README's open list holds no undecided item; its counts of specs (26), ADRs (38; 37 accepted and 0034 superseded, as the frontmatter says), and audits (five) are true; its ADR titles equal their H1s apart from the 0034 annotation and L1's 0036 clause; every ticket it links is resolved (78 of 78 `Status: resolved`). The map's Decisions so far has exactly 78 lines, one per ticket, and Part 4 of building-blocks lists no open item.
- Upstream filings: nothing was filed, and nothing is drafted as filed anywhere in the snapshot; the only upstream URLs cite existing threads (w3c/aria#1024, angular/angular#30139).
- The spec gate on every edited part: section order kept; the six axe tags named; new tests in the ADR 0018 layer wording (for example `orbit.ssr.spec.ts` and `smooth-scroll.ssr.spec.ts` through `renderServer()`, the JavaScript-disabled case with `@axe-core/playwright` and the six tags, `specs/reveal.md:518`, `specs/triggers.md:377`); render-hook and `injectAsync` statements still true; no platform feature outside the Browser target relied on; no Sass changed.

Hygiene: no non-ASCII character, no banned word, no banned pair, and no email-shaped token other than the approved address in the 91 in-scope files or anywhere in the 632-file snapshot; all fourteen commits authored and committed by the approved identity; no heading anchor fails; no link text differs from its ticket's title.

Spot checks against the local clones and fetched sources (all hold unless a finding says otherwise):

1. Aria `TabPanel` binds `'[attr.inert]': '!visible() ? true : null'` -- `components/src/aria/tabs/tab-panel.ts:49` (clone at `v22.2.0-15-g708d4c6e2`) -- holds (ADR 0037).
2. `bindingUpdated` compares with `Object.is` -- `angular/packages/core/src/render3/bindings.ts:54` -- holds (ADR 0037).
3. `setElementAttribute` removes the attribute for `value == null` -- `render3/instructions/shared.ts:530-535` -- holds.
4. "Host directives execute before the host so that its host bindings can be overwritten." -- `render3/features/host_directives_feature.ts:164` -- holds.
5. The attribute instruction writes only when its binding changed -- `render3/instructions/attribute.ts:34` -- holds.
6. `TabPanel`'s id defaults to an `ng-tabpanel-` id and `visible` is a computed; `visible` is public in the published 22.2.0 typings -- `tab-panel.ts:73`, `:84`; `@angular/aria/types/tabs.d.ts:157` -- holds.
7. `Tab` binds `aria-controls`, finds its panel in the panel map, and warns when none matches -- `src/aria/tabs/tab.ts:48`, `:65-67`, `:101-111` -- holds (ADR 0037's consequences).
8. `DeferredContent` defaults `preserveContent` to false and creates its view only in a render callback -- `src/aria/private/deferred-content/deferred-content.ts:27`, `:56-69` -- holds (fallback items 2 to 5).
9. `MenuTrigger` renders `aria-haspopup`, takes a `Menu` only, and links back from an `effect` -- `src/aria/menu/menu-trigger.ts:48`, `:68`, `:74`, `:91` -- holds (fallback item 9).
10. WAI-ARIA treats `aria-haspopup="true"` as `menu` -- `w3c/aria/index.html:13968-13969` -- holds.
11. Aria 22.2 has no disclosure or dialog entry point -- `components/src/aria/config.bzl:2-20` -- holds.
12. HTML-AAM: a `command` in the Close and Show Modal states provides no additional mappings -- `w3c/aria/html-aam/index.html:9428` -- holds (the modal-opener panel).
13. HTML-AAM: popover commands map `aria-expanded`, and none when the target is not a popover -- `html-aam/index.html:9347-9358` -- holds.
14. Foundation's Reveal stamps `aria-controls` and `aria-haspopup: 'dialog'` on its openers and never `aria-expanded` -- `foundation-sites/js/foundation.reveal.js:55-56` -- holds.
15. Foundation's Off-canvas stamps `aria-expanded="false"` and `aria-controls` on its triggers -- `js/foundation.offcanvas.js:99-103` -- holds.
16. The APG Dialog (Modal) and Alert Dialog examples carry no opener ARIA -- `rg` over `aria-practices/content/patterns/dialog-modal` and `alertdialog` exits 1, positive control 10 hits -- holds.
17. The HTML standard: `showModal()` on an open non-modal dialog throws `InvalidStateError`; `show()` on an open non-modal dialog returns; removing `open` fires no `close` event -- `interactive-elements.html` 4.11.4, fetched -- holds (the Reveal server-state decision).
18. The HTML standard: a document blocked by a modal dialog makes every node outside the dialog's subtree inert, and inert nodes are not exposed -- `interaction.html` 6.3, 6.3.1, fetched -- holds.
19. Event replay starts after `appRef.whenStable()` -- `angular/packages/core/src/hydration/event_replay.ts:160-175` -- holds (L2).
20. The navigate algorithm takes the fragment path only when the URL equals the document URL with fragments excluded and its fragment is non-null -- `browsing-the-web.html`, fetched -- holds (ADR 0038).
21. `Location.onUrlChange` returns an unregister function and fires on `go()`, `replaceState()`, and popstate -- `angular/packages/common/src/location/location.ts:172-190`, `:232-248` -- holds (ADR 0038's current-path `href`).
22. Foundation's SmoothScroll and Magellan select `a[href^="#"]` and read the raw attribute -- `js/foundation.smoothScroll.js:41-66`, `js/foundation.magellan.js:100-104` -- holds.
23. Angular's dispatcher calls `preventDefault()` on anchor clicks -- `angular/packages/core/primitives/event-dispatch/src/dispatcher.ts:78-91`, `:127-140` -- holds (ADR 0038's consequence 3).
24. Chromium's slider orientation reads only writing mode and appearance; WebKit reads ARIA first -- `ax_slider.cc:46-78`; `AccessibilitySlider.cpp:60-83`, fetched -- holds (the Slider decision).
25. The APG slider: a vertical slider carries `aria-orientation="vertical"` -- `aria-practices/content/patterns/slider/slider-pattern.html:82-83` -- holds.
26. Foundation's `foundation-range-input` sets `appearance: none`, and Foundation's docs say "No support for vertical orientation" for the native range -- `scss/forms/_range.scss:51`; `docs/pages/slider.md:182` -- holds.
27. CDK Dialog's background hiding skips `SCRIPT`, `STYLE`, `aria-live`, and `popover` siblings -- `components/src/cdk/dialog/dialog.ts:393-413` -- holds (the Modal inert set's exceptions; L12).
28. `AriaDescriber` puts its container on `body`; CDK focus-trap anchors are `aria-hidden` siblings; the overlay container and the `LiveAnnouncer` element are `body` children -- `cdk/a11y/aria-describer/aria-describer.ts:164-199`; `focus-trap.ts:131-132`, `:345-346`; `cdk/overlay/overlay-container.ts:55`, `:90`; `live-announcer.ts:177-193` -- holds.
29. HTML-AAM: the first applicable description source wins, `aria-describedby` first -- `html-aam/index.html:16893-16897` -- holds (the Tooltip description).
30. WAI-ARIA: a tooltip is referenced through `aria-describedby` "before or at the time the tooltip is displayed" -- `w3c/aria/index.html:11288` -- holds.
31. accname: Hidden Not Referenced and Name From Content (covering `label` descendants) -- `w3c/aria/accname/index.html:453`, `:644-646` -- holds (the Abide Form error move).
32. NVDA speaks `aria-current` changes only for the focus object, and reads `true` as "current", `page` as "current page" -- `nvaccess/nvda` `release-2026.2` `source/NVDAObjects/IAccessible/ia2Web.py:233-241`; `source/controlTypes/isCurrent.py:42-44`, fetched -- holds (L8).
33. NVDA drops "collapsed" and "expanded" only for a menu item with a popup; Firefox's UI Automation reports Collapsed for `aria-haspopup` without `aria-expanded` -- `source/controlTypes/processAndLabelStates.py:88-91` at `f56b2e0`; `accessible/windows/uia/uiaRawElmProvider.cpp:54-60` at `c32abda`, fetched -- holds (why a reachable Off-canvas Trigger keeps `aria-expanded`, M3).
34. WebKit ignores inert objects -- `AccessibilityObject.cpp:4405-4410` at `c39e3bbd`, fetched -- holds.
35. Foundation's DropdownMenu hover `_show` hides open siblings, and its Magellan marks only the link with `activeClass` -- `js/foundation.dropdownMenu.js:145-153`, `:302-309`; `js/foundation.magellan.js:184-188` -- holds.
36. Foundation sets `role="alert"` on each Form error and does not nest `.form-error` in its label rules -- `js/foundation.abide.js:322-327`; `scss/forms/_error.scss:66-92` -- holds.
37. Foundation's `.off-canvas.is-closed { visibility: hidden }` -- `scss/components/_off-canvas.scss:167-168` -- holds.
38. The APG tabbed carousel: slides carry no `aria-roledescription` (the Orbit spec's recorded D22 departure) -- `aria-practices/content/patterns/carousel/carousel-pattern.html:157` -- holds.

## Resolution log

Every finding was fixed; none became a ticket and none was rejected. Three agents applied the fixes in parallel, each to its own files (shared documents; map, tickets, and captures; specs and their tickets), and the orchestrator applied what fell outside all three scopes. Commits: `3feb9ba` (shared documents), `0aa2c97` (map, tickets, and captures), `eb585f3` (sixteen specs and their tickets), `05600ba` (the rest).

| Finding | Fixed in | Where |
| --- | --- | --- |
| H1 | `3feb9ba`, `eb585f3` | Building-blocks 1.1 case 3 and Tables A and B Tooltip; the Anchored pane spec's prose, rendered output, and sketch |
| H2 | `3feb9ba`, `eb585f3` | Building-blocks Tables A and B ResponsiveMenu and the glossary's Mode swap; the Responsive Menu spec's ARIA rows, server and hydrated HTML, story, and SSR smoke, and the Accordion Menu, Dropdown Menu, and Drilldown Menu tests |
| M1 | `0aa2c97` | The map's gists, with the three judges' map edits on the Slider, Smooth Scroll, and Orbit re-run lines |
| M2 | `3feb9ba`, `0aa2c97`, `eb585f3` | Building-blocks, ADR 0018, and the Storybook conventions; nine prototype and decision tickets; the specs, with amendments in the Accordion, Tabs, Reveal, Responsive Accordion Tabs, Abide, and Orbit spec tickets; ADR 0018 carries a dated qualifier on the original clause (audit 0007 L10) |
| M3 | `3feb9ba`; the Off-canvas spec in audit 0007's fixes | ADRs 0030 and 0036, beside the passages they reverse; the README's ADR 0030 row; building-blocks 1.8 and Part 4 item 4; the Off-canvas spec's qualifier, applied late (audit 0007 M1) |
| M4 | `eb585f3` | The Reveal spec's restore lists and development check 7; the Triggers spec's focus-return rule names Reveal and OffCanvas |
| M5 | `eb585f3` | The Off-canvas spec removes the Modal inert set on destroy |
| M6 | `3feb9ba`, `eb585f3`, `05600ba` | ADR 0001's dated bullet, then its reason; building-blocks 1.1 case 3; the Tooltip spec's D1 |
| M7 | `0aa2c97` | Four new capture folders under `prototypes/`, each linked from its decision ticket and its dossier (the dossiers in audit 0007's fixes); the assistive-technology judge's J1 to J3 captures stay under `D:/tmp/`, as that ticket's Answer states |
| M8 | `eb585f3`, `05600ba` | The Slider release test and the Slider spec ticket's amendment; the note under the Slider decision's Triage |
| M9 | `0aa2c97` | The three answers name their models |
| L1 | `3feb9ba`, `eb585f3` | Building-blocks 1.8, Part 4, and Table B OffCanvas; the Triggers spec's cells; the README's ADR 0036 row annotated rather than cut to the H1 (audit 0007 L2) |
| L2 | `eb585f3` | The Reveal and Triggers specs |
| L3 | `eb585f3` | The Smooth Scroll spec |
| L4 | `eb585f3` | The Slider WCAG table's 1.3.1 row |
| L5 | `eb585f3` | The Orbit spec's binding-precedence paragraph |
| L6 | `0aa2c97` | The Orbit capture's README |
| L7 | `0aa2c97`, `eb585f3` | The fallback, upstream-filings, and assistive-technology decisions; the Orbit ticket's audit 0006 amendment covers its `:201` item instead of the stale-reference list |
| L8 | `eb585f3`, `05600ba` | The Magellan spec and its ticket; a dated correction under check 13 of the assistive-technology decision and in its second evidence file |
| L9 | `eb585f3` | The Abide spec |
| L10 | `eb585f3` | The Accordion Menu and Dropdown Menu rendered HTML |
| L11 | `eb585f3` | The WCAG rows, SSR smokes, and design decisions of the specs the pass changed |
| L12 | `3feb9ba` | The glossary's Modal inert set and Tip entries; the Off-canvas spec's three live-region phrases, applied late (audit 0007 L1) |
| L13 | `3feb9ba` | The README's counts and index |
| L14 | `0aa2c97` | Path notes on the pass's quoted proposals |
| L15 | `3feb9ba` | "A link host" in building-blocks; the three story-id errata, appended to each section's dated correction |

The seven unrecorded departures are closed by H2, H1, M6, M5, L10, L2, and L1 in that order. The assistive-technology decision's own ticket keeps its verbatim release step and change list as applied; its dated correction states the phrase that replaced them.
