# 183. Research: splitting Foundation 6.9's CSS per family

Type: research
Status: resolved
Blocked by:
Labels: wayfinder:research
Map: ../map.md

## Question

Can Foundation 6.9's CSS be compiled one first-milestone family at a time, with the consumer's settings, so that each family's styles can load on their own? Which families cannot be split, because they style elements by tag, depend on another family's rules, or depend on source order?

## How to work it

Resolve with a `/research` subagent against `d:/projects/github/foundation/foundation-sites` (6.9.0) and Dart Sass 1.104.1 (the version `@angular/build` 22.2.0 pins), compiling fixtures under the session scratchpad. For each Foundation export mixin used by a first-milestone spec (`specs/*.md` without `Milestone: later`; their Sass subsections name the mixins), with `file:line`:

1. Compile `settings + foundation (util only) + @include foundation-<x>` alone. Does it compile, what does it emit, and how large is it, minified and gzipped?
2. Which rules of other families it needs or overrides (for example `.button-group .button` over `.button`, the menu-based families, `.dropdown.menu`), and which of its selectors depend on being emitted after another family's selectors to win at equal specificity.
3. Whether it emits element or attribute selectors that apply without a library directive (Forms' `[type='text']`, `select`, `label`; `foundation-global-styles`; `foundation-typography-base`). Rules like these cannot follow a directive's lifecycle.
4. What `foundation-everything` emits once and that per-family compiles would emit again (resets, `foundation-mq` meta rules, keyframes, Motion UI classes), and what the duplication costs.
5. Whether the library's own Library mixins (ADR 0012; each spec's Sass subsection) can be compiled the same way, beside their export mixin.

Write `research/foundation-sass-per-family.md` with a table, one row per export mixin, plus the evidence and the open unknowns. Decide nothing.

## Answer

Resolved 2026-10-01 (Sonnet 5.5). Findings: [research/foundation-sass-per-family.md](../research/foundation-sass-per-family.md). Nothing is decided; [Decide: how first-milestone directives load and unload their family styles](185-decide-lazy-family-styles.md) chooses.

- Every first-milestone export mixin compiles alone after `@import 'settings'; @import 'foundation';` with Dart Sass 1.104.1 (49 of the 50 export mixins compiled; the import itself emits 0 bytes), under Foundation's own settings and under a custom settings file (changed palette with a new `brand` key, radius, and `xlarge` breakpoint class) whose changes show in the output. The one failure is `foundation-typography-base`, a later-milestone mixin: it extends placeholders that only `foundation-typography-helpers` defines (`_base.scss:437`).
- Rules do not repeat across families (Note, 2026-10-01 (audit 0012): except the Float Classes; `foundation-float-classes`, `foundation-flex-grid`, and `foundation-prototype-classes` were not compiled alone, see the findings' section 1, item 2): all 1,373 rules of `foundation-everything` are in one standalone compile each, and the resets, `.foundation-mq`, `.is-visible`, and `.is-hidden` exist only in `foundation-global-styles`. Foundation's Sass has no keyframes or Motion UI classes. The cost of splitting is compression and compile time: the 35 first-milestone mixins are 71,550 bytes minified and 11,271 gzipped in one compile, 17,755 gzipped as 35 files (+57%; brotli 9,637 against 13,697), and 35 separate compiles take 4.4 s against 0.97 s for one.
- Cannot follow a directive: `foundation-global-styles` (45 of 49 rules are tag or attribute rules), `foundation-forms` (23 of 42; `[type=text]`, `select`, `label`, `fieldset`), `foundation-range-input`, `foundation-meter-element`, the tag part of `foundation-table` (9 of 21) and `foundation-progress-element` (5 of 20), and later-milestone `foundation-typography`. In the 35-mixin set that is 58 rules and about 5.7 KB. Every other export mixin is class-scoped.
- Companions: `foundation-accordion-menu`, `-drilldown-menu`, and `-dropdown-menu` style markup that also carries `.menu` and look wrong without `foundation-menu` (bullets, block display); `foundation-button-group` needs `foundation-button`'s base look and `foundation-slider` needs `foundation-range-input`.
- Order: in a Chromium probe of 13 designed markup combinations, emit order changed the computed style only for `foundation-menu` against `foundation-drilldown-menu` (nested list margin) and against `foundation-dropdown-menu` (nested list `display`, `position`; equal specificity 0,1,0), where `foundation-menu` must come first. Foundation's own order does that.
- `foundation-everything` assigns `$global-flexbox: true !global` and `$xy-grid: true !global` before it includes anything (`foundation.scss:85-91`), so with `$global-flexbox: false` in the settings per-family includes and `foundation-everything` give different menus.
- Library mixins have no code. From the specs, each follows its export mixin and several win at equal specificity by coming later, which a file holding both mixins in that order keeps and two files loaded in any order do not. Not tied to one family: `nfs-motion` (shared keyframes), `nfs-breakpoint-properties` and the Variant properties (`:root`), `nfs-smooth-scroll` (`html`), and `nfs-menu` and `nfs-close-button` (included by several Plugins). Two throwaway stubs written from the specs compiled beside their export mixins and followed the settings.
- Open unknowns (Note, 2026-10-01 (audit 0012): the shared-settings question is measured for one family in [research/lazy-style-loading.md](../research/lazy-style-loading.md), 5.2: `includePaths` plus one `@import 'settings'` per family file): the order probe covers 13 combinations in Chromium with default settings only; how an application build would give each family file the same settings; whether the Variant-declaration generator, which reads `:root` properties from a compile of the global stylesheet, would see lazily loaded families; sizes and sharing of the Library mixins' output; and whether `menu.md`'s reliance on `foundation-flex-classes` for `align` means the generic `.align-*` classes.
