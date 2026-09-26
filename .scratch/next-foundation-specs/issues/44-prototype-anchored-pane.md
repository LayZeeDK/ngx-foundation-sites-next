# 44. Prototype: Anchored pane positioning, measured Positionable port versus CDK Overlay

Type: prototype
Status: resolved
Blocked by: 14, 38
Labels: wayfinder:prototype
Map: ../map.md

## Question

Does an in-place positioner run from `afterRenderEffect` with `ResizeObserver` match Foundation's 12 placements (4 positions by 3 alignments), auto-position fallback order, the body-box bound, RTL, and scrolling ancestors for `.dropdown-pane` and `.tooltip`, without CDK Overlay? Where it fails, does CDK Overlay with a connected position strategy (inline popover location) cover the case while keeping Foundation's pane CSS? Measure both on the same fixtures.

Read first: `building-blocks.md` (the matrix row and the open risk this prototype settles), `adr/*.md`, `research/foundation-inventory-positioned.md`, `research/angular-cdk-inventory.md`, `research/web-platform-features.md`, `research/angular-rendering-modes.md`.

## How to work it

Build the prototype per `/mattpocock-skills:prototype` at the high fidelity the map's AFK override allows: a synthetic Nx workspace under `D:/tmp/nfs-proto-anchored-pane/` created with `npx create-nx-workspace@latest` at the map's target versions (Angular 22.2, Nx 23.2, TypeScript 6.0.x, Vitest 4.1.x) with `foundation-sites` 6.9 Sass, or a git worktree of this repo if that is faster. Never modify this repo's working tree outside the effort directory. Drive it in a real browser with `/playwright-cli`, across Chromium, Firefox, and WebKit whenever the question depends on the engine, and include a server-rendered run whenever the question touches first paint or hydration.

Capture it: copy the decisive files into `prototypes/anchored-pane/` in the effort directory with a README that states the question, how to run it, and the verdict. The workspace under `D:/tmp/` may stay; record its path.

Under `## Answer`: the verdict in one paragraph, a results table (case, result, evidence), exact error text for failures, what the prototype does not prove, the decision it hands to the blocked spec tickets, and anything left `OPEN FOR HUMAN`.

## Answer

Resolved 2026-09-26 (AFK). Prototype: [prototypes/anchored-pane/README.md](../prototypes/anchored-pane/README.md). Workspace: `D:/tmp/nfs-proto-anchored-pane/app`.

### Verdict

Yes, the in-place port matches Foundation. The Positionable and Box port measures in the `afterRenderEffect` `earlyRead` phase, writes `top`/`left` in `write` on Foundation's own `position: absolute` `.dropdown-pane` and `.tooltip`, and re-runs from a `ResizeObserver` on the pane, the anchor, and `body`. It reproduces Foundation 6.9 to within 0.02 px wherever Foundation follows its own formulas, in Chromium 153, Firefox 155, and WebKit 26.6. That covers all 12 placements (with `vOffset`/`hOffset` and the tooltip pip offsets), the auto-position fallback order at every viewport edge, least-overlap when nothing fits, the body-box bound (it flips on a short body and does not flip below the fold on a tall one), RTL (auto alignment becomes `right`, explicit positions stay physical), resize, `position: relative` ancestors, and scrolling ancestors at open time with the trigger partly scrolled out. It differs from Foundation in three measured places:

- Two Foundation bugs are deliberately not ported. Foundation's tip is placed with a height measured at the previous candidate, leaving a 19.19 px gap; the port's result is exact. Foundation also keeps its tried-positions set across opens: after one open where nothing fit, later opens skip the search and leave the pane overflowing; the port searches again on every open.
- One real regression. The in-place tip is clipped by a positioned `overflow: auto` ancestor. Foundation appends the tip to `body`, so its tip is never clipped.

CDK Overlay (`FlexibleConnectedPositionStrategy`, positions listed in Foundation's search order, `withPopoverLocation('inline')`, top-layer popover) reproduces the pane geometry and is not clipped. It does not keep Foundation's contract:

- It bounds collisions by the viewport, not the body box, and has no `allowBottomOverlap`. Measured: it flipped a dropdown upward at the bottom edge, and made the opposite choice to Foundation in both body-box cases.
- It follows a static scroller only when that scroller carries `cdkScrollable`.
- It breaks Foundation's `.tooltip` CSS. `top: calc(100% + pip)` overrides CDK's `bottom` inline style in the 5 placements whose `overlayY` is `bottom`, which moves the tip 209 to 254 px. CDK's unlayered `.cdk-overlay-pane { max-width: 100%; display: flex }` also replaces the tip's 10rem `max-width`.
- The pane is not the consumer's element and is absent from server HTML.

So the decision stands as ADR 0002 wrote it: in-place port, no CDK. The only case CDK covers better, the clipped tip, costs two custom rules and the server-HTML pane, and is left `OPEN FOR HUMAN`.

### Build facts

- Workspace: a plain Angular CLI 22.2.0 application (`npx @angular/cli@22.2.0 new app --ssr --style=scss --zoneless`), not an Nx workspace. The orchestrator's brief asked for the smallest runnable thing; this question depends on neither Nx nor Vitest.
- Pinned packages: `@angular/*` 22.2.0, `@angular/cdk` 22.2.0, `foundation-sites` 6.9.0, `typescript` 6.0.3, `@playwright/test` 1.63.0.
- The generator added `vitest ^5.0.0`, not the map's 4.1.x. It was left as generated because no unit test runs here.
- Foundation's peer range `jquery >=3.6.0` resolved to jQuery 4.0.0. Foundation's `dist/js/foundation.js` ran on it with no console error in any engine.
- The fixture route is `RenderMode.Server` (the generator's default was `RenderMode.Prerender`), so query parameters reach the server render.
- `security.allowedHosts` is set to `localhost` and `127.0.0.1`.
- Everything ran against the production build under the SSR server on port 4441. Each case hydrates a server-rendered page, then opens the pane.
- The reference oracle is `public/foundation-ref.html`: the same DOM, Foundation's own JavaScript, and `dist/css/foundation.css`. Trigger boxes were identical between the Angular page and the reference page (75.86 x 40.88 px in Chromium), so the pane offsets `(dx,dy)` from the anchor are compared directly.

### Results

Numbers are Chromium. Firefox and WebKit agree to within 0.1 px, and every placement is identical in all three (`results/firefox.txt`, `results/webkit.txt`). `(dx,dy)` is the pane's offset from the anchor in px. F = Foundation 6.9 reference, P = port, C = CDK. Evidence: `prototypes/anchored-pane/results/<engine>.txt` under the case name.

| Case | Result | Evidence |
| --- | --- | --- |
| 12 placements, dropdown, `vOffset` 7, `hOffset` 11 | P = F = formula on all 12 (for example `bottom-left (11,47.88)`, `top-right (-235.14,-65)`, `left-center (-311,-1.56)`); C = F on all 12 | `12 placements: dropdown *` |
| 12 placements, tooltip, pip offsets 14/12 added | P = F = formula on all 12; C = F on 7. C is wrong on `top-left`, `top-right`, `top-center` (dy +209.39 instead of -64.19) and `left-bottom`, `right-bottom` (dy +223.39 instead of -9.31) | `12 placements: tooltip *` |
| Fallback: dropdown default near the right edge | `bottom-right` in F, P, and C | `fallback: dropdown default near right edge` |
| Fallback: dropdown `position: left` near the left edge | `right-top` in F, P, and C | `fallback: dropdown pos=left near left edge` |
| Fallback: dropdown `position: top` near the top edge | `bottom-left` in F, P, and C | `fallback: dropdown pos=top near top edge` |
| Fallback: dropdown default near the body bottom (`allowBottomOverlap: true`) | F = P `bottom-left`; C flips to `top-left` (CDK has no bottom-overlap allowance) | `fallback: dropdown default near bottom edge` |
| Fallback: tooltip default (`top-center`) near the top edge | `bottom-left` in F, P, and C: Foundation's order goes `top-*` then `bottom-left`, and C gets the same answer because its list is in that order | `fallback: tooltip default near top edge` |
| Fallback: tooltip `position: left` near the left edge | `right-top` in F, P, and C | `fallback: tooltip pos=left near left edge` |
| Fallback: long tooltip near the left edge | F = P `top-left (0,-153.13)`; C `(0,+416.39)` without the override; C `(0,-57.19)` with the override, because the tip lost its `max-width` and became one 673 px line | `fallback: tooltip default near left edge`, `CDK tip override: tooltip default near left edge` |
| Fallback: tooltip `position: right` near the right edge | P `top-left (0,-57.19)`, formula error 0; F `top-left (0,-76.38)`, 19.19 px off its own formula (tip height measured at the squeezed right-edge candidate); C broken (`+416.39`) | `fallback: tooltip pos=right near right edge` |
| Nothing fits (300 x 300 viewport, long text) | `bottom-left` (least overlap) in F, P, and C | `nothing fits: dropdown in a 300x300 viewport` |
| `position: relative` ancestor (offset 37/23 px) | Dropdown: `bottom-left (11,47.88)` in F, P, and C. Tooltip: F = P `top-center (0.75,-57.19)`; C broken (`+393.39`) | `relative ancestor: *` |
| Positioned scroller, trigger 15 px scrolled out, then 30 px more scroll | Dropdown: all three open at `(0,40.88)` and follow the anchor. Tooltip: F detaches (dy 84.88, tip in `body`); P and C follow (dy 54.88) | `scrolling ancestor (positioned): dropdown / tooltip, trigger partly scrolled out` |
| Static scroller (the pane's containing block is outside it), then 30 px more scroll | F = P open at `(0,40.88)` and detach (dy 70.88). C follows with `cdkScrollable` and detaches without it. P with `followScroll` follows (dy 40.88) | `scrolling ancestor (static)*` |
| Tall pane inside a positioned scroller | F = P: the pane's lowest row is clipped (not hit-testable); C: not clipped (top layer) | `scrolling ancestor (positioned): tall dropdown overflows the scroller` |
| Long tooltip inside a positioned scroller | Same placement in all three (`bottom-left (0,54.88)`); P: clipped by the scroller; F (tip in `body`) and C (top layer): not clipped. This is the one case where the port fails against Foundation | `scrolling ancestor (positioned): long tooltip overflows the scroller` |
| Same tall pane in a static scroller | Not clipped in F, P, or C | `scrolling ancestor (static): tall dropdown overflows the scroller` |
| RTL, dropdown `auto` alignment | `bottom-right` in F, P, and C | `RTL: dropdown auto alignment` |
| RTL, explicit `left-top` dropdown and `right` tooltip | Physical placement in F, P, and C (C only because the overlay direction is forced to `'ltr'`) | `RTL: * stays physical` |
| Resize 1280 to 900 px wide, centred trigger | F, P, and C all re-placed exactly (error at most 0.02 px); the port re-runs from the `ResizeObserver` on `body` | `resize: *` |
| Body box, short body (400 px), tooltip below near the body bottom | F = P flip to `left-top` although the viewport has room; C keeps `bottom-center` | `body box: short body *` |
| Body box, tall body, tooltip below the viewport fold | F = P keep `bottom-center` (the tip is below the fold); C flips to `left-top` | `body box: tall body *` |
| Reopen after a nothing-fits open, then widen to 1280 px | F reopens at `right-bottom (75.86,-17.13)`, overflowing, with no search: its `triedPositions` was left full (`{"right":[...3],"top":[...3],"bottom":[...3],"left":[...3]}`, read from the plugin instance); P and C search again: `top-right (-224.16,-58)` | `reopen: dropdown pos=right after a nothing-fits open, then widened` |
| Reopen the right-edge tooltip | P stays exact; F repeats the 19.19 px gap | `reopen: tooltip pos=right near right edge` |
| Server HTML | Pane present as `<div nfsdropdownpane="" class="dropdown-pane" id="nfs-dropdown-pane-3">` without `.is-open`; the trigger's `aria-controls` names that id. Tooltip trigger is `class="has-tip ..."` with no `aria-describedby` and no tip. The CDK variant has no pane in server HTML | `server HTML` row |
| Hydrated page | Pane computed `display: none; visibility: hidden` from Foundation's CSS before open; 0 tips before first show; on focus the tip is created and the trigger's `aria-describedby` equals the tip id; after close the tip is kept (count 1) and hidden | `hydrated page` row |
| Computed styles, CDK-hosted panes | CDK pane keeps `width: 300px` and `z-index: 10`, gains `max-width: 100%`. CDK tip: `max-width: 100%` (port: `160px`), `display: flex` (port: `block`); CDK's `z-index` sits in a cascade layer and loses | `computed styles` row in `results/*.jsonl` of the workspace |
| Console | No console error and no `NG0` message in any of the 55 measured cases in any engine | `errors: []` in every row |
| WebKit on Windows arm64 | Ran: Playwright 1.63.0 WebKit 26.6, no error | `results/webkit.txt` |

### Exact error text for failures

No test threw; every failure above is a measured difference, not an exception. The one assertion failure while building the suite was the expected Foundation stale-height difference:

```
Error: port vs Foundation: {"foundation":{"placement":"top-left","dx":0,"dy":-76.38,"formulaErr":19.19,...},"port":{"placement":"top-left","dx":0,"dy":-57.19,"formulaErr":0,...,"matchesFoundation":false},"cdk":{"placement":"top-left","dx":0,"dy":416.39,"formulaErr":454.39,...}}
```

That case is now marked `knownFoundationDiff`.

### Questions the prototype asked itself (AFK override)

1. Does jQuery's `$.fn.offset()` document-to-offset-parent conversion survive the port? Yes. The origin is the pane's rect minus its computed `top`/`left`, read in `earlyRead`, with an `offsetTop`/`offsetLeft` fallback for an `auto` answer. It measured correctly in the `position: relative`, positioned-scroller, and static-scroller cases in all engines.
2. Can the search run from one measurement, as the ADR's phase split needs, when Foundation re-measures per candidate? Yes, on every fixture. Placements match Foundation, and where they differ it is Foundation that is off its formula. The `ResizeObserver` on the pane re-runs the search when the size changes after placement. Reopen convergence was checked on the squeezed-tip case.
3. Should Foundation's kept `triedPositions` be ported? No. It is a source bug (the Foundation inventory calls it a quirk); the measured result is an overflowing pane.
4. Must the tip exist in server HTML for `aria-controls`-style validity? No. The tip is referenced only through `aria-describedby`, bound once the tip exists, as the audited decision says. Measured: none in server HTML, created on first show, kept.
5. Can CDK keep physical `left`/`right`? Only with `direction: 'ltr'` forced on the overlay, plus `Directionality` read by hand for the RTL `auto` alignment. CDK's `start`/`end` otherwise flip.

### What the prototype does not prove

- Real browsers at the target floor. Chrome/Edge/Firefox 119 and Safari 17 were not run; Playwright's current engines stand in, and WebKit 26.6 is not Safari 17.
- Containing blocks created by `transform`, `filter`, `contain`, or `will-change` on an ancestor, `position: fixed` or `sticky` ancestors, iframes, page zoom, pinch zoom and the visual viewport, and a `body` with margin or padding (Foundation's body box then differs from the page).
- Horizontal page scroll. Foundation's right bound ignores `scrollX`, and the port copies that; untested.
- `parentClass` bounds: `rectBounds()` is ported but no fixture used it.
- Pointer and hover opening, `hoverDelay`, touch, Light dismiss, focus management (`autoFocus`, `trapFocus`), and the tip's fade: out of scope here; the tip used the `hidden` attribute.
- DropdownMenu's collision check (`opens-left`, `opens-right`, `opens-inner`).
- `ResizeObserver` loops in layouts where placement changes the pane size back and forth.
- Anchors that move without any size change (content inserted above them). Foundation does not catch this either.
- Cost at scale, and event replay of a pre-hydration click. The trigger carries `jsaction="click:;"` in server HTML and cases opened after load; a click before hydration was not tested.

### Decision handed to the spec tickets

- [Spec: Anchored pane (shared utility)](55-spec-anchored-pane.md):
  - Adopt `positionable.ts` as the positioner core: Foundation's formulas, the body-box bound with Foundation's asymmetric edges, the search order, and least-overlap, with a fresh search every open.
  - Measure in `earlyRead` (anchor rect, pane size, containing-block origin from the computed `top`/`left`, body box, scroll) and write `top`/`left` in `write`.
  - Re-run from one `ResizeObserver` on the pane, the anchor, and `body`, created lazily inside the render callback.
  - Emit the resolved placement as a signal for the consumers' classes.
  - Add `followScroll` (re-run on a captured, passive `scroll` while open) as a documented improvement over Foundation. The recommendation is on by default for panes, because it only corrects the static-scroller detachment Foundation also has; the spec decides.
  - List Foundation's two bugs (kept tried set, stale measurement) under "not ported".
  - CDK Overlay stops being the ADR's named fallback for scrolling ancestors: the port does not fail there.
- [Spec: Dropdown](26-spec-dropdown.md):
  - The pane stays the consumer's `.dropdown-pane` and is server-rendered without `.is-open`.
  - The directive binds Foundation's `has-position-*`/`has-alignment-*` from the placement signal.
  - `position`/`alignment` `auto` resolve as in `resolveStart()`: bottom, left or right by direction for top/bottom, bottom for left/right.
  - `allowBottomOverlap` defaults to `true`.
  - A pane inside a positioned `overflow` container is clipped by it, exactly as in Foundation; document it.
  - No `.is-opening` is needed: measurement happens after `.is-open` and before paint.
- [Spec: Tooltip](27-spec-tooltip.md):
  - The tip is created on first show as the trigger's next sibling and kept.
  - `aria-describedby` is bound only once the tip exists; nothing is in server HTML.
  - Pip offsets are 14/12 px as in Foundation.
  - The tip binds `{position} align-{alignment}` for Foundation's pip Sass.
  - The closed state uses `hidden` or a State class; Foundation's `.tooltip` has no hidden rule of its own.
  - The spec must state the clipping trade-off (`OPEN FOR HUMAN` 2 below) and must not host the tip in CDK Overlay without the two CSS overrides.
- [Spec: Dropdown Menu](21-spec-dropdown-menu.md): reuse `overlapArea()` and `bodyBounds()` from the positioner for the `opens-*` collision check. This prototype did not test that check.

### Custom CSS

- Port (library): none. The pane and the tip are styled entirely by `foundation-dropdown` and `foundation-tooltip`. Positioning is inline `top`/`left` writes, which is Foundation's own mechanism.
- Fixture only, not library: `.fx-trigger`, `.fx-relative`, `.fx-scroller`, `.fx-scroller-inner`, `.fx-center`. They place the trigger at exact coordinates and are inlined identically in the reference page.
- CDK variant only (measured, not adopted):
  - `.cdk-overlay-pane.tooltip { top: auto; }` is required, because Foundation's `.tooltip { top: calc(100% + pip) }` beats CDK's `bottom` inline style. With it, CDK matched F on `top-center` and `left-bottom`.
  - A second rule restoring `max-width: $tooltip-max-width` and `display: block` would also be needed. It was measured as missing and not tested.

### OPEN FOR HUMAN

1. Keep Foundation's body-box collision bound, or bound by the viewport? The port copies Foundation, and on tall pages it places a tooltip below the fold rather than flipping; the viewport is CDK's and the platform's choice. The default here is Foundation's body box, per ADR 0002's "match Foundation 6.9"; switching is a one-line change in `bodyBounds()`.
2. Tooltip inside a positioned `overflow: auto`/`hidden` container: accept that the in-place tip is clipped (documented limit), or host the tip in the top layer? The top-layer options are CDK Overlay inline popover, which costs two custom CSS rules and has no server tip (none is needed), or a later native `popover`. Foundation's `body`-appended tip is never clipped, but appending to `body` is ruled out by the rendering-modes rules. The default written here is to accept and document the clip. Pane clipping is identical to Foundation's and needs no decision.

### New tickets

None required. The Dropdown Menu collision check can be tested inside the [Prototype: Nested menu directive family with breakpoint mode switching](50-prototype-nested-menu.md) if that ticket wants it.
