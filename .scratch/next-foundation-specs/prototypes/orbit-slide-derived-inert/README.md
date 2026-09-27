# Orbit slides hosting Aria's `TabPanel` with a derived `inert`

Evidence behind fallback 1 of [Decide the `@angular/aria` fallback confirmation](../../issues/75-evidence-aria-fallback-confirmation.md), which ADR 0037 records. The ticket's answer holds the full ruling; this directory keeps the files so the verdict can be checked later.

## Question

The [Prototype: Orbit keyboard scrolling and hydration details](../../issues/65-prototype-orbit-keyboard-hydration.md) found that Aria's `TabPanel` puts `inert` on unselected slides in server HTML, and ADR 0034 concluded that no binding on the slide could keep it out. Can an override derived from Aria's public `TabPanel.visible()` (absent before the Orbit is live, Aria's own value after) keep `inert` out of server HTML while the slides keep hosting `TabPanel`?

## Verdict

Yes, in Chromium, Firefox, and WebKit. Probe G reproduces ADR 0034's root cause (it needs `@for` embedded views and a late selection) and shows the derived override holding on the server renderer. In a copy of the Orbit keyboard prototype with only the slide gate changed, the hydration suite passes 15 of 15 and the keyboard suite 12 of 12 in all three engines, including the `inert` check that failed in all three before; a bound non-first slide (`?selected=2`) also leaves every slide without `inert` in server HTML. The judge's probe shows the client sets and removes `inert` in one binding run during hydration, which nothing renders, and focus inside an unselected slide survives it.

## Files

- `probe/`: probe G (`g-orbit-order.ts`, `g-output.txt`) and probe H for the Accordion's lazy content (`h-accordion-lazy.ts`, `h-output.txt`), with their configs and loader hooks, and the prototype's server HTML.
- `prototype/`: the two patches against `D:/tmp/nfs-proto-orbit-keyboard-hydration/orbit` (`orbit.ts.patch`, `playwright.config.ts.patch`) and the reviewer's result records.
- `judge/`: the judge's probe (`judge.spec.ts`), its result records, the three Playwright run logs (sanitized to ASCII), and the probe G re-run.

## How to run

The runnable workspace is `D:/tmp/nfs-judge-75/orbit` (Angular 22.2.0, `foundation-sites` 6.9.0, no `node_modules`). Recreate a `node_modules` junction to `D:/tmp/nfs-proto-orbit-keyboard-hydration/orbit/node_modules`, build with `npx ng build` and `npx ng build --configuration development`, serve the SSR build with `NG_ALLOWED_HOSTS` set, and run `npx playwright test` in the three engines. The probes run with `node --import ./register.mjs` against their compiled output.
