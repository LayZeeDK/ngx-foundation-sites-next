# Consistency review of the later-milestone waves: group e (CSS-only components)

Ticket: [Consistency review: the later-milestone waves](../issues/180-consistency-review-later-milestone-waves.md), group e

Reviewer: Opus 5.5, 2026-09-30. Scope: seven first-milestone specs of CSS-only components. The seven checks are the ticket's; ratings follow the map's triage rule (Orchestration rules, "Triage of human-only items").

## What was read

- In full: the ticket; `map.md` lines 1 to 163; [Consistency review: the class-rule wave](../issues/133-consistency-review-class-rule-wave.md); the rulings of tickets 156, 157, 158, and 174; [Audit 0009: the later-milestone checks wave](../audits/0009-later-milestone-checks-wave.md) and [Audit 0010: the later-milestone families wave](../audits/0010-later-milestone-families-wave.md); the seven specs of the group, every line; `building-blocks.md` 1.2 to 1.14 (lines 24 to 278, in parts because of the file's size); the preview stylesheet and the settings overrides of `storybook-conventions.md` (lines 88 to 126 and 196 to 255).
- Searched, not read in full: the other parts of building-blocks; ADRs 0012, 0018, 0022, 0039, and 0040 (their dated notes, by search); `CONTEXT.md` (the sixteen glossary entries the group's specs add or name); and the owning specs of every name the group takes from another spec (Card, Callout, Button, Button Group, Top Bar, Menu, Badge, Slider, Forms, Accordion, Abide, Toggler, Triggers, Equalizer, Interchange, Reveal, Close Button, Breakpoint service, Variant declaration tooling, build-time checks), each at the rows or lines the group cites.

## Media Object (`specs/media-object.md`)

1. Class rule: holds. The only consumer-written classes are Foundation's flex helper classes (`align-self-middle`, `align-middle`), a family with no first-milestone spec (ADR 0039's note of 2026-09-30); every other class in markup is rendered output or a labelled test case.
2. Milestones: holds. No check is named or relied on (the "library's build assertion" of the `stackFor` bullet is the Variant typings check, the library's own gate, which stays in the first milestone); no deferred spec is linked; the XY grid and Flexbox Utilities appear only as Foundation's classes.
3. Cross-spec names: holds. `NfsThumbnail` (`[nfsThumbnail]`), `nfsBreakpointsToken` and `nfsBreakpointForWidth` in `ngx-foundation-sites/media-query`, `NfsClassBreakpoint`, `NfsVariantBoolean`, `nfsVariantBoolean`, `NfsBreakpointClassesOverrides`, the Top Bar's and Button Group's `stackedFor`, the Top Bar's D2, and the Menu's D11 match their owners.
4. Shared documents: one citation did not resolve (change 1). The rest hold: building-blocks 1.2, 1.4 (rules 3 and 4, the Zero-breakpoint read, Defaults tokens), 1.6 rule 2, 1.7, 1.12, 1.13, ADR 0012's dated note, and the glossary's Media Object, Main section, and Flexbox mode.
5. Standing preferences: holds (versions, native level with its reason, rendering modes, WCAG 2.2 AA, the animation rule, the four layers).
6. Shape and examples: holds. Seven sections in order, the Material comparison under Implementation Decisions, the design decisions under Further Notes; `app-avatar` imports exactly `NgOptimizedImage` and `NfsThumbnail`.
7. Hygiene: holds.

Change 1. The `stackFor` input row and D2 (two places) cited "building-blocks 1.4 rule 5"; building-blocks 1.4 numbers its naming rules 1 to 4 and states the `<words>-for-<bp>` rule in the unnumbered paragraph after rule 4. Before: "Foundation's words `stack-for` kept (building-blocks 1.4 rule 5)", "Building-blocks 1.4 rule 5 keeps Foundation's words", "(rule 5 puts the breakpoint in the value". After: "(building-blocks 1.4, the responsive-form rule)", "Building-blocks 1.4's responsive-form rule keeps Foundation's words", "(that rule puts the breakpoint in the value". Rating: impact LOW (a citation), confidence HIGH.

## Pagination (`specs/pagination.md`)

1. Class rule: holds. `text-center` (a family with no first-milestone spec) is the only written class; the copied `current` and `disabled` markup is labelled as the case the documented usage never writes, and the docs-to-library pairs are labelled.
2. Milestones: holds. Documented usage replaces every check; the Out of Scope bullet for `.text-center` and `.show-for-sr` names no directive of a later family.
3. Cross-spec names: holds (the Menu's ADR 0042 reading and Router reading, the Button's ADR 0011 contract, the Badge's Sass compile test and D6, the Breadcrumbs link).
4. Shared documents: holds. Building-blocks 1.3 carries the `NfsPaginationEllipsis` rule D2 says it gained; 1.10's exact-formula, target-size, and Pagination bullets match; 1.11 decision 6 matches.
5. Standing preferences: holds.
6. Shape and examples: holds. `ResultsPagination` and `InvoicePager` import exactly the directives their templates write. The design decisions skip D11, and nothing refers to a D11.
7. Hygiene: holds.

No change.

## Breadcrumbs (`specs/breadcrumbs.md`)

1. Class rule: holds in the markup; two sentences stated it without the exception (change 2).
2. Milestones: holds. The Out of Scope bullet for `.show-for-sr` says a later milestone adds the directive.
3. Cross-spec names: holds (the Pagination's landmark rule and D4, the Menu's Router reading, the Forms' `#737373`, the Accordion's D18 on generated-content alternative text, the Button's and Slider's `disabled` State inputs).
4. Shared documents: holds (building-blocks 1.3, 1.4, 1.9, 1.10's Breadcrumbs, Current page, and target-size bullets, ADR 0042, the glossary's Breadcrumbs, Disabled step, and Current link; the Storybook overrides comment matches the Sass subsection's).
5. Standing preferences: holds.
6. Shape and examples: holds; `FeatureTrail` imports `NfsBreadcrumbs`, `NfsBreadcrumbsItem`, and `RouterLink`.
7. Hygiene: holds.

Change 2. The Problem Statement's bullet and the class mapping's last paragraph stated the class rule with no exception, beside the `.show-for-sr` row that lets the consumer write that class. Before: "the developer writes no Foundation or library class, so" and "No class is left for the consumer to write (ADR 0039)." After: "the developer writes no Foundation or library class of a family with a first-milestone spec, so" and "No class of a family with a first-milestone spec is left for the consumer to write (ADR 0039)." Reason: ADR 0039's note of 2026-09-30 and the map's Later-milestone families ruling, in audit 0010's L1 wording. Rating: impact LOW, confidence HIGH.

## Progress Bar (`specs/progress-bar.md`)

1. Class rule: holds in the markup; the Problem Statement stated the rule without the exception (change 3).
2. Milestones: holds (the exact-contrast helper is a Library mixin rule, which stays, as audit 0009's Verified OK item 9 records).
3. Cross-spec names: holds (`#bf3f2c` in the Button, Abide, Badge, and Label specs; the Callout's D8, Notes, and "the text says its kind" rule; the Slider's forced-colours rule 13 and release test; the Top Bar's measurement of `color-luminance()`; `NfsButton`; `nfs-callout` writing `--nfs-foundation-palette`; `NfsFoundationPaletteColor` and `NfsFoundationPaletteOverrides` in the primary entry point).
4. Shared documents: holds for building-blocks 1.3, 1.4, 1.9, 1.10's Progress Bar and forced-colours bullets, 1.13, ADR 0022's note of 2026-09-28, ADR 0039's note on native `<progress>`, and the glossary's Progress Bar, Progress meter, and Visible value. One mismatch sits in the Storybook conventions (P1).
5. Standing preferences: holds.
6. Shape and examples: holds; `Upload` imports `DecimalPipe`, `NfsButton`, `NfsProgress`, and `NfsProgressMeter`, exactly what its template writes.
7. Hygiene: holds.

Change 3. Before: "the developer writes no Foundation class at all, so `.progress`". After: "the developer writes no Foundation class of a family with a first-milestone spec, so `.progress`". Reason: the same as change 2; audit 0010's L1 made this edit in the Media Object and Responsive Embed specs and not here. Rating: impact LOW, confidence HIGH.

## Table (`specs/table.md`)

1. Class rule: holds in the markup; two sentences stated the rule without the exception (change 4).
2. Milestones: holds. D16 and the Notes name the XY Grid only as what a later milestone adds; the first-milestone cell-block recipe writes Foundation's classes.
3. Cross-spec names: holds (the Progress Bar's D12, the Callout's `$anchor-color` lines and four greys, ticket 81's title, the Card's figures).
4. Shared documents: D5 cited a building-blocks rule that is gone (change 6); 1.10's Table, Scroll regions, and measured-pair bullets, 1.13's settings rule, ADR 0039's note on `<table>`, and the glossary's Table, Scroll region, and Stacked table hold. Building-blocks 1.10 does not carry the Table's D17 (P2).
5. Standing preferences: holds.
6. Shape and examples: holds; `Orders` imports `CurrencyPipe`, `RouterLink`, and `NfsTable`. The design decisions skip D8 and D12, and nothing refers to either.
7. Hygiene: holds.

Change 4. Before: "the developer writes no Foundation class at all, so `.hover`" and "No class is left for the consumer to write (ADR 0039)." After: "the developer writes no Foundation class of a family with a first-milestone spec, so `.hover`" and "No class of a family with a first-milestone spec is left for the consumer to write (ADR 0039)." Reason: the Notes' cell-block bullet has the consumer write the XY Grid's classes; ADR 0039's note of 2026-09-30, audit 0010's L1 wording. Rating: impact LOW, confidence HIGH.

Change 5. Audit 0010's M6 added D17 (the four typography greys) to the 1.4.3 row and the Sass subsection only; three places still counted the old settings. Solution, before: "it asks for the darker `$anchor-color` the Callout already requires." After: "it asks for the darker `$anchor-color` the Callout already requires, and for the four typography greys at `#666666` that the Callout and the Card require (D17)." User story 18, before: "in three lines I may already have for the Callout"; after: "with lines I may already have for the Callout". Testing Decisions, before: "carry this spec's required setting and the Callout's `$anchor-color` lines (Sass subsection)"; after: "carry this spec's required settings (Sass subsection: `$show-header-for-stacked`, the Callout's `$anchor-color` lines, and the four greys of D17)". Reason: the spec's own D17 and Sass subsection, as audit 0010's L2 corrected the same counts in the Callout and Card. Rating: impact LOW, confidence HIGH.

Change 6. D5's rationale, before: "building-blocks 1.13's flag-gated property exists for classes whose absence changes the look"; after: "and building-blocks 1.13 gives a family that a Sass flag gates no Variant property". Reason: building-blocks 1.13 now says "A family that a Sass flag gates writes no Variant property"; the flag-gated properties became presence markers of the later milestone (`specs/build-time-checks.md`, under [Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)). The decision itself is unchanged. Rating: impact LOW, confidence HIGH.

## Thumbnail (`specs/thumbnail.md`)

1. Class rule: holds in the markup (the gallery's XY Grid classes and `.hide` are a family with no first-milestone spec); two sentences stated the rule without the exception (change 7).
2. Milestones: holds (NG02952 is Angular's own warning; the XY Grid appears only as Foundation's classes and "a later milestone adds the XY Grid's directives").
3. Cross-spec names: holds (the Toggler's multiple-targets example with `animate` and `#thumb1="nfsToggler"`, its D3; the Triggers' `[nfsOpen]` and `[nfsToggle]`; `nfsEqualizerWatch`; the Card's D6 and figures 4.647:1 and 5.920:1; the Close Button's `type` input; `nfsButton` on `button` and `a`; the Interchange's design decision 18; the Card, Sticky, Toggler, and Media Object writing `img[nfsThumbnail]`).
4. Shared documents: holds (building-blocks 1.2, 1.3, 1.6 rule 2, 1.10's hidden, Names, Thumbnail, and axe-limits bullets, 1.11 decision 5, the glossary's Thumbnail and Linked thumbnail).
5. Standing preferences: holds.
6. Shape and examples: holds; `Avatar` imports `NgOptimizedImage` and hosts `NfsThumbnail`.
7. Hygiene: holds.

Change 7. Before: "the developer writes no Foundation class at all, so `.thumbnail`" and "No class is left for the consumer to write (ADR 0039)." After: "the developer writes no Foundation class of a family with a first-milestone spec, so `.thumbnail`" and "No class of a family with a first-milestone spec is left for the consumer to write (ADR 0039)." Reason: the gallery and the hiding rule write the XY Grid's classes and `.hide` as normal classes; ADR 0039's note of 2026-09-30, audit 0010's L1 wording. Rating: impact LOW, confidence HIGH.

## Responsive Embed (`specs/responsive-embed.md`)

1. Class rule: holds; audit 0010's L1 already qualified its two class-rule sentences.
2. Milestones: holds.
3. Cross-spec names: holds (the Variant declaration tooling's `NfsResponsiveEmbedRatiosOverrides` row, `mixins`, and `uses` entry; `NfsOverridableStringUnion`; the Callout's `size` rule and D11; the Card's image measurement; the Reveal's `player.example` URLs; ticket 79's title).
4. Shared documents: holds (building-blocks 1.2, 1.4, 1.10's Names and Responsive Embed bullets, 1.11's hydration facts, ADR 0022's note of 2026-09-28, the glossary's Responsive Embed and Embedded element).
5. Standing preferences: holds.
6. Shape and examples: holds; `VideoEmbed`'s template writes no library directive and imports none.
7. Hygiene: holds.

No change.

## Amendments

One dated `### Amendment, 2026-09-30 (consistency review of the later-milestone waves)` at the end of [Spec: Media Object](../issues/91-spec-media-object.md), [Spec: Breadcrumbs](../issues/88-spec-breadcrumbs.md), [Spec: Progress Bar](../issues/95-spec-progress-bar.md), [Spec: Table](../issues/92-spec-table.md), and [Spec: Thumbnail](../issues/97-spec-thumbnail.md). Pagination and Responsive Embed are unchanged and get none.

## Proposals

### P1. The preview stylesheet includes the three Foundation mixins the Slider and Progress Bar specs ask for

- File: `storybook-conventions.md`, the preview stylesheet block (lines 100 to 102).
- Current text:

  ```
  // @include foundation-range-input; // Slider: every slider--* story
  // @include foundation-progress-element; // Progress Bar: progress-bar--native-progress and progress-bar--right-to-left (element selector; no other story renders <progress>)
  // @include foundation-meter-element; // Progress Bar: progress-bar--native-meter (element selector; no other story renders <meter>)
  ```

- Replacement:

  ```
  @include foundation-range-input; // Slider: every slider--* story
  @include foundation-progress-element; // Progress Bar: progress-bar--native-progress and progress-bar--right-to-left (element selector; no other story renders <progress>)
  @include foundation-meter-element; // Progress Bar: progress-bar--native-meter (element selector; no other story renders <meter>)
  ```

- Why: the Progress Bar spec's Testing Decisions says "the preview includes `foundation-progress-element`, `foundation-meter-element`, and `nfs-progress-bar`", and the conventions' own line 267 says `foundation-everything` lacks these three mixins, "which the Slider spec adds, and ... which the Progress Bar spec adds". The three lines are still commented out from the file's first form, when the heading comment above them showed the format of a line; `foundation-grid`, once in the same list, was moved and uncommented, and the `nfs-*` includes below are live. As written, a preview built from the block gives native `<progress>`, `<meter>`, and range inputs no Foundation styles, so the stories those three specs name would not show what their play functions assert. Rating: impact LOW (a Storybook preview line), confidence HIGH.

### P2. Building-blocks 1.10 names the Table among the containers that require the four greys

- File: `building-blocks.md` 1.10, the Table bullet (line 192) and the Typography Helpers bullet (line 189).
- Current text (Table bullet, its last sentence): "Text and links must reach 4.5:1 on every table background, a required ratio the Table spec lists pair by pair: Foundation's links reach only 3.97:1 to 4.45:1 on seven of the eight, so the consumer sets the Callout's `$anchor-color`."
- Replacement: "Text and links must reach 4.5:1 on every table background, a required ratio the Table spec lists pair by pair: Foundation's links reach only 3.97:1 to 4.45:1 on seven of the eight, so the consumer sets the Callout's `$anchor-color`, and a `cite`, a `blockquote`, a `.subheader`, or a heading `small` in a cell needs the four typography greys at `#666666` (the Table's D17)."
- Current text (Typography Helpers bullet, its last sentence): "In the first milestone a heading `small`, a `blockquote`, a `cite`, and a `.subheader` written as a normal class still show on callouts and cards, so the Callout (D17) and Card (D14) specs require the same four greys at `#666666` themselves"
- Replacement: "In the first milestone a heading `small`, a `blockquote`, a `cite`, and a `.subheader` written as a normal class still show on callouts, cards, and tables, so the Callout (D17), Card (D14), and Table (D17) specs require the same four greys at `#666666` themselves"
- Why: audit 0010's M6 added the Table's D17 and brought `storybook-conventions.md` and the map's base-styles line up to date, but not building-blocks, which still names only the Callout and the Card; the implementer reads building-blocks. The rest of the Typography Helpers sentence (its link to ticket 176) stays as it is. Rating: impact LOW (a shared-document restatement of a decided requirement), confidence HIGH.

## Verification

A Node script (`review180/e/verify.mjs` in the session scratchpad) checked the ten edited files and this report, with a positive control appended at run time (a banned word, a non-ASCII character, an unresolved link, and a row with an extra cell, each of which it must report, exiting 1). Checked: the 45 lines these files added (from `git diff`) and the whole report are ASCII and free of the banned words and the banned pair; every relative link in the seven specs and this report, and in the lines added to the five amendment homes, resolves from its file, and every ticket link's text equals the ticket's H1 (the homes' older gist lines and quoted proposals, written relative to their target documents, were not re-checked); every table row in the five changed specs has its header's cell count; each of the 19 intended edits (14 replacements in the specs, 5 amendments, each the last section of its home) is present and each replaced text is gone. Result: 0 problems, exit 0; the control run reports exactly its four planted faults and exits 1.
