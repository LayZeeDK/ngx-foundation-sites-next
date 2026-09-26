# Prototype: ResponsiveMenu swap committed in the Nested menu root's render callback

Ticket: [Prototype: ResponsiveMenu swap committed in the Nested menu root's render callback](../../issues/71-prototype-responsive-menu-swap-commit.md). The full answer, the results table, the decisions handed to the specs, and the triage are in the ticket's `## Answer`. Everything here is throwaway prototype code.

## Question

With the Nested menu root amended as [ADR 0035](../../adr/0035-responsive-menu-swap-commit.md) describes (a displayed mode kept apart from the driven mode; an `afterRenderEffect` whose `earlyRead` reads the driven mode, `document.activeElement`, and DOM order, and whose `write` sets the displayed mode and prunes the Open path), a minimal Breakpoint service with the first-render handoff of [ADR 0014](../../adr/0014-breakpoint-service-first-render-handoff.md), and `nfsResponsiveMenu="drilldown medium-dropdown large-accordion"` starting every instance from the Server breakpoint's mode, in Chromium, Firefox, and WebKit, zoneless, on CSR, SSR, and prerendered routes:

1. Does every Mode swap (resizes across 640 px and 1024 px in both directions, a `rules` change, the first-render handoff) render the new mode and the pruned Open path in the same change-detection pass, and does focus stay put in F1 to F4, move to the level's first control off a back button, and stay on a toggle focused before hydration while the main bundle is held back?
2. Does the swap commit in the same tick when the service going live and the first-render flag dirty the root, so a client-rendered route paints no frame of the Server breakpoint's mode, and does a menu inside `@defer (hydrate on viewport)` hydrate as sent before it swaps?
3. Does a swap into dropdown with focus outside the menu close a submenu opened by a static `is-active`, emitting `closed` once and writing `false` back to a two-way `[(expanded)]`?

## Verdict

Yes to all three, with one correction to the keep rule. Across 49 cases in three engines (147 of 147 on the production build and 147 of 147 on the development build with hydration statistics, the Hybrid-link case recorded by a non-asserting test in both):

- No recorded pass ever showed the new root class over a submenu the swap closes. The pass that first shows the new class already has the closed submenus `inert`. Focus stayed on the same control in F1 to F4 and through rules changes. From a back button it landed on the level's first control, both on a runtime swap and on the first-render swap after a held-back bundle. A toggle focused before hydration kept focus at 1280 px and at 800 px.
- The service goes live, the flag flips, and the swap is planned, committed, and rendered in one task. Zero animation frames ran between the service's construction and the swap render on the three first-render routes, where that interval was measured (`/csr`, `/ssr`, `/prerendered`). A client-rendered route showed no frame of the menu before the swap. `@defer (hydrate on viewport)` blocks hydrated as sent: `componentsSkippedHydration` 0, the hydration pass still showed `drilldown`, and the swap followed with no frame in between.
- The static `is-active` Products section closed on every swap into dropdown with focus outside: at first render on CSR, SSR, prerendered, deferred, and client-created instances, on resizes from drilldown and accordion, and on a rules change. `closed` fired once from the dropdown root, `expandedChange(false)` fired once, and the two-way state read `false`.

The one failure is outside the ticket's named cases. The published keep rule keeps a submenu open when focus is on its Hybrid item's link. Entering drilldown then hides that link in the `invisible` root level, and focus falls to `body` in all three engines. Closing the submenu whose own row holds focus (its toggle or its Hybrid link) fixes it; that variant (`?rule=row`) passes in three engines. The named fallback (record focus, restore it later) cannot fix this case, because the control to restore is hidden.

Controls: the Nested menu spec as written (`?commit=old`) renders one pass with `drilldown` over the still-open submenu in F3, and the per-pass recorder catches it in all three engines. Focus still survived there, even with a style-forcing `earlyRead` first, because no engine moved focus off the hidden toggle within the task. Starting instances from the service's `current` (`?start=current`, the ADR 0014 fallback) re-classes a deferred block during its own hydration and leaves the static `is-active` section open as a dropdown overlay at 800 px, in deferred and client-created instances.

## What is here

- `src/app/nested-menu/nested-menu.ts`: the directive family copied from the [Prototype: Nested menu directive family with breakpoint mode switching](../../issues/50-prototype-nested-menu.md) and amended. `NfsMenuRoot` holds the displayed mode as a `linkedSignal` over the driven function (it takes the driven value on its first read) and runs the swap `afterRenderEffect` (plan in `earlyRead`, commit in `write`, back-item refocus in an `afterNextRender` registered by `write`). It also carries completion outputs emitted by the live root only, seeding from a static `is-active`, dropdown Light dismiss through a document `focusin`, and `NfsResponsiveMenu` with the first-render flag. The switches `?commit=old`, `?start=current`, and `?rule=row` select the controls.
- `src/app/media-query.ts`: the minimal `NfsMediaQuery` (token, `TransferState` handoff, live in its first `earlyRead`, `serverBreakpoint`, `resolve(rules, breakpoint?)`, `parseNfsBreakpointRules`), copied from the ResponsiveAccordionTabs prototype.
- `src/app/instrument.ts`: the timestamped log (`window.__nfsLog`); the per-pass recorder (a `MutationObserver` on the document, drained by the first `earlyRead` callback of every after-render batch, which snapshots the root's mode class and the open submenus that pass left); the `?force=1` style-forcing option; the switches token.
- `src/app/site-menu.ts`: the consumer markup (parents as buttons, back items, a Hybrid item), with and without the static `is-active` section and its `[(expanded)]`.
- `src/app/pages.ts`, `deferred-menu.ts`, `app.ts`, `app.routes.ts`, `app.routes.server.ts`, `app.config.ts`: routes `/csr` (Client), `/ssr` (Server), `/prerendered` (Prerender), `/deferred` and `/deferred-prerendered` (`@defer (hydrate on viewport)` below a 2000 px spacer, with the service live above it), `/late` (a client-created instance behind a button), and a `/current` variant of each except `/deferred-prerendered`.
- `e2e/swap.spec.ts`, `e2e/helpers.ts`: the 49 cases, the per-frame recorder (`requestAnimationFrame`), the held-back main bundle (`page.route`), the pass check, and axe with the WCAG 2.2 AA tags.
- `evidence/playwright-prod.log`, `evidence/playwright-dev.log`: FINDING lines and the pass list of the final runs (production build; development build with `NFS_DEV=1`), with the check marks replaced by `[OK]`.
- `evidence/ssr-current-nav.html`: the server HTML of `/ssr/current` (the `nav` only). `evidence/deferred-markers.txt`: the hydration markers of `/deferred`.
- `playwright.config.ts`, `package.json`, `serve.sh`.
- Not copied because unchanged: `src/styles.scss` and `src/app/nested-menu/_nested-menu.scss` are the [nested-menu prototype's](../nested-menu/README.md) files.

## How to run

Workspace: `D:/tmp/nfs-proto-responsive-menu-swap/app`, a copy of the nested-menu prototype's plain Angular CLI 22.2 `--ssr` workspace, installed with `npm ci` from its lockfile (no generator ran).

```
cd D:/tmp/nfs-proto-responsive-menu-swap/app
npx ng build                               # production build (--configuration development for NFS_DEV)
bash serve.sh                              # SSR server on port 4705 with NG_ALLOWED_HOSTS; `bash serve.sh stop` stops it
npx playwright test                        # chromium, firefox, webkit
NFS_DEV=1 npx playwright test              # after a development build: also asserts componentsSkippedHydration === 0
```

`NG_ALLOWED_HOSTS` is required: the SSR request handler rejects the `Host` header without it. A development build is required for `ngDevMode.componentsSkippedHydration`.

## Versions

`@angular/*` 22.2.0 (core, cdk, ssr, build), TypeScript 6.0.3, `foundation-sites` 6.9.0, `@playwright/test` 1.63.0 (Chromium 153.0.8010.12, Firefox 155.0, WebKit revision 2359, all on Windows 11 arm64), `@axe-core/playwright` 4.13.0. The copied lockfile carries `vitest` 5.0.2 (the map pins 4.1.x); nothing here runs Vitest, and no generator ran, so it was left as the nested-menu prototype left it.
