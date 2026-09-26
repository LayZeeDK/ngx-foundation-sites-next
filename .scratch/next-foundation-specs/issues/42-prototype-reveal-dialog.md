# 42. Prototype: Reveal on native `<dialog>` under Foundation Sass

Type: prototype
Status: resolved
Blocked by: 14, 38
Labels: wayfinder:prototype
Map: ../map.md

## Question

Do `dialog.reveal` elements styled by `foundation-reveal`, plus a `::backdrop` rule carrying `.reveal-overlay` styling, reproduce Foundation Reveal: the size classes, full-screen below medium, `overlay: false` via `show()`, nested modals, backdrop-click close, focus placement per the APG (not on the dialog element), focus restore, scroll lock, and an exit keyframe that finishes before `close()`? What custom CSS is unavoidable, and what does the dialog render on the server?

Read first: `building-blocks.md` (the matrix row and the open risk this prototype settles), `adr/*.md`, `research/foundation-inventory-disclosure.md`, `research/aria-apg-patterns.md`, `research/web-platform-features.md`, `research/angular-rendering-modes.md`.

## How to work it

Build the prototype per `/mattpocock-skills:prototype` at the high fidelity the map's AFK override allows: a synthetic Nx workspace under `D:/tmp/nfs-proto-reveal-dialog/` created with `npx create-nx-workspace@latest` at the map's target versions (Angular 22.2, Nx 23.2, TypeScript 6.0.x, Vitest 4.1.x) with `foundation-sites` 6.9 Sass, or a git worktree of this repo if that is faster. Never modify this repo's working tree outside the effort directory. Drive it in a real browser with `/playwright-cli`, across Chromium, Firefox, and WebKit whenever the question depends on the engine, and include a server-rendered run whenever the question touches first paint or hydration.

Capture it: copy the decisive files into `prototypes/reveal-dialog/` in the effort directory with a README that states the question, how to run it, and the verdict. The workspace under `D:/tmp/` may stay; record its path.

Under `## Answer`: the verdict in one paragraph, a results table (case, result, evidence), exact error text for failures, what the prototype does not prove, the decision it hands to the blocked spec tickets, and anything left `OPEN FOR HUMAN`.

## Answer

Prototype: [prototypes/reveal-dialog/README.md](../prototypes/reveal-dialog/README.md). Workspace: `D:/tmp/nfs-proto-reveal-dialog/app`.

The orchestrator's brief set the setup. It is a plain Angular CLI 22.2.0 application with `@angular/ssr` (`npx @angular/cli@22.2.0 new app --ssr --zoneless=true`), plus `@angular/cdk@22.2.0` and `foundation-sites@6.9.0`. It is driven by `@playwright/test` 1.63.0 in Chromium, Firefox, and WebKit against a production build served by the SSR server on port 4420. It is not an Nx workspace. The generator pulled `vitest@5.0.2`, which was pinned back to `vitest@4.1.11`; Vitest is never run. WebKit runs on this Windows arm64 machine, so nothing below is unproven for lack of WebKit. The final run passed 87 of 87: 29 tests times 3 engines.

### Verdict

Yes. `dialog.reveal` under `foundation-reveal` reproduces Foundation Reveal with six small documented CSS rules in a `nfs-reveal` Library mixin, and CDK Dialog (ADR 0007's fallback) is not needed. After those rules, the default size and `.tiny`, `.small`, `.large` and `.full` match Foundation's own `.reveal` inside `.reveal-overlay` to the pixel at 320, 640 and 1024 px in all three engines. That includes full screen below medium. `::backdrop` takes the overlay colour. `overlay: false` through `show()`, stacked nested modals, closing on a backdrop `pointerdown`, Escape through `cancel`, the exit keyframe on `.is-closing` before `close()` (the `animationend` path, the duration plus 100 ms fallback, and `prefers-reduced-motion`), the closed server-rendered dialog with its content, open-by-default through `showModal()` after hydration, and the WCAG 2.2 AA checks all hold in all three engines.

The page does scroll behind an open modal in all three engines, with and without `overscroll-behavior: contain`. Foundation's `html.is-reveal-open` lock must therefore be ported. The port reuses Foundation's Sass rule; the directive writes the class and the `top` offset and restores the scroll position. It holds in all three engines.

Three directive behaviours were not foreseen by ADR 0007:

1. The invoker must come from the Trigger. WebKit does not focus a button on mouse click.
2. The exit wait must match the dialog's own keyframes by name. WebKit reports the `::backdrop` animation's `animationend` on the dialog with `pseudoElement: ''`.
3. A static `autoFocus="..."` on the `<dialog>` is the HTML `autofocus` attribute, and Firefox and WebKit then focus the dialog itself. The tested fix is for the directive to remove the attribute before `showModal()`.

Native `<dialog>` does not wrap Tab in any engine. The APG wrap needs a directive keydown handler, which was tested and works in all three.

### Results

| Case | Result | Evidence (`prototypes/reveal-dialog/results.log`) |
| --- | --- | --- |
| Size classes and full screen below medium at 320/640/1024 | Pass after rules 3 and 4 | 1024 `.tiny`: dialog `358,100,307,150` = Foundation `358,100,307,150`; every size at 320 is `0,0,320,800` in both |
| The same, Foundation CSS only (first probe) | Fail: computed `position: absolute` (the top layer changes `relative`) and left-aligned | 1024 default: dialog x=0 (Chromium) or x=16 (Firefox, WebKit) vs Foundation x=212; `left: 16px; marginLeft: 0px` vs `marginLeft: 212px` |
| Scrolled page | Pass after rule 2; before it, the dialog sat at the document top and focusing into it scrolled the page from 1000 to 0 | `during={"rect":[212,100,600,190],"scrollY":1000} after=1000` |
| Tall content | Pass after rule 4; before it, the box was 762 px tall from y=100 (UA `max-height: calc(100% - 38px)`), 62 px below the fold | `dialog=212,100,600,600`, last element reachable |
| `::backdrop` colour, text colour | Pass (text after rule 5; UA `CanvasText` gave `rgb(0,0,0)` vs `rgb(10,10,10)`) | `backdrop=rgba(10, 10, 10, 0.45) overlay=rgba(10, 10, 10, 0.45)` |
| `overlay: false` through `show()` | Pass: not `:modal`, Foundation `.without-overlay` (fixed), centred at `212,100`, page interactive, outside press closes, Escape closes through the host keydown (a non-modal dialog gets no `cancel`) | Foundation's CSS alone leaves `.without-overlay` at x=16; its JS centred it with an inline `left` |
| Nested, `multipleOpened` | Pass: inner on top, focus in the inner; Escape closes only the inner and returns focus to its Trigger in the outer; the next Escape returns focus to the page Trigger | `stacked={"outerOpen":true,"innerOpen":true,"topIsInner":true,"focus":"im-close"}` |
| Nested, `multipleOpened: false` | Pass for state (the outer closes, the inner opens and has focus); after the inner closes, focus is on `BODY` in all three, because its Trigger was inside the closed outer | `focusAfterInnerClose=BODY#` |
| Backdrop `pointerdown` | Pass: closes; the press does not activate the page button underneath; a press on the dialog padding and a drag from the content out to the backdrop keep it open; `closeOnClick: false` keeps it open | `behind (0)` |
| Escape | Pass: `.is-closing` shows while `open`, then it closes | `during exit={"open":true,"closing":true}` |
| `closeOnEsc: false` | One Escape: stays open. Repeated Escape with no user activation between presses: the browser closes it anyway (Chromium on the 3rd press; Firefox and WebKit on the 2nd, from the 2-press and 3-press runs), with no exit animation; the directive re-syncs through the `close` event | `noesc:closed` in the event log |
| Initial focus | Directive first tabbable `a#basic-link` and selector `button#af-ok` in all three; native with no `autofocus`: first focusable; native with a child `autofocus`: that child; no focusable content: the dialog itself | focus JSON line |
| Static `autoFocus` attribute on the dialog | Without the fix: `dialog#af-collide` (the dialog itself) in Firefox and WebKit, the link in Chromium. With the directive removing the host `autofocus` before `showModal()`: `a#afc-link` in all three | run 3 vs final run |
| Native Tab at the ends | None of the engines wraps. Chromium: last -> `body` -> first. Firefox: stays on the last (focus left for the browser UI). WebKit: last -> `body` -> dialog element -> close button; WebKit also skips links in its own Tab order | Tab sequence lines |
| Directive Tab wrap | Pass in all three | `wr-link -> wr-close -> wr-link -> wr-close -> wr-link -> wr-close` |
| Restore focus | Directive with the Trigger passed as origin: the Trigger in all three. Native close alone: the Trigger in Chromium and Firefox, `BODY` in WebKit | restore lines |
| Scroll behind, no lock | The page moves in all three: wheel over the backdrop (all three, with and without `contain`), wheel over the dialog (Chromium without `contain`; Firefox and WebKit even with it), keys with focus inside (Chromium without `contain`; WebKit with and without; not Firefox) | `lock=none ... pageMovedBehindModal=true` |
| Scroll behind, Foundation lock port | Pass in all three: nothing moves, no visual jump on open, scroll restored to 500 on close, classes removed | `lock=foundation ... pageMovedBehindModal=false` |
| Exit keyframe | `animationend`: closes in 247-335 ms. Fallback (dialog keyframes paused): 359-389 ms, with the backdrop's own `animationend` ignored. Reduced motion (1 ms): 15-56 ms, `animationend` still fires. `closed` is emitted after `close()` in every case | exit lines; WebKit events `nfs-reveal-backdrop-out:""` show the empty `pseudoElement` |
| Server HTML | Pass: `<dialog id="basic" nfsreveal="" aria-labelledby="basic-title" class="reveal" jsaction="pointerdown:;keydown:;">` without `open`, content present | server tag lines |
| Open by default | Pass: `:modal` after hydration, focus on the close button, no console errors or warnings | `{"open":true,"modal":true,"focus":"obd-close"} console=[]` |
| JavaScript disabled | Hidden (`display: none`), content in the DOM; open-by-default stays closed | no-JS line |
| axe, WCAG 2.2 AA tags (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`), every size at 320 and 1024 px | 0 violations, 0 incomplete, `target-size` passes, in all three | axe lines |
| 2.5.8 target size, `.close-button` | Pass by the spacing exception: 18.7 x 32 px, nearest other target 134-156 px from its centre | `size":[18.7,32]` |
| 1.4.3 / 1.4.11, close-button glyph | Pass: `$closebutton-color` `rgb(138,138,138)` on white = 3.45:1; the glyph is 32 px (large text), so 3:1 applies. Hover and focus colour = 19.63:1 | `idleVsWhite=3.45` |
| 1.4.11, dialog against the backdrop | Pass: 3.17:1 against a white page dimmed by `$reveal-overlay-background` (the worst case) | `dialogVsDimmedPage=3.17` |
| Focus indicator | The browser default ring on `:focus-visible` in all three (Foundation hides outlines only under what-input, which is not loaded) | `focusOutline` |
| 2.4.11 focus not obscured | Pass: focus stops in the dialog, the last button of the tall dialog, and the restored Trigger are in the viewport and hit-test to themselves; WebKit scrolls the tall dialog to the focused button one frame later than the others | 2.4.11 lines |

Exact failures during the run, all fixed or explained: the first geometry probe (above); the WebKit fallback test before the name filter (`Expected: 0 Received: 1` animation ends, closed at 317 ms, before the 350 ms fallback); and the WebKit nested and restore tests before origin capture (`afterFirstEsc` focus `outer`, the dialog itself; restore -> `""`). Two fixture artifacts were removed from the tests: Playwright's scroll-into-view before a click moved a scrolled page, and an event log placed above the scroll position moved `scrollY` by 40 px through scroll anchoring. No failures remain.

### What the prototype does not prove

- Real Safari on macOS or iOS, touch scrolling behind a modal on mobile, and headed browsers. In headless runs, focus leaving for the browser UI shows up as `body` or as no change.
- `.zf-has-scroll` preventing a layout shift: headless reports `clientWidth` 1024 with and without the lock, so there is no scrollbar width to lose.
- Screen reader output: the modal announcement, the name from `aria-labelledby`, and browse-mode containment.
- RTL (`inset-inline` is logical but was not run under `dir="rtl"`), `@defer` and incremental hydration around the dialog, event replay of the opener click before hydration, Motion class inputs other than the `nfs-fade-*` defaults, `deepLink`, `alertdialog`, and a dialog nested inside another dialog's DOM (the siblings of Foundation's docs markup were tested).
- `getAnimations()` as an alternative to the `animationend` name filter.
- OffCanvas overlap mode on `<dialog>` (Table B's folded question): not built. The findings that carry over are rules 1, 2, 5 and 6, the backdrop colour from `$offcanvas-exit-background`, and the scroll lock.

### Decision handed to the Reveal and OffCanvas specs

- **Implementation level:** native `<dialog>` stands (ADR 0007). CDK Dialog is not needed for any case.
- **Scroll lock:** port Foundation's contract; do not drop it. The directive adds `is-reveal-open` (and `zf-has-scroll` when the document is taller than the viewport) on `html` and writes `top: -scrollY` when the first modal opens. When the last one closes, it removes both and restores the scroll position (the `_disableScroll`/`_enableScroll` port in `reveal.ts`). Foundation's Sass does the locking. The lock applies only to modal (`overlay: true`) dialogs and is restored in `DestroyRef.onDestroy`. `overscroll-behavior: contain` is not a substitute. For OffCanvas `contentScroll: false`, the same measurement says the page scrolls unless locked.
- **Custom CSS:** the six rules listed below, in `nfs-reveal`, printed after `foundation-reveal`, on `.reveal[open]` (specificity 0,2,0, so they also beat `.reveal.tiny` and the other size classes).
- **Focus placement:** the directive places focus after `showModal()`: `'first-tabbable'` (default) through CDK `InteractivityChecker`, or a selector. It never focuses the dialog when content is focusable. When nothing is focusable, the dialog itself receives focus in every engine, so the spec should require a close button (APG: strongly recommended). The directive removes its host's `autofocus` attribute before `showModal()`.
- **Tab wrap:** the directive wraps Tab and Shift+Tab itself on every Tab key (keydown on the host, cycling through `InteractivityChecker` tabbables). The APG keyboard table is the contract (building-blocks 1.10), and no engine wraps natively. Wrapping only at the ends is not enough, because WebKit puts the dialog element in its Tab order.
- **Restore focus:** the Trigger passes itself (`open(origin)`, for the [Spec: Triggers (shared utility)](54-spec-triggers.md) to carry). `document.activeElement` is only the fallback. When the invoker is no longer focusable (inside a dialog that `multipleOpened: false` closed), the fallback is the invoker of the dialog that was closed. That fallback was not built; all three engines otherwise leave focus on `body`.
- **Exit animation:** `.is-closing` State class, then `animationend` filtered by `target === host`, an empty `pseudoElement`, and `animationName` equal to the host's computed `animation-name`, or the duration plus 100 ms fallback timer outside the zone, then `close()`. The library's backdrop keyframes use their own names (`nfs-reveal-backdrop-in/out`). Reduced motion: 1 ms through `nfs-motion`. `opened`/`closed` are emitted after the animation.
- **Escape and `closeOnEsc`:** `cancel` is always prevented and turned into `close()`, so the exit runs. `closeOnEsc: false` (and a `closePredicate` for Escape) is best effort. Repeated Escape without user activation closes a native modal regardless, so the spec documents this, and the directive re-syncs `isOpen` and restores focus on the native `close` event.
- **Backdrop click:** `pointerdown` on the host with `target === host` and the point outside the border box, as ADR 0007 says. Presses on the padding and drags out of the content are safe, and the press does not reach the page.
- **`overlay: false`:** `show()`, not modal, Foundation's `.without-overlay` bound as a class. Escape comes from a host `keydown` (it works only while focus is inside). An outside press closes through a document `pointerdown` listener added while open. The APG treats this as a non-modal dialog.
- **Server and hydration:** server output is a closed `<dialog class="reveal">` with its content, and nothing is bound to `open`. Open-by-default and every `isOpen` change go through `showModal()` in `afterRenderEffect`. No JavaScript means no open dialog.
- **Vertical position:** `vOffset`/`hOffset` stay OPEN FOR HUMAN (below). The prototype renders Foundation's CSS position (top 100 px, centred).

### Custom CSS (all in the `nfs-reveal` Library mixin; reasons in `prototypes/reveal-dialog/src/_nfs-reveal.scss`)

1. `.reveal[open] { display: block }` -- Foundation's `reveal-modal-base` sets `display: none`; its JavaScript showed the modal inline.
2. `.reveal[open] { position: fixed }` -- the top layer computes Foundation's `relative` to `absolute`, whose containing block is the initial containing block.
3. `.reveal[open] { inset-inline: 0 }` -- Foundation's medium-and-up `left/right: auto; margin: 0 auto` centres only in-flow boxes. For a positioned box, `auto` means the static position.
4. `.reveal[open] { max-height: calc(100% - 200px) }` -- a tall dialog scrolls itself, so its box must end inside the viewport. 200 px is Foundation's literal `top: 100px` mirrored; no setting exists.
5. `.reveal[open] { color: inherit }` -- the UA stylesheet gives `dialog` `color: CanvasText`.
6. `.reveal::backdrop { background-color: $reveal-overlay-background }` -- Foundation's `reveal-overlay` mixin cannot be included, because it prints `display: none`.
7. `nfs-motion` part: `nfs-fade-in`/`nfs-fade-out` on `.reveal[open]`/`.reveal.is-closing`, `nfs-reveal-backdrop-in/out` on `::backdrop` (named apart, see above), and 1 ms under `prefers-reduced-motion`.

No WCAG rule was needed. Foundation's size classes, `.full`, full screen below medium, `.collapse`, `.without-overlay`, and `html.is-reveal-open`/`.zf-has-scroll` are reused unchanged.

### Triage

| Item | Impact | Confidence | Outcome and evidence |
| --- | --- | --- | --- |
| Port Foundation's scroll lock | HIGH (ADR 0007 consequence; the OffCanvas spec inherits the fact) | HIGH (measured in three engines, both variants) | Decided: port it |
| Invoker from the Trigger (`open(origin)`) | HIGH (Triggers contract) | HIGH (WebKit click-does-not-focus measured) | Decided |
| Directive Tab wrap on every Tab | HIGH (focus contract) | HIGH (follows the APG contract in building-blocks 1.10; tested in three engines) | Decided |
| `animationend` filtered by keyframe name, backdrop keyframes named apart | MEDIUM | HIGH (WebKit `pseudoElement: ''` measured) | Decided |
| Directive removes its host's `autofocus` before `showModal()`; the input keeps Material's `autoFocus` name (ADR 0007) | HIGH (public input name) | HIGH (keeps the ADR vocabulary; the collision and the fix were both measured in three engines) | Decided |
| `closeOnEsc: false` is best effort, documented | MEDIUM (a documented limit, not an API change) | HIGH (measured) | Decided |
| `max-height: calc(100% - 200px)` for tall content | LOW (one CSS value, easy to change) | MEDIUM (prototype value) | Decided with this value |
| Focus fallback when the invoker sits in a dialog that closed | MEDIUM (behaviour, no API) | MEDIUM (not built) | Decided: fall back to the closed dialog's invoker; the spec's browser-level test checks it |
| Close-button target size | LOW | HIGH (passes by the spacing exception in all sizes; axe `target-size` passes) | Decided: no rule; the spec notes that consumers keep other targets at least 12 px from the button's centre |
| `vOffset`/`hOffset` `'auto'` | HIGH (Foundation Options become public inputs; the default placement is a visible contract) | NOT HIGH at this prototype (the top 100 px default was carried without deliberation) | Settled by the [Spec: Reveal](18-spec-reveal.md) and confirmed by the [Prototype: Reveal `'auto'` offsets in CSS](69-prototype-reveal-auto-offsets.md); no longer OPEN FOR HUMAN |
| Screen reader verification | -- | -- | Human-only (assistive technology) |
| Reporting WebKit's empty `pseudoElement` on `::backdrop` `animationend` upstream | -- | -- | Human-only (upstream filing); first confirm it on real Safari |

### OPEN FOR HUMAN

1. **`vOffset`/`hOffset` `'auto'`.** Settled: see the [Spec: Reveal](18-spec-reveal.md), which chose a refined option (a) below: `'auto'` stays CSS-only (custom properties reproducing Foundation's CSS position, no runtime layout measurement) and numeric offsets bind those same custom properties, confirmed within Foundation's own rounding by the [Prototype: Reveal `'auto'` offsets in CSS](69-prototype-reveal-auto-offsets.md), except for a dialog taller than the height cap. Options as recorded when this item was open:
   - (a) Foundation's CSS position: top 100 px and centred. Numeric values become inline `top`/`left` bindings with no measurement. This is the prototype's default.
   - (b) Port Foundation's measured `'auto'`: `(vh - h) / 4`, or `min(100, vh / 10)` when taller than the viewport. This needs a layout read in `afterRenderEffect` after `showModal()` and a `ResizeObserver`, and it is not server-renderable.
   - (c) Drop both Options.

   Confidence is low because (a) was not chosen deliberately, and it changes where every short modal sits compared with Foundation as shipped.
2. **Screen reader check** of the open modal (NVDA or JAWS with Chromium and Firefox, VoiceOver with Safari): role, name, modal containment in browse mode, and focus restore announcements. This needs assistive technology.
3. **Upstream report** of WebKit's `animationend` for `::backdrop` arriving with `pseudoElement: ''` (Chromium and Firefox report `'::backdrop'`). First confirm it on Safari; filing is under the user's identity.

New ticket suggestion for the orchestrator: if the OffCanvas spec wants overlap mode on `<dialog>`, a "Prototype: OffCanvas overlap mode on native `<dialog>`" ticket. It would cover the transform transition under the top layer, `::backdrop` from `$offcanvas-exit-background`, and `contentScroll` with the scroll lock.
