# 188. Prototype: unloading family styles after leave animations without private API

Type: prototype
Status: resolved
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

## Answer

Resolved 2026-10-01 (Opus 5.5, with a Sonnet 5.5 read-only search of Angular's tracker and changelog). Prototype: [prototypes/unload-after-leave/README.md](../prototypes/unload-after-leave/README.md). The workspace is a copy of 184's, at `D:/tmp/nfs-proto-188`. It was measured against production SSR builds in Chromium 153, Firefox 155, and WebKit 26.6, in 184's L1, L2, and L3 scenarios, plus full and incremental hydration. The three engines agreed on every pass and leak. Nothing is decided here; 185 chooses.

- **Candidate 1, styles Angular does not own: pass in L1, L2, and L3, public API only.** A `RendererFactory2` provided in the carriers' child `EnvironmentInjector` reads the carrier's `RendererType2.styles` and keeps them away from `SharedStylesHost`. The library then owns a `<style data-nfs-family>`, an adopted sheet, or a `<link>`. Each is removed in the frame the last host leaves the DOM, so a leaving host is never unstyled. Unlike the private wait, it also unloads while an `(animate.leave)` listener stays on the page.
- **`own-style` (owned `<style>`):** The server writes it, the client adopts it by attribute, and hydration sees 0 style mutations and 0 unstyled frames. It needs no carrier chunk at hydration and no consumer change beyond 184. It costs about 70 library lines. It relies on two behaviours read from source but not documented: `createComponent` takes `RendererFactory2` from the given injector (`component_ref.ts:141-148`), and `createRenderer(el, null)` applies no styles (`dom_renderer.ts:193-195`). The library also takes over the nonce and `ng-app-id`-style adoption.
- **`adopted` (constructed sheet):** It passes like `own-style`. The server still has to write a `<style>`, which the client swaps for an adopted sheet at bootstrap (one removal before `DOMContentLoaded`, 0 unstyled frames).
- **`own-link` (owned `<link>` to an `inject: false` bundle):** It needs four `project.json` entries. With the default build it leaks after SSR, because Beasties copies the family's critical rules into an unmanaged `<style>`. It passes with `inlineCritical: false`, which turns off critical-CSS inlining for the global stylesheet too.
- **Candidate 2, timing on the host: fail alone.** Waiting for the host to be disconnected fixes L1 only. Adding the `document.getAnimations()` wait also fixes L2. L3 leaks either way, because Angular's guard reads the global set. The `MutationObserver` host timing is the part candidate 1 reuses.
- **Candidate 3, getting Angular's own removal to run:**
  - `afterNextRender` leaks in all three scenarios.
  - `REMOVE_STYLES_ON_COMPONENT_DESTROY` cannot help (from source, `dom_renderer.ts:174`, `:680-682`): it only turns removal off, and only for the whole application.
  - `retry`, which calls the carrier renderer's public `destroy()` again every 50 ms until the guard passes, matches `private` in every scenario. It polls for as long as any `(animate.leave)` listener element exists, and the unload waits that long too.
- **Candidate 4, upstream: no fix or plan.** angular/angular#66244 reports this exact bug. It has been open since 2025-12-24, and a maintainer called it complicated on 2026-01-06. No PR is linked, and the guard at `dom_renderer.ts:683` is unchanged on `origin/main` (2026-09-25). Nothing was filed.
- **Open:**
  - a host with its own `animate.leave`;
  - cold-network fetches;
  - CSP for adopted sheets and owned links;
  - several applications on one page;
  - later Angular versions changing the behaviours candidate 1 and `retry` depend on.
