# 30. Prototype: fitting Angular Aria to Yeti by directive composition

Type: prototype
Status: claimed
Blocked by: 29
Labels: wayfinder:prototype
Map: ../map.md

## Question

[Prototype: Angular Aria for the four items that keep a native pattern](29-prototype-aria-for-the-native-pattern-items.md) found that Aria's Toolbar, Menu, and Tabs set the roving `tabindex` and initial state in `afterRenderEffect`. That never runs on the server, so the server HTML has every item at `tabindex="-1"` and Tabs' non-selected panels `inert` (upstream bug candidate A5). It also found that Aria's Accordion puts no closed panel content in the server HTML, and that Toolbar's widget overwrites `aria-disabled`.

Angular's directive composition guide says "components with `hostDirectives` can override any host bindings specified by a host directive" (`adev/src/content/guide/directives/directive-composition-api.md:131`, read). Can the package's directives, hosting Aria's, fix each of these and still meet the rendering-modes contract ([ADR 0011](../adr/0011-rendering-modes-contract-for-yeti.md))?

1. **Toolbar (`buttons`) and Tabs (`tabs`, and the carousel's picker).** Can the hosting directive's own `[attr.tabindex]` give the server HTML one reachable item (the first, or the selected tab) and then hand over to Aria's roving value after hydration, without the two bindings fighting? This has to hold with JavaScript off, before hydration, inside `hydrate never`, and after hydration. Can it also keep `inert` off every slide or panel in the server HTML where ADR 0024 or Yeti's tabs markup needs that? Can a busy button keep Yeti's `aria-disabled="true"`? And can a static `role="group"` be prevented from overriding `toolbar`?
2. **Accordion.** Can Aria's trigger on Yeti's `<summary>` (ticket 29's B2) keep the panel content in the server HTML, for example with content projected directly rather than through `ngAccordionContent`? Can it keep the summary's native activation or stay in sync through `[open]`? Do find-in-page and fragment links still open a closed item? Then the custom Angular alternative: does a heading inside Yeti's `<summary>` (`<summary><h3>…</h3></summary>`) keep Yeti's styles, and does it expose a heading in the accessibility tree in all three engines? That would close A11Y-11 without Aria.

## User instruction, 2026-10-02

The user's own message, verbatim, given after reading ticket 29's findings:

> Generally, only reach for Angular Aria when it addresses an accesibility feature that Yeti is missing. If Angular Aria itself introduces accessibility or SSR/hydration issues or violates any other constraint, first see if it can be modified to fit using other patterns like directive composition. If fitting Angular Aria doesn't seem possible and CDK does not provide a suitable alternative either, add custom, modern Angular-native code.

## How to work it

Two prototypes, reusing ticket 29's workspaces under `D:/tmp/ngx-yeti-29-<item>/`. The first covers points 1 for `buttons`, `tabs`, and the carousel. The second covers point 2. Measure in Chromium, Firefox, and WebKit, as ticket 29 did: computed styles against Yeti's `example.html`, the server HTML with JavaScript off, before hydration, inside `hydrate never`, and after hydration, axe, and the APG keyboard pattern. Each prototype writes `prototypes/aria-composition-<topic>/README.md`, and the orchestrator appends the `## Answer`. Decide nothing.
