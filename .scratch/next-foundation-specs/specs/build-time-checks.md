# Spec: build-time checks (later milestone)

Ticket: [Spec: build-time checks (later milestone)](../issues/163-spec-build-time-checks-later-milestone.md). Planned and implemented in a later milestone of the implementing repository, by the user's ruling in [Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md). Targets Angular 22.2, Nx 23.2, TypeScript 6.0.x, Dart Sass 1.104 (the version `@angular/build` 22.2.0 loads), Vitest 4.1.x, and Foundation for Sites 6.9.0 Sass. Decided upstream in [ADR 0022](../adr/0022-wcag-2-2-aa-enforcement.md) (WCAG 2.2 AA enforced by the story gate and the library's Sass, with its dated note on the exact formula), [ADR 0012](../adr/0012-sass-packaging.md) (Sass packaging, the import-order guard, and the dated notes on Library mixins and Variant properties), [ADR 0039](../adr/0039-directives-manage-every-foundation-class.md) (the class rule), [ADR 0040](../adr/0040-variant-input-types.md) (Variant input types and keeping the declaration file in step), and [ADR 0045](../adr/0045-release-policy-devkit-version-scheme.md) (the release policy); building-blocks 1.10 and 1.13 and the architecture guide's P17. The decision log, with every question this spec asked itself and its triage, is in the ticket answer.

Sources: every check here was extracted, verbatim and by kind, by [Task: extract the checks from the specs](../issues/159-task-extract-checks-from-specs.md) into seven manifests: [checks-extraction-a](../research/checks-extraction-a.md), [-b](../research/checks-extraction-b.md), [-c](../research/checks-extraction-c.md), [-d](../research/checks-extraction-d.md), [-e](../research/checks-extraction-e.md), [-f](../research/checks-extraction-f.md), and [-shared](../research/checks-extraction-shared.md). This spec copies each design from those manifests and from the specs as committed at `53144f3`, and cites a spec's own design decisions as "Button D16". The Source map under Further Notes lists every `build-time` entry of the seven manifests and where it lands here.

## Problem Statement

A developer compiles Foundation's Sass with their own settings, then includes the library's Library mixins after it. Foundation's defaults fail several WCAG 2.2 AA criteria that no automated page test sees, and nothing in Foundation's compile says so:

- Foundation's alert fill is 4.498:1 against its label, and Foundation's own `color-contrast()` rounds that to 4.5 and passes it; `color-luminance()` approximates the power 2.4 and passes pairs the exact formula fails (`#116666` on `#0a0a0a`: 3.01:1 against 2.94:1).
- axe-core 4.13.0 has no rule for non-text contrast (1.4.11), checks neither placeholder text nor borders, marks one-character badges and text over images incomplete, and sees only the states and palette entries a page renders: a slider fill at 1.31:1, a switch track at 1.625:1, Top Bar links at 3.76:1, a hover colour, or a `purple` palette entry no story shows all pass it.
- A consumer setting can break a guarantee a Library mixin makes: a menu padding of `0.2rem 1rem` gives 22.4 px rows (2.5.8), a fixed `$dropdown-width` over 160 px leaves a pane no fitting side at 320 CSS px (1.4.10), a stacked table on Foundation's default `$show-header-for-stacked` loses its column headers (1.3.1), and a renamed `$maincontent-class` leaves the Off-canvas push rules without an element.
- The library's story gate compiles only the library's own settings ([ADR 0022](../adr/0022-wcag-2-2-aa-enforcement.md)), so a consumer's failing theme ships.

The Variant declaration file has the same gap in CI: Nx runs no task sync generator when `CI` is set, so a build against a stale file passes and ships a Variant with no class; a hand-written file with no `import` silently replaces the library's types; and a stylesheet that forgot `@import 'ngx-foundation-sites';` looks like a typing bug.

The specs answer both with build-time checks: `@error` and `@warn` checks in the Library mixins, computed with the exact WCAG formula, and the Variant declaration tooling's check mode in CI. The user ruled that every check is specified but planned and implemented in a later milestone of the implementing repository. In the user's words: "The reason I include so many different types of check is that I want to analyze how each works in practice and evaluate trade-offs. However, all checks should be deferred to a later milestone because at the core of it, this is an issue Angular should correct, not 3rd-party Angular component libraries"; "I want to keep the initial milestone simpler and smaller in scope"; and, asked which kinds to defer, the user chose all four offered, Sass compile checks among them, and then the Variant declaration tooling's CI sync check too. WCAG's conformance requirements bind the consumer's pages, not the library's diagnostics, and ATAG's checking criteria are for authoring tools, which a component library is not (the ruling's What was weighed).

So in the first milestone each spec states every rule a check enforced as documented usage (the required settings in its Sass subsection), the library's own stories prove its components pass with those settings, the Variant declaration tooling writes and rewrites the file but has no check mode, and a consumer who keeps a failing default gets no compile-time signal. This spec holds the whole design, per component, so that the later milestone loses nothing and can weigh the build-time checks against the other four kinds (forgotten-import checks, family checks, misuse warnings, and Runtime checks) in practice, as the user wants.

## Solution

When the later milestone lands, the library adds five things, all at build or CI time and none at run time:

- Library mixin checks: each Library mixin checks the consumer's settings in the consumer's own compile, stopping it with `@error` or reporting with `@warn`, naming the setting to change, computed with the exact WCAG relative-luminance formula through the one library-internal contrast helper, unrounded. A check emits no CSS and runs only when the consumer includes its mixin. They cover text contrast (1.4.3), non-text contrast (1.4.11), use of colour (1.4.1), focus visible (2.4.7), target size (2.5.8), reflow (1.4.10), info and relationships (1.3.1), and three setting and name rules.
- Checks-only Library mixins: `nfs-abide`, `nfs-forms`, `nfs-title-bar`, `nfs-top-bar`, and `nfs-typography-base`, which hold only checks and so exist only in this milestone.
- The Sass import-order guard: importing `ngx-foundation-sites` before Foundation stops the compile with "@import Foundation (or its util/util) before ngx-foundation-sites."
- Presence markers: the custom properties that only the Runtime checks read: the flag-gated properties in the Variant property format that the Button's, the Flexbox Utilities', the Media Object's, and the Prototyping Utilities' Library mixins write, and the Breakpoint properties `--nfs-breakpoint-<name>` that `nfs-breakpoint-properties` writes.
- The Variant declaration tooling's check mode: the Architect builder's `check` option and the `check` configuration on every `nfs-variants` target, `nx sync:check` or `ng run <project>:nfs-variants:check` as a required CI step, the drift report, the report for a stylesheet with no Variant properties, and the checks of a hand-written file.

A consumer on Foundation's defaults then learns in their own compile, or in their own CI, which setting fails and by how much. If the first milestone has been published, each new compile stop follows the release policy (Rollout, below).

## User Stories

1. As an application developer on Foundation's default palette, I want `@include nfs-button;` to stop my compile naming `$button-palette` and each failing entry, so that I never ship an alert button at 4.498:1.
2. As an application developer, I want every ratio compared unrounded with the exact WCAG formula, so that a pair Foundation's `color-contrast()` rounds to 4.5 or Foundation's `color-luminance()` overstates still fails.
3. As an application developer, I want one message that lists every failing pair of a mixin, each with its setting, colour, background, and ratio, so that I fix my theme in one pass.
4. As an application developer, I want each message to name the setting I must change, so that the fix is obvious from the compile output.
5. As an application developer, I want the checks to cover what axe cannot see (non-text contrast, placeholders and borders, hover and focus states, palette entries no page renders yet), so that my own theme is checked, not only the library's stories.
6. As an application developer, I want a mixin's checks to run only when I include that mixin, so that an application with a title bar and no Top Bar is not stopped by the Top Bar's link check.
7. As an application developer, I want the checks to emit no CSS, so that they cost my users nothing.
8. As an application developer, I want a warning rather than an error for a pair that exists only in a placement I may not use (a Dropdown Menu inside a Top Bar, the dark menu icon on a dark page, a menu icon on the Top Bar), so that my build is not stopped for markup I never write.
9. As an application developer, I want a warning for a decorative arrow colour, a dialog edge, or optional inner-label text, so that a deliberate choice does not stop my build.
10. As a forms developer, I want placeholder text, field boundaries, the focus border of a select, and the select arrow checked, so that the fields axe never measures still reach their ratios.
11. As an Abide developer, I want the invalid state's text, placeholder, border, and focus border checked, so that my error colours pass as well as my resting fields.
12. As an application developer on a dark page, I want the focus ring of switches and sliders checked against my page background, so that a focused control never loses its indicator.
13. As a menu developer, I want the current link's fill checked against every background of every menu mode I include, so that the current page stays visible in submenus and bars.
14. As a menu developer, I want a Hybrid toggle or a row under 24 px to stop my compile, so that a small padding setting never ships targets under 2.5.8.
15. As an application developer, I want a warning when a dropdown pane or submenu width cannot fit a 320 CSS px page, naming the `min(<width>, 45vw)` form, so that my menus reflow.
16. As an Off-canvas developer, I want a renamed `$maincontent-class` to stop my compile, so that the push and reveal rules never lose their element in silence.
17. As a table developer, I want Foundation's default stacked table without headers to stop my compile, so that stacked rows keep their column names.
18. As a pagination developer, I want a warning when a setting I turned on has no effect on the library's markup, so that I do not expect a look that never comes.
19. As a Responsive Toggle developer, I want an unknown or Zero breakpoint name in `nfs-responsive-toggle` to stop my compile, so that I never emit a Visibility class pair that hides the bar at every width.
20. As an Orbit developer, I want the caption and arrow bands checked over both the lightest and the darkest image, so that the caption stays readable on any slide.
21. As an application developer, I want each container that paints its own background (Callout, Card, Table, Reveal, Off-canvas, Top Bar) to check the close-button glyph and the links on it, so that a colour that passes on the page does not fail inside it.
22. As an application developer, I want the typography greys checked against the page, so that subheaders, citations, blockquotes, and heading `small` text reach 4.5:1.
23. As an application developer who imports the library before Foundation, I want a compile error that names the order, so that I do not debug undefined settings.
24. As a CI maintainer on Nx, I want `nx sync:check` as a required step that fails when any Variant declaration file is out of step, naming the file, the project, the stylesheet, and the exact names that differ, so that drift never reaches the main branch.
25. As a CI maintainer on the Angular CLI, I want `ng run <project>:nfs-variants:check` to fail the same way without Nx, so that the guarantee holds on both workspace kinds.
26. As a CI maintainer, I want the check never to write a file, so that CI reports drift instead of hiding it.
27. As an application developer who writes the declaration file by hand, I want CI to check it against the Sass just the same and never overwrite it, listing the edits to make, so that I keep control.
28. As an application developer, I want a check failure when my hand-written file has no `import`, declares a registry the library does not have, or has a member the tooling cannot read, so that the ambient-module trap and typos are caught.
29. As an application developer, I want the tooling to tell me when my stylesheet has no Variant properties at all, naming the import and the includes to add, so that a missing `@import 'ngx-foundation-sites';` does not look like a typing bug.
30. As an application developer, I want the setup generator to name the CI step, so that I know what to add.
31. As an application developer upgrading the library, I want the next check to report every registry and default change, so that an upgrade never leaves my file silently out of step.
32. As an application developer upgrading within an Angular major, I want no new compile stop in a minor release, so that a routine update never breaks my build.
33. As a Runtime checks implementer, I want each flag-gated family to have a presence marker in the compiled CSS, so that a responsive value while its flag is off can be told from a missing include.
34. As a library maintainer, I want every check's Sass compile test to pin the exact helper against Foundation's approximations, so that a helper regression is caught.
35. As a library maintainer, I want the library's Storybook preview to compile under every check through its settings overrides, so that the stories keep proving the required settings.
36. As a library maintainer planning the later milestone, I want every build-time check's trigger, message, cost, and tests in one spec, so that nothing is lost between the milestones.
37. As a library maintainer, I want the build-time checks specified next to the other four kinds, so that I can weigh them against each other in practice.
38. As a spec author re-running a component spec for the later milestone, I want a per-spec list of what to add back, so that the re-run is mechanical.
39. As an application developer on the first milestone, I want each spec's required settings stated as documented usage, so that I can meet WCAG 2.2 AA without the checks.
40. As a library maintainer, I want the checks to reuse the one contrast helper the first milestone already ships for its CSS rules, so that the milestones do not compute ratios two ways.

## Implementation Decisions

### What the later milestone adds, and what the first milestone keeps

The later milestone adds every check listed under The checks, per component spec, the checks-only Library mixins, the import-order guard (G1), the presence markers (P1 to P5), and the tooling's check mode (variant-declaration-tooling/1).

The first milestone keeps, by the ruling's items 3 and 4: every Library mixin's CSS rules and its Variant properties, which the tooling's generate mode reads; the library-internal exact contrast helper, because three CSS rules use it (the Badge's and the Label's text-colour correction, Badge D9 and Label D9, and the Progress Bar's meter text, Progress Bar D8); every required setting, stated as documented usage in its spec's Sass subsection; the library's Storybook settings overrides, every story, play function, contrast assertion, and the Accessibility gate; and the tooling's generate mode (the setup generator, the sync generator's rewrite, and the builder's write mode).

### Foundation contract

Foundation 6.9's Sass has no accessibility check. What the checks work around:

| Foundation function or behaviour | What it does | Consequence for the checks |
| --- | --- | --- |
| `color-luminance()` | Raises to the power 2.4 through Foundation's approximate `pow()` and `nth-root()` | Overstates some ratios: 26 false passes in a 16-step colour grid against `#fefefe` and `#0a0a0a` (measured by the Top Bar ticket); never used |
| `color-contrast()` | Rounds the ratio to one decimal | Passes 4.498:1 as 4.5 and 2.95:1 as 3.0; never used |
| `color-pick-contrast()` | Compares approximate, rounded ratios, keeps the first candidate on a tie, ignores alpha | Can pick the failing candidate while the other passes; a check reads the colour it picked, as Foundation emits it (S10) |
| `get-border-value()`, `rem-calc()`, `smart-scale()` | Read a border shorthand's colour, convert to rem, scale a colour | Reused by the checks, never copied |
| `breakpoint()` warns on an unknown name; `$breakpoints` whose first value is not 0 stops with `@error`; deprecated settings warn | Foundation's own messages | The library's checks add to them and silence none |

### Hierarchy and package shape

```
ngx-foundation-sites  (_index.scss at the package root, reached through the `sass` export condition; ADR 0012)
  G1  the import-order guard, at import
  -nfs- contrast helper (first milestone; the checks reuse it)
  nfs-<entry point> Library mixins      + their @error and @warn checks, which emit no CSS
  checks-only Library mixins            nfs-abide, nfs-forms, nfs-title-bar, nfs-top-bar, nfs-typography-base
  presence markers (P1 to P5)           :root properties only the Runtime checks read, not in the Variant manifest

Workspace tooling (Node, CommonJS; Spec: Variant declaration tooling)
  builder ngx-foundation-sites:variant-types      + the `check` option
  setup generator ngx-foundation-sites:variant-types   + the `check` configuration on each target it adds, + M13's CI line
  CI                                               nx sync:check, or ng run <project>:nfs-variants:check
```

### Shared mechanisms

Where two components' checks share a mechanism, it is said once here, and each component's entry points back.

#### S1. The exact ratio

Every contrast ratio a check compares is computed with the exact WCAG 2.2 relative-luminance formula by one library-internal Sass helper with `math.pow`, which composites a translucent colour over `$body-background` first, and is compared unrounded; never Foundation's `color-luminance()` or `color-contrast()` (building-blocks 1.10; the architecture guide's P17; [ADR 0022](../adr/0022-wcag-2-2-aa-enforcement.md), dated note of 2026-09-28). A translucent colour painted over an image rather than the page (the Orbit's caption and arrow bands) is composited with Sass `mix()` over `#fff` and over `#000`, the lightest and darkest colours an image can hold, before the helper compares it (Orbit D17). Where axe has no rule, the Library mixin checks at compile time; each directive also owns the compile-time check its documented markup lacks for WCAG 2.2 AA ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)). The helper itself ships in the first milestone (What the later milestone adds, above), where only the specs whose CSS rules use it name it; every other spec regains its mention with its checks.

#### S2. Where a check lives

- One Library mixin per Foundation export mixin, named after it and included after it, so each check runs only for a component the consumer compiles ([ADR 0012](../adr/0012-sass-packaging.md), dated note of 2026-09-28; Top Bar D7). Whether an entry point with several export mixins keeps one mixin per export mixin is T9 of [Audit: the specs against the architecture guide](../issues/142-audit-specs-against-architecture-guide.md), which stays OPEN FOR HUMAN; this spec follows the rule as recorded.
- A component that needs custom CSS or compile-time checks gets a Library mixin; one whose only Sass is a check gets a checks-only mixin that emits no CSS ([ADR 0012](../adr/0012-sass-packaging.md), dated note of 2026-09-27; building-blocks 1.10; the Abide precedent of [ADR 0022](../adr/0022-wcag-2-2-aa-enforcement.md)). Such a mixin exists only in this milestone.
- Target size and non-text contrast are guaranteed by the Library mixin where Foundation's settings can fail them: a `max(24px, <setting>)` floor (a CSS rule, first milestone) or a compile-time `@error` on sizes (the menu mixins stop the compile on toggle sizes and row heights), and a compile-time `@error` with the exact unrounded ratio for colour pairs that carry state (building-blocks 1.10).

#### S3. Error or warning

Each check keeps the severity its spec gave it. The reasons the specs give:

- `@error` for a pair the component always draws or that carries state, where a consumer on Foundation's defaults would otherwise ship a failure (building-blocks 1.10; Top Bar D8; Button D16; Callout D7; Card D8; Badge D10; Label D9; Pagination D8; Progress Bar D9; Typography Helpers D9; Tabs D26; Forms D11, which rejected the earlier `@warn` because a consumer scrolls past it).
- `@warn` for a pair that exists only in a placement the consumer may not use (Dropdown Menu D14; Top Bar D8), for a colour that may be decoration (Prototyping Utilities D17), for a pair that carries no state (Reveal D19), for optional content (Switch D11, inner labels), for a width the mixin cannot know is used at 320 CSS px (Dropdown D22, Dropdown Menu D13, Off-canvas's Zero-breakpoint size), for a setting that has no effect (Pagination D9), and for the Accordion's and the Off-canvas links' pairs (Accordion D19, Off-canvas D21), as their specs chose.

#### S4. Messages and cost

- Every message names the setting to change. A mixin that lists pairs does so in one message, each pair with its setting, its colour, the background, and the ratio, so a theme is fixed in one pass (Callout D7); the specs name, per mixin, whether it reports one message or one per check.
- A ratio is written with enough decimals to stay below its threshold (4.498:1, never 4.50:1), as building-blocks 1.10 asks of every spec.
- Cost: none outside the compile. A check emits no CSS, and a checks-only mixin emits nothing; a check runs once per compile of a stylesheet that includes its mixin.

#### S5. A container checks what sits on its own backgrounds

The Close Button checks its glyph against the page, and every container that paints its own background under a close button or links checks the same settings against that background (Close Button D9; Callout D7; Card D8):

- the close-button glyph, `$closebutton-color` and `$closebutton-color-hover` at 3:1: close-button/1 (`$body-background`), callout/1 (every callout background), off-canvas/1 (`$offcanvas-background`), reveal/1 (`$reveal-background`);
- links, `$anchor-color` and `$anchor-color-hover` at 4.5:1: callout/1, card/1, table/1, off-canvas/2 (`@warn`), top-bar/1 (the bar and its submenus); a Dropdown Menu inside a Top Bar warns only for the pairs it adds to the bar (dropdown-menu/5).

#### S6. The focus border

`$input-border-focus`, Foundation's one focus setting for form controls, is checked where a Library mixin or Foundation draws a focus indicator from it: forms/1 (against the page and the focus background, and 3:1 from the resting border), abide/1 (3:1 from `$input-background-invalid`), switch/1 and slider/1 (against `$body-background`, the rings their mixins draw).

#### S7. The current link's fill

`$menu-item-background-active`, the current link's fill that `nfs-menu` draws from `aria-current`, is checked at 3:1 (1.4.1) against each background it can sit on: menu/1 (`$body-background`), accordion-menu/1, drilldown-menu/3, and dropdown-menu/2 (each mode's non-`null` backgrounds, the Nested menu's rule nested-menu/1), and top-bar/1 (the bar and its submenus).

#### S8. Menu arrows, the Hybrid toggle, and row height

The Nested menu spec states one rule for its three mode mixins, arrows at 3:1 against every background they sit on (nested-menu/2) and the Hybrid toggle and every row at 24 px (nested-menu/3), and each root spec states its own mixin's pairs: accordion-menu/1, drilldown-menu/1 and /2, dropdown-menu/1 and /3. menu/1 checks the simple menu's row height from `$menu-items-padding`.

#### S9. Widths at 320 CSS px

A fixed width that can leave no fitting side at 320 CSS px warns, naming the setting and the `min(<width>, 45vw)` form where one exists: dropdown/1 (`$dropdown-width`, `$dropdown-sizes`), dropdown-menu/4 (`$dropdownmenu-min-width`), off-canvas/3 (the Zero-breakpoint `$offcanvas-sizes` entry), and top-bar/1 (`$topbar-unstack-breakpoint` at the Zero breakpoint).

#### S10. Foundation's picked text colour

A text colour Foundation picks with `color-pick-contrast()` is checked as Foundation emits it (building-blocks 1.10): button/1 (checked and not corrected; the error names the better candidate, Button D23), callout/1, menu/1, orbit/2, tabs/1 (the `primary` bar). badge/1 and label/1 check the better candidate after the first milestone's correcting rule gives it, and progress-bar/1 checks the meter text after the first milestone's meter-text rule picks it.

### The checks, per component spec

Each entry gives the check's id, its mixin, its trigger and message, its tests (the check cases of its spec's node-level Sass compile test; the same bullets' CSS-output assertions stay with the component spec), the design decisions it rests on, and what the first milestone keeps as documented usage.

#### Abide

[Spec: Abide](../issues/31-spec-abide.md); `nfs-abide`, checks-only (S2).

**abide/1**, the invalid state. Checks, each an `@error` that names the setting to change; border colours are read from the shorthands with Foundation's `get-border-value()`:

- `$input-error-color` and `$form-label-color-invalid` against `$body-background`, at least 4.5:1 (1.4.3, the error text and the invalid label);
- `$input-background-invalid` against the invalid tint Foundation's `form-input-error` mixin paints, `mix($input-background-invalid, $white, 10%)` at that mixin's default, at least 4.5:1 (1.4.3, the invalid placeholder), and against `$body-background`, at least 3:1 (1.4.11, the invalid border);
- the `$input-border-focus` colour against `$input-background-invalid`, at least 3:1 (1.4.1 and 2.4.7: `form-input-error` applies only while the field is not focused, so focusing an invalid select, which has no caret, swaps the invalid border for the focus border, and the swap must be more than a change of hue; D21; S6).

No `@warn` remains: the resting pairs are `nfs-forms`'s (forms/1). An Abide form includes both `nfs-forms` and `nfs-abide`, and `nfs-abide` does not include `nfs-forms`, so each check runs once (D22). The mixin emits no CSS and writes no Variant property.

Tests: Foundation's default settings plus `@include nfs-abide;` stop with the `@error` naming `$input-error-color`, `$form-label-color-invalid`, `$input-background-invalid`, and `$input-border-focus` (1.31:1 from the invalid border); the three invalid-state values with Foundation's default focus border stop with the error naming `$input-border-focus` (1.54:1); the three invalid-state values with the Forms spec's `$input-border-focus: 1px solid $black` compile and emit no CSS, no `@error`, and no `@warn`, whatever `$input-placeholder-color` and `$input-border` are, because `nfs-abide` no longer checks the resting field; a pair at 4.498:1 fails although Foundation's rounding `color-contrast()` would report 4.5; an invalid colour 2.12:1 from the focus border (`#8b1a10` against `$black`) fails.

Decisions: D15 (no library CSS; the settings checked by a checks-only mixin, because axe checks neither placeholder text nor borders; not taken: a library colour override, the settings enforced only by the play function, the resting pairs kept as `@warn`), D21 (the focus border against the invalid background, `@error` because the pair carries state; not taken: no check, a library `select:focus` rule), D22 (both mixins included, neither calling the other).

First milestone: the required settings stay documented usage: `$input-error-color`, `$form-label-color-invalid`, and `$input-background-invalid` at `#bf3f2c`, and `$input-border-focus` at least 3:1 from `$input-background-invalid`; the `abide--invalid-state-contrast` story and its e2e repeat stay.

#### Accordion

[Spec: Accordion](../issues/15-spec-accordion.md); `nfs-accordion`.

**accordion/1**, text contrast. `@warn`, naming the setting to change, when the ratio of `$accordion-item-color` against `$accordion-background` or against `$accordion-item-background-hover`, or of `$accordion-content-color` against `$accordion-content-background`, is below 4.5 (1.4.3 for Foundation's 12 px title and body text), by the exact helper (S1). Foundation's default is 3.76:1 on hover and focus.

Tests: `nfs-accordion` compiled after Foundation with default settings emits one `@warn` for contrast; with `$accordion-item-color: scale-color($primary-color, $lightness: -15%)` it emits no warning.

Decisions: D19 (contrast fixed by a consumer setting plus a `@warn` from the unrounded ratio; not taken: a library colour rule overriding `$accordion-item-color`, a `@warn` from Foundation's `color-contrast()`).

First milestone: `$accordion-item-color: scale-color($primary-color, $lightness: -15%);` stays required; the Storybook settings carry it. The Responsive Accordion Tabs spec quotes this check for accordion mode.

#### Accordion Menu

[Spec: Accordion Menu](../issues/20-spec-accordion-menu.md); `nfs-accordion-menu` (S7, S8).

**accordion-menu/1**. Checks that emit no CSS, each an `@error` naming the setting:

- arrows (1.4.11): the ratio of `$accordionmenu-arrow-color` against `$accordionmenu-item-background`, or else `$body-background`, below 3 while `$accordionmenu-arrows` is on; and, when `$accordionmenu-submenu-toggle-background` is not `null`, against it below 3, whatever `$accordionmenu-arrows` says, because Foundation draws the Hybrid toggle's arrow unconditionally (D12);
- size (2.5.8): `$accordionmenu-submenu-toggle-width` or `$accordionmenu-submenu-toggle-height` below 24 px; `1rem` plus twice the first value of `$accordionmenu-padding` or `$accordionmenu-submenu-padding`, converted with `rem-calc()`, below `rem-calc(24)` (rows at line height 1; amended 2026-09-26, audit 0005 M1; D18);
- the current link's fill (1.4.1): `$menu-item-background-active` below 3:1 against `$accordionmenu-item-background` while that is not `null`, because Foundation's `.accordion-menu a` paints every link with it and the current link's rule (specificity 0,2,1) outranks that one (0,1,1); `nfs-menu` checks the fill against `$body-background` (menu/1).

Tests: `$accordionmenu-arrows: false` drops the parent-button arrow rules and keeps the toggle checks; an `$accordionmenu-arrow-color` below 3:1 on `$body-background`, an `$accordionmenu-submenu-toggle-background` below 3:1 with the arrow colour, a 20 px `$accordionmenu-submenu-toggle-width`, and an `$accordionmenu-padding` of `0.2rem 1rem` each stop the compile with an `@error` naming the setting; `$accordionmenu-arrow-color: #116666` on `$accordionmenu-item-background: #0a0a0a` stops the compile (2.94:1 exactly, 3.01:1 through Foundation's `color-luminance()`), which proves the exact helper is used; `$accordionmenu-item-background: $primary-color` with `$accordionmenu-arrows: false` stops the compile naming the 1.4.1 check (`$menu-item-background-active` at 1:1; with the arrows on, the arrow check fails on the same pair), and the default `null` item background skips that check. The Nested menu's cases apply too (nested-menu/1 to /3).

Decisions: D12 (the arrow against the Hybrid toggle's own background, not gated on `$accordionmenu-arrows`; not taken: checking only the item background), D18 (a row-height compile check beside the arrow and toggle checks, because row height is a consumer setting the story gate never sees; not taken: relying on the story gate's `target-size` rule).

First milestone: the rules stay documented usage: the arrow colour, the toggle background, and the current fill at their ratios; the toggle and every padding-derived row at 24 px or more.

#### Badge

[Spec: Badge](../issues/93-spec-badge.md); `nfs-badge` (S10).

**badge/1**, text contrast. One `@error` listing every failing pair, each with the setting, the palette name, the colour, and both ratios, by the exact helper: `$badge-color` on `$badge-background` under 4.5:1, and every `$badge-palette` entry whose better candidate (of `$badge-color` and `$badge-color-alt`, by the exact ratio) is under 4.5:1 (1.4.3). The Badge spec's Sass item 1(c) labels the check "D8", a label whose row in its table is the live-role decision; the check's reasons are D9's and D10's.

Tests: Foundation's defaults plus `@include nfs-badge;` stop with one `@error` naming `$badge-palette` alert `#cc4b37` with `$badge-color` at 4.498:1 and `$badge-color-alt` at 4.364:1; `$foundation-palette: map-merge($foundation-palette, (alert: #bf3f2c));` alone in the overrides file still stops the compile naming `#cc4b37`, because the settings file assigned `$badge-palette` before it (D10); an entry `#777777` stops the compile (4.440 and 4.421:1), and so does `#1177dd` (4.424 and 4.437:1), which Foundation's `color-luminance()` reports as 4.505:1 with `$black`, so the test pins the exact helper; `$badge-background: #ffae00` with the default `$badge-color` stops the compile naming `$badge-color` on `$badge-background` at 1.84:1, and with `$badge-color: $black` it compiles.

Decisions: D9 (the correcting rule, first milestone, and the check over the better candidate; not taken: check only), D10 (the required setting; not taken: the `$foundation-palette` line alone, a library rule recolouring `.badge.alert`, `@warn`, because a consumer on Foundation's defaults would ship failing text axe cannot see).

First milestone: `$badge-palette: map-merge($foundation-palette, (alert: #bf3f2c));` stays required; the correcting rule and `--nfs-badge-palette` stay.

#### Breadcrumbs

[Spec: Breadcrumbs](../issues/88-spec-breadcrumbs.md); `nfs-breadcrumbs`.

**breadcrumbs/1**, text contrast. One `@error` listing every failing colour with its setting and its exact unrounded ratio (a translucent colour composited over `$body-background` first): `$breadcrumbs-item-color`, `$breadcrumbs-item-color-current`, and `$breadcrumbs-item-color-disabled` on `$body-background` under 4.5:1 (1.4.3). A disabled step is text, not an inactive control, so the exemption does not apply. Over Foundation 6.9.0's defaults: 4.6473, 19.6304, and 1.6252:1, so the compile stops on the disabled colour until the required setting is made.

Tests: Foundation's defaults plus `@include nfs-breadcrumbs;` stop with one `@error` naming `$breadcrumbs-item-color-disabled` `#cacaca` on `$body-background` `#fefefe` at 1.625:1; `$breadcrumbs-item-color: #1177dd` stops the compile at 4.423:1 (4.357:1 by Foundation's `color-luminance()`); `$breadcrumbs-item-color-current: $dark-gray` stops it at 3.422:1; a translucent `$breadcrumbs-item-color-disabled: rgba(#0a0a0a, 0.5)` is composited over `$body-background` first and stops it at 3.708:1.

Decisions: D9 (link, current, and disabled text at 4.5:1 on the page; no 1.4.1 pair check, because the current page is also the last step and a disabled step is text; not taken: the Pagination's 1.4.1 check, a check of the separator colour), D5 (the disabled step is text, so 1.4.3 applies).

First milestone: `$breadcrumbs-item-color-disabled: #737373;` stays required.

#### Button

[Spec: Button](../issues/37-spec-button.md); `nfs-button` (S10; presence marker P1).

**button/1**, label, arrow, and disabled contrast. The mixin checks every pair at compile time and stops with `@error` naming the setting and the fill, unrounded (D16):

- label contrast, 4.5:1 for every pair: no button label is large text (`.large` is 20 px at normal weight), so 4.5:1 applies at every size; disabled buttons are exempt as inactive components (1.4.3);
- the dropdown arrow at 3:1, each arrow colour computed from Foundation's rules under the consumer's `$button-fill` (1.4.11);
- the enabled and disabled lightness difference, computed from `$button-opacity-disabled`, stopping when neither reaches 3:1 (1.4.1).

Foundation's `color-pick-contrast()` label colour is checked as emitted and not corrected, and the error names the better candidate (D23). The Button Group has no check of its own: every label and arrow pair in a group is one `nfs-button` checks (Button Group D13).

Tests: `@include nfs-button;` over Foundation's defaults fails with `@error` naming `alert` (solid, hollow, clear), `success` (hollow, clear, and the solid arrow), and `warning` (the same); with the required `$button-palette` it compiles; `$button-fill: hollow` with the required palette compiles; `$button-opacity-disabled: 0.6` with the required palette fails the 1.4.1 check; a `$button-background` whose pair with `$button-color` is 4.49:1 fails although Foundation's `color-contrast()` reports 4.5.

Decisions: D16 (not taken: a docs recommendation; `@warn`, because a consumer on Foundation's defaults would ship failing `.alert` buttons; Foundation's `color-contrast()`), D23 (the pick checked, not corrected; not taken: a correcting rule per entry), D17 (the required palette).

First milestone: `$button-palette: map-merge($foundation-palette, ('alert': #bf3f2c, 'success': #177a3d, 'warning': #8a5a00));` stays required; the 24 px floor, the solid-arrow rule of D18, and the two registry Variant properties stay.

#### Callout

[Spec: Callout](../issues/89-spec-callout.md); `nfs-callout` (S5, S10).

**callout/1**, text, link, and glyph contrast on every callout background. One `@error` listing every pair under 4.5:1 (the text colour Foundation's `color-pick-contrast()` picks for each background, `$anchor-color`, `$anchor-color-hover`; Foundation's `a:hover, a:focus` rule uses the hover colour) or under 3:1 (`$closebutton-color`, `$closebutton-color-hover`, the glyph at rest and on hover and focus) against `$callout-background` and every `$foundation-palette` colour through `scale-color($color, $lightness: $callout-background-fade)`, each with the setting, the palette name, and the ratio, unrounded (D7; 1.4.3, 1.4.11). No mixin parameter skips a check (D15).

Tests: Foundation's defaults plus `@include nfs-callout;` stop with one `@error` naming `$anchor-color` on primary, secondary, success, warning, and alert and `$closebutton-color` on primary, secondary, and alert, each with its ratio; a palette merged with `purple` lists `purple` and checks it: with `purple: #4b0082` and the required settings the compile stops naming `$anchor-color` on purple (4.02:1; `#5b2a86` passes at 4.51:1); `$callout-background-fade: 0%` stops the compile naming, among others, the text on alert (4.498:1), which Foundation's `color-contrast()` would round to 4.5.

Decisions: D7 (a container checks what sits on its own backgrounds; one message lists every failure so a theme is fixed in one pass; not taken: checks only for the palette names a story uses, `@warn`, Foundation's `color-contrast()`), D8 (the required settings), D15 (no skipping parameter in the first release of the checks; `nfs-callout($closable: false, $links: false)` is the recorded upgrade path, additive later).

First milestone: `$anchor-color: scale-color($primary-color, $lightness: -15%);` and `$closebutton-color: #767676;` stay required; the room rules for a close button and the two Variant properties stay.

#### Card

[Spec: Card](../issues/90-spec-card.md); `nfs-card` (S5).

**card/1**, text and link contrast. One `@error` listing every pair under 4.5:1, each with the setting, its colour, the background setting, its colour, and the ratio, by the exact helper: `$card-font-color`, `$anchor-color`, and `$anchor-color-hover`, each against `$card-background` composited over `$body-background` and against `$card-divider-background` composited over that card background (1.4.3; D8).

Tests: Foundation's defaults plus `@include nfs-card;` stop with one `@error` naming `$anchor-color` `#1779ba` on `$card-divider-background` `#e6e6e6` at 3.755:1, and no other pair; the `$anchor-color` line alone compiles, because Foundation's hover colour passes on both backgrounds; `$card-divider-background: $white;` alone compiles (4.647:1); with the required setting, `$card-background: $dark-gray;` stops naming `$anchor-color` (1.756:1) and `$anchor-color-hover` (2.191:1) on `$card-background`, and not `$card-font-color`, which passes; with the required setting, `$card-divider-background: rgba(#1779ba, 0.3);` is composited over the card background and stops naming `$anchor-color` at 4.004:1, and `rgba(#0a0a0a, 0.1)` compiles.

Decisions: D8 (not taken: `@warn`; checking the divider only; a mixin parameter that skips the link check, additive later as the Callout's D15), D9 (the Callout's `$anchor-color` as the required setting).

First milestone: the Callout's `$anchor-color` line stays required; `.card { overflow-wrap: anywhere; }` stays.

#### Close Button

[Spec: Close Button](../issues/83-spec-close-button.md); `nfs-close-button` (S5).

**close-button/1**, the glyph on the page. `@error` naming the setting when the unrounded ratio of `$closebutton-color`, or of `$closebutton-color-hover`, against `$body-background` is under 3 (1.4.11), the surface wherever no container paints one. A container that paints its own background under the button checks the same two settings against it in its own Library mixin (callout/1, off-canvas/1, reveal/1). Foundation's defaults pass on the page.

Tests: `$closebutton-color: #aaaaaa` stops the compile naming `$closebutton-color` (2.30:1).

Decisions: D9 (containers check their own backgrounds, because the close button does not know its container and the container does; not taken: one check in `nfs-close-button` against every container's background, which would need every container's settings and include order; no check).

First milestone: the 24 px floor and `--nfs-closebutton-size` stay; a container's required `$closebutton-color` stays in that container's spec.

#### Drilldown Menu

[Spec: Drilldown Menu](../issues/22-spec-drilldown-menu.md); `nfs-drilldown` (S7, S8).

**drilldown-menu/1**, arrows (1.4.11). `@error` naming the setting when the exact, unrounded ratio of `$drilldown-arrow-color` against `$drilldown-background` or `$drilldown-submenu-background` is below 3, and the same for `$dropdownmenu-arrow-color`, which Foundation uses for the `.align-left` and `.align-right` twins (both only while `$drilldown-arrows`); and when the ratio of `$accordionmenu-arrow-color`, the Hybrid toggle's arrow, against `$accordionmenu-submenu-toggle-background` (when not `null`), else against `$body-background` and `$drilldown-submenu-background`, is below 3, whatever `$drilldown-arrows` says, because Foundation draws the Hybrid toggle's arrow unconditionally. With defaults `$primary-color` on white is 4.65:1.

**drilldown-menu/2**, the toggle and row size (2.5.8). `@error` when `$accordionmenu-submenu-toggle-width` or `$accordionmenu-submenu-toggle-height` is below 24 px (the Hybrid item's toggle, 40 by 40 px on defaults), or when `1rem` plus twice the first value of `$drilldown-padding` or `$drilldown-submenu-padding`, converted with `rem-calc()`, is below `rem-calc(24)` (rows at line height 1; 38 px with Foundation's `$drilldown-padding`).

**drilldown-menu/3**, the current link's fill (1.4.1). `@error` when `$menu-item-background-active` is below 3:1, exact and unrounded, against `$drilldown-background` or `$drilldown-submenu-background`, each where it is not `null`; `nfs-menu` checks `$body-background` (menu/1; the Nested menu spec's D32). 4.65:1 with Foundation's defaults.

Tests: a `$drilldown-arrow-color` below 3:1 on white, one at 2.95:1 (which Foundation's rounding `color-contrast()` would pass), `$drilldown-arrow-color: #116666` on `$drilldown-background: #0a0a0a` (2.94:1 exactly, 3.01:1 through Foundation's `color-luminance()`), a `$dropdownmenu-arrow-color` below 3:1, an `$accordionmenu-arrow-color` below 3:1 with `$drilldown-arrows: false`, a 20 px `$accordionmenu-submenu-toggle-width`, and a `$drilldown-padding` of `0.2rem 1rem` each stop the compile naming the setting; `$menu-item-background-active: #f0f0f0` (1.13:1 against the default drilldown backgrounds) stops it naming the 1.4.1 check. The Nested menu's cases apply too.

Decisions: D20 (a row-height compile check beside the arrow and toggle checks; not taken: relying on the story gate), D30 (every ratio by the exact helper, and the fill check; not taken: Foundation's `color-luminance()`, no fill check, which would let a dark level background lose the current look in silence).

First milestone: the rules stay documented usage: the three arrow colours at 3:1 against the backgrounds they are drawn on, the toggle and every row at 24 px or more, and the fill at 3:1 against both level backgrounds where set.

#### Dropdown

[Spec: Dropdown](../issues/26-spec-dropdown.md); `nfs-dropdown-pane` (S9).

**dropdown/1**, the pane width at 320 CSS px (1.4.10). One compile-time check that emits nothing: `@warn` when `$dropdown-width` or a value in `$dropdown-sizes` is a fixed `px` or `rem` length wider than 160px (`rem-calc()` above 10rem), naming the setting and the required `min(<width>, 45vw)` form. A pane no wider than half the page fits from any Trigger, because the Positioner's search tries left and right alignment and never shifts or shrinks a pane.

Tests: the mixin warns for the default `$dropdown-width: 300px`, for `small: 200px`, and for a fixed-width custom size, and stays silent for the required `min()` settings and for fixed widths up to 160 px.

Decisions: D22 (1.4.10 met by required Foundation settings with a compile-time warning and no CSS rule; not taken: a library `max-width` rule, which does not fix a pane anchored mid-page; leaving sizing as advice).

First milestone: `$dropdown-width: min(300px, 45vw);` and `$dropdown-sizes: (tiny: 100px, small: min(200px, 45vw), large: min(400px, 45vw));` stay required; `--nfs-dropdown-sizes` stays the mixin's only output.

#### Dropdown Menu

[Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md); `nfs-dropdown-menu` (S5, S7, S8, S9).

**dropdown-menu/1**, arrows (1.4.11). `@error` naming the setting when the exact ratio of `$dropdownmenu-arrow-color` is below 3 against `$dropdownmenu-background` or else `$body-background`, and against `$dropdownmenu-submenu-background` (only while `$dropdownmenu-arrows` is on), and when `$accordionmenu-arrow-color` is below 3 against `$accordionmenu-submenu-toggle-background` where set, or else those same backgrounds (the Hybrid toggle's arrow, which Foundation draws whatever `$dropdownmenu-arrows` says). Against the Top Bar's backgrounds both arrows are `@warn`s (dropdown-menu/5). Foundation's defaults pass: 4.65:1 on white and 3.76:1 on the default Top Bar.

**dropdown-menu/2**, the current link's fill (1.4.1). `@error` when `$menu-item-background-active` is under 3:1 against `$dropdownmenu-submenu-background` and, where it is not `null`, `$dropdownmenu-background`, on which the mixin's rule (e) keeps the fill (D21); `nfs-menu` checks `$body-background` (menu/1). 4.65:1 on Foundation's defaults.

**dropdown-menu/3**, the toggle and row size (2.5.8). `@error` when either toggle setting is below 24 px, or when a row (`1rem` plus twice the first value of `$dropdownmenu-padding` or `$dropdownmenu-submenu-padding`, through Foundation's `rem-calc()`) is below 24 px, because row height is a consumer setting and a small padding gives stacked submenu rows under 24 px, where the spacing exception does not apply. 38 px rows and a 40 px toggle on Foundation's defaults.

**dropdown-menu/4**, the submenu width at 320 CSS px (1.4.10). `@warn` at compile time when `$dropdownmenu-min-width` is a fixed length over 160 px. A submenu no wider than half the page always fits one of Foundation's three sides. The Nested menu spec's WCAG row 1.4.10 quotes this check; it is taken once, here, from its owner.

**dropdown-menu/5**, the pairs a Dropdown Menu adds to a Top Bar (1.4.3, 1.4.11). `@warn`, since the mixin cannot know whether a Top Bar is used, when `$dropdown-menu-item-color-active` is below 4.5 against the bar backgrounds (`$topbar-background`, `$topbar-submenu-background`), and when either arrow colour is below 3 there. `nfs-top-bar` stops the compile for `$anchor-color` and the current link's fill (top-bar/1), so this mixin does not repeat them (D14).

Tests: `$dropdownmenu-arrows: false` drops the button-arrow rules and keeps the toggle checks; a `$dropdownmenu-arrow-color` below 3:1 on `$body-background` or on `$dropdownmenu-submenu-background`, an `$accordionmenu-arrow-color` below 3:1 on a set `$accordionmenu-submenu-toggle-background`, a 20 px `$accordionmenu-submenu-toggle-width`, and a `$dropdownmenu-padding` of `0.2rem 1rem` each stop the compile with an `@error` naming the setting; `$dropdownmenu-background: #2a8ad0` with `$dropdownmenu-arrows: false` and `$accordionmenu-submenu-toggle-background: $white` stops it naming the 1.4.1 check of `$menu-item-background-active` (1.26:1; the settings leave no arrow on that background, because on Foundation's defaults every arrow colour equals the fill and an arrow check would fire first); `$dropdownmenu-background: $white` compiles; `$dropdownmenu-arrow-color: #116666` with `$dropdownmenu-submenu-background: #0a0a0a` stops the compile (2.94:1 exactly, 3.01:1 through Foundation's `color-luminance()`), which proves the exact-luminance helper; the default `$dropdownmenu-min-width: 200px` warns and `min(200px, 45vw)` and `160px` do not; the default `$topbar-background` warns naming `$dropdown-menu-item-color-active` (3.76:1) and not `$anchor-color` (`nfs-top-bar`'s error), and `$topbar-background: $white` with `$topbar-submenu-background: $topbar-background` warns nothing. The Nested menu's cases apply too.

Decisions: D13 (`min(200px, 45vw)` required with a compile-time `@warn`; not taken: a library `max-width` rule, leaving 1.4.10 as advice), D14 (inside a Top Bar the Dropdown Menu warns for its own pairs only; not taken: `@error` in `nfs-dropdown-menu`, which breaks consumers without a Top Bar; repeating `nfs-top-bar`'s `$anchor-color` pair as a warning), D19 (a row-height compile check), D21 (the fill check against a set `$dropdownmenu-background`).

First milestone: `$dropdownmenu-min-width: min(200px, 45vw);` stays required, as do, inside a Top Bar, `$topbar-background: $white;` with `$topbar-submenu-background: $topbar-background;`; the arrow, fill, and size rules stay documented usage; rule (e) stays.

#### Forms

[Spec: Forms](../issues/98-spec-forms.md); `nfs-forms`, checks-only (S2, S6).

**forms/1**, the resting field. Five checks, each an `@error` that names the setting to change; border colours are read from the shorthands with Foundation's `get-border-value()`:

- `$input-placeholder-color` on `$input-background`, at least 4.5:1 (1.4.3);
- the `$input-border` colour on `$body-background`, or `$input-background` on `$body-background`, at least 3:1 (1.4.11, the boundary of an empty field);
- the `$input-border-focus` colour on `$body-background` and on `$input-background-focus`, at least 3:1 each (1.4.11 and 2.4.7, the focus indicator of a select menu or colour input);
- the `$input-border-focus` colour against the `$input-border` colour, at least 3:1 (1.4.1, the focused state is not a hue change alone);
- `$select-triangle-color` on `$select-background`, at least 3:1, unless it is `transparent` (1.4.11).

Reason: axe checks neither placeholder text nor borders, so without these checks a consumer on Foundation's defaults gets no signal (ADR 0022). The mixin emits no CSS and writes no Variant property.

Tests: Foundation's default settings plus `@include nfs-forms;` stop with an `@error` that names `$input-placeholder-color`, `$input-border`, and `$input-border-focus`; the Abide spec's settings without the focus border stop with the error naming `$input-border-focus` (1:1 from the resting border); the three required settings compile and emit no CSS; a `$select-triangle-color` under 3:1 fails, and `transparent` is accepted; a light `$input-border` with an `$input-background` that reaches 3:1 against the page passes (the background is the boundary); a pair at 4.49:1 fails although Foundation's rounding `color-contrast()` would report 4.5.

Decisions: D11 (a checks-only mixin with five `@error` checks and three required settings; not taken: `@warn` for the resting pairs, a library `select:focus` outline rule, leaving select focus to Foundation's 1.63:1 glow).

First milestone: `$input-placeholder-color: #737373`, `$input-border: 1px solid $dark-gray`, and `$input-border-focus: 1px solid $black` stay required; the `forms--field-contrast` story and the e2e focus check stay.

#### Label

[Spec: Label](../issues/94-spec-label.md); `nfs-label` (S10).

**label/1**, text contrast. One `@error` listing every failing pair, each with the setting, the palette name, the colour, and both ratios, by the exact helper: `$label-color` on `$label-background` under 4.5:1, and every `$label-palette` entry whose better candidate (of `$label-color` and `$label-color-alt`) is under 4.5:1 (1.4.3; D9).

Tests: Foundation's defaults plus `@include nfs-label;` stop with one `@error` naming `$label-palette` alert `#cc4b37` with `$label-color` at 4.498:1 and `$label-color-alt` at 4.364:1; `$foundation-palette: map-merge($foundation-palette, (alert: #bf3f2c));` alone in the overrides file still stops the compile naming `#cc4b37` (D10); an entry `#777777` stops the compile (4.440 and 4.421:1), and so does `#1177dd` (4.424 and 4.437:1), which Foundation's `color-luminance()` reports as 4.505:1 with `$black`, so the test pins the exact helper; `$label-background: #ffae00` with the default `$label-color` stops the compile naming `$label-color` on `$label-background` at 1.84:1, and with `$label-color: $black; $label-color-alt: $white;` it compiles.

Decisions: D9 (not taken: check only, raising `$global-color-pick-contrast-tolerance`, a text rule on every entry, `@warn`), D10 (the required setting).

First milestone: `$label-palette: map-merge($foundation-palette, (alert: #bf3f2c));` stays required; the correcting rule and `--nfs-label-palette` stay.

#### Menu

[Spec: Menu](../issues/85-spec-menu.md); `nfs-menu` (S7, S8, S10).

**menu/1**. Checks that emit no CSS, each an `@error` naming the setting: the current link's text (the colour `color-pick-contrast()` picks) against `$menu-item-background-active` below 4.5:1 (1.4.3); `$menu-item-background-active` against `$body-background` below 3:1 (1.4.1); `1rem` plus twice the first value of `$menu-items-padding` (through `rem-calc()`) below `rem-calc(24)` (2.5.8). Over Foundation 6.9.0's defaults: 4.65:1, 4.65:1, and 38.4 px (Foundation's `color-luminance()` gives 4.59:1).

Tests: `$menu-item-background-active: #787878` stops the compile naming the 1.4.3 check (4.484:1); `#f0f0f0` stops it naming the 1.4.1 check (1.13:1); `$menu-items-padding: 0.2rem 1rem` stops it naming the 2.5.8 check (22.4 px); a `$menu-item-background-active` of `#8a8a8a`, for which Foundation picks the dark text (5.73:1, fill 3.42:1), compiles.

First milestone: the three rules stay documented usage; Foundation's defaults already pass. The Magellan spec quotes the 1.4.1 check.

#### Nested menu (shared utility)

[Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md). The rule its three mode mixins share (S7, S8); each mode's own pairs are in accordion-menu/1, drilldown-menu/1 to /3, and dropdown-menu/1 to /3.

**nested-menu/1**, the current link's fill (1.4.1). Each mixin also stops the compile when `$menu-item-background-active`, the current link's fill, is below 3:1 against a background of its mode that is not `null`: `nfs-accordion-menu` against `$accordionmenu-item-background`, `nfs-drilldown` against `$drilldown-background` and `$drilldown-submenu-background`, `nfs-dropdown-menu` against `$dropdownmenu-submenu-background` and, where it is not `null`, `$dropdownmenu-background`, on which the Nested menu's rule 14 keeps the fill; `nfs-menu` checks `$body-background` (added 2026-09-28 under the class rule; D32).

**nested-menu/2**, arrows (1.4.11). Each mixin stops the compile with `@error` naming the setting when its arrow colour is below 3:1 against its backgrounds. Every mixin that checks the toggle size also stops the compile when `$accordionmenu-submenu-toggle-background` is not `null` and the arrow colour is below 3:1 against it, whatever the mode's arrow boolean, because Foundation draws the Hybrid item's arrow unconditionally (the Accordion Menu's decision 37). When `$accordionmenu-submenu-toggle-background` is `null`, the Hybrid item's arrow sits on the row's background, so `nfs-dropdown-menu` also stops the compile when `$accordionmenu-arrow-color` is below 3:1 against `$dropdownmenu-background` or else `$body-background`, and against `$dropdownmenu-submenu-background` (the Dropdown Menu's decision 25), and `nfs-drilldown` likewise when it is below 3:1 against `$body-background` and `$drilldown-submenu-background`. `nfs-drilldown` also stops the compile when `$dropdownmenu-arrow-color`, which Foundation uses for the `.align-left` and `.align-right` twins, is below 3:1 against `$drilldown-background` or `$drilldown-submenu-background` while `$drilldown-arrows` is on.

**nested-menu/3**, the toggle and row size (2.5.8). The mixins fail the compile with `@error` when either toggle setting is below 24 px, and each also when a row of its mode (`1rem` plus twice the first value of the mode's item or submenu item padding, through `rem-calc()`) is below 24 px, because row height is a consumer setting the story gate never sees: `nfs-accordion-menu` and `nfs-dropdown-menu` stop the compile on `nfs-drilldown`'s row condition, over `$accordionmenu-padding` or `$accordionmenu-submenu-padding` and over `$dropdownmenu-padding` or `$dropdownmenu-submenu-padding` (amended 2026-09-26, audit 0005 M1).

Tests: each mixin compiles after Foundation with defaults; a failing arrow colour, a 20 px toggle setting, and a mode's item padding of `0.2rem 1rem` (a 22.4 px row) each stop the compile with the named setting, in each of the three mixins; with `$accordionmenu-submenu-toggle-background: null`, an `$accordionmenu-arrow-color` below 3:1 against the dropdown backgrounds stops `nfs-dropdown-menu`; a `$drilldown-submenu-background`, a `$dropdownmenu-submenu-background`, or a set `$accordionmenu-item-background` of `$primary-color` (1:1 against Foundation's default `$menu-item-background-active`, which is `$primary-color`) stops its mixin naming the 1.4.1 check, and `null` backgrounds are skipped; each mixin runs its 1.4.1 check before its arrow checks, because on Foundation's defaults `$menu-item-background-active` and every arrow colour are `$primary-color` (`$dropdownmenu-arrow-color` is `$anchor-color`), so a `$primary-color` background fails both and the case must still name the 1.4.1 check.

Decisions: D32 (the fill checked against each mode's non-`null` backgrounds; not taken: no check, a runtime check, because the pair is compile-time settings).

First milestone: the rules stay documented usage: the fill at 3:1 against every non-`null` background of every mode the consumer includes, every mode's arrow colours at 3:1 against every background they can sit on, and the Hybrid toggle and every row at 24 px or more. The Nested menu's WCAG row 1.4.10 quotes dropdown-menu/4; the Responsive Menu spec quotes these checks per mode.

#### Off-canvas

[Spec: Off-canvas](../issues/25-spec-off-canvas.md); `nfs-off-canvas` (S5, S9).

**off-canvas/1**, the close button on the panel (1.4.11, and large-text 1.4.3 for the 32 px glyph). `@error` when the ratio of `$closebutton-color` or of `$closebutton-color-hover` against `$offcanvas-background` is under 3, naming the setting and `$offcanvas-background`; Foundation's defaults give 2.77 at rest (`#8a8a8a` on `$light-gray`). The page-background check of both colours is close-button/1's.

**off-canvas/2**, links on the panel (1.4.3). `@warn` when the ratio of `$anchor-color` against `$offcanvas-background` is under 4.5, naming both; the defaults give 3.76.

**off-canvas/3**, the panel size at 320 CSS px (1.4.10). `@warn` when the Zero-breakpoint entry of `$offcanvas-sizes` exceeds 320 px; Foundation's is 250 px.

**off-canvas/4**, a renamed content class. `@error` when `$maincontent-class` is not `'off-canvas-content'`, naming the setting, because `nfsOffCanvasContent` binds Foundation's default class and a renamed one would leave the push, reveal, and nested rules without an element. (Its manifest calls it a presence marker; it is a name check.)

Tests: Foundation's default settings plus `@include nfs-off-canvas;` stop with the `@error` naming `$closebutton-color` and `$offcanvas-background` (2.77:1); on a dark panel, where Foundation's `color-luminance()` overstates ratios, `$offcanvas-background: #0a0a0a` with `$closebutton-color-hover: $white` and `$closebutton-color: #116666` stops the compile (2.94:1 exact, 3.01:1 by Foundation's function), `$closebutton-color-hover` left at `$black` stops it (1:1), and `$anchor-color: #1177dd` there produces the `@warn` (4.44:1 exact, 4.51:1 by Foundation's function); `$anchor-color` under 4.5:1 against the background produces the `@warn`; a Zero-breakpoint `$offcanvas-sizes` entry over 320 px produces the reflow `@warn`; `$maincontent-class: 'page-content'` stops the compile naming the setting.

Decisions: D21 (`@error` for the close button at rest and on hover, `@warn` for links; the panel paints its own background under the button, so the panel pair is this mixin's), D29 (`$maincontent-class` is not renamed; not taken: an input carrying a class name, which ADR 0039 forbids).

First milestone: `$offcanvas-background: $white` (the setting the spec documents), the Zero-breakpoint size at or under 320 px, and an unrenamed `$maincontent-class` stay documented usage; rules (a) and (b) stay.

#### Orbit

[Spec: Orbit](../issues/33-spec-orbit.md); `nfs-orbit` (S1, S10).

**orbit/1**, the bullets (rule 0a; 1.4.11, and 1.4.1 for the selected state). `@error` naming the setting when the ratio of `$orbit-bullet-background` against `$body-background`, of `$orbit-bullet-background-active` against `$body-background`, or of `$orbit-bullet-background-active` against `$orbit-bullet-background` is below 3. Foundation's `$medium-gray` bullets reach 1.63:1 on `$white`, and axe has no 1.4.11 rule.

**orbit/2**, the caption and arrow bands over any image (rule 0b; 1.4.3, 1.4.11). `@error` when the caption text colour (`color-pick-contrast($orbit-caption-background)`, the colour Foundation's `.orbit-caption` rule paints) is below 4.5:1 against `$orbit-caption-background` composited with Sass `mix()` over `#fff` and over `#000`, or `$white` is below 3:1 against `$orbit-control-background-hover` composited the same way, naming the setting. The composited colours are opaque, so the helper's own compositing over `$body-background` does not apply. Foundation's `rgba($black, 0.5)` caption band gives 3.68:1, and axe marks text over images incomplete.

Tests: compiling Foundation 6.9 plus the library with Foundation's default Orbit colours stops with the `@error` naming `$orbit-bullet-background`; with the bullet settings fixed it stops naming `$orbit-caption-background`; `$body-background: #0a0a0a` with `$orbit-bullet-background: #116666` stops naming `$orbit-bullet-background` (2.94:1 by the exact formula, where Foundation's `color-luminance()` gives 3.01:1); with the stories' bullet settings, `$white: #f0f0f0` with `$orbit-caption-background: rgba($black, 0.58)` stops naming `$orbit-caption-background` (4.29:1 for the `$white` text composited over `#fff`, where compositing over `$white` would give 4.70:1).

Decisions: D17 (compile-time checks with the exact formula, the bands composited over `#fff` and `#000`; not taken: recommending settings in the docs, Foundation's functions, compositing over `$white` and `$black`, which passes a failing band when the consumer's `$white` is darker than an image's white).

First milestone: `$orbit-bullet-background: $dark-gray;`, `$orbit-bullet-background-active: $black;`, and `$orbit-caption-background: rgba($black, 0.6);` (the Storybook's lines) stay documented usage; the 24 px bullet floor, the arrow background, and the other rules stay.

#### Pagination

[Spec: Pagination](../issues/87-spec-pagination.md); `nfs-pagination`.

**pagination/1** and **pagination/2**. Checks that emit no CSS: one `@error` listing every failing pair with its setting, its criterion, and its exact unrounded ratio from the library's helper (a translucent colour composited over `$body-background` first):

- pagination/1 (1.4.3): `$pagination-item-color` on `$body-background` and on `$pagination-item-background-hover`, `$pagination-item-color-current` on `$pagination-item-background-current`, and `$pagination-ellipsis-color` on `$body-background` under 4.5:1;
- pagination/2 (1.4.1): `$pagination-item-background-current` against `$body-background`, and `$pagination-item-color-disabled` against `$pagination-item-color`, under 3:1.

Over Foundation 6.9.0's defaults: 19.6304, 15.8630, 4.6473, and 19.6304:1; 4.6473 and 12.0791:1. No setting is required on Foundation's defaults.

**pagination/3**, a setting with no effect. One `@warn` when `$pagination-mobile-current-item` is `true` and `$pagination-mobile-items` is `false`: Foundation's rule selects `li.current`, which the current page's item no longer carries.

Tests: each of these stops the compile with one `@error` naming the setting, the pair, and the ratio: `$pagination-item-background-current: #8a8a8a` (text 3.422:1); `$pagination-item-background-current: #f0f0f0; $pagination-item-color-current: $black` (fill 1.129:1); `$pagination-item-color: #777777` (4.44:1 on the page, 3.588:1 on hover, and 2.732:1 from the disabled colour, all three in one message); `$pagination-item-background-hover: #767676` (4.358:1); `$pagination-item-color-disabled: #555555` (2.655:1); `$pagination-ellipsis-color: #999999` (2.824:1); `$pagination-item-background-current: #1177dd; $pagination-item-color-current: $black` (4.437:1, where Foundation's `color-luminance()` gives 4.505:1). `$pagination-item-background-current: #1b7ac2` compiles (4.517:1 exactly, where Foundation's `color-luminance()` gives 4.469:1); with the case above it pins the exact helper in both directions. `$pagination-mobile-current-item: true` compiles with one `@warn` naming the setting; with `$pagination-mobile-items: true` as well there is no warning.

Decisions: D8 (the compile-time `@error` checks beside the current and disabled rules and the 24 px floor; not taken: an `@error` on link height, `@warn` for the pairs), D9 (the setting has no effect, and the mixin warns; not taken: binding `.current` on the item, a `:has()` rule).

First milestone: the rules stay documented usage (item, current, and ellipsis text at 4.5:1; the current fill and the disabled text at 3:1), and `$pagination-mobile-current-item: true` is documented as having no effect unless `$pagination-mobile-items` is also `true`.

#### Progress Bar

[Spec: Progress Bar](../issues/95-spec-progress-bar.md); `nfs-progress-bar` (S10).

**progress-bar/1**, meter text. One `@error` listing every fill (`$progress-meter-background` and each palette colour) whose picked meter text is under 4.5:1, each with the setting, the name, the colour, and the ratio (1.4.3). The pick is the first milestone's meter-text rule (D8), by the same helper.

Tests: Foundation's defaults plus `@include nfs-progress-bar;` stop with one `@error` naming `$foundation-palette` alert `#cc4b37` with its meter text at 4.498:1; a palette colour that leaves the text under 4.5:1 with both candidates stops the compile: `#777777` (4.44:1 with `$white`), and `#1177dd` (4.437:1 with `$black` by the exact formula, which Foundation's `color-luminance()` reports as 4.505:1), so the test pins the exact helper.

Decisions: D9 (not taken: `@warn`, checking only the default fill, pure `#ffffff` or `#000000` text on alert).

First milestone: `$foundation-palette: map-merge($foundation-palette, (alert: #bf3f2c));` stays required; the meter-text rules and `--nfs-foundation-palette` stay.

#### Prototyping Utilities

[Spec: Prototyping Utilities](../issues/102-spec-prototyping-utilities.md); `nfs-prototyping-utilities` (presence marker P4).

**prototyping-utilities/1**, the arrow colour (1.4.11). A compile-time check that emits no CSS: `@warn` when `$prototype-arrow-color` is under 3:1 against `$body-background`, naming both colours and the ratio.

Tests: `$prototype-arrow-color: #bbbbbb` set after `@import 'foundation'` warns once, naming the setting, the colour, `$body-background`, and the ratio (1.90:1); the default compiles silently.

Decisions: D17 (a warning, because an arrow may be decoration and sits on unknown backgrounds, as `nfs-menu-icon` warns for the dark menu icon; the docs set the arrow settings after `@import 'foundation'`, because Foundation's arrow partial assigns them without `!default`; not taken: `@error`, which refuses a decorative light arrow; no check).

First milestone: `$prototype-arrow-color` at 3:1 against `$body-background` stays documented usage; the responsive spacing rules and the ten registry properties stay.

#### Responsive Toggle

[Spec: Responsive Toggle](../issues/24-spec-responsive-toggle.md); `nfs-responsive-toggle($hide-for)`.

**responsive-toggle/1**, the breakpoint names. The first key of `$breakpoints` (the Zero breakpoint, for which Foundation emits no `hide-for`/`show-for` pair) and a name missing from `$breakpoints` stop the compile with `@error`. A name already in `$breakpoint-classes` is skipped (Foundation emits it), which is CSS behaviour and stays; an include without an argument stops the compile through Sass's own missing-argument error, which stays with the required parameter.

Tests: the Zero breakpoint and an unknown name fail the compile with `@error`.

First milestone: `@include nfs-responsive-toggle(<bp>...)` names breakpoints that exist in `$breakpoints` and are not the Zero breakpoint, as documented usage. The spec's quotes of the Top Bar's checks (its WCAG rows 1.4.11 and 1.4.3 and its Sass items 1, 2, and 5) are top-bar/1's.

#### Reveal

[Spec: Reveal](../issues/18-spec-reveal.md); `nfs-reveal` (S5).

**reveal/1**, the close glyph and the dialog edge (1.4.11). `@error` naming the setting when the ratio of `$closebutton-color` against `$reveal-background`, or of `$closebutton-color-hover` against `$reveal-background`, is under 3, as the `nfs-off-canvas` mixin does for the same glyph; `@warn` naming the setting when the ratio of `$reveal-background` against `$reveal-overlay-background` composited over `$body-background` is under 3.

Tests: a theme with `$closebutton-color` or `$closebutton-color-hover` under 3:1 against `$reveal-background` stops the compile with the `@error` naming the setting, and a backdrop that leaves the dialog under 3:1 against the dimmed page produces the matching `@warn`; Foundation's defaults compile with no warning.

Decisions: D19 (`@error` for the two close-glyph pairs, because the glyph marks the close control at rest and on hover, and `@warn` for the dialog edge, which carries no state; not taken: a runtime check, no check, a `@warn` for the glyph, Foundation's `color-contrast()`), D28 (the 1.4.11 check against `$reveal-background` stays with the Reveal after the close button moved to `nfsCloseButton`).

First milestone: the two glyph colours at 3:1 against `$reveal-background` and the dialog edge at 3:1 against the dimmed page stay documented usage; the eight `nfs-reveal` rules stay.

#### Slider

[Spec: Slider](../issues/32-spec-slider.md); `nfs-slider` (S6).

**slider/1**, the fill, the thumb, and the focus ring (rule 0a; 1.4.11, 2.4.7). A compile-time check that emits no CSS: `@error` when the unrounded ratio of `$slider-fill-background` against `$slider-background`, of `$slider-handle-background` against `$slider-background`, or of the colour of `$input-border-focus` (read with Foundation's `get-border-value()`) against `$body-background` (the focus ring of rule 6), computed by the exact helper, is below 3, naming the setting. Foundation's defaults reach 1.31:1 for the fill and 3.76:1 for the thumb against the track.

Tests: compiling Foundation 6.9 plus the library with Foundation's default slider colours stops with the `@error` naming `$slider-fill-background` (1.31:1); a thumb colour below 3:1 against the track stops with the `@error` naming `$slider-handle-background`; `$slider-background: #0a0a0a` with `$slider-fill-background: #116666` stops the compile (exact 2.94:1, which Foundation's `color-luminance()` would pass at 3.01:1); with `$input-border-focus: 1px solid $black` and `$body-background: #0a0a0a` (and passing slider colours) the compile stops naming `$input-border-focus`, and with Foundation's default `$input-border-focus` it compiles (3.42:1 on `#fefefe`).

Decisions: D17 (fill and thumb at 3:1 against the track, a requirement checked at compile time; not taken: a docs recommendation, a runtime check reading computed colours, changing the consumer's colours in library CSS, Foundation's functions), D26 (rule 6 draws `$input-border-focus` around a focused thumb, and rule 0a checks its colour against the page; not taken: a library `2px solid $black` ring no dark theme can change).

First milestone: `$slider-fill-background: $primary-color` (the Storybook's line) and the ring colour at 3:1 against the page stay documented usage; rule 6, the forced-colours block, and the thumb rules stay.

#### Switch

[Spec: Switch](../issues/84-spec-switch.md); `nfs-switch` (S6).

**switch/1**, tracks, knob, ring, heights, and inner labels. Compile-time checks that emit no CSS, with the unrounded ratio of the exact helper: one `@error` listing every failing item, each with the setting and the ratio: `$switch-background`, `$switch-background-focus`, `$switch-background-active`, and `$switch-background-active-focus` each under 3:1 against `$body-background`, or `$switch-paddle-background` under 3:1 against any of them (1.4.11); the colour of `$input-border-focus`, read with Foundation's `get-border-value()`, under 3:1 against `$body-background` (2.4.7, 1.4.11); `$switch-height-tiny`, `$switch-height-small`, `$switch-height`, or `$switch-height-large` under 24 px, a rem value converted at the consumer's `$global-font-size` through Foundation's `rem-calc()` and a px value read as it is (2.5.8). One `@warn` listing `$white` inner-label text under 4.5:1 on `$switch-background` or `$switch-background-focus` (the inactive word) and on `$switch-background-active` or `$switch-background-active-focus` (the active word) (1.4.3).

Tests: Foundation's defaults plus `@include nfs-switch;` stop with one `@error` naming `$switch-background` against `$body-background` (1.625:1), `$switch-paddle-background` against `$switch-background` (1.625:1), and the same two for `$switch-background-focus` (2.015:1); `$switch-background: #767676` alone, after the settings file, stops the compile naming `$switch-background-focus` (2.015:1); `$switch-background: $dark-gray` with the focus line compiles and warns once naming the inactive inner-label pairs (3.422:1 and 4.127:1); `$input-border-focus: 1px solid #aaaaaa` stops it naming the focus ring colour (2.303:1); `$global-font-size: 87.5%` stops it naming `$switch-height-tiny` (21 px); a lighter `$switch-background-active` (`#54a0d8`) stops it naming the on track against the page and the knob (2.814:1); a dark page with a dark knob and `#116666` tracks stops it at 2.937:1, a pair Foundation's `color-luminance()` passes at 3.01:1, so the test pins the exact helper.

Decisions: D11 (`@error` for every track and knob pair, the ring colour, and heights under 24 px; `@warn` for inner-label text, because inner labels are optional; not taken: `@error` for inner-label text, which fails builds that never show inner labels; Foundation's functions), D10 (the required settings; `$dark-gray` is allowed, with the warning).

First milestone: `$switch-background: #767676;` and `$switch-background-focus: scale-color($switch-background, $lightness: -10%);` stay required; the focus ring, forced-colours, and reduced-motion rules stay.

#### Table

[Spec: Table](../issues/92-spec-table.md); `nfs-table` (S5).

**table/1**, the stacked header and text and link contrast. Compile-time checks that emit no CSS: one `@error` that lists each failure, by the exact helper: `$show-header-for-stacked` is not `true` (1.3.1, 1.4.10; D7); and every pair under 4.5:1 of `$body-font-color` on `$table-background` and `$table-row-hover` and, while `$table-stripe` is `even` or `odd`, on `$table-striped-background` and `$table-row-stripe-hover`; `$table-head-font-color` on `$table-head-background` and `$table-head-row-hover`; `$table-foot-font-color` on `$table-foot-background` and `$table-foot-row-hover`; and `$anchor-color` and `$anchor-color-hover` on each of those eight backgrounds (1.4.3; D11). Each failure names the settings and the ratio.

Tests: Foundation's defaults plus `@include nfs-table;` stop with one `@error` naming `$show-header-for-stacked` and seven `$anchor-color` pairs: row hover 4.45, striped 4.16, striped hover 3.97, header 4.40, header hover 4.21, footer 4.16, footer hover 3.97:1; with the header setting alone, the seven link pairs remain.

Decisions: D7 (the setting required, measured in the platform trees; not taken: dropping `stack`, a library rule showing the header, a development warning only), D11 (not taken: checking only the backgrounds on screen at rest, a table-scoped link colour rule).

First milestone: `$show-header-for-stacked: true` and the Callout's `$anchor-color` stay required; the stacked-footer rule stays.

#### Tabs

[Spec: Tabs](../issues/16-spec-tabs.md); `nfs-tabs` (S10).

**tabs/1**, the strips and the `primary` bar (1.4.3, 1.4.11). `@error` when `$tab-content-background` is under 3:1 against `$primary-color`, by the exact helper, naming both settings (D23); on every strip, naming the setting: `$tab-color` under 4.5:1 against `$tab-background`, `scale-color($tab-color, $lightness: -14%)` under 4.5:1 against `$tab-item-background-hover`, `$tab-active-color` under 4.5:1 against `$tab-background-active`, and `$tab-background-active` under 3:1 against `$tab-background` (D17, D26); and on a `primary` bar when `color-pick-contrast($primary-color)` is under 4.5:1 against `$primary-color` or `smart-scale($primary-color)` (D26). Because these checks run for every strip, every application with a tab strip includes `nfs-tabs` (D26); the Responsive Accordion Tabs spec quotes them for tabs mode.

Tests: `nfs-tabs` included after `foundation-tabs` stops the compile with its `@error` when `$tab-content-background` is under 3:1 against `$primary-color` (`$tab-content-background: $primary-color` stops it at 1:1, measured with Dart Sass 1.104.1); Foundation's default tab colours stop the compile naming `$tab-active-color` and `$tab-background-active`; D17's settings compile.

Decisions: D23 (the selected tab on a `primary` bar gets the panel's colours from a CSS rule, first milestone, and the check covers the pair that rule relies on), D26 (the strip's pairs checked; not taken: no check, a `@warn`), D17 (the required settings).

First milestone: `$tab-background-active: $primary-color; $tab-active-color: $white;` stay required; the `simple` and `primary` rules stay, and only an application that uses `simple` or `primary` includes `nfs-tabs`. The later milestone restores D26's rule that every tab strip includes it.

#### Top Bar

[Spec: Top Bar](../issues/86-spec-top-bar.md); `nfs-menu-icon`, `nfs-title-bar` (checks-only), and `nfs-top-bar` (checks-only) (S2, S5, S7, S9).

**top-bar/1**, the three mixins' checks:

- (a) `nfs-menu-icon`: `@warn` when `$black` or `$dark-gray`, the dark icon's colours, is under 3:1 against `$body-background` (1.4.11), because a dark-page application may use only the light icon. Its rules (the 24 by 24 px border box and the forced-colours bars) stay in the first milestone.
- (b) `nfs-title-bar`, no CSS: `@error` when `$titlebar-color` is under 4.5:1 against `$titlebar-background` (1.4.3), or `$titlebar-icon-color` or `$titlebar-icon-color-hover` is under 3:1 against it (1.4.11).
- (c) `nfs-top-bar`, no CSS, against `$topbar-background` and, where it differs, `$topbar-submenu-background`, a translucent bar composited over `$body-background` first: `@error` when `$anchor-color` is under 4.5:1 (1.4.3) or `$menu-item-background-active` is under 3:1 (1.4.1, the current link's fill that `nfs-menu` draws, the pair the Menu spec leaves to this spec); `@warn` when `$topbar-submenu-background` is translucent (1.4.3, because text over page content has no known contrast); `@warn` when neither the light icon (`$titlebar-icon-color`, `$titlebar-icon-color-hover`) nor the dark icon (`$black`, `$dark-gray`) reaches 3:1 at rest and on hover against `$topbar-background` (1.4.11, because an icon on the bar is a placement Foundation's Sass allows, `.top-bar-title .menu-icon`, but its docs never show); `@warn` when `$topbar-unstack-breakpoint` is the Zero breakpoint, since the sections would then never stack (1.4.10).

Tests: `$body-background: #202020` warns for the dark icon; `nfs-title-bar` emits no CSS, and `$titlebar-color: #555` stops the compile (2.66:1), and so does `$titlebar-icon-color-hover: #333` (1.57:1); `nfs-top-bar` emits no CSS, Foundation's defaults stop the compile naming `$anchor-color` on `$topbar-background` (3.76:1), `$topbar-background: $white` set after the settings file without the submenu line stops it naming `$topbar-submenu-background` (3.76:1), both lines compile, `$topbar-background: transparent` with `$topbar-submenu-background: $white` compiles (the bar composited over the page), a translucent `$topbar-submenu-background` warns, a darker `$anchor-color` on the default bar compiles and warns that no menu icon reaches 3:1 on the bar, and `$topbar-unstack-breakpoint: small` warns; the exact-formula helper returns 2.94:1 for `#116666` on `#0a0a0a` and 4.44:1 for `#1177dd` on `#0a0a0a`, the two false passes of Foundation's `color-luminance()` below 3:1 and 4.5:1 that the ticket measured.

Decisions: D7 (one Library mixin per export mixin, so each check runs only for a component the consumer compiles: an Off-canvas application with a title bar and no Top Bar is not stopped by the Top Bar's link check; T9 of the audit stays OPEN FOR HUMAN), D8 (the exact formula; `@error` for pairs the component always draws, `@warn` for pairs that exist only in a placement the consumer may not use; not taken: Foundation's `color-luminance()`, `@error` everywhere).

First milestone: `$topbar-background: $white;` and, when written after Foundation's settings file, `$topbar-submenu-background: $topbar-background;` stay required; `$titlebar-color` at 4.5:1 and the title bar's icon colours at 3:1 against `$titlebar-background`, an opaque bar where a stuck bar covers content, and a menu icon on the bar or a dark icon on a dark page at 3:1, stay documented usage. The Responsive Toggle, Responsive Menu, Dropdown Menu, and Sticky specs quote these checks.

#### Typography Helpers

[Spec: Typography Helpers](../issues/106-spec-typography-helpers.md); `nfs-typography-helpers` and `nfs-typography-base` (checks-only) (S2).

**typography-helpers/1**, the greys (1.4.3), at 4.5:1 whatever the size, because a subheader, citation, or quotation can sit on any element. `nfs-typography-helpers`: a compile-time check that emits no CSS, one `@error` listing every pair under 4.5:1, `$subheader-color` and `$cite-color` against `$body-background` and `$code-color` against `$code-background`, each with the setting names and the ratio, by the exact helper (a translucent colour composited over its background first). `nfs-typography-base`: one `@error` listing every pair under 4.5:1, `$header-small-font-color` and `$blockquote-color` against `$body-background`, computed the same way; it emits no CSS. Neither mixin checks a grey against a container's background (D23).

Tests: Foundation's defaults plus `@include nfs-typography-helpers;` stop with one `@error` naming `$subheader-color` and `$cite-color` against `$body-background` (3.423:1 each); `@include nfs-typography-base;` stops with one naming `$header-small-font-color` (1.625:1) and `$blockquote-color` (3.423:1) against `$body-background`; with the four greys at `#666666` both compile; they compile at `#737373` too, because the checks read the page only (D23); with the first three at `#666666` and `$blockquote-color` left at `$dark-gray`, `nfs-typography-base` stops naming `$blockquote-color` alone; `nfs-typography-base` emits no CSS; `$code-color: $dark-gray` stops the compile (2.766:1 on `$code-background`); a translucent `$subheader-color` is composited over `$body-background` before the ratio.

Decisions: D9 (the checks and the required greys; not taken: `@warn`, 3:1 for large text, leaving `$header-small-font-color` or `$blockquote-color` unchecked, checking every colour `foundation-typography-base` prints; D9 also records that a new compile stop after the first release waits for an Angular major, the reason for Rollout below), D23 (greys on container backgrounds: a stated requirement with no compile check; not taken: a `@warn` or `@error` in `nfs-callout`, `nfs-card`, and `nfs-table`, checking the greys against every container background).

First milestone: the four greys at `#666666` on Foundation's defaults stay required, and the container requirement stays stated and asserted in `typography-helpers--composition`; the grid margin rules of `nfs-typography-helpers` stay.

### The Sass import-order guard

**G1**: `_index.scss` "defines global mixins, emits nothing on import, and never imports Foundation itself; a guard fails the compile when Foundation was not imported first" ([ADR 0012](../adr/0012-sass-packaging.md)). Message, measured by [Sass packaging for the new library](../issues/57-sass-packaging.md), Experiment B, fixture `imp-order` (the library before Foundation): "@import Foundation (or its util/util) before ngx-foundation-sites." The same guard error answers `@use 'ngx-foundation-sites'` (fixture `imp-use`). A consumer that imports only `foundation-sites/scss/util/util` before the library passes it (fixture `imp-util`, the compiled-CSS consumer path).

- Cost: one check at import; importing the library emits nothing either way (fixtures `imp-empty` and `imp-foundation-only` give identical output).
- Tests: node-level Sass compile, "the guard fires when Foundation is missing" ([Sass packaging for the new library](../issues/57-sass-packaging.md), decision 18a).
- Why it is a build-time check: it is an `@error` that stops the consumer's compile, which the ruling defers whatever it guards, and the library emits its CSS the same without it: the guard runs at import, while every mixin reads Foundation's settings and calls its functions only when the consumer includes it after Foundation, as documented.
- First milestone: the rule is documented usage in the install docs and every Sass subsection: `@import 'ngx-foundation-sites';` after Foundation's imports (or its `util/util`).

### Presence markers

A presence marker is a custom property a Library mixin writes that only a Runtime check reads. The flag-gated ones: a family that a Sass flag gates gets a Variant property of its own, written as the empty list (whitespace only) while the flag is off and read only by the Runtime checks; two families that one flag gates in opposite directions share one property listing whichever of their names the compile generates, which is never empty while its mixin is included and may therefore be named in `include()`; a flag that only chooses which of two opposite classes exists, where the absent class's look is already the default, needs none (building-blocks 1.13; the Table's `striped` and `unstriped` under `$table-is-striped`, Table D5). Each marker follows the Variant property format of the [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md) and is not in the Variant manifest, so the declaration file never lists it (that spec's "Settings that are deliberately not registries"). The [Spec: Runtime checks (later milestone)](../issues/162-spec-runtime-checks-later-milestone.md) reads them; this spec writes them.

| Id | Spec | Property | Written as | Tests (node-level Sass compile) |
| --- | --- | --- | --- | --- |
| P1 | [Spec: Button](../issues/37-spec-button.md), Sass item 2, D19 | `--nfs-button-responsive-expanded` | `$breakpoint-classes` while `$button-responsive-expanded` is true, empty while it is false (the default) | Foundation's defaults write an empty `--nfs-button-responsive-expanded`; `$button-responsive-expanded: true` writes `--nfs-button-responsive-expanded: small medium large;` |
| P2 | [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md), Sass items 1 and 6, D14 | `--nfs-flexbox-responsive-breakpoints` | The Class breakpoints above the Zero breakpoint (`medium large` by default), space-separated, empty while `$flexbox-responsive-breakpoints` is off | Foundation's defaults write `--nfs-flexbox-responsive-breakpoints: medium large;`; `$flexbox-responsive-breakpoints: false` writes it empty and keeps the count; `$breakpoint-classes: (small medium large xlarge)` writes `medium large xlarge`, and `(medium large)` writes `medium large` |
| P3 | [Spec: Media Object](../issues/91-spec-media-object.md), Sass items 1 and 6, D6 | `--nfs-media-object-section` | `main-section` under `$global-flexbox: true`, `middle bottom` under `false`: two families one flag gates in opposite directions, so the property is never empty while the mixin is included | `@include nfs-media-object;` after `foundation-media-object` emits exactly `:root { --nfs-media-object-section: main-section; }` on Foundation's defaults and `middle bottom` under `$global-flexbox: false`, and no other rule; after `foundation-everything` it writes `main-section`; after `foundation-everything($flex: false)` with `$global-flexbox: false` it writes `middle bottom` |
| P4 | [Spec: Prototyping Utilities](../issues/102-spec-prototyping-utilities.md), Sass item 6 | `--nfs-prototype-<flag>-breakpoints` for `border-box`, `border-none`, `bordered`, `display`, `font`, `list`, `overflow`, `position`, `rounded`, `separator`, `shadow`, `sizing`, `spacing`, `decoration`, `transformation`, and `utilities` | Each lists `$breakpoint-classes` while its flag is on and is written empty while it is off | Foundation's defaults write the sixteen flag properties empty; each flag set to `true` after the settings file writes its property as `small medium large`; `$global-prototype-breakpoints: true` alone after the settings file writes them all empty (the documented no-op) |

The Breakpoint properties are the fifth marker: nothing but the Runtime checks' drift check reads them, and the tooling's generate mode reads only `--nfs-breakpoint-classes`, which stays in the first milestone.

| Id | Spec | Property | Written as | Tests (node-level Sass compile) |
| --- | --- | --- | --- | --- |
| P5 | [Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md), Sass items 1 to 3 and 5, Rendered output; [ADR 0012](../adr/0012-sass-packaging.md) | `--nfs-breakpoint-<name>`, one per key of `$breakpoints`, in map order, in the same `:root` rule as `--nfs-breakpoint-classes` | `-zf-bp-to-em($value)` times 16 px, read from the consumer's `$breakpoints` (the mixin's optional `$map` parameter defaults to it), so the values equal Foundation's media queries by construction: `0px`, `640px`, `1024px`, `1200px`, `1440px` on Foundation's defaults | The `--nfs-breakpoint-*` output for Foundation's default map and for a customised em, rem, and px map ([Sass packaging for the new library](../issues/57-sass-packaging.md), decision 18a) |

P3 is `nfs-media-object`'s only output, so that mixin exists only in this milestone (S2). The other mixins keep their registry Variant properties in the first milestone, `nfs-breakpoint-properties` its `--nfs-breakpoint-classes`. P5 is also what makes `nfs-breakpoint-properties` depend on Foundation's private `-zf-bp-to-em` ([ADR 0012](../adr/0012-sass-packaging.md), Consequences), so that dependency and its guarding compile test return with it.

### The Variant declaration tooling's check mode

**variant-declaration-tooling/1**, [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md). The check mode of the shared core: compare the expected model from the Sass with the existing file's model, by meaning, and report the drift without writing.

The Architect builder `ngx-foundation-sites:variant-types` gains:

| Option | Type | Default | Meaning |
| --- | --- | --- | --- |
| `check` | `boolean` | `false` | Compare only: succeed when the file matches the Sass, fail with the drift (M2) otherwise; never write |

- The setup generator writes `"configurations": { "check": { "check": true } }` on every `nfs-variants` target it adds, so the check runs as `ng run <project>:nfs-variants:check` or `nx run <project>:nfs-variants:check`. The builder imports neither `nx` nor `@nx/devkit`, so the check runs on an Angular CLI workspace with only `@angular-devkit/architect`.
- A target the first milestone's setup generator wrote has no `check` configuration, and the generator adds a target only when a project has none; an Nx migration, reused as an `ng update` migration ([ADR 0045](../adr/0045-release-policy-devkit-version-scheme.md)), adds it.
- `nx sync:check` runs the task sync generator `ngx-foundation-sites:variant-types-sync` (first milestone) without writing, and fails when it would change a file (printing M1, the sync generator's message) or when it throws (M2's thrown form). Nx counts a sync generator as out of sync only when it changes the tree or throws, so a model-equal file is in sync whatever its bytes.

CI steps:

- Nx: `npx nx sync:check` as its own step, before any task. It is required: tasks skip sync generators in CI, and a build against a stale file passes and ships a Variant with no class (SYNC 4.2 of [Research: further typing and synchronisation options for Variant inputs](../issues/135-research-further-variant-typing-options.md)). With Nx Cloud distributed agents it runs on the main job, since agents set CI variables too.
- Nx workspace that declines the sync generator: `npx nx run-many -t nfs-variants -c check`.
- Angular CLI: `npx ng run <project>:nfs-variants:check` for each project with an `nfs-variants` target.
- The setup generator prints the step (M13); it edits no CI file.

The drift report, as the check reports it (the Declaration drift table of the Variant declaration tooling spec; the comparison itself stays with generate mode, which rewrites a generated file whose model differs):

| Drift | Effect while it lasts | Reported as |
| --- | --- | --- |
| The Sass generates a name the file does not declare | a template using it fails to compile (loud) | `add <name>: true` |
| The file declares a name the Sass does not generate | compiles, renders a class with no CSS (silent) | `remove <name>: true` |
| The Sass removed a default the file keeps | compiles, renders nothing (silent) | `add <name>: false` |
| The file removes a default the Sass generates | a template using it fails (loud) | `remove <name>: false` |
| The counts differ | wrong range | `count is <file> in the file and <sass> in <property>` |
| The file declares a registry the manifest lacks | nothing happens (silent) | `<Name> is not a Variant registry of ngx-foundation-sites <version>` |
| An open registry (index signature) | any string compiles for that setting, by the consumer's choice | not drift; listed once as open |

Hand-written files: a file without the generated header is the consumer's; the tooling never overwrites it (first milestone). The check mode checks it just the same: its drift (M4), and anything the reader cannot model in it (M5, M6, M7, with the member's line), never a silent pass.

The check mode's messages (every message starts with `ngx-foundation-sites:` and names the project, the file, and the stylesheet where it has them):

| Id | When | Text (placeholders in angle brackets) |
| --- | --- | --- |
| M2 | check failure | "<file> no longer matches <sources>:" then one line per registry with its drift (table above), then "Run <command> to update it." |
| M3 | no Variant property in any source | "<sources> of <project> print no Variant properties. Add `@import 'ngx-foundation-sites';` after your Foundation imports and include the Library mixins of the families you use (for example `@include nfs-button;`), or remove the project's nfs-variants target." |
| M4 | hand-written file with drift | "<file> was not generated by ngx-foundation-sites, so it is not rewritten. Make these edits:" then the drift lines, then "or delete it to let the tooling write it." |
| M5 | no `import` or `export` | "<file> has no import or export, so its declare module replaces the library's types. Add `import 'ngx-foundation-sites';` as its first statement." |
| M6 | unknown registry | "<file>:<line> declares <Name>, which is not a Variant registry of ngx-foundation-sites <version>." plus the nearest registry name when one is close |
| M7 | a member the reader cannot model | "<file>:<line>: <Registry>.<member> must be `true`, `false`, or (for count registries) `count: <whole number>`; quote numeric names ('25': true)." |
| M13, one line | setup summary | "Add this step to CI: <step>." |

M3 is the ruling's "the one for a stylesheet with no Variant properties": the project fails in every mode (core step 3 of the tooling spec); in the first milestone a project with no Variant property keeps every registry at Foundation's defaults, as core step 3 already does for each absent property. M4 to M7 report a hand-written file in write mode and in the sync generator as well as in the check. The messages generate mode needs to report its own work stay in the Variant declaration tooling spec: M1, M2's thrown form ("could not keep the Variant declaration files in step for <n> project(s):" then "<project>: <message>" per project), M8 to M12, and the rest of M13, including its hint to add `declare global {}` to a kept hand-written file, which the setup summary keeps.

- Library upgrades: the next check reports every registry and default change an upgrade brings, and an unknown registry fails (the tooling spec's D29).
- Cost: one Sass compile per covered project per run (0.6 to 0.8 s each with `foundation-everything` and `sass-embedded` on win32-arm64, measured by [Prototype: Variant declaration tooling in real Nx and Angular CLI workspaces](../issues/137-prototype-variant-declaration-tooling.md)).
- Decisions: the tooling spec's D24 (CI: `nx sync:check`, or the builder's `check` configuration, as its own step; not taken: a check inside the build, because tasks skip sync in CI and the Angular CLI has no target dependencies), D9 (comparison by meaning; not taken: a byte comparison, which fails after Prettier, a CRLF checkout, or any hand-written layout), D29 (library upgrades).

### Rollout under the release policy

[ADR 0045](../adr/0045-release-policy-devkit-version-scheme.md) lets a release for a new Angular minor carry fixes and additive API only, and its policy starts with the first published release. A compile that passed before and stops after an upgrade changes what consumers see, as Typography Helpers D9 recorded ("a new compile stop after the first release waits for an Angular major"). Of the three landing paths (a `@warn` first, an opt-in flag, or the `@error` with an Angular major), the checks land as specified, each `@error` with an Angular major (D10). So, when the first milestone has been published before this spec lands:

- every `@error` that a Library mixin the consumer already includes gains, the import-order guard (G1), and the failures the check mode adds to write mode and the sync generator (M3, and M4 to M7 on a hand-written file) land in the first release for a new Angular major;
- every `@warn`, every presence marker, every check in a checks-only mixin the consumer must newly include, and the check mode's own step (the `check` option and configuration, `nx sync:check` in CI) are additive and may land in any release;
- the release's changelog names each new check and the setting that satisfies it, which each spec's required settings already state.

When this spec lands before the first published release, none of this applies.

### Comparison with Angular Material, Foundation, and prior art

| Concern | Prior art | This library | Why |
| --- | --- | --- | --- |
| Compile-time validation in Sass | Angular Material stops the compile with `@error` on an invalid theme configuration and an unknown token name (`core/theming/_validation.scss`, `core/tokens/_token-utils.scss`), and checks no contrast; Foundation warns on an unknown breakpoint name and stops on a `$breakpoints` map whose first value is not 0 | `@error` and `@warn` on the consumer's colour, size, and name settings | axe has no 1.4.11 rule and sees only the states and entries a page renders (ADR 0022) |
| Contrast arithmetic | Foundation's `color-contrast()` rounds; its `color-luminance()` approximates | The exact formula through one helper (S1) | Measured false passes of both |
| Declaration file in CI | typed-scss-modules `--listDifferent` (exit 1 on a difference); Nx `sync:check`; Style Dictionary has none | `nx sync:check` and the builder's `check` configuration, by meaning | A byte check fails on formatting and on hand-written files |

### Implementation level and primitives

Sass: `@error`, `@warn`, `sass:math`'s `pow` in the helper, Sass `mix()` for the Orbit's image compositing, and Foundation's `get-border-value()`, `rem-calc()`, `smart-scale()`, and `color-pick-contrast()` (read only to learn the colour Foundation emits). Tooling: `@angular-devkit/architect` (`createBuilder`, `getTargetOptions`), `@nx/devkit`'s sync generator contract, and the shared core of the Variant declaration tooling. No Angular runtime API, no `@angular/aria`, and no CDK: nothing here runs in an application.

### ARIA and keyboard

None: nothing here renders or takes input.

### WCAG 2.2 AA

The checks render nothing and change no markup, so no criterion applies to them. They enforce 1.3.1, 1.4.1, 1.4.3, 1.4.10, 1.4.11, 2.4.7, and 2.5.8 on the consumer's settings where axe cannot. Without them (the first milestone) each spec's required settings are documented usage, the library's own stories and their axe and contrast assertions prove the components pass with those settings, and a consumer who ignores them fails WCAG on their own pages, which the user accepts for the first milestone.

### Rendered output

None. A check emits no CSS; a presence marker is one `:root` custom property; the check mode writes no file.

### Rendering modes

None apply: the checks run in the consumer's Sass compile and in CI, never on the server, in the browser, during hydration, or inside a `@defer` block.

## Testing Decisions

A good test asserts what a developer observes: whether the compile stops, the text of an `@error` or `@warn` (the settings, colours, backgrounds, and ratios it names) and how many warnings print, the exact CSS a compile emits, and, for the tooling, the exit status and output of a check; never the helper's internal values except through a compile's result. Prior art: each component spec's node-level Sass compile test (ADR 0012's compile test, [Sass packaging for the new library](../issues/57-sass-packaging.md), decision 18), whose check cases each entry above lists; the Variant declaration tooling spec's builder, sync generator, and workspace e2e tests.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`, `npx nx test-storybook <lib>`)

No stories of their own: the checks render nothing. The library's preview stylesheet includes every Library mixin after `foundation-everything`, with `_settings-overrides.scss` carrying every required setting, so the Storybook compile runs every check and compiles; a mixin that refuses to compile with a Foundation default is satisfied through the overrides, never by skipping its include (storybook-conventions section 5). The stories' own contrast assertions and the Accessibility gate stay in the first milestone.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

No cases: nothing here touches the DOM. The Runtime checks' reading of the presence markers is the [Spec: Runtime checks (later milestone)](../issues/162-spec-runtime-checks-later-milestone.md)'s.

### 3. Node-level Vitest

In the library's `test` target and, for the workspace cases, in the tooling e2e project. SSR smoke: none, because nothing here renders on the server.

- Sass compile, real Dart Sass 1.104 over Foundation 6.9.0's settings file and an overrides file after it, with `@import 'ngx-foundation-sites';`: every check case listed under The checks, per component spec, and every presence-marker case of P1 to P5. Each exact-helper pin (`#116666` on `#0a0a0a` at 2.94:1, `#1177dd` at 4.437:1 and 4.44:1, `#1b7ac2` at 4.517:1, pairs at 4.498:1 or 4.49:1, 2.95:1) stays in its component's cases.
- The import-order guard: the library imported before Foundation, and through `@use`, stops with G1's message; `util/util` alone passes it.
- The builder under Architect's `TestingArchitectHost`: check mode in step and drifted, and a hand-written file (M4).
- The reader on hand-written files: the not-a-module problem (M5), an unknown registry (M6), a derived member type, a bare numeric key, and a non-literal count (M7); zero properties (M3).
- The setup generator on a virtual tree: the `check` configuration on each target it adds; the summary names the CI step (M13).
- Workspace e2e, against the packed package in scratch Nx 23.2 and Angular CLI 22.2 workspaces: `nx sync:check` passes; removing `warning` from one application's Sass makes `nx sync:check` exit 1 with the file and `warning: false` in its details; `CI=true nx build <app>` passes against the stale file (the hazard the CI step exists for); `ng run <app>:nfs-variants:check` passes in step and exits 1 after a Sass change.

### 4. Playwright e2e (`npx nx e2e <fixture-app>-e2e` against the prerendered Fixture app)

No cases of their own: nothing here runs in a browser. The e2e cases that repeat the stories' computed-style contrast assertions in three engines are the library's own component tests and stay with their component specs in the first milestone.

## Out of Scope

- The other four kinds of check: the [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md) and its [Re-run: forgotten-import checks spec for the later milestone](../issues/164-rerun-forgotten-import-checks-later-milestone.md), the [Spec: family checks (later milestone)](../issues/160-spec-family-checks-later-milestone.md), the [Spec: misuse warnings (later milestone)](../issues/161-spec-misuse-warnings-later-milestone.md), and the [Spec: Runtime checks (later milestone)](../issues/162-spec-runtime-checks-later-milestone.md), which also reads the presence markers. Category: `scope-boundary`.
- The library's own tests and gates, which stay in the first milestone (the ruling's item 3): the Accessibility gate, every story and play function with its contrast assertions, their e2e repeats, the Storybook settings overrides, and the Variant declaration tooling's Variant typings check (the library's own post-build gate, with its manifest-to-Sass compile). Category: `scope-boundary`.
- The exact contrast helper and the CSS rules that use it (Badge D9, Label D9, Progress Bar D8), every other Library mixin CSS rule and registry Variant property, and the tooling's generate mode: first milestone. Category: `scope-boundary`.
- The rule that each Variant property has one writer: it stays with the Variant properties in the first milestone (building-blocks 1.13), where every spec already names its writer. Category: `scope-boundary`.
- Checking a grey against a container's background: a stated requirement with no compile check, because the compile knows the page's background, not where a subheader sits (Typography Helpers D23). Category: `other`.
- A mixin parameter that skips a check (`nfs-callout($closable: false, $links: false)`, a Card link-check switch): additive later (Callout D15, Card D8). Category: `other`.
- One check in `nfs-close-button` against every container's background: it would need every container's settings and include order (Close Button D9). Category: `other`.
- Runtime development-mode contrast checks in the directives: rejected as the primary check, because computed colours vary by theme and page and the compile has the settings in hand (ADR 0022). Category: `other`.
- Silencing or replacing any of Foundation's own `@warn` or `@error` messages. Category: `other`.
- Editing a workspace's CI configuration files: the docs name the step and the setup generator prints it. Category: `other`.

## Further Notes

### Design decisions

| # | Decision | Chosen | Alternatives not taken, and why |
| --- | --- | --- | --- |
| D1 | Home | One spec for both halves of the build-time kind, the Library mixin checks and the tooling's check mode (the ruling's item 1) | The checks back in each component spec (the ruling); a separate spec for the check mode (the ruling names one spec per kind) (`superseded`) |
| D2 | Grouping | Per component spec, alphabetical, one id per manifest entry; each shared mechanism said once (S1 to S10) and pointed to from each entry | Grouped by criterion (a component's later re-run would collect its checks from several sections) (`other`) |
| D3 | Fidelity | Each check's severity, message shape, trigger, and tests as its spec gave them | One message format and one severity rule for every mixin (a redesign the ruling did not ask for, and the later milestone weighs the kinds as specified) (`other`) |
| D4 | The contrast helper | Ships in the first milestone; the checks reuse it | Deferred with the checks (the Badge's and Label's correcting rules and the Progress Bar's meter text would fall back to Foundation's pick, measured picking the failing candidate) (`platform-or-a11y`) |
| D5 | Checks-only mixins | `nfs-abide`, `nfs-forms`, `nfs-title-bar`, `nfs-top-bar`, and `nfs-typography-base`, and `nfs-media-object` for P3, exist only in the later milestone | Empty mixins in the first milestone as stable include points (an API that does nothing, against ADR 0012's rule that a component needing neither custom CSS nor checks has no mixin) (`other`) |
| D6 | The import-order guard | A build-time check (G1), deferred | A precondition kept in the first milestone (the shared manifest's call; the library emits its CSS the same without it) (`other`) |
| D7 | Presence markers | P1 to P5, taken from their owner specs, written in this milestone; the Runtime checks spec reads them | Left with the Variant properties (the first milestone would write properties nothing reads, and Media Object's mixin would exist only for them) (`other`); with the Runtime checks spec (the ruling lists presence markers under build-time checks, and their writer is a Library mixin) (`other`) |
| D8 | The check mode's messages | M2's check form, M3, M4 to M7, and M13's CI line here; M1, M2's thrown form, M8 to M12, and the rest of M13 (its `declare global {}` hint included) stay with generate mode | The whole Messages table here (the manifest's reading; generate mode would lose the reports of its own failures) (`other`) |
| D9 | Existing targets | An Nx migration, reused as an `ng update` migration, adds the `check` configuration to targets the first milestone wrote | Docs only (every workspace edits each target by hand) (`other`) |
| D10 | Rollout | A compile stop added after the first published release lands with an Angular major; warnings, presence markers, new checks-only mixins, and the check step are additive | A `@warn` first and an `@error` at the major (two severities per check across releases, and a warning a consumer scrolls past, the reason Forms D11 rejected `@warn`) (`other`); an opt-in flag such as `$nfs-checks: true`, on by default at the major (a setting no spec designed, which every consumer would have to learn and later remove) (`other`); no rule (a minor release would stop consumers' builds, against ADR 0045) (`other`) |
| D11 | Quotes | A check one spec quotes and another owns is taken once, from its owner (dropdown-menu/4, not the Nested menu's WCAG row); the closing section lists every quoting spec | Taking the quote as a second check (two specs for one check) (`other`) |

### Usage examples

A consumer's stylesheet on Foundation's defaults, in the later milestone:

```scss
@import 'foundation-sites/scss/settings/settings';
@import 'foundation-sites/scss/foundation';
@import 'ngx-foundation-sites';

@include foundation-everything;
@include nfs-breakpoint-properties;
@include nfs-button;
```

The compile stops with `nfs-button`'s `@error`, naming `$button-palette` and the failing `alert`, `success`, and `warning` pairs with their ratios. The fix is the Button spec's required setting, written after the settings file:

```scss
$button-palette: map-merge($foundation-palette, ('alert': #bf3f2c, 'success': #177a3d, 'warning': #8a5a00));
```

A stylesheet that imports the library first stops at once:

```
@import Foundation (or its util/util) before ngx-foundation-sites.
```

CI in an Nx workspace, and on the Angular CLI:

```
npx nx sync:check   # its own CI step, before any task
npx ng run shop:nfs-variants:check
```

A check failure after `purple` was dropped from `$button-palette` and `warning` put back into `$label-palette` without a sync:

```
ngx-foundation-sites: <file> no longer matches <stylesheet>:
  NfsButtonPaletteOverrides: remove purple: true (purple is not in --nfs-button-palette)
  NfsLabelPaletteOverrides: remove warning: false (warning is in --nfs-label-palette again)
Run `nx sync` to update it.
```

### Source map

Every `build-time` entry of the seven manifests, by its heading, and where it lands. Counts: group a 6, b 12, c 3, d 15, e 6, f 4 (plus two headings that record a component with no check), shared 29.

| Manifest | Entry | Here |
| --- | --- | --- |
| [a](../research/checks-extraction-a.md) | nfs-abide Sass contrast checks | abide/1 |
| a | nfs-accordion Sass @warn contrast check | accordion/1 |
| a | nfs-accordion-menu Sass @error checks | accordion-menu/1 |
| a | nfs-badge Sass @error contrast checks | badge/1 |
| a | nfs-breadcrumbs Sass @error contrast checks | breadcrumbs/1 |
| a | nfs-button Sass @error contrast checks | button/1 |
| [b](../research/checks-extraction-b.md) | `nfs-callout` contrast check | callout/1 |
| b | `nfs-card` divider-link contrast check | card/1 |
| b | `nfs-close-button` glyph contrast check | close-button/1 |
| b | `nfs-drilldown` arrow contrast check | drilldown-menu/1 |
| b | `nfs-drilldown` toggle and row target-size check | drilldown-menu/2 |
| b | `nfs-drilldown` current-link fill contrast check | drilldown-menu/3 |
| b | `nfs-dropdown-menu` arrow contrast check | dropdown-menu/1 |
| b | `nfs-dropdown-menu` current-link fill contrast check | dropdown-menu/2 |
| b | `nfs-dropdown-menu` toggle and row target-size check | dropdown-menu/3 |
| b | `nfs-dropdown-menu` submenu min-width warning | dropdown-menu/4 |
| b | `nfs-dropdown-menu` Top Bar pairs warning | dropdown-menu/5 |
| b | `nfs-dropdown-pane` width warning | dropdown/1 |
| [c](../research/checks-extraction-c.md) | `nfs-forms` Library mixin's five `@error` checks (D11) | forms/1 |
| c | `nfs-label` Library mixin's contrast `@error` check (D9) | label/1 |
| c | `nfs-menu` Library mixin's contrast and target-size `@error` checks | menu/1 |
| [d](../research/checks-extraction-d.md) | Current-link fill contrast (1.4.1) | nested-menu/1 |
| d | Arrow contrast (1.4.11) | nested-menu/2 |
| d | Toggle size and row height (2.5.8) | nested-menu/3 |
| d | Dropdown reflow at 320 px (1.4.10) [defined by the Dropdown Menu spec's mixin, referenced here] | dropdown-menu/4, taken once from its owner (D11) |
| d | Close button colours (1.4.11, 1.4.3) | off-canvas/1 |
| d | Anchor colour against the panel background (1.4.3) | off-canvas/2 |
| d | Reflow, `$offcanvas-sizes` Zero-breakpoint entry (1.4.10) | off-canvas/3 |
| d | `$maincontent-class` rename (presence marker) | off-canvas/4 |
| d | Bullet and selected-bullet contrast (1.4.11, 1.4.1) | orbit/1 |
| d | Caption text and arrow background contrast (1.4.3, 1.4.11) | orbit/2 |
| d | Item, current, and ellipsis text contrast (1.4.3) | pagination/1 |
| d | Current fill and disabled-text contrast (1.4.1) | pagination/2 |
| d | `$pagination-mobile-current-item` drift warning (D9) | pagination/3 |
| d | Meter text contrast (1.4.3, D9) | progress-bar/1 |
| d | Arrow colour contrast (D17) | prototyping-utilities/1 |
| [e](../research/checks-extraction-e.md) | nfs-responsive-toggle mixin's argument checks | responsive-toggle/1 |
| e | nfs-reveal mixin's close-glyph and dialog-edge contrast checks | reveal/1 |
| e | nfs-slider mixin's contrast and focus-ring checks (rule 0a) | slider/1 |
| e | nfs-switch mixin's contrast, focus-ring, and size checks | switch/1 |
| e | nfs-table mixin's stacked-header and contrast checks | table/1 |
| e | nfs-tabs mixin's contrast checks (D23, D26) | tabs/1 |
| [f](../research/checks-extraction-f.md) | Library mixin `@error`/`@warn` checks - not present for Toggler | none: the manifest records that the Toggler has no Library mixin (not counted) |
| f | Library mixins' `@error`/`@warn` checks (`nfs-menu-icon`, `nfs-title-bar`, `nfs-top-bar`) | top-bar/1 |
| f | `nfs-typography-helpers` and `nfs-typography-base` `@error` checks | typography-helpers/1 |
| f | CI check mode (`nx sync:check`, the Architect builder's `check` configuration) and its messages | variant-declaration-tooling/1 |
| f | The Variant typings check (the build assertion) | boundary, left out: the library's own build gate stays in the Variant declaration tooling spec |
| f | not present for xy-grid | none: the manifest records that `nfs-xy-grid` has no check (not counted) |
| [shared](../research/checks-extraction-shared.md) | Exact WCAG contrast formula in a compile-time `@error`, never Foundation's approximations | S1 |
| shared | Target-size floor and non-text-contrast `@error`, general rule | S2 |
| shared | `nfs-button` contrast and size `@error` | button/1 |
| shared | `nfs-forms`, Switch, and Slider focus-ring contrast `@error` | forms/1, switch/1, slider/1 (S6) |
| shared | `nfs-abide` invalid-state contrast `@error` | abide/1 |
| shared | `nfs-close-button` size floor and contrast `@error` | close-button/1 (S5); the floor is a CSS rule and stays |
| shared | `nfs-menu-icon` / `nfs-title-bar` / `nfs-top-bar` checks | top-bar/1 |
| shared | `nfs-button-group` arrow-contrast and floor `@error` | button/1: the Button Group has no check of its own |
| shared | `nfs-callout` contrast `@error` | callout/1 |
| shared | `nfs-progress-bar` meter-text contrast `@error` | progress-bar/1 |
| shared | `nfs-pagination` size floor and contrast `@error` | pagination/1, pagination/2; the floor is a CSS rule and stays |
| shared | `nfs-breadcrumbs` contrast `@error` | breadcrumbs/1 |
| shared | `nfs-switch` contrast/height `@error` and inner-label `@warn` | switch/1 |
| shared | `nfs-badge` text-contrast `@error` | badge/1 |
| shared | `nfs-card` text/link contrast `@error` | card/1 |
| shared | `nfs-label` text-contrast `@error` | label/1 |
| shared | `nfs-prototyping-utilities` arrow-contrast `@warn` | prototyping-utilities/1 |
| shared | `nfs-typography-helpers`/`nfs-typography-base` contrast `@error` | typography-helpers/1 |
| shared | `nfs-table` stacked-header and contrast `@error` | table/1 |
| shared | Variant-property one-writer rule and flag-gated presence markers | Presence markers, P1 to P5; the one-writer rule is a boundary case, left out (Out of Scope) |
| shared | Variant declaration file sync generator / Architect builder check mode | variant-declaration-tooling/1 |
| shared | `nfs-tabs` Variant and contrast compile-time checks | tabs/1 |
| shared | `nfs-menu` compile-time checks (1.4.3, 1.4.1, 2.5.8) | menu/1 |
| shared | Compile-time check with the exact WCAG formula where axe has no rule (P17) | S1 |
| shared | "Declaration drift" glossary term | boundary, left out: the term stays in the glossary, because generate mode rewrites on the same drift; this spec uses it |
| shared | Library mixin gets "custom CSS or compile-time checks" | S2 |
| shared | "...or compile-time check that its documented markup lacks" | S1 |
| shared | "Keeping it in step" -- Nx sync generator, `nx sync:check`, Architect builder check configuration | variant-declaration-tooling/1 |
| shared | "the exact WCAG contrast formula" reused for Library mixins, dated note | none: its manifest excludes it (a superseded first draft of ADR 0040, never a check) |

Taken by this ticket from outside the manifests' `build-time` lists: the import-order guard (G1; the shared manifest kept it as a precondition, its boundary call 5), and the five presence markers (P1 to P5; the group manifests list them only as data a Runtime check reads, or as kept).

### Tooling changes to adopt when they arrive

- Foundation moving to Sass modules, or Dart Sass 3.0 removing `@import`: the checks and the guard move with the Library mixins (ADR 0012); the guard's message then names `@use`.
- axe-core gaining a 1.4.11 rule: the story gate would cover some non-text pairs; the compile checks still see states and palette entries no story renders.
- Nx running task sync generators in CI: `nx sync:check` would become a safety net rather than a requirement (the Variant declaration tooling spec).
- An `@angular/build` hook inside its Sass compile: the declaration file could be checked inside the build.

### What the later milestone adds back, per component spec

When this spec lands, each component spec's re-run adds back, from the entry named: the check itself (its Sass subsection text), its tests (the cases listed in its entry, in its node-level Vitest layer), and each sentence that names it. The locations are the spec's own section names at `53144f3`.

- [Spec: Abide](../issues/31-spec-abide.md): abide/1 and the `nfs-abide` mixin with its include line (after `nfs-forms`); the Sass compile bullet; the "Sass and custom CSS" sentence on the checks-only mixin; the Sass subsection's items 1 and 5; the check clauses of the WCAG rows 1.4.1, 1.4.3, and 1.4.11; D15, D21, and D22; user stories 39 and 41.
- [Spec: Accordion](../issues/15-spec-accordion.md): accordion/1; the Sass compile bullet's `@warn` cases; the `@warn` clause of the WCAG row 1.4.3; the Sass item 1 checks sentence and item 5; D19; the Problem Statement's mention; user stories 29 and 38.
- [Spec: Accordion Menu](../issues/20-spec-accordion-menu.md): accordion-menu/1; the Sass compile test's check cases; the check clauses of the WCAG rows 1.4.1, 1.4.11, and 2.5.8; the Sass subsection's Checks paragraph; D12 and D18; user stories 35 and 47.
- [Spec: Badge](../issues/93-spec-badge.md): badge/1; the Sass compile cases that stop the compile; the WCAG row 1.4.3's check clause; Sass item 1(c) and item 5's check clause; the check clauses of D9 and D10; the "Foundation behaviour changed" bullet on the stopped compile; user stories 18 to 21.
- [Spec: Breadcrumbs](../issues/88-spec-breadcrumbs.md): breadcrumbs/1; the Sass compile cases that stop the compile; the WCAG row 1.4.3's check clause; the Sass Checks paragraph and item 5; D9; user stories 18 and 19.
- [Spec: Button](../issues/37-spec-button.md): button/1 and P1; the Sass compile cases that stop the compile and P1's property cases; the check clauses of the WCAG rows 1.4.1, 1.4.3, and 1.4.11; Sass item 2's checks and `--nfs-button-responsive-expanded`; D16, D19's gated property, and D23; user stories 41, 42, and 44.
- [Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md): P5, the `--nfs-breakpoint-<name>` properties in `nfs-breakpoint-properties`' Sass items 1 to 3 and 5 and in Rendered output, with their Sass compile cases; the Runtime checks that read them are the Runtime checks spec's.
- [Spec: Button Group](../issues/82-spec-button-group.md): no check of its own; the sentences that name `nfs-button`'s check (its WCAG row, D13, and Sass item 2's "no compile-time check of its own").
- [Spec: Callout](../issues/89-spec-callout.md): callout/1; the Sass compile cases that stop the compile; the check clauses of the WCAG rows 1.4.3 and 1.4.11; Sass item 1(c); D7 and D15; the Solution's sentence; the Out of Scope and "Foundation behaviour changed" lines that name the check; user stories 18 to 21.
- [Spec: Card](../issues/90-spec-card.md): card/1; the Sass compile cases that stop the compile; the WCAG row 1.4.3's check clause; Sass item 1(b); D8; the Solution's sentence; the Out of Scope and "Foundation behaviour changed" lines that name the check; user stories 11 to 13.
- [Spec: Close Button](../issues/83-spec-close-button.md): close-button/1; the `#aaaaaa` case; the WCAG row 1.4.11's check clause, with the containers that check their own backgrounds; Sass item 1(c); D9; the Solution's sentence; user story 25.
- [Spec: Drilldown Menu](../issues/22-spec-drilldown-menu.md): drilldown-menu/1 to /3; the Sass compile cases that stop the compile; the check clauses of the WCAG rows 1.4.1, 1.4.11, and 2.5.8; the Sass Checks paragraph; D20 and D30; user story 31.
- [Spec: Dropdown](../issues/26-spec-dropdown.md): dropdown/1; the Sass compile test's warning cases; the WCAG row 1.4.10's warning sentence; Sass item 1's check sentence; D22; the Solution's sentence; user story 36.
- [Spec: Dropdown Menu](../issues/21-spec-dropdown-menu.md): dropdown-menu/1 to /5; the Sass compile cases that stop the compile or warn; the check clauses of the WCAG rows 1.4.1, 1.4.3, 1.4.10, 1.4.11, and 2.5.8; the checks of Sass rule 1(f); D13, D14, D19, and D21's check clause; the Solution's and the Problem Statement's sentences; user stories 23, 36, and 37.
- [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md): P2; its Sass compile cases; `--nfs-flexbox-responsive-breakpoints` in Sass items 1 and 6 and D14.
- [Spec: Forms](../issues/98-spec-forms.md): forms/1 and the `nfs-forms` mixin with its include line; the Sass compile bullet; the check clauses of the WCAG rows 1.4.1, 1.4.3, and 1.4.11; Sass items 1 and 5; D11; the Solution's sentence on the checks-only mixin; user story 26.
- [Spec: Label](../issues/94-spec-label.md): label/1; the Sass compile cases that stop the compile; the WCAG row 1.4.3's check clause; Sass item 1(c) and item 5's check clause; the check clauses of D9 and D10; user stories 19 to 23.
- [Spec: Magellan](../issues/30-spec-magellan.md): no check of its own; the WCAG sentence that names `nfs-menu`'s 1.4.1 check (menu/1).
- [Spec: Media Object](../issues/91-spec-media-object.md): P3 and the `nfs-media-object` mixin with its include line; its Sass compile bullet; D6; the Sass subsection's items 1, 5, and 6.
- [Spec: Menu](../issues/85-spec-menu.md): menu/1; the Sass compile cases that stop the compile; the check clauses of the WCAG rows 1.4.1, 1.4.3, and 2.5.8; the Sass Checks paragraph; user story 37.
- [Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md): nested-menu/1 to /3; the Sass compile bullet's check cases; the check clauses of the WCAG rows 1.4.1, 1.4.11, and 2.5.8, and the WCAG row 1.4.10's quote of dropdown-menu/4; the Sass Checks paragraph; D32.
- [Spec: Off-canvas](../issues/25-spec-off-canvas.md): off-canvas/1 to /4; the Sass compile cases that stop the compile or warn; the check clauses of the WCAG rows 1.4.3, 1.4.10, and 1.4.11; Sass item 1(c); D21 and D29; user story 48.
- [Spec: Orbit](../issues/33-spec-orbit.md): orbit/1 and /2; the Sass compile cases that stop the compile; Sass rules 0a and 0b; the check clauses of the WCAG rows 1.4.3 and 1.4.11 and of the forced-colours row; D17's check clauses; user story 32.
- [Spec: Pagination](../issues/87-spec-pagination.md): pagination/1 to /3; the Sass compile cases that stop the compile or warn; the check clauses of the WCAG rows 1.4.1 and 1.4.3; the Sass Checks paragraph; D8's check clause and D9's warning; user story 19.
- [Spec: Progress Bar](../issues/95-spec-progress-bar.md): progress-bar/1; the Sass compile cases that stop the compile; the WCAG row 1.4.3's check clause; Sass item 1(c) and item 5's check clause; D9; the "Foundation behaviour changed" bullet on the stopped compile.
- [Spec: Prototyping Utilities](../issues/102-spec-prototyping-utilities.md): prototyping-utilities/1 and P4; the Sass compile warning case and the flag-property cases; the WCAG row 1.4.11's check clause; Sass item 1(c) and item 6's flag properties; D17.
- [Spec: Responsive Accordion Tabs](../issues/19-spec-responsive-accordion-tabs.md): no check of its own; the sentences that name accordion/1 and tabs/1 (its WCAG rows and its Sass subsection, item 5 included).
- [Spec: Responsive Menu](../issues/23-spec-responsive-menu.md): no check of its own; the sentences that name the mode mixins' checks and top-bar/1 (its WCAG rows 1.4.3, 1.4.11, and 2.5.8, the design decision on the Top Bar, the Sass subsection's item 2, its code comment, and item 5).
- [Spec: Responsive Toggle](../issues/24-spec-responsive-toggle.md): responsive-toggle/1; the Sass compile bullet's `@error` cases; Sass item 1's `@error` sentence; the sentences that name top-bar/1 (its WCAG rows 1.4.11 and 1.4.3 and Sass items 1, 2, and 5).
- [Spec: Reveal](../issues/18-spec-reveal.md): reveal/1; the Sass compile cases that stop the compile or warn; the WCAG row 1.4.11's check clause; the Sass table row that holds the checks; D19, and D28's clause on the 1.4.11 check.
- [Spec: Slider](../issues/32-spec-slider.md): slider/1; the Sass compile cases that stop the compile; Sass rule 0a; the check clauses of the WCAG rows 1.4.11 and 2.4.7; D17 and D26's check clause.
- [Spec: Sticky](../issues/28-spec-sticky.md): no check of its own; the sentence that names the Top Bar's compile-time check of a transparent bar (top-bar/1).
- [Spec: Switch](../issues/84-spec-switch.md): switch/1; the Sass compile cases that stop the compile or warn; the check clauses of the WCAG rows 1.4.3, 1.4.11, 2.4.7, and 2.5.8; Sass item 1(d); D10's warning clause and D11; user stories 25, 26, 31, and 32.
- [Spec: Table](../issues/92-spec-table.md): table/1; the Sass compile cases that stop the compile; the check clauses of the WCAG rows 1.3.1 and 1.4.3; Sass item 1(b); D7's and D11's check clauses; user stories 16 to 18.
- [Spec: Tabs](../issues/16-spec-tabs.md): tabs/1; the Sass compile cases that stop the compile; the check clauses of the WCAG rows 1.4.3 and 1.4.11; the "Sass and custom CSS" paragraph and the Sass subsection's check sentences; D17's, D23's, and D26's check clauses, with D26's rule that every tab strip includes `nfs-tabs`.
- [Spec: Top Bar](../issues/86-spec-top-bar.md): top-bar/1 and the `nfs-title-bar` and `nfs-top-bar` mixins with their include lines; the Sass compile cases that stop the compile or warn, and the helper's two pins; the check clauses of the WCAG rows 1.4.1, 1.4.3, 1.4.10, and 1.4.11; the three mixins' check lists in the Sass subsection; D7's and D8's check clauses.
- [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md): typography-helpers/1 and the `nfs-typography-base` mixin with its include line; the Sass compile cases that stop the compile; the WCAG row 1.4.3's check clause; the Solution's sentence; the Sass subsection's item 2 and the base mixin's check; D9's check clauses and D23's "no compile check" note.
- [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md): variant-declaration-tooling/1: the Solution's check and CI bullets; the builder's `check` option and the write-mode bullet's M4; the `check` configuration in the setup generator's target; the drift report ("Reported as") and the hand-written file checks; M2's check form, M3, M4 to M7, and M13's CI line; the CI steps; the Comparison row "Check mode"; D24 and D29's check clause; the tests listed in variant-declaration-tooling/1; the Problem Statement's "fail CI when it is out of step"; user stories 11, 12, 13, 15, 20, 21, 22, and 36; the WCAG sentence on the Library mixins' compile-time checks; the Sass item 5 clause on M3.

The shared documents (building-blocks 1.10 and 1.13, the architecture guide's P17, the glossary, `storybook-conventions.md`, and ADRs 0012, 0022, 0039, and 0040) are changed by [Task: shared documents for the later-milestone checks](../issues/171-task-shared-documents-later-milestone-checks.md), whose record says what the later milestone restores.
