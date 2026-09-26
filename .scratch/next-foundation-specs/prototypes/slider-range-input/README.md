# Prototype: Foundation-styled `<input type="range">` Slider

Ticket: [Prototype: Foundation-styled `<input type="range">` Slider](../../issues/45-prototype-slider-range-input.md). Throwaway code; the verdict and the decisions it hands on are in the ticket's `## Answer`.

## Question

Can the `foundation-range-input` mixin plus a fill, and two overlapped range inputs for the double-handle case, deliver single, double, vertical, disabled, stepped, and non-linear sliders that pass axe and honour the APG slider and multi-thumb slider patterns within the browser target? Or do the double and vertical cases need a custom `role=slider` implementation, and what does that cost?

## Verdict

Yes, with native inputs throughout; no custom `role=slider` is needed. All 17 cases pass in Chromium 153, Firefox 155 and WebKit 26.6 (Playwright 1.63) and again in Chromium 120, Firefox 119 and WebKit 17.4 (Playwright 1.40, the builds closest to the Chrome 119 / Firefox 119 / Safari 17 target), axe WCAG 2.2 AA included. 11 documented custom CSS rule groups and 374 lines of directive logic (including comments) were needed. Open points: Chromium ignores `aria-orientation="vertical"` on a native range; nobody has yet heard a screen reader read `aria-valuetext` on these inputs; Foundation's default thumb is 22.4 px. See the ticket answer.

## What is here

| Path | What it is |
| --- | --- |
| `src/app/slider.ts` | `NfsSlider` (`[nfsSlider]`, the `.slider` container) and `NfsSliderHandle` (`input[type=range][nfsSliderHandle]`), the whole directive logic |
| `src/_nfs-slider.scss` | The custom CSS on top of Foundation, one comment per rule saying why Foundation cannot supply it |
| `src/styles.scss` | Foundation 6.9 Sass includes (`foundation-slider`, `foundation-range-input`) and variant A (bare input, gradient fill) |
| `src/app/app.ts` | The demo page: one section per case, each printing its state |
| `src/app/app.routes.server.ts` | `RenderMode.Server` so every request is server-rendered |
| `e2e/slider.spec.ts` | The evidence: 17 Playwright tests (axe, pixels, keys, drags, SSR, hydration, Chromium AX tree) |
| `e2e/probe-valuetext.mjs` | Probe showing Chromium drops `aria-orientation` on a native range; also shows CDP cannot report `aria-valuetext` at all (so it proves nothing about valuetext) |
| `e2e/probe-webkit-lag.mjs` | Probe used to show that the early WebKit drag failures came from the test, not the engine |
| `playwright.config.ts`, `package.json` | Current-engine run |
| `old-engines/` | Config and package for the Playwright 1.40 run (same spec file copied into `old-engines/e2e/`) |
| `logs/` | Run logs (both engine sets), the server-rendered `<input>` tags, the Chromium AX dump, the probe outputs |

## How to run

Workspace: `D:/tmp/nfs-proto-slider-range-input/` (left in place). It is a plain Angular CLI 22.2.0 application (`npx @angular/cli@22.2.0 new slider-proto --ssr --style=scss --zoneless`), not an Nx workspace: the question is about the platform, Foundation's Sass and Angular's SSR, none of which Nx changes. Versions installed: `@angular/*` 22.2.0, TypeScript 6.0.3, `foundation-sites` 6.9.0, `@playwright/test` 1.63.0, `axe-core` 4.13.0, `@axe-core/playwright` 4.13.0, `pngjs` 7.0.0. Vitest was not needed. The only generator edit besides the prototype files is `angular.json` `security.allowedHosts: ["localhost"]`, without which the SSR server answers `Header "host" with value "localhost:4450" is not allowed.`

```sh
cd D:/tmp/nfs-proto-slider-range-input/slider-proto
npx ng build                      # production browser + server bundles
npx playwright test               # starts node dist/slider-proto/server/server.mjs on port 4450
PORT=4450 node dist/slider-proto/server/server.mjs   # to browse it by hand
```

Engines closest to the browser target:

```sh
cd D:/tmp/nfs-proto-slider-range-input/old-engines
npm i -D @playwright/test@1.40.0 @axe-core/playwright@4.8.2 pngjs
PLAYWRIGHT_BROWSERS_PATH=./browsers npx playwright install chromium firefox webkit
PLAYWRIGHT_BROWSERS_PATH=./browsers npx playwright test   # needs the slider-proto build
```

WebKit ran on Windows 11 arm64 in both versions with no error; it is Playwright's Windows WebKit port, not Safari.
