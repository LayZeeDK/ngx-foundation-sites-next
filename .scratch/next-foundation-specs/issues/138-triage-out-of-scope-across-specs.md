# 138. Triage: out-of-scope items across the specs

Type: grilling
Status: resolved
Blocked by: 82, 84, 87, 88, 90, 91, 92, 93, 94, 95, 96, 97, 99, 100, 101, 102, 103, 104, 105, 106, 112, 113, 114, 115, 116, 117, 119, 120, 124, 125, 126, 127, 131, 136, 137, 143, 144
Labels: wayfinder:grilling
Map: ../map.md

## Question

The user asked on 2026-09-28 for every spec item currently deemed out of scope to be audited and triaged, in the context of the map, the tickets, the research, the references, the requirements, the precedence of the bundle's sources, the goals, and every other artifact under `.scratch/`. Which items that the 52 specs, the map, building-blocks, and the ADRs rule out of scope should come into scope, and what do they become? Every exclusion's reason is re-checked against its sources and against the rulings that postdate it: the CSS-only ruling and the class rule ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md), ADR 0039), the Variant typing decision ([Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md), ADR 0040), directive composition over subclassing, and the user's precedence note that the repository's API-design skill ranks below the bundle's decisions. Items whose reason still holds stay out with the reason restated; survivors come into scope and are resolved before the consistency review.

This ticket waits until every spec and re-run ticket of the class-rule wave has resolved, so that it reads settled Out of Scope sections and no survivor edits a spec another agent is writing.

## Inputs noted after charting

- 2026-09-28, from the [Spec: Typography Helpers](106-spec-typography-helpers.md) ticket: `$blockquote-color` is 3.423:1 on the page on Foundation's defaults, a WCAG 1.4.3 failure on a base element style, which the map's Out of scope rules out and no spec owns. The Typography Helpers ticket names `nfs-typography-base` as the natural home for a compile-time check if one is adopted. Triage it with the other out-of-scope items.

## How to work it

1. Evidence (Sonnet 5, read-only, split across agents by spec group): list every out-of-scope item in the 52 specs (Out of Scope sections, Dropped options, rejected rows in Design decisions, Further Notes), the map's Out of scope, building-blocks, and the ADRs, each with its location, its stated reason, and a reason category, updating `research/out-of-scope-exclusions.md` into a new `research/out-of-scope-exclusions-2.md` that marks which rows are new since [Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md) and which [Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md) already re-checked.
2. Triage: lenses in the pattern of [Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md) (an Angular-native API lens on Fable 5.1; an adversarial scope and Foundation-fidelity lens on Opus 5.5; an accessibility lens on Opus 5.5; Opus 5.5 takes any Fable seat if Fable credit runs out), then an Opus 5.5 judge who weighs the arguments, records dissent, rates each item under the map's triage quadrant, and writes `research/out-of-scope-triage-2.md`. Items the triage cannot settle from evidence, and every HIGH-impact item with NOT-HIGH confidence, go to the user with a recommendation.
3. Survivors: the orchestrator graduates each survivor, or each group of survivors in one spec, into a re-run ticket ("Re-run: <spec> spec, out-of-scope survivors") resolved by an Opus 5.5 agent, and adds them to the consistency review's `Blocked by`.

## Answer

Judge's ruling, 2026-09-28, AFK. The judge weighed the evidence file [research/out-of-scope-exclusions-2.md](../research/out-of-scope-exclusions-2.md) and the three lenses, [research/out-of-scope-lens-2-api.md](../research/out-of-scope-lens-2-api.md), [research/out-of-scope-lens-2-scope.md](../research/out-of-scope-lens-2-scope.md), and [research/out-of-scope-lens-2-a11y.md](../research/out-of-scope-lens-2-a11y.md). It judged the arguments, not the votes. It recomputed the contrast ratios, read the migration lookup in the installed `nx` and `@angular/cli` sources, and checked every row's coverage by the lenses. It ran no browser. The full verdict, the evidence per item, the dissent, and the holds by group are in [research/out-of-scope-triage-2.md](../research/out-of-scope-triage-2.md) (cited "T2" below).

### Panel record

| Role | Model | Output |
| --- | --- | --- |
| Evidence sweep (step 1: five read-only agents, four over 13 specs each and one over the map, building-blocks, the ADRs, the architecture guide, and the charting input) | Sonnet 5 | `research/out-of-scope-exclusions-2.md` |
| Angular-native API lens | Fable 5.1 | `research/out-of-scope-lens-2-api.md` |
| Adversarial scope and Foundation-fidelity lens | Opus 5.5 | `research/out-of-scope-lens-2-scope.md` |
| Accessibility lens | Opus 5.5 | `research/out-of-scope-lens-2-a11y.md` |
| Judge | Opus 5.5 | `research/out-of-scope-triage-2.md` and this Answer |

### Counts

- Rows: 718. 417 are new since [Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md), 297 were re-checked by it, and 4 were carried without a verdict. Every new row was judged by at least two lenses. The 31 re-checked rows that no lens names one by one fall under the scope and accessibility lenses' statements that every remaining re-checked row holds (T2 3.2).
- Lens verdicts: the API lens gave 3 partly verdicts on 2 rows, the scope lens 2 partly on 3 rows, and the accessibility lens 1 fails and 6 partly on 7 rows. Together that is 10 rows with a fails or partly verdict from at least one lens.
- Judge: 7 of those rows come into scope, as 4 items for 3 specs. 3 are turned down: forms-4, button-3, and variant-declaration-tooling-4, which hold with corrected reasons where needed.
- Holds: 711 rows. 38 of them carry a stated reason that is wrong, loose, or missing, in 23 specs. One of them, switch-14, goes with the Switch re-run; a fixer applies the other 37, in 22 specs. The surviving items' own rows (typography-helpers-1, callout-7, card-7, top-bar-7, map-1) get new wording through their re-runs and the map proposal.
- OPEN FOR HUMAN: none.

### Decisions

1. **`$blockquote-color`** (input-1, with the check half of typography-helpers-1 and map-1): comes in as a compile-time check in checks-only `nfs-typography-base`, with a required `$blockquote-color: #737373;`. No directive. The map's base-styles line gains the check rule. MEDIUM, HIGH.
2. **Greys on tinted containers** (callout-7, card-7): comes in as a stated requirement in the Typography Helpers spec. Its greys are checked on the page only, and they need 4.5:1 on a light container background, which `#737373` misses (3.799:1 to 4.465:1) and `#666666` reaches (4.601:1 at worst). There is no new compile check, and the Callout and Card reasons are corrected. LOW, HIGH.
3. **Radio switches without a named group** (switch-7): comes in as a development check on `input[nfsSwitchInput]`, because ADR 0039 gives the directive the check its documented markup lacks, and axe has no rule for it. LOW, HIGH.
4. **The menu icon's bars under forced colours** (top-bar-7): comes in, pending measurement. `nfs-menu-icon` calls Foundation's `hamburger()` with system colours under `forced-colors: active`. If the measurement fails, the exclusion stays with the corrected reason. LOW, NOT HIGH. It is decided, because it is LOW impact.
5. **The File Upload Button's `label` host** (forms-4, button-3): stays out. The Button's reason is corrected: Foundation's label-first order has no indicator inside the Browser target, and the reordered and nested forms are not Foundation's markup, are unmeasured, and hide the file name. It is additive later. LOW, HIGH.
6. **`ng add`, `nx add`, and migrations** (variant-declaration-tooling-4): stays out. The bullet is narrowed to the declaration file. The library's own migrations follow ADR 0045 and arrive with the first release that needs one, because `nx migrate` and `ng update` read the migrations of the version they move to. An `ng-add` alias would stop on the `nx` dependency on an Angular CLI workspace. LOW, HIGH.

### Triage

Under the map's quadrant (`map.md:143`):

| Item | Impact | Confidence | Outcome | Why |
| --- | --- | --- | --- | --- |
| 1. `$blockquote-color` check | MEDIUM: a new compile stop and required setting; under ADR 0045, adding either after the first release waits for an Angular major | HIGH: the ratio was recomputed (3.423:1), the mixin and its check shape exist (D9), and the map's accessibility preference and ADR 0022 leave no failing default as advice; all three lenses agree | Decided | The map's line gives a reason for no directive, not for no check |
| 2. Greys on tinted containers | LOW: a stated requirement and two reason edits | HIGH: ratios recomputed; ADR 0022's dated note and P26 give the form | Decided | The containers check what Foundation's markup puts on their backgrounds (Callout D7, Card D8), and Foundation puts no grey text there |
| 3. Radio-group check | LOW: development only, no public API | HIGH: ADR 0039, P23, the spec's own 1.3.1 row, and no axe rule | Decided | "Additive later" is not a reason ADR 0039 accepts for a check the directive owes |
| 4. Forced-colours bars | LOW: a forced-colours fix, which a minor release may carry | NOT HIGH: unmeasured | Decided, with the re-run's measurement as the gate | Switch D12 and Slider rule 13 are the precedent. The stated reason (copying offsets) is wrong |
| 5. File Upload `label` host | LOW: a new host is additive in any release | HIGH: the native input meets every criterion; Foundation's order has no in-target fix | Decided: stays out | Its forms are not Foundation's, and three behaviours are unmeasured |
| 6. `ng add` and migrations | LOW: additive; the collection can arrive with the first migration | HIGH: ADR 0045's text, and the `nx` and `@angular/cli` sources | Decided: stays out, reason narrowed | Nothing needs to ship empty in the first release |

### Survivors: proposed re-run tickets

Each is `Type: grilling`, is resolved by an Opus 5.5 agent, is blocked by this ticket, and blocks [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md) and [Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md). [Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md)'s How to work it adds the re-run tickets this triage creates to its Blocked by. Each re-run edits its spec and the ticket's named output files, and it proposes shared-file edits in its Answer. The texts below are the starting point.

**1. Re-run: Typography Helpers spec, out-of-scope survivors.**

- Items: input-1, with typography-helpers-1 and map-1; callout-7 and card-7.
- Output files: `specs/typography-helpers.md`, and the one bullet each in `specs/callout.md` (`:325`) and `specs/card.md` (`:286`).
- Evidence: T2 sections 2 and 3.1. `scss/typography/_base.scss:421-430` prints the blockquote colour. `$blockquote-color: $dark-gray` is 3.423:1 on `#fefefe`. The ratios the required `#737373` reaches are 3.799:1 on `$light-gray`, 3.870:1 to 4.307:1 on the callout tints, 4.198:1 on the table's stripes and footer, and 4.465:1 on its head. `#666666` reaches 4.601:1 at worst. The judge recomputed each with the exact formula.
- It must decide:
  1. The check. `nfs-typography-base` gives one `@error` listing every pair under 4.5:1, `$header-small-font-color` and `$blockquote-color` against `$body-background`, through the library's exact helper. The required setting is `$blockquote-color: #737373; // nfs-typography-base: $dark-gray is 3.423:1 on $body-background`. The edit reaches the summary (`:26`), user story 27 (`:56`), the 1.4.3 row (`:248`), the story assertions (the blockquote text in `typography-helpers--code-and-citations` and `--print-breaks` at the required colour), the compile tests (`:390-391`), the Sass rules and reused settings (`:525-526`), the missing-include note (`:529`), the Required settings (`:532-537`), D9 (`:439`), and the Out of Scope bullet (`:413`, text below). The blockquote's 1 px side border stays out (1.4.11: the semantics and indented text carry the quotation).
  2. The greys requirement. Its place (the 1.4.3 row and the Sass requirements); its ratios; `#666666` as a grey that meets 4.5:1 on every light container background the specs keep; and that a dark container (a title bar, a tooltip) needs a light grey instead. It must also decide whether a recipe or the `--composition` story shows the requirement, since ADR 0022's dated note asks recipes to show one. It must not add a `@warn` or an `@error` in `nfs-callout`, `nfs-card`, or `nfs-table` (T2 3.1).
  3. The shared-file proposals below, confirmed or amended.

**2. Re-run: Switch spec, out-of-scope survivors.**

- Items: switch-7; the switch-14 wording.
- Output file: `specs/switch.md`.
- Evidence: T2 3.1. `docs/pages/switch.md:67-100` shows the radio switches without a group. The spec's own 1.3.1 row (`specs/switch.md:242`) and docs conventions (`:91`) record that failure. ADR 0039 (`adr/0039-directives-manage-every-foundation-class.md:10`) and P23 give the directive the check. axe 4.13.0 has no radio-group rule.
- It must decide:
  1. The condition. Which radios form a group: those sharing `name` within the same form owner. What names it: a `fieldset` ancestor whose first `legend` has text, or a `role="radiogroup"` or `role="group"` ancestor whose `aria-labelledby` resolves to text or whose `aria-label` is non-empty. It reports once per group, in `afterNextRender`, in development only, and never on the server (P23).
  2. The message, which names the fix: a `fieldset` with a `legend`, as every example writes it.
  3. The browser-level test, and the 1.3.1 row's Enforced-by column.
  4. D16 (`:442`) turned round (the old rejected option becomes the decision), and the Out of Scope bullet (`:410`) removed.
  5. The switch-14 text (below).
  6. The building-blocks Table D proposal (below).

**3. Re-run: Top Bar spec, out-of-scope survivors.**

- Items: top-bar-7.
- Output file: `specs/top-bar.md`.
- Evidence: T2 3.1. `hamburger()` computes its offsets from its own arguments (`scss/util/_mixins.scss:83-143`), and `foundation-menu-icon` only passes colours (`scss/components/_menu-icon.scss:1-9`). Under forced colours the bars disappear and a 24 px outlined box remains (`specs/top-bar.md:263`). The precedents are Switch D12 (`specs/switch.md:438`), Slider rule 13 (`specs/slider.md:346`), and Progress Bar D16 (`specs/progress-bar.md:420`).
- It must decide, measuring first in Chromium and Firefox under `page.emulateMedia({forcedColors: 'active'})` (WebKit has no forced-colours mode):
  1. The rule. Inside `@media (forced-colors: active)`, `.menu-icon` and `.menu-icon.dark` call `hamburger()` with `$color: CanvasText` and `$color-hover: Highlight`, or the system colours the measurement supports. `forced-color-adjust: none` goes on their `::after`, at a specificity that beats Foundation's `.menu-icon.dark::after`.
  2. That the compiled output is unchanged outside forced colours (a node-level compile test), and that D6's 24 by 24 box stays.
  3. The e2e case (`:443`): it asserts bar pixels inside the box, not only non-background pixels on it.
  4. The documented limit: a consumer who restyles `.menu-icon` with other `hamburger()` arguments gets default-size bars under forced colours.
  5. The text. The forced-colours note (`:263`), the consequence (`:548`), the Sass rules (`:562`), a new D-row, and the Out of Scope bullet (`:459`), which is removed. If the measurement fails, `:459` and the last sentence of `:263` take the fallback reason below, naming the measured failure.

### Reason corrections, by spec

One fixer can apply these as quoted replacement text. Each spec's ticket gets one dated line naming this ticket. Line numbers are those at HEAD.

**Abide** (`specs/abide.md:540`), abide-10. Replace the bullet with:

> - Custom `FormValueControl` controls, and cases of the covered kinds (radio groups, checkbox groups with a minimum count, `select`, and `textarea`, whose error pairing and `aria-invalid` this spec states) beyond what the [Prototype: Abide control kinds, value adoption, and the ready gate](../issues/66-prototype-abide-controls-and-ready.md) covered: untested, so not specified.

**Accordion** (`specs/accordion.md`), accordion-3 and accordion-5. Replace `:528` and `:530` with:

> - A Material-style header component, indicator inputs (`hideToggle`, `togglePosition`), `displayMode`, and fixed header heights: Foundation's accordion has none of them; its indicator is Foundation's CSS glyph under the `$accordion-plusminus` setting, and it prints no Variant class (Material comparison).
> - Hash routing (`HashLocationStrategy`) with `deepLink`, and deep links through the Angular Router: under `HashLocationStrategy` the fragment is the route, so `deepLink` cannot share it (development check 3 reports a `#/` hash), and a route that opens a panel is the application's routing.

**Accordion Menu** (`specs/accordion-menu.md`), accordion-menu-7, -9, -10, and -11. Replace `:477` to `:480` with:

> - `parentLink` clones, generated toggles, and any generated DOM: the consumer writes every item, the Hybrid item's toggle included, in markup (building-blocks 1.4; ADR 0001).
> - Home, End, and typeahead keys: APG optional keys that Foundation's AccordionMenu never had, as the [Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md) rules.
> - Arbitrary content in a parent row or a section beyond links, section buttons, and nested lists (mega menus): not a Foundation feature; Foundation's menus nest lists of links, and no docs page puts other content in a submenu.
> - Runtime theming through custom properties (building-blocks 1.13); the slide duration is a Sass mixin parameter.

**Anchored pane** (`specs/anchored-pane.md:107`), anchored-pane-9. Replace "`ignoreMousedisappear`, and the `tap` special event (`jquery-or-dom-plumbing`);" with:

> `ignoreMousedisappear`, and the `tap` special event (`jquery-or-dom-plumbing`: the Light dismiss registry replaces the broadcast and the shared namespace, ADR 0024, and the pointer rule, D10, and the hover-intent helper's Pointer Events replace `tap` and the `mouseleave` wrapper);

**Badge** (`specs/badge.md:299`), badge-4. Replace "and axe's `target-size` and a play function's name query catch a crowded or badly named one; additive later." with:

> axe's `target-size` reports a crowded one on any page axe runs on, and the library's own stories query every name in their play functions; additive later.

**Breakpoint service** (`specs/breakpoint-service.md:110`), breakpoint-service-17. Replace the cell "Dropped from the public API (no consumer; `upTo` covers it)" with:

> Dropped from the public API (no directive or documented use needs the following breakpoint's name; Foundation's own `upTo` is its only caller)

**Button** (`specs/button.md`), button-3 and button-8. Replace `:400` with:

> - `<label>` hosts, the Forms page's file-upload `label.button`: in Foundation's order, the label before its file input, focus lands on the input, which Foundation's `.show-for-sr` clips to 1 px, and no selector in the Browser target can draw an indicator on the earlier label, so the label that looks like a button shows no focus (2.4.7), and the chosen file's name is hidden (D11). An input written before its label (`:focus-visible +`) or inside it (`:focus-within`) could show one, but neither is Foundation's markup, neither is measured, and each would still need a visible file name. The [Spec: Forms](../issues/98-spec-forms.md) offers the native file input in its place; a `label` host is additive in any release (ADR 0045), and for Foundation's own order it waits for `:has()` in the Browser target.

In D11 (`:426`), replace "`<label>` hosts wait for a 2.4.7 fix" with "`<label>` hosts stay out: Foundation's label-first file upload has no focus indicator inside the Browser target". Replace "so it has no visible focus indicator;" with:

> so in Foundation's order it has no visible focus indicator, and the reordered or nested forms that could have one are not Foundation's markup and are unmeasured;

Replace `:523` with:

> - `:has()` (out of target) would let a library rule show a focus indicator on a `label.button` whose file input, written after it as Foundation's docs do, has focus; that is the fix the `<label>` host waits for in Foundation's order (D11).

Replace `:405` with:

> - Material's ripple, progress indicator, icon slots, FAB and icon-button variants: Foundation's button has none of them, and an icon is the consumer's content inside the button.

**Drilldown Menu** (`specs/drilldown-menu.md`), drilldown-menu-6 and -9. Replace `:544` and `:547` with:

> - `parentLink` clones, generated back items, and any generated DOM: the consumer writes every item, back items included, in markup (building-blocks 1.4; ADR 0001).
> - Mega menus and arbitrary content inside levels beyond links, back items, and nested lists: not a Foundation feature; Foundation's menus nest lists of links, and no docs page puts other content in a submenu.

**Dropdown** (`specs/dropdown.md:561`), dropdown-14. Replace with:

> - Runtime theming through custom properties (building-blocks 1.13).

**Dropdown Menu** (`specs/dropdown-menu.md`), dropdown-menu-6, -7, and -8. Replace `:566` and `:567` with:

> - Mega menus and arbitrary content inside submenus beyond links, buttons, and nested lists: not a Foundation feature; Foundation's menus nest lists of links, and no docs page puts other content in a submenu.
> - A close reason on `closed`: Foundation's `hide.zf.dropdownMenu` carries only the closed submenus. A submenu animation Option: Foundation has none (D12). Runtime theming through custom properties (building-blocks 1.13).

**Forms** (`specs/forms.md:427`), forms-6. Replace with:

> - A forced-colours rule for the select arrow: WCAG 2.2 AA has no forced-colours criterion, and the arrow is not the select's only visual, as the Switch's drawing is (the [Spec: Switch](../issues/84-spec-switch.md), D12): the select stays identifiable by its border and text, which take system colours (not measured; see Further Notes).

**Magellan** (`specs/magellan.md:97`), magellan-11. Replace the last cell "Dropped" with:

> Dropped: nothing references it; Foundation used it only as the listener key of `data-resize` and `data-scroll`, which the observers replace, and a generated id differs between server and client (building-blocks 1.11)

**Menu** (`specs/menu.md:405`), menu-7. Replace with:

> - `ol` hosts: no menu on Foundation's docs pages is an `ol`. `role="list"` restoration outside a `nav`: a consumer attribute (D14).

**Nested menu** (`specs/nested-menu.md`), nested-menu-2 and -9. Replace `:633` and `:640` with:

> - Drilldown's wrapper, measurement, back button directive, `closeOnClick`, `animateHeight`, `autoHeight` height, and `scrollTop`: the [Spec: Drilldown Menu](../issues/22-spec-drilldown-menu.md).
> - Mega menus and arbitrary content inside submenus beyond links and nested lists: not a Foundation feature; Foundation's menus nest lists of links, and no docs page puts other content in a submenu.

**Progress Bar** (`specs/progress-bar.md`), progress-bar-4 and -6. Replace `:392` and `:394` with:

> - A directive, a name check, or a Library rule for `<meter>`: it has no class (ADR 0039), and a check-only directive would run only where the consumer already wrote it, so it would reach no one the recipe does not; the meter's name is a stated requirement instead (the 4.1.2 row), because axe's `aria-meter-name` selects only `[role="meter"]` and passes an unnamed native meter.
> - A transition on the meter's width, and any Motion class: Foundation's progress partials declare none, and a transition would show a value the ARIA attributes no longer carry (Animation).

In the 1.1.1 and 4.1.2 row (`:270`), replace "Every progress bar and native progress element has an accessible name" with "Every progress bar, native progress element, and native `<meter>` has an accessible name".

**Responsive Accordion Tabs** (`specs/responsive-accordion-tabs.md:600`), responsive-accordion-tabs-9. Replace with:

> - Completion outputs (`opened`/`closed` after the height transition): the component's state is `selected`, which no animation drives in tabs mode; a consumer who needs them uses the Accordion directly.

**Responsive Embed** (`specs/responsive-embed.md:340`), responsive-embed-8. Replace "; axe's `video-caption` and `no-autoplay-audio` rules and the stories' play functions cover the library's own examples." with:

> ; whether a video needs captions depends on whether it has speech, which no check can read, and axe's `video-caption` never fails a page (without a captions track its `caption` check asks for review, axe-core 4.13.0), so the recipes state the captions requirement, as ADR 0022's dated note asks; axe's `no-autoplay-audio` rule and the stories' play functions cover the library's own examples.

**Responsive Menu** (`specs/responsive-menu.md`), responsive-menu-8, -11, -13, and -14. Replace `:576` and `:579` to `:581` with:

> - A swap animation or a live-region announcement of a swap: Foundation's swap is instant, and a swap changes layout, not content (the Breakpoint service's consumer rule 4); the focus moved to the equivalent control is the announcement.
> - Foundation's no-plugin state below the first rule (D5), `data-mutate` (Dropped options), and any generated DOM (building-blocks 1.4).
> - Mega menus and arbitrary content inside submenus beyond links, back items, and nested lists: not a Foundation feature; Foundation's menus nest lists of links, and no docs page puts other content in a submenu.
> - Runtime theming through custom properties (building-blocks 1.13).

**Reveal** (`specs/reveal.md:580`), reveal-11. Replace with:

> - Closing on Router navigation (`closeOnNavigation`): a Reveal lives in a template and is destroyed with its route, and one in a persistent layout stays open, as in Foundation (Material comparison).

**Tabs** (`specs/tabs.md:754`), tabs-16. Replace "- Up and Down on horizontal strips no longer switch tabs;" with:

> - Up and Down on horizontal strips no longer switch tabs, because the APG's horizontal tab list does not listen for them, so they keep scrolling the page, and the hosted Aria Tabs binds only the orientation's arrows;

**Triggers** (`specs/triggers.md:403`), triggers-9. Replace with:

> - A `type` input, a `preventNavigation` input, keyboard handlers, and outputs: `nfsButton`, `nfsCloseButton`, `nfsMenuIcon`, or the consumer owns `type` (D13); activation is one replayable `click`, native activation already clicks on a key press, and a link that must not navigate is a button (D12); the Openable's `isOpenChange`, `opened`, and `closed` are the events.

**Variant declaration tooling** (`specs/variant-declaration-tooling.md`), variant-declaration-tooling-4, -6, and -7. Replace `:550`, `:552`, and `:553` with:

> - An `ng add` or `nx add` entry for the whole library: additive in any release (ADR 0045), and such an entry would also have to decide the Sass import, the settings overrides, and the `nx` and `@nx/devkit` development dependencies the schematic needs on an Angular CLI workspace, which no spec has designed; the setup generator is the install step. A migration for the Variant declaration file: the next sync or check reports any registry change an upgrade brings (D29). The library's own migrations follow ADR 0045 (Nx migrations in the package's `migrations.json`, reused as `ng update` migrations) and arrive with the first release that needs one, because `nx migrate` and `ng update` read the migrations of the version they move to; a renamed registry interface follows ADR 0045's deprecation rule, because a hand-written file (ADR 0040) keeps the old name.
> - Merging several applications' files into one program: merging adds every application's names and removes every application's removals, and conflicting counts pass unseen under `skipLibCheck: true` (Implementation Decisions; ADR 0040, dated note).
> - Editing CI configuration files: CI configuration is the workspace's own; the docs name the check step (`nx sync:check`, `ng run <app>:nfs-variants:check`), and the tooling writes only files it generated (ADR 0040, dated note).

In D29 (`:590`), replace the rejected option "A migration schematic (the semantic comparison already reports it)" with "A migration schematic for the file (the semantic comparison already reports it; the library's own migrations are ADR 0045's)".

**Folded into the re-runs** (starting text for each):

- Typography Helpers (`specs/typography-helpers.md:413`), typography-helpers-1:

  > - Foundation's base element styles (`h1` to `h6`, `p`, `a`, lists, `blockquote`, `abbr`, `kbd`, and the `code` and `cite` elements' default looks) and their settings other than `$header-small-font-color` and `$blockquote-color`: they style elements by tag, with no class to set, so they get no directive (ADR 0039; the map's base-styles line). Where a colour those rules print fails 1.4.3 on Foundation's defaults, `nfs-typography-base`, the Library mixin of `foundation-typography-base`, checks it: `$header-small-font-color`, which `.h<n> small` also carries, and `$blockquote-color`. Category: `scope-boundary`.

- Callout (`specs/callout.md:325`), callout-7, through the Typography Helpers re-run:

  > - Checks of typography colours inside callouts: headings take the callout's checked text colour (`$header-color: inherit`), and the greys of a heading `small`, a subheader, a `cite`, or a `blockquote` are checked on the page only; on the callout tints the required `#737373` is 3.870:1 to 4.307:1, so such text inside a callout meets the requirement the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md) states for greys on container backgrounds, and `nfs-callout` checks what Foundation's callout markup puts on its backgrounds (D7). The Card, Media Object, and other containers with their own docs pages belong to their own specs.

- Card (`specs/card.md:286`), card-7, through the Typography Helpers re-run:

  > - Checks of typography colours other than the card's own text and link colours: `$header-color` inherits the card's text colour, and the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s Library mixins check `$header-small-font-color` and its other greys on the page only; on the card divider (`$card-divider-background`, `$light-gray`) the required `#737373` is 3.799:1, so a heading `small`, subheader, `cite`, or `blockquote` there meets the requirement that spec states for greys on container backgrounds, and `nfs-card` checks what Foundation's card markup puts on its backgrounds (D8). Category: `scope-boundary`.

- Switch (`specs/switch.md:417`), switch-14:

  > - `.show-for-sr`: the [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md); the library's switch markup needs none, because a visible label replaces Foundation's hidden paddle text, which would repeat the name (D4). `scope-boundary`

- Top Bar (`specs/top-bar.md:459`), top-bar-7, only if the measurement fails:

  > - The bars drawn under forced colours: WCAG 2.2 AA has no forced-colours criterion, and the 24 px outlined box keeps the control findable (D6); calling `hamburger()` with system colours was measured and <the measured failure>.

  The last sentence of `:263` then states the same measured reason in place of "Drawing the bars themselves would mean restating `hamburger()`'s offsets, a copy of Foundation's values, and is not done."

### Shared-file proposals

For the orchestrator. The Typography Helpers and Switch re-runs confirm or amend them.

- `map.md:311` (the base-styles line of Out of scope). After "a spec that relies on a base element style documents it" insert:

  > ; where a colour those rules print fails WCAG 2.2 AA on Foundation's defaults, the Library mixin of the export mixin that prints it checks it (`nfs-typography-base` for `$header-small-font-color` and `$blockquote-color`, [Triage: out-of-scope items across the specs](issues/138-triage-out-of-scope-across-specs.md))

- `building-blocks.md:186`. Replace "and checks-only `nfs-typography-base` does when `$header-small-font-color` is under 4.5:1; the consumer must set all three to `#737373` (4.701:1) on Foundation's defaults, mirrored in the Storybook settings overrides." with:

  > and checks-only `nfs-typography-base` does when `$header-small-font-color` or `$blockquote-color` is under 4.5:1 against `$body-background`; the consumer must set all four to `#737373` (4.701:1) on Foundation's defaults, mirrored in the Storybook settings overrides. The greys are checked on the page only; on a light container background (a card divider, a callout tint, a table stripe) they need 4.5:1 there, which `#666666` gives, a requirement the spec states.

- `building-blocks.md:369` (Table D, Typography Helpers). Replace "(one `@error` over heading `small` contrast)" with "(one `@error` over heading `small` and `blockquote` text contrast)".
- `building-blocks.md:347` (Table D, Switch). In the development checks list, after "the paddle's `for`," insert "a radio switch outside a named group,".
- `storybook-conventions.md:128`. Replace the comment "// Typography Helpers: the heading small-text contrast check" with "// Typography Helpers: the heading small-text and blockquote contrast checks". After `$header-small-font-color: #737373;` (`:250`), add:

  ```scss
    // color-contrast (1.4.3): Foundation's $dark-gray blockquote text is 3.423:1 on the page, and
    // nfs-typography-base stops the compile. Spec: Typography Helpers, typography-helpers--code-and-citations
    // and --print-breaks; also every story with a blockquote.
    $blockquote-color: #737373;
  ```

### Routed

- Orbit's bullets under forced colours (no evidence row; unmeasured) go to [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md). It measures them under Chromium's and Firefox's forced-colours emulation. If they disappear, it gives `nfs-orbit` the Switch's system-colour treatment as a dated amendment, or proposes a re-run (T2 section 6).
- The three `hidden`-attribute notes (thumbnail-7, float-classes-4, flexbox-utilities-6) should point at each other and at the Toggler's `.is-hidden`. That is a wording check for the same review.
- Evidence corrections, and the claims that are still unmeasured: T2 sections 7 and 8.

### Gist for Decisions so far

(Paths relative to the effort root.)

- [Triage: out-of-scope items across the specs](issues/138-triage-out-of-scope-across-specs.md) -- a second triage of all 718 out-of-scope rows (417 new since [Triage the out-of-scope Foundation components and variants](issues/79-triage-out-of-scope-components-and-variants.md)), by an API, a scope, and an accessibility lens and a judge. 7 rows come in as 4 items in 3 re-runs. Checks-only `nfs-typography-base` also stops the compile on `$blockquote-color` (3.423:1 on the page; required `#737373`): base element styles keep no directive, but a failing colour they print is checked by the Library mixin of the export mixin that prints it (new map line). The Typography Helpers spec states that its greys, checked on the page only, need 4.5:1 on tinted containers (`#737373` is 3.799:1 on a card divider; `#666666` holds). The Switch gains a development check for radio switches outside a named group, because ADR 0039 gives the directive the check its documented markup lacks and axe has none. The Top Bar draws the menu icon's bars under forced colours with Foundation's own `hamburger()`, if measured. The File Upload Button's `label` host and an `ng add` entry stay out with corrected reasons: Foundation's label-first order has no in-target fix, and `nx migrate` and `ng update` read the migrations of the version they move to. 38 holds get corrected reasons. Nothing OPEN FOR HUMAN; no ADR. Findings: [research/out-of-scope-triage-2.md](research/out-of-scope-triage-2.md).
