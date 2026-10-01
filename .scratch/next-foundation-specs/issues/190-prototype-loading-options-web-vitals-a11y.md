# 190. Prototype: Core Web Vitals, accessibility, and responsiveness of the style loading options

Type: prototype
Status: claimed
Blocked by: 184
Labels: wayfinder:prototype
Map: ../map.md

## Question

When do family styles download, and how does each choice affect Core Web Vitals, accessibility, and responsiveness? The options:

- A: always a separate chunk on first use;
- B: bundled in `main.js`;
- C: a chunk by default, with an `eager` opt-in per family;
- D: a chunk prefetched when the browser is idle after hydration, in the spirit of `injectAsync`'s `prefetch: onIdle`.

Does D shrink the flash window to families used before idle? And how does the `<link>` loader of [Prototype: a `<link>` family style loader with no consumer code](189-prototype-link-loader-no-consumer-code.md) compare, once that prototype resolves?

## User instruction, 2026-10-01

The user wrote, verbatim:

> 1. Measure the unmeasured variant: download chunks at idle after hydration, as `injectAsync`'s `prefetch: onIdle` does. Verify whether it shrinks the flash window to "used before idle".
> 2. Which option would give the best Core Web Vitals score?
> 3. Which option is the most accessible?
> 4. Which option is the most *responsive*?

The orchestrator reads "responsive" as responsiveness to input (INP, and the time from an interaction to a styled paint). Responsive design is not affected by the loading option, because each family's media queries travel with its CSS. The Answer says so and measures the first reading.

## How to work it

Work in a copy of the 184 workspace (`D:/tmp/nfs-proto-lazy-family-styles`) at `D:/tmp/nfs-proto-190`, against production SSR builds. Use the same families as 184, and add one whose first use comes from an interaction (a pane or submenu opened by a click), because that is where a late family hurts INP.

Scenarios:

1. A server-rendered landing page.
2. A client-side route navigation to a page with families the first page did not use.
3. A client-only `@defer` block (`on viewport`, `on interaction`).
4. A first interaction that inserts content of a new family.
5. A family used before idle and one used after.

Network and CPU profiles: unthrottled, Slow 4G with 4x CPU slowdown, and a 300 ms chunk delay as in 184.

Measure:

- Core Web Vitals and their parts: LCP, CLS, INP with `web-vitals` attribution, FCP, TBT, and the Lighthouse mobile performance score. Use Chromium for Lighthouse, and Firefox and WebKit where the metric exists.
- Unstyled frames, and the time from interaction to styled paint.
- Accessibility during the flash: snapshot the accessibility tree and run axe while the family CSS is missing. The point is whether content that Foundation's CSS hides, such as a closed submenu or a `.show-for-sr` neighbour, is exposed or announced, and whether focus indicators, target sizes, or layout positions differ. Also check `prefers-reduced-motion`.
- Download and parse cost per option.

Capture the decisive files and a README under `prototypes/style-loading-options/`. Append an `## Answer` with one table per question, the best option for each question, and where the options trade off. Decide nothing; [Decide: how first-milestone directives load and unload their family styles](185-decide-lazy-family-styles.md) chooses.
