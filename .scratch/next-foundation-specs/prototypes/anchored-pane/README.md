# Prototype: Anchored pane positioning, measured Positionable port versus CDK Overlay

Ticket: [Prototype: Anchored pane positioning, measured Positionable port versus CDK Overlay](../../issues/44-prototype-anchored-pane.md). Throwaway code; only the decisive files are here.

## Question

Does an in-place positioner run from `afterRenderEffect` with `ResizeObserver` match Foundation 6.9's 12 placements, auto-position fallback order, body-box bound, RTL, and scrolling ancestors for `.dropdown-pane` and `.tooltip`, without CDK Overlay? Where it fails, does CDK Overlay (`FlexibleConnectedPositionStrategy` with `withPopoverLocation('inline')`) cover the case while keeping Foundation's pane CSS?

## What is here

A plain Angular CLI 22.2.0 application created with `npx @angular/cli@22.2.0 new app --ssr --style=scss --zoneless` (not an Nx workspace: the orchestrator asked for the smallest runnable thing), plus `@angular/cdk@22.2.0`, `foundation-sites@6.9.0`, and `@playwright/test@1.63.0`.

- `src/app/positionable.ts` -- the pure port of Foundation's `Box.GetExplicitOffsets`, `Box.OverlapArea`, the body-box bound, and `Positionable._setPosition`'s search order and least-overlap fallback. No DOM access.
- `src/app/anchored-pane.ts` -- `anchoredPositioner()`: measures in the `afterRenderEffect` `earlyRead` phase, computes the placement, and writes `top`/`left` in the `write` phase on Foundation's own `position: absolute` element. A `ResizeObserver` on the pane, the anchor, and `body` re-runs it. `NfsDropdownPane` sits on `.dropdown-pane`. `NfsTooltip` sits on the trigger and creates the `NfsTooltipTip` (`.tooltip`, `role="tooltip"`) as its next sibling on first show, then keeps it. An optional `followScroll` input (not in Foundation) also re-runs the placement on any captured scroll while the pane is open.
- `src/app/cdk-pane.ts` -- the same fixtures through CDK Overlay: `createOverlayRef` with `createFlexibleConnectedPositionStrategy(...).withPositions(<Foundation's search order>).withFlexibleDimensions(false).withPush(false).withPopoverLocation('inline')`, `createRepositionScrollStrategy`, `direction: 'ltr'`, `panelClass: ['dropdown-pane', 'is-open']` or `['tooltip']`, and per-position `panelClass` values for Foundation's placement classes.
- `src/app/fixture.ts` -- one `/fixture` route whose query parameters set the placement, offsets, trigger coordinates, containing block (`none`, `relative`, `scroll`, `scroll-static`, `scroll-plain`), direction, body height, and text length.
- `public/foundation-ref.html` -- builds the same DOM and runs Foundation 6.9's own `dist/js/foundation.js` with jQuery 4.0.0 and `dist/css/foundation.css` (the reference run).
- `src/styles.scss` -- Foundation's `foundation-global-styles`, `foundation-button`, `foundation-dropdown`, and `foundation-tooltip`; fixture layout rules; one CDK-only override (see the ticket answer).
- `e2e/anchored-pane.spec.ts` -- 58 Playwright tests (55 measured cases plus server HTML, computed styles, and the hydrated page). Each case runs the Foundation reference, the port, and CDK on the same page, records the numbers, and soft-asserts that the port matches Foundation and Foundation's formula.
- `e2e/summarize.mjs`, `results/<engine>.txt` -- one line per implementation per case: resolved placement, pane offset from the anchor `(dx,dy)` in px, error against Foundation's formula `e=`, `=F` or `!=F` against the Foundation run, and the follow-up measurements after scroll, resize, or reopen.
- `angular.json`, `package.json`, `playwright.config.ts`.

## How to run

```
cd D:/tmp/nfs-proto-anchored-pane/app
npx ng build
PORT=4441 NG_ALLOWED_HOSTS="localhost,127.0.0.1" node dist/app/server/server.mjs
# in another shell:
npx playwright test            # chromium, firefox, webkit
node e2e/summarize.mjs webkit  # after a run; reads results/webkit.jsonl
```

Delete `results/` before a run; the tests append to it. Browsers: Playwright 1.63.0's Chromium 153.0.8010.12, Firefox 155.0, and WebKit 26.6. All three run on Windows 11 arm64. Last run: 171 passed across the three engines, plus 3 for the tooltip-clipping case added afterwards.

## Verdict

The port reproduces Foundation 6.9 wherever Foundation follows its own formulas, in all three engines, to within 0.02 px: all 12 placements for panes and tips, every fallback case, least-overlap when nothing fits, the body-box bound, RTL, resize, `position: relative` ancestors, and positioned or static scrolling ancestors at open time. It differs from Foundation in three measured places:

- Two Foundation bugs are deliberately not ported: a stale tip height (19.19 px gap), and the tried-positions set that Foundation keeps across opens.
- The in-place tip is clipped by a positioned `overflow: auto` ancestor. Foundation's `body`-appended tip is not.

CDK Overlay reproduces the pane geometry, but it bounds collisions by the viewport, not the body box, has no `allowBottomOverlap`, and needs `cdkScrollable` on scroll ancestors. It also breaks Foundation's `.tooltip` CSS: 5 of 12 placements are off by 209 to 254 px until an override is added, and the tip loses its 10rem `max-width`. CDK-hosted panes are also absent from server HTML. Decision: keep the in-place port (ADR 0002). The tip-clipping trade-off is `OPEN FOR HUMAN`; details are in the ticket answer.

Workspace (not committed; keep or delete): `D:/tmp/nfs-proto-anchored-pane/app`.
