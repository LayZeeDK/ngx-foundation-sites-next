# 184. Prototype: a directive that loads and unloads its family's consumer-compiled styles

Type: prototype
Status: open
Blocked by: 182, 183
Labels: wayfinder:prototype
Map: ../map.md

## Question

Does the strongest candidate from [Research: loading and unloading component styles from directives in Angular 22.2](182-research-lazy-style-loading-from-directives.md) work end to end on two families, given the split facts from [Research: splitting Foundation 6.9's CSS per family](183-research-foundation-sass-per-family-split.md)? Pick one family that stands alone, and one that depends on another family's rules (for example Button Group over Button). Run the second-strongest candidate too if the research leaves the choice open.

## How to work it

Build a synthetic Nx 23.2 / Angular 22.2 workspace under `D:/tmp/`, with SSR, and with the Foundation settings changed from the defaults so that a default-compiled stylesheet would show the difference. Measure, in Chromium, Firefox, and WebKit through Playwright:

1. The consumer's settings reach the rendered CSS.
2. The family's CSS is absent before the first directive instance, present while any instance exists, and removed after the last one is destroyed, including after a `animate.leave` animation finishes.
3. The CSS is in the server HTML for a server-rendered instance, with no flash of unstyled content and no duplicate at hydration. Cover full hydration, incremental hydration with `@defer (hydrate on ...)`, and a client-only `@defer` block.
4. The cascade order is the same in every load order (`@layer` or whatever the research found).
5. What the consumer writes, counted in files and lines.

Capture the decisive files and a README with the question, how to run it, and the verdict under `prototypes/lazy-family-styles/` (map, Where things live).
