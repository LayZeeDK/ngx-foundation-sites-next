# 188. Prototype: unloading family styles after leave animations without private API

Type: prototype
Status: claimed
Blocked by: 184
Labels: wayfinder:prototype
Map: ../map.md

## Question

[Prototype: a directive that loads and unloads its family's consumer-compiled styles](184-prototype-lazy-family-styles.md) found that a family's styles unload reliably after leave animations only through Angular's private `ɵallLeavingAnimations`. An element with an `(animate.leave)` listener joins Angular's leaving set when its view is created (`packages/core/src/render3/instructions/animation.ts:416`), and `NoneEncapsulationDomRenderer.destroy()` skips `removeStyles` while that set is not empty (`packages/platform-browser/src/dom/dom_renderer.ts:683`). How can the library unload a family's styles after the last instance and its leave animation are gone, using public API only, and what does each way cost?

## User instruction, 2026-10-01

Asked whether to accept the private API, the user wrote, verbatim:

> Private API: Use subagents to perform additional research and prototypes on how to solve this problem.

## How to work it

Research, then prototype the candidates in the 184 workspace (`D:/tmp/nfs-proto-lazy-family-styles`) or a copy of it, measured in Chromium, Firefox, and WebKit against a production SSR build, in the three leave scenarios 184 used. Candidates to cover, plus any the research finds:

1. Styles that Angular's renderer does not own, so Angular's skip does not apply: a `<link>` or `<style>` the library inserts and removes itself, as this repository's `NfsStyleLoader` does (`packages/ngx-foundation-sites/src/lib/core/nfs-style-loader.service.ts`), or a constructed stylesheet in `document.adoptedStyleSheets` (Baseline status on the map's Browser support date). It also covers how such styles reach the server HTML and are adopted at hydration with public API.
2. Timing the unload on the host element itself: wait until the last host is disconnected (`isConnected`, a `MutationObserver`), or until `element.getAnimations()` on the leaving host settle, rather than reading Angular's global set.
3. A carrier whose styles Angular removes: whether any public renderer or `RendererFactory2` hook, `REMOVE_STYLES_ON_COMPONENT_DESTROY` setting, or `afterRenderEffect` timing gets the removal to run.
4. Upstream: whether Angular's issue tracker or changelog shows the skip being changed or a public API for it planned. Read only; file nothing (map, Open-decision pass).

Capture the decisive files and a README under `prototypes/unload-after-leave/`. Append an `## Answer` with a verdict per candidate. Decide nothing; [Decide: how first-milestone directives load and unload their family styles](185-decide-lazy-family-styles.md) chooses.
