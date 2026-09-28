# 90. Spec: Card

Type: grilling
Status: resolved
Blocked by: 81
Labels: wayfinder:grilling
Map: ../map.md

## Question

What Angular directives (preferred) or components give Foundation for Sites 6.9's Card to the next, from-scratch ngx-foundation-sites repo, under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Foundation's docs page is `docs/pages/card.md` and its Sass is `scss/components/_card.scss` in the 6.9.0 clone. Publish `specs/card.md`.

Known from the triage: Card divider, section, and image parts; no default roles.

## How to work it

Run `/grill-with-docs` (self-grilling, both sides) over the questions this component raises, then publish with `/to-spec` in the map's spec shape; the [Spec: Button](37-spec-button.md) is the nearest precedent. Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this component); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Cover: one directive per Structural class and what else each owns (the ARIA, `type` default, or development and compile-time checks the documented markup lacks for WCAG 2.2 AA, ADR 0022); every Variant as a typed input by the decision above; State classes as host bindings; the Sass mixin only where custom CSS or checks are needed (ADR 0012); the rendering-mode contract; stories with play functions and axe; e2e only where Storybook cannot reach. Record the decisions in this ticket's Answer, and propose shared-file changes (a building-blocks row, glossary terms) for the orchestrator. Model: Opus 5.5.

## Answer

Model: Opus 5.5 (AFK: the agent played both sides of the interview; map Notes, AFK override).

Spec: [specs/card.md](../specs/card.md).

### Measurements made for this ticket

Several questions needed facts the bundle did not have, so the ticket measured them in a throwaway workspace (`D:/tmp/nfs-wave-90/`, not committed; no server, no port, no junction; packages read from the existing `D:/tmp/nfs-ct-prototype` install). Foundation 6.9.0 Sass from the local clone, compiled with Dart Sass 1.104.1; Playwright 1.63 in Chromium, Firefox, and WebKit; axe-core 4.13.0 with the six WCAG 2.2 AA tags. Every ratio uses the exact WCAG relative-luminance formula (`Math.pow`) on 8-bit colours, unrounded, per the [Spec: Top Bar](86-spec-top-bar.md) finding.

- E1, ratios (`ratios.mjs`, `extra.mjs`), card `#fefefe`, divider `#e6e6e6`: text `#0a0a0a` 19.630 and 15.863:1; `$anchor-color` `#1779ba` 4.647 on the card and 3.755:1 on the divider; its hover `#1468a0` 5.920 and 4.784:1. With the Callout's required `scale-color($primary-color, $lightness: -15%)` (`#14679e`): 6.012 and 4.858:1, hover `#115888` 7.503 and 6.063:1. Candidates on the divider: `-10%` 4.46, `-12%` about 4.62, `-13%` about 4.70:1. `$card-divider-background: $white` gives 4.647:1. The card border `#e6e6e6` on the page is 1.24:1. For the consistency review: the Callout's Notes give `#14679e` on `$light-gray` as 4.77:1 (Foundation's `color-luminance()`); exact is 4.858:1 (its glyph `#767676`, 3.639:1, holds).
- E2, axe (`axe.mjs`, Chromium): Foundation's two card docs examples verbatim report `image-alt` on both images; a card with a link in a footer divider reports `color-contrast` 3.75 on Foundation's defaults and nothing with the `-15%` line; the recipes (a `ul` block grid of `article` cards with linked `h2` titles, a named `section` card) report nothing, and the CDP tree has `list`, two `listitem`, two `article`, and a `region` named "Account".
- E3, clipping by `overflow: hidden` (`geometry.mjs`, `clip.mjs`, `flexrow.mjs`, `lines.mjs`), 320 by 640 CSS px, three engines, with and without the 1.4.12 text spacing: Foundation's docs examples clip nothing (in the Sizing example's 140 px cards, "appropriately" ends 4.5 px inside the clip edge with the spacing). An `h4` "Accessibility" in a 140 px card of the same two-up grid runs 4.1 to 4.2 px past the clip edge with the spacing in all three engines, also when the cell is a flex container. A URL in a 300 px card runs 113.8 px past it without the spacing and 219.4 px with it in Chromium and WebKit; Firefox breaks the URL after a slash. With `.card { overflow-wrap: anywhere; }` nothing clips in any engine and no card changes width; `break-word` gives the same results in these cases, because the card's own `overflow: hidden` already makes its automatic minimum width 0. Both break the docs' "appropriately", which Foundation lets run past the paragraph's content box into the section padding, as "appropriate" and "ly" under the spacing.
- E4, images (`geometry.mjs`), 300 px cards at 1024 and 320 px, three engines: an image written directly in the card (first or last child) renders 298 by 149 px (its 2:1 ratio) with no space under it, the same as inside `.card-image`; inside a section it is 266 by 133 px with the section's 16 px padding.
- E5, forced colours (`axe.mjs`, Playwright emulation, Chromium and Firefox): the card's border computes to CanvasText (black), the card and divider backgrounds to Canvas (white), text to CanvasText, links to LinkText.
- E6, candidate `nfs-card` (`_nfs-card.scss`, `compile.mjs`): over Foundation's defaults it stops with one `@error` naming `$anchor-color` `#1779ba` on `$card-divider-background` `#e6e6e6` at 3.755:1 and nothing else; with the required setting, with the `$anchor-color` line alone, and with `$card-divider-background: $white` it emits exactly `.card { overflow-wrap: anywhere; }`; `$card-background: $dark-gray` with the required setting stops naming `$anchor-color` (1.756:1) and `$anchor-color-hover` (2.191:1); a divider of `rgba(#1779ba, 0.3)` composited over the card stops at 4.004:1, `rgba(#0a0a0a, 0.1)` compiles; `$global-flexbox: false` emits the same rule.
- E7, focus outlines (`focus.mjs`, three engines, a 2 px solid outline counted in the 2 px band outside each link's box): a block image link written first in the card keeps only its bottom edge (top, left, and right fully clipped), one written last only its top edge; a link inside a section keeps all four.
- E8, landmarks (`landmarks.mjs`, Chromium CDP): a `header` and `footer` divider in a `div` card outside `main` are `banner` and `contentinfo`; inside `main` or an `article` card they are `sectionheader` and `sectionfooter`.
- Sources read: Foundation's card docs page and Sass partial and its settings; its `overflow: hidden` rules elsewhere (XY Grid frame, Orbit, Drilldown, off-canvas, Responsive Embed); `.no-bullet` and `.text-wrap` in its typography helpers and prototype utilities; Angular Material 22.2's `MatCard` source and docs (parts, `appearance`, the accessibility guidance on roles and `tabindex`); Angular 22.2's `NgOptimizedImage` (no `alt` handling); the Callout, Badge, Top Bar, Forms, and Equalizer specs and their tickets.

### Grilling record

Round 1 (nothing settled yet).

- Q1, directive or component. For a component: Material's `mat-card` with named parts. Against: ADR 0001 allows a component only for structure Foundation generates, and "A card is just an element with a `.card` class applied". Settled: one attribute directive per Structural class, on any element (decision 1).
- Q2, which classes. Read from the Sass: four Structural classes, no Variant or State class; `$global-flexbox` is a Sass boolean. Settled: four static host classes, no inputs (decisions 1, 2).
- Q3, role and ARIA. For a default role (Material's docs suggest `group`, `region`, or a landmark): cards group content. Against: the role depends on the content, a decorative card needs none (Material's own words), and the triage settled no default roles. Settled: none; the consumer's element carries it, and the recipes use `article`, a named `section`, and lists (decision 4).
- Q4, `.card-image`. For dropping it: an IE 11 workaround outside the Browser target. Measured (E4): the wrapper changes nothing in three engines. Against dropping: the triage named the part, migrated markup keeps wrappers, and a Foundation class is never left without a home. Settled: `NfsCardImage` binds it, documented as optional (decision 3).

Round 2 (Q1 to Q4 settled).

- Q5, DI. For a parent token and a warning for a part outside a card: the library's container families with behaviour have one (building-blocks 1.9). Against: Foundation's card rules are single-class selectors, nothing depends on the parent, and projection hides the DI context. Settled: no tokens, no injection (decision 10).
- Q6, contrast. Measured (E1, E2): only divider links fail on Foundation's defaults. Ownership follows the Close Button's D9 and the Callout's D7: a container checks what sits on its own backgrounds. Settled: one `@error` over text and both link colours on both backgrounds (decision 7).
- Q7, which setting. Options: the Callout's `-15%` line (already required, and in the Storybook overrides), the smallest passing `-12%`, `$card-divider-background: $white` (removes the band), a library rule recolouring divider links (re-implements a style). Settled: the `-15%` line (decision 8).
- Q8, clipping. Measured (E3): Foundation's docs pass; a 13-letter heading word in the docs' layout fails 1.4.12 and a URL fails 1.4.10, in three engines. Options: a content rule (the Badge's D13 shape; a card's content cannot be limited), overriding `overflow` (Foundation needs it for rounded full-bleed images), `break-word`, `anywhere`, `hyphens: auto`, the Prototyping Utilities' text-wrap on each card. Settled: `.card { overflow-wrap: anywhere; }`, because `anywhere` also lowers the minimum width of a table or inline block inside the card (decision 6).

Round 3 (Q5 to Q8 settled).

- Q9, images and `alt`. Measured (E2): every docs image fails `image-alt`, and axe reports it on every run. For a development check: the docs markup lacks `alt`. Against: the image carries no library directive, and axe already reports it. Settled: every recipe and story image has `alt`; no check (decision 10).
- Q10, a card as a control. For a whole-card link or Material's `tabindex`: common in design systems. Against: a link around a card is named by every word in it, a focusable element with no role breaks the rule that a role is a promise, and Foundation has no clickable card. Measured (E7): a link written directly in the card loses most of its outline. Settled: the linked heading is the control; recipes write no link directly in the card (decisions 5, 9).
- Q11, dividers as `header` and `footer`. Measured (E8): outside a sectioning element or `main` they become page landmarks. Settled: documented, with axe's best-practice landmark rules as the check (decision 4).
- Q12, rendering modes, stories, seams, and vocabulary. Settled: static host classes render on the server, no listener, no render callback; five stories; e2e only for 1.4.10 and 1.4.12 in three engines and the fixture app; two glossary terms (decisions 11 to 13).

The frontier is empty.

### Decisions

1. Four attribute directives, one per Structural class, each a static host class on any element: `NfsCard` (`[nfsCard]`, `.card`), `NfsCardDivider` (`[nfsCardDivider]`, `.card-divider`), `NfsCardSection` (`[nfsCardSection]`, `.card-section`), `NfsCardImage` (`[nfsCardImage]`, `.card-image`), in one entry point `ngx-foundation-sites/card`; no `exportAs`.
2. No Variant inputs, State classes, Runtime check, models, outputs, methods, Defaults token, or providers; `$global-flexbox` stays Sass.
3. `NfsCardImage` is documented as optional: recipes write images directly in the card, because the wrapper only works around an IE 11 bug (measured, E4).
4. No role, name, ARIA, or `tabindex`; the consumer's element carries the meaning (`article`, a named `section`, a list item); a `header` or `footer` divider goes only inside an `article`, `aside`, `main`, `nav`, or `section`.
5. A card is never a control; a card that leads somewhere links its heading; no whole-card link.
6. `nfs-card` emits `.card { overflow-wrap: anywhere; }` for 1.4.10 and 1.4.12.
7. `nfs-card` stops the compile with one `@error` listing every pair under 4.5:1: `$card-font-color`, `$anchor-color`, and `$anchor-color-hover` on `$card-background` (composited over `$body-background`) and on `$card-divider-background` (composited over the card background), exact and unrounded; no parameters.
8. Required on Foundation's defaults: `$anchor-color: scale-color($primary-color, $lightness: -15%);` (the Callout's required line, the lightness of the Accordion's required title colour, already in the Storybook overrides), 4.858:1 on the divider.
9. The recipes write no link directly in the card and do not repeat the title link on a full-bleed image (measured outline clipping, E7); documented, not checked.
10. No development checks and no injection: no copied-class, placement, or `alt` check.
11. Native implementation level; listener-free; no render callback; no Hydration boundary of its own.
12. Story ids `card--default`, `card--divider`, `card--images`, `card--sizing`, `card--long-words`; e2e for 1.4.10 and 1.4.12 at 320 px in three engines and the fixture app's first paint and hydration.
13. Two glossary terms, **Card** and **Card divider** (below).

### Triage

Rule: [map](../map.md), Orchestration rules, "Triage of human-only items".

| Item | Impact | Confidence | Outcome and evidence |
| --- | --- | --- | --- |
| The four directives, their names, and the entry point (decisions 1, 2, 3) | HIGH (public names; the Equalizer already uses them) | HIGH (mechanical under ADR 0001 and ADR 0039; the triage's names; E4 for the wrapper) | Decided |
| No role, no control, the landmark rule (decisions 4, 5, 9) | MEDIUM (recipes and docs, no API) | HIGH (Material's guidance; measured E2, E7, E8) | Decided |
| The `overflow-wrap` rule (decision 6) | MEDIUM (library CSS on every card; it changes where overflowing words break, reversible) | HIGH for the failure and the fix (measured in three engines, E3); MEDIUM for `anywhere` over `break-word`, which differ only in a descendant's minimum width, in no measured case | Decided |
| The check and the required setting (decisions 7, 8) | MEDIUM (the site-wide link colour the Callout already requires) | HIGH (exact formula, confirmed by axe; the candidate mixin compiled, E6) | Decided |
| No checks, rendering modes, stories, vocabulary (decisions 10 to 13) | LOW | HIGH | Decided |

Nothing is OPEN FOR HUMAN, and no prototype is needed: the questions that needed measurement were measured here.

Dissent recorded: dropping `NfsCardImage` as IE 11-only, against decision 3; `overflow-wrap: break-word` as the smaller change, against decision 6; `$card-divider-background: $white` as a card-scoped fix, against decision 8; an `alt` development check, against decision 10.

Placeholders flagged: `nfsGridX`, `nfsCell`, and `up` (the XY Grid's, as the Equalizer writes them), `nfsFlexContainer` (the Flexbox Utilities'), and `img[nfsThumbnail]` (the Thumbnail's, whose spec is open) appear in the spec's stories, examples, and Notes until their specs name them.

### Proposed shared-file changes

1. `building-blocks.md`, Table D, the Card row: fill the empty cells.

   "| Card | `docs/pages/card.md` | [Spec: Card](issues/90-spec-card.md) | `[nfsCard]` (`NfsCard`: binds `.card`), `[nfsCardDivider]` (`.card-divider`), `[nfsCardSection]` (`.card-section`), `[nfsCardImage]` (`.card-image`, Foundation's IE 11 image wrapper, optional in the Browser target); no inputs and no role; written beside the XY Grid, Flexbox Utilities, and Equalizer directives | Directives, one per Structural class, on consumer-written elements; Foundation generates nothing | Native platform (the consumer's elements and Foundation's CSS); Aria has no card pattern and CDK adds nothing | Four static host classes; nothing injected, no listener, no render callback; `nfs-card` (`.card { overflow-wrap: anywhere; }` for 1.4.10 and 1.4.12 against Foundation's `overflow: hidden`, and one `@error` over card text and link contrast on the card and divider backgrounds) | None; the consumer's element (`article`, a named `section`, a list item) carries the meaning |"

2. `building-blocks.md` 1.10, a new bullet after the Badge bullet:

   "- Card ([Spec: Card](issues/90-spec-card.md)): `.card` clips with `overflow: hidden`, so a word wider than the card is cut off (measured at 320 CSS px in three engines: a URL loses 113.8 px in Chromium and WebKit, and, with the 1.4.12 text spacing, a 13-letter heading word in Foundation's two-up block grid 4.1 to 4.2 px); `nfs-card` sets `overflow-wrap: anywhere` on `.card`, so such words break inside it (1.4.10, 1.4.12). It stops the compile when `$card-font-color`, `$anchor-color`, or `$anchor-color-hover` is under 4.5:1 on `$card-background` or `$card-divider-background`; on Foundation's defaults a divider link is 3.755:1, and the Callout's required `$anchor-color: scale-color($primary-color, $lightness: -15%);` gives 4.858:1."

3. `building-blocks.md` 1.10, the first bullet: replace "(1.4.3 text contrast, 1.4.11 non-text contrast, 2.5.8 target size, 2.4.11 focus not obscured, and 1.4.12 text spacing are the ones found so far)" with "(1.4.3 text contrast, 1.4.11 non-text contrast, 2.5.8 target size, 2.4.11 focus not obscured, 1.4.12 text spacing, and 1.4.10 reflow are the ones found so far)".

4. `building-blocks.md` 1.10, the "axe cannot enforce" bullet: replace "and has no 1.4.11 rule;" with "has no 1.4.11 rule, and does not see text that an ancestor's `overflow: hidden` cuts off ([Spec: Card](issues/90-spec-card.md));".

5. `CONTEXT.md`, Foundation side, after **Badge**:

   ```markdown
   **Card**:
   Foundation's CSS-only container for content about one subject, marked by the `.card` Structural class and divided into Card dividers, padded card sections, and images; it has no role of its own, which the element it is written on gives it.
   _Avoid_: panel, tile, box, mat-card

   **Card divider**:
   The shaded band of a Card (`.card-divider`) used as its title, its footer, or a break between its parts; distinct from a horizontal rule, which draws a line.
   _Avoid_: card header, card footer, divider (bare), separator
   ```

6. `README.md`, the Plugins table, after the Badge row:

   "| Card (CSS-only component) | [specs/card.md](specs/card.md) | Native platform (the consumer's elements and Foundation's CSS); four listener-free directives with static host classes | No inventory: Foundation's card docs and Sass, with the [out-of-scope triage](research/out-of-scope-triage.md) (Card, Media Object row) | None needed; contrast, text cut off under 1.4.10 and 1.4.12, image rendering, focus outlines, and landmarks measured in [Spec: Card](issues/90-spec-card.md) |"

7. `storybook-conventions.md`, section 5:
   - The Callout's block in `_settings-overrides.scss`: replace its last comment line, "// also the Close Button and Abide stories that show callouts.", with the two lines

     ```scss
     // also the Close Button and Abide stories that show callouts; and Spec: Card, card--divider, whose divider
     // link is 3.755:1 on $light-gray without it.
     ```

   - The `preview.scss` block: after `@include nfs-top-bar; // Top Bar: Top Bar contrast checks`, add `@include nfs-card; // Card: overflow-wrap for words the card would cut off (1.4.10, 1.4.12) and text and link contrast checks; every card--* story`.

8. `map.md`, Decisions so far: the gist at the end of this Answer.

No new ADR: the rule and the checks are reversible CSS with no consumer API, and the required setting is one the Callout already requires, so none meets the "hard to reverse" test; building-blocks 1.10 records them.

### What other specs need from this one

- [Re-run: Equalizer spec under the class rule](126-rerun-equalizer-class-rule.md) (resolved): `nfsCard`, `nfsCardDivider`, and `nfsCardSection` are final, so the Equalizer's placeholders for them stand. `nfs-card`'s rule is on `.card` alone and sets only `overflow-wrap`, so `.card-row > article` still outranks `.card` for `display`, as the Equalizer asked. Stories that render cards get the rule from the preview's `nfs-card` include.
- [Spec: Thumbnail](97-spec-thumbnail.md) (open): an image in a card section that takes the Thumbnail look is written `img[nfsThumbnail]` in this spec's Notes until you name the directive; the card adds nothing to it.
- [Spec: XY Grid](99-spec-xy-grid.md) and [Spec: Flexbox Utilities](103-spec-flexbox-utilities.md) (open): the Card's stories and examples use `nfsGridX`, `nfsCell`, `up`, and `nfsFlexContainer` as the Equalizer writes them, and leave the margin gutter out until the XY Grid names its input; the measured 1.4.12 case is the docs' `small-up-2` grid with margin gutters (140 px cells at 320 px).
- [Spec: Typography Helpers](106-spec-typography-helpers.md) (open): a list of cards whose bullets are removed uses your `.no-bullet` directive; the Card's list recipe keeps the list roles (measured in Chromium).
- [Spec: Callout](89-spec-callout.md) (resolved): its Notes' "links reach 4.77:1 ... on `$light-gray`" is Foundation's `color-luminance()` figure; the exact ratio for `#14679e` on `#e6e6e6` is 4.858:1 (the glyph's 3.64:1 holds at 3.639:1).
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): replace the placeholders above once their specs publish; check the Storybook override comment and the `nfs-card` include (proposal 7); check whether other Foundation containers that clip with `overflow: hidden` (the XY Grid's frame, Orbit, Drilldown, the off-canvas wrappers, the Responsive Embed) can cut off text under 1.4.12 as the card does; the Callout's `$light-gray` figure.
- [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md): every Out of Scope item and rejected alternative in the spec carries a category.
- [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md): nothing; the Card has no Variant registry, manifest row, or `uses` entry.

### Gist for Decisions so far

- [Spec: Card](issues/90-spec-card.md) -- four listener-free directives, `[nfsCard]`, `[nfsCardDivider]`, `[nfsCardSection]`, and `[nfsCardImage]`, each a static host class with no input, role, or injection, the last documented as optional because `.card-image` only works around an IE 11 bug (measured: bare images render the same in three engines); the consumer's element carries the meaning, the linked heading is the card's control, and `header` or `footer` dividers go only inside a sectioning element (measured: elsewhere they become page landmarks); measured with the exact formula and in three engines: Foundation's `overflow: hidden` cuts off a URL at 320 px and, under the 1.4.12 spacing, a 13-letter heading word in the docs' grid, so `nfs-card` sets `overflow-wrap: anywhere` on `.card`, and a divider link is 3.755:1, so `nfs-card` checks text and links on both backgrounds and Foundation's defaults need the Callout's `$anchor-color: scale-color($primary-color, $lightness: -15%)` (4.858:1); every recipe image has `alt`, which no docs image has; impact MEDIUM to HIGH, confidence HIGH; no ADR. Spec: [specs/card.md](specs/card.md).

### Note, 2026-09-28 (out-of-scope survivors)

- 2026-09-28: the Out of Scope bullet on typography colours is corrected by [Re-run: Typography Helpers spec, out-of-scope survivors](146-rerun-typography-helpers-out-of-scope-survivors.md), from [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md): the greys inside the container are the Typography Helpers' requirement, met by the `#666666` it requires.
