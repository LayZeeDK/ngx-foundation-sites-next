# 46. Prototype: Orbit on CSS scroll snap

Type: prototype
Status: resolved
Blocked by: 14, 38
Labels: wayfinder:prototype
Map: ../map.md

## Question

Does a mandatory horizontal scroll-snap container with an IntersectionObserver-driven active slide, Aria tabs as bullets, `scrollTo`-driven autoplay, a rotation control, pause on focus and hover, and reduced-motion pause reproduce Foundation Orbit per the APG carousel pattern without Motion UI? What CSS replaces Foundation's JavaScript-measured container height so slides paint from the server, and how does `infiniteWrap` behave?

Read first: `building-blocks.md` (the matrix row and the open risk this prototype settles), `adr/*.md`, `research/foundation-inventory-forms-media.md`, `research/aria-apg-patterns.md`, `research/web-platform-features.md`, `research/angular-aria-inventory.md`, `research/angular-rendering-modes.md`.

## How to work it

Build the prototype per `/mattpocock-skills:prototype` at the high fidelity the map's AFK override allows: a synthetic Nx workspace under `D:/tmp/nfs-proto-orbit-scroll-snap/` created with `npx create-nx-workspace@latest` at the map's target versions (Angular 22.2, Nx 23.2, TypeScript 6.0.x, Vitest 4.1.x) with `foundation-sites` 6.9 Sass, or a git worktree of this repo if that is faster. Never modify this repo's working tree outside the effort directory. Drive it in a real browser with `/playwright-cli`, across Chromium, Firefox, and WebKit whenever the question depends on the engine, and include a server-rendered run whenever the question touches first paint or hydration.

Capture it: copy the decisive files into `prototypes/orbit-scroll-snap/` in the effort directory with a README that states the question, how to run it, and the verdict. The workspace under `D:/tmp/` may stay; record its path.

Under `## Answer`: the verdict in one paragraph, a results table (case, result, evidence), exact error text for failures, what the prototype does not prove, the decision it hands to the blocked spec tickets, and anything left `OPEN FOR HUMAN`.

## Answer

Resolved 2026-09-26. Prototype, run instructions, and raw numbers: [prototypes/orbit-scroll-snap/README.md](../prototypes/orbit-scroll-snap/README.md). Workspace: `D:/tmp/nfs-proto-orbit-scroll-snap/orbit`. It is a plain Angular CLI 22.2.0 `--ssr` application, not the Nx workspace this ticket first described; the orchestrator's brief asked for the smaller setup. It uses `@angular/aria` and `@angular/cdk` 22.2.0, `foundation-sites` 6.9.0, TypeScript 6.0.3, `@playwright/test` 1.63.0, and `@axe-core/playwright` 4.13.0. The generator's `vitest@^5.0.0` was pinned back to 4.1.11. The app is zoneless (the CLI 22.2 default); a second build configuration adds `zone.js` 0.16.3 for the zone check. Chromium, Firefox, and WebKit all ran on this Windows arm64 machine, so nothing below is unproven for lack of an engine.

### Verdict

Yes: a `scroll-snap-type: x mandatory` `.orbit-container` reproduces Orbit per the APG tabbed carousel without Motion UI or the `@if` fallback, in all three engines. Prev/next (`scrollIntoView`), the bullets (Aria `TabList`, keyed by `value`), arrow and Home/End keys, native wheel scrolling, touch (headed Chromium), and a `scrollLeft` jump all land on exact slide boundaries. An IntersectionObserver with `threshold: 0.5` rooted on the container moves `.is-active`, `aria-selected`, and `inert` to whichever slide is at least half visible. A "pending target" guard stops the slides a programmatic scroll passes over from being selected, so a bullet jump from 1 to 4 records one selection change, not three. Autoplay (`setTimeout`, rescheduled from `afterRenderEffect`, restarted on every slide change) advances, wraps, stops at the end under `infiniteWrap=false`, and never moves the page. It pauses while hovered, stops when focus enters the carousel, and restarts only from the rotation control, which is the first focusable element. It starts stopped under reduced motion, where `scroll-behavior` falls back to `auto` through CSS alone. axe reports no violations for WCAG 2.2 AA plus best-practice in the rotating, stopped, and moved states. The server HTML carries all four slides, the first one `is-active`, with the others `inert` and still painted. Arrow and bullet clicks made before hydration replay once hydration finishes.

The CSS that replaces `.orbit-container { height: 0 }` and the measured height is a flex row (`height: auto; display: flex; align-items: flex-start`), whose height is the tallest slide's. The slides go back to `position: relative`, and `width`/`height` attributes on the images reserve the space before they load. `infiniteWrap` rewinds: from the last slide, "next" smooth-scrolls back across every slide to the first, rather than continuing forward as Foundation's slide-in-from-right did. Native scrolling cannot wrap at all.

Three gaps are handed to the spec (below):

- Aria's roving tab stop stays on the last bullet the user operated when the selection changes by scrolling or autoplay.
- Server HTML has no bullet tab stop until Aria's first client render.
- With no JavaScript, or inside `hydrate never`, the user can scroll to slides that are visible but `inert`.

### Results

Viewport 1000x800. The container is 968 px wide, so slide *n* snaps at `scrollLeft = 968n`. Numbers are identical in all three engines unless a row says otherwise.

| Case | Result | Evidence |
| --- | --- | --- |
| Layout: every slide paints, no JS height | PASS x3 | Container 968x484, `scrollWidth` 3872; slide lefts 0/968/1936/2904; slide heights 403/403/484/403 = the image heights; container height = the tallest (the 1200x600 slide); computed `scroll-snap-type: x mandatory`, `scroll-behavior: smooth` |
| Next, next, next, previous (`scrollIntoView({block:'nearest', inline:'start'})`) | PASS x3 | active 1,2,3,2; `scrollLeft` 968,1936,2904,1936; `inert` pattern after the last step `1101` |
| Bullet click, slide 1 to slide 4 | PASS x3 | active 3, `aria-selected` on tab 3, `.is-active` on bullet 3, `scrollLeft` 2904; change log has exactly one entry `{i:3, cause:'user'}` (no intermediate selections) |
| Tab order | PASS x3 (after a fix) | rotation control, `.orbit-previous`, `.orbit-next`, visible slide (Aria tabpanel `tabindex=0`), selected tab. Before the fix Firefox added a stop on `.orbit-container` itself, because Firefox makes scroll containers focusable; `tabindex="-1"` on the container removes it, and axe stays clean because the visible tabpanel is focusable |
| Aria tablist keys on the bullets | PASS x3 | ArrowRight, End, Home, ArrowLeft give active 1,3,0,3 (ArrowLeft wraps under `[wrap]="infiniteWrap"`); focus follows the selected bullet; `scrollLeft` 968,2904,0,2904 |
| Native scroll drives the active slide (IO) | PASS x3 | wheel of 0.6 slide width: active 1, `scrollLeft` 968; `scrollLeft = 1936` set directly (as a scrollbar drag would): active 2, `aria-selected` 2; a reverse wheel of 0.2 width ends on a boundary in every engine, but Chromium stays on slide 3 (1936) while Firefox and WebKit move to slide 2 (968) |
| Touch swipe | PASS headed Chromium; harness limit headless; not run in Firefox/WebKit | CDP `Input.dispatchTouchEvent` headed: active 1, `scrollLeft` 953 = width (headed viewport). Headless shell: `scrollLeft` 592, never snaps. The same gap (345/361, no snap) appears on a plain HTML snap container with no Angular, so it is the harness. `Input.synthesizeScrollGesture` moved nothing headless or headed. Playwright has no touch-drag input for Firefox or WebKit |
| Autoplay, `delay=700` | PASS x3 | auto sequence 1,2,3,0,1,2 (wraps); intervals 705-755 ms; first tick about 700 ms after stability (stable at 186/301/521 ms); `aria-live="off"` while rotating |
| Autoplay never scrolls the page | PASS x3 | page scrolled so the carousel was out of view: `window.scrollY` 1036/1035/1037 before and after five ticks (autoplay uses `container.scrollBy`) |
| `infiniteWrap=false` | PASS x3 | autoplay stops at slide 4 (index 3); "next" and ArrowRight on the last bullet leave it at index 3 |
| `infiniteWrap=true`, next on the last slide | PASS x3, rewinds | active 0, `scrollLeft` 0; per-frame path 2904 down to 0 through every slide (54/30/13 distinct samples in Chromium/Firefox/WebKit); log only `{3,user}`, `{0,user}` |
| Hover pause | PASS x3 | index stays 0 through 1.6 s of hover at `delay=500`; 1.3 s after leaving it is 2; `aria-live="polite"` while hovered |
| Focus stops rotation (APG) | PASS x3 | focus on the rotation control does not stop it (2 ticks); Tab to `.orbit-previous` stops it (label "Start automatic slide show", `aria-live="polite"`), no tick in 1.6 s; Enter on the rotation control restarts it (label "Stop automatic slide show", `aria-live="off"`, ticks resume) |
| Rotation control | PASS x3 | first focusable element inside `.orbit`; label toggles Stop/Start; `aria-live` toggles off/polite (stays polite while the pointer hovers it) |
| Reduced motion | PASS x3 | computed `scroll-behavior: auto`; no tick in 1.6 s; label starts at "Start automatic slide show"; `scrollLeft` is 968 in the same task as the "next" click (instant) |
| axe (wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa, best-practice) on `.orbit` | PASS x3 (after two fixes) | 0 violations in rotating, stopped, and moved states. First run (Chromium) failed with `aria-allowed-role` (`li` with `role="tabpanel"`), `list` (`ul#orbit-slides`), and `color-contrast` (the caption over white, because the slides were stretched to the tallest height). The fixes were `div` slides and `align-items: flex-start`. `nav.orbit-bullets` with `role="tablist"` passes |
| RTL (`dir="rtl"` through CDK `Dir`) | PASS x3 | next: active 1, `scrollLeft` -968; ArrowLeft on a bullet goes to the next slide (Aria flips the keys): active 2, `scrollLeft` -1936 |
| Page scroll from `scrollIntoView` | Finding x3 | with the carousel's top 120 px above the viewport, "next" scrolled the page from `scrollY` 186 to 66; the `nav=container` variant (`container.scrollBy`) left it at 186 |
| Server HTML | PASS x3 (same HTML) | 4 `.orbit-slide` elements, first `is-active`, the other 3 `inert="true"` with `tabindex="-1"`; 4 `<img>` with `width`/`height`; rotation control present; `aria-live="off"`; tab 0 `aria-selected="true"`; `jsaction="click:;"` on the arrows and `keydown:;click:;focusin:;` on the tablist; **no tab has `tabindex="0"`** and the tablist has `tabindex="-1"` |
| JavaScript disabled (the `hydrate never` leftover) | PASS with a caveat, x3 | container 968x484, `scrollWidth` 3872, a wheel scrolls to 968 and snaps; `.is-active` stays on slide 0 and the slide now in view keeps the server's `inert`; the arrows, bullets, and rotation control do nothing |
| Replay after a delayed bundle (main bundle +2.5 s) | PASS x3 | "next" clicked at 134-296 ms, stable at 2673-2785 ms, then active 1, `scrollLeft` 968; bullet 3 clicked before hydration, then active 2, `scrollLeft` 1936; no console errors (Aria's click path survives replay) |
| Zone build, timer via `runOutsideAngular` | PASS x3 | stable at 2503/2831/2558 ms; the pre-hydration "next" replayed, then autoplay continued |
| Zone build, control with the timer inside the zone (`zone.run`) | Control behaves as predicted, x3 | never stable within 5.5 s, so `whenStable` never resolves, and the pre-hydration click is **never replayed** (autoplay alone moves the slides) |
| Tab stop after the user used the tablist | GAP x3 | ArrowRight on the bullets, then a native scroll to slide 4: `aria-selected` on tab 3, but `tabindex="0"` stays on tab 1 |

Exact error text for the failures seen on the way (all fixed or explained above):

- Firefox tab order, before `tabindex="-1"`: `Expected ... "slide0", "tab0"` / `Received ... "orbit-container", "slide0"`.
- axe before the markup and CSS fixes: `aria-allowed-role: #ng-tabpanel-a21070-0`, `color-contrast: #ng-tabpanel-a21070-0 > figure > figcaption`, `list: #orbit-slides`.
- Headless Chromium touch: `expect(received).toBe(expected) // Object.is equality  Expected: 968  Received: 592`.
- Before `foundation-typography` was included, every scroll position was off by 40 px (`Expected: 3872 Received: 3752`), because the browser's default `ul` `padding-inline-start: 40px` stayed in place. Foundation's typography base resets it, as `foundation-everything` does for consumers.

### What I had to do with `@angular/aria/tabs`

- `ngTabs` on the `.orbit` root, `ngTabList` on `nav.orbit-bullets`, `ngTab` on each bullet `<button>`, and `ngTabPanel` on each slide, paired by equal `value` strings (`s0`...`s3`).
- Slide content is projected directly, with no `ngTabContent`. Aria's `DeferredContent` would leave slides empty in server HTML. In dev mode, `TabPanel` warns "ngTabPanel must have an ngTabContent structural directive to render." (`src/aria/tabs/tab-panel.ts`). Only production builds were run here, so the warning was read from source, not seen.
- Aria's panel `inert` on unselected slides is what makes scroll snap work with the APG: the slides stay painted, so they can be scrolled to, yet they are hidden from assistive technology ("hidden, not off-screen"). Aria's `tabindex="0"` on the visible panel is the keyboard entry to the slides and satisfies axe `scrollable-region-focusable`.
- Selection is one-way plus an output handler: `[selectedTab]="selectedValue()"` and `(selectedTabChange)="onTabChange($event)"`, not `[(selectedTab)]`. Scrolling has to start from the user action (bullet or key), while the IntersectionObserver also writes the selection; turning a selection into a scroll would fight the observer during every smooth scroll.
- `[wrap]="infiniteWrap"` maps the Foundation option onto arrow-key wrapping. CDK `Dir` on the root is needed for Aria to flip the arrow keys in RTL; a bare `dir` attribute does not provide `Directionality`.
- `ul`/`li` become `div`s, because `tabpanel` is not an allowed role on `li` (axe `aria-allowed-role`, `list`). The APG research's `li[role=group]` alternative is not allowed on `li` either.
- Public API cannot move the roving tab stop. `TabList.open()` changes only the selection. `setDefaultStateEffect()` realigns the active tab with the selected one only until the first interaction, and a `focusin` on the tablist counts as interaction (`src/aria/private/tabs/tabs.ts:227-273`).

### Custom CSS (the `nfs-orbit` Library mixin), with the Foundation rules it overrides

All of it lives in `prototypes/orbit-scroll-snap/src/_nfs-orbit.scss`, included after `foundation-orbit`. Everything else (bullets, controls, caption, figure, image, `.is-active` bullet colour) is Foundation's own CSS, unchanged.

| Selector | Declaration | Overrides (Foundation `scss/components/_orbit.scss`) | Why |
| --- | --- | --- | --- |
| `.orbit-container` | `height: auto` | `height: 0` ("Prevent FOUC by not showing until JS sets height") | The flex row takes the tallest slide's height; no measurement; slides paint from server HTML |
| `.orbit-container` | `display: flex` | none (Foundation's slides were absolute) | Puts the slides side by side for horizontal scrolling |
| `.orbit-container` | `align-items: flex-start` | none | Slides keep their own height, as Foundation's absolute slides did, so the caption at the slide bottom stays on its image (the stretched layout failed `color-contrast`) |
| `.orbit-container` | `overflow-x: auto` | the x half of `overflow: hidden` (the y half stays hidden) | Native scrolling is the swipe and the target of `scrollIntoView` |
| `.orbit-container` | `scroll-snap-type: x mandatory` | none | Snap positions |
| `.orbit-container` | `overscroll-behavior-x: contain` | none | Stops an edge overscroll from becoming a browser back/forward swipe; kept for that reason but **not measured** here |
| `.orbit-container` inside `@media (prefers-reduced-motion: no-preference)` | `scroll-behavior: smooth` | none | Smooth arrows, bullets, and autoplay; reduced motion keeps `auto`, and `scrollIntoView()`/`scrollBy()` without a `behavior` option follow the CSS |
| `.orbit-slide` | `position: relative` | `position: absolute` | Slides join the flex row; still positioned, so `.orbit-caption { position: absolute; bottom: 0 }` keeps anchoring to its slide |
| `.orbit-slide` | `flex: 0 0 100%` | none (`width: 100%` kept) | One slide per container width |
| `.orbit-slide` | `scroll-snap-align: start` | none | Snap point per slide |
| `.orbit-slide` | `scroll-snap-stop: always` | none | One swipe moves at most one slide, like Foundation's swipe |

`.orbit-slide.no-motionui.is-active { top: 0; left: 0 }` no longer matters, because `.no-motionui` is never set. The single non-CSS markup change the layout requires is `tabindex="-1"` on `.orbit-container` (the Firefox tab stop). Every property is inside the Browser target: scroll snap, `scroll-behavior`, `overscroll-behavior`, and `scroll-snap-stop` are all Baseline widely available before 2026-05-07.

### Fallback check

The scroll-snap design failed no case, so the `@if`-rendered slides fallback (building-blocks 1.6 rule 2) was not built. It would fix only the forward wrap. Its costs, from sources:

- Only the active slide would be in server HTML.
- `animate.enter` could not go on the server-rendered first slide, because it plays at hydration (see [Prototype: `animate.enter` at hydration](52-prototype-animate-enter-hydration.md)).
- Swipe would have to be synthesized from pointer events.
- The container height would jump between slides of different heights.
- The no-JavaScript leftover would lose native scrolling.

It does not help with the tab-stop or pre-hydration keyboard gaps.

### What the prototype does not prove

- The directive family and `hostDirectives` composition. One component stands in for `nfsOrbit`/`nfsOrbitContainer`/`nfsOrbitSlide`/`nfsOrbitBullets`/`nfsOrbitBullet`/`nfsOrbitPrevious`/`nfsOrbitNext`/`nfsOrbitRotation`, with Aria used directly; composition is the subject of [Prototype: `@angular/aria` Accordion and Tabs under Foundation markup](43-prototype-aria-accordion-tabs.md).
- Real touch devices, iOS momentum scrolling, touch in Firefox and WebKit, and touch in headless Chromium (harness limit, shown on plain HTML).
- Screen reader output: the live region toggling and the `aria-roledescription` announcements were checked as DOM state only.
- The minimum browser versions (Chrome/Firefox 119, Safari 17). Playwright 1.63 ships newer engines.
- The visible horizontal scrollbar under the slides on classic-scrollbar platforms. Headless runs reported a scrollbar height of 0, and headed layout was not measured.
- `overscroll-behavior-x` at the edges, and `@defer (hydrate on viewport)` (not built). The zone build was checked only for stability and replay.
- Dev-mode Aria warnings (production builds only), and images without `width`/`height` attributes (they would shift the height after load).

### Decision handed to [Spec: Orbit](33-spec-orbit.md)

1. Keep the scroll-snap design; drop the `@if`/`animate.enter` fallback from building-blocks 1.6 rule 2 and Table B for Orbit. The spec's CSS is the custom CSS table above, as the `nfs-orbit` Library mixin, and the documented markup uses `div.orbit-container > div.orbit-slide` (not `ul`/`li`). The container carries `tabindex="-1"`, and images carry `width`/`height`.
2. Active slide: an IntersectionObserver (root: the container, `threshold: 0.5`) created in `afterNextRender`, plus a pending-target guard. Passive `wheel`/`touchstart`/`pointerdown`/`keydown` listeners, added in code, cancel the guard. No `scrollend` (out of target).
3. Movement: scroll only the container (`container.scrollBy({left: slideRect.left - containerRect.left})`, which also works in RTL) for arrows, bullets, and autoplay. `scrollIntoView` moved the page by 120 px when the carousel was partly out of view, and APG arrows must not move focus or the page.
4. Autoplay: `setTimeout` rescheduled from `afterRenderEffect` on `rotating()` and the selected index. Angular 22.2 already runs every render hook outside the zone (`packages/core/src/render3/after_render/manager.ts:86`), so `runOutsideAngular` is needed only for a timer started in an event handler. A timer inside the zone blocks stability and therefore event replay (measured). Rules: stop on `focusin` anywhere except the rotation control; pause while hovered (the spec should skip the hover pause over the rotation control, as the APG tablist example does, using a `pointerover` target check); start stopped under reduced motion; `aria-live` off only while rotating.
5. Bullets: Aria Tabs with value-keyed pairing, one-way `[selectedTab]` plus `(selectedTabChange)`, `[wrap]` bound to `infiniteWrap`, and CDK `Directionality` for RTL. The spec must address the roving tab-stop drift (OPEN FOR HUMAN 1). It should also bind the selected bullet's pre-hydration tab stop in its own host binding (building-blocks 1.9: the wrapper's host bindings win), because Aria's server HTML has none.
6. `infiniteWrap`: document the rewind behaviour and that native swipes stop at the ends; Aria arrow keys wrap with it.
7. Rendering modes: the server HTML matches the building-blocks row. Document the leftover under `hydrate never` and without JavaScript: native scrolling still works, but slides after the first are `inert` while visible. Keep the `hydrate on viewport` recommendation, and add that the whole carousel must sit in one hydration boundary.

### OPEN FOR HUMAN

1. **Roving tab stop drift in Aria Tabs.** After any user interaction with the bullets, a selection change from scrolling or autoplay leaves `tabindex="0"` on the old bullet (measured: selected 3, tab stop 1, in all three engines). The APG expects Tab to land on the selected tab. The only fixes read from source rely on the underscore member `_pattern` (`_pattern.setDefaultState()`, or setting `inputs.activeItem`), which the library should not depend on. The other options are an upstream Aria change or accepting the drift. Sources cannot decide which risk to take.
2. **The visible horizontal scrollbar.** On classic-scrollbar platforms the container shows a scrollbar under the slides, which Foundation's Orbit never had. Hiding it needs `scrollbar-width: none` (Safari 18.2, outside the Browser target) plus the non-standard `::-webkit-scrollbar`, and hiding it also removes a native affordance. This is a visual design choice.
3. **The `infiniteWrap` rewind.** Foundation continued forward from the last slide to the first; scroll snap rewinds across every slide. A continuous forward loop would need cloned slides, which duplicates content for assistive technology and crawlers. Whether the rewind is an acceptable behaviour change is a product call.

Orchestrator, 2026-09-26: item 1 (Aria's roving tab stop) stays OPEN FOR HUMAN because its fixes are upstream or internal. Items 2 (the visible horizontal scrollbar) and 3 (rewind versus forward wrap) are design choices the [Spec: Orbit](33-spec-orbit.md) settles from sources in its decision log, recording them as OPEN FOR HUMAN only if sources cannot. The `@if` fallback for slides is retired from the building-blocks map in the Orbit spec's shared-file changes.

### Triage (auto-trap quadrant), 2026-09-26

Rule: [map](../map.md), Orchestration rules, "Triage of human-only items". Only HIGH impact with NOT-HIGH confidence stays OPEN FOR HUMAN; upstream filings and assistive-technology checks stay human-only by kind. The [Spec: Orbit](33-spec-orbit.md) ticket was still in progress at triage time; it owns items 2 and 3 (orchestrator note above) and chooses Orbit's default for item 1, so its own triage supersedes this entry for Orbit.

1. Roving tab stop drift in Aria Tabs: after a user interaction with the bullets, a selection change from scrolling or autoplay leaves `tabindex="0"` on the old bullet.
   - Impact: HIGH. Every spec that hosts Aria `TabList` and changes the selection from outside Aria can meet it: Orbit (scrolling, autoplay), and likely [Spec: Tabs](16-spec-tabs.md) and ResponsiveAccordionTabs when a bound `selected` model changes (measured on Orbit only). A fix through the underscore member `_pattern` would be copied into each of them and break on any Aria release, so unwinding it later re-touches shipped code in several directives.
   - Confidence: NOT HIGH. No default was applied; every option found costs something the sources cannot weigh: accepting the drift ships a known deviation from the APG tabs pattern (Tab should land on the selected tab) against the standing APG preference (map Notes); `_pattern.setDefaultState()` or `inputs.activeItem` depend on Aria internals; an upstream change is outside the effort's control. A fourth route, a library `[attr.tabindex]` host binding that follows the selected tab (the host's bindings win over its host directives', as [Spec: Tabs](16-spec-tabs.md) decision 13 uses for the pre-hydration tab stop), is untested for this case: it would disagree with Aria's internal active item until the next focus.
   - Outcome: STAYS OPEN FOR HUMAN. Competing options: (a) accept and document the drift; (b) reset Aria's active item through `_pattern` (internal); (c) a library `tabindex` host binding keyed on the selected tab (untested for drift); (d) wait for an upstream Aria fix. Filing the issue in angular/components is HUMAN-ONLY BY KIND (upstream filing).
2. The visible horizontal scrollbar: handed to [Spec: Orbit](33-spec-orbit.md) by the orchestrator note above; not rated here.
3. The `infiniteWrap` rewind: handed to [Spec: Orbit](33-spec-orbit.md) by the orchestrator note above; not rated here.
