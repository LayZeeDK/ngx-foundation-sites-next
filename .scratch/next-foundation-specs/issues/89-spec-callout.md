# 89. Spec: Callout

Type: grilling
Status: resolved
Blocked by: 81, 83
Labels: wayfinder:grilling
Map: ../map.md

## Question

What Angular directives (preferred) or components give Foundation for Sites 6.9's Callout to the next, from-scratch ngx-foundation-sites repo, under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Foundation's docs page is `docs/pages/callout.md` and its Sass is `scss/components/_callout.scss` in the 6.9.0 clone. Publish `specs/callout.md`.

Known from the triage: Dismissal composes the Toggler in visibility mode with a Close Button inside; no default live role (the accessibility lens).

## How to work it

Run `/grill-with-docs` (self-grilling, both sides) over the questions this component raises, then publish with `/to-spec` in the map's spec shape; the [Spec: Button](37-spec-button.md) is the nearest precedent. Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this component); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Cover: one directive per Structural class and what else each owns (the ARIA, `type` default, or development and compile-time checks the documented markup lacks for WCAG 2.2 AA, ADR 0022); every Variant as a typed input by the decision above; State classes as host bindings; the Sass mixin only where custom CSS or checks are needed (ADR 0012); the rendering-mode contract; stories with play functions and axe; e2e only where Storybook cannot reach. Record the decisions in this ticket's Answer, and propose shared-file changes (a building-blocks row, glossary terms) for the orchestrator. Model: Opus 5.5.

## Answer

Model: Opus 5.5 (AFK: the agent played both sides of the interview; map Notes, AFK override).

Spec: [specs/callout.md](../specs/callout.md).

### Measurements made for this ticket

Four questions needed facts the bundle did not have, so the ticket measured them in a throwaway workspace (`D:/tmp/nfs-wave-89/`, not committed: `contrast.mjs`, `links.mjs`, `gray.mjs`, and `hex.mjs` for the ratios; `mixin.scss` and `compile.mjs` for a candidate `nfs-callout`; `overlap.mjs` and `overlap2.mjs` for geometry; `axe.mjs`). Foundation 6.9.0 Sass from the local clone, compiled with Dart Sass 1.104.1; Playwright 1.63 in Chromium, Firefox, and WebKit; axe-core 4.13.0 with the six WCAG 2.2 AA tags. Ratios use Foundation's `color-luminance()` and the WCAG formula, unrounded.

- Callout backgrounds on Foundation's defaults (each colour through `scale-color` by `$callout-background-fade`): default `#ffffff`, primary `#d7ecfa`, secondary `#eaeaea`, success `#e1faea`, warning `#fff3d9`, alert `#f7e4e1`.
- Text (the colour `color-pick-contrast()` picks, `#0a0a0a` on all six): at least 16.16:1.
- Links, `$anchor-color` `#1779ba`: default 4.63, primary 3.80, secondary 3.85, success 4.20, warning 4.20, alert 3.78:1; the hover colour `#1468a0` at least 4.78:1. axe reports the five failing links as `color-contrast` violations (3.82 to 4.25, from rendered 8-bit colours).
- Close-button glyph, `$closebutton-color` `#8a8a8a`: default 3.45, primary 2.84, secondary 2.87, success 3.13, warning 3.14, alert 2.82:1 (the [Spec: Close Button](83-spec-close-button.md) ticket's figures, reproduced); axe marks the three failing glyphs incomplete and nothing else.
- Link candidates, `scale-color($primary-color, $lightness: X)`, lowest callout ratio (always alert): 0% 3.78, -5% 4.10, -8% 4.33, -10% 4.46, -12% 4.64, -14% 4.78, -15% 4.86:1 (`#14679e`, hover `#115888` at least 6.02:1, 5.90:1 on the page). A lighter fade is not enough: at 88 percent links reach 3.93:1 on alert, at 90 percent 4.05:1.
- `$closebutton-color: #767676`: at least 3.71:1 on every callout, 4.50:1 on the page. With both required settings, axe reports no violation and no incomplete result on Foundation's Coloring examples with close buttons.
- On `$light-gray` (the default Off-canvas and Top Bar background): `#14679e` 4.77:1 (hover 5.91:1), `#767676` 3.64:1, against Foundation's default link colour's 3.71:1.
- Text under the close button, with the Close Button's 24 px floor: the button's box sits over the content box's top right corner (its right edge 17 px inside the callout's border box, 24 by 32 px at the medium size, 24 by 48 px once the text spacing's line height reaches it). At 320 by 800 px with the 1.4.12 text-spacing overrides, the heading of Foundation's second closable example runs 7.83 to 7.88 px under the button in all three engines, and a one-paragraph callout 3.08 to 3.13 px; at 1024 px, and at 320 px without the overrides, the docs examples pass. With a `data-nfs-close-button` hook and the candidate room rule, no text rectangle intersects the button in any case in any engine (the docs pair, a small callout with a small button, a large callout, a paragraph-only callout).
- Candidate mixin: over Foundation's defaults it stops with one `@error` listing eight failing pairs; with the two required settings it emits `:root { --nfs-foundation-palette: primary secondary success warning alert; --nfs-callout-sizes: small large; }` and three room rules of the form `padding-right: max(<padding>, calc(0.66rem + max(24px, 1.5em)), calc(1rem + max(24px, 2em)))`; `$closebutton-position: left top` writes `padding-left`; number offsets compile; `purple: #5b2a86` stops it on its links (4.425:1); `$callout-background-fade: 0%` stops it on 16 pairs, among them the text on alert (4.498:1); `$callout-sizes: (default: 1rem)` stops it with "() isn't a valid CSS value", so the property needs an explicit empty value.
- Angular 22.2 source (`packages/core/src/render3/instructions/change_detection.ts`, `refreshView`): embedded views are refreshed, then content queries, then host bindings, in one pass, so a host binding read from a content query sees the result in the first render, on the server too.
- Foundation history: `git log -S callout-link-tint` finds commit `e9c9f1db3` (2015-12-11, "removes callout tint color function"), which deleted the only rule that used `$callout-link-tint`; the setting and the docs sentence stayed.

### Grilling record

Round 1 (nothing settled yet).

- Q1, directive or component, and which hosts. For a component: `nfs-callout` could render a dismiss slot, as other design systems do. Against: ADR 0001 allows a component only for structure Foundation generates, and Foundation's docs say a callout "is just an element with a `.callout` class applied"; the consumer's element choice (`div`, `aside`, `section`) carries the semantics. Settled: one attribute directive on any element (decision 1).
- Q2, which classes. Read from the Sass: one Structural class (`.callout`), two Open Variant families (the keys of `$foundation-palette`; the keys of `$callout-sizes` minus `default`), no State class; `$callout-link-tint` has no effect (measured history). Settled: the class mapping (decisions 1 to 4).
- Q3, closable. For a `closable` input (the scope lens at triage): one attribute. Against: host directives are static, so every callout would become an Openable and a Nearest Openable; the triage and building-blocks 1.8 already name the composition. Settled: composition beside, a Toggler in visibility mode or `@if` (decision 5).
- Q4, role. For `role="alert"` on `color="alert"`: the look suggests urgency. Against: colour is a look; a callout present at page load is content, and the APG notes such alerts are not announced; only the consumer knows which callouts are status messages. For a `live` input: none that the native attribute lacks. Settled: no default role, the consumer's native `role` (decision 6).

Round 2 (Q1 to Q4 settled).

- Q5, the `color` type. Options: the shared `NfsFoundationPaletteColor` directly; a family alias. The naming rule (building-blocks 1.3) and the tooling's manifest `uses` entry both want a family alias; an alias of an alias costs nothing. Settled: `NfsCalloutColor = NfsFoundationPaletteColor`, no chain, because the callout's classes loop over `$foundation-palette` itself (decision 2).
- Q6, the `size` type. `'default'` inside the registry would be written as removed by the generator, because the property never lists it (the Button re-run's finding). Settled: the Button's shape (decision 3).
- Q7, contrast. Measured: links fail on five backgrounds, glyphs on three, text passes. Ownership follows the Close Button's D9: a container checks what sits on its own backgrounds. Settled: one `@error` over text, links, and glyphs on every background (decision 7).
- Q8, which settings fix links. Options: a darker `$anchor-color` (global); a lighter fade (measured: not enough); a library rule re-tinting `.callout a`, which Foundation removed (it re-implements a style and outranks `.button`'s colour); changing the palette (recolours every component). Settled: `$anchor-color: scale-color($primary-color, $lightness: -15%)`, the Accordion's required title colour (decision 8).
- Q9, which glyph colour. The Close Button ticket's candidates: `#858585` (3.01:1), `#808080` (3.22:1), `#767676` (3.71:1). Settled: `#767676`, for margin and 4.5:1 on the page (decision 8).
- Q10, text under the close button. Measured: a 1.4.12 failure of Foundation's own markup at 320 px, of the kind F104 names for absolutely positioned content. Options: none (a WCAG failure left to content, against ADR 0022); padding on every callout (changes callouts with no button); a float (only content after it wraps, and Foundation's button is last). Settled: room on the button's side while a hook is present (decision 9).

Round 3 (Q5 to Q10 settled).

- Q11, how the callout learns it holds a close button. Options: `:has()` (out of target); a consumer input (a second statement of the markup); the close button registering with an injected callout token (code in both directives); a content query by the `NfsCloseButton` class (keeps that directive in every bundle with callouts); a content query by a lightweight token that `NfsCloseButton` provides (the Angular pattern; one provider line in the Close Button). Settled: the token query, with an amendment to the Close Button spec (decision 10).
- Q12, the room's size and side. The button's right edge sits at its horizontal offset from the padding edge; its box is `max(24px, glyph)`, and a glyph no wider than its font size is bounded by `max(24px, <font size>)`; the side is `nth($closebutton-position, 1)`, physical because Foundation's setting is. Settled: `max(<the callout's padding>, <offset> + max(24px, <font size>))` over every close-button size (decision 9).
- Q13, copied classes. Every Foundation callout example writes `class="callout <color>"`. Settled: the Button's D22 warning, in development only (decision 11).
- Q14, the Runtime check. For a presence request: the include carries the checks and the room rule. Which property: `--nfs-foundation-palette` is also written by `nfs-progress-bar`, so it cannot tell; `--nfs-callout-sizes` can, except when a consumer removes both sizes. Settled: names, and a presence request that reads `--nfs-callout-sizes` (decision 12).
- Q15, an opt-out parameter for the checks. For: a consumer whose callout backgrounds span dark and light colours (a fade near 0) cannot pass the link and glyph checks with one colour. Against: no other spec's contrast check has one; Foundation's defaults have passing settings; an optional parameter is additive later. Settled: none in the first release, recorded as the upgrade path (decision 14).
- Q16, rendering modes and the query on the server. Settled by the measured `refreshView` order: the hook is in server HTML (decision 13).
- Q17, stories, seams, and vocabulary. Settled: six stories, e2e only for 1.4.12 and 1.4.10 geometry in three engines and the fixture app; two glossary terms (decisions 16 and 17).

The frontier is empty.

### Decisions

1. One attribute directive, `NfsCallout`, selector `[nfsCallout]` on any element, `exportAs: 'nfsCallout'`, in its own entry point `ngx-foundation-sites/callout`. It binds `.callout` as a static host class.
2. `color: NfsCalloutColor | undefined`, with `NfsCalloutColor = NfsFoundationPaletteColor` over `$foundation-palette` and its registry `NfsFoundationPaletteOverrides`. The value is the class; unset sets none (`$callout-background` is the look). Variant property `--nfs-foundation-palette`.
3. `size: NfsCalloutSize | undefined`, with `NfsCalloutSize = NfsOverridableStringUnion<'small' | 'large', NfsCalloutSizesOverrides> | 'default'`; `'default'` and unset set none. Variant property `--nfs-callout-sizes`. No responsive form for either input, because Foundation has none.
4. No State classes, role, outputs, methods, models, Defaults token, or providers.
5. Dismissal by composition beside the callout, never hosted: a Toggler in visibility mode with `button[nfsCloseButton]` and a bare `nfsClose` inside, focus moved in the Toggler's `closed`; or `@if` with the close button's `(click)` handler, focus moved there. No `closable` input. The removal form's typed leave animation is the [Re-run: Triggers (shared utility) spec under the class rule](130-rerun-triggers-class-rule.md)'s to decide.
6. No default live role; the docs and a story show `role="status"` on a persistent container and `role="alert"` on an inserted urgent callout (4.1.3).
7. `nfs-callout` stops the compile with one `@error` listing every pair under 4.5:1 (the picked text colour, `$anchor-color`, `$anchor-color-hover`) or under 3:1 (`$closebutton-color`, `$closebutton-color-hover`) against `$callout-background` and every faded palette background, unrounded.
8. Required settings on Foundation's defaults: `$anchor-color: scale-color($primary-color, $lightness: -15%);` (with its hover line where an overrides file follows Foundation's settings) and `$closebutton-color: #767676;`, mirrored in the Storybook settings overrides.
9. 1.4.12: while `data-nfs-close-button` is on the callout, `nfs-callout` sets `padding-<side>` to `max(<that size's padding>, <room>)` for each key of `$callout-sizes`, with `<side>` from `nth($closebutton-position, 1)` and `<room>` the list of `calc(<offset> + max(24px, <font size>))` over every key of `$closebutton-size`; 48 px on the right at Foundation's defaults.
10. The hook is `[attr.data-nfs-close-button]` from a `protected` signal query `contentChild(nfsCloseButtonToken, {descendants: true})`; `NfsCloseButton` provides the lightweight `nfsCloseButtonToken` (an amendment to the [Spec: Close Button](83-spec-close-button.md), below).
11. A development warning, once per instance, for Foundation's default palette names or `small`/`large` copied into the host's static class list, naming the inputs to bind.
12. At its first render the directive requests `callout-sizes` from the Runtime check whether or not an input is bound, and reports bound values; `strictVariantProperties` reports a missing `nfs-callout` from `--nfs-callout-sizes` alone; a `$callout-sizes` with no key but `default` writes an empty property (`#{''}`), which reads as missing, so that consumer opts the check out.
13. Native implementation level; listener-free; every effect a host binding in server HTML; checks only in a client render callback; no Hydration boundary of its own.
14. No mixin parameter that skips a check in the first release; an optional `$closable`/`$links` pair is the additive upgrade if a consumer's callout backgrounds need it.
15. Foundation's removed link tint is not restored; `$callout-link-tint` and the docs sentence are documented as without effect.
16. Story ids `callout--default`, `callout--colors`, `callout--sizes`, `callout--closable`, `callout--removable`, `callout--status-message`; every story heading is an `h5`, focus targets included, so axe's `heading-order` holds; e2e for text spacing and reflow at 320 px in three engines and the fixture app's first paint and hydration.
17. Two glossary terms, **Callout** and **Dismissible callout** (below).

### Triage

- Decisions 1 to 4 (the API and its types): impact HIGH (public type and input names); confidence HIGH (mechanical under ADR 0039, ADR 0040, and building-blocks 1.3 and 1.4; the manifest rows are already in the draft [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md)). DECIDED.
- Decisions 7 and 8 (the checks and the two required settings): impact MEDIUM (every consumer who includes `nfs-callout` on Foundation's defaults changes two site-wide colours; settings are reversible and the checks follow ADR 0022); confidence HIGH (measured, confirmed by axe; `-15%` is the Accordion's precedent). DECIDED.
- Decision 9 (the room rule): impact MEDIUM (new library CSS and a `data-nfs-*` hook other containers may copy; the look of closable callouts changes by 32 px of padding); confidence HIGH for the failure and the fix (measured in three engines), MEDIUM for the width bound on custom icons wider than their font size, which the spec states. DECIDED.
- Decision 10 (the token query): impact LOW to MEDIUM (a new public token in the Close Button entry point; replaceable by a class query without an API change for consumers); confidence HIGH (Angular's documented pattern; the query order measured in source). DECIDED; routed to the Close Button spec.
- Decision 12 (the presence request): impact LOW; confidence MEDIUM (depends on the presence-only request the Close Button proposed to the Breakpoint service re-run, not yet accepted). DECIDED; routed.
- Decision 14 (no opt-out): impact LOW (additive later); confidence MEDIUM (a plausible dark theme would need it). DECIDED, with the upgrade path recorded.
- Decisions 5, 6, 11, 13, 15 to 17: impact LOW or MEDIUM, confidence HIGH. DECIDED.
- Nothing is OPEN FOR HUMAN, and no prototype is needed: the questions that needed measurement were measured here.
- Dissent recorded: the scope lens's `closable` input at triage (decision 5); the global reach of the `$anchor-color` requirement (decision 8), against which a callout-scoped library rule was weighed and rejected; Q15's opt-out parameter.

### Proposed shared-file changes

1. `building-blocks.md`, Table D, the Callout row: fill the empty cells.

   "| Callout | `docs/pages/callout.md` | [Spec: Callout](issues/89-spec-callout.md) | `[nfsCallout]` (`NfsCallout`: binds `.callout`; `color` Variant input over `NfsFoundationPaletteOverrides`, `size` over `NfsCalloutSizesOverrides`; binds `data-nfs-close-button` while its content holds an `nfsCloseButton`); dismissal is a Toggler in visibility mode with `nfsCloseButton` and a bare `nfsClose` placed beside and inside it, or `@if`, never hosted | Directive: `.callout` is a Structural class on a consumer-written element, and Foundation generates nothing | Native platform (the element, Foundation's CSS, native live regions); Aria has no alert or container pattern and CDK adds nothing | Host bindings; a signal content query for the lightweight `nfsCloseButtonToken`; a development-mode copied-class check in one `afterNextRender`; the `strictVariantNames` and `strictVariantProperties` Runtime checks; `nfs-callout` (room for a close button for 1.4.12, `--nfs-foundation-palette` and `--nfs-callout-sizes`, and one `@error` over text, link, and close-button contrast on every callout background) | None for the container; Alert or a `status` live region when the consumer's callout reports a result |"

2. `building-blocks.md` 1.10, the first bullet: replace "(1.4.3 text contrast, 1.4.11 non-text contrast, 2.5.8 target size, and 2.4.11 focus not obscured are the ones found so far)" with "(1.4.3 text contrast, 1.4.11 non-text contrast, 2.5.8 target size, 2.4.11 focus not obscured, and 1.4.12 text spacing are the ones found so far)".

3. `building-blocks.md` 1.10, a new bullet after the Close Button bullet (the [Spec: Close Button](83-spec-close-button.md) ticket's proposal 3):

   "- Callout ([Spec: Callout](issues/89-spec-callout.md)): `nfs-callout` stops the compile when the callout's text or a link (`$anchor-color`, `$anchor-color-hover`) is under 4.5:1, or a close-button glyph under 3:1, on any callout background (`$callout-background` and each `$foundation-palette` colour through `scale-color` by `$callout-background-fade`). The consumer must set `$anchor-color: scale-color($primary-color, $lightness: -15%);` (links are 3.78:1 to 4.20:1 on five of Foundation's six callouts) and `$closebutton-color: #767676;` (2.82:1 to 2.87:1 on three), mirrored in the Storybook settings overrides. For 1.4.12, a callout holding a close button carries `data-nfs-close-button`, and the mixin sets the padding on the button's side to the larger of the callout's padding and the button's offset plus `max(24px, <its font size>)`, because Foundation's absolutely positioned button covers the content box's corner and, with the text spacing applied at 320 px, covers the heading of Foundation's own closable example in three engines."

4. `building-blocks.md` 1.8, the `data-closable` sentence: replace "or, to hide in place as Foundation's `fadeOut()` did, the element is a Toggler in visibility mode with a bare `nfsClose` inside." with "or, to hide in place as Foundation's `fadeOut()` did, the element is a Toggler in visibility mode with a bare `nfsClose` inside (the Dismissible callout, [Spec: Callout](issues/89-spec-callout.md))."

5. `CONTEXT.md`, Foundation side, after **Close Button** (the Close Button ticket's term):

   ```markdown
   **Callout**:
   Foundation's CSS-only container for a highlighted message or aside, marked by the `.callout` Structural class and coloured from `$foundation-palette`; a coloured callout is not an alert, which only a live `role` makes it.
   _Avoid_: alert (for the component), panel, notice, callout box
   ```

6. `CONTEXT.md`, Angular side, after **Visibility mode**:

   ```markdown
   **Dismissible callout**:
   A Callout the user can close with a close button inside it, either hidden in place as a Toggler in Visibility mode or removed with `@if`; the replacement for Foundation's `data-closable` on a callout.
   _Avoid_: closable callout, alert box, closable (the Foundation attribute)
   ```

7. `README.md`, the Plugins table, after the Button row:

   "| Callout (CSS-only component) | [specs/callout.md](specs/callout.md) | Native platform (the consumer's element, Foundation's CSS, native live regions); one listener-free directive, composed with the Toggler and the Close Button for dismissal | No inventory: Foundation's callout docs and Sass, with the [out-of-scope triage](research/out-of-scope-triage.md) (Callout row) | None needed; contrast, text spacing, and the close-button room measured in [Spec: Callout](issues/89-spec-callout.md) |"

8. `storybook-conventions.md`, the `_settings-overrides.scss` block, after the Off-canvas lines:

   ```scss
   // color-contrast (1.4.3) and non-text contrast (1.4.11): $anchor-color links are 3.78:1 to 4.20:1 on five
   // callout backgrounds (axe reports 3.82 to 4.25), and the close-button glyph 2.82:1 to 2.87:1 on primary,
   // secondary, and alert, which axe marks incomplete. Spec: Callout, callout--colors and callout--closable;
   // also the Close Button and Abide stories that show callouts.
   $anchor-color: scale-color($primary-color, $lightness: -15%);
   $anchor-color-hover: scale-color($anchor-color, $lightness: -14%);
   $closebutton-color: #767676;
   ```

9. `adr/0033-nested-menu-library-state-hooks.md`, Consequences, append: "- 2026-09-27 ([Spec: Callout](../issues/89-spec-callout.md)): the rule also covers a structural condition Foundation has no class for: `NfsCallout` binds `data-nfs-close-button` while its content holds a close button, from a content query, and `nfs-callout` reserves room on that side for WCAG 1.4.12. `.callout:has(.close-button)` replaces it once `:has()` enters the Browser target."

10. `map.md`, Decisions so far: the gist at the end of this Answer.

No ADR: the room rule and the hook are reversible CSS with no consumer API, and the required settings are consumer settings, so none meets the "hard to reverse" test; building-blocks 1.10 and ADR 0033's note record them.

### What other specs need from this one

- [Spec: Close Button](83-spec-close-button.md) (resolved; amend in place):
  - Hierarchy and DI shape, first bullet: replace "One directive, with no parent, no children, no Parent token, no providers, and no host directives. Nothing finds a close button through DI." with "One directive, with no parent, no children, no Parent token, and no host directives. Its one provider, `{provide: nfsCloseButtonToken, useExisting: NfsCloseButton}`, is a lightweight token the [Spec: Callout](../issues/89-spec-callout.md)'s content query looks for, so a callout reserves room for its close button without keeping this directive in its bundle; nothing injects it."
  - Entry point bullet: add "`nfsCloseButtonToken`, an `InjectionToken` typed with `import type`, is exported beside the directive."
  - D5: "and no outputs, methods, Defaults token, or providers" becomes "and no outputs, methods, Defaults token, or providers other than the lightweight `nfsCloseButtonToken`".
  - WCAG 1.4.11 row: "and the [Spec: Callout](../issues/89-spec-callout.md) must, because its primary, secondary, and alert backgrounds fail with Foundation's defaults" becomes "and the [Spec: Callout](../issues/89-spec-callout.md) does, requiring `$closebutton-color: #767676` (at least 3.71:1 on every callout), because its primary, secondary, and alert backgrounds fail with Foundation's defaults".
  - Sass, last paragraph: "and the Callout spec decides the setting its primary, secondary, and alert backgrounds need" becomes "and the Callout spec requires `$closebutton-color: #767676`".
  - Rendered HTML, the first server HTML example: `<div class="callout">` becomes `<div class="callout" data-nfs-close-button="">`.
  - Testing: the browser-level "Host bindings" case adds "the host provides `nfsCloseButtonToken`"; `close-button--closable` renders the same Foundation example as `callout--closable`, whose callouts now carry the room; its play function keeps asserting the button's box and leaves the callout's concerns to the Callout story.
- [Re-run: Breakpoint service (shared utility) spec under the class rule](129-rerun-breakpoint-service-class-rule.md): the Callout is the second directive that needs the presence-only request the Close Button proposed; it also shows why a missing-include report must read a property only one mixin writes (`--nfs-callout-sizes`, not the shared `--nfs-foundation-palette`).
- [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md): the manifest's `uses` entries for the Callout are `{entryPoint: 'ngx-foundation-sites/callout', directive: 'NfsCallout', input: 'color', alias: 'NfsCalloutColor', shape: 'name'}` under `$foundation-palette` and `{..., input: 'size', alias: 'NfsCalloutSize', shape: 'name'}` under `$callout-sizes`, both with `nfs-callout` among `mixins`; `'default'` is a library literal outside `NfsCalloutSizesOverrides`; the mixin writes an empty `--nfs-callout-sizes` as `#{''}` (an empty Sass list does not print). The typings check covers `NfsCalloutColor` and `NfsCalloutSize`.
- [Re-run: Triggers (shared utility) spec under the class rule](130-rerun-triggers-class-rule.md): both `data-closable` replacements become `<div nfsCallout ...>` with `<button nfsCloseButton ...>` (`type` comes from the directive, so `type="button"` and `class="close-button"` go); the typed leave animation of replacement 1 is yours to decide, and the Callout's `@if` recipe adopts it; both recipes move focus, which the Callout spec shows.
- [Re-run: Toggler spec under the class rule](109-rerun-toggler-class-rule.md): `class="callout"` becomes `nfsCallout`, `class="secondary callout"` becomes `nfsCallout color="secondary"`; the `toggler--closable` markup uses `nfsCallout` and `nfsCloseButton`; a callout's `hidden` and `.is-hidden` stay yours, and `nfsCallout` binds no class you bind.
- [Re-run: Abide spec under the class rule](123-rerun-abide-class-rule.md): `nfsCallout color="alert"` beside `nfsAbideAlert` is the Callout's composition; on Foundation's defaults `nfs-callout` requires `$anchor-color` and `$closebutton-color` (Sass subsection of the Callout spec), which a Form alert holding links benefits from; the alert callout's text passes (16.16:1).
- [Re-run: Equalizer spec under the class rule](126-rerun-equalizer-class-rule.md): every `class="callout"` becomes `nfsCallout` beside `nfsEqualizerWatch`; the flex classes are the Flexbox Utilities spec's.
- [Spec: Progress Bar](95-spec-progress-bar.md): `nfs-progress-bar` writes `--nfs-foundation-palette` with the same value as `nfs-callout`; its missing-include report needs a property only its own mixin writes.
- [Re-run: Off-canvas spec under the class rule](117-rerun-off-canvas-class-rule.md) and the menu and Top Bar specs, for information: with the Callout's two required settings, links reach 4.77:1 and glyphs 3.64:1 on `$light-gray`, so `$offcanvas-background: $white` and `$topbar-background: $white` are no longer the only passing settings for their links and glyphs; each spec's own check still decides.
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): the Storybook overrides' `$anchor-color` line changes the link colour of every story (only raising contrast), so spec texts that quote Foundation's default link ratios stay true for Foundation's defaults but not for the stories; `close-button--closable` and `callout--closable` render one Foundation example with different assertions; check that no container spec other than the Callout adds a close-button room rule without the hook's reasoning (Reveal and Off-canvas headings could meet the same 1.4.12 overlap).

### Gist for Decisions so far

- [Spec: Callout](issues/89-spec-callout.md) -- one listener-free `[nfsCallout]` binding `.callout`, with `color` over `NfsFoundationPaletteOverrides` and `size` over `NfsCalloutSizesOverrides`; dismissal is composed (a Toggler in visibility mode with `nfsCloseButton` and a bare `nfsClose`, or `@if`) and the consumer moves focus; no default live role, `role="status"` or `role="alert"` written natively; measured in three engines with axe: Foundation's links fail 1.4.3 on five of six callouts and its glyph 1.4.11 on three, so `nfs-callout` checks text, links, and glyphs on every background and Foundation's defaults need `$anchor-color: scale-color($primary-color, $lightness: -15%)` and `$closebutton-color: #767676`; Foundation's own closable example fails 1.4.12 at 320 px, so a callout holding a close button carries `data-nfs-close-button` (from a content query for a lightweight token the Close Button provides) and the mixin reserves room on the button's side; impact MEDIUM, confidence HIGH; no ADR. Spec: [specs/callout.md](specs/callout.md).

### Note, 2026-09-28 (out-of-scope survivors)

- 2026-09-28: the Out of Scope bullet on typography colours is corrected by [Re-run: Typography Helpers spec, out-of-scope survivors](146-rerun-typography-helpers-out-of-scope-survivors.md), from [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md): the greys inside the container are the Typography Helpers' requirement, met by the `#666666` it requires.

### Amendment, 2026-09-29 (consistency review)

From [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md), phase 2, group b, applying [its decisions](../research/consistency-review-decisions.md) and the review's checks CR-A to CR-D; `specs/callout.md` was revised in place, and [the group's report](../research/consistency-review-group-b.md) lists every edit.

- R2: the sentence after the Rendered HTML and the Animation paragraph name the Toggler's `animate` ([Spec: Toggler](17-spec-toggler.md), D18) and the `data-closable` replacements of the [Spec: Triggers (shared utility)](54-spec-triggers.md) (D17) instead of deferring to the re-runs; the Out of Scope Closing bullet and `callout--closable` follow (`animate="slide-out-right"` for Foundation's `data-closable="slide-out-right"`).
- R4: the WCAG subsection's lead and the Sass subsection's checks name the exact WCAG formula and the library's internal contrast helper, and `color-luminance()` leaves the list of reused functions; the link figures are recomputed (3.83:1 to 4.26:1 on five callouts on Foundation's defaults; with the required setting at least 4.95:1, hover at least 6.18:1, 6.01:1 on the page; 4.10:1 on alert at a 90 percent fade); the purple compile test takes `#4b0082` (4.02:1), because `#5b2a86` passes at 4.51:1 by the exact formula.
- R25: `callout--closable` names the Callout docs page's Making Closable pair.
- R30: the story intro states the alert tint the Storybook overrides give every callout story, with its measured figures.
- R59: the Runtime check bullet names `nfsVariantCheck('nfsCallout')` and `include('nfs-callout', ['callout-sizes'])` on every run; the missing-property case sits in a test file of its own; D12 reads "from the first render on".
- CR-B: the mapping gains rows for the Close Button's `.close-button` and the Toggler's `.is-hidden`, another family's classes the spec's markup carries.
- Other fix: the WCAG lead's note on axe says its figures differ in the second decimal; with the exact figures they are no longer "a few hundredths higher".
- Not changed, a decided API: `exportAs: 'nfsCallout'` (API, D4) contradicts building-blocks 1.3's rule now that R17 removed the Button's and the Close Button's; the report proposes the removal in R17's form (impact LOW, confidence HIGH).
- Unchanged (confirmed): R5, R14, R26, R28/R29, R65, R73; CR-A, CR-C, and CR-D hold. A single directive with no in-family parent, child, or peer, so no In-family line.

Triage: impact LOW (wording, figures, test placement, documentation rows), confidence HIGH. Nothing is OPEN FOR HUMAN.

### Amendment, 2026-09-29 (consistency review, closing pass)

From [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md), closing pass:

- `specs/callout.md`: `NfsCallout` has no `exportAs` (the API line, the bullet, D4), by R17's rule, which the closing pass extends to every directive whose public members are only inputs and outputs (building-blocks 1.3, 2026-09-29).

### Amendment, 2026-09-29 (exportAs on every directive)

From [Decide: an exportAs on every directive](156-decide-exportas-on-every-directive.md), which reverses R17 and this ticket's closing-pass line above: `specs/callout.md`'s `NfsCallout` gains `exportAs: 'nfsCallout'` (the API line, the bullet, D4).

### Amendment, 2026-09-29 (checks move to a later milestone)

From [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md), applied by [Re-run: specs without checks, group b](166-rerun-specs-without-checks-group-b.md): `specs/callout.md` describes and accepts a library with no checks. What left the spec, per check:

- Misuse warnings: the copied palette or size class warning (the development-mode bullet, its `afterNextRender` callback, the development-only `HostAttributeToken('class')` injection, the browser-level case, and user story 28's report).
- Runtime checks: the Callout Variant check (`nfsVariantCheck('nfsCallout')`, `include('nfs-callout', ['callout-sizes'])`, `value()`, `strictVariantNames`, `strictVariantProperties`), with the Runtime check hook injection, its browser-level case, the SSR smoke's no-report clause, the render-callback sentence of Rendering modes, the missing-include sentence, user story 29's report, and the Out of Scope pointer to the Runtime checks' configuration.
- Build-time checks: the `nfs-callout` contrast `@error` (Sass item 1(c)) for text, links, and close-button glyphs on every callout background, with the Sass compile cases that asserted only it (the defaults' stop, the purple `#4b0082` stop, the `$callout-background-fade: 0%` stop), the 1.4.3 and 1.4.11 rows' compile clauses and test entries, user stories 20 and 21's compile error, and the settings the mixin read only for it.

Each rule is stated as documented usage: two Documented usage bullets in the API section (bind `color` and `size`, never the classes; the include is required and the declaration file comes from the same Sass), the inputs' JSDoc, the 1.4.3 and 1.4.11 rows, the purple example's ratios in Usage examples, and Sass items 2 and 5. D7, D11, D12, and D15 are rewritten to what the spec now decides; user stories 20, 21, 28, and 29 state documentation, not reports; the Out of Scope bullets on the close button and on typography colours no longer name a check. Unchanged: the directive, its inputs and types, the close-button hook and its room rule, ARIA, the required settings, the rendering modes, and the Story ids.
