# Prototype: Nested menu directive family with breakpoint mode switching

Ticket: [Prototype: Nested menu directive family with breakpoint mode switching](../../issues/50-prototype-nested-menu.md). The full answer, results table, and the decisions handed to the specs are in the ticket's `## Answer`.

## Question

1. Can one item and submenu directive family (`nfsMenuItem`, `nfsSubmenu`, `nfsSubmenuToggle`) emit Foundation's `is-<mode>-submenu*` classes from a Menu mode signal, with the accordion, drilldown, and dropdown root behaviours coexisting as host directives on one `ul` and only one live, constant disclosure navigation roles, and per-mode keyboard handling, including the AccordionMenu height animation as a grid on the parent `li` (rows `auto 0fr` to `auto 1fr`)? (Decides the verdict.)
2. What must Drilldown mode render (wrapper, back button) and measure, and what does the server render for each mode?
3. Does focus stay on the equivalent control when a breakpoint swaps the mode?

Added by the orchestrator mid-run: the WCAG 2.2 AA checks (2.5.8 target size on toggles, 1.4.11 arrow contrast, 2.4.11 focus not obscured for overlaying submenus) and DropdownMenu's `opens-left`/`opens-right`/`opens-inner` collision classes near the viewport edge.

## Verdict

Yes. One directive family on Foundation's nested `ul.menu` markup emits every `is-<mode>-submenu*`, `submenu`, `is-submenu-item`, `is-active`, `js-dropdown-active`, `first-sub`, `opens-*`, `is-drilldown`, `is-closing`, `visible`/`invisible` class from one mode signal. `NfsResponsiveMenu` hosts `NfsAccordionMenu`, `NfsDrilldown`, and `NfsDropdownMenu` as host directives on one `ul`; its own `nfsMenuModeToken` provider wins over theirs, so all three read one mode and only the active one handles keys. No `role` attribute is emitted in any mode, and axe (WCAG 2.2 AA plus best-practice) reports no violations in any mode in Chromium, Firefox, and WebKit. The parent-`li` grid animates in all three engines. Two findings change the building-blocks text: a hidden Drilldown ancestor level cannot be `inert` (the open level is its descendant), so it uses Foundation's `invisible`; and a programmatic focus into a sliding Drilldown level must pass `preventScroll`, or the `overflow: hidden` wrapper scrolls sideways and the menu disappears. Focus survives every breakpoint swap tested once the swap prunes the open submenus to the focused path and, when entering drilldown, closes the focused toggle's own submenu.

Left `OPEN FOR HUMAN` (ticket, `### Triage`): how the accordion-mode `li` exposes "expanded" to the grid rule (the prototype's `is-expanded` class is not Foundation vocabulary), and a screen reader pass over a mode swap. Both are decided: the expanded hook by [ADR 0033](../../adr/0033-nested-menu-library-state-hooks.md), the screen-reader pass by [Resolve the assistive-technology checks](../../issues/77-evidence-assistive-technology-checks.md), check 7.

Final run: 92 passed, 1 skipped (the WebKit Tab sweep, because WebKit's Tab skips links by default), 0 failed; `evidence/playwright-run.log`.

## What is here

The decisive files only. Everything is throwaway prototype code.

- `src/app/nested-menu/nested-menu.ts` -- the directive family: `NfsMenuItem`, `NfsSubmenu`, `NfsSubmenuToggle`, `NfsDrilldownBack`, `NfsDrilldownWrapper`, the three roots, `NfsResponsiveMenu`, and the focus-continuity fixup.
- `src/app/nested-menu/breakpoint-sim.ts` -- a stand-in for the Breakpoint service: a signal over `matchMedia` with Foundation's default map, `small` on the server, plus the `data-responsive-menu` rule parser. Not an API proposal.
- `src/app/nested-menu/_nested-menu.scss` -- every custom rule, each with its reason.
- `src/styles.scss` -- Foundation 6.9 Sass: `foundation-global-styles`, `foundation-visibility-classes`, `foundation-menu`, `foundation-accordion-menu`, `foundation-drilldown-menu`, `foundation-dropdown-menu`.
- `src/app/pages.ts`, `app.ts`, `app.routes.ts`, `app.routes.server.ts`, `app.config.ts` -- one route per case (`/accordion`, `/drilldown`, `/dropdown`, `/dropdown-edge`, `/responsive` = `drilldown medium-dropdown`, `/responsive-accordion` = `accordion medium-dropdown`); every route is `RenderMode.Server`.
- `e2e/nested-menu.spec.ts` -- the evidence (classes, roles, keys, grid samples, Drilldown measurement, the `inert` counter-test, WCAG checks, collision, focus continuity F1 to F4, server HTML, first paint before hydration, axe per mode).
- `e2e/drilldown-tab-mid-slide.probe.spec.ts` -- probe for a Tab pressed during the Drilldown slide, with and without `overflow: clip`.
- `evidence/playwright-run.log` -- the final three-engine run, filtered to the evidence lines.
- `evidence/ssr-responsive-nav.html` -- the server HTML of `/responsive` (the `nav` only).
- `evidence/drilldown-tab-mid-slide.log` -- the probe output.
- `package.json`, `angular.json`, `playwright.config.ts` -- the workspace configuration.

## How to run

Workspace: `D:/tmp/nfs-proto-nested-menu/app` (a plain Angular CLI 22.2.0 application, `npx @angular/cli@22.2.0 new app --ssr --style=scss --zoneless`, plus `@angular/cdk@22.2.0`, `foundation-sites@6.9.0`, `@playwright/test@1.63.0`, `@axe-core/playwright@4.13.0`). Installed: `@angular/*` 22.2.0, TypeScript 6.0.3. The generator added `vitest ^5.0.0` (the map pins 4.1.x); the prototype never runs Vitest, so it was left alone. `angular.json` `security.allowedHosts` was set to `localhost`, `127.0.0.1`.

```
cd D:/tmp/nfs-proto-nested-menu/app
npx ng build
PORT=4500 NG_ALLOWED_HOSTS="localhost,127.0.0.1" node dist/app/server/server.mjs
# second shell
npx playwright test                    # chromium, firefox, webkit
npx playwright test --project=webkit   # one engine
```

Engines: Playwright 1.63.0's Chromium 153.0.8010.12, Firefox 155.0, and WebKit 26.6 all run on Windows 11 arm64 with no error.
