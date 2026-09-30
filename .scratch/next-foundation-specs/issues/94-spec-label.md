# 94. Spec: Label

Type: grilling
Status: resolved
Blocked by: 81
Labels: wayfinder:grilling
Map: ../map.md

## Question

What Angular directives (preferred) or components give Foundation for Sites 6.9's Label to the next, from-scratch ngx-foundation-sites repo, under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Foundation's docs page is `docs/pages/label.md` and its Sass is `scss/components/_label.scss` in the 6.9.0 clone. Publish `specs/label.md`.

Known from the triage: The same palette contrast as Badge; the Label docs page is the Media Label (`.label`), not the form label.

## How to work it

Run `/grill-with-docs` (self-grilling, both sides) over the questions this component raises, then publish with `/to-spec` in the map's spec shape; the [Spec: Button](37-spec-button.md) is the nearest precedent. Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this component); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Cover: one directive per Structural class and what else each owns (the ARIA, `type` default, or development and compile-time checks the documented markup lacks for WCAG 2.2 AA, ADR 0022); every Variant as a typed input by the decision above; State classes as host bindings; the Sass mixin only where custom CSS or checks are needed (ADR 0012); the rendering-mode contract; stories with play functions and axe; e2e only where Storybook cannot reach. Record the decisions in this ticket's Answer, and propose shared-file changes (a building-blocks row, glossary terms) for the orchestrator. Model: Opus 5.5.

## Answer

Model: Opus 5.5 (AFK: the agent played both sides of the interview; map Notes, AFK override).

Spec: [specs/label.md](../specs/label.md).

### Measurements made for this ticket

Several questions needed facts the bundle did not have, so the ticket measured them in a throwaway workspace (`D:/tmp/nfs-wave-94/`, not committed; no server, no port, no junction; packages read from the existing `D:/tmp/nfs-ct-prototype` install). Foundation 6.9.0 Sass from the local clone, compiled with Dart Sass 1.104.1; Playwright 1.63 in Chromium, Firefox, and WebKit; axe-core 4.13.0 with the six WCAG 2.2 AA tags. Every ratio uses the exact WCAG relative-luminance formula (`Math.pow`), unrounded, per the [Spec: Top Bar](86-spec-top-bar.md) finding; Foundation's own figures are given beside them where they differ. The [Spec: Badge](93-spec-badge.md) ran in parallel with the same text candidates; its findings on the settings order and Foundation's pick were measured again here for `.label`.

- E1, ratios (`ratios.mjs`): uncoloured and primary label `#fefefe` on `#1779ba` 4.6473 (Foundation 4.5865); secondary `#767676` white 4.5037, black 4.3587; success `#3adb76` black 10.9117; warning `#ffae00` black 10.6593; alert `#cc4b37` white 4.4981, black 4.3641 (the triage's "4.499" is 4.498 exactly); `#bf3f2c` white 5.2546; Foundation's docs colours `purple: #bb00ff` white 4.5693, `red: #ff0000` black 4.9514 (Foundation picks black), `black: #000000` white 20.822. `#1177dd`: exact white 4.4240 and black 4.4373, both failing, where Foundation's `color-luminance()` gives black 4.5051 and its pick takes black. The alternative `$label-color: #ffffff` lifts alert only to 4.5365 and leaves `#777777` and `#1177dd` failing.
- E2, settings order (`order.mjs`): with Foundation's settings file, then an overrides file with the Progress Bar's `$foundation-palette: map-merge($foundation-palette, (alert: #bf3f2c));`, then `foundation`, `.label.alert` still compiles to `background: #cc4b37`; `$label-palette: map-merge($foundation-palette, (alert: #bf3f2c));` gives `#bf3f2c` in either order of the two lines; a consumer's own copy of the settings file with the palette's alert entry edited gives `#bf3f2c`.
- E3, Foundation's pick (`scan.mjs`, `pink.mjs`): `color-pick-contrast()` over `($label-color, $label-color-alt)` picks `$black` on `#e10f69` (exact white 4.6542, black 4.2178; Foundation's white 4.4044, black 4.4570), `#c30fe1`, `#d20fb4`, and `#e10f87` (white 4.5072, black 4.3553). On an RGB grid in steps of 5, 10,840 colours have their better candidate between 4.2 and 4.8:1; for 148 of them Foundation picks the failing candidate while the other passes (saturated purples and pinks such as `#b90ffa`: black picked at 4.2534, white 4.6152), and for 383 the pair Foundation emits fails exactly while Foundation's own `color-luminance()` ratio passes (`#008c0f` with black: 4.4858 exactly, 4.5100 by Foundation's function), which is why the check uses the exact helper and not Foundation's.
- E4, axe and the accessibility tree (`axe.mjs`, `axe2.mjs`), Chromium: on Foundation's docs examples verbatim, axe reports `color-contrast` on the Coloring example's alert label and the first Icons label (4.49); with the required setting nothing is reported. The CDP tree gives the docs paragraph the description "High Priority", and the two-label paragraph "High Priority Unread"; a link with `aria-describedby` at a label beside it is "Quarterly report" described by "Overdue"; a heading with a label inside is named "Quarterly report Overdue", a cell "Paid", a link holding a label "New Release notes"; the docs' icon font glyphs (drawn through `::before` with Private Use Area characters) appear as text nodes U+F1B0, U+F1AE, U+F214, and disappear with `aria-hidden="true"` on the icon; `aria-label` on a plain `span` label is an `aria-prohibited-attr` violation, and `role="img"` with `aria-label` is an image named "Overdue"; an icon-only label reports nothing; an SVG icon's `currentColor` stroke equals the label's text colour.
- E5, geometry (`geometry.mjs`), 320 by 640 CSS px, three engines, with and without the 1.4.12 text spacing: a label is 23.45 px tall (23.47 in Firefox) and 29.8 to 29.9 px with the spacing, and its text stays inside its box in every case; Foundation's two-word labels take 86 to 112 px (107 to 137 px spaced); "Awaiting a reply from the customer since last Monday" (52 characters) takes 318.8 px in a 300 px grid container and scrolls the page to 329 px, 415.1 px and 425 px with the spacing.
- E6, candidate `nfs-label` (`_nfs-label.scss`, `compile.mjs`, `compile2.mjs`): over Foundation's defaults it stops with one `@error` naming `$label-palette` alert `#cc4b37` with both ratios (4.498, 4.364); with the required setting it emits exactly `:root { --nfs-label-palette: primary secondary success warning alert; }`; the Progress Bar line alone still stops it; `pink: #e10f69` emits `.label.pink { color: #fefefe; }`; `#777777` and `#1177dd` stop it; a light `$label-background` with white `$label-color` stops it (1.841:1) and compiles with a dark `$label-color`; `$label-palette: ()` writes an empty property; `rgba(#1779ba, 0.5)` is composited and gets a `$black` rule; the [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md)'s usage example `$label-palette: map-remove($foundation-palette, warning);` stops it on alert, and `map-merge(map-remove($foundation-palette, warning), (alert: #bf3f2c))` compiles to `primary secondary success alert`.
- E7, the docs' Custom Colors forms (`docs-forms.mjs`), in an overrides file after the settings file: `$label-palette: map-remove($foundation-palette, (primary, secondary)) !default;` and the same without `!default` leave all five classes; `map-remove($foundation-palette, primary, secondary)` removes both; `map-merge($foundation-palette, (purple: #bb00ff)) !default;` adds nothing, and without `!default` adds `.label.purple`.
- E8, interactive hosts (`hosts.mjs`), three engines, identical: `<a class="label" href>` has `#fefefe` on `#1779ba` at rest (4.65) and `#1468a0` on hover and focus (1.27), with `cursor: default`; a coloured label on a link keeps its colour (success 10.91 in every state); a label inside a link keeps `#fefefe` on hover and focus; `<button class="label">` keeps `#fefefe` in every state; `<a class="badge" href>` also turns `#1468a0` on hover and focus (1.27), for the [Spec: Badge](93-spec-badge.md).
- E9, forced colours (`geometry.mjs`, Playwright emulation, Chromium and Firefox): the label's text computes to `rgb(0, 0, 0)` and its background to `rgb(255, 255, 255)`, the same as the paragraph's text and the page, so the box disappears and the text stays.
- Sources read: Foundation's label docs page, Sass partial, settings file, typography base (`a:hover, a:focus`), and `color-pick-contrast()`, `color-contrast()`, `color-luminance()`; Angular Material 22.2's `MatChip` and `MatChipSet` source and the chips docs ("Angular Material does not intend `<mat-chip>`, `<mat-basic-chip>`, and `<mat-chip-set>` to be interactive"; a chip set's role is `presentation` until set); the APG names-and-descriptions practice (its `aria-describedby` examples describe a button and a text field); the [Spec: Badge](93-spec-badge.md) and its ticket, the [Spec: Callout](89-spec-callout.md), and the [Spec: Progress Bar](95-spec-progress-bar.md) and their tickets' Answers; the [Spec: Tooltip](27-spec-tooltip.md) (interactive hosts only).

### Grilling record

Round 1 (nothing settled yet).

- Q1, directive or component, the host, and the name. For a component: Material's static chip is a component with a template. Against: ADR 0001 allows generated structure only where Foundation generates it, and Foundation's label is an element the consumer writes ("any tag will work fine"). Name: building-blocks 1.3 names a directive after its class, and the Forms spec already took `NfsFormLabel` for the form `label` so that `NfsLabel` stays this component's; `NfsMediaLabel` and `NfsTag` are not Foundation's names. Settled: one attribute directive `[nfsLabel]` on any element (decision 1).
- Q2, which classes. Read from the Sass: one Structural class, one Open Variant family (`$label-palette`), no State class, no sizes. Settled (decisions 1, 2).
- Q3, role and ARIA. For Material's `role` and `aria-label` inputs: a named chip. Against: `aria-label` is prohibited on a generic `span` (E4), and a role input is a second spelling of the native attribute. Settled: no role, no ARIA (decision 3).
- Q4, the relationship to what the label describes. Measured (E4): a label inside a heading, cell, or link joins its content or name; a paragraph's description is exposed but a paragraph takes no focus, where descriptions are announced; a link's description is announced on focus. Settled: inside, or right after text that takes no focus; `aria-describedby` from a focusable control; the docs' paragraph example becomes a link pairing (decision 4).

Round 2 (Q1 to Q4 settled).

- Q5, the `color` type. `$label-palette` is its own setting with a chained default, so the Button's and Badge's chained registry applies, not the Callout's plain alias. Settled (decision 2).
- Q6, contrast. Measured (E1, E4): alert fails with both candidates; unlike the Badge's one-character examples, a label's text is long enough for axe, which reports it; the compile-time check still covers entries no story renders and the uncoloured pair, which Foundation never picks for. Settled: a compile-time check over every pair (decision 9).
- Q7, which setting fixes alert. Options: the Progress Bar's `$foundation-palette` line; a `$label-palette` line; `$label-color: #ffffff` (4.537:1, measured). Measured (E2): the `$foundation-palette` line in an overrides file does not reach `$label-palette`. `#bf3f2c` is already the Button's, Abide's, Progress Bar's, and Badge's alert. Settled: the scoped `$label-palette` line, with the settings-file alternative documented (decision 10).
- Q8, Foundation's pick. Measured (E3): the same function and candidates as the Badge's pick the failing candidate on some colours. Options: check only and name both ratios; correct the pick where it differs (the Badge's D9); raise `$global-color-pick-contrast-tolerance` (changes every component). Settled: correct only where the pick differs, parallel with the Badge (decision 9).

Round 3 (Q5 to Q8 settled).

- Q9, icon labels. Measured (E4): Foundation's unhidden icon font glyphs are text in the tree; axe reports nothing for them or for an icon-only label. Options: the Badge's no-text check; a check for Private Use Area characters in an icon's `::before` content. The second is a heuristic over icon libraries and is additive later. Settled: the Badge's check, `aria-hidden` icons in every recipe (decision 5).
- Q10, colour meaning (1.4.1). The directive cannot read wording. Settled: a content requirement shown in every recipe and asserted in every story (decision 6).
- Q11, copied classes and the Runtime check. Settled: the Button's D22 warning; `include('nfs-label', ['label-palette'])`, one writer (decisions 7, 11).
- Q12, a label on a link. Measured (E8): the uncoloured label's text turns `$anchor-color-hover` on hover and focus, 1.27:1 in three engines, which axe does not test; a label inside the link keeps its colours. Options: the Badge's documented rule with no check; a development warning on an `a` host; a library rule restoring `$label-color` on `a.label:hover, a.label:focus`. For parity with the Badge: its D12 has no check. Against: the Badge's reasons (axe `target-size` and name queries) do not reach a hover colour, and the same failure measures on `a.badge` (E8). The library rule would give a tag link no hover cue and keep the arrow cursor. Settled: the warning, on every `a` host, and a proposal that the Badge adopt it (decision 12). A `button` host fails nothing (E8) and is not checked.
- Q13, long labels. Measured (E5): `white-space: nowrap` scrolls the page for a 52-character label at 320 CSS px. Options: a library `white-space: normal` rule (a label in a narrow table column or flex item would wrap where Foundation keeps it on one line); a width check (resize-dependent); a documented rule. Settled: a word or a short phrase, documented, and every story's labels asserted by the reflow e2e (decision 13).
- Q14, the docs' Custom Colors forms. Measured (E7): as written they change nothing from an overrides file, and the `map-remove` list form removes nothing anywhere. Settled: the spec gives the working forms (decision 17).

Round 4 (Q9 to Q14 settled).

- Q15, status labels, forced colours, rendering modes, stories, seams, and vocabulary. Measured (E9): nothing is lost under forced colours. Settled: no live role, `role="status"` from the consumer; no forced-colours rule; host bindings only; five stories; e2e for text-spacing geometry and reflow in three engines and the fixture app; a manual screen-reader release test; one glossary term (decisions 8, 14 to 16).

The frontier is empty.

### Decisions

1. One attribute directive, `NfsLabel`, selector `[nfsLabel]` on any element, `exportAs: 'nfsLabel'`, in its own entry point `ngx-foundation-sites/label`. It binds `.label` as a static host class.
2. `color: NfsLabelColor | undefined`, with `NfsLabelColor = NfsOverridableStringUnion<NfsFoundationPaletteColor, NfsLabelPaletteOverrides>` over `$label-palette` (chained on `NfsFoundationPaletteOverrides`, as the Button's and Badge's). The value is the class; unset sets none (`$label-background` is the look). Variant property `--nfs-label-palette`.
3. No State classes, role, ARIA, outputs, methods, models, Defaults token, or providers; `role`, `id`, `aria-*`, and `hidden` stay the consumer's.
4. A label sits inside the element it tags (a heading, a cell, a link) or right after text that takes no focus; `aria-describedby` references a label, or several, from a focusable control beside it; Foundation's paragraph pairing becomes a link pairing in the recipes and stories.
5. A development warning, once at the first render, for a label with no text outside `aria-hidden` subtrees, unless the host is `aria-hidden` or `role="img"` with a non-blank `aria-label` or `aria-labelledby`; it names `aria-prohibited-attr` when a bare `aria-label` is present. Icon recipes put `aria-hidden` on the icon, drawn in `currentColor`.
6. The label's text says what its colour suggests (1.4.1, 1.3.1), a content requirement shown in every recipe and asserted in every story.
7. A development warning, once, for Foundation's default palette names copied into the host's static class list.
8. No default live role; a label whose text the user's action changes is a `role="status"` label that exists before the change and holds the whole message (4.1.3).
9. `nfs-label` stops the compile with one `@error` listing every pair under 4.5:1 by the exact formula (`$label-color` on `$label-background`; each `$label-palette` entry with the better of `$label-color` and `$label-color-alt`), each with both ratios; and emits `.label.<name> { color: <the better one>; }` only where Foundation's `color-pick-contrast()` picked the other (none on Foundation's defaults).
10. Required on Foundation's defaults: `$label-palette: map-merge($foundation-palette, (alert: #bf3f2c));` (5.255:1), mirrored in the Storybook settings overrides; in a consumer's own copy of the settings file, changing the palette's alert entry to `#bf3f2c` also works, because its Label section follows it.
11. Runtime check: `include('nfs-label', ['label-palette'])` on every run and `value('color', ...)` for a bound colour; `--nfs-label-palette` has one writer.
12. A label is never a control; a tag link holds its label inside the link; the directive warns once in development when its host is an `a` element, whatever `color` is.
13. A label holds a word or a short phrase; documented, not checked; the reflow e2e covers the stories.
14. Native implementation level; listener-free; every effect a host binding in server HTML; checks only in a client render callback; no Hydration boundary of its own; live labels not in `hydrate never`; no forced-colours rule.
15. Story ids `label--default`, `label--colors`, `label--icons`, `label--in-controls`, `label--status`; e2e for 1.4.12 geometry and 1.4.10 reflow in three engines and the fixture app's first paint and hydration; a manual screen-reader release test.
16. One glossary term, **Label** (below).
17. The spec gives Foundation's Custom Colors in forms that compile from an overrides file: no `!default`, and `map-remove` with separate key arguments, each keeping the required alert.

### Triage

Rule: [map](../map.md), Orchestration rules, "Triage of human-only items".

| Item | Impact | Confidence | Outcome and evidence |
| --- | --- | --- | --- |
| The directive, its input, alias, and registry (decisions 1 to 3, 11) | HIGH (public names and types) | HIGH (mechanical under ADR 0001, ADR 0039, ADR 0040, building-blocks 1.3, 1.4, 1.13; the tooling spec's `$label-palette` row; the Button's and Badge's chained alias; the Forms spec's naming split) | Decided |
| The placement rule and the paragraph correction (decision 4) | MEDIUM (recipes and docs, no API) | HIGH (measured names and descriptions; the APG's examples; the Badge's D4) | Decided |
| The check, the required setting, and the pick correction (decisions 9, 10) | MEDIUM (one palette colour; a library rule that is empty on the defaults and additive to remove) | HIGH (measured with the exact formula; axe confirms; the settings order and the pick measured; parallel with the Badge) | Decided |
| The link warning (decision 12) | LOW (development only) | HIGH for the failure (measured in three engines), MEDIUM for the divergence from the Badge, which is routed to the consistency review below | Decided; dissent recorded |
| The text check (decision 5) | LOW (development only) | HIGH (axe measured silent on text-less labels and strict on `aria-label`) | Decided |
| Content rules and docs forms (decisions 6, 13, 17) | LOW (documentation; a check is additive later) | HIGH (geometry and the Sass forms measured; the Callout's, Progress Bar's, and Badge's content-requirement precedent) | Decided |
| No live role, copied classes, rendering modes, stories, vocabulary (decisions 7, 8, 14 to 16) | LOW or MEDIUM | HIGH | Decided |

Nothing is OPEN FOR HUMAN, and no prototype is needed: the questions that needed measurement were measured here. The screen-reader announcements are a manual release test, as ADR 0022's dated consequence has it.

Dissent recorded: the Badge's documented-only rule for a label on a link (parity), against decision 12; a library rule restoring the label's colour on a link's hover and focus, against decision 12; check-only for Foundation's pick (the Button spec's current approach), against decision 9; the Progress Bar's `$foundation-palette` line or `$label-color: #ffffff` as the required setting, against decision 10; Foundation's paragraph `aria-describedby` kept as the recipe, against decision 4; a library `white-space: normal` rule for long labels, against decision 13.

### Proposed shared-file changes

1. `building-blocks.md`, Table D, the Label row: fill the empty cells.

   "| Label | `docs/pages/label.md` | [Spec: Label](issues/94-spec-label.md) | `[nfsLabel]` (`NfsLabel`: binds `.label`; `color` Variant input over `NfsLabelPaletteOverrides`, chained on `NfsFoundationPaletteOverrides`; `exportAs: 'nfsLabel'`); the label sits inside the heading, cell, or link it tags, or a focusable control references it with `aria-describedby`; a changing state is the consumer's `role="status"` | Directive: `.label` is a Structural class on a consumer-written element, and Foundation generates nothing | Native platform (the element's text, Foundation's CSS, native `aria-describedby` and `status`); Aria has no label or tag pattern and CDK adds nothing | A static host class and one `computed` class list; development text, copied-class, and link-host checks in one render callback; the `strictVariantNames` and `strictVariantProperties` Runtime checks; `nfs-label` (`--nfs-label-palette`, the better text colour where Foundation's pick is the worse, one `@error` over label text contrast) | None for the label; the containing control's pattern; `status` for a changing state |"

2. `building-blocks.md` 1.10, a new bullet after the Badge bullet (the [Spec: Badge](issues/93-spec-badge.md) ticket's proposal 2), or after the Progress Bar bullet if that has not landed:

   "- Label ([Spec: Label](issues/94-spec-label.md)): `nfs-label` has the Badge's checks and pick correction over `$label-color`, `$label-color-alt`, `$label-background`, and `$label-palette`, and needs `$label-palette: map-merge($foundation-palette, (alert: #bf3f2c));` on Foundation's defaults (the alert label is 4.498:1 with `$white` and 4.364:1 with `$black`, which axe reports on Foundation's Coloring example), mirrored in the Storybook settings overrides; a `$foundation-palette` merge in an overrides file does not reach `$label-palette`. A label is never written on a link: Foundation's `a:hover, a:focus` rule outranks a one-class component colour, so the uncoloured label's text turns `$anchor-color-hover` on hover and focus (1.27:1, measured in three engines, a state axe does not test); `NfsLabel` warns in development and the recipe puts the label inside the link."

3. `building-blocks.md` 1.10, the first bullet, in the sentence the [Spec: Badge](issues/93-spec-badge.md) ticket's proposal 3 appends: replace "each spec that relies on the pick decides whether its mixin corrects it, as `nfs-badge` does, or only checks it." with "each spec that relies on the pick decides whether its mixin corrects it, as `nfs-badge` and `nfs-label` do, or only checks it."

4. `CONTEXT.md`, Foundation side, after **Badge** (the Badge ticket's proposal 5), or after **Callout** if that has not landed:

   ```markdown
   **Label**:
   Foundation's CSS-only inline tag that marks content with a word or a short phrase of metadata ("High priority", "Draft"), marked by the `.label` Structural class and coloured from `$label-palette`; not a control. Distinct from a Form label, which names a form control, and from a Badge, which shows a short count.
   _Avoid_: tag, chip, pill, media label, label (bare, where a Form label could be meant)
   ```

5. `README.md`, the Plugins table, after the Badge row (the Badge ticket's proposal 6), or after the Progress Bar row if that has not landed:

   "| Label (CSS-only component) | [specs/label.md](specs/label.md) | Native platform (the consumer's element and its text, Foundation's CSS, native `aria-describedby` and `status`); one listener-free directive | No inventory: Foundation's label docs and Sass, with the [out-of-scope triage](research/out-of-scope-triage.md) (Badge, Label row) | None needed; contrast, Foundation's text colour pick, the settings order, the docs' Sass forms, names and descriptions, a label on a link, and geometry measured in [Spec: Label](issues/94-spec-label.md) |"

6. `storybook-conventions.md`, section 5:
   - The `_settings-overrides.scss` block, after the Badge's lines (or after the Progress Bar's lines if those have not landed):

     ```scss
     // color-contrast (1.4.3): nfs-label stops the compile on Foundation's alert label, whose $white text is 4.498:1
     // (4.364:1 with $black; axe reports 4.49). Foundation's settings file assigned $label-palette before this file,
     // so a $foundation-palette merge does not reach it. Spec: Label, label--colors and label--icons.
     $label-palette: map-merge($foundation-palette, (alert: #bf3f2c));
     ```

   - The `preview.scss` block: after the `nfs-badge` include (or after `@include nfs-progress-bar;` if that has not landed), add `@include nfs-label; // Label: text contrast check, the text colour where Foundation's pick is the worse, and --nfs-label-palette; every label--* story`.
   - The Progress Bar's override comment, which has landed as "it also recolours alert callouts, badges, and labels in every story (all still passing)": apply the Badge ticket's proposal 7 (third bullet) replacement, "it also recolours alert callouts in every story (still passing); badges, labels, and buttons keep the palettes Foundation's settings file assigned before this file, so their specs add lines of their own"; measured again here for `.label.alert` (E2).

7. `map.md`, Decisions so far: the gist at the end of this Answer.

No new ADR: the pick correction, the link warning, and the placement rule are reversible without touching consumer API (the rule is empty on Foundation's defaults, and the warning is development-only), and the required setting is a consumer setting, so none meets the "hard to reverse" test; building-blocks 1.10 records them.

### What other specs need from this one

- [Spec: Badge](93-spec-badge.md) (resolved): measured here (E8), `<a class="badge" href>` turns `#1468a0` on hover and focus in three engines, 1.27:1 on `#1779ba`, the failure that made the Label's decision 12 a development warning. The Badge's D12 rejects a link warning because "axe's `target-size` and a play function's name query catch a crowded or badly named one", which does not reach a hover colour. Proposed for the consistency review to decide, recommended: the Badge adopts the Label's check. In `specs/badge.md`, API: `NfsBadge`, after development-mode check 2, add "3. On a link (D12): the host is an `a` element: "nfsBadge: a badge is not a link's look; on a link, Foundation's link hover and focus colour replaces an uncoloured badge's text colour (1.27:1 on Foundation's defaults, WCAG 1.4.3), which axe does not test. Put the badge inside the link instead: <a href="..."><span nfsBadge>...</span></a>"."; in D12, "documented, not checked" becomes "the directive warns in development when its host is an `a` element (measured in the [Spec: Label](../issues/94-spec-label.md) ticket: the hover and focus colour is 1.27:1)"; the Out of Scope bullet "A development warning for a badge on a link or button (D12) ..." is removed. The alternative, the Label dropping its check for parity, is recorded as dissent above.
- [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md): the `NfsLabelPaletteOverrides` entry (`$label-palette`, `--nfs-label-palette`, base `$foundation-palette`) gets `mixins: ['nfs-label']` and one `uses` entry `{entryPoint: 'ngx-foundation-sites/label', directive: 'NfsLabel', input: 'color', alias: 'NfsLabelColor', shape: 'name'}`; the typings check covers `NfsLabelColor`. Its usage example's `$label-palette: map-remove($foundation-palette, warning);` stops `nfs-label` on Foundation's alert (E6): replace it with `$label-palette: map-merge(map-remove($foundation-palette, warning), (alert: #bf3f2c));`, which leaves the generated `NfsLabelPaletteOverrides { warning: false; }` unchanged. The example's `$button-palette` line lacks the Button spec's required alert, success, and warning colours in the same way, for the consistency review. For its docs: Foundation's `map-remove($foundation-palette, (primary, secondary))` form removes nothing, and a `!default` assignment after the settings file does nothing (E7), so the generated file keeps those names; the tooling reports no drift, because the Sass itself did not change.
- [Spec: Progress Bar](95-spec-progress-bar.md) (resolved): the correction the Badge ticket proposed for its Answer's Badge and Label bullet holds for the Label too (E2): its `$foundation-palette` override does not reach `$label-palette`.
- [Spec: Forms](98-spec-forms.md) (resolved): its D3 pointer to this spec is met; `NfsLabel` binds `.label` on any element and never meets `label[nfsFormLabel]`.
- [Spec: Visibility Classes](104-spec-visibility-classes.md) (open): the icon-only label in `label--icons` uses its screen-reader-only directive for `.show-for-sr`, written `nfsShowForSr` until it names it.
- [Spec: Button](37-spec-button.md) and [Re-run: Button spec under the class rule](128-rerun-button-class-rule.md) (resolved): the Badge ticket's note on Foundation's wrong pick applies; the Label corrects its pick as the Badge does, which leaves `nfs-button` the one mixin that only checks it.
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): check that no spec writes `.label` or a palette class on a label; that the Badge and the Label agree on the link-host check (above); that every Storybook override that merges `$foundation-palette` states which palettes it reaches (Callout and Progress Bar directly; not Badge, Label, or Button); that no spec quotes Foundation's Custom Colors forms with `!default` or with a parenthesised `map-remove` list; that `nfsShowForSr` is renamed once the Visibility Classes spec names its directive; and whether any other component that sits on an `a` host with a one-class colour (a Callout on a link, a Thumbnail link) meets the same `a:hover, a:focus` override.
- [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md): the spec's Out of Scope items and rejected alternatives each carry a category.

### Gist for Decisions so far

- [Spec: Label](issues/94-spec-label.md) -- one listener-free `[nfsLabel]` binding `.label`, with `color` over `NfsLabelPaletteOverrides` chained on the shared palette, the Badge's shape; no role: the label sits inside the heading, cell, or link it tags or right after text that takes no focus, and a focusable control beside it references it with `aria-describedby` (measured: Foundation's paragraph description is exposed but takes no focus); development checks for a text-less label, copied classes, and a label written on a link (measured in three engines: Foundation's `a:hover, a:focus` turns the uncoloured label's text to 1.27:1, which axe does not test); measured with the exact formula: Foundation's alert label is 4.498:1 and its `color-pick-contrast()` can pick the failing text colour, so `nfs-label` checks every pair, corrects the pick where it is the worse, and needs `$label-palette: map-merge($foundation-palette, (alert: #bf3f2c));`, because the Progress Bar's `$foundation-palette` merge does not reach `$label-palette` from an overrides file; the docs' Custom Colors forms are corrected (their `!default` and list-form `map-remove` do nothing); impact MEDIUM to HIGH, confidence HIGH; no ADR. Spec: [specs/label.md](specs/label.md).

### Amendment, 2026-09-29 (consistency review)

From [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md), phase 2, group c, under the decisions of phase 1 ([research/consistency-review-decisions.md](../research/consistency-review-decisions.md)); the review's record for this spec is [research/consistency-review-group-c.md](../research/consistency-review-group-c.md). `specs/label.md` was revised in place. Items applied: R4 (S1's wording completed), R59, R74, CR-B. Changed:

- Development check 1 (D5) reads text as accessible-name computation does: the non-blank `alt` of an `img`, or the non-blank `aria-label` of an element with `role="img"`, outside `aria-hidden` subtrees, counts as text; D5's decision cell and the browser-level case list gain that reading and one silent case with an image-only label (R74).
- Injection: the Runtime checks' handle names its argument, `nfsVariantCheck('nfsLabel')` (R59).
- Sass rule (c): the check names both Foundation functions as not used (`color-luminance()`, `color-contrast()`), completing S1's wording (R4).
- Rendered HTML gains the icon-only label with `nfsShowForSr` visually hidden text, which the lead-in already named without an example; `label--icons` names `NfsShowForSr` in its imports; the mapping gains a table of the other families' classes (the Visibility Classes' `.show-for-sr`, the Button's `.button`) and a sentence on icon-font classes (CR-B).

Unchanged: the directive, its API, checks 2 and 3, the Library mixin's rules and required setting, ARIA, the rendering modes, and the Story ids. Confirmed: R1, R5, R6 (D9), R28/R29 (check 3, D12, D17), R30, CR-A, CR-C, CR-D; every figure near a threshold recomputed with the review's contrast calculator stands in both of its modes (4.498, 4.364, 4.647, 4.504, 5.255, 4.569, 4.440 and 4.421, 4.424 and 4.437, 4.654 and 4.218, 4.951). Impact LOW, confidence HIGH; nothing OPEN FOR HUMAN.

### Amendment, 2026-09-29 (consistency review, closing pass)

From [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md), closing pass:

- `specs/label.md`: `NfsLabel` has no `exportAs` (the API line, the bullet, D1), by R17's rule, which the closing pass extends to every directive whose public members are only inputs and outputs (building-blocks 1.3, 2026-09-29).

### Amendment, 2026-09-29 (exportAs on every directive)

From [Decide: an exportAs on every directive](156-decide-exportas-on-every-directive.md), which reverses R17 and this ticket's closing-pass line above: `specs/label.md`'s `NfsLabel` gains `exportAs: 'nfsLabel'` (the API line, the bullet, D1).

### Amendment, 2026-09-29 (checks move to a later milestone)

From [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md), applied by [Re-run: specs without checks, group c](167-rerun-specs-without-checks-group-c.md): `specs/label.md` describes and accepts a library with no checks. What left the spec, per check:

- Misuse warnings: development check 1 (a label with no text for screen readers, D5, with its `aria-prohibited-attr` sentence), check 2 (copied palette classes, D7), and check 3 (a label on an `a` host, D12), with the directive's development-only `afterRenderEffect`, its `ElementRef` and `HostAttributeToken('class')` injections, and the browser-level cases for all three and for `ngDevMode` off.
- Runtime checks: the Variant check (`nfsVariantCheck('nfsLabel')`, `include('nfs-label', ['label-palette'])`, `value()`, `strictVariantNames`, `strictVariantProperties`, D11), with its browser-level case, the SSR smoke's no-report clause, the missing-include sentence, and the empty-palette opt-out.
- Build-time checks: the `nfs-label` `@error` contrast check (Sass item 1(c), D9), with the Sass compile cases that asserted only it (the defaults' stop, `#777777` and `#1177dd`, `$label-background: #ffae00`); the overrides-file case now asserts the compiled `.label.alert` background.

Each rule is stated as documented usage: the JSDoc of `NfsLabel` and two usage rules in the API section (text for screen readers, with its two exceptions; never on a link), a bullet on copied classes (not stripped; bind `color`), the 1.1.1 and 1.4.3 rows, and a "Documented usage for the settings" paragraph in the Sass subsection with the ratios, a dark `$label-color` for a light `$label-background`, and the required alert. A new Imports bullet says what a forgotten import does. The pick-correction rule keeps the library's contrast helper; `--nfs-label-palette` stays, for the Variant declaration tooling's generator. D5, D7, D9, D11, D12, and D13 are rewritten, and D6's rejected alternative no longer names a check; user stories 13, 15 to 20, and 22 state documentation, not warnings. Unchanged: the directive, its `color` input and type, ARIA, the rendering modes, the pick-correction rule, the required setting, the stories, and the e2e and manual tests.
