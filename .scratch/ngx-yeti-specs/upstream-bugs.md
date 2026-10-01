# Upstream bugs ledger

The bugs this effort found in its upstreams (Yeti, Angular, and any other dependency), kept as the user asked on 2026-10-01: "44. Keep a ledger of upstream bugs found and whether they have been verified and have a minimal reproducible example. Accessibility issues go in the accessibility ledger."

Accessibility issues, including Yeti's deviations from the APG, WAI-ARIA, and WCAG, go in `ledger.md` ([Decide: the building-blocks map for every ngx-yeti item](issues/25-decide-building-blocks-map.md) sets that ledger's format), not here.

Columns:

- **Verified:** how the bug was established. *Measured* means it was reproduced in a browser or build; *read* means it was found in source; *inferred* means neither.
- **Minimal reproduction:** a standalone example that shows only the bug. A prototype that shows it among other things is not minimal.
- **Upstream report:** an existing issue, if one was found. Filing a new one is an outward-facing action under the user's identity and needs the user's confirmation first (map, AFK override).

Each spec ticket that finds a bug adds a row, with its evidence.

## Yeti (`foundation/yeti`, `develop` at `f52d1e8b9`)

| ID | Bug | Evidence | Verified | Minimal reproduction | Upstream report |
| --- | --- | --- | --- | --- | --- |
| Y1 | `alert.js` reads `--yeti-duration-fast` with `parseFloat` and passes it to `animate()` as milliseconds. The production build minifies `150ms` to `.15s`, so the alert fades in 0.15 ms. | [Prototype: Yeti under SSR, hydration, `@defer`, event replay, and `animate.enter` and `animate.leave`](issues/18-prototype-yeti-rendering-modes.md); `src/components/alert/alert.js:12` | measured; read | none | none found; not searched |
| Y2 | `hover.js`'s delays may shrink the same way as Y1. | [ticket 18](issues/18-prototype-yeti-rendering-modes.md); `hover.js:33` | inferred | none | none |
| Y3 | The README says `7.0.0-beta`, while `package.json` and the manifest say `7.0.0-alpha.0`. | [Research: inventory of Yeti's components, layouts, recipes, utilities, and contract](issues/02-research-yeti-inventory.md); `README.md:9` | read | not applicable | none found |
| Y4 | `docs/guides/components.md` lists nine optional modules; the stability guide and `dist/js/` have ten (`enter.js` belongs to a utility). | [ticket 02](issues/02-research-yeti-inventory.md); `components.md:239`, `stability.md:20` | read | not applicable | none found |
| Y5 | The README says an MCP server is generated from the manifest; no code, package, or endpoint for one exists. | [Research: Foundation's `llms.txt` and `llms-full.txt` as sources for this map](issues/14-research-foundationcss-llms-txt.md); `README.md:24` | read | not applicable | none found |
| ~~Y6~~ | The masonry guard tests a syntax that has no browser-compat-data key, so its support cannot be checked. | [Research: Angular 22's browser baseline against what Yeti expects](issues/01-research-browser-baseline-vs-yeti.md) | read | not applicable | none |

## Angular (22.2.x)

| ID | Bug | Evidence | Verified | Minimal reproduction | Upstream report |
| --- | --- | --- | --- | --- | --- |
| A1 | A component's styles are never removed on destroy while any `(animate.leave)` listener exists in the application: `NoneEncapsulationDomRenderer.destroy()` skips `removeStyles` while the global leaving set is non-empty (`dom_renderer.ts:683`), and a function-form `(animate.leave)` joins that set when its view is created (`animation.ts:416`). The class form does not. | old map tickets [184](../next-foundation-specs/issues/184-prototype-lazy-family-styles.md) and [188](../next-foundation-specs/issues/188-prototype-unload-after-leave-without-private-api.md); [Research: Yeti's styling model, and loading component styles lazily](issues/04-research-yeti-styles-and-lazy-loading.md); ticket 18 | measured; read | in the upstream issue | angular/angular#66244, open since 2025-12-24 |
| A2 | Instances inside a `hydrate never` (dehydrated) block are not counted by the shared styles host, so their `styleUrl` styles are removed when the last live instance leaves, while their server-rendered markup stays on the page. | old map ticket 184; ticket 18 | measured | none | not searched |
| A3 | A `dialog` element's `close` event is never replayed by event replay. Whether this is a bug or a limit of which events can replay is open. | ticket 18 | measured | none | not searched |
## Other upstreams

| ID | Upstream | Bug | Evidence | Verified | Minimal reproduction | Upstream report |
| --- | --- | --- | --- | --- | --- | --- |
| O1 | Nx (`@nx/esbuild:esbuild`, 23.2.1) | Bundling a CSS entry writes the output with a `.js` extension; three attempts to change it failed. | [ticket 22](issues/22-prototype-building-and-consuming-yeti-with-nx.md) | measured | none | not searched |
| O2 | Chromium, WebKit | After a stylesheet is inserted or removed, a few pages keep stale computed styles until the element is replaced, whatever the insertion method. | [ticket 23](issues/23-research-yeti-layers-and-import-order.md) | measured; engine invalidation inferred | none | not searched |

Added to Yeti on 2026-10-01 (audit 0002, M7): Y7, `bin/build.js:2-3` says "Concatenation only. No transforms.", while the same file minifies the CSS with Lightning CSS (`:46`) and the JavaScript with esbuild (`:66`). Evidence: [ticket 22](issues/22-prototype-building-and-consuming-yeti-with-nx.md); read. Y6 is struck through above: a gap in the browser-compat data, not a Yeti bug.
