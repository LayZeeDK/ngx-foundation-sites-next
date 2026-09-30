# 147. Re-run: Switch spec, out-of-scope survivors

Type: grilling
Status: resolved
Blocked by: none
Labels: wayfinder:grilling
Map: ../map.md

## Question

[Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md) upheld out-of-scope survivors for the [Spec: Switch](84-spec-switch.md). What does the spec become with them, under the class rule (ADR 0039), the architecture guide, and ADR 0045 (a changed default after the first release waits for an Angular major, so defaults are settled now)?

## How to work it

Revise `specs/switch.md` in place and append a dated `### Amendment, 2026-09-28 (out-of-scope survivors)` to the [Spec: Switch](84-spec-switch.md) ticket. The items, evidence, and every point this re-run must decide are in that triage ticket's Answer, section "Survivors: proposed re-run tickets", item 2; read it in full, with `research/out-of-scope-triage-2.md` and the three lens files it cites. It includes the switch-14 reason correction and the building-blocks Table D proposal the triage names. Measure what the triage marks as unmeasured before deciding it. Run `/grill-with-docs` (self-grilling, both sides) and publish with `/to-spec`. Every item you keep or add in Out of Scope carries a reason and a category from `research/out-of-scope-exclusions.md`.

## Answer

Model: Opus 5.5

Spec: [specs/switch.md](../specs/switch.md), revised in place; the [Spec: Switch](84-spec-switch.md) ticket carries the dated amendment.

Sources read: the Answer of [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md) (item 2 of "Survivors: proposed re-run tickets", the switch-14 text, the Table D proposal); `research/out-of-scope-triage-2.md` (sections 1 to 4 and 7); the three lens files (the accessibility lens's section 1.2; the API lens's switch-14 note; the scope lens's H5); `research/out-of-scope-exclusions-2.md` (switch-1 to switch-18) and the category list of `research/out-of-scope-exclusions.md`; ADR 0039, ADR 0045, and ADR 0046; the architecture guide's P23; building-blocks Table D (Switch); the [Spec: Forms](98-spec-forms.md) (D2, D10, its radio groups); the [Spec: Visibility Classes](104-spec-visibility-classes.md) (`nfsShowForSr`); Foundation 6.9.0's Switch docs page (the Radio Switch example); the APG Switch pattern's grouping rule; Angular 22.2's `RadioControlValueAccessor` (a `formControlName` radio without `name` renders no `name` attribute).

### Measured

Playwright 1.63 with Chromium, Firefox, and WebKit; axe-core 4.13.0 with the six tags; Chromium's CDP accessibility tree; read-only Windows UI Automation over headed Chromium and Firefox (the window's process checked, `firefox` for the Firefox read); Foundation 6.9.0's compiled switch CSS with the spec's required settings; throwaway files under `D:/tmp/nfs-wave-147/`, not committed. No server, port, or junction was used.

The triage left one claim unmeasured for switch-7: how often the check would report radios grouped by other means. The fixture held 24 grouping patterns of two radio switches each (48 radios, each with a visible `<label for>`), and the proposed condition ran as page script beside the platform trees:

| Pattern | Check 5 | Chromium (CDP and UIA) | Firefox (UIA) |
| --- | --- | --- | --- |
| `fieldset`, `legend` as first child; as second child | silent | named group | named group |
| `fieldset` named by `aria-label`; by `aria-labelledby` to a heading; by `title` | silent | named group | named group |
| `div role="radiogroup"` with `aria-labelledby`; `div role="group"` with `aria-label` | silent | named radio group; named group | named radio group (a UIA List); named group |
| `fieldset role="radiogroup"` with a legend | silent | named radio group | named radio group |
| Unnamed `role="group"` inside a named `fieldset` | silent | unnamed group inside the named group | the same |
| Same `name` in two forms, the first grouped | silent for the first, reports the second | named group; none | named group; an unnamed form |
| No container (Foundation's docs); a heading, then a plain `div` | reports | none | none |
| Empty legend; `role="none"` fieldset; unnamed `radiogroup`; `aria-labelledby` at a missing id | reports | unnamed or none | unnamed or none |
| `details` with a `summary` | reports | unnamed group | unnamed group |
| Named `form`; named `section` | reports | named landmark, no group | named landmark, no group |
| One member outside the named `fieldset` | reports | one radio in the named group, one in none | the same |
| Two radios with no `name`, no container | reports each (two groups of one) | none | none |
| Legend nested in a `div` inside the `fieldset` | reports | unnamed group | named group |
| Legend with `aria-hidden="true"` | reports | unnamed group | named group |
| Legend holding only an `img` with `alt` | reports | named group | named group |

- The condition's verdicts were identical in Chromium, Firefox, and WebKit (pure DOM reads). It agrees with Chromium's tree on 23 of 24 patterns and with Firefox's on 21. The two Firefox-only names (a nested legend, an `aria-hidden` legend) are cases Chromium exposes unnamed and HTML-AAM does not name (the first `legend` child names a fieldset), so reporting them is intended. The one false positive in both engines is the image-only legend: the check reads text, not `alt`.
- Radios "grouped by other means" (a heading before them, a named `form` or `section`, `details` with a `summary`) expose no named group in either engine, only a landmark or an unnamed group, and the check reports all of them, as intended.
- axe on the whole fixture: no violation (incomplete: `form-field-multiple-labels` on 48 radios, as the spec already records; `aria-valid-attr-value` on the missing id). No axe-core 4.13.0 rule id contains "radio", "group", "fieldset", or "legend".

### Grilling log

Both sides, AFK.

1. Does the check come in now? Yes: the triage decided it (LOW, HIGH). The other side, "additive later" under ADR 0045, says when a check could land, not whether the directive owes it; ADR 0039 says it does, and axe reports nothing (measured).
2. Which directive owns it? `input[nfsSwitchInput]`: it sits on every radio switch and can read its `form`, `name`, and ancestors. `fieldset[nfsFieldset]` loses: a bare `fieldset` and an ARIA group carry no directive, and a missing fieldset has nothing to report it. The container `nfsSwitch` would have to read its child to learn it is a radio.
3. What is a group? HTML's radio button group: same tree, same form owner, same non-empty `name`; a radio without a `name` is a group of one. The other side, grouping by DOM proximity, would differ from what the arrow keys, the single checked radio, and submission do. Measured: the same `name` in two forms is two groups.
4. What names it? A `fieldset` without a `role` attribute, or an element whose `role` is `group` or `radiogroup`, with a name in accessible-name order: `aria-labelledby` text, a non-blank `aria-label`, for a `fieldset` its first `legend` child's text outside `aria-hidden` subtrees, then `title` (the order check 1 uses). The triage's first sketch (legend for a fieldset, ARIA names for the roles) loses: it would report fieldsets both engines name by `aria-label`, `aria-labelledby`, or `title` (measured).
5. Do named landmarks count? No. A named `form` or `section` is exposed as a landmark, not a group, in both engines (measured), and WCAG's techniques H71 and ARIA17 group with a `fieldset` or a group role. The fix, a `fieldset`, costs nothing visible, because Foundation leaves a bare `fieldset` unstyled.
6. Must the named group hold every member? Yes: with one radio outside, both engines expose that radio in no group (measured). Checking only the reporting radio's ancestry would miss it at the same cost.
7. How often does it report? Once per group, from the group's first `nfsSwitchInput` host in tree order; the others skip. The other sides, one warning per radio (three identical warnings for one fix) and a module-level record of reported groups (state that outlives a route and a test), lose.
8. When? In the existing development-only `afterNextRender` read callback, at each radio switch's first render, never on the server (P23). A group that gains members later is not re-read; its members' own first renders skip or report by the same rule.
9. The message? It names the group by `name` (by the radio's `id` when it has none) and the one fix every example writes, a `fieldset` whose first child is a `legend`, citing 1.3.1. The ARIA alternatives are documented in the ARIA table, not in the message.
10. The image-only legend? A stated limit, not a fix: checks 1, 2, and 5 share one text reading, a full accessible-name computation serves no documented markup, and the fix (text) also gives the sighted user the question.
11. Should the check also require a visible group name? No: the check is about the relationship (1.3.1); whether the question must be seen depends on the page around the group, which a directive cannot judge. It is added to Out of Scope with its reason.
12. The 1.3.1 row? Its requirement names check 5 and why (axe has no rule); its test column adds `switch--radio`'s group query and the check's browser-level tests.
13. The switch-14 reason? The triage's text, sharpened: `.show-for-sr` is bound by `nfsShowForSr`, and a visible label replaces the hidden paddle text, which alone gives sighted users no label and beside a visible label repeats it in the name (D4, measured).
14. ADR 0045? Nothing here changes a default: `size` stays unset, `type` and `role` stay the consumer's, and the required settings are unchanged. A development warning is additive in any release, so nothing waits for an Angular major.
15. ADR 0046 (in-family checks)? Out of this re-run's items; the [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md) applies it to every family.
16. An ADR or a glossary term? No: a reversible development check under ADR 0039; no new term.

### Decisions

1. `input[nfsSwitchInput]` gains development check 5 (radio group); the paddle's check becomes check 6.
2. The group is HTML's radio button group (same tree, same form owner, same non-empty `name`; a radio without a `name` is a group of one).
3. A named group is a `fieldset` without a `role` attribute, or an element whose `role` is `group` or `radiogroup`, named in accessible-name order (`aria-labelledby` text, non-blank `aria-label`, a `fieldset`'s first `legend` child's text outside `aria-hidden` subtrees, `title`); it must hold every member of the group. Named landmarks do not count.
4. Only the group's first radio switch in tree order reports, once, at its first render, in development only: "nfsSwitchInput: the radio switches with name="<name>" have no named group around them, so assistive technology announces no question for them; put them in a <fieldset> whose first child is a <legend> stating the question, as every example does (WCAG 1.3.1)", with `id="<id>"` for a radio without a `name`.
5. D16 turns round with seven rejected options, each with a category; the Out of Scope bullet for the group check goes.
6. The 1.3.1 row names check 5 and gains its tests; layer 2 gains a radio-group case list; a user story (12) is added and the list renumbered to 38.
7. The switch-14 bullet takes the corrected reason (`scope-boundary`).
8. A check that a group's name is visible stays out (`scope-boundary`); the image-only legend is a stated limit of the shared text reading (Notes).
9. No default changes (ADR 0045); no ADR; no glossary term.

### Triage

| Item | Impact | Confidence | Evidence | Outcome |
| --- | --- | --- | --- | --- |
| Radio-group check (1, 4, 5) | LOW: development only, no public API, additive in any release | HIGH: ADR 0039, P23, the triage's ruling, axe has no rule (measured) | | Decided |
| Group and name condition (2, 3) | LOW: a development warning's condition | HIGH: 24 patterns measured against Chromium's and Firefox's trees | Firefox names two patterns Chromium does not; the check follows Chromium and HTML-AAM | Decided |
| Named landmarks excluded (3) | LOW | HIGH: measured; H71 and ARIA17 | | Decided |
| Image-only legend limit (8) | LOW | HIGH: measured | | Decided: stated limit |
| Visible group name stays out (8) | LOW: additive later if a record ever owes it | HIGH: 1.3.1 is about the relationship; no record asks for the check | | Decided |
| switch-14 wording (7) | LOW | HIGH: D4's measurements | | Decided |

Nothing is OPEN FOR HUMAN, and no prototype is needed.

### Proposed shared-file changes

For the orchestrator; anchors are quoted because line numbers move.

1. `building-blocks.md`, Table D, the Switch row. The triage proposed inserting after "the paddle's `for`,"; amended to keep the input's checks together: in the development checks list, replace "`role="switch"` on a radio, the paddle's `for`," with:

   > `role="switch"` on a radio, radio switches that no named group holds, the paddle's `for`,

2. `architecture-guide.md`, P20's Sources line: D8 moved with this revision. Replace "`specs/switch.md:434`" with "`specs/switch.md:441`".
3. `map.md`, Decisions so far: the gist below.

### What other specs need from this one

- [Re-run: Top Bar spec, out-of-scope survivors](148-rerun-top-bar-out-of-scope-survivors.md), running in the same wave: the Switch's D12 now stands at `specs/switch.md:445` (it was `:438`); cite it by number, not line.
- [Spec: Forms](98-spec-forms.md): nothing. Its radios carry no directive, and its documented fieldset has a legend, so its D10 holds.
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): the Table D row; and whether other specs' name checks that read text content state the same image-`alt` limit.
- [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md): every Out of Scope bullet and every rejected D16 option carries a reason and a category.

### Gist for Decisions so far

- [Re-run: Switch spec, out-of-scope survivors](issues/147-rerun-switch-out-of-scope-survivors.md) -- `input[nfsSwitchInput]` gains a development check (check 5): a radio switch group (HTML's radio button group: same form owner and `name`) that no `fieldset` or `group`/`radiogroup` element named in accessible-name order holds warns once, from its first radio switch, naming the `fieldset` and `legend` fix; measured on 24 grouping patterns against Chromium's and Firefox's accessibility trees, it agrees with Chromium on 23 (the false positive is an image-only legend, a stated limit), and named landmarks do not count as groups; `.show-for-sr` gets its reason (D4); a visible-group-name check stays out; no default changes (ADR 0045); LOW, HIGH; no ADR. Spec: [specs/switch.md](specs/switch.md).

### Amendment, 2026-09-29 (in-family check lines)

From the [Re-run: form and value-control family specs, In-family check lines](153-rerun-form-and-value-control-family-in-family-lines.md), under [ADR 0046](../adr/0046-forgotten-imports-caught-by-checks.md) and the family rule of the [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md); `specs/switch.md` was revised in place, and the decision log is that ticket's Answer. Behaviour, API, ARIA, the rendering modes, and the Story ids are unchanged. Changed:

- Hierarchy and DI shape gains the In-family check lines, one per directive: `NfsSwitch` probes `NfsSwitchInput` and `NfsSwitchPaddle`, the paddle probes `NfsSwitchActive` and `NfsSwitchInactive`, and no part has a parent check (none injects another); the paddle's `for` link to its input is a peer by value.
- Development check 6 also takes a previous sibling that carries the `nfsSwitchInput` attribute as the input, so an input whose import was forgotten is reported once, by `NfsSwitch`'s probe, and not a second time as a paddle that does not follow its input (new D19; its layer-2 case added).

### Amendment, 2026-09-29 (consistency review)

From [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md), phase 2, group e, applying [its decisions](../research/consistency-review-decisions.md) and the review's checks CR-A to CR-D; `specs/switch.md` was revised in place, and [the group's report](../research/consistency-review-group-e.md) lists every edit.

- R15: Sass 1 (b)'s knob and on-track selectors also name Foundation's more specific `:focus-visible` forms (`input:focus-visible ~ .switch-paddle::after`, 0,2,2; `input:checked:focus-visible ~ .switch-paddle`, 0,3,1), with the reason (measured in Chromium and Firefox: a keyboard-focused off switch lost its knob and a focused on switch its `Highlight` track); D12 records it; the e2e forced-colours case checks the focused knob and track, waits for the paddle transition, and states the WebKit reason.
- R20: D9's rejected cell names the library colour the Slider's first ring used, now aligned on `$input-border-focus`.
- R74: development checks 1, 2, and 5 count an image's non-blank `alt`, or the non-blank `aria-label` of an element with `role="img"`, as text, the reading accessible-name computation applies (building-blocks 1.10, Names); the Notes bullet and the Measured groups sentence follow; D16's rationale now matches Chromium's tree on all 24 grouping patterns, and the text-only reading moves to its rejected alternatives; the browser-level cases gain a label that holds only an image with alt text (silent), such an image in the paddle (reported), and a legend that holds only one (silent). This reverses decision 8's stated limit.
- Unchanged (confirmed): R4 (the exact helper; floored figures), R21; CR-A, CR-C, and CR-D hold.

Triage: impact LOW (a Library mixin selector list inside a media query and development checks; no API), confidence HIGH (measured by this review; accname and HTML-AAM; the Thumbnail's check 2). Nothing is OPEN FOR HUMAN.

### Amendment, 2026-09-29 (exportAs on every directive)

- [Decide: an exportAs on every directive](156-decide-exportas-on-every-directive.md): `NfsSwitch`, `NfsSwitchInput`, `NfsSwitchPaddle`, `NfsSwitchActive`, and `NfsSwitchInactive` each gain an `exportAs` for the first time (`nfsSwitch`, `nfsSwitchInput`, `nfsSwitchPaddle`, `nfsSwitchActive`, `nfsSwitchInactive`); D8 no longer lists `exportAs` among what the family lacks.

### Amendment, 2026-09-29 (checks move to a later milestone)

From [Re-run: specs without checks, group e](169-rerun-specs-without-checks-group-e.md), under [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md); `specs/switch.md` was revised in place. The spec describes and accepts a Switch with no checks: each rule a check enforced is now documented usage in its API text (usage rules 1 to 7 under API per directive, and the JSDoc of `NfsSwitch.size`, `NfsSwitchInput`, and `NfsSwitchPaddle`) and in the Sass subsection.

What left the spec, per check, and where its rule now stands:

- Forgotten-import: the In-family lines (`nfsDirectiveCheck` for all five directives, `NfsSwitch`'s probe of the input and the paddle, the paddle's probe of the inner labels, the `strictParents` lines) and D19 (check 6 taking the `nfsSwitchInput` attribute as the input) -- no rule to state beyond importing the directives the template uses; D19 is removed, the last row, so no D-number moves. [Re-run: forgotten-import checks spec for the later milestone](164-rerun-forgotten-import-checks-later-milestone.md)
- Misuse: `NfsSwitch`'s copied-class warning (`tiny`, `small`, `large`) -- usage rule 7 and the `size` JSDoc: bind `size`; a copied size class is stripped. [Spec: misuse warnings (later milestone)](161-spec-misuse-warnings-later-milestone.md)
- Misuse: check 1 (no accessible name) -- usage rule 1 and the `NfsSwitchInput` JSDoc; D5 rewritten to the documented name. [Spec: misuse warnings (later milestone)](161-spec-misuse-warnings-later-milestone.md)
- Misuse: check 2 (paddle text joins the name) -- usage rule 2 and the `NfsSwitchPaddle` JSDoc. [Spec: misuse warnings (later milestone)](161-spec-misuse-warnings-later-milestone.md)
- Misuse: check 3 (static `type` missing or wrong) -- usage rule 3; D2. [Spec: misuse warnings (later milestone)](161-spec-misuse-warnings-later-milestone.md)
- Misuse: check 4 (`role="switch"` on a radio) -- usage rule 4; D3. [Spec: misuse warnings (later milestone)](161-spec-misuse-warnings-later-milestone.md)
- Family: check 5 (radio switches in no named group) -- usage rule 5; D16 rewritten to the documented group, its check-only rejected alternatives dropped. [Spec: family checks (later milestone)](160-spec-family-checks-later-milestone.md)
- Family: check 6 (the paddle directly follows its input and names it with `for`) -- usage rule 6; D15. [Spec: family checks (later milestone)](160-spec-family-checks-later-milestone.md)
- Build-time: `nfs-switch`'s item (d), one `@error` for the track, knob, focus-ring, and height settings and one `@warn` for inner-label text -- the Sass subsection's "Documented usage for any other theme" list and the WCAG 1.4.11, 2.4.7, 2.5.8, and 1.4.3 rows; D11 rewritten to the documented pairs; the mixin keeps rules (a) to (c), and its Reused item now names only `$input-border-focus` and `$switch-paddle-offset`. [Spec: build-time checks (later milestone)](163-spec-build-time-checks-later-milestone.md)
- Mentions rewritten: the intro's precedent note and its "radio-group check"; the Solution bullets for the input and the paddle and the mixin paragraph; user stories 5, 8, 9, 11, 12, 16, 18, 31, and 32 (numbering kept); the docs-conventions line; the mapping table's Notes; the hierarchy sketch; the Injection bullet (`ElementRef` and the development-only `HostAttributeToken` reads removed: no Switch directive injects anything); the API table's check column (now the usage-rule numbers); the implementation-level paragraph; the ARIA and keyboard intro, its grouping row, and the Measured groups paragraph (now what the engines expose); the WCAG 1.4.11, 2.4.7, 1.4.3, 2.5.8, 1.3.1, 3.3.2, 2.5.3, and 4.1.2 rows and their Test cells; the Rendering modes sentence on the checks' render callback; the Testing Decisions intro and its story note; the browser-level check cases and the SSR smoke's warning line; the compile-stop Sass cases (the emitted-CSS case stays); Out of Scope (the visible-name line reworded, the inner-label overlap line and the missing-include line removed, the `.show-for-sr` line); D9 and D10; the changed-behaviour list; Sass items 2 and 5 and the required-settings paragraph; the Notes on custom sizes, names, and groups.
- Another spec's check the spec quoted: the Forms spec's help-text check, removed from the help-text bullet (the Forms spec's own manifest entry is its source).

Kept: the size record's stripping of copied size classes, the static `aria-hidden` on the inner labels, the native roles, states, and keys, the typed `size` input and its compile errors, `nfs-switch`'s focus-ring, forced-colours, and reduced-motion rules, and the library's own stories (axe, computed contrast, paddle boxes), browser-level, SSR, Sass-output, e2e, and manual release tests.

Triage: impact LOW (the rules were already the spec's documented markup; no API changes; each check keeps its design in its later-milestone spec), confidence HIGH (the ruling's Decision items 2 to 4). Nothing is OPEN FOR HUMAN.

### Amendment, 2026-09-30 (later-milestone families)

From [Re-run: specs without the later-milestone families, group c](178-rerun-specs-without-later-families-group-c.md), under [Decide: grids, typography, and utilities move to a later milestone](174-decide-grids-typography-utilities-later-milestone.md); `specs/switch.md` was revised in place.

- Out of Scope: `.show-for-sr` is a normal class the consumer writes, with Foundation's global styles loaded, because the Visibility Classes have no first-milestone spec; the library's switch markup still needs none (D4). The link to the Visibility Classes spec is gone.
- Notes: side-by-side layouts come from Foundation's XY Grid classes written as normal classes (`class="grid-x"`, `class="cell"`), not from the XY Grid directives; the link to its spec is gone.

Triage: impact LOW (examples, stories, and documented usage change; no input, default, or rule of this spec changes), confidence HIGH (the ruling's decisions 2 and 3: a family with no first-milestone spec is written as Foundation's normal classes, with Foundation's global styles loaded). Nothing is OPEN FOR HUMAN.

### Amendment, 2026-09-30 (consistency review of the later-milestone waves)

- From [Consistency review: the later-milestone waves](180-consistency-review-later-milestone-waves.md), group c: Problem Statement, the class-rule bullet: "writes no Foundation class at all" becomes "writes no Foundation class of a family with a first-milestone spec", the wording audit 0010's L1 gave the other specs, because the Notes write Foundation's XY Grid classes as normal classes under ADR 0039's exception ([Decide: grids, typography, and utilities move to a later milestone](174-decide-grids-typography-utilities-later-milestone.md), decision 3). Impact LOW, confidence HIGH.
