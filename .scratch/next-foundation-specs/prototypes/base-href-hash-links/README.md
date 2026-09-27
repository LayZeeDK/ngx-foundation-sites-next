# Base-href hash links: decisive files

Question: should `NfsSmoothScroll` (and `NfsMagellan` through it) treat every `#`-only `href` as in-page, or only the links the browser itself would treat as a same-document fragment navigation, given that a bare `href="#id"` under `<base href>` on a non-root route resolves to a different document? Decided by [Decide: `#`-only links that `<base href>` resolves to another document](../../issues/74-decide-base-href-hash-links.md).

## What this holds

The runnable workspaces stayed under `D:/tmp/` (`nfs-decision-base-href/`, `nfs-panel-74-a11y/`, `nfs-panel-74-vsdefault/`); this folder keeps only the files the ticket's Why section cites as "verified". No non-ASCII characters were found in these files.

- `decision-app/` (from `D:/tmp/nfs-decision-base-href/app/`): `annotations.log`, the judge's own experiment run (EXP P1, P2, J1, H1, H2, H3, H5, H7, H8, H9, M1, M2 -- the state table comparing rule A, the current default, against rule B, the browser's own same-document test) across Chromium, Firefox, and WebKit.
- `panel-a11y/` (from `D:/tmp/nfs-panel-74-a11y/`): `results-check.log`, the a11y lens's measurement that the spec's read-once current-path `href` goes stale after a `routerLink` navigation to a new parameter or query, in three engines.
- `panel-vsdefault/` (from `D:/tmp/nfs-panel-74-vsdefault/app/`): `summary-e.log` (the vsdefault lens's run without `<base href>`, every bare link in every row landing on the current page), `docs.ts` (the page component whose `Location.onUrlChange` recipe the judge adopted for the documented current-path `href`, replacing a read-once version).

## How it was produced

- `annotations.log` and `results-check.log` are Playwright test-run logs asserting the final URL and scroll position of each link case (`decision.spec.ts`, `ax-url.spec.ts`, not captured here) against an Angular 22.2.0 SSR application with `<base href="/">` (`app.routes.ts`, `smooth-scroll.ts`, `in-page-link.ts`, `magellan-lite.ts`, not captured here).
- `summary-e.log` is the same kind of run against the vsdefault lens's copy of the application, built without a `<base href>` element.

## Verdict

Option B: `NfsSmoothScroll`, and `NfsMagellan` through it, treats a link as in-page exactly when a click on it would be a same-document fragment navigation for the browser, so a `#`-only `href` that `<base href>` resolves to another document is left to the browser, named by a development-mode warning at first render and at click time; the documented current-path `href` in both specs follows `Location.onUrlChange` instead of a value read once. Full reasoning, dissent, and Triage: [Decide: `#`-only links that `<base href>` resolves to another document](../../issues/74-decide-base-href-hash-links.md).
