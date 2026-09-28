# 93. Spec: Badge

Type: grilling
Status: resolved
Blocked by: 81
Labels: wayfinder:grilling
Map: ../map.md

## Question

What Angular directives (preferred) or components give Foundation for Sites 6.9's Badge to the next, from-scratch ngx-foundation-sites repo, under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Foundation's docs page is `docs/pages/badge.md` and its Sass is `scss/components/_badge.scss` in the 6.9.0 clone. Publish `specs/badge.md`.

Known from the triage: The `alert` palette colour is 4.499:1 with white and 4.36:1 with black on the defaults, despite Foundation's AA claim: a compile-time palette check.

## How to work it

Run `/grill-with-docs` (self-grilling, both sides) over the questions this component raises, then publish with `/to-spec` in the map's spec shape; the [Spec: Button](37-spec-button.md) is the nearest precedent. Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this component); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Cover: one directive per Structural class and what else each owns (the ARIA, `type` default, or development and compile-time checks the documented markup lacks for WCAG 2.2 AA, ADR 0022); every Variant as a typed input by the decision above; State classes as host bindings; the Sass mixin only where custom CSS or checks are needed (ADR 0012); the rendering-mode contract; stories with play functions and axe; e2e only where Storybook cannot reach. Record the decisions in this ticket's Answer, and propose shared-file changes (a building-blocks row, glossary terms) for the orchestrator. Model: Opus 5.5.

## Answer

Model: Opus 5.5 (AFK: the agent played both sides of the interview; map Notes, AFK override).

Spec: [specs/badge.md](../specs/badge.md).

### Measurements made for this ticket

Several questions needed facts the bundle did not have, so the ticket measured them in a throwaway workspace (`D:/tmp/nfs-wave-93/`, not committed; no server, no port, no junction; packages read from the existing `D:/tmp/nfs-ct-prototype` install). Foundation 6.9.0 Sass from the local clone, compiled with Dart Sass 1.104.1; Playwright 1.63 in Chromium, Firefox, and WebKit; axe-core 4.13.0 with the six WCAG 2.2 AA tags. Every ratio uses the exact WCAG relative-luminance formula (`Math.pow`), unrounded, per the [Spec: Top Bar](86-spec-top-bar.md) finding; Foundation's own figures are given beside them where they differ.

- E1, ratios (`ratios.mjs`), exact against Foundation's `color-luminance()`: uncoloured and primary badge `#fefefe` on `#1779ba` 4.6473 (Foundation 4.5865); secondary `#767676` white 4.5037, black 4.3587; success `#3adb76` black 10.9117; warning `#ffae00` black 10.6593; alert `#cc4b37` white 4.4981, black 4.3641 (Foundation 4.4981 and 4.3642, so the triage's "4.499" is 4.498 exactly); `#bf3f2c` white 5.2546; Foundation's docs examples `purple: #bb00ff` white 4.5693, custom `red: #ff0000` black 4.9514 (Foundation picks black), `black: #000000` white 20.82. Foundation picks white on primary, secondary, and alert and black on success and warning.
- E2, settings order (`order.mjs`, `order-label.mjs`): with Foundation's settings file imported, then an overrides file with the Progress Bar's required `$foundation-palette: map-merge($foundation-palette, (alert: #bf3f2c));`, then `foundation`, `.badge.alert` and `.label.alert` still compile to `background: #cc4b37`: the settings file assigns `$badge-palette: $foundation-palette;` (and `$label-palette`, `$button-palette`) in its component sections without `!default`, before the overrides run. `$badge-palette: map-merge($foundation-palette, (alert: #bf3f2c));` in the overrides file gives `#bf3f2c`.
- E3, axe and the accessibility tree (`axe.mjs`, `axe-short.mjs`), Chromium: on Foundation's docs examples verbatim, axe reports no violation; it marks the alert badge "A" incomplete with `shortTextContent` (4.49). Alert badges reading "12", "99+", and "New" are `color-contrast` violations (4.49); "A" and "1" are incomplete. With the required setting nothing is reported. The docs' heading gets the name "Unread Messages" and the description "1" in the CDP tree; a heading with the badge inside is named "Unread messages 1 unread message"; a button with the badge inside "Messages 3 unread"; a button with `aria-describedby` at a badge beside it is "Cart" described by "2 items"; `aria-label` on a plain `span` badge is an `aria-prohibited-attr` violation, and `role="img"` with `aria-label` is an image named "Done"; a link that is only a badge is named "4"; icon-only badges with no text report nothing.
- E4, geometry (`geometry.mjs`), 320 CSS px, three engines, with and without the 1.4.12 text spacing: one character is 20.16 px wide and 20.1 to 21.1 px tall by line height, and inside a `.button` 20.16 by 15.34 px. The corners of the text's line box lie inside the ellipse `border-radius: 50%` paints up to three characters ("99+", "100") in every engine with the spacing (0.90 to 0.98 in the ellipse's equation); "1000" and "New" cross it in Chromium with the spacing (1.05, 1.01), "10000" in every engine with it.
- E5, Foundation's text colour pick (`scan.mjs`, `flip.mjs`): on an RGB grid in steps of 15, 352 colours have exactly one passing candidate with the better under 4.8:1; for 9 of them `color-pick-contrast()` picks the failing one. `#e10f69`: exact white 4.6542, black 4.2178; Foundation's white 4.4044 (rounded 4.4), black 4.4570 (4.5), so it picks black. Likewise `#c30fe1`, `#d20fb4`, `#e10f87` (white 4.5072 passes, black picked at 4.3553). Foundation's pick also ignores alpha.
- E6, forced colours (`forced.mjs`, Playwright emulation, Chromium and Firefox): the badge's background computes to Canvas, its text and an SVG icon's `currentColor` stroke to CanvasText.
- E7, candidate `nfs-badge` (`_nfs-badge.scss`, `compile.mjs`): over Foundation's defaults it stops with one `@error` naming `$badge-palette` alert `#cc4b37` with both ratios (4.498, 4.364); with the required setting it emits exactly `:root { --nfs-badge-palette: primary secondary success warning alert; }`; the Progress Bar line alone still stops it; Foundation's docs palettes compile; `pink: #e10f69` emits `.badge.pink { color: #fefefe; }`; `#777777` and `#1177dd` stop it; a light `$badge-background` with white `$badge-color` stops it (1.84:1) and compiles with a dark `$badge-color`; `$badge-palette: ()` writes an empty property; `rgba(#1779ba, 0.5)` is composited and gets a `$black` rule.
- Sources read: Foundation's badge docs page, Sass partial, settings file, and `color-pick-contrast()`, `color-contrast()`, `color-luminance()`; Angular Material 22.2's `MatBadge` source and docs (aria-hidden content, `AriaDescriber` only for focusable hosts, inline hidden text otherwise); the APG names-and-descriptions practice (descriptions on controls); the WCAG 2.2 Understanding document for 4.1.3 (read from the copy the Progress Bar ticket fetched from the w3c/wcag repository), whose shopping-cart examples say to mark the whole "3 items" string as the status text and add offscreen words such as "in shopping cart".

### Grilling record

Round 1 (nothing settled yet).

- Q1, directive or component, and which hosts. For Material's shape: a directive on the decorated element that creates the badge. Against: ADR 0001 allows generated structure only where Foundation generates it, and Foundation's badge is an element the consumer writes ("any tag will work fine"). Settled: one attribute directive on any element (decision 1).
- Q2, which classes. Read from the Sass: one Structural class, one Open Variant family (`$badge-palette`), no State class, no sizes. Settled (decisions 1, 2).
- Q3, role and ARIA. For Material's `aria-hidden` content plus a description: one announcement. Against: the text is already in the DOM where it is read, and hiding it would need a second copy. For `role="status"` by default: live counts. Against: most badges are static, polls would speak every change, and a status region inside a button is presentational. Settled: no role, no ARIA (decisions 3, 8).
- Q4, the relationship to what the badge counts. Measured (E3): a badge inside a heading or button joins its name; Foundation's heading reference is a description, not part of the heading's name. Material describes only focusable hosts. Settled: inside by default, `aria-describedby` only from a focusable control (decision 4).

Round 2 (Q1 to Q4 settled).

- Q5, the `color` type. `$badge-palette` is its own setting with a chained default, so the Button's chained registry applies, not the Callout's plain alias (which could not remove a badge-only name). Settled (decision 2).
- Q6, contrast. Measured (E1, E3): alert fails with both candidates; axe sees nothing on one-character badges, which are all of Foundation's examples. Settled: a compile-time check over the uncoloured pair and every entry (decision 9).
- Q7, which setting fixes alert. Options: the Progress Bar's `$foundation-palette` line; a `$badge-palette` line; a library recolour. Measured (E2): the `$foundation-palette` line in an overrides file does not reach `$badge-palette`. Settled: the scoped `$badge-palette` line, with the settings-file alternative documented (decision 10).
- Q8, Foundation's pick. Measured (E5): it can pick the failing candidate while the other passes. Options: check only and name both ratios; correct the pick where it differs; raise `$global-color-pick-contrast-tolerance` (changes every component). A passing brand colour should not stop the compile for Foundation's arithmetic, and the Progress Bar already picks by the exact ratio. Settled: correct only where the pick differs (decision 9).

Round 3 (Q5 to Q8 settled).

- Q9, icon badges. Measured (E3): axe reports nothing for text-less badges and prohibits `aria-label` on a plain `span`. Settled: hidden text with an `aria-hidden` icon, or `role="img"` with a name, and a development check (decision 5).
- Q10, colour meaning (1.4.1). The directive cannot read wording. Settled: a content requirement shown in every recipe and asserted in every story, as the Callout and Progress Bar have it (decision 6).
- Q11, copied classes and the Runtime check. Settled: the Button's D22 warning; `include('nfs-badge', ['badge-palette'])`, one writer (decisions 7, 11).
- Q12, a badge as a control. For a warning: a 20 px target named by its number. Against: not documented markup, axe `target-size` and name queries catch the harm, additive later. Settled: documented rule, no check (decision 12).
- Q13, text length. Measured (E4): up to three characters stay on the painted ellipse under text spacing. Settled: a documented content rule, longer text is a Label (decision 13).

Round 4 (Q9 to Q13 settled).

- Q14, forced colours, rendering modes, stories, seams, and vocabulary. Measured (E6): nothing is lost under forced colours. Settled: no rule; host bindings only; five stories; e2e for text-spacing geometry and reflow in three engines and the fixture app; a manual screen-reader release test; one glossary term (decisions 14 to 16).

The frontier is empty.

### Decisions

1. One attribute directive, `NfsBadge`, selector `[nfsBadge]` on any element, `exportAs: 'nfsBadge'`, in its own entry point `ngx-foundation-sites/badge`. It binds `.badge` as a static host class.
2. `color: NfsBadgeColor | undefined`, with `NfsBadgeColor = NfsOverridableStringUnion<NfsFoundationPaletteColor, NfsBadgePaletteOverrides>` over `$badge-palette` (chained on `NfsFoundationPaletteOverrides`, as the Button's `$button-palette`). The value is the class; unset sets none (`$badge-background` is the look). Variant property `--nfs-badge-palette`.
3. No State classes, role, ARIA, outputs, methods, models, Defaults token, or providers; `role`, `id`, `aria-*`, and `hidden` stay the consumer's.
4. A badge sits inside the element it counts; `aria-describedby` references a badge only from a focusable control beside it; Foundation's heading `aria-describedby` example is corrected to a badge inside the heading.
5. A development warning, once at the first render, for a badge with no text outside `aria-hidden` subtrees, unless the host is `aria-hidden` or `role="img"` with a non-blank `aria-label` or `aria-labelledby`; it names `aria-prohibited-attr` when a bare `aria-label` is present. Icon recipes use visually hidden text and an `aria-hidden` icon drawn in `currentColor`.
6. The badge's text, visible or visually hidden, says the count's meaning and what its colour suggests (1.4.1, 1.3.1), a content requirement shown in every recipe and asserted in every story.
7. A development warning, once, for Foundation's default palette names copied into the host's static class list.
8. No default live role; a count the user's action changes is a `role="status"` badge that exists before the change and holds the whole message (4.1.3).
9. `nfs-badge` stops the compile with one `@error` listing every pair under 4.5:1 by the exact formula (`$badge-color` on `$badge-background`; each `$badge-palette` entry with the better of `$badge-color` and `$badge-color-alt`), each with both ratios; and emits `.badge.<name> { color: <the better one>; }` only where Foundation's `color-pick-contrast()` picked the other (none on Foundation's defaults).
10. Required on Foundation's defaults: `$badge-palette: map-merge($foundation-palette, (alert: #bf3f2c));` (5.255:1), mirrored in the Storybook settings overrides; in a consumer's own copy of the settings file, changing the palette's alert entry to `#bf3f2c` also works, because its Badge section follows it.
11. Runtime check: `include('nfs-badge', ['badge-palette'])` on every run and `value('color', ...)` for a bound colour; `--nfs-badge-palette` has one writer.
12. A badge is never a control; documented, not checked.
13. A badge holds a count of up to three characters, a letter, or an icon; longer text is a Label; documented, not checked.
14. Native implementation level; listener-free; every effect a host binding in server HTML; checks only in a client render callback; no Hydration boundary of its own; live counts not in `hydrate never`; no forced-colours rule.
15. Story ids `badge--default`, `badge--colors`, `badge--icons`, `badge--in-controls`, `badge--status`; e2e for 1.4.12 geometry and reflow in three engines and the fixture app's first paint and hydration; a manual screen-reader release test.
16. One glossary term, **Badge** (below).

### Triage

Rule: [map](../map.md), Orchestration rules, "Triage of human-only items".

| Item | Impact | Confidence | Outcome and evidence |
| --- | --- | --- | --- |
| The directive, its input, alias, and registry (decisions 1 to 3, 11) | HIGH (public names and types) | HIGH (mechanical under ADR 0001, ADR 0039, ADR 0040, building-blocks 1.3, 1.4, 1.13; the tooling spec's `$badge-palette` row; the Button's chained alias) | Decided |
| The placement rule and the heading correction (decision 4) | MEDIUM (recipes and docs, no API) | HIGH (measured names and descriptions; Material's documented split) | Decided |
| The check, the required setting, and the pick correction (decisions 9, 10) | MEDIUM (one palette colour; a library rule that is empty on the defaults and additive to remove) | HIGH (measured with the exact formula; axe confirms, and cannot see one-character badges; the settings order measured) | Decided |
| The text check (decision 5) | LOW (development only) | HIGH (axe measured silent on text-less badges and strict on `aria-label`) | Decided |
| Content rules (decisions 6, 12, 13) | LOW (documentation; a check is additive later) | HIGH (geometry measured in three engines; the Callout's and Progress Bar's content-requirement precedent) | Decided |
| No live role, copied classes, rendering modes, stories, vocabulary (decisions 7, 8, 14 to 16) | LOW or MEDIUM | HIGH | Decided |

Nothing is OPEN FOR HUMAN, and no prototype is needed: the questions that needed measurement were measured here. The screen-reader announcements are a manual release test, as ADR 0022's dated consequence has it.

Dissent recorded: check-only for Foundation's pick (the Button spec's current approach for its labels), against decision 9; the Progress Bar's `$foundation-palette` line as the Badge's required setting, against decision 10 (it fails under an overrides file); Material's `aria-hidden` badge with a description, against decisions 3 and 4; a development warning for a badge on a control, against decision 12.

### Proposed shared-file changes

1. `building-blocks.md`, Table D, the Badge row: fill the empty cells.

   "| Badge | `docs/pages/badge.md` | [Spec: Badge](issues/93-spec-badge.md) | `[nfsBadge]` (`NfsBadge`: binds `.badge`; `color` Variant input over `NfsBadgePaletteOverrides`, chained on `NfsFoundationPaletteOverrides`; `exportAs: 'nfsBadge'`); the badge sits inside the heading or control it counts, or a focusable control references it with `aria-describedby`; a live count is the consumer's `role="status"` | Directive: `.badge` is a Structural class on a consumer-written element, and Foundation generates nothing | Native platform (the element's text, Foundation's CSS, a native `status` region); Aria has no badge or status pattern and CDK adds nothing | A static host class and one `computed` class list; development text and copied-class checks in one render callback; the `strictVariantNames` and `strictVariantProperties` Runtime checks; `nfs-badge` (`--nfs-badge-palette`, the better text colour where Foundation's pick is the worse, one `@error` over badge text contrast) | None for the badge; the containing control's pattern; `status` for a live count |"

2. `building-blocks.md` 1.10, a new bullet after the Progress Bar bullet:

   "- Badge ([Spec: Badge](issues/93-spec-badge.md)): `nfs-badge` stops the compile when a badge's text is under 4.5:1 (`$badge-color` on `$badge-background`, for which Foundation picks nothing, and each `$badge-palette` entry with the better of `$badge-color` and `$badge-color-alt`), and gives an entry the better candidate where Foundation's `color-pick-contrast()` picked the other. The consumer must set `$badge-palette: map-merge($foundation-palette, (alert: #bf3f2c));` (the alert badge is 4.498:1 with `$white` and 4.36:1 with `$black`), mirrored in the Storybook settings overrides; an overrides file that merges `$foundation-palette` does not reach `$badge-palette`, which Foundation's settings file has already assigned. axe marks every one of Foundation's badge examples incomplete or passing, because they are single characters, so the compile-time check is the only one that sees the alert example."

3. `building-blocks.md` 1.10, the first bullet: after "... [Spec: Button](issues/37-spec-button.md), WCAG 2.2 AA revision)." append:

   " A text colour Foundation picks with `color-pick-contrast()` is checked as Foundation emits it: that function compares ratios from the approximate `color-luminance()`, rounded to one decimal, keeps the first candidate on a tie, and ignores a translucent colour's alpha, so it can pick the failing candidate while the other passes (measured by the [Spec: Badge](issues/93-spec-badge.md) ticket: on `#e10f69` it picks `$black` at 4.22:1 where `$white` reaches 4.65:1); each spec that relies on the pick decides whether its mixin corrects it, as `nfs-badge` does, or only checks it."

4. `building-blocks.md` 1.10, the "axe cannot enforce" bullet: replace "marks text contrast over images incomplete," with "marks text contrast over images and of one-character text incomplete (`shortTextContent`: every one of Foundation's badge examples, measured by the [Spec: Badge](issues/93-spec-badge.md) ticket),".

5. `CONTEXT.md`, Foundation side, after **Callout** (and after **Progress Bar** and **Progress meter** once the Progress Bar ticket's terms land):

   ```markdown
   **Badge**:
   Foundation's CSS-only component that shows a short count, letter, or icon beside or inside what it counts, marked by the `.badge` Structural class and coloured from `$badge-palette`; distinct from a Label, which tags content with words, and from Angular Material's badge, which decorates its host.
   _Avoid_: counter, pill, notification dot, chip
   ```

6. `README.md`, the Plugins table, after the Callout row (or the Progress Bar row once it lands):

   "| Badge (CSS-only component) | [specs/badge.md](specs/badge.md) | Native platform (the consumer's element and its text, Foundation's CSS, a native `status` region); one listener-free directive | No inventory: Foundation's badge docs and Sass, with the [out-of-scope triage](research/out-of-scope-triage.md) (Badge, Label row) | None needed; contrast, Foundation's text colour pick, the settings order, names, and geometry measured in [Spec: Badge](issues/93-spec-badge.md) |"

7. `storybook-conventions.md`, section 5:
   - The `_settings-overrides.scss` block, after the Progress Bar's lines (or after the Callout's lines if those have not landed):

     ```scss
     // color-contrast (1.4.3): nfs-badge stops the compile on Foundation's alert badge, whose $white text is 4.498:1
     // (4.36:1 with $black); axe marks one-character badges incomplete (shortTextContent) and reports 4.49 on longer
     // ones. Foundation's settings file assigned $badge-palette before this file, so a $foundation-palette merge does
     // not reach it. Spec: Badge, badge--colors and badge--in-controls.
     $badge-palette: map-merge($foundation-palette, (alert: #bf3f2c));
     ```

   - The `preview.scss` block: after the `nfs-progress-bar` include (or after `@include nfs-top-bar;`), add `@include nfs-badge; // Badge: text contrast check, the text colour where Foundation's pick is the worse, and --nfs-badge-palette; every badge--* story`.
   - The Progress Bar's override comment, if it has landed as its ticket proposed ("it also recolours alert callouts, badges, and labels in every story (all still passing)"): replace that clause with "it also recolours alert callouts in every story (still passing); badges, labels, and buttons keep the palettes Foundation's settings file assigned before this file, so their specs add lines of their own (measured, [Spec: Badge](issues/93-spec-badge.md))".

8. `map.md`, Decisions so far: the gist at the end of this Answer.

No new ADR: the pick correction and the placement rule are reversible without touching consumer API (the rule is empty on Foundation's defaults), and the required setting is a consumer setting, so none meets the "hard to reverse" test; building-blocks 1.10 records them.

### What other specs need from this one

- [Spec: Label](94-spec-label.md) (in progress): measured here (E2, `order-label.mjs`), the Progress Bar's `$foundation-palette` line in the Storybook overrides leaves `.label.alert` at `#cc4b37`, because Foundation's settings file assigns `$label-palette` before the overrides; the [Spec: Progress Bar](95-spec-progress-bar.md) Answer's statement that its override changes the Label stories' alert colour does not hold. `color-pick-contrast()` can pick the failing candidate on label colours too (E5); axe's `shortTextContent` applies to one-character labels. The Label spec decides its own required line and whether it corrects the pick.
- [Spec: Progress Bar](95-spec-progress-bar.md) (resolved): in its "What other specs need" Badge and Label bullet, "the Storybook override of proposal 9 changes their stories' alert colour" should read "the Storybook override of proposal 9 does not reach their palettes, which Foundation's settings file assigns before the overrides (measured by the [Spec: Badge](93-spec-badge.md) ticket), so each adds its own line"; the matching storybook-conventions comment is proposal 7 above. Its own verdicts are unaffected: `.progress` loops over `$foundation-palette` itself.
- [Spec: Button](37-spec-button.md) and [Re-run: Button spec under the class rule](128-rerun-button-class-rule.md) (resolved): `nfs-button` checks the label colour Foundation's `color-pick-contrast()` picks on each `$button-palette` entry; measured here, that pick can be the failing candidate while the other passes (`#e10f69`: `$black` 4.22:1 picked, `$white` 4.65:1), so a passable brand colour stops the Button's compile. No verdict on Foundation's defaults changes; whether `nfs-button` corrects the pick as `nfs-badge` does is for the consistency review.
- [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md): the `NfsBadgePaletteOverrides` entry (`$badge-palette`, `--nfs-badge-palette`, base `$foundation-palette`) gets `mixins: ['nfs-badge']` and one `uses` entry `{entryPoint: 'ngx-foundation-sites/badge', directive: 'NfsBadge', input: 'color', alias: 'NfsBadgeColor', shape: 'name'}`. The typings check covers `NfsBadgeColor`. Measured for its `base` rule: in an overrides file, a `$foundation-palette` merge does not reach `$badge-palette`, so the badge registry's effective names can differ from `--nfs-foundation-palette` even when the consumer wrote no `$badge-palette` line.
- [Spec: Visibility Classes](104-spec-visibility-classes.md) (open): every badge recipe uses its screen-reader-only directive for `.show-for-sr`, written `nfsShowForSr` until it names it; the Badge stories and the SSR smoke assert `show-for-sr` on it.
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): check that no spec writes `.badge` or a palette class on a badge; that every Storybook override that merges `$foundation-palette` states which palettes it reaches (Callout and Progress Bar directly; not Badge, Label, or Button); that the specs relying on `color-pick-contrast()` (Button, Button Group, Label) take a position on the measured wrong pick; and that `nfsShowForSr` is renamed once the Visibility Classes spec names its directive.
- [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md): the spec's Out of Scope items and rejected alternatives each carry a category.

### Gist for Decisions so far

- [Spec: Badge](issues/93-spec-badge.md) -- one listener-free `[nfsBadge]` binding `.badge`, with `color` over `NfsBadgePaletteOverrides` chained on the shared palette; no role: the badge sits inside the heading or control it counts (measured: it joins their names, while Foundation's heading `aria-describedby` is a description heading navigation drops), a focusable control beside it references it, and a live count is the consumer's `role="status"`; development checks for a text-less badge (axe reports nothing for Foundation's icon badges) and copied classes; measured with the exact formula: Foundation's alert badge is 4.498:1, which axe marks incomplete on every one-character example, and Foundation's `color-pick-contrast()` can pick the failing text colour, so `nfs-badge` checks every pair, corrects the pick where it is the worse, and needs `$badge-palette: map-merge($foundation-palette, (alert: #bf3f2c));`, because the Progress Bar's `$foundation-palette` merge does not reach `$badge-palette` from an overrides file; impact MEDIUM to HIGH, confidence HIGH; no ADR. Spec: [specs/badge.md](specs/badge.md).

### Note, 2026-09-28 (out-of-scope reasons)

- 2026-09-28: the Out of Scope reasons named in [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md) are corrected in the spec.
