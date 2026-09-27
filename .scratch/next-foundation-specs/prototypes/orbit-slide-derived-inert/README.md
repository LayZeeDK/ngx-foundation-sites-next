# Orbit slides hosting Aria's `TabPanel` with a derived `inert`

Evidence behind fallback 1 of [Decide the `@angular/aria` fallback confirmation](../../issues/75-evidence-aria-fallback-confirmation.md), which ADR 0037 records. The ticket's answer holds the full ruling; this directory keeps the files so the verdict can be checked later.

## Question

The [Prototype: Orbit keyboard scrolling and hydration details](../../issues/65-prototype-orbit-keyboard-hydration.md) found that Aria's `TabPanel` puts `inert` on unselected slides in server HTML, and ADR 0034 concluded that no binding on the slide could keep it out. Can an override derived from Aria's public `TabPanel.visible()` (absent before the Orbit is live, Aria's own value after) keep `inert` out of server HTML while the slides keep hosting `TabPanel`?

## Verdict

Yes, in Chromium, Firefox, and WebKit. Probe G reproduces ADR 0034's root cause (it needs `@for` embedded views and a late selection) and shows the derived override holding on the server renderer. In a copy of the Orbit keyboard prototype with only the slide gate changed, the hydration suite passes 15 of 15 and the keyboard suite 12 of 12 in all three engines, including the `inert` check that failed in all three before; a bound non-first slide (`?selected=2`) also leaves every slide without `inert` in server HTML (read by the judge; not captured). The judge's probe shows the client sets and removes `inert` in one binding run during hydration, which nothing renders, and focus inside an unselected slide survives it.

## Files

- `probe/`: probe G (`g-orbit-order.ts`, `g-output.txt`) and probe H for the Accordion's lazy content (`h-accordion-lazy.ts`, `h-output.txt`), with their configs and loader hooks, and the prototype's server HTML (the unbound page; the `?selected=2` page was read by the judge and is not captured here).
- `prototype/`: the two patches against `D:/tmp/nfs-proto-orbit-keyboard-hydration/orbit` (`orbit.ts.patch`, `playwright.config.ts.patch`) and the reviewer's result records.
- `judge/`: the judge's probe (`judge.spec.ts`), its result records, the three Playwright run logs (sanitized to ASCII), and the probe G re-run. `pw-hydration.log`'s count ("1 failed, 20 passed", 21 total) is the hydration suite's 15 plus 6 cases from an earlier version of the judge probe that was not kept; the captured `judge.spec.ts` is the version `pw-judge.log`'s 6-of-6 run matches.

## How to run

The runnable workspace is `D:/tmp/nfs-judge-75/orbit` (no `node_modules`): recreate the junction `node_modules` to `D:/tmp/nfs-proto-orbit-keyboard-hydration/orbit/node_modules`, run `npx ng build` and `npx ng build --configuration development`, then `NG_ALLOWED_HOSTS=localhost:<port> PORT=<port> node dist/orbit-dev/server/server.mjs` with `SUITE=hydration BASE_URL=http://localhost:<port> npx playwright test --project=chromium --project=firefox --project=webkit`, and the production server with `npx playwright test e2e/keyboard.spec.ts` on the three projects; remove the junction with `rmdir` afterwards. Probe G: `npx ngc -p tsconfig.g.json` then `node --import ./register.mjs out-g/g-orbit-order.js`.
