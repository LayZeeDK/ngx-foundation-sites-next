# 169. Re-run: specs without checks, group e

Type: grilling
Status: resolved
Blocked by: 159
Labels: wayfinder:grilling
Map: ../map.md

## Question

The ruling [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md) has every spec describe, and accept, a library with no checks. What do `specs/responsive-toggle.md`, `specs/reveal.md`, `specs/slider.md`, `specs/smooth-scroll.md`, `specs/sticky.md`, `specs/switch.md`, `specs/table.md`, `specs/tabs.md`, `specs/thumbnail.md` say without them?

## How to work it

Opus 5.5, AFK under the map's triage rule. For each spec, from its extraction manifest in [Task: extract the checks from the specs](159-task-extract-checks-from-specs.md) and a full read: remove every check of the five kinds, its messages, its tests and stories, and every sentence that relies on one (a parent check, a probe, `strictParents`, `nfsDirectiveCheck`, a Runtime check, a Library mixin's `@error`); state each rule a check enforced as documented usage, in the spec's API text, usage section, and the JSDoc it asks for; give each injection token its plain name as its description; keep the Library mixins' CSS rules and Variant properties, the required injections, ARIA, typed inputs, and the library's own tests of its components. No spec names a deferred check or links to a deferred spec; a forgotten import, a part outside its parent, or a misuse simply gets no warning. Each changed spec gets a dated `### Amendment, 2026-09-29 (checks move to a later milestone)` in the ticket that holds its `### Amendment, 2026-09-29 (consistency review)`.

## Answer

Worked AFK on Opus 5.5 (the ticket agent took `specs/responsive-toggle.md`; four forks of it, on the same model and the same written conventions, took Reveal and Thumbnail, Slider and Table, Tabs and Smooth Scroll, and Switch and Sticky). The checklist was the group e manifest, `research/checks-extraction-e.md` at 53144f3; every spec was then read in full. All nine specs now describe and accept a library with no checks. Each spec's governing ticket holds a dated `### Amendment, 2026-09-29 (checks move to a later milestone)` that lists, per check, what left the spec and where its rule now stands, and links [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md):

| Spec | Governing ticket |
| --- | --- |
| [specs/responsive-toggle.md](../specs/responsive-toggle.md) | [Re-run: Responsive Toggle spec under the class rule](116-rerun-responsive-toggle-class-rule.md) |
| [specs/reveal.md](../specs/reveal.md) | [Re-run: Reveal spec under the class rule](110-rerun-reveal-class-rule.md) |
| [specs/slider.md](../specs/slider.md) | [Re-run: Slider spec under the class rule](124-rerun-slider-class-rule.md) |
| [specs/smooth-scroll.md](../specs/smooth-scroll.md) | [Re-run: Smooth Scroll spec under the class rule](121-rerun-smooth-scroll-class-rule.md) |
| [specs/sticky.md](../specs/sticky.md) | [Re-run: Sticky spec under the class rule](120-rerun-sticky-class-rule.md) |
| [specs/switch.md](../specs/switch.md) | [Re-run: Switch spec, out-of-scope survivors](147-rerun-switch-out-of-scope-survivors.md) |
| [specs/table.md](../specs/table.md) | [Spec: Table](92-spec-table.md) |
| [specs/tabs.md](../specs/tabs.md) | [Re-run: Tabs spec under the class rule](108-rerun-tabs-class-rule.md) |
| [specs/thumbnail.md](../specs/thumbnail.md) | [Spec: Thumbnail](97-spec-thumbnail.md) |

### Decisions

1. One shape for documented usage in every spec. Each removed check list becomes a numbered "Usage rules" list at the same place in the API section, introduced as the rules each directive's JSDoc states for its host and the usage examples follow; the API rows, the WCAG rows, the Sass sections, and the decisions table cite the rule by number. Rules on accessibility name their criterion (for example Reveal's "Name the dialog: `aria-labelledby` pointing at its visible title, or `aria-label` (WCAG 4.1.2)"). A breach gets no warning, and no spec says a check existed or moved. Switch also adds the rules as JSDoc comments in its API block.
2. The rules, per spec: Responsive Toggle 5 (no Visibility class or `is-open` in the markup; `hideFor` above the Zero breakpoint; one bar per menu in one template; an `animate` half that starts an animation, written without the `nfs-` prefix; the Visibility classes in the consumer's CSS). Reveal 9 (the nine former checks, same numbers). Slider 7 (at most two Handles; every Handle named; no other writer of a Handle's native value or bounds; the first value at or below the second; no copied Foundation class; every Handle inside `nfsSlider` in one template; the fill a direct child of the slider). Smooth Scroll 3 (host holds an in-page link; every fragment names an element; no bare `#id` link under `<base href>` off the base route). Sticky 6 (`nfsStickyContainer` on the parent; a parent taller than the element; `overflow: clip`, not `hidden`, on a clipping ancestor; no Foundation anchor attributes; `scroll-padding` for a stuck element; `stickyOn` over the Breakpoint map's names). Switch 7 (checks 1 to 6 and the copied-class warning). Table 4 on `NfsTable` and 1 on `NfsTableScroll`. Tabs 6 (the parts' nesting; a tab as the direct child of `li[nfsTabsTitle]` without `href`; a named tab list; consumer panel ids under `deepLink`; `autoFocus` never static; the input to bind for each copied class). Thumbnail 3 (a text alternative; a linked thumbnail with a real `href` and a name; the directive on the link, never inside a plain link).
3. Required injections stay, with NG0201 as Angular's report: `NfsSliderHandle` on `nfsSliderToken`; the Tabs parts on Aria's `TABS` and `TAB_LIST` and on `nfsTabsGroupToken` and `nfsTabsToken`. The compile errors of a required reference stay as typed-input errors (Responsive Toggle: NG8003 at `#menu="nfsResponsiveToggleMenu"`, NG8002 at `[nfsResponsiveToggle]="menu"`).
4. Every token's description is its plain name: `nfsRevealToken`, `nfsSliderToken`, `nfsTabsGroupToken`, `nfsTabsToken` (`new InjectionToken<NfsSlider>('nfsSliderToken')`).
5. Development-only code that existed only for a check is gone with it: the `HostAttributeToken('class')`, `HostAttributeToken('autoFocus')`, and `HostAttributeToken('type')` field initialisers (Responsive Toggle, Reveal, Slider, Switch, Table, Tabs), `NfsSliderFill`'s optional `nfsSliderToken` lookup (the fill now injects nothing), Smooth Scroll's first-render callback (the directive uses no render hook), Thumbnail's render callback and injections, Sticky's development `focusin` listener, and `ElementRef` in Switch and Table. Behaviour stays: class records still strip copies, a Motion phase with no animation still completes at once, Reveal's restore-focus chain still runs (with no usable target, focus is not moved, and the browser-level test asserts that).
6. Build-time checks: every Library mixin keeps its CSS rules and loses its `@error` and `@warn`; each checked pair is now a required setting in the Sass section and a "documented usage" line in the WCAG row (Reveal's close glyph and dialog edge; Slider's fill, thumb, and focus ring, whose rule 0a leaves the rules table with a gap in its numbering; Switch's item (d); Table's rule 1(b); Tabs' strip pairs; Responsive Toggle's breakpoint arguments). Sass's own missing-argument error for `@include nfs-responsive-toggle;` stays, as the mixin's signature. The library's internal contrast helper is no longer named; the specs' figures still use the exact WCAG formula.
7. Tabs: `nfs-tabs` is no longer required for every strip, because only its compile stops made it so; a plain strip needs nothing from it, and an application that uses neither `simple` nor `primary` may leave it out. Its CSS is unchanged.
8. Responsive Toggle: its usage stylesheet and story preamble no longer include `nfs-title-bar` and `nfs-top-bar`, which the Top Bar spec at 53144f3 (its D7) gives checks only and no CSS; the title bar's contrast is cited as the Top Bar spec's documented settings.
9. Decisions tables keep their D-numbers. Rows whose decision was a check are rewritten to the documented usage; three rows had nothing left to decide and are removed, leaving gaps: Switch D19 (the tie of check 6 to the In-family probe) and Table D8 (the stacked header and footer warning) and D12 (the copied-class warning). No other record cites the three (searched). Rejected alternatives that named a check are reworded or dropped.
10. User stories keep their numbers. A story that asked for a warning now asks for the documented rule, or for the behaviour it protects; none is deleted.
11. Stories: every story stays, `sticky--overflow-hidden-ancestor` included (it shows behaviour); only warning assertions left the play functions. Each spec's four test layers lose their development-check cases, the `strictParents` throw, and the compile-stop Sass cases; Sass compile tests of emitted CSS stay. Aria's own diagnostics (the Tabs duplicate-value warning, the panel without `ngTabContent`) and Angular's (`NgOptimizedImage`'s NG02952, NG05xx, `ngDevMode.componentsSkippedHydration`) stay.
12. Out of Scope lines that only said a check was absent or owned elsewhere are removed; a line with a real scope statement keeps it without the check (Responsive Toggle: keeping the Breakpoint map equal to the Sass `$breakpoints` is the Breakpoint service spec's documented usage).
13. Caveat, recorded in the specs as the ruling accepts: where axe has no rule, some pairs now have no automated library test, only the stories compiling with passing settings: Slider's fill and thumb against the track (1.4.11) and its focus-ring colour (2.4.7), Reveal's close glyph and dialog edge (1.4.11), and Table's hover and footer pairs (1.4.3, which axe sees only at rest). A consumer who changes those settings meets the rule as documented usage.

### Triage

Every call above is rated impact LOW (development-only diagnostics and wording; no public input, output, selector, or token name changes; the Tabs and Responsive Toggle Sass narrowing only drops includes that emitted nothing a component needs) and confidence HIGH (the user's ruling in ticket 158; the manifests; the Top Bar spec's D7 for decision 8; a search for citations for decision 9). Nothing is OPEN FOR HUMAN.

### Finds the manifest missed (for the deferred specs)

The group e manifest listed each spec's own checks; these are the rest. Each is removed or rewritten in its spec. A check owned by another spec goes into the deferred spec once, from its owner's entry; its author confirms the owner's manifest holds it and otherwise takes it from the owner spec at 53144f3.

- Quoted checks of other specs:
  - Top Bar: `nfsMenuIcon`'s development checks 1 to 4 (misuse), `nfs-title-bar`'s compile stops on `$titlebar-color`, `$titlebar-icon-color`, and `$titlebar-icon-color-hover`, `nfs-menu-icon`'s dark-icon `@warn`, and `nfs-top-bar`'s `$anchor-color` compile stop and its transparent-bar composite (build-time), quoted by Responsive Toggle, Thumbnail (the missing-name check), and Sticky (the 1.4.3 row).
  - Breakpoint service: the unknown-name warning behind `hideFor` and `stickyOn` (misuse), and `strictBreakpointSync`, the "drift check" (runtime), quoted by Responsive Toggle and Sticky (D4).
  - Close Button: `strictVariantProperties` (runtime), its name checks (misuse), and the glyph `@error` against `$body-background` with the rule that each container checks its own background (build-time), quoted by Reveal and Thumbnail.
  - Off-canvas: `nfs-off-canvas`'s glyph compile stop (build-time), quoted by Reveal's 1.4.11 row and D19.
  - Button: the placeholder-link warning (misuse), quoted by Thumbnail's D4, and the copied-class check (its D22), quoted by Table's D12.
  - Triggers: the typeless-button-in-a-form warning (misuse), quoted by Thumbnail's D8.
  - Forms: the help-text check, quoted by Switch's "Beside Angular Forms" bullet.
  - Accordion: dev check 7 (misuse), quoted by Tabs' copied-class paragraph and D24.
  - Progress Bar: its exact-formula Sass test (build-time), cited as prior art in Switch's Testing Decisions.
- Tests the manifest did not list: Tabs' node-level "copied-class test per directive" (misuse; take it from Tabs at 53144f3) and its Sass compile assertions that the compile stops under Foundation's defaults and at `$tab-content-background: $primary-color` (build-time); Slider's and Table's SSR-smoke assertions that no development warning is logged.
- Machinery the manifest did not list: Smooth Scroll's first-render `afterNextRender`, which only ran its three checks (misuse); Reveal's Render hooks row for the checks and its pre-hydration static-class read; Thumbnail's injection line.
- Mentions only, removed: Tabs' Solution, Sass and custom CSS, and Sass item (5) ("stops the compile ..., so every application with a tab strip includes it"); Slider's 2.4.7 row, Sass and custom CSS, rule 6, D26, Sass (5), an Out of Scope line, and the story-gate sentence (all rule 0a), and "More than two handles is a dev-mode error"; Table's Solution and Foundation-behaviour lines on the compile stop, and its Material comparison's name-check row; Switch's intro and its D9, D10, and custom-size notes; Sticky's Foundation contract line and measurement step 1; the disclaimers "no part in the Runtime checks", "nothing for the runtime check to read", and "adds nothing for the runtime checks to read" in Reveal, Slider, Table, Tabs, and Smooth Scroll; user stories Responsive Toggle 38, Reveal 34, Slider 29, 41, 45, Table 15, Thumbnail 10, 13.
- Declined checks a deferred spec may record as rejected candidates: Thumbnail's Out of Scope lines on a clipping ancestor, an NG02952 predictor, and a 2.5.8 size check, and the rejected check alternatives in its D5 and D7.
- Kept as the library's own test, not a check: Slider's typings assertion over `NfsVariantBoolean` (the Variant typings check, per the orchestrator's boundary note).
- For the Top Bar re-run: with their checks gone, `nfs-title-bar` and `nfs-top-bar` emit nothing; whether they remain is that spec's call. Responsive Toggle and Sticky no longer name them.

### Proposed shared-document changes (for [Task: shared documents for the later-milestone checks](171-task-shared-documents-later-milestone-checks.md))

Quoted text is written relative to its target file.

`building-blocks.md`:

- 1.4, `insertion` kind: replace "and the directive reports a static attribute in development through `HostAttributeToken`, as the Dropdown pane's check 6 does." with:

  > and states as a usage rule in the directive's JSDoc that the attribute is never written statically (the Tabs spec's usage rule 5, the Reveal spec's usage rule 9).

- 1.4, initial state: replace "each such directive reads its host's static `class` through `HostAttributeToken` in development builds only and warns once, naming the input to bind ([Spec: Accordion](issues/15-spec-accordion.md), dev check 7)" with:

  > each such spec names the input to bind in a usage rule

  and "is reported the same way, naming what replaces it (the Tooltip's legacy position classes; the Slider Handle's `slider-handle`, whose Foundation rules still reach the input, [Spec: Slider](issues/32-spec-slider.md), development check 5)" with:

  > is named by a usage rule the same way, with what replaces it (the Tooltip's legacy position classes; the Slider Handle's `slider-handle`, whose Foundation rules still reach the input, [Spec: Slider](issues/32-spec-slider.md), usage rule 5)

  and "strips a copied State class the same way and does not report it, because the copy expresses no state the consumer could have bound" with:

  > strips a copied State class the same way

- 1.5, ids: replace "the deep-linking inputs warn in dev mode when the id was generated." with:

  > the deep-linking inputs state it as a usage rule (the Reveal spec's usage rule 4, the Tabs spec's usage rule 4).

- 1.6 rule 4: replace "maps to no class in either direction and is reported in development" with:

  > maps to no class in either direction, so its phase completes at once; the specs state the one-entering-one-leaving shape as a usage rule

- 1.9, parent handle: replace "`{optional: true}` with a dev-mode `reportViolations`-style warning when the child may stand alone" with:

  > `{optional: true}` when the child may stand alone

  and, in the forgotten-imports bullet, "every parent token's description names, in development builds only, the directive that provides it, its entry point, and the same-template rule" with:

  > every parent token's description is its plain name (`new InjectionToken<NfsSlider>('nfsSliderToken')`)

- 1.10, WCAG: replace "where axe has no rule, the mixin checks at compile time with the exact WCAG relative-luminance formula, computed by one library-internal Sass helper with `math.pow` that composites a translucent colour over `$body-background` first" with:

  > where axe has no rule, the spec states the required settings, with ratios from the exact WCAG relative-luminance formula, a translucent colour composited over `$body-background` first

- 1.10, names: replace "the consumer's own `aria-labelledby` or `aria-label` attribute, checked in development" with:

  > the consumer's own `aria-labelledby` or `aria-label` attribute, a usage rule of the spec

- 1.10, target size and non-text contrast: replace "and a compile-time `@error` computed with the exact unrounded ratio (the WCAG contrast rule above) for colour pairs that carry state" with:

  > and required settings stated with the exact unrounded ratio (the WCAG contrast rule above) for colour pairs that carry state

  and delete "A plugin whose only custom Sass is such a check still gets a Library mixin that emits no CSS (Abide's `nfs-abide`, added by the [Consistency review and bundle index](issues/36-consistency-review.md))."

- 1.10, Close Button: replace "checks the same two settings against that background (Reveal, Off-canvas, Callout)" with:

  > states the same two settings against that background as required settings (Reveal, Off-canvas, Callout)

- Table B, Reveal row: replace "a value that starts no animation warns in development;" with:

  > a value that starts no animation completes its phase at once;

- Table A, Slider row: remove "`HostAttributeToken('class')` in development builds only (copied classes), ".
- The Thumbnail bullet under 1.10: replace "`NfsThumbnail` warns in development." with:

  > the docs put the directive on the link (the Thumbnail spec's usage rule 3).

- The Table bullet under 1.10: replace "so `nfs-table` stops the compile unless `$show-header-for-stacked: true` and keeps the footer with one rule (...). It also stops the compile when text or a link is under 4.5:1 on any table background:" with:

  > so `$show-header-for-stacked: true` is a required setting and `nfs-table` keeps the footer with one rule (...). Text and links must reach 4.5:1 on every table background, a required ratio the Table spec lists pair by pair:

- Table D, Table row: delete "development checks in render callbacks (a missing table or region name, a stacked table whose header or footer computes `display: none`, both stripe inputs, copied classes); " and replace "compile-time checks: `$show-header-for-stacked: true` required, text and links at 4.5:1 on every table background" with:

  > required settings: `$show-header-for-stacked: true`, text and links at 4.5:1 on every table background

- Table D, Thumbnail row: replace "development text-alternative, link `href` and name, and thumbnail-inside-a-link checks in one `afterNextRender`;" with:

  > usage rules for the text alternative, the link's `href` and name, and a thumbnail inside a link;

`storybook-conventions.md`, `preview.scss` and `_settings-overrides.scss` comments:

- `@include nfs-table;`:

  > @include nfs-table; // Table: the stacked footer; every table--* story

- `@include nfs-switch;`:

  > @include nfs-switch; // Switch: the focus ring, forced colours, and reduced motion; every switch--* story

- The Tabs override comment: replace "and nfs-tabs stops the compile on both." with:

  > and the Tabs spec requires both lines.

- The Switch override comment: replace "nfs-switch stops the compile." with:

  > the Switch spec requires the setting.

- The Slider override comment: replace "nfs-slider stops the compile on Foundation's fill against its track" with:

  > Foundation's fill fails against its track

- The stacked-table override comment: replace "and nfs-table stops the compile." with:

  > a required setting of the Table spec.

- Section 9: replace "TestBed-only cases (DI overrides, `DeferBlockBehavior.Manual`, dev-mode warnings, replay-shaped events): layer 2;" with:

  > TestBed-only cases (DI overrides, `DeferBlockBehavior.Manual`, replay-shaped events): layer 2;

- The `nfs-title-bar` and `nfs-top-bar` include lines and the Top Bar override comment ("and nfs-top-bar stops the compile") follow the Top Bar re-run's decision; the Responsive Toggle stories need neither mixin.

ADRs: [ADR 0022](../adr/0022-wcag-2-2-aa-enforcement.md) gets a dated note like the ones ticket 171 gives the other ADRs, because the Tabs spec's D26 cited its first consequence (a compile error or warning from the library's mixin that names the setting):

> 2026-09-29 ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)): in the first milestone a failing Foundation default is a required setting that the spec's Sass subsection and WCAG row state; the compile-time signal of the first consequence is specified by the build-time checks spec and planned for a later milestone.

Glossary (`CONTEXT.md`), offered so ticket 171 can use one name across the groups:

> **Usage rule**: a rule of documented usage a spec states for a directive's host, numbered in its API section and stated in the directive's JSDoc; the usage examples follow it. In the first milestone the library reports no breach.

README: nothing; the group e rows name no check.

### Verification

`scratchpad/wave158/169/verify.mjs` (outside the bundle) scans the nine specs, the nine governing tickets, and this ticket for non-ASCII characters, the banned words, relative links that do not resolve (skipping fenced code, blockquotes, and gist and proposal sections, which are written relative to their target file), table rows whose cell count differs from the header, line endings against those measured before editing, and, in the specs, the brief's terms (`nfsDirectiveCheck`, `strictDirectiveImports`, `strictParents`, `In-family`, `Forgotten import`, `forgotten import`, `Selector manifest`, `nfsReportForgottenPeer`, `Runtime check`, `@error`, `@warn`, `dev check`, `development check`, `Dev-mode check`, `development warning`, `console.warn`, `sync:check`, `missing-imports`), the five deferred spec file names, links to tickets 150, 157, and 160 to 164, `provideNfsRuntimeChecks`, `NFS9001`, `strictBreakpointSync`, and "later milestone"; it also checks each governing ticket's amendment. Every scan has a positive control, and a scan that errors fails the run. It passes: no spec keeps any of the brief's terms. Kept hits of wider wording, reviewed: Tabs' "development build" of the e2e fixture app, Aria's own dev-mode warnings in Tabs, Angular's NG02952 in Thumbnail, and `ngDevMode.componentsSkippedHydration` in the hydration cases.

### Gist for Decisions so far

- [Re-run: specs without checks, group e](issues/169-rerun-specs-without-checks-group-e.md) -- the Responsive Toggle, Reveal, Slider, Smooth Scroll, Sticky, Switch, Table, Tabs, and Thumbnail specs describe and accept a library with no checks: each former check list is a numbered list of usage rules in the API section that the directives' JSDoc states; required injections keep NG0201 as Angular's report, tokens take their plain names, the Library mixins keep their CSS and state their former compile stops as required settings, development-only reads that served only checks are gone, D-numbers and story numbers stay (Switch D19 and Table D8 and D12 removed), and `nfs-tabs` is needed only for `simple` and `primary`; each governing ticket's dated amendment lists what left, and the other specs' checks the specs quoted go to the deferred specs from their owners; impact LOW, confidence HIGH. Specs: [specs/responsive-toggle.md](specs/responsive-toggle.md), [specs/reveal.md](specs/reveal.md), [specs/slider.md](specs/slider.md), [specs/smooth-scroll.md](specs/smooth-scroll.md), [specs/sticky.md](specs/sticky.md), [specs/switch.md](specs/switch.md), [specs/table.md](specs/table.md), [specs/tabs.md](specs/tabs.md), [specs/thumbnail.md](specs/thumbnail.md).
