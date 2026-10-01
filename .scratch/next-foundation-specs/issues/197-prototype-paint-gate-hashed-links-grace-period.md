# 197. Prototype: a paint gate, hashed `<link>` assets, and an unload grace period

Type: prototype
Status: claimed
Blocked by: 192
Labels: wayfinder:prototype
Map: ../map.md

## Question

Do the three untested proposals of [Consult: new approaches to loading family styles](192-consult-fable-style-loading.md) work?

- D, a paint gate: `[data-nfs-pending] { visibility: hidden }` in the global layer, plus an `(animate.enter)` host listener that waits for the family sheet.
- E, hashed `<link>` assets: the plugin's `file` loader emits a hashed CSS asset URL that the library inserts as a `<link>`.
- G, a grace period or `link.disabled`: for a family that opens and closes often, keep its styles briefly instead of unloading and reloading them.

## User instruction, 2026-10-01

> 17. Test these unless you have already done so.

## How to work it

Use 192's probe (`D:/tmp/nfs-proto-192`, whose `node_modules` is a junction to 189's; copy it without following the junction) and 189's loader, in a copy at `D:/tmp/nfs-proto-197`. Measure in Chromium, Firefox, and WebKit against production SSR builds:

- D: invisible frames, layout shift, focus, and axe during the gap, on 189's `/client-defer` and `/enter` at 300 ms.
- E: `deployUrl`, `baseHref`, i18n, cache busting after a settings change, and whether hydration and leave scenarios still pass.
- G: insert and remove a family in a tight loop, then count `<style>` and `<link>` churn, style recalculation time, and whether the grace period leaves a stale style after the last instance.

Capture the decisive files under `prototypes/paint-gate-hashed-links-grace/`, and append an `## Answer`. Decide nothing; [Decide: how first-milestone directives load and unload their family styles](185-decide-lazy-family-styles.md) chooses.
