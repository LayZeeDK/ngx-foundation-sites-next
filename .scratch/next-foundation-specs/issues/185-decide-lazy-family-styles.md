# 185. Decide: how first-milestone directives load and unload their family styles

Type: grilling
Status: open
Blocked by: 184
Labels: wayfinder:grilling
Map: ../map.md

## Question

How does each first-milestone family load its styles when its first directive or component renders, and unload them when the last one is destroyed? Which families are exceptions that stay in the consumer's global stylesheet, and why? Forms is the candidate the user named. What replaces or amends [ADR 0012](../adr/0012-sass-packaging.md) ("No library component or directive carries `styles`"), architecture guide P18, and building-blocks 1.13, and what does every first-milestone spec's Sass subsection say afterwards?

## User ruling, 2026-10-01

The user asked, verbatim:

> When we use Angular directives rather than Angular components for most of the Foundation for Sites components, how do we lazy-load and unload component-specific styles? This is a library-wide requirement. Specs that are deferred to a later milestone like prototype and grid classes are assumed to depend on the consumer loading styles in their global stylesheets while specs in the initial milestone are expected to manage component-specific styles lazily. One exception might be Forms. It's unclear how later milestone's specs should manage styles - whether to keep assuming that their styles are loaded in the consumer's global stylesheets or whether it would be possible to lazy load styles.

The requirement itself is settled: first-milestone families manage their styles lazily. The mechanism, the exceptions, and the records it changes are open. The later-milestone half of the ruling is [Decide: how later-milestone families manage their styles](186-decide-later-milestone-family-styles.md).

## How to work it

Grill against the two research tickets and the prototype. Decide at least:

1. The mechanism, and what a consumer writes, including how the consumer's Foundation settings reach the CSS (ADR 0012's reason for having no component styles).
2. The exceptions (Forms, and any family that [Research: splitting Foundation 6.9's CSS per family](183-research-foundation-sass-per-family-split.md) found cannot be split), and where their styles live.
3. The cascade-order rule, and how a family that depends on another family's rules loads them.
4. The rendering-mode contract: server HTML, hydration, `@defer`, and unloading after a leave animation (ADR 0008; building-blocks 1.6 and 1.11).
5. Whether the first milestone keeps a global "everything" path for consumers who do not want lazy styles (ADR 0045 release policy: adding one later is not breaking, removing one is).
6. The records to supersede or amend, and the re-run tickets that bring every first-milestone spec's Sass subsection in line.
7. The records that assume one global compile, which both research files flag: the Variant declaration tooling reads the Variant properties from a compile of the project's global stylesheet (building-blocks 1.13; [ADR 0040](../adr/0040-variant-input-types.md); `specs/variant-declaration-tooling.md:29`); the Storybook preview includes `foundation-everything` and every Library mixin after it (`storybook-conventions.md:97`, `:122`, `:268-269`); and `foundation-everything` forces `$global-flexbox: true`, which per-family includes do not ([research/foundation-sass-per-family.md](../research/foundation-sass-per-family.md), 3.5). Added by audit 0012. The user settled the `$global-flexbox` part on 2026-10-01 (below), so it is a documented assumption, not a point to decide.

## User ruling on `$global-flexbox`, 2026-10-01

The user wrote, verbatim:

> According to https://get.foundation/sites/docs/global.html#sass-variables, $global-flexbox defaults to `true`. I consider a reasonable modern assumption that it isn't disabled.

Checked against the 6.9.0 clone: `$global-flexbox: true !default;` (`scss/_global.scss:112`) and `$global-flexbox: true;` in the settings file (`scss/settings/_settings.scss:98`). The decision therefore assumes `$global-flexbox: true`, so per-family includes and `foundation-everything` give the same Menu output that 3.5 of the findings measured.
