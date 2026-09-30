# 95. Spec: Progress Bar

Type: grilling
Status: resolved
Blocked by: 81
Labels: wayfinder:grilling
Map: ../map.md

## Question

What Angular directives (preferred) or components give Foundation for Sites 6.9's Progress Bar to the next, from-scratch ngx-foundation-sites repo, under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Foundation's docs page is `docs/pages/progress-bar.md` and its Sass is `scss/components/_progress-bar.scss, forms/_progress.scss, forms/_meter.scss` in the 6.9.0 clone. Publish `specs/progress-bar.md`.

Known from the triage: The directive owns `role="progressbar"`, the `aria-value*` set from typed inputs, the meter width, and a name check (every Foundation example fails axe `aria-progressbar-name`); say when native `<progress>` or `<meter>` is the better element.

## How to work it

Run `/grill-with-docs` (self-grilling, both sides) over the questions this component raises, then publish with `/to-spec` in the map's spec shape; the [Spec: Button](37-spec-button.md) is the nearest precedent. Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this component); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Cover: one directive per Structural class and what else each owns (the ARIA, `type` default, or development and compile-time checks the documented markup lacks for WCAG 2.2 AA, ADR 0022); every Variant as a typed input by the decision above; State classes as host bindings; the Sass mixin only where custom CSS or checks are needed (ADR 0012); the rendering-mode contract; stories with play functions and axe; e2e only where Storybook cannot reach. Record the decisions in this ticket's Answer, and propose shared-file changes (a building-blocks row, glossary terms) for the orchestrator. Model: Opus 5.5.

## Answer

Model: Opus 5.5 (AFK: the agent played both sides of the interview; map Notes, AFK override).

Spec: [specs/progress-bar.md](../specs/progress-bar.md).

### Measurements made for this ticket

Several questions needed facts the bundle did not have, so the ticket measured them in a throwaway workspace (`D:/tmp/nfs-wave-95/`, not committed; no server, no port, no junction). Foundation 6.9.0 Sass from the local clone, compiled with Dart Sass 1.104.1; Playwright 1.63 in Chromium, Firefox, and WebKit; axe-core 4.13.0 with the six WCAG 2.2 AA tags; read-only Windows UI Automation from PowerShell 7. Every ratio uses the exact WCAG relative-luminance formula (`math.pow`), unrounded, per the [Spec: Top Bar](86-spec-top-bar.md) finding; Foundation's `color-luminance()` figures are given beside them below where they differ.

- E1, ratios (`ratios.scss`, `ratios.mjs`). Track `$medium-gray` `#cacaca` against the page `#fefefe`: 1.625. Fills against the track: default and primary `#1779ba` 2.860, secondary 2.771, success 1.107, warning 1.133, alert 2.768. Meter text `$white` on the fills: primary 4.647, secondary 4.504, success 1.799, warning 1.842, alert 4.498; `$black` on them: 4.224, 4.359, 10.912, 10.659, 4.364. `$white` on the track 1.625, on the page 1. Meter element: good 1.107, medium 1.133, bad 2.768 against `$meter-background`. Tracks that pass every default fill and the page: only near-black ones (`$black`: fills 4.224 to 10.912, the page 19.630); `$light-gray` passes primary, secondary, and alert (3.64 to 3.76) but not success and warning (1.45, 1.49) and is 1.24 on the page. With the Button's darker success, warning, and alert and a `$light-gray` track every fill passes against the track (3.64 to 4.75) and `$white` passes on every fill (4.50 to 5.88). `#bf3f2c` for alert: `$white` 5.255. Callout backgrounds with that alert: the alert callout keeps links at about 4.85:1 and the glyph at about 3.63:1 (Callout's required colours, unrounded faded channels).
- E2, axe on Foundation's docs examples verbatim (`axe.mjs`): `aria-progressbar-name` on all four `role="progressbar"` examples; nothing on the three colour examples without a role, the native `<progress>` examples, or the `<meter>` examples. Meter text at 60 percent on every fill: `color-contrast` violations on success 1.79, warning 1.84, alert 4.49; at 0 and 2 percent axe marks the text's contrast incomplete ("partially obscured").
- E3, meter text geometry (`geometry.mjs`), bar 320 and 1024 CSS px wide, with and without the 1.4.12 overrides, identical within 0.1 px in three engines: "0%" (17.3 px) fits inside its meter from a value of 8 at 320 px and 2 at 1024 px; "100%" (30.7 px, 36.5 px spaced) from 10 (15 spaced) and 3 (5 spaced); "3 of 12 files" (65.4 px, 89.8 px spaced) from 25 (not within 25 spaced) and 8 (10 spaced). Below the fit the text also passes the bar's start edge. The text's line box is 18 px against the 16 px bar at every value.
- E4, forced colours (`forced.mjs`, Playwright emulation): Chromium paints the `.progress` track and meter and the native `<progress>` in Canvas (invisible) and keeps the `<meter>` fill; Firefox paints `.progress` and `<meter>` in Canvas and keeps native `<progress>`; WebKit matches the media query but forces nothing. The meter text's darkest pixel is black on Canvas in Chromium. Indeterminate native `<progress>` under Foundation's element styles: an empty track in Chromium and WebKit, a full bar in Firefox.
- E5, accessibility tree (`a11y.mjs`, `uia-serve.mjs`, `uia.ps1`): Chromium CDP gives the `progressbar` its name from `aria-labelledby`, value 3, bounds 0 and 12, and one child with role `none` (the meter; children presentational). Windows UI Automation over Chromium: ProgressBar, RangeValue 0 to 12 at 3, Value "3 of 12 files" from `aria-valuetext`, no children; native `<progress>` named from its `<label>`; `<meter>` a ProgressBar with the localized meter type. Over Firefox the same names and range values, and an empty Value for the `aria-valuetext` bar (its screen readers read IAccessible2, which this probe does not show). CDP's `valuetext` property read empty in Chromium, a CDP reporting gap that UI Automation contradicts.
- E6, candidate `nfs-progress-bar` (`nfs-progress-bar.scss`, `compile.mjs`, `exact.mjs`): over Foundation's defaults it stops with one `@error` naming alert `#cc4b37` at 4.498:1; with `(alert: #bf3f2c)` it emits `:root { --nfs-foundation-palette: primary secondary success warning alert; }` and two rules giving success and warning meter text `$black`; a light `$progress-meter-background` (`#ffae00`) emits a default `$black` rule and `$white` rules for primary, secondary, and alert; `#777777` stops it (4.44:1 and 4.42:1); `#1177dd` stops it at 4.437:1 with `$black` by the exact formula, where Foundation's function reports 4.505:1. With the required setting axe reports no violation and no incomplete result on meter text over every fill.
- E7, right to left (`rtl.mjs`): the fill starts at the right for `.progress` and native `<progress>` in three engines.
- Sources read: WAI-ARIA `progressbar` (Name From: author; Accessible Name Required: True; Children Presentational: True; `aria-valuenow` omitted only when indeterminate); the APG Meter pattern and range-related-properties practice; the WCAG 2.2 Understanding documents for 1.4.11 ("Required for understanding" and the testing principles), 4.1.3 (the dynamic progress bar example), and 2.2.2 (fetched from the w3c/wcag repository, because the w3.org site answered markdown.new with a Cloudflare challenge); Angular Material 22.2's `MatProgressBar` source; Foundation's `color-pick-contrast()`, `color-luminance()`, and `pow()`.

Exact formula against Foundation's `color-luminance()` (the coordinator's request): `#1779ba` changes the most: `$white` text 4.587 to 4.647, against the track 2.822 to 2.860, `$black` text 4.280 to 4.224; `#bf3f2c` with `$white` 5.252 to 5.255; `#cc4b37`, `#767676`, `#3adb76`, `#ffae00`, and `#cacaca` pairs agree to four decimals. No verdict of this spec changes. One verdict flips in a rejected option: `#2b2b2b` as a track gives primary 2.99:1 by Foundation's function and 3.02:1 exactly; the recorded alternative uses `$black` (4.224 exact, 4.280 by Foundation's), which passes either way.

### Grilling record

Round 1 (nothing settled yet).

- Q1, directives or a component, and which hosts. For a component: `nfs-progress-bar` could render the meter from a `value`. Against: ADR 0001 allows a component only for structure Foundation generates, and Foundation's docs markup carries the meter. Native `<progress>` takes palette classes (ADR 0039, dated note), so it needs its own directive; `nfsProgress` on it would add `.progress`'s track styles and a redundant role. Settled: four directives, three Structural and `progress[nfsProgressElement]` (decision 1).
- Q2, the value API. Options: `value`, `min`, `max`, `valueText` inputs (the triage's row); a `model()`; Material's fixed 0 to 100; a `displayWith` formatter as the Slider has. A progress bar is read-only, Foundation's docs show other ranges through `aria-valuemax`, and a string is Foundation's own attribute. Settled: four inputs with `numberAttribute` on the numbers, clamping, and a read-only `percentage` (decision 2).
- Q3, the ARIA. Settled from WAI-ARIA and Foundation's markup: static role, both bounds always bound, no `tabindex` (Material's workaround would make a non-interactive bar take focus on a pointer press), no live region (it would speak every update), no `aria-busy` (it belongs on the region being loaded) (decision 3).
- Q4, the palette. Both class sets loop over `$foundation-palette` itself. Settled: one alias `NfsProgressColor = NfsFoundationPaletteColor` for both directives, as the Callout aliases it (decision 4).

Round 2 (Q1 to Q4 settled).

- Q5, how the meter gets its width. Options: a style binding from a parent token; a custom property and a library rule; a `width` input on the meter. Foundation's mechanism is the inline width, and the parent-token pattern is building-blocks 1.9's. Settled: `[style.width.%]` from `nfsProgressToken`, required (decision 5).
- Q6, 1.4.11 for the graphic. Measured (E1): every default fill fails against the track and the track fails against the page; with a palette of light and dark colours only a near-black track passes. The Understanding document exempts a graphic whose information is in visible text. Options: (a) graphic checks with a required `$progress-background: $black`; (b) fill-against-track checks only, as the Slider has (passes no track-against-page test and still forces a global palette change or a near-black track); (c) the Visible value as the contract, no graphic check; (d) (c) with an opt-in parameter for text-less bars. For (a): exact, no content assumption, the Callout's unconditional style. Against (a): a black track for every consumer, including those whose bars already show text, which WCAG does not ask of them. Against (d) now: a parameter nobody needs until text-less bars are wanted, and additive later. The Slider keeps its fill check because its value has no text. Settled: (c), with (a) as the recorded upgrade path through (d) (decision 6).
- Q7, meter text contrast. Measured (E1, E2): `$white` fails on success, warning, and alert; Foundation has no meter-text colour setting. Options: darker success and warning in `$foundation-palette` (recolours callouts, badges, labels, and buttons, which the Callout's D8 rejected); a library rule picking `$black` where it contrasts more, as Foundation's Badge, Label, and Button text does; pure `#ffffff` or `#000000` (not Foundation colours). Alert fails with both candidates (4.498 and 4.36), so only its colour can change. Settled: the picking rule by exact ratio, a check over every fill, and a required alert of `#bf3f2c`, the Button's and Abide's colour (decisions 7 and 8).
- Q8, the native progress element's API. An input named `value` would capture `[value]` from the native property. Settled: colour only (decision 9).
- Q9, `<meter>`. No class, so no directive (ADR 0039); its range colour needs text for 1.4.1 anyway. Settled: documented only (decision 10).

Round 3 (Q5 to Q9 settled).

- Q10, meter text overflow. Measured (E3): the centred text spills over the track and past the bar's start below a value that depends on the text and the bar's width; axe marks it incomplete, so the story gate cannot see it. Options: clip the text in the meter (a cut value is not readable); move it in CSS for narrow meters (CSS cannot compare a container's width with its content's); a minimum meter width (misstates the value); a development check after render. Settled: the check, once per instance, and the docs' rule that a meter text is only for bars whose meter is always wider than its text (decision 11).
- Q11, names. A `progressbar` takes its name from the author only; axe checks no native element. Settled: development checks on both hosts, with labels counted on the native one (decision 12).
- Q12, the Runtime check and the one-writer rule that landed in building-blocks 1.13 and ADR 0040 while this ticket ran. `--nfs-foundation-palette` is the Progress Bar's only Variant property, and `nfs-callout` writes it too. Options: two writers of a setting no entry point owns, with the Progress Bar's presence hidden while `nfs-callout` is included; one shared writer mixin (one more include, and the Progress Bar's own include still undetected); a presence property that is not a Variant property (a new Runtime-check concept). The hidden case's visible consequence (success and warning meter text) is still an axe violation. Settled: two writers, with the exception proposed for building-blocks 1.13 and ADR 0040 and the presence property as the upgrade path (decision 13).
- Q13, indeterminate. Foundation has no look for it, and an empty track reads as 0. Settled: out of the first release, additive later (decision 14).
- Q14, forced colours. Measured (E4): the bar disappears in Chromium and Firefox and the text stays. Under decision 6 no information is lost. Settled: no rule, additive later (decision 15).
- Q15, the luminance formula, after the coordinator's message relaying the Top Bar finding. Settled: the exact helper for the check and the pick, ratios re-computed (above).

Round 4 (Q10 to Q15 settled).

- Q16, which element when (the triage asked, and the scope lens dissented: native first). Settled as guidance: native `<progress>` where it covers the need, `nfsProgress` for meter text, a non-zero minimum, or migrated markup, `<meter>` for measurements (decision 16).
- Q17, copied classes and a bad range. Settled: the Button's D22 warning, and a warning for `max` not above `min` (decision 17).
- Q18, rendering modes, stories, seams, and vocabulary. Settled: host bindings only, seven stories, e2e for geometry, forced colours, and right to left in real engines, a manual screen-reader release test, three glossary terms (decisions 18 to 20).

The frontier is empty.

### Decisions

1. Four attribute directives in the entry point `ngx-foundation-sites/progress-bar`: `NfsProgress` (`[nfsProgress]`, binds `.progress`, `exportAs: 'nfsProgress'`), `NfsProgressMeter` (`[nfsProgressMeter]`, `.progress-meter`), `NfsProgressMeterText` (`[nfsProgressMeterText]`, `.progress-meter-text`), and `NfsProgressElement` (`progress[nfsProgressElement]`, the palette class of a native progress element), named after `foundation-progress-element`.
2. `NfsProgress` inputs: `value`, `min`, `max` (`numberAttribute`, defaults 0, 0, 100, falling back to them for a value that is not a number) and `valueText` (`string | undefined`, feeds `aria-valuetext`, empty sets none); the value is clamped into the range; `percentage` is a read-only `computed` (0 while `max` is not above `min`). No models, outputs, or methods.
3. Host bindings: static `role="progressbar"`; `aria-valuenow` (clamped), `aria-valuemin`, `aria-valuemax` always; `aria-valuetext` from `valueText`. No `tabindex`, live region, or `aria-busy`; the name stays the consumer's.
4. `color` Variant input on `NfsProgress` and `NfsProgressElement`, one alias `NfsProgressColor = NfsFoundationPaletteColor` over `NfsFoundationPaletteOverrides`; the value is the class; unset sets none; Variant property `--nfs-foundation-palette`.
5. `NfsProgressMeter` binds `[style.width.%]` from `percentage()` through `nfsProgressToken` (exported, `useExisting`, injected required). `NfsProgressMeterText` injects `NfsProgressMeter` required, by class.
6. The Visible value: every progress bar, native progress element, and meter shows its value as text, in its meter text or beside it, which the Understanding document for 1.4.11 exempts from graphic contrast. `nfs-progress-bar` checks no graphic pair. Text-less bars are out of the first release; the upgrade path is an opt-in graphic check whose passing setting on Foundation's defaults is `$progress-background: $black`.
7. `nfs-progress-bar` gives meter text `$black` on every fill where `$black` contrasts more than `$white` by the exact ratio, and restores `$white` on coloured bars when the default fill picks `$black`; on Foundation's defaults, success and warning.
8. `nfs-progress-bar` stops the compile with one `@error` listing every fill whose meter text is under 4.5:1 (exact formula); required on Foundation's defaults: `$foundation-palette: map-merge($foundation-palette, (alert: #bf3f2c));` (5.25:1), mirrored in the Storybook settings overrides.
9. `NfsProgressElement` owns the colour only; `value`, `max`, the role, `aria-valuetext`, and the labels stay native.
10. `<meter>` gets no directive; the docs require a label and the value with its range in text (1.4.1).
11. `NfsProgressMeterText` warns once in development when its text is wider than its meter, at the first render and after each value change, horizontal extent only.
12. Development name checks: `NfsProgress` from `aria-labelledby`, `aria-label`, and `title` only; `NfsProgressElement` adds its `labels`; once, at the first render. The docs put `nfsProgressElement` on every native progress element for the check.
13. Runtime check: `include('nfs-progress-bar', ['foundation-palette'])` on every run and `value('color', ...)` for a bound colour, on both colour-bearing directives. `nfs-progress-bar` and `nfs-callout` both write `--nfs-foundation-palette`; while `nfs-callout` is included, a missing `nfs-progress-bar` is not reported (documented limit).
14. No indeterminate mode, buffer value, or other Material mode; native `<progress>` without `value` is the documented alternative.
15. No forced-colours rule.
16. Element guidance: native `<progress>` with `nfsProgressElement` for task progress from 0 with the value beside the bar; `nfsProgress` for meter text, a non-zero minimum, or migrated markup; `<meter>` for a measurement in a known range, never for task progress.
17. Development warnings for Foundation's default palette names copied into a host's static class list (both hosts), and for `max` not above `min`.
18. Native implementation level; listener-free; every effect a host binding in server HTML; checks only in client render callbacks; the bar and its meter in one Hydration boundary; live bars not in `hydrate never`.
19. Story ids `progress-bar--default`, `--colors`, `--with-text`, `--live`, `--native-progress`, `--native-meter`, `--right-to-left`; e2e for meter text geometry with and without text spacing, forced colours (Chromium, Firefox), right to left in three engines, reflow, and the fixture app's first paint and hydration; a manual screen-reader release test.
20. Three glossary terms, **Progress Bar**, **Progress meter**, and **Visible value** (below).

### Triage

Rule: [map](../map.md), Orchestration rules, "Triage of human-only items".

| Item | Impact | Confidence | Outcome and evidence |
| --- | --- | --- | --- |
| The directive set, inputs, token, and alias (decisions 1 to 5, 9) | HIGH (public names and types) | HIGH (mechanical under ADR 0001, ADR 0039, ADR 0040, building-blocks 1.3, 1.4, 1.9; the triage's row; Material's clamping) | Decided |
| The Visible value instead of graphic checks (decision 6) | MEDIUM (a content contract; an opt-in graphic check is additive, so nothing shipped is re-touched) | HIGH for the WCAG reading (the Understanding document's own text) and the measured alternative; the content rule is not machine-checked, as the Callout's 1.4.1 rule is not | Decided; dissent recorded |
| The meter text rule, the check, and the required alert (decisions 7, 8) | MEDIUM (one site-wide palette colour, one small library rule) | HIGH (measured with the exact formula; axe confirms; `#bf3f2c` is already the Button's and Abide's alert) | Decided |
| The overflow check (decision 11) | LOW (development only) | HIGH (measured in three engines; axe cannot see it) | Decided |
| The shared palette property and its presence limit (decision 13) | LOW (a development report) | HIGH (the limit is understood and its visible consequence stays an axe violation) | Decided; routed to building-blocks 1.13 and ADR 0040 |
| No indeterminate mode, no forced-colours rule (decisions 14, 15) | LOW (additive later) | HIGH (Foundation has no look; measured) | Decided |
| Names, copied classes, range, element guidance, rendering modes, stories, vocabulary (decisions 10, 12, 16 to 20) | LOW or MEDIUM | HIGH | Decided |

Nothing is OPEN FOR HUMAN, and no prototype is needed: the questions that needed measurement were measured here. The screen-reader announcement is a manual release test, as ADR 0022's dated consequence has it.

Dissent recorded: the unconditional graphic check with a black track (the Callout's unconditional style), and the Slider's fill-against-track check, both against decision 6; darker success and warning in `$foundation-palette` against decision 7; the scope lens's "native first", adopted as guidance, not as a restriction (decision 16); a forced-colours rule for parity with the Slider's rule 13 (decision 15).

### Proposed shared-file changes

1. `building-blocks.md`, Table D, the Progress Bar row: fill the empty cells.

   "| Progress Bar | `docs/pages/progress-bar.md` | [Spec: Progress Bar](issues/95-spec-progress-bar.md) | `[nfsProgress]` (`NfsProgress`: binds `.progress` and `role="progressbar"`; `value`, `min`, `max`, `valueText` set the `aria-value*` attributes; `color` Variant input over `NfsFoundationPaletteOverrides`; provides `nfsProgressToken`; `exportAs: 'nfsProgress'` with a `percentage` signal); `[nfsProgressMeter]` (`.progress-meter`, its width from the token); `[nfsProgressMeterText]` (`.progress-meter-text`); `progress[nfsProgressElement]` (the palette class of a native progress element); `<meter>` has no directive | Directives: `.progress`, `.progress-meter`, and `.progress-meter-text` are Structural classes on consumer-written elements, native `<progress>` takes Variant classes, and Foundation generates nothing | Native platform (an ARIA `progressbar` on the consumer's element, the native `<progress>` and `<meter>`); Aria has no progress or meter pattern and CDK adds nothing | Host bindings; one `computed` percentage; a parent token (`useExisting`); development name, copied-class, range, and meter-text overflow checks in render callbacks; the `strictVariantNames` and `strictVariantProperties` Runtime checks; `nfs-progress-bar` (`--nfs-foundation-palette`, meter text `$black` where it contrasts more than `$white`, one `@error` over meter text on every fill) | None for a progress bar (WAI-ARIA `progressbar`; APG range-related properties); Meter for `<meter>` |"

2. `building-blocks.md` 1.10, a new bullet after the Callout bullet:

   "- Progress Bar ([Spec: Progress Bar](issues/95-spec-progress-bar.md)): every progress bar, native progress element, and meter shows its Visible value, its value as text in its meter text or beside it, because Foundation's graphic cannot carry the value alone (fills 1.11:1 to 2.86:1 against the `$medium-gray` track, the track 1.63:1 against the page, and only a near-black track passes every default fill), and the Understanding document for 1.4.11 exempts a graphic whose information is in visible text; the docs require it and every story asserts it, as the Callout requires its text to name its kind. `nfs-progress-bar` gives the meter text `$black` wherever it contrasts more than Foundation's fixed `$white` (success and warning), stops the compile when a fill leaves the meter text under 4.5:1, and needs `$foundation-palette: map-merge($foundation-palette, (alert: #bf3f2c));` on Foundation's defaults (4.498:1 with `$white`, 4.36:1 with `$black`), mirrored in the Storybook settings overrides; `NfsProgressMeterText` warns in development when its text is wider than its meter, which axe marks incomplete. The Slider keeps its fill-against-track check, because its value has no text."

3. `building-blocks.md` 1.13, the Variant properties bullet: after "(... [Spec: Button Group](issues/82-spec-button-group.md), D11)." insert:

   "A setting that no entry point owns is the one exception: `nfs-callout` and `nfs-progress-bar` both loop over `$foundation-palette`, and an application may include either alone, so both write `--nfs-foundation-palette` with the same value. A directive then decides its own mixin's absence from a property only that mixin writes where one exists (the Callout's `--nfs-callout-sizes`); `nfs-progress-bar` has none, so a missing `nfs-progress-bar` is reported only while `nfs-callout` is missing too ([Spec: Progress Bar](issues/95-spec-progress-bar.md), D14)."

4. `adr/0040-variant-input-types.md`, Consequences, append after the Button Group's dated bullet:

   "- 2026-09-28 ([Spec: Progress Bar](../issues/95-spec-progress-bar.md)): the one-writer rule has one exception, a setting no entry point owns. `nfs-callout` and `nfs-progress-bar` both write `--nfs-foundation-palette`, with the same value, because each loops over `$foundation-palette` and an application may include either alone. `strictVariantProperties` therefore cannot report a missing `nfs-progress-bar` while `nfs-callout` is present; a presence property that is not a Variant property would close that gap and is not adopted."

5. `adr/0022-wcag-2-2-aa-enforcement.md`, Consequences, append:

   "- 2026-09-28 ([Spec: Progress Bar](../issues/95-spec-progress-bar.md)): a requirement on content the directives cannot read is stated as a requirement, shown in every recipe, and asserted by every story's play function, never as advice: the Callout's text names its kind (1.4.1), and every progress bar and meter shows its value as text, which exempts its graphic from 1.4.11."

6. `CONTEXT.md`, Foundation side, after **Callout** (the Callout ticket's term):

   ```markdown
   **Progress Bar**:
   Foundation's CSS-only component that shows how far a task has come, marked by the `.progress` Structural class and exposed by the library as a `progressbar`; distinct from the native `<progress>` element, which Foundation styles by tag, and from `<meter>`, which shows a measurement, not progress.
   _Avoid_: loading bar, progress indicator, meter (for the component)

   **Progress meter**:
   The `.progress-meter` element inside a Progress Bar whose width is the value's share of the range; distinct from the native `<meter>` element.
   _Avoid_: fill (bare), bar, meter (bare), indicator
   ```

7. `CONTEXT.md`, Angular side, after **Accessibility gate**:

   ```markdown
   **Visible value**:
   The text a sighted user reads for a Progress Bar's, a native progress element's, or a meter's value, in its meter text or beside it, which the library requires because the bar's graphic alone does not meet non-text contrast; distinct from `aria-valuetext`, the value assistive technology speaks.
   _Avoid_: value text (ambiguous with `aria-valuetext`), label (the name), caption, percentage label
   ```

8. `README.md`, the Plugins table, after the Callout row:

   "| Progress Bar (CSS-only component) | [specs/progress-bar.md](specs/progress-bar.md) | Native platform (an ARIA `progressbar` on the consumer's element, native `<progress>` and `<meter>`); four listener-free directives with a parent token for the meter's width | No inventory: Foundation's Progress Bar docs and its three Sass partials, with the [out-of-scope triage](research/out-of-scope-triage.md) (Progress Bar row) | None needed; contrast, meter text geometry, forced colours, right to left, and the accessibility tree measured in [Spec: Progress Bar](issues/95-spec-progress-bar.md) |"

9. `storybook-conventions.md`, section 5:
   - The `_settings-overrides.scss` block, after the Callout's lines:

     ```scss
     // color-contrast (1.4.3): nfs-progress-bar stops the compile on Foundation's alert fill, whose $white meter
     // text is 4.498:1 (4.36:1 with $black; axe reports 4.49). Spec: Progress Bar, progress-bar--with-text and
     // progress-bar--colors; it also recolours alert callouts, badges, and labels in every story (all still passing).
     $foundation-palette: map-merge($foundation-palette, (alert: #bf3f2c));
     ```

   - The `preview.scss` block: after `// @include foundation-range-input; // Slider: every slider--* story` add, in the same form as those two lines, `// @include foundation-progress-element; // Progress Bar: progress-bar--native-progress and progress-bar--right-to-left (element selector; no other story renders <progress>)` and `// @include foundation-meter-element; // Progress Bar: progress-bar--native-meter (element selector; no other story renders <meter>)`; after `@include nfs-menu; ...` add `@include nfs-progress-bar; // Progress Bar: meter text colours and --nfs-foundation-palette; every progress-bar--* story`.
   - The `foundation-everything` bullet: replace "except `foundation-range-input`, which the Slider spec adds," with "except `foundation-range-input`, which the Slider spec adds, and `foundation-progress-element` and `foundation-meter-element`, which the Progress Bar spec adds,".

10. `map.md`, Decisions so far: the gist at the end of this Answer.

No new ADR: the Visible value and the palette-property exception are reversible without touching shipped consumer code (an opt-in graphic check and a presence property are additive), so neither meets the "hard to reverse" test; building-blocks 1.10 and 1.13 and the ADR 0022 and ADR 0040 notes record them.

### What other specs need from this one

- [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md): the `NfsFoundationPaletteOverrides` entry keeps `mixins: ['nfs-callout', 'nfs-progress-bar']` and gains `uses` entries `{entryPoint: 'ngx-foundation-sites/progress-bar', directive: 'NfsProgress', input: 'color', alias: 'NfsProgressColor', shape: 'name'}` and `{..., directive: 'NfsProgressElement', input: 'color', alias: 'NfsProgressColor', shape: 'name'}`. In "Known `mixins` today", after "`nfs-callout` and `nfs-progress-bar` write `--nfs-foundation-palette`" add "(the one exception to one writer per property: `$foundation-palette` belongs to no entry point)". The typings check covers `NfsProgressColor` on both inputs.
- [Spec: Breakpoint service (shared utility)](53-spec-breakpoint-service.md): its illustrative Variant check (`NfsCallout`, under Usage examples) calls `check.include('nfs-callout', ['foundation-palette'])`; the Callout's decision 12 reads `callout-sizes`, because `nfs-progress-bar` also writes the palette property. Proposed: replace `['foundation-palette']` with `['callout-sizes']` in that example, and add to the `include()` bullet: "A property that two mixins write (`--nfs-foundation-palette`, written by `nfs-callout` and `nfs-progress-bar`) reports only when both are missing."
- [Spec: Callout](89-spec-callout.md) (resolved): its statement that `nfs-progress-bar` writes the same palette property stands. The Storybook override of proposal 9 moves the alert callout's background to about `#f7e1dd`; links stay at about 4.85:1 and the glyph at about 3.63:1, so `nfs-callout`'s check passes. Proposed, Notes, append: "- With the Progress Bar's required alert `#bf3f2c` (Storybook settings overrides), the alert callout's background is about `#f7e1dd`; links reach about 4.85:1 and close-button glyphs about 3.63:1."
- [Spec: Badge](93-spec-badge.md) and [Spec: Label](94-spec-label.md) (open): `$badge-palette` and `$label-palette` default to `$foundation-palette`, so the Progress Bar's required alert `#bf3f2c` also makes their default alert pass with `$white` (5.25:1, exact) wherever a consumer sets it in `$foundation-palette`; their own required settings are theirs to decide, and the Storybook override of proposal 9 changes their stories' alert colour. Both should compute with the exact formula.
- [Spec: Button](37-spec-button.md): the `$button-palette` override line stays; with the palette's alert already `#bf3f2c` its alert entry is redundant in the Storybook preview but harmless.
- [Spec: Slider](32-spec-slider.md): its fill-against-track check stands; building-blocks 1.10's new bullet (proposal 2) records why the Progress Bar has none.
- [Spec: Forms](98-spec-forms.md): its row pointing `progress` and `meter` to this spec is met.
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): check that no spec writes `.progress`, `.progress-meter`, `.progress-meter-text`, or a palette class on `<progress>`; that every story with a progress bar or meter shows its Visible value; that `nfs-progress-bar`'s check names the exact-luminance helper; that the one-writer exception is worded the same in building-blocks 1.13, ADR 0040, and the tooling spec; that the Storybook alert override's reach (callouts, badges, labels) is reflected in their stories' figures; and whether the Slider's forced-colours rule should have a Progress Bar counterpart (decided here: not needed, decision 15).

### Gist for Decisions so far

- [Spec: Progress Bar](issues/95-spec-progress-bar.md) -- four listener-free directives in `progress-bar`: `[nfsProgress]` binds `.progress`, `role="progressbar"`, and the `aria-value*` set from `value`, `min`, `max` (clamped) and `valueText`, with a `color` Variant input over `NfsFoundationPaletteOverrides` and a `percentage` signal; `[nfsProgressMeter]` takes its width through `nfsProgressToken`; `[nfsProgressMeterText]`; `progress[nfsProgressElement]` sets only the native element's colour; `<meter>` has no directive; development checks for a missing name (axe checks none on native elements), copied classes, and meter text wider than its meter (measured in three engines; axe marks it incomplete); measured with the exact luminance formula: Foundation's graphic fails 1.4.11 on every fill and only a near-black track passes, so every bar and meter shows its Visible value as text, which the 1.4.11 Understanding exempts; `nfs-progress-bar` gives meter text `$black` on success and warning and needs `$foundation-palette` alert `#bf3f2c` on Foundation's defaults; it and `nfs-callout` both write `--nfs-foundation-palette`, the one exception to one writer per property; impact MEDIUM to HIGH, confidence HIGH; no ADR. Spec: [specs/progress-bar.md](specs/progress-bar.md).

### Note, 2026-09-28 (out-of-scope reasons)

- 2026-09-28: the Out of Scope reasons named in [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md) are corrected in the spec.

### Amendment, 2026-09-29 (in-family check lines)

From the [Re-run: form and value-control family specs, In-family check lines](153-rerun-form-and-value-control-family-in-family-lines.md), under [ADR 0046](../adr/0046-forgotten-imports-caught-by-checks.md) and the family rule of the [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md); `specs/progress-bar.md` was revised in place, and the decision log is that ticket's Answer. Behaviour, API, ARIA, the rendering modes, and the Story ids are unchanged. Changed:

- Hierarchy and DI shape gains the In-family check lines, one per directive: `NfsProgress` probes `NfsProgressMeter`, and the meter probes `NfsProgressMeterText`; the meter and the meter text have no parent check, because their required injections' NG0201 is the report; `NfsProgressElement` has no parent, probe, or peer. The meter text keeps its lookup of `NfsProgressMeter` by class, whose NG0201 prints the class name, rather than gaining a public token for one message.
- `nfsProgressToken` gains its development-only description ("nfsProgressToken (provided by NfsProgress from 'ngx-foundation-sites/progress-bar' on an ancestor element declared in the same template)").

### Amendment, 2026-09-29 (consistency review)

From [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md), phase 2, group d, applying the coordinator's decisions in [research/consistency-review-decisions.md](../research/consistency-review-decisions.md) and the forgotten-import checks spec's rules for family checks; `specs/progress-bar.md` was revised in place. The reviewer's record is [research/consistency-review-group-d.md](../research/consistency-review-group-d.md).

- R5: after the overrides-file sentence, the palettes a `$foundation-palette` merge reaches (the progress bars, the native progress element, the callouts) and those it does not (`$button-palette`, `$badge-palette`, `$label-palette`).
- R15: the e2e forced-colours bullet gives the shared reason WebKit is not run.
- R30: `progress-bar--right-to-left` names each bar and shows and asserts its Visible value.
- R59: the injection bullet names the handles `nfsVariantCheck('nfsProgress')` and `nfsVariantCheck('nfsProgressElement')`.
- R74: check 1 and the progress element's name check count an image's non-blank `alt` (or a `role="img"` element's non-blank `aria-label`) in the referenced elements and labels; the development-check cases gain the silent image-only cases.
- R4: Sass rule (c) gains the canonical helper sentence (S1), which named neither Foundation function as unused.
- Unchanged, confirmed: R4 (figures), R59's call and own-file case, CR-A, CR-C, CR-D, and the form and value-control re-run's In-family lines.

### Amendment, 2026-09-29 (exportAs on every directive)

- [Decide: an exportAs on every directive](156-decide-exportas-on-every-directive.md): `NfsProgressMeter`, `NfsProgressMeterText`, and `NfsProgressElement` each gain an `exportAs` for the first time (`nfsProgressMeter`, `nfsProgressMeterText`, `nfsProgressElement`); `NfsProgress` already had `exportAs: 'nfsProgress'`.

### Amendment, 2026-09-29 (checks move to a later milestone)

From [Re-run: specs without checks, group d](168-rerun-specs-without-checks-group-d.md), under [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md); `specs/progress-bar.md` was revised in place and describes a library with no checks. What left the spec, per check (each check's full text stays in [research/checks-extraction-d.md](../research/checks-extraction-d.md) for the later milestone's specs):

- Forgotten-import checks: the In-family lines of the four directives and `nfsProgressToken`'s development-only description (M7). The token's description is now its plain name, `new InjectionToken<NfsProgress>('nfsProgressToken')`, and an "Imports (documented usage)" bullet says what a directive left out of the imports does (NG0201 for the meter and the meter text, NG8002 for a bound input, NG8003 for an `exportAs` reference, plain attributes otherwise). The required injections of the meter and the meter text stay, with NG0201 as Angular's report; the sentence that gave the meter text its meter's host for the overflow check goes.
- Misuse warnings: `NfsProgress`'s development checks 1 (no accessible name), 2 (copied palette classes), and 3 (`max` not above `min`), `NfsProgressMeterText`'s overflow check (D6), and `NfsProgressElement`'s name and copied-class checks, with their messages, the `ngDevMode`-only render callbacks, the `ElementRef` and `HostAttributeToken('class')` injections, and the browser-level "Development checks" bullet. They are now Documented usage rules in each directive's API text and JSDoc; user stories 14 to 16 and 20, D6, D12, D13, and D18, the 1.1.1 and 4.1.2 row, and the 1.4.12 row are rewritten in place.
- Runtime checks: both directives' `nfsVariantCheck` handles and their `include` and `value` calls, the browser-level Runtime check bullet, the Sass item 5 sentence, and D14's reporting half. The rule is `NfsProgress` Documented usage rule 4 (a compiled palette key; the include in every application with a bar); user story 21 and D14 are rewritten in place.
- Build-time checks: the `nfs-progress-bar` `@error` over every fill's meter text (rule (c), D9) and its Sass compile cases (Foundation's defaults stopping on alert, the `#777777` and `#1177dd` cases). The 4.5:1 rule is now a required setting in the Sass subsection and the 1.4.3 row, with `$foundation-palette: map-merge($foundation-palette, (alert: #bf3f2c));` as before; user stories 22 and 23, D7, D9, and the Foundation behaviour line say so. The mixin keeps its Variant property and its `$black` or `$white` meter text rules, whose pick still compares exact unrounded ratios, and the Sass compile test now asserts that output with and without the setting.
- Beyond the manifest: the Out of Scope item for `<meter>` and D11 lose their "name check" wording, D7 loses the optional check parameter, and the Out of Scope pointer to the Runtime checks' configuration goes.
- Kept: the four directives, their inputs, bindings, and `percentage`, the token and its required injections, the ARIA contract, every story and its axe gate, the host-binding, DI, native-element, and zoneless browser-level cases, the SSR smoke, the Sass compile of the rules, the e2e layer, and the manual release test. Decision numbers are unchanged.
- No API, class, ARIA, keyboard, or rendering change. Impact LOW, confidence HIGH (a user ruling applied); nothing OPEN FOR HUMAN.
