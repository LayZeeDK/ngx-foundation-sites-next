# Reveal open-by-default server state: decisive files

Question: what does a non-modal Reveal with `[overlay]="false"` and `[isOpen]="true"` render on the server, given that the closed server dialog leaves its `dialog`-role Trigger at `aria-expanded="true"` beside a `<dialog>` the server keeps closed, until hydration and permanently without JavaScript? Decided by [Decide: the server state of an open-by-default non-modal Reveal's Trigger](../../issues/78-decide-open-by-default-non-modal-reveal-server-state.md).

## What this holds

The runnable workspace stayed under `D:/tmp/nfs-decision-reveal-open/app/` (an Angular CLI 22.2.0 SSR application copied from the Reveal dialog prototype's skeleton); this folder keeps only the files the ticket's Measurement section names plus its two run logs. `run1.log` and `run2.log` were sanitized to ASCII (Playwright's `[OK]`/checkmark glyph and `>` breadcrumb separator).

- `app/probe-reveal.ts`: the probe with only the parts the question needs (the fixed `open` binding, the first-paint path, `show()`/`close()` sync, a native-close listener, a Trigger probe with a `click` host listener).
- `app/case-page.ts`, `app/case-page-af.ts`: the two case-page components (query parameters `variant=spec|candidate`, `diverge=1`, `adopt=0`, `modal=1`; `case-page-af.ts` is the `/af` route with a static `autofocus` on the dialog).
- `app/index.html`: the script that logs dialog events from the first byte.
- `public/platform.html`, `public/autofocus.html`, `public/ax.html`: the plain pages behind the P1-P6 platform cases.
- `e2e/decision.spec.ts`: the 18 Playwright tests (times 3 engines) behind cases P1-P6 and A1-A10.
- `run1.log`: the first run, before the focus rule was refined.
- `run2.log`: the final run, 54 passed -- the one the ticket's Measurement section cites.

## How it was produced

`npx ng build --configuration development`, then `PORT=4800 NG_ALLOWED_HOSTS="localhost,127.0.0.1" node dist/app/server/server.mjs`, then `npx playwright test` (Chromium 153.0.8010.12, Firefox 155.0, WebKit 26.6 through Playwright 1.63.0, on Angular 22.2.0 with TypeScript 6.0.3 and Foundation 6.9.0 Sass). `run1.log` predates a focus-rule refinement made between runs; `run2.log` is the run the ticket's Measurement table reports (54 of 54 tests).

## Verdict

Neither routed fix. A non-modal Reveal that is open at its first render is rendered shown: the host binds `[attr.open]` to a value fixed at the first render, so the server HTML is the shown non-modal dialog and its `dialog`-role Trigger's `aria-expanded="true"` is true from the first paint; the first render callback does not call `show()` and emits no `opened`, and takes focus only when nothing else has it. A modal Reveal keeps its closed server HTML. The Openable contract is unchanged. Full reasoning, dissent, and Triage: [Decide: the server state of an open-by-default non-modal Reveal's Trigger](../../issues/78-decide-open-by-default-non-modal-reveal-server-state.md).
