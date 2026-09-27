# Decision dossier: `#`-only links that `<base href>` resolves to another document

Ticket: [Decide: `#`-only links that `<base href>` resolves to another document](../issues/74-decide-base-href-hash-links.md). Prepared 2026-09-27, AFK, as the evidence dossier for the panel the map's "Open-decision pass" note prescribes. This file collects facts and consequences; it states no recommendation.

Source abbreviations used below:

| Short | Source |
| --- | --- |
| HTML | WHATWG HTML Living Standard, "Last Updated 25 September 2026", multipage pages fetched 2026-09-26 (markdown.new, or plain `curl` for `nav-history-apis.html`) |
| URL | WHATWG URL Living Standard, "Last Updated 10 September 2026", fetched 2026-09-26 |
| WCAG | WCAG 2.2, W3C Recommendation 12 December 2024, https://www.w3.org/TR/WCAG22/ (fetched 2026-09-26) |
| NG | `d:/projects/github/angular/angular`, branch `22.2.x`, commit `5db6fc44` (2026-09-25), version 22.2.0 |
| NGC | `d:/projects/github/angular/components`, branch `22.2.x`, commit `708d4c6e` (2026-09-25), version 22.2.0 |
| CLI | `d:/projects/github/angular/angular-cli`, branch `22.0.x`, commit `5584a589` (2026-07-10), version 22.0.6 (the clone is not on a 22.2 branch; the brief forbids checking one out) |
| FS | `d:/projects/github/foundation/foundation-sites`, `v6.9.0-1-g337be7a8d` |
| APG | `d:/projects/github/w3c/aria-practices`, commit `3f094fde` (2026-09-15) |
| EXP | This dossier's experiment, `D:/tmp/nfs-decision-base-href/app/` (section 2.4); decisive files captured at [prototypes/base-href-hash-links/](../prototypes/base-href-hash-links/README.md) |
| P62 | [Prototype: Smooth Scroll under Router scroll restoration and replay](../issues/62-prototype-smooth-scroll-router-restoration.md) and `prototypes/smooth-scroll-router/` |
| WF | `web-features` 3.40.0 (npm, published 2026-09-24), `data.json` |

## 1. The decision

### 1.1 The question

In an Angular application with `<base href="/">` (the Angular CLI default), a link written `href="#section"` on any route other than the base URL resolves to `/#section`. That URL is a different document from the current one, so a click the library does not handle is a cross-document navigation to the base URL. The question is which links `NfsSmoothScroll` (and, through composition, `NfsMagellan`) treats as in-page links after hydration, and therefore what happens when a consumer writes Foundation's `href="#id"` markup on a deep route.

### 1.2 Current default (option A)

The [Spec: Smooth Scroll](../issues/29-spec-smooth-scroll.md) applies this rule (spec step 3, `specs/smooth-scroll.md:140`): a link is in-page when "its raw `href` attribute starts with `#`, or its resolved URL equals the document URL apart from the fragment and has a non-empty fragment". A `#`-only `href` that `<base href>` resolves to another document is therefore handled in place after hydration, and a development-mode check warns about it (`specs/smooth-scroll.md:149`, design decision D9 at `:368`). The spec ticket's triage kept it OPEN FOR HUMAN as a trap-quadrant item (`issues/29-spec-smooth-scroll.md:140-143`, re-rated at `:173`). The [Spec: Magellan](../issues/30-spec-magellan.md) uses the same rule to decide which links it tracks (`specs/magellan.md:84`; `issues/30-spec-magellan.md:66`, `:132`).

### 1.3 Alternatives

- **Option B (named in the ticket).** Handle only links the browser itself treats as same-document: the resolved URL equals the document URL apart from the fragment, with a non-empty fragment. Bare `#` links under a base URL that differs from the page are left to the browser, and the docs give the base-href-safe `href` recipe (`specs/smooth-scroll.md:436`, `:446-447`).
- **Option C (suggested by the sources, not in the ticket).** Rewrite `href`s at runtime: after render in the browser, set each `a[href^="#"]` inside the host to the current path plus the fragment. angular.dev does this for its rendered docs content (NG `adev/shared-docs/components/viewers/docs-viewer/docs-viewer.component.ts:114-115`, `:395-400`), the Material docs site does it to fetched HTML before insertion (NGC `docs/src/app/shared/doc-viewer/doc-viewer.ts:155-162`), and Material's `MatIcon` does the same for SVG `url(#id)` references whenever the path changes (NGC `src/material/icon/icon.ts:297-314`, `:400-415`). The Smooth Scroll spec rejected "the directive rewriting `href`" in D9 for its host-binding form ("collides with `RouterLink`'s `href` binding, ADR 0011, and cannot reach a container's links through host bindings", `specs/smooth-scroll.md:368`) and lists "Rewriting consumer `href`s" as Out of Scope (`:351`); a browser-only DOM write, as angular.dev does it, is a different mechanism that D9 does not discuss.
- **Option D (suggested by the sources).** A library input that owns the link's `href` and renders a same-document URL in server HTML, the way `RouterLink` computes `href` from `Location` (NG `packages/router/src/directives/router_link.ts:186`, `:578-582`). New public API; ADR 0011 records that two directives binding one attribute on one element resolve by directive order (`adr/0011-button-listener-free-disabled-contract.md:12`).
- **Option E (consumer-side, suggested by the sources).** The application drops the `<base>` element, provides `APP_BASE_HREF`, and uses root-relative asset URLs; angular.dev's router guide describes this path (NG `adev/src/content/guide/routing/router-reference.md:93-104`). A bare `#id` is then same-document on every route. Analog's `blog-app` example ships this way (no `<base>`, `/src/...` asset URLs; `d:/projects/github/analogjs/analog/apps/blog-app/index.html`, commit `5b0b8b66`). This is documentation for the application, not library behaviour, and can combine with A or B.
- **Option F (variant).** Make the rule configurable (an input or a Defaults token). The Smooth Scroll spec currently has no inputs and no Defaults token (D11, `specs/smooth-scroll.md:370`).
- **Option G (variant seen in another design system).** Match on the resolved fragment alone, ignoring the path: handle any link whose `hash` names an element in the current document. Bootstrap 5.3.8 ScrollSpy does this for links inside its navigation (section 2.7). For bare links it behaves like A; it also captures cross-page links such as `/other#id` when `id` exists locally.
- Diagnostics variants: A or B each with a development-mode warning (A has one today; B could warn about bare links too), or with a development-mode error instead.

## 2. Facts

### 2.1 Normative specifications

1. **A fragment-only reference keeps the base URL's path and query.** In the URL parser's relative state, when the input does not start with `/`, the parser sets "url's path to a clone of base's path, and url's query to base's query", and if the next code point is `#` it sets the fragment and moves to fragment state. Source: URL, "relative state" (https://url.spec.whatwg.org/#relative-state).
2. **Links resolve against the document base URL, which `<base href>` sets.** "Follow the hyperlink" encoding-parses the `href` "relative to subject's node document" (HTML, https://html.spec.whatwg.org/multipage/links.html#following-hyperlinks-2); encoding-parsing relative to a `Document` uses "environment's base URL" (HTML, urls-and-fetching.html#encoding-parsing-a-url); the document base URL is the frozen base URL of the first `base` element with an `href`, otherwise the fallback base URL, which for a normal document is the document's URL (HTML, urls-and-fetching.html#document-base-url, #fallback-base-url). "The `base` element allows authors to specify the document base URL for the purposes of parsing URLs" (HTML, semantics.html#the-base-element).
3. **Only a URL equal to the current one apart from the fragment is a fragment navigation.** The navigate algorithm takes the "navigate to a fragment" path only if "url equals navigable's active session history entry's URL with exclude fragments set to true; and url's fragment is non-null"; otherwise it fetches a new document (HTML, browsing-the-web.html#navigate). URL equality compares serializations, so path and query must match (URL, #concept-url-equals).
4. **What a fragment navigation does.** It fires a `navigate` event with `isSameDocument` true, pushes a history entry (history state set to null), updates the document URL, runs "update document for history step application" (which fires `popstate`, and `hashchange` when the fragment changed), and runs "scroll to the fragment" (HTML, browsing-the-web.html#navigate-fragid, and the step that fires `hashchange`). The standard notes "this means that `popstate` events fire for fragment navigations, but not for `history.pushState()` calls" (HTML, browsing-the-web.html, "finalize a same-document navigation" note).
5. **Scroll to the fragment.** For an element target: set the target element (`:target`), run the ancestor revealing algorithm, "Scroll target into view, with behavior set to 'auto', block set to 'start', and inline set to 'nearest'", "Run the focusing steps for target, with the Document's viewport as the fallback target", and "Move the sequential focus navigation starting point to target". An empty fragment means the top of the document, with no focus move (HTML, browsing-the-web.html#scroll-to-the-fragment-identifier).
6. **History API URLs resolve against the base URL too.** `pushState`/`replaceState` set "newURL to the result of encoding-parsing a URL given url, relative to the relevant settings object of history", and allow any same-origin HTTP(S) URL ("If targetURL's scheme is an HTTP(S) scheme, then return true"), so a different path is accepted (HTML, nav-history-apis.html#shared-history-push/replace-state-steps and "can have its URL rewritten"). EXP row I1 measures `history.replaceState({}, '', '#probe')` on `/guide/a` under `<base href="/">` producing `http://localhost:4730/#probe` in all three engines.
7. **WCAG 2.2 success criteria text.** 2.4.1 Bypass Blocks (A): "A mechanism is available to bypass blocks of content that are repeated on multiple web pages." 2.4.3 Focus Order (A): "If a web page can be navigated sequentially and the navigation sequences affect meaning or operation, focusable components receive focus in an order that preserves meaning and operability." 2.4.4 Link Purpose (In Context) (A): "The purpose of each link can be determined from the link text alone or from the link text together with its programmatically determined link context". 3.2.5 Change on Request (AAA): "Changes of context are initiated only by user request or a mechanism is available to turn off such changes." Glossary, "relied upon (technologies that are)": "the content would not conform if that technology is turned off or is not supported". Source: WCAG.
8. **WCAG technique G1** (sufficient for 2.4.1): "The first interactive item in the web page is a link to the beginning of the main content. Activating the link sets focus beyond the other content to the main content." Its test procedure includes "Check that activating the link moves the focus to the main content." Source: https://www.w3.org/WAI/WCAG22/Techniques/general/G1 (fetched with `curl`; markdown.new returned a Cloudflare challenge page).

### 2.2 The APG and ARIA in HTML

1. APG Link pattern, keyboard: "Enter: Executes the link and moves focus to the link target." (APG `content/patterns/link/link-pattern.html:43`).
2. APG landmark practice: "Landmark regions can also be used as targets for 'skip links'" (APG `content/practices/landmark-regions/landmark-regions-practice.html:25`).
3. The effort's APG research: when script intercepts an in-page link to animate the scroll, "it must still move focus to the target" (`research/aria-apg-patterns.md:417`).
4. The HTML `base` element lists accessibility considerations "For authors" and "For implementers" by link to ARIA in HTML and HTML-AAM (HTML, semantics.html#the-base-element); neither the APG clone nor the WCAG text read for this dossier contains guidance on `<base href>` and fragment links.

### 2.3 Browser support and Baseline

The map's Browser target is the Baseline widely available set on 2026-05-07 (Chrome, Edge, Firefox 119; Safari 17) (`map.md:44-56`). From WF:

| Feature (web-features id) | Status in WF 3.40.0 | Low date | High date | On 2026-05-07 | Today (2026-09-27) |
| --- | --- | --- | --- | --- | --- |
| `<base>` (`base`) | high | 2015-07-29 | 2018-01-29 | widely available | widely available |
| `<a>` (`a`) | high | 2015-07-29 | 2018-01-29 | widely available | widely available |
| History (`history`) | high | 2015-07-29 | 2018-01-29 | widely available | widely available |
| `hashchange` | high | 2015-07-29 | 2018-01-29 | widely available | widely available |
| URL (`url`) | high | 2015-07-29 | 2018-01-29 | widely available | widely available |
| `URL.canParse()` (`url-canparse`) | high | 2023-12-07 | 2026-06-07 | not yet widely available | widely available |
| `:target` (`target`) | high | 2015-07-29 | 2018-01-29 | widely available | widely available |
| `scrollIntoView()` | high | 2020-01-15 | 2022-07-15 | widely available | widely available |
| Navigation API (`navigation`) | low | 2026-01-13 | none | newly available only | newly available only |
| `scrollend` | low | 2025-12-12 | none | newly available only | newly available only |

Command: `node D:/tmp/nfs-decision-base-href/web-features/lookup.mjs base a history hashchange url url-canparse target scroll-into-view navigation scrollend`. Everything options A and B need (`a.href`, `new URL()`, `document.URL`) is widely available on both dates; an implementation that used `URL.canParse()` would have been outside the target on 2026-05-07. The Navigation API, which would let one listener see every same-document and cross-document navigation, is outside the target on both dates (the Smooth Scroll spec already lists it as a future upgrade, `specs/smooth-scroll.md:501`).

### 2.4 Measured behaviour

**Experiment (EXP).** A copy of the P62 workspace's configuration with new sources: Angular 22.2.0 (`@angular/core`, `@angular/router`, `@angular/ssr`, `@angular/build` 22.2.0), TypeScript 6.0.3, `@playwright/test` 1.63.0, prerendered (`RenderMode.Prerender` for `**`), served by the generated Express server (`node dist/smooth-scroll-router/server/server.mjs`, `PORT=4730`, `NG_ALLOWED_HOSTS=localhost`). `src/index.html` has `<base href="/">` and an inline script that sets a random `window.__docId` per document load and records `popstate`/`hashchange`. Routes: `/` (Home, sections `s1`-`s6`), `/guide/a` and `/guide/b` (the same Guide component; the route provides the in-page rule A or B). `provideRouter(routes, withInMemoryScrolling({scrollPositionRestoration: 'disabled', anchorScrolling: 'disabled'}))` (Angular's defaults) and `provideClientHydration(withIncrementalHydration())`. The directive is a throwaway copy of the Smooth Scroll spec's click order (container yields to cancelled clicks; `scrollIntoView` with `behavior: 'instant'`; focus with a temporary `tabindex="-1"`; `preventDefault()` last and skipped when already prevented). The only difference between the two rules is one branch:

```ts
if (rule === 'A' && raw.startsWith('#')) { return raw.slice(1) || null; }
// both rules: resolved same-document test
const resolved = new URL(link.href); const current = new URL(doc.URL);
if (resolved.origin === current.origin && resolved.pathname === current.pathname
    && resolved.search === current.search && resolved.hash.length > 1) { return resolved.hash.slice(1); }
return null;
```

Guide markup: a container host (`ul[nfsSmoothScroll]`) with a bare `#s2` link (`c-bare`) and a recipe link `[href]="path + '#s3'"` (`c-safe`, where `path = Location.prepareExternalUrl(Location.path())`, the spec's recipe); a link host `a[nfsSmoothScroll][href="#s4"]` (`l-bare`); plain links without the directive (`plain-bare`, `plain-safe`); `routerLink="." fragment="s3"` (`router-link`); a container host with a bare link inside `@defer (hydrate on interaction)` (`dc-bare`); a link host with a bare link inside another such block (`dl-bare`); a container host with a bare link inside `@defer (hydrate never)` (`nc-bare`); each block's root node is a `div`. Commands: `npx ng build`, `npx playwright test` (87 tests, 3 engines), `node e2e/print-annotations.mjs`. Engines (from `browser.version()`): Chromium 153.0.8010.12, Firefox 155.0, WebKit 26.6 (Playwright 1.63.0 bundled builds), on Windows 11 ARM64. Files: `e2e/decision.spec.ts`, `e2e/ax-url.spec.ts`, `e2e-run.log`, `annotations.log`, `annotations-webkit-force.log`, `annotations-ax.log`.

**Server HTML** (`dist/smooth-scroll-router/browser/guide/a/index.html`): bare links stay `href="#s2"`; the recipe link renders `href="/guide/a#s3"`; `routerLink="." fragment="s3"` renders `href="/guide/a#s3"` and `jsaction="click:;"`; `jsaction="click:;"` sits on the container `ul`, on the link host `a`, and on the inner hosts of the deferred blocks, whose root `div`s carry `jsaction="click:;keydown:;"`; nothing inside `hydrate never` carries `jsaction`.

**Results.** "Leaves" means a new document loaded (`__docId` changed) at the URL given; offsets are Chromium/Firefox/WebKit. Every row was the same in all three engines except where noted.

| # | Case | Rule A | Rule B |
| --- | --- | --- | --- |
| H1 | Hydrated, container host, bare `#s2` | In place: URL stays `/guide/a`, `history.length` +0, scrollY = target (1871/1877/1871), focus on `#s2`, next Tab lands on the first link inside `#s2` (Chromium, Firefox) | Leaves to `/#s2` (Home route rendered), `history.length` +1, scrollY 1581/1582/1581 (Home's `#s2`), focus on `BODY` |
| H2 | Hydrated, link host, bare `#s4` | In place (4873/4879/4873), focus on `#s4` | Leaves to `/#s4` |
| H3 | Hydrated, container host, recipe `/guide/x#s3` | In place, URL unchanged, focus on `#s3` | Same as A |
| H4 | Hydrated, no directive, bare `#s2` (control) | Leaves to `/#s2` | Same |
| H5 | Hydrated, no directive, recipe `#s3` (control) | Native fragment navigation: URL `/guide/x#s3`, `history.length` +1, `popstate` then `hashchange` recorded, scrollY = target, focus stays on `BODY` (non-focusable section), next Tab lands inside `#s3` (Chromium, Firefox) | Same |
| H6 | Hydrated, `routerLink="." fragment="s3"` | Router navigation: URL `/guide/x#s3`, `history.length` +1, no `popstate`/`hashchange`, scrollY 0 (anchor scrolling off in this app) | Same |
| H7 | App hydrated, container host inside a dehydrated `hydrate on interaction` block, bare `#s5` | Leaves to `/#s5` | Leaves to `/#s5` |
| H8 | App hydrated, link host inside a dehydrated block, bare `#s6` | No navigation; the block hydrated and the replayed click scrolled to `#s6` (7875/7881/7875) and focused it; handler entry saw `defaultPrevented: true`, skipped `preventDefault()`; no console error | No navigation and no scroll (scrollY 0); handler outcome "ignored: not in-page"; focus stayed on the link (Chromium, Firefox) or `BODY` (WebKit); the click has no effect |
| H9 | Container host inside `hydrate never`, bare `#s2` | Leaves to `/#s2` | Same |
| P1 | Before hydration (main bundle held), container host, bare `#s2` | Leaves to `/#s2` | Same |
| P2 | Before hydration, link host, bare `#s4` | Leaves to `/#s4` | Same |
| P3 | Before hydration, container host, recipe `#s3` | Native jump, then replay: ends at `#s3`, focus on `#s3`, one "`preventDefault` called during event replay" error logged (Firefox logs `ERROR Error`) | Same |
| M1 | Ctrl or Meta + click, bare `#s2` | New page opens at `/#s2` (all three engines); the opener stays | Same |
| M2 | Middle click, bare `#s2` | Chromium, Firefox: new page at `/#s2`. WebKit: no new page; the same tab navigated to `/#s2` | Same |
| J1 | JavaScript disabled (`javaScriptEnabled: false`) | `c-bare` -> `/#s2`, `l-bare` -> `/#s4`, `dl-bare` -> `/#s6`, `nc-bare` -> `/#s2`; `c-safe` -> `/guide/a#s3` at the target (3372/3378/3372) | Same (the rule never runs) |
| I1 | IDL values of `c-bare` on `/guide/a` | `getAttribute('href')` `#s2`; `a.href` `http://localhost:4730/#s2`; `a.hash` `#s2`; `a.pathname` `/`; `document.baseURI` `http://localhost:4730/`; `document.URL` `http://localhost:4730/guide/a` | Same |
| AX | Chromium accessibility tree `url` property (CDP `Accessibility.getFullAXTree`) | Bare links: `http://localhost:4730/#sN`; recipe links: `http://localhost:4730/guide/a#s3` | Same |

Harness notes: in WebKit, P1 under rule A timed out in Playwright's actionability wait while the main bundle was held (3 of 4 unforced runs); with `click({force: true})` it passed 3 of 3 with the result above. In WebKit, Tab after a jump reached no link in any case (`activeAfterTab: null`), consistent with WebKit's default of not putting links in the Tab order. The replayed click in H8 reached the handler with `eventPhase` 0; in P3 with 101.

**Earlier measurement (P62).** Row 1d: "Bare `href="#id"` on the non-root route: Cross-document reload to `/`, then a client redirect to `/page-a`, losing the query string", in three engines (`issues/62-prototype-smooth-scroll-router-restoration.md:51`). P62 also found that on a route with a query string, a recipe `href` that omits the query "is also not same-document and also reloads" (`:42`; `prototypes/smooth-scroll-router/README.md:21`).

### 2.5 Foundation 6.9 source

1. SmoothScroll delegates to `a[href^="#"]` (an attribute selector on the raw `href`), reads the target with `e.currentTarget.getAttribute('href')`, and calls `preventDefault()` for every such link (FS `js/foundation.smoothScroll.js:41-66`). `scrollToLoc` resolves the target with `$(loc)`, a jQuery selector, and returns `false` when nothing matches (`:76-80`). A same-document absolute `href` (`/path#id`) never matches Foundation's selector.
2. Magellan delegates clicks to `a[href^="#"]` and calls `preventDefault()` first (FS `js/foundation.magellan.js:100-104`); it marks as active only links whose raw `href` equals `#` plus the target's `data-magellan-target` (`:176`); with `deepLinking` it writes `history.pushState({}, '', url)` or `replaceState({}, '', url)` where `url` is the raw `#id` (`:191-201`), and it scrolls to `location.hash` on `load` and on `hashchange` (`:84-88`, `:107-113`). Under `<base href="/">` on a deep route, such a write changes the path to the base (section 2.1 fact 6, EXP row I1).
3. Foundation's documented markup uses bare fragments only: `<a href="#first">` in a `data-smooth-scroll` Menu and `<a href="#exclusive" data-smooth-scroll>` (FS `docs/pages/smooth-scroll.md:24-35`, `:43-45`), and `<a href="#first">` in a `data-magellan` Menu (FS `docs/pages/magellan.md:22-35`).
4. Foundation's JavaScript does not read `<base>` anywhere in these two plugins (the files above contain no `base` or `baseURI` reference).

### 2.6 Angular, CDK, Aria, Material source

1. **The CLI puts `<base href="/">` in every new application** (CLI `packages/schematics/angular/application/files/common-files/src/index.html.template:6`; the 22.2.0 `ng new` output in P62 has the same line, `prototypes/smooth-scroll-router/src/index.html:6`). The built index uses relative asset URLs (`href="styles.css"`, `src="main.js"`, `href="chunk-*.js"`; `prototypes/rendering-mode-test-seam/logs/prerendered-index.html:6-11`), which resolve through that base on deep routes.
2. **Angular's guidance on `<base href>`.** "You must add a `<base href>` element to the application's `index.html` for `pushState` routing to work. The browser uses the `<base href>` value to prefix relative URLs when referencing CSS files, scripts, and images." "Without that tag, the browser might not be able to load resources (images, CSS, scripts) when 'deep linking' into the application." Developers who cannot add it can "Provide the router with an appropriate `APP_BASE_HREF` value" and "Use root URLs (URLs with an authority) for all web resources" (NG `adev/src/content/guide/routing/router-reference.md:61-62`, `:91`, `:95-104`). The deployment guide: "Prefer `<base href>` where possible" over `--deploy-url` (NG `adev/src/content/tools/cli/deployment.md:131-134`). None of these pages mentions fragment links. `PathLocationStrategy` falls back to `APP_BASE_HREF`, then the DOM base href, then `document.location.origin` (NG `packages/common/src/location/location_strategy.ts:127-131`).
3. **`RouterLink` with `fragment`.** Documented example: `<a [routerLink]="['/user/bob']" [queryParams]="{debug: true}" fragment="education">` "generates the link: `/user/bob?debug=true#education`" (NG `packages/router/src/directives/router_link.ts:115-126`). It binds `[attr.href]` (`:186`) computed through `LocationStrategy.prepareExternalUrl` (`:578-582`), so server HTML carries the full path (EXP server HTML). Its click handler ignores non-primary and modified clicks and non-`_self` targets, navigates through the Router, and returns `false` for `<a>` so Angular prevents the default (`:472-522`).
4. **`withInMemoryScrolling` and `anchorScrolling`.** "When set to 'enabled', scrolls to the anchor element when the URL has a fragment. Anchor scrolling is disabled by default. Anchor scrolling does not happen on 'popstate'." `scrollPositionRestoration` defaults to `'disabled'` (NG `packages/router/src/router_config.ts:149-193`). `ViewportScroller.scrollToAnchor` focuses the element with `preventScroll: true` (NG `packages/common/src/viewport_scroller.ts:122-134`). The angular.dev guides in the clone contain no mention of `anchorScrolling` or `withInMemoryScrolling` (`rg -i 'anchorScrolling|withInMemoryScrolling' adev/src/content` returns nothing); the API reference text above is the documentation.
5. **The recipe's inputs.** `Location.path()` returns the path plus the query string, without the base (NG `packages/common/src/location/location_strategy.ts:156-161`, `location.ts:108-110`); `prepareExternalUrl` adds the base back (`location.ts:154-159`). The default `RouteReuseStrategy` reuses a component when the route config is the same (`packages/router/src/route_reuse_strategy.ts:155-157`), so a path read once in a field stays at its first value when only parameters or the query change. Under `HashLocationStrategy`, `prepareExternalUrl` returns `#` plus the path (`hash_location_strategy.ts:74-77`), so the spec's recipe produces a second `#`; not measured here.
6. **Angular's event dispatch and anchors.** `Dispatcher.dispatch` calls `preventDefault()` on a `click` (or modified click) whose resolved action element is an `A`, before dispatching or queuing it for replay: "Prevent browser from following <a> node links if a jsaction is present and we are dispatching the action now" (NG `packages/core/primitives/event-dispatch/src/dispatcher.ts:78-91`, `:127-140`). A replayed event's `preventDefault()` throws "`preventDefault` called during event replay." (`event_dispatcher.ts:34-37`, `:124-127`). Measured: EXP rows H7, H8, P3.
7. **The Router does not intercept plain links by default.** EXP rows H1 (rule B), H4. Angular 22.2 ships `withExperimentalPlatformNavigation()` ("highly experimental and should not be used in production"), whose advantages include "The ability to intercept navigations triggered outside the Router. This allows plain anchor elements _without_ `RouterLink` directives to be intercepted by the Router and converted to SPA navigations" (NG `packages/router/src/provide_router.ts:205-247`); its handler intercepts same-origin navigations whose path is under the app root (`packages/router/src/statemanager/navigation_state_manager.ts:389-427`). It depends on the Navigation API (section 2.3). Not measured here.
8. **CDK, Aria, Material.** No in-page link or fragment handling in `src/cdk`, `src/aria`, or `src/material` (`rg -e 'href\^=' -e 'location\.hash' -e 'baseURI' -e "getAttribute\('href'\)"` over non-test `.ts` files returns nothing); building-blocks Table B lists "Nothing" as SmoothScroll's Material counterpart (`building-blocks.md:258`). `MatIcon` rewrites SVG `url(#id)` references to `url('<pathname+search>#id')` "because WebKit browsers require references to be prefixed with the current path, if the page has a `base` tag", re-checking the path on every `ngAfterViewChecked` because "we can't depend on the Angular router" (NGC `src/material/icon/icon.ts:297-314`, `:400-415`).
9. **angular.dev's own markup** (NG `adev`, and the live site fetched 2026-09-26 with `curl`, `ng-version="22.2.0+sha-14793bf"`): `<base href="/" />` (`adev/src/index.html:44`); the table of contents writes `[href]="location.path() + '#' + item.id"` with the comment "Not using routerLink + fragment because of: https://github.com/angular/angular/issues/30139" (`adev/shared-docs/components/table-of-contents/table-of-contents.component.html:14-16`); heading anchors are generated as `<a href="#${link}" class="docs-anchor" tabindex="-1" ...>` (`adev/shared-docs/pipeline/shared/marked/transformations/heading.mts:36-39`) and are served that way in prerendered HTML (live `https://angular.dev/guide/routing/router-reference` contains `<a href="#base-href" class="docs-anchor" tabindex="-1" ...>` under `<base href="/">`); in the browser only, the docs viewer rewrites them ("Rewrite relative anchors (hrefs starting with `#`) because relative hrefs are relative to the base URL, which is '/'", `docs-viewer.component.ts:110-115`, `:395-400`) and routes other same-origin clicks through the Router unless the link starts with the current path plus `#` (`:354-392`; `shared-docs/utils/navigation.utils.ts:139-152`). angular/angular#30139 is open (2019, 24 comments, labels `freq3: high`, `P3`; "Router scrolling does not work properly when dealing with content that is not immediately visible").
10. **Material docs site** (NGC `docs/`, client-rendered, no server entry): `<base href="/">` (`docs/src/index.html:6`); table of contents `[href]="_rootUrl + '#' + link.id"` with `_rootUrl = this._router.url.split('#')[0]` (`docs/src/app/shared/table-of-contents/table-of-contents.html:7`, `table-of-contents.ts:68-84`); fetched documents get "all relative fragment URLs" replaced "with absolute fragment URLs ... This is necessary because otherwise these fragment links would redirect to '/#my-section'" (`docs/src/app/shared/doc-viewer/doc-viewer.ts:155-162`); header links use the Router URL (`header-link.ts:13-39`).

### 2.7 Other design systems, community libraries, and community guidance

| Library (version) | In-page rule | Source |
| --- | --- | --- |
| GOV.UK Frontend 6.5.1, `SkipLink` | Returns early "for external URLs or links to other pages" when `this.$root.origin !== window.location.origin || this.$root.pathname !== window.location.pathname` (resolved values; query not compared); otherwise focuses the target on click and lets the native jump proceed | `packages/govuk-frontend/src/govuk/components/skip-link/skip-link.mjs:23-69` at tag `v6.5.1` (via `gh api`) |
| Bootstrap 5.3.8, ScrollSpy `smoothScroll` | Links `[href]` inside the target nav; a click is handled when `event.target.hash` (resolved fragment, path ignored) names an observed section; then `preventDefault()` and `scrollTo` | `js/src/scrollspy.js:32`, `:127-150`, `:201-221` at tag `v5.3.8` |
| USWDS 3.14.0, in-page navigation | Generates `href="#id"` links; click handler always calls `preventDefault()`, finds the target by `el.hash`, scrolls, and writes `history.pushState(null, "", '#id')` | `packages/usa-in-page-navigation/src/index.js:213-228`, `:350`, `:379-417` at tag `v3.14.0` |
| ng-bootstrap 21.0.0, ScrollSpy | `ngbScrollSpyItem` host `click` calls `scrollTo()` on a fragment id input; demo items are `<button>` elements with no `href`; the overview says the service can be used "together with the `routerLink` directive and its `[fragment]` input, or you can force the scrollspy to get to a specific fragment via the `.scrollTo()` method" | `src/scrollspy/scrollspy.ts:31-42`, `:128-131`; `demo/src/app/components/scrollspy/demos/navbar/scrollspy-navbar.html`; `.../overview/scrollspy-overview.component.html:33-36` at tag `21.0.0` |
| ngx-page-scroll 17.0.0 | `[pageScroll]` host `click` returns `false` (prevents the default) for every click; target from the `href` input (raw, e.g. `#awesomePart`); README: "scroll to an element referenced in the href-attribute (`href="#mytarget`) just by adding `pageScroll` directive" | `projects/ngx-page-scroll/src/lib/ngx-page-scroll.directive.ts:10-28`, `:83-85`, `:144-177`; `README.md:12-13`, `:169` at tag `v17.0.0` |
| Angular Material 22.2 | No in-page navigation component; its docs site rewrites bare fragments (section 2.6 fact 10) | NGC |

Weekly npm downloads, 2026-09-19 to 2026-09-25 (`api.npmjs.org/downloads/point`): `bootstrap` 7,657,923; `@ng-bootstrap/ng-bootstrap` 750,494; `govuk-frontend` 232,230; `@uswds/uswds` 93,998; `ngx-page-scroll-core` 18,012; `ngx-page-scroll` 12,413.

Community guidance and reports:

- Stack Overflow question 36101756, "Angular2 Routing with Hashtag to page anchor" (2016, score 166, 174,501 views, 22 answers): "if I add directly, the link would actually jump to the root, not somewhere on the same page". The highest-voted answers recommend `routerLink` with `fragment` (score 191) and `anchorScrolling: 'enabled'` (score 97); lower answers use click handlers with `scrollIntoView` and no `href` (Stack Exchange API, fetched 2026-09-26).
- angular/angular#7114 (2016): `<a href="#link">` in a routed template reloads to `http://localhost:3000/#link`; the reporter attributes it to the `base href`; closed as a duplicate of #6595. angular/angular#6595 ("Router: Provide support for handling the URL hash", 87 comments, 97 reactions) was closed "Fixed via #20030" (the `anchorScrolling` feature). angular/angular#38002 (2020): a skip link `href="#anchor"` "on the '/' route ... works as intended. But if the path is not empty, the link seems to refresh the page to the root path"; the reporter closed it after reproducing the same behaviour with a plain `pushState` page: "It is not related to Angular, it's the intended behaviour". angular/angular#13622 (2016): external HTML with `<a href="#Employee">` inside an Angular app; a commenter suggests "a global click handler on HTML body" (all via `gh api`).

**How often a bare `#id` appears in Angular templates.** No corpus-wide count was obtained: GitHub's code search API ignores `" = #` and other punctuation ("The search will simply ignore these symbols", docs.github.com, "Searching code (legacy)"), and grep.app answered with a bot challenge (HTTP 429). Counts over local clones (script `count-hrefs.sh` in the scratchpad; `*.component.html` and non-test `.ts` files):

| Repository (commit date) | bare `href="#id"` | `href="#{{...}}"` or `[href]="'#'..."` | `href="#"` placeholders | `routerLink` `fragment` |
| --- | --- | --- | --- | --- |
| bitwarden/clients (2026-07-03) | 0 | 0 | 144 (Storybook stories) | 1 |
| angular/components (2026-09-25) | 0 (1 hit is a comment about SVG `<use href="#id">`) | 0 | 1 | 0 |
| angular/angular `adev` (2026-09-25) | 1 (`href="#learn-more"` on the home route `/`) | 0 | 1 | 4 |
| angular/angular `devtools` | 0 | 0 | 0 | 0 |
| ngrx/platform (2026-08-31) | 0 | 0 | 0 | 2 |
| analogjs/analog (2026-07-07) | 0 | 3 (tables of contents in example apps; one app, `opt-catchall-app`, has `<base href="/" />` and serves them on nested `/docs/...` routes; `blog-app` has no `<base>`) | 0 | 0 |
| radix-ng/primitives (2026-07-12) | 2 (landing page on the root route) | 0 | 28 | 0 |
| realworld-angular (2026-07-17) | 0 | 0 | 0 | 0 |

### 2.8 Published assistive-technology support data

1. NVDA 2025.1: "NVDA can now report when a link destination points to the current page. (#141)" (NVDA "What's New", https://download.nvaccess.org/documentation/changes.html, fetched 2026-09-27; release heading `2025.1`). The implementation compares the link destination and the page URL without scheme and fragment: `targetURLOnPageWithoutFragments == rootURLWithoutFragments` (`source/utils/urlUtils.py:31-65`, nvaccess/nvda `release-2026.2`). NVDA 2023.1 added "Report link destination (NVDA+k)". Chromium exposes the resolved URL in the accessibility tree (EXP row AX: bare links expose `http://localhost:4730/#sN`). Inference, not measured with NVDA: a bare `#id` under a different base would not be reported as a same-page link, and a recipe `href` would.
2. a11ysupport.io has HTML link tests for plain and placeholder links only (`data/tests/tech/html/links/example1-8.json`, "A link by itself" through "A placeholder link that wraps many elements"; repository commit 2026-08-15); none covers fragment navigation, skip links, or `<base href>`.
3. No published support data was found on how screen readers follow a script-handled in-page jump versus a native fragment navigation. The [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md) ticket covers the effort's AT questions separately.

### 2.9 The effort's own tickets, specs, prototypes, and ADRs

1. Smooth Scroll spec: Problem Statement names the hazard ("whenever no script handles it: before hydration, inside `@defer (hydrate never)`, for crawlers, and on middle-click", `specs/smooth-scroll.md:16`); the directive earns its place with four things, one of which is "it gives Foundation's `href="#id"` markup the in-page behaviour after hydration" (`:30`); user stories 16, 17, 25 (`:49`, `:50`, `:58`); Foundation contract Activation row (`:79`); step 3 (`:140`); development warning text "this link leaves the page before hydration, in `hydrate never`, and on middle-click; bind the full path (`routerLink` with `fragment`, or an `href` that includes the current path)" (`:149`); Rendered HTML note "it is in-page only for the directive after hydration" (`:261`); link-host and container-host rows in Rendering modes (`:276-277`); browser-level link-filter case "a `#`-only `href` under a `<base href>` that points elsewhere" (`:308`); fixture e2e "a `#`-only link navigates to the base URL (documents the base-href hazard the dev check warns about)" (`:335`); D9 (`:368`); usage example "Without the Router (or on a page at the base URL)" with `[href]="'#' + s.id"` and `<a href="#top" nfsSmoothScroll>Back to top</a>` (`:375`, `:385`, `:397`); Router example with the recipe (`:417-449`); listener-free recipe (`:484`).
2. Magellan spec: links are "the in-page `a[href]` descendants (Smooth Scroll's in-page rule, so Router-safe `/path#id` hrefs count, and `#`-only hrefs that `<base href>` resolves elsewhere count after hydration, following that spec's applied default, which its ticket keeps open for a human)" (`specs/magellan.md:84`); examples with bare hrefs (`:471-505` with `[href]="'#' + s.id"`, `:519-546` with `href="#features"` and `deepLinking`), and a Router example with the recipe (`:589-610`); its fixture e2e uses "same-document `href`s" on a nested route under `<base href="/">` (`:425`); deep-link writes use `location.pathname + location.search + '#' + id` (`:209`).
3. ADR 0017 (accepted): a link host inside a dehydrated block "is cancelled by the dispatcher and scrolls when the block hydrates" (`adr/0017-smooth-scroll-click-handling.md:7`); it does not mention `<base href>`.
4. ADR 0008 (accepted): "server HTML is the consumer's markup plus host bindings, which keeps crawlers, no-JS users, and dehydrated blocks correct" (`adr/0008-rendering-modes-contract.md:11`).
5. ADR 0023 (accepted), a precedent for changing Foundation's documented link markup: tabs drop `href` because `href="#panel"` "would jump to the panel and rewrite the hash"; "Consumers delete `href` and `data-tabs-target` from Foundation's docs markup" (`adr/0023-tabs-anchor-tab-hosts.md:7`, `:17`). Building-blocks: "the consumer keeps Foundation's docs markup almost verbatim; the deltas ... are listed per spec" (`building-blocks.md:22`).
6. Building-blocks 1.11 decision 5 records SmoothScroll as the exception to the no-click-listener rule for links (`building-blocks.md:154`); decision 7 lists SmoothScroll among plugins that keep working in `hydrate never` (`:156`); Table A's SmoothScroll row reads "`[nfsSmoothScroll]` on a container of `a[href^="#"]` or on one link" (`:231`).
7. The bundle index lists the item as trap-quadrant decision 3 (`README.md:151`); Magellan's ticket defers to the Smooth Scroll ticket's triage (`issues/30-spec-magellan.md:132`, `:201`).
8. Map rules in force: WCAG 2.2 AA as requirements (`map.md:41`), Rendering modes (`:43`), Browser target (`:44-56`), the triage rule (`:137`), the open-decision pass (`:141`).
9. The glossary has no term for in-page link or fragment navigation (`CONTEXT.md`); the Smooth Scroll ticket judged them general platform terms (`issues/29-spec-smooth-scroll.md:118`).
10. Storybook: this repo's current Storybook (10.1.10, not the 10.6 target) puts `<base target="_parent" />` (no `href`) in the preview head (`node_modules/storybook/assets/server/base-preview-head.html:1`), so story iframes have no base URL other than their own URL; stories cannot show the `<base href>` case, which only the fixture app on a nested route exercises (`specs/smooth-scroll.md:333-335`).

## 3. Consequences per option

Rows marked "measured" come from EXP or P62; others are derived from the cited sources.

### 3.1 Behaviour by rendering mode and gesture, for a bare `href="#id"` on a deep route under `<base href="/">`

| Situation | A | B | C (runtime rewrite) | D (href-owning input) | E (no `<base>`) |
| --- | --- | --- | --- | --- | --- |
| JavaScript disabled, crawlers | Leaves to base (measured) | Leaves (measured) | Leaves (rewrite needs script) | Same-document (href in server HTML) | Same-document |
| Click before hydration (SSR, prerender) | Leaves (measured) | Leaves (measured) | Leaves | Native jump, then replay (as P3, one logged error on container hosts) | Native jump, then replay |
| Click after hydration | In place (measured) | Leaves, full reload of the app at the base route (measured) | In place | In place | In place |
| Container host in a dehydrated block, app hydrated | Leaves (measured) | Leaves (measured) | Leaves unless the block has rendered on the client | Native jump, then replay | Native jump, then replay |
| Link host in a dehydrated block, app hydrated | In place after the block hydrates, no error (measured) | Nothing happens: dispatcher cancels, replay ignores (measured) | Depends on whether the rewrite has run for that block | In place after hydration | In place after hydration |
| `@defer (hydrate never)` | Leaves (measured) | Leaves (measured) | Leaves | Same-document native jump | Same-document native jump |
| Ctrl/Meta click, middle click, open in new tab, copy link | Base URL (measured) | Base URL (measured) | Current page after the rewrite | Current page | Current page |
| NVDA "same page link" report (source-derived) | Not reported | Not reported | Reported after the rewrite | Reported | Reported |

Options F and G behave like A or B depending on configuration or matching; G additionally handles links to other pages whose fragment names a local element (Bootstrap's rule, section 2.7).

### 3.2 WCAG 2.2 AA criteria touched

- 2.4.1 Bypass Blocks (A): skip links are in-page links. A skip link carrying `nfsSmoothScroll` with a bare `href` works after hydration under A and leaves to the base route under B; before hydration and without script it leaves under both. G1's test is "activating the link moves the focus to the main content" (section 2.1 fact 8). With a recipe `href`, both options pass the same way.
- 2.4.3 Focus Order (A): after a handled jump, focus is on the target and the next Tab continues inside it (measured, H1 and H3); after a reload to the base route focus is on `BODY` of a different page (measured). The native jump for a recipe link moves the sequential focus navigation starting point (measured, H5).
- 2.4.4 Link Purpose (A): the criterion text addresses whether purpose can be determined from the link text; it does not address a link whose resolved destination differs from what its text names.
- 2.1.1 Keyboard, 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured: unchanged between options (the spec's mechanisms are the same once a link is handled).
- Conformance: WCAG defines technologies "relied upon" as those without which "the content would not conform" (section 2.1 fact 7). Whether the pre-hydration window and `hydrate never` regions count against a page that relies on script is not settled by the text (section 4).

### 3.3 Users affected

- Unmodified clicks after hydration: A keeps them on the page; B sends them to the base route with a full reload (application state, scroll position, and unsaved input on the page are lost; one history entry is added) (measured).
- Pre-hydration clickers, no-script users, crawlers, modified-click and new-tab users, `hydrate never` regions, container hosts in dehydrated blocks: the same outcome under A and B (they leave) (measured).
- Link hosts in dehydrated blocks: A scrolls in place; B produces a click with no effect (measured, H8). Under B this is the same hazard any cross-document link host has in a dehydrated block (ADR 0017 `:7`; the Button spec's hazard).
- Consumers who test only client-rendered development builds: under A, bare links work in the browser and the only signal is the development warning (`specs/smooth-scroll.md:149`); under B, the reload is visible on the first click (derived).
- Screen reader users: NVDA 2025.1 and later reports "same page" only when the resolved destination equals the page (section 2.8); this depends on the markup, not on the option, but only option D and E make bare-style markup resolve to the page.
- Content from other sources (Markdown-rendered headings, CMS HTML) typically carries bare `#id` anchors, as angular.dev's pipeline and the Material docs show (section 2.6 facts 9-10); A handles those after hydration inside an `nfsSmoothScroll` container, B leaves them to the browser.

### 3.4 Public API or contract frozen

- A: no new symbols; freezes the raw-`#` branch of the in-page rule for Smooth Scroll and, through `hostDirectives`, for Magellan's link tracking; freezes user story 17's promise.
- B: no new symbols; freezes the resolved-URL rule; the documented recipe becomes part of the consumer contract for Router applications (as it already is for Router examples, `specs/smooth-scroll.md:417-449`, `specs/magellan.md:589-610`).
- C: the directive writes to consumer-owned `href` attributes after render (a behavioural contract); a consumer `[href]` binding re-sets the attribute when its value changes (Angular binding semantics; not measured here).
- D: a new public input or directive per link; collides with `RouterLink` or a consumer `href` binding on the same element (ADR 0011 `:12` precedent).
- E: no library API; application-level configuration documented in the library's docs.
- F: a new input or Defaults token, against D11 (`specs/smooth-scroll.md:370`).
- G: changes the link filter's meaning for cross-page links.

### 3.5 Reversibility

- A later narrowed to B: bare links that scroll in place in shipped applications would start reloading to the base route (the Smooth Scroll ticket's triage reason for HIGH impact, `issues/29-spec-smooth-scroll.md:141`).
- B later widened to A: bare links that reload to the base route in shipped applications would start scrolling in place (derived; the direction of change is from a reload to an in-place jump).
- Either change alters Magellan's tracked-link set at the same time.
- C, D, F add surface that is itself hard to remove; E is documentation only.

### 3.6 Cost to the specs

- A (keep): D9's status text and the ticket's OPEN FOR HUMAN entry change to decided; README open list item 3 is removed or marked decided (`README.md:151`); Magellan's Activation row drops "which its ticket keeps open for a human" (`specs/magellan.md:84`) and its ticket's triage row (`issues/30-spec-magellan.md:132`); ADR 0017 gains a dated pointer or a new ADR records the rule; building-blocks needs no change unless the decision is recorded there.
- B (switch): Smooth Scroll spec edits at `:30` (the four things become three), `:50` (user story 17), `:58` (user story 25: `href="#"` and `#top` on a deep route would leave), `:79`, `:140`, `:149` (warning text), `:261`, `:276` (new link-host dead-click behaviour for bare links), `:308` (test expectation flips), `:368` (D9), and the non-Router example's caveat (`:375-397`); Magellan spec edits at `:84`, and its guide and top-bar examples (`:471-546`) either gain a no-Router or root-route caveat or switch to the recipe; building-blocks Table A's "container of `a[href^="#"]`" wording (`building-blocks.md:231`); README item 3; ADR 0017 pointer or new ADR.
- C or D: new spec sections (mechanism, rendering modes, tests), a new ADR, and a revisit of D9 and Out of Scope (`specs/smooth-scroll.md:351`, `:368`).
- E: a usage note in both specs; combinable with any option.

### 3.7 Cost to the future implementation

- A: one extra branch in the in-page test (EXP `src/app/smooth-scroll.ts`) plus the development check that compares `a.href` with `document.URL` (exists in the spec for both options).
- B: the branch goes; the same comparison decides both handling and the warning; tests for the bare case flip from "handled" to "not handled".
- Both need no API beyond `a.href` and `new URL()` (widely available; section 2.3).

### 3.8 Interactions with rendering modes

- SSR and prerendering: server HTML is identical under A and B (bare `href`s pass through unchanged; measured server HTML); C changes nothing in server HTML; D and E change it.
- Hydration: no host bindings in either A or B, so hydration is unaffected (spec `:275`).
- Event replay: a pre-hydration click on a bare link unloads the document before replay under both A and B (measured P1, P2), so no replay error appears for it.
- Incremental hydration: the only measured difference between A and B is the link host in a dehydrated block (H8).
- `@defer (hydrate never)`: no difference (H9).
- Plain `@defer` (client-rendered blocks): once rendered, links behave as after hydration (derived).

## 4. Open unknowns

1. **How many consumers will write bare `#id` links in Router applications.** The local corpus is small (section 2.7) and GitHub code search cannot match the punctuation. Settled by a regex search over a large Angular template corpus (for example a BigQuery GitHub dataset or a code search service that supports regular expressions).
2. **Whether the pre-hydration window and `hydrate never` regions count in a WCAG conformance judgment for a page that relies on script.** The WCAG text read here does not address transient pre-hydration states. Settled by the W3C Understanding documents for conformance requirement 5.2.4 and "relied upon", or by an accessibility auditor's ruling.
3. **How JAWS and VoiceOver announce a bare link whose resolved destination is another page, and how any screen reader follows a script-handled jump versus a native one.** NVDA's rule is read from source only; no screen reader was run. Settled by a screen-reader pass (NVDA, JAWS, VoiceOver) on the EXP pages.
4. **Real Safari and macOS behaviour.** EXP ran Playwright's WebKit 26.6 build on Windows 11 ARM64; the WebKit middle-click result (same-tab navigation) and the Tab result may be harness or platform effects. Settled by rerunning `e2e/decision.spec.ts` against Safari on macOS.
5. **Whether Angular's Navigation API integration becomes the default.** If it did, a bare link that B leaves to the browser would become a Router navigation to the base route instead of a reload (source-derived, not measured, and the API is outside the Browser target). Settled by the Angular roadmap or a run with `withExperimentalPlatformNavigation()` in a Navigation API browser.
6. **Staleness of recipe `href`s.** A path read once in a field stays at its first value when the Router reuses the component or only the query changes (section 2.6 fact 5; P62's query-string finding). Not measured for route-parameter changes. Settled by an EXP case with a parameterised route.
7. **`HashLocationStrategy`.** Bare `#id` links resolve to the same document there, but a native jump changes the hash the Router reads as the route, and the spec's recipe produces a double `#` (source-derived). Settled by an EXP run with `withHashLocation()`.
8. **Option C's interaction with consumer bindings and hydration.** Whether a browser-only rewrite of `href` survives consumer `[href]` bindings, `@for` updates, and deferred blocks was not measured. Settled by a prototype.
9. **Storybook 10.6's preview head.** Only 10.1.10 was read; whether 10.6 keeps `<base target="_parent">` was not checked. Settled by reading the 10.6 package.
