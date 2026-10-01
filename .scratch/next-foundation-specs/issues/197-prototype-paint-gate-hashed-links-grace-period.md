# 197. Prototype: a paint gate, hashed `<link>` assets, and an unload grace period

Type: prototype
Status: resolved
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

## Answer

Resolved 2026-10-01 (Opus 5.5). Prototype: [prototypes/paint-gate-hashed-links-grace/README.md](../prototypes/paint-gate-hashed-links-grace/README.md).

**Setup.** The workspace is `D:/tmp/nfs-proto-197`, a copy of 192's probe whose `node_modules` is a junction to 189's (remove the junction before deleting the folder). It was measured against production SSR builds in Chromium 153, Firefox 155, and WebKit 26.6. Timings are 5 runs per engine, one engine at a time; a second run with the three engines in parallel agrees on every verdict. The builds are:
- 189's `<link>` loader;
- 192's A, an owned `<style>`;
- E, the plugin's `file` loader, in `production`, `baseHref`, `deployUrl`, i18n, and one-setting-changed builds.

D and G are browser query switches, so the baseline and the variant share one build. Nothing is decided here; 185 chooses.

- **D, paint gate plus `(animate.enter)` listener: works for unstyled frames and enter animations; the gap itself remains.** At 300 ms on `/client-defer`:
  - Visible unstyled frames fell from 19 [19-20] to 0 in every run and engine, and became 18-20 invisible frames.
  - The first styled frame came at the same time either way: 315-328 ms without the gate, 322-328 ms with it.
  - The content below still moves by the same 90px. In Chromium the shift score fell from 0.0064 to 0.0047, and CLS counted 0 only because the shift fell inside the 500 ms input window; two slower runs counted it.
  - `focus()` into the content fails during the gap (`activeElement` stays `BODY`), and is not restored after the load.
  - The content is absent from the accessibility tree during the gap. axe reports the same three page-level violations with and without the gate.
  - On `/enter`, the class form was skipped in 5 of 5 runs per case. The listener form played in 5 of 5, starting on the first visible frame, 314-321 ms median, with no styled frame shown before it.
  - Server-rendered and hydrating pages showed 0 gated frames.
- **E, hashed `file`-loader assets as `<link>`: works with a library-side URL prefix.**
  - Settings, `baseHref` (`/sub/media/`), and i18n (`/da/media/`, `/en-US/media/`) pass.
  - Cache busting passes: one callout setting renamed only that family's asset (`SKWDWX34` to `A74BGC2W`), and a reload after swapping servers went from 44px to 56px.
  - Lifecycle `0 1 1 1 0 1 0`, SSR with JavaScript off, full and incremental hydration, `hydrate on viewport` and `on interaction`, and L1-L3 all pass, as the `<link>` build does.
  - **Attempt 1 fails `deployUrl`.** The import's value is `./media/nfs-callout-<hash>.css` with no `deployUrl`, so hrefs resolve to the page origin. **Attempt 2 passes**: resolving the URL against the global stylesheet's directory, 189's prefix, gives `http://127.0.0.1:4803/cdn/media/*.css`.
  - E keeps the fetch-on-construct gap: 12-20 unstyled frames at 300 ms without D. It writes a second copy under `server/media/`, and its assets miss Angular's CSS optimiser (callout 981 B against 688 B). It needs Nx's `plugins` option, as A does.
- **G, grace period: works; `disabled`: does not.**
  - 20 toggles of 100 ms over 3,000 elements.
  - **Remove at count 0** (baseline): 20 inserts and 20 removes, 20 sheet loads for `<link>`. Chromium recalc 75 ms (`<link>`) and 89 ms (`<style>`).
  - **Grace of 1000 ms**: 1 insert and 0 removes. Chromium recalc 8.2 ms and 7.2 ms, layout 113 against 415 ms. WebKit forced style and layout 34 against 1,695 ms (`<link>`) and 62 against 1,536 ms (`<style>`). Firefox showed no difference (1,072 against 1,025 ms).
  - **Stale style**: under grace, a fresh `.callout` computed 44px just after the last instance left and 0px 1.5 s later, with the element gone; re-acquiring then styled it again.
  - **`link.disabled`** drops the sheet and reparses it on every return: 20 loads, and recalc of 97 ms.
  - **`sheet.disabled`** keeps the parse (1 load) but costs as much recalc as removal: 88 ms (`<link>`), 98 ms (`<style>`).
  - Both `disabled` modes keep the element in `<head>` for the life of the page, with nothing applying (probe 0px).
