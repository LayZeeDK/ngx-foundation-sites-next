# Audit 0005: final bundle

Date: 2026-09-26
Auditor: audit subagent (read-only except this file)

## Scope

Everything below was audited as committed at HEAD `90d8212` ("resolve the consistency review and add the bundle index"), read from a `git archive 90d8212 .scratch/next-foundation-specs` snapshot, never from the working tree. Nothing else was being edited, and every ticket on the map is resolved; this is the final audit before hand-off.

- The final wave: the [Spec: Responsive Menu](../issues/23-spec-responsive-menu.md) with `specs/responsive-menu.md` and ADR 0035; the [Re-run: Orbit spec, the slide's ARIA contract and the focus handoff](../issues/70-rerun-orbit-slide-contract-and-focus-handoff.md) with `specs/orbit.md`, the [Spec: Orbit](../issues/33-spec-orbit.md), ADR 0034, and ADR 0025; the [Prototype: ResponsiveMenu swap committed in the Nested menu root's render callback](../issues/71-prototype-responsive-menu-swap-commit.md) with its capture under `prototypes/responsive-menu-swap/`; and the [Consistency review and bundle index](../issues/36-consistency-review.md) with every change it made (`git log 1cc825a..90d8212`: `8b168a8`, `acd097d`, `00b6e41`, `90d8212`) and the new `README.md`.
- Audit 0004's Resolution log, row by row, against the snapshot and `git show --stat` of every cited commit.
- The goal the effort serves, checked as a hand-off gate over the complete bundle: a committed `/to-spec` spec for each of the 21 Foundation plugins, Button, and the four shared utilities; each spec checked for the map's versions, animation through `animate.enter`/`animate.leave` or State classes with native CSS, Baseline widely available platform features with named fallbacks, every rendering mode, the four testing seams in the stack decision's wording, the WCAG 2.2 AA criteria subsection, and Foundation's SCSS reused; `building-blocks.md` against the specs; the Playwright component test solution and the browser testing stack decision recorded; every prototype ticket and `## Prototype needed` item resolved; the README's open list against every OPEN FOR HUMAN item in the bundle and the triage rule; and a clean `git status --short .scratch/` at the snapshot's commit.

Not in scope: the research files and research tickets except for link texts and references, and the older audits except as records.

Governing rules: `/wayfinder`, `/research`, `/domain-modeling` (with `CONTEXT-FORMAT.md`, `ADR-FORMAT.md`), `/grill-with-docs` and `/grilling`, `/to-spec`, `/mattpocock-skills:prototype` (with `LOGIC.md`, `UI.md`), `docs/agents/issue-tracker.md`, `docs/agents/domain.md`, the repo skill `.claude/skills/foundation-api-design/SKILL.md`, and the standing rules, spec shape, AFK override, and orchestration rules (the triage quadrant and the prototype-reopens-spec rule) in `map.md` Notes. The user's standing rules checked in every spec: Foundation SCSS reused, never re-implemented; WCAG 2.2 AA as requirements with the six axe tags; unrounded contrast checks; the browser testing stack wording (ADR 0018); render hooks and `injectAsync` stated per spec.

## Method

The governing skills, `map.md`, `building-blocks.md`, `CONTEXT.md`, `README.md`, audit 0004, ADRs 0018, 0022, 0034, and 0035, the two `docs/agents` files, and the foundation-api-design skill were read in full by the auditor. The rest was split across five read-only sub-audits that shared one checklist (the hand-off gate items G1 to G10 per spec, the prototype checklist, and the severity scale below) and one report format, and read their files in full from the same snapshot:

1. The Responsive Menu spec, its ticket, ADR 0035, and the menu family it composes: the Nested menu, Accordion Menu, Drilldown Menu, and Dropdown Menu specs and tickets, gated G1 to G10.
2. The ResponsiveMenu swap prototype and its whole capture (ticket, README, e2e specs, the amended root, both run logs, the evidence files); the Orbit re-run, ADRs 0034 and 0025, the Orbit spec and ticket, and the Orbit keyboard prototype as input; the Orbit spec gated.
3. The consistency review ticket, every hunk of `acd097d`, `00b6e41`, and `90d8212`, the README row by row, and every OPEN FOR HUMAN hit across all 71 tickets against the README's open list and the triage rule.
4. Audit 0004's Resolution log, row by row, with every file and line each finding named; the Abide, Accordion, Anchored pane, Breakpoint service, Button, Dropdown, Equalizer, and Interchange specs gated.
5. The Magellan, Off-canvas, Responsive Accordion Tabs, Responsive Toggle, Reveal, Slider, Smooth Scroll, Sticky, Tabs, Toggler, Tooltip, and Triggers specs gated, with `storybook-conventions.md` and the Sass settings they share.

Every finding a sub-audit rated Medium was re-checked by the auditor against the snapshot, and the WCAG and APG ones also against the clones (`carousel-pattern.html:157`, the three menu mixins' checks, `specs/abide.md:138`, `specs/nested-menu.md:199`, `:521`); no sub-audit rated a finding High, and the auditor found none. The auditor also checked the ticket statuses (71 of 71 `Status: resolved`), the map's Decisions-so-far index (71 lines, one per ticket, no duplicate), the target-version sentence in all 26 specs, and `git status --short .scratch/` at `90d8212` (no output; the only untracked path in the repository, `.playwright-cli/`, is outside `.scratch/`).

A Node script ran over the 88 in-scope files (every file changed in `1cc825a..90d8212`, plus the Responsive Menu spec and ticket, the Orbit spec and both Orbit tickets, and ADRs 0025, 0034, and 0035, including the swap prototype's captured code and logs) and again over all 592 text files of the snapshot (images skipped). It checked for:

- non-ASCII characters;
- the banned-word list with inflections, including the one banned word pair;
- bare ticket references in narration and undefined citation keys;
- email-shaped tokens, by allowlist inversion (any hit is printed masked, as lengths only);
- every relative Markdown link and heading anchor, resolved against the file's own directory;
- link texts that differ from the linked ticket's title.

Positive controls: a control Markdown file carrying one non-ASCII character, one banned word, the banned pair, a bare ticket number, an undefined key, a missing target, two missing anchors, and two wrong link texts (all found, exit 1); a governing skill file (55 non-ASCII characters found); and the user's instruction file (15 banned-word hits and one non-approved email-shaped token found, not reproduced here). A second method, `rg -uu -P '[^\x00-\x7F]'` and a banned-word `rg` with word boundaries over the whole snapshot, exits 1 (no match) on both, while the same patterns exit 0 on the control file. The script exits 1 on the snapshot for these reasons only: the refer-by-name residue in L2; the effort-root-relative links inside quoted proposals, all under a "(paths relative to the effort root)" note (36 in scope, 42 overall); the historical bare numbers inside audits 0001 to 0004, which are records and are not rewritten; three false bare-number hits ("the prototype's 2.4.11 row", "the Accordion spec's 1.4.3 row", a numbered item of a prototype's decisions); and 72 in-scope uses of citation keys whose definitions use forms the script's pattern does not read (two keys defined together before one `=`, a key in parentheses right after the linked title, a quoted key followed by its title), each checked by hand and defined. No heading anchor link fails; no email-shaped token other than the approved address exists anywhere in the snapshot.

Commit times used below: audit 0004's log `1cc825a` (19:04), the swap prototype `8b168a8` (19:15), and the review's three commits (19:49).

Convention in this file: links inside proposed replacement text are written relative to this file so they resolve here; rewrite them relative to the target document when applying.

## Summary

| Severity | Count |
| --- | --- |
| High | 0 |
| Medium | 7 |
| Low | 10 |
| Total | 17 |

Severity definitions:

- High: a document the next repository would read as written would be misled (every spec is now read by the implementer), or it contradicts a user rule or an ADR.
- Medium: a skill or map rule is broken in a way that weakens the bundle, without by itself planting a wrong fact in a spec.
- Low: hygiene.

The main pattern: the final wave holds. The Responsive Menu spec consumes the Nested menu, the three menu roots, and the Breakpoint service member for member; ADR 0035's commit rule is what the swap prototype's amended root does, and the prototype's one failed case took the map's text-correction path and reached both specs, their tickets, ADR 0035, and the matrix. The Orbit re-run's decisions are in the spec, the matrix, and ADR 0034. The consistency review recorded every spec edit in a dated ticket amendment, closed audit 0004's handed items and unrecorded departures 6 to 8, and wrote a README whose counts, titles, links, and open list match the bundle. The hand-off gate passes on every item: 26 specs, all resolved tickets and prototypes, the testing stack recorded, a clean tree. What remains is narrower than in earlier audits: two menu mixins leave row height unguarded while the Responsive Menu spec says every mode checks it (M1); the open list's fourth category is a kind the triage rule does not name (M2); three spec points need a decision or a correction (M3 to M5); one ticket keeps the rounding contrast decision (M6); and the review's checklist never named the Browser target, which this audit's gate covers instead (M7). Audit 0004's log opens with "Every finding is fixed", but three of its 23 rows hold only in part (L1).

## Findings

### M1. The Accordion Menu and Dropdown Menu mixins guarantee no row height for WCAG 2.5.8, and the Responsive Menu spec says every mode's mixin does

- File: `specs/responsive-menu.md:314`; `specs/accordion-menu.md:576`; `specs/dropdown-menu.md:630`; `specs/nested-menu.md:371`, `:727`; `issues/20-spec-accordion-menu.md:113` (decision 38); against `building-blocks.md:129`, `specs/drilldown-menu.md:322`, `issues/22-spec-drilldown-menu.md:111` (decision 40).
- Rule: `building-blocks.md:129` (1.10: "Target size and non-text contrast (WCAG 2.2 AA 2.5.8, 1.4.11) are guaranteed by the Library mixin where Foundation's settings can fail them"); the user's standing rule (WCAG 2.2 AA as requirements); ADR 0022 (the story gate compiles only the library's own settings).
- Evidence:
  - Row height is a consumer setting in all three modes (`$accordionmenu-padding` and its submenu twin, `$drilldown-padding` and its twin, `$dropdownmenu-padding` and its twin); a small padding gives stacked rows under 24 px with touching targets, where the spacing exception does not apply. Foundation's defaults give 38 px, so no default fails.
  - The Drilldown mixin checks it (`specs/drilldown-menu.md:322`: "or when a row (`1rem` plus twice the vertical padding of `$drilldown-padding` or `$drilldown-submenu-padding`, through Foundation's `rem-calc()`) is below 24 px"), for the reason its decision 40 gives: the story gate sees only the library's settings.
  - The Accordion Menu ticket decides the opposite with the reason the Drilldown ticket rejects (`issues/20-spec-accordion-menu.md:113`: "No: rows are 38 px with Foundation's defaults, the Accessibility gate's `target-size` rule covers the library's stories"); its checks (`specs/accordion-menu.md:576`) cover the toggle only. The Dropdown Menu mixin checks the toggle only (`:630`) and its ticket records no decision on rows.
  - `specs/responsive-menu.md:314`, 2.5.8 row: "each mode's mixin stops the compile below 24 px", which holds for the drilldown mode only.
- Fix: add the Drilldown row check to `nfs-accordion-menu` (`1rem` plus twice the first value of `$accordionmenu-padding` or `$accordionmenu-submenu-padding`, through `rem-calc()`, below `rem-calc(24)`) and to `nfs-dropdown-menu` (the same over `$dropdownmenu-padding` and `$dropdownmenu-submenu-padding`); add both to the Nested menu's Checks paragraph (`:727`) and 2.5.8 row (`:371`), to each spec's 2.5.8 row and Sass compile test, and a dated amendment to the [Spec: Accordion Menu](../issues/20-spec-accordion-menu.md) superseding decision 38 and to the [Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md). If the family keeps rows unchecked instead, record that exception in building-blocks 1.10 with its reason and change `specs/responsive-menu.md:314` to "each mode's mixin stops the compile when a Hybrid toggle setting is below 24 px, and the drilldown mixin also when a row is".

### M2. The open list's fourth category, the `@angular/aria` confirmation, is a kind the triage rule does not name, is unrated, and contradicts the triage that decided its first item

- File: `README.md:74`, `:116`, `:153-167`; `issues/36-consistency-review.md:101-108`, `:114`, `:151-165`; `issues/70-rerun-orbit-slide-contract-and-focus-handoff.md:45`, `:60-63`, `:88`; `adr/0034-orbit-slide-contract.md:2`; `issues/33-spec-orbit.md:192`; `map.md:137`, `:217`.
- Rule: map Orchestration rules, triage (`map.md:137`: "Only HIGH impact with NOT-HIGH confidence stays `OPEN FOR HUMAN`; every other item is decided with the applied default, and the ticket records the rating and the evidence under a `### Triage` heading. Two kinds stay human-only regardless: outward-facing actions under the user's identity ... and checks that need assistive technology or a person's judgement the sources cannot replace"); `/domain-modeling` ADR-FORMAT (`status`).
- Evidence:
  - The README and the review ticket open the open list with the triage rule's three admitted kinds (`README.md:116`, `issues/36-consistency-review.md:114`), then add a fourth, "Confirmation: `@angular/aria` building blocks not used (1 item)", with nine sub-items (`README.md:153-165`). The review's `### Triage` table (`:101-108`) rates six items and not this one.
  - The Orbit re-run's Triage 1 rates the slide's fallback from Aria's `TabPanel` "Impact: HIGH ... Confidence: HIGH ... Outcome: DECIDED, written as a proposed ADR, which is how the fallback reaches human review without blocking the spec" (`:60-63`; the Orbit ticket's decision 51, `issues/33-spec-orbit.md:192`, says the same). The ADR was then accepted (`adr/0034-orbit-slide-contract.md:2`; `README.md:74`, "none is proposed"), so the route that triage relied on is gone, and the orchestrator added OPEN FOR HUMAN 3 to the re-run ticket for the same fallback (`:88`) from the repository's `AGENTS.md` ("Ask before falling back to alternatives"). The re-run's answer still calls the ADR "status `proposed`" (`:45`).
  - Sub-items 2 to 9 are open only in the review ticket and the README; their spec tickets record each choice as decided, while the README says "its ticket holds the options and the evidence" for every item.
  - In substance the list is defensible, since `AGENTS.md` reserves this judgement for the user; what is missing is the rule that admits it, so the open list does not yet hold "only kinds the triage rule allows".
- Fix: add to the triage bullet of `map.md:137`: "A fallback from an available `@angular/aria` building block, which the repository's `AGENTS.md` asks the user to confirm, is also human-only by kind: the spec applies its choice as the default, its ADR may be accepted, and the consistency review lists every such fallback once for the user." Extend `README.md:116` and `issues/36-consistency-review.md:114` with "and the fallbacks from `@angular/aria` building blocks that `AGENTS.md` asks the user to confirm", add a row for the list to the review's Triage table naming that kind, append to the re-run's Triage 1 "The outcome stands as the applied default; the fallback is also listed for the user's confirmation under `AGENTS.md` (OPEN FOR HUMAN item 3)", and change `:45` "status `proposed`" to "accepted on 2026-09-26".

### M3. The Orbit spec puts `aria-roledescription="slide"` on tab-panel slides, which the APG pattern text excludes, and nothing decides between the pattern and its example

- File: `specs/orbit.md:212` (development check 4), `:280`, `:358-360`; `issues/33-spec-orbit.md:76` (decision 17); `research/aria-apg-patterns.md:323`; `building-blocks.md:225` (Table A Orbit, APG cell "Carousel, tabbed style").
- Rule: map Standing preferences ("follows the matching WAI-ARIA APG pattern"); building-blocks 1.10 ("The APG pattern named in Part 2 is the contract"); `/research` step 1.
- Evidence: the APG Tabbed Carousel Elements say "Each slide container has role `tabpanel` in lieu of `group`, and it does not have the `aria-roledescription` property" (`aria-practices/content/patterns/carousel/carousel-pattern.html:157`); the APG's own tabbed example sets it (`examples/carousel-2-tablist.html:150`). The effort's research recorded the split (`research/aria-apg-patterns.md:323`). The spec follows the example without saying so: the ARIA table cites "APG tabbed example" (`:280`), every rendered slide carries the attribute (`:358-360`), and development check 4 warns when "a slide has no `aria-roledescription`" (`:212`), so a consumer who follows the pattern text gets a warning. Neither decision 17 nor the design decisions table weighs the two sources.
- Fix: add a design decision and a decision-log entry, for example "D22: slides carry `aria-roledescription="slide"`, following the APG tabbed example (`carousel-2-tablist.html`) over the pattern text (Tabbed Carousel Elements), so each slide is announced as a slide; the tab name carries the position", and add the question to the ticket's screen-reader check (README open list, assistive-technology item 12); or drop the attribute from the slide rows and the slide half of development check 4.

### M4. Abide registers a reference-linked Form error with its field at construction, against building-blocks 1.9 as the review amended it

- File: `specs/abide.md:128-129`, `:138`, `:228`; `building-blocks.md:66`, `:108`.
- Rule: building-blocks 1.9 (`:108`, added in `00b6e41`): "This `ngOnInit` rule is for children found through DI; a child linked by a reference input registers from an `effect` with cleanup instead (the reverse-link exception in 1.5), because the reference can change after `ngOnInit`"; building-blocks 1.5 (`:66`) lists the reverse-link cases.
- Evidence: the hierarchy gives `[nfsFormError]` "field = reference ?? enclosing label's field; registers with the field" and shows `[nfsFormError]="emailField"` anywhere in the template (`:128-129`); the reference is the `field` signal input (`:228`); the Registration bullet says "Registration happens at construction and is undone in `DestroyRef.onDestroy`" (`:138`). At construction a signal input holds its default, so a reference-linked Form error cannot know its field then, and the reference can change at runtime, the case the new 1.9 sentence sends to an `effect`. The review reported departure 6 closed (`issues/36-consistency-review.md:45`) without checking other reference-linked registrations.
- Fix: replace the last sentence of `specs/abide.md:138` with "A Form error or input found through DI registers at construction; a Form error linked by `[nfsFormError]="field"` registers from an `effect` whose cleanup unregisters, the reverse-link exception of building-blocks 1.5 and 1.9, because the reference arrives with the first update and can change. Both are undone on destroy." Add "the Abide Form error with its referenced field" to the list in building-blocks 1.5, and record both in a dated amendment of the [Spec: Abide](../issues/31-spec-abide.md).

### M5. The outcome of a two-way `[(expanded)]` starting `false` beside a static `is-active` is stated nowhere; the API row and the test bullet point at each other

- File: `specs/nested-menu.md:199`, `:521`; `issues/71-prototype-responsive-menu-swap-commit.md:123`, `:155`.
- Rule: `/to-spec` (the spec is the hand-off; a test states what it asserts); the swap prototype's Triage 4 (the two-way `false` case goes to the Nested menu spec's browser-level test).
- Evidence: the `expanded` row ends "a two-way `[(expanded)]` receives the seed's emission first, so its behaviour with an initial `false` is asserted in the browser-level test" (`:199`); the Seeding bullet says the case "is asserted (the seed's emission reaches the binding first), and the result is stated in the API table" (`:521`). Neither states the result. The prototype recorded the case as not measured and predicted that the seed's emission writes `true` into the consumer's state before the binding applies (`:123`). An implementer has no pass condition, and a consumer who binds `[(expanded)]` to `false` over Foundation's documented `is-active` marker has no contract.
- Fix: state the outcome in the `expanded` row, for example "a two-way `[(expanded)]` whose value starts `false` receives `true` from the seed during construction, so the submenu stays open and the consumer's state reads `true`: the static `is-active` wins over a two-way initial value, while a one-way `[expanded]="false"` wins over the class"; make `:521` assert it; record it in a dated amendment of the [Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md).

### M6. The Orbit ticket's decision log still decides the rounding `color-contrast()` check

- File: `issues/33-spec-orbit.md:108` (decision 37), `:170` (proposed building-blocks change 7), `:213`; against `specs/orbit.md:583`, `:600`.
- Rule: the user's standing rule (unrounded contrast checks); `building-blocks.md:120` (1.10); `/wayfinder` (a decision lives in its ticket).
- Evidence: decision 37 reads "Compile-time `@error` (rule 0a) with Foundation's `color-contrast()` against `$body-background` and between the two states", and change 7 "compile-time contrast checks with Foundation's `color-contrast()`". The spec moved to "computed from Foundation's `color-luminance()` with the WCAG formula and compared unrounded" in `aff6fd9`, whose `--stat` lists `specs/orbit.md` and no Orbit ticket. Audit 0004 H1 listed the Orbit spec only for the re-run to pick up, so its log row holds; but the ticket has no amendment superseding decision 37, and the review's amendment lists the unrounded checks under "Checked and left as they are" (`:213`), which does not supersede it either. The ticket, the record of the decision, states the rounding rule the user forbids.
- Fix: append to the [Spec: Orbit](../issues/33-spec-orbit.md) "### Amendment, 2026-09-26 (audit 0004, H1)": "Decision 37's checks, and rules 0a and 0b, compute each ratio from Foundation's `color-luminance()` with the WCAG formula and compare it unrounded; `color-contrast()` is not used, because it rounds to one decimal (building-blocks 1.10). This supersedes 'with Foundation's `color-contrast()`' in decision 37 and in proposed change 7."

### M7. The review's checklist and its record of what was checked omit the Browser target and the version pins, while its verdict hands the bundle on

- File: `issues/36-consistency-review.md:13`, `:21`, `:27-40`.
- Rule: map Standing preferences (`map.md:44-56`, Browser support: a platform feature counts only if Baseline widely available on 2026-05-07, anything newer needs a fallback or is not used; `map.md:32`, "Specs target these versions"; `map.md:40`, signals, `model()`, OnPush, zoneless); map Destination (`map.md:9`, the consistency review is the gate).
- Evidence: the Question's checklist (`:13`) and "What was checked" (`:27-40`) name naming, utility APIs, prototype verdicts, test layers, rendering modes, render hooks and `injectAsync`, animation, Sass, WCAG, glossary, and stale wording; nothing records that platform features were checked against the Browser target, that each spec states the version pins, or that the signals and zoneless preference was checked. The verdict (`:21`) says the bundle "is ready to hand to the new repository". This audit's gate ran those checks (G1, G3, G10 below): every spec passes G3, and three specs do not state the pins (L3).
- Fix: add to "What was checked" a dated bullet: "Checked by audit 0005's hand-off gate: every platform feature a spec relies on is Baseline widely available on 2026-05-07 (building-blocks 1.2), and every newer one appears only under Further Notes as a future adoption or with its named fallback; 23 of 26 specs state the version pins (the other three are audit 0005 L3); state is signals, `model()`, and `linkedSignal`, OnPush and zoneless-safe."

### L1. Audit 0004's Resolution log says "Every finding is fixed", but three rows hold only in part

- File: `audits/0004-second-spec-wave.md:424`, `:438` (M8), `:440` (L1), `:446` (L7); `issues/62-prototype-smooth-scroll-router-restoration.md:40`; `issues/15-spec-accordion.md:76`, `:162`; `prototypes/sticky-measurement/styles.scss:12`; `prototypes/orbit-keyboard-hydration/results/*.jsonl` and its `README.md:29`.
- Rule: `/research` step 1; the audit convention that a resolution log records what was fixed (audit 0004 L10 applied it to audit 0003's log).
- Evidence:
  - M8: the fix corrected row 3d, row 3a, the README verdict, and the Magellan spec, but the ticket's verdict paragraph (`:40`) still says that under `'disabled'` "the browser's own native per-entry scroll restoration gets it right (or very close)", against its own row 3d and the log (`logs/3-e2e-annotations.log:72`, `:90`: about 12130 to 12149 px for both entries in Firefox and WebKit).
  - L1: the Accordion ticket's decision 25 (`:76`) still gives its two prototype sources as bare numbers; the review's amendment (`:162`) explains them instead of rewriting them, acceptable for a decision log, but the row says "Fixed". The L10 and M3 fix added a comment to `prototypes/sticky-measurement/styles.scss:12` that names the Sass packaging ticket by its number. Audit 0003's own log lines (`audits/0003-prototypes-and-first-specs.md:516`, `:523`, `:527`) are unchanged, which is right under the convention of not rewriting a log, but the row does not say so.
  - L7: the Orbit keyboard capture's `results/*.jsonl` hold case 1 only (four lines per engine, all keyboard, ring, and scrollbar records; nothing from case 2, the hydration details with the failed `inert` gate), and `README.md:29` still says "one line per case and project" with no "not kept" note; the row lists only the Interchange logs and the Abide and Sticky notes.
- Fix: append a dated addendum to audit 0004's Resolution log naming the three partial rows. Replace `issues/62-...md:40`'s clause with "under `'disabled'` the browser's own restoration decides, engine-dependently: exact for `#m-s2` in Chromium, about 1600 px off in Firefox and WebKit (row 3d)". In `styles.scss:12` write "the Sass packaging decision". Add to the Orbit keyboard README "Case 2 results were not written to `results/`; the ticket's results table is the record."

### L2. Refer-by-name residue

- File: `issues/71-prototype-responsive-menu-swap-commit.md:11`, `:135`; `issues/36-consistency-review.md:70`, `:95`; `specs/magellan.md:96`, `:358`; `issues/39-playwright-component-testing-research.md:39`, `:40`; `research/playwright-component-testing.md:446`; `issues/40-playwright-component-testing-prototype.md:74`; `issues/58-storybook-conventions.md:91`; `research/angular-22-api-survey.md:13`.
- Rule: `/wayfinder` Refer by name; audit 0004 L1 and L2.
- Evidence: the swap prototype links the Nested menu spec ticket as "Spec: Nested menu shared utility" (title "Spec: Nested menu (shared utility)"); the review ticket names the Responsive Menu spec ticket by number (`:70`) and lists eleven tickets by number (`:95`); the Magellan spec cites "audit H6" and "audit M12" with no audit named (audits 0001 and 0002). Older lines no earlier audit listed: the Playwright research ticket and research file name the prototype and decision tickets by number; three link texts shorten their titles ("the tooling baseline", "browser testing stack decision", the rendering-modes title cut before "for DOM-touching directives").
- Fix: write each linked title exactly (for example the [Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md), the [Prototype: Playwright component tests mounting CSF stories from @storybook/angular-vite](../issues/40-playwright-component-testing-prototype.md), the [Decide the browser testing stack: Playwright component tests, Vitest Browser, or both](../issues/41-browser-testing-stack-decision.md)); at `:95` write "the eleven tickets whose quoted proposals carry the effort-root note"; in the Magellan spec write "audit 0001 H6" and "audit 0002 M12".

### L3. Three specs do not state the target versions

- File: `specs/abide.md:3`; `specs/responsive-toggle.md:3`; `specs/sticky.md:3`.
- Rule: map Notes, Target platform (`map.md:32`, "Specs target these versions"); the hand-off gate.
- Evidence: 23 specs carry "Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass" on line 3 (`rg -l 'Targets Angular 22\.2' specs/`, 23 files); these three do not, and `sticky.md` names no Angular version at all. Their content targets 22.2 APIs throughout, so nothing is wrong, only unstated.
- Fix: append that sentence to line 3 of each, and record it in a dated amendment of the [Spec: Abide](../issues/31-spec-abide.md), the [Spec: Responsive Toggle](../issues/24-spec-responsive-toggle.md), and the [Spec: Sticky](../issues/28-spec-sticky.md).

### L4. Consumption and shared-list slips in the menu family

- File: `specs/responsive-menu.md:186`, `:188`; `specs/drilldown-menu.md:152-158`, `:463`, `:632`; `specs/nested-menu.md:138`, `:193`, `:227`, `:363`, `:718`, `:722`, `:727`, `:729`; `specs/breakpoint-service.md:492-499`.
- Rule: checklist H (a consumer calls a utility with its name and meaning); `specs/nested-menu.md:490` ("the plugin specs refer to it"); building-blocks 1.10 (`:123`, `.is-hidden` beside `hidden` where a Foundation rule sets `display`); ADR 0035.
- Evidence:
  - `specs/responsive-menu.md:186` says every default comes from the root's Defaults token "else the Nested menu's `nfsMenuBehaviourDefaults`", but the Nested menu's drilldown slot holds `autoHeight` only (`specs/nested-menu.md:150`), and the Drilldown example (`:632`) seeds five inputs from keys that slot lacks; `NfsDrilldownDefaults` (`:152-158`) omits `scrollTopElement` while the browser-level test says the token "seeds every input" (`:463`). `:188` says `currentLevel` warns outside drilldown mode; the Drilldown spec makes it `null` there (`:177`).
  - The Nested menu's one Sass list lags the Dropdown Menu mixin (the `.<bp>-vertical`/`.<bp>-horizontal` arrow variants inside `breakpoint()`, `specs/dropdown-menu.md:628`, `:631`) and the Drilldown mixin (the `.align-left`/`.align-right` twins and the `$dropdownmenu-arrow-color` twin check, `specs/drilldown-menu.md:658`, `:665`) at rule 10 (`:722`), rule 6 (`:718`), Checks (`:727`), item (2) (`:729`), and the 1.4.11 row (`:363`).
  - The no-root fallback hides a closed `ul.menu` with `hidden` alone (`:138`, `:227`), which Foundation's `.menu { display: flex }` defeats (`scss/components/_menu.scss:64`); a development warning covers this misuse path.
  - `:193` says `mode` is "a `linkedSignal` whose source is the driven function"; ResponsiveMenu passes a `computed` to `drive()`, so read literally the source tracks every breakpoint change, the design ADR 0035 rejects; the prototype's source is a signal holding the function (`prototypes/responsive-menu-swap/src/app/nested-menu/nested-menu.ts:70-77`).
  - The Breakpoint service's consumer example publishes the requested mode as the public `mode` (`:492-499`), where the Responsive Menu spec's `mode` is the displayed mode (`:164`).
- Fix: `:186` "else that root's own default (Foundation's value, in `nfsMenuBehaviourDefaults` for the Nested menu's slots and in the root spec's API table for the rest)", with the Drilldown example and `NfsDrilldownDefaults` aligned; `:188` "`openPath()` warns outside drilldown mode; `currentLevel` reads `null` there"; add the missing variants, twins, and settings to the Nested menu's list; bind `[class.is-hidden]` with `hidden` in the no-root fallback; `:193` "a `linkedSignal` whose source is a signal holding the function passed to `drive()` and whose computation calls it inside `untracked`"; rename the example's member to a private `#requested` and point at the Responsive Menu spec. Record each in the owning ticket.

### L5. Stale cross-references the review's sweep missed

- File: `specs/smooth-scroll.md:267`, `:500`; `specs/magellan.md:131`, `:358`; `specs/accordion.md:430`, `:542`; `specs/anchored-pane.md:469`; `specs/triggers.md:463`; `specs/dropdown.md:629`; `building-blocks.md:45`, `:244`; `issues/46-prototype-orbit-scroll-snap.md:145`, `:149-155`.
- Rule: `/to-spec` (decisions stated as made); `/wayfinder` (a decision lives in one place and others point at it correctly); map Destination (the matrix agrees with the specs).
- Evidence:
  - Smooth Scroll says Magellan's transition flag uses "IntersectionObserver settling" (`:267`, `:500`); Magellan ends it on a 100 ms scroll-idle timer (`specs/magellan.md:201`, `:349`) and its ticket rejected observer settling.
  - Magellan still describes an `nfsMagellanToken` "sketched in building-blocks Table B" (`:131`), which Table B no longer names (`:250`), and cites "building-blocks Part 4 item 3" for the Decided item 3 (`:358`).
  - Accordion calls the missing `@supports` guard "a delta from building-blocks 1.6 rule 3" (`:430`, D11), while 1.6 rule 3 now reaches the same conclusion (`building-blocks.md:83`); the Anchored pane D2 attributes a rejected root service to "building-blocks Table C's sketch" (`:469`), which Table C no longer holds.
  - Triggers (`:463`) and Dropdown (`:629`) still call the Reveal markup and the Toggler input "sketches", wording the review removed from three other specs.
  - Building-blocks 1.3 (`:45`) says the docs title "Drilldown Menu" is not used, while Table A records the entry point `drilldown-menu` (`:218`); Table B AccordionMenu (`:244`) says the nested-menu prototype "also checks the `li`-level grid", present tense for a check it confirmed.
  - The [Prototype: Orbit on CSS scroll snap](../issues/46-prototype-orbit-scroll-snap.md) still rates the roving tab-stop drift "STAYS OPEN FOR HUMAN" for Tabs and Responsive Accordion Tabs (`:145`, `:149-155`), with no pointer to the review's Triage 4, which decided it and which the map gist follows (`map.md:175`).
- Fix: point each at the current text: "the Magellan spec's 100 ms scroll-idle timer"; "No Parent token; an earlier building-blocks sketch named one"; "Part 4, Decided item 3"; "(building-blocks 1.6 rule 3 records the same conclusion)"; "(building-blocks Table C's first sketch, since replaced)"; "defined by the [Spec: Reveal](../issues/18-spec-reveal.md) and the [Spec: Toggler](../issues/17-spec-toggler.md)"; append to 1.3 "; its entry point and Story ids use `drilldown-menu` (the Drilldown Menu spec, D2)"; Table B AccordionMenu "Confirmed by the [Prototype: Nested menu directive family with breakpoint mode switching](../issues/50-prototype-nested-menu.md), including the `li`-level grid"; and a dated amendment on the Orbit scroll-snap prototype pointing at the [Consistency review and bundle index](../issues/36-consistency-review.md), Triage 4.

### L6. Three index statements in the README and building-blocks do not hold

- File: `README.md:18`, `:60`; `building-blocks.md:269`; `adr/0025-orbit-live-inert.md:19`; `adr/0035-responsive-menu-swap-commit.md:12`.
- Rule: map Destination (the matrix agrees with the specs); hygiene (the index describes the bundle as it is).
- Evidence:
  - `README.md:18`: "An ADR is never rewritten; later findings are dated pointer bullets at its end". Audit 0004's fixes corrected ADRs 0008, 0017, 0022, 0024, and 0025 in place (`git show d17749f`, one `-`/`+` pair each, ADR 0022's decision sentence among them), as that audit asked; ADR 0025's pointer bullet (`:19`) carries no date; ADR 0035's dated bullet (`:12`) sits under a considered option, where the swap prototype asked for it, not at the end.
  - `building-blocks.md:269` gives `reducedMotion()` to "every animated spec", and `README.md:60` "for animated specs"; Reveal (`specs/reveal.md:413`), Toggler (`specs/toggler.md:322`), Tooltip (`specs/tooltip.md:388`), and Off-canvas (`specs/off-canvas.md:411`) do not read it, as 1.6 rule 5 (`:85`) and the Breakpoint service's consumer table (`specs/breakpoint-service.md:211-221`) say; Tabs and Responsive Accordion Tabs read it for their deep-link scrolls, which neither list names.
- Fix: `README.md:18` "Later findings are dated bullets beside the part they qualify, and a changed decision gets a new record; audit 0004's fixes corrected the wording of ADRs 0008, 0017, 0022, 0024, and 0025 in place (its Resolution log)"; date ADR 0025's bullet. `building-blocks.md:269` "plus `reducedMotion()` for JavaScript-driven motion (Orbit autoplay; SmoothScroll, and Magellan through the composed `NfsSmoothScroll`; the Tabs and Responsive Accordion Tabs deep-link scrolls) and for the directives that bind no Motion class under reduced motion (Responsive Toggle, the Dropdown pane; 1.6 rule 5)", and the same list in short form at `README.md:60`.

### L7. Figures and capture claims that disagree with the sources

- File: `specs/orbit.md:12`, `:307`, `:308`, `:463`, `:584`, `:594`; `issues/33-spec-orbit.md:108-110`, `:195`; `storybook-conventions.md:143`; `issues/71-prototype-responsive-menu-swap-commit.md:40`, `:42`, `:48`, `:60`, `:102` and its README `:15`, `:18`, `:31`; `adr/0034-orbit-slide-contract.md:20`; `specs/abide.md:80`, `:186`; `specs/breakpoint-service.md:7`.
- Rule: `/research` step 1; `/mattpocock-skills:prototype` rule 6; the user's unrounded-contrast rule; audit 0004 L7.
- Evidence:
  - Orbit (unrounded, Foundation's palette at `scss/settings/_settings.scss:80-84`): `$dark-gray` on `$white` is 3.42:1, not "about 3.5:1"; active against inactive bullets 2.11:1, not "about 2.2:1"; white text on Foundation's `rgba($black, 0.5)` band 3.71:1, not "about 3.9:1"; on `rgba($black, 0.6)` 5.21:1, not "about 5.7:1". The bullets are "1.6 px apart", but `0.1rem` margins on both sides (`scss/components/_orbit.scss:140`) leave at least 3.2 px. The spec says Page Down and End moved `scrollY` "700 to 1041 px in every engine" (`:463`); the captured results are Chromium 700/1041, Firefox 766/1040, WebKit 640/1039. Every pass or fail conclusion holds.
  - Swap prototype: "147 of 147 passing" sits beside "the one failure", which passes as a test because it records rather than asserts (`e2e/swap.spec.ts:242-243`); row 1 cites `evidence/ssr-current-nav.html` for an `ng-state` value the captured `nav` fragment does not hold; "each with a `/current` variant" does not hold for `/deferred-prerendered` (`src/app/app.routes.ts:16`); the no-animation-frame claim was measured on the three first-render routes only (`e2e/swap.spec.ts:392`); `:102` quotes as ADR 0035's a sentence that is the Responsive Menu spec's (`specs/responsive-menu.md:423`).
  - ADR 0034 says one `console.warn` per bullet; `reportViolations` writes two lines (`components/src/aria/private/utils/violations.ts:10-16`).
  - Abide maps `a11yErrorLevel` to a role (`:186`) without listing that Foundation set `aria-live` (`js/foundation.abide.js:349-351`) among the changed behaviour; the Breakpoint service opens "Nine of Foundation's 21 Plugins" and names eight viewport plugins plus three reduced-motion ones (`:7`).
- Fix: write 3.4:1, 2.1:1, 3.7:1, 5.2:1, "3.2 px apart", and "640 to 1041 px depending on the engine"; in the prototype write "147 of 147, the Hybrid-link case recorded by a non-asserting test", cite the full server HTML or drop the `ng-state` clause, "each except `/deferred-prerendered`", limit the frame claim to the three first-render routes, and attribute the quote to the Responsive Menu spec; "two `console.warn` lines per bullet"; add the `aria-live` delta to Abide's changed behaviour; "Eight of Foundation's 21 Plugins change behaviour with the viewport, and three more ... should stop moving things".

### L8. Test-layer and axe wording residue

- File: `specs/reveal.md:512`, `specs/nested-menu.md:553`, `specs/drilldown-menu.md:498`, `specs/magellan.md:427`, `specs/smooth-scroll.md:335`, `specs/off-canvas.md:492`, `specs/tabs.md:491`; `specs/tabs.md:475-477`; `issues/36-consistency-review.md:33`.
- Rule: ADR 0018 Consequences and ADR 0022 (every axe run names the six tags; `@axe-core/playwright` with the same tags on the fixture's JavaScript-disabled page); the fixed layer wording in the [Decide the browser testing stack: Playwright component tests, Vitest Browser, or both](../issues/41-browser-testing-stack-decision.md) (layer 3 "in `<name>.ssr.spec.ts` through the shared `renderServer()` helper").
- Evidence: the review rewrote "screenshot plus axe" on the JavaScript-disabled page to name `@axe-core/playwright` with the six tags in nine specs and reported "the six axe tags wherever axe runs" (`:33`); the seven lines listed keep the bare phrase, and five of those specs never name `@axe-core/playwright`. The Tabs node-level layer names `renderServer()` but no `tabs.ssr.spec.ts`, the only one of the 26 specs without the file name. Building-blocks 1.12 fixes both rules for every spec, so an implementer is not misled.
- Fix: "screenshot plus `@axe-core/playwright` with the six tags" in each listed line; `specs/tabs.md:477` "SSR smoke, under `npx nx test <lib>` in `tabs.ssr.spec.ts` through the shared `renderServer()` helper".

### L9. Two gaps in the review's own record

- File: `issues/36-consistency-review.md:17-114`; `storybook-conventions.md:104`, `:198`.
- Rule: map AFK override (`map.md:76`: the agent "records every question it asked itself and the answer it settled on"); audit 0004 L10 (the conventions block says what is example and what is required).
- Evidence: the review answer has a verdict, a method, what was checked, per-file changes, a triage table, and the open list, but no numbered question-and-answer log with sources like the other grilling tickets. `00b6e41` added the `nfs-smooth-scroll` include to the preview block as a commented line, in the style of its optional lines, while section 7 says "`preview.scss` includes `nfs-smooth-scroll`" (`:198`) and the Smooth Scroll and Sticky specs rely on it; a preview copied from the block compiles without it.
- Fix: add a short numbered decision log (Q, A, source) covering the four settled audit 0004 items, the `nfs-abide` mixin, the Tabs drift ruling, and the open-list composition; write the include uncommented, or add under the block "The commented `@include` lines are required lines, each owned by the spec it names."

### L10. Two Orbit wording points

- File: `specs/orbit.md:398`, `:413`, `:426`; `issues/33-spec-orbit.md:141`.
- Rule: `CONTEXT.md:231-233` (Lazy content is "distinct from a consumer's `@defer` block, which loads code"); `/wayfinder` (the ticket records the current decision).
- Evidence: "Lazy slide content: a consumer puts `@defer (on viewport)` inside a slide" and the story `orbit--lazy-content` describe code loading, not content rendered on first show, and the spec offers no Lazy content. The ticket still lists Aria's development warnings for projected panel content as inherited, though the slides no longer host `TabPanel` and the per-bullet warning replaced it (decision 50).
- Fix: "A `@defer` block inside a slide" with the story id `orbit--defer-in-slide`; in the ticket "the per-bullet `ngTab` warning (decision 50, accepted and documented)".

## Hand-off gate

Every one of the 21 plugins, Button, and the four shared utilities has a committed spec under `specs/` (26 files, each resolved with its ticket). Gate items per spec: G1 target versions; G2 animation through `animate.enter`/`animate.leave` or State classes with native CSS and reduced motion; G3 Baseline widely available features with named fallbacks; G4 `@defer`, SSR, prerendering, full and incremental hydration, event replay; G5 the four layers in the ADR 0018 wording; G6 the WCAG 2.2 AA criteria subsection, the six tags, unrounded contrast; G7 Foundation SCSS reused (the 1.13 Sass subsection); G8 render hooks and `injectAsync`; G9 agreement with `building-blocks.md`, the glossary, the ADRs, and the shared utilities; G10 to-spec shape and statement quality.

| Spec | G1 | G2 | G3 | G4 | G5 | G6 | G7 | G8 | G9 | G10 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Abide | L3 | OK | OK | OK | OK | OK | OK | OK | M4 | L7 |
| Accordion | OK | OK | OK | OK | OK | OK | OK | OK | L5 | OK |
| Accordion Menu | OK | OK | OK | OK | OK | M1 | OK | OK | OK | OK |
| Anchored pane | OK | OK | OK | OK | OK | OK | OK | OK | L5 | OK |
| Breakpoint service | OK | OK | OK | OK | OK | OK | OK | OK | L4 | L7 |
| Button | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK |
| Drilldown Menu | OK | OK | OK | OK | OK | L8 | OK | OK | L4 | OK |
| Dropdown | OK | OK | OK | OK | OK | OK | OK | OK | OK | L5 |
| Dropdown Menu | OK | OK | OK | OK | OK | M1 | OK | OK | OK | OK |
| Equalizer | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK |
| Interchange | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK |
| Magellan | OK | OK | OK | OK | OK | L8 | OK | OK | OK | L2, L5 |
| Nested menu | OK | OK | OK | OK | OK | M1, L8 | L4 | OK | L4 | M5 |
| Off-canvas | OK | OK | OK | OK | OK | OK | OK | OK | departure 5 | OK |
| Orbit | OK | OK | OK | OK | OK | M6, L7 | OK | OK | M3 | L10 |
| Responsive Accordion Tabs | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK |
| Responsive Menu | OK | OK | OK | OK | OK | M1 | OK | OK | L4 | OK |
| Responsive Toggle | L3 | OK | OK | OK | OK | OK | OK | OK | OK | OK |
| Reveal | OK | OK | OK | OK | OK | L8 | OK | OK | departure 5 | OK |
| Slider | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK |
| Smooth Scroll | OK | OK | OK | OK | OK | L8 | OK | OK | L5 | OK |
| Sticky | L3 | OK | OK | OK | OK | OK | OK | OK | OK | OK |
| Tabs | OK | OK | OK | OK | L8 | OK | OK | OK | OK | OK |
| Toggler | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK |
| Tooltip | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK |
| Triggers | OK | OK | OK | OK | OK | OK | OK | OK | OK | L5 |

The bundle-level gate items:

- `building-blocks.md` agrees with the specs except for the departures listed below and L5, L6.
- The Playwright component test solution is recorded (the [Prototype: Playwright component tests mounting CSF stories from @storybook/angular-vite](../issues/40-playwright-component-testing-prototype.md), `map.md:165`) and the browser testing stack is decided (ADR 0018, `status: accepted`; `map.md:180`; building-blocks 1.12).
- Every prototype and re-run ticket is resolved (25 of them; 71 of 71 tickets `Status: resolved`), and every `## Prototype needed` item was graduated into one of them or reads "None" with reasons.
- The README's open list matches every item still OPEN FOR HUMAN across the bundle (10 upstream filings, 13 assistive-technology checks, 3 trap-quadrant decisions, 1 confirmation list), and its counts equal `map.md:217`; it holds one category the triage rule does not name (M2).
- `git status --short .scratch/` at `90d8212` prints nothing.

## Unrecorded departures and Sass conflicts

Departures of a published spec (or the matrix) from `building-blocks.md` or a shared utility spec at HEAD that no ticket records:

1. `nfs-accordion-menu` and `nfs-dropdown-menu` guarantee no row height, against 1.10 (`:129`); the Accordion Menu ticket records the choice with a reason the Drilldown ticket rejects, and proposes no 1.10 exception (M1).
2. The Orbit slides carry `aria-roledescription`, against the APG text of the pattern Table A names (`:225`), with no decision (M3).
3. The Abide reference-linked Form error registers at construction, against 1.9 (`:108`) and the reverse-link exception of 1.5 (M4).
4. The Nested menu's no-root fallback binds `hidden` without `.is-hidden` on `ul.menu`, against 1.10 (`:123`) (L4).
5. Reveal keeps an internal `NfsRevealStack` `@Service()` for the open order, the Scroll lock count, and the modal Escape listener (`specs/reveal.md:132`, `:138`, D20), while 1.5 (`:71`) names only the Breakpoint service and the Light dismiss registry as warranted services; the Off-canvas spec counts its scroll lock per document (`specs/off-canvas.md:466`) without naming where the count lives. Fix: add to 1.5 "a plugin-internal service is allowed for the same reason (Reveal's `NfsRevealStack`: open order, Scroll lock count, the modal Escape listener)", and name the home of the Off-canvas lock count in its spec with a dated ticket amendment.
6. Part 3 item 1 of the matrix and the README list `reducedMotion()` for every animated spec, against four specs and 1.6 rule 5 (L6).
7. Wording only: 1.10 (`:129`) describes the size guarantee as "a `max(24px, <setting>)` floor", while the menu mixins stop the compile with `@error` on the toggle settings; the result is stricter, and 1.10 could say "a floor or a compile-time `@error`".

Conflicting Sass settings: none. Every setting two specs require has one value, and each is in `storybook-conventions.md`'s overrides list: `$topbar-background: $white` (Dropdown Menu, Nested menu, Responsive Menu, Magellan, Responsive Toggle); `$dropdownmenu-min-width: min(200px, 45vw)` (Dropdown Menu, Nested menu, Responsive Menu); `$accordion-item-color: scale-color($primary-color, $lightness: -15%)` (Accordion, Responsive Accordion Tabs); `$tab-background-active: $primary-color; $tab-active-color: $white;` (Tabs, Responsive Accordion Tabs); the alert colour `#bf3f2c` (Button palette, Abide); the three `$orbit-*` settings (Orbit only). `$closebutton-color` is required unchanged by both Off-canvas and Reveal. No two checks give different results for one input.

## Resolution log check (audit 0004)

Every cited commit (`d17749f`, `aff6fd9`, `c13eb23`, `6fcf4b3`, `730d236`, `6087313`, `ac78f51`, `a2cfa8a`, `b0692d0`, `afd1294`, `15743e8`) is an ancestor of `90d8212` and a descendant of audit 0004's snapshot `d70625e`. Two (`6087313`, the Abide README, and `ac78f51`, the Orbit re-run) predate audit 0004's own commit `d43fef0`, so H3 and part of M1 were fixed before the findings were recorded, as audit 0004 noted for audit 0003. Each row's commits touch the files its fix needs; the Tabs `injectAsync` statement in M6's list came from the review's `acd097d`, which the M6 row does not claim.

| Row | Holds at the snapshot | Where it fails |
| --- | --- | --- |
| H1 | Yes (ADR 0022 `:7`; `specs/reveal.md:328`, `:676`, `:678`; `off-canvas.md:327-328`, `:643`; `accordion-menu.md:576-578`; `nested-menu.md:363`, `:727`; `accordion.md:550`, `:659`; `responsive-accordion-tabs.md:681`; `orbit.md:583-584`; the five named tickets' amendments) | The Orbit ticket, not in the row's list, still decides the rounding check (M6) |
| H2 | Yes (Table A and B Drilldown, DropdownMenu, ResponsiveMenu DI; 1.4, 1.5, 1.13; `CONTEXT.md:207-217`) | Residue outside the fix: 1.3 `:45` (L5) |
| H3 | Yes (no email-shaped token in the Abide capture other than the approved address) | |
| M1 | Yes (Orbit ticket `:180-186`; ADR 0025 `:19`; `map.md:136`, `:190`; Table B Orbit; the router ticket's deciding questions) | |
| M2 | Yes (Table B Interchange, Magellan, SmoothScroll, Reveal; Table A and B Abide) | |
| M3 | Yes (the map gists; ADR 0017 `:13`; the four tickets; the Settled notes in the prototype write-ups) | |
| M4 | Yes (Off-canvas `:233`, `:259`; Responsive Toggle `:199-202`; Nested menu `:216`; Drilldown `:172`, `:246`) | |
| M5 | Yes (`specs/off-canvas.md:338`, `:442`) | |
| M6 | Yes (26 of 26 specs state the decision) | |
| M7 | Yes (ADR 0008 `:24`; ADR 0024 `:18`; `specs/anchored-pane.md:95`) | |
| M8 | Partly | The ticket's verdict paragraph `issues/62-...md:40` (L1) |
| M9 | Yes (`specs/off-canvas.md:331`, `:637`; the handed part closed by the review, `building-blocks.md:135`, `:251`) | |
| L1 | Partly | The Accordion ticket `:76`; a new number in `prototypes/sticky-measurement/styles.scss:12`; audit 0003's log lines kept without a note (L1) |
| L2 | Yes, at every listed line | New instances in the swap prototype ticket and older files (L2) |
| L3 | Yes (the effort-root note in every listed ticket) | |
| L4 | Yes at every listed line; the handed sweep closed "proposed", "graduated", and "pending" | Differently worded stale references remain (L5) |
| L5 | Yes (`building-blocks.md:38`, `:58`, `:92`, `:256`, `:280`; the Breakpoint service ticket's amendment; the Reveal dialog prototype ticket) | |
| L6 | Yes (`specs/triggers.md`, `anchored-pane.md`, `nested-menu.md:214`, `:727`) | |
| L7 | Partly | The Orbit keyboard `results/` hold case 1 only, with no note (L1) |
| L8 | Yes (`CONTEXT.md:66`, `:152`, `:164`, `:276`, `:292`) | |
| L9 | Yes (no research path, `preview.ts`, `main.js`, or "mode switch" in any spec) | |
| L10 | Yes (Reveal close-glyph `@error`; `map.md:205`; `storybook-conventions.md:166`; the prototype-only and five-tag notes; audit 0003's addendum) | |
| Departures 1 to 8 | Yes (1 to 5 with H1, H2, M2, M4; the review confirmed 6 at `building-blocks.md:66`, 7 at `:123`, 8 at `:85` and the Breakpoint service's consumer rule 3) | |

20 rows hold and 3 hold only in part. The opening sentence "Every finding is fixed except the two parts handed to the consistency review" does not hold for M8, L1, and L7; the two handed parts (M9's shared mixin, L4's sweep) and departures 6 to 8 were closed by the review.

## Verified OK

The final wave:

- The Responsive Menu ticket is an AFK grilling record: 32 numbered decisions with sources (`issues/23-spec-responsive-menu.md:55-106`), a Triage of 11 rated items (`:108-122`), one OPEN FOR HUMAN item of the assistive-technology kind, and its `## Prototype needed` graduated into the [Prototype: ResponsiveMenu swap committed in the Nested menu root's render callback](../issues/71-prototype-responsive-menu-swap-commit.md) (`Blocked by: 23`, resolved). Every shared-document proposal is carried: Table A and B ResponsiveMenu (`building-blocks.md:227`, `:254`), 1.5 (`:68`), 1.7 (`:93`), 1.10 Focus (`:125`), 1.11 decision 8 (`:157`), the Nested menu, Drilldown, and Breakpoint service specs, the ADR 0014 and ADR 0032 pointers, and the rendering-modes research note.
- The Responsive Menu spec uses `NfsMenuRoot` (`mode`, `drive()` with an unchanged signature, `collapseAll()`, `configure()`, `nfsMenuRootProviders`, `nfsMenuModeToken` read `{self: true}`), the three hosted roots' inputs, outputs, and idle behaviour, and the Breakpoint service's `serverBreakpoint`, `resolve(rules, breakpoint?)`, and `parseNfsBreakpointRules` as those specs define them (`specs/nested-menu.md:170-183`; `specs/accordion-menu.md:146-161`; `specs/drilldown-menu.md:167-179`; `specs/dropdown-menu.md:167-194`; `specs/breakpoint-service.md:163-209`), apart from L4.
- ADR 0035: `status: accepted`, meets the three-part bar, and its consequences are in building-blocks (1.5, 1.7, 1.10, 1.11 decision 8, Table B ResponsiveMenu). The keep-rule correction (entering drilldown closes the submenu whose own row, toggle or Hybrid link, holds focus) reads the same in the Nested menu spec (`:189`, D18), the Responsive Menu spec (`:24`, `:195`, `:287`, D9), ADR 0035 (`:12`), and Table B ResponsiveMenu (`:254`).
- The swap prototype: question with the deciding case, verdict, a 32-row results table, exact error text, what it does not prove, per-question decisions, the `D:/tmp/` workspace, and a Triage; every cited file exists; 49 tests, "147 passed" and 147 `[OK]` lines in both logs; every first-render timing in the ticket matches the prod log; `componentsSkippedHydration` 0 in the dev log; the Hybrid-link failure reads as the ticket says in all three engines (`evidence/playwright-prod.log:22`, `:126`, `:230`); the amended root keeps the displayed mode apart and commits it with the pruning in one `afterRenderEffect` (`src/app/nested-menu/nested-menu.ts:75-78`, `:107-127`, `:221-258`); axe with the six tags (`e2e/helpers.ts:170`); zoneless, no email-shaped token. The failed case took the map's text-correction path (`map.md:136`) and reached both specs and both tickets.
- The Orbit re-run's changes are all in the spec (the slide's own tab panel contract, binding precedence, the bullet `aria-controls`, the two-step focus handoff for every source of a selection change, the live-flip reconciliation, the vertical keys, the render hooks, the test cases); its building-blocks proposals 1 to 3 are carried verbatim (Table A and B Orbit, 1.9 `:110`); the Orbit ticket carries the reopen record audit 0004 M1 asked for (`:180-182`) and decisions 47 to 58. ADR 0034: `status: accepted`, three-part bar met, agrees with the spec; ADR 0025 keeps its decision with a pointer to ADR 0034.
- `map.md:214` to `:217` gist their tickets accurately.

The consistency review and the README:

- Every spec edit in `acd097d` is recorded in a dated "Amendment, 2026-09-26 (consistency review)" of its ticket, and every amendment bullet has its spec hunk (all 26 specs and the two prototype tickets). No `color-contrast()` comparison remains in any spec (every hit is a negation); "ADR 0008 decision" appears nowhere; the listed stale wording is closed apart from L5.
- The `00b6e41` building-blocks hunks (1.5, 1.6 rules 3 and 5, 1.9, 1.10, Table A Abide and ResponsiveToggle, Table B OffCanvas and ResponsiveMenu, Part 3 item 4) match the spec text changed in `acd097d`; the checks-only `nfs-abide` mixin is consistent across 1.10, Table A Abide, the spec, its ticket, ADR 0022, and `map.md:191`; the ADR pointer bullets it added are dated and change no decision.
- README: every relative link resolves and every ticket link text equals its title; all 35 ADR titles equal their H1s and all 35 are `status: accepted`; 26 specs, 35 ADRs, 15 research files, 4 audits, 23 prototype capture directories each with a README; every prototype and re-run ticket appears; each Implementation level matches the level its spec states; the cited research sections exist.
- The open list equals the review ticket's and every OPEN FOR HUMAN item still open in any of the 71 tickets; items left open in older tickets are decided elsewhere (the building-blocks ticket's items in its triage and building-blocks Part 4; the Playwright prototype's second item in the testing stack decision).
- `map.md` Decisions so far has exactly 71 lines, one per ticket; Not yet specified says "Nothing at the moment"; the Out of scope line for moving the bundle (`:233`) says why.

The gate, across the 26 specs:

- The seven to-spec sections in order, the Material comparison under Implementation Decisions and the design decisions table first under Further Notes; the six axe tags named in all 26; `injectAsync` decided with a reason in all 26; the four layer headings in the ADR 0018 wording with `renderServer()`; Story ids `<entry-point>--<story>`; no stack-neutral wording.
- Not-usable platform features (`popover`, anchor positioning, `<details name>`, `::details-content`, `@starting-style`, `interpolate-size`, `:has()`, View Transitions, `CloseWatcher`, `scrollend`, `dialog.closedby`, `requestClose()`, `sizes="auto"`) appear only as future adoption or as rejected alternatives; the in-target features cited carry dates or Browser target versions.
- Every Foundation JavaScript animation is converted: Motion UI to keyframe State classes (Reveal, Toggler, Responsive Toggle, Dropdown), jQuery fades to `nfs-fade-*` (Tooltip), `slideDown`/`slideUp` to the grid-row transition (Accordion, Accordion Menu), Orbit's slides to scroll snap, Drilldown to Foundation's transform slide and `animate-height`, Slider's move loop dropped; measured completion with a fallback timer; `animate.enter` never on persistent elements.
- Every Sass subsection is in the 1.13 form with `@import 'ngx-foundation-sites';` after Foundation, or "No library CSS; there is no `nfs-<plugin>` mixin" with item (4) where Motion classes are used; no `styles` or `styleUrl`.
- Shared-utility consumption: `NfsOpenable` (`specs/triggers.md:128-136`) member for member in Reveal, Off-canvas, Dropdown, Tooltip, Toggler, and Responsive Toggle; `nfsLightDismiss`, `nfsHoverIntent`, and `nfsPositioner` option names in Dropdown, Tooltip, Reveal, and the Nested menu match `specs/anchored-pane.md:156-232`; Magellan composes `NfsSmoothScroll` and calls `scrollTo(target, {focus})` as defined.

Hygiene:

- No non-ASCII character and no banned word in the 88 in-scope files or anywhere in the snapshot (script and `rg`, both exit 1 on the snapshot; the controls fire).
- No email-shaped token other than the approved address in the snapshot.
- All relative links resolve except the quoted-proposal links under effort-root notes; no heading anchor link fails.

Spot checks against the local clones (all hold unless a finding says otherwise):

1. The 21 plugin files, `foundation.abide.js` to `foundation.tooltip.js`, besides core, util, and positionable files -- `foundation-sites/js/` listing, `package.json:3` version 6.9.0 -- holds (the Destination's plugin list).
2. `ResponsiveMenu.defaults = {}` -- `js/foundation.responsiveMenu.js:151` -- holds (no Options of its own).
3. `MenuPlugins` holds `dropdown`, `drilldown`, `accordion` with classes `dropdown`, `drilldown`, `accordion-menu`, and the rules string splits on spaces -- `js/foundation.responsiveMenu.js:11-21`, `:69` -- holds.
4. Foundation swaps by removing the three classes and constructing a new plugin -- `js/foundation.responsiveMenu.js:129-138` -- holds (the library changes classes on the same nodes instead).
5. DropdownMenu reads no static `is-active` at init, while AccordionMenu opens pre-active submenus -- `js/foundation.dropdownMenu.js:309`; `js/foundation.accordionMenu.js:87` -- holds (a swap into dropdown closes a pre-opened section).
6. `menu-base` sets `display: flex` on `.menu` -- `scss/components/_menu.scss:64` -- holds (L4).
7. `$drilldown-transition: transform 0.15s linear` and `.animate-height { transition: height 0.5s }` -- `scss/components/_drilldown.scss:11`, `:83` -- holds.
8. `$dropdownmenu-min-width: 200px`, `$topbar-background: $light-gray`, `$accordionmenu-submenu-toggle-width: 40px`, `$breakpoint-classes: (small medium large)` -- `scss/settings/_settings.scss:418`, `:879`, `:265`, `:126` -- holds.
9. Foundation's docs pair `vertical medium-horizontal` with `drilldown medium-dropdown` and show `drilldown medium-accordion` -- `docs/pages/responsive-navigation.md:56`, `:114`, `:159` -- holds.
10. `Orbit.defaults`: `autoPlay: true`, `timerDelay: 5000`, `infiniteWrap: true`, `pauseOnHover: true`, `useMUI: true` -- `js/foundation.orbit.js:424-551` -- holds.
11. `.orbit-container { height: 0; overflow: hidden }` -- `scss/components/_orbit.scss:59-71` -- holds (the spec replaces it with a scroll-snap layout).
12. Foundation's palette `$white: #fefefe`, `$dark-gray: #8a8a8a`, `$medium-gray: #cacaca`, `$black: #0a0a0a` -- `scss/settings/_settings.scss:80-84` -- holds; the Orbit figures computed from it fail (L7).
13. `color-luminance()` at `scss/util/_color.scss:26`; `color-contrast()` rounds with `round($ratio * 10) * 0.1` -- `:65` -- holds (building-blocks 1.10).
14. `$input-error-color`, `$form-label-color-invalid`, `$input-background-invalid` default to `get-color(alert)`, and `form-input-error` tints with `mix($background, $white, $background-lighten)` -- `scss/forms/_error.scss:19`, `:23`, `:27`, `:41-50` -- holds (the `nfs-abide` checks).
15. Abide's `a11yErrorLevel` sets `aria-live` on the global error -- `js/foundation.abide.js:349-351` -- holds; the spec's role mapping leaves the delta unlisted (L7).
16. The `tooltip` mixin sets no `display` -- `scss/components/_tooltip.scss:62-75` -- holds (building-blocks 1.10).
17. `hamburger()` draws 20 by 16 px by default -- `scss/util/_mixins.scss:83-87` -- holds (Responsive Toggle's 2.5.8 rule).
18. `foundation-everything` does not include `foundation-range-input` -- `scss/foundation.scss:94-153` -- holds.
19. `Magellan.defaults` has seven keys -- `js/foundation.magellan.js:242-285` -- holds.
20. Interchange parses rules with `/\[.*?, .*?\]/g` and `split(', ')` -- `js/foundation.interchange.js:135`, `:139` -- holds.
21. APG tabbed carousel: tab-panel slides do not have `aria-roledescription` -- `aria-practices/content/patterns/carousel/carousel-pattern.html:157` -- fails for the spec (M3); the tabbed example sets it -- `examples/carousel-2-tablist.html:150`.
22. APG disclosure navigation avoids the menu role because it lacks the functionality assistive technologies expect -- `aria-practices/content/patterns/disclosure/examples/disclosure-navigation.html:35-36` -- holds.
23. Aria `TabPanel` binds `'[attr.inert]': '!visible() ? true : null'` -- `components/src/aria/tabs/tab-panel.ts:49` -- holds (ADR 0034).
24. Aria `Tab` binds `aria-controls` to its panel's id and finds its panel only among registered panels -- `src/aria/tabs/tab.ts:48`; `src/aria/private/tabs/tabs.ts:70` -- holds (the bullet's own `aria-controls`).
25. `reportViolations` calls `console.warn` twice -- `src/aria/private/utils/violations.ts:10-16` -- holds; ADR 0034's count fails (L7).
26. `getItemTabIndex` returns `0` only for the active item -- `src/aria/private/behaviors/list-focus/list-focus.ts:86-94` -- holds (the bullet `tabindex` override condition).
27. Aria's tabs pattern stops setting its default active item after the first interaction -- `src/aria/private/tabs/tabs.ts:135`, `:248-249` -- holds (the Tabs and Responsive Accordion Tabs drift).
28. Aria `MenuTrigger` runs `effect(() => this.menu()?.parent.set(this))` -- `src/aria/menu/menu-trigger.ts:91` -- holds (building-blocks 1.5's reverse-link citation).
29. Aria's menubar is horizontal only -- `src/aria/menu/menu-bar.ts:117` -- holds (open-list confirmation item 6).
30. `@angular/aria` 22.2 ships accordion, combobox, grid, listbox, menu, tabs, toolbar, and tree -- `components/src/aria/` listing, `git describe` `v22.2.0-15` -- holds (the README's closing sentence).
31. CDK's server `MediaMatcher` stub answers `matches: query === 'all' || query === ''` -- `src/cdk/layout/media-matcher.ts:94` -- holds.
32. `bindingUpdated` compares a binding's value with its own slot, and the attribute instruction writes only then -- `angular/packages/core/src/render3/bindings.ts:44-56`; `render3/instructions/attribute.ts:34-38` -- holds (ADR 0034's binding rule).
33. Host directives apply their bindings before the host -- `adev/src/content/guide/directives/directive-composition-api.md:107-129` -- holds.
34. `afterRenderEffect` runs `earlyRead`, `write`, `mixedReadWrite`, `read` in that order -- `packages/core/src/render3/reactivity/after_render_effect.ts:346-349` -- holds (ADR 0035's commit callback).
35. `injectAsync` is `@publicApi 22.0` and exported from `@angular/core` -- `packages/core/src/di/inject_async.ts:48`; `packages/core/src/di/index.ts:20` -- holds (building-blocks 1.9).
36. `FORM_FIELD` is public from `@angular/forms/signals` -- `packages/forms/signals/src/directive/form_field.ts:79`; `public_api.ts:24` -- holds (the Abide spec).
37. "Zoneless is the default in Angular v21+" -- `adev/src/content/guide/zoneless.md:14` -- holds (the swap prototype runs zoneless).

## Resolution log

(For the orchestrator: record here which findings were fixed, turned into tickets, or rejected, with the commit that did it.)
