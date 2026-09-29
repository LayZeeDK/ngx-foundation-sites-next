# 152. Re-run: disclosure and carousel family specs, In-family check lines

Type: grilling
Status: resolved
Blocked by: none
Labels: wayfinder:grilling
Map: ../map.md

## Question

[Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md) found that the specs written before ADR 0046 lack the In-family check lines, parent token descriptions, and `strictParents` effects that [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md) requires of a multi-directive family. What does each spec of the disclosure and carousel family (`specs/triggers.md`, `specs/off-canvas.md`, `specs/responsive-toggle.md`, `specs/tabs.md`, `specs/orbit.md`) state?

## How to work it

Revise each spec in place and append a dated `### Amendment, 2026-09-29 (in-family check lines)` to the ticket the map's Decisions so far cites last for that spec. The items, evidence, and what to decide are in the audit ticket's Answer, section "Re-run tickets", item R2, and the five points above it that every re-run decides; `specs/forgotten-import-checks.md` (its family rule, the `strictParents` table, and the token-description form) and the Accordion spec's worked example are the model. Run `/grill-with-docs` (self-grilling, both sides) where a point needs deciding, and keep every other part of each spec unchanged. Propose shared-document changes as quoted text in the Answer.

## Answer

The five specs now list one In-family line per part under Hierarchy and DI shape, in the nested form the other re-runs use, and every parent token carries its development-only description. Only the Orbit's five class-only parts change behaviour: their dev check 8 becomes their parent check, which throws under `strictParents`. The dated amendments went to the tickets the map's Decisions so far cites last for each spec: [Re-run: Triggers (shared utility) spec under the class rule](130-rerun-triggers-class-rule.md), [Re-run: Off-canvas spec under the class rule](117-rerun-off-canvas-class-rule.md), [Re-run: Responsive Toggle spec under the class rule](116-rerun-responsive-toggle-class-rule.md), [Re-run: Tabs spec under the class rule](108-rerun-tabs-class-rule.md), and [Re-run: Orbit spec under the class rule](125-rerun-orbit-class-rule.md).

Sources read: the audit's R2 item and its five points ([Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md)), `specs/forgotten-import-checks.md` (the family rule, the `strictParents` table and kept-optional list, M7), [ADR 0046](../adr/0046-forgotten-imports-caught-by-checks.md), building-blocks 1.8 and 1.9, the architecture guide's P23 and P24, `specs/accordion.md:156`, and the finished lines of the parallel re-runs where they already existed (`specs/slider.md`, `specs/abide.md`, `specs/media-object.md`). For the NG0201 order: `adev/src/content/guide/directives/directive-composition-api.md:109` ("host directives always execute their constructor, lifecycle hooks, and bindings _before_ the component or directive on which they are applied"), and `src/aria/tabs/tab-list.ts:69`, `tab.ts:59`, and `tab-panel.ts:70` of the components clone at 22.2.x, which inject `TABS` and `TAB_LIST` without `optional`. No experiment was needed.

### Grilling record

1. Which ticket takes each amendment? The last Decisions entry whose ticket governs the spec: 130, 117, 116, 108, and 125. The Tabs spec was also edited later by [Decide: inputs named like HTML presentational attributes](139-decide-inputs-named-like-presentational-attributes.md), but that ticket put its amendment on the original spec ticket and its Decisions line does not govern the Tabs spec.
2. Can `NfsClose` and `NfsToggle` pass a parent check? For: the parent check would report a forgotten Openable import on the enclosing element and a Trigger declared in another template. Against: `found` is passed at construction, and construction cannot see whether the Trigger is bare or bound. A bound Trigger outside any Openable would get M5, and a bound Trigger projected into an Openable would get M4, both for correct markup. Reading the bare attribute through `HostAttributeToken` at construction would reopen [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md)'s kept-optional decision, would depend on an unmeasured name match for a camelCase attribute that is also an input, and would only add a `strictParents` throw for a development no-op that check 1 already reports. Decided: no parent check, and check 1 stays, as the audit said.
3. The Off-canvas panel's optional `nfsOffCanvasContentToken`: the same reasoning. A sibling panel binds `content`, an input construction cannot see. Decided: no parent check; check 3 stays the report.
4. Do the Openables (the Off-canvas panel, the Responsive Toggle bar) probe the bare Triggers inside them? For: a forgotten `NfsClose` would be reported even with `strictDirectiveImports` switched off. Against: the Triggers are another entry point's family, the Toggler's published line already says it probes no Trigger, a nested Openable's Triggers would be seen by every Openable around them, and `strictDirectiveImports` and the static check report them. Decided: no Openable probes a Trigger.
5. Which children does a part probe? Each part is probed by the part it depends on: its DI parent, or, for a part that injects nothing, the family part around it in Foundation's markup. The Accordion follows this rule (the accordion probes its items, and the items probe titles and contents). Tabs: the group probes the strip, the content box, and the panels (all three inject its token); the strip probes the titles and the tabs. Orbit: every part depends on the root, so the root probes all twelve. Off-canvas: the content probes nested panels (they inject its token), and the wrapper probes the panels and contents inside it. Rejected: probing every descendant from the root, which duplicates probes; probing from every DOM parent, which adds a render callback per title and per slide for no new case.
6. DOM-alone placement checks when the parent's import is forgotten (point 3): the Off-canvas check 3's wrapper half and the Tabs tab-title warning. Both now find the parent by its attribute as well as its class. An ancestor that carries the attribute without the class is a forgotten import, which the strip's probe (M2) or `strictDirectiveImports` (M1) reports once, naming the import and the component. Rejected: a message in the family check that names the import, which gives one cause two reports (the shared spec's D8 reason) and cannot name the owning component. This matches the Media Object's check 3 in the parallel re-run.
7. Checks that read registrations: Triggers check 1, Off-canvas check 3's content half, Orbit checks 1 and 3, and Responsive Toggle check 3. They keep their messages. Each is still true for a part written with a forgotten import, because no working part registered, and the probe or M1 names the import. The Responsive Toggle's check 3 cannot come from a forgotten import at all, because both sides are linked by a required reference that fails to compile (NG8002, NG8003). Rejected: DOM reads in each check to stay silent, which would change what these checks mean and add a second, different kind of test for no gain in accuracy.
8. `nfsOpenableToken`'s description (point 4): it lists the seven library Openable directives with their entry points and ends with "or a component that implements NfsOpenable". Rejected: "an Openable" alone (names no import, against M7); the library list alone (misleads an application whose own component provides it, ADR 0013). The library injects the token only optionally, so the description serves an application's required injection. A later Openable adds itself, as it already must in the Triggers hierarchy block.
9. Tabs and the NG0201 order. For the record: the shared spec says the descriptions serve the required injections. Against: `NfsTabs`, `NfsTab`, and `NfsTabsPanel` host Aria directives that require Aria's own token, and host directives are constructed first. A missing or forgotten group or strip therefore throws Aria's NG0201 for `TABS` or `TAB_LIST`, and the view fails before any probe or `strictDirectiveImports` runs. Can the library get in first? Not while it hosts Aria: an earlier optional lookup in `NfsTabsTitle` would help only under `strictParents` and only for a forgotten strip, and it would add a table row. Decided: record the limit in the Tabs and Orbit lines, name the static check as the report there, and propose a shared-spec note. The Accordion is not affected: `NfsAccordionItem` hosts nothing and is constructed before the title and the content, so its NG0201 carries `nfsAccordionToken`'s description.
10. The Orbit's `alone` sentences: only the caption gets one, taken from check 8's reason ("positioned against whatever ancestor is positioned"). The wrapper, controls, figure, and image take M5's default sentence, because Foundation's Sass styles the wrapper and controls not at all and the figure and image only in ways that do not reach outside the element.
11. An Orbit class-only part projected from another template into a working Orbit: it renders correctly, because it needs nothing from the root in production, but the parent check reports M4, and under `strictParents` it throws. Accepted: the shared spec's `strictParents` table already lists these parts (the audit's instruction), the M4 fix (the template outlet) works, and the flag is opt-in. Flagged below for the consistency review, because the Slider fill has the same shape.

### Decisions

1. Triggers (`specs/triggers.md`):
   1. `NfsOpen` calls `nfsDirectiveCheck('NfsOpen')`. It has no parent check (it injects no parent) and no child probes. Its targets are peers by reference, whose forgotten imports fail to compile (NG8002, NG8003). `strictParents` changes nothing.
   2. `NfsClose` and `NfsToggle` each call `nfsDirectiveCheck` with their class name. Neither has a parent check: the Nearest Openable injection stays optional with a supported `null`. Check 1 stays the report for a bare Trigger with no Nearest Openable, and it stays true when the Openable's import was forgotten (M1 reports that element). Their bound targets are peers by reference. `strictParents` changes nothing.
   3. An Openable probes no Trigger. No Trigger sits on `ng-template` or `ng-container`.
   4. `nfsOpenableToken` gets the multi-provider description of grilling item 8.
2. Off-canvas (`specs/off-canvas.md`):
   1. `NfsOffCanvas` (both selectors) has no parent check (its content injection is kept optional), no child probes, and peers `content` and the overlay by reference. `strictParents` changes nothing.
   2. `NfsOffCanvasContent` probes `NfsOffCanvas`.
   3. `NfsOffCanvasOverlay` has no parent check and no probes. Its panel is a peer by reference.
   4. `NfsOffCanvasWrapper` probes `NfsOffCanvas` and `NfsOffCanvasContent`.
   5. `nfsOffCanvasContentToken` gets its description.
   6. Check 3's wrapper half matches `nfsOffCanvasWrapper` or `.off-canvas-wrapper`, so a forgotten wrapper import is reported once, by M1. A browser-level case asserts it.
3. Responsive Toggle (`specs/responsive-toggle.md`):
   1. `NfsResponsiveToggle` and `NfsResponsiveToggleMenu` each call `nfsDirectiveCheck` with their class name, with no parent check and no child probes. They are peers through the bar's required `menu` reference, so a forgotten import on either side fails to compile. `strictParents` changes nothing.
   2. Check 3 stays. The plugin has no parent token.
4. Tabs (`specs/tabs.md`):
   1. `NfsTabsGroup` probes `NfsTabs`, `NfsTabsContent`, and `NfsTabsPanel`.
   2. `NfsTabs` probes `NfsTabsTitle` and `NfsTab`.
   3. The title, the tab, the content box, and the panel probe nothing.
   4. No part has a parent check, because every parent injection is required, and `strictParents` changes nothing.
   5. Tabs and panels are peers by `value`.
   6. `NfsTabsLazyContent` calls nothing.
   7. `nfsTabsGroupToken` and `nfsTabsToken` get their descriptions.
   8. The Aria-first NG0201 of grilling item 9 is recorded.
   9. The tab-title warning matches the attribute. A browser-level case asserts it.
5. Orbit (`specs/orbit.md`):
   1. `NfsOrbit` probes all twelve parts.
   2. The seven parts with behaviour have no parent check (their injection is required), and `strictParents` changes nothing for them.
   3. The five class-only parts pass `{parent: {directives: ['NfsOrbit'], found}}` from their development-only optional lookup, and the caption adds an `alone` sentence. This parent check replaces dev check 8, and under `strictParents` it throws M8.
   4. Slides and bullets are peers by `value`.
   5. `nfsOrbitToken` gets its description.
   6. A bullet whose `nfsOrbitBullets` element lost its import throws Aria's NG0201 for `TAB_LIST`; this is recorded.
   7. Dev checks 1 and 3 stay. D23 and the dev-check test case follow the parent check.

### Triage

| Item | Impact | Confidence | Verdict |
| --- | --- | --- | --- |
| The In-family lines, probes, and peers of the five specs | LOW: development-only checks; no API, markup, ARIA, or production output changes | HIGH: ADR 0046, building-blocks 1.9, the shared spec's rule, the Accordion's worked example | Decided |
| No parent check for the kept-optional Triggers and Off-canvas panel | LOW | HIGH: the shared spec's kept-optional list and its reason (inputs are not set at construction) | Decided |
| The Orbit class-only parts' parent check and `strictParents` throw | LOW: development builds under an opt-in flag | HIGH: the shared spec's `strictParents` table row, the Slider fill's identical shape | Decided |
| Attribute matching in the two DOM-alone checks | LOW | HIGH: the shared spec's one-report rule (D8); the same choice as the Media Object's check 3 | Decided |
| The five token descriptions, `nfsOpenableToken`'s list included | LOW: development-only strings | HIGH: M7; ADR 0013 for application-provided Openables | Decided |
| The Aria-first NG0201 in Tabs and Orbit | LOW: development error text | HIGH: the directive composition guide and Aria's sources | Decided and recorded |

Nothing is OPEN FOR HUMAN. No ADR, and no prototype is needed.

### Proposed shared-file changes (the orchestrator applies)

`specs/forgotten-import-checks.md`:

- S1, the family rule, item 2 (`:201`): replace "2. Its parent check: the parent directives (the provider and every directive that hosts it) when its parent injection is optional, with the family's `alone` sentence if it has one; "none" when the injection is required, because NG0201 is the report (P23), with the token's description (below)." with:

  > 2. Its parent check: the parent directives (the provider and every directive that hosts it) when its parent injection is optional only so that a part outside its parent degrades (the table under `strictParents`), with the family's `alone` sentence if it has one; "none" when the injection is required, because NG0201 is the report (P23), with the token's description (below); "none" when the injection stays optional because its `null` is a supported form (the kept-optional list under `strictParents`), because a parent check would report that correct form as standing alone, and the family's own development check, if it has one, stays the report for the case that needs the parent (the Triggers' check 1, the Off-canvas panel's check 3).

  The parallel re-runs meet the same case (`NfsAbideInput` and `NfsFormError` in `specs/abide.md`; the Drilldown root, `NfsMenuItem` to `NfsSubmenu`, and the Nested menu root to `nfsTopBarRightToken` in the navigation group), so the orchestrator should merge this with any wording they propose.

- S2, after the family rule's item 5 (`:204`), before the single-directive sentence, add:

  > A family's own development check that reports placement from the DOM alone (building-blocks 1.9) finds the parent by its attribute as well as its class, and does not report an ancestor that carries the attribute without the class: that is a forgotten import, which a probe or `strictDirectiveImports` reports once, naming the import and the component. A check that reads registrations keeps its message, which stays true for a part written with a forgotten import (no working part registered), while the probe or the runtime check names the import.

- S3, the M7 row (`:348`): after "(provided by <Directive> from '<entry point>' on an ancestor element declared in the same template)" append:

  > ; for a token several directives provide, each as "<Directive> from '<entry point>'", joined with commas and "or", and for a contract token an application may also provide, ending with "or a component that implements <Interface>" (`nfsOpenableToken`)

- S4, after the paragraph that ends "that is the one form no description can reach." (`:265`), add:

  > A part that hosts an Angular Aria directive which itself requires a parent token throws Aria's NG0201 first when that parent is missing, because Angular runs a host directive's constructor before its host's (the directive composition guide, "Directive execution order"): a Tabs strip, tab, or panel outside its group or strip, and an Orbit bullet inside an `nfsOrbitBullets` element whose import was forgotten, report Aria's `TABS` or `TAB_LIST`, which carry no library description, and the view throws before the In-family checks or `strictDirectiveImports` see a render. There the static check names the import; elsewhere the library's description is printed wherever its own injection is the first to fail (the Accordion's item hosts nothing and is constructed before its title and content, so the Accordion is not affected).

No edit to `building-blocks.md` or `architecture-guide.md`: building-blocks 1.9's forgotten-imports bullet and P24 already point to the shared spec's rule, which S1 to S4 extend.

### What other specs need from this one

- The Reveal, Dropdown, Tooltip, and Toggler specs: nothing now. `nfsOpenableToken`'s description names `NfsReveal`, `NfsDropdownPane` (`ngx-foundation-sites/dropdown-pane`), `NfsTooltip`, `NfsToggler`, and `NfsClassToggler`. An Openable that is added later, or an entry point that is renamed, updates that string in `specs/triggers.md`.
- The Top Bar spec (navigation group): nothing. Neither the Responsive Toggle nor the Off-canvas probes a Top Bar directive written beside or inside them.
- The Responsive Accordion Tabs spec: nothing. Its template imports every Tabs directive it renders, and the Tabs lines apply to them.
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md):
  - Check that the multi-provider token wording agrees across `nfsOpenableToken` and the navigation group's `nfsMenuModeToken`.
  - Check that the five re-runs agree on registration checks keeping their messages and on DOM checks matching the attribute (S2).
  - Class-only parts (the Orbit's five, the Slider fill) report M4 and throw under `strictParents` when projected from another template, though they need nothing from the parent in production. This is the shared spec's `strictParents` table decision, noted here in case the review wants a sentence about it.

### Gist for Decisions so far

- [Re-run: disclosure and carousel family specs, In-family check lines](issues/152-rerun-disclosure-and-carousel-family-in-family-lines.md) -- the Triggers, Off-canvas, Responsive Toggle, Tabs, and Orbit specs list one In-family line per part and give `nfsOpenableToken`, `nfsOffCanvasContentToken`, `nfsTabsGroupToken`, `nfsTabsToken`, and `nfsOrbitToken` development-only descriptions (`nfsOpenableToken`'s lists the seven library Openables and "a component that implements NfsOpenable"). `nfsClose`, `nfsToggle`, and the Off-canvas panel pass no parent, because their optional injection has a supported `null` that construction cannot tell apart, and Triggers' check 1 and Off-canvas check 3 stay their reports. Each part is probed by the part it depends on: the Off-canvas content and wrapper probe their panels and contents, the Tabs group probes the strip, the content box, and the panels, the strip probes the titles and tabs, and the Orbit root probes all twelve parts. The Orbit's five class-only parts turn dev check 8 into their parent check, which throws under `strictParents`. Openables probe no Trigger, and the Responsive Toggle's parts are linked only by a reference that fails to compile when forgotten. The Off-canvas wrapper check and the Tabs tab-title warning match the attribute, so a forgotten parent import reports once. Recorded: a Tabs strip, tab, or panel, and an Orbit bullet, host Aria directives constructed first, so a missing parent there throws Aria's NG0201 for `TABS` or `TAB_LIST`, and the static check names the import. Four proposals extend the shared spec's rule (the kept-optional case, DOM checks matching attributes, multi-provider token wording, the Aria-first NG0201). Impact LOW, confidence HIGH; nothing OPEN FOR HUMAN; no ADR.
