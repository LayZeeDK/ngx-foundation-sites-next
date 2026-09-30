# 148. Re-run: Top Bar spec, out-of-scope survivors

Type: grilling
Status: resolved
Blocked by: none
Labels: wayfinder:grilling
Map: ../map.md

## Question

[Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md) upheld out-of-scope survivors for the [Spec: Top Bar](86-spec-top-bar.md). What does the spec become with them, under the class rule (ADR 0039), the architecture guide, and ADR 0045 (a changed default after the first release waits for an Angular major, so defaults are settled now)?

## How to work it

Revise `specs/top-bar.md` in place and append a dated `### Amendment, 2026-09-28 (out-of-scope survivors)` to the [Spec: Top Bar](86-spec-top-bar.md) ticket. The items, evidence, and every point this re-run must decide are in that triage ticket's Answer, section "Survivors: proposed re-run tickets", item 3; read it in full, with `research/out-of-scope-triage-2.md` and the three lens files it cites. Measure first in Chromium and Firefox under forced colours; if the rule fails, the exclusion stays with the corrected reason the triage gives. Measure what the triage marks as unmeasured before deciding it. Run `/grill-with-docs` (self-grilling, both sides) and publish with `/to-spec`. Every item you keep or add in Out of Scope carries a reason and a category from `research/out-of-scope-exclusions.md`.

## Answer

Model: Opus 5.5. Resolved 2026-09-28, AFK under the map's override: self-grilled on both sides against the triage's item 3 ([Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md), with `research/out-of-scope-triage-2.md` sections 2, 3.1, and 7 and the three lens files), Foundation 6.9.0's `hamburger()` and `foundation-menu-icon`, the Switch's D12, the Slider's rule 13 and D20, the Progress Bar's D16, the architecture guide's P17 and P18, and ADR 0012, ADR 0022, ADR 0039, and ADR 0045, with five measured probes. Spec revised in place: [specs/top-bar.md](../specs/top-bar.md). The measurement passed, so top-bar-7 comes into scope as D16, and the fallback reason is not used.

### Measurements

All probes ran under `D:/tmp/nfs-wave-148/` (not committed), with Foundation 6.9.0's Sass from the local clone (`foundation-everything` and the spec's two Top Bar settings), Dart Sass 1.104.1, and Playwright 1.63.0 with its Chromium, Firefox, and WebKit, loaded from `D:/tmp/nfs-ct-prototype`'s install through `createRequire` (no junction, nothing written there). Forced colours were emulated with `page.emulateMedia({forcedColors: 'active'})` and `colorScheme` `light` and `dark`. Bar pixels were sampled at the horizontal centre of each bar (1, 8, and 15 px below the top of the padding box) and between the bars (4.5 and 11.5 px), and compared with reference swatches (`forced-color-adjust: none` with a `CanvasText`, `Highlight`, or `Canvas` background), for the light icon on a title bar, the dark icon on the page, and the dark icon on a white Top Bar, at rest and on hover.

- Probe 1, `compile.mjs` and `diff.mjs`: the candidate (the border rule plus `@media (forced-colors: active) { .menu-icon, .menu-icon.dark { @include hamburger($color: CanvasText, $color-hover: Highlight); } .menu-icon::after { forced-color-adjust: none; } }`) compiles with no warning of its own. Its output with the forced-colours block removed is byte-identical to the border-only output, and Foundation's own output is an unchanged prefix of both. The block restates Foundation's container declarations (`width: 20px; height: 16px` among them) and the offsets `7px` and `14px` from `hamburger()`'s own defaults.
- Probe 2, `measure.mjs` (five variants, two engines plus WebKit, two schemes, three icons):
  - Foundation alone and the border-only spec: in Chromium and Firefox, every bar pixel is Canvas; the `::after` background computes to Canvas and its `box-shadow` to `none`. The border-only spec shows an outlined box: `CanvasText` in Chromium, grey (`rgb(143, 143, 157)`) in Firefox.
  - The candidate: in Chromium and Firefox, in both schemes and on all three icons, the three bar pixels equal `CanvasText`, the gaps equal Canvas, and on hover the three bars equal `Highlight`; `forced-color-adjust` computes to `none` on the bars; the border box stays 24 by 24 px. Outside forced colours, a screenshot of each icon is identical to the border-only spec's.
  - Control without `forced-color-adjust: none`: only the top bar (the `::after` background, a system colour, which the browser keeps) shows; the `box-shadow` bars are dropped in both engines.
  - Control with `.menu-icon` alone in the selector: the dark icons keep Foundation's `$black` (`rgb(10, 10, 10)`) at rest and `$dark-gray` on hover in both engines, because `.menu-icon.dark::after` is more specific and `forced-color-adjust: none` keeps authored colours; on Chromium's dark palette that is 1.06:1 on a black Canvas.
  - Palettes: Chromium's emulation gives Canvas white, `CanvasText` black, and `Highlight` `rgb(55, 0, 110)` in the light scheme, and Canvas black, `CanvasText` white, and `Highlight` `rgb(26, 235, 255)` in the dark scheme; Firefox's emulation gives Canvas white, `CanvasText` black, and `Highlight` `rgb(51, 153, 255)` in both schemes.
  - WebKit: under emulation `(forced-colors: active)` matches, but no colour is forced: Foundation's bars keep their authored colours, and the candidate draws `CanvasText` (black) bars on the unforced `$black` title bar. Safari has no forced-colours mode, so WebKit is skipped in the e2e case.
- Probe 3, `border-canvas.mjs` and `focus.mjs`, the finding the triage did not foresee: with the candidate as proposed, the forced border colour fills D6's 4 px transparent top and bottom border, which touches the top and bottom bars. In zoomed Chromium screenshots the icon reads as a filled box with two lines, not three bars; in Firefox the grey frame sits flush against the black bars. Adding `.menu-icon { border-color: Canvas; }` inside the query paints the border Canvas in both engines and schemes (a system colour the browser keeps), and the icon shows three plain bars, with the bars, gaps, hover, and 24 by 24 px box as above. After Tab, the focus ring still shows: a `Highlight` ring in Chromium (`outline: auto`), a dotted `CanvasText` ring in Firefox.
- Probe 4, `restyle.mjs`, the documented limit: a consumer rule `.menu-icon { @include hamburger($color: $white, $color-hover: $medium-gray, $width: 30px, $height: 24px, $bars: 4); }` placed before `nfs-menu-icon` gives, under forced colours, Foundation's 20 by 16 px three-bar drawing in `CanvasText`. Placed after it, the consumer's 30 by 24 px four-bar drawing stays in its authored `rgb(254, 254, 254)`, because `forced-color-adjust: none` stays on the bars, so it vanishes on a light Canvas. Chromium and Firefox agree.
- Probe 5, `ratios.mjs`, exact WCAG ratios of the system-colour pairs. The colours of the four Windows 11 contrast themes were read from the installed theme files (`C:/Windows/Resources/Ease of Access Themes/*.theme`: `Window` for Canvas, `WindowText` for `CanvasText`, `Hilight` for `Highlight`). `CanvasText` on Canvas: Dusk 12.954, Night sky 21.000, Aquatic 16.293, Desert 10.434. `Highlight` on Canvas: Dusk 6.799, Night sky 11.806, Aquatic 11.169, Desert 7.269. Chromium's emulation: `Highlight` on Canvas 15.134 (light) and 14.371 (dark). Firefox's emulation: 2.941, a palette that is no Windows theme.

### Grilling record

Round 1 (the frontier: the triage's five points, each needing the measurement first):

- Q1. Does Foundation's own `hamburger()` with system colours draw the bars under forced colours? For: the triage's reading of the mixin, which computes its offsets from its own arguments. Against: the lenses doubted that `forced-color-adjust: none` keeps `box-shadow`, and that the rule beats `.menu-icon.dark::after`. Measured (Probe 2): yes in Chromium and Firefox, in both schemes, on the light and the dark icon. Settled: top-bar-7 comes in; the fallback reason is not used.
- Q2. Is `forced-color-adjust: none` needed, and where? The Switch and Slider warn that it keeps authored colours over the user's theme. Measured: without it the browser drops the `box-shadow`s and only the top bar shows. With it, every colour on the bars must be a system colour, which the rule gives. Settled: on `.menu-icon::after` only, never on the button, so the button's border and focus ring stay under the user's theme.
- Q3. Does the rule beat `.menu-icon.dark::after`? Measured: not with `.menu-icon` alone, because the dark icon then keeps `$black` and `$dark-gray` (1.06:1 on a black Canvas). Settled: the selector list `.menu-icon, .menu-icon.dark`, which matches Foundation's specificity and comes after it, because `nfs-menu-icon` is included after `foundation-menu-icon` (ADR 0012).
- Q4. Which system colours? At rest, `CanvasText`, not `ButtonText`: the icon's background is transparent, so the bars sit on the Canvas the bar behind them takes, and `CanvasText` on Canvas is the pair CSS Color 4 guarantees (the Slider's D20 reason). On hover, for `CanvasText`: the guaranteed pair, and 1.4.11 does not ask for a hover state. For `Highlight`: it keeps the hover change Foundation draws, and the Switch and the Slider already put `Highlight` on Canvas. Against `Highlight`: CSS Color 4 does not pair it with Canvas, and Firefox's emulation palette gives 2.941:1. The real themes decide it: 6.799 to 11.806:1 in all four Windows 11 contrast themes, and Firefox on Windows uses the theme's colours. Settled: `Highlight` on hover, with the measured caveat in the spec.
- Q5. Does calling `hamburger()` again copy Foundation's values? The API lens's objection was re-implementing Foundation's CSS. The call is Foundation's mixin, at its default size, in a media query Foundation's Sass never writes (the scope lens found no forced-colours rule in it), so the architecture guide's P18 test, the smallest rule Foundation cannot express, holds. It re-emits Foundation's container declarations inside the query, with values from the mixin's own defaults; hand-written `::after` rules with `7px` and `14px` would be the copy. Settled: the call, with the compile test asserting its output equals `hamburger()`'s.

Round 2 (unblocked by round 1's measurements):

- Q6. Does D6's box survive, and is the output outside forced colours unchanged? Measured (Probes 1 and 2): the box is 24 by 24 px under forced colours in both engines, the compiled output outside the query is byte-identical, and the plain screenshots are identical. Settled; the node-level compile test asserts both.
- Q7. The outlined box. The published spec kept it as the forced-colours affordance, and the triage's proposal leaves it. Measured (Probe 3): once the bars are drawn, the 4 px `CanvasText` border in Chromium joins the outer bars, and the hamburger no longer reads as one. For keeping it: a frame shows the 24 px target, as a native button's border does. Against: the frame hides the label this rule exists to restore, the focus ring already frames the control when it matters, and a transparent border cannot stay transparent without `forced-color-adjust: none` on the button. Settled: `.menu-icon { border-color: Canvas; }` inside the query. The border keeps its width, so the box and the hit area are unchanged.
- Q8. The CDK's `high-contrast` Sass mixin (P17 says the CDK's high-contrast support is reused)? It only wraps `@media (forced-colors: active)` around its content, and using it would make the library's Sass import `@angular/cdk`; the Switch and the Slider write the query directly. Settled: the query, with the alternative rejected in D16.
- Q9. The documented limit. The triage said "default-size bars". Measured (Probe 4), it depends on order: a consumer redraw before `nfs-menu-icon` gets Foundation's default drawing under forced colours, and one after it keeps its own drawing in its authored colours, which can vanish. Settled: stated in the spec's Notes with the fix (repeat the call with the consumer's arguments and system colours). The Out of Scope bullet on the library's own drawing points to it.
- Q10. The e2e case. It asserts bar pixels, gap pixels, border pixels, hover bars, and the box, in Chromium and Firefox, in both schemes. WebKit is skipped: its emulation matches the query without forcing colours (Probe 2), and Safari has no forced-colours mode.

Round 3:

- Q11. The Out of Scope section and the rejected alternatives. Every kept bullet now carries a reason and a category. Two bullets that combined items with different reasons are split: the name bullet into a default name and a generated id, and the host bullet into other hosts and the library's own drawing. Every rejected alternative in D1 to D16 carries a category. No reason is "CSS-only", and no bullet leaves a Foundation class for the consumer to write. Settled.
- Q12. ADR, glossary? No ADR: the rule is reversible CSS inside a media query, and it follows a recorded precedent (Switch D12), so it is not surprising without context. No new term: forced colours and system colours are platform words, and the spec uses no new domain concept. Settled.
- Q13. ADR 0045. Adding the drawing after the first release would change what forced-colours users see, so settling it now avoids the question. Settled: the rule ships in the first release.

The frontier is empty. Nothing is left `OPEN FOR HUMAN`, and no prototype ticket is needed.

### Decisions

1. top-bar-7 comes into scope. Inside `@media (forced-colors: active)`, `nfs-menu-icon` emits `.menu-icon, .menu-icon.dark { @include hamburger($color: CanvasText, $color-hover: Highlight); }`, `.menu-icon { border-color: Canvas; }`, and `.menu-icon::after { forced-color-adjust: none; }` (spec D16, and Sass rule (b) of `nfs-menu-icon`). The query and its rules are always emitted, and the mixin takes no parameter.
2. `CanvasText` bars at rest and `Highlight` bars on hover. The spec records `Highlight`'s measured ratios, and Firefox's 2.94:1 emulation palette.
3. D6's transparent border takes `Canvas` under forced colours, not the forced border colour. This departs from the triage's proposal: measured, the forced border joins the outer bars.
4. The compiled output outside forced colours is unchanged, and D6's 24 by 24 px box stays. The node-level compile test asserts the border rule alone outside the query, `hamburger()`'s exact output with the two system colours and no box-sizing, border-width, or padding inside it, and the 20 by 16 px guard.
5. The forced-colours e2e case asserts bar, gap, border, and hover pixels against system-colour swatches, and the box, in Chromium and Firefox with both colour schemes. WebKit is skipped, with the measured reason.
6. The documented limit, as measured for both rule orders, is in the spec's Notes and the Out of Scope bullet.
7. Text changes: the header's revision line; a Problem Statement bullet; the Solution's `nfsMenuIcon` and mixin sentences; user story 31; the Fallback line; the forced-colours paragraph under WCAG 2.2 AA; the Testing prior art; the Sass compile test; the e2e case; the Foundation behaviour list; `nfs-menu-icon`'s rules, reused items, and missing include; and a Notes bullet. The Out of Scope bullet "The bars drawn under forced colours" is removed.
8. Every Out of Scope bullet the spec keeps carries a reason and a category, with two bullets split, and every rejected Design-decisions alternative carries a category. Dropped options stay "none".

### Triage

| Decision | Impact | Confidence | Outcome and evidence |
| --- | --- | --- | --- |
| 1, 2, 4, the forced-colours drawing and its colours | LOW: one Library mixin rule inside a forced-colours query; no public API, no setting; under ADR 0045 it is settled for the first release | HIGH: measured in Chromium and Firefox, both schemes, three icons, with three controls (no rule, no `forced-color-adjust`, no `.dark` selector); the Windows themes' ratios come from the installed theme files; Switch D12 and Slider rule 13 are the precedent | Decided |
| 3, the `Canvas` border | LOW: one declaration in the same query; reversible | HIGH: measured and zoomed in both engines, with the focus ring checked after Tab | Decided |
| 5, 6, the e2e case and the documented limit | LOW | HIGH: the case's assertions are the probe's, and both rule orders were measured | Decided |
| 7, 8, text, reasons, and categories | LOW | HIGH | Decided |

Nothing is left `OPEN FOR HUMAN`. Dissent recorded: the API lens's "a library rule that re-implements Foundation's CSS" (answered by Q5: it is a call of Foundation's own mixin in a query Foundation never writes) and the scope lens's "no WCAG 2.2 AA criterion fails" (true, and equally true of the Switch and the Slider, whose forced-colours rules the bundle adopted); the triage's outlined box (Q7, turned down on Probe 3).

### Proposed shared-file changes (for the orchestrator)

1. `building-blocks.md` 1.10, the Top Bar bullet. Replace "the `nfs-menu-icon` Library mixin emits the menu icon's border box (2.5.8, the Target size bullet) and warns when" with:

   > the `nfs-menu-icon` Library mixin emits the menu icon's border box (2.5.8, the Target size bullet), draws the bars again under forced colours by calling Foundation's `hamburger()` with `CanvasText` and `Highlight`, with `forced-color-adjust: none` on the bars and the border painted `Canvas`, because Foundation's background and `box-shadow` bars disappear there (measured in Chromium and Firefox, [Re-run: Top Bar spec, out-of-scope survivors](issues/148-rerun-top-bar-out-of-scope-survivors.md)), and warns when

2. `building-blocks.md`, Table D, the Top Bar row. Replace "`nfs-menu-icon` (a 24 by 24 px border box around the unchanged drawing, 2.5.8)" with:

   > `nfs-menu-icon` (a 24 by 24 px border box around the unchanged drawing, 2.5.8; the bars in system colours under forced colours)

3. `storybook-conventions.md`, the `preview.scss` line. Replace "@include nfs-menu-icon; // Top Bar: the menu icon's 24 px box; every story with a menu icon (Top Bar, Responsive Toggle, Off-canvas, Triggers)" with:

   > @include nfs-menu-icon; // Top Bar: the menu icon's 24 px box and its forced-colours bars; every story with a menu icon (Top Bar, Responsive Toggle, Off-canvas, Triggers)

4. `README.md`, the Plugins table, the Top Bar row, last cell. Replace "measured in [Spec: Top Bar](issues/86-spec-top-bar.md)" with:

   > measured in [Spec: Top Bar](issues/86-spec-top-bar.md) and the [Re-run: Top Bar spec, out-of-scope survivors](issues/148-rerun-top-bar-out-of-scope-survivors.md)

5. `map.md`, Decisions so far: the gist below.

No change is proposed to `CONTEXT.md`, the ADRs, or the architecture guide.

### What other specs need from this one

- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md), for its forced-colours consistency pass (the Orbit bullets, and the Switch's D12, the Slider's rule 13, the Progress Bar's D16, and this spec's D16):
  - Playwright's WebKit matches `(forced-colors: active)` under `emulateMedia` but forces no colour (measured here). The Slider's WCAG row says "Playwright cannot emulate forced colours there"; the skip stands, but the reason is that a rule gated on the query applies there without the forced palette.
  - `forced-color-adjust: none` keeps authored colours. Every rule that sets it must give a system colour to every selector through which Foundation colours the element, including more specific ones. Here, `.menu-icon.dark::after` otherwise kept `$black`. This is worth checking against the Slider's thumb selectors and any `nfs-orbit` treatment.
  - A transparent border is drawn in the forced border colour: `CanvasText` in Chromium, grey in Firefox. A spec that grows a box with a transparent border gets a visible frame under forced colours.
  - Firefox's emulation palette puts `Highlight` at 2.941:1 on Canvas, where the four Windows 11 contrast themes give 6.799 to 11.806:1. The Switch's on track and the Slider's fill use `Highlight` on Canvas. Their e2e "differs from" assertions pass, and any ratio assertion on `Highlight` would fail in Firefox's emulation.
- [Spec: Responsive Toggle](24-spec-responsive-toggle.md), [Spec: Off-canvas](25-spec-off-canvas.md), and [Spec: Triggers (shared utility)](54-spec-triggers.md): nothing to change. Their title-bar menu icons get the forced-colours drawing from the `nfs-menu-icon` include they already require.
- [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md), for its audit after the wave: top-bar-7 is in scope as D16, and its row leaves the holds. The spec's eleven Out of Scope bullets now carry categories: five `scope-boundary` (the Responsive Toggle, the menus, the Triggers, Sticky, and the library's own drawing), three `platform-or-a11y` (a default name, other hosts, a role or toolbar), two `other` (a generated id, runtime theming), and one `superseded` (the `.no-js` recipe).

### Gist for Decisions so far

- [Re-run: Top Bar spec, out-of-scope survivors](issues/148-rerun-top-bar-out-of-scope-survivors.md) -- top-bar-7 comes in, measured in Chromium and Firefox. Under forced colours `nfs-menu-icon` calls Foundation's own `hamburger()` on `.menu-icon` and `.menu-icon.dark` with `CanvasText` and `Highlight`, sets `forced-color-adjust: none` on the bars (without it the browser drops the `box-shadow` bars; without the `.dark` selector the dark icon keeps `$black`), and paints D6's border `Canvas`, because the forced border colour joined the outer bars into a filled box. The output outside forced colours and the 24 px box are unchanged. `Highlight` is 6.80 to 11.81:1 on Canvas in the four Windows 11 contrast themes, but 2.94:1 in Firefox's emulation palette. WebKit's emulation matches the query without forcing colours, so its e2e run is skipped. Every kept Out of Scope item and rejected alternative now carries a category. Impact LOW, confidence HIGH; no ADR. Spec: [specs/top-bar.md](specs/top-bar.md).

### Amendment, 2026-09-29 (in-family check lines)

From [Re-run: navigation family specs, In-family check lines](151-rerun-navigation-family-in-family-lines.md), under [ADR 0046](../adr/0046-forgotten-imports-caught-by-checks.md), building-blocks 1.9, and the family rule of the [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md); `specs/top-bar.md` was revised in place. The re-run's Answer holds the decisions and the triage.

- Hierarchy and DI shape gains the In-family lines. `NfsTopBar` probes its two sections, its title, and `NfsMenuIcon`; `NfsTitleBar` probes its two sections, its title, and `NfsMenuIcon`; no part injects a parent, so none has a parent check, and `strictParents` changes nothing; `nfsTopBarRightToken` stays an optional context lookup of the Nested menu root (ADR 0043).
- `nfsTopBarRightToken` gets its development-only description.
- Development check 7 counts an ancestor that carries the bar's attribute without its class as the bar and says nothing, because that is a forgotten import which `strictDirectiveImports` reports once (the rule [Re-run: CSS-only component and free-behaviour family specs, In-family check lines](154-rerun-css-only-component-and-free-behaviour-family-in-family-lines.md) proposes as S2). The browser-level development cases gain that case.
- No API, class, ARIA, rendering, or Sass change. Impact LOW, confidence HIGH; nothing OPEN FOR HUMAN.

### Amendment, 2026-09-29 (consistency review)

From [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md), phase 2 (group f), applying the coordinator's decisions ([research/consistency-review-decisions.md](../research/consistency-review-decisions.md)) and the review's checks CR-A to CR-D; `specs/top-bar.md` was revised in place. The evidence for each change is in [research/consistency-review-group-f.md](../research/consistency-review-group-f.md).

- R47: D9's projected case is fixed with `alignment="right"`; a provided token has no value to give.
- R56: the `top-bar--title-bar` story's panels are Off-canvas panels with `position="left"` and `position="right"`, imported as scaffolding.
- R59, with R56's Zero-breakpoint `needs`: the Runtime checks paragraph names `nfsVariantCheck('nfsTopBar')`, the `include('nfs-breakpoint-properties', ['breakpoint-classes'])` call only while `stackedFor` is bound, and the `needs` of each value, as the Off-canvas panel's; the missing-property browser-level case sits in a test file of its own.
- R57: "Application class" is capitalised.
- R74: `NfsMenuIcon` check 1 counts the non-blank `alt` of an `img` or the non-blank `aria-label` of a `role="img"` element inside the button, check 2 reads the name as check 1 does, and the browser-level list gains a silent image-only case.
- Development check 3 reads the `nfsButton` and `nfsCloseButton` attributes as well as their classes, so a forgotten `NfsButton` import no longer hides the misuse; a browser-level case follows ([Re-run: form and value-control family specs, In-family check lines](153-rerun-form-and-value-control-family-in-family-lines.md), its item for the consistency review).
- "The hit-area rule" and "the hit area" (Solution, D7) read "the 24 px box": the box is a transparent border on a content box, not a hit area (the review's R14 and R22).
- CR-B: a table of the other families' classes the markup and Foundation's Top Bar docs page use.
- Unchanged: R4 (figures stand), R15, R22/R53, R40, R48, R65; check 7 agrees with the placement rule of the [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md); CR-A, CR-C, CR-D; the In-family lines.
- Impact LOW, confidence HIGH; nothing OPEN FOR HUMAN.

### Amendment, 2026-09-29 (consistency review, closing pass)

From [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md), closing pass:

- `specs/top-bar.md`: `NfsTopBar` and `NfsMenuIcon` have no `exportAs` (the hierarchy block, the two API lines, D12), by R17's rule, which the closing pass extends to every directive whose public members are only inputs and outputs (building-blocks 1.3, 2026-09-29).

### Amendment, 2026-09-29 (exportAs on every directive)

- [Decide: an exportAs on every directive](156-decide-exportas-on-every-directive.md): `NfsTopBar` and `NfsMenuIcon` regain their `exportAs` (removed by the consistency review's closing pass, above); `NfsTopBarLeft`, `NfsTopBarRight`, `NfsTopBarTitle`, `NfsTitleBar`, `NfsTitleBarLeft`, `NfsTitleBarRight`, and `NfsTitleBarTitle` gain one for the first time (`nfsTopBarLeft`, `nfsTopBarRight`, `nfsTopBarTitle`, `nfsTitleBar`, `nfsTitleBarLeft`, `nfsTitleBarRight`, `nfsTitleBarTitle`).

### Amendment, 2026-09-29 (checks move to a later milestone)

From [Re-run: specs without checks, group f](170-rerun-specs-without-checks-group-f.md), under [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md); `specs/top-bar.md` was revised in place. What left the spec, per check:

- Forgotten-import checks, to [Re-run: forgotten-import checks spec for the later milestone](164-rerun-forgotten-import-checks-later-milestone.md): the nine In-family lines (with the bars' child probes) and `nfsTopBarRightToken`'s development-only M7 description, which is now its plain name. An "Imports (documented usage)" bullet says what a forgotten import does.
- Misuse warnings, to [Spec: misuse warnings (later milestone)](161-spec-misuse-warnings-later-milestone.md): checks 1 and 2 (menu icon name, symbol-only name), 3 (`nfsButton` or `nfsCloseButton` on the icon), 4 (a box under 24 px), 5 (copied `dark` and `stacked-for-<bp>`, with the development-only `HostAttributeToken('class')` and `ElementRef` reads), and 6 (`stackedFor` at the Zero breakpoint), with their browser-level cases.
- Family checks, to [Spec: family checks (later milestone)](160-spec-family-checks-later-milestone.md): check 7 (a section outside its bar). The Nested menu root's projection warning is the Nested menu spec's; the quotes left, and D9's fix, `alignment="right"`, is documented usage.
- Runtime checks, to [Spec: Runtime checks (later milestone)](162-spec-runtime-checks-later-milestone.md): `nfsVariantCheck('nfsTopBar')` with its requests and browser-level cases.
- Build-time checks, to [Spec: build-time checks (later milestone)](163-spec-build-time-checks-later-milestone.md): the `@warn` of `nfs-menu-icon` (the dark icon on the page), and every `@error` and `@warn` of `nfs-title-bar` and `nfs-top-bar`, with their Sass compile cases and the exact-formula helper's false-pass case. `nfs-title-bar` and `nfs-top-bar` held only checks, so, as ADR 0012 decides for a component that needs neither custom CSS nor Variant properties, the first milestone has no such mixin; `nfs-menu-icon` keeps its two rules. The colour pairs are required settings in the WCAG rows and the Sass subsection (D7, D8 rewritten).
- Each other rule is documented usage in the API sections: the menu icon's name, one class contract per element, the `nfs-menu-icon` include, the sections' placement, and `stackedFor` not at the Zero breakpoint (user stories 6, 14, 16, 17, 18, 20, and 32; D2, D5, D13).
- Unchanged: every class, input, ARIA rule, the 24 px box, the forced-colours drawing, and the stripping of copied classes with its tests. Impact LOW, confidence HIGH (ADR 0012's rule decides the two mixins, and adding a mixin later breaks no consumer); nothing OPEN FOR HUMAN.
