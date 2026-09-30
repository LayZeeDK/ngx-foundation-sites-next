# 83. Spec: Close Button

Type: grilling
Status: resolved
Blocked by: 81
Labels: wayfinder:grilling
Map: ../map.md

## Question

What Angular directives (preferred) or components give Foundation for Sites 6.9's Close Button to the next, from-scratch ngx-foundation-sites repo, under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Foundation's docs page is `docs/pages/close-button.md` and its Sass is `scss/components/_close-button.scss` in the 6.9.0 clone. Publish `specs/close-button.md`.

Known from the triage: Composes with the Triggers utility's `nfsClose`, never `nfsButton`; owns the `type="button"` default and a name check (its glyph is `aria-hidden`); settle where 2.5.8 is met.

## How to work it

Run `/grill-with-docs` (self-grilling, both sides) over the questions this component raises, then publish with `/to-spec` in the map's spec shape; the [Spec: Button](37-spec-button.md) is the nearest precedent. Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this component); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Cover: one directive per Structural class and what else each owns (the ARIA, `type` default, or development and compile-time checks the documented markup lacks for WCAG 2.2 AA, ADR 0022); every Variant as a typed input by the decision above; State classes as host bindings; the Sass mixin only where custom CSS or checks are needed (ADR 0012); the rendering-mode contract; stories with play functions and axe; e2e only where Storybook cannot reach. Record the decisions in this ticket's Answer, and propose shared-file changes (a building-blocks row, glossary terms) for the orchestrator. Model: Opus 5.5.

## Answer

Model: Opus 5.5 (AFK: the agent played both sides of the interview; map Notes, AFK override).

Spec: [specs/close-button.md](../specs/close-button.md).

### Measurements made for this ticket

Two frontier questions needed facts the bundle did not have, so the ticket measured them in a throwaway workspace (`D:/tmp/nfs-wave-83/`: `compile.mjs`, `sizes.mjs`, `candidates.mjs` for Sass; `measure.mjs`, `contrast.mjs` for the browsers). Foundation 6.9.0 Sass from the local clone, compiled with Dart Sass 1.104.1; Playwright 1.63 in Chromium, Firefox, and WebKit; axe-core 4.13.0. The three engines agree to 0.01 px on every size.

- Foundation's box at a 16 px font size: medium 18.69 by 32 px, small 14.02 by 24 px; small under a 14 px parent 12.27 by 21 px.
- With `.close-button { min-width: 24px; min-height: 24px; }`: 24 by 32, 24 by 24, and 24 by 24 px. The glyph moves 2.67 px left (medium) and 5.0 px left (small), and 1.5 px down in the 14 px case; its size does not change.
- With a transparent centred 24 px `::before` hit area instead: `elementFromPoint` 2 px outside the box's left and right edges returns the button in all three engines, but the box stays Foundation's.
- axe `target-size` on Foundation's Off-canvas docs layout (the close button over the first link of a vertical menu): incomplete with Foundation's box, incomplete with the pseudo-element, no result (pass) with the floor. No variant produced a violation, so a broken spacing exception never fails the story gate.
- Contrast, unrounded with Foundation's `color-luminance()`: `$closebutton-color` `#8a8a8a` against `$body-background` 3.42:1 and against `$reveal-background` 3.42:1; against the callout backgrounds (each `$foundation-palette` colour through `scale-color` by `$callout-background-fade`): default 3.45, primary 2.84, secondary 2.87, success 3.13, warning 3.14, alert 2.82:1; against `$offcanvas-background` (`$light-gray`) 2.77:1. `$closebutton-color-hover` reaches at least 16.16:1 on all of them. Candidates for a passing setting: `#858585` (at least 3.01:1 on callouts, 2.96:1 on `$light-gray`), `#808080` (3.22, 3.16), `#767676` (3.71, 3.64; 4.50:1 on the page).
- axe `color-contrast` marks the glyph on the primary, secondary, and alert callouts incomplete ("Element content is too short to determine if it is actual text content"), so only a compile-time check catches those pairs.
- Sass: a `$closebutton-size` key without matching keys in both offset maps stops Foundation's own compile ("Function finished without @return"), unless the offsets are numbers; a number `$closebutton-size` stops it too ("Expected identifier"); a `medium`-only map compiles. `join((), map-keys($closebutton-size), space)` prints `--nfs-closebutton-size: small medium;`, and a `large` key gives `small medium large`. A candidate `nfs-close-button` with the floor, the Variant property, and the body-background check compiled over Foundation's defaults and stopped with `@error` for `$closebutton-color: #aaaaaa` (2.30:1).

### Grilling record

Round 1 (nothing settled yet).

- Q1, directive or component. For a component: a template could render the glyph with `aria-hidden="true"`, so no consumer could forget it. Against: ADR 0001 allows a component only for structure Foundation generates, and the glyph is consumer-written in Foundation's docs; a template would rule out the consumer's own icon; the name check catches the failure a template would prevent. Settled: one attribute directive (decision 1).
- Q2, which hosts. For any element: `[mat-dialog-close]` and Foundation's `data-close` work on any element. Against: that reach belongs to the Trigger, which stays free to sit on any element; Foundation defines the Close Button as a `<button>`; any other host needs a role, focus, and keys the platform gives a button. Settled: `button[nfsCloseButton]` (decision 1).
- Q3, does the directive close anything. For hosting `nfsClose`: one attribute instead of two, and Foundation's examples always pair them. Against: Foundation's docs say the close button "doesn't close elements"; host directives are static, so the Trigger could not be left off a button whose handler removes content or that submits a `<form method="dialog">`; every close button would carry `jsaction` and import the Triggers entry point. Settled: placed beside, never hosted (decision 2).
- Q4, which classes. Read from the Sass: one Structural class (`.close-button`), one Open Variant family (the keys of `$closebutton-size`), and no State class (hover and focus are pseudo-classes); the glyph `span` has no class. The Sass facts behind the family were measured (above). Settled: the class mapping (decisions 1, 4, 5).

Round 2 (Q1 to Q4 settled).

- Q5, the `type` default. Options: an input like the Button spec's; a static host attribute; always `button`. The static host attribute depends on how Angular orders a directive's static host attribute against the consumer's static attribute, which the bundle has not measured; always `button` breaks `<form method="dialog">`. Settled: a `type` input defaulting to `'button'`, as `nfsButton` and `MatDialogClose` do (decision 3).
- Q6, the `size` Variant input. For a closed `'small' | 'medium'` union: Foundation's defaults, no registry. Against: ADR 0040 closes open families over a registry, and Foundation's docs let consumers change the map. Settled: `size`, alias `NfsCloseButtonSize` over `NfsClosebuttonSizeOverrides` (the registry name the typed-Variant decision gives verbatim), the class is the name, unset sets none, no responsive form because Foundation has none (decision 4).
- Q7, the name. Three options. A default `aria-label="Close"`: every button named, but with an English library string that needs localisation and names the action, not what it closes. A required `aria-label` input: a missing name fails `ng build`, the strongest check, but it rules out content and `aria-labelledby` names that HTML allows, and `aria-label=""` still satisfies it, so a run-time check is needed anyway. A development check: follows the triage ("checks for a name in development mode") and the Reveal and Off-canvas name checks, and is additive. Settled: the development check, extended to warn on a name with no letter or digit, which catches the Toggler docs' `&times;` button that axe's `button-name` passes (decision 6).
- Q8, `nfsButton` on the same element. Options: a warning; selectors that exclude each other; nothing. Excluding selectors would make the second directive silently not apply. Settled: a development warning when the host carries `.button` (decision 7).
- Q9, where 2.5.8 is met. The spacing exception per container (the accessibility lens's dissent at triage, and the current text of the Reveal, Toggler, Triggers, and Button specs): no visual change, but it depends on layouts the library cannot see, Foundation's own Off-canvas docs break it, and axe reports the break as incomplete, so the gate cannot catch it. A transparent pseudo-element hit area (building-blocks 1.10's technique for the hamburger): no visual change and pointer hits land, but axe cannot see it (measured). A box floor: the box is transparent, so it draws nothing, the glyph moves at most 5 px, and axe passes it (measured). Settled: the floor on every `.close-button` in `nfs-close-button`, replacing the Off-canvas spec's panel-scoped rule (decision 8).
- Q10, contrast ownership. For one check in `nfs-close-button` against every container: one place. Against: the close button's mixin would need every container's settings and would run whether or not a container is compiled; the Reveal and Off-canvas specs already check their own surfaces. Settled: `nfs-close-button` checks both colours against `$body-background`, and each container checks its own background; the Callout spec inherits a failing default (decision 9).

Round 3 (Q5 to Q10 settled).

- Q11, a missing include at run time. With the floor in the mixin, a missing `@include nfs-close-button;` silently brings back the undersized box. Settled: the directive requests `closebutton-size` from the Runtime check at its first render whether or not `size` is bound, so `strictVariantProperties` names the include (decision 10).
- Q12, the Library mixin. Settled: the floor, the Variant property, and the two compile-time checks, with no parameters (decision 11).
- Q13, rendering modes. Settled: listener-free host bindings; the checks run once after the first render, which is right because the name must already be in server HTML (decision 12).
- Q14, outputs, methods, `exportAs`, Defaults token, disabled. Against `exportAs`: nothing needs it today. For: parity with `nfsButton` at no code cost. Settled: `exportAs: 'nfsCloseButton'`; no outputs, methods, Defaults token, providers, or disabled contract (decision 5).
- Q15, focus after closing. Settled: never the directive's; the Openable returns focus, and a consumer that removes or hides the container moves focus itself; the spec shows it (decision 13).
- Q16, stories and seams. Settled: five stories; each play function asserts the 24 px box, because axe would not fail a missing floor; e2e only for three-engine geometry, the focus ring, real keys, and the fixture app's rendering modes (decision 14).
- Q17, vocabulary. "Close button" names both Foundation's component and any button with `nfsClose` in the published specs. Settled: a glossary term for the Close Button (below).

The frontier is empty.

### Decisions

1. One attribute directive, `NfsCloseButton`, selector `button[nfsCloseButton]`, `exportAs: 'nfsCloseButton'`, in its own entry point `ngx-foundation-sites/close-button`. It binds `.close-button` as a static host class; the consumer writes the glyph in `<span aria-hidden="true">`.
2. It closes nothing. `nfsClose` (bare, with a reference, with `[nfsCloseResult]`), a consumer `(click)` handler, or `type="submit"` in `<form method="dialog">` sits beside it on the same element; it never hosts `NfsClose`.
3. `type: 'button' | 'submit' | 'reset'`, default `'button'`, bound with `[attr.type]`; a static `type` or a `[type]` binding feeds it.
4. `size: NfsCloseButtonSize | undefined`, with `NfsCloseButtonSize = NfsOverridableStringUnion<'small' | 'medium', NfsClosebuttonSizeOverrides>` over `$closebutton-size`. The value is the class name, unset sets none (the look `$closebutton-default-size` names), an explicit default name still sets its class, and a value that is not one class token sets nothing. Variant property `--nfs-closebutton-size`. No responsive form.
5. No State classes, no disabled contract, no outputs, methods, Defaults token, providers, or tokens.
6. Development-mode checks in one `afterNextRender`, once per instance: no accessible name (from `aria-labelledby`, then `aria-label`, then text outside `aria-hidden="true"`, then `title`); a name with no letter or digit; no default name and no name input.
7. A development warning when `nfsButton` shares the element (the host carries `.button`).
8. 2.5.8 is met by size on every close button: `nfs-close-button` emits `.close-button { min-width: 24px; min-height: 24px; }`. The Off-canvas spec's panel-scoped rule moves here, and the Reveal, Toggler, Triggers, and Button specs' spacing-exception reasoning is replaced by it.
9. 1.4.11: `nfs-close-button` stops the compile with `@error` when `$closebutton-color` or `$closebutton-color-hover` is under 3:1 against `$body-background`; each container that paints its own background under a close button checks the same two settings against it (Reveal and Off-canvas already do; Callout must).
10. At its first render the directive requests `closebutton-size` from the Runtime check whether or not `size` is bound, so a missing include is reported.
11. `nfs-close-button` emits the floor, `:root { --nfs-closebutton-size: <keys>; }`, and the two checks, takes no parameters, and needs no Storybook settings override.
12. Native implementation level; listener-free; every effect a host binding in server HTML; checks only in a client render callback; no Hydration boundary of its own.
13. Focus after closing belongs to the Openable, or to the consumer when the close button removes or hides its own container.
14. Story ids `close-button--default`, `close-button--closable`, `close-button--removable`, `close-button--sizes`, `close-button--in-form`; every play function asserts a box of at least 24 by 24; the four layers as the spec lists them.

### Triage

- Decision 8 (the floor): impact MEDIUM (it rewrites the 2.5.8 rows of five published specs and the Off-canvas Sass subsection; it is one CSS rule, reversible without an API change); confidence HIGH (measured in three engines with axe; it follows building-blocks 1.10's size-first rule; the accessibility lens's per-container dissent is answered by the measured axe blind spot). DECIDED.
- Decision 6 (the name check in development): impact MEDIUM (tightening to a required input later would be a breaking change); confidence HIGH (the triage decided a development-mode check; the Reveal and Off-canvas specs check names the same way). DECIDED.
- Decision 9 (contrast ownership): impact MEDIUM (the Callout spec inherits a check and a required setting); confidence HIGH (measured; the Reveal and Off-canvas precedent). DECIDED.
- Decision 4 (the `size` type): impact HIGH (public type names); confidence HIGH (mechanical under ADR 0040, with the registry name taken from the typed-Variant decision's Answer). DECIDED.
- Decision 10 (the presence request): impact LOW (one call into an API the Breakpoint service re-run owns); confidence MEDIUM (the typed-Variant decision asks for "a missing property reports once" but does not say whether a directive with no bound value can ask). DECIDED; routed to that re-run below.
- Decisions 1 to 3, 5, 7, and 11 to 14: impact LOW or MEDIUM, confidence HIGH. DECIDED.
- Nothing is OPEN FOR HUMAN, and no prototype is needed: the two questions that needed measurement were measured here.
- Dissent recorded: the accessibility lens at triage (2.5.8 per container), answered by decision 8; the required-input side of Q7.

### Proposed shared-file changes

1. `building-blocks.md`, Table D, the Close Button row: fill the empty cells.

   "| Close Button | `docs/pages/close-button.md` | [Spec: Close Button](issues/83-spec-close-button.md) | `button[nfsCloseButton]` (`NfsCloseButton`: binds `.close-button`; `type` input defaulting to `button`; `size` Variant input over `NfsClosebuttonSizeOverrides`); the closing comes from a Trigger (`nfsClose`) or the consumer's handler placed beside it, never hosted | Directive: `.close-button` is a Structural class on a consumer-written `<button>`, and Foundation generates nothing | Native platform (`<button>`); Aria has no button pattern and CDK adds nothing | Host bindings; development-mode name and `nfsButton` checks in one `afterNextRender`; the `strictVariantNames` and `strictVariantProperties` Runtime checks; `nfs-close-button` (a 24 px box floor on every `.close-button`, `--nfs-closebutton-size`, and a 3:1 `@error` against `$body-background`) | Button; the closing follows the Openable's pattern |"

2. `building-blocks.md` 1.10, the last bullet: replace its first sentence, "Target size (WCAG 2.2 success criterion 2.5.8) is met by size, not by the spacing exception, wherever a Foundation control is smaller than 24 by 24 CSS px and a spec owns it (the ResponsiveToggle hamburger): a transparent hit-area pseudo-element in the plugin's Library mixin, never a resize of Foundation's drawing.", with (the rest of the bullet is the [Spec: Top Bar](86-spec-top-bar.md)'s to change):

   "Target size (WCAG 2.2 success criterion 2.5.8) is met by size, not by the spacing exception, wherever a Foundation control is smaller than 24 by 24 CSS px and a spec owns it, by one of two rules chosen by what Foundation draws. Where the box is transparent and the drawing is a glyph inside it (`.close-button`, `.button`), the Library mixin gives the box a `min-width: 24px; min-height: 24px` floor, which leaves the glyph's size unchanged. Where the box is the drawing (the ResponsiveToggle hamburger, whose bars are laid out on its 20 by 16 px box), a transparent hit-area pseudo-element in the plugin's Library mixin, never a resize of Foundation's drawing. The floor comes first wherever it applies, because axe's `target-size` rule measures only the element's box: measured by the [Spec: Close Button](issues/83-spec-close-button.md) ticket in three engines, a pseudo-element hit area takes pointer hits 2 px outside the box, but axe still reports a close button over a link as incomplete, and passes the floored one."

3. `building-blocks.md` 1.10, a new bullet after the Button bullet:

   "- Close Button ([Spec: Close Button](issues/83-spec-close-button.md)): the `nfs-close-button` Library mixin emits `.close-button { min-width: 24px; min-height: 24px; }` for 2.5.8 on every close button (Foundation sizes it by its glyph: 18.69 by 32 px at the medium size and 14.02 by 24 px at the small size at a 16 px font size), replacing the Off-canvas spec's panel-scoped rule. It stops the compile with `@error` when `$closebutton-color` or `$closebutton-color-hover` is under 3:1 against `$body-background`, and every spec whose container paints its own background under a close button checks the same two settings against that background (Reveal, Off-canvas, Callout), because axe marks the glyph's contrast incomplete."

4. `building-blocks.md` 1.8: replace "a `<button>` Trigger gets `type="button"` from the consumer or from `nfsButton`" with "a `<button>` Trigger gets `type="button"` from the consumer, from `nfsButton`, or from `nfsCloseButton` ([Spec: Close Button](issues/83-spec-close-button.md))".

5. `CONTEXT.md`, Foundation side, after **CSS-only component**:

   ```markdown
   **Close Button**:
   Foundation's CSS-only component for the corner control drawn as a glyph, marked by the `.close-button` Structural class; distinct from a close Trigger (`nfsClose`), which does the closing and can sit on any button.
   _Avoid_: close trigger (for the component), dismiss button, X button
   ```

6. `README.md`, the Plugins table, after the Button row:

   "| Close Button (CSS-only component) | [specs/close-button.md](specs/close-button.md) | Native platform `<button>`; one listener-free directive beside the Triggers utility's `nfsClose` | No inventory: Foundation's close-button docs and Sass, with the [out-of-scope triage](research/out-of-scope-triage.md) (Close Button row) | None needed; target size, hit testing, and contrast measured in [Spec: Close Button](issues/83-spec-close-button.md) |"

7. `map.md`, Decisions so far: the gist at the end of this Answer.

No ADR: the floor is reversible and carries no API, so it misses the "hard to reverse" test; building-blocks 1.10 records it.

### What other specs need from this one

- [Spec: Callout](89-spec-callout.md): the dismissible recipes put `button[nfsCloseButton]` with a bare `nfsClose` inside a callout that is a Toggler in visibility mode, or use `@if` with the consumer's `(click)` handler. Foundation's callout is already `position: relative`. Its Library mixin must check the close button's colours against its backgrounds; proposed text: "`nfs-callout` stops the compile with `@error` when `$closebutton-color` or `$closebutton-color-hover` is under 3:1 against a callout background (`$callout-background` and each `$foundation-palette` colour through `scale-color($color, $lightness: $callout-background-fade)`), each ratio from `color-luminance()`, unrounded. With Foundation's defaults the primary (2.84:1), secondary (2.87:1), and alert (2.82:1) backgrounds fail, and axe marks the glyph incomplete, so the story gate cannot catch it." Foundation's own Callout docs put their first closable example on an alert callout. The required setting is the Callout spec's choice; the measured candidates are above.
- [Re-run: Off-canvas spec under the class rule](117-rerun-off-canvas-class-rule.md):
  - Class mapping row `.close-button` becomes: "| `.close-button` | `button[nfsCloseButton]` ([Spec: Close Button](../issues/83-spec-close-button.md)) with a bare `nfsClose` beside it | The Close Button spec owns the class, the `type` default, the name check, and the 24 px floor |".
  - The 2.5.8 row's first sentence becomes: "The close button accepts presses across at least 24 by 24 CSS px through `nfs-close-button`'s floor, which the consumer includes; its spacing exception does not hold here, because Foundation's docs place the absolutely positioned button over the first menu link."
  - Sass rule (c) is removed; D20 becomes "| D20 | Close button | The 24 px floor is `nfs-close-button`'s ([Spec: Close Button](../issues/83-spec-close-button.md)) | 2.5.8; the spacing exception fails beside the first menu link |".
  - Missing-include item (5) moves the close-button sentence to a missing `nfs-close-button`.
  - The `$closebutton-color` against `$offcanvas-background` `@error` stays in `nfs-off-canvas`.
- [Re-run: Reveal spec under the class rule](110-rerun-reveal-class-rule.md): the `.close-button` rows (class mapping, Material comparison, ARIA) point to `nfsCloseButton` with a bare `nfsClose`. The 2.5.8 row becomes: "| 2.5.8 Target Size (Minimum) | Every close button is at least 24 by 24 CSS px through the `nfs-close-button` floor ([Spec: Close Button](../issues/83-spec-close-button.md)); the Reveal adds no rule | axe `target-size` in every story |". A close button in the `<form method="dialog">` alternative writes `type="submit"`, because `nfsCloseButton` defaults to `button`. The 1.4.11 check against `$reveal-background` stays.
- [Re-run: Toggler spec under the class rule](109-rerun-toggler-class-rule.md): the 2.5.8 row's close-button sentences become: "Every close button is at least 24 by 24 px through the `nfs-close-button` floor ([Spec: Close Button](../issues/83-spec-close-button.md))". The `toggler--closable` markup uses `nfsCloseButton`.
- [Re-run: Triggers (shared utility) spec under the class rule](130-rerun-triggers-class-rule.md):
  - In the 2.5.8 row, replace "a `.close-button` through the spacing exception of its corner position, with the consumer's `min-width: 24px` where a layout breaks it (the Button and Toggler specs)" with "an `nfsCloseButton` host through the 24 px box floor of the `nfs-close-button` mixin ([Spec: Close Button](../issues/83-spec-close-button.md))".
  - D13's rationale reads "`nfsButton`, `nfsCloseButton`, or the consumer owns `type`".
  - "A Trigger is usually also an `nfsButton` or a `.close-button`, whose classes those contracts own." becomes "A Trigger usually sits on an `nfsButton` or an `nfsCloseButton`, whose classes those directives own."
  - The Sass paragraph's "the Close Button markup" becomes "the [Spec: Close Button](../issues/83-spec-close-button.md)".
  - Its first `data-closable` replacement writes `animate.leave="nfs-fade-out"`, a library class name in consumer code, which ADR 0039's follow-up decision rules out; that re-run decides the replacement form.
- [Re-run: Button spec under the class rule](128-rerun-button-class-rule.md):
  - Out of Scope: "A Close Button directive. ..." becomes "- Close Button: its own spec, [Spec: Close Button](../issues/83-spec-close-button.md); `nfsButton` never goes on a close button, and `nfsCloseButton` warns in development when it does."
  - D10's Close Button half becomes "`.close-button` is bound by `nfsCloseButton` ([Spec: Close Button](../issues/83-spec-close-button.md)) and closes through a Trigger beside it; `nfsButton` never goes on it".
  - The 2.5.8 row's close-button sentences become "A close button is not a `.button`; its 24 px floor is the Close Button spec's."
  - The close-button rows of the Foundation contract, class mapping, and ARIA tables, user story 29, and the close-button usage example move to or point at the Close Button spec.
- [Spec: Top Bar](86-spec-top-bar.md): `nfsMenuIcon`'s `type` default and name check can take the same shape as `nfsCloseButton`'s (checks 1 and 2 in one `afterNextRender`). The hamburger keeps the pseudo-element hit area, because its box is its drawing, which the amended 1.10 text states.
- [Re-run: Breakpoint service (shared utility) spec under the class rule](129-rerun-breakpoint-service-class-rule.md): the Variant runtime check accepts a presence-only request; proposed text: "A directive may request a Variant setting with no bound value; such a request checks only that the Variant property is present, so `strictVariantProperties` reports a missing Library mixin include even where every Variant input is unset (the Close Button needs this for its 2.5.8 floor)."
- [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md): one manifest row, `$closebutton-size`, registry `NfsClosebuttonSizeOverrides`, defaults `small` and `medium`, read from `--nfs-closebutton-size`. The generator's docs can repeat the Sass facts above (matching offset keys; no number form).
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): check that every 2.5.8 row that names a close button (Off-canvas, Reveal, Toggler, Triggers, Button, Callout) points to the `nfs-close-button` floor, and that no container spec adds its own close-button target-size rule.

### Gist for Decisions so far

- [Spec: Close Button](issues/83-spec-close-button.md) -- one listener-free `button[nfsCloseButton]` binding `.close-button`, a `type` input defaulting to `button`, and a `size` Variant input over `NfsClosebuttonSizeOverrides`; it closes nothing, so `nfsClose` or a handler sits beside it, never hosted; development checks warn on a missing or symbol-only name and on `nfsButton` on the same element; `nfs-close-button` gives every close button a 24 px box floor (measured in three engines: axe passes it, while it reports Foundation's glyph box and a pseudo-element hit area as incomplete over a link), replacing Off-canvas's panel rule, and checks the colours against the page at 3:1, with containers checking their own backgrounds (the Callout's primary, secondary, and alert fail on Foundation's defaults); impact MEDIUM, confidence HIGH; no ADR. Spec: [specs/close-button.md](specs/close-button.md).

### Amendment, 2026-09-29 (consistency review)

From [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md), phase 2, group b, applying [its decisions](../research/consistency-review-decisions.md) and the review's checks CR-A to CR-D; `specs/close-button.md` was revised in place, and [the group's report](../research/consistency-review-group-b.md) lists every edit.

- R17: `NfsCloseButton` has no `exportAs` (building-blocks 1.3: it owns no state or method to read; adding one later is additive, and ADR 0045's deprecation policy starts at the first release). This reverses the `exportAs: 'nfsCloseButton'` of this ticket's Q14.
- R2: the Animation paragraph names the Toggler's typed Motion input and `animate.leave` with the consumer's own keyframe class (the Triggers spec's D17); `close-button--closable` closes its second callout with `animate="slide-out-right"`.
- R4: the WCAG lead and the Sass checks name the exact WCAG formula and the library's internal contrast helper; `color-luminance()` leaves the reused list. Every figure stands.
- R25: `close-button--closable` names the Close Button docs page's pair and points at the Callout's; the story intro says the stories render the Callout's `$closebutton-color: #767676`.
- R59: the Runtime check bullet names `nfsVariantCheck('nfsCloseButton')` and `include('nfs-close-button', ['closebutton-size'])` on every run; the missing-property case sits in a test file of its own; D10 reads "from its first render on".
- R74: check 1 counts an image's non-blank `alt` (or a `role="img"` element's `aria-label`) as text, check 2 reads the name as check 1 does, and the development-check cases gain a silent image-only button.
- A5: the Rendered HTML note names `nfsCallout` as the [Spec: Callout](89-spec-callout.md)'s directive.
- CR-B: the mapping gains rows for the Callout's, the Toggler's, and the Reveal's classes the examples carry.
- Unchanged (confirmed): R14, R50, R65; CR-A, CR-C, and CR-D hold. A single directive with no in-family parent, child, or peer, so no In-family line.

Triage: impact LOW (an `exportAs` removed before the first release, R17's rating; wording and development checks), confidence HIGH. Nothing is OPEN FOR HUMAN.

### Amendment, 2026-09-29 (consistency review, closing pass)

From [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md), closing pass:

- `specs/close-button.md`: development check 3 also counts the `nfsButton` attribute, and its browser-level case follows, by the [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md)'s bullet for checks that find another family's peer by its class, so it agrees with the Top Bar's check 3.

### Amendment, 2026-09-29 (exportAs on every directive)

From [Decide: an exportAs on every directive](156-decide-exportas-on-every-directive.md): `specs/close-button.md`'s `NfsCloseButton` gains `exportAs: 'nfsCloseButton'` (the API line and the Models/outputs/methods bullet).

### Amendment, 2026-09-29 (checks move to a later milestone)

From [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md), applied by [Re-run: specs without checks, group b](166-rerun-specs-without-checks-group-b.md): `specs/close-button.md` describes and accepts a library with no checks. What left the spec, per check:

- Misuse warnings: development checks 1 (no accessible name), 2 (a symbol-only name), and 3 (`nfsButton` on the same element), with their `afterNextRender` callback, the `ElementRef` injection read only by them, the first-render timing sentence, the browser-level case, the 4.1.2 row's check clause and test entry, the Material comparison's "development-mode name checks", the Solution's warnings, and user stories 14 to 16's warnings.
- Runtime checks: the Close Button Variant check (`nfsVariantCheck('nfsCloseButton')`, `include('nfs-close-button', ['closebutton-size'])`, `strictVariantNames`, `strictVariantProperties`), with the Runtime check hook injection, its browser-level case, the render-callback sentence of Rendering modes, the missing-include sentence, and user story 27's report.
- Build-time checks: the `nfs-close-button` glyph contrast `@error` against `$body-background` (Sass item 1(c)), with its Sass compile case (`#aaaaaa`), the 1.4.11 row's compile clause and test entry, user stories 25 and 26's compile error and container checks, and the settings the mixin read only for it.

Each rule is stated as documented usage: a Documented usage list in the API section (a name that says what the button closes, present from the first render; the glyph in `aria-hidden="true"`, never a symbol alone; no `nfsButton` on the same element; the include), the 1.4.11 and 4.1.2 rows, the docs conventions line, and Sass items 2 and 5. D6, D7, D9, and D10 are rewritten to what the spec now decides; user stories 14 to 16 and 25 to 27 state documentation, not warnings or compile errors. Unchanged: the directive, `type` and `size`, the 24 px floor, ARIA and keys, the lightweight token, the rendering modes, and the Story ids.
