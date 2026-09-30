# Consistency review of the later-milestone waves: group a (navigation)

Ticket: [Consistency review: the later-milestone waves](../issues/180-consistency-review-later-milestone-waves.md), group a

Reviewer: group a's reviewer (Opus 5.5), no lanes. Worked 2026-09-30. Read-only on every file outside the group's ten specs, their eight amendment homes, and this report.

## What was read

In full: the ticket, `map.md` lines 1 to 163, [Consistency review: the class-rule wave](../issues/133-consistency-review-class-rule-wave.md), the four rulings ([Decide: an exportAs on every directive](../issues/156-decide-exportas-on-every-directive.md), [Decide: family checks report a forgotten peer themselves](../issues/157-decide-family-checks-report-forgotten-peers.md), [Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md), [Decide: grids, typography, and utilities move to a later milestone](../issues/174-decide-grids-typography-utilities-later-milestone.md)), [Audit 0009: the later-milestone checks wave](../audits/0009-later-milestone-checks-wave.md), [Audit 0010: the later-milestone families wave](../audits/0010-later-milestone-families-wave.md), `adr/0018` (body and Consequences), and the ten specs of the group: `menu.md`, `top-bar.md`, `nested-menu.md`, `accordion-menu.md`, `dropdown-menu.md`, `drilldown-menu.md`, `responsive-menu.md`, `responsive-toggle.md`, `magellan.md`, `smooth-scroll.md`.

Searched, not read in full (at the lines each check needed): `building-blocks.md` (1.4 kind `removed`, 1.6 rules 1 to 5, 1.11 decisions 1 to 11, 1.14, Table B's SmoothScroll row, Part 3's list, the typings-check sentence), `adr/0012` (its notes of 2026-09-29 and 2026-09-30), `adr/0039` (its note of 2026-09-30), `architecture-guide.md` (P13, P18 headings), `storybook-conventions.md` (sections 5 and 8, the preview's include list and settings overrides), and the owning specs of borrowed names: `triggers.md` (selectors and `exportAs` of `NfsOpen`, `NfsToggle`, `NfsClose`), `off-canvas.md` (`NfsOffCanvas`, `exportAs`, `position`), `sticky.md` (`NfsSticky`, `NfsStickyContainer`, `stickyOn`), `breakpoint-service.md` (`NfsMediaQuery` members, `parseNfsBreakpointRules`, consuming-directive rules 1, 3, and 4), `anchored-pane.md` (`nfsLightDismiss` and `nfsHoverIntent` option shapes, `NfsDismissReason`), `dropdown.md` (D2, D11), `close-button.md` (D2, D3), `switch.md` (D12), `slider.md` (rule 13, D20), `tabs.md` (D18), `progress-bar.md` (D16), and `toggler.md`, `reveal.md`, and `variant-declaration-tooling.md` for the shared type and helper names (`NfsMotionPair`, `nfsMotionPairClasses`, `NfsMotionInName`, `NfsMotionOutName`, `nfsAnimationsToken`, `NfsVariantBoolean`, `NfsClassBreakpoint*`, `NfsBreakpointClassesOverrides`, the Variant typings check).

Mechanical sweeps over the ten specs (scripts under the session scratchpad, `review180/a/`): every identifier `Nfs...`/`nfs...` that appears in the eight later-milestone specs and in no first-milestone spec (220 names; zero hits in the group); the check vocabulary (`dev-mode`, development warning or check, `@error`, `@warn`, In-family, the forgotten-import, Runtime, and Variant check names, links to tickets 150 and 160 to 164 and to the five check specs; only the APG's "warns" and Foundation's own `console.error` match); the family names and links of the eight later families (every hit is Foundation's class written as a normal class, the Responsive Toggle's own Visibility classes, or a "later milestone adds" sentence); every relative link, resolved and, for tickets, its text compared with the ticket's H1 (328 links, 0 bad before the edits).

The checks are the ticket's seven: 1 class rule, 2 milestones, 3 cross-spec names, 4 shared documents, 5 standing preferences, 6 shape and examples, 7 hygiene. Every rating uses the map's triage rule; nothing here is OPEN FOR HUMAN.

## Menu (`specs/menu.md`)

Read in full.

1. Class rule: the examples write no class of a family with a first-milestone spec; `.show-for-sr`, the flex alignment classes, and the order and visibility classes are Foundation's classes written as normal classes. One sentence was too broad (change 1).
2. Milestones: holds. D12 names the Flexbox Utilities' alignment directive only as one "a later milestone adds"; the build assertion is the Variant typings check, the library's own post-build gate (first milestone).
3. Cross-spec names: holds (`NfsSubmenu` hosting, `nfsTopBarRightToken`, the Smooth Scroll and Magellan attributes, the Tabs D18 reference).
4. Shared documents: holds (building-blocks 1.4 `removed` kind, 1.10, ADR 0004, ADR 0022, ADR 0018's tags).
5. Standing preferences: holds (versions, native Implementation level with its reason, rendering modes, 2.2 AA, no animation, the four layers).
6. Shape and examples: holds; `SiteNav` and `DocsSidebar` import exactly the directives their templates write.
7. Hygiene: one merged bullet (change 2).

Changes:

1. Problem Statement, second paragraph. Before: "the developer writes no Foundation or library class ([ADR 0039]". After: "the developer writes no Foundation or library class of a family with a first-milestone spec ([ADR 0039]". Reason: ADR 0039's note of 2026-09-30; the same spec has the consumer write `.show-for-sr`, `.align-justify`, and `medium-order-2`. Impact LOW, confidence HIGH.
2. Browser-level test, Hosting bullet. Before: "and `.align-right` is set.- Router:". After: the Router case on its own bullet line. Reason: hygiene (a missing line break merged two bullets). Impact LOW, confidence HIGH.

## Top Bar (`specs/top-bar.md`)

Read in full.

1. Class rule: `show-for-sr` is the one normal class written; two sentences said no class at all (changes 1 and 2).
2. Milestones: holds, apart from change 3's pointer to a mechanism the first milestone does not have.
3. Cross-spec names: holds (`NfsResponsiveToggle` with `hideFor`, `nfsResponsiveToggleMenu`, `NfsToggle`, `[nfsOpen]`, `nfsOffCanvas` with `position`, `NfsSticky` with `stickyOn="all"`, `NfsStickyContainer`, the Close Button's D2 and D3, Switch D12, Slider rule 13 and D20, Progress Bar D16).
4. Shared documents: one stale citation (change 3); ADR 0012's one-mixin rule (D7) and ADR 0043 hold.
5. Standing preferences: holds.
6. Shape and examples: holds; `SiteHeader` imports exactly its template's directives.
7. Hygiene: holds.

Changes:

1. CSS class to Angular mapping, State classes paragraph. Before: "No class is left for the consumer to write (ADR 0039)." After: "No class of a family with a first-milestone spec is left for the consumer to write (ADR 0039)." Reason: the next table's `.show-for-sr` row; ADR 0039's note of 2026-09-30; audit 0010 L1's wording. Impact LOW, confidence HIGH.
2. Testing Decisions, Story ids paragraph. Before: "no story writes a Foundation or library class." After: "no story writes a Foundation or library class except `show-for-sr` for a menu icon's visually hidden name, a Visibility class whose family has no first-milestone spec." Reason: `top-bar--menu-icon` names its icons three ways, visually hidden text among them. Impact LOW, confidence HIGH.
3. Node-level Sass compile test. Before: "(the guard on the drawing size the rule assumes, as ADR 0012 guards `-zf-bp-to-em`)". After: "(the guard on the drawing size the rule assumes)". Reason: ADR 0012's note of 2026-09-29 moves the `-zf-bp-to-em` dependency, and so its guard, to the later milestone. Impact LOW, confidence HIGH.

## Nested menu (`specs/nested-menu.md`)

Read in full.

1. Class rule: holds; no story, fixture, or example writes a class except the labelled copied-class cases.
2. Milestones: holds; the required injections (NG0201, the missing-provider failure) are Angular's.
3. Cross-spec names: the `NfsResponsiveMenu` sketch lacked the `exportAs` the owning spec gives (change 1); the `NfsDropdownMenu` sketch, the Drilldown inputs, the Anchored pane helper options, and the Breakpoint service members match their owners.
4. Shared documents: holds (building-blocks 1.4, 1.5, 1.6 rule 1, 1.9, 1.10, 1.11; ADR 0004, 0035, 0042, 0043).
5. Standing preferences: holds.
6. Shape and examples: holds apart from change 1.
7. Hygiene: holds.

Changes:

1. Usage examples, the `NfsResponsiveMenu` sketch. Before: `selector: 'ul[nfsResponsiveMenu]',` then `providers:`. After: `exportAs: 'nfsResponsiveMenu',` between them. Reason: [Decide: an exportAs on every directive](../issues/156-decide-exportas-on-every-directive.md); the Responsive Menu spec's D1 names it; the `NfsDropdownMenu` sketch beside it carries its own. Impact LOW, confidence HIGH.

## Accordion Menu (`specs/accordion-menu.md`)

Read in full. No change.

1. Class rule: holds; the Off-canvas and Button rows name their owners.
2. Milestones: holds ("the Variant typings check" is the library's post-build gate).
3. Cross-spec names: holds (`NfsOffCanvas` with `position`, `#nav="nfsOffCanvas"`, a bare `nfsClose`, the Nested menu parts, the Menu's five inputs).
4. Shared documents: holds (ADR 0028, 0033, 0041, 0042; building-blocks 1.4, 1.6 rule 3, 1.11 decision 9, Part 4 item 3).
5. Standing preferences: holds.
6. Shape and examples: holds; `DocsNav` imports exactly its template's directives.
7. Hygiene: holds.

## Dropdown Menu (`specs/dropdown-menu.md`)

Read in full. No change.

1. Class rule: holds; the one class case is the labelled copied-class case.
2. Milestones: holds; the Imports bullet carries audit 0009 M4's fix, and the Sass subsection audit 0009 H1's.
3. Cross-spec names: holds (the Dropdown pane's D2 and D11, `nfsTopBarRightToken`, the Top Bar's two settings, the Nested menu rule numbers (a) to (e) against rules 1, 8, 10, 11, 14).
4. Shared documents: holds.
5. Standing preferences: holds.
6. Shape and examples: holds; `AppSiteNav` imports exactly its template's directives.
7. Hygiene: holds.

## Drilldown Menu (`specs/drilldown-menu.md`)

Read in full.

1. Class rule: the back suffixes' `show-for-sr` is the one normal class; the mapping's lead sentence said none (change 1).
2. Milestones: holds; Out of Scope's `.show-for-sr` bullet says a later milestone adds the directive without naming it.
3. Cross-spec names: one stale rule number (change 2); the Nested menu slot, `NfsSubmenu.element`, and `NfsMediaQuery.reducedMotion` match.
4. Shared documents: holds.
5. Standing preferences: holds.
6. Shape and examples: holds; `ShopNav` uses `templateUrl`, and its `imports` list the directives its described template writes.
7. Hygiene: holds.

Changes:

1. CSS class to Angular mapping, lead sentence. Before: "the consumer writes none (ADR 0039)." After: "the consumer writes none but the back suffixes' `show-for-sr`, a Visibility class under ADR 0039's exception for a family with no first-milestone spec." (the ADR name is a link in the spec). Reason: the table's own `.show-for-sr` row; audit 0010 L1 made the same fix in the Responsive Menu. Impact LOW, confidence HIGH.
2. Sass, rule 7. Before: "| 7 (new) |". After: "| 7 [13] |". Reason: the bracketed numbers are the Nested menu spec's, and that spec carries the inset focus ring as its rule 13. Impact LOW, confidence HIGH.

## Responsive Menu (`specs/responsive-menu.md`)

Read in full.

1. Class rule: the back suffixes' `show-for-sr` is the one normal class; four sentences still said none or said the suffix used a library directive (changes 1 to 4).
2. Milestones: holds; audit 0009 H1's fixes are in place.
3. Cross-spec names: one stale count (change 5); the hosted roots' inputs, the Breakpoint service calls, and "Dropdown Menu spec decision 13; Drilldown Menu spec decision 18" (ticket decisions 13 and 18 of those spec tickets) match.
4. Shared documents: holds (the Breakpoint service's consuming-directive rules 1 and 4; ADR 0005, 0014, 0035).
5. Standing preferences: holds.
6. Shape and examples: holds; `AppSiteNav` imports exactly its template's directives.
7. Hygiene: holds.

Changes:

1. Opening paragraph. Before: "The consumer writes no Foundation or library class ([ADR 0039]". After: "... of a family with a first-milestone spec ([ADR 0039]". Reason: ADR 0039's note of 2026-09-30. Impact LOW, confidence HIGH.
2. Problem Statement, the classes bullet. Before: "the developer writes none of them, so each needs a typed input, a directive, or a bound state instead". After: "the developer writes none of them but `show-for-sr`, a Visibility class whose family has no first-milestone spec, so each of the others needs ...". Reason: the bullet lists `show-for-sr` among the classes. Impact LOW, confidence HIGH.
3. User story 50. Before: "the back items' hidden suffix written with the library's directives, so that neither needs a Foundation class". After: "a Hybrid toggle's hidden name written with the library's `span[nfsSubmenuToggleText]`, and the back items' hidden suffix with Foundation's `show-for-sr` as a normal class, so that each is hidden the way Foundation's own markup hides it". Reason: D23 decides the suffix is `show-for-sr`; the Drilldown Menu's user story 42 has the same wording. Impact LOW, confidence HIGH.
4. Testing Decisions, first paragraph. Before: "except the copied-class cases, which say so; controls outside". After: "except the copied-class cases, which say so, and the back suffixes' `show-for-sr`, a visibility class whose family has no first-milestone spec; controls outside". Reason: audit 0010 M4 fixed the class-rule test and the fixture route but left this sentence; the Drilldown Menu's same sentence already names it. Impact LOW, confidence HIGH.
5. Sass, item (1). Before: "the Nested menu spec's thirteen". After: "the Nested menu spec's fourteen". Reason: the Nested menu's rules table has rows 1 to 14 (rule 14, the current top-level link, added 2026-09-28). Impact LOW, confidence HIGH.

## Responsive Toggle (`specs/responsive-toggle.md`)

Read in full.

1. Class rule: the Visibility classes it binds are its own behaviour (ADR 0039's note); the hamburger's alternative name may use `show-for-sr`, and the scroller's `overflow-y-scroll` is a Prototype class; two sentences were too broad (changes 1 and 2).
2. Milestones: holds.
3. Cross-spec names: holds (`NfsMotionPair`, `nfsMotionPairClasses`, the Top Bar's directives, `NfsToggle`, the Breakpoint service's consuming-directive rules 1 and 3).
4. Shared documents: holds (building-blocks 1.4, 1.5, 1.6 rule 1, 1.7, 1.10, 1.11 decision 8).
5. Standing preferences: holds.
6. Shape and examples: holds; the usage examples are HTML and SCSS blocks only. The design decisions table has "Decision, Choice, Why" columns and no numbers; building-blocks 1.14 fixes no columns, so it stays.
7. Hygiene: holds.

Changes:

1. Solution. Before: "The consumer writes no Visibility class and no `is-open`:". After: "The consumer writes no Visibility class on the bar or the menu and no `is-open`:". Reason: usage rule 1's scope; the ARIA table lets the hamburger's name use Foundation's `show-for-sr`. Impact LOW, confidence HIGH.
2. CSS class to Angular mapping, binding rule. Before: "No class is left for the consumer to write (ADR 0039)." After: "No class of a family with a first-milestone spec is left for the consumer to write (ADR 0039)." Reason: ADR 0039's note of 2026-09-30. Impact LOW, confidence HIGH.

## Magellan (`specs/magellan.md`)

Read in full.

1. Class rule: the guide example's XY grid classes are normal classes; the mapping lead said "never by the consumer" (change 1).
2. Milestones: holds.
3. Cross-spec names: the Top Bar setting was attributed to the Dropdown Menu spec (change 2); `NfsSmoothScroll`, `NfsSticky`, `stickyOn`, `NfsStickyContainer`, `NfsTopBar`, `NfsTopBarRight`, and `NfsMenu` match.
4. Shared documents: holds (ADR 0012's dated note, 0019, 0029, 0038; building-blocks 1.4, 1.9, 1.11 decisions 1, 6, 7, 9, Part 4 item 3).
5. Standing preferences: holds.
6. Shape and examples: holds; `Guide`, `Landing`, `Docs`, and `InstallGuide` import exactly their templates' directives.
7. Hygiene: one heading without a blank line before it (change 3).

Changes:

1. CSS class to Angular mapping, lead paragraph. Before: "never by the consumer, and the marker is Magellan's own:". After: "never by the consumer, apart from the classes of a family with no first-milestone spec (the XY grid classes of the guide example), and the marker is Magellan's own:". Reason: the table's XY grid row; ADR 0039's note of 2026-09-30. Impact LOW, confidence HIGH.
2. WCAG table, 1.4.3 row, and Sass item 2. Before: "the setting the Spec: Dropdown Menu requires for menus in a Top Bar" and "it is the same line the Spec: Dropdown Menu adds for its Top Bar story" (each a link to ticket 21). After: "the setting the [Spec: Top Bar](../issues/86-spec-top-bar.md) requires for links on the bar" and "it is the [Spec: Top Bar](../issues/86-spec-top-bar.md)'s required setting, set there beside `$topbar-submenu-background: $topbar-background;`". Reason: the Top Bar spec owns the pair and the Storybook override (its D15 and Sass subsection); the Dropdown Menu spec's D14 defers it there. Impact LOW, confidence HIGH.
3. Testing Decisions. A blank line before "### 3. Node-level Vitest". Reason: hygiene. Impact LOW, confidence HIGH.

## Smooth Scroll (`specs/smooth-scroll.md`)

Read in full.

1. Class rule: holds; nothing of a later family is written, so its unqualified sentences are true.
2. Milestones: holds.
3. Cross-spec names: the Magellan composition sketch lacked Magellan's `exportAs` (change 1); `NfsMenu`, `NfsTopBar`, and `NfsMediaQuery.reducedMotion` match.
4. Shared documents: holds (ADR 0008, 0017, 0038; building-blocks 1.4, 1.5, 1.11 decisions 1, 5, 7, Part 4 item 3; Storybook conventions sections 5 and 8).
5. Standing preferences: holds.
6. Shape and examples: holds apart from change 1; `Guide`, `InstallGuide`, and `Checkout` import exactly their templates' directives.
7. Hygiene: holds.

Changes:

1. Usage examples, the `NfsMagellan` sketch. Before: `selector: '[nfsMagellan]',` then `hostDirectives:`. After: `exportAs: 'nfsMagellan',` between them. Reason: [Decide: an exportAs on every directive](../issues/156-decide-exportas-on-every-directive.md); the Magellan spec's API gives `exportAs: 'nfsMagellan'`. Impact LOW, confidence HIGH.

## Amendments

One `### Amendment, 2026-09-30 (consistency review of the later-milestone waves)` at the end of each changed spec's amendment home, one line per change: [Spec: Menu](../issues/85-spec-menu.md), [Re-run: Top Bar spec, out-of-scope survivors](../issues/148-rerun-top-bar-out-of-scope-survivors.md), [Re-run: Nested menu (shared utility) spec under the class rule](../issues/132-rerun-nested-menu-class-rule.md), [Re-run: Drilldown Menu spec under the class rule](../issues/114-rerun-drilldown-menu-class-rule.md), [Re-run: Responsive Menu spec under the class rule](../issues/115-rerun-responsive-menu-class-rule.md), [Re-run: Responsive Toggle spec under the class rule](../issues/116-rerun-responsive-toggle-class-rule.md), [Re-run: Magellan spec under the class rule](../issues/122-rerun-magellan-class-rule.md), and [Re-run: Smooth Scroll spec under the class rule](../issues/121-rerun-smooth-scroll-class-rule.md). The Accordion Menu and Dropdown Menu specs are unchanged and get none.

## Proposals

P1. `building-blocks.md` 1.14, Implementation Decisions item 2. Current text: "State classes as host bindings; no class left for the consumer to write (ADR 0039)." Replacement: "State classes as host bindings; no class left for the consumer to write (ADR 0039), except the Foundation classes of a family with no first-milestone spec, which the consumer writes as normal classes (ADR 0039's note of 2026-09-30)." Why: the spec-shape rule every spec's mapping follows still states the class rule without the exception the user's ruling of 2026-09-30 added, and the specs of this group now state it with the exception (audit 0010 L1, and changes above). Impact LOW (wording of a shape rule), confidence HIGH (the ruling's decision 3 and ADR 0039's note).

## Triage

Every change and the proposal are impact LOW, confidence HIGH: wording brought to the ADR 0039 note, the `exportAs` ruling, and the owning specs' names and numbers, with no input, default, rule, or API changed. Nothing is OPEN FOR HUMAN.

## Verification

A Node script (`review180/a/verify.mjs` in the session scratchpad) checked every file touched: the eight specs, the eight amendment homes, and this report. On the lines each edit added (from `git diff -U0`, and the whole of this new file): no non-ASCII character and no banned word or banned pair. Over each touched spec, and on the added lines of each ticket: every relative link resolves from its file, and every ticket link's text equals that ticket's H1. Over each touched spec: every table row has its header's cell count (code fences skipped), and each file keeps its line endings (all CRLF or all LF, as `git ls-files --eol` reported before the edits). Every intended edit's new text is present and its old text absent (20 spec edits), and each of the eight tickets has exactly one new amendment heading, as its last section. A positive control, a temporary input in the scratchpad with one banned word, one non-ASCII character, one unresolvable link, one wrong ticket title, and one extra-cell row, was found on all five counts before the real run. Result: 275 added lines scanned, 20 edits and 8 amendment headings found, 0 failures, exit 0. `git diff --stat` over the group's files shows only this review's hunks; `accordion-menu.md` and `dropdown-menu.md` are unchanged.
