# Prototype: `@angular/aria` Accordion and Tabs under Foundation markup

Ticket: [Prototype: `@angular/aria` Accordion and Tabs under Foundation markup](../../issues/43-prototype-aria-accordion-tabs.md). Throwaway code; the ticket's `## Answer` holds the full results table.

## Question

Can host-directive wrappers satisfy Aria's required link inputs (`AccordionTrigger.panel`, the tab `value` pairing) while panel content is projected rather than placed in Aria's `ng-template` content directives, so the open accordion panel and the selected tab panel are in server HTML? Do `.is-active` on the list items and the grid-row `0fr -> 1fr` height animation on `.accordion-content` work with Foundation's CSS? What does a replayed arrow key do, given that Aria calls `preventDefault()` after its handler? Does `[nfsTabsPanel]` need to be a component?

## Verdict

Yes, composition works, so no fallback was built or estimated. The wrapper cannot set Aria's required `panel` input from code (NG2019 forces it to expose the input and NG8008 forces the consumer to bind it), so the consumer writes one template-reference binding per accordion item. Two forms work: `[panel]="p"` with `#p="ngAccordionPanel"` (host-directive `exportAs` names can be referenced), and `[panel]="c.panel"` with `#c="nfsAccordionContent"`. Tab pairing uses plain `value` attributes. With projected content, the open panel and the selected tab panel are in server HTML; collapsed and hidden panels carry `inert`. `.is-active` binds on `li.accordion-item`, `li.tabs-title` and `.tabs-panel`. The grid-row animation runs in Chromium, Firefox and WebKit. `[nfsTabsPanel]` stays a directive: Aria's `TabPanel` works without `ngTabContent`, and the only effect of leaving it out is a dev-mode warning, which a component could not silence either.

A replayed arrow key, Enter or Space does change state: focus moves, the panel toggles, the tab is selected. Then Aria's `preventDefault()` throws and Angular logs ``ERROR Error: `preventDefault` called during event replay.`` Enter and Space toggle only once, because Aria ignores the synthetic click. Aria's `stopPropagation()` is skipped after the throw, so in a nested accordion the outer group handles the replayed key a second time and focus ends up in the wrong place. A same-element `keydown` listener on the wrapper that calls `stopPropagation()` again fixes that. The wrapper cannot change the default of an Aria input either (Foundation `multiExpand=false` against Aria's `true`). It can write Aria `model()`s: defaulting `selectedTab` to the first tab gives unbound tab sets a panel at first paint.

## Shape

This is a plain Angular CLI 22.2.0 application created with `--ssr`, plus `@angular/aria` 22.2.0, `@angular/cdk` 22.2.0 and `foundation-sites` 6.9.0. That shape fits because the question is about Aria, Angular's server renderer, hydration and event replay, none of which depends on Nx. Versions: `@angular/*` 22.2.0, TypeScript 6.0.3, Dart Sass 1.104.1 (from `@angular/build`), `@playwright/test` 1.63.0, `@axe-core/playwright` 4.13.0. The generator added Vitest 5.0.2, jsdom and a `test` target. They were removed because nothing here uses them and the map pins Vitest 4.1.x. The production build serves `/` with `RenderMode.Server`. Foundation Sass is `@import`ed first, then the prototype's `nfs-accordion` mixin (ADR 0012 shape).

## Files

- `src/app/nfs/accordion.ts`: `nfsAccordion` (hosts `AccordionGroup`), `nfsAccordionItem` (`.is-active`), `nfsAccordionTitle` (hosts `AccordionTrigger`), and the `[nfsAccordionContent]` wrapper component (hosts `AccordionPanel`, one wrapper `div` around `<ng-content>`). It also contains the trace instrumentation and the replay guard.
- `src/app/nfs/tabs.ts`: `nfsTabsGroup` (hosts `Tabs`), `nfsTabs` (hosts `TabList`, writes the first tab into `selectedTab` when unbound), `nfsTab` on the anchor, `nfsTabsTitle` (`role="presentation"`, `.is-active`), and the `nfsTabsPanel` directive.
- `src/app/app.html`: the page. It has an accordion with `multiExpand=false` and a nested accordion in panel 1, an accordion with no `multiExpand` binding that is linked through the wrapper export, a tab set with `selected` bound, and one without, plus a state readout.
- `src/_nfs-accordion.scss`, `src/styles.scss`: Foundation first, then the custom rules. Each rule carries its reason.
- `e2e/aria-accordion-tabs.spec.ts`: step 1 (server HTML, no-JS first paint), step 2 (hydrated behaviour, CSS, animation), step 3 (replay with the main bundle held back by `page.route`). `e2e/axe-and-dev.spec.ts`: axe on the hydrated page and on the server paint, and a console dump for a development build.
- `server-render.html`: the `<main>` of the final server response and the `__jsaction_bootstrap` call.
- `results.log`: the FINDING lines and pass list from the final run in the three engines, plus the nested replay case as it behaved before the guard.
- `playwright.config.ts`, `serve.sh`, `package.json`, `angular.json`.

Development build console at load (Chromium, `ng build --configuration development`, fixture without the nested accordion): one pair of `Violations found on element: %o:` / `ngAccordionPanel must have an ngAccordionContent to render.` per accordion panel, one pair of `... / ngTabPanel must have an ngTabContent structural directive to render.` per tab panel, then `Angular hydrated 6 component(s) and 101 node(s), 0 component(s) were skipped.` No NG0100 and no NG05xx. The production build prints none of these.

## How to run

The workspace is at `D:/tmp/nfs-proto-aria-accordion-tabs/app`, including `node_modules` and the build output; neither is copied here.

```
cd D:/tmp/nfs-proto-aria-accordion-tabs/app
npx ng build                      # production; use --configuration development for the dev-console test
bash serve.sh                     # SSR server on port 4430 (NG_ALLOWED_HOSTS set); `bash serve.sh stop` stops it
npx playwright test               # chromium, firefox, webkit projects
NFS_DEV=1 npx playwright test e2e/axe-and-dev.spec.ts --project=chromium   # after a development build
```

WebKit runs on Windows arm64 here (Playwright's `webkit-2359` build), so nothing was left untested for lack of an engine.
