# 133. Consistency review: the class-rule wave

Type: grilling
Status: resolved
Blocked by: 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 134, 136, 137, 138, 139, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155
Labels: wayfinder:grilling
Map: ../map.md

## Question

Do the 25 new specs, the 26 re-run specs, ADR 0039, the typed-input ADR, building-blocks, the glossary, and the bundle index (`README.md`) agree with each other and with the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? No consumer-written Foundation or NFS class may remain in any spec's examples.

## How to work it

As the [Consistency review and bundle index](36-consistency-review.md) did: read every spec in full, check each against building-blocks, the ADRs, and the glossary, fix what is wrong in place with a dated amendment in each spec's ticket, and bring `README.md` (the spec count, the index, the ADR list) up to date. An audit of the wave follows it (map Notes, Audits). Model: Opus 5.5.

## Answer

The 25 new specs, the 26 re-run specs, the two shared-utility specs added since, ADR 0039, the typed-input ADR 0040, building-blocks, the glossary, and the bundle index agree with each other and with the class rule of the user's ruling on 2026-09-27: no spec's consumer code writes a Foundation or NFS class, every Structural class is bound by its directive, every Variant class is set by a typed input, and every State class is a host binding (or, where no library directive hosts the element, the owning directive's `Renderer2` write that ADR 0039's 2026-09-27 note allows). Nothing is OPEN FOR HUMAN from this ticket. Worked AFK on 2026-09-29, Opus 5.5 throughout, in three phases.

### The three phases

1. Decisions. A coordinator, with ten forked lanes of itself and two class sweeps over all 53 specs, decided every routed item and the review's own checks and wrote [research/consistency-review-decisions.md](../research/consistency-review-decisions.md): one section per item with its evidence, the quoted text each spec takes, the shared-document changes, and the rating, then a per-spec index and the closing pass's list. Measured where a claim was unmeasured (scripts under `D:/tmp/nfs-133/`): Orbit and Switch under forced colours in Chromium and Firefox, close-button overlap under the 1.4.12 text spacing in the Reveal and the Off-canvas, text clipped at 320 CSS px in the Orbit, Drilldown, and Off-canvas wrappers, the `NfsMotionPair` type under `tsc` 6.0.3, and every recomputed contrast figure with an exact WCAG calculator.
2. Group reviews. Six reviewers, one per group of about nine specs, read every spec in full, applied the decisions and the checks, fixed what else was wrong in place, and amended each spec's governing ticket; each group is committed, with its report in `research/consistency-review-group-a.md` to `-f.md` ([a](../research/consistency-review-group-a.md), [b](../research/consistency-review-group-b.md), [c](../research/consistency-review-group-c.md), [d](../research/consistency-review-group-d.md), [e](../research/consistency-review-group-e.md), [f](../research/consistency-review-group-f.md)).
3. Closing pass. The coordinator ruled on the groups' proposals, applied the decisions file's shared-document list and every accepted proposal once each, made `README.md` and the map current, corrected the decisions file where the reviewers found it wrong (dated corrections), and wrote this Answer; a Node script under the coordinator's scratchpad verified every applied replacement, ASCII, the banned words, the links, the table rows, and the README's counts.

### The routed items

The 74 items of [research/consistency-review-routed-items.md](../research/consistency-review-routed-items.md), then the items the five family re-runs routed here. "Confirm" means the spec already held and the reviewer checked it; the decisions file holds the evidence and the quoted text of every item.

| Item | Decision | Applied in |
| --- | --- | --- |
| R1 | `nfsShowForSr` carries no placeholder qualifier (already applied) | Confirmed in abide, button-group, badge, label, drilldown-menu, responsive-menu, orbit |
| R2 | One `NfsMotionPair` with a three-case development check; a pair half holds one class; the examples write Motion names | toggler, responsive-toggle, dropdown, triggers, callout, close-button, breakpoint-service; building-blocks 1.6 rule 4 |
| R3 | The menu specs write no class; two decision rows stop deferring to the Responsive Menu spec | accordion-menu, dropdown-menu |
| R4 | Every contrast check and figure uses the exact WCAG helper, never `color-luminance()` or `color-contrast()`; one ratio-quoting rule; corrected figures | abide, accordion, button, button-group, callout, close-button, forms, menu, reveal, responsive-accordion-tabs, tabs, and S1 in the other checking specs; building-blocks 1.10; storybook-conventions section 5 |
| R5 | A `$foundation-palette` merge reaches callouts, progress bars, and the native progress element only | button, progress-bar; storybook-conventions section 5 |
| R6 | Badge and Label correct Foundation's colour pick; Button and Button Group check it as emitted and name the other candidate | button (D23), button-group; building-blocks 1.10 |
| R7 | The Equalizer's neighbour names are the owning specs'; gutters restored | equalizer |
| R8 | The Abide's Callout sentence cites the published spec | abide |
| R9, R23 | The Forms' and Pagination's names were already the published ones | Confirmed in forms, pagination |
| R10 | The Media Object's names cite their specs; the Menu's `align` was settled by [Decide: inputs named like HTML presentational attributes](139-decide-inputs-named-like-presentational-attributes.md) | media-object |
| R11 | Sticky D19's neighbour names cite their specs | sticky |
| R12 | Smooth Scroll's Menu and Top Bar names cite their specs | smooth-scroll |
| R13 | The Interchange table example writes `nfsTable hover` and a caption | interchange |
| R14 | Every close button's 2.5.8 row points to `nfs-close-button`; the Triggers' menu-icon wording names `nfs-menu-icon`'s 24 px box | triggers |
| R15 | Orbit's bullets get forced-colours rule 13; the Switch's rule covers Foundation's `:focus-visible` selectors; one shared forced-colours statement | orbit, switch, slider, progress-bar; building-blocks 1.10 (new bullet) |
| R16 | One shared `hidden` sentence with three ways to hide | thumbnail, float-classes, flexbox-utilities, xy-grid, flex-grid; building-blocks 1.10 |
| R17 | No `exportAs` on `NfsButton` and `NfsCloseButton`; the closing pass extends the rule to twelve more (Proposals below) | button, close-button, button-group; closing pass: badge, label, callout, responsive-embed, drilldown-menu, menu, responsive-menu, top-bar, visibility-classes, tabs, equalizer; building-blocks 1.3 and Table D; architecture guide P13 |
| R18 | The Button Group's alignment is `nfsFlexAlign alignX` (already applied) | Confirmed in button-group |
| R19 | Aria's Toolbar and Grid are other patterns, not fallbacks | README, "`@angular/aria` building blocks not used" |
| R20 | The Slider's focus ring takes `$input-border-focus` with the Switch's 3:1 check | slider (D26), switch; building-blocks 1.10 Forms bullet |
| R21 | The Switch's rows hold; the README row names [Re-run: Switch spec, out-of-scope survivors](147-rerun-switch-out-of-scope-survivors.md) | README |
| R22, R53 | The Top Bar classes and the submenu companion hold; the Triggers' D13 cites the Top Bar spec | triggers |
| R24 | The Breadcrumbs Router example sits in a named `nav` | breadcrumbs |
| R25 | Link figures name the settings they hold for; the Reveal gets the Callout's close-button room (rule 8, D29); the closable stories name their docs pages | reveal, off-canvas, callout, close-button; building-blocks 1.10 Callout bullet; storybook-conventions section 5 |
| R26 | `overflow-wrap: break-word` in the Orbit caption, the Drilldown wrapper, and the Off-canvas wrapper; a short-caption requirement; Card gutters | orbit (rule 14), nested-menu, drilldown-menu, off-canvas, responsive-menu, card; building-blocks 1.10 (new bullet) |
| R27 | The Table classes hold; the Names bullet's first sentence; the flag exception in the tooling spec | variant-declaration-tooling; building-blocks 1.10; ADR 0012 (dated note) |
| R28, R29 | The Badge warns on a link host; Badge and Button state the working Custom Colors forms | badge, button; building-blocks 1.10 Badge bullet |
| R30 | Every progress story shows its Visible value; the one-writer exception worded once; the alert override's figures | progress-bar, variant-declaration-tooling, callout, abide |
| R31 | The Responsive Embed's fixture route holds; the glossary's Fixture app has one route per entry point | CONTEXT |
| R32, R64 | Every consumer `<img>` uses `NgOptimizedImage`, no `loading` attribute, `priority` on the first slide | card, media-object, toggler, sticky, equalizer, orbit, float-classes, prototyping-utilities |
| R33 | `nfs-abide` and `nfs-forms` check different pairs; the Forms row exists | Confirmed in abide, forms |
| R34, R35 | No two directives on one element share an input name with different types; the shared-name list grows | float-grid; building-blocks 1.9 |
| R36 | Storybook scaffolding uses the utility and layout directives by name | float-classes (`nfsWidth`); storybook-conventions section 8 |
| R37 | Every Flex parent's spec writes the flex directives beside, as decision 8 allows | Confirmed |
| R38 | The Flexbox Utilities' placeholders were in other specs and are replaced | A1, A2 |
| R39 | Visibility classes appear only as output or check inputs; building-blocks 1.3 states `NfsNoBullet` and `NfsShowForSr`/`NfsShowOnFocus` | building-blocks 1.3 |
| R40, R41, R42 | The Visibility Classes' sticky examples can stick; `nfsOverflow="hidden"` and `nfsPosition="relative"` in stories | visibility-classes, sticky, anchored-pane |
| R43 | The XY Grid's D3 loses the collision clause | xy-grid |
| R44 | The Tabs' grid names and the recipe convention hold | Confirmed in tabs |
| R45 | `nfs-tabs` checks the plain strip's pairs, so every tab strip includes it | tabs (D26), responsive-accordion-tabs; building-blocks 1.10 and 1.13; storybook-conventions section 5 |
| R46 | The equal-heights recipe names the structure it relies on | responsive-accordion-tabs |
| R47 | One source for the Base side; the Top Bar's D9 drops the token fix; ADR 0042's scope | top-bar, responsive-menu, nested-menu; ADR 0042 (dated note) |
| R48 | Magellan's gutter; the stale NG0309 reasons removed | magellan, forms, abide |
| R49 | ADR 0039's note lists `html` (already) | Confirmed in reveal |
| R50 | Every Reveal outside its spec is `<dialog nfsReveal>` with no class | Confirmed |
| R51 | Every `class="dropdown-pane"` is output or a check input | Confirmed |
| R52 | "Consumer" is the application; the library side is a consuming directive; "consuming-directive rule N" | breakpoint-service, triggers, nested-menu, off-canvas, responsive-toggle, responsive-menu, reveal, dropdown, responsive-accordion-tabs, interchange, toggler; building-blocks 1.6 rule 5 |
| R54 | Under reduced motion a directive may bind no Motion class of either kind | breakpoint-service, toggler, dropdown; building-blocks 1.6 rule 5 |
| R55 | A Story id for the 2.4.11 case: `responsive-toggle--sticky-title-bar` | responsive-toggle |
| R56 | Every Off-canvas panel binds `position`; the Top Bar states its Zero-breakpoint `needs` | accordion-menu, top-bar |
| R57 | One term, "Application class"; what each class-taking input reports | 27 specs |
| R58 | The 1.4.10 case runs on `equalizer--reflow` | equalizer |
| R59 | Every Variant check names its handle, lists no flag-gated property, and tests the missing property in its own file | the specs with a Variant property; building-blocks 1.4 |
| R60 | ADR 0040's dissent is not reopened (impact HIGH, confidence HIGH) | ADR 0040 (dated note) |
| R61, R63 | Orbit's class-only parts and Table A hold; the hierarchy wording | orbit |
| R62 | A translucent overlay over an image is composited over `#fff` and `#000` | interchange |
| R65 | Every Trigger host is class-free; the Triggers' examples write Motion names and `type="button"` | triggers |
| R66 | Every re-run follows building-blocks 1.4's initial-state rule; 1.4 records two shared patterns | building-blocks 1.4 |
| R67 | The tooling spec carries [Prototype: Variant declaration tooling in real Nx and Angular CLI workspaces](137-prototype-variant-declaration-tooling.md)'s verdict; README item 5 | README |
| R68 | The Dropdown pane's and the Off-canvas panel's `autoFocus` differ on purpose | Confirmed |
| R69, R70 | No rendered `align` or `autofocus`; README item 7 and the guide hold | Confirmed |
| R71, R72 | No print class or `ir` in consumer markup | Confirmed |
| R73 | The typography greys are `#666666` everywhere they are the Typography Helpers' | Confirmed |
| R74 | Name checks read content as accessible-name computation does, an image's `alt` included | switch, close-button, top-bar, label, badge, table, progress-bar, responsive-embed, drilldown-menu, tooltip; building-blocks 1.10 Names bullet |
| [Re-run: navigation family specs, In-family check lines](151-rerun-navigation-family-in-family-lines.md): one label and form | The Accordion's "Forgotten imports" sentence becomes "In-family checks", one line per part | accordion |
| [Re-run: navigation family specs, In-family check lines](151-rerun-navigation-family-in-family-lines.md): the three root specs' lines | Present word for word | Confirmed in accordion-menu, dropdown-menu, responsive-menu |
| [Re-run: disclosure and carousel family specs, In-family check lines](152-rerun-disclosure-and-carousel-family-in-family-lines.md): multi-provider token wording | `nfsMenuModeToken` and `nfsOpenableToken` both take M7's form | nested-menu; forgotten-import-checks (M7 row) |
| [Re-run: disclosure and carousel family specs, In-family check lines](152-rerun-disclosure-and-carousel-family-in-family-lines.md): registration and DOM checks | The shared spec's bullets govern (recorded point 1 below) | triggers, off-canvas, orbit, abide; forgotten-import-checks |
| [Re-run: disclosure and carousel family specs, In-family check lines](152-rerun-disclosure-and-carousel-family-in-family-lines.md): class-only parts under `strictParents` | One sentence in the shared spec's `strictParents` section | forgotten-import-checks, orbit |
| [Re-run: form and value-control family specs, In-family check lines](153-rerun-form-and-value-control-family-in-family-lines.md): cross-family neighbours | Stated the shared spec's way | flexbox-utilities, pagination; confirmed in the rest |
| [Re-run: form and value-control family specs, In-family check lines](153-rerun-form-and-value-control-family-in-family-lines.md): checks that find a peer by its class | A shared bullet: read the peer's attribute where one directive owns the class | forgotten-import-checks; top-bar, visibility-classes; closing pass: close-button, dropdown |
| [Re-run: CSS-only component and free-behaviour family specs, In-family check lines](154-rerun-css-only-component-and-free-behaviour-family-in-family-lines.md): placement checks against S2 | The Top Bar's check 7, the XY Grid's check 2, and the Flex Grid's checks agree | Confirmed |
| [Re-run: layout system and flex utility family specs, In-family check lines](155-rerun-layout-system-and-flex-utility-family-in-family-lines.md): the Flex Grid's column row | Check 3 skips a host that is also a row | flex-grid |

### The review's own checks

- CR-A, no consumer-written class: two sweeps over the 53 specs (1,113 class-attribute hits, 127 input values that take classes, every recipe) found no violation; every hit is rendered output, a labelled copied-class or compile-failure case, Foundation's labelled markup, library code, prose, or an Application class. One unlabelled copied class in the Responsive Toggle's example got its comment, and each reviewer reran the search after its edits. Impact HIGH, confidence HIGH.
- CR-B, class mapping completeness: every class a spec's markup or its Foundation docs page uses has a mapping row; the reviewers added the missing rows for other families' classes, one row per owning family, and `.is-opening` and `.thumbnail` rows.
- CR-C, placeholder names: every deferral to an unpublished spec or to this review is replaced by the published name (R1, R7 to R12, R18, R23, R38, R43, R44, and A1 to A7, plus the deferrals the reviewers found by reading).
- CR-D, example imports: every `@Component` example imports exactly the library directives its template writes (the Forms' `app-donate` dropped an unused import; the Interchange, Dropdown, Triggers, Tabs, Visibility Classes, and Responsive Accordion Tabs examples gained theirs).

### Placeholders and further findings

- A1 to A7, the placeholders the sweep found beyond the routed items: A1, A2 (flexbox-utilities), A5 (close-button), and A7 (thumbnail) applied as quoted; A3, A4, and A6 fold into R12, R56, and R2.
- X1: the Accordion's `@warn` contrast checks stay (ADR 0022 promises a compile error or warning). X2: the Orbit's and Slider's missing forgotten-import lines went to [Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md) and its re-runs, which added them. X3: the Switch's forced-colours defect is fixed under R15. X4: the Visibility Classes' sticky examples are fixed under R40.

### The group reports' proposals

| Proposal | Outcome | Reason | Rating |
| --- | --- | --- | --- |
| Group a P1, group b proposals 1 and 3: drop the `exportAs` of `NfsBadge`, `NfsLabel`, `NfsCallout`, and `NfsResponsiveEmbed` | Accepted and extended: every directive whose public members are only inputs and outputs has no `exportAs`, so `NfsMenu`, `NfsTopBar`, `NfsMenuIcon`, `NfsVisibility`, `NfsTabsGroup`, and `NfsEqualizer` lose theirs too, and building-blocks 1.3 states that the consumer's own inputs are not state to read | Building-blocks 1.3's rule as R17 read it; the parity reasons were gone once R17 applied; no spec writes a reference to any of them except one Responsive Menu test, which now uses a `viewChild` query. Removal before the first release is the direction a later release can undo without a break (adding an `exportAs` is additive, ADR 0045); keeping them would need an Angular major's deprecation to remove | Impact LOW, confidence HIGH |
| Group b proposal 2: drop the `exportAs` of `NfsDrilldownWrapper` and `NfsDrilldownBack` | Accepted | No inputs, outputs, or public methods; the root keeps `nfsDrilldown` | Impact LOW, confidence HIGH |
| Group b proposal 3: building-blocks Table D | Accepted | Follows the spec edits | Impact LOW, confidence HIGH |
| Group b proposal 4: the Clipping containers bullet | No change needed | It already matches the Drilldown's rule 5 | - |
| Group a P2, group d P1: name the Abide warnings, the Orbit's checks 1 and 3, and the Off-canvas panel's check 3 in the registration bullet | Accepted, merged, with the Triggers' check 1 added | Those checks now follow the bullet | Impact LOW, confidence HIGH |
| Group d P2: the family rule's item 2 | Accepted | Keeps item 2 from reading as the forgotten-import case | Impact LOW, confidence HIGH |
| Group e proposal 1: the Storybook Tabs comment | Accepted | R45 makes `nfs-tabs` stop the compile on both pairs | Impact LOW, confidence HIGH |
| Group e proposal 2: Table B's Reveal row | Accepted | R25 adds `data-nfs-close-button` to the server HTML | Impact LOW, confidence HIGH |
| Group e proposal 3, group f proposals 1 and 4 (forgotten-import checks), group f proposal 3 (the `hidden` lists) | Already applied by the reviewers; not applied again | - | - |
| Group f proposal 1, extended | The Close Button's check 3 and the Dropdown pane's check 8, which group b left reading the class only, read the peer's attribute too, so they agree with the shared bullet and the Top Bar's check 3 | A forgotten `NfsButton` or `NfsButtonGroup` import would hide a misuse that stays once the import is added | Impact LOW, confidence HIGH |
| Group c proposal 1, group f proposal 2: `nfsMenuModeToken`'s description | Already applied (group d) | - | - |
| Group c proposal 2: the Accordion's label | Already applied (group a) | - | - |
| Group c proposal 4, group a's note on the Abide amendment, group e's note on 3.422:1: corrections of the decisions file | Accepted, as dated corrections | Facts: [Spec: Forms](98-spec-forms.md)'s reason sits in question 5, decision 4, and a triage row; the Abide amendment is in [Re-run: Abide spec under the class rule](123-rerun-abide-class-rule.md); the Slider's ring is 3.42:1 | - |
| Group c proposal 5: three links without `../adr/` in the bodies of [Spec: Forms](98-spec-forms.md) and [Spec: Menu](85-spec-menu.md) | Not applied | They are quoted ADR text inside the tickets' proposals, written for `adr/`, where they resolve; the bundle quotes text in the form of the document it goes into | Impact LOW, confidence HIGH |

### Recorded points

1. The registration-check rule. [Re-run: disclosure and carousel family specs, In-family check lines](152-rerun-disclosure-and-carousel-family-in-family-lines.md)'s S2 second sentence ("a check that reads registrations keeps its message") was not adopted; the bullet of [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md) from [Re-run: navigation family specs, In-family check lines](151-rerun-navigation-family-in-family-lines.md)'s P1 stands: a family check that finds a peer by registration says nothing where the element it looks for carries the peer's attribute, and keeps its message for a truly bare part or a peer linked only by a required reference. The reviewers aligned their specs to it: the Triggers' check 1 (group f, superseding [Re-run: disclosure and carousel family specs, In-family check lines](152-rerun-disclosure-and-carousel-family-in-family-lines.md)'s decision 1.2), the Off-canvas panel's check 3 and the Orbit's checks 1 and 3 (group d, superseding [Re-run: disclosure and carousel family specs, In-family check lines](152-rerun-disclosure-and-carousel-family-in-family-lines.md)'s decisions 2.1 and 5.7), and the Abide warnings (group a, [Re-run: form and value-control family specs, In-family check lines](153-rerun-form-and-value-control-family-in-family-lines.md)'s decision 3); the Responsive Toggle's check 3 keeps its message (group e, and the shared spec's sentence group c added). The closing pass names these checks in the bullet and rewords the family rule's item 2.
2. The amendment home and heading. The reviewers' form is kept for every spec: `### Amendment, 2026-09-29 (consistency review)` at the end of the ticket the map's Decisions so far cites last for the spec (53 tickets; the five family re-runs are cross-spec and were not counted as governing), and the closing pass's lines under `### Amendment, 2026-09-29 (consistency review, closing pass)` at the end of the same ticket. The decisions file, which named the original spec ticket and the heading `(class-rule consistency review)`, carries a dated correction.

### Shared documents changed by the closing pass

`building-blocks.md` (1.3, 1.4, 1.6 rules 4 and 5, 1.9, 1.10's first, hidden, Names, Forms, Callout, and Badge bullets and its new Forced colours and Clipping containers bullets, the colour-alone bullet, 1.13's Tabs paragraph, Table B's Reveal row, Table D's Badge, Label, and Responsive Embed rows), `storybook-conventions.md` (section 5's comments, section 8's scaffolding and inline-style bullets), `CONTEXT.md` (Fixture app), `architecture-guide.md` (P13), ADRs 0012, 0040, and 0042 (dated notes), `README.md` (counts, the ten missing spec rows, the Open list, the Aria paragraph, the Switch row), and `map.md` (the gist below; its Notes needed no change, and the gists of [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md) to [Re-run: layout system and flex utility family specs, In-family check lines](155-rerun-layout-system-and-flex-utility-family-in-family-lines.md) are present once each).

### Triage

Every item, check, and proposal is decided. Impact HIGH, confidence HIGH: CR-A and R60. Everything else is impact LOW, confidence HIGH: wording, figures, examples, development checks, Library mixin rules, and `exportAs` names removed before the first release, each restorable additively. OPEN FOR HUMAN: nothing from this ticket; the one open item in the bundle is T9 of [Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md) (the Prototyping Utilities' Library mixin), listed in README's Open list.

### Process notes

The rules of the briefs held, with one kind of exception in the coordinator's shell use: a few short inline `node -e` scripts and one heredoc carried text that belonged in files; none wrote into the repository outside the edit scope. Some reviewers record similar lapses in their reports.

### Gist for Decisions so far

- [Consistency review: the class-rule wave](issues/133-consistency-review-class-rule-wave.md) -- the 53 specs agree with each other and with the class rule: a coordinator decided the 74 routed items, the re-runs' routed items, and the review's four checks (no consumer-written Foundation or `nfs-` class, one mapping row per class, no placeholder names, example imports that match their templates), none OPEN FOR HUMAN, measuring what the specs had not (Orbit's bullets vanish under forced colours, a focused Switch loses its knob there, text runs under the Reveal's close button under text spacing, and long words are cut off in the Orbit caption, the Drilldown wrapper, and the Off-canvas wrapper); six reviewers fixed every spec in place and amended the ticket this map cites last for each spec; the closing pass brought building-blocks, storybook-conventions, CONTEXT, the guide, ADRs 0012, 0040, and 0042, and README up to date, extended R17 so no directive whose public members are only inputs and outputs has an `exportAs` (twelve more), and aligned the forgotten-import checks' registration and class-peer rules across the specs. Decisions: [research/consistency-review-decisions.md](research/consistency-review-decisions.md).
