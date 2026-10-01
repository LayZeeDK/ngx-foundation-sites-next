# 198. Prototype: what the candidates cost in development, under CSP, with several applications, and at unload

Type: prototype
Status: resolved
Blocked by: 192
Labels: wayfinder:prototype
Map: ../map.md

## Question

The leading candidates are:

- 184's carriers, with 188's owned `<style>`;
- 189's `<link>` loader;
- proposal A of [Consult: new approaches to loading family styles](192-consult-fable-style-loading.md), CSS in the directive's chunk.

What do they cost in the places no ticket has measured? Those places are `ng serve` and HMR, a strict Content Security Policy, several Angular applications on one page, and the unload machinery itself: the `MutationObserver` on `document`, the hold scan for server-rendered instances, and the handling of inlined critical CSS.

## User instruction, 2026-10-01

> 18. Measure this unless you have already done so.

## How to work it

Use copies of the 188, 189, and 192 workspaces under `D:/tmp/nfs-proto-198-*`. Never follow or delete through the junction in 192's copy. Measure in Chromium, Firefox, and WebKit unless noted:

1. Dev server: cold start, rebuild after a Foundation settings edit and after a component edit, and whether the change shows without a full reload (HMR). Use Chromium only if the other engines add nothing.
2. CSP: a strict policy with a nonce (`ngCspNonce` or `CSP_NONCE`) and no `unsafe-inline`. Does each candidate's `<style>` or `<link>` load, on the server and the client? Also test `require-trusted-types-for 'script'` where the engines support it.
3. Several applications on one page: two Angular applications bootstrapped on one document, sharing and not sharing a family. Count the styles, check whether unloading one application removes styles the other uses, and check what each engine's state shows.
4. Unload machinery cost: on a page with 1,000 and 5,000 directive hosts, measure insert and remove time, style recalculation, `MutationObserver` callback time, memory, and long tasks, against a baseline with no loader.

Capture the decisive files under `prototypes/candidate-costs/`, and append an `## Answer` with one table per point. Decide nothing; [Decide: how first-milestone directives load and unload their family styles](185-decide-lazy-family-styles.md) chooses.

## Answer

Resolved 2026-10-01 (Opus 5.5). Prototype: [prototypes/candidate-costs/README.md](../prototypes/candidate-costs/README.md). Copies of the 188, 189, and 192 workspaces are at `D:/tmp/nfs-proto-198-188`, `-189`, and `-192`; their `node_modules` are junctions, so remove the junction before deleting a copy. Everything was measured against production SSR builds and `nx serve` in Chromium 153, Firefox 155, and WebKit 26.6. "own" is 184's carriers with 188's `own-style`, "link" is 189's loader, and "chunk" is 192's proposal A. Timings are medians of 5 runs; the README has the ranges and one table per point. Nothing is decided here; 185 chooses.

- **1 Dev server.**
  - **Cold start:** baseline 7.9 s, link 7.8 s, own 10.5 s, chunk 10.9 s.
  - **Settings edit:** link HMRs in 0.47 s and the baseline in 0.52 s. own does a full reload (1.0 s). **chunk never shows the edit**: the dev server logs "No output file changes", and the edit appears only after a code change or a restart.
  - **Component edit:** about 0.3-0.4 s for the baseline, own, and link, and **2.1 s for chunk** (1.9 s rebuild).
  - **HMR leak in link:** after the stylesheet update, link's family **never unloads** in any engine, because Vite replaces the tracked `<link>` with an untracked copy.
- **2 CSP, under Angular's documented `style-src 'self' 'nonce-N'`.** own and link load on the server and the client in all engines. **chunk's `<style>` is blocked everywhere** (no nonce).
  - **Nonce-only `style-src`:** link's family links are blocked too, and so is Angular's own global `styles-*.css` link. The build adds a nonce to `<style>` and `<script>` only (`@angular/build` `nonce.js:22-36`).
  - **Copying `CSP_NONCE`:** one `setAttribute('nonce', ...)` per inserted element, as own does, makes link and chunk pass every policy. Angular takes the nonce from `[ngCspNonce]` in the body (`NG/packages/core/src/application/application_tokens.ts:142`) and applies it in `SharedStylesHost` (`shared_styles_host.ts:240-243`).
  - **Trusted Types:** exists in all three engines, and `require-trusted-types-for 'script'` raised no violation for any candidate.
- **3 Two applications on one document, the same for all candidates and engines.** A shared family gets one element, which the second application adopts. The first application then removes it when its own count reaches 0, through `appRef.destroy()` or by hiding its instance, and **the other application's callout loses its styles**. Families that are not shared are unaffected, except that link and chunk then cannot reload a family the first application removed: their service adopted that element at start and keeps tracking it.
- **4 The `MutationObserver` and the hold scan are cheap.** With 5,000 hosts, observer callbacks total at most 31 ms. Angular detaches nodes before destroy hooks, so it fires only for the library's own removals or under a leaving ancestor. The hold scan over 5,000 server-rendered hosts takes 8-22 ms, and each host carries 26 B of `data-nfs-styles`.
- **4 Per-host cost against the no-loader baseline, 5,000 hosts (Chromium).** Insert takes about 170-190 ms against 116-123 ms, and remove 69-81 ms against 35-38 ms. Heap is about 1.4 MB higher (about 290 B per host). own's cold first use restyles twice (199.5 ms of style recalc against 11.7-13.0 ms), because its carrier chunk arrives after the hosts render.
- **4 Hosts that leave inside an animating ancestor cost a quadratic amount, in every candidate.** Each `release()` prunes the whole leaving set, and each schedules its own frame check. At 5,000 hosts that is 510-560 ms of `release()` and 1.0-2.1 s of frame checks in Chromium. The removes take 1.5 s (own), 2.7 s (link), and 2.7 s (chunk) in Chromium, with a longest frame of 1.0-2.6 s, against 40 ms without the loader. A coalesced check was not tried.
- **Unknowns.**
  - Timing ran beside another prototype's servers on the same machine.
  - chunk on plain Angular CLI, and a fix for its settings edit, were not tried; nor was a fix for link's HMR leak.
  - Neither `autoCsp` nor the `CSP_NONCE` token route was tried.
  - Two hydrating server-rendered applications were not tried.
  - Style recalc, heap, and long tasks are Chromium only.
