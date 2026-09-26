# Prototype: Orbit on CSS scroll snap

Ticket: [Prototype: Orbit on CSS scroll snap](../../issues/46-prototype-orbit-scroll-snap.md). Feeds: [Spec: Orbit](../../issues/33-spec-orbit.md).

## Question

Does a mandatory horizontal scroll-snap `.orbit-container`, with an IntersectionObserver-driven active slide, Aria tabs as bullets, `setTimeout` autoplay, a rotation control, pause on focus and hover, and a reduced-motion switch, reproduce Foundation Orbit per the APG carousel pattern without Motion UI? What CSS replaces Foundation's JavaScript-measured container height so slides paint from the server, and how does `infiniteWrap` behave?

## Verdict

Yes. Every case passed in Chromium, Firefox, and WebKit, with identical numbers in all three wherever the engines agree. axe finds no violations (WCAG 2.2 AA plus best-practice) once two things are done: the slides are `div`s instead of `ul`/`li`, and the slides keep their own height. All four slides are in the server HTML and paint at first paint without any JavaScript measurement. Bullet and arrow clicks made before hydration replay. The design needs no `@if`-rendered fallback. Three issues are left for the spec:

- Aria's roving tab stop does not follow a selection change that comes from scrolling or autoplay.
- Server HTML has no tab stop in the bullets until Aria's first client render.
- Without JavaScript, the user can scroll to slides that are visible but carry the server's `inert` attribute.

`infiniteWrap` rewinds: it smooth-scrolls back across every slide to the first, rather than continuing forward the way Foundation does. Full answer and results table: the ticket's `## Answer`.

## What is here

The decisive files only. The runnable workspace, with `node_modules`, the builds, and Playwright output, stays at `D:/tmp/nfs-proto-orbit-scroll-snap/orbit` and is not committed.

- `src/app/orbit.ts`, `src/app/orbit.html` -- one throwaway component that stands in for the spec's directive family. The markup is Foundation's Orbit docs markup with the APG changes. Aria `Tabs`/`TabList`/`Tab`/`TabPanel` are used directly, and CDK `Dir` handles RTL. Query params switch options: `delay`, `autoplay=false`, `wrap=false`, `dir=rtl`, `nav=container` (arrows and bullets scroll only the container), and `inside=1` (the zone build's control case).
- `src/_nfs-orbit.scss` -- the documented custom CSS, written as the `nfs-orbit` Library mixin. It is the whole custom CSS list.
- `src/styles.scss` -- Foundation 6.9 Sass in `@import` form (ADR 0012): `foundation-global-styles`, `foundation-typography`, `foundation-button`, `foundation-visibility-classes`, `foundation-orbit`, then `nfs-orbit`.
- `src/main.ts` -- a test hook that records when the application first becomes stable (`__stableAt`).
- `src/app/app.config.zone.ts` -- the zone-based variant, built with `ng build --configuration zone`, which adds `polyfills: ["zone.js"]`, replaces `app.config.ts` with this file, and outputs to `dist/orbit-zone`.
- `src/app/app.routes.server.ts` -- `RenderMode.Server`, so query params reach the server render.
- `e2e/orbit.spec.ts` -- 22 cases against the zoneless build. `e2e-zone/zone.spec.ts` -- stability and replay against the zone build. `e2e-scratch/touch.spec.ts` -- shows that headless Chromium skips the snap after a CDP touch gesture even on plain HTML (a harness limit, not a design failure).
- `results/*.jsonl` -- the numbers each test recorded, one line per case and engine. `chromium.jsonl` holds one headless touch line (`scrollLeft` 592, not snapped) from before the touch case was limited to headed runs, followed by the two headed lines.
- `playwright.config.ts`, `make-slides.mjs` (writes the four SVG slides; slide 3 is 1200x600, the others are 1200x500).

## How to run

A plain Angular CLI 22.2 application (`npx @angular/cli@22.2.0 new orbit --ssr --style=scss`), zoneless by default, plus `@angular/aria@22.2.0`, `@angular/cdk@22.2.0`, `foundation-sites@6.9.0`, `@playwright/test@1.63.0`, and `@axe-core/playwright@4.13.0`. The generator pulled `vitest@^5.0.0`, which was pinned back to `4.1.11` to match the map (it is not used here). `zone.js@0.16.3` is used only by the zone configuration. TypeScript resolved to 6.0.3. `angular.json` sets `security.allowedHosts` to `localhost` and `127.0.0.1`.

```
cd D:/tmp/nfs-proto-orbit-scroll-snap/orbit
node make-slides.mjs
npx ng build
PORT=4460 node dist/orbit/server/server.mjs          # one server at a time
npx playwright test                                   # chromium, firefox, webkit
HEADED=1 npx playwright test --project=chromium -g "touch swipe" --headed

npx ng build --configuration zone
PORT=4461 node dist/orbit-zone/server/server.mjs
BASE_URL=http://localhost:4461 npx playwright test    # runs e2e-zone/
```

Last full run of the main suite: 60 passed, 2 skipped (touch in Firefox and WebKit), and 1 failed: the headless Chromium touch case (`scrollLeft` 592, no snap). That case was then limited to headed runs and passed headed. The tab-stop case was added after the full run and passed in all three engines. Zone suite: 6 passed. The assertion that the in-zone control never replays was added after that run; the recorded data (`replayed: false` in every engine) already satisfies it.
