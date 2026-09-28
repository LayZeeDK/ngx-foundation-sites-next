# Out-of-scope triage

Model: Opus 5.5

Judge's verdict for [Triage the out-of-scope Foundation components and variants](../issues/79-triage-out-of-scope-components-and-variants.md), weighing [out-of-scope-exclusions.md](out-of-scope-exclusions.md) (its ids are used below), [foundation-component-catalogue.md](foundation-component-catalogue.md), and three lenses: Angular-native API (Fable 5.1), adversarial scope (Opus 5.5), and accessibility (Opus 5.5). Bundle paths are relative to EFFORT; `docs/`, `scss/`, and `js/` paths are in the Foundation 6.9.0 clone. `axe.js` is `D:/tmp/nfs-ct-prototype/node_modules/axe-core/axe.js`, axe-core 4.13.0, the pinned version (`building-blocks.md:129`). Wayfinder `SKILL.md` is `skills/engineering/wayfinder/SKILL.md` in the mattpocock-skills 1.2.3 plugin.

## 1. Ruling summary

The ruling removes one reason, being CSS-only (`issues/79-triage-out-of-scope-components-and-variants.md:11`). `map.md:148` extends it to every rule that excludes a directive "only because the item has no JavaScript". The evidence settles three things:

1. Every UI component with a Structural class gets one attribute directive per Structural class, never a component, because none generates structure (`adr/0001-directive-first-with-named-exceptions.md:7`; `building-blocks.md:20`). Elements styled by tag get none.
2. Each directive also owns the ARIA, `type` default, or development or compile-time check its documented markup lacks for WCAG 2.2 AA, because ADR 0022 covers "every directive and component" (`adr/0022-wcag-2-2-aa-enforcement.md:7`; `map.md:41`) and the Button spec applied this test (`specs/button.md:22`). Impact HIGH, confidence HIGH: decided.
3. Every reason that is not CSS-only holds, except the rows in section 3.

Five decisions remain for the user.

## 2. Returning components

Ratings follow the triage quadrant (`map.md:140`), as impact, then confidence.

| Item (ids) | Angular shape | Spec | Rating | Dissent |
| --- | --- | --- | --- | --- |
| Button Group (B1, G1) | `[nfsButtonGroup]` binds `.button-group`; no Parent token or inputs, since the cascade does it (`scss/components/_button-group.scss:215-244`); `role="group"` stays guidance (`specs/button.md:202`); no child check, since `$buttongroup-child-selector` is a consumer setting (`:19`) | Button, amended | MEDIUM, HIGH | Native lens wants a child check |
| Close Button (B2) | `button[nfsCloseButton]` binds `.close-button`, defaults `type="button"` (`specs/button.md:374`), checks for a name since the glyph is `aria-hidden` (`docs/pages/close-button.md:8-10`; axe `button-name`, `wcag2a`, `axe.js:32572`); composes with `nfsClose`, never `nfsButton` (`specs/button.md:379`); the spec decides whether Off-canvas's 24 px floor moves here (`specs/off-canvas.md:333`) | Button, amended | MEDIUM, HIGH | Accessibility lens keeps 2.5.8 per container |
| Switch (omitted) | `[nfsSwitch]`, `input[nfsSwitchInput]`, `label[nfsSwitchPaddle]`, inner labels binding `aria-hidden="true"` (`docs/pages/switch.md:154`); native `checked` (`:19`); no default `role="switch"`, never on radios (`:67-100`), since Foundation writes a checkbox (`:36`); name check (axe `label`, `axe.js:33019`); `nfs-switch` checks the off track, about 1.6:1 on white (computed, `scss/components/_switch.scss:11`, `:51`) | Switch, new | MEDIUM, HIGH | Scope lens: in Forms |
| Menu markup (G1) | `ul[nfsMenu]` binds `.menu` on a list with no plugin; `.menu-text` gets its own; Variants and the current-page `.is-active` stay consumer-written via `routerLinkActive` (`packages/router/src/directives/router_link_active.ts:148`); never provides `nfsMenuModeToken` (`specs/nested-menu.md:119`); roots do not host it | Menu, Pagination, and Breadcrumbs, new | MEDIUM, HIGH | Accessibility lens: in Nested menu; native lens: roots host it |
| Pagination, Breadcrumbs (omitted) | `ul[nfsPagination]` with `.pagination-previous`, `.pagination-next`, `.ellipsis`; `ul[nfsBreadcrumbs]`; `.current`/`.disabled` consumer-written, as DM19; named-`nav` check (`docs/pages/pagination.md:12`; `docs/pages/breadcrumbs.md:29`); generated arrows and separators documented (`scss/components/_pagination.scss:66`; `docs/pages/breadcrumbs.md:15`) | Menu, Pagination, and Breadcrumbs, new | LOW, HIGH | Accessibility lens binds `.current`/`.disabled` from inputs |
| Top Bar, Title Bar, Menu Icon (G1, G13, DM14) | `[nfsTopBar]`, `[nfsTopBarLeft]`, `[nfsTopBarRight]`, `[nfsTitleBar]`, `[nfsTitleBarLeft]`, `[nfsTitleBarRight]`, `[nfsTitleBarTitle]`, and `button[nfsMenuIcon]` (`type` default, name check, 24 px hit area on every `.menu-icon`). `[nfsResponsiveToggle]` composes on the same bar, because it does not add `.title-bar` (`specs/responsive-toggle.md:86`) | Top Bar, Title Bar, and Menu Icon, new; amends Responsive Toggle, Off-canvas, Dropdown Menu | HIGH, HIGH | Scope and accessibility lenses: in Responsive Toggle |
| Callout (G1) | `[nfsCallout]` binds `.callout`. Dismissal stays a visibility-mode `nfsToggler` with a bare `nfsClose` inside (`specs/button.md:443-448`). No `closable` input, no default live role | Callout, Card, Media Object, and Table, new | LOW, HIGH | Scope lens: a `closable` input |
| Card, Media Object (G1, omitted) | `[nfsCard]`, `[nfsCardDivider]`, `[nfsCardSection]`, `[nfsCardImage]`, `[nfsMediaObject]`, `[nfsMediaObjectSection]`; no default roles | Callout, Card, Media Object, and Table, new | LOW, HIGH | None |
| Table (G1) | `[nfsTableScroll]` on the `.table-scroll` wrapper (`scss/components/_table.scss:325`) binds the class, `tabindex="0"`, `role="region"`, and a required name (axe `scrollable-region-focusable`, `wcag2a`, `axe.js:33400`); `.stack` hides `thead` by default (`:277-299`), header loss the spec settles, by prototype if needed | Callout, Card, Media Object, and Table, new | MEDIUM, HIGH | Accessibility lens adds `table[nfsTable]` |
| Badge, Label (G1) | `[nfsBadge]`, `[nfsLabel]`; palettes stay classes; checks-only `nfs-badge`/`nfs-label` mixins, because `alert` is 4.499:1 with white and 4.36:1 with black (computed, `scss/_global.scss:32`, `:49`, `:53`; Button measured 4.498:1, `building-blocks.md:120`), despite Foundation's AA claim (`docs/pages/badge.md:101`; `docs/pages/label.md:103`) | Badge, Label, Progress Bar, Responsive Embed, and Thumbnail, new | LOW, HIGH | None |
| Progress Bar (omitted) | `[nfsProgress]` binds `.progress`, `role="progressbar"`, and `aria-value*` from `value`, `min`, `max`, `valueText` (`docs/pages/progress-bar.md:13-19`); `[nfsProgressMeter]` gets its width by DI (`:35`); `.progress-meter-text` gets its own; name check (axe `aria-progressbar-name`, `wcag2a`, `axe.js:32327`) | Badge, Label, Progress Bar, Responsive Embed, and Thumbnail, new | MEDIUM, HIGH | Scope lens: native `<progress>` first |
| Responsive Embed, Thumbnail (omitted) | `[nfsResponsiveEmbed]` with a check for an `iframe` title (axe `frame-title`, `axe.js:32843`). `img[nfsThumbnail], a[nfsThumbnail]` works with `NgOptimizedImage` | Badge, Label, Progress Bar, Responsive Embed, and Thumbnail, new | LOW, HIGH | None |
| Input Group, Help Text, Fieldset (omitted) | `[nfsInputGroup]` and its three parts, with a check that the field is labelled (Foundation's example input is unlabelled, `docs/pages/forms.md:299-305`). `[nfsHelpText]`, whose `aria-describedby` pairing stays consumer-written (`:195`; `specs/abide.md:118`). `fieldset[nfsFieldset]` | Input Group, Help Text, and Fieldset, new | MEDIUM, HIGH | Accessibility lens: in Abide, with help text registering with its field |
| `.tabs-content` (TB7) | `[nfsTabsContent]`, class only, with no providers Aria can see | Tabs, amended | LOW, HIGH | None |

**Placement.** Top Bar gets its own spec: one docs page holds all three parts (`docs/pages/top-bar.md:14-141`), and Off-canvas uses Title Bar and Menu Icon without Responsive Toggle (`specs/off-canvas.md:135`, `:563-566`). Placing them in Responsive Toggle would force an import from `responsive-toggle`, the risk the scope lens names, and would leave a `.menu-icon` outside `.title-bar` with no hit area (`specs/responsive-toggle.md:242`), which ADR 0022 forbids once `nfsMenuIcon` exists.

- Menu stays out of Nested menu, which acts only under a plugin root (`specs/nested-menu.md:119`). Pagination and Breadcrumbs share its `nav > ul` shape.
- The Forms parts stay out of Abide, so unvalidated forms need not import it; Switch has its own contrast and role work.
- Groups follow Foundation's sidebar (`docs/partials/component-list.html:76-134`).
- The native lens's cross-links are left out: the Dropdown Menu's ancestry read (`building-blocks.md:247`) must stay for consumer-written `.top-bar-right`, so DI would give it two sources. Both are additive later (Decision 5). (2026-09-28, [Re-run: Dropdown Menu spec under the class rule](../issues/113-rerun-dropdown-menu-class-rule.md): under the class rule `.top-bar-right` is bound by `nfsTopBarRight`, which also provides `nfsTopBarRightToken`, read at construction; the ancestry read stays only for a menu projected into the section, which declaration-site DI would miss.)

**No Structural class to bind:** `table` itself (`scss/components/_table.scss:307`), the form `label` and its `.middle` Variant, `select`, checkbox, radio, text inputs, native `<progress>` and `<meter>` (`docs/pages/progress-bar.md:99-140`), bare `fieldset` and `legend`, and the typography base. Each is in scope and documented in its docs page's spec, with no directive, which would bind nothing.

## 3. Other exclusions re-evaluated

| Ids | Verdict | Change needed, where | Rating | Dissent |
| --- | --- | --- | --- | --- |
| Found by the judge, no evidence row: `specs/orbit.md:115`, `:119`; `specs/slider.md:122` (D2 `:527`); `specs/off-canvas.md:120`; `.submenu-toggle-text` (`specs/accordion-menu.md:108`, `specs/dropdown-menu.md:118`, `specs/responsive-menu.md:106`); `.close-button` rows (`specs/off-canvas.md:122`, `specs/reveal.md:120`, `specs/toggler.md:248`) | Fails: each rests on "no behaviour" or "CSS only" | Class-only directives in those specs; the `.close-button` rows point to `nfsCloseButton` (2026-09-28: the Slider's `.slider-fill` is `span[nfsSliderFill]`, [Re-run: Slider spec under the class rule](../issues/124-rerun-slider-class-rule.md).) | MEDIUM, HIGH | None raised by the lenses; see Decision 5 |
| RT6 | Fails in part | `[nfsTitleBarTitle]` returns; the generated id and `aria-label` input stay out (visible text wins, static ids survive hydration, `specs/responsive-toggle.md:423`) | LOW, HIGH | Native lens: supply the id |
| TB9 | Holds, with the reason restated | Foundation has no nav-bar form of Tabs (`docs/pages/tabs.md:11`); the nav bar is the bundle's own recipe (`specs/tabs.md:55`, `:536`). Reword `:509` | LOW, HIGH | Native and accessibility lenses: add a class directive |
| B4 | Fails in part | Foundation shows `input[type=submit].button` (`docs/pages/forms.md:303`; `docs/pages/kitchen-sink.md:579`) and a `label.button` upload (`:323`), so "Foundation's docs never show it" (`specs/button.md:380`) is wrong. Default: `input` hosts join `nfsButton` (`.button`, native `disabled`); the label waits for a 2.4.7 fix, since focus lands on a clipped 1 px input (`scss/util/_mixins.scss:212-230`) | MEDIUM, HIGH | Scope and accessibility lenses read only `button.md` |
| B3, B7, DP3, RV2 | Holds in part | The skill quote (`adr/0010-button-variant-classes-stay-classes.md:11`) falls; second spelling, open sets, and runtime defaults stand; ADR 0010 note (section 5) | HIGH, NOT HIGH: Decision 1 | None |
| SL9 | Fails as written | Foundation binds Shift+Arrow to ten steps (`js/foundation.slider.js:46-49`, `:535-540`); the spec gives no reason (`specs/slider.md:299`, `:515`). Default: keep it dropped and record why: Page Up/Page Down is the APG large step, native everywhere (`:298`), though 10 percent of range, and Shift+Arrow would need directive key handling on linear handles (`:301`) (2026-09-28, [Re-run: Slider spec under the class rule](../issues/124-rerun-slider-class-rule.md): kept dropped with this reason recorded, the Slider spec's D25.) | LOW, HIGH | Scope lens accepts either |
| RAT6 | Holds in part | The APG half argues against a default, not against the opt-in that Tabs keeps (`specs/tabs.md:49`, `:97`). Lead D13 with the refocus-at-swap reason (`specs/responsive-accordion-tabs.md:581`) | LOW, HIGH | None |
| RAT4 | Holds in part | Foundation titles are markup; call the text `title` a first-release limit, a title template the upgrade (`specs/responsive-accordion-tabs.md:554`) | LOW, HIGH | Scope lens: holds |
| OR9 | Holds in part | Foundation's `bullets` Option allows a bullet-less Orbit (`specs/orbit.md:85`); the reason is a second APG style's cost, not WCAG (`:479`); say so | LOW, HIGH | Scope lens accepts that cost |

**Spec gaps the lenses found**, routed to the new tickets: Badge and Label `alert` contrast; the Switch focus indicator, a 10 percent track darkening (`scss/components/_switch.scss:15`, `:153-159`); Table header loss under `.stack`; XY Grid `.cell-block` scroll regions (`scss/xy-grid/_frame.scss:65-83`), which the Table spec's scroll-region contract can cover; the unnamed menu icon (`docs/pages/top-bar.md:74`). Not from the ruling: `SKILL.md:28`, `:219`, `:205` contradict `building-blocks.md:179`, `:48`.

**Reasons that still hold**, grouped by reason:

- Effort boundaries and scope notes: G2 G3 G6 G7 G10 AB9 AC2 AP1 AP2 AP3 AP5 SS3 TR5.
- Not a Foundation feature (Material, APG, or library additions): B6 B8 AC3 AB4 AB6 AB7 AB8 AM4 AM5 DM16 DL10 NM3 RM7 EQ2 EQ4 EQ6 MG5 MG6 OR11 SL8 SL10 TB8 TT3 TT5 TT6 TT7 TG3 TG6 RV6 RV9 RAT3 RAT7 RAT8 RM3 RM4 BP3 BP6 BP7 BP8 DP7 ST8 ST9 TR7.
- Foundation lacks the look, the rule, or the CSS: TB4 TB6 TB10 EQ1. EQ10 holds because its directive ships (`specs/equalizer.md:368`). OC7 holds under ADR 0001's generated-structure rule.
- Runtime theming (`building-blocks.md:179`): G9 AB10 AC4 DP17, and the theming halves of DL11 and NM9.
- jQuery and DOM plumbing: G4 AC10 AM1 AM2 B9 DL2 DL3 DL4 DL5 DM2 DM5 DM6 DM8 DM9 DM10 DM11 DP2 DP4 DP8 DP9 DP10 EQ7 EQ11 IC2 NM2 NM5 NM7 NM8 OC1 OC10 OR1 OR2 OR6 RM1 RT1 RT4 RV3 SS7 ST2 TB11 TG5 TR1 TR2 TR4 TT9.
- Class-name Options, because "the classes are the contract" (`building-blocks.md:59`): AB1 DM3 DM4 MG2 OC5 OR8 SL4 ST3 TB3 TT11.
- DM19 (`routerLinkActive` sets it); AC7 (CSS alternative text is out of target, `specs/accordion.md:301`).
- Menu roles (ADR 0004), re-checked: no returning component follows the Menu pattern, and Button Group is at most a toolbar (`specs/button.md:202`). G8 AM3 DM15 DL7 RM2 DP11.
- WCAG, APG, and measured platform limits: AB13 AC9 AP4 AP7 BP2 DM7 DM12 DM13 DM20 DP1 DP5 DP14 IC8 NM1 NM4 OC6 OR5 RV7 RV11 SL7 SL11 SS6 ST1 TB1 TB5 TR8 TT1 TT2 TT4, and the accessibility halves of DL11 and NM9.
- Browser target (`map.md:44-56`) and timing owned by CSS: AC1 AM6 AP6 DL8 DM18 DP16 RV10 SS4 ST7 TR6; AC8 DL6 MG1 OC3 RV1 SL3 SS1 TT8.
- Replaced by a named mechanism: AB2 AB5 AB12 AC6 B5 DM1 DM17 DP6 DP12 DP13 DP15 EQ8 EQ9 G5 G11 G12 IC1 IC3 IC4 MG3 MG10 NM6 OC2 OC4 OC8 OR3 OR4 OR7 OR10 OR12 OR13 RAT9 RAT10 RM5 RT2 RT5 RT7 RV4 RV5 RV8 SL1 SL2 SL6 SS2 ST4 ST5 TB2 TG1 TG2 TG4 TG7 TG8 TR3 (the scope lens's `closable` input fails: host directives are static, `specs/responsive-menu.md:133`, so every callout would become an Openable).
- Foundation behaviour dropped for design reasons: AB3 AB11 AC5 BP1 BP4 BP5 DL1 DL9 EQ3 EQ5 IC5 IC6 IC7 MG4 MG7 MG8 MG9 OC9 RAT1 RAT2 RAT5 RM6 RT3 RV12 SS5 SL5 ST6 TT10.

## 4. Layout systems, utility families, and base styles

Base styles are settled out: element selectors have no class to bind. The utility families (Prototyping, Flexbox, Visibility, Float, Typography helpers) are settled out too (MEDIUM, HIGH): Foundation files them under "Utilities" and "Typography" (`docs/partials/component-list.html:54-71`), the map's line never named them, they name no element of any component, and Visibility classes stay host bindings inside plugin directives (`building-blocks.md:94`, `:157`).

The grids are not settled. The map's line named "Grid" (`map.md:243`), and Foundation files XY Grid beside Forms under "General" (`docs/partials/component-list.html:42-49`), so the ruling's text reaches it, as the scope lens concedes. For keeping them out: their classes are generated per breakpoint and column count (ADR 0010's open set at full scale); source-ordering classes (`docs/pages/flexbox-utilities.md:244`; `docs/pages/grid.md:483-485`) and `.hide`/`.invisible` (`docs/pages/visibility.md:70`) are hazards a typed API would make look supported; the legacy grids are disabled by default. Against: `[nfsGridX]` has the same shape as `[nfsCard]`, so "it only adds a class" is no longer a reason. The native lens's `@angular/flex-layout` argument has no local source and carries no weight. The reason to record is "Utility classes, not UI components", never "CSS-only"; whether grids are components is Decision 2.

## 5. Rules to rewrite

**Map Destination (`map.md:9`, `:13`).** In `:9`, replace "for every JavaScript plugin in Foundation for Sites 6.9" with "for every UI component in Foundation for Sites 6.9, JavaScript plugin or CSS-only,". Replace "each plugin is built on" with "each component is built on". Replace `:13` with:

> The user's ruling of 2026-09-27 ([Triage the out-of-scope Foundation components and variants](issues/79-triage-out-of-scope-components-and-variants.md)) adds every CSS-only UI component: Button, Button Group, Close Button, Switch, Menu, Top Bar (with Title Bar and Menu Icon), Pagination, Breadcrumbs, Callout, Card, Media Object, Table, Badge, Label, Progress Bar, Responsive Embed, Thumbnail, Input Group, Help Text, and Fieldset. They go in grouped specs, with one entry point per Foundation docs page; with the shared utilities, that makes 32 specs.

**Map Out of scope, first line (`map.md:243`).** Replace with:

> - Foundation's layout systems (XY Grid, Float Grid, Flex Grid), utility class families (Prototyping, Flexbox, Visibility, Float, Typography helpers), and base element styles. They are Utility classes and element selectors that the consumer writes, not UI components, and none gets a directive of its own; Visibility classes stay host bindings inside Plugin directives ([ADR 0039](adr/0039-css-only-components-get-directives.md)).

**ADR 0010.** Under Decision 1 (a), an amendment, not a new ADR: the decision stands and one reason falls, as with ADR 0004's dated corrections (`adr/0004-menus-use-disclosure-navigation.md:21`). Append:

> - 2026-09-27 ([Triage the out-of-scope Foundation components and variants](../issues/79-triage-out-of-scope-components-and-variants.md)): the repo skill's "no directive needed" no longer supports this decision; the other two reasons hold. Variant classes are in scope: every spec lists them in its class mapping, and a story shows them. The rule covers every Structural class, CSS-only components included. A closed set fixed in Foundation's Sass (Menu `.vertical`, Table `.stack`, Button Group `.stacked`, Reveal `.full`) is still a class, and a current-page class (`.current`, a leaf `.is-active`) stays consumer-written through `routerLinkActive`.

Under (b) or (c), a new ADR 0040 in the ADR-FORMAT template supersedes it (`status: superseded by ADR-0040`).

**New ADR 0039**, `adr/0039-css-only-components-get-directives.md`, `status: accepted`:

> # CSS-only components get directives; Utility classes do not
>
> The user ruled on 2026-09-27 that being CSS-only never excludes a Foundation component or variant. We decided that every Foundation UI component with a Structural class gets one attribute directive per Structural class on the consumer's markup, never a component. Each directive owns the ARIA, `type` default, development check, or compile-time check that its documented markup lacks for WCAG 2.2 AA (ADR 0022). Elements Foundation styles by tag, and Utility classes, get no directive of their own.

Considered options: markup only (overruled by the user); `table[nfsTable]` (binds nothing); grid directives (Decision 2).

**Dated notes.** ADR 0001:

> The rule covers CSS-only components too (ADR 0039); none becomes a component.

ADR 0012:

> A CSS-only component's custom CSS and checks live in an `nfs-<entry point>` mixin (`nfs-top-bar`, `nfs-switch`, `nfs-badge`); the menu-icon hit area moves from `nfs-responsive-toggle` to `nfs-top-bar`.

**Building blocks.**

- 1.1, first sentence (`:14`): replace with "Rule (ADR 0001, ADR 0039): a plugin or a CSS-only component becomes attribute directives on the Foundation markup the consumer already writes, one per Structural class, even when a directive only binds its class; an element Foundation styles by tag gets none."
- 1.3 (`:44`): add "A CSS-only component is named after its Structural class (`.button-group` -> `NfsButtonGroup`), with one entry point per Foundation docs page."
- 1.10 (`:135`): replace the last two sentences with "The menu icon's hit area belongs to `button[nfsMenuIcon]` and `nfs-top-bar`, which applies it to every `.menu-icon`; an Off-canvas menu icon meets 2.5.8 through `@include nfs-top-bar;`."
- Table A ResponsiveToggle (`:228`): drop "which its no-argument include also gives a title-bar menu icon that opens an OffCanvas panel".
- Table B OffCanvas (`:251`): replace everything from "The 24 px" with "The menu-icon hit area is `nfs-top-bar`'s."
- Part 2 (`:209`): add a Table D with one row per CSS-only component; each spec ticket adds its own row.
- 1.2, 1.4, and 1.8 stand, because their reasons are not CSS-only.

**Glossary.** In `CONTEXT.md:3`, replace "replaces every Foundation JavaScript plugin with Angular directives" with "gives every Foundation UI component Angular directives", and "the 26 specs" with "the specs". Add after Visibility class:

> **Utility class**: A Foundation CSS class from a layout system or utility family that styles any element and names no element of a component's markup; consumer-written, never given a directive of its own.
> _Avoid_: helper class, layout class

**Button spec.** Replace Out of Scope `:355-356` with:

> - A Parent token and group inputs on `nfsButtonGroup`: Foundation's descendant selectors already pass the group's Variant classes to its buttons (D10).
> - `nfsButton` on a `.close-button`: the two class contracts collide (D10). `data-closable` belongs to the Triggers spec.

Replace D10 with:

> | D10 | `nfsButtonGroup` binds `.button-group` only; `button[nfsCloseButton]` binds `.close-button`, defaults `type`, and checks for a name in development mode | The user's 2026-09-27 ruling; the group cascade needs no Parent token; `.close-button` is its own class contract and closes through `nfsClose` | A Parent token providing size and colour; `nfsButton` on `.close-button` |

The amendment ticket also rewrites `:20`, `:22` (the class alone now earns the directive), `:105-106`, `:117`, and `:358` with D11 (B4).

**API-design skill** (repository file `.claude/skills/foundation-api-design/SKILL.md`, outside the bundle; proposal only).

- `:24`: replace with "**Each structural CSS class = one Angular directive** (a component only where Foundation generates structure)".
- `:177`: replace the row with three rows:

  > | Class names an element and has no behaviour (Structural class) | **Directive** binding it, plus any ARIA, `type` default, or check the documented markup lacks |
  > | Class selects a static look (Variant class) | Consumer-written class; an input only when behaviour depends on it |
  > | Utility class (grid, visibility, flexbox, float, typography helper) | No directive |

- `:149-176`: mark "Superseded for the next library by its ADR 0001."

## 6. Decisions for the user

1. **Variant classes.**
   - (a) Consumer-written, with ADR 0010 amended.
   - (b) Typed inputs for closed sets fixed in Foundation's Sass (`stacked`, `stack`, `vertical`, `full`, `hollow`).
   - (c) Typed inputs for every family.

   Recommend (a): one spelling, no collision rule against a static class (`specs/button.md:383`), no union type claiming to list an open Sass map (`adr/0010-button-variant-classes-stay-classes.md:11`). (b) and (c) supersede ADR 0010 with ADR 0040 and add inputs to Button, Dropdown, Reveal, Tabs, and every new spec.
2. **Grids.**
   - (a) Out, named as Utility classes, with the `.cell-block` note.
   - (b) Root directives for `.grid-x`, `.grid-y`, `.cell`, `.grid-container`, and `.grid-frame`, with sizes kept as classes.
   - (c) Directives for every utility family as well.

   Recommend (a): no directive adds a role, name, state, or check there, and typed ordering classes would make a 1.3.2 hazard look supported. (b) adds an XY Grid spec; (c) several.
3. **Packaging.**
   - (a) Amend Button and Tabs, run one re-run ticket for the plain-markup rows, and add six grouped specs along Foundation's sidebar groups, one entry point per docs page (section 7).
   - (b) One spec per docs page, about 17 new.
   - (c) One spec for all of them.

   Recommend (a): one directive per Structural class and one import per docs page in nine tickets, against a heavy template (Button alone runs to 479 lines for one class, `specs/button.md`).
4. **Destination.**
   - (a) Redraw this map's Destination.
   - (b) Start a fresh effort. The wayfinder skill says out-of-scope work returns "as a fresh effort, not a resumption" (wayfinder `SKILL.md:99`).

   Recommend (a): the user's goal condition already asks for specs "for each component in Foundation for Sites" (`map.md:126`), and the Destination was only this map's reading of it (`map.md:128`). No out-of-scope ticket was ever created, so nothing is resumed, and a fresh effort would still amend five published specs here and share this bundle's ADRs and glossary. (b) keeps this map closed as drawn.
5. **Reach into published specs.**
   - (a) Class-only directives for the first row in section 3, the Top Bar hit-area move, and no cross-links.
   - (b) As (a), plus the native lens's cross-links: the roots host `NfsMenu`, and `nfsTopBarRight` feeds the Dropdown Menu through DI.
   - (c) Only the changes a returning component's text needs.

   Recommend (a): `map.md:148` overrules every "no JavaScript, no directive" row; (b)'s links are additive later; (c) leaves Orbit, Slider, and Off-canvas parts as markup.

## 7. Proposed tickets

All `Type: grilling`, for the recommended options; section 5's rewrites land with this ticket's resolution.

- **80. Spec: Button Group and Close Button** (`issues/80-spec-button-group-and-close-button.md`). Blocked by: 79.
  - Question: What do `nfsButtonGroup` and `button[nfsCloseButton]` own, how does the Close Button meet 2.5.8 wherever it sits, and which `input` and `label` hosts does `nfsButton` take?
  - Amends `specs/button.md` (section 5), `specs/toggler.md:248`, `specs/reveal.md:120`, and `specs/off-canvas.md:122`, `:333`.
- **81. Spec: Switch** (`issues/81-spec-switch.md`). Blocked by: 79.
  - Question: Which directives cover the switch and its inner labels, which settings or checks make it pass 1.4.11 and 2.4.7, and when does a consumer add `role="switch"`?
- **82. Spec: Menu, Pagination, and Breadcrumbs** (`issues/82-spec-menu-pagination-breadcrumbs.md`). Blocked by: 79.
  - Question: What do the three list directives and their parts bind, apart from the Nested menu roots and its `NfsMenuItem` name?
- **83. Spec: Top Bar, Title Bar, and Menu Icon** (`issues/83-spec-top-bar.md`). Blocked by: 79.
  - Question: What do the eight directives bind, and how does `nfs-top-bar` give every `.menu-icon` its 24 px hit area?
  - Amends `specs/responsive-toggle.md:95-96`, `:242`, `:395`, `:425`; `specs/off-canvas.md:135` and its Sass requirement; `specs/dropdown-menu.md:120`, `:498`.
- **84. Spec: Callout, Card, Media Object, and Table** (`issues/84-spec-callout-card-media-object-table.md`). Blocked by: 79, 80.
  - Question: Which class directives, what dismissible Callout recipe, and how does `[nfsTableScroll]` meet 2.1.1 while `.stack` keeps headers (prototype if needed)?
- **85. Spec: Badge, Label, Progress Bar, Responsive Embed, and Thumbnail** (`issues/85-spec-badge-label-progress-bar-responsive-embed-thumbnail.md`). Blocked by: 79.
  - Question: Which class directives and palette checks, what value and name contract for `nfsProgress`, and when is native `<progress>` right?
- **86. Spec: Input Group, Help Text, and Fieldset** (`issues/86-spec-input-group-help-text-fieldset.md`). Blocked by: 79.
  - Question: Which class directives and labelled-field check, and how do they sit beside Abide's directives on the same elements?
  - Amends `specs/abide.md:118`.
- **87. Re-run: published specs, the Structural classes left as plain markup** (`issues/87-rerun-plain-markup-structural-classes.md`). Blocked by: 79.
  - Question: Which class-only directives do Tabs, Orbit, Slider, Off-canvas, and the Nested menu family gain, and how are the SL9, RAT6, RAT4, OR9, and TB9 reasons reworded?
  - Amends `specs/tabs.md:121`, `:507`, `:509`, `:520`; `specs/orbit.md:115`, `:119`, `:479`; `specs/slider.md:122`, `:299`, `:515`, `:527`; `specs/off-canvas.md:120`; `specs/nested-menu.md`; `specs/accordion-menu.md:108`; `specs/dropdown-menu.md:118`; `specs/responsive-menu.md:106`; `specs/responsive-accordion-tabs.md:554`, `:581`.
- **88. Consistency review: the CSS-only component wave** (`issues/88-consistency-review-css-only-wave.md`). Blocked by: 80, 81, 82, 83, 84, 85, 86, 87.
  - Question: Do the new and amended specs, Table D, the glossary, ADR 0039, and `README.md` agree?

## 8. Evidence corrections

`research/out-of-scope-exclusions.md`:

- `map.md:238`-`:246` (R1, R6, R8, R9, G1-G10, G13, C1-C3, the positive control) is `:243`-`:251` at HEAD; the lenses' `:242` is off by one too.
- R2's dependents: "B3, B7, DP3, RV2, DM19, AC7"; in the positive control, "OC-position classes, TG3, TB3" becomes "B7, DM19" (TG3 is a Trigger-role input, `specs/toggler.md:404`; TB3 is a class-name Option).
- R3's dependents: "AB1, DM3, DM4, MG2, OC5, OR8, SL4, ST3, TB3, TT11"; `triggerClass` is dropped (`specs/tooltip.md:93`), `templateClasses` kept (`:90`).
- R4's dependents: "AC8, DL6, MG1, NM6, OC3, RV1, SL3, SS1, TT8". R6's: "G8, AM3, DM15, DL7, RM2, DP11" (AM4 is mega menus).
- Missing rows: section 3's judge-found rows, `specs/responsive-toggle.md:95-96`, `specs/tabs.md:121`, `specs/abide.md:118`, `building-blocks.md:135`, `:251`, `adr/0004-menus-use-disclosure-navigation.md:11`, `CONTEXT.md:3`.

`research/foundation-component-catalogue.md`: `EFFORT/map.md:242` is `:243` and `:245` is `:246`; the Table row's `table[nfsTable]` binds no class, the Structural class being the `.table-scroll` wrapper (`scss/components/_table.scss:325`); `data-closable` is the Triggers utility's alone (`js/foundation.util.triggers.js:51`, `:89`).

Accessibility lens: every axe tag it cites is unchanged in 4.13.0 (`axe.js:32572`, `:33019`, `:32327`, `:32843`, `:33400`); `aria-dialog-name` is `best-practice` only (`axe.js:32263`), a tag the gate runs.
