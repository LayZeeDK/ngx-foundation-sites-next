# 86. Spec: Top Bar

Type: grilling
Status: resolved
Blocked by: 81, 85
Labels: wayfinder:grilling
Map: ../map.md

## Question

What Angular directives (preferred) or components give Foundation for Sites 6.9's Top Bar to the next, from-scratch ngx-foundation-sites repo, under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Foundation's docs page is `docs/pages/top-bar.md` and its Sass is `scss/components/_top-bar.scss, components/_title-bar.scss, components/_menu-icon.scss` in the 6.9.0 clone. Publish `specs/top-bar.md`.

Known from the triage: Covers Top Bar, Title Bar, and Menu Icon (one docs page); the menu icon owns a `type` default, a name check (Foundation's docs hamburger has none), and its 24 px hit area wherever it sits, which moves from the Responsive Toggle and Off-canvas specs; the Dropdown Menu reads `.top-bar-right` ancestry today.

## How to work it

Run `/grill-with-docs` (self-grilling, both sides) over the questions this component raises, then publish with `/to-spec` in the map's spec shape; the [Spec: Button](37-spec-button.md) is the nearest precedent. Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this component); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Cover: one directive per Structural class and what else each owns (the ARIA, `type` default, or development and compile-time checks the documented markup lacks for WCAG 2.2 AA, ADR 0022); every Variant as a typed input by the decision above; State classes as host bindings; the Sass mixin only where custom CSS or checks are needed (ADR 0012); the rendering-mode contract; stories with play functions and axe; e2e only where Storybook cannot reach. Record the decisions in this ticket's Answer, and propose shared-file changes (a building-blocks row, glossary terms) for the orchestrator. Model: Opus 5.5.

## Answer

Model: Opus 5.5. Resolved 2026-09-28, AFK under the map's override: self-grilled on both sides against Foundation 6.9.0's Top Bar docs page and its top-bar, title-bar, and menu-icon Sass partials, the Angular Material 22.2.x source (`mat-toolbar`, the navigation schematic), ADR 0039, ADR 0040, building-blocks 1.3, 1.4, 1.7, 1.9, 1.10, 1.13, and 1.14, the [Spec: Menu](85-spec-menu.md) and [Spec: Close Button](83-spec-close-button.md) answers, and the published Responsive Toggle, Off-canvas, Dropdown Menu, Nested menu, Triggers, Sticky, Magellan, and Smooth Scroll specs, with four measured probes. Spec: [specs/top-bar.md](../specs/top-bar.md).

### Measurements

All probes ran under `D:/tmp/nfs-wave-86/` (not committed), with Foundation 6.9.0's Sass from the local clone, Dart Sass 1.104.1, Playwright 1.63 in Chromium, Firefox, and WebKit, and axe-core 4.13.0, all loaded from `D:/tmp/nfs-ct-prototype`'s install through `createRequire` (no junction, nothing written there).

- Probe 1, `measure.mjs` (three engines, identical results): the menu icon under three candidates. Foundation's box is 20 by 16 px. (A) the published `::before` 24 px hit area and (B) `box-sizing: content-box; border: solid transparent; border-width: 4px 2px` both return the button from `elementFromPoint` 1.5 px outside the drawing's left and right edges and 3.5 px outside its top and bottom; a screenshot of the padding box is pixel-identical to Foundation's under both. (B)'s border box is 24 by 24 px; the title bar stays 40 px tall and its title moves 4 px (36 to 40 px). axe `target-size`: no result for the title-bar icons under any variant (Foundation's `$titlebar-icon-spacing` keeps the spacing exception); two dark icons side by side outside a title bar are a violation with Foundation's box and with (A), and pass with (B). axe `button-name` fails Foundation's docs icon. Under Chromium's forced-colours emulation Foundation's bars disappear, and (B)'s border is drawn as a visible box.
- Probe 1, the Top Bar: Foundation's docs example does not scroll sideways at 320 px (`scrollWidth` 320); sections stack at 320 and 639 px and sit side by side at 640 and 1024 px; `.stacked-for-medium` keeps them stacked at 640 px and releases them at 1024 px. axe with the six tags: three `color-contrast` violations and two incomplete on Foundation's defaults, none with `$topbar-background: $white`; the placeholder-only search field passes axe's `label` rule.
- Probe 2, `submenu.mjs` (three engines): with `$topbar-background: $white` written after Foundation's settings file (the Storybook settings-overrides order), an open Top Bar submenu keeps `rgb(230, 230, 230)` and axe fails its link; with `$topbar-submenu-background: $topbar-background` added, `rgb(254, 254, 254)` and no violation. Cause: the settings file assigns `$topbar-submenu-background: $topbar-background` at import time, and `foundation-top-bar` emits `.top-bar ul ul` whenever the two differ.
- Probe 3, `ratios.mjs` and `luminance-scan.mjs`: ratios with Foundation's `color-luminance()` and with the exact formula (`math.pow`). `$anchor-color` on `$light-gray`: Foundation 3.706, exact 3.755; on `#fefefe`: 4.587 against 4.647; on `$titlebar-background`: 4.280 against 4.224. Light icon on the title bar 19.63:1, hover 12.08:1; light icon on the default Top Bar 1.24:1; dark icon on the page 19.63:1, hover 3.42:1; dark icon hover on the default Top Bar 2.77:1. The scan over a 16-step grid (4096 colours) against `#fefefe` and `#0a0a0a` found 26 pairs Foundation's function passes at 3:1 or 4.5:1 and the exact formula fails (`#116666` on `#0a0a0a`: 3.006 against 2.938; `#1177dd` on `#0a0a0a`: 4.505 against 4.437), with a largest relative error of 30 percent (`#111111` on `#0a0a0a`). Cause: Foundation's `pow()` takes the power 2.4 as the fifth root of the twelfth power through an approximate `nth-root()`.
- Probe 4, `mixins.mjs`: draft `nfs-menu-icon`, `nfs-title-bar`, and `nfs-top-bar` over nine settings cases. Foundation's defaults stop the compile at `$anchor-color` on `$topbar-background` (3.755); the bar line alone stops it at `$topbar-submenu-background` (3.755); both lines compile; a transparent bar with a white submenu compiles; a translucent submenu warns; a darker `$anchor-color` on the default bar compiles and warns that no menu icon reaches 3:1; `$titlebar-color: #555` and `$titlebar-icon-color-hover: #333` stop the compile (2.66 and 1.57); a `#202020` page warns for the dark icon. The compiled `.menu-icon` declares `width: 20px; height: 16px`, which the rule's widths assume.

### Grilling record

Round 1 (the frontier: prerequisites settled by ADR 0039, ADR 0040, and the Menu and Close Button specs):

- Q1. Which Structural classes, and which directives? Nine: `.top-bar`, `.top-bar-left`, `.top-bar-right`, `.top-bar-title`, `.title-bar`, `.title-bar-left`, `.title-bar-right`, `.title-bar-title`, `.menu-icon`. For only the triage's eight: `.top-bar-title` is not on the docs page. Against: Foundation's Sass styles it (spacing, and a menu-icon nudge in float mode), and under the class rule a consumer cannot get it any other way. Settled: nine.
- Q2. Component or directives? Directives: Foundation generates nothing (ADR 0001). Material's `mat-toolbar` template and content queries were considered and rejected.
- Q3. Implementation level? Native platform. Aria's `ngToolbar` gives one roving tab stop over controls, which site navigation does not use (ADR 0004); CDK has nothing to do.
- Q4. One entry point or three? One, `ngx-foundation-sites/top-bar`: one entry point per docs page (the user's packaging decision), and a Title Bar or a menu icon alone imports it too.
- Q5. Variant inputs? `stackedFor` on `NfsTopBar` (building-blocks 1.4: a `<words>-for-<bp>` class keeps its words) and `dark` on `NfsMenuIcon` (naming rule 4). For a query type `NfsClassBreakpointQuery<'down'>`: Foundation's class means `<bp> down`. Against: no other modifier has a class, so a query would only restate the meaning. Settled: a bare `NfsClassBreakpoint`; the Zero breakpoint sets none and warns (Foundation skips it, and the bar already stacks below `$topbar-unstack-breakpoint`).
- Q6. What does `nfsMenuIcon` own? The Close Button's shape, as the Close Button ticket proposed: a `type` input defaulting to `button`, development name and symbol-only checks, a warning for `nfsButton` or `nfsCloseButton` on the same element, and the Trigger placed beside, never hosted.

Round 2:

- Q7. How is 2.5.8 met? Options: (a) keep the published `::before` hit area, which draws nothing and copies no Foundation value; (b) a transparent border on a content box, which grows the box and leaves the padding box, where the bars are laid out, unchanged; (c) `min-width`/`min-height` or padding, which would stretch the `::after` bars. For (a): no layout shift, independent of the icon's size. For (b): axe sees the box, so the story gate can prove 2.5.8 next to other targets, as the Close Button ticket found for its floor. Measured (Probe 1): (b) keeps the drawing identical, moves the title 4 px, and is the only candidate axe passes beside an adjacent target. (b)'s cost is that its 4 px and 2 px come from `hamburger()`'s 20 by 16 px default size, which Foundation exposes no setting for; a node-level compile test guards it, as ADR 0012 guards `-zf-bp-to-em`. Settled: (b), on every `.menu-icon`, not only inside `.title-bar`.
- Q8. Where do the rule and the checks live: one `nfs-top-bar`, or one Library mixin per Foundation export mixin? One mixin would stop the compile of an Off-canvas application with a title bar and no Top Bar at the Top Bar's link check, or leave its menu icon without the hit area. ADR 0012's consequence already says one `nfs-` include after each matching `foundation-` include. Settled: `nfs-menu-icon`, `nfs-title-bar`, `nfs-top-bar`; the triage's expected `nfs-top-bar` takes neither the hit area nor the title-bar checks.
- Q9. Which pairs, `@error` or `@warn`, and which luminance function? Pairs the component always draws stop the compile: title text and light icon on the title bar; links and the current link's fill on the Top Bar and its submenus. Pairs that exist only in a placement the consumer may not use warn (the Dropdown Menu's D14 precedent): the dark icon on the page (a dark-page application may use only the light icon), a menu icon on the Top Bar (Foundation's Sass allows it in `.top-bar-title`, its docs never show it), a translucent submenu background, a Zero-breakpoint `$topbar-unstack-breakpoint`. A link placed in a title bar (4.22:1) gets no check: Foundation never shows one, and a warning would fire on every default compile. Luminance: ADR 0022 names Foundation's `color-luminance()`, but Probe 3 measured false passes on `#0a0a0a`, the Title Bar's own background, so the checks use the exact formula through one library helper, and the bundle-wide correction is proposed below.
- Q10. What must the consumer set? `$topbar-background` on which `$anchor-color` reaches 4.5:1 (for example `$white`) and, when written after Foundation's settings file, `$topbar-submenu-background: $topbar-background` (Probe 2). The Storybook override, which today has only the first line, needs both.
- Q11. The Dropdown Menu's `.top-bar-right` read: keep the DOM walk after hydration, or DI? The triage kept the walk because consumers still wrote `.top-bar-right` then, which would have given DI two sources. Under the class rule the section is always `nfsTopBarRight`, so DI has one source and resolves at construction, on the server: the right-hand menu's `opens-left` lands in the server HTML and hydration changes nothing. Against DI: a menu projected into the section through a layout component has no DI path. Answer: the Nested menu root reports that case in development (a `.top-bar-right` DOM ancestor and no token), and `alignment="right"` or a provided token fixes it. Settled: `NfsTopBarRight` provides the lightweight `nfsTopBarRightToken`, and the Nested menu root injects it optionally at construction (recommendation for its re-run).
- Q12. Responsive Toggle, Sticky, Magellan, Smooth Scroll: host a bar directive, or sit beside? Beside: they may sit on any element (the Menu spec's D6 reasoning), and the Responsive Toggle's spec keeps custom bars working.
- Q13. RT6: `nfsTitleBarTitle` binds only its class; a generated id and an `aria-label` input stay out, as the triage ruled.

Round 3:

- Q14. Development checks? Seven (spec, Development checks): the two name checks, the class-contract collision, a rendered menu icon under 24 px (the missing-include signal, since the icon has no Variant property to request), copied classes, a Zero-breakpoint `stackedFor`, and sections outside their bars. The placement check reads DOM ancestry, not DI, because Foundation's CSS styles by ancestry and projection breaks DI (D13).
- Q15. Rendering modes? Host bindings and one provider, no listeners: the server HTML is final, nothing replays from these directives, no hydration boundary of their own; `hydrate never` keeps the look and working links.
- Q16. Roles and landmarks? None added: the consumer's `header` and `nav` elements, a `role="search"` form with a labelled field in the examples.
- Q17. Tests? The four layers; e2e only for three-engine geometry (target size, stacking at widths, reflow, RTL placement), focus visibility, forced colours, and the fixture app (JavaScript disabled, hydration, the right-hand menu's side in server HTML).
- Q18. Glossary: Top Bar, Title Bar, and Menu icon become terms; the Base side definition names the right-hand section instead of a class.
- Q19. ADR? One, for Q11: it reverses a published decision (the Dropdown Menu's D9), it is surprising without context (a menu reads a Top Bar token), it was a real trade-off (server-correct DI against DOM ancestry that sees projection), and it creates a public token other specs depend on. The mixin split (Q8) and the border (Q7) are reversible CSS: building-blocks and ADR 0012 notes, no ADR.

The frontier is empty; nothing is left `OPEN FOR HUMAN`.

### Decisions

1. Nine attribute directives, one per Structural class, in `ngx-foundation-sites/top-bar`: `NfsTopBar` (`[nfsTopBar]`, `exportAs: 'nfsTopBar'`), `NfsTopBarLeft`, `NfsTopBarRight`, `NfsTopBarTitle`, `NfsTitleBar`, `NfsTitleBarLeft`, `NfsTitleBarRight`, `NfsTitleBarTitle` (attribute selectors on any element), and `NfsMenuIcon` (`button[nfsMenuIcon]`, `exportAs: 'nfsMenuIcon'`). Native platform; no template, no listener, no model, output, method, Defaults token, or Parent token for the bars.
2. `stackedFor: NfsClassBreakpoint | undefined` on `NfsTopBar`: a Class breakpoint name sets `.stacked-for-<name>`; the Zero breakpoint sets none and warns in development; one class record over every non-zero breakpoint of `nfsBreakpointsToken`'s map strips copied `stacked-for-*` classes; Variant property `--nfs-breakpoint-classes` (written by `nfs-breakpoint-properties`).
3. `dark` on `NfsMenuIcon`, `boolean` through `nfsVariantBoolean`, bound with `[class.dark]` (a copied `dark` is stripped).
4. `NfsMenuIcon` binds `.menu-icon`; `type: 'button' | 'submit' | 'reset'`, default `'button'`; it opens nothing: a Trigger or the consumer's handler sits beside it, never hosted.
5. Development checks (client, once each): no accessible name; a symbol-only name; `.button` or `.close-button` on the icon's host; a rendered icon under 24 by 24 px (names `@include nfs-menu-icon;`); a copied `dark` or `stacked-for-*` naming its input; a Zero-breakpoint `stackedFor`; a Top Bar or Title Bar section with no bar ancestor in the DOM. Runtime checks while `stackedFor` is bound: `strictVariantNames` and `strictVariantProperties` over `--nfs-breakpoint-classes`.
6. 2.5.8: `nfs-menu-icon` emits `.menu-icon { box-sizing: content-box; border: solid transparent; border-width: 4px 2px; }`, a 24 by 24 px border box around the unchanged 20 by 16 px drawing, replacing `nfs-responsive-toggle`'s `.title-bar .menu-icon::before` hit area; a node-level compile test guards the 20 by 16 px size.
7. Three Library mixins, one after each Foundation export mixin: `nfs-menu-icon` (the rule; `@warn` for the dark icon under 3:1 on `$body-background`), checks-only `nfs-title-bar` (`@error` for `$titlebar-color` under 4.5:1 and `$titlebar-icon-color` or its hover under 3:1 on `$titlebar-background`), checks-only `nfs-top-bar` (`@error` for `$anchor-color` under 4.5:1 and `$menu-item-background-active` under 3:1 on `$topbar-background` and a differing `$topbar-submenu-background`; `@warn` for a translucent submenu background, a bar on which neither menu icon reaches 3:1, and a Zero-breakpoint `$topbar-unstack-breakpoint`).
8. Every ratio is the exact WCAG formula through one library-internal helper (`math.pow`), with translucent colours composited over `$body-background`, compared unrounded; never Foundation's `color-luminance()` or `color-contrast()`.
9. `NfsTopBarRight` provides `nfsTopBarRightToken` (`InjectionToken<NfsTopBarRight>`, `useExisting`), which the Nested menu root injects optionally at construction for the dropdown Base side, replacing the `.top-bar-right` DOM walk after hydration; a projected menu is reported in development by the root.
10. Responsive Toggle, Sticky, Magellan, and Smooth Scroll are written beside the bar directives, never hosted.
11. `NfsTitleBarTitle` binds only its class; the consumer's static `id` names the icon through `aria-labelledby`.
12. Required consumer settings: `$topbar-background: $white;` (or any bar colour on which `$anchor-color` reaches 4.5:1) and, when set after Foundation's settings file, `$topbar-submenu-background: $topbar-background;`; the library's Storybook overrides carry both.
13. Stories `top-bar--basic`, `top-bar--stacked-for`, `top-bar--current-page`, `top-bar--title-bar`, `top-bar--menu-icon`, `top-bar--responsive`, `top-bar--rtl`, `top-bar--fixture`; the four layers as the spec lists them.

### Triage

| Decision | Impact | Confidence | Outcome and evidence |
| --- | --- | --- | --- |
| 9, the right-hand section's token for the Base side | HIGH: a public token, the Nested menu root's rule, and the Dropdown Menu's published D9 | HIGH: the class rule removed the triage's only reason for the DOM walk; optional ancestor injection at construction is Angular's standard element-injector behaviour, through embedded views and child components; the projection gap is known and reported | Decided; ADR proposed |
| 2, `stackedFor` type | HIGH: public API | HIGH: building-blocks 1.4 applied; Foundation's class template read in its Sass | Decided |
| 1, 3, 4, directive names and inputs | HIGH: public API | HIGH: ADR 0039, ADR 0040, building-blocks 1.3; the Close Button's `type` precedent | Decided |
| 6, the border box | MEDIUM: rewrites the 2.5.8 rows of the Responsive Toggle, Off-canvas, and Triggers specs; one reversible CSS rule | HIGH: measured in three engines with axe (Probe 1) | Decided |
| 8, exact luminance | MEDIUM: an internal Sass helper for every Library mixin with a check; no API | HIGH: measured false passes of Foundation's function (Probe 3) | Decided; bundle-wide correction proposed |
| 7, three mixins | MEDIUM: consumer include lines | HIGH: Foundation's three export mixins; ADR 0012's consequence | Decided |
| 12, required settings and the Storybook line | LOW: settings | HIGH: measured (Probes 2 and 4) | Decided |
| 5, 10, 11, 13; `@warn` against `@error` per pair | LOW | HIGH, or MEDIUM for the `@warn` choices, which are reversible | Decided |

Nothing is left `OPEN FOR HUMAN`, and no prototype ticket is needed: every question that needed a measurement was measured here. Dissent recorded: the value-free `::before` hit area (Q7, rejected on the measured axe result) and the triage's no-cross-link recommendation (Q11, overtaken by the class rule).

### Proposed shared-file changes (for the orchestrator)

1. `building-blocks.md`, Table D, the Top Bar row: fill the empty cells with:

   > | Top Bar (with Title Bar and Menu Icon) | `docs/pages/top-bar.md` | [Spec: Top Bar](issues/86-spec-top-bar.md) | `[nfsTopBar]` (`.top-bar`; Variant input `stackedFor`, a Class breakpoint); `[nfsTopBarLeft]`, `[nfsTopBarRight]` (provides `nfsTopBarRightToken`, which the Nested menu root reads for the dropdown Base side), `[nfsTopBarTitle]`; `[nfsTitleBar]`, `[nfsTitleBarLeft]`, `[nfsTitleBarRight]`, `[nfsTitleBarTitle]`; `button[nfsMenuIcon]` (`.menu-icon`; `type` input defaulting to `button`; boolean Variant input `dark`); the Responsive Toggle, Sticky, and the Triggers are written beside them | Directives, one per Structural class (ADR 0001, ADR 0039); nothing is generated | Native platform: the consumer's elements and a native `<button>`; Aria's toolbar gives site navigation a roving tab stop it does not use (ADR 0004), and CDK has nothing to do | Static host classes; one `computed` class record for `stackedFor` (copied classes stripped); `nfsBreakpointsToken`; `nfsVariantBoolean`; one `useExisting` token provider; development checks in `afterNextRender` (menu-icon name, symbol-only name, `nfsButton` or `nfsCloseButton` on the icon, an icon under 24 px, copied classes, a Zero-breakpoint `stackedFor`, sections outside their bars); three Library mixins: `nfs-menu-icon` (a 24 by 24 px border box around the unchanged drawing, 2.5.8), checks-only `nfs-title-bar` and `nfs-top-bar` (1.4.3, 1.4.11, and 1.4.1 against the bar backgrounds) | None of their own: site navigation in named `nav` landmarks; the menu icon is a Button whose state comes from its Trigger |

2. `building-blocks.md` 1.10, the Target size bullet (the last one, as the Close Button proposal left it): replace the whole bullet with:

   > - Target size (WCAG 2.2 success criterion 2.5.8) is met by size, not by the spacing exception, wherever a Foundation control is smaller than 24 by 24 CSS px and a spec owns it: the Library mixin grows the control's box to 24 by 24 CSS px without resizing what Foundation draws, because axe's `target-size` rule measures only the element's box. Where the box is transparent and the drawing is a glyph inside it (`.close-button`, `.button`), a `min-width: 24px; min-height: 24px` floor. Where the drawing is laid out on the box (the `.menu-icon` hamburger, whose bars fill its 20 by 16 px padding box), a transparent border on a content box (`box-sizing: content-box; border: solid transparent; border-width: 4px 2px`), which leaves the padding box, and so the drawing, unchanged; `nfs-menu-icon` applies it to every `.menu-icon`, so the Responsive Toggle's and Off-canvas's title bars get it from that include ([Spec: Top Bar](issues/86-spec-top-bar.md)). A transparent hit-area pseudo-element is not used: measured in three engines, it takes pointer hits outside the box, but axe reports a close button over a link as incomplete ([Spec: Close Button](issues/83-spec-close-button.md)) and fails two adjacent menu icons ([Spec: Top Bar](issues/86-spec-top-bar.md)), both of which it passes with the floor and the border.

3. `building-blocks.md` 1.10, a new bullet after the Close Button bullet:

   > - Top Bar, Title Bar, and Menu icon ([Spec: Top Bar](issues/86-spec-top-bar.md)): the `nfs-menu-icon` Library mixin emits the menu icon's border box (2.5.8, the Target size bullet) and warns when the dark icon's `$black` or `$dark-gray` is under 3:1 against `$body-background`; the checks-only `nfs-title-bar` stops the compile when `$titlebar-color` is under 4.5:1, or `$titlebar-icon-color` or `$titlebar-icon-color-hover` under 3:1, against `$titlebar-background`; the checks-only `nfs-top-bar` stops the compile when `$anchor-color` is under 4.5:1 or `$menu-item-background-active` under 3:1 against `$topbar-background` and, where it differs, `$topbar-submenu-background`. The consumer must set a `$topbar-background` on which `$anchor-color` reaches 4.5:1, for example `$topbar-background: $white;` (Foundation's `$light-gray` gives 3.76:1), and, when that override follows the import of Foundation's settings file, `$topbar-submenu-background: $topbar-background;`: the settings file assigns the submenu background from the old bar colour, and, measured in three engines, open submenus otherwise keep `$light-gray` and axe fails their links.

4. `building-blocks.md` 1.10, first bullet: replace "the mixin checks at compile time with the unrounded contrast ratio from Foundation's `color-luminance()` function and the WCAG contrast formula, never Foundation's `color-contrast()`, which rounds to one decimal and would pass a failing pair" with:

   > the mixin checks at compile time with the unrounded contrast ratio of the exact WCAG relative-luminance formula, computed by one library-internal Sass helper with `math.pow` that composites a translucent colour over `$body-background` first; never with Foundation's `color-luminance()`, which raises to the power 2.4 through Foundation's approximate `pow()` and `nth-root()` and overstates some ratios (measured by the [Spec: Top Bar](issues/86-spec-top-bar.md) ticket: it passes 26 failing pairs of a 16-step colour grid against `#fefefe` and `#0a0a0a`, such as `#1177dd` on `#0a0a0a` at 4.51:1, where the exact ratio is 4.44:1), and never with Foundation's `color-contrast()`, which rounds to one decimal and would pass a failing pair

   The bullet's parenthetical about the alert button fill follows unchanged. In the same section, replace "the unrounded `color-luminance()` ratio" in the Target size and non-text contrast bullet, the Button bullet, the Forms bullet, and the bullet on what axe cannot enforce with "the exact unrounded ratio".

5. `adr/0022-wcag-2-2-aa-enforcement.md`, Consequences, append:

   > - 2026-09-28 ([Spec: Top Bar](../issues/86-spec-top-bar.md)): the compile-time checks compute the unrounded ratio with the exact WCAG formula through one library-internal helper (`math.pow`), not Foundation's `color-luminance()`, whose approximate `pow()` passes pairs the exact formula fails (measured: 26 of a 16-step colour grid against `#fefefe` and `#0a0a0a`; `#116666` on `#0a0a0a` 3.01:1 against 2.94:1). The rest of the decision stands; the class-rule consistency review rechecks every ratio a spec quotes, which moves by more than a percent for colours with a low channel value (`#1779ba` on `#fefefe`: 4.5865:1 with Foundation's function, 4.6473:1 exactly).

6. `building-blocks.md` 1.8: replace "a `<button>` Trigger gets `type="button"` from the consumer, from `nfsButton`, or from `nfsCloseButton` ([Spec: Close Button](issues/83-spec-close-button.md))" with:

   > a `<button>` Trigger gets `type="button"` from the consumer, from `nfsButton`, from `nfsCloseButton` ([Spec: Close Button](issues/83-spec-close-button.md)), or from `nfsMenuIcon` ([Spec: Top Bar](issues/86-spec-top-bar.md))

7. `building-blocks.md`, Table A, the ResponsiveToggle row: replace "; the same mixin adds a 24 by 24 px hit area to Foundation's 20 by 16 px hamburger for WCAG 2.2 success criterion 2.5.8, which its no-argument include also gives a title-bar menu icon that opens an OffCanvas panel" with:

   > ; the menu icon's 24 by 24 px box for WCAG 2.2 success criterion 2.5.8 is `nfs-menu-icon`'s ([Spec: Top Bar](issues/86-spec-top-bar.md))

8. `building-blocks.md`, Table B, the OffCanvas row, last cell: replace everything from "The 24 px `.title-bar .menu-icon` hit area stays in `nfs-responsive-toggle`" to the end with:

   > A title-bar menu icon that opens a panel is `button[nfsMenuIcon]`, whose 24 by 24 px box is `nfs-menu-icon`'s ([Spec: Top Bar](issues/86-spec-top-bar.md)); the Consistency review's decision to keep the hit area in `nfs-responsive-toggle` is superseded, because Title Bar and Menu Icon are now in the destination.

9. `building-blocks.md`, Table B, the DropdownMenu row, last cell, once the Nested menu and Dropdown Menu re-runs adopt decision 9: replace "`align-right` and RTL decide the Base side in server HTML, `.top-bar-right` after hydration with a development warning; WCAG 2.2 AA needs `$dropdownmenu-min-width: min(200px, 45vw)` and a Top Bar background passing 4.5:1 for `$anchor-color`" with:

   > the Menu's `align`, RTL, and the Top Bar's `nfsTopBarRightToken` decide the Base side in server HTML ([Spec: Top Bar](issues/86-spec-top-bar.md)), with a development warning only for a menu projected into the right-hand section; WCAG 2.2 AA needs `$dropdownmenu-min-width: min(200px, 45vw)`, and inside a Top Bar the bar and submenu backgrounds that `nfs-top-bar` requires

10. `CONTEXT.md`, Foundation side, after **Close Button** (after **Menu** if that proposal is applied):

    > **Top Bar**:
    > Foundation's CSS-only navigation bar with a left-hand and a right-hand section that stack below a breakpoint, holding menus, a title, and form controls; the wide-screen counterpart of a Title Bar.
    > _Avoid_: navbar, header bar, top nav
    >
    > **Title Bar**:
    > Foundation's CSS-only compact bar holding a Menu icon and a title, shown in place of a Top Bar on small screens or beside an off-canvas panel.
    > _Avoid_: mobile bar, app bar, toolbar
    >
    > **Menu icon**:
    > Foundation's three-bar button drawn in CSS (`.menu-icon`), light by default and dark as a Variant, which opens a menu or a panel through a Trigger beside it; distinct from the Menu component.
    > _Avoid_: hamburger (for the component), burger button, menu toggle

    Angular side, **Base side**: replace "set by `alignment`, Foundation's `align-right`, a `.top-bar-right` ancestor, and the reading direction" with "set by `alignment`, the Menu's `align` Variant, an enclosing Top Bar right-hand section, and the reading direction".

11. `adr/0012-sass-packaging.md`, Consequences, append:

    > - 2026-09-28 ([Spec: Top Bar](../issues/86-spec-top-bar.md)): an entry point whose docs page covers several Foundation export mixins gets one Library mixin per export mixin, named after it and included after it, so each check runs only for a component the consumer compiles: the top-bar entry point has `nfs-top-bar`, `nfs-title-bar`, and `nfs-menu-icon`, the first two checks-only. The menu icon's 24 px box moves from `nfs-responsive-toggle` to `nfs-menu-icon`, not to the `nfs-top-bar` the triage expected.

12. New ADR (the orchestrator numbers it), "A menu root learns it sits in a Top Bar's right-hand section through dependency injection", `status: accepted`:

    > # A menu root learns it sits in a Top Bar's right-hand section through dependency injection
    >
    > Foundation's Dropdown Menu opens its submenus to the left when its root sits inside `.top-bar-right`, which Foundation's JavaScript reads from the DOM, and the published Dropdown Menu spec read the same ancestry in the first render callback, so the server HTML carried the wrong side and the side flipped at hydration, with a development warning. The out-of-scope triage kept that DOM walk because consumers still wrote `.top-bar-right` then, and a DI link would have given the side two sources. Under the class rule ([ADR 0039](0039-directives-manage-every-foundation-class.md)) the right-hand section is always the `nfsTopBarRight` directive. We decided that `NfsTopBarRight` provides the lightweight `nfsTopBarRightToken`, and that the Nested menu root injects it optionally at construction and gives `opens-left` for `alignment: 'auto'` when it is present, so the side is in the server HTML and hydration changes nothing ([Spec: Top Bar](../issues/86-spec-top-bar.md)).
    >
    > ## Considered options
    >
    > - The DOM walk in the first render callback (the published Dropdown Menu spec's D9): it sees a menu projected into the section, but the server HTML is wrong in every Top Bar layout.
    > - Both, DI at construction and the walk after hydration: two sources for one decision.
    > - Injecting `NfsTopBarRight` by class: every menu bundle would keep the Top Bar's directive class.
    >
    > ## Consequences
    >
    > - A menu declared outside the section and projected into it through a layout component finds no token; the menu root warns in development when it has a `.top-bar-right` DOM ancestor and no token, and `alignment="right"` or a provided `nfsTopBarRightToken` fixes it.
    > - The Nested menu entry point imports the token from the top-bar entry point, as the Openables import `nfsOpenableToken` from the Triggers entry point.
    > - Reopened if a Base-side source appears that DI cannot reach at construction.

13. `storybook-conventions.md` section 5: in `_settings-overrides.scss`, replace the Top Bar block with:

    > ```scss
    > // color-contrast (1.4.3): Foundation's default Top Bar puts $anchor-color links at 3.76:1, and nfs-top-bar
    > // stops the compile. Spec: Top Bar, every top-bar--* story; also the Dropdown Menu (dropdown-menu--top-bar),
    > // Nested menu, Magellan (magellan--sticky-top-bar), Responsive Menu, and Responsive Toggle
    > // (responsive-toggle--default) stories that show a Top Bar.
    > $topbar-background: $white;
    > // Foundation's settings file set the submenu background from the old bar colour; without this line open
    > // Top Bar submenus stay $light-gray and fail color-contrast (measured in three engines, Spec: Top Bar).
    > $topbar-submenu-background: $topbar-background;
    > ```

    and in the `preview.scss` block after `@include nfs-menu;`:

    > ```scss
    > @include nfs-menu-icon; // Top Bar: the menu icon's 24 px box; every story with a menu icon (Top Bar, Responsive Toggle, Off-canvas, Triggers)
    > @include nfs-title-bar; // Top Bar: title-bar contrast checks
    > @include nfs-top-bar; // Top Bar: Top Bar contrast checks
    > ```

14. `README.md`, the Plugins table, after the Close Button row (or after the Menu row if it exists):

    > | Top Bar, Title Bar, and Menu icon (CSS-only components) | [specs/top-bar.md](specs/top-bar.md) | Native platform; nine listener-free class directives, a `button[nfsMenuIcon]` beside the Triggers utility, and `nfsTopBarRightToken` for the menu Plugins' Base side | No inventory: Foundation's Top Bar docs and its three Sass partials, with the [out-of-scope triage](research/out-of-scope-triage.md) (Top Bar row) | None needed; target size, drawing, forced colours, reflow, submenu backgrounds, and luminance measured in [Spec: Top Bar](issues/86-spec-top-bar.md) |

    and the ADR index row for the new ADR of item 12, with the ADR count, as the orchestrator numbers it.

15. `map.md`, Decisions so far: the gist at the end of this Answer.

### What other specs need from this one

- [Re-run: Responsive Toggle spec under the class rule](116-rerun-responsive-toggle-class-rule.md): the bar is `<div nfsTitleBar [nfsResponsiveToggle]="menu">` with `button[nfsMenuIcon]` and a bare `nfsToggle` beside it, the title `nfsTitleBarTitle` with a static `id`, and the menu `nfsTopBar` with `nfsResponsiveToggleMenu` beside it (decision 10); the class-mapping rows for `.title-bar`, `.title-bar-title`, `.title-bar-left`, `.title-bar-right`, and `.menu-icon` point to this spec; RT6 is decision 11. `nfs-responsive-toggle` loses rule (a), the hit area (now `nfs-menu-icon`, as a border box, decision 6), and the checks of (b) (now `nfs-title-bar`, as `@error`), keeping only (c), the `$hide-for` Visibility classes; its 2.5.8 row, e2e hit test, Sass subsection, and Design decisions follow; the 1.4.3 Top Bar links row points to `nfs-top-bar` and the two settings lines (decision 12). Its 1.4.10 reason, "Foundation's docs example puts a horizontal `.dropdown.menu` in the top bar, which overflows at 320 px", did not reproduce: measured in three engines, Foundation's Top Bar docs example stacks and wraps at 320 px with `scrollWidth` 320; the stacked-orientation markup can stay, with the reason restated.
- [Re-run: Off-canvas spec under the class rule](117-rerun-off-canvas-class-rule.md): the title bar is `nfsTitleBar`, `nfsTitleBarLeft`, `nfsTitleBarRight`, `nfsTitleBarTitle`, and `button[nfsMenuIcon]` with `[nfsOpen]` beside it; every requirement of `@include nfs-responsive-toggle;` for a title-bar menu icon becomes `@include nfs-menu-icon;` (and `nfs-title-bar` for the bar's checks), in its hierarchy sketch, 2.5.8 row, and Sass subsection.
- [Re-run: Dropdown Menu spec under the class rule](113-rerun-dropdown-menu-class-rule.md): the `.top-bar`, `.top-bar-left`, `.top-bar-right` row becomes `nfsTopBar`, `nfsTopBarLeft`, `nfsTopBarRight` (this spec); D9, user story 11, development check 1, the SSR smoke, and the fixture e2e follow decision 9 (the right-hand root carries `opens-left` in the server HTML; the warning covers only projection); D14's Top Bar `@warn` for `$anchor-color` is superseded by `nfs-top-bar`'s `@error`, and the spec decides whether it keeps a warning for `$dropdown-menu-item-color-active` or adds `$dropdownmenu-arrow-color` against `$topbar-background`; its Storybook line needs the submenu companion (decision 12), or `dropdown-menu--top-bar` fails axe with a submenu open (measured); its Sass subsection adds `nfs-top-bar` beside `foundation-top-bar`.
- [Re-run: Nested menu (shared utility) spec under the class rule](132-rerun-nested-menu-class-rule.md): the Base side rule becomes: "`alignment` `'auto'` gives `opens-left` when the hosted `NfsMenu`'s `align()` is `'right'`, when `Directionality` is `rtl`, or when `inject(nfsTopBarRightToken, {optional: true})` finds a Top Bar right-hand section, and `opens-right` otherwise; all three are known at construction, so the server HTML carries the side. In development builds only, the root's first render callback warns once when the root has a `.top-bar-right` DOM ancestor but found no token (a menu projected into the section), naming `alignment="right"` and the token." The `.top-bar-right` ancestry row of its render-callback table goes; its 1.4.3 row points to `nfs-top-bar`; its Storybook settings need both lines.
- [Re-run: Responsive Menu spec under the class rule](115-rerun-responsive-menu-class-rule.md): its title-bar usage example uses this spec's directives; its 1.4.3 Top Bar row points to `nfs-top-bar` and both settings lines; the token reaches dropdown mode through the Nested menu root.
- [Re-run: Triggers (shared utility) spec under the class rule](130-rerun-triggers-class-rule.md): in the 2.5.8 row, replace "a `.title-bar .menu-icon` through the 24 by 24 px hit area of the `nfs-responsive-toggle` mixin, which the consumer includes" with "an `nfsMenuIcon` host through the 24 by 24 px border box of the `nfs-menu-icon` mixin ([Spec: Top Bar](86-spec-top-bar.md))"; D13's `type` owners add `nfsMenuIcon`; its examples use `nfsTitleBar`, `nfsTitleBarTitle`, and `button[nfsMenuIcon]`; the Sass paragraph's "the Title Bar markup" becomes the [Spec: Top Bar](86-spec-top-bar.md); its preview line names `nfs-menu-icon` instead of `nfs-responsive-toggle`.
- [Re-run: Sticky spec under the class rule](120-rerun-sticky-class-rule.md): its title-bar example becomes `<header nfsTitleBar nfsSticky ...>` with `nfsTitleBarLeft`; its 1.4.3 row's opaque-background rule holds for a Top Bar only while `$topbar-background` is opaque, which a transparent Top Bar (Foundation's documented option) is not.
- [Spec: Magellan](30-spec-magellan.md) (its re-run is resolved): the names `NfsTopBar` and `NfsTopBarRight` match; its 1.4.3 and 1.4.11 rows and Sass item 2 can point to `nfs-top-bar`, which now stops the compile for `$anchor-color` and `$menu-item-background-active` against the bar; its Top Bar has no submenus, so the submenu line is not needed there.
- [Spec: Menu](85-spec-menu.md): `.menu-icon` and `.menu-icon.dark` are this spec's `nfsMenuIcon` and `dark`; the current link's fill against `$topbar-background`, which its ticket left to this spec, is checked by `nfs-top-bar`.
- [Spec: Smooth Scroll](29-spec-smooth-scroll.md): its `smooth-scroll--sticky-offset` story's `[nfsTopBar]` is this spec's name; nothing else.
- [Re-run: Breakpoint service (shared utility) spec under the class rule](129-rerun-breakpoint-service-class-rule.md): the Top Bar's `stackedFor`, already in its consumer table, reports breakpoint names to `strictVariantNames` and a missing `--nfs-breakpoint-classes` to `strictVariantProperties` through the reporting call that spec defines, and reads `nfsBreakpointsToken` for the Zero breakpoint and the map's keys.
- [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md): one `uses` entry under `NfsBreakpointClassesOverrides`: `{entryPoint: 'ngx-foundation-sites/top-bar', directive: 'NfsTopBar', input: 'stackedFor', alias: 'NfsClassBreakpoint', shape: 'name'}`; no registry and no mixin of its own.
- [Spec: Visibility Classes](104-spec-visibility-classes.md): its screen-reader-only directive names a menu icon by hidden text; this spec's examples write `nfsShowForSr` as a placeholder for its name.
- [Spec: Button Group](82-spec-button-group.md): its `stackedFor` takes Foundation's two hard-coded names (a closed family), while the Top Bar's takes a Class breakpoint; the same input name with different types is correct under building-blocks 1.4, and the class-rule review can note it.
- Every spec with a compile-time contrast check (Button, Forms, Close Button, Menu, Tabs, Accordion, Abide, Orbit, Slider, Off-canvas, Reveal, Dropdown Menu, Responsive Toggle): the exact-luminance helper of proposal 4 replaces Foundation's `color-luminance()` in their Sass subsections, and their quoted ratios are rechecked.
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): check that no spec writes `.top-bar`, `.top-bar-*`, `.title-bar`, `.title-bar-*`, `.menu-icon`, or `dark` as a class; that every `$topbar-background: $white` line where a Top Bar shows submenus has its `$topbar-submenu-background` companion; that no spec still requires `nfs-responsive-toggle` for a menu icon; and that every check names the exact-luminance helper.

### Gist for Decisions so far

- [Spec: Top Bar](issues/86-spec-top-bar.md) -- nine listener-free class directives in one entry point (`nfsTopBar` with a `stackedFor` Class-breakpoint input, its left, right, and title sections, the four Title Bar directives, and `button[nfsMenuIcon]` with a `type` default, a boolean `dark`, and development name checks, opening nothing itself); the menu icon meets 2.5.8 by a transparent border that grows its box to 24 px around Foundation's unchanged drawing (measured in three engines: axe passes it beside another target and fails the published pseudo-element hit area), in `nfs-menu-icon`, one of three Library mixins with checks-only `nfs-title-bar` and `nfs-top-bar`, whose ratios use the exact WCAG formula because Foundation's `color-luminance()` was measured passing failing pairs; `nfsTopBarRight` provides a token so the Dropdown Menu opens left in server HTML; consumers set `$topbar-background` and, after the settings file, `$topbar-submenu-background` (measured: open submenus otherwise fail axe); impact HIGH, confidence HIGH; one ADR proposed. Spec: [specs/top-bar.md](specs/top-bar.md).

### Correction, 2026-09-28

The sticky Top Bar example's container wrapped only the bar, so its Sticky range was empty and it never stuck; the container now spans the page, found by [Re-run: Sticky spec under the class rule](120-rerun-sticky-class-rule.md).

### Amendment, 2026-09-28 (out-of-scope survivors)

[Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md) found this spec's reason for not drawing the menu icon's bars under forced colours wrong. The reason was that restating `hamburger()`'s offsets would copy Foundation's values. But `hamburger()` computes the offsets from its own arguments, so a call with system colours copies nothing. The [Re-run: Top Bar spec, out-of-scope survivors](148-rerun-top-bar-out-of-scope-survivors.md) measured the rule in Chromium and Firefox, and it holds; the spec is revised in place (new D16):

- Decision 6 gains a forced-colours block in `nfs-menu-icon`: `.menu-icon, .menu-icon.dark { @include hamburger($color: CanvasText, $color-hover: Highlight); }`, `.menu-icon { border-color: Canvas; }`, and `.menu-icon::after { forced-color-adjust: none; }`, inside `@media (forced-colors: active)`. Measured: three `CanvasText` bars on Canvas, `Highlight` on hover, the 24 by 24 px box unchanged, and the compiled output outside forced colours byte-identical. Without `forced-color-adjust: none` the `box-shadow` bars are dropped; without the `.dark` selector the dark icon keeps `$black`; without the `Canvas` border the forced border colour joins the outer bars into a filled box.
- The Probe 1 finding that "under Chromium's forced-colours emulation Foundation's bars disappear, and (B)'s border is drawn as a visible box" still holds, but the outlined box is no longer the forced-colours look: the border now takes `Canvas`, and the bars show.
- The forced-colours e2e case now asserts bar, gap, border, and hover pixels against system-colour swatches, in both colour schemes. WebKit is skipped because its emulation matches the query without forcing colours.
- Every Out of Scope bullet and rejected alternative the spec keeps now carries a category. The "bars drawn under forced colours" bullet is gone.
