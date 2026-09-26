# Prototype: ResponsiveAccordionTabs as one component

Ticket: [Prototype: ResponsiveAccordionTabs as one component](../../issues/51-prototype-responsive-accordion-tabs.md). Throwaway code; the ticket's `## Answer` holds the full results table, the decisions handed to the specs, and the triage.

## Question

Does one component that renders either the Accordion or the Tabs directive set (from the [Prototype: `@angular/aria` Accordion and Tabs under Foundation markup](../../issues/43-prototype-aria-accordion-tabs.md)) from the same consumer `ng-template[nfsResponsiveAccordionTabsPanel]` panels keep the selected panel and focus across a breakpoint swap in both directions, with correct classes, roles and ARIA in each mode, and hydrate cleanly when the server rendered the Server breakpoint's mode (`small`, accordion) and the client resolves tabs at 1300 px, for SSR, prerendering, and a `@defer (hydrate on viewport)` block? Is the swap a structural re-render or a class-and-role swap on the same nodes?

## Verdict

Yes. The shared `selected` model and focus survive a resize across `medium` both ways; focus lands on the equivalent control (title and tab for the same `value`) and Aria's keys work on the new nodes. Hydration is clean (`0 component(s) were skipped`, no NG05xx) and the swap to tabs happens in the same tick as hydration, with no frame showing the accordion after the service goes live. The swap is the one structural re-render ADR 0008 allows: Aria's two directive sets cannot share elements, the panels sit in different places, and a `tablist` may only own `tab`s.

The prototype adds two points. The displayed mode is its own signal, updated in an `afterRenderEffect` `earlyRead` callback that reads `document.activeElement` before the old nodes go; a `write` callback focuses the matching control once the new nodes exist. This one path covers resizes and the first-render swap, including focus placed on a server-rendered title before hydration, which the Breakpoint service spec wrongly says cannot happen. Starting every instance from the Server breakpoint's mode (the `instance` strategy, routes `/instance` and `/deferred-instance`) also keeps focus when a deferred block hydrates after the service has gone live; the spec-as-written strategy rebuilds that block's branch at hydration and loses focus. A swap resets consumer state inside panels (templates are instantiated again), and a pre-hydration click or key on a title the first-render swap removes is lost. Foundation's default palette fails WCAG 2.2 AA contrast (3.76:1) on the selected tab and a focused accordion title; `$tab-active-color` and `$accordion-item-color` at `scale-color($primary-color, $lightness: -15%)` fix it, and axe is then clean in both modes and after each swap. Superseded for tabs by the [Spec: Tabs](../../issues/16-spec-tabs.md) D17: `$tab-background-active: $primary-color; $tab-active-color: $white;` (the darkened text leaves the selected-state indicator at 1.24:1); `$accordion-item-color` stands.

## Shape

A plain Angular CLI 22.2.0 application with `@angular/ssr`, `@angular/aria` 22.2.0, `@angular/cdk` 22.2.0 and `foundation-sites` 6.9.0, copied from the Aria prototype's workspace and installed with `npm ci` from its lockfile (no generator ran, nothing re-pinned). TypeScript 6.0.3, `@playwright/test` 1.63.0, `@axe-core/playwright` 4.13.0. Routes: `/` (`RenderMode.Server`), `/prerendered` (`RenderMode.Prerender`), `/client` (`RenderMode.Client`), `/deferred` (widget in `@defer (hydrate on viewport)` below a 2000 px spacer; the page reads `NfsMediaQuery`, so the service is live before the block hydrates), `/instance` and `/deferred-instance` (the same with `nfsRatGateToken` set to `'instance'`).

## Files

- `src/app/nfs/responsive-accordion-tabs.ts`: the component, the panel directive, the `earlyRead` swap with focus capture, the `write` refocus, the two first-render strategies behind the prototype-only `nfsRatGateToken`, and the `__nfsSwaps` log the tests read.
- `src/app/nfs/media-query.ts`: the minimal `NfsMediaQuery` per `specs/breakpoint-service.md` (token, `TransferState` handoff, live in the first `earlyRead`, `atLeast`, `resolve`, `parseNfsBreakpointRules`), plus the prototype-only `serverBreakpoint` property and `resolve(rules, at)` argument.
- Not copied: `src/app/nfs/accordion.ts` and `tabs.ts` are the Aria prototype's files (see `../aria-accordion-tabs/src/app/nfs/`); `accordion.ts` only lost its `[trace]` logging. `src/_nfs-accordion.scss` is that prototype's file, unchanged.
- `src/app/widget.ts` (the consumer's use), `demo.ts`, `deferred-demo.ts`, `app.ts` (sets `__appRendered` after the first render), `app.config.ts`, `app.routes.ts`, `app.routes.server.ts`.
- `src/styles.scss`: Foundation first, the two contrast settings, the component mixins, then `nfs-accordion`.
- `tests/responsive-accordion-tabs.spec.ts`, `tests/helpers.ts`: server output, hydration with a per-frame mode recorder, resizes, focus before hydration with the main bundle held by `page.route`, pre-hydration click and key replay, incremental hydration, axe with the WCAG 2.2 AA tags.
- `results.log`: FINDING lines and pass list from the final production run in three engines, the development-build hydration statistics, and the axe result with Foundation's default palette.
- `playwright.config.ts`, `serve.sh`, `package.json`.

Test mistakes fixed during development (not product failures): `selected=undefined` expected where the template prints an empty string; `domcontentloaded` never fires while a module script is held (now `commit`); waiting for the service in routes where it starts later; focus text including the `role` attribute; and, after the carry rule was added, the expectation that the accordion opens the visible tab.

## How to run

The workspace is at `D:/tmp/nfs-proto-responsive-accordion-tabs/app`, including `node_modules` and the production build.

```
cd D:/tmp/nfs-proto-responsive-accordion-tabs/app
npx ng build                      # production; --configuration development for the NFS_DEV run
bash serve.sh                     # SSR server on port 4510 (NG_ALLOWED_HOSTS set); `bash serve.sh stop` stops it
npx playwright test               # chromium, firefox, webkit
NFS_DEV=1 npx playwright test -g "hydration at 1300|incremental"   # after a development build: ngDevMode statistics
```

WebKit runs on Windows arm64 here (Playwright `webkit-2359`), so no engine was skipped.
