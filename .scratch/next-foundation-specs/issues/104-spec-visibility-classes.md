# 104. Spec: Visibility Classes

Type: grilling
Status: resolved
Blocked by: 81
Labels: wayfinder:grilling
Map: ../map.md

## Question

What Angular directives (preferred) or components give Foundation for Sites 6.9's Visibility Classes to the next, from-scratch ngx-foundation-sites repo, under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Foundation's docs page is `docs/pages/visibility.md` and its Sass is `scss/components/_visibility.scss` in the 6.9.0 clone. Publish `specs/visibility-classes.md`.

Known from the triage: Must stay CSS-first so server HTML is correct at every breakpoint (no JavaScript decides visibility); how these directives relate to the Visibility classes plugin directives already bind (building-blocks) and to `.show-for-sr` and `.show-on-focus`.

## How to work it

Run `/grill-with-docs` (self-grilling, both sides) over the questions this component raises, then publish with `/to-spec` in the map's spec shape; the [Spec: Button](37-spec-button.md) is the nearest precedent. Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this component); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Cover: one directive per Structural class and what else each owns (the ARIA, `type` default, or development and compile-time checks the documented markup lacks for WCAG 2.2 AA, ADR 0022); every Variant as a typed input by the decision above; State classes as host bindings; the Sass mixin only where custom CSS or checks are needed (ADR 0012); the rendering-mode contract; stories with play functions and axe; e2e only where Storybook cannot reach. Record the decisions in this ticket's Answer, and propose shared-file changes (a building-blocks row, glossary terms) for the orchestrator. Model: Opus 5.5.

## Answer

Model: Opus 5.5 (AFK: the agent played both sides of the interview; map Notes, AFK override).

Spec: [specs/visibility-classes.md](../specs/visibility-classes.md).

### Measurements made for this ticket

Several questions needed facts the bundle did not have, so the ticket measured them in a throwaway workspace (`D:/tmp/nfs-wave-104/`, not committed; no server, no port, no junction; packages read from the existing `D:/tmp/nfs-ct-prototype` install). Foundation 6.9.0 Sass from the local clone with default settings, compiled with Dart Sass 1.104.1 (`foundation-global-styles`, typography, button, menu, sticky, and visibility classes); Playwright 1.63 in Chromium 153, Firefox 155, and WebKit 26.6, plus the installed Edge 153 (`channel: 'msedge'`) where named; axe-core 4.13.0 with the six WCAG 2.2 AA tags; Chromium's CDP accessibility tree.

- E1, computed display (`display.mjs`), four engines, identical results: every breakpoint class at 320 by 640, 600 by 320, 700 by 1000, 900 by 600, 1100 by 800, and 1300 by 800, in light and dark (`emulateMedia`), in print at 1100, and under forced colours at 1100. The breakpoint classes behave as Foundation documents; in print every `show-for-<bp>` and `-only` element shows and `hide-for-small-only`, `hide-for-medium`, `-medium-only`, `hide-for-large`, and `-large-only` hide; forced colours change nothing. `.visible` inside `.invisible` is visible. The orientation classes and `.show-for-dark-mode` force `display: block` where they show (a `span`, and a flex `ul.menu`, become `block`), and `.hide-for-dark-mode` forces `block` in light mode (a `ul.menu` loses its flex row). Combinations: `show-for-medium show-for-landscape`, `show-for-medium hide-for-portrait`, `hide-for-medium show-for-portrait`, and `show-for-medium show-for-dark-mode` all show where the breakpoint class should hide; `show-for-medium hide-for-dark-mode`, `hide-for-medium hide-for-dark-mode`, and `show-for-sticky hide-for-medium` inside a stuck element combine correctly. `.show-for-sticky` on the `.sticky.is-stuck` element itself is `none`. `.show-for-ie` is `none` and `.hide-for-ie` has no effect everywhere; `matchMedia('(-ms-high-contrast: none)')` and `('(-ms-high-contrast: active)')` are `false` in every engine, Edge included, with and without forced colours.
- E2, accessibility and axe (`sr.mjs`): Foundation's docs markup verbatim passes axe (only `page-has-heading-one`, a property of the test page); the recipes page, with a `.show-for-sr` file input under a `label.button` and `.show-on-focus` on a wrapper `p`, passes axe with nothing reported. Chromium's tree holds the `.show-for-sr` text, the visually hidden skip link "Skip to Content", a button named "Close" by a hidden span, and a `status` region with "3 results"; it holds no text of the `.hide`, `.invisible`, `aria-hidden`, and (at 400 px) `.show-for-medium` paragraphs. Foundation's `tabindex="0"` `main` is the second tab stop after the skip link in Chromium and Firefox. WebKit's Tab skips links (it went from the page start to `main`).
- E3, focus painting (`focus.mjs`, `wrap.mjs`), three engines: the focused skip link with the class on itself is 109.4 by 17 px and paints (1041 to 1152 non-white pixels in a 300 by 100 page); with the class on the wrapper `p`, the focused link paints nothing (0 pixels) and hit-testing at its centre does not reach it; a focused `.show-for-sr` file input is a 1 by 1 px box.
- E4, skip link (`skip.mjs`): with the skip link focused and a menu of links below, axe passes (no `target-size` report) in the docs form and the recipe form. Native Enter: with `tabindex="0"` on `main`, focus moves to `main` in three engines; without a `tabindex` focus stays on `body` and the next Tab reaches the first link in `main` in Chromium and Firefox.
- E5 (`combos2.mjs`), four engines: `.hide` with `.show-for-landscape` shows in landscape, with `.show-for-portrait` in portrait, with `.show-for-dark-mode` in dark mode; `.hide` with `.hide-for-dark-mode` and with `.show-for-sticky` inside a stuck element stays hidden. A skip link to a `tabindex="-1"` `main` moves focus to `main` on Enter natively, in all four.
- Read, not measured: Angular's styling resolution consults a binding's value unless it is `undefined` (`isStylingValuePresent`, `packages/core/src/render3/instructions/styling.ts:1009-1015` in the 22.2.x clone), so a `false` in a higher-priority class binding beats a `true` in a lower one; CDK's `InteractivityChecker.isTabbable` assumes `isFocusable` was checked first, and `isFocusable` does not see `inert` or a disabled `fieldset` (`src/cdk/a11y/interactivity-checker/interactivity-checker.ts:40-44`, `:60-65`, `:144-152`); CDK's visually hidden rule is `.cdk-visually-hidden` from `a11y-visually-hidden` (`src/cdk/a11y/_index.scss:1-40`); Foundation's `show-for()` query is `screen` only because it passes a number to `breakpoint()`, while `hide-for()` adds `print` up to `$print-breakpoint` (`scss/util/_breakpoint.scss:152-190`, `scss/components/_visibility.scss:7-61`).

### Grilling record

Round 1 (nothing settled yet).

- Q1, which classes, and which are in scope. Read from `_visibility.scss`: breakpoint `show-for` and `hide-for` with `-only` over `$breakpoint-classes` (no Zero-breakpoint `show-for`/`hide-for`), `.hide`, `.invisible`, `.visible`, `.show-for-sr`, `.show-on-focus`, four orientation classes, two dark-mode, two IE, two sticky. The IE pair matches no browser (E1). Settled: every class but the IE pair gets a directive or an input; the IE pair is dropped with a reported copy (decisions 1, 6).
- Q2, how many directives and their names. For one directive per class template with the query as selector input (`nfsShowFor="medium"`): one attribute like Foundation's one class. Against: building-blocks 1.4 already names the inputs (`showFor="large only"`), the Off-canvas and Breakpoint service specs already wrote `nfsVisibility showFor`/`hideFor`, a combination check needs both values in one place, and it adds five public classes. For folding `.show-for-sr` and `.show-on-focus` into `nfsVisibility`: one import. Against: a different contract (seen by assistive technology), checks of their own, and twelve specs already write `nfsShowForSr`. Settled: `nfsVisibility`, `nfsShowForSr`, `nfsShowOnFocus` in `ngx-foundation-sites/visibility` (decision 1).
- Q3, relation to the Plugin directives that already bind Visibility classes. The Responsive Toggle binds `hide-for-<bp>`/`show-for-<bp>` from records over the Breakpoint map, driven by its open `hideFor` Option with its own CSS outside `$breakpoint-classes`; the Nested menu binds `invisible` on Drilldown levels. Hosting `NfsVisibility` there would expose `showFor`/`hideFor` on those elements and cannot type the open Option; two owners of one class resolve by binding priority (read). The Responsive Toggle's Option is also named `hideFor`, so one attribute would reach both directives. Settled: those directives keep their bindings, never host these, and `nfsVisibility` stays off their elements, checked in development (decision 7). The Responsive Toggle re-run's question (whether this spec emits classes outside `$breakpoint-classes` so `hideFor` could close) is answered no.
- Q4, JavaScript or CSS. The ticket's constraint and building-blocks 1.7 and 1.11 decision 8: the media queries make server HTML right at every width. Settled: no JavaScript decides, nothing reads the viewport (decision 12).

Round 2 (Q1 to Q4 settled).

- Q5, input types. ADR 0040: an on or off responsive family takes `NfsClassBreakpointQuery<M>` with the modifiers Foundation generates. Foundation generates up and `only`, never `down`. For `down` mapped to the next breakpoint's `hide-for`: it reads naturally. Against: a second spelling, and for the last Class breakpoint it has no class, which the type cannot know. Settled: `M = 'up' | 'only'` (decision 2).
- Q6, the Zero breakpoint. Foundation's docs send "always hidden" to `.hide`, and ADR 0040 fills Zero-breakpoint gaps by meaning (`expanded="small"` sets `.expanded`). For a separate `hide` boolean: explicit. Against: rule 5 folds the unconditional form into the family's input, as `expanded` does. Settled: `hideFor` alone, `true`, or `'small'` sets `.hide`; `showFor="small"` sets none (decision 3).
- Q7, the conditions. For separate inputs (`orientation`, `colorScheme`): typed per dimension. Against: `orientation` collides with the Menu's and Tabs' input on a shared element (Angular sets a static attribute on every directive declaring the input), and Foundation's words are `show-for-landscape`, `show-for-dark-mode`, `show-for-sticky`. Measured (E1, E5): orientation and `show-for-dark-mode` override a breakpoint class or `.hide`, so a second value on the same element fails silently. Settled: conditions are values of `showFor`/`hideFor`, one value per input, with a combination warning and a sticky placement warning (decisions 4, 10).
- Q8, `.invisible` and `.visible`. For one enum `visibility`: no invalid pair. Against: rule 3 needs one Sass setting or loop, the input would repeat the directive's name, and the two sit on different elements in every meaningful use. Settled: two booleans, with a warning for both (decision 5).
- Q9, list or record binding. A record strips copies but writes `false` for every family class, which would beat or lose to the Responsive Toggle's and the Nested menu's records (read). Settled: a list of the selected classes, copies reported, not stripped, as the Label and Badge do (decision 8).

Round 3 (Q5 to Q9 settled).

- Q10, the screen-reader classes' checks. Measured (E2, E3): a focusable `.show-for-sr` element is a 1 by 1 px focus target and `.show-on-focus` on a wrapper never paints; axe reports neither. Settled: development checks through CDK's `InteractivityChecker` (`isFocusable`, then `isTabbable`), dropped from production builds (decisions 9, 17).
- Q11, the second-owner check. Settled: at first render, a listed class missing from the host, or a Visibility class present that neither the directive nor the static attribute put there, warns (decision 10).
- Q12, the Runtime check. The Breakpoint service spec's rule: a directive whose property is read only for a value that may stay unbound, and whose own mixin holds nothing it needs, requests the include only while bound (Off-canvas, Top Bar). Settled (decision 11).
- Q13, a Library mixin. Foundation covers every class; the forced `display: block` is layout, not an accessibility failure, and a block wrapper avoids it; the property is `nfs-breakpoint-properties`'s (ADR 0012's dated note, building-blocks 1.13). Settled: no mixin, no CSS; documented (decision 13).
- Q14, the skip link. ADR 0038 (bare `#` leaves the page under `<base href>`), the Smooth Scroll spec's live current path and focus move; measured (E2, E4, E5): `tabindex="0"` adds a tab stop, `tabindex="-1"` gives the native focus move without one, axe passes the revealed link. Settled: `nfsShowOnFocus` beside `nfsSmoothScroll`, current-path `href`, `main` with `tabindex="-1"` and no `role` (decision 15).
- Q15, "hide for screen readers". Foundation has no class and advises `aria-hidden="true"`; building-blocks 1.10 leaves `aria-hidden` for masking visuals. Settled: no directive (decision 16).
- Q16, the content rules. Hidden content is hidden from everyone (E2), so a lone hidden element is lost at 320 px (1.4.10) or in one orientation (1.3.4); the Switch spec found hidden text replacing a label (3.3.2); 2.5.3 wants the visible text first. The directives cannot read meaning. Settled: requirements, shown and asserted by every story (decision 14).

Round 4 (Q10 to Q16 settled).

- Q17, the test split. Layer 1 runs at 414 px, so play functions assert classes and properties that hold at any viewport (a pair has exactly one displayed); the sweeps are e2e; WebKit's Tab path needs `focus()` (E2). Settled (decision 18).
- Q18, vocabulary. The specs say "screen-reader-only directive", "Visibility Classes directive", and "visually hidden text"; the glossary's Visibility class names only the breakpoint classes. Settled: widen it and add Visually hidden and Skip link (decision 19).
- Q19, the placeholders. `nfsShowForSr` keeps its name; `nfsVisibility` with `showFor`/`hideFor` keeps the Off-canvas and Breakpoint service spellings. No usage needs what the API lacks (below). Settled.

The frontier is empty.

### Decisions

1. Three listener-free attribute directives in `ngx-foundation-sites/visibility`: `[nfsVisibility]` (`NfsVisibility`, `exportAs: 'nfsVisibility'`), `[nfsShowForSr]` (`NfsShowForSr`, static `.show-for-sr`), `[nfsShowOnFocus]` (`NfsShowOnFocus`, static `.show-on-focus`) (D1).
2. `showFor` and `hideFor` Variant inputs take `NfsClassBreakpointQuery<'up' | 'only'>` over `NfsBreakpointClassesOverrides`, with aliases `NfsVisibilityShowFor` and `NfsVisibilityHideFor`; no `down`; the property read is `--nfs-breakpoint-classes` (D2).
3. Zero-breakpoint gaps: `showFor` at the Zero breakpoint's up form sets no class; `hideFor` alone, `true`, or at the Zero breakpoint's up form sets `.hide`; the Zero breakpoint from `nfsBreakpointsToken` (D3).
4. The conditions `'landscape'`, `'portrait'`, `'dark-mode'`, `'sticky'` are values of the same inputs, one value per input (D4).
5. `invisible` and `visible` are booleans through `nfsVariantBoolean` (D5).
6. `.show-for-ie` and `.hide-for-ie` are dropped (`platform-or-a11y`), a copy reported (D6).
7. The Responsive Toggle's and the Nested menu's Visibility classes stay theirs; nothing hosts these directives; `nfsVisibility` is never on their elements (D7).
8. One `computed` class list, never a `false` record; copied Visibility classes reported, not stripped (D8).
9. `nfsShowForSr` warns on a tabbable host or descendant; `nfsShowOnFocus` warns on a host Tab never reaches, naming its tabbable descendant (D9).
10. `NfsVisibility`'s five development checks: copied classes (with the IE and screen-reader redirects), combinations Foundation's CSS cannot give, sticky placement, a second owner, `invisible` with `visible` (D10).
11. Runtime check: `include('nfs-breakpoint-properties', ['breakpoint-classes'])` only while a Breakpoint query is bound, `value()` per bound value; no Variant property of its own (D11).
12. CSS first: nothing reads the viewport (D12).
13. No Library mixin and no library CSS; the forced `display: block` of the orientation and dark-mode classes documented (D13).
14. Content rules as requirements: alternatives only (1.4.10, 1.3.4), visually hidden text after visible text (2.5.3), visible form labels (3.3.2) (D14).
15. The skip link: `nfsShowOnFocus nfsSmoothScroll` with the live current-path `href`, `main` with `tabindex="-1"`, no `role="main"` (D15).
16. No `hide-for-sr` directive; `aria-hidden="true"` is native (D16).
17. Native implementation level; CDK only for the development `InteractivityChecker` (D17).
18. Seven stories, the e2e sweeps and skip-link path, the fixture app's first paint, hydration, and deep-route skip link, and a manual screen-reader release test (D18).
19. Glossary: Visibility class widened; Visually hidden and Skip link added (D19).

### Triage

Rule: [map](../map.md), Orchestration rules, "Triage of human-only items".

| Item | Impact | Confidence | Outcome and evidence |
| --- | --- | --- | --- |
| Directive names, entry point, input names, types, and aliases (decisions 1 to 5) | HIGH (public API; twelve specs import `NfsShowForSr`, two write `nfsVisibility`) | HIGH (ADR 0039, ADR 0040, building-blocks 1.3 and 1.4 applied as written, including its own `showFor="large only"` example; the existing placeholders kept; measured combinations) | Decided |
| Dropping the IE classes (decision 6) | LOW (a class that changes nothing) | HIGH (E1 in four engines, forced colours included) | Decided |
| Plugin-owned classes, list binding, second-owner check (decisions 7, 8, 10) | MEDIUM (a composition rule; a check is development only) | HIGH (the Responsive Toggle and Nested menu specs; Angular's styling source read) | Decided |
| The screen-reader checks (decision 9) | LOW (development only) | HIGH (E2, E3 in three engines; axe measured silent) | Decided |
| No Library mixin, the forced block documented (decision 13) | LOW (additive later) | HIGH (E1; ADR 0012's dated note; the Menu and Top Bar precedent for `--nfs-breakpoint-classes`) | Decided |
| The skip link recipe and the content rules (decisions 14, 15) | MEDIUM (docs and recipes, no API) | HIGH (E2, E4, E5; ADR 0038; the Smooth Scroll spec's recipe) | Decided |
| Rendering modes, tests, vocabulary (decisions 12, 17 to 19) | LOW or MEDIUM | HIGH | Decided |

Nothing is OPEN FOR HUMAN, and no prototype is needed: the questions that needed measurement were measured here. The screen-reader announcements are a manual release test, as ADR 0022's dated consequence has it. Dissent recorded: a directive per class template with a selector input (`nfsShowFor`), against decision 1; one `visibility` enum, against decision 5; a `down` modifier, against decision 2; a stripping record, against decision 8; a library rule removing the forced `display: block`, against decision 13.

No new ADR: the names follow ADR 0039, ADR 0040, and building-blocks 1.3 and 1.4 mechanically, and the rest is reversible without a consumer API change, so none meets the "surprising without context" and "hard to reverse" tests together.

### Placeholders in published specs

| Placeholder | Specs that use it | Final name | Needs the API does not meet |
| --- | --- | --- | --- |
| `nfsShowForSr` | abide, badge, button, button-group, drilldown-menu, dropdown, label, orbit, pagination, responsive-menu, responsive-toggle, top-bar | `nfsShowForSr`, unchanged: `NfsShowForSr` from `ngx-foundation-sites/visibility` | None. Every use is text inside a control or a live region (Abide's Form alert, which `hidden` still hides because `element-invisible()` sets no `display`); the Drilldown re-run's need (the text stays in the accessibility tree, no `aria-hidden`, no `hidden`) holds |
| `nfsVisibility hideFor` | off-canvas | `nfsVisibility hideFor="large"`, unchanged: `NfsVisibility` from `ngx-foundation-sites/visibility` | None; `nfsButton` and a Trigger on the same element keep their classes and ARIA |
| `nfsVisibility showFor` | breakpoint-service | `nfsVisibility showFor="large"`, unchanged | None |
| "the screen-reader-only directive" (unnamed) | menu, top-bar, breadcrumbs | `nfsShowForSr` | None |
| "the Visibility Classes spec's directives" (unnamed) | magellan, menu, off-canvas | `nfsVisibility` with `showFor` and `hideFor` | None |
| `nfsShowForSr`, and "the Visibility Classes directives" (unnamed), in specs of this wave that appeared while this ticket ran | prototyping-utilities (Rendered HTML note and a Switch example), xy-grid (composition and Out of Scope) | `nfsShowForSr`; `nfsVisibility` beside `nfsGridX` and `nfsCell` | None for the names. The Prototyping Utilities' Component Styling example names a switch only with `nfsShowForSr` text inside `nfsSwitchPaddle`, which the [Spec: Switch](84-spec-switch.md)'s development check 2 reports (3.3.2: a switch needs a visible label); for its ticket or the consistency review |

### Proposed shared-file changes

1. `building-blocks.md`, Table D, the Visibility Classes row: fill the empty cells.

   "| Visibility Classes | `docs/pages/visibility.md` | [Spec: Visibility Classes](issues/104-spec-visibility-classes.md) | `[nfsVisibility]` (`NfsVisibility`: Variant inputs `showFor` and `hideFor`, each a Breakpoint query over Class breakpoints with `up` or `only` (`NfsClassBreakpointQuery<'up' \| 'only'>`) or a condition (`'landscape' \| 'portrait' \| 'dark-mode' \| 'sticky'`), `hideFor` alone or at the Zero breakpoint setting `.hide`; booleans `invisible` and `visible`); `[nfsShowForSr]` (`.show-for-sr`); `[nfsShowOnFocus]` (`.show-on-focus`), the skip link beside `nfsSmoothScroll`; `.show-for-ie` and `.hide-for-ie` dropped | Directives: Utility classes on consumer-written elements, and Foundation generates nothing ([ADR 0039](adr/0039-directives-manage-every-foundation-class.md)); the Plugin directives that own a Visibility class (the Responsive Toggle's bar and menu, the Nested menu's `invisible`) keep binding it and never host these | Native platform (Foundation's media queries, `visibility`, the visually hidden technique, a native in-page link); Aria has no such pattern, and CDK adds only the development `InteractivityChecker` | One `computed` class list (copies reported, not stripped) and two static host classes; `nfsBreakpointsToken` for the Zero breakpoint; development checks in render callbacks (copied classes, combinations Foundation's CSS cannot give, sticky placement, a second owner, visually hidden focus, a `show-on-focus` host Tab never reaches); the `strictVariantNames` and `strictVariantProperties` Runtime checks over `--nfs-breakpoint-classes`; no Library mixin | None; the skip link is WCAG technique G1 and visually hidden text technique C7 |"

2. `building-blocks.md` 1.10, a new bullet after the Progress Bar bullet (or after the Label bullet, if the [Spec: Label](94-spec-label.md) ticket's proposal 2 has landed):

   "- Visibility Classes ([Spec: Visibility Classes](issues/104-spec-visibility-classes.md)): content hidden by `nfsVisibility` is hidden from assistive technology too, so `showFor` and `hideFor` hide only a presentation another element also carries (1.4.10 at 320 CSS px; 1.3.4 for the orientation conditions), a requirement every story asserts. Visually hidden text (`nfsShowForSr`) never holds a tab stop, which it reports in development (measured in three engines: a focused `.show-for-sr` element is a 1 by 1 px box, 2.4.7, and axe reports nothing), follows a control's visible text (2.5.3), and never replaces a form field's visible label (3.3.2). `nfsShowOnFocus` sits on the focused element itself, which it reports in development (measured: on a wrapper it paints nothing while its link has focus). The skip link is `nfsShowOnFocus` beside `nfsSmoothScroll` with the live current-path `href` and a `main` with `tabindex="-1"` (2.4.1, 2.4.3)."

3. `building-blocks.md` 1.7, the "CSS first" bullet: after its first sentence, "... and no breakpoint logic in JavaScript.", insert:

   "Content the consumer shows or hides carries `nfsVisibility` with `showFor` or `hideFor` ([Spec: Visibility Classes](issues/104-spec-visibility-classes.md)); a Plugin directive that owns a Visibility class for its own behaviour (the Responsive Toggle's bar and menu) binds it itself, and `nfsVisibility` never shares its element."

4. `CONTEXT.md`, Foundation side: replace the **Visibility class** entry with the first block, and add the next two after it (Visually hidden is a property of an element, so it follows the class term):

   ```markdown
   **Visibility class**:
   A Foundation CSS class of the Visibility Classes family that hides an element always (`.hide`, `.invisible`) or under a condition: a breakpoint range of the Breakpoint map (`.show-for-medium`, `.hide-for-large-only`, generated only for Class breakpoints), an orientation, the dark colour scheme, or a stuck Sticky element; `.show-for-sr` and `.show-on-focus` hide an element only from sight. Distinct from a State class, which expresses runtime state.
   _Avoid_: responsive class, breakpoint class, visibility helper

   **Visually hidden**:
   Hidden from sight but kept in the accessibility tree, as Foundation's `.show-for-sr` does; distinct from hidden (`display: none`, `hidden`, `.hide`), which hides from everyone, and from `aria-hidden`, which hides from assistive technology only.
   _Avoid_: screen-reader-only, sr-only, invisible (Foundation's `visibility: hidden`)

   **Skip link**:
   A link at the start of a page, Visually hidden until it has focus, that moves focus past repeated blocks to the main content; Foundation's `.show-on-focus` link.
   _Avoid_: skip-to-content button, bypass link, jump link
   ```

5. `README.md`, the Plugins table, after the Forms row (or after the last CSS-only row that has landed):

   "| Visibility Classes (utility family) | [specs/visibility-classes.md](specs/visibility-classes.md) | Native platform (Foundation's media queries, `visibility`, the visually hidden technique); three listener-free directives | No inventory: Foundation's visibility docs and Sass, with the [out-of-scope triage](research/out-of-scope-triage.md) (section 4) | None needed; every class by viewport, orientation, colour scheme, print, and forced colours, the class combinations, the sticky placement, visually hidden focus, the skip link, and the IE queries measured in [Spec: Visibility Classes](issues/104-spec-visibility-classes.md) |"

6. `storybook-conventions.md`, section 8, the demo-scaffolding bullet: after "... and [Consistency review: the class-rule wave](issues/133-consistency-review-class-rule-wave.md) rewrites this list.", insert: "The Visibility classes' directives are `nfsVisibility` (`showFor`, `hideFor`, `invisible`, `visible`), `nfsShowForSr`, and `nfsShowOnFocus` ([Spec: Visibility Classes](issues/104-spec-visibility-classes.md)); scaffolding uses them in place of `.show-for-sr` and `.hide-for-*`."

7. The placeholder texts, one change per spec (the table above). The replacement sentence wherever a spec says the placeholder "stands for" the directive, is "written ... until that spec names it", is "a placeholder", or that "its import is left out until that spec names it":

   "`nfsShowForSr` is the [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md)'s directive for `.show-for-sr`, imported as `NfsShowForSr` from `ngx-foundation-sites/visibility`."

   - `specs/abide.md`: Foundation contract note (":113", the parenthesis "(written `nfsShowForSr` until the `[Spec: Visibility Classes](...)` names it)") becomes "(`nfsShowForSr`)"; the usage example's lead-in (":703", "(`nfsShowForSr` stands for the `[Spec: Visibility Classes](...)` directive until it names it)") becomes "(`nfsShowForSr`, from `ngx-foundation-sites/visibility`)".
   - `specs/badge.md`: the ARIA row (":77", "written `nfsShowForSr` until that spec names it") becomes "`nfsShowForSr`"; the Rendered HTML note (":195") takes the replacement sentence in place of its `nfsShowForSr` sentence.
   - `specs/button.md` (":317"), `specs/button-group.md` (":297", ":396"), `specs/dropdown.md` (":602"), `specs/label.md` (":204"), `specs/orbit.md` (":350", ":612"), `specs/responsive-menu.md` (":618"), `specs/top-bar.md` (":374"), `specs/drilldown-menu.md` (":241", and the code comment at ":615", which becomes `// NfsShowForSr comes from ngx-foundation-sites/visibility`): the replacement sentence in place of the placeholder sentence; each usage example's `imports` gains `NfsShowForSr`.
   - Class mapping rows that say "written `nfsShowForSr` until ... names it": `specs/orbit.md` (":133", ":564" D26), `specs/drilldown-menu.md` (":125", ":541", ":584" D29), `specs/responsive-menu.md` (":129"), `specs/responsive-toggle.md` (":238"), `specs/pagination.md` (":99", "(`nfsShowForSr` until that spec names it)"): drop the qualifier, keeping `nfsShowForSr`; `specs/drilldown-menu.md` (":356", "(`nfsShowForSr`, a placeholder)") and `specs/responsive-menu.md` (":372", "(`nfsShowForSr` stands for ... until that spec names it)") become "(`nfsShowForSr`)".
   - `specs/off-canvas.md`: ":507", "uses the Visibility Classes directive (that spec fixes its name)" becomes "uses `nfsVisibility hideFor` from the [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md)"; ":671", "(the Trigger hidden at large by the Visibility Classes directive, written here as `nfsVisibility hideFor`, whose names that spec fixes)" becomes "(the Trigger hidden at large by `nfsVisibility hideFor="large"`, from `ngx-foundation-sites/visibility`)"; ":290" and ":578" may name `nfsVisibility`.
   - `specs/breakpoint-service.md`: ":703", "(the selector is illustrative; the `[Spec: Visibility Classes](...)` names it, and building-blocks 1.4 gives the input)" becomes "(`nfsVisibility` of the [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md))"; ":272", "the Visibility Classes directives" becomes "`NfsVisibility`".
   - `specs/magellan.md` (":620"): "the Visibility Classes spec's directives set those Visibility classes, so the example writes neither (`[Spec: Visibility Classes](...)` names them)" becomes "`nfsVisibility` sets those Visibility classes: `hideFor="large"` on the select's form and `showFor="large"` on the navigation ([Spec: Visibility Classes](../issues/104-spec-visibility-classes.md))".
   - `specs/menu.md` (":221", ":532"), `specs/top-bar.md` (":236"), and `specs/breadcrumbs.md` (":97"): "the screen-reader-only directive" becomes "`nfsShowForSr`", and ":532" "the directives of the [Spec: Visibility Classes]" becomes "`nfsVisibility` of the [Spec: Visibility Classes]".

8. [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md), the Variant manifest: the `NfsBreakpointClassesOverrides` entry gains two `uses` entries, `{entryPoint: 'ngx-foundation-sites/visibility', directive: 'NfsVisibility', input: 'showFor', alias: 'NfsVisibilityShowFor', shape: 'query'}` and `{entryPoint: 'ngx-foundation-sites/visibility', directive: 'NfsVisibility', input: 'hideFor', alias: 'NfsVisibilityHideFor', shape: 'query'}`; the typings check covers both aliases.

9. `map.md`, Decisions so far: the gist at the end of this Answer.

### What other specs need from this one

- The twelve specs with `nfsShowForSr`, and the Off-canvas and Breakpoint service specs with `nfsVisibility`: the names are final and unchanged (proposal 7).
- [Re-run: Responsive Toggle spec under the class rule](116-rerun-responsive-toggle-class-rule.md) (resolved): its question is answered. `nfsVisibility` on the bar or the menu is reported by development check 4, because the Responsive Toggle's class records and `hideFor` Option would meet it on one element (the Option name is shared too); this spec emits no Visibility classes outside `$breakpoint-classes` and writes no property, so `nfs-responsive-toggle(<bp>)` and the open `hideFor` stay.
- [Spec: Drilldown Menu](22-spec-drilldown-menu.md) and [Spec: Nested menu (shared utility)](56-spec-nested-menu.md): `invisible` on hidden levels stays the Nested menu's State class; `visible` from `nfsVisibility` on a Drilldown element would override it, which this spec's notes rule out.
- [Spec: Forms](98-spec-forms.md): its D12 rejection of the label-as-button file upload is backed by `nfsShowForSr`'s focus check, which warns on that recipe (E3).
- [Spec: Sticky](28-spec-sticky.md): the sticky conditions read the `.sticky` class `nfsSticky` binds and its `.is-stuck` State class; nothing changes there.
- [Spec: Smooth Scroll](29-spec-smooth-scroll.md): the skip link composes it; its 2.4.1 row's recipe is this spec's D15.
- [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md): proposal 8.
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): check that no spec writes a Visibility class outside rendered output and copied-class cases; that `nfsShowForSr` and `nfsVisibility` carry no placeholder qualifier; that no spec puts `nfsVisibility` on an element of the Responsive Toggle or a Drilldown level; and, with the other utility-family specs of this wave, whether their directive names follow one rule (a family's shared directive named after its docs page, a single-class directive after its class, as this spec does).
- [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md): every Out of Scope item and rejected alternative in the spec carries a category.

### Gist for Decisions so far

- [Spec: Visibility Classes](issues/104-spec-visibility-classes.md) -- three listener-free directives in `ngx-foundation-sites/visibility`: `nfsVisibility` with `showFor` and `hideFor` (a Breakpoint query over Class breakpoints with `up` or `only`, or `'landscape'`, `'portrait'`, `'dark-mode'`, `'sticky'`; `hideFor` alone or at the Zero breakpoint sets `.hide`; no `down`) and `invisible` and `visible` booleans, bound as one class list so Foundation's media queries decide from the first byte; `nfsShowForSr` and `nfsShowOnFocus` for `.show-for-sr` and `.show-on-focus`, the skip link beside `nfsSmoothScroll` with the live current-path `href` and a `tabindex="-1"` `main`; measured in three engines and Edge: the orientation and `show-for-dark-mode` classes force `display: block` and override a breakpoint class or `.hide`, `.show-for-sticky` never shows on the Sticky element itself, a focused `.show-for-sr` element is a 1 by 1 px box and `.show-on-focus` on a wrapper paints nothing, and axe reports neither, so development checks do; `.show-for-ie` and `.hide-for-ie` match no browser and are dropped; the Responsive Toggle and Nested menu keep their own Visibility classes, and `nfsVisibility` stays off their elements; no library CSS; `nfsShowForSr` and `nfsVisibility` keep their placeholder names; impact HIGH, confidence HIGH; no ADR. Spec: [specs/visibility-classes.md](specs/visibility-classes.md).

### Amendment, 2026-09-28 (print classes)

By [Re-run: Visibility Classes spec for the print classes](143-rerun-visibility-classes-print.md), which holds the measurements, the grilling record, the triage, and the proposed shared-file changes. The [Spec: Typography Helpers](106-spec-typography-helpers.md) found `.show-for-print` and `.hide-for-print` (printed by `foundation-print-styles` inside `foundation-typography`, documented on the Typography Base page) without an owner; this spec now owns them. [specs/visibility-classes.md](../specs/visibility-classes.md) is revised in place.

What changed, against the decisions above:

- Decision 4 (conditions): `'print'` is a fifth condition, `showFor="print"` setting `.show-for-print` and `hideFor="print"` setting `.hide-for-print`; `NfsVisibilityCondition` becomes `'landscape' | 'portrait' | 'dark-mode' | 'sticky' | 'print'`, still closed (spec D20). Rejected: a `foundation-print-styles` directive under ADR 0044's clause 1 (`nfsShowForPrint`, `nfsHideForPrint`), and `showForPrint` and `hideForPrint` booleans, both `other`.
- Decision 10 (checks): check 2 gains a print rule, `showFor="print"` with any `hideFor` value, and two exemptions, `showFor="portrait"` and `showFor="dark-mode"` beside `hideFor="print"`, which print right (spec D21). Measured in Chromium 153, Firefox 155, WebKit 26.6, and Edge 153 under `foundation-everything`'s include order: beside `.show-for-print` the hide classes up to `$print-breakpoint`, `.hide`, and `.hide-for-print` hide the element everywhere, the orientation hide classes show it on screen in one orientation, and the rest do nothing; `.show-for-landscape` prints beside `.hide-for-print`. The reverse include order flips the print pairs, which the check reports either way.
- Decision 11 (Runtime check): unchanged; `'print'` needs `[]` and no `include()` request.
- Decision 13 (no CSS): extended to the forced `display: block` of `.show-for-print` in print (a `li`, `caption`, `tfoot`, inline element, flex `.menu`, or `.grid-x` prints as a block; table parts keep their displays), and to a missing `foundation-print-styles`, documented in the Sass section and not checked.
- Decision 14 (content rules): print-only content only adds to the screen page and never holds the caption, label, or legend of something on screen (measured: a print-only `caption` leaves its table unnamed in Chromium's tree, and axe is silent in three engines).
- Decision 18 (tests): `visibility--conditions` gains a print pair; the e2e print rows now cover the conditions (print at 1100, at 320 by 640, and under a dark colour scheme give one result: orientation and colour scheme change nothing in print); the fixture app's JavaScript-off run adds print emulation. No new story.
- Rendering modes: the print classes are in the server HTML (measured with Angular 22.2.0's `renderApplication`), so a print before hydration or with JavaScript off is right; a `@defer` block without a hydrate trigger is its placeholder on the server, so print-only content goes outside it.
- Out of Scope gains: a library rule restoring print-only displays (`other`); Foundation's other print rules and their Sass booleans (`scope-boundary`); `.print-break-inside` and `.ir`, proposed for the Typography Helpers (`scope-boundary`); the printed address after ADR 0038's current-path links, the Smooth Scroll spec's (`scope-boundary`).
- Triage: the print condition is impact MEDIUM, confidence HIGH, decided; nothing is OPEN FOR HUMAN.
