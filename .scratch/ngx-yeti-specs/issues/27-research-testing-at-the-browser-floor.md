# 27. Research: testing at the browser floor (Chrome and Edge 141, Firefox 145, Safari 26.2)

Type: research
Status: claimed
Blocked by: 06
Labels: wayfinder:research
Map: ../map.md

## Question

[ADR 0002](../adr/0002-browser-target-baseline-2025.md) sets the target at Yeti's Baseline 2025: Chrome and Edge 141, Firefox 145, and Safari and Safari iOS 26.2. How can the package's tests run at those floor versions, and not only at the current engines a Playwright release ships? Which Playwright versions bundle engines at or near the floor, and what do other projects do?

## User instruction, 2026-10-01

The user's own message to the orchestrator, verbatim, replying to the note that no test ran at the floor versions because Playwright ships current engines only:

> 48. Then choose a/multiple version(s) of Playwright that include the target browser versions or research what other projects do to mitigate this.

The user then added, verbatim:

> #48 Could Playwright run a specific Chrome for Testing version?

> #48 Consider whether we could use WebDriverIO as the driver for Vitest Browser instead of Playwright and whether it could run specific versions of the target browsers, accepting that a macOS CI runner is needed to run Safari and cannot run on my local Windows machine.

So the research also covers point 6 below. The user accepts that Safari runs only on a macOS CI runner, not on the local Windows machine.

6. WebdriverIO as the Vitest browser-mode provider (`@vitest/browser-webdriverio`), in place of `@vitest/browser-playwright`. Cover:
   - whether it supports Vitest 4.1.x, Angular 22.2, and Storybook 10.6's Vitest addon;
   - whether WebdriverIO's `browserVersion` capability, with its automatic browser and driver download, can pin Chrome 141, Edge 141, and Firefox 145 (stock builds, which avoids Playwright's patched Firefox);
   - Safari 26.2 through `safaridriver` on a macOS runner, including which GitHub-hosted macOS image ships Safari 26.2 or later;
   - what Vitest browser mode loses or gains with WebdriverIO against Playwright (traces, network interception, `userEvent` fidelity, parallelism, speed);
   - whether Playwright e2e and WebdriverIO component tests can coexist.

   Probe it on this machine: run one Vitest browser-mode test with WebdriverIO at Chrome 141 and Firefox 145, if the drivers run on Windows ARM64 natively or under emulation.

## How to work it

Use a `/research` subagent, with small probes under `D:/tmp/` where a claim needs one. Cover, with sources:

1. Playwright's releases: for each release, its bundled Chromium, Firefox, and WebKit versions (release notes, and `browsers.json` in the `playwright-core` package by version). Name the release or releases whose engines sit at or nearest the floor. Then whether an older Playwright still runs with the Angular 22.2, Vitest 4.1.x browser mode, and Storybook 10.6 toolchain, and whether two Playwright versions can coexist in one workspace.
2. Branded channels: Playwright's `channel` option with an installed Chrome or Edge at a pinned version. Chrome for Testing (`@puppeteer/browsers` and the known-good-versions list) for Chrome 141. Firefox 145 builds from Mozilla's archive, and whether Playwright can drive a stock Firefox (it uses a patched Juggler build).
3. Safari 26.2: what WebKit build in Playwright corresponds to it, if any; that this machine is Windows on ARM64, so real Safari needs macOS (CI runners or cloud devices); and how close Playwright's WebKit is to Safari for the features in [Research: Angular 22's browser baseline against what Yeti expects](01-research-browser-baseline-vs-yeti.md).
4. What other projects do: Angular itself, Angular components, Material, Lit, Open Props, Tailwind, and design systems with a stated Baseline or browserslist floor. That might be cloud device grids (BrowserStack, Sauce Labs, LambdaTest), pinned browser CI matrices, static checks instead of runtime ones (browserslist with `eslint-plugin-compat`, `stylelint-no-unsupported-browser-features`, Lightning CSS `targets`, web-features lint), or polyfill and fallback tests.
5. A probe: one Yeti page (the dialog with invoker commands and a `light-dark()` colour) run at the nearest available floor engines, if they can be obtained on this machine.

Write `research/testing-at-the-browser-floor.md` with the options, each with its cost (licence, CI minutes, maintenance) and what it proves. Append an `## Answer`. Decide nothing; the testing decision chooses.
