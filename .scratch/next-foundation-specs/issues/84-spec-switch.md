# 84. Spec: Switch

Type: grilling
Status: resolved
Blocked by: 81
Labels: wayfinder:grilling
Map: ../map.md

## Question

What Angular directives (preferred) or components give Foundation for Sites 6.9's Switch to the next, from-scratch ngx-foundation-sites repo, under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Foundation's docs page is `docs/pages/switch.md` and its Sass is `scss/components/_switch.scss` in the 6.9.0 clone. Publish `specs/switch.md`.

Known from the triage: Native checkbox; no default `role="switch"` and never on radio switches (the accessibility lens); the off track is about 1.6:1 on white with the defaults (1.4.11), and focus visibility (2.4.7) needs a check.

## How to work it

Run `/grill-with-docs` (self-grilling, both sides) over the questions this component raises, then publish with `/to-spec` in the map's spec shape; the [Spec: Button](37-spec-button.md) is the nearest precedent. Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this component); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Cover: one directive per Structural class and what else each owns (the ARIA, `type` default, or development and compile-time checks the documented markup lacks for WCAG 2.2 AA, ADR 0022); every Variant as a typed input by the decision above; State classes as host bindings; the Sass mixin only where custom CSS or checks are needed (ADR 0012); the rendering-mode contract; stories with play functions and axe; e2e only where Storybook cannot reach. Record the decisions in this ticket's Answer, and propose shared-file changes (a building-blocks row, glossary terms) for the orchestrator. Model: Opus 5.5.

## Answer

Model: Opus 5.5

Spec: [specs/switch.md](../specs/switch.md).

Sources read: ADR 0039, ADR 0040, ADR 0001, ADR 0012, ADR 0022; the Answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) and building-blocks 1.3, 1.4, 1.7, 1.9, 1.10, 1.13, and 1.14 as they stand; `research/out-of-scope-triage.md` (the Switch row, the spec gap on the Switch focus indicator, the `nfs-switch` expectation); `research/foundation-component-catalogue.md` (the Switch row) and `research/out-of-scope-exclusions.md` (no Switch row; the category list); `map.md` Notes; `CONTEXT.md`; `storybook-conventions.md` section 5; the [Spec: Forms](98-spec-forms.md) and its ticket's Answer, the [Spec: Close Button](83-spec-close-button.md), the [Spec: Progress Bar](95-spec-progress-bar.md), and the Button, Abide, Slider, Off-canvas, Reveal, and Top Bar specs where they set a precedent; Foundation 6.9.0's Switch docs page, switch partial, and settings file; Angular 22.2.x's checkbox, radio, and default value accessor selectors and Signal Forms' native control code; Material 22.2.x's slide toggle and `_animationsDisabled()`; `@angular/aria` 22.2.x's pattern list; the APG Switch pattern and its checkbox example; the WCAG 2.2 Understanding documents for 1.4.11 and 2.4.7 (the w3c/wcag sources a sibling ticket fetched, read from its throwaway directory).

Measured (Dart Sass 1.104.1 over the Foundation 6.9.0 clone; Playwright 1.63 with Chromium 153, Firefox 155, and WebKit 26.6; axe-core 4.13.0 with the six tags; Chromium's CDP accessibility tree; read-only Windows UI Automation over headed Chromium and Firefox; throwaway files under `D:/tmp/nfs-wave-84/`, not committed):

- Exact ratios on Foundation's defaults: off track 1.625:1 against the page and the knob; focused off track 2.015:1; on track 4.647:1; focused on track 6.022:1; the focus change from rest 1.239:1 (off) and 1.295:1 (on); white inner-label text 1.625:1 (off) and 4.647:1 (on); `$input-border-focus` colour 3.422:1 against the page. With `$switch-background: #767676` and the focus line: 4.503:1 and 5.347:1. `#767676` overridden after Foundation's settings file without the focus line leaves the focused off track at 2.015:1.
- axe on every docs example, three engines: no violation; `label` and `target-size` pass; `color-contrast` on the inner labels incomplete ("pseudo element"). On the library's markup (visible `<label for>` plus empty paddle): no violation; `form-field-multiple-labels` incomplete; `role="switch"` on a radio: `aria-allowed-role` violation.
- Names (Chromium CDP, and UI Automation in Chromium and Firefox): visible label plus empty paddle names by the visible text alone; `aria-labelledby` wins; a visible label plus hidden paddle text gives both texts; inner labels without `aria-hidden` add the shown word ("... Yes"); `role="switch"` maps to a UI Automation Button with the localized type "switch" and a Toggle pattern; WebKit's tree is not exposed on Windows.
- Geometry at a 16 px root, three engines: paddle 48 by 24 (`tiny`), 56 by 28, 64 by 32, 80 by 40 px; knob 16 to 32 px; the invisible input 13, 14, or 12 px at the track's corner.
- Focus: Tab in Chromium and Firefox and `focus()` in WebKit match `:focus-visible`; Foundation changes only the track colour; the candidate ring (`outline: $input-border-focus; outline-offset: $switch-paddle-offset`) draws a 1 px ring 4 px outside the track in all three; a pointer press focuses the input without `:focus-visible` in Chromium and Firefox and leaves focus on `body` in WebKit. `$switch-paddle-transition: all` also eases the ring in over 0.25 s.
- Forced colours (Chromium, Firefox): Foundation's switch takes Canvas everywhere and disappears; the candidate rule draws a `CanvasText` edge and off knob, a `Highlight` on track with a `HighlightText` knob and text, and `GrayText` disabled switches; the ring's colour is forced to `CanvasText`.
- Reduced motion, three engines: 50 ms after a press the knob is mid-slide (16 to 20 px of 44) without the rule and at 44 px with it.
- Text spacing (1.4.12), three engines: "Yes"/"No" and "On"/"Off" stay inside the track and clear of the knob at every size, with and without the spacing overrides.
- The candidate `nfs-switch` checks: Foundation's defaults stop the compile with four failing pairs; the required settings compile with the three rule blocks and no nfs warning; `$dark-gray` passes the errors and warns on inner-label text (3.422:1, 4.127:1); `#aaaaaa` focus border 2.303:1, `$global-font-size: 87.5%` (`tiny` 21 px), and a `#54a0d8` on track (2.814:1) each stop it; `#116666` on `#0a0a0a` stops it at 2.937:1.

### Grilling log

Both sides, AFK. Each question with the answer settled on.

1. Which elements get a directive? The five Structural classes: `.switch`, `.switch-input`, `.switch-paddle`, `.switch-active`, `.switch-inactive`. The visible label is a Form label, styled by tag, with no directive of its own (the Forms spec's `nfsFormLabel` only for `middle`). The other side, one container directive that sets its children's classes by DOM lookup, loses to ADR 0039's one directive per Structural class, as in the Forms spec.
2. A component instead (Material's slide toggle)? No. Foundation generates nothing (ADR 0001), and `formControlName`, `ngModel`, and `[formField]` must sit on the consumer's own input; a component would need its own value accessor.
3. Names and selectors? `NfsSwitch` (`[nfsSwitch]`), `NfsSwitchInput` (`input[nfsSwitchInput]`), `NfsSwitchPaddle` (`label[nfsSwitchPaddle]`, because Foundation's inner-label rules select `input:checked + label`), `NfsSwitchActive`, `NfsSwitchInactive`, as the triage sketched and building-blocks 1.3 names them.
4. Does the input directive own `type`, as `nfsButton` and `nfsCloseButton` do? No. Angular's checkbox and radio value accessors match `input[type=checkbox]` and `input[type=radio]` on the static attribute (read in the 22.2 source), so a host-bound `type` gives `formControlName` the `DefaultValueAccessor` and a string value. The consumer writes `type`; a development check reads the static attribute through `HostAttributeToken`. The other side, selectors that require `type=checkbox`, would drop the class silently on a missing `type`.
5. `role="switch"`: default, input, or the consumer's attribute? The consumer's, on a checkbox that turns a setting on or off; no default; never on a radio (development warning; axe `aria-allowed-role` measured). The other side (always `switch`, as Material does) loses: the APG asks for the role that matches the meaning and gives the pre-takeoff checklist as the case where a checkbox reads better; Foundation's markup is a checkbox and its own inner-labels example is a yes-or-no question; the triage's accessibility lens decided the same. A `switchRole` input would be a second spelling of a native attribute.
6. How is the switch named? By a visible `<label for>` before it or `aria-labelledby` to visible text, with the paddle left without text. Foundation's `.show-for-sr` text gives no visible label (3.3.2) and repeats a visible one (measured). The multiple-labels pattern is named correctly by Chromium and Firefox (measured); axe's `form-field-multiple-labels` is a review note satisfied by the first label; WebKit and VoiceOver go to the manual release test. Rejected: `aria-hidden` on the paddle (silently erases a name the consumer wrote) and a label wrapping the switch (a label cannot hold the paddle label; `.switch` sets white text).
7. Which development checks? On the input: no name; paddle text in the name (only when no `aria-labelledby` or `aria-label` overrides it); static `type`; `role="switch"` on a radio. On the paddle: it directly follows its input and its `control` is that input (a broken link leaves a 13 px invisible input as the only pointer target, 2.5.8). On the container: copied size classes. All once, at the first render, in `afterNextRender`, development only. No inner-label placement check: a misplaced inner label is visible at once.
8. Do the inner labels get `aria-hidden`? Yes, statically, from their directives: without it the shown word joins the name and changes it with the state (measured), which the APG forbids.
9. How is size typed? A closed union `NfsSwitchSize` (`'tiny' | 'small' | 'large'`): Foundation's Sass writes the three classes itself and no setting lists them, so no registry and no Variant property, as the Reveal's sizes; one `computed` class record strips copied size classes. A custom size is the consumer's own class built with Foundation's `switch-size()` mixin.
10. State classes? None: the state is the input's pseudo-classes, which Foundation's sibling selectors read.
11. Disabled? Native `disabled` only; Foundation draws only `:disabled`, so no `disabledInteractive`.
12. Tokens, parent discovery, models, outputs? None: the cascade does the parent's work, and the native `checked` and `change` are the API Foundation's docs name.
13. Automatic `for` and `id`? No: the visible label needs the consumer's id anyway, and generated ids differ between server and client.
14. Which settings make the track pass 1.4.11? `$switch-background: #767676` (4.503:1 against the page, the knob, and for inactive inner-label text) with Foundation's focus expression repeated after it, because the settings file computes the focus track from the old colour (2.015:1). The other side, `$dark-gray` (3.422:1), passes the graphic pairs and fails inner-label text; it stays allowed, with the warning. A dark knob on Foundation's light track would leave the track, against which the knob's position reads, at 1.625:1.
15. How is focus made visible? A ring, `outline: $input-border-focus; outline-offset: $switch-paddle-offset`, around the track. The other side, requiring focus tracks 3:1 from the resting ones (the Forms spec's 1.4.1 rule for its focus border), would force near-black focused tracks (luminance under about 0.06) and still vanish under forced colours. The Slider's `2px solid $black` ring uses a library colour a dark theme cannot change; `outline: auto` cannot be checked at compile time. `$input-border-focus` is Foundation's form focus colour, which the Forms spec already requires as `$black`, and `$switch-paddle-offset` Foundation's own switch spacing, so no value is the library's.
16. Forced colours? A rule is needed: measured, the switch disappears in Chromium and Firefox. System colours as the Slider's rule 13 uses them; not `forced-color-adjust: none`, which overrides the user's theme.
17. Reduced motion? Foundation's knob slide is motion; `transition-duration: 1ms`, the Off-canvas spec's rule for Foundation's transitions, keeping `transitionend` (building-blocks 1.6 rule 5).
18. Target size? Every size passes by size at a 16 px root (`tiny` exactly 24 px); a compile-time `@error` on a height setting under 24 px at the consumer's `$global-font-size`, converted through Foundation's `rem-calc()`.
19. `@error` or `@warn`? `@error` for the graphic pairs the component always draws and for heights; `@warn` for inner-label text, an optional placement (the Top Bar spec's rule).
20. Radio switches? Native radio groups in a `fieldset` with a `legend` in every example; no group check (the Forms spec's fieldset precedent; additive later).
21. Abide? `nfsAbideInput` beside `nfsSwitchInput`; `.is-invalid-input` lands on the invisible input, so the label's `.is-invalid-label` and the Form error carry the state; Abide's value rescue covers checkbox and radio hosts.
22. A value rescue in the switch input for a pre-hydration toggle outside Abide? No: the forms layer owns the value, as the Forms spec decided for native controls; the limit is documented.
23. A run-time report of a missing include? None possible without a Variant property; the presence marker stays the Progress Bar's recorded upgrade path; the stories catch it in the library's CI.
24. Rendering modes? Static host classes and attributes and one class record; no listeners; hydration-clean; a dehydrated or `hydrate never` switch toggles and submits natively.
25. An ADR? No: the choices are reversible CSS or follow existing ADRs and precedents; the no-default-role decision is recorded as D3, where a later reader who wants `role="switch"` everywhere finds the reason.
26. Glossary? **Switch**, **Switch paddle**, **Inner label** (Foundation's Sass calls the knob "the paddle itself" while `.switch-paddle` names the whole label).

### Decisions

1. Five attribute directives in `ngx-foundation-sites/switch`, one per Structural class: `NfsSwitch` (`[nfsSwitch]`, `.switch`), `NfsSwitchInput` (`input[nfsSwitchInput]`, `.switch-input`), `NfsSwitchPaddle` (`label[nfsSwitchPaddle]`, `.switch-paddle`), `NfsSwitchActive` (`[nfsSwitchActive]`), `NfsSwitchInactive` (`[nfsSwitchInactive]`); static host classes; no component.
2. `NfsSwitch.size`: a Closed Variant family, `NfsSwitchSize = 'tiny' | 'small' | 'large'`, exported from the entry point, default unset, bound through one `computed` class record that strips copied size classes; no registry, no Variant property, no Runtime check.
3. `NfsSwitchInput` binds no `type`, `role`, `checked`, `disabled`, or ARIA; the consumer writes a static `type="checkbox"` or `type="radio"`, because Angular Forms selects its accessors by it.
4. No default role: the consumer writes `role="switch"` on a checkbox that turns a setting on or off, and never on a radio.
5. The switch is named by a visible `<label for>` before it or `aria-labelledby` to visible text; the paddle holds no text; Foundation's `.show-for-sr` pattern is replaced.
6. `NfsSwitchActive` and `NfsSwitchInactive` bind `aria-hidden="true"`.
7. Development checks, once, at the first render, development builds only: no name; paddle text in the name; static `type`; `role="switch"` on a radio (input); paddle follows its input and names it (paddle); copied size classes (container).
8. No tokens, providers, models, outputs, methods, `exportAs`, or listeners; native implementation level; no Aria or CDK.
9. `nfs-switch` rules: the focus ring `outline: $input-border-focus; outline-offset: $switch-paddle-offset` on `.switch-input:focus-visible ~ .switch-paddle`; a forced-colours block (`CanvasText` edge and off knob, `Highlight` on track with `HighlightText` knob and text, `GrayText` disabled); `transition-duration: 1ms` on the paddle and its knob under reduced motion.
10. `nfs-switch` checks with the exact helper: `@error` for each track colour under 3:1 against `$body-background`, the knob under 3:1 against each track colour, the ring colour under 3:1 against `$body-background`, and a height setting under 24 px; `@warn` for `$white` inner-label text under 4.5:1 on its tracks.
11. Required settings on Foundation's defaults: `$switch-background: #767676;` and `$switch-background-focus: scale-color($switch-background, $lightness: -10%);`.
12. Radio switches in a `fieldset` with a `legend`; no group check.
13. Validated switches carry `nfsAbideInput` beside `nfsSwitchInput`; no value rescue in the switch input.
14. Stories `switch--default`, `switch--disabled`, `switch--radio`, `switch--sizes`, `switch--inner-labels`, `switch--switch-role`, `switch--labelled-by`, `switch--forms`, `switch--focus`, `switch--contrast`, title `CSS-only components/Switch`, `component: NfsSwitch`; no Anti-pattern story.
15. e2e only where Storybook cannot reach: the ring in three engines, forced colours in Chromium and Firefox, reduced motion, text spacing, pointer toggling in three engines, and the fixture route's JavaScript-disabled, hydration, and `hydrate never` cases; a manual screen-reader release test.
16. Three glossary terms: **Switch**, **Switch paddle**, **Inner label**.

### Triage

| Item | Impact | Confidence | Evidence | Outcome |
| --- | --- | --- | --- | --- |
| Directive set, names, selectors (1) | HIGH: public API | HIGH: ADR 0039, building-blocks 1.3, the triage sketch, Foundation's selectors | | Decided |
| Closed `size` (2) | MEDIUM | HIGH: ADR 0040, building-blocks 1.4 rule 3, Foundation's Sass | | Decided |
| No `type` binding (3) | MEDIUM: adding a default later is additive | HIGH: Angular's accessor selectors read in source | | Decided |
| No default role (4) | HIGH: the announced semantics of every switch | HIGH: APG, ARIA in HTML, the triage's accessibility lens, measured mappings | Not a bare default; Material's opposite choice recorded (D3) | Decided |
| Visible label pattern and checks (5, 7) | MEDIUM | HIGH: names measured in Chromium and Firefox | WebKit and VoiceOver unmeasured on Windows; manual release test | Decided |
| `aria-hidden` on inner labels (6) | LOW | HIGH: measured | | Decided |
| Focus ring from `$input-border-focus` (9) | MEDIUM: the look of a focused switch; CSS, reversible | HIGH: measured in three engines and under forced colours; the Understanding document for 1.4.11 | Differs from the Slider's ring; routed to the consistency review | Decided |
| Forced-colours and reduced-motion rules (9) | LOW: additive CSS | HIGH: measured | | Decided |
| Checks and required settings (10, 11) | MEDIUM: consumers on defaults stop compiling | HIGH: exact ratios measured; Top Bar and Forms precedents | | Decided |
| No value rescue outside Abide (13) | LOW: additive later | HIGH: the Forms spec's stance; Abide covers validated switches | | Decided |

Nothing is left OPEN FOR HUMAN, and no prototype is needed: every open point was measured by this ticket, settled from primary sources, or is LOW impact. No ADR.

### Proposed shared-file changes

For the orchestrator; anchors are quoted because line numbers move while the fixer applies other tickets.

1. `building-blocks.md`, Table D, the Switch row (`| Switch | `docs/pages/switch.md` | ...` with six empty cells), replace with:

   "| Switch | `docs/pages/switch.md` | [Spec: Switch](issues/84-spec-switch.md) | `[nfsSwitch]` (`NfsSwitch`: binds `.switch`; closed `size` Variant input, `'tiny' \| 'small' \| 'large'`); `input[nfsSwitchInput]` (`.switch-input` on the consumer's native checkbox or radio, which keeps its own static `type`, `checked`, and forms directives); `label[nfsSwitchPaddle]` (`.switch-paddle`); `[nfsSwitchActive]` and `[nfsSwitchInactive]` (the inner labels, with `aria-hidden="true"`); named by a visible `<label for>` or `aria-labelledby`; `role="switch"` is the consumer's, on checkboxes only | Directives, one per Structural class (ADR 0001, ADR 0039); nothing is generated, and Angular Forms must sit on the consumer's input | Native platform: an HTML checkbox or radio and its labels; Aria has no checkbox or switch pattern, and CDK adds nothing | Static host classes and attributes; one `computed` class record for `size` (copied classes stripped); development checks in `afterNextRender` (name, paddle text in the name, static `type` through `HostAttributeToken`, `role="switch"` on a radio, the paddle's `for`, copied size classes); `nfs-switch` (a focus ring from `$input-border-focus` offset by `$switch-paddle-offset`, forced-colours system colours, a reduced-motion rule, `@error` on track, knob, ring, and height pairs, `@warn` on inner-label text) | Switch when the consumer writes `role="switch"`; otherwise the native checkbox and radio; a group of switches is a `fieldset` with a `legend` |"


2. `building-blocks.md` 1.10, a new bullet after the Progress Bar bullet (`- Progress Bar ([Spec: Progress Bar](issues/95-spec-progress-bar.md)): ...`) and before `- Elements that can cover content (Sticky): ...`:

   "- Switch ([Spec: Switch](issues/84-spec-switch.md)): Foundation hides the switch input with `opacity: 0`, which hides its focus ring, and marks focus only by a darker track (1.239:1 and 1.295:1 from rest), so the `nfs-switch` Library mixin draws `outline: $input-border-focus; outline-offset: $switch-paddle-offset` around a focused switch's track (2.4.7, 1.4.1), paints the switch in system colours under forced colours, where Foundation's background-only drawing takes Canvas and disappears, and stops the knob's slide under reduced motion. It stops the compile when a track colour is under 3:1 against `$body-background`, the knob under 3:1 against a track colour, the ring colour under 3:1 against `$body-background`, or a height setting under 24 px, and warns when `$white` inner-label text is under 4.5:1. The consumer must set `$switch-background: #767676;` (Foundation's off track is 1.625:1 against the page and the knob) and repeat `$switch-background-focus: scale-color($switch-background, $lightness: -10%);` after it, because Foundation's settings file computes the focus track from the old colour (2.015:1), mirrored in the Storybook settings overrides."

3. `CONTEXT.md`, Foundation side, after the Progress Bar terms (**Progress Bar**, **Progress meter**), three new terms:

   ```markdown
   **Switch**:
   Foundation's CSS-only on/off control: a native checkbox or radio hidden inside a `.switch` container and drawn by its Switch paddle; distinct from the ARIA `switch` role, which a Switch carries only when the consumer writes it on a checkbox.
   _Avoid_: toggle, slide toggle, toggle switch

   **Switch paddle**:
   The `<label>` bound `.switch-paddle` that directly follows a Switch's input, draws its track and the knob inside it, and is its pointer target.
   _Avoid_: paddle (bare, which Foundation's Sass also uses for the knob), track, handle

   **Inner label**:
   A `.switch-active` or `.switch-inactive` word inside a Switch paddle that shows the state visually and is hidden from assistive technology.
   _Avoid_: state label, switch text, on/off label
   ```

4. `storybook-conventions.md` section 5: in the `_settings-overrides.scss` block, a new entry after the Forms lines (after `$input-border-focus: 1px solid $black;`):

   ```scss
   // Non-text contrast (1.4.11) and color-contrast (1.4.3): the off track is 1.63:1 against the page and the knob,
   // and white inner-label text 1.63:1 on it; nfs-switch stops the compile. Spec: Switch, every switch--* story.
   $switch-background: #767676;
   // Foundation's settings file set the focus track from the old colour; without this line it stays 2.02:1.
   $switch-background-focus: scale-color($switch-background, $lightness: -10%);
   ```

   And in the `preview.scss` block, after `@include nfs-progress-bar; // ...`:

   ```scss
   @include nfs-switch; // Switch: the focus ring, forced colours, reduced motion, and contrast and height checks; every switch--* story
   ```

5. `README.md`, a row for the spec after the last CSS-only component row of the index table (currently `| Forms (CSS-only component) | ...`):

   "| Switch (CSS-only component) | [specs/switch.md](specs/switch.md) | Native platform (an HTML checkbox or radio and its labels) with five class directives ([ADR 0039](adr/0039-directives-manage-every-foundation-class.md)) | No inventory: Foundation's Switch docs and switch Sass, with the [out-of-scope triage](research/out-of-scope-triage.md) (Switch row) | None needed; contrast, focus, forced colours, reduced motion, names, and geometry measured in [Spec: Switch](issues/84-spec-switch.md) |"

6. `specs/forms.md`, Sass subsection, the paragraph after the required-settings table (`A consumer with another palette or background picks any placeholder colour ...`), append:

   "The same `$input-border-focus` draws the focus ring of a switch, whose input Foundation hides ([Spec: Switch](../issues/84-spec-switch.md)); `nfs-switch` checks its colour against the page as well."

7. `map.md`, Decisions so far: the gist below.

### What other specs need from this one

- [Spec: Forms](98-spec-forms.md): proposal 6; a switch's visible label is a Form label and its help text `nfsHelpText`, unchanged; its radio-group guidance (`fieldset` and `legend`) applies to radio switches.
- [Spec: Abide](31-spec-abide.md): nothing to change. A validated switch carries `nfsAbideInput` beside `nfsSwitchInput` and `[nfsAbideLabel]` on its visible label; `.is-invalid-input` lands on the invisible input, so the label and the Form error carry the state; the value rescue covers the switch as a checkbox host. An optional sentence for its control-kinds list: "A switch's input is hidden, so its `.is-invalid-input` look is not seen; the label's `.is-invalid-label` and the Form error carry the state ([Spec: Switch](84-spec-switch.md))."
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): two custom-drawn form controls now draw focus rings differently: the Slider a library `2px solid $black` ring offset 2 px, the Switch `$input-border-focus` offset `$switch-paddle-offset`, chosen because a dark theme can change the setting; the review decides whether to align them. It also checks the Table D row, the README row, and the overrides lines.
- [Spec: Visibility Classes](104-spec-visibility-classes.md): Foundation's `.show-for-sr` inside a switch paddle is the pattern this spec replaces; the library's switch markup uses none.
- [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md): `NfsSwitchSize` is closed and lives in the switch entry point; no registry, no manifest row, no Variant property.
- [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md): every Out of Scope line and every rejected alternative in the design decisions table carries its category.

### Gist for Decisions so far

- [Spec: Switch](issues/84-spec-switch.md) -- five class directives in one entry point (`nfsSwitch` with a closed `size`, `input[nfsSwitchInput]`, `label[nfsSwitchPaddle]`, and the inner labels, which bind `aria-hidden`), on the consumer's native checkbox or radio, whose static `type` stays the consumer's because Angular Forms selects its accessors by it; no default `role="switch"` and never on a radio; a visible `<label for>` or `aria-labelledby` replaces Foundation's hidden paddle text, which doubles a visible label's name (measured), with development checks for both; `nfs-switch` draws a focus ring from `$input-border-focus` because Foundation's focus is a 1.239:1 colour change, paints the switch in system colours under forced colours, where it otherwise disappears (measured), stops the slide under reduced motion, and stops the compile on track, knob, ring, and height pairs, requiring `$switch-background: #767676` (Foundation's off track is 1.625:1); impact HIGH, confidence HIGH; no ADR. Spec: [specs/switch.md](specs/switch.md).

### Amendment, 2026-09-28 (out-of-scope survivors)

By [Re-run: Switch spec, out-of-scope survivors](147-rerun-switch-out-of-scope-survivors.md), which holds the measurements, the grilling record, the triage, and the proposed shared-file changes. [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md) brought switch-7 into scope: ADR 0039 gives `input[nfsSwitchInput]` the development check that Foundation's radio switches, which sit in no group, lack for 1.3.1, and "additive later" says when a check could land, not whether the directive owes it. [specs/switch.md](../specs/switch.md) is revised in place.

What changed, against the decisions above:

- Decision 7 (development checks) gains check 5 on the input, and the paddle's check becomes check 6. Check 5 runs on a radio switch and reports when no ancestor holding every radio of its HTML radio button group (same tree, same form owner, same non-empty `name`; a radio without a `name` is a group of one) is a `fieldset`, or an element with the `group` or `radiogroup` role, named in accessible-name order (`aria-labelledby` text, a non-blank `aria-label`, for a `fieldset` its first `legend` child's text outside `aria-hidden` subtrees, then `title`). Only the group's first radio switch in tree order reports, so a group warns once; the message names the group's `name` (or the radio's `id`) and the fix, a `fieldset` whose first child is a `legend`, as every example writes it. Development builds only, in the existing `afterNextRender` read callback, never on the server.
- Decision 12 (radio switches) turns round: radio switches sit in a `fieldset` with a `legend` in every example, and check 5 reports those that no named group holds (spec D16). Rejected: no check (`platform-or-a11y`), the check on `fieldset[nfsFieldset]` (`scope-boundary`), a named `form` or `section` as the group (`platform-or-a11y`), a name from the legend alone (`platform-or-a11y`), one warning per radio (`other`), a module-level record of reported groups (`other`), a full accessible-name computation (`other`).
- Out of Scope: the radio-group check bullet is removed; `.show-for-sr` now gives its reason (a visible label replaces Foundation's hidden paddle text, D4) and names `nfsShowForSr`; a new bullet keeps out a check that the group's name is visible (`scope-boundary`).
- Measured (the re-run's Answer): 24 grouping patterns in Chromium's CDP tree and UI Automation over Chromium and Firefox, with check 5's condition run in three engines. The condition agrees with both engines except where they disagree with each other (a nested or `aria-hidden` legend, which Firefox names and Chromium does not; check 5 reports both) and one false positive, a legend holding only an image's `alt`, stated as a limit of the text reading checks 1, 2, and 5 share.
- Spec sections revised: the header, Problem Statement, Solution, User Stories (38; story 12 is new), Foundation contract (docs conventions), class mapping, API table, development checks, ARIA and keyboard (two rows and the measured groups), the 1.3.1 row, the implementation-level fallback line, Testing Decisions (layer 2), Out of Scope, D16, Foundation behaviour changed or dropped, and Notes.
